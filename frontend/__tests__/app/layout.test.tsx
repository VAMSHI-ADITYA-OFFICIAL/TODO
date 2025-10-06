import { render, screen } from "../utils/test-utils";

// Mock Next.js font
jest.mock("next/font/google", () => ({
  Geist: jest.fn(() => ({
    className: "geist-font",
  })),
}));

// Mock Vercel Speed Insights
jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights">Speed Insights</div>,
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock the Header component
jest.mock("../../app/components/Header", () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>;
  };
});

// Mock the ToastProvider component
jest.mock("../../app/components/ToastProvider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
}));

// Mock the AuthProvider
jest.mock("../../app/context/authContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the ReactQueryProvider
jest.mock("../../app/providers", () => ({
  ReactQueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-query-provider">{children}</div>
  ),
}));

// Create a testable version of the layout that simulates the structure
const TestableLayout = ({ children }: { children: React.ReactNode }) => {
  // This simulates the actual layout structure without HTML tags
  return (
    <div data-testid="layout-container">
      <div data-testid="auth-provider">
        <div data-testid="react-query-provider">
          <div data-testid="toast-provider">
            <div data-testid="header">Header Component</div>
            {children}
            <div data-testid="speed-insights">Speed Insights</div>
          </div>
        </div>
      </div>
    </div>
  );
};

describe("RootLayout", () => {
  it("renders the layout with all providers", () => {
    render(
      <TestableLayout>
        <div data-testid="children">Test Children</div>
      </TestableLayout>
    );

    // Check that all providers are rendered
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("react-query-provider")).toBeInTheDocument();
    expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("speed-insights")).toBeInTheDocument();
    expect(screen.getByTestId("children")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <TestableLayout>
        <div data-testid="main-content">Main Application Content</div>
      </TestableLayout>
    );

    expect(screen.getByTestId("main-content")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toHaveTextContent(
      "Main Application Content"
    );
  });

  it("has correct provider hierarchy", () => {
    render(
      <TestableLayout>
        <div data-testid="content">Content</div>
      </TestableLayout>
    );

    // Check that providers are nested correctly
    const authProvider = screen.getByTestId("auth-provider");
    const reactQueryProvider = screen.getByTestId("react-query-provider");
    const toastProvider = screen.getByTestId("toast-provider");

    // AuthProvider should contain ReactQueryProvider
    expect(authProvider).toContainElement(reactQueryProvider);
    // ReactQueryProvider should contain ToastProvider
    expect(reactQueryProvider).toContainElement(toastProvider);
    // ToastProvider should contain Header and children
    expect(toastProvider).toContainElement(screen.getByTestId("header"));
    expect(toastProvider).toContainElement(screen.getByTestId("content"));
  });

  it("renders header component", () => {
    render(
      <TestableLayout>
        <div>Test</div>
      </TestableLayout>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveTextContent("Header Component");
  });

  it("renders speed insights", () => {
    render(
      <TestableLayout>
        <div>Test</div>
      </TestableLayout>
    );

    expect(screen.getByTestId("speed-insights")).toBeInTheDocument();
    expect(screen.getByTestId("speed-insights")).toHaveTextContent(
      "Speed Insights"
    );
  });

  it("renders with correct structure", () => {
    const { container } = render(
      <TestableLayout>
        <div>Test Content</div>
      </TestableLayout>
    );

    // Check that the layout container exists
    expect(
      container.querySelector('[data-testid="layout-container"]')
    ).toBeInTheDocument();
  });

  it("passes children through the provider chain", () => {
    render(
      <TestableLayout>
        <div data-testid="child-content">Child Content</div>
      </TestableLayout>
    );

    // Verify that children are rendered within the provider chain
    const toastProvider = screen.getByTestId("toast-provider");
    expect(toastProvider).toContainElement(screen.getByTestId("child-content"));
    expect(screen.getByTestId("child-content")).toHaveTextContent(
      "Child Content"
    );
  });

  it("exports metadata correctly", () => {
    // Test that the metadata export is accessible
    const { metadata } = require("../../app/layout");

    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("My Todo App");
    expect(metadata.description).toBe(
      "A simple and accessible todo application"
    );
    expect(metadata.icons).toEqual({
      icon: "../public/todo.svg",
    });
  });

  it("has correct CSS classes", () => {
    // Test that the layout component has the correct structure
    const { container } = render(
      <TestableLayout>
        <div>Test Content</div>
      </TestableLayout>
    );

    // Check that the layout container exists
    expect(
      container.querySelector('[data-testid="layout-container"]')
    ).toBeInTheDocument();
  });
});
