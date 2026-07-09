import React from 'react';
import { Link } from 'react-router-dom';
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
                    tasks.map((task, idx) => {
                        const content = (
                            <>
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="material-symbols-outlined text-slate-400 text-lg shrink-0 group-hover:text-indigo-500 transition-colors">
                                        radio_button_unchecked
                                    </span>
                                    <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-950 transition-colors">
                                        {task.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 pl-4 text-slate-500">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                                    <span className="text-[11px] font-bold uppercase">{task.deadline}</span>
                                    {task.path && (
                                        <span className="material-symbols-outlined text-slate-300 text-[10px] ml-1.5 group-hover:text-indigo-650 group-hover:translate-x-0.5 transition-all">
                                            arrow_forward_ios
                                        </span>
                                    )}
                                </div>
                            </>
                        );

                        return task.path ? (
                            <Link 
                                key={idx} 
                                to={task.path}
                                className="group flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100 transition-all cursor-pointer hover:bg-indigo-50/20 hover:border-indigo-100/80 active:scale-[0.99] no-underline"
                            >
                                {content}
                            </Link>
                        ) : (
                            <div 
                                key={idx} 
                                className="group flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100 transition-all"
                            >
                                {content}
                            </div>
                        );
                    })
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