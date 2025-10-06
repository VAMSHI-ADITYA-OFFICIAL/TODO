import { render, screen } from "../utils/test-utils";
import LoginPage from "../../app/login/page";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("../../app/context/authContext", () => ({
  useAuth: () => ({
    setUserDetails: jest.fn(),
  }),
}));

jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
  },
}));

jest.mock("../../app/login/actions", () => ({
  loginUser: jest.fn(),
}));

describe("Login Page", () => {
  it("renders login form with all required fields", () => {
    render(<LoginPage />);

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders signup link", () => {
    render(<LoginPage />);

    const signupLink = screen.getByRole("link", { name: /signup/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("renders password toggle button", () => {
    render(<LoginPage />);

    const toggleButton = screen.getByRole("button", {
      name: /password toggle/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it("has correct form structure", () => {
    render(<LoginPage />);

    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password$/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
