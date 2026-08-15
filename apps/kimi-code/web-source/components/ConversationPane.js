    __name: "ConversationPane",
    props: {
      turns: {},
      sessionId: {},
      approvals: {},
      gitInfo: {},
      tasks: {},
      todos: {},
      goal: {},
      activationBadges: {},
      status: {},
      thinking: {},
      planMode: { type: Boolean },
      swarmMode: { type: Boolean },
      goalMode: { type: Boolean },
      questions: {},
      pendingQuestionActions: {},
      pendingApprovalActions: {},
      running: { type: Boolean },
      turnActive: { type: Boolean },
      queued: {},
      searchFiles: { type: Function },
      uploadImage: { type: Function },
      changes: {},
      fileReloadKey: {},
      working: { type: Boolean },
      lastTurnReason: {},
      turnError: {},
      turnRetry: {},
      overlayOpen: { type: Boolean },
      starting: { type: Boolean },
      mobile: { type: Boolean },
      sessionLoading: { type: Boolean },
      compaction: {},
      hasMoreMessages: { type: Boolean },
      loadingMore: { type: Boolean },
      loadingMoreError: { type: Boolean },
      loadOlderMessages: { type: Function },
      models: {},
      authReady: { type: Boolean },
      managedSignedIn: { type: Boolean },
      managedMembership: {},
      starredIds: {},
      skills: {},
      workspaceName: {},
      workspaceRoot: {},
      gitDiffStats: {},
      workspaces: {},
      activeWorkspaceId: {},
      sessionTitle: {},
      pr: {},
    },
    emits: [
      "submit",
      "steer",
      "approval",
      "cancelTask",
      "answer",
      "dismiss",
      "command",
      "interrupt",
      "unqueue",
      "editQueued",
      "reorderQueue",
      "setPermission",
      "setThinking",
      "togglePlan",
      "toggleSwarm",
      "toggleGoal",
      "createGoal",
      "controlGoal",
      "compact",
      "pickModel",
      "selectModel",
      "login",
      "openFile",
      "openMedia",
      "openTurnDiff",
      "openCompaction",
      "openAgent",
      "openChanges",
      "refreshGitStatus",
      "editMessage",
      "selectWorkspace",
      "addWorkspace",
      "openPr",
      "renameSession",
      "forkSession",
      "archiveSession",
      "exportSession",
    ],
    setup(e, { expose: t, emit: n }) {
      const { t: o } = Lt(),
        s = e,
        i = n,
        r = Z(!1),
        l = Z(!1),
        a = Z(null),
        u = R(
          () =>
            s.workspaces?.find((Ae) => Ae.id === s.activeWorkspaceId)?.name ??
            s.workspaceName ??
            "",
        ),
        c = R(() => (s.workspaces?.length ?? 0) > 0),
        d = R(
          () =>
            s.authReady === !1 &&
            (s.models?.length ?? 0) === 0 &&
            s.managedSignedIn === !0 &&
            s.managedMembership === "free",
        ),
        f = R(() => uLe(s.workspaces ?? [], s.activeWorkspaceId));
      function h(ye) {
        if (r.value) {
          r.value = !1;
          return;
        }
        const Ae = ye.currentTarget?.closest(".ws-anchor"),
          qe = Ae?.closest(".panes");
        if (Ae instanceof HTMLElement && qe instanceof HTMLElement) {
          const Mt = Ae.getBoundingClientRect(),
            Jt = qe.getBoundingClientRect(),
            an = Jt.bottom - Mt.bottom - 4,
            $n = Mt.top - Jt.top - 4;
          l.value = $n > an;
          const io = Math.max(0, Math.floor(l.value ? $n : an));
          a.value = `min(calc(var(--space-8) * 10), ${io}px)`;
        } else ((l.value = !1), (a.value = null));
        r.value = !0;
      }
      function g(ye) {
        ((r.value = !1),
          ye !== s.activeWorkspaceId && i("selectWorkspace", ye));
      }
      lr(cn.contentAlign);
      const m = Z(null),
        w = Z(null),
        _ = Z(null),
        v = Z(!1);
      let k = null;
      function y(ye, Ae) {
        const qe = _.value ?? w.value;
        return !qe || qe.loadForEdit(ye) === !1
          ? !1
          : (qe.loadAttachmentsForEdit(Ae ?? []), !0);
      }
      function x() {
        ((v.value = !0),
          k !== null && clearTimeout(k),
          (k = setTimeout(() => {
            ((k = null), (v.value = !1));
          }, 2e3)));
      }
      const M = R(() => s.tasks.filter((ye) => ye.kind !== "subagent")),
        $ = R(() =>
          s.tasks.filter((ye) => ye.kind === "subagent" && ye.runInBackground),
        ),
        S = R(() => M.value.filter((ye) => ye.state === "run").length),
        I = R(() => $.value.filter((ye) => ye.state === "run").length);
      function P(ye) {
        const Ae = s.tasks,
          qe =
            Ae.find((Jt) => Jt.id === ye) ??
            Ae.find((Jt) => Jt.parentToolCallId === ye);
        if (qe?.agentId) return qe.agentId;
        const Mt = Ae.filter(
          (Jt) => Jt.kind === "subagent" && !Jt.parentToolCallId && Jt.agentId,
        );
        if (Mt.length === 1) return Mt[0].agentId;
      }
      En("resolveAgentTaskId", P);
      const D = on("modelDisplay"),
        T = on("subagentEffort");
      function L(ye, Ae) {
        const qe = Ae ?? P(ye);
        if (qe === void 0) return;
        const Mt = s.tasks.find(($n) => $n.agentId === qe || $n.id === qe),
          Jt = D?.(Mt?.model),
          an = T?.(Mt?.thinkingEffort);
        if (!(Jt === void 0 && an === void 0))
          return { display: Jt, effort: an };
      }
      (En("resolveAgentModel", L), En("pinScroll", Ho));
      const B = R(
          () => (s.todos ?? []).filter((ye) => ye.status === "done").length,
        ),
        H = R(
          () =>
            s.goal != null ||
            M.value.length > 0 ||
            $.value.length > 0 ||
            (s.todos?.length ?? 0) > 0 ||
            (s.queued?.length ?? 0) > 0,
        ),
        O = Z(null),
        F = R(() => (s.gitInfo ? (s.changes?.length ?? 0) : 0));
      function W(ye) {
        O.value = O.value === ye ? null : ye;
      }
      function z() {
        O.value = null;
      }
      function U() {
        s.goal && (O.value = "goal");
      }
      et(
        () => [s.goal, M.value.length, $.value.length, s.todos?.length],
        () => {
          const ye = O.value;
          if (ye === null) return;
          (ye === "goal" && s.goal != null) ||
            (ye === "bash" && M.value.length > 0) ||
            (ye === "subagent" && $.value.length > 0) ||
            (ye === "todos" && (s.todos?.length ?? 0) > 0) ||
            z();
        },
      );
      function q(ye) {
        if (ye.role === "compaction") return o("conversation.compactedPlain");
        if (ye.role === "user") {
          if (ye.skillActivation) return `/${ye.skillActivation.name}`;
          if (ye.pluginCommand)
            return `/${ye.pluginCommand.pluginId}:${ye.pluginCommand.commandName}`;
          const qe = ye.text.trim().replaceAll(/\s+/g, " ");
          return qe.length > 0 ? qe : "user";
        }
        const Ae = (ye.text || ye.thinking || "")
          .trim()
          .replaceAll(/\s+/g, " ");
        return Ae.length > 0
          ? Ae
          : (ye.tools?.length ?? 0) > 0
            ? `${ye.tools.length} tools`
            : "kimi";
      }
      const K = R(() =>
          s.turns
            .filter((ye) => ye.role === "user")
            .map((ye, Ae) => ({
              id: ye.id,
              role: ye.role,
              no: Ae + 1,
              title: q(ye),
            })),
        ),
        ie = Z(null);
      function ne() {
        const ye = ee.value;
        if (!ye) return;
        const Ae = K.value;
        if (Ae.length === 0) return;
        if (at() <= f1) {
          ie.value = Ae[Ae.length - 1].id;
          return;
        }
        if (le || Y === null) {
          const an = ye.scrollTop,
            $n = ye.getBoundingClientRect().top,
            io = [];
          for (const Fs of ye.querySelectorAll(".turn-anchor[data-turn-id]")) {
            const yu = Fs.dataset.turnId;
            yu &&
              io.push({
                id: yu,
                top: Fs.getBoundingClientRect().top - $n + an,
              });
          }
          ((Y = io), (le = !1));
        }
        const qe = new Set(Ae.map((an) => an.id)),
          Mt = ye.scrollTop + ye.clientHeight / 2;
        let Jt = null;
        for (const an of Y) qe.has(an.id) && an.top <= Mt && (Jt = an.id);
        ie.value = Jt ?? Ae[0].id;
      }
      let Y = null,
        le = !0;
      function Ee() {
        le = !0;
      }
      let de = 0;
      function he() {
        de ||
          (de = uo(() => {
            ((de = 0), ne());
          }));
      }
      const pe = Z(!1);
      let oe = 0;
      function ve() {
        oe ||
          (oe = uo(() => {
            ((oe = 0), X());
          }));
      }
      function G() {
        (ve(), Ee());
      }
      function X() {
        const ye = ee.value,
          Ae =
            !s.mobile && ye
              ? ye.closest(".con")?.querySelector(".conversation-toc")
              : null,
          qe = Ae?.querySelector(".toc-bar");
        let Mt = !1;
        if (ye && Ae && qe) {
          const Jt = qe.getBoundingClientRect(),
            an = Ae.getBoundingClientRect(),
            $n = Jt.left + Jt.width / 2;
          Mt = Array.from(ye.querySelectorAll(".table-node-wrapper")).some(
            (io) => {
              const Fs = io.getBoundingClientRect();
              return (
                Fs.left <= $n &&
                $n <= Fs.right &&
                Fs.top < an.bottom &&
                Fs.bottom > an.top
              );
            },
          );
        }
        pe.value !== Mt && (pe.value = Mt);
      }
      const fe = R(() =>
          s.questions && s.questions.length > 0 ? s.questions[0] : void 0,
        ),
        Ce = R(() => {
          const ye = fe.value;
          if (ye) return s.pendingQuestionActions?.[ye.questionId];
        }),
        ge = R(() =>
          s.approvals && s.approvals.length > 0 ? s.approvals[0] : void 0,
        ),
        Q = R(() => {
          const ye = ge.value;
          return ye ? !!s.pendingApprovalActions?.[ye.approvalId] : !1;
        }),
        ee = Z(null),
        ce = Z(null),
        ue = Z(0),
        Se = Z(0),
        Ue = Z(!1),
        _e = Z(null);
      let Te = null;
      function st() {
        if (s.turns.length !== 0) {
          if (Ue.value) {
            _e.value?.focusInput();
            return;
          }
          ((Te = document.activeElement), (Ue.value = !0));
        }
      }
      function Fe() {
        ((Ue.value = !1),
          yt(() => {
            (Te instanceof HTMLElement && Te.isConnected && Te.focus(),
              (Te = null));
          }));
      }
      et(
        () => s.turns.length === 0 && !s.sessionLoading,
        (ye) => {
          ye && Ue.value && Fe();
        },
      );
      const Oe = R(() => ({ "--panes-scrollbar-width": `${ue.value}px` })),
        Ye = R(() => ({ "--chat-dock-height": `${Se.value + FLe}px` }));
      function ft(ye) {
        return ye instanceof HTMLElement
          ? ye
          : ye && "$el" in ye && ye.$el instanceof HTMLElement
            ? ye.$el
            : null;
      }
      let $t = 0;
      function Ht() {
        $t ||
          ($t = uo(() => {
            $t = 0;
            const ye = ee.value,
              Ae = ye ? Math.max(0, ye.offsetWidth - ye.clientWidth) : 0;
            Ae !== ue.value && (ue.value = Ae);
            const qe = ce.value?.offsetHeight ?? 0;
            qe !== Se.value && (Se.value = qe);
          }));
      }
      function Yt(ye) {
        const Ae = ft(ye);
        Ae !== ee.value && ((ee.value = Ae), Ae && xe());
      }
      function _n(ye) {
        const Ae = ft(ye);
        Ae !== ce.value &&
          ((ce.value = Ae ?? null),
          ye &&
          "loadForEdit" in ye &&
          typeof ye.loadForEdit == "function" &&
          "focus" in ye &&
          typeof ye.focus == "function"
            ? (_.value = {
                loadForEdit: ye.loadForEdit.bind(ye),
                loadAttachmentsForEdit:
                  "loadAttachmentsForEdit" in ye &&
                  typeof ye.loadAttachmentsForEdit == "function"
                    ? ye.loadAttachmentsForEdit.bind(ye)
                    : () => {},
                focus: ye.focus.bind(ye),
                get anyPopupOpen() {
                  return "anyPopupOpen" in ye && ye.anyPopupOpen === !0;
                },
                isEmpty:
                  "isEmpty" in ye && typeof ye.isEmpty == "function"
                    ? ye.isEmpty.bind(ye)
                    : void 0,
              })
            : (_.value = null),
          se());
      }
      const je = Z(!0),
        Ke = Z(!1),
        Ze = Z(!1);
      let zt = null;
      function at() {
        const ye = ee.value;
        return ye ? Le - ye.scrollTop - Ge : 0;
      }
      let tn = 0,
        Wt = 0,
        fn = 0,
        Sn = 0,
        to = 0,
        An = 0,
        ao = 0;
      function Kt() {
        return Date.now() < Wt;
      }
      function Co() {
        (ve(),
          (Ze.value = !0),
          zt && clearTimeout(zt),
          (zt = setTimeout(() => {
            ((Ze.value = !1), (zt = null));
          }, 900)));
        const ye = ee.value;
        if (!ye) return;
        const Ae = ye.scrollTop;
        if (yn()) {
          tn = Ae;
          return;
        }
        if (performance.now() - fn < 100) {
          tn = Ae;
          return;
        }
        const qe = at();
        if (Kt()) {
          ((je.value = !0), (Ke.value = !1), (tn = Ae));
          return;
        }
        (Ae < tn - 1 && qe > 1
          ? ye.scrollHeight - Ae - ye.clientHeight > 1 &&
            ((je.value = !1), (Ke.value = !0))
          : qe <= f1 &&
            Ae > tn + 1 &&
            Date.now() >= Sn &&
            ((je.value = !0), (Ke.value = !1)),
          (tn = Ae),
          he());
      }
      function Po(ye = !1) {
        const Ae = ee.value;
        ((je.value = !0),
          (Ke.value = !1),
          no(),
          Ae &&
            ((!ye && performance.now() < to) ||
              (ye ? bn() : (Ae.scrollTop = Math.max(Ae.scrollTop, Le)),
              (tn = Ae.scrollTop))));
      }
      let Mn = 0;
      function bn(ye = 320) {
        const Ae = ee.value;
        if (!Ae) return;
        if (
          (Mn && (Xn(Mn), (Mn = 0)),
          typeof window < "u" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        ) {
          ((Ae.scrollTop = Ae.scrollHeight), (tn = Ae.scrollTop));
          return;
        }
        const qe = Ae.scrollTop,
          Mt = performance.now();
        ((fn = Mt), (to = Mt + ye + RLe));
        const Jt = () => {
          Mn = 0;
          const an = Math.min(1, (performance.now() - Mt) / ye),
            $n = 1 - Math.pow(1 - an, 3);
          ((Ae.scrollTop = qe + (Ae.scrollHeight - qe) * $n),
            (tn = Ae.scrollTop),
            an < 1 ? (Mn = uo(Jt)) : (to = 0));
        };
        Mn = uo(Jt);
      }
      function Do(ye, Ae) {
        return (
          (
            Ae.closest("[inert]")?.closest(
              ".tool-group, .activity-run, .turn-fold",
            ) ?? Ae
          ).getBoundingClientRect().top -
          ye.getBoundingClientRect().top +
          ye.scrollTop
        );
      }
      function po(ye, Ae) {
        const qe = Array.from(
            ye.querySelectorAll(
              ".turn-anchor[data-turn-id], [data-scroll-anchor-id]",
            ),
          ).map((an) => ({ node: an, top: Do(ye, an) })),
          Mt = qe.findIndex((an) => an.top >= Ae),
          Jt = Mt < 0 ? Math.max(0, qe.length - 1) : Mt;
        return qe.slice(Jt, Jt + 2).flatMap((an) => {
          const $n = an.node.dataset.scrollAnchorId,
            io = $n ?? an.node.dataset.turnId;
          return io
            ? [{ kind: $n ? "tool" : "turn", id: io, top: an.top }]
            : [];
        });
      }
      const At = new Map();
      function qs(ye, Ae) {
        for (const qe of Ae.anchors) {
          const Mt =
              qe.kind === "tool" ? "data-scroll-anchor-id" : "data-turn-id",
            Jt = ye.querySelector(`[${Mt}="${ai(qe.id)}"]`);
          if (Jt) return Do(ye, Jt) - qe.top;
        }
        return ye.scrollHeight - Ae.oldHeight;
      }
      function Bo(ye, Ae, qe = ye.scrollTop) {
        return (
          (ye.scrollTop = qe + qs(ye, Ae)),
          (tn = ye.scrollTop),
          ye.scrollTop
        );
      }
      async function To() {
        if (
          !s.sessionId ||
          !s.loadOlderMessages ||
          s.loadingMore ||
          ts.value ||
          !s.hasMoreMessages
        )
          return;
        const ye = s.sessionId,
          Ae = ee.value,
          qe = Ae?.scrollTop ?? 0,
          Mt = {
            anchors: Ae ? po(Ae, qe) : [],
            oldHeight: Ae?.scrollHeight ?? 0,
          };
        (Ll(ye, !0), Mi());
        try {
          if (
            (await yt(),
            await s.loadOlderMessages(ye),
            await yt(),
            s.sessionId !== ye)
          ) {
            At.set(ye, Mt);
            return;
          }
          const Jt = ee.value;
          if (!Jt) return;
          (Bo(Jt, Mt), At.delete(ye));
        } finally {
          Ll(ye, !1);
        }
      }
      function ai(ye) {
        return typeof CSS < "u" && typeof CSS.escape == "function"
          ? CSS.escape(ye)
          : ye.replaceAll(/["\\]/g, "\\$&");
      }
      let Tn = null;
      function no() {
        Tn !== null && (clearTimeout(Tn), (Tn = null));
      }
      function Ks(ye) {
        (fo(),
          (je.value = !1),
          (Ke.value = at() > f1),
          ye.scrollIntoView({ behavior: "smooth", block: "center" }),
          no(),
          (Tn = setTimeout(() => {
            Tn = null;
            const Ae = ee.value;
            if (!Ae || !ye.isConnected) return;
            const qe =
              ye.getBoundingClientRect().top +
              ye.offsetHeight / 2 -
              (Ae.getBoundingClientRect().top + Ae.clientHeight / 2);
            Math.abs(qe) > 48 && (Ae.scrollTop += qe);
          }, 480)));
      }
      function ps(ye) {
        const Ae = ee.value;
        if (!Ae) return;
        const qe = Ae.querySelector(`.turn-anchor[data-turn-id="${ai(ye)}"]`);
        qe && Ks(qe);
      }
      function ui(ye, Ae) {
        const qe = ye.startContainer.parentElement;
        if (qe !== null)
          for (let Mt = qe; Mt !== null && Mt !== Ae; Mt = Mt.parentElement) {
            const Jt = getComputedStyle(Mt),
              an =
                /(auto|scroll)/.test(Jt.overflowY) &&
                Mt.scrollHeight > Mt.clientHeight,
              $n =
                /(auto|scroll)/.test(Jt.overflowX) &&
                Mt.scrollWidth > Mt.clientWidth;
            if (!an && !$n) continue;
            const io = ye.getClientRects()[0];
            if (!io) return;
            const Fs = Mt.getBoundingClientRect();
            (an &&
              (Mt.scrollTop +=
                io.top + io.height / 2 - (Fs.top + Mt.clientHeight / 2)),
              $n &&
                (Mt.scrollLeft +=
                  io.left + io.width / 2 - (Fs.left + Mt.clientWidth / 2)));
          }
      }
      function $s(ye) {
        const Ae = ee.value;
        if (!Ae) return;
        const qe = ye.startContainer.parentElement;
        (fo(),
          (je.value = !1),
          (Ke.value = at() > f1),
          (Sn = Date.now() + 700));
        const Mt = qe?.closest(".u-text-wrap.is-clamped");
        if (Mt) {
          (Mt.querySelector(".u-text-toggle")?.click(), yt(() => yo(ye, Ae)));
          return;
        }
        yo(ye, Ae);
      }
      function yo(ye, Ae) {
        const qe = ye.startContainer.parentElement;
        ui(ye, Ae);
        const Mt = ye.getClientRects()[0];
        if (!Mt) {
          qe instanceof HTMLElement && Ks(qe);
          return;
        }
        const Jt = Ae.getBoundingClientRect(),
          an = Mt.top + Mt.height / 2 - (Jt.top + Ae.clientHeight / 2),
          $n =
            typeof window > "u" ||
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        (Ae.scrollTo({
          top: Ae.scrollTop + an,
          behavior: $n ? "smooth" : "auto",
        }),
          no(),
          (Tn = setTimeout(() => {
            Tn = null;
            const io = ee.value,
              Fs = ye.getClientRects()[0];
            if (!io || !Fs) return;
            const yu = io.getBoundingClientRect(),
              Mf = Fs.top + Fs.height / 2 - (yu.top + io.clientHeight / 2);
            Math.abs(Mf) > 48 && (io.scrollTop += Mf);
          }, 480)));
      }
      function oo() {
        const ye = ee.value;
        if (!ye) return "none";
        const Ae = ye.firstElementChild,
          qe = Ae instanceof HTMLElement ? Ae.offsetHeight : 0,
          Mt = ce.value?.offsetHeight ?? 0;
        return `${ye.scrollHeight}:${ye.clientHeight}:${qe}:${Mt}`;
      }
      function uo(ye) {
        return typeof requestAnimationFrame == "function"
          ? requestAnimationFrame(ye)
          : setTimeout(ye, 16);
      }
      function Xn(ye) {
        typeof cancelAnimationFrame == "function"
          ? cancelAnimationFrame(ye)
          : clearTimeout(ye);
      }
      let co = 0,
        Qe = 0,
        it = null,
        Ct = 0;
      const en = Z(!1);
      function yn() {
        return performance.now() < co;
      }
      function Ho(ye, Ae = 200) {
        const qe = ee.value;
        if (
          !qe ||
          ts.value ||
          (fo(),
          (je.value = !1),
          (it = ye),
          (Ct = ye.getBoundingClientRect().top),
          (co = performance.now() + Ae),
          (en.value = !0),
          Qe)
        )
          return;
        const Mt = () => {
          if (((Qe = 0), !it)) return;
          if (je.value) {
            ((it = null), (en.value = !1));
            return;
          }
          if (performance.now() >= co) {
            ((it = null), (en.value = !1), Eo());
            return;
          }
          const Jt = it.getBoundingClientRect().top - Ct;
          (Jt && (qe.scrollTop += Jt), (Qe = uo(Mt)));
        };
        Qe = uo(Mt);
      }
      function Eo() {
        at() <= f1
          ? ((je.value = !0), (Ke.value = !1))
          : ((je.value = !1), (Ke.value = !0));
      }
      function Io(ye = 36, Ae) {
        if (!je.value && !Kt()) {
          Ae?.();
          return;
        }
        const qe = ++ao;
        let Mt = "",
          Jt = 0,
          an = 0;
        An && (Xn(An), (An = 0));
        const $n = () => {
          if (((An = 0), qe !== ao)) return;
          if (!je.value && !Kt()) {
            Ae?.();
            return;
          }
          Po(!1);
          const io = oo();
          ((Jt = io === Mt ? Jt + 1 : 0),
            (Mt = io),
            an++,
            Jt < 3 && an < ye ? (An = uo($n)) : Ae?.());
        };
        An = uo($n);
      }
      function Zs(ye, Ae) {
        return (
          ye !== void 0 &&
          ye.length > 0 &&
          Ae.length >= ye.length &&
          ye.firstId !== Ae.firstId &&
          ye.lastId === Ae.lastId &&
          ye.lastTextLen === Ae.lastTextLen &&
          ye.lastThinkingLen === Ae.lastThinkingLen &&
          ye.lastToolsLen === Ae.lastToolsLen &&
          ye.approvalIds === Ae.approvalIds
        );
      }
      const zo = R(() => {
        const ye = (s.approvals ?? []).map((an) => an.approvalId).join(","),
          Ae = s.turns,
          qe = Ae.at(-1),
          Mt = qe?.thinking?.length ?? 0,
          Jt =
            qe?.tools?.reduce(
              (an, $n) =>
                an +
                $n.name.length +
                ($n.arg?.length ?? 0) +
                ($n.output?.join("").length ?? 0),
              0,
            ) ?? 0;
        return {
          length: Ae.length,
          firstId: Ae[0]?.id ?? "",
          lastId: qe?.id ?? "",
          lastTextLen: qe?.text.length ?? 0,
          lastThinkingLen: Mt,
          lastToolsLen: Jt,
          approvalIds: ye,
        };
      });
      let Lo = s.fileReloadKey;
      (et(zo, async (ye, Ae) => {
        const qe = s.fileReloadKey,
          Mt = qe !== Lo;
        if (((Lo = qe), ts.value && Zs(Ae, ye))) {
          he();
          return;
        }
        if (Mt) {
          he();
          return;
        }
        (await yt(),
          je.value || Kt() ? Po(ye.length < Ae.length) : (Ke.value = !0),
          he());
      }),
        et(ce, () => {
          se();
        }),
        et(
          () => s.mobile,
          async () => {
            (await yt(), Ht());
          },
        ));
      const Wo = new Map(),
        sn = Z(!1);
      let ws = 0,
        Uo = null;
      function Mr() {
        ((sn.value = !0),
          ws && (Xn(ws), (ws = 0)),
          Uo && clearTimeout(Uo),
          (Uo = setTimeout(() => {
            ((sn.value = !1), (Uo = null));
          }, 1200)));
      }
      function Gs() {
        if (!sn.value) return;
        let ye = 2;
        const Ae = () => {
          if (((ws = 0), ye--, ye > 0)) {
            ws = uo(Ae);
            return;
          }
          ((sn.value = !1), Uo && (clearTimeout(Uo), (Uo = null)));
        };
        (ws && Xn(ws), (ws = uo(Ae)));
      }
      (et(
        () => s.fileReloadKey,
        async (ye, Ae) => {
          const qe = ee.value;
          (Ae &&
            qe &&
            Wo.set(String(Ae), { top: qe.scrollTop, following: je.value }),
            fo(),
            Mr(),
            await yt());
          const Mt = ee.value,
            Jt = ye ? Wo.get(String(ye)) : void 0;
          if (Jt && Mt) {
            const an = At.get(String(ye)),
              $n = an ? Bo(Mt, an, Jt.top) : Jt.top;
            (an && At.delete(String(ye)),
              (je.value = Jt.following),
              (Mt.scrollTop = $n),
              (tn = Mt.scrollTop),
              (Ke.value = !Jt.following && at() > 1),
              Jt.following ? Io(36, Gs) : Gs());
          } else ((je.value = !0), (tn = 0), Po(!1), Io(36, Gs));
          (Ee(), ne());
        },
      ),
        et(
          () => s.sessionLoading,
          async (ye, Ae) => {
            ye || !Ae || ((je.value = !0), await yt(), Io(36, Gs), he());
          },
        ),
        et(
          () => s.turnActive,
          async (ye, Ae) => {
            ye || !Ae || (!je.value && !Kt()) || (await yt(), Io(48), he());
          },
        ));
      function Vi() {
        ((je.value = !0),
          (Ke.value = !1),
          (Wt = Date.now() + dS),
          yt(() => {
            (Po(!0), Io(16));
          }));
      }
      function Ys(ye) {
        (Vi(), i("submit", ye));
      }
      function jo(ye) {
        ((je.value = !0),
          (Ke.value = !1),
          (Wt = Date.now() + dS),
          i("editMessage", ye));
      }
      function Vo(ye) {
        const Ae = s.queued?.[ye],
          qe = Ae?.text ?? "";
        y(qe, Ae?.attachments) && i("editQueued", ye);
      }
      function Il(ye) {
        i("reorderQueue", ye);
      }
      function cr(ye, Ae) {
        (Vi(), i("answer", ye, Ae));
      }
      function Tr(ye, Ae) {
        !ye || !Ae || i("approval", ye, Ae);
      }
      let ho = null,
        ko = null,
        qi = null,
        gt = null,
        Le = 0,
        Ge = 0,
        Xt = 0;
      const hs = Z(new Set()),
        ts = R(() => !!s.sessionId && hs.value.has(s.sessionId));
      function Ll(ye, Ae) {
        const qe = new Set(hs.value);
        (Ae ? qe.add(ye) : qe.delete(ye), (hs.value = qe));
      }
      function tl() {
        ts.value ||
          Xt ||
          (Xt = uo(() => {
            ((Xt = 0), !ts.value && (yn() || ((je.value || Kt()) && Po(!1))));
          }));
      }
      function Mi() {
        (ao++, An && (Xn(An), (An = 0)), Xt && (Xn(Xt), (Xt = 0)));
      }
      function fo() {
        const ye = ee.value;
        if (
          ((Wt = 0),
          (Sn = 0),
          Mi(),
          (co = 0),
          (it = null),
          (en.value = !1),
          Mn && (Xn(Mn), (Mn = 0)),
          no(),
          ye)
        ) {
          const Ae = ye.scrollTop;
          typeof ye.scrollTo == "function"
            ? ye.scrollTo({ top: Ae, behavior: "auto" })
            : (ye.scrollTop = Ae);
        }
        ((to = 0), (fn = Number.NEGATIVE_INFINITY), ye && (tn = ye.scrollTop));
      }
      function Ki() {
        const ye = ee.value;
        !ye ||
          (ye.scrollHeight - ye.clientHeight <= 1 && !s.hasMoreMessages) ||
          ((je.value = !1),
          fo(),
          ye.scrollHeight - ye.clientHeight > 1 && (Ke.value = !0));
      }
      function Er(ye) {
        const Ae = ee.value;
        if (!Ae) return !1;
        for (const qe of ye.composedPath()) {
          if (qe === Ae) return !1;
          if (
            qe instanceof HTMLElement &&
            qe.scrollHeight > qe.clientHeight + 1 &&
            qe.scrollTop > 1
          )
            return !0;
        }
        return !1;
      }
      function ci(ye) {
        ye.defaultPrevented ||
          ye.ctrlKey ||
          ye.shiftKey ||
          (no(), !(ye.deltaY >= 0 || Er(ye)) && Ki());
      }
      function $l(ye) {
        const Ae = ee.value;
        if (
          !Ae ||
          ye.defaultPrevented ||
          ye.button !== 0 ||
          ye.pointerType === "touch"
        )
          return;
        const qe = Ae.getBoundingClientRect(),
          Mt = Ae.offsetWidth - Ae.clientWidth,
          Jt = Mt > 0 ? Mt : 12;
        ye.target === Ae && ye.clientX >= qe.right - Jt && Ki();
      }
      let qo = null;
      function Ir(ye) {
        qo = ye.touches.length === 1 ? ye.touches[0].clientY : null;
      }
      function Xs(ye) {
        const Ae = ye.touches.length === 1 ? ye.touches[0].clientY : null;
        (no(),
          Ae !== null && qo !== null && Ae > qo + 2 && !Er(ye) && Ki(),
          (qo = Ae));
      }
      function di() {
        if (!ko) return;
        const ye = ee.value?.firstElementChild ?? null;
        ye !== qi && (qi && ko.unobserve(qi), (qi = ye), ye && ko.observe(ye));
      }
      function se() {
        if (!ko) return;
        const ye = ce.value;
        ye !== gt && (gt && ko.unobserve(gt), (gt = ye), ye && ko.observe(ye));
      }
      function xe() {
        const ye = ee.value;
        (Ht(),
          ho &&
            (ho.disconnect(),
            ye &&
              ho.observe(ye, {
                childList: !0,
                subtree: !0,
                characterData: !0,
              })),
          ko &&
            (ko.disconnect(),
            (qi = null),
            (gt = null),
            ye && ko.observe(ye),
            di(),
            se()),
          (Le = ye?.scrollHeight ?? 0),
          (Ge = ye?.clientHeight ?? 0),
          ve(),
          Ee());
      }
      function J() {
        (di(), tl(), ve(), Ee());
      }
      function we() {
        typeof document > "u" ||
          (document.visibilityState === "visible" && je.value && Io());
      }
      const $e = Z(!1);
      let He = null;
      function vt() {
        (($e.value = !0),
          He !== null && clearTimeout(He),
          (He = setTimeout(() => {
            $e.value = !1;
          }, OLe)));
      }
      const ut = Z(null);
      let Pt = null;
      const Tt = Z(null);
      let ln = null,
        so = !1;
      function Rt() {
        ((ut.value = null),
          (Tt.value = null),
          (so = !1),
          Pt !== null && (clearTimeout(Pt), (Pt = null)),
          ln !== null && (clearTimeout(ln), (ln = null)));
      }
      function Ot() {
        for (let ye = s.turns.length - 1; ye >= 0; ye--) {
          const Ae = s.turns[ye];
          if (Ae.goalContinuation) return null;
          if (Ae.role === "user") return Ae;
        }
        return null;
      }
      function Zn(ye) {
        return na(ye).some(
          (Ae) =>
            (Ae.kind === "thinking" && Ae.thinking.trim().length > 0) ||
            (Ae.kind === "text" && Ae.text.trim().length > 0) ||
            Ae.kind === "tool",
        );
      }
      function bo() {
        if (
          ut.value !== null ||
          Tt.value !== null ||
          !s.working ||
          (s.queued?.length ?? 0) > 0
        )
          return;
        const ye = Ot();
        if (
          ye === null ||
          ye.skillActivation !== void 0 ||
          ye.pluginCommand !== void 0
        )
          return;
        s.turns
          .slice(s.turns.indexOf(ye) + 1)
          .every((qe) => qe.role === "assistant" && !Zn(qe))
          ? ((Tt.value = ye.id),
            (so = !1),
            (ln = setTimeout(() => {
              Tt.value = null;
            }, DLe)))
          : (ut.value = ye.id);
      }
      let ms = !1,
        Ns = null;
      function Js(ye) {
        if (ms) return;
        Rt();
        const Ae = s.turns.find((Mt) => Mt.id === ye);
        Ae === void 0 ||
          Ae.role !== "user" ||
          Ot()?.id !== Ae.id ||
          (_.value ?? w.value)?.isEmpty?.() === !1 ||
          ((ms = !0),
          (Ns = setTimeout(() => {
            ((ms = !1), (Ns = null));
          }, BLe)),
          jo({ text: Ae.text, attachments: Ae.attachments }));
      }
      function $c() {
        Tt.value === null || s.working || !so || Js(Tt.value);
      }
      (et(
        () => s.working,
        (ye, Ae) => {
          if (!(Ae !== !0 || ye)) {
            if (Tt.value !== null) {
              $c();
              return;
            }
            ut.value !== null &&
              Pt === null &&
              (Pt = setTimeout(() => {
                ((ut.value = null), (Pt = null));
              }, PLe));
          }
        },
      ),
        et(
          () => Ot()?.id ?? null,
          (ye, Ae) => {
            ye !== Ae && Rt();
          },
        ),
        et(() => s.sessionId, Rt),
        et(
          () => s.queued?.length,
          (ye) => {
            (ye ?? 0) > 0 && Rt();
          },
        ));
      const V2 = R(() => {
          if (s.lastTurnReason !== "cancelled" || s.working || s.turnActive)
            return null;
          const ye = s.turns[s.turns.length - 1];
          return ye?.role === "assistant" && Zn(ye) ? ye.id : null;
        }),
        Nc = R(
          () =>
            s.lastTurnReason === "failed" &&
            !s.working &&
            !s.turnActive &&
            s.turns.length > 0,
        );
      function vu() {
        (Vi(),
          i("submit", {
            text: o("conversation.turnFailedResumeText"),
            attachments: [],
          }));
      }
      const Fc = R(() => (s.working ? null : ut.value));
      function Rc() {
        i("interrupt");
      }
      function q2() {
        return (_.value?.anyPopupOpen ?? w.value?.anyPopupOpen) === !0;
      }
      const {
        handleCompositionStart: Nl,
        handleCompositionEnd: fi,
        isComposingKeyEvent: Sf,
      } = Sr();
      let l0 = null;
      function a0(ye) {
        l0 = ye.target;
      }
      function Af(ye) {
        const Ae = ye instanceof Element && ye !== document.body ? ye : l0,
          qe = pLe(Ae, ".global-preview");
        if (qe) {
          cS(qe);
          return;
        }
        const Mt = ee.value?.querySelector(".chat");
        Mt && cS(Mt);
      }
      function u0(ye) {
        if (!(
          ye.target instanceof Element &&
          ye.target.closest(".terminal-host") !== null
        )) {
          if (
            ye.key === "Escape" &&
            !s.overlayOpen &&
            !q2() &&
            !ye.defaultPrevented &&
            !ye.repeat &&
            !Sf(ye)
          ) {
            Fc.value !== null
              ? (ye.preventDefault(), Js(Fc.value))
              : s.working && (ye.preventDefault(), bo(), Rc());
            return;
          }
          if ($Ie(ye) && !s.overlayOpen && s.turns.length > 0) {
            (ye.preventDefault(), st());
            return;
          }
          dLe(ye) &&
            !s.overlayOpen &&
            !fLe(ye.target) &&
            (ye.preventDefault(), Af(ye.target));
        }
      }
      function c0() {
        je.value && tl();
      }
      (dn(() => {
        yt(() => {
          (typeof MutationObserver == "function" &&
            (ho = new MutationObserver(J)),
            typeof ResizeObserver == "function" &&
              (ko = new ResizeObserver(() => {
                (ve(), Ee(), Ht());
                const ye = ee.value;
                if (!ye) return;
                const { scrollHeight: Ae, clientHeight: qe } = ye,
                  Mt = Ae > Le + 1,
                  Jt = qe < Ge - 1;
                ((Le = Ae), (Ge = qe), !yn() && (Mt || Jt) && tl());
              })),
            xe(),
            Io(48),
            ne(),
            ee.value?.addEventListener("kimi-table-layout", G),
            typeof document < "u" &&
              (document.addEventListener("visibilitychange", we),
              document.addEventListener("keydown", u0),
              document.addEventListener("pointerdown", a0, !0),
              document.addEventListener("compositionstart", Nl),
              document.addEventListener("compositionend", fi)),
            window.visualViewport?.addEventListener("resize", c0));
        });
      }),
        kn(() => {
          (ee.value?.removeEventListener("kimi-table-layout", G),
            ho && ho.disconnect(),
            ko && ko.disconnect(),
            Xt && Xn(Xt),
            An && Xn(An),
            Qe && Xn(Qe),
            Mn && Xn(Mn),
            oe && Xn(oe),
            de && Xn(de),
            Tn !== null && clearTimeout(Tn),
            zt && clearTimeout(zt),
            He !== null && clearTimeout(He),
            Pt !== null && clearTimeout(Pt),
            ln !== null && clearTimeout(ln),
            Ns !== null && clearTimeout(Ns),
            k !== null && (clearTimeout(k), (k = null)),
            typeof document < "u" &&
              (document.removeEventListener("visibilitychange", we),
              document.removeEventListener("keydown", u0),
              document.removeEventListener("pointerdown", a0, !0),
              document.removeEventListener("compositionstart", Nl),
              document.removeEventListener("compositionend", fi)),
            window.visualViewport?.removeEventListener("resize", c0));
        }));
      function Oc() {
        (_.value ?? w.value)?.focus();
      }
      mLe({
        sessionId: () => s.sessionId,
        mobile: () => s.mobile === !0,
        starting: () => s.starting === !0,
        dockedComposer: _,
        emptyComposer: w,
      });
      function K2() {
        vt();
      }
      function Z2(ye) {
        if (Tt.value !== null) {
          if (!ye) {
            so || Rt();
            return;
          }
          ((so = !0), $c());
        }
      }
      return (
        t({
          loadComposerForEdit: y,
          focusComposer: Oc,
          notifyUndone: K2,
          onAbortOutcome: Z2,
          selectAllRegion: Af,
        }),
        (ye, Ae) => (
          b(),
          A(
            "section",
            { class: Re(["con", { mobile: e.mobile }]) },
            [
              !e.mobile && !(e.turns.length === 0 && !e.sessionLoading)
                ? (b(),
                  me(
                    lSe,
                    {
                      key: 0,
                      "session-id": e.sessionId,
                      "workspace-name": e.workspaceName,
                      "workspace-root": e.workspaceRoot,
                      "session-title": e.sessionTitle,
                      branch: e.gitInfo?.branch,
                      ahead: e.gitInfo?.ahead,
                      behind: e.gitInfo?.behind,
                      "changes-count": F.value,
                      "git-diff-stats": e.gitDiffStats,
                      "is-git-repo": !!e.gitInfo,
                      pr: e.pr,
                      copied: v.value,
                      onOpenChanges:
                        Ae[0] || (Ae[0] = (qe) => i("openChanges")),
                      onCopyAll:
                        Ae[1] || (Ae[1] = (qe) => m.value?.copyConversation()),
                      onCopyFinalSummary:
                        Ae[2] || (Ae[2] = (qe) => m.value?.copyFinalSummary()),
                      onOpenPr:
                        Ae[3] ||
                        (Ae[3] = (qe) => e.pr && i("openPr", e.pr.url)),
                      onRenameSession:
                        Ae[4] ||
                        (Ae[4] = (qe, Mt) => i("renameSession", qe, Mt)),
                      onForkSession:
                        Ae[5] || (Ae[5] = (qe) => i("forkSession", qe)),
                      onArchiveSession:
                        Ae[6] || (Ae[6] = (qe) => i("archiveSession", qe)),
                      onExportSession:
                        Ae[7] || (Ae[7] = (qe) => i("exportSession", qe)),
                    },
                    null,
                    8,
                    [
                      "session-id",
                      "workspace-name",
                      "workspace-root",
                      "session-title",
                      "branch",
                      "ahead",
                      "behind",
                      "changes-count",
                      "git-diff-stats",
                      "is-git-repo",
                      "pr",
                      "copied",
                    ],
                  ))
                : e.mobile
                  ? te("", !0)
                  : (b(),
                    A(
                      "div",
                      {
                        key: 1,
                        class: Re(["empty-drag", { "macos-desktop": p(uc) }]),
                      },
                      null,
                      2,
                    )),
              V(
                IIe,
                {
                  items: K.value,
                  "active-turn-id": ie.value,
                  mobile: e.mobile,
                  "session-loading": e.sessionLoading,
                  occluded: pe.value,
                  onSelect: ps,
                },
                null,
                8,
                [
                  "items",
                  "active-turn-id",
                  "mobile",
                  "session-loading",
                  "occluded",
                ],
              ),
              C(
                "div",
                { class: "chat-layout", style: Gt(Ye.value) },
                [
                  C(
                    "div",
                    {
                      ref: Yt,
                      class: Re([
                        "panes chat-scroll",
                        {
                          "is-following": je.value,
                          "history-prepending": ts.value,
                          "is-pinned": en.value,
                          scrolling: Ze.value,
                          "session-settling": sn.value,
                        },
                      ]),
                      onScrollPassive: Co,
                      onWheelPassive: ci,
                      onPointerdownPassive: $l,
                      onTouchstartPassive: Ir,
                      onTouchmovePassive: Xs,
                    },
                    [
                      C(
                        "div",
                        {
                          class: Re([
                            "content-wrap",
                            [e.mobile ? "align-mobile" : "align-center"],
                          ]),
                        },
                        [
                          e.turns.length === 0 && !e.sessionLoading
                            ? (b(),
                              A(
                                Pe,
                                { key: 0 },
                                [
                                  Ae[55] ||
                                    (Ae[55] = C(
                                      "div",
                                      { class: "empty-spacer" },
                                      null,
                                      -1,
                                    )),
                                  C("div", gLe, [
                                    e.starting
                                      ? (b(),
                                        A("span", yLe, [
                                          V(p(Ao), { size: "sm" }),
                                          C(
                                            "span",
                                            null,
                                            N(p(o)("conversation.starting")),
                                            1,
                                          ),
                                        ]))
                                      : (b(),
                                        me(
                                          lLe,
                                          { key: 0, class: "empty-doodle" },
                                          {
                                            fallback: ke(() => [
                                              C(
                                                "span",
                                                vLe,
                                                N(
                                                  p(o)(
                                                    "composer.emptyConversationTitle",
                                                  ),
                                                ),
                                                1,
                                              ),
                                            ]),
                                            _: 1,
                                          },
                                        )),
                                    e.starting
                                      ? te("", !0)
                                      : (b(),
                                        A(
                                          "span",
                                          kLe,
                                          N(p(o)("composer.emptyConversation")),
                                          1,
                                        )),
                                  ]),
                                  d.value
                                    ? (b(),
                                      A("div", bLe, [
                                        V(p(Ie), {
                                          class: "upgrade-banner-icon",
                                          name: "music",
                                          size: "sm",
                                        }),
                                        C(
                                          "span",
                                          CLe,
                                          N(p(o)("composer.upgradeBanner")),
                                          1,
                                        ),
                                        C(
                                          "button",
                                          {
                                            type: "button",
                                            class: "upgrade-banner-cta",
                                            onClick:
                                              Ae[8] ||
                                              (Ae[8] = (qe) => p(o0)()),
                                          },
                                          N(p(o)("sidebar.upgrade")),
                                          1,
                                        ),
                                      ]))
                                    : te("", !0),
                                  V(
                                    oF,
                                    {
                                      ref_key: "emptyComposerRef",
                                      ref: w,
                                      class: "empty-composer",
                                      "session-id": e.sessionId,
                                      running: e.running,
                                      working: e.working,
                                      queued: e.queued,
                                      "search-files": e.searchFiles,
                                      "upload-image": e.uploadImage,
                                      status: e.status,
                                      thinking: e.thinking,
                                      "plan-mode": e.planMode,
                                      "swarm-mode": e.swarmMode,
                                      "goal-mode": e.goalMode,
                                      goal: e.goal,
                                      "activation-badges": e.activationBadges,
                                      models: e.models,
                                      "auth-ready": e.authReady,
                                      "managed-signed-in": e.managedSignedIn,
                                      "managed-membership": e.managedMembership,
                                      "starred-ids": e.starredIds,
                                      skills: e.skills,
                                      starting: e.starting,
                                      "hide-context": "",
                                      onSubmit: Ys,
                                      onSteer:
                                        Ae[11] ||
                                        (Ae[11] = (qe) => i("steer", qe)),
                                      onCommand:
                                        Ae[12] ||
                                        (Ae[12] = (qe) => i("command", qe)),
                                      onInterrupt: Rc,
                                      onUnqueue:
                                        Ae[13] ||
                                        (Ae[13] = (qe) => i("unqueue", qe)),
                                      onEditQueued:
                                        Ae[14] ||
                                        (Ae[14] = (qe) => i("editQueued", qe)),
                                      onSetPermission:
                                        Ae[15] ||
                                        (Ae[15] = (qe) =>
                                          i("setPermission", qe)),
                                      onSetThinking:
                                        Ae[16] ||
                                        (Ae[16] = (qe) => i("setThinking", qe)),
                                      onTogglePlan:
                                        Ae[17] ||
                                        (Ae[17] = (qe) => i("togglePlan")),
                                      onToggleSwarm:
                                        Ae[18] ||
                                        (Ae[18] = (qe) => i("toggleSwarm")),
                                      onToggleGoal:
                                        Ae[19] ||
                                        (Ae[19] = (qe) => i("toggleGoal")),
                                      onOpenBtw:
                                        Ae[20] ||
                                        (Ae[20] = (qe) =>
                                          i("command", {
                                            cmd: "/btw",
                                            attachments: [],
                                          })),
                                      onCreateGoal:
                                        Ae[21] ||
                                        (Ae[21] = (qe) => i("createGoal", qe)),
                                      onControlGoal:
                                        Ae[22] ||
                                        (Ae[22] = (qe) => i("controlGoal", qe)),
                                      onFocusGoal: U,
                                      onCompact:
                                        Ae[23] ||
                                        (Ae[23] = (qe) => i("compact")),
                                      onPickModel:
                                        Ae[24] ||
                                        (Ae[24] = (qe) => i("pickModel")),
                                      onSelectModel:
                                        Ae[25] ||
                                        (Ae[25] = (qe) => i("selectModel", qe)),
                                      onLogin:
                                        Ae[26] || (Ae[26] = (qe) => i("login")),
                                    },
                                    cA({ _: 2 }, [
                                      e.starting
                                        ? void 0
                                        : {
                                            name: "footer",
                                            fn: ke(() => [
                                              C("div", wLe, [
                                                c.value
                                                  ? (b(),
                                                    A("div", _Le, [
                                                      V(
                                                        p(Pn),
                                                        {
                                                          text: p(o)(
                                                            "conversation.switchWorkspace",
                                                          ),
                                                        },
                                                        {
                                                          default: ke(() => [
                                                            C(
                                                              "button",
                                                              {
                                                                type: "button",
                                                                class: Re([
                                                                  "ws-chip",
                                                                  {
                                                                    open: r.value,
                                                                  },
                                                                ]),
                                                                "aria-expanded":
                                                                  r.value,
                                                                onClick: Et(h, [
                                                                  "stop",
                                                                ]),
                                                              },
                                                              [
                                                                V(p(Ie), {
                                                                  name: "folder",
                                                                }),
                                                                C(
                                                                  "span",
                                                                  SLe,
                                                                  N(u.value),
                                                                  1,
                                                                ),
                                                                V(p(Ie), {
                                                                  class:
                                                                    "ws-chip-chev",
                                                                  name: "chevron-down",
                                                                  size: "sm",
                                                                }),
                                                              ],
                                                              10,
                                                              xLe,
                                                            ),
                                                          ]),
                                                          _: 1,
                                                        },
                                                        8,
                                                        ["text"],
                                                      ),
                                                      r.value
                                                        ? (b(),
                                                          A(
                                                            "div",
                                                            {
                                                              key: 0,
                                                              class: Re([
                                                                "ws-panel",
                                                                { up: l.value },
                                                              ]),
                                                              style: Gt(
                                                                a.value
                                                                  ? {
                                                                      maxHeight:
                                                                        a.value,
                                                                    }
                                                                  : void 0,
                                                              ),
                                                              role: "menu",
                                                            },
                                                            [
                                                              C(
                                                                "div",
                                                                ALe,
                                                                N(
                                                                  p(o)(
                                                                    "workspace.recentLabel",
                                                                  ),
                                                                ),
                                                                1,
                                                              ),
                                                              (b(!0),
                                                              A(
                                                                Pe,
                                                                null,
                                                                pt(
                                                                  f.value,
                                                                  (qe) => (
                                                                    b(),
                                                                    A(
                                                                      "button",
                                                                      {
                                                                        key: qe.id,
                                                                        type: "button",
                                                                        class:
                                                                          Re([
                                                                            "ws-row",
                                                                            {
                                                                              on:
                                                                                qe.id ===
                                                                                e.activeWorkspaceId,
                                                                            },
                                                                          ]),
                                                                        role: "menuitem",
                                                                        onClick:
                                                                          Et(
                                                                            (
                                                                              Mt,
                                                                            ) =>
                                                                              g(
                                                                                qe.id,
                                                                              ),
                                                                            [
                                                                              "stop",
                                                                            ],
                                                                          ),
                                                                      },
                                                                      [
                                                                        V(
                                                                          p(Ie),
                                                                          {
                                                                            name: "folder",
                                                                          },
                                                                        ),
                                                                        C(
                                                                          "span",
                                                                          TLe,
                                                                          [
                                                                            C(
                                                                              "span",
                                                                              ELe,
                                                                              N(
                                                                                qe.name,
                                                                              ),
                                                                              1,
                                                                            ),
                                                                            C(
                                                                              "span",
                                                                              ILe,
                                                                              N(
                                                                                qe.shortPath,
                                                                              ),
                                                                              1,
                                                                            ),
                                                                          ],
                                                                        ),
                                                                        qe.id ===
                                                                        e.activeWorkspaceId
                                                                          ? (b(),
                                                                            me(
                                                                              p(
                                                                                Ie,
                                                                              ),
                                                                              {
                                                                                key: 0,
                                                                                class:
                                                                                  "ws-check",
                                                                                name: "check",
                                                                                size: "sm",
                                                                              },
                                                                            ))
                                                                          : te(
                                                                              "",
                                                                              !0,
                                                                            ),
                                                                      ],
                                                                      10,
                                                                      MLe,
                                                                    )
                                                                  ),
                                                                ),
                                                                128,
                                                              )),
                                                              Ae[54] ||
                                                                (Ae[54] = C(
                                                                  "div",
                                                                  {
                                                                    class:
                                                                      "ws-divider",
                                                                  },
                                                                  null,
                                                                  -1,
                                                                )),
                                                              C(
                                                                "button",
                                                                {
                                                                  type: "button",
                                                                  class:
                                                                    "ws-action",
                                                                  role: "menuitem",
                                                                  onClick:
                                                                    Ae[9] ||
                                                                    (Ae[9] = Et(
                                                                      (qe) => {
                                                                        ((r.value =
                                                                          !1),
                                                                          i(
                                                                            "addWorkspace",
                                                                          ));
                                                                      },
                                                                      ["stop"],
                                                                    )),
                                                                },
                                                                [
                                                                  V(p(Ie), {
                                                                    name: "folder-plus",
                                                                  }),
                                                                  C(
                                                                    "span",
                                                                    null,
                                                                    N(
                                                                      p(o)(
                                                                        "conversation.pickFolder",
                                                                      ),
                                                                    ),
                                                                    1,
                                                                  ),
                                                                ],
                                                              ),
                                                            ],
                                                            6,
                                                          ))
                                                        : te("", !0),
                                                    ]))
                                                  : (b(),
                                                    A(
                                                      "button",
                                                      {
                                                        key: 1,
                                                        type: "button",
                                                        class:
                                                          "ws-chip ws-ghost",
                                                        onClick:
                                                          Ae[10] ||
                                                          (Ae[10] = (qe) =>
                                                            i("addWorkspace")),
                                                      },
                                                      [
                                                        V(p(Ie), {
                                                          name: "folder-plus",
                                                        }),
                                                        C(
                                                          "span",
                                                          null,
                                                          N(
                                                            p(o)(
                                                              "conversation.pickFolder",
                                                            ),
                                                          ),
                                                          1,
                                                        ),
                                                      ],
                                                    )),
                                              ]),
                                            ]),
                                            key: "0",
                                          },
                                    ]),
                                    1032,
                                    [
                                      "session-id",
                                      "running",
                                      "working",
                                      "queued",
                                      "search-files",
                                      "upload-image",
                                      "status",
                                      "thinking",
                                      "plan-mode",
                                      "swarm-mode",
                                      "goal-mode",
                                      "goal",
                                      "activation-badges",
                                      "models",
                                      "auth-ready",
                                      "managed-signed-in",
                                      "managed-membership",
                                      "starred-ids",
                                      "skills",
                                      "starting",
                                    ],
                                  ),
                                  r.value
                                    ? (b(),
                                      A("div", {
                                        key: 1,
                                        class: "ws-backdrop",
                                        onClick:
                                          Ae[27] ||
                                          (Ae[27] = (qe) => (r.value = !1)),
                                      }))
                                    : te("", !0),
                                  Ae[56] ||
                                    (Ae[56] = C(
                                      "div",
                                      { class: "empty-spacer" },
                                      null,
                                      -1,
                                    )),
                                ],
                                64,
                              ))
                            : (b(),
                              me(
                                J5,
                                {
                                  ref_key: "chatPaneRef",
                                  ref: m,
                                  key: e.fileReloadKey ?? "no-session",
                                  turns: e.turns,
                                  cwd: e.status.cwd,
                                  approvals: e.approvals,
                                  questions: e.questions,
                                  "turn-active": e.turnActive,
                                  working: e.working,
                                  "session-loading": e.sessionLoading,
                                  compaction: e.compaction,
                                  "has-more-messages": e.hasMoreMessages,
                                  "loading-more": e.loadingMore,
                                  "loading-more-error": e.loadingMoreError,
                                  "is-following": je.value,
                                  queued: e.queued,
                                  "undo-hint-turn-id": Fc.value,
                                  "interrupted-turn-id": V2.value,
                                  "turn-failed": Nc.value,
                                  "turn-error": e.turnError ?? null,
                                  "turn-retry": e.turnRetry ?? null,
                                  onResumeTurn: vu,
                                  onOpenFile:
                                    Ae[28] ||
                                    (Ae[28] = (qe) => i("openFile", qe)),
                                  onOpenMedia:
                                    Ae[29] ||
                                    (Ae[29] = (qe) => i("openMedia", qe)),
                                  onOpenTurnDiff:
                                    Ae[30] ||
                                    (Ae[30] = (qe) => i("openTurnDiff", qe)),
                                  onCopyConversationCopied: x,
                                  onOpenCompaction:
                                    Ae[31] ||
                                    (Ae[31] = (qe) => i("openCompaction", qe)),
                                  onOpenAgent:
                                    Ae[32] ||
                                    (Ae[32] = (qe) => i("openAgent", qe)),
                                  onEditMessage: jo,
                                  onArmedUndo: Js,
                                  onLoadOlderMessages: To,
                                  onUnqueue:
                                    Ae[33] ||
                                    (Ae[33] = (qe) => i("unqueue", qe)),
                                  onEditQueued: Vo,
                                  onReorderQueue: Il,
                                },
                                null,
                                8,
                                [
                                  "turns",
                                  "cwd",
                                  "approvals",
                                  "questions",
                                  "turn-active",
                                  "working",
                                  "session-loading",
                                  "compaction",
                                  "has-more-messages",
                                  "loading-more",
                                  "loading-more-error",
                                  "is-following",
                                  "queued",
                                  "undo-hint-turn-id",
                                  "interrupted-turn-id",
                                  "turn-failed",
                                  "turn-error",
                                  "turn-retry",
                                ],
                              )),
                        ],
                        2,
                      ),
                    ],
                    34,
                  ),
                  e.turns.length === 0 && !e.sessionLoading
                    ? te("", !0)
                    : (b(),
                      me(
                        _Ie,
                        {
                          key: 0,
                          ref: _n,
                          style: Gt(Oe.value),
                          "session-id": e.sessionId,
                          running: e.running,
                          working: e.working,
                          starting: e.starting,
                          queued: e.queued,
                          "search-files": e.searchFiles,
                          "upload-image": e.uploadImage,
                          status: e.status,
                          thinking: e.thinking,
                          "plan-mode": e.planMode,
                          "swarm-mode": e.swarmMode,
                          "goal-mode": e.goalMode,
                          "activation-badges": e.activationBadges,
                          models: e.models,
                          "auth-ready": e.authReady,
                          "managed-signed-in": e.managedSignedIn,
                          "managed-membership": e.managedMembership,
                          "starred-ids": e.starredIds,
                          skills: e.skills,
                          goal: e.goal,
                          "dock-panel": O.value,
                          "bash-tasks": M.value,
                          "subagent-tasks": $.value,
                          "bash-running": S.value,
                          "subagent-running": I.value,
                          "todo-done-count": B.value,
                          "has-dock-work": H.value,
                          todos: e.todos,
                          "pending-question": fe.value,
                          "question-busy-kind": Ce.value,
                          "pending-approval": ge.value,
                          "approval-busy": Q.value,
                          mobile: e.mobile,
                          onToggleDockPanel: Ae[34] || (Ae[34] = (qe) => W(qe)),
                          onCloseDockPanel: Ae[35] || (Ae[35] = (qe) => z()),
                          onOpenAgent:
                            Ae[36] || (Ae[36] = (qe) => i("openAgent", qe)),
                          "open-file": (qe) => i("openFile", qe),
                          onAnswer: cr,
                          onDismiss:
                            Ae[37] || (Ae[37] = (qe) => i("dismiss", qe)),
                          onApproval: Tr,
                          onCancelTask:
                            Ae[38] || (Ae[38] = (qe) => i("cancelTask", qe)),
                          onControlGoal:
                            Ae[39] || (Ae[39] = (qe) => i("controlGoal", qe)),
                          onSubmit: Ys,
                          onSteer: Ae[40] || (Ae[40] = (qe) => i("steer", qe)),
                          onCommand:
                            Ae[41] || (Ae[41] = (qe) => i("command", qe)),
                          onInterrupt: Rc,
                          onSetPermission:
                            Ae[42] || (Ae[42] = (qe) => i("setPermission", qe)),
                          onSetThinking:
                            Ae[43] || (Ae[43] = (qe) => i("setThinking", qe)),
                          onTogglePlan:
                            Ae[44] || (Ae[44] = (qe) => i("togglePlan")),
                          onToggleSwarm:
                            Ae[45] || (Ae[45] = (qe) => i("toggleSwarm")),
                          onToggleGoal:
                            Ae[46] || (Ae[46] = (qe) => i("toggleGoal")),
                          onOpenBtw:
                            Ae[47] ||
                            (Ae[47] = (qe) =>
                              i("command", { cmd: "/btw", attachments: [] })),
                          onCreateGoal:
                            Ae[48] || (Ae[48] = (qe) => i("createGoal", qe)),
                          onFocusGoal: U,
                          onCompact: Ae[49] || (Ae[49] = (qe) => i("compact")),
                          onPickModel:
                            Ae[50] || (Ae[50] = (qe) => i("pickModel")),
                          onSelectModel:
                            Ae[51] || (Ae[51] = (qe) => i("selectModel", qe)),
                          onLogin: Ae[52] || (Ae[52] = (qe) => i("login")),
                        },
                        null,
                        8,
                        [
                          "style",
                          "session-id",
                          "running",
                          "working",
                          "starting",
                          "queued",
                          "search-files",
                          "upload-image",
                          "status",
                          "thinking",
                          "plan-mode",
                          "swarm-mode",
                          "goal-mode",
                          "activation-badges",
                          "models",
                          "auth-ready",
                          "managed-signed-in",
                          "managed-membership",
                          "starred-ids",
                          "skills",
                          "goal",
                          "dock-panel",
                          "bash-tasks",
                          "subagent-tasks",
                          "bash-running",
                          "subagent-running",
                          "todo-done-count",
                          "has-dock-work",
                          "todos",
                          "pending-question",
                          "question-busy-kind",
                          "pending-approval",
                          "approval-busy",
                          "mobile",
                          "open-file",
                        ],
                      )),
                ],
                4,
              ),
              Ue.value
                ? (b(),
                  me(
                    nLe,
                    {
                      key: 2,
                      ref_key: "transcriptSearchRef",
                      ref: _e,
                      pane: ee.value,
                      mobile: e.mobile,
                      reveal: $s,
                      onClose: Fe,
                    },
                    null,
                    8,
                    ["pane", "mobile"],
                  ))
                : te("", !0),
              V(
                as,
                { name: "pill" },
                {
                  default: ke(() => [
                    Ke.value
                      ? (b(),
                        A(
                          "button",
                          {
                            key: 0,
                            class: "newmsg-pill",
                            style: Gt({ bottom: `${Se.value + 12}px` }),
                            "aria-label": p(o)("conversation.jumpToLatestAria"),
                            onClick: Ae[53] || (Ae[53] = (qe) => Po(!0)),
                          },
                          [
                            V(p(Ie), {
                              class: "pill-chevron",
                              name: "arrow-down",
                              size: "sm",
                            }),
                            Ve(" " + N(p(o)("conversation.newMessages")), 1),
                          ],
                          12,
                          LLe,
                        ))
                      : te("", !0),
                  ]),
                  _: 1,
                },
              ),
              V(
                as,
                { name: "undo-toast" },
                {
                  default: ke(() => [
                    $e.value
                      ? (b(),
                        A("div", $Le, [
                          C("span", NLe, N(p(o)("conversation.undone")), 1),
                        ]))
                      : te("", !0),
                  ]),
                  _: 1,
                },
              ),
            ],
            2,
          )
        )
      );
    },
  }),
  zLe = ht(HLe, [["__scopeId", "data-v-5c8c2c41"]]),
  WLe = { key: 0, class: "fp-empty fp-error" },
  ULe = { key: 1, class: "fp-empty" },
  jLe = { key: 2, class: "fp-loading" },
  VLe = { class: "fp-path" },
  qLe = { class: "fp-meta" },
  KLe = { key: 0, class: "fp-lines" },
  ZLe = { class: "fp-size" },
  GLe = { key: 3, class: "fp-search" },
  YLe = ["placeholder"],
  XLe = { key: 0, class: "fp-search-count" },
  JLe = ["href", "aria-label"],
  QLe = { key: 1, class: "fp-code" },
  e$e = { key: 1, class: "fp-body fp-code" },
  t$e = { key: 2, class: "fp-body" },
  n$e = ["srcdoc", "title"],
  o$e = { key: 1, class: "fp-code" },
  s$e = { key: 3, class: "fp-body fp-pdf-wrap" },
  i$e = ["src", "title"],
  r$e = { key: 1, class: "fp-binary-card" },
  l$e = { class: "fp-binary-label" },
  a$e = { key: 4, class: "fp-body fp-table-wrap" },
  u$e = { class: "fp-table" },
  c$e = ["data-line"],
  d$e = { key: 5, class: "fp-body fp-image-wrap" },
  f$e = ["src", "alt"],
  p$e = { key: 1, class: "fp-binary-card" },
  h$e = { class: "fp-binary-icon" },
  m$e = { class: "fp-binary-label" },
  g$e = { key: 6, class: "fp-body fp-code" },
  v$e = { key: 7, class: "fp-body fp-binary-wrap" },
  y$e = { class: "fp-binary-card" },
  k$e = { class: "fp-binary-icon" },
  b$e = { class: "fp-binary-label" },
  C$e = tt({
