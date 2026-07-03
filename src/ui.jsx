export function Button({ children, onClick, variant = "primary", type = "button", disabled = false }) {
  return <button type={type} className={`button ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Progress({ value, tone = "gold" }) {
  return <div className="progress"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function Panel({ eyebrow, title, text, children, className = "" }) {
  return <section className={`panel ${className}`}>
    {(eyebrow || title) && <header className="panel-head"><div>{eyebrow && <p>{eyebrow}</p>}{title && <h2>{title}</h2>}{text && <span>{text}</span>}</div></header>}
    {children}
  </section>;
}

export function Metric({ label, value, detail, tone = "gold", icon }) {
  return <article className={`metric ${tone}`}><div><small>{label}</small><i>{icon}</i></div><b>{value}</b><span>{detail}</span></article>;
}

export function Avatar({ initials, tone = "gold" }) {
  return <span className={`avatar ${tone}`}>{initials}</span>;
}

export function PageHeading({ eyebrow, title, text, action }) {
  return <header className="page-heading"><div><p>{eyebrow}</p><h1>{title}</h1><span>{text}</span></div>{action && <div className="page-action">{action}</div>}</header>;
}
