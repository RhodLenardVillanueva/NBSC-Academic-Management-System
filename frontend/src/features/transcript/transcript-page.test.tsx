/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/transcript/transcript-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TranscriptPage } from "./transcript-page";
import { studentService } from "../students/student-service";
import { programService } from "../programs/program-service";
import { transcriptService } from "./transcript-service";

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

vi.mock("./transcript-service", () => ({
  transcriptService: {
    get: vi.fn(),
  },
}));

describe("TranscriptPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const studentServiceMock = vi.mocked(studentService);
    studentServiceMock.list.mockResolvedValue({
      data: [
        {
          id: 10,
          student_number: "2026-0009",
          first_name: "Lia",
          last_name: "Reyes",
          program_id: 2,
          year_level: 4,
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

    const transcriptServiceMock = vi.mocked(transcriptService);
    transcriptServiceMock.get.mockResolvedValue({
      student: {
        id: 10,
        student_number: "2026-0009",
        first_name: "Lia",
        last_name: "Reyes",
      },
      semesters: [
        {
          academic_year: { id: 1, name: "2026-2027" },
          semester: { id: 2, name: "1st Semester" },
          subjects: [
            {
              code: "CS601",
              title: "Capstone Planning",
              units: 3,
              percentage: 95,
              equivalent_grade: 3.75,
              remarks: "PASSED",
            },
          ],
          semester_gwa: 3.75,
        },
      ],
      cumulative_gwa: 3.75,
    });
  });

  it("loads and renders transcript for selected student", async () => {
    render(<TranscriptPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Student")).not.toBeDisabled();
    });

    fireEvent.change(screen.getByLabelText("Student"), {
      target: { value: "10" },
    });

    await waitFor(() => {
      expect(transcriptService.get).toHaveBeenCalledWith(10);
    });

    expect(screen.getByText("Transcript of Records")).toBeInTheDocument();
    expect(screen.getByText("CS601")).toBeInTheDocument();
    expect(screen.getAllByText("Overall GWA").length).toBeGreaterThan(0);
  });
});
