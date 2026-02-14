// frontend/src/features/transcript/transcript-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Select } from "../../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import { programService } from "../programs/program-service";
import type { Program } from "../programs/program-types";
import { studentService } from "../students/student-service";
import type { Student } from "../students/types/student-types";
import { transcriptService } from "./transcript-service";
import type { Transcript, TranscriptSemester } from "./types/transcript-types";

const formatNumber = (value: number | null, decimals = 2): string => {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(decimals);
};

const formatUnits = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return value.toString();
};

export function TranscriptPage(): JSX.Element {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsStudentsLoading(true);
    setStudentsError(null);
    try {
      const result = await studentService.list({
        page: 1,
        search: studentQuery || undefined,
      });
      setStudents(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load students.";
      setStudentsError(message);
    } finally {
      setIsStudentsLoading(false);
    }
  }, [studentQuery]);

  const loadPrograms = useCallback(async () => {
    setIsProgramsLoading(true);
    try {
      const result = await programService.list({ page: 1 });
      setPrograms(result.data);
    } catch {
      setPrograms([]);
    } finally {
      setIsProgramsLoading(false);
    }
  }, []);

  const loadTranscript = useCallback(async (studentId: number) => {
    setIsTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const result = await transcriptService.get(studentId);
      setTranscript(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load transcript.";
      setTranscriptError(message);
      setTranscript(null);
    } finally {
      setIsTranscriptLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (!selectedStudentId) {
      setTranscript(null);
      setTranscriptError(null);
      return;
    }
    void loadTranscript(Number(selectedStudentId));
  }, [selectedStudentId, loadTranscript]);

  const programLookup = useMemo(
    () => new Map(programs.map((program) => [program.id, `${program.code} - ${program.name}`])),
    [programs],
  );

  const studentOptions = useMemo(() => {
    return students.map((student) => {
      const programLabel = student.program_id
        ? programLookup.get(student.program_id)
        : null;
      const nameLabel = `${student.student_number} - ${student.last_name}, ${student.first_name}`;
      return {
        value: student.id.toString(),
        label: programLabel ? `${nameLabel} • ${programLabel}` : nameLabel,
      };
    });
  }, [students, programLookup]);

  const selectedStudent = useMemo(() => {
    const studentId = Number(selectedStudentId);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return null;
    }
    return students.find((student) => student.id === studentId) ?? null;
  }, [students, selectedStudentId]);

  const selectedProgramName = useMemo(() => {
    if (!selectedStudent?.program_id) {
      return "—";
    }
    return programLookup.get(selectedStudent.program_id) ?? "—";
  }, [programLookup, selectedStudent]);

  const handleSearch = (): void => {
    setStudentQuery(studentSearch.trim());
  };

  const handleRefresh = (): void => {
    void loadStudents();
    if (selectedStudentId) {
      void loadTranscript(Number(selectedStudentId));
    }
  };

  const renderSemesterTable = (semester: TranscriptSemester): JSX.Element => {
    const totalUnits = semester.subjects.reduce(
      (sum, subject) => sum + (subject.units ?? 0),
      0,
    );

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-800">
            {semester.academic_year.name ?? "Academic Year"} •{" "}
            {semester.semester.name ?? "Semester"}
          </div>
          <div className="text-sm text-slate-600">
            Semester GWA:{" "}
            <span className="font-semibold text-slate-900">
              {formatNumber(semester.semester_gwa)}
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-20 text-center">Units</TableHead>
                <TableHead className="w-28 text-center">Numeric</TableHead>
                <TableHead className="w-28 text-center">4.0 Eq.</TableHead>
                <TableHead className="w-32 text-center">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semester.subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-slate-500">
                    No subjects recorded for this term.
                  </TableCell>
                </TableRow>
              ) : (
                semester.subjects.map((subject, index) => (
                  <TableRow key={`${subject.code ?? "subject"}-${index}`}>
                    <TableCell className="font-medium text-slate-900">
                      {subject.code ?? "—"}
                    </TableCell>
                    <TableCell>{subject.title ?? "—"}</TableCell>
                    <TableCell className="text-center">{formatUnits(subject.units)}</TableCell>
                    <TableCell className="text-center">
                      {formatNumber(subject.percentage)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(subject.equivalent_grade)}
                    </TableCell>
                    <TableCell className="text-center">
                      {subject.remarks ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={2} className="text-right text-xs uppercase text-slate-500">
                  Total Units
                </TableCell>
                <TableCell className="text-center font-semibold text-slate-900">
                  {totalUnits}
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transcript</h1>
          <p className="text-sm text-slate-600">
            View official academic records and grade summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.print()}
            disabled={!transcript || isTranscriptLoading}
          >
            Print
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <div className="flex min-w-[220px] flex-col gap-2">
          <Label htmlFor="student_search">Search Students</Label>
          <Input
            id="student_search"
            placeholder="Search by number or name"
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSearch}
          disabled={isStudentsLoading}
        >
          Search
        </Button>
        <div className="flex min-w-[260px] flex-col gap-2">
          <Label htmlFor="student_id">Student</Label>
          <Select
            id="student_id"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            disabled={isStudentsLoading || isProgramsLoading}
          >
            <option value="">
              {isStudentsLoading ? "Loading students..." : "Select student"}
            </option>
            {studentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleRefresh}
          disabled={isStudentsLoading}
        >
          Refresh
        </Button>
      </div>

      {studentsError ? (
        <Alert>
          <AlertDescription>{studentsError}</AlertDescription>
        </Alert>
      ) : null}

      {transcriptError ? (
        <Alert>
          <AlertDescription>{transcriptError}</AlertDescription>
        </Alert>
      ) : null}

      {isTranscriptLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading transcript...
        </div>
      ) : transcript ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                NBS College
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Transcript of Records
              </h2>
              <p className="text-sm text-slate-600">Official Academic Record</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Student
              </p>
              <p className="text-base font-semibold text-slate-900">
                {transcript.student.last_name}, {transcript.student.first_name}
              </p>
              <p className="text-sm text-slate-600">{transcript.student.student_number}</p>
            </div>
          </div>

          <div className="grid gap-4 pb-6 pt-4 text-sm text-slate-600 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Program</p>
              <p className="text-sm font-medium text-slate-900">{selectedProgramName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Semesters</p>
              <p className="text-sm font-medium text-slate-900">
                {transcript.semesters.length}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Overall GWA</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatNumber(transcript.cumulative_gwa)}
              </p>
            </div>
          </div>

          {transcript.semesters.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
              No transcript records available for this student.
            </div>
          ) : (
            <div className="space-y-6">
              {transcript.semesters.map((semester, index) => (
                <div key={`${semester.academic_year.id ?? "year"}-${semester.semester.id ?? "sem"}-${index}`}>
                  {renderSemesterTable(semester)}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 pt-4">
            <div className="text-sm text-slate-600">Overall GWA</div>
            <div className="text-lg font-semibold text-slate-900">
              {formatNumber(transcript.cumulative_gwa)}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Select a student to view the transcript.
        </div>
      )}
    </div>
  );
}
