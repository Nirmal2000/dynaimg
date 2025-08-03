'use client';

import { useToolContext } from '../contexts/ToolContext';

export default function ToolCanvas() {
  const { renderedTools, removeTool } = useToolContext();

  if (renderedTools.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-[#515050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-[#aeaeae] text-sm" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
            Generate tools to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="space-y-[1.25vw]">
        {renderedTools.map((tool) => (
          <div key={tool.id} className="relative">
            
            {/* Render tool HTML directly */}
            <div 
              dangerouslySetInnerHTML={{ __html: tool.processedHtml }}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}