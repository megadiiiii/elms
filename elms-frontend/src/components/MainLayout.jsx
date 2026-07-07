import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Modal from './Modal';
import { t, getLanguage, setLanguage } from '../api/translation';

const MainLayout = ({ children, title, description }) => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);

    const role = localStorage.getItem('role') || 'STUDENT';
    const fullName = localStorage.getItem('fullName') || t('roleStudent');
    const code = localStorage.getItem('code') || '';
    const avatar = localStorage.getItem('avatar') || 'default-avatar.png';

    const avatarUrl = (avatar === 'default-avatar.png' || !avatar)
        ? null
        : `/uploads/avatars/${avatar}`;

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            const first = parts[parts.length - 2][0] || '';
            const second = parts[parts.length - 1][0] || '';
            return (first + second).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    const getRoleDisplayName = (roleName) => {
        const mapping = {
            'ADMIN': t('roleAdmin'),
            'TEACHER': t('roleTeacher'),
            'TA': t('roleTa'),
            'STUDENT': t('roleStudent')
        };
        return mapping[roleName?.toUpperCase()] || roleName;
    };

    const confirmLogout = () => {
        const currentLang = localStorage.getItem("lang");
        localStorage.clear();
        if (currentLang) {
            localStorage.setItem("lang", currentLang);
        }
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const container = document.getElementById("header-settings-dropdown-container");
            if (container && !container.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // Logic đồng bộ Dark Mode lên document element và localStorage
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex transition-colors duration-300">
            {/* Sidebar fixed ở bên trái */}
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

            {/* Content area bên phải */}
            <div className={`flex-1 ${isCollapsed ? 'pl-20' : 'pl-64'} flex flex-col min-h-screen transition-all duration-300`}>
                {/* Header thanh lịch */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-1.5 sticky top-0 z-30 flex items-center justify-between shadow-sm transition-colors duration-300">
                    <div className="invisible">
                        <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h1>
                        {description && <p className="text-[9px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">{description}</p>}
                    </div>
                    
                    {/* System Action Tools */}
                    <div className="flex items-center gap-3 relative" id="header-settings-dropdown-container">
                        <button
                            onClick={() => setShowDropdown(prev => !prev)}
                            className="relative shrink-0 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none rounded-full ring-2 ring-transparent dark:ring-slate-800 focus:ring-blue-500/20"
                            title={fullName}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200/80 dark:border-slate-800 shadow-sm"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div 
                                className="w-9 h-9 rounded-full bg-rose-500 text-white font-extrabold text-[13px] flex items-center justify-center border border-rose-600 uppercase tracking-tighter shadow-sm"
                                style={{ display: avatarUrl ? 'none' : 'flex' }}
                            >
                                {getInitials(fullName)}
                            </div>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-xl z-50 py-2 animate-fade-in flex flex-col transition-colors duration-300">
                                {/* Card thông tin cá nhân ở đầu */}
                                <div 
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/profile');
                                    }}
                                    className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center gap-3 select-none"
                                >
                                    <div className="relative shrink-0">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-xl object-cover border border-slate-105 dark:border-slate-800"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-10 h-10 rounded-xl bg-rose-500 text-white font-extrabold text-[14px] flex items-center justify-center border border-rose-600 uppercase tracking-tighter"
                                            style={{ display: avatarUrl ? 'none' : 'flex' }}
                                        >
                                            {getInitials(fullName)}
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{fullName}</p>
                                        {code && <p className="text-[10px] font-mono text-slate-500 dark:text-slate-450 truncate mt-0.5">{code}</p>}
                                        <p className="text-[9px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-widest mt-1">{getRoleDisplayName(role)}</p>
                                    </div>
                                </div>

                                {/* Dòng chọn Ngôn ngữ (1 dòng nằm ngang) */}
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t("language")}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer select-none text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                                            <input 
                                                type="radio" 
                                                name="lang-selection" 
                                                value="vi"
                                                checked={getLanguage() === "vi"}
                                                onChange={() => {
                                                    if (getLanguage() !== "vi") {
                                                        setLanguage("vi");
                                                        window.location.reload();
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                            />
                                            <span className="text-base leading-none ml-0.5">🇻🇳</span>
                                        </label>
                                        
                                        <label className="flex items-center gap-1 cursor-pointer select-none text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                                            <input 
                                                type="radio" 
                                                name="lang-selection" 
                                                value="en"
                                                checked={getLanguage() === "en"}
                                                onChange={() => {
                                                    if (getLanguage() !== "en") {
                                                        setLanguage("en");
                                                        window.location.reload();
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 text-blue-600 border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                            />
                                            <span className="text-base leading-none ml-0.5">🇬🇧</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Dòng Giao diện tối (Dark Mode - chỉ UI switch) */}
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t("darkMode")}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setDarkMode(prev => !prev)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                darkMode ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Divider */}
                                <hr className="border-slate-100 dark:border-slate-800 my-1" />

                                {/* Đăng xuất */}
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setShowConfirmLogout(true);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 dark:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:text-red-700 dark:hover:text-rose-400 transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {t("logout")}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Nội dung trang nhận động */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>

            {/* Modal Xác nhận Đăng xuất */}
            <Modal
                isOpen={showConfirmLogout}
                onClose={() => setShowConfirmLogout(false)}
                title={t('confirmLogoutTitle')}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t('confirmLogoutText')}
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowConfirmLogout(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MainLayout;