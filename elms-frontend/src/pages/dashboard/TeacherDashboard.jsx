import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../../api/translation';

const TeacherDashboard = ({ classes = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-slate-400 text-xl">class</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {t("assignedClassesThisSemester")}
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3 font-bold">{t("classCode")}</th>
                            <th className="pb-3 font-bold">{t("className")}</th>
                            <th className="pb-3 font-bold">{t("courses")}</th>
                            <th className="pb-3 font-bold">{t("studentsCount")}</th>
                            <th className="pb-3 font-bold">{t("status")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                        {classes.length > 0 ? (
                            classes.map((c, idx) => (
                                <tr 
                                    key={idx} 
                                    onClick={() => navigate(`/classes/detail/${c.id}`)}
                                    className="hover:bg-indigo-50/20 hover:text-indigo-950 transition-colors cursor-pointer"
                                >
                                    <td className="py-4 font-bold text-indigo-600">{c.classCode}</td>
                                    <td className="py-4 font-bold text-slate-700">{c.className}</td>
                                    <td className="py-4 text-slate-500">{c.courseName}</td>
                                    <td className="py-4 text-slate-500">{c.studentCount} {t("studentsUnit")}</td>
                                    <td className="py-4">
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">
                                    {t("noClassesAssignedThisSemester")}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherDashboard;