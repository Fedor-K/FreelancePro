import { Switch, Route, useLocation } from "wouter";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Resume from "@/pages/Resume";
import Documents from "@/pages/Documents";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Loader2 } from "lucide-react";

function AppWithAuth() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const isPublicRoute = location === "/" || location === "/auth";
  
  // Show loading spinner if auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  // If user is authenticated and trying to access the landing page, redirect to dashboard
  if (user && location === "/") {
    return <Dashboard />;
  }
  
  // If user is authenticated and trying to access the auth page, redirect to dashboard
  if (user && location === "/auth") {
    window.location.href = "/dashboard";
    return null;
  }

  // Define routes
  const routes = (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/clients" component={Clients} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/projects/:projectId" component={ProjectDetails} />
      <ProtectedRoute path="/resume" component={Resume} />
      <ProtectedRoute path="/documents" component={Documents} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/settings" component={Settings} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
  
  // Apply layout only for non-public routes
  return isPublicRoute ? routes : <Layout>{routes}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
