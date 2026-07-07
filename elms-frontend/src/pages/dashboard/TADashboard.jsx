import React from 'react';
import { t } from '../../api/translation';

const TADashboard = ({ tasks = [] }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-slate-400 text-xl">assignment</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {t("taTasksToProcess")}
                </h3>
            </div>

            <div className="space-y-3">
                {tasks.length > 0 ? (
                    tasks.map((task, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">radio_button_unchecked</span>
                                <p className="text-sm font-bold text-slate-700 truncate">{task.title}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pl-4">
                                <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase">{task.deadline}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border border-dashed border-slate-100 rounded-xl">
                        <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">check_circle</span>
                        <p className="text-xs text-slate-400 font-medium">{t("noTasksAssigned")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TADashboard;