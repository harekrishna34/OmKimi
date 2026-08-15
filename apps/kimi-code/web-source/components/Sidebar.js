    __name: "Sidebar",
    props: {
      activeWorkspace: { default: null },
      activeWorkspaceId: { default: null },
      sessions: {},
      groups: {},
      pinnedSessions: { default: () => [] },
      flatSessions: { default: () => [] },
      flatHasMore: { type: Boolean, default: !1 },
      flatLoadingMore: { type: Boolean, default: !1 },
      initialized: { type: Boolean, default: !1 },
      activeId: {},
      attentionBySession: { default: () => ({}) },
      pendingBySession: { default: () => ({}) },
      unreadBySession: { default: () => ({}) },
      colWidth: { default: 220 },
      collapsed: { type: Boolean, default: !1 },
      dragging: { type: Boolean, default: !1 },
    },
    emits: [
      "select",
      "create",
      "createInWorkspace",
      "selectWorkspace",
      "addWorkspace",
      "addWorkspacePaths",
      "rename",
      "archive",
      "fork",
      "export",
      "pin",
      "reorderPinned",
      "pinAt",
      "unpin",
      "renameWorkspace",
      "deleteWorkspace",
      "reorderWorkspaces",
      "loadMoreSessions",
      "loadAllSessions",
      "ensureFlatSessions",
      "loadMoreFlatSessions",
      "openSettings",
      "login",
      "collapse",
    ],
    setup(e, { emit: t }) {
      const { t: n } = Lt(),
        o = e,
        s = t,
        i = Z(!1),
        r = c() ? ["⌘", "K"] : ["Ctrl", "K"],
        l = c() ? ["⌃", "⇧", "O"] : ["Ctrl", "Shift", "O"];
      function a() {
        (s("loadAllSessions"), (i.value = !0));
      }
      function u(Qe) {
        (Qe.metaKey || Qe.ctrlKey) &&
          (Qe.key.toLowerCase() === "k"
            ? (Qe.preventDefault(), a())
            : !Qe.metaKey &&
              Qe.ctrlKey &&
              Qe.shiftKey &&
              Qe.key.toLowerCase() === "o" &&
              (Qe.preventDefault(), s("create")));
      }
      (dn(() => window.addEventListener("keydown", u)),
        Un(() => window.removeEventListener("keydown", u)));
      function c() {
        if (typeof navigator > "u") return !1;
        if (/Mac|iPod|iPhone|iPad/.test(navigator.platform)) return !0;
        const Qe = navigator.userAgentData;
        return Qe?.platform === "macOS" || Qe?.platform === "iOS";
      }
      const d = Z(null),
        f = Z(!1),
        h = Z(!1),
        g = Z(!1);
      let m = null;
      function w(Qe = d.value) {
        Qe &&
          ((f.value = Qe.scrollTop > 0),
          (h.value = Qe.scrollTop + Qe.clientHeight < Qe.scrollHeight - 1));
      }
      function _(Qe) {
        (w(Qe.target),
          (g.value = !0),
          m && clearTimeout(m),
          (m = setTimeout(() => {
            ((g.value = !1), (m = null));
          }, 900)));
      }
      let v = null;
      (dn(() => {
        yt(() => {
          (w(),
            typeof ResizeObserver == "function" &&
              d.value &&
              ((v = new ResizeObserver(() => w())), v.observe(d.value)));
        });
      }),
        Dp(() => w()),
        Un(() => {
          (v?.disconnect(), m && clearTimeout(m));
        }));
      const k = Z(new Set(XG()));
      function y(Qe) {
        return k.value.has(Qe);
      }
      function x(Qe) {
        const it = new Set(k.value);
        (it.has(Qe) ? it.delete(Qe) : it.add(Qe), (k.value = it), c9(it));
      }
      function M() {
        const Qe = new Set(o.groups.map((it) => it.workspace.id));
        ((k.value = Qe), c9(Qe));
      }
      function $() {
        const Qe = new Set();
        ((k.value = Qe), c9(Qe));
      }
      const S = R(
          () =>
            o.groups.length > 0 &&
            o.groups.every((Qe) => k.value.has(Qe.workspace.id)),
        ),
        I = Z(new Map());
      function P(Qe) {
        return I.value.get(Qe);
      }
      function D(Qe) {
        const it = o.groups.find((yn) => yn.workspace.id === Qe);
        if (!it) return;
        const Ct = (I.value.get(Qe) ?? it.initialCount) + R5,
          en = new Map(I.value);
        (en.set(Qe, Ct),
          (I.value = en),
          it.sessions.length < Ct && it.hasMore && s("loadMoreSessions", Qe));
      }
      function T(Qe) {
        if (!I.value.has(Qe)) return;
        const it = new Map(I.value);
        (it.delete(Qe), (I.value = it));
      }
      const L = Z(null),
        B = Z(null);
      function H(Qe) {
        L.value = Qe;
      }
      function O() {
        ((L.value = null), (B.value = null));
      }
      function F(Qe) {
        const it = Qe.currentTarget.getBoundingClientRect();
        return Qe.clientY < it.top + it.height / 2 ? "before" : "after";
      }
      function W(Qe, it) {
        L.value === null ||
          L.value === it ||
          (Qe.preventDefault(),
          Qe.dataTransfer && (Qe.dataTransfer.dropEffect = "move"),
          (B.value = { id: it, position: F(Qe) }));
      }
      function z(Qe) {
        const it = L.value,
          Ct = B.value?.id === Qe ? B.value.position : "before";
        if (((B.value = null), (L.value = null), !it || it === Qe)) return;
        const en = HT(
          o.groups.map((yn) => yn.workspace.id),
          it,
          Qe,
          Ct,
        );
        s("reorderWorkspaces", en);
      }
      const U = Z(null);
      function q(Qe, it) {
        U.value = { id: Qe, workspaceId: it };
      }
      function K() {
        U.value = null;
      }
      function ie(Qe) {
        ((U.value = null), s("unpin", Qe));
      }
      const ne = Z(QG());
      function Y(Qe) {
        ne.value !== Qe &&
          ((ne.value = Qe), eY(Qe), Qe === "flat" && s("ensureFlatSessions"));
      }
      et(
        () => o.initialized,
        (Qe) => {
          Qe && ne.value === "flat" && s("ensureFlatSessions");
        },
        { immediate: !0 },
      );
      const le = Z(!1),
        Ee = Z({}),
        de = Z(null);
      function he(Qe) {
        const it = Qe.target;
        it.closest(".view-menu") || it.closest(".side-section-view") || oe();
      }
      async function pe(Qe) {
        if (le.value) {
          oe();
          return;
        }
        const it = Qe.currentTarget;
        ((le.value = !0),
          document.addEventListener("mousedown", he),
          window.addEventListener("resize", oe),
          await yt());
        const Ct = de.value?.el,
          en = it.getBoundingClientRect(),
          yn = 4,
          Ho = 8,
          Eo = Ct?.offsetHeight ?? 0,
          Io = Ct?.offsetWidth ?? 0;
        let Zs = en.bottom + yn,
          zo = !1;
        Zs + Eo > window.innerHeight - Ho &&
          ((Zs = Math.max(Ho, en.top - Eo - yn)), (zo = !0));
        let Lo = en.right - Io;
        (Lo < Ho && (Lo = Ho),
          (Ee.value = {
            top: `${Math.round(Zs)}px`,
            left: `${Math.round(Lo)}px`,
            transformOrigin: zo ? "bottom right" : "top right",
            "--menu-pop-shift": zo ? "2px" : "-2px",
          }));
      }
      function oe() {
        ((le.value = !1),
          document.removeEventListener("mousedown", he),
          window.removeEventListener("resize", oe));
      }
      function ve(Qe) {
        (Y(Qe), oe());
      }
      const G = Z(null);
      function X(Qe, it) {
        it.dataTransfer &&
          ((it.dataTransfer.effectAllowed = "move"),
          it.dataTransfer.setData(B1, Qe),
          it.dataTransfer.setData("text/plain", Qe));
      }
      const fe = Z(!1);
      function Ce(Qe) {
        ne.value !== "flat" ||
          U.value === null ||
          (Qe.preventDefault(),
          Qe.dataTransfer && (Qe.dataTransfer.dropEffect = "move"),
          (fe.value = !0));
      }
      function ge(Qe) {
        ne.value !== "flat" ||
          U.value === null ||
          (Qe.preventDefault(), (fe.value = !1), ie(U.value.id));
      }
      function Q(Qe) {
        Qe.currentTarget.contains(Qe.relatedTarget) || (fe.value = !1);
      }
      function ee(Qe, it) {
        it.target.closest(".gh-more, .gh-add") || x(Qe);
      }
      function ce(Qe) {
        s("select", Qe);
      }
      const ue = Z(null);
      function Se(Qe) {
        (ue.value ? ue.value.expand() : p3(!1), s("pin", Qe));
      }
      function Ue(Qe, it, Ct) {
        (ue.value?.expand(), s("pinAt", Qe, it, Ct));
      }
      const _e = Z(0),
        Te = Z(!1);
      function st() {
        ((_e.value = 0), (Te.value = !1));
      }
      function Fe(Qe) {
        !rh() ||
          !d9(Qe) ||
          (Qe.preventDefault(),
          Qe.stopPropagation(),
          (_e.value += 1),
          (Te.value = !0));
      }
      function Oe(Qe) {
        !rh() ||
          !d9(Qe) ||
          (Qe.preventDefault(),
          Qe.stopPropagation(),
          Qe.dataTransfer && (Qe.dataTransfer.dropEffect = "copy"));
      }
      function Ye(Qe) {
        !rh() ||
          !d9(Qe) ||
          ((_e.value = Math.max(0, _e.value - 1)),
          _e.value === 0 && (Te.value = !1));
      }
      function ft(Qe) {
        if ((st(), !rh())) return;
        const it = lY(Qe);
        it.length !== 0 &&
          (Qe.preventDefault(),
          Qe.stopPropagation(),
          s("addWorkspacePaths", it));
      }
      const $t = Z(null),
        Ht = Z(""),
        Yt = Z(""),
        _n = Z(null);
      function je() {
        return _n;
      }
      function Ke(Qe, it) {
        (($t.value = Qe),
          (Yt.value = it),
          (Ht.value = it),
          yt().then(() => _n.value?.focus()));
      }
      function Ze() {
        const Qe = $t.value,
          it = Ht.value.trim();
        (Qe && it && it !== Yt.value && s("renameWorkspace", Qe, it),
          ($t.value = null));
      }
      function zt() {
        $t.value = null;
      }
      function at(Qe) {
        Ht.value = Qe;
      }
      const tn = Z(!1),
        Wt = Z(null),
        fn = Z({}),
        Sn = Z(null);
      function to(Qe) {
        Sn.value?.el && !Sn.value.el.contains(Qe.target) && ao();
      }
      function An(Qe, it) {
        (it.preventDefault(),
          it.stopPropagation(),
          (Wt.value = Qe),
          (fn.value = {
            top: `${it.clientY}px`,
            left: `${it.clientX}px`,
            transformOrigin: "top left",
            "--menu-pop-shift": "-2px",
          }),
          (tn.value = !0),
          document.addEventListener("mousedown", to, !0));
      }
      function ao() {
        ((tn.value = !1),
          document.removeEventListener("mousedown", to, !0),
          (Wt.value = null));
      }
      function Kt() {
        (Wt.value && js(Wt.value.root), ao());
      }
      function Co() {
        (Wt.value && Ke(Wt.value.id, Wt.value.name), ao());
      }
      function Po() {
        const Qe = Wt.value;
        Qe && (ao(), s("deleteWorkspace", Qe.id));
      }
      const Mn = Z(null),
        bn = Z(null),
        Do = Z({}),
        po = Z(null);
      function At(Qe) {
        const it = Qe.target;
        it.closest(".gh-more") || it.closest(".ws-menu") || Bo();
      }
      async function qs(Qe, it) {
        if (Mn.value === Qe.id) {
          Bo();
          return;
        }
        const Ct = it.currentTarget;
        ((bn.value = Qe),
          (Mn.value = Qe.id),
          document.addEventListener("mousedown", At),
          window.addEventListener("resize", Bo),
          await yt());
        const en = po.value?.el,
          yn = Ct.getBoundingClientRect(),
          Ho = 4,
          Eo = 8,
          Io = en?.offsetHeight ?? 0,
          Zs = en?.offsetWidth ?? 0;
        let zo = yn.bottom + Ho,
          Lo = !1;
        zo + Io > window.innerHeight - Eo &&
          ((zo = Math.max(Eo, yn.top - Io - Ho)), (Lo = !0));
        let Wo = yn.right - Zs;
        (Wo < Eo && (Wo = Eo),
          (Do.value = {
            top: `${Math.round(zo)}px`,
            left: `${Math.round(Wo)}px`,
            transformOrigin: Lo ? "bottom right" : "top right",
            "--menu-pop-shift": Lo ? "2px" : "-2px",
          }));
      }
      function Bo() {
        ((Mn.value = null),
          (bn.value = null),
          document.removeEventListener("mousedown", At),
          window.removeEventListener("resize", Bo));
      }
      function To(Qe) {
        (js(Qe.root), Bo());
      }
      function ai(Qe) {
        (Ke(Qe.id, Qe.name), Bo());
      }
      function Tn(Qe) {
        (Bo(), s("deleteWorkspace", Qe.id));
      }
      Un(() => {
        (document.removeEventListener("mousedown", to, !0),
          document.removeEventListener("mousedown", At),
          document.removeEventListener("mousedown", he),
          window.removeEventListener("resize", Bo),
          window.removeEventListener("resize", oe));
      });
      const no = Z(null);
      let Ks;
      function ps() {
        const Qe = no.value;
        Qe &&
          (Qe.classList.remove("blink-now"),
          Qe.getBoundingClientRect(),
          Qe.classList.add("blink-now"),
          clearTimeout(Ks),
          (Ks = setTimeout(() => Qe.classList.remove("blink-now"), 300)));
      }
      const ui = zr(() =>
          Go(
            () => import("./DesignSystemView-BOD_23qT.js"),
            __vite__mapDeps([8, 9]),
          ),
        ),
        $s = Z(!1);
      let yo,
        oo = !1;
      function uo(Qe) {
        ((oo = !1),
          clearTimeout(yo),
          Qe.currentTarget.setPointerCapture?.(Qe.pointerId),
          (yo = setTimeout(() => {
            ((oo = !0), ($s.value = !0));
          }, r5e)));
      }
      function Xn(Qe) {
        clearTimeout(yo);
        const it = Qe.currentTarget;
        it.hasPointerCapture?.(Qe.pointerId) &&
          it.releasePointerCapture(Qe.pointerId);
      }
      function co() {
        if (oo) {
          oo = !1;
          return;
        }
        ps();
      }
      return (
        Un(() => {
          clearTimeout(yo);
        }),
        (Qe, it) => (
          b(),
          A(
            "aside",
            {
              class: Re([
                "side",
                {
                  "macos-desktop": p(uc),
                  collapsed: e.collapsed,
                  "no-anim": e.dragging,
                },
              ]),
              style: Gt({ width: e.collapsed ? "0px" : e.colWidth + "px" }),
            },
            [
              C(
                "div",
                {
                  class: "col",
                  style: Gt({ width: e.colWidth + "px" }),
                  onDragenter: Fe,
                  onDragover: Oe,
                  onDragleave: Ye,
                  onDrop: ft,
                },
                [
                  C("div", W8e, [
                    C("div", U8e, [
                      p(uc)
                        ? te("", !0)
                        : (b(),
                          A(
                            Pe,
                            { key: 0 },
                            [
                              (b(),
                              A(
                                "svg",
                                {
                                  ref_key: "logoRef",
                                  ref: no,
                                  class: "ch-logo",
                                  viewBox: "0 0 32 22",
                                  fill: "none",
                                  xmlns: "http://www.w3.org/2000/svg",
                                  role: "img",
                                  "aria-label": "Kimi Code",
                                  onClick: co,
                                  onPointerdown: uo,
                                  onPointerup: Xn,
                                  onPointercancel: Xn,
                                },
                                [
                                  ...(it[31] ||
                                    (it[31] = [
                                      Ac(
                                        '<defs data-v-35ca343f><mask id="kimiEyes" maskUnits="userSpaceOnUse" data-v-35ca343f><rect x="0" y="0" width="32" height="22" fill="#fff" data-v-35ca343f></rect><g class="ch-eyes" fill="#000" data-v-35ca343f><rect class="ch-eye" x="11.8" y="7" width="2.8" height="8" rx="1.4" data-v-35ca343f></rect><rect class="ch-eye" x="17.4" y="7" width="2.8" height="8" rx="1.4" data-v-35ca343f></rect></g></mask></defs><rect x="1" y="1" width="30" height="20" rx="6" fill="var(--logo)" mask="url(#kimiEyes)" data-v-35ca343f></rect>',
                                        2,
                                      ),
                                    ])),
                                ],
                                544,
                              )),
                              it[32] ||
                                (it[32] = C(
                                  "span",
                                  { class: "ch-name" },
                                  "Kimi Code",
                                  -1,
                                )),
                            ],
                            64,
                          )),
                    ]),
                    C("div", j8e, [
                      p(uc)
                        ? te("", !0)
                        : (b(),
                          me(
                            p(gn),
                            {
                              key: 0,
                              class: "ch-collapse",
                              size: "sm",
                              label: p(n)("sidebar.collapseSidebar"),
                              onClick:
                                it[0] ||
                                (it[0] = Et((Ct) => s("collapse"), ["stop"])),
                            },
                            {
                              default: ke(() => [
                                V(p(Ie), { name: "panel-collapse" }),
                              ]),
                              _: 1,
                            },
                            8,
                            ["label"],
                          )),
                      V(Dde),
                    ]),
                  ]),
                  C(
                    "div",
                    {
                      class: Re([
                        "sidebar-actions",
                        { "sidebar-actions--has-workspace-action": i5e },
                      ]),
                    },
                    [
                      C(
                        "button",
                        {
                          class: "btn-new-chat",
                          type: "button",
                          onClick:
                            it[1] ||
                            (it[1] = Et((Ct) => s("create"), ["stop"])),
                        },
                        [
                          V(p(Ie), { name: "chat-new" }),
                          C("span", null, N(p(n)("sidebar.newChat")), 1),
                          V(p(sa), { keys: p(l) }, null, 8, ["keys"]),
                        ],
                      ),
                      te("", !0),
                      C(
                        "button",
                        { class: "search", type: "button", onClick: a },
                        [
                          V(p(Ie), { class: "search-icon", name: "search" }),
                          C("span", V8e, N(p(n)("sidebar.search")), 1),
                          V(p(sa), { keys: p(r) }, null, 8, ["keys"]),
                        ],
                      ),
                    ],
                    2,
                  ),
                  ne.value === "flat" || e.groups.length > 0
                    ? (b(),
                      A(
                        "div",
                        {
                          key: 0,
                          class: Re([
                            "sessions-head",
                            { "sessions-head--scrolled": f.value },
                          ]),
                        },
                        [
                          e.pinnedSessions.length > 0
                            ? (b(),
                              me(
                                z8e,
                                {
                                  key: 0,
                                  ref_key: "pinnedListRef",
                                  ref: ue,
                                  sessions: e.pinnedSessions,
                                  "active-id": e.activeId,
                                  "pending-by-session": e.pendingBySession,
                                  "unread-by-session": e.unreadBySession,
                                  onSelectSession: ce,
                                  onRenameSession:
                                    it[3] ||
                                    (it[3] = (Ct, en) => s("rename", Ct, en)),
                                  onArchiveSession:
                                    it[4] || (it[4] = (Ct) => s("archive", Ct)),
                                  onForkSession:
                                    it[5] || (it[5] = (Ct) => s("fork", Ct)),
                                  onExportSession:
                                    it[6] || (it[6] = (Ct) => s("export", Ct)),
                                  onPinSession: Se,
                                  onPinSessionAt: Ue,
                                  onSessionDragStart: q,
                                  onSessionDragEnd: K,
                                  onReorder:
                                    it[7] ||
                                    (it[7] = (Ct) => s("reorderPinned", Ct)),
                                },
                                null,
                                8,
                                [
                                  "sessions",
                                  "active-id",
                                  "pending-by-session",
                                  "unread-by-session",
                                ],
                              ))
                            : te("", !0),
                          C("div", q8e, [
                            C(
                              "span",
                              K8e,
                              N(p(n)("sidebar.sessionsHeader")),
                              1,
                            ),
                            C("div", Z8e, [
                              ne.value === "grouped"
                                ? (b(),
                                  me(
                                    p(gn),
                                    {
                                      key: 0,
                                      class: "side-section-toggle",
                                      size: "sm",
                                      label: S.value
                                        ? p(n)("sidebar.expandAll")
                                        : p(n)("sidebar.collapseAll"),
                                      onClick:
                                        it[8] ||
                                        (it[8] = Et(
                                          (Ct) => (S.value ? $() : M()),
                                          ["stop"],
                                        )),
                                    },
                                    {
                                      default: ke(() => [
                                        S.value
                                          ? (b(),
                                            me(p(Ie), {
                                              key: 0,
                                              name: "expand",
                                            }))
                                          : (b(),
                                            me(p(Ie), {
                                              key: 1,
                                              name: "collapse",
                                            })),
                                      ]),
                                      _: 1,
                                    },
                                    8,
                                    ["label"],
                                  ))
                                : te("", !0),
                              V(
                                p(Pn),
                                { text: p(n)("sidebar.viewSwitcher") },
                                {
                                  default: ke(() => [
                                    V(
                                      p(gn),
                                      {
                                        class:
                                          "side-section-toggle side-section-view",
                                        size: "sm",
                                        label: p(n)("sidebar.viewSwitcher"),
                                        onClick: Et(pe, ["stop"]),
                                      },
                                      {
                                        default: ke(() => [
                                          V(p(Ie), { name: "list-settings" }),
                                        ]),
                                        _: 1,
                                      },
                                      8,
                                      ["label"],
                                    ),
                                  ]),
                                  _: 1,
                                },
                                8,
                                ["text"],
                              ),
                            ]),
                          ]),
                        ],
                        2,
                      ))
                    : te("", !0),
                  C(
                    "div",
                    {
                      ref_key: "sessionsEl",
                      ref: d,
                      class: Re([
                        "sessions",
                        {
                          scrolling: g.value,
                          "pinned-drag-active":
                            ne.value === "flat" && U.value !== null,
                          "flat-pinned-drop-hover": fe.value,
                        },
                      ]),
                      onScroll: _,
                      onDragover: Ce,
                      onDrop: ge,
                      onDragleave: Q,
                    },
                    [
                      ne.value === "grouped"
                        ? (b(),
                          A(
                            Pe,
                            { key: 0 },
                            [
                              e.groups.length === 0
                                ? (b(),
                                  A(
                                    "div",
                                    G8e,
                                    N(p(n)("workspace.noWorkspace")),
                                    1,
                                  ))
                                : (b(!0),
                                  A(
                                    Pe,
                                    { key: 1 },
                                    pt(
                                      e.groups,
                                      (Ct) => (
                                        b(),
                                        A(
                                          "div",
                                          {
                                            key: Ct.workspace.id,
                                            class: Re([
                                              "ws-drop-target",
                                              {
                                                "drop-before":
                                                  B.value?.id ===
                                                    Ct.workspace.id &&
                                                  B.value.position === "before",
                                                "drop-after":
                                                  B.value?.id ===
                                                    Ct.workspace.id &&
                                                  B.value.position === "after",
                                              },
                                            ]),
                                            onDragover: (en) =>
                                              W(en, Ct.workspace.id),
                                            onDrop: (en) => z(Ct.workspace.id),
                                          },
                                          [
                                            V(
                                              R8e,
                                              {
                                                group: Ct,
                                                "active-workspace-id":
                                                  e.activeWorkspaceId,
                                                "active-id": e.activeId,
                                                "renaming-id": $t.value,
                                                "rename-value": Ht.value,
                                                "rename-input-ref": je(),
                                                "pending-by-session":
                                                  e.pendingBySession,
                                                "unread-by-session":
                                                  e.unreadBySession,
                                                "ws-menu-open-id": Mn.value,
                                                dragging:
                                                  L.value === Ct.workspace.id,
                                                "is-collapsed": y,
                                                "visible-limit": P,
                                                "pinned-drag-session": U.value,
                                                onGroupClick: ee,
                                                onGroupContextmenu: An,
                                                onToggleWsMenu: qs,
                                                onCreateInWorkspace:
                                                  it[9] ||
                                                  (it[9] = (en) =>
                                                    s("createInWorkspace", en)),
                                                onSelectSession: ce,
                                                onRenameSession:
                                                  it[10] ||
                                                  (it[10] = (en, yn) =>
                                                    s("rename", en, yn)),
                                                onArchiveSession:
                                                  it[11] ||
                                                  (it[11] = (en) =>
                                                    s("archive", en)),
                                                onForkSession:
                                                  it[12] ||
                                                  (it[12] = (en) =>
                                                    s("fork", en)),
                                                onExportSession:
                                                  it[13] ||
                                                  (it[13] = (en) =>
                                                    s("export", en)),
                                                onPinSession: Se,
                                                onDropPinnedSession: ie,
                                                onExpand: D,
                                                onCollapse: T,
                                                onConfirmRename: Ze,
                                                onCancelRename: zt,
                                                onUpdateRenameValue: at,
                                                onWsDragstart: H,
                                                onWsDragend: O,
                                              },
                                              null,
                                              8,
                                              [
                                                "group",
                                                "active-workspace-id",
                                                "active-id",
                                                "renaming-id",
                                                "rename-value",
                                                "rename-input-ref",
                                                "pending-by-session",
                                                "unread-by-session",
                                                "ws-menu-open-id",
                                                "dragging",
                                                "pinned-drag-session",
                                              ],
                                            ),
                                          ],
                                          42,
                                          Y8e,
                                        )
                                      ),
                                    ),
                                    128,
                                  )),
                            ],
                            64,
                          ))
                        : (b(),
                          A(
                            Pe,
                            { key: 1 },
                            [
                              (b(!0),
                              A(
                                Pe,
                                null,
                                pt(
                                  e.flatSessions,
                                  (Ct) => (
                                    b(),
                                    me(
                                      K5,
                                      {
                                        key: Ct.id,
                                        session: Ct,
                                        active: Ct.id === e.activeId,
                                        "approval-count":
                                          e.pendingBySession[Ct.id]
                                            ?.approvals ?? 0,
                                        "question-count":
                                          e.pendingBySession[Ct.id]
                                            ?.questions ?? 0,
                                        unread: e.unreadBySession[Ct.id] ?? !1,
                                        draggable: G.value !== Ct.id,
                                        onDragstart: (en) => X(Ct.id, en),
                                        onRenameStateChange: (en) =>
                                          (G.value = en ? Ct.id : null),
                                        onSelect: ce,
                                        onRename:
                                          it[14] ||
                                          (it[14] = (en, yn) =>
                                            s("rename", en, yn)),
                                        onArchive:
                                          it[15] ||
                                          (it[15] = (en) => s("archive", en)),
                                        onFork:
                                          it[16] ||
                                          (it[16] = (en) => s("fork", en)),
                                        onExport:
                                          it[17] ||
                                          (it[17] = (en) => s("export", en)),
                                        onPin: Se,
                                      },
                                      null,
                                      8,
                                      [
                                        "session",
                                        "active",
                                        "approval-count",
                                        "question-count",
                                        "unread",
                                        "draggable",
                                        "onDragstart",
                                        "onRenameStateChange",
                                      ],
                                    )
                                  ),
                                ),
                                128,
                              )),
                              e.flatSessions.length === 0 &&
                              !e.flatHasMore &&
                              e.pinnedSessions.length === 0
                                ? (b(),
                                  A(
                                    "div",
                                    X8e,
                                    N(p(n)("sidebar.noSessions")),
                                    1,
                                  ))
                                : te("", !0),
                              e.flatHasMore
                                ? (b(),
                                  A("div", J8e, [
                                    C(
                                      "button",
                                      {
                                        class: "show-more",
                                        disabled: e.flatLoadingMore,
                                        onClick:
                                          it[18] ||
                                          (it[18] = Et(
                                            (Ct) => s("loadMoreFlatSessions"),
                                            ["stop"],
                                          )),
                                      },
                                      [
                                        C(
                                          "span",
                                          e5e,
                                          N(
                                            e.flatLoadingMore
                                              ? p(n)("sidebar.loadingMore")
                                              : p(n)("sidebar.loadMore"),
                                          ),
                                          1,
                                        ),
                                        V(p(Ie), {
                                          name: "chevron-down",
                                          size: "sm",
                                        }),
                                      ],
                                      8,
                                      Q8e,
                                    ),
                                  ]))
                                : te("", !0),
                            ],
                            64,
                          )),
                    ],
                    34,
                  ),
                  C(
                    "div",
                    {
                      class: Re([
                        "side-footer",
                        { "side-footer--shadowed": h.value },
                      ]),
                    },
                    [
                      V(Rye, {
                        onLogin: it[19] || (it[19] = (Ct) => s("login")),
                        onOpenSettings:
                          it[20] || (it[20] = (Ct) => s("openSettings")),
                      }),
                    ],
                    2,
                  ),
                  C(
                    "div",
                    {
                      class: Re(["folder-drop-overlay", { show: Te.value }]),
                      "aria-hidden": "true",
                    },
                    [
                      C("div", t5e, [
                        V(p(Ie), { name: "folder", size: "lg" }),
                        C(
                          "span",
                          null,
                          N(p(n)("sidebar.dropToAddWorkspace")),
                          1,
                        ),
                      ]),
                    ],
                    2,
                  ),
                ],
                36,
              ),
              V(
                as,
                { name: "menu-pop" },
                {
                  default: ke(() => [
                    tn.value
                      ? (b(),
                        me(
                          p(Cl),
                          {
                            key: 0,
                            ref_key: "ghMenuRef",
                            ref: Sn,
                            class: "gh-menu",
                            style: Gt(fn.value),
                            onClick:
                              it[21] || (it[21] = Et(() => {}, ["stop"])),
                          },
                          {
                            default: ke(() => [
                              V(
                                p(hn),
                                { onClick: Kt },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "copy", size: "sm" }),
                                    Ve(" " + N(p(n)("sidebar.copyPath")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                              V(
                                p(hn),
                                { class: "workspace-rename-item", onClick: Co },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "pencil", size: "sm" }),
                                    Ve(" " + N(p(n)("sidebar.rename")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                              V(
                                p(hn),
                                { danger: "", onClick: Po },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "close", size: "sm" }),
                                    Ve(
                                      " " + N(p(n)("sidebar.removeWorkspace")),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["style"],
                        ))
                      : te("", !0),
                  ]),
                  _: 1,
                },
              ),
              V(
                as,
                { name: "menu-pop" },
                {
                  default: ke(() => [
                    Mn.value !== null && bn.value
                      ? (b(),
                        me(
                          p(Cl),
                          {
                            key: 0,
                            ref_key: "wsMenuRef",
                            ref: po,
                            class: "ws-menu",
                            style: Gt(Do.value),
                            onClick:
                              it[25] || (it[25] = Et(() => {}, ["stop"])),
                          },
                          {
                            default: ke(() => [
                              V(
                                p(hn),
                                {
                                  onClick:
                                    it[22] || (it[22] = (Ct) => To(bn.value)),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "copy", size: "sm" }),
                                    Ve(" " + N(p(n)("sidebar.copyPath")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                              V(
                                p(hn),
                                {
                                  class: "workspace-rename-item",
                                  onClick:
                                    it[23] || (it[23] = (Ct) => ai(bn.value)),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "pencil", size: "sm" }),
                                    Ve(" " + N(p(n)("sidebar.rename")), 1),
                                  ]),
                                  _: 1,
                                },
                              ),
                              V(
                                p(hn),
                                {
                                  danger: "",
                                  onClick:
                                    it[24] || (it[24] = (Ct) => Tn(bn.value)),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "close", size: "sm" }),
                                    Ve(
                                      " " + N(p(n)("sidebar.removeWorkspace")),
                                      1,
                                    ),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["style"],
                        ))
                      : te("", !0),
                  ]),
                  _: 1,
                },
              ),
              V(
                as,
                { name: "menu-pop" },
                {
                  default: ke(() => [
                    le.value
                      ? (b(),
                        me(
                          p(Cl),
                          {
                            key: 0,
                            ref_key: "viewMenuRef",
                            ref: de,
                            class: "view-menu",
                            style: Gt(Ee.value),
                            onClick:
                              it[28] || (it[28] = Et(() => {}, ["stop"])),
                          },
                          {
                            default: ke(() => [
                              C("div", n5e, N(p(n)("sidebar.viewGroup")), 1),
                              V(
                                p(hn),
                                {
                                  onClick:
                                    it[26] || (it[26] = (Ct) => ve("flat")),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "list", size: "sm" }),
                                    Ve(
                                      " " + N(p(n)("sidebar.viewFlat")) + " ",
                                      1,
                                    ),
                                    C("span", o5e, [
                                      ne.value === "flat"
                                        ? (b(),
                                          me(p(Ie), {
                                            key: 0,
                                            name: "check",
                                            size: "sm",
                                          }))
                                        : te("", !0),
                                    ]),
                                  ]),
                                  _: 1,
                                },
                              ),
                              V(
                                p(hn),
                                {
                                  onClick:
                                    it[27] || (it[27] = (Ct) => ve("grouped")),
                                },
                                {
                                  default: ke(() => [
                                    V(p(Ie), { name: "tree-view", size: "sm" }),
                                    Ve(
                                      " " +
                                        N(p(n)("sidebar.viewGrouped")) +
                                        " ",
                                      1,
                                    ),
                                    C("span", s5e, [
                                      ne.value === "grouped"
                                        ? (b(),
                                          me(p(Ie), {
                                            key: 0,
                                            name: "check",
                                            size: "sm",
                                          }))
                                        : te("", !0),
                                    ]),
                                  ]),
                                  _: 1,
                                },
                              ),
                            ]),
                            _: 1,
                          },
                          8,
                          ["style"],
                        ))
                      : te("", !0),
                  ]),
                  _: 1,
                },
              ),
              i.value
                ? (b(),
                  me(
                    MY,
                    {
                      key: 0,
                      sessions: e.sessions,
                      "active-id": e.activeId,
                      onSelect: ce,
                      onClose: it[29] || (it[29] = (Ct) => (i.value = !1)),
                    },
                    null,
                    8,
                    ["sessions", "active-id"],
                  ))
                : te("", !0),
              (b(),
              me(Zr, { to: "body" }, [
                $s.value
                  ? (b(),
                    me(p(ui), {
                      key: 0,
                      onClose: it[30] || (it[30] = (Ct) => ($s.value = !1)),
                    }))
                  : te("", !0),
              ])),
            ],
            6,
          )
        )
      );
    },
  }),
  a5e = ht(l5e, [["__scopeId", "data-v-35ca343f"]]);
