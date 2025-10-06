import { render, screen } from "../utils/test-utils";
import TodoCardSkeleton from "../../app/components/TodoCardSkeleton";

describe("TodoCardSkeleton", () => {
  it("renders the skeleton component", () => {
    render(<TodoCardSkeleton />);

    const skeleton = screen.getByRole("generic");
    expect(skeleton).toBeInTheDocument();
  });

  it("has correct main container styling", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    expect(container).toHaveClass(
      "flex justify-between items-center border rounded-lg p-4 shadow-sm animate-pulse bg-white dark:bg-gray-800 w-full mb-4"
    );
  });

  it("renders title placeholder", () => {
    render(<TodoCardSkeleton />);

    const titlePlaceholder = screen.getByRole("generic");
    const titleDiv = titlePlaceholder.querySelector(".h-5.bg-gray-300");
    expect(titleDiv).toBeInTheDocument();
    expect(titleDiv).toHaveClass(
      "h-5 bg-gray-300 dark:bg-gray-700 rounded w-32"
    );
  });

  it("renders date placeholder", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const dateDiv = container.querySelector(".h-4.bg-gray-300");
    expect(dateDiv).toBeInTheDocument();
    expect(dateDiv).toHaveClass(
      "h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 opacity-70"
    );
  });

  it("renders description placeholder", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const descriptionDiv = container.querySelector(
      ".h-4.bg-gray-300.rounded.w-full"
    );
    expect(descriptionDiv).toBeInTheDocument();
    expect(descriptionDiv).toHaveClass(
      "h-4 bg-gray-300 dark:bg-gray-700 rounded w-full max-w-md"
    );
  });

  it("renders mobile action buttons", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const mobileButtons = container.querySelector(
      ".md\\:hidden.flex.ml-auto.gap-2"
    );
    expect(mobileButtons).toBeInTheDocument();
    expect(mobileButtons).toHaveClass("md:hidden flex ml-auto gap-2");
  });

  it("renders desktop action buttons", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const desktopButtons = container.querySelector(".hidden.md\\:flex.gap-1");
    expect(desktopButtons).toBeInTheDocument();
    expect(desktopButtons).toHaveClass("hidden md:flex gap-1");
  });

  it("renders action button placeholders", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const actionButtons = container.querySelectorAll(".h-6.w-6.bg-gray-300");
    expect(actionButtons).toHaveLength(3); // 1 mobile + 2 desktop
  });

  it("has correct left content structure", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const leftContent = container.querySelector(".flex.flex-col.gap-2.w-full");
    expect(leftContent).toBeInTheDocument();
    expect(leftContent).toHaveClass("flex flex-col gap-2 w-full");
  });

  it("has correct title and date structure", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    const titleDateContainer = container.querySelector(
      ".flex.gap-4.items-center"
    );
    expect(titleDateContainer).toBeInTheDocument();
    expect(titleDateContainer).toHaveClass("flex gap-4 items-center");
  });

  it("has correct skeleton animation", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    expect(container).toHaveClass("animate-pulse");
  });

  it("has correct responsive classes", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");

    // Check mobile buttons
    const mobileButtons = container.querySelector(".md\\:hidden");
    expect(mobileButtons).toBeInTheDocument();

    // Check desktop buttons
    const desktopButtons = container.querySelector(".hidden.md\\:flex");
    expect(desktopButtons).toBeInTheDocument();
  });

  it("has correct dark mode classes", () => {
    render(<TodoCardSkeleton />);

    const container = screen.getByRole("generic");
    expect(container).toHaveClass("bg-white dark:bg-gray-800");

    const placeholders = container.querySelectorAll(
      ".bg-gray-300.dark\\:bg-gray-700"
    );
    expect(placeholders.length).toBeGreaterThan(0);
  });
});

