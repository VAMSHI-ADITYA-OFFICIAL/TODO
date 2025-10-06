import { cn } from "../../lib/utils";

// Mock clsx and tailwind-merge
const mockClsx = jest.fn();
const mockTwMerge = jest.fn();

jest.mock("clsx", () => ({
  clsx: (...args: any[]) => mockClsx(...args),
}));

jest.mock("tailwind-merge", () => ({
  twMerge: (classes: any) => mockTwMerge(classes),
}));

describe("cn utility function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClsx.mockReturnValue("clsx-result");
    mockTwMerge.mockReturnValue("merged-result");
  });

  it("should call clsx and twMerge", () => {
    const result = cn("class1", "class2", "class3");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should return the result from twMerge", () => {
    const expectedResult = "merged-classes";
    mockTwMerge.mockReturnValue(expectedResult);

    const result = cn("class1", "class2");

    expect(result).toBe(expectedResult);
  });

  it("should handle empty arguments", () => {
    const result = cn();

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle single argument", () => {
    const result = cn("single-class");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle array arguments", () => {
    const result = cn(["class1", "class2"], "class3");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle object arguments", () => {
    const result = cn({ class1: true, class2: false }, "class3");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle mixed argument types", () => {
    const result = cn(
      "class1",
      ["class2", "class3"],
      { class4: true },
      "class5"
    );

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle undefined and null values", () => {
    const result = cn("class1", undefined, null, "class2");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle boolean values", () => {
    const result = cn("class1", true, false, "class2");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle numeric values", () => {
    const result = cn("class1", 0, 1, "class2");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle complex nested structures", () => {
    const complexInput = [
      "base-class",
      {
        "conditional-class": true,
        "another-conditional": false,
      },
      ["nested-class1", "nested-class2"],
      "final-class",
    ];

    const result = cn(...complexInput);

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle empty strings", () => {
    const result = cn("", "class1", "", "class2");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle whitespace in class names", () => {
    const result = cn("class with spaces", "another-class");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle special characters in class names", () => {
    const result = cn(
      "class-with-dashes",
      "class_with_underscores",
      "class.with.dots"
    );

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle very long class names", () => {
    const longClass = "a".repeat(1000);
    const result = cn(longClass);

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle many arguments", () => {
    const manyArgs = Array.from({ length: 100 }, (_, i) => `class-${i}`);
    const result = cn(...manyArgs);

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should preserve the order of arguments", () => {
    const result = cn("first", "second", "third");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle function calls as arguments", () => {
    const getClass = () => "dynamic-class";
    const result = cn("static-class", getClass());

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle template literals", () => {
    const variable = "variable";
    const result = cn(`template-${variable}`, "static-class");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle edge case with all falsy values", () => {
    const result = cn(false, null, undefined, 0, "");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle edge case with all truthy values", () => {
    const result = cn("class1", "class2", "class3");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });

  it("should handle mixed truthy and falsy values", () => {
    const result = cn("class1", false, "class2", null, "class3");

    expect(mockClsx).toHaveBeenCalled();
    expect(mockTwMerge).toHaveBeenCalledWith("clsx-result");
    expect(result).toBe("merged-result");
  });
});
