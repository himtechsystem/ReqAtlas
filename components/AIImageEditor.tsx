
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/gemini';

const AIImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await editImageWithGemini(image, prompt);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred during image editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `edited-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles text-orange-500 mr-4"></i>
          Gemini AI Image Lab
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Harness the power of <span className="text-orange-500 font-bold">Nano Banana (Gemini 2.5 Flash Image)</span> to transform your images with simple text commands.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Upload & Original */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all h-[400px] flex flex-col items-center justify-center ${
              image ? 'border-orange-500/50 bg-[#111]' : 'border-gray-700 bg-[#111] hover:border-orange-500/50'
            }`}
          >
            {image ? (
              <img src={image} className="w-full h-full object-contain" alt="Original" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-image text-gray-500 text-2xl group-hover:text-orange-500"></i>
                </div>
                <p className="text-gray-300 font-bold mb-1">Click to upload image</p>
                <p className="text-gray-500 text-xs uppercase tracking-widest">Supports PNG, JPG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-gray-200 font-bold mb-4 flex items-center">
              <i className="fa-solid fa-terminal mr-2 text-orange-500"></i>
              Transformation Prompt
            </h3>
            <div className="relative">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., "Add a cyberpunk neon sunset filter", "Remove the background", "Make it look like an oil painting"'
                className="w-full h-32 bg-[#090909] border border-gray-800 rounded-lg p-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none placeholder-gray-600 transition-all"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                 <button 
                  disabled={!image || !prompt || loading}
                  onClick={handleEdit}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all active:scale-95 flex items-center"
                >
                  {loading ? (
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  ) : (
                    <i className="fa-solid fa-bolt mr-2"></i>
                  )}
                  {loading ? 'Processing...' : 'Generate'}
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {['Retro 80s', 'Cyberpunk', 'Black & White', 'Vintage Film', 'Oil Painting', 'Remove BG'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setPrompt(tag)}
                  className="text-[10px] px-2 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Result */}
        <div className="space-y-6">
          <div className="relative border-2 border-[#2a2a2a] bg-[#090909] rounded-xl overflow-hidden h-[400px] flex flex-col items-center justify-center shadow-2xl">
            {editedImage ? (
              <img src={editedImage} className="w-full h-full object-contain" alt="AI Edited" />
            ) : loading ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                     <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                     <i className="fa-solid fa-wand-magic-sparkles absolute inset-0 m-auto h-fit w-fit text-orange-500 animate-pulse"></i>
                  </div>
                </div>
                <div className="animate-pulse space-y-2">
                  <p className="text-orange-500 font-bold tracking-widest text-xs uppercase">Gemini is Thinking</p>
                  <p className="text-gray-500 text-[10px]">Processing pixels & latent space...</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 opacity-30">
                <i className="fa-solid fa-sparkles text-6xl mb-4 text-gray-700"></i>
                <p className="text-gray-500 font-medium italic">Your creation will appear here</p>
              </div>
            )}
            
            {editedImage && !loading && (
               <div className="absolute top-4 right-4">
                 <button 
                   onClick={handleDownload}
                   className="bg-gray-900/80 backdrop-blur-md hover:bg-orange-600 text-white p-2 rounded-lg transition-all shadow-xl border border-white/10"
                   title="Download"
                 >
                   <i className="fa-solid fa-download"></i>
                 </button>
               </div>
            )}
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-xl h-full">
            <h3 className="text-gray-200 font-bold mb-4 flex items-center">
              <i className="fa-solid fa-circle-info mr-2 text-orange-500"></i>
              Model Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 uppercase">Model</span>
                <span className="text-gray-300 font-mono">gemini-2.5-flash-image</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 uppercase">Task</span>
                <span className="text-gray-300">Image Transformation</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500 uppercase">Context</span>
                <span className="text-gray-300">Multimodal Input (Image + Text)</span>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-start">
                <i className="fa-solid fa-triangle-exclamation mt-1 mr-3"></i>
                <p>{error}</p>
              </div>
            )}

            {!error && !loading && editedImage && (
              <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-xs flex items-start">
                <i className="fa-solid fa-check-circle mt-1 mr-3"></i>
                <p>Generation successful! Use the download icon to save your transformation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageEditor;
