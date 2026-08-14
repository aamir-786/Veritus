import re

with open('client/src/pages/AdminStudio.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for AdminQuestionModal
import_str = "import { ChevronRight, FileText, Layers, PlayCircle, Plus, Search, Trash2, Edit2 } from 'lucide-react';\nimport AdminQuestionModal from '../components/AdminQuestionModal';"
content = re.sub(r"import \{ ChevronRight, FileText, Layers, PlayCircle, Plus, Search, Trash2, Edit2 \} from 'lucide-react';", import_str, content)

# 2. Add state for Question Modal
state_repl = """  // Question Form State
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Edit Question State
  const [searchQuery, setSearchQuery] = useState('');"""
content = re.sub(
    r"  // Question Form State[\s\S]*?// Edit Question State[\s\S]*?const \[searchQuery, setSearchQuery\] = useState\(''\);\s*const \[editQuestionId, setEditQuestionId\] = useState\(''\);\s*const \[editQuestionRegulator, setEditQuestionRegulator\] = useState\('High'\);", 
    state_repl, 
    content
)

# 3. Replace handleCreateQuestion and handleUpdateQuestionTag with handleSaveQuestion
handle_save_repl = """  const handleSaveQuestion = async (formData, id) => {
    try {
      if (id) {
        const res = await api.updateQuestion(id, formData);
        if (res.success) {
          fetchData();
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }
      } else {
        const res = await api.createQuestion(formData);
        if (res.success) {
          fetchData();
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };"""
content = re.sub(
    r"  const handleCreateQuestion = async[\s\S]*?const handleUpdateQuestionTag = async[\s\S]*?catch \(err\) \{\s*console\.error\(err\);\s*\}\s*\};",
    handle_save_repl,
    content
)

# 4. Replace the old inline form and table rows
old_form_table_pattern = r"\{/\* Create Question Form \*/\}[\s\S]*?\{/\* --- USERS TAB --- \*/\}"
new_form_table_repl = """{/* --- USERS TAB --- */}"""

# We need to selectively replace the form and the table edit button. Let's just do it cleanly by finding the start of the form up to the table end.
# Actually, the entire questions tab can be replaced:
old_questions_tab_pattern = r"\{/\* --- QUESTIONS TAB --- \*/\}[\s\S]*?\{/\* --- USERS TAB --- \*/\}"

new_questions_tab = """{/* --- QUESTIONS TAB --- */}
        {activeTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Taxonomy Manager</h1>
                <p className="text-slate-500 text-xs mt-1">Manage the 100 Risk Questions and regulator tags.</p>
              </div>
              <button 
                onClick={() => { setEditingQuestion(null); setShowQuestionForm(true); }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> New Question
              </button>
            </div>

            <AdminQuestionModal 
              isOpen={showQuestionForm} 
              onClose={() => { setShowQuestionForm(false); setEditingQuestion(null); }} 
              question={editingQuestion} 
              onSave={handleSaveQuestion} 
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search taxonomy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-white sticky top-0 z-10 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 w-12">ID</th>
                      <th className="px-4 py-3">Question Title</th>
                      <th className="px-4 py-3 w-40">Domain</th>
                      <th className="px-4 py-3 w-36">Pressure</th>
                      <th className="px-4 py-3 w-20">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          Q{q.question_number}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {q.title}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">
                          {q.domain}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide
                              ${q.regulator_pressure === 'High' ? 'bg-rose-50 text-rose-600' : 
                                q.regulator_pressure === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
                            `}>
                              {q.regulator_pressure}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setShowQuestionForm(true);
                            }}
                            className="p-1 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredQuestions.length === 0 && (
                      <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">No taxonomy questions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}"""

content = re.sub(old_questions_tab_pattern, new_questions_tab, content)

with open('client/src/pages/AdminStudio.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Refactored AdminStudio.jsx")
