import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ContactCard from '../components/ContactCard';
import AddContactCard from '../components/AddContactCard';
import { useContactsStore } from '../lib/contactsStore';
import { SEED_FAMILY, SEED_FRIENDS } from '../lib/seedContacts';
import '../styles/contacts.css';

/* ============================================================================
   "My Contact" — Figma node 7:1121.
   ----------------------------------------------------------------------------
   Every other screen is a fixed 390×844 design scaled to fit the viewport
   (useStageScale / .stage / .screen). This page can't work that way: the
   contact list genuinely grows — Figma's 4 seed family members + 7 seed
   friends is a snapshot, not a ceiling, once people can add their own. So
   it's a real scrolling page instead: width capped at 390px and centered,
   height whatever the content needs, header sticky so the way back is
   always reachable without scrolling up.

   Cards are flow-laid-out (CSS Grid + flexbox), not pixel-positioned like
   the fixed screens — Figma's seed cards use two hand-placed heights
   (153px/162px) that a card with arbitrary user text can't be squeezed
   into. The decorative scalloped "ticket" section background is similarly
   a plain rounded rectangle here instead of Figma's fixed-size SVG, which
   has no way to 9-slice-stretch to an unknown row count.
   ========================================================================== */

export default function Contacts() {
  const { contacts } = useContactsStore();

  const familyContacts = [...SEED_FAMILY, ...contacts.filter((c) => c.group === 'family')];
  const friendsContacts = [...SEED_FRIENDS, ...contacts.filter((c) => c.group === 'friends')];

  return (
    <div className="contactspage">
      <header className="chheader">
        <img className="header__bg" src="/assets/header.svg" alt="" />
        <BackButton to="/" label="Back to home 返回首页" />
        <h1 className="header__title">
          <span className="t-en">My Contact</span> <span className="t-cn">我的联系人</span>
        </h1>
      </header>

      <section className="section" aria-labelledby="familyTitle">
        <p className="section__title" id="familyTitle">
          <span className="t-en">Family</span><span className="t-cn">家人</span>
        </p>
        <div className="section__grid">
          {familyContacts.map((c) => <ContactCard key={c.id} contact={c} />)}
          <AddContactCard group="family" />
        </div>
      </section>

      <Link className="backbar" to="/">
        <img className="backbar__bg" src="/assets/bottomnav-bg.svg" alt="" />
        <span className="crop backbar__logo" style={{ '--x': '156px', '--y': '7px', '--w': '78.179px', '--h': '79.817px' }}>
          <img
            src="/assets/logo-sprite.png"
            alt=""
            style={{ '--iw': '292.75px', '--ih': '203.45px', '--ix': '-110.95px', '--iy': '-107.65px' }}
          />
        </span>
        <span className="backbar__text">
          <span className="t-en">Back to homepage&nbsp;</span><span className="t-cn">返回首页</span>
        </span>
      </Link>

      <section className="section" aria-labelledby="friendsTitle">
        <p className="section__title" id="friendsTitle">
          <span className="t-en">Friends</span><span className="t-cn">朋友</span>
        </p>
        <div className="section__grid">
          {friendsContacts.map((c) => <ContactCard key={c.id} contact={c} />)}
          <AddContactCard group="friends" />
        </div>
      </section>
    </div>
  );
}
