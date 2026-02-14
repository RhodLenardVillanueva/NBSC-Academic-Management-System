// frontend/src/features/enrollments/components/enrollment-form-dialog.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type {
  EnrollmentFormValues,
  EnrollmentPayload,
} from "../types/enrollment-types";

type Option = {
  value: string;
  label: string;
};

type StudentOption = Option & {
  programId: number | null;
};

type SemesterOption = Option & {
  academicYearId: number;
};

type EnrollmentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: EnrollmentFormValues;
  isSubmitting: boolean;
  studentOptions: StudentOption[];
  programLookup: Map<number, string>;
  academicYearOptions: Option[];
  semesterOptions: SemesterOption[];
  isReferenceLoading: boolean;
  onSubmit: (payload: EnrollmentPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof EnrollmentFormValues | "program_id", string>>;

const defaultValues: EnrollmentFormValues = {
  student_id: "",
  academic_year_id: "",
  semester_id: "",
  year_level: "1",
  status: "enrolled",
};

const parseInteger = (value: string): number => Number(value);

const validateValues = (
  values: EnrollmentFormValues,
  studentOptions: StudentOption[],
): ValidationErrors => {
  const errors: ValidationErrors = {};

  const studentId = parseInteger(values.student_id);
  if (!values.student_id.trim()) {
    errors.student_id = "Student is required.";
  } else if (!Number.isInteger(studentId) || studentId <= 0) {
    errors.student_id = "Student must be valid.";
  }

  const selectedStudent = studentOptions.find((option) => option.value === values.student_id);
  if (selectedStudent && selectedStudent.programId === null) {
    errors.program_id = "Selected student has no program assigned.";
  }

  const academicYearId = parseInteger(values.academic_year_id);
  if (!values.academic_year_id.trim()) {
    errors.academic_year_id = "Academic year is required.";
  } else if (!Number.isInteger(academicYearId) || academicYearId <= 0) {
    errors.academic_year_id = "Academic year must be valid.";
  }

  const semesterId = parseInteger(values.semester_id);
  if (!values.semester_id.trim()) {
    errors.semester_id = "Semester is required.";
  } else if (!Number.isInteger(semesterId) || semesterId <= 0) {
    errors.semester_id = "Semester must be valid.";
  }

  const yearLevel = parseInteger(values.year_level);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 10) {
    errors.year_level = "Year level must be between 1 and 10.";
  }

  if (!values.status) {
    errors.status = "Status is required.";
  }

  return errors;
};

export function EnrollmentFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  studentOptions,
  programLookup,
  academicYearOptions,
  semesterOptions,
  isReferenceLoading,
  onSubmit,
}: EnrollmentFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<EnrollmentFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const selectedStudent = useMemo(
    () => studentOptions.find((option) => option.value === values.student_id),
    [studentOptions, values.student_id],
  );

  const programName = useMemo(() => {
    if (!selectedStudent || selectedStudent.programId === null) {
      return "";
    }
    return programLookup.get(selectedStudent.programId) ?? "";
  }, [selectedStudent, programLookup]);

  const filteredSemesterOptions = useMemo(() => {
    const academicYearId = parseInteger(values.academic_year_id);
    if (!Number.isInteger(academicYearId) || academicYearId <= 0) {
      return semesterOptions;
    }
    return semesterOptions.filter(
      (option) => option.academicYearId === academicYearId,
    );
  }, [values.academic_year_id, semesterOptions]);

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof EnrollmentFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const nextValue = event.target.value;

    if (field === "academic_year_id") {
      const selectedYear = parseInteger(nextValue);
      const semesterId = parseInteger(values.semester_id);
      const semesterValid = semesterOptions.some(
        (option) => option.academicYearId === selectedYear && Number(option.value) === semesterId,
      );
      setValues((prev) => ({
        ...prev,
        academic_year_id: nextValue,
        semester_id: semesterValid ? prev.semester_id : "",
      }));
      return;
    }

    setValues((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validateValues(values, studentOptions);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const studentId = parseInteger(values.student_id);
    const selected = studentOptions.find((option) => option.value === values.student_id);
    const programId = selected?.programId ?? null;

    if (!programId) {
      setErrors((prev) => ({
        ...prev,
        program_id: "Selected student has no program assigned.",
      }));
      return;
    }

    const payload: EnrollmentPayload = {
      student_id: studentId,
      program_id: programId,
      academic_year_id: parseInteger(values.academic_year_id),
      semester_id: parseInteger(values.semester_id),
      year_level: parseInteger(values.year_level),
      status: values.status,
    };

    await onSubmit(payload);
  };

  const canSubmit =
    studentOptions.length > 0 &&
    academicYearOptions.length > 0 &&
    !isReferenceLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">{title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student_id">Student</Label>
              <Select
                id="student_id"
                value={values.student_id}
                onChange={handleChange("student_id")}
                disabled={isReferenceLoading}
              >
                <option value="">
                  {isReferenceLoading ? "Loading students..." : "Select student"}
                </option>
                {studentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.student_id ? (
                <span className="text-xs text-red-600">{errors.student_id}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="program_name">Program (from student)</Label>
              <Input id="program_name" value={programName} disabled />
              {errors.program_id ? (
                <span className="text-xs text-red-600">{errors.program_id}</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="academic_year_id">Academic Year</Label>
              <Select
                id="academic_year_id"
                value={values.academic_year_id}
                onChange={handleChange("academic_year_id")}
                disabled={isReferenceLoading}
              >
                <option value="">
                  {isReferenceLoading ? "Loading academic years..." : "Select academic year"}
                </option>
                {academicYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.academic_year_id ? (
                <span className="text-xs text-red-600">{errors.academic_year_id}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="semester_id">Semester</Label>
              <Select
                id="semester_id"
                value={values.semester_id}
                onChange={handleChange("semester_id")}
                disabled={isReferenceLoading}
              >
                <option value="">
                  {isReferenceLoading
                    ? "Loading semesters..."
                    : filteredSemesterOptions.length === 0
                      ? "No semesters for selected year"
                      : "Select semester"}
                </option>
                {filteredSemesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.semester_id ? (
                <span className="text-xs text-red-600">{errors.semester_id}</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year_level">Year Level</Label>
              <Input
                id="year_level"
                type="number"
                min={1}
                max={10}
                value={values.year_level}
                onChange={handleChange("year_level")}
                required
              />
              {errors.year_level ? (
                <span className="text-xs text-red-600">{errors.year_level}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={values.status} onChange={handleChange("status")}>
                <option value="enrolled">Enrolled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </Select>
              {errors.status ? (
                <span className="text-xs text-red-600">{errors.status}</span>
              ) : null}
            </div>
          </div>

          <DialogFooter className="px-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
