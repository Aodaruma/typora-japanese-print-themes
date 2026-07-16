# Typora Japanese Print Themes

日本語の長文執筆とA4印刷に合わせた、Typora用の明朝体テーマ集です。一般文書向けの **Japanese Print** と、論文・レポート向けの **Japanese Academic** を収録しています。

編集画面は白一色（`#ffffff`）で、用紙風の影や外枠を設けないシンプルな表示です。A4と余白の指定は印刷・PDF出力時だけ適用されます。

学術テーマには可変フォント **Noto Serif JP（200–900）** を同梱し、和文・欧文・数字・見出しを同じ書体ファミリーへ統一しています。端末ごとのフォント差や、Times系と明朝体を混植した際の字面の不揃いを避けられます。

> [!IMPORTANT]
> 大学・学会・出版社の指定がある場合は、その執筆要領を優先してください。本テーマは分野横断の唯一の「学術書式」ではなく、一般的な日本語組版と複数の大学の要領から導いた実用的な初期設定です。

## テーマの違い

| 項目 | Japanese Print | Japanese Academic |
| --- | --- | --- |
| 主用途 | 報告書、解説、長文ノート | 論文、卒論・修論、研究レポート |
| 本文 | 11pt相当、約42字幅、行高1.9 | 10.5pt相当、40字幅、行高2.15 |
| 和文 | OS標準の明朝体を優先 | 同梱Noto Serif JP |
| 欧文 | 和文書体と調和するSerif | 同梱Noto Serif JP |
| 見出し | 明朝体、控えめな罫線 | 同梱Noto Serif JP、白黒・簡潔 |
| 段落 | 1字下げ、見出し直後は天付き | 原則すべて1字下げ |
| 印刷 | A4、四辺25mm | A4、四辺25mm |

## インストール

1. [Releases](../../releases/latest) からZIPを取得して展開します。
2. Typoraで `ファイル` → `設定` → `外観` → `テーマフォルダを開く` を選びます。
3. 次の3項目を、開いたテーマフォルダへコピーします。

   ```text
   japanese-print.css
   japanese-academic.css
   japanese-print/
     base.css
     fonts/
       NotoSerifJP-Variable.ttf
       OFL.txt
   ```

4. Typoraを再起動し、`テーマ` メニューから **Japanese Print** または **Japanese Academic** を選びます。

リポジトリを直接取得した場合は、`themes` フォルダ内の同じ3項目をコピーしてください。テーマCSSと `japanese-print` フォルダは必ず同じ階層に置きます。

## PDF・印刷設定

Typoraの `設定` → `エクスポート` → `PDF` で、用紙を **A4**、余白を **25mm** にしてください。テーマにも `@page` を指定していますが、Typoraのエクスポート設定が優先される環境があります。

ページ番号はテーマCSSではなく、TyporaのPDFヘッダー／フッター機能で設定します。YAML Front Matterによる文書単位の指定例です。

```yaml
---
header: ""
footer: "${pageNo}"
---
```

この指定を使うには、TyporaのPDF設定で「YAML Front Matterからエクスポート設定を読み込む」機能を有効にします。

## 学術文書用の補助クラス

Markdown内にHTMLを記述できるTyporaの機能を利用して、表題情報・要旨・図表キャプションを整えられます。

```html
<p class="document-meta">所属　氏名</p>

<section class="abstract">
<h2>要旨</h2>
<p>ここに要旨を記述します。</p>
</section>

<p class="keywords"><strong>キーワード：</strong>日本語組版、Typora</p>
<p class="figure-caption">図1　図の説明</p>
<p class="table-caption">表1　表の説明</p>
```

使用例は [examples/sample.md](examples/sample.md) にあります。

## 書式の調整

テーマ本体を変更せず、Typoraのテーマフォルダに `japanese-print.user.css` または `japanese-academic.user.css` を作ると、更新時にも設定を保てます。

```css
:root {
  --jp-print-font-size: 12pt;
  --jp-print-measure: 35em;
  --jp-line-height: 2;
}
```

主な変数は次のとおりです。

| 変数 | 内容 |
| --- | --- |
| `--jp-font-body` | 本文フォントの優先順 |
| `--jp-font-heading` | 見出しフォントの優先順 |
| `--jp-print-font-size` | 印刷時の本文サイズ |
| `--jp-print-measure` | 印刷時の本文幅（`40em` は約40字幅） |
| `--jp-line-height` | 本文の行高 |
| `--jp-paragraph-indent` | 段落先頭の字下げ |

CSSの `em` 幅はフォントメトリクスや約物、欧文混植の影響を受けるため、ワープロの文字グリッドと完全には一致しません。厳密な字数・行数指定がある場合は、PDFを出力して提出先の要領と照合してください。

## 設計根拠

調査資料、採用した初期値、CSSで再現できる範囲は [docs/design-rationale.md](docs/design-rationale.md) にまとめています。

## 開発

Node.js 18以降で、外部パッケージなしに検証できます。

```sh
npm test
```

`VERSION` と `package.json` のバージョンを更新して `vX.X.X` 形式のタグをpushすると、GitHub ActionsがZIPとSHA-256チェックサムを作り、GitHub Releaseを公開します。

## ライセンス

テーマのCSS・文書・スクリプトは [MIT License](LICENSE) です。同梱するNoto Serif JPは [SIL Open Font License 1.1](themes/japanese-print/fonts/OFL.txt) です。
