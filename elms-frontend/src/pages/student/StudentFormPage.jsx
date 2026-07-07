import React from 'react';
import MainLayout from '../../components/MainLayout';
import FormInput from '../../components/FormInput';
import Toast from '../../components/Toast';
import BackButton from '../../components/BackButton';
import { t } from '../../api/translation';

import Error403Page from '../Error403Page';
import { useStudentForm } from './hooks/useStudentForm';
import { ImageCropperModal } from '../../components/ImageCropperModal';

const StudentFormPage = () => {
    const role = localStorage.getItem("role") || "STUDENT";
    if (role === "STUDENT") {
        return <Error403Page />;
    }

    const {
        isEditMode,
        loading,
        uploadingAvatar,
        avatarPreview,
        toast,
        handleCloseToast,
        formData,
        setFormData,
        errors,
        showCountriesDropdown,
        setShowCountriesDropdown,
        searchCountryQuery,
        setSearchCountryQuery,
        handleFieldChange,
        handleAvatarChange,
        handleCroppedAvatar,
        cropImageSrc,
        setCropImageSrc,
        isCropOpen,
        setIsCropOpen,
        handleSubmit,
        filteredCountries,
        navigate
    } = useStudentForm();

    return (
        <MainLayout
            title={isEditMode ? t("editStudent") : t("addStudent")}
            description={isEditMode ? t("editStudentDesc") : t("addStudentDesc")}
        >
            <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                <BackButton to="/students" text={t("backToList")} />

                <form onSubmit={handleSubmit} noValidate className="p-8 grid grid-cols-12 gap-8 items-start bg-white">
                    {/* CỘT TRÁI (3/12): Xử lý Avatar */}
                    <div className="col-span-12 md:col-span-3 flex flex-col items-center text-center space-y-4 md:border-r border-slate-100 md:pr-8 pt-4">
                        <div
                            className="relative group cursor-pointer w-28 h-28"
                            onClick={() => document.getElementById('avatarFileInput').click()}
                        >
                            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-blue-600/10 p-1 relative bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm transition-all hover:ring-blue-600/20">
                                <img
                                    src={avatarPreview || "/default-avatar.png"}
                                    className={`w-full h-full object-cover rounded-2xl ${uploadingAvatar ? 'opacity-40' : ''}`}
                                    alt="Avatar"
                                    onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 rounded-full">
                                    <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="avatarFileInput"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">{t("avatarLabel")}</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{t("avatarDesc")}</p>
                        </div>
                        {uploadingAvatar && <p className="text-[10px] text-blue-600 font-bold animate-pulse">{t("uploadingAvatarText")}</p>}
                    </div>

                    {/* CỘT PHẢI (9/12): Form Fields */}
                    <div className="col-span-12 md:col-span-9 space-y-8">
                        <div className="border-b border-slate-100 flex mb-4">
                            <div className="border-b-2 border-blue-900 pb-3 text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                                {t("detailedInfo")}
                            </div>
                        </div>

                        {/* PHẦN 1: THÔNG TIN HỌC VIÊN */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-blue-900 tracking-wider flex items-center border-l-[3px] border-blue-900 pl-2.5 py-0.5">
                                {t("personalInfo")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                {/* Họ tên học viên */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("fullName")}
                                        id="studentName"
                                        placeholder={t("fullNamePlaceholder")}
                                        value={formData.studentName}
                                        onChange={(e) => handleFieldChange("studentName", e.target.value)}
                                        hasError={!!errors.studentName}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">person</span>}
                                    />
                                </div>

                                {/* Biệt danh Nickname */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("studentNickname")}
                                        id="studentNickname"
                                        placeholder={t("studentNicknamePlaceholder")}
                                        value={formData.studentNickname}
                                        onChange={(e) => handleFieldChange("studentNickname", e.target.value)}
                                        hasError={!!errors.studentNickname}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">face</span>}
                                    />
                                </div>

                                {/* Ngày sinh */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("dob")}
                                        id="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => handleFieldChange("dob", e.target.value)}
                                        hasError={!!errors.dob}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">calendar_month</span>}
                                    />
                                </div>

                                {/* Giới tính */}
                                <div className="space-y-1">
                                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                                        {t("gender")}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-scholarly-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">wc</span>
                                        </div>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleFieldChange("gender", e.target.value)}
                                            className={`w-full bg-white border rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-scholarly-primary/10 focus:border-scholarly-primary text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer ${errors.gender ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'}`}
                                        >
                                            <option value="">{t("selectGender")}</option>
                                            <option value="Nam">{t("male")}</option>
                                            <option value="Nữ">{t("female")}</option>
                                            <option value="Khác">{t("otherGender")}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Quốc tịch (Autocomplete) */}
                                <div className="space-y-1 relative" id="nationality-autocomplete-container">
                                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                                        {t("nationality")}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-scholarly-primary transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">public</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t("selectCountry")}
                                            value={searchCountryQuery}
                                            onChange={(e) => {
                                                setSearchCountryQuery(e.target.value);
                                                setShowCountriesDropdown(true);
                                                if (formData.nationality !== e.target.value) {
                                                    setFormData(prev => ({ ...prev, nationality: e.target.value }));
                                                }
                                            }}
                                            onFocus={() => setShowCountriesDropdown(true)}
                                            className={`w-full bg-white border rounded-xl pl-11 pr-10 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-scholarly-primary/10 focus:border-scholarly-primary text-slate-800 font-medium outline-none transition-all duration-200 ${errors.nationality ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'}`}
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none text-lg">
                                            arrow_drop_down
                                        </span>
                                    </div>

                                    {showCountriesDropdown && (
                                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg z-50 py-1.5 scrollbar-thin">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((country, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            handleFieldChange("nationality", country.name);
                                                            setSearchCountryQuery(country.name);
                                                            setShowCountriesDropdown(false);
                                                        }}
                                                        className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-slate-50 text-slate-700 ${formData.nationality === country.name ? 'bg-blue-50 text-blue-900 font-semibold' : ''
                                                            }`}
                                                    >
                                                        {country.name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-xs text-slate-400 italic">
                                                    {t("noCountryFound")}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 2: THÔNG TIN LIÊN HỆ */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-base font-bold text-slate-800 tracking-wider flex items-center border-l-[3px] border-emerald-600 pl-2.5 py-0.5">
                                {t("contactInfo")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                {/* Số điện thoại */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("phone")}
                                        id="phone"
                                        placeholder={t("phonePlaceholder")}
                                        value={formData.phone}
                                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                                        hasError={!!errors.phone}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">call</span>}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("email")}
                                        id="email"
                                        type="email"
                                        placeholder={t("emailPlaceholder")}
                                        value={formData.email}
                                        onChange={(e) => handleFieldChange("email", e.target.value)}
                                        hasError={!!errors.email}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                                    />
                                </div>

                                {/* Địa chỉ */}
                                <div className="sm:col-span-2 space-y-1">
                                    <FormInput
                                        label={t("address")}
                                        id="address"
                                        placeholder={t("addressPlaceholder")}
                                        value={formData.address}
                                        onChange={(e) => handleFieldChange("address", e.target.value)}
                                        hasError={!!errors.address}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">location_on</span>}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 3: THÔNG TIN PHỤ HUYNH */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-base font-bold text-slate-800 tracking-wider flex items-center border-l-[3px] border-purple-600 pl-2.5 py-0.5">
                                {t("parentName") || "Thông tin phụ huynh"}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                                {/* Tên phụ huynh */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("parentName")}
                                        id="parentName"
                                        placeholder={t("parentNamePlaceholder")}
                                        value={formData.parentName}
                                        onChange={(e) => handleFieldChange("parentName", e.target.value)}
                                        hasError={!!errors.parentName}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">supervisor_account</span>}
                                    />
                                </div>

                                {/* SĐT phụ huynh */}
                                <div className="space-y-1">
                                    <FormInput
                                        label={t("parentPhone")}
                                        id="parentPhone"
                                        placeholder={t("parentPhonePlaceholder")}
                                        value={formData.parentPhone}
                                        onChange={(e) => handleFieldChange("parentPhone", e.target.value)}
                                        hasError={!!errors.parentPhone}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">call</span>}
                                    />
                                </div>

                                {/* Email phụ huynh */}
                                <div className="sm:col-span-2 space-y-1">
                                    <FormInput
                                        label={t("parentEmail")}
                                        id="parentEmail"
                                        type="email"
                                        placeholder={t("parentEmailPlaceholder")}
                                        value={formData.parentEmail}
                                        onChange={(e) => handleFieldChange("parentEmail", e.target.value)}
                                        hasError={!!errors.parentEmail}
                                        leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end items-center gap-6 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/students')}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-0"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploadingAvatar}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-[#0B2545] hover:bg-[#071b38] disabled:opacity-50 rounded-lg shadow-md cursor-pointer active:scale-[0.98] transition-all"
                            >
                                {loading ? t("processing") : isEditMode ? t("editStudent") : t("addStudent")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <ImageCropperModal
                isOpen={isCropOpen}
                imageSrc={cropImageSrc}
                onCancel={() => {
                    setIsCropOpen(false);
                    setCropImageSrc(null);
                }}
                onCropComplete={handleCroppedAvatar}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={handleCloseToast}
            />
        </MainLayout>
    );
};

export default StudentFormPage;
