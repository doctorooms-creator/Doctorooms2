/**
 * GP-01 — GENERAL PRACTICE STARTER PACK (BASE pack, fallback for all specialties)
 *
 * The India "family doctor" core: the highest-frequency OPD complaints,
 * the top-prescribed medicines, and ready-made clinical questions/advice.
 * Every self-registered doctor gets this on Day-1 (exact specialty packs
 * land in P1; until then GP-01 is the fallback for ALL specialties).
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India GP core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * Sources: NLEM 2023 (molecule backbone), standard Indian OPD practice
 * patterns, existing pediatric/derma seeds for field conventions.
 */

import type { SpecialtyPack } from '../types'

export const GP01_PACK: SpecialtyPack = {
  meta: {
    code: 'GP-01',
    version: '1.0.0',
    tier: 'BASE',
    title: 'General Practice Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · India GP OPD top-prescribe patterns · unverified-dose launch mode',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'GEN', name: 'सामान्य लक्षण', nameEn: 'General Symptoms' },
    { key: 'RES', name: 'सांस और गला', nameEn: 'Respiratory & Throat' },
    { key: 'GAS', name: 'पेट संबंधी', nameEn: 'Gastrointestinal' },
    { key: 'SKN', name: 'त्वचा एवं एलर्जी', nameEn: 'Skin & Allergy' },
    { key: 'MSC', name: 'हड्डी-मांसपेशी व अन्य', nameEn: 'Musculoskeletal & Others' },
  ],

  // ══ Complaints (27) ═══════════════════════════════════════════════════
  complaints: [
    // GEN — General
    { code: 'GEN01', categoryKey: 'GEN', detail: 'बुखार', detailEn: 'Fever' },
    { code: 'GEN02', categoryKey: 'GEN', detail: 'बदन दर्द', detailEn: 'Body Ache' },
    { code: 'GEN03', categoryKey: 'GEN', detail: 'सिरदर्द', detailEn: 'Headache' },
    { code: 'GEN04', categoryKey: 'GEN', detail: 'कमजोरी / थकान', detailEn: 'Weakness / Tiredness' },
    { code: 'GEN05', categoryKey: 'GEN', detail: 'चक्कर आना', detailEn: 'Giddiness / Dizziness' },
    { code: 'GEN06', categoryKey: 'GEN', detail: 'वजन घटना', detailEn: 'Weight Loss' },
    { code: 'GEN07', categoryKey: 'GEN', detail: 'भूख न लगना', detailEn: 'Loss of Appetite' },
    // RES — Respiratory & Throat
    { code: 'RES01', categoryKey: 'RES', detail: 'सूखी खांसी', detailEn: 'Dry Cough' },
    { code: 'RES02', categoryKey: 'RES', detail: 'बलगम वाली खांसी', detailEn: 'Cough with Sputum' },
    { code: 'RES03', categoryKey: 'RES', detail: 'जुकाम / नाक बहना', detailEn: 'Cold / Runny Nose' },
    { code: 'RES04', categoryKey: 'RES', detail: 'छींके आना', detailEn: 'Sneezing' },
    { code: 'RES05', categoryKey: 'RES', detail: 'गले में दर्द', detailEn: 'Sore Throat' },
    { code: 'RES06', categoryKey: 'RES', detail: 'सांस फूलना', detailEn: 'Breathlessness' },
    { code: 'RES07', categoryKey: 'RES', detail: 'सीने में घरघराहट', detailEn: 'Wheezing' },
    // GAS — Gastrointestinal
    { code: 'GAS01', categoryKey: 'GAS', detail: 'पेट दर्द', detailEn: 'Abdominal Pain' },
    { code: 'GAS02', categoryKey: 'GAS', detail: 'दस्त / पतले दस्त', detailEn: 'Loose Motions' },
    { code: 'GAS03', categoryKey: 'GAS', detail: 'उल्टी', detailEn: 'Vomiting' },
    { code: 'GAS04', categoryKey: 'GAS', detail: 'मतली', detailEn: 'Nausea' },
    { code: 'GAS05', categoryKey: 'GAS', detail: 'एसिडिटी / सीने में जलन', detailEn: 'Acidity / Heartburn' },
    { code: 'GAS06', categoryKey: 'GAS', detail: 'कब्ज', detailEn: 'Constipation' },
    { code: 'GAS07', categoryKey: 'GAS', detail: 'गैस / पेट फूलना', detailEn: 'Gas / Bloating' },
    // SKN — Skin & Allergy
    { code: 'SKN01', categoryKey: 'SKN', detail: 'खुजली', detailEn: 'Itching' },
    { code: 'SKN02', categoryKey: 'SKN', detail: 'त्वचा पर दाने', detailEn: 'Skin Rash' },
    { code: 'SKN03', categoryKey: 'SKN', detail: 'एलर्जी / चकत्ते (पित्ती)', detailEn: 'Allergy / Hives' },
    // MSC — Musculoskeletal & Others
    { code: 'MSC01', categoryKey: 'MSC', detail: 'जोड़ों का दर्द', detailEn: 'Joint Pain' },
    { code: 'MSC02', categoryKey: 'MSC', detail: 'कमर दर्द', detailEn: 'Back Pain' },
    { code: 'MSC03', categoryKey: 'MSC', detail: 'गर्दन दर्द', detailEn: 'Neck Pain' },
  ],

  // ══ Questions (54 — 2 per complaint) ══════════════════════════════════
  // questionIndex order below MUST match this array order.
  questions: [
    // GEN01 Fever
    { complaintCode: 'GEN01', question: 'बुखार कितने दिनों से है?', questionEn: 'Since how many days is the fever?' },
    { complaintCode: 'GEN01', question: 'बुखार के साथ ठंड लगना या पसीना आना?', questionEn: 'Any chills or sweating with fever?' },
    // GEN02 Body ache
    { complaintCode: 'GEN02', question: 'दर्द किस भाग में ज्यादा है?', questionEn: 'Which part hurts the most?' },
    { complaintCode: 'GEN02', question: 'बुखार भी है क्या?', questionEn: 'Is there fever too?' },
    // GEN03 Headache
    { complaintCode: 'GEN03', question: 'सिरदर्द किस तरफ है?', questionEn: 'Which side is the headache on?' },
    { complaintCode: 'GEN03', question: 'उल्टी या चक्कर के साथ सिरदर्द?', questionEn: 'Headache with vomiting or giddiness?' },
    // GEN04 Weakness
    { complaintCode: 'GEN04', question: 'कमजोरी कितने समय से है?', questionEn: 'Since when is the weakness?' },
    { complaintCode: 'GEN04', question: 'खाने में रुचि कैसी है?', questionEn: 'How is the appetite?' },
    // GEN05 Giddiness
    { complaintCode: 'GEN05', question: 'चक्कर कब आते हैं — खड़े होते समय?', questionEn: 'When do you feel giddy — on standing?' },
    { complaintCode: 'GEN05', question: 'BP या शुगर की दवा चल रही है?', questionEn: 'Are you on BP or sugar medicines?' },
    // GEN06 Weight loss
    { complaintCode: 'GEN06', question: 'कितने महीने में कितना वजन घटा?', questionEn: 'How much weight lost over how many months?' },
    { complaintCode: 'GEN06', question: 'भूख और प्यास बढ़ी है?', questionEn: 'Increased appetite or thirst?' },
    // GEN07 Appetite
    { complaintCode: 'GEN07', question: 'कब से भूख कम है?', questionEn: 'Since when is the appetite low?' },
    { complaintCode: 'GEN07', question: 'जी मिचलाता है क्या?', questionEn: 'Any nausea?' },
    // RES01 Dry cough
    { complaintCode: 'RES01', question: 'खांसी कितने दिनों से है?', questionEn: 'Since how many days is the cough?' },
    { complaintCode: 'RES01', question: 'रात में खांसी बढ़ती है?', questionEn: 'Does the cough worsen at night?' },
    // RES02 Productive cough
    { complaintCode: 'RES02', question: 'बलगम का रंग कैसा है?', questionEn: 'What is the colour of sputum?' },
    { complaintCode: 'RES02', question: 'बलगम में खून तो नहीं?', questionEn: 'Any blood in the sputum?' },
    // RES03 Cold
    { complaintCode: 'RES03', question: 'नाक बंद है या बह रही है?', questionEn: 'Is the nose blocked or running?' },
    { complaintCode: 'RES03', question: 'सिरदर्द या चेहरे में भारीपन?', questionEn: 'Any headache or facial heaviness?' },
    // RES04 Sneezing
    { complaintCode: 'RES04', question: 'सुबह के समय ज्यादा छींके आती हैं?', questionEn: 'Are sneezes worse in the morning?' },
    { complaintCode: 'RES04', question: 'धूल/पराग से लक्षण बढ़ते हैं?', questionEn: 'Do dust/pollen worsen symptoms?' },
    // RES05 Sore throat
    { complaintCode: 'RES05', question: 'निगलने में दर्द है?', questionEn: 'Is there pain while swallowing?' },
    { complaintCode: 'RES05', question: 'टॉन्सिल पर दाने या सफेद परत?', questionEn: 'Any spots or white coating on tonsils?' },
    // RES06 Breathlessness
    { complaintCode: 'RES06', question: 'सीने में दर्द भी है क्या?', questionEn: 'Any chest pain along with it?' },
    { complaintCode: 'RES06', question: 'टहलने पर सांस कब फूलती है?', questionEn: 'How much walking brings on breathlessness?' },
    // RES07 Wheezing
    { complaintCode: 'RES07', question: 'पहले भी घरघराहट/दमा का इतिहास?', questionEn: 'Any past history of wheeze/asthma?' },
    { complaintCode: 'RES07', question: 'इनहेलर का इस्तेमाल करते हैं?', questionEn: 'Do you use an inhaler?' },
    // GAS01 Abdominal pain
    { complaintCode: 'GAS01', question: 'दर्द पेट के किस हिस्से में है?', questionEn: 'Which part of the abdomen hurts?' },
    { complaintCode: 'GAS01', question: 'खाने से दर्द बढ़ता या घटता है?', questionEn: 'Does food worsen or relieve the pain?' },
    // GAS02 Loose motions
    { complaintCode: 'GAS02', question: 'दस्त कितनी बार हुए?', questionEn: 'How many episodes of loose motions?' },
    { complaintCode: 'GAS02', question: 'दस्त में खून या श्लेष्मा?', questionEn: 'Any blood or mucus in stools?' },
    // GAS03 Vomiting
    { complaintCode: 'GAS03', question: 'उल्टी कितनी बार हुई?', questionEn: 'How many times did you vomit?' },
    { complaintCode: 'GAS03', question: 'उल्टी में खून तो नहीं?', questionEn: 'Any blood in vomit?' },
    // GAS04 Nausea
    { complaintCode: 'GAS04', question: 'किस खाने के बाद मतली शुरू हुई?', questionEn: 'After which food did nausea start?' },
    { complaintCode: 'GAS04', question: 'कोई दवा नई शुरू की है?', questionEn: 'Any new medicine started recently?' },
    // GAS05 Acidity
    { complaintCode: 'GAS05', question: 'खाली पेट पर जलन ज्यादा है?', questionEn: 'Is heartburn worse on empty stomach?' },
    { complaintCode: 'GAS05', question: 'रात में जलन से नींद टूटती है?', questionEn: 'Does burning wake you at night?' },
    // GAS06 Constipation
    { complaintCode: 'GAS06', question: 'कितने दिनों से पेट साफ नहीं हुआ?', questionEn: 'How many days since last proper stool?' },
    { complaintCode: 'GAS06', question: 'मल त्याग में खून आया?', questionEn: 'Any blood while passing stool?' },
    // GAS07 Gas/bloating
    { complaintCode: 'GAS07', question: 'खाने के बाद फूलना ज्यादा?', questionEn: 'Is bloating worse after meals?' },
    { complaintCode: 'GAS07', question: 'डकार या खट्टी डकार आती है?', questionEn: 'Any belching or sour eructations?' },
    // SKN01 Itching
    { complaintCode: 'SKN01', question: 'खुजली रात में ज्यादा है?', questionEn: 'Is the itching worse at night?' },
    { complaintCode: 'SKN01', question: 'परिवार में किसी को भी खुजली है?', questionEn: 'Anyone else in the family itching?' },
    // SKN02 Rash
    { complaintCode: 'SKN02', question: 'दाने कहां से शुरू हुए?', questionEn: 'Where did the rash start?' },
    { complaintCode: 'SKN02', question: 'बुखार के साथ दाने निकले?', questionEn: 'Did the rash appear with fever?' },
    // SKN03 Hives
    { complaintCode: 'SKN03', question: 'कोई नई दवा या खाना खाया था?', questionEn: 'Any new medicine or food taken?' },
    { complaintCode: 'SKN03', question: 'होंठ/आंखों पर सूजन तो नहीं?', questionEn: 'Any swelling of lips/eyes?' },
    // MSC01 Joint pain
    { complaintCode: 'MSC01', question: 'कौन से जोड़ में दर्द है?', questionEn: 'Which joints are painful?' },
    { complaintCode: 'MSC01', question: 'सुबह को जकड़न रहती है?', questionEn: 'Is there morning stiffness?' },
    // MSC02 Back pain
    { complaintCode: 'MSC02', question: 'दर्द कमर से पैर तक जाता है?', questionEn: 'Does the pain radiate to the leg?' },
    { complaintCode: 'MSC02', question: 'वजन उठाने के बाद शुरू हुआ?', questionEn: 'Did it start after lifting weight?' },
    // MSC03 Neck pain
    { complaintCode: 'MSC03', question: 'कंप्यूटर/मोबाइल ज्यादा इस्तेमाल करते हैं?', questionEn: 'Do you use computer/mobile for long hours?' },
    { complaintCode: 'MSC03', question: 'हाथ में सुन्नपन भी है?', questionEn: 'Any numbness in the hands?' },
  ],

  // ══ Suggestions (108 — 2 per question; questionIndex matches above) ══
  suggestions: [
    // GEN01 q0
    { questionIndex: 0, text: '3 दिन से कम बुखार — आम वायरल बुखार हो सकता है', textEn: 'Fever under 3 days — likely viral' },
    { questionIndex: 0, text: '5 दिन से ज्यादा बुखार — जांच (CBC) करानी चाहिए', textEn: 'Fever beyond 5 days — needs workup (CBC)' },
    // GEN01 q1
    { questionIndex: 1, text: 'ठंड के साथ तेज बुखार — पैराटामोल दें, भरपूर पानी', textEn: 'High fever with chills — paracetamol + fluids' },
    { questionIndex: 1, text: 'बार-बार ठंड लगना — मलेरिया/डेंगू जांच सोचें', textEn: 'Recurring chills — consider malaria/dengue test' },
    // GEN02 q2
    { questionIndex: 2, text: 'पूरे शरीर में दर्द — आराम और पैराटामोल', textEn: 'Generalised ache — rest + paracetamol' },
    { questionIndex: 2, text: 'एक जगह स्थानीय दर्द — चोट या मांसपेशी खिंचाव जांचें', textEn: 'Localised pain — check for injury or strain' },
    // GEN02 q3
    { questionIndex: 3, text: 'बुखार के साथ दर्द — वायरल बुखार का हिस्सा है', textEn: 'Ache with fever — part of viral illness' },
    { questionIndex: 3, text: 'बिना बुखार दर्द — विटामिन D की कमी जांचें', textEn: 'Ache without fever — check Vitamin D' },
    // GEN03 q4
    { questionIndex: 4, text: 'आधे सिर का दर्द — माइग्रेन संभव, ट्रिगर नोट करें', textEn: 'Half-sided headache — possible migraine, note triggers' },
    { questionIndex: 4, text: 'पूरे सिर का दर्द — नींद/पानी की कमी देखें', textEn: 'Whole head pain — check sleep/hydration' },
    // GEN03 q5
    { questionIndex: 5, text: 'अचानक तेज सिरदर्द + उल्टी — तुरंत न्यूरो रेफर', textEn: 'Sudden severe headache + vomiting — urgent neuro referral' },
    { questionIndex: 5, text: 'सामान्य सिरदर्द — पैराटामोल + आराम', textEn: 'Ordinary headache — paracetamol + rest' },
    // GEN04 q6
    { questionIndex: 6, text: 'हाल की बीमारी के बाद कमजोरी — पौष्टिक आहार + विटामिन', textEn: 'Post-illness weakness — nutritious diet + vitamins' },
    { questionIndex: 6, text: 'लंबे समय की कमजोरी — एनीमिया/थायरॉइड जांच', textEn: 'Long-standing weakness — test anemia/thyroid' },
    // GEN04 q7
    { questionIndex: 7, text: 'भूख घटी है — छोटे-छोटे भोजन, ज़ायकेदार आहार', textEn: 'Low appetite — small frequent meals' },
    { questionIndex: 7, text: 'भूख घटी + वजन घटा — जांच कराएं', textEn: 'Low appetite + weight loss — investigate' },
    // GEN05 q8
    { questionIndex: 8, text: 'खड़े होने पर चक्कर — पानी/नमक पर्याप्त लें', textEn: 'Giddy on standing — ensure hydration/salt' },
    { questionIndex: 8, text: 'बार-बार चक्कर — BP और शुगर जांचें', textEn: 'Recurrent giddiness — check BP and sugar' },
    // GEN05 q9
    { questionIndex: 9, text: 'BP दवा चालू है — BP रिकॉर्ड देखें, खुराक समीक्षा', textEn: 'On BP meds — review BP log and dose' },
    { questionIndex: 9, text: 'शुगर दवा चालू — लो शुगर से बचें, जांच कराएं', textEn: 'On sugar meds — rule out hypoglycemia' },
    // GEN06 q10
    { questionIndex: 10, text: '6 महीने में 5%+ वजन घटा — विस्तृत जांच (CBC/TSH)', textEn: '5%+ weight loss in 6 months — full workup (CBC/TSH)' },
    { questionIndex: 10, text: 'जान-बूझकर डाइटिंग से घटा — संतुलित आहार शुरू करें', textEn: 'Intentional dieting loss — start balanced diet' },
    // GEN06 q11
    { questionIndex: 11, text: 'भूख+प्यास बढ़ी — रैंडम शुगर जांच कराएं', textEn: 'Increased thirst/appetite — check random sugar' },
    { questionIndex: 11, text: 'सामान्य — वजन रिकॉर्ड जारी रखें', textEn: 'Normal — continue weight log' },
    // GEN07 q12
    { questionIndex: 12, text: 'हाल की बीमारी/तनाव के बाद भूख कम — सामान्य, 1-2 हफ्ते में ठीक', textEn: 'Post-illness/stress appetite loss — usually recovers' },
    { questionIndex: 12, text: '2 हफ्ते+ कम भूख — जांच कराएं', textEn: 'Appetite low 2+ weeks — investigate' },
    // GEN07 q13
    { questionIndex: 13, text: 'मतली के साथ भूख कम — हल्का आहार, डोमेस्टिल दें', textEn: 'Nausea with low appetite — light diet, domperidone' },
    { questionIndex: 13, text: 'सामान्य — छोटे भोजन बार-बार', textEn: 'Normal — small frequent meals' },
    // RES01 q14
    { questionIndex: 14, text: '2 हफ्ते+ सूखी खांसी — एलर्जी/अस्थमा जांचें', textEn: 'Dry cough 2+ weeks — check allergy/asthma' },
    { questionIndex: 14, text: 'कम दिनों की खांसी — आम वायरल, गर्म पानी', textEn: 'Short-duration cough — common viral, warm fluids' },
    // RES01 q15
    { questionIndex: 15, text: 'रात में बढ़ती खांसी — एलर्जी की संभावना', textEn: 'Night-worsening cough — likely allergic' },
    { questionIndex: 15, text: 'दिन-रात समान — सामान्य उपचार', textEn: 'Uniform through day — standard care' },
    // RES02 q16
    { questionIndex: 16, text: 'पीला/हरा बलगम — बैक्टीरियल संक्रमण, एंटीबायोटिक सोचें', textEn: 'Yellow/green sputum — bacterial, consider antibiotic' },
    { questionIndex: 16, text: 'सफेद/पारदर्शी बलगम — वायरल, सपोर्टिव केयर', textEn: 'White/clear sputum — viral, supportive care' },
    // RES02 q17
    { questionIndex: 17, text: 'बलगम में खून — तपैदक (TB) जांच जरूरी', textEn: 'Blood in sputum — TB workup essential' },
    { questionIndex: 17, text: 'बलगम सामान्य — निगरानी जारी रखें', textEn: 'Normal sputum — continue monitoring' },
    // RES03 q18
    { questionIndex: 18, text: 'नाक बंद — भाप/सलाइन स्प्रे, भरपूर पानी', textEn: 'Blocked nose — steam/saline spray, hydrate' },
    { questionIndex: 18, text: 'बहती नाक — एंटीहिस्टामिन दें', textEn: 'Running nose — give antihistamine' },
    // RES03 q19
    { questionIndex: 19, text: 'चेहरे में भारीपन — साइनसाइटिस संभव, जांच कराएं', textEn: 'Facial heaviness — possible sinusitis, evaluate' },
    { questionIndex: 19, text: 'सामान्य जुकाम — 3-5 दिन में ठीक', textEn: 'Common cold — resolves in 3-5 days' },
    // RES04 q20
    { questionIndex: 20, text: 'सुबह की छींके — एलर्जिक राइनाइटिस संभव', textEn: 'Morning sneezing — likely allergic rhinitis' },
    { questionIndex: 20, text: 'सामान्य छींके — धूल से बचें', textEn: 'Occasional sneezing — avoid dust' },
    // RES04 q21
    { questionIndex: 21, text: 'धूल/पराग से बढ़ता — एलर्जी, लंबी दवा सोचें', textEn: 'Dust/pollen triggers — allergy, consider long-term Rx' },
    { questionIndex: 21, text: 'कोई पैटर्न नहीं — सामान्य उपचार', textEn: 'No pattern — standard care' },
    // RES05 q22
    { questionIndex: 22, text: 'निगलने में दर्द — गर्म पानी का गरारे + लोजेंज', textEn: 'Painful swallow — warm saline gargles + lozenges' },
    { questionIndex: 22, text: 'तेज दर्द + बुखार — स्ट्रेप गला, एंटीबायोटिक सोचें', textEn: 'Severe pain + fever — strep throat, consider antibiotic' },
    // RES05 q23
    { questionIndex: 23, text: 'टॉन्सिल पर सफेद दाने — जांच करें, एंटीबायोटिक', textEn: 'White spots on tonsils — examine, antibiotic' },
    { questionIndex: 23, text: 'टॉन्सिल सामान्य — सपोर्टिव केयर', textEn: 'Normal tonsils — supportive care' },
    // RES06 q24
    { questionIndex: 24, text: 'सीने में दर्द + सांस — तुरंत ECG, हृदय जांच', textEn: 'Chest pain + breathlessness — urgent ECG, cardiac eval' },
    { questionIndex: 24, text: 'बिना दर्द — श्वसन कारण जांचें', textEn: 'No chest pain — evaluate respiratory cause' },
    // RES06 q25
    { questionIndex: 25, text: 'हल्के टहलने पर सांस — बड़ी जांच (चेस्ट X-ray)', textEn: 'Breathless on light walk — workup (chest X-ray)' },
    { questionIndex: 25, text: 'तेज व्यायाम पर ही — सामान्य सीमा', textEn: 'Only on heavy exertion — within normal limits' },
    // RES07 q26
    { questionIndex: 26, text: 'पुराना दमा — इनहेलर तकनीक दोबारा सिखाएं', textEn: 'Known asthma — re-check inhaler technique' },
    { questionIndex: 26, text: 'पहली बार घरघराहट — स्पाइरोमेट्री कराएं', textEn: 'First-time wheeze — do spirometry' },
    // RES07 q27
    { questionIndex: 27, text: 'इनहेलर चालू — कौन सा, कितनी बार — रिकॉर्ड करें', textEn: 'On inhaler — record which and how often' },
    { questionIndex: 27, text: 'इनहेलर नहीं — ब्रोंकोडायलेटर सोचें', textEn: 'No inhaler — consider bronchodilator' },
    // GAS01 q28
    { questionIndex: 28, text: 'ऊपरी पेट में दर्द — एसिडिटी संभव, एंटासिड + PPI', textEn: 'Upper abdominal pain — likely acidity, antacid + PPI' },
    { questionIndex: 28, text: 'निचले/दाएं पेट में दर्द — अपेंडिसिटाइटिस निकालें', textEn: 'Lower/right pain — rule out appendicitis' },
    // GAS01 q29
    { questionIndex: 29, text: 'खाने से दर्द बढ़ता — अल्सर जांच (स्कोप) सोचें', textEn: 'Food worsens pain — consider ulcer workup (endoscopy)' },
    { questionIndex: 29, text: 'खाने से राहत — एसिडिटी, नियमित भोजन', textEn: 'Food relieves — acidity, regular meals' },
    // GAS02 q30
    { questionIndex: 30, text: '3-5 बार दस्त — ORS + प्रोबायोटिक, आम वायरल', textEn: '3-5 episodes — ORS + probiotic, usually viral' },
    { questionIndex: 30, text: '6+ बार/डिहाइड्रेशन — तुरंत IV तरल चाहिए', textEn: '6+ episodes/dehydration — needs IV fluids' },
    // GAS02 q31
    { questionIndex: 31, text: 'खून/श्लेष्मा — डिसेंट्री, मेट्रोनिडाजोल सोचें', textEn: 'Blood/mucus — dysentery, consider metronidazole' },
    { questionIndex: 31, text: 'साफ दस्त — ORS ही काफी', textEn: 'Watery — ORS suffices' },
    // GAS03 q32
    { questionIndex: 32, text: '1-2 उल्टी — आराम + छोटे घूंट', textEn: '1-2 vomits — rest + small sips' },
    { questionIndex: 32, text: 'बार-बार उल्टी — ओन्डैनसेट्रॉन दें, डिहाइड्रेशन देखें', textEn: 'Repeated vomiting — ondansetron, watch hydration' },
    // GAS03 q33
    { questionIndex: 33, text: 'खून की उल्टी — इमरजेंसी रेफर', textEn: 'Blood in vomit — emergency referral' },
    { questionIndex: 33, text: 'सामान्य उल्टी — आहार सावधानी', textEn: 'Ordinary vomiting — dietary care' },
    // GAS04 q34
    { questionIndex: 34, text: 'बासी/तला खाने के बाद — हल्का आहार 1 दिन', textEn: 'After stale/fried food — light diet for a day' },
    { questionIndex: 34, text: 'बार-बार मतली — जांच कराएं (लिवर/शुगर)', textEn: 'Persistent nausea — investigate (liver/sugar)' },
    // GAS04 q35
    { questionIndex: 35, text: 'नई दवा की मतली — खाने के बाद दवा लें', textEn: 'New-medicine nausea — take after food' },
    { questionIndex: 35, text: 'दवा संबंधी नहीं — आगे जांचें', textEn: 'Not medicine-related — evaluate further' },
    // GAS05 q36
    { questionIndex: 36, text: 'खाली पेट जलन — PPI नाश्ते से पहले', textEn: 'Empty-stomach burning — PPI before breakfast' },
    { questionIndex: 36, text: 'भरपेट जलन — तला-मसालेदार बंद, छोटे भोजन', textEn: 'Post-meal burning — stop fried/spicy, small meals' },
    // GAS05 q37
    { questionIndex: 37, text: 'रात की जलन — डिनर सोने से 2 घंटे पहले', textEn: 'Nighttime burning — dinner 2 hours before bed' },
    { questionIndex: 37, text: '2+ हफ्ते जलन — स्कोप कराएं', textEn: 'Burning 2+ weeks — get endoscopy' },
    // GAS06 q38
    { questionIndex: 38, text: '3 दिन+ कब्ज — लैक्टुलोज रात को', textEn: 'Constipation 3+ days — lactulose at night' },
    { questionIndex: 38, text: 'बार-बार कब्ज — फाइबर + पानी बढ़ाएं', textEn: 'Recurrent constipation — increase fiber + water' },
    // GAS06 q39
    { questionIndex: 39, text: 'मल में खून — बवासीर/फिशर जांच', textEn: 'Blood in stool — examine for piles/fissure' },
    { questionIndex: 39, text: 'खून नहीं — कब्ज का इलाज जारी', textEn: 'No blood — continue constipation care' },
    // GAS07 q40
    { questionIndex: 40, text: 'भोजन के बाद फूलना — धीरे खाएं, गैस की दवा', textEn: 'Post-meal bloating — eat slowly, antiflatulent' },
    { questionIndex: 40, text: 'हर समय फूला पेट — जांच कराएं', textEn: 'Constant bloating — investigate' },
    // GAS07 q41
    { questionIndex: 41, text: 'खट्टी डकार — रिफ्लक्स, PPI दें', textEn: 'Sour belching — reflux, give PPI' },
    { questionIndex: 41, text: 'सामान्य डकार — खानपान में सुधार', textEn: 'Ordinary belching — dietary change' },
    // SKN01 q42
    { questionIndex: 42, text: 'रात की खुजली — स्कैबीज जांच, परिवार इलाज सोचें', textEn: 'Night itching — check scabies, treat family' },
    { questionIndex: 42, text: 'दिन की खुजली — त्वचा सूखी, मॉइस्चराइजर', textEn: 'Daytime itching — dry skin, moisturizer' },
    // SKN01 q43
    { questionIndex: 43, text: 'परिवार में कई लोग — स्कैबीज की संभावना', textEn: 'Multiple family members — scabies likely' },
    { questionIndex: 43, text: 'सिर्फ मरीज — एलर्जी/एक्जिमा जांच', textEn: 'Only patient — allergy/eczema check' },
    // SKN02 q44
    { questionIndex: 44, text: 'चेहरे/धड़ से शुरू — वायरल एग्जेंथम संभव', textEn: 'Started face/trunk — viral exanthem possible' },
    { questionIndex: 44, text: 'पैरों से शुरू — अन्य कारण जांचें', textEn: 'Started legs — evaluate other causes' },
    // SKN02 q45
    { questionIndex: 45, text: 'बुखार + दाने — डेंगू जांच कराएं', textEn: 'Fever + rash — test for dengue' },
    { questionIndex: 45, text: 'बिना बुखार — एलर्जी उपचार', textEn: 'No fever — allergy management' },
    // SKN03 q46
    { questionIndex: 46, text: 'नई दवा/खाना — तुरंत बंद करें, एंटीहिस्टामिन', textEn: 'New drug/food — stop immediately, antihistamine' },
    { questionIndex: 46, text: 'कोई ट्रिगर नहीं — एलर्जी जांच आगे', textEn: 'No trigger — further allergy workup' },
    // SKN03 q47
    { questionIndex: 47, text: 'होंठ/आंख सूजन — तुरंत इमरजेंसी (एनाफिलेक्सिस)', textEn: 'Lip/eye swelling — emergency now (anaphylaxis)' },
    { questionIndex: 47, text: 'सिर्फ त्वचा पर — एंटीहिस्टामिन + निगरानी', textEn: 'Skin only — antihistamine + observe' },
    // MSC01 q48
    { questionIndex: 48, text: 'छोटे जोड़ (उंगलियां) — आर्थराइटिस जांच (RA)', textEn: 'Small joints (fingers) — arthritis workup (RA)' },
    { questionIndex: 48, text: 'घुटने/कूल्हे — घिसाव (ऑस्टियोआर्थराइटिस) संभव', textEn: 'Knees/hips — likely wear (osteoarthritis)' },
    // MSC01 q49
    { questionIndex: 49, text: 'सुबह 30 मिनट+ जकड़न — इम्यून आर्थराइटिस जांच', textEn: 'Morning stiffness 30 min+ — autoimmune workup' },
    { questionIndex: 49, text: 'थोड़ी जकड़न — मांसपेशी/घिसाव उपचार', textEn: 'Mild stiffness — muscle/wear care' },
    // MSC02 q50
    { questionIndex: 50, text: 'दर्द पैर तक — साइटिका, MRI सोचें', textEn: 'Pain radiating to leg — sciatica, consider MRI' },
    { questionIndex: 50, text: 'सिर्फ कमर — मांसपेशी स्पैज्म, आराम + जेल', textEn: 'Back only — muscle spasm, rest + gel' },
    // MSC02 q51
    { questionIndex: 51, text: 'वजन उठाने के बाद — डिस्क चोट संभव, जांच कराएं', textEn: 'After lifting — possible disc injury, evaluate' },
    { questionIndex: 51, text: 'धीरे-धीरे शुरू — मुद्रा/फिजियो सुधार', textEn: 'Gradual onset — posture/physio correction' },
    // MSC03 q52
    { questionIndex: 52, text: 'लंबे समय झुकना — सर्विकल स्ट्रेन, ब्रेक लें', textEn: 'Long stooping — cervical strain, take breaks' },
    { questionIndex: 52, text: 'अचानक दर्द — जकड़न, गर्म सेक', textEn: 'Sudden pain — spasm, warm fomentation' },
    // MSC03 q53
    { questionIndex: 53, text: 'हाथ में सुन्नपन — नर्व दबाना, न्यूरो जांच', textEn: 'Hand numbness — nerve compression, neuro eval' },
    { questionIndex: 53, text: 'सुन्नपन नहीं — मांसपेशी उपचार', textEn: 'No numbness — muscle care' },
  ],

  // ══ Labels — vitals (8) ═══════════════════════════════════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '' , showUnit: false },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
  ],

  // ══ Findings (12) ═════════════════════════════════════════════════════
  findings: [
    { key: 'VIRAL-FEVER', name: 'वायरल बुखार', nameEn: 'Viral Fever', icd10: 'B34.9' },
    { key: 'URTI', name: 'ऊपरी श्वसन संक्रमण (URTI)', nameEn: 'Upper Respiratory Tract Infection', icd10: 'J06.9' },
    { key: 'ACUTE-GE', name: 'तीव्र अपच (दस्त)', nameEn: 'Acute Gastroenteritis', icd10: 'A09' },
    { key: 'ACIDITY', name: 'अपच / एसिडिटी रोग', nameEn: 'Dyspepsia / Acid Peptic Disease', icd10: 'K30' },
    { key: 'ANEMIA', name: 'आयरन की कमी एनीमिया', nameEn: 'Iron Deficiency Anemia', icd10: 'D50.9' },
    { key: 'HTN-FU', name: 'उच्च रक्तचाप (फॉलो-अप)', nameEn: 'Hypertension (Follow-up)', icd10: 'I10' },
    { key: 'DM-FU', name: 'टाइप 2 शुगर (फॉलो-अप)', nameEn: 'Type 2 Diabetes (Follow-up)', icd10: 'E11.9' },
    { key: 'PHARYNGITIS', name: 'तीव्र गला संक्रमण', nameEn: 'Acute Pharyngitis / Tonsillitis', icd10: 'J02.9' },
    { key: 'ALLERGIC-RHINITIS', name: 'एलर्जिक नासिका शोथ', nameEn: 'Allergic Rhinitis', icd10: 'J30.4' },
    { key: 'URTICARIA', name: 'पित्ती (उर्टिकारिया)', nameEn: 'Urticaria (Hives)', icd10: 'L50.9' },
    { key: 'MSP', name: 'मांसपेशी-कंकाल दर्द', nameEn: 'Musculoskeletal Pain', icd10: 'M79.1' },
    { key: 'VITD-DEF', name: 'विटामिन D की कमी', nameEn: 'Vitamin D Deficiency', icd10: 'E55.9' },
  ],

  // ══ Medicines (57) — India GP core ════════════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~5-day dispense.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Analgesics / antipyretics
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg', doseOptions: ['1 tab (500 mg)', '2 tabs (1 g)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg', doseOptions: ['1 tab (650 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml', doseOptions: ['5 ml (250 mg)', '10 ml (500 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zerodol SP Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Meftal Spas Tablet', salt: 'Mefenamic Acid 250 mg + Dicyclomine 10 mg', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cyclopam Tablet', salt: 'Dicyclomine 20 mg + Paracetamol 325 mg', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Antibiotics
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 200 Suspension', salt: 'Azithromycin 200 mg/5 ml', doseOptions: ['5 ml (200 mg)', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clavam 228.5 Suspension', salt: 'Amoxicillin 200 mg + Clavulanic Acid 28.5 mg /5 ml', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Zifi 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zifi 50 Dry Syrup', salt: 'Cefixime 50 mg/5 ml', doseOptions: ['5 ml (50 mg)', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Cifran 500 Tablet', salt: 'Ciprofloxacin 500 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'O2 Tablet', salt: 'Ofloxacin 200 mg + Ornidazole 500 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Flagyl 400 Tablet', salt: 'Metronidazole 400 mg', doseOptions: ['1 tab thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxt SL Tablet', salt: 'Doxycycline 100 mg + Lactic Acid Bacillus', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // GI
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone)', doseOptions: ['10 ml', '15 ml'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Domstal 10 Tablet', salt: 'Domperidone 10 mg', doseOptions: ['1 tab before food'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg (mouth-dissolving)', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dulcolax 5 Tablet', salt: 'Bisacodyl 5 mg', doseOptions: ['1-2 tabs at bedtime'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Colospa Retard Capsule', salt: 'Mebeverine 200 mg SR', doseOptions: ['1 cap before food'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Enterogermina Oral Suspension', salt: 'Bacillus clausii spores 2 billion/5 ml', doseOptions: ['1 vial (5 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // Respiratory / allergy
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Montek LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Allegra 120 Tablet', salt: 'Fexofenadine 120 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Sinarest Tablet', salt: 'Paracetamol 325 mg + Chlorpheniramine 2 mg + Phenylephrine 5 mg', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ambrodil Syrup 100ml', salt: 'Ambroxol 30 mg/5 ml', doseOptions: ['10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Ascoril LS Syrup 100ml', salt: 'Levosalbutamol 1 mg + Ambroxol 30 mg + Guaifenesin 100 mg per 5 ml', doseOptions: ['10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Otrivin Nasal Spray', salt: 'Xylometazoline 0.1% w/v', doseOptions: ['1 spray each nostril'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Gargle 100ml', salt: 'Povidone-Iodine 2% gargle', doseOptions: ['10 ml in half glass warm water'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Vitamins / minerals
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Livogen Tablet', salt: 'Ferrous Fumarate + Folic Acid', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Metabolic / chronic (initiation & follow-up)
    { name: 'Telma 40 Tablet', salt: 'Telmisartan 40 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlong 5 Tablet', salt: 'Amlodipine 5 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet 500 SR Tablet', salt: 'Metformin 500 mg sustained release', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atorva 10 Tablet', salt: 'Atorvastatin 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ecosprin AV 75 Capsule', salt: 'Aspirin 75 mg', doseOptions: ['1 cap after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine 50 mcg', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // Topical skin
    { name: 'Candid Cream 20g', salt: 'Clotrimazole 1% w/w', doseOptions: ['Apply thin layer 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin Sulphate 1% w/w', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calosoft Lotion 100ml', salt: 'Calamine + Liquid Paraffin + Cetrimide', doseOptions: ['Apply on itching 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (38) ════════════════════════════════════
  findingMeds: [
    // VIRAL-FEVER
    { findingKey: 'VIRAL-FEVER', medicineName: 'Crocin 500 Tablet', dose: '1 tab (500 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Max 4 doses/24 hrs' },
    { findingKey: 'VIRAL-FEVER', medicineName: 'Dolo 650 Tablet', dose: '1 tab (650 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'If fever not controlled with 500 mg' },
    { findingKey: 'VIRAL-FEVER', medicineName: 'Electral Sachet (ORS)', description: '1 sachet in 1 L water; sip through the day' },
    { findingKey: 'VIRAL-FEVER', medicineName: 'Cetzine 10 Tablet', description: '1 tab HS if body ache/allergy symptoms' },
    // URTI
    { findingKey: 'URTI', medicineName: 'Sinarest Tablet', description: '1 tab BD × 3-5 days' },
    { findingKey: 'URTI', medicineName: 'Ambrodil Syrup 100ml', dose: '10 ml BD × 5 days', description: 'If cough' },
    { findingKey: 'URTI', medicineName: 'Betadine Gargle 100ml', description: 'Gargle 2-3 times/day' },
    { findingKey: 'URTI', medicineName: 'Azithral 500 Tablet', description: '1 tab OD × 3 days (if bacterial suspicion)' },
    // ACUTE-GE
    { findingKey: 'ACUTE-GE', medicineName: 'Electral Sachet (ORS)', description: 'After every loose stool' },
    { findingKey: 'ACUTE-GE', medicineName: 'Enterogermina Oral Suspension', description: '1 vial BD × 3 days (probiotic)' },
    { findingKey: 'ACUTE-GE', medicineName: 'O2 Tablet', description: '1 tab BD × 3 days (if infective)' },
    { findingKey: 'ACUTE-GE', medicineName: 'Flagyl 400 Tablet', description: '1 tab TDS × 5 days (dysentery only)' },
    { findingKey: 'ACUTE-GE', medicineName: 'Cyclopam Tablet', description: '1 tab SOS for cramps' },
    // ACIDITY
    { findingKey: 'ACIDITY', medicineName: 'Pantop 40 Tablet', description: '1 tab before breakfast × 2-4 weeks' },
    { findingKey: 'ACIDITY', medicineName: 'Digene Gel 200ml', dose: '10 ml SOS', description: 'Immediate relief' },
    { findingKey: 'ACIDITY', medicineName: 'Domstal 10 Tablet', description: '1 tab before food TDS (if nausea)' },
    // ANEMIA
    { findingKey: 'ANEMIA', medicineName: 'Livogen Tablet', description: '1 tab BD after food × 8 weeks' },
    { findingKey: 'ANEMIA', medicineName: 'Becosules Capsule', description: '1 cap OD after food' },
    // HTN-FU
    { findingKey: 'HTN-FU', medicineName: 'Telma 40 Tablet', description: '1 tab OD morning; review BP log' },
    { findingKey: 'HTN-FU', medicineName: 'Amlong 5 Tablet', description: 'If BP not controlled on ARB alone' },
    { findingKey: 'HTN-FU', medicineName: 'Ecosprin AV 75 Capsule', description: 'Cardio-protection if advised' },
    // DM-FU
    { findingKey: 'DM-FU', medicineName: 'Glycomet 500 SR Tablet', description: '1 tab after dinner; with food' },
    { findingKey: 'DM-FU', medicineName: 'Atorva 10 Tablet', description: 'If lipid profile deranged' },
    { findingKey: 'DM-FU', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD after food' },
    // PHARYNGITIS
    { findingKey: 'PHARYNGITIS', medicineName: 'Betadine Gargle 100ml', description: 'Warm water gargles 3 times/day' },
    { findingKey: 'PHARYNGITIS', medicineName: 'Azithral 500 Tablet', description: '1 tab OD × 3 days' },
    { findingKey: 'PHARYNGITIS', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5 days (if bacterial)' },
    // ALLERGIC-RHINITIS
    { findingKey: 'ALLERGIC-RHINITIS', medicineName: 'Teczine 5 Tablet', description: '1 tab HS' },
    { findingKey: 'ALLERGIC-RHINITIS', medicineName: 'Montek LC Tablet', description: '1 tab HS × 2-4 weeks' },
    { findingKey: 'ALLERGIC-RHINITIS', medicineName: 'Otrivin Nasal Spray', description: 'Max 5-7 days (rebound congestion)' },
    // URTICARIA
    { findingKey: 'URTICARIA', medicineName: 'Teczine 5 Tablet', description: '1 tab HS × 1-2 weeks' },
    { findingKey: 'URTICARIA', medicineName: 'Allegra 120 Tablet', description: 'If not controlled with levocetirizine' },
    // MSP
    { findingKey: 'MSP', medicineName: 'Combiflam Tablet', description: '1 tab SOS after food (max 3/day)' },
    { findingKey: 'MSP', medicineName: 'Zerodol SP Tablet', description: '1 tab BD after food × 5 days' },
    { findingKey: 'MSP', medicineName: 'Voveran Gel 30g', description: 'Apply locally 2-3 times/day' },
    { findingKey: 'MSP', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD (bone support)' },
    // VITD-DEF
    { findingKey: 'VITD-DEF', medicineName: 'Uprise D3 60K Sachet', description: '1 sachet weekly × 8 weeks, then monthly' },
    { findingKey: 'VITD-DEF', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD after food' },
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'BP Log (14 days)',
      rows: 14,
      cols: 3,
      headerLabel: ['तारीख', 'समय', 'रक्तचाप'],
      colsLabel: ['Date', 'Time', 'BP'],
      footerLabel: ['अपने डॉक्टर को दिखाएं / Show to your doctor'],
    },
    {
      name: 'Sugar Log (14 days)',
      rows: 14,
      cols: 3,
      headerLabel: ['तारीख', 'खाली पेट', 'भोजन के बाद'],
      colsLabel: ['Date', 'Fasting', 'Post Meal'],
      footerLabel: ['अपने डॉक्टर को दिखाएं / Show to your doctor'],
    },
    {
      name: 'Fever Day Chart (5 days)',
      rows: 5,
      cols: 3,
      headerLabel: ['दिन', 'तापमान', 'टिप्पणी'],
      colsLabel: ['Day', 'Temperature', 'Notes'],
      footerLabel: ['बुखार 5 दिन से ज्यादा रहे तो जांच कराएं / If fever > 5 days, investigate'],
    },
  ],

  // ══ Rx quick-packages (2) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Viral Fever — Standard',
      diagnosis: 'VIRAL-FEVER',
      medicines: [
        { name: 'Crocin 500 Tablet', dose: '1 tab (500 mg)', duration: '3 days', instructions: 'SOS if temp > 100°F; max 4 doses/24 hrs' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L', duration: '3 days', instructions: 'Sip through the day' },
        { name: 'Cetzine 10 Tablet', dose: '1 tab HS', duration: '3 days', instructions: 'If body ache / cold symptoms' },
      ],
      labs: ['CBC (if fever > 5 days)', 'Dengue NS1 + IgM (if suspected)'],
      advice: 'भरपूर आराम करें · तरल भोजन लें · 3 दिन में सुधार न हो तो दोबारा मिलें',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Acute Gastroenteritis — Standard',
      diagnosis: 'ACUTE-GE',
      medicines: [
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L', duration: '3 days', instructions: 'After every loose stool' },
        { name: 'Enterogermina Oral Suspension', dose: '1 vial (5 ml)', duration: '3 days', instructions: 'BD, half-hour before food' },
        { name: 'O2 Tablet', dose: '1 tab', duration: '3 days', instructions: 'BD after food (if infective)' },
        { name: 'Cyclopam Tablet', dose: '1 tab', duration: '2 days', instructions: 'SOS for abdominal cramps' },
      ],
      labs: ['Stool Routine (if blood/mucus)', 'Serum Electrolytes (if dehydrated)'],
      advice: 'हल्का आहार (खिचड़ी/दलिया) · दूध/तला-मसालेदार बंद · छोटे-छोटे घूंट पानी',
      followUpDays: 3,
      isCommon: true,
    },
  ],
}
