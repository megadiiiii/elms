import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import MainLayout from "../../components/MainLayout";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import axiosClient from "../../api/axiosClient";
import { t } from "../../api/translation";

const SchedulePage = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const role = localStorage.getItem("role") || "STUDENT";
  const isAdmin = role === "ADMIN";
  const initialView = isAdmin ? "dayGridMonth" : "timeGridWeek";

  const [currentTitle, setCurrentTitle] = useState("");
  const [currentView, setCurrentView] = useState(initialView);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/schedule");
      setEvents(response.data);
    } catch (err) {
      console.error("Failed to fetch schedule events:", err);
      showToast(t("systemError") || "Lỗi tải lịch học!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleEventClick = (clickInfo) => {
    const { title, start, end, id } = clickInfo.event;
    const { room, teacherName, taName, classCode, courseName } = clickInfo.event.extendedProps;

    setSelectedEvent({
      id,
      title,
      start,
      end,
      room,
      teacherName,
      taName,
      classCode,
      courseName
    });
    setShowModal(true);
  };

  // Convert FullCalendar event formatting to a clean time string
  const formatEventTime = (dateObj) => {
    if (!dateObj) return "";
    return dateObj.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatEventDate = (dateObj) => {
    if (!dateObj) return "";
    return dateObj.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const capitalizeTitle = (titleStr) => {
    if (!titleStr) return "";
    return titleStr.charAt(0).toUpperCase() + titleStr.slice(1);
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  const handleViewChange = (viewType) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(viewType);
      setCurrentView(viewType);
    }
  };

  const handleDatesSet = (dateInfo) => {
    setCurrentTitle(dateInfo.view.title);
    setCurrentView(dateInfo.view.type);
  };

  const renderEventContent = (eventInfo) => {
    const { room, classCode } = eventInfo.event.extendedProps;
    const color = eventInfo.event.backgroundColor || "#6366f1";

    // For Month View (Compact single line view)
    if (eventInfo.view.type === "dayGridMonth") {
      return (
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 h-full w-full rounded-md text-[10px] border-l-2 hover:brightness-[0.95] dark:hover:brightness-[1.05] transition-all truncate select-none shadow-sm/50"
          style={{
            borderLeftColor: color,
            backgroundColor: `${color}12`,
            color: color
          }}
        >
          <span className="truncate flex-1 font-bold">{eventInfo.event.title}</span>
          {room && (
            <span
              className="text-[8px] font-mono font-bold px-1 rounded shrink-0"
              style={{ backgroundColor: `${color}1a` }}
            >
              {room}
            </span>
          )}
        </div>
      );
    }

    // For Week / Day Views (Detailed card view)
    return (
      <div
        className="flex flex-col p-1.5 h-full w-full overflow-hidden text-xs rounded-xl border border-transparent select-none transition-all hover:brightness-[0.97] dark:hover:brightness-[1.05] cursor-pointer"
        style={{
          borderLeft: `3px solid ${color}`,
          backgroundColor: `${color}12`
        }}
      >
        <div className="font-bold truncate text-[11px] text-slate-800 dark:text-slate-100 leading-tight">
          {eventInfo.event.title}
        </div>

        {/* Compact details row: Class code & Room */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="font-mono">{classCode}</span>
          {room && (
            <>
              <span className="opacity-50">•</span>
              <span
                className="px-1 rounded text-[8px] font-bold shrink-0"
                style={{
                  backgroundColor: `${color}1a`,
                  color: color
                }}
              >
                {room}
              </span>
            </>
          )}
        </div>

        {/* Time row */}
        <div className="flex items-center gap-1 mt-1 text-[9px] font-medium text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-[10px] shrink-0" style={{ color: color }}>schedule</span>
          <span className="truncate">{eventInfo.timeText}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <MainLayout
        title={t("timeSchedule")}
        description={
          isAdmin
            ? "Quản trị lịch biểu dạy học, ca học và phòng học toàn trung tâm."
            : "Xem chi tiết thời khóa biểu học tập và giảng dạy của bạn."
        }
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-fade-in relative z-10">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="schedule-calendar-wrapper dark:text-slate-100">
              {/* Custom Modern Header Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-150 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">calendar_month</span>
                    {capitalizeTitle(currentTitle)}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Navigation Group */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={handlePrev}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-3 py-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer border-0 bg-transparent"
                    >
                      Hôm nay
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>

                  {/* View Tabs */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleViewChange("dayGridMonth")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${currentView === "dayGridMonth"
                              ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                          Tháng
                        </button>
                        <button
                          onClick={() => handleViewChange("timeGridWeek")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${currentView === "timeGridWeek"
                              ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                          Tuần
                        </button>
                        <button
                          onClick={() => handleViewChange("timeGridDay")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${currentView === "timeGridDay"
                              ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                          Ngày
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleViewChange("timeGridWeek")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${currentView === "timeGridWeek"
                              ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                          Tuần
                        </button>
                        <button
                          onClick={() => handleViewChange("listWeek")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-0 bg-transparent cursor-pointer ${currentView === "listWeek"
                              ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                          Danh sách
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={initialView}
                headerToolbar={false}
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                datesSet={handleDatesSet}
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                locale="vi"
                firstDay={1}
                height="auto"
                themeSystem="standard"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false
                }}
              />
            </div>
          )}
        </div>
      </MainLayout>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Thông tin buổi học"
        >
          <div className="space-y-4 pt-1">
            {/* Session Time & Date right under the title */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-500 dark:text-slate-400 font-bold text-xs pb-3 border-b border-slate-100 dark:border-slate-800 -mt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-indigo-500">calendar_month</span>
                {formatEventDate(selectedEvent.start)}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-emerald-500">schedule</span>
                {formatEventTime(selectedEvent.start)} - {formatEventTime(selectedEvent.end)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Khóa học</span>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {selectedEvent.courseName}
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Lớp học</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {role !== "STUDENT" ? (
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer" onClick={() => {
                      const classId = selectedEvent.id.split("_")[0];
                      navigate(`/classes/detail/${classId}`);
                    }}>
                      {selectedEvent.title}
                    </span>
                  ) : (
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                      {selectedEvent.title}
                    </span>
                  )}
                  <span className="font-mono text-[10px] bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-black">{selectedEvent.classCode}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-650 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">meeting_room</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Phòng học</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{selectedEvent.room || "Chưa xếp phòng"}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4.5 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[9px]">Giảng viên chính</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{selectedEvent.teacherName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider text-[9px]">Trợ giảng</span>
                <span className="text-slate-800 dark:text-slate-200 font-extrabold">{selectedEvent.taName}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
              >
                {t("close") || "Đóng"}
              </button>

              {role !== "STUDENT" && (
                <button
                  type="button"
                  onClick={() => {
                    const classId = selectedEvent.id.split("_")[0];
                    navigate(`/classes/detail/${classId}`);
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">groups</span>
                  Xem chi tiết lớp
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default SchedulePage;
