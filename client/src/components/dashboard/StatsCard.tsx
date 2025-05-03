import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor, iconBgColor }: StatsCardProps) {
  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div 
            className={`flex-shrink-0 p-3 rounded-md ${iconBgColor}`} 
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} style={{ color: iconColor }} />
          </div>
          <div className="flex-1 w-0 ml-5">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
