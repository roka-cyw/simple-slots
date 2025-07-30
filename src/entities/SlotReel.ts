import * as PIXI from 'pixi.js'
import { SLOT_CONFIG, SYMBOL_TYPES, type SymbolType } from '../utils/constants'
import ResourceManager from '../core/ResourceManager'
import Symbol from './Symbol'

export default class SlotReel {
  public container: PIXI.Container
  private symbols: Symbol[] = []
  private newSymbols: Symbol[] = [] // New symbols generated for next spin
  private resourceManager: ResourceManager
  private reelIndex: number
  private blurFilter: PIXI.BlurFilter = new PIXI.BlurFilter(1.5)

  private spinSpeed: number = 0
  private baseSpinSpeed: number = 20
  private isSpinning: boolean = false
  private currentOffset: number = 0

  constructor(reelIndex: number) {
    this.reelIndex = reelIndex
    this.container = new PIXI.Container()
    this.resourceManager = ResourceManager.getInstance()
    this.init()
  }

  private init(): void {
    this.setupMask()
    // Create initial symbols so users see something when app loads
    // Wait a bit for ResourceManager to load
    setTimeout(() => {
      if (this.resourceManager.isResourcesLoaded()) {
        this.createSymbols()
      } else {
        console.warn(`ResourceManager not loaded for initial symbols on reel ${this.reelIndex}`)
      }
    }, 100)
  }

  private createSymbols(): void {
    // Clear existing symbols if any
    if (this.symbols.length > 0) {
      this.symbols.forEach(symbol => {
        if (symbol.sprite && symbol.sprite.parent) {
          symbol.sprite.parent.removeChild(symbol.sprite)
        }
        symbol.destroy()
      })
      this.symbols = []
    }

    // Create more symbols to ensure we always have enough
    // We need 3 visible + 2 above + 2 below + 1 extra at top = 8 total
    const totalSymbolsNeeded = 8

    for (let i = 0; i < totalSymbolsNeeded; i++) {
      const symbolType = this.getRandomSymbolType()
      const texture = this.resourceManager.getSymbolTexture(symbolType)

      if (!texture) {
        console.error(`No texture available for symbol type ${symbolType}`)
        continue
      }

      const symbol = new Symbol(texture, symbolType)

      // Position symbols with extra spacing at top
      const yPosition = i * (SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING) - SLOT_CONFIG.SYMBOL_HEIGHT

      symbol.sprite.position.set(0, yPosition)
      symbol.sprite.visible = true
      symbol.sprite.alpha = 1

      this.container.addChild(symbol.sprite)
      this.symbols.push(symbol)
    }

    console.log(`Created ${this.symbols.length} initial symbols for reel ${this.reelIndex}`)
  }

  private generateNewSymbols(): void {
    // Clear any existing new symbols
    this.newSymbols.forEach(symbol => {
      if (symbol.sprite && symbol.sprite.parent) {
        symbol.sprite.parent.removeChild(symbol.sprite)
      }
      symbol.destroy()
    })
    this.newSymbols = []

    // Create new symbols for the next spin
    const totalSymbolsNeeded = 8

    for (let i = 0; i < totalSymbolsNeeded; i++) {
      const symbolType = this.getRandomSymbolType()
      const texture = this.resourceManager.getSymbolTexture(symbolType)

      if (!texture) {
        console.error(`No texture available for symbol type ${symbolType}`)
        continue
      }

      const symbol = new Symbol(texture, symbolType)

      // Position symbols with extra spacing at top
      const yPosition = i * (SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING) - SLOT_CONFIG.SYMBOL_HEIGHT

      symbol.sprite.position.set(0, yPosition)
      symbol.sprite.visible = false // Don't show until we switch
      symbol.sprite.alpha = 1

      this.newSymbols.push(symbol)
    }

    console.log(`Generated ${this.newSymbols.length} new symbols for reel ${this.reelIndex}`)
  }

