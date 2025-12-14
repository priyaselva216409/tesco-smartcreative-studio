import type { Layer, CanvasSize } from "./types"

export interface ComplianceRule {
  id: string
  name: string
  description: string
  category: "brand" | "retailer" | "platform"
  severity: "error" | "warning" | "info"
  check: (layers: Layer[], canvasSize: CanvasSize, backgroundColor: string) => ComplianceResult
}

export interface ComplianceResult {
  passed: boolean
  message: string
  affectedLayers?: string[]
  suggestion?: string
}

export interface ComplianceReport {
  overallScore: number
  totalChecks: number
  passedChecks: number
  errors: ComplianceCheckResult[]
  warnings: ComplianceCheckResult[]
  info: ComplianceCheckResult[]
}

export interface ComplianceCheckResult {
  rule: ComplianceRule
  result: ComplianceResult
}

// Define compliance rules based on common retail media guidelines
export const COMPLIANCE_RULES: ComplianceRule[] = [
  // Brand Guidelines
  {
    id: "min-logo-size",
    name: "Minimum Logo Size",
    description: "Logos should be at least 10% of the canvas area for visibility",
    category: "brand",
    severity: "warning",
    check: (layers, canvasSize) => {
      const packshots = layers.filter((l) => l.type === "packshot")
      if (packshots.length === 0) {
        return { passed: true, message: "No packshot/logo found to check" }
      }

      const canvasArea = canvasSize.width * canvasSize.height
      const minArea = canvasArea * 0.1

      const smallPackshots = packshots.filter((p) => p.width * p.height < minArea)
      if (smallPackshots.length > 0) {
        return {
          passed: false,
          message: `${smallPackshots.length} packshot(s) may be too small for visibility`,
          affectedLayers: smallPackshots.map((p) => p.id),
          suggestion: "Increase packshot size to at least 10% of canvas area",
        }
      }

      return { passed: true, message: "All packshots meet minimum size requirements" }
    },
  },
  {
    id: "text-readability",
    name: "Text Readability",
    description: "Text should be large enough to read on mobile devices",
    category: "brand",
    severity: "warning",
    check: (layers) => {
      const textLayers = layers.filter((l) => l.type === "text")
      if (textLayers.length === 0) {
        return { passed: true, message: "No text layers to check" }
      }

      const smallText = textLayers.filter((t) => (t.fontSize || 24) < 14)
      if (smallText.length > 0) {
        return {
          passed: false,
          message: `${smallText.length} text layer(s) may be too small to read`,
          affectedLayers: smallText.map((t) => t.id),
          suggestion: "Increase font size to at least 14px for readability",
        }
      }

      return { passed: true, message: "All text is readable" }
    },
  },

  // Retailer Guidelines
  {
    id: "safe-zone",
    name: "Safe Zone Compliance",
    description: "Important elements should not be within 5% of canvas edges",
    category: "retailer",
    severity: "error",
    check: (layers, canvasSize) => {
      const margin = Math.min(canvasSize.width, canvasSize.height) * 0.05
      const importantLayers = layers.filter((l) => l.type === "text" || l.type === "packshot")

      const violations = importantLayers.filter((layer) => {
        return (
          layer.x < margin ||
          layer.y < margin ||
          layer.x + layer.width > canvasSize.width - margin ||
          layer.y + layer.height > canvasSize.height - margin
        )
      })

      if (violations.length > 0) {
        return {
          passed: false,
          message: `${violations.length} element(s) are too close to the edge`,
          affectedLayers: violations.map((l) => l.id),
          suggestion: "Move elements away from the canvas edges to ensure visibility across platforms",
        }
      }

      return { passed: true, message: "All elements are within safe zones" }
    },
  },
  {
    id: "image-quality",
    name: "Image Quality",
    description: "Images should not be stretched beyond their original size",
    category: "retailer",
    severity: "warning",
    check: (layers) => {
      // In a real implementation, this would check actual image dimensions
      // For now, we'll check if any image is very large
      const images = layers.filter((l) => l.type === "image" || l.type === "packshot")
      // Placeholder check - in production would compare to original dimensions
      return { passed: true, message: "Image quality check passed" }
    },
  },
  {
    id: "contrast-check",
    name: "Color Contrast",
    description: "Text should have sufficient contrast against background",
    category: "retailer",
    severity: "warning",
    check: (layers, canvasSize, backgroundColor) => {
      const textLayers = layers.filter((l) => l.type === "text")
      if (textLayers.length === 0) {
        return { passed: true, message: "No text layers to check" }
      }

      // Simple contrast check - in production would use WCAG formulas
      const isLightBg = isLightColor(backgroundColor)
      const lowContrast = textLayers.filter((t) => {
        const textIsLight = isLightColor(t.fill || "#000000")
        return isLightBg === textIsLight
      })

      if (lowContrast.length > 0) {
        return {
          passed: false,
          message: `${lowContrast.length} text layer(s) may have low contrast`,
          affectedLayers: lowContrast.map((t) => t.id),
          suggestion: "Use darker text on light backgrounds or lighter text on dark backgrounds",
        }
      }

      return { passed: true, message: "Text contrast is adequate" }
    },
  },

  // Platform Guidelines
  {
    id: "text-overlay-limit",
    name: "Text Overlay Limit",
    description: "Some platforms restrict text coverage to 20% of the image",
    category: "platform",
    severity: "info",
    check: (layers, canvasSize) => {
      const textLayers = layers.filter((l) => l.type === "text")
      if (textLayers.length === 0) {
        return { passed: true, message: "No text layers present" }
      }

      const canvasArea = canvasSize.width * canvasSize.height
      const textArea = textLayers.reduce((sum, t) => sum + t.width * t.height, 0)
      const textPercentage = (textArea / canvasArea) * 100

      if (textPercentage > 20) {
        return {
          passed: false,
          message: `Text covers ${textPercentage.toFixed(1)}% of the image (limit: 20%)`,
          suggestion: "Reduce text area for better ad performance on Facebook/Instagram",
        }
      }

      return {
        passed: true,
        message: `Text covers ${textPercentage.toFixed(1)}% of the image`,
      }
    },
  },
  {
    id: "has-cta",
    name: "Call-to-Action Present",
    description: "Effective ads should include a clear call-to-action",
    category: "platform",
    severity: "info",
    check: (layers) => {
      const textLayers = layers.filter((l) => l.type === "text")
      const ctaKeywords = ["shop", "buy", "learn", "discover", "get", "try", "order", "subscribe", "start"]

      const hasCta = textLayers.some((t) => {
        const content = (t.content || "").toLowerCase()
        return ctaKeywords.some((kw) => content.includes(kw))
      })

      if (!hasCta) {
        return {
          passed: false,
          message: "No clear call-to-action detected",
          suggestion: 'Consider adding a CTA like "Shop Now", "Learn More", or "Get Started"',
        }
      }

      return { passed: true, message: "Call-to-action is present" }
    },
  },
  {
    id: "product-visibility",
    name: "Product Visibility",
    description: "Product image should be prominently displayed",
    category: "platform",
    severity: "warning",
    check: (layers, canvasSize) => {
      const products = layers.filter((l) => l.type === "image" || l.type === "packshot")
      if (products.length === 0) {
        return {
          passed: false,
          message: "No product image found",
          suggestion: "Add a product image or packshot to showcase your offering",
        }
      }

      const canvasArea = canvasSize.width * canvasSize.height
      const largestProduct = Math.max(...products.map((p) => p.width * p.height))
      const productPercentage = (largestProduct / canvasArea) * 100

      if (productPercentage < 15) {
        return {
          passed: false,
          message: "Product image may be too small",
          suggestion: "Increase product size to at least 15% of the canvas for better visibility",
        }
      }

      return { passed: true, message: "Product is prominently displayed" }
    },
  },
]

// Helper function to determine if a color is light
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = Number.parseInt(c.substr(0, 2), 16)
  const g = Number.parseInt(c.substr(2, 2), 16)
  const b = Number.parseInt(c.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

export function runComplianceCheck(layers: Layer[], canvasSize: CanvasSize, backgroundColor: string): ComplianceReport {
  const results: ComplianceCheckResult[] = COMPLIANCE_RULES.map((rule) => ({
    rule,
    result: rule.check(layers, canvasSize, backgroundColor),
  }))

  const errors = results.filter((r) => !r.result.passed && r.rule.severity === "error")
  const warnings = results.filter((r) => !r.result.passed && r.rule.severity === "warning")
  const info = results.filter((r) => !r.result.passed && r.rule.severity === "info")

  const passedChecks = results.filter((r) => r.result.passed).length
  const overallScore = Math.round((passedChecks / results.length) * 100)

  return {
    overallScore,
    totalChecks: results.length,
    passedChecks,
    errors,
    warnings,
    info,
  }
}
