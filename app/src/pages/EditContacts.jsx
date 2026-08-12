import { useCallback, useEffect, useRef, useState } from 'react';
import useStageScale from '../hooks/useStageScale';
import BackButton from '../components/BackButton';
import { SEED_EMERGENCY_CONTACTS, DEFAULT_EMERGENCY_ORDER } from '../lib/seedContacts';
import '../styles/edit.css';

/* ============================================================================
   "Your profile" — drag to reorder emergency contacts, Figma node 2:688.
   ----------------------------------------------------------------------------
   Layout constants are literal Figma pixel values: row 1 sits at y=300, row 2
   at y=394 — a 94px step (76px row + 18px gap). Rows 4–5 use the same step
   too, within 2–6px (an export-rounding artifact in Figma, not a different
   rhythm). One formula reproduces the whole list and stays correct as rows
   are dragged past each other: top(index) = LIST_TOP + index * STEP.

   The dashed "top 3" frame hugs rows 0–2 with a 12px pad, recomputed on every
   reorder so it always wraps whichever three contacts currently lead the list.
   ========================================================================== */

const LIST_TOP = 300;
const STEP = 94;
const ROW_H = 76;
const PAD = 12;
const STORAGE_KEY = 'guitu.emergencyContactOrder';

const ICON_SRC = {
  avatar: '/assets/avatar-sm.svg',
  emergency: '/assets/icon-emergency-badge.svg',
};

function topFor(index) {
  return LIST_TOP + index * STEP;
}

function loadOrder() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      Array.isArray(raw) &&
      raw.length === DEFAULT_EMERGENCY_ORDER.length &&
      raw.every((id) => SEED_EMERGENCY_CONTACTS[id])
    ) {
      return raw;
    }
  } catch {
    /* fall through to default */
  }
  return DEFAULT_EMERGENCY_ORDER.slice();
}

export default function EditContacts() {
  const stageRef = useStageScale();
  const [order, setOrder] = useState(loadOrder);
  const [draggingId, setDraggingId] = useState(null);
  const [status, setStatus] = useState('');
  const [toast, setToast] = useState('');

  const rowRefs = useRef({});
  const dragState = useRef(null);
  const toastTimer = useRef(null);

  const moveTo = useCallback((id, targetIndex) => {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      if (from === -1 || targetIndex === from) return prev;
      const next = prev.slice();
      next.splice(from, 1);
      next.splice(targetIndex, 0, id);
      return next;
    });
  }, []);

  function handlePointerDown(id, e) {
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    dragState.current = {
      id,
      pointerId: e.pointerId,
      startY: e.clientY,
      startTop: topFor(order.indexOf(id)),
      lastIndex: order.indexOf(id),
    };
    setDraggingId(id);
  }

  function handlePointerMove(e) {
    const drag = dragState.current;
    if (!drag || e.pointerId !== drag.pointerId) return;

    const stage = stageRef.current;
    const scale = stage ? parseFloat(getComputedStyle(stage).getPropertyValue('--scale')) || 1 : 1;
    const newTop = drag.startTop + (e.clientY - drag.startY) / scale;

    const el = rowRefs.current[drag.id];
    if (el) el.style.top = `${newTop}px`;

    const centerY = newTop + ROW_H / 2;
    let targetIndex = Math.round((centerY - LIST_TOP) / STEP);
    targetIndex = Math.max(0, Math.min(order.length - 1, targetIndex));
    if (targetIndex !== drag.lastIndex) {
      drag.lastIndex = targetIndex;
      moveTo(drag.id, targetIndex);
    }
  }

  function endDrag(e) {
    const drag = dragState.current;
    if (!drag || e.pointerId !== drag.pointerId) return;
    dragState.current = null;
    setDraggingId(null);
    setStatus(
      `${SEED_EMERGENCY_CONTACTS[drag.id].en} is now position ${drag.lastIndex + 1} of ${order.length}.`
    );
  }

  function handleKeyDown(id, e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const currentIndex = order.indexOf(id);
    const targetIndex = currentIndex + (e.key === 'ArrowUp' ? -1 : 1);
    if (targetIndex < 0 || targetIndex >= order.length) return;
    moveTo(id, targetIndex);
    setStatus(
      `${SEED_EMERGENCY_CONTACTS[id].en} moved to position ${targetIndex + 1} of ${order.length}.`
    );
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch {
      /* the reorder still applies for this session even if it can't persist */
    }
    setToast('Saved 已保存');
    setStatus('Contact order saved.');
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1800);
  }

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const frameTop = LIST_TOP - PAD;
  const frameBottom = topFor(2) + ROW_H + PAD;

  return (
    <div className="app-center">
    <div className="stage" ref={stageRef}>
      <div className="screen" id="screen">
        <div className="bg-texture"><img src="/assets/background-texture.png" alt="" /></div>

        <header className="header">
          <img className="header__bg" src="/assets/header.svg" alt="" />
          <BackButton to="/" />
          <h1 className="header-title-centered">
            <span className="t-en">Your profile</span>
            <span className="t-cn">您的个人资料</span>
          </h1>
        </header>

        <div className="content-bg content-bg--band" />
        <div className="content-bg content-bg--fill" />

        <p className="instructions">
          <span className="t-en">Drag to rearrange the order</span>
          <span className="t-cn">拖动以调整顺序</span>
        </p>

        <p className="subtext">
          <span className="t-en">Top 3 contacts will appear in the emergency slide up card in the homepage</span>
          <span className="t-cn">首页的紧急联系人卡片中将显示前 3 位联系人</span>
        </p>

        <div
          className="top3frame"
          aria-hidden="true"
          style={{ top: `${frameTop}px`, height: `${frameBottom - frameTop}px` }}
        />

        <ol className="crowlist">
          {order.map((id, index) => {
            const contact = SEED_EMERGENCY_CONTACTS[id];
            const isDragging = id === draggingId;
            const isTop3 = index < 3;
            return (
              <li
                key={id}
                ref={(el) => { rowRefs.current[id] = el; }}
                className={`crow${isDragging ? ' is-dragging' : ''}`}
                style={isDragging ? undefined : { top: `${topFor(index)}px` }}
              >
                <img className="crow__bg" alt="" src={isTop3 ? '/assets/row-top3.svg' : '/assets/row-plain.svg'} />
                <img className="crow__avatar" src={ICON_SRC[contact.icon]} alt="" />
                <span className="crow__text">
                  <span className="t-en">{contact.en}</span>
                  <span className="t-cn">{contact.cn}</span>
                </span>
                <button
                  className="crow__handle"
                  type="button"
                  aria-label={`Reorder ${contact.en}. Drag, or press Arrow Up or Arrow Down.`}
                  aria-roledescription="Draggable item"
                  onPointerDown={(e) => handlePointerDown(id, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(e) => handleKeyDown(id, e)}
                >
                  <img src="/assets/icon-handle.svg" alt="" />
                </button>
              </li>
            );
          })}
        </ol>

        <p className="sr-only" role="status" aria-live="polite">{status}</p>

        <button className="save" type="button" onClick={handleSave}>
          <span className="t-en">Save</span><span className="sp"> </span><span className="t-cn">保存</span>
        </button>

        <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </div>
    </div>
  );
}
