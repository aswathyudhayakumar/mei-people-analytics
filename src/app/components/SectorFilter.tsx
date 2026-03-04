"use client";

import { useEffect, useRef, useState } from "react";

const SECTORS = ["Tech", "Healthcare", "Finance", "Public Sector"] as const;
export type Sector = (typeof SECTORS)[number];

export default function SectorFilter({
  selected,
  onChange,
}: {
  selected: Sector[];
  onChange: (sectors: Sector[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(s: Sector) {
    if (selected.includes(s)) {
      onChange(selected.filter((x) => x !== s));
    } else {
      onChange([...selected, s]);
    }
  }

  const hasSelection = selected.length > 0;

  return (
    <div className="sector-filter-wrapper" ref={wrapperRef}>
      <button
        className={`sector-btn ${hasSelection ? "sector-btn--active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>Sector</span>
        {hasSelection && (
          <span
            style={{
              fontSize: "0.6875rem",
              opacity: 0.7,
            }}
          >
            ({selected.length})
          </span>
        )}
        <span className={`sector-chevron ${open ? "sector-chevron--open" : ""}`}>
          {"▾"}
        </span>
      </button>
      {open && (
        <div className="sector-dropdown" role="listbox" aria-multiselectable>
          {SECTORS.map((s) => {
            const checked = selected.includes(s);
            return (
              <button
                key={s}
                className="sector-option"
                role="option"
                aria-selected={checked}
                onClick={() => toggle(s)}
              >
                <span
                  className={`sector-checkbox ${checked ? "sector-checkbox--checked" : ""}`}
                />
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
