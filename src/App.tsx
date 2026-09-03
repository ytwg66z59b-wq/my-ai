const featureCards = [
  {
    title: "AIオーケストレーション",
    description:
      "リサーチ、要件整理、実装、レビューまでを一つのフローで設計し、チームの手戻りを減らします。",
  },
  {
    title: "意思決定の高速化",
    description:
      "ダッシュボード上で KPI、課題、次アクションを可視化し、判断に必要な情報を一箇所へ集約します。",
  },
  {
    title: "すぐに使える実行テンプレート",
    description:
      "新規施策の立ち上げ、LP改善、顧客対応などのワークフローをテンプレート化して再利用できます。",
  },
];

const workflowSteps = [
  "課題とゴールを整理して、実行可能な計画に変換",
  "AI が調査・構成案・コピー案を生成し、初速を最大化",
  "人がレビューしながら改善し、運用フローへ接続",
];

const metrics = [
  { value: "3.4x", label: "施策立ち上げ速度" },
  { value: "62%", label: "初稿作成の工数削減" },
  { value: "98%", label: "チーム継続利用率" },
];

const faqs = [
  {
    question: "どのようなチームに向いていますか？",
    answer:
      "マーケティング、プロダクト、営業企画など、複数人で素早く施策を回すチームに最適です。",
  },
  {
    question: "既存ツールと併用できますか？",
    answer:
      "はい。Slack、Notion、Google Docs などの既存運用を置き換えるのではなく、実行のハブとして連携できます。",
  },
  {
    question: "導入に開発は必要ですか？",
    answer:
      "基本不要です。テンプレートの設定だけで開始でき、必要に応じて運用に合わせた拡張も行えます。",
  },
];

export default function App() {
  return (
    <div className="page-shell">
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">N</span>
            <span>NovaFlow</span>
          </div>
          <div className="nav-links">
            <a href="#features">特徴</a>
            <a href="#workflow">流れ</a>
            <a href="#faq">FAQ</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="eyebrow">AI TEAM OPERATING SYSTEM</p>
            <h1>実行速度を上げる。<br />AI時代のチーム基盤を一枚のLPで伝える。</h1>
            <p className="hero-text">
              NovaFlow は、企画立案から実装・改善までを一気通貫で進めるための
              AIワークスペースです。曖昧なアイデアを、成果につながるアクションへ変換します。
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#cta">
                デモを予約する
              </a>
              <a className="button button-secondary" href="#features">
                詳しく見る
              </a>
            </div>
            <div className="metric-row">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </section>

          <aside className="hero-panel">
            <div className="panel-glow" />
            <div className="panel-card panel-primary">
              <span className="panel-label">今週の実行状況</span>
              <h2>12件の施策が進行中</h2>
              <p>調査、コピー、構成、レビューを AI と分担し、リードタイムを短縮。</p>
            </div>
            <div className="panel-card panel-secondary">
              <div>
                <span className="panel-kicker">優先タスク</span>
                <strong>LP改善 / 新規リード獲得</strong>
              </div>
              <ul>
                <li>訴求仮説の再整理</li>
                <li>コピー案を3パターン生成</li>
                <li>公開後の数値計測を自動化</li>
              </ul>
            </div>
          </aside>
        </div>
      </header>

      <main>
        <section className="trust-strip">
          <p>成長企業のプロダクト・マーケティングチームが利用を開始</p>
          <div className="trust-logos">
            <span>FUSION LAB</span>
            <span>PIXEL SHIFT</span>
            <span>NEXT ARC</span>
            <span>ORBIT ONE</span>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <p className="eyebrow">FEATURES</p>
            <h2>ゼロから再設計した、伝わるLPの骨格</h2>
            <p>
              情報を詰め込むのではなく、価値・信頼・導線を整理して、
              はじめて見た人でも迷わず理解できる構成にしています。
            </p>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split-section" id="workflow">
          <div className="section-heading">
            <p className="eyebrow">WORKFLOW</p>
            <h2>導入後すぐに回り始める3ステップ</h2>
          </div>
          <div className="workflow-list">
            {workflowSteps.map((step, index) => (
              <div key={step} className="workflow-item">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section testimonial-section">
          <div className="testimonial-card">
            <p className="quote">
              “バラバラだった施策進行が一つの流れにまとまり、LP制作から改善までの速度が明らかに上がりました。”
            </p>
            <div className="testimonial-meta">
              <strong>Yuna Sato</strong>
              <span>Growth Lead, Orbit One</span>
            </div>
          </div>
          <div className="stats-card">
            <h3>運用で効くポイント</h3>
            <ul>
              <li>誰が見てもわかるセクション設計</li>
              <li>訴求とCTAの距離が近い導線</li>
              <li>濃淡のあるビジュアルで視線誘導</li>
            </ul>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">FAQ</p>
            <h2>導入前によくある質問</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <article key={faq.question} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section cta-section" id="cta">
          <div className="cta-card">
            <div>
              <p className="eyebrow">READY TO LAUNCH</p>
              <h2>新しいLPを、今すぐ公開できる状態へ。</h2>
              <p>
                このページはゼロから再構築されており、必要に応じて
                さらに内容の差し替えやブランド調整を続けられます。
              </p>
            </div>
            <a className="button button-primary" href="mailto:hello@novaflow.jp">
              相談を始める
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
