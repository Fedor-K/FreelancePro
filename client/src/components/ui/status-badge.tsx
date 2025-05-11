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
        return "bg-[hsl(var(--status-in-progress))] text-[hsl(var(--status-in-progress-foreground))] border-[hsl(var(--status-in-progress))]";
      case "Delivered":
        return "bg-[hsl(var(--status-new))] text-[hsl(var(--status-new-foreground))] border-[hsl(var(--status-new))]";
      case "Paid":
        return "bg-[hsl(var(--status-paid))] text-[hsl(var(--status-paid-foreground))] border-[hsl(var(--status-paid))]";
      default:
        return "bg-muted text-muted-foreground border-muted";
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
        return "bg-[hsl(var(--status-paid))] text-[hsl(var(--status-paid-foreground))] border-[hsl(var(--status-paid))]";
      case "In Progress":
        return "bg-[hsl(var(--status-in-progress))] text-[hsl(var(--status-in-progress-foreground))] border-[hsl(var(--status-in-progress))]";
      case "Overdue":
        return "bg-[hsl(var(--status-overdue))] text-[hsl(var(--status-overdue-foreground))] border-[hsl(var(--status-overdue))]";
      case "Pending payment":
        return "bg-[hsl(var(--status-new))] text-[hsl(var(--status-new-foreground))] border-[hsl(var(--status-new))]";
      case "Invoice sent":
        return "bg-accent/10 text-accent border-accent/20";
      case "To be delivered":
        return "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.20)]";
      case "Make invoice":
        return "bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.20)]";
      default:
        return "bg-muted text-muted-foreground border-muted";
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
      className="rounded-md border px-2 py-1 text-xs font-medium bg-accent/10 text-accent border-accent/20"
    >
      {cleanSourceLang} → {cleanTargetLang}
    </Badge>
  );
}