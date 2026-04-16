import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";

// Cliente
import ClienteDashboard from "./pages/cliente/Dashboard";
import ClienteTransacoes from "./pages/cliente/Transacoes";
import ClienteDocumentos from "./pages/cliente/Documentos";

// Fomentador
import FomentadorDashboard from "./pages/fomentador/Dashboard";
import FomentadorTransacoes from "./pages/fomentador/Transacoes";
import FomentadorRetornos from "./pages/fomentador/Retornos";

// Corretor
import CorretorDashboard from "./pages/corretor/Dashboard";
import CorretorRede from "./pages/corretor/Rede";
import CorretorComissoes from "./pages/corretor/Comissoes";
import CorretorExpansao from "./pages/corretor/Expansao";
import CorretorMarketplace from "./pages/corretor/Marketplace";

// Franqueado
import FranqueadoDashboard from "./pages/franqueado/Dashboard";
import FranqueadoOperacao from "./pages/franqueado/Operacao";
import FranqueadoVendas from "./pages/franqueado/Vendas";
import FranqueadoFinanceiro from "./pages/franqueado/Financeiro";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminTransacoes from "./pages/admin/Transacoes";
import AdminKyc from "./pages/admin/Kyc";
import AdminMarketplace from "./pages/admin/Marketplace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

          {/* Cliente */}
          <Route path="/cliente/dashboard" element={<ProtectedRoute allowedRoles={["cliente"]}><ClienteDashboard /></ProtectedRoute>} />
          <Route path="/cliente/transacoes" element={<ProtectedRoute allowedRoles={["cliente"]}><ClienteTransacoes /></ProtectedRoute>} />
          <Route path="/cliente/documentos" element={<ProtectedRoute allowedRoles={["cliente"]}><ClienteDocumentos /></ProtectedRoute>} />

          {/* Fomentador */}
          <Route path="/fomentador/dashboard" element={<ProtectedRoute allowedRoles={["fomentador"]}><FomentadorDashboard /></ProtectedRoute>} />
          <Route path="/fomentador/transacoes" element={<ProtectedRoute allowedRoles={["fomentador"]}><FomentadorTransacoes /></ProtectedRoute>} />
          <Route path="/fomentador/retornos" element={<ProtectedRoute allowedRoles={["fomentador"]}><FomentadorRetornos /></ProtectedRoute>} />

          {/* Corretor */}
          <Route path="/corretor/dashboard" element={<ProtectedRoute allowedRoles={["corretor"]}><CorretorDashboard /></ProtectedRoute>} />
          <Route path="/corretor/rede" element={<ProtectedRoute allowedRoles={["corretor"]}><CorretorRede /></ProtectedRoute>} />
          <Route path="/corretor/comissoes" element={<ProtectedRoute allowedRoles={["corretor"]}><CorretorComissoes /></ProtectedRoute>} />
          <Route path="/corretor/expansao" element={<ProtectedRoute allowedRoles={["corretor"]}><CorretorExpansao /></ProtectedRoute>} />
          <Route path="/corretor/marketplace" element={<ProtectedRoute allowedRoles={["corretor"]}><CorretorMarketplace /></ProtectedRoute>} />

          {/* Franqueado */}
          <Route path="/franqueado/dashboard" element={<ProtectedRoute allowedRoles={["franqueado"]}><FranqueadoDashboard /></ProtectedRoute>} />
          <Route path="/franqueado/operacao" element={<ProtectedRoute allowedRoles={["franqueado"]}><FranqueadoOperacao /></ProtectedRoute>} />
          <Route path="/franqueado/vendas" element={<ProtectedRoute allowedRoles={["franqueado"]}><FranqueadoVendas /></ProtectedRoute>} />
          <Route path="/franqueado/financeiro" element={<ProtectedRoute allowedRoles={["franqueado"]}><FranqueadoFinanceiro /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin/transacoes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminTransacoes /></ProtectedRoute>} />
          <Route path="/admin/kyc" element={<ProtectedRoute allowedRoles={["admin"]}><AdminKyc /></ProtectedRoute>} />
          <Route path="/admin/marketplace" element={<ProtectedRoute allowedRoles={["admin"]}><AdminMarketplace /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/cliente" element={<Navigate to="/cliente/dashboard" replace />} />
          <Route path="/fomentador" element={<Navigate to="/fomentador/dashboard" replace />} />
          <Route path="/corretor" element={<Navigate to="/corretor/dashboard" replace />} />
          <Route path="/franqueado" element={<Navigate to="/franqueado/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
