import { GET } from "../../app/api/todos/route";

// Mock the fetchWithAuth function
jest.mock("../../lib/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

// Mock NextRequest and NextResponse
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url),
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Headers(),
    })),
  },
}));

describe("/api/todos route", () => {
  const mockFetchWithAuth = require("../../lib/auth").fetchWithAuth;
  const { NextRequest } = require("next/server");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch todos with default parameters", async () => {
    const mockData = {
      result: [
        { id: "1", title: "Test Todo", completed: false },
        { id: "2", title: "Another Todo", completed: true },
      ],
      count: 2,
      completedCount: 1,
      pageInfo: { nextCursor: "next123", hasNextPage: true },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/todos");
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=10", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should fetch todos with cursor parameter", async () => {
    const mockData = {
      result: [{ id: "3", title: "Next Todo", completed: false }],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?cursor=abc123"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "/todos?cursor=abc123&limit=10",
      {
        method: "GET",
      }
    );

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should fetch todos with custom limit", async () => {
    const mockData = {
      result: [{ id: "1", title: "Test Todo", completed: false }],
      count: 1,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/todos?limit=5");
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=5", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should fetch todos with both cursor and limit", async () => {
    const mockData = {
      result: [{ id: "2", title: "Another Todo", completed: true }],
      count: 1,
      completedCount: 1,
      pageInfo: { nextCursor: "next456", hasNextPage: true },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?cursor=xyz789&limit=20"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      "/todos?cursor=xyz789&limit=20",
      {
        method: "GET",
      }
    );

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle empty cursor parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/todos?cursor=");
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=10", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle invalid limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?limit=invalid"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=NaN", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle fetchWithAuth error", async () => {
    const errorMessage = "Failed to fetch todos";
    mockFetchWithAuth.mockRejectedValue(new Error(errorMessage));

    const request = new NextRequest("http://localhost:3000/api/todos");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: errorMessage });
  });

  it("should handle non-Error exception", async () => {
    mockFetchWithAuth.mockRejectedValue("String error");

    const request = new NextRequest("http://localhost:3000/api/todos");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: "Internal server error" });
  });

  it("should handle null limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?limit=null"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=NaN", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle undefined limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?limit=undefined"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=NaN", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle zero limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/todos?limit=0");
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=0", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle negative limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest("http://localhost:3000/api/todos?limit=-5");
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=-5", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle large limit parameter", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const request = new NextRequest(
      "http://localhost:3000/api/todos?limit=1000"
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos?limit=1000", {
      method: "GET",
    });

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });

  it("should handle special characters in cursor", async () => {
    const mockData = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: null, hasNextPage: false },
    };

    mockFetchWithAuth.mockResolvedValue(mockData);

    const specialCursor = "cursor%20with%20spaces&special=chars";
    const request = new NextRequest(
      `http://localhost:3000/api/todos?cursor=${encodeURIComponent(
        specialCursor
      )}`
    );
    const response = await GET(request);

    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      `/todos?cursor=${encodeURIComponent(specialCursor)}&limit=10`,
      {
        method: "GET",
      }
    );

    const responseData = await response.json();
    expect(responseData).toEqual(mockData);
  });
});
