# my-ai

「人」をテーマにしたサービス向け LP のデザイン・UI 基盤です。

## 技術スタック

- Next.js (App Router) + TypeScript
- CSS Modules + CSS Variables（デザイントークン）
- next/font（Noto Sans JP / Inter）

## 開発

```bash
npm install
npm run dev
```

## コンテンツの差し替え

| 変更したいもの | 編集場所 |
| --- | --- |
| 文章・見出し・CTA文言 | `src/content/site.ts` |
| 画像・動画パス | `src/content/media.ts` + `public/image` / `public/video` |
| カラー・余白・タイポ | `src/styles/tokens.css` |
| セクション順 | `src/app/page.tsx` |

現時点のコピーとメディアはプレースホルダーです。本番素材に差し替えてください。
