import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "move"
  | "leaf"
  | "book"
  | "user"
  | "play"
  | "heart"
  | "clock"
  | "menu"
  | "close"
  | "arrow"
  | "check"
  | "download"
  | "spotify"
  | "calendar"
  | "pin"
  | "search"
  | "filter"
  | "lock"
  | "sparkle"
  | "mic"
  | "file";

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  move: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M8 21l2.5-6.5L8 12l3-4 4 2 3 1.5M13 9l-1.5 5 3 2.5L16 21" />
    </>
  ),
  leaf: <path d="M5 19c0-7 4-13 14-14 0 9-4 14-11 14-1.2 0-2.2-.2-3-.5zM5 19c3-5 6-8 10-10" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5V5.5M8 7h8M8 10h6" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />,
  spotify: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 9.5c3.5-1 7-.7 9.5.8M8 12.5c3-.8 6-.5 8 .7M8.5 15.3c2.3-.6 4.5-.4 6.3.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-6.2 6-11a6 6 0 1 0-12 0c0 4.8 6 11 6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5 9 9M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
  file: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h5M10 17h5" />,
};

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
