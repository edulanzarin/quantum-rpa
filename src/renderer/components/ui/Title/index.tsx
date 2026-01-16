import React from "react";
import "./styles.css";

interface TitleProps {
  title: string;
  subtitle?: string;
}

export function Title({ title }: TitleProps) {
  return <h2 className="form-title">{title}</h2>;
}
