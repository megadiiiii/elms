import React from "react";
import { t } from "../../../api/translation";

const ClassSearchFilter = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
  coursesList = [],
  onSearch,
  onAddClick,
  isAdmin,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Search input */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <input
            type="text"
            placeholder={t("searchClassPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
        </div>

        {/* Status select */}
        <div className="relative group min-w-[150px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-9 pr-8 py-2.5 outline-none focus:bg-white text-slate-700 font-bold transition-all cursor-pointer appearance-none"
          >
            <option value="ALL">{t("allStatus")}</option>
            <option value="UPCOMING">{t("upcoming")}</option>
            <option value="ONGOING">{t("ongoing")}</option>
            <option value="FINISHED">{t("finished")}</option>
            <option value="CANCELLED">{t("cancelled")}</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none text-lg">
            arrow_drop_down
          </span>
        </div>

        {/* Course select */}
        <div className="relative group min-w-[180px] max-w-[240px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
          </div>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-9 pr-8 py-2.5 outline-none focus:bg-white text-slate-700 font-bold transition-all cursor-pointer appearance-none truncate"
          >
            <option value="">{t("allCourses")}</option>
            {coursesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none text-lg">
            arrow_drop_down
          </span>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
        >
          {t("search")}
        </button>
      </form>

      {/* Add Button */}
      {isAdmin && (
        <button
          onClick={onAddClick}
          className="w-full lg:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl font-black text-xs shadow-md shadow-blue-500/10 hover:shadow-lg hover:from-blue-800 hover:to-blue-900 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          {t("addClass")}
        </button>
      )}
    </div>
  );
};

export default ClassSearchFilter;
