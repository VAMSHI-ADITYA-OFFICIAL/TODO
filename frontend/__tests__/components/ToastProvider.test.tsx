import { render, screen, waitFor } from "../utils/test-utils";
import { ToastProvider } from "../../app/components/ToastProvider";

// Mock the dependencies
jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    register: jest.fn(),
  },
}));

describe("ToastProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child Content</div>
      </ToastProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders toast container", () => {
    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    const toastContainer = screen.getByRole("generic");
    expect(toastContainer).toHaveClass(
      "fixed bottom-4 right-4 flex flex-col gap-2"
    );
  });

  it("registers toast service on mount", () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    expect(mockToastService.register).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it("renders toasts when they are added", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    // Simulate adding a toast
    showToast!("Test message", "success");

    await waitFor(() => {
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });
  });

  it("renders success toast with correct styling", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    showToast!("Success message", "success");

    await waitFor(() => {
      const toast = screen.getByText("Success message");
      expect(toast).toHaveClass("p-2 rounded text-white bg-green-500");
    });
  });

  it("renders error toast with correct styling", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    showToast!("Error message", "error");

    await waitFor(() => {
      const toast = screen.getByText("Error message");
      expect(toast).toHaveClass("p-2 rounded text-white bg-red-500");
    });
  });

  it("renders info toast with correct styling", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    showToast!("Info message", "info");

    await waitFor(() => {
      const toast = screen.getByText("Info message");
      expect(toast).toHaveClass("p-2 rounded text-white bg-blue-500");
    });
  });

  it("removes toasts after timeout", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    showToast!("Temporary message", "info");

    await waitFor(() => {
      expect(screen.getByText("Temporary message")).toBeInTheDocument();
    });

    // Wait for the toast to be removed (3 seconds timeout)
    await waitFor(
      () => {
        expect(screen.queryByText("Temporary message")).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it("renders multiple toasts", async () => {
    const mockToastService =
      require("../../app/services/toastServices").toastService;
    let showToast: (message: string, type: string) => void;

    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });

    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    showToast!("First message", "success");
    showToast!("Second message", "error");

    await waitFor(() => {
      expect(screen.getByText("First message")).toBeInTheDocument();
      expect(screen.getByText("Second message")).toBeInTheDocument();
    });
  });

  it("has correct toast container structure", () => {
    const { container } = render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    const toastContainer = container.querySelector(".fixed.bottom-4.right-4");
    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer).toHaveClass("flex flex-col gap-2");
  });
});

