/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/faculty/components/faculty-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacultyTable } from "./faculty-table";
import type { FacultyMember } from "../types/faculty-types";

const sampleFaculty: FacultyMember = {
  id: 1,
  employee_number: "EMP-101",
  first_name: "Ana",
  last_name: "Santos",
  email: "ana.santos@example.com",
  department: "Computer Science",
  status: "active",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("FacultyTable", () => {
  it("renders faculty details and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <FacultyTable
        faculty={[sampleFaculty]}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("EMP-101")).toBeInTheDocument();
    expect(screen.getByText("Ana Santos")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(sampleFaculty);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith(sampleFaculty);
  });
});
