import * as PIXI from 'pixi.js'
import SlotReel from './SlotReel'
import { SLOT_CONFIG, GameState, ANIMATION, SYMBOL_TYPES, type SymbolType } from '../utils/constants'

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

    console.log('=== STARTING SPIN ===')
    this.gameState = GameState.SPINNING

    // Generate the final grid first
    const finalGrid = this.generateFinalGrid()
    console.log('Generated final grid:', finalGrid)

    // Set the final symbols for each reel
    for (let reelIndex = 0; reelIndex < SLOT_CONFIG.REELS; reelIndex++) {
      const reelSymbols: SymbolType[] = []
      for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
        reelSymbols.push(finalGrid[row][reelIndex])
      }
      console.log(`Setting final symbols for reel ${reelIndex}:`, reelSymbols)
      this.reels[reelIndex].setFinalSymbols(reelSymbols)
    }

    // Small delay to ensure final symbols are set
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('Starting all reels spinning...')
    // Start all reels spinning simultaneously (this will switch to new symbols)
    this.reels.forEach(reel => {
      reel.startSpin()
    })

    // Wait for spin duration
    await new Promise(resolve => setTimeout(resolve, ANIMATION.SPIN_DURATION * 1000))

    this.gameState = GameState.STOPPING
    console.log('=== STOPPING REELS ===')

    // Stop reels one by one from left to right with delay
    for (let i = 0; i < this.reels.length; i++) {
      console.log(`Stopping reel ${i}`)
      this.reels[i].requestStop()
      // Add delay between stops for cascading effect
      if (i < this.reels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, ANIMATION.REEL_STOP_DELAY * 1000))
      }
    }

    this.gameState = GameState.IDLE
    console.log('=== SPIN COMPLETE ===')

    // Check for wins after all reels stopped
    this.checkForWins()
  }

  private generateFinalGrid(): SymbolType[][] {
    const grid: SymbolType[][] = []

    // Generate the final grid
    for (let row = 0; row < SLOT_CONFIG.ROWS; row++) {
      grid[row] = []
      for (let reel = 0; reel < SLOT_CONFIG.REELS; reel++) {
        // Generate random symbol for this position
        const symbolTypes = Object.values(SYMBOL_TYPES)
        grid[row][reel] = symbolTypes[Math.floor(Math.random() * symbolTypes.length)]
      }
    }

    return grid
  }

  private checkForWins(): void {
    const grid: string[][] = []

    // Build the symbol grid from visible symbols
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
