import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const expectedThemes = [
  "japanese-print.css",
  "japanese-print-dark.css",
  "japanese-academic.css",
  "japanese-academic-dark.css",
  "japanese-novel.css",
  "japanese-novel-dark.css",
  "japanese-novel-vertical.css",
  "japanese-novel-vertical-dark.css",
];
const lightThemes = [
  "japanese-print.css",
  "japanese-academic.css",
  "japanese-novel.css",
  "japanese-novel-vertical.css",
];
const darkThemes = [
  "japanese-print-dark.css",
  "japanese-academic-dark.css",
  "japanese-novel-dark.css",
  "japanese-novel-vertical-dark.css",
];
const documentDarkImports = new Map([
  ["japanese-print-dark.css", "japanese-print.css"],
  ["japanese-academic-dark.css", "japanese-academic.css"],
]);
const novelThemes = expectedThemes.filter((file) => file.includes("novel"));
const verticalThemes = expectedThemes.filter((file) => file.includes("vertical"));
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

const themes = new Map();
for (const file of expectedThemes) {
  const relativePath = path.join("themes", file);
  const css = await read(relativePath);
  themes.set(file, css);
  checkBalancedBraces(css, relativePath);
  if (!documentDarkImports.has(file)) {
    check(css.includes("--jp-font-body"), `${relativePath}: 本文フォント変数がありません`);
    check(css.includes("--jp-print-font-size"), `${relativePath}: 印刷文字サイズ変数がありません`);
  }
  check(!/https?:\/\//i.test(css), `${relativePath}: 外部URLへの依存があります`);
}

for (const [file, importedTheme] of documentDarkImports) {
  const css = themes.get(file);
  check(
    css.includes(`@import url("./${importedTheme}");`),
    `themes/${file}: ライトテーマ ${importedTheme} のimportがありません`,
  );
}

for (const file of lightThemes) {
  const css = themes.get(file);
  check(css.includes("--jp-bg: #ffffff"), `themes/${file}: 画面背景が#ffffffではありません`);
  check(css.includes("--jp-paper: #ffffff"), `themes/${file}: 本文背景が#ffffffではありません`);
}

for (const file of darkThemes) {
  const css = themes.get(file);
  check(!/^\s*--jp-bg:\s*#ffffff;/m.test(css.split("@media print")[0]), `themes/${file}: 画面背景がダークではありません`);
  check(css.includes("@media print"), `themes/${file}: 印刷用ライト配色がありません`);
  check(css.includes("--jp-bg: #ffffff"), `themes/${file}: 印刷背景が#ffffffではありません`);
  check(css.includes("--jp-text: #000000"), `themes/${file}: 印刷文字色が黒ではありません`);
}

for (const file of novelThemes) {
  const css = themes.get(file);
  check(
    css.includes('@import url("./japanese-novel/base.css");'),
    `themes/${file}: 小説共通CSSのimportがありません`,
  );
  check(css.includes("--jp-print-title-font-size"), `themes/${file}: 印刷表題サイズ変数がありません`);
  check(css.includes("--jp-print-title-letter-spacing"), `themes/${file}: 印刷表題字間変数がありません`);
}

for (const file of verticalThemes) {
  const css = themes.get(file);
  check(
    css.includes('@import url("./japanese-novel/vertical.css");'),
    `themes/${file}: 縦書き共通CSSのimportがありません`,
  );
  check(css.includes('"Noto Serif JP Novel"'), `themes/${file}: 同梱小説用フォントを参照していません`);
}

for (const file of ["japanese-print.css", "japanese-academic.css"]) {
  const css = themes.get(file);
  const relativePath = `themes/${file}`;
  check(css.includes('@import url("./japanese-print/base.css");'), `${relativePath}: 共通CSSのimportがありません`);
  check(css.includes("@page"), `${relativePath}: @page指定がありません`);
  check(css.includes("size: A4 portrait"), `${relativePath}: A4指定がありません`);
  check(css.includes("line-break: strict"), `${relativePath}: 表題の禁則指定がありません`);
  check(css.includes("overflow-wrap: anywhere"), `${relativePath}: 長い表題への折返し指定がありません`);
  check(css.includes("word-break: normal"), `${relativePath}: 表題の改行フォールバックがありません`);
  check(css.includes("word-break: auto-phrase"), `${relativePath}: 表題の文節改行指定がありません`);
  check(css.includes("white-space: normal"), `${relativePath}: 表題の折返し許可指定がありません`);
  check(css.includes("text-wrap: balance"), `${relativePath}: 表題のバランス改行指定がありません`);
  check(!css.includes("white-space: nowrap"), `${relativePath}: 表題の折返し禁止指定が残っています`);
  check(!css.includes("--jp-shadow"), `${relativePath}: 影の変数が残っています`);
}

const printCss = themes.get("japanese-print.css");
check(
  printCss.includes("#write > h1 + p") && printCss.includes("text-indent: 0"),
  "一般テーマで見出し直後の段落が天付きになっていません",
);

const basePath = path.join("themes", "japanese-print", "base.css");
const baseCss = await read(basePath);
checkBalancedBraces(baseCss, basePath);
check(!baseCss.includes("box-shadow"), `${basePath}: 影の指定が残っています`);
check(baseCss.includes("font-size: var(--jp-print-font-size) !important"), `${basePath}: 印刷時の文字サイズが明示されていません`);
check(baseCss.includes("var(--jp-print-line-height, var(--jp-line-height))"), `${basePath}: 印刷時の行高が明示されていません`);
for (const required of ["#write", '-webkit-locale: "ja"', "line-break: strict", "text-align: justify", "@media print", ".footnotes", ".md-fences", ".md-toc"]) {
  check(baseCss.includes(required), `${basePath}: 必須指定 ${required} がありません`);
}
check(!/https?:\/\//i.test(baseCss), `${basePath}: 外部URLへの依存があります`);

const novelBasePath = path.join("themes", "japanese-novel", "base.css");
const novelBaseCss = await read(novelBasePath);
checkBalancedBraces(novelBaseCss, novelBasePath);
for (const required of [
  '@import url("../japanese-print/base.css");',
  "@font-face",
  '"Noto Serif JP Novel"',
  "NotoSerifJP-Variable.ttf",
  "#write p.dialogue",
  "#write p:has(.dialogue)",
  "#write ruby",
  "text-emphasis-style: filled sesame",
  "text-combine-upright: all",
  "@media print",
  "background: #ffffff !important",
  "color: #000000 !important",
]) {
  check(novelBaseCss.includes(required), `${novelBasePath}: 必須指定 ${required} がありません`);
}
check(!/https?:\/\//i.test(novelBaseCss), `${novelBasePath}: 外部URLへの依存があります`);

const verticalPath = path.join("themes", "japanese-novel", "vertical.css");
const verticalCss = await read(verticalPath);
checkBalancedBraces(verticalCss, verticalPath);
for (const required of [
  "writing-mode: vertical-rl",
  "-webkit-writing-mode: vertical-rl",
  "text-orientation: mixed",
  "overflow-x: auto",
  "text-combine-upright: all",
  "writing-mode: horizontal-tb",
  "size: A4 portrait",
  "@media print",
  "background: #ffffff !important",
  "color: #000000 !important",
]) {
  check(verticalCss.includes(required), `${verticalPath}: 必須指定 ${required} がありません`);
}
check(!/https?:\/\//i.test(verticalCss), `${verticalPath}: 外部URLへの依存があります`);
check(
  /@media screen[\s\S]*#typora-sidebar[\s\S]*writing-mode:\s*horizontal-tb/.test(verticalCss),
  `${verticalPath}: Typora UIの横書き固定がありません`,
);
check(
  !/html\s*,\s*body\s*,\s*#write\s*\{[^}]*writing-mode:\s*vertical-rl/s.test(verticalCss),
  `${verticalPath}: 画面UIまで縦書きになる指定が残っています`,
);
check(
  /@media screen[\s\S]*#write\s*>\s*p:not\(:has\(img\)\)\s*\{[^}]*display:\s*inline/s.test(verticalCss),
  `${verticalPath}: 画面上の本文段落が連続フローになっていません`,
);
check(
  /#write\s*>\s*p:not\(:has\(img\)\)::before\s*\{[^}]*inline-size:\s*var\(--jp-paragraph-indent\)/s.test(verticalCss),
  `${verticalPath}: 連続フローの段落区切りがありません`,
);
check(
  /body:not\(\.typora-sourceview-on\)\s+#write\s*>\s*pre\.md-meta-block\s*\{[^}]*display:\s*none/s.test(verticalCss),
  `${verticalPath}: 縦書き画面でYAMLフロントマターが非表示になっていません`,
);
check(
  /#write\s+h1,\s*#write\s+h2,[\s\S]*?#write\s+h6\s*\{[^}]*width:\s*auto/s.test(verticalCss),
  `${verticalPath}: Typora本体の見出し幅指定が解除されていません`,
);
check(
  /#write\s+p:has\(img\),[\s\S]*?#write\s+figure:has\(table\)\s*\{[^}]*display:\s*flex/s.test(verticalCss),
  `${verticalPath}: 画像と表の表示幅を確保するブロック指定がありません`,
);
check(
  /#write\s+table\s*\{[^}]*writing-mode:\s*vertical-rl/s.test(verticalCss),
  `${verticalPath}: Markdown表が縦組みになっていません`,
);
check(
  /#write\s+table\s+th,\s*#write\s+table\s+td\s*\{[^}]*writing-mode:\s*vertical-rl/s.test(verticalCss),
  `${verticalPath}: Markdown表のセルが縦組みになっていません`,
);

const academicCss = themes.get("japanese-academic.css");
check(academicCss.includes("@font-face"), "学術テーマに@font-faceがありません");
check(academicCss.includes('"Noto Serif JP Theme"'), "学術テーマが同梱Noto Serif JPを参照していません");

const fontPath = path.join("themes", "japanese-print", "fonts", "NotoSerifJP-Variable.ttf");
const fontBytes = await readFile(path.join(root, fontPath));
const fontHash = createHash("sha256").update(fontBytes).digest("hex");
check(fontBytes.length === 13574352, `${fontPath}: ファイルサイズが想定と異なります`);
check(fontHash === "2fd527ba12b6a44ec30d796d633360da0aeba6c5d4af1304ce12bb4dc15a7dfc", `${fontPath}: SHA-256が公式取得時の値と一致しません`);
const fontLicense = await read(path.join("themes", "japanese-print", "fonts", "OFL.txt"));
check(fontLicense.includes("SIL OPEN FONT LICENSE Version 1.1"), "Noto Serif JPのOFL本文がありません");

for (const file of [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/design-rationale.md",
  "docs/preview.html",
  "docs/vertical-writing-notes.md",
  "docs/novel-preview.html",
  "examples/sample.md",
  "examples/novel-sample.md",
]) {
  try {
    const content = await read(file);
    check(content.trim().length > 0, `${file}: 内容が空です`);
  } catch {
    failures.push(`${file}: ファイルがありません`);
  }
}

for (const file of [
  "docs/images/japanese-print-dark.png",
  "docs/images/japanese-academic-dark.png",
  "docs/images/novel-horizontal.png",
  "docs/images/novel-horizontal-dark.png",
  "docs/images/novel-vertical.png",
  "docs/images/novel-vertical-dark.png",
]) {
  try {
    const bytes = await readFile(path.join(root, file));
    check(bytes.length > 10_000, `${file}: プレビュー画像が小さすぎます`);
  } catch {
    failures.push(`${file}: プレビュー画像がありません`);
  }
}

const novelSample = await read("examples/novel-sample.md");
for (const required of ["class=\"dialogue\"", "<ruby>", "class=\"tcy\"", "*ほんとうに大切なこと*"]) {
  check(novelSample.includes(required), `examples/novel-sample.md: 小説用要素 ${required} がありません`);
}
check(
  novelSample.includes('<span class="dialogue">'),
  "examples/novel-sample.md: 会話補助クラスがインラインHTMLではありません",
);
check(
  !novelSample.includes('<p class="dialogue">'),
  "examples/novel-sample.md: 横幅を大きく消費する会話ブロックHTMLが残っています",
);
check(novelSample.includes("![夜明け前の駅ホームを描いた挿絵]"), "examples/novel-sample.md: 画像確認用の要素がありません");
check(novelSample.includes("| 時刻 | 場所 | 天候 |"), "examples/novel-sample.md: 表確認用の要素がありません");
try {
  const imageBytes = await readFile(path.join(root, "examples", "assets", "novel-sample-station.svg"));
  check(imageBytes.length > 500, "examples/assets/novel-sample-station.svg: 画像確認用SVGが小さすぎます");
} catch {
  failures.push("examples/assets/novel-sample-station.svg: 画像確認用SVGがありません");
}

const releaseWorkflow = await read(path.join(".github", "workflows", "release.yml"));
const ciWorkflow = await read(path.join(".github", "workflows", "ci.yml"));
check(releaseWorkflow.includes("v*.*.*"), "リリースワークフローにvX.X.Xタグのトリガーがありません");
check(releaseWorkflow.includes("gh release create"), "リリース作成コマンドがありません");
check(releaseWorkflow.includes("cp -R themes/."), "リリースワークフローがthemes全体をコピーしていません");
check(releaseWorkflow.includes("cp -R docs examples"), "リリースワークフローがdocsとexamplesをコピーしていません");
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
