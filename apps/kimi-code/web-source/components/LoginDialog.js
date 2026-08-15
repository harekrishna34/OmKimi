    __name: "LoginDialog",
    props: {
      onStartOAuthLogin: { type: Function },
      onPollOAuthLogin: { type: Function },
      onCancelOAuthLogin: { type: Function },
    },
    emits: ["success", "close"],
    setup(e, { emit: t }) {
      const { t: n } = Lt(),
        o = Z(!0),
        s = t,
        i = e,
        {
          step: r,
          pollError: l,
          flow: a,
          secondsLeft: u,
          startFlow: c,
          cancelFlow: d,
        } = lF({
          onStartOAuthLogin: i.onStartOAuthLogin,
          onPollOAuthLogin: i.onPollOAuthLogin,
          onCancelOAuthLogin: i.onCancelOAuthLogin,
          onSuccess: () => {
            (s("success"), s("close"));
          },
        }),
        f = Z(!1);
      dn(async () => {
        await c();
      });
      async function h() {
        !a.value ||
          !(await js(a.value.verificationUriComplete)) ||
          ((f.value = !0),
          setTimeout(() => {
            f.value = !1;
          }, 2e3));
      }
      async function g() {
        (d(), s("close"));
      }
      function m(w) {
        const _ = Math.floor(w / 60),
          v = w % 60;
        return `${_}:${String(v).padStart(2, "0")}`;
      }
      return (w, _) => (
        b(),
        me(
          p(ca),
          {
            open: o.value,
            "onUpdate:open": _[0] || (_[0] = (v) => (o.value = v)),
            title: p(n)("login.title"),
            "close-on-overlay": !1,
            onClose: g,
          },
          {
            default: ke(() => [
              p(r) === "starting"
                ? (b(),
                  A("div", DNe, [
                    V(p(Ao), { size: "md" }),
                    C("span", BNe, N(p(n)("login.starting")), 1),
                  ]))
                : p(r) === "device-code" && p(a)
                  ? (b(),
                    A("div", HNe, [
                      C("div", zNe, N(p(n)("login.lead")), 1),
                      C(
                        "a",
                        {
                          class: "nb-primary",
                          href: p(a).verificationUriComplete,
                          target: "_blank",
                          rel: "noopener noreferrer",
                        },
                        [
                          Ve(N(p(n)("login.authorizeInBrowser")) + " ", 1),
                          V(p(Ie), { name: "external-link", size: "sm" }),
                        ],
                        8,
                        WNe,
                      ),
                      C("div", UNe, [
                        C(
                          "span",
                          {
                            class: "nb-link",
                            title: p(a).verificationUriComplete,
                          },
                          N(p(a).verificationUriComplete),
                          9,
                          jNe,
                        ),
                        V(
                          p(Ft),
                          {
                            class: Re(["nb-copy", { "is-copied": f.value }]),
                            variant: "secondary",
                            size: "sm",
                            onClick: h,
                          },
                          {
                            default: ke(() => [
                              f.value
                                ? (b(),
                                  A(
                                    Pe,
                                    { key: 0 },
                                    [
                                      V(p(Ie), { name: "check", size: "sm" }),
                                      Ve(" " + N(p(n)("login.copied")), 1),
                                    ],
                                    64,
                                  ))
                                : (b(),
                                  A(
                                    Pe,
                                    { key: 1 },
                                    [
                                      V(p(Ie), { name: "copy", size: "sm" }),
                                      Ve(" " + N(p(n)("login.copyLink")), 1),
                                    ],
                                    64,
                                  )),
                            ]),
                            _: 1,
                          },
                          8,
                          ["class"],
                        ),
                      ]),
                      C("div", VNe, [
                        V(
                          p(Ao),
                          { size: "sm", label: p(n)("login.waitingAuth") },
                          null,
                          8,
                          ["label"],
                        ),
                        C("span", qNe, N(p(n)("login.waitingAutoClose")), 1),
                        C("span", KNe, N(m(p(u))), 1),
                      ]),
                    ]))
                  : p(r) === "success"
                    ? (b(),
                      A("div", ZNe, [
                        V(p(Bd), { kind: "success" }),
                        C("span", GNe, N(p(n)("login.success")), 1),
                        C("span", YNe, N(p(n)("login.successHint")), 1),
                      ]))
                    : p(r) === "expired"
                      ? (b(),
                        A(
                          Pe,
                          { key: 3 },
                          [
                            C("div", XNe, [
                              V(p(Bd), { kind: "expired" }),
                              C("span", JNe, N(p(n)("login.expiredTitle")), 1),
                              C("span", QNe, N(p(n)("login.expiredHint")), 1),
                            ]),
                            C("div", eFe, [
                              V(
                                p(Ft),
                                { variant: "primary", onClick: p(c) },
                                {
                                  default: ke(() => [
                                    Ve(N(p(n)("login.retry")), 1),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["onClick"],
                              ),
                              V(
                                p(Ft),
                                { variant: "secondary", onClick: g },
                                {
                                  default: ke(() => [
                                    Ve(N(p(n)("login.closeBtn")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                          ],
                          64,
                        ))
                      : p(r) === "error"
                        ? (b(),
                          A(
                            Pe,
                            { key: 4 },
                            [
                              C("div", tFe, [
                                V(p(Bd), { kind: "error" }),
                                C(
                                  "span",
                                  nFe,
                                  N(
                                    p(l)
                                      ? p(n)("login.pollErrorTitle")
                                      : p(n)("login.errorTitle"),
                                  ),
                                  1,
                                ),
                                C(
                                  "span",
                                  oFe,
                                  N(
                                    p(l)
                                      ? p(n)("login.pollErrorHint")
                                      : p(n)("login.errorHint"),
                                  ),
                                  1,
                                ),
                              ]),
                              C("div", sFe, [
                                V(
                                  p(Ft),
                                  { variant: "primary", onClick: p(c) },
                                  {
                                    default: ke(() => [
                                      Ve(N(p(n)("login.retry")), 1),
                                    ]),
                                    _: 1,
                                  },
                                  8,
                                  ["onClick"],
                                ),
                                V(
                                  p(Ft),
                                  { variant: "secondary", onClick: g },
                                  {
                                    default: ke(() => [
                                      Ve(N(p(n)("login.closeBtn")), 1),
                                    ]),
                                    _: 1,
                                  },
                                ),
                              ]),
                            ],
                            64,
                          ))
                        : te("", !0),
            ]),
            _: 1,
          },
          8,
          ["open", "title"],
        )
      );
    },
  }),
  rFe = ht(iFe, [["__scopeId", "data-v-aad4b9f1"]]),
  aF = tt({
