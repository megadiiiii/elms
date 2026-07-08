import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import axiosClient from '../../api/axiosClient';
import { t } from '../../api/translation';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/material_blue.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";

const getActionTypeLabel = (type) => {
    return t(type);
};

const getPropertyNameLabel = (prop) => {
    return t(prop);
};

const formatDateToString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    
    const pad = (num) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedActionType, setSelectedActionType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchLogs = () => {
        setLoading(true);
        axiosClient.get('/dashboard/data')
            .then(res => {
                setLogs(res.data.recentLogs || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Lỗi tải nhật ký hoạt động!", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Trích xuất danh sách các loại hành động duy nhất để đưa vào dropdown filter
    const actionTypes = Array.from(new Set(logs.map(log => log.actionType).filter(Boolean)));

    // Lọc logs dựa theo từ khóa tìm kiếm, loại hành động đã chọn và ngày/giờ
    const filteredLogs = logs.filter(log => {
        const actionLabel = getActionTypeLabel(log.actionType);
        const matchesSearch = 
            (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.createdBy && log.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (actionLabel && actionLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.actionType && log.actionType.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = !selectedActionType || log.actionType === selectedActionType;

        const logDateTime = log.createdAt ? log.createdAt.substring(0, 16) : "";
        const startStr = formatDateToString(startDate);
        const endStr = formatDateToString(endDate);

        const matchesStartDate = !startStr || logDateTime >= startStr;
        const matchesEndDate = !endStr || logDateTime <= endStr;

        return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });

    // Hàm phân tích và vẽ bảng so sánh old/new values
    const renderDiffTable = (log) => {
        let oldObj = {};
        let newObj = {};
        const oldStr = log.oldValue || log.old_value;
        const newStr = log.newValue || log.new_value;

        try {
            if (oldStr && oldStr !== "null") oldObj = JSON.parse(oldStr);
        } catch(e) {
            oldObj = { data: oldStr };
        }
        try {
            if (newStr && newStr !== "null") newObj = JSON.parse(newStr);
        } catch(e) {
            newObj = { data: newStr };
        }

        const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

        return (
            <div className="overflow-x-auto max-h-[350px] border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                            <th className="py-2.5 px-4">Thuộc tính</th>
                            <th className="py-2.5 px-4">Trước thay đổi</th>
                            <th className="py-2.5 px-4">Sau thay đổi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {keys.map((key) => {
                            const oldVal = oldObj[key] !== undefined && oldObj[key] !== null ? String(oldObj[key]) : "";
                            const newVal = newObj[key] !== undefined && newObj[key] !== null ? String(newObj[key]) : "";
                            const isChanged = oldVal !== newVal;

                            return (
                                <tr key={key} className={isChanged ? "bg-amber-50/15" : ""}>
                                    <td className="py-2.5 px-4 font-semibold text-slate-600 text-xs">
                                        {getPropertyNameLabel(key)}
                                    </td>
                                    <td className="py-2.5 px-4 text-rose-600 font-mono text-xs break-all max-w-[200px]">
                                        {oldVal || "-"}
                                    </td>
                                    <td className="py-2.5 px-4 text-emerald-600 font-mono text-xs font-bold break-all max-w-[200px]">
                                        {newVal || "-"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <MainLayout
            title={t('systemActivityLog')}
            description="Theo dõi toàn bộ nhật ký thay đổi và hoạt động của người dùng trong hệ thống."
        >
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-xl">history</span>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            {t("systemActivityLog")}
                        </h3>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200/40"
                    >
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Làm mới
                    </button>
                </div>

                {/* Search & Filter Inputs */}
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo người thực hiện, nội dung hoặc hành động..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none"
                            />
                        </div>
                        <div>
                            <select
                                value={selectedActionType}
                                onChange={(e) => setSelectedActionType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none text-slate-650 font-semibold"
                            >
                                <option value="">Tất cả loại hành động</option>
                                {actionTypes.map(type => (
                                    <option key={type} value={type}>{getActionTypeLabel(type)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider whitespace-nowrap">Từ:</span>
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10">calendar_today</span>
                                <Flatpickr
                                    value={startDate}
                                    onChange={([date]) => setStartDate(date)}
                                    options={{
                                        locale: Vietnamese,
                                        enableTime: true,
                                        dateFormat: "Y-m-d H:i",
                                        time_24hr: true
                                    }}
                                    placeholder="Chọn ngày & giờ bắt đầu..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none text-slate-650 font-semibold cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider whitespace-nowrap">Đến:</span>
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none z-10">event</span>
                                <Flatpickr
                                    value={endDate}
                                    onChange={([date]) => setEndDate(date)}
                                    options={{
                                        locale: Vietnamese,
                                        enableTime: true,
                                        dateFormat: "Y-m-d H:i",
                                        time_24hr: true
                                    }}
                                    placeholder="Chọn ngày & giờ kết thúc..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all outline-none text-slate-650 font-semibold cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(null); setEndDate(null); }}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-2 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                                    Xóa bộ lọc thời gian
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Thời gian</th>
                                    <th className="py-3 px-4">Người thực hiện</th>
                                    <th className="py-3 px-4">Hành động</th>
                                    <th className="py-3 px-4">Nội dung</th>
                                    <th className="py-3 px-4 text-center">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                                {filteredLogs && filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                                            <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                                                {log.createdAt}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                                                {log.createdBy || "SYSTEM"}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/60 uppercase tracking-wider">
                                                    {getActionTypeLabel(log.actionType)}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 min-w-[280px] max-w-[400px] truncate leading-normal">
                                                {log.message}
                                            </td>
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                {((log.oldValue && log.oldValue !== "null") || (log.newValue && log.newValue !== "null") || (log.old_value && log.old_value !== "null") || (log.new_value && log.new_value !== "null")) ? (
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/60 rounded-lg transition-all cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                        Xem
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-300 font-medium">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-300 text-3xl mb-2">info</span>
                                                <p className="text-xs text-slate-400 font-medium">{t("noActivitiesFound")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal hiển thị chi tiết thay đổi */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Chi tiết thay đổi dữ liệu</h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedLog.createdAt} • {getActionTypeLabel(selectedLog.actionType)}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hành động</p>
                                <p className="text-sm font-semibold text-slate-700 leading-snug mt-1">{selectedLog.message}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">So sánh các trường dữ liệu</p>
                                {renderDiffTable(selectedLog)}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default AuditLogPage;