  // New method to set final symbols for the reel
  public setFinalSymbols(finalSymbols: SymbolType[]): void {
    console.log(`Reel ${this.reelIndex}: setFinalSymbols called with:`, finalSymbols)

    // Clear any existing new symbols
    this.newSymbols.forEach(symbol => {
      if (symbol.sprite && symbol.sprite.parent) {
        symbol.sprite.parent.removeChild(symbol.sprite)
      }
      symbol.destroy()
    })
    this.newSymbols = []

    // Create symbols based on the final result
    const totalSymbolsNeeded = 8

    for (let i = 0; i < totalSymbolsNeeded; i++) {
      let symbolType: SymbolType

      if (i < finalSymbols.length) {
        // Use the provided final symbols for the visible positions
        symbolType = finalSymbols[i]
        console.log(`Reel ${this.reelIndex}: Using final symbol ${i}: ${symbolType}`)
      } else {
        // Fill remaining positions with random symbols (for buffer)
        symbolType = this.getRandomSymbolType()
        console.log(`Reel ${this.reelIndex}: Using random symbol ${i}: ${symbolType}`)
      }

      const texture = this.resourceManager.getSymbolTexture(symbolType)

      if (!texture) {
        console.error(`No texture available for symbol type ${symbolType}`)
        continue
      }

      const symbol = new Symbol(texture, symbolType)

      // Position symbols with extra spacing at top
      const yPosition = i * (SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING) - SLOT_CONFIG.SYMBOL_HEIGHT

      symbol.sprite.position.set(0, yPosition)
      symbol.sprite.visible = false // Don't show until we switch
      symbol.sprite.alpha = 1

      this.newSymbols.push(symbol)
    }

    console.log(`Reel ${this.reelIndex}: Set final symbols successfully, newSymbols count: ${this.newSymbols.length}`)
  }

  private setupMask(): void {
    const mask = new PIXI.Graphics()
    // Учитываем зазоры в расчете высоты маски
    const symbolWithSpacing = SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING
    const maskHeight = SLOT_CONFIG.ROWS * symbolWithSpacing - SLOT_CONFIG.SYMBOL_SPACING

    mask.rect(-SLOT_CONFIG.SYMBOL_WIDTH / 2, -maskHeight / 2, SLOT_CONFIG.SYMBOL_WIDTH, maskHeight)
    mask.fill(0xffffff)

    this.container.addChild(mask)
    this.container.mask = mask
  }

  public startSpin(): void {
    this.isSpinning = true
    // this.isStopRequested = false
    this.spinSpeed = this.baseSpinSpeed // No random variation - constant speed

    // Switch to new symbols when animation starts
    this.switchToNewSymbols()

    // Apply blur effect during spinning
    this.applyBlur()
  }

  private switchToNewSymbols(): void {
    console.log(`Reel ${this.reelIndex}: switchToNewSymbols called`)

    // Safety check - ensure we have new symbols to switch to
    if (this.newSymbols.length === 0) {
      console.warn(`No new symbols available for reel ${this.reelIndex}, keeping current symbols`)
      return
    }

    console.log(
      `Switching symbols for reel ${this.reelIndex}: ${this.symbols.length} current -> ${this.newSymbols.length} new`
    )

    // Log the symbol types being switched to
    const newSymbolTypes = this.newSymbols.map(symbol => symbol.symbolType)
    console.log(`Reel ${this.reelIndex}: New symbol types:`, newSymbolTypes)

    // Remove current symbols from display
    this.symbols.forEach(symbol => {
      if (symbol.sprite && symbol.sprite.parent) {
        symbol.sprite.parent.removeChild(symbol.sprite)
      }
      symbol.destroy()
    })

    // Switch to new symbols
    this.symbols = this.newSymbols
    this.newSymbols = []

    // Add new symbols to display
    this.symbols.forEach(symbol => {
      this.container.addChild(symbol.sprite)
      symbol.sprite.visible = true
      symbol.sprite.alpha = 1
    })

    // Reset offset to ensure proper positioning
    this.currentOffset = 0

    // Update positions immediately
    this.updateSymbolPositions()

    console.log(`Successfully switched to ${this.symbols.length} new symbols for reel ${this.reelIndex}`)
  }

