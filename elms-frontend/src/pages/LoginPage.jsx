import React from "react";
import FormInput from "../components/FormInput";
import AuthLayout from "../components/AuthLayout";
import Toast from "../components/Toast";
import { useLogin } from "../hooks/useAuth";
import { t } from "../api/translation";


const LoginPage = () => {
  const {
    formData,
    showPassword,
    toast,
    handleFieldChange,
    handleCloseToast,
    toggleShowPassword,
    handleLoginSubmit,
  } = useLogin();

  const loginFields = [
    {
      id: "username",
      label: t("usernameLabel"),
      placeholder: t("usernamePlaceholder"),
      leftIcon: <span className="material-symbols-outlined text-[18px]">person</span>,
    },
    {
      id: "password",
      label: t("passwordLabel"),
      type: "password",
      placeholder: t("passwordPlaceholder"),
      leftIcon: <span className="material-symbols-outlined text-[18px]">lock</span>,
    },
  ];

  return (
    <>
      <AuthLayout>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/*Render các trường đăng nhập*/}
          {loginFields.map((field) => {
            const isPassword = field.id === "password";
            const inputType = isPassword
              ? showPassword
                ? "text"
                : "password"
              : "text";

              /*Nếu là trường mật khẩu thì thêm nút show/hide vào bên trong FormInput, truyền thêm props children để hiển thị nút đó*/
            return (
              <FormInput
                key={field.id}
                label={field.label}
                id={field.id}
                type={inputType}
                placeholder={field.placeholder}
                value={formData[field.id]}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                leftIcon={field.leftIcon}
              >
                {isPassword && (
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="hover:text-scholarly-primary transition-colors cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                )}
              </FormInput>
            );
          })}{" "}
          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-bold text-lg 
                      shadow-lg shadow-[#1E3A8A]/20 cursor-pointer block text-center transition-transform active:scale-[0.98]"
          >
            {t("loginButton")}
          </button>
        </form>
      </AuthLayout>

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={handleCloseToast} 
      />
    </>
  );
};

export default LoginPage;
