import { cn } from "@/lib/utils";

type ProjectStatus = "New" | "In Progress" | "Paid" | "Completed" | "Delivered" | "Not started";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const statusClasses = {
  "New": "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Delivered": "bg-green-100 text-green-800",
  "Not started": "bg-gray-100 text-gray-800",
  "Paid": "bg-purple-100 text-purple-800",
  "Completed": "bg-green-100 text-green-800",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full", 
        statusClasses[status] || "bg-gray-100 text-gray-800", 
        className
      )}
    >
      {status}
    </span>
  );
}

// Label component for project labels
export type ProjectLabel = 
  | "Invoice sent" 
  | "Mark as paid" 
  | "Past" 
  | "Archive" 
  | "Make invoice" 
  | "Overdue" 
  | "To be delivered" 
  | "Deadline approaching";

interface ProjectLabelBadgeProps {
  label: ProjectLabel;
  className?: string;
}

const labelClasses = {
  "Invoice sent": "bg-blue-100 text-blue-800",
  "Mark as paid": "bg-purple-100 text-purple-800",
  "Past": "bg-gray-100 text-gray-800",
  "Archive": "bg-gray-100 text-gray-800",
  "Make invoice": "bg-yellow-100 text-yellow-800",
  "Overdue": "bg-red-100 text-red-800",
  "To be delivered": "bg-orange-100 text-orange-800",
  "Deadline approaching": "bg-amber-100 text-amber-800",
};

export function ProjectLabelBadge({ label, className }: ProjectLabelBadgeProps) {
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full", 
        labelClasses[label] || "bg-gray-100 text-gray-800", 
        className
      )}
    >
      {label}
    </span>
  );
}

// Language pair badge
interface LanguagePairBadgeProps {
  sourceLang: string;
  targetLang: string;
  className?: string;
}

export function LanguagePairBadge({ sourceLang, targetLang, className }: LanguagePairBadgeProps) {
  return (
    <span className={cn("inline-flex items-center text-xs font-medium", className)}>
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-l-full">{sourceLang}</span>
      <span className="px-1 py-1">›</span>
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-r-full">{targetLang}</span>
    </span>
  );
}
