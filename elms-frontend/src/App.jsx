import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StaffPage from './pages/staff/StaffPage';
import StaffFormPage from './pages/staff/StaffFormPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import CoursePage from './pages/course/CoursePage';
import ClassPage from './pages/class/ClassPage';
import ClassFormPage from './pages/class/ClassFormPage';
import ClassroomPage from './pages/classroom/ClassroomPage';
import Error403Page from './pages/Error403Page';
import Error404Page from './pages/Error404Page';
import StudentPage from './pages/student/StudentPage';
import StudentFormPage from './pages/student/StudentFormPage';
import StudentDetailPage from './pages/student/StudentDetailPage';
import ClassDetailPage from './pages/class/ClassDetailPage';
import AttendancePage from './pages/class/AttendancePage';
import GradePage from './pages/class/GradePage';
import SchedulePage from './pages/schedule/SchedulePage';
import MaterialsPage from './pages/course/MaterialsPage';
import AuditLogPage from './pages/audit/AuditLogPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* Vừa vào web là ép cút thẳng sang trang login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Định tuyến màn hình Login xịn sò */}
                <Route path="/login" element={<LoginPage />} />

                {/* Định tuyến màn hình Dashboard đã bọc MainLayout */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Định tuyến màn hình quản lý nhân viên */}
                <Route path="/admin/users" element={<StaffPage />} />
                <Route path="/admin/users/create" element={<StaffFormPage />} />
                <Route path="/admin/users/edit/:id" element={<StaffFormPage />} />
                <Route path="/admin/users/detail/:id" element={<StaffDetailPage />} />

                {/* Định tuyến màn hình quản lý phòng học */}
                <Route path="/admin/classrooms" element={<ClassroomPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogPage />} />

                {/* Định tuyến trang cá nhân */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Định tuyến trang quản lý khóa học và lớp học */}
                <Route path="/courses" element={<CoursePage />} />
                <Route path="/classes" element={<ClassPage />} />
                <Route path="/classes/create" element={<ClassFormPage />} />
                <Route path="/classes/edit/:id" element={<ClassFormPage />} />
                <Route path="/classes/detail/:id" element={<ClassDetailPage />} />
                <Route path="/classes/attendance/:classId" element={<AttendancePage />} />
                <Route path="/classes/grades/:classId" element={<GradePage />} />
                {/* Định tuyến trang quản lý học viên */}
                <Route path="/students" element={<StudentPage />} />
                <Route path="/admin/students/create" element={<StudentFormPage />} />
                <Route path="/admin/students/edit/:id" element={<StudentFormPage />} />
                <Route path="/admin/students/detail/:id" element={<StudentDetailPage />} />

                <Route path="/materials" element={<MaterialsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />

                {/* Gõ bừa URL, chuyển tới trang báo lỗi 404 */}
                <Route path="*" element={<Error404Page />} />
            </Routes>
        </Router>
    );
}

export default App;