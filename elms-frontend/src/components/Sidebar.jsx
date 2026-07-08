import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../api/translation';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const location = useLocation();
    const role = localStorage.getItem('role') || 'STUDENT';

    const getNavLinkClass = (path) => {
        const activeStyle = location.pathname === path 
            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-700 dark:hover:text-blue-450';
        return `flex items-center transition-all duration-350 rounded-xl font-bold text-sm ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
        } ${activeStyle}`;
    };

    return (
        <aside className={`h-screen ${isCollapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-40 bg-slate-50 dark:bg-slate-900 flex flex-col p-4 gap-2 border-r border-slate-200 dark:border-slate-800 transition-all duration-300`}>
            {/* Logo trung tâm & Nút Toggle */}
            <div className={`mb-6 flex items-center ${isCollapsed ? 'flex-col gap-4' : 'justify-between px-3 py-2 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-850 transition-colors duration-300'}`}>
                <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden shrink-0">
                    <span className="material-symbols-outlined text-blue-600 shrink-0 text-[24px]">auto_stories</span>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tighter text-blue-900 dark:text-blue-400 leading-tight">Scholarly</span>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">Management</span>
                        </div>
                    )}
                </Link>
                <button 
                    onClick={onToggle} 
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer shrink-0 transition-colors duration-200"
                    title={isCollapsed ? t("expand") : t("collapse")}
                >
                    <span className="material-symbols-outlined text-xl">
                        {isCollapsed ? 'menu' : 'menu_open'}
                    </span>
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-6 flex-1 overflow-y-auto pr-1">
                {/* Phân hệ HỆ THỐNG dành riêng cho ADMIN */}
                {role === 'ADMIN' && (
                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{t('system')}</p>}
                        <Link className={getNavLinkClass('/dashboard')} to="/dashboard" title={isCollapsed ? t('dashboard') : ""}>
                            <span className="material-symbols-outlined text-[22px]">dashboard_customize</span>
                            {!isCollapsed && <span>{t('dashboard')}</span>}
                        </Link>
                        <Link className={getNavLinkClass('/admin/users')} to="/admin/users" title={isCollapsed ? t('staffManagement') : ""}>
                            <span className="material-symbols-outlined text-[22px]">person_search</span>
                            {!isCollapsed && <span>{t('staffManagement')}</span>}
                        </Link>
                        <Link className={getNavLinkClass('/admin/classrooms')} to="/admin/classrooms" title={isCollapsed ? t('classroomManagement') : ""}>
                            <span className="material-symbols-outlined text-[22px]">meeting_room</span>
                            {!isCollapsed && <span>{t('classroomManagement')}</span>}
                        </Link>
                        <Link className={getNavLinkClass('/admin/audit-logs')} to="/admin/audit-logs" title={isCollapsed ? t('systemActivityLog') : ""}>
                            <span className="material-symbols-outlined text-[22px]">history</span>
                            {!isCollapsed && <span>{t('systemActivityLog')}</span>}
                        </Link>
                    </div>
                )}

                {/* Phân hệ ĐÀO TẠO cho ADMIN, TEACHER, TA */}
                {['ADMIN', 'TEACHER', 'TA'].includes(role) && (
                    <div className="space-y-1">
                        {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{t('training')}</p>}
                        <Link className={getNavLinkClass('/courses')} to="/courses" title={isCollapsed ? t('courses') : ""}>
                            <span className="material-symbols-outlined text-[22px]">menu_book</span>
                            {!isCollapsed && <span>{t('courses')}</span>}
                        </Link>
                        <Link className={getNavLinkClass('/classes')} to="/classes" title={isCollapsed ? t('classes') : ""}>
                            <span className="material-symbols-outlined text-[22px]">groups</span>
                            {!isCollapsed && <span>{t('classes')}</span>}
                        </Link>
                        <Link className={getNavLinkClass('/students')} to="/students" title={isCollapsed ? t('studentsLink') : ""}>
                            <span className="material-symbols-outlined text-[22px]">person</span>
                            {!isCollapsed && <span>{t('studentsLink')}</span>}
                        </Link>
                        {['ADMIN', 'TEACHER', 'TA'].includes(role) && (
                            <Link className={getNavLinkClass('/materials')} to="/materials" title={isCollapsed ? t('materials') : ""}>
                                <span className="material-symbols-outlined text-[22px]">folder_open</span>
                                {!isCollapsed && <span>{t('materials')}</span>}
                            </Link>
                        )}
                    </div>
                )}

                {/* Phân hệ CÁ NHÂN dùng chung */}
                <div className="space-y-1">
                    {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{t('personal')}</p>}
                    <Link className={getNavLinkClass('/schedule')} to="/schedule" title={isCollapsed ? t('timeSchedule') : ""}>
                        <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                        {!isCollapsed && <span>{t('timeSchedule')}</span>}
                    </Link>
                    {role === 'STUDENT' && (
                        <Link className={getNavLinkClass('/my-grades')} to="/my-grades" title={isCollapsed ? t('myGrades') : ""}>
                            <span className="material-symbols-outlined text-[22px]">fact_check</span>
                            {!isCollapsed && <span>{t('myGrades')}</span>}
                        </Link>
                    )}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;