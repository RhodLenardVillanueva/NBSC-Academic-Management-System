/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/faculty/components/faculty-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FacultyFormDialog } from "./faculty-form-dialog";
import type { FacultyPayload } from "../types/faculty-types";

describe("FacultyFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[FacultyPayload], Promise<void>>().mockResolvedValue();

    render(
      <FacultyFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Faculty"
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

    expect(await screen.findByText("Employee number is required.")).toBeInTheDocument();
    expect(await screen.findByText("First name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Last name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Department is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[FacultyPayload], Promise<void>>().mockResolvedValue();

    render(
      <FacultyFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Faculty"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Employee Number"), {
      target: { value: "EMP-201" },
    });
    fireEvent.change(screen.getByLabelText("Department"), {
      target: { value: "Business" },
    });
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Lia" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Reyes" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "lia.reyes@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "inactive" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    const expectedPayload: FacultyPayload = {
      employee_number: "EMP-201",
      first_name: "Lia",
      last_name: "Reyes",
      email: "lia.reyes@example.com",
      department: "Business",
      status: "inactive",
    };

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
