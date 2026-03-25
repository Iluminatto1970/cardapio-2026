import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export function GET() {
  const htmlPath = path.resolve(process.cwd(), "..", "..", "index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  const patchedHtml = html.replace(
    'src="config.js"',
    'src="/legacy/config"'
  );

  return new Response(patchedHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
