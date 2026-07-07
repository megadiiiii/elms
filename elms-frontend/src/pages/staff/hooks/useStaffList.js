import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

// Local Module-specific Constants
export const DEFAULT_PAGE_SIZE = 5;
export const ROLE_LIST = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "TEACHER" },
  { id: 3, name: "TA" }
];

export const useStaffList = () => {
  const navigate = useNavigate();

  // Page lists and paginator states
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState(ROLE_LIST);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
  
  // Dashboard counters state
  const [stats, setStats] = useState({
    totalStaffs: 0,
    totalAdmins: 0,
    totalTeachers: 0,
    totalTAs: 0,
  });

  const [loading, setLoading] = useState(true);
  
  // Toast alert state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Action confirmations state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // "reset" | "toggle"
    title: "",
    message: "",
    actionId: null,
    extraData: null,
  });

  // Load list and statistics from REST endpoint
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const pageNum = currentPage;
      let url = `/admin/users?page=${pageNum}&size=${pageSize}`;
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (selectedRoleFilter) {
        url += `&roleId=${selectedRoleFilter}`;
      }

      const response = await axiosClient.get(url);
      const data = response.data;
      
      if (data.staffsPage) {
        setStaffList(data.staffsPage.content || []);
        setTotalPages(data.staffsPage.totalPages || 1);
        setTotalElements(data.staffsPage.totalElements || 0);
      }
      
      if (data.roles) {
        setRolesList(data.roles);
      }
      
      setStats({
        totalStaffs: data.totalStaffs || 0,
        totalAdmins: data.totalAdmins || 0,
        totalTeachers: data.totalTeachers || 0,
        totalTAs: data.totalTAs || 0,
      });
    } catch (error) {
      showToast(t("loadStaffsError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const isMounted = useRef(false);

  // Monitor filter changes and reset to page 1 to prevent out-of-bounds error
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchStaffData();
      return;
    }

    if (currentPage === 1) {
      fetchStaffData();
    } else {
      setCurrentPage(1);
    }
  }, [selectedRoleFilter]);

  // Monitor page changes
  useEffect(() => {
    if (currentPage !== 1) {
      fetchStaffData();
    }
  }, [currentPage]);

  // Check for success messages from creation or edit pages
  useEffect(() => {
    const successMsg = sessionStorage.getItem("staff_success_message");
    if (successMsg) {
      showToast(successMsg, "success");
      sessionStorage.removeItem("staff_success_message");
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStaffData();
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Navigations to form page
  const handleAddClick = () => {
    navigate("/admin/users/create");
  };

  const handleEditClick = (id) => {
    navigate(`/admin/users/edit/${id}`);
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/users/detail/${id}`);
  };

  const triggerResetPassword = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: "reset",
      title: t("resetPasswordConfirmTitle"),
      message: t("resetPasswordConfirmMessage").replace("{name}", name),
      actionId: id,
    });
  };

  const handleResetPassword = async (id) => {
    try {
      const response = await axiosClient.post(`/admin/users/reset-password/${id}`);
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
      const response = await axiosClient.post(`/admin/users/toggle-status/${id}`);
      showToast(response.data?.message || t("toggleStatusSuccess"), "success");
      closeConfirmModal();
      fetchStaffData();
    } catch (error) {
      showToast(error.response?.data?.message || t("toggleStatusError"), "error");
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", title: "", message: "", actionId: null });
  };

  return {
    staffList,
    rolesList,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    selectedRoleFilter,
    setSelectedRoleFilter,
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
