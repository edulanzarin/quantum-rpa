import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calculator,
  ClipboardCheck,
  FileText,
  TrendingUp,
  Box,
  ChevronRight,
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
            icon: null,
            path: "/contabil/conferencia-bp",
          },
          {
            label: "Planos de Conciliação",
            icon: null,
            path: "/contabil/planos_conciliacao",
          },
        ],
      },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      setOpenMenu(null);
    }
  };

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child));
    }
    return false;
  };

  return (
    <aside className="icon-sidebar" ref={sidebarRef}>
      <div className="icon-sidebar-header">
        <Box size={22} />
      </div>

      <nav className="icon-nav">
        {menuItems.map((item) => (
          <div key={item.label} className="icon-menu-wrapper">
            <div
              className={`icon-item ${isActive(item) || openMenu === item.label ? "active" : ""}`}
              onClick={() =>
                item.children
                  ? toggleMenu(item.label)
                  : handleNavigate(item.path)
              }
            >
              <item.icon size={20} strokeWidth={1.5} />
            </div>

            {item.children && openMenu === item.label && (
              <div className="flyout-menu">
                <div className="flyout-header">{item.label}</div>

                <div className="flyout-content">
                  {item.children.map((subItem) => (
                    <div key={subItem.label} className="flyout-group">
                      <div className="flyout-group-title">
                        {subItem.icon && (
                          <subItem.icon size={13} style={{ marginRight: 6 }} />
                        )}
                        {subItem.label}
                      </div>

                      {subItem.children ? (
                        subItem.children.map((child) => (
                          <div
                            key={child.label}
                            className={`flyout-link ${location.pathname === child.path ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(child.path);
                            }}
                          >
                            <span className="dot" />
                            {child.label}
                          </div>
                        ))
                      ) : (
                        <div
                          className={`flyout-link ${location.pathname === subItem.path ? "active" : ""}`}
                          onClick={() => handleNavigate(subItem.path)}
                        >
                          <span className="dot" />
                          {subItem.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="icon-footer"></div>
    </aside>
  );
}
