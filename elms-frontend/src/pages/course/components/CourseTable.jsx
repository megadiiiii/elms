import React from "react";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { t } from "../../../api/translation";

const CourseTable = ({
  courses,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  onRowClick,
  currentPage,
  totalPages,
  totalElements,
  setCurrentPage,
  pageSize = 5,
  isAdmin,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">
              <th className="w-[5%] p-4 pl-6 text-center">{t("stt")}</th>
              <th className="w-[20%] p-4 ">{t("courseCodeLabel")}</th>
              <th className="w-[20%] p-4">{t("courseNameLabel")}</th>
              <th className="w-[25%] p-4 text-center">{t("numberOfClasses")}</th>
              <th className="w-[15%] p-4 ">{t("status")}</th>
              <th className="w-[15%] p-4 pr-6 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : courses.length > 0 ? (
              courses.map((course, index) => {
                const itemIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr 
                    key={course.id} 
                    onClick={() => onRowClick(course.id, course.courseName)}
                    className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 w-16">
                       {itemIndex}
                    </td>
                    <td className="p-4 font-mono font-black text-sm text-blue-700">
                      {course.courseCode}
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-sm">
                      {course.courseName}
                    </td>
                    <td className="p-4 text-center font-black text-sm text-slate-500 w-[120px]">
                      {course.classCount}
                    </td>
                    <td className="p-4">
                      <StatusBadge type="course" value={course.courseStatus} />
                    </td>
                    <td className="p-4 pr-6 text-right w-[180px]">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(course);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                              title={t("edit")}
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(course.id, course.courseName, course.courseStatus);
                              }}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center ${
                                course.courseStatus === "ACTIVE"
                                  ? "text-slate-500 hover:text-amber-600"
                                  : "text-slate-500 hover:text-emerald-600"
                              }`}
                              title={course.courseStatus === "ACTIVE" ? t("suspend") : t("resume")}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {course.courseStatus === "ACTIVE" ? "pause_circle" : "play_circle"}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(course.id, course.courseName);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                              title={t("delete")}
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium px-2">{t("readOnly")}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-16 text-center">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-4xl text-slate-300">menu_book</span>
                    <p className="text-sm font-bold text-slate-700">{t("noCoursesFound")}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("noCoursesFoundDesc")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && totalPages >= 1 && (
        <div className="bg-slate-50/50 border-t border-slate-150 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold">
            {t("showingPage")} {currentPage} / {totalPages} ({t("totalUnit")} {totalElements} {t("coursesUnit")})
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                  currentPage === p
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTable;
