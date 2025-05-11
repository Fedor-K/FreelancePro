import { Switch, Route } from "wouter";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Resume from "@/pages/Resume";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import DesignSystem from "@/components/DesignSystem";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:projectId" component={ProjectDetails} />
        <Route path="/resume" component={Resume} />
        <Route path="/documents" component={Documents} />
        <Route path="/settings" component={Settings} />
        <Route path="/design-system" component={DesignSystem} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;
