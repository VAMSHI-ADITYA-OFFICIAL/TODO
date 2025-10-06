import { render, screen, waitFor } from "../utils/test-utils";
import SignupPage from "../../app/signup/page";
import userEvent from "@testing-library/user-event";

// Mock external dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
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

jest.mock("next/head", () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <div data-testid="head">{children}</div>;
  };
});

// Mock components
jest.mock("../../app/components/Input", () => {
  return function MockInput({ label, type, error, ...props }: any) {
    return (
      <div className="flex flex-col w-full">
        <label className="mb-1 font-light text-sm" htmlFor={props.name}>
          {label}
        </label>
        <input
          id={props.name}
          type={type}
          className="border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
          {...props}
        />
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  };
});

jest.mock("../../app/components/Button", () => {
  return function MockButton({ children, className, type, ...props }: any) {
    return (
      <button
        type={type}
        className={`cursor-pointer px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 h-11 bg-blue-700 hover:bg-blue-800 text-white ${className || ""}`}
        {...props}
      >
        {children}
      </button>
    );
  };
});

jest.mock("../../app/components/BigLogo", () => {
  return function MockBigLogo() {
    return (
      <div className="flex items-center space-x-2">
        <img
          alt="Todo Logo"
          height="100"
          src="/apple-touch-icon.png"
          width="100"
        />
        <span className="text-2xl sm:text-6xl md:text-9xl font-bold text-blue-600 dark:text-blue-400">
          TODO
        </span>
      </div>
    );
  };
});

jest.mock("../../app/components/InputPassword", () => {
  return function MockInputPassword({ label, name, error, register }: any) {
    return (
      <div className="flex relative">
        <div className="flex flex-col w-full">
          <label className="mb-1 font-light text-sm" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            type="password"
            className="border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
            {...register(name)}
          />
          {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
        </div>
        <button
          aria-label="password toggle"
          type="button"
          className="cursor-pointer px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 absolute top-8 right-2"
        >
          <svg
            aria-hidden="true"
            className="lucide lucide-eye-off"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <path d="m2 2 20 20" />
          </svg>
        </button>
      </div>
    );
  };
});

describe("Signup Page - Improved", () => {
  const user = userEvent.setup();
  const mockSignupUser = require("../../app/signup/actions").signupUser;
  const mockToastService = require("../../app/services/toastServices").toastService;
  const mockRouter = require("next/navigation").useRouter;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders signup form with all required fields", () => {
    render(<SignupPage />);

    expect(screen.getByText("Signup")).toBeInTheDocument();
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

    expect(nameInput).toHaveAttribute("type", "string");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("shows validation errors for empty fields", async () => {
    render(<SignupPage />);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name should be at least 3 characters")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(screen.getAllByText("Password must be at least 8 characters")).toHaveLength(2);
    });
  });

  it("shows validation error for short name", async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "Jo");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name should be at least 3 characters")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "short");
    await user.type(confirmPasswordInput, "short");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("Password must be at least 8 characters")).toHaveLength(2);
    });
  });

  it("shows validation error for password mismatch", async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    mockSignupUser.mockResolvedValue({ result: { message: "User created successfully" } });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(mockToastService.show).toHaveBeenCalledWith("Signup successful!", "success");
    });
  });

  it("handles signup error", async () => {
    mockSignupUser.mockResolvedValue({ error: "Email already exists" });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith("Email already exists", "error");
    });
  });

  it("shows loading state during submission", async () => {
    mockSignupUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders head metadata", () => {
    render(<SignupPage />);

    expect(screen.getByTestId("head")).toBeInTheDocument();
  });

  it("has correct container structure and styling", () => {
    const { container } = render(<SignupPage />);

    const mainContainer = container.querySelector(".flex.w-full.items-center.h-screen.gap-4");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("flex w-full items-center h-screen gap-4 md:flex-row flex-col");

    const logoContainer = container.querySelector(".hidden.md\\:flex.w-1\\/2");
    expect(logoContainer).toBeInTheDocument();

    const formContainer = container.querySelector(".flex.md\\:w-2\\/3.flex-col");
    expect(formContainer).toBeInTheDocument();
  });

  it("renders logo component", () => {
    render(<SignupPage />);

    expect(screen.getByAltText("Todo Logo")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
  });

  it("has correct form styling", () => {
    const { container } = render(<SignupPage />);

    const form = container.querySelector("form");
    expect(form).toHaveClass("flex flex-col gap-4 text-white");

    const formContainer = container.querySelector(".bg-gray-900.p-12.rounded-2xl");
    expect(formContainer).toBeInTheDocument();
    expect(formContainer).toHaveClass("bg-gray-900 p-12 rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 hover:-translate-y-2");
  });

  it("handles form submission with special characters", async () => {
    mockSignupUser.mockResolvedValue({ result: { message: "User created successfully" } });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "José María");
    await user.type(emailInput, "josé@example.com");
    await user.type(passwordInput, "p@ssw0rd!@#$%");
    await user.type(confirmPasswordInput, "p@ssw0rd!@#$%");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledWith({
        name: "José María",
        email: "josé@example.com",
        password: "p@ssw0rd!@#$%",
        confirmPassword: "p@ssw0rd!@#$%",
      });
    });
  });

  it("handles form submission with very long strings", async () => {
    mockSignupUser.mockResolvedValue({ result: { message: "User created successfully" } });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    const longName = "A".repeat(100);
    const longEmail = "verylongemail@example.com";
    const longPassword = "B".repeat(100);

    await user.type(nameInput, longName);
    await user.type(emailInput, longEmail);
    await user.type(passwordInput, longPassword);
    await user.type(confirmPasswordInput, longPassword);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledWith({
        name: longName,
        email: longEmail,
        password: longPassword,
        confirmPassword: longPassword,
      });
    });
  });

  it("clears form after successful submission", async () => {
    mockSignupUser.mockResolvedValue({ result: { message: "User created successfully" } });

    render(<SignupPage />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalled();
      expect(mockToastService.show).toHaveBeenCalledWith("Signup successful!", "success");
    });
  });

  it("handles multiple form submissions", async () => {
    mockSignupUser.mockResolvedValue({ result: { message: "User created successfully" } });

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

    // Clear and try second submission
    await user.clear(nameInput);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);

    await user.type(nameInput, "Jane Doe");
    await user.type(emailInput, "jane@example.com");
    await user.type(passwordInput, "password456");
    await user.type(confirmPasswordInput, "password456");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignupUser).toHaveBeenCalledTimes(2);
    });
  });
});
