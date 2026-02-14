/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/academic-years/academic-years-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AcademicYearsPage } from "./academic-years-page";
import { academicYearService } from "./academic-year-service";
import { useAcademicYears } from "./hooks/use-academic-years";
import type { AcademicYear } from "./types/academic-year-types";

type UseAcademicYearsReturn = ReturnType<typeof useAcademicYears>;

vi.mock("./academic-year-service", () => ({
  academicYearService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("./hooks/use-academic-years", () => ({
  useAcademicYears: vi.fn(),
}));

const sampleAcademicYear: AcademicYear = {
  id: 4,
  name: "2024-2025",
  is_active: true,
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseAcademicYearsState = (
  overrides?: Partial<UseAcademicYearsReturn>,
): UseAcademicYearsReturn => ({
  academicYears: [sampleAcademicYear],
  pagination: {
    data: [sampleAcademicYear],
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

describe("AcademicYearsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an academic year from the dialog", async () => {
    const state = buildUseAcademicYearsState();
    const useAcademicYearsMock = vi.mocked(useAcademicYears);
    useAcademicYearsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(academicYearService);
    serviceMock.create.mockResolvedValue(sampleAcademicYear);

    render(<AcademicYearsPage />);

    const [addButton] = screen.getAllByRole("button", { name: "Add Academic Year" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Year Start"), {
      target: { value: "2026" },
    });
    fireEvent.change(screen.getByLabelText("Year End"), {
      target: { value: "2027" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        name: "2026-2027",
        is_active: false,
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("prevents deleting the current academic year", () => {
    const state = buildUseAcademicYearsState();
    const useAcademicYearsMock = vi.mocked(useAcademicYears);
    useAcademicYearsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(academicYearService);

    render(<AcademicYearsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByText(
        "Cannot delete the current academic year. Set another year as current first.",
      ),
    ).toBeInTheDocument();
    expect(serviceMock.remove).not.toHaveBeenCalled();
  });
});
