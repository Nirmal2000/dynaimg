'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ToolCanvas() {
  const [renderedTools, setRenderedTools] = useState([]);

  // Listen for tool render events from ChatPanel
  useEffect(() => {
    const handleRenderTool = (event) => {
      const { code, id } = event.detail;
      
      // Create a secure HTML document for the iframe
      const secureHTML = createSecureHTML(code);
      
      const newTool = {
        id,
        html: secureHTML,
        timestamp: Date.now()
      };
      
      setRenderedTools(prev => [...prev, newTool]);
    };

    window.addEventListener('renderTool', handleRenderTool);
    
    return () => {
      window.removeEventListener('renderTool', handleRenderTool);
    };
  }, []);

  // Create a secure HTML document for iframe rendering
  const createSecureHTML = useCallback((code) => {
    // Wrap the code in a complete HTML document with basic styling
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Tool</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #fff;
      color: #333;
      line-height: 1.6;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  }, []);

  // Remove a tool from the canvas
  const removeTool = useCallback((toolId) => {
    setRenderedTools(prev => prev.filter(tool => tool.id !== toolId));
  }, []);

  if (renderedTools.length === 0) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-20 h-20 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-gray-500">Tool Canvas</p>
          <p className="text-gray-600 text-sm mt-2">Rendered tools will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black overflow-y-auto">
      <div className="p-4 space-y-4">
        {renderedTools.map((tool) => (
          <div key={tool.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Tool header */}
            <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 text-sm font-medium">Generated Tool</span>
              </div>
              <button
                onClick={() => removeTool(tool.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Remove tool"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Secure iframe container */}
            <div className="relative">
              <iframe
                srcDoc={tool.html}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-96 border-0"
                title={`Generated Tool ${tool.id}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}