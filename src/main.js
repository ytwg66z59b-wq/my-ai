import "./styles/tokens.css";
import "./styles/main.css";
import * as C from "./content.js";

function nl(text) {
  return String(text).replace(/\n/g, "<br />");
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <a class="skip" href="#main">本文へスキップ</a>
    <header class="site-header" data-header>
      <div class="site-header__inner">
        <a class="logo" href="#top" aria-label="${C.site.brand.name}">
          <span class="logo__mark" aria-hidden="true"></span>
          <span class="logo__text">${C.site.brand.logo}</span>
        </a>
        <nav class="nav" data-nav aria-label="メインナビ">
          ${C.site.nav
            .map((item) => `<a href="${item.href}">${item.label}</a>`)
            .join("")}
          <a class="btn btn--sm btn--solid" href="${C.site.cta.href}">${C.site.cta.label}</a>
        </nav>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="メニュー">
          <span></span><span></span>
        </button>
      </div>
      <div class="mobile-nav" id="mobile-nav" data-mobile-nav hidden>
        ${C.site.nav
          .map((item) => `<a href="${item.href}">${item.label}</a>`)
          .join("")}
        <a class="btn btn--solid" href="${C.site.cta.href}">${C.site.cta.label}</a>
      </div>
    </header>

    <main id="main">
      <section class="hero" id="top">
        <div class="hero__atmosphere" aria-hidden="true">
          <div class="hero__orb hero__orb--a"></div>
          <div class="hero__orb hero__orb--b"></div>
          <div class="hero__grid"></div>
          <div class="hero__frame"></div>
        </div>
        <div class="hero__content">
          <p class="hero__brand reveal" data-reveal>${C.hero.brand}</p>
          <h1 class="hero__title reveal" data-reveal>${nl(C.hero.title)}</h1>
          <p class="hero__lead reveal" data-reveal>${C.hero.lead}</p>
          <p class="hero__desc reveal" data-reveal>${C.hero.description}</p>
          <div class="hero__actions reveal" data-reveal>
            <a class="btn btn--solid btn--lg" href="${C.hero.primary.href}">${C.hero.primary.label}</a>
            <a class="btn btn--ghost btn--lg" href="${C.hero.secondary.href}">${C.hero.secondary.label}</a>
          </div>
        </div>
        <a class="hero__scroll" href="#pain" aria-label="次のセクションへ">
          <span>Scroll</span>
        </a>
      </section>

      <section class="section section--pain" id="${C.pain.id}">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.pain.eyebrow}</p>
            <h2>${C.pain.title}</h2>
          </header>
          <div class="pain-grid">
            ${C.pain.cases
              .map(
                (item) => `
              <article class="pain-card reveal" data-reveal>
                <p class="pain-card__label">${item.label}</p>
                <p class="pain-card__context">${item.context}</p>
                <p class="pain-card__quote">「${item.quote}」</p>
                <p class="pain-card__person">${item.person}</p>
              </article>`
              )
              .join("")}
          </div>
          <p class="pain-insight reveal" data-reveal>${C.pain.insight}</p>
        </div>
      </section>

      <section class="section section--insight">
        <div class="container narrow reveal" data-reveal>
          <h2 class="insight__title">${nl(C.insight.title)}</h2>
          <p class="insight__body">${C.insight.body}</p>
        </div>
      </section>

      <section class="section section--service" id="${C.service.id}">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.service.eyebrow}</p>
            <h2>${nl(C.service.title)}</h2>
            <p class="section__lead">${C.service.body}</p>
          </header>

          <div class="compare reveal" data-reveal>
            <h3 class="compare__title">${nl(C.compare.title)}</h3>
            <div class="compare__grid">
              <div class="compare__col compare__col--off">
                <p class="compare__label">${C.compare.without.label}</p>
                <ul>
                  ${C.compare.without.items.map((t) => `<li>${t}</li>`).join("")}
                </ul>
              </div>
              <div class="compare__col compare__col--on">
                <p class="compare__label">${C.compare.withVideo.label}</p>
                <ul>
                  ${C.compare.withVideo.items.map((t) => `<li>${t}</li>`).join("")}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--reasons">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.reasons.eyebrow}</p>
            <h2>${nl(C.reasons.title)}</h2>
            <p class="section__lead">${C.reasons.lead}</p>
          </header>
          <div class="reason-list">
            ${C.reasons.items
              .map(
                (item, i) => `
              <article class="reason reveal" data-reveal>
                <span class="reason__num">0${i + 1}</span>
                <div>
                  <h3>${item.title}</h3>
                  <p>${item.body}</p>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="cta-band reveal" data-reveal>
        <div class="container cta-band__inner">
          <p class="badge">${C.midCta.badge}</p>
          <h2>${nl(C.midCta.title)}</h2>
          <p>${C.midCta.body}</p>
          <p class="cta-band__note">${C.midCta.note}</p>
          <a class="btn btn--solid btn--lg" href="${C.midCta.cta.href}">${C.midCta.cta.label}</a>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.usages.eyebrow}</p>
            <h2>${nl(C.usages.title)}</h2>
          </header>
          <div class="usage-grid">
            ${C.usages.items
              .map(
                (item) => `
              <article class="usage reveal" data-reveal>
                <h3>${item.title}</h3>
                <p class="usage__sub">${item.subtitle}</p>
                <p>${item.body}</p>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section--funnel">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.funnel.eyebrow}</p>
            <h2>${C.funnel.title}</h2>
          </header>
          <ol class="funnel">
            ${C.funnel.steps
              .map(
                (step) => `
              <li class="funnel__step reveal" data-reveal>
                <span class="funnel__num">${step.num}</span>
                <h3>${step.title}</h3>
                <ul>${step.items.map((t) => `<li>${t}</li>`).join("")}</ul>
              </li>`
              )
              .join("")}
          </ol>
        </div>
      </section>

      <section class="section" id="${C.works.id}">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.works.eyebrow}</p>
            <h2>${C.works.title}</h2>
          </header>
          ${C.works.items
            .map(
              (work) => `
            <article class="work reveal" data-reveal>
              <div class="work__media" aria-hidden="true">
                <div class="work__poster">
                  <span class="work__play"></span>
                  <p>${work.product}</p>
                </div>
              </div>
              <div class="work__body">
                <p class="work__client">${work.client}</p>
                <h3>${work.product}</h3>
                <p>${work.summary}</p>
                <div class="work__details">
                  ${work.details
                    .map(
                      (d) => `
                    <details>
                      <summary>${d.q}</summary>
                      <p>${d.a}</p>
                    </details>`
                    )
                    .join("")}
                </div>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section section--design">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.design.eyebrow}</p>
            <h2>${nl(C.design.title)}</h2>
            <p class="section__lead">${C.design.lead}</p>
          </header>
          <ul class="design-points">
            ${C.design.points
              .map((p) => `<li class="reveal" data-reveal>${p}</li>`)
              .join("")}
          </ul>
          <p class="design-close reveal" data-reveal>${C.design.close}</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.support.eyebrow}</p>
            <h2>${nl(C.support.title)}</h2>
          </header>
          <div class="support-grid">
            ${C.support.items
              .map(
                (item) => `
              <div class="support-item reveal" data-reveal>
                <span>Support ${item.num}</span>
                <strong>${item.title}</strong>
              </div>`
              )
              .join("")}
          </div>
          <p class="support-note reveal" data-reveal>${C.support.note}</p>
          <div class="people">
            ${C.support.people
              .map(
                (p) => `
              <article class="person reveal" data-reveal>
                <div class="person__avatar" aria-hidden="true"></div>
                <p class="person__role">${p.role}</p>
                <h3>${p.name}</h3>
                <p>${p.line}</p>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section--table">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.vsTable.eyebrow}</p>
            <h2>${C.vsTable.title}</h2>
          </header>
          <div class="table-wrap reveal" data-reveal>
            <table>
              <thead>
                <tr>
                  <th scope="col"></th>
                  ${C.vsTable.headers.map((h) => `<th scope="col">${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${C.vsTable.rows
                  .map(
                    (row) => `
                  <tr>
                    <th scope="row">${row[0]}</th>
                    ${row
                      .slice(1)
                      .map((cell, i) => `<td class="${i === 0 ? "is-brand" : ""}">${cell}</td>`)
                      .join("")}
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <p class="table-note reveal" data-reveal>${C.vsTable.note}</p>
        </div>
      </section>

      <section class="section" id="${C.process.id}">
        <div class="container">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.process.eyebrow}</p>
            <h2>${C.process.title}</h2>
          </header>
          <ol class="process">
            ${C.process.steps
              .map(
                (step) => `
              <li class="process__step reveal" data-reveal>
                <span class="process__num">Step ${step.num}</span>
                <h3>${step.title}</h3>
                <p>${step.body}</p>
              </li>`
              )
              .join("")}
          </ol>
        </div>
      </section>

      <section class="section section--faq" id="${C.faq.id}">
        <div class="container narrow">
          <header class="section__head reveal" data-reveal>
            <p class="eyebrow">${C.faq.eyebrow}</p>
            <h2>${C.faq.title}</h2>
          </header>
          <div class="faq-list">
            ${C.faq.items
              .map(
                (item) => `
              <details class="faq reveal" data-reveal>
                <summary>${item.q}</summary>
                <p>${item.a}</p>
              </details>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <section class="section section--contact" id="${C.contact.id}">
        <div class="container contact reveal" data-reveal>
          <p class="badge">${C.contact.badge}</p>
          <h2>${nl(C.contact.title)}</h2>
          <p>${C.contact.body}</p>
          <a class="btn btn--solid btn--lg" href="${C.contact.cta.href}">${C.contact.cta.label}</a>
          <p class="contact__mail"><a href="mailto:${C.contact.mail}">${C.contact.mail}</a></p>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container">
        <a class="logo" href="#top">
          <span class="logo__mark" aria-hidden="true"></span>
          <span class="logo__text">${C.site.brand.logo}</span>
        </a>
        <p>${C.footer.copy}</p>
        <p class="site-footer__note">${C.footer.note}</p>
      </div>
    </footer>
  `;
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobile = document.querySelector("[data-mobile-nav]");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle?.addEventListener("click", () => {
    const open = mobile.hasAttribute("hidden");
    if (open) {
      mobile.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
    } else {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }
  });

  mobile?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function initReveal() {
  const nodes = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((el) => io.observe(el));
}

render();
initHeader();
initReveal();
