import Firebird from "node-firebird";
import dotenv from "dotenv";
import { DatabaseConnection } from "./DatabaseConnection";
import { DatabaseError } from "@errors";

dotenv.config();

const options: any = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  lowercase_keys: false,
  role: undefined,
  pageSize: 4096,
  charset: "OCTETS",
  retryConnectionInterval: 1000,
};

/**
 * Conexão com banco Firebird (Questor).
 */
class QuestorConnection extends DatabaseConnection {
  async testarConexao(): Promise<boolean> {
    return new Promise((resolve) => {
      Firebird.attach(options, (err, db) => {
        if (err) {
          console.error("❌ Erro ao conectar no Firebird:", err.message);
          resolve(false);
          return;
        }

        console.log("✅ Conectado ao banco Questor (Firebird)");
        db.detach();
        resolve(true);
      });
    });
  }

  async executarQuery(query: string, params: any[] = []): Promise<any> {
    return this.executarComRetry(async () => {
      return new Promise((resolve, reject) => {
        Firebird.attach(options, (err, db) => {
          if (err) {
            reject(new DatabaseError("Erro ao conectar no Firebird", err));
            return;
          }

          db.query(query, params, (err, result) => {
            db.detach();

            if (err) {
              reject(new DatabaseError("Erro ao executar query", err));
              return;
            }

            resolve(result);
          });
        });
      });
    }, "executar query no Firebird");
  }
}

// Singleton
const questorConnection = new QuestorConnection();

// Função legacy para compatibilidade
export const testarConexao = () => questorConnection.testarConexao();
export const executeQuery = (query: string, params?: any[]) =>
  questorConnection.executarQuery(query, params);

export default questorConnection;
