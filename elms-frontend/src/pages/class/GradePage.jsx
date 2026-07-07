import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import axiosClient from "../../api/axiosClient";
import { t } from "../../api/translation";

const GradePage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classDetail, setClassDetail] = useState(null);
  const [gradeType, setGradeType] = useState("REGULAR"); // "REGULAR" or "FINAL"
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sendingMailId, setSendingMailId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Get current user role to control edit permission
  const userRole = localStorage.getItem("role"); // ADMIN, TEACHER, TA
  const isTeacher = userRole === "TEACHER";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Fetch Class details and Student Grade list when classId or gradeType changes
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const classRes = await axiosClient.get(`/classes/${classId}/detail`);
        setClassDetail(classRes.data);

        const gradesRes = await axiosClient.get(`/classes/${classId}/grades?type=${gradeType}`);
        setStudents(gradesRes.data);
      } catch (err) {
        console.error("Failed to load initial grading data:", err);
        showToast("Không thể tải thông tin lớp học hoặc danh sách điểm!", "error");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchInitialData();
    }
  }, [classId, gradeType]);

  const handleGradeChange = (studentId, field, value) => {
    if (!isTeacher) return; // double check permission

    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;

        // Clone student object
        const updated = { ...s };
        
        if (field === "feedback") {
          updated.feedback = value;
        } else {
          // Parse numeric inputs
          let numVal = value === "" ? "" : parseFloat(value);
          if (numVal !== "" && (isNaN(numVal) || numVal < 0)) numVal = 0;
          if (numVal !== "" && numVal > 10) numVal = 10;
          
          updated[field] = numVal;

          // Auto calculate final grade if main skills are modified
          if (["listening", "speaking", "reading", "writing"].includes(field)) {
            const list = field === "listening" ? numVal : (s.listening || 0);
            const speak = field === "speaking" ? numVal : (s.speaking || 0);
            const read = field === "reading" ? numVal : (s.reading || 0);
            const write = field === "writing" ? numVal : (s.writing || 0);
            
            // Round to IELTS standard
            const avg = ((parseFloat(list) || 0) + (parseFloat(speak) || 0) + (parseFloat(read) || 0) + (parseFloat(write) || 0)) / 4.0;
            const floorVal = Math.floor(avg);
            const remainder = avg - floorVal;
            if (remainder < 0.25) {
              updated.finalGrade = floorVal;
            } else if (remainder < 0.75) {
              updated.finalGrade = floorVal + 0.5;
            } else {
              updated.finalGrade = floorVal + 1.0;
            }
          }
        }

        // If this student is currently active in the detail drawer, update it too
        if (selectedStudent && selectedStudent.studentId === studentId) {
          setSelectedStudent(updated);
        }

        return updated;
      })
    );
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    if (!isTeacher) return;

    setSaving(true);
    try {
      const payload = students.map((s) => ({
        studentId: s.studentId,
        listening: s.listening || 0,
        speaking: s.speaking || 0,
        reading: s.reading || 0,
        writing: s.writing || 0,
        finalGrade: s.finalGrade || 0,
        feedback: s.feedback || "",
        gradeType: gradeType
      }));

      await axiosClient.post(`/classes/${classId}/grades?type=${gradeType}`, payload);
      showToast("Lưu bảng điểm thành công!", "success");
      
      // Re-fetch grades to update gradeIds in UI (so email buttons unlock)
      const gradesRes = await axiosClient.get(`/classes/${classId}/grades?type=${gradeType}`);
      setStudents(gradesRes.data);
    } catch (err) {
      console.error("Failed to save grades:", err);
      showToast("Lỗi lưu bảng điểm!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReport = async (studentId) => {
    setSendingMailId(studentId);
    try {
      await axiosClient.post(`/classes/${classId}/grades/${studentId}/send-report?type=${gradeType}`);
      showToast("Gửi email báo điểm thành công!", "success");
      
      // Update isContacted status locally
      setStudents((prev) =>
        prev.map((s) => (s.studentId === studentId ? { ...s, isContacted: true } : s))
      );
      if (selectedStudent && selectedStudent.studentId === studentId) {
        setSelectedStudent(prev => ({ ...prev, isContacted: true }));
      }
    } catch (err) {
      console.error("Failed to send grade report:", err);
      const errMsg = err.response?.data?.message || "Lỗi gửi mail báo điểm!";
      showToast(errMsg, "error");
    } finally {
      setSendingMailId(null);
    }
  };

  // ----------------------------------------------------
  // Statistics Calculations
  // ----------------------------------------------------
  const activeGrades = students.filter(s => s.gradeId !== null);
  const classAvg = activeGrades.length > 0
    ? Math.round((activeGrades.reduce((sum, s) => sum + (s.finalGrade || 0), 0) / activeGrades.length) * 10) / 10
    : 0.0;
  const totalCount = students.length;
  const sentCount = activeGrades.filter(s => s.isContacted).length;
  
  const distExcellent = activeGrades.filter(s => s.finalGrade >= 8.0).length;
  const distGood = activeGrades.filter(s => s.finalGrade >= 6.5 && s.finalGrade < 8.0).length;
  const distAverage = activeGrades.filter(s => s.finalGrade >= 5.0 && s.finalGrade < 6.5).length;
  const distWeak = activeGrades.filter(s => s.finalGrade < 5.0).length;

  // Local filtering by search query
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreBadgeClass = (score) => {
    if (score >= 8.0) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40";
    if (score >= 6.5) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/40";
    if (score >= 5.0) return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40";
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/40";
  };

  if (loading) {
    return (
      <MainLayout title="Bảng điểm">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <MainLayout
        title="Bảng điểm lớp học"
        description={classDetail ? `Xem chi tiết và quản lý kết quả học tập định kỳ lớp ${classDetail.className} (${classDetail.classCode})` : ""}
      >
        <div className="space-y-6 animate-fade-in pb-12">
          {/* Header Controls Bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {t("back") || "Quay lại"}
              </button>
              
              {isTeacher && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/40">
                  Chế độ: Chấm điểm
                </span>
              )}
            </div>
            
            {/* Segmented Control Filter */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-1 max-w-max">
              <button
                type="button"
                onClick={() => setGradeType("REGULAR")}
                className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${
                  gradeType === "REGULAR"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Điểm thường xuyên
              </button>
              <button
                type="button"
                onClick={() => setGradeType("FINAL")}
                className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${
                  gradeType === "FINAL"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Điểm cuối khóa
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative max-w-sm w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Tìm học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-250/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Statistics Section (Simplified & Cleaned) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Average Class Score */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Điểm TB cả lớp (Overall)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{classAvg.toFixed(1)}</span>
                <span className="text-xs font-bold text-slate-450">/ 10.0</span>
              </div>
            </div>

            {/* Reports Sent Rate */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Báo cáo phụ huynh</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{sentCount}</span>
                <span className="text-xs font-bold text-slate-450">/ {totalCount} học viên</span>
              </div>
            </div>

            {/* Distribution Graph Cards */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Phân bố Band điểm Overall</span>
              <div className="flex items-end justify-between h-14 px-2 mt-2">
                {[
                  { label: ">= 8.0", count: distExcellent, color: "bg-emerald-500" },
                  { label: "6.5-7.5", count: distGood, color: "bg-indigo-500" },
                  { label: "5.0-6.0", count: distAverage, color: "bg-amber-500" },
                  { label: "< 5.0", count: distWeak, color: "bg-rose-500" },
                ].map((item, idx) => {
                  const maxCount = Math.max(distExcellent, distGood, distAverage, distWeak, 1);
                  const barHeight = (item.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 w-1/4 group relative cursor-help">
                      <span className="absolute -top-6 text-[9px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count} HS
                      </span>
                      <div className="w-5 bg-slate-50 dark:bg-slate-950 rounded-md h-9 flex items-end overflow-hidden">
                        <div className={`w-full ${item.color} rounded-sm transition-all duration-700`} style={{ height: `${barHeight}%` }}></div>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-tighter mt-1">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form and Main Score Table */}
          <form onSubmit={handleSaveGrades} className="space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-450 dark:text-slate-350 tracking-[0.1em]">
                      <th className="p-4 text-center w-[5%]">STT</th>
                      <th className="p-4 w-[25%]">Học viên</th>
                      <th className="p-4 text-center w-[10%]">Listening</th>
                      <th className="p-4 text-center w-[10%]">Speaking</th>
                      <th className="p-4 text-center w-[10%]">Reading</th>
                      <th className="p-4 text-center w-[10%]">Writing</th>
                      <th className="p-4 text-center w-[12%]">Overall</th>
                      <th className="p-4 w-[13%] text-center">Báo cáo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, idx) => (
                        <tr 
                          key={student.studentId} 
                          onClick={() => setSelectedStudent(student)}
                          className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group"
                        >
                          {/* Index */}
                          <td className="p-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                            {idx + 1}
                          </td>
                          
                          {/* Student Identity Card */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50">
                                <img
                                  src={
                                    student.avatar && student.avatar !== "default-avatar.png"
                                      ? (student.avatar.startsWith("http") ? student.avatar : `/uploads/avatars/${student.avatar}`)
                                      : "/default-avatar.png"
                                  }
                                  className="w-full h-full object-cover"
                                  alt="Student"
                                  onError={(e) => {
                                    e.target.src = "/default-avatar.png";
                                  }}
                                />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                  {student.fullName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                    {student.studentCode}
                                  </span>
                                  {student.studentNickname && (
                                    <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-1 py-0.2 rounded-md">
                                      {student.studentNickname}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Skill Column: Listening */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTeacher ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={student.listening === null ? "" : student.listening}
                                onChange={(e) => handleGradeChange(student.studentId, "listening", e.target.value)}
                                className="w-16 text-center px-1.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-300">
                                {student.listening !== null ? student.listening.toFixed(1) : "--"}
                              </span>
                            )}
                          </td>

                          {/* Skill Column: Speaking */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTeacher ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={student.speaking === null ? "" : student.speaking}
                                onChange={(e) => handleGradeChange(student.studentId, "speaking", e.target.value)}
                                className="w-16 text-center px-1.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-300">
                                {student.speaking !== null ? student.speaking.toFixed(1) : "--"}
                              </span>
                            )}
                          </td>

                          {/* Skill Column: Reading */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTeacher ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={student.reading === null ? "" : student.reading}
                                onChange={(e) => handleGradeChange(student.studentId, "reading", e.target.value)}
                                className="w-16 text-center px-1.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-300">
                                {student.reading !== null ? student.reading.toFixed(1) : "--"}
                              </span>
                            )}
                          </td>

                          {/* Skill Column: Writing */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTeacher ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={student.writing === null ? "" : student.writing}
                                onChange={(e) => handleGradeChange(student.studentId, "writing", e.target.value)}
                                className="w-16 text-center px-1.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none"
                              />
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-750 dark:text-slate-300">
                                {student.writing !== null ? student.writing.toFixed(1) : "--"}
                              </span>
                            )}
                          </td>

                          {/* Overall Band Score (Highlighted with standard colored badge) */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {isTeacher ? (
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={student.finalGrade === null ? "" : student.finalGrade}
                                onChange={(e) => handleGradeChange(student.studentId, "finalGrade", e.target.value)}
                                className="w-16 text-center px-1.5 py-1 text-xs font-extrabold rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 focus:outline-none"
                              />
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${getScoreBadgeClass(student.finalGrade)}`}>
                                {student.finalGrade !== null ? student.finalGrade.toFixed(1) : "--"}
                              </span>
                            )}
                          </td>

                          {/* Action - Report Email Status / Trigger */}
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {student.gradeId ? (
                              <button
                                type="button"
                                disabled={sendingMailId !== null}
                                onClick={() => handleSendReport(student.studentId)}
                                className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase border cursor-pointer transition-all flex items-center justify-center gap-1.2 mx-auto ${
                                  student.isContacted
                                    ? "bg-slate-50 text-slate-655 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                    : "bg-indigo-50 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30 font-black"
                                }`}
                              >
                                {sendingMailId === student.studentId ? (
                                  <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined text-xs">
                                      {student.isContacted ? "mark_email_read" : "send"}
                                    </span>
                                    {student.isContacted ? "Gửi lại" : "Báo điểm"}
                                  </>
                                )}
                              </button>
                            ) : (
                              <span 
                                className="text-[10px] font-bold text-slate-300 dark:text-slate-700 select-none uppercase tracking-wider"
                              >
                                Chờ chấm
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-16 text-center">
                          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Không tìm thấy học viên tương ứng</p>
                            <p className="text-xs text-slate-400">Hãy thử tìm với từ khóa khác.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-end gap-3 pb-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-750 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
              >
                {isTeacher ? "Hủy bỏ" : "Đóng"}
              </button>
              
              {isTeacher && (
                <button
                  type="submit"
                  disabled={saving || students.length === 0}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      Lưu bảng điểm
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </MainLayout>

      {/* Slide-out Drawer Detail for Selected Student */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in-right border-l border-slate-100 dark:border-slate-850"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Chi tiết học tập học viên</h3>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Student Identification Profile Card */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150/40 dark:border-slate-800/40">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 shadow-inner">
                  <img
                    src={
                      selectedStudent.avatar && selectedStudent.avatar !== "default-avatar.png"
                        ? (selectedStudent.avatar.startsWith("http") ? selectedStudent.avatar : `/uploads/avatars/${selectedStudent.avatar}`)
                        : "/default-avatar.png"
                    }
                    className="w-full h-full object-cover"
                    alt="Student"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedStudent.fullName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">{selectedStudent.studentCode}</span>
                    {selectedStudent.studentNickname && (
                      <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-1 py-0.2 rounded-md">
                        {selectedStudent.studentNickname}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skill Bars Analysis Chart */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phân tích kỹ năng IELTS</h4>
                <div className="space-y-3 bg-slate-50/40 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-150/30 dark:border-slate-800/30">
                  {[
                    { key: "listening", name: "Listening (Nghe)", color: "bg-indigo-500" },
                    { key: "speaking", name: "Speaking (Nói)", color: "bg-indigo-500" },
                    { key: "reading", name: "Reading (Đọc)", color: "bg-indigo-500" },
                    { key: "writing", name: "Writing (Viết)", color: "bg-indigo-500" },
                  ].map(skill => {
                    const val = selectedStudent[skill.key] || 0.0;
                    const percentage = Math.min((val / 10) * 100, 100);
                    return (
                      <div key={skill.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-355">
                          <span>{skill.name}</span>
                          <span className="font-mono font-extrabold">{val.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-850">
                          <div className={`h-full rounded-full transition-all duration-700 ${skill.color}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}

                  <hr className="border-slate-150/40 dark:border-slate-855 my-2" />

                  <div className="flex justify-between items-center bg-rose-50/20 dark:bg-rose-950/10 p-2.5 rounded-xl border border-rose-100/30 dark:border-rose-900/10">
                    <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">Điểm Overall (IELTS Standard)</span>
                    <span className="text-base font-extrabold text-rose-700 dark:text-rose-400 font-mono">
                      {selectedStudent.finalGrade !== null ? selectedStudent.finalGrade.toFixed(1) : "--"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Teacher Feedback Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nhận xét của giáo viên</h4>
                {isTeacher ? (
                  <textarea
                    rows={3}
                    placeholder="Nhập nhận xét về tình hình học tập của học viên..."
                    value={selectedStudent.feedback || ""}
                    onChange={(e) => handleGradeChange(selectedStudent.studentId, "feedback", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-350 rounded-xl leading-relaxed border border-slate-150/30 dark:border-slate-800/40 italic">
                    {selectedStudent.feedback || "Không có nhận xét nào từ giáo viên."}
                  </div>
                )}
              </div>

              {/* Email Report Preview Mockup */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Xem trước thư báo điểm (Email Preview)</h4>
                <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs bg-slate-50 text-[10px] scale-95 origin-top">
                  <div className="bg-slate-100 dark:bg-slate-850 p-2 px-3 flex items-center justify-between border-b border-slate-250/60 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-500 font-mono">Xem trước bản gửi phụ huynh</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-250 space-y-2.5 font-sans leading-relaxed">
                    <p className="pb-1 border-b border-slate-100 dark:border-slate-900 text-slate-450">
                      <b>Tiêu đề:</b> [ELMS] {gradeType === "FINAL" ? "BÁO CÁO KẾT QUẢ HỌC TẬP CUỐI KHÓA" : "BÁO CÁO KẾT QUẢ HỌC TẬP THƯỜNG XUYÊN"} - {selectedStudent.fullName.toUpperCase()}
                    </p>
                    <p>Kính gửi quý phụ huynh em <b>{selectedStudent.fullName}</b>,</p>
                    <p>Hệ thống ELMS gửi tới quý phụ huynh bảng điểm học tập chi tiết của học viên:</p>
                    <table className="w-full border-collapse text-[9px] my-2 text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                          <th className="p-1 border border-slate-200 dark:border-slate-800">Kỹ năng</th>
                          <th className="p-1 text-center border border-slate-200 dark:border-slate-800">Điểm</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="p-1 border border-slate-200 dark:border-slate-800">Listening (Nghe)</td><td className="p-1 text-center font-bold border border-slate-200 dark:border-slate-800">{(selectedStudent.listening || 0).toFixed(1)}</td></tr>
                        <tr><td className="p-1 border border-slate-200 dark:border-slate-800">Reading (Đọc)</td><td className="p-1 text-center font-bold border border-slate-200 dark:border-slate-800">{(selectedStudent.reading || 0).toFixed(1)}</td></tr>
                        <tr><td className="p-1 border border-slate-200 dark:border-slate-800">Writing (Viết)</td><td className="p-1 text-center font-bold border border-slate-200 dark:border-slate-800">{(selectedStudent.writing || 0).toFixed(1)}</td></tr>
                        <tr><td className="p-1 border border-slate-200 dark:border-slate-800">Speaking (Nói)</td><td className="p-1 text-center font-bold border border-slate-200 dark:border-slate-800">{(selectedStudent.speaking || 0).toFixed(1)}</td></tr>
                        <tr className="font-extrabold text-rose-600 dark:text-rose-400"><td className="p-1 border border-slate-200 dark:border-slate-800">ĐIỂM TỔNG KẾT</td><td className="p-1 text-center border border-slate-200 dark:border-slate-800">{(selectedStudent.finalGrade || 0).toFixed(1)}</td></tr>
                      </tbody>
                    </table>
                    <div className="bg-amber-50/20 dark:bg-amber-950/10 p-2 rounded border border-amber-100/30 dark:border-amber-900/10">
                      <p className="m-0"><b>Nhận xét:</b> <i>{selectedStudent.feedback || "Chưa có nhận xét"}</i></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-1/2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
              
              {selectedStudent.gradeId ? (
                <button
                  type="button"
                  disabled={sendingMailId !== null}
                  onClick={() => handleSendReport(selectedStudent.studentId)}
                  className="w-1/2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMailId === selectedStudent.studentId ? (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">mail</span>
                      {selectedStudent.isContacted ? "Gửi lại" : "Gửi báo cáo"}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={true}
                  className="w-1/2 px-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-650 border border-slate-200 dark:border-slate-750/50 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                  title="Cần lưu điểm của học viên này trước khi gửi báo cáo"
                >
                  <span className="material-symbols-outlined text-sm">mail</span>
                  Chờ chấm điểm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default GradePage;
