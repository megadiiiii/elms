import React from "react";
import StatusBadge from "../../../components/StatusBadge";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { t } from "../../../api/translation";

const StaffTable = ({
  staffList,
  loading,
  onEdit,
  onViewDetail,
  onResetPassword,
  onToggleStatus,
  currentPage,
  totalPages,
  totalElements,
  setCurrentPage,
  pageSize = 5,
}) => {
  const getAvatarSource = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    return `/uploads/avatars/${avatar}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-[0.1em] transition-colors duration-300">
              <th className="p-4 pl-6 text-center w-16">{t("stt")}</th>
              <th className="p-4">{t("staffs")}</th>
              <th className="p-4">{t("contact")}</th>
              <th className="p-4">{t("role")}</th>
              <th className="p-4">{t("status")}</th>
              <th className="p-4 pr-6 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : staffList.length > 0 ? (
              staffList.map((staff, index) => {
                const itemIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr 
                    key={staff.id} 
                    onClick={() => onViewDetail(staff.id)}
                    className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 dark:text-slate-300 w-16">
                      {itemIndex}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getAvatarSource(staff.avatar)}
                          alt={staff.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{staff.fullName}</p>
                          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-300 font-bold tracking-tight mt-0.5 uppercase">
                            {staff.staffCode || t("noCodeAssigned")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-0.5">
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{staff.email}</p>
                        <p className="text-slate-400 dark:text-slate-350 font-semibold">{staff.username}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge type="role" value={staff.roleName} />
                    </td>
                    <td className="p-4">
                      <StatusBadge type="user" value={staff.userStatus} />
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(staff.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                          title={t("edit")}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetPassword(staff.id, staff.fullName);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
                          title={t("resetPassword")}
                        >
                          <span className="material-symbols-outlined text-lg">lock_reset</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(staff.id, staff.fullName, staff.userStatus);
                          }}
                          className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center ${
                            staff.userStatus === "ACTIVE"
                              ? "text-slate-500 hover:text-rose-600"
                              : "text-slate-500 hover:text-emerald-600"
                          }`}
                          title={staff.userStatus === "ACTIVE" ? t("lockAccount") : t("unlockAccount")}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {staff.userStatus === "ACTIVE" ? "lock" : "lock_open"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-16 text-center">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <span className="material-symbols-outlined text-4xl text-slate-350">person_off</span>
                    <p className="text-sm font-bold text-slate-700">{t("noStaffFound")}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("noStaffFoundDesc")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages >= 1 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between transition-colors duration-300">
          <p className="text-xs text-slate-400 dark:text-slate-300 font-bold">
            {t("showingPage")} {currentPage} / {totalPages} ({t("totalUnit")} {totalElements} {t("staffsUnit")})
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
                className={`px-3 py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                  currentPage === p
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

export default StaffTable;
