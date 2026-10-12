# キャラクター素材一覧（仮素材 → 差し替え用）

現状は CSS スプライト（`CreatureSprite`）で仮表示しています。画像を用意したら `public/creatures/` などに配置し、`formId` / `colorId` とファイル名を対応させてください。

## 卵（3種推奨・初期実装は2種）

| formId | 名前 | 推奨ファイル |
| --- | --- | --- |
| egg_light | 光の卵 | egg_light.png |
| egg_aqua | 水の卵 | egg_aqua.png |

## 光系統

| formId | 段階 | 名前 |
| --- | --- | --- |
| lumina_juvenile | 幼体 | ルミナ |
| lumina_growth_radiant | 成長体 | ルミナ・輝 |
| lumina_growth_star | 成長体 | ルミナ・星屑 |
| dragon_light | 成体 | 光の龍 |
| dragon_star | 成体 | 星空の龍 |
| dragon_guardian | 成体 | 守護の龍 |
| apex_holy_light | 上位種 | 聖光の上位龍 |
| apex_galaxy | 上位種 | 銀河の上位龍 |
| apex_temple | 上位種 | 神殿の上位龍 |

## 水系譜

| formId | 段階 | 名前 |
| --- | --- | --- |
| ripple_juvenile | 幼体 | リプル |
| ripple_growth_stream | 成長体 | リプル・清流 |
| ripple_growth_flame | 成長体 | リプル・陽炎 |
| dragon_tide | 成体 | 潮の龍 |
| dragon_mist | 成体 | 霧海の龍 |
| dragon_steam | 成体 | 蒸気の龍 |
| apex_ocean | 上位種 | 深海の上位龍 |
| apex_geyser | 上位種 | 噴泉の上位龍 |

## 色バリエーション（`src/data/colors.ts`）

pearl_gold / sky_aqua / rose_bloom / mint_leaf / ember_coral / moon_silver / deep_indigo

## UI

- 背景（ホーム空・丘）
- 進化フラッシュ／シルエット演出
- ナビゲーションアイコン（任意）
