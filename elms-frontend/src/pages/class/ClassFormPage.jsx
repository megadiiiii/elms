import React, { useState, useEffect } from "react";
import MainLayout from "../../components/MainLayout";
import FormInput from "../../components/FormInput";
import Toast from "../../components/Toast";
import Error403Page from "../Error403Page";
import { t } from "../../api/translation";
import { useClassForm } from "./hooks/useClassForm";
import BackButton from "../../components/BackButton";
import LoadingSpinner from "../../components/LoadingSpinner";

const AutocompleteSelect = ({
  label,
  placeholder,
  items,
  value,
  onChange,
  leftIcon,
  allowCustomText = false,
  customValue = "",
  onCustomChange,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    if (allowCustomText) {
      setSearchQuery(customValue || "");
    } else {
      const selectedItem = items.find(item => String(item.id) === String(value));
      setSearchQuery(selectedItem ? selectedItem.label : "");
    }
  }, [value, customValue, items, allowCustomText]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!allowCustomText) {
          const selectedItem = items.find(item => String(item.id) === String(value));
          setSearchQuery(selectedItem ? selectedItem.label : "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, items, allowCustomText]);

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      (item.sublabel && item.sublabel.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item) => {
    if (allowCustomText) {
      onCustomChange(item.label);
    } else {
      onChange(item.id);
    }
    setSearchQuery(item.label);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);
    if (allowCustomText) {
      onCustomChange(val);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchQuery("");
    if (allowCustomText) {
      onCustomChange("");
    } else {
      onChange("");
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative w-full" ref={dropdownRef}>
      {label && (
        <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={`w-full bg-white border rounded-xl pl-11 pr-10 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium outline-none transition-all duration-200 ${
            error ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200"
          }`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 animate-scale-up">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`px-4 py-2 text-xs font-semibold hover:bg-indigo-50/50 hover:text-indigo-750 cursor-pointer flex flex-col transition-colors ${
                  (!allowCustomText && String(item.id) === String(value)) || (allowCustomText && item.label === customValue)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700"
                }`}
              >
                <span>{item.label}</span>
                {item.sublabel && (
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.sublabel}</span>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-xs text-slate-400 italic font-medium">
              {allowCustomText ? (
                <div 
                  onClick={() => setIsOpen(false)}
                  className="hover:text-indigo-600 cursor-pointer"
                >
                  Sử dụng: "{searchQuery}"
                </div>
              ) : (
                t("noData")
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ClassFormPage = () => {
  const role = localStorage.getItem("role") || "STUDENT";
  if (role === "STUDENT") {
    return <Error403Page />;
  }

  const {
    isAdmin,
    isEditMode,
    formData,
    newSchedule,
    setNewSchedule,
    errors,
    loading,
    fetchingDetails,
    toast,
    handleCloseToast,
    showTooltip,
    setShowTooltip,
    coursesList,
    handleFieldChange,
    handleAddSchedule,
    handleRemoveSchedule,
    handleSubmit,
    getExpectedEndDate,
    teacherAutocompleteItems,
    taAutocompleteItems,
    roomAutocompleteItems,
    navigate,
  } = useClassForm();

  // Fail-safe redirect if not admin
  if (!isAdmin) {
    return <Error403Page />;
  }

  return (
    <MainLayout
      title={isEditMode ? t("updateClass") : t("createClass")}
      description={
        isEditMode
          ? t("editClassDesc")
          : t("createClassDesc")
      }
    >
      <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
        {/* Top Header Actions */}
        <BackButton to="/classes" text={t("backToList")} />

        {fetchingDetails ? (
          <LoadingSpinner message={t("loadClassDetailsError")} />
        ) : (
          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-12 gap-8 items-start bg-white">
            {/* LEFT SIDEBAR (4/12): Info Summary */}
            <div className="col-span-12 lg:col-span-4 space-y-5 lg:border-r border-slate-100 lg:pr-8 pt-2">
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider">{t("summaryInfo")}</h4>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("classCode").toUpperCase()}:</span>
                    <span className="font-mono font-black text-blue-700">{formData.classCode || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("className").toUpperCase()}:</span>
                    <span className="font-bold text-slate-800">{formData.className || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("maxStudents").toUpperCase()}:</span>
                    <span className="font-bold text-slate-800">{formData.maxStudents} {t("studentsUnit")}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("room").toUpperCase()}:</span>
                    <span className="font-bold text-slate-800">{formData.room || "--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("startDate").toUpperCase()}:</span>
                    <span className="font-bold text-slate-800">
                      {formData.startDate
                        ? new Date(formData.startDate).toLocaleDateString(localStorage.getItem("lang") === "en" ? "en-US" : "vi-VN")
                        : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-400">{t("expectedEndDate").toUpperCase()}:</span>
                    <span className="font-bold text-emerald-700">
                      {getExpectedEndDate() || "--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">{t("status").toUpperCase()}:</span>
                    <span className="font-bold text-indigo-600">
                      {formData.status === "UPCOMING"
                        ? t("upcoming")
                        : formData.status === "ONGOING"
                        ? t("ongoing")
                        : formData.status === "FINISHED"
                        ? t("finished")
                        : t("cancelled")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lịch học dự kiến preview */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-lg">calendar_month</span>
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">{t("schedulePreview")}</h4>
                </div>
                {formData.schedules && formData.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {formData.schedules.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md">
                            {s.dayOfWeek === 8 ? t("day8Short") : t(`day${s.dayOfWeek}Short`)}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(idx)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
                          title={t("delete")}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">event_busy</span>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">{t("noSchedule")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT FORM (8/12): Inputs */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-base font-black text-slate-800 tracking-tight">{t("configDetails")}</h3>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    {t("setupGuide")}
                  </button>
                  {showTooltip && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-amber-50/95 backdrop-blur border border-amber-200 rounded-2xl p-4 shadow-xl z-50 animate-fade-in text-left">
                      <h5 className="text-[11px] font-black uppercase text-amber-800 tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">lightbulb</span> {t("setupNotes")}
                      </h5>
                      <ul className="text-[10px] text-amber-705/90 font-bold space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>{t("tip1")}</li>
                        <li>{t("tip2")}</li>
                        <li>{t("tip3")}</li>
                        <li>{t("tip4")}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 1: Thông tin cơ bản */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-indigo-500">info</span>
                  {t("basicInfoGroup")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label={t("classCode") + " *"}
                    id="classCode"
                    placeholder={t("classCodePlaceholder")}
                    value={formData.classCode}
                    onChange={(e) => handleFieldChange("classCode", e.target.value)}
                    hasError={!!errors.classCode}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">badge</span>}
                  />
                  <FormInput
                    label={t("className") + " *"}
                    id="className"
                    placeholder={t("classNamePlaceholder")}
                    value={formData.className}
                    onChange={(e) => handleFieldChange("className", e.target.value)}
                    hasError={!!errors.className}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">class</span>}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mt-4">
                  {errors.classCode && <p className="text-xs text-rose-500 font-bold pl-1">{errors.classCode}</p>}
                  {errors.className && <p className="text-xs text-rose-500 font-bold pl-1">{errors.className}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                      {t("courseLinked")} *
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </div>
                      <select
                        value={formData.courseId}
                        onChange={(e) => handleFieldChange("courseId", e.target.value)}
                        className={`w-full bg-white border rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer ${
                          errors.courseId ? "border-red-500 ring-2 ring-red-500/10" : "border-slate-200"
                        }`}
                      >
                        <option value="">{t("selectCourse")}</option>
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.courseCode} - {c.courseName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.courseId && <p className="text-xs text-rose-500 font-bold pl-1 mt-1">{errors.courseId}</p>}
                  </div>

                  <AutocompleteSelect
                    label={t("roomLocation")}
                    placeholder={t("roomPlaceholder")}
                    items={roomAutocompleteItems}
                    allowCustomText={true}
                    customValue={formData.room || ""}
                    onCustomChange={(val) => handleFieldChange("room", val)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">meeting_room</span>}
                  />
                </div>
              </div>

              {/* Group 2: Kế hoạch giảng dạy */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h4 className="text-[11px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-indigo-500">calendar_today</span>
                  {t("teachingPlanGroup")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormInput
                    label={t("startDate")}
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFieldChange("startDate", e.target.value)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">calendar_today</span>}
                  />
                  <FormInput
                    label={t("totalSessions")}
                    id="totalSessions"
                    type="number"
                    min="0"
                    value={formData.totalSessions}
                    onChange={(e) => handleFieldChange("totalSessions", e.target.value)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">format_list_numbered</span>}
                  />
                  <div className="space-y-1">
                    <FormInput
                      label={t("maxStudents") + " *"}
                      id="maxStudents"
                      type="number"
                      min="1"
                      value={formData.maxStudents}
                      onChange={(e) => handleFieldChange("maxStudents", e.target.value)}
                      hasError={!!errors.maxStudents}
                      leftIcon={<span className="material-symbols-outlined text-[18px]">group</span>}
                    />
                    {errors.maxStudents && <p className="text-xs text-rose-500 font-bold pl-1">{errors.maxStudents}</p>}
                  </div>
                </div>
              </div>

              {/* Group 3: Nhân sự phụ trách */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h4 className="text-[11px] font-black uppercase text-indigo-750 tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-indigo-500">school</span>
                  {t("staffInChargeGroup")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AutocompleteSelect
                    label={t("teacherInCharge")}
                    placeholder={t("teacherInCharge") || "Chọn giáo viên..."}
                    items={teacherAutocompleteItems}
                    value={formData.teacherId}
                    onChange={(val) => handleFieldChange("teacherId", val)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">school</span>}
                  />

                  <AutocompleteSelect
                    label={t("taAssistant")}
                    placeholder={t("taAssistant") || "Chọn trợ giảng..."}
                    items={taAutocompleteItems}
                    value={formData.taId}
                    onChange={(val) => handleFieldChange("taId", val)}
                    leftIcon={<span className="material-symbols-outlined text-[18px]">support_agent</span>}
                  />
                </div>

                {isEditMode && (
                  <div className="space-y-1 max-w-md pt-2">
                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                      {t("status")}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
                        <span className="material-symbols-outlined text-[18px]">toggle_off</span>
                      </div>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange("status", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer"
                      >
                        <option value="UPCOMING">{t("upcoming")}</option>
                        <option value="ONGOING">{t("ongoing")}</option>
                        <option value="FINISHED">{t("finished")}</option>
                        <option value="CANCELLED">{t("cancelled")}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Thiết lập lịch học */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-slate-700">schedule</span>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">{t("schedule")}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="sm:col-span-4 space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                      {t("dayOfWeek")}
                    </label>
                    <select
                      value={newSchedule.dayOfWeek}
                      onChange={(e) => setNewSchedule((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-bold outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="2">{t("day2")}</option>
                      <option value="3">{t("day3")}</option>
                      <option value="4">{t("day4")}</option>
                      <option value="5">{t("day5")}</option>
                      <option value="6">{t("day6")}</option>
                      <option value="7">{t("day7")}</option>
                      <option value="8">{t("day8")}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                      {t("startTime")}
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-bold outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                      {t("endTime")}
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        value={newSchedule.endTime}
                        onChange={(e) => setNewSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-bold outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddSchedule}
                      className="w-full px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 font-black text-xs rounded-xl transition-all border border-indigo-100/50 shadow-sm cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      {t("add")}
                    </button>
                  </div>
                </div>

                {/* Grid of added schedules for visual checking inside form */}
                {formData.schedules && formData.schedules.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {formData.schedules.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-indigo-50 border border-indigo-100/30 text-indigo-750 text-xs font-black rounded-lg">
                            {s.dayOfWeek === 8 ? t("day8Short") : t(`day${s.dayOfWeek}Short`)}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {s.startTime} - {s.endTime}
                            </p>
                            <p className="text-[9px] font-medium text-slate-400">{t("fixedSchedule")}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(idx)}
                          className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
                          title={t("delete")}
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/classes")}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-0"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-600/15 cursor-pointer active:scale-[0.98] transition-all"
                >
                  {loading ? t("processing") : isEditMode ? t("updateClass") : t("createClass")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </MainLayout>
  );
};

export default ClassFormPage;
