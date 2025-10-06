import { render, screen } from "../utils/test-utils";
import userEvent from "@testing-library/user-event";
import MobileMenu from "../../app/components/MobileMenu";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  usePathname: () => "/todos",
}));

// jest.mock("../../app/context/authContext", () => ({
//   useAuth: () => ({
//     logout: jest.fn(),
//   }),
// }));

// jest.mock("../../app/components/ThemeToggle", () => {
//   return function MockThemeToggle() {
//     return <div data-testid="theme-toggle">Theme Toggle</div>;
//   };
// });

// jest.mock("../../app/components/Button", () => {
//   return function MockButton({ children, onClick, ...props }: any) {
//     return (
//       <button onClick={onClick} {...props}>
//         {children}
//       </button>
//     );
//   };
// });

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover">{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

describe("MobileMenu", () => {
  const user = userEvent.setup();

  const mockUserDetails = {
    name: "Test User",
    email: "test@example.com",
    id: "hajkait9i",
    role: "user",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the mobile menu trigger", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });

  it("renders the popover structure", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    expect(screen.getByTestId("popover")).toBeInTheDocument();
    expect(screen.getByTestId("popover-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("popover-content")).toBeInTheDocument();
  });

  it("shows user details when on todos page", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("shows logout button when on todos page", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("has correct menu button styling", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    const menuButton = screen.getByRole("button", { name: /menu/i });
    expect(menuButton).toHaveClass(
      "md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md shadow-sm"
    );
  });

  it("handles null user details", () => {
    render(<MobileMenu userDetails={null} />);

    expect(screen.getByTestId("popover")).toBeInTheDocument();
  });

  it("renders user section when user details are provided", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    const userSection = screen.getByText("Test User");
    expect(userSection).toBeInTheDocument();
    expect(userSection).toHaveClass(
      "text-sm font-medium text-gray-700 dark:text-gray-300"
    );
  });

  it("renders theme section", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    const themeLabel = screen.getByText("Theme");
    expect(themeLabel).toBeInTheDocument();
    expect(themeLabel).toHaveClass(
      "text-sm font-medium text-gray-700 dark:text-gray-300"
    );
  });

  it("renders logout section when on todos page", () => {
    render(<MobileMenu userDetails={mockUserDetails} />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toHaveClass(
      "w-full flex items-center justify-center gap-2 px-4 py-2 text-white hover:bg-red-600 transition-colors duration-200 rounded-md"
    );
  });
});
