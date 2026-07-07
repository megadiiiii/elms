import React from "react";
import { t } from "../../../api/translation";

const CourseStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng số khóa học */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("totalCourses")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.totalCourses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">menu_book</span>
        </div>
      </div>

      {/* Đang giảng dạy */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("activeCourse")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.activeCourses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">play_circle</span>
        </div>
      </div>

      {/* Ngừng giảng dạy */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("inactiveCourse")}</p>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">{stats.inactiveCourses}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-slate-50 text-slate-600 border-slate-150 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">pause_circle</span>
        </div>
      </div>

      {/* Lớp học liên kết (Standby card) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-200">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("linkedClasses")}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-lg">{t("comingSoon")}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center border bg-amber-50 text-amber-600 border-amber-100 group-hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-2xl">groups</span>
        </div>
      </div>
    </div>
  );
};

export default CourseStats;
