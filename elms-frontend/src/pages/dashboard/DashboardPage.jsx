import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import MainLayout from '../../components/MainLayout';
import Toast from '../../components/Toast';
import { t } from '../../api/translation';


import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import TADashboard from './TADashboard';
import StudentDashboard from './StudentDashboard';

const DashboardPage = () => {
    const [profile, setProfile] = useState(null);
    const [extraData, setExtraData] = useState(null);
    const [loadingExtra, setLoadingExtra] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const hasWelcomeToast = sessionStorage.getItem("showWelcomeToast");
        if (hasWelcomeToast) {
            setShowToast(true);
            sessionStorage.removeItem("showWelcomeToast");
        }
    }, []);

    useEffect(() => {
        axiosClient.get('/users/profile')
            .then(response => {
                const userProfile = response.data;
                setProfile(userProfile);
                if (userProfile.avatar) localStorage.setItem("avatar", userProfile.avatar);
                if (userProfile.code) localStorage.setItem("code", userProfile.code);
                return axiosClient.get('/dashboard/data');
            })
            .then(res => {
                setExtraData(res.data);
                setLoadingExtra(false);
            })
            .catch(error => {
                console.error("Lỗi xác thực hệ thống!", error);
                localStorage.clear();
                navigate('/login');
            });
    }, [navigate]);

    if (!profile) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-medium text-slate-500">{t("loadingData")}</div>
            </div>
        </div>
    );

    const renderDashboardContent = () => {
        if (loadingExtra) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="text-sm font-medium text-slate-400 animate-pulse">{t("syncingDashboard")}</div>
                </div>
            );
        }

        const role = profile.roleName?.toUpperCase();

        switch (role) {
            case 'ADMIN':
                return <AdminDashboard stats={extraData?.stats} recentLogs={extraData?.recentLogs} />;
            case 'TEACHER':
                return <TeacherDashboard classes={extraData?.classes} />;
            case 'TA':
                return <TADashboard tasks={extraData?.tasks} />;
            case 'STUDENT':
                return <StudentDashboard studentData={extraData?.studentData} />;
            default:
                return (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
                        {t("unknownRoleError")}
                    </div>
                );
        }
    };

    return (
        <>
            <MainLayout
                title={t("dashboardTitle")}
                description={t("dashboardDesc")}
            >
                {renderDashboardContent()}
            </MainLayout>

            <Toast 
                show={showToast} 
                message={t("welcomeBack").replace("{name}", profile?.fullName || localStorage.getItem('fullName') || "")} 
                type="success" 
                onClose={() => setShowToast(false)} 
            />
        </>
    );
};

export default DashboardPage;