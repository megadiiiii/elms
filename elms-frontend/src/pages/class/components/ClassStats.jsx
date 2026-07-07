import React from "react";
import { t } from "../../../api/translation";

const ClassStats = ({ stats }) => {
  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng số lớp học */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isAdmin ? t("totalClasses") : t("totalClassesAssigned")}
          </p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalClasses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
      </div>

      {/* Sắp khai giảng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("statsUpcoming")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.upcomingClasses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-blue-50 text-blue-600 border-blue-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">calendar_today</span>
        </div>
      </div>

      {/* Đang diễn ra */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("statsOngoing")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.ongoingClasses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">play_circle</span>
        </div>
      </div>

      {/* Đã kết thúc / Hủy */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("statsFinishedCancelled")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {stats.finishedClasses + stats.cancelledClasses}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-slate-50 text-slate-600 border-slate-150 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
        </div>
      </div>
    </div>
  );
};

export default ClassStats;
