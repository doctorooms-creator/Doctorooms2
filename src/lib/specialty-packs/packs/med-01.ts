/**
 * MED-01 — INTERNAL MEDICINE STARTER PACK (T1)
 *
 * GP-01 spread VERBATIM as the foundation + internal-medicine depth:
 * seasonal fevers (dengue / malaria / typhoid), TB screen → NTEP referral,
 * chronic-disease initiation (HTN / DM / thyroid), anemia workups,
 * UTI & renal colic, liver & addictions, dyslipidemia, frailty.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India internal-medicine core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY CURATION NOTES (deliberate exclusions / hard flags):
 * - TB: NO drug regimens in this pack — India TB is treated FREE at NTEP
 *   (government) centers; the pack carries screening questions + REFER
 *   suggestion lines only (finding TB-SUSPECT has no linked medicines).
 * - Doxycycline: pregnancy 'avoid'. Artemether+Lumefantrine: pregnancy
 *   'caution' (1st trimester concern). Primaquine deliberately EXCLUDED
 *   (G6PD-hemolysis risk — NVBDCP/specialist decision, not OPD starter).
 * - Steroids (Wysolone 10): Schedule H, short-course defaults only.
 *
 * Sources: NLEM 2023 (molecule backbone) · NVBDCP malaria/dengue seasonal
 * patterns · NTEP referral guidance · standard India internal-medicine OPD
 * practice · GP-01 as the verbatim base pack.
 */

import { GP01_PACK } from './gp-01'
import type {
  SpecialtyPack,
  PackCategory,
  PackComplaint,
  PackQuestion,
  PackSuggestion,
  PackLabel,
  PackFinding,
  PackMedicine,
  PackFindingMed,
  PackTableTemplate,
  PackRxTemplate,
} from '../types'

const GPQ = GP01_PACK.questions.length // 54 — question-index offset for MED-01 additions

// ══ New categories (4) — appended AFTER GP-01's five ═════════════════════
const newCategories: PackCategory[] = [
  { key: 'INF', name: 'संक्रमण एवं बुखार', nameEn: 'Infections & Fevers' },
  { key: 'CHR', name: 'पुरानी बीमारी (BP/शुगर/थायरॉइड)', nameEn: 'Chronic Disease (HTN/DM/Thyroid)' },
  { key: 'BLD', name: 'खून एवं एनीमिया', nameEn: 'Blood & Anemia' },
  { key: 'LVR', name: 'लिवर, मूत्र एवं आदतें', nameEn: 'Liver, Urinary & Addictions' },
]

// ══ New complaints (21) — fresh prefixes INF/CHR/BLD/LVR (no GP-01 collision) ══
const newComplaints: PackComplaint[] = [
  // INF — Infections & Fevers
  { code: 'INF01', categoryKey: 'INF', detail: 'डेंगू जैसा बुखार', detailEn: 'Dengue-like Fever' },
  { code: 'INF02', categoryKey: 'INF', detail: 'मलेरिया का संदेह', detailEn: 'Malaria Suspicion' },
  { code: 'INF03', categoryKey: 'INF', detail: 'टाइफाइड का संदेह', detailEn: 'Typhoid Suspicion' },
  { code: 'INF04', categoryKey: 'INF', detail: '2 हफ्ते+ खांसी (टीबी जांच)', detailEn: 'Cough >2 Weeks (TB Screen)' },
  { code: 'INF05', categoryKey: 'INF', detail: 'वायरल के बाद थकान', detailEn: 'Post-Viral Fatigue' },
  // CHR — Chronic Disease (HTN/DM/Thyroid)
  { code: 'CHR01', categoryKey: 'CHR', detail: 'पुरानी BP — चेकअप', detailEn: 'Known HTN — Checkup' },
  { code: 'CHR02', categoryKey: 'CHR', detail: 'पुरानी शुगर — चेकअप', detailEn: 'Known DM — Checkup' },
  { code: 'CHR03', categoryKey: 'CHR', detail: 'BP ज्यादा नापा आया', detailEn: 'High BP Reading' },
  { code: 'CHR04', categoryKey: 'CHR', detail: 'धड़कन तेज चलना', detailEn: 'Palpitations' },
  { code: 'CHR05', categoryKey: 'CHR', detail: 'थायरॉइड कमी के लक्षण', detailEn: 'Hypothyroid Symptoms' },
  { code: 'CHR06', categoryKey: 'CHR', detail: 'थायरॉइड ज्यादा के लक्षण', detailEn: 'Hyperthyroid Symptoms' },
  { code: 'CHR07', categoryKey: 'CHR', detail: 'गले में गिल्टी (थायरॉइड सूजन)', detailEn: 'Goiter / Neck Swelling' },
  { code: 'CHR08', categoryKey: 'CHR', detail: 'कोलेस्ट्रॉल ज्यादा', detailEn: 'Raised Cholesterol' },
  // BLD — Blood & Anemia
  { code: 'BLD01', categoryKey: 'BLD', detail: 'खून की कमी के लक्षण', detailEn: 'Anemia Symptoms' },
  { code: 'BLD02', categoryKey: 'BLD', detail: 'बुढ़ापे में कमजोरी', detailEn: 'Old-Age Weakness / Frailty' },
  // LVR — Liver, Urinary & Addictions
  { code: 'LVR01', categoryKey: 'LVR', detail: 'पीलिया / पीली आंख-पेशाब', detailEn: 'Jaundice / Hepatitis Symptoms' },
  { code: 'LVR02', categoryKey: 'LVR', detail: 'फैटी लिवर की जांच', detailEn: 'Fatty Liver Query' },
  { code: 'LVR03', categoryKey: 'LVR', detail: 'शराब ज्यादा पीना', detailEn: 'Alcohol Overuse' },
  { code: 'LVR04', categoryKey: 'LVR', detail: 'धूम्रपान छोड़ना चाहते हैं', detailEn: 'Smoking Cessation' },
  { code: 'LVR05', categoryKey: 'LVR', detail: 'मूत्र में जलन', detailEn: 'Urinary Burning (UTI)' },
  { code: 'LVR06', categoryKey: 'LVR', detail: 'पत्थर दर्द (किडनी कोलिक)', detailEn: 'Renal Colic (Stone)' },
]

