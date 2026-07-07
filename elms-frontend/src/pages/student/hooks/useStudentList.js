import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

export const DEFAULT_PAGE_SIZE = 5;

export const useStudentList = () => {
  const navigate = useNavigate();

  const [studentList, setStudentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // "reset" | "toggle"
    title: "",
    message: "",
    actionId: null,
    extraData: null,
  });

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const pageNum = currentPage;
      let url = `/admin/students?page=${pageNum}&size=${pageSize}`;
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await axiosClient.get(url);
      const data = response.data;
      
      if (data.studentsPage) {
        setStudentList(data.studentsPage.content || []);
        setTotalPages(data.studentsPage.totalPages || 1);
        setTotalElements(data.studentsPage.totalElements || 0);
      }
      
      setStats({
        totalStudents: data.totalStudents || 0,
        activeStudents: data.activeStudents || 0,
        inactiveStudents: data.inactiveStudents || 0,
      });
    } catch (error) {
      showToast(t("loadStudentsError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchStudentData();
      return;
    }
    fetchStudentData();
  }, [currentPage]);

  useEffect(() => {
    const successMsg = sessionStorage.getItem("student_success_message");
    if (successMsg) {
      showToast(successMsg, "success");
      sessionStorage.removeItem("student_success_message");
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (currentPage === 1) {
      fetchStudentData();
    } else {
      setCurrentPage(1);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleAddClick = () => {
    navigate("/admin/students/create");
  };

  const handleEditClick = (id) => {
    navigate(`/admin/students/edit/${id}`);
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/students/detail/${id}`);
  };

  const triggerResetPassword = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: "reset",
      title: t("resetPasswordConfirmTitle"),
      message: t("resetPasswordConfirmMessageStudent").replace("{name}", name),
      actionId: id,
    });
  };

  const handleResetPassword = async (id) => {
    try {
      const response = await axiosClient.post(`/admin/students/reset-password/${id}`);
      showToast(response.data?.message || t("resetPasswordSuccess"), "success");
      closeConfirmModal();
    } catch (error) {
      showToast(error.response?.data?.message || t("resetPasswordError"), "error");
    }
  };

  const triggerToggleStatus = (id, name, status) => {
    const actionVal = status === "ACTIVE" ? t("lock") : t("unlock");
    const actionValLower = status === "ACTIVE" ? t("lockLower") : t("unlockLower");
    setConfirmModal({
      isOpen: true,
      type: "toggle",
      title: t("confirmAccountAction").replace("{action}", actionVal),
      message: t("confirmToggleStatusMessage").replace("{action}", actionValLower).replace("{name}", name),
      actionId: id,
      extraData: status,
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axiosClient.post(`/admin/students/toggle-status/${id}`);
      showToast(response.data?.message || t("toggleStatusSuccess"), "success");
      closeConfirmModal();
      fetchStudentData();
    } catch (error) {
      showToast(error.response?.data?.message || t("toggleStatusError"), "error");
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", title: "", message: "", actionId: null });
  };

  return {
    studentList,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    stats,
    loading,
    toast,
    handleCloseToast,
    confirmModal,
    closeConfirmModal,
    handleSearchSubmit,
    handleAddClick,
    handleEditClick,
    handleViewDetail,
    triggerResetPassword,
    handleResetPassword,
    triggerToggleStatus,
    handleToggleStatus,
  };
};
