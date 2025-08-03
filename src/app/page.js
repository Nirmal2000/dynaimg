'use client';

import { useState, useRef, useEffect } from 'react';
import ImagePanel from '../components/ImagePanel';
import SimpleChatInput from '../components/SimpleChatInput';
import TextAreaPanel from '../components/TextAreaPanel';
import ToolCanvas from '../components/ToolCanvas';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const imageEditorRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Check if file is a valid image
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    // Clear any previous errors
    setError(null);

    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Set up postMessage bridge for TUI API commands
  useEffect(() => {
    const handleMessage = (event) => {
      // Only handle messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      const { type, payload } = event.data;
      if (!imageEditorRef.current || !type) return;

      try {
        switch (type) {
          case 'applyFilter':
            if (payload?.filterType && typeof payload.apply !== 'undefined') {
              const { apply, filterType, options = {} } = payload;
              
              // Map filter names to TUI internal types
              const filterNameMap = {
                'brightness': 'brightness',
                'blur': 'blur', 
                'noise': 'noise',
                'pixelate': 'pixelate',
                'removeColor': 'removeColor',
                'blendColor': 'blendColor',
                'grayscale': 'grayscale',
                'invert': 'invert',
                'sepia': 'sepia',
                'vintage': 'vintage',
                'sharpen': 'sharpen',
                'emboss': 'emboss'
              };
              
              const tuiFilterType = filterNameMap[filterType] || filterType;
              
              if (apply) {
                imageEditorRef.current.applyFilter(tuiFilterType, options);
              } else {
                imageEditorRef.current.removeFilter(tuiFilterType);
              }
            }
            break;
          case 'resize':
            if (payload?.width && payload?.height) {
              imageEditorRef.current.resize({ width: payload.width, height: payload.height });
            }
            break;
          case 'rotate':
            if (typeof payload?.angle !== 'undefined') {
              imageEditorRef.current.rotate(payload.angle);
            }
            break;
          case 'flip':
            if (payload?.flipType) {
              if (payload.flipType === 'flipX') {
                imageEditorRef.current.flipX();
              } else if (payload.flipType === 'flipY') {
                imageEditorRef.current.flipY();
              }
            }
            break;
          case 'crop':
            if (payload?.rect) {
              imageEditorRef.current.crop(payload.rect);
            }
            break;
          default:
            console.warn('Unknown TUI API command:', type);
        }
      } catch (error) {
        console.error('Error executing TUI API command:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleEditorRef = (editor) => {
    imageEditorRef.current = editor;
  };




  return (
    <div className="h-screen w-screen bg-black text-white flex">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Left Column - Split into two panels */}
      <div className="w-1/2 h-full flex flex-col">
        {/* Top Left Panel - Image Area (60%) */}
        <div className="h-3/5 bg-gray-900 border-r border-b border-gray-700 flex items-center justify-center p-4">
          <ImagePanel 
            selectedImage={selectedImage}
            onUploadClick={handleUploadClick}
            error={error}
            onEditorRef={handleEditorRef}
          />
        </div>
        
        {/* Bottom Left Panel - TextArea Panel (40%) */}
        <div className="h-2/5 bg-gray-800 border-r border-gray-700">
          <TextAreaPanel imageEditorRef={imageEditorRef} />
        </div>
      </div>
      
      {/* Right Column - Split into two panels */}
      <div className="w-1/2 h-full flex flex-col">
        {/* Top Right Panel - Tool Canvas (70%) */}
        <div className="h-3/4 bg-black">
          <ToolCanvas />
        </div>
        
        {/* Bottom Right Panel - Simple Chat Input (30%) */}
        <div className="h-1/4 bg-gray-800">
          <SimpleChatInput />
        </div>
      </div>
    </div>
  );
}
