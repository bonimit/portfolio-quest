export const ADVENTURE_PREVIEW_LABEL = "Adventure";

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Portfolio" },
  { href: "/concepts", label: "Concept Lab" },
  { href: "/world", label: "Adventure" },
  { href: "/about", label: "About Me" },
  { href: "/contact", label: "Contact" },
] as const;

type NavigationCurrent = "page" | "location" | undefined;

/** Match a route or its children, without matching siblings such as /workshop. */
export function getSectionCurrent(pathname: string, href: string): NavigationCurrent {
  if (pathname === href) return "page";
  if (href !== "/" && pathname.startsWith(`${href}/`)) return "location";
  return undefined;
}

/** The introduction and paths outside recognized sections have no active mode. */
export function getModeCurrent(pathname: string, mode: "portfolio" | "world"): NavigationCurrent {
  if (mode === "world") return getSectionCurrent(pathname, "/world");
  if (pathname === "/portfolio") return "page";
  if (getSectionCurrent(pathname, "/portfolio")) return "location";
  const isEditorial = navigation.some(({ href }) =>
    href !== "/" && href !== "/world" && getSectionCurrent(pathname, href) !== undefined,
  );
  return isEditorial ? "location" : undefined;
}
