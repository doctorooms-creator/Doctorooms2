/**
 * PUL-01 — PULMONOLOGY STARTER PACK (T2)
 *
 * The India respiratory OPD core: cough pathways with the 2-week TB rule,
 * asthma/COPD inhaler management with technique counselling, NTEP-aligned
 * TB support (referral-only — NO ATT in this pack), allergic/occupational/
 * pollution cough, and smoking-cessation support.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India respiratory core).
 *
 * ⚠ SAFETY FRAME (non-negotiable):
 * - TB = NTEP referral ONLY. ACTIVE-TB-SUSPECT carries ZERO medicines.
 *   No anti-TB drugs (ATT) anywhere in this pack — only pyridoxine-B6
 *   continuation for patients already on NTEP treatment + nutrition support.
 * - Massive hemoptysis / sudden one-sided breathlessness / severe asthma
 *   attack / severe COPD exacerbation = emergency findings, zero meds.
 * - NO oral corticosteroids (specialist decision — text lines only),
 *   NO codeine/dextromethorphan antitussives.
 * - Steroid-inhaler rinse-mouth (oral candidiasis) notes throughout.
 * - Montelukast neuropsychiatric (FDA boxed) note · Deriphyllin cardiac
 *   arrhythmia caution · NSAID/aspirin-avoidance line in asthma ·
 *   OSA = sleep-study referral + driving caution (no wake-promoting agents).
 * - Child dosing excluded — child wheeze is referred to paediatrics.
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * Sources: NTEP/Nikshay TB guidance · GINA/GOLD-style inhaler counselling ·
 * India pulmonology OPD top-prescribe patterns · GP-01 field conventions.
 */

import type { SpecialtyPack } from '../types'

