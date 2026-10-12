# DRAGON DAYS

毎日の「頑張った！」が卵を孵し、幻獣を育てるスマホ対応 Web アプリです。

## 公開URL

| アプリ | URL |
| --- | --- |
| **DRAGON DAYS** | https://ytwg66z59b-wq.github.io/my-ai/dragon-days/ |
| コマPDF（別アプリ） | https://ytwg66z59b-wq.github.io/my-ai/ |

GitHub Pages では `/dragon-days/` 配下にだけデプロイし、ルートのコマPDFは上書きしません。

## 開発

```bash
npm install
npm run dev
```

開発サーバーは `http://127.0.0.1:5173/my-ai/dragon-days/` で開きます。

## テスト / ビルド / 公開

```bash
npm test
npm run build
npm run deploy:pages
```

## 主な機能

- 日次カウント（日本時間 0 時切替）・累計・カレンダー
- 複数卵・分岐進化・救済上限付き進化判定
- 図鑑・起動時名言・IndexedDB 保存
- JSON バックアップのエクスポート / インポート
- PWA（マニフェスト + Service Worker）

キャラクター画像の差し替え一覧は `docs/ASSETS.md` を参照してください。
