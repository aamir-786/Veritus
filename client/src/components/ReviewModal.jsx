import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { api } from '../services/api';

export default function ReviewModal({ isOpen, onClose, onSuccess, productType, productId, productName }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setSelectedTags([]);
      setComment('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTags = () => {
    switch(productType) {
      case 'course': return ["Great Teaching", "Easy to Understand", "Actionable Advice", "Comprehensive"];
      case 'template': return ["Premium Quality", "Ready to Present", "Time Saver", "Professional Design"];
      case 'question': return ["Highly Relevant", "Thought Provoking", "Great Value", "Practical Scenarios"];
      default: return [];
    }
  };
  const availableTags = getTags();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const finalComment = selectedTags.length > 0 
      ? `${selectedTags.map(t => `[${t}]`).join(' ')}\n\n${comment}`.trim()
      : comment.trim();

    try {
      const data = await api.createReview({
        product_type: productType,
        product_id: productId,
        rating,
        comment: finalComment
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Leave a Review</h2>
              <p className="text-sm text-slate-600 mt-1">
                Tell us what you think about {productName ? <span className="font-semibold">"{productName}"</span> : 'this'}.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-emerald-600 fill-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Thank you!</h3>
              <p className="text-slate-600">Your review has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  How would you rate it?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          (hoverRating || rating) >= star 
                            ? 'text-emerald-500 fill-emerald-500' 
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Quick feedback (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          selectedTags.includes(tag)
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like? What could be improved?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none min-h-[100px]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="flex-1 px-4 py-2.5 font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
