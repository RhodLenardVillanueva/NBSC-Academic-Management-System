/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/students/components/students-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentsTable } from "./students-table";
import type { Student } from "../types/student-types";

const sampleStudent: Student = {
  id: 3,
  student_number: "2026-001",
  first_name: "Ana",
  last_name: "Reyes",
  program_id: 2,
  year_level: 2,
  status: "active",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("StudentsTable", () => {
  it("renders students and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onRestore = vi.fn();

    render(
      <StudentsTable
        students={[sampleStudent]}
        isLoading={false}
        isArchivedView={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
    );

    expect(screen.getByText("2026-001")).toBeInTheDocument();
    expect(screen.getByText("Reyes, Ana")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleStudent);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleStudent);
  });

  it("renders restore action in archived view", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onRestore = vi.fn();

    render(
      <StudentsTable
        students={[sampleStudent]}
        isLoading={false}
        isArchivedView={true}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Restore" }));
    expect(onRestore).toHaveBeenCalledWith(sampleStudent);
  });
});
