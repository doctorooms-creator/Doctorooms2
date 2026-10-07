/**
 * CAR-01 — CARDIOLOGY STARTER PACK (T2 specialty pack)
 *
 * India tier-2/3 cardiology OPD core: high-frequency chest/BP/rhythm
 * complaints, a heavy follow-up mix (post-MI, post-PCI, post-CABG, RHD,
 * valve, pacemaker, congenital-child) and the top-prescribed cardiac
 * brands, plus bilingual clinical questions and patient-print advice.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India cardiology core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * ⚠ SAFETY MODEL — refer-only emergencies carry ZERO findingMeds links:
 *   ACS-SUSPECT · UNSTABLE-ANG-SUSPECT · AORTIC-DISSECTION-SUSPECT ·
 *   TAMPONADE-SUSPECT · INFECTIVE-ENDOCARDITIS-SUSPECT ·
 *   ACUTE-PULMONARY-EDEMA · VT-SUSPECT · SEVERE-BRADY-MOBITZ ·
 *   HOCM-SUSPECT · PERICARDITIS-SUSPECT · MASSIVE-PE-SUSPECT ·
 *   PRE-ECLAMPSIA-HTN (refer OBG — never treat here).
 * No DOACs, no thrombolysis, no IV infusions as prescribable entries —
 * anticoagulation is framed as review/referral only. Cordarone/Lanoxin are
 * continuation-verify-only entries, not new starts.
 *
 * Sources: NLEM 2023 backbone (amlodipine/telmisartan/metoprolol/
 * atorvastatin/aspirin/furosemide/spironolactone), standard Indian
 * cardiology OPD patterns, existing GP/pediatric seeds for field
 * conventions.
 */

import type { SpecialtyPack } from '../types'

