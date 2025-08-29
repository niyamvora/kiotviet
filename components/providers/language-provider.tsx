/**
 * Language provider for Vietnamese/English language support
 * Manages language state and translations for the KiotViet Dashboard
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation strings
const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.sales": "Sales",
    "nav.products": "Products",
    "nav.customers": "Customers",
    "nav.orders": "Orders",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",

    // Time filters
    "time.week": "This Week",
    "time.month": "This Month",
    "time.year": "This Year",
    "time.all": "All Time",

    // Dashboard
    "dashboard.welcome": "Welcome to your Dashboard",
    "dashboard.overview": "Business Overview",
    "dashboard.revenue": "Total Revenue",
    "dashboard.orders": "Total Orders",
    "dashboard.customers": "Total Customers",
    "dashboard.products": "Total Products",

    // Auth
    "auth.login": "Sign In",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.welcome": "Welcome back!",
    "auth.createAccount": "Create Account",

    // Settings
    "settings.apiCredentials": "API Credentials",
    "settings.clientId": "Client ID",
    "settings.secretKey": "Secret Key",
    "settings.shopName": "Shop Name",
    "settings.save": "Save Settings",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
  },
  vi: {
    // Navigation
    "nav.dashboard": "Bảng điều khiển",
    "nav.sales": "Bán hàng",
    "nav.products": "Sản phẩm",
    "nav.customers": "Khách hàng",
    "nav.orders": "Đơn hàng",
    "nav.analytics": "Phân tích",
    "nav.settings": "Cài đặt",

    // Time filters
    "time.week": "Tuần này",
    "time.month": "Tháng này",
    "time.year": "Năm này",
    "time.all": "Tất cả",

    // Dashboard
    "dashboard.welcome": "Chào mừng đến với Bảng điều khiển",
    "dashboard.overview": "Tổng quan Kinh doanh",
    "dashboard.revenue": "Tổng Doanh thu",
    "dashboard.orders": "Tổng Đơn hàng",
    "dashboard.customers": "Tổng Khách hàng",
    "dashboard.products": "Tổng Sản phẩm",

    // Auth
    "auth.login": "Đăng nhập",
    "auth.signup": "Đăng ký",
    "auth.email": "Email",
    "auth.password": "Mật khẩu",
    "auth.fullName": "Họ và tên",
    "auth.welcome": "Chào mừng bạn trở lại!",
    "auth.createAccount": "Tạo tài khoản",

    // Settings
    "settings.apiCredentials": "Thông tin API",
    "settings.clientId": "Client ID",
    "settings.secretKey": "Secret Key",
    "settings.shopName": "Tên cửa hàng",
    "settings.save": "Lưu cài đặt",

    // Common
    "common.loading": "Đang tải...",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.edit": "Sửa",
    "common.view": "Xem",
    "common.search": "Tìm kiếm",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "vi"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("vi")) {
        setLanguage("vi");
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["en"]] || key
    );
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
