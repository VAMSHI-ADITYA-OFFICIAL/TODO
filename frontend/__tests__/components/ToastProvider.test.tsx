import { render, screen, act, waitFor } from "../utils/test-utils";
import { ToastProvider } from "../../app/components/ToastProvider";

jest.mock("../../app/services/toastServices", () => ({
  toastService: {
    register: jest.fn(),
  },
}));

describe("ToastProvider", () => {
  let showToast: (message: string, type: "success" | "error" | "info") => void;
  const mockToastService =
    require("../../app/services/toastServices").toastService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Register showToast callback
    mockToastService.register.mockImplementation((callback: any) => {
      showToast = callback;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders success toast correctly", async () => {
    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    act(() => showToast!("Success message", "success"));

    await waitFor(() => {
      const toast = screen.getByText("Success message");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveClass("bg-green-500");
    });
  });

  it("renders error toast correctly", async () => {
    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    act(() => showToast!("Error message", "error"));

    await waitFor(() => {
      const toast = screen.getByText("Error message");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveClass("bg-red-500");
    });
  });

  it("renders info toast correctly", async () => {
    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    act(() => showToast!("Info message", "info"));

    await waitFor(() => {
      const toast = screen.getByText("Info message");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveClass("bg-blue-500");
    });
  });

  it("removes toast after 3 seconds", async () => {
    render(
      <ToastProvider>
        <div>Child Content</div>
      </ToastProvider>
    );

    act(() => showToast!("Temporary toast", "info"));

    // Toast should appear immediately
    await waitFor(() => {
      expect(screen.getByText("Temporary toast")).toBeInTheDocument();
    });

    // Fast-forward timers
    act(() => jest.advanceTimersByTime(3000));

    await waitFor(() => {
      expect(screen.queryByText("Temporary toast")).not.toBeInTheDocument();
    });
  });
});
