import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project, Client } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed unused imports: Badge and Button since we removed the export functionality
import {
  Calendar,
  CreditCard,
  DollarSign,
  Users,
  BarChart as BarChartIcon,
} from "lucide-react";

export default function Reports() {
  // State for filtering
  const [timeRange, setTimeRange] = useState("thisMonth");
  const [selectedTab, setSelectedTab] = useState("revenue");
  
  // Function to calculate the total volume for the selected period
  const calculateMonthlyVolume = (): number => {
    if (!projects || projects.length === 0) return 0;
    
    // Use the same date range that we use for filtering projects
    const { start, end } = getDateRange();
    
    return projects
      .filter(project => {
        if (!project.deadline) return false;
        const projectDate = new Date(project.deadline);
        return projectDate >= start && projectDate <= end;
      })
      .reduce((total, project) => total + (project.volume || 0), 0);
  };
  
  // Fetch projects and clients data
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const isLoading = isLoadingProjects || isLoadingClients;
  
  // Function to get date range for filtering
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "thisMonth":
        return { 
          start: startOfMonth(now), 
          end: endOfMonth(now) 
        };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return { 
          start: startOfMonth(lastMonth), 
          end: endOfMonth(lastMonth) 
        };
      case "3months":
        return { start: subMonths(now, 3), end: now };
      case "6months":
        return { start: subMonths(now, 6), end: now };
      case "12months":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: subMonths(now, 6), end: now };
    }
  };
  
  // Filter projects by date range
  const { start, end } = getDateRange();
  const filteredProjects = projects.filter(project => {
    if (!project.deadline) return false;
    const projectDate = new Date(project.deadline);
    return projectDate >= start && projectDate <= end;
  });
  
  // Prepare data for charts
  
  // 1. Monthly revenue data
  const monthlyRevenueData = generateMonthlyRevenueData(filteredProjects);
  
  // 2. Project status distribution
  const statusDistribution = generateStatusDistribution(filteredProjects);
  
  // 3. Top clients by revenue
  const topClients = generateTopClientsData(filteredProjects, clients);
  
  // Calculate summary metrics
  const totalRevenue = filteredProjects.reduce((sum, project) => 
    sum + (project.amount || 0), 0);
  
  const activeProjects = projects.filter(p => p.status === "In Progress").length;
  const completedProjects = filteredProjects.filter(p => p.status === "Paid").length;
  const averageProjectValue = filteredProjects.length ? 
    totalRevenue / filteredProjects.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Analyze your business performance and track key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Range</SelectLabel>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-10 w-10 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-10 w-10 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Average Project Value</div>
                <div className="text-2xl font-bold">
                  ${averageProjectValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-10 w-10 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Completed Projects</div>
                <div className="text-2xl font-bold">{completedProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChartIcon className="h-10 w-10 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">
                  {timeRange === "thisMonth" ? "Volume This Month" : 
                   timeRange === "lastMonth" ? "Volume Last Month" : 
                   `Volume (${timeRange === "3months" ? "3" : 
                              timeRange === "6months" ? "6" : 
                              timeRange === "12months" ? "12" : "6"} months)`}
                </div>
                <div className="text-2xl font-bold">
                  {calculateMonthlyVolume().toLocaleString('en-US')} words
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Report Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Monthly revenue for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={monthlyRevenueData} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => ['$' + value, 'Revenue']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        activeDot={{ r: 8 }} 
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects by Status</CardTitle>
              <CardDescription>
                Distribution of projects by current status
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getStatusColor(entry.name)}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex flex-col justify-center">
                      <ul className="space-y-2">
                        {statusDistribution.map((status, index) => (
                          <li key={index} className="flex items-center">
                            <div 
                              className="h-4 w-4 rounded-full mr-2" 
                              style={{ backgroundColor: getStatusColor(status.name) }}
                            />
                            <span>{status.name}: {status.value} projects</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>
                Your most valuable clients based on project revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topClients}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => ['$' + value, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for data preparation

// Generate monthly revenue data
function generateMonthlyRevenueData(projects: Project[]) {
  const months: Record<string, number> = {};
  
  // Get the range of months
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = subMonths(now, i);
    const monthKey = format(date, 'MMM yyyy');
    months[monthKey] = 0;
  }
  
  // Populate with real data
  projects.forEach(project => {
    if (project.amount && project.deadline) {
      const date = new Date(project.deadline);
      const monthKey = format(date, 'MMM yyyy');
      if (months[monthKey] !== undefined) {
        months[monthKey] += project.amount;
      }
    }
  });
  
  // Convert to array and reverse to get chronological order
  return Object.entries(months)
    .map(([month, revenue]) => ({ month, revenue }))
    .reverse();
}

// Generate project status distribution
function generateStatusDistribution(projects: Project[]) {
  const statusCounts: Record<string, number> = {
    "In Progress": 0,
    "Delivered": 0,
    "Paid": 0
  };
  
  projects.forEach(project => {
    if (project.status && statusCounts[project.status] !== undefined) {
      statusCounts[project.status]++;
    }
  });
  
  return Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }));
}

// Generate top clients by revenue
function generateTopClientsData(projects: Project[], clients: Client[]) {
  const clientRevenue: Record<number, { revenue: number, name: string }> = {};
  
  // Aggregate revenue by client
  projects.forEach(project => {
    if (project.amount && project.clientId) {
      if (!clientRevenue[project.clientId]) {
        const client = clients.find(c => c.id === project.clientId);
        clientRevenue[project.clientId] = {
          revenue: 0,
          name: client ? client.name : `Client #${project.clientId}`
        };
      }
      clientRevenue[project.clientId].revenue += project.amount;
    }
  });
  
  // Convert to array, sort, and take top 5
  return Object.values(clientRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

// Language pairs reporting removed as requested

// Get color for status
function getStatusColor(status: string) {
  switch (status) {
    case "In Progress":
      return "#3182CE"; // blue
    case "Delivered":
      return "#805AD5"; // purple
    case "Paid":
      return "#48BB78"; // green
    default:
      return "#A0AEC0"; // gray
  }
}