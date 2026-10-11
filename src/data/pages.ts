// The site's top-level pages, in "track" order for the Now Playing nav.
export const pages = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/about' },
  { name: 'what i like doing', href: '/hobbies' },
  { name: 'projects', href: '/projects' },
] as const;

/** Pages that aren't in the dropdown but still get a name in the nav. */
const extras: Record<string, string> = { '/brew': 'brew a coffee' };

/**
 * Which page a path belongs to: its index in `pages`, or -1 for an extra
 * page. Case studies live under projects.
 */
export function pageIndexFor(pathname: string) {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/work')) return pages.findIndex((p) => p.href === '/projects');
  return pages.findIndex((p) => p.href !== '/' && pathname.startsWith(p.href));
}

export function pageNameFor(pathname: string) {
  const i = pageIndexFor(pathname);
  return i >= 0 ? pages[i].name : (extras[pathname] ?? pages[0].name);
}
