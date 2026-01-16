import React, { useState, type KeyboardEvent } from "react";
import { Search, Loader2, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Title } from "@components/ui/Title";
import { Modal } from "@components/ui/Modal";
import { Table, type Column } from "@components/ui/Table";
import "./styles.css";

interface ItemForm {
  cfop: string;
  descricao: string;
  contasDebito: string;
  contasCredito: string;
  contabiliza: boolean;
}

const EMPRESA_PADRAO = 1;

export function PlanosConciliacao() {
  const [formData, setFormData] = useState({
    id: null as number | null,
    codPlano: "",
    nomePlano: "",
  });

  const [loading, setLoading] = useState(false);
  const [planoCarregado, setPlanoCarregado] = useState(false);

  const [itensPlano, setItensPlano] = useState<any[]>([]);

  const [modalBuscaAberto, setModalBuscaAberto] = useState(false);
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [modalNaturezaAberto, setModalNaturezaAberto] = useState(false);

  const [listaPlanos, setListaPlanos] = useState<any[]>([]);
  const [listaNaturezas, setListaNaturezas] = useState<any[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [buscandoNatureza, setBuscandoNatureza] = useState(false);

  const [indiceEmEdicao, setIndiceEmEdicao] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({
    cfop: "",
    descricao: "",
    contasDebito: "",
    contasCredito: "",
    contabiliza: true,
  });

  const colunasPlanos: Column<any>[] = [
    { header: "Cód.", accessor: "id", width: "80px" },
    { header: "Nome do Plano", accessor: "nome_plano" },
  ];

  const colunasItens: Column<any>[] = [
    {
      header: "CFOP",
      accessor: "cfop",
      width: "80px",
      render: (row) => (
        <span style={{ fontWeight: "bold", color: "#334155" }}>{row.cfop}</span>
      ),
    },
    {
      header: "Descrição",
      accessor: "descricao",
      width: "auto",
      render: (row) => (
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          {row.descricao}
        </span>
      ),
    },
    {
      header: "Débito",
      accessor: "contasDebito",
      width: "140px",
      render: (row) => (
        <span
          style={{
            fontSize: "12px",
            color: "#3b82f6",
            backgroundColor: "#eff6ff",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {row.contasDebito?.join(", ") || "-"}
        </span>
      ),
    },
    {
      header: "Crédito",
      accessor: "contasCredito",
      width: "140px",
      render: (row) => (
        <span
          style={{
            fontSize: "12px",
            color: "#10b981",
            backgroundColor: "#ecfdf5",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {row.contasCredito?.join(", ") || "-"}
        </span>
      ),
    },
    {
      header: "Contabiliza",
      accessor: "contabiliza",
      width: "80px",
      align: "center",
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {row.contabiliza ? (
            <Check size={16} className="text-emerald-600" />
          ) : (
            <X size={16} className="text-slate-300" />
          )}
        </div>
      ),
    },
    {
      header: "Ações",
      accessor: "actions",
      width: "100px",
      align: "center",
      render: (_, index) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            className="btn-icon-sm"
            onClick={() => abrirModalEdicaoItem(index)}
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            className="btn-icon-sm btn-icon-sm-danger"
            onClick={() => removerItem(index)}
            title="Remover"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buscarPorCodigo = async () => {
    if (!formData.codPlano) return;

    setLoading(true);
    try {
      const id = parseInt(formData.codPlano);
      // @ts-ignore
      const plano = await window.api.planos.obterPorId(id);

      if (plano) {
        setFormData({
          id: plano.id,
          codPlano: String(plano.id),
          nomePlano: plano.nome,
        });
        setItensPlano(plano.itens || []);
        setPlanoCarregado(true);
      } else {
        setFormData((prev) => ({ ...prev, id: null, nomePlano: "" }));
        setItensPlano([]);
        setPlanoCarregado(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const salvarTudo = async () => {
    setLoading(true);
    try {
      const payload = {
        id: formData.id,
        nome: formData.nomePlano,
        ativo: true,
        itens: itensPlano,
      };
      // @ts-ignore
      const novoId = await window.api.planos.salvar(payload);
      setFormData((prev) => ({
        ...prev,
        id: novoId,
        codPlano: String(novoId),
      }));
      setPlanoCarregado(true);
    } catch (error) {
      // TODO: tratar erro futuramente
    } finally {
      setLoading(false);
    }
  };

  const parseContas = (str: string) =>
    str
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

  const abrirModalNovoItem = () => {
    setIndiceEmEdicao(null);
    setItemForm({
      cfop: "",
      descricao: "",
      contasDebito: "",
      contasCredito: "",
      contabiliza: true,
    });
    setModalItemAberto(true);
  };

  const abrirModalEdicaoItem = (index: number) => {
    const item = itensPlano[index];
    setIndiceEmEdicao(index);
    setItemForm({
      cfop: String(item.cfop),
      descricao: item.descricao,
      contasDebito: item.contasDebito?.join(", ") || "",
      contasCredito: item.contasCredito?.join(", ") || "",
      contabiliza: item.contabiliza,
    });
    setModalItemAberto(true);
  };

  const confirmarModalItem = () => {
    const novoItem = {
      cfop: parseInt(itemForm.cfop),
      descricao: itemForm.descricao || "Sem descrição",
      contasDebito: parseContas(itemForm.contasDebito),
      contasCredito: parseContas(itemForm.contasCredito),
      contabiliza: itemForm.contabiliza,
    };
    const lista = [...itensPlano];
    if (indiceEmEdicao !== null)
      lista[indiceEmEdicao] = { ...lista[indiceEmEdicao], ...novoItem };
    else lista.push(novoItem);

    setItensPlano(lista);
    setModalItemAberto(false);
  };

  const removerItem = (index: number) => {
    const lista = [...itensPlano];
    lista.splice(index, 1);
    setItensPlano(lista);
  };

  const buscarNaturezaPorCodigo = async () => {
    if (!itemForm.cfop || buscandoNatureza) return;
    setBuscandoNatureza(true);
    try {
      // @ts-ignore
      const nat = await window.api.naturezas.buscarPorCodigo(
        EMPRESA_PADRAO,
        parseInt(itemForm.cfop)
      );
      if (nat) setItemForm((prev) => ({ ...prev, descricao: nat.DESCRCFOP }));
    } catch {
    } finally {
      setBuscandoNatureza(false);
    }
  };

  const abrirModalPesquisa = async () => {
    setModalBuscaAberto(true);
    setCarregandoLista(true);
    try {
      // @ts-ignore
      const dados = await window.api.planos.listar();
      setListaPlanos(dados);
    } catch {
      // TODO: tratar erro futuramente
    } finally {
      setCarregandoLista(false);
    }
  };

  const selecionarPlanoNoModal = (plano: any) => {
    setFormData({
      id: plano.id,
      codPlano: String(plano.id),
      nomePlano: plano.nome_plano,
    });
    setModalBuscaAberto(false);
    setTimeout(() => buscarPorCodigo(), 100);
  };

  return (
    <div className="animate-fade-in">
      <div className="form-section">
        <Title title="Manutenção de Planos de Conciliação" />

        <div className="form-row">
          <div className="form-group" style={{ flex: "0 0 120px" }}>
            <label className="form-label">Cód. Plano</label>
            <div className="input-group">
              <input
                name="codPlano"
                className="form-input"
                placeholder="Auto"
                value={formData.codPlano}
                onChange={handleInputChange}
                onBlur={buscarPorCodigo}
                onKeyDown={(e) => e.key === "Enter" && buscarPorCodigo()}
              />
              <button
                className="input-group-btn"
                onClick={abrirModalPesquisa}
                title="Pesquisar (F2)"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <Input
            label="Nome do Plano"
            name="nomePlano"
            placeholder="Ex: Indústria - Lucro Real"
            value={formData.nomePlano}
            onChange={handleInputChange}
            style={{ fontWeight: "bold", color: "#334155" }}
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
            onClick={salvarTudo}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>
      </div>

      {planoCarregado && (
        <div className="form-section" style={{ marginTop: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Title title={`Itens do Plano (${itensPlano.length})`} />
            <button
              className="btn-success"
              onClick={abrirModalNovoItem}
              style={{ fontSize: "13px", padding: "6px 12px" }}
            >
              <Plus size={16} style={{ marginRight: 5 }} /> Adicionar CFOP
            </button>
          </div>

          <Table
            data={itensPlano}
            columns={colunasItens}
            enableSearch={false}
          />
        </div>
      )}

      <Modal
        isOpen={modalBuscaAberto}
        onClose={() => setModalBuscaAberto(false)}
        title="Pesquisar Plano"
      >
        <Table
          data={listaPlanos}
          columns={colunasPlanos}
          onRowClick={selecionarPlanoNoModal}
          isLoading={carregandoLista}
          enableSearch={true}
        />
      </Modal>

      <Modal
        isOpen={modalItemAberto}
        onClose={() => setModalItemAberto(false)}
        title={indiceEmEdicao !== null ? "Editar Item" : "Novo Item"}
      >
        <div className="form-content-modal" style={{ padding: "10px" }}>
          <div className="form-row">
            <div className="form-group" style={{ flex: "0 0 140px" }}>
              <label className="form-label">CFOP</label>
              <div className="input-group">
                <input
                  className="form-input"
                  value={itemForm.cfop}
                  onChange={(e) =>
                    setItemForm((prev) => ({ ...prev, cfop: e.target.value }))
                  }
                  onBlur={buscarNaturezaPorCodigo}
                  autoFocus
                />
                <button
                  className="input-group-btn"
                  onClick={() => {
                    setModalNaturezaAberto(true);
                  }}
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
            <Input
              label="Descrição"
              value={itemForm.descricao}
              readOnly
              style={{ backgroundColor: "#f8fafc" }}
            />
          </div>

          <div className="form-row">
            <Input
              label="Contas Débito"
              value={itemForm.contasDebito}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  contasDebito: e.target.value,
                }))
              }
              placeholder="Ex: 150, 155"
            />
            <Input
              label="Contas Crédito"
              value={itemForm.contasCredito}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  contasCredito: e.target.value,
                }))
              }
              placeholder="Ex: 300, 400"
            />
          </div>

          <div style={{ marginTop: 15 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={itemForm.contabiliza}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    contabiliza: e.target.checked,
                  }))
                }
                style={{ width: 16, height: 16 }}
              />
              <span style={{ fontSize: 14 }}>Contabilizar lançamentos?</span>
            </label>
          </div>

          <div
            style={{
              marginTop: 25,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              className="btn-danger"
              onClick={() => setModalItemAberto(false)}
            >
              Cancelar
            </button>
            <button className="btn-primary" onClick={confirmarModalItem}>
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalNaturezaAberto}
        onClose={() => setModalNaturezaAberto(false)}
        title="Pesquisar Natureza"
      >
        <div style={{ padding: 20, textAlign: "center" }}>
          Lista de Naturezas...
        </div>
      </Modal>
    </div>
  );
}
