import {
  renderWithProviders as render,
  screen,
  setupMocks,
  cleanupMocks,
  mockTodo,
} from "../utils/test-utils";
import TodoCard from "../../app/components/TodoCard";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the actions
jest.mock("../../app/todos/actions", () => ({
  deleteTodo: jest.fn(),
  toggleTodo: jest.fn(),
  updateTodo: jest.fn(),
}));

// Mock the query cache helpers
jest.mock("../../lib/queryCacheHelpers", () => ({
  withOptimisticUpdate: jest.fn(
    (queryClient, optimisticUpdate, apiCall, onSuccess, onError) => {
      return jest.fn().mockImplementation(async () => {
        try {
          optimisticUpdate();
          const result = await apiCall();
          onSuccess(result);
          return result;
        } catch (error) {
          onError(error);
          throw error;
        }
      });
    }
  ),
  updateTodoInCache: jest.fn(),
  removeTodoFromCache: jest.fn(),
  updateCountsInCache: jest.fn(),
}));

// Mock toast service
jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = "TestWrapper";

  return TestWrapper;
};

describe("TodoCard Component", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("renders todo information correctly", () => {
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByText(mockTodo.description)).toBeInTheDocument();
    expect(
      screen.getByText(new Date(mockTodo.createdAt).toDateString())
    ).toBeInTheDocument();
  });

  it("shows completed todo with strikethrough", () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoCard todo={completedTodo} />, { wrapper: createWrapper() });

    const title = screen.getByText(completedTodo.title);
    expect(title).toHaveClass("line-through");
  });

  it("enters edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    const editButton = screen.getByLabelText(/update todo/i);
    await user.click(editButton);

    expect(screen.getByDisplayValue(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockTodo.description)).toBeInTheDocument();
  });

  it("saves changes when save button is clicked in edit mode", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    // Enter edit mode
    const editButton = screen.getByLabelText(/update todo/i);
    await user.click(editButton);

    // Modify the title
    const titleInput = screen.getByDisplayValue(mockTodo.title);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    expect(saveButton).toBeInTheDocument();
  });

  it("cancels edit mode when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    // Enter edit mode
    const editButton = screen.getByLabelText(/update todo/i);
    await user.click(editButton);

    // Cancel edit
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Should be back to view mode
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(mockTodo.title)).not.toBeInTheDocument();
  });

  it("handles keyboard shortcuts in edit mode", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    // Enter edit mode
    const editButton = screen.getByLabelText(/update todo/i);
    await user.click(editButton);

    const titleInput = screen.getByDisplayValue(mockTodo.title);
    await user.click(titleInput);

    // Test Ctrl+Enter (save)
    await user.keyboard("{Control>}{Enter}{/Control}");

    // Test Escape (cancel)
    await user.keyboard("{Escape}");
  });

  it("shows mobile menu on mobile view", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/more options/i)).toBeInTheDocument();
  });

  it("shows desktop action buttons on desktop view", () => {
    // Mock desktop viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/update todo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delete todo/i)).toBeInTheDocument();
  });

  it("toggles todo completion status", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByLabelText(/mark todo as complete/i);
    await user.click(toggleButton);

    expect(toggleButton).toBeInTheDocument();
  });

  it("shows delete confirmation dialog", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    const deleteButton = screen.getByLabelText(/delete todo/i);
    await user.click(deleteButton);

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this action cannot be undone/i)
    ).toBeInTheDocument();
  });

  it("handles delete confirmation", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    // Click delete button
    const deleteButton = screen.getByLabelText(/delete todo/i);
    await user.click(deleteButton);

    // Wait for dialog to appear and confirm deletion
    const confirmButton = await screen.findByText(/continue/i);
    expect(confirmButton).toBeInTheDocument();
  });

  it("cancels delete confirmation", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    // Click delete button
    const deleteButton = screen.getByLabelText(/delete todo/i);
    await user.click(deleteButton);

    // Wait for dialog to appear and cancel deletion
    const cancelButton = await screen.findByText(/cancel/i);
    await user.click(cancelButton);

    // Dialog should be closed
    expect(
      screen.queryByText(/are you absolutely sure/i)
    ).not.toBeInTheDocument();
  });
});
