import React from 'react';
import MainLayout from '../../components/MainLayout';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { t } from '../../api/translation';

// Import local components
import CourseStats from './components/CourseStats';
import CourseSearchFilter from './components/CourseSearchFilter';
import CourseTable from './components/CourseTable';

import Error403Page from '../Error403Page';

// Import local Hook
import { useCourseList } from './hooks/useCourseList';

const CoursePage = () => {
    const role = localStorage.getItem("role") || "STUDENT";
    if (role === "STUDENT") {
        return <Error403Page />;
    }

    const {
        isAdmin,
        formatSchedule,
        formatStaffName,
        courses,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        pageSize,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        stats,
        loading,
        toast,
        handleCloseToast,
        formModal,
        setFormModal,
        confirmModal,
        setConfirmModal,
        classesModal,
        setClassesModal,
        editingRoomClassId,
        setEditingRoomClassId,
        tempRoomName,
        setTempRoomName,
        classroomsList,
        classDeleteConfirm,
        setClassDeleteConfirm,
        errors,
        handleSearchSubmit,
        handleAddClick,
        handleEditClick,
        handleFormSubmit,
        triggerToggleStatus,
        handleToggleStatus,
        triggerDelete,
        handleDelete,
        handleRowClick,
        handleSaveClassroom,
        triggerDeleteClass,
        handleDeleteClass,
        navigate,
    } = useCourseList();

    return (
        <>
            <MainLayout
                title={t('courseList')}
                description={t('courseDesc')}
            >
                <div className="space-y-6 animate-fade-in">
                    {/* 1. THỐNG KÊ (STATS OVERVIEW) */}
                    <CourseStats stats={stats} />

                    {/* 2. BỘ LỌC VÀ TÌM KIẾM */}
                    <CourseSearchFilter
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        onSearch={handleSearchSubmit}
                        onAddClick={handleAddClick}
                        isAdmin={isAdmin}
                    />

                    {/* 3. BẢNG HIỂN THỊ (TABLE) */}
                    <CourseTable
                        courses={courses}
                        loading={loading}
                        onEdit={handleEditClick}
                        onToggleStatus={triggerToggleStatus}
                        onDelete={triggerDelete}
                        onRowClick={handleRowClick}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        setCurrentPage={setCurrentPage}
                        pageSize={pageSize}
                        isAdmin={isAdmin}
                    />
                </div>
            </MainLayout>

            {/* MODAL: CREATE / EDIT COURSE */}
            <Modal
                isOpen={formModal.isOpen}
                onClose={() => setFormModal(prev => ({ ...prev, isOpen: false }))}
                title={formModal.isEdit ? t('updateCourse') : t('createCourse')}
            >
                <form onSubmit={handleFormSubmit} className="space-y-5">
                    {/* Course Code */}
                    <FormInput
                        label={t('courseCodeLabel')}
                        id="courseCode"
                        placeholder={t('courseCodePlaceholder')}
                        value={formModal.courseCode}
                        onChange={(e) => setFormModal(prev => ({ ...prev, courseCode: e.target.value }))}
                        hasError={!!errors.courseCode}
                        leftIcon={<span className="material-symbols-outlined text-[18px]">badge</span>}
                    />
                    {errors.courseCode && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{errors.courseCode}</p>}

                    {/* Course Name */}
                    <FormInput
                        label={t('courseNameLabel')}
                        id="courseName"
                        placeholder={t('courseNamePlaceholder')}
                        value={formModal.courseName}
                        onChange={(e) => setFormModal(prev => ({ ...prev, courseName: e.target.value }))}
                        hasError={!!errors.courseName}
                        leftIcon={<span className="material-symbols-outlined text-[18px]">menu_book</span>}
                    />
                    {errors.courseName && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{errors.courseName}</p>}

                    {/* Course Status */}
                    {formModal.isEdit && (
                        <div className="space-y-1">
                            <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
                                {t('status')}
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-scholarly-primary transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                                </div>
                                <select
                                    value={formModal.courseStatus}
                                    onChange={(e) => setFormModal(prev => ({ ...prev, courseStatus: e.target.value }))}
                                    className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer"
                                >
                                    <option value="ACTIVE">{t('activeCourse')}</option>
                                    <option value="INACTIVE">{t('inactiveCourse')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Submit Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setFormModal(prev => ({ ...prev, isOpen: false }))}
                            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-md shadow-indigo-600/15"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ACTION CONFIRMATION MODAL */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: "", title: "", message: "", actionId: null })}
                onConfirm={() => {
                    if (confirmModal.type === "delete") {
                        handleDelete(confirmModal.actionId);
                    } else if (confirmModal.type === "toggle") {
                        handleToggleStatus(confirmModal.actionId);
                    }
                }}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={t('confirm')}
            />

            {/* MODAL: VIEW CLASSES LINKED TO COURSE */}
            <Modal
                isOpen={classesModal.isOpen}
                onClose={() => {
                    setEditingRoomClassId(null);
                    setClassesModal(prev => ({ ...prev, isOpen: false }));
                }}
                title={`${t('courseClassesTitle')}: ${classesModal.courseName}`}
                size="xl"
            >
                <div className="space-y-4">
                    {classesModal.loading ? (
                        <LoadingSpinner />
                    ) : classesModal.classes.length > 0 ? (
                        <>
                            {isAdmin && (
                                <div className="flex justify-end shrink-0">
                                    <button
                                        onClick={() => {
                                            setClassesModal(prev => ({ ...prev, isOpen: false }));
                                            navigate(`/classes/create?courseId=${classesModal.courseId}`);
                                        }}
                                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm uppercase tracking-wider"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add_box</span>
                                        {t("createClass")}
                                    </button>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">
                                                <th className="w-[5%] p-3 pl-4 text-center">{t("stt")}</th>
                                                <th className="w-[10%] p-3 ">{t("classCode")}</th>
                                                <th className="w-[15%] p-3 ">{t("className")}</th>
                                                <th className="w-[15%] p-3 ">{t("roomLocation")}</th>
                                                <th className="w-[15%] p-3 ">{t("teacherInCharge")}</th>
                                                <th className="w-[10%] p-3 text-center ">{t("studentsCount")}</th>
                                                <th className="w-[15%] p-3 text-center ">{t("schedule")}</th>
                                                <th className="w-[10%] p-3 ">{t("status")}</th>
                                                {isAdmin && <th className="p-3 pr-4 text-right w-[5%]">{t("actions")}</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {classesModal.classes.map((cls, index) => {
                                                const isEditingRoom = editingRoomClassId === cls.id;

                                                return (
                                                    <tr key={cls.id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="p-3 pl-4 text-center font-bold text-slate-400">{index + 1}</td>
                                                        <td className="p-3 font-mono font-black text-blue-700 uppercase">{cls.classCode}</td>
                                                        <td className="p-3 font-bold text-slate-800">{cls.className}</td>
                                                        
                                                        {/* Classroom Column */}
                                                        <td className="p-3">
                                                            {isEditingRoom ? (
                                                                <div className="flex items-center gap-1">
                                                                    <input
                                                                        list="rooms-list-inline"
                                                                        type="text"
                                                                        value={tempRoomName}
                                                                        onChange={(e) => setTempRoomName(e.target.value)}
                                                                        className="px-2 py-1 text-xs border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 w-24 bg-white font-medium text-slate-800"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSaveClassroom(cls.id, cls.maxStudents)}
                                                                        className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors cursor-pointer flex items-center justify-center"
                                                                        title={t("save")}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingRoomClassId(null)}
                                                                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer flex items-center justify-center"
                                                                        title={t("cancel")}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[14px] font-bold">close</span>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 group">
                                                                    {cls.room ? (
                                                                        <span className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100 font-semibold">{cls.room}</span>
                                                                    ) : (
                                                                        <span className="text-slate-355 italic">--</span>
                                                                    )}
                                                                    {isAdmin && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingRoomClassId(cls.id);
                                                                                setTempRoomName(cls.room || "");
                                                                            }}
                                                                            className="p-0.5 rounded text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                                                                            title={t("edit")}
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        
                                                        {/* Teacher / TA Column */}
                                                        <td className="p-3 text-[10px] text-slate-500 space-y-0.5">
                                                            <div><span className="font-bold text-slate-400">{t("roleTeacher") === "Teacher" ? "T" : "GV"}:</span> <span className="font-bold text-slate-700">{formatStaffName(cls.teacherName)}</span></div>
                                                            <div><span className="font-bold text-slate-400">{t("roleTa")}:</span> <span className="font-bold text-slate-700">{formatStaffName(cls.taName)}</span></div>
                                                        </td>
                                                        
                                                        {/* Students count */}
                                                        <td className="p-3 text-center font-black text-slate-650">{cls.currentStudents}/{cls.maxStudents}</td>
                                                        
                                                        {/* Schedule Column */}
                                                        <td className="p-3 text-center">
                                                            {cls.scheduleSummary && cls.scheduleSummary !== "Chưa có lịch" && cls.scheduleSummary !== "Chưa xếp lịch" ? (
                                                                <span className="font-bold text-slate-700 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 inline-block transition-colors duration-300">{formatSchedule(cls.scheduleSummary)}</span>
                                                            ) : (
                                                                <span className="text-slate-400 italic font-bold">{t("notScheduled")}</span>
                                                            )}
                                                        </td>
                                                        
                                                        <td className="p-3">
                                                            <StatusBadge type="class" value={cls.status} />
                                                        </td>
                                                        
                                                        {/* Actions Column */}
                                                        {isAdmin && (
                                                            <td className="p-3 pr-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setClassesModal(prev => ({ ...prev, isOpen: false }));
                                                                            navigate(`/classes/edit/${cls.id}`);
                                                                        }}
                                                                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
                                                                        title={t("edit")}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => triggerDeleteClass(cls.id, cls.className)}
                                                                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center justify-center"
                                                                        title={t("delete")}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Rooms list datalist for inline search suggestions */}
                            <datalist id="rooms-list-inline">
                                {classroomsList.map(room => (
                                    <option key={room.id} value={room.name} />
                                ))}
                            </datalist>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center max-w-xs mx-auto">
                            <span className="material-symbols-outlined text-4xl text-slate-355">groups</span>
                            <p className="text-sm font-bold text-slate-700">{t("noCourseClasses")}</p>
                            <p className="text-xs text-slate-400">{t("noCourseClassesDesc")}</p>
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setClassesModal(prev => ({ ...prev, isOpen: false }));
                                        navigate(`/classes/create?courseId=${classesModal.courseId}`);
                                    }}
                                    className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm uppercase tracking-wider"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                                    {t("createClass")}
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                            onClick={() => {
                                setEditingRoomClassId(null);
                                setClassesModal(prev => ({ ...prev, isOpen: false }));
                            }}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                        >
                            {t("close")}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* CONFIRM CLASS DELETION MODAL */}
            <ConfirmModal
                isOpen={classDeleteConfirm.isOpen}
                onClose={() => setClassDeleteConfirm({ isOpen: false, classId: null, className: "" })}
                onConfirm={handleDeleteClass}
                title={t("deleteClassConfirmTitle")}
                message={t("deleteClassConfirmText").replace("lớp học này", `"${classDeleteConfirm.className}"`).replace("this class", `"${classDeleteConfirm.className}"`)}
                confirmText={t("confirmDelete")}
            />

            {/* TOAST SYSTEM */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={handleCloseToast}
            />
        </>
    );
};

export default CoursePage;
