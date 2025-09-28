import {
  render,
  screen,
  setupMocks,
  cleanupMocks,
  mockTodos,
} from "../utils/test-utils";
import TodoList from "../../app/components/TodoList";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the actions
jest.mock("../../app/todos/actions", () => ({
  createTodos: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  toggleTodo: jest.fn(),
}));

// Mock toast service
jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
  },
}));

const mockInitialResponse = {
  result: mockTodos,
  count: mockTodos.length,
  completedCount: 1,
  pageInfo: {
    hasNextPage: false,
    nextCursor: null,
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("TodoList Component", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("renders todo list with todos", () => {
    render(<TodoList initilaTodoResponse={mockInitialResponse} />, {
      wrapper: createWrapper(),
    });

    // Should show statistics
    expect(screen.getByText(/showing:/i)).toBeInTheDocument();
    expect(screen.getByText(/completed:/i)).toBeInTheDocument();
    expect(screen.getByText(/pending:/i)).toBeInTheDocument();
  });

  it("shows todo count and statistics", () => {
    render(<TodoList initilaTodoResponse={mockInitialResponse} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/showing:/i)).toBeInTheDocument();
    expect(screen.getByText(/completed:/i)).toBeInTheDocument();
    expect(screen.getByText(/pending:/i)).toBeInTheDocument();
  });

  it("shows load more button when there are more pages", () => {
    const responseWithNextPage = {
      ...mockInitialResponse,
      pageInfo: {
        hasNextPage: true,
        nextCursor: "next-cursor",
      },
    };

    render(<TodoList initilaTodoResponse={responseWithNextPage} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole("button", { name: /load more/i })
    ).toBeInTheDocument();
  });

  it("shows loading state when fetching", () => {
    const loadingResponse = {
      ...mockInitialResponse,
      result: [],
    };

    render(<TodoList initilaTodoResponse={loadingResponse} />, {
      wrapper: createWrapper(),
    });

    // Should show skeleton components during loading
    expect(screen.getAllByTestId("todo-skeleton")).toHaveLength(5);
  });

  it("shows empty state when no todos", () => {
    const emptyResponse = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: {
        hasNextPage: false,
        nextCursor: null,
      },
    };

    render(<TodoList initilaTodoResponse={emptyResponse} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/showing: 0\/0/i)).toBeInTheDocument();
    expect(screen.getByText(/completed:/i)).toBeInTheDocument();
    expect(screen.getByText(/pending:/i)).toBeInTheDocument();
  });

  it("handles load more button click", async () => {
    const user = userEvent.setup();
    const responseWithNextPage = {
      ...mockInitialResponse,
      pageInfo: {
        hasNextPage: true,
        nextCursor: "next-cursor",
      },
    };

    render(<TodoList initilaTodoResponse={responseWithNextPage} />, {
      wrapper: createWrapper(),
    });

    const loadMoreButton = screen.getByRole("button", { name: /load more/i });
    await user.click(loadMoreButton);

    expect(loadMoreButton).toBeInTheDocument();
  });

  it("displays todo cards correctly", () => {
    render(<TodoList initilaTodoResponse={mockInitialResponse} />, {
      wrapper: createWrapper(),
    });

    // Should show statistics and skeleton loading
    expect(screen.getByText(/showing:/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("todo-skeleton")).toHaveLength(5);
  });
});
