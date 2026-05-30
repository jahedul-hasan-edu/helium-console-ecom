import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { UsersManagementSection } from "@/pages/user/UsersManagementSection";
import { UserSettingsPermissions } from "@/pages/userSettings/UserSettingsPermissions";

export default function UserSettings() {
  const { isSuperAdmin, selectedTenantId } = useAuth();
  const tenantScoped = !isSuperAdmin || !!selectedTenantId;

  return (
    <div className="space-y-4">
      {!tenantScoped ? (
        <Alert>
          <AlertTitle>Select a tenant first</AlertTitle>
          <AlertDescription>
            User settings are tenant-scoped. Choose a tenant from the header dropdown before managing users or permissions.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-0 space-y-4">
            <UsersManagementSection showHeader={false} />
          </TabsContent>

          <TabsContent value="permissions" className="mt-0 space-y-4">
            <UserSettingsPermissions />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}