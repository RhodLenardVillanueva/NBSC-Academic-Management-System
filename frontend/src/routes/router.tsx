// frontend/src/routes/router.tsx
import { createRouter } from "@tanstack/react-router";
import { academicYearsRoute } from "./academic-years";
import { assessmentRoute } from "./assessment";
import { assessmentSummaryRoute } from "./assessment-summary";
import { courseOfferingsRoute } from "./course-offerings";
import { dashboardRoute } from "./dashboard";
import { enrollmentAssessmentRoute } from "./enrollment-assessment";
import { enrollmentDetailRoute } from "./enrollment-detail";
import { enrollmentsRoute } from "./enrollments";
import { facultyRoute } from "./faculty";
import { facultyGradesDetailRoute } from "./faculty-grades-detail";
import { facultyGradesRoute } from "./faculty-grades";
import { loginRoute } from "./login";
import { programsRoute } from "./programs";
import { protectedRoute } from "./protected-route";
import { rootRoute } from "./root";
import { semestersRoute } from "./semesters";
import { studentsRoute } from "./students";
import { subjectsRoute } from "./subjects";
import { transcriptRoute } from "./transcript";

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    assessmentRoute,
    assessmentSummaryRoute,
    studentsRoute,
    programsRoute,
    subjectsRoute,
    facultyRoute,
    facultyGradesRoute,
    facultyGradesDetailRoute,
    academicYearsRoute,
    semestersRoute,
    courseOfferingsRoute,
    enrollmentsRoute,
    enrollmentDetailRoute,
    enrollmentAssessmentRoute,
    transcriptRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
