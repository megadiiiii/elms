import React from "react";
import FormInput from "./FormInput"; 
import { t } from "../api/translation";

const DynamicForm = ({
  fields,
  formData,
  onChange,
  onSubmit,
  submitText = t("save"),
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Khung Grid thần thánh chia 2 cột của Tailwind */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field) => (
          <div key={field.id} className={field.gridSpan || "md:col-span-2"}>
            {/* 🟢 TRUYỀN THÊM THUỘC TÍNH SIZE ĐỘNG TỪ MẢNG VÀO ĐÂY */}
            <FormInput
              label={field.label}
              id={field.id}
              type={field.type || "text"}
              size={field.size || "md"} 
              placeholder={field.placeholder || field.label}
              value={formData[field.id] || ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-[#00236f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mt-4"
      >
        {submitText}
      </button>
    </form>
  );
  };

export default DynamicForm;