// ══ New questions (42 — 2 per new complaint; local indices 0-41) ════════
// Final combined index = local index + GPQ (54).
const newQuestions: PackQuestion[] = [
  // INF01 Dengue-like fever
  { complaintCode: 'INF01', question: 'बुखार के साथ शरीर पर लाल चकत्ते या मसूड़ों/नाक से खून?', questionEn: 'Red rash or bleeding from gums/nose with fever?' }, // local idx 0
  { complaintCode: 'INF01', question: 'आंखों के पीछे दर्द या बहुत तेज बदन दर्द?', questionEn: 'Pain behind the eyes or very severe body ache?' }, // local idx 1
  // INF02 Malaria suspicion
  { complaintCode: 'INF02', question: 'बुखार से पहले कंपकपी (ठंड लगना) आती है?', questionEn: 'Do you get shaking chills before the fever?' }, // local idx 2
  { complaintCode: 'INF02', question: 'पिछले 2 हफ्ते में मच्छर-प्रभावित इलाके की यात्रा?', questionEn: 'Travel to a mosquito-prone area in the last 2 weeks?' }, // local idx 3
  // INF03 Typhoid suspicion
  { complaintCode: 'INF03', question: '5 दिन+ बुखार के साथ पेट दर्द या दस्त/कब्ज?', questionEn: 'Fever 5+ days with abdominal pain or loose stools/constipation?' }, // local idx 4
  { complaintCode: 'INF03', question: 'जीभ पर सफेद परत या भूख बहुत कम?', questionEn: 'White coating on tongue or severe loss of appetite?' }, // local idx 5
  // INF04 TB screen (cough >2 weeks)
  { complaintCode: 'INF04', question: 'खांसी कितने हफ्तों से चल रही है?', questionEn: 'Since how many weeks has the cough persisted?' }, // local idx 6
  { complaintCode: 'INF04', question: 'खांसी के साथ वजन घटा या रात को पसीना/शाम को बुखार?', questionEn: 'Weight loss, night sweats or evening fever with the cough?' }, // local idx 7
  // INF05 Post-viral fatigue
  { complaintCode: 'INF05', question: 'बुखार कितने दिन पहले ठीक हुआ?', questionEn: 'How many days ago did the fever settle?' }, // local idx 8
  { complaintCode: 'INF05', question: 'भूख और नींद वापस आ गई है?', questionEn: 'Have appetite and sleep returned?' }, // local idx 9
  // CHR01 Known HTN checkup
  { complaintCode: 'CHR01', question: 'कौन सी BP दवा चल रही है और नियमित लेते हैं?', questionEn: 'Which BP medicine are you on, and do you take it regularly?' }, // local idx 10
  { complaintCode: 'CHR01', question: 'घर पर BP का रिकॉर्ड रखते हैं?', questionEn: 'Do you keep a home BP log?' }, // local idx 11
  // CHR02 Known DM checkup
  { complaintCode: 'CHR02', question: 'शुगर की जांच (FBS/HbA1c) आखरी कब कराई?', questionEn: 'When was the last sugar check (FBS/HbA1c)?' }, // local idx 12
  { complaintCode: 'CHR02', question: 'पैरों में झनझनाहट या जलन है?', questionEn: 'Any tingling or burning sensation in the feet?' }, // local idx 13
  // CHR03 High BP reading
  { complaintCode: 'CHR03', question: 'आज BP कितना नापा (ऊपर/नीचे)?', questionEn: 'What was today BP reading (upper/lower)?' }, // local idx 14
  { complaintCode: 'CHR03', question: 'पहले कभी BP ज्यादा बताया गया था?', questionEn: 'Has your BP ever been found high before?' }, // local idx 15
  // CHR04 Palpitations
  { complaintCode: 'CHR04', question: 'धड़कन रुक-रुक के तेज चलती है या लगातार?', questionEn: 'Is the racing heartbeat intermittent or continuous?' }, // local idx 16
  { complaintCode: 'CHR04', question: 'धड़कन के साथ चक्कर या बेहोशी आई?', questionEn: 'Any giddiness or fainting with the palpitations?' }, // local idx 17
  // CHR05 Hypothyroid symptoms
  { complaintCode: 'CHR05', question: 'वजन बढ़ना, ठंड लगना या कब्ज भी है?', questionEn: 'Any weight gain, cold intolerance or constipation?' }, // local idx 18
  { complaintCode: 'CHR05', question: 'त्वचा और बाल रूखे हो गए हैं?', questionEn: 'Have skin and hair become dry?' }, // local idx 19
  // CHR06 Hyperthyroid symptoms
  { complaintCode: 'CHR06', question: 'वजन घटा, भूख बढ़ी, गर्मी से परेशानी?', questionEn: 'Weight loss, increased appetite, heat intolerance?' }, // local idx 20
  { complaintCode: 'CHR06', question: 'धड़कन तेज या हाथ कांपते हैं?', questionEn: 'Fast heartbeat or trembling hands?' }, // local idx 21
  // CHR07 Goiter / neck swelling
  { complaintCode: 'CHR07', question: 'गले की सूजन कब से है और दर्द भी है?', questionEn: 'Since when is the neck swelling, and is it painful?' }, // local idx 22
  { complaintCode: 'CHR07', question: 'निगलने या सांस लेने में तकलीफ?', questionEn: 'Any difficulty swallowing or breathing?' }, // local idx 23
  // CHR08 Raised cholesterol
  { complaintCode: 'CHR08', question: 'लिपिड प्रोफाइल जांच आखरी कब कराई थी?', questionEn: 'When was the last lipid profile test done?' }, // local idx 24
  { complaintCode: 'CHR08', question: 'परिवार में दिल की बीमारी का इतिहास?', questionEn: 'Any family history of heart disease?' }, // local idx 25
  // BLD01 Anemia symptoms
  { complaintCode: 'BLD01', question: 'आंखों के पल्लों/नाखूनों का रंग पीला-सफेद पड़ गया?', questionEn: 'Have eyelids/nails turned pale?' }, // local idx 26
  { complaintCode: 'BLD01', question: 'सीढ़ी चढ़ने पर सांस फूलती है या चक्कर आते हैं?', questionEn: 'Breathless on stairs or giddy spells?' }, // local idx 27
  // BLD02 Old-age weakness / frailty
  { complaintCode: 'BLD02', question: 'गिरने का डर है या हाल में गिरे हैं?', questionEn: 'Any fear of falling or recent falls?' }, // local idx 28
  { complaintCode: 'BLD02', question: 'इस समय कौन सी दवाएं चल रही हैं?', questionEn: 'Which medicines are you currently taking?' }, // local idx 29
  // LVR01 Jaundice / hepatitis symptoms
  { complaintCode: 'LVR01', question: 'आंखों/पेशाब का रंग पीला कब से है?', questionEn: 'Since when are eyes/urine yellow?' }, // local idx 30
  { complaintCode: 'LVR01', question: 'बुखार, जी मिचलाना या दाएं ऊपरी पेट में दर्द?', questionEn: 'Fever, nausea or right upper abdominal pain?' }, // local idx 31
  // LVR02 Fatty liver query
  { complaintCode: 'LVR02', question: 'पेट का अल्ट्रासाउंड आखरी कब कराया था?', questionEn: 'When was the last abdominal ultrasound done?' }, // local idx 32
  { complaintCode: 'LVR02', question: 'वजन या पेट की चर्बी बढ़ी है?', questionEn: 'Has weight or belly fat increased?' }, // local idx 33
  // LVR03 Alcohol overuse
  { complaintCode: 'LVR03', question: 'हफ्ते में कितने दिन और कितनी मात्रा शराब?', questionEn: 'How many days a week and how much alcohol?' }, // local idx 34
  { complaintCode: 'LVR03', question: 'सुबह हाथ कांपते हैं या भूख कम लगती है?', questionEn: 'Morning hand tremors or reduced appetite?' }, // local idx 35
  // LVR04 Smoking cessation
  { complaintCode: 'LVR04', question: 'रोज कितने सिगरेट/बीड़ी और कब से?', questionEn: 'How many cigarettes/bidis daily, and since when?' }, // local idx 36
  { complaintCode: 'LVR04', question: 'सुबह उठते ही खांसी आती है?', questionEn: 'Is there a cough on waking in the morning?' }, // local idx 37
  // LVR05 Urinary burning (UTI)
  { complaintCode: 'LVR05', question: 'जलन कब से है और बार-बार पेशाब आता है?', questionEn: 'Since when is the burning, and is urination frequent?' }, // local idx 38
  { complaintCode: 'LVR05', question: 'पेशाब में खून या बुखार के साथ तेज पीठ दर्द?', questionEn: 'Blood in urine, or fever with severe back pain?' }, // local idx 39
  // LVR06 Renal colic (stone)
  { complaintCode: 'LVR06', question: 'दर्द कमर से पेट/जांघ की तरफ जाता है?', questionEn: 'Does the pain travel from the loin toward the groin?' }, // local idx 40
  { complaintCode: 'LVR06', question: 'पेशाब में रेत/पत्थर का दाना निकला है?', questionEn: 'Any gravel or stone fragment passed in the urine?' }, // local idx 41
]

