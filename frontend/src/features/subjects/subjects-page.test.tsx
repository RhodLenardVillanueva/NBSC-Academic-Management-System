/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/subjects/subjects-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SubjectsPage } from "./subjects-page";
import { subjectService } from "./subject-service";
import { useSubjects } from "./hooks/use-subjects";
import type { Subject } from "./types/subject-types";

type UseSubjectsReturn = ReturnType<typeof useSubjects>;

vi.mock("./subject-service", () => ({
  subjectService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  },
}));

vi.mock("./hooks/use-subjects", () => ({
  useSubjects: vi.fn(),
}));

const sampleSubject: Subject = {
  id: 10,
  code: "CS201",
  title: "Algorithms",
  units: 3,
  lecture_hours: 2,
  lab_hours: 1,
  is_active: true,
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseSubjectsState = (overrides?: Partial<UseSubjectsReturn>): UseSubjectsReturn => ({
  subjects: [sampleSubject],
  pagination: {
    data: [sampleSubject],
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

describe("SubjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles active status", async () => {
    const state = buildUseSubjectsState();
    const useSubjectsMock = vi.mocked(useSubjects);
    useSubjectsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(subjectService);
    serviceMock.update.mockResolvedValue(sampleSubject);

    render(<SubjectsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Deactivate" }));

    await waitFor(() => {
      expect(serviceMock.update).toHaveBeenCalledWith(sampleSubject.id, {
        code: sampleSubject.code,
        title: sampleSubject.title,
        units: sampleSubject.units,
        lecture_hours: sampleSubject.lecture_hours,
        lab_hours: sampleSubject.lab_hours,
        is_active: false,
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("creates a subject from the dialog", async () => {
    const state = buildUseSubjectsState();
    const useSubjectsMock = vi.mocked(useSubjects);
    useSubjectsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(subjectService);
    serviceMock.create.mockResolvedValue(sampleSubject);

    render(<SubjectsPage />);

    const [addButton] = screen.getAllByRole("button", { name: "Add Subject" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Subject Code"), {
      target: { value: "CS202" },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Operating Systems" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        code: "CS202",
        title: "Operating Systems",
        units: 1,
        lecture_hours: 0,
        lab_hours: 0,
        is_active: true,
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("deletes a subject after confirmation", async () => {
    const state = buildUseSubjectsState();
    const useSubjectsMock = vi.mocked(useSubjects);
    useSubjectsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(subjectService);
    serviceMock.remove.mockResolvedValue(undefined);

    render(<SubjectsPage />);

    const [tableDeleteButton] = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(tableDeleteButton);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons.length).toBeGreaterThan(1);
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(serviceMock.remove).toHaveBeenCalledWith(sampleSubject.id);
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });
});
