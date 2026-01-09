import React from 'react';
import AdminPanel from '../components/AdminPanel';

const Admin = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4">
                <a 
                    href="/" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    ← العودة للصفحة الرئيسية
                </a>
                <AdminPanel />
            </div>
        </div>
    );
};

export default Admin;
