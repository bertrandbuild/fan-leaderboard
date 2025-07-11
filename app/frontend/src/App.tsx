import { Sidebar } from "@/components/sections/sidebar";
import { Header } from "@/components/sections/header";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/hooks/useSidebar";

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-900 text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Header />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
