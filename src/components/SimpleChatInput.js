'use client';

import { useState, useCallback } from 'react';

export default function SimpleChatInput() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Extract code blocks from message content
  const extractCodeBlocks = (content) => {
    const codeBlockRegex = /```(?:html|javascript|js|css)?\n?([\s\S]*?)```/g;
    const blocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        code: match[1].trim(),
        fullMatch: match[0]
      });
    }
    
    return blocks;
  };

  // Find largest code block by character count
  const findLargestCodeBlock = (codeBlocks) => {
    if (codeBlocks.length === 0) return null;
    
    return codeBlocks.reduce((largest, current) => 
      current.code.length > largest.code.length ? current : largest
    );
  };

  // Auto-render the largest code block
  const autoRenderLargestBlock = (content) => {
    const codeBlocks = extractCodeBlocks(content);
    const largestBlock = findLargestCodeBlock(codeBlocks);
    
    if (largestBlock) {
      const toolId = `auto-${Date.now()}`;
      
      // Dispatch custom event to ToolCanvas
      window.dispatchEvent(new CustomEvent('renderTool', {
        detail: { code: largestBlock.code, id: toolId }
      }));
    }
  };

  // Handle chat message submission
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage = { 
        role: 'assistant', 
        content: data.content 
      };
      
      // Update messages in memory (hidden from UI)
      setMessages([...updatedMessages, assistantMessage]);
      
      // Auto-render largest code block
      autoRenderLargestBlock(data.content);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="h-full flex flex-col bg-gray-800 border-t border-gray-700">
      {/* Simple Chat Input - No History Display */}
      <div className="p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for a tool or code example..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Send</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}