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
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function AppRoutes() {
  return (
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
}

function App() {
  const [location] = useLocation();
  const isPublicRoute = location === "/" || location === "/auth";
  
  return (
    <AuthProvider>
      {isPublicRoute ? (
        <AppRoutes />
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </AuthProvider>
  );
}

export default App;
