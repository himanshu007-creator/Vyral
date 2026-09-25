// The Unlayer editor, rewritten into Leonida. Every label goes through options.translations,
// every tool icon is ours, and the rail docks like the app it lives in.

const ic = (body) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const ICONS = {
  crop: ic('<path d="M6 2v16h16"/><path d="M2 6h16v16"/><path d="M9 11c1.5-2 4.5-2 6 0" stroke-dasharray="2 2"/>'),
  // sunglasses = vibes
  filter: ic('<path d="M2 9h20"/><path d="M3 9l1 5a3 3 0 0 0 3 2h1a3 3 0 0 0 3-3v-4"/><path d="M13 9v4a3 3 0 0 0 3 3h1a3 3 0 0 0 3-2l1-5"/>'),
  // spray can = vandalize
  draw: ic('<rect x="7" y="9" width="8" height="13" rx="2"/><path d="M9 9V6h4v3"/><path d="M11 4V2"/><path d="M17 4h.01M19 2h.01M19 6h.01M21 4h.01"/>'),
  // shouting bubble = caption
  text: ic('<path d="M4 4h16v12H9l-5 4z"/><path d="M12 7v4"/><path d="M12 13.5v.01"/>'),
  // censor bar
  shapes: ic('<rect x="2" y="9" width="20" height="6" fill="currentColor"/><path d="M6 5c2-2 10-2 12 0M6 19c2 2 10 2 12 0"/>'),
  // evidence bag
  stickers: ic('<path d="M5 6h14l-1 15H6z"/><path d="M5 6l2-3h10l2 3"/><rect x="9" y="10" width="6" height="4"/><path d="M9 17h6"/>'),
  // mugshot frame = height chart
  frame: ic('<rect x="3" y="3" width="18" height="18"/><path d="M3 8h4M3 12h6M3 16h4M17 8h4M15 12h6M17 16h4"/>'),
};

const COMMON = {
  'image_editor.tools.crop': 'Hide the Mess',
  'image_editor.tools.draw': 'Vandalize',
  'image_editor.tools.text': 'Caption',
  'image_editor.tools.shapes': 'Censor',
  'image_editor.tools.stickers': 'Evidence',
  'image_editor.tools.frame': 'Mugshot',
  'image_editor.tools.resize': 'Shrink Ego',
  'image_editor.tools.corners': 'Soften Edges',

  'image_editor.filters.presets': 'Leonida Presets',
  'image_editor.filters.adjust': 'Fix Your Face',
  'image_editor.filters.none': 'Raw (brave)',
  'image_editor.filters.kodachrome': "Vice '86",
  'image_editor.filters.polaroid': 'Pawn Shop Polaroid',
  'image_editor.filters.vintage': "Grandpa's Yacht",
  'image_editor.filters.technicolor': 'Sunburn',
  'image_editor.filters.brownie': 'Everglades Humid',
  'image_editor.filters.sepia': 'Old Money',
  'image_editor.filters.grayscale': 'Court Photo',
  'image_editor.filters.black_white': 'Booking Photo',
  'image_editor.filters.pixelate': 'Censored by VCPD',
  'image_editor.filters.invert': 'Hungover',
  'image_editor.filters.noise': 'Gas Station CCTV',
  'image_editor.filters.blur': 'Beer Goggles',
  'image_editor.filters.emboss': 'Tattoo Parlor',
  'image_editor.filters.sharpen': 'Crystal Clear (Suspicious)',
  'image_editor.filters.brightness': 'Ring Light',
  'image_editor.filters.contrast': 'Drama',
  'image_editor.filters.saturation': 'Neon Level',
  'image_editor.filters.vibrance': 'Vibe Check',
  'image_editor.filters.hue': 'Mood Swing',
  'image_editor.filters.gamma': 'Golden Hour',
  'image_editor.filters.group.light': 'Lighting (doing all the work)',
  'image_editor.filters.group.color': 'Color (humid)',
  'image_editor.filters.group.effects': 'Crimes',

  'image_editor.draw.brush': 'Spray Can',
  'image_editor.draw.brush_pencil': 'Sharpie',
  'image_editor.draw.brush_spray': 'Graffiti',
  'image_editor.draw.brush_eraser': 'Destroy Evidence',
  'image_editor.draw.color': 'Paint',
  'image_editor.draw.size': 'Nozzle',

  'image_editor.text.new': 'Add a Roast',
  'image_editor.text.default_text': 'SUFFERING, YET PRETENDING',
  'image_editor.text.preset.neon': 'Vice Neon',
  'image_editor.text.preset.meme': 'Florida Man',
  'image_editor.text.preset.marker': 'Bail Note',
  'image_editor.text.preset.typewriter': 'Police Report',
  'image_editor.text.preset.heading': 'Headline',
  'image_editor.text.preset.subheading': 'Fine Print',
  'image_editor.text.preset.outline': 'Chalk Outline',
  'image_editor.text.preset.shadow': 'Shady',
  'image_editor.text.preset.script': 'Live Laugh Leonida',
  'image_editor.text.preset.highlight': 'Evidence Marker',
  'image_editor.text.preset.bubbles': 'Pool Party',
  'image_editor.text.preset.sketch': 'Courtroom Sketch',
  'image_editor.text.group.effects': 'Loud',
  'image_editor.text.group.handwriting': 'Ransom Notes',

  'image_editor.shapes.rectangle': 'Censor Bar',
  'image_editor.shapes.circle': 'Look Here',
  'image_editor.shapes.arrow': 'Wait For It',
  'image_editor.shapes.star': 'Wanted Star',
  'image_editor.shapes.shield': 'VCPD Badge',

  'image_editor.stickers.search': 'Search the evidence locker…',
  'image_editor.stickers.category.beach': 'Vice Beach',
  'image_editor.stickers.category.bubbles': 'Things You Said',
  'image_editor.stickers.category.clouds': 'Hurricane Season',
  'image_editor.stickers.category.doodles': 'Court Doodles',
  'image_editor.stickers.category.emoticons': 'Fake Feelings',
  'image_editor.stickers.category.landmarks': 'Leonida Sights',
  'image_editor.stickers.category.stars': 'Wanted Level',
  'image_editor.stickers.category.transportation': 'Getaway Vehicles',

  'image_editor.frame.presets': 'Frames',
  'image_editor.frame.basic': 'Booking',
  'image_editor.frame.ebony': 'Night Court',
  'image_editor.frame.oak': 'Pawn Shop',
  'image_editor.frame.pine': 'Trailer Park',
  'image_editor.frame.rainbow': 'Vice Pride',

  'image_editor.crop.aspect_square': 'Grid Post',
  'image_editor.crop.aspect_free': 'No Rules',
  'image_editor.crop.aspect_original': 'As God Intended',
  'image_editor.crop.straighten': 'Sober Up',

  'image_editor.toolbar.undo': 'Deny',
  'image_editor.toolbar.redo': 'Admit',
  'image_editor.toolbar.save': 'Post it',
  'image_editor.toolbar.cancel': 'Bail',
  'image_editor.actions.reset': 'Witness Protection',
};

