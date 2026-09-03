const painPoints = [
  "「良い商品なのに、なかなか売れない」",
  "「会社のことをもっと知ってほしい」",
  "「商品の説明だけでは他社との差が伝わらない」",
  "「SNSをやっているけど商品紹介ばかりになっている」",
  "「仕事への想いをもっと知ってもらいたい」",
  "「価格だけで比較されてしまう」",
];

const videoTypes = [
  { title: "会社紹介", desc: "会社・スタッフ・雰囲気を伝える。" },
  { title: "代表インタビュー", desc: "経営者の想いや考えを伝える。" },
  { title: "スタッフ紹介", desc: "社員一人ひとりの人柄を伝える。" },
  { title: "商品・サービス紹介", desc: "商品だけでなく、背景まで伝える。" },
  { title: "採用動画", desc: "「この会社で働きたい」をつくる。" },
  { title: "SNS動画", desc: "まず会社や人に興味を持ってもらう。" },
];

const processSteps = [
  { num: "01", title: "知る", desc: "あなたの会社・商品・仕事を知る。" },
  { num: "02", title: "話す", desc: "想いやこだわりを聞く。" },
  { num: "03", title: "整理する", desc: "何を伝えるべきかを決める。" },
  { num: "04", title: "構成する", desc: "見た人にどう感じてもらうかを設計。" },
  {
    num: "05",
    title: "撮影する",
    desc: "人・仕事・商品を撮影する際のポイントをお伝えします。（自社でして頂きます。）",
  },
  { num: "06", title: "編集する", desc: "映像・音・言葉を組み合わせる。" },
  { num: "07", title: "届ける", desc: "SNS・Web・LPなどで活用。" },
];

const LINE_URL = "https://lin.ee/XXXXXXX"; // 差し替え用プレースホルダー

