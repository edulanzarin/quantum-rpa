import React, { type SelectHTMLAttributes } from "react";
import "./styles.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  width?: string;
}

export function Select({
  label,
  options,
  width,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="form-group" style={{ flex: width ? `0 0 ${width}` : "1" }}>
      {label && <label className="form-label">{label}</label>}
      <select className={`form-select ${className || ""}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
