# NBSC-SIMS – AI Development Guidelines

## Project Overview

This is a production-ready Student Information Management System (SIMS)
for NBS College (Philippines).

The system must be clean, scalable, secure, and deployable.

The college currently has ~200 students and operates manually.

This system will digitize:

- Admissions
- Student records
- Enrollment
- Grade computation
- Transcript generation
- Dashboards

---

## Architecture

### Backend

- Laravel 11 (API only)
- MySQL
- Laravel Sanctum (authentication)
- RESTful API
- JSON responses only

### Frontend

- React + TypeScript
- Vite
- TailwindCSS
- shadcn components
- Zustand (state management)
- @tanstack/react-router (routing)
- Vitest (testing)

---

## Naming Conventions

- kebab-case → folders/files
- \_kebab-case → shared/common feature modules
- -kebab-case → route domain modules
- PascalCase → classes and types
- snake_case → database tables and columns
- camelCase → functions, hooks, schemas

---

## Development Rules

- Do NOT generate the entire system at once.
- Generate only requested modules.
- Follow clean architecture.
- Use proper relationships in database.
- Use foreign keys.
- Use FormRequest validation in Laravel.
- Return structured JSON responses.
- Follow security best practices.
- Avoid over-engineering.
- Keep code production-ready.

---

## Grading System Logic

Grade Components:

- quizzes (25%)
- projects (25%)
- participation (20%)
- major_exams (30%)

Final numeric grade:
(quizzes \* 0.25)

- (projects \* 0.25)
- (participation \* 0.20)
- (major_exams \* 0.30)

Convert numeric grade to 4.0 scale:

97-100 => 4.0
95-96 => 3.75
92-94 => 3.50
90-91 => 3.25
88-89 => 3.00
86-87 => 2.75
83-85 => 2.50
81-82 => 2.25
79-80 => 2.00
77-78 => 1.75
74-76 => 1.50
71-73 => 1.25
70 => 1.00
Below 70 => 0

This logic must be implemented in a reusable service class.

---

## Code Quality Expectations

- Output files with clear file paths as comments.
- Include tests when applicable.
- Ensure naming conventions are respected.
- Ensure scalability and maintainability.
