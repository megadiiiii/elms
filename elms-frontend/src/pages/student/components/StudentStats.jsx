import React from "react";
import { t } from "../../../api/translation";

const StudentStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Tổng học viên */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("totalStudents")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalStudents}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-slate-50 text-slate-600 border-slate-150 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
      </div>

      {/* Đang hoạt động */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("active")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.activeStudents}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
        </div>
      </div>

      {/* Bị khóa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("inactive")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.inactiveStudents}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-rose-50 text-rose-600 border-rose-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">block</span>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
