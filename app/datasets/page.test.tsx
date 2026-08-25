import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatasetsPage from "./page";

const DATASETS = [
  { dataset_id: "1", name: "Yoruba Proverbs", language_code: "yor", owner: "G...A", sample_count: 500 },
  { dataset_id: "2", name: "Hausa News Corpus", language_code: "hau", owner: "G...B", sample_count: 1200 },
];

function mockFetchOnce(body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve(body) }) as jest.Mock;
}

describe("DatasetsPage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a loading message, then renders fetched datasets", async () => {
    mockFetchOnce({ datasets: DATASETS });
    render(<DatasetsPage />);

    expect(screen.getByText(/loading datasets/i)).toBeInTheDocument();
    expect(await screen.findByText("Yoruba Proverbs")).toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });

  it("renders the no-filters empty state when nothing comes back", async () => {
    mockFetchOnce({ datasets: [] });
    render(<DatasetsPage />);

    expect(await screen.findByText("No datasets yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse bounties" })).toHaveAttribute("href", "/bounties");
  });

  it("falls back to an empty datasets array if the fetch rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network down")) as jest.Mock;
    render(<DatasetsPage />);

    expect(await screen.findByText("No datasets yet")).toBeInTheDocument();
  });

  it("filters by search query and shows a clearable no-match empty state", async () => {
    mockFetchOnce({ datasets: DATASETS });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.type(screen.getByLabelText(/search datasets by name/i), "hausa");

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/search datasets by name/i), " corpus xyz");
    expect(await screen.findByText("No datasets match your filters")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("Yoruba Proverbs")).toBeInTheDocument();
  });

  it("filters by language", async () => {
    mockFetchOnce({ datasets: DATASETS });
    render(<DatasetsPage />);
    await screen.findByText("Yoruba Proverbs");

    await userEvent.selectOptions(screen.getByLabelText(/filter datasets by language/i), "hau");

    expect(screen.queryByText("Yoruba Proverbs")).not.toBeInTheDocument();
    expect(screen.getByText("Hausa News Corpus")).toBeInTheDocument();
  });
});
