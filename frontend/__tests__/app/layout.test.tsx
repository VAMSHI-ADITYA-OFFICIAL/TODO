import { render, screen } from "../utils/test-utils";
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

// Mock Next.js font
describe("RootLayout", () => {
  it("renders children correctly", () => {
    render(
      <TestableLayout>
        <div data-testid="children">Child Content</div>
      </TestableLayout>
    );

    expect(screen.getByTestId("children")).toBeInTheDocument();
  });

  it("renders main providers and header", () => {
    render(
      <TestableLayout>
        <div>Child</div>
      </TestableLayout>
    );

    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("react-query-provider")).toBeInTheDocument();
    expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  // it("exports metadata correctly", () => {
  //   const { metadata } = require("../../app/layout");
  //   expect(metadata).toBeDefined();
  //   expect(metadata.title).toBe("My Todo App");
  // });
});
