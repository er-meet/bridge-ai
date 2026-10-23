import { ScenarioPreset } from '../types/index.js';

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'road-hazard',
    title: 'Damaged Road Hazard',
    category: 'Public Safety & Infrastructure',
    badge: 'Road Infrastructure',
    iconName: 'AlertTriangle',
    shortDescription: 'Severe pavement crater causing tire blowouts and erratic swerving in heavy rain.',
    sampleInputText: 'There is a massive, deep pothole spanning the westbound lane on Oakridge Avenue near the Elm Street intersection. Several cars have violently swerved or suffered tire blowouts in the rain today. Water is pooling inside and obscuring the depth of the crater.',
    sampleFiles: [
      {
        name: 'oakridge_pothole_damage.jpg',
        type: 'image',
        size: 2450000,
        sizeDisplay: '2.4 MB',
        description: 'Photo showing 3-foot wide broken asphalt crater with standing water in active travel lane.',
      }
    ]
  },
  {
    id: 'disaster-assistance',
    title: 'Neighborhood Flash Flooding',
    category: 'Disaster Relief & Emergency Response',
    badge: 'Disaster Relief',
    iconName: 'Waves',
    shortDescription: 'Flash flooding overflowing drainage ditches, water reaching crawl spaces, low power lines, and a resident requiring evacuation.',
    sampleInputText: 'Flash flooding has overwhelmed our neighborhood stormwater ditch. Rising water is now 2.5 feet deep across Maple Terrace and entering residential crawl spaces. The elderly neighbor at #42 has limited mobility and cannot evacuate without physical help. Power lines are sagging low over the street.',
    sampleFiles: [
      {
        name: 'maple_terrace_flood.jpg',
        type: 'image',
        size: 3200000,
        sizeDisplay: '3.1 MB',
        description: 'Photo showing muddy water level submerged sidewalks and approaching doorsteps.',
      },
      {
        name: 'resident_voice_plea.mp3',
        type: 'audio',
        size: 1250000,
        sizeDisplay: '1.2 MB',
        description: 'Voice note describing rapid water rise and resident mobility limitations.',
      }
    ]
  },
  {
    id: 'healthcare-paperwork',
    title: 'Hospital Discharge Summary',
    category: 'Healthcare & Patient Advocacy',
    badge: 'Healthcare Paperwork',
    iconName: 'FileHeart',
    shortDescription: 'Hospital discharge instructions with complex clinical terms, medication schedules, and dietary directives simplified.',
    sampleInputText: 'Here is my father\'s hospital discharge paper from yesterday. The doctors spoke very quickly and used complex terms. Can you explain what this means in plain English, what medications he needs to take, what red flags we must watch for, and what follow-up is needed?',
    sampleFiles: [
      {
        name: 'discharge_summary_sample.pdf',
        type: 'pdf',
        size: 420000,
        sizeDisplay: '410 KB',
        description: 'Discharge document with CHF exacerbation diagnosis, 3 daily cardiac medications, and follow-up plan.',
      }
    ]
  }
];
