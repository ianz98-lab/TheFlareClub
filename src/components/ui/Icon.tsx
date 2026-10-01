import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "move"
  | "leaf"
  | "user"
  | "play"
  | "heart"
  | "menu"
  | "close"
  | "arrow"
  | "arrow-left"
  | "check"
  | "calendar"
  | "search";

/** Solo iconos funcionales (navegación, acciones, estados): la marca no usa iconos decorativos. */
const paths: Record<IconName, ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  move: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M8 21l2.5-6.5L8 12l3-4 4 2 3 1.5M13 9l-1.5 5 3 2.5L16 21" />
    </>
  ),
  leaf: <path d="M5 19c0-7 4-13 14-14 0 9-4 14-11 14-1.2 0-2.2-.2-3-.5zM5 19c3-5 6-8 10-10" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M19 12H5m6-6-6 6 6 6" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
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
