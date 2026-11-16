// Shared behaviour for the playable case-study shell: sound (off by default), system layer,
// depth-on-demand drawer, tasks + caption, little bursts of delight, chat helpers.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let sound = false, ctx;

  // Embedded in the arcade hub: hide own nav; Esc (when no drawer is open) returns to the lineup.
  const embedded = new URLSearchParams(location.search).has("embed");
  if (embedded) {
    document.documentElement.classList.add("embed");
    document.addEventListener("keydown", (e) => {
      const d = document.getElementById("drawer");
      if (e.key === "Escape" && (!d || d.hidden)) parent.postMessage("arcade:back", "*");
    });
  }

  function tone(f, d = .07, type = "sine", v = .04, delay = 0) {
    if (!sound) return;
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + .02);
    } catch { /* audio unavailable */ }
  }

  const Play = {
    reduce,
    esc: (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]),
    tick: () => tone(1200, .025, "square", .012),
    blip: () => tone(660, .07, "sine", .04),
    pop: () => tone(420, .09, "triangle", .05),
    err: () => tone(160, .18, "sawtooth", .02),
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .14, "triangle", .045, i * .07)),
    burst(el) {
      if (reduce || !el) return;
      const r = el.getBoundingClientRect(), cols = ["var(--orange)", "var(--tint)", "var(--teal)", "var(--lilac)", "var(--pink)", "var(--lime)"];
      for (let i = 0; i < 16; i++) {
        const b = document.createElement("i"), a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
        b.className = "spark" + (i % 3 === 0 ? " sq" : i % 3 === 1 ? " tri" : "");
        b.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${Math.random() * 360}deg;--c:${cols[i % cols.length]}`;
        document.body.appendChild(b); setTimeout(() => b.remove(), 1000);
      }
    },
    _lock: 0,
    say(text, lock = 0) {
      const c = $("#caption"); if (!c) return;
      if (!lock && Date.now() < Play._lock) return;
      const s = c.querySelector("span"); if (s.textContent === text) return;
      s.textContent = text; c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash");
      if (lock) Play._lock = Date.now() + lock;
    },
    done: new Set(),
    complete(id, insight) {
      if (Play.done.has(id)) return false;
      Play.done.add(id);
      const li = $(`[data-task="${id}"]`); li?.classList.add("done");
      const total = $$("[data-task]").length, cnt = $("#taskCount");
      if (cnt) cnt.textContent = `${Play.done.size} / ${total} found`;
      if (insight) Play.say(insight, 5000);
      Play.win(); Play.burst(li);
      return true;
    },
    chat(log) {
      return {
        add(who, html) {
          const m = document.createElement("div"); m.className = `msg ${who}`; m.innerHTML = html;
          log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
        },
        async typing(ms = 650) {
          const t = document.createElement("div"); t.className = "msg bot typing"; t.setAttribute("aria-hidden", "true"); t.innerHTML = "<i></i><i></i><i></i>";
          log.appendChild(t); log.scrollTop = log.scrollHeight;
          await new Promise((r) => setTimeout(r, reduce ? 0 : ms)); t.remove();
        },
      };
    },
  };
  window.Play = Play;

  $("#soundBtn")?.addEventListener("click", (e) => {
    sound = !sound; const b = e.currentTarget;
    b.setAttribute("aria-pressed", sound); b.querySelector("span:last-child").textContent = sound ? "Sound on" : "Sound off"; b.querySelector(".ico").textContent = sound ? "🔊" : "🔈";
    Play.blip();
  });
  $("#systemBtn")?.addEventListener("click", (e) => {
    const on = document.body.classList.toggle("is-system");
    e.currentTarget.setAttribute("aria-pressed", on); Play.pop();
    document.dispatchEvent(new CustomEvent("system", { detail: on }));
  });

  const drawer = $("#drawer"), scrim = $("#scrim"); let last;
  const open = () => { last = document.activeElement; drawer.hidden = false; requestAnimationFrame(() => { drawer.classList.add("open"); scrim.classList.add("open"); }); $("#drawerClose").focus(); Play.blip(); };
  const close = () => { drawer.classList.remove("open"); scrim.classList.remove("open"); setTimeout(() => { drawer.hidden = true; }, reduce ? 0 : 450); last?.focus(); };
  $("#depthBtn")?.addEventListener("click", open);
  $("#drawerClose")?.addEventListener("click", close);
  scrim?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (!drawer || drawer.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = $$("button, a, [tabindex='0']", drawer).filter((x) => !x.closest("[hidden]"));
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  const tabs = $$("[role=tab]");
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
    Play.tick();
  }));
  $("[role=tablist]")?.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = tabs[(tabs.indexOf(document.activeElement) + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });
})();
