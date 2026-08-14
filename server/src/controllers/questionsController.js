// questionsController.js - 100 Questions Taxonomy & AI Risk Copilot
const supabase = require('../config/supabase');

// Filter 100 Risk Questions by 7 Taxonomy Tags & Search Query
exports.getQuestions = async (req, res) => {
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

  try {
    let query = supabase.from('questions').select('*');

    if (search) {
      const q = search.toLowerCase();
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%,domain.ilike.%${q}%`);
    }

    if (domain && domain !== 'All') query = query.eq('domain', domain);
    if (effort && effort !== 'All') query = query.eq('effort', effort);
    if (duration && duration !== 'All') query = query.eq('duration', duration);
    if (cost && cost !== 'All') query = query.eq('cost', cost);
    if (payback && payback !== 'All') query = query.eq('payback', payback);
    if (tier && tier !== 'All') query = query.eq('tier', tier);
    if (regulator_pressure && regulator_pressure !== 'All') query = query.eq('regulator_pressure', regulator_pressure);
    if (leadership_traits && leadership_traits !== 'All') query = query.eq('leadership_traits', leadership_traits);

    const { data: filtered, error } = await query;
    
    if (error) throw error;

    return res.json({
      success: true,
      total: filtered.length,
      questions: filtered
    });
  } catch (err) {
    console.error('getQuestions Error:', err);
    return res.status(500).json({ success: false, error: 'Database error fetching questions' });
  }
};

// Get single question detail
exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    let query = supabase.from('questions').select('*');
    
    // Check if ID is a number
    if (!isNaN(id)) {
      query = query.eq('question_number', parseInt(id));
    } else {
      query = query.eq('id', id);
    }
    
    const { data: question, error } = await query.single();

    if (error || !question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    return res.json({
      success: true,
      question
    });
  } catch (err) {
    console.error('getQuestionById Error:', err);
    return res.status(500).json({ success: false, error: 'Database error fetching question' });
  }
};

// AI Risk Decision Copilot - Tailor a Question to an Organization's Context
exports.generateAIRiskAdvice = async (req, res) => {
  const { question_id, org_type, org_size, primary_concern } = req.body;

  try {
    let query = supabase.from('questions').select('*');
    if (!isNaN(question_id)) {
      query = query.eq('question_number', parseInt(question_id));
    } else {
      query = query.eq('id', question_id);
    }
    
    const { data: question, error } = await query.single();
    
    if (error || !question) {
      return res.status(404).json({ success: false, error: 'Target question not found' });
    }

    // Fetch the first template for the recommendation
    const { data: templates } = await supabase.from('templates').select('title').limit(1);
    const recommendedTemplateTitle = templates && templates.length > 0 ? templates[0].title : 'Executive Board Risk Deck Template';

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
      recommended_template: recommendedTemplateTitle,
      estimated_payback_timeline: question.duration
    };

    return res.json({
      success: true,
      copilot_advice: aiRecommendation
    });
  } catch (err) {
    console.error('generateAIRiskAdvice Error:', err);
    return res.status(500).json({ success: false, error: 'Database error generating advice' });
  }
};
