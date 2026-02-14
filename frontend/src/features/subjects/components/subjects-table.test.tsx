/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/subjects/components/subjects-table.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubjectsTable } from "./subjects-table";
import type { Subject } from "../types/subject-types";

const sampleSubject: Subject = {
  id: 1,
  code: "CS101",
  title: "Programming 1",
  units: 3,
  lecture_hours: 2,
  lab_hours: 1,
  is_active: true,
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

describe("SubjectsTable", () => {
  it("renders subject details and actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onToggleActive = vi.fn();

    render(
      <SubjectsTable
        subjects={[sampleSubject]}
        isLoading={false}
        isToggling={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
      />,
    );

    expect(screen.getByText("CS101")).toBeInTheDocument();
    expect(screen.getByText("Programming 1")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));
    expect(onToggleActive).toHaveBeenCalledWith(sampleSubject);
  });
});
