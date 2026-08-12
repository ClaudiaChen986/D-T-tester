import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStageScale from '../hooks/useStageScale';
import BackButton from '../components/BackButton';
import { useContactsStore } from '../lib/contactsStore';
import '../styles/add-contact.css';

/* ============================================================================
   "Adding contact" — Figma node 120:408, a real form.
   ----------------------------------------------------------------------------
   Choose photo → the OS photo/file picker (<input type="file" accept="image/*">
   triggered by the pencil button) → FileReader renders the chosen image into
   the avatar circle immediately.

   Save writes { id, name, relationship, phone, photo, group } via the shared
   ContactsProvider (see lib/contactsStore.jsx) and navigates to /contacts,
   where the new contact appears ahead of the "+ Add" card — in Family or
   Friends depending on which group's Add card was clicked (?group=family or
   ?group=friends in the URL; defaults to friends if missing). Because the
   store's in-memory state is the source of truth and localStorage only a
   best-effort persistence layer beneath it, Save always navigates and the
   contact always shows up this session — even in a browser that blocks
   localStorage outright.
   ========================================================================== */

export default function AddContact() {
  const stageRef = useStageScale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addContact } = useContactsStore();

  const group = searchParams.get('group') === 'family' ? 'family' : 'friends';

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [nameInvalid, setNameInvalid] = useState(false);
  const [status, setStatus] = useState('');
  const [statusIsError, setStatusIsError] = useState(false);

  const photoInputRef = useRef(null);
  const nameInputRef = useRef(null);

  function handleChoosePhoto() {
    photoInputRef.current?.click();
  }

  /* A raw phone-camera photo read straight through FileReader can be
     several MB — once base64-encoded that alone can exceed localStorage's
     ~5MB per-origin quota, so the write silently fails and the contact
     quietly vanishes on the next reload, photo and all. The avatar is
     only ever shown at up to 196px, so there's no reason to store it at
     full camera resolution: downscale it onto a canvas and re-encode as a
     modest-quality JPEG first, which keeps a typical photo to tens of KB
     instead of several MB. */
  const AVATAR_MAX_DIMENSION = 512;
  const AVATAR_JPEG_QUALITY = 0.85;

  function readAndResizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndResizeImage(file).then(
      (dataUrl) => {
        setPhotoDataUrl(dataUrl);
        setStatusIsError(false);
        setStatus('Photo selected.');
      },
      () => {
        setStatusIsError(true);
        setStatus('Could not read that photo — please try another.');
      },
    );
  }

  function handleNameChange(e) {
    setName(e.target.value);
    if (e.target.value.trim()) {
      setNameInvalid(false);
      setStatusIsError(false);
      setStatus('');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameInvalid(true);
      nameInputRef.current?.focus();
      setStatusIsError(true);
      setStatus('Please enter a name before saving.');
      return;
    }
    setNameInvalid(false);
    setStatusIsError(false);

    const digits = phoneDigits.trim();
    addContact({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: trimmedName,
      cn: '',
      relationship: relationship.trim(),
      phone: digits ? `04${digits.replace(/[^\d ]/g, '')}` : '',
      photo: photoDataUrl,
      group,
    });

    navigate('/contacts');
  }

  return (
    <div className="app-center">
    <div className="stage" ref={stageRef}>
    <div className="screen screen--add" id="screen">

      <header className="header">
        <img className="header__bg" src="/assets/header.svg" alt="" />
        <BackButton to="/contacts" label="Cancel, back to My Contact 返回" />
        <h1 className="header-title-centered">
          <span className="t-en">Adding contact</span>
          <span className="t-cn">添加联系人</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit} noValidate>

        <div className="content-bg content-bg--band" />
        <div className="content-bg content-bg--fill" />

        <label className={`namefield${nameInvalid ? ' is-invalid' : ''}`}>
          <span className="namefield__label">
            <span className="t-en">Name</span><span className="sp"> </span><span className="t-cn">名字：</span>
          </span>
          <input
            ref={nameInputRef}
            type="text"
            autoComplete="off"
            required
            aria-label="Contact name 名字"
            value={name}
            onChange={handleNameChange}
          />
        </label>

        <p className="fieldlabel" style={{ '--y': '231px' }}>
          <span className="t-en">Relationship</span><span className="sp"> </span><span className="t-cn">与您的关系：</span>
        </p>
        <input
          className="pillinput pillinput--wide"
          style={{ '--y': '267px' }}
          type="text"
          autoComplete="off"
          placeholder="Enter text here 在此输入文本"
          aria-label="Relationship 与您的关系"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
        />

        <p className="fieldlabel" style={{ '--y': '343px' }}>
          <span className="t-en">Phone no.</span><span className="sp"> </span><span className="t-cn">电话号码：</span>
        </p>
        <span className="phonechip" style={{ '--y': '381px' }} aria-hidden="true">04</span>
        <input
          className="pillinput pillinput--narrow"
          style={{ '--y': '381px' }}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          maxLength={11}
          placeholder="Enter text here 在此输入文本"
          aria-label="Phone number, after the 04 prefix 电话号码"
          value={phoneDigits}
          onChange={(e) => setPhoneDigits(e.target.value)}
        />

        <p className="fieldlabel" style={{ '--y': '459px' }}>
          <span className="t-en">Avatar&nbsp;</span><span className="t-cn">头像：</span>
        </p>

        <div className="avatar">
          <img className="avatar__img" src={photoDataUrl || '/assets/avatar-xl.svg'} alt="" />
          <button className="avatar__edit" type="button" onClick={handleChoosePhoto} aria-label="Choose photo 选择照片">
            <img src="/assets/edit-btn-bg.svg" alt="" className="avatar__edit-bg" />
            <img src="/assets/icon-edit.svg" alt="" className="avatar__edit-icon" />
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handlePhotoChange}
          />
        </div>

        <p className={`formstatus${statusIsError ? ' is-error' : ''}`} role="status" aria-live="polite">
          {status}
        </p>

        <button className="save" type="submit">
          <span className="t-en">Save&nbsp;</span><span className="t-cn">保存</span>
        </button>

      </form>

    </div>
    </div>
    </div>
  );
}
