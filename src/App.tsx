import { LINE_URL, cases, filmSubjects, funnel, knowSteps, nav, pains, processSteps, services, supports, videoTraits, videoTypes } from "./constants";
import { useReveal, useScrollVideos } from "./useReveal";

function LineButton({
  className = "",
  children = "公式LINEで相談する",
}: {
  className?: string;
  children?: string;
}) {
  return (
    <a className={`btn-line ${className}`} href={LINE_URL} target="_blank" rel="noreferrer">
      <LineIcon />
      {children}
    </a>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 3C10.6 3 3 9.7 3 18c0 5 2.8 9.5 7.2 12.4l-1 6.6 6.3-3.4c1.5.4 3 .6 4.5.6 9.4 0 17-6.7 17-15C37 9.7 29.4 3 20 3z"
      />
    </svg>
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
    <figure className={`media-frame ${className}`} style={{ aspectRatio: ratio }}>
      <span className="media-play">▶</span>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export default function App() {
  useReveal();
  useScrollVideos();

  return (
    <div className="lp">
      <header className="site-header">
        <a className="logo" href="#top">
          HIDAKA
        </a>
        <nav className="header-nav" aria-label="ページ内ナビ">
          {nav.slice(0, 4).map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-line" href={LINE_URL} target="_blank" rel="noreferrer">
          公式LINE
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy reveal">
            <p className="kicker">VIDEO / PEOPLE / STORY</p>
            <h1>
              良い商品なのに、
              <br />
              なぜか売れない。
            </h1>
            <p className="hero-lead">
              商品を売る前に、
              <br />
              「人」を知ってもらう。
            </p>
            <p className="hero-body">
              動画制作を通して、
              <br />
              会社・商品の魅力だけではなく、
              <br />
              そこにいる「人」まで伝えます。
            </p>
            <div className="hero-cta">
              <LineButton />
              <p className="cta-note">まずは相談だけでも大丈夫です</p>
            </div>
          </div>
          <div className="hero-visual reveal reveal-delay-2">
            <MediaFrame label="日高の写真 / 短い紹介動画" ratio="4 / 5" className="hero-media" />
          </div>
        </section>

        <section className="section section-cream" id="about">
          <div className="about-grid">
            <div className="reveal">
              <MediaFrame label="大きな顔写真 / 自己紹介動画" ratio="3 / 4" />
            </div>
            <div className="read reveal reveal-delay-1">
              <p className="kicker">ABOUT</p>
              <h2>
                はじめまして。
                <br />
                動画をつくっている、日高です。
              </h2>
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

        <section className="section section-dark" id="story">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker light">WHY</p>
              <h2>
                どうして僕は、
                <br />
                「人を伝える動画」を作っているのか。
              </h2>
            </div>
            <div className="reveal reveal-delay-1">
              <MediaFrame label="日高が話している動画" className="media-wide" />
            </div>
            <div className="read reveal reveal-delay-2">
              <p>僕は、いろんな会社やお店を見ていて、</p>
              <p className="quote">「良い商品なのに、その魅力が伝わっていない」</p>
              <p>と感じることがあります。</p>
              <p>
                商品の説明はできる。
                <br />
                サービスの特徴も説明できる。
              </p>
              <p>でも、</p>
              <p className="quote">「どんな人が、この商品を作っているんだろう。」</p>
              <p className="quote">「なぜ、この仕事をしているんだろう。」</p>
              <p>そこまで伝わっていない。</p>
              <p>
                だから僕は、
                <br />
                もっと「人」を見せてもいいんじゃないか。
                <br />
                と思っています。
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="thinking">
          <div className="read reveal">
            <p className="kicker">QUESTION</p>
            <h2>
              良い商品なのに、
              <br />
              「売れない」のはなぜでしょうか。
            </h2>
            <p>商品の品質が悪いからとは限りません。</p>
            <p>価格が高いからとも限りません。</p>
            <p>
              そもそも、
              <br />
              <strong>「知られていない」</strong>
              <br />
              ということがあります。
            </p>
            <p>
              そして、知ってもらうためには、
              <br />
              商品の情報だけでは足りないことがあります。
            </p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">PAIN</p>
              <h2>こんなことを感じていませんか？</h2>
            </div>
            <div className="card-grid six">
              {pains.map((pain, index) => (
                <article className={`card reveal reveal-delay-${(index % 3) + 1}`} key={pain}>
                  <p>{pain}</p>
                </article>
              ))}
            </div>
            <p className="big-line reveal">本当は、もっと伝えたいことがある。</p>
          </div>
        </section>

        <section className="section">
          <div className="read reveal">
            <p className="kicker">BELIEF</p>
            <h2>
              商品を売る前に、
              <br />
              「人」を知ってもらう。
            </h2>
            <p>どんな人なのか。</p>
            <p>なぜ、この仕事をしているのか。</p>
            <p>何を大切にしているのか。</p>
            <p>どんな想いで商品を作っているのか。</p>
            <p>どんなお客様と向き合っているのか。</p>
            <p>それを知ってもらう。</p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">CHANGE</p>
              <h2>人を知ることで生まれる変化</h2>
            </div>
            <div className="step-track reveal">
              {knowSteps.map((step, index) => (
                <div className="step-item" key={step.num}>
                  <span className="step-num">{step.num}</span>
                  <strong>{step.label}</strong>
                  {index < knowSteps.length - 1 && <span className="step-arrow">→</span>}
                </div>
              ))}
            </div>
            <p className="big-line reveal">「この人だからお願いしたい。」</p>
          </div>
        </section>

        <section className="section">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">WHY VIDEO</p>
              <h2>
                文章だけでは、
                <br />
                伝わらないものがあります。
              </h2>
            </div>
            <div className="reveal">
              <MediaFrame label="表情・声・現場の空気が伝わる映像" />
            </div>
            <div className="card-grid three">
              {videoTraits.map((item, index) => (
                <article className={`card reveal reveal-delay-${(index % 3) + 1}`} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
            <p className="big-line reveal">
              動画は、
              <br />
              「どんな人なのか」まで伝えられる。
            </p>
          </div>
        </section>

        <section className="section section-cream" id="works">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">WHAT I FILM</p>
              <h2>
                僕が撮りたいのは、
                <br />
                「商品」だけではありません。
              </h2>
            </div>
            <div className="card-grid five">
              {filmSubjects.map((item, index) => (
                <article className={`card card-large reveal reveal-delay-${(index % 3) + 1}`} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="compare">
            <article className="compare-col muted reveal">
              <h3>動画がない場合</h3>
              <p>会社のことが分からない。</p>
              <span>↓</span>
              <p>商品だけを見る。</p>
              <span>↓</span>
              <p>価格・条件で比較する。</p>
              <span>↓</span>
              <p>他社に流れる。</p>
            </article>
            <article className="compare-col emphasis reveal reveal-delay-2">
              <h3>人が伝わる動画がある場合</h3>
              <p>「こんな人がやっているんだ。」</p>
              <span>↓</span>
              <p>「この考え方、好きだな。」</p>
              <span>↓</span>
              <p>「もっと知りたい。」</p>
              <span>↓</span>
              <p>「ここにお願いしたい。」</p>
              <span>↓</span>
              <p>「またここで買いたい。」</p>
            </article>
          </div>
        </section>

        <section className="section section-ink">
          <div className="role reveal">
            <p className="kicker light">ROLE</p>
            <h2>
              動画の目的は、
              <br />
              「いきなり売ること」ではありません。
            </h2>
            <p className="role-accent">「もっと知りたい」をつくること。</p>
            <div className="funnel">
              {funnel.map((item, index) => (
                <div key={item}>
                  <span>{item}</span>
                  {index < funnel.length - 1 && <i>↓</i>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="read reveal">
            <p className="kicker">STANCE</p>
            <h2>
              「かっこいい動画」を作るだけなら、
              <br />
              僕じゃなくてもいい。
            </h2>
            <p>もちろん、</p>
            <p>
              映像の綺麗さ。
              <br />
              編集のクオリティ。
              <br />
              音楽。
              <br />
              デザイン。
            </p>
            <p>それも大切です。</p>
            <p>でも僕が一番大切にするのは、</p>
            <p className="quote">「この動画を見た人に、何を感じてほしいのか。」</p>
            <p>です。</p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="listen-grid">
            <div className="reveal">
              <MediaFrame label="話を聞いている現場写真" ratio="4 / 5" />
            </div>
            <div className="read reveal reveal-delay-1">
              <p className="kicker">BEFORE SHOOTING</p>
              <h2>
                僕は、撮影する前に
                <br />
                たくさん話を聞きます。
              </h2>
              <p>会社のこと。</p>
              <p>商品について。</p>
              <p>仕事のこと。</p>
              <p>これまでのこと。</p>
              <p>これからのこと。</p>
              <p>そして、</p>
              <p className="quote">「なぜ、この仕事をしているんですか？」</p>
              <p>まで聞きたい。</p>
              <p>
                そこで初めて、
                <br />
                「この会社ならではの動画」
                <br />
                が作れると考えています。
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">PROCESS</p>
              <h2>制作の流れ</h2>
            </div>
            <div className="card-grid three">
              {processSteps.map((step, index) => (
                <article className={`card process-card reveal reveal-delay-${(index % 3) + 1}`} key={step.num}>
                  <span className="process-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
            <p className="note reveal">※撮影については、内容に応じてサポート方法を調整します。</p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">TYPES</p>
              <h2>
                伝えたいことに合わせて、
                <br />
                動画の形を考えます。
              </h2>
            </div>
            <div className="card-grid three">
              {videoTypes.map((item, index) => (
                <article className={`card reveal reveal-delay-${(index % 3) + 1}`} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="cases">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">WORK</p>
              <h2>
                実際に、
                <br />
                こんな動画をつくっています。
              </h2>
            </div>
            {cases.map((item) => (
              <article className="case reveal" key={item.title}>
                <MediaFrame label={`${item.title} の動画`} />
                <div className="case-copy">
                  <p className="case-label">{item.title}</p>
                  <dl>
                    <div>
                      <dt>課題</dt>
                      <dd>{item.issue}</dd>
                    </div>
                    <div>
                      <dt>考え方</dt>
                      <dd>{item.thinking}</dd>
                    </div>
                    <div>
                      <dt>制作</dt>
                      <dd>{item.making}</dd>
                    </div>
                    <div>
                      <dt>結果</dt>
                      <dd>{item.result}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-cream">
          <div className="read reveal">
            <p className="kicker">AFTER</p>
            <h2>作って終わりにはしません。</h2>
            <p>動画は、作っただけでは誰にも見てもらえません。</p>
            <p>だから、</p>
            <p>「どこで使う？」</p>
            <p>「誰に見てもらう？」</p>
            <p>「どう届ける？」</p>
            <p>まで考えます。</p>
            <div className="chip-row">
              {["SNS", "Webサイト", "LP", "広告", "採用ページ", "営業資料"].map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <p>など、動画を目的に合わせて活用していきます。</p>
          </div>
        </section>

        <section className="section">
          <div className="read reveal">
            <p className="kicker">WEB</p>
            <h2>
              動画だけで、
              <br />
              すべてが解決するとは思っていません。
            </h2>
            <p>
              どれだけ良い動画を作っても、
              <br />
              見てもらえなければ意味がありません。
            </p>
            <p>
              だから僕は、
              <br />
              動画を入り口として、
              <br />
              LPやLINEなども含め、
              <br />
              「伝える」から「届ける」まで
              <br />
              考えます。
            </p>
          </div>
        </section>

        <section className="section section-cream">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">SUPPORT</p>
              <h2>
                動画を作るのが初めてでも、
                <br />
                大丈夫です。
              </h2>
            </div>
            <div className="card-grid two">
              {supports.map((item, index) => (
                <article className={`card reveal reveal-delay-${(index % 2) + 1}`} key={item}>
                  <p>{item}</p>
                </article>
              ))}
            </div>
            <div className="read reveal">
              <p>そんな場合も、最初から一緒に整理します。</p>
              <p>
                「何を作るか」から考えるのではなく、
                <br />
                「何を伝えたいのか」
                <br />
                から一緒に考えます。
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="profile">
          <div className="outro-grid">
            <div className="read reveal">
              <p className="kicker">ONCE MORE</p>
              <h2>
                最後に、
                <br />
                もう一度だけ僕の話をさせてください。
              </h2>
              <p>
                僕は、動画を納品して終わる関係ではなく、
                <br />
                「この人に頼んでよかった」
                <br />
                と思ってもらえる仕事がしたい。
              </p>
              <p>だから、まずはちゃんとあなたのことを知りたい。</p>
              <p>
                会社のこと。
                <br />
                商品について。
                <br />
                仕事について。
                <br />
                そして、あなた自身のこと。
              </p>
              <p>
                そこから一緒に、
                <br />
                「何を伝えるべきか」
                <br />
                を考えます。
              </p>
            </div>
            <div className="reveal reveal-delay-2">
              <MediaFrame label="日高の写真 / プロフィール動画" ratio="3 / 4" />
            </div>
          </div>
        </section>

        <section className="section section-cta" id="line">
          <div className="cta-block reveal">
            <h2>
              あなたの会社のこと、
              <br />
              もっと知ってもらいませんか？
            </h2>
            <p>
              商品だけではなく、
              <br />
              人柄。
              <br />
              想い。
              <br />
              仕事へのこだわり。
            </p>
            <p>
              あなたの会社にしかない魅力を、
              <br />
              動画で伝えていきます。
            </p>
            <LineButton className="btn-line-lg" />
            <p className="cta-note">まずは相談だけでも大丈夫です</p>
          </div>
        </section>

        <section className="section" id="services">
          <div className="stack">
            <div className="read reveal">
              <p className="kicker">SERVICES</p>
              <h2>できること</h2>
            </div>
            <div className="card-grid two">
              {services.map((item) => (
                <article className="card reveal" key={item.title}>
                  <span className="kind">{item.kind}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <a className="logo" href="#top">
            HIDAKA
          </a>
          <nav aria-label="フッターナビ">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <LineButton />
        </div>
        <p className="copy">© {new Date().getFullYear()} Hidaka</p>
      </footer>

      <a className="float-cta" href={LINE_URL} target="_blank" rel="noreferrer">
        <LineIcon />
        <span>公式LINEで相談する</span>
      </a>
      <div className="mobile-cta">
        <LineButton />
      </div>
    </div>
  );
}
