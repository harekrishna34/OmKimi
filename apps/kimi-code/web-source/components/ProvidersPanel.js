    __name: "ProvidersPanel",
    setup(e) {
      const { t } = Lt(),
        n = hu(),
        o = Z(!0),
        s = Z(null),
        i = Z(null);
      let r = 0;
      const l = Z(!1),
        a = Z(!1),
        u = Z(null),
        c = Z("");
      let d = 0;
      const f = R(() =>
        [...n.providers.value].sort((M, $) => M.id.localeCompare($.id)),
      );
      function h(M) {
        return My(M, n.config.value?.models).length;
      }
      (et(s, (M, $) => {
        ($ !== null &&
          $ !== M &&
          ((i.value = $),
          window.clearTimeout(r),
          (r = window.setTimeout(() => {
            i.value = null;
          }, 300))),
          (l.value = !1));
      }),
        et(l, (M) => {
          M || ((a.value = !1), (u.value = null));
        }),
        kn(() => {
          (window.clearTimeout(r), window.clearTimeout(d));
        }));
      const g = Z(!1);
      (et(s, (M) => {
        M === zu
          ? ((g.value = !1),
            yt(() =>
              requestAnimationFrame(() => {
                g.value = !0;
              }),
            ))
          : (g.value = !1);
      }),
        dn(async () => {
          o.value = !0;
          try {
            await Promise.all([
              n.loadProviders(),
              n.loadModels(),
              n.loadConfig(),
            ]);
          } finally {
            o.value = !1;
          }
        }));
      function m(M) {
        const $ = s.value === M ? null : M;
        if (l.value) {
          ((u.value = $), (a.value = !0));
          return;
        }
        s.value = $;
      }
      function w() {
        ((a.value = !1), (u.value = null));
      }
      function _() {
        ((a.value = !1), (s.value = u.value), (u.value = null));
      }
      function v(M) {
        ((c.value = M),
          window.clearTimeout(d),
          (d = window.setTimeout(() => {
            c.value = "";
          }, 1200)));
      }
      function k(M) {
        s.value = M;
      }
      function y(M) {
        ((s.value = M), v(M));
      }
      function x() {
        s.value = null;
      }
      return (M, $) => (
        b(),
        A("section", aRe, [
          C("div", uRe, [
            C("h3", cRe, N(p(t)("settings.tabs.providers")), 1),
            V(
              p(Ft),
              {
                variant: "secondary",
                size: "sm",
                onClick: $[0] || ($[0] = (S) => m(zu)),
              },
              {
                default: ke(() => [
                  V(p(Ie), { name: "plus", size: "sm" }),
                  Ve(" " + N(p(t)("providers.addProvider")), 1),
                ]),
                _: 1,
              },
            ),
          ]),
          o.value
            ? (b(),
              A("div", dRe, [
                V(p(Ao), { size: "sm" }),
                C("span", null, N(p(t)("providers.loading")), 1),
              ]))
            : (b(),
              A("div", fRe, [
                s.value === zu || i.value === zu
                  ? (b(),
                    A(
                      "div",
                      {
                        key: 0,
                        class: Re([
                          "pp-item pp-add-item",
                          { open: s.value === zu && g.value },
                        ]),
                      },
                      [
                        C(
                          "button",
                          {
                            type: "button",
                            class: "pp-row pp-add-row",
                            onClick: $[1] || ($[1] = (S) => m(zu)),
                          },
                          [
                            C("span", pRe, N(p(t)("providers.addProvider")), 1),
                            $[6] ||
                              ($[6] = C("span", { class: "grow" }, null, -1)),
                            C("span", hRe, [
                              V(p(Ie), { name: "chevron-right", size: "sm" }),
                            ]),
                          ],
                        ),
                        C("div", mRe, [
                          C("div", gRe, [
                            V(
                              lRe,
                              {
                                guard: a.value && s.value === zu,
                                onDirtyChange:
                                  $[2] || ($[2] = (S) => (l.value = S)),
                                onGuardStay: w,
                                onGuardDiscard: _,
                                onAdded: y,
                                onCancel:
                                  $[3] || ($[3] = (S) => (s.value = null)),
                              },
                              null,
                              8,
                              ["guard"],
                            ),
                          ]),
                        ]),
                      ],
                      2,
                    ))
                  : te("", !0),
                f.value.length === 0
                  ? (b(), A("div", vRe, N(p(t)("providers.empty")), 1))
                  : te("", !0),
                (b(!0),
                A(
                  Pe,
                  null,
                  pt(
                    f.value,
                    (S) => (
                      b(),
                      A(
                        "div",
                        {
                          key: S.id,
                          class: Re([
                            "pp-item",
                            { open: s.value === S.id, flash: c.value === S.id },
                          ]),
                        },
                        [
                          C(
                            "button",
                            {
                              type: "button",
                              class: "pp-row",
                              onClick: (I) => m(S.id),
                            },
                            [
                              C("div", kRe, [
                                C("span", bRe, N(S.id), 1),
                                V(
                                  p(Vr),
                                  { variant: "neutral", size: "sm" },
                                  {
                                    default: ke(() => [Ve(N(S.type), 1)]),
                                    _: 2,
                                  },
                                  1024,
                                ),
                                p(dF)(S)
                                  ? (b(),
                                    me(
                                      p(Vr),
                                      { key: 0, variant: "info", size: "sm" },
                                      {
                                        default: ke(() => [
                                          Ve(
                                            N(p(t)("providers.managedBadge")),
                                            1,
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                    ))
                                  : te("", !0),
                              ]),
                              C(
                                "span",
                                CRe,
                                N(
                                  p(t)("providers.modelCount", { count: h(S) }),
                                ),
                                1,
                              ),
                              C("span", wRe, [
                                V(p(Ie), { name: "chevron-right", size: "sm" }),
                              ]),
                            ],
                            8,
                            yRe,
                          ),
                          C("div", _Re, [
                            C("div", xRe, [
                              s.value === S.id || i.value === S.id
                                ? (b(),
                                  me(
                                    fF,
                                    {
                                      key: 0,
                                      mode: "edit",
                                      provider: S,
                                      guard: a.value && s.value === S.id,
                                      onDirtyChange:
                                        $[4] || ($[4] = (I) => (l.value = I)),
                                      onGuardStay: w,
                                      onGuardDiscard: _,
                                      onSaved: k,
                                      onDeleting:
                                        $[5] ||
                                        ($[5] = (I) => (s.value = null)),
                                      onDeleted: x,
                                    },
                                    null,
                                    8,
                                    ["provider", "guard"],
                                  ))
                                : te("", !0),
                            ]),
                          ]),
                        ],
                        2,
                      )
                    ),
                  ),
                  128,
                )),
              ])),
        ])
      );
    },
  }),
  ARe = ht(SRe, [["__scopeId", "data-v-2cfb5b3f"]]),
  MRe = { class: "sec" },
  TRe = { class: "sec-title" },
  ERe = { class: "pu-group" },
  IRe = { class: "pu-row" },
  LRe = { class: "pu-main" },
  $Re = { class: "pu-label" },
  NRe = { class: "pu-hint" },
  FRe = tt({
