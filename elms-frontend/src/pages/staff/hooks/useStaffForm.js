import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import countriesData from "../../../js/countries.json";
import { t } from "../../../api/translation";

// Local Module-specific Constants
export const ROLE_LIST = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "TEACHER" },
  { id: 3, name: "TA" }
];

export const useStaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [rolesList, setRolesList] = useState(ROLE_LIST);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const [formData, setFormData] = useState({
    roleId: "",
    staffName: "",
    email: "",
    staffPhone: "",
    address: "",
    gender: "",
    nationality: "",
    dob: "",
    avatarUrl: ""
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
      setLoading(true);
      try {
        const listRes = await axiosClient.get("/admin/users?page=1&size=1");
        if (listRes.data && listRes.data.roles) {
          setRolesList(listRes.data.roles);
        }

        if (isEditMode) {
          const res = await axiosClient.get(`/admin/users/${id}`);
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
            roleId: data.roleId || "",
            staffName: data.staffName || "",
            email: data.email || "",
            staffPhone: data.staffPhone || "",
            address: data.address || "",
            gender: data.gender || "",
            nationality: data.nationality || "",
            dob: formatLocalDateToInput(data.dob),
            avatarUrl: data.avatarUrl || ""
          });
          if (data.avatarUrl) {
            setAvatarPreview(getAvatarSource(data.avatarUrl));
          }
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

    if (!formData.roleId) {
      setErrors({ roleId: t("roleRequired") });
      showToast(t("selectRoleError"), "error");
      return;
    }
    if (!formData.staffName || !formData.staffName.trim()) {
      setErrors({ staffName: t("fullNameRequired") });
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
    if (!formData.staffPhone || !formData.staffPhone.trim()) {
      setErrors({ staffPhone: t("phoneRequired") });
      showToast(t("phoneRequired"), "error");
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.staffPhone)) {
      setErrors({ staffPhone: t("phoneInvalid") });
      showToast(t("phoneInvalid"), "error");
      return;
    }
    if (!formData.gender) {
      setErrors({ gender: t("genderRequired") });
      showToast(t("genderRequiredToast"), "error");
      return;
    }
    if (!formData.dob) {
      setErrors({ dob: t("dobRequired") });
      showToast(t("dobRequiredToast"), "error");
      return;
    }
    if (!formData.nationality || !formData.nationality.trim()) {
      setErrors({ nationality: t("nationalityRequired") });
      showToast(t("nationalityRequiredToast"), "error");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await axiosClient.put(`/admin/users/${id}`, formData);
        sessionStorage.setItem("staff_success_message", t("updateStaffSuccess"));
      } else {
        await axiosClient.post("/admin/users", formData);
        sessionStorage.setItem("staff_success_message", t("createStaffSuccess"));
      }
      navigate("/admin/users");
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
    rolesList,
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
