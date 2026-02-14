// frontend/src/features/faculty/components/faculty-form-dialog.tsx
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
import type { FacultyFormValues, FacultyPayload } from "../types/faculty-types";

type FacultyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: FacultyFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: FacultyPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof FacultyFormValues, string>>;

const defaultValues: FacultyFormValues = {
  employee_number: "",
  first_name: "",
  last_name: "",
  email: "",
  department: "",
  status: "active",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateValues = (values: FacultyFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};
  const employeeNumber = values.employee_number.trim();
  const firstName = values.first_name.trim();
  const lastName = values.last_name.trim();
  const department = values.department.trim();
  const email = values.email.trim();

  if (!employeeNumber) {
    errors.employee_number = "Employee number is required.";
  } else if (employeeNumber.length > 50) {
    errors.employee_number = "Employee number must be 50 characters or less.";
  }

  if (!firstName) {
    errors.first_name = "First name is required.";
  } else if (firstName.length > 100) {
    errors.first_name = "First name must be 100 characters or less.";
  }

  if (!lastName) {
    errors.last_name = "Last name is required.";
  } else if (lastName.length > 100) {
    errors.last_name = "Last name must be 100 characters or less.";
  }

  if (email && !emailPattern.test(email)) {
    errors.email = "Email must be valid.";
  }

  if (!department) {
    errors.department = "Department is required.";
  } else if (department.length > 100) {
    errors.department = "Department must be 100 characters or less.";
  }

  if (values.status !== "active" && values.status !== "inactive") {
    errors.status = "Status is required.";
  }

  return errors;
};

export function FacultyFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  onSubmit,
}: FacultyFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<FacultyFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof FacultyFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validateValues(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: FacultyPayload = {
      employee_number: values.employee_number.trim(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim() ? values.email.trim() : null,
      department: values.department.trim(),
      status: values.status,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">{title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_employee">Employee Number</Label>
              <Input
                id="faculty_employee"
                value={values.employee_number}
                onChange={handleChange("employee_number")}
                required
              />
              {errors.employee_number ? (
                <span className="text-xs text-red-600">{errors.employee_number}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_department">Department</Label>
              <Input
                id="faculty_department"
                value={values.department}
                onChange={handleChange("department")}
                required
              />
              {errors.department ? (
                <span className="text-xs text-red-600">{errors.department}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_first_name">First Name</Label>
              <Input
                id="faculty_first_name"
                value={values.first_name}
                onChange={handleChange("first_name")}
                required
              />
              {errors.first_name ? (
                <span className="text-xs text-red-600">{errors.first_name}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_last_name">Last Name</Label>
              <Input
                id="faculty_last_name"
                value={values.last_name}
                onChange={handleChange("last_name")}
                required
              />
              {errors.last_name ? (
                <span className="text-xs text-red-600">{errors.last_name}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_email">Email</Label>
              <Input
                id="faculty_email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                placeholder="name@school.edu"
              />
              {errors.email ? (
                <span className="text-xs text-red-600">{errors.email}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="faculty_status">Status</Label>
              <Select
                id="faculty_status"
                value={values.status}
                onChange={handleChange("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
