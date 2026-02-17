import { Hono } from "hono";
import { join } from "path";
import * as fs from "node:fs";
import Root from "./root";

const app = new Hono();

const routes = buildRoutes(join(__dirname, "/static"));

app.get("/style.css", async (c) => {
  const file = Bun.file(join(__dirname, "../public/style.css"));
  return c.body(await file.text(), {
    headers: { "Content-Type": "text/css" },
  });
});

app.get("/*", async (c) => {
  const paths = c.req.path.split("/").filter((x) => x);

  let route = routes;

  for (let path of paths) {
    if (!route[path]) {
      return c.notFound();
    }
    route = route[path];
  }

  const pageFile = route["index"] || route;
  const page = await Bun.file(pageFile).text();

  return c.html(Root(page, routes, c.req.path));
});

function buildRoutes(path: string) {
  const dir = fs.readdirSync(path, { withFileTypes: true });

  const routes: any = {};

  for (const file of dir) {
    if (file.isDirectory()) {
      routes[file.name] = buildRoutes(join(path, file.name));
    } else {
      if (routes[file.name.replace(".html", "")]) {
        routes[file.name.replace(".html", "")].index = join(path, file.name);
      } else {
        routes[file.name.replace(".html", "")] = join(path, file.name);
      }
    }
  }

  return routes;
}

export default app;
