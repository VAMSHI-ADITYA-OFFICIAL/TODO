import { render, screen } from "../utils/test-utils";
import Header from "../../app/components/Header";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  usePathname: () => "/todos",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

jest.mock("../../app/context/authContext", () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}));

jest.mock("../../app/components/ThemeToggle", () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

jest.mock("../../app/components/UserDetails", () => {
  return function MockUserDetails({ userDetails }: { userDetails: any }) {
    return <div data-testid="user-details">User: {userDetails?.name}</div>;
  };
});

jest.mock("../../app/components/MobileMenu", () => {
  return function MockMobileMenu({ userDetails }: { userDetails: any }) {
    return <div data-testid="mobile-menu">Mobile Menu</div>;
  };
});

jest.mock("../../app/components/Button", () => {
  return function MockButton({ children, onClick, ...props }: any) {
    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the header with logo and title", () => {
    render(<Header />);

    expect(screen.getByAltText("Todo Logo")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
  });

  it("renders user details when on todos page", () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ name: "Test User" })
    );

    render(<Header />);

    expect(screen.getByTestId("user-details")).toBeInTheDocument();
    expect(screen.getByText("User: Test User")).toBeInTheDocument();
  });

  it("renders theme toggle", () => {
    render(<Header />);

    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("renders logout button on todos page", () => {
    render(<Header />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("renders mobile menu", () => {
    render(<Header />);

    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });

  it("has correct header structure", () => {
    const { container } = render(<Header />);

    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("flex justify-between");
  });

  it("has correct logo structure", () => {
    render(<Header />);

    const logoImage = screen.getByAltText("Todo Logo");
    expect(logoImage).toHaveAttribute("src", "/apple-touch-icon.png");
    expect(logoImage).toHaveAttribute("width", "100");
    expect(logoImage).toHaveAttribute("height", "100");
  });

  it("has correct title styling", () => {
    render(<Header />);

    const title = screen.getByText("TODO");
    expect(title).toHaveClass(
      "text-2xl font-bold text-blue-600 dark:text-blue-400"
    );
  });

  it("handles missing user details gracefully", () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(<Header />);

    expect(screen.getByTestId("user-details")).toBeInTheDocument();
    expect(screen.getByText("User:")).toBeInTheDocument();
  });

  it("handles invalid JSON in localStorage", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    render(<Header />);

    expect(screen.getByTestId("user-details")).toBeInTheDocument();
    expect(screen.getByText("User:")).toBeInTheDocument();
  });
});

