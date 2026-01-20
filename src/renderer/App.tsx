import { HashRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "@/contexts/ToastContext";
import { DefaultLayout } from "./layouts/DefaultLayout";

import { Dashboard } from "./pages/Dashboard";
import { ConferenciaFiscalBP } from "./pages/Contabil/ConferenciaFiscalBP";
import { PlanosConciliacao } from "./pages/Contabil/PlanosConciliacao";

function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Dashboard />} />

            <Route
              path="contabil/conferencia-bp"
              element={<ConferenciaFiscalBP />}
            />

            <Route
              path="contabil/planos_conciliacao"
              element={<PlanosConciliacao />}
            />

            <Route path="*" element={<h2>Página não encontrada</h2>} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
