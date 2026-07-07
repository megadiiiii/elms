import React from "react";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { t } from "../../api/translation";

// Import local page components
import StudentStats from "./components/StudentStats";
import StudentSearchFilter from "./components/StudentSearchFilter";
import StudentTable from "./components/StudentTable";

import Error403Page from "../Error403Page";

// Import local hook
import { useStudentList } from "./hooks/useStudentList";

const StudentPage = () => {
  const role = localStorage.getItem("role") || "STUDENT";
  if (role === "STUDENT") {
    return <Error403Page />;
  }

  const {
    studentList,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    stats,
    loading,
    toast,
    handleCloseToast,
    confirmModal,
    closeConfirmModal,
    handleSearchSubmit,
    handleAddClick,
    handleEditClick,
    handleViewDetail,
    triggerResetPassword,
    handleResetPassword,
    triggerToggleStatus,
    handleToggleStatus,
  } = useStudentList();

  return (
    <>
      <MainLayout
        title={t("studentManagement")}
        description={t("studentDesc")}
      >
        <div className="space-y-6 animate-fade-in">
          {/* Top Metric Cards */}
          <StudentStats stats={stats} />

          {/* Filtering and search control bar */}
          <StudentSearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearchSubmit}
            onAddClick={handleAddClick}
          />

          {/* Paginated Student Table */}
          <StudentTable
            studentList={studentList}
            loading={loading}
            onEdit={handleEditClick}
            onViewDetail={handleViewDetail}
            onResetPassword={triggerResetPassword}
            onToggleStatus={triggerToggleStatus}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
          />
        </div>
      </MainLayout>

      {/* Actions confirmation prompt */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={() => {
          if (confirmModal.type === "reset") {
            handleResetPassword(confirmModal.actionId);
          } else if (confirmModal.type === "toggle") {
            handleToggleStatus(confirmModal.actionId);
          }
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default StudentPage;
