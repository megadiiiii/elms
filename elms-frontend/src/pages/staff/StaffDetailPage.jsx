import React from 'react';
import MainLayout from '../../components/MainLayout';
import Toast from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { t, getLanguage } from '../../api/translation';

import { useStaffDetail } from './hooks/useStaffDetail';

const StaffDetailPage = () => {
    const {
        detail,
        loading,
        toast,
        handleCloseToast,
        confirmModal,
        closeConfirmModal,
        triggerResetPassword,
        triggerToggleStatus,
        handleConfirmAction,
        getAvatarSource,
        formatDob,
        getGenderLabel,
        navigate
    } = useStaffDetail();

    if (loading) {
        return (
            <MainLayout title={t("staffManagement")}>
                <LoadingSpinner message={t("loadingStaffProfile")} />
            </MainLayout>
        );
    }

    if (!detail) {
        return (
            <MainLayout title={t("staffManagement")}>
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm px-6">
                    <span className="material-symbols-outlined text-5xl text-rose-500 mb-4 animate-bounce">error</span>
                    <h3 className="text-base font-bold text-slate-700">{t("staffProfileNotFound")}</h3>
                    <p className="text-xs text-slate-400 mt-2">{t("staffProfileNotFoundDesc")}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="mt-6 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
                    >
                        {t("backToList")}
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <>
            <MainLayout
                title={t("staffDetailTitle")}
                description={t("staffDetailDesc").replace("{name}", detail.fullName)}
            >
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    {/* Top Action Bar */}
                    <div className="border-b border-slate-100 px-8 py-3.5 flex items-center justify-between bg-white">
                        <button
                            type="button"
                            onClick={() => (to ? navigate(to) : navigate(-1))}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            {t("back")}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/users/edit/${detail.id}`)}
                            className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all cursor-pointer border-0"
                        >
                            <span className="material-symbols-outlined text-base">edit</span>
                            {t("editStaffProfile")}
                        </button>
                    </div>

                    <div className="p-8 grid grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN (3/12): Avatar & Quick Stats */}
                        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col items-center text-center space-y-5 md:border-r border-slate-100 md:pr-8 pt-4">
                            <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-blue-600/10 p-1 bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm">
                                <img
                                    src={getAvatarSource(detail.avatar)}
                                    className="w-full h-full object-cover rounded-2xl"
                                    alt="Avatar"
                                    onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                    }}
                                />
                            </div>
                            
                            <div className="space-y-2 w-full">
                                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                                    {detail.fullName}
                                </h2>
                                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-slate-50 py-1 px-3 rounded-lg inline-block border border-slate-200/50">
                                    {detail.staffCode || t("noCodeAssigned")}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 w-full pt-2">
                                <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-55">
                                    <span className="text-slate-400 font-medium">{t("role")}:</span>
                                    <StatusBadge type="role" value={detail.roleName} />
                                </div>
                                <div className="flex justify-between items-center text-xs py-1.5">
                                    <span className="text-slate-400 font-medium">{t("status")}:</span>
                                    <StatusBadge type="user" value={detail.userStatus} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full pt-4 border-t border-slate-100/60">
                                {/* Nút Cấp lại mật khẩu */}
                                <button
                                    type="button"
                                    onClick={triggerResetPassword}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-amber-50 hover:bg-amber-100/80 text-amber-700 rounded-xl transition-all cursor-pointer w-full border border-amber-150"
                                >
                                    <span className="material-symbols-outlined text-base">lock_reset</span>
                                    {t("resetPassword")}
                                </button>

                                {/* Nút Khóa / Mở khóa tài khoản */}
                                <button
                                    type="button"
                                    onClick={triggerToggleStatus}
                                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer w-full border ${
                                        detail.userStatus === "ACTIVE"
                                            ? "bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-150"
                                            : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-150"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {detail.userStatus === "ACTIVE" ? "lock" : "lock_open"}
                                    </span>
                                    {detail.userStatus === "ACTIVE" ? t("lockAccount") : t("unlockAccount")}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (9/12): Tabs or sections */}
                        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-8 md:pl-4 pt-2">
                            {/* SECTION 1: Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-l-[3px] border-blue-900 pl-3 py-0.5">
                                    {t("personalInfo")}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("gender")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                {detail.gender === "MALE" || detail.gender === "Nam" ? "male" : detail.gender === "FEMALE" || detail.gender === "Nữ" ? "female" : "wc"}
                                            </span>
                                            {getGenderLabel(detail.gender)}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("dob")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                            {formatDob(detail.dob)}
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("nationality")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">public</span>
                                            {detail.nationality || (getLanguage() === 'vi' ? "Việt Nam" : "Vietnam")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: Contact Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-l-[3px] border-blue-900 pl-3 py-0.5">
                                    {t("contactInfoAndAccount")}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("username")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">alternate_email</span>
                                            <span className="font-mono">{detail.username}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("email")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                            <a href={`mailto:${detail.email}`} className="hover:text-blue-600 transition-colors">
                                                {detail.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("phone")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                                            <a href={`tel:${detail.phone}`} className="hover:text-blue-600 transition-colors">
                                                {detail.phone}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                            {t("address")}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">home</span>
                                            {detail.address || t("notUpdated")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={handleCloseToast}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={t("confirm")}
                cancelText={t("cancel")}
            />
        </>
    );
};

export default StaffDetailPage;
