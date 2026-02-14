// frontend/src/features/assessment/enrollment-assessment-page.tsx
import { AssessmentPage } from "./pages/assessment-page";

type EnrollmentAssessmentPageProps = {
  enrollmentId: number;
};

export function EnrollmentAssessmentPage({
  enrollmentId,
}: EnrollmentAssessmentPageProps): JSX.Element {
  return <AssessmentPage enrollmentId={enrollmentId} />;
}
