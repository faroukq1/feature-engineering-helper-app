import LayoutHeader from "@/components/global/LayoutHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ">
      <LayoutHeader />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