export const PUL01_PACK: SpecialtyPack = {
  meta: {
    code: 'PUL-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Pulmonology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NTEP/Nikshay-aligned TB pathways · GINA/GOLD-style inhaler counselling · India pulmonology OPD patterns · unverified-dose launch mode',
  },

  // ══ Categories (7) ════════════════════════════════════════════════════
  categories: [
    { key: 'COU', name: 'खांसी', nameEn: 'Cough' },
    { key: 'WHE', name: 'सांस-फूलना एवं घरघराहट', nameEn: 'Breathlessness & Wheeze' },
    { key: 'AST', name: 'दमा (अस्थमा)', nameEn: 'Asthma' },
    { key: 'TB', name: 'टीबी (NTEP)', nameEn: 'Tuberculosis (NTEP)' },
    { key: 'INF', name: 'छाती के संक्रमण', nameEn: 'Chest Infections' },
    { key: 'SMK', name: 'धूम्रपान एवं COPD', nameEn: 'Smoking & COPD' },
    { key: 'OTH', name: 'अन्य श्वसन सेवाएं', nameEn: 'Other Respiratory Services' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // COU — खांसी (Cough)
    { code: 'COU01', categoryKey: 'COU', detail: 'सूखी खांसी (तीव्र, 2 हफ्ते से कम)', detailEn: 'Dry Cough (Acute)' },
    { code: 'COU02', categoryKey: 'COU', detail: 'बलगम वाली खांसी', detailEn: 'Cough with Sputum' },
    { code: 'COU03', categoryKey: 'COU', detail: 'खांसी 2 हफ्ते से ज्यादा (टीबी जांच)', detailEn: 'Cough More Than 2 Weeks (TB Screening)' },
    { code: 'COU04', categoryKey: 'COU', detail: 'रात को खांसी से नींद टूटना (दमा-पैटर्न)', detailEn: 'Night Cough Waking (Asthma Pattern)' },
    { code: 'COU05', categoryKey: 'COU', detail: 'हर साल मौसमी खांसी-जुकाम', detailEn: 'Seasonal Recurrent Cough-Cold' },
    { code: 'COU06', categoryKey: 'COU', detail: 'धूल से बढ़ने वाली खांसी (व्यावसायिक जांच)', detailEn: 'Dust-Triggered Cough (Occupational Screen)' },
    { code: 'COU07', categoryKey: 'COU', detail: 'खांसी के साथ सीने में चुभता दर्द (जांच संकेत)', detailEn: 'Cough with Pleuritic Chest Pain (Flag)' },
    { code: 'COU08', categoryKey: 'COU', detail: 'एलर्जिक नासिका + खांसी साथ-साथ', detailEn: 'Allergic Rhinitis with Cough' },
    { code: 'COU09', categoryKey: 'COU', detail: 'वायरल के बाद टिकी खांसी', detailEn: 'Post-Viral Lingering Cough' },
    { code: 'COU10', categoryKey: 'COU', detail: 'खांसी + सीने में जलन का संबंध (रिफ्लक्स)', detailEn: 'Cough with Heartburn Link (GERD)' },
    { code: 'COU11', categoryKey: 'COU', detail: 'वायु-प्रदूषण के मौसम में खांसी (AQI)', detailEn: 'Air-Pollution Seasonal Cough (AQI Context)' },
    { code: 'COU12', categoryKey: 'COU', detail: 'खांसी + बुखार + बलगम (तीव्र ब्रोंकाइटिस)', detailEn: 'Cough with Fever and Sputum (Acute Bronchitis)' },
    // WHE — सांस-फूलना एवं घरघराहट (Breathlessness & Wheeze)
    { code: 'WHE01', categoryKey: 'WHE', detail: 'बार-बार घरघराहट (वयस्क)', detailEn: 'Recurrent Wheeze (Adult)' },
    { code: 'WHE02', categoryKey: 'WHE', detail: 'बच्चे को बार-बार घरघराहट (पेडियाट्रिक रेफर)', detailEn: 'Recurrent Child Wheeze (Refer Paediatrics)' },
    { code: 'WHE03', categoryKey: 'WHE', detail: 'चलने-चढ़ने पर सांस फूलना', detailEn: 'Breathlessness on Exertion' },
    { code: 'WHE04', categoryKey: 'WHE', detail: 'लेटने पर सांस फूलना + पैरों में सूजन (हृदय रेफर संकेत)', detailEn: 'Orthopnea with Leg Swelling (Cardiac Flag)' },
    { code: 'WHE05', categoryKey: 'WHE', detail: 'अचानक एक तरफ सांस फूलना (आपातकाल संकेत)', detailEn: 'Sudden One-Sided Breathlessness (Emergency Flag)' },
    // AST — दमा (Asthma)
    { code: 'AST01', categoryKey: 'AST', detail: 'दमा — नियमित फॉलो-अप', detailEn: 'Asthma Follow-up' },
    { code: 'AST02', categoryKey: 'AST', detail: 'दमा बिगड़ रहा है (आंशिक नियंत्रित)', detailEn: 'Asthma Worsening (Partly Controlled)' },
    { code: 'AST03', categoryKey: 'AST', detail: 'इनहेलर रिफिल / तकनीक जांच', detailEn: 'Inhaler Refill / Technique Review' },
    // TB — टीबी (NTEP)
    { code: 'TB01', categoryKey: 'TB', detail: 'खांसी + शाम को बुखार (टीबी संकेत)', detailEn: 'Cough with Evening Fever (TB Flag)' },
    { code: 'TB02', categoryKey: 'TB', detail: 'खांसी + वजन घटना + रात का पसीना (टीबी संकेत)', detailEn: 'Cough with Weight Loss and Night Sweats (TB Flag)' },
    { code: 'TB03', categoryKey: 'TB', detail: 'बलगम में खून की लकीरें (हेमोप्टिसिस संकेत)', detailEn: 'Blood Streaks in Sputum (Hemoptysis Flag)' },
    { code: 'TB04', categoryKey: 'TB', detail: 'खून थूकना — भारी मात्रा (आपातकाल संकेत)', detailEn: 'Massive Hemoptysis (Emergency Flag)' },
    { code: 'TB05', categoryKey: 'TB', detail: 'टीबी का इलाज चालू — फॉलो-अप सहायता (NTEP)', detailEn: 'TB Treatment Ongoing — Follow-up Support (NTEP)' },
    { code: 'TB06', categoryKey: 'TB', detail: 'टीबी का इलाज पूरा हुआ — जांच', detailEn: 'TB Treatment Completed — Check-up' },
    { code: 'TB07', categoryKey: 'TB', detail: 'टीबी के मरीज के संपर्क में — स्क्रीनिंग', detailEn: 'TB Contact — Screening' },
    { code: 'TB08', categoryKey: 'TB', detail: 'टीबी दवा का साइड-इफेक्ट — परामर्श', detailEn: 'TB Medicine Side-effect — Counselling' },
    // INF — छाती के संक्रमण (Chest Infections)
    { code: 'INF01', categoryKey: 'INF', detail: 'निमोनिया ठीक होने के बाद — जांच', detailEn: 'Pneumonia Recovered — Check-up' },
    { code: 'INF02', categoryKey: 'INF', detail: 'बार-बार छाती का संक्रमण (इम्यून जांच संकेत)', detailEn: 'Frequent Chest Infections (Immunoscreen Flag)' },
    { code: 'INF03', categoryKey: 'INF', detail: 'टीक-टीक वाली खांसी (काली खांसी जांच)', detailEn: 'Whooping-Cough Pattern (Pertussis Screen)' },
    { code: 'INF04', categoryKey: 'INF', detail: 'कोविड के बाद टिकी खांसी / सांस फूलना', detailEn: 'Post-COVID Persistent Cough / Breathlessness' },
    { code: 'INF05', categoryKey: 'INF', detail: 'प्लूरल इफ्यूजन ठीक होने के बाद — जांच', detailEn: 'Pleural Effusion Recovered — Follow-up' },
    // SMK — धूम्रपान एवं COPD
    { code: 'SMK01', categoryKey: 'SMK', detail: 'स्मोकर की सुबह की खांसी', detailEn: 'Smoker Morning Cough' },
    { code: 'SMK02', categoryKey: 'SMK', detail: 'COPD (धूम्रपान) — फॉलो-अप', detailEn: 'COPD Smoker — Follow-up' },
    { code: 'SMK03', categoryKey: 'SMK', detail: 'COPD हल्का बिगड़ना', detailEn: 'COPD Worsening (Mild)' },
    { code: 'SMK04', categoryKey: 'SMK', detail: 'तंबाकू छोड़ने की सलाह', detailEn: 'Tobacco-Cessation Consult' },
    // OTH — अन्य श्वसन सेवाएं
    { code: 'OTH01', categoryKey: 'OTH', detail: 'नींद में नाक बजना + दिन में नींद (OSA संकेत)', detailEn: 'Snoring + Day Sleepiness (OSA Flag)' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'फेफड़ों की फाइब्रोसिस — नियमित फॉलो-अप', detailEn: 'Lung Fibrosis Follow-up (Continuation)' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'स्पाइरोमेट्री बाहर कराई — रिपोर्ट रिव्यू', detailEn: 'Spirometry Done Outside — Review' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'CT छाती बाहर कराई — रिपोर्ट रिव्यू', detailEn: 'CT Chest Done Outside — Review' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'श्वसन-व्यायाम परामर्श', detailEn: 'Breathing-Exercise Consult' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'कार्यस्थल की धूल / मास्क परामर्श', detailEn: 'Workplace Dust / Mask Consult' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'छाती का X-ray बाहर कराया — रिपोर्ट रिव्यू', detailEn: 'Chest X-ray Done Outside — Review' },
  ],

  // ══ Questions (88 — 2 per complaint) ══════════════════════════════════
  // Each entry carries its TRUE 0-based array index in the // idx comment.
  // questionIndex values in `suggestions` below MUST match this order.
  questions: [
    // COU01 Dry cough (idx 0-1)
    // idx 0
    { complaintCode: 'COU01', question: 'खांसी कितने दिनों से है?', questionEn: 'Since how many days is the cough?' },
    // idx 1
    { complaintCode: 'COU01', question: 'खांसी सूखी है या बलगम निकलता है?', questionEn: 'Is the cough dry or is there sputum?' },
    // COU02 Cough with sputum (idx 2-3)
    // idx 2
    { complaintCode: 'COU02', question: 'बलगम का रंग कैसा है?', questionEn: 'What is the colour of the sputum?' },
    // idx 3
    { complaintCode: 'COU02', question: 'दिन में बलगम कितना आता है — चम्मच या कप भर?', questionEn: 'How much sputum per day — spoonfuls or a cupful?' },
    // COU03 Cough >2 weeks, TB screening (idx 4-5)
    // idx 4
    { complaintCode: 'COU03', question: 'खांसी कितने समय से है — 2 हफ्ते से ज्यादा?', questionEn: 'How long has the cough lasted — more than 2 weeks?' },
    // idx 5
    { complaintCode: 'COU03', question: 'साथ में शाम का बुखार, रात का पसीना या वजन घटना कुछ भी है?', questionEn: 'Any evening fever, night sweats or weight loss along with it?' },
    // COU04 Night cough waking (idx 6-7)
    // idx 6
    { complaintCode: 'COU04', question: 'हफ्ते में कितनी रातों खांसी से नींद टूटती है?', questionEn: 'How many nights a week does cough break your sleep?' },
    // idx 7
    { complaintCode: 'COU04', question: 'खांसी के साथ घरघराहट या सांस फूलना भी है?', questionEn: 'Is there wheeze or breathlessness with the cough?' },
    // COU05 Seasonal cough-cold (idx 8-9)
    // idx 8
    { complaintCode: 'COU05', question: 'यह खांसी-जुकाम हर साल किस मौसम में आता है?', questionEn: 'In which season does this cough-cold come every year?' },
    // idx 9
    { complaintCode: 'COU05', question: 'छींक, नाक में खुजली या पानीदार नाक भी साथ होते हैं?', questionEn: 'Do sneezing, itchy or watery nose also accompany it?' },
    // COU06 Dust-triggered cough (idx 10-11)
    // idx 10
    { complaintCode: 'COU06', question: 'धूल/धुएं में जाने से खांसी कितनी बढ़ जाती है?', questionEn: 'How much does dust or smoke worsen the cough?' },
    // idx 11
    { complaintCode: 'COU06', question: 'आपका काम धूल वाली जगह पर है — खदान, कपास मिल, निर्माण?', questionEn: 'Is your job at a dusty place — mine, cotton mill, construction?' },
    // COU07 Pleuritic chest pain (idx 12-13)
    // idx 12
    { complaintCode: 'COU07', question: 'दर्द एक तरफ चुभता है और गहरी सांस लेने पर बढ़ता है?', questionEn: 'Is the pain one-sided and sharp, worse on deep breathing?' },
    // idx 13
    { complaintCode: 'COU07', question: 'इसके साथ बुखार या ठंड कांपनी भी है?', questionEn: 'Is there fever or chills with it?' },
    // COU08 Allergic rhinitis + cough (idx 14-15)
    // idx 14
    { complaintCode: 'COU08', question: 'नाक में खुजली, लगातार छींक या पानी बहना है?', questionEn: 'Is there itchy nose, constant sneezing or watery discharge?' },
    // idx 15
    { complaintCode: 'COU08', question: 'धूल, पराग या पालतू जानवर से लक्षण बढ़ते हैं?', questionEn: 'Do dust, pollen or pets worsen the symptoms?' },
    // COU09 Post-viral lingering cough (idx 16-17)
    // idx 16
    { complaintCode: 'COU09', question: 'वायरल बुखार/जुकाम कब ठीक हुआ था?', questionEn: 'When did the viral fever or cold get better?' },
    // idx 17
    { complaintCode: 'COU09', question: 'बची हुई खांसी सूखी है या थोड़ा बलगम आता है?', questionEn: 'Is the leftover cough dry or with some sputum?' },
    // COU10 GERD cough (idx 18-19)
    // idx 18
    { complaintCode: 'COU10', question: 'खांसी के साथ सीने में जलन या खट्टी डकार आती है?', questionEn: 'Do you get heartburn or sour belching along with the cough?' },
    // idx 19
    { complaintCode: 'COU10', question: 'लेटने पर या खाने के तुरंत बाद खांसी बढ़ती है?', questionEn: 'Does the cough worsen on lying down or right after meals?' },
    // COU11 Air-pollution cough (idx 20-21)
    // idx 20
    { complaintCode: 'COU11', question: 'इस समय आपके इलाके में धुंध/प्रदूषण कैसी है?', questionEn: 'How is the smog or pollution in your area right now?' },
    // idx 21
    { complaintCode: 'COU11', question: 'घर में चूल्हा, लकड़ी या बायोमास का धुआं इस्तेमाल होता है?', questionEn: 'Do you use a chulha, wood or biomass smoke at home?' },
    // COU12 Acute bronchitis pattern (idx 22-23)
    // idx 22
    { complaintCode: 'COU12', question: 'बुखार और खांसी कितने दिनों से साथ चल रहे हैं?', questionEn: 'Since how many days are fever and cough running together?' },
    // idx 23
    { complaintCode: 'COU12', question: 'बलगम का रंग पीला/हरा है या साफ?', questionEn: 'Is the sputum yellow or green, or clear?' },
    // WHE01 Recurrent adult wheeze (idx 24-25)
    // idx 24
    { complaintCode: 'WHE01', question: 'बचपन या किशोरावस्था में भी दमा/घरघराहट थी?', questionEn: 'Did you have asthma or wheeze in childhood or teens?' },
    // idx 25
    { complaintCode: 'WHE01', question: 'घरघराहट के दौरे कितनी बार आते हैं — हफ्ते या महीने में?', questionEn: 'How often do wheeze episodes come — per week or month?' },
    // WHE02 Child recurrent wheeze (idx 26-27)
    // idx 26
    { complaintCode: 'WHE02', question: 'बच्चे की उम्र क्या है?', questionEn: 'What is the age of the child?' },
    // idx 27
    { complaintCode: 'WHE02', question: 'हर जुकाम के साथ बच्चे को घरघराहट हो जाती है?', questionEn: 'Does the child wheeze with every cold?' },
    // WHE03 Exertional breathlessness (idx 28-29)
    // idx 28
    { complaintCode: 'WHE03', question: 'कितनी दूर चलने या कितनी सीढ़ियां चढ़ने पर सांस फूलती है?', questionEn: 'After how much walking or how many stairs do you get breathless?' },
    // idx 29
    { complaintCode: 'WHE03', question: 'घर पर पल्स ऑक्सीमीटर (SpO2) का कोई मान पता है?', questionEn: 'Do you know any home pulse oximeter (SpO2) reading?' },
    // WHE04 Orthopnea + leg swelling (idx 30-31)
    // idx 30
    { complaintCode: 'WHE04', question: 'लेटते ही कितनी देर में सांस फूलना शुरू होता है — कितनी तकिया लगाते हैं?', questionEn: 'How soon after lying down does breathlessness start — how many pillows do you use?' },
    // idx 31
    { complaintCode: 'WHE04', question: 'पैरों/टखनों में सूजन कब से है?', questionEn: 'Since when is the swelling in the feet or ankles?' },
    // WHE05 Sudden one-sided breathlessness (idx 32-33)
    // idx 32
    { complaintCode: 'WHE05', question: 'सांस फूलना अचानक कब शुरू हुआ — क्या करते समय?', questionEn: 'When did the breathlessness start suddenly — during what activity?' },
    // idx 33
    { complaintCode: 'WHE05', question: 'उसी तरफ सीने में तेज चुभता दर्द भी है?', questionEn: 'Is there severe stabbing pain on the same side of the chest?' },
    // AST01 Asthma follow-up (idx 34-35)
    // idx 34
    { complaintCode: 'AST01', question: 'पिछले 4 हफ्तों में दिन के लक्षण कितने दिन रहे?', questionEn: 'On how many days in the last 4 weeks did you have daytime symptoms?' },
    // idx 35
    { complaintCode: 'AST01', question: 'धूल, ठंडी हवा, पालतू जानवर या व्यायाम से लक्षण बढ़ते हैं?', questionEn: 'Do dust, cold air, pets or exercise worsen the symptoms?' },
    // AST02 Asthma worsening (idx 36-37)
    // idx 36
    { complaintCode: 'AST02', question: 'राहत वाला (रेस्क्यू) इनहेलर हफ्ते में कितनी बार इस्तेमाल हो रहा है?', questionEn: 'How many times a week are you using the rescue inhaler?' },
    // idx 37
    { complaintCode: 'AST02', question: 'इस हफ्ते रात में खांसी/सांस से कितनी बार नींद टूटी?', questionEn: 'How many times this week did cough or breathlessness wake you at night?' },
    // AST03 Inhaler refill/technique (idx 38-39)
    // idx 38
    { complaintCode: 'AST03', question: 'कौन से इनहेलर चल रहे हैं — नाम/रंग बता सकते हैं?', questionEn: 'Which inhalers are you on — can you tell the names or colours?' },
    // idx 39
    { complaintCode: 'AST03', question: 'इनहेलर लगाने के बाद राहत कितनी देर तक रहती है?', questionEn: 'How long does relief last after using the inhaler?' },
    // TB01 Cough + evening fever (idx 40-41)
    // idx 40
    { complaintCode: 'TB01', question: 'बुखार किस समय ज्यादा होता है — दोपहर, शाम या रात में?', questionEn: 'When is the fever highest — afternoon, evening or night?' },
    // idx 41
    { complaintCode: 'TB01', question: 'यह शाम का बुखार कितने दिनों से चल रहा है?', questionEn: 'Since how many days is this evening fever going on?' },
    // TB02 Cough + weight loss + night sweats (idx 42-43)
    // idx 42
    { complaintCode: 'TB02', question: 'कितने किलो वजन घटा और कितने महीनों में?', questionEn: 'How many kilograms of weight lost over how many months?' },
    // idx 43
    { complaintCode: 'TB02', question: 'रात का पसीना कपड़े तक भीग देता है?', questionEn: 'Do night sweats soak your clothes?' },
    // TB03 Hemoptysis streaks (idx 44-45)
    // idx 44
    { complaintCode: 'TB03', question: 'खून की मात्रा कैसी है — बलगम में लकीरें या चम्मच भर?', questionEn: 'How much blood is there — streaks in sputum or a spoonful?' },
    // idx 45
    { complaintCode: 'TB03', question: 'खून ताजा लाल आता है या बलगम में मिला हुआ?', questionEn: 'Is the blood fresh red or mixed into the sputum?' },
    // TB04 Massive hemoptysis (idx 46-47)
    // idx 46
    { complaintCode: 'TB04', question: 'एक बार में कितना खून आया — चम्मच या कप भर?', questionEn: 'How much blood came at once — spoonfuls or a cupful?' },
    // idx 47
    { complaintCode: 'TB04', question: 'अभी भी खून आ रहा है या रुक गया है?', questionEn: 'Is the bleeding still ongoing or has it stopped?' },
    // TB05 TB treatment ongoing (idx 48-49)
    // idx 48
    { complaintCode: 'TB05', question: 'दवा DOTS/सरकारी NTEP केंद्र से चल रही है या कहीं और से?', questionEn: 'Are the medicines from a government NTEP/DOTS centre or from elsewhere?' },
    // idx 49
    { complaintCode: 'TB05', question: 'कोई खुराक छूटी है या दवा नियमित ले रहे हैं?', questionEn: 'Have any doses been missed, or are you taking the medicines regularly?' },
    // TB06 TB treatment completed (idx 50-51)
    // idx 50
    { complaintCode: 'TB06', question: 'इलाज कब पूरा हुआ — कितने महीने/साल पहले?', questionEn: 'When did you complete the treatment — how many months or years ago?' },
    // idx 51
    { complaintCode: 'TB06', question: 'इलाज के बाद से कोई लक्षण वापस आया है?', questionEn: 'Have any symptoms returned after finishing the treatment?' },
    // TB07 TB contact screening (idx 52-53)
    // idx 52
    { complaintCode: 'TB07', question: 'टीबी के मरीज से आपका क्या संबंध है और संपर्क कितना रहा?', questionEn: 'What is your relation to the TB patient and how much was the contact?' },
    // idx 53
    { complaintCode: 'TB07', question: 'वह मरीज इलाज ले रहा है या नहीं?', questionEn: 'Is that patient taking treatment or not?' },
    // TB08 TB drug side-effect (idx 54-55)
    // idx 54
    { complaintCode: 'TB08', question: 'मतली/उल्टी दिन में कितनी बार होती है?', questionEn: 'How many times a day do you get nausea or vomiting?' },
    // idx 55
    { complaintCode: 'TB08', question: 'पेशाब का रंग कैसा है — नारंगी या गहरा चाय जैसा?', questionEn: 'What colour is the urine — orange or dark tea-like?' },
    // INF01 Pneumonia recovered check-up (idx 56-57)
    // idx 56
    { complaintCode: 'INF01', question: 'एंटीबायोटिक का पूरा कोर्स किया था?', questionEn: 'Did you complete the full antibiotic course?' },
    // idx 57
    { complaintCode: 'INF01', question: 'अभी भी खांसी, थकान या बुखार बचा हुआ है?', questionEn: 'Is any cough, tiredness or fever still remaining?' },
    // INF02 Frequent chest infections (idx 58-59)
    // idx 58
    { complaintCode: 'INF02', question: 'पिछले एक साल में कितनी बार छाती का संक्रमण/एंटीबायोटिक चला?', questionEn: 'How many chest infections or antibiotic courses in the last year?' },
    // idx 59
    { complaintCode: 'INF02', question: 'फ्लू का टीका या निमोकोकल वैक्सीन लगवाया है?', questionEn: 'Have you taken the flu or pneumococcal vaccine?' },
    // INF03 Whooping-cough pattern (idx 60-61)
    // idx 60
    { complaintCode: 'INF03', question: 'खांसी के दौरे के बाद सांस खिंचकर हूप जैसी आवाज आती है?', questionEn: 'After coughing bouts, is there a whoop-like gasping sound?' },
    // idx 61
    { complaintCode: 'INF03', question: 'तेज खांसी के दौरों के बाद उल्टी या चेहरा लाल हो जाता है?', questionEn: 'Do severe coughing bouts lead to vomiting or facial redness?' },
    // INF04 Post-COVID persistent symptoms (idx 62-63)
    // idx 62
    { complaintCode: 'INF04', question: 'कोविड कब हुआ था — कितने महीने पहले?', questionEn: 'When did you have COVID — how many months ago?' },
    // idx 63
    { complaintCode: 'INF04', question: 'अब मुख्य दिक्कत क्या है — खांसी या सांस फूलना?', questionEn: 'What is the main problem now — cough or breathlessness?' },
    // INF05 Pleural effusion recovered (idx 64-65)
    // idx 64
    { complaintCode: 'INF05', question: 'इफ्यूजन का कारण पता चला था — टीबी की जांच हुई थी?', questionEn: 'Was the cause of the effusion found — was TB tested?' },
    // idx 65
    { complaintCode: 'INF05', question: 'इलाज कब पूरा हुआ और फॉलो-अप X-ray कराया था?', questionEn: 'When was the treatment completed and was a follow-up X-ray done?' },
    // SMK01 Smoker morning cough (idx 66-67)
    // idx 66
    { complaintCode: 'SMK01', question: 'रोज कितनी बीड़ी/सिगरेट और कितने साल से पीते हैं (पैक-ईयर)?', questionEn: 'How many bidis or cigarettes daily and since how many years (pack-years)?' },
    // idx 67
    { complaintCode: 'SMK01', question: 'सुबह उठते ही खांसी के साथ बलगम निकलता है?', questionEn: 'Do you bring up sputum right on waking in the morning?' },
    // SMK02 COPD follow-up (idx 68-69)
    // idx 68
    { complaintCode: 'SMK02', question: 'अभी कौन सा इनहेलर चल रहा है और नियमित ले रहे हैं?', questionEn: 'Which inhaler are you on now and are you taking it regularly?' },
    // idx 69
    { complaintCode: 'SMK02', question: 'वर्तमान में धूम्रपान/तंबाकू जारी है या छोड़ दिया है?', questionEn: 'Are you still smoking or using tobacco now, or have you quit?' },
    // SMK03 COPD worsening mild (idx 70-71)
    // idx 70
    { complaintCode: 'SMK03', question: 'बलगम का रंग बदलकर पीला/हरा हो गया है?', questionEn: 'Has the sputum colour changed to yellow or green?' },
    // idx 71
    { complaintCode: 'SMK03', question: 'सांस फूलना पहले से कितना बढ़ गया है?', questionEn: 'How much has the breathlessness increased compared to before?' },
    // SMK04 Tobacco cessation (idx 72-73)
    // idx 72
    { complaintCode: 'SMK04', question: 'तंबाकू छोड़ने की कोई तारीख तय की है?', questionEn: 'Have you set a quit date for tobacco?' },
    // idx 73
    { complaintCode: 'SMK04', question: 'पहले कभी छोड़ने की कोशिश की है — क्या हुआ था?', questionEn: 'Have you tried quitting before — what happened then?' },
    // OTH01 OSA flag (idx 74-75)
    // idx 74
    { complaintCode: 'OTH01', question: 'नींद में सांस रुकना या छलकना किसी ने देखा है?', questionEn: 'Has anyone seen you stop breathing or gasp in sleep?' },
    // idx 75
    { complaintCode: 'OTH01', question: 'सुबह सिरदर्द या दिनभर झपकी — गाड़ी चलाते समय नींद आती है?', questionEn: 'Morning headaches or daytime dozing — do you feel sleepy while driving?' },
    // OTH02 Lung fibrosis follow-up (idx 76-77)
    // idx 76
    { complaintCode: 'OTH02', question: 'अभी कौन सी दवा/ऑक्सीजन चल रही है?', questionEn: 'Which medicines or oxygen are you on currently?' },
    // idx 77
    { complaintCode: 'OTH02', question: 'हाल में सांस फूलना बढ़ा है या वजन गिरा है?', questionEn: 'Has breathlessness increased recently or have you lost weight?' },
    // OTH03 Spirometry review (idx 78-79)
    // idx 78
    { complaintCode: 'OTH03', question: 'स्पाइरोमेट्री रिपोर्ट साथ लाए हैं — FEV1/FVC क्या है?', questionEn: 'Have you brought the spirometry report — what is the FEV1/FVC?' },
    // idx 79
    { complaintCode: 'OTH03', question: 'रिपोर्ट में ब्रोंकोडाइलेटर-रिवर्सिबिलिटी जांच भी थी?', questionEn: 'Did the report also include bronchodilator reversibility testing?' },
    // OTH04 CT chest review (idx 80-81)
    // idx 80
    { complaintCode: 'OTH04', question: 'CT रिपोर्ट में मुख्य लिखा क्या है?', questionEn: 'What is the main finding written in the CT report?' },
    // idx 81
    { complaintCode: 'OTH04', question: 'CT किस कारण से कराया था?', questionEn: 'For what reason was the CT done?' },
    // OTH05 Breathing-exercise consult (idx 82-83)
    // idx 82
    { complaintCode: 'OTH05', question: 'सांस की कौन सी बीमारी है — दमा, COPD या अन्य?', questionEn: 'Which breathing condition do you have — asthma, COPD or other?' },
    // idx 83
    { complaintCode: 'OTH05', question: 'रोज कितना टहल पाते हैं?', questionEn: 'How much are you able to walk daily?' },
    // OTH06 Workplace dust/mask consult (idx 84-85)
    // idx 84
    { complaintCode: 'OTH06', question: 'काम पर मास्क/सुरक्षा उपकरण पहनते हैं?', questionEn: 'Do you wear a mask or protective gear at work?' },
    // idx 85
    { complaintCode: 'OTH06', question: 'कितने सालों से यह धूल वाला काम कर रहे हैं?', questionEn: 'Since how many years have you been doing this dusty work?' },
    // OTH07 Chest X-ray review (idx 86-87)
    // idx 86
    { complaintCode: 'OTH07', question: 'X-ray किस कारण से कराया था?', questionEn: 'For what reason was the X-ray done?' },
    // idx 87
    { complaintCode: 'OTH07', question: 'रिपोर्ट में मुख्य लिखा क्या है?', questionEn: 'What is the main finding written in the report?' },
  ],

  // ══ Suggestions (176 — exactly 2 per question; questionIndex matches) ═
  // Patient-printable bilingual advice lines (Hindi primary / English).
  suggestions: [
    // q0 — COU01 cough duration (2-week rule)
    { questionIndex: 0, text: '2 हफ्ते से कम खांसी — आम तौर पर वायरल कारण; भरपूर गुनगुना पानी + भाप लें', textEn: 'Cough under 2 weeks — usually viral; plenty of lukewarm fluids + steam inhalation' },
    { questionIndex: 0, text: '2 हफ्ते या ज्यादा खांसी — नजदीकी सरकारी केंद्र पर मुफ्त बलगम-टीबी जांच अनिवार्य है', textEn: 'Cough of 2 weeks or more — a free sputum TB test at the nearest government centre is a must' },
    // q1 — COU01 dry vs sputum
    { questionIndex: 1, text: 'सूखी खांसी में गला नम रखें — गुनगुना पानी घूंट-घूंट और एक चम्मच शहद निगलें', textEn: 'For dry cough keep the throat moist — sip lukewarm water and swallow a spoon of honey' },
    { questionIndex: 1, text: 'बलगम आ रहा हो तो खांसी दबाने की दवा न लें — बलगम बाहर निकलने दें', textEn: 'If sputum is coming up, do not take cough-suppressing medicines — let it clear out' },
    // q2 — COU02 sputum colour
    { questionIndex: 2, text: 'सफेद/साफ बलगम — एलर्जी या दमा संभव; ट्रिगर से बचें', textEn: 'White or clear sputum — allergy or asthma likely; avoid triggers' },
    { questionIndex: 2, text: 'पीला/हरा/गंदा बलगम — बैक्टीरियल संक्रमण की संभावना; डॉक्टर को दिखाएं', textEn: 'Yellow, green or foul sputum — possible bacterial infection; see the doctor' },
    // q3 — COU02 sputum amount
    { questionIndex: 3, text: 'चम्मच-भर बलगम सामान्य है; रोज कप भर से ज्यादा हो तो जांच कराएं', textEn: 'A spoonful of sputum is normal; if more than a cupful daily, get investigated' },
    { questionIndex: 3, text: 'बहुत ज्यादा और दुर्गंध वाला बलगम — ब्रोंकाइटिसिस जैसी बीमारियों की जांच जरूरी', textEn: 'Copious, foul-smelling sputum — testing for conditions like bronchiectasis is needed' },
    // q4 — COU03 cough >2 weeks TB screen
    { questionIndex: 4, text: 'खांसी 2+ हफ्ते = टीबी स्क्रीनिंग — नजदीकी सरकारी/NTEP केंद्र पर मुफ्त बलगम जांच (NAAT) कराएं', textEn: 'Cough 2+ weeks = TB screening — get the free sputum test (NAAT) at the nearest government/NTEP centre' },
    { questionIndex: 4, text: 'जांच के नतीजे आने से पहले कोई टीबी दवा खुद शुरू न करें', textEn: 'Do not self-start any TB medicine before the test results arrive' },
    // q5 — COU03 TB red flags
    { questionIndex: 5, text: 'शाम का बुखार + रात का पसीना + वजन घटना — टीबी के चेतावनी संकेत; आज ही मुफ्त जांच कराएं', textEn: 'Evening fever + night sweats + weight loss — warning signs of TB; get the free test today' },
    { questionIndex: 5, text: 'जांच तक खांसते समय मुंह ढककर रखें — परिवार को संक्रमण से बचाना जरूरी है', textEn: 'Until tested, cover your mouth while coughing — protecting the family matters' },
    // q6 — COU04 nights waking per week
    { questionIndex: 6, text: 'हफ्ते में 1-2 रात जागना — हल्का पैटर्न; ट्रिगर डायरी बनाएं', textEn: 'Waking 1-2 nights a week — mild pattern; keep a trigger diary' },
    { questionIndex: 6, text: 'हफ्ते में 3+ रात जागना — दमा अनियंत्रित हो सकता है; इलाज बढ़ाने के लिए मिलें', textEn: 'Waking 3+ nights a week — asthma may be uncontrolled; visit to step up treatment' },
    // q7 — COU04 wheeze with night cough
    { questionIndex: 7, text: 'रात की खांसी + घरघराहट — दमा-पैटर्न; इनहेलर तकनीक डॉक्टर से जांचवाएं', textEn: 'Night cough + wheeze — an asthma pattern; get your inhaler technique checked by the doctor' },
    { questionIndex: 7, text: 'रात की खांसी में तकिया ऊंचा रखें और ठंडी हवा से बचें', textEn: 'For night cough keep the pillow raised and avoid cold air' },
    // q8 — COU05 seasonal pattern
    { questionIndex: 8, text: 'अपने मौसम शुरू होने से 2 हफ्ते पहले डॉक्टर से मिलकर दवा शुरू करने की योजना बनाएं', textEn: 'Plan with the doctor to start cover medicines 2 weeks before your season begins' },
    { questionIndex: 8, text: 'पराग के मौसम में खिड़कियां बंद रखें और बाहर चश्मा/मास्क पहनें', textEn: 'In pollen season keep windows shut and wear glasses or a mask outdoors' },
    // q9 — COU05 allergic symptoms
    { questionIndex: 9, text: 'छींक + पानीदार नाक + खांसी — एलर्जिक राइनाइटिस; ट्रिगर सूची बनाएं: धूल, पराग, पालतू', textEn: 'Sneezing + watery nose + cough — allergic rhinitis; make a trigger list: dust, pollen, pets' },
    { questionIndex: 9, text: 'बिस्तर/तकिये के कवर हफ्ते में एक बार गर्म पानी से धोएं — धूल-कण एलर्जी का बड़ा कारण हैं', textEn: 'Wash bedding and pillow covers weekly in hot water — dust mites are a major allergy cause' },
    // q10 — COU06 dust worsening
    { questionIndex: 10, text: 'धूल वाली जगह जाने से पहले N95 मास्क पहनें — नाक और मुंह पूरा ढका रहे', textEn: 'Wear an N95 mask before entering dusty areas — nose and mouth fully covered' },
    { questionIndex: 10, text: 'धूल से तेज सांस की दिक्कत हो तो तुरंत धूल से बाहर आएं और रेस्क्यू इनहेलर लें', textEn: 'If dust triggers strong breathing trouble, leave the dusty area at once and use the rescue inhaler' },
    // q11 — COU06 occupational exposure
    { questionIndex: 11, text: 'खदान/कपास/निर्माण का काम — धूल से होने वाली फेफड़े की बीमारी (प्न्यूमोकोनियोसिस) की निगरानी जरूरी', textEn: 'Mine, cotton or construction work — surveillance for dust-related lung disease (pneumoconiosis) is needed' },
    { questionIndex: 11, text: 'कार्यस्थल की धूल कम करने के लिए नियोजक से वेंटिलेशन/मास्क की बात करें', textEn: 'Ask the employer about ventilation and masks to reduce workplace dust' },
    // q12 — COU07 pleuritic pain
    { questionIndex: 12, text: 'एक तरफ चुभता दर्द जो गहरी सांस पर बढ़े — फेफड़े की परत की जांच (X-ray) जरूरी', textEn: 'One-sided sharp pain worse on deep breathing — a lung/pleura check (X-ray) is needed' },
    { questionIndex: 12, text: 'तेज दर्द + सांस फूलना साथ हो तो तुरंत इमरजेंसी जाएं', textEn: 'Severe pain together with breathlessness — go to the emergency immediately' },
    // q13 — COU07 fever/chills
    { questionIndex: 13, text: 'बुखार के साथ ठंड कांपना — छाती के संक्रमण की जांच कराएं', textEn: 'Fever with rigors — get evaluated for a chest infection' },
    { questionIndex: 13, text: 'बुखार में पैरासिटामोल + भरपूर पानी लें; बुखार का दिन-दर-दिन रिकॉर्ड रखें', textEn: 'For fever take paracetamol + plenty of fluids; record the fever day by day' },
    // q14 — COU08 allergic nose
    { questionIndex: 14, text: 'नाक की एलर्जी + खांसी साथ हैं — दोनों का एक साथ इलाज ही खांसी को कम करेगा', textEn: 'Nose allergy and cough together — treating both together is what reduces the cough' },
    { questionIndex: 14, text: 'सामान्य नमक-पानी (सलाइन) से नाक धोना दिन में 2 बार मदद करता है', textEn: 'Rinsing the nose with plain saline water twice a day helps' },
    // q15 — COU08 triggers
    { questionIndex: 15, text: 'ट्रिगर चेकलिस्ट: धूल, पराग, पालतू जानवर, ठंडी हवा — जो भी बढ़ाए, उससे बचें', textEn: 'Trigger checklist: dust, pollen, pets, cold air — avoid whatever worsens you' },
    { questionIndex: 15, text: 'पालतू जानवर को बेडरूम से बाहर रखें और संपर्क के बाद हाथ-चेहरा धोएं', textEn: 'Keep pets out of the bedroom and wash hands and face after contact' },
    // q16 — COU09 viral resolved when
    { questionIndex: 16, text: 'वायरल के 2-4 हफ्ते बाद टिकी खांसी सामान्य है — धीरे-धीरे ठीक होती है', textEn: 'A cough lingering 2-4 weeks after a viral illness is normal and settles slowly' },
    { questionIndex: 16, text: '8 हफ्ते से ज्यादा टिकी खांसी — पुरानी खांसी की पूरी जांच कराएं', textEn: 'A cough lasting beyond 8 weeks — get a full chronic-cough workup' },
    // q17 — COU09 leftover cough character
    { questionIndex: 17, text: 'सूखी बची खांसी — गुनगुना पानी, शहद और रात की भाप से राहत मिलती है', textEn: 'Dry leftover cough — relief with lukewarm water, honey and night-time steam' },
    { questionIndex: 17, text: 'बलगम बचा है तो बलगम पतला करने वाली दवा डॉक्टर से पूछें, खुद न लें', textEn: 'If sputum persists, ask the doctor about a mucolytic — do not self-medicate' },
    // q18 — COU10 heartburn link
    { questionIndex: 18, text: 'जलन + खांसी साथ हैं — रिफ्लक्स (GERD) पुरानी खांसी का बड़ा छिपा कारण है', textEn: 'Heartburn and cough together — reflux (GERD) is a major hidden cause of chronic cough' },
    { questionIndex: 18, text: 'रात का खाना सोने से 2-3 घंटे पहले खाएं और तकिया ऊंचा रखें', textEn: 'Eat dinner 2-3 hours before lying down and keep the pillow raised' },
    // q19 — COU10 worse lying/after meals
    { questionIndex: 19, text: 'लेटने पर बढ़ना रिफ्लक्स का पक्का संकेत है — रात में भारी/तला खाना कम करें', textEn: 'Worsening on lying down is a definite reflux sign — cut heavy and fried food at night' },
    { questionIndex: 19, text: 'चाय, कॉफी, अचार और ज्यादा मिर्च जलन बढ़ाती हैं — कम करें', textEn: 'Tea, coffee, pickles and excess chilli increase heartburn — reduce them' },
    // q20 — COU11 pollution level
    { questionIndex: 20, text: 'खराब AQI (धुंध) के दिन बाहर का व्यायाम बंद रखें और N95 मास्क पहनें', textEn: 'On bad AQI (smog) days stop outdoor exercise and wear an N95 mask' },
    { questionIndex: 20, text: 'प्रदूषण के दिनों में खिड़कियां बंद रखें और हवा साफ करने वाला फिल्टर/पौधा आजमाएं', textEn: 'On polluted days keep windows closed and try an air filter or purifying plant' },
    // q21 — COU11 biomass exposure
    { questionIndex: 21, text: 'चूल्हे का धुआं भी धूम्रपान जैसा ही नुकसान करता है — खिड़की/रास्ता खोलकर हवादार रसोई में खाना बनाएं', textEn: 'Chulha smoke harms like smoking — cook with the window or chimney open for ventilation' },
    { questionIndex: 21, text: 'घर के अंदर कोई धुआं नहीं — यही स्मोक-फ्री घर बच्चों की खांसी और दमा कम करता है', textEn: 'No smoke inside the home — a smoke-free home itself reduces cough and asthma in children' },
    // q22 — COU12 fever+cough days
    { questionIndex: 22, text: '5 दिन से कम — वायरल ब्रोंकाइटिस संभव; एंटीबायोटिक खुद शुरू न करें', textEn: 'Under 5 days — likely viral bronchitis; do not self-start antibiotics' },
    { questionIndex: 22, text: '5-7 दिन से ज्यादा बुखार-खांसी — पहले जांच (खून/X-ray), उसके बाद ही एंटीबायोटिक सोचें', textEn: 'Fever-cough beyond 5-7 days — get tested (blood/X-ray) before considering any antibiotic' },
    // q23 — COU12 sputum colour
    { questionIndex: 23, text: 'साफ/सफेद बलगम + हल्का बुखार — वायरल; सहारक उपाय + आराम काफी है', textEn: 'Clear or white sputum + mild fever — viral; supportive care + rest is enough' },
    { questionIndex: 23, text: 'पीला/हरा बलगम — बैक्टीरियल हो सकता है; डॉक्टर तय करें, खुद दवा न खाएं', textEn: 'Yellow or green sputum — may be bacterial; let the doctor decide, no self-medication' },
    // q24 — WHE01 childhood asthma history
    { questionIndex: 24, text: 'बचपन का दमा वापस आना आम है — नियमित इनहेलर से ही नियंत्रण मिलेगा', textEn: 'Childhood asthma returning is common — control comes only with regular inhalers' },
    { questionIndex: 24, text: 'बचपन का इतिहास = हवा की नलियों की जन्मजात संवेदनशीलता — ट्रिगर से बचना आजीवन जरूरी', textEn: 'Childhood history = inborn airway sensitivity — lifelong trigger avoidance matters' },
    // q25 — WHE01 wheeze frequency
    { questionIndex: 25, text: 'महीने में 1-2 बार — हल्का; ट्रिगर-डायरी और रेस्क्यू इनहेलर का सही इस्तेमाल सीखें', textEn: 'Once or twice a month — mild; learn the trigger diary and correct rescue-inhaler use' },
    { questionIndex: 25, text: 'हफ्ते में कई बार — रोज की नियंत्रण (कंट्रोलर) दवा जरूरी है', textEn: 'Several times a week — a daily controller medicine is needed' },
    // q26 — WHE02 child age (refer ped)
    { questionIndex: 26, text: 'बच्चों की दवा/खुराक यहां नहीं दी जाती — पेडियाट्रिक (बच्चों के) विशेषज्ञ ही तय करेंगे', textEn: 'Child dosing is not handled here — a paediatric specialist must decide' },
    { questionIndex: 26, text: 'इनहेलर बच्चों और बुजुर्गों में स्पेसर (नली-कैमरा) के साथ सबसे असरदार होता है', textEn: 'Inhalers are most effective with a spacer in children and the elderly' },
    // q27 — WHE02 wheeze with every cold
    { questionIndex: 27, text: 'हर जुकाम में घरघराहट — मल्टी-ट्रिगर व्हीज़; बच्चों के विशेषज्ञ की राय लें', textEn: 'Wheeze with every cold — multi-trigger wheeze; take a paediatric opinion' },
    { questionIndex: 27, text: 'जुकाम से बचाव ही पहली रक्षा है — हाथ धोना और भीड़ से दूर रखना मदद करता है', textEn: 'Preventing colds is the first defence — hand washing and avoiding crowds help' },
    // q28 — WHE03 exertion level
    { questionIndex: 28, text: 'सांस फूले तो बैठकर थोड़ा आगे झुक जाएं (आराम की मुद्रा) और धीमी सांस लें', textEn: 'When breathless, sit leaning slightly forward (the rest position) and breathe slowly' },
    { questionIndex: 28, text: 'घर के काम में ही सांस फूले — गंभीर; जांच (स्पाइरोमेट्री/हृदय) जरूरी', textEn: 'Breathless during routine housework — significant; workup (spirometry/heart) needed' },
    // q29 — WHE03 SpO2 known
    { questionIndex: 29, text: 'SpO2 95%+ सामान्य · 92-94% डॉक्टर को दिखाएं · 90% से कम = तुरंत अस्पताल', textEn: 'SpO2 95%+ normal · 92-94% show the doctor · below 90% = hospital right now' },
    { questionIndex: 29, text: 'पल्स ऑक्सीमीटर घर पर रखें — आराम पर और टहलने के बाद दोनों मान नोट करें', textEn: 'Keep a pulse oximeter at home — record readings both at rest and after walking' },
    // q30 — WHE04 orthopnea
    { questionIndex: 30, text: '2-3 तकिया लगाना या लेटते ही सांस — हृदय की जांच (इको/ECG) कराएं', textEn: 'Needing 2-3 pillows or breathless on lying — get a heart check (echo/ECG)' },
    { questionIndex: 30, text: 'रात में सिर ऊंचा रखकर सोएं और दिन में पैर उठाकर बैठें', textEn: 'Sleep with the head raised and keep the legs elevated during the day' },
    // q31 — WHE04 leg swelling
    { questionIndex: 31, text: 'पैरों की सूजन + लेटने पर सांस — हृदय की कमजोरी हो सकती है; कार्डियोलॉजिस्ट को दिखाएं', textEn: 'Leg swelling + lying breathlessness — possible heart weakness; see a cardiologist' },
    { questionIndex: 31, text: 'नमक कम करें और वजन रोज एक ही तराजू पर नोट करें', textEn: 'Reduce salt and record daily weight on the same scale' },
    // q32 — WHE05 sudden one-sided
    { questionIndex: 32, text: 'अचानक एक तरफ सांस फूलना — न्यूमोथोरैक्स या फेफड़े की नस में क्लॉट हो सकता है — तुरंत इमरजेंसी', textEn: 'Sudden one-sided breathlessness — possible pneumothorax or a lung clot — emergency now' },
    { questionIndex: 32, text: 'इस लक्षण में इंतजार खतरनाक है — सीधे अस्पताल जाएं, खुद गाड़ी न चलाएं', textEn: 'Waiting is dangerous with this symptom — go straight to hospital, do not drive yourself' },
    // q33 — WHE05 stabbing pain same side
    { questionIndex: 33, text: 'तेज चुभता दर्द + सांस फूलना साथ — तुरंत CT/X-ray से जांच कराएं', textEn: 'Sharp stabbing pain + breathlessness together — urgent CT/X-ray evaluation' },
    { questionIndex: 33, text: 'फेफड़े की क्लॉट (PE) की आशंका में चलना नहीं — स्ट्रेचर/एम्बुलेंस से जाएं', textEn: 'If a lung clot (PE) is suspected, do not walk — go by stretcher or ambulance' },
    // q34 — AST01 daytime symptom days
    { questionIndex: 34, text: '4 हफ्तों में 2 दिन से कम — नियंत्रित दमा; वही इलाज जारी रखें', textEn: 'Under 2 days in 4 weeks — controlled asthma; continue the same treatment' },
    { questionIndex: 34, text: '4 हफ्तों में 3+ दिन — आंशिक नियंत्रित; इलाज बढ़ाने के लिए मिलें', textEn: '3+ days in 4 weeks — partly controlled; visit to step up treatment' },
    // q35 — AST01 triggers
    { questionIndex: 35, text: 'ट्रिगर सूची बनाएं: धूल, ठंडी हवा, पालतू, व्यायाम, धुआं — हर बिगड़ने के बाद नोट करें', textEn: 'Make a trigger list: dust, cold air, pets, exercise, smoke — note every flare-up' },
    { questionIndex: 35, text: 'दमा में दर्द की गोली (एस्पिरिन/ब्रुफेन जैसी) कभी खुद न लें — पैरासिटामोल सुरक्षित है', textEn: 'In asthma never self-take pain pills (aspirin/ibuprofen type) — paracetamol is safe' },
    // q36 — AST02 rescue frequency
    { questionIndex: 36, text: 'रेस्क्यू पफ 2/हफ्ते से कम — नियंत्रण ठीक है', textEn: 'Rescue puffs fewer than 2/week — control is good' },
    { questionIndex: 36, text: 'रेस्क्यू पफ 3+ बार/हफ्ते — दमा अनियंत्रित; कंट्रोलर इनहेलर बढ़ाना जरूरी', textEn: 'Rescue puffs 3+ times/week — uncontrolled asthma; the controller inhaler needs a step-up' },
    // q37 — AST02 night wakes
    { questionIndex: 37, text: 'रात में 1-2 बार जागना — आंशिक नियंत्रण; तकनीक और ट्रिगर दोबारा जांचें', textEn: 'Waking 1-2 nights — partly controlled; recheck technique and triggers' },
    { questionIndex: 37, text: 'रोज रात जागना या बोलते-बोलते रुकना/नीले होंठ — तुरंत इमरजेंसी जाएं', textEn: 'Waking nightly, pausing mid-speech or blue lips — go to the emergency now' },
    // q38 — AST03 which inhalers
    { questionIndex: 38, text: 'अपने इनहेलर पहचानें — राहत वाला (रेस्क्यू) बनाम रोज का कंट्रोलर; नाम/रंग याद रखें', textEn: 'Know your inhalers — rescue (reliever) versus daily controller; remember names/colours' },
    { questionIndex: 38, text: 'रोज का कंट्रोलर इनहेलर बिल्कुल रोज — लक्षण न हों तब भी बंद न करें', textEn: 'Take the daily controller inhaler every single day — do not stop even when symptom-free' },
    // q39 — AST03 relief duration + technique
    { questionIndex: 39, text: 'राहत कम टिकती है तो तकनीक जांचें — डॉक्टर के सामने दोहराकर दिखाएं; 4+ घंटे राहत = तकनीक सही', textEn: 'If relief fades quickly, check the technique — demonstrate to the doctor; relief 4+ hours = correct technique' },
    { questionIndex: 39, text: 'तकनीक: 1) 10 सेकंड हिलाएं 2) पूरी सांस बाहर 3) होंठ सील 4) स्प्रे + धीमी गहरी सांस 5) 10 सेकंड रोकें 6) स्टेरॉयड इनहेलर के बाद कुल्ला जरूरी', textEn: 'Technique: 1) Shake 10 s 2) Full exhale 3) Seal lips 4) Spray + slow deep inhale 5) Hold 10 s 6) Rinse mouth after steroid inhalers' },
    // q40 — TB01 fever timing
    { questionIndex: 40, text: 'शाम/रात का बुखार जो सुबह कम हो जाए — टीबी का क्लासिक पैटर्न; मुफ्त जांच कराएं', textEn: 'Evening or night fever settling by morning — classic TB pattern; get the free test' },
    { questionIndex: 40, text: 'बुखार का समय 3 दिन नोट करके डॉक्टर को दिखाएं', textEn: 'Record the fever timing for 3 days and show the doctor' },
    // q41 — TB01 evening fever duration
    { questionIndex: 41, text: '2 हफ्ते+ का शाम का बुखार — टीबी जांच मुफ्त है, देर न करें', textEn: 'Evening fever of 2+ weeks — the TB test is free, do not delay' },
    { questionIndex: 41, text: 'बहुत दिनों का बुखार — खून की जांच (CBC/मलेरिया) भी कराएं', textEn: 'Long-standing fever — also get blood tests (CBC/malaria)' },
    // q42 — TB02 weight loss
    { questionIndex: 42, text: 'बिना कोशिश के 6 महीने में 5%+ वजन घटना — गंभीर कारणों की जांच जरूरी', textEn: 'Losing 5%+ weight in 6 months without trying — workup for serious causes is needed' },
    { questionIndex: 42, text: 'टीबी के बाद वजन लौटता है — प्रोटीन आहार (दाल, दूध, अंडा, पनीर) लेते रहें', textEn: 'Weight recovers after TB — keep a protein-rich diet (dal, milk, egg, paneer)' },
    // q43 — TB02 night sweats
    { questionIndex: 43, text: 'कपड़े भीग देने वाला रात का पसीना — टीबी का महत्वपूर्ण संकेत; आज जांच कराएं', textEn: 'Night sweats soaking the clothes — an important TB sign; get tested today' },
    { questionIndex: 43, text: 'पसीना + बुखार + वजन गिरावट तीनों साथ — आज ही NTEP केंद्र जाएं', textEn: 'Sweats + fever + weight loss all together — go to the NTEP centre today' },
    // q44 — TB03 streaks vs spoon
    { questionIndex: 44, text: 'बलगम में खून की लकीरें — टीबी जांच अनिवार्य; नजदीकी सरकारी केंद्र पर मुफ्त होती है', textEn: 'Blood streaks in sputum — TB testing is mandatory; it is free at the nearest government centre' },
    { questionIndex: 44, text: 'चम्मच भर ताजा खून — तुरंत जांच जरूरी; खुद कोई दवा शुरू न करें', textEn: 'A spoonful of fresh blood — urgent evaluation; do not self-start any medicine' },
    // q45 — TB03 fresh vs mixed
    { questionIndex: 45, text: 'बार-बार ताजा लाल खून — गहरी जांच (CT/ब्रोंकोस्कोपी) की जरूरत है', textEn: 'Repeated fresh red blood — detailed workup (CT/bronchoscopy) is needed' },
    { questionIndex: 45, text: 'बलगम में मिला हल्का खून — फिर भी टीबी जांच जरूरी है', textEn: 'Traces mixed into sputum — TB testing is still needed' },
    // q46 — TB04 amount
    { questionIndex: 46, text: 'एक बार में कप भर खून — आपातकालीन स्थिति; तुरंत अस्पताल पहुंचें', textEn: 'A cupful of blood at once — an emergency; reach the hospital immediately' },
    { questionIndex: 46, text: 'बड़ा खून थूकना — शांत रहें, उसी तरफ लेटें, एम्बुलेंस (108) तुरंत बुलाएं', textEn: 'Major blood-spitting — stay calm, lie on the same side, call an ambulance (108) at once' },
    // q47 — TB04 ongoing bleeding
    { questionIndex: 47, text: 'खून अभी चल रहा है — इमरजेंसी; घर पर इलाज नहीं, तुरंत अस्पताल', textEn: 'Bleeding still ongoing — an emergency; no home treatment, hospital now' },
    { questionIndex: 47, text: 'खून रुक भी गया हो तो जांच फिर भी जरूरी है — कारण पता करना होगा', textEn: 'Even if the bleeding has stopped, evaluation is still needed — the cause must be found' },
    // q48 — TB05 NTEP source
    { questionIndex: 48, text: 'सरकारी NTEP/DOTS केंद्र पर जांच और इलाज दोनों मुफ्त हैं — पंजीकरण वहीं बनाए रखें', textEn: 'Testing and treatment are both free at government NTEP/DOTS centres — stay registered there' },
    { questionIndex: 48, text: 'टीबी का पूरा इलाज सरकारी केंद्र से ही — निजी तौर पर केवल सहायक दवाएं', textEn: 'Full TB treatment from the government centre only — privately, just supportive medicines' },
    // q49 — TB05 missed doses
    { questionIndex: 49, text: 'खुराक छूटना बड़ा नुकसान करता है — दवा रोज एक निश्चित समय पर, एलार्म लगाएं', textEn: 'Missed doses cause real harm — take the dose at a fixed time daily, set an alarm' },
    { questionIndex: 49, text: 'इलाज पूरा करना अनिवार्य है — बेहतर महसूस होने पर भी दवा बंद न करें', textEn: 'Completing the full course is a must — do not stop even when you feel better' },
    // q50 — TB06 when completed
    { questionIndex: 50, text: 'इलाज-पूरा-होने का कार्ड संभालकर रखें — आगे की जांचों में काम आता है', textEn: 'Keep the treatment-completion card safe — it matters for future evaluations' },
    { questionIndex: 50, text: 'पूरा इलाज बीमारी लौटने से बचाता है — लक्षण लौटें तो फिर जांच कराएं', textEn: 'Completing the full course prevents relapse — test again if symptoms return' },
    // q51 — TB06 symptoms returned
    { questionIndex: 51, text: 'इलाज के बाद लक्षण लौटना — दोबारा टीबी या अन्य कारण; तुरंत जांच कराएं', textEn: 'Symptoms returning after treatment — recurrent TB or another cause; test promptly' },
    { questionIndex: 51, text: 'टीबी के बाद भी सालाना फॉलो-अप जांच जारी रखें', textEn: 'Keep annual follow-up checks even after TB' },
    // q52 — TB07 contact relation
    { questionIndex: 52, text: 'घर में टीबी का मरीज = परिवार के सभी सदस्यों की मुफ्त स्क्रीनिंग जरूरी', textEn: 'A TB patient at home = free screening needed for all household members' },
    { questionIndex: 52, text: 'संपर्क की जांच — बच्चों, बुजुर्गों और डायबिटी वालों में सबसे पहले करें', textEn: 'Screen contacts — children, the elderly and diabetics first' },
    // q53 — TB07 patient on treatment?
    { questionIndex: 53, text: 'मरीज इलाज ले रहा है — फिर भी अपनी स्क्रीनिंग जरूर कराएं', textEn: 'The patient is on treatment — still get yourself screened' },
    { questionIndex: 53, text: 'मरीज इलाज नहीं ले रहा — उसे NTEP केंद्र ले जाना सबसे जरूरी कदम है', textEn: 'If the patient is untreated, taking them to the NTEP centre is the most important step' },
    // q54 — TB08 nausea frequency
    { questionIndex: 54, text: 'दवा के तुरंत बाद मतली — थोड़ा खाना खाकर दवा लें', textEn: 'Nausea right after the dose — take the medicine after some food' },
    { questionIndex: 54, text: 'बार-बार उल्टी से खुराक छूट रही है — NTEP केंद्र को आज ही बताएं', textEn: 'Repeated vomiting causing missed doses — inform the NTEP centre today' },
    // q55 — TB08 urine colour
    { questionIndex: 55, text: 'नारंगी पेशाब रिफैम्पिसिन दवा का सामान्य असर है — डरने की बात नहीं', textEn: 'Orange urine is a normal effect of the rifampicin medicine — nothing to fear' },
    { questionIndex: 55, text: 'गहरा चाय जैसा पेशाब + पीली आंखें = जिगर पर असर — दवा रोककर तुरंत NTEP केंद्र जाएं', textEn: 'Dark tea-like urine + yellow eyes = liver effect — stop the drug and go to the NTEP centre now' },
    // q56 — INF01 antibiotic course
    { questionIndex: 56, text: 'पूरा कोर्स किया — बहुत अच्छा; अब रिकवरी डायरी (खांसी/सांस/थकान) रखें', textEn: 'Full course completed — very good; now keep a recovery diary (cough/breath/tiredness)' },
    { questionIndex: 56, text: 'कोर्स अधूरा छूटा — दोबारा संक्रमण का खतरा; डॉक्टर से पूरा करवाएं', textEn: 'Course left incomplete — risk of relapse; get it completed via the doctor' },
    // q57 — INF01 residual symptoms
    { questionIndex: 57, text: 'ठीक होने में 2-4 हफ्ते लगते हैं — हल्की खांसी/थकान सामान्य है', textEn: 'Recovery takes 2-4 weeks — mild cough and tiredness are normal' },
    { questionIndex: 57, text: 'बुखार वापस आए या बलगम गंदा हो जाए — तुरंत दोबारा मिलें', textEn: 'If fever returns or sputum turns foul — revisit promptly' },
    // q58 — INF02 infections last year
    { questionIndex: 58, text: 'साल में 2 से कम संक्रमण — सामान्य; वैक्सीन और हाथ-धुलाई जारी रखें', textEn: 'Fewer than 2 infections a year — normal; continue vaccines and hand hygiene' },
    { questionIndex: 58, text: 'साल में 3+ बार या 2+ एंटीबायोटिक — इम्यून जांच (शुगर/HIV) + स्पाइरोमेट्री सोचें', textEn: '3+ episodes or 2+ antibiotic courses a year — consider immunoscreen (sugar/HIV) + spirometry' },
    // q59 — INF02 vaccine status
    { questionIndex: 59, text: 'हर साल फ्लू का टीका लगवाएं — छाती के संक्रमण कम आएंगे', textEn: 'Take the flu vaccine every year — chest infections become fewer' },
    { questionIndex: 59, text: 'निमोकोकल वैक्सीन वयस्कों में भी उपलब्ध है — डॉक्टर से पूछें', textEn: 'The pneumococcal vaccine is available for adults too — ask the doctor' },
    // q60 — INF03 whoop sound
    { questionIndex: 60, text: 'खांसी के दौरे के बाद हूप जैसी आवाज — काली खांसी (पर्टुसिस) की जांच (NAAT) कराएं', textEn: 'A whoop-like sound after coughing bouts — get pertussis (whooping cough) testing (NAAT)' },
    { questionIndex: 60, text: 'काली खांसी 2-3 महीने टिक सकती है — खांसी ढककर करें ताकि परिवार में न फैले', textEn: 'Whooping cough can last 2-3 months — cover your coughs so it does not spread in the family' },
    // q61 — INF03 post-bout vomiting
    { questionIndex: 61, text: 'दौरों के बाद उल्टी — पर्टुसिस का संकेत; जांच कराएं', textEn: 'Vomiting after bouts — a sign of pertussis; get tested' },
    { questionIndex: 61, text: 'घर में छोटे बच्चे या गर्भवती महिला हो तो जांच और भी जरूरी है', textEn: 'Testing is even more urgent if infants or pregnant women are at home' },
    // q62 — INF04 COVID when
    { questionIndex: 62, text: 'कोविड के बाद खांसी/थकान कुछ महीने टिक सकती है — धीरे-धीरे सुधरती है', textEn: 'Post-COVID cough and tiredness can linger a few months — it improves gradually' },
    { questionIndex: 62, text: '3+ महीने से लक्षण — लंबे कोविड की संरचित जांच कराएं', textEn: 'Symptoms beyond 3 months — get a structured long-COVID evaluation' },
    // q63 — INF04 main problem
    { questionIndex: 63, text: 'खांसी मुख्य है — सहारक उपाय काफी हैं; हवा की दवा की जरूरत नहीं', textEn: 'Cough predominant — supportive care is enough; no airway medicine needed' },
    { questionIndex: 63, text: 'सांस फूलना मुख्य है — स्पाइरोमेट्री + SpO2 की जांच जरूरी', textEn: 'Breathlessness predominant — spirometry + SpO2 workup is needed' },
    // q64 — INF05 effusion cause
    { questionIndex: 64, text: 'टीबी से जुड़ा इफ्यूजन था — पूरा इलाज कराएं और फॉलो-अप X-ray कराते रहें', textEn: 'If the effusion was TB-related — complete the treatment and keep follow-up X-rays' },
    { questionIndex: 64, text: 'कारण अनजान रह गया था — दोबारा मूल्यांकन कराएं', textEn: 'If the cause remained unknown — get re-evaluated' },
    // q65 — INF05 FU xray
    { questionIndex: 65, text: 'इलाज के बाद भी सालाना X-ray फॉलो-अप रखें', textEn: 'Keep an annual X-ray follow-up even after treatment' },
    { questionIndex: 65, text: 'सांस फूलना या बुखार लौटे तो तुरंत जांच कराएं', textEn: 'If breathlessness or fever returns, get tested promptly' },
    // q66 — SMK01 pack-years
    { questionIndex: 66, text: 'पैक-ईयर = रोज के पैक × पीने के साल; 10+ पैक-ईयर = COPD का बड़ा खतरा', textEn: 'Pack-years = daily packs × years smoked; 10+ pack-years = big COPD risk' },
    { questionIndex: 66, text: 'हल्का धूम्रपान भी फेफड़ों को नुकसान देता है — कोई सुरक्षित मात्रा नहीं होती', textEn: 'Even light smoking harms the lungs — there is no safe amount' },
    // q67 — SMK01 morning sputum
    { questionIndex: 67, text: 'सुबह का बलगम हर साल 3 महीने+ — पुरानी ब्रोंकाइटिस की जांच (स्पाइरोमेट्री) कराएं', textEn: 'Morning sputum 3+ months every year — chronic bronchitis workup (spirometry)' },
    { questionIndex: 67, text: 'धुएं भरी बंद जगहों में बलगम बढ़ता है — ऐसी जगहों से बचें', textEn: 'Sputum worsens in closed smoky places — avoid them' },
    // q68 — SMK02 inhaler regular
    { questionIndex: 68, text: 'इनहेलर रोज नियमित — अच्छा नियंत्रण; स्टेरॉयड वाले के बाद कुल्ला जरूरी (मुंह में फंगस से बचाव)', textEn: 'Inhaler taken daily — good control; rinsing after steroid inhalers is a must (prevents oral thrush)' },
    { questionIndex: 68, text: 'इनहेलर छूट रहा है — यह रोज की दवा है, केवल जरूरत पड़ने पर वाली नहीं', textEn: 'Inhaler being missed — it is a daily medicine, not an only-when-needed one' },
    // q69 — SMK02 current smoking status
    { questionIndex: 69, text: 'धूम्रपान COPD को तेज करता है — आज ही छोड़ने की तारीख तय करें', textEn: 'Smoking accelerates COPD — set a quit date today itself' },
    { questionIndex: 69, text: 'छोड़ने में मदद उपलब्ध है — निकोटीन गम + परामर्श से सफलता दोगुनी होती है', textEn: 'Help to quit is available — nicotine gum + counselling doubles success' },
    // q70 — SMK03 sputum colour change
    { questionIndex: 70, text: 'रंग बदलना = संक्रमण का संकेत; एंटीबायोटिक केवल डॉक्टर की सलाह से', textEn: 'Colour change = a sign of infection; antibiotics only on the advice of the doctor' },
    { questionIndex: 70, text: 'पीला/हरा बलगम + बुखार — 48 घंटे में सुधार न हो तो दोबारा मिलें', textEn: 'Yellow or green sputum + fever — revisit if no improvement in 48 hours' },
    // q71 — SMK03 breathlessness increase
    { questionIndex: 71, text: 'हल्का बढ़ना — रेस्क्यू इनहेलर + आराम; बिगड़े तो जांच कराएं', textEn: 'Mild increase — rescue inhaler + rest; get checked if it worsens' },
    { questionIndex: 71, text: 'तुरंत अस्पताल जाएं यदि: होंठ नीले, पूरा वाक्य बोल न पाएं, नींद में उलझन या ऊंघना — ये खतरनाक संकेत हैं', textEn: 'Rush to hospital if: blue lips, unable to speak a full sentence, drowsy or confused — these are danger signs' },
    // q72 — SMK04 quit date
    { questionIndex: 72, text: 'तारीख तय करना सफलता का पहला कदम है — आने वाले 2 हफ्तों में कोई तारीख चुनें', textEn: 'Setting a date is the first step to success — pick one within the next 2 weeks' },
    { questionIndex: 72, text: 'छोड़ने की तारीख से पहले घर से सिगरेट/बीड़ी/पाउच पूरी तरह हटा दें', textEn: 'Remove cigarettes, bidis and pouches completely from home before the quit date' },
    // q73 — SMK04 past attempts
    { questionIndex: 73, text: 'पहले कोशिश विफल रही हो तो यह सामान्य है — दवा-सहायता से सफलता दोगुनी हो जाती है', textEn: 'A failed past attempt is normal — medication support doubles the success rate' },
    { questionIndex: 73, text: 'निकोटीन गम/लोजेंग तीव्र तंबाकू-इच्छा से बचाते हैं — चबाने की सही तकनीक सीखें', textEn: 'Nicotine gum or lozenges blunt intense cravings — learn the correct chew technique' },
    // q74 — OTH01 witnessed apnea
    { questionIndex: 74, text: 'नींद में सांस रुकना/छलकना देखा गया है — स्लीप-स्टडी (पॉलिसोम्नोग्राफी) की जांच जरूरी', textEn: 'Witnessed stops or gasping in sleep — a sleep study (polysomnography) is needed' },
    { questionIndex: 74, text: 'गाड़ी चलाते समय नींद आती हो तो जांच होने तक लंबी ड्राइव बंद रखें', textEn: 'If sleepy while driving, stop long drives until the testing is done' },
    // q75 — OTH01 day sleepiness
    { questionIndex: 75, text: 'सुबह का सिरदर्द + दिनभर झपकी — OSA के मुख्य संकेत; वजन घटाना पहला उपाय है', textEn: 'Morning headache + daytime dozing — cardinal OSA signs; weight loss is step one' },
    { questionIndex: 75, text: 'नींद जगाने वाली दवा जोखिम भरी है — इलाज स्लीप-स्टडी के नतीजे से ही तय होगा', textEn: 'Wake-promoting medicines are risky — treatment follows the sleep-study results' },
    // q76 — OTH02 current meds/oxygen
    { questionIndex: 76, text: 'ऑक्सीजन चल रहा हो तो आग-माचिस/धूम्रपान से दूरी अनिवार्य — आग लगने का खतरा रहता है', textEn: 'If on oxygen, keep fire, matches and smoking strictly away — there is a fire hazard' },
    { questionIndex: 76, text: 'दवाओं की सूची हर विजिट पर साथ लाएं और अपडेट कराते रहें', textEn: 'Bring your medicine list to every visit and keep it updated' },
    // q77 — OTH02 worsening/weight loss
    { questionIndex: 77, text: 'तेजी से बिगड़ना — फाइब्रोसिस बढ़ रही हो सकती है; ILD विशेषज्ञ को दिखाएं', textEn: 'Rapid worsening — the fibrosis may be progressing; see an ILD specialist' },
    { questionIndex: 77, text: 'वजन गिरना + सांस बढ़ना — पुनर्मूल्यांकन (CT/6-मिनट वॉक) जरूरी', textEn: 'Weight loss + rising breathlessness — re-evaluation (CT/6-minute walk) needed' },
    // q78 — OTH03 FEV1/FVC
    { questionIndex: 78, text: 'FEV1/FVC 0.7 से कम — COPD-पैटर्न; गंभीरता FEV1 के % से पता चलती है', textEn: 'FEV1/FVC below 0.7 — a COPD pattern; severity shows from the FEV1 percent' },
    { questionIndex: 78, text: 'रिपोर्ट की कॉपी अपनी फाइल में रखें — अगली तुलना के लिए हर बार लाते रहें', textEn: 'File a copy of the report — keep bringing it for future comparison' },
    // q79 — OTH03 reversibility
    { questionIndex: 79, text: 'ब्रोंकोडाइलेटर के बाद 12%+ और 200 ml सुधार — दमा की पुष्टि होती है', textEn: '12%+ and 200 ml improvement after bronchodilator — confirms asthma' },
    { questionIndex: 79, text: 'रिवर्सिबिलिटी जांच नहीं हुई — अगली स्पाइरोमेट्री में जरूर कराएं', textEn: 'If reversibility was not tested — get it done with the next spirometry' },
    // q80 — OTH04 CT main finding
    { questionIndex: 80, text: 'CT में धब्बा/गांठ — आगे की जांच (PET-CT/बायोप्सी) विशेषज्ञ की देखरेख में ही कराएं', textEn: 'A spot or nodule on CT — further tests (PET-CT/biopsy) only under specialist supervision' },
    { questionIndex: 80, text: 'फाइब्रोसिस/ग्राउंड-ग्लास दिखे — ILD क्लिनिक में दिखाएं', textEn: 'Fibrosis or ground-glass findings — show at an ILD clinic' },
    // q81 — OTH04 why CT done
    { questionIndex: 81, text: 'CT का कारण बताना जरूरी है — टीबी, निमोनिया और गांठ के फॉलो-अप के रास्ते अलग हैं', textEn: 'The reason for the CT matters — TB, pneumonia and nodule follow-up paths differ' },
    { questionIndex: 81, text: 'पुरानी रिपोर्टें संभालकर रखें — तुलना से ही प्रगति पता चलती है', textEn: 'Keep old reports safe — comparison alone shows progress' },
    // q82 — OTH05 which condition
    { questionIndex: 82, text: 'दमा — रोज का कंट्रोलर + तकनीक + ट्रिगर-नियंत्रण ही आधार है', textEn: 'Asthma — daily controller + technique + trigger control is the foundation' },
    { questionIndex: 82, text: 'पर्स्ड-लिप श्वास: नाक से 2 सेकंड अंदर, होंठ बजाते हुए 4 सेकंड बाहर — दिन में कई बार', textEn: 'Pursed-lip breathing: in 2 seconds through the nose, out 4 seconds through pursed lips — several times a day' },
    // q83 — OTH05 walking amount
    { questionIndex: 83, text: 'डायाफ्राग्मेटिक श्वास: हाथ पेट पर, पेट फुलाकर नाक से अंदर, धीरे बाहर — दिन में 2 बार 5 मिनट', textEn: 'Diaphragmatic breathing: hand on belly, belly rises on nasal inhale, slow exhale — 5 minutes twice daily' },
    { questionIndex: 83, text: 'रोज 20-30 मिनट टहलना + दोनों श्वास-व्यायाम = पल्मोनरी रिहैब की नींव', textEn: 'Daily 20-30 minute walks + both breathing exercises = the foundation of pulmonary rehab' },
    // q84 — OTH06 mask at work
    { questionIndex: 84, text: 'मास्क सही तरीके से पहनें — नाक और मुंह पूरा ढका रहे, चेहरे से सील हो', textEn: 'Wear the mask the right way — nose and mouth fully covered, sealed to the face' },
    { questionIndex: 84, text: 'धूल के खिलाफ N95 सबसे असरदार है — कपड़े का मास्क धूल रोकने में काम का नहीं', textEn: 'N95 is the most effective against dust — a cloth mask is of little use' },
    // q85 — OTH06 years of work
    { questionIndex: 85, text: '10+ साल का धूल वाला काम — स्लाइकोसिस/व्यावसायिक फेफड़ा रोग की जांच जरूरी', textEn: '10+ years of dusty work — testing for silicosis or occupational lung disease is needed' },
    { questionIndex: 85, text: 'संभव हो तो काम/विभाग बदलने के बारे में नियोजक से बात करें', textEn: 'If possible, discuss a role or department change with the employer' },
    // q86 — OTH07 why X-ray
    { questionIndex: 86, text: 'X-ray का कारण डॉक्टर को जरूर बताएं — स्क्रीनिंग और लक्षण-जांच का अर्थ अलग होता है', textEn: 'Tell the doctor why the X-ray was done — screening versus symptom workup differ' },
    { questionIndex: 86, text: 'टीबी जांच के लिए हुआ था तो बलगम की रिपोर्ट भी साथ लाएं', textEn: 'If it was for a TB workup, also bring the sputum report' },
    // q87 — OTH07 X-ray finding
    { questionIndex: 87, text: 'रिपोर्ट में दाग/स्कार लिखा हो — पुराना चिह्न हो सकता है; तुलना के लिए पुरानी फिल्म लाएं', textEn: 'A scar or patch on the report — may be an old mark; bring old films for comparison' },
    { questionIndex: 87, text: 'रिपोर्ट में नई छाया या पानी दिखे — और जांच जरूरी है', textEn: 'A new shadow or fluid on the report — further workup is needed' },
  ],

  // ══ Labels — respiratory vitals/trackers (12) ══════════════════════════
  labels: [
    { label: 'SpO2 (पल्स ऑक्सीमीटर)', labelEn: 'SpO2 (Pulse Oximeter)', unit: '%' },
    { label: 'श्वसन दर', labelEn: 'Respiratory Rate', unit: '/min' },
    { label: 'पीक एक्सपायरेटरी फ्लो (PEFR)', labelEn: 'Peak Expiratory Flow (PEFR)', unit: 'L/min' },
    { label: 'खांसी स्कोर (0-10)', labelEn: 'Cough Score (0-10)', unit: '/10' },
    { label: 'बलगम मात्रा/दिन', labelEn: 'Sputum Volume/day', unit: 'ml' },
    { label: 'बुखार पैटर्न', labelEn: 'Fever Pattern', unit: '', showUnit: false },
    { label: 'पैक-ईयर धूम्रपान', labelEn: 'Pack-Years Smoked', unit: 'pack-yr' },
    { label: 'रेस्क्यू इनहेलर पफ/हफ्ता', labelEn: 'Rescue Inhaler Puffs/week', unit: '/week' },
    { label: 'रात में जागना/हफ्ता', labelEn: 'Night Awakenings/week', unit: '/week' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'दर्द स्कोर (0-10)', labelEn: 'Pain Score (0-10)', unit: '/10' },
  ],

  // ══ Findings (36) ═════════════════════════════════════════════════════
  // REFER-ONLY block (bottom) carries ZERO findingMeds links — validator
  // checked. TB-Screen also intentionally carries zero links (no treatment
  // before diagnosis).
  findings: [
    // Managed / follow-up findings (links in findingMeds below)
    { key: 'ACUTE-COUGH', name: 'तीव्र खांसी', nameEn: 'Acute Cough', icd10: 'R05' },
    { key: 'CHRONIC-COUGH', name: 'पुरानी खांसी (2+ हफ्ते)', nameEn: 'Chronic Cough (2+ Weeks)', icd10: 'R05.3' },
    { key: 'ASTHMA-FU', name: 'दमा — नियंत्रित (फॉलो-अप)', nameEn: 'Asthma — Controlled (Follow-up)', icd10: 'J45' },
    { key: 'ASTHMA-PARTLY-CONTROLLED', name: 'दमा — आंशिक नियंत्रित', nameEn: 'Asthma — Partly Controlled', icd10: 'J45' },
    { key: 'SEASONAL-ALLERGIC-ASTHMA', name: 'मौसमी एलर्जिक दमा', nameEn: 'Seasonal Allergic Asthma', icd10: 'J45.0' },
    { key: 'COPD-FU-MILD', name: 'COPD — हल्का स्थिर (फॉलो-अप)', nameEn: 'COPD — Mild Stable (Follow-up)', icd10: 'J44' },
    { key: 'CHRONIC-BRONCHITIS-SMOKER', name: 'धूम्रपान वाली पुरानी ब्रोंकाइटिस', nameEn: 'Chronic Bronchitis (Smoker)', icd10: 'J42' },
    { key: 'ACUTE-BRONCHITIS', name: 'तीव्र ब्रोंकाइटिस', nameEn: 'Acute Bronchitis', icd10: 'J20' },
    { key: 'PNEUMONIA-RECOVERED-FU', name: 'निमोनिया ठीक (फॉलो-अप)', nameEn: 'Pneumonia Recovered (Follow-up)', icd10: 'J18' },
    { key: 'ALLERGIC-RHINITIS-LINKED', name: 'एलर्जिक नासिका + खांसी', nameEn: 'Allergic Rhinitis with Cough', icd10: 'J30' },
    { key: 'DYSPNEA-NOS', name: 'सांस फूलना (कारण अनिर्दिष्ट)', nameEn: 'Breathlessness (Unspecified)', icd10: 'R06' },
    { key: 'TB-ONGOING-SUPPORT', name: 'टीबी इलाज चालू (NTEP सहायता)', nameEn: 'TB Treatment Ongoing (NTEP Support)', icd10: 'A19.9' },
    { key: 'TB-SEQUELAE-FU', name: 'टीबी के बाद फॉलो-अप', nameEn: 'Post-TB Sequelae Follow-up', icd10: 'B90' },
    { key: 'FIBROSIS-FU', name: 'फेफड़ा फाइब्रोसिस (नियंत्रित फॉलो-अप)', nameEn: 'Lung Fibrosis Follow-up (Continuation)', icd10: 'J84.9' },
    { key: 'PLEURAL-EFFUSION-RECOVERED-FU', name: 'प्लूरल इफ्यूजन ठीक (फॉलो-अप)', nameEn: 'Pleural Effusion Recovered (Follow-up)', icd10: 'J90' },
    { key: 'POST-VIRAL-COUGH', name: 'वायरल के बाद टिकी खांसी', nameEn: 'Post-Viral Cough', icd10: 'J12.9' },
    { key: 'GERD-COUGH', name: 'रिफ्लक्स से जुड़ी खांसी', nameEn: 'GERD-Linked Cough', icd10: 'K21.9' },
    { key: 'TOBACCO-CESSATION-COUNSELLING', name: 'तंबाकू छुड़ाव परामर्श', nameEn: 'Tobacco Cessation Counselling', icd10: 'Z71.6' },
    { key: 'AIR-POLLUTION-COUNSELLING', name: 'वायु-प्रदूषण संपर्क परामर्श', nameEn: 'Air Pollution Exposure Counselling', icd10: 'Z58.1' },
    { key: 'TB-SCREEN', name: 'टीबी स्क्रीनिंग (लक्षण/संपर्क)', nameEn: 'TB Screening (Symptom/Contact)', icd10: 'Z11.4' },
    // REFER-ONLY findings — ZERO findingMeds links (see safety frame above)
    { key: 'ACTIVE-TB-SUSPECT', name: 'संभावित सक्रिय टीबी (NTEP रेफर)', nameEn: 'Active TB Suspect (NTEP Referral)', icd10: 'A15.9' },
    { key: 'HEMOPTYSIS-MASSIVE', name: 'भारी खून थूकना (आपातकाल)', nameEn: 'Massive Hemoptysis (Emergency)', icd10: 'R04.2' },
    { key: 'PNEUMOTHORAX-SUSPECT', name: 'संभावित न्यूमोथोरैक्स (आपातकाल)', nameEn: 'Pneumothorax Suspect (Emergency)', icd10: 'J93.9' },
    { key: 'PE-SUSPECT', name: 'संभावित फुफ्फुसीय एम्बोलिज्म (आपातकाल)', nameEn: 'Pulmonary Embolism Suspect (Emergency)', icd10: 'I26.9' },
    { key: 'SEVERE-ASTHMA-ATTACK', name: 'दमे का तीव्र दौरा (आपातकाल)', nameEn: 'Severe Asthma Attack (Emergency)', icd10: 'J46' },
    { key: 'COPD-EXACERBATION-SEVERE', name: 'COPD तीव्र बिगड़ना (भर्ती)', nameEn: 'COPD Exacerbation — Severe (Admission)', icd10: 'J44.1' },
    { key: 'LUNG-CA-SUSPECT', name: 'संभावित फेफड़े का कैंसर (जांच)', nameEn: 'Lung Cancer Suspect (Workup)', icd10: 'C34.90' },
    { key: 'OSA-SEVERE', name: 'गंभीर निद्रा-श्वास रोध (स्लीप-स्टडी रेफर)', nameEn: 'Severe OSA (Sleep Study Referral)', icd10: 'G47.33' },
    { key: 'TB-DRUG-HEPATOTOXICITY-SUSPECT', name: 'टीबी दवा से जिगर पर संदिग्ध असर (NTEP संपर्क)', nameEn: 'TB Drug Hepatotoxicity Suspect (Contact NTEP)', icd10: 'K71.9' },
    { key: 'PLEURAL-EFFUSION-ACTIVE', name: 'सक्रिय प्लूरल इफ्यूजन (जांच)', nameEn: 'Pleural Effusion — Active (Workup)', icd10: 'J90' },
    { key: 'FIBROSIS-PROGRESSIVE', name: 'प्रगतिशील फाइब्रोसिस (विशेषज्ञ रेफर)', nameEn: 'Progressive Fibrosis (Specialist Referral)', icd10: 'J84.1' },
    { key: 'IMMUNOCOMPROMISED-COUGH', name: 'कमजोर रोग-प्रतिरोधक क्षमता में खांसी (तत्काल)', nameEn: 'Immunocompromised with Cough (Urgent)', icd10: 'D84.9' },
    { key: 'BRONCHIECTASIS-SUSPECT', name: 'संभावित ब्रोंकाइटिसिस (रेफर)', nameEn: 'Bronchiectasis Suspect (Refer)', icd10: 'J47.9' },
    { key: 'PERTUSSIS-SUSPECT', name: 'संभावित काली खांसी (जांच)', nameEn: 'Pertussis Suspect (Testing)', icd10: 'A37.9' },
    { key: 'OCCUPATIONAL-LUNG-SUSPECT', name: 'संभावित व्यावसायिक फेफड़ा रोग (रेफर)', nameEn: 'Occupational Lung Disease Suspect (Refer)', icd10: 'J66.9' },
    { key: 'PLEURITIC-PAIN-SUSPECT', name: 'प्लूरिटिक सीने का दर्द (रेफर)', nameEn: 'Pleuritic Chest Pain Suspect (Refer)', icd10: 'R07.1' },
  ],

  // ══ Medicines (52) — India pulmonology core ═══════════════════════════
  // NOTE: NO anti-TB drugs (NTEP territory — B6/nutrition support only),
  // NO oral corticosteroids, NO codeine/dextromethorphan antitussives.
  // morning/afternoon/evening = default units at that slot; tab = ~dispense.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Reliever inhalers / nebulization
    { name: 'Asthalin HFA 100 Inhaler', salt: 'Salbutamol 100 mcg/puff (rescue reliever) — shake before use; tremor or palpitations → report; a spacer improves delivery in the elderly', doseOptions: ['2 puffs SOS', '1 puff SOS'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Asthalin Rotacap 200', salt: 'Salbutamol 200 mcg rotacap — needs a Rotahaler device; rescue use only; do not exceed the prescribed count', doseOptions: ['1 rotacap SOS', '1 rotacap TDS SOS'], morning: 0, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duolin HFA Inhaler', salt: 'Levosalbutamol 100 mcg + Ipratropium 20 mcg per puff — rescue combination; dry mouth common; palpitations → report', doseOptions: ['2 puffs SOS'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duolin Respules 2.5ml', salt: 'Levosalbutamol 1.25 mg + Ipratropium 500 mcg per respule — nebulization only; single-use, discard leftover; wash the mask after use', doseOptions: ['1 respule (2.5 ml) nebulized SOS', '1 respule TDS (acute phase)'], morning: 0, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Levolin 1.25mg Respules', salt: 'Levosalbutamol 1.25 mg/2 ml respule — nebulize SOS; tremor or palpitations → report; this is not a controller', doseOptions: ['1 respule nebulized SOS'], morning: 0, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    // Controller inhalers (ICS/LABA) — rinse-mouth notes throughout
    { name: 'Foracort 100 Rotacap', salt: 'Budesonide 100 mcg + Formoterol 6 mcg rotacap — daily controller via Rotahaler; ALWAYS rinse the mouth after (oral candidiasis prevention)', doseOptions: ['1 rotacap BD'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Foracort 200 Rotacap', salt: 'Budesonide 200 mcg + Formoterol 6 mcg rotacap — daily controller via Rotahaler; rinse the mouth after every use', doseOptions: ['1 rotacap BD'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Foracort 400 Rotacap', salt: 'Budesonide 400 mcg + Formoterol 6 mcg rotacap — step-up controller; rinsing the mouth is mandatory (higher thrush risk)', doseOptions: ['1 rotacap BD'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Foracort 200 Inhaler', salt: 'Budesonide 200 mcg + Formoterol 6 mcg per puff — controller inhaler; rinse the mouth after use; spacer option for the elderly', doseOptions: ['2 puffs BD', '1 puff BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Seroflo 125 Inhaler', salt: 'Salmeterol 25 mcg + Fluticasone propionate 125 mcg per puff — controller; rinse the mouth after; NOT for acute relief', doseOptions: ['2 puffs BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Seroflo 250 Inhaler', salt: 'Salmeterol 25 mcg + Fluticasone propionate 250 mcg per puff — controller; rinse the mouth after; NOT for acute relief', doseOptions: ['2 puffs BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Seroflo 250 Rotacap', salt: 'Salmeterol 50 mcg + Fluticasone propionate 250 mcg rotacap — controller via Rotahaler; rinse the mouth after', doseOptions: ['1 rotacap BD'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Budecort 100 Inhaler', salt: 'Budesonide 100 mcg/puff steroid controller — rinse the mouth after EVERY use; do not stop abruptly during an infection — call the doctor', doseOptions: ['2 puffs BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Budecort 200 Inhaler', salt: 'Budesonide 200 mcg/puff steroid controller — rinse the mouth after EVERY use; do not stop abruptly', doseOptions: ['1-2 puffs BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Budecort 0.5mg Respules', salt: 'Budesonide 0.5 mg/2 ml respule — nebulization; rinse the mouth after; single-use respule', doseOptions: ['1 respule BD nebulized', '1 respule OD nebulized'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Budecort 1mg Respules', salt: 'Budesonide 1 mg/2 ml respule — nebulization; rinse the mouth after; higher strength — doctor-directed only', doseOptions: ['1 respule BD nebulized'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tiova Rotacap 18 mcg', salt: 'Tiotropium 18 mcg once-daily COPD controller — via Rotahaler; dry mouth common; eye pain or urinary retention → stop and report', doseOptions: ['1 rotacap OD'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Oral anti-allergic / leukotriene / xanthine
    { name: 'Montair LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg — FDA boxed warning: mood or sleep changes, agitation, vivid dreams, depression → STOP and report', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Montek LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg — FDA boxed warning: neuropsychiatric events (sleep/mood) → stop and report', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Montair 10 Tablet', salt: 'Montelukast 10 mg — FDA boxed warning: neuropsychiatric events → stop and report; evening dosing preferred', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Allegra 120 Tablet', salt: 'Fexofenadine 120 mg — non-sedating antihistamine; fruit juices reduce absorption — take with plain water', doseOptions: ['1 tab OD'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Allegra 180 Tablet', salt: 'Fexofenadine 180 mg — non-sedating; avoid fruit juices around dosing', doseOptions: ['1 tab OD'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Levocet 5 Tablet', salt: 'Levocetirizine 5 mg — mild drowsiness possible; avoid driving if sleepy', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg — drowsiness caution; avoid alcohol', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg — mild drowsiness; evening dose preferred', doseOptions: ['1 tab HS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Deriphyllin Retard 150 Tablet', salt: 'Etophylline 77 mg + Theophylline 123 mg SR — CARDIAC CAUTION: palpitations or arrhythmia → stop and report; interacts with many antibiotics — always disclose all medicines', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Deriphyllin Retard 300 Tablet', salt: 'Etophylline 154 mg + Theophylline 246 mg SR — CARDIAC CAUTION: arrhythmia or palpitations → stop; drug interactions are common', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxobid 200 Tablet', salt: 'Doxofylline 200 mg — xanthine bronchodilator with a lower cardiac risk than theophylline; palpitations → report', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxobid 400 Tablet', salt: 'Doxofylline 400 mg — palpitations or arrhythmia caution; take after food', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Antibiotics — bacterial exacerbation ONLY (stewardship)
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic acid 125 mg — ONLY for bacterial bronchitis or exacerbation (purulent sputum); complete the full course; rash or diarrhoea → report', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Moxikind-CV 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic acid 125 mg — bacterial exacerbation only; the full course is mandatory', doseOptions: ['1 tab BD'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azee 500 Tablet', salt: 'Azithromycin 500 mg — fixed short course only; palpitations are rare → report; NOT for every cough', doseOptions: ['1 tab OD'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Mucolytics (NO antitussive combinations in this pack)
    { name: 'Ascoril LS Syrup 100ml', salt: 'Levosalbutamol 1 mg + Ambroxol 30 mg + Guaifenesin 100 mg per 5 ml — fixed-combination CAUTION: add no other cough syrup on top; tremor or palpitations → report', doseOptions: ['10 ml TDS', '10 ml BD'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ambrodil Syrup 100ml', salt: 'Ambroxol 30 mg/5 ml — mucolytic; take with plenty of water', doseOptions: ['10 ml BD', '10 ml TDS'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Mucolite Syrup 100ml', salt: 'Ambroxol 30 mg/5 ml — mucolytic (alternative brand); hydrate well', doseOptions: ['10 ml BD', '10 ml TDS'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Nasal
    { name: 'Otrivin Nasal Spray', salt: 'Xylometazoline 0.1% — decongestant spray: MAXIMUM 5-7 days (rebound congestion beyond that); do not exceed 1 spray per nostril per dose', doseOptions: ['1 spray each nostril BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nasoclear Saline Nasal Spray', salt: 'Isotonic saline — safe for daily use; washes out dust and allergens; no rebound risk', doseOptions: ['2 sprays each nostril BD'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Flomist Nasal Spray', salt: 'Fluticasone propionate 50 mcg per spray — intranasal steroid for allergic rhinitis; REGULAR daily use gives the effect; gentle sniff only; rinse the nose/mouth after', doseOptions: ['2 sprays each nostril OD'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // GERD-cough coordination
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — before breakfast; GERD-cough PPI trial 4-8 weeks; coordinate full reflux care with the GP', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // TB SUPPORT-ONLY (NTEP alignment — ZERO anti-TB drugs in this pack)
    { name: 'Benadon 40 Tablet', salt: 'Pyridoxine (Vitamin B6) 40 mg — NTEP co-prescription CONTINUATION to prevent anti-TB drug neuropathy; core ATT comes from the NTEP centre only', doseOptions: ['1 tab BD', '1 tab OD'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium carbonate 500 mg + Vitamin D3 250 IU — bone and recovery support (long-term steroid-inhaler users, post-TB recovery)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'B-Long F Tablet', salt: 'Pyridoxine 40 mg SR + Folic acid 5 mg — NTEP nutritional support; this is NOT a TB drug', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Smoking cessation
    { name: 'Nicotex 2mg Gum', salt: 'Nicotine polacrilex 2 mg chewing gum — chew-park-chew technique; no eating or drinking 15 min around use; max 8-12 gums/day; keep away from children', doseOptions: ['1 gum when craving'], morning: 0, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nicotex 4mg Gum', salt: 'Nicotine polacrilex 4 mg — for smokers whose first cigarette is within 30 minutes of waking; chew-park-chew; max 8-12/day', doseOptions: ['1 gum when craving'], morning: 0, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Bupron SR 150 Tablet', salt: 'Bupropion 150 mg SR — cessation aid STARTED UNDER PSYCHIATRY COORDINATION; stop and report seizure, rash or worsening mood immediately', doseOptions: ['1 tab OD morning'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // OTC / recovery support
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose; dissolve 1 sachet in 1 L water', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg — SOS; max 4 doses/24 hrs; the SAFE analgesic in asthma (avoid aspirin/ibuprofen)', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — SOS; max 4 doses/24 hrs', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C — recovery nutrition support', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + multimineral + zinc — recovery support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — weekly × 8, then monthly; take with milk', doseOptions: ['1 sachet weekly'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Gargle 100ml', salt: 'Povidone-iodine 2% gargle — 10 ml in half a glass of warm water; do NOT swallow', doseOptions: ['10 ml in warm water gargle'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (49) ═════════════════════════════════════
  // MANAGED findings only — every REFER-ONLY finding above carries ZERO links.
  findingMeds: [
    // ACUTE-COUGH — SOS-analgesic + mucolytic + soothing
    { findingKey: 'ACUTE-COUGH', medicineName: 'Crocin 500 Tablet', description: 'SOS fever/body-ache; max 4 doses/24 hrs' },
    { findingKey: 'ACUTE-COUGH', medicineName: 'Ambrodil Syrup 100ml', description: 'If sputum thick — hydrate well alongside' },
    { findingKey: 'ACUTE-COUGH', medicineName: 'Betadine Gargle 100ml', description: 'Throat-irritation cough; do not swallow' },
    // CHRONIC-COUGH — screen-first framing (TB/rhinitis/GERD), then support
    { findingKey: 'CHRONIC-COUGH', medicineName: 'Montair LC Tablet', description: 'Allergic-component trial 2-4 weeks' },
    { findingKey: 'CHRONIC-COUGH', medicineName: 'Pantop 40 Tablet', description: 'GERD-cough PPI trial 4-8 weeks before breakfast' },
    { findingKey: 'CHRONIC-COUGH', medicineName: 'Ambrodil Syrup 100ml', description: 'Sputum-clearance support' },
    // ASTHMA-FU (controlled) — maintenance + rescue
    { findingKey: 'ASTHMA-FU', medicineName: 'Foracort 200 Inhaler', description: '1-2 puffs BD; rinse mouth after every use' },
    { findingKey: 'ASTHMA-FU', medicineName: 'Asthalin HFA 100 Inhaler', description: 'Rescue 2 puffs SOS; call clinic if needed >2×/week' },
    { findingKey: 'ASTHMA-FU', medicineName: 'Seroflo 250 Inhaler', description: 'Alternative maintenance (salmeterol+fluticasone)' },
    { findingKey: 'ASTHMA-FU', medicineName: 'Montair 10 Tablet', description: 'Add-on if triggers strong; rinse mouth note applies to inhalers only' },
    // ASTHMA-PARTLY-CONTROLLED — step-up + rescue
    { findingKey: 'ASTHMA-PARTLY-CONTROLLED', medicineName: 'Foracort 400 Rotacap', description: 'Step-up 1 cap BD via rotahaler; rinse mouth after use' },
    { findingKey: 'ASTHMA-PARTLY-CONTROLLED', medicineName: 'Seroflo 250 Rotacap', description: 'Alternative step-up maintenance' },
    { findingKey: 'ASTHMA-PARTLY-CONTROLLED', medicineName: 'Asthalin Rotacap 200', description: 'Rescue SOS via rotahaler' },
    { findingKey: 'ASTHMA-PARTLY-CONTROLLED', medicineName: 'Montair LC Tablet', description: 'Night-symptom add-on; report mood/sleep changes' },
    // SEASONAL-ALLERGIC-ASTHMA
    { findingKey: 'SEASONAL-ALLERGIC-ASTHMA', medicineName: 'Seroflo 125 Inhaler', description: 'Season maintenance BD; rinse mouth' },
    { findingKey: 'SEASONAL-ALLERGIC-ASTHMA', medicineName: 'Montair LC Tablet', description: 'Season course; FDA neuropsychiatric note in salt' },
    { findingKey: 'SEASONAL-ALLERGIC-ASTHMA', medicineName: 'Allegra 120 Tablet', description: 'Daytime antihistamine (non-sedating)' },
    // COPD-FU-MILD — LAMA + LABA/ICS + xanthine + cessation
    { findingKey: 'COPD-FU-MILD', medicineName: 'Tiova Rotacap 18 mcg', description: 'Once-daily LAMA via rotahaler' },
    { findingKey: 'COPD-FU-MILD', medicineName: 'Foracort 400 Rotacap', description: 'Maintenance BD; rinse mouth after use' },
    { findingKey: 'COPD-FU-MILD', medicineName: 'Duolin HFA Inhaler', description: 'SOS combination rescue' },
    { findingKey: 'COPD-FU-MILD', medicineName: 'Doxobid 200 Tablet', description: 'Oral bronchodilator support; caution in cardiac disease' },
    // CHRONIC-BRONCHITIS-SMOKER — clearance + cessation
    { findingKey: 'CHRONIC-BRONCHITIS-SMOKER', medicineName: 'Ascoril LS Syrup 100ml', description: '10 ml TDS; do not add another cough syrup on top' },
    { findingKey: 'CHRONIC-BRONCHITIS-SMOKER', medicineName: 'Ambrodil Syrup 100ml', description: 'Alternative mucolytic with plenty of water' },
    { findingKey: 'CHRONIC-BRONCHITIS-SMOKER', medicineName: 'Nicotex 2mg Gum', description: 'Cessation support — chew-park-chew technique' },
    // ACUTE-BRONCHITIS — antibiotic only if bacterial signs
    { findingKey: 'ACUTE-BRONCHITIS', medicineName: 'Augmentin 625 Tablet', description: 'Only when fever+purulent sputum; complete full course' },
    { findingKey: 'ACUTE-BRONCHITIS', medicineName: 'Ascoril LS Syrup 100ml', description: 'Sputum clearance 5-7 days' },
    { findingKey: 'ACUTE-BRONCHITIS', medicineName: 'Crocin 500 Tablet', description: 'SOS fever; max 4 doses/24 hrs' },
    // PNEUMONIA-RECOVERED-FU — recovery nutrition
    { findingKey: 'PNEUMONIA-RECOVERED-FU', medicineName: 'Becosules Capsule', description: 'Recovery support 30 days' },
    { findingKey: 'PNEUMONIA-RECOVERED-FU', medicineName: 'Uprise D3 60K Sachet', description: 'Weekly × 8; take with milk' },
    // ALLERGIC-RHINITIS-LINKED
    { findingKey: 'ALLERGIC-RHINITIS-LINKED', medicineName: 'Flomist Nasal Spray', description: '2 sprays each nostril OD — regular daily use works' },
    { findingKey: 'ALLERGIC-RHINITIS-LINKED', medicineName: 'Allegra 180 Tablet', description: 'Non-sedating daytime antihistamine' },
    { findingKey: 'ALLERGIC-RHINITIS-LINKED', medicineName: 'Nasoclear Saline Nasal Spray', description: 'Dust washout BD — safe daily' },
    // DYSPNEA-NOS — support only (cardiac/pulmonary cause screen first)
    { findingKey: 'DYSPNEA-NOS', medicineName: 'Deriphyllin Retard 150 Tablet', description: 'BD — report palpitations/tremor immediately; cardiac caution in salt' },
    { findingKey: 'DYSPNEA-NOS', medicineName: 'Doxobid 200 Tablet', description: 'BD bronchodilator support' },
    // TB-ONGOING-SUPPORT — NTEP continuation support ONLY (no ATT here)
    { findingKey: 'TB-ONGOING-SUPPORT', medicineName: 'Benadon 40 Tablet', description: 'Pyridoxine-B6 — NTEP co-prescription continuation; core ATT from NTEP centre only' },
    { findingKey: 'TB-ONGOING-SUPPORT', medicineName: 'B-Long F Tablet', description: 'B6 + folic-acid nutritional support' },
    { findingKey: 'TB-ONGOING-SUPPORT', medicineName: 'Shelcal 500 Tablet', description: 'Bone/recovery support' },
    // TB-SEQUELAE-FU — nutrition only
    { findingKey: 'TB-SEQUELAE-FU', medicineName: 'Becosules Capsule', description: 'Recovery support' },
    { findingKey: 'TB-SEQUELAE-FU', medicineName: 'Uprise D3 60K Sachet', description: 'Weekly × 8' },
    // FIBROSIS-FU — supportive only
    { findingKey: 'FIBROSIS-FU', medicineName: 'Ambrodil Syrup 100ml', description: 'Secretion clearance if productive' },
    { findingKey: 'FIBROSIS-FU', medicineName: 'Uprise D3 60K Sachet', description: 'Recovery nutrition' },
    // PLEURAL-EFFUSION-RECOVERED-FU
    { findingKey: 'PLEURAL-EFFUSION-RECOVERED-FU', medicineName: 'Becosules Capsule', description: 'Recovery support' },
    // POST-VIRAL-COUGH — self-limiting framing
    { findingKey: 'POST-VIRAL-COUGH', medicineName: 'Mucolite Syrup 100ml', description: '10 ml BD with plenty of water' },
    { findingKey: 'POST-VIRAL-COUGH', medicineName: 'Crocin 500 Tablet', description: 'SOS only' },
    { findingKey: 'POST-VIRAL-COUGH', medicineName: 'Betadine Gargle 100ml', description: 'Throat-soothing gargle BD' },
    // GERD-COUGH — PPI trial + coordination
    { findingKey: 'GERD-COUGH', medicineName: 'Pantop 40 Tablet', description: 'Before breakfast; 4-8 week trial; coordinate full reflux care with GP/GAS pack' },
    // TOBACCO-CESSATION-COUNSELLING
    { findingKey: 'TOBACCO-CESSATION-COUNSELLING', medicineName: 'Nicotex 2mg Gum', description: 'First cigarette >30 min after waking — chew-park-chew; max 8-12/day' },
    { findingKey: 'TOBACCO-CESSATION-COUNSELLING', medicineName: 'Nicotex 4mg Gum', description: 'First cigarette within 30 min of waking — max 8-12/day' },
    { findingKey: 'TOBACCO-CESSATION-COUNSELLING', medicineName: 'Bupron SR 150 Tablet', description: 'Under psychiatry coordination; quit-date framing' },
    // AIR-POLLUTION-COUNSELLING
    { findingKey: 'AIR-POLLUTION-COUNSELLING', medicineName: 'Nasoclear Saline Nasal Spray', description: 'BD saline washout of dust and allergens' },
    // TB-SCREEN and all REFER-ONLY findings: intentionally ZERO links
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Inhaler Technique Checklist',
      rows: 8,
      cols: 3,
      headerLabel: ['क्रम', 'कार्य', 'सामान्य गलती'],
      colsLabel: ['Step', 'Action', 'Common Mistake'],
      footerLabel: ['हर स्टेरॉयड इनहेलर के बाद कुल्ला करें / Rinse mouth after every steroid inhaler'],
      extraLabel: '1. शेक करें 2. पूरी सांस छोड़ें 3. होंठ सील करें 4. दबाएं + धीमी गहरी सांस 5. 10 सेकंड रोकें 6. कुल्ला करें',
    },
    {
      name: 'Peak Flow Diary (14 days)',
      rows: 14,
      cols: 4,
      headerLabel: ['तारीख', 'सुबह PEFR', 'शाम PEFR', 'ट्रिगर/टिप्पणी'],
      colsLabel: ['Date', 'Morning PEFR', 'Evening PEFR', 'Trigger/Notes'],
      footerLabel: ['हरा=80-100% बेहतरीन · पीला=50-80% सावधानी · लाल=<50% तुरंत इमरजेंसी'],
    },
    {
      name: 'TB Symptom Screening Card',
      rows: 5,
      cols: 3,
      headerLabel: ['लक्षण', 'हां/नहीं', 'कब से'],
      colsLabel: ['Symptom', 'Yes/No', 'Since When'],
      footerLabel: ['खांसी 2 हफ्ते से ज्यादा = नजदीकी सरकारी NTEP केंद्र पर मुफ्त जांच कराएं'],
      extraLabel: 'लक्षण: खांसी · शाम को बुखार · रात को पसीना · वजन गिरना · थूक में खून',
    },
    {
      name: 'Asthma Control Tracker (4 weeks)',
      rows: 4,
      cols: 5,
      headerLabel: ['हफ्ता', 'दिन के लक्षण', 'रात जागना', 'रेस्क्यू पफ/हफ्ता', 'गतिविधि सीमित?'],
      colsLabel: ['Week', 'Day Symptoms', 'Night Wakes', 'Rescue Puffs/Wk', 'Activity Limit'],
      footerLabel: ['नियंत्रित: 0-2 लक्षण · आंशिक: कोई 1-2 मौजूद · अनियंत्रित: 3+ → फॉलो-अप करें'],
    },
    {
      name: 'Smoking Cessation Plan',
      rows: 7,
      cols: 3,
      headerLabel: ['दिन', 'सिगरेट/दिन', 'ट्रिगर + मेरी योजना'],
      colsLabel: ['Day', 'Cigarettes/Day', 'Trigger + My Plan'],
      footerLabel: ['छोड़ने की तारीख तय करें · घर/कार को स्मोक-फ्री करें · सपोर्ट लें'],
    },
    {
      name: 'Home Nebulization Log',
      rows: 7,
      cols: 4,
      headerLabel: ['तारीख', 'दवा (रेस्प्यूल)', 'समय', 'आराम मिला?'],
      colsLabel: ['Date', 'Drug (Respule)', 'Time', 'Relief?'],
      footerLabel: ['हर इस्तेमाल के बाद मशीन के हिस्से धोकर सुखाएं / Clean + air-dry parts after every use'],
    },
  ],

  // ══ Rx quick-packages (6) ═════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Asthma — Partly-Controlled Step-Up',
      diagnosis: 'ASTHMA-PARTLY-CONTROLLED',
      medicines: [
        { name: 'Foracort 200 Rotacap', dose: '1 cap BD via rotahaler', duration: '30 days', instructions: 'Rinse mouth after every use' },
        { name: 'Asthalin HFA 100 Inhaler', dose: '2 puffs SOS', duration: 'as needed', instructions: 'Rescue only; if needed >2×/week call clinic' },
        { name: 'Montair LC Tablet', dose: '1 tab at bedtime', duration: '30 days', instructions: 'Report mood/sleep changes' },
      ],
      labs: ['Spirometry with reversibility (if not done in 6 months)'],
      advice: 'इनहेलर तकनीक हर विज़िट पर दोबारा जांचें · ट्रिगर डायरी रखें · नींद में खांसी आए तो बताएं',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Seasonal Allergic Cough — Course',
      diagnosis: 'SEASONAL-ALLERGIC-ASTHMA',
      medicines: [
        { name: 'Montair LC Tablet', dose: '1 tab at bedtime', duration: '21 days', instructions: 'Season course; FDA neuropsychiatric note in salt' },
        { name: 'Allegra 120 Tablet', dose: '1 tab OD morning', duration: '14 days', instructions: 'Non-sedating; do not double' },
        { name: 'Nasoclear Saline Nasal Spray', dose: '2 sprays each nostril BD', duration: '30 days', instructions: 'Dust washout; safe daily' },
      ],
      labs: ['Absolute eosinophil count (if persistent)'],
      advice: 'ट्रिगर चेकलिस्ट भरें · बिस्तर की चादर गर्म पानी से धोएं · AQI खराब हो तो N95 मास्क',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Acute Bronchitis — Support',
      diagnosis: 'ACUTE-BRONCHITIS',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab TDS', duration: '5 days', instructions: 'ONLY if fever + purulent sputum; complete full course' },
        { name: 'Ascoril LS Syrup 100ml', dose: '10 ml TDS', duration: '5 days', instructions: 'No other cough syrup on top' },
        { name: 'Crocin 500 Tablet', dose: '1 tab SOS', duration: '5 days', instructions: 'Max 4 doses/24 hrs' },
      ],
      labs: ['Chest X-ray if symptoms >2 weeks or fever persists'],
      advice: 'भरपूर पानी · भाप लें · धूम्रपान न करें · 2 हफ्ते से ज्यादा खांसी = NTEP टीबी जांच',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'COPD — Mild Stable Follow-Up',
      diagnosis: 'COPD-FU-MILD',
      medicines: [
        { name: 'Tiova Rotacap 18 mcg', dose: '1 cap OD via rotahaler', duration: '30 days', instructions: 'Once daily, same time' },
        { name: 'Foracort 400 Rotacap', dose: '1 cap BD via rotahaler', duration: '30 days', instructions: 'Rinse mouth after every use' },
        { name: 'Doxobid 200 Tablet', dose: '1 tab BD', duration: '30 days', instructions: 'Report palpitations immediately' },
      ],
      labs: ['Spirometry 6-monthly', 'SpO2 home log'],
      advice: 'धूम्रपान आज ही छोड़ें · पर्स्ड-लिप ब्रीदिंग करें · फ्लू वैक्सीन हर साल · नीले होंठ/बोलने में तकलीफ = तुरंत इमरजेंसी',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Post-Viral Cough — 2 Week Course',
      diagnosis: 'POST-VIRAL-COUGH',
      medicines: [
        { name: 'Mucolite Syrup 100ml', dose: '10 ml BD', duration: '10 days', instructions: 'With plenty of water' },
        { name: 'Crocin 500 Tablet', dose: '1 tab SOS', duration: '5 days', instructions: 'Max 4 doses/24 hrs' },
        { name: 'Betadine Gargle 100ml', dose: '10 ml in warm water BD', duration: '10 days', instructions: 'Do not swallow' },
      ],
      labs: ['Only if persists >3 weeks'],
      advice: 'यह खांसी अपने आप ठीक होती है · गर्म तरल · ठंडी चीजें टालें · खून आए या बुखार लौटे तो तुरंत मिलें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Smoking Cessation — Starter',
      diagnosis: 'TOBACCO-CESSATION-COUNSELLING',
      medicines: [
        { name: 'Nicotex 2mg Gum', dose: '1 gum when craving', duration: '28 days', instructions: 'Chew-park-chew; no eating/drinking 15 min around use' },
        { name: 'Nicotex 4mg Gum', dose: '1 gum when craving', duration: '28 days', instructions: 'If first cigarette within 30 min of waking' },
        { name: 'Bupron SR 150 Tablet', dose: '1 tab OD morning', duration: '28 days', instructions: 'Under psychiatry coordination; report seizure/rash/mood change' },
      ],
      labs: ['Baseline weight + BP', ' spirometry (if >20 pack-years)'],
      advice: 'छोड़ने की तारीख तय करें · घर-कार स्मोक-फ्री · ट्रिगर लिखें · 72 घंटे सबसे कठिन होते हैं — सपोर्ट लें',
      followUpDays: 7,
      isCommon: false,
    },
  ],
}
