import { render, screen } from "../utils/test-utils";
import TodoCardSkeleton from "../../app/components/TodoCardSkeleton";

describe("TodoCardSkeleton", () => {
  it("renders TodoCardSkeleton", () => {
    render(<TodoCardSkeleton />);
    const container = screen.getByTestId("todo-card-skeleton");
    expect(container).toBeInTheDocument();
  });
});
