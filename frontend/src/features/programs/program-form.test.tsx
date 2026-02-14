/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/programs/program-form.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgramFormDialog } from "./program-form";
import type { ProgramPayload } from "./program-types";

describe("ProgramFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[ProgramPayload], Promise<void>>().mockResolvedValue();

    render(
      <ProgramFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Program"
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

    expect(await screen.findByText("Program code is required.")).toBeInTheDocument();
    expect(await screen.findByText("Program name is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[ProgramPayload], Promise<void>>().mockResolvedValue();

    render(
      <ProgramFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Program"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Program Code"), {
      target: { value: "BSCS" },
    });
    fireEvent.change(screen.getByLabelText("Program Name"), {
      target: { value: "Computer Science" },
    });
    fireEvent.change(screen.getByLabelText("Description (optional)"), {
      target: { value: "  Core CS program  " },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        code: "BSCS",
        name: "Computer Science",
        description: "Core CS program",
      });
    });
  });
});
