import React, { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import Modal from "../../components/Modal";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import { t } from "../../api/translation";
import Error403Page from "../Error403Page";
import { useClassDetail } from "./hooks/useClassDetail";

const ClassDetailPage = () => {
  const userRole = localStorage.getItem("role") || "STUDENT";
  if (userRole === "STUDENT") {
    return <Error403Page />;
  }

  const {
    id,
    detail,
    loading,
    isAdmin,
    role,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    searchingStudents,
    showDropdown,
    setShowDropdown,
    confirmEnroll,
    setConfirmEnroll,
    confirmUnenroll,
    setConfirmUnenroll,
    confirmTransfer,
    setConfirmTransfer,
    classList,
    actionLoading,
    toast,
    handleCloseToast,
    handleEnrollStudent,
    handleUnenrollStudent,
    handleTransferStudent,
    materials,
    loadingMaterials,
    activeTab,
    setActiveTab,
    handleUploadMaterial,
    handleDeleteMaterial,
    navigate
  } = useClassDetail();

  const isStaff = role === "ADMIN" || role === "TEACHER" || role === "TA";

  // State for active dropdown menu (three vertical dots) of a student row
  const [activeMenuStudentId, setActiveMenuStudentId] = useState(null);

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMat, setUploadingMat] = useState(false);

  // States for document preview modal
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const handlePreview = (mat) => {
    const fileUrl = `/uploads/materials/${mat.fileName}`;
    const contentType = mat.contentType || "";
    if (contentType.includes("pdf") || contentType.includes("image")) {
      window.open(fileUrl, "_blank");
    } else {
      setPreviewUrl(fileUrl);
      setPreviewTitle(mat.title);
      setPreviewType("unsupported");
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("enroll-student-autocomplete-container");
      if (container && !container.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowDropdown]);

  // Close row actions menu on click outside
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (activeMenuStudentId && !event.target.closest(`#student-actions-${activeMenuStudentId}`)) {
        setActiveMenuStudentId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, [activeMenuStudentId]);

  if (loading) {
    return (
      <MainLayout title={t("classes")}>
        <LoadingSpinner message={t("systemError")} />
      </MainLayout>
    );
  }

  if (!detail) {
    return (
      <MainLayout title={t("classes")}>
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-6">
          <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 animate-bounce">error</span>
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Không tìm thấy lớp học</h3>
          <p className="text-xs text-slate-400 mt-2">Thông tin lớp học có thể không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate("/classes")}
            className="mt-6 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
          >
            {t("backToList")}
          </button>
        </div>
      </MainLayout>
    );
  }

  const translateDayLong = (dayNum) => {
    switch (dayNum) {
      case 2: return t("day2");
      case 3: return t("day3");
      case 4: return t("day4");
      case 5: return t("day5");
      case 6: return t("day6");
      case 7: return t("day7");
      case 8: return t("day8");
      default: return `Thứ ${dayNum}`;
    }
  };

  return (
    <>
      <MainLayout
        title={t("classDetailTitle")}
        description={t("classDetailDesc").replace("{code}", detail.classCode)}
      >
        <div className="space-y-5 animate-fade-in pb-12">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {t("back")}
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-450 font-bold dark:text-slate-400">Trạng thái:</span>
              <StatusBadge type="class" value={detail.status} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Class Info General (Narrower and shorter) */}
            <div className="col-span-12 lg:col-span-3 space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4">
                <div>
                  <h3 className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.15em] mb-1">
                    {t("generalInfo")}
                  </h3>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                    {detail.className}
                  </h2>
                  <p className="text-[11px] font-mono font-bold text-slate-450 dark:text-slate-400 mt-1">
                    Mã lớp: <span className="text-blue-650 dark:text-blue-400 font-extrabold">{detail.classCode}</span>
                  </p>
                </div>

                <hr className="border-slate-100 dark:border-slate-850" />

                {/* General Info Attributes */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t("courseLinked")}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black truncate max-w-[120px]">{detail.courseName || "--"}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t("startDateLabel")}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">
                      {detail.startDate ? new Date(detail.startDate).toLocaleDateString("vi-VN") : "--"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t("totalSessionsLabel")}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{detail.totalSessions ? `${detail.totalSessions} buổi` : "--"}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t("studentsCount")}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">
                      {detail.currentStudents} / {detail.maxStudents || "--"}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-850" />

                {/* Teacher / TA */}
                <div className="space-y-3.5">
                  <div>
                    <span className="text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider text-[9px] block mb-1">
                      {t("teacherInChargeLabel")}
                    </span>
                    {detail.teacherId ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/detail/${detail.teacherId}`)}
                        className="flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 rounded-xl transition-all cursor-pointer border-0 bg-transparent w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={
                              detail.teacherAvatar
                                ? (detail.teacherAvatar.startsWith("http")
                                    ? detail.teacherAvatar
                                    : `/uploads/avatars/${detail.teacherAvatar}`)
                                : "/default-avatar.png"
                            }
                            className="w-full h-full object-cover"
                            alt="Teacher"
                            onError={(e) => {
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-slate-805 dark:text-slate-100 truncate hover:underline">{detail.teacherName}</p>
                          <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">{detail.teacherCode}</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 p-1.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-105 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          GV
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 italic">{t("notAssigned")}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider text-[9px] block mb-1">
                      {t("taInChargeLabel")}
                    </span>
                    {detail.taId ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/detail/${detail.taId}`)}
                        className="flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 rounded-xl transition-all cursor-pointer border-0 bg-transparent w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={
                              detail.taAvatar
                                ? (detail.taAvatar.startsWith("http")
                                    ? detail.taAvatar
                                    : `/uploads/avatars/${detail.taAvatar}`)
                                : "/default-avatar.png"
                            }
                            className="w-full h-full object-cover"
                            alt="TA"
                            onError={(e) => {
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-slate-805 dark:text-slate-100 truncate hover:underline">{detail.taName}</p>
                          <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-0.5">{detail.taCode}</p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 p-1.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-105 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                          TA
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 italic">{t("notAssigned")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedules & Room */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-3">
                <h3 className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.15em]">
                  {t("scheduleAndRoom")}
                </h3>
                
                {detail.room && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 px-3 py-2 rounded-xl">
                    <span className="material-symbols-outlined text-base text-indigo-500">meeting_room</span>
                    Phòng: <span className="text-indigo-700 dark:text-indigo-400 font-extrabold">{detail.room}</span>
                  </div>
                )}

                <div className="space-y-2 pt-0.5">
                  {detail.schedules && detail.schedules.length > 0 ? (
                    detail.schedules.map((schedule, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-855 pb-1.5 last:border-b-0 last:pb-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          {translateDayLong(schedule.dayOfWeek)}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-55 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-855 text-[10px]">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic font-bold text-center py-2">{t("notScheduled")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Students list (Wider) */}
            <div className="col-span-12 lg:col-span-9 space-y-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm lg:overflow-visible overflow-hidden p-6 space-y-6">
                
                {/* Header of Student List section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                      {t("studentsInClass")}
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
                      {t("studentsInClassDesc")}
                    </p>
                  </div>

                  {/* Actions for Staff */}
                  {isStaff && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Take Attendance */}
                      <button
                        onClick={() => navigate(`/classes/attendance/${detail.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 text-amber-700 rounded-xl transition-all cursor-pointer border border-amber-200/30 dark:border-amber-900/30"
                      >
                        <span className="material-symbols-outlined text-base">co_present</span>
                        Điểm danh
                      </button>

                      {/* View Gradebook */}
                      <button
                        onClick={() => navigate(`/classes/grades/${detail.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 text-indigo-700 rounded-xl transition-all cursor-pointer border border-indigo-200/30 dark:border-indigo-900/30"
                      >
                        <span className="material-symbols-outlined text-base">grade</span>
                        Xem bảng điểm
                      </button>

                      {/* Add Student */}
                      {role === "ADMIN" && detail && detail.status !== "FINISHED" && detail.status !== "CANCELLED" && (
                        <button
                          onClick={() => setConfirmEnroll({ show: true, students: [] })}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 text-blue-700 rounded-xl transition-all cursor-pointer border border-blue-200/30 dark:border-blue-900/30"
                        >
                          <span className="material-symbols-outlined text-base">person_add</span>
                          {t("addStudentToClass")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 -mx-6 px-6">
                  <button
                    onClick={() => setActiveTab("students")}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-0 flex items-center gap-1.5 ${
                      activeTab === "students"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-350"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">groups</span>
                    Học viên trong lớp
                  </button>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className={`ml-6 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer bg-transparent border-0 flex items-center gap-1.5 ${
                      activeTab === "materials"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-350"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">folder_open</span>
                    Tài liệu môn học
                  </button>
                </div>

                {activeTab === "students" && (
                  /* Table of Students */
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm lg:overflow-visible overflow-hidden">
                  <div className="overflow-x-auto lg:overflow-visible min-h-[160px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-350 tracking-[0.15em]">
                          <th className="p-4 pl-6 text-center w-[5%]">{t("stt")}</th>
                          <th className="p-4 w-[15%]">{t("studentCode")}</th>
                          <th className="p-4 w-[25%]">{t("fullName")}</th>
                          <th className="p-4 w-[25%]">Email</th>
                          <th className="p-4 text-center w-[15%]">Trạng thái</th>
                          {role === "ADMIN" && <th className="p-4 pr-6 text-right w-[15%]">{t("actions")}</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {detail.students && detail.students.length > 0 ? (
                          detail.students.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500 w-16">
                                {idx + 1}
                              </td>
                              <td className="p-4 font-mono font-black text-xs text-indigo-700 dark:text-indigo-400">
                                {student.studentCode}
                              </td>
                              <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-150">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/admin/students/detail/${student.id}`)}
                                  className="hover:underline text-left font-bold text-slate-800 dark:text-slate-150 cursor-pointer border-0 bg-transparent p-0 inline-block"
                                >
                                  {student.fullName}
                                </button>
                                {student.studentNickname && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">{student.studentNickname}</div>
                                )}
                              </td>
                              <td className="p-4 text-xs text-slate-550 dark:text-slate-400 font-medium">
                                {student.email}
                              </td>
                              <td className="p-4 text-center">
                                <StatusBadge type="user" value={student.status} />
                              </td>
                              {role === "ADMIN" && (
                                <td className="p-4 pr-6 text-right w-[10%] relative" id={`student-actions-${student.id}`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuStudentId(activeMenuStudentId === student.id ? null : student.id);
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent inline-flex items-center justify-center"
                                  >
                                    <span className="material-symbols-outlined text-lg">more_vert</span>
                                  </button>

                                  {activeMenuStudentId === student.id && (
                                    <div className={`absolute right-[45px] ${idx === detail.students.length - 1 && detail.students.length > 1 ? "bottom-1.5" : "top-1.5"} w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 animate-fade-in text-left`}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuStudentId(null);
                                          setConfirmTransfer({ show: true, student, targetClassId: "" });
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold"
                                      >
                                        <span className="material-symbols-outlined text-base text-indigo-500">swap_horiz</span>
                                        Chuyển lớp
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuStudentId(null);
                                          setConfirmUnenroll({ show: true, student });
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-rose-650 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-0 bg-transparent flex items-center gap-2 cursor-pointer font-bold"
                                      >
                                        <span className="material-symbols-outlined text-base text-rose-500">person_remove</span>
                                        Xóa khỏi lớp
                                      </button>
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isStaff ? 6 : 5} className="p-16 text-center">
                              <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                                <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("noStudentsInClass")}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed">
                                  {t("noStudentsInClassDesc")}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {activeTab === "materials" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Upload Card for Staff */}
                    {isStaff && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150/40 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-205 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-indigo-500 text-lg">upload_file</span>
                          Tải lên tài liệu học tập mới
                        </h4>
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-12 sm:col-span-6 space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tên tài liệu / Tiêu đề</label>
                            <input
                              type="text"
                              placeholder="Nhập tiêu đề hiển thị (Ví dụ: Slide bài 1, Giáo trình...)"
                              value={materialTitle}
                              onChange={(e) => setMaterialTitle(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-805 dark:text-slate-100 font-medium outline-none transition-all"
                            />
                          </div>
                          <div className="col-span-12 sm:col-span-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                id="material-file-input"
                                className="hidden"
                                onChange={(e) => setMaterialFile(e.target.files[0])}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById("material-file-input").click()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 hover:border-indigo-500 transition-colors cursor-pointer bg-white dark:bg-transparent"
                              >
                                <span className="material-symbols-outlined text-base">attach_file</span>
                                <span className="truncate max-w-[150px]">{materialFile ? materialFile.name : "Chọn file tài liệu"}</span>
                              </button>
                            </div>
                          </div>
                          <div className="col-span-12 sm:col-span-2">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!materialFile) {
                                  alert("Vui lòng chọn file trước!");
                                  return;
                                }
                                setUploadingMat(true);
                                const success = await handleUploadMaterial(materialTitle, materialFile);
                                if (success) {
                                  setMaterialTitle("");
                                  setMaterialFile(null);
                                }
                                setUploadingMat(false);
                              }}
                              disabled={uploadingMat || !materialFile}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10 border-0"
                            >
                              {uploadingMat ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Tải lên...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm font-bold">cloud_upload</span>
                                  Tải lên
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Hỗ trợ file PDF, Word, Excel, PowerPoint, ZIP, ảnh... tối đa 15MB.</p>
                      </div>
                    )}

                    {/* Materials Table list */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                      {loadingMaterials ? (
                        <div className="p-16 flex justify-center">
                          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      ) : materials && materials.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-355 tracking-[0.15em]">
                                <th className="p-4 pl-6 text-center w-[5%]">STT</th>
                                <th className="p-4 w-[40%]">Tên tài liệu</th>
                                <th className="p-4 w-[35%]">Tên file vật lý</th>
                                <th className="p-4 text-center w-[10%]">Định dạng</th>
                                <th className="p-4 pr-6 text-right w-[10%]">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                              {materials.map((mat, idx) => {
                                let icon = "draft";
                                const contentType = mat.contentType || "";
                                if (contentType.includes("pdf")) icon = "picture_as_pdf";
                                else if (contentType.includes("word") || contentType.includes("officedocument.word")) icon = "description";
                                else if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("sheet")) icon = "table_chart";
                                else if (contentType.includes("presentation") || contentType.includes("powerpoint")) icon = "slideshow";
                                else if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("compressed")) icon = "inventory_2";
                                else if (contentType.includes("image")) icon = "image";

                                return (
                                  <tr key={mat.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500 w-16">
                                      {idx + 1}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-150">
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500 text-lg">{icon}</span>
                                        <button
                                          type="button"
                                          onClick={() => handlePreview(mat)}
                                          className="hover:underline text-indigo-600 dark:text-indigo-400 font-bold border-0 bg-transparent cursor-pointer p-0 text-left"
                                        >
                                          {mat.title}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-505 dark:text-slate-400 font-mono truncate max-w-[200px]" title={mat.fileName}>
                                      {mat.fileName.includes("_") ? mat.fileName.substring(mat.fileName.indexOf("_") + 1) : mat.fileName}
                                    </td>
                                    <td className="p-4 text-center">
                                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 border border-slate-150/40 dark:border-slate-700">
                                        {(() => {
                                          const type = mat.contentType || "";
                                          if (type.includes("pdf")) return "PDF";
                                          if (type.includes("word") || type.includes("officedocument.word")) return "DOCX";
                                          if (type.includes("spreadsheet") || type.includes("excel") || type.includes("sheet")) return "XLSX";
                                          if (type.includes("presentation") || type.includes("powerpoint")) return "PPTX";
                                          if (type.includes("zip") || type.includes("rar") || type.includes("compressed")) return "ZIP";
                                          if (type.includes("image")) return "IMAGE";
                                          return "FILE";
                                        })()}
                                      </span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handlePreview(mat)}
                                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                          title="Xem trước"
                                        >
                                          <span className="material-symbols-outlined text-base">visibility</span>
                                        </button>
                                        <a
                                          href={`/uploads/materials/${mat.fileName}`}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                          title="Tải xuống"
                                        >
                                          <span className="material-symbols-outlined text-base">download</span>
                                        </a>
                                        {isStaff && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${mat.title}"?`)) {
                                                handleDeleteMaterial(mat.id);
                                              }
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                            title="Xóa tài liệu"
                                          >
                                            <span className="material-symbols-outlined text-base">delete</span>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center max-w-xs mx-auto">
                          <span className="material-symbols-outlined text-4xl text-slate-300">folder_off</span>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Chưa có tài liệu học tập</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {isStaff ? "Hãy là người đầu tiên tải lên tài liệu tham khảo cho lớp học này." : "Hiện chưa có tài liệu nào được tải lên cho lớp học này."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>

      {/* Add Student Modal (Dedicated search modal replacing inline search - Font sizes increased by 1-2px) */}
      {confirmEnroll.show && (
        <Modal
          isOpen={confirmEnroll.show}
          onClose={() => {
            setConfirmEnroll({ show: false, students: [] });
            setSearchQuery("");
            setSearchResults([]);
            setShowDropdown(false);
          }}
          title={t("addStudentToClass")}
          size="lg"
        >
          <div className="space-y-4 pt-2 min-h-[380px] flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              {/* Selected Students tags list */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-450 block text-xs">
                  Danh sách học viên đã chọn ({confirmEnroll.students?.length || 0})
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl min-h-[56px] max-h-[140px] overflow-y-auto">
                  {(!confirmEnroll.students || confirmEnroll.students.length === 0) ? (
                    <span className="text-xs text-slate-400 italic font-medium p-1">Chưa chọn học viên nào...</span>
                  ) : (
                    confirmEnroll.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-1.5 pl-3 pr-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800 animate-scale-up"
                      >
                        <span>{student.fullName} ({student.studentCode})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmEnroll(prev => ({
                              ...prev,
                              students: prev.students.filter(s => s.id !== student.id)
                            }));
                          }}
                          className="hover:text-red-500 font-bold transition-colors cursor-pointer border-0 bg-transparent p-0 flex items-center justify-center text-slate-455 dark:text-slate-400"
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Autocomplete input area inside modal */}
              <div className="space-y-1.5 relative" id="enroll-student-autocomplete-container">
                <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-xs">
                  {t("searchStudentByNameOrCode")}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder={t("selectStudentToEnroll")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-scholarly-primary/10 focus:border-scholarly-primary text-slate-800 dark:text-slate-200 font-medium outline-none transition-all duration-200"
                  />
                </div>

                {showDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 scrollbar-thin animate-fade-in">
                    {searchingStudents ? (
                      <div className="px-4 py-2.5 text-sm text-slate-400 italic flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                        Đang tìm kiếm...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((student) => {
                        const alreadyInClass = detail.students?.some(s => s.id === student.id);
                        const alreadySelected = confirmEnroll.students?.some(s => s.id === student.id);
                        const isDisabled = alreadyInClass || alreadySelected;
                        return (
                          <button
                            key={student.id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setConfirmEnroll(prev => {
                                if (prev.students.some(s => s.id === student.id)) return prev;
                                return { ...prev, students: [...prev.students, student] };
                              });
                              setSearchQuery("");
                              setSearchResults([]);
                              setShowDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors border-0 bg-transparent flex items-center justify-between cursor-pointer ${
                              isDisabled
                                ? "opacity-40 cursor-not-allowed bg-slate-50/50"
                                : "hover:bg-slate-50 dark:hover:bg-slate-750"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-slate-755 dark:text-slate-200 text-sm">{student.fullName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {alreadyInClass && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-black uppercase">Đã trong lớp</span>
                              )}
                              {alreadySelected && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-black uppercase">Đã chọn</span>
                              )}
                              <span className="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black">{student.studentCode}</span>
                            </div>
                          </button>
                        );
                      })
                    ) : searchQuery.trim() !== "" ? (
                      <div className="px-4 py-3 text-center text-sm text-slate-450 italic">
                        Không tìm thấy học viên nào phù hợp
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-slate-450 italic">
                        Nhập tên hoặc mã để tìm kiếm học viên
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setConfirmEnroll({ show: false, students: [] });
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={!confirmEnroll.students || confirmEnroll.students.length === 0 || actionLoading}
                onClick={handleEnrollStudent}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg cursor-pointer flex items-center gap-1.5 border-0"
              >
                {actionLoading && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                {t("confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transfer Student Modal */}
      {confirmTransfer.show && (
        <Modal
          isOpen={confirmTransfer.show}
          onClose={() => setConfirmTransfer({ show: false, student: null, targetClassId: "" })}
          title={t("transferStudentTitle")}
        >
          <div className="space-y-4 pt-2">
            {confirmTransfer.student && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-xl space-y-1">
                <p className="text-xs text-slate-450">{t("transferStudentDesc")}</p>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {confirmTransfer.student.fullName}
                </h4>
                <p className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
                  {t("studentCodeLabel")} {confirmTransfer.student.studentCode}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-450 block mb-1 text-xs">
                {t("selectTargetClass")}
              </label>
              <select
                value={confirmTransfer.targetClassId}
                onChange={(e) => setConfirmTransfer(prev => ({ ...prev, targetClassId: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 font-medium outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-scholarly-primary/10 transition-all cursor-pointer"
              >
                <option value="">{t("selectTargetClassPlaceholder")}</option>
                {classList
                  .filter(cls => cls.id !== parseInt(id))
                  .map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className} ({cls.classCode}) - {cls.courseName || "Không khóa"}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmTransfer({ show: false, student: null, targetClassId: "" })}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-355 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={!confirmTransfer.targetClassId || actionLoading}
                onClick={handleTransferStudent}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg cursor-pointer flex items-center gap-1.5 border-0"
              >
                {actionLoading && <span className="material-symbols-outlined text-xs animate-spin">sync</span>}
                {t("confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Unenroll Modal */}
      <ConfirmModal
        isOpen={confirmUnenroll.show}
        onClose={() => setConfirmUnenroll({ show: false, student: null })}
        onConfirm={handleUnenrollStudent}
        title={t("unenrollConfirmTitle")}
        message={t("unenrollConfirmText").replace("{studentName}", confirmUnenroll.student?.fullName || "")}
        type="danger"
        confirmText={t("delete") || t("confirm")}
        cancelText={t("cancel")}
      />

      {/* Document Preview Modal */}
      {previewUrl && (
        <Modal
          isOpen={!!previewUrl}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewType("");
            setPreviewTitle("");
          }}
          title={`Xem trước: ${previewTitle}`}
          size="xl"
        >
          <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955 rounded-xl overflow-hidden">
            {previewType === "image" && (
              <img src={previewUrl} alt={previewTitle} className="max-w-full max-h-full object-contain p-2" />
            )}
            {previewType === "pdf" && (
              <iframe src={previewUrl} title={previewTitle} className="w-full h-full border-0" />
            )}
            {previewType === "unsupported" && (
              <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                <span className="material-symbols-outlined text-5xl text-slate-400">lock_reset</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Xem trước không khả dụng cho định dạng này</p>
                <p className="text-xs text-slate-450 leading-relaxed">Vui lòng tải tệp này xuống máy tính để xem nội dung chi tiết.</p>
                <a
                  href={previewUrl}
                  download
                  className="mt-2 flex items-center justify-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all border-0 shadow-md shadow-indigo-600/10"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Tải xuống tài liệu
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default ClassDetailPage;
