const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const filePath = path.join(__dirname, '../../../Deciding_in_the_Dark_100_Questions.md');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split the markdown file by "### QXXX" to properly isolate each question.
  const blocks = content.split(/### (?=Q\d{3})/);
  
  const questions = [];
  
  for (let i = 1; i < blocks.length; i++) {
    const block = '### ' + blocks[i];
    const qMatch = block.match(/### (Q\d{3})\s*—\s*([^\n]+)/);
    if (!qMatch) continue;
    
    const qNumberStr = qMatch[1]; // e.g., Q001
    const question_number = parseInt(qNumberStr.replace('Q', ''), 10);
    const rawTitle = qMatch[2].trim();
    
    const title = `Q${question_number}: ${rawTitle}`;
    
    const extractTag = (tagName) => {
      // Look for the tag in the markdown table: | Domain | Risk |
      const regex = new RegExp(`\\|\\s*${tagName}\\s*\\|\\s*([^|\\n]+)\\s*\\|`);
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
    
    // Extract Plain-language question
    const plainLangMatch = block.match(/\*\*Plain-language question:\*\*\s*(.+)/);
    const plainLang = plainLangMatch ? plainLangMatch[1].trim() : '';
    
    // Extract Answer. 
    // The answer starts after "**Answer:**" and goes to the end of the block.
    const answerMatch = block.match(/\*\*Answer:\*\*\s*([\s\S]+)/);
    let answer = answerMatch ? answerMatch[1].trim() : '';
    
    // Clean up trailing `---` or footer text from the answer
    answer = answer.replace(/\n---\s*(\n##\s.+)?$/g, '').trim();
    answer = answer.replace(/\n---\s*$/g, '').trim();
    
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
      summary: plainLang, // Use plain-language question as the short summary
      guidance_text
    });
  }
  
  console.log(`Parsed ${questions.length} questions from the markdown file.`);
  if (questions.length === 0) {
    console.error("No questions found! Please check the parsing logic.");
    return;
  }

  // Delete previous questions
  console.log('Deleting previous questions from Supabase...');
  // We can delete by matching all id not null
  const { error: realDeleteError } = await supabase.from('questions').delete().neq('id', 'dummy');
  if(realDeleteError) {
      console.log("Delete error:", realDeleteError)
  } else {
      console.log("Cleared old questions.");
  }


  // Insert new questions
  let inserted = 0;
  for (const q of questions) {
    const { error } = await supabase.from('questions').upsert(q);
    if (error) {
      console.error(`Error inserting ${q.id}:`, error);
    } else {
      inserted++;
    }
  }
  
  console.log(`Successfully inserted ${inserted}/${questions.length} questions.`);
}

run().catch(console.error);
