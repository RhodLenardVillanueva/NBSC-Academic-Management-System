/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/faculty/faculty-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FacultyPage } from "./faculty-page";
import { facultyService } from "./faculty-service";
import { useFaculty } from "./hooks/use-faculty";
import type { FacultyMember } from "./types/faculty-types";

type UseFacultyReturn = ReturnType<typeof useFaculty>;

vi.mock("./faculty-service", () => ({
  facultyService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock("./hooks/use-faculty", () => ({
  useFaculty: vi.fn(),
}));

const sampleFaculty: FacultyMember = {
  id: 5,
  employee_number: "EMP-301",
  first_name: "Ana",
  last_name: "Santos",
  email: "ana.santos@example.com",
  department: "IT",
  status: "active",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseFacultyState = (overrides?: Partial<UseFacultyReturn>): UseFacultyReturn => ({
  faculty: [sampleFaculty],
  pagination: {
    data: [sampleFaculty],
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

describe("FacultyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a faculty member from the dialog", async () => {
    const state = buildUseFacultyState();
    const useFacultyMock = vi.mocked(useFaculty);
    useFacultyMock.mockReturnValue(state);

    const serviceMock = vi.mocked(facultyService);
    serviceMock.create.mockResolvedValue(sampleFaculty);

    render(<FacultyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add Faculty" }));

    fireEvent.change(screen.getByLabelText("Employee Number"), {
      target: { value: "EMP-305" },
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

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        employee_number: "EMP-305",
        first_name: "Lia",
        last_name: "Reyes",
        email: null,
        department: "Business",
        status: "active",
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("deletes a faculty member after confirmation", async () => {
    const state = buildUseFacultyState();
    const useFacultyMock = vi.mocked(useFaculty);
    useFacultyMock.mockReturnValue(state);

    const serviceMock = vi.mocked(facultyService);
    serviceMock.remove.mockResolvedValue(undefined);

    render(<FacultyPage />);

    const [tableDeleteButton] = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(tableDeleteButton);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(serviceMock.remove).toHaveBeenCalledWith(sampleFaculty.id);
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });
});
