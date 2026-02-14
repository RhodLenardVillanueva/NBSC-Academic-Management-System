// frontend/src/features/course-offerings/components/course-offering-form-dialog.tsx
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
  CourseOfferingFormValues,
  CourseOfferingPayload,
} from "../types/course-offering-types";

type Option = {
  value: string;
  label: string;
};

type SemesterOption = Option & {
  academicYearId: number;
};

type CourseOfferingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: CourseOfferingFormValues;
  isSubmitting: boolean;
  subjectOptions: Option[];
  instructorOptions: Option[];
  academicYearOptions: Option[];
  semesterOptions: SemesterOption[];
  isReferenceLoading: boolean;
  onSubmit: (payload: CourseOfferingPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof CourseOfferingFormValues, string>>;

const defaultValues: CourseOfferingFormValues = {
  subject_id: "",
  instructor_id: "",
  academic_year_id: "",
  semester_id: "",
  section: "",
  schedule: "",
  room: "",
  max_slots: "50",
  slots_taken: "0",
  is_active: "true",
};

const parseInteger = (value: string): number => Number(value);

const validateValues = (values: CourseOfferingFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};

  const subjectId = parseInteger(values.subject_id);
  if (!values.subject_id.trim()) {
    errors.subject_id = "Subject is required.";
  } else if (!Number.isInteger(subjectId) || subjectId <= 0) {
    errors.subject_id = "Subject must be valid.";
  }

  const instructorId = parseInteger(values.instructor_id);
  if (!values.instructor_id.trim()) {
    errors.instructor_id = "Instructor is required.";
  } else if (!Number.isInteger(instructorId) || instructorId <= 0) {
    errors.instructor_id = "Instructor must be valid.";
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

  if (!values.section.trim()) {
    errors.section = "Section is required.";
  } else if (values.section.trim().length > 20) {
    errors.section = "Section must be 20 characters or less.";
  }

  const maxSlots = parseInteger(values.max_slots);
  if (!Number.isInteger(maxSlots) || maxSlots < 1) {
    errors.max_slots = "Capacity must be at least 1.";
  }

  const slotsTaken = parseInteger(values.slots_taken);
  if (Number.isInteger(maxSlots) && Number.isInteger(slotsTaken) && maxSlots < slotsTaken) {
    errors.max_slots = "Capacity cannot be less than enrolled count.";
  }

  if (values.is_active !== "true" && values.is_active !== "false") {
    errors.is_active = "Status is required.";
  }

  return errors;
};

export function CourseOfferingFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  subjectOptions,
  instructorOptions,
  academicYearOptions,
  semesterOptions,
  isReferenceLoading,
  onSubmit,
}: CourseOfferingFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<CourseOfferingFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

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

  const handleChange = (field: keyof CourseOfferingFormValues) => (
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
    const nextErrors = validateValues(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: CourseOfferingPayload = {
      subject_id: parseInteger(values.subject_id),
      instructor_id: parseInteger(values.instructor_id),
      academic_year_id: parseInteger(values.academic_year_id),
      semester_id: parseInteger(values.semester_id),
      section: values.section.trim(),
      schedule: values.schedule.trim() ? values.schedule.trim() : null,
      room: values.room.trim() ? values.room.trim() : null,
      max_slots: parseInteger(values.max_slots),
      is_active: values.is_active === "true",
    };

    await onSubmit(payload);
  };

  const canSubmit =
    subjectOptions.length > 0 &&
    instructorOptions.length > 0 &&
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
              <Label htmlFor="subject_id">Subject</Label>
              <Select
                id="subject_id"
                value={values.subject_id}
                onChange={handleChange("subject_id")}
                disabled={isReferenceLoading}
              >
                <option value="">
                  {isReferenceLoading ? "Loading subjects..." : "Select subject"}
                </option>
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.subject_id ? (
                <span className="text-xs text-red-600">{errors.subject_id}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instructor_id">Instructor</Label>
              <Select
                id="instructor_id"
                value={values.instructor_id}
                onChange={handleChange("instructor_id")}
                disabled={isReferenceLoading}
              >
                <option value="">
                  {isReferenceLoading ? "Loading instructors..." : "Select instructor"}
                </option>
                {instructorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.instructor_id ? (
                <span className="text-xs text-red-600">{errors.instructor_id}</span>
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
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={values.section}
                onChange={handleChange("section")}
                required
              />
              {errors.section ? (
                <span className="text-xs text-red-600">{errors.section}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="max_slots">Capacity</Label>
              <Input
                id="max_slots"
                type="number"
                min={1}
                value={values.max_slots}
                onChange={handleChange("max_slots")}
                required
              />
              {errors.max_slots ? (
                <span className="text-xs text-red-600">{errors.max_slots}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="slots_taken">Enrolled Count</Label>
              <Input
                id="slots_taken"
                type="number"
                min={0}
                value={values.slots_taken}
                readOnly
                disabled
              />
              <span className="text-xs text-slate-500">Auto-calculated from enrollments.</span>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule">Schedule (optional)</Label>
              <Input
                id="schedule"
                value={values.schedule}
                onChange={handleChange("schedule")}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="room">Room (optional)</Label>
              <Input id="room" value={values.room} onChange={handleChange("room")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                id="is_active"
                value={values.is_active}
                onChange={handleChange("is_active")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              {errors.is_active ? (
                <span className="text-xs text-red-600">{errors.is_active}</span>
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
