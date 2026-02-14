// frontend/src/features/assessment/types/assessment-types.ts
// Assessment type definitions for billing and payments.

export type EnrollmentStatus = "enrolled" | "cancelled" | "completed";

export type CorSubject = {
  enrollment_subject_id: number | null;
  course_offering_id: number | null;
  subject_code: string | null;
  subject_title: string | null;
  units: number | null;
  section: string | null;
  schedule?: string | null;
  room?: string | null;
  faculty?: string | null;
};

export type AssessmentCor = {
  enrollment_id: number;
  enrollment?: {
    id: number;
    year_level: number;
    status: EnrollmentStatus;
    total_units: number;
  };
  student: {
    id: number | null;
    student_number: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  program: {
    id: number | null;
    name: string | null;
  };
  academic_year: {
    id: number | null;
    name: string | null;
  };
  semester: {
    id: number | null;
    name: string | null;
  };
  subjects: CorSubject[];
  total_units: number;
};

export type Adjustment = {
  id: number;
  description: string;
  amount: string;
};

export type Installment = {
  id: number;
  due_date: string | null;
  description: string;
  amount: string;
  paid_amount: string;
  outstanding: string;
  is_paid: boolean;
};

export type AssessmentBreakdown = {
  tuition: string;
  miscellaneous: string;
  other_fees: string;
  discounts: string;
  net_total?: string;
  total: string;
  grand_total?: string;
};

export type Assessment = AssessmentBreakdown & {
  id: number;
  enrollment_id: number;
  installments: Installment[];
  adjustments: Adjustment[];
};

export type AssessmentSummary = AssessmentBreakdown & {
  assessment_id: number;
  adjustments: Adjustment[];
  installments: Installment[];
  total_paid: string;
  total_outstanding: string;
};

export type Payment = {
  id: number;
  assessment_installment_id: number;
  amount: string;
  paid_at: string;
  receipt_number: string;
  cashier_id: number;
};

export type AssessmentCreatePayload = {
  tuition_amount: number;
  miscellaneous_amount: number;
  other_fees_amount: number;
  discount_amount: number;
  adjustments?: Array<{
    description: string;
    amount: number;
  }>;
};

export type InstallmentPlanType = "full" | "custom" | "default";

export type InstallmentPlanPayload = {
  plan_type: InstallmentPlanType;
  due_date?: string;
  description?: string;
  installments?: Array<{
    due_date: string;
    description: string;
    amount: number;
  }>;
  start_date?: string;
  interval_days?: number;
};

export type PaymentPayload = {
  amount: number;
  paid_at: string;
  receipt_number: string;
};

export type EnrollmentAssessment = Assessment;
