/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/students/students-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentsPage } from "./students-page";
import { studentService } from "./student-service";
import { useStudents } from "./hooks/use-students";
import type { Student } from "./types/student-types";
import { programService } from "../programs/program-service";

type UseStudentsReturn = ReturnType<typeof useStudents>;

vi.mock("./student-service", () => ({
  studentService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
  },
}));

vi.mock("./hooks/use-students", () => ({
  useStudents: vi.fn(),
}));

vi.mock("../programs/program-service", () => ({
  programService: {
    list: vi.fn(),
  },
}));

const sampleStudent: Student = {
  id: 11,
  student_number: "2026-010",
  first_name: "Mia",
  last_name: "Lopez",
  program_id: 1,
  year_level: 1,
  status: "active",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseStudentsState = (overrides?: Partial<UseStudentsReturn>): UseStudentsReturn => ({
  students: [sampleStudent],
  pagination: {
    data: [sampleStudent],
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 1,
  },
  isLoading: false,
  error: null,
  refresh: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("StudentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const programServiceMock = vi.mocked(programService);
    programServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Information Technology",
          code: "BSIT",
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
  });

  it("creates a student from the dialog", async () => {
    const state = buildUseStudentsState();
    const useStudentsMock = vi.mocked(useStudents);
    useStudentsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(studentService);
    serviceMock.create.mockResolvedValue(sampleStudent);

    render(<StudentsPage />);

    const [addButton] = screen.getAllByRole("button", { name: "Add Student" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Student Number"), {
      target: { value: "2026-011" },
    });
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Lara" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Cruz" },
    });
    fireEvent.change(screen.getByLabelText("Year Level"), {
      target: { value: "2" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        student_number: "2026-011",
        first_name: "Lara",
        last_name: "Cruz",
        program_id: null,
        year_level: 2,
        status: "active",
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("deletes a student after confirmation", async () => {
    const state = buildUseStudentsState();
    const useStudentsMock = vi.mocked(useStudents);
    useStudentsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(studentService);
    serviceMock.remove.mockResolvedValue(undefined);

    render(<StudentsPage />);

    const [tableDeleteButton] = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(tableDeleteButton);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons.length).toBeGreaterThan(1);
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(serviceMock.remove).toHaveBeenCalledWith(sampleStudent.id);
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("restores a student from archived view", async () => {
    const state = buildUseStudentsState();
    const useStudentsMock = vi.mocked(useStudents);
    useStudentsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(studentService);
    serviceMock.restore.mockResolvedValue(sampleStudent);

    render(<StudentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Show Archived" }));
    fireEvent.click(screen.getByRole("button", { name: "Restore" }));

    await waitFor(() => {
      expect(serviceMock.restore).toHaveBeenCalledWith(sampleStudent.id);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Show Archived" })).toBeInTheDocument();
    });
  });
});
