import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/user/Users";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Admin Redirect */}
      <Route path="/" component={() => <Redirect to="/admin" />} />

      {/* Admin Routes */}
      <Route path="/admin">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/admin/users">
        <Layout><Users /></Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
