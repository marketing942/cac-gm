"use client";

import { useState, useEffect, useRef } from "react";

interface EditCellProps {
  value: number;
  onChange: (v: number) => void;
  width?: number;
}

export function EditCell({ value, onChange, width = 82 }: EditCellProps) {
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
                   px-2 py-[5px] text-right text-[13px] text-zinc-50 outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clique para editar"
      style={{ width, fontFeatureSettings: "'tnum'" }}
      className="cursor-pointer rounded-[5px] border border-dashed border-amber-400/25 
                 bg-amber-400/[0.06] px-2 py-[5px] text-right text-[13px] text-zinc-50
                 transition-colors hover:border-amber-400/40 hover:bg-amber-400/10"
    >
      {value ? value.toLocaleString("pt-BR") : "0"}
    </div>
  );
}
