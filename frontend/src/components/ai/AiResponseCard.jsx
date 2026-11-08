import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

export default function AiResponseCard({ report }) {
  const toast = useToast();
  if (!report) return null;

  const handleCopyReport = () => {
    const text = `
=== INSIGHTFORGE AI EXECUTIVE INTELLIGENCE REPORT ===
Model: ${report.model_version || 'Google Gemini 1.5 Pro'}
Confidence: ${(report.confidence_score * 100).toFixed(0)}%

EXECUTIVE SUMMARY:
${report.executive_summary}

KEY FINDINGS:
${report.key_findings?.map((f) => `- [${f.impact_level}] ${f.title}: ${f.observation}`).join('\n')}

ANOMALIES DETECTED:
${report.anomalies?.map((a) => `- [${a.severity}] ${a.feature}: ${a.description}`).join('\n')}

STRATEGIC RECOMMENDATIONS:
${report.strategic_recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Executive intelligence report copied to clipboard!');
  };

  const getImpactBadge = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return <Badge variant="danger">High Impact</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium Impact</Badge>;
      default:
        return <Badge variant="success">Low Impact</Badge>;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical Anomaly</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Warning Outlier</Badge>;
      default:
        return <Badge variant="primary">Telemetry Info</Badge>;
    }
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Executive Intelligence Synthesis</h3>
          <p className="text-xs text-slate-400">
            Engineered via <span className="text-brand-400 font-medium">{report.model_version || 'Google Gemini 1.5 Pro'}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="primary">
            Confidence: {(report.confidence_score * 100).toFixed(0)}%
          </Badge>
          <Button size="sm" variant="secondary" onClick={handleCopyReport}>
            📄 Export Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400">Executive Summary</h4>
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
          {report.executive_summary}
        </div>
      </div>

      {/* Key Findings */}
      {report.key_findings?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Analytical Findings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.key_findings.map((finding, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{finding.title}</span>
                  {getImpactBadge(finding.impact_level)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{finding.observation}</p>
                {finding.metric_reference && (
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Dim: {finding.metric_reference}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies Detected */}
      {report.anomalies?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Anomalies & Variance Outliers</h4>
          <div className="space-y-2">
            {report.anomalies.map((anomaly, idx) => (
              <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-slate-200">{anomaly.feature}</span>
                  <p className="text-xs text-slate-400">{anomaly.description}</p>
                </div>
                {getSeverityBadge(anomaly.severity)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Recommendations */}
      {report.strategic_recommendations?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Strategic Recommendations</h4>
          <ul className="space-y-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            {report.strategic_recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Visualizations */}
      {report.suggested_visualizations?.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Suggested Telemetry Visualizations</h4>
          <div className="flex flex-wrap gap-2">
            {report.suggested_visualizations.map((vis, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono">
                📈 {vis}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
