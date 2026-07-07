import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../api/translation';

const Error403Page = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
            <div className="text-center space-y-6 max-w-md animate-fade-in">
                {/* Icon Lock lớn minh họa */}
                <div className="w-24 h-24 bg-scholarly-danger-light dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 text-scholarly-danger dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-5xl">shield_lock</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">403</h1>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t("error403Title")}</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-400 font-medium leading-relaxed">
                        {t("error403Desc")}
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-scholarly-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-900 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        {t("backToHome")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Error403Page;
