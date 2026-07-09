import React from 'react';

const StudentGradesTable = ({ grades, loadingGrades }) => {
    if (loadingGrades) {
        return (
            <div className="flex-1 flex items-center justify-center py-16">
                <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        );
    }

    if (!grades || grades.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-xs mx-auto animate-fade-in flex-1">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">fact_check</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-355">Chưa có bảng điểm</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">Hiện tại điểm học tập của bạn chưa được cập nhật trong lớp học.</p>
            </div>
        );
    }

    return (
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
    );
};

export default StudentGradesTable;
