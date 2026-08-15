    __name: "ChatPane",
    props: {
      turns: {},
      cwd: {},
      turnFilesInteractive: { type: Boolean, default: !0 },
      approvals: { default: () => [] },
      questions: { default: () => [] },
      turnActive: { type: Boolean, default: !1 },
      working: { type: Boolean, default: !1 },
      sessionLoading: { type: Boolean },
      compaction: { default: null },
      hasMoreMessages: { type: Boolean, default: !1 },
      loadingMore: { type: Boolean, default: !1 },
      loadingMoreError: { type: Boolean, default: !1 },
      isFollowing: { type: Boolean, default: !1 },
      readOnly: { type: Boolean, default: !1 },
      queued: { default: () => [] },
      undoHintTurnId: { default: null },
      interruptedTurnId: { default: null },
      turnFailed: { type: Boolean, default: !1 },
      turnError: { default: null },
      turnRetry: { default: null },
    },
    emits: [
      "openFile",
      "openMedia",
      "openTurnDiff",
      "copyConversationCopied",
      "openCompaction",
      "openAgent",
      "editMessage",
      "armedUndo",
      "loadOlderMessages",
      "unqueue",
      "editQueued",
      "reorderQueue",
      "resumeTurn",
    ],
    setup(e, { expose: t, emit: n }) {
      const { t: o } = Lt(),
        { confirm: s } = pu();
      kn(() => {
        (Y !== null && (clearTimeout(Y), (Y = null)),
          W !== null && (clearTimeout(W), (W = null)),
          B !== null && (clearTimeout(B), (B = null)),
          st !== null && (clearTimeout(st), (st = null)));
      });
      const i = e,
        r = Z(null);
      let l = null;
      function a() {
        !r.value ||
          typeof IntersectionObserver > "u" ||
          (l?.disconnect(),
          (l = new IntersectionObserver(
            (je) => {
              je[0]?.isIntersecting &&
                i.hasMoreMessages &&
                !i.loadingMore &&
                !i.loadingMoreError &&
                !i.sessionLoading &&
                !i.isFollowing &&
                m("loadOlderMessages");
            },
            { root: null, rootMargin: "200px 0px 0px 0px", threshold: 0 },
          )),
          l.observe(r.value));
      }
      (dn(a),
        kn(() => {
          (l?.disconnect(), (l = null));
        }),
        et(
          () => [i.hasMoreMessages, i.loadingMore, i.loadingMoreError],
          () => {
            yt().then(a);
          },
        ));
      const u = R(() => {
          if (!i.turnActive || i.turns.length === 0) return null;
          const je = i.turns.at(-1);
          return je.role === "assistant" ? je.id : null;
        }),
        c = R(() => {
          const je = new Map();
          for (const Ke of i.turns) {
            if (Ke.role !== "assistant" || Ke.id === u.value) continue;
            const Ze = rbe(Ke);
            Ze.length > 0 && je.set(Ke.id, Ze);
          }
          return je;
        }),
        d = R(() => i.working),
        f = R(() => {
          const je = i.turnRetry;
          if (je != null)
            return o("conversation.workingRetry", {
              n: je.nextAttempt,
              max: je.maxAttempts,
            });
          const Ke = i.turns.at(-1),
            Ze =
              Ke?.role === "assistant" &&
              (Ke.text.trim().length > 0 ||
                (Ke.thinking?.trim().length ?? 0) > 0 ||
                (Ke.tools?.length ?? 0) > 0);
          return o(Ze ? "conversation.working" : "conversation.requesting");
        }),
        h = R(() =>
          i.turnError?.code === "loop.max_steps_exceeded"
            ? o("conversation.turnFailedMaxSteps")
            : o("conversation.turnFailed"),
        ),
        g = R(() => {
          const je = i.turnError;
          if (!je) return "";
          const Ke = [];
          return (
            je.code !== void 0 && je.code.length > 0 && Ke.push(je.code),
            je.statusCode !== void 0 && Ke.push(`HTTP ${je.statusCode}`),
            je.requestId !== void 0 &&
              je.requestId.length > 0 &&
              Ke.push(je.requestId),
            Ke.join(" · ")
          );
        }),
        m = n,
        w = Z(null),
        _ = Z(null);
      function v(je) {
        return (je.attachments?.length ?? 0) > 0;
      }
      function k(je) {
        m("editQueued", je);
      }
      function y(je, Ke) {
        if (((w.value = je), !Ke.dataTransfer)) return;
        ((Ke.dataTransfer.effectAllowed = "move"),
          Ke.dataTransfer.setData("text/plain", String(je)));
        const Ze = Ke.currentTarget?.closest(".q-turn");
        Ze && Ke.dataTransfer.setDragImage(Ze, 24, 24);
      }
      function x(je, Ke) {
        if (w.value === null) return;
        (Ke.preventDefault(),
          Ke.dataTransfer && (Ke.dataTransfer.dropEffect = "move"));
        const Ze = Ke.currentTarget.getBoundingClientRect(),
          zt = Ke.clientY < Ze.top + Ze.height / 2 ? "before" : "after";
        _.value = { index: je, position: zt };
      }
      function M(je, Ke) {
        Ke.preventDefault();
        const Ze = w.value,
          zt = _.value?.position ?? "before";
        if (((w.value = null), (_.value = null), Ze === null)) return;
        let at = zt === "before" ? je : je + 1;
        (Ze < at && (at -= 1),
          Ze !== at && m("reorderQueue", { from: Ze, to: at }));
      }
      function $() {
        ((w.value = null), (_.value = null));
      }
      const S = R(() => {
        for (let je = i.turns.length - 1; je >= 0; je--) {
          const Ke = i.turns[je];
          if (Ke.goalContinuation) return null;
          if (Ke.role === "user") return Ke.id;
        }
        return null;
      });
      function I(je) {
        return (
          !i.readOnly &&
          je.role === "user" &&
          je.id === S.value &&
          !i.working &&
          !je.skillActivation &&
          !je.pluginCommand
        );
      }
      function P(je) {
        const Ke = je.compaction,
          Ze =
            Ke?.trigger === "auto"
              ? o("conversation.compactedAuto")
              : o("conversation.compactedPlain");
        return typeof Ke?.tokensBefore == "number" &&
          typeof Ke?.tokensAfter == "number"
          ? Ze +
              o("conversation.compactedTokens", {
                before: Ml(Ke.tokensBefore),
                after: Ml(Ke.tokensAfter),
              })
          : Ze;
      }
      const D = Z(null);
      function T(je) {
        return je.durationMs === void 0 ? "" : _c(je.durationMs);
      }
      const L = Z(null);
      let B = null;
      async function H(je) {
        (await s({
          title: o("conversation.undo"),
          message: o("conversation.undoConfirm"),
          variant: "primary",
        })) && O(je);
      }
      function O(je) {
        L.value === null &&
          ((L.value = je.id),
          m("editMessage", { text: je.text, attachments: je.attachments }),
          (B = setTimeout(() => {
            ((B = null), (L.value = null));
          }, Vxe)));
      }
      et(
        () => i.turns,
        (je) => {
          L.value !== null &&
            (je.some((Ke) => Ke.id === L.value) ||
              ((L.value = null), B !== null && (clearTimeout(B), (B = null))));
        },
        { flush: "post" },
      );
      const F = Z(!1);
      let W = null;
      function z() {
        if (i.turns.length === 0) return;
        const je = [];
        for (const Ze of i.turns) {
          if (Ze.role === "compaction" || Ze.role === "cron") continue;
          const zt = Ze.role === "user" ? "User" : "Assistant",
            at = tbe(Ze);
          at.trim() &&
            je.push(`**${zt}**

${at}`);
        }
        const Ke = je.join(`

---

`);
        js(Ke)
          .then((Ze) => {
            Ze &&
              ((F.value = !0),
              m("copyConversationCopied"),
              W !== null && clearTimeout(W),
              (W = setTimeout(() => {
                ((W = null), (F.value = !1));
              }, 2e3)));
          })
          .catch(() => {});
      }
      function U(je) {
        const Ke = [];
        for (let Ze = je; Ze >= 0; Ze--) {
          const zt = i.turns[Ze];
          if (!zt || zt.role !== "assistant") break;
          Ke.unshift(zt);
        }
        return Ke;
      }
      function q(je) {
        return U(je)
          .map((Ke) => ebe(Ke))
          .filter(Boolean).join(`

`);
      }
      function K() {
        for (let je = i.turns.length - 1; je >= 0; je -= 1)
          if (i.turns[je]?.role === "assistant") return q(je);
        return "";
      }
      function ie() {
        const je = K();
        je.trim() &&
          js(je)
            .then((Ke) => {
              Ke &&
                ((F.value = !0),
                m("copyConversationCopied"),
                W !== null && clearTimeout(W),
                (W = setTimeout(() => {
                  ((W = null), (F.value = !1));
                }, 2e3)));
            })
            .catch(() => {});
      }
      t({ copyConversation: z, copyFinalSummary: ie });
      function ne(je) {
        const Ke = i.turns[je];
        if (!Ke || Ke.role !== "assistant") return !1;
        const Ze = i.turns[je + 1];
        return !Ze || Ze.role !== "assistant";
      }
      let Y = null;
      function le(je) {
        const Ke = i.turns[je];
        if (!Ke) return;
        const Ze = q(je);
        Ze.trim() &&
          js(Ze)
            .then((zt) => {
              zt &&
                ((D.value = Ke.id),
                Y !== null && clearTimeout(Y),
                (Y = setTimeout(() => {
                  ((Y = null), (D.value = null));
                }, 1400)));
            })
            .catch(() => {});
      }
      function Ee(je) {
        const Ke = je.text;
        Ke.trim() &&
          js(Ke)
            .then((Ze) => {
              Ze &&
                ((D.value = je.id),
                Y !== null && clearTimeout(Y),
                (Y = setTimeout(() => {
                  ((Y = null), (D.value = null));
                }, 1400)));
            })
            .catch(() => {});
      }
      const de = Jo(new Set()),
        he = Jo(new Set()),
        pe = new Map(),
        oe = new WeakMap(),
        ve = on("pinScroll", () => {}),
        G = new ResizeObserver((je) => {
          for (const Ke of je) {
            const Ze = Ke.target,
              zt = oe.get(Ze);
            zt !== void 0 && X(zt, Ze);
          }
        });
      kn(() => G.disconnect());
      function X(je, Ke) {
        const Ze = parseFloat(getComputedStyle(Ke).lineHeight);
        if (!Number.isFinite(Ze) || Ze <= 0) return;
        const at = (Ke.textContent ?? "").match(/\n+$/)?.[0].length ?? 0;
        Ke.scrollHeight - Math.max(0, at - 1) * Ze > Ze * qxe + 1
          ? de.add(je)
          : de.delete(je);
      }
      function fe(je, Ke) {
        if (!(Ke instanceof HTMLElement) || pe.get(je) === Ke) return;
        const Ze = pe.get(je);
        (Ze !== void 0 && G.unobserve(Ze),
          pe.set(je, Ke),
          oe.set(Ke, je),
          G.observe(Ke),
          X(je, Ke));
      }
      function Ce(je) {
        return `queue:${je.id}`;
      }
      et([() => i.turns, () => i.queued], () => {
        const je = new Set(i.turns.map((Ke) => Ke.id));
        for (const Ke of i.queued) je.add(Ce(Ke));
        for (const [Ke, Ze] of pe)
          je.has(Ke) ||
            (G.unobserve(Ze), pe.delete(Ke), de.delete(Ke), he.delete(Ke));
      });
      function ge(je) {
        return je.skillActivation
          ? je.skillActivation.args || null
          : je.pluginCommand
            ? je.pluginCommand.args || null
            : je.text || null;
      }
      function Q(je) {
        return je.skillActivation !== void 0 || je.pluginCommand !== void 0;
      }
      function ee(je) {
        return de.has(je) && !he.has(je);
      }
      function ce(je, Ke) {
        const Ze = he.has(je);
        (Ze && Ke.currentTarget instanceof HTMLElement && ve(Ke.currentTarget),
          Ze ? he.delete(je) : he.add(je));
      }
      function ue(je) {
        return je.kind === "image" || je.kind === "video";
      }
      function Se(je) {
        return (je.attachments ?? []).filter(ue);
      }
      function Ue(je) {
        return (je.attachments ?? []).filter((Ke) => !ue(Ke));
      }
      function _e(je) {
        return {
          kind: je.kind === "video" ? "video" : "image",
          url: je.url,
          path: je.name,
          fileId: je.fileId,
        };
      }
      const Te = Z(null);
      let st = null;
      const Fe = Z(null),
        Oe = Z(null);
      function Ye(je, Ke) {
        if (je.kind === "image" || je.kind === "video") {
          ((Oe.value = Ke ?? null), (Fe.value = _e(je)));
          return;
        }
        je.fileId !== void 0 &&
          ZN(je.fileId, je.name, je.mediaType).then((Ze) => {
            Ze === "unsupported" &&
              ((Te.value = je.name ?? je.fileId ?? ""),
              st !== null && clearTimeout(st),
              (st = setTimeout(() => {
                ((st = null), (Te.value = null));
              }, 2400)));
          });
      }
      function ft(je, Ke) {
        return je.id !== u.value ||
          (Ke.kind === "thinking" && Ke.durationMs !== void 0)
          ? !1
          : Ke.sourceIndex === na(je).length - 1;
      }
      function $t(je, Ke) {
        if (je.id !== u.value) return !1;
        const Ze = Ke.items.at(-1);
        return Ze?.kind === "thinking" && Ze.durationMs !== void 0
          ? !1
          : Ze !== void 0 && Ze.sourceIndex === na(je).length - 1;
      }
      const Ht = { folded: [], visible: [] };
      function Yt(je) {
        return je.role !== "assistant" ? Ht : xN(je);
      }
      function _n(je) {
        if (je.id !== u.value) return null;
        const Ke = na(je),
          Ze = Ke.at(-1);
        if (Ze?.kind === "thinking" && Ze.durationMs !== void 0) return null;
        if (Ze?.kind === "tool" && Ze.tool.status === "running") {
          const zt = Ze.tool.id;
          if (
            i.approvals?.some((at) => at.toolCallId === zt) ||
            i.questions?.some((at) => at.toolCallId === zt)
          )
            return null;
        }
        return Ke.length - 1;
      }
      return (je, Ke) => (
        b(),
        A(
          Pe,
          null,
          [
            C("div", j_e, [
              e.sessionLoading
                ? (b(),
                  A("div", V_e, [
                    V(p(Ao), { size: "sm" }),
                    C("span", q_e, N(p(o)("conversation.loading")), 1),
                  ]))
                : e.turns.length === 0 &&
                    (!e.approvals || e.approvals.length === 0)
                  ? (b(), A("div", K_e))
                  : te("", !0),
              e.hasMoreMessages || e.loadingMore
                ? (b(),
                  A(
                    "div",
                    {
                      key: 2,
                      ref_key: "topSentinelRef",
                      ref: r,
                      class: Re([
                        "top-sentinel",
                        { "top-sentinel-loading": e.loadingMore },
                      ]),
                    },
                    [
                      e.loadingMore
                        ? (b(),
                          A("span", Z_e, [
                            V(p(Ao), { size: "sm" }),
                            Ve(" " + N(p(o)("conversation.loadingOlder")), 1),
                          ]))
                        : (b(),
                          A(
                            "button",
                            {
                              key: 0,
                              type: "button",
                              class: "top-sentinel-btn",
                              onClick:
                                Ke[0] ||
                                (Ke[0] = (Ze) => m("loadOlderMessages")),
                            },
                            N(p(o)("conversation.loadOlder")),
                            1,
                          )),
                    ],
                    2,
                  ))
                : te("", !0),
              (b(!0),
              A(
                Pe,
                null,
                pt(
                  e.turns,
                  (Ze, zt) => (
                    b(),
                    A(
                      Pe,
                      { key: Ze.id },
                      [
                        Ze.role === "user"
                          ? (b(),
                            A("div", G_e, [
                              C(
                                "div",
                                {
                                  class: Re([
                                    "u-bub turn-anchor",
                                    { undoing: L.value === Ze.id },
                                  ]),
                                  "data-turn-id": Ze.id,
                                },
                                [
                                  Se(Ze).length > 0
                                    ? (b(),
                                      A("div", X_e, [
                                        (b(!0),
                                        A(
                                          Pe,
                                          null,
                                          pt(
                                            Se(Ze),
                                            (at, tn) => (
                                              b(),
                                              me(
                                                jN,
                                                {
                                                  key: tn,
                                                  kind: at.kind,
                                                  name: at.name,
                                                  url: at.url,
                                                  "file-id": at.fileId,
                                                  onActivate: (Wt) =>
                                                    Ye(at, Wt),
                                                },
                                                null,
                                                8,
                                                [
                                                  "kind",
                                                  "name",
                                                  "url",
                                                  "file-id",
                                                  "onActivate",
                                                ],
                                              )
                                            ),
                                          ),
                                          128,
                                        )),
                                      ]))
                                    : te("", !0),
                                  Ue(Ze).length > 0
                                    ? (b(),
                                      A("div", J_e, [
                                        (b(!0),
                                        A(
                                          Pe,
                                          null,
                                          pt(
                                            Ue(Ze),
                                            (at, tn) => (
                                              b(),
                                              me(
                                                VN,
                                                {
                                                  key: tn,
                                                  kind: at.kind,
                                                  name: at.name,
                                                  url: at.url,
                                                  "file-id": at.fileId,
                                                  "media-type": at.mediaType,
                                                  size: at.size,
                                                  onActivate: (Wt) => Ye(at),
                                                },
                                                null,
                                                8,
                                                [
                                                  "kind",
                                                  "name",
                                                  "url",
                                                  "file-id",
                                                  "media-type",
                                                  "size",
                                                  "onActivate",
                                                ],
                                              )
                                            ),
                                          ),
                                          128,
                                        )),
                                      ]))
                                    : te("", !0),
                                  Ze.skillActivation
                                    ? (b(),
                                      A("div", Q_e, [
                                        C("div", exe, [
                                          Ke[14] ||
                                            (Ke[14] = C(
                                              "span",
                                              { class: "skill-act-arrow" },
                                              "▶",
                                              -1,
                                            )),
                                          C(
                                            "span",
                                            null,
                                            N(
                                              p(o)(
                                                "conversation.activatedSkill",
                                                {
                                                  name: Ze.skillActivation.name,
                                                },
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]),
                                      ]))
                                    : Ze.pluginCommand
                                      ? (b(),
                                        A("div", txe, [
                                          C("div", nxe, [
                                            Ke[15] ||
                                              (Ke[15] = C(
                                                "span",
                                                { class: "skill-act-arrow" },
                                                "▶",
                                                -1,
                                              )),
                                            C(
                                              "span",
                                              null,
                                              "/" +
                                                N(Ze.pluginCommand.pluginId) +
                                                ":" +
                                                N(Ze.pluginCommand.commandName),
                                              1,
                                            ),
                                          ]),
                                        ]))
                                      : te("", !0),
                                  ge(Ze) !== null
                                    ? (b(),
                                      A(
                                        "div",
                                        {
                                          key: 4,
                                          class: Re([
                                            "u-text-wrap",
                                            {
                                              "is-clamped": ee(Ze.id),
                                              "u-text-wrap-args": Q(Ze),
                                            },
                                          ]),
                                        },
                                        [
                                          C(
                                            "div",
                                            {
                                              class: Re(
                                                Q(Ze)
                                                  ? "skill-act-args"
                                                  : "u-text",
                                              ),
                                              ref_for: !0,
                                              ref: (at) => fe(Ze.id, at),
                                            },
                                            N(ge(Ze)),
                                            3,
                                          ),
                                          de.has(Ze.id)
                                            ? (b(),
                                              A(
                                                "button",
                                                {
                                                  key: 0,
                                                  type: "button",
                                                  class: "u-text-toggle",
                                                  "aria-expanded": !ee(Ze.id),
                                                  onClick: (at) =>
                                                    ce(Ze.id, at),
                                                },
                                                [
                                                  C(
                                                    "span",
                                                    null,
                                                    N(
                                                      ee(Ze.id)
                                                        ? p(o)(
                                                            "conversation.userMessage.expand",
                                                          )
                                                        : p(o)(
                                                            "conversation.userMessage.collapse",
                                                          ),
                                                    ),
                                                    1,
                                                  ),
                                                  V(p(Ie), {
                                                    class: "u-text-toggle-car",
                                                    name: "chevron-down",
                                                    size: "sm",
                                                    "aria-hidden": "true",
                                                  }),
                                                ],
                                                8,
                                                oxe,
                                              ))
                                            : te("", !0),
                                        ],
                                        2,
                                      ))
                                    : te("", !0),
                                ],
                                10,
                                Y_e,
                              ),
                              Ze.createdAt ||
                              I(Ze) ||
                              (!e.readOnly && e.undoHintTurnId === Ze.id)
                                ? (b(),
                                  A("div", sxe, [
                                    I(Ze) ||
                                    (!e.readOnly && e.undoHintTurnId === Ze.id)
                                      ? (b(),
                                        A(
                                          "div",
                                          {
                                            key: 0,
                                            class: Re([
                                              "u-edit-wrap",
                                              { undoing: L.value === Ze.id },
                                            ]),
                                          },
                                          [
                                            e.undoHintTurnId === Ze.id
                                              ? (b(),
                                                A(
                                                  "button",
                                                  {
                                                    key: 0,
                                                    type: "button",
                                                    class:
                                                      "u-edit u-edit-armed",
                                                    "aria-label": p(o)(
                                                      "conversation.undoTooltip",
                                                    ),
                                                    onClick: (at) =>
                                                      m("armedUndo", Ze.id),
                                                  },
                                                  [
                                                    V(p(Ie), {
                                                      name: "undo",
                                                      size: "sm",
                                                    }),
                                                    C("span", rxe, [
                                                      Ve(
                                                        N(
                                                          p(o)(
                                                            "conversation.escUndoHintPre",
                                                          ),
                                                        ),
                                                        1,
                                                      ),
                                                      V(p(sa), {
                                                        keys: ["Esc"],
                                                      }),
                                                      Ve(
                                                        N(
                                                          p(o)(
                                                            "conversation.escUndoHintPost",
                                                          ),
                                                        ),
                                                        1,
                                                      ),
                                                    ]),
                                                  ],
                                                  8,
                                                  ixe,
                                                ))
                                              : (b(),
                                                A(
                                                  "button",
                                                  {
                                                    key: 1,
                                                    type: "button",
                                                    class: "u-edit",
                                                    "aria-label": p(o)(
                                                      "conversation.undoTooltip",
                                                    ),
                                                    onClick: (at) => H(Ze),
                                                  },
                                                  [
                                                    V(p(Ie), {
                                                      name: "undo",
                                                      size: "sm",
                                                    }),
                                                  ],
                                                  8,
                                                  lxe,
                                                )),
                                          ],
                                          2,
                                        ))
                                      : te("", !0),
                                    Ze.text.trim().length > 0
                                      ? (b(),
                                        A(
                                          "button",
                                          {
                                            key: 1,
                                            type: "button",
                                            class: "u-copy",
                                            "aria-label":
                                              p(o)("filePreview.copy"),
                                            onClick: Et(
                                              (at) => Ee(Ze),
                                              ["stop"],
                                            ),
                                          },
                                          [
                                            D.value !== Ze.id
                                              ? (b(),
                                                me(p(Ie), {
                                                  key: 0,
                                                  name: "copy",
                                                  size: "sm",
                                                }))
                                              : (b(),
                                                me(p(Ie), {
                                                  key: 1,
                                                  name: "check",
                                                  size: "sm",
                                                })),
                                          ],
                                          8,
                                          axe,
                                        ))
                                      : te("", !0),
                                    Ze.createdAt
                                      ? (b(),
                                        me(
                                          Ng,
                                          { key: 2, time: Ze.createdAt },
                                          null,
                                          8,
                                          ["time"],
                                        ))
                                      : te("", !0),
                                  ]))
                                : te("", !0),
                            ]))
                          : Ze.role === "compaction"
                            ? (b(),
                              A(
                                "div",
                                {
                                  key: 1,
                                  class: "compact-divider turn-anchor",
                                  "data-turn-id": Ze.id,
                                  role: "separator",
                                },
                                [
                                  Ke[16] ||
                                    (Ke[16] = C(
                                      "span",
                                      {
                                        class: "cd-line",
                                        "aria-hidden": "true",
                                      },
                                      null,
                                      -1,
                                    )),
                                  Ze.text
                                    ? (b(),
                                      A(
                                        "button",
                                        {
                                          key: 0,
                                          type: "button",
                                          class: "cd-label cd-btn",
                                          onClick: (at) =>
                                            m("openCompaction", {
                                              turnId: Ze.id,
                                            }),
                                        },
                                        [
                                          C("span", null, N(P(Ze)), 1),
                                          C(
                                            "span",
                                            dxe,
                                            N(p(o)("conversation.viewSummary")),
                                            1,
                                          ),
                                        ],
                                        8,
                                        cxe,
                                      ))
                                    : (b(), A("span", fxe, N(P(Ze)), 1)),
                                  Ke[17] ||
                                    (Ke[17] = C(
                                      "span",
                                      {
                                        class: "cd-line",
                                        "aria-hidden": "true",
                                      },
                                      null,
                                      -1,
                                    )),
                                ],
                                8,
                                uxe,
                              ))
                            : Ze.role === "cron"
                              ? (b(),
                                me(
                                  nwe,
                                  {
                                    key: 2,
                                    text: Ze.text,
                                    cron: Ze.cron,
                                    "turn-id": Ze.id,
                                    "created-at": Ze.createdAt,
                                  },
                                  null,
                                  8,
                                  ["text", "cron", "turn-id", "created-at"],
                                ))
                              : (b(),
                                A(
                                  "div",
                                  {
                                    key: 3,
                                    class: "a-msg turn-anchor",
                                    "data-turn-id": Ze.id,
                                  },
                                  [
                                    Ze.goalContinuation
                                      ? (b(),
                                        A("div", hxe, [
                                          V(p(Ie), {
                                            name: "target",
                                            size: "sm",
                                            "aria-hidden": "true",
                                          }),
                                          C(
                                            "span",
                                            null,
                                            N(
                                              p(o)(
                                                "conversation.goal.continuation",
                                              ),
                                            ),
                                            1,
                                          ),
                                        ]))
                                      : te("", !0),
                                    Yt(Ze).folded.length > 0
                                      ? (b(),
                                        me(
                                          TCe,
                                          {
                                            key: 1,
                                            items: Yt(Ze).folded,
                                            mobile: "",
                                            "streaming-tail-index": _n(Ze),
                                            live: Ze.id === u.value,
                                            parked:
                                              Ze.id === u.value &&
                                              _n(Ze) === null,
                                            "seed-ms": p(Jke)(p(na)(Ze)),
                                            "created-ms": p(Bx)(Ze.createdAt),
                                            "ended-ms": p(Bx)(Ze.endedAt),
                                            "duration-ms": Ze.durationMs,
                                            onOpenMedia:
                                              Ke[1] ||
                                              (Ke[1] = (at) =>
                                                m("openMedia", at)),
                                            onOpenFile:
                                              Ke[2] ||
                                              (Ke[2] = (at) =>
                                                m("openFile", at)),
                                            onOpenAgent:
                                              Ke[3] ||
                                              (Ke[3] = (at) =>
                                                m("openAgent", at)),
                                          },
                                          null,
                                          8,
                                          [
                                            "items",
                                            "streaming-tail-index",
                                            "live",
                                            "parked",
                                            "seed-ms",
                                            "created-ms",
                                            "ended-ms",
                                            "duration-ms",
                                          ],
                                        ))
                                      : te("", !0),
                                    (b(!0),
                                    A(
                                      Pe,
                                      null,
                                      pt(
                                        Yt(Ze).visible,
                                        (at, tn) => (
                                          b(),
                                          A(
                                            Pe,
                                            { key: p(AN)(at, tn) },
                                            [
                                              at.kind === "thinking"
                                                ? (b(),
                                                  me(
                                                    X5,
                                                    {
                                                      key: 0,
                                                      text: at.thinking,
                                                      mobile: "",
                                                      streaming: ft(Ze, at),
                                                      "started-at":
                                                        at.startedAt,
                                                      "duration-ms":
                                                        at.durationMs,
                                                    },
                                                    null,
                                                    8,
                                                    [
                                                      "text",
                                                      "streaming",
                                                      "started-at",
                                                      "duration-ms",
                                                    ],
                                                  ))
                                                : at.kind === "text" && at.text
                                                  ? (b(),
                                                    A("div", mxe, [
                                                      V(
                                                        p(Ic),
                                                        {
                                                          text: at.text,
                                                          streaming: ft(Ze, at),
                                                          "open-file": (Wt) =>
                                                            m("openFile", Wt),
                                                        },
                                                        null,
                                                        8,
                                                        [
                                                          "text",
                                                          "streaming",
                                                          "open-file",
                                                        ],
                                                      ),
                                                    ]))
                                                  : at.kind === "activity-run"
                                                    ? (b(),
                                                      me(
                                                        NN,
                                                        {
                                                          key: 2,
                                                          items: at.items,
                                                          mobile: "",
                                                          streaming: $t(Ze, at),
                                                          onOpenMedia:
                                                            Ke[4] ||
                                                            (Ke[4] = (Wt) =>
                                                              m(
                                                                "openMedia",
                                                                Wt,
                                                              )),
                                                          onOpenFile:
                                                            Ke[5] ||
                                                            (Ke[5] = (Wt) =>
                                                              m(
                                                                "openFile",
                                                                Wt,
                                                              )),
                                                          onOpenAgent:
                                                            Ke[6] ||
                                                            (Ke[6] = (Wt) =>
                                                              m(
                                                                "openAgent",
                                                                Wt,
                                                              )),
                                                        },
                                                        null,
                                                        8,
                                                        ["items", "streaming"],
                                                      ))
                                                    : at.kind === "tool"
                                                      ? (b(),
                                                        me(
                                                          Y5,
                                                          {
                                                            key: 3,
                                                            tool: at.tool,
                                                            mobile: "",
                                                            onOpenMedia:
                                                              Ke[7] ||
                                                              (Ke[7] = (Wt) =>
                                                                m(
                                                                  "openMedia",
                                                                  Wt,
                                                                )),
                                                            onOpenFile:
                                                              Ke[8] ||
                                                              (Ke[8] = (Wt) =>
                                                                m(
                                                                  "openFile",
                                                                  Wt,
                                                                )),
                                                            onOpenAgent:
                                                              Ke[9] ||
                                                              (Ke[9] = (Wt) =>
                                                                m(
                                                                  "openAgent",
                                                                  Wt,
                                                                )),
                                                          },
                                                          null,
                                                          8,
                                                          ["tool"],
                                                        ))
                                                      : at.kind ===
                                                          "notification"
                                                        ? (b(),
                                                          me(
                                                            FN,
                                                            {
                                                              key: 4,
                                                              items: at.items,
                                                            },
                                                            null,
                                                            8,
                                                            ["items"],
                                                          ))
                                                        : te("", !0),
                                            ],
                                            64,
                                          )
                                        ),
                                      ),
                                      128,
                                    )),
                                    c.value.get(Ze.id)
                                      ? (b(),
                                        me(
                                          UCe,
                                          {
                                            key: 2,
                                            changes: c.value.get(Ze.id),
                                            cwd: i.cwd,
                                            interactive: e.turnFilesInteractive,
                                            onOpenDiff:
                                              Ke[10] ||
                                              (Ke[10] = (at) =>
                                                m("openTurnDiff", at)),
                                            onOpenFile:
                                              Ke[11] ||
                                              (Ke[11] = (at) =>
                                                m("openFile", at)),
                                          },
                                          null,
                                          8,
                                          ["changes", "cwd", "interactive"],
                                        ))
                                      : te("", !0),
                                    Ze.id !== u.value &&
                                    ne(zt) &&
                                    (q(zt).trim().length > 0 || T(Ze))
                                      ? (b(),
                                        A("div", gxe, [
                                          T(Ze)
                                            ? (b(), A("span", vxe, N(T(Ze)), 1))
                                            : te("", !0),
                                          q(zt).trim().length > 0
                                            ? (b(),
                                              A(
                                                "button",
                                                {
                                                  key: 1,
                                                  class: "a-cpbtn",
                                                  "aria-label":
                                                    p(o)("filePreview.copy"),
                                                  onClick: (at) => le(zt),
                                                },
                                                [
                                                  D.value !== Ze.id
                                                    ? (b(),
                                                      me(p(Ie), {
                                                        key: 0,
                                                        name: "copy",
                                                        size: "sm",
                                                      }))
                                                    : (b(),
                                                      me(p(Ie), {
                                                        key: 1,
                                                        name: "check",
                                                        size: "sm",
                                                      })),
                                                ],
                                                8,
                                                yxe,
                                              ))
                                            : te("", !0),
                                        ]))
                                      : te("", !0),
                                  ],
                                  8,
                                  pxe,
                                )),
                        Ze.role === "assistant" && Ze.id === e.interruptedTurnId
                          ? (b(),
                            A("div", kxe, [
                              Ke[18] ||
                                (Ke[18] = C(
                                  "span",
                                  { class: "cd-line", "aria-hidden": "true" },
                                  null,
                                  -1,
                                )),
                              C(
                                "span",
                                bxe,
                                N(p(o)("conversation.turnInterrupted")),
                                1,
                              ),
                              Ke[19] ||
                                (Ke[19] = C(
                                  "span",
                                  { class: "cd-line", "aria-hidden": "true" },
                                  null,
                                  -1,
                                )),
                            ]))
                          : te("", !0),
                      ],
                      64,
                    )
                  ),
                ),
                128,
              )),
              e.turnFailed
                ? (b(),
                  A("div", Cxe, [
                    C("span", wxe, [
                      V(p(Ie), { name: "alert-triangle", size: "sm" }),
                    ]),
                    C("div", _xe, [
                      C("span", xxe, N(h.value), 1),
                      e.turnError?.message
                        ? (b(),
                          A(
                            "span",
                            {
                              key: 0,
                              class: "tf-sub",
                              title: e.turnError.message,
                            },
                            N(e.turnError.message),
                            9,
                            Sxe,
                          ))
                        : te("", !0),
                      g.value
                        ? (b(),
                          A(
                            "span",
                            { key: 1, class: "tf-meta", title: g.value },
                            N(g.value),
                            9,
                            Axe,
                          ))
                        : te("", !0),
                    ]),
                    e.readOnly
                      ? te("", !0)
                      : (b(),
                        me(
                          p(Ft),
                          {
                            key: 0,
                            variant: "secondary",
                            size: "sm",
                            onClick:
                              Ke[12] || (Ke[12] = (Ze) => m("resumeTurn")),
                          },
                          {
                            default: ke(() => [
                              Ve(N(p(o)("conversation.turnFailedResume")), 1),
                            ]),
                            _: 1,
                          },
                        )),
                  ]))
                : te("", !0),
              e.compaction
                ? (b(),
                  me(
                    ZCe,
                    { key: 4, label: p(o)("conversation.compacting") },
                    null,
                    8,
                    ["label"],
                  ))
                : te("", !0),
              d.value
                ? (b(),
                  A("div", Mxe, [
                    V(KN, { label: f.value }, null, 8, ["label"]),
                  ]))
                : te("", !0),
              e.queued.length > 0
                ? (b(),
                  A("div", Txe, [
                    C("div", Exe, [
                      C("span", Ixe, [
                        V(p(Ie), { name: "mail", size: "sm" }),
                        Ve(" " + N(p(o)("composer.queueLabel")) + " · ", 1),
                        C("b", null, N(e.queued.length), 1),
                      ]),
                      C("span", Lxe, N(p(o)("composer.queueAutoDrain")), 1),
                    ]),
                    (b(!0),
                    A(
                      Pe,
                      null,
                      pt(
                        e.queued,
                        (Ze, zt) => (
                          b(),
                          A(
                            "div",
                            {
                              key: Ze.id,
                              class: Re([
                                "u-turn q-turn",
                                {
                                  "q-dragging": w.value === zt,
                                  "drop-before":
                                    _.value?.index === zt &&
                                    _.value.position === "before",
                                  "drop-after":
                                    _.value?.index === zt &&
                                    _.value.position === "after",
                                },
                              ]),
                              onDragover: (at) => x(zt, at),
                              onDrop: (at) => M(zt, at),
                            },
                            [
                              C("div", Nxe, [
                                C(
                                  "span",
                                  {
                                    class: "q-grip",
                                    title: p(o)("composer.queueDragTitle"),
                                    draggable: "true",
                                    onDragstart: (at) => y(zt, at),
                                    onDragend: $,
                                  },
                                  [V(p(Ie), { name: "grip", size: "sm" })],
                                  40,
                                  Fxe,
                                ),
                                C(
                                  "div",
                                  {
                                    class: Re([
                                      "q-clamp u-text-wrap",
                                      { "is-clamped": ee(Ce(Ze)) },
                                    ]),
                                  },
                                  [
                                    C(
                                      "button",
                                      {
                                        type: "button",
                                        class: "q-body",
                                        title: p(o)("composer.editQueued"),
                                        ref_for: !0,
                                        ref: (at) => fe(Ce(Ze), at),
                                        onClick: (at) => k(zt),
                                      },
                                      [
                                        Ze.text
                                          ? (b(), A("span", Oxe, N(Ze.text), 1))
                                          : (b(),
                                            A("span", Pxe, [
                                              V(p(Ie), {
                                                name: "file",
                                                size: "sm",
                                              }),
                                              Ve(
                                                " " +
                                                  N(
                                                    p(o)(
                                                      "composer.queuedAttachments",
                                                      {
                                                        n:
                                                          Ze.attachments
                                                            ?.length ?? 0,
                                                      },
                                                    ),
                                                  ),
                                                1,
                                              ),
                                            ])),
                                      ],
                                      8,
                                      Rxe,
                                    ),
                                    de.has(Ce(Ze))
                                      ? (b(),
                                        A(
                                          "button",
                                          {
                                            key: 0,
                                            type: "button",
                                            class: "u-text-toggle",
                                            "aria-expanded": !ee(Ce(Ze)),
                                            onClick: (at) => ce(Ce(Ze), at),
                                          },
                                          [
                                            C(
                                              "span",
                                              null,
                                              N(
                                                ee(Ce(Ze))
                                                  ? p(o)(
                                                      "conversation.userMessage.expand",
                                                    )
                                                  : p(o)(
                                                      "conversation.userMessage.collapse",
                                                    ),
                                              ),
                                              1,
                                            ),
                                            V(p(Ie), {
                                              class: "u-text-toggle-car",
                                              name: "chevron-down",
                                              size: "sm",
                                              "aria-hidden": "true",
                                            }),
                                          ],
                                          8,
                                          Dxe,
                                        ))
                                      : te("", !0),
                                  ],
                                  2,
                                ),
                                v(Ze)
                                  ? (b(),
                                    A("div", Bxe, [
                                      (b(!0),
                                      A(
                                        Pe,
                                        null,
                                        pt(
                                          Ze.attachments,
                                          (at, tn) => (
                                            b(),
                                            A(
                                              Pe,
                                              { key: tn },
                                              [
                                                at.kind === "file"
                                                  ? (b(),
                                                    A("span", Hxe, [
                                                      V(p(Ie), {
                                                        name: "file",
                                                        size: "sm",
                                                      }),
                                                      Ve(
                                                        " " +
                                                          N(
                                                            at.name ??
                                                              at.fileId,
                                                          ),
                                                        1,
                                                      ),
                                                    ]))
                                                  : (b(),
                                                    me(
                                                      s0,
                                                      {
                                                        key: 1,
                                                        url: at.url,
                                                        kind: at.kind,
                                                        "file-id": at.fileId,
                                                        "media-class": "q-img",
                                                        controls: !1,
                                                        muted: "",
                                                      },
                                                      null,
                                                      8,
                                                      [
                                                        "url",
                                                        "kind",
                                                        "file-id",
                                                      ],
                                                    )),
                                              ],
                                              64,
                                            )
                                          ),
                                        ),
                                        128,
                                      )),
                                    ]))
                                  : te("", !0),
                                zt === 0
                                  ? (b(),
                                    A(
                                      "span",
                                      zxe,
                                      N(p(o)("composer.queueNext")),
                                      1,
                                    ))
                                  : (b(), A("span", Wxe, "#" + N(zt + 1), 1)),
                                C(
                                  "button",
                                  {
                                    type: "button",
                                    class: "q-rm",
                                    "aria-label": p(o)("composer.remove"),
                                    onClick: Et(
                                      (at) => m("unqueue", zt),
                                      ["stop"],
                                    ),
                                  },
                                  [V(p(Ie), { name: "close", size: "sm" })],
                                  8,
                                  Uxe,
                                ),
                              ]),
                            ],
                            42,
                            $xe,
                          )
                        ),
                      ),
                      128,
                    )),
                  ]))
                : te("", !0),
            ]),
            Te.value !== null
              ? (b(),
                A(
                  "div",
                  jxe,
                  N(
                    p(o)("composer.attachmentOpenUnsupported", {
                      name: Te.value,
                    }),
                  ),
                  1,
                ))
              : te("", !0),
            Fe.value
              ? (b(),
                me(
                  UN,
                  {
                    key: 1,
                    media: Fe.value,
                    "origin-img": Oe.value,
                    onClose:
                      Ke[13] ||
                      (Ke[13] = (Ze) => {
                        ((Fe.value = null), (Oe.value = null));
                      }),
                  },
                  null,
                  8,
                  ["media", "origin-img"],
                ))
              : te("", !0),
          ],
          64,
        )
      );
    },
  }),
  J5 = ht(Kxe, [["__scopeId", "data-v-167cb739"]]),
  Zxe = { class: "ch-id" },
  Gxe = ["title"],
  Yxe = { key: 1, class: "ch-ws" },
  Xxe = { key: 2, class: "ch-sep" },
  Jxe = ["onKeydown"],
  Qxe = { class: "ch-ses" },
  eSe = { key: 0, class: "ch-pill ch-sync-pill" },
  tSe = { key: 0, class: "ch-ahead" },
  nSe = { key: 1, class: "ch-behind" },
  oSe = { key: 1, class: "ch-pill ch-diff-pill" },
  sSe = { key: 0, class: "ch-add" },
  iSe = { key: 1, class: "ch-del" },
  rSe = tt({
