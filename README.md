# ぶんしょう分けメーカー

長い文章を、好きな文字数**以内**で、区切りのいいところで分ける Web アプリです。

## 公開URL（常設）

https://ytwg66z59b-wq.github.io/my-ai/

※ 初回だけ GitHub 側で Pages を有効化する必要があります（下記）。

## 初回だけ必要な設定（約1分）

このリポジトリはプライベートのため、無料プランで公開サイトにするには次が必要です。

1. **リポジトリを Public にする**  
   https://github.com/ytwg66z59b-wq/my-ai/settings  
   → Danger Zone → Change visibility → Public

2. **GitHub Pages を有効にする**  
   https://github.com/ytwg66z59b-wq/my-ai/settings/pages  
   → Build and deployment → Source: **GitHub Actions** → Save  
   （またはブランチ `gh-pages` / folder `/ (root)`）

3. `main` にマージ／push すると自動デプロイされます。  
   手動実行: Actions → “Deploy to GitHub Pages” → Run workflow

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
# GitHub Pages 向け（base=/my-ai/）
npm run build:pages
```
