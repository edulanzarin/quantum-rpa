import { useState, useEffect, type ChangeEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Title } from "@components/ui/Title";
import { Modal } from "@components/ui/Modal";
import { Table, type Column } from "@components/ui/Table";
import type { Empresa, BalanceteLinha } from "@shared/types";
import { unwrap } from "@/utils/api-helper";
import { useToast } from "@/hooks/useToast";
import "../styles.css";

interface BalanceteLinhaExpandida extends BalanceteLinha {
  debitoFiscal: number;
  creditoFiscal: number;
}

function AnimatedValue({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2000;

    function animate(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(value * progress);
      if (progress < 1) requestAnimationFrame(animate);
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
  const toast = useToast();

  const [formData, setFormData] = useState({
    codEmpresa: "",
    nomeEmpresa: "",
    dataInicial: "",
    dataFinal: "",
    codPlano: "",
    nomePlano: "",
  });

  const [loading, setLoading] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [listaEmpresas, setListaEmpresas] = useState<Empresa[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);

  const [balancete, setBalancete] = useState<BalanceteLinhaExpandida[]>([]);
  const [carregandoBalancete, setCarregandoBalancete] = useState(false);

  const colunasEmpresa: Column<Empresa>[] = [
    { header: "Cód.", accessor: "CODIGO", width: "80px" },
    { header: "Razão Social", accessor: "NOME" },
  ];

  const getNivel = (classificacao: string): number => {
    return classificacao.split(".").length;
  };

  const colunasBalancete: Column<BalanceteLinhaExpandida>[] = [
    {
      header: "Conta",
      accessor: "contactb",
      width: "80px",
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
        const indentacao = (nivel - 1) * 15;
        const fontWeight = nivel === 1 ? "bold" : "normal";
        return (
          <div style={{ paddingLeft: `${indentacao}px`, fontWeight }}>
            {row.descricao}
          </div>
        );
      },
    },
    {
      header: "Real",
      columns: [
        {
          header: "Débito",
          accessor: "debito",
          width: "130px",
          render: (row) => (
            <span style={{ fontWeight: 500, color: "#333333" }}>
              <AnimatedValue value={Number(row.debito)} />
            </span>
          ),
        },
        {
          header: "Crédito",
          accessor: "credito",
          width: "130px",
          render: (row) => (
            <span style={{ fontWeight: 500, color: "#333333" }}>
              <AnimatedValue value={Number(row.credito)} />
            </span>
          ),
        },
      ],
    },
    {
      header: "Projeção",
      columns: [
        {
          header: "Débito",
          accessor: "debitoFiscal",
          width: "130px",
          render: (row) => (
            <span style={{ fontWeight: 500, color: "#666666" }}>
              <AnimatedValue value={Number(row.debitoFiscal)} />
            </span>
          ),
        },
        {
          header: "Crédito",
          accessor: "creditoFiscal",
          width: "130px",
          render: (row) => (
            <span style={{ fontWeight: 500, color: "#666666" }}>
              <AnimatedValue value={Number(row.creditoFiscal)} />
            </span>
          ),
        },
      ],
    },
    {
      header: "Divergência",
      columns: [
        {
          header: "Débito",
          align: "right",
          width: "130px",
          render: (row) => {
            const diff = row.debito - row.debitoFiscal;
            if (Math.abs(diff) < 0.01)
              return (
                <div style={{ textAlign: "right", color: "#cccccc" }}>-</div>
              );
            return (
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#d32f2f", fontWeight: "600" }}>
                  <AnimatedValue value={diff} />
                </span>
              </div>
            );
          },
        },
        {
          header: "Crédito",
          align: "right",
          width: "130px",
          render: (row) => {
            const diff = row.credito - row.creditoFiscal;
            if (Math.abs(diff) < 0.01)
              return (
                <div style={{ textAlign: "right", color: "#cccccc" }}>-</div>
              );
            return (
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#d32f2f", fontWeight: "600" }}>
                  <AnimatedValue value={diff} />
                </span>
              </div>
            );
          },
        },
      ],
    },
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buscarPorCodigo = async () => {
    if (!formData.codEmpresa) return;

    try {
      const todas = await unwrap(window.api.obterEmpresas());
      const codigo = parseInt(formData.codEmpresa);
      const encontrada = todas.find((e) => e.CODIGO === codigo);

      if (encontrada) {
        setFormData((prev) => ({ ...prev, nomeEmpresa: encontrada.NOME }));
      } else {
        setFormData((prev) => ({ ...prev, nomeEmpresa: "" }));
        toast.warning("Empresa não encontrada");
      }
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
      toast.error("Erro ao buscar empresa");
      setFormData((prev) => ({ ...prev, nomeEmpresa: "" }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") buscarPorCodigo();
  };

  const buscarPlano = async () => {
    if (!formData.codPlano) return;

    try {
      const id = parseInt(formData.codPlano);
      const plano = await unwrap(window.api.planos.obterPorId(id));

      if (plano) {
        const nomeCorreto = plano.nome || "Sem Nome";
        setFormData((prev) => ({ ...prev, nomePlano: nomeCorreto }));
      } else {
        setFormData((prev) => ({ ...prev, nomePlano: "Plano não encontrado" }));
        toast.warning("Plano não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar plano:", error);
      toast.error("Erro ao buscar plano");
      setFormData((prev) => ({ ...prev, nomePlano: "Erro na busca" }));
    }
  };

  const handleKeyDownPlano = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") buscarPlano();
  };

  const abrirModalPesquisa = async () => {
    setModalAberto(true);
    setCarregandoLista(true);

    try {
      const dados = await unwrap(window.api.obterEmpresas());
      setListaEmpresas(dados);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar lista de empresas");
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

  const mesclarBalancetes = (
    contabil: BalanceteLinha[],
    fiscal: BalanceteLinha[],
  ): BalanceteLinhaExpandida[] => {
    const mapa = new Map<number, BalanceteLinhaExpandida>();

    contabil.forEach((item) => {
      mapa.set(item.contactb, {
        ...item,
        debitoFiscal: 0,
        creditoFiscal: 0,
      });
    });

    fiscal.forEach((item) => {
      const existente = mapa.get(item.contactb);
      if (existente) {
        existente.debitoFiscal = item.debito;
        existente.creditoFiscal = item.credito;
      } else {
        mapa.set(item.contactb, {
          ...item,
          debito: 0,
          credito: 0,
          debitoFiscal: item.debito,
          creditoFiscal: item.credito,
        });
      }
    });

    const listaCombinada = Array.from(mapa.values());

    return listaCombinada.sort((a, b) => {
      const partesA = a.classificacao.split(".").map((p) => parseInt(p) || 0);
      const partesB = b.classificacao.split(".").map((p) => parseInt(p) || 0);
      const maxLength = Math.max(partesA.length, partesB.length);

      for (let i = 0; i < maxLength; i++) {
        const valorA = partesA[i] || 0;
        const valorB = partesB[i] || 0;
        if (valorA !== valorB) return valorA - valorB;
      }
      return 0;
    });
  };

  const processarBalancete = async () => {
    // Validações
    if (!formData.codEmpresa || !formData.dataInicial || !formData.dataFinal) {
      toast.warning("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!formData.codPlano) {
      toast.warning("Informe o Código do Plano de Conciliação");
      return;
    }

    setLoading(true);
    setCarregandoBalancete(true);

    try {
      const codigoEmpresa = parseInt(formData.codEmpresa);
      const dataInicio = new Date(formData.dataInicial + "T00:00:00");
      const dataFim = new Date(formData.dataFinal + "T23:59:59");
      const planoId = parseInt(formData.codPlano);

      const [resultadoContabil, resultadoFiscal] = await Promise.all([
        unwrap(
          window.api.gerarBalancoPatrimonial(
            codigoEmpresa,
            dataInicio,
            dataFim,
            "FI",
          ),
        ),
        unwrap(
          window.api.gerarBalanceteFiscal(
            codigoEmpresa,
            dataInicio,
            dataFim,
            planoId,
          ),
        ),
      ]);

      const dadosMesclados = mesclarBalancetes(
        resultadoContabil,
        resultadoFiscal,
      );

      setBalancete(dadosMesclados);
      toast.success("Balancete processado com sucesso!");
    } catch (error) {
      console.error("Erro ao processar balancete:", error);
      toast.error(
        "Erro ao processar balancete. Verifique o console para mais detalhes.",
      );
    } finally {
      setLoading(false);
      setCarregandoBalancete(false);
    }
  };

  return (
    <div className="page-container">
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
                title="Pesquisar"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <Input
            label="Nome da Empresa"
            placeholder="Empresa..."
            value={formData.nomeEmpresa}
            disabled
            style={{ fontWeight: "600", color: "#333333" }}
          />
        </div>

        <div className="form-row">
          <Input
            label="Data Inicial"
            type="date"
            name="dataInicial"
            width="180px"
            value={formData.dataInicial}
            onChange={handleInputChange}
          />
          <Input
            label="Data Final"
            type="date"
            name="dataFinal"
            width="180px"
            value={formData.dataFinal}
            onChange={handleInputChange}
          />

          <div className="form-group" style={{ flex: "0 0 120px" }}>
            <label className="form-label">Cód. Plano</label>
            <input
              name="codPlano"
              className="form-input"
              placeholder="ID"
              value={formData.codPlano}
              onChange={handleInputChange}
              onBlur={buscarPlano}
              onKeyDown={handleKeyDownPlano}
            />
          </div>

          <Input
            label="Nome do Plano"
            name="nomePlano"
            placeholder="Nome do Plano..."
            value={formData.nomePlano}
            disabled
            style={{ fontWeight: "600", color: "#333333" }}
          />
        </div>

        <div className="form-actions">
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
        <div className="form-section" style={{ marginTop: "20px" }}>
          <Title title="Balanço patrimonial: contábil vs fiscal" />

          <Table<BalanceteLinhaExpandida>
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
          enableSearch={true}
          maxHeight="500px"
        />
      </Modal>
    </div>
  );
}
