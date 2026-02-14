/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/academic-years/components/academic-years-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AcademicYearsTable } from "./academic-years-table";
import type { AcademicYear } from "../types/academic-year-types";

const sampleAcademicYear: AcademicYear = {
  id: 1,
  name: "2024-2025",
  is_active: true,
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("AcademicYearsTable", () => {
  it("renders academic year details and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <AcademicYearsTable
        academicYears={[sampleAcademicYear]}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleAcademicYear);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleAcademicYear);
  });
});
