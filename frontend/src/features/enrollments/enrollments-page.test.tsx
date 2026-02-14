/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/enrollments/enrollments-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnrollmentsPage } from "./enrollments-page";
import { enrollmentService } from "./enrollment-service";
import { useEnrollments } from "./hooks/use-enrollments";
import { studentService } from "../students/student-service";
import { programService } from "../programs/program-service";
import { academicYearService } from "../academic-years/academic-year-service";
import { semesterService } from "../semesters/semester-service";
import type { Enrollment } from "./types/enrollment-types";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("./enrollment-service", () => ({
  enrollmentService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    cor: vi.fn(),
  },
}));

vi.mock("./hooks/use-enrollments", () => ({
  useEnrollments: vi.fn(),
}));

vi.mock("../students/student-service", () => ({
  studentService: {
    list: vi.fn(),
  },
}));

vi.mock("../programs/program-service", () => ({
  programService: {
    list: vi.fn(),
  },
}));

vi.mock("../academic-years/academic-year-service", () => ({
  academicYearService: {
    list: vi.fn(),
  },
}));

vi.mock("../semesters/semester-service", () => ({
  semesterService: {
    list: vi.fn(),
  },
}));

const sampleEnrollment: Enrollment = {
  id: 1,
  student_id: 10,
  program_id: 3,
  academic_year_id: 2,
  semester_id: 5,
  year_level: 2,
  total_units: 12,
  status: "enrolled",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseEnrollmentsState = (): ReturnType<typeof useEnrollments> => ({
  enrollments: [sampleEnrollment],
  pagination: {
    data: [sampleEnrollment],
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 1,
  },
  isLoading: false,
  error: null,
  refresh: vi.fn().mockResolvedValue(undefined),
});

describe("EnrollmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(studentService.list).mockResolvedValue({
      data: [
        {
          id: 10,
          student_number: "2026-0001",
          first_name: "Ana",
          last_name: "Santos",
          program_id: 3,
          year_level: 2,
          status: "active",
          created_at: "2026-02-01T08:00:00Z",
          updated_at: "2026-02-01T08:00:00Z",
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 1,
    });

    vi.mocked(programService.list).mockResolvedValue({
      data: [
        {
          id: 3,
          code: "BSIT",
          name: "BS Information Technology",
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

    vi.mocked(academicYearService.list).mockResolvedValue({
      data: [
        {
          id: 2,
          name: "2026-2027",
          is_active: true,
          created_at: "2026-02-01T08:00:00Z",
          updated_at: "2026-02-01T08:00:00Z",
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 1,
    });

    vi.mocked(semesterService.list).mockResolvedValue({
      data: [
        {
          id: 5,
          academic_year_id: 2,
          name: "1st Semester",
          is_current: true,
          add_drop_start: "2026-06-01",
          add_drop_end: "2026-06-15",
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

  it("creates an enrollment from the dialog", async () => {
    const state = buildUseEnrollmentsState();
    const useEnrollmentsMock = vi.mocked(useEnrollments);
    useEnrollmentsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(enrollmentService);
    serviceMock.create.mockResolvedValue(sampleEnrollment);

    render(<EnrollmentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Add Enrollment" }));

    await screen.findByRole("option", { name: "2026-0001 - Santos, Ana" });

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

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        student_id: 10,
        program_id: 3,
        academic_year_id: 2,
        semester_id: 5,
        year_level: 2,
        status: "enrolled",
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });
});
