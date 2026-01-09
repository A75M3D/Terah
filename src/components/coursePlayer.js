import React, { useState } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';

const CoursePlayer = ({ course }) => {
    const [studentName, setStudentName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);

    const youtubeOptions = {
        height: '500',
        width: '100%',
        playerVars: {
            autoplay: 0,
            listType: 'playlist',
            list: course.playlistId
        },
    };

    const handleCertificateRequest = async () => {
        if (!studentName.trim()) {
            alert('الرجاء إدخال اسمك');
            return;
        }

        try {
            // تحديث عداد الطلبات في الباك إند
            await axios.patch(`http://localhost:5000/api/courses/${course._id}/certificate`);
            
            // إنشاء رسالة واتساب
            const phoneNumber = '966500000000'; // استبدل برقمك
            const message = `مرحباً، أنا ${studentName} وأريد الحصول على شهادة دورة ${course.title}`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            // فتح واتساب
            window.open(whatsappUrl, '_blank');
            
            // إعادة تعيين الحقل
            setStudentName('');
            setShowNameInput(false);
            
            alert('تم إرسال طلب الشهادة بنجاح! سيتم فتح واتساب للتواصل مع المسؤول.');
        } catch (error) {
            console.error('Error requesting certificate:', error);
            alert('حدث خطأ أثناء طلب الشهادة');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-6">{course.description}</p>
                
                <div className="youtube-container mb-6 rounded-lg overflow-hidden">
                    <YouTube videoId={course.playlistId.split(',')[0]} opts={youtubeOptions} />
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">🎓 طلب شهادة إتمام الدورة</h3>
                    
                    {!showNameInput ? (
                        <button
                            onClick={() => setShowNameInput(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors duration-300"
                        >
                            اطلب شهادتك عبر واتساب
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2">اسم الطالب:</label>
                                <input
                                    type="text"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل اسمك الكامل"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCertificateRequest}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <span>إرسال الطلب</span>
                                    <span>📱</span>
                                </button>
                                <button
                                    onClick={() => setShowNameInput(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-gray-600 mt-4 text-sm">
                        📊 عدد طلبات الشهادات لهذه الدورة: {course.certificateRequests}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
