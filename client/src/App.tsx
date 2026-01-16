import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/user/Users";
import NotFound from "./pages/not-found";
import Tenants from "./pages/tenant/Tenants";
import MainCategories from "./pages/mainCategory/MainCategories";
import Categories from "./pages/category/Categories";
import SubCategories from "./pages/subCategory/SubCategories";
import SubSubCategories from "./pages/subSubCategory/SubSubCategories";

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
      <Route path="/admin/tenants">
        <Layout><Tenants /></Layout>
      </Route>
      <Route path="/admin/main-categories">
        <Layout><MainCategories /></Layout>
      </Route>
      <Route path="/admin/categories">
        <Layout><Categories /></Layout>
      </Route>
      <Route path="/admin/sub-categories">
        <Layout><SubCategories /></Layout>
      </Route>
      <Route path="/admin/sub-sub-categories">
        <Layout><SubSubCategories /></Layout>
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
