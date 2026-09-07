import { useState } from "react";
import {
  LINE_URL,
  cases,
  faqs,
  features,
  filmSubjects,
  nav,
  painCases,
  processSteps,
  services,
  supports,
  videoTypes,
} from "./constants";
import {
  Em,
  LineButton,
  MediaFrame,
  OutlineButton,
  SectionHead,
  useHeaderShrink,
  useReveal,
} from "./components/ui";

function CaseCard({ item }: { item: (typeof cases)[number] }) {
  const tabs = [
    { key: "issue", label: "抱えていた課題", lead: "どんな課題があった？", body: item.issue },
    { key: "proposal", label: "提案した内容", lead: "どのように提案した？", body: item.proposal },
    { key: "design", label: "動画の設計", lead: "どう伝わるように設計した？", body: item.design },
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("issue");
  const current = tabs.find((tab) => tab.key === active) ?? tabs[0];

  return (
    <article className="work-card reveal">
      <div className="pickup">Pick up!</div>
      <MediaFrame label={`${item.client} の動画`} />
      <div className="work-body">
        <p className="work-client">{item.client}</p>
        <h3>
          <Em>{item.title.slice(0, 1)}</Em>
          {item.title.slice(1)}
        </h3>
        <p className="work-summary">{item.summary}</p>
        <div className="tag-row">
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              className={active === tab.key ? "tab is-active" : "tab"}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-panel" role="tabpanel">
          <p className="tab-lead">
            <i />
            {current.lead}
          </p>
          <p>{current.body}</p>
          <p className="tab-result">
            <strong>結果：</strong>
            {item.result}
          </p>
        </div>
      </div>
    </article>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={open ? "faq-card is-open" : "faq-card"}
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
    >
      <span className="faq-qmark">Q</span>
      <span className="faq-copy">
        <span className="faq-q">{q}</span>
        {open && <span className="faq-a">{a}</span>}
      </span>
      <span className="faq-toggle" aria-hidden>
        {open ? "−" : "＋"}
      </span>
    </button>
  );
}

export default function App() {
  useReveal();
  const shrunk = useHeaderShrink();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lp">
      <header className={shrunk ? "site-header is-shrunk" : "site-header"}>
        <a className="logo" href="#top">
          <span className="logo-mark" aria-hidden />
          HIDAKA
        </a>
        <nav className="nav-pc" aria-label="ページ内ナビ">
          {nav.slice(0, 5).map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="nav-cta" href={LINE_URL} target="_blank" rel="noreferrer">
            公式LINEで相談
          </a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-label="メニューを開く"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <nav className="nav-drawer" aria-label="モバイルメニュー">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <LineButton />
        </nav>
      )}

      <main id="top">
        <section className="hero">
          <div className="hero-copy reveal">
            <p className="eyebrow">VIDEO / PEOPLE / STORY</p>
            <p className="hero-kicker">その会社の魅力、正しく届いていますか？</p>
            <h1>
              商品を売る前に、
              <br />
              <Em>「人」</Em>を知ってもらう。
            </h1>
            <p className="hero-lead">
              良い商品なのに、なぜか売れない。
              <br />
              動画で、会社・商品だけではなく
              <br />
              そこにいる人まで伝えます。
            </p>
            <div className="hero-actions">
              <LineButton className="btn-lg" />
              <OutlineButton href="#problem">課題を見る</OutlineButton>
            </div>
            <p className="micro">まずは相談だけでも大丈夫です</p>
          </div>
          <div className="hero-visual reveal reveal-delay-2">
            <MediaFrame label="日高の写真 / 短い紹介動画" ratio="4 / 5" className="hero-media" />
          </div>
        </section>

        <section className="band band-soft" id="problem">
          <div className="wrap">
            <SectionHead en="Problem">
              こんなお悩み
              <br />
              <Em>ありませんか？</Em>
            </SectionHead>
            <div className="pain-grid">
              {painCases.map((item, index) => (
                <article
                  className={`pain-card reveal reveal-delay-${(index % 3) + 1}`}
                  key={item.label}
                >
                  <p className="pain-scene">{item.scene}</p>
                  <h3>{item.title}</h3>
                  <div className="pain-foot">
                    <span>{item.label}</span>
                    <strong>{item.who}</strong>
                  </div>
                </article>
              ))}
            </div>
            <p className="bridge reveal">
              原因は、サービスの質ではなく
              <br />
              <Em>伝え方</Em>にあるかもしれません。
            </p>
          </div>
        </section>

        <section className="band" id="solution">
          <div className="wrap narrow">
            <SectionHead en="Solution">
              その課題、
              <br />
              <Em>「人を伝える動画」</Em>で
              <br />
              解決できます。
            </SectionHead>
            <div className="solution-copy reveal">
              <p>
                僕は、動画を「商品を売るためだけのもの」だとは考えていません。
              </p>
              <p>
                その会社で働いている人。商品を作っている人。お客様と向き合っている人。
                そこにある想いやこだわりまで伝えられるのが、動画だと思っています。
              </p>
              <p>
                だから僕は、<Em>商品を売る前に「人」を知ってもらう</Em>
                動画をつくります。
              </p>
            </div>
            <div className="reveal">
              <MediaFrame label="日高が考え方を話す動画" />
            </div>
          </div>
        </section>

        <section className="band band-soft" id="features">
          <div className="wrap">
            <SectionHead en="Feature">
              なぜ、
              <br />
              <Em>「人を伝える動画」</Em>
              <br />
              なのか。
            </SectionHead>
            <div className="feature-grid">
              {features.map((item, index) => (
                <article
                  className={`feature-card reveal reveal-delay-${(index % 3) + 1}`}
                  key={item.num}
                >
                  <span>Feature {item.num}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
            <div className="subject-row">
              {filmSubjects.map((item, index) => (
                <article
                  className={`subject-card reveal reveal-delay-${(index % 3) + 1}`}
                  key={item.title}
                >
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <SectionHead en="Compare">
              動画があると、
              <br />
              <Em>ここまで変わります。</Em>
            </SectionHead>
            <div className="compare-grid">
              <article className="compare-card muted reveal">
                <h3>動画がない場合</h3>
                <ul>
                  <li>どんな会社か分からない</li>
                  <li>商品だけを見て判断される</li>
                  <li>価格・条件で比較される</li>
                  <li>他社に流れる</li>
                </ul>
              </article>
              <article className="compare-card featured reveal reveal-delay-2">
                <h3>人が伝わる動画がある場合</h3>
                <ul>
                  <li>「こんな人がやっているんだ」</li>
                  <li>「この考え方、好きだな」</li>
                  <li>「もっと知りたい」</li>
                  <li>「ここにお願いしたい」</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="band band-dark">
          <div className="wrap narrow center">
            <p className="section-en is-on-dark reveal">Role</p>
            <h2 className="section-title is-on-dark reveal">
              動画の目的は、
              <br />
              <Em>「いきなり売ること」</Em>
              <br />
              ではありません。
            </h2>
            <p className="role-accent reveal">「もっと知りたい」をつくること。</p>
          </div>
        </section>

        <section className="band band-soft" id="types">
          <div className="wrap">
            <SectionHead en="Use Cases">
              伝えたいことに合わせて、
              <br />
              動画の形を考えます。
            </SectionHead>
            <div className="type-grid">
              {videoTypes.map((item, index) => (
                <article
                  className={`type-card reveal reveal-delay-${(index % 3) + 1}`}
                  key={item.title}
                >
                  <span>{item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="works">
          <div className="wrap">
            <SectionHead en="Works">
              制作<Em>実績</Em>
            </SectionHead>
            <div className="works-stack">
              {cases.map((item) => (
                <CaseCard key={item.client} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="band band-soft" id="process">
          <div className="wrap">
            <SectionHead en="Process">
              動画制作の<Em>流れ</Em>
            </SectionHead>
            <div className="process-list">
              {processSteps.map((step, index) => (
                <div key={step.num}>
                  <div className="process-row reveal">
                    <div className="process-num">{step.num}</div>
                    <div>
                      <p className="process-label">Step {step.num}</p>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                  {index < processSteps.length - 1 && <div className="process-line" />}
                </div>
              ))}
            </div>
            <p className="note center reveal">
              ※撮影については、内容に応じてサポート方法を調整します。
            </p>
          </div>
        </section>

        <section className="band" id="support">
          <div className="wrap">
            <SectionHead en="Support">
              動画制作だけで終わらず、
              <br />
              <Em>伝えるところまで</Em>伴走します。
            </SectionHead>
            <div className="support-grid">
              {supports.map((item, index) => (
                <article
                  className={`support-card reveal reveal-delay-${(index % 3) + 1}`}
                  key={item.num}
                >
                  <span>Support {item.num}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
            <div className="service-grid">
              {services.map((item, index) => (
                <article
                  className={`service-card reveal reveal-delay-${(index % 2) + 1}`}
                  key={item.title}
                >
                  <span>{item.kind}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band band-soft" id="about">
          <div className="wrap about-grid">
            <div className="reveal">
              <MediaFrame label="日高の写真 / プロフィール動画" ratio="3 / 4" />
            </div>
            <div className="about-copy reveal reveal-delay-2">
              <SectionHead en="About">
                はじめまして。
                <br />
                動画をつくっている、<Em>日高</Em>です。
              </SectionHead>
              <p>
                僕は、納品して終わる関係ではなく、
                <Em>「この人に頼んでよかった」</Em>
                と思ってもらえる仕事がしたい。
              </p>
              <p>
                だから、まずはあなたのことを知りたい。
                会社のこと。商品のこと。そして、あなた自身のこと。
              </p>
              <p>そこから一緒に、「何を伝えるべきか」を考えます。</p>
            </div>
          </div>
        </section>

        <section className="band" id="faq">
          <div className="wrap narrow">
            <SectionHead en="Faq">
              よくある<Em>質問</Em>
            </SectionHead>
            <div className="faq-list">
              {faqs.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        <section className="cta-final" id="line">
          <div className="wrap narrow center">
            <p className="cta-chip reveal">相談だけでもOK</p>
            <h2 className="reveal">
              あなたの会社のこと、
              <br />
              <Em>もっと知ってもらいませんか？</Em>
            </h2>
            <p className="cta-copy reveal">
              商品だけではなく、人柄・想い・仕事へのこだわり。
              <br />
              あなたの会社にしかない魅力を、動画で伝えていきます。
            </p>
            <div className="cta-panel reveal">
              <p>＼ ご質問だけでも大丈夫です！ ／</p>
              <LineButton className="btn-block" />
              <OutlineButton href="#about" className="btn-block">
                僕について知る
              </OutlineButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="logo" href="#top">
          <span className="logo-mark" aria-hidden />
          HIDAKA
        </a>
        <nav>
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} Hidaka</p>
      </footer>

      <div className="fixed-cta">
        <p>＼ ご質問だけでも大丈夫です！ ／</p>
        <div className="fixed-cta-row">
          <LineButton />
          <OutlineButton href="#about">僕について知る</OutlineButton>
        </div>
      </div>
    </div>
  );
}
