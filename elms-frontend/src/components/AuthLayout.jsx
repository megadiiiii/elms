import React from "react";
import { t } from "../api/translation";

const AuthLayout = ({ children }) => {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-[#f7f9fb] flex items-center justify-center font-sans">
      <main className="w-full h-full grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-white shadow-none">
        <section className="hidden md:flex md:col-span-5 lg:col-span-6 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] relative flex-col justify-between p-12 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              alt="Oxford Library"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoi07N85v0RfFirnkiEeS8k5huPcnjhkWSW0HyZJmfr0kQoQeKRiQ6PMOWP8jdHblT7JyBeaLeMFeVXdL70Ow6Zr_MGRO1kKBvFNnf_XY6Vq_H7hnl2Jsl3tuODBsgQ-KEySZl38UWVR-beU63EpVSFvi7L10EQPNsYZI8isqrSG4omsh7s-AfTJR1ypOJaYgKllaqWA6ENBTGkWFr1nk_wMQg5uJkH2P3QJo63-Z81_OW_yHfZQoH6CBXSM736cLz6emT2Nz2XrUR"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-4xl">
                menu_book
              </span>
              <h1 className="text-2xl font-black tracking-tighter uppercase">
                Scholarly
              </h1>
            </div>
            <div className="space-y-6 max-w-md mb-12">
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {t("loginText")} <br />
                <span className="text-amber-200">{t("loginSubtext")}</span>.
              </h2>
            </div>
          </div>
        </section>

        {/* 📝 CỘT PHẢI: Khung chứa ruột Form động */}
        <section className="col-span-1 md:col-span-7 lg:col-span-6 bg-white flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h3 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
                {t("loginWelcome")}
              </h3>
              <p className="text-slate-500 text-base">
                {t("loginInstruction")}
              </p>
            </div>

            {/* Ruột Form thực tế sẽ được bơm vào đây */}
            {children}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthLayout;
