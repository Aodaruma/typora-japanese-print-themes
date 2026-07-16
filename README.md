# Typora Japanese Print Themes

日本語の長文執筆とA4印刷に合わせた、Typora用の明朝体テーマ集です。一般文書、論文・レポート、横書き・縦書き小説向けの8テーマを収録しています。

ライト版の編集画面は白一色（`#ffffff`）で、用紙風の影や外枠を設けないシンプルな表示です。各Dark版は画面のみ濃色になり、印刷・PDF出力時は全テーマ共通で白背景・黒文字になります。A4と余白の指定は印刷・PDF出力時だけ適用されます。

学術・小説テーマには可変フォント **Noto Serif JP（200–900）** を同梱し、和文・欧文・数字・見出しを同じ書体ファミリーへ統一しています。端末ごとのフォント差や、Times系と明朝体を混植した際の字面の不揃いを避けられます。

> [!IMPORTANT]
> 大学・学会・出版社の指定がある場合は、その執筆要領を優先してください。本テーマは分野横断の唯一の「学術書式」ではなく、一般的な日本語組版と複数の大学の要領から導いた実用的な初期設定です。

## プレビュー

| Japanese Print | Japanese Print Dark |
| --- | --- |
| ![Japanese Printのプレビュー](docs/images/japanese-print.png) | ![Japanese Print Darkのプレビュー](docs/images/japanese-print-dark.png) |

| Japanese Academic | Japanese Academic Dark |
| --- | --- |
| ![Japanese Academicのプレビュー](docs/images/japanese-academic.png) | ![Japanese Academic Darkのプレビュー](docs/images/japanese-academic-dark.png) |

| 横書き | 横書き Dark |
| --- | --- |
| ![Japanese Novelの横書きプレビュー](docs/images/novel-horizontal.png) | ![Japanese Novel Darkの横書きプレビュー](docs/images/novel-horizontal-dark.png) |

| 縦書き | 縦書き Dark |
| --- | --- |
| ![Japanese Novel Verticalの縦書きプレビュー](docs/images/novel-vertical.png) | ![Japanese Novel Vertical Darkの縦書きプレビュー](docs/images/novel-vertical-dark.png) |

一般・学術テーマは公開用の架空文書、小説テーマは [公開用の架空サンプル](examples/novel-sample.md) を使用しています。Dark版も印刷・PDF出力時はライト版と同じ白紙になります。プレビュー画像は `npm run preview` で再生成できます。

## テーマの違い

| テーマ | 主用途 | 編集画面 | 段落 | 印刷 |
| --- | --- | --- | --- | --- |
| Japanese Print | 報告書、解説、長文ノート | 白 | 1字下げ、見出し直後は天付き | A4、10pt、四辺25mm |
| Japanese Print Dark | 報告書、解説、長文ノート | ダーク | 1字下げ、見出し直後は天付き | Japanese Printと同じ白紙 |
| Japanese Academic | 論文、卒論・修論、研究レポート | 白 | 原則すべて1字下げ | A4、10pt、四辺25mm |
| Japanese Academic Dark | 論文、卒論・修論、研究レポート | ダーク | 原則すべて1字下げ | Japanese Academicと同じ白紙 |
| Japanese Novel | 横書き小説 | 白 | 1字下げ | A4、10pt、上下24mm・左右25mm |
| Japanese Novel Dark | 横書き小説 | ダーク | 1字下げ | Japanese Novelと同じ白紙 |
| Japanese Novel Vertical | 縦書き小説 | 白・縦組 | 1字下げ | A4縦、10pt、四辺20mm |
| Japanese Novel Vertical Dark | 縦書き小説 | ダーク・縦組 | 1字下げ | Verticalと同じ白紙 |

## インストール

1. [Releases](../../releases/latest) からZIPを取得して展開します。
2. Typoraで `ファイル` → `設定` → `外観` → `テーマフォルダを開く` を選びます。
3. 次のCSSとフォルダを、開いたテーマフォルダへコピーします。

   ```text
   japanese-print.css
   japanese-print-dark.css
   japanese-academic.css
   japanese-academic-dark.css
   japanese-novel.css
   japanese-novel-dark.css
   japanese-novel-vertical.css
   japanese-novel-vertical-dark.css
   japanese-print/
     base.css
     fonts/
       NotoSerifJP-Variable.ttf
       OFL.txt
   japanese-novel/
     base.css
     vertical.css
   ```

