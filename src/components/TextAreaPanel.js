'use client';

import { useState, useCallback } from 'react';

export default function TextAreaPanel({ imageEditorRef }) {
  const [textValue, setTextValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

  // Handle sending text to Fal AI for image editing
  const handleSendText = useCallback(async () => {
    if (!textValue.trim() || isProcessing) return;
    
    // Check if image editor exists and has an image
    if (!imageEditorRef?.current) {
      setStatus('No image editor available');
      return;
    }

    try {
      // Get current image from TUI editor
      const currentImageDataUrl = imageEditorRef.current.toDataURL();
      
      if (!currentImageDataUrl || currentImageDataUrl === 'data:,') {
        setStatus('Please load an image first');
        return;
      }

      setIsProcessing(true);
      setStatus('Processing your request...');

      // Call Fal AI API
      const response = await fetch('/api/fal-edit-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textValue.trim(),
          imageDataUrl: currentImageDataUrl
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Replace image in TUI editor using the same method as ImagePanel
        try {
          console.log('Loading new image into TUI editor...');
          await imageEditorRef.current.loadImageFromURL(data.imageDataUrl, 'EditedImage');
          
          setStatus('Image edited successfully!');
          // setTextValue(''); // Clear the prompt
          
          // Clear success message after 3 seconds
          setTimeout(() => setStatus(''), 3000);
        } catch (loadError) {
          console.error('Error loading new image:', loadError);
          setStatus('Image generated but failed to load - check console for details');
          setTimeout(() => setStatus(''), 5000);
        }
      } else {
        setStatus(`Error: ${data.error}`);
        setTimeout(() => setStatus(''), 5000);
      }

    } catch (error) {
      console.error('Error editing image:', error);
      setStatus('Network error - please try again');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsProcessing(false);
    }
  }, [textValue, imageEditorRef, isProcessing]);

  // Handle downloading the current image from TUI editor
  const handleDownload = useCallback(() => {
    if (!imageEditorRef?.current) {
      console.warn('No image editor available for download');
      return;
    }

    try {
      // Get image data from TUI editor
      const dataURL = imageEditorRef.current.toDataURL();
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `edited-image-${Date.now()}.png`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }, [imageEditorRef]);

  return (
    <div className="h-full flex flex-col bg-gray-900 border-t border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-gray-300 text-sm font-medium">AI Image Editor</h3>
        {status && (
          <p className={`text-xs mt-1 ${
            status.includes('Error') || status.includes('Please') 
              ? 'text-red-400' 
              : status.includes('successfully') 
                ? 'text-green-400'
                : 'text-blue-400'
          }`}>
            {status}
          </p>
        )}
      </div>
      
      {/* Large Textarea */}
      <div className="flex-1 p-4">
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Enter image editing prompt... (e.g., 'Put a donut next to the flour')"
          className="w-full h-full bg-gray-800 text-white px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={isProcessing}
        />
      </div>
      
      {/* Buttons */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={handleSendText}
            disabled={!textValue.trim() || isProcessing}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Edit Image'
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}