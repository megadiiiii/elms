import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../api/translation';

const AdminDashboard = ({ stats, recentLogs }) => {
    const metrics = [
        { 
            id: 1, 
            label: t("totalStudents"), 
            value: stats?.totalStudents || 0, 
            icon: "groups", 
            color: "bg-blue-50 text-blue-600 border-blue-100",
            path: "/students"
        },
        { 
            id: 2, 
            label: t("teachers"), 
            value: stats?.totalTeachers || 0, 
            icon: "school", 
            color: "bg-rose-50 text-rose-600 border-rose-100",
            path: "/admin/users"
        },
        { 
            id: 3, 
            label: t("tas"), 
            value: stats?.totalTAs || 0, 
            icon: "support_agent", 
            color: "bg-purple-50 text-purple-600 border-purple-100",
            path: "/admin/users"
        },
        { 
            id: 4, 
            label: t("activeClasses"), 
            value: stats?.activeClasses || 0, 
            icon: "class", 
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
            path: "/classes"
        },
        { 
            id: 5, 
            label: t("totalCourses"), 
            value: stats?.totalCourses || 0, 
            icon: "menu_book", 
            color: "bg-amber-50 text-amber-600 border-amber-100",
            path: "/courses"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Grid Stats Cards - Hỗ trợ hiển thị 2 hàng và có sẵn ô chờ cho thông số mới */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {metrics.map((item) => (
                    <Link 
                        key={item.id} 
                        to={item.path}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all duration-200 group cursor-pointer"
                    >
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                            <p className="text-2xl font-bold text-slate-800 tracking-tight">
                                {Number(item.value).toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm ${item.color}`}>
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Hoạt động hệ thống */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-slate-400 text-xl">history</span>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        {t("systemActivityLog")}
                    </h3>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {recentLogs && recentLogs.length > 0 ? (
                        recentLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 hover:bg-slate-50/55 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                                <div className="mt-0.5">
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                                        {log.actionType}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 leading-snug">{log.message}</p>
                                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                        {log.createdAt}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl">
                            <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">info</span>
                            <p className="text-xs text-slate-400 font-medium">{t("noActivitiesFound")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;