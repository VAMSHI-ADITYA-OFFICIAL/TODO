import { render, screen, waitFor } from "../utils/test-utils";
import SignupPage from "../../app/signup/page";
import userEvent from "@testing-library/user-event";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
  },
}));

jest.mock("../../app/signup/actions", () => ({
  signupUser: jest.fn(),
}));

describe("Signup Page", () => {
  const user = userEvent.setup();
  const mockSignupUser = require("../../app/signup/actions").signupUser;
  it("renders signup form with all required fields", () => {
    render(<SignupPage />);

    expect(screen.getByText(/Signup/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders login link", () => {
    render(<SignupPage />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders password toggle buttons", () => {
    render(<SignupPage />);

    const toggleButtons = screen.getAllByRole("button", {
      name: /password toggle/i,
    });
    expect(toggleButtons).toHaveLength(2); // One for password, one for confirm password
  });

  it("has correct form structure", () => {
    const { container } = render(<SignupPage />);

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(nameInput).toHaveAttribute("type", "text");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("has cform submition pending state", async () => {
    mockSignupUser.mockResolvedValue({
      result: { message: "User created successfully" },
    });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // First submission
    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledTimes(1);
    });
  });
});
