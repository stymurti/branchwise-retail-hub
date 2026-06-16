import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UserManagement from "./pages/UserManagement";
import ModeSelect from "./pages/ModeSelect";
import POS from "./pages/POS";
import POSTransactions from "./pages/POSTransactions";
import POSSettings from "./pages/POSSettings";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import EmployeeReports from "./pages/EmployeeReports";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Vendors from "./pages/Vendors";
import Journal from "./pages/finance/Journal";
import APAR from "./pages/finance/APAR";
import CashFlow from "./pages/finance/CashFlow";
import Expenses from "./pages/finance/Expenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Role-based route shortcuts
const All = ["super_admin", "admin", "staff", "cashier"] as const;
const BO = ["super_admin", "admin", "staff"] as const;
const AdminOnly = ["super_admin", "admin"] as const;
const POSRoles = ["super_admin", "admin", "cashier"] as const;
const SuperOnly = ["super_admin"] as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="erp-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/mode-select" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/mode-select" element={
                <ProtectedRoute allow={[...All]}><ModeSelect /></ProtectedRoute>
              } />

              {/* POS Routes */}
              <Route path="/pos" element={<ProtectedRoute allow={[...POSRoles]}><POS /></ProtectedRoute>} />
              <Route path="/pos/transactions" element={<ProtectedRoute allow={[...POSRoles]}><POSTransactions /></ProtectedRoute>} />
              <Route path="/pos/shifts" element={<ProtectedRoute allow={[...POSRoles]}><POS /></ProtectedRoute>} />
              <Route path="/pos/settings" element={<ProtectedRoute allow={[...AdminOnly]}><POSSettings /></ProtectedRoute>} />

              {/* Back Office Routes */}
              <Route path="/backoffice" element={<ProtectedRoute allow={[...BO]}><Dashboard /></ProtectedRoute>} />
              <Route path="/backoffice/users" element={<ProtectedRoute allow={[...SuperOnly]}><UserManagement /></ProtectedRoute>} />
              <Route path="/backoffice/branches" element={<ProtectedRoute allow={[...BO]}><Branches /></ProtectedRoute>} />
              <Route path="/backoffice/branches/transfer" element={<ProtectedRoute allow={[...BO]}><Branches /></ProtectedRoute>} />
              <Route path="/backoffice/inventory/products" element={<ProtectedRoute allow={[...BO]}><Inventory /></ProtectedRoute>} />
              <Route path="/backoffice/inventory/stock-in" element={<ProtectedRoute allow={[...BO]}><Inventory /></ProtectedRoute>} />
              <Route path="/backoffice/inventory/opname" element={<ProtectedRoute allow={[...BO]}><Inventory /></ProtectedRoute>} />
              <Route path="/backoffice/inventory/po" element={<ProtectedRoute allow={[...BO]}><Inventory /></ProtectedRoute>} />
              <Route path="/backoffice/vendors" element={<ProtectedRoute allow={[...AdminOnly]}><Vendors /></ProtectedRoute>} />
              <Route path="/backoffice/finance/journal" element={<ProtectedRoute allow={[...AdminOnly]}><Journal /></ProtectedRoute>} />
              <Route path="/backoffice/finance/ap-ar" element={<ProtectedRoute allow={[...AdminOnly]}><APAR /></ProtectedRoute>} />
              <Route path="/backoffice/finance/cashflow" element={<ProtectedRoute allow={[...AdminOnly]}><CashFlow /></ProtectedRoute>} />
              <Route path="/backoffice/finance/expenses" element={<ProtectedRoute allow={[...AdminOnly]}><Expenses /></ProtectedRoute>} />
              <Route path="/backoffice/hr/employees" element={<ProtectedRoute allow={[...AdminOnly]}><Employees /></ProtectedRoute>} />
              <Route path="/backoffice/hr/attendance" element={<ProtectedRoute allow={[...AdminOnly]}><EmployeeReports /></ProtectedRoute>} />
              <Route path="/backoffice/hr/schedule" element={<ProtectedRoute allow={[...AdminOnly]}><Employees /></ProtectedRoute>} />
              <Route path="/backoffice/hr/payroll" element={<ProtectedRoute allow={[...AdminOnly]}><EmployeeReports /></ProtectedRoute>} />
              <Route path="/backoffice/reports" element={<ProtectedRoute allow={[...AdminOnly]}><Reports /></ProtectedRoute>} />
              <Route path="/backoffice/settings" element={<ProtectedRoute allow={[...AdminOnly]}><Settings /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
