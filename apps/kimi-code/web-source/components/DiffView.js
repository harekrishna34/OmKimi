    __name: "DiffView",
    props: {
      changes: {},
      gitInfo: {},
      fileDiff: {},
      fullTexts: {},
      emptyFile: { type: Boolean },
      selectedDiffPath: {},
      fileDiffLoading: { type: Boolean },
      mode: { default: "full" },
      hideBack: { type: Boolean, default: !1 },
      closable: { type: Boolean, default: !0 },
    },
    emits: ["open", "back", "close"],
    setup(e, { emit: t }) {
      const { t: n } = Lt();
      function o(L) {
        return n(L === 1 ? "diff.fileCountOne" : "diff.fileCountOther", {
          number: L,
        });
      }
      const s = e,
        i = t;
      function r(L) {
        const B = L.toLowerCase();
        return B === "modified"
          ? "modified"
          : B === "added"
            ? "added"
            : B === "deleted"
              ? "deleted"
              : B === "renamed"
                ? "renamed"
                : B === "untracked"
                  ? "untracked"
                  : B === "conflicted"
                    ? "conflicted"
                    : B === "ignored"
                      ? "ignored"
                      : B === "clean"
                        ? "clean"
                        : "unknown";
      }
      const l = {
        modified: "M",
        added: "+",
        deleted: "−",
        renamed: "→",
        untracked: "+",
        conflicted: "C",
        ignored: "I",
        clean: "·",
        unknown: "?",
      };
      function a(L) {
        return l[r(L)] ?? "?";
      }
      function u(L, B = 60) {
        return L.length <= B ? L : "…" + L.slice(L.length - B + 1);
      }
      const c = R(() => s.gitInfo !== null),
        d = R(() => s.changes.length > 0),
        f = R(() => (s.selectedDiffPath ?? null) !== null),
        h = R(() => s.mode === "detail" || (s.mode === "full" && f.value)),
        g = R(() => s.fileDiff ?? []),
        m = R(() => s.fileDiffLoading === !0);
      function w(L) {
        i("open", L);
      }
      function _() {
        i("back");
      }
      function v() {
        i("close");
      }
      const k = Z("list");
      function y(L) {
        k.value = L;
      }
      function x(L) {
        const B = { children: [] },
          H = [...L].sort((O, F) => O.path.localeCompare(F.path));
        for (const O of H) {
          const F = O.path.endsWith("/"),
            W = O.path.split("/").filter(Boolean);
          if (W.length === 0) continue;
          let z = B;
          for (let U = 0; U < W.length; U++) {
            const q = W[U],
              K = U === W.length - 1 && !F,
              ie = W.slice(0, U + 1).join("/");
            let ne = z.children.find(
              (Y) => Y.name === q && Y.kind === (K ? "file" : "folder"),
            );
            (ne ||
              ((ne = {
                name: q,
                path: ie,
                kind: K ? "file" : "folder",
                status: K ? O.status : void 0,
                children: [],
              }),
              z.children.push(ne)),
              (z = ne));
          }
        }
        return B.children;
      }
      const M = R(() => x(s.changes)),
        $ = Z(new Set());
      function S(L) {
        return !$.value.has(L);
      }
      const I = R(() => {
        const L = [];
        function B(H, O) {
          for (const F of H)
            (L.push({ node: F, depth: O }),
              F.kind === "folder" && S(F.path) && B(F.children, O + 1));
        }
        return (B(M.value, 0), L);
      });
      function P(L) {
        const B = new Set($.value);
        (B.has(L.path) ? B.delete(L.path) : B.add(L.path), ($.value = B));
      }
      function D(L) {
        return `calc(var(--tree-base-indent) + ${L} * var(--tree-indent-step))`;
      }
      function T(L) {
        return { paddingLeft: D(L), "--tree-depth": String(L) };
      }
      return (L, B) => (
        b(),
        A("div", z$e, [
          h.value
            ? (b(),
              A(
                Pe,
                { key: 0 },
                [
                  V(
                    p(fc),
                    {
                      title: p(n)("diff.title"),
                      closable: e.closable,
                      "close-label": p(n)("diff.close"),
                      onClose: v,
                    },
                    {
                      default: ke(() => [
                        V(
                          p(Pn),
                          { text: e.selectedDiffPath ?? "" },
                          {
                            default: ke(() => [
                              C(
                                "span",
                                W$e,
                                N(u(e.selectedDiffPath ?? "", 50)),
                                1,
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["text"],
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["title", "closable", "close-label"],
                  ),
                  C("div", U$e, [
                    e.hideBack
                      ? te("", !0)
                      : (b(),
                        me(
                          p(Ft),
                          { key: 0, variant: "ghost", size: "sm", onClick: _ },
                          {
                            default: ke(() => [
                              V(p(Ie), { name: "arrow-left", size: "sm" }),
                              C("span", j$e, N(p(n)("diff.back")), 1),
                            ]),
                            _: 1,
                          },
                        )),
                  ]),
                  V(
                    as,
                    { name: "diff-content", mode: "out-in" },
                    {
                      default: ke(() => [
                        m.value
                          ? (b(),
                            A("div", V$e, [
                              V(p(Ao), { size: "md" }),
                              C("span", null, N(p(n)("diff.loading")), 1),
                            ]))
                          : g.value.length > 0
                            ? (b(),
                              A("div", q$e, [
                                V(
                                  Ur,
                                  {
                                    lines: g.value,
                                    path: e.selectedDiffPath ?? void 0,
                                    "line-numbers": "",
                                    framed: !1,
                                    "full-texts": e.fullTexts ?? null,
                                  },
                                  null,
                                  8,
                                  ["lines", "path", "full-texts"],
                                ),
                              ]))
                            : (b(),
                              A(
                                "div",
                                K$e,
                                N(
                                  e.emptyFile
                                    ? p(n)("diff.emptyFile")
                                    : p(n)("diff.noDiff"),
                                ),
                                1,
                              )),
                      ]),
                      _: 1,
                    },
                  ),
                ],
                64,
              ))
            : (b(),
              A(
                Pe,
                { key: 1 },
                [
                  V(
                    p(fc),
                    {
                      title: p(n)("diff.title"),
                      closable: e.closable,
                      "close-label": p(n)("diff.close"),
                      onClose: v,
                    },
                    {
                      default: ke(() => [
                        C("span", Z$e, N(o(e.changes.length)), 1),
                        V(
                          p(bi),
                          {
                            "model-value": k.value,
                            size: "sm",
                            options: [
                              {
                                value: "list",
                                label: p(n)("diff.list"),
                                icon: "list",
                              },
                              {
                                value: "tree",
                                label: p(n)("diff.tree"),
                                icon: "tree-view",
                              },
                            ],
                            "onUpdate:modelValue": y,
                          },
                          null,
                          8,
                          ["model-value", "options"],
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["title", "closable", "close-label"],
                  ),
                  C("div", G$e, [
                    c.value
                      ? (b(),
                        A(
                          Pe,
                          { key: 0 },
                          [
                            C("span", Y$e, [
                              V(p(Ie), {
                                class: "br-icon",
                                name: "git-fork",
                                size: "sm",
                              }),
                              C("span", X$e, N(p(n)("diff.branch")), 1),
                            ]),
                            C("span", J$e, N(e.gitInfo.branch), 1),
                            e.gitInfo.ahead > 0 || e.gitInfo.behind > 0
                              ? (b(),
                                A("span", Q$e, [
                                  V(
                                    p(Pn),
                                    { text: p(n)("diff.aheadTitle") },
                                    {
                                      default: ke(() => [
                                        e.gitInfo.ahead > 0
                                          ? (b(),
                                            A(
                                              "span",
                                              eNe,
                                              "↑" + N(e.gitInfo.ahead),
                                              1,
                                            ))
                                          : te("", !0),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["text"],
                                  ),
                                  V(
                                    p(Pn),
                                    { text: p(n)("diff.behindTitle") },
                                    {
                                      default: ke(() => [
                                        e.gitInfo.behind > 0
                                          ? (b(),
                                            A(
                                              "span",
                                              tNe,
                                              "↓" + N(e.gitInfo.behind),
                                              1,
                                            ))
                                          : te("", !0),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["text"],
                                  ),
                                ]))
                              : te("", !0),
                          ],
                          64,
                        ))
                      : (b(), A("span", nNe, N(p(n)("diff.empty")), 1)),
                  ]),
                  d.value && k.value === "list"
                    ? (b(),
                      me(
                        p(Ok),
                        { key: 0, class: "ch-list" },
                        {
                          default: ke(() => [
                            C("div", oNe, [
                              (b(!0),
                              A(
                                Pe,
                                null,
                                pt(
                                  e.changes,
                                  (H) => (
                                    b(),
                                    me(
                                      p(Pn),
                                      { key: H.path, text: H.path },
                                      {
                                        default: ke(() => [
                                          C(
                                            "button",
                                            {
                                              type: "button",
                                              class: "ch-row",
                                              onClick: (O) => w(H.path),
                                            },
                                            [
                                              C(
                                                "span",
                                                {
                                                  class: Re([
                                                    "badge",
                                                    r(H.status),
                                                  ]),
                                                },
                                                N(a(H.status)),
                                                3,
                                              ),
                                              C("span", iNe, N(u(H.path)), 1),
                                            ],
                                            8,
                                            sNe,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["text"],
                                    )
                                  ),
                                ),
                                128,
                              )),
                            ]),
                          ]),
                          _: 1,
                        },
                      ))
                    : d.value && k.value === "tree"
                      ? (b(),
                        me(
                          p(Ok),
                          { key: 1, class: "ch-list ch-tree" },
                          {
                            default: ke(() => [
                              V(
                                ZA,
                                {
                                  name: "tree-collapse",
                                  tag: "ul",
                                  class: "tree-list ch-list-content",
                                },
                                {
                                  default: ke(() => [
                                    (b(!0),
                                    A(
                                      Pe,
                                      null,
                                      pt(
                                        I.value,
                                        ({ node: H, depth: O }) => (
                                          b(),
                                          A(
                                            "li",
                                            { key: H.path, class: "tree-node" },
                                            [
                                              H.kind === "folder"
                                                ? (b(),
                                                  A(
                                                    "button",
                                                    {
                                                      key: 0,
                                                      type: "button",
                                                      class:
                                                        "tree-row tree-folder",
                                                      style: Gt(T(O)),
                                                      onClick: (F) => P(H),
                                                    },
                                                    [
                                                      V(p(Ie), {
                                                        class: "tree-icon",
                                                        name: "folder-solid",
                                                        size: "sm",
                                                      }),
                                                      C(
                                                        "span",
                                                        lNe,
                                                        N(H.name),
                                                        1,
                                                      ),
                                                    ],
                                                    12,
                                                    rNe,
                                                  ))
                                                : (b(),
                                                  me(
                                                    p(Pn),
                                                    { key: 1, text: H.path },
                                                    {
                                                      default: ke(() => [
                                                        C(
                                                          "button",
                                                          {
                                                            type: "button",
                                                            class:
                                                              "tree-row tree-file",
                                                            style: Gt(T(O)),
                                                            onClick: (F) =>
                                                              w(H.path),
                                                          },
                                                          [
                                                            C(
                                                              "span",
                                                              {
                                                                class: Re([
                                                                  "badge",
                                                                  r(H.status),
                                                                ]),
                                                              },
                                                              N(a(H.status)),
                                                              3,
                                                            ),
                                                            C(
                                                              "span",
                                                              uNe,
                                                              N(H.name),
                                                              1,
                                                            ),
                                                          ],
                                                          12,
                                                          aNe,
                                                        ),
                                                      ]),
                                                      _: 2,
                                                    },
                                                    1032,
                                                    ["text"],
                                                  )),
                                            ],
                                          )
                                        ),
                                      ),
                                      128,
                                    )),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                        ))
                      : c.value
                        ? (b(),
                          A("div", cNe, [
                            C("span", dNe, [
                              V(p(Ie), { name: "check", size: "lg" }),
                            ]),
                            Ve(" " + N(p(n)("diff.clean")), 1),
                          ]))
                        : (b(), A("div", fNe, N(p(n)("diff.empty")), 1)),
                ],
                64,
              )),
        ])
      );
    },
  }),
  hNe = ht(pNe, [["__scopeId", "data-v-e1daffaf"]]),
  mNe = { class: "td" },
  gNe = { class: "td-path" },
  vNe = { class: "td-body" },
  yNe = { key: 1, class: "td-empty" },
  kNe = tt({
