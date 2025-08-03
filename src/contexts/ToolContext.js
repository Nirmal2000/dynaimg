'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToolContext = createContext();

export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
};

export const ToolProvider = ({ children }) => {
  const [renderedTools, setRenderedTools] = useState([]);
  const [executedScripts, setExecutedScripts] = useState(new Set());

  // Add a new tool to the canvas
  const addTool = useCallback((code, id = `tool-${Date.now()}`) => {
    // Process HTML to extract just the body content and style for seamless integration
    const processedHtml = processToolHtml(code, id);
    
    const newTool = {
      id,
      processedHtml,
      timestamp: Date.now()
    };
    
    setRenderedTools(prev => [newTool, ...prev]);
    return id;
  }, []);

  // Remove a tool from the canvas
  const removeTool = useCallback((toolId) => {
    setRenderedTools(prev => prev.filter(tool => tool.id !== toolId));
  }, []);

  // Clear all tools
  const clearTools = useCallback(() => {
    setRenderedTools([]);
    setExecutedScripts(new Set()); // Clear script tracking when clearing tools
  }, []);

  // Process HTML code to extract and adapt content for seamless integration
  const processToolHtml = useCallback((code, toolId) => {
    // Extract JavaScript and scope it to this specific tool
    const scriptMatches = code.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    let jsCode = '';
    
    if (scriptMatches) {
      jsCode = scriptMatches.map(script => {
        const match = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        return match ? match[1] : '';
      }).join('\n');
    }

    // Remove script tags from HTML
    const htmlWithoutScripts = code.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // If it's a complete HTML document, extract body content and style
    if (htmlWithoutScripts.includes('<html') || htmlWithoutScripts.includes('<!DOCTYPE')) {
      // Parse the complete HTML document
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlWithoutScripts, 'text/html');
      
      // Extract styles from head
      const styles = Array.from(doc.querySelectorAll('style'))
        .map(style => style.innerHTML)
        .join('\n');
      
      // Extract body content
      const bodyContent = doc.body.innerHTML;
      
      // Execute JavaScript only once per tool, after DOM is ready
      if (jsCode && !executedScripts.has(toolId)) {
        setExecutedScripts(prev => new Set([...prev, toolId]));
        setTimeout(() => {
          try {
            // Wrap in IIFE to create scope isolation
            const wrappedCode = `(function() { ${jsCode} })();`;
            eval(wrappedCode);
          } catch (error) {
            console.error(`Error executing tool script for ${toolId}:`, error);
          }
        }, 100);
      }
      
      // Combine with integrated styling
      return `
        <style>
          ${styles}
          /* Override body styles for seamless integration */
          * {
            box-sizing: border-box;
          }
        </style>
        ${bodyContent}
      `;
    } else {
      // Execute JavaScript only once per tool, after DOM is ready
      if (jsCode && !executedScripts.has(toolId)) {
        setExecutedScripts(prev => new Set([...prev, toolId]));
        setTimeout(() => {
          try {
            // Wrap in IIFE to create scope isolation
            const wrappedCode = `(function() { ${jsCode} })();`;
            eval(wrappedCode);
          } catch (error) {
            console.error(`Error executing tool script for ${toolId}:`, error);
          }
        }, 100);
      }
      
      // If it's just body content, wrap it with basic styling
      return `
        <style>
          * {
            box-sizing: border-box;
          }
        </style>
        ${htmlWithoutScripts}
      `;
    }
  }, [executedScripts, setExecutedScripts]);

  const value = {
    renderedTools,
    addTool,
    removeTool,
    clearTools
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};