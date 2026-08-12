/* Seed contacts straight from the Figma content — kept verbatim, including a
   naming inconsistency Figma itself has: Grandson Alex/Harry's Chinese names
   differ between the "My Contact" list and the reorder screen. Each page
   keeps its own screen's text rather than silently reconciling content
   that isn't this codebase's to fix. */

export const SEED_FAMILY = [
  { id: 'seed-son',      name: 'Son (David)',      cn: '儿子（大卫）', phone: '0412345678', group: 'family' },
  { id: 'seed-daughter', name: 'Daughter (Lily)',  cn: '女儿（莉莉）', phone: '0423456789', group: 'family' },
  { id: 'seed-alex',     name: 'Grandson (Alex)',  cn: '孙子（强强）', phone: '',           group: 'family' },
  { id: 'seed-harry',    name: 'Grandson (Harry)', cn: '孙子（小睿）', phone: '',           group: 'family' },
];

export const SEED_FRIENDS = [
  { id: 'seed-grace',  name: 'Grace',  cn: '小雅',   group: 'friends' },
  { id: 'seed-kevin',  name: 'Kevin',  cn: '王伟',   group: 'friends' },
  { id: 'seed-amy',    name: 'Amy',    cn: '陈倩倩', group: 'friends' },
  { id: 'seed-jason',  name: 'Jason',  cn: '张强',   group: 'friends' },
  { id: 'seed-linda',  name: 'Linda',  cn: '黄琳达', group: 'friends' },
  { id: 'seed-sarah',  name: 'Sarah',  cn: '杨丽',   group: 'friends' },
  { id: 'seed-daniel', name: 'Daniel', cn: '王建国', group: 'friends' },
];

/* Reorder screen (edit-contacts) seeds its own list — the ones that can
   appear in the homepage's emergency slide-up card. Separate from the two
   above because it's a different, smaller subset with its own Chinese names
   (see the note up top). */
export const SEED_EMERGENCY_CONTACTS = {
  son:       { en: 'Son (David)',       cn: '儿子（大卫）',     icon: 'avatar' },
  daughter:  { en: 'Daughter (Lily)',   cn: '女儿（莉莉）',     icon: 'avatar' },
  emergency: { en: 'Emergency',         cn: '紧急联络',         icon: 'emergency' },
  alex:      { en: 'Grandson (Alex)',   cn: '孙子（亚历克斯）', icon: 'avatar' },
  harry:     { en: 'Grandson (Harry)',  cn: '孙子（哈利）',     icon: 'avatar' },
};

export const DEFAULT_EMERGENCY_ORDER = ['son', 'daughter', 'emergency', 'alex', 'harry'];
