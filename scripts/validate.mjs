import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const expectedThemes = ["japanese-print.css", "japanese-academic.css"];
const failures = [];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function stripCommentsAndStrings(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:\\.|[^"\\])*"/g, "\"\"")
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function checkBalancedBraces(css, file) {
  let depth = 0;
  for (const char of stripCommentsAndStrings(css)) {
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth < 0) {
      failures.push(`${file}: 余分な閉じ波括弧があります`);
      return;
    }
  }
  check(depth === 0, `${file}: 波括弧が対応していません`);
}

const version = (await read("VERSION")).trim();
const packageJson = JSON.parse(await read("package.json"));
check(/^\d+\.\d+\.\d+$/.test(version), "VERSIONはX.X.X形式である必要があります");
check(packageJson.version === version, "VERSIONとpackage.jsonのversionが一致しません");

const themeEntries = (await readdir(path.join(root, "themes")))
  .filter((entry) => entry.endsWith(".css"))
  .sort();
check(
  JSON.stringify(themeEntries) === JSON.stringify([...expectedThemes].sort()),
  `テーマCSSが想定と異なります: ${themeEntries.join(", ")}`,
);

for (const file of expectedThemes) {
  const relativePath = path.join("themes", file);
  const css = await read(relativePath);
  checkBalancedBraces(css, relativePath);
  check(
    css.includes('@import url("./japanese-print/base.css");'),
    `${relativePath}: 共通CSSのimportがありません`,
  );
  check(css.includes("@page"), `${relativePath}: @page指定がありません`);
  check(css.includes("size: A4 portrait"), `${relativePath}: A4指定がありません`);
  check(css.includes("--jp-font-body"), `${relativePath}: 本文フォント変数がありません`);
  check(css.includes("--jp-print-font-size"), `${relativePath}: 印刷文字サイズ変数がありません`);
  check(
    !/https?:\/\//i.test(css),
    `${relativePath}: 外部URLへの依存があります`,
  );
}

const basePath = path.join("themes", "japanese-print", "base.css");
const baseCss = await read(basePath);
checkBalancedBraces(baseCss, basePath);
for (const required of [
  "#write",
  "line-break: strict",
  "text-align: justify",
  "@media print",
  ".footnotes",
  ".md-fences",
  ".md-toc",
]) {
  check(baseCss.includes(required), `${basePath}: 必須指定 ${required} がありません`);
}
check(!/https?:\/\//i.test(baseCss), `${basePath}: 外部URLへの依存があります`);

for (const file of ["README.md", "LICENSE", "CHANGELOG.md", "docs/design-rationale.md", "examples/sample.md"]) {
  try {
    const content = await read(file);
    check(content.trim().length > 0, `${file}: 内容が空です`);
  } catch {
    failures.push(`${file}: ファイルがありません`);
  }
}

const releaseWorkflow = await read(path.join(".github", "workflows", "release.yml"));
const ciWorkflow = await read(path.join(".github", "workflows", "ci.yml"));
check(releaseWorkflow.includes("v*.*.*"), "リリースワークフローにvX.X.Xタグのトリガーがありません");
check(releaseWorkflow.includes("gh release create"), "リリース作成コマンドがありません");
for (const [name, workflow] of [["CI", ciWorkflow], ["Release", releaseWorkflow]]) {
  check(workflow.includes("actions/checkout@v6"), `${name}: actions/checkout@v6を使用していません`);
  check(workflow.includes("actions/setup-node@v6"), `${name}: actions/setup-node@v6を使用していません`);
}

if (failures.length > 0) {
  console.error("検証に失敗しました:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`検証成功: ${expectedThemes.length}テーマ / バージョン ${version}`);
