/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/semesters/components/semesters-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SemestersTable } from "./semesters-table";
import type { Semester } from "../types/semester-types";

const sampleSemester: Semester = {
  id: 1,
  name: "First Semester",
  academic_year_id: 2,
  is_current: true,
  add_drop_start: "2026-06-01",
  add_drop_end: "2026-06-15",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("SemestersTable", () => {
  it("renders semester details and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const academicYearLookup = new Map<number, string>([[2, "2024-2025"]]);

    render(
      <SemestersTable
        semesters={[sampleSemester]}
        isLoading={false}
        academicYearLookup={academicYearLookup}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("First Semester")).toBeInTheDocument();
    expect(screen.getByText("2024-2025")).toBeInTheDocument();
    expect(screen.getByText("2026-06-01")).toBeInTheDocument();
    expect(screen.getByText("2026-06-15")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleSemester);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleSemester);
  });
});
