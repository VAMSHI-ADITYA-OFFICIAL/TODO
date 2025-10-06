import { render, screen } from "../utils/test-utils";
import Home from "../../app/page";

describe("Home Page", () => {
  it("renders welcome message", () => {
    render(<Home />);

    expect(
      screen.getByText(/Welcome to the SImple Todo Application/i)
    ).toBeInTheDocument();
  });

  it("renders signup and login links", () => {
    render(<Home />);

    const signupLink = screen.getByRole("link", { name: /signup/i });
    const loginLink = screen.getByRole("link", { name: /login/i });

    expect(signupLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();

    expect(signupLink).toHaveAttribute("href", "/signup");
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("has correct styling classes", () => {
    render(<Home />);

    const main = screen.getByRole("main");
    expect(main).toHaveClass("flex flex-col items-center mt-52 h-screen");
  });
});
