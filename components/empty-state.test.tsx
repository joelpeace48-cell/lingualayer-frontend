import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the title, message, and illustration", () => {
    render(
      <EmptyState
        illustration={<svg data-testid="art" />}
        title="No datasets yet"
        message="Come back later."
      />,
    );
    expect(screen.getByText("No datasets yet")).toBeInTheDocument();
    expect(screen.getByText("Come back later.")).toBeInTheDocument();
    expect(screen.getByTestId("art")).toBeInTheDocument();
  });

  it("renders a navigation link when the cta has an href", () => {
    render(
      <EmptyState
        illustration={<svg />}
        title="Empty"
        message="msg"
        cta={{ label: "Explore datasets", href: "/datasets" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Explore datasets" });
    expect(link).toHaveAttribute("href", "/datasets");
  });

  it("renders a button and fires onClick when the cta has no href", async () => {
    const onClick = jest.fn();
    render(
      <EmptyState illustration={<svg />} title="Empty" message="msg" cta={{ label: "Clear filters", onClick }} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders no CTA at all when none is provided", () => {
    render(<EmptyState illustration={<svg />} title="Empty" message="msg" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
