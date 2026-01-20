import React, { useState, useMemo } from "react";
import { Input } from "../Input";
import "./styles.css";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  width?: string;
  format?: (value: any) => React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  columns?: Column<T>[];
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  enableSearch?: boolean;
  isLoading?: boolean;
  maxHeight?: string;
  minHeight?: string; // ← NOVO
  adaptiveHeight?: boolean; // ← NOVO
  heightOffset?: string; // ← NOVO
}

export function Table<T extends { [key: string]: any }>({
  data,
  columns,
  onRowClick,
  enableSearch = true,
  isLoading = false,
  maxHeight,
  minHeight = "300px",
  adaptiveHeight = false,
  heightOffset = "0px",
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const tableWrapperStyle = useMemo((): React.CSSProperties => {
    if (adaptiveHeight) {
      return {
        maxHeight: maxHeight,
        minHeight: minHeight,
        height: `calc(100vh - ${heightOffset})`,
        overflowY: "auto",
      };
    }
    return {
      maxHeight: maxHeight || "none",
      overflowY: maxHeight ? "auto" : "visible",
    };
  }, [adaptiveHeight, maxHeight, minHeight, heightOffset]);

  const flatColumns = useMemo(() => {
    return columns.flatMap((col) => col.columns || col);
  }, [columns]);

  const hasGroupedHeader = columns.some((col) => col.columns);

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return flatColumns.some((col) => {
      if (!col.accessor) return false;
      const value = item[col.accessor];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="table-container">
      {enableSearch && (
        <div style={{ marginBottom: 4 }}>
          <Input
            placeholder="Filtrar dados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="table-wrapper" style={tableWrapperStyle}>
        <table className="ui-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                  colSpan={col.columns ? col.columns.length : 1}
                  rowSpan={hasGroupedHeader && !col.columns ? 2 : 1}
                  className={col.columns ? "th-grouped" : ""}
                >
                  {col.header}
                </th>
              ))}
            </tr>
            {hasGroupedHeader && (
              <tr>
                {columns.map((col) => {
                  if (col.columns) {
                    return col.columns.map((subCol, subIndex) => (
                      <th
                        key={`${col.header}-${subIndex}`}
                        style={{
                          width: subCol.width,
                          textAlign: subCol.align || "left",
                        }}
                      >
                        {subCol.header}
                      </th>
                    ));
                  }
                  return null;
                })}
              </tr>
            )}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={flatColumns.length} className="table-empty">
                  Carregando dados...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {flatColumns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render
                        ? col.render(row, rowIndex)
                        : col.accessor && col.format
                          ? col.format(row[col.accessor])
                          : col.accessor
                            ? row[col.accessor]
                            : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={flatColumns.length} className="table-empty">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
