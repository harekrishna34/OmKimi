    __name: "Markdown",
    props: {
      text: {},
      openFile: {},
      streaming: { type: Boolean, default: !1 },
    },
    setup(e) {
      (cle(), _le(), fle(), Ale(), dle(new mde()), Sle(new gde()));
      const { t } = vf(),
        n = on("resolveImage"),
        o = Z(null),
        s = e,
        i = R(() => !s.streaming),
        r = R(() => Dce(s.text ?? "")),
        l = R(() =>
          s.streaming
            ? { codeRenderer: "shiki", codeFenceCount: 0, codeChars: 0 }
            : ode(s.text ?? ""),
        ),
        a = p2(),
        u = R(() => !s.streaming),
        c = Jo(new Map()),
        d = new Set(),
        f = /(!\[[^\]]*\]\()\s*([^)\s]+)([^)]*\))/g,
        h = /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi;
      function g(F) {
        return !/^(https?:|data:|blob:)/i.test(F);
      }
      function m(F) {
        if (!n) return;
        const W = [];
        for (const z of [f, h]) {
          z.lastIndex = 0;
          let U;
          for (; (U = z.exec(F)) !== null;) W.push(U[2] ?? "");
        }
        for (const z of W)
          !z ||
            !g(z) ||
            c.has(z) ||
            d.has(z) ||
            (d.add(z),
            n(z)
              .then((U) => {
                c.set(z, U !== z ? U : "");
              })
              .catch(() => {
                c.set(z, "");
              })
              .finally(() => {
                d.delete(z);
              }));
      }
      function w(F) {
        if (!n) return F;
        const W = (z) => {
          if (!g(z)) return null;
          const U = c.get(z);
          return U === void 0 ? _de : U === "" ? null : U;
        };
        return F.replace(f, (z, U, q, K) => {
          const ie = W(q);
          return ie === null ? z : `${U}${ie}${K}`;
        }).replace(h, (z, U, q, K) => {
          const ie = W(q);
          return ie === null ? z : `${U}${ie}${K}`;
        });
      }
      et(
        () => s.text,
        (F) => m(F ?? ""),
        { immediate: !0 },
      );
      function _() {
        if (!o.value || !s.openFile || s.streaming) return;
        const F = document.createTreeWalker(o.value, NodeFilter.SHOW_TEXT),
          W = [];
        let z = F.nextNode();
        for (; z;) {
          const U = z,
            q = U.parentElement;
          (q &&
            !q.closest("a, pre, .md-file-link, svg") &&
            U.data.trim().length > 0 &&
            W.push(U),
            (z = F.nextNode()));
        }
        for (const U of W) {
          const q = Hce(U.data, { aliases: r.value });
          if (q.length === 0 || !U.parentNode) continue;
          const K = document.createDocumentFragment();
          let ie = 0;
          for (const ne of q) {
            ne.start > ie &&
              K.append(document.createTextNode(U.data.slice(ie, ne.start)));
            const Y = document.createElement("button");
            ((Y.type = "button"),
              (Y.className = "md-file-link"),
              (Y.textContent = ne.text),
              (Y.title = ne.line ? `${ne.path}:${ne.line}` : ne.path),
              Y.addEventListener("click", (le) => {
                (le.preventDefault(),
                  le.stopPropagation(),
                  s.openFile?.({ path: ne.path, line: ne.line }));
              }),
              K.append(Y),
              (ie = ne.end));
          }
          (ie < U.data.length &&
            K.append(document.createTextNode(U.data.slice(ie))),
            U.parentNode.replaceChild(K, U));
        }
      }
      function v(F) {
        return !(!F || /^(https?:|mailto:|tel:|data:|blob:|#)/i.test(F));
      }
      function k(F) {
        let W = F.length;
        for (const z of ["#", "?"]) {
          const U = F.indexOf(z);
          U !== -1 && U < W && (W = U);
        }
        return F.slice(0, W);
      }
      function y() {
        if (!o.value || !s.openFile || s.streaming) return;
        const F = o.value.querySelectorAll("a[href]");
        for (const W of F) {
          if (W.dataset.mdLinkHandled === "true" || W.closest("svg")) continue;
          const z = W.getAttribute("href") ?? "";
          v(z) &&
            ((W.dataset.mdLinkHandled = "true"),
            W.addEventListener("click", (U) => {
              (U.preventDefault(),
                U.stopPropagation(),
                s.openFile?.({ path: k(z) }));
            }));
        }
      }
      function x() {
        return {
          widen: t("conversation.widenTable"),
          restore: t("conversation.restoreTableWidth"),
        };
      }
      function M() {
        if (!o.value || s.streaming) return;
        const F = x();
        for (const W of o.value.querySelectorAll(".table-node-wrapper"))
          pde(W, F);
      }
      function $() {
        if (!(!o.value || s.streaming))
          for (const F of o.value.querySelectorAll(".table-node-wrapper"))
            S5(F);
      }
      function S() {
        yt().then(() => {
          (_(), y(), M());
        });
      }
      (et(() => s.text, S), et(() => s.streaming, S));
      let I = null,
        P = null;
      (dn(() => {
        (S(),
          o.value &&
            ((I = new MutationObserver(S)),
            I.observe(o.value, { childList: !0, subtree: !0 }),
            (P = new ResizeObserver($)),
            P.observe(o.value)));
      }),
        kn(() => {
          (I?.disconnect(), P?.disconnect());
        }));
      const D = {
          showHeader: !0,
          showCopyButton: !0,
          showExpandButton: !1,
          showPreviewButton: !1,
          showCollapseButton: !1,
          showFontSizeButtons: !1,
          loading: !1,
          monacoOptions: {
            lineNumbers: !1,
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            padding: { top: 12, bottom: 12 },
          },
        },
        T =
          /(^|\n)(?:```|~~~)diff\b[^\n]*\n([\s\S]*?)(?:\n)?(?:```|~~~)(?=\n|$)/g,
        L = R(() => {
          const F = w(s.text ?? ""),
            W = [];
          let z = 0;
          T.lastIndex = 0;
          let U;
          for (; (U = T.exec(F)) !== null;) {
            const K = U[1] ?? "",
              ie = F.slice(z, U.index) + (K || "");
            (ie.trim() && W.push({ kind: "md", text: ie }),
              W.push({ kind: "diff", code: U[2] ?? "" }),
              (z = T.lastIndex));
          }
          const q = F.slice(z);
          return (
            (q.trim() || W.length === 0) && W.push({ kind: "md", text: q }),
            W
          );
        });
      function B(F) {
        return F.split(
          `
`,
        ).map((W) =>
          W.startsWith("@@")
            ? { type: "hunk", sign: "", text: W }
            : /^\+(?!\+\+)/.test(W)
              ? { type: "add", sign: "+", text: W.slice(1) }
              : /^-(?!--)/.test(W)
                ? { type: "del", sign: "-", text: W.slice(1) }
                : W.startsWith(" ")
                  ? { type: "ctx", sign: "", text: W.slice(1) }
                  : { type: "ctx", sign: "", text: W },
        );
      }
      const H = Z(null);
      function O(F, W) {
        n$(F).then((z) => {
          z &&
            ((H.value = W),
            setTimeout(() => {
              H.value = null;
            }, 1400));
        });
      }
      return (F, W) => (
        b(),
        A(
          "div",
          { ref_key: "mdRef", ref: o, class: "md" },
          [
            (b(!0),
            A(
              Pe,
              null,
              pt(
                L.value,
                (z, U) => (
                  b(),
                  A(
                    Pe,
                    { key: U },
                    [
                      z.kind === "md"
                        ? (b(),
                          me(
                            p(Ui),
                            {
                              key: 0,
                              content: z.text,
                              "custom-markdown-it": p(Jce),
                              mode: "chat",
                              "code-renderer": l.value.codeRenderer,
                              "is-dark": p(a),
                              "code-block-light-theme": V_,
                              "code-block-dark-theme": q_,
                              themes: [V_, q_],
                              "code-block-props": D,
                              final: i.value,
                              "smooth-streaming": e.streaming,
                              "batch-rendering": u.value,
                              "defer-nodes-until-visible": !1,
                              onCopy: p(sde),
                            },
                            null,
                            8,
                            [
                              "content",
                              "custom-markdown-it",
                              "code-renderer",
                              "is-dark",
                              "themes",
                              "final",
                              "smooth-streaming",
                              "batch-rendering",
                              "onCopy",
                            ],
                          ))
                        : (b(),
                          A("div", vde, [
                            C("div", yde, [
                              W[0] ||
                                (W[0] = C(
                                  "span",
                                  { class: "diff-lang" },
                                  "diff",
                                  -1,
                                )),
                              V(
                                p(Pn),
                                { text: p(t)("filePreview.copyCode") },
                                {
                                  default: ke(() => [
                                    C(
                                      "button",
                                      {
                                        class: "diff-copy",
                                        "aria-label": p(t)(
                                          "filePreview.copyCode",
                                        ),
                                        onClick: (q) => O(z.code, U),
                                      },
                                      [
                                        V(
                                          p(Ie),
                                          {
                                            name:
                                              H.value === U ? "check" : "copy",
                                            size: "sm",
                                          },
                                          null,
                                          8,
                                          ["name"],
                                        ),
                                      ],
                                      8,
                                      kde,
                                    ),
                                  ]),
                                  _: 2,
                                },
                                1032,
                                ["text"],
                              ),
                            ]),
                            C("pre", bde, [
                              C("code", null, [
                                (b(!0),
                                A(
                                  Pe,
                                  null,
                                  pt(
                                    B(z.code),
                                    (q, K) => (
                                      b(),
                                      A(
                                        "span",
                                        {
                                          key: K,
                                          class: Re([
                                            "diff-line",
                                            `diff-${q.type}`,
                                          ]),
                                        },
                                        [
                                          q.type !== "hunk"
                                            ? (b(),
                                              A("span", Cde, N(q.sign), 1))
                                            : te("", !0),
                                          C("span", wde, N(q.text), 1),
                                        ],
                                        2,
                                      )
                                    ),
                                  ),
                                  128,
                                )),
                              ]),
                            ]),
                          ])),
                    ],
                    64,
                  )
                ),
              ),
              128,
            )),
          ],
          512,
        )
      );
    },
  }),
  Ic = ht(xde, [["__scopeId", "data-v-2ec518c1"]]),
  Sde = { state: "idle" };
