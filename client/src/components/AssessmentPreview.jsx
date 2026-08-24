import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

export default function AssessmentPreview({ lessonId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getAssessmentQuestions(lessonId);
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center p-8 text-slate-500 animate-pulse text-sm">Loading assessment questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">No Questions Yet</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          Use the "Manage Questions" button above to add interactive questions to this assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-200 pb-2">
        Preview: {questions.length} Questions
      </h3>
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex gap-3 mb-4">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
                  {q.question_type === 'mcq' ? 'Multiple Choice' : q.question_type === 'true_false' ? 'True / False' : 'Descriptive'}
                </span>
                <p className="text-sm font-medium text-slate-900">{q.question_text}</p>
              </div>
            </div>

            {(q.question_type === 'mcq' || q.question_type === 'true_false') && q.options && (
              <div className="space-y-2 ml-9">
                {q.options.map((opt, i) => (
                  <div 
                    key={i} 
                    className={`px-4 py-2.5 rounded-lg border text-sm flex justify-between items-center ${i === q.correct_option_index ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                  >
                    <span>{opt}</span>
                    {i === q.correct_option_index && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            )}
            
            {q.question_type === 'descriptive' && (
              <div className="ml-9 p-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm italic">
                Learner will provide a free-text answer here.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
