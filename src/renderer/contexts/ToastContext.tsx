import { createContext, useState, useCallback, type ReactNode } from "react";
import { Toast, type ToastType } from "@components/Toast";

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextData {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextData>(
  {} as ToastContextData,
);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prev) => [...prev, { id, type, message, duration }]);
    },
    [],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast("success", message, duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast("error", message, duration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast("warning", message, duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast("info", message, duration);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
