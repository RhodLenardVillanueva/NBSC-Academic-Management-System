/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/students/components/student-form-dialog.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentFormDialog } from "./student-form-dialog";
import type { StudentPayload } from "../types/student-types";
import { programService } from "../../programs/program-service";

vi.mock("../../programs/program-service", () => ({
  programService: {
    list: vi.fn(),
  },
}));

describe("StudentFormDialog", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn<[StudentPayload], Promise<void>>().mockResolvedValue();

    const programServiceMock = vi.mocked(programService);
    programServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 2,
          name: "Computer Science",
          code: "BSCS",
          description: null,
          created_at: "2026-02-01T08:00:00Z",
          updated_at: "2026-02-01T08:00:00Z",
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 1,
    });

    render(
      <StudentFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Student"
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

    expect(await screen.findByText("Student number is required.")).toBeInTheDocument();
    expect(await screen.findByText("First name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Last name is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits parsed payload", async () => {
    const onSubmit = vi.fn<[StudentPayload], Promise<void>>().mockResolvedValue();

    const programServiceMock = vi.mocked(programService);
    programServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 2,
          name: "Computer Science",
          code: "BSCS",
          description: null,
          created_at: "2026-02-01T08:00:00Z",
          updated_at: "2026-02-01T08:00:00Z",
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 1,
    });

    render(
      <StudentFormDialog
        open={true}
        onOpenChange={() => undefined}
        title="Create Student"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Student Number"), {
      target: { value: "2026-002" },
    });
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Santos" },
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Program (optional)")).not.toBeDisabled();
    });
    fireEvent.change(screen.getByLabelText("Program (optional)"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Year Level"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "dropped" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        student_number: "2026-002",
        first_name: "John",
        last_name: "Santos",
        program_id: 2,
        year_level: 3,
        status: "dropped",
      });
    });
  });
});
