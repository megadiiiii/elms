import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import axiosClient from "../../api/axiosClient";
import { t } from "../../api/translation";

const AttendancePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classDetail, setClassDetail] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState("");
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // State to toggle editing mode (only for TA)
  const [isEditing, setIsEditing] = useState(false);

  // Get current user role to control edit permission
  const userRole = localStorage.getItem("role"); // ADMIN, TEACHER, TA
  const isTA = userRole === "TA";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  // Fetch Class details & Sessions list
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        const response = await axiosClient.get(`/classes/${classId}/detail`);
        setClassDetail(response.data);
      } catch (err) {
        console.error("Failed to fetch class info:", err);
        showToast(t("attendanceLoadClassError"), "error");
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await axiosClient.get(`/classes/${classId}/sessions`);
        setSessions(response.data);
        if (response.data && response.data.length > 0) {
          // Default to today or next upcoming session
          const todayStr = new Date().toISOString().split("T")[0];
          const closest = response.data.find(s => s.sessionDate >= todayStr) || response.data[0];
          setAttendanceDate(closest.sessionDate);
        } else {
          setAttendanceDate(new Date().toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        showToast(t("attendanceLoadSessionsError"), "error");
        setAttendanceDate(new Date().toISOString().split("T")[0]);
      }
    };

    if (classId) {
      fetchClassInfo();
      fetchSessions();
    }
  }, [classId]);

  // Fetch Student attendance list when Date changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!attendanceDate) return;
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/classes/${classId}/attendance?date=${attendanceDate}`
        );
        // Map null status as is (will default to null/not taken)
        const mappedStudents = response.data.map((s) => ({
          ...s,
          status: s.status || null,
          note: s.note || "",
        }));
        setStudents(mappedStudents);
      } catch (err) {
        console.error("Failed to load attendance list:", err);
        showToast(t("attendanceLoadStudentsError"), "error");
      } finally {
        setLoading(false);
      }
    };
    if (classId && attendanceDate) {
      fetchAttendance();
    }
  }, [classId, attendanceDate]);

  const handleStatusChange = (studentId, status) => {
    if (!isTA) return;
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    );
  };

  const handleNoteChange = (studentId, note) => {
    if (!isTA) return;
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, note } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isTA) return;

    setSaving(true);
    try {
      const payload = {
        date: attendanceDate,
        items: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          note: s.note,
        })),
      };

      await axiosClient.post(`/classes/${classId}/attendance`, payload);
      showToast(t("attendanceSaveSuccess"), "success");
      
      // Turn off edit mode
      setIsEditing(false);

      // Re-fetch attendance list to update database ids
      const response = await axiosClient.get(
        `/classes/${classId}/attendance?date=${attendanceDate}`
      );
      setStudents(response.data.map(s => ({ ...s, status: s.status || null, note: s.note || "" })));
    } catch (err) {
      console.error("Failed to save attendance:", err);
      showToast(t("attendanceSaveError"), "error");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "ABSENT":
        return "bg-rose-50 text-rose-700 border-rose-250 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "LATE":
        return "bg-amber-50 text-amber-700 border-amber-255 hover:bg-amber-100/60 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30";
      case "EXCUSED":
        return "bg-blue-50 text-blue-700 border-blue-250 hover:bg-blue-100/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      default:
        return "bg-slate-55 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PRESENT": return "Có mặt";
      case "ABSENT": return "Vắng mặt";
      case "LATE": return "Đi muộn";
      case "EXCUSED": return "Có phép";
      default: return "Chưa điểm danh";
    }
  };

  const getStatusTextBadgeClass = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30";
      case "ABSENT":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/30";
      case "LATE":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/30";
      case "EXCUSED":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/30";
      default:
        return "bg-slate-50 text-slate-450 dark:bg-slate-900 dark:text-slate-500 border border-slate-200/30";
    }
  };

  // Find the selected session object to show its details
  const selectedSessionIndex = sessions.findIndex(s => s.sessionDate === attendanceDate);

  if (loading && students.length === 0) {
    return (
      <MainLayout title="Điểm danh">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <>
      <MainLayout
        title="Danh sách điểm danh"
        description={classDetail ? `Xem chi tiết điểm danh lớp ${classDetail.className} (${classDetail.classCode})` : ""}
      >
        <div className="space-y-6 animate-fade-in pb-16">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Quay lại
              </button>

              {isTA && isEditing && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/40">
                  Chế độ: Điểm danh
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              {/* Session Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Buổi học:</span>
                <select
                  value={attendanceDate}
                  disabled={isEditing}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold outline-none cursor-pointer focus:bg-white dark:focus:bg-slate-900 transition-all max-w-[280px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sessions && sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <option key={index} value={session.sessionDate}>
                        Buổi {index + 1}: {formatDate(session.sessionDate)} ({formatTime(session.startTime)} - {formatTime(session.endTime)})
                      </option>
                    ))
                  ) : (
                    <option value={attendanceDate}>{formatDate(attendanceDate)}</option>
                  )}
                </select>
              </div>

              {/* Start Editing Button (TA only) */}
              {isTA && !isEditing && students.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">fact_check</span>
                  Điểm danh buổi này
                </button>
              )}
            </div>
          </div>

          {/* Summary / Stats Bar */}
          {!loading && students.length > 0 && (
            <div className="flex flex-wrap items-center justify-start gap-x-5 gap-y-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-black text-slate-500 dark:text-slate-450 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Sĩ số lớp: <span className="text-slate-800 dark:text-slate-100 font-extrabold">{students.length}</span></span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Đi học: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{students.filter(s => s.status === "PRESENT" || s.status === "LATE").length}</span></span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Vắng mặt: <span className="text-rose-600 dark:text-rose-455 font-extrabold">{students.filter(s => s.status === "ABSENT").length}</span></span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Có phép: <span className="text-blue-600 dark:text-blue-455 font-extrabold">{students.filter(s => s.status === "EXCUSED").length}</span></span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
              
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>
                  Tỷ lệ chuyên cần:{' '}
                  <span className={
                    (() => {
                      const total = students.length;
                      const attended = students.filter(s => s.status === "PRESENT" || s.status === "LATE").length;
                      const rate = total > 0 ? (attended / total) * 100 : 0;
                      if (rate >= 80) return "text-emerald-600 dark:text-emerald-400 font-extrabold";
                      if (rate >= 50) return "text-amber-600 dark:text-amber-400 font-extrabold";
                      return "text-rose-600 dark:text-rose-400 font-extrabold";
                    })()
                  }>
                    {(() => {
                      const total = students.length;
                      const attended = students.filter(s => s.status === "PRESENT" || s.status === "LATE").length;
                      return total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0";
                    })()}%
                  </span>
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-16 shadow-sm text-center">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-450 dark:text-slate-350 tracking-[0.1em] transition-colors duration-300">
                        <th className="p-4 pl-6 text-center w-16">{t("stt")}</th>
                        <th className="p-4 w-[20%]">{t("studentCode")}</th>
                        <th className="p-4 w-[30%]">{t("fullName")}</th>
                        <th className="p-4 text-center w-[25%]">{t("attendanceStatusHeader")}</th>
                        <th className="p-4 pr-6 w-[20%]">{t("attendanceNoteHeader")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-855">
                      {students.length > 0 ? (
                        students.map((student, idx) => (
                          <tr key={student.studentId} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 pl-6 text-center text-xs font-bold text-slate-450 dark:text-slate-500 w-16">
                              {idx + 1}
                            </td>
                            <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                              {student.studentCode}
                            </td>
                            <td className="p-4 text-sm font-bold text-slate-850 dark:text-slate-200">
                              {student.fullName}
                            </td>
                            <td className="p-4 text-center">
                              {isEditing && isTA ? (
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {[
                                    { key: "PRESENT", label: t("attendancePresent") },
                                    { key: "ABSENT", label: t("attendanceAbsent") },
                                    { key: "LATE", label: t("attendanceLate") },
                                    { key: "EXCUSED", label: t("attendanceExcused") },
                                  ].map((opt) => {
                                    const isActive = student.status === opt.key;
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => handleStatusChange(student.studentId, opt.key)}
                                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-black tracking-tight transition-all cursor-pointer ${
                                          isActive
                                            ? getStatusColor(opt.key) + " ring-2 ring-indigo-500/10 shadow-sm"
                                            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-450 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                                        }`}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusTextBadgeClass(student.status)}`}>
                                  {getStatusLabel(student.status)}
                                </span>
                              )}
                            </td>
                            <td className="p-4 pr-6">
                              {isEditing && isTA ? (
                                <input
                                  type="text"
                                  placeholder={t("attendanceNotePlaceholder")}
                                  value={student.note}
                                  onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                                  className="w-full bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 transition-all"
                                />
                              ) : (
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                  {student.note || "--"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-16 text-center">
                            <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                              <span className="material-symbols-outlined text-4xl text-slate-355">person_off</span>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("attendanceNoStudents")}</p>
                              <p className="text-xs text-slate-400">{t("attendanceNoStudentsDesc")}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-355 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all"
                >
                  {isEditing ? "Hủy bỏ" : "Đóng"}
                </button>
                
                {isEditing && isTA && students.length > 0 && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all border-0"
                  >
                    {saving && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                    {t("attendanceSave")}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </MainLayout>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default AttendancePage;
