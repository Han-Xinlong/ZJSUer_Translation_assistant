import { BookOpen, LogOut } from "lucide-react";

const navigationItems = [
  { id: "workspace", label: "写作台" },
  { id: "expressions", label: "表达库" },
  { id: "errors", label: "表达改进库" },
  { id: "history", label: "历史详情" },
  { id: "profile", label: "学习档案" },
  { id: "community", label: "社群互学" }
];

function Sidebar({ activeView, currentUser, hasHistory, onLogout, onViewChange }) {
  return (
    <aside className="sidebar" aria-label="学习记录">
      <div className="brand">
        <BookOpen size={24} aria-hidden="true" />
        <div>
          <strong>ZJSUer</strong>
          <span>{currentUser?.display_name || "AI Translation"}</span>
        </div>
      </div>

      <nav className="nav-list">
        {navigationItems.map((item) => (
          <button
            className={activeView === item.id ? "nav-item active" : "nav-item"}
            disabled={item.id === "history" && !hasHistory}
            key={item.id}
            onClick={() => onViewChange(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="logout-button" onClick={onLogout} type="button">
        <LogOut size={16} aria-hidden="true" />
        退出
      </button>
    </aside>
  );
}

export default Sidebar;