function u5e(e) {
  try {
    const t = li(e);
    if (t === null) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
function Lx(e, t) {
  try {
    Ls(e, String(t));
  } catch {}
}
function c5e(e) {
  const {
    storageKey: t,
    defaultWidth: n,
    min: o,
    max: s,
    reverse: i = !1,
    axis: r = "x",
    applyLive: l,
  } = e;
  function a(D) {
    return Number.isFinite(D) ? Math.min(Rh(s), Math.max(o, Math.round(D))) : n;
  }
  const u = Z(a(u5e(t) ?? n)),
    c = Z(!1);
  function d(D) {
    const T = D <= o,
      L = D >= Rh(s),
      B = r === "x" ? "col-resize" : "row-resize";
    if (T && L) return B;
    const [H, O] =
      r === "x" ? ["e-resize", "w-resize"] : ["s-resize", "n-resize"];
    return L ? (i ? H : O) : T ? (i ? O : H) : B;
  }
  const f = Z(null),
    h = R(() => d(f.value ?? u.value));
  function g(D) {
    typeof document > "u" || (document.body.style.cursor = d(D));
  }
  function m(D) {
    const T = a(D);
    ((u.value = T), Lx(t, T));
  }
  et(
    () => Rh(s),
    (D) => {
      !c.value && u.value > D && m(D);
    },
  );
  let w = 0,
    _ = 0,
    v = null,
    k = -1,
    y = 0,
    x = 0,
    M = 0;
  function $() {
    if (((x = 0), !c.value)) return;
    const D = y - w;
    ((M = a(_ + (i ? -D : D))), (f.value = M), g(M), l ? l(M) : (u.value = M));
  }
  function S(D) {
    if (c.value && ((y = r === "x" ? D.clientX : D.clientY), x === 0)) {
      if (typeof requestAnimationFrame != "function") {
        $();
        return;
      }
      x = requestAnimationFrame($);
    }
  }
  function I() {
    if (c.value) {
      if (
        (x !== 0 && (cancelAnimationFrame(x), $()),
        (c.value = !1),
        l ? m(M) : Lx(t, u.value),
        (f.value = null),
        typeof document < "u" &&
          ((document.body.style.userSelect = ""),
          (document.body.style.cursor = "")),
        v)
      ) {
        try {
          v.releasePointerCapture(k);
        } catch {}
        (v.removeEventListener("pointermove", S),
          v.removeEventListener("pointerup", I),
          v.removeEventListener("pointercancel", I));
      }
      ((v = null), (k = -1));
    }
  }
  function P(D) {
    (D.preventDefault(),
      (c.value = !0),
      (w = r === "x" ? D.clientX : D.clientY),
      (_ = a(u.value)),
      (M = _),
      (v = D.currentTarget),
      (k = D.pointerId),
      typeof document < "u" && (document.body.style.userSelect = "none"),
      g(_));
    try {
      v.setPointerCapture(k);
    } catch {}
    (v.addEventListener("pointermove", S),
      v.addEventListener("pointerup", I),
      v.addEventListener("pointercancel", I));
  }
  return (
    Un(I),
    {
      width: u,
      dragging: c,
      cursor: h,
      clamp: a,
      setWidth: m,
      onPointerDown: P,
    }
  );
}
const d5e = ["aria-label"],
  f5e = tt({
