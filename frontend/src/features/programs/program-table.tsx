// frontend/src/features/programs/program-table.tsx
import { Button } from "../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import type { Program } from "./program-types";

type ProgramsTableProps = {
  programs: Program[];
  isLoading: boolean;
  onEdit: (program: Program) => void;
  onDelete: (program: Program) => void;
};

export function ProgramsTable({
  programs,
  isLoading,
  onEdit,
  onDelete,
}: ProgramsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                Loading programs...
              </TableCell>
            </TableRow>
          ) : programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                No programs found.
              </TableCell>
            </TableRow>
          ) : (
            programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell className="font-medium text-slate-900">
                  {program.code}
                </TableCell>
                <TableCell>{program.name}</TableCell>
                <TableCell>{program.description?.trim() || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="info"
                      className="px-3 py-1.5"
                      onClick={() => onEdit(program)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => onDelete(program)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
