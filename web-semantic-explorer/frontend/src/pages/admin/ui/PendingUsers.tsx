import { Skeleton } from "@/shared/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

const PendingUsers = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Nombre completo</TableHead>
        <TableHead>Correo electrónico</TableHead>
        <TableHead>Rol</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>
          <span className="sr-only">Acciones</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-none" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-none" />
              <Skeleton className="h-4 w-12" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="size-8 rounded-none" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default PendingUsers
