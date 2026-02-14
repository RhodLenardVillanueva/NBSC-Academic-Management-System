/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/enrollments/components/enrollment-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnrollmentFormDialog } from "./enrollment-form-dialog";
import type { EnrollmentPayload } from "../types/enrollment-types";

describe("EnrollmentFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[EnrollmentPayload], Promise<void>>().mockResolvedValue();

    render(
      <EnrollmentFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Enrollment"
        isSubmitting={false}
        studentOptions={[]}
        programLookup={new Map()}
        academicYearOptions={[]}
        semesterOptions={[]}
        isReferenceLoading={false}
        onSubmit={onSubmit}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    expect(await screen.findByText("Student is required.")).toBeInTheDocument();
    expect(await screen.findByText("Academic year is required.")).toBeInTheDocument();
    expect(await screen.findByText("Semester is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[EnrollmentPayload], Promise<void>>().mockResolvedValue();

    render(
      <EnrollmentFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Enrollment"
        isSubmitting={false}
        studentOptions={[
          {
            value: "10",
            label: "2026-0001 - Santos, Ana",
            programId: 3,
          },
        ]}
        programLookup={new Map([[3, "BS Information Technology"]])}
        academicYearOptions={[{ value: "2", label: "2026-2027" }]}
        semesterOptions={[{ value: "5", label: "1st Semester", academicYearId: 2 }]}
        isReferenceLoading={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Student"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("Academic Year"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Semester"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Year Level"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "completed" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    const expectedPayload: EnrollmentPayload = {
      student_id: 10,
      program_id: 3,
      academic_year_id: 2,
      semester_id: 5,
      year_level: 2,
      status: "completed",
    };

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
