import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

/**
 * Helper function to create canvas and crop the image, then compress as JPEG quality 0.75
 */
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No 2d context"));
        return;
      }

      // Limit avatar output size to 256x256 pixels for optimal web performance
      const targetSize = 256;
      canvas.width = targetSize;
      canvas.height = targetSize;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetSize,
        targetSize
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          // Generate a safe unique name
          const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
          resolve({
            file,
            url: URL.createObjectURL(blob),
          });
        },
        "image/jpeg",
        0.75 // 75% quality compression
      );
    };
    image.onerror = (error) => reject(error);
  });
};

export const ImageCropperModal = ({ isOpen, imageSrc, onCancel, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(file, url);
    } catch (e) {
      console.error("Failed to crop image:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">crop</span>
            Cắt ảnh
          </h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-650 transition-colors border-0 bg-transparent cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Crop Container */}
        <div className="relative w-full h-[320px] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square Crop
            cropShape="rect"
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Slider & Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-150/40 dark:border-slate-800 space-y-5">
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Thu nhỏ</span>
              <span>Phóng to</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 text-base">zoom_out</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-650 dark:accent-indigo-500"
              />
              <span className="material-symbols-outlined text-slate-400 text-base">zoom_in</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer bg-white dark:bg-transparent"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang nén...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                  Chọn ảnh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
