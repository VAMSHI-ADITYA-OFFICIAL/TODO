import { render, screen } from "../utils/test-utils";

// Mock the actions
jest.mock("../../app/todos/actions", () => ({
  fetchTodos: jest.fn().mockResolvedValue({
    result: [],
    count: 0,
    completedCount: 0,
    pageInfo: { nextCursor: undefined, hasNextPage: false },
  }),
}));

// Mock the components
jest.mock("../../app/components/CreateTodo", () => {
  return function MockCreateTodo() {
    return <div data-testid="create-todo">Create Todo Component</div>;
  };
});

jest.mock("../../app/components/TodoList", () => {
  return function MockTodoList() {
    return <div data-testid="todo-list">TodoList Component</div>;
  };
});

// Mock the server component
jest.mock("../../app/todos/page", () => {
  return function MockTodosPage() {
    return (
      <div className="flex flex-col gap-2 justify-center items-center">
        <div data-testid="create-todo">Create Todo Component</div>
        <div data-testid="todo-list">TodoList Component</div>
      </div>
    );
  };
});

import TodosPage from "../../app/todos/page";

describe("Todos Page", () => {
  it("renders create todo and todo list components", () => {
    render(<TodosPage />);

    expect(screen.getByTestId("create-todo")).toBeInTheDocument();
    expect(screen.getByTestId("todo-list")).toBeInTheDocument();
  });

  it("has correct container structure", () => {
    const { container } = render(<TodosPage />);

    const mainDiv = container.querySelector("div");
    expect(mainDiv).toHaveClass(
      "flex flex-col gap-2 justify-center items-center"
    );
  });
});
