// frontend/src/features/faculty/components/faculty-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { FacultyMember } from "../types/faculty-types";

type FacultyTableProps = {
  faculty: FacultyMember[];
  isLoading: boolean;
  onEdit: (member: FacultyMember) => void;
  onDelete: (member: FacultyMember) => void;
};

export function FacultyTable({
  faculty,
  isLoading,
  onEdit,
  onDelete,
}: FacultyTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                Loading faculty...
              </TableCell>
            </TableRow>
          ) : faculty.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                No faculty found.
              </TableCell>
            </TableRow>
          ) : (
            faculty.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium text-slate-900">
                  {member.employee_number}
                </TableCell>
                <TableCell>{`${member.first_name} ${member.last_name}`}</TableCell>
                <TableCell>{member.email ?? "-"}</TableCell>
                <TableCell>{member.department || "-"}</TableCell>
                <TableCell>
                  <span
                    className={
                      member.status === "active" ? "text-emerald-600" : "text-slate-500"
                    }
                  >
                    {member.status === "active" ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="info"
                      className="px-3 py-1.5"
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => onDelete(member)}
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
