import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import axiosClient from '../../api/axiosClient';
import { t } from '../../api/translation';

const MyGradesPage = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gpa, setGpa] = useState(0.0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch grades
                const response = await axiosClient.get("/users/grades");
                const gradesData = response.data || [];
                setGrades(gradesData);

                // Calculate GPA based on final grades
                const finalGrades = gradesData.filter(g => g.gradeType === "FINAL");
                if (finalGrades.length > 0) {
                    const avg = finalGrades.reduce((sum, g) => sum + (g.finalGrade || 0), 0) / finalGrades.length;
                    setGpa(avg);
                } else if (gradesData.length > 0) {
                    // Fallback to average of all grades
                    const avg = gradesData.reduce((sum, g) => sum + (g.finalGrade || 0), 0) / gradesData.length;
                    setGpa(avg);
                }
            } catch (err) {
                console.error("Failed to load student grades:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <MainLayout
            title={t("myGrades") || "Kết quả học tập"}
            description="Xem chi tiết kết quả học tập, điểm thi và nhận xét từ giảng viên."
        >
            <div className="grid grid-cols-12 gap-6 animate-fade-in">
                {/* Left Column: Summary Widgets */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    {/* GPA Box */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("gpa") || "Điểm trung bình"}</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono">
                                {gpa.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
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

                {/* Right Column: Detailed Grades Table */}
                <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">fact_check</span>
                            Bảng điểm chi tiết
                        </h3>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <LoadingSpinner />
                            </div>
                        ) : grades.length > 0 ? (
                            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 animate-fade-in">
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
                                                <tr key={g.gradeId} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors text-xs text-slate-700 dark:text-slate-300">
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
                </div>
            </div>
        </MainLayout>
    );
};

export default MyGradesPage;
