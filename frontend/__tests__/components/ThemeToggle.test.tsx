import {
  render,
  screen,
  setupMocks,
  cleanupMocks,
  mockLocalStorage,
  act,
} from "../utils/test-utils";
import ThemeToggle from "../../app/components/ThemeToggle";
import userEvent from "@testing-library/user-event";

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    setupMocks();
    // Reset localStorage mock to return null (no stored theme)
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();

    // Reset document class list
    document.documentElement.classList.toggle.mockClear();

    // Mock system preference to prefer light mode
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false, // System prefers light
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("renders theme toggle button", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows light mode by default", () => {
    render(<ThemeToggle />);

    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it("toggles between light and dark mode", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button");

    // Initially should show light mode
    expect(screen.getByText(/light/i)).toBeInTheDocument();

    // Click to toggle to dark mode
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    // Click again to toggle back to light mode
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it("saves theme preference to localStorage", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button");
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "dark");

    await act(async () => {
      await user.click(toggleButton);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("theme", "light");
  });

  it("loads theme preference from localStorage on mount", () => {
    mockLocalStorage.getItem.mockReturnValue("dark");

    render(<ThemeToggle />);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("theme");
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
  });

  it("uses system preference when no stored theme", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    // Mock system preference to return dark
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<ThemeToggle />);

    expect(screen.getByText(/dark/i)).toBeInTheDocument();
  });

  it("applies dark class to document element when in dark mode", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button");
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      "dark",
      true
    );
  });

  it("removes dark class from document element when in light mode", async () => {
    const user = userEvent.setup();

    // Start in dark mode
    mockLocalStorage.getItem.mockReturnValue("dark");
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button");
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(
      "dark",
      false
    );
  });

  it("shows correct icons for each mode", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Initially should show Light text
    expect(screen.getByText(/light/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole("button");

    // Click to toggle to dark mode
    await act(async () => {
      await user.click(toggleButton);
    });

    // Should show Dark text
    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    // Toggle back to light
    await act(async () => {
      await user.click(toggleButton);
    });
    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it("handles theme toggle with keyboard", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button");
    toggleButton.focus();

    // Initially should show Light
    expect(screen.getByText(/light/i)).toBeInTheDocument();

    // Press Enter to toggle
    await act(async () => {
      await user.keyboard("{Enter}");
    });

    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    // Press Space to toggle again
    await act(async () => {
      await user.keyboard(" ");
    });

    expect(screen.getByText(/light/i)).toBeInTheDocument();
  });

  it("maintains theme state across re-renders", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ThemeToggle />);

    // Initially should show Light
    expect(screen.getByText(/light/i)).toBeInTheDocument();

    const toggleButton = screen.getByRole("button");
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(screen.getByText(/dark/i)).toBeInTheDocument();

    // Re-render component
    rerender(<ThemeToggle />);

    // Should maintain dark mode (stored in localStorage)
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
  });

  it("handles localStorage errors gracefully", () => {
    // Mock localStorage to throw error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });

    // Should not crash
    expect(() => render(<ThemeToggle />)).not.toThrow();
  });

  it("handles document class manipulation errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock document.documentElement.classList.toggle to throw error
    const originalToggle = document.documentElement.classList.toggle;
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    // First render the component normally
    render(<ThemeToggle />);

    // Then mock the toggle to throw error
    document.documentElement.classList.toggle = jest.fn(() => {
      throw new Error("classList error");
    });

    const toggleButton = screen.getByRole("button");

    // Should not crash when toggling
    await act(async () => {
      await user.click(toggleButton);
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to update document class:",
      expect.any(Error)
    );

    // Restore original toggle
    document.documentElement.classList.toggle = originalToggle;
    consoleWarnSpy.mockRestore();
  });
});
