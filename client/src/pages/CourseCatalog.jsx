import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, PlayCircle, Layers } from 'lucide-react';
import { api } from '../services/api';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getCourses();
        if (res.success) setCourses(res.courses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <BookOpen className="w-4 h-4" /> Executive Video Masterclasses
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
          Deciding in the Dark Masterclasses
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          In-depth video courses led by senior risk leaders. Learn how to convert regulatory pressure into capital payback.
        </p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map(course => (
          <div key={course.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="relative">
                <img src={course.cover_image} alt={course.title} className="w-full h-56 object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/80 backdrop-blur text-amber-400 text-xs font-semibold border border-amber-500/30">
                  {course.tier}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-display text-2xl font-bold text-white">{course.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{course.headline}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-amber-400" /> {course.module_count} Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 text-indigo-400" /> {course.lesson_count} Lessons
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Gated Access Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold text-emerald-400">${course.price}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">USD Single Pay</div>
              </div>
              <Link
                to={`/courses/${course.slug}`}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition-colors text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                View Course & Syllabus <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
