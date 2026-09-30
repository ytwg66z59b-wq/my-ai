# ぶんしょう分けメーカー

長い文章を、好きな文字数**以内**で、区切りのいいところで分ける Web アプリです。

## 公開URL（常設・専用）

https://ytwg66z59b-wq.github.io/my-ai/bunsho/

※ 同じリポジトリのコマPDF（`https://ytwg66z59b-wq.github.io/my-ai/`）とは別パスです。

## 開発

```bash
npm install
npm run dev
```

## ビルド / 公開

```bash
npm run build
# GitHub Pages の /bunsho/ 向け
npm run build:pages
```

`main` への push で `/bunsho/` だけが更新されます（ルートのコマPDFは消しません）。
