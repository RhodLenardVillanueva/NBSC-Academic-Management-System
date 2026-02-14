/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/subjects/components/subject-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubjectFormDialog } from "./subject-form-dialog";
import type { SubjectPayload } from "../types/subject-types";

describe("SubjectFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[SubjectPayload], Promise<void>>().mockResolvedValue();

    render(
      <SubjectFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Subject"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    expect(await screen.findByText("Subject code is required.")).toBeInTheDocument();
    expect(await screen.findByText("Subject title is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[SubjectPayload], Promise<void>>().mockResolvedValue();

    render(
      <SubjectFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Subject"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Subject Code"), {
      target: { value: "CS102" },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Data Structures" },
    });
    fireEvent.change(screen.getByLabelText("Units"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Lecture Hours"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Lab Hours"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "false" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    const expectedPayload: SubjectPayload = {
      code: "CS102",
      title: "Data Structures",
      units: 3,
      lecture_hours: 2,
      lab_hours: 1,
      is_active: false,
    };

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
