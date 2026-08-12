import { useCallback, useEffect, useRef, useState } from 'react';
import useStageScale from '../hooks/useStageScale';
import '../styles/soundwave.css';

/* ============================================================================
   Home screen — Figma node 2:40, plus the listening state (node 276:649) and
   its animated soundwave (Soundwave component, node 253:974).
   ========================================================================== */

const WAVE_BARS = 12;

export default function Home() {
  const stageRef = useStageScale();
  const voiceBtnRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [status, setStatus] = useState('');

  const startListening = useCallback(() => {
    setIsListening((prev) => {
      if (!prev) setStatus('Listening… 正在聆听');
      return true;
    });
  }, []);

  const stopListening = useCallback(() => {
    setIsListening((prev) => {
      if (prev) setStatus('');
      return false;
    });
  }, []);

  function handlePointerDown(e) {
    const btn = voiceBtnRef.current;
    if (btn?.setPointerCapture) {
      try { btn.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    startListening();
  }

  function handleKeyDown(e) {
    if (e.key !== ' ' && e.key !== 'Enter' && e.key !== 'Spacebar') return;
    e.preventDefault(); // Space would otherwise scroll
    if (e.repeat) return;
    startListening();
  }

  function handleKeyUp(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') stopListening();
  }

  // A press interrupted by tab-away or a system gesture should not stick.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) stopListening();
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [stopListening]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && sheetExpanded) setSheetExpanded(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sheetExpanded]);

  return (
    <div className="app-center">
    <div className="stage" ref={stageRef}>
    <div className={isListening ? 'screen is-listening' : 'screen'} id="screen">

      <div className="bg-texture"><img src="/assets/background-texture.png" alt="" /></div>

      <header className="header">
        <img className="header__bg" src="/assets/header.svg" alt="" />
        <div className="header__logo"><img src="/assets/logo-sprite.png" alt="归途 GuiTu" /></div>
        <h1 className="header__title">
          <span className="t-en">Home&nbsp;</span><span className="t-cn">首页</span>
        </h1>
        <p className="header__welcome">
          <span className="t-en">Welcome, XXX!</span>
          <span className="t-cn">欢迎，XXX!</span>
        </p>
      </header>

      <div className="wordmark" aria-hidden="true">
        <span style={{ '--x': '25px', '--y': '156.487px', '--w': '26.275px', '--h': '32.899px' }}><i style={{ '--r': '13.64deg' }}>归</i></span>
        <span style={{ '--x': '47.48px', '--y': '160.88px', '--w': '23.925px', '--h': '31.552px' }}><i style={{ '--r': '8.19deg' }}>途</i></span>
        <span style={{ '--x': '74.16px', '--y': '164.143px', '--w': '15.44px', '--h': '29.225px' }}><i style={{ '--r': '0.87deg' }}>G</i></span>
        <span style={{ '--x': '88.594px', '--y': '163.472px', '--w': '15.687px', '--h': '29.776px' }}><i style={{ '--r': '-3.38deg' }}>u</i></span>
        <span style={{ '--x': '103.65px', '--y': '161.694px', '--w': '10.368px', '--h': '29.623px' }}><i style={{ '--r': '-6.77deg' }}>i</i></span>
        <span style={{ '--x': '110.941px', '--y': '155.9px', '--w': '21.326px', '--h': '31.707px' }}><i style={{ '--r': '-15.7deg' }}>T</i></span>
        <span style={{ '--x': '122.962px', '--y': '152px', '--w': '23.015px', '--h': '32.031px' }}><i style={{ '--r': '-19.85deg' }}>u</i></span>
      </div>

      <button className="tile" style={{ '--x': '24px', '--y': '224px' }} type="button">
        <img className="tile__bg" src="/assets/tile-bg.svg" alt="" />
        <span className="crop tile__icon" style={{ '--x': '22px', '--y': '14px', '--s': '56px' }}>
          <img src="/assets/icon-translation.png" alt="" style={{ '--iw': '190.47px', '--ih': '139.66px', '--ix': '-64.97px', '--iy': '-76.21px' }} />
        </span>
        <span className="chevron" style={{ '--x': '105.419px', '--y': '25.589px', '--s': '34.823px' }}>
          <img src="/assets/icon-chevron.svg" alt="" />
        </span>
        <span className="tile__label" style={{ '--x': '14px', '--y': '71px', '--w': '139px' }}>
          <span className="t-en">Translation</span>
          <span className="t-cn">翻译</span>
        </span>
      </button>

      <a className="tile" style={{ '--x': '202px', '--y': '224px' }} href="/contacts">
        <img className="tile__bg" src="/assets/tile-bg.svg" alt="" />
        <span className="crop tile__icon" style={{ '--x': '19px', '--y': '15px', '--s': '54.169px' }}>
          <img src="/assets/icon-contacts.png" alt="" style={{ '--iw': '187.96px', '--ih': '130.62px', '--ix': '-68.93px', '--iy': '-6.47px' }} />
        </span>
        <span className="chevron" style={{ '--x': '103.527px', '--y': '24.673px', '--s': '34.823px' }}>
          <img src="/assets/icon-chevron.svg" alt="" />
        </span>
        <span className="tile__label" style={{ '--x': '19.886px', '--y': '69.084px', '--w': '129.123px' }}>
          <span className="t-en">Contacts</span>
          <span className="t-cn">联系人</span>
        </span>
      </a>

      <button className="tile" style={{ '--x': '24px', '--y': '394px' }} type="button">
        <img className="tile__bg" src="/assets/tile-bg.svg" alt="" />
        <span className="crop tile__icon" style={{ '--x': '21px', '--y': '17px', '--s': '53.7px' }}>
          <img src="/assets/icon-nav-other.png" alt="" style={{ '--iw': '197px', '--ih': '136.9px', '--ix': '-138.4px', '--iy': '-12.4px' }} />
        </span>
        <span className="chevron" style={{ '--x': '103.521px', '--y': '26.739px', '--s': '34.521px' }}>
          <img src="/assets/icon-chevron.svg" alt="" />
        </span>
        <span className="tile__label" style={{ '--x': '14px', '--y': '68px', '--w': '139px' }}>
          <span className="t-en">Navigation</span>
          <span className="t-cn">导航</span>
        </span>
      </button>

      <button className="tile" style={{ '--x': '202px', '--y': '394px' }} type="button">
        <img className="tile__bg" src="/assets/tile-bg.svg" alt="" />
        <span className="crop tile__icon" style={{ '--x': '22px', '--y': '17px', '--s': '53.7px' }}>
          <img src="/assets/icon-nav-other.png" alt="" style={{ '--iw': '197px', '--ih': '136.9px', '--ix': '-78.36px', '--iy': '-72.82px' }} />
        </span>
        <span className="chevron" style={{ '--x': '109.038px', '--y': '23.739px', '--s': '34.521px' }}>
          <img src="/assets/icon-chevron.svg" alt="" />
        </span>
        <span className="tile__label" style={{ '--x': '19px', '--y': '68px', '--w': '129px' }}>
          <span className="t-en">Other</span>
          <span className="t-cn">其他</span>
        </span>
      </button>

      <button
        className="voice"
        ref={voiceBtnRef}
        type="button"
        aria-pressed={isListening}
        aria-label="Voice assistant 语音助手 — press and hold to speak"
        onPointerDown={handlePointerDown}
        onPointerUp={stopListening}
        onPointerCancel={stopListening}
        onLostPointerCapture={stopListening}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={stopListening}
        onContextMenu={(e) => e.preventDefault()}
      >
        <img className="voice__bg" src="/assets/voice-assistant-card.svg" alt="" />
        <img className="voice__ring" src="/assets/mic-ring.svg" alt="" />
        <span className="crop voice__micbg" style={{ '--x': '32.241px', '--y': '29.239px', '--s': '79.884px' }}>
          <img src="/assets/mic-button-bg.png" alt="" style={{ '--iw': '114.95px', '--ih': '79.884px', '--ix': '-17.58px', '--iy': '0px' }} />
        </span>
        <img className="voice__mic" src="/assets/icon-mic.svg" alt="" />
        <span className="voice__title">
          <span className="t-en">Voice assistant</span>
          <span className="t-cn">语音助手</span>
        </span>
        <span className="voice__hint">
          <span className="t-en">press to speak</span><span className="sp"> </span><span className="t-cn">按住说话</span>
        </span>
      </button>

      <div className="sheet" data-state={sheetExpanded ? 'expanded' : 'collapsed'}>
        <img className="sheet__bg" src="/assets/sheet-bg.svg" alt="" />

        <button className="navbtn navbtn--calls" type="button" onClick={() => setSheetExpanded(true)}>
          <img className="navbtn__icon" src="/assets/icon-phone.svg" alt="" style={{ '--x': '15.256px', '--y': '11.322px', '--w': '34.662px', '--h': '35.294px' }} />
          <span className="navbtn__label" style={{ '--x': '51px', '--y': '5.773px', '--w': '51px' }}>
            <span className="t-en">Calls</span>
            <span className="t-cn">电话</span>
          </span>
        </button>

        <a className="navbtn navbtn--profile" href="/edit-contacts">
          <img className="navbtn__icon" src="/assets/icon-profile.svg" alt="" style={{ '--x': '14px', '--y': '10.185px', '--w': '32px', '--h': '37.251px' }} />
          <span className="navbtn__label" style={{ '--x': '50px', '--y': '5.773px', '--w': '60px' }}>
            <span className="t-en">Profile</span>
            <span className="t-cn">个人</span>
          </span>
        </a>

        <img className="sheet__panel" src="/assets/sheet-panel.svg" alt="" />

        <div className="row" style={{ '--y': '194px' }}>
          <img className="row__bg" src="/assets/contact-row.svg" alt="" />
          <img className="row__avatar" src="/assets/avatar.svg" alt="" style={{ '--y': '26px' }} />
          <span className="row__text" style={{ '--y': '26px' }}>
            <span className="t-en">Son (David)</span>
            <span className="t-cn">儿子（大卫）</span>
            <span className="t-num">0412 345 678</span>
          </span>
          <a className="row__call" href="tel:0412345678" style={{ '--y': '36px' }} aria-label="Call Son (David)">
            <img src="/assets/call-btn.svg" alt="" />
          </a>
        </div>

        <div className="row" style={{ '--y': '343px' }}>
          <img className="row__bg" src="/assets/contact-row.svg" alt="" />
          <img className="row__avatar" src="/assets/avatar.svg" alt="" style={{ '--y': '24px' }} />
          <span className="row__text" style={{ '--y': '24px' }}>
            <span className="t-en">Daughter (Lily)</span>
            <span className="t-cn">女儿（莉莉）</span>
            <span className="t-num">0423 456 789</span>
          </span>
          <a className="row__call" href="tel:0423456789" style={{ '--y': '34px' }} aria-label="Call Daughter (Lily)">
            <img src="/assets/call-btn.svg" alt="" />
          </a>
        </div>

        <div className="row row--emergency" style={{ '--y': '492px' }}>
          <img className="row__bg" src="/assets/contact-row.svg" alt="" />
          <img className="row__avatar" src="/assets/emergency-ellipse.svg" alt="" style={{ '--y': '24px' }} />
          <img className="row__warn" src="/assets/emergency-triangle.svg" alt="" />
          <span className="row__warn-mark" aria-hidden="true">！</span>
          <span className="row__text" style={{ '--y': '24px' }}>
            <span className="t-en">Emergency</span>
            <span className="t-cn">紧急联络</span>
            <span className="t-num">000</span>
          </span>
          <a className="row__call row__call--sos" href="tel:000" style={{ '--y': '34px' }} aria-label="Call emergency 000">
            <img src="/assets/call-btn-plain.svg" alt="" />
            <img className="row__call-glyph" src="/assets/icon-phone-white.svg" alt="" />
          </a>
        </div>

        <button
          className="sheet__handle"
          type="button"
          aria-controls="sheet"
          aria-expanded={sheetExpanded}
          aria-label={sheetExpanded ? 'Collapse contacts' : 'Expand contacts'}
          onClick={() => setSheetExpanded((prev) => !prev)}
        >
          <img src="/assets/sheet-handle-arrow.svg" alt="" />
        </button>

        <span className="crop sheet__medallion" style={{ '--x': '156px', '--y': '7px', '--w': '78.179px', '--h': '79.817px' }}>
          <img src="/assets/logo-sprite.png" alt="" style={{ '--iw': '292.75px', '--ih': '203.45px', '--ix': '-110.95px', '--iy': '-107.65px' }} />
        </span>
      </div>

      <div className="listening" aria-hidden="true">
        <div className="listening__scrim" />
        <div className="wave">
          {Array.from({ length: WAVE_BARS }).map((_, i) => <span className="wave__bar" key={i} />)}
        </div>
      </div>

      <p className="sr-only" role="status">{status}</p>
    </div>
    </div>
    </div>
  );
}
