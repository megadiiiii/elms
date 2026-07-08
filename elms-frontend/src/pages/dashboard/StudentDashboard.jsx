import React, { useState, useEffect } from 'react';
import { t } from '../../api/translation';
import axiosClient from '../../api/axiosClient';

const StudentDashboard = ({ studentData }) => {
    const [activeTab, setActiveTab] = useState("classes"); // "classes" or "grades"
    const [grades, setGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    useEffect(() => {
        if (activeTab === "grades") {
            const fetchGrades = async () => {
                setLoadingGrades(true);
                try {
                    const response = await axiosClient.get("/users/grades");
                    setGrades(response.data || []);
                } catch (err) {
                    console.error("Failed to load grades:", err);
                } finally {
                    setLoadingGrades(false);
                }
            };
            fetchGrades();
        }
    }, [activeTab]);

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* LEFT COLUMN: Summary Widgets */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
                {/* GPA Box */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("gpa")}</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {studentData?.gpa ? studentData.gpa.toFixed(1) : "0.0"} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">analytics</span>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-650 p-6 rounded-2xl text-white shadow-sm space-y-3">
                    <span className="material-symbols-outlined text-3xl opacity-80">school</span>
                    <h4 className="text-sm font-black uppercase tracking-wider">Học tập hiệu quả</h4>
                    <p className="text-xs opacity-90 leading-relaxed font-medium">
                        Xem điểm học tập thường xuyên giúp bạn nắm bắt được tiến độ và cải thiện các kỹ năng nghe, nói, đọc, viết nhanh chóng.
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: Tabbed Content Container */}
            <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col min-h-[400px]">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab("classes")}
                        className={`pb-4 px-1 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                            activeTab === "classes"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        {t("enrolledClasses")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("grades")}
                        className={`ml-8 pb-4 px-1 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                            activeTab === "grades"
                                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        Kết quả học tập
                    </button>
                </div>

                {/* Tab 1: Enrolled Classes */}
                {activeTab === "classes" && (
                    <div className="space-y-3 flex-1">
                        {studentData?.enrolledClasses && studentData.enrolledClasses.length > 0 ? (
                            studentData.enrolledClasses.map((c, idx) => (
                                <div 
                                    key={idx} 
                                    className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-700 flex items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined text-lg">school</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{c.className}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{c.courseName}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 uppercase border border-emerald-100 dark:border-emerald-900/50">
                                        {t("studying")}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto animate-fade-in flex-1">
                                <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">info</span>
                                <p className="text-xs text-slate-400 font-medium">{t("noEnrolledClasses")}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Detailed Grades */}
                {activeTab === "grades" && (
                    <div className="flex-1 flex flex-col">
                        {loadingGrades ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        ) : grades.length > 0 ? (
                            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-355 tracking-[0.15em]">
                                                <th className="p-4 pl-6">Lớp học</th>
                                                <th className="p-4">Giáo viên</th>
                                                <th className="p-4 text-center">Kỳ thi</th>
                                                <th className="p-4 text-center">Nghe</th>
                                                <th className="p-4 text-center">Nói</th>
                                                <th className="p-4 text-center">Đọc</th>
                                                <th className="p-4 text-center">Viết</th>
                                                <th className="p-4 text-center">Tổng kết</th>
                                                <th className="p-4 pr-6 max-w-[200px]">Nhận xét</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                            {grades.map((g) => (
                                                <tr key={g.gradeId} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors text-xs">
                                                    <td className="p-4 pl-6">
                                                        <div>
                                                            <p className="font-bold text-slate-800 dark:text-slate-150">{g.className}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{g.courseName}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                                                        {g.teacherName}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                            g.gradeType === "FINAL"
                                                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/50"
                                                                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50"
                                                        }`}>
                                                            {g.gradeType === "FINAL" ? "Cuối khóa" : "Thường xuyên"}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-mono font-bold">{g.listening?.toFixed(1) || "0.0"}</td>
                                                    <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-mono font-bold">{g.speaking?.toFixed(1) || "0.0"}</td>
                                                    <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-mono font-bold">{g.reading?.toFixed(1) || "0.0"}</td>
                                                    <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-mono font-bold">{g.writing?.toFixed(1) || "0.0"}</td>
                                                    <td className="p-4 text-center text-indigo-600 dark:text-indigo-400 font-mono font-extrabold text-sm">{g.finalGrade?.toFixed(1) || "0.0"}</td>
                                                    <td className="p-4 pr-6 text-slate-500 dark:text-slate-400 font-medium max-w-[200px] truncate" title={g.feedback}>
                                                        {g.feedback || "Chưa có nhận xét"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto animate-fade-in flex-1">
                                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">fact_check</span>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Chưa có bảng điểm</p>
                                <p className="text-xs text-slate-400 leading-relaxed mt-1">Hiện tại điểm học tập của bạn chưa được cập nhật trong lớp học.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;