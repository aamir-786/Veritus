const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const content = fs.readFileSync('src/user_prompt.txt', 'utf8');
  
  // Split by "---"
  const blocks = content.split('---');
  
  const questions = [];
  
  for (const block of blocks) {
    const qMatch = block.match(/(Q\d{3})\s*—\s*(.+)/);
    if (!qMatch) continue;
    
    const qNumberStr = qMatch[1]; // Q001
    const question_number = parseInt(qNumberStr.replace('Q', ''), 10);
    const rawTitle = qMatch[2].trim();
    
    // We will build the title as "Q1: Title"
    const title = `Q${question_number}: ${rawTitle}`;
    
    const extractTag = (tagName) => {
      // Look for TagName\tValue or TagName Value depending on format
      const regex = new RegExp(`${tagName}\\s+([^\\n]+)`);
      const match = block.match(regex);
      return match ? match[1].trim() : '';
    };
    
    const domain = extractTag('Domain');
    const effort = extractTag('Effort');
    const duration = extractTag('Duration');
    const tier = extractTag('Tier');
    const regulator_pressure = extractTag('Regulator pressure');
    const cost = extractTag('Cost');
    const payback = extractTag('ROI horizon');
    const leadership_traits = extractTag('Leadership traits');
    
    const plainLangMatch = block.match(/Plain-language question:\s*(.+)/);
    const plainLang = plainLangMatch ? plainLangMatch[1].trim() : '';
    
    const answerMatch = block.match(/Answer:\s*([\s\S]+)/);
    const answer = answerMatch ? answerMatch[1].trim() : '';
    
    const guidance_text = `### Plain-language question\n${plainLang}\n\n### Answer\n${answer}`;
    
    questions.push({
      id: `q-${question_number}`,
      question_number,
      title,
      domain,
      effort,
      duration,
      tier,
      regulator_pressure,
      cost,
      payback,
      leadership_traits,
      summary: plainLang, // We can store plain lang in summary as well
      guidance_text
    });
  }
  
  console.log(`Found ${questions.length} questions to insert.`);
  
  for (const q of questions) {
    const { error } = await supabase.from('questions').upsert(q);
    if (error) {
      console.error(`Error inserting ${q.id}:`, error);
    } else {
      console.log(`Inserted ${q.id}`);
    }
  }
  console.log('Done!');
}

run().catch(console.error);
