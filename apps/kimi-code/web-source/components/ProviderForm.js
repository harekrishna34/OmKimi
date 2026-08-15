    __name: "ProviderForm",
    props: { mode: {}, provider: {}, guard: { type: Boolean } },
    emits: [
      "dirtyChange",
      "guardStay",
      "guardDiscard",
      "added",
      "saved",
      "deleting",
      "deleted",
      "cancel",
    ],
    setup(e, { emit: t }) {
      const n = e,
        o = t,
        { t: s } = Lt(),
        i = hu(),
        r = Jo({
          id: "",
          type: "openai",
          apiKey: "",
          baseUrl: "",
          models: [$h()],
        }),
        l = Z(""),
        a = Z(!1),
        u = Z(!1),
        c = Z(!1),
        d = R(() => n.mode === "add"),
        f = R(() => n.provider !== void 0 && dF(n.provider)),
        h = R(() => {
          const L = n.provider;
          return L === void 0 ? 0 : My(L, i.config.value?.models).length;
        }),
        g = R(() => f.value && h.value === 0),
        m = R(() =>
          lFe.map((L) => ({ value: L, label: s(`providers.types.${L}`) })),
        ),
        w = R(() =>
          f.value
            ? s("providers.apiKeyManaged")
            : !d.value && n.provider?.hasApiKey === !0
              ? s("providers.apiKeySet")
              : "sk-…",
        );
      function _() {
        ((l.value = ""), (u.value = !1));
        const L = n.provider;
        if (d.value || L === void 0) {
          ((r.id = ""),
            (r.type = "openai"),
            (r.apiKey = ""),
            (r.baseUrl = ""),
            (r.models = [$h()]));
          return;
        }
        ((r.id = L.id),
          (r.type = L.type),
          (r.apiKey = ""),
          (r.baseUrl = L.baseUrl ?? ""));
        const B = My(L, i.config.value?.models);
        r.models = B.length > 0 ? B : [$h()];
      }
      dn(() => {
        (_(), y());
      });
      const v = Z(!1),
        k = Z(!1);
      async function y() {
        const L = n.provider;
        if (!(d.value || L === void 0 || f.value || L.hasApiKey !== !0))
          try {
            const B = await i.getProvider(L.id);
            if (k.value) return;
            B.apiKey !== void 0 &&
              B.apiKey !== "" &&
              ((r.apiKey = B.apiKey), (v.value = !0));
          } catch {}
      }
      function x() {
        o("dirtyChange", !0);
      }
      const M = Z(!1),
        $ = Z();
      function S(L) {
        ((l.value = L),
          yt(() =>
            $.value?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
          ));
      }
      async function I() {
        if (a.value) return;
        const L = aFe(r, { requireApiKey: d.value, requireBaseUrl: d.value });
        if (L !== null) {
          S(s(`providers.error.${L}`));
          return;
        }
        ((l.value = ""), (a.value = !0));
        try {
          if (d.value) {
            const B = await i.addProvider(uFe(r));
            if (B !== null) {
              S(B);
              return;
            }
            (o("dirtyChange", !1),
              i.notify({ severity: "success", title: s("providers.added") }),
              o("added", r.id.trim()));
          } else {
            const B = n.provider;
            if (B === void 0) return;
            const H = i.config.value?.providers?.[B.id]?.defaultModel,
              O = await i.updateProvider(
                B.id,
                cFe(r, B, {
                  includeBlankApiKey: v.value,
                  existingDefaultModel: H,
                }),
              );
            if (O !== null) {
              S(O);
              return;
            }
            (await i.checkAuth(),
              i.notify({ severity: "success", title: s("providers.saved") }),
              o("dirtyChange", !1),
              o("saved", r.id.trim()));
          }
        } finally {
          a.value = !1;
        }
      }
      async function P() {
        const L = n.provider;
        if (!(L === void 0 || c.value)) {
          ((c.value = !0),
            o("deleting"),
            await new Promise((B) => setTimeout(B, 300)));
          try {
            if ((await i.deleteProvider(L.id)) === null) {
              u.value = !1;
              return;
            }
            (o("dirtyChange", !1), o("deleted", L.id));
          } finally {
            c.value = !1;
          }
        }
      }
      function D() {
        (r.models.push($h()), x());
      }
      function T(L) {
        r.models.length <= 1 || (r.models.splice(L, 1), x());
      }
      return (L, B) => (
        b(),
        A(
          "div",
          { class: "pf-form", onInput: x },
          [
            e.guard
              ? (b(),
                me(
                  p(Vu),
                  { key: 0, variant: "warning", class: "pf-guard" },
                  {
                    default: ke(() => [
                      C("span", dFe, N(p(s)("providers.unsavedGuard")), 1),
                      V(
                        p(Ft),
                        {
                          variant: "secondary",
                          size: "sm",
                          onClick: B[0] || (B[0] = (H) => o("guardStay")),
                        },
                        {
                          default: ke(() => [
                            Ve(N(p(s)("providers.guardStay")), 1),
                          ]),
                          _: 1,
                        },
                      ),
                      V(
                        p(Ft),
                        {
                          variant: "danger",
                          size: "sm",
                          onClick: B[1] || (B[1] = (H) => o("guardDiscard")),
                        },
                        {
                          default: ke(() => [
                            Ve(N(p(s)("providers.guardDiscard")), 1),
                          ]),
                          _: 1,
                        },
                      ),
                    ]),
                    _: 1,
                  },
                ))
              : te("", !0),
            l.value
              ? (b(),
                A(
                  "div",
                  { key: 1, ref_key: "errorBox", ref: $ },
                  [
                    V(
                      p(Vu),
                      { variant: "danger" },
                      { default: ke(() => [Ve(N(l.value), 1)]), _: 1 },
                    ),
                  ],
                  512,
                ))
              : te("", !0),
            C("div", fFe, [
              C("label", pFe, [
                Ve(N(p(s)("providers.fieldId")), 1),
                B[11] || (B[11] = C("span", { class: "req" }, " *", -1)),
              ]),
              V(
                p(zs),
                {
                  modelValue: r.id,
                  "onUpdate:modelValue": B[2] || (B[2] = (H) => (r.id = H)),
                  placeholder: "my-openai",
                  disabled: f.value,
                  autocomplete: "off",
                  spellcheck: "false",
                },
                null,
                8,
                ["modelValue", "disabled"],
              ),
            ]),
            C("div", hFe, [
              C("label", mFe, [
                Ve(N(p(s)("providers.fieldType")), 1),
                B[12] || (B[12] = C("span", { class: "req" }, " *", -1)),
              ]),
              V(
                p(o3),
                {
                  "model-value": r.type,
                  options: m.value,
                  disabled: f.value,
                  "onUpdate:modelValue":
                    B[3] ||
                    (B[3] = (H) => {
                      ((r.type = H), x());
                    }),
                },
                null,
                8,
                ["model-value", "options", "disabled"],
              ),
            ]),
            C("div", gFe, [
              C("label", vFe, [
                Ve(N(p(s)("providers.fieldApiKey")), 1),
                B[13] || (B[13] = C("span", { class: "req" }, " *", -1)),
              ]),
              C("div", yFe, [
                V(
                  p(zs),
                  {
                    modelValue: r.apiKey,
                    "onUpdate:modelValue":
                      B[4] || (B[4] = (H) => (r.apiKey = H)),
                    type: M.value ? "text" : "password",
                    placeholder: w.value,
                    disabled: f.value,
                    autocomplete: "off",
                    spellcheck: "false",
                    onInput: B[5] || (B[5] = (H) => (k.value = !0)),
                  },
                  null,
                  8,
                  ["modelValue", "type", "placeholder", "disabled"],
                ),
                f.value
                  ? te("", !0)
                  : (b(),
                    me(
                      p(gn),
                      {
                        key: 0,
                        class: "pf-key-eye",
                        size: "sm",
                        label: p(s)(
                          M.value
                            ? "providers.hideApiKey"
                            : "providers.showApiKey",
                        ),
                        onClick: B[6] || (B[6] = (H) => (M.value = !M.value)),
                      },
                      {
                        default: ke(() => [
                          V(
                            p(Ie),
                            { name: M.value ? "eye-off" : "eye", size: "sm" },
                            null,
                            8,
                            ["name"],
                          ),
                        ]),
                        _: 1,
                      },
                      8,
                      ["label"],
                    )),
              ]),
            ]),
            C("div", kFe, [
              C("label", bFe, [
                Ve(N(p(s)("providers.fieldBaseUrl")), 1),
                B[14] || (B[14] = C("span", { class: "req" }, " *", -1)),
              ]),
              V(
                p(zs),
                {
                  modelValue: r.baseUrl,
                  "onUpdate:modelValue":
                    B[7] || (B[7] = (H) => (r.baseUrl = H)),
                  placeholder: p(s)("providers.baseUrlPlaceholder"),
                  disabled: f.value,
                  autocomplete: "off",
                  spellcheck: "false",
                },
                null,
                8,
                ["modelValue", "placeholder", "disabled"],
              ),
            ]),
            C("div", CFe, [
              C("label", wFe, [
                Ve(N(p(s)("providers.fieldModels")), 1),
                B[15] || (B[15] = C("span", { class: "req" }, " *", -1)),
              ]),
              C("div", _Fe, [
                g.value
                  ? (b(), A("div", xFe, N(p(s)("providers.noModels")), 1))
                  : (b(),
                    A(
                      Pe,
                      { key: 1 },
                      [
                        C("div", SFe, [
                          C("span", null, [
                            Ve(N(p(s)("providers.colModelId")), 1),
                            B[16] ||
                              (B[16] = C("span", { class: "req" }, " *", -1)),
                          ]),
                          C("span", null, [
                            Ve(N(p(s)("providers.colContext")), 1),
                            B[17] ||
                              (B[17] = C("span", { class: "req" }, " *", -1)),
                          ]),
                          C(
                            "span",
                            null,
                            N(p(s)("providers.colDisplayName")),
                            1,
                          ),
                          B[18] || (B[18] = C("span", null, null, -1)),
                        ]),
                        (b(!0),
                        A(
                          Pe,
                          null,
                          pt(
                            r.models,
                            (H, O) => (
                              b(),
                              A("div", { key: O, class: "pf-model-grid" }, [
                                V(
                                  p(zs),
                                  {
                                    modelValue: H.model,
                                    "onUpdate:modelValue": (F) => (H.model = F),
                                    placeholder: p(s)(
                                      "providers.modelIdPlaceholder",
                                    ),
                                    disabled: f.value,
                                    autocomplete: "off",
                                    spellcheck: "false",
                                  },
                                  null,
                                  8,
                                  [
                                    "modelValue",
                                    "onUpdate:modelValue",
                                    "placeholder",
                                    "disabled",
                                  ],
                                ),
                                V(
                                  p(zs),
                                  {
                                    modelValue: H.maxContextSize,
                                    "onUpdate:modelValue": (F) =>
                                      (H.maxContextSize = F),
                                    inputmode: "numeric",
                                    placeholder: p(s)(
                                      "providers.modelContextPlaceholder",
                                    ),
                                    disabled: f.value,
                                    autocomplete: "off",
                                    spellcheck: "false",
                                  },
                                  null,
                                  8,
                                  [
                                    "modelValue",
                                    "onUpdate:modelValue",
                                    "placeholder",
                                    "disabled",
                                  ],
                                ),
                                V(
                                  p(zs),
                                  {
                                    modelValue: H.displayName,
                                    "onUpdate:modelValue": (F) =>
                                      (H.displayName = F),
                                    placeholder: p(s)(
                                      "providers.modelNamePlaceholder",
                                    ),
                                    disabled: f.value,
                                    autocomplete: "off",
                                    spellcheck: "false",
                                  },
                                  null,
                                  8,
                                  [
                                    "modelValue",
                                    "onUpdate:modelValue",
                                    "placeholder",
                                    "disabled",
                                  ],
                                ),
                                f.value
                                  ? (b(), A("span", AFe))
                                  : (b(),
                                    me(
                                      p(gn),
                                      {
                                        key: 0,
                                        size: "sm",
                                        label: p(s)("providers.removeModel"),
                                        disabled: r.models.length <= 1,
                                        onClick: (F) => T(O),
                                      },
                                      {
                                        default: ke(() => [
                                          V(p(Ie), {
                                            name: "trash",
                                            size: "sm",
                                          }),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["label", "disabled", "onClick"],
                                    )),
                              ])
                            ),
                          ),
                          128,
                        )),
                        f.value
                          ? te("", !0)
                          : (b(),
                            A("div", MFe, [
                              V(
                                p(Ft),
                                { variant: "ghost", size: "sm", onClick: D },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "plus", size: "sm" }),
                                    Ve(" " + N(p(s)("providers.addModel")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ])),
                      ],
                      64,
                    )),
              ]),
            ]),
            C("div", TFe, [
              f.value
                ? (b(), A("span", EFe, N(p(s)("providers.managedHint")), 1))
                : d.value
                  ? (b(),
                    A(
                      Pe,
                      { key: 1 },
                      [
                        V(
                          p(Ft),
                          {
                            variant: "secondary",
                            size: "sm",
                            onClick: B[8] || (B[8] = (H) => o("cancel")),
                          },
                          {
                            default: ke(() => [
                              Ve(N(p(s)("common.cancel")), 1),
                            ]),
                            _: 1,
                          },
                        ),
                        V(
                          p(Ft),
                          {
                            variant: "primary",
                            size: "sm",
                            disabled: a.value,
                            onClick: I,
                          },
                          {
                            default: ke(() => [
                              Ve(N(p(s)("providers.addProvider")), 1),
                            ]),
                            _: 1,
                          },
                          8,
                          ["disabled"],
                        ),
                      ],
                      64,
                    ))
                  : u.value && n.provider !== void 0
                    ? (b(),
                      A(
                        Pe,
                        { key: 2 },
                        [
                          C(
                            "span",
                            IFe,
                            N(
                              p(s)("providers.deleteConfirm", {
                                id: n.provider.id,
                                count: h.value,
                              }),
                            ),
                            1,
                          ),
                          B[19] ||
                            (B[19] = C("span", { class: "spacer" }, null, -1)),
                          V(
                            p(Ft),
                            {
                              variant: "secondary",
                              size: "sm",
                              disabled: c.value,
                              onClick: B[9] || (B[9] = (H) => (u.value = !1)),
                            },
                            {
                              default: ke(() => [
                                Ve(N(p(s)("common.cancel")), 1),
                              ]),
                              _: 1,
                            },
                            8,
                            ["disabled"],
                          ),
                          V(
                            p(Ft),
                            {
                              variant: "danger",
                              size: "sm",
                              disabled: c.value,
                              onClick: P,
                            },
                            {
                              default: ke(() => [
                                Ve(N(p(s)("providers.deleteConfirmYes")), 1),
                              ]),
                              _: 1,
                            },
                            8,
                            ["disabled"],
                          ),
                        ],
                        64,
                      ))
                    : (b(),
                      A(
                        Pe,
                        { key: 3 },
                        [
                          V(
                            p(Ft),
                            {
                              variant: "danger-soft",
                              size: "sm",
                              onClick: B[10] || (B[10] = (H) => (u.value = !0)),
                            },
                            {
                              default: ke(() => [
                                Ve(N(p(s)("providers.deleteProvider")), 1),
                              ]),
                              _: 1,
                            },
                          ),
                          B[20] ||
                            (B[20] = C("span", { class: "spacer" }, null, -1)),
                          V(
                            p(Ft),
                            {
                              variant: "primary",
                              size: "sm",
                              disabled: a.value,
                              onClick: I,
                            },
                            {
                              default: ke(() => [
                                Ve(N(p(s)("providers.save")), 1),
                              ]),
                              _: 1,
                            },
                            8,
                            ["disabled"],
                          ),
                        ],
                        64,
                      )),
            ]),
          ],
          32,
        )
      );
    },
  }),
  fF = ht(LFe, [["__scopeId", "data-v-51214cd2"]]),
  $Fe = { class: "af" },
  NFe = { class: "msg" },
  FFe = { key: 2, class: "af-catalog" },
  RFe = { key: 0, class: "af-center" },
  OFe = { key: 1, class: "af-error" },
  PFe = { class: "af-list" },
  DFe = ["disabled", "onClick"],
  BFe = { class: "af-entry-name" },
  HFe = { key: 1, class: "af-entry-reason" },
  zFe = { key: 2, class: "af-entry-count" },
  WFe = { key: 0, class: "af-empty" },
  UFe = { class: "af-field" },
  jFe = { class: "af-label" },
  VFe = { class: "af-field" },
  qFe = { class: "af-label" },
  KFe = { class: "af-key-wrap" },
  ZFe = { key: 0, class: "af-field" },
  GFe = { class: "af-label" },
  YFe = { class: "af-note" },
  XFe = { class: "af-foot" },
  JFe = { class: "af-hint" },
  QFe = { class: "af-field" },
  eRe = { class: "af-label" },
  tRe = { class: "af-field" },
  nRe = { class: "af-label" },
  oRe = { class: "af-key-wrap" },
  sRe = { class: "af-foot" },
  iRe = { class: "af-manual" },
  rRe = tt({
