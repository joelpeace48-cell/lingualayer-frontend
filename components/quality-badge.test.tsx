import { render, screen } from "@testing-library/react";
import { QualityBadge } from "./quality-badge";

describe("QualityBadge", () => {
  it("renders the tier label and falls back to Unrated styling for an unknown tier", () => {
    render(<QualityBadge tier={"NotATier" as never} />);
    expect(screen.getByLabelText(/quality tier: unrated/i)).toBeInTheDocument();
  });

  it("shows the numeric score when provided", () => {
    render(<QualityBadge tier="Gold" score={87} />);
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByLabelText(/quality tier: gold, score 87/i)).toBeInTheDocument();
  });

  it("omits the label and score text in compact mode but keeps the accessible name", () => {
    render(<QualityBadge tier="Platinum" score={99} compact />);
    expect(screen.queryByText("Platinum")).not.toBeInTheDocument();
    expect(screen.queryByText("99")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/quality tier: platinum, score 99/i)).toBeInTheDocument();
  });

  it("uses the tier name as the tooltip when no score is given", () => {
    render(<QualityBadge tier="Bronze" />);
    expect(screen.getByTitle("Bronze")).toBeInTheDocument();
  });
});
