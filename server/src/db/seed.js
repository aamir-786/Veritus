require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const dbStore = require('../data/dbStore');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('Seeding Supabase Database...');

  // 1. Seed Questions
  console.log('Seeding Questions...');
  const { error: qError } = await supabase.from('questions').upsert(dbStore.questions);
  if (qError) console.error('Error seeding questions:', qError.message);
  else console.log('Successfully seeded 100 questions.');

  // 2. Seed Templates
  console.log('Seeding Templates...');
  const { error: tError } = await supabase.from('templates').upsert(dbStore.templates);
  if (tError) console.error('Error seeding templates:', tError.message);
  else console.log(`Successfully seeded ${dbStore.templates.length} templates.`);

  // 3. Seed Courses, Modules, Lessons
  console.log('Seeding Courses...');
  for (const course of dbStore.courses) {
    const courseData = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      headline: course.headline,
      description: course.description,
      tier: course.tier,
      price: course.price,
      currency: course.currency,
      author_name: course.author_name,
      cover_image: course.cover_image,
      published: course.published
    };
    
    const { error: cError } = await supabase.from('courses').upsert(courseData);
    if (cError) {
      console.error(`Error seeding course ${course.id}:`, cError.message);
      continue;
    }

    if (course.modules) {
      for (const module of course.modules) {
        const moduleData = {
          id: module.id,
          course_id: course.id,
          title: module.title,
          order_index: module.order_index
        };

        const { error: mError } = await supabase.from('modules').upsert(moduleData);
        if (mError) {
          console.error(`Error seeding module ${module.id}:`, mError.message);
          continue;
        }

        if (module.lessons) {
          const lessonsData = module.lessons.map(lesson => ({
            id: lesson.id,
            module_id: module.id,
            title: lesson.title,
            type: lesson.type,
            duration_minutes: lesson.duration_minutes,
            video_url: lesson.video_url,
            captions_vtt: lesson.captions_vtt,
            content: lesson.content,
            resource_url: lesson.resource_url,
            is_free_preview: lesson.is_free_preview
          }));

          const { error: lError } = await supabase.from('lessons').upsert(lessonsData);
          if (lError) {
            console.error(`Error seeding lessons for module ${module.id}:`, lError.message);
          }
        }
      }
    }
  }
  console.log('Successfully seeded courses, modules, and lessons.');
  
  console.log('Seeding complete!');
}

seed();
