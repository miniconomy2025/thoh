import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AppSidebar } from "./layouts/AppSidebar";

import { AdminControlPanel } from "./pages/AdminControlPanel";
import { PeopleSalaryManager } from "./pages/PeopleSalaryManager";
import { EconomicFlowReporting } from "./pages/EconomicFlowReporting";
import { RawMaterialsEquipment } from "./pages/RawMaterialsEquipment";

export function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<AdminControlPanel />} />
            <Route path="/users" element={<PeopleSalaryManager />} />
            <Route path="/flow" element={<EconomicFlowReporting />} />
            <Route path="/equipment" element={<RawMaterialsEquipment />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
}
