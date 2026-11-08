import React from 'react';

/**
 * Power BI style card – clean background, subtle border and enhanced shadow.
 * Accepts optional `title`, `subtitle` and `headerAction`.
 */
export default function Card({ children, className = '', title, subtitle, headerAction }) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 lg:p-8 ${className}`}> {
      (title || headerAction) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-700">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
