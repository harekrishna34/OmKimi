    __name: "SettingsDialog",
    props: {
      colorScheme: {},
      fontScale: {},
      initialTab: {},
      managedProviderStatus: {},
      managedUserInfo: {},
      onFetchUsage: { type: Function },
      notify: { type: Boolean },
      notifyPermission: {},
      notifySound: { type: Boolean },
      config: {},
      models: {},
      configSaving: { type: Boolean },
      serverVersion: {},
      experimentalFlags: {},
    },
    emits: [
      "setColorScheme",
      "setFontScale",
      "setNotify",
      "setNotifySound",
      "login",
      "logout",
      "updateConfig",
      "close",
    ],
    setup(e, { emit: t }) {
      const { t: n } = Lt(),
        o = e,
        s = t,
        i = R(() => o.managedProviderStatus === "authenticated"),
        r = R(() =>
          i.value
            ? o.managedUserInfo?.nickname || n("sidebar.defaultUserName")
            : n("sidebar.notSignedIn"),
        ),
        l = R(() => o.managedUserInfo?.userLevelName?.trim() ?? ""),
        a = Z(!1);
      et(
        () => o.managedUserInfo?.avatar,
        () => {
          a.value = !1;
        },
      );
      const u = R(() => !!o.managedUserInfo?.avatar && !a.value),
        c = R(() =>
          i.value ? n("settings.signedIn") : n("settings.signedOutHint"),
        ),
        d = Z(o.initialTab ?? "general"),
        f = Z(!1);
      let h = null;
      function g() {
        ((f.value = !0),
          h && clearTimeout(h),
          (h = setTimeout(() => {
            ((f.value = !1), (h = null));
          }, 900)));
      }
      const m = [
          { id: "general", labelKey: "settings.tabs.general", icon: "sliders" },
          { id: "agent", labelKey: "settings.tabs.agent", icon: "robot" },
          { id: "account", labelKey: "settings.tabs.account", icon: "user" },
          {
            id: "providers",
            labelKey: "settings.tabs.providers",
            icon: "bolt",
          },
          {
            id: "advanced",
            labelKey: "settings.tabs.advanced",
            icon: "microscope",
          },
          {
            id: "archived",
            labelKey: "settings.tabs.archived",
            icon: "archive",
          },
        ],
        w = Sfe(),
        _ = ["manual", "yolo", "auto"],
        v = {
          manual: "status.permissionManual",
          auto: "status.permissionAuto",
          yolo: "status.permissionYolo",
        },
        k = Z(null);
      rF(k);
      const { isConfirmOpen: y } = pu();
      function x(Fe) {
        Fe.key === "Escape" && !Fe.defaultPrevented && !y.value && s("close");
      }
      (dn(() => document.addEventListener("keydown", x)),
        kn(() => {
          (document.removeEventListener("keydown", x), h && clearTimeout(h));
        }));
      function M() {
        f$();
      }
      const $ = (() => {
          const Fe = "0.33.0".trim() ? "0.33.0" : "";
          let Oe = "";
          if ("2026-08-06T11:31:37.779Z".trim()) {
            const ft = new Date("2026-08-06T11:31:37.779Z");
            if (!Number.isNaN(ft.getTime())) {
              const $t = (Ht) => String(Ht).padStart(2, "0");
              Oe = `${ft.getFullYear()}-${$t(ft.getMonth() + 1)}-${$t(ft.getDate())} ${$t(ft.getHours())}:${$t(ft.getMinutes())}`;
            }
          }
          const Ye = Oe === "" ? Fe : `${Fe} · ${Oe}`;
          return Ye === "" ? "-" : Ye;
        })(),
        S = u$(),
        I = Z(!1),
        P = Z(null);
      async function D() {
        if (!I.value) {
          ((I.value = !0), (P.value = null));
          try {
            P.value = await S.check();
          } finally {
            I.value = !1;
          }
        }
      }
      const T = R(() => {
          const Fe = P.value;
          if (Fe === null) return "";
          switch (Fe.outcome) {
            case "available":
              return S.status.value.state === "downloaded"
                ? n("settings.updateCheckDownloaded", {
                    version: Fe.version ?? "",
                  })
                : S.autoDownload.value
                  ? n("settings.updateCheckAvailableAuto", {
                      version: Fe.version ?? "",
                    })
                  : n("settings.updateCheckAvailable", {
                      version: Fe.version ?? "",
                    });
            case "latest":
              return n("settings.updateCheckLatest");
            case "unsupported":
              return n("settings.updateCheckUnsupported");
            case "error":
              return n("settings.updateCheckFailed");
          }
        }),
        L = R(() => {
          const Fe = new Map();
          for (const Oe of o.models ?? [])
            Fe.set(Oe.id, {
              id: Oe.id,
              label: Oe.displayName ?? Oe.model ?? Oe.id,
              provider: Oe.provider,
            });
          for (const [Oe, Ye] of Object.entries(o.config?.models ?? {})) {
            if (Fe.has(Oe)) continue;
            const ft = F(Ye);
            Fe.set(Oe, { id: Oe, label: W(Oe, Ye, ft), provider: ft ?? Oe });
          }
          return Array.from(Fe.values());
        }),
        B = R(() => {
          const Fe = new Map();
          for (const Oe of L.value) {
            const Ye = Fe.get(Oe.provider) ?? [];
            (Ye.push(Oe), Fe.set(Oe.provider, Ye));
          }
          for (const Oe of Fe.values())
            Oe.sort((Ye, ft) => Ye.label.localeCompare(ft.label));
          return Array.from(Fe.entries())
            .toSorted(([Oe], [Ye]) => Oe.localeCompare(Ye))
            .map(([Oe, Ye]) => ({ provider: Oe, options: Ye }));
        }),
        H = R(() => {
          const Fe = B.value.flatMap((Oe) =>
            Oe.options.map((Ye) => ({
              value: Ye.id,
              label: Ye.label,
              group: Oe.provider,
            })),
          );
          return (
            o.config?.defaultModel ||
              Fe.unshift({
                value: "",
                label: n("settings.noDefaultModel"),
                group: "",
                disabled: !0,
              }),
            Fe
          );
        }),
        O = R(() => {
          const Fe = o.config?.defaultPermissionMode;
          return Fe === "auto" || Fe === "yolo" || Fe === "manual"
            ? Fe
            : "manual";
        });
      function F(Fe) {
        if (!Fe || typeof Fe != "object") return;
        const Oe = Fe;
        return typeof Oe.provider == "string" ? Oe.provider : void 0;
      }
      function W(Fe, Oe, Ye) {
        if (!Oe || typeof Oe != "object") return Fe;
        const ft = Oe,
          $t = typeof ft.model == "string" ? ft.model : void 0,
          Ht = Ye ?? F(Oe);
        return $t && Ht ? `${Fe} (${Ht}/${$t})` : $t ? `${Fe} (${$t})` : Fe;
      }
      function z(Fe) {
        return Fe === !0;
      }
      function U(Fe) {
        !Fe ||
          Fe === o.config?.defaultModel ||
          s("updateConfig", { defaultModel: Fe });
      }
      function q(Fe) {
        Fe !== O.value && s("updateConfig", { defaultPermissionMode: Fe });
      }
      const K = R(
          () =>
            (o.experimentalFlags?.["secondary-model"] ??
              o.config?.experimental?.["secondary-model"]) === !0,
        ),
        ie = R(() => o.config?.secondaryModel?.model ?? ""),
        ne = R(() => o.config?.secondaryModel?.defaultEffort ?? ""),
        Y = R(() =>
          Object.fromEntries((o.models ?? []).map((Fe) => [Fe.id, Fe])),
        );
      function le(Fe) {
        (Fe.model === ie.value && (Fe.effort ?? "") === ne.value) ||
          s("updateConfig", {
            secondaryModel: Fe.effort
              ? { model: Fe.model, defaultEffort: Fe.effort }
              : { model: Fe.model },
          });
      }
      function Ee(Fe) {
        const Oe = o.config?.[Fe];
        s("updateConfig", { [Fe]: !z(Oe) });
      }
      function de() {
        const Fe = o.config?.thinking;
        return !Fe || typeof Fe != "object" ? !0 : Fe.enabled !== !1;
      }
      function he() {
        s("updateConfig", { thinking: { enabled: !de() } });
      }
      function pe() {
        const Fe = o.config?.telemetry !== !1;
        s("updateConfig", { telemetry: !Fe });
      }
      function oe(Fe) {
        d.value = Fe;
      }
      const ve = hu(),
        G = R(() => i.value && ve.managedMembership.value === "free"),
        X = Z([]),
        fe = Z(!1),
        Ce = Z(!1),
        ge = Z(""),
        Q = Z("all"),
        ee = Z("archived-desc");
      async function ce() {
        if (!(fe.value || Ce.value)) {
          fe.value = !0;
          try {
            const Fe = [];
            let Oe;
            for (;;) {
              const Ye = await ve.loadArchivedSessions({
                beforeId: Oe,
                pageSize: VDe,
              });
              if ((Fe.push(...Ye.items), !Ye.hasMore || Ye.items.length === 0))
                break;
              const ft = Ye.items.at(-1)?.id;
              if (ft === void 0) break;
              Oe = ft;
            }
            ((X.value = Fe), (Ce.value = !0));
          } catch (Fe) {
            gl("loadAllArchived failed", Fe);
          } finally {
            fe.value = !1;
          }
        }
      }
      et(
        d,
        (Fe) => {
          Fe === "archived" && !Ce.value && ce();
        },
        { immediate: !0 },
      );
      const ue = R(() => {
          const Fe = new Set();
          for (const Oe of X.value) Fe.add(Oe.cwd);
          return Array.from(Fe).sort((Oe, Ye) => Oe.localeCompare(Ye));
        }),
        Se = R(() => [
          { value: "all", label: n("settings.archivedAllWorkspaces") },
          ...ue.value.map((Fe) => ({ value: Fe, label: Fe })),
        ]),
        Ue = R(() => {
          const Fe = ge.value.trim().toLowerCase();
          let Oe = X.value.filter((Ye) => Ye.archived === !0);
          return (
            Q.value !== "all" && (Oe = Oe.filter((Ye) => Ye.cwd === Q.value)),
            Fe && (Oe = Oe.filter((Ye) => Ye.title.toLowerCase().includes(Fe))),
            (Oe = Oe.slice()),
            ee.value === "archived-desc"
              ? Oe.sort((Ye, ft) => ft.updatedAt.localeCompare(Ye.updatedAt))
              : ee.value === "created-desc"
                ? Oe.sort((Ye, ft) => ft.createdAt.localeCompare(Ye.createdAt))
                : Oe.sort((Ye, ft) => Ye.title.localeCompare(ft.title, "zh")),
            Oe
          );
        }),
        _e = R(() => {
          const Fe = new Map();
          for (const Oe of Ue.value) {
            const Ye = Fe.get(Oe.cwd) ?? [];
            (Ye.push(Oe), Fe.set(Oe.cwd, Ye));
          }
          return Array.from(Fe.entries()).map(([Oe, Ye]) => ({
            cwd: Oe,
            items: Ye,
          }));
        });
      async function Te(Fe) {
        (await ve.restoreSession(Fe)) &&
          (X.value = X.value.filter((Ye) => Ye.id !== Fe));
      }
      function st(Fe) {
        const Oe = new Date(Fe);
        if (Number.isNaN(Oe.getTime())) return Fe;
        const Ye = (ft) => String(ft).padStart(2, "0");
        return `${Oe.getFullYear()}-${Ye(Oe.getMonth() + 1)}-${Ye(Oe.getDate())} ${Ye(Oe.getHours())}:${Ye(Oe.getMinutes())}`;
      }
      return (Fe, Oe) => (
        b(),
        me(
          p(ca),
          {
            open: !0,
            "close-on-esc": !1,
            "aria-label": p(n)("settings.title"),
            size: "xl",
            height: "fixed",
            padded: !1,
            level: "grouped",
            onClose: Oe[16] || (Oe[16] = (Ye) => s("close")),
          },
          {
            default: ke(() => [
              C(
                "div",
                { ref_key: "dialogRef", ref: k, class: "sd" },
                [
                  C(
                    "nav",
                    {
                      class: "settings-tabs",
                      role: "tablist",
                      "aria-label": p(n)("settings.title"),
                    },
                    [
                      C("header", EOe, [
                        C("h2", IOe, N(p(n)("settings.title")), 1),
                      ]),
                      C("div", LOe, [
                        (b(),
                        A(
                          Pe,
                          null,
                          pt(m, (Ye) =>
                            C(
                              "button",
                              {
                                key: Ye.id,
                                type: "button",
                                class: Re(["tab", { on: d.value === Ye.id }]),
                                role: "tab",
                                "aria-selected": d.value === Ye.id,
                                onClick: (ft) => oe(Ye.id),
                              },
                              [
                                V(
                                  p(Ie),
                                  { name: Ye.icon, size: "md" },
                                  null,
                                  8,
                                  ["name"],
                                ),
                                C("span", null, N(p(n)(Ye.labelKey)), 1),
                              ],
                              10,
                              $Oe,
                            ),
                          ),
                          64,
                        )),
                      ]),
                    ],
                    8,
                    TOe,
                  ),
                  C("section", NOe, [
                    C("header", FOe, [
                      V(
                        p(gn),
                        {
                          size: "sm",
                          label: p(n)("settings.close"),
                          onClick: Oe[0] || (Oe[0] = (Ye) => s("close")),
                        },
                        {
                          default: ke(() => [
                            V(p(Ie), { name: "close", size: "md" }),
                          ]),
                          _: 1,
                        },
                        8,
                        ["label"],
                      ),
                    ]),
                    C(
                      "div",
                      {
                        class: Re(["body", { scrolling: f.value }]),
                        onScroll: g,
                      },
                      [
                        In(
                          C(
                            "section",
                            ROe,
                            [
                              C("section", OOe, [
                                C("h3", POe, N(p(n)("settings.appearance")), 1),
                                C("div", DOe, [
                                  C("div", BOe, [
                                    C("span", HOe, [
                                      Ve(
                                        N(p(n)("theme.colorSchemeLabel")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        zOe,
                                        N(p(n)("settings.colorSchemeHint")),
                                        1,
                                      ),
                                    ]),
                                    V(
                                      p(bi),
                                      {
                                        "model-value": e.colorScheme,
                                        options: [
                                          {
                                            value: "light",
                                            label: p(n)("theme.light"),
                                            icon: "light-mode",
                                          },
                                          {
                                            value: "dark",
                                            label: p(n)("theme.dark"),
                                            icon: "dark-mode",
                                          },
                                          {
                                            value: "system",
                                            label: p(n)("theme.system"),
                                          },
                                        ],
                                        "onUpdate:modelValue":
                                          Oe[1] ||
                                          (Oe[1] = (Ye) =>
                                            s("setColorScheme", Ye)),
                                      },
                                      null,
                                      8,
                                      ["model-value", "options"],
                                    ),
                                  ]),
                                  C("div", WOe, [
                                    C("span", UOe, [
                                      Ve(N(p(n)("sidebar.language")) + " ", 1),
                                      C(
                                        "span",
                                        jOe,
                                        N(p(n)("settings.languageHint")),
                                        1,
                                      ),
                                    ]),
                                    V(aF),
                                  ]),
                                  C("div", VOe, [
                                    C("span", qOe, [
                                      Ve(
                                        N(p(n)("settings.uiFontSize")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        KOe,
                                        N(p(n)("settings.uiFontSizeHint")),
                                        1,
                                      ),
                                    ]),
                                    V(
                                      p(bi),
                                      {
                                        "model-value": e.fontScale,
                                        options: [
                                          { value: "small", label: "S" },
                                          { value: "medium", label: "M" },
                                          { value: "large", label: "L" },
                                          { value: "xlarge", label: "XL" },
                                        ],
                                        "aria-label": p(n)(
                                          "settings.uiFontSize",
                                        ),
                                        "onUpdate:modelValue":
                                          Oe[2] ||
                                          (Oe[2] = (Ye) =>
                                            s("setFontScale", Ye)),
                                      },
                                      null,
                                      8,
                                      ["model-value", "aria-label"],
                                    ),
                                  ]),
                                ]),
                              ]),
                              C("section", ZOe, [
                                C(
                                  "h3",
                                  GOe,
                                  N(p(n)("settings.notifications")),
                                  1,
                                ),
                                C("div", YOe, [
                                  C("div", XOe, [
                                    C("span", JOe, [
                                      Ve(
                                        N(p(n)("settings.notifyEnabled")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        QOe,
                                        N(p(n)("settings.notifyEnabledHint")),
                                        1,
                                      ),
                                      e.notifyPermission === "denied"
                                        ? (b(),
                                          A(
                                            "span",
                                            ePe,
                                            N(p(n)("settings.notifyDenied")),
                                            1,
                                          ))
                                        : te("", !0),
                                    ]),
                                    V(
                                      p(td),
                                      {
                                        "model-value": e.notify,
                                        disabled:
                                          e.notifyPermission === "denied",
                                        label: p(n)("settings.notifyEnabled"),
                                        "onUpdate:modelValue":
                                          Oe[3] ||
                                          (Oe[3] = (Ye) => s("setNotify", Ye)),
                                      },
                                      null,
                                      8,
                                      ["model-value", "disabled", "label"],
                                    ),
                                  ]),
                                  C("div", tPe, [
                                    C("span", nPe, [
                                      Ve(
                                        N(p(n)("settings.notifySound")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        oPe,
                                        N(p(n)("settings.notifySoundHint")),
                                        1,
                                      ),
                                    ]),
                                    V(
                                      p(td),
                                      {
                                        "model-value": e.notifySound,
                                        label: p(n)("settings.notifySound"),
                                        "onUpdate:modelValue":
                                          Oe[4] ||
                                          (Oe[4] = (Ye) =>
                                            s("setNotifySound", Ye)),
                                      },
                                      null,
                                      8,
                                      ["model-value", "label"],
                                    ),
                                  ]),
                                ]),
                              ]),
                            ],
                            512,
                          ),
                          [[Es, d.value === "general"]],
                        ),
                        In(
                          C(
                            "section",
                            sPe,
                            [
                              C("section", iPe, [
                                C("h3", rPe, N(p(n)("settings.account")), 1),
                                C("div", lPe, [
                                  C("div", aPe, [
                                    C("span", uPe, [
                                      u.value
                                        ? (b(),
                                          A(
                                            "img",
                                            {
                                              key: 0,
                                              src: o.managedUserInfo?.avatar,
                                              alt: "",
                                              onError:
                                                Oe[5] ||
                                                (Oe[5] = (Ye) =>
                                                  (a.value = !0)),
                                            },
                                            null,
                                            40,
                                            cPe,
                                          ))
                                        : (b(),
                                          me(p(Ie), {
                                            key: 1,
                                            name: "user",
                                            size: "md",
                                          })),
                                    ]),
                                    C("span", dPe, [
                                      C("span", fPe, [
                                        C("span", pPe, N(r.value), 1),
                                        l.value
                                          ? (b(),
                                            me(
                                              p(Vr),
                                              {
                                                key: 0,
                                                class: "account-level",
                                                variant: "neutral",
                                                size: "sm",
                                              },
                                              {
                                                default: ke(() => [
                                                  Ve(N(l.value), 1),
                                                ]),
                                                _: 1,
                                              },
                                            ))
                                          : te("", !0),
                                      ]),
                                      C("span", hPe, N(c.value), 1),
                                    ]),
                                    i.value
                                      ? (b(),
                                        me(
                                          p(Ft),
                                          {
                                            key: 0,
                                            variant: "danger-soft",
                                            size: "sm",
                                            onClick:
                                              Oe[6] ||
                                              (Oe[6] = (Ye) => s("logout")),
                                          },
                                          {
                                            default: ke(() => [
                                              Ve(N(p(n)("sidebar.signOut")), 1),
                                            ]),
                                            _: 1,
                                          },
                                        ))
                                      : (b(),
                                        me(
                                          p(Ft),
                                          {
                                            key: 1,
                                            variant: "primary",
                                            size: "sm",
                                            onClick:
                                              Oe[7] ||
                                              (Oe[7] = (Ye) => s("login")),
                                          },
                                          {
                                            default: ke(() => [
                                              Ve(N(p(n)("sidebar.signIn")), 1),
                                            ]),
                                            _: 1,
                                          },
                                        )),
                                  ]),
                                ]),
                              ]),
                              G.value
                                ? (b(), me(pF, { key: 0 }))
                                : i.value
                                  ? (b(),
                                    me(
                                      fOe,
                                      {
                                        key: 1,
                                        "on-fetch-usage": o.onFetchUsage,
                                      },
                                      null,
                                      8,
                                      ["on-fetch-usage"],
                                    ))
                                  : te("", !0),
                            ],
                            512,
                          ),
                          [[Es, d.value === "account"]],
                        ),
                        d.value === "providers"
                          ? (b(), A("section", mPe, [V(ARe)]))
                          : te("", !0),
                        In(
                          C(
                            "section",
                            gPe,
                            [
                              C("section", vPe, [
                                C("div", yPe, [
                                  C(
                                    "h3",
                                    kPe,
                                    N(p(n)("settings.agentDefaults")),
                                    1,
                                  ),
                                ]),
                                C("div", bPe, [
                                  e.config
                                    ? (b(),
                                      A(
                                        Pe,
                                        { key: 0 },
                                        [
                                          C("div", CPe, [
                                            C("span", wPe, [
                                              Ve(
                                                N(
                                                  p(n)("settings.defaultModel"),
                                                ) + " ",
                                                1,
                                              ),
                                              C(
                                                "span",
                                                _Pe,
                                                N(
                                                  p(n)(
                                                    "settings.defaultModelHint",
                                                  ),
                                                ),
                                                1,
                                              ),
                                            ]),
                                            B.value.length > 0
                                              ? (b(),
                                                A("div", xPe, [
                                                  V(
                                                    p(o3),
                                                    {
                                                      "model-value":
                                                        e.config.defaultModel ??
                                                        "",
                                                      options: H.value,
                                                      "aria-label": p(n)(
                                                        "settings.defaultModel",
                                                      ),
                                                      "onUpdate:modelValue": U,
                                                    },
                                                    null,
                                                    8,
                                                    [
                                                      "model-value",
                                                      "options",
                                                      "aria-label",
                                                    ],
                                                  ),
                                                ]))
                                              : (b(),
                                                A(
                                                  "span",
                                                  SPe,
                                                  N(
                                                    e.config.defaultModel ??
                                                      p(n)(
                                                        "settings.noDefaultModel",
                                                      ),
                                                  ),
                                                  1,
                                                )),
                                          ]),
                                          C("div", APe, [
                                            C("span", MPe, [
                                              Ve(
                                                N(
                                                  p(n)(
                                                    "settings.defaultPermission",
                                                  ),
                                                ) + " ",
                                                1,
                                              ),
                                              C(
                                                "span",
                                                TPe,
                                                N(
                                                  p(n)(
                                                    "settings.defaultPermissionHint",
                                                  ),
                                                ),
                                                1,
                                              ),
                                            ]),
                                            V(
                                              p(bi),
                                              {
                                                "model-value": O.value,
                                                options: _.map((Ye) => ({
                                                  value: Ye,
                                                  label: p(n)(v[Ye]),
                                                })),
                                                "onUpdate:modelValue":
                                                  Oe[8] ||
                                                  (Oe[8] = (Ye) => q(Ye)),
                                              },
                                              null,
                                              8,
                                              ["model-value", "options"],
                                            ),
                                          ]),
                                          C("div", EPe, [
                                            C("span", IPe, [
                                              Ve(
                                                N(
                                                  p(n)(
                                                    "settings.defaultThinking",
                                                  ),
                                                ) + " ",
                                                1,
                                              ),
                                              C(
                                                "span",
                                                LPe,
                                                N(
                                                  p(n)(
                                                    "settings.defaultThinkingHint",
                                                  ),
                                                ),
                                                1,
                                              ),
                                            ]),
                                            V(
                                              p(td),
                                              {
                                                "model-value": de(),
                                                label: p(n)(
                                                  "settings.defaultThinking",
                                                ),
                                                "onUpdate:modelValue":
                                                  Oe[9] ||
                                                  (Oe[9] = (Ye) => he()),
                                              },
                                              null,
                                              8,
                                              ["model-value", "label"],
                                            ),
                                          ]),
                                          C("div", $Pe, [
                                            C("span", NPe, [
                                              Ve(
                                                N(
                                                  p(n)(
                                                    "settings.defaultPlanMode",
                                                  ),
                                                ) + " ",
                                                1,
                                              ),
                                              C(
                                                "span",
                                                FPe,
                                                N(
                                                  p(n)(
                                                    "settings.defaultPlanModeHint",
                                                  ),
                                                ),
                                                1,
                                              ),
                                            ]),
                                            V(
                                              p(td),
                                              {
                                                "model-value": z(
                                                  e.config.defaultPlanMode,
                                                ),
                                                label: p(n)(
                                                  "settings.defaultPlanMode",
                                                ),
                                                "onUpdate:modelValue":
                                                  Oe[10] ||
                                                  (Oe[10] = (Ye) =>
                                                    Ee("defaultPlanMode")),
                                              },
                                              null,
                                              8,
                                              ["model-value", "label"],
                                            ),
                                          ]),
                                        ],
                                        64,
                                      ))
                                    : (b(),
                                      A(
                                        "div",
                                        RPe,
                                        N(p(n)("settings.configUnavailable")),
                                        1,
                                      )),
                                ]),
                              ]),
                              e.config && K.value
                                ? (b(),
                                  A("section", OPe, [
                                    C("div", PPe, [
                                      C(
                                        "h3",
                                        DPe,
                                        N(
                                          p(n)(
                                            "settings.secondaryModelSection",
                                          ),
                                        ),
                                        1,
                                      ),
                                    ]),
                                    C("div", BPe, [
                                      C("div", HPe, [
                                        C("span", zPe, [
                                          Ve(
                                            N(p(n)("settings.secondaryModel")) +
                                              " ",
                                            1,
                                          ),
                                          C(
                                            "span",
                                            WPe,
                                            N(
                                              p(n)(
                                                "settings.secondaryModelHint",
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]),
                                        B.value.length > 0
                                          ? (b(),
                                            A("div", UPe, [
                                              V(
                                                MOe,
                                                {
                                                  "model-value": ie.value,
                                                  effort: ne.value,
                                                  groups: B.value,
                                                  "model-info-by-id": Y.value,
                                                  onSelect: le,
                                                },
                                                null,
                                                8,
                                                [
                                                  "model-value",
                                                  "effort",
                                                  "groups",
                                                  "model-info-by-id",
                                                ],
                                              ),
                                            ]))
                                          : (b(),
                                            A(
                                              "span",
                                              jPe,
                                              N(
                                                ie.value ||
                                                  p(n)(
                                                    "settings.noSecondaryModel",
                                                  ),
                                              ),
                                              1,
                                            )),
                                      ]),
                                    ]),
                                  ]))
                                : te("", !0),
                            ],
                            512,
                          ),
                          [[Es, d.value === "agent"]],
                        ),
                        In(
                          C(
                            "section",
                            VPe,
                            [
                              C("section", qPe, [
                                C(
                                  "h3",
                                  KPe,
                                  N(p(n)("settings.versionAndUpdates")),
                                  1,
                                ),
                                C("div", ZPe, [
                                  C("div", GPe, [
                                    C("span", YPe, [
                                      Ve(
                                        N(p(n)("settings.appVersion")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        XPe,
                                        N(p(n)("settings.appVersionHint")),
                                        1,
                                      ),
                                    ]),
                                    C("span", JPe, N(p($)), 1),
                                  ]),
                                  C("div", QPe, [
                                    C("span", eDe, [
                                      Ve(
                                        N(p(n)("settings.serverVersion")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        tDe,
                                        N(p(n)("settings.serverVersionHint")),
                                        1,
                                      ),
                                    ]),
                                    C(
                                      "span",
                                      nDe,
                                      N(e.serverVersion || "-"),
                                      1,
                                    ),
                                  ]),
                                  C("div", oDe, [
                                    C("span", sDe, [
                                      Ve(
                                        N(p(n)("settings.serverAddress")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        iDe,
                                        N(p(n)("settings.serverAddressHint")),
                                        1,
                                      ),
                                    ]),
                                    C("span", rDe, N(p(w)), 1),
                                  ]),
                                  p(S).canCheck
                                    ? (b(),
                                      A("div", lDe, [
                                        C("span", aDe, [
                                          Ve(
                                            N(p(n)("settings.checkUpdate")) +
                                              " ",
                                            1,
                                          ),
                                          T.value
                                            ? (b(),
                                              A("span", uDe, N(T.value), 1))
                                            : (b(),
                                              A(
                                                "span",
                                                cDe,
                                                N(
                                                  p(n)(
                                                    "settings.checkUpdateHint",
                                                  ),
                                                ),
                                                1,
                                              )),
                                        ]),
                                        V(
                                          p(Ft),
                                          {
                                            variant: "secondary",
                                            size: "sm",
                                            disabled: I.value,
                                            onClick: D,
                                          },
                                          {
                                            default: ke(() => [
                                              Ve(
                                                N(
                                                  I.value
                                                    ? p(n)(
                                                        "settings.updateChecking",
                                                      )
                                                    : p(n)(
                                                        "settings.checkUpdateBtn",
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
                                      ]))
                                    : te("", !0),
                                  p(S).canToggleAutoDownload
                                    ? (b(),
                                      A("div", dDe, [
                                        C("span", fDe, [
                                          Ve(
                                            N(
                                              p(n)(
                                                "settings.autoDownloadUpdate",
                                              ),
                                            ) + " ",
                                            1,
                                          ),
                                          C(
                                            "span",
                                            pDe,
                                            N(
                                              p(n)(
                                                "settings.autoDownloadUpdateHint",
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]),
                                        V(
                                          p(td),
                                          {
                                            "model-value":
                                              p(S).autoDownload.value,
                                            label: p(n)(
                                              "settings.autoDownloadUpdate",
                                            ),
                                            "onUpdate:modelValue":
                                              Oe[11] ||
                                              (Oe[11] = (Ye) =>
                                                p(S).setAutoDownload(Ye)),
                                          },
                                          null,
                                          8,
                                          ["model-value", "label"],
                                        ),
                                      ]))
                                    : te("", !0),
                                ]),
                              ]),
                              e.config
                                ? (b(),
                                  A("section", hDe, [
                                    C(
                                      "h3",
                                      mDe,
                                      N(p(n)("settings.privacy")),
                                      1,
                                    ),
                                    C("div", gDe, [
                                      C("div", vDe, [
                                        C("span", yDe, [
                                          Ve(
                                            N(p(n)("settings.telemetry")) + " ",
                                            1,
                                          ),
                                          C(
                                            "span",
                                            kDe,
                                            N(p(n)("settings.telemetryHint")),
                                            1,
                                          ),
                                          C(
                                            "span",
                                            bDe,
                                            N(
                                              p(n)(
                                                "settings.telemetryRestartHint",
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]),
                                        V(
                                          p(td),
                                          {
                                            "model-value":
                                              e.config.telemetry !== !1,
                                            disabled: e.configSaving,
                                            label: p(n)("settings.telemetry"),
                                            "onUpdate:modelValue":
                                              Oe[12] || (Oe[12] = (Ye) => pe()),
                                          },
                                          null,
                                          8,
                                          ["model-value", "disabled", "label"],
                                        ),
                                      ]),
                                    ]),
                                  ]))
                                : te("", !0),
                              C("section", CDe, [
                                C(
                                  "h3",
                                  wDe,
                                  N(p(n)("settings.diagnostics")),
                                  1,
                                ),
                                C("div", _De, [
                                  C("div", xDe, [
                                    C("span", SDe, [
                                      Ve(
                                        N(p(n)("settings.exportLog")) + " ",
                                        1,
                                      ),
                                      C(
                                        "span",
                                        ADe,
                                        N(p(n)("settings.exportLogHint")),
                                        1,
                                      ),
                                      p(Qr)()
                                        ? te("", !0)
                                        : (b(),
                                          A(
                                            "span",
                                            MDe,
                                            N(p(n)("settings.logHint")),
                                            1,
                                          )),
                                    ]),
                                    V(
                                      p(Ft),
                                      {
                                        variant: "secondary",
                                        size: "sm",
                                        onClick: M,
                                      },
                                      {
                                        default: ke(() => [
                                          Ve(
                                            N(p(n)("settings.exportLogBtn")),
                                            1,
                                          ),
                                        ]),
                                        _: 1,
                                      },
                                    ),
                                  ]),
                                ]),
                              ]),
                            ],
                            512,
                          ),
                          [[Es, d.value === "advanced"]],
                        ),
                        In(
                          C(
                            "section",
                            TDe,
                            [
                              C("div", EDe, [
                                C(
                                  "h4",
                                  IDe,
                                  N(p(n)("settings.archivedTitle")),
                                  1,
                                ),
                                C(
                                  "p",
                                  LDe,
                                  N(p(n)("settings.archivedDesc")),
                                  1,
                                ),
                              ]),
                              C("div", $De, [
                                C("label", NDe, [
                                  Oe[17] ||
                                    (Oe[17] = C(
                                      "svg",
                                      {
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        "stroke-width": "1.8",
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                      },
                                      [
                                        C("circle", {
                                          cx: "11",
                                          cy: "11",
                                          r: "7",
                                        }),
                                        C("path", { d: "m21 21-4.3-4.3" }),
                                      ],
                                      -1,
                                    )),
                                  In(
                                    C(
                                      "input",
                                      {
                                        "onUpdate:modelValue":
                                          Oe[13] ||
                                          (Oe[13] = (Ye) => (ge.value = Ye)),
                                        placeholder: p(n)(
                                          "settings.archivedSearch",
                                        ),
                                      },
                                      null,
                                      8,
                                      FDe,
                                    ),
                                    [[ri, ge.value]],
                                  ),
                                ]),
                                V(
                                  p(o3),
                                  {
                                    "model-value": Q.value,
                                    options: Se.value,
                                    size: "sm",
                                    "aria-label": p(n)(
                                      "settings.archivedAllWorkspaces",
                                    ),
                                    "onUpdate:modelValue":
                                      Oe[14] ||
                                      (Oe[14] = (Ye) => (Q.value = Ye)),
                                  },
                                  null,
                                  8,
                                  ["model-value", "options", "aria-label"],
                                ),
                                V(
                                  p(bi),
                                  {
                                    size: "sm",
                                    "model-value": ee.value,
                                    options: [
                                      {
                                        value: "archived-desc",
                                        label: p(n)(
                                          "settings.archivedSortArchived",
                                        ),
                                        icon: "clock",
                                      },
                                      {
                                        value: "created-desc",
                                        label: p(n)(
                                          "settings.archivedSortCreated",
                                        ),
                                        icon: "calendar-schedule",
                                      },
                                      {
                                        value: "name-asc",
                                        label: p(n)(
                                          "settings.archivedSortName",
                                        ),
                                        icon: "sort",
                                      },
                                    ],
                                    "onUpdate:modelValue":
                                      Oe[15] ||
                                      (Oe[15] = (Ye) => (ee.value = Ye)),
                                  },
                                  null,
                                  8,
                                  ["model-value", "options"],
                                ),
                              ]),
                              fe.value
                                ? (b(),
                                  A(
                                    "div",
                                    RDe,
                                    N(p(n)("settings.archivedLoadingAll")),
                                    1,
                                  ))
                                : (b(),
                                  A(
                                    Pe,
                                    { key: 1 },
                                    [
                                      _e.value.length > 0
                                        ? (b(),
                                          A("div", ODe, [
                                            (b(!0),
                                            A(
                                              Pe,
                                              null,
                                              pt(
                                                _e.value,
                                                (Ye) => (
                                                  b(),
                                                  A(
                                                    "section",
                                                    {
                                                      key: Ye.cwd,
                                                      class: "archive-card",
                                                    },
                                                    [
                                                      C("div", PDe, [
                                                        V(p(Ie), {
                                                          name: "folder-closed",
                                                          size: "md",
                                                        }),
                                                        C(
                                                          "span",
                                                          DDe,
                                                          N(Ye.cwd),
                                                          1,
                                                        ),
                                                        C(
                                                          "span",
                                                          BDe,
                                                          N(
                                                            p(n)(
                                                              "settings.archivedSessionsCount",
                                                              {
                                                                count:
                                                                  Ye.items
                                                                    .length,
                                                              },
                                                            ),
                                                          ),
                                                          1,
                                                        ),
                                                      ]),
                                                      C("div", HDe, [
                                                        (b(!0),
                                                        A(
                                                          Pe,
                                                          null,
                                                          pt(
                                                            Ye.items,
                                                            (ft) => (
                                                              b(),
                                                              A(
                                                                "div",
                                                                {
                                                                  key: ft.id,
                                                                  class:
                                                                    "archive-row",
                                                                },
                                                                [
                                                                  C(
                                                                    "div",
                                                                    zDe,
                                                                    [
                                                                      C(
                                                                        "div",
                                                                        WDe,
                                                                        N(
                                                                          ft.title,
                                                                        ),
                                                                        1,
                                                                      ),
                                                                      C(
                                                                        "div",
                                                                        UDe,
                                                                        N(
                                                                          p(n)(
                                                                            "settings.archivedAt",
                                                                            {
                                                                              time: st(
                                                                                ft.updatedAt,
                                                                              ),
                                                                            },
                                                                          ),
                                                                        ),
                                                                        1,
                                                                      ),
                                                                    ],
                                                                  ),
                                                                  V(
                                                                    p(Ft),
                                                                    {
                                                                      variant:
                                                                        "secondary",
                                                                      size: "sm",
                                                                      onClick: (
                                                                        $t,
                                                                      ) =>
                                                                        Te(
                                                                          ft.id,
                                                                        ),
                                                                    },
                                                                    {
                                                                      default:
                                                                        ke(
                                                                          () => [
                                                                            V(
                                                                              p(
                                                                                Ie,
                                                                              ),
                                                                              {
                                                                                name: "undo",
                                                                                size: "sm",
                                                                              },
                                                                            ),
                                                                            C(
                                                                              "span",
                                                                              null,
                                                                              N(
                                                                                p(
                                                                                  n,
                                                                                )(
                                                                                  "settings.archivedRestore",
                                                                                ),
                                                                              ),
                                                                              1,
                                                                            ),
                                                                          ],
                                                                        ),
                                                                      _: 1,
                                                                    },
                                                                    8,
                                                                    ["onClick"],
                                                                  ),
                                                                ],
                                                              )
                                                            ),
                                                          ),
                                                          128,
                                                        )),
                                                      ]),
                                                    ],
                                                  )
                                                ),
                                              ),
                                              128,
                                            )),
                                          ]))
                                        : (b(),
                                          A(
                                            "div",
                                            jDe,
                                            N(
                                              X.value.length === 0
                                                ? p(n)("settings.archivedEmpty")
                                                : p(n)(
                                                    "settings.archivedNoMatch",
                                                  ),
                                            ),
                                            1,
                                          )),
                                    ],
                                    64,
                                  )),
                            ],
                            512,
                          ),
                          [[Es, d.value === "archived"]],
                        ),
                      ],
                      34,
                    ),
                  ]),
                ],
                512,
              ),
            ]),
            _: 1,
          },
          8,
          ["aria-label"],
        )
      );
    },
  }),
  KDe = ht(qDe, [["__scopeId", "data-v-1764f4b1"]]),
  ZDe = { class: "aw" },
  GDe = { class: "crumbbar" },
  YDe = { class: "crumbs" },
  XDe = { key: 0, class: "crumb-sep" },
  JDe = ["onClick"],
  QDe = { key: 0, class: "filterbar" },
  eBe = ["placeholder"],
  tBe = { class: "folder-list" },
  nBe = { key: 0, class: "fl-loading" },
  oBe = ["onClick"],
  sBe = { class: "folder-name search-rel" },
  iBe = { key: 0, class: "fl-empty" },
  rBe = { key: 1, class: "fl-loading" },
  lBe = ["onClick"],
  aBe = { class: "folder-name" },
  uBe = { key: 0, class: "fl-empty" },
  cBe = { class: "paste-row" },
  dBe = { class: "paste-input-wrap" },
  fBe = { key: 1, class: "add-error", role: "alert" },
  pBe = { class: "actions" },
  hBe = { class: "footer-hint" },
  mBe = 600,
  gBe = 6,
  pS = 150,
  vBe = tt({
