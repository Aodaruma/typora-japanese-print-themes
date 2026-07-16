import { execFile, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "images");

const previews = [
  ["docs/preview.html", "print", "japanese-print.png"],
  ["docs/preview.html", "print-dark", "japanese-print-dark.png"],
  ["docs/preview.html", "academic", "japanese-academic.png"],
  ["docs/preview.html", "academic-dark", "japanese-academic-dark.png"],
  ["docs/novel-preview.html", "horizontal", "novel-horizontal.png"],
  ["docs/novel-preview.html", "horizontal-dark", "novel-horizontal-dark.png"],
  ["docs/novel-preview.html", "vertical", "novel-vertical.png"],
  ["docs/novel-preview.html", "vertical-dark", "novel-vertical-dark.png"],
];

function findBrowser() {
  if (process.env.BROWSER_PATH) return process.env.BROWSER_PATH;

  const localAppData = process.env.LOCALAPPDATA || "";
  const programFiles = process.env.ProgramFiles || "C:\\Program Files";
  const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const candidates = [
    path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
    path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/microsoft-edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];

  const installed = candidates.find((candidate) => existsSync(candidate));
  if (installed) return installed;

  for (const command of ["msedge", "google-chrome", "chromium", "chromium-browser"]) {
    if (spawnSync(command, ["--version"], { stdio: "ignore", windowsHide: true }).status === 0) {
      return command;
    }
  }

  throw new Error("EdgeまたはChromeが見つかりません。BROWSER_PATHを指定してください。");
}

await mkdir(outputDir, { recursive: true });
const browser = findBrowser();
const profileDir = await mkdtemp(path.join(tmpdir(), "typora-theme-preview-"));

try {
  for (const [page, theme, file] of previews) {
    const url = pathToFileURL(path.join(root, page));
    url.searchParams.set("theme", theme);
    const outputPath = path.join(outputDir, file);
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profileDir}`,
      "--force-device-scale-factor=1",
      "--window-size=1200,900",
      "--virtual-time-budget=5000",
      "--run-all-compositor-stages-before-draw",
      `--screenshot=${outputPath}`,
      url.href,
    ];

    await run(browser, args, { timeout: 60_000, windowsHide: true, maxBuffer: 1024 * 1024 });
    console.log(`generated: docs/images/${file}`);
  }
} finally {
  await rm(profileDir, { recursive: true, force: true });
}
