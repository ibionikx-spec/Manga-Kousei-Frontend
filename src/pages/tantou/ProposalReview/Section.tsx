import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function Section({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pr-section">
      <button className="pr-section__head" onClick={() => setOpen((v) => !v)}>
        <span className="pr-section__icon">{icon}</span>
        <span className="pr-section__title">{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="pr-section__body">{children}</div>}
    </div>
  );
}
