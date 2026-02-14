// frontend/src/features/faculty/grade-workflow/grade-row.tsx
// Faculty grade workflow row for inline grade encoding.

import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import {
  TableCell,
  TableRow,
} from "../../../shared/ui/table";
import type { GradeDraft, GradeField, StudentGrade } from "./types/grade-types";

type GradeRowProps = {
  student: StudentGrade;
  draft: GradeDraft;
  isReadOnly: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  errors: Partial<Record<GradeField, string>>;
  onChange: (field: GradeField, value: string) => void;
  onSave: () => void;
};

type ComputedPreview = {
  finalNumeric: number | null;
  gradePoint: number | null;
  remarks: string | null;
};

const parseNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const computePreview = (draft: GradeDraft): ComputedPreview => {
  const quizzes = parseNumber(draft.quizzes);
  const projects = parseNumber(draft.projects);
  const participation = parseNumber(draft.participation);
  const majorExams = parseNumber(draft.major_exams);

  if (
    quizzes === null ||
    projects === null ||
    participation === null ||
    majorExams === null
  ) {
    return {
      finalNumeric: null,
      gradePoint: null,
      remarks: null,
    };
  }

  const finalNumeric =
    quizzes * 0.25 +
    projects * 0.25 +
    participation * 0.2 +
    majorExams * 0.3;

  const roundedFinal = Math.round(finalNumeric * 100) / 100;
  const gradePoint = mapGradePoint(roundedFinal);

  return {
    finalNumeric: roundedFinal,
    gradePoint,
    remarks: roundedFinal >= 70 ? "Passed" : "Failed",
  };
};

const mapGradePoint = (finalNumeric: number): number => {
  if (finalNumeric >= 97) return 4.0;
  if (finalNumeric >= 95) return 3.75;
  if (finalNumeric >= 92) return 3.5;
  if (finalNumeric >= 90) return 3.25;
  if (finalNumeric >= 88) return 3.0;
  if (finalNumeric >= 86) return 2.75;
  if (finalNumeric >= 83) return 2.5;
  if (finalNumeric >= 81) return 2.25;
  if (finalNumeric >= 79) return 2.0;
  if (finalNumeric >= 77) return 1.75;
  if (finalNumeric >= 74) return 1.5;
  if (finalNumeric >= 71) return 1.25;
  if (finalNumeric >= 70) return 1.0;
  return 0.0;
};

const formatNumber = (value: number | string | null): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(parsed)) {
    return "-";
  }
  return parsed.toFixed(2);
};

const formatText = (value: string | null): string => {
  if (!value) {
    return "-";
  }
  return value;
};

const parseNullableNumber = (value: string | null): number | null => {
  if (value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function GradeRow({
  student,
  draft,
  isReadOnly,
  isSaving,
  hasChanges,
  errors,
  onChange,
  onSave,
}: GradeRowProps): JSX.Element {
  const preview = computePreview(draft);
  const isSubmitted = student.is_submitted;
  const canEdit = !isReadOnly && !isSubmitted;

  const statusLabel = isSubmitted ? "Submitted" : hasChanges ? "Pending" : "Saved";
  const statusClass = isSubmitted
    ? "bg-emerald-100 text-emerald-700"
    : hasChanges
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";

  const finalNumeric = preview.finalNumeric ?? parseNullableNumber(student.final_numeric_grade);
  const gradePoint = preview.gradePoint ?? parseNullableNumber(student.grade_point);
  const remarks = preview.remarks ?? student.remarks;

  return (
    <TableRow>
      <TableCell className="text-slate-900">
        <div className="font-medium">{student.student.student_number ?? "-"}</div>
        <div className="text-xs text-slate-500">
          {student.student.last_name ?? "-"}, {student.student.first_name ?? ""}
        </div>
        <div className="text-xs text-slate-400">{student.student.program ?? ""}</div>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-1">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={draft.quizzes}
            onChange={(event) => onChange("quizzes", event.target.value)}
            disabled={!canEdit}
            className={errors.quizzes ? "border-red-500" : ""}
          />
          {errors.quizzes ? (
            <span className="text-xs text-red-600">{errors.quizzes}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-1">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={draft.projects}
            onChange={(event) => onChange("projects", event.target.value)}
            disabled={!canEdit}
            className={errors.projects ? "border-red-500" : ""}
          />
          {errors.projects ? (
            <span className="text-xs text-red-600">{errors.projects}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-1">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={draft.participation}
            onChange={(event) => onChange("participation", event.target.value)}
            disabled={!canEdit}
            className={errors.participation ? "border-red-500" : ""}
          />
          {errors.participation ? (
            <span className="text-xs text-red-600">{errors.participation}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="space-y-1">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            value={draft.major_exams}
            onChange={(event) => onChange("major_exams", event.target.value)}
            disabled={!canEdit}
            className={errors.major_exams ? "border-red-500" : ""}
          />
          {errors.major_exams ? (
            <span className="text-xs text-red-600">{errors.major_exams}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        {finalNumeric !== null ? formatNumber(finalNumeric) : "-"}
      </TableCell>
      <TableCell className="text-right font-medium">
        {gradePoint !== null ? formatNumber(gradePoint) : "-"}
      </TableCell>
      <TableCell>{formatText(remarks)}</TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-2">
          <span
            className={[
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusClass,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {statusLabel}
          </span>
          {isSubmitted && student.submitted_at ? (
            <span className="text-xs text-slate-500">
              {student.submitted_at.split("T")[0]}
            </span>
          ) : null}
          {canEdit ? (
            <Button
              type="button"
              variant="info"
              className="px-3 py-1.5"
              disabled={!hasChanges || isSaving || Object.keys(errors).length > 0}
              onClick={onSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
