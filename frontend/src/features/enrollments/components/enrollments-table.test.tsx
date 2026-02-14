/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/enrollments/components/enrollments-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnrollmentsTable } from "./enrollments-table";
import type { Enrollment } from "../types/enrollment-types";

const sampleEnrollment: Enrollment = {
  id: 1,
  student_id: 10,
  program_id: 3,
  academic_year_id: 2,
  semester_id: 5,
  year_level: 2,
  total_units: 12,
  status: "enrolled",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("EnrollmentsTable", () => {
  it("renders enrollment details and actions", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <EnrollmentsTable
        enrollments={[sampleEnrollment]}
        isLoading={false}
        studentLookup={new Map([[10, "2026-0001 - Santos, Ana"]])}
        programLookup={new Map([[3, "BS Information Technology"]])}
        academicYearLookup={new Map([[2, "2026-2027"]])}
        semesterLookup={new Map([[5, "1st Semester"]])}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("2026-0001 - Santos, Ana")).toBeInTheDocument();
    expect(screen.getByText("BS Information Technology")).toBeInTheDocument();
    expect(screen.getByText("2026-2027")).toBeInTheDocument();
    expect(screen.getByText("1st Semester")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(onView).toHaveBeenCalledWith(sampleEnrollment);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleEnrollment);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleEnrollment);
  });
});
