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

type P = { size?: number; className?: string };

export const SearchIcon = ({ size = 18, className }: P) => (
  <Icon size={size} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);
export const MoonIcon = ({ size = 20, className }: P) => (
  <Icon size={size} className={`dark:hidden ${className ?? ""}`.trim()}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Icon>
);
export const SunIcon = ({ size = 20, className }: P) => (
  <Icon size={size} className={`hidden dark:block ${className ?? ""}`.trim()}>
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
export const PlusIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={2} className={className}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const AdIcon = ({ size = 18, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <rect x="3" y="6" width="13" height="13" rx="2" />
    <path d="M8 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
  </Icon>
);
export const ShareIcon = ({ size = 15, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="m16 6-4-4-4 4" />
    <path d="M12 2v13" />
  </Icon>
);
export const BellIcon = ({ size = 18, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);
export const ChatIcon = ({ size = 18, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);
export const MoreHorizontalIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={2}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </Icon>
);
export const HomeIcon = ({ size = 18 }: P) => (
  <Icon size={size} width={1.8}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </Icon>
);
export const CompassIcon = ({ size = 18 }: P) => (
  <Icon size={size} width={1.8}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icon>
);
export const ChevronDownIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={2}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const SettingsIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={1.8}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);
export const CardViewIcon = ({ size = 16 }: P) => (
  <Icon size={size} width={1.8}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);
export const AwardIcon = ({ size = 15 }: P) => (
  <Icon size={size} width={1.8}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Icon>
);
export const BookmarkIcon = ({ size = 15, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Icon>
);
export const UserIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);
export const LogOutIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

export const CloseIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const LockIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const EyeIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const EyeOffIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </Icon>
);
export const ShieldIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);
export const SparklesIcon = ({ size = 15, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </Icon>
);

export const UploadIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

export const CameraIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </Icon>
);

export const ImageIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Icon>
);

export const TrashIcon = ({ size = 16, className }: P) => (
  <Icon size={size} width={1.8} className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Icon>
);

export const SnooAvatarIcon = ({ size = 32 }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className="rounded-full overflow-hidden"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="16" fill="#1e2329" />
    {/* Snoo antenna */}
    <path
      d="M16 11.5l2.2-4.2 3.2 1.2"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="22.2" cy="8.6" r="1.6" fill="#ffffff" />
    {/* Snoo ears */}
    <circle cx="8" cy="15.5" r="2.5" fill="#ffffff" />
    <circle cx="24" cy="15.5" r="2.5" fill="#ffffff" />
    {/* Snoo head */}
    <ellipse cx="16" cy="16.5" rx="7.5" ry="5.5" fill="#ffffff" />
    {/* Snoo eyes (Reddit orange red) */}
    <circle cx="13.2" cy="16" r="1.4" fill="#ff4500" />
    <circle cx="18.8" cy="16" r="1.4" fill="#ff4500" />
    {/* Snoo smile */}
    <path
      d="M14 18.5c1 .9 3 .9 4 0"
      stroke="#1e2329"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Snoo shoulders/body */}
    <path d="M11 23.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5v1.5H11v-1.5z" fill="#ffffff" />
  </svg>
);
