import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { t, getLanguage } from "../../../api/translation";

export const useStudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // "reset" | "toggle"
    title: "",
    message: "",
  });

  const triggerResetPassword = () => {
    setConfirmModal({
      isOpen: true,
      type: "reset",
      title: t("resetPasswordConfirmTitle"),
      message: t("resetPasswordConfirmMessageStudent").replace("{name}", detail.fullName),
    });
  };

  const handleResetPassword = async () => {
    try {
      const response = await axiosClient.post(`/admin/students/reset-password/${detail.id}`);
      setToast({
        show: true,
        message: response.data?.message || t("resetPasswordSuccess"),
        type: "success"
      });
      closeConfirmModal();
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || t("resetPasswordError"),
        type: "error"
      });
    }
  };

  const triggerToggleStatus = () => {
    const action = detail.status === "ACTIVE" ? t("lock") : t("unlock");
    const actionValLower = detail.status === "ACTIVE" ? t("lockLower") : t("unlockLower");
    setConfirmModal({
      isOpen: true,
      type: "toggle",
      title: t("confirmAccountAction").replace("{action}", action),
      message: t("confirmToggleStatusMessage").replace("{action}", actionValLower).replace("{name}", detail.fullName),
    });
  };

  const handleToggleStatus = async () => {
    try {
      const response = await axiosClient.post(`/admin/students/toggle-status/${detail.id}`);
      setToast({
        show: true,
        message: response.data?.message || t("toggleStatusSuccess"),
        type: "success"
      });
      closeConfirmModal();
      
      const reloadRes = await axiosClient.get(`/admin/students/${id}/detail`);
      setDetail(reloadRes.data);
    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.message || t("toggleStatusError"),
        type: "error"
      });
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "reset") {
      handleResetPassword();
    } else if (confirmModal.type === "toggle") {
      handleToggleStatus();
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/admin/students/${id}/detail`);
        setDetail(response.data);
      } catch (error) {
        setToast({
          show: true,
          message: error.response?.data?.message || t("loadStudentDetailError"),
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getAvatarSource = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    return `/uploads/avatars/${avatar}`;
  };

  const formatDob = (dobValue) => {
    if (!dobValue) return t("notUpdated");
    try {
      let date;
      if (Array.isArray(dobValue)) {
        const [year, month, day] = dobValue;
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dobValue);
      }
      return date.toLocaleDateString(getLanguage() === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return String(dobValue);
    }
  };

  const getGenderLabel = (gender) => {
    if (!gender) return t("notUpdated");
    if (gender === "MALE" || gender === "Nam") return t("male");
    if (gender === "FEMALE" || gender === "Nữ") return t("female");
    if (gender === "OTHER" || gender === "Khác") return t("otherGender");
    return gender;
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "", title: "", message: "" });
  };

  return {
    detail,
    loading,
    toast,
    handleCloseToast,
    confirmModal,
    closeConfirmModal,
    triggerResetPassword,
    handleResetPassword,
    triggerToggleStatus,
    handleToggleStatus,
    handleConfirmAction,
    getAvatarSource,
    formatDob,
    getGenderLabel,
    navigate
  };
};
