import React from "react";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { t } from "../../api/translation";

// Import local page components
import StaffStats from "./components/StaffStats";
import StaffSearchFilter from "./components/StaffSearchFilter";
import StaffTable from "./components/StaffTable";

// Import local hook
import { useStaffList } from "./hooks/useStaffList";

const StaffPage = () => {
  const {
    staffList,
    rolesList,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    selectedRoleFilter,
    setSelectedRoleFilter,
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
  } = useStaffList();

  return (
    <>
      <MainLayout
        title={t("staffManagement")}
        description={t("staffDesc")}
      >
        <div className="space-y-6 animate-fade-in">
          {/* Top Metric Cards */}
          <StaffStats stats={stats} />

          {/* Filtering and search control bar */}
          <StaffSearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedRoleFilter={selectedRoleFilter}
            setSelectedRoleFilter={setSelectedRoleFilter}
            rolesList={rolesList}
            onSearch={handleSearchSubmit}
            onAddClick={handleAddClick}
          />

          {/* Paginated Staff Table */}
          <StaffTable
            staffList={staffList}
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

export default StaffPage;