export const CAR01_PACK: SpecialtyPack = {
  meta: {
    code: 'CAR-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Cardiology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'Cardiologist OPD · India T2/T3 cardiology practice patterns · bilingual Hindi/English · refer-only emergencies carry zero medicine links · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'CHE', name: 'छाती संबंधी', nameEn: 'Chest / Cardiac Symptoms' },
    { key: 'PAL', name: 'धड़कन', nameEn: 'Palpitations & Rhythm' },
    { key: 'BPL', name: 'ब्लड प्रेशर', nameEn: 'Blood Pressure' },
    { key: 'HRT', name: 'हृदय', nameEn: 'Heart & Follow-up' },
    { key: 'LIP', name: 'कोलेस्ट्रॉल', nameEn: 'Cholesterol / Lipids' },
    { key: 'OTH', name: 'अन्य', nameEn: 'Others & Referrals' },
  ],

  // ══ Complaints (45) ═══════════════════════════════════════════════════
  complaints: [
    // CHE — Chest / cardiac symptoms
    { code: 'CHE01', categoryKey: 'CHE', detail: 'सीने में दर्द', detailEn: 'Chest Pain' },
    { code: 'CHE02', categoryKey: 'CHE', detail: 'सीने का दर्द — हाथ/जबड़े/पीठ की तरफ', detailEn: 'Chest Pain Radiating to Arm/Jaw/Back' },
    { code: 'CHE03', categoryKey: 'CHE', detail: 'सीने में जलन (पहले दिल की जांच)', detailEn: 'Burning Chest — Rule Out Cardiac First' },
    { code: 'CHE04', categoryKey: 'CHE', detail: 'मेहनत पर सीने में भारीपन, आराम से ठीक', detailEn: 'Exertional Chest Heaviness Relieved by Rest (Angina Pattern)' },
    { code: 'CHE05', categoryKey: 'CHE', detail: 'आराम पर सीने में दर्द (अस्थिर)', detailEn: 'Chest Pain at Rest (Unstable — Flag)' },
    { code: 'CHE06', categoryKey: 'CHE', detail: 'चिंता के साथ सीने के लक्षण', detailEn: 'Chest Symptoms with Anxiety (Differentiate)' },
    { code: 'CHE07', categoryKey: 'CHE', detail: 'धूम्रपान + खांसी + दिल का रोग', detailEn: 'Smoker with Cough + Heart Disease' },
    { code: 'CHE08', categoryKey: 'CHE', detail: 'बाहर की ECG — रिपोर्ट दिखाना', detailEn: 'Outside ECG — Review' },
    { code: 'CHE09', categoryKey: 'CHE', detail: 'बाहर का 2D Echo — रिपोर्ट दिखाना', detailEn: 'Outside 2D Echo — Review' },
    { code: 'CHE10', categoryKey: 'CHE', detail: 'बाहर का TMT — रिपोर्ट दिखाना', detailEn: 'Outside TMT — Review' },
    // PAL — Palpitations & rhythm
    { code: 'PAL01', categoryKey: 'PAL', detail: 'धड़कन तेज होना / धड़कने का एहसास', detailEn: 'Palpitations' },
    { code: 'PAL02', categoryKey: 'PAL', detail: 'धड़कन छूटना (छूट-छूट कर धड़कना)', detailEn: 'Skipped Beats' },
    { code: 'PAL03', categoryKey: 'PAL', detail: 'अनियमित धड़कन (AF की आशंका)', detailEn: 'Irregular Heartbeat (AF Suspect)' },
    { code: 'PAL04', categoryKey: 'PAL', detail: 'बार-बार तेज धड़कन के दौरे', detailEn: 'Racing Heart Episodes' },
    { code: 'PAL05', categoryKey: 'PAL', detail: 'बेहोशी का दौरा / गिरना (जांच)', detailEn: 'Syncope / Fainting (Workup)' },
    { code: 'PAL06', categoryKey: 'PAL', detail: 'लगभग बेहोशी — आंखों के आगे अंधेरा', detailEn: 'Near-Syncope Dizziness' },
    { code: 'PAL07', categoryKey: 'PAL', detail: 'बाहर की Holter रिपोर्ट — दिखाना', detailEn: 'Outside Holter — Review' },
    // BPL — Blood pressure
    { code: 'BPL01', categoryKey: 'BPL', detail: 'पहली बार ब्लड प्रेशर ऊंच आया', detailEn: 'High BP Detected First Time' },
    { code: 'BPL02', categoryKey: 'BPL', detail: 'दवा पर भी BP नियंत्रित नहीं', detailEn: 'Uncontrolled BP on Medicines' },
    { code: 'BPL03', categoryKey: 'BPL', detail: 'नियमित BP जांच / चेकअप', detailEn: 'Routine BP Checkup' },
    { code: 'BPL04', categoryKey: 'BPL', detail: 'कम BP — चक्कर / कमजोरी', detailEn: 'Low BP — Dizziness / Weakness' },
    { code: 'BPL05', categoryKey: 'BPL', detail: 'BP में उतार-चढ़ाव', detailEn: 'Fluctuating BP Readings' },
    { code: 'BPL06', categoryKey: 'BPL', detail: 'गर्भावस्था में ऊंच BP (OBG रेफर)', detailEn: 'High BP in Pregnancy (Refer OBG)' },
    { code: 'BPL07', categoryKey: 'BPL', detail: 'BP दवा के साथ खड़े होने पर चक्कर', detailEn: 'Giddiness on Standing with BP Meds' },
    // HRT — Heart & follow-up
    { code: 'HRT01', categoryKey: 'HRT', detail: 'मेहनत पर सांस फूलना (दिल की जांच)', detailEn: 'Breathlessness on Exertion (Cardiac)' },
    { code: 'HRT02', categoryKey: 'HRT', detail: 'रात में सांस फूलना / उठना (PND)', detailEn: 'Night-time Breathlessness (PND)' },
    { code: 'HRT03', categoryKey: 'HRT', detail: 'दोनों टखनों में सूजन', detailEn: 'Leg Swelling — Both Ankles' },
    { code: 'HRT04', categoryKey: 'HRT', detail: 'तेजी से वजन बढ़ना + सांस फूलना (HF चेतावनी)', detailEn: 'Rapid Weight Gain + Breathlessness (HF Flag)' },
    { code: 'HRT05', categoryKey: 'HRT', detail: 'जाना-माना दिल रोग + थकान', detailEn: 'Fatigue with Known Heart Disease' },
    { code: 'HRT06', categoryKey: 'HRT', detail: 'परिवार में दिल का रोग — स्क्रीनिंग', detailEn: 'Family History Heart Disease — Screening' },
    { code: 'HRT07', categoryKey: 'HRT', detail: 'हार्ट अटैक के बाद फॉलो-अप', detailEn: 'Post-Heart-Attack Follow-up' },
    { code: 'HRT08', categoryKey: 'HRT', detail: 'एंजियोप्लास्टी/स्टेंट के बाद फॉलो-अप', detailEn: 'Post-Angioplasty/Stent Follow-up' },
    { code: 'HRT09', categoryKey: 'HRT', detail: 'बायपास सर्जरी (CABG) के बाद फॉलो-अप', detailEn: 'Post-Bypass (CABG) Follow-up' },
    { code: 'HRT10', categoryKey: 'HRT', detail: 'रूमेटिक हार्ट डिजीज — फॉलो-अप', detailEn: 'Rheumatic Heart Disease Follow-up' },
    { code: 'HRT11', categoryKey: 'HRT', detail: 'वाल्व रोग — फॉलो-अप', detailEn: 'Valve Disease Follow-up' },
    { code: 'HRT12', categoryKey: 'HRT', detail: 'बच्चे में दिल में छेद — फॉलो-अप', detailEn: 'Hole in Heart (Child) — Follow-up' },
    { code: 'HRT13', categoryKey: 'HRT', detail: 'पेसमेकर चेकअप', detailEn: 'Pacemaker Checkup' },
    // LIP — Cholesterol / lipids
    { code: 'LIP01', categoryKey: 'LIP', detail: 'कोलेस्ट्रॉल ऊंच पाया गया', detailEn: 'High Cholesterol Discovered' },
    { code: 'LIP02', categoryKey: 'LIP', detail: 'कोलेस्ट्रॉल + शुगर दोनों ऊंच (मेटाबॉलिक)', detailEn: 'High Cholesterol + Sugar (Metabolic)' },
    // OTH — Others & referrals
    { code: 'OTH01', categoryKey: 'OTH', detail: 'चलने पर पैर में दर्द (क्लॉडिकेशन की आशंका)', detailEn: 'Leg Pain on Walking (Claudication Flag)' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'होंठ/उंगलियां नीली (सायनोसिस)', detailEn: 'Blue Lips/Fingers (Cyanosis Flag)' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'शिशु — दूध पिलाते समय पसीना + सांस फूलना', detailEn: 'Baby — Feeding Sweat + Breathlessness (Congenital Flag)' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'गुर्दा (ESRD) + दिल — संयुक्त देखभाल', detailEn: 'ESRD + Heart — Nephro Co-management' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'वाल्व रोग के साथ बुखार (इंडोकार्डाइटिस चेतावनी)', detailEn: 'Fever with Valve Disease (Endocarditis Alert)' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'खून पतली दवा से पेट की समस्या', detailEn: 'Stomach Issues on Blood Thinners' },
  ],

  // ══ Questions (90 — 2 per complaint) ══════════════════════════════════
  // questionIndex order below MUST match this array order (idx = 0-based).
  questions: [
    // CHE01 Chest pain
    { complaintCode: 'CHE01', question: 'दर्द कब से है और एक बार में कितनी देर रहता है?', questionEn: 'Since when is the pain and how long does each episode last?' }, // idx 0
    { complaintCode: 'CHE01', question: 'दर्द के साथ पसीना, उल्टी या सांस फूलना भी है?', questionEn: 'Any sweating, vomiting or breathlessness along with the pain?' }, // idx 1
    // CHE02 Radiating chest pain
    { complaintCode: 'CHE02', question: 'दर्द कहां तक जाता है — बाएं हाथ, जबड़े या पीठ की तरफ?', questionEn: 'Where does the pain travel — left arm, jaw or back?' }, // idx 2
    { complaintCode: 'CHE02', question: 'आज एस्पिरिन या कोई दर्द की गोली खाई है?', questionEn: 'Have you taken aspirin or any painkiller today?' }, // idx 3
    // CHE03 Burning chest
    { complaintCode: 'CHE03', question: 'जलन खाने के बाद बढ़ती है या मेहनत करने पर?', questionEn: 'Is the burning worse after meals or on exertion?' }, // idx 4
    { complaintCode: 'CHE03', question: 'जलन के साथ पसीना या चक्कर भी आए हैं?', questionEn: 'Any sweating or giddiness along with the burning?' }, // idx 5
    // CHE04 Exertional heaviness (angina pattern)
    { complaintCode: 'CHE04', question: 'कितनी दूर चलने या कितनी सीढ़ियां चढ़ने पर भारीपन आता है?', questionEn: 'After how much walking or how many stairs does the heaviness come?' }, // idx 6
    { complaintCode: 'CHE04', question: 'आराम करने से कितनी देर में ठीक हो जाता है?', questionEn: 'How soon does it settle after rest?' }, // idx 7
    // CHE05 Rest pain (unstable flag)
    { complaintCode: 'CHE05', question: 'क्या दर्द आराम करते हुए या रात में सोते हुए भी आता है?', questionEn: 'Does the pain come even at rest or while asleep at night?' }, // idx 8
    { complaintCode: 'CHE05', question: 'दर्द कितने मिनट से लगातार चल रहा है?', questionEn: 'For how many minutes has the pain been continuous?' }, // idx 9
    // CHE06 Anxiety chest symptoms
    { complaintCode: 'CHE06', question: 'लक्षण चिंता/तनाव के समय आते हैं और आराम से गायब?', questionEn: 'Do symptoms appear during stress and vanish when relaxed?' }, // idx 10
    { complaintCode: 'CHE06', question: 'पहले कभी ECG या Echo कराया है?', questionEn: 'Have you ever had an ECG or echo done before?' }, // idx 11
    // CHE07 Smoker + cough + heart
    { complaintCode: 'CHE07', question: 'कितने साल से और दिन में कितना धूम्रपान/तंबाकू करते हैं?', questionEn: 'For how many years and how much smoking or tobacco per day?' }, // idx 12
    { complaintCode: 'CHE07', question: 'सीढ़ी चढ़ने पर सांस फूलती है या खांसी आती है?', questionEn: 'Do you get breathless or cough on climbing stairs?' }, // idx 13
    // CHE08 Outside ECG review
    { complaintCode: 'CHE08', question: 'ECG कब और कहां कराई थी?', questionEn: 'When and where was the ECG done?' }, // idx 14
    { complaintCode: 'CHE08', question: 'ECG कराते समय क्या लक्षण थे?', questionEn: 'What symptoms were present when the ECG was taken?' }, // idx 15
    // CHE09 Outside echo review
    { complaintCode: 'CHE09', question: '2D Echo कब हुआ था और EF कितनी आई थी?', questionEn: 'When was the 2D echo done and what was the EF?' }, // idx 16
    { complaintCode: 'CHE09', question: 'रिपोर्ट में कोई असामान्यता लिखी गई थी?', questionEn: 'Was any abnormality written in the report?' }, // idx 17
    // CHE10 Outside TMT review
    { complaintCode: 'CHE10', question: 'TMT कब कराया था और नतीजा क्या था?', questionEn: 'When was the TMT done and what was the result?' }, // idx 18
    { complaintCode: 'CHE10', question: 'TMT के दौरान सीने में दर्द या सांस फूलना हुआ?', questionEn: 'Did you get chest pain or breathlessness during the TMT?' }, // idx 19
    // PAL01 Palpitations
    { complaintCode: 'PAL01', question: 'धड़कन का दौरा कितनी देर चलता है और कैसे शांत होता है?', questionEn: 'How long does a palpitation episode last and how does it settle?' }, // idx 20
    { complaintCode: 'PAL01', question: 'धड़कन के साथ चक्कर या बेहोशी भी आई है?', questionEn: 'Any giddiness or blackout with the palpitations?' }, // idx 21
    // PAL02 Skipped beats
    { complaintCode: 'PAL02', question: 'दिन में कितनी बार धड़कन छूटना महसूस होता है?', questionEn: 'How many times a day do you feel skipped beats?' }, // idx 22
    { complaintCode: 'PAL02', question: 'चाय/कॉफी या धूम्रपान से यह बढ़ता है?', questionEn: 'Does it increase with tea, coffee or smoking?' }, // idx 23
    // PAL03 Irregular heartbeat (AF)
    { complaintCode: 'PAL03', question: 'नाड़ी अनियमित चल रही है — कब से?', questionEn: 'Pulse is running irregular — since when?' }, // idx 24
    { complaintCode: 'PAL03', question: 'पहले कभी खून पतला करने की दवा (जैसे वारफेरिन) चली है?', questionEn: 'Have you ever been on a blood thinner such as warfarin?' }, // idx 25
    // PAL04 Racing heart episodes
    { complaintCode: 'PAL04', question: 'दौरे अचानक शुरू होकर अचानक रुकते हैं?', questionEn: 'Do episodes start abruptly and stop abruptly?' }, // idx 26
    { complaintCode: 'PAL04', question: 'दौरे के दौरान नाड़ी गिनी है — कितनी थी?', questionEn: 'Have you counted your pulse during an episode — what was it?' }, // idx 27
    // PAL05 Syncope workup
    { complaintCode: 'PAL05', question: 'बेहोश होने से ठीक पहले क्या महसूस हुआ था?', questionEn: 'What did you feel just before losing consciousness?' }, // idx 28
    { complaintCode: 'PAL05', question: 'बेहोशी के दौरान जीभ कटी, झटके या मूत्र त्याग हुआ?', questionEn: 'Did you bite your tongue, have jerks or pass urine during the blackout?' }, // idx 29
    // PAL06 Near-syncope
    { complaintCode: 'PAL06', question: 'आंखों के आगे अंधेरा कब आता है — खड़े होते समय?', questionEn: 'When do blackouts appear — on standing up?' }, // idx 30
    { complaintCode: 'PAL06', question: 'क्या दिल या BP की कोई दवा चल रही है?', questionEn: 'Are you on any heart or BP medicine currently?' }, // idx 31
    // PAL07 Holter review
    { complaintCode: 'PAL07', question: 'Holter कब कराया था और कितने घंटे का था?', questionEn: 'When was the Holter done and for how many hours?' }, // idx 32
    { complaintCode: 'PAL07', question: 'Holter रिपोर्ट में कुछ असामान्य पाया गया?', questionEn: 'Was anything abnormal found in the Holter report?' }, // idx 33
    // BPL01 First-time high BP
    { complaintCode: 'BPL01', question: 'ऊंच BP की कितनी रीडिंग हुईं और सबसे ऊंचा कितना था?', questionEn: 'How many high BP readings and what was the highest?' }, // idx 34
    { complaintCode: 'BPL01', question: 'BP नापते समय सिरदर्द, चक्कर या कोई और लक्षण था?', questionEn: 'Any headache, giddiness or other symptoms when BP was measured?' }, // idx 35
    // BPL02 Uncontrolled BP
    { complaintCode: 'BPL02', question: 'अभी कौन सी BP दवा और कितनी खुराक चल रही है?', questionEn: 'Which BP medicine and what dose are you currently on?' }, // idx 36
    { complaintCode: 'BPL02', question: 'घर पर कितने दिनों का BP रिकॉर्ड मौजूद है?', questionEn: 'How many days of home BP records do you have?' }, // idx 37
    // BPL03 Routine BP checkup
    { complaintCode: 'BPL03', question: 'पिछली बार BP कब जांचा था और कितना आया था?', questionEn: 'When was your BP last checked and what was it?' }, // idx 38
    { complaintCode: 'BPL03', question: 'नमक, रोजाना व्यायाम और वजन का हाल क्या है?', questionEn: 'How are your salt intake, daily exercise and weight?' }, // idx 39
    // BPL04 Low BP
    { complaintCode: 'BPL04', question: 'चक्कर कब आते हैं — खड़े होने पर या दवा लेने के बाद?', questionEn: 'When does giddiness occur — on standing or after taking medicine?' }, // idx 40
    { complaintCode: 'BPL04', question: 'हाल में उल्टी, दस्त या कम पानी पीना रहा है?', questionEn: 'Any recent vomiting, loose motions or low fluid intake?' }, // idx 41
    // BPL05 Fluctuating BP
    { complaintCode: 'BPL05', question: 'रीडिंग्स में कितना उतार-चढ़ाव दिखता है?', questionEn: 'How much variation do you see between readings?' }, // idx 42
    { complaintCode: 'BPL05', question: 'क्या दवा रोज एक ही समय पर ले रहे हैं?', questionEn: 'Are you taking your medicine at the same time daily?' }, // idx 43
    // BPL06 Pregnancy BP (refer OBG)
    { complaintCode: 'BPL06', question: 'गर्भावस्था कितने महीने की है?', questionEn: 'How many months pregnant are you?' }, // idx 44
    { complaintCode: 'BPL06', question: 'पैरों में सूजन या सिरदर्द भी साथ है?', questionEn: 'Any ankle swelling or headache as well?' }, // idx 45
    // BPL07 Giddiness on standing with BP meds
    { complaintCode: 'BPL07', question: 'कौन सी BP दवा चल रही है और कब से चक्कर शुरू हुए?', questionEn: 'Which BP medicine is running and when did giddiness start?' }, // idx 46
    { complaintCode: 'BPL07', question: 'तेज पसीना, उल्टी या दस्त के बाद चक्कर बढ़े हैं?', questionEn: 'Did giddiness worsen after heavy sweating, vomiting or loose motions?' }, // idx 47
    // HRT01 Exertional SOB
    { complaintCode: 'HRT01', question: 'कितनी दूर चलने पर सांस फूलती है — पहले से कम हुई है?', questionEn: 'How far can you walk before breathlessness — has it reduced?' }, // idx 48
    { complaintCode: 'HRT01', question: 'रात को सोने में कितने तकिये लगाते हैं?', questionEn: 'How many pillows do you use at night?' }, // idx 49
    // HRT02 PND
    { complaintCode: 'HRT02', question: 'रात में सांस की वजह से कितनी बार उठना पड़ता है?', questionEn: 'How many times does breathlessness wake you at night?' }, // idx 50
    { complaintCode: 'HRT02', question: 'बैठ जाने पर कितनी देर में आराम मिलता है?', questionEn: 'How long after sitting up do you get relief?' }, // idx 51
    // HRT03 Ankle edema
    { complaintCode: 'HRT03', question: 'सूजन शाम को बढ़ती और सुबह कम होती है?', questionEn: 'Is the swelling worse by evening and less in the morning?' }, // idx 52
    { complaintCode: 'HRT03', question: 'सूजन एक टखने में है या दोनों में?', questionEn: 'Is the swelling in one ankle or both?' }, // idx 53
    // HRT04 Rapid weight gain (HF flag)
    { complaintCode: 'HRT04', question: 'कितने दिनों में कितना वजन बढ़ा है?', questionEn: 'How much weight have you gained over how many days?' }, // idx 54
    { complaintCode: 'HRT04', question: 'लेटने पर क्या सांस और बिगड़ जाती है?', questionEn: 'Does lying flat make the breathlessness worse?' }, // idx 55
    // HRT05 Fatigue with known HD
    { complaintCode: 'HRT05', question: 'दिल का कौन सा रोग है और कब बताया गया था?', questionEn: 'Which heart disease do you have and when was it diagnosed?' }, // idx 56
    { complaintCode: 'HRT05', question: 'क्या दवाएं नियमित रूप से चल रही हैं?', questionEn: 'Are you taking your medicines regularly?' }, // idx 57
    // HRT06 Family history screening
    { complaintCode: 'HRT06', question: 'परिवार में किसे, किस उम्र में दिल का दौरा/रोग हुआ?', questionEn: 'Who in the family had heart disease or attack and at what age?' }, // idx 58
    { complaintCode: 'HRT06', question: 'क्या आपने कभी BP, शुगर या कोलेस्ट्रॉल जांच कराया है?', questionEn: 'Have you ever had BP, sugar or cholesterol tested?' }, // idx 59
    // HRT07 Post-MI follow-up
    { complaintCode: 'HRT07', question: 'हार्ट अटैक कब हुआ था और क्या इलाज हुआ था?', questionEn: 'When was the heart attack and what treatment was given?' }, // idx 60
    { complaintCode: 'HRT07', question: 'अभी कौन सी दवाएं चल रही हैं — खून पतली और कोलेस्ट्रॉल वाली शामिल?', questionEn: 'Which medicines now — including blood thinner and statin?' }, // idx 61
    // HRT08 Post-PCI follow-up
    { complaintCode: 'HRT08', question: 'स्टेंट कब लगवाया था और कितने स्टेंट हैं?', questionEn: 'When was the stent placed and how many stents?' }, // idx 62
    { complaintCode: 'HRT08', question: 'क्या दोनों खून पतली दवाएं (एस्पिरिन + क्लोपिडोग्रेल) अभी भी चल रही हैं?', questionEn: 'Are both blood thinners — aspirin + clopidogrel — still running?' }, // idx 63
    // HRT09 Post-CABG follow-up
    { complaintCode: 'HRT09', question: 'बायपास सर्जरी कब हुई थी?', questionEn: 'When was the bypass surgery done?' }, // idx 64
    { complaintCode: 'HRT09', question: 'छाती के घाव में दर्द, सूजन या पानी का स्राव है?', questionEn: 'Any chest wound pain, swelling or discharge?' }, // idx 65
    // HRT10 RHD follow-up
    { complaintCode: 'HRT10', question: 'रूमेटिक वाल्व रोग कब पता चला और कौन सा वाल्व है?', questionEn: 'When was rheumatic valve disease found and which valve?' }, // idx 66
    { complaintCode: 'HRT10', question: 'बचपन में बार-बार गले का संक्रमण या आमवात का इतिहास?', questionEn: 'Childhood history of recurrent sore throat or rheumatic fever?' }, // idx 67
    // HRT11 Valve follow-up
    { complaintCode: 'HRT11', question: 'कौन सा वाल्व प्रभावित है और कितनी गंभीरता है?', questionEn: 'Which valve is affected and how severe is it?' }, // idx 68
    { complaintCode: 'HRT11', question: 'मेहनत पर सांस फूलना या धड़कन बढ़ गई है?', questionEn: 'Has exertional breathlessness or palpitation increased?' }, // idx 69
    // HRT12 Hole in heart (child)
    { complaintCode: 'HRT12', question: 'बच्चे की उम्र और वजन क्या है?', questionEn: 'What is the age and weight of the child?' }, // idx 70
    { complaintCode: 'HRT12', question: 'खिलाते समय बच्चे को पसीना आता है या सांस फूलती है?', questionEn: 'Does the baby sweat or get breathless while feeding?' }, // idx 71
    // HRT13 Pacemaker checkup
    { complaintCode: 'HRT13', question: 'पेसमेकर कब लगवाया था?', questionEn: 'When was the pacemaker implanted?' }, // idx 72
    { complaintCode: 'HRT13', question: 'क्या चक्कर या धीमी धड़कन दोबारा आई है?', questionEn: 'Have giddiness or slow pulse returned?' }, // idx 73
    // LIP01 High cholesterol
    { complaintCode: 'LIP01', question: 'लिपिड जांच कब हुई और LDL/TG कितने थे?', questionEn: 'When was the lipid test done and what were LDL/TG?' }, // idx 74
    { complaintCode: 'LIP01', question: 'परिवार में किसे उच्च कोलेस्ट्रॉल या समय से पहले दिल का रोग है?', questionEn: 'Anyone in the family with high cholesterol or early heart disease?' }, // idx 75
    // LIP02 Cholesterol + sugar
    { complaintCode: 'LIP02', question: 'शुगर की कौन सी दवा चल रही है?', questionEn: 'Which sugar medicines are you currently on?' }, // idx 76
    { complaintCode: 'LIP02', question: 'वजन और कमर कितनी है — बढ़ रही है?', questionEn: 'What are your weight and waist — are they increasing?' }, // idx 77
    // OTH01 Claudication flag
    { complaintCode: 'OTH01', question: 'कितनी दूर चलने पर पैर में दर्द शुरू होता है?', questionEn: 'After how much walking does leg pain start?' }, // idx 78
    { complaintCode: 'OTH01', question: 'रुककर खड़े रहने से दर्द ठीक हो जाता है?', questionEn: 'Does the pain settle on standing still?' }, // idx 79
    // OTH02 Cyanosis flag
    { complaintCode: 'OTH02', question: 'होंठ/उंगलियों का नीलापन कब दिखता है — रोते/मेहनत पर या हमेशा?', questionEn: 'When does blueness appear — crying or exertion, or always?' }, // idx 80
    { complaintCode: 'OTH02', question: 'नीलेपन के साथ सांस फूलना या चक्कर भी है?', questionEn: 'Any breathlessness or giddiness with the blueness?' }, // idx 81
    // OTH03 Baby feeding sweat (congenital flag)
    { complaintCode: 'OTH03', question: 'बच्चा एक बार में कितनी देर दूध पीता है — थककर छोड़ देता है?', questionEn: 'How long does the baby feed at a time — does it tire out?' }, // idx 82
    { complaintCode: 'OTH03', question: 'बच्चे का वजन उम्र के अनुसार बढ़ रहा है?', questionEn: 'Is the baby gaining weight appropriately for age?' }, // idx 83
    // OTH04 ESRD + heart
    { complaintCode: 'OTH04', question: 'किडनी की दवा/डायलिसिस कब से चल रहा है?', questionEn: 'Since when are you on kidney medicines or dialysis?' }, // idx 84
    { complaintCode: 'OTH04', question: 'पैरों की सूजन या सांस फूलना बढ़ा है?', questionEn: 'Has ankle swelling or breathlessness increased?' }, // idx 85
    // OTH05 Fever with valve disease
    { complaintCode: 'OTH05', question: 'वाल्व रोग के बाद बुखार कितने दिन से है — शाम को ज्यादा?', questionEn: 'How many days is the fever — worse in the evenings?' }, // idx 86
    { complaintCode: 'OTH05', question: 'बुखार के साथ ठंड लगना या रात का पसीना है?', questionEn: 'Any chills or night sweats with the fever?' }, // idx 87
    // OTH06 Stomach issues on blood thinners
    { complaintCode: 'OTH06', question: 'काला/चिपचिपा मल या खून की उल्टी तो नहीं हुई?', questionEn: 'Any black tarry stools or blood in vomit?' }, // idx 88
    { complaintCode: 'OTH06', question: 'कौन सी खून पतली दवा चल रही है और कब से जलन है?', questionEn: 'Which blood thinner is running and since when is the burning?' }, // idx 89
  ],

  // ══ Suggestions (180 — 2 per question; questionIndex matches above) ══
  suggestions: [
    // CHE01 — idx 0
    { questionIndex: 0, text: 'दर्द के साथ दबाव/पसीना — 10 मिनट में ECG; तेज या 15 मिनट से लंबा दर्द = तुरंत इमरजेंसी, 108 एम्बुलेंस', textEn: 'Pressure or sweat with pain — ECG within 10 minutes; severe or >15 min pain = emergency NOW, call 108 ambulance' },
    { questionIndex: 0, text: '2 मिनट का चुभना दर्द — पसली/मांसपेशी हो सकती है, फिर भी पहली ECG जरूरी', textEn: 'Brief stabbing pain — may be rib/muscle, but a first ECG is still a must' },
    // CHE01 — idx 1
    { questionIndex: 1, text: 'पसीना/उल्टी/सांस के साथ सीने का दर्द — हार्ट अटैक हो सकता है: तुरंत इमरजेंसी जाएं, 108 एम्बुलेंस बुलाएं', textEn: 'Chest pain with sweating, vomiting or breathlessness — possible heart attack: go to the emergency room immediately, call 108 ambulance' },
    { questionIndex: 1, text: 'बिना पसीने का हल्का दर्द — आज ECG कराकर दिखाएं; दर्द के लिए सिर्फ पैराटामोल, NSAID (कॉम्बिफ्लैम आदि) नहीं', textEn: 'Mild pain without sweating — ECG today; for pain use plain paracetamol only, avoid NSAIDs like Combiflam' },
    // CHE02 — idx 2
    { questionIndex: 2, text: 'बाएं हाथ/जबड़े/पीठ की तरफ जाता दर्द — हृदय का बड़ा खतरा: तुरंत इमरजेंसी जाएं, खुद गाड़ी न चलाएं', textEn: 'Pain travelling to left arm, jaw or back — major cardiac danger: emergency room immediately, do not drive yourself' },
    { questionIndex: 2, text: 'सिर्फ सीने तक सीमित दर्द — फिर भी 10 मिनट में ECG और डॉक्टर को रिपोर्ट दिखाएं', textEn: 'Pain confined to chest — still get an ECG within 10 minutes and show the report to the doctor' },
    // CHE02 — idx 3
    { questionIndex: 3, text: 'डॉक्टर ने पहले बताई हो तो एस्पिरिन चबाकर खाएं — और तुरंत इमरजेंसी पहुंचें; खून की उल्टी/काला मल हो तो एस्पिरिन न लें', textEn: 'If previously advised, chew an aspirin — and reach the emergency room immediately; do not take aspirin if vomiting blood or passing black stools' },
    { questionIndex: 3, text: 'दर्द की गोली खा ली है — आगे NSAID नहीं; ECG कराकर आज ही दिखाएं', textEn: 'Painkiller already taken — no further NSAIDs; get an ECG and review today' },
    // CHE03 — idx 4
    { questionIndex: 4, text: 'मेहनत पर जलन/दबाव — दिल का कारण निकालना जरूरी: ECG आज; लक्षण तेज हों तो तुरंत इमरजेंसी', textEn: 'Burning or pressure on exertion — cardiac cause must be ruled out: ECG today; severe symptoms = emergency room immediately' },
    { questionIndex: 4, text: 'खाने/लेटने पर जलन — रिफ्लक्स संभव, पर दवा शुरू करने से पहले ECG जरूरी', textEn: 'Burning after meals or on lying down — likely reflux, but an ECG is required before starting treatment' },
    // CHE03 — idx 5
    { questionIndex: 5, text: 'जलन + पसीना/चक्कर — दिल का दौरा मानकर तुरंत इमरजेंसी जाएं (108 एम्बुलेंस)', textEn: 'Burning with sweating or giddiness — treat as possible heart attack: emergency room immediately (108 ambulance)' },
    { questionIndex: 5, text: 'बिना पसीने की जलन — एसिडिटी हो सकती है; फिर भी पहले ECG, फिर एसिडिटी का इलाज', textEn: 'Burning without sweating — could be acidity; still do the ECG first, then treat reflux' },
    // CHE04 — idx 6
    { questionIndex: 6, text: 'चलने पर भारीपन, आराम से शांत — एंजाइना पैटर्न: ECG + डॉक्टर से जल्द मिलें; लक्षण बढ़ें तो तुरंत इमरजेंसी', textEn: 'Heaviness on walking relieved by rest — angina pattern: ECG plus early review; worsening symptoms = emergency room immediately' },
    { questionIndex: 6, text: 'भारीपन के साथ चक्कर/पसीना — खतरनाक संकेत: तुरंत इमरजेंसी जाएं', textEn: 'Heaviness with giddiness or sweating — dangerous sign: go to the emergency room immediately' },
    // CHE04 — idx 7
    { questionIndex: 7, text: '5 मिनट में आराम — स्थिर एंजाइना संभव; डॉक्टर की सलाह से Sorbitrate — Sildenafil/Tadalafil के साथ कभी नहीं (घातक खतरा)', textEn: 'Relief within 5 minutes — likely stable angina; Sorbitrate only as advised — never with Sildenafil or Tadalafil (FATAL interaction)' },
    { questionIndex: 7, text: '10 मिनट से ज्यादा या आराम पर भी — अस्थिर एंजाइना: तुरंत इमरजेंसी', textEn: 'Relief beyond 10 minutes or occurring at rest — unstable angina: emergency room immediately' },
    // CHE05 — idx 8
    { questionIndex: 8, text: 'आराम पर/रात में दर्द — अस्थिर एंजाइना का खतरा: अभी इमरजेंसी जाएं, खुद गाड़ी न चलाएं', textEn: 'Pain at rest or at night — unstable angina risk: emergency room NOW, do not drive yourself' },
    { questionIndex: 8, text: 'रात का दर्द + सांस फूलना — गंभीर संकेत: 108 एम्बुलेंस; वहां 10 मिनट में ECG', textEn: 'Night pain with breathlessness — serious sign: call 108 ambulance; ECG within 10 minutes there' },
    // CHE05 — idx 9
    { questionIndex: 9, text: '20 मिनट से लंबा लगातार दर्द — हार्ट अटैक मानकर तुरंत इमरजेंसी जाएं, ECG वहीं कराएं', textEn: 'Continuous pain beyond 20 minutes — treat as heart attack: emergency room immediately, ECG there' },
    { questionIndex: 9, text: 'Sorbitrate चल रहा हो तो Sildenafil/Tadalafil कभी न लें — घातक BP गिरावट; दर्द का पैटर्न बदले तो तुरंत इमरजेंसी', textEn: 'If on Sorbitrate, never take Sildenafil or Tadalafil — fatal BP drop; any change in pain pattern = emergency room immediately' },
    // CHE06 — idx 10
    { questionIndex: 10, text: 'तनाव के समय लक्षण + सामान्य ECG — चिंता संभव; नींद 7 घंटे, कैफीन घटाएं; तेज दर्द/धड़कन हो तो तुरंत इमरजेंसी', textEn: 'Symptoms during stress with a normal ECG — anxiety possible; 7 hours sleep, cut caffeine; severe pain or palpitations = emergency room immediately' },
    { questionIndex: 10, text: 'लक्षण व्यायाम से नहीं बदलते — दिल की जांच एक बार पूरी कराएं, फिर तनाव प्रबंधन', textEn: 'Symptoms unchanged by exertion — complete one cardiac workup, then focus on stress management' },
    // CHE06 — idx 11
    { questionIndex: 11, text: 'पुरानी जांच सामान्य थी — नए लक्षण पर नई ECG जरूरी; तेज दर्द हो तो तुरंत इमरजेंसी', textEn: 'Old tests were normal — new symptoms need a fresh ECG; severe pain = emergency room immediately' },
    { questionIndex: 11, text: 'कभी जांच नहीं हुई — आज ECG, BP, शुगर और कोलेस्ट्रॉल कराएं', textEn: 'Never tested — do ECG, BP, sugar and cholesterol today' },
    // CHE07 — idx 12
    { questionIndex: 12, text: 'धूम्रपान आज ही बंद करें — 1 साल में दिल का जोखिम आधा हो जाता है; दर्द हो तो तुरंत इमरजेंसी', textEn: 'Stop smoking TODAY — cardiac risk halves in 1 year; any chest pain = emergency room immediately' },
    { questionIndex: 12, text: '10 साल से ज्यादा धूम्रपान — ECG, कोलेस्ट्रॉल और छाती की X-ray अनिवार्य जांच', textEn: 'Smoking over 10 years — ECG, cholesterol and chest X-ray are mandatory checks' },
    // CHE07 — idx 13
    { questionIndex: 13, text: 'सीढ़ी पर सांस — दिल की क्षमता जांचें (2D Echo); तेज दर्द साथ हो तो तुरंत इमरजेंसी', textEn: 'Breathless on stairs — test heart capacity (2D echo); severe pain along = emergency room immediately' },
    { questionIndex: 13, text: 'सांस + लंबी खांसी + धूम्रपान — फेफड़े भी जांचें (स्पाइरोमेट्री), echo भी कराएं', textEn: 'Breathlessness plus chronic cough with smoking — test lungs (spirometry) as well as echo' },
    // CHE08 — idx 14
    { questionIndex: 14, text: 'पुरानी ECG रिपोर्ट अवश्य लाएं — नई ECG से तुलना होगी; आज दर्द हो तो तुरंत इमरजेंसी', textEn: 'Bring the old ECG report — it will be compared with a fresh ECG; chest pain today = emergency room immediately' },
    { questionIndex: 14, text: '6 महीने से पुरानी ECG — आज दोबारा ECG कराकर दिखाएं', textEn: 'ECG older than 6 months — repeat the ECG today for review' },
    // CHE08 — idx 15
    { questionIndex: 15, text: 'ECG के समय लक्षण थे — रिपोर्ट तुरंत डॉक्टर को दिखाएं; दर्द फिर आए तो इमरजेंसी', textEn: 'Symptoms were present during the ECG — show the report today; recurring pain = emergency room' },
    { questionIndex: 15, text: 'ECG लक्षण-मुक्त समय में हुई — सामान्य हो सकती है; बार-बार लक्षण हों तो TMT सोचें', textEn: 'ECG taken while free of symptoms — may be normal; if symptoms recur, consider a TMT' },
    // CHE09 — idx 16
    { questionIndex: 16, text: 'EF 40% से कम — दवा समीक्षा जरूरी; Echo रिपोर्ट अवश्य लाएं; सांस बढ़े तो तुरंत इमरजेंसी', textEn: 'EF below 40% — medication review needed; bring the echo report; worsening breathlessness = emergency room immediately' },
    { questionIndex: 16, text: 'EF सामान्य (50%+) — अच्छी खबर; आगे की योजना रिपोर्ट देखकर बनेगी', textEn: 'EF normal (50%+) — good news; the plan will be made after reviewing the report' },
    // CHE09 — idx 17
    { questionIndex: 17, text: 'रिपोर्ट में वाल्व/दिल की कमजोरी — Echo की तारीख नोट करें, 1 साल में दोहराएं; तेज सांस/दर्द = तुरंत इमरजेंसी', textEn: 'Valve or heart weakness in report — note the echo date, repeat in 1 year; severe breathlessness or pain = emergency room immediately' },
    { questionIndex: 17, text: 'रिपोर्ट सामान्य — लक्षणों का कारण और खोजें (ECG/TMT/Holter)', textEn: 'Report normal — search further for the cause of symptoms (ECG/TMT/Holter)' },
    // CHE10 — idx 18
    { questionIndex: 18, text: 'TMT पॉजिटिव — अगला कदम डॉक्टर से आज तय करें; दर्द हो तो तुरंत इमरजेंसी', textEn: 'TMT positive — decide the next step with the doctor today; chest pain = emergency room immediately' },
    { questionIndex: 18, text: 'TMT नेगेटिव लेकिन लक्षण जारी — Echo या Holter आगे सोचें', textEn: 'TMT negative but symptoms persist — consider echo or Holter next' },
    // CHE10 — idx 19
    { questionIndex: 19, text: 'TMT के दौरान दर्द/सांस आई — रिपोर्ट तुरंत दिखाएं; अभी भी दर्द हो तो तुरंत इमरजेंसी', textEn: 'Pain or breathlessness during the TMT — show the report now; ongoing pain = emergency room immediately' },
    { questionIndex: 19, text: 'TMT बिना लक्षण पूरा — काफी भरोसेमंद नतीजा; आगे वार्षिक निगरानी', textEn: 'TMT completed without symptoms — fairly reliable result; annual surveillance ahead' },
    // PAL01 — idx 20
    { questionIndex: 20, text: 'कुछ सेकंड की धड़कन — प्रायः निर्दोष; एक बार ECG जरूर कराएं; चक्कर/बेहोशी साथ हो तो तुरंत इमरजेंसी', textEn: 'Palpitations of a few seconds — usually benign; still do one ECG; giddiness or blackout with it = emergency room immediately' },
    { questionIndex: 20, text: 'मिनटों तक तेज धड़कन — ECG आज; दौरे के समय नाड़ी गिनकर नोट करें', textEn: 'Fast pounding for minutes — ECG today; count and note your pulse during episodes' },
    // PAL01 — idx 21
    { questionIndex: 21, text: 'धड़कन + बेहोशी — खतरनाक लय की आशंका: तुरंत इमरजेंसी जाएं', textEn: 'Palpitations with blackout — possible dangerous rhythm: emergency room immediately' },
    { questionIndex: 21, text: 'हल्का चक्कर — ECG + Hb/थायरॉइड (TSH) जांच कराएं', textEn: 'Mild giddiness — get ECG plus Hb and thyroid (TSH) tests' },
    // PAL02 — idx 22
    { questionIndex: 22, text: 'कभी-कभी छूटना — प्रायः सामान्य; चाय/कॉफी घटाएं; एक ECG कराकर दिखाएं', textEn: 'Occasional skipped beats — usually normal; reduce tea/coffee; get one ECG reviewed' },
    { questionIndex: 22, text: 'दिन में कई बार/बढ़ता हुआ — Holter जांच सोचें; चक्कर आए तो तुरंत डॉक्टर से मिलें', textEn: 'Frequent or increasing skipped beats — consider Holter; any giddiness = see the doctor promptly' },
    // PAL02 — idx 23
    { questionIndex: 23, text: 'कैफीन/धूम्रपान से बढ़ता है — आज से चाय-कॉफी घटाएं, धूम्रपान पूरी तरह बंद', textEn: 'Worse with caffeine or smoking — cut tea/coffee from today, stop smoking completely' },
    { questionIndex: 23, text: 'कोई ट्रिगर नहीं — Holter + TSH जांच कराएं', textEn: 'No trigger found — get Holter and TSH tests' },
    // PAL03 — idx 24
    { questionIndex: 24, text: 'अनियमित नाड़ी — AF हो सकता है: ECG आज कराएं; दिल में क्लॉट का खतरा — देर न करें', textEn: 'Irregular pulse — could be AF: ECG today; clot-in-heart risk — do not delay' },
    { questionIndex: 24, text: 'बार-बार अनियमित — ECG + 2D Echo; चक्कर या सांस के साथ हो तो तुरंत इमरजेंसी', textEn: 'Recurrent irregularity — ECG plus 2D echo; with giddiness or breathlessness = emergency room immediately' },
    // PAL03 — idx 25
    { questionIndex: 25, text: 'वारफेरिन चली है — INR रिकॉर्ड लाएं; खुराक का बदलाव केवल डॉक्टर करेंगे', textEn: 'Previously on warfarin — bring INR records; dose changes are made by the doctor only' },
    { questionIndex: 25, text: 'कभी खून पतली दवा नहीं — AF में जरूरी हो सकती है; आज ही सलाह लें', textEn: 'Never been on a blood thinner — it may be needed in AF; take advice today' },
    // PAL04 — idx 26
    { questionIndex: 26, text: 'अचानक शुरू/रुकने वाले दौरे — SVT संभावना: दौरे की ECG लाएं; चक्कर या सीने का दर्द साथ हो तो तुरंत इमरजेंसी', textEn: 'Abrupt on/off episodes — SVT possible: bring an ECG captured during an episode; giddiness or chest pain with it = emergency room immediately' },
    { questionIndex: 26, text: 'धीरे-धीरे तेज होती धड़कन — थायरॉइड (TSH), बुखार, एनीमिया जांचें', textEn: 'Gradually speeding palpitations — test thyroid (TSH), fever and anemia' },
    // PAL04 — idx 27
    { questionIndex: 27, text: 'नाड़ी 180+ — खतरनाक तेज लय: तुरंत इमरजेंसी जाएं', textEn: 'Pulse above 180 — dangerously fast rhythm: emergency room immediately' },
    { questionIndex: 27, text: 'नाड़ी 120 से कम — ECG + Holter की योजना बनाएं', textEn: 'Pulse under 120 — plan an ECG plus Holter' },
    // PAL05 — idx 28
    { questionIndex: 28, text: 'बिना चेतावनी की बेहोशी — दिल की लय की जांच जरूरी; दोबारा हो तो तुरंत इमरजेंसी', textEn: 'Blackout without warning — heart rhythm workup needed; recurrence = emergency room immediately' },
    { questionIndex: 28, text: 'चक्कर पहले आते हैं — तेज खड़े न हों; ECG + BP (बैठे/खड़े) जांच कराएं', textEn: 'Giddiness precedes faint — avoid standing up quickly; get ECG and sitting/standing BP checked' },
    // PAL05 — idx 29
    { questionIndex: 29, text: 'जीभ कटना/झटके — मिर्गी की जांच (न्यूरो रेफर); दिल की ECG भी कराएं', textEn: 'Tongue bite or jerks — epilepsy workup (neuro referral); also get a cardiac ECG' },
    { questionIndex: 29, text: 'बिना झटके की बेहोशी — ECG/Holter से दिल और नाड़ी जांचें', textEn: 'Blackout without jerks — evaluate heart and rhythm with ECG/Holter' },
    // PAL06 — idx 30
    { questionIndex: 30, text: 'खड़े होने पर अंधेरा — पानी/दवा का कारण देखें; गिरने से बचें, धीरे उठें', textEn: 'Blackouts on standing — check hydration and medicine effects; prevent falls, rise slowly' },
    { questionIndex: 30, text: 'बैठे-बैठे अंधेरा — ECG आज कराएं; दिल की लय की जांच जरूरी', textEn: 'Blackouts even while seated — ECG today; heart rhythm evaluation required' },
    // PAL06 — idx 31
    { questionIndex: 31, text: 'BP/दिल की दवा से चक्कर — खुराक बदलने से पहले डॉक्टर को बताएं; दवा अचानक बंद न करें', textEn: 'Giddiness from BP or heart medicine — inform the doctor before any dose change; never stop it abruptly' },
    { questionIndex: 31, text: 'दवा शुरू होने से पहले भी चक्कर — ECG/Holter जांच कराएं', textEn: 'Giddiness even before the medicine — get ECG/Holter evaluation' },
    // PAL07 — idx 32
    { questionIndex: 32, text: 'Holter रिपोर्ट अवश्य साथ लाएं — दिन/घंटे के हिसाब से लय देखी जाएगी', textEn: 'Bring the Holter report along — the rhythm will be reviewed hour by hour' },
    { questionIndex: 32, text: '48 घंटे+ का Holter — लय की पूरी तस्वीर मिलती है; रिपोर्ट पर योजना बनेगी', textEn: 'A 48-hour or longer Holter gives the full rhythm picture; the plan follows the report' },
    // PAL07 — idx 33
    { questionIndex: 33, text: 'रिपोर्ट में लय की गड़बड़ — दवा आज ही समीक्षा कराएं', textEn: 'Rhythm abnormality in the report — get medicines reviewed today' },
    { questionIndex: 33, text: 'रिपोर्ट सामान्य — धड़कन का कारण और खोजें (थायरॉइड/एनीमिया)', textEn: 'Report normal — look for other causes of palpitations (thyroid or anemia)' },
    // BPL01 — idx 34
    { questionIndex: 34, text: 'घर की सही तकनीक: 5 मिनट बैठकर, कफ हृदय के स्तर पर, सुबह-शाम 2-2 रीडिंग, 7 दिन का लॉग — तभी निदान होगा', textEn: 'Correct home technique: sit 5 minutes, cuff at heart level, 2 readings morning and evening, 7-day log — only then diagnose' },
    { questionIndex: 34, text: '180/110 से ऊंचा — तुरंत डॉक्टर से मिलें; सीने का दर्द/सांस साथ हो तो तुरंत इमरजेंसी', textEn: 'Above 180/110 — see a doctor promptly; chest pain or breathlessness along = emergency room immediately' },
    // BPL01 — idx 35
    { questionIndex: 35, text: 'बिना लक्षण का ऊंच BP — नजरअंदाज नहीं; 7 दिन का घर का लॉग लेकर आएं', textEn: 'High BP without symptoms — still not ignorable; return with a 7-day home log' },
    { questionIndex: 35, text: 'सिरदर्द/धुंधला दिखना + बहुत ऊंच BP — तुरंत इमरजेंसी जाएं', textEn: 'Headache or blurred vision with very high BP — emergency room immediately' },
    // BPL02 — idx 36
    { questionIndex: 36, text: 'दवा रोज एक निश्चित समय पर लें — एक भी खुराक न छोड़ें; लॉग के साथ खुराक समीक्षा कराएं', textEn: 'Take the medicine at a fixed time daily — do not skip doses; review the dose with your BP log' },
    { questionIndex: 36, text: 'दवा अपने मन से बंद की है — कारण डॉक्टर को बताएं; बंद करना खतरनाक है', textEn: 'Medicine stopped on your own — tell the doctor why; stopping it is dangerous' },
    // BPL02 — idx 37
    { questionIndex: 37, text: '14 दिन का लॉग लेकर आएं — सुबह-शाम 2 रीडिंग; नमक 5 ग्राम/दिन से कम रखें', textEn: 'Bring a 14-day log — 2 readings morning and evening; keep salt under 5 g per day' },
    { questionIndex: 37, text: 'लॉग नहीं है — आज से शुरू करें; पापड़-अचार-नमकीन-पैकेज सूप घटाएं', textEn: 'No log yet — start one today; cut down papad, pickles, namkeen and packaged soups' },
    // BPL03 — idx 38
    { questionIndex: 38, text: '6 महीने से पुराना BP — आज नापें; नाड़ी की दर और लय भी दर्ज कराएं', textEn: 'BP older than 6 months — measure today; also record pulse rate and rhythm' },
    { questionIndex: 38, text: 'पिछला BP सामान्य था — सालाना जांच जारी रखें; DASH आहार (फल, सब्जी, कम नमक) अपनाएं', textEn: 'Previous BP normal — continue yearly checks; adopt the DASH diet (fruits, vegetables, less salt)' },
    // BPL03 — idx 39
    { questionIndex: 39, text: 'नमक 5 ग्राम/दिन से कम + रोज 30 मिनट तेज चाल — BP घटता है', textEn: 'Salt under 5 g per day plus 30 minutes of brisk walking daily — lowers BP' },
    { questionIndex: 39, text: 'वजन का लक्ष्य BMI 25 से कम — कमर पुरुष 90 सेमी, महिला 80 सेमी से कम', textEn: 'Weight target BMI below 25 — waist under 90 cm for men and 80 cm for women' },
    // BPL04 — idx 40
    { questionIndex: 40, text: 'चक्कर + BP दवा — डॉक्टर को बताकर खुराक घटेगी; अपने मन से बंद न करें; उल्टी/दस्त में डॉक्टर से पूछकर दवा रोकें और सूचित करें', textEn: 'Giddiness with BP medicine — the dose will be reduced after informing the doctor; never stop on your own; hold the dose only after asking the doctor during vomiting or loose motions' },
    { questionIndex: 40, text: 'उठने से पहले पैरों को हिलाएं, किनारे पर बैठें, फिर धीरे उठें; पानी भरपूर लें', textEn: 'Move your legs before rising, sit on the edge, then stand slowly; drink plenty of water' },
    // BPL04 — idx 41
    { questionIndex: 41, text: 'उल्टी/दस्त या कम पानी — BP गिर सकती है: ORS लें और आज ही डॉक्टर को बताएं', textEn: 'Vomiting, loose motions or low fluids — BP can drop: take ORS and inform the doctor today' },
    { questionIndex: 41, text: 'भोजन-पानी सामान्य — फिर भी बैठे और खड़े दोनों BP दर्ज कराएं', textEn: 'Normal diet and fluids — still record both sitting and standing BP' },
    // BPL05 — idx 42
    { questionIndex: 42, text: 'बड़ा उतार-चढ़ाव — तकनीक जांचें: 5 मिनट आराम, कफ हृदय के स्तर पर, दोनों रीडिंग लिखें, बांह की जगह बदलकर देखें', textEn: 'Wide variation — check technique: rest 5 minutes, cuff at heart level, write both readings, try the other arm' },
    { questionIndex: 42, text: 'लगातार ऊंच-नीचे — 7 दिन का लॉग लेकर आएं; दवा रोज एक ही समय पर लें', textEn: 'Consistently erratic readings — return with a 7-day log; take medicine at the same time daily' },
    // BPL05 — idx 43
    { questionIndex: 43, text: 'दवा सुबह एक निश्चित समय पर — याद रखने के लिए फोन एलार्म लगाएं', textEn: 'Medicine at one fixed morning time — set a phone alarm as a reminder' },
    { questionIndex: 43, text: 'खुराक छूट रही है — डॉक्टर को बताएं; साथ ही नमक और व्यायाम की दिनचर्या जारी रखें', textEn: 'Doses being missed — tell the doctor; meanwhile keep up salt control and exercise routine' },
    // BPL06 — idx 44
    { questionIndex: 44, text: 'गर्भावस्था में ऊंच BP — OBG डॉक्टर से आज ही मिलें; यहां केवल संदर्भ होगा; सीने का दर्द/झटके हों तो तुरंत इमरजेंसी', textEn: 'High BP in pregnancy — meet the OBG doctor today; this clinic will only refer; chest pain or fits = emergency room immediately' },
    { questionIndex: 44, text: 'BP की दवा गर्भ में हर तरह से सुरक्षित नहीं — कौन सी जारी रखनी है, OBG ही तय करेंगे', textEn: 'BP medicines are not all safe in pregnancy — the OBG alone will decide which to continue' },
    // BPL06 — idx 45
    { questionIndex: 45, text: 'सूजन + सिरदर्द + ऊंच BP — प्री-एक्लेम्प्सिया का खतरा: आज ही OBG/इमरजेंसी', textEn: 'Swelling plus headache with high BP — pre-eclampsia risk: OBG or emergency room today' },
    { questionIndex: 45, text: 'बिना सूजन-सिरदर्द — फिर भी OBG की निगरानी अनिवार्य; BP रोज नापें', textEn: 'No swelling or headache — OBG monitoring is still essential; measure BP daily' },
    // BPL07 — idx 46
    { questionIndex: 46, text: 'नई दवा के बाद चक्कर — आज ही डॉक्टर को बताएं; दवा अचानक बंद करना खतरनाक है', textEn: 'Giddiness after a new medicine — inform the doctor today; stopping it abruptly is dangerous' },
    { questionIndex: 46, text: 'दवा शुरू से ही ऐसा करती है — खुराक की समीक्षा BP लॉग के साथ कराएं', textEn: 'This has happened since the medicine began — get the dose reviewed with your BP log' },
    // BPL07 — idx 47
    { questionIndex: 47, text: 'पसीना/उल्टी/दस्त के बाद चक्कर — ORS और पानी लें; डॉक्टर को सूचित करें, दवा रोकने की सलाह डॉक्टर से ही लें', textEn: 'Giddiness after sweating, vomiting or loose motions — take ORS and fluids; inform the doctor and hold medicine only on their advice' },
    { questionIndex: 47, text: 'बिना कारण के चक्कर — बैठे और खड़े दोनों BP नापकर लाएं', textEn: 'Giddiness without a cause — bring both sitting and standing BP readings' },
    // HRT01 — idx 48
    { questionIndex: 48, text: '500 मीटर से कम चलकर सांस — 2D Echo + ECG कराएं; सांस तेजी से बढ़े तो तुरंत इमरजेंसी', textEn: 'Breathless within 500 m of walking — get a 2D echo plus ECG; rapidly worsening breathlessness = emergency room immediately' },
    { questionIndex: 48, text: 'धीरे-धीरे कम हुई तीमता — दवा नियमित रखें और सुबह के वजन की डायरी शुरू करें', textEn: 'Capacity reduced gradually — keep medicines regular and start a morning weight diary' },
    // HRT01 — idx 49
    { questionIndex: 49, text: '3 से ज्यादा तकिये/बैठकर नींद — हार्ट फेल्योर का संकेत: डॉक्टर से तुरंत मिलें; रात में सांस बिगड़े तो तुरंत इमरजेंसी', textEn: 'More than 3 pillows or sleeping seated — heart failure sign: see the doctor promptly; night worsening = emergency room immediately' },
    { questionIndex: 49, text: '1-2 तकिये — सामान्य; निगरानी जारी रखें, वजन साप्ताहिक नोट करें', textEn: 'One or two pillows — normal; continue monitoring and note weight weekly' },
    // HRT02 — idx 50
    { questionIndex: 50, text: 'रात में सांस से उठना (PND) — डॉक्टर से तुरंत मिलें; बोलते ही हांफना/गला गला लगना हो तो तुरंत इमरजेंसी', textEn: 'Waking at night breathless (PND) — see the doctor promptly; gasping while speaking = emergency room immediately' },
    { questionIndex: 50, text: 'कभी-कभी होता है — सिर के नीचे तकिये ऊंचे, रात का खाना सोने से 2 घंटे पहले; वजन डायरी शुरू करें', textEn: 'Occurs occasionally — raise the head end with pillows, dinner 2 hours before bed; start a weight diary' },
    // HRT02 — idx 51
    { questionIndex: 51, text: 'बैठने से 5 मिनट में आराम — दिल का कारण पुष्ट होता है: उपचार योजना लेकर जल्द मिलें; बिगड़े तो तुरंत इमरजेंसी', textEn: 'Relief within 5 minutes of sitting — cardiac cause is supported: collect the treatment plan soon; deterioration = emergency room immediately' },
    { questionIndex: 51, text: 'आराम में लंबा समय लगता है — फेफड़ों की जांच भी कराएं (स्पाइरोमेट्री)', textEn: 'Relief takes long — also evaluate the lungs (spirometry)' },
    // HRT03 — idx 52
    { questionIndex: 52, text: 'शाम की सूजन — दिल/किडनी/नस जांच लाएं; 3 दिन में 2 किलो वजन बढ़े तो क्लिनिक को तुरंत कॉल करें', textEn: 'Evening swelling — bring heart, kidney and vein workup; call the clinic at once if weight rises 2 kg in 3 days' },
    { questionIndex: 52, text: 'सुबह भी सूजन रहती है — गहरी जांच कराएं (किडनी/थायरॉइड)', textEn: 'Swelling persists in the morning — get deeper workup (kidney or thyroid)' },
    // HRT03 — idx 53
    { questionIndex: 53, text: 'दोनों टखनों की सूजन — दिल/किडनी की जांच; नमक घटाएं, लंबे समय खड़े न रहें', textEn: 'Swelling in both ankles — heart and kidney workup; cut salt and avoid standing for long' },
    { questionIndex: 53, text: 'एक ही पैर की सूजन/दर्द — नस की जांच (डॉपलर) तुरंत कराएं', textEn: 'Swelling or pain in one leg — urgent vein evaluation (doppler)' },
    // HRT04 — idx 54
    { questionIndex: 54, text: '3 दिन में 2 किलो से ज्यादा वजन — पानी जमा रहा है: आज ही क्लिनिक आएं; सांस बिगड़े तो तुरंत इमरजेंसी', textEn: 'Weight up over 2 kg in 3 days — fluid is accumulating: visit the clinic today; worsening breathlessness = emergency room immediately' },
    { questionIndex: 54, text: 'धीरे-धीरे बढ़ा वजन — सुबह खाली पेट वजन डायरी रखें; तरल 1.5 लीटर/दिन पर सीमित करें', textEn: 'Gradual weight gain — keep a morning empty-stomach weight diary; restrict fluids to about 1.5 L per day' },
    // HRT04 — idx 55
    { questionIndex: 55, text: 'लेटने पर सांस बिगड़ना — हार्ट फेल्योर का बड़ा संकेत: उपचार तुरंत; गंभीर रात का दौरा = तुरंत इमरजेंसी', textEn: 'Breathlessness worse on lying flat — a major heart failure sign: treat now; severe night episode = emergency room immediately' },
    { questionIndex: 55, text: 'लेटने से फर्क नहीं पड़ता — फेफड़ों का कारण भी जांचें', textEn: 'No change on lying down — evaluate a lung cause too' },
    // HRT05 — idx 56
    { questionIndex: 56, text: 'पुराना दिल रोग — दवाओं की सूची और पुरानी रिपोर्ट साथ लाएं; बुखार शुरू हो तो तुरंत बताएं', textEn: 'Known heart disease — bring the medicine list and old reports; report any new fever at once' },
    { questionIndex: 56, text: 'निदान याद नहीं — पिछले अस्पताल से रिकॉर्ड मंगाकर अपनी फाइल बनवाएं', textEn: 'Diagnosis forgotten — obtain past hospital records and build your file' },
    // HRT05 — idx 57
    { questionIndex: 57, text: 'दवाएं छूट रही हैं — एलार्म और साप्ताहिक पत्ती (pill organizer) अपनाएं; कौन सी छूटी, डॉक्टर को बताएं', textEn: 'Medicines being missed — use alarms and a weekly pill organizer; tell the doctor which ones were missed' },
    { questionIndex: 57, text: 'दवाएं नियमित — बढ़िया; BP और सुबह के वजन का रिकॉर्ड जारी रखें', textEn: 'Medicines regular — good; continue BP and morning weight records' },
    // HRT06 — idx 58
    { questionIndex: 58, text: 'परिवार में पुरुष 55 से पहले/महिला 65 से पहले दिल का दौरा — आपकी स्क्रीनिंग जरूरी: आज BP, शुगर, कोलेस्ट्रॉल कराएं', textEn: 'Family heart attack before 55 in men or 65 in women — your screening is due: BP, sugar and cholesterol today' },
    { questionIndex: 58, text: 'बुढ़ापे में परिवार में दिल रोग — सालाना जांच पर्याप्त; धूम्रपान न हो तो जोखिम और कम', textEn: 'Family heart disease only in old age — yearly checks suffice; risk is lower still without smoking' },
    // HRT06 — idx 59
    { questionIndex: 59, text: 'कभी जांच नहीं हुई — आज स्क्रीनिंग कराएं: BP, रैंडम शुगर, लिपिड प्रोफाइल; परिवार के अन्य लोगों की भी जांच कराएं', textEn: 'Never tested — get screened today: BP, random sugar, lipid profile; get other family members tested too' },
    { questionIndex: 59, text: 'पहले जांच हुई — रिपोर्ट साथ लाएं और नाप दोहराएं', textEn: 'Tested before — bring the report and repeat the measurements' },
    // HRT07 — idx 60
    { questionIndex: 60, text: 'हाल का हार्ट अटैक (1 महीने से कम) — दवाएं जारी रखें; सीने का दर्द लौटे तो तुरंत इमरजेंसी', textEn: 'Recent heart attack (under 1 month) — continue all medicines; returning chest pain = emergency room immediately' },
    { questionIndex: 60, text: 'पुराना हार्ट अटैक — ECG और Echo रिकॉर्ड साथ लाएं; वार्षिक समीक्षा कराएं', textEn: 'Old heart attack — bring ECG and echo records; get annual review' },
    // HRT07 — idx 61
    { questionIndex: 61, text: 'खून पतली दवा + स्टैटिन जारी रखें — बिना सलाह बंद नहीं; काला मल आए तो तुरंत इमरजेंसी; दवा के साथ पेट की सुरक्षा (Pan-वर्ग) जोड़ी जा सकती है', textEn: 'Continue blood thinner and statin — never stop without advice; black stools = emergency room immediately; gastric protection (Pan-type) can be co-prescribed' },
    { questionIndex: 61, text: 'दवा अधूरी चल रही — आज पूरी सूची डॉक्टर को दिखाएं', textEn: 'Medicines incomplete — show the full list to the doctor today' },
    // HRT08 — idx 62
    { questionIndex: 62, text: 'नया स्टेंट (1 महीने से कम) — दोनों खून पतली दवाएं अनिवार्य; दर्द लौटे तो तुरंत इमरजेंसी', textEn: 'Recent stent (under 1 month) — both blood thinners are mandatory; returning pain = emergency room immediately' },
    { questionIndex: 62, text: 'स्टेंट 6 महीने से ज्यादा पुराना — दवा समीक्षा डॉक्टर से कराएं, खुद कम न करें', textEn: 'Stent older than 6 months — get the medicine reviewed by the doctor; do not reduce it yourself' },
    // HRT08 — idx 63
    { questionIndex: 63, text: 'दोनों दवाएं जारी — दांत/निकालने के इलाज से पहले डॉक्टर और दांत-डॉक्टर दोनों को बताएं; काला मल = तुरंत इमरजेंसी', textEn: 'Both thinners running — inform the doctor and dentist before dental or extraction work; black stools = emergency room immediately' },
    { questionIndex: 63, text: 'एक दवा बंद की है — कब और क्यों, आज बताएं; स्टेंट के बाद बंद करना खतरनाक है', textEn: 'One medicine stopped — say when and why today; stopping after a stent is dangerous' },
    // HRT09 — idx 64
    { questionIndex: 64, text: 'बायपास के बाद दवा-सेट जारी रखें — एस्पिरिन और स्टैटिन बिना सलाह न रोकें', textEn: 'After bypass keep the medicine set going — aspirin and statin are never stopped without advice' },
    { questionIndex: 64, text: 'सर्जरी 1 साल से ज्यादा पुरानी — सालाना ECG और 2D Echo कराते रहें', textEn: 'Surgery over 1 year old — keep annual ECG and 2D echo' },
    // HRT09 — idx 65
    { questionIndex: 65, text: 'घाव से पानी/लालिमा/दर्द — जल्द दिखाएं; बुखार साथ हो तो तुरंत इमरजेंसी', textEn: 'Wound discharge, redness or pain — show it soon; fever along = emergency room immediately' },
    { questionIndex: 65, text: 'घाव सूख गया, दर्द नहीं — सामान्य रिकवरी; टांके की स्थिति दिखाते रहें', textEn: 'Wound dry and painless — normal recovery; keep showing the scar status' },
    // HRT10 — idx 66
    { questionIndex: 66, text: 'RHD — हर साल 2D Echo; गले का संक्रमण हो तो तुरंत इलाज; दांत के इलाज से पहले डॉक्टर को बताएं', textEn: 'RHD — yearly 2D echo; treat any sore throat promptly; inform the doctor before dental work' },
    { questionIndex: 66, text: 'वाल्व की गंभीरता लिखित रिपोर्ट लाएं — अगली echo तिथि नोट करें', textEn: 'Bring the written valve severity report — note the next echo date' },
    // HRT10 — idx 67
    { questionIndex: 67, text: 'बचपन का आमवात — भाई-बहन की भी जांच कराएं; गले की खराश पर जल्द इलाज', textEn: 'Childhood rheumatic fever — get siblings screened too; treat sore throat early' },
    { questionIndex: 67, text: 'कोई इतिहास नहीं — वाल्व का कारण और जांचें जाएंगे (degeneration/अन्य)', textEn: 'No such history — other valve causes (degeneration or others) will be evaluated' },
    // HRT11 — idx 68
    { questionIndex: 68, text: 'तेज (severe) वाल्व रोग — सालाना Echo + लक्षण डायरी; मेहनत पर सांस बढ़े तो जल्द मिलें', textEn: 'Severe valve disease — yearly echo plus symptom diary; increasing exertional breathlessness = early review' },
    { questionIndex: 68, text: 'हल्का वाल्व रोग — 1-2 साल में Echo दोहराएं; दंत इलाज से पहले बताएं', textEn: 'Mild valve disease — repeat echo in 1-2 years; declare it before dental procedures' },
    // HRT11 — idx 69
    { questionIndex: 69, text: 'लक्षण बढ़े हैं — नई Echo कराएं; रात की सांस या सीने का दर्द हो तो तुरंत इमरजेंसी', textEn: 'Symptoms increased — get a fresh echo; night breathlessness or chest pain = emergency room immediately' },
    { questionIndex: 69, text: 'लक्षण स्थिर — निगरानी जारी रखें, दवा नियमित रखें', textEn: 'Symptoms stable — continue surveillance and keep medicines regular' },
    // HRT12 — idx 70
    { questionIndex: 70, text: 'बच्चे का वजन ग्रोथ-चार्ट पर दर्ज करें — प्रतिमाह नोट करें; पोषण सलाह लें', textEn: 'Plot the child weight on a growth chart — note it monthly; take nutrition advice' },
    { questionIndex: 70, text: 'वजन उम्र के अनुसार सामान्य — बढ़िया; नियमित बाल-हृदय फॉलो-अप जारी रखें', textEn: 'Weight appropriate for age — good; continue regular pediatric-cardiology follow-up' },
    // HRT12 — idx 71
    { questionIndex: 71, text: 'खिलाते समय पसीना/सांस फूलना — जन्मजात दिल रोग का संकेत: आज ही बाल-हृदय रेफर कराएं', textEn: 'Sweating or breathlessness while feeding — a congenital heart disease sign: get pediatric cardiology referral today' },
    { questionIndex: 71, text: 'खिलाना सामान्य — ग्रोथ चार्ट और प्रतिमाह वजन नोट जारी रखें', textEn: 'Feeding normal — continue the growth chart and monthly weight notes' },
    // HRT13 — idx 72
    { questionIndex: 72, text: 'पेसमेकर सावधानियां: MRI नहीं, तेज चुंबक से दूर रहें, एयरपोर्ट सिक्योरिटी में हैंड-चेक की जरूरत बताएं; 6-12 महीने में जांच', textEn: 'Pacemaker precautions: no MRI, avoid strong magnets, request hand-check at airport security; device check every 6-12 months' },
    { questionIndex: 72, text: 'बैटरी 5 साल से ज्यादा पुरानी — चेक-अप जल्द बुक कराएं', textEn: 'Battery older than 5 years — book the device check soon' },
    // HRT13 — idx 73
    { questionIndex: 73, text: 'चक्कर/धीमी धड़कन वापस आई — पेसमेकर जांच आज कराएं; बेहोशी हो तो तुरंत इमरजेंसी', textEn: 'Giddiness or slow pulse returned — get the pacemaker checked today; blackout = emergency room immediately' },
    { questionIndex: 73, text: 'लक्षण नहीं — सामान्य; नाड़ी साप्ताहिक गिनकर नोट करें', textEn: 'No symptoms — normal; count and note the pulse weekly' },
    // LIP01 — idx 74
    { questionIndex: 74, text: 'LDL 190 से ऊंचा या TG 500 से ऊंचा — आज ही डॉक्टर से मिलें; दवा + आहार योजना तुरंत बनेगी', textEn: 'LDL above 190 or TG above 500 — see the doctor today; medicine plus diet plan will be made at once' },
    { questionIndex: 74, text: 'हल्का बढ़ा हुआ — 3 महीने आहार सुधार + रोज 30 मिनट तेज चाल, फिर जांच दोहराएं; स्टैटिन चले तो मांसपेशी का दर्द तुरंत बताएं', textEn: 'Mildly raised — 3 months of diet change plus 30 minutes brisk walk daily, then retest; if on a statin, report muscle pain immediately' },
    // LIP01 — idx 75
    { questionIndex: 75, text: 'परिवार में उच्च कोलेस्ट्रॉल/जल्दी दिल रोग — भाई-बहन और 20 साल से ऊपर बच्चों की भी जांच कराएं', textEn: 'Family high cholesterol or early heart disease — get siblings and children over 20 tested too' },
    { questionIndex: 75, text: 'कोई पारिवारिक इतिहास नहीं — DASH आहार + रोज व्यायाम; सालाना लिपिड जांच', textEn: 'No family history — DASH diet plus daily exercise; yearly lipid test' },
    // LIP02 — idx 76
    { questionIndex: 76, text: 'शुगर + कोलेस्ट्रॉल — दिल का जोखिम दोगुना: HbA1c 7 से नीचे लक्ष्य रखें; दवाएं नियमित चलाएं', textEn: 'Sugar plus cholesterol — double cardiac risk: target HbA1c under 7; keep medicines regular' },
    { questionIndex: 76, text: 'शुगर नियंत्रित — बढ़िया; आंखों, गुर्दे की सालाना जांच जारी रखें', textEn: 'Sugar controlled — good; continue yearly eye and kidney checks' },
    // LIP02 — idx 77
    { questionIndex: 77, text: 'कमर पुरुष 90 सेमी, महिला 80 सेमी से कम लक्ष्य; BMI 25 से नीचे; 5-10% वजन घटाने से कोलेस्ट्रॉल और शुगर दोनों सुधरते हैं', textEn: 'Target waist under 90 cm for men and 80 cm for women; BMI below 25; losing 5-10% weight improves both cholesterol and sugar' },
    { questionIndex: 77, text: 'वजन सामान्य — दिनचर्या जारी रखें; लिपिड और HbA1c सालाना दोहराएं', textEn: 'Weight normal — keep the routine going; repeat lipid and HbA1c yearly' },
    // OTH01 — idx 78
    { questionIndex: 78, text: '200 मीटर चलकर पैर में दर्द — पैर की नस जांच जरूरी (वैस्कुलर रेफर); धूम्रपान आज ही बंद करें', textEn: 'Leg pain after 200 m of walking — leg artery workup needed (vascular referral); stop smoking TODAY' },
    { questionIndex: 78, text: 'दर्द रुकने पर ठीक — क्लॉडिकेशन पैटर्न: वैस्कुलर डॉपलर कराएं', textEn: 'Pain settles on stopping — claudication pattern: get a vascular doppler' },
    // OTH01 — idx 79
    { questionIndex: 79, text: 'रुककर खड़े रहने से आराम — नसों की बाधा की पुष्टि: वैस्कुलर से मिलें; पैर पर घाव/नीलापन नोट करें', textEn: 'Relief on standing still — artery block is confirmed: see vascular; note any foot ulcers or blueness' },
    { questionIndex: 79, text: 'रुकने पर भी दर्द बना रहता है — रीढ़ या जोड़ का कारण भी देखें', textEn: 'Pain persists even on standing — also evaluate spine or joint causes' },
    // OTH02 — idx 80
    { questionIndex: 80, text: 'रोने/मेहनत पर नीलेपन — जन्मजात दिल रोग संभावना: बाल-हृदय विशेषज्ञ से तुरंत मिलें', textEn: 'Blueness on crying or exertion — congenital heart disease likely: see pediatric cardiology promptly' },
    { questionIndex: 80, text: 'हमेशा नीले होंठ/उंगलियां — गंभीर संकेत: आज ही इमरजेंसी या विशेषज्ञ रेफर', textEn: 'Lips or fingers always blue — serious sign: emergency room today or specialist referral' },
    // OTH02 — idx 81
    { questionIndex: 81, text: 'नीलेपन + सांस फूलना — तुरंत इमरजेंसी जाएं', textEn: 'Blueness with breathlessness — go to the emergency room immediately' },
    { questionIndex: 81, text: 'बिना सांस/चक्कर — फिर भी जल्द Echo कराएं', textEn: 'No breathlessness or giddiness — still get an echo soon' },
    // OTH03 — idx 82
    { questionIndex: 82, text: '10-15 मिनट से कम में थककर छोड़ देता है — दिल की जांच (बाल-हृदय) जरूरी; वजन गिर रहा हो तो और जल्दी', textEn: 'Tires out in under 10-15 minutes of feeding — cardiac evaluation (pediatric cardiology) needed; even sooner if weight is falling' },
    { questionIndex: 82, text: 'अच्छी तरह दूध पीता है — ग्रोथ चार्ट प्रतिमाह नोट करते रहें', textEn: 'Feeds well — keep plotting the growth chart monthly' },
    // OTH03 — idx 83
    { questionIndex: 83, text: 'वजन स्थिर या गिर रहा है — आज ही बाल-हृदय रेफर कराएं', textEn: 'Weight static or falling — arrange pediatric cardiology referral today' },
    { questionIndex: 83, text: 'वजन उम्र के अनुसार बढ़ रहा — चिंता कम; निगरानी जारी रखें', textEn: 'Weight gaining as per age — less worry; continue monitoring' },
    // OTH04 — idx 84
    { questionIndex: 84, text: 'डायलिसिस + दिल रोग — दोनों डॉक्टरों को एक ही दवा सूची दिखाएं; पोटैशियम (K+) रिपोर्ट साथ लाएं', textEn: 'Dialysis plus heart disease — show the same medicine list to both doctors; bring the potassium (K+) report' },
    { questionIndex: 84, text: 'क्रिएटिनिन बढ़ा हुआ — BP दवा की समीक्षा जरूरी; कुछ BP दवाएं गुर्दे की निगरानी मांगती हैं', textEn: 'Creatinine raised — BP medicine review is needed; some BP medicines require kidney monitoring' },
    // OTH04 — idx 85
    { questionIndex: 85, text: 'सूजन/सांस बढ़ी है — आज क्लिनिक आएं; तेजी से बिगड़े तो तुरंत इमरजेंसी; तरल सीमित रखें', textEn: 'Swelling or breathlessness increased — visit the clinic today; rapid worsening = emergency room immediately; restrict fluids' },
    { questionIndex: 85, text: 'स्थिर है — गुर्दा (नेफ्रो) और हृदय दोनों फॉलो-अप जारी रखें', textEn: 'Stable — continue both nephrology and cardiology follow-ups' },
    // OTH05 — idx 86
    { questionIndex: 86, text: 'वाल्व रोग के साथ बुखार — इंडोकार्डाइटिस का खतरा: आज ही रिपोर्ट करें; खुद एंटीबायोटिक शुरू न करें (पहले खून कल्चर)', textEn: 'Fever with valve disease — endocarditis risk: report today; do not self-start antibiotics (blood culture comes first)' },
    { questionIndex: 86, text: '2-3 दिन का हल्का बुखार — पैराटामोल से बुखार संभालें; 3 दिन से ज्यादा रहे तो डॉक्टर से मिलें; NSAID न लें', textEn: 'Mild fever of 2-3 days — manage with paracetamol; see the doctor if it exceeds 3 days; avoid NSAIDs' },
    // OTH05 — idx 87
    { questionIndex: 87, text: 'ठंड लगना + रात का पसीना — इंडोकार्डाइटिस निकालें: आज ही पूरी जांच, भर्ती हो सकती है', textEn: 'Chills plus night sweats — rule out endocarditis: full workup today, admission may be needed' },
    { questionIndex: 87, text: 'बिना ठंड/पसीना — फिर भी वाल्व रोग में बुखार कभी नजरअंदाज न करें', textEn: 'No chills or sweats — still never ignore fever in valve disease' },
    // OTH06 — idx 88
    { questionIndex: 88, text: 'काला/चिपचिपा मल या खून की उल्टी — खून पतली दवा से रक्तस्राव: अभी इमरजेंसी जाएं (108)', textEn: 'Black tarry stools or blood in vomit — bleeding from the blood thinner: emergency room NOW (108)' },
    { questionIndex: 88, text: 'मल सामान्य है — जलन में Pan-वर्ग की पेट सुरक्षा दवा डॉक्टर की सलाह से जोड़ी जा सकती है; खून पतली दवा जारी रखें', textEn: 'Stools normal — a Pan-type gastric protection can be added on advice for the burning; continue the blood thinner' },
    // OTH06 — idx 89
    { questionIndex: 89, text: 'जलन शुरू होते ही डॉक्टर को बताएं — खून पतली दवा के साथ पेट की सुरक्षा दवा आमतौर पर जोड़ी जाती है; खुद बंद न करें', textEn: 'Report the burning as soon as it starts — gastric protection is usually added alongside blood thinners; never stop the thinner yourself' },
    { questionIndex: 89, text: 'दवा बदलने की जरूरत — डॉक्टर तय करेंगे; स्टेंट के बाद खून पतली दवा तुरंत बंद करना खतरनाक है', textEn: 'Medicine change if needed — the doctor decides; stopping a blood thinner suddenly after a stent is dangerous' },
  ],

  // ══ Labels — vitals (12) ═══════════════════════════════════════════════
  labels: [
    { label: 'ब्लड प्रेशर (बैठे हुए)', labelEn: 'BP (Sitting)', unit: 'mmHg' },
    { label: 'ब्लड प्रेशर (खड़े हुए)', labelEn: 'BP (Standing)', unit: 'mmHg' },
    { label: 'नाड़ी दर', labelEn: 'Pulse Rate', unit: '/min' },
    { label: 'नाड़ी लय', labelEn: 'Pulse Rhythm', unit: 'Reg/Irreg' },
    { label: 'JVP (गर्दन की नस दबाव)', labelEn: 'JVP', unit: 'cm' },
    { label: 'हृदय गति', labelEn: 'Heart Rate', unit: '/min' },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'दैनिक वजन (सुबह)', labelEn: 'Daily Weight (morning)', unit: 'kg' },
    { label: 'कमर परिधि', labelEn: 'Waist Circumference', unit: 'cm' },
    { label: 'दर्द स्कोर', labelEn: 'Pain Score', unit: '/10' },
    { label: 'पिछली ECG तिथि', labelEn: 'Previous ECG Date', unit: '', showUnit: false },
  ],

  // ══ Findings (38: 26 managed + 12 refer-only with ZERO findingMeds) ═══
  findings: [
    // Managed / follow-up findings
    { key: 'HTN-NEW', name: 'उच्च रक्तचाप (नया पता चला)', nameEn: 'Essential Hypertension (newly detected)', icd10: 'I10' },
    { key: 'HTN-HD', name: 'उच्च रक्तचाप — हृदय रोग सहित', nameEn: 'Hypertensive Heart Disease (with renal strain)', icd10: 'I11.0' },
    { key: 'ANG-STABLE', name: 'स्थिर एंजाइना', nameEn: 'Stable Angina Pectoris', icd10: 'I20.9' },
    { key: 'ASHD', name: 'धमनीकाठिन्य हृदय रोग (ASHD)', nameEn: 'Atherosclerotic Heart Disease', icd10: 'I25.10' },
    { key: 'HF-MILD', name: 'हृदय विफलता (हल्की, नियंत्रित)', nameEn: 'Heart Failure (mild, managed)', icd10: 'I50.9' },
    { key: 'AF-FU', name: 'अलिंद कंपन (AF) — रेट/रिदम + एंटीकोआगुलेशन समीक्षा', nameEn: 'Atrial Fibrillation — rate/rhythm + anticoagulation REVIEW', icd10: 'I48.91' },
    { key: 'ARRHY-NOS', name: 'अतालता (अन्य)', nameEn: 'Cardiac Arrhythmia NOS', icd10: 'I49.9' },
    { key: 'CHESTPAIN-MSK', name: 'छाती दर्द — मांसपेशी/पसली (भेद करके)', nameEn: 'Chest Pain NOS (musculoskeletal differentiation)', icd10: 'R07.4' },
    { key: 'CHESTPAIN-ATYP', name: 'असामान्य छाती दर्द', nameEn: 'Atypical Chest Pain', icd10: 'R07.89' },
    { key: 'HYPERLIP', name: 'डिसलिपिडेमिया (मिश्रित)', nameEn: 'Hyperlipidemia (mixed)', icd10: 'E78.5' },
    { key: 'HYPERCHOL', name: 'शुद्ध उच्च कोलेस्ट्रॉल', nameEn: 'Pure Hypercholesterolemia', icd10: 'E78.0' },
    { key: 'HYPOTN', name: 'कम रक्तचाप', nameEn: 'Hypotension', icd10: 'I95.9' },
    { key: 'SYNCOPE', name: 'बेहोशी (जांच की जा रही)', nameEn: 'Syncope (workup)', icd10: 'R55' },
    { key: 'DIZZ', name: 'चक्कर / चक्कर खाना', nameEn: 'Dizziness', icd10: 'R42' },
    { key: 'SOB-CARD', name: 'सांस फूलना (हृदय-संबंधी)', nameEn: 'Shortness of Breath (cardiac)', icd10: 'R06.02' },
    { key: 'EDEMA', name: 'टखनों की सूजन', nameEn: 'Edema (ankles)', icd10: 'R60.0' },
    { key: 'RHD-FU', name: 'रूमेटिक हृदय रोग (फॉलो-अप)', nameEn: 'Rheumatic Heart Disease follow-up', icd10: 'I09.9' },
    { key: 'POST-CABG', name: 'बायपास सर्जरी के बाद (स्थिति)', nameEn: 'Post-CABG status', icd10: 'Z95.1' },
    { key: 'POST-PCI', name: 'स्टेंट/एंजियोप्लास्टी के बाद (स्थिति)', nameEn: 'Post-angioplasty stent status', icd10: 'Z95.5' },
    { key: 'PM-STATUS', name: 'पेसमेकर लगा हुआ (स्थिति)', nameEn: 'Pacemaker status', icd10: 'Z95.0' },
    { key: 'OBESITY-CR', name: 'मोटापा (हृदय जोखिम)', nameEn: 'Obesity (cardiac risk)', icd10: 'E66.9' },
    { key: 'DM-ASCVD', name: 'शुगर + हृदय धमनी रोग (सह-रोग)', nameEn: 'Comorbid Diabetes with ASCVD', icd10: 'E11.9 + I25.10' },
    { key: 'CLAUD-SUSPECT', name: 'चलने पर पैर दर्द — क्लॉडिकेशन संदिग्ध (वैस्कुलर रेफर)', nameEn: 'Claudication suspect (refer vascular)', icd10: 'I73.9' },
    { key: 'TACHY', name: 'तेज धड़कन (अन्य)', nameEn: 'Tachycardia NOS', icd10: 'R00.0' },
    { key: 'BRADY', name: 'धीमी धड़कन (लक्षण हों तो रेफर)', nameEn: 'Bradycardia NOS (refer if symptomatic)', icd10: 'R00.1' },
    { key: 'CHD-CHILD', name: 'जन्मजात हृदय रोग (बच्चा, फॉलो-अप)', nameEn: 'Congenital Heart Disease follow-up (child)', icd10: 'Q21.9' },
    // REFER-ONLY findings — ZERO findingMeds links below (by design)
    { key: 'PRE-ECLAMPSIA-HTN', name: 'गर्भकालीन उच्च BP — केवल OBG रेफर (यहां इलाज नहीं)', nameEn: 'Pregnancy-related HTN (refer OBG — never treat here)', icd10: 'O13' },
    { key: 'ACS-SUSPECT', name: 'संदिग्ध एक्यूट कोरोनरी सिंड्रोम — तुरंत इमरजेंसी भेजें', nameEn: 'Suspected ACS — REFER TO EMERGENCY NOW', icd10: 'I21.9' },
    { key: 'UNSTABLE-ANG-SUSPECT', name: 'संदिग्ध अस्थिर एंजाइना — इमरजेंसी भेजें', nameEn: 'Suspected Unstable Angina — REFER TO EMERGENCY', icd10: 'I20.0' },
    { key: 'AORTIC-DISSECTION-SUSPECT', name: 'संदिग्ध महाधमनी फटन (चीरने वाला दर्द) — इमरजेंसी CT', nameEn: 'Suspected Aortic Dissection (tearing pain) — emergency CT', icd10: 'I71.0' },
    { key: 'TAMPONADE-SUSPECT', name: 'संदिग्ध हृदय-आवरण दबाव (टैम्पोनेड) — इमरजेंसी', nameEn: 'Suspected Cardiac Tamponade — REFER TO EMERGENCY', icd10: 'I31.3' },
    { key: 'INFECTIVE-ENDOCARDITIS-SUSPECT', name: 'संदिग्ध इंफेक्टिव एंडोकार्डाइटिस (बुखार + मर्मर) — भर्ती कराएं', nameEn: 'Suspected Infective Endocarditis (fever + murmur) — ADMIT', icd10: 'I33.0' },
    { key: 'ACUTE-PULMONARY-EDEMA', name: 'तीव्र फुफ्फुसीय शोथ (पानी भरना) — इमरजेंसी', nameEn: 'Acute Pulmonary Edema — REFER TO EMERGENCY', icd10: 'I50.1' },
    { key: 'VT-SUSPECT', name: 'संदिग्ध वेंट्रिकुलर टैकीकार्डिया — इमरजेंसी रेफर', nameEn: 'Suspected Ventricular Tachycardia — emergency referral', icd10: 'I47.2' },
    { key: 'SEVERE-BRADY-MOBITZ', name: 'गंभीर धीमी लय (Mobitz ब्लॉक) — पेसमेकर रेफर', nameEn: 'Severe bradycardia with Mobitz block — pacemaker referral', icd10: 'I44.1' },
    { key: 'HOCM-SUSPECT', name: 'संदिग्ध HOCM — Echo रेफर', nameEn: 'Suspected HOCM — refer for echo', icd10: 'I42.1' },
    { key: 'PERICARDITIS-SUSPECT', name: 'संदिग्ध पेरिकार्डाइटिस — Echo रेफर, दर्द में केवल साधारण इलाज', nameEn: 'Suspected Pericarditis — echo referral, plain analgesia only SOS', icd10: 'I30.9' },
    { key: 'MASSIVE-PE-SUSPECT', name: 'संदिग्ध बड़ा फेफड़ा-रक्त का थक्का — इमरजेंसी', nameEn: 'Suspected Massive PE — REFER TO EMERGENCY', icd10: 'I26.0' },
  ],

  // ══ Medicines (60) — India cardiology core, tier-2/3 brands ═══════════
  // morning/afternoon/evening = default units at that slot; tab = ~1-month
  // dispense for chronic, ~1-2 weeks for SOS/symptom relief.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // ── Antihypertensives: CCB
    { name: 'Amlong 5 Tablet', salt: 'Amlodipine 5 mg — ankle swelling or headache possible; report if marked', doseOptions: ['1 tab after breakfast × 30 days', '1 tab after breakfast × 15 days then review'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlong 10 Tablet', salt: 'Amlodipine 10 mg — ankle swelling possible; step-up dose', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlopres 5 Tablet', salt: 'Amlodipine 5 mg — ankle swelling possible', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cilacar 5 Tablet', salt: 'Cilnidipine 5 mg — kidney-protective profile; no reflex tachycardia', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cilacar 10 Tablet', salt: 'Cilnidipine 10 mg — step-up dose', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antihypertensives: ARB (K+ monitoring; STOP if pregnant)
    { name: 'Telma 40 Tablet', salt: 'Telmisartan 40 mg — monitor K+/creatinine; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Losar 25 Tablet', salt: 'Losartan 25 mg — monitor K+; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Losar 50 Tablet', salt: 'Losartan 50 mg — monitor K+; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Olmesar 20 Tablet', salt: 'Olmesartan 20 mg — monitor K+; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antihypertensives: fixed-dose combos
    { name: 'Telma AM Tablet', salt: 'Telmisartan 40 mg + Amlodipine 5 mg — K+ monitoring; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Telma H Tablet', salt: 'Telmisartan 40 mg + Hydrochlorothiazide 12.5 mg — K+ monitoring; hold and inform doctor during vomiting/loose motions; STOP if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cilacar T Tablet', salt: 'Telmisartan 40 mg + Cilnidipine 10 mg — K+ monitoring; STOP immediately if pregnant', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antihypertensives: beta-blockers (never stop abruptly)
    { name: 'Metolar XR 25 Tablet', salt: 'Metoprolol succinate ER 25 mg — NEVER stop abruptly; caution in asthma; report severe fatigue', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metolar XR 50 Tablet', salt: 'Metoprolol succinate ER 50 mg — NEVER stop abruptly; report severe fatigue or night breathlessness', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Aten 25 Tablet', salt: 'Atenolol 25 mg — not for new starts in pregnancy', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nebicard 2.5 Tablet', salt: 'Nebivolol 2.5 mg — gentle on sexual function; never stop abruptly', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nebicard 5 Tablet', salt: 'Nebivolol 5 mg — never stop abruptly', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Concor 5 Tablet', salt: 'Bisoprolol fumarate 5 mg — never stop abruptly; avoid verapamil combination', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antihypertensives: alpha-blocker
    { name: 'Minipress XL 2.5 Tablet', salt: 'Prazosin 2.5 mg extended release — FIRST-DOSE FAINTNESS: take at bedtime; driving/falls caution', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antianginal: nitrates (FATAL with Sildenafil/Tadalafil)
    { name: 'Sorbitrate 5 Tablet', salt: 'Isosorbide dinitrate 5 mg SUBLINGUAL — ⚠ FATAL with Sildenafil/Tadalafil; headache common; keep tablets dry in original bottle', doseOptions: ['1 tab sublingual SOS for chest heaviness (max 3/day)', '1 tab sublingual SOS, may repeat once after 5 minutes'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sorbitrate 10 Tablet', salt: 'Isosorbide dinitrate 10 mg — ⚠ FATAL with Sildenafil/Tadalafil; take seated; headache common', doseOptions: ['1 tab after breakfast × 30 days', '1 tab twice daily × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nitrocontin 2.6 Tablet', salt: 'Nitroglycerin SR 2.6 mg — ⚠ FATAL with Sildenafil/Tadalafil', doseOptions: ['1 tab after breakfast × 30 days', '1 tab twice daily × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Monotrate 10 Tablet', salt: 'Isosorbide mononitrate 10 mg — ⚠ FATAL with Sildenafil/Tadalafil', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Monotrate 20 Tablet', salt: 'Isosorbide mononitrate 20 mg — ⚠ FATAL with Sildenafil/Tadalafil', doseOptions: ['1 tab after breakfast × 30 days', '1 tab twice daily × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ivabrad 5 Tablet', salt: 'Ivabradine 5 mg — specialist line for sinus-rhythm angina; report visual brightness/blur', doseOptions: ['1 tab twice daily × 30 days'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Antiplatelets (bleeding watch + inform dentist)
    { name: 'Ecosprin 75 Tablet', salt: 'Aspirin 75 mg enteric-coated — bleeding watch: black/tarry stool = ER; inform dentist before extraction; take after food', doseOptions: ['1 tab after lunch × 30 days', '1 tab after breakfast × 30 days'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ecosprin Gold 20 Capsule', salt: 'Aspirin 75 mg + Atorvastatin 20 mg + Clopidogrel 75 mg — triple secondary-prevention; bleeding watch, inform dentist, report muscle pain', doseOptions: ['1 cap after lunch × 30 days'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clopilet 75 Tablet', salt: 'Clopidogrel 75 mg — bleeding watch: black stool = ER; inform dentist; never stop before stent review', doseOptions: ['1 tab after lunch × 30 days'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clopilet 150 Tablet', salt: 'Clopidogrel 150 mg — higher post-stent dose ONLY on cardiologist instruction', doseOptions: ['1 tab after lunch × 30 days (cardiologist advised)'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Deplatt 75 Tablet', salt: 'Clopidogrel 75 mg — bleeding watch; inform dentist before procedures', doseOptions: ['1 tab after lunch × 30 days'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clopilet A Tablet', salt: 'Clopidogrel 75 mg + Aspirin 75 mg — dual antiplatelet; bleeding watch, inform dentist; usually given with gastric protection', doseOptions: ['1 tab after lunch × 30 days'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Statins / lipid-lowering
    { name: 'Atorva 10 Tablet', salt: 'Atorvastatin 10 mg — report muscle pain/weakness; avoid in active liver disease and pregnancy', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atorva 20 Tablet', salt: 'Atorvastatin 20 mg — report muscle pain; LFT if indicated; not in pregnancy or active liver disease', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atorva 40 Tablet', salt: 'Atorvastatin 40 mg — high-intensity; report muscle pain/dark urine; not in pregnancy or liver disease', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rosuvas 5 Tablet', salt: 'Rosuvastatin 5 mg — report muscle pain; not in pregnancy or active liver disease', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rosuvas 10 Tablet', salt: 'Rosuvastatin 10 mg — report muscle pain; not in pregnancy', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rosuvas 20 Tablet', salt: 'Rosuvastatin 20 mg — high-intensity; report muscle pain; not in pregnancy or liver disease', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Storvas 20 Tablet', salt: 'Atorvastatin 20 mg — report muscle pain; not in pregnancy or active liver disease', doseOptions: ['1 tab at bedtime × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tonact TG Tablet', salt: 'Atorvastatin 10 mg + Fenofibrate 160 mg — for high triglycerides; report muscle pain', doseOptions: ['1 tab after dinner × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fibator Tablet', salt: 'Atorvastatin 10 mg + Fenofibrate 160 mg — TG-heavy dyslipidemia; report muscle pain', doseOptions: ['1 tab after dinner × 30 days'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Heart failure (K+ monitoring)
    { name: 'Dytor 10 Tablet', salt: 'Torsemide 10 mg — take early morning; K+ monitoring; report cramps or giddiness', doseOptions: ['1 tab after breakfast × 7 days then review', '1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dytor 20 Tablet', salt: 'Torsemide 20 mg — morning dose; K+ monitoring essential', doseOptions: ['1 tab after breakfast × 7 days then review'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dytor Plus Tablet', salt: 'Torsemide 10 mg + Spironolactone 25 mg — K+ monitoring essential', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lasix 40 Tablet', salt: 'Furosemide 40 mg — morning dose; K+ monitoring; giddiness or cramps = report', doseOptions: ['1 tab after breakfast × 7 days', '1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Aldactone 25 Tablet', salt: 'Spironolactone 25 mg — K+ monitoring essential; breast tenderness = report', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Aldactone 50 Tablet', salt: 'Spironolactone 50 mg — K+ monitoring essential', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Aldactide Tablet', salt: 'Spironolactone 25 mg + Hydrochlorothiazide 25 mg — K+ monitoring', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Rate/rhythm control — CONTINUATION-VERIFY ONLY
    { name: 'Cordarone 100 Tablet', salt: 'Amiodarone 100 mg — ⚠ CONTINUATION-VERIFY ONLY (never a new start here); thyroid, LFT and eye monitoring required', doseOptions: ['1 tab after breakfast × 30 days — verify against prior prescription'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cordarone 200 Tablet', salt: 'Amiodarone 200 mg — ⚠ CONTINUATION-VERIFY ONLY; thyroid and LFT monitoring required', doseOptions: ['1 tab after breakfast × 30 days — verify against prior prescription'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lanoxin 0.25 Tablet', salt: 'Digoxin 0.25 mg — NARROW therapeutic index: verify dose against prior prescription; report nausea, visual halos or yellow vision', doseOptions: ['1 tab after breakfast × 30 days — VERIFY dose first'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // ── Co-prescriptions / symptom relief (cardiac-safe)
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg — gastric protection in antiplatelet/NSAID context', doseOptions: ['1 tab before breakfast × 30 days', '1 tab before breakfast × 15 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Rantac 150 Tablet', salt: 'Ranitidine 150 mg — mild reflux at night', doseOptions: ['1 tab at bedtime SOS', '1 tab twice daily × 7 days'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium carbonate 500 mg + Vitamin D3 250 IU — take after food', doseOptions: ['1 tab after breakfast × 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/citrate/glucose; electrolyte replenishment in dehydration or low BP', doseOptions: ['1 sachet in 1 L water, sip through the day', '1 sachet after every loose stool'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Calpol 500 Tablet', salt: 'Paracetamol 500 mg — cardiac patients: PLAIN PARACETAMOL ONLY; AVOID NSAIDs (ibuprofen/diclofenac/aceclofenac)', doseOptions: ['1 tab SOS after food (max 3/day)', '1 tab thrice daily × 3 days'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — plain paracetamol only for cardiac patients; avoid NSAIDs', doseOptions: ['1 tab SOS after food (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Vertin 8 Tablet', salt: 'Betahistine 8 mg — symptomatic relief of vertigo/dizziness', doseOptions: ['1 tab thrice daily × 5 days'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vertin 16 Tablet', salt: 'Betahistine 16 mg — vertigo/dizziness symptomatic relief', doseOptions: ['1 tab twice daily × 7 days', '1 tab thrice daily × 5 days'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine 25 mcg — CONTINUATION ONLY (not a new start here); early morning empty stomach', doseOptions: ['1 tab early morning empty stomach × 30 days — verify against prior prescription'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine 50 mcg — CONTINUATION ONLY; early morning empty stomach', doseOptions: ['1 tab early morning empty stomach × 30 days — verify against prior prescription'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (43) — refer-only findings get ZERO ══════
  findingMeds: [
    // HTN-NEW — first-line ladder
    { findingKey: 'HTN-NEW', medicineName: 'Amlong 5 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'First-line once daily; review after 2-4 weeks with home BP log' },
    { findingKey: 'HTN-NEW', medicineName: 'Telma 40 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Alternative first-line (younger/diabetic); K+ check at 2 weeks; STOP if pregnant' },
    { findingKey: 'HTN-NEW', medicineName: 'Telma H Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Step-up if single drug inadequate; hold and inform doctor during vomiting/loose motions' },
    // HTN-HD — hypertensive heart disease
    { findingKey: 'HTN-HD', medicineName: 'Telma AM Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Combination control; K+/creatinine every 3 months; STOP if pregnant' },
    { findingKey: 'HTN-HD', medicineName: 'Dytor 10 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'If congestion/fluid overload; K+ monitoring' },
    // ANG-STABLE — maintenance bundle
    { findingKey: 'ANG-STABLE', medicineName: 'Sorbitrate 5 Tablet', dose: '1 tab sublingual SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'SOS for heaviness; max 3/day; ⚠ never with Sildenafil/Tadalafil' },
    { findingKey: 'ANG-STABLE', medicineName: 'Ecosprin 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'Antiplatelet; black stool = ER; add gastric protection if burning' },
    { findingKey: 'ANG-STABLE', medicineName: 'Atorva 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Statin; report muscle pain' },
    { findingKey: 'ANG-STABLE', medicineName: 'Metolar XR 25 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Rate/protection; never stop abruptly' },
    // ASHD — established disease
    { findingKey: 'ASHD', medicineName: 'Ecosprin 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'Lifelong antiplatelet; inform dentist; black stool = ER' },
    { findingKey: 'ASHD', medicineName: 'Atorva 20 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'High-intensity statin; muscle pain report' },
    { findingKey: 'ASHD', medicineName: 'Metolar XR 50 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'If resting HR >70; never stop abruptly' },
    { findingKey: 'ASHD', medicineName: 'Nitrocontin 2.6 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Prophylaxis if frequent episodes; ⚠ no Sildenafil/Tadalafil' },
    // HF-MILD — NYHA II maintenance
    { findingKey: 'HF-MILD', medicineName: 'Dytor 10 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Daily morning dose; K+ and creatinine in 1 week' },
    { findingKey: 'HF-MILD', medicineName: 'Aldactone 25 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'K+ monitoring essential; morning weight diary' },
    { findingKey: 'HF-MILD', medicineName: 'Lasix 40 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Alternative diuretic if torsemide unavailable; K+ monitoring' },
    // AF-FU — continuation/verification framing (anticoagulation = REVIEW only)
    { findingKey: 'AF-FU', medicineName: 'Metolar XR 50 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Rate control; never stop abruptly' },
    { findingKey: 'AF-FU', medicineName: 'Cordarone 100 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'CONTINUATION-VERIFY ONLY against prior prescription; thyroid/LFT monitoring' },
    { findingKey: 'AF-FU', medicineName: 'Lanoxin 0.25 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'VERIFY dose (narrow TI); anticoagulation itself = review/referral, not started here' },
    // ARRHY-NOS
    { findingKey: 'ARRHY-NOS', medicineName: 'Metolar XR 25 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'After ECG review; never stop abruptly' },
    // CHESTPAIN-MSK — non-cardiac pain (plain paracetamol only)
    { findingKey: 'CHESTPAIN-MSK', medicineName: 'Calpol 500 Tablet', dose: '1 tab SOS after food', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Plain paracetamol only — avoid NSAIDs in cardiac patients' },
    { findingKey: 'CHESTPAIN-MSK', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'If co-existing reflux contribution' },
    // CHESTPAIN-ATYP
    { findingKey: 'CHESTPAIN-ATYP', medicineName: 'Calpol 500 Tablet', dose: '1 tab SOS after food', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Paracetamol only; NSAIDs avoided' },
    { findingKey: 'CHESTPAIN-ATYP', medicineName: 'Rantac 150 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'If reflux-type symptoms' },
    // HYPERLIP — TG-heavy
    { findingKey: 'HYPERLIP', medicineName: 'Rosuvas 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Mixed dyslipidemia; report muscle pain' },
    { findingKey: 'HYPERLIP', medicineName: 'Tonact TG Tablet', dose: '1 tab after dinner', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'If TG-dominant; repeat lipid 6-8 weeks' },
    { findingKey: 'HYPERLIP', medicineName: 'Fibator Tablet', dose: '1 tab after dinner', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'TG-heavy alternative; muscle pain report' },
    // HYPERCHOL — LDL-dominant
    { findingKey: 'HYPERCHOL', medicineName: 'Atorva 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Starter statin; repeat lipid 6-8 weeks' },
    { findingKey: 'HYPERCHOL', medicineName: 'Rosuvas 5 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Alternative starter; not in pregnancy' },
    // HYPOTN
    { findingKey: 'HYPOTN', medicineName: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water', morning: 1, afternoon: 1, evening: 1, tab: 4, description: 'Sip through the day; rise slowly; BP medicine review' },
    // DIZZ
    { findingKey: 'DIZZ', medicineName: 'Vertin 16 Tablet', dose: '1 tab twice daily', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'Symptomatic vertigo relief × 5-7 days' },
    { findingKey: 'DIZZ', medicineName: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water', morning: 1, afternoon: 1, evening: 1, tab: 4, description: 'If dehydration contributes' },
    // SOB-CARD
    { findingKey: 'SOB-CARD', medicineName: 'Dytor 10 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'If congestion suspected; K+ monitoring; echo if new' },
    // EDEMA
    { findingKey: 'EDEMA', medicineName: 'Dytor 10 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Cardiac edema; morning weight diary; kidney workup if bilateral+persistent' },
    // POST-CABG — bundle
    { findingKey: 'POST-CABG', medicineName: 'Ecosprin 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'Lifelong; black stool = ER' },
    { findingKey: 'POST-CABG', medicineName: 'Atorva 20 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'High-intensity statin' },
    { findingKey: 'POST-CABG', medicineName: 'Metolar XR 25 Tablet', dose: '1 tab after breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Continuation; never stop abruptly' },
    // POST-PCI — bundle
    { findingKey: 'POST-PCI', medicineName: 'Clopilet 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'DAPT component; never stop before doctor review; inform dentist' },
    { findingKey: 'POST-PCI', medicineName: 'Ecosprin 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'DAPT component; black stool = ER' },
    { findingKey: 'POST-PCI', medicineName: 'Atorva 20 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'High-intensity statin' },
    { findingKey: 'POST-PCI', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Gastric protection with dual antiplatelet' },
    // DM-ASCVD
    { findingKey: 'DM-ASCVD', medicineName: 'Ecosprin 75 Tablet', dose: '1 tab after lunch', morning: 0, afternoon: 1, evening: 0, tab: 30, description: 'Secondary prevention; glycemic control parallel' },
    { findingKey: 'DM-ASCVD', medicineName: 'Atorva 20 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'High-intensity statin for diabetes+ASCVD' },
    // NOTE: SYNCOPE, RHD-FU, PM-STATUS, OBESITY-CR, CLAUD-SUSPECT, TACHY,
    // BRADY, CHD-CHILD and ALL refer-only findings intentionally carry
    // ZERO findingMeds links (workup / referral framing).
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Home BP Log (14 days)',
      rows: 14,
      cols: 5,
      headerLabel: ['तारीख', 'सुबह BP', 'शाम BP', 'नाड़ी', 'टिप्पणी'],
      colsLabel: ['Date', 'Morning BP', 'Evening BP', 'Pulse', 'Remarks'],
      footerLabel: ['5 मिनट बैठकर नापें · दोनों रीडिंग लिखें / Sit 5 min before measuring · record both readings'],
    },
    {
      name: 'Lipid Profile Tracker',
      rows: 6,
      cols: 5,
      headerLabel: ['तारीख', 'कुल कोलेस्ट्रॉल', 'LDL', 'HDL', 'ट्राइग्लिसराइड'],
      colsLabel: ['Date', 'Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'],
      footerLabel: ['रिपोर्ट पेस्ट करें या नंबर लिखें / Paste reports or write the values'],
    },
    {
      name: 'Heart-Failure Home Diary (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['तारीख', 'सुबह का वजन (kg)', 'तरल (ml)', 'लक्षण स्कोर (0-4)'],
      colsLabel: ['Date', 'Morning Weight (kg)', 'Fluid In (ml)', 'Symptom Score (0-4)'],
      footerLabel: ['स्कोर 0-1 हरा · 2-3 पीला · 4+ लाल = क्लिनिक कॉल करें · 3 दिन में 2 किलो वजन बढ़े तो तुरंत कॉल / Score 0-1 green · 2-3 yellow · 4+ red = call clinic · weight up 2 kg in 3 days = call now'],
    },
    {
      name: 'ECG Referral Checklist',
      rows: 6,
      cols: 3,
      headerLabel: ['लक्षण', 'ECG कब', 'टिप्पणी'],
      colsLabel: ['Symptom', 'When ECG', 'Notes'],
      footerLabel: ['सीने का दर्द = 10 मिनट में ECG / Chest pain = ECG within 10 minutes'],
    },
    {
      name: 'Cardiac Follow-Up Visit Card',
      rows: 6,
      cols: 5,
      headerLabel: ['तारीख', 'BP', 'EF %', 'दवा में बदलाव', 'अगली मुलाकात'],
      colsLabel: ['Date', 'BP', 'EF %', 'Meds Changed', 'Next Visit'],
      footerLabel: ['हर विजिट की रिकॉर्ड यहां रखें / Keep a record of every visit here'],
    },
    {
      name: 'Anticoagulation Review Tracker (INR)',
      rows: 6,
      cols: 4,
      headerLabel: ['तारीख', 'INR', 'खुराक (mg)', 'टिप्पणी'],
      colsLabel: ['Date', 'INR', 'Dose (mg)', 'Notes'],
      footerLabel: ['खुराक का बदलाव केवल डॉक्टर करेंगे · लैब रिपोर्ट के साथ समीक्षा / Dose changes by doctor only · review with lab report'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Newly-Detected HTN — First Visit',
      diagnosis: 'HTN-NEW',
      medicines: [
        { name: 'Amlong 5 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast; only after confirming high readings on a 7-day home log' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast; dietary support' },
      ],
      labs: ['ECG (today)', 'CBC', 'Random Blood Sugar', 'Serum Creatinine + Electrolytes', 'Lipid Profile', 'Urine Protein'],
      advice: 'नमक 5 ग्राम/दिन से कम · पापड़-अचार-नमकीन घटाएं · DASH आहार · रोज 30 मिनट तेज चाल · घर का BP लॉग सुबह-शाम लिखें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Dyslipidemia — Starter + Repeat Lipid',
      diagnosis: 'HYPERCHOL',
      medicines: [
        { name: 'Atorva 10 Tablet', dose: '1 tab', duration: '60 days', instructions: 'At bedtime; report muscle pain or weakness immediately' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '15 days', instructions: 'Before breakfast if any burning on the statin' },
      ],
      labs: ['Lipid Profile (baseline)', 'LFT (baseline)', 'Repeat Lipid Profile at 6-8 weeks'],
      advice: 'तला-मसालेदार घटाएं · रोज 30 मिनट तेज चाल · वजन घटाने का लक्ष्य · गर्भावस्था में स्टैटिन नहीं',
      followUpDays: 42,
      isCommon: true,
    },
    {
      name: 'Stable Angina — Maintenance Bundle',
      diagnosis: 'ANG-STABLE',
      medicines: [
        { name: 'Ecosprin 75 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After lunch; black/tarry stool = emergency room immediately' },
        { name: 'Atorva 10 Tablet', dose: '1 tab', duration: '30 days', instructions: 'At bedtime' },
        { name: 'Metolar XR 25 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast; never stop abruptly' },
        { name: 'Sorbitrate 5 Tablet', dose: '1 tab', duration: '30 days', instructions: 'Sublingual SOS for heaviness — max 3/day; ⚠ NEVER with Sildenafil/Tadalafil (fatal)' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '30 days', instructions: 'Before breakfast; gastric protection with aspirin' },
      ],
      labs: ['ECG (today)', 'Random Blood Sugar', 'Serum Creatinine', 'Lipid Profile'],
      advice: 'दर्द आराम पर आए या 15 मिनट से लंबा हो तो तुरंत इमरजेंसी (108) · भोजन के तुरंत बाद भारी काम न करें',
      followUpDays: 10,
      isCommon: true,
    },
    {
      name: 'Post-MI / Post-Angioplasty — Secondary Prevention',
      diagnosis: 'POST-PCI',
      medicines: [
        { name: 'Ecosprin 75 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After lunch; lifelong unless doctor says otherwise' },
        { name: 'Clopilet 75 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After lunch; never stop before doctor review — stent thrombosis risk' },
        { name: 'Atorva 20 Tablet', dose: '1 tab', duration: '30 days', instructions: 'At bedtime; report muscle pain' },
        { name: 'Metolar XR 25 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast; never stop abruptly' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '30 days', instructions: 'Before breakfast; protects stomach on dual antiplatelet' },
      ],
      labs: ['Lipid Profile', 'HbA1c / RBS', 'Serum Creatinine + K+', '2D Echo (EF)'],
      advice: 'काला मल या खून की उल्टी = तुरंत इमरजेंसी · दांत के इलाज से पहले डॉक्टर-दंतिस को बताएं · दवा कभी अपने मन से न रोकें',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Mild Chronic HF (NYHA II) — Maintenance + Diary',
      diagnosis: 'HF-MILD',
      medicines: [
        { name: 'Dytor 10 Tablet', dose: '1 tab', duration: '7 days', instructions: 'After breakfast; review with K+ report' },
        { name: 'Aldactone 25 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast; K+ monitoring essential' },
      ],
      labs: ['Serum K+ + Creatinine (in 7 days)', 'ECG', '2D Echo (if not done within 6 months)'],
      advice: 'सुबह खाली पेट वजन डायरी · तरल ~1.5 लीटर/दिन · नमक <5 ग्राम · 3 दिन में 2 किलो वजन बढ़े या रात में सांस बिगड़े तो क्लिनिक कॉल/तुरंत इमरजेंसी',
      followUpDays: 7,
    },
    {
      name: 'Palpitation — Workup + SOS Bridge',
      diagnosis: 'ARRHY-NOS',
      medicines: [
        { name: 'Metolar XR 25 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast — start only after today ECG review; never stop abruptly' },
        { name: 'Calpol 500 Tablet', dose: '1 tab', duration: '3 days', instructions: 'SOS after food for any pain — paracetamol only, avoid NSAIDs' },
      ],
      labs: ['ECG (today)', 'TSH', 'CBC', 'Holter (if episodes recur)'],
      advice: 'चाय/कॉफी/धूम्रपान घटाएं · दौरे के समय नाड़ी गिनकर नोट करें · चक्कर या बेहोशी = तुरंत इमरजेंसी',
      followUpDays: 7,
    },
  ],
}

// Counts: 6 categories · 45 complaints · 90 questions (idx 0-89) ·
// 180 suggestions (2/question) · 12 labels · 38 findings (26 managed +
// 12 refer-only with ZERO findingMeds) · 60 medicines · 43 findingMeds ·
// 6 tables · 6 Rx templates — 486 rows total.
