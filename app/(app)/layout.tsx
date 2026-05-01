import { Sidebar } from "@/components/sidebar";
import { UserProvider } from "@/components/user-provider";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;
  const admin = isAdmin(email);

  return (
    <UserProvider email={email} isAdmin={admin}>
      <div className="flex min-h-screen">
        <Sidebar userEmail={email} isAdmin={admin} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </UserProvider>
  );
}