export default function App() {
  return (
    <div className="lp">
      {/* ========== 01｜FV ========== */}
      <header className="fv">
        <div className="fv-inner">
          <p className="fv-pre">最初から商品説明をしすぎない。</p>
          <h1 className="fv-h1">
            商品を売る前に、
            <br />
            <em>あなたのことを知ってもらう。</em>
          </h1>
          <p className="fv-sub">
            人柄・想い・仕事へのこだわりまで伝える動画制作。
          </p>
          <p className="fv-body">
            ただ、商品の魅力を並べるだけじゃない。
            <br />
            <strong>「どんな人が、この商品を作っているのか」</strong>
            まで伝える。
          </p>
          <a className="btn btn-line" href={LINE_URL} target="_blank" rel="noreferrer">
            動画制作について相談する
          </a>
        </div>
      </header>

      <main>
        {/* ========== 02｜自己紹介 ========== */}
        <section className="section sec-intro" id="about">
          <div className="inner">
            <div className="intro-grid">
              <div className="intro-photo">
                <div className="photo-placeholder">
                  <span>顔写真</span>
                </div>
                <div className="video-placeholder">
                  <span>▶ 短い自己紹介動画</span>
                </div>
              </div>
              <div className="intro-copy">
                <p className="sec-label">はじめまして</p>
                <h2>
                  動画をつくっている、
                  <br />
                  りょうまです。
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
                  <br />
                  そこにある想いやこだわり。
                </p>
                <p>
                  そういうものまで伝えられるのが、動画だと思っています。
                </p>
                <a className="btn btn-text" href="#story">
                  僕についてもっと見る →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 03｜ストーリー ========== */}
        <section className="section sec-story" id="story">
          <div className="inner inner-narrow">
            <p className="sec-label">なぜ、この仕事を</p>
            <h2>
              どうして僕は、
              <br />
              「人を伝える動画」を
              <br />
              作っているのか。
            </h2>
            <div className="story-video-placeholder">
              <span>▶ 「僕がこの仕事をしている理由」を話す動画</span>
            </div>
            <div className="story-points">
              <p>なぜ動画を始めたのか。</p>
              <p>仕事をしていて何を感じたのか。</p>
              <p>なぜ「人」に注目するようになったのか。</p>
              <p>どんな会社を支援したいのか。</p>
              <p>どんな動画を作りたいのか。</p>
            </div>
          </div>
        </section>

        {/* ========== 04｜課題提起 ========== */}
        <section className="section sec-problem">
          <div className="inner inner-narrow">
            <p className="sec-label">僕が感じていること</p>
            <h2>
              良い商品なのに、
              <br />
              その魅力が伝わっていない会社が
              <br />
              たくさんある。
            </h2>
            <p className="body-text">
              商品の説明はできる。サービスの特徴も説明できる。
              <br />
              でも——
            </p>
            <div className="bubble-group">
              <div className="bubble">「この会社ってどんな会社なんだろう？」</div>
              <div className="bubble">「この人たちは、なんでこの仕事をしているんだろう？」</div>
            </div>
            <p className="body-text accent-text">
              そこまで伝わっていない。
              <br />
              だから僕は、
              <br />
              <strong>「もっと人を見せてもいいんじゃないか」</strong>
              と思っています。
            </p>
          </div>
        </section>

        {/* ========== 05｜お悩み ========== */}
        <section className="section sec-pain">
          <div className="inner">
            <p className="sec-label">こんなお悩みありませんか？</p>
            <h2>こんなこと、感じていませんか？</h2>
            <ul className="pain-list">
              {painPoints.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="pain-close">
              <strong>本当は、もっと伝えたいことがある。</strong>
            </p>
          </div>
        </section>

        {/* ========== 06｜なぜ伝わらないか ========== */}
        <section className="section sec-why-not">
          <div className="inner inner-narrow">
            <p className="sec-label">なぜ伝わらないのか</p>
            <h2>商品のことばかり<br />伝えていませんか？</h2>
            <div className="tag-row">
              <span className="tag">商品の特徴</span>
              <span className="tag">価格</span>
              <span className="tag">機能</span>
              <span className="tag">サービス内容</span>
            </div>
            <p className="body-text">
              もちろん必要です。
              <br />
              でも、それだけでは——
            </p>
            <p className="emphasis">
              「あなたから買う理由」
              <br />
              にはなりません。
            </p>
          </div>
        </section>

        {/* ========== 07｜核心メッセージ ========== */}
        <section className="section sec-core">
          <div className="inner inner-narrow center">
            <p className="sec-label">僕が大切にしている考え方</p>
            <h2 className="core-message">
              商品を売る前に、
              <br />
              <em>人を知ってもらう。</em>
            </h2>
            <ul className="core-list">
              <li>どんな人なのか。</li>
              <li>なぜこの仕事をしているのか。</li>
              <li>何を大切にしているのか。</li>
              <li>どんな想いで商品を作っているのか。</li>
              <li>どんなお客様と向き合っているのか。</li>
            </ul>
            <p className="body-text">それを知ってもらう。</p>
          </div>
        </section>

        {/* ========== 08｜なぜ「人」か ========== */}
        <section className="section sec-flow">
          <div className="inner">
            <p className="sec-label">なぜ「人」なのか</p>
            <h2>
              人を知ってもらうと、
              <br />
              「この人から買いたい」が生まれる。
            </h2>
            <div className="flow-steps">
              {[
                "知らない会社",
                "動画を見る",
                "「こんな人がやってるんだ」",
                "「この考え方、好きだな」",
                "「この会社ちょっと気になる」",
                "「ここから買ってみようかな」",
              ].map((s, i, arr) => (
                <div className="flow-step" key={s}>
                  <span className={i === arr.length - 1 ? "flow-label highlight" : "flow-label"}>{s}</span>
                  {i < arr.length - 1 && <span className="flow-arrow">↓</span>}
                </div>
              ))}
              <div className="flow-step">
                <span className="flow-arrow">↓</span>
              </div>
              <div className="flow-final">
                「この人だからお願いしたい」
              </div>
            </div>
          </div>
        </section>

        {/* ========== 09｜動画だから ========== */}
        <section className="section sec-video-why">
          <div className="inner inner-narrow">
            <p className="sec-label">動画だから伝えられる</p>
            <h2>文章だけでは<br />伝わらないものがあります。</h2>
            <div className="keyword-grid">
              {["顔", "声", "表情", "話し方", "仕草", "仕事をしている姿", "その人が話す言葉"].map((k) => (
                <span className="keyword" key={k}>{k}</span>
              ))}
            </div>
            <p className="body-text">
              これらが合わさることで、
              <br />
              <strong>「どんな人なのか」が伝わる。</strong>
              <br />
              だから僕は、動画を使います。
            </p>
          </div>
        </section>

        {/* ========== 10｜動画で伝えるもの ========== */}
        <section className="section sec-what">
          <div className="inner">
            <p className="sec-label">動画で伝えるもの</p>
            <h2>
              僕が撮りたいのは、
              <br />
              「商品」だけではありません。
            </h2>
            <div className="what-grid">
              {[
                { title: "人柄", desc: "その人らしさ。" },
                { title: "想い", desc: "なぜ、この仕事をしているのか。" },
                { title: "こだわり", desc: "何を大切にして仕事をしているのか。" },
                { title: "ストーリー", desc: "なぜ、この商品・サービスが生まれたのか。" },
                { title: "空気感", desc: "その会社・お店にしかない雰囲気。" },
              ].map((item) => (
                <article className="what-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 11｜動画あり・なし比較 ========== */}
        <section className="section sec-compare">
          <div className="inner">
            <p className="sec-label">動画があると何が変わるのか</p>
            <div className="compare-grid">
              <div className="compare-col compare-before">
                <h3>動画がないと</h3>
                <div className="compare-flow">
                  {[
                    "「どんな会社か分からない」",
                    "商品だけを見る",
                    "価格・条件で比較する",
                    "他社に流れる",
                  ].map((s, i, arr) => (
                    <div key={s}>
                      <p>{s}</p>
                      {i < arr.length - 1 && <span className="cmp-arrow">↓</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="compare-col compare-after">
                <h3>人が伝わる動画があると</h3>
                <div className="compare-flow">
                  {[
                    "「こんな人がやってるんだ」",
                    "「なんか好きだな」",
                    "「もっと知りたい」",
                    "「ここにお願いしたい」",
                  ].map((s, i, arr) => (
                    <div key={s}>
                      <p>{s}</p>
                      {i < arr.length - 1 && <span className="cmp-arrow">↓</span>}
                    </div>
                  ))}
                  <div>
                    <span className="cmp-arrow">↓</span>
                    <p className="compare-final">「またここで買いたい」</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 12｜動画の目的 ========== */}
        <section className="section sec-purpose">
          <div className="inner inner-narrow center">
            <p className="sec-label">動画の目的</p>
            <h2>
              動画の目的は、
              <br />
              「いきなり売ること」ではありません。
            </h2>
            <p className="emphasis">「もっと知りたい」を作ること。</p>
            <div className="funnel">
              {["知る", "興味を持つ", "信頼する", "買う", "ファンになる", "また買う", "誰かに紹介する"].map((s, i, arr) => (
                <div className="funnel-row" key={s}>
                  <span>{s}</span>
                  {i < arr.length - 1 && <span className="funnel-arrow">↓</span>}
                </div>
              ))}
            </div>
            <p className="body-text">この流れを作っていく。</p>
          </div>
        </section>

        {/* ========== 13｜競合差別化 ========== */}
        <section className="section sec-diff">
          <div className="inner inner-narrow">
            <p className="sec-label">僕が作る動画は何が違うのか</p>
            <h2>
              「かっこいい動画」を作るだけなら、
              <br />
              僕じゃなくてもいい。
            </h2>
            <p className="body-text">
              もちろん、映像の綺麗さ。編集のクオリティ。音楽。デザイン。それも大切。
              <br />
              でも僕が一番大切にするのは——
            </p>
            <p className="emphasis">
              「この動画を見た人に、
              <br />
              何を感じてほしいのか。」
            </p>
          </div>
        </section>

        {/* ========== 14｜撮る前を大切に ========== */}
        <section className="section sec-before">
          <div className="inner inner-narrow">
            <p className="sec-label">だから「撮る前」を大切にする</p>
            <h2>
              僕は、撮影する前に
              <br />
              たくさん話を聞きます。
            </h2>
            <ul className="listen-list">
              <li>会社のこと。</li>
              <li>商品について。</li>
              <li>仕事のこと。</li>
              <li>これまでのこと。</li>
              <li>これからのこと。</li>
            </ul>
            <p className="body-text">そして——</p>
            <div className="bubble bubble-alone">
              「なぜ、この仕事をしているんですか？」
            </div>
            <p className="body-text">
              まで聞きたい。
              <br />
              そこで初めて、
              <br />
              <strong>「この会社ならではの動画」</strong>
              が作れると思っています。
            </p>
          </div>
        </section>

        {/* ========== 15｜制作の流れ ========== */}
        <section className="section sec-process" id="process">
          <div className="inner">
            <p className="sec-label">制作の流れ</p>
            <h2>ただ撮影するだけではありません。</h2>
            <div className="process-list">
              {processSteps.map((step, i) => (
                <div className="process-item" key={step.num}>
                  <div className="process-num">{step.num}</div>
                  <div className="process-body">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  {i < processSteps.length - 1 && <div className="process-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 16｜動画の種類 ========== */}
        <section className="section sec-types">
          <div className="inner">
            <p className="sec-label">動画の種類</p>
            <h2>
              伝えたいことに合わせて、
              <br />
              動画の形を考えます。
            </h2>
            <div className="type-grid">
              {videoTypes.map((t) => (
                <article className="type-card" key={t.title}>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 17｜実績 ========== */}
        <section className="section sec-cases" id="cases">
          <div className="inner">
            <p className="sec-label">実績</p>
            <h2>
              「動画を作れる」ではなく、
              <br />
              「動画によって何を変えたのか」を見せる。
            </h2>
            <div className="case-list">
              {[1, 2].map((n) => (
                <article className="case-card" key={n}>
                  <p className="case-step">課題</p>
                  <p className="case-placeholder">（案件の課題・背景をここに記載）</p>
                  <p className="case-step">考え方・構成</p>
                  <p className="case-placeholder">（どんな視点で設計したか）</p>
                  <div className="case-video-placeholder">▶ 動画</div>
                  <p className="case-step">結果</p>
                  <p className="case-placeholder">（どんな変化・反応があったか）</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 18｜作って終わりにしない ========== */}
        <section className="section sec-after">
          <div className="inner inner-narrow">
            <p className="sec-label">動画を作った、その先</p>
            <h2>作って終わりにはしません。</h2>
            <p className="body-text">
              動画は、<strong>作っただけでは誰にも見てもらえません。</strong>
            </p>
            <p className="body-text">だから——</p>
            <div className="question-group">
              <p>「どこで使う？」</p>
              <p>「誰に見てもらう？」</p>
              <p>「どう届ける？」</p>
            </div>
            <p className="body-text">まで考える。</p>
            <div className="usage-list">
              {["SNS", "Webサイト", "LP", "広告", "採用ページ", "営業資料"].map((u) => (
                <span className="tag" key={u}>{u}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ========== 19｜サポート ========== */}
        <section className="section sec-support">
          <div className="inner inner-narrow">
            <p className="sec-label">サポート</p>
            <h2>「動画を作るのが初めて」という方へ。</h2>
            <ul className="support-worries">
              <li>何を話せばいいか分からない。</li>
              <li>何を撮ればいいか分からない。</li>
              <li>緊張してしまう。</li>
              <li>どう使えばいいか分からない。</li>
            </ul>
            <p className="body-text">そんな場合も大丈夫。</p>
            <p className="emphasis">僕が一緒に整理します。</p>
          </div>
        </section>

        {/* ========== 20｜再び「僕」 ========== */}
        <section className="section sec-outro" id="outro">
          <div className="inner inner-narrow">
            <p className="sec-label center-text">ここまで読んでいただいて</p>
            <h2 className="center-text">ありがとうございます。</h2>
            <p className="center-text body-text">最後に、もう一度だけ僕の話をさせてください。</p>
            <div className="outro-video-placeholder">
              <span>▶ りょうまの長めのプロフィール動画</span>
            </div>
            <div className="outro-message">
              <p>
                僕は、動画を納品して終わる関係ではなく、
                「この人に頼んでよかった」と思ってもらえる仕事がしたい。
              </p>
              <p>
                だから、まずはちゃんとあなたのことを知りたい。
                <br />
                会社のこと。商品のこと。そして、あなた自身のこと。
              </p>
              <p>そこから一緒に、「何を伝えるべきか」を考えます。</p>
            </div>
          </div>
        </section>

        {/* ========== 21｜CTA ========== */}
        <section className="section sec-cta" id="cta">
          <div className="inner inner-narrow center">
            <h2 className="cta-headline">
              あなたの会社のこと、
              <br />
              <em>もっと知ってもらいませんか？</em>
            </h2>
            <p className="body-text">
              商品だけではなく、
              <strong> 人柄・想い・仕事へのこだわり。</strong>
              <br />
              あなたの会社にしかない魅力を、動画にします。
            </p>
            <a className="btn btn-line btn-large" href={LINE_URL} target="_blank" rel="noreferrer">
              LINEで相談する
            </a>
            <p className="cta-note">無料でご相談いただけます</p>
          </div>
        </section>

        {/* ========== 22｜+α ========== */}
        <section className="section sec-plus">
          <div className="inner inner-narrow">
            <div className="plus-card">
              <p className="sec-label">＋αのサポート</p>
              <p>
                動画制作に加えて、LP制作・LINE構築までご依頼いただいた場合は、
                <strong>制作後2ヶ月間のWebマーケティングサポート</strong>も行っています。
              </p>
              <p>
                必要な方には、動画を活用した集客・運用まで一緒にサポートします。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} りょうま 動画制作</p>
      </footer>
    </div>
  );
}
