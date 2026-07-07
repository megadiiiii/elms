import React from 'react';
import { t } from '../../api/translation';

const StudentDashboard = ({ studentData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Điểm GPA hiện tại */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("gpa")}</p>
                    <p className="text-2xl font-bold text-slate-800">
                        {studentData?.gpa ? studentData.gpa.toFixed(1) : "0.0"} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
            </div>

            {/* Lớp học đang tham gia */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-slate-400 text-xl">class</span>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        {t("enrolledClasses")}
                    </h3>
                </div>
                
                <div className="space-y-3">
                    {studentData?.enrolledClasses && studentData.enrolledClasses.length > 0 ? (
                        studentData.enrolledClasses.map((c, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-slate-500">
                                        <span className="material-symbols-outlined text-lg">school</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{c.className}</p>
                                        <p className="text-[11px] font-medium text-slate-400">{c.courseName}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 uppercase border border-emerald-100">
                                    {t("studying")}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border border-dashed border-slate-100 rounded-xl">
                            <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">info</span>
                            <p className="text-xs text-slate-400 font-medium">{t("noEnrolledClasses")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;