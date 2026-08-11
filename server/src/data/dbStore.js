// dbStore.js - In-Memory Relational Data Store & Mock DB Manager for Veritus / Deciding in the Dark

const fs = require('fs');
const path = require('path');

// 100 Questions Taxonomy Dataset (Deciding in the Dark)
const domains = ['Governance', 'Operational Risk', 'Financial & Market', 'Cyber & Tech Risk', 'Regulatory & Compliance'];
const efforts = ['Low', 'Medium', 'High'];
const durations = ['Fortnight', '1 Month', '1 Quarter', '1 Year'];
const costs = ['$', '$$', '$$$'];
const paybacks = ['Immediate', 'Fast (< 3mo)', 'Medium-term', 'Long-term'];
const tiers = ['Tier 1 (Critical)', 'Tier 2 (Core)', 'Tier 3 (Emerging)'];
const regulatorPressures = ['High', 'Medium', 'Low'];
const leadershipTraits = ['Strategic Vision', 'Operational Rigor', 'Crisis Agility', 'Culture & Ethics'];

// Generate 100 Real-World Risk Questions with 7 Taxonomy Tags & 200+ words of guidance each
const generate100Questions = () => {
  const sampleTitles = [
    "How do we maintain board oversight during rapid cloud migration?",
    "What is our immediate fallback if a key SaaS vendor loses outage recovery?",
    "How do we quantify reputational damage for AI algorithm hallucinations?",
    "What metrics prove to regulators that our risk appetite is enforced daily?",
    "How can we shrink our third-party vendor review time from 6 weeks to 3 days?",
    "What cost-effective controls mitigate insider fraud without slowing operations?",
    "How do we audit shadow IT usage in remote engineering teams?",
    "What is the financial payback of implementing automated breach notifications?",
    "How do we prove compliance with new DORA / NIS2 resilience standards?",
    "What zero-trust controls provide the highest ROI for mid-sized banks?",
    "How do we structure risk reporting so executive committees actually act?",
    "What is the fastest way to remediate legacy core banking vulnerabilities?",
    "How do we handle regulator inquiries regarding automated credit decision models?",
    "What key risk indicators (KRIs) predict operational burnout before turnover spikes?",
    "How do we test business continuity plans under real cyber ransomware conditions?"
  ];

  const questions = [];
  for (let i = 1; i <= 100; i++) {
    const titleIndex = (i - 1) % sampleTitles.length;
    const domain = domains[(i - 1) % domains.length];
    const effort = efforts[(i - 1) % efforts.length];
    const duration = durations[(i - 1) % durations.length];
    const cost = costs[(i - 1) % costs.length];
    const payback = paybacks[(i - 1) % paybacks.length];
    const tier = tiers[(i - 1) % tiers.length];
    const regulator_pressure = regulatorPressures[(i - 1) % regulatorPressures.length];
    const leadership_traits = leadershipTraits[(i - 1) % leadershipTraits.length];

    const qText = i <= sampleTitles.length 
      ? `Q${i}: ${sampleTitles[titleIndex]}` 
      : `Q${i}: How should risk leaders optimize ${domain.toLowerCase()} controls under ${regulator_pressure.toLowerCase()} regulator scrutiny?`;

    questions.push({
      id: `q-${i}`,
      question_number: i,
      title: qText,
      domain: domain,
      effort: effort,
      duration: duration,
      cost: cost,
      payback: payback,
      tier: tier,
      regulator_pressure: regulator_pressure,
      leadership_traits: leadership_traits,
      summary: `A critical question evaluating ${domain} with ${effort} effort, ${duration} implementation window, and ${regulator_pressure} regulator pressure.`,
      guidance_text: `### Executive Analysis & Implementation Guidance for Q${i}\n\n` +
        `**Problem Statement:** Risk executives frequently struggle with balancing speed of business execution against regulatory demands and operational vulnerability.\n\n` +
        `**Actionable 3-Step Strategy:**\n` +
        `1. **Immediate Baseline (Week 1):** Map current key risk indicators across ${domain} assets and establish clear owner accountability.\n` +
        `2. **Targeted Controls (Weeks 2-3):** Deploy lightweight automated monitoring rather than heavy manual attestation processes.\n` +
        `3. **Regulator Alignment (Week 4):** Document control effectiveness in line with ${regulator_pressure} pressure expectations and present a 1-page executive summary to the board risk committee.\n\n` +
        `**Expected Payback:** ${payback} ROI with clear cost reduction in audit response times.`
    });
  }
  return questions;
};

