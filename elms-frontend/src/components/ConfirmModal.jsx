import React from "react";
import Modal from "./Modal";
import { t } from "../api/translation";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = "danger", confirmText, cancelText }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer animate-fade-in"
          >
            {cancelText || t("cancel") || "Hủy"}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer ${
              type === "toggle"
                ? "bg-slate-800 hover:bg-slate-900"
                : type === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {confirmText || t("confirm") || "Xác nhận"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