function Ade(e) {
  const t = Z(Sde),
    n = Z(li(cn.updateSkippedVersion)),
    o = Z(!1);
  if (
    (typeof e?.getUpdateAutoDownload == "function" &&
      e
        .getUpdateAutoDownload()
        .then((i) => {
          o.value = i;
        })
        .catch(() => {}),
    e !== void 0)
  ) {
    let i = !1;
    (e.onUpdateStatus((r) => {
      ((i = !0), (t.value = r));
    }),
      e
        .getUpdateStatus()
        .then((r) => {
          i || (t.value = r);
        })
        .catch(() => {}));
  }
  const s = R(() => {
    const i = t.value;
    return !(
      i.state === "idle" ||
      (i.state === "available" && i.version !== void 0 && i.version === n.value)
    );
  });
  return {
    status: t,
    visible: s,
    canCheck: typeof e?.checkForUpdates == "function",
    autoDownload: o,
    canToggleAutoDownload:
      typeof e?.getUpdateAutoDownload == "function" &&
      typeof e?.setUpdateAutoDownload == "function",
    setAutoDownload: (i) => {
      ((o.value = i), e?.setUpdateAutoDownload?.(i).catch(() => {}));
    },
    skipVersion: () => {
      const i = t.value.version;
      t.value.state === "available" &&
        i !== void 0 &&
        ((n.value = i), Ls(cn.updateSkippedVersion, i));
    },
    check: async () => {
      if (typeof e?.checkForUpdates != "function")
        return Promise.resolve({ outcome: "unsupported" });
      const i = await e
        .checkForUpdates()
        .catch(() => ({ outcome: "error", message: "bridge call failed" }));
      return (
        i.outcome === "available" &&
          i.version !== void 0 &&
          i.version === n.value &&
          ((n.value = null), lr(cn.updateSkippedVersion)),
        i
      );
    },
    download: () => {
      e?.downloadUpdate().catch(() => {});
    },
    install: () => {
      e?.installUpdate().catch(() => {});
    },
  };
}
let a4 = null;
function u$() {
  return (a4 === null && (a4 = Ade(window.kimiDesktop)), a4);
}
const Mde = ["data-state"],
  Tde = ["aria-label"],
  Ede = { class: "upd-pill-text" },
  Ide = { key: 0, class: "upd-meta" },
  Lde = { key: 1, class: "upd-notes" },
  $de = { class: "upd-notes-title" },
  Nde = { key: 2, class: "upd-progress" },
  Fde = { key: 3, class: "upd-message" },
  Rde = { class: "upd-foot" },
  Ode = { class: "upd-foot-actions" },
  Pde = tt({
