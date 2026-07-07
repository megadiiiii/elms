import React from "react";
import { t } from "../../../api/translation";

const StudentSearchFilter = ({
  searchQuery,
  setSearchQuery,
  onSearch,
  onAddClick,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Search input */}
        <div className="relative min-w-[280px] flex-1 sm:flex-initial">
          <input
            type="text"
            placeholder={t("searchStudentPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-xs hover:bg-slate-900 dark:hover:bg-slate-600 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
        >
          {t("search")}
        </button>
      </form>

      {/* Add Button */}
      {localStorage.getItem("role") === "ADMIN" && (
        <button
          onClick={onAddClick}
          className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl font-black text-xs shadow-md shadow-blue-500/10 hover:shadow-lg hover:from-blue-800 hover:to-blue-900 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          {t("addStudentButton")}
        </button>
      )}
    </div>
  );
};

export default StudentSearchFilter;
