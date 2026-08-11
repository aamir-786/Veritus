// questionsController.js - 100 Questions Taxonomy & AI Risk Copilot
const db = require('../data/dbStore');

// Filter 100 Risk Questions by 7 Taxonomy Tags & Search Query
exports.getQuestions = (req, res) => {
  const { 
    search, 
    domain, 
    effort, 
    duration, 
    cost, 
    payback, 
    tier, 
    regulator_pressure, 
    leadership_traits 
  } = req.query;

  let filtered = [...db.questions];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q)
    );
  }

  if (domain && domain !== 'All') {
    filtered = filtered.filter(item => item.domain === domain);
  }
  if (effort && effort !== 'All') {
    filtered = filtered.filter(item => item.effort === effort);
  }
  if (duration && duration !== 'All') {
    filtered = filtered.filter(item => item.duration === duration);
  }
  if (cost && cost !== 'All') {
    filtered = filtered.filter(item => item.cost === cost);
  }
  if (payback && payback !== 'All') {
    filtered = filtered.filter(item => item.payback === payback);
  }
  if (tier && tier !== 'All') {
    filtered = filtered.filter(item => item.tier === tier);
  }
  if (regulator_pressure && regulator_pressure !== 'All') {
    filtered = filtered.filter(item => item.regulator_pressure === regulator_pressure);
  }
  if (leadership_traits && leadership_traits !== 'All') {
    filtered = filtered.filter(item => item.leadership_traits === leadership_traits);
  }

  return res.json({
    success: true,
    total: filtered.length,
    questions: filtered
  });
};

// Get single question detail
exports.getQuestionById = (req, res) => {
  const { id } = req.params;
  const question = db.questions.find(q => q.id === id || q.question_number === parseInt(id));

  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }

  return res.json({
    success: true,
    question
  });
};

// AI Risk Decision Copilot - Tailor a Question to an Organization's Context
exports.generateAIRiskAdvice = (req, res) => {
  const { question_id, org_type, org_size, primary_concern } = req.body;

  const question = db.questions.find(q => q.id === question_id || q.question_number === parseInt(question_id));
  if (!question) {
    return res.status(404).json({ success: false, error: 'Target question not found' });
  }

  const organization = org_type || 'Financial Institution / Enterprise';
  const concern = primary_concern || 'Audit readiness & regulator compliance';

  const aiRecommendation = {
    question_title: question.title,
    organization_context: `${organization} (Scale: ${org_size || 'Mid-Market to Enterprise'})`,
    primary_concern: concern,
    tailored_action_plan: [
      `1. **Custom Governance Control:** Adapt Q${question.question_number} guidance specifically for ${organization}. Institute a dedicated risk taskforce reporting to the Risk Committee.`,
      `2. **Resource Allocation (${question.effort} Effort, ${question.cost} Cost):** Execute rapid 14-day control baselining focused on ${question.domain}.`,
      `3. **Regulator Communication:** Given ${question.regulator_pressure} regulator pressure, prepare a dedicated briefing binder addressing ${concern} before quarterly audit submission.`,
      `4. **Leadership Directives:** Deploy ${question.leadership_traits} principles to align engineering and compliance teams on shared accountability.`
    ],
    recommended_template: db.templates[0].title,
    estimated_payback_timeline: question.duration
  };

  return res.json({
    success: true,
    copilot_advice: aiRecommendation
  });
};
