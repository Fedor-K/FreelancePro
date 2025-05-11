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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Users,
  BarChart as BarChartIcon,
  Download,
  Languages,
} from "lucide-react";

export default function Reports() {
  // State for filtering
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedTab, setSelectedTab] = useState("revenue");
  
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
  
  // 4. Language pair distribution
  const languagePairs = generateLanguagePairData(filteredProjects);
  
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
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
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
              <Users className="h-10 w-10 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
                <div className="text-2xl font-bold">{activeProjects}</div>
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
          <TabsTrigger value="languages">Language Pairs</TabsTrigger>
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
        
        {/* Language Pairs Tab */}
        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Pair Distribution</CardTitle>
              <CardDescription>
                Projects by language pair
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
                      data={languagePairs}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="pair" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="hsl(var(--accent))" name="Projects" />
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

// Generate language pair data
function generateLanguagePairData(projects: Project[]) {
  const pairCounts: Record<string, number> = {};
  
  projects.forEach(project => {
    if (project.sourceLang && project.targetLang) {
      // Clean up language names
      const sourceLang = project.sourceLang.replace(/[!'\s]/g, '').trim();
      const targetLang = project.targetLang.replace(/[!'\s]/g, '').trim();
      const pair = `${sourceLang} → ${targetLang}`;
      
      pairCounts[pair] = (pairCounts[pair] || 0) + 1;
    }
  });
  
  // Convert to array, sort, and take top 8
  return Object.entries(pairCounts)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

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