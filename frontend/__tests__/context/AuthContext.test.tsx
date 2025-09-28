import {
  render,
  screen,
  setupMocks,
  cleanupMocks,
  mockUser,
  mockLocalStorage,
} from "../utils/test-utils";
import { AuthProvider, useAuth } from "../../app/context/authContext";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the server action for logoutUser
jest.mock("../../app/login/actions", () => ({
  logoutUser: jest.fn(() => Promise.resolve({ success: true })),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { userDetails, setUserDetails, logout } = useAuth();

  return (
    <div>
      <div data-testid="user-details">
        {userDetails ? userDetails.name : "No user"}
      </div>
      <button onClick={() => setUserDetails(mockUser)}>Set User</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("provides initial null user details", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user-details")).toHaveTextContent("No user");
  });

  it("allows setting user details", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const setUserButton = screen.getByText("Set User");
    await user.click(setUserButton);

    expect(screen.getByTestId("user-details")).toHaveTextContent(mockUser.name);
  });

  it("handles logout functionality", async () => {
    const user = userEvent.setup();
    const { logoutUser } = require("../../app/login/actions");

    // Mock window.location.href to avoid JSDOM navigation errors
    const mockLocation = { href: "" };
    delete (window as any).location;
    (window as any).location = mockLocation;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Set user first
    const setUserButton = screen.getByText("Set User");
    await user.click(setUserButton);

    // Then logout
    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    // Wait for the logout to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check that localStorage was cleared - at least one item should be removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userInfo");

    // Check that cookies were cleared (at least one should be cleared)
    const cookieString = document.cookie;
    expect(cookieString).toContain(
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    );

    // Check that server action was called
    expect(logoutUser).toHaveBeenCalledTimes(1);

    // Check that logout was attempted (the redirect might fail in test environment)
    // The important thing is that the logout function was called and some cleanup happened
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it("throws error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");

    consoleSpy.mockRestore();
  });

  it("maintains user details state across re-renders", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Set user
    const setUserButton = screen.getByText("Set User");
    await user.click(setUserButton);

    expect(screen.getByTestId("user-details")).toHaveTextContent(mockUser.name);

    // Re-render component
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // User should still be there
    expect(screen.getByTestId("user-details")).toHaveTextContent(mockUser.name);
  });

  it("handles logout with error gracefully", async () => {
    const user = userEvent.setup();

    // Mock console.error to avoid noise in test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock window.location.href to throw error
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = {
      get href() {
        throw new Error("Location error");
      },
      set href(value) {
        /* mock setter */
      },
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    // Should still clear localStorage and cookies
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();

    consoleSpy.mockRestore();

    // Restore original location
    (window as any).location = originalLocation;
  });
});
