interface RouteItem {
  [key: string]: string | RouteItem;
}

function isFolderCurrent(path: string, currentPath: string): boolean {
  return currentPath.startsWith(path + "/") || currentPath === path;
}

interface NavItemProps {
  name: string;
  path: string;
  routes: RouteItem | string;
  currentPath: string;
  depth?: number;
}

function NavItem({ name, path, routes, currentPath, depth = 0 }: NavItemProps) {
  const isActive = currentPath === path || (path === "/" && currentPath === "");
  const isFolder = typeof routes === "object" && routes !== null;
  const hasNested = isFolder && Object.keys(routes as RouteItem).length > 0;
  const isOpen = isFolder && isFolderCurrent(path, currentPath);
  
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  
  if (hasNested) {
    const nestedRoutes = routes as RouteItem;
    const indexRoute = nestedRoutes["index"];
    
    return (
      <li class="nav-item">
        <details open={isOpen} style={{ marginLeft: `${depth * 0.5}rem` }}>
          <summary class="nav-link folder-summary" style={{ cursor: "pointer" }}>
            {indexRoute ? (
              <a href={path} class="folder-link">{displayName}</a>
            ) : (
              displayName
            )}
          </summary>
          <ul class="nav-list nav-nested">
            {Object.entries(nestedRoutes)
              .filter(([key]) => key !== "index")
              .map(([key, value]) => (
                <NavItem
                  key={key}
                  name={key}
                  path={`${path}/${key}`}
                  routes={value}
                  currentPath={currentPath}
                  depth={depth + 1}
                />
              ))}
          </ul>
        </details>
      </li>
    );
  }
  
  if (name === "index") return null;
  
  return (
    <li class="nav-item">
      <a
        href={path}
        class={`nav-link ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${1 + depth}rem` }}
      >
        {displayName}
      </a>
    </li>
  );
}

export default function Root(body: string, routes: RouteItem, currentPath: string = "/") {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="A personal blog built with Bun, Hono, and JSX — exploring web development, programming, and technology." />
        <title>Blog</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div class="app-container">
          <aside class="sidebar">
            <a href="/" class="sidebar-brand">📚 Blog</a>
            <nav class="sidebar-nav">
              <ul class="nav-list">
                {Object.entries(routes)
                  .filter(([key]) => key !== "index")
                  .map(([key, value]) => (
                    <NavItem
                      key={key}
                      name={key}
                      path={`/${key}`}
                      routes={value}
                      currentPath={currentPath}
                    />
                  ))}
              </ul>
            </nav>
            <div class="sidebar-footer">
              <span class="text-muted text-xs">© 2026 Blog</span>
            </div>
          </aside>
          <main class="main-content">
            <div class="prose max-w-3xl" dangerouslySetInnerHTML={{ __html: body }} />
            <footer class="footer max-w-3xl">
              <div class="flex justify-between items-center flex-wrap gap-4">
                <span>Built with Bun, Hono & JSX</span>
                <span class="text-muted text-xs">© 2026</span>
              </div>
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}