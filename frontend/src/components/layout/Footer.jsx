import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
      InsightForge AI &copy; {new Date().getFullYear()} &mdash; AI-Powered Enterprise Data Intelligence Platform
    </footer>
  );
}
