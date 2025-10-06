// Mock console.warn to avoid noise in test output
const mockConsoleWarn = jest
  .spyOn(console, "warn")
  .mockImplementation(() => {});

describe("ToastService", () => {
  let toastService: typeof import("../../app/services/toastServices").toastService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the internal state by creating a fresh instance
    jest.resetModules();
    // Re-import the service to get a fresh instance using import()
    return import("../../app/services/toastServices").then((module) => {
      toastService = module.toastService;
    });
  });

  afterEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe("register", () => {
    it("should register a callback function", () => {
      const mockCallback = jest.fn();

      toastService.register(mockCallback);

      // Verify the callback is registered by calling show
      toastService.show("Test message", "info");
      expect(mockCallback).toHaveBeenCalledWith("Test message", "info");
    });

    it("should register a callback function with default type", () => {
      const mockCallback = jest.fn();

      toastService.register(mockCallback);

      // Call show without type parameter
      toastService.show("Test message");
      expect(mockCallback).toHaveBeenCalledWith("Test message", "info");
    });

    it("should overwrite previous callback when registering new one", () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      toastService.register(firstCallback);
      toastService.register(secondCallback);

      toastService.show("Test message", "success");

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith("Test message", "success");
    });

    it("should handle multiple registrations", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      toastService.register(callback1);
      toastService.register(callback2);

      toastService.show("Message 1", "error");
      toastService.show("Message 2", "success");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenNthCalledWith(1, "Message 1", "error");
      expect(callback2).toHaveBeenNthCalledWith(2, "Message 2", "success");
    });
  });

  describe("show", () => {
    it("should call registered callback with message and type", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      toastService.show("Success message", "success");

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith("Success message", "success");
    });

    it("should use default type 'info' when no type is provided", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      toastService.show("Info message");

      expect(mockCallback).toHaveBeenCalledWith("Info message", "info");
    });

    it("should handle all toast types", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const testCases = [
        { message: "Success", type: "success" as const },
        { message: "Error", type: "error" as const },
        { message: "Info", type: "info" as const },
      ];

      testCases.forEach(({ message, type }) => {
        toastService.show(message, type);
        expect(mockCallback).toHaveBeenCalledWith(message, type);
      });

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it("should warn when no callback is registered", () => {
      // Don't register any callback
      toastService.show("Test message", "info");

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "ToastService not registered yet"
      );
    });

    it("should not call callback when not registered", () => {
      const mockCallback = jest.fn();

      // Don't register the callback
      toastService.show("Test message", "info");

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should handle empty message", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      toastService.show("", "info");

      expect(mockCallback).toHaveBeenCalledWith("", "info");
    });

    it("should handle long messages", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const longMessage = "A".repeat(1000);
      toastService.show(longMessage, "error");

      expect(mockCallback).toHaveBeenCalledWith(longMessage, "error");
    });

    it("should handle special characters in message", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const specialMessage =
        "Message with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";
      toastService.show(specialMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(specialMessage, "info");
    });

    it("should handle unicode characters in message", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const unicodeMessage = "Message with unicode: 🚀 ✅ ❌ ™ © ®";
      toastService.show(unicodeMessage, "success");

      expect(mockCallback).toHaveBeenCalledWith(unicodeMessage, "success");
    });

    it("should handle multiple consecutive calls", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      toastService.show("First message", "info");
      toastService.show("Second message", "success");
      toastService.show("Third message", "error");

      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenNthCalledWith(1, "First message", "info");
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        "Second message",
        "success"
      );
      expect(mockCallback).toHaveBeenNthCalledWith(3, "Third message", "error");
    });

    it("should handle rapid successive calls", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      // Simulate rapid successive calls
      for (let i = 0; i < 10; i++) {
        toastService.show(`Message ${i}`, "info");
      }

      expect(mockCallback).toHaveBeenCalledTimes(10);
    });

    it("should maintain callback reference after multiple registrations", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      toastService.register(callback1);
      toastService.show("Message 1", "info");

      toastService.register(callback2);
      toastService.show("Message 2", "success");

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledWith("Message 1", "info");
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith("Message 2", "success");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete registration and show cycle", () => {
      const mockCallback = jest.fn();

      // Register callback
      toastService.register(mockCallback);

      // Show different types of toasts
      toastService.show("Welcome message", "info");
      toastService.show("Operation successful", "success");
      toastService.show("Something went wrong", "error");

      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenNthCalledWith(
        1,
        "Welcome message",
        "info"
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        2,
        "Operation successful",
        "success"
      );
      expect(mockCallback).toHaveBeenNthCalledWith(
        3,
        "Something went wrong",
        "error"
      );
    });

    it("should handle callback that throws error", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });

      toastService.register(errorCallback);

      // The service should call the callback even if it throws
      // The error will be thrown but that's expected behavior
      expect(() => {
        toastService.show("Test message", "info");
      }).toThrow("Callback error");

      expect(errorCallback).toHaveBeenCalledWith("Test message", "info");
    });

    it("should handle null callback registration", () => {
      // This tests the edge case where null is passed as callback
      // The service should handle this gracefully
      const nullCallback = null as any;

      expect(() => {
        toastService.register(nullCallback);
      }).not.toThrow();

      // After registering null, show should warn
      toastService.show("Test message", "info");
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "ToastService not registered yet"
      );
    });

    it("should handle undefined callback registration", () => {
      const undefinedCallback = undefined as any;

      expect(() => {
        toastService.register(undefinedCallback);
      }).not.toThrow();

      // After registering undefined, show should warn
      toastService.show("Test message", "info");
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "ToastService not registered yet"
      );
    });

    it("should handle callback that returns a value", () => {
      const callbackWithReturn = jest.fn().mockReturnValue("callback result");

      toastService.register(callbackWithReturn);

      const result = toastService.show("Test message", "info");

      expect(callbackWithReturn).toHaveBeenCalledWith("Test message", "info");
      expect(result).toBeUndefined(); // show method doesn't return anything
    });

    it("should handle async callback", async () => {
      const asyncCallback = jest.fn().mockResolvedValue("async result");

      toastService.register(asyncCallback);

      toastService.show("Async message", "info");

      expect(asyncCallback).toHaveBeenCalledWith("Async message", "info");
    });
  });

  describe("edge cases", () => {
    it("should handle very long messages", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const veryLongMessage = "A".repeat(10000);
      toastService.show(veryLongMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(veryLongMessage, "info");
    });

    it("should handle messages with newlines", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const multilineMessage = "Line 1\nLine 2\nLine 3";
      toastService.show(multilineMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(multilineMessage, "info");
    });

    it("should handle messages with tabs and spaces", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const spacedMessage = "  \t  Message with spaces and tabs  \t  ";
      toastService.show(spacedMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(spacedMessage, "info");
    });

    it("should handle numeric messages", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      // Convert number to string
      const numericMessage = String(12345);
      toastService.show(numericMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(numericMessage, "info");
    });

    it("should handle boolean messages", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      // Convert boolean to string
      const booleanMessage = String(true);
      toastService.show(booleanMessage, "info");

      expect(mockCallback).toHaveBeenCalledWith(booleanMessage, "info");
    });
  });

  describe("type safety", () => {
    it("should accept valid toast types", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      const validTypes: Array<"success" | "error" | "info"> = [
        "success",
        "error",
        "info",
      ];

      validTypes.forEach((type) => {
        toastService.show(`Message for ${type}`, type);
        expect(mockCallback).toHaveBeenCalledWith(`Message for ${type}`, type);
      });
    });

    it("should handle type parameter as optional", () => {
      const mockCallback = jest.fn();
      toastService.register(mockCallback);

      // Call without type parameter
      toastService.show("Message without type");

      expect(mockCallback).toHaveBeenCalledWith("Message without type", "info");
    });
  });

  describe("service state management", () => {
    it("should maintain state across multiple operations", () => {
      const mockCallback = jest.fn();

      // Register once
      toastService.register(mockCallback);

      // Multiple operations
      toastService.show("First", "info");
      toastService.show("Second", "success");
      toastService.show("Third", "error");

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it("should reset state when new callback is registered", () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      toastService.register(firstCallback);
      toastService.show("First message", "info");

      toastService.register(secondCallback);
      toastService.show("Second message", "success");

      expect(firstCallback).toHaveBeenCalledTimes(1);
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });
});
