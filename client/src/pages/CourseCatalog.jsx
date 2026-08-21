import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, PlayCircle, Layers, ShoppingCart, Star } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

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
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <Helmet>
        <title>Masterclasses | Veritus</title>
        <meta name="description" content="Browse our library of premium risk management masterclasses." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-12 md:pb-16 space-y-6 md:space-y-8 text-slate-900 bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-100/80 text-blue-900 border border-blue-200 text-xs font-bold uppercase">
          <BookOpen className="w-3.5 h-3.5 text-blue-700" /> Executive Masterclass Series
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Deciding in the Dark Masterclasses
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          In-depth video courses led by senior risk practitioners. Convert regulatory pressure into strategic capital payback.
        </p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs group h-full">
            <div>
              <div className="relative overflow-hidden">
                <img src={course.cover_image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} alt={course.title} className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold border border-blue-200 shadow-xs">
                  {course.tier}
                </div>
              </div>

              <div className="p-3 space-y-2">
                <h3 className="font-display text-base font-bold text-slate-900 leading-tight">{course.title}</h3>
                
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`flex ${course.rating_count > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${course.rating_count > 0 && course.rating_avg >= i ? 'fill-emerald-500 text-emerald-500' : (course.rating_count > 0 && course.rating_avg >= i - 0.5 ? 'fill-emerald-500 text-emerald-500 opacity-50' : 'fill-slate-200 text-slate-200')}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">
                    {course.rating_count > 0 ? `${course.rating_avg} (${course.rating_count} reviews)` : 'No reviews'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mt-1">{course.headline}</p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-700" /> {course.module_count} Modules
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="w-3 h-3 text-blue-700" /> {course.lesson_count} Lessons
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold w-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Gated Access Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 mt-auto">
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-extrabold text-emerald-800">${course.price}</div>
                  <div className="text-[10px] font-bold text-slate-400 line-through">${(course.price * 1.5).toFixed(0)}</div>
                </div>
                <div className="text-[9px] text-slate-500 uppercase font-mono font-medium mt-0.5">Single Pay License</div>
              </div>
              <div className="flex gap-2 w-full xl:w-auto">
                <button
                  onClick={() => addToCart({ ...course, type: 'Course' })}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 transition-colors text-[11px] flex items-center gap-1 shadow-xs flex-1 justify-center xl:flex-none"
                >
                  <ShoppingCart className="w-3 h-3" /> Add
                </button>
                <Link
                  to={`/courses/${course.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors text-[11px] flex items-center gap-1 shadow-xs flex-1 justify-center xl:flex-none"
                >
                  Syllabus <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      </div>
    </div>
  );
}
