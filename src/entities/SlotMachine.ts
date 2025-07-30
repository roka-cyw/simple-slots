import * as PIXI from 'pixi.js'
import SlotReel from './SlotReel'
import { SLOT_CONFIG, GameState, ANIMATION } from '../utils/constants'

export default class SlotMachine {
  public container: PIXI.Container
  private reels: SlotReel[] = []
  private gameState: string = GameState.IDLE

  private static readonly MACHINE_BACKGROUND_COLOR = 0x34495e
  private static readonly MACHINE_BORDER_COLOR = 0x2c3e50

  constructor() {
    this.container = new PIXI.Container()
    this.init()
  }

  private init(): void {
    this.createBackground()
    this.createReels()
  }

  private createBackground(): void {
    const totalWidth =
      SLOT_CONFIG.REELS * SLOT_CONFIG.SYMBOL_WIDTH + (SLOT_CONFIG.REELS - 1) * SLOT_CONFIG.REEL_SPACING + 40 // padding

    const totalHeight =
      SLOT_CONFIG.ROWS * SLOT_CONFIG.SYMBOL_HEIGHT + (SLOT_CONFIG.ROWS - 1) * SLOT_CONFIG.SYMBOL_SPACING + 40 // padding

    const background = new PIXI.Graphics()
    background.roundRect(-totalWidth / 2, -totalHeight / 2, totalWidth, totalHeight, 15)
    background.fill(SlotMachine.MACHINE_BACKGROUND_COLOR)
    background.stroke({
      color: SlotMachine.MACHINE_BORDER_COLOR,
      width: 4
    })

    this.container.addChild(background)
  }

  private createReels(): void {
    const startX = (-(SLOT_CONFIG.REELS - 1) * (SLOT_CONFIG.SYMBOL_WIDTH + SLOT_CONFIG.REEL_SPACING)) / 2

    for (let i = 0; i < SLOT_CONFIG.REELS; i++) {
      const reel = new SlotReel(i)

      const xPosition = startX + i * (SLOT_CONFIG.SYMBOL_WIDTH + SLOT_CONFIG.REEL_SPACING)
      reel.container.x = xPosition
      reel.container.y = 0

      this.reels.push(reel)
      this.container.addChild(reel.container)
    }
  }

  public async startSpin(): Promise<void> {
    if (this.gameState !== GameState.IDLE) return

    this.gameState = GameState.SPINNING

    // Generate new symbols for all reels (but keep current symbols displayed)
    this.reels.forEach(reel => {
      reel.refreshSymbols() // Generate new symbols in background
    })

    // Small delay to ensure new symbols are generated
    await new Promise(resolve => setTimeout(resolve, 100))

    // Start all reels spinning simultaneously (this will switch to new symbols)
    this.reels.forEach(reel => {
      reel.startSpin()
    })

    // Wait for spin duration
    await new Promise(resolve => setTimeout(resolve, ANIMATION.SPIN_DURATION * 1000))

    this.gameState = GameState.STOPPING

    // Stop reels one by one from left to right with delay
    for (let i = 0; i < this.reels.length; i++) {
      this.reels[i].requestStop()
      // Add delay between stops for cascading effect
      if (i < this.reels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, ANIMATION.REEL_STOP_DELAY * 1000))
      }
    }

    this.gameState = GameState.IDLE

    // Check for wins after all reels stopped
    this.checkForWins()
  }

  private checkForWins(): void {
    const grid: string[][] = []

    // Build the symbol grid
    for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
      grid[row] = []
      for (let reel = 0; reel < SLOT_CONFIG.REELS; reel++) {
        const visibleSymbols = this.reels[reel].getVisibleSymbols()
        if (visibleSymbols[row]) {
          grid[row][reel] = visibleSymbols[row].symbolType
        }
      }
    }

    console.log('Final grid:', grid)

    // Simple win detection - check for 3+ consecutive symbols in rows
    let totalWins = 0
    for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
      const winLength = this.checkRowForWin(grid[row])
      if (winLength >= 3) {
        console.log(`Win found on row ${row + 1}: ${winLength} symbols of ${grid[row][0]}`)
        totalWins++
      }
    }

    if (totalWins > 0) {
      console.log(`Total wins: ${totalWins}`)
      // Here you could emit an event or call a callback for win handling
    }
  }

  private checkRowForWin(row: string[]): number {
    const firstSymbol = row[0]
    let consecutiveCount = 1

    for (let i = 1; i < row.length; i++) {
      if (row[i] === firstSymbol) {
        consecutiveCount++
      } else {
        break
      }
    }

    return consecutiveCount
  }

  public update(): void {
    // Update all reels
    this.reels.forEach(reel => {
      reel.update()
    })
  }

  public isSpinning(): boolean {
    return this.gameState === GameState.SPINNING || this.gameState === GameState.STOPPING
  }

  public getGameState(): string {
    return this.gameState
  }

  public destroy(): void {
    this.reels.forEach(reel => reel.destroy())
    this.reels = []
    this.container.destroy({ children: true })
  }
}
