    __name: "Composer",
    props: {
      running: { type: Boolean, default: !1 },
      working: { type: Boolean, default: !1 },
      starting: { type: Boolean, default: !1 },
      sessionId: {},
      queued: { default: () => [] },
      searchFiles: { type: Function, default: void 0 },
      uploadImage: { type: Function, default: void 0 },
      status: {},
      thinking: {},
      planMode: { type: Boolean },
      swarmMode: { type: Boolean },
      goalMode: { type: Boolean },
      goal: {},
      activationBadges: {},
      models: { default: () => [] },
      authReady: { type: Boolean },
      managedSignedIn: { type: Boolean },
      managedMembership: {},
      starredIds: { default: () => [] },
      skills: { default: () => [] },
      hideContext: { type: Boolean },
    },
    emits: [
      "submit",
      "steer",
      "command",
      "interrupt",
      "setPermission",
      "setThinking",
      "togglePlan",
      "toggleSwarm",
      "toggleGoal",
      "openBtw",
      "createGoal",
      "controlGoal",
      "focusGoal",
      "focusSwarm",
      "compact",
      "pickModel",
      "selectModel",
      "login",
    ],
    setup(e, { expose: t, emit: n }) {
      const o = e,
        s = R(() =>
          o.starting
            ? r("composer.starting")
            : o.running
              ? r("composer.placeholderRunning")
              : o.goalMode
                ? r("status.goalPlaceholder")
                : r("composer.placeholder"),
        ),
        i = n,
        { t: r, locale: l } = Lt(),
        {
          text: a,
          textareaRef: u,
          autosize: c,
          loadForEdit: d,
          clearDraft: f,
        } = hMe({ sessionId: () => o.sessionId }),
        h = Z(!1);
      function g() {
        ((h.value = !h.value),
          yt(() => {
            (c(), v(), u.value?.focus());
          }));
      }
      function m() {
        h.value && ((h.value = !1), yt(c));
      }
      function w(J) {
        if (typeof getComputedStyle > "u") return rS;
        const we = Number.parseFloat(getComputedStyle(J).minHeight);
        return Number.isFinite(we) && we > 0 ? we : rS;
      }
      const _ = Z(!1);
      function v() {
        const J = u.value;
        _.value = !!J && J.scrollHeight > w(J);
      }
      (et(a, () => {
        yt(v);
      }),
        et(
          () => o.sessionId,
          () => {
            h.value = !1;
          },
        ));
      const k = dMe({
          text: a,
          textareaRef: u,
          autosize: c,
          sessionId: () => o.sessionId,
        }),
        {
          open: y,
          items: x,
          active: M,
          update: $,
          select: S,
        } = fMe({
          text: a,
          textareaRef: u,
          autosize: c,
          skills: () => o.skills,
          emitCommand: (J) => i("command", { cmd: J, attachments: [] }),
          historyPush: (J) => k.push(J),
          clearDraft: f,
        }),
        {
          open: I,
          items: P,
          active: D,
          loading: T,
          update: L,
          select: B,
        } = pMe({
          text: a,
          textareaRef: u,
          autosize: c,
          searchFiles: () => o.searchFiles,
        });
      function H() {
        (k.resetBrowsing(), $(), L());
      }
      function O(J) {
        const we = J.map((Tt) => (/\s/.test(Tt) ? `"${Tt}"` : Tt)).join(" "),
          $e = u.value,
          He = a.value,
          vt =
            $e && document.activeElement === $e ? $e.selectionStart : He.length,
          ut = vt > 0 && !/\s/.test(He[vt - 1]) ? " " : "",
          Pt = vt < He.length && !/\s/.test(He[vt]) ? " " : "";
        (k.resetBrowsing(),
          (a.value = He.slice(0, vt) + ut + we + Pt + He.slice(vt)),
          yt(() => {
            const Tt = u.value;
            if (!Tt) return;
            const ln = vt + ut.length + we.length;
            (Tt.setSelectionRange(ln, ln), Tt.focus(), c());
          }));
      }
      const {
          attachments: F,
          previewAttachment: W,
          fileInputRef: z,
          isDragOver: U,
          removeAttachment: q,
          openAttachmentPreview: K,
          closeAttachmentPreview: ie,
          openFilePicker: ne,
          handleFileInputChange: Y,
          handleDragOver: le,
          handleDragLeave: Ee,
          handleDrop: de,
          clearAfterSubmit: he,
          clearAttachments: pe,
          loadAttachments: oe,
        } = mMe({
          uploadImage: () => o.uploadImage,
          sessionId: () => o.sessionId,
          insertFolderPaths: O,
        }),
        ve = (J) => J.kind === "image" || J.kind === "video",
        G = R(() => F.value.filter(ve)),
        X = R(() => F.value.filter((J) => !ve(J))),
        fe = Z(null),
        Ce = Z(null),
        ge = Z(!1);
      function Q() {
        const J = fe.value,
          we = Ce.value;
        ge.value =
          J !== null && we !== null && we.scrollHeight > J.clientHeight + 1;
      }
      let ee = null;
      (et(
        fe,
        (J) => {
          if ((ee?.disconnect(), (ee = null), J)) {
            const we = new ResizeObserver(Q);
            (we.observe(J), (ee = we));
          }
          Q();
        },
        { immediate: !0 },
      ),
        et(F, () => void yt(Q), { deep: !0 }),
        kn(() => ee?.disconnect()));
      const ce = Z(null);
      (et(
        () => [G.value.length, X.value.length],
        ([J, we], [$e, He]) => {
          (J <= $e && we <= He) ||
            yt(() => {
              const vt = fe.value;
              vt &&
                (J > $e && ce.value
                  ? (vt.scrollTop = ce.value.offsetHeight - vt.clientHeight)
                  : (vt.scrollTop = vt.scrollHeight));
            });
        },
      ),
        dn(() => {
          a.value &&
            yt(() => {
              (c(), v());
            });
        }),
        kn(() => {
          (document.removeEventListener("mousedown", Lo), Ht());
        }));
      function ue() {
        u.value?.focus({ preventScroll: !0 });
      }
      function Se(J) {
        oe(J);
      }
      function Ue(J) {
        return {
          fileId: J.fileId,
          kind: J.kind,
          name: J.name,
          mediaType: J.mediaType,
          size: J.size,
        };
      }
      const _e = Z(null);
      function Te(J, we) {
        if (J.kind === "file") {
          J.fileId !== void 0 && ZN(J.fileId, J.name, J.mediaType);
          return;
        }
        ((_e.value = we ?? null), K(J));
      }
      const st = R(() => {
          const J = W.value;
          return !J || !J.previewUrl
            ? null
            : {
                kind: J.kind === "video" ? "video" : "image",
                url: J.previewUrl,
                path: J.name,
                fileId: J.previewUrl.startsWith("blob:") ? void 0 : J.fileId,
              };
        }),
        Fe = R(
          () =>
            !F.value.some((J) => J.uploading) &&
            (a.value.trim() !== "" ||
              F.value.some((J) => !J.error && J.fileId)),
        );
      function Oe() {
        const J = a.value.trim();
        if (F.value.some((He) => He.uploading)) return;
        const we = F.value.filter(
          (He) => !He.uploading && !He.error && He.fileId,
        );
        if (!J && we.length === 0) return;
        if ((k.push(J), J)) {
          const He = lMe(J),
            vt = He
              ? nF(o.skills).find(
                  (ut) =>
                    ut.name === He.cmd ||
                    ut.name === `/${Og}${He.cmd.slice(1)}`,
                )
              : void 0;
          if (He && vt) {
            const ut = He.arg ? `${He.cmd} ${He.arg}` : He.cmd,
              Pt = vt.isSkill === !0;
            ((a.value = ""),
              f(),
              (y.value = !1),
              m(),
              Pt
                ? ((W.value = null),
                  (_e.value = null),
                  he(),
                  (I.value = !1),
                  i("command", {
                    cmd: ut,
                    attachments: we.map((Tt) => Ue(Tt)),
                  }))
                : i("command", { cmd: ut, attachments: [] }));
            return;
          }
        }
        const $e = { text: J, attachments: we.map((He) => Ue(He)) };
        ((W.value = null),
          (_e.value = null),
          he(),
          (a.value = ""),
          f(),
          (y.value = !1),
          (I.value = !1),
          m(),
          i("submit", $e));
      }
      function Ye() {
        if (!o.running || F.value.some((He) => He.uploading)) return;
        const J = a.value.trim(),
          we = F.value.filter((He) => !He.uploading && !He.error && He.fileId);
        if (!J && we.length === 0 && o.queued.length === 0) return;
        const $e = { text: J, attachments: we.map((He) => Ue(He)) };
        (he(),
          k.push(J),
          (a.value = ""),
          f(),
          (y.value = !1),
          (I.value = !1),
          m(),
          i("steer", $e));
      }
      let ft = !1,
        $t = null;
      function Ht() {
        $t !== null && (clearTimeout($t), ($t = null));
      }
      function Yt() {
        (Ht(), (ft = !0));
      }
      function _n() {
        (Ht(),
          ($t = setTimeout(() => {
            (($t = null), (ft = !1));
          }, 0)));
      }
      function je(J) {
        return ft || J.isComposing || J.keyCode === 229;
      }
      function Ke(J) {
        if (!je(J)) {
          if (J.key === "Escape") {
            if (at.value) {
              (J.preventDefault(), Mn());
              return;
            }
            if (tn.value) {
              (J.preventDefault(), Do());
              return;
            }
          }
          if (y.value) {
            if (J.key === "ArrowDown") {
              (J.preventDefault(), (M.value = (M.value + 1) % x.value.length));
              return;
            }
            if (J.key === "ArrowUp") {
              (J.preventDefault(),
                (M.value = (M.value - 1 + x.value.length) % x.value.length));
              return;
            }
            if (J.key === "Enter" || J.key === "Tab") {
              J.preventDefault();
              const we = x.value[M.value];
              we && S(we);
              return;
            }
            if (J.key === "Escape") {
              (J.preventDefault(), (y.value = !1));
              return;
            }
          }
          if (I.value && !T.value) {
            if (J.key === "Escape") {
              (J.preventDefault(), (I.value = !1));
              return;
            }
            if (P.value.length > 0) {
              if (J.key === "ArrowDown") {
                (J.preventDefault(),
                  (D.value = (D.value + 1) % P.value.length));
                return;
              }
              if (J.key === "ArrowUp") {
                (J.preventDefault(),
                  (D.value = (D.value - 1 + P.value.length) % P.value.length));
                return;
              }
              if (J.key === "Enter" || J.key === "Tab") {
                J.preventDefault();
                const we = P.value[D.value];
                we && B(we);
                return;
              }
            }
          }
          if (
            J.key === "s" &&
            (J.ctrlKey || J.metaKey) &&
            !J.shiftKey &&
            !J.altKey
          ) {
            o.running && (J.preventDefault(), Ye());
            return;
          }
          if (
            !h.value &&
            !y.value &&
            !I.value &&
            !J.shiftKey &&
            !J.altKey &&
            !J.metaKey &&
            !J.ctrlKey
          ) {
            const we = k.isBrowsing();
            if (
              J.key === "ArrowUp" &&
              k.hasHistory() &&
              (we || k.caretAtTextStart())
            ) {
              (J.preventDefault(), k.recallOlder());
              return;
            }
            if (J.key === "ArrowDown" && we) {
              (J.preventDefault(), k.recallNewer());
              return;
            }
          }
          if (J.key === "Enter" && !J.shiftKey) {
            if (h.value && !(J.metaKey || J.ctrlKey)) return;
            (J.preventDefault(), Oe());
          }
        }
      }
      const Ze = R(() => r("composer.send")),
        zt = R(() => !!o.uploadImage),
        at = Z(!1),
        tn = Z(!1),
        Wt = Z(!1),
        fn = Z(null),
        Sn = Z(null),
        to = Z(null),
        An = Z(""),
        ao = R(() => {
          const J = {};
          return (An.value && (J.right = An.value), J);
        }),
        Kt = R(() => at.value || tn.value || Wt.value || y.value || I.value);
      t({
        loadForEdit: d,
        loadAttachmentsForEdit: Se,
        focus: ue,
        anyPopupOpen: Kt,
        isEmpty: () => a.value.trim().length === 0 && F.value.length === 0,
      });
      function Po() {
        ((at.value = !at.value),
          at.value
            ? (Tr(),
              (tn.value = !1),
              zo(),
              document.addEventListener("click", po, !0))
            : document.removeEventListener("click", po, !0));
      }
      function Mn() {
        ((at.value = !1),
          tn.value || document.removeEventListener("click", po, !0));
      }
      function bn() {
        ((tn.value = !tn.value),
          tn.value
            ? (cr(),
              (at.value = !1),
              zo(),
              document.addEventListener("click", po, !0))
            : document.removeEventListener("click", po, !0));
      }
      function Do() {
        ((tn.value = !1),
          at.value || document.removeEventListener("click", po, !0));
      }
      function po(J) {
        fn.value && !fn.value.contains(J.target) && (Mn(), Do());
      }
      kn(() => {
        document.removeEventListener("click", po, !0);
      });
      const At = R(() => {
          const J = o.status?.ctxMax ?? 0;
          return J <= 0
            ? 0
            : Math.min(
                100,
                Math.max(0, Math.ceil(((o.status?.ctxUsed ?? 0) / J) * 100)),
              );
        }),
        qs = R(() => {
          const J = Ml(o.status?.ctxUsed ?? 0),
            we = Ml(o.status?.ctxMax ?? 0);
          return r("status.ctxTooltip", { used: J, max: we, pct: At.value });
        }),
        Bo = R(() => At.value >= 80),
        To = R(() => o.models?.find((J) => J.id === o.status?.modelId)),
        ai = R(() => $2(To.value)),
        Tn = R(() => Jp(To.value)),
        no = R(() => bg(To.value, o.thinking)),
        Ks = R(() => (Tn.value.includes(no.value) ? no.value : "")),
        ps = R(() => X2e(no.value)),
        ui = R(() => ai.value === "unsupported" || Tn.value.length <= 1),
        $s = R(() => {
          if (!ps.value) return "";
          const J = (To.value?.supportEfforts?.length ?? 0) > 0,
            we = no.value;
          return J && we !== "on"
            ? r("composer.thinkingSuffixEffort", { level: we })
            : r("composer.thinkingSuffix");
        });
      function yo(J) {
        ui.value || i("setThinking", E5(To.value, J));
      }
      function oo(J) {
        return J === "on"
          ? r("status.thinkingOn")
          : J === "off"
            ? r("status.thinkingOff")
            : oy(J);
      }
      const uo = R(() => Tn.value.map((J) => ({ value: J, label: oo(J) }))),
        Xn = R(() => o.planMode === !0),
        co = R(() => o.swarmMode === !0),
        Qe = R(
          () => o.goal?.status ?? o.activationBadges?.goal?.status ?? null,
        ),
        it = R(() => Qe.value !== null && Qe.value !== "complete"),
        Ct = R(() => it.value || o.goalMode === !0),
        en = R(() => Qe.value === "active"),
        yn = R(() => Qe.value === "paused" || Qe.value === "blocked"),
        Ho = Z(null),
        Eo = Z(null),
        Io = Z({}),
        Zs = R(() => Xn.value || co.value || Ct.value);
      function zo() {
        ((Wt.value = !1), document.removeEventListener("mousedown", Lo));
      }
      function Lo(J) {
        const we = J.target;
        Ho.value?.contains(we) || Eo.value?.contains(we) || zo();
      }
      function Wo() {
        if (Wt.value) {
          zo();
          return;
        }
        (Mn(), Do());
        const J = Ho.value?.getBoundingClientRect();
        (J &&
          (Io.value = {
            left: `${Math.round(J.left)}px`,
            bottom: `${Math.round(window.innerHeight - J.top + 8)}px`,
          }),
          (Wt.value = !0),
          setTimeout(() => document.addEventListener("mousedown", Lo), 0));
      }
      const sn = [
          {
            mode: "manual",
            icon: "hand",
            color: "var(--color-text)",
            labelKey: "status.permissionManual",
            descKey: "status.permissionManualDesc",
          },
          {
            mode: "yolo",
            icon: "shield-question",
            color: "var(--color-warning)",
            labelKey: "status.permissionYolo",
            descKey: "status.permissionYoloDesc",
          },
          {
            mode: "auto",
            icon: "full-access",
            color: "var(--color-danger)",
            labelKey: "status.permissionAuto",
            descKey: "status.permissionAutoDesc",
          },
        ],
        ws = ["status.planDesc", "status.swarmDesc", "status.goalDesc"],
        Uo = Z(null),
        Mr = Z(""),
        Gs = Z(""),
        Vi = Z("");
      function Ys(J) {
        const we = {};
        return (J && (we["--composer-menu-desc-width"] = J), we);
      }
      const jo = R(() => ({
          ...Ys(Mr.value),
          ...(Gs.value ? { left: Gs.value } : {}),
        })),
        Vo = R(() => Ys(Vi.value)),
        Il = R(() => ({ ...Io.value, ...Vo.value }));
      function cr() {
        const J = Sn.value,
          we = fn.value;
        if (!J || !we) {
          Gs.value = "";
          return;
        }
        Gs.value = `${Math.round(J.getBoundingClientRect().left - we.getBoundingClientRect().left)}px`;
      }
      function Tr() {
        const J = to.value,
          we = fn.value;
        if (!J || !we) {
          An.value = "";
          return;
        }
        An.value = `${Math.round(we.getBoundingClientRect().right - J.getBoundingClientRect().right)}px`;
      }
      let ho = null;
      function ko(J) {
        const we = Number.parseFloat(J);
        return Number.isFinite(we) ? we : 0;
      }
      function qi(J) {
        return `${J.fontStyle || "normal"} ${J.fontWeight || "400"} ${J.fontSize} ${J.fontFamily}`;
      }
      function gt(J) {
        return J.letterSpacing === "normal" ? 0 : ko(J.letterSpacing);
      }
      function Le(J, we) {
        if (!J) return 0;
        const $e = jAe(J, qi(we), { letterSpacing: gt(we) });
        return VAe($e);
      }
      function Ge() {
        const J = Uo.value?.querySelector(".pd-desc");
        if (!J) return;
        const we = getComputedStyle(J),
          $e = Math.max(0, ...sn.map((vt) => Le(r(vt.descKey), we))),
          He = Math.max(0, ...ws.map((vt) => Le(r(vt), we)));
        ((Mr.value = $e > 0 ? `${Math.ceil($e)}px` : ""),
          (Vi.value = He > 0 ? `${Math.ceil(He)}px` : ""));
      }
      function Xt() {
        typeof window > "u" ||
          (ho !== null && window.cancelAnimationFrame(ho),
          yt(() => {
            ho = window.requestAnimationFrame(() => {
              ((ho = null), Ge());
            });
          }));
      }
      (et(l, Xt, { immediate: !0 }),
        dn(() => {
          (Xt(), document.fonts?.ready.then(Xt));
        }),
        kn(() => {
          ho !== null && (window.cancelAnimationFrame(ho), (ho = null));
        }));
      function hs(J) {
        (i("setPermission", J), Do());
      }
      const ts = R(() => sn.find((J) => J.mode === o.status?.permission)),
        Ll = R(() => (ts.value ? r(ts.value.labelKey) : "")),
        tl = R(() => ts.value?.icon ?? "hand"),
        Mi = R(() => To.value?.provider ?? ""),
        fo = R(() =>
          !Mi.value || !o.models?.length
            ? []
            : o.models.filter((J) => J.provider === Mi.value),
        ),
        Ki = R(() => (o.models?.length ?? 0) > 0),
        Er = R(() => o.authReady === !1 && !Ki.value),
        ci = R(() => Er.value && !(o.managedSignedIn ?? !1)),
        $l = R(
          () =>
            Er.value &&
            (o.managedSignedIn ?? !1) &&
            o.managedMembership === "free",
        ),
        qo = R(() => new Set(o.starredIds ?? []));
      function Ir(J) {
        return qo.value.has(J);
      }
      const Xs = R(() =>
          o.models?.length
            ? o.models.filter((J) => Ir(J.id) && J.provider !== Mi.value)
            : [],
        ),
        di = Z(null);
      et(at, async (J) => {
        if (!J) return;
        (await yt(),
          (
            di.value?.querySelector(".md-row.is-current") ??
            di.value?.querySelector(".md-row")
          )?.focus());
      });
      function se(J) {
        if (J.key !== "ArrowDown" && J.key !== "ArrowUp") return;
        const we = Array.from(
          di.value?.querySelectorAll(".md-row:not(:disabled)") ?? [],
        );
        if (!we.length) return;
        J.preventDefault();
        const $e = we.indexOf(document.activeElement),
          He =
            J.key === "ArrowDown"
              ? ($e + 1) % we.length
              : ($e - 1 + we.length) % we.length;
        we[He]?.focus();
      }
      function xe(J) {
        (i("selectModel", J), Mn());
      }
      return (J, we) => (
        b(),
        A(
          "div",
          {
            class: Re(["composer", { "drag-over": p(U), expanded: h.value }]),
            onDragover: we[19] || (we[19] = (...$e) => p(le) && p(le)(...$e)),
            onDragleave: we[20] || (we[20] = (...$e) => p(Ee) && p(Ee)(...$e)),
            onDrop: we[21] || (we[21] = (...$e) => p(de) && p(de)(...$e)),
          },
          [
            st.value
              ? (b(),
                me(
                  UN,
                  {
                    key: 0,
                    media: st.value,
                    "origin-img": _e.value,
                    onClose:
                      we[0] ||
                      (we[0] = ($e) => {
                        ((_e.value = null), p(ie)());
                      }),
                  },
                  null,
                  8,
                  ["media", "origin-img"],
                ))
              : te("", !0),
            C("div", gMe, [
              p(F).length > 0
                ? (b(),
                  A("div", vMe, [
                    C(
                      "div",
                      {
                        ref_key: "attScrollRef",
                        ref: fe,
                        class: Re([
                          "att-scroll",
                          { "is-overflowing": ge.value },
                        ]),
                      },
                      [
                        C(
                          "div",
                          {
                            ref_key: "attScrollContentRef",
                            ref: Ce,
                            class: "att-scroll-content",
                          },
                          [
                            G.value.length > 0
                              ? (b(),
                                A(
                                  "div",
                                  {
                                    key: 0,
                                    ref_key: "attMediaRowRef",
                                    ref: ce,
                                    class: "att-row att-row-media",
                                  },
                                  [
                                    (b(!0),
                                    A(
                                      Pe,
                                      null,
                                      pt(
                                        G.value,
                                        ($e) => (
                                          b(),
                                          me(
                                            jN,
                                            {
                                              key: $e.localId,
                                              kind: $e.kind,
                                              name: $e.name,
                                              url: $e.previewUrl,
                                              "file-id": $e.fileId,
                                              uploading: $e.uploading,
                                              error: $e.error,
                                              removable: "",
                                              "remove-label": p(r)(
                                                "composer.removeNamed",
                                                { name: $e.name },
                                              ),
                                              onActivate: (He) => Te($e, He),
                                              onRemove: (He) =>
                                                p(q)($e.localId),
                                            },
                                            null,
                                            8,
                                            [
                                              "kind",
                                              "name",
                                              "url",
                                              "file-id",
                                              "uploading",
                                              "error",
                                              "remove-label",
                                              "onActivate",
                                              "onRemove",
                                            ],
                                          )
                                        ),
                                      ),
                                      128,
                                    )),
                                  ],
                                  512,
                                ))
                              : te("", !0),
                            X.value.length > 0
                              ? (b(),
                                A("div", yMe, [
                                  (b(!0),
                                  A(
                                    Pe,
                                    null,
                                    pt(
                                      X.value,
                                      ($e) => (
                                        b(),
                                        me(
                                          VN,
                                          {
                                            key: $e.localId,
                                            kind: "file",
                                            name: $e.name,
                                            "media-type": $e.mediaType,
                                            size: $e.size,
                                            uploading: $e.uploading,
                                            error: $e.error,
                                            removable: "",
                                            "remove-label": p(r)(
                                              "composer.removeNamed",
                                              { name: $e.name },
                                            ),
                                            onActivate: (He) => Te($e),
                                            onRemove: (He) => p(q)($e.localId),
                                          },
                                          null,
                                          8,
                                          [
                                            "name",
                                            "media-type",
                                            "size",
                                            "uploading",
                                            "error",
                                            "remove-label",
                                            "onActivate",
                                            "onRemove",
                                          ],
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                                ]))
                              : te("", !0),
                          ],
                          512,
                        ),
                      ],
                      2,
                    ),
                    ge.value
                      ? (b(),
                        A(
                          "span",
                          kMe,
                          N(
                            p(r)("composer.attachmentCount", {
                              n: p(F).length,
                            }),
                          ),
                          1,
                        ))
                      : te("", !0),
                    p(F).length >= 2
                      ? (b(),
                        me(
                          p(Pn),
                          { key: 1, text: p(r)("composer.clearAll") },
                          {
                            default: ke(() => [
                              V(
                                p(gn),
                                {
                                  class: "att-clear",
                                  size: "sm",
                                  label: p(r)("composer.clearAll"),
                                  onClick: p(pe),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "trash" }),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["label", "onClick"],
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["text"],
                        ))
                      : te("", !0),
                  ]))
                : te("", !0),
              C("div", bMe, [
                p(y)
                  ? (b(),
                    me(
                      XAe,
                      {
                        key: 0,
                        items: p(x),
                        "active-index": p(M),
                        onSelect: p(S),
                        onHover: we[1] || (we[1] = ($e) => (M.value = $e)),
                      },
                      null,
                      8,
                      ["items", "active-index", "onSelect"],
                    ))
                  : te("", !0),
                p(I)
                  ? (b(),
                    me(
                      rMe,
                      {
                        key: 1,
                        items: p(P),
                        "active-index": p(D),
                        loading: p(T),
                        onSelect: p(B),
                        onHover: we[2] || (we[2] = ($e) => (D.value = $e)),
                      },
                      null,
                      8,
                      ["items", "active-index", "loading", "onSelect"],
                    ))
                  : te("", !0),
                C("div", CMe, [
                  In(
                    C(
                      "textarea",
                      {
                        ref_key: "textareaRef",
                        ref: u,
                        "onUpdate:modelValue":
                          we[3] ||
                          (we[3] = ($e) => (es(a) ? (a.value = $e) : null)),
                        class: "ph",
                        placeholder: s.value,
                        disabled: e.starting,
                        autocomplete: "off",
                        spellcheck: "false",
                        rows: "1",
                        onKeydown: Ke,
                        onCompositionstart: Yt,
                        onCompositionend: _n,
                        onInput: H,
                      },
                      null,
                      40,
                      wMe,
                    ),
                    [[ri, p(a)]],
                  ),
                  h.value || _.value
                    ? (b(),
                      A(
                        "button",
                        {
                          key: 0,
                          class: "expand-btn",
                          type: "button",
                          "aria-label": h.value
                            ? p(r)("composer.collapseTitle")
                            : p(r)("composer.expandTitle"),
                          onClick: g,
                        },
                        [
                          h.value
                            ? (b(),
                              me(p(Ie), {
                                key: 0,
                                name: "collapse",
                                size: "sm",
                              }))
                            : (b(),
                              me(p(Ie), {
                                key: 1,
                                name: "expand",
                                size: "sm",
                              })),
                        ],
                        8,
                        _Me,
                      ))
                    : te("", !0),
                ]),
              ]),
              zt.value
                ? (b(),
                  A(
                    "input",
                    {
                      key: 1,
                      ref_key: "fileInputRef",
                      ref: z,
                      type: "file",
                      multiple: "",
                      class: "file-input-hidden",
                      onChange:
                        we[4] || (we[4] = (...$e) => p(Y) && p(Y)(...$e)),
                    },
                    null,
                    544,
                  ))
                : te("", !0),
              C(
                "div",
                { ref_key: "toolbarRef", ref: fn, class: "toolbar" },
                [
                  C(
                    "div",
                    {
                      ref_key: "menuMeasureRef",
                      ref: Uo,
                      class: "menu-measure",
                      "aria-hidden": "true",
                    },
                    [
                      ...(we[22] ||
                        (we[22] = [C("span", { class: "pd-desc" }, null, -1)])),
                    ],
                    512,
                  ),
                  C("div", xMe, [
                    zt.value
                      ? (b(),
                        me(
                          p(gn),
                          {
                            key: 0,
                            class: "composer-attach",
                            size: "md",
                            label: p(r)("composer.attachFile"),
                            onClick: p(ne),
                          },
                          {
                            default: ke(() => [
                              V(p(Ie), { name: "attachment" }),
                            ]),
                            _: 1,
                          },
                          8,
                          ["label", "onClick"],
                        ))
                      : te("", !0),
                    e.status
                      ? (b(),
                        A(
                          "span",
                          {
                            key: 1,
                            ref_key: "permPillRef",
                            ref: Sn,
                            class: Re([
                              "perm-pill",
                              [
                                "perm-" + e.status.permission,
                                { open: tn.value },
                              ],
                            ]),
                            role: "button",
                            tabindex: "0",
                            "aria-label": Ll.value,
                            onClick: Et(bn, ["stop"]),
                            onKeydown: [
                              xl(bn, ["enter"]),
                              xl(Et(bn, ["prevent"]), ["space"]),
                            ],
                          },
                          [
                            V(
                              p(Ie),
                              {
                                class: "perm-pill-icon",
                                name: tl.value,
                                size: "sm",
                              },
                              null,
                              8,
                              ["name"],
                            ),
                            C("span", AMe, N(Ll.value), 1),
                          ],
                          42,
                          SMe,
                        ))
                      : te("", !0),
                    V(
                      as,
                      { name: "composer-menu-pop" },
                      {
                        default: ke(() => [
                          tn.value && e.status
                            ? (b(),
                              A(
                                "div",
                                {
                                  key: 0,
                                  class: "perm-dropdown",
                                  style: Gt(jo.value),
                                  role: "menu",
                                  onClick:
                                    we[5] || (we[5] = Et(() => {}, ["stop"])),
                                },
                                [
                                  (b(),
                                  A(
                                    Pe,
                                    null,
                                    pt(sn, ($e) =>
                                      C(
                                        "button",
                                        {
                                          key: $e.mode,
                                          class: Re([
                                            "pd-row",
                                            {
                                              "is-current":
                                                $e.mode === e.status.permission,
                                            },
                                          ]),
                                          role: "menuitem",
                                          onClick: (He) => hs($e.mode),
                                        },
                                        [
                                          C(
                                            "span",
                                            {
                                              class: "pd-icon",
                                              style: Gt({ color: $e.color }),
                                            },
                                            [
                                              V(
                                                p(Ie),
                                                { name: $e.icon, size: "sm" },
                                                null,
                                                8,
                                                ["name"],
                                              ),
                                            ],
                                            4,
                                          ),
                                          C("span", TMe, [
                                            C(
                                              "span",
                                              {
                                                class: "pd-name",
                                                style: Gt({ color: $e.color }),
                                              },
                                              N(p(r)($e.labelKey)),
                                              5,
                                            ),
                                            C(
                                              "span",
                                              EMe,
                                              N(p(r)($e.descKey)),
                                              1,
                                            ),
                                          ]),
                                          C("span", IMe, [
                                            $e.mode === e.status.permission
                                              ? (b(),
                                                me(p(Ie), {
                                                  key: 0,
                                                  name: "check",
                                                  size: "sm",
                                                }))
                                              : te("", !0),
                                          ]),
                                        ],
                                        10,
                                        MMe,
                                      ),
                                    ),
                                    64,
                                  )),
                                ],
                                4,
                              ))
                            : te("", !0),
                        ]),
                        _: 1,
                      },
                    ),
                    e.status
                      ? (b(),
                        A(
                          "div",
                          {
                            key: 2,
                            ref_key: "modesRef",
                            ref: Ho,
                            class: "modes",
                          },
                          [
                            C(
                              "button",
                              {
                                type: "button",
                                class: Re([
                                  "mode-pill",
                                  { on: Zs.value, open: Wt.value },
                                ]),
                                onClick: Et(Wo, ["stop"]),
                              },
                              [
                                C("span", LMe, N(p(r)("status.modesLabel")), 1),
                                Xn.value
                                  ? (b(),
                                    A(
                                      "span",
                                      $Me,
                                      N(p(r)("status.planLabel")),
                                      1,
                                    ))
                                  : te("", !0),
                                co.value
                                  ? (b(),
                                    A(
                                      "span",
                                      NMe,
                                      N(p(r)("status.swarmLabel")),
                                      1,
                                    ))
                                  : te("", !0),
                                Ct.value
                                  ? (b(),
                                    A(
                                      "span",
                                      FMe,
                                      N(p(r)("status.goalLabel")),
                                      1,
                                    ))
                                  : te("", !0),
                              ],
                              2,
                            ),
                            V(
                              as,
                              { name: "composer-menu-pop" },
                              {
                                default: ke(() => [
                                  Wt.value
                                    ? (b(),
                                      A(
                                        "div",
                                        {
                                          key: 0,
                                          ref_key: "modesMenuRef",
                                          ref: Eo,
                                          class: "modes-menu",
                                          style: Gt(Il.value),
                                          role: "menu",
                                        },
                                        [
                                          C(
                                            "button",
                                            {
                                              type: "button",
                                              class: Re([
                                                "mode-row",
                                                { on: Xn.value },
                                              ]),
                                              role: "menuitem",
                                              onClick:
                                                we[6] ||
                                                (we[6] = ($e) =>
                                                  i("togglePlan")),
                                            },
                                            [
                                              C("span", RMe, [
                                                V(p(Ie), {
                                                  name: "file-edit",
                                                  size: "sm",
                                                }),
                                              ]),
                                              C("span", OMe, [
                                                C(
                                                  "span",
                                                  PMe,
                                                  N(p(r)("status.planLabel")),
                                                  1,
                                                ),
                                                C(
                                                  "span",
                                                  DMe,
                                                  N(p(r)("status.planDesc")),
                                                  1,
                                                ),
                                              ]),
                                              C(
                                                "span",
                                                {
                                                  class: Re([
                                                    "mode-switch",
                                                    { on: Xn.value },
                                                  ]),
                                                },
                                                [
                                                  ...(we[23] ||
                                                    (we[23] = [
                                                      C(
                                                        "span",
                                                        { class: "mode-knob" },
                                                        null,
                                                        -1,
                                                      ),
                                                    ])),
                                                ],
                                                2,
                                              ),
                                            ],
                                            2,
                                          ),
                                          C(
                                            "button",
                                            {
                                              type: "button",
                                              class: Re([
                                                "mode-row",
                                                { on: co.value },
                                              ]),
                                              role: "menuitem",
                                              onClick:
                                                we[7] ||
                                                (we[7] = ($e) =>
                                                  i("toggleSwarm")),
                                            },
                                            [
                                              C("span", BMe, [
                                                V(p(Ie), {
                                                  name: "sparkles",
                                                  size: "sm",
                                                }),
                                              ]),
                                              C("span", HMe, [
                                                C(
                                                  "span",
                                                  zMe,
                                                  N(p(r)("status.swarmLabel")),
                                                  1,
                                                ),
                                                C(
                                                  "span",
                                                  WMe,
                                                  N(p(r)("status.swarmDesc")),
                                                  1,
                                                ),
                                              ]),
                                              C(
                                                "span",
                                                {
                                                  class: Re([
                                                    "mode-switch",
                                                    { on: co.value },
                                                  ]),
                                                },
                                                [
                                                  ...(we[24] ||
                                                    (we[24] = [
                                                      C(
                                                        "span",
                                                        { class: "mode-knob" },
                                                        null,
                                                        -1,
                                                      ),
                                                    ])),
                                                ],
                                                2,
                                              ),
                                            ],
                                            2,
                                          ),
                                          C(
                                            "div",
                                            {
                                              class: Re([
                                                "mode-row mode-row-goal",
                                                { on: it.value || o.goalMode },
                                              ]),
                                            },
                                            [
                                              C(
                                                "button",
                                                {
                                                  type: "button",
                                                  class: "mode-row-main",
                                                  role: "menuitem",
                                                  onClick:
                                                    we[8] ||
                                                    (we[8] = ($e) =>
                                                      it.value
                                                        ? i("focusGoal")
                                                        : i("toggleGoal")),
                                                },
                                                [
                                                  C("span", UMe, [
                                                    V(p(Ie), {
                                                      name: "target",
                                                      size: "sm",
                                                    }),
                                                  ]),
                                                  C("span", jMe, [
                                                    C(
                                                      "span",
                                                      VMe,
                                                      N(
                                                        p(r)(
                                                          "status.goalLabel",
                                                        ),
                                                      ),
                                                      1,
                                                    ),
                                                    C(
                                                      "span",
                                                      qMe,
                                                      N(
                                                        p(r)("status.goalDesc"),
                                                      ),
                                                      1,
                                                    ),
                                                  ]),
                                                  it.value
                                                    ? te("", !0)
                                                    : (b(),
                                                      A(
                                                        "span",
                                                        {
                                                          key: 0,
                                                          class: Re([
                                                            "mode-switch",
                                                            { on: o.goalMode },
                                                          ]),
                                                        },
                                                        [
                                                          ...(we[25] ||
                                                            (we[25] = [
                                                              C(
                                                                "span",
                                                                {
                                                                  class:
                                                                    "mode-knob",
                                                                },
                                                                null,
                                                                -1,
                                                              ),
                                                            ])),
                                                        ],
                                                        2,
                                                      )),
                                                ],
                                              ),
                                              it.value
                                                ? (b(),
                                                  A("div", KMe, [
                                                    en.value
                                                      ? (b(),
                                                        me(
                                                          p(Ft),
                                                          {
                                                            key: 0,
                                                            size: "sm",
                                                            variant:
                                                              "secondary",
                                                            class:
                                                              "mode-row-action",
                                                            onClick:
                                                              we[9] ||
                                                              (we[9] = ($e) =>
                                                                i(
                                                                  "controlGoal",
                                                                  "pause",
                                                                )),
                                                          },
                                                          {
                                                            default: ke(() => [
                                                              V(p(Ie), {
                                                                name: "pause",
                                                                size: "sm",
                                                              }),
                                                              C(
                                                                "span",
                                                                null,
                                                                N(
                                                                  p(r)(
                                                                    "status.goalPause",
                                                                  ),
                                                                ),
                                                                1,
                                                              ),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        ))
                                                      : te("", !0),
                                                    yn.value
                                                      ? (b(),
                                                        me(
                                                          p(Ft),
                                                          {
                                                            key: 1,
                                                            size: "sm",
                                                            variant: "primary",
                                                            class:
                                                              "mode-row-action",
                                                            onClick:
                                                              we[10] ||
                                                              (we[10] = ($e) =>
                                                                i(
                                                                  "controlGoal",
                                                                  "resume",
                                                                )),
                                                          },
                                                          {
                                                            default: ke(() => [
                                                              V(p(Ie), {
                                                                name: "play",
                                                                size: "sm",
                                                              }),
                                                              C(
                                                                "span",
                                                                null,
                                                                N(
                                                                  p(r)(
                                                                    "status.goalResume",
                                                                  ),
                                                                ),
                                                                1,
                                                              ),
                                                            ]),
                                                            _: 1,
                                                          },
                                                        ))
                                                      : te("", !0),
                                                    V(
                                                      p(Ft),
                                                      {
                                                        size: "sm",
                                                        variant: "danger-soft",
                                                        class:
                                                          "mode-row-action",
                                                        onClick:
                                                          we[11] ||
                                                          (we[11] = ($e) =>
                                                            i(
                                                              "controlGoal",
                                                              "cancel",
                                                            )),
                                                      },
                                                      {
                                                        default: ke(() => [
                                                          V(p(Ie), {
                                                            name: "close",
                                                            size: "sm",
                                                          }),
                                                          C(
                                                            "span",
                                                            null,
                                                            N(
                                                              p(r)(
                                                                "status.goalCancel",
                                                              ),
                                                            ),
                                                            1,
                                                          ),
                                                        ]),
                                                        _: 1,
                                                      },
                                                    ),
                                                  ]))
                                                : te("", !0),
                                            ],
                                            2,
                                          ),
                                        ],
                                        4,
                                      ))
                                    : te("", !0),
                                ]),
                                _: 1,
                              },
                            ),
                          ],
                          512,
                        ))
                      : te("", !0),
                  ]),
                  C("div", ZMe, [
                    Bo.value
                      ? (b(),
                        A(
                          "button",
                          {
                            key: 0,
                            class: "compact-chip",
                            onClick:
                              we[12] ||
                              (we[12] = Et(($e) => i("compact"), ["stop"])),
                          },
                          "/compact",
                        ))
                      : te("", !0),
                    V(
                      p(Pn),
                      { text: qs.value },
                      {
                        default: ke(() => [
                          e.status && !e.hideContext
                            ? (b(),
                              A(
                                "span",
                                {
                                  key: 0,
                                  class: "ctx-group",
                                  role: "img",
                                  tabindex: "0",
                                  "aria-label": qs.value,
                                },
                                [V(p(sW), { pct: At.value }, null, 8, ["pct"])],
                                8,
                                GMe,
                              ))
                            : te("", !0),
                        ]),
                        _: 1,
                      },
                      8,
                      ["text"],
                    ),
                    e.status && !ci.value && !$l.value
                      ? (b(),
                        A(
                          "button",
                          {
                            key: 1,
                            ref_key: "modelPillRef",
                            ref: to,
                            type: "button",
                            class: Re(["model-pill", { open: at.value }]),
                            "aria-haspopup": "menu",
                            "aria-expanded": at.value,
                            onClick: Et(Po, ["stop"]),
                          },
                          [
                            C("span", XMe, N(e.status.model), 1),
                            $s.value
                              ? (b(), A("span", JMe, N($s.value), 1))
                              : te("", !0),
                            V(p(Ie), {
                              class: "cv",
                              name: "chevron-down",
                              size: "sm",
                            }),
                          ],
                          10,
                          YMe,
                        ))
                      : e.status && $l.value
                        ? (b(),
                          A(
                            "button",
                            {
                              key: 2,
                              type: "button",
                              class: "model-pill login-pill",
                              onClick:
                                we[13] ||
                                (we[13] = Et(($e) => p(o0)(), ["stop"])),
                            },
                            [
                              V(p(Ie), { name: "music", size: "sm" }),
                              C("span", QMe, N(p(r)("sidebar.upgrade")), 1),
                            ],
                          ))
                        : e.status && ci.value
                          ? (b(),
                            A(
                              "button",
                              {
                                key: 3,
                                type: "button",
                                class: "model-pill login-pill",
                                onClick:
                                  we[14] ||
                                  (we[14] = Et(($e) => i("login"), ["stop"])),
                              },
                              [
                                V(p(Ie), { name: "log-in", size: "sm" }),
                                C("span", eTe, N(p(r)("login.action")), 1),
                              ],
                            ))
                          : te("", !0),
                    e.working
                      ? (b(),
                        me(
                          p(Pn),
                          { key: 4, text: p(r)("composer.interruptTitle") },
                          {
                            default: ke(() => [
                              C(
                                "button",
                                {
                                  class: "stop",
                                  "aria-label": p(r)("composer.interrupt"),
                                  onClick:
                                    we[15] || (we[15] = ($e) => i("interrupt")),
                                },
                                [V(p(Ie), { name: "stop", size: "sm" })],
                                8,
                                tTe,
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["text"],
                        ))
                      : te("", !0),
                    C(
                      "button",
                      {
                        class: Re(["send", { "is-starting": e.starting }]),
                        "aria-label": Ze.value,
                        disabled: e.starting || !Fe.value,
                        onClick: we[16] || (we[16] = ($e) => Oe()),
                      },
                      [
                        e.starting
                          ? (b(), me(p(Ao), { key: 0, size: "sm" }))
                          : (b(),
                            me(p(Ie), { key: 1, name: "send", size: "sm" })),
                      ],
                      10,
                      nTe,
                    ),
                  ]),
                  V(
                    as,
                    { name: "composer-menu-pop" },
                    {
                      default: ke(() => [
                        at.value && e.status
                          ? (b(),
                            A(
                              "div",
                              {
                                key: 0,
                                ref_key: "modelDropdownRef",
                                ref: di,
                                class: "model-dropdown",
                                style: Gt(ao.value),
                                role: "menu",
                                onClick:
                                  we[18] || (we[18] = Et(() => {}, ["stop"])),
                                onKeydown: se,
                              },
                              [
                                C("div", oTe, [
                                  Xs.value.length > 0
                                    ? (b(),
                                      A(
                                        "div",
                                        sTe,
                                        N(p(r)("status.starredModels")),
                                        1,
                                      ))
                                    : te("", !0),
                                  (b(!0),
                                  A(
                                    Pe,
                                    null,
                                    pt(
                                      Xs.value,
                                      ($e) => (
                                        b(),
                                        A(
                                          "button",
                                          {
                                            key: $e.id,
                                            class: Re([
                                              "md-row",
                                              {
                                                "is-current":
                                                  $e.id === e.status.modelId,
                                              },
                                            ]),
                                            role: "menuitem",
                                            onClick: (He) => xe($e.id),
                                          },
                                          [
                                            C("span", rTe, [
                                              $e.id === e.status.modelId
                                                ? (b(),
                                                  me(p(Ie), {
                                                    key: 0,
                                                    name: "check",
                                                    size: "sm",
                                                  }))
                                                : te("", !0),
                                            ]),
                                            C(
                                              "span",
                                              lTe,
                                              N($e.displayName ?? $e.model),
                                              1,
                                            ),
                                            C("span", aTe, N($e.provider), 1),
                                            V(p(Ie), {
                                              class: "md-star",
                                              name: "star",
                                              size: "sm",
                                            }),
                                          ],
                                          10,
                                          iTe,
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                                  Xs.value.length > 0
                                    ? (b(), A("div", uTe))
                                    : te("", !0),
                                  fo.value.length > 0
                                    ? (b(), A("div", cTe, N(Mi.value), 1))
                                    : te("", !0),
                                  (b(!0),
                                  A(
                                    Pe,
                                    null,
                                    pt(
                                      fo.value,
                                      ($e) => (
                                        b(),
                                        A(
                                          "button",
                                          {
                                            key: $e.id,
                                            class: Re([
                                              "md-row",
                                              {
                                                "is-current":
                                                  $e.id === e.status.modelId,
                                              },
                                            ]),
                                            role: "menuitem",
                                            onClick: (He) => xe($e.id),
                                          },
                                          [
                                            C("span", fTe, [
                                              $e.id === e.status.modelId
                                                ? (b(),
                                                  me(p(Ie), {
                                                    key: 0,
                                                    name: "check",
                                                    size: "sm",
                                                  }))
                                                : te("", !0),
                                            ]),
                                            C(
                                              "span",
                                              pTe,
                                              N($e.displayName ?? $e.model),
                                              1,
                                            ),
                                            Ir($e.id)
                                              ? (b(),
                                                me(p(Ie), {
                                                  key: 0,
                                                  class: "md-star",
                                                  name: "star",
                                                  size: "sm",
                                                }))
                                              : te("", !0),
                                          ],
                                          10,
                                          dTe,
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                                ]),
                                fo.value.length > 0
                                  ? (b(), A("div", hTe))
                                  : te("", !0),
                                C("div", mTe, [
                                  C(
                                    "span",
                                    gTe,
                                    N(p(r)("status.thinkingLabel")),
                                    1,
                                  ),
                                  ai.value === "unsupported"
                                    ? (b(),
                                      A(
                                        "span",
                                        vTe,
                                        N(p(r)("status.modeNotSupported")),
                                        1,
                                      ))
                                    : Tn.value.length > 1
                                      ? (b(),
                                        me(
                                          p(bi),
                                          {
                                            key: 1,
                                            "model-value": Ks.value,
                                            options: uo.value,
                                            size: "xs",
                                            "onUpdate:modelValue": yo,
                                          },
                                          null,
                                          8,
                                          ["model-value", "options"],
                                        ))
                                      : (b(),
                                        A(
                                          "span",
                                          yTe,
                                          N(oo(Tn.value[0] ?? no.value)),
                                          1,
                                        )),
                                ]),
                                we[26] ||
                                  (we[26] = C(
                                    "div",
                                    { class: "md-divider" },
                                    null,
                                    -1,
                                  )),
                                C("div", kTe, N(p(r)("status.cacheNote")), 1),
                                we[27] ||
                                  (we[27] = C(
                                    "div",
                                    { class: "md-divider" },
                                    null,
                                    -1,
                                  )),
                                C(
                                  "button",
                                  {
                                    class: "md-row md-row-more",
                                    role: "menuitem",
                                    onClick:
                                      we[17] ||
                                      (we[17] = ($e) => {
                                        (Mn(), i("pickModel"));
                                      }),
                                  },
                                  [
                                    C("span", bTe, [
                                      V(p(Ie), { name: "list", size: "sm" }),
                                    ]),
                                    C(
                                      "span",
                                      CTe,
                                      N(p(r)("status.moreModels")),
                                      1,
                                    ),
                                    V(p(Ie), {
                                      class: "md-more-arrow",
                                      name: "chevron-right",
                                      size: "sm",
                                    }),
                                  ],
                                ),
                              ],
                              36,
                            ))
                          : te("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                ],
                512,
              ),
            ]),
            J.$slots.footer
              ? (b(), A("div", wTe, [Cn(J.$slots, "footer", {}, void 0, !0)]))
              : te("", !0),
            C(
              "div",
              {
                class: Re(["drop-overlay", { show: p(U) }]),
                "aria-hidden": "true",
              },
              [
                C("div", _Te, [
                  V(p(Ie), { name: "file-plus", size: "lg" }),
                  C("span", null, N(p(r)("composer.dropToAttach")), 1),
                ]),
              ],
              2,
            ),
          ],
          34,
        )
      );
    },
  }),
  oF = ht(xTe, [["__scopeId", "data-v-fe3fe36b"]]),
  STe = { class: "goal-panel" },
  ATe = { class: "goal-full" },
  MTe = { key: 0, class: "goal-criterion" },
  TTe = { class: "goal-criterion-label" },
  ETe = tt({
