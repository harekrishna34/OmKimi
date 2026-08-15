    __name: "AddProviderFlow",
    props: { guard: { type: Boolean } },
    emits: ["dirtyChange", "guardStay", "guardDiscard", "added", "cancel"],
    setup(e, { emit: t }) {
      const n = t,
        { t: o, te: s } = Lt(),
        i = hu(),
        r = Z("catalog"),
        l = R(() => [
          { value: "catalog", label: o("providers.catalog.sourceCatalog") },
          { value: "registry", label: o("providers.catalog.sourceRegistry") },
          { value: "manual", label: o("providers.catalog.sourceManual") },
        ]),
        a = Z("loading"),
        u = Z([]);
      async function c() {
        a.value = "loading";
        const W = await i.loadCatalogProviders();
        W.kind === "ok"
          ? ((u.value = W.items), (a.value = "ready"))
          : W.kind === "unsupported"
            ? ((a.value = "unsupported"),
              r.value === "catalog" && (r.value = "manual"))
            : (a.value = "error");
      }
      dn(c);
      const d = Z(""),
        f = R(() => {
          const W = d.value.trim().toLowerCase();
          return W === ""
            ? u.value
            : u.value.filter(
                (z) =>
                  z.name.toLowerCase().includes(W) ||
                  z.id.toLowerCase().includes(W),
              );
        });
      function h(W) {
        const z = W.rejectReason;
        return z !== null && s(`providers.catalog.rejectReason.${z}`)
          ? o(`providers.catalog.rejectReason.${z}`)
          : o("providers.catalog.rejected");
      }
      const g = Z(null),
        m = Z({ id: "", apiKey: "", baseUrl: "" }),
        w = Z(!1),
        _ = Z(!1),
        v = Z("");
      function k(W) {
        ((g.value = W),
          (m.value = { id: W.id, apiKey: "", baseUrl: "" }),
          (v.value = ""),
          (w.value = !1));
      }
      function y() {
        ((g.value = null), (v.value = ""), n("dirtyChange", !1));
      }
      function x() {
        n("dirtyChange", !0);
      }
      const M = R(() => {
          if (g.value === null) return !1;
          const z = m.value.id.trim();
          return z !== "" && i.providers.value.some((U) => U.id === z);
        }),
        $ = Z();
      function S(W) {
        ((v.value = W),
          yt(() =>
            $.value?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
          ));
      }
      function I() {
        const W = m.value,
          z = W.id.trim();
        return z === ""
          ? o("providers.error.idRequired")
          : uF.test(z)
            ? W.apiKey.trim() === ""
              ? o("providers.error.apiKeyRequired")
              : g.value?.needsBaseUrl === !0 && W.baseUrl.trim() === ""
                ? o("providers.error.baseUrlRequired")
                : null
            : o("providers.error.idInvalid");
      }
      async function P() {
        const W = g.value;
        if (W === null || _.value) return;
        const z = I();
        if (z !== null) {
          S(z);
          return;
        }
        ((v.value = ""), (_.value = !0));
        try {
          const U = m.value,
            q = U.id.trim(),
            K = U.baseUrl.trim(),
            ie = await i.importCatalogProvider({
              catalogId: W.id,
              apiKey: U.apiKey.trim(),
              ...(K === "" ? {} : { baseUrl: K }),
              ...(q === W.id ? {} : { id: q }),
            });
          if (ie !== null) {
            S(ie);
            return;
          }
          (i.notify({ severity: "success", title: o("providers.added") }),
            n("dirtyChange", !1),
            n("added", q));
        } finally {
          _.value = !1;
        }
      }
      const D = Z({ url: "", apiKey: "" }),
        T = Z(!1),
        L = Z(!1),
        B = Z(""),
        H = Z();
      function O(W) {
        ((B.value = W),
          yt(() =>
            H.value?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
          ));
      }
      async function F() {
        if (L.value) return;
        const W = D.value.url.trim();
        if (W === "") {
          O(o("providers.error.registryUrlRequired"));
          return;
        }
        ((B.value = ""), (L.value = !0));
        try {
          const z = D.value.apiKey.trim(),
            U = await i.importCustomRegistry({
              url: W,
              ...(z === "" ? {} : { apiKey: z }),
            });
          if (typeof U == "string") {
            O(U);
            return;
          }
          (i.notify({
            severity: "success",
            title: o("providers.catalog.registryImported", {
              count: U.providers.length,
            }),
          }),
            n("dirtyChange", !1));
          const q = U.providers[0];
          q !== void 0 ? n("added", q.id) : n("cancel");
        } finally {
          L.value = !1;
        }
      }
      return (W, z) => (
        b(),
        A("div", $Fe, [
          e.guard
            ? (b(),
              me(
                p(Vu),
                { key: 0, variant: "warning", class: "af-guard" },
                {
                  default: ke(() => [
                    C("span", NFe, N(p(o)("providers.unsavedGuard")), 1),
                    V(
                      p(Ft),
                      {
                        variant: "secondary",
                        size: "sm",
                        onClick: z[0] || (z[0] = (U) => n("guardStay")),
                      },
                      {
                        default: ke(() => [
                          Ve(N(p(o)("providers.guardStay")), 1),
                        ]),
                        _: 1,
                      },
                    ),
                    V(
                      p(Ft),
                      {
                        variant: "danger",
                        size: "sm",
                        onClick: z[1] || (z[1] = (U) => n("guardDiscard")),
                      },
                      {
                        default: ke(() => [
                          Ve(N(p(o)("providers.guardDiscard")), 1),
                        ]),
                        _: 1,
                      },
                    ),
                  ]),
                  _: 1,
                },
              ))
            : te("", !0),
          a.value !== "unsupported"
            ? (b(),
              me(
                p(bi),
                {
                  key: 1,
                  modelValue: r.value,
                  "onUpdate:modelValue": z[2] || (z[2] = (U) => (r.value = U)),
                  size: "sm",
                  options: l.value,
                },
                null,
                8,
                ["modelValue", "options"],
              ))
            : te("", !0),
          a.value !== "unsupported"
            ? In(
                (b(),
                A(
                  "div",
                  FFe,
                  [
                    a.value === "loading"
                      ? (b(),
                        A("div", RFe, [
                          V(p(Ao), { size: "sm" }),
                          C(
                            "span",
                            null,
                            N(p(o)("providers.catalog.loading")),
                            1,
                          ),
                        ]))
                      : a.value === "error"
                        ? (b(),
                          A("div", OFe, [
                            V(
                              p(Vu),
                              { variant: "danger" },
                              {
                                default: ke(() => [
                                  Ve(N(p(o)("providers.catalog.loadError")), 1),
                                ]),
                                _: 1,
                              },
                            ),
                            C("div", null, [
                              V(
                                p(Ft),
                                {
                                  variant: "secondary",
                                  size: "sm",
                                  onClick: c,
                                },
                                {
                                  default: ke(() => [
                                    Ve(N(p(o)("providers.catalog.retry")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ]))
                        : g.value === null
                          ? (b(),
                            A(
                              Pe,
                              { key: 2 },
                              [
                                V(
                                  p(zs),
                                  {
                                    modelValue: d.value,
                                    "onUpdate:modelValue":
                                      z[3] || (z[3] = (U) => (d.value = U)),
                                    placeholder: p(o)(
                                      "providers.catalog.searchPlaceholder",
                                    ),
                                    autocomplete: "off",
                                    spellcheck: "false",
                                  },
                                  null,
                                  8,
                                  ["modelValue", "placeholder"],
                                ),
                                C("div", PFe, [
                                  (b(!0),
                                  A(
                                    Pe,
                                    null,
                                    pt(
                                      f.value,
                                      (U) => (
                                        b(),
                                        A(
                                          "button",
                                          {
                                            key: U.id,
                                            type: "button",
                                            class: "af-entry",
                                            disabled: U.rejected,
                                            onClick: (q) => k(U),
                                          },
                                          [
                                            C("span", BFe, N(U.name), 1),
                                            U.wireType !== null
                                              ? (b(),
                                                me(
                                                  p(Vr),
                                                  {
                                                    key: 0,
                                                    variant: "neutral",
                                                    size: "sm",
                                                  },
                                                  {
                                                    default: ke(() => [
                                                      Ve(N(U.wireType), 1),
                                                    ]),
                                                    _: 2,
                                                  },
                                                  1024,
                                                ))
                                              : te("", !0),
                                            z[16] ||
                                              (z[16] = C(
                                                "span",
                                                { class: "grow" },
                                                null,
                                                -1,
                                              )),
                                            U.rejected
                                              ? (b(),
                                                A("span", HFe, N(h(U)), 1))
                                              : (b(),
                                                A(
                                                  "span",
                                                  zFe,
                                                  N(
                                                    p(o)(
                                                      "providers.modelCount",
                                                      {
                                                        count: U.models.length,
                                                      },
                                                    ),
                                                  ),
                                                  1,
                                                )),
                                          ],
                                          8,
                                          DFe,
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                                  f.value.length === 0
                                    ? (b(),
                                      A(
                                        "div",
                                        WFe,
                                        N(p(o)("providers.catalog.empty")),
                                        1,
                                      ))
                                    : te("", !0),
                                ]),
                              ],
                              64,
                            ))
                          : (b(),
                            A(
                              "div",
                              { key: 3, class: "af-import", onInput: x },
                              [
                                C(
                                  "button",
                                  {
                                    type: "button",
                                    class: "af-back",
                                    onClick: y,
                                  },
                                  [
                                    V(p(Ie), {
                                      name: "arrow-left",
                                      size: "sm",
                                    }),
                                    Ve(
                                      " " +
                                        N(p(o)("providers.catalog.backToList")),
                                      1,
                                    ),
                                  ],
                                ),
                                C("div", UFe, [
                                  C("label", jFe, [
                                    Ve(N(p(o)("providers.fieldId")), 1),
                                    z[17] ||
                                      (z[17] = C(
                                        "span",
                                        { class: "req" },
                                        " *",
                                        -1,
                                      )),
                                  ]),
                                  V(
                                    p(zs),
                                    {
                                      modelValue: m.value.id,
                                      "onUpdate:modelValue":
                                        z[4] ||
                                        (z[4] = (U) => (m.value.id = U)),
                                      autocomplete: "off",
                                      spellcheck: "false",
                                    },
                                    null,
                                    8,
                                    ["modelValue"],
                                  ),
                                ]),
                                C("div", VFe, [
                                  C("label", qFe, [
                                    Ve(N(p(o)("providers.fieldApiKey")), 1),
                                    z[18] ||
                                      (z[18] = C(
                                        "span",
                                        { class: "req" },
                                        " *",
                                        -1,
                                      )),
                                  ]),
                                  C("div", KFe, [
                                    V(
                                      p(zs),
                                      {
                                        modelValue: m.value.apiKey,
                                        "onUpdate:modelValue":
                                          z[5] ||
                                          (z[5] = (U) => (m.value.apiKey = U)),
                                        type: w.value ? "text" : "password",
                                        placeholder: "sk-…",
                                        autocomplete: "off",
                                        spellcheck: "false",
                                      },
                                      null,
                                      8,
                                      ["modelValue", "type"],
                                    ),
                                    V(
                                      p(gn),
                                      {
                                        class: "af-key-eye",
                                        size: "sm",
                                        label: p(o)(
                                          w.value
                                            ? "providers.hideApiKey"
                                            : "providers.showApiKey",
                                        ),
                                        onClick:
                                          z[6] ||
                                          (z[6] = (U) => (w.value = !w.value)),
                                      },
                                      {
                                        default: ke(() => [
                                          V(
                                            p(Ie),
                                            {
                                              name: w.value ? "eye-off" : "eye",
                                              size: "sm",
                                            },
                                            null,
                                            8,
                                            ["name"],
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["label"],
                                    ),
                                  ]),
                                ]),
                                g.value.needsBaseUrl
                                  ? (b(),
                                    A("div", ZFe, [
                                      C("label", GFe, [
                                        Ve(
                                          N(p(o)("providers.fieldBaseUrl")),
                                          1,
                                        ),
                                        z[19] ||
                                          (z[19] = C(
                                            "span",
                                            { class: "req" },
                                            " *",
                                            -1,
                                          )),
                                      ]),
                                      V(
                                        p(zs),
                                        {
                                          modelValue: m.value.baseUrl,
                                          "onUpdate:modelValue":
                                            z[7] ||
                                            (z[7] = (U) =>
                                              (m.value.baseUrl = U)),
                                          placeholder: p(o)(
                                            "providers.baseUrlPlaceholder",
                                          ),
                                          autocomplete: "off",
                                          spellcheck: "false",
                                        },
                                        null,
                                        8,
                                        ["modelValue", "placeholder"],
                                      ),
                                    ]))
                                  : te("", !0),
                                M.value
                                  ? (b(),
                                    me(
                                      p(Vu),
                                      { key: 1, variant: "warning" },
                                      {
                                        default: ke(() => [
                                          Ve(
                                            N(
                                              p(o)(
                                                "providers.catalog.overwriteWarning",
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                    ))
                                  : te("", !0),
                                C(
                                  "div",
                                  YFe,
                                  N(
                                    p(o)("providers.catalog.willImport", {
                                      count: g.value.models.length,
                                    }),
                                  ),
                                  1,
                                ),
                                v.value
                                  ? (b(),
                                    A(
                                      "div",
                                      {
                                        key: 2,
                                        ref_key: "importErrorBox",
                                        ref: $,
                                      },
                                      [
                                        V(
                                          p(Vu),
                                          { variant: "danger" },
                                          {
                                            default: ke(() => [
                                              Ve(N(v.value), 1),
                                            ]),
                                            _: 1,
                                          },
                                        ),
                                      ],
                                      512,
                                    ))
                                  : te("", !0),
                                C("div", XFe, [
                                  V(
                                    p(Ft),
                                    {
                                      variant: "secondary",
                                      size: "sm",
                                      onClick:
                                        z[8] || (z[8] = (U) => n("cancel")),
                                    },
                                    {
                                      default: ke(() => [
                                        Ve(N(p(o)("common.cancel")), 1),
                                      ]),
                                      _: 1,
                                    },
                                  ),
                                  V(
                                    p(Ft),
                                    {
                                      variant: "primary",
                                      size: "sm",
                                      disabled: _.value,
                                      onClick: P,
                                    },
                                    {
                                      default: ke(() => [
                                        Ve(
                                          N(
                                            p(o)(
                                              "providers.catalog.importAction",
                                            ),
                                          ),
                                          1,
                                        ),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["disabled"],
                                  ),
                                ]),
                              ],
                              32,
                            )),
                  ],
                  512,
                )),
                [[Es, r.value === "catalog"]],
              )
            : te("", !0),
          In(
            C(
              "div",
              { class: "af-registry", onInput: x },
              [
                C("div", JFe, N(p(o)("providers.catalog.registryHint")), 1),
                C("div", QFe, [
                  C("label", eRe, [
                    Ve(N(p(o)("providers.catalog.registryUrlLabel")), 1),
                    z[20] || (z[20] = C("span", { class: "req" }, " *", -1)),
                  ]),
                  V(
                    p(zs),
                    {
                      modelValue: D.value.url,
                      "onUpdate:modelValue":
                        z[9] || (z[9] = (U) => (D.value.url = U)),
                      placeholder: "https://example.com/api.json",
                      autocomplete: "off",
                      spellcheck: "false",
                    },
                    null,
                    8,
                    ["modelValue"],
                  ),
                ]),
                C("div", tRe, [
                  C("label", nRe, N(p(o)("providers.fieldApiKey")), 1),
                  C("div", oRe, [
                    V(
                      p(zs),
                      {
                        modelValue: D.value.apiKey,
                        "onUpdate:modelValue":
                          z[10] || (z[10] = (U) => (D.value.apiKey = U)),
                        type: T.value ? "text" : "password",
                        placeholder: p(o)("providers.modelNamePlaceholder"),
                        autocomplete: "off",
                        spellcheck: "false",
                      },
                      null,
                      8,
                      ["modelValue", "type", "placeholder"],
                    ),
                    V(
                      p(gn),
                      {
                        class: "af-key-eye",
                        size: "sm",
                        label: p(o)(
                          T.value
                            ? "providers.hideApiKey"
                            : "providers.showApiKey",
                        ),
                        onClick: z[11] || (z[11] = (U) => (T.value = !T.value)),
                      },
                      {
                        default: ke(() => [
                          V(
                            p(Ie),
                            { name: T.value ? "eye-off" : "eye", size: "sm" },
                            null,
                            8,
                            ["name"],
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["label"],
                    ),
                  ]),
                ]),
                B.value
                  ? (b(),
                    A(
                      "div",
                      { key: 0, ref_key: "registryErrorBox", ref: H },
                      [
                        V(
                          p(Vu),
                          { variant: "danger" },
                          { default: ke(() => [Ve(N(B.value), 1)]), _: 1 },
                        ),
                      ],
                      512,
                    ))
                  : te("", !0),
                C("div", sRe, [
                  V(
                    p(Ft),
                    {
                      variant: "secondary",
                      size: "sm",
                      onClick: z[12] || (z[12] = (U) => n("cancel")),
                    },
                    {
                      default: ke(() => [Ve(N(p(o)("common.cancel")), 1)]),
                      _: 1,
                    },
                  ),
                  V(
                    p(Ft),
                    {
                      variant: "primary",
                      size: "sm",
                      disabled: L.value,
                      onClick: F,
                    },
                    {
                      default: ke(() => [
                        Ve(N(p(o)("providers.catalog.importAction")), 1),
                      ]),
                      _: 1,
                    },
                    8,
                    ["disabled"],
                  ),
                ]),
              ],
              544,
            ),
            [[Es, r.value === "registry"]],
          ),
          In(
            C(
              "div",
              iRe,
              [
                V(fF, {
                  mode: "add",
                  guard: !1,
                  onDirtyChange: z[13] || (z[13] = (U) => n("dirtyChange", U)),
                  onAdded: z[14] || (z[14] = (U) => n("added", U)),
                  onCancel: z[15] || (z[15] = (U) => n("cancel")),
                }),
              ],
              512,
            ),
            [[Es, r.value === "manual"]],
          ),
        ])
      );
    },
  }),
  lRe = ht(rRe, [["__scopeId", "data-v-e6595b0c"]]),
  aRe = { class: "pp" },
  uRe = { class: "pp-head" },
  cRe = { class: "pp-title" },
  dRe = { key: 0, class: "pp-loading" },
  fRe = { key: 1, class: "pp-group" },
  pRe = { class: "pp-add-label" },
  hRe = { class: "pp-chev" },
  mRe = { class: "pp-acc" },
  gRe = { class: "pp-acc-in" },
  vRe = { key: 1, class: "pp-empty" },
  yRe = ["onClick"],
  kRe = { class: "grow" },
  bRe = { class: "pp-id" },
  CRe = { class: "pp-count" },
  wRe = { class: "pp-chev" },
  _Re = { class: "pp-acc" },
  xRe = { class: "pp-acc-in" },
  zu = "$add",
  SRe = tt({
