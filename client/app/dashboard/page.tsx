import { SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
          <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-muted/50 aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
