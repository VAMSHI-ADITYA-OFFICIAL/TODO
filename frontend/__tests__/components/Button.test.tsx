import { render, screen } from "../utils/test-utils";
import Button from "../../app/components/Button";
import userEvent from "@testing-library/user-event";

describe("Button Component", () => {
  it("renders button with children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole("button", { name: /primary button/i });
    expect(button).toHaveClass("bg-blue-700");
  });

  it("applies secondary variant", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole("button", { name: /secondary button/i });
    expect(button).toHaveClass("bg-gray-500");
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByRole("button", { name: /danger button/i });
    expect(button).toHaveClass("bg-red-500");
  });

  it("applies plane variant", () => {
    render(<Button variant="plane">Plane Button</Button>);
    const button = screen.getByRole("button", { name: /plane button/i });
    expect(button).not.toHaveClass("bg-blue-700");
  });

  it("applies fullWidth class when fullWidth is true", () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole("button", { name: /full width button/i });
    expect(button).toHaveClass("w-full");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole("button", { name: /custom button/i });
    expect(button).toHaveClass("custom-class");
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByRole("button", { name: /clickable button/i });

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it("forwards ref correctly", () => {
    const ref = jest.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("accepts additional props", () => {
    render(
      <Button data-testid="test-button" aria-label="Test Button">
        Test
      </Button>
    );
    const button = screen.getByTestId("test-button");
    expect(button).toHaveAttribute("aria-label", "Test Button");
  });
});
