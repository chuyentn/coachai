import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { PlayCircle, Users } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition-all group">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={course.thumbnail_url || `https://picsum.photos/seed/${course.id}/600/400`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <PlayCircle className="text-white w-12 h-12" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {course.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-indigo-600 font-bold text-lg">
              {(course.price_vnd || 0).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-gray-400">
              ${course.price_usd || 0} USD
            </span>
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};
