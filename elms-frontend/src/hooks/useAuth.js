import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { t } from "../api/translation";

export const useLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCloseToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    const hasUsername = !!formData.username.trim();
    const hasPassword = !!formData.password.trim();

    if (!hasUsername || !hasPassword) {
      setToast({
        show: true,
        message: t("loginValidationEmpty"),
        type: "error"
      });
      return;
    }

    try {
      const response = await axiosClient.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("fullName", response.data.fullName); 
      localStorage.setItem("avatar", "default-avatar.png");
      sessionStorage.setItem("showWelcomeToast", "true");
      navigate("/dashboard");
    } catch (error) {
      let errorMsg = t("loginFailed");
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = error.response.data?.message || t("loginFailed");
        } else {
          errorMsg = error.response.data?.message || `${t("systemError")} (${error.response.status})`;
        }
      } else if (error.request) {
        errorMsg = t("serverConnectionError");
      } else {
        errorMsg = error.message || t("unknownError");
      }

      setToast({
        show: true,
        message: errorMsg,
        type: "error"
      });
    }
  };

  return {
    formData,
    showPassword,
    toast,
    handleFieldChange,
    handleCloseToast,
    toggleShowPassword,
    handleLoginSubmit,
  };
};
