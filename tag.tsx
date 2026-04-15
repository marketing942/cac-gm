interface TagProps {
  children: React.ReactNode;
  color: string;
  bg: string;
}

export function Tag({ children, color, bg }: TagProps) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-[9px] py-[2px] text-[11px] font-bold tracking-wide"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}
