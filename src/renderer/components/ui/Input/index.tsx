import React, { type InputHTMLAttributes } from "react";
import "./styles.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  width?: string;
}

export function Input({ label, width, className, ...props }: InputProps) {
  return (
    <div className="form-group" style={{ flex: width ? `0 0 ${width}` : "1" }}>
      {label && <label className="form-label">{label}</label>}
      <input className={`form-input ${className || ""}`} {...props} />
    </div>
  );
}
