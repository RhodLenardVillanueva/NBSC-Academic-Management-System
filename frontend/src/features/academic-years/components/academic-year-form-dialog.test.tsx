/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/academic-years/components/academic-year-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AcademicYearFormDialog } from "./academic-year-form-dialog";
import type { AcademicYearPayload } from "../types/academic-year-types";

describe("AcademicYearFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[AcademicYearPayload], Promise<void>>().mockResolvedValue();

    render(
      <AcademicYearFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Academic Year"
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

    expect(await screen.findByText("Year start is required.")).toBeInTheDocument();
    expect(await screen.findByText("Year end is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[AcademicYearPayload], Promise<void>>().mockResolvedValue();

    render(
      <AcademicYearFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Academic Year"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Year Start"), {
      target: { value: "2024" },
    });
    fireEvent.change(screen.getByLabelText("Year End"), {
      target: { value: "2025" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "true" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "2024-2025",
        is_active: true,
      });
    });
  });
});