// ══ New suggestions (84 — 2 per new question; LOCAL questionIndex, ═══════
// offset GPQ applied in the export below. Question local idx in comments.)
const newSuggestions: PackSuggestion[] = [
  // INF01 q0 (local 0 → final 54)
  { questionIndex: 0, text: 'दाने या मसूड़ों/नाक से खून — डेंगू जांच (NS1) आज ही कराएं', textEn: 'Rash or bleeding gums/nose — get dengue test (NS1) today' },
  { questionIndex: 0, text: 'बिना दाने/खून — वायरल बुखार संभव, 2-3 दिन में दोबारा आकलन', textEn: 'No rash or bleeding — likely viral; reassess in 2-3 days' },
  // INF01 q1 (local 1)
  { questionIndex: 1, text: 'आंखों के पीछे दर्द — डेंगू की विशेषता, NS1 जांच कराएं', textEn: 'Pain behind the eyes — dengue hallmark, test NS1' },
  { questionIndex: 1, text: 'हल्का दर्द — वायरल बुखार, पैराटामोल + भरपूर तरल', textEn: 'Mild ache — viral fever, paracetamol + plenty of fluids' },
  // INF02 q2 (local 2)
  { questionIndex: 2, text: 'कंपकपी के बाद तेज बुखार — मलेरिया पर्ची (MP smear) बुखार के समय कराएं', textEn: 'Shaking chills then high fever — get MP smear during the fever spike' },
  { questionIndex: 2, text: 'हल्की ठंड — वायरल संभव; तेज ठंड दोबारा आए तो MP जांच', textEn: 'Mild chills — likely viral; test MP if severe chills recur' },
  // INF02 q3 (local 3)
  { questionIndex: 3, text: 'मच्छर-प्रभावित क्षेत्र की यात्रा — मलेरिया व डेंगू दोनों जांचें कराएं', textEn: 'Travel to mosquito-prone area — test for both malaria and dengue' },
  { questionIndex: 3, text: 'कोई यात्रा नहीं — स्थानीय कारण; लक्षण बढ़ें तो जांच कराएं', textEn: 'No travel — local cause; investigate if symptoms worsen' },
  // INF03 q4 (local 4)
  { questionIndex: 4, text: '5 दिन+ बुखार — टाइफाइड जांच (Widal/Typhidot) + CBC कराएं', textEn: 'Fever 5+ days — test for typhoid (Widal/Typhidot) + CBC' },
  { questionIndex: 4, text: 'पेट के लक्षणों के साथ लंबा बुखार — एंट्रिक बुखार संभावना, जांच जरूरी', textEn: 'Prolonged fever with abdominal symptoms — enteric fever likely, workup needed' },
  // INF03 q5 (local 5)
  { questionIndex: 5, text: 'जीभ पर सफेद परत + भूख न लगना — टाइफाइड से मेल खाता है, जांच कराएं', textEn: 'Coated tongue + poor appetite — fits typhoid, get tested' },
  { questionIndex: 5, text: 'मुंह सामान्य — बुखार के अन्य कारण जांचें', textEn: 'Mouth normal — evaluate other causes of fever' },
  // INF04 q6 (local 6)
  { questionIndex: 6, text: '2 हफ्ते+ खांसी — टीबी जांच जरूरी — कफ परीक्षण NTEP केंद्र पर मुफ्त उपलब्ध', textEn: 'Cough 2+ weeks — TB testing essential — sputum test free at NTEP center' },
  { questionIndex: 6, text: '2 हफ्ते से कम — आम खांसी; 1 हफ्ते में न ठीक हो तो दोबारा मिलें', textEn: 'Under 2 weeks — ordinary cough; return if not settled within 1 week' },
  // INF04 q7 (local 7)
  { questionIndex: 7, text: 'वजन घटना + रात का पसीना/शाम को बुखार — टीबी के संकेत — NTEP केंद्र रेफर करें', textEn: 'Weight loss + night sweats/evening fever — TB warning signs — refer to NTEP center' },
  { questionIndex: 7, text: 'ऐसे लक्षण नहीं — टीबी की संभावना कम, निगरानी रखें', textEn: 'No such symptoms — TB less likely, keep monitoring' },
  // INF05 q8 (local 8)
  { questionIndex: 8, text: '1-2 हफ्ते पहले बुखार ठीक हुआ — पोस्ट-वायरल थकान सामान्य है, पौष्टिक आहार + आराम', textEn: 'Fever settled 1-2 weeks ago — post-viral fatigue is normal, nutritious diet + rest' },
  { questionIndex: 8, text: 'बुखार अभी आ-आ कर रहा है — पूरी जांच दोबारा चाहिए', textEn: 'Fever still relapsing — full re-evaluation needed' },
  // INF05 q9 (local 9)
  { questionIndex: 9, text: 'भूख-नींद लौट आई — सुधार हो रहा है, 1-2 हफ्ते में ताकत लौटेगी', textEn: 'Appetite and sleep are back — recovering; strength returns in 1-2 weeks' },
  { questionIndex: 9, text: 'भूख-नींद अभी कम — हल्का पौष्टिक आहार + मल्टीविटामिन; 2 हफ्ते+ रहे तो जांच', textEn: 'Still low — light nutritious diet + multivitamin; investigate if beyond 2 weeks' },
  // CHR01 q10 (local 10)
  { questionIndex: 10, text: 'दवा नियमित नहीं — BP बढ़ने का सबसे बड़ा कारण; रोज एक ही समय पर लें', textEn: 'Missing doses — the biggest cause of rising BP; take at the same time daily' },
  { questionIndex: 10, text: 'नियमित ले रहे हैं — फिर भी BP ज्यादा है तो खुराक की समीक्षा करें', textEn: 'Taking regularly — if BP still high, review the dose' },
  // CHR01 q11 (local 11)
  { questionIndex: 11, text: 'घर पर BP रिकॉर्ड रखना — बहुत अच्छी आदत; मुलाकात पर रिकॉर्ड दिखाएं', textEn: 'Keeping a home BP log — excellent habit; show the record at the visit' },
  { questionIndex: 11, text: 'रिकॉर्ड नहीं रखते — 7 दिन सुबह-शाम का BP रिकॉर्ड रखें, इलाज तय करने में मदद मिलेगी', textEn: 'No log — keep a 7-day morning-evening BP record to guide treatment' },
  // CHR02 q12 (local 12)
  { questionIndex: 12, text: '3 महीने+ बीत गए — HbA1c कराएं', textEn: '3+ months since last check — get HbA1c' },
  { questionIndex: 12, text: 'हाल में जांच हुई — रिपोर्ट दिखाएं, दवा उसी अनुसार चलेगी', textEn: 'Checked recently — show the report, medicines will follow it' },
  // CHR02 q13 (local 13)
  { questionIndex: 13, text: 'पैरों में झनझनाहट/जलन — शुगर की नस-क्षति (न्यूरोपैथी) की जांच चाहिए', textEn: 'Tingling or burning in feet — diabetic neuropathy workup needed' },
  { questionIndex: 13, text: 'पैर सामान्य — रोज पैरों की जांच करें; खुले पैर कभी न घूमें', textEn: 'Feet normal — daily foot inspection; never walk barefoot' },
  // CHR03 q14 (local 14)
  { questionIndex: 14, text: '160/100 से ऊपर — आज ही दवा शुरू/समीक्षा + किडनी जांच (KFT) कराएं', textEn: 'Above 160/100 — start or review medicine today + kidney function tests (KFT)' },
  { questionIndex: 14, text: '140-160/90-100 के बीच — 7 दिन BP रिकॉर्ड के बाद इलाज तय करें', textEn: 'Between 140-160/90-100 — decide treatment after a 7-day BP log' },
  // CHR03 q15 (local 15)
  { questionIndex: 15, text: 'पहले भी दो बार+ ज्यादा आया — स्थायी उच्च रक्तचाप; जांच + इलाज शुरू करें', textEn: 'High on 2+ prior occasions — sustained hypertension; start workup + treatment' },
  { questionIndex: 15, text: 'पहली बार आया है — नमक/तनाव/नींद देखें, 1-2 हफ्ते में दोबारा नापें', textEn: 'First time — review salt/stress/sleep and re-measure in 1-2 weeks' },
  // CHR04 q16 (local 16)
  { questionIndex: 16, text: 'रुक-रुक के तेज धड़कन — आज ECG कराएं', textEn: 'Intermittent racing beats — get an ECG today' },
  { questionIndex: 16, text: 'लगातार हल्की तेज — कैफीन/धूम्रपान/थायरॉइड जांचें', textEn: 'Continuous mild — check caffeine, smoking and thyroid' },
  // CHR04 q17 (local 17)
  { questionIndex: 17, text: 'बेहोशी आई — तुरंत इमरजेंसी/हृदय विशेषज्ञ — ECG आवश्यक', textEn: 'Fainting occurred — emergency or cardiologist now — ECG essential' },
  { questionIndex: 17, text: 'चक्कर नहीं आया — ECG + TSH कराकर देखें', textEn: 'No fainting — evaluate with ECG + TSH' },
  // CHR05 q18 (local 18)
  { questionIndex: 18, text: 'वजन बढ़ना + ठंड लगना + कब्ज — हाइपोथायरॉइड; TSH जांच कराएं', textEn: 'Weight gain + cold intolerance + constipation — hypothyroidism; test TSH' },
  { questionIndex: 18, text: 'इनमें से कोई नहीं — अन्य कारणों पर विचार करें', textEn: 'None of these — consider other causes' },
  // CHR05 q19 (local 19)
  { questionIndex: 19, text: 'त्वचा/बाल रूखे — TSH से थायरॉइड की पुष्टि कराएं', textEn: 'Dry skin and hair — confirm thyroid with TSH' },
  { questionIndex: 19, text: 'सामान्य — संतुलित आहार + विटामिन काफी है', textEn: 'Normal — balanced diet + vitamins suffice' },
  // CHR06 q20 (local 20)
  { questionIndex: 20, text: 'वजन घटा + भूख बढ़ी + गर्मी से परेशानी — हाइपरथायरॉइड का संदेह, TSH कराएं', textEn: 'Weight loss + increased appetite + heat intolerance — suspect hyperthyroid, test TSH' },
  { questionIndex: 20, text: 'ये लक्षण नहीं — चिंता की बात नहीं', textEn: 'No such symptoms — nothing to worry' },
  // CHR06 q21 (local 21)
  { questionIndex: 21, text: 'हाथ कांपना + तेज धड़कन — TSH जांच + थायरॉइड विशेषज्ञ को रेफर करें', textEn: 'Trembling hands + fast pulse — test TSH + refer to thyroid specialist' },
  { questionIndex: 21, text: 'ये नहीं हैं — कैफीन घटाएं, तनाव प्रबंधन करें', textEn: 'Absent — reduce caffeine, manage stress' },
  // CHR07 q22 (local 22)
  { questionIndex: 22, text: 'दर्द भरी सूजन — थायरॉइडाइटिस संभव; तुरंत जांच कराएं', textEn: 'Painful swelling — thyroiditis possible; urgent workup' },
  { questionIndex: 22, text: 'बिना दर्द, महीनों से — थायरॉइड प्रोफाइल + गले का USG कराएं', textEn: 'Painless, present for months — thyroid profile + neck ultrasound' },
  // CHR07 q23 (local 23)
  { questionIndex: 23, text: 'निगलने/सांस में तकलीफ — बड़ी गिल्टी; ENT/सर्जन को रेफर करें', textEn: 'Difficulty swallowing or breathing — large goiter; refer to ENT or surgeon' },
  { questionIndex: 23, text: 'कोई दिक्कत नहीं — जांच रिपोर्ट के अनुसार आगे बढ़ें', textEn: 'No difficulty — proceed as per workup reports' },
  // CHR08 q24 (local 24)
  { questionIndex: 24, text: '1 साल+ पुरानी जांच — खाली पेट लिपिड प्रोफाइल दोबारा कराएं', textEn: 'Report over 1 year old — repeat fasting lipid profile' },
  { questionIndex: 24, text: 'हाल में कराई — रिपोर्ट लाएं, लक्ष्य के हिसाब से इलाज तय होगा', textEn: 'Done recently — bring the report; treatment will be set to target' },
  // CHR08 q25 (local 25)
  { questionIndex: 25, text: 'परिवार में दिल की बीमारी — LDL का कठोर लक्ष्य रखें; ECG भी कराएं', textEn: 'Family history of heart disease — strict LDL target; get ECG too' },
  { questionIndex: 25, text: 'परिवार में नहीं — पहले 3 महीने जीवनशैली + आहार सुधार', textEn: 'No family history — 3 months of lifestyle + diet changes first' },
  // BLD01 q26 (local 26)
  { questionIndex: 26, text: 'पल्लूं/नाखून पीले पड़ गए — एनीमिया; CBC कराएं', textEn: 'Pale eyelids or nails — anemia; get CBC' },
  { questionIndex: 26, text: 'रंग सामान्य — फिर भी महिलाओं/गर्भवती में Hb जांच सोचें', textEn: 'Colour normal — still consider Hb testing in women and pregnancy' },
  // BLD01 q27 (local 27)
  { questionIndex: 27, text: 'हल्के काम पर सांस फूलना — गंभीर एनीमिया का संकेत; Hb आज नापें', textEn: 'Breathless on mild activity — marker of severe anemia; check Hb today' },
  { questionIndex: 27, text: 'सामान्य — आयरन की दवा नींबू/विटामिन C से लें, चाय-कॉफी से 1 घंटा दूर', textEn: 'Normal — take iron with lemon or vitamin C, keep 1 hour away from tea or coffee' },
  // BLD02 q28 (local 28)
  { questionIndex: 28, text: 'गिरने का डर/हाल में गिरे — वृद्ध कमजोरी (फ्रेलिटी); दवा समीक्षा + विटामिन D जांच', textEn: 'Fear of falling or recent falls — frailty; medication review + vitamin D check' },
  { questionIndex: 28, text: 'नहीं गिरे — रोज धीरे टहलना + हल्की ताकत की कसरत शुरू करें', textEn: 'No falls — start daily slow walking + light strength exercises' },
  // BLD02 q29 (local 29)
  { questionIndex: 29, text: '5 से ज्यादा दवाएं — दवा-बोझ की समीक्षा करें; कौन सी बंद हो सकती हैं देखें', textEn: 'On 5+ medicines — review the pill burden; identify stoppable ones' },
  { questionIndex: 29, text: 'कम दवाएं — प्रोटीन व पौष्टिक आहार पर ध्यान दें', textEn: 'Few medicines — focus on protein and nutritious diet' },
  // LVR01 q30 (local 30)
  { questionIndex: 30, text: 'आंख/पेशाब पीले — आज ही लिवर जांच (LFT) कराएं', textEn: 'Yellow eyes or urine — get liver function tests (LFT) today' },
  { questionIndex: 30, text: 'हल्का पीलापन — फिर भी LFT जरूरी; खूब पानी पिएं, तला-मसाला बंद', textEn: 'Mild yellowing — LFT still needed; hydrate well, no fried or spicy food' },
  // LVR01 q31 (local 31)
  { questionIndex: 31, text: 'बुखार + दाएं ऊपरी पेट में दर्द — पित्तथैली/लिवर जांच + पेट का USG', textEn: 'Fever + right upper abdominal pain — gallbladder or liver workup + abdominal USG' },
  { questionIndex: 31, text: 'सिर्फ कमजोरी/मतली — वायरल हेपेटाइटिस संभव; आराम + LFT दोहराना', textEn: 'Only weakness or nausea — viral hepatitis possible; rest + repeat LFT' },
  // LVR02 q32 (local 32)
  { questionIndex: 32, text: 'USG नहीं/पुराना — फैटी लिवर की पुष्टि के लिए पेट का USG कराएं', textEn: 'No or old USG — get an abdominal USG to confirm fatty liver' },
  { questionIndex: 32, text: 'हाल का USG — ग्रेड (I/II/III) नोट करें; इलाज = वजन घटाना', textEn: 'Recent USG — note the grade; the treatment is weight loss' },
  // LVR02 q33 (local 33)
  { questionIndex: 33, text: 'वजन/पेट की चर्बी बढ़ी — फैटी लिवर का मुख्य कारण; 5-10% वजन घटाने से लिवर सुधरता है', textEn: 'Weight or belly fat up — main driver of fatty liver; 5-10% weight loss reverses it' },
  { questionIndex: 33, text: 'वजन सामान्य — शुगर व कोलेस्ट्रॉल भी जांचें', textEn: 'Weight normal — check sugar and cholesterol too' },
  // LVR03 q34 (local 34)
  { questionIndex: 34, text: 'रोज या बड़ी मात्रा — लिवर जांच (LFT) + काउंसलिंग; बिना-शराब के दिन बनाएं', textEn: 'Daily or large amounts — LFT + counseling; add alcohol-free days' },
  { questionIndex: 34, text: 'कभी-कभी हल्की मात्रा — नियंत्रण में है; हफ्ते में 2-3 दिन बिना शराब रखें', textEn: 'Occasional small amounts — under control; keep 2-3 alcohol-free days a week' },
  // LVR03 q35 (local 35)
  { questionIndex: 35, text: 'सुबह हाथ कांपना — शराब पर निर्भरता का संकेत; विशेषज्ञ से मिलें, अचानक बंद न करें', textEn: 'Morning tremors — sign of alcohol dependence; see a specialist, do not stop abruptly' },
  { questionIndex: 35, text: 'नहीं कांपते — धीरे-धीरे मात्रा घटाएं; बी-कॉम्प्लेक्स युक्त आहार लें', textEn: 'No tremors — taper down gradually; take B-complex rich diet' },
  // LVR04 q36 (local 36)
  { questionIndex: 36, text: '10+ रोज — निकोटीन रिप्लेसमेंट (गम) + काउंसलिंग से छोड़ने की सफलता दोगुनी', textEn: '10+ daily — nicotine replacement (gum) + counseling doubles quit success' },
  { questionIndex: 36, text: 'कम सिगरेट — तारीख तय करके एकदम बंद करें', textEn: 'Few cigarettes — set a quit date and stop completely' },
  // LVR04 q37 (local 37)
  { questionIndex: 37, text: 'सुबह की खांसी — धूम्रपान का सीधा असर; छोड़ने के 2-3 हफ्ते में घटती है', textEn: 'Morning cough — direct effect of smoking; reduces within 2-3 weeks of quitting' },
  { questionIndex: 37, text: 'खांसी नहीं — जोखिम फिर भी वही है; छोड़ने के लिए कोई उम्र नहीं होती', textEn: 'No cough — the risk is still the same; it is never too late to quit' },
  // LVR05 q38 (local 38)
  { questionIndex: 38, text: 'जलन + बार-बार पेशाब — UTI; यूरिन रूटीन जांच कराएं', textEn: 'Burning + frequent urination — UTI; get urine routine test' },
  { questionIndex: 38, text: 'सिर्फ हल्की जलन और पानी कम पीते हैं — पहले रोज 2.5-3 लीटर पानी', textEn: 'Only mild burning with low water intake — first aim for 2.5-3 L water daily' },
  // LVR05 q39 (local 39)
  { questionIndex: 39, text: 'बुखार + तेज पीठ दर्द — गुर्दे का संक्रमण (पायलोनेफ्राइटिस) — तुरंत इलाज', textEn: 'Fever + severe back pain — kidney infection (pyelonephritis) — treat urgently' },
  { questionIndex: 39, text: 'खून/बुखार नहीं — साधारण सिंपल UTI; जांच + 5 दिन दवा', textEn: 'No blood and no fever — simple UTI; urine test + 5-day course' },
  // LVR06 q40 (local 40)
  { questionIndex: 40, text: 'कमर से पेट/जांघ की तरफ दर्द — पत्थर का दर्द; USG-KUB कराएं', textEn: 'Pain from loin toward groin — stone colic; get USG KUB' },
  { questionIndex: 40, text: 'एक जगह स्थानीय दर्द — अन्य कारण जांचें', textEn: 'Localised pain — evaluate other causes' },
  // LVR06 q41 (local 41)
  { questionIndex: 41, text: 'रेत/पत्थर निकला — USG से पुष्टि कराएं; रोज 2.5-3 लीटर पानी की आदत बनाएं', textEn: 'Gravel or stone passed — confirm with USG; make 2.5-3 L daily water a habit' },
  { questionIndex: 41, text: 'नहीं निकला — दर्द के साथ उल्टी/बुखार हो तो इमरजेंसी (अवरोध संभव)', textEn: 'Not passed — with vomiting or fever go to emergency (possible obstruction)' },
]

