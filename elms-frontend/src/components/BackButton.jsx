import React from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../api/translation";

const BackButton = ({ to, text }) => {
  const navigate = useNavigate();
  return (
    <div className="border-b border-slate-100 px-8 py-2 flex items-center justify-end bg-white w-full">
      <button
        type="button"
        onClick={() => (to ? navigate(to) : navigate(-1))}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        {text || t("back") || "Quay lại"}
      </button>
    </div>
  );
};

export default BackButton;
