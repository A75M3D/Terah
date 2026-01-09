import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CoursePlayer from '../components/CoursePlayer';

const CoursePage = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل الدورة...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">الدورة غير موجودة</h2>
                    <a href="/" className="text-blue-600 hover:text-blue-800">
                        العودة للصفحة الرئيسية
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="container mx-auto px-4">
                <a 
                    href="/" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    ← العودة للدورات
                </a>
                <CoursePlayer course={course} />
            </div>
        </div>
    );
};

export default CoursePage;