  public refreshSymbols(): void {
    // Check if ResourceManager is loaded before generating symbols
    if (!this.resourceManager.isResourcesLoaded()) {
      console.error(`ResourceManager not loaded for reel ${this.reelIndex}`)
      return
    }

    // Generate new symbols in the background (don't display them yet)
    this.generateNewSymbols()
  }

  public requestStop(): void {
    if (!this.isSpinning) return

    this.isSpinning = false
    this.removeBlur()

    // Stop immediately without bounce
    this.spinSpeed = 0
    this.currentOffset = 0

    // Ensure symbols are properly positioned
    this.updateSymbolPositions()

    console.log(`Reel ${this.reelIndex} stopped cleanly`)
  }

  public update(): void {
    if (this.isSpinning) {
      this.currentOffset -= this.spinSpeed

      const symbolWithSpacing = SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING

      // Recycle symbols when they move out of view to prevent gaps
      if (this.currentOffset <= -symbolWithSpacing * 5) {
        this.recycleSymbols()
        this.currentOffset += symbolWithSpacing * 5
      }

      this.updateSymbolPositions()
    }
  }

  private recycleSymbols(): void {
    const symbolsToRecycle = 5 // Recycle 5 symbols at a time

    for (let i = 0; i < symbolsToRecycle; i++) {
      const symbol = this.symbols.pop()
      if (symbol) {
        // Move to the front of the array (top of the reel)
        this.symbols.unshift(symbol)
      }
    }

    console.log(`Recycled ${symbolsToRecycle} symbols for reel ${this.reelIndex}`)
  }

  private updateSymbolPositions(): void {
    const symbolWithSpacing = SLOT_CONFIG.SYMBOL_HEIGHT + SLOT_CONFIG.SYMBOL_SPACING

    this.symbols.forEach((symbol, index) => {
      // Position symbols with 5 symbols above visible area
      const baseY = (index - 5) * symbolWithSpacing
      const currentY = baseY - this.currentOffset
      symbol.setPosition(0, currentY)
    })
  }

  public getVisibleSymbols(): Symbol[] {
    const visibleSymbols: Symbol[] = []
    const startIndex = 5 // Start from index 5 (after the 5 buffer symbols above)

    // Safety check - ensure symbols exist
    if (this.symbols.length === 0) {
      console.warn(`No symbols available for reel ${this.reelIndex}`)
      return visibleSymbols
    }

    for (let i = 0; i < SLOT_CONFIG.ROWS; i++) {
      const symbolIndex = startIndex + i
      if (symbolIndex < this.symbols.length) {
        visibleSymbols.push(this.symbols[symbolIndex])
      }
    }

    return visibleSymbols
  }

  public isReelSpinning(): boolean {
    return this.isSpinning
  }

  public getSymbolCount(): number {
    return this.symbols.length
  }

  public getVisibleSymbolCount(): number {
    return this.getVisibleSymbols().length
  }

  public destroy(): void {
    this.symbols.forEach(symbol => symbol.destroy())
    this.symbols = []
    this.container.destroy({ children: true })
  }

  private applyBlur(): void {
    // Apply blur filter to the container
    this.container.filters = [this.blurFilter]
  }

  private removeBlur(): void {
    // Remove blur filter from the container
    this.container.filters = []
  }

  private getRandomSymbolType(): SymbolType {
    const symbolTypes = Object.values(SYMBOL_TYPES)
    return symbolTypes[Math.floor(Math.random() * symbolTypes.length)]
  }
}
