/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/assessment/assessment-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AssessmentPage } from "./assessment-page";
import { useEnrollments } from "../enrollments/hooks/use-enrollments";
import type { Enrollment } from "../enrollments/types/enrollment-types";
import { studentService } from "../students/student-service";
import { programService } from "../programs/program-service";
import { academicYearService } from "../academic-years/academic-year-service";
import { semesterService } from "../semesters/semester-service";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../enrollments/hooks/use-enrollments", () => ({
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

describe("AssessmentPage", () => {
  it("renders assessment list view", () => {
    vi.mocked(useEnrollments).mockReturnValue({
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

    vi.mocked(studentService.list).mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });
    vi.mocked(programService.list).mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });
    vi.mocked(academicYearService.list).mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });
    vi.mocked(semesterService.list).mockResolvedValue({
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });

    render(<AssessmentPage />);

    expect(screen.getByText("Assessment / Billing")).toBeInTheDocument();
    expect(screen.getByText("Assessment")).toBeInTheDocument();
  });
});
