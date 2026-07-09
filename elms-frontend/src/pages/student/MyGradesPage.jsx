import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import axiosClient from '../../api/axiosClient';
import { t } from '../../api/translation';
import StudentGradesTable from '../dashboard/components/StudentGradesTable';

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
                    setGpa(Math.round(avg * 2) / 2);
                } else if (gradesData.length > 0) {
                    // Fallback to average of all grades
                    const avg = gradesData.reduce((sum, g) => sum + (g.finalGrade || 0), 0) / gradesData.length;
                    setGpa(Math.round(avg * 2) / 2);
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
                                {gpa.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 9</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">analytics</span>
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

                {/* Right Column: Detailed Grades Table */}
                <div className="col-span-12 lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">fact_check</span>
                            Bảng điểm chi tiết
                        </h3>
                    </div>

                    <StudentGradesTable grades={grades} loadingGrades={loading} />
                </div>
            </div>
        </MainLayout>
    );
};

export default MyGradesPage;
