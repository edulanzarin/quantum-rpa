import React, { useState, type KeyboardEvent } from "react";
import { Search, Loader2, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Input } from "@components/ui/Input";
import { Title } from "@components/ui/Title";
import { Modal } from "@components/ui/Modal";
import { Table, type Column } from "@components/ui/Table";
import "../styles.css";

interface Natureza {
  CODIGOCFOP: number;
  DESCRCFOP: string;
}

interface ItemForm {
  cfop: string;
  descricao: string;
  contasDebito: string;
  contasCredito: string;
  contabiliza: boolean;
}

const EMPRESA_PADRAO = 557;

export function PlanosConciliacao() {
  const [formData, setFormData] = useState({
    id: null as number | null,
    codPlano: "",
    nomePlano: "",
  });

  const [loading, setLoading] = useState(false);
  const [planoCarregado, setPlanoCarregado] = useState(false);

  const [itensPlano, setItensPlano] = useState<any[]>([]);
  const [buscaItens, setBuscaItens] = useState("");

  const [modalBuscaAberto, setModalBuscaAberto] = useState(false);
  const [modalItemAberto, setModalItemAberto] = useState(false);
  const [modalNaturezaAberto, setModalNaturezaAberto] = useState(false);

  const [listaPlanos, setListaPlanos] = useState<any[]>([]);
  const [listaNaturezas, setListaNaturezas] = useState<Natureza[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [carregandoNaturezas, setCarregandoNaturezas] = useState(false);

  const [indiceEmEdicao, setIndiceEmEdicao] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({
    cfop: "",
    descricao: "",
    contasDebito: "",
    contasCredito: "",
    contabiliza: true,
  });

  const itensFiltrados = itensPlano.filter((item) => {
    if (!buscaItens) return true;
    const termo = buscaItens.toLowerCase();
    return (
      String(item.cfop).includes(termo) ||
      (item.descricao && item.descricao.toLowerCase().includes(termo))
    );
  });

  const colunasPlanos: Column<any>[] = [
    { header: "Cód.", accessor: "id", width: "80px" },
    { header: "Nome do Plano", accessor: "nome_plano" },
  ];

  const colunasNatureza: Column<Natureza>[] = [
    { header: "CFOP", accessor: "CODIGOCFOP", width: "80px" },
    { header: "Descrição", accessor: "DESCRCFOP" },
  ];

  const colunasItens: Column<any>[] = [
    {
      header: "CFOP",
      accessor: "cfop",
      width: "80px",
      render: (row) => (
        <span style={{ fontWeight: "600", color: "#333333" }}>{row.cfop}</span>
      ),
    },
    {
      header: "Descrição",
      accessor: "descricao",
      width: "auto",
      render: (row) => (
        <span style={{ fontSize: "0.85rem", color: "#666666" }}>
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
            fontSize: "0.8rem",
            color: "#333333",
            backgroundColor: "#f5f5f5",
            padding: "2px 6px",
            borderRadius: "3px",
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
            fontSize: "0.8rem",
            color: "#333333",
            backgroundColor: "#f5f5f5",
            padding: "2px 6px",
            borderRadius: "3px",
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
            <Check size={16} style={{ color: "#666666" }} />
          ) : (
            <X size={16} style={{ color: "#cccccc" }} />
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
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
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
      console.error(error);
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
    const itemVisual = itensFiltrados[index];
    const indexReal = itensPlano.indexOf(itemVisual);

    setIndiceEmEdicao(indexReal);
    const item = itensPlano[indexReal];

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
    const itemVisual = itensFiltrados[index];
    const indexReal = itensPlano.indexOf(itemVisual);

    const lista = [...itensPlano];
    lista.splice(indexReal, 1);
    setItensPlano(lista);
  };

  const buscarNaturezaPorCodigo = async () => {
    if (!itemForm.cfop) return;
    try {
      // @ts-ignore
      const nat = await window.api.naturezas.buscarPorCodigo(
        EMPRESA_PADRAO,
        parseInt(itemForm.cfop),
      );
      if (nat) setItemForm((prev) => ({ ...prev, descricao: nat.DESCRCFOP }));
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalNatureza = async () => {
    setModalNaturezaAberto(true);
    setCarregandoNaturezas(true);
    try {
      // @ts-ignore
      const dados = await window.api.naturezas.listar(EMPRESA_PADRAO, "");
      setListaNaturezas(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregandoNaturezas(false);
    }
  };

  const selecionarNatureza = (nat: Natureza) => {
    setItemForm((prev) => ({
      ...prev,
      cfop: String(nat.CODIGOCFOP),
      descricao: nat.DESCRCFOP,
    }));
    setModalNaturezaAberto(false);
  };

  const abrirModalPesquisa = async () => {
    setModalBuscaAberto(true);
    setCarregandoLista(true);
    try {
      // @ts-ignore
      const dados = await window.api.planos.listar();
      setListaPlanos(dados);
    } catch (error) {
      console.error(error);
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
    <div className="page-container">
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
                title="Pesquisar"
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
            style={{ fontWeight: "600", color: "#333333" }}
          />
        </div>

        <div className="form-actions">
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
        <div className="form-section" style={{ marginTop: "20px" }}>
          <div className="section-header">
            <Title title={`Itens do Plano (${itensFiltrados.length})`} />

            <div className="section-actions">
              <div className="input-group" style={{ width: "250px" }}>
                <input
                  className="form-input"
                  placeholder="Pesquisar CFOP ou Descrição..."
                  value={buscaItens}
                  onChange={(e) => setBuscaItens(e.target.value)}
                />
                <button className="input-group-btn" disabled>
                  <Search size={16} />
                </button>
              </div>

              <button className="btn-primary" onClick={abrirModalNovoItem}>
                Adicionar Conciliação
              </button>
            </div>
          </div>

          <Table
            data={itensFiltrados}
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
        <div className="modal-form">
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
                  onClick={abrirModalNatureza}
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
            <Input
              label="Descrição"
              value={itemForm.descricao}
              readOnly
              style={{ backgroundColor: "#f5f5f5" }}
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

          <div style={{ marginTop: 12 }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={itemForm.contabiliza}
                onChange={(e) =>
                  setItemForm((prev) => ({
                    ...prev,
                    contabiliza: e.target.checked,
                  }))
                }
              />
              <span>Contabiliza?</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
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
        title="Pesquisar Natureza (CFOP)"
      >
        <Table<Natureza>
          data={listaNaturezas}
          columns={colunasNatureza}
          onRowClick={selecionarNatureza}
          isLoading={carregandoNaturezas}
          enableSearch={true}
        />
      </Modal>
    </div>
  );
}
