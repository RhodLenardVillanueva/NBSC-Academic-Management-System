/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/semesters/semesters-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SemestersPage } from "./semesters-page";
import { semesterService } from "./semester-service";
import { useSemesters } from "./hooks/use-semesters";
import { academicYearService } from "../academic-years/academic-year-service";
import type { AcademicYear } from "../academic-years/types/academic-year-types";
import type { Semester } from "./types/semester-types";

type UseSemestersReturn = ReturnType<typeof useSemesters>;

type PaginatedAcademicYears = {
  data: AcademicYear[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

vi.mock("./semester-service", () => ({
  semesterService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../academic-years/academic-year-service", () => ({
  academicYearService: {
    list: vi.fn(),
  },
}));

vi.mock("./hooks/use-semesters", () => ({
  useSemesters: vi.fn(),
}));

const sampleSemester: Semester = {
  id: 9,
  name: "First Semester",
  academic_year_id: 1,
  is_current: true,
  add_drop_start: "2026-06-01",
  add_drop_end: "2026-06-15",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const sampleAcademicYears: PaginatedAcademicYears = {
  data: [
    {
      id: 1,
      name: "2024-2025",
      is_active: true,
      created_at: "2026-02-01T08:00:00Z",
      updated_at: "2026-02-01T08:00:00Z",
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 1,
};

const buildUseSemestersState = (overrides?: Partial<UseSemestersReturn>): UseSemestersReturn => ({
  semesters: [sampleSemester],
  pagination: {
    data: [sampleSemester],
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

describe("SemestersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a semester from the dialog", async () => {
    const state = buildUseSemestersState();
    const useSemestersMock = vi.mocked(useSemesters);
    useSemestersMock.mockReturnValue(state);

    const serviceMock = vi.mocked(semesterService);
    serviceMock.create.mockResolvedValue(sampleSemester);

    const academicYearMock = vi.mocked(academicYearService);
    academicYearMock.list.mockResolvedValue(sampleAcademicYears);

    render(<SemestersPage />);

    await waitFor(() => {
      expect(academicYearMock.list).toHaveBeenCalled();
    });

    const [addButton] = screen.getAllByRole("button", { name: "Add Semester" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Semester Name"), {
      target: { value: "Second Semester" },
    });
    fireEvent.change(screen.getByLabelText("Academic Year"), {
      target: { value: "1" },
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
      expect(serviceMock.create).toHaveBeenCalledWith({
        name: "Second Semester",
        academic_year_id: 1,
        is_current: false,
        add_drop_start: "2026-06-01",
        add_drop_end: "2026-06-15",
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("prevents deleting the current semester", async () => {
    const state = buildUseSemestersState();
    const useSemestersMock = vi.mocked(useSemesters);
    useSemestersMock.mockReturnValue(state);

    const serviceMock = vi.mocked(semesterService);
    const academicYearMock = vi.mocked(academicYearService);
    academicYearMock.list.mockResolvedValue(sampleAcademicYears);

    render(<SemestersPage />);

    await waitFor(() => {
      expect(academicYearMock.list).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByText(
        "Cannot delete the current semester. Set another semester as current first.",
      ),
    ).toBeInTheDocument();
    expect(serviceMock.remove).not.toHaveBeenCalled();
  });
});
