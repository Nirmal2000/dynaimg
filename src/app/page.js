'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ImagePanel from '../components/ImagePanel';
import TextAreaPanel from '../components/TextAreaPanel';
import ToolCanvas from '../components/ToolCanvas';
import SimpleChatInput from '../components/SimpleChatInput';
import { ToolProvider } from '../contexts/ToolContext';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const imageEditorRef = useRef(null);
  const [editImageFunction, setEditImageFunction] = useState(null);
  const [downloadFunction, setDownloadFunction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      console.log('Message received:', event.origin, event.data);
      
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

  const handleEditorRef = useCallback((editor) => {
    imageEditorRef.current = editor;
  }, []);

  const onEditImageCallback = useCallback((func) => {
    setEditImageFunction(() => func);
  }, []);

  const onDownloadCallback = useCallback((func) => {
    setDownloadFunction(() => func);
  }, []);




  return (
    <ToolProvider>
      <div className="h-screen bg-[#3b3b3b] p-[2.5vw] flex gap-[1.25vw]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Main Image Area - Left Column */}
      <div className="flex-1 flex flex-col">
        {/* Image Container */}
        <div className="mb-[1.25vw]">
          <ImagePanel 
            selectedImage={selectedImage}
            onUploadClick={handleUploadClick}
            error={error}
            onEditorRef={handleEditorRef}
          />
        </div>

        {/* Description Area */}
        <div className="mb-[4vw]">
          <TextAreaPanel 
            imageEditorRef={imageEditorRef}
            onEditImage={onEditImageCallback}
            onDownload={onDownloadCallback}
            onProcessingChange={setIsProcessing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-[1.25vw] justify-center">
          <div 
            className="w-[16.6vw] h-[7.9vh] border-[8px] border-[#454545] rounded-[39px] flex items-center justify-center cursor-pointer hover:bg-[#424242] transition-colors"
            style={{
              background: "rgba(61, 61, 61, 0.01)",
              boxShadow: "0px -3px 10px 3px rgba(0, 0, 0, 0.07), inset 0px -7px 10px 3px rgba(0, 0, 0, 0.15)",
            }}
            onClick={() => editImageFunction && !isProcessing && editImageFunction()}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#aeaeae]"></div>
                <span className="text-[#aeaeae] font-medium text-lg" style={{ fontFamily: "var(--font-manrope)" }}>Processing...</span>
              </div>
            ) : (
              <span className="text-[#aeaeae] font-medium text-lg" style={{ fontFamily: "var(--font-manrope)" }}>Edit Image</span>
            )}
          </div>
          <div 
            className="w-[16.6vw] h-[7.9vh] border-[8px] border-[#454545] rounded-[39px] flex items-center justify-center cursor-pointer hover:bg-[#424242] transition-colors"
            style={{
              background: "rgba(61, 61, 61, 0.01)",
              boxShadow: "0px -3px 10px 3px rgba(0, 0, 0, 0.07), inset 0px -7px 10px 3px rgba(0, 0, 0, 0.15)",
            }}
            onClick={() => downloadFunction && downloadFunction()}
          >
            <span className="text-[#aeaeae] font-medium text-lg" style={{ fontFamily: "var(--font-manrope)" }}>Download</span>
          </div>
        </div>
      </div>

      {/* Right Column - ToolBox Panel */}
      <div 
        className="h-[88.1vh] border-[10px] border-[#454545] rounded-[71px] pt-[2.1vw] px-[4.75vw] pb-[2.05vw] flex flex-col w-[32vw]"
        style={{
          background: "rgba(255, 255, 255, 0.01)",
          boxShadow: "0px -5px 14.8px 5px rgba(0, 0, 0, 0.08), inset 0px -5px 15.5px 9px rgba(0, 0, 0, 0.09)",
        }}
      >
        <div className="flex-1">
          {/* ToolBox Header */}
          <div className="mb-[1.25vw]">
            <h2
              className="text-[#aeaeae] text-lg font-medium mb-[0.625vw]"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              ToolBox
            </h2>
            <div className="w-full h-px bg-[#515050] mb-[0.625vw] mt-[33px]"></div>
          </div>

          {/* Tool Canvas */}
          <div className="flex-1">
            <ToolCanvas />
          </div>
        </div>

        {/* Bottom Chat Input */}
        <div
          className="rounded-[41.5px] px-[1.25vw] py-3 flex items-center justify-between mx-[-40px] w-[118%]"
          style={{
            background: "rgba(28, 28, 28, 0.31)",
            boxShadow: "inset 0px 8px 8.4px 1px rgba(0, 0, 0, 0.06)",
            minHeight: "7.7%",
          }}
        >
          <SimpleChatInput />
        </div>
      </div>
      </div>
    </ToolProvider>
  );
}
