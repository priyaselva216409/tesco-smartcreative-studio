"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCanvas } from "@/lib/canvas-context"
import { runComplianceCheck, type ComplianceReport, type ComplianceCheckResult } from "@/lib/compliance-rules"
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react"

export function CompliancePanel() {
  const { layers, canvasSize, backgroundColor, setSelectedLayerId } = useCanvas()
  const [report, setReport] = useState<ComplianceReport | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["errors", "warnings"])

  const runCheck = async () => {
    setIsChecking(true)
    // Simulate processing time for UX
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newReport = runComplianceCheck(layers, canvasSize, backgroundColor)
    setReport(newReport)
    setIsChecking(false)
  }

  // Auto-run check when layers change
  useEffect(() => {
    if (layers.length > 0) {
      runCheck()
    }
  }, [layers.length])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const renderIssueItem = (item: ComplianceCheckResult) => {
    const icons = {
      error: <AlertCircle className="h-4 w-4 text-red-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      info: <Info className="h-4 w-4 text-blue-500" />,
    }

    return (
      <div key={item.rule.id} className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-start gap-2">
          {icons[item.rule.severity]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.rule.name}</p>
            <p className="text-xs text-muted-foreground">{item.result.message}</p>
          </div>
        </div>
        {item.result.suggestion && (
          <p className="text-xs text-muted-foreground bg-secondary rounded p-2">{item.result.suggestion}</p>
        )}
        {item.result.affectedLayers && item.result.affectedLayers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.result.affectedLayers.map((layerId) => {
              const layer = layers.find((l) => l.id === layerId)
              return (
                <button
                  key={layerId}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  onClick={() => setSelectedLayerId(layerId)}
                >
                  {layer?.name || "Layer"}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Compliance Check
        </h3>
        <p className="text-xs text-muted-foreground">Validate against brand & retailer guidelines</p>
      </div>

      {/* Run Check Button */}
      <Button className="w-full gap-2" onClick={runCheck} disabled={isChecking || layers.length === 0}>
        <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        {isChecking ? "Checking..." : "Run Compliance Check"}
      </Button>

      {layers.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Add elements to your canvas to run compliance checks</p>
        </div>
      )}

      {report && (
        <>
          {/* Overall Score */}
          <div className="rounded-lg bg-secondary p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Compliance Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>{report.overallScore}%</span>
            </div>
            <Progress value={report.overallScore} className={`h-2 ${getScoreProgressColor(report.overallScore)}`} />
            <p className="text-xs text-muted-foreground">
              {report.passedChecks} of {report.totalChecks} checks passed
            </p>
          </div>

          {/* All Passed */}
          {report.errors.length === 0 && report.warnings.length === 0 && report.info.length === 0 && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-500">All Checks Passed!</p>
                <p className="text-xs text-muted-foreground">Your creative meets all compliance guidelines</p>
              </div>
            </div>
          )}

          {/* Errors */}
          {report.errors.length > 0 && (
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => toggleSection("errors")}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-foreground">Errors ({report.errors.length})</span>
                </div>
                {expandedSections.includes("errors") ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.includes("errors") && (
                <div className="space-y-2">{report.errors.map(renderIssueItem)}</div>
              )}
            </div>
          )}

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => toggleSection("warnings")}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">Warnings ({report.warnings.length})</span>
                </div>
                {expandedSections.includes("warnings") ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.includes("warnings") && (
                <div className="space-y-2">{report.warnings.map(renderIssueItem)}</div>
              )}
            </div>
          )}

          {/* Info */}
          {report.info.length > 0 && (
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => toggleSection("info")}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">Suggestions ({report.info.length})</span>
                </div>
                {expandedSections.includes("info") ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.includes("info") && <div className="space-y-2">{report.info.map(renderIssueItem)}</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
