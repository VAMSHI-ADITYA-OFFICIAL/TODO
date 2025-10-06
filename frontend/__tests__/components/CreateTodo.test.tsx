import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import userEvent from "@testing-library/user-event";
import { CreateTodo } from "../../app/components/CreateTodo";

// Mock the dependencies
jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
  },
}));

jest.mock("../../app/todos/actions", () => ({
  createTodos: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
  QueryClient: jest.fn().mockImplementation(() => ({
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useTransition: () => [false, (callback: () => void) => callback()],
}));

describe("CreateTodo", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with all required fields", () => {
    render(<CreateTodo />);

    expect(screen.getByPlaceholderText("Enter title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter description")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("renders the completed switch", () => {
    render(<CreateTodo />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<CreateTodo />);

    const submitButton = screen.getByRole("button", { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Minimum 3 characters")).toBeInTheDocument();
      expect(screen.getByText("Minimum 8 characters")).toBeInTheDocument();
    });
  });

  it("shows validation error for short title", async () => {
    render(<CreateTodo />);

    const titleInput = screen.getByPlaceholderText("Enter title");
    await user.type(titleInput, "ab");

    const submitButton = screen.getByRole("button", { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Minimum 3 characters")).toBeInTheDocument();
    });
  });

  it("shows validation error for short description", async () => {
    render(<CreateTodo />);

    const descriptionInput = screen.getByPlaceholderText("Enter description");
    await user.type(descriptionInput, "short");

    const submitButton = screen.getByRole("button", { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Minimum 8 characters")).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const mockCreateTodos = require("../../app/todos/actions").createTodos;
    const mockToastService =
      require("../../app/services/toastServices").toastService;

    mockCreateTodos.mockResolvedValue({
      status: "success",
      message: "Todo created successfully!",
    });

    render(<CreateTodo />);

    const titleInput = screen.getByPlaceholderText("Enter title");
    const descriptionInput = screen.getByPlaceholderText("Enter description");
    const submitButton = screen.getByRole("button", { name: /create/i });

    await user.type(titleInput, "Test Todo");
    await user.type(descriptionInput, "Test Description");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTodos).toHaveBeenCalledWith({
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      });
    });
  });

  it("handles form submission error", async () => {
    const mockCreateTodos = require("../../app/todos/actions").createTodos;
    const mockToastService =
      require("../../app/services/toastServices").toastService;

    mockCreateTodos.mockRejectedValue(new Error("Network error"));

    render(<CreateTodo />);

    const titleInput = screen.getByPlaceholderText("Enter title");
    const descriptionInput = screen.getByPlaceholderText("Enter description");
    const submitButton = screen.getByRole("button", { name: /create/i });

    await user.type(titleInput, "Test Todo");
    await user.type(descriptionInput, "Test Description");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastService.show).toHaveBeenCalledWith(
        "Network error",
        "error"
      );
    });
  });

  it("handles API error response", async () => {
    const mockCreateTodos = require("../../app/todos/actions").createTodos;
    const mockToastService =
      require("../../app/services/toastServices").toastService;

    mockCreateTodos.mockResolvedValue({
      status: "error",
      message: "Failed to create todo",
    });

    render(<CreateTodo />);

    const titleInput = screen.getByPlaceholderText("Enter title");
    const descriptionInput = screen.getByPlaceholderText("Enter description");
    const submitButton = screen.getByRole("button", { name: /create/i });

    await user.type(titleInput, "Test Todo");
    await user.type(descriptionInput, "Test Description");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastService.show).toHaveBeenCalledWith(
        "Failed to create todo",
        "error"
      );
    });
  });

  it("toggles the completed switch", async () => {
    render(<CreateTodo />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).not.toBeChecked();

    await user.click(switchElement);
    expect(switchElement).toBeChecked();
  });

  it("resets form after successful submission", async () => {
    const mockCreateTodos = require("../../app/todos/actions").createTodos;
    const mockToastService =
      require("../../app/services/toastServices").toastService;

    mockCreateTodos.mockResolvedValue({
      status: "success",
      message: "Todo created successfully!",
    });

    render(<CreateTodo />);

    const titleInput = screen.getByPlaceholderText("Enter title");
    const descriptionInput = screen.getByPlaceholderText("Enter description");
    const submitButton = screen.getByRole("button", { name: /create/i });

    await user.type(titleInput, "Test Todo");
    await user.type(descriptionInput, "Test Description");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTodos).toHaveBeenCalledWith({
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      });
      expect(mockToastService.show).toHaveBeenCalledWith(
        "Todo created successfully!",
        "success"
      );
    });
  });

  it("has correct form structure and styling", () => {
    const { container } = render(<CreateTodo />);

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass(
      "flex flex-col md:w-[90%] w-7/8 md:flex-row m-5 gap-4 justify-center items-start"
    );

    const titleInput = screen.getByPlaceholderText("Enter title");
    const descriptionInput = screen.getByPlaceholderText("Enter description");

    expect(titleInput).toHaveClass(
      "border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
    );
    expect(descriptionInput).toHaveClass(
      "border rounded-xl px-3 py-2 focus:border-blue-400 focus:outline-none transition-shadow duration-300 hover:shadow-lg hover:border-blue-200"
    );
  });
});
