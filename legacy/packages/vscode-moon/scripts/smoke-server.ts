import { spawn } from "child_process";
import { join } from "path";

const pkgRoot = join(import.meta.dir, "..");
const server = join(pkgRoot, "server", "index.js");
const stdlib = join(pkgRoot, "stdlib");
const node = process.platform === "win32" ? "node.exe" : "node";

const proc = spawn(node, [server, "--stdio"], {
  env: { ...process.env, MOON_STDLIB: stdlib },
  stdio: ["pipe", "pipe", "pipe"],
});

const msg = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { capabilities: {}, rootUri: null, processId: null },
});
const frame = `Content-Length: ${Buffer.byteLength(msg, "utf8")}\r\n\r\n${msg}`;

let out = "";
let err = "";
proc.stdout.on("data", (chunk) => { out += chunk.toString(); });
proc.stderr.on("data", (chunk) => { err += chunk.toString(); });

proc.stdin.write(frame);

const timeout = setTimeout(() => {
  proc.kill();
  if (out.includes("capabilities")) {
    console.log("LSP smoke test OK");
    process.exit(0);
  }
  console.error("Timeout waiting for initialize response");
  console.error("stdout:", out.slice(0, 800));
  console.error("stderr:", err.slice(0, 800));
  process.exit(1);
}, 5000);

proc.on("close", (code) => {
  clearTimeout(timeout);
  if (out.includes("capabilities")) {
    console.log("LSP smoke test OK");
    process.exit(0);
  }
  console.error(`Server exited with code ${code}`);
  console.error("stdout:", out.slice(0, 800));
  console.error("stderr:", err.slice(0, 800));
  process.exit(1);
});