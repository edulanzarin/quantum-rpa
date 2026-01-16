import React, { useState, type KeyboardEvent } from "react";

export function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Visão Geral</h2>
          <p className="text-sm text-slate-500">Acompanhamento diário</p>
        </div>
        <button
          style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
          }}
        >
          Atualizar Dados
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <div className="card" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--slate-500)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Faturamento
              </p>
              <h3 style={{ fontSize: "1.8rem", marginTop: "4px" }}>
                R$ 124.500,00
              </h3>
            </div>
            <span
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              +12%
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--slate-500)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Notas Pendentes
          </p>
          <h3 style={{ fontSize: "1.8rem", marginTop: "4px" }}>14</h3>
        </div>
      </div>
    </div>
  );
}
