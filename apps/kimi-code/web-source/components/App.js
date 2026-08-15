    __name: "App",
    setup(e) {
      hfe();
      const t = Z(!1);
      let n = null;
      const o = hu(),
        s = R(() => !o.dangerousBypassAuth.value && t.value);
      (En("resolveImage", o.resolveImageUrl),
        En(
          "resolveSwarmMembers",
          (gt) => o.swarmMembersByToolCallId.value.get(gt) ?? [],
        ),
        En("modelDisplay", (gt) => WUe(gt, o.models.value)));
      const { t: i } = Lt();
      En("subagentEffort", (gt) => UUe(gt));
      const { confirm: r } = pu(),
        l = Qr(),
        a = BUe(),
        u = Z(!1),
        c = Z(!1),
        d = R(() => {
          const gt = o.activeSessionId.value;
          return o.sessions.value.find((Le) => Le.id === gt)?.title ?? "";
        }),
        f = R(() => {
          const gt = o.activeSessionId.value;
          return (
            o.sessions.value.find((Le) => Le.id === gt)?.lastTurnReason ?? null
          );
        }),
        h = R(() => o.visibleWorkspace.value?.sessionCount ?? 0),
        g = R(() => o.activity.value !== "idle");
      bUe({ running: g });
      function m(gt) {
        const Le = o.models.value.find(
            (ts) => ts.id === o.status.value.modelId,
          ),
          Ge = Jp(Le),
          Xt = Ge.indexOf(bg(Le, gt)),
          hs = Ge[(Xt + 1) % Ge.length] ?? Ge[0] ?? "off";
        return E5(Le, hs);
      }
      const w = R(() => {
          const gt = o.models.value.find(
            (Le) => Le.id === o.status.value.modelId,
          );
          return bg(gt, o.thinking.value);
        }),
        _ = Z(!o.onboarded.value);
      function v() {
        (o.setOnboarded(!0), (_.value = !1));
      }
      function k() {
        (v(), (co.value = "providers"), (po.value = !0));
      }
      let y = 0;
      function x() {
        const gt = window.visualViewport,
          Le = document.documentElement.style;
        (Le.setProperty(
          "--app-height",
          `${gt?.height ?? window.innerHeight}px`,
        ),
          Le.setProperty("--app-top", `${gt?.offsetTop ?? 0}px`));
      }
      function M() {
        y ||
          (y = requestAnimationFrame(() => {
            ((y = 0), x());
          }));
      }
      (dn(() => {
        ((n = yfe(() => {
          ((t.value = !0), o.clearDangerousBypassAuth());
        })),
          o.load(),
          he(),
          x(),
          window.visualViewport?.addEventListener("resize", M),
          window.visualViewport?.addEventListener("scroll", M),
          window.addEventListener("resize", M),
          document.addEventListener("keydown", $, !0));
      }),
        kn(() => {
          (document.removeEventListener("keydown", $, !0),
            window.visualViewport?.removeEventListener("resize", M),
            window.visualViewport?.removeEventListener("scroll", M),
            window.removeEventListener("resize", M),
            y && (cancelAnimationFrame(y), (y = 0)),
            document.documentElement.style.removeProperty("--app-height"),
            document.documentElement.style.removeProperty("--app-top"),
            n !== null && (n(), (n = null)));
        }));
      function $(gt) {
        gt.key === "Escape" &&
          (To.value || (An() && (gt.stopPropagation(), gt.preventDefault())));
      }
      const S = Z(null),
        {
          previewTarget: I,
          previewFile: P,
          previewLoading: D,
          previewError: T,
          previewDownloadUrl: L,
          previewExternalActions: B,
          openFilePreview: H,
          openMediaPreview: O,
          closeFilePreview: F,
          openPreviewInEditor: W,
          revealPreviewFile: z,
        } = OUe({ client: o, detailTarget: S }),
        U = R(() => S.value !== null),
        {
          SIDEBAR_WIDTH_KEY: q,
          SIDEBAR_DEFAULT: K,
          SIDEBAR_MIN: ie,
          sidebarMax: ne,
          sessionColWidth: Y,
          sidebarCollapsed: le,
          sidebarDragging: Ee,
          sideWidth: de,
          loadSidebarCollapsed: he,
          toggleSidebarCollapse: pe,
        } = FUe({ previewOpen: U }),
        {
          PREVIEW_WIDTH_KEY: oe,
          PREVIEW_MIN: ve,
          previewDefaultWidth: G,
          previewMax: X,
          previewWidth: fe,
          previewPanelWidth: Ce,
          compactionPanelText: ge,
          compactionPanelVisible: Q,
          openCompactionPanel: ee,
          closeCompactionPanel: ce,
          agentPanelMember: ue,
          agentPanelTurns: Se,
          agentPanelLoading: Ue,
          agentPanelLoadError: _e,
          agentPanelLoadingMore: Te,
          agentPanelLoadMoreError: st,
          agentPanelHasMore: Fe,
          agentPanelRunning: Oe,
          openAgentPanel: Ye,
          closeAgentPanel: ft,
          loadOlderAgentMessages: $t,
          detailDiffMode: Ht,
          detailDiffPath: Yt,
          openDiffDetail: _n,
          closeDiffDetail: je,
          selectDiffFile: Ke,
          turnDiffChange: Ze,
          openTurnDiff: zt,
          closeTurnDiff: at,
          btwVisible: tn,
          openSideChatTab: Wt,
          closeSideChat: fn,
          sidePanelVisible: Sn,
          panelDragging: to,
          closeOpenSidePanel: An,
        } = IUe({
          client: o,
          sideWidth: de,
          detailTarget: S,
          closeFilePreview: F,
        }),
        ao = Z(null);
      function Kt(gt) {
        ao.value?.style.setProperty("--preview-w", `${gt}px`);
      }
      et(
        [ao, Ce],
        ([gt, Le]) => gt?.style.setProperty("--preview-w", `${Le}px`),
        { immediate: !0 },
      );
      const Co = Z(null),
        Po = Z(!1),
        Mn = Z(!1),
        bn = Z(!1),
        Do = Z(!1),
        po = Z(!1);
      let At;
      (dn(() => {
        At = window.kimiDesktop?.onMenuAction?.((gt) => {
          gt === "open-settings" ? (po.value = !0) : gt === "new-chat" && ho();
        });
      }),
        kn(() => {
          At?.();
        }));
      const qs = Z(null),
        Bo = Z(null),
        To = R(
          () =>
            ki.value > 0 ||
            Po.value ||
            Mn.value ||
            bn.value ||
            Do.value ||
            po.value ||
            _.value ||
            u.value ||
            c.value,
        ),
        ai = Z(!1),
        Tn = Z(!1),
        no = Z(!1);
      async function Ks() {
        ((ai.value = !0), (Tn.value = !1), (Po.value = !0));
        try {
          await o.refreshAllProviders();
        } catch {
          Tn.value = !0;
        } finally {
          ai.value = !1;
        }
      }
      function ps() {
        Mn.value = !0;
      }
      async function ui() {
        await r({
          title: i("sidebar.logoutConfirmTitle"),
          message: i("sidebar.logoutConfirmMessage"),
          variant: "danger",
          action: () => o.logout(),
        });
      }
      async function $s(gt) {
        ((Po.value = !1), await yo(gt));
      }
      async function yo(gt) {
        (await o.setModel(gt)) &&
          gt !== o.defaultModel.value &&
          o.updateConfig({ defaultModel: gt });
      }
      const oo = Z(null);
      async function uo(gt) {
        (await o.archiveSession(gt),
          !o.sessionsForView.value.some((Le) => Le.id === gt) &&
            (oo.value = { id: gt }));
      }
      async function Xn() {
        const gt = oo.value;
        gt && (await o.restoreSession(gt.id)) && (oo.value = null);
      }
      const co = Z(void 0),
        Qe = Z(void 0);
      et(c, (gt) => {
        gt || (Qe.value = void 0);
      });
      function it() {
        ((oo.value = null),
          a.value
            ? ((Qe.value = "archived"), (c.value = !0))
            : ((co.value = "archived"), (po.value = !0)));
      }
      async function Ct(gt) {
        const Le =
          o.workspacesView.value.find((Ge) => Ge.id === gt)?.name ?? gt;
        await r({
          title: i("sidebar.removeWorkspace"),
          message: i("workspace.removeWorkspaceConfirm", { name: Le }),
          variant: "danger",
          action: () => o.deleteWorkspace(gt),
        });
      }
      async function en(gt) {
        no.value = !0;
        try {
          (await o.updateConfig(gt)) && (await o.checkAuth());
        } finally {
          no.value = !1;
        }
      }
      async function yn() {
        return o.startOAuthLogin();
      }
      async function Ho() {
        return o.pollOAuthLogin();
      }
      async function Eo() {
        return o.cancelOAuthLogin();
      }
      async function Io() {
        ((Mn.value = !1), await o.checkAuth(), await o.load());
      }
      async function Zs() {
        (v(), await o.checkAuth(), await o.load());
      }
      async function zo(gt) {
        (await o.undo(1)) !== null &&
          (await yt(),
          Co.value?.loadComposerForEdit(gt.text, gt.attachments),
          Co.value?.notifyUndone());
      }
      async function Lo() {
        const gt = await o.abortCurrentPrompt();
        Co.value?.onAbortOutcome(gt);
      }
      function Wo(gt) {
        const Le = _t();
        return gt.map((Ge) => ({
          kind: Ge.kind,
          url: Le.getFileUrl(Ge.fileId),
          fileId: Ge.fileId,
          name: Ge.name,
        }));
      }
      async function sn(gt, Le) {
        if (o.authReady.value) return !0;
        const Ge = o.managedProviderStatus.value === "authenticated";
        Ge &&
          o.managedMembership.value === null &&
          (await o.probeManagedMembership());
        const Xt = Ge && o.managedMembership.value === "free",
          hs = await r(
            Xt
              ? {
                  title: i("login.upgradeRequiredTitle"),
                  message: i("login.upgradeRequiredMessage"),
                  confirmLabel: i("sidebar.upgrade"),
                  variant: "primary",
                }
              : {
                  title: i("login.requiredTitle"),
                  message: i("login.requiredMessage"),
                  confirmLabel: i("login.goToLogin"),
                  variant: "primary",
                },
          );
        return (
          Co.value?.loadComposerForEdit(gt, Wo(Le)),
          hs && (Xt ? o0() : ps()),
          !1
        );
      }
      async function ws(gt, Le = []) {
        if (o.activeSessionId.value || o.activeWorkspaceId.value) return !0;
        const Ge = await r({
          title: i("workspace.requiredTitle"),
          message: i("workspace.requiredMessage"),
          confirmLabel: i("conversation.pickFolder"),
          variant: "primary",
        });
        return (
          Co.value?.loadComposerForEdit(gt, Wo(Le)),
          Ge && (bn.value = !0),
          !1
        );
      }
      async function Uo(gt, Le = []) {
        return (await sn(gt, Le)) ? ws(gt, Le) : !1;
      }
      async function Mr(gt) {
        const { cmd: Le, attachments: Ge } = gt;
        if (Le === "/compact" || Le.startsWith("/compact ")) {
          if (!(await Uo(Le))) return;
          o.compact(Le.slice(8).trim() || void 0);
          return;
        }
        if (Le === "/swarm" || Le.startsWith("/swarm ")) {
          const Xt = Le.slice(6).trim();
          if (Xt === "on") o.setSwarmMode(!0);
          else if (Xt === "off") o.setSwarmMode(!1);
          else if (Xt) {
            if (!(await Uo(Le))) return;
            (o.setSwarmMode(!0), o.sendPrompt(Xt));
          } else o.toggleSwarmMode();
          return;
        }
        if (Le === "/goal" || Le.startsWith("/goal ")) {
          const Xt = Le.slice(5).trim();
          if (Xt === "pause" || Xt === "resume" || Xt === "cancel")
            o.controlGoal(Xt);
          else if (Xt) {
            if (!(await Uo(Le))) return;
            o.createGoal(Xt);
          } else o.toggleGoalMode();
          return;
        }
        if (Le === "/btw" || Le.startsWith("/btw ")) {
          const Xt = Le.slice(4).trim();
          if (!Xt && o.sideChatVisible.value) fn();
          else {
            if (Xt && !(await Uo(Le))) return;
            Wt(Xt || void 0);
          }
          return;
        }
        switch (Le) {
          case "/new":
          case "/clear":
            ho();
            break;
          case "/fork":
            o.forkSession();
            break;
          case "/export":
            o.exportSession();
            break;
          case "/undo":
            o.undo();
            break;
          case "/plan":
            o.togglePlanMode();
            break;
          case "/auto":
            o.setPermission("auto");
            break;
          case "/yolo":
            o.setPermission("yolo");
            break;
          case "/thinking":
            o.setThinking(m(o.thinking.value));
            break;
          case "/status":
            Do.value = !0;
            break;
          case "/login":
            ps();
            break;
          default: {
            const Xt = Le.indexOf(" "),
              hs = aMe((Xt === -1 ? Le : Le.slice(0, Xt)).slice(1)),
              ts = Xt === -1 ? void 0 : Le.slice(Xt + 1).trim() || void 0;
            if (!hs) break;
            if (!(await Uo(Le, Ge))) return;
            !o.activeSessionId.value && o.activeWorkspaceId.value
              ? o.startSessionAndActivateSkill(
                  o.activeWorkspaceId.value,
                  hs,
                  ts,
                  Ge,
                )
              : o.activateSkill(hs, ts, Ge);
            break;
          }
        }
      }
      function Gs(gt) {
        o.unqueue(gt);
      }
      function Vi(gt) {
        o.unqueue(gt);
      }
      function Ys(gt) {
        o.reorderQueue(gt.from, gt.to);
      }
      async function jo(gt) {
        if (!(await sn(gt.text, gt.attachments))) return;
        const Le = o.activeWorkspaceId.value;
        if (!o.activeSessionId.value && Le) {
          await o.startSessionAndSendPrompt(Le, gt.text, gt.attachments);
          return;
        }
        if (!o.activeSessionId.value && !Le) {
          ((qs.value = gt),
            (await r({
              title: i("workspace.requiredTitle"),
              message: i("workspace.requiredMessage"),
              confirmLabel: i("conversation.pickFolder"),
              variant: "primary",
            }))
              ? (bn.value = !0)
              : Vo());
          return;
        }
        o.sendPrompt(gt.text, gt.attachments);
      }
      function Vo() {
        const gt = qs.value;
        ((qs.value = null),
          gt && Co.value?.loadComposerForEdit(gt.text, Wo(gt.attachments)));
      }
      async function Il(gt) {
        if (((Bo.value = null), !(await o.addWorkspaceByPath(gt)))) {
          Bo.value = i("workspace.addFailed");
          return;
        }
        bn.value = !1;
        const Ge = qs.value;
        qs.value = null;
        const Xt = o.activeWorkspaceId.value;
        Ge &&
          Xt &&
          (await o.startSessionAndSendPrompt(Xt, Ge.text, Ge.attachments));
      }
      function cr() {
        (Vo(), (Bo.value = null), (bn.value = !1));
      }
      function Tr() {
        yt(() => {
          Co.value?.focusComposer();
        });
      }
      function ho() {
        const gt = o.activeWorkspaceId.value;
        (gt ? o.openWorkspaceDraft(gt) : o.clearActiveSession(), Tr());
      }
      function ko(gt) {
        (o.openWorkspaceDraft(gt), Tr());
      }
      function qi(gt) {
        gt && window.open(gt, "_blank", "noopener");
      }
      return (gt, Le) => (
        b(),
        A("div", KUe, [
          s.value ? (b(), me(zUe, { key: 0 })) : te("", !0),
          C(
            "div",
            {
              class: Re([
                "app",
                {
                  mobile: p(a),
                  "sidebar-collapsed": p(le) && !p(a),
                  "macos-desktop": p(uc),
                },
              ]),
              inert: _.value,
            },
            [
              p(a)
                ? (b(),
                  me(
                    GBe,
                    {
                      key: 1,
                      workspace: p(o).visibleWorkspace.value,
                      "session-title": d.value,
                      running: g.value,
                      branch: p(o).status.value.branch,
                      "session-count": h.value,
                      onOpenSwitcher:
                        Le[22] || (Le[22] = (Ge) => (u.value = !0)),
                      onOpenSettings:
                        Le[23] || (Le[23] = (Ge) => (c.value = !0)),
                    },
                    null,
                    8,
                    [
                      "workspace",
                      "session-title",
                      "running",
                      "branch",
                      "session-count",
                    ],
                  ))
                : (b(),
                  A(
                    Pe,
                    { key: 0 },
                    [
                      V(
                        a5e,
                        {
                          collapsed: p(le),
                          dragging: p(Ee),
                          "col-width": p(de),
                          "active-workspace": p(o).visibleWorkspace.value,
                          "active-workspace-id": p(o).activeWorkspaceId.value,
                          sessions: p(o).sessionsForView.value,
                          groups: p(o).workspaceGroups.value,
                          "pinned-sessions": p(o).pinnedSessions.value,
                          "flat-sessions": p(o).flatSessions.value,
                          "flat-has-more": p(o).flatSessionsHasMore.value,
                          "flat-loading-more":
                            p(o).flatSessionsLoadingMore.value,
                          initialized: p(o).initialized.value,
                          "active-id": p(o).activeSessionId.value,
                          "attention-by-session": p(o).attentionBySession.value,
                          "pending-by-session": p(o).pendingBySession.value,
                          "unread-by-session": p(o).unreadBySession.value,
                          onSelect:
                            Le[0] || (Le[0] = (Ge) => p(o).selectSession(Ge)),
                          onCreate: ho,
                          onCreateInWorkspace:
                            Le[1] || (Le[1] = (Ge) => ko(Ge)),
                          onSelectWorkspace:
                            Le[2] || (Le[2] = (Ge) => p(o).openWorkspace(Ge)),
                          onAddWorkspace:
                            Le[3] || (Le[3] = (Ge) => (bn.value = !0)),
                          onRename:
                            Le[4] ||
                            (Le[4] = (Ge, Xt) => p(o).renameSession(Ge, Xt)),
                          onArchive: Le[5] || (Le[5] = (Ge) => uo(Ge)),
                          onFork:
                            Le[6] || (Le[6] = (Ge) => p(o).forkSession(Ge)),
                          onExport:
                            Le[7] || (Le[7] = (Ge) => p(o).exportSession(Ge)),
                          onPin:
                            Le[8] ||
                            (Le[8] = (Ge) => p(o).togglePinSession(Ge)),
                          onUnpin:
                            Le[9] || (Le[9] = (Ge) => p(o).unpinSession(Ge)),
                          onReorderPinned:
                            Le[10] ||
                            (Le[10] = (Ge) => p(o).reorderPinnedSessions(Ge)),
                          onPinAt:
                            Le[11] ||
                            (Le[11] = (Ge, Xt, hs) =>
                              p(o).pinSessionAt(Ge, Xt, hs)),
                          onRenameWorkspace:
                            Le[12] ||
                            (Le[12] = (Ge, Xt) => p(o).renameWorkspace(Ge, Xt)),
                          onDeleteWorkspace:
                            Le[13] || (Le[13] = (Ge) => Ct(Ge)),
                          onReorderWorkspaces:
                            Le[14] ||
                            (Le[14] = (Ge) => p(o).reorderWorkspaces(Ge)),
                          onLoadMoreSessions:
                            Le[15] ||
                            (Le[15] = (Ge) => void p(o).loadMoreSessions(Ge)),
                          onLoadAllSessions:
                            Le[16] ||
                            (Le[16] = (Ge) => void p(o).loadAllSessions()),
                          onEnsureFlatSessions:
                            Le[17] ||
                            (Le[17] = (Ge) => void p(o).ensureFlatSessions()),
                          onLoadMoreFlatSessions:
                            Le[18] ||
                            (Le[18] = (Ge) => void p(o).loadMoreFlatSessions()),
                          onOpenSettings:
                            Le[19] || (Le[19] = (Ge) => (po.value = !0)),
                          onLogin: ps,
                          onCollapse: p(pe),
                        },
                        null,
                        8,
                        [
                          "collapsed",
                          "dragging",
                          "col-width",
                          "active-workspace",
                          "active-workspace-id",
                          "sessions",
                          "groups",
                          "pinned-sessions",
                          "flat-sessions",
                          "flat-has-more",
                          "flat-loading-more",
                          "initialized",
                          "active-id",
                          "attention-by-session",
                          "pending-by-session",
                          "unread-by-session",
                          "onCollapse",
                        ],
                      ),
                      In(
                        V(
                          $x,
                          {
                            class: "side-handle",
                            "storage-key": p(q),
                            "default-width": p(K),
                            min: p(ie),
                            max: p(ne),
                            "onUpdate:width":
                              Le[20] || (Le[20] = (Ge) => (Y.value = Ge)),
                            "onUpdate:dragging":
                              Le[21] || (Le[21] = (Ge) => (Ee.value = Ge)),
                          },
                          null,
                          8,
                          ["storage-key", "default-width", "min", "max"],
                        ),
                        [[Es, !p(le)]],
                      ),
                    ],
                    64,
                  )),
              V(
                zLe,
                {
                  ref_key: "conversationPaneRef",
                  ref: Co,
                  mobile: p(a),
                  turns: p(o).turns.value,
                  "session-id": p(o).activeSessionId.value,
                  approvals: p(o).pendingApprovals.value,
                  changes: p(o).changes.value,
                  "git-info": p(o).gitInfo.value,
                  tasks: p(o).tasks.value,
                  todos: p(o).todos.value,
                  goal: p(o).goal.value,
                  "activation-badges": p(o).activationBadges.value,
                  status: p(o).status.value,
                  thinking: p(o).thinking.value,
                  "plan-mode": p(o).planMode.value,
                  "swarm-mode": p(o).swarmMode.value,
                  "goal-mode": p(o).goalMode.value,
                  models: p(o).models.value,
                  "auth-ready": p(o).authReady.value,
                  "managed-signed-in":
                    p(o).managedProviderStatus.value === "authenticated",
                  "managed-membership": p(o).managedMembership.value,
                  "starred-ids": p(o).starredModelIds.value,
                  skills: p(o).skills.value,
                  questions: p(o).questions.value,
                  "pending-question-actions": p(o).pendingQuestionActions,
                  "pending-approval-actions": p(o).pendingApprovalActions,
                  running: g.value,
                  "overlay-open": To.value,
                  "turn-active": p(o).turnActive.value,
                  queued: p(o).queued.value,
                  "search-files": p(o).searchFiles,
                  "upload-image": p(o).uploadImage,
                  working: p(o).working.value,
                  "last-turn-reason": f.value,
                  "turn-error": p(o).activeTurnError.value ?? null,
                  "turn-retry": p(o).activeTurnRetry.value ?? null,
                  starting: p(o).isStartingFirstPrompt.value,
                  "file-reload-key": p(o).activeSessionId.value,
                  "session-loading": p(o).sessionLoading.value,
                  compaction: p(o).compaction.value,
                  "has-more-messages": p(o).hasMoreMessages.value,
                  "loading-more": p(o).loadingMoreMessages.value,
                  "loading-more-error": p(o).loadMoreMessagesError.value,
                  "load-older-messages": p(o).loadOlderMessages,
                  "workspace-name": p(o).visibleWorkspace.value?.name,
                  "workspace-root":
                    p(o).visibleWorkspace.value?.root ?? p(o).status.value.cwd,
                  "git-diff-stats": p(o).gitDiffStats.value,
                  workspaces: p(o).workspacesView.value,
                  "active-workspace-id": p(o).activeWorkspaceId.value,
                  "session-title": d.value,
                  pr: p(o).activePullRequest.value,
                  onOpenChanges: Le[24] || (Le[24] = (Ge) => p(_n)()),
                  onSelectWorkspace: Le[25] || (Le[25] = (Ge) => ko(Ge)),
                  onAddWorkspace: Le[26] || (Le[26] = (Ge) => (bn.value = !0)),
                  onOpenPr: qi,
                  onSubmit: Le[27] || (Le[27] = (Ge) => jo(Ge)),
                  onLogin: Le[28] || (Le[28] = (Ge) => ps()),
                  onSteer:
                    Le[29] ||
                    (Le[29] = (Ge) =>
                      p(o).steerPrompt(Ge.text, Ge.attachments)),
                  onApproval:
                    Le[30] ||
                    (Le[30] = (Ge, Xt) => p(o).respondApproval(Ge, Xt)),
                  onCancelTask:
                    Le[31] || (Le[31] = (Ge) => p(o).cancelTask(Ge)),
                  onAnswer:
                    Le[32] ||
                    (Le[32] = (Ge, Xt) => p(o).respondQuestion(Ge, Xt)),
                  onDismiss:
                    Le[33] || (Le[33] = (Ge) => p(o).dismissQuestion(Ge)),
                  onCommand: Mr,
                  onInterrupt: Lo,
                  onUnqueue: Gs,
                  onEditQueued: Vi,
                  onReorderQueue: Ys,
                  onSetPermission:
                    Le[34] || (Le[34] = (Ge) => p(o).setPermission(Ge)),
                  onSetThinking:
                    Le[35] || (Le[35] = (Ge) => p(o).setThinking(Ge)),
                  onTogglePlan:
                    Le[36] || (Le[36] = (Ge) => p(o).togglePlanMode()),
                  onToggleSwarm:
                    Le[37] || (Le[37] = (Ge) => p(o).toggleSwarmMode()),
                  onToggleGoal:
                    Le[38] || (Le[38] = (Ge) => p(o).toggleGoalMode()),
                  onCreateGoal:
                    Le[39] || (Le[39] = (Ge) => p(o).createGoal(Ge)),
                  onControlGoal:
                    Le[40] || (Le[40] = (Ge) => p(o).controlGoal(Ge)),
                  onRefreshGitStatus:
                    Le[41] ||
                    (Le[41] = (Ge) =>
                      p(o).activeSessionId.value &&
                      p(o).loadGitStatus(p(o).activeSessionId.value)),
                  onRenameSession:
                    Le[42] || (Le[42] = (Ge, Xt) => p(o).renameSession(Ge, Xt)),
                  onForkSession:
                    Le[43] || (Le[43] = (Ge) => p(o).forkSession(Ge)),
                  onArchiveSession: Le[44] || (Le[44] = (Ge) => uo(Ge)),
                  onExportSession:
                    Le[45] || (Le[45] = (Ge) => p(o).exportSession(Ge)),
                  onCompact: Le[46] || (Le[46] = (Ge) => p(o).compact()),
                  onPickModel: Le[47] || (Le[47] = (Ge) => Ks()),
                  onSelectModel: Le[48] || (Le[48] = (Ge) => yo(Ge)),
                  onOpenFile: Le[49] || (Le[49] = (Ge) => p(H)(Ge)),
                  onOpenMedia: Le[50] || (Le[50] = (Ge) => p(O)(Ge)),
                  onOpenTurnDiff: Le[51] || (Le[51] = (Ge) => p(zt)(Ge)),
                  onOpenCompaction: Le[52] || (Le[52] = (Ge) => p(ee)(Ge)),
                  onOpenAgent: Le[53] || (Le[53] = (Ge) => p(Ye)(Ge)),
                  onEditMessage: zo,
                },
                null,
                8,
                [
                  "mobile",
                  "turns",
                  "session-id",
                  "approvals",
                  "changes",
                  "git-info",
                  "tasks",
                  "todos",
                  "goal",
                  "activation-badges",
                  "status",
                  "thinking",
                  "plan-mode",
                  "swarm-mode",
                  "goal-mode",
                  "models",
                  "auth-ready",
                  "managed-signed-in",
                  "managed-membership",
                  "starred-ids",
                  "skills",
                  "questions",
                  "pending-question-actions",
                  "pending-approval-actions",
                  "running",
                  "overlay-open",
                  "turn-active",
                  "queued",
                  "search-files",
                  "upload-image",
                  "working",
                  "last-turn-reason",
                  "turn-error",
                  "turn-retry",
                  "starting",
                  "file-reload-key",
                  "session-loading",
                  "compaction",
                  "has-more-messages",
                  "loading-more",
                  "loading-more-error",
                  "load-older-messages",
                  "workspace-name",
                  "workspace-root",
                  "git-diff-stats",
                  "workspaces",
                  "active-workspace-id",
                  "session-title",
                  "pr",
                ],
              ),
              !p(a) && (p(uc) || p(le))
                ? (b(),
                  me(
                    p(gn),
                    {
                      key: 2,
                      class: "sidebar-toggle-btn",
                      size: "sm",
                      label: p(le)
                        ? p(i)("sidebar.expandSidebar")
                        : p(i)("sidebar.collapseSidebar"),
                      onClick: p(pe),
                    },
                    {
                      default: ke(() => [
                        V(
                          p(Ie),
                          { name: p(le) ? "panel-expand" : "panel-collapse" },
                          null,
                          8,
                          ["name"],
                        ),
                      ]),
                      _: 1,
                    },
                    8,
                    ["label", "onClick"],
                  ))
                : te("", !0),
              !p(a) && p(le)
                ? (b(),
                  me(
                    p(gn),
                    {
                      key: 3,
                      class: "new-chat-btn",
                      size: "sm",
                      label: p(i)("sidebar.newChat"),
                      onClick: ho,
                    },
                    {
                      default: ke(() => [V(p(Ie), { name: "chat-new" })]),
                      _: 1,
                    },
                    8,
                    ["label"],
                  ))
                : te("", !0),
              p(Sn) && !p(a)
                ? (b(),
                  me(
                    $x,
                    {
                      key: 4,
                      class: "preview-handle",
                      "storage-key": p(oe),
                      "default-width": p(G),
                      min: p(ve),
                      max: p(X),
                      reverse: "",
                      "aria-label": p(i)("layout.resizePreviewAria"),
                      "apply-live": Kt,
                      "onUpdate:width":
                        Le[54] || (Le[54] = (Ge) => (fe.value = Ge)),
                      "onUpdate:dragging":
                        Le[55] || (Le[55] = (Ge) => (to.value = Ge)),
                    },
                    null,
                    8,
                    [
                      "storage-key",
                      "default-width",
                      "min",
                      "max",
                      "aria-label",
                    ],
                  ))
                : te("", !0),
              !p(a) || p(Sn)
                ? (b(),
                  A(
                    "aside",
                    {
                      key: 5,
                      ref_key: "previewPanelEl",
                      ref: ao,
                      class: Re([
                        "global-preview",
                        { open: p(Sn), mobile: p(a) },
                      ]),
                      role: "complementary",
                      "aria-label": p(i)("layout.detailPanelAria"),
                      "aria-hidden": !p(Sn),
                    },
                    [
                      S.value === "compaction" && p(Q)
                        ? (b(),
                          me(
                            S$e,
                            {
                              key: 0,
                              text: p(ge) ?? "",
                              subtitle: p(i)("conversation.summaryTitle"),
                              onClose: p(ce),
                            },
                            null,
                            8,
                            ["text", "subtitle", "onClose"],
                          ))
                        : S.value === "agent" && p(ue)
                          ? (b(),
                            me(
                              $$e,
                              {
                                key: 1,
                                member: p(ue),
                                turns: p(Se),
                                running: p(Oe),
                                loading: p(Ue),
                                "load-error": p(_e),
                                "has-more": p(Fe),
                                "loading-more": p(Te),
                                "load-more-error": p(st),
                                onClose: p(ft),
                                onLoadOlderMessages: p($t),
                                onOpenAgent: p(Ye),
                                onOpenFile: p(H),
                                onOpenMedia: p(O),
                                onOpenTurnDiff:
                                  Le[56] || (Le[56] = (Ge) => p(zt)(Ge)),
                              },
                              null,
                              8,
                              [
                                "member",
                                "turns",
                                "running",
                                "loading",
                                "load-error",
                                "has-more",
                                "loading-more",
                                "load-more-error",
                                "onClose",
                                "onLoadOlderMessages",
                                "onOpenAgent",
                                "onOpenFile",
                                "onOpenMedia",
                              ],
                            ))
                          : S.value === "btw" && p(tn)
                            ? (b(),
                              me(
                                H$e,
                                {
                                  key: 2,
                                  turns: p(o).sideChatTurns.value,
                                  running: p(o).sideChatRunning.value,
                                  sending: p(o).sideChatSending.value,
                                  onSend:
                                    Le[57] ||
                                    (Le[57] = (Ge) =>
                                      p(o).sendSideChatPrompt(Ge)),
                                  onClose: p(fn),
                                },
                                null,
                                8,
                                ["turns", "running", "sending", "onClose"],
                              ))
                            : S.value === "diff"
                              ? (b(),
                                me(
                                  hNe,
                                  {
                                    key: 3,
                                    mode: p(Ht),
                                    changes: p(o).changes.value,
                                    "git-info": p(o).gitInfo.value,
                                    "file-diff": p(o).fileDiff.value,
                                    "full-texts": p(o).fileDiffTexts.value,
                                    "empty-file": p(o).fileDiffEmptyFile.value,
                                    "selected-diff-path":
                                      p(o).selectedDiffPath.value,
                                    "file-diff-loading":
                                      p(o).fileDiffLoading.value,
                                    closable: "",
                                    onOpen: p(Ke),
                                    onBack:
                                      Le[58] ||
                                      (Le[58] = (Ge) => {
                                        ((Ht.value = "list"),
                                          (Yt.value = null),
                                          p(o).clearFileDiff());
                                      }),
                                    onClose: p(je),
                                  },
                                  null,
                                  8,
                                  [
                                    "mode",
                                    "changes",
                                    "git-info",
                                    "file-diff",
                                    "full-texts",
                                    "empty-file",
                                    "selected-diff-path",
                                    "file-diff-loading",
                                    "onOpen",
                                    "onClose",
                                  ],
                                ))
                              : S.value === "file"
                                ? (b(),
                                  me(
                                    w$e,
                                    {
                                      key: 4,
                                      file: p(P),
                                      loading: p(D),
                                      error: p(T),
                                      line: p(I)?.line,
                                      "download-url": p(L),
                                      closable: "",
                                      "external-actions": p(B),
                                      "open-file": p(H),
                                      onClose: p(F),
                                      onOpenExternal: p(W),
                                      onReveal: p(z),
                                    },
                                    null,
                                    8,
                                    [
                                      "file",
                                      "loading",
                                      "error",
                                      "line",
                                      "download-url",
                                      "external-actions",
                                      "open-file",
                                      "onClose",
                                      "onOpenExternal",
                                      "onReveal",
                                    ],
                                  ))
                                : S.value === "turn-diff" && p(Ze)
                                  ? (b(),
                                    me(
                                      bNe,
                                      {
                                        key: 5,
                                        change: p(Ze),
                                        cwd: p(o).status.value.cwd,
                                        closable: "",
                                        onClose: p(at),
                                        onOpenFile:
                                          Le[59] ||
                                          (Le[59] = (Ge) => p(H)({ path: Ge })),
                                      },
                                      null,
                                      8,
                                      ["change", "cwd", "onClose"],
                                    ))
                                  : te("", !0),
                    ],
                    10,
                    GUe,
                  ))
                : te("", !0),
              V(qUe, { class: "internal-build-fab" }),
              Po.value
                ? (b(),
                  me(
                    ONe,
                    {
                      key: 6,
                      models: p(o).models.value,
                      current: p(o).status.value.modelId,
                      "starred-ids": p(o).starredModelIds.value,
                      loading: ai.value,
                      unavailable: Tn.value,
                      onSelect: Le[60] || (Le[60] = (Ge) => $s(Ge)),
                      onToggleStar:
                        Le[61] || (Le[61] = (Ge) => p(o).toggleStarModel(Ge)),
                      onClose: Le[62] || (Le[62] = (Ge) => (Po.value = !1)),
                    },
                    null,
                    8,
                    [
                      "models",
                      "current",
                      "starred-ids",
                      "loading",
                      "unavailable",
                    ],
                  ))
                : te("", !0),
              po.value
                ? (b(),
                  me(
                    KDe,
                    {
                      key: 7,
                      "color-scheme": p(o).colorScheme.value,
                      "font-scale": p(o).fontScale.value,
                      "managed-provider-status":
                        p(o).managedProviderStatus.value,
                      "managed-user-info": p(o).managedUserInfo.value,
                      "on-fetch-usage": p(o).getUsage,
                      notify: p(o).notifyEnabled.value,
                      "notify-permission": p(o).notifyPermission.value,
                      "notify-sound": p(o).notifySound.value,
                      config: p(o).config.value,
                      models: p(o).models.value,
                      "config-saving": no.value,
                      "server-version": p(o).serverVersion.value,
                      backend: p(o).backend.value,
                      "experimental-flags": p(o).experimentalFlags.value,
                      "initial-tab": co.value,
                      onSetColorScheme:
                        Le[63] || (Le[63] = (Ge) => p(o).setColorScheme(Ge)),
                      onSetFontScale:
                        Le[64] || (Le[64] = (Ge) => p(o).setFontScale(Ge)),
                      onSetNotify:
                        Le[65] || (Le[65] = (Ge) => p(o).setNotifyEnabled(Ge)),
                      onSetNotifySound:
                        Le[66] || (Le[66] = (Ge) => p(o).setNotifySound(Ge)),
                      onUpdateConfig: Le[67] || (Le[67] = (Ge) => en(Ge)),
                      onLogin:
                        Le[68] ||
                        (Le[68] = () => {
                          ((po.value = !1), ps());
                        }),
                      onLogout: ui,
                      onClose:
                        Le[69] ||
                        (Le[69] = (Ge) => {
                          ((po.value = !1), (co.value = void 0));
                        }),
                    },
                    null,
                    8,
                    [
                      "color-scheme",
                      "font-scale",
                      "managed-provider-status",
                      "managed-user-info",
                      "on-fetch-usage",
                      "notify",
                      "notify-permission",
                      "notify-sound",
                      "config",
                      "models",
                      "config-saving",
                      "server-version",
                      "backend",
                      "experimental-flags",
                      "initial-tab",
                    ],
                  ))
                : te("", !0),
              Do.value
                ? (b(),
                  me(
                    FBe,
                    {
                      key: 8,
                      status: p(o).status.value,
                      thinking: w.value,
                      "plan-mode": p(o).planMode.value,
                      "swarm-mode": p(o).swarmMode.value,
                      "cost-usd": p(o).sessionCost.value,
                      onClose: Le[70] || (Le[70] = (Ge) => (Do.value = !1)),
                    },
                    null,
                    8,
                    [
                      "status",
                      "thinking",
                      "plan-mode",
                      "swarm-mode",
                      "cost-usd",
                    ],
                  ))
                : te("", !0),
              bn.value
                ? (b(),
                  me(
                    yBe,
                    {
                      key: 9,
                      "browse-fs": p(o).browseFs,
                      "get-fs-home": p(o).getFsHome,
                      "default-path":
                        p(o).visibleWorkspace.value?.root ??
                        p(o).status.value.cwd,
                      error: Bo.value,
                      onAdd: Le[71] || (Le[71] = (Ge) => Il(Ge)),
                      onClose: cr,
                    },
                    null,
                    8,
                    ["browse-fs", "get-fs-home", "default-path", "error"],
                  ))
                : te("", !0),
              V(
                as,
                { name: "gload-fade" },
                {
                  default: ke(() => [
                    p(o).initialized.value
                      ? te("", !0)
                      : (b(),
                        me(
                          UWe,
                          { key: 0, issue: p(o).connectIssue.value },
                          null,
                          8,
                          ["issue"],
                        )),
                  ]),
                  _: 1,
                },
              ),
              V(
                HBe,
                {
                  warnings: p(o).warnings.value,
                  onDismiss: p(o).dismissWarning,
                },
                null,
                8,
                ["warnings", "onDismiss"],
              ),
              (b(),
              me(Zr, { to: "body" }, [
                V(
                  as,
                  { name: "action-toast" },
                  {
                    default: ke(() => [
                      oo.value
                        ? (b(),
                          me(
                            p(Lz),
                            {
                              key: oo.value.id,
                              onDismiss:
                                Le[72] || (Le[72] = (Ge) => (oo.value = null)),
                            },
                            {
                              default: ke(() => [
                                C(
                                  "button",
                                  { type: "button", onClick: Xn },
                                  N(p(i)("sidebar.archiveToastUndo")),
                                  1,
                                ),
                                Ve(
                                  " " +
                                    N(p(i)("sidebar.archiveToastMid")) +
                                    " ",
                                  1,
                                ),
                                C(
                                  "button",
                                  { type: "button", onClick: it },
                                  N(p(i)("sidebar.archiveToastSettings")),
                                  1,
                                ),
                                Ve(
                                  " " + N(p(i)("sidebar.archiveToastTail")),
                                  1,
                                ),
                              ]),
                              _: 1,
                            },
                          ))
                        : te("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ])),
              p(l) ? (b(), me(kUe, { key: 10 })) : te("", !0),
              V(wBe),
              p(a)
                ? (b(),
                  me(
                    bHe,
                    {
                      key: 11,
                      modelValue: u.value,
                      "onUpdate:modelValue":
                        Le[73] || (Le[73] = (Ge) => (u.value = Ge)),
                      groups: p(o).mobileWorkspaceGroups.value,
                      "active-workspace-id": p(o).activeWorkspaceId.value,
                      "active-id": p(o).activeSessionId.value,
                      "attention-by-session": p(o).attentionBySession.value,
                      "attention-by-workspace": p(o).attentionByWorkspace.value,
                      onSelect:
                        Le[74] || (Le[74] = (Ge) => p(o).selectSession(Ge)),
                      onCreate: ho,
                      onCreateInWorkspace: Le[75] || (Le[75] = (Ge) => ko(Ge)),
                      onAddWorkspace:
                        Le[76] || (Le[76] = (Ge) => (bn.value = !0)),
                      onRename:
                        Le[77] ||
                        (Le[77] = (Ge, Xt) => p(o).renameSession(Ge, Xt)),
                      onArchive: Le[78] || (Le[78] = (Ge) => uo(Ge)),
                      onDeleteWorkspace: Le[79] || (Le[79] = (Ge) => Ct(Ge)),
                      onLoadMore:
                        Le[80] ||
                        (Le[80] = (Ge) => void p(o).loadMoreSessions(Ge)),
                    },
                    null,
                    8,
                    [
                      "modelValue",
                      "groups",
                      "active-workspace-id",
                      "active-id",
                      "attention-by-session",
                      "attention-by-workspace",
                    ],
                  ))
                : te("", !0),
              p(a)
                ? (b(),
                  me(
                    Eze,
                    {
                      key: 12,
                      modelValue: c.value,
                      "onUpdate:modelValue":
                        Le[81] || (Le[81] = (Ge) => (c.value = Ge)),
                      "initial-view": Qe.value,
                      status: p(o).status.value,
                      thinking: p(o).thinking.value,
                      models: p(o).models.value,
                      "plan-mode": p(o).planMode.value,
                      "swarm-mode": p(o).swarmMode.value,
                      "color-scheme": p(o).colorScheme.value,
                      "font-scale": p(o).fontScale.value,
                      "managed-provider-status":
                        p(o).managedProviderStatus.value,
                      "managed-user-info": p(o).managedUserInfo.value,
                      "server-version": p(o).serverVersion.value,
                      onPickModel: Le[82] || (Le[82] = (Ge) => Ks()),
                      onSetThinking:
                        Le[83] || (Le[83] = (Ge) => p(o).setThinking(Ge)),
                      onTogglePlan:
                        Le[84] || (Le[84] = (Ge) => p(o).togglePlanMode()),
                      onToggleSwarm:
                        Le[85] || (Le[85] = (Ge) => p(o).toggleSwarmMode()),
                      onSetPermission:
                        Le[86] || (Le[86] = (Ge) => p(o).setPermission(Ge)),
                      onSetColorScheme:
                        Le[87] || (Le[87] = (Ge) => p(o).setColorScheme(Ge)),
                      onSetFontScale:
                        Le[88] || (Le[88] = (Ge) => p(o).setFontScale(Ge)),
                      onLogin:
                        Le[89] ||
                        (Le[89] = () => {
                          ((c.value = !1), ps());
                        }),
                      onLogout: ui,
                    },
                    null,
                    8,
                    [
                      "modelValue",
                      "initial-view",
                      "status",
                      "thinking",
                      "models",
                      "plan-mode",
                      "swarm-mode",
                      "color-scheme",
                      "font-scale",
                      "managed-provider-status",
                      "managed-user-info",
                      "server-version",
                    ],
                  ))
                : te("", !0),
            ],
            10,
            ZUe,
          ),
          p(o).initialized.value && _.value
            ? (b(),
              me(
                DWe,
                {
                  key: 1,
                  "auth-ready":
                    p(o).managedProviderStatus.value === "authenticated",
                  "on-start-o-auth-login": yn,
                  "on-poll-o-auth-login": Ho,
                  "on-cancel-o-auth-login": Eo,
                  onComplete: v,
                  onLoginSuccess: Zs,
                  onAddProvider: k,
                },
                null,
                8,
                ["auth-ready"],
              ))
            : te("", !0),
          Mn.value
            ? (b(),
              me(rFe, {
                key: 2,
                "on-start-o-auth-login": yn,
                "on-poll-o-auth-login": Ho,
                "on-cancel-o-auth-login": Eo,
                onSuccess: Io,
                onClose: Le[90] || (Le[90] = (Ge) => (Mn.value = !1)),
              }))
            : te("", !0),
        ])
      );
    },
  }),
