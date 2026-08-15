    __name: "ModelPicker",
    props: {
      models: {},
      current: {},
      starredIds: {},
      loading: { type: Boolean },
      unavailable: { type: Boolean },
    },
    emits: ["select", "toggle-star", "close"],
    setup(e, { emit: t }) {
      const { t: n } = Lt(),
        o = e,
        s = t,
        i = R(() => new Set(o.starredIds ?? []));
      function r(D) {
        return i.value.has(D);
      }
      const l = Z(""),
        a = Z(null),
        u = Z(null),
        c = Z(null),
        d = Z("all"),
        f = {
          image_in: "model.capabilityImageInput",
          video_in: "model.capabilityVideoInput",
          tool_use: "model.capabilityToolUse",
          thinking: "model.capabilityThinking",
          always_thinking: "model.capabilityAlwaysThinking",
        };
      function h(D) {
        const T = f[D];
        return T ? n(T) : D.replaceAll("_", " ");
      }
      function g(D) {
        const T = [
          D.provider,
          n("model.contextSuffix", { size: Ml(D.maxContextSize) }),
        ];
        for (const L of D.capabilities ?? []) T.push(h(L));
        return T.join(" · ");
      }
      rF(u, a);
      const m = R(() => {
          const D = new Set(),
            T = [{ id: "all", label: n("model.allTab") }];
          for (const L of o.models)
            D.has(L.provider) ||
              (D.add(L.provider),
              T.push({ id: L.provider, label: L.provider }));
          return T;
        }),
        w = R(() => {
          const D = l.value.toLowerCase().trim(),
            T = o.models.filter((L) => {
              if (d.value !== "all" && L.provider !== d.value) return !1;
              const B = (L.displayName ?? L.model).toLowerCase().includes(D),
                H = L.provider.toLowerCase().includes(D),
                O = L.id.toLowerCase().includes(D);
              return !D || B || H || O;
            });
          return d.value !== "all"
            ? T
            : T.sort((L, B) => {
                const H = r(L.id) ? 1 : 0;
                return (r(B.id) ? 1 : 0) - H;
              });
        }),
        _ = R(() => w.value),
        v = Z(0);
      (et([l, d], () => {
        v.value = 0;
      }),
        et(m, (D) => {
          D.some((T) => T.id === d.value) || (d.value = "all");
        }),
        et(_, (D) => {
          v.value = Math.min(v.value, Math.max(D.length - 1, 0));
        }),
        et(v, async () => {
          (await yt(),
            c.value
              ?.querySelector(".model-row.is-selected")
              ?.scrollIntoView({ block: "nearest" }));
        }));
      const {
        handleCompositionStart: k,
        handleCompositionEnd: y,
        isComposingKeyEvent: x,
      } = Sr();
      function M(D) {
        if (!x(D)) {
          if (D.key === "Escape") {
            s("close");
            return;
          }
          if (D.key === "ArrowDown")
            (D.preventDefault(),
              (v.value = Math.min(v.value + 1, _.value.length - 1)));
          else if (D.key === "ArrowUp")
            (D.preventDefault(), (v.value = Math.max(v.value - 1, 0)));
          else if (D.key === "Enter") {
            const T = _.value[v.value];
            T && s("select", T.id);
          }
        }
      }
      (dn(() => {
        document.addEventListener("keydown", M);
      }),
        kn(() => {
          document.removeEventListener("keydown", M);
        }));
      function $(D) {
        s("select", D);
      }
      function S() {
        ((l.value = ""), a.value?.focus());
      }
      function I(D) {
        return _.value.indexOf(D);
      }
      function P(D) {
        d.value = D;
      }
      return (D, T) => (
        b(),
        me(
          p(ca),
          {
            open: !0,
            "close-on-esc": !1,
            title: p(n)("model.title"),
            size: "lg",
            height: "fixed",
            padded: !1,
            onClose: T[1] || (T[1] = (L) => s("close")),
          },
          {
            default: ke(() => [
              C(
                "div",
                { ref_key: "dialogRef", ref: u, class: "mp" },
                [
                  C("div", CNe, [
                    V(
                      p(zs),
                      {
                        ref_key: "searchRef",
                        ref: a,
                        modelValue: l.value,
                        "onUpdate:modelValue":
                          T[0] || (T[0] = (L) => (l.value = L)),
                        placeholder: p(n)("model.searchPlaceholder"),
                        autocomplete: "off",
                        spellcheck: "false",
                        autofocus: "",
                        onCompositionstart: p(k),
                        onCompositionend: p(y),
                      },
                      null,
                      8,
                      [
                        "modelValue",
                        "placeholder",
                        "onCompositionstart",
                        "onCompositionend",
                      ],
                    ),
                    C(
                      "button",
                      {
                        type: "button",
                        class: Re([
                          "search-clear",
                          { "is-on": l.value.length > 0 },
                        ]),
                        tabindex: "-1",
                        "aria-label": p(n)("model.clearSearch"),
                        onClick: S,
                      },
                      [V(p(Ie), { name: "close", size: "sm" })],
                      10,
                      wNe,
                    ),
                  ]),
                  m.value.length > 1
                    ? (b(),
                      A(
                        "div",
                        {
                          key: 0,
                          class: "chip-strip",
                          "aria-label": p(n)("model.providerTabs"),
                        },
                        [
                          (b(!0),
                          A(
                            Pe,
                            null,
                            pt(
                              m.value,
                              (L) => (
                                b(),
                                A(
                                  "button",
                                  {
                                    key: L.id,
                                    type: "button",
                                    class: Re([
                                      "chip",
                                      { "is-active": L.id === d.value },
                                    ]),
                                    "aria-pressed": L.id === d.value,
                                    onClick: (B) => P(L.id),
                                  },
                                  N(L.label),
                                  11,
                                  xNe,
                                )
                              ),
                            ),
                            128,
                          )),
                        ],
                        8,
                        _Ne,
                      ))
                    : te("", !0),
                  e.loading
                    ? (b(),
                      A("div", SNe, [
                        V(p(Ao), { size: "sm" }),
                        C("span", null, N(p(n)("model.loading")), 1),
                      ]))
                    : e.unavailable
                      ? (b(),
                        A("div", ANe, [
                          V(p(Ie), { name: "alert-triangle", size: "lg" }),
                          C("span", null, N(p(n)("model.unavailable")), 1),
                        ]))
                      : (b(),
                        A(
                          "div",
                          {
                            key: 3,
                            ref_key: "listRef",
                            ref: c,
                            class: "model-list",
                            role: "listbox",
                            "aria-label": p(n)("model.title"),
                          },
                          [
                            (b(!0),
                            A(
                              Pe,
                              null,
                              pt(
                                _.value,
                                (L) => (
                                  b(),
                                  A(
                                    "div",
                                    {
                                      key: L.id,
                                      class: Re([
                                        "model-row",
                                        {
                                          "is-current": L.id === e.current,
                                          "is-selected": I(L) === v.value,
                                        },
                                      ]),
                                      role: "option",
                                      "aria-selected": L.id === e.current,
                                      onClick: (B) => $(L.id),
                                      onMouseenter: (B) => (v.value = I(L)),
                                    },
                                    [
                                      C("span", ENe, [
                                        C(
                                          "span",
                                          INe,
                                          N(L.displayName ?? L.model),
                                          1,
                                        ),
                                        C("span", LNe, N(g(L)), 1),
                                      ]),
                                      C("span", $Ne, [
                                        L.id === e.current
                                          ? (b(),
                                            me(p(Ie), {
                                              key: 0,
                                              class: "model-check",
                                              name: "check",
                                              size: "sm",
                                            }))
                                          : te("", !0),
                                        V(
                                          p(gn),
                                          {
                                            class: Re([
                                              "model-star",
                                              { "is-starred": r(L.id) },
                                            ]),
                                            size: "sm",
                                            label: r(L.id)
                                              ? p(n)("model.unstarTitle")
                                              : p(n)("model.starTitle"),
                                            onClick: Et(
                                              (B) => s("toggle-star", L.id),
                                              ["stop"],
                                            ),
                                          },
                                          {
                                            default: ke(() => [
                                              r(L.id)
                                                ? (b(),
                                                  me(p(Ie), {
                                                    key: 0,
                                                    name: "star",
                                                    size: "md",
                                                  }))
                                                : (b(),
                                                  me(p(Ie), {
                                                    key: 1,
                                                    name: "star-outline",
                                                    size: "md",
                                                  })),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["class", "label", "onClick"],
                                        ),
                                      ]),
                                    ],
                                    42,
                                    TNe,
                                  )
                                ),
                              ),
                              128,
                            )),
                            _.value.length === 0
                              ? (b(),
                                A(
                                  "div",
                                  NNe,
                                  N(
                                    o.models.length === 0
                                      ? p(n)("model.emptyNoModels")
                                      : p(n)("model.emptyNoMatch"),
                                  ),
                                  1,
                                ))
                              : te("", !0),
                          ],
                          8,
                          MNe,
                        )),
                  C("div", FNe, [
                    V(p(sa), { keys: ["↑", "↓"] }),
                    C("span", null, N(p(n)("model.hintNavigate")), 1),
                    T[2] || (T[2] = C("span", { class: "hint-dot" }, "·", -1)),
                    V(p(sa), { keys: ["Enter"] }),
                    C("span", null, N(p(n)("model.hintSelect")), 1),
                    T[3] || (T[3] = C("span", { class: "hint-dot" }, "·", -1)),
                    V(p(sa), { keys: ["Esc"] }),
                    C("span", null, N(p(n)("model.hintClose")), 1),
                  ]),
                ],
                512,
              ),
            ]),
            _: 1,
          },
          8,
          ["title"],
        )
      );
    },
  }),
  ONe = ht(RNe, [["__scopeId", "data-v-d5ea4110"]]),
  PNe = 3;
function lF(e) {
  const t = Z("starting"),
    n = Z(!1),
    o = Z(null),
    s = Z(0);
  let i = null,
    r = null,
    l = null,
    a = 0,
    u = !1,
    c = !1;
  function d() {
    (i && (clearTimeout(i), (i = null)),
      r && (clearInterval(r), (r = null)),
      l && (clearTimeout(l), (l = null)));
  }
  function f(_) {
    (d(),
      (t.value = "success"),
      (l = setTimeout(() => {
        ((l = null), e.onSuccess?.());
      }, _)));
  }
  function h() {
    (r && clearInterval(r),
      (r = setInterval(() => {
        s.value > 0 ? s.value-- : (r && clearInterval(r), (r = null));
      }, 1e3)));
  }
  function g(_) {
    (i && clearTimeout(i),
      (i = setTimeout(async () => {
        const v = await e.onPollOAuthLogin();
        if (!c) {
          if (v === null) {
            if (((a += 1), a >= PNe)) {
              (d(), (n.value = !0), (t.value = "error"));
              return;
            }
            g(_);
            return;
          }
          ((a = 0),
            v.status === "authenticated"
              ? f(1200)
              : v.status === "expired" || v.status === "cancelled"
                ? (d(), (t.value = "expired"))
                : g(_));
        }
      }, _ * 1e3)));
  }
  async function m() {
    (d(),
      (o.value = null),
      (n.value = !1),
      (a = 0),
      (u = !1),
      (t.value = "starting"));
    const _ = await e.onStartOAuthLogin();
    if (c) {
      _ !== null && _.status !== "authenticated" && e.onCancelOAuthLogin();
      return;
    }
    if (!_) {
      t.value = "error";
      return;
    }
    if (_.status === "authenticated") {
      f(800);
      return;
    }
    ((o.value = {
      flowId: _.flowId,
      verificationUri: _.verificationUri,
      verificationUriComplete: _.verificationUriComplete,
      userCode: _.userCode,
      expiresIn: _.expiresIn,
      interval: _.interval,
    }),
      (s.value = _.expiresIn),
      (t.value = "device-code"),
      h(),
      g(_.interval));
  }
  function w() {
    t.value !== "success" &&
      (d(),
      t.value === "device-code" && !u && ((u = !0), e.onCancelOAuthLogin()));
  }
  return (
    Zg() &&
      pf(() => {
        ((c = !0), w());
      }),
    {
      step: t,
      pollError: n,
      flow: o,
      secondsLeft: s,
      startFlow: m,
      cancelFlow: w,
    }
  );
}
const DNe = { key: 0, class: "center-body" },
  BNe = { class: "center-text" },
  HNe = { key: 1, class: "nb" },
  zNe = { class: "nb-lead" },
  WNe = ["href"],
  UNe = { class: "nb-code-row" },
  jNe = ["title"],
  VNe = { class: "nb-status" },
  qNe = { class: "nb-status-text" },
  KNe = { class: "nb-countdown" },
  ZNe = { key: 2, class: "center-body" },
  GNe = { class: "center-text success-text" },
  YNe = { class: "center-hint" },
  XNe = { class: "center-body" },
  JNe = { class: "center-text err-text" },
  QNe = { class: "center-hint" },
  eFe = { class: "actions" },
  tFe = { class: "center-body" },
  nFe = { class: "center-text warn-text" },
  oFe = { class: "center-hint" },
  sFe = { class: "actions" },
  iFe = tt({
