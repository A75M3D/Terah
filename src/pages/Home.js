import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseList from '../components/CourseList';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* الهيدر */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        🎓 أكاديمية التعلم الإلكتروني
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        منصة تعليمية متكاملة تقدم دورات عالية الجودة مع شهادات معتمدة عبر واتساب
                    </p>
                </header>

                {/* الدورات */}
                <section>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">الدورات المتاحة</h2>
                        <a 
                            href="/admin" 
                            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg"
                        >
                            لوحة التحكم
                        </a>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">جاري تحميل الدورات...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow">
                            <p className="text-gray-600 text-lg">لا توجد دورات متاحة حالياً</p>
                            <p className="text-gray-500 mt-2">قم بإضافة دورات من لوحة التحكم</p>
                        </div>
                    ) : (
                        <CourseList courses={courses} />
                    )}
                </section>

                {/* المميزات */}
                <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="text-4xl mb-4">🎬</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">دروس فيديو متكاملة</h3>
                        <p className="text-gray-600">محتوى تعليمي عالي الجودة عبر يوتيوب</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="text-4xl mb-4">📜</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">شهادات معتمدة</h3>
                        <p className="text-gray-600">احصل على شهادة إتمام عبر واتساب بسهولة</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">متجاوب مع جميع الأجهزة</h3>
                        <p className="text-gray-600">تعلم من أي جهاز في أي وقت</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
