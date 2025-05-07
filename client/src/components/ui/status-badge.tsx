import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "New" | "In Progress" | "Delivered" | "Not started" | "Paid" | "Completed";

export type ProjectLabel = 
  | "Invoice sent" 
  | "Mark as paid" 
  | "Past" 
  | "Overdue" 
  | "To be delivered" 
  | "Deadline approaching" 
  | "Make invoice";

interface StatusBadgeProps {
  status: StatusType;
}

interface ProjectLabelBadgeProps {
  label: ProjectLabel;
}

interface LanguagePairBadgeProps {
  sourceLang: string;
  targetLang: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColorClass = (status: StatusType) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Delivered":
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Not started":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Paid":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-medium",
        getStatusColorClass(status)
      )}
    >
      {status}
    </Badge>
  );
}

export function ProjectLabelBadge({ label }: ProjectLabelBadgeProps) {
  const getLabelColorClass = (label: ProjectLabel) => {
    switch (label) {
      case "Invoice sent":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Mark as paid":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Past":
        return "bg-gray-50 text-gray-600 border-gray-100";
      case "Overdue":
        return "bg-red-50 text-red-600 border-red-100";
      case "To be delivered":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Deadline approaching":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "Make invoice":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-sm border px-1.5 py-0.5 text-xs font-normal",
        getLabelColorClass(label)
      )}
    >
      {label}
    </Badge>
  );
}

export function LanguagePairBadge({ sourceLang, targetLang }: LanguagePairBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="rounded-md border px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 border-indigo-100"
    >
      {sourceLang} → {targetLang}
    </Badge>
  );
}