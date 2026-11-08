import React from 'react';
import Card from '../common/Card';

/**
 * KPI metric card styled after Power BI tiles.
 * Shows a title, prominent value, optional change indicator and subtitle.
 */
export default function KpiMetricCard({ title, value, change, isPositive, subtitle }) {
  return (
    <Card className="flex flex-col justify-between h-full" title={title} subtitle={subtitle}>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-100 mt-2 leading-snug">{value}</p>
      </div>
      {change && (
        <div className="flex items-center space-x-2 mt-4 text-sm">
          <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
        </div>
      )}
    </Card>
  );
}
