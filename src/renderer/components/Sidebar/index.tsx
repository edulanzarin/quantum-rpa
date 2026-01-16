import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calculator,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Menu,
  FileText,
  TrendingUp,
} from "lucide-react";
import "./styles.css";

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Contábil",
    icon: Calculator,
    children: [
      {
        label: "Conferência Fiscal",
        icon: ClipboardCheck,
        children: [
          {
            label: "Balanço Patrimonial",
            path: "/contabil/conferencia-bp",
            icon: undefined,
          },
          {
            label: "Planos de Conciliação",
            path: "/contabil/planos_conciliacao",
            icon: undefined,
          },
        ],
      },
      {
        label: "Lançamentos",
        icon: FileText,
        children: [
          {
            label: "Lançamentos Fiscais",
            path: "/contabil/lancamentos-fiscais",
            icon: undefined,
          },
          {
            label: "Lançamentos Contábeis",
            path: "/contabil/lancamentos-contabeis",
            icon: undefined,
          },
          {
            label: "Lançamentos de Entrada",
            path: "/contabil/lancamentos-entrada",
            icon: undefined,
          },
          {
            label: "Lançamentos de Saída",
            path: "/contabil/lancamentos-saida",
            icon: undefined,
          },
        ],
      },
      {
        label: "Apuração",
        icon: TrendingUp,
        children: [
          {
            label: "Apuração ICMS",
            path: "/contabil/apuracao-icms",
            icon: undefined,
          },
          {
            label: "Apuração PIS/COFINS",
            path: "/contabil/apuracao-pis-cofins",
            icon: undefined,
          },
          {
            label: "Apuração IPI",
            path: "/contabil/apuracao-ipi",
            icon: undefined,
          },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0 });
  const navigate = useNavigate();
  const location = useLocation();

  // Fechar popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".submenu-item") && !target.closest(".popover")) {
        setHoveredSubmenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleMenu = (label: string) => {
    if (!expanded) setExpanded(true);
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleSubmenuClick = (
    label: string,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({ top: rect.top });
    // Toggle: se já está aberto, fecha; se está fechado, abre
    setHoveredSubmenu(hoveredSubmenu === label ? null : label);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      setHoveredSubmenu(null);
    }
  };

  return (
    <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <span className="brand">Quantum ERP</span>
        <button onClick={() => setExpanded(!expanded)} className="toggle-btn">
          <Menu size={20} />
        </button>
      </div>

      <nav className="menu-list">
        {menuItems.map((item) => (
          <div key={item.label} className="menu-wrapper">
            {/* Menu Principal */}
            <div
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() =>
                item.children
                  ? toggleMenu(item.label)
                  : handleNavigate(item.path)
              }
            >
              <item.icon size={18} className="menu-icon" />
              <span className="menu-label">{item.label}</span>

              {item.children && expanded && (
                <span className="chevron">
                  {openMenus.includes(item.label) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </span>
              )}
            </div>

            {/* Submenus (expandidos abaixo) */}
            {item.children && openMenus.includes(item.label) && expanded && (
              <div className="submenu">
                {item.children.map((child) => (
                  <div key={child.label} className="submenu-wrapper">
                    <div
                      className="submenu-item"
                      onClick={(e) =>
                        child.children
                          ? handleSubmenuClick(child.label, e)
                          : handleNavigate(child.path)
                      }
                    >
                      {child.icon && (
                        <child.icon size={16} className="submenu-icon" />
                      )}
                      <span>{child.label}</span>
                      {child.children && (
                        <ChevronRight size={14} className="submenu-arrow" />
                      )}
                    </div>

                    {/* Popover Lateral com opções finais */}
                    {child.children && hoveredSubmenu === child.label && (
                      <div
                        className="popover"
                        style={{ top: popoverPosition.top }}
                      >
                        <div className="popover-header">{child.label}</div>
                        <div className="popover-content">
                          {child.children.map((option) => (
                            <div
                              key={option.label}
                              className={`popover-item ${
                                location.pathname === option.path
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => handleNavigate(option.path)}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
