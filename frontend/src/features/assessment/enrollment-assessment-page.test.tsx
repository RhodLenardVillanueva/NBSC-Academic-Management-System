/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/assessment/enrollment-assessment-page.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnrollmentAssessmentPage } from "./enrollment-assessment-page";
import { enrollmentService } from "../enrollments/enrollment-service";
import { assessmentService } from "./assessment-service";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../enrollments/enrollment-service", () => ({
  enrollmentService: {
    cor: vi.fn(),
  },
}));

vi.mock("./assessment-service", () => ({
  assessmentService: {
    getByEnrollment: vi.fn(),
  },
}));

describe("EnrollmentAssessmentPage", () => {
  it("renders assessment data", async () => {
    const corMock = vi.mocked(enrollmentService);
    corMock.cor.mockResolvedValue({
      enrollment_id: 1,
      enrollment: {
        id: 1,
        year_level: 2,
        status: "enrolled",
        total_units: 6,
      },
      student: {
        id: 1,
        student_number: "2026-0001",
        first_name: "Ana",
        last_name: "Santos",
      },
      program: {
        id: 2,
        name: "BS Information Technology",
      },
      academic_year: {
        id: 3,
        name: "2026-2027",
      },
      semester: {
        id: 4,
        name: "1st Semester",
      },
      subjects: [
        {
          enrollment_subject_id: 10,
          course_offering_id: 20,
          subject_code: "CS401",
          subject_title: "Software Engineering",
          units: 3,
          section: "A",
          schedule: "MWF 9:00-10:00",
          room: "Room 401",
          faculty: "Carlos Reyes",
        },
      ],
      total_units: 6,
    });

    const assessmentMock = vi.mocked(assessmentService);
    assessmentMock.getByEnrollment.mockResolvedValue({
      id: 5,
      enrollment_id: 1,
      tuition: "15000.00",
      miscellaneous: "1500.00",
      other_fees: "500.00",
      discounts: "1000.00",
      net_total: "16000.00",
      total: "16000.00",
      grand_total: "16000.00",
      installments: [
        {
          id: 1,
          due_date: "2026-03-01",
          description: "Full payment",
          amount: "16000.00",
          paid_amount: "0.00",
          outstanding: "16000.00",
          is_paid: false,
        },
      ],
      adjustments: [],
    });

    render(<EnrollmentAssessmentPage enrollmentId={1} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Assessment of Fees", level: 1 }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Installment Schedule")).toBeInTheDocument();
  });
});
