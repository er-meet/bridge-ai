import { BridgeAnalysisResult } from './schema.js';

export interface DemoScenario {
  id: 'road-hazard' | 'disaster-assistance' | 'healthcare-paperwork';
  title: string;
  category: string;
  badge: string;
  shortDescription: string;
  sampleInputText: string;
  sampleFileDetails: {
    name: string;
    type: 'image' | 'pdf' | 'audio';
    mimeType: string;
    sizeDisplay: string;
    previewDescription: string;
  }[];
  analysisResult: BridgeAnalysisResult;
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  'road-hazard': {
    id: 'road-hazard',
    title: 'Damaged Road Hazard',
    category: 'Public Safety & Infrastructure',
    badge: 'Infrastructure',
    shortDescription: 'Severe pothole and pavement collapse causing active vehicular blowouts in rain.',
    sampleInputText: 'There is a massive, deep pothole spanning the westbound lane on Oakridge Avenue near the Elm Street intersection. Several cars have violently swerved or suffered tire blowouts in the rain today. Water is pooling inside and obscuring the depth of the crater.',
    sampleFileDetails: [
      {
        name: 'oakridge_pothole_damage.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        sizeDisplay: '2.4 MB',
        previewDescription: 'Photograph showing broken asphalt crater approximately 3ft wide with pooled rainwater on two-lane road.',
      }
    ],
    analysisResult: {
      id: 'demo-road-hazard-101',
      timestamp: new Date().toISOString(),
      is_demo: true,
      request_type: 'Road Hazard & Infrastructure Damage',
      category_tag: 'Public Safety & Infrastructure',
      summary: 'A deep asphalt pothole on the westbound lane of Oakridge Avenue near Elm Street is causing hazardous road conditions and active vehicular tire damage in the rain. Immediate municipal road safety intervention is required.',
      extracted_facts: [
        {
          field: 'Hazard Classification',
          value: 'Deep asphalt pavement crater (~3 ft wide) in travel lane',
          source: 'Observed from uploaded photograph',
          status: 'observed',
        },
        {
          field: 'Immediate Impact',
          value: 'Multiple vehicles suffered tire blowouts and sudden swerving',
          source: 'Reported by citizen description',
          status: 'reported',
        },
        {
          field: 'Environmental Conditions',
          value: 'Active rainfall and standing water obscuring crater depth',
          source: 'Observed from photo & confirmed by user text',
          status: 'observed',
        },
        {
          field: 'Traffic Flow Effect',
          value: 'Westbound lane partially obstructed, causing near-misses',
          source: 'Reported by citizen',
          status: 'reported',
        },
        {
          field: 'Safety Equipment on Site',
          value: 'None detected (no traffic cones or warning barriers present)',
          source: 'Observed from uploaded photo',
          status: 'observed',
        }
      ],
      location: {
        value: 'Oakridge Avenue near Elm Street intersection (Westbound lane)',
        status: 'reported',
      },
      missing_information: [
        'Exact numerical street address or GPS pin',
        'Specific municipality, town, or county jurisdiction',
        'Time first observed by reporter',
        'Whether municipal public works or police non-emergency line has been contacted'
      ],
      uncertainty_notes: [
        'Subsurface roadbed erosion depth cannot be measured from 2D imagery alone.',
        'Total structural impact on road sub-base requires municipal geotechnical assessment.',
        'Vehicular damage claims have not been independently inspected.'
      ],
      priority: {
        level: 'urgent',
        reason: 'Active risk of high-speed blowouts, secondary vehicular collisions, and worsening erosion due to rain runoff.',
      },
      recommended_actions: [
        {
          id: 'action-rh-1',
          title: 'Deploy Immediate Hazard Cones / Barricades',
          description: 'Place reflective traffic cones or temporary barricades 50ft upstream of the pothole to route westbound traffic safely around the defect.',
          requires_confirmation: true,
          completed: false,
        },
        {
          id: 'action-rh-2',
          title: 'Transmit Ticket to Department of Public Works',
          description: 'Submit an expedited high-priority road maintenance ticket with photo evidence to the municipal street maintenance crew for cold-patch or hot-mix asphalt repair.',
          requires_confirmation: true,
          completed: false,
        },
        {
          id: 'action-rh-3',
          title: 'Issue Local Traffic Advisory',
          description: 'Post a temporary road hazard advisory on municipal 511 / community navigation alert channels.',
          requires_confirmation: false,
          completed: false,
        }
      ],
      human_review_required: true,
      emergency_detected: false,
      emergency_guidance: null,
    }
  },
  'disaster-assistance': {
    id: 'disaster-assistance',
    title: 'Neighborhood Flash Flooding',
    category: 'Disaster Relief & Emergency Response',
    badge: 'Disaster Relief',
    shortDescription: 'Overwhelmed drainage, rising floodwaters reaching crawl spaces, low power lines, and a resident needing physical evacuation.',
    sampleInputText: 'Flash flooding has overwhelmed our neighborhood stormwater ditch. Rising water is now 2.5 feet deep across Maple Terrace and entering residential crawl spaces. The elderly neighbor at #42 has limited mobility and cannot evacuate without physical help. Power lines are sagging low over the street.',
    sampleFileDetails: [
      {
        name: 'maple_terrace_flood.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        sizeDisplay: '3.1 MB',
        previewDescription: 'Turbid floodwaters rising along sidewalk, submerged street curbs, and overcast sky.',
      },
      {
        name: 'resident_voice_plea.mp3',
        type: 'audio',
        mimeType: 'audio/mp3',
        sizeDisplay: '1.2 MB',
        previewDescription: 'Audio recording with rain background noise describing rising waters and vulnerable neighbor.',
      }
    ],
    analysisResult: {
      id: 'demo-disaster-flood-202',
      timestamp: new Date().toISOString(),
      is_demo: true,
      request_type: 'Flash Flooding & Rescue Assistance',
      category_tag: 'Disaster Relief & Emergency Response',
      summary: 'Dangerous flash flooding on Maple Terrace with water depths around 2.5 feet infiltrating home crawl spaces. An elderly resident with mobility limitations at #42 requires evacuation, and sagging electrical power lines create an acute hazard.',
      extracted_facts: [
        {
          field: 'Disaster Type',
          value: 'Neighborhood Flash Flooding / Stormwater Drainage Failure',
          source: 'Citizen audio & description',
          status: 'reported',
        },
        {
          field: 'Flood Depth & Infiltration',
          value: 'Water approx. 2.5 ft deep; entering residential crawl spaces',
          source: 'Observed from street photo & reported in audio',
          status: 'observed',
        },
        {
          field: 'At-Risk Individuals',
          value: 'Elderly resident at #42 Maple Terrace with limited mobility, unable to self-evacuate',
          source: 'Citizen voice recording',
          status: 'reported',
        },
        {
          field: 'Secondary Utility Hazard',
          value: 'Electrical power lines sagging dangerously close to standing floodwater',
          source: 'Citizen report',
          status: 'reported',
        }
      ],
      location: {
        value: 'Maple Terrace (specifically #42 and surrounding blocks)',
        status: 'reported',
      },
      missing_information: [
        'Municipality, county, and state/province to identify responding fire battalion',
        'Specific name and medical needs of resident at #42',
        'Whether power has already been cut by the utility provider',
        'Callback phone number for the reporting resident'
      ],
      uncertainty_notes: [
        'Electrification state of sagging power lines is unknown — treat lines as energized and live.',
        'Rate of floodwater rise depends on ongoing upstream rainfall and ditch capacity.',
        'Structural integrity of home foundation/crawl space cannot be evaluated until water recedes.'
      ],
      priority: {
        level: 'urgent',
        reason: 'Critical threat to human life: vulnerable non-mobile resident trapped by rising water alongside potential electrocution hazard.',
      },
      recommended_actions: [
        {
          id: 'action-da-1',
          title: 'Dial 911 / Local Emergency Dispatch Immediately',
          description: 'Request immediate high-water rescue team for the resident with mobility limitations at 42 Maple Terrace.',
          requires_confirmation: true,
          completed: false,
        },
        {
          id: 'action-da-2',
          title: 'Notify Electric Power Utility',
          description: 'Alert emergency dispatch at the power grid operator to immediately de-energize the neighborhood transformer and repair sagging lines.',
          requires_confirmation: true,
          completed: false,
        },
        {
          id: 'action-da-3',
          title: 'Enforce Flood Safety Protocol',
          description: 'Warn all residents NOT to enter standing floodwaters on foot or by vehicle due to hidden debris, currents, and electrical conductivity.',
          requires_confirmation: false,
          completed: false,
        },
        {
          id: 'action-da-4',
          title: 'Register with Local Emergency Operations Center (EOC)',
          description: 'Add Maple Terrace to the county EOC shelter and disaster relief manifest.',
          requires_confirmation: true,
          completed: false,
        }
      ],
      human_review_required: true,
      emergency_detected: true,
      emergency_guidance: 'IMMEDIATE LIFE SAFETY ADVISORY: Potential electrocution danger and trapped vulnerable person. Do not attempt to cross flooded streets. Immediately contact 911 or emergency first responders. Do not wait for algorithmic review.',
    }
  },
  'healthcare-paperwork': {
    id: 'healthcare-paperwork',
    title: 'Hospital Discharge Summary',
    category: 'Healthcare & Patient Advocacy',
    badge: 'Healthcare',
    shortDescription: 'Complex post-hospitalization discharge instructions, medications, follow-ups, and dietary directives simplified into plain language.',
    sampleInputText: 'Here is my father\'s hospital discharge paper from yesterday. The doctors spoke very quickly and used complex terms. Can you explain what this means in plain English, what medications he needs to take, what red flags we must watch for, and what follow-up is needed?',
    sampleFileDetails: [
      {
        name: 'discharge_summary_sample.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        sizeDisplay: '410 KB',
        previewDescription: 'Fictional Mercy General Hospital Inpatient Discharge Summary sheet detailing diagnosis, medications, and diet.',
      }
    ],
    analysisResult: {
      id: 'demo-health-discharge-303',
      timestamp: new Date().toISOString(),
      is_demo: true,
      request_type: 'Healthcare Paperwork Simplification',
      category_tag: 'Healthcare & Patient Advocacy',
      summary: 'Plain-language breakdown of an inpatient discharge summary for congestive heart failure. Explains prescribed daily diuretic and cardiac medications, low-sodium dietary restrictions, mandatory daily weight monitoring, and a required cardiology follow-up within 7–10 days.',
      extracted_facts: [
        {
          field: 'Primary Medical Diagnosis',
          value: 'Mild Congestive Heart Failure exacerbation, stabilized with intravenous diuretics',
          source: 'Observed from fictional discharge summary',
          status: 'observed',
        },
        {
          field: 'Daily Medications',
          value: 'Furosemide (Lasix) 40mg morning; Lisinopril 10mg daily; Potassium Chloride 20mEq morning with food',
          source: 'Observed from discharge paperwork section 3',
          status: 'observed',
        },
        {
          field: 'Dietary & Lifestyle Directive',
          value: 'Sodium restricted to under 2,000 mg/day (approx 1 teaspoon salt total); fluid intake limit of 2 Liters/day',
          source: 'Observed from discharge summary',
          status: 'observed',
        },
        {
          field: 'Required Self-Monitoring',
          value: 'Weigh father every morning after urination and before breakfast; log in notebook',
          source: 'Observed from discharge instructions',
          status: 'observed',
        },
        {
          field: 'Red-Flag Warning Triggers',
          value: 'Sudden weight gain >3 lbs in 24 hrs or >5 lbs in 1 week; increased shortness of breath lying flat',
          source: 'Observed from discharge sheet warning block',
          status: 'observed',
        }
      ],
      location: {
        value: 'Mercy General Hospital (Cardiology Unit 4B)',
        status: 'confirmed_from_input',
      },
      missing_information: [
        'Father\'s baseline "dry weight" at hospital release',
        'Name and phone number of patient\'s outpatient primary care physician',
        'Verification of whether pharmacy has already filled the updated prescription list'
      ],
      uncertainty_notes: [
        'This summary is strictly educational and does not constitute medical advice or clinical diagnosis.',
        'Drug interactions with over-the-counter supplements (e.g. NSAIDs) must be verified with a licensed pharmacist or physician.'
      ],
      priority: {
        level: 'moderate',
        reason: 'Post-discharge transition requires timely medication adherence and appointment booking to prevent readmission.',
      },
      recommended_actions: [
        {
          id: 'action-hp-1',
          title: 'Fill and Review Medications with Pharmacist',
          description: 'Pick up prescriptions from the pharmacy today. Ask the pharmacist to clarify morning vs evening timing, particularly taking Furosemide in the morning to prevent nighttime urination.',
          requires_confirmation: false,
          completed: false,
        },
        {
          id: 'action-hp-2',
          title: 'Schedule Cardiology Follow-Up Appointment',
          description: 'Call Dr. Morales\' cardiology clinic at (555) 019-2834 to lock in an outpatient visit within the 7–10 day window specified on the discharge form.',
          requires_confirmation: true,
          completed: false,
        },
        {
          id: 'action-hp-3',
          title: 'Establish Daily Morning Weight Tracker',
          description: 'Place a digital scale beside the bed. Record weight daily before breakfast. If weight jumps by 3+ pounds in one day, call the clinic immediately.',
          requires_confirmation: false,
          completed: false,
        },
        {
          id: 'action-hp-4',
          title: 'Review Warning Signs with Caregivers',
          description: 'Ensure family members recognize shortness of breath, ankle swelling, or chest pressure as triggers to seek immediate medical evaluation.',
          requires_confirmation: false,
          completed: false,
        }
      ],
      human_review_required: true,
      emergency_detected: false,
      emergency_guidance: 'DISCLAIMER: BridgeAI provides plain-language educational summaries of medical documents. It does not replace medical counsel, diagnose illness, or adjust prescriptions. Direct all medical decisions to licensed healthcare professionals. In any medical emergency, call 911 immediately.',
    }
  }
};
