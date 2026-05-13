import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "#", label: "Блэклист", disabled: true },
  { to: "#", label: "Промпты", disabled: true },
  { to: "#", label: "Трейсы", disabled: true },
  { to: "/", label: "Бенчмарки", end: true },
];

export default function AdminShell() {
  return (
    <div className="admin-root">
      <header className="admin-top">
        <nav className="admin-tabs" aria-label="Разделы">
          {tabs.map((t) =>
            t.disabled ? (
              <span key={t.label} className="admin-tab admin-tab--disabled">
                {t.label}
              </span>
            ) : (
              <NavLink
                key={t.label}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  "admin-tab" + (isActive ? " admin-tab--active" : "")
                }
              >
                {t.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="admin-top-tools">
          <nav className="admin-subnav" style={{ padding: 0, marginRight: "0.5rem" }}>
            <NavLink to="/runs">Запуски</NavLink>
            <NavLink to="/compare">Сравнение</NavLink>
          </nav>
          <div className="admin-search">
            <span className="admin-search-icon" aria-hidden>
              ⌕
            </span>
            <input type="search" placeholder="Искать..." readOnly />
          </div>
        </div>
      </header>
      <div className="admin-page">
        <Outlet />
      </div>
    </div>
  );
}
