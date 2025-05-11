import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "In Progress" | "Delivered" | "Paid";

export type ProjectLabel = 
  | "In Progress" 
  | "Overdue"
  | "Pending payment"
  | "Paid"
  | "Invoice sent"
  | "To be delivered"
  | "Make invoice";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

interface ProjectLabelBadgeProps {
  label: ProjectLabel;
}

interface LanguagePairBadgeProps {
  sourceLang: string;
  targetLang: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColorClass = (status: StatusType) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";
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
        getStatusColorClass(status),
        className
      )}
    >
      {status}
    </Badge>
  );
}

export function ProjectLabelBadge({ label }: ProjectLabelBadgeProps) {
  const getLabelColorClass = (label: ProjectLabel) => {
    switch (label) {
      case "Paid":
        return "bg-green-50 text-green-600 border-green-100";
      case "In Progress":
        return "bg-gray-50 text-gray-600 border-gray-100";
      case "Overdue":
        return "bg-red-50 text-red-600 border-red-100";
      case "Pending payment":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Invoice sent":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "To be delivered":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "Make invoice":
        return "bg-amber-50 text-amber-600 border-amber-100";
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
  // Clean up language formatting by removing spacing and strange characters
  const cleanSourceLang = sourceLang ? sourceLang.replace(/[!'\s]/g, '').trim() : '';
  const cleanTargetLang = targetLang ? targetLang.replace(/[!'\s]/g, '').trim() : '';
  
  return (
    <Badge
      variant="outline"
      className="rounded-md border px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 border-indigo-100"
    >
      {cleanSourceLang} → {cleanTargetLang}
    </Badge>
  );
}