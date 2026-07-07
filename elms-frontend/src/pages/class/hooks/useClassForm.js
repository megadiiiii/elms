import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t } from "../../../api/translation";

export const useClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";

  // Form state
  const [formData, setFormData] = useState({
    classCode: "",
    className: "",
    maxStudents: 24,
    startDate: "",
    totalSessions: 24,
    courseId: "",
    teacherId: "",
    taId: "",
    room: "",
    status: "UPCOMING",
    schedules: [],
  });

  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 2,
    startTime: "18:00",
    endTime: "20:00",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showTooltip, setShowTooltip] = useState(false);

  // Dropdown lists
  const [coursesList, setCoursesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [tasList, setTasList] = useState([]);
  const [classroomsList, setClassroomsList] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // Load dropdown lists and details if editing
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch active courses
        const courseRes = await axiosClient.get("/courses?size=1000&status=ACTIVE");
        if (courseRes.data && courseRes.data.coursesPage) {
          setCoursesList(courseRes.data.coursesPage.content || []);
        }

        // 2. Fetch teachers (roleId 2)
        const teacherRes = await axiosClient.get("/admin/users?size=1000&roleId=2");
        if (teacherRes.data && teacherRes.data.staffsPage) {
          setTeachersList(teacherRes.data.staffsPage.content || []);
        }

        // 3. Fetch TAs (roleId 3)
        const taRes = await axiosClient.get("/admin/users?size=1000&roleId=3");
        if (taRes.data && taRes.data.staffsPage) {
          setTasList(taRes.data.staffsPage.content || []);
        }

        // Fetch classrooms
        try {
          const roomRes = await axiosClient.get("/classrooms/all?status=ACTIVE");
          setClassroomsList(roomRes.data || []);
        } catch (roomErr) {
          console.error("Failed to load classrooms list", roomErr);
        }

        // 4. Fetch details if edit mode
        if (isEditMode) {
          setFetchingDetails(true);
          const detailRes = await axiosClient.get(`/classes/${id}`);
          const details = detailRes.data;

          setFormData({
            classCode: details.classCode || "",
            className: details.className || "",
            maxStudents: details.maxStudents || 24,
            startDate: details.startDate || "",
            totalSessions: details.totalSessions || 0,
            courseId: details.courseId || "",
            teacherId: details.teacherId || "",
            taId: details.taId || "",
            room: details.room || "",
            status: details.status || "UPCOMING",
            schedules: details.schedules || [],
          });
          setFetchingDetails(false);
        } else {
          // Pre-fill courseId if passed as a query parameter
          const searchParams = new URLSearchParams(window.location.search);
          const urlCourseId = searchParams.get("courseId");
          if (urlCourseId) {
            setFormData(prev => ({ ...prev, courseId: urlCourseId }));
          }
        }
      } catch (error) {
        showToast(t("initDataLoadError"), "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.startTime || !newSchedule.endTime) {
      showToast(t("enterSchedulesError"), "error");
      return;
    }
    if (newSchedule.startTime >= newSchedule.endTime) {
      showToast(t("startTimeBeforeEndTimeError"), "error");
      return;
    }
    const isDuplicate = formData.schedules.some(
      (s) =>
        s.dayOfWeek === Number(newSchedule.dayOfWeek) &&
        s.startTime === newSchedule.startTime &&
        s.endTime === newSchedule.endTime
    );
    if (isDuplicate) {
      showToast(t("duplicateScheduleError"), "error");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          dayOfWeek: Number(newSchedule.dayOfWeek),
          startTime: newSchedule.startTime,
          endTime: newSchedule.endTime,
        },
      ].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      }),
    }));
  };

  const handleRemoveSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let hasError = false;
    const newErrors = {};

    if (!formData.classCode || !formData.classCode.trim()) {
      newErrors.classCode = t("classCodeRequired");
      hasError = true;
    }
    if (!formData.className || !formData.className.trim()) {
      newErrors.className = t("classNameRequired");
      hasError = true;
    }
    if (!formData.courseId) {
      newErrors.courseId = t("courseRequired");
      hasError = true;
    }
    if (!formData.maxStudents || formData.maxStudents <= 0) {
      newErrors.maxStudents = t("maxStudentsError");
      hasError = true;
    } else if (formData.room) {
      const selectedRoom = classroomsList.find(
        (r) => r.name.toLowerCase().trim() === formData.room.toLowerCase().trim()
      );
      if (selectedRoom && Number(formData.maxStudents) > selectedRoom.capacity) {
        newErrors.maxStudents = `${t("maxStudentsExceedCapacity")} (${selectedRoom.capacity})`;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      showToast(t("fillRequiredFields"), "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        classCode: formData.classCode.trim().toUpperCase(),
        className: formData.className.trim(),
        maxStudents: Number(formData.maxStudents),
        startDate: formData.startDate || null,
        totalSessions: formData.totalSessions ? Number(formData.totalSessions) : 0,
        courseId: Number(formData.courseId),
        teacherId: formData.teacherId ? Number(formData.teacherId) : null,
        taId: formData.taId ? Number(formData.taId) : null,
        room: formData.room ? formData.room.trim() : null,
        status: formData.status,
        schedules: formData.schedules,
      };

      if (isEditMode) {
        await axiosClient.put(`/classes/${id}`, payload);
        sessionStorage.setItem("class_success_message", t("updateClassSuccess"));
      } else {
        await axiosClient.post("/classes", payload);
        sessionStorage.setItem("class_success_message", t("createClassSuccess"));
      }

      navigate("/classes");
    } catch (error) {
      showToast(error.response?.data?.message || t("saveClassError"), "error");
    } finally {
      setLoading(false);
    }
  };

  const getExpectedEndDate = () => {
    if (!formData.startDate || !formData.totalSessions || !formData.schedules || formData.schedules.length === 0) {
      return null;
    }
    const sessions = Number(formData.totalSessions);
    if (sessions <= 0) return null;

    const activeDays = new Set(formData.schedules.map(s => Number(s.dayOfWeek)));
    let currentDate = new Date(formData.startDate);
    let sessionsCounted = 0;

    const mapJsDayToOurDay = (jsDay) => {
      if (jsDay === 0) return 8;
      return jsDay + 1;
    };

    // Calculate dates
    for (let i = 0; i < 1000; i++) {
      const currentDay = mapJsDayToOurDay(currentDate.getDay());
      if (activeDays.has(currentDay)) {
        sessionsCounted++;
        if (sessionsCounted === sessions) {
          return currentDate.toLocaleDateString(localStorage.getItem("lang") === "en" ? "en-US" : "vi-VN");
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return null;
  };

  const teacherAutocompleteItems = teachersList.map(item => ({
    id: item.id,
    label: item.fullName,
    sublabel: item.staffCode
  }));

  const taAutocompleteItems = tasList.map(item => ({
    id: item.id,
    label: item.fullName,
    sublabel: item.staffCode
  }));

  const roomAutocompleteItems = [
    ...classroomsList.map(r => ({
      id: r.id,
      label: r.name,
      sublabel: `${t("capacity")}: ${r.capacity} ${t("studentsUnit")}`
    })),
    { id: "online-zoom", label: "Online - Zoom", sublabel: localStorage.getItem("lang") === "en" ? "Virtual Meeting" : "Phòng học trực tuyến" },
    { id: "online-meet", label: "Online - Google Meet", sublabel: localStorage.getItem("lang") === "en" ? "Virtual Meeting" : "Phòng học trực tuyến" }
  ];

  return {
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
  };
};
