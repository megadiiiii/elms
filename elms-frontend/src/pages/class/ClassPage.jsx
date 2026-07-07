import React from "react";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { t } from "../../api/translation";

// Import local sub-components
import ClassStats from "./components/ClassStats";
import ClassSearchFilter from "./components/ClassSearchFilter";
import ClassTable from "./components/ClassTable";

import Error403Page from "../Error403Page";

// Import local custom hook
import { useClassList } from "./hooks/useClassList";

const ClassPage = () => {
  const role = localStorage.getItem("role") || "STUDENT";
  if (role === "STUDENT") {
    return <Error403Page />;
  }

  const {
    isAdmin,
    classes,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    courseFilter,
    setCourseFilter,
    coursesList,
    stats,
    loading,
    toast,
    handleCloseToast,
    confirmModal,
    closeConfirmModal,
    handleSearchSubmit,
    handleAddClick,
    handleEditClick,
    triggerDelete,
    handleDelete,
  } = useClassList();

  return (
    <>
      <MainLayout
        title={t("classList")}
        description={t("classDesc")}
      >
        <div className="space-y-6 animate-fade-in">
          {/* Stats section */}
          <ClassStats stats={stats} />

          {/* Search, Filter & Action bar */}
          <ClassSearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            coursesList={coursesList}
            onSearch={handleSearchSubmit}
            onAddClick={handleAddClick}
            isAdmin={isAdmin}
          />

          {/* Table display */}
          <ClassTable
            classes={classes}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={triggerDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            isAdmin={isAdmin}
          />
        </div>
      </MainLayout>

      {/* CONFIRM DELETION MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={() => handleDelete(confirmModal.actionId)}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t("confirmDelete")}
      />

      {/* Toast Alert System */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default ClassPage;
