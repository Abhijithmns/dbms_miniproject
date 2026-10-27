import type { ReactNode } from "react";

/** A stroked 24 × 24 icon, hidden from screen readers (the text next to it carries the meaning). */
function Icon({
  size,
  width = 1.8,
  className,
  children,
}: {
  size: number;
  width?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const SearchIcon = ({ size = 18 }: P) => (
  <Icon size={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
export const MoonIcon = ({ size = 20 }: P) => (
  <Icon size={size} className="dark:hidden">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icon>
);
export const SunIcon = ({ size = 20 }: P) => (
  <Icon size={size} className="hidden dark:block">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);
export const ArrowRightIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ArrowLeftIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={2}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const ArrowUpIcon = ({ size = 15 }: P) => (
  <Icon size={size} width={2}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);
export const ArrowDownIcon = ({ size = 15 }: P) => (
  <Icon size={size} width={2}>
    <path d="M12 5v14M18 13l-6 6-6-6" />
  </Icon>
);
export const CommentIcon = ({ size = 15 }: P) => (
  <Icon size={size}>
    <path d="M20 11.5a7.5 7.5 0 0 1-7.8 7.5 8.5 8.5 0 0 1-3.5-.8L4 20l1.2-3.8A7.3 7.3 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7z" />
  </Icon>
);
export const RssIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={2.2}>
    <path d="M5 11a8 8 0 0 1 8 8M5 5a14 14 0 0 1 14 14" />
    <path d="M5 19h.01" />
  </Icon>
);
export const MailIcon = ({ size = 16 }: P) => (
  <Icon size={size}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
export const LinkIcon = ({ size = 16 }: P) => (
  <Icon size={size}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </Icon>
);
export const CopyIcon = ({ size = 16, width = 1.8 }: P & { width?: number }) => (
  <Icon size={size} width={width}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Icon>
);
export const CheckIcon = ({ size = 18 }: P) => (
  <Icon size={size} width={2}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
export const StarIcon = ({ size = 15 }: P) => (
  <Icon size={size}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
  </Icon>
);
export const CodeIcon = ({ size = 15 }: P) => (
  <Icon size={size}>
    <path d="m8 8-5 4 5 4M16 8l5 4-5 4" />
  </Icon>
);
export const BookIcon = ({ size = 15 }: P) => (
  <Icon size={size}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 21V5M8 7h7" />
  </Icon>
);
