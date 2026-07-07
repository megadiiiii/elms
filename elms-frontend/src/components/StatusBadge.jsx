import React from "react";
import { t } from "../api/translation";

const StatusBadge = ({ type, value }) => {
  if (type === "role") {
    switch (value) {
      case "ADMIN":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200 border border-indigo-150 dark:border-indigo-900/60 transition-colors duration-300">
            {t("roleAdmin") || "Quản lý"}
          </span>
        );
      case "TEACHER":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 border border-rose-150 dark:border-rose-900/60 transition-colors duration-300">
            {t("roleTeacher") || "Giảng viên"}
          </span>
        );
      case "TA":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-200 border border-purple-150 dark:border-purple-900/60 transition-colors duration-300">
            {t("roleTa") || "Trợ giảng"}
          </span>
        );
      case "STUDENT":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 border border-blue-150 dark:border-blue-900/60 transition-colors duration-300">
            {t("roleStudent") || "Học viên"}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            {value}
          </span>
        );
    }
  }

  if (type === "class") {
    switch (value) {
      case "UPCOMING":
        return (
          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 border border-blue-150 dark:border-blue-900/60 transition-colors duration-300">
            {t("upcoming") || "Sắp khai giảng"}
          </span>
        );
      case "ONGOING":
        return (
          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 border border-emerald-150 dark:border-emerald-900/60 transition-colors duration-300">
            {t("ongoing") || "Đang học"}
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800/80 text-slate-650 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            {t("finished") || "Đã kết thúc"}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 border border-rose-150 dark:border-rose-900/60 transition-colors duration-300">
            {t("cancelled") || "Đã hủy"}
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-slate-800/80 text-slate-650 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            {value}
          </span>
        );
    }
  }

  if (type === "user" || type === "course") {
    return value === "ACTIVE" ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 border border-emerald-150 dark:border-emerald-900/60 transition-colors duration-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t("active")}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-650 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {t("inactive")}
      </span>
    );
  }

  return null;
};

export default StatusBadge;
