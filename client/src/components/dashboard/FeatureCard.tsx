import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  actionLabel: string;
  onClick: () => void;
  children?: ReactNode;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  actionLabel,
  onClick,
  children,
}: FeatureCardProps) {
  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow">
      <CardContent className="pt-6 px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 p-3 rounded-md`}
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: iconColor }}
            />
          </div>
          <h3 className="ml-3 text-lg font-medium leading-6 text-gray-900">
            {title}
          </h3>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="mt-5">
          {children}
          <Button 
            className="px-4 py-2 mt-3 text-sm font-medium text-white rounded-md"
            style={{ backgroundColor: iconColor }}
            onClick={onClick}
          >
            <Icon className="mr-2 h-4 w-4" /> {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
