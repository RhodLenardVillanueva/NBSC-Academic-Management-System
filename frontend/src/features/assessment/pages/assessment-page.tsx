// frontend/src/features/assessment/pages/assessment-page.tsx
// COR-style assessment page with installments and payments.

import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import { useAuthStore } from "../../../app/auth/auth-store";
import { AssessmentCreateDialog } from "../components/assessment-create-dialog";
import { AdjustmentList } from "../components/adjustment-list";
import { AssessmentHeader } from "../components/assessment-header";
import { AssessmentSummaryCard } from "../components/assessment-summary-card";
import { InstallmentTable } from "../components/installment-table";
import { useAssessment } from "../hooks/use-assessment";
import type { AssessmentCreatePayload } from "../types/assessment-types";

type AssessmentPageProps = {
  enrollmentId: number;
};

export function AssessmentPage({ enrollmentId }: AssessmentPageProps): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    cor,
    assessment,
    isLoading,
    error,
    refresh,
    isCreating,
    createError,
    createAssessment,
  } = useAssessment(enrollmentId);

  const roles = user?.roles?.map((role) => role.name) ?? [];
  const isAdminOrRegistrar = roles.includes("Admin") || roles.includes("Registrar");
  const isCashier = roles.includes("Cashier");
  const canManageAssessment = isAdminOrRegistrar;
  const canProcessPayments = isAdminOrRegistrar || isCashier;

  const studentName = useMemo(() => {
    if (!cor?.student) {
      return "-";
    }
    const firstName = cor.student.first_name ?? "";
    const lastName = cor.student.last_name ?? "";
    const combined = `${lastName}, ${firstName}`.trim();
    return combined === "," ? "-" : combined.replace(/^, /, "");
  }, [cor]);

  const handleCreateAssessment = async (payload: AssessmentCreatePayload): Promise<void> => {
    await createAssessment(payload);
    setIsCreateOpen(false);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading assessment...
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cor) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Enrollment details not found.
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <p>No assessment available for this enrollment.</p>
          {canManageAssessment ? (
            <Button
              type="button"
              className="mt-4"
              onClick={() => setIsCreateOpen(true)}
            >
              Create Assessment
            </Button>
          ) : null}
          {createError ? <p className="mt-3 text-xs text-red-600">{createError}</p> : null}
        </div>
        <AssessmentCreateDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          isSubmitting={isCreating}
          errorMessage={createError}
          onSubmit={handleCreateAssessment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assessment of Fees</h1>
          <p className="text-sm text-slate-600">
            Official assessment summary for this enrollment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: `/assessments/${assessment.id}/summary` })}
          >
            View Summary
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl rounded-lg border border-slate-200 bg-white p-8 text-slate-900 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <AssessmentHeader
          studentNumber={cor.student.student_number ?? "-"}
          studentName={studentName}
          programName={cor.program.name ?? "-"}
          yearLevel={cor.enrollment?.year_level ?? null}
          academicYear={cor.academic_year.name ?? "-"}
          semester={cor.semester.name ?? "-"}
          status={cor.enrollment?.status ?? "-"}
        />

        <div className="space-y-3 border-b border-slate-200 py-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Enrolled Subjects
          </h3>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-16 text-center">Units</TableHead>
                  <TableHead className="w-20">Section</TableHead>
                  <TableHead className="w-40">Faculty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cor.subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-slate-500">
                      No subjects attached.
                    </TableCell>
                  </TableRow>
                ) : (
                  cor.subjects.map((subject, index) => (
                    <TableRow key={`${subject.subject_code ?? "subject"}-${index}`}>
                      <TableCell className="font-medium text-slate-900">
                        {subject.subject_code ?? "-"}
                      </TableCell>
                      <TableCell>{subject.subject_title ?? "-"}</TableCell>
                      <TableCell className="text-center">{subject.units ?? "-"}</TableCell>
                      <TableCell>{subject.section ?? "-"}</TableCell>
                      <TableCell>{subject.faculty ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={2} className="text-right text-xs uppercase text-slate-500">
                    Total Units
                  </TableCell>
                  <TableCell className="text-center font-semibold text-slate-900">
                    {cor.total_units}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid gap-6 pt-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <InstallmentTable
              assessmentId={assessment.id}
              totalAmount={assessment.total}
              installments={assessment.installments}
              canManageInstallments={canManageAssessment}
              canProcessPayments={canProcessPayments}
              onRefresh={refresh}
            />
          </div>

          <div className="space-y-4">
            <AssessmentSummaryCard breakdown={assessment} />
            <AdjustmentList adjustments={assessment.adjustments} />
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p className="font-semibold uppercase tracking-wide text-slate-400">
            Refund Policy
          </p>
          <p className="mt-2">
            Full refund of tuition and fees is allowed within the first week of classes,
            less administrative charges. After the first week, refund eligibility follows
            institutional guidelines and may be subject to pro-rated charges based on the
            official calendar.
          </p>
          <img
            src="/policyrefundfee.png"
            alt="Refund policy"
            className="mt-3 w-full max-w-sm"
          />
        </div>
      </div>

      <AssessmentCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isSubmitting={isCreating}
        errorMessage={createError}
        onSubmit={handleCreateAssessment}
      />
    </div>
  );
}
