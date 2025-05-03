import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  FileText,
  Wand2, 
  File 
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ClientList } from "@/components/dashboard/ClientList";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { Card, CardContent } from "@/components/ui/card";
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

      {/* Featured Sections */}
      <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
        {/* Resume Generator */}
        <FeatureCard
          title="Resume Generator"
          description="Create professional resumes tailored for your freelance specialty. AI-powered to highlight your best skills."
          icon={Wand2}
          iconColor="#805AD5"
          iconBgColor="#E9D8FD"
          actionLabel="Generate Resume"
          onClick={() => setLocation("/resume")}
        >
          <div className="overflow-hidden rounded-lg bg-gray-50">
            <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
              alt="Resume example" 
              className="object-cover w-full h-40"
            />
            <div className="p-4">
              <h4 className="font-medium text-gray-900">Create a new resume</h4>
              <p className="mt-1 text-sm text-gray-500">
                Choose from multiple templates or let AI suggest the best format for your experience.
              </p>
            </div>
          </div>
        </FeatureCard>

        {/* Document Templates */}
        <FeatureCard
          title="Document Templates"
          description="Generate professional invoices and contracts based on your client and project data."
          icon={File}
          iconColor="#48BB78"
          iconBgColor="#C6F6D5"
          actionLabel="Create Documents"
          onClick={() => setLocation("/documents")}
        >
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center">
                  <File className="h-5 w-5 text-secondary mr-2" />
                  <h4 className="font-medium text-gray-900">Invoice Templates</h4>
                </div>
                <p className="mt-1 text-sm text-gray-500">Professional invoices with your branding.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium text-gray-900">Contract Templates</h4>
                </div>
                <p className="mt-1 text-sm text-gray-500">Legally sound contracts for your projects.</p>
              </div>
            </div>
          </div>
        </FeatureCard>
      </div>

      {/* Client List */}
      <ClientList />
    </div>
  );
}
