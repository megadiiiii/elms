import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../api/translation';

const AdminDashboard = ({ stats }) => {
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
            {/* Grid Stats Cards */}
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
        </div>
    );
};

export default AdminDashboard;