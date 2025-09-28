import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../app/context/authContext";
import { ToastProvider } from "../../app/components/ToastProvider";

// Mock toast service
jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    show: jest.fn(),
    register: jest.fn(),
  },
}));

// Mock user data
export const mockUser = {
  name: "Test User",
  id: "123",
  role: "user",
};

// Mock todo data
export const mockTodo = {
  _id: "1",
  title: "Test Todo",
  description: "Test Description",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

// Mock todos array
export const mockTodos = [
  mockTodo,
  {
    _id: "2",
    title: "Completed Todo",
    description: "Completed Description",
    completed: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Extend the render function to include wrapper option
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions & {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  }
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock API responses
export const mockApiResponses = {
  login: {
    success: {
      status: "success",
      message: "Login successful",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: mockUser,
    },
    error: {
      status: "error",
      message: "Invalid credentials",
    },
  },
  todos: {
    success: {
      status: "success",
      data: mockTodos,
      count: mockTodos.length,
      completedCount: 1,
    },
    error: {
      status: "error",
      message: "Failed to fetch todos",
    },
  },
  createTodo: {
    success: {
      status: "success",
      message: "Todo created successfully",
      data: mockTodo,
    },
    error: {
      status: "error",
      message: "Failed to create todo",
    },
  },
  updateTodo: {
    success: {
      status: "success",
      message: "Todo updated successfully",
      data: { ...mockTodo, completed: true },
    },
    error: {
      status: "error",
      message: "Failed to update todo",
    },
  },
  deleteTodo: {
    success: {
      status: "success",
      message: "Todo deleted successfully",
    },
    error: {
      status: "error",
      message: "Failed to delete todo",
    },
  },
};

// Mock localStorage - properly export it
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock fetch
export const mockFetch = jest.fn();

// Setup mocks before each test
export const setupMocks = () => {
  global.fetch = mockFetch;

  // Setup localStorage mock globally
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock window.location - avoid JSDOM navigation errors
  // Skip location mocking for components that don't need it

  // Mock document.cookie
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "",
  });

  // Mock document.documentElement.classList
  const mockClassList = {
    add: jest.fn(),
    remove: jest.fn(),
    toggle: jest.fn(),
    contains: jest.fn(),
    value: "",
  };

  Object.defineProperty(document.documentElement, "classList", {
    writable: true,
    value: mockClassList,
  });
};

// Clean up mocks after each test
export const cleanupMocks = () => {
  jest.clearAllMocks();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  mockFetch.mockClear();
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Add a simple test to prevent "Your test suite must contain at least one test" error
describe("Test Utils", () => {
  it("should export custom render function", () => {
    expect(typeof customRender).toBe("function");
  });
});
