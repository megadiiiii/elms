import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { t } from "../../../api/translation";

const ClassTable = ({
  classes,
  loading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  totalElements,
  setCurrentPage,
  pageSize = 5,
  isAdmin,
}) => {
  const [activeMenuClassId, setActiveMenuClassId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuClassId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const navigate = useNavigate();

  const translateDay = (day) => {
    switch (day) {
      case "T2": return t("day2Short");
      case "T3": return t("day3Short");
      case "T4": return t("day4Short");
      case "T5": return t("day5Short");
      case "T6": return t("day6Short");
      case "T7": return t("day7Short");
      case "CN": return t("day8Short");
      default: return day;
    }
  };

  const formatStaffName = (name) => {
    return name === "Chưa phân công" || !name ? t("notAssigned") : name;
  };

  const role = localStorage.getItem("role") || "STUDENT";
  const isStaff = role === "ADMIN" || role === "TEACHER" || role === "TA";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto lg:overflow-visible min-h-[240px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-[0.1em] transition-colors duration-300">
              <th className="p-4 pl-6 text-center w-16">{t("stt")}</th>
              <th className="p-4 w-[10%]">{t("classCode")}</th>
              <th className="p-4 w-[17.5%]">{t("className")}</th>
              <th className="p-4 w-[17.5%]">{t("courseLinked")}</th>
              <th className="p-4 w-[18%]">{t("teacherInCharge")}</th>
              <th className="p-4 text-center w-[7%]">{t("studentsCount")}</th>
              <th className="p-4 text-center w-[15%]">{t("schedule")}</th>
              <th className="p-4 w-[10%]">{t("status")}</th>
              {isStaff && <th className="p-4 pr-6 text-right w-[15%]">{t("actions")}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={isStaff ? 9 : 8} className="p-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : classes.length > 0 ? (
              classes.map((cls, index) => {
                const itemIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr
                    key={cls.id}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors cursor-pointer animate-fade-in"
                    onClick={() => navigate(`/classes/detail/${cls.id}`)}
                  >
                    <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 dark:text-slate-300 w-16">
                      {itemIndex}
                    </td>
                    <td className="p-4 font-mono font-black text-sm text-blue-700">
                      {cls.classCode}
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100 text-sm">
                      <div>{cls.className}</div>
                      {cls.room && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-350 font-bold mt-0.5">
                          <span className="material-symbols-outlined text-xs text-indigo-500">meeting_room</span>
                          <span className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">{cls.room}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-500 text-xs">
                      {cls.courseName}
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div>{t("roleTeacher") === "Teacher" ? "T" : "GV"}: <span className="font-bold text-slate-700 dark:text-slate-300">{formatStaffName(cls.teacherName)}</span></div>
                      <div>{t("roleTa")}: <span className="font-bold text-slate-700 dark:text-slate-300">{formatStaffName(cls.taName)}</span></div>
                    </td>
                    <td className="p-4 text-center font-black text-sm text-slate-650 w-[100px]">
                      {cls.currentStudents}/{cls.maxStudents}
                    </td>
                    <td className="p-4 text-center w-[120px]">
                      {cls.scheduleSummary && cls.scheduleSummary !== "Chưa có lịch" && cls.scheduleSummary !== "Chưa xếp lịch" ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {cls.scheduleSummary
                            .replace(/\s*\([^)]*\)/g, "")
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((day, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 text-[10px] font-black w-6 h-6 rounded-md shadow-sm transition-colors duration-300"
                              >
                                {translateDay(day)}
                              </span>
                            ))
                          }
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold italic">{t("notScheduled")}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge type="class" value={cls.status} />
                    </td>
                    {isStaff && (
                      <td className="p-4 pr-6 text-right w-[120px] relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuClassId(activeMenuClassId === cls.id ? null : cls.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer border-0 bg-transparent inline-flex items-center justify-center animate-fade-in"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>

                        {activeMenuClassId === cls.id && (
                          <div className={`absolute right-[45px] ${index === classes.length - 1 && classes.length > 1 ? "bottom-1.5" : "top-1.5"} w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 text-left animate-fade-in`}>
                            {(role === "ADMIN" || role === "TEACHER" || role === "TA") && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuClassId(null);
                                    navigate(`/classes/attendance/${cls.id}`);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold animate-fade-in"
                                >
                                  <span className="material-symbols-outlined text-base text-emerald-500">fact_check</span>
                                  {t("takeAttendance") || "Điểm danh"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuClassId(null);
                                    navigate(`/classes/grades/${cls.id}`);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <span className="material-symbols-outlined text-base text-indigo-500">grade</span>
                                 Bảng điểm
                                </button>
                              </>
                            )}
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuClassId(null);
                                    onEdit(cls);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <span className="material-symbols-outlined text-base text-blue-500">edit</span>
                                  {t("edit") || "Chỉnh sửa"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuClassId(null);
                                    onDelete(cls.id, cls.className);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <span className="material-symbols-outlined text-base text-rose-500">delete</span>
                                  {t("delete") || "Xóa lớp"}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isStaff ? 9 : 8} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-4xl text-slate-355">groups</span>
                    <p className="text-sm font-bold text-slate-700">{t("noClassesFound")}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("noClassesFoundDesc")}
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
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between transition-colors duration-300">
          <p className="text-xs text-slate-400 dark:text-slate-300 font-bold">
            {t("showingPage")} {currentPage} / {totalPages} ({t("totalUnit")} {totalElements} {t("classesUnit")})
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${currentPage === p
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTable;
