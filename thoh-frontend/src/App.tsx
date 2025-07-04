import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./layouts/AppSidebar";

import { AdminControlPanel } from "./pages/AdminControlPanel";
import { PeopleSalaryManager } from "./pages/PeopleSalaryManager";

export function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <SidebarInset>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminControlPanel />} />
            <Route path="/salaries" element={<PeopleSalaryManager />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
}
