import * as PIXI from 'pixi.js'
import { SYMBOL_TYPES, ASSETS } from '../utils/constants'

export default class ResourceManager {
  private static instance: ResourceManager
  private symbolTextures: Map<string, PIXI.Texture> = new Map()
  private isLoaded: boolean = false
  private atlasTexture: PIXI.Texture | null = null
  private atlasData: any = null

  private constructor() {}

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager()
    }
    return ResourceManager.instance
  }

  public async loadSymbols(): Promise<void> {
    if (this.isLoaded) return

    console.log('Loading symbol atlas...')

    try {
      // Load the atlas texture using a different approach
      const image = new Image()
      image.src = '/src/assets/atlas/symbols.png'

      console.log('Loading image from:', image.src)

      await new Promise((resolve, reject) => {
        image.onload = () => {
          console.log('Image loaded successfully, dimensions:', image.width, 'x', image.height)
          resolve(null)
        }
        image.onerror = error => {
          console.error('Failed to load image:', error)
          reject(error)
        }
      })

      // Create texture from image
      this.atlasTexture = PIXI.Texture.from(image)
      console.log('PIXI texture created from image')

      // Load the atlas JSON data
      console.log('Loading JSON from:', ASSETS.SYMBOL_JSON)
      const response = await fetch(ASSETS.SYMBOL_JSON)
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`)
      }
      this.atlasData = await response.json()
      console.log('JSON loaded successfully, frames:', Object.keys(this.atlasData.frames).length)

      // Create textures for each symbol from the atlas using canvas extraction
      let createdTextures = 0
      SYMBOL_TYPES.forEach(symbolType => {
        const frameData = this.atlasData.frames[symbolType]
        if (frameData) {
          const { x, y, w, h } = frameData.frame
          console.log(`Creating texture for ${symbolType}: x=${x}, y=${y}, w=${w}, h=${h}`)

          // Extract the symbol region using canvas
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')!

          // Draw the specific region from the atlas to the canvas
          ctx.drawImage(image, x, y, w, h, 0, 0, w, h)

          // Create texture from the canvas
          const texture = PIXI.Texture.from(canvas)

          // Verify the texture was created correctly
          console.log(`Texture created for ${symbolType}:`, {
            width: texture.width,
            height: texture.height
          })

          this.symbolTextures.set(symbolType, texture)
          createdTextures++
        } else {
          console.warn(`Frame data not found for symbol: ${symbolType}`)
        }
      })

      this.isLoaded = true
      console.log('Symbol atlas loaded successfully:', createdTextures, 'textures created')
    } catch (error) {
      console.error('Failed to load symbol atlas:', error)
      // Fallback to simple colored squares if atlas loading fails
      this.createFallbackTextures()
    }
  }

  private createFallbackTextures(): void {
    console.log('Creating fallback textures...')

    const colors = [
      0xff4757, // Red
      0x2ed573, // Green
      0x1e90ff, // Blue
      0xffa502, // Orange
      0xff6b7a, // Pink
      0x5352ed, // Purple
      0xff9ff3, // Light Purple
      0x54a0ff, // Light Blue
      0x5f27cd, // Dark Purple
      0xee5253, // Dark Red
      0x00d2d3, // Cyan
      0xff9f43, // Yellow
      0x10ac84 // Teal
    ]

    SYMBOL_TYPES.forEach((symbolType, index) => {
      this.symbolTextures.set(symbolType, PIXI.Texture.WHITE)
    })

    this.isLoaded = true
    console.log('Fallback textures created successfully:', this.symbolTextures.size)
  }

  public getSymbolTexture(symbolName: string): PIXI.Texture | undefined {
    return this.symbolTextures.get(symbolName)
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

  public getSymbolColor(symbolType: string): number {
    // Return white (no tint) since we're using actual symbol textures now
    return 0xffffff
  }

  public isResourcesLoaded(): boolean {
    return this.isLoaded
  }
}
