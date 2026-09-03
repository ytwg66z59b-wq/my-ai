/**
 * Site copy & structure.
 * Edit this file to change headlines, body text, CTAs, nav labels, etc.
 * Do not hardcode marketing copy inside section components.
 */

export const siteMeta = {
  title: "People First LP — Design Foundation",
  description:
    "洗練されたLPデザイン基盤。文章・画像・動画は後から差し替え可能な構造です。",
  lang: "ja",
} as const;

export const brand = {
  name: "Brand Name",
  logoText: "BRAND",
} as const;

export const navigation = {
  items: [
    { label: "About", href: "#about" },
    { label: "Service", href: "#service" },
    { label: "Case", href: "#case-study" },
    { label: "Profile", href: "#about-me" },
  ],
  cta: {
    label: "まずは話してみる",
    href: "#cta",
  },
} as const;

export const content = {
  hero: {
    id: "hero",
    eyebrow: "INTRODUCTION",
    title: "ここにメインタイトルが入ります",
    description:
      "ヒーローセクションの説明文プレースホルダーです。後から差し替えできます。",
    primaryCta: {
      label: "まずは話してみる",
      href: "#cta",
    },
    secondaryCta: {
      label: "サービスを見る",
      href: "#service",
    },
  },
  about: {
    id: "about",
    eyebrow: "ABOUT",
    title: "私たちについて",
    description:
      "Aboutセクションの説明文プレースホルダー。人をテーマにしたサービスの導入文をここに配置します。",
    points: [
      {
        title: "ポイント 01",
        body: "短い説明文のプレースホルダーです。",
      },
      {
        title: "ポイント 02",
        body: "短い説明文のプレースホルダーです。",
      },
      {
        title: "ポイント 03",
        body: "短い説明文のプレースホルダーです。",
      },
    ],
  },
  story: {
    id: "story",
    eyebrow: "STORY",
    title: "ストーリーの見出し",
    description:
      "ストーリーセクションの本文プレースホルダー。余白を活かして大きなタイポグラフィで見せます。",
    quote: "ここに印象的な一文や引用を配置します。",
  },
  problem: {
    id: "problem",
    eyebrow: "PROBLEM",
    title: "いま、起きていること",
    description: "課題提示セクションの導入文プレースホルダーです。",
    items: [
      {
        title: "課題 01",
        body: "課題の説明文プレースホルダー。",
      },
      {
        title: "課題 02",
        body: "課題の説明文プレースホルダー。",
      },
      {
        title: "課題 03",
        body: "課題の説明文プレースホルダー。",
      },
    ],
  },
  philosophy: {
    id: "philosophy",
    eyebrow: "PHILOSOPHY",
    title: "大切にしていること",
    description:
      "フィロソフィーセクションの説明文プレースホルダー。価値観や姿勢を伝えます。",
    statements: [
      {
        label: "01",
        title: "価値観タイトル",
        body: "価値観の説明文プレースホルダー。",
      },
      {
        label: "02",
        title: "価値観タイトル",
        body: "価値観の説明文プレースホルダー。",
      },
      {
        label: "03",
        title: "価値観タイトル",
        body: "価値観の説明文プレースホルダー。",
      },
    ],
  },
  whyPeople: {
    id: "why-people",
    eyebrow: "WHY PEOPLE",
    title: "なぜ「人」なのか",
    description:
      "人をテーマにした理由を伝えるセクションのプレースホルダーです。",
    highlights: [
      { title: "理由 01", body: "説明文プレースホルダー。" },
      { title: "理由 02", body: "説明文プレースホルダー。" },
      { title: "理由 03", body: "説明文プレースホルダー。" },
    ],
  },
  video: {
    id: "video",
    eyebrow: "VIDEO",
    title: "映像で伝える",
    description: "動画セクションの説明文プレースホルダーです。",
  },
  service: {
    id: "service",
    eyebrow: "SERVICE",
    title: "提供するサービス",
    description: "サービス紹介の導入文プレースホルダーです。",
    items: [
      {
        number: "01",
        title: "サービス名 01",
        body: "サービス内容の説明文プレースホルダー。",
        href: "#cta",
      },
      {
        number: "02",
        title: "サービス名 02",
        body: "サービス内容の説明文プレースホルダー。",
        href: "#cta",
      },
      {
        number: "03",
        title: "サービス名 03",
        body: "サービス内容の説明文プレースホルダー。",
        href: "#cta",
      },
    ],
  },
  process: {
    id: "process",
    eyebrow: "PROCESS",
    title: "進め方",
    description: "プロセス説明の導入文プレースホルダーです。",
    steps: [
      {
        number: "01",
        title: "ヒアリング",
        body: "ステップ説明のプレースホルダー。",
      },
      {
        number: "02",
        title: "設計",
        body: "ステップ説明のプレースホルダー。",
      },
      {
        number: "03",
        title: "制作",
        body: "ステップ説明のプレースホルダー。",
      },
      {
        number: "04",
        title: "公開・改善",
        body: "ステップ説明のプレースホルダー。",
      },
    ],
  },
  caseStudy: {
    id: "case-study",
    eyebrow: "CASE STUDY",
    title: "実績・事例",
    description: "ケーススタディ導入文のプレースホルダーです。",
    items: [
      {
        tag: "Category",
        title: "事例タイトル 01",
        body: "事例の短い説明文プレースホルダー。",
      },
      {
        tag: "Category",
        title: "事例タイトル 02",
        body: "事例の短い説明文プレースホルダー。",
      },
      {
        tag: "Category",
        title: "事例タイトル 03",
        body: "事例の短い説明文プレースホルダー。",
      },
    ],
  },
  support: {
    id: "support",
    eyebrow: "SUPPORT",
    title: "サポート体制",
    description: "サポート内容の説明文プレースホルダーです。",
    items: [
      { title: "サポート 01", body: "説明文プレースホルダー。" },
      { title: "サポート 02", body: "説明文プレースホルダー。" },
      { title: "サポート 03", body: "説明文プレースホルダー。" },
    ],
  },
  aboutMe: {
    id: "about-me",
    eyebrow: "ABOUT ME",
    title: "プロフィール",
    name: "Name Placeholder",
    role: "Role / Title",
    description:
      "自己紹介文のプレースホルダーです。経歴や想いを後から記入します。",
    facts: [
      { label: "Based in", value: "Tokyo" },
      { label: "Focus", value: "People / Brand" },
      { label: "Style", value: "Simple & Human" },
    ],
  },
  cta: {
    id: "cta",
    eyebrow: "CONTACT",
    title: "まずは、話してみませんか",
    description:
      "最終CTAセクションの説明文プレースホルダー。次のアクションを促します。",
    button: {
      label: "まずは話してみる",
      href: "#",
    },
    note: "※ リンク先は後から設定してください",
  },
  footer: {
    copyright: "© Brand Name. All rights reserved.",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#cta" },
    ],
  },
} as const;

export type SiteContent = typeof content;
