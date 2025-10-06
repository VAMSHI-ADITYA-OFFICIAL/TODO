import { render, screen } from "../utils/test-utils";
import UserDetails from "../../app/components/UserDetails";

// Mock the dependencies
jest.mock("lucide-react", () => ({
  CircleUser: () => <div data-testid="circle-user-icon">CircleUser</div>,
}));

describe("UserDetails", () => {
  const mockUserDetails = {
    name: "Test User",
    email: "test@example.com",
  };

  it("renders user details when provided", () => {
    render(<UserDetails userDetails={mockUserDetails} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
  });

  it("renders nothing when user details are null", () => {
    render(<UserDetails userDetails={null} />);

    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
  });

  it("renders nothing when user details are undefined", () => {
    render(<UserDetails userDetails={undefined} />);

    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    const { container } = render(<UserDetails userDetails={mockUserDetails} />);

    const userDetailsDiv = container.querySelector("div");
    expect(userDetailsDiv).toHaveClass("md:flex");
    expect(userDetailsDiv).toHaveClass("gap-2");
    expect(userDetailsDiv).toHaveClass("hidden");
  });

  it("renders with empty user details", () => {
    render(<UserDetails userDetails={{}} />);

    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
  });

  it("renders with user details that have no name", () => {
    render(<UserDetails userDetails={{ email: "test@example.com" }} />);

    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
    expect(screen.queryByText("Test User")).not.toBeInTheDocument();
  });

  it("renders the CircleUser icon", () => {
    render(<UserDetails userDetails={mockUserDetails} />);

    const icon = screen.getByTestId("circle-user-icon");
    expect(icon).toBeInTheDocument();
  });

  it("has correct container structure", () => {
    const { container } = render(<UserDetails userDetails={mockUserDetails} />);

    const userDetailsContainer = container.firstChild;
    expect(userDetailsContainer).toHaveClass("md:flex gap-2 hidden");
  });
});
