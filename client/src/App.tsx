import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/AuthShell";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/order/Orders";
import Users from "@/pages/user/Users";
import NotFound from "./pages/not-found";
import Tenants from "./pages/tenant/Tenants";
import MainCategories from "./pages/mainCategory/MainCategories";
import Categories from "./pages/category/Categories";
import SubCategories from "./pages/subCategory/SubCategories";
import SubSubCategories from "./pages/subSubCategory/SubSubCategories";
import Products from "./pages/product/Products";
import SubscriptionPlans from "./pages/subscriptionPlan/SubscriptionPlans";
import TenantSubscriptions from "./pages/tenantSubscription/TenantSubscriptions";
import Faqs from "./pages/faq/Faqs";
import HomeSettings from "./pages/homeSetting/HomeSettings";
import Organizations from "./pages/organization/Organizations";
import PopupAds from "./pages/popupAd/PopupAds";
import Pages from "@/pages/page/Pages";
import PagePermissions from "@/pages/pagePermission/PagePermissions";
import Roles from "@/pages/role/Roles";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import TwoFactorVerify from "@/pages/auth/TwoFactorVerify";
import { AUTH_ROUTES } from "@/lib/auth";
import MyAccount from "@/pages/account/MyAccount";

function RootRedirect() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  return <Redirect to={isAuthenticated ? AUTH_ROUTES.ADMIN_HOME : AUTH_ROUTES.LOGIN} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path={AUTH_ROUTES.LOGIN} component={Login} />
      <Route path={AUTH_ROUTES.REGISTER} component={Register} />
      <Route path={AUTH_ROUTES.TWO_FACTOR_VERIFY} component={TwoFactorVerify} />

      <Route path="/admin">
        <AuthShell><Dashboard /></AuthShell>
      </Route>
      <Route path="/admin/tenants">
        <AuthShell><Tenants /></AuthShell>
      </Route>
      <Route path="/admin/organizations">
        <AuthShell><Organizations /></AuthShell>
      </Route>
      <Route path="/admin/orders">
        <AuthShell><Orders /></AuthShell>
      </Route>
      <Route path="/admin/subscription-plans">
        <AuthShell><SubscriptionPlans /></AuthShell>
      </Route>
      <Route path="/admin/tenant-subscriptions">
        <AuthShell><TenantSubscriptions /></AuthShell>
      </Route>
      <Route path="/admin/users">
        <AuthShell><Users /></AuthShell>
      </Route>
      <Route path="/admin/main-categories">
        <AuthShell><MainCategories /></AuthShell>
      </Route>
      <Route path="/admin/categories">
        <AuthShell><Categories /></AuthShell>
      </Route>
      <Route path="/admin/sub-categories">
        <AuthShell><SubCategories /></AuthShell>
      </Route>
      <Route path="/admin/sub-sub-categories">
        <AuthShell><SubSubCategories /></AuthShell>
      </Route>
      <Route path="/admin/products">
        <AuthShell><Products /></AuthShell>
      </Route>
      <Route path="/admin/faqs">
        <AuthShell><Faqs /></AuthShell>
      </Route>
      <Route path="/admin/home-settings">
        <AuthShell><HomeSettings /></AuthShell>
      </Route>
      <Route path="/admin/popup-ads">
        <AuthShell><PopupAds /></AuthShell>
      </Route>
      <Route path="/admin/pages">
        <AuthShell><Pages /></AuthShell>
      </Route>
      <Route path="/admin/roles">
        <AuthShell><Roles /></AuthShell>
      </Route>
      <Route path="/admin/page-permissions">
        <AuthShell><PagePermissions /></AuthShell>
      </Route>
      <Route path="/admin/my-account">
        <AuthShell><MyAccount /></AuthShell>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
