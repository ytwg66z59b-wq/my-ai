import { useState, type ReactNode } from "react";
import {
  LINE_URL,
  cases,
  faqs,
  filmSubjects,
  knowSteps,
  nav,
  pains,
  processSteps,
  services,
  supports,
  videoTraits,
  videoTypes,
} from "./constants";
import { useReveal } from "./useReveal";

function Em({ children }: { children: ReactNode }) {
  return <span className="em">{children}</span>;
}

function SectionTitle({
  en,
  children,
}: {
  en: string;
  children: ReactNode;
}) {
  return (
    <div className="sec-title reveal">
      <p className="sec-en">{en}</p>
      <h2>{children}</h2>
    </div>
  );
}

function MediaFrame({
  label,
  ratio = "16 / 9",
  className = "",
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure className={`media ${className}`} style={{ aspectRatio: ratio }}>
      <span className="media-play" aria-hidden>
        ▶
      </span>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function CaseTabs({ item }: { item: (typeof cases)[number] }) {
  const tabs = [
    { key: "issue", label: "抱えていた課題", lead: "どんな課題があった？", body: item.issue },
    { key: "proposal", label: "提案した内容", lead: "どのように提案した？", body: item.proposal },
    { key: "design", label: "動画の設計", lead: "どう伝わるように設計した？", body: item.design },
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("issue");
  const current = tabs.find((t) => t.key === active)!;

  return (
    <article className="case-card reveal">
      <div className="case-pickup">Pick up!</div>
      <MediaFrame label={`${item.client} の動画`} />
      <div className="case-meta">
        <p className="case-client">{item.client}</p>
        <h3>
          <Em>{item.title.slice(0, 1)}</Em>
          {item.title.slice(1)}
        </h3>
      </div>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={active === tab.key ? "tab is-active" : "tab"}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        <p className="tab-lead">
          <i />
          {current.lead}
        </p>
        <p className="tab-body">{current.body}</p>
        <p className="tab-result">
          <strong>結果：</strong>
          {item.result}
        </p>
      </div>
    </article>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className={open ? "faq-item is-open" : "faq-item"}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="faq-qmark">Q</span>
      <span className="faq-main">
        <span className="faq-q">{q}</span>
        {open && <span className="faq-a">{a}</span>}
      </span>
      <span className="faq-chevron" aria-hidden>
        {open ? "−" : "＋"}
      </span>
    </button>
  );
}

export default function App() {
  useReveal();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lp">
      <header className="header">
        <a className="logo" href="#top">
          <span className="logo-mark" aria-hidden />
          HIDAKA
        </a>
        <nav className="desktop-nav" aria-label="ページ内ナビ">
          {nav.slice(0, 4).map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="header-cta" href={LINE_URL} target="_blank" rel="noreferrer">
            公式LINE
          </a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-label="メニュー"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <nav className="drawer" aria-label="メニュー">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a
            className="btn btn-primary"
            href={LINE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            公式LINEで相談する
          </a>
        </nav>
      )}

      <main id="top">
        {/* FV */}
        <section className="hero">
          <div className="hero-inner reveal">
            <p className="badge">VIDEO / PEOPLE / STORY</p>
            <h1>
              良い商品なのに、
              <br />
              なぜか売れない。
            </h1>
            <p className="hero-lead">
              商品を売る前に、
              <br />
              <Em>「人」</Em>を知ってもらう。
            </p>
            <p className="body">
              動画制作を通して、
              <br />
              会社・商品の魅力だけではなく、
              <br />
              そこにいる「人」まで伝えます。
            </p>
            <a className="btn btn-primary btn-lg" href={LINE_URL} target="_blank" rel="noreferrer">
              公式LINEで相談する
              <span className="btn-arrow" aria-hidden>
                ▶
              </span>
            </a>
            <p className="note">まずは相談だけでも大丈夫です</p>
          </div>
          <div className="reveal reveal-delay">
            <MediaFrame label="日高の写真 / 短い紹介動画" ratio="4 / 5" className="hero-media" />
          </div>
        </section>

        {/* About */}
        <section className="section" id="about">
          <SectionTitle en="About">
            はじめまして。
            <br />
            動画をつくっている、<Em>日高</Em>です。
          </SectionTitle>
          <div className="split">
            <div className="reveal">
              <MediaFrame label="大きな顔写真 / 自己紹介動画" ratio="3 / 4" />
            </div>
            <div className="copy reveal reveal-delay">
              <p>
                僕は、動画を「商品を売るためだけのもの」だとは考えていません。
              </p>
              <p>
                その会社で働いている人。
                <br />
                商品を作っている人。
                <br />
                お客様と向き合っている人。
              </p>
              <p>
                そこにある想いやこだわり。
                <br />
                そういうものまで伝えられるのが、動画だと思っています。
              </p>
              <a className="text-link" href="#story">
                僕について知る
              </a>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section section-soft" id="story">
          <SectionTitle en="Why">
            どうして僕は、
            <br />
            <Em>「人を伝える動画」</Em>を
            <br />
            作っているのか。
          </SectionTitle>
          <div className="reveal">
            <MediaFrame label="日高が話している動画" />
          </div>
          <div className="copy narrow reveal">
            <p>僕は、いろんな会社やお店を見ていて、</p>
            <p className="quote">
              「良い商品なのに、その魅力が伝わっていない」
            </p>
            <p>と感じることがあります。</p>
            <p>
              商品の説明はできる。サービスの特徴も説明できる。でも、
            </p>
            <p className="quote">「どんな人が、この商品を作っているんだろう。」</p>
            <p className="quote">「なぜ、この仕事をしているんだろう。」</p>
            <p>そこまで伝わっていない。</p>
            <p>
              だから僕は、もっと<Em>「人」</Em>を見せてもいいんじゃないか。
              と思っています。
            </p>
          </div>
        </section>

        {/* Problem */}
        <section className="section" id="thinking">
          <SectionTitle en="Question">
            良い商品なのに、
            <br />
            <Em>「売れない」</Em>のはなぜでしょうか。
          </SectionTitle>
          <div className="copy narrow reveal">
            <p>商品の品質が悪いからとは限りません。</p>
            <p>価格が高いからとも限りません。</p>
            <p>
              そもそも、<Em>「知られていない」</Em>ということがあります。
            </p>
            <p>
              そして、知ってもらうためには、商品の情報だけでは足りないことがあります。
            </p>
          </div>
        </section>

        {/* Pain */}
        <section className="section section-soft">
          <SectionTitle en="Pain">
            こんなことを
            <br />
            <Em>感じていませんか？</Em>
          </SectionTitle>
          <div className="pain-grid">
            {pains.map((pain, i) => (
              <article className={`card reveal reveal-delay-${(i % 3) + 1}`} key={pain.title}>
                <span className="check" aria-hidden>
                  ✓
                </span>
                <p>{pain.title}</p>
              </article>
            ))}
          </div>
          <p className="center-line reveal">
            本当は、<Em>もっと伝えたいことがある。</Em>
          </p>
        </section>

        {/* Belief */}
        <section className="section">
          <SectionTitle en="Belief">
            商品を売る前に、
            <br />
            <Em>「人」</Em>を知ってもらう。
          </SectionTitle>
          <div className="belief-list reveal">
            {[
              "どんな人なのか。",
              "なぜ、この仕事をしているのか。",
              "何を大切にしているのか。",
              "どんな想いで商品を作っているのか。",
              "どんなお客様と向き合っているのか。",
            ].map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <p className="center-line reveal">それを知ってもらう。</p>
        </section>

        {/* Change */}
        <section className="section section-soft">
          <SectionTitle en="Change">
            人を知ることで
            <br />
            生まれる<Em>変化</Em>
          </SectionTitle>
          <div className="step-scroll reveal">
            {knowSteps.map((step) => (
              <div className="step-pill" key={step.num}>
                <span>{step.num}</span>
                <strong>{step.label}</strong>
              </div>
            ))}
          </div>
          <p className="center-line reveal">
            <Em>「この人だからお願いしたい。」</Em>
          </p>
        </section>

        {/* Why video */}
        <section className="section">
          <SectionTitle en="Why Video">
            文章だけでは、
            <br />
            <Em>伝わらないもの</Em>があります。
          </SectionTitle>
          <div className="reveal">
            <MediaFrame label="表情・声・現場の空気が伝わる映像" />
          </div>
          <div className="trait-grid">
            {videoTraits.map((item, i) => (
              <article className={`card reveal reveal-delay-${(i % 3) + 1}`} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
          <p className="center-line reveal">
            動画は、<Em>「どんな人なのか」</Em>まで伝えられる。
          </p>
        </section>

        {/* What I film */}
        <section className="section section-soft" id="works">
          <SectionTitle en="What I Film">
            僕が撮りたいのは、
            <br />
            <Em>「商品」だけ</Em>ではありません。
          </SectionTitle>
          <div className="support-cards">
            {filmSubjects.map((item, i) => (
              <article className={`support-card reveal reveal-delay-${(i % 3) + 1}`} key={item.title}>
                <span className="support-badge">Point 0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Compare */}
        <section className="section">
          <SectionTitle en="Compare">
            動画が<Em>ある場合</Em>・
            <Em>ない場合</Em>
          </SectionTitle>
          <div className="compare">
            <article className="compare-col muted reveal">
              <h3>動画がない場合</h3>
              <ul>
                <li>会社のことが分からない</li>
                <li>商品だけを見る</li>
                <li>価格・条件で比較する</li>
                <li>他社に流れる</li>
              </ul>
            </article>
            <article className="compare-col featured reveal reveal-delay">
              <h3>人が伝わる動画がある場合</h3>
              <ul>
                <li>「こんな人がやっているんだ」</li>
                <li>「この考え方、好きだな」</li>
                <li>「もっと知りたい」</li>
                <li>「ここにお願いしたい」</li>
                <li>「またここで買いたい」</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Role */}
        <section className="section section-accent">
          <div className="role reveal">
            <p className="sec-en light">Role</p>
            <h2>
              動画の目的は、
              <br />
              <Em>「いきなり売ること」</Em>
              <br />
              ではありません。
            </h2>
            <p className="role-accent">「もっと知りたい」をつくること。</p>
          </div>
        </section>

        {/* Stance */}
        <section className="section">
          <SectionTitle en="Stance">
            「かっこいい動画」を作るだけなら、
            <br />
            僕じゃなくてもいい。
          </SectionTitle>
          <div className="copy narrow reveal">
            <p>
              もちろん、映像の綺麗さ。編集のクオリティ。音楽。デザイン。それも大切です。
            </p>
            <p>でも僕が一番大切にするのは、</p>
            <p className="quote">
              「この動画を見た人に、<Em>何を感じてほしいのか。</Em>」
            </p>
            <p>です。</p>
          </div>
        </section>

        {/* Before shooting */}
        <section className="section section-soft">
          <SectionTitle en="Before Shooting">
            僕は、撮影する前に
            <br />
            <Em>たくさん話を聞きます。</Em>
          </SectionTitle>
          <div className="split">
            <div className="reveal">
              <MediaFrame label="話を聞いている現場写真" ratio="4 / 5" />
            </div>
            <div className="copy reveal reveal-delay">
              <p>会社のこと。商品について。仕事のこと。</p>
              <p>これまでのこと。これからのこと。</p>
              <p>そして、</p>
              <p className="quote">「なぜ、この仕事をしているんですか？」</p>
              <p>まで聞きたい。</p>
              <p>
                そこで初めて、<Em>「この会社ならではの動画」</Em>
                が作れると考えています。
              </p>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section">
          <SectionTitle en="Process">
            動画制作の<Em>流れ</Em>
          </SectionTitle>
          <div className="process">
            {processSteps.map((step, i) => (
              <div key={step.num}>
                <div className="process-row reveal">
                  <div className="process-icon">{step.num}</div>
                  <div>
                    <p className="process-step">Step {step.num}</p>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {i < processSteps.length - 1 && <div className="process-divider" />}
              </div>
            ))}
          </div>
          <p className="note center reveal">
            ※撮影については、内容に応じてサポート方法を調整します。
          </p>
        </section>

        {/* Types */}
        <section className="section section-soft">
          <SectionTitle en="Types">
            伝えたいことに合わせて、
            <br />
            動画の形を考えます。
          </SectionTitle>
          <div className="type-grid">
            {videoTypes.map((item, i) => (
              <article className={`card reveal reveal-delay-${(i % 3) + 1}`} key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Cases */}
        <section className="section" id="cases">
          <SectionTitle en="Works">
            実際に、
            <br />
            こんな動画を<Em>つくっています。</Em>
          </SectionTitle>
          <div className="cases">
            {cases.map((item) => (
              <CaseTabs key={item.client} item={item} />
            ))}
          </div>
        </section>

        {/* After */}
        <section className="section section-soft">
          <SectionTitle en="After">
            作って終わりには
            <br />
            <Em>しません。</Em>
          </SectionTitle>
          <div className="copy narrow reveal">
            <p>動画は、作っただけでは誰にも見てもらえません。</p>
            <p>だから、「どこで使う？」「誰に見てもらう？」「どう届ける？」まで考えます。</p>
            <div className="chips">
              {["SNS", "Webサイト", "LP", "広告", "採用ページ", "営業資料"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Web */}
        <section className="section">
          <SectionTitle en="Web">
            動画だけで、
            <br />
            すべてが解決するとは
            <br />
            思っていません。
          </SectionTitle>
          <div className="copy narrow reveal">
            <p>
              どれだけ良い動画を作っても、見てもらえなければ意味がありません。
            </p>
            <p>
              だから僕は、動画を入り口として、LPやLINEなども含め、
              <Em>「伝える」から「届ける」まで</Em>
              考えます。
            </p>
          </div>
        </section>

        {/* Support */}
        <section className="section section-soft">
          <SectionTitle en="Support">
            動画を作るのが初めてでも、
            <br />
            <Em>大丈夫です。</Em>
          </SectionTitle>
          <div className="support-cards">
            {supports.map((item, i) => (
              <article className={`support-card reveal reveal-delay-${(i % 2) + 1}`} key={item}>
                <span className="support-badge">Support 0{i + 1}</span>
                <div>
                  <h3>{item}</h3>
                </div>
              </article>
            ))}
          </div>
          <div className="copy narrow reveal">
            <p>そんな場合も、最初から一緒に整理します。</p>
            <p>
              「何を作るか」から考えるのではなく、
              <Em>「何を伝えたいのか」</Em>
              から一緒に考えます。
            </p>
          </div>
        </section>

        {/* Outro */}
        <section className="section" id="profile">
          <SectionTitle en="Once More">
            最後に、
            <br />
            もう一度だけ僕の話を
            <br />
            させてください。
          </SectionTitle>
          <div className="split reverse">
            <div className="copy reveal">
              <p>
                僕は、動画を納品して終わる関係ではなく、
                <Em>「この人に頼んでよかった」</Em>
                と思ってもらえる仕事がしたい。
              </p>
              <p>だから、まずはちゃんとあなたのことを知りたい。</p>
              <p>
                会社のこと。商品について。仕事について。
                <br />
                そして、あなた自身のこと。
              </p>
              <p>
                そこから一緒に、<Em>「何を伝えるべきか」</Em>を考えます。
              </p>
            </div>
            <div className="reveal reveal-delay">
              <MediaFrame label="日高の写真 / プロフィール動画" ratio="3 / 4" />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="cta-band" id="line">
          <div className="cta-band-inner reveal">
            <p className="cta-bubble">導入未定でもOK！</p>
            <h2>
              あなたの会社のこと、
              <br />
              <Em>もっと知ってもらいませんか？</Em>
            </h2>
            <p>
              商品だけではなく、人柄。想い。仕事へのこだわり。
              <br />
              あなたの会社にしかない魅力を、動画で伝えていきます。
            </p>
            <div className="cta-card">
              <p className="cta-card-lead">＼ まずは相談だけでも大丈夫です！ ／</p>
              <a className="btn btn-primary btn-block" href={LINE_URL} target="_blank" rel="noreferrer">
                公式LINEで相談する
                <span className="btn-arrow" aria-hidden>
                  ▶
                </span>
              </a>
              <a className="btn btn-outline btn-block" href="#about">
                僕について知る
                <span className="btn-arrow" aria-hidden>
                  ▶
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section" id="services">
          <SectionTitle en="Services">
            できること
          </SectionTitle>
          <div className="type-grid">
            {services.map((item, i) => (
              <article className={`card reveal reveal-delay-${(i % 2) + 1}`} key={item.title}>
                <span className="kind">{item.kind}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-soft">
          <SectionTitle en="Faq">
            よくある<Em>質問</Em>
          </SectionTitle>
          <div className="faq-list">
            {faqs.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
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
        <div className="fixed-cta-btns">
          <a className="btn btn-primary" href={LINE_URL} target="_blank" rel="noreferrer">
            公式LINEで相談する
            <span className="btn-arrow" aria-hidden>
              ▶
            </span>
          </a>
          <a className="btn btn-outline" href="#about">
            僕について知る
            <span className="btn-arrow" aria-hidden>
              ▶
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