const tools = (extra = {}) => ({
  crop: { icon: ICONS.crop },
  filter: { icon: ICONS.filter },
  draw: { icon: ICONS.draw },
  text: { icon: ICONS.text },
  shapes: { icon: ICONS.shapes },
  stickers: { icon: ICONS.stickers },
  frame: { icon: ICONS.frame },
  resize: false, // output size is the app's business, not yours
  ...extra,
});

// Video mode: Unlayer edits a transparent overlay drawn over the clip, so only the layer tools make sense.
const overlayTools = { ...tools(), crop: false, filter: false, frame: false };
const videoOpts = (theme, dock, extra = {}) => ({
  theme,
  translations: { en: { ...COMMON, 'image_editor.toolbar.save': 'Burn it in', ...extra } },
  features: { imageEditor: { dock, tools: overlayTools } },
});

// Options objects are module constants: `features` is remount-tier, so they must never change identity.
export const SKINS = {
  gram: {
    title: 'Reelgram',
    sub: 'Edit',
    back: 'Bail',
    done: 'Next',
    tip: 'More edits = more likes. That’s not a tip, it’s the economy.',
    options: {
      theme: 'light',
      translations: { en: { ...COMMON, 'image_editor.tools.filter': 'Vibes' } },
      features: { imageEditor: { dock: 'left', tools: tools() } },
    },
    videoOptions: videoOpts('light', 'left'),
  },
  sus: {
    title: 'SusChat',
    sub: 'Evidence Studio',
    back: '✕',
    done: 'Send To ➤',
    tip: 'Deny everything later. Caption it now.',
    options: {
      theme: 'dark',
      translations: { en: { ...COMMON, 'image_editor.tools.filter': 'Lenses', 'image_editor.toolbar.save': 'Send' } },
      features: { imageEditor: { dock: 'right', tools: tools() } },
    },
    videoOptions: videoOpts('dark', 'right'),
  },
  roll: {
    title: 'FruitRoll',
    sub: 'Retouch the Evidence',
    back: 'Cancel',
    done: 'Save',
    tip: 'Edit it again. Nobody has to know. (Everybody will know.)',
    options: {
      theme: 'light',
      translations: { en: { ...COMMON, 'image_editor.tools.filter': 'Glow Up', 'image_editor.toolbar.save': 'Save copy' } },
      features: { imageEditor: { dock: 'left', tools: tools() } },
    },
  },
  text: {
    title: 'iText',
    sub: 'Fix Their Photo',
    back: 'Cancel',
    done: 'Send back',
    tip: 'They asked for "nice". Nobody said which kind.',
    options: {
      theme: 'light',
      translations: { en: { ...COMMON, 'image_editor.tools.filter': 'Glow Up', 'image_editor.toolbar.save': 'Send back' } },
      features: { imageEditor: { dock: 'left', tools: tools({ frame: { icon: ICONS.frame } }) } },
    },
  },
};
