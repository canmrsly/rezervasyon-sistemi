import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Randevu Sistemi</h1>
                        <nav className="hidden md:flex gap-4">
                            <a href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Randevular</a>
                            <a href="/admin/services" className="text-gray-600 hover:text-blue-600 font-medium">Hizmetler</a>
                            <a href="/admin/staff" className="text-gray-600 hover:text-blue-600 font-medium">Personel</a>
                            <a href="/admin/business" className="text-gray-600 hover:text-blue-600 font-medium">Ayarlar</a>
                        </nav>
                    </div>
                    {/* Gelecekte buraya çıkış yap butonu eklenebilir */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Randevu Sistemi. Tüm hakları saklıdır.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