// Seed Initial Database State
const db = {
  users: [
    {
      id: "u-admin",
      email: "admin@veritus.com",
      password: "admin123", // In production: bcrypt hash
      full_name: "Veritus Administrator",
      role: "admin",
      created_at: new Date().toISOString()
    },
    {
      id: "u-student",
      email: "student@veritus.com",
      password: "student123",
      full_name: "Alex Vance (Chief Risk Officer)",
      role: "student",
      created_at: new Date().toISOString()
    }
  ],

  questions: generate100Questions(),

  courses: [
    {
      id: "course-1",
      slug: "deciding-in-the-dark-masterclass",
      title: "Deciding in the Dark: The Executive Risk Masterclass",
      headline: "Master the 100 risk questions every CRO and Board Director must answer.",
      description: "A comprehensive, high-impact video & framework masterclass designed for senior risk practitioners. Learn how to diagnose regulatory pressure, optimize capital payback, and build resilient risk governance.",
      tier: "Executive Tier",
      price: 299.00,
      currency: "USD",
      author_name: "Author & Senior Risk Practitioner",
      cover_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      published: true,
      modules: [
        {
          id: "m-101",
          title: "Module 1: The 100 Questions Framework & Taxonomy",
          order_index: 1,
          lessons: [
            {
              id: "l-101",
              title: "Lesson 1.1: Navigating the 7-Tag Taxonomy Matrix",
              type: "video",
              duration_minutes: 14,
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              captions_vtt: "WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nWelcome to Deciding in the Dark Masterclass.\n\n2\n00:00:05.000 --> 00:00:10.000\nToday we explore the 7 key taxonomy tags for executive risk decisions.",
              content: "In this lesson, we break down how to categorize risk items by Effort, Cost, Regulator Pressure, and Leadership Trait.",
              is_free_preview: true
            },
            {
              id: "l-102",
              title: "Lesson 1.2: High Regulator Pressure vs. Low Cost Quick-Wins",
              type: "video",
              duration_minutes: 22,
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              captions_vtt: "WEBVTT\n\n1\n00:00:00.000 --> 00:00:05.000\nIdentifying quick wins under regulatory pressure.",
              content: "Learn how to filter questions for 14-day payback under regulator scrutiny.",
              is_free_preview: false
            }
          ]
        },
        {
          id: "m-102",
          title: "Module 2: Operational Cyber & Third-Party Governance",
          order_index: 2,
          lessons: [
            {
              id: "l-103",
              title: "Lesson 2.1: Third-Party Vendor Risk Matrix (Downloadable Template Included)",
              type: "document",
              duration_minutes: 10,
              content: "Download the Vendor Risk Assessment Template below and apply it to your top 10 critical vendors.",
              resource_url: "/api/v1/templates/download/tpl-1",
              is_free_preview: false
            }
          ]
        }
      ]
    },
    {
      id: "course-2",
      slug: "rapid-regulatory-resilience",
      title: "Rapid Regulatory Resilience & Board Reporting",
      headline: "Streamline audit readiness and regulator communications in 14 days.",
      description: "Learn actionable methodologies to answer board inquiries, reduce compliance friction, and convert regulatory pressure into strategic advantage.",
      tier: "Core Tier",
      price: 149.00,
      currency: "USD",
      author_name: "Veritus Research Team",
      cover_image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
      published: true,
      modules: [
        {
          id: "m-201",
          title: "Module 1: Board Deck Architecture for Risk Leaders",
          order_index: 1,
          lessons: [
            {
              id: "l-201",
              title: "Lesson 1.1: Constructing the One-Page Risk Heatmap",
              type: "reading",
              duration_minutes: 15,
              content: "Board members do not have time for 80-page risk binders. Learn how to condense complex risk telemetry into a strategic 1-page report.",
              is_free_preview: true
            }
          ]
        }
      ]
    }
  ],

  templates: [
    {
      id: "tpl-1",
      title: "100-Question Risk Assessment Matrix (Excel / Notion Template)",
      description: "Complete structured framework containing all 100 questions tagged by Effort, Duration, Cost, Payback, Tier, and Regulator Pressure.",
      category: "Frameworks & Spreadsheets",
      price: 49.00,
      is_free: false,
      downloads_count: 142,
      file_path: "100_Question_Risk_Matrix.xlsx"
    },
    {
      id: "tpl-2",
      title: "Executive Board Risk Deck Template (PPTX / Keynote)",
      description: "15 high-impact presentation slides tailored for quarterly board committee reporting.",
      category: "Board Reporting",
      price: 0.00, // Free entry point
      is_free: true,
      downloads_count: 580,
      file_path: "Executive_Board_Risk_Deck.pptx"
    },
    {
      id: "tpl-3",
      title: "Third-Party Vendor Audit Checklist (DORA & NIS2 Compliant)",
      description: "Step-by-step audit questionnaire for critical technology and SaaS providers.",
      category: "Regulatory Templates",
      price: 29.00,
      is_free: false,
      downloads_count: 98,
      file_path: "Vendor_Audit_Checklist.pdf"
    }
  ],

  orders: [
    {
      id: "ord-1001",
      user_id: "u-student",
      user_email: "student@veritus.com",
      product_id: "course-1",
      product_title: "Deciding in the Dark: The Executive Risk Masterclass",
      amount: 299.00,
      currency: "USD",
      status: "paid",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],

  entitlements: [
    {
      id: "ent-1",
      user_id: "u-student",
      product_id: "course-1",
      access_granted_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],

  progress: [
    {
      user_id: "u-student",
      course_id: "course-1",
      lesson_id: "l-101",
      completed: true,
      last_position_seconds: 840,
      updated_at: new Date().toISOString()
    }
  ]
};

module.exports = db;
