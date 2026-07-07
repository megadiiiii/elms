import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

// Local Module-specific Constants
export const DEFAULT_PAGE_SIZE = 5;
export const CLASS_STATUS = {
  ALL: "ALL",
  UPCOMING: "UPCOMING",
  ONGOING: "ONGOING",
  FINISHED: "FINISHED",
  CANCELLED: "CANCELLED"
};

export const useClassList = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";

  // List and Pagination state
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(CLASS_STATUS.ALL);
  const [courseFilter, setCourseFilter] = useState("");

  // Dropdown list for course filter
  const [coursesList, setCoursesList] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    ongoingClasses: 0,
    finishedClasses: 0,
    cancelledClasses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    actionId: null,
  });

  // Fetch classes list with pagination & filters
  const fetchClasses = async () => {
    setLoading(true);
    try {
      let url = `/classes?page=${currentPage}&size=${pageSize}`;
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (statusFilter !== CLASS_STATUS.ALL) {
        url += `&status=${statusFilter}`;
      }
      if (courseFilter) {
        url += `&courseId=${courseFilter}`;
      }

      const response = await axiosClient.get(url);
      const data = response.data;

      if (data.classesPage) {
        setClasses(data.classesPage.content || []);
        setTotalPages(data.classesPage.totalPages || 1);
        setTotalElements(data.classesPage.totalElements || 0);
      }

      setStats({
        totalClasses: data.totalClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        ongoingClasses: data.ongoingClasses || 0,
        finishedClasses: data.finishedClasses || 0,
        cancelledClasses: data.cancelledClasses || 0,
      });
    } catch (error) {
      showToast(t("loadClassesError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown courses list for filter
  const fetchDropdownData = async () => {
    try {
      const courseRes = await axiosClient.get("/courses?size=1000&status=ACTIVE");
      if (courseRes.data && courseRes.data.coursesPage) {
        setCoursesList(courseRes.data.coursesPage.content || []);
      }
    } catch (error) {
      // Fail silently
    }
  };

  const isMounted = useRef(false);

  // Monitor filter changes and reset to page 1 to prevent index/bound errors
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchDropdownData();
      fetchClasses();
      return;
    }

    if (currentPage === 1) {
      fetchClasses();
    } else {
      setCurrentPage(1);
    }
  }, [statusFilter, courseFilter]);

  // Monitor page change
  useEffect(() => {
    if (currentPage !== 1) {
      fetchClasses();
    }
  }, [currentPage]);

  // Display success message from page redirects
  useEffect(() => {
    const successMsg = sessionStorage.getItem("class_success_message");
    if (successMsg) {
      showToast(successMsg, "success");
      sessionStorage.removeItem("class_success_message");
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchClasses();
  };

  // Navigate to class creation page
  const handleAddClick = () => {
    navigate("/classes/create");
  };

  // Navigate to class editing page
  const handleEditClick = (cls) => {
    navigate(`/classes/edit/${cls.id}`);
  };

  // Open deletion modal
  const triggerDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      title: t("deleteClassConfirmTitle"),
      message: t("deleteClassConfirmText").replace("lớp học này", `"${name}"`).replace("this class", `"${name}"`),
      actionId: id,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: "", message: "", actionId: null });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await axiosClient.delete(`/classes/${id}`);
      showToast(res.data?.message || t("deleteClassSuccess"), "success");
      closeConfirmModal();
      fetchClasses();
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteClassError"), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    classes,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    coursesList,
    stats,
    loading,
    toast,
    handleCloseToast,
    confirmModal,
    closeConfirmModal,
    handleSearchSubmit,
    handleAddClick,
    handleEditClick,
    triggerDelete,
    handleDelete,
  };
};
