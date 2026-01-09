import React from 'react';
import { Link } from 'react-router-dom';

const CourseList = ({ courses }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
                <div key={course._id} className="course-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{course.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                📊 طلبات الشهادات: {course.certificateRequests}
                            </span>
                            <Link
                                to={`/course/${course._id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                            >
                                ابدأ التعلم
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
