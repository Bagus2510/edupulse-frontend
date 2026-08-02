import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { AuthGuard } from "@/lib/auth";
import { DomainWrapper } from "@/components/layout/domain-wrapper";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DomainWrapper>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full">
            <TopNav />
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </DomainWrapper>
    </AuthGuard>
  );
}
