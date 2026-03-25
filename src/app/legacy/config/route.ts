import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export function GET() {
  const configPath = path.resolve(process.cwd(), "..", "..", "config.js");
  const configJs = fs.readFileSync(configPath, "utf-8");

  return new Response(configJs, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
