import React from "react";
import { t } from "../api/translation";

const LoadingSpinner = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-center w-full bg-transparent">
      <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-slate-400 font-bold">{message || t("loading") || "Đang tải..."}</span>
    </div>
  );
};

export default LoadingSpinner;
