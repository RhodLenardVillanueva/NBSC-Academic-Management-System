/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/semesters/components/semester-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SemesterFormDialog } from "./semester-form-dialog";
import type { SemesterPayload } from "../types/semester-types";

describe("SemesterFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[SemesterPayload], Promise<void>>().mockResolvedValue();

    render(
      <SemesterFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Semester"
        isSubmitting={false}
        academicYearOptions={[]}
        isAcademicYearsLoading={false}
        onSubmit={onSubmit}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    expect(await screen.findByText("Semester name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Academic year is required.")).toBeInTheDocument();
    expect(await screen.findByText("Add/drop start date is required.")).toBeInTheDocument();
    expect(await screen.findByText("Add/drop end date is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[SemesterPayload], Promise<void>>().mockResolvedValue();

    render(
      <SemesterFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Semester"
        isSubmitting={false}
        academicYearOptions={[{ value: "2", label: "2024-2025" }]}
        isAcademicYearsLoading={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Semester Name"), {
      target: { value: "Second Semester" },
    });
    fireEvent.change(screen.getByLabelText("Academic Year"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "true" },
    });
    fireEvent.change(screen.getByLabelText("Add/Drop Start"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("Add/Drop End"), {
      target: { value: "2026-06-15" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Second Semester",
        academic_year_id: 2,
        is_current: true,
        add_drop_start: "2026-06-01",
        add_drop_end: "2026-06-15",
      });
    });
  });
});
