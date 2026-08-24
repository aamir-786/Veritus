import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function AssessmentBuilderModal({ lesson, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const draftKey = `draft_q_${lesson.id}`;

  const getSavedState = (key, defaultVal) => {
    try {
      const item = localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : null;
      return parsed !== null && parsed !== undefined ? parsed : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [questionType, setQuestionType] = useState(() => getSavedState(`${draftKey}_type`, 'mcq'));
  const [questionText, setQuestionText] = useState(() => getSavedState(`${draftKey}_text`, ''));
  const [options, setOptions] = useState(() => getSavedState(`${draftKey}_options`, ['', '']));
  const [correctIndex, setCorrectIndex] = useState(() => getSavedState(`${draftKey}_correct`, 0));
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Auto-save drafts to local storage when NOT editing an existing question
  useEffect(() => {
    if (!editingId) {
      localStorage.setItem(`${draftKey}_type`, JSON.stringify(questionType));
      localStorage.setItem(`${draftKey}_text`, JSON.stringify(questionText));
      localStorage.setItem(`${draftKey}_options`, JSON.stringify(options));
      localStorage.setItem(`${draftKey}_correct`, JSON.stringify(correctIndex));
    }
  }, [questionType, questionText, options, correctIndex, editingId, draftKey]);

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setQuestionType(type);
    if (type === 'true_false') {
      setOptions(['True', 'False']);
      setCorrectIndex(0);
    } else if (type === 'mcq') {
      setOptions(['', '']);
      setCorrectIndex(0);
    } else {
      setOptions([]); // For descriptive
      setCorrectIndex(0);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [lesson.id]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getAssessmentQuestions(lesson.id);
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const resetForm = (clearDraft = false) => {
    setEditingId(null);
    if (clearDraft) {
      setQuestionType('mcq');
      setQuestionText('');
      setOptions(['', '']);
      setCorrectIndex(0);
      localStorage.removeItem(`${draftKey}_type`);
      localStorage.removeItem(`${draftKey}_text`);
      localStorage.removeItem(`${draftKey}_options`);
      localStorage.removeItem(`${draftKey}_correct`);
    } else {
      // Restore draft when cancelling an edit
      setQuestionType(getSavedState(`${draftKey}_type`, 'mcq'));
      setQuestionText(getSavedState(`${draftKey}_text`, ''));
      setOptions(getSavedState(`${draftKey}_options`, ['', '']));
      setCorrectIndex(getSavedState(`${draftKey}_correct`, 0));
    }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setQuestionType(q.question_type || 'mcq');
    setQuestionText(q.question_text);
    setOptions(q.options || ['', '']);
    setCorrectIndex(q.correct_option_index || 0);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return; // Minimum 2 options
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctIndex === index) {
      setCorrectIndex(0);
    } else if (correctIndex > index) {
      setCorrectIndex(correctIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText) {
      alert("Please fill out the question text.");
      return;
    }
    if ((questionType === 'mcq' || questionType === 'true_false') && options.some(opt => !opt.trim())) {
      alert("Please fill out all options.");
      return;
    }

    const payload = {
      question_type: questionType,
      question_text: questionText,
      options: (questionType === 'mcq' || questionType === 'true_false') ? options.map(o => o.trim()) : [],
      correct_option_index: (questionType === 'mcq' || questionType === 'true_false') ? correctIndex : 0
    };

    try {
      if (editingId) {
        const res = await api.updateAssessmentQuestion(editingId, payload);
        if (res.success) {
          fetchQuestions();
          resetForm(false); // Done editing, restore draft
        } else {
          alert(`Failed to update question: ${res.error || 'Unknown error'}`);
        }
      } else {
        const res = await api.addAssessmentQuestion(lesson.id, payload);
        if (res.success) {
          fetchQuestions();
          resetForm(true); // Successfully added new question, clear draft!
        } else {
          alert(`Failed to add question: ${res.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      const res = await api.deleteAssessmentQuestion(questionToDelete);
      if (res.success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">Assessment Builder</h2>
            <p className="text-xs text-slate-500 mt-1">Managing questions for lesson: {lesson.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Column */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                {editingId ? <><Edit2 className="w-4 h-4 text-amber-500" /> Edit Question</> : <><Plus className="w-4 h-4 text-indigo-600" /> Add New Question</>}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1 pb-4 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                    <span>Question Type</span>
                  </label>
                  <select 
                    value={questionType}
                    onChange={handleTypeChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="true_false">True / False</option>
                    <option value="descriptive">Descriptive (Text Answer)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question Text</label>
                  <textarea 
                    required 
                    value={questionText} 
                    onChange={e => setQuestionText(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm resize-y" 
                    placeholder="Enter the question..."
                  />
                </div>

                {(questionType === 'mcq' || questionType === 'true_false') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                      <span>Answers / Options</span>
                      {questionType === 'mcq' && (
                        <button type="button" onClick={handleAddOption} className="text-indigo-600 hover:text-indigo-700 text-[10px]">
                          + Add Option
                        </button>
                      )}
                    </label>
                    
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="correctAnswer" 
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input 
                          type="text" 
                          required 
                          value={opt}
                          onChange={e => handleOptionChange(idx, e.target.value)}
                          disabled={questionType === 'true_false'}
                          className={`flex-1 px-3 py-1.5 rounded bg-slate-50 border text-sm ${correctIndex === idx ? 'border-green-300 bg-green-50/30' : 'border-slate-200'} ${questionType === 'true_false' ? 'opacity-70' : ''}`}
                          placeholder={`Option ${idx + 1}`}
                        />
                        {questionType === 'mcq' && options.length > 2 && (
                          <button type="button" onClick={() => handleRemoveOption(idx)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-500 italic mt-1">Select the radio button next to the correct answer.</p>
                  </div>
                )}
                
                {questionType === 'descriptive' && (
                  <div className="pt-2">
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm text-center italic">
                      Users will write their own text answer for this question. Note: You should instruct them to write under 300 words (or ~1500 characters) in your Question Text above.
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors">
                    {editingId ? 'Update Question' : 'Save Question'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => resetForm(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Questions List Column */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Existing Questions ({questions.length})</h3>
              
              {loading ? (
                <div className="text-sm text-slate-500">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500">No questions added yet. Use the form to create your first question.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800">Q{idx + 1}. {q.question_text}</h4>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{q.question_type === 'descriptive' ? 'TEXT' : (q.question_type || 'MCQ')}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(q)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setQuestionToDelete(q.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {q.question_type !== 'descriptive' ? (
                          <div className="mt-3 space-y-1.5 pl-1">
                            {(q.options || []).map((opt, i) => (
                              <div key={i} className={`text-xs flex items-center gap-2 ${i === q.correct_option_index ? 'text-green-700 font-medium bg-green-50/50 p-1.5 rounded' : 'text-slate-500 px-1.5'}`}>
                                {i === q.correct_option_index ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-3 text-xs italic text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            (Descriptive Question: User will provide a text answer)
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!questionToDelete}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
}
