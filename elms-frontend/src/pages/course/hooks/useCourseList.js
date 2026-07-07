import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

// Local Module-specific Constants
export const DEFAULT_PAGE_SIZE = 5;
export const COURSE_STATUS = {
  ALL: "ALL",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE"
};

export const useCourseList = () => {
  const navigate = useNavigate();
  // Access control
  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";

  const translateDay = (day) => {
    switch (day) {
      case "T2": return t("day2Short");
      case "T3": return t("day3Short");
      case "T4": return t("day4Short");
      case "T5": return t("day5Short");
      case "T6": return t("day6Short");
      case "T7": return t("day7Short");
      case "CN": return t("day8Short");
      default: return day;
    }
  };

  const formatSchedule = (summary) => {
    if (!summary || summary === "Chưa có lịch" || summary === "Chưa xếp lịch") {
      return t("notScheduled");
    }
    return summary
      .replace(/\s*\([^)]*\)/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map(translateDay)
      .join(" ");
  };

  const formatStaffName = (name) => {
    return name === "Chưa phân công" || !name ? t("notAssigned") : name;
  };

  // List and Pagination state
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(COURSE_STATUS.ALL);

  // Counters state
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Modals
  const [formModal, setFormModal] = useState({
    isOpen: false,
    isEdit: false,
    id: null,
    courseCode: "",
    courseName: "",
    courseStatus: "ACTIVE"
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // "delete" | "toggle"
    title: "",
    message: "",
    actionId: null,
    extraData: null
  });

  const [classesModal, setClassesModal] = useState({
    isOpen: false,
    courseId: null,
    courseName: "",
    classes: [],
    loading: false
  });

  // Room / Classroom Inline Edit and List States
  const [editingRoomClassId, setEditingRoomClassId] = useState(null);
  const [tempRoomName, setTempRoomName] = useState("");
  const [classroomsList, setClassroomsList] = useState([]);

  // Class Deletion Confirmation state
  const [classDeleteConfirm, setClassDeleteConfirm] = useState({
    isOpen: false,
    classId: null,
    className: ""
  });

  const [errors, setErrors] = useState({});

  // Load courses and stats
  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = `/courses?page=${currentPage}&size=${pageSize}`;
      if (searchQuery.trim()) {
        url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (statusFilter !== COURSE_STATUS.ALL) {
        url += `&status=${statusFilter}`;
      }

      const response = await axiosClient.get(url);
      const data = response.data;

      if (data.coursesPage) {
        setCourses(data.coursesPage.content || []);
        setTotalPages(data.coursesPage.totalPages || 1);
        setTotalElements(data.coursesPage.totalElements || 0);
      }

      setStats({
        totalCourses: data.totalCourses || 0,
        activeCourses: data.activeCourses || 0,
        inactiveCourses: data.inactiveCourses || 0
      });
    } catch (error) {
      showToast(t("loadCoursesError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const isMounted = useRef(false);

  // Monitor status filter change and reset to page 1
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchCourses();
      return;
    }

    if (currentPage === 1) {
      fetchCourses();
    } else {
      setCurrentPage(1);
    }
  }, [statusFilter]);

  // Monitor page changes
  useEffect(() => {
    if (currentPage !== 1) {
      fetchCourses();
    }
  }, [currentPage]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const res = await axiosClient.get("/classrooms/all?status=ACTIVE");
        setClassroomsList(res.data || []);
      } catch (err) {
        console.error("Failed to fetch classrooms", err);
      }
    };
    if (isAdmin) {
      fetchClassrooms();
    }
  }, [isAdmin]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  // Open add modal
  const handleAddClick = () => {
    setErrors({});
    setFormModal({
      isOpen: true,
      isEdit: false,
      id: null,
      courseCode: "",
      courseName: "",
      courseStatus: "ACTIVE"
    });
  };

  // Open edit modal
  const handleEditClick = (course) => {
    setErrors({});
    setFormModal({
      isOpen: true,
      isEdit: true,
      id: course.id,
      courseCode: course.courseCode,
      courseName: course.courseName,
      courseStatus: course.courseStatus
    });
  };

  // Create / Update Course Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let hasError = false;
    const newErrors = {};

    if (!formModal.courseCode || !formModal.courseCode.trim()) {
      newErrors.courseCode = t("courseCodeRequired");
      hasError = true;
    }
    if (!formModal.courseName || !formModal.courseName.trim()) {
      newErrors.courseName = t("courseNameRequired");
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      showToast(t("fillRequiredFields"), "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        courseCode: formModal.courseCode.trim().toUpperCase(),
        courseName: formModal.courseName.trim(),
        courseStatus: formModal.courseStatus
      };

      if (formModal.isEdit) {
        await axiosClient.put(`/courses/${formModal.id}`, payload);
        showToast(t("updateCourseSuccess"), "success");
      } else {
        await axiosClient.post("/courses", payload);
        showToast(t("createCourseSuccess"), "success");
      }
      setFormModal(prev => ({ ...prev, isOpen: false }));
      fetchCourses();
    } catch (error) {
      showToast(error.response?.data?.message || t("saveCourseError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Toggle Status Confirmation
  const triggerToggleStatus = (id, name, status) => {
    const message = status === "ACTIVE"
      ? t("stopTeachingConfirm").replace("{name}", name)
      : t("resumeTeachingConfirm").replace("{name}", name);
    setConfirmModal({
      isOpen: true,
      type: "toggle",
      title: t("changeCourseStatusTitle"),
      message: message,
      actionId: id
    });
  };

  // Toggle Course Status API Call
  const handleToggleStatus = async (id) => {
    setLoading(true);
    try {
      await axiosClient.post(`/courses/toggle-status/${id}`);
      showToast(t("changeCourseStatusSuccess"), "success");
      setConfirmModal({ isOpen: false, type: "", title: "", message: "", actionId: null });
      fetchCourses();
    } catch (error) {
      showToast(error.response?.data?.message || t("changeCourseStatusError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Delete Confirmation
  const triggerDelete = (id, name) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: t("deleteCourseConfirmTitle"),
      message: t("deleteCourseConfirmText").replace("{name}", name),
      actionId: id
    });
  };

  // Delete Course API Call
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosClient.delete(`/courses/${id}`);
      showToast(response.data?.message || t("deleteCourseSuccess"), "success");
      setConfirmModal({ isOpen: false, type: "", title: "", message: "", actionId: null });
      fetchCourses();
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteCourseError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Row click handler to fetch and show classes
  const handleRowClick = async (courseId, courseName) => {
    setClassesModal({
      isOpen: true,
      courseId: courseId,
      courseName: courseName,
      classes: [],
      loading: true
    });

    try {
      const response = await axiosClient.get(`/courses/${courseId}/classes`);
      setClassesModal(prev => ({
        ...prev,
        classes: response.data || [],
        loading: false
      }));
    } catch (error) {
      showToast(t("loadCourseClassesError"), "error");
      setClassesModal(prev => ({ ...prev, isOpen: false, loading: false }));
    }
  };

  // Inline Classroom Edit Save Handler
  const handleSaveClassroom = async (classId, classMaxStudents) => {
    try {
      const trimmedRoom = tempRoomName.trim();
      if (trimmedRoom) {
        const matchedRoom = classroomsList.find(
          (r) => r.name.toLowerCase().trim() === trimmedRoom.toLowerCase().trim()
        );
        if (matchedRoom && classMaxStudents > matchedRoom.capacity) {
          showToast(
            `${t("maxStudentsExceedCapacity")} (${matchedRoom.capacity} ${t("studentsUnit")})`,
            "error"
          );
          return;
        }
      }
      await axiosClient.patch(`/classes/${classId}/room`, { room: trimmedRoom });
      showToast(t("updateClassroomSuccess"), "success");
      // Update local state
      setClassesModal(prev => ({
        ...prev,
        classes: prev.classes.map(c => c.id === classId ? { ...c, room: trimmedRoom } : c)
      }));
      setEditingRoomClassId(null);
    } catch (error) {
      showToast(error.response?.data?.message || t("saveClassroomError"), "error");
    }
  };

  // Class Delete Confirmation Handlers
  const triggerDeleteClass = (classId, className) => {
    setClassDeleteConfirm({
      isOpen: true,
      classId: classId,
      className: className
    });
  };

  const handleDeleteClass = async () => {
    if (!classDeleteConfirm.classId) return;
    setLoading(true);
    try {
      await axiosClient.delete(`/classes/${classDeleteConfirm.classId}`);
      showToast(t("deleteClassSuccess"), "success");
      
      // Refresh classes modal list
      const response = await axiosClient.get(`/courses/${classesModal.courseId}/classes`);
      setClassesModal(prev => ({
        ...prev,
        classes: response.data || [],
        loading: false
      }));

      // Close deletion confirm modal
      setClassDeleteConfirm({ isOpen: false, classId: null, className: "" });

      // Refresh courses list / stats on main page
      fetchCourses();
    } catch (error) {
      showToast(error.response?.data?.message || t("deleteClassError"), "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    translateDay,
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
  };
};
