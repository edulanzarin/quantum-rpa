import React, { useState, useEffect, type KeyboardEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Select } from "@components/ui/Select";
import { Title } from "@components/ui/Title";
import { Modal } from "@components/ui/Modal";
import { Table, type Column } from "@components/ui/Table";
import type { Empresa, BalanceteLinha } from "@shared/types";
import "./styles.css";

// Componente separado para valor animado
function AnimatedValue({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2000;

    function animate(timestamp: number) {
      if (start === null) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(value * progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
      }).format(displayValue)}
    </span>
  );
}

export function ConferenciaFiscalBP() {
  const [formData, setFormData] = useState({
    codEmpresa: "",
    nomeEmpresa: "",
    dataInicial: "",
    dataFinal: "",
    codPlano: "",
    planoConta: "1",
    formato: "excel",
    caminhoSalvar: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [listaEmpresas, setListaEmpresas] = useState<Empresa[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [balancete, setBalancete] = useState<BalanceteLinha[]>([]);
  const [carregandoBalancete, setCarregandoBalancete] = useState(false);

  const colunasEmpresa: Column<Empresa>[] = [
    { header: "Cód.", accessor: "CODIGO", width: "80px" },
    { header: "Razão Social", accessor: "NOME" },
  ];

  const getNivel = (classificacao: string): number => {
    return classificacao.split(".").length;
  };

  const colunasBalancete: Column<BalanceteLinha>[] = [
    {
      header: "Conta",
      accessor: "contactb",
      width: "100px",
      render: (row) => {
        const nivel = getNivel(row.classificacao);
        const fontWeight = nivel === 1 ? "bold" : "normal";
        return <div style={{ fontWeight }}>{row.contactb}</div>;
      },
    },
    {
      header: "Descrição",
      accessor: "descricao",
      width: "auto",
      render: (row) => {
        const nivel = getNivel(row.classificacao);
        const indentacao = (nivel - 1) * 10;
        const fontWeight = nivel === 1 ? "bold" : "normal";
        return (
          <div style={{ paddingLeft: `${indentacao}px`, fontWeight }}>
            {row.descricao}
          </div>
        );
      },
    },
    {
      header: "Valores Atuais",
      align: "center",
      columns: [
        {
          header: "Débito",
          accessor: "debito",
          width: "150px",
          render: (row) => {
            const nivel = getNivel(row.classificacao);
            const fontWeight = nivel === 1 ? "bold" : "normal";
            return (
              <span style={{ fontWeight }}>
                <AnimatedValue value={Number(row.debito)} />
              </span>
            );
          },
        },
        {
          header: "Crédito",
          accessor: "credito",
          width: "150px",
          render: (row) => {
            const nivel = getNivel(row.classificacao);
            const fontWeight = nivel === 1 ? "bold" : "normal";
            return (
              <span style={{ fontWeight }}>
                <AnimatedValue value={Number(row.credito)} />
              </span>
            );
          },
        },
      ],
    },
    {
      header: "Valores Estimativos",
      align: "center",
      columns: [
        {
          header: "Débito",
          accessor: "debito",
          width: "150px",
          render: (row) => {
            const nivel = getNivel(row.classificacao);
            const fontWeight = nivel === 1 ? "bold" : "normal";
            return (
              <span style={{ fontWeight }}>
                <AnimatedValue value={Number(row.debito)} />
              </span>
            );
          },
        },
        {
          header: "Crédito",
          accessor: "credito",
          width: "150px",
          render: (row) => {
            const nivel = getNivel(row.classificacao);
            const fontWeight = nivel === 1 ? "bold" : "normal";
            return (
              <span style={{ fontWeight }}>
                <AnimatedValue value={Number(row.credito)} />
              </span>
            );
          },
        },
      ],
    },
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buscarPorCodigo = async () => {
    if (!formData.codEmpresa) return;
    try {
      // @ts-ignore
      const todas: Empresa[] = await window.api.obterEmpresas();
      const codigo = parseInt(formData.codEmpresa);
      const encontrada = todas.find((e) => e.CODIGO === codigo);
      if (encontrada) {
        setFormData((prev) => ({ ...prev, nomeEmpresa: encontrada.NOME }));
      } else {
        setFormData((prev) => ({ ...prev, nomeEmpresa: "" }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") buscarPorCodigo();
  };

  const abrirModalPesquisa = async () => {
    setModalAberto(true);
    setCarregandoLista(true);
    try {
      // @ts-ignore
      const dados = await window.api.obterEmpresas();
      setListaEmpresas(dados);
    } catch (error) {
      setModalAberto(false);
    } finally {
      setCarregandoLista(false);
    }
  };

  const selecionarEmpresaNoModal = (empresa: Empresa) => {
    setFormData((prev) => ({
      ...prev,
      codEmpresa: String(empresa.CODIGO),
      nomeEmpresa: empresa.NOME,
    }));
    setModalAberto(false);
  };

  const processarBalancete = async () => {
    if (!formData.codEmpresa) {
      return;
    }
    if (!formData.dataInicial || !formData.dataFinal) {
      return;
    }

    setLoading(true);
    setCarregandoBalancete(true);

    try {
      const codigoEmpresa = parseInt(formData.codEmpresa);
      const dataInicio = new Date(formData.dataInicial + "T00:00:00");
      const dataFim = new Date(formData.dataFinal + "T23:59:59");
      const origem = "FI";

      // @ts-ignore
      const resultado = await window.api.gerarBalancoPatrimonial(
        codigoEmpresa,
        dataInicio,
        dataFim,
        origem
      );

      setBalancete(resultado);
    } catch (error) {
      console.error("Erro ao processar balancete:", error);
    } finally {
      setLoading(false);
      setCarregandoBalancete(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="form-section">
        <Title title="Conferência Fiscal | Balanço Patrimonial" />

        <div className="form-row">
          <div className="form-group" style={{ flex: "0 0 120px" }}>
            <label className="form-label">Cód. Empresa</label>
            <div className="input-group">
              <input
                name="codEmpresa"
                className="form-input"
                placeholder="000"
                value={formData.codEmpresa}
                onChange={handleInputChange}
                onBlur={buscarPorCodigo}
                onKeyDown={handleKeyDown}
              />
              <button
                className="input-group-btn"
                onClick={abrirModalPesquisa}
                title="Pesquisar na Lista (F2)"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <Input
            label="Nome da Empresa"
            placeholder="Selecione a empresa..."
            value={formData.nomeEmpresa}
            disabled
            style={{ fontWeight: "bold", color: "#334155" }}
          />
        </div>

        <div className="form-row">
          <Input
            label="Data Inicial"
            type="date"
            name="dataInicial"
            width="200px"
            value={formData.dataInicial}
            onChange={handleInputChange}
          />
          <Input
            label="Data Final"
            type="date"
            name="dataFinal"
            width="200px"
            value={formData.dataFinal}
            onChange={handleInputChange}
          />
          <Input
            label="Cód. Plano"
            width="100px"
            name="codPlano"
            value={formData.codPlano}
            onChange={handleInputChange}
          />
          <Select
            label="Plano de Contas"
            name="planoConta"
            value={formData.planoConta}
            onChange={handleInputChange}
            options={[{ value: "1", label: "Modelo Padrão Questor" }]}
          />
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
            borderTop: "1px solid var(--slate-100)",
            paddingTop: "20px",
          }}
        >
          <button
            className="btn-primary"
            disabled={loading}
            onClick={processarBalancete}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Processar"
            )}
          </button>
        </div>
      </div>

      {balancete.length > 0 && (
        <div className="form-section" style={{ marginTop: "24px" }}>
          <Title title="Balanço Patrimonial" />
          <Table<BalanceteLinha>
            data={balancete}
            columns={colunasBalancete}
            isLoading={carregandoBalancete}
            enableSearch={false}
          />
        </div>
      )}

      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Pesquisar Empresa"
      >
        <Table<Empresa>
          data={listaEmpresas}
          columns={colunasEmpresa}
          onRowClick={selecionarEmpresaNoModal}
          isLoading={carregandoLista}
          enableSearch={true}
        />
      </Modal>
    </div>
  );
}
