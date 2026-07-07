import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import countriesData from "../../../js/countries.json";
import { t } from "../../../api/translation";

export const useStudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    nationality: "",
    dob: "",
    avatarUrl: "",
    studentNickname: "",
    parentName: "",
    parentPhone: "",
    parentEmail: ""
  });

  const [errors, setErrors] = useState({});
  const [countriesList] = useState(countriesData);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  const [searchCountryQuery, setSearchCountryQuery] = useState("");

  useEffect(() => {
    setSearchCountryQuery(formData.nationality || "");
  }, [formData.nationality]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById("nationality-autocomplete-container");
      if (container && !container.contains(event.target)) {
        setShowCountriesDropdown(false);
        setSearchCountryQuery(formData.nationality || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formData.nationality]);

  const getAvatarSource = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    if (avatar.startsWith("/uploads/")) {
      return avatar;
    }
    return `/uploads/avatars/${avatar}`;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isEditMode) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(`/admin/students/${id}`);
        const data = res.data;
        
        const formatLocalDateToInput = (dobValue) => {
          if (!dobValue) return "";
          if (Array.isArray(dobValue)) {
            const [year, month, day] = dobValue;
            const y = year;
            const m = String(month).padStart(2, "0");
            const d = String(day).padStart(2, "0");
            return `${y}-${m}-${d}`;
          }
          if (typeof dobValue === "string") {
            return dobValue.split("T")[0];
          }
          return "";
        };

        setFormData({
          studentName: data.studentName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "",
          nationality: data.nationality || "",
          dob: formatLocalDateToInput(data.dob),
          avatarUrl: data.avatarUrl || "",
          studentNickname: data.studentNickname || "",
          parentName: data.parentName || "",
          parentPhone: data.parentPhone || "",
          parentEmail: data.parentEmail || ""
        });
        
        if (data.avatarUrl) {
          setAvatarPreview(getAvatarSource(data.avatarUrl));
        }
      } catch (err) {
        showToast(t("initDataLoadError"), "error");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEditMode]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }));
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
    
    // Reset file input value
    e.target.value = '';
  };

  const handleCroppedAvatar = async (croppedFile, croppedUrl) => {
    setIsCropOpen(false);
    setCropImageSrc(null);
    setAvatarPreview(croppedUrl);

    const uploadData = new FormData();
    uploadData.append("file", croppedFile);

    setUploadingAvatar(true);
    try {
      const res = await axiosClient.post("/media/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFormData((prev) => ({ ...prev, avatarUrl: res.data.fileName }));
      showToast(t("avatarUploadSuccess"), "success");
    } catch (err) {
      showToast(err.response?.data?.message || t("avatarUploadError"), "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validations
    if (!formData.studentName || !formData.studentName.trim()) {
      setErrors({ studentName: t("fullNameRequired") });
      showToast(t("fullNameRequired"), "error");
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      setErrors({ email: t("emailRequired") });
      showToast(t("emailRequired"), "error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: t("emailInvalid") });
      showToast(t("emailInvalid"), "error");
      return;
    }
    if (!formData.phone || !formData.phone.trim()) {
      setErrors({ phone: t("phoneRequired") });
      showToast(t("phoneRequired"), "error");
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setErrors({ phone: t("phoneInvalid") });
      showToast(t("phoneInvalid"), "error");
      return;
    }
    if (!formData.gender) {
      setErrors({ gender: t("genderRequired") });
      showToast(t("genderRequiredToastStudent"), "error");
      return;
    }
    if (!formData.dob) {
      setErrors({ dob: t("dobRequired") });
      showToast(t("dobRequiredToast"), "error");
      return;
    }
    if (!formData.nationality || !formData.nationality.trim()) {
      setErrors({ nationality: t("nationalityRequired") });
      showToast(t("nationalityRequiredToastStudent"), "error");
      return;
    }
    
    // Parent's fields validation if filled
    if (formData.parentPhone && !/^[0-9]{10}$/.test(formData.parentPhone)) {
      setErrors({ parentPhone: t("phoneInvalid") });
      showToast(t("phoneInvalid"), "error");
      return;
    }
    if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      setErrors({ parentEmail: t("emailInvalid") });
      showToast(t("emailInvalid"), "error");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axiosClient.put(`/admin/students/${id}`, formData);
        sessionStorage.setItem("student_success_message", t("updateStudentSuccess"));
      } else {
        await axiosClient.post("/admin/students", formData);
        sessionStorage.setItem("student_success_message", t("createStudentSuccess"));
      }
      navigate("/students");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        const firstErrorMessage = err.response.data.errors[firstErrorKey];
        showToast(firstErrorMessage || t("checkInputError"), "error");
      } else {
        const errMsg = err.response?.data?.message || t("systemError");
        showToast(errMsg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countriesList.filter((c) =>
    c.name.toLowerCase().includes(searchCountryQuery.toLowerCase())
  );

  return {
    isEditMode,
    loading,
    uploadingAvatar,
    avatarPreview,
    toast,
    handleCloseToast,
    formData,
    setFormData,
    errors,
    showCountriesDropdown,
    setShowCountriesDropdown,
    searchCountryQuery,
    setSearchCountryQuery,
    handleFieldChange,
    handleAvatarChange,
    handleCroppedAvatar,
    cropImageSrc,
    setCropImageSrc,
    isCropOpen,
    setIsCropOpen,
    handleSubmit,
    filteredCountries,
    navigate
  };
};
