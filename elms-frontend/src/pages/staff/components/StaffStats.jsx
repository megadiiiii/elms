import React from "react";
import { t } from "../../../api/translation";

const StaffStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng nhân sự */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("totalStaffs")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalStaffs}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-slate-50 text-slate-600 border-slate-150 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
      </div>

      {/* Quản trị viên */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("admins")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalAdmins}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">shield_person</span>
        </div>
      </div>

      {/* Giảng viên */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("teachers")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalTeachers}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-rose-50 text-rose-600 border-rose-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">school</span>
        </div>
      </div>

      {/* Trợ giảng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("tas")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalTAs}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-purple-50 text-purple-600 border-purple-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">support_agent</span>
        </div>
      </div>
    </div>
  );
};

export default StaffStats;
