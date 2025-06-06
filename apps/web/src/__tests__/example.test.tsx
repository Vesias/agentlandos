import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Simple test component for validation
function TestComponent() {
  return (
    <div>
      <h1>AGENTLAND.SAARLAND</h1>
      <p>KI-Agentur für das Saarland</p>
    </div>
  );
}

describe("Testing Setup Validation", () => {
  it("should render test component correctly", () => {
    render(<TestComponent />);

    expect(screen.getByText("AGENTLAND.SAARLAND")).toBeInTheDocument();
    expect(screen.getByText("KI-Agentur für das Saarland")).toBeInTheDocument();
  });

  it("should have proper test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe(
      "https://test.supabase.co",
    );
  });
});
