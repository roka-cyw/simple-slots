import * as PIXI from 'pixi.js'
import { SYMBOL_TYPES } from '../utils/constants'

export default class ResourceManager {
  private static instance: ResourceManager
  private symbolTextures: Map<string, PIXI.Texture> = new Map()
  private isLoaded: boolean = false

  private constructor() {}

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager()
    }
    return ResourceManager.instance
  }

  public async loadSymbols(): Promise<void> {
    if (this.isLoaded) return

    console.log('Loading individual symbol files...')

    try {
      // Load each symbol file individually
      let loadedCount = 0

      for (const symbolType of SYMBOL_TYPES) {
        const symbolPath = `/symbols/${symbolType}`
        console.log(`Loading symbol: ${symbolPath}`)

        try {
          const texture = await PIXI.Assets.load(symbolPath)
          this.symbolTextures.set(symbolType, texture)
          loadedCount++
          console.log(`Successfully loaded ${symbolType}: ${texture.width}x${texture.height}`)
        } catch (error) {
          console.error(`Failed to load symbol ${symbolType}:`, error)
        }
      }

      this.isLoaded = true
      console.log(`Symbol loading complete: ${loadedCount}/${SYMBOL_TYPES.length} symbols loaded`)
    } catch (error) {
      console.error('Failed to load symbols:', error)
      // Fallback to simple colored squares if loading fails
      this.createFallbackTextures()
    }
  }

  private createFallbackTextures(): void {
    console.log('Creating fallback textures...')

    SYMBOL_TYPES.forEach(symbolType => {
      this.symbolTextures.set(symbolType, PIXI.Texture.WHITE)
    })

    this.isLoaded = true
    console.log('Fallback textures created successfully:', this.symbolTextures.size)
  }

  public getSymbolTexture(symbolName: string): PIXI.Texture | undefined {
    const texture = this.symbolTextures.get(symbolName)
    if (!texture) {
      console.error(`No texture found for symbol: ${symbolName}`)
      return undefined
    }

    console.log(`Getting texture for ${symbolName}: ${texture.width}x${texture.height}`)
    return texture
  }

  public getAllSymbolTextures(): PIXI.Texture[] {
    return Array.from(this.symbolTextures.values())
  }

  public getRandomSymbolTexture(): PIXI.Texture {
    const textures = this.getAllSymbolTextures()
    if (textures.length === 0) {
      return PIXI.Texture.WHITE
    }
    const randomIndex = Math.floor(Math.random() * textures.length)
    return textures[randomIndex]
  }

  public getRandomSymbolType(): string {
    return SYMBOL_TYPES[Math.floor(Math.random() * SYMBOL_TYPES.length)]
  }

  public isResourcesLoaded(): boolean {
    return this.isLoaded
  }
}
