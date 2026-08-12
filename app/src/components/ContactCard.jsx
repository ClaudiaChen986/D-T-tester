/* Saved contacts only ever get one free-text name field (unlike the seed
   contacts, which come with hand-split English/Chinese strings) — so a
   name typed in Chinese needs to render in the app's Chinese serif
   (--font-cn / Noto Serif SC), not the Latin one, or it falls back to
   whatever generic serif the OS ships. 㐀-䶿 and 豈-﫿
   cover the rarer extension/compatibility ideographs, 一-鿿 the
   main CJK Unified Ideographs block. */
const CJK_RE = /[㐀-䶿一-鿿豈-﫿]/;

export default function ContactCard({ contact }) {
  const { name, cn, phone, photo } = contact;
  const nameFontClass = CJK_RE.test(name) ? 't-cn' : 't-en';

  return (
    <div className="card">
      <div className="card__top">
        <div className="card__avatar">
          <img src={photo || '/assets/avatar-sm.svg'} alt="" />
        </div>
        {phone ? (
          <a className="card__call" href={`tel:${phone}`} aria-label={`Call ${name}`}>
            <img src="/assets/icon-call-white.svg" alt="" />
          </a>
        ) : (
          <span className="card__call" aria-hidden="true">
            <img src="/assets/icon-call-white.svg" alt="" />
          </span>
        )}
      </div>
      <p className="card__name">
        <span className={nameFontClass}>{name}</span>
        {cn && <span className="t-cn">{cn}</span>}
      </p>
    </div>
  );
}
