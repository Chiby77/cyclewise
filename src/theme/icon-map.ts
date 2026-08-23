import type { IconName } from '@/components/Icon';

/**
 * Every symptom/mood/activity tag in the app maps to one of these. Centralizing
 * the choices here means re-theming icons later is a one-file change, and
 * lets multiple screens (Calendar's activity row, Symptoms Log) share the
 * same glyph for the same concept.
 */
export const ICONS = {
  // Chrome / navigation
  back: 'arrow-back' as IconName,
  close: 'close' as IconName,
  settings: 'settings-outline' as IconName,
  help: 'help-circle-outline' as IconName,
  edit: 'create-outline' as IconName,
  trash: 'trash-outline' as IconName,
  add: 'add' as IconName,
  check: 'checkmark' as IconName,
  chevronDown: 'chevron-down' as IconName,
  chevronForward: 'chevron-forward' as IconName,
  more: 'ellipsis-horizontal' as IconName,
  note: 'document-text-outline' as IconName,
  grid: 'grid-outline' as IconName,
  warning: 'warning-outline' as IconName,
  send: 'send' as IconName,
  refresh: 'refresh-outline' as IconName,
  sparkles: 'sparkles' as IconName,

  // Tab bar
  home: 'home-outline' as IconName,
  homeActive: 'home' as IconName,
  calendar: 'calendar-outline' as IconName,
  calendarActive: 'calendar' as IconName,
  stats: 'stats-chart-outline' as IconName,
  statsActive: 'stats-chart' as IconName,
  profile: 'person-outline' as IconName,
  profileActive: 'person' as IconName,

  // Home / quick stats
  history: 'time-outline' as IconName,
  cycle: 'sync-outline' as IconName,
  flash: 'flash-outline' as IconName,
  people: 'people-outline' as IconName,
  weight: 'body-outline' as IconName,
  temperature: 'thermometer-outline' as IconName,
  sleep: 'moon-outline' as IconName,
  drink: 'cafe-outline' as IconName,
  heart: 'heart' as IconName,
  heartOutline: 'heart-outline' as IconName,

  // Calendar / period flow
  flowLight: 'water-outline' as IconName,
  flowMedium: 'water' as IconName,
  flowHeavy: 'water' as IconName,
  clot: 'ellipse' as IconName,

  // Sex
  noSex: 'close-circle-outline' as IconName,
  protectedSex: 'shield-checkmark-outline' as IconName,
  unprotectedSex: 'shield-outline' as IconName,
  oralSex: 'heart-half-outline' as IconName,
  analSex: 'ellipse-outline' as IconName,
  masturbation: 'hand-left-outline' as IconName,
  touch: 'hand-right-outline' as IconName,
  toys: 'gift-outline' as IconName,
  orgasm: 'sparkles-outline' as IconName,
  highDrive: 'flame' as IconName,
  neutralDrive: 'remove-outline' as IconName,
  lowDrive: 'moon-outline' as IconName,

  // Mood
  calm: 'leaf-outline' as IconName,
  happy: 'happy-outline' as IconName,
  energetic: 'sunny-outline' as IconName,
  frisky: 'flame-outline' as IconName,
  moodSwings: 'swap-horizontal-outline' as IconName,
  irritated: 'alert-circle-outline' as IconName,
  sad: 'sad-outline' as IconName,
  anxious: 'pulse-outline' as IconName,
  depressed: 'rainy-outline' as IconName,
  guilty: 'help-circle-outline' as IconName,
  obsessive: 'sync-circle-outline' as IconName,
  apathetic: 'remove-circle-outline' as IconName,
  confused: 'help-outline' as IconName,
  selfCritical: 'eye-outline' as IconName,
  lowEnergy: 'battery-dead-outline' as IconName,

  // Symptoms
  fine: 'checkmark-circle-outline' as IconName,
  cramps: 'flash-outline' as IconName,
  tenderBreasts: 'heart-half-outline' as IconName,
  headache: 'medical-outline' as IconName,
  acne: 'ellipse-outline' as IconName,
  backache: 'body-outline' as IconName,
  fatigue: 'battery-half-outline' as IconName,
  cravings: 'nutrition-outline' as IconName,
  insomnia: 'bed-outline' as IconName,
  abdominalPain: 'alert-circle-outline' as IconName,
  perineumPain: 'medkit-outline' as IconName,
  swelling: 'ellipse-outline' as IconName,
  vaginalItching: 'flame-outline' as IconName,
  vaginalDryness: 'sunny-outline' as IconName,

  // Discharge
  noDischarge: 'leaf-outline' as IconName,
  spotting: 'water-outline' as IconName,
  sticky: 'water' as IconName,
  creamy: 'water-outline' as IconName,
  eggWhite: 'egg-outline' as IconName,
  watery: 'water' as IconName,
  unusual: 'warning-outline' as IconName,
  clumpyWhite: 'ellipse-outline' as IconName,
  gray: 'ellipse' as IconName,

  // Digestion
  nausea: 'sad-outline' as IconName,
  bloating: 'ellipse-outline' as IconName,
  constipation: 'remove-circle-outline' as IconName,
  diarrhea: 'water' as IconName,

  // Tests
  noTest: 'close-circle-outline' as IconName,
  positive: 'checkmark-circle' as IconName,
  negative: 'close-circle' as IconName,
  faintLine: 'remove-outline' as IconName,
  ovulationMethod: 'sync-outline' as IconName,

  // Activity
  noExercise: 'close-circle-outline' as IconName,
  yoga: 'body-outline' as IconName,
  gym: 'barbell-outline' as IconName,
  dance: 'musical-notes-outline' as IconName,
  swimming: 'water-outline' as IconName,
  teamSports: 'football-outline' as IconName,
  running: 'walk-outline' as IconName,
  cycling: 'bicycle-outline' as IconName,
  walking: 'footsteps-outline' as IconName,

  // Others
  travel: 'airplane-outline' as IconName,
  stress: 'thunderstorm-outline' as IconName,
  disease: 'medkit-outline' as IconName,
  alcohol: 'wine-outline' as IconName,
  meditation: 'leaf-outline' as IconName,
  journaling: 'book-outline' as IconName,
  kegel: 'fitness-outline' as IconName,
  breathing: 'partly-sunny-outline' as IconName,

  // Profile
  avatar: 'person-circle-outline' as IconName,
  manageAccount: 'person-outline' as IconName,
  goalCycle: 'water' as IconName,
  goalPregnancy: 'body-outline' as IconName,
  goalConceive: 'heart-outline' as IconName,
  scaleStat: 'options-outline' as IconName,
  language: 'globe-outline' as IconName,
  lock: 'lock-closed-outline' as IconName,
  key: 'key-outline' as IconName,
  doctor: 'medkit-outline' as IconName,
  bell: 'notifications-outline' as IconName,
  reportProblem: 'alert-circle-outline' as IconName,
  permission: 'key-outline' as IconName,
  star: 'star' as IconName,
  moreApps: 'apps-outline' as IconName,
  shareApp: 'share-social-outline' as IconName,

  // Widgets
  download: 'download-outline' as IconName,
  water: 'water' as IconName,
  babyBottle: 'nutrition-outline' as IconName,
  dueDate: 'calendar-outline' as IconName,

  // Cycle info
  ovulationDot: 'ellipse' as IconName,
  stretching: 'body-outline' as IconName,
  walkOutline: 'walk-outline' as IconName,

  // Auth
  google: 'logo-google' as IconName,
  mail: 'mail-outline' as IconName,
  lockField: 'lock-closed-outline' as IconName,
  eye: 'eye-outline' as IconName,
  eyeOff: 'eye-off-outline' as IconName,
  nameField: 'person-outline' as IconName,
  logout: 'log-out-outline' as IconName,
};
