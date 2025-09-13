type ToastType = "success" | "error" | "info";

let showToastCallback: ((message: string, type?: ToastType) => void) | null =
  null;

export const toastService = {
  // Register callback from React provider
  register: (callback: (message: string, type?: ToastType) => void) => {
    showToastCallback = callback;
  },

  // Show toast from anywhere
  show: (message: string, type: ToastType = "info") => {
    if (!showToastCallback) {
      console.warn("ToastService not registered yet");
      return;
    }
    showToastCallback(message, type);
  },
};
