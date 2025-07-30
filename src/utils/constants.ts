export const SLOT_CONFIG = {
  REELS: 5,
  ROWS: 3,
  SYMBOL_WIDTH: 80,
  SYMBOL_HEIGHT: 80,
  REEL_SPACING: 10,
  SYMBOL_SPACING: 5
} as const

export const SYMBOL_TYPES = [
  'M00_000.jpg', // stingray
  'M01_000.jpg', // crab
  'M02_000.jpg', // seahorse
  'M03_000.jpg', // anglerfish
  'M04_000.jpg', // fish with glasses
  'M05_000.jpg', // A
  'M06_000.jpg', // K
  'M07_000.jpg', // Q
  'M08_000.jpg', // J
  'M09_000.jpg', // 10
  'M10_000.jpg', // 9
  'M11_000.jpg', // pearl
  'M12_000.jpg' // fish
] as const

export type SymbolType = (typeof SYMBOL_TYPES)[number]

export const GameState = {
  IDLE: 'idle',
  SPINNING: 'spinning',
  STOPPING: 'stopping'
} as const

export const ANIMATION = {
  SPIN_DURATION: 1.0,
  REEL_STOP_DELAY: 0.2,
  BOUNCE_DURATION: 0.3
} as const
