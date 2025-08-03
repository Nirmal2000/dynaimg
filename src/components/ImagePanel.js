'use client';
import { useEffect, useRef, useCallback } from 'react';

export default function ImagePanel({ selectedImage, onUploadClick, error, onEditorRef }) {
  const editorContainerRef = useRef(null);
  const imageEditorRef = useRef(null);

  const initializeEditor = useCallback(async () => {
    if (selectedImage && editorContainerRef.current && window.tui) {
      // Clean up existing editor
      if (imageEditorRef.current) {
        imageEditorRef.current.destroy();
      }

      // Initialize TUI Image Editor using global tui object
      imageEditorRef.current = new window.tui.ImageEditor(editorContainerRef.current, {
        cssMaxWidth: 400,
        cssMaxHeight: 300,
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70
        }
      });

      // Load the image
      imageEditorRef.current.loadImageFromURL(selectedImage, 'UserImage');

      // Pass the editor reference to parent
      if (onEditorRef) {
        onEditorRef(imageEditorRef.current);
      }
    }
  }, [selectedImage, onEditorRef]);

  useEffect(() => {
    initializeEditor();

    return () => {
      if (imageEditorRef.current) {
        imageEditorRef.current.destroy();
        imageEditorRef.current = null;
      }
    };
  }, [initializeEditor]);

  if (selectedImage) {
    return (
      <div className="w-full h-full relative">
        <div
          ref={editorContainerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
        <button
          onClick={onUploadClick}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm hover:bg-opacity-70 transition-all z-10"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <button
          onClick={onUploadClick}
          className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors mb-4"
        >
          Upload Image
        </button>
        <p className="text-gray-400 text-sm">Select JPEG, PNG, or WEBP files</p>
        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}