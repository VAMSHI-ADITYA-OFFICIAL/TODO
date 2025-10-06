import {
  renderWithProviders as render,
  screen,
  mockTodo,
} from "../utils/test-utils";
import TodoCard from "../../app/components/TodoCard";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock actions
jest.mock("../../app/todos/actions", () => ({
  deleteTodo: jest.fn(),
  toggleTodo: jest.fn(),
  updateTodo: jest.fn(),
}));

// Mock toast service
jest.mock("../../app/services/toastServices", () => ({
  toastService: { show: jest.fn() },
}));

// Wrapper for QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("TodoCard Component", () => {
  it("renders todo information", () => {
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });
    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.getByText(mockTodo.description)).toBeInTheDocument();
  });

  it("shows completed todo with strikethrough", () => {
    render(<TodoCard todo={{ ...mockTodo, completed: true }} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(mockTodo.title)).toHaveClass("line-through");
  });

  it("enters edit mode and saves changes", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    await user.click(screen.getByLabelText(/update todo/i));
    const titleInput = screen.getByDisplayValue(mockTodo.title);
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByDisplayValue("Updated Title")).toBeInTheDocument();
  });

  it("cancels edit mode", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    await user.click(screen.getByLabelText(/update todo/i));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText(mockTodo.title)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(mockTodo.title)).not.toBeInTheDocument();
  });

  it("toggles completion status", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    const toggleButton = screen.getByLabelText(/mark todo as complete/i);
    await user.click(toggleButton);

    expect(toggleButton).toBeInTheDocument();
  });

  it("handles delete confirmation", async () => {
    const user = userEvent.setup();
    render(<TodoCard todo={mockTodo} />, { wrapper: createWrapper() });

    await user.click(screen.getByLabelText(/delete todo/i));
    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();

    await user.click(screen.getByText(/cancel/i));
    expect(
      screen.queryByText(/are you absolutely sure/i)
    ).not.toBeInTheDocument();
  });
});
