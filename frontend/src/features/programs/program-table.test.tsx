/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/programs/program-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgramsTable } from "./program-table";
import type { Program } from "./program-types";

const sampleProgram: Program = {
  id: 1,
  code: "BSIT",
  name: "Information Technology",
  description: "Tech program",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("ProgramsTable", () => {
  it("renders program details and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <ProgramsTable
        programs={[sampleProgram]}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("BSIT")).toBeInTheDocument();
    expect(screen.getByText("Information Technology")).toBeInTheDocument();
    expect(screen.getByText("Tech program")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleProgram);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleProgram);
  });
});
