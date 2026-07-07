import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

export const useClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Class detail state
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Modal confirm states
  const [confirmEnroll, setConfirmEnroll] = useState({ show: false, students: [] });
  const [confirmUnenroll, setConfirmUnenroll] = useState({ show: false, student: null });
  const [confirmTransfer, setConfirmTransfer] = useState({ show: false, student: null, targetClassId: "" });

  // List of other classes for transfer selection
  const [classList, setClassList] = useState([]);

  // Action loading states
  const [actionLoading, setActionLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Materials states
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Load class detail from API
  const fetchClassDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/classes/${id}/detail`);
      setDetail(response.data);
    } catch (err) {
      console.error("Failed to load class detail:", err);
      if (err.response && err.response.data) {
        console.error("Server error response:", err.response.data);
      }
      showToast(t("systemError"), "error");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch all classes for transfer dropdown
  const fetchAllClasses = useCallback(async () => {
    try {
      const response = await axiosClient.get("/classes?page=1&size=200");
      if (response.data && response.data.classesPage && response.data.classesPage.content) {
        setClassList(response.data.classesPage.content);
      }
    } catch (err) {
      console.error("Failed to load classes list:", err);
    }
  }, []);

  // Autocomplete search api
  const searchActiveStudents = async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const response = await axiosClient.get(`/admin/students/autocomplete?keyword=${encodeURIComponent(query.trim())}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Failed to search autocomplete students:", err);
    } finally {
      setSearchingStudents(false);
    }
  };

  // Trigger search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchActiveStudents(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleEnrollStudent = async () => {
    const students = confirmEnroll.students || [];
    if (students.length === 0) return;

    setActionLoading(true);
    try {
      const studentIds = students.map(s => s.id);
      const response = await axiosClient.post(`/classes/${id}/students`, {
        studentIds
      });
      showToast(response.data?.message || t("enrollSuccess"), "success");
      setConfirmEnroll({ show: false, students: [] });
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
      fetchClassDetail();
    } catch (err) {
      console.error("Failed to enroll student:", err);
      const errMsg = err.response?.data?.message || t("systemError");
      showToast(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Unenroll student api
  const handleUnenrollStudent = async () => {
    const student = confirmUnenroll.student;
    if (!student) return;

    setActionLoading(true);
    try {
      const response = await axiosClient.delete(`/classes/${id}/students/${student.id}`);
      showToast(response.data?.message || t("unenrollSuccess"), "success");
      setConfirmUnenroll({ show: false, student: null });
      fetchClassDetail();
    } catch (err) {
      console.error("Failed to unenroll student:", err);
      const errMsg = err.response?.data?.message || t("systemError");
      showToast(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Transfer student api
  const handleTransferStudent = async () => {
    const student = confirmTransfer.student;
    const targetClassId = confirmTransfer.targetClassId;
    if (!student || !targetClassId) return;

    setActionLoading(true);
    try {
      const response = await axiosClient.post(
        `/classes/${id}/students/${student.id}/transfer?targetClassId=${targetClassId}`
      );
      showToast(response.data?.message || "Chuyển lớp thành công!", "success");
      setConfirmTransfer({ show: false, student: null, targetClassId: "" });
      fetchClassDetail();
    } catch (err) {
      console.error("Failed to transfer student:", err);
      const errMsg = err.response?.data?.message || t("systemError");
      showToast(errMsg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch materials by course id
  const fetchMaterials = useCallback(async (courseId) => {
    if (!courseId) return;
    setLoadingMaterials(true);
    try {
      const response = await axiosClient.get(`/courses/${courseId}/materials`);
      setMaterials(response.data);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoadingMaterials(false);
    }
  }, []);

  // Upload material
  const handleUploadMaterial = async (title, file) => {
    if (!detail || !detail.courseId || !file) return false;
    const uploadData = new FormData();
    uploadData.append("file", file);
    if (title && title.trim()) {
      uploadData.append("title", title.trim());
    }

    try {
      await axiosClient.post(`/courses/${detail.courseId}/materials`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToast("Tải tài liệu lên thành công!", "success");
      fetchMaterials(detail.courseId);
      return true;
    } catch (err) {
      console.error("Failed to upload material:", err);
      showToast(err.response?.data?.message || "Lỗi khi tải tài liệu lên!", "error");
      return false;
    }
  };

  // Delete material
  const handleDeleteMaterial = async (materialId) => {
    try {
      await axiosClient.delete(`/courses/materials/${materialId}`);
      showToast("Xóa tài liệu thành công!", "success");
      if (detail && detail.courseId) {
        fetchMaterials(detail.courseId);
      }
    } catch (err) {
      console.error("Failed to delete material:", err);
      showToast(err.response?.data?.message || "Lỗi khi xóa tài liệu!", "error");
    }
  };

  // Load details on mount
  useEffect(() => {
    fetchClassDetail();
    if (isAdmin) {
      fetchAllClasses();
    }
  }, [fetchClassDetail, fetchAllClasses, isAdmin]);

  // Load materials when detail / courseId is loaded
  useEffect(() => {
    if (detail && detail.courseId) {
      fetchMaterials(detail.courseId);
    }
  }, [detail, fetchMaterials]);

  return {
    id,
    detail,
    loading,
    isAdmin,
    role,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchingStudents,
    showDropdown,
    setShowDropdown,
    confirmEnroll,
    setConfirmEnroll,
    confirmUnenroll,
    setConfirmUnenroll,
    confirmTransfer,
    setConfirmTransfer,
    classList,
    actionLoading,
    toast,
    handleCloseToast,
    handleEnrollStudent,
    handleUnenrollStudent,
    handleTransferStudent,
    materials,
    loadingMaterials,
    activeTab,
    setActiveTab,
    handleUploadMaterial,
    handleDeleteMaterial,
    navigate
  };
};
