import React from "react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  // Nếu trạng thái đóng thì đéo vẽ gì ra màn hình cả
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-[95vw]",
    "2xl": "max-w-[98vw]"
  };

  const maxWidth = sizeClasses[size] || "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Hộp thoại nội dung */}
      <div className={`bg-white w-full ${maxWidth} rounded-2xl shadow-xl p-6 relative z-10 animate-scale-up mx-4 max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Ruột Form động truyền từ ngoài vào */}
        <div className="overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
