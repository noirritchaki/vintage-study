// The site's top-level pages, in the order the nav lists them.
export const pages = [
  { name: 'home', href: '/' },
  { name: 'about', href: '/about' },
  { name: 'what i like doing', href: '/hobbies' },
  { name: 'projects', href: '/projects' },
  { name: 'brew a cup of coffee', href: '/brew' },
] as const;

/** Which page a path belongs to (its index in `pages`). Case studies live under projects. */
export function pageIndexFor(pathname: string) {
  if (pathname === '/') return 0;
  if (pathname.startsWith('/work')) return pages.findIndex((p) => p.href === '/projects');
  return pages.findIndex((p) => p.href !== '/' && pathname.startsWith(p.href));
}

export function pageNameFor(pathname: string) {
  const i = pageIndexFor(pathname);
  return pages[Math.max(0, i)].name;
}