// ══ New labels (4) — GP-01 already carries Temp/Pulse/BP/Weight/Height/ ══
// BMI/SpO2/RBS; MED adds hematology + metabolic tracking.
const newLabels: PackLabel[] = [
  { label: 'हीमोग्लोबिन', labelEn: 'Hemoglobin (Hb)', unit: 'g/dl' },
  { label: 'प्लेटलेट गिनती', labelEn: 'Platelet Count', unit: 'lakh/µl' },
  { label: 'खाली पेट शुगर', labelEn: 'Fasting Blood Sugar', unit: 'mg/dl' },
  { label: 'सीरम क्रिएटिनिन', labelEn: 'Serum Creatinine', unit: 'mg/dl' },
]

// ══ New findings (20) — keys must not collide with GP-01's 12 ═══════════
const newFindings: PackFinding[] = [
  { key: 'DENGUE-FEVER', name: 'डेंगू बुखार', nameEn: 'Dengue Fever', icd10: 'A90' },
  { key: 'ENTERIC-FEVER', name: 'टाइफाइड (एंट्रिक बुखार)', nameEn: 'Enteric Fever (Typhoid)', icd10: 'A01.0' },
  { key: 'MALARIA-VIVAX', name: 'मलेरिया (वाइवैक्स)', nameEn: 'Malaria Vivax', icd10: 'B51.9' },
  { key: 'TB-SUSPECT', name: 'टीबी संदिग्ध — NTEP रेफर', nameEn: 'TB Suspect — NTEP Referral', icd10: 'Z11.7' },
  { key: 'POST-VIRAL-FATIGUE', name: 'वायरल के बाद थकान', nameEn: 'Post-Viral Fatigue', icd10: 'R53' },
  { key: 'HTN-NEW', name: 'उच्च रक्तचाप — नया (शुरुआत)', nameEn: 'Essential Hypertension (New)', icd10: 'I10' },
  { key: 'DM2-NEW', name: 'टाइप 2 शुगर — शुरुआती इलाज', nameEn: 'Type 2 Diabetes (Basic Initiation)', icd10: 'E11.9' },
  { key: 'HYPOTHYROID', name: 'थायरॉइड की कमी (हाइपोथायरॉइड)', nameEn: 'Hypothyroidism', icd10: 'E03.9' },
  { key: 'HYPERTHYROID', name: 'थायरॉइड ज्यादा — रेफर', nameEn: 'Hyperthyroidism (Refer)', icd10: 'E05.9' },
  { key: 'GOITER', name: 'गले की गिल्टी (गॉइटर)', nameEn: 'Goiter — Thyroid Workup', icd10: 'E04.9' },
  { key: 'SEVERE-ANEMIA', name: 'गंभीर एनीमिया — जांच/रेफर', nameEn: 'Severe Anemia (Workup/Refer)', icd10: 'D64.9' },
  { key: 'DYSLIPIDEMIA', name: 'खराब कोलेस्ट्रॉल (डिस्लिपिडेमिया)', nameEn: 'Dyslipidemia', icd10: 'E78.5' },
  { key: 'VIRAL-HEPATITIS', name: 'पीलिया — वायरल हेपेटाइटिस (रेफर)', nameEn: 'Acute Viral Hepatitis (Refer)', icd10: 'B19.9' },
  { key: 'FATTY-LIVER', name: 'फैटी लिवर (NAFLD)', nameEn: 'Fatty Liver (NAFLD)', icd10: 'K76.0' },
  { key: 'TOBACCO-DEP', name: 'तंबाकू निर्भरता (छोड़ने की सहायता)', nameEn: 'Tobacco Dependence (Cessation Support)', icd10: 'F17.2' },
  { key: 'GERD', name: 'रिफ्लक्स (GERD)', nameEn: 'GERD (Reflux Disease)', icd10: 'K21.9' },
  { key: 'IBS', name: 'इरिटेबल बाउल (IBS)', nameEn: 'Irritable Bowel Syndrome', icd10: 'K58.9' },
  { key: 'UTI', name: 'मूत्र संक्रमण (UTI)', nameEn: 'Urinary Tract Infection', icd10: 'N39.0' },
  { key: 'RENAL-COLIC', name: 'किडनी पत्थर दर्द', nameEn: 'Renal Colic (Stone)', icd10: 'N23' },
  { key: 'CKD-SCREEN', name: 'किडनी जांच (CKD स्क्रीन — रेफर)', nameEn: 'CKD Screen (Refer)', icd10: 'N18.9' },
]

