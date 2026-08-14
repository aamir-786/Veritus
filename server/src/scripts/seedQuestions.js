const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

async function seed() {
  const filePath = path.join(__dirname, '../user_prompt.txt');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const lines = content.split('\n');
  const questions = [];
  let currentQuestion = null;
  let inAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for question start: Q001 — Title
    const match = line.match(/^Q(\d{3})\s+—\s+(.*)$/);
    if (match) {
      if (currentQuestion) {
        if (currentQuestion.guidance_text) {
          currentQuestion.guidance_text = currentQuestion.guidance_text.trim();
        }
        questions.push(currentQuestion);
      }
      const qNum = parseInt(match[1], 10);
      currentQuestion = {
        id: `q-${qNum}`,
        question_number: qNum,
        title: match[2],
        guidance_text: ''
      };
      inAnswer = false;
      continue;
    }

    if (!currentQuestion) continue;

    if (line === '---') {
      if (currentQuestion) {
        if (currentQuestion.guidance_text) {
          currentQuestion.guidance_text = currentQuestion.guidance_text.trim();
        }
        questions.push(currentQuestion);
        currentQuestion = null;
      }
      continue;
    }

    if (line.startsWith('Domain\t')) {
      currentQuestion.domain = line.split('\t')[1];
    } else if (line.startsWith('Effort\t')) {
      currentQuestion.effort = line.split('\t')[1];
    } else if (line.startsWith('Duration\t')) {
      currentQuestion.duration = line.split('\t')[1];
    } else if (line.startsWith('Tier\t')) {
      currentQuestion.tier = line.split('\t')[1];
    } else if (line.startsWith('Regulator pressure\t')) {
      currentQuestion.regulator_pressure = line.split('\t')[1];
    } else if (line.startsWith('Cost\t')) {
      currentQuestion.cost = line.split('\t')[1];
    } else if (line.startsWith('ROI horizon\t')) {
      currentQuestion.payback = line.split('\t')[1]; // mapping to payback schema
    } else if (line.startsWith('Leadership traits\t')) {
      currentQuestion.leadership_traits = line.split('\t')[1];
    } else if (line.startsWith('Plain-language question:')) {
      currentQuestion.summary = line.replace('Plain-language question:', '').trim();
    } else if (line.startsWith('Answer:')) {
      inAnswer = true;
    } else if (inAnswer) {
      currentQuestion.guidance_text += line + '\n';
    }
  }

  if (currentQuestion) {
    if (currentQuestion.guidance_text) {
      currentQuestion.guidance_text = currentQuestion.guidance_text.trim();
    }
    questions.push(currentQuestion);
  }

  console.log(`Parsed ${questions.length} questions. Inserting into Supabase...`);

  // Insert into Supabase
  const { data, error } = await supabase
    .from('questions')
    .upsert(questions, { onConflict: 'id' });

  if (error) {
    console.error('Error inserting questions:', error);
  } else {
    console.log('Successfully inserted/updated questions!');
  }
}

seed().catch(console.error);
