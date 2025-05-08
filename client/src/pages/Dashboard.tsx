import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  FileText,
  ArrowRight
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activeClients: number;
  ongoingProjects: number;
  monthlyRevenue: number;
  documentsGenerated: number;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Button onClick={() => setLocation("/projects/new")}>
          New Project
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          // Loading skeletons for stats
          [...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-white rounded-lg shadow">
              <CardContent className="p-5">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 w-0 ml-5">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual stats
          <>
            <StatsCard
              title="Active Clients"
              value={stats?.activeClients || 0}
              icon={Users}
              iconColor="#2B6CB0"
              iconBgColor="#EBF8FF"
            />
            <StatsCard
              title="Ongoing Projects"
              value={stats?.ongoingProjects || 0}
              icon={ClipboardList}
              iconColor="#975A16"
              iconBgColor="#FEFCBF"
            />
            <StatsCard
              title="Revenue this month"
              value={formatCurrency(stats?.monthlyRevenue || 0)}
              icon={DollarSign}
              iconColor="#48BB78"
              iconBgColor="#C6F6D5"
            />
            <StatsCard
              title="Documents Generated"
              value={stats?.documentsGenerated || 0}
              icon={FileText}
              iconColor="#805AD5"
              iconBgColor="#E9D8FD"
            />
          </>
        )}
      </div>

      {/* Recent Projects */}
      <RecentProjects />
      
      {/* View All Projects */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => setLocation("/projects")}
          className="w-full sm:w-auto"
        >
          View All Projects
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
