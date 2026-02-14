/// <reference types="@testing-library/jest-dom" />
// frontend/src/features/programs/programs-page.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgramsPage } from "./programs-page";
import { programService } from "./program-service";
import { usePrograms } from "./use-programs";
import type { Program } from "./program-types";

type UseProgramsReturn = ReturnType<typeof usePrograms>;

vi.mock("./program-service", () => ({
  programService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("./use-programs", () => ({
  usePrograms: vi.fn(),
}));

const sampleProgram: Program = {
  id: 7,
  code: "BSA",
  name: "Accountancy",
  description: "Accounting program",
  created_at: "2026-02-01T08:00:00Z",
  updated_at: "2026-02-01T08:00:00Z",
};

const buildUseProgramsState = (overrides?: Partial<UseProgramsReturn>): UseProgramsReturn => ({
  programs: [sampleProgram],
  pagination: {
    data: [sampleProgram],
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

describe("ProgramsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a program from the dialog", async () => {
    const state = buildUseProgramsState();
    const useProgramsMock = vi.mocked(usePrograms);
    useProgramsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(programService);
    serviceMock.create.mockResolvedValue(sampleProgram);

    render(<ProgramsPage />);

    const [addButton] = screen.getAllByRole("button", { name: "Add Program" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Program Code"), {
      target: { value: "BSBA" },
    });
    fireEvent.change(screen.getByLabelText("Program Name"), {
      target: { value: "Business Administration" },
    });

    const saveButton = screen.getByRole("button", { name: "Save" });
    const form = saveButton.closest("form");
    if (!form) {
      throw new Error("Form not found");
    }
    fireEvent.submit(form);

    await waitFor(() => {
      expect(serviceMock.create).toHaveBeenCalledWith({
        code: "BSBA",
        name: "Business Administration",
        description: null,
      });
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });

  it("deletes a program after confirmation", async () => {
    const state = buildUseProgramsState();
    const useProgramsMock = vi.mocked(usePrograms);
    useProgramsMock.mockReturnValue(state);

    const serviceMock = vi.mocked(programService);
    serviceMock.remove.mockResolvedValue(undefined);

    render(<ProgramsPage />);

    const [tableDeleteButton] = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(tableDeleteButton);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons.length).toBeGreaterThan(1);
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(serviceMock.remove).toHaveBeenCalledWith(sampleProgram.id);
    });

    await waitFor(() => {
      expect(state.refresh).toHaveBeenCalled();
    });
  });
});
