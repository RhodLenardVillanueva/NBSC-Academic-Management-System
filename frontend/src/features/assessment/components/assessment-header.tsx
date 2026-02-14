// frontend/src/features/assessment/components/assessment-header.tsx
// Assessment header for COR-style print layout.

import type { EnrollmentStatus } from "../types/assessment-types";

const statusLabels: Record<EnrollmentStatus, string> = {
  enrolled: "Enrolled",
  cancelled: "Cancelled",
  completed: "Completed",
};

type AssessmentHeaderProps = {
  studentNumber: string;
  studentName: string;
  programName: string;
  yearLevel: number | null;
  academicYear: string;
  semester: string;
  status: EnrollmentStatus | string;
};

export function AssessmentHeader({
  studentNumber,
  studentName,
  programName,
  yearLevel,
  academicYear,
  semester,
  status,
}: AssessmentHeaderProps): JSX.Element {
  const statusLabel = statusLabels[status as EnrollmentStatus] ?? status;

  return (
    <div className="space-y-4 border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <img
            src="/nbslogo.png"
            alt="NBS College"
            className="h-14 w-14 object-contain"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              NBS College
            </p>
            <p className="text-sm font-semibold text-slate-900">
              NBS Educational Services, Inc.
            </p>
            <img
              src="/nmadrs.png"
              alt="NBS College Address"
              className="mt-1 h-8 object-contain"
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Certificate of Registration
          </p>
          <h2 className="text-xl font-semibold text-slate-900">Assessment of Fees</h2>
          <p className="text-xs text-slate-500">Official Enrollment Record</p>
        </div>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <p>
            <span className="font-medium text-slate-700">Student Number:</span> {studentNumber}
          </p>
          <p>
            <span className="font-medium text-slate-700">Student Name:</span> {studentName}
          </p>
          <p>
            <span className="font-medium text-slate-700">Program / Level:</span> {programName}
            {yearLevel ? ` - Year ${yearLevel}` : ""}
          </p>
        </div>
        <div className="space-y-1">
          <p>
            <span className="font-medium text-slate-700">Academic Year:</span> {academicYear}
          </p>
          <p>
            <span className="font-medium text-slate-700">Semester:</span> {semester}
          </p>
          <p>
            <span className="font-medium text-slate-700">Enrollment Status:</span> {statusLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