4. Typoraを再起動し、`テーマ` メニューから使用するテーマを選びます。

リポジトリを直接取得した場合は、`themes` フォルダの中身をそのままコピーしてください。テーマCSS、`japanese-print`、`japanese-novel` は必ず同じ階層に置きます。

## PDF・印刷設定

Typoraの `設定` → `エクスポート` → `PDF` で、用紙を **A4** にしてください。一般・学術・横書き小説は25mm前後、縦書き小説は20mmを初期値としてテーマの `@page` に指定しています。Typoraのエクスポート設定が優先される環境では、同じ値をPDF設定側にも指定してください。

ページ番号はテーマCSSではなく、TyporaのPDFヘッダー／フッター機能で設定します。YAML Front Matterによる文書単位の指定例です。

```yaml
---
header: ""
footer: "${pageNo}"
---
```

この指定を使うには、TyporaのPDF設定で「YAML Front Matterからエクスポート設定を読み込む」機能を有効にします。

## 小説用の表現

小説テーマは通常段落と見出し直後を1字下げにします。必要な箇所だけHTMLの補助クラスを使用できます。

```html
<span class="dialogue">「会話を天付きにする例です」</span>
<ruby>灯子<rt>とうこ</rt></ruby>
午後<span class="tcy">11</span>時<span class="tcy">28</span>分
<span class="scene-break">＊　＊　＊</span>
```

補助クラスは、それぞれ独立した行に置いてください。ブロックHTMLの `<p class="...">` はTyporaの横書きHTMLエディタが大きな幅を確保するため、縦書きテーマではインラインHTMLの `<span class="...">` を推奨します。Markdownの `*強調*` は、小説テーマでは斜体ではなく日本語の圏点として表示します。`.tcy` は縦書き時の縦中横に使用し、2桁程度の短い数字へ個別に指定してください。縦書きテーマでは、Markdown画像を本文と重ならない独立ブロックとして配置し、Markdown表のセルも縦組みにします。使用例は [examples/novel-sample.md](examples/novel-sample.md) にあります。

> [!CAUTION]
> Typoraの縦書き対応は限定的です。縦書きは本文エディタのみに適用し、サイドバーやメニューなどのUIは横書きのままにします。画面上の本文段落は、大きな空白を避けるため同じ縦列へ続けて流し、印刷時は各段落を新しい縦列から始めます。縦書き表のセルは縦組みになりますが、Typoraの表編集UIは操作性を優先して横書きのままです。縦書きテーマは閲覧とPDF出力を主用途とし、長文編集には横書きテーマを推奨します。カーソル移動、横スクロール、表・コード・数式などの制約は [縦書きテーマの注意事項](docs/vertical-writing-notes.md) を確認してください。

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

テーマ本体を変更せず、Typoraのテーマフォルダに `{テーマ名}.user.css` を作ると、更新時にも設定を保てます。たとえば `japanese-print-dark.user.css`、`japanese-academic-dark.user.css`、`japanese-novel-vertical.user.css` のように、変更するテーマCSSと同じ名前を使用してください。`base.user.css` はこれらのテーマ別調整には使用しません。

```css
:root {
  --jp-print-font-size: 12pt;
  --jp-print-title-font-size: 15pt;
  --jp-print-measure: 35em;
  --jp-print-line-height: 2;
}
```

最初のH1は文書表題として扱い、印刷時は13.5ptで表示します。日本語の自然な文節を優先する `word-break: auto-phrase` と、複数行の長さを整える `text-wrap: balance` を併用します。未対応環境では通常の日本語禁則処理へ戻り、長い欧文などが収まらない場合だけ単語内の折返しを許可します。

主な変数は次のとおりです。

| 変数 | 内容 |
| --- | --- |
| `--jp-font-body` | 本文フォントの優先順 |
| `--jp-font-heading` | 見出しフォントの優先順 |
| `--jp-print-font-size` | 印刷時の本文サイズ |
| `--jp-print-title-font-size` | 印刷時の表題サイズ |
| `--jp-print-measure` | 印刷時の本文幅（`40em` は約40字幅） |
| `--jp-line-height` | 編集画面の本文行高 |
| `--jp-print-line-height` | 印刷時の本文行高 |
| `--jp-paragraph-indent` | 段落先頭の字下げ |

小説テーマでは、`--jp-screen-measure` が横書き画面の本文幅、`--jp-print-measure` が横書き印刷の本文幅を表します。縦書き画面はビューポート全体を使用し、横方向へスクロールします。

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
