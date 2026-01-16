import React, { useState, type KeyboardEvent } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { DefaultLayout } from "./layouts/DefaultLayout";

import { Dashboard } from "./pages/Dashboard";
import { ConferenciaFiscalBP } from "./pages/Contabil/ConferenciaFiscalBP";
import { PlanosConciliacao } from "./pages/Contabil/PlanosConciliacao";

function App() {
  return (
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
  );
}

export default App;
