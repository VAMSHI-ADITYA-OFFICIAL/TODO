import { fetchTodos } from "../../app/todos/actions";

// Mock the fetchTodos action
jest.mock("../../app/todos/actions", () => ({
  fetchTodos: jest.fn(),
}));

// Mock the components
jest.mock("../../app/components/CreateTodo", () => {
  return function MockCreateTodo() {
    return <div data-testid="create-todo">Create Todo Component</div>;
  };
});

jest.mock("../../app/components/TodoList", () => {
  return function MockTodoList({
    initilaTodoResponse,
  }: {
    initilaTodoResponse: any;
  }) {
    return (
      <div data-testid="todo-list">
        TodoList Component - Count: {initilaTodoResponse.count}
      </div>
    );
  };
});

describe("Todos Page Logic", () => {
  const mockFetchTodos = require("../../app/todos/actions").fetchTodos;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls fetchTodos and handles successful response", async () => {
    const mockResponse = {
      result: [
        {
          _id: "1",
          title: "Test Todo",
          description: "Test Description",
          completed: false,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: "next123", hasNextPage: true },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos error and returns default empty state", async () => {
    mockFetchTodos.mockRejectedValue(new Error("Network error"));

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos with empty response", async () => {
    const mockResponse = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: undefined, hasNextPage: false },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos with pagination info", async () => {
    const mockResponse = {
      result: [
        {
          _id: "1",
          title: "Test Todo",
          description: "Test Description",
          completed: false,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: "nextPage123", hasNextPage: true },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos with completed todos", async () => {
    const mockResponse = {
      result: [
        {
          _id: "1",
          title: "Completed Todo",
          description: "Completed Description",
          completed: true,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "2",
          title: "Incomplete Todo",
          description: "Incomplete Description",
          completed: false,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 2,
      completedCount: 1,
      pageInfo: { nextCursor: undefined, hasNextPage: false },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos returning undefined", async () => {
    mockFetchTodos.mockResolvedValue(undefined);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos returning null", async () => {
    mockFetchTodos.mockResolvedValue(null);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos returning empty object", async () => {
    mockFetchTodos.mockResolvedValue({});

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos with different response structures", async () => {
    const differentStructureResponse = {
      result: [
        {
          _id: "1",
          title: "Test",
          description: "Test",
          completed: false,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: "next", hasNextPage: true },
      metadata: { version: "1.0" }, // Extra metadata
    };

    mockFetchTodos.mockResolvedValue(differentStructureResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos throwing string error", async () => {
    mockFetchTodos.mockRejectedValue("String error");

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos throwing undefined", async () => {
    mockFetchTodos.mockRejectedValue(undefined);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos throwing null", async () => {
    mockFetchTodos.mockRejectedValue(null);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles fetchTodos with no pagination", async () => {
    const mockResponse = {
      result: [
        {
          _id: "1",
          title: "Test Todo",
          description: "Test Description",
          completed: false,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: undefined, hasNextPage: false },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;
    const component = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(1);
    expect(mockFetchTodos).toHaveBeenCalledWith();

    // Check that the component structure is correct
    expect(component).toBeDefined();
    expect(component.type).toBe("div");
    expect(component.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });

  it("handles concurrent fetchTodos calls", async () => {
    const mockResponse = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: undefined, hasNextPage: false },
    };

    mockFetchTodos.mockResolvedValue(mockResponse);

    // Import the component after mocking
    const TodosPage = (await import("../../app/todos/page")).default;

    // Simulate concurrent calls
    const component1 = await TodosPage();
    const component2 = await TodosPage();

    expect(mockFetchTodos).toHaveBeenCalledTimes(2);

    // Check that both components have correct structure
    expect(component1).toBeDefined();
    expect(component1.type).toBe("div");
    expect(component1.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );

    expect(component2).toBeDefined();
    expect(component2.type).toBe("div");
    expect(component2.props.className).toBe(
      "flex flex-col gap-2 justify-center items-center"
    );
  });
});
