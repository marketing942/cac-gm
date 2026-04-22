"use client";

import { useState, useEffect, useRef } from "react";

interface EditCellProps {
  value: number;
  onChange: (v: number) => void;
  width?: number;
  readOnly?: boolean;
}

export function EditCell({ value, onChange, width = 82, readOnly = false }: EditCellProps) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => setTmp(String(value)), [value]);
  useEffect(() => {
    if (editing && ref.current) ref.current.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    onChange(Number(tmp) || 0);
  };

  if (readOnly) {
    return (
      <div
        style={{ width, fontFeatureSettings: "'tnum'" }}
        className="px-2 py-[5px] text-right text-[13px] text-fg-body"
      >
        {value ? value.toLocaleString("pt-BR") : "0"}
      </div>
    );
  }

  if (editing) {
    return (
      <input
        ref={ref}
        autoFocus
        type="number"
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{ width, fontFeatureSettings: "'tnum'" }}
        className="rounded-[5px] border-[1.5px] border-amber-400 bg-amber-400/10
                   px-2 py-[5px] text-right text-[13px] text-fg outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clique para editar"
      style={{ width, fontFeatureSettings: "'tnum'" }}
      className="cursor-pointer rounded-[5px] border border-dashed border-amber-400/35
                 bg-amber-400/[0.08] px-2 py-[5px] text-right text-[13px] text-fg
                 transition-colors hover:border-amber-400/60 hover:bg-amber-400/15"
    >
      {value ? value.toLocaleString("pt-BR") : "0"}
    </div>
  );
}
