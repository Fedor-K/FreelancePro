import { cn } from "@/lib/utils";

type ProjectStatus = "New" | "In Progress" | "Paid" | "Completed";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusClasses = {
  "New": "status-new",
  "In Progress": "status-in-progress",
  "Paid": "status-paid",
  "Completed": "status-completed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full", 
        statusClasses[status], 
        className
      )}
    >
      {status}
    </span>
  );
}
