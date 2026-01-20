"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoContabilRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const BaseRepository_1 = require("./BaseRepository");
class LancamentoContabilRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtém lançamentos contábeis por origem e período.
     */
    async obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT
          CODIGOEMPRESA,
          CHAVELCTOCTB,
          DATALCTOCTB,
          CODIGOORIGLCTOCTB,
          CONTACTBDEB,
          CONTACTBCRED,
          VALORLCTOCTB,
          CHAVEORIGEM,
          TRANSCTB
        FROM LCTOCTB
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOCTB BETWEEN ? AND ?
          AND CODIGOORIGLCTOCTB = ?
        ORDER BY DATALCTOCTB, CHAVELCTOCTB
      `;
            const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, [
                codigoEmpresa,
                dataInicio,
                dataFim,
                origem,
            ]));
            return dadosBrutos.map((row) => ({
                CODIGOEMPRESA: row.CODIGOEMPRESA,
                CHAVELCTOCTB: row.CHAVELCTOCTB,
                DATALCTOCTB: row.DATALCTOCTB,
                CODIGOORIGLCTOCTB: row.CODIGOORIGLCTOCTB,
                CONTACTBDEB: row.CONTACTBDEB,
                CONTACTBCRED: row.CONTACTBCRED,
                VALORLCTOCTB: row.VALORLCTOCTB,
                CHAVEORIGEM: row.CHAVEORIGEM,
                TRANSCTB: row.TRANSCTB,
            }));
        }, `obter lançamentos contábeis da empresa ${codigoEmpresa}`);
    }
}
exports.LancamentoContabilRepository = LancamentoContabilRepository;
