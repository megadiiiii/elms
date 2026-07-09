import React, { useState, useEffect } from 'react';
import { t } from '../../api/translation';
import axiosClient from '../../api/axiosClient';
import StudentGradesTable from './components/StudentGradesTable';

const getRemainingTime = (sessionDateStr, startTimeStr) => {
    if (!sessionDateStr || !startTimeStr) return null;
    try {
        let day, month, year;
        const dateStr = sessionDateStr.trim();
        if (dateStr.includes("/")) {
            [day, month, year] = dateStr.split("/").map(Number);
        } else if (dateStr.includes("-")) {
            const parts = dateStr.split("-").map(Number);
            if (parts[0] > 1000) {
                // yyyy-MM-dd
                [year, month, day] = parts;
            } else {
                // dd-MM-yyyy
                [day, month, year] = parts;
            }
        } else {
            return null;
        }

        const [hours, minutes] = startTimeStr.trim().split(":").map(Number);
        const sessionDate = new Date(year, month - 1, day, hours, minutes);
        const now = new Date();
        const diffMs = sessionDate - now;
        if (diffMs < 0) {
            return null;
        }
        const diffMins = Math.floor(diffMs / 60000);
        const remainingDays = Math.floor(diffMins / (24 * 60));
        const remainingHours = Math.floor((diffMins % (24 * 60)) / 60);
        const remainingMins = diffMins % 60;
        if (remainingDays > 0) {
            return `Còn ${remainingDays} ngày ${remainingHours} giờ`;
        } else if (remainingHours > 0) {
            return `Còn ${remainingHours} giờ ${remainingMins} phút`;
        } else {
            return `Còn ${remainingMins} phút`;
        }
    } catch (e) {
        return null;
    }
};

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
                            {studentData?.gpa ? studentData.gpa.toFixed(1) : "0.0"} <span className="text-xs text-slate-400 font-normal">/ 9</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">analytics</span>
                    </div>
                </div>

                {/* 3 buổi học tiếp theo */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-850">
                        <span className="material-symbols-outlined text-indigo-500 text-lg">calendar_month</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">3 buổi học tiếp theo</h4>
                    </div>
                    <div className="space-y-3">
                        {studentData?.nextSessions && studentData.nextSessions.length > 0 ? (
                            studentData.nextSessions.map((session, idx) => {
                                const remaining = getRemainingTime(session.sessionDate, session.startTime);
                                const isSoon = remaining && (remaining.includes("phút") || (remaining.includes("giờ") && !remaining.includes("ngày")));
                                return (
                                    <div key={idx} className="flex flex-col p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100/70 dark:border-slate-850 space-y-1.5 hover:border-indigo-100 dark:hover:border-indigo-950 transition-all">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{session.className}</p>
                                            <span className="shrink-0 px-2 py-0.5 text-[9px] font-black uppercase rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/50">
                                                {session.room || "Online"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                                            <span>{session.startTime} - {session.endTime}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="material-symbols-outlined text-[12px] shrink-0">calendar_today</span>
                                                <span className="truncate">{session.sessionDate}</span>
                                            </div>
                                            {remaining && (
                                                <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider border ${
                                                    isSoon 
                                                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' 
                                                        : 'bg-slate-50 dark:bg-slate-950/30 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-850'
                                                }`}>
                                                    {remaining}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                                <span className="material-symbols-outlined text-xl mb-1 opacity-70">event_busy</span>
                                <p className="text-[11px] font-medium">Chưa có lịch học mới</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-indigo-600 dark:bg-indigo-950 p-6 rounded-2xl text-white shadow-sm space-y-3">
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
                                    className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/10 rounded-xl border border-slate-100 dark:border-slate-850 hover:border-indigo-100 dark:hover:border-indigo-950 hover:bg-white dark:hover:bg-slate-900 transition-all hover:shadow-sm"
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
                    <StudentGradesTable grades={grades} loadingGrades={loadingGrades} />
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;