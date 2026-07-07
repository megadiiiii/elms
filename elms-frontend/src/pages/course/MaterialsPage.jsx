import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/MainLayout";
import Toast from "../../components/Toast";
import Modal from "../../components/Modal";
import axiosClient from "../../api/axiosClient";
import { t } from "../../api/translation";

const MaterialsPage = () => {
  const role = localStorage.getItem("role") || "STUDENT";
  const isStaff = role === "ADMIN" || role === "TEACHER" || role === "TA";

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMat, setUploadingMat] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // States for document preview modal
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const getShortFormat = (contentType) => {
    const type = contentType || "";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("officedocument.word")) return "DOCX";
    if (type.includes("spreadsheet") || type.includes("excel") || type.includes("sheet")) return "XLSX";
    if (type.includes("presentation") || type.includes("powerpoint")) return "PPTX";
    if (type.includes("zip") || type.includes("rar") || type.includes("compressed")) return "ZIP";
    if (type.includes("image")) return "IMAGE";
    return "FILE";
  };

  const handlePreview = (mat) => {
    const fileUrl = `/uploads/materials/${mat.fileName}`;
    const contentType = mat.contentType || "";
    if (contentType.includes("pdf") || contentType.includes("image")) {
      window.open(fileUrl, "_blank");
    } else {
      setPreviewUrl(fileUrl);
      setPreviewTitle(mat.title);
      setPreviewType("unsupported");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Fetch all courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await axiosClient.get("/courses?page=1&size=100&status=ACTIVE");
        if (response.data && response.data.coursesPage) {
          const courseList = response.data.coursesPage.content || [];
          setCourses(courseList);
          if (courseList.length > 0) {
            setSelectedCourseId(courseList[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        showToast("Lỗi khi tải danh sách môn học", "error");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch materials for selected course
  const fetchMaterials = useCallback(async (courseId) => {
    if (!courseId) return;
    setLoadingMaterials(true);
    try {
      const response = await axiosClient.get(`/courses/${courseId}/materials`);
      setMaterials(response.data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
      showToast("Lỗi khi tải danh sách tài liệu", "error");
    } finally {
      setLoadingMaterials(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchMaterials(selectedCourseId);
    }
  }, [selectedCourseId, fetchMaterials]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedCourseId || !materialFile) {
      showToast("Vui lòng chọn file tài liệu trước!", "warning");
      return;
    }

    setUploadingMat(true);
    const uploadData = new FormData();
    uploadData.append("file", materialFile);
    if (materialTitle.trim()) {
      uploadData.append("title", materialTitle.trim());
    }

    try {
      await axiosClient.post(`/courses/${selectedCourseId}/materials`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      showToast("Tải tài liệu lên thành công!", "success");
      setMaterialTitle("");
      setMaterialFile(null);
      setIsUploadModalOpen(false);
      fetchMaterials(selectedCourseId);
    } catch (err) {
      console.error("Failed to upload material:", err);
      showToast(err.response?.data?.message || "Lỗi khi tải tài liệu lên!", "error");
    } finally {
      setUploadingMat(false);
    }
  };

  // Handle delete
  const handleDelete = async (matId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${title}"?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/courses/materials/${matId}`);
      showToast("Xóa tài liệu học tập thành công!", "success");
      fetchMaterials(selectedCourseId);
    } catch (err) {
      console.error("Failed to delete material:", err);
      showToast(err.response?.data?.message || "Lỗi khi xóa tài liệu!", "error");
    }
  };

  return (
    <MainLayout
      title="Tài liệu học tập"
      description="Quản lý và chia sẻ tài liệu, giáo trình, slide bài giảng theo từng môn học."
    >
      <div className="space-y-6 animate-fade-in pb-10">
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* LEFT CARD: Select Course */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-[0.15em] mb-1">
                Lựa chọn môn học
              </h3>
              <p className="text-xs text-slate-400">Chọn môn học để xem và quản lý tài liệu liên quan</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Môn học / Khóa học</label>
              {loadingCourses ? (
                <div className="h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">Đang tải môn học...</span>
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-650 outline-none transition-all cursor-pointer"
                >
                  {courses.length === 0 ? (
                    <option value="">-- Chưa có môn học --</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseName}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {/* RIGHT CARD: Materials management */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Danh sách tài liệu học tập</h3>
                <p className="text-xs text-slate-450 mt-1">Các tài liệu này sẽ hiển thị cho mọi lớp học liên kết với môn học này.</p>
              </div>
              {isStaff && selectedCourseId && (
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm uppercase tracking-wider border-0"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Tải lên tài liệu
                </button>
              )}
            </div>

            {/* Materials List Table */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              {loadingMaterials ? (
                <div className="p-16 flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : materials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-355 tracking-[0.15em]">
                        <th className="p-4 pl-6 text-center w-[5%]">STT</th>
                        <th className="p-4 w-[40%]">Tên tài liệu</th>
                        <th className="p-4 w-[35%]">Tên file vật lý</th>
                        <th className="p-4 text-center w-[10%]">Định dạng</th>
                        <th className="p-4 pr-6 text-right w-[10%]">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {materials.map((mat, idx) => {
                        let icon = "draft";
                        const contentType = mat.contentType || "";
                        if (contentType.includes("pdf")) icon = "picture_as_pdf";
                        else if (contentType.includes("word") || contentType.includes("officedocument.word")) icon = "description";
                        else if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("sheet")) icon = "table_chart";
                        else if (contentType.includes("presentation") || contentType.includes("powerpoint")) icon = "slideshow";
                        else if (contentType.includes("zip") || contentType.includes("rar") || contentType.includes("compressed")) icon = "inventory_2";
                        else if (contentType.includes("image")) icon = "image";

                        return (
                          <tr key={mat.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 pl-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500 w-16">
                              {idx + 1}
                            </td>
                            <td className="p-4 text-xs font-bold text-slate-800 dark:text-slate-150">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-500 text-lg">{icon}</span>
                                <button
                                  type="button"
                                  onClick={() => handlePreview(mat)}
                                  className="hover:underline text-indigo-600 dark:text-indigo-400 font-bold border-0 bg-transparent cursor-pointer p-0 text-left"
                                >
                                  {mat.title}
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]" title={mat.fileName}>
                              {mat.fileName.includes("_") ? mat.fileName.substring(mat.fileName.indexOf("_") + 1) : mat.fileName}
                            </td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-455 dark:text-slate-400 border border-slate-150/40 dark:border-slate-700">
                                {getShortFormat(mat.contentType)}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePreview(mat)}
                                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                  title="Xem trước"
                                >
                                  <span className="material-symbols-outlined text-base">visibility</span>
                                </button>
                                <a
                                  href={`/uploads/materials/${mat.fileName}`}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                  title="Tải xuống"
                                >
                                  <span className="material-symbols-outlined text-base">download</span>
                                </a>
                                {isStaff && (
                                  <button
                                    onClick={() => handleDelete(mat.id, mat.title)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer border-0 bg-transparent"
                                    title="Xóa tài liệu"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center max-w-xs mx-auto animate-fade-in">
                  <span className="material-symbols-outlined text-4xl text-slate-300">folder_off</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Môn học chưa có tài liệu</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isStaff ? "Hãy chọn tệp và điền tên tài liệu để chia sẻ tài liệu đầu tiên cho môn học này." : "Hiện môn học này chưa được cập nhật tài liệu nào."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setMaterialTitle("");
            setMaterialFile(null);
          }}
          title="Tải lên tài liệu học tập"
        >
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Tên tài liệu / Tiêu đề</label>
              <input
                type="text"
                placeholder="Nhập tiêu đề hiển thị (Ví dụ: Slide bài 1, Giáo trình...)"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-800 dark:text-slate-100 font-medium outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Tệp tin đính kèm</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="material-file-input-modal"
                  className="hidden"
                  onChange={(e) => setMaterialFile(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("material-file-input-modal").click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 hover:border-indigo-500 transition-colors cursor-pointer bg-white dark:bg-transparent"
                >
                  <span className="material-symbols-outlined text-base">attach_file</span>
                  <span className="truncate max-w-[250px]">{materialFile ? materialFile.name : "Chọn tệp tài liệu từ máy tính"}</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">Hỗ trợ các file định dạng phổ biến như PDF, Word, Excel, PowerPoint, ZIP, ảnh... dung lượng tối đa 15MB.</p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setMaterialTitle("");
                  setMaterialFile(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-355 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploadingMat || !materialFile}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all border-0 shadow-md shadow-indigo-600/10"
              >
                {uploadingMat ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">cloud_upload</span>
                    Tải lên
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewUrl && (
        <Modal
          isOpen={!!previewUrl}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewType("");
            setPreviewTitle("");
          }}
          title={`Xem trước: ${previewTitle}`}
          size="xl"
        >
          <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-955 rounded-xl overflow-hidden">
            {previewType === "image" && (
              <img src={previewUrl} alt={previewTitle} className="max-w-full max-h-full object-contain p-2" />
            )}
            {previewType === "pdf" && (
              <iframe src={previewUrl} title={previewTitle} className="w-full h-full border-0" />
            )}
            {previewType === "unsupported" && (
              <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
                <span className="material-symbols-outlined text-5xl text-slate-400">lock_reset</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-350">Xem trước không khả dụng cho định dạng này</p>
                <p className="text-xs text-slate-450 leading-relaxed">Vui lòng tải tệp này xuống máy tính để xem nội dung chi tiết.</p>
                <a
                  href={previewUrl}
                  download
                  className="mt-2 flex items-center justify-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all border-0 shadow-md shadow-indigo-600/10"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Tải xuống tài liệu
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </MainLayout>
  );
};

export default MaterialsPage;
