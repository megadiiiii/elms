import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import FormInput from "../../components/FormInput";
import Error403Page from "../Error403Page";
import { t } from "../../api/translation";

const ClassroomPage = () => {
  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";

  // Access Control: Only ADMINs can manage classrooms
  if (!isAdmin) {
    return <Error403Page />;
  }

  // List & Pagination State
  const [classrooms, setClassrooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Toast System
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // CRUD Modals
  const [formModal, setFormModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    name: "",
    capacity: 30,
    description: "",
    status: "ACTIVE",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    actionId: null,
  });

  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Fetch Classrooms List
  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      let url = `/classrooms?page=${currentPage}&size=${pageSize}`;
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const response = await axiosClient.get(url);
      const data = response.data;

      if (data.classroomsPage) {
        setClassrooms(data.classroomsPage.content || []);
        setTotalPages(data.classroomsPage.totalPages || 1);
        setTotalElements(data.classroomsPage.totalElements || 0);
      }
    } catch (error) {
      showToast(t("loadClassroomsError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClassrooms();
  };

  // Open Create Modal
  const handleAddClick = () => {
    setErrors({});
    setFormModal({
      isOpen: true,
      isEdit: false,
      id: null,
      name: "",
      capacity: 30,
      description: "",
      status: "ACTIVE",
    });
  };

  // Open Edit Modal
  const handleEditClick = (room) => {
    setErrors({});
    setFormModal({
      isOpen: true,
      isEdit: true,
      id: room.id,
      name: room.name || "",
      capacity: room.capacity || 30,
      description: room.description || "",
      status: room.status || "ACTIVE",
    });
  };

  // Trigger Delete Confirmation
  const triggerDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: t("deleteClassroomConfirmTitle"),
      message: t("deleteClassroomConfirmText").replace("phòng học này", `"${name}"`).replace("this classroom", `"${name}"`),
      actionId: id,
    });
  };

  // Delete Classroom Action
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axiosClient.delete(`/classrooms/${id}`);
      showToast(t("deleteClassroomSuccess"), "success");
      setConfirmModal({ isOpen: false, title: "", message: "", actionId: null });
      // Go back one page if we deleted the last item on current page
      if (classrooms.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchClassrooms();
      }
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteClassroomError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formModal.name.trim()) {
      errs.name = t("classroomNameRequired");
    }
    if (!formModal.capacity || formModal.capacity <= 0) {
      errs.capacity = t("classroomCapacityRequired");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      name: formModal.name.trim(),
      capacity: formModal.capacity,
      description: formModal.description.trim(),
      status: formModal.status,
    };

    try {
      if (formModal.isEdit) {
        await axiosClient.put(`/classrooms/${formModal.id}`, payload);
        showToast(t("updateClassroomSuccess"), "success");
      } else {
        await axiosClient.post("/classrooms", payload);
        showToast(t("createClassroomSuccess"), "success");
      }
      setFormModal((prev) => ({ ...prev, isOpen: false }));
      fetchClassrooms();
    } catch (error) {
      showToast(error.response?.data?.message || t("saveClassroomError"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainLayout title={t("classroomList")} description={t("classroomDesc")}>
        <div className="space-y-6 animate-fade-in">
          
          {/* Action and Search bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shrink-0">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder={t("searchClassroomPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-800 transition-all duration-200"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <div className="w-full sm:w-48 group">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 font-bold text-slate-700 transition-all duration-200 cursor-pointer"
                >
                  <option value="ALL">{t("allStatus")}</option>
                  <option value="ACTIVE">{t("activeRoom")}</option>
                  <option value="INACTIVE">{t("inactiveRoom")}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-blue-600/15 uppercase tracking-wider self-start md:self-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              {t("createClassroom")}
            </button>
          </div>

          {/* Table display */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">
                    <th className="p-4 pl-6 text-center w-16">{t("stt")}</th>
                    <th className="p-4 w-[25%]">{t("roomName")}</th>
                    <th className="p-4 w-[15%] text-center">{t("capacity")}</th>
                    <th className="p-4 w-[35%]">{t("roomDesc")}</th>
                    <th className="p-4 w-[12%]">{t("status")}</th>
                    <th className="p-4 pr-6 text-right w-[13%]">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-slate-400 font-bold">{t("loading")}</span>
                        </div>
                      </td>
                    </tr>
                  ) : classrooms.length > 0 ? (
                    classrooms.map((room, index) => {
                      const itemIndex = (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr key={room.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 w-16">
                            {itemIndex}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-indigo-500 text-lg">meeting_room</span>
                              <span className="font-extrabold text-slate-800 text-sm">{room.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-black text-sm text-slate-650">
                            {room.capacity}
                          </td>
                          <td className="p-4 text-xs font-medium text-slate-500 max-w-sm truncate">
                            {room.description || <span className="text-slate-350 italic">--</span>}
                          </td>
                          <td className="p-4">
                            {room.status === "ACTIVE" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-150">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span> {t("activeRoom")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span> {t("inactiveRoom")}
                              </span>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-right w-[120px]">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEditClick(room)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                                title={t("edit")}
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => triggerDelete(room.id, room.name)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                title={t("delete")}
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-center max-w-xs mx-auto">
                          <span className="material-symbols-outlined text-4xl text-slate-350">meeting_room</span>
                          <p className="text-sm font-bold text-slate-700">{t("noClassroomsFound")}</p>
                          <p className="text-xs text-slate-400">{t("noClassroomsFoundDesc")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination component */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
                <span>
                  {t("showingPage")} {currentPage}/{totalPages} ({totalElements} {t("classroomUnit")})
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="p-2 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-500 hover:text-slate-700 bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97] transition-all"
                  >
                    <span className="material-symbols-outlined text-sm block">chevron_left</span>
                  </button>
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="p-2 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-500 hover:text-slate-700 bg-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97] transition-all"
                  >
                    <span className="material-symbols-outlined text-sm block">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>

      {/* CREATE & EDIT MODAL */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
        title={formModal.isEdit ? t("updateClassroom") : t("createClassroom")}
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Room Name */}
          <FormInput
            label={t("roomName")}
            id="roomName"
            placeholder={t("roomPlaceholder")}
            value={formModal.name}
            onChange={(e) => setFormModal((prev) => ({ ...prev, name: e.target.value }))}
            hasError={!!errors.name}
            leftIcon={<span className="material-symbols-outlined text-[18px]">meeting_room</span>}
          />
          {errors.name && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{errors.name}</p>}

          {/* Capacity */}
          <FormInput
            label={t("capacity")}
            id="capacity"
            type="number"
            placeholder="e.g. 30"
            value={formModal.capacity}
            onChange={(e) => setFormModal((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            hasError={!!errors.capacity}
            leftIcon={<span className="material-symbols-outlined text-[18px]">groups</span>}
          />
          {errors.capacity && <p className="text-xs text-rose-500 font-bold -mt-3 pl-1">{errors.capacity}</p>}

          {/* Room Status */}
          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
              {t("status")}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
              </div>
              <select
                value={formModal.status}
                onChange={(e) => setFormModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer font-bold"
              >
                <option value="ACTIVE">{t("activeRoom")}</option>
                <option value="INACTIVE">{t("inactiveRoom")}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="font-bold uppercase tracking-wider text-slate-400 block mb-1 text-[10px]">
              {t("roomDesc")}
            </label>
            <div className="relative group">
              <textarea
                id="description"
                rows="3"
                placeholder={t("roomDesc")}
                value={formModal.description}
                onChange={(e) => setFormModal((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 font-medium transition-all duration-200 resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-md shadow-indigo-600/15"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETION MODAL */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: "", message: "", actionId: null })}
        title={confirmModal.title}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 leading-relaxed">{confirmModal.message}</p>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", actionId: null })}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              onClick={() => handleDelete(confirmModal.actionId)}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
            >
              {t("confirmDelete")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast alert system */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </>
  );
};

export default ClassroomPage;
