import Firebird from "node-firebird";
import dotenv from "dotenv";

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

export const testarConexao = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    Firebird.attach(options, (err, db) => {
      if (err) {
        console.error("Erro ao conectar no Firebird:", err.message);
        resolve(false);
        return;
      }

      console.log("Sucesso! Conectado ao banco Questor.");
      db.detach();
      resolve(true);
    });
  });
};

export const executeQuery = async (query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, (err, db) => {
      if (err) return reject(err);

      db.query(query, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
};
