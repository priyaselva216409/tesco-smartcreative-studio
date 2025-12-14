export interface Asset {
  id: string
  name: string
  type: "image" | "packshot" | "background" | "logo"
  src: string
  thumbnail?: string
  category: string
  tags: string[]
  uploadedAt: Date
  dimensions?: { width: number; height: number }
}

export interface AssetCategory {
  id: string
  name: string
  icon: string
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: "all", name: "All Assets", icon: "folder" },
  { id: "packshots", name: "Packshots", icon: "package" },
  { id: "backgrounds", name: "Backgrounds", icon: "image" },
  { id: "logos", name: "Logos", icon: "award" },
  { id: "uploads", name: "My Uploads", icon: "upload" },
]

// Sample background gradients for quick use
export const SAMPLE_BACKGROUNDS = [
  {
    id: "gradient-1",
    name: "Ocean Blue",
    css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    colors: ["#667eea", "#764ba2"],
  },
  {
    id: "gradient-2",
    name: "Sunset",
    css: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    colors: ["#f093fb", "#f5576c"],
  },
  {
    id: "gradient-3",
    name: "Fresh Mint",
    css: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    colors: ["#4facfe", "#00f2fe"],
  },
  {
    id: "gradient-4",
    name: "Spring Green",
    css: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    colors: ["#43e97b", "#38f9d7"],
  },
  {
    id: "gradient-5",
    name: "Golden Hour",
    css: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    colors: ["#fa709a", "#fee140"],
  },
  {
    id: "gradient-6",
    name: "Cool Gray",
    css: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)",
    colors: ["#a8c0ff", "#3f2b96"],
  },
  {
    id: "gradient-7",
    name: "Coral Reef",
    css: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    colors: ["#ff9a9e", "#fecfef"],
  },
  {
    id: "gradient-8",
    name: "Deep Space",
    css: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)",
    colors: ["#0c0c0c", "#1a1a2e"],
  },
]

// Sample templates for quick start
export const SAMPLE_TEMPLATES = [
  {
    id: "template-1",
    name: "Product Showcase",
    description: "Center-focused product with text overlay",
    thumbnail: "/product-showcase-template.png",
  },
  {
    id: "template-2",
    name: "Sale Banner",
    description: "Bold text with promotional messaging",
    thumbnail: "/sale-banner-template.jpg",
  },
  {
    id: "template-3",
    name: "Story Format",
    description: "Vertical layout for Instagram/Facebook stories",
    thumbnail: "/story-format-template.jpg",
  },
  {
    id: "template-4",
    name: "Minimal Clean",
    description: "Simple, elegant product presentation",
    thumbnail: "/minimal-clean-template.png",
  },
]