// ══ New medicines (22) — names must not duplicate GP-01's 57 ════════════
// All flags: verified=false (unverified-dose mode).
const newMedicines: PackMedicine[] = [
  // Antimalarial / antibiotic (India fever season)
  { name: 'Lumartem Tablet', salt: 'Artemether 20 mg + Lumefantrine 120 mg', doseOptions: ['4 tabs BD × 3 days (adult 35 kg+)', '3 tabs BD × 3 days (25-34 kg)', '2 tabs BD × 3 days (15-24 kg)'], morning: 4, afternoon: 0, evening: 4, tab: 24, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
  { name: 'Doxy-1 LDR Tablet', salt: 'Doxycycline 100 mg', doseOptions: ['1 tab twice daily', '1 tab once daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Niftran 100 Tablet', salt: 'Nitrofurantoin Sustained Release 100 mg', doseOptions: ['1 tab twice daily × 5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Alkasol Liquid 200ml', salt: 'Disodium Hydrogen Citrate 1.25 g/5 ml', doseOptions: ['10 ml in half glass water', '15 ml in a glass of water'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
  // Anemia workup armamentarium
  { name: 'Orofer-XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg', doseOptions: ['1 tab after food', '1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  { name: 'Zentel 400 Tablet', salt: 'Albendazole 400 mg', doseOptions: ['1 tab chewed at night (single dose)', 'repeat after 2 weeks'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'fixed', schedule: 'H', verified: false } },
  { name: 'Limcee 500 Tablet', salt: 'Ascorbic Acid (Vitamin C) 500 mg', doseOptions: ['1 tab after food', '1 tab twice daily'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  // Thyroid (GP-01 already carries Thyronorm 50 mcg)
  { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine Sodium 25 mcg', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Thyronorm 75 mcg Tablet', salt: 'Levothyroxine Sodium 75 mcg', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Inderal 10 Tablet', salt: 'Propranolol 10 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  // Cardiovascular / metabolic
  { name: 'Losar 25 Tablet', salt: 'Losartan Potassium 25 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Telma-AM Tablet', salt: 'Telmisartan 40 mg + Amlodipine 5 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Concor 5 Tablet', salt: 'Bisoprolol Fumarate 5 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Atorva 20 Tablet', salt: 'Atorvastatin 20 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Rosuvas 10 Tablet', salt: 'Rosuvastatin 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Ecosprin 75 Tablet', salt: 'Aspirin 75 mg (enteric coated)', doseOptions: ['1 tab after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  // Liver / GI
  { name: 'Udiliv 300 Tablet', salt: 'Ursodeoxycholic Acid 300 mg', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Pan-D Capsule', salt: 'Pantoprazole 40 mg + Domperidone 30 mg SR', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  // Steroid (short-course default) + cessation support
  { name: 'Wysolone 10 Tablet', salt: 'Prednisolone 10 mg', doseOptions: ['1 tab once daily (5-day short course)'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
  { name: 'Nicotex 2mg Gum', salt: 'Nicotine Polacrilex 2 mg chewing gum', doseOptions: ['1 gum slowly when urge strikes (max 9/day)'], morning: 0, afternoon: 0, evening: 0, tab: 12, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
]

// ══ New finding ↔ medicine links (25) ═══════════════════════════════════
// NOTE: TB-SUSPECT / GOITER / CKD-SCREEN / HYPERTHYROID deliberately have
// NO auto-medicine links (refer-first findings) except symptom relief.
const newFindingMeds: PackFindingMed[] = [
  // DENGUE-FEVER — paracetamol ONLY
  { findingKey: 'DENGUE-FEVER', medicineName: 'Dolo 650 Tablet', dose: '1 tab (650 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'ONLY paracetamol — never ibuprofen/aspirin; max 4 tabs/24 hrs' },
  // ENTERIC-FEVER
  { findingKey: 'ENTERIC-FEVER', medicineName: 'Taxim-O 200 Tablet', description: '1 tab BD × 7-14 days after food; complete FULL course' },
  // MALARIA-VIVAX — confirm species first, NVBDCP pattern
  { findingKey: 'MALARIA-VIVAX', medicineName: 'Lumartem Tablet', description: '4 tabs BD × 3 days (adult); radical cure needs primaquine AFTER G6PD test — specialist call' },
  // UTI
  { findingKey: 'UTI', medicineName: 'Niftran 100 Tablet', description: '1 tab BD × 5 days after food (avoid in last month of pregnancy)' },
  { findingKey: 'UTI', medicineName: 'Alkasol Liquid 200ml', dose: '10 ml in half glass water TDS', description: 'Relieves burning; dilute before drinking' },
  // HTN-NEW — initiation
  { findingKey: 'HTN-NEW', medicineName: 'Telma 40 Tablet', description: '1 tab OD morning; re-check BP after 2 weeks with home log' },
  { findingKey: 'HTN-NEW', medicineName: 'Losar 25 Tablet', description: 'Alternative ARB if telmisartan not tolerated' },
  // DM2-NEW — basic initiation only (deep DM lives in DIA-01)
  { findingKey: 'DM2-NEW', medicineName: 'Glycomet 500 SR Tablet', description: '1 tab after dinner with food; escalate per HbA1c' },
  // HYPOTHYROID — titrate per TSH
  { findingKey: 'HYPOTHYROID', medicineName: 'Thyronorm 25 mcg Tablet', description: 'Start low (25 mcg) in elderly/cardiac; re-test TSH at 6-8 weeks' },
  { findingKey: 'HYPOTHYROID', medicineName: 'Thyronorm 50 mcg Tablet', description: 'Usual adult maintenance; empty stomach, 45 min before food' },
  { findingKey: 'HYPOTHYROID', medicineName: 'Thyronorm 75 mcg Tablet', description: 'Titration strength per TSH' },
  // HYPERTHYROID — symptom bridge till referral
  { findingKey: 'HYPERTHYROID', medicineName: 'Inderal 10 Tablet', description: '1 tab BD for pulse/tremor relief till endocrinology referral' },
  // SEVERE-ANEMIA — treat + workup; transfuse/refer if Hb < 7
  { findingKey: 'SEVERE-ANEMIA', medicineName: 'Orofer-XT Tablet', description: '1 tab BD after food × 3 months if oral tolerated; else refer' },
  { findingKey: 'SEVERE-ANEMIA', medicineName: 'Folvite 5 Tablet', description: '1 tab OD along with iron' },
  { findingKey: 'SEVERE-ANEMIA', medicineName: 'Zentel 400 Tablet', description: 'Single night dose — deworming before iron course' },
  // DYSLIPIDEMIA
  { findingKey: 'DYSLIPIDEMIA', medicineName: 'Rosuvas 10 Tablet', description: '1 tab HS; repeat lipid profile after 8-12 weeks' },
  { findingKey: 'DYSLIPIDEMIA', medicineName: 'Atorva 20 Tablet', description: '1 tab HS; if LDL target not met on 10 mg' },
  // VIRAL-HEPATITIS — supportive; refer for fulminant signs
  { findingKey: 'VIRAL-HEPATITIS', medicineName: 'Udiliv 300 Tablet', description: '1 tab BD × 2-4 weeks (supportive); monitor LFT weekly' },
  // FATTY-LIVER — weight loss is the treatment
  { findingKey: 'FATTY-LIVER', medicineName: 'Udiliv 300 Tablet', description: '1 tab BD with LFT monitoring; mainstay is 5-10% weight loss' },
  // GERD
  { findingKey: 'GERD', medicineName: 'Pan-D Capsule', description: '1 cap before breakfast × 4 weeks; dinner 2 hrs before bed' },
  // IBS
  { findingKey: 'IBS', medicineName: 'Colospa Retard Capsule', description: '1 cap BD before food × 2-4 weeks (spasm-predominant)' },
  // RENAL-COLIC
  { findingKey: 'RENAL-COLIC', medicineName: 'Drotin DS Tablet', description: '1 tab SOS for colic; USG KUB to size the stone' },
  // TOBACCO-DEP
  { findingKey: 'TOBACCO-DEP', medicineName: 'Nicotex 2mg Gum', description: '1 gum when urge strikes (max 9/day) × 8-12 weeks + counseling' },
  // URTICARIA (GP finding) — severe only, short course
  { findingKey: 'URTICARIA', medicineName: 'Wysolone 10 Tablet', description: 'Severe urticaria ONLY: 1 tab OD × 5 days after breakfast, then taper — never long-term' },
  // HTN-FU (GP finding) — escalation
  { findingKey: 'HTN-FU', medicineName: 'Telma-AM Tablet', description: '1 tab OD if BP not controlled on Telma 40 alone' },
]

// ══ New table templates (4) — GP-01 already has BP/Sugar/Fever basics ═══
const newTables: PackTableTemplate[] = [
  {
    name: 'Dengue Fever Day Chart (7 days)',
    rows: 7,
    cols: 4,
    headerLabel: ['दिन', 'तापमान', 'नाड़ी', 'प्लेटलेट'],
    colsLabel: ['Day', 'Temperature', 'Pulse', 'Platelets'],
    footerLabel: ['प्लेटलेट 1 लाख से नीचे या तेज गिरावट हो तो तुरंत डॉक्टर को दिखाएं / Platelets below 1 lakh or falling fast — see doctor immediately'],
  },
  {
    name: 'BP Log (7 days · AM/PM)',
    rows: 7,
    cols: 4,
    headerLabel: ['तारीख', 'सुबह BP', 'शाम BP', 'टिप्पणी'],
    colsLabel: ['Date', 'Morning BP', 'Evening BP', 'Remarks'],
    footerLabel: ['सुबह BP दवा खाने से पहले नापें / Measure morning BP before taking medicine'],
  },
  {
    name: 'Sugar Log (7 days · FBS/PPBS)',
    rows: 7,
    cols: 3,
    headerLabel: ['तारीख', 'खाली पेट', 'खाने के 2 घंटे बाद'],
    colsLabel: ['Date', 'Fasting (FBS)', 'Post-Meal (PPBS)'],
    footerLabel: ['रिकॉर्ड डॉक्टर को दिखाएं / Show the record to your doctor'],
  },
  {
    name: 'Anemia Follow-up Tracker (8 weeks)',
    rows: 8,
    cols: 3,
    headerLabel: ['हफ्ता', 'हीमोग्लोबिन', 'टिप्पणी'],
    colsLabel: ['Week', 'Hemoglobin', 'Notes'],
    footerLabel: ['आयरन का कोर्स 3 महीने पूरा करें / Complete the full 3-month iron course'],
  },
]

// ══ New Rx templates (5) ═══════════════════════════════════════════════
const newRxTemplates: PackRxTemplate[] = [
  {
    name: 'Iron Deficiency Anemia — Workup + Rx',
    diagnosis: 'ANEMIA',
    medicines: [
      { name: 'Orofer-XT Tablet', dose: '1 tab', duration: '90 days', instructions: 'After food; BD if tolerated' },
      { name: 'Zentel 400 Tablet', dose: '1 tab chewed', duration: '1 day', instructions: 'Single night dose (deworming)' },
      { name: 'Limcee 500 Tablet', dose: '1 tab', duration: '30 days', instructions: 'With iron for better absorption' },
    ],
    labs: ['CBC + Peripheral Smear', 'Serum Ferritin', 'Stool Occult Blood (if age 40+)'],
    advice: 'आयरन की गोली नींबू/विटामिन C के साथ लें · चाय-कॉफी से 1 घंटा दूर रखें · काला दस्त आए तो घबराएं नहीं · 4 हफ्ते में Hb दोहराकर दिखाएं',
    followUpDays: 28,
    isCommon: true,
  },
  {
    name: 'Hypertension Stage-1 — Initiation',
    diagnosis: 'HTN-NEW',
    medicines: [
      { name: 'Telma 40 Tablet', dose: '1 tab', duration: '30 days', instructions: 'Morning, same time daily' },
    ],
    labs: ['Serum Creatinine + Electrolytes', 'Urine Routine', 'ECG', 'Fasting Lipid Profile'],
    advice: 'नमक रोज 1 चम्मच से कम · घर पर सुबह-शाम BP रिकॉर्ड करें · रोज 30 मिनट टहलना · 2 हफ्ते में BP रिकॉर्ड लेकर मिलें',
    followUpDays: 14,
    isCommon: true,
  },
  {
    name: 'Dengue Day-1 — Supportive Care',
    diagnosis: 'DENGUE-FEVER',
    medicines: [
      { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '3-5 days', instructions: 'SOS for fever; max 4/day — ONLY paracetamol, never ibuprofen/aspirin' },
      { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L', duration: '5 days', instructions: 'Sip through the day' },
    ],
    labs: ['Dengue NS1 Antigen (day 1-5 of fever)', 'CBC + Platelet count (daily till fever settles)'],
    advice: 'सिर्फ पैराटामोल — ब्रुफेन/एस्पिरिन कभी नहीं · खूब तरल (ORS, नारियल पानी, सूप) · मसूड़ों से खून, काला दस्त, तेज पेट दर्द या अत्यधिक सुस्ती हो तो तुरंत अस्पताल · रोज प्लेटलेट गिनती कराएं',
    followUpDays: 1,
    isCommon: true,
  },
  {
    name: 'UTI (Female) — Uncomplicated',
    diagnosis: 'UTI',
    medicines: [
      { name: 'Niftran 100 Tablet', dose: '1 tab', duration: '5 days', instructions: 'BD after food; complete the full course' },
      { name: 'Alkasol Liquid 200ml', dose: '10 ml in water', duration: '5 days', instructions: 'TDS, diluted in half glass water' },
    ],
    labs: ['Urine Routine + Microscopy', 'Urine Culture (if recurrent)'],
    advice: 'रोज 2.5-3 लीटर पानी · पेशाब कभी न रोकें · शौच के बाद आगे से पीछे साफ करें · 5 दिन बाद भी जलन रहे तो दोबारा मिलें',
    followUpDays: 5,
  },
  {
    name: 'Enteric Fever — Suspected (Day 1)',
    diagnosis: 'ENTERIC-FEVER',
    medicines: [
      { name: 'Taxim-O 200 Tablet', dose: '1 tab', duration: '7 days', instructions: 'BD after food; complete the FULL course even if better' },
      { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '5 days', instructions: 'SOS for fever; max 4/day' },
    ],
    labs: ['Widal / Typhidot', 'CBC', 'Urine Routine'],
    advice: 'कोर्स पूरा करें — 3 दिन में सुधार लगे तो भी 7 दिन की गोलियां खाएं · हल्का पचने वाला खाना · पानी उबालकर/फिल्टर करके पिएं · 3 दिन में बुखार न घटे तो दोबारा मिलें',
    followUpDays: 3,
  },
]

// ═══════════════════════════════════════════════════════════════════════
// MED-01 — GP-01 spread VERBATIM + internal-medicine depth appended.
// ═══════════════════════════════════════════════════════════════════════
export const MED01_PACK: SpecialtyPack = {
  meta: {
    code: 'MED-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Internal Medicine Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'GP-01 spread + NLEM 2023 backbone · NVBDCP malaria/dengue seasonal patterns · NTEP TB referral guidance · India internal-medicine OPD practice · unverified-dose launch mode',
  },

  categories: [...GP01_PACK.categories, ...newCategories],
  complaints: [...GP01_PACK.complaints, ...newComplaints],
  questions: [...GP01_PACK.questions, ...newQuestions],
  suggestions: [
    ...GP01_PACK.suggestions, // GP indices still valid — GP questions come first
    ...newSuggestions.map((s) => ({ ...s, questionIndex: s.questionIndex + GPQ })), // offset applied
  ],
  labels: [...GP01_PACK.labels, ...newLabels],
  findings: [...GP01_PACK.findings, ...newFindings],
  medicines: [...GP01_PACK.medicines, ...newMedicines],
  findingMeds: [...GP01_PACK.findingMeds, ...newFindingMeds],
  tables: [...GP01_PACK.tables, ...newTables],
  rxTemplates: [...GP01_PACK.rxTemplates, ...newRxTemplates],
}
