import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import MainLayout from '../../components/MainLayout';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import countriesData from '../../js/countries.json';
import { t, getLanguage } from '../../api/translation';
import { ImageCropperModal } from '../../components/ImageCropperModal';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [isCropOpen, setIsCropOpen] = useState(false);

    // State for password change modal
    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Form data state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        gender: '',
        nationality: '',
        dob: '',
        avatar: ''
    });

    const [errors, setErrors] = useState({});
    const [countriesList] = useState(countriesData);
    const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
    const [searchCountryQuery, setSearchCountryQuery] = useState('');

    useEffect(() => {
        setSearchCountryQuery(formData.nationality || '');
    }, [formData.nationality]);

    // Handle clicking outside to close nationality autocomplete
    useEffect(() => {
        const handleClickOutside = (event) => {
            const container = document.getElementById("profile-nationality-container");
            if (container && !container.contains(event.target)) {
                setShowCountriesDropdown(false);
                setSearchCountryQuery(formData.nationality || '');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [formData.nationality]);

    // Fetch profile on load
    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/users/profile');
            const data = response.data;
            setProfile(data);
            
            const formatLocalDateToInput = (dobValue) => {
                if (!dobValue) return '';
                if (Array.isArray(dobValue)) {
                    const [year, month, day] = dobValue;
                    const y = year;
                    const m = String(month).padStart(2, '0');
                    const d = String(day).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }
                if (typeof dobValue === 'string') {
                    return dobValue.split('T')[0];
                }
                return '';
            };

            setFormData({
                fullName: data.fullName || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                gender: data.gender || '',
                nationality: data.nationality || '',
                dob: formatLocalDateToInput(data.dob),
                avatar: data.avatar || ''
            });

            if (data.avatar) {
                setAvatarPreview(getAvatarSource(data.avatar));
            }
        } catch (error) {
            showToast(error.response?.data?.message || t("profileLoadError"), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    const getAvatarSource = (avatarName) => {
        if (!avatarName) return "/default-avatar.png";
        if (avatarName.startsWith("http://") || avatarName.startsWith("https://")) {
            return avatarName;
        }
        return `/uploads/avatars/${avatarName}`;
    };

    const handleFieldChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        if (errors[fieldId]) {
            setErrors(prev => ({ ...prev, [fieldId]: null }));
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            showToast(t("avatarSizeError"), "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setCropImageSrc(event.target.result);
            setIsCropOpen(true);
        };
        reader.readAsDataURL(file);
        
        // Reset so user can upload same file again if canceled
        e.target.value = '';
    };

    const handleCroppedAvatar = async (croppedFile, croppedUrl) => {
        setIsCropOpen(false);
        setCropImageSrc(null);
        setAvatarPreview(croppedUrl);

        const uploadData = new FormData();
        uploadData.append('file', croppedFile);

        setUploadingAvatar(true);
        try {
            const res = await axiosClient.post('/media/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, avatar: res.data.fileName }));
            showToast(t("avatarUploadSuccess"), "success");
        } catch (err) {
            showToast(err.response?.data?.message || t("avatarUploadError"), "error");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!formData.fullName || !formData.fullName.trim()) {
            setErrors(prev => ({ ...prev, fullName: t("fullNameRequired") }));
            showToast(t("fullNameRequired"), "error");
            return;
        }
        if (!formData.email || !formData.email.trim()) {
            setErrors(prev => ({ ...prev, email: t("emailRequired") }));
            showToast(t("emailRequired"), "error");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors(prev => ({ ...prev, email: t("emailInvalid") }));
            showToast(t("emailInvalid"), "error");
            return;
        }
        if (!formData.phone || !formData.phone.trim()) {
            setErrors(prev => ({ ...prev, phone: t("phoneRequired") }));
            showToast(t("phoneRequired"), "error");
            return;
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setErrors(prev => ({ ...prev, phone: t("phoneInvalid") }));
            showToast(t("phoneInvalid"), "error");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.put('/users/profile', formData);
            showToast(t("profileUpdateSuccess"), "success");
            setIsEditing(false);
            
            // Sync new full name and avatar locally if changed
            localStorage.setItem("fullName", formData.fullName);
            if (formData.avatar) {
                localStorage.setItem("avatar", formData.avatar);
            }
            
            fetchProfile();
        } catch (err) {
            showToast(err.response?.data?.message || t("profileUpdateError"), "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChangeSubmit = async (e) => {
        e.preventDefault();
        setPasswordErrors({});

        let hasError = false;
        const newErrors = {};

        if (!passwordModal.currentPassword || !passwordModal.currentPassword.trim()) {
            newErrors.currentPassword = t("currentPasswordRequired");
            hasError = true;
        }
        if (!passwordModal.newPassword || !passwordModal.newPassword.trim()) {
            newErrors.newPassword = t("newPasswordRequired");
            hasError = true;
        } else if (passwordModal.newPassword.length < 6) {
            newErrors.newPassword = t("newPasswordLengthError");
            hasError = true;
        }
        if (!passwordModal.confirmPassword || !passwordModal.confirmPassword.trim()) {
            newErrors.confirmPassword = t("confirmPasswordRequired");
            hasError = true;
        } else if (passwordModal.newPassword !== passwordModal.confirmPassword) {
            newErrors.confirmPassword = t("confirmPasswordMismatch");
            hasError = true;
        }

        if (hasError) {
            setPasswordErrors(newErrors);
            showToast(t("checkInputError"), 'error');
            return;
        }

        setPasswordSubmitting(true);
        try {
            const payload = {
                currentPassword: passwordModal.currentPassword,
                newPassword: passwordModal.newPassword,
                confirmPassword: passwordModal.confirmPassword
            };
            const response = await axiosClient.put('/users/change-password', payload);
            showToast(response.data?.message || t("passwordChangeSuccess"), 'success');
            
            setPasswordModal({
                isOpen: false,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            showToast(error.response?.data?.message || t("passwordChangeError"), 'error');
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const formatDob = (dobValue) => {
        if (!dobValue) return t("notUpdated");
        try {
            let date;
            if (Array.isArray(dobValue)) {
                const [year, month, day] = dobValue;
                date = new Date(year, month - 1, day);
            } else {
                date = new Date(dobValue);
            }
            return date.toLocaleDateString(getLanguage() === "vi" ? "vi-VN" : "en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        } catch (e) {
            return String(dobValue);
        }
    };

    const getGenderLabel = (gender) => {
        if (!gender) return t("notUpdated");
        if (gender === "MALE" || gender === "Nam") return t("male");
        if (gender === "FEMALE" || gender === "Nữ") return t("female");
        if (gender === "OTHER" || gender === "Khác") return t("otherGender");
        return gender;
    };

    const getRoleBadge = (roleName) => {
        switch (roleName) {
            case "ADMIN":
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-200 border border-indigo-150 dark:border-indigo-900/60 transition-colors duration-300">
                        {t("admins")}
                    </span>
                );
            case "TEACHER":
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 border border-rose-150 dark:border-rose-900/60 transition-colors duration-300">
                        {t("roleTeacher")}
                    </span>
                );
            case "TA":
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-200 border border-purple-150 dark:border-purple-900/60 transition-colors duration-300">
                        {t("roleTa")}
                    </span>
                );
            case "STUDENT":
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 border border-emerald-150 dark:border-emerald-900/60 transition-colors duration-300">
                        {t("roleStudent")}
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors duration-300">
                        {roleName}
                    </span>
                );
        }
    };

    const filteredCountries = countriesList.filter(c =>
        c.name.toLowerCase().includes(searchCountryQuery.toLowerCase())
    );

    if (loading && !profile) {
        return (
            <MainLayout title={t("profile")}>
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-400 mt-4">{t("loadingProfile")}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <>
            <MainLayout
                title={t("profile")}
                description={getLanguage() === 'vi' ? "Xem và chỉnh sửa thông tin lý lịch cá nhân cũng như thông tin liên hệ của bạn." : "View and edit your personal profile and contact information."}
            >
                <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                    {/* Top Action Bar */}
                    <div className="border-b border-slate-100 px-8 py-3.5 flex items-center justify-end bg-white">
                        {!isEditing ? (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: true }))}
                                    className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-black bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">lock_reset</span>
                                    {t("changePassword")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                    {t("editInfo")}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchProfile(); // Reset form data to database state
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading || uploadingAvatar}
                                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-base">save</span>
                                    {t("saveChanges")}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-8 grid grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN (3/12): Avatar & Quick Stats */}
                        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col items-center text-center space-y-5 md:border-r border-slate-100 md:pr-8 pt-4">
                            <div 
                                className={`relative group w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-blue-600/10 p-1 bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm ${isEditing ? 'cursor-pointer hover:ring-blue-600/20' : ''}`}
                                onClick={() => {
                                    if (isEditing) document.getElementById('profileAvatarInput').click();
                                }}
                            >
                                <img
                                    src={avatarPreview || "/default-avatar.png"}
                                    className={`w-full h-full object-cover rounded-2xl ${uploadingAvatar ? 'opacity-40' : ''}`}
                                    alt={t("avatarLabel")}
                                    onError={(e) => {
                                        e.target.src = "/default-avatar.png";
                                    }}
                                />
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 rounded-2xl">
                                        <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="profileAvatarInput"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            
                            <div className="space-y-2 w-full">
                                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                                    {profile?.fullName || t("notUpdated")}
                                </h2>
                                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-slate-50 py-1 px-3 rounded-lg inline-block border border-slate-200/50">
                                    {profile?.code || t("noCodeAssigned")}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 w-full pt-2">
                                <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                                    <span className="text-slate-400 font-medium">{t("role")}:</span>
                                    {getRoleBadge(profile?.roleName)}
                                </div>
                                <div className="flex justify-between items-center text-xs py-1.5">
                                    <span className="text-slate-400 font-medium">{t("status")}:</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-150">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t("active")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (9/12): Forms / Details */}
                        <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-8 md:pl-4 pt-2">
                            {/* SECTION 1: Personal Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-l-[3px] border-blue-900 pl-3 py-0.5">
                                    {t("profileInfo")}
                                </h3>
                                
                                {!isEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("fullName")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">person</span>
                                                {profile?.fullName || t("notUpdated")}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("dob")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_month</span>
                                                {formatDob(profile?.dob)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("gender")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                    {profile?.gender === "MALE" || profile?.gender === "Nam" ? "male" : profile?.gender === "FEMALE" || profile?.gender === "Nữ" ? "female" : "wc"}
                                                </span>
                                                {getGenderLabel(profile?.gender)}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("nationality")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">public</span>
                                                {profile?.nationality || (getLanguage() === 'vi' ? "Việt Nam" : "Vietnam")}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-inner shadow-slate-100">
                                        {/* Họ và tên */}
                                        <div className="space-y-1">
                                            <FormInput
                                                label={t("fullName")}
                                                id="profileFullName"
                                                placeholder={t("fullNamePlaceholder")}
                                                value={formData.fullName}
                                                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                                                hasError={!!errors.fullName}
                                                leftIcon={<span className="material-symbols-outlined text-[18px]">person</span>}
                                            />
                                        </div>

                                        {/* Ngày sinh */}
                                        <div className="space-y-1">
                                            <FormInput
                                                label={t("dob")}
                                                id="profileDob"
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

                                        {/* Quốc tịch Autocomplete */}
                                        <div className="space-y-1 relative" id="profile-nationality-container">
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
                                                                className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-slate-50 text-slate-700 ${formData.nationality === country.name ? 'bg-blue-50 text-blue-900 font-semibold' : ''}`}
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
                                )}
                            </div>

                            {/* SECTION 2: Contact Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-l-[3px] border-blue-900 pl-3 py-0.5">
                                    {t("contactInfo")}
                                </h3>
                                
                                {!isEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("username")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">alternate_email</span>
                                                <span className="font-mono">{profile?.username}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("email")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                                <a href={`mailto:${profile?.email}`} className="hover:text-blue-600 transition-colors">
                                                    {profile?.email}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("phone")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                                                <a href={`tel:${profile?.phone}`} className="hover:text-blue-600 transition-colors">
                                                    {profile?.phone}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("address")}</span>
                                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mt-1">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">home</span>
                                                {profile?.address || t("notUpdated")}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-inner shadow-slate-100">
                                        {/* Tên đăng nhập (Khóa cứng không đổi) */}
                                        <div className="space-y-1">
                                            <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                                                {t("username")}
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={profile?.username}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-500 font-mono outline-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1">
                                            <FormInput
                                                label={t("email")}
                                                id="profileEmail"
                                                type="email"
                                                placeholder={t("emailPlaceholder")}
                                                value={formData.email}
                                                onChange={(e) => handleFieldChange("email", e.target.value)}
                                                hasError={!!errors.email}
                                                leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                                            />
                                        </div>

                                        {/* Số điện thoại */}
                                        <div className="space-y-1">
                                            <FormInput
                                                label={t("phone")}
                                                id="profilePhone"
                                                placeholder={t("phonePlaceholder")}
                                                value={formData.phone}
                                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                                hasError={!!errors.phone}
                                                leftIcon={<span className="material-symbols-outlined text-[18px]">call</span>}
                                            />
                                        </div>

                                        {/* Địa chỉ */}
                                        <div className="space-y-1">
                                            <FormInput
                                                label={t("address")}
                                                id="profileAddress"
                                                placeholder={t("addressPlaceholder")}
                                                value={formData.address}
                                                onChange={(e) => handleFieldChange("address", e.target.value)}
                                                hasError={!!errors.address}
                                                leftIcon={<span className="material-symbols-outlined text-[18px]">home</span>}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>

            {/* MODAL: CHANGE PASSWORD */}
            <Modal
                isOpen={passwordModal.isOpen}
                onClose={() => {
                    setPasswordModal({ isOpen: false, currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                }}
                title={t("changePassword")}
            >
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-5">
                    {/* Current Password */}
                    <FormInput
                        label={t("currentPassword")}
                        id="currentPassword"
                        type="password"
                        placeholder={t("currentPasswordPlaceholder")}
                        value={passwordModal.currentPassword}
                        onChange={(e) => setPasswordModal(prev => ({ ...prev, currentPassword: e.target.value }))}
                        hasError={!!passwordErrors.currentPassword}
                        leftIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                    />
                    {passwordErrors.currentPassword && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{passwordErrors.currentPassword}</p>}

                    {/* New Password */}
                    <FormInput
                        label={t("newPassword")}
                        id="newPassword"
                        type="password"
                        placeholder={t("newPasswordPlaceholder")}
                        value={passwordModal.newPassword}
                        onChange={(e) => setPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
                        hasError={!!passwordErrors.newPassword}
                        leftIcon={<span className="material-symbols-outlined text-[18px]">lock_open</span>}
                    />
                    {passwordErrors.newPassword && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{passwordErrors.newPassword}</p>}

                    {/* Confirm Password */}
                    <FormInput
                        label={t("confirmNewPassword")}
                        id="confirmPassword"
                        type="password"
                        placeholder={t("confirmNewPasswordPlaceholder")}
                        value={passwordModal.confirmPassword}
                        onChange={(e) => setPasswordModal(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        hasError={!!passwordErrors.confirmPassword}
                        leftIcon={<span className="material-symbols-outlined text-[18px]">vpn_key</span>}
                    />
                    {passwordErrors.confirmPassword && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{passwordErrors.confirmPassword}</p>}

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                setPasswordModal({ isOpen: false, currentPassword: '', newPassword: '', confirmPassword: '' });
                                setPasswordErrors({});
                            }}
                            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={passwordSubmitting}
                            className="px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-md shadow-indigo-600/15 disabled:opacity-50"
                        >
                            {passwordSubmitting ? t("processing") : t("save")}
                        </button>
                    </div>
                </form>
            </Modal>

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
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    );
};

export default ProfilePage;
