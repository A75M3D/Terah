import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        playlistId: ''
    });
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingCourse) {
            setEditingCourse({ ...editingCourse, [name]: value });
        } else {
            setNewCourse({ ...newCourse, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await axios.put(`http://localhost:5000/api/courses/${editingCourse._id}`, editingCourse);
                setEditingCourse(null);
            } else {
                await axios.post('http://localhost:5000/api/courses', newCourse);
                setNewCourse({ title: '', description: '', playlistId: '' });
            }
            fetchCourses();
            alert(editingCourse ? 'تم تحديث الدورة بنجاح' : 'تم إضافة الدورة بنجاح');
        } catch (error) {
            console.error('Error saving course:', error);
            alert('حدث خطأ أثناء حفظ الدورة');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse({ ...course });
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
            try {
                await axios.delete(`http://localhost:5000/api/courses/${id}`);
                fetchCourses();
                alert('تم حذف الدورة بنجاح');
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('حدث خطأ أثناء حذف الدورة');
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingCourse(null);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة تحكم المدير</h1>
            
            {/* نموذج إضافة/تعديل دورة */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">عنوان الدورة:</label>
                        <input
                            type="text"
                            name="title"
                            value={editingCourse ? editingCourse.title : newCourse.title}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">الوصف:</label>
                        <textarea
                            name="description"
                            value={editingCourse ? editingCourse.description : newCourse.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">معرف قائمة يوتيوب (Playlist ID):</label>
                        <input
                            type="text"
                            name="playlistId"
                            value={editingCourse ? editingCourse.playlistId : newCourse.playlistId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="PLxxxxxxxxxxxxxxxxxxxx"
                            required
                        />
                        <p className="text-gray-500 text-sm mt-1">
                            يمكنك الحصول على Playlist ID من رابط يوتيوب: https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxx
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                        >
                            {editingCourse ? 'تحديث' : 'إضافة'}
                        </button>
                        {editingCourse && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
                            >
                                إلغاء التعديل
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* جدول الدورات والإحصائيات */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">الدورات والإحصائيات</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3 text-gray-700">العنوان</th>
                                <th className="p-3 text-gray-700">معرف القائمة</th>
                                <th className="p-3 text-gray-700">طلبات الشهادات</th>
                                <th className="p-3 text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{course.title}</td>
                                    <td className="p-3">
                                        <code className="bg-gray-100 px-2 py-1 rounded">{course.playlistId}</code>
                                    </td>
                                    <td className="p-3">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                            {course.certificateRequests}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
