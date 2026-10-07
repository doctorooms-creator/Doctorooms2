/**
 * OBG-01 — OBSTETRICS & GYNECOLOGY STARTER PACK (T1 — review priority #1)
 *
 * "Two patients in one": the India OBG OPD core — menstrual disorders,
 * pregnancy & ANC (incl. labor/postpartum), infections & discharge,
 * fertility/PCOS, contraception, menopause and breast complaints, with the
 * OBG-UNIQUE labels (LMP/EDD/Gravida/Para/Fundal Height/FHS), ANC visit
 * ledger, menstrual calendar and contraception options chart.
 *
 * Language: Hindi primary (patient-facing / ask-aloud — respectful, simple
 * wording for women patients), English secondary (doctor search).
 * Medicine names = English brands (India OBG core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian adult gynecology defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * ⚠ PREGNANCY-FLAG DISCIPLINE — the single most safety-critical content in
 * the whole system: EVERY medicine below carries an explicit pregnancy
 * flag. Where a trimester nuance exists (NSAIDs avoid in 3rd trimester;
 * fluconazole & metronidazole avoid in 1st; nitrofurantoin avoid near
 * term/G6PD) the conservative flag value is used and the salt note carries
 * the trimester detail. Drugs needed clinically for NON-pregnant patients
 * (letrozole, clomiphene, OCPs, norethisterone, HRT) are flagged
 * pregnancy 'avoid' with a "non-pregnant use only" note in the salt.
 *
 * DELIBERATELY EXCLUDED for safety: misoprostol, mifepristone and all
 * other abortifacients / MTP-regimen drugs are NOT in this pack (OPD
 * safety — specialist-only territory). Injectable uterotonics (oxytocin
 * etc.) are labour-ward drugs, not OPD prescribing content. Postmenopausal
 * bleeding finding carries NO medicine links — investigation first (USG ±
 * biopsy referral) before any treatment.
 *
 * Sources: NLEM 2023 (molecule backbone), FOGSI ANC/OBG practice
 * guidance patterns, WHO EML 2023 + WHO ANC recommendations, ICD-10 where
 * established, GP-01 pack for field conventions.
 */

import type { SpecialtyPack } from '../types'

export const OBG01_PACK: SpecialtyPack = {
  meta: {
    code: 'OBG-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Obstetrics & Gynecology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode — NEVER invent a reviewer
    sourceNotes: 'NLEM 2023 backbone · FOGSI ANC/OBG practice guidance · WHO EML 2023 & WHO ANC recommendations · ICD-10 where established · unverified-dose launch mode',
  },

  // ══ Categories (8) ════════════════════════════════════════════════════
  categories: [
    { key: 'MEN', name: 'मासिक धर्म संबंधी', nameEn: 'Menstrual Disorders' },
    { key: 'PREG', name: 'गर्भावस्था एवं प्रसव', nameEn: 'Pregnancy & ANC' },
    { key: 'POST', name: 'प्रसवोत्तर एवं स्तनपान', nameEn: 'Postpartum & Breastfeeding' },
    { key: 'INF', name: 'संक्रमण एवं स्राव', nameEn: 'Infections & Discharge' },
    { key: 'FER', name: 'निःसंतानता एवं PCOS', nameEn: 'Fertility & PCOS' },
    { key: 'CON', name: 'परिवार नियोजन', nameEn: 'Contraception & Family Planning' },
    { key: 'MENOP', name: 'रजोनिवृत्ति', nameEn: 'Menopause' },
    { key: 'BRS', name: 'स्तन एवं अन्य', nameEn: 'Breast & Others' },
  ],

  // ══ Complaints (49) ═══════════════════════════════════════════════════
  complaints: [
    // MEN — Menstrual Disorders
    { code: 'MEN01', categoryKey: 'MEN', detail: 'अनियमित माहवारी', detailEn: 'Irregular Periods' },
    { code: 'MEN02', categoryKey: 'MEN', detail: 'माहवारी छूटना / न आना', detailEn: 'Missed Period' },
    { code: 'MEN03', categoryKey: 'MEN', detail: 'बहुत भारी माहवारी', detailEn: 'Heavy Periods (Menorrhagia)' },
    { code: 'MEN04', categoryKey: 'MEN', detail: 'माहवारी में तेज दर्द', detailEn: 'Painful Periods (Dysmenorrhea)' },
    { code: 'MEN05', categoryKey: 'MEN', detail: 'लंबी माहवारी (7 दिन से ज्यादा)', detailEn: 'Prolonged Periods' },
    { code: 'MEN06', categoryKey: 'MEN', detail: 'कम बार माहवारी आना', detailEn: 'Infrequent Periods (Oligomenorrhea)' },
    { code: 'MEN07', categoryKey: 'MEN', detail: 'माहवारी से पहले धब्बे', detailEn: 'Pre-menstrual Spotting' },
    // PREG — Pregnancy & ANC
    { code: 'PREG01', categoryKey: 'PREG', detail: 'गर्भ की पुष्टि / जांच', detailEn: 'Pregnancy Confirmation' },
    { code: 'PREG02', categoryKey: 'PREG', detail: 'नियमित गर्भवती जांच (ANC)', detailEn: 'Routine ANC Checkup' },
    { code: 'PREG03', categoryKey: 'PREG', detail: 'गर्भ में उल्टी-मतली', detailEn: 'Vomiting / Nausea in Pregnancy' },
    { code: 'PREG04', categoryKey: 'PREG', detail: 'गर्भ में पैरों की सूजन', detailEn: 'Swelling of Feet in Pregnancy' },
    { code: 'PREG05', categoryKey: 'PREG', detail: 'गर्भ में रक्तस्राव', detailEn: 'Bleeding in Pregnancy' },
    { code: 'PREG06', categoryKey: 'PREG', detail: 'प्रसव पीड़ा / दर्द', detailEn: 'Labor Pain' },
    { code: 'PREG07', categoryKey: 'PREG', detail: 'गर्भ में पेशाब की शिकायत', detailEn: 'Urinary Complaints in Pregnancy' },
    { code: 'PREG08', categoryKey: 'PREG', detail: 'गर्भ में कमर दर्द', detailEn: 'Back Pain in Pregnancy' },
    { code: 'PREG09', categoryKey: 'PREG', detail: 'गर्भ में कमजोरी (खून की कमी)', detailEn: 'Anemia in Pregnancy' },
    { code: 'PREG10', categoryKey: 'PREG', detail: 'गर्भ में थायरॉइड की शिकायत', detailEn: 'Thyroid Problem in Pregnancy' },
    { code: 'PREG11', categoryKey: 'PREG', detail: 'गर्भ में शुगर (GDM)', detailEn: 'Sugar in Pregnancy (GDM)' },
    { code: 'PREG12', categoryKey: 'PREG', detail: 'गर्भ में बीपी बढ़ना', detailEn: 'High BP in Pregnancy' },
    { code: 'PREG13', categoryKey: 'PREG', detail: 'गर्भ में बुखार', detailEn: 'Fever in Pregnancy' },
    // POST — Postpartum & Breastfeeding
    { code: 'POST01', categoryKey: 'POST', detail: 'डिलीवरी के बाद जांच', detailEn: 'Post-delivery Checkup' },
    { code: 'POST02', categoryKey: 'POST', detail: 'दूध की कमी / स्तनपान समस्या', detailEn: 'Insufficient Breast Milk' },
    { code: 'POST03', categoryKey: 'POST', detail: 'स्तन में दर्द व सूजन', detailEn: 'Breast Pain & Engorgement' },
    { code: 'POST04', categoryKey: 'POST', detail: 'डिलीवरी के बाद ज्यादा रक्तस्राव', detailEn: 'Heavy Postpartum Bleeding' },
    { code: 'POST05', categoryKey: 'POST', detail: 'डिलीवरी के बाद बुखार', detailEn: 'Postpartum Fever' },
    { code: 'POST06', categoryKey: 'POST', detail: 'डिलीवरी के बाद उदासी रहना', detailEn: 'Postpartum Low Mood' },
    // INF — Infections & Discharge
    { code: 'INF01', categoryKey: 'INF', detail: 'सफेद स्राव (पानी आना)', detailEn: 'White Discharge' },
    { code: 'INF02', categoryKey: 'INF', detail: 'गुप्तांग में खुजली', detailEn: 'Itching in Private Parts' },
    { code: 'INF03', categoryKey: 'INF', detail: 'पेशाब में जलन', detailEn: 'Burning Urination (UTI)' },
    { code: 'INF04', categoryKey: 'INF', detail: 'बदबूदार स्राव', detailEn: 'Foul-smelling Discharge' },
    { code: 'INF05', categoryKey: 'INF', detail: 'गुप्तांग में छाले / फोड़े', detailEn: 'Genital Sores / Ulcers' },
    // FER — Fertility & PCOS
    { code: 'FER01', categoryKey: 'FER', detail: 'गर्भ नहीं ठहरना', detailEn: 'Not Conceiving (Infertility)' },
    { code: 'FER02', categoryKey: 'FER', detail: 'PCOS के लक्षण', detailEn: 'PCOS Symptoms' },
    { code: 'FER03', categoryKey: 'FER', detail: 'वजन बढ़ना व अनियमित माहवारी', detailEn: 'Weight Gain with Irregular Cycles' },
    { code: 'FER04', categoryKey: 'FER', detail: 'चेहरे / शरीर पर अनचाहे बाल', detailEn: 'Excess Facial Hair (Hirsutism)' },
    { code: 'FER05', categoryKey: 'FER', detail: 'गर्भधारण की पूर्व तैयारी सलाह', detailEn: 'Pre-conception Counseling' },
    // CON — Contraception & Family Planning
    { code: 'CON01', categoryKey: 'CON', detail: 'गर्भ से बचने की सलाह', detailEn: 'Contraception Advice' },
    { code: 'CON02', categoryKey: 'CON', detail: 'कॉपर-टी (IUD) संबंधी पूछताछ', detailEn: 'IUD (Copper-T) Query' },
    { code: 'CON03', categoryKey: 'CON', detail: 'गर्भनिरोधक गोली छूटना', detailEn: 'Missed Contraceptive Pill' },
    // MENOP — Menopause
    { code: 'MENOP01', categoryKey: 'MENOP', detail: 'गर्मी लगना (हॉट फ्लश)', detailEn: 'Hot Flushes' },
    { code: 'MENOP02', categoryKey: 'MENOP', detail: 'रजोनिवृत्ति के बाद रक्तस्राव', detailEn: 'Postmenopausal Bleeding' },
    { code: 'MENOP03', categoryKey: 'MENOP', detail: 'हड्डियों में कमजोरी / दर्द', detailEn: 'Bone Weakness (Osteoporosis Risk)' },
    { code: 'MENOP04', categoryKey: 'MENOP', detail: 'नींद व मूड की समस्या', detailEn: 'Sleep & Mood Problems (Menopause)' },
    // BRS — Breast & Others
    { code: 'BRS01', categoryKey: 'BRS', detail: 'स्तन में गांठ', detailEn: 'Breast Lump' },
    { code: 'BRS02', categoryKey: 'BRS', detail: 'स्तन दर्द', detailEn: 'Breast Pain' },
    { code: 'BRS03', categoryKey: 'BRS', detail: 'निपल से स्राव', detailEn: 'Nipple Discharge' },
    { code: 'BRS04', categoryKey: 'BRS', detail: 'पेट के निचले हिस्से में दर्द', detailEn: 'Chronic Lower Abdominal Pain' },
    { code: 'BRS05', categoryKey: 'BRS', detail: 'संबंध बनाने में दर्द', detailEn: 'Painful Intercourse' },
    { code: 'BRS06', categoryKey: 'BRS', detail: 'नीचे कुछ उतरने का एहसास', detailEn: 'Feeling of Something Coming Down (Prolapse)' },
  ],

  // ══ Questions (98 — 2 per complaint) ══════════════════════════════════
  // questionIndex order below MUST match this array order; every question is
  // annotated with its array index (`// idx N`) — suggestions reference N.
  questions: [
    // MEN01 Irregular periods
    { complaintCode: 'MEN01', question: 'क्या पहले माहवारी नियमित थी? कब से अनियमित हुई हैं?', questionEn: 'Were periods regular before? Since when have they become irregular?' }, // idx 0
    { complaintCode: 'MEN01', question: 'दो माहवारी के बीच कितने दिनों का फासला रहता है?', questionEn: 'How many days are there between two periods?' }, // idx 1
    // MEN02 Missed period
    { complaintCode: 'MEN02', question: 'माहवारी कितने दिनों से छूटी है?', questionEn: 'How many days overdue is the period?' }, // idx 2
    { complaintCode: 'MEN02', question: 'क्या गर्भधारण की संभावना है?', questionEn: 'Is there a chance of pregnancy?' }, // idx 3
    // MEN03 Heavy periods
    { complaintCode: 'MEN03', question: 'एक दिन में कितने पैड बदलने पड़ते हैं?', questionEn: 'How many pads are changed in a day?' }, // idx 4
    { complaintCode: 'MEN03', question: 'क्या खून के थक्के आते हैं?', questionEn: 'Are there blood clots during periods?' }, // idx 5
    // MEN04 Painful periods
    { complaintCode: 'MEN04', question: 'दर्द माहवारी शुरू होने से कितने दिन पहले शुरू होता है?', questionEn: 'How many days before the period does the pain start?' }, // idx 6
    { complaintCode: 'MEN04', question: 'क्या दर्द से काम, स्कूल या नींद प्रभावित होती है?', questionEn: 'Does the pain affect work, school or sleep?' }, // idx 7
    // MEN05 Prolonged periods
    { complaintCode: 'MEN05', question: 'माहवारी कितने दिनों तक चलती है?', questionEn: 'How many days does the period last?' }, // idx 8
    { complaintCode: 'MEN05', question: 'क्या माहवारी के बीच में भी धब्बे दिखते हैं?', questionEn: 'Is there any spotting between periods?' }, // idx 9
    // MEN06 Infrequent periods
    { complaintCode: 'MEN06', question: 'माहवारी कितने महीनों में एक बार आती है?', questionEn: 'Once in how many months does the period come?' }, // idx 10
    { complaintCode: 'MEN06', question: 'क्या साथ में वजन बढ़ना या चेहरे पर बाल आना है?', questionEn: 'Any associated weight gain or facial hair growth?' }, // idx 11
    // MEN07 Pre-menstrual spotting
    { complaintCode: 'MEN07', question: 'माहवारी से कितने दिन पहले धब्बे शुरू होते हैं?', questionEn: 'How many days before the period does the spotting start?' }, // idx 12
    { complaintCode: 'MEN07', question: 'क्या कोई गर्भनिरोधक गोली या तरीका इस्तेमाल कर रही हैं?', questionEn: 'Are you using any contraceptive pill or method?' }, // idx 13
    // PREG01 Pregnancy confirmation
    { complaintCode: 'PREG01', question: 'आखिरी माहवारी की तारीख क्या थी (LMP)?', questionEn: 'What was the date of the last menstrual period (LMP)?' }, // idx 14
    { complaintCode: 'PREG01', question: 'क्या गर्भ जांच (किट या अल्ट्रासाउंड) कराई है?', questionEn: 'Have you done a pregnancy test (kit or ultrasound)?' }, // idx 15
    // PREG02 Routine ANC
    { complaintCode: 'PREG02', question: 'यह कौन सी गर्भावस्था है — पहली, दूसरी या तीसरी?', questionEn: 'Which pregnancy number is this — first, second or third?' }, // idx 16
    { complaintCode: 'PREG02', question: 'अब तक कौन-कौन सी जांचें हो चुकी हैं (खून, शुगर, अल्ट्रासाउंड)?', questionEn: 'Which tests are done so far (blood, sugar, ultrasound)?' }, // idx 17
    // PREG03 Vomiting in pregnancy
    { complaintCode: 'PREG03', question: 'दिन में कितनी बार उल्टी होती है?', questionEn: 'How many times a day do you vomit?' }, // idx 18
    { complaintCode: 'PREG03', question: 'क्या कुछ खाना-पीना निगल पा रही हैं?', questionEn: 'Are you able to swallow any food or fluids?' }, // idx 19
    // PREG04 Swelling of feet
    { complaintCode: 'PREG04', question: 'क्या चेहरे और हाथों पर भी सूजन है?', questionEn: 'Is there swelling on the face and hands too?' }, // idx 20
    { complaintCode: 'PREG04', question: 'क्या सिरदर्द या आंखों के आगे चमक / धुंधला दिखना है?', questionEn: 'Any headache or visual blurring / flashes?' }, // idx 21
    // PREG05 Bleeding in pregnancy
    { complaintCode: 'PREG05', question: 'रक्तस्राव कितना है — हल्के धब्बे या भारी बहाव?', questionEn: 'How much is the bleeding — light spotting or heavy flow?' }, // idx 22
    { complaintCode: 'PREG05', question: 'क्या साथ में पेट में दर्द या ऐंठन है?', questionEn: 'Any abdominal pain or cramping along with it?' }, // idx 23
    // PREG06 Labor pain
    { complaintCode: 'PREG06', question: 'दर्द कब से है और कितने मिनट के फासले से आता है?', questionEn: 'Since when is the pain and at what interval does it come?' }, // idx 24
    { complaintCode: 'PREG06', question: 'क्या पानी (पानी की थैली) टूट चुका है?', questionEn: 'Has the bag of water broken?' }, // idx 25
    // PREG07 Urinary complaints in pregnancy
    { complaintCode: 'PREG07', question: 'पेशाब में जलन है या बार-बार पेशाब आता है?', questionEn: 'Is there burning or frequent urination?' }, // idx 26
    { complaintCode: 'PREG07', question: 'क्या बुखार या कमर / पेट के साइड में दर्द है?', questionEn: 'Any fever or pain in the side of the back or abdomen?' }, // idx 27
    // PREG08 Back pain in pregnancy
    { complaintCode: 'PREG08', question: 'क्या दर्द रात में या थकान के बाद बढ़ता है?', questionEn: 'Does the pain worsen at night or after exertion?' }, // idx 28
    { complaintCode: 'PREG08', question: 'क्या पैरों में सुन्नपन या दर्द नीचे की ओर जाता है?', questionEn: 'Any numbness in the legs or pain radiating downwards?' }, // idx 29
    // PREG09 Anemia in pregnancy
    { complaintCode: 'PREG09', question: 'पिछली हीमोग्लोबिन (Hb) रिपोर्ट कितनी थी?', questionEn: 'What was the last hemoglobin (Hb) report?' }, // idx 30
    { complaintCode: 'PREG09', question: 'क्या आयरन की गोली नियमित रूप से खा रही हैं?', questionEn: 'Are you taking iron tablets regularly?' }, // idx 31
    // PREG10 Thyroid in pregnancy
    { complaintCode: 'PREG10', question: 'क्या पहले से थायरॉइड की दवा चल रही है?', questionEn: 'Are you already on thyroid medicine?' }, // idx 32
    { complaintCode: 'PREG10', question: 'क्या ठंड लगना, आलस्य या तेज भूख जैसे लक्षण हैं?', questionEn: 'Any cold intolerance, lethargy or increased appetite?' }, // idx 33
    // PREG11 GDM
    { complaintCode: 'PREG11', question: 'क्या शुगर की जांच (GCT / OGTT) हो गई है?', questionEn: 'Has the sugar screening test (GCT / OGTT) been done?' }, // idx 34
    { complaintCode: 'PREG11', question: 'परिवार में किसी को शुगर की बीमारी है क्या?', questionEn: 'Does anyone in the family have diabetes?' }, // idx 35
    // PREG12 BP in pregnancy
    { complaintCode: 'PREG12', question: 'बीपी पहले से थी या गर्भ के दौरान बढ़ी है?', questionEn: 'Was the BP pre-existing or has it risen during pregnancy?' }, // idx 36
    { complaintCode: 'PREG12', question: 'क्या बीपी की दवा चालू है और आज की रीडिंग क्या है?', questionEn: 'Are you on BP medicine and what is today’s reading?' }, // idx 37
    // PREG13 Fever in pregnancy
    { complaintCode: 'PREG13', question: 'बुखार कितने दिनों से है?', questionEn: 'Since how many days is the fever?' }, // idx 38
    { complaintCode: 'PREG13', question: 'क्या साथ में जुकाम, खांसी या पेशाब की शिकायत है?', questionEn: 'Any cold, cough or urinary complaint along with it?' }, // idx 39
    // POST01 Post-delivery checkup
    { complaintCode: 'POST01', question: 'डिलीवरी को कितने दिन हो गए हैं?', questionEn: 'How many days have passed since delivery?' }, // idx 40
    { complaintCode: 'POST01', question: 'क्या रक्तस्राव (लोशिया) अभी भी चल रहा है?', questionEn: 'Is there still vaginal bleeding (lochia)?' }, // idx 41
    // POST02 Insufficient milk
    { complaintCode: 'POST02', question: 'बच्चा दिन में कितनी बार और कितनी देर दूध पीता है?', questionEn: 'How many times and how long does the baby feed in a day?' }, // idx 42
    { complaintCode: 'POST02', question: 'क्या कोई गोली या ऊपर का दूध (टॉप फीड) भी दे रही हैं?', questionEn: 'Are you also giving formula or top feeds?' }, // idx 43
    // POST03 Breast pain & engorgement
    { complaintCode: 'POST03', question: 'स्तन पर लालिमा, गांठ या बुखार में से कुछ भी है?', questionEn: 'Any redness, lump or fever of the breast?' }, // idx 44
    { complaintCode: 'POST03', question: 'दर्द एक स्तन में है या दोनों में?', questionEn: 'Is the pain in one breast or both?' }, // idx 45
    // POST04 Heavy postpartum bleeding
    { complaintCode: 'POST04', question: 'एक घंटे में कितने पैड भीग रहे हैं?', questionEn: 'How many pads are soaking in an hour?' }, // idx 46
    { complaintCode: 'POST04', question: 'क्या बुखार, बदबूदार स्राव या चक्कर भी आ रहे हैं?', questionEn: 'Any fever, foul-smelling discharge or giddiness?' }, // idx 47
    // POST05 Postpartum fever
    { complaintCode: 'POST05', question: 'बुखार के साथ क्या और शिकायत है — स्तन दर्द, घाव या स्राव?', questionEn: 'What accompanies the fever — breast pain, wound or discharge?' }, // idx 48
    { complaintCode: 'POST05', question: 'क्या बच्चा भी बीमार है या दूध छोड़ रहा है?', questionEn: 'Is the baby also unwell or refusing feeds?' }, // idx 49
    // POST06 Postpartum low mood
    { complaintCode: 'POST06', question: 'उदासी या रोने की भावना कितने दिनों से है?', questionEn: 'Since how many days is the low mood or crying spells?' }, // idx 50
    { complaintCode: 'POST06', question: 'क्या नींद-भूख पर असर है, या खुद को नुकसान के विचार आते हैं?', questionEn: 'Is sleep or appetite affected, or any thoughts of self-harm?' }, // idx 51
    // INF01 White discharge
    { complaintCode: 'INF01', question: 'स्राव का रंग और गाढ़ापन कैसा है?', questionEn: 'What is the colour and consistency of the discharge?' }, // idx 52
    { complaintCode: 'INF01', question: 'क्या साथ में खुजली या बदबू है?', questionEn: 'Any itching or foul smell with it?' }, // idx 53
    // INF02 Itching private parts
    { complaintCode: 'INF02', question: 'खुजली के साथ दही जैसा सफेद स्राव भी है?', questionEn: 'Is there curdy white discharge with the itching?' }, // idx 54
    { complaintCode: 'INF02', question: 'क्या हाल में शुगर की जांच हुई है?', questionEn: 'Has your blood sugar been tested recently?' }, // idx 55
    // INF03 Burning urination
    { complaintCode: 'INF03', question: 'जलन के साथ बार-बार पेशाब या तेज बदबू भी है?', questionEn: 'Frequency or strong smell along with the burning?' }, // idx 56
    { complaintCode: 'INF03', question: 'क्या बुखार या पेट के निचले हिस्से में दर्द है?', questionEn: 'Any fever or lower abdominal pain?' }, // idx 57
    // INF04 Foul-smelling discharge
    { complaintCode: 'INF04', question: 'बदबूदार स्राव कितने दिनों से है?', questionEn: 'Since how many days is the foul-smelling discharge?' }, // idx 58
    { complaintCode: 'INF04', question: 'क्या गर्भवती हैं, या हाल में डिलीवरी / कॉपर-टी लगवाई है?', questionEn: 'Are you pregnant, or had a recent delivery or Copper-T insertion?' }, // idx 59
    // INF05 Genital sores
    { complaintCode: 'INF05', question: 'छाले / फोड़े कब से हैं?', questionEn: 'Since when are the sores present?' }, // idx 60
    { complaintCode: 'INF05', question: 'क्या पति को भी ऐसी ही शिकायत है?', questionEn: 'Does your partner have a similar complaint?' }, // idx 61
    // FER01 Infertility
    { complaintCode: 'FER01', question: 'गर्भ के लिए कितने साल से कोशिश कर रहे हैं?', questionEn: 'Since how many years are you trying to conceive?' }, // idx 62
    { complaintCode: 'FER01', question: 'क्या माहवारी नियमित है?', questionEn: 'Are the periods regular?' }, // idx 63
    // FER02 PCOS symptoms
    { complaintCode: 'FER02', question: 'माहवारी कितने दिनों के अंतर से आती है?', questionEn: 'At what interval do the periods come?' }, // idx 64
    { complaintCode: 'FER02', question: 'क्या मुंहासे या चेहरे / पेट पर बाल बढ़े हैं?', questionEn: 'Any acne or increased hair on the face or body?' }, // idx 65
    // FER03 Weight gain with irregular cycles
    { complaintCode: 'FER03', question: 'कितने महीनों में कितना वजन बढ़ा है?', questionEn: 'How much weight has been gained over how many months?' }, // idx 66
    { complaintCode: 'FER03', question: 'क्या नींद, थकान या बाल झड़ने की शिकायत भी है?', questionEn: 'Any sleep problems, fatigue or hair fall as well?' }, // idx 67
    // FER04 Hirsutism
    { complaintCode: 'FER04', question: 'अनचाहे बाल कब से बढ़ रहे हैं?', questionEn: 'Since when is the excess hair growing?' }, // idx 68
    { complaintCode: 'FER04', question: 'क्या कोई हार्मोनल दवा या स्टेरॉयड ले रही हैं?', questionEn: 'Are you taking any hormonal medicine or steroid?' }, // idx 69
    // FER05 Pre-conception counseling
    { complaintCode: 'FER05', question: 'शादी को कितना समय हुआ और कब से प्लानिंग कर रही हैं?', questionEn: 'How long have you been married and planning since when?' }, // idx 70
    { complaintCode: 'FER05', question: 'क्या फॉलिक एसिड शुरू कर ली है?', questionEn: 'Have you started folic acid?' }, // idx 71
    // CON01 Contraception advice
    { complaintCode: 'CON01', question: 'कितने बच्चे हैं और अगले बच्चे की योजना कब है?', questionEn: 'How many children do you have and when is the next planned?' }, // idx 72
    { complaintCode: 'CON01', question: 'क्या अभी स्तनपान करा रही हैं?', questionEn: 'Are you breastfeeding currently?' }, // idx 73
    // CON02 IUD query
    { complaintCode: 'CON02', question: 'क्या पहले कभी कॉपर-टी लगवाई है?', questionEn: 'Have you used a Copper-T before?' }, // idx 74
    { complaintCode: 'CON02', question: 'क्या माहवारी भारी या दर्ददायक है?', questionEn: 'Are your periods heavy or painful?' }, // idx 75
    // CON03 Missed pill
    { complaintCode: 'CON03', question: 'कौन सी गोली कब छूटी?', questionEn: 'Which pill was missed and when?' }, // idx 76
    { complaintCode: 'CON03', question: 'क्या गोली छूटने के बाद संबंध बना?', questionEn: 'Was there intercourse after the missed pill?' }, // idx 77
    // MENOP01 Hot flushes
    { complaintCode: 'MENOP01', question: 'दिन में कितनी बार गर्मी / पसीने के झटके आते हैं?', questionEn: 'How many hot flush or sweat episodes occur per day?' }, // idx 78
    { complaintCode: 'MENOP01', question: 'क्या माहवारी पूरी तरह बंद हो गई है या कभी-कभी आ जाती है?', questionEn: 'Have periods stopped fully or still occasional?' }, // idx 79
    // MENOP02 Postmenopausal bleeding
    { complaintCode: 'MENOP02', question: 'माहवारी बंद हुए कितने साल हो गए हैं?', questionEn: 'How many years have passed since menopause?' }, // idx 80
    { complaintCode: 'MENOP02', question: 'रक्तस्राव कितना है और कितने दिनों से?', questionEn: 'How much is the bleeding and since how many days?' }, // idx 81
    // MENOP03 Bone weakness
    { complaintCode: 'MENOP03', question: 'दर्द किन जगहों में है — कमर, घुटने, कूल्हे?', questionEn: 'Where is the pain — back, knees, hips?' }, // idx 82
    { complaintCode: 'MENOP03', question: 'क्या कभी गिरने या हड्डी टूटने की घटना रही है?', questionEn: 'Any history of falls or fracture?' }, // idx 83
    // MENOP04 Sleep & mood problems
    { complaintCode: 'MENOP04', question: 'नींद कितने दिनों से खराब है?', questionEn: 'Since how many days is the sleep disturbed?' }, // idx 84
    { complaintCode: 'MENOP04', question: 'क्या चिड़चिड़ापन या उदासी भी महसूस होती है?', questionEn: 'Do you also feel irritability or low mood?' }, // idx 85
    // BRS01 Breast lump
    { complaintCode: 'BRS01', question: 'गांठ कब से है और क्या बढ़ रही है?', questionEn: 'Since when is the lump and is it growing?' }, // idx 86
    { complaintCode: 'BRS01', question: 'क्या गांठ दर्द करती है या माहवारी के साथ बदलती है?', questionEn: 'Is the lump painful or does it change with the cycle?' }, // idx 87
    // BRS02 Breast pain
    { complaintCode: 'BRS02', question: 'क्या दर्द माहवारी से पहले बढ़ता है?', questionEn: 'Does the pain increase before periods?' }, // idx 88
    { complaintCode: 'BRS02', question: 'क्या स्तन पर लालिमा, गांठ या निपल से स्राव है?', questionEn: 'Any redness, lump or nipple discharge?' }, // idx 89
    // BRS03 Nipple discharge
    { complaintCode: 'BRS03', question: 'स्राव का रंग कैसा है — दूध जैसा, पीला या खून?', questionEn: 'What is the colour of the discharge — milky, yellow or blood?' }, // idx 90
    { complaintCode: 'BRS03', question: 'क्या कोई दवा (दूध बढ़ाने वाली / मानसिक) चालू है?', questionEn: 'Are you on any medicine (galactagogue or psychiatric)?' }, // idx 91
    // BRS04 Chronic lower abdominal pain
    { complaintCode: 'BRS04', question: 'दर्द कितने महीनों से है?', questionEn: 'Since how many months is the pain present?' }, // idx 92
    { complaintCode: 'BRS04', question: 'क्या संबंध के समय या पेशाब / पाखाने के समय दर्द बढ़ता है?', questionEn: 'Does the pain worsen during intercourse or while passing urine or stool?' }, // idx 93
    // BRS05 Painful intercourse
    { complaintCode: 'BRS05', question: 'दर्द शुरुआत में होता है या गहराई में?', questionEn: 'Is the pain at entry or deep inside?' }, // idx 94
    { complaintCode: 'BRS05', question: 'क्या योनि में सूखापन या स्राव की शिकायत भी है?', questionEn: 'Any vaginal dryness or discharge as well?' }, // idx 95
    // BRS06 Prolapse
    { complaintCode: 'BRS06', question: 'क्या खड़े होने पर नीचे कुछ उतरने जैसा लगता है?', questionEn: 'Do you feel something coming down on standing?' }, // idx 96
    { complaintCode: 'BRS06', question: 'क्या पेशाब पर पूरा नियंत्रण है या रिसाव होता है?', questionEn: 'Do you have full urine control or any leakage?' }, // idx 97
  ],

  // ══ Suggestions (196 — 2 per question; questionIndex matches idx above) ══
  suggestions: [
    // q0 (MEN01) — regularity before
    { questionIndex: 0, text: 'शुरू से अनियमित रही हैं — PCOS / थायरॉइड की जांच कराएं', textEn: 'Irregular from the start — test for PCOS / thyroid' },
    { questionIndex: 0, text: 'पहले नियमित थीं, अब बिगड़ी हैं — तनाव, वजन या दवा का असर खोजें', textEn: 'Earlier regular, now disrupted — look for stress, weight or medicine effect' },
    // q1 (MEN01) — cycle interval
    { questionIndex: 1, text: '21-35 दिन का फासला — सामान्य सीमा में है', textEn: '21-35 day interval — within normal limits' },
    { questionIndex: 1, text: '35 दिन से ज्यादा या 21 से कम का फासला — हार्मोन जांच कराएं', textEn: 'Over 35 days or under 21 days — get hormone tests done' },
    // q2 (MEN02) — overdue days
    { questionIndex: 2, text: '7 दिन तक छूटना — इंतजार करें; तनाव या बीमारी भी देर कर सकती है', textEn: 'Up to 7 days overdue — wait; stress or illness can also delay' },
    { questionIndex: 2, text: '10 दिन से ज्यादा छूटे हैं — गर्भ जांच (किट / खून) कराएं', textEn: 'Over 10 days overdue — do a pregnancy test (kit / blood)' },
    // q3 (MEN02) — pregnancy chance
    { questionIndex: 3, text: 'संभावना है — आज ही पेशाब की जांच कराएं', textEn: 'Chance exists — do the urine test today' },
    { questionIndex: 3, text: 'संभावना नहीं — थायरॉइड / प्रोलैक्टिन की जांच सोचें', textEn: 'No chance — consider thyroid / prolactin tests' },
    // q4 (MEN03) — pads per day
    { questionIndex: 4, text: '2-4 पैड प्रति दिन — सामान्य बहाव है', textEn: '2-4 pads per day — normal flow' },
    { questionIndex: 4, text: '6+ पैड या 2 घंटे में भीगना — भारी रक्तस्राव; Hb जांच कराएं', textEn: '6+ pads or soaking every 2 hrs — heavy bleeding; check Hb' },
    // q5 (MEN03) — clots
    { questionIndex: 5, text: 'बड़े थक्के (नींबू जैसे) — अल्ट्रासाउंड कराएं, फाइब्रॉयड निकालें', textEn: 'Large clots (lemon-sized) — do ultrasound, rule out fibroid' },
    { questionIndex: 5, text: 'छोटे थक्के या नहीं — सामान्य; निगरानी रखें', textEn: 'Small clots or none — normal; keep monitoring' },
    // q6 (MEN04) — pain onset
    { questionIndex: 6, text: 'दर्द माहवारी शुरू होते ही और 1-2 दिन — सामान्य ऋतुशूल', textEn: 'Pain with onset of period for 1-2 days — primary dysmenorrhea' },
    { questionIndex: 6, text: 'दर्द पहले से शुरू और बढ़ता हुआ — अल्ट्रासाउंड से एंडोमेट्रियोसिस निकालें', textEn: 'Pain starting earlier and worsening — rule out endometriosis with ultrasound' },
    // q7 (MEN04) — functional impact
    { questionIndex: 7, text: 'काम / स्कूल छूट रहा है — दर्द का पूरा इलाज लें; गर्म सिकाई मदद करती है', textEn: 'Missing work / school — take full treatment for pain; hot fomentation helps' },
    { questionIndex: 7, text: 'हल्का दर्द — गर्म पानी की थैली और हल्का व्यायाम मदद करता है', textEn: 'Mild pain — hot water bag and light exercise help' },
    // q8 (MEN05) — duration
    { questionIndex: 8, text: '3-7 दिन की माहवारी — सामान्य', textEn: '3-7 day period — normal' },
    { questionIndex: 8, text: '7 दिन से ज्यादा — जांच कराएं (Hb और अल्ट्रासाउंड)', textEn: 'Over 7 days — investigate (Hb and ultrasound)' },
    // q9 (MEN05) — intermenstrual spotting
    { questionIndex: 9, text: 'बीच में धब्बे — ग्रीवा (cervix) और हार्मोन जांच कराएं', textEn: 'Mid-cycle spotting — get cervix and hormone evaluation' },
    { questionIndex: 9, text: 'कोई धब्बा नहीं — सामान्य', textEn: 'No spotting — normal' },
    // q10 (MEN06) — months between periods
    { questionIndex: 10, text: '2-3 महीने में एक बार — PCOS की जांच कराएं', textEn: 'Once in 2-3 months — investigate for PCOS' },
    { questionIndex: 10, text: '4+ महीने में एक बार — गहरी जांच जरूरी (हार्मोन + अल्ट्रासाउंड)', textEn: 'Once in 4+ months — full workup needed (hormones + ultrasound)' },
    // q11 (MEN06) — weight / facial hair
    { questionIndex: 11, text: 'वजन और बाल दोनों — PCOS संभव; जांच शुरू करें', textEn: 'Weight and hair both — PCOS likely; start workup' },
    { questionIndex: 11, text: 'दोनों नहीं — थायरॉइड / प्रोलैक्टिन जांच कराएं', textEn: 'Neither — test thyroid / prolactin' },
    // q12 (MEN07) — spotting days before period
    { questionIndex: 12, text: '1-2 दिन हल्के धब्बे — सामान्य हो सकता है', textEn: '1-2 days of light spotting — can be normal' },
    { questionIndex: 12, text: 'लगातार या भारी धब्बे — प्रोजेस्ट्रोन की कमी / ग्रीवा की जांच कराएं', textEn: 'Continuous or heavy spotting — check progesterone deficiency / cervix' },
    // q13 (MEN07) — contraceptive use
    { questionIndex: 13, text: 'गोली या हार्मोनल तरीका — वही कारण हो सकता है; डॉक्टर से मिलकर समीक्षा करें', textEn: 'Pill or hormonal method — that itself may be the cause; review with doctor' },
    { questionIndex: 13, text: 'कोई तरीका नहीं — अन्य कारणों की जांच करें', textEn: 'No method — investigate other causes' },
    // q14 (PREG01) — LMP
    { questionIndex: 14, text: 'LMP याद है — EDD निकालें और ANC रजिस्टर करवाएं', textEn: 'LMP known — calculate EDD and register for ANC' },
    { questionIndex: 14, text: 'LMP याद नहीं — अल्ट्रासाउंड से गर्भ की उम्र पता करें', textEn: 'LMP not known — get dating ultrasound' },
    // q15 (PREG01) — test done
    { questionIndex: 15, text: 'किट पॉजिटिव — 5-6 सप्ताह पर अल्ट्रासाउंड से गर्भ की जगह पक्की करें', textEn: 'Kit positive — confirm location by ultrasound at 5-6 weeks' },
    { questionIndex: 15, text: 'जांच नहीं हुई — आज पेशाब / खून की जांच करें', textEn: 'Not tested — do urine / blood test today' },
    // q16 (PREG02) — gravida
    { questionIndex: 16, text: 'पहली गर्भावस्था — हर लक्षण में डॉक्टर से मिलें; ज्यादा सलाह दें', textEn: 'First pregnancy — see doctor for every symptom; counsel more' },
    { questionIndex: 16, text: 'तीसरी या उससे ज्यादा गर्भावस्था — पिछली डिलीवरी के रिकॉर्ड साथ लाएं', textEn: 'Third or more pregnancy — bring records of past deliveries' },
    // q17 (PREG02) — tests so far
    { questionIndex: 17, text: 'जांचें हो चुकी हैं — रिपोर्ट समीक्षा कर ANC विजिट-बही लिखें', textEn: 'Tests done — review reports and write the ANC visit ledger' },
    { questionIndex: 17, text: 'कोई जांच नहीं — आज CBC, रक्त वर्ग, TSH, शुगर और पेशाब जांच भेजें', textEn: 'No tests yet — order CBC, blood group, TSH, sugar and urine today' },
    // q18 (PREG03) — vomiting episodes
    { questionIndex: 18, text: 'दिन में 2-3 बार तक — प्रारंभिक सामान्य उल्टी; छोटे-छोटे भोजन लें', textEn: 'Up to 2-3 times a day — normal early vomiting; take small frequent meals' },
    { questionIndex: 18, text: '5+ बार या कुछ भी न निगल पाना — हाइपररेमेसिस; तुरंत इलाज / IV तरल चाहिए', textEn: '5+ times or unable to swallow — hyperemesis; urgent treatment / IV fluids' },
    // q19 (PREG03) — able to eat/drink
    { questionIndex: 19, text: 'थोड़ा खा-पी रही हैं — ORS या नारियल पानी के छोटे घूंट लेते रहें', textEn: 'Taking some food and fluids — keep sipping ORS or coconut water in small gulps' },
    { questionIndex: 19, text: 'पानी भी नहीं पी पा रहीं — डिहाइड्रेशन; आज ही IV के लिए आएं', textEn: 'Not even able to drink water — dehydration; come today for IV' },
    // q20 (PREG04) — face/hand swelling
    { questionIndex: 20, text: 'सिर्फ पैरों में शाम को हल्की सूजन — सामान्य; लेटते समय पैर ऊपर रखें', textEn: 'Mild evening foot swelling only — normal; elevate legs while resting' },
    { questionIndex: 20, text: 'चेहरे / हाथों में सूजन — आज BP जांचें; प्री-एक्लेम्प्सिया का खतरा', textEn: 'Face / hand swelling — check BP today; pre-eclampsia risk' },
    // q21 (PREG04) — headache / visual symptoms
    { questionIndex: 21, text: 'दोनों में से कुछ भी — खतरे के लक्षण! तुरंत BP नोट करें और अस्पताल जाएं', textEn: 'Any of these — danger signs! Record BP now and go to hospital' },
    { questionIndex: 21, text: 'कोई नहीं — BP नियमित नोट करती रहें', textEn: 'Neither — keep recording BP regularly' },
    // q22 (PREG05) — bleeding amount
    { questionIndex: 22, text: 'हल्के धब्बे — आराम, डॉक्टर निगरानी और अल्ट्रासाउंड कराएं', textEn: 'Light spotting — rest, doctor supervision and an ultrasound' },
    { questionIndex: 22, text: 'भारी बहाव — आपात स्थिति; बिना देर अस्पताल जाएं', textEn: 'Heavy flow — emergency; go to hospital without delay' },
    // q23 (PREG05) — pain with bleeding
    { questionIndex: 23, text: 'दर्द + रक्तस्राव — गर्भपात या एक्टोपिक गर्भ निकालें; तुरंत अल्ट्रासाउंड', textEn: 'Pain + bleeding — rule out abortion or ectopic; urgent ultrasound' },
    { questionIndex: 23, text: 'बिना दर्द — फिर भी जांच जरूरी; आराम रखें', textEn: 'No pain — still needs evaluation; take rest' },
    // q24 (PREG06) — labor pain pattern
    { questionIndex: 24, text: '5 मिनट से कम के नियमित दर्द — तुरंत प्रसव केंद्र जाएं', textEn: 'Regular pains under 5 minutes apart — go to the delivery centre now' },
    { questionIndex: 24, text: 'अनियमित / दूर के दर्द — हल्की फेरी रखें, कुछ खाएं और आराम करें', textEn: 'Irregular / far-apart pains — take a light walk, eat something and rest' },
    // q25 (PREG06) — water broken
    { questionIndex: 25, text: 'पानी टूट गया — साफ पैड लगाकर, लेटकर तुरंत अस्पताल जाएं', textEn: 'Water broken — go to hospital now with a clean pad, lying down en route' },
    { questionIndex: 25, text: 'नहीं टूटा — निगरानी रखें; प्रसव-जांच के लिए आएं', textEn: 'Not broken — keep monitoring; come for a labor check' },
    // q26 (PREG07) — burning / frequency
    { questionIndex: 26, text: 'जलन + बार-बार पेशाब — पेशाब जांच भेजें और पानी खूब पिएं', textEn: 'Burning + frequency — send a urine test and drink plenty of water' },
    { questionIndex: 26, text: 'बिना जलन बार-बार पेशाब — गर्भाशय के दबाव से होता है; सामान्य', textEn: 'Frequency without burning — due to uterine pressure; normal' },
    // q27 (PREG07) — fever / flank pain
    { questionIndex: 27, text: 'बुखार / कमर दर्द — गुर्दे का संक्रमण संभव; आज ही जांच और इलाज', textEn: 'Fever / flank pain — kidney infection possible; test and treat today' },
    { questionIndex: 27, text: 'दोनों नहीं — सामान्य सिस्टिटिस संभव; जांच कराएं', textEn: 'Neither — simple cystitis likely; get tested' },
    // q28 (PREG08) — night / exertion worsening
    { questionIndex: 28, text: 'थकान से बढ़ता दर्द — आराम, गुदगुदी सहारा और सही मुद्रा रखें', textEn: 'Worse after exertion — rest, cushion support and correct posture' },
    { questionIndex: 28, text: 'रात में ज्यादा — कैल्शियम की जांच कराएं', textEn: 'Worse at night — get calcium checked' },
    // q29 (PREG08) — numbness / radiation
    { questionIndex: 29, text: 'पैरों में सुन्नपन — डॉक्टर को दिखाएं (तंत्रिका पर दबाव)', textEn: 'Numbness in legs — show the doctor (nerve compression)' },
    { questionIndex: 29, text: 'सुन्नपन नहीं — गर्भ का सामान्य कमर दर्द; मुद्रा सुधारें', textEn: 'No numbness — normal pregnancy backache; improve posture' },
    // q30 (PREG09) — last Hb
    { questionIndex: 30, text: 'Hb 11 या ज्यादा — अच्छा; आयरन जारी रखें', textEn: 'Hb 11 or more — good; continue iron' },
    { questionIndex: 30, text: 'Hb 9 से कम — गंभीर कमी; आयरन उपचार बढ़ाएं, जरूरत पर IV आयरन', textEn: 'Hb under 9 — severe deficiency; intensify iron, IV iron if needed' },
    // q31 (PREG09) — iron compliance
    { questionIndex: 31, text: 'नियमित खा रही हैं — बहुत अच्छा; 6 सप्ताह में Hb दोहराएं', textEn: 'Taking regularly — excellent; repeat Hb in 6 weeks' },
    { questionIndex: 31, text: 'जलन या काला मल से बंद कर दी — भोजन के तुरंत बाद खाएं; नींबू / आंवला साथ लें', textEn: 'Stopped due to irritation or dark stools — take right after food; add lemon / amla' },
    // q32 (PREG10) — on thyroid medicine
    { questionIndex: 32, text: 'दवा चालू — गर्भ में खुराक अक्सर बढ़ती है; TSH कराकर समीक्षा करें', textEn: 'On medicine — dose often needs an increase in pregnancy; test TSH and review' },
    { questionIndex: 32, text: 'नई पहचान — TSH रिपोर्ट के साथ आज ही उपचार शुरू करें', textEn: 'Newly detected — start treatment today with the TSH report' },
    // q33 (PREG10) — thyroid symptoms
    { questionIndex: 33, text: 'लक्षण मौजूद — TSH जांच भेजें', textEn: 'Symptoms present — send a TSH test' },
    { questionIndex: 33, text: 'लक्षण नहीं — पहली ANC जांच में भी TSH जरूरी है', textEn: 'No symptoms — TSH still needed in the first ANC panel' },
    // q34 (PREG11) — GCT/OGTT done
    { questionIndex: 34, text: 'जांच हो गई — रिपोर्ट देखकर डाइट या उपचार तय करें', textEn: 'Test done — review the report and plan diet or treatment' },
    { questionIndex: 34, text: 'नहीं हुई (24-28 सप्ताह) — आज GCT / OGTT कराएं', textEn: 'Not done (24-28 weeks) — get the GCT / OGTT today' },
    // q35 (PREG11) — family history
    { questionIndex: 35, text: 'परिवार में शुगर — जोखिम ज्यादा; जांच जरूर कराएं, मिठाई घटाएं', textEn: 'Family history — higher risk; do get tested and cut sweets' },
    { questionIndex: 35, text: 'परिवार में नहीं — सामान्य जोखिम; फिर भी स्क्रीनिंग जरूरी', textEn: 'No family history — normal risk; screening still needed' },
    // q36 (PREG12) — pre-existing vs new BP
    { questionIndex: 36, text: 'पहले से बीपी — दवा गर्भ-सुरक्षित बदलें और नियमित ANC रखें', textEn: 'Pre-existing BP — switch to a pregnancy-safe medicine and keep regular ANC' },
    { questionIndex: 36, text: 'गर्भ में नई बीपी — BP चार्ट बनाएं, पेशाब में एल्बुमिन जांचें', textEn: 'New BP in pregnancy — make a BP chart and check urine albumin' },
    // q37 (PREG12) — on BP med / today reading
    { questionIndex: 37, text: '140/90 या ज्यादा — आज समीक्षा चाहिए; दवा गर्भ के अनुकूल रखें', textEn: '140/90 or higher — needs review today; keep the medicine pregnancy-compatible' },
    { questionIndex: 37, text: 'सामान्य — दवा जारी रखें; 2 हफ्ते में फॉलो-अप', textEn: 'Normal — continue the medicine; follow up in 2 weeks' },
    // q38 (PREG13) — fever days
    { questionIndex: 38, text: '1-2 दिन हल्का बुखार — पैराटामोल सुरक्षित है; पानी भरपूर पिएं', textEn: '1-2 days mild fever — paracetamol is safe; drink plenty of fluids' },
    { questionIndex: 38, text: '3 दिन से ज्यादा तेज बुखार — गर्भ के लिए जोखिम; तुरंत जांच और डॉक्टर से मिलें', textEn: 'High fever over 3 days — risky in pregnancy; investigate and see the doctor now' },
    // q39 (PREG13) — associated complaints
    { questionIndex: 39, text: 'जुकाम-खांसी — भाप और गरारे करें; जरूरत पर गर्भ-सुरक्षित दवा', textEn: 'Cold and cough — steam and gargles; pregnancy-safe medicine if needed' },
    { questionIndex: 39, text: 'पेशाब के लक्षण — आज पेशाब जांच (संक्रमण)', textEn: 'Urine symptoms — urine test today (infection)' },
    // q40 (POST01) — days since delivery
    { questionIndex: 40, text: '6 सप्ताह के भीतर — प्रसवोत्तर जांच पूरी करें; आयरन जारी रखें', textEn: 'Within 6 weeks — complete the postnatal check; continue iron' },
    { questionIndex: 40, text: '6 सप्ताह से ज्यादा — परिवार नियोजन की सलाह लें', textEn: 'Over 6 weeks — take contraception advice' },
    // q41 (POST01) — lochia
    { questionIndex: 41, text: 'हल्का भूरा स्राव जो घट रहा है — सामान्य', textEn: 'Light brown discharge that is decreasing — normal' },
    { questionIndex: 41, text: 'लाल भारी या बदबूदार स्राव — प्रसवोत्तर जांच तुरंत कराएं', textEn: 'Red heavy or foul-smelling discharge — postnatal check urgently' },
    // q42 (POST02) — feeding frequency
    { questionIndex: 42, text: '8-12 बार प्रति दिन — सही है; बच्चा मांगे तब दूध पिलाएं', textEn: '8-12 feeds per day — correct; feed on demand' },
    { questionIndex: 42, text: '6 बार से कम — दूध पिलाने की बार-बारित बढ़ाएं, आराम और भरपूर भोजन-पानी लें', textEn: 'Under 6 feeds — increase feeding frequency, rest well and take plenty of food and fluids' },
    // q43 (POST02) — top feed
    { questionIndex: 43, text: 'सिर्फ मां का दूध (6 महीने तक) — सबसे अच्छा', textEn: 'Only mother milk till 6 months — the best' },
    { questionIndex: 43, text: 'टॉप फीड शुरू कर दी — दूध घटने से पहले डॉक्टर से योजना बनाएं', textEn: 'Started top feed — plan with the doctor before your milk supply drops' },
    // q44 (POST03) — redness / lump / fever
    { questionIndex: 44, text: 'इनमें से कुछ भी — मैस्टाइटिस; आज ही इलाज शुरू करें', textEn: 'Any of these — mastitis; start treatment today' },
    { questionIndex: 44, text: 'कोई नहीं — सामान्य भराव; गर्म सिकाई करें और दूध निकालें', textEn: 'None — simple engorgement; warm compress and express milk' },
    // q45 (POST03) — one or both breasts
    { questionIndex: 45, text: 'एक स्तन — संक्रमण या दूध नली बंद होना ज्यादा संभावना; जांच कराएं', textEn: 'One breast — infection or blocked duct more likely; get examined' },
    { questionIndex: 45, text: 'दोनों स्तन — आमतौर पर हार्मोनल भराव; सहारा देने वाली ब्रा और दूध निकालना', textEn: 'Both breasts — usually hormonal engorgement; supportive bra and expression' },
    // q46 (POST04) — pads per hour
    { questionIndex: 46, text: '1 घंटे में 1+ पैड भीगता — बहुत ज्यादा रक्तस्राव; तुरंत अस्पताल', textEn: '1+ pad soaking per hour — very heavy bleeding; hospital immediately' },
    { questionIndex: 46, text: 'हल्का रिसाव — फिर भी आज जांच कराएं', textEn: 'Light bleeding — still get checked today' },
    // q47 (POST04) — fever / foul / giddiness
    { questionIndex: 47, text: 'बुखार + बदबू या चक्कर — संक्रमण या खून की कमी; आज ही जांच', textEn: 'Fever + foul smell or giddiness — infection or anemia; test today' },
    { questionIndex: 47, text: 'सब सामान्य — आराम और आयरन जारी रखें; निगरानी रखें', textEn: 'All normal — continue rest and iron; keep watch' },
    // q48 (POST05) — fever accompanied by
    { questionIndex: 48, text: 'स्तन दर्द के साथ — मैस्टाइटिस का इलाज करें', textEn: 'With breast pain — treat mastitis' },
    { questionIndex: 48, text: 'घाव या स्राव के साथ — घाव / योनि संक्रमण की जांच; एंटीबायोटिक चाहिए', textEn: 'With wound or discharge — examine wound / vaginal infection; antibiotic needed' },
    // q49 (POST05) — baby unwell
    { questionIndex: 49, text: 'बच्चा बीमार या दूध छोड़ रहा है — शिशु की जांच भी जरूरी', textEn: 'Baby unwell or refusing feeds — baby also needs a check' },
    { questionIndex: 49, text: 'बच्चा स्वस्थ है — मां का इलाज जारी रखें', textEn: 'Baby is fine — continue the mother treatment' },
    // q50 (POST06) — mood days
    { questionIndex: 50, text: '10 दिन से कम, हल्की उदासी — बेबी ब्लूज; परिवार का सहयोग और नींद लें', textEn: 'Under 10 days, mild low mood — baby blues; family support and sleep' },
    { questionIndex: 50, text: '2 हफ्ते से ज्यादा गहरी उदासी — प्रसवोत्तर अवसाद; उपचार लें', textEn: 'Deep low mood over 2 weeks — postpartum depression; take treatment' },
    // q51 (POST06) — red-flag mental health
    { questionIndex: 51, text: 'खुद को नुकसान के विचार — आपात मानसिक सहायता; मरीज को अकेला न छोड़ें', textEn: 'Thoughts of self-harm — emergency mental health help; never leave the patient alone' },
    { questionIndex: 51, text: 'नींद-भूख प्रभावित — परामर्श लें और परिवार को बताएं', textEn: 'Sleep / appetite affected — take counselling and inform the family' },
    // q52 (INF01) — discharge colour
    { questionIndex: 52, text: 'दही जैसा सफेद — कैंडिडा संभव; इलाज आसान और उपलब्ध है', textEn: 'Curdy white — likely candida; treatment is easy and available' },
    { questionIndex: 52, text: 'पतला सफेद / धूसर बदबूदार — बैक्टीरियल वैजिनोसिस संभव', textEn: 'Thin white / grey foul-smelling — likely bacterial vaginosis' },
    // q53 (INF01) — itch / smell
    { questionIndex: 53, text: 'खुजली + दही स्राव — फंगल; एंटीफंगल इलाज कराएं', textEn: 'Itching + curdy discharge — fungal; take antifungal treatment' },
    { questionIndex: 53, text: 'बदबू — बैक्टीरियल / ट्राइकोमोनास जांच कराएं', textEn: 'Foul smell — test for bacterial / trichomonas' },
    // q54 (INF02) — curdy discharge with itch
    { questionIndex: 54, text: 'हां — कैंडिडा; रात में स्थानिक एंटीफंगल इलाज', textEn: 'Yes — candida; nightly local antifungal treatment' },
    { questionIndex: 54, text: 'स्राव कम, खुजली ज्यादा — एलर्जी या शुगर निकालें', textEn: 'Little discharge, more itching — rule out allergy or sugar' },
    // q55 (INF02) — sugar tested
    { questionIndex: 55, text: 'शुगर नहीं जांचा / बढ़ा हुआ — बार-बार फंगल संक्रमण में शुगर जांच जरूरी', textEn: 'Sugar not tested / high — with recurrent fungal infection a sugar test is essential' },
    { questionIndex: 55, text: 'शुगर सामान्य — संक्रमण का सीधा इलाज करें', textEn: 'Sugar normal — treat the infection directly' },
    // q56 (INF03) — frequency / smell
    { questionIndex: 56, text: 'बार-बार + जलन — सिस्टिटिस; पेशाब जांच भेजें', textEn: 'Frequency + burning — cystitis; send a urine test' },
    { questionIndex: 56, text: 'तेज बदबू — संक्रमण लगभग पक्का; जांच कराएं, पानी खूब पिएं', textEn: 'Strong smell — infection almost certain; get tested and hydrate well' },
    // q57 (INF03) — fever / LA pain
    { questionIndex: 57, text: 'बुखार + पेट दर्द — गुर्दे तक संक्रमण; जांच कराएं, इलाज लंबा होगा', textEn: 'Fever + lower abdominal pain — infection reaching the kidney; test, longer treatment' },
    { questionIndex: 57, text: 'सिर्फ जलन — सामान्य सिस्टिटिस; 3-5 दिन का इलाज', textEn: 'Burning only — simple cystitis; a 3-5 day course' },
    // q58 (INF04) — foul discharge duration
    { questionIndex: 58, text: 'तेज बदबू — बैक्टीरियल वैजिनोसिस की जांच कराएं', textEn: 'Strong smell — test for bacterial vaginosis' },
    { questionIndex: 58, text: 'हफ्तों से / पीब जैसा — पेल्विक संक्रमण (PID) की जांच जरूरी', textEn: 'For weeks / pus-like — pelvic infection (PID) workup needed' },
    // q59 (INF04) — pregnant / recent delivery / IUCD
    { questionIndex: 59, text: 'गर्भ में हैं — गर्भ-सुरक्षित इलाज चुनें; जांच कराएं', textEn: 'Pregnant — choose a pregnancy-safe treatment; get tested' },
    { questionIndex: 59, text: 'डिलीवरी / कॉपर-टी के बाद — जांच करें, जरूरत पर इलाज बदलें', textEn: 'After delivery / Copper-T — get tested and adjust treatment if needed' },
    // q60 (INF05) — sores duration
    { questionIndex: 60, text: 'नए दर्दनाक छाले — एसटीआई जांच (खून + स्वैब) कराएं', textEn: 'New painful sores — get STI workup (blood + swab)' },
    { questionIndex: 60, text: 'पुराने / बिना दर्द छाले — फिर भी जांच जरूरी, जरूरत पर बायोप्सी', textEn: 'Old / painless sores — still investigate, biopsy if needed' },
    // q61 (INF05) — partner similar
    { questionIndex: 61, text: 'दोनों का एक साथ इलाज — वरना बार-बार होगा', textEn: 'Treat both partners together — else it will recur' },
    { questionIndex: 61, text: 'साथी को नहीं — संक्रमण का स्रोत जांचें', textEn: 'Partner unaffected — look for the source of infection' },
    // q62 (FER01) — years trying
    { questionIndex: 62, text: '1 साल से ज्यादा (या 35 उम्र के बाद 6 महीने) — दोनों की निःसंतानता जांच शुरू करें', textEn: 'Over 1 year (or 6 months after age 35) — start couple infertility workup' },
    { questionIndex: 62, text: 'कम समय से कोशिश — माहवारी कैलेंडर रखें और उपजाऊ दिन पहचानें', textEn: 'Trying for a short time — keep a menstrual calendar and track fertile days' },
    // q63 (FER01) — cycles regular
    { questionIndex: 63, text: 'नियमित माहवारी — अंडोत्सर्ग की जांच (21वें दिन प्रोजेस्ट्रोन) कराएं', textEn: 'Regular cycles — check ovulation (day-21 progesterone)' },
    { questionIndex: 63, text: 'अनियमित — पहले PCOS / थायरॉइड / प्रोलैक्टिन जांचें', textEn: 'Irregular — first test PCOS / thyroid / prolactin' },
    // q64 (FER02) — cycle interval
    { questionIndex: 64, text: '35+ दिन का अंतर — PCOS जांच (हार्मोन + अल्ट्रासाउंड)', textEn: '35+ day gap — PCOS workup (hormones + ultrasound)' },
    { questionIndex: 64, text: 'सामान्य अंतर — अन्य कारण देखें', textEn: 'Normal gap — look for other causes' },
    // q65 (FER02) — acne / hair
    { questionIndex: 65, text: 'मुंहासे + बाल + मोटापा — PCOS की तिकड़ी; जांच कराएं', textEn: 'Acne + hair + weight — the PCOS triad; get tested' },
    { questionIndex: 65, text: 'दोनों नहीं — फिर भी हार्मोन जांच कराएं', textEn: 'Neither — still get hormone tests' },
    // q66 (FER03) — weight gained
    { questionIndex: 66, text: '6-12 महीने में 5-10 किलो या ज्यादा — इंसुलिन प्रतिरोध संभव; जांच + डाइट', textEn: '5-10 kg or more in 6-12 months — insulin resistance likely; test + diet' },
    { questionIndex: 66, text: 'धीरे-धीरे बढ़ा — डाइट और गतिविधि की समीक्षा करें', textEn: 'Gained slowly — review diet and activity' },
    // q67 (FER03) — sleep / fatigue / hairfall
    { questionIndex: 67, text: 'नींद + थकान + बाल झड़ना — थायरॉइड और विटामिन D जांच कराएं', textEn: 'Sleep + fatigue + hair fall — test thyroid and vitamin D' },
    { questionIndex: 67, text: 'ये नहीं — जीवनशैली सुधार जारी रखें', textEn: 'None of these — continue lifestyle changes' },
    // q68 (FER04) — hair onset
    { questionIndex: 68, text: 'किशोरावस्था से — वंशानुगत या PCOS दोनों संभव; जांच कराएं', textEn: 'Since teens — hereditary or PCOS both possible; get tested' },
    { questionIndex: 68, text: 'कुछ ही महीनों में अचानक — हार्मोन जांच जरूरी', textEn: 'Sudden onset over months — hormone tests needed' },
    // q69 (FER04) — hormonal medicine / steroid
    { questionIndex: 69, text: 'दवा का असर संभव — डॉक्टर से मिलकर दवा समीक्षा कराएं', textEn: 'Medicine effect possible — review the medicine with the doctor' },
    { questionIndex: 69, text: 'कोई दवा नहीं — टेस्टोस्टेरोन जांच कराएं', textEn: 'No medicine — get testosterone tested' },
    // q70 (FER05) — married / planning duration
    { questionIndex: 70, text: '1 साल से ज्यादा कोशिश — दोनों जोड़े की जांच शुरू करें', textEn: 'Trying over 1 year — start workup for both partners' },
    { questionIndex: 70, text: 'नई योजना — फॉलिक एसिड शुरू करें; टीटी और रूबेला जांच कराएं', textEn: 'Newly planning — start folic acid; get TT and rubella checks' },
    // q71 (FER05) — folic acid started
    { questionIndex: 71, text: 'शुरू कर ली है — बहुत अच्छा; गर्भ के पहले 3 महीने तक जारी रखें', textEn: 'Already started — excellent; continue till the first 3 months of pregnancy' },
    { questionIndex: 71, text: 'नहीं शुरू की — आज से 5 मिलीग्राम फॉलिक एसिड लेना शुरू करें', textEn: 'Not started — begin 5 mg folic acid from today' },
    // q72 (CON01) — family plan
    { questionIndex: 72, text: 'परिवार पूरा हो गया — लंबे समय के तरीके पर चर्चा करें (कॉपर-टी / नसबंदी)', textEn: 'Family complete — discuss long-term methods (Copper-T / sterilisation)' },
    { questionIndex: 72, text: 'अगला बच्चा चाहिए — फासला देने वाले तरीके देखें (गोली / कॉपर-टी)', textEn: 'Next child planned — look at spacing methods (pill / Copper-T)' },
    // q73 (CON01) — breastfeeding
    { questionIndex: 73, text: 'स्तनपान चालू — गर्भनिरोधक चुनाव सावधानी से करें (प्रोजेस्ट्रोन-आधारित / छाया)', textEn: 'Breastfeeding — choose contraception carefully (progestin-based / Chhaya)' },
    { questionIndex: 73, text: 'स्तनपान नहीं — सभी तरीके खुले हैं; विकल्प चार्ट देखें', textEn: 'Not breastfeeding — all options open; see the options chart' },
    // q74 (CON02) — IUCD history
    { questionIndex: 74, text: 'पहले लगवाई थी — पिछला अनुभव जानकर फिर से निर्णय करें', textEn: 'Used before — decide again knowing the past experience' },
    { questionIndex: 74, text: 'पहली बार — फायदे और ध्यान रखनी बातें समझें (पहले 2-3 महीने माहवारी भारी हो सकती है)', textEn: 'First time — understand benefits and cautions (periods may be heavier the first 2-3 months)' },
    // q75 (CON02) — heavy / painful periods
    { questionIndex: 75, text: 'भारी माहवारी — कॉपर-टी से और भारी हो सकती है; हार्मोनल विकल्प सोचें', textEn: 'Heavy periods — Copper-T may worsen them; consider a hormonal option' },
    { questionIndex: 75, text: 'सामान्य माहवारी — कॉपर-टी उपयुक्त विकल्प है', textEn: 'Normal periods — Copper-T is a suitable option' },
    // q76 (CON03) — which pill missed
    { questionIndex: 76, text: '12 घंटे से कम की देरी — याद आते ही लें; अगली गोली समय पर', textEn: 'Under 12 hours late — take it as soon as remembered; next pill on time' },
    { questionIndex: 76, text: '2+ गोलियां छूटीं — सुरक्षा कम; अगले 7 दिन कंडोम + जरूरत पर आपात गोली', textEn: '2+ pills missed — protection low; condoms for next 7 days + emergency pill if needed' },
    // q77 (CON03) — intercourse after miss
    { questionIndex: 77, text: 'हां — 72 घंटे के भीतर आपात गोली सोचें', textEn: 'Yes — consider the emergency pill within 72 hours' },
    { questionIndex: 77, text: 'नहीं — बस आगे की गोलियां समय पर लें', textEn: 'No — just take the upcoming pills on time' },
    // q78 (MENOP01) — flush frequency
    { questionIndex: 78, text: '1-5 बार प्रति दिन — सामान्य रजोनिवृत्ति लक्षण; प्याज, मिर्च, गरम पेय घटाएं', textEn: '1-5 times a day — normal menopausal symptom; cut onion, chilli, hot drinks' },
    { questionIndex: 78, text: '10+ बार या रात के पसीने — उपचार की जरूरत; डॉक्टर से मिलें', textEn: '10+ times or night sweats — needs treatment; see the doctor' },
    // q79 (MENOP01) — periods stopped
    { questionIndex: 79, text: '12 महीने से बिल्कुल नहीं — रजोनिवृत्ति पक्की; हड्डी और दिल की देखभाल शुरू करें', textEn: 'None for 12 months — menopause confirmed; start bone and heart care' },
    { questionIndex: 79, text: 'कभी-कभी धब्बे — परिवर्तनकाल संभव; जरूरत पर जांच', textEn: 'Occasional spotting — transition phase possible; test if needed' },
    // q80 (MENOP02) — years since menopause
    { questionIndex: 80, text: '12 महीने से ज्यादा बंद — अब कोई भी रक्तस्राव असामान्य है; तुरंत अल्ट्रासाउंड', textEn: 'Stopped over 12 months — any bleeding now is abnormal; urgent ultrasound' },
    { questionIndex: 80, text: 'हाल में बंद हुई हैं — परिवर्तनकालीन अनियमितता संभव; फिर भी जांच कराएं', textEn: 'Stopped recently — transition irregularity possible; still evaluate' },
    // q81 (MENOP02) — amount / duration
    { questionIndex: 81, text: 'कोई भी रक्तस्राव — गर्भाशय के गंभीर कारण निकालना जरूरी; अल्ट्रासाउंड + रेफर', textEn: 'Any bleeding — must rule out serious uterine causes; ultrasound + referral' },
    { questionIndex: 81, text: 'भूरे धब्बे एक दिन — फिर भी जांच कराएं, देर न करें', textEn: 'Brown spotting for a day — still investigate, do not delay' },
    // q82 (MENOP03) — pain sites
    { questionIndex: 82, text: 'कमर + घुटने — हड्डी की कमजोरी संभव; कैल्शियम और विटामिन D जांच कराएं', textEn: 'Back + knees — bone weakness likely; test calcium and vitamin D' },
    { questionIndex: 82, text: 'जोड़ों की सूजन या कड़ापन — गठिया की जांच कराएं', textEn: 'Joint swelling or stiffness — test for arthritis' },
    // q83 (MENOP03) — falls / fracture
    { questionIndex: 83, text: 'फ्रैक्चर हो चुका है — ऑस्टियोपोरोसिस जांच (DEXA) जरूरी', textEn: 'Fracture has occurred — osteoporosis test (DEXA) needed' },
    { questionIndex: 83, text: 'कभी नहीं — रोकथाम शुरू करें: कैल्शियम, D3 और व्यायाम', textEn: 'Never — start prevention: calcium, D3 and exercise' },
    // q84 (MENOP04) — sleep disturbed
    { questionIndex: 84, text: 'हफ्तों से नींद नहीं — नींद के उपाय आजमाएं; जरूरत पर उपचार', textEn: 'No sleep for weeks — try sleep measures; treatment if needed' },
    { questionIndex: 84, text: 'कभी-कभी — शाम की चाय और स्क्रीन घटाएं', textEn: 'Occasional — cut evening tea and screen time' },
    // q85 (MENOP04) — mood
    { questionIndex: 85, text: 'रोज चिड़चिड़ापन + उदासी — सहायता लें; यह इलाज योग्य हालत है', textEn: 'Daily irritability + low mood — take help; this is a treatable condition' },
    { questionIndex: 85, text: 'हल्का — व्यायाम और सामाजिक संपर्क मदद करते हैं', textEn: 'Mild — exercise and social contact help' },
    // q86 (BRS01) — lump since / growing
    { questionIndex: 86, text: 'नई या बढ़ती गांठ — अल्ट्रासाउंड / मैमोग्राफी और तुरंत रेफर', textEn: 'New or growing lump — ultrasound / mammography and urgent referral' },
    { questionIndex: 86, text: 'सालों से वैसी ही — फिर भी जांच दोहराएं', textEn: 'Same for years — still re-evaluate' },
    // q87 (BRS01) — painful / cycle change
    { questionIndex: 87, text: 'माहवारी के साथ बदलती — आमतौर पर सामान्य (फाइब्रोएडिनोसिस)', textEn: 'Changes with the cycle — usually benign (fibroadenosis)' },
    { questionIndex: 87, text: 'नहीं बदलती, दर्द भी नहीं — सावधानी बरतें और जांच कराएं', textEn: 'Fixed and painless — be cautious and investigate' },
    // q88 (BRS02) — cyclical pain
    { questionIndex: 88, text: 'साइकल से पहले बढ़ता — सामान्य साइक्लिक स्तन दर्द; कसी हुई ब्रा + गर्म सिकाई', textEn: 'Worse before the cycle — normal cyclical mastalgia; snug bra + warm compress' },
    { questionIndex: 88, text: 'साइकल से नहीं जुड़ा — जांच कराएं', textEn: 'Not linked to the cycle — investigate' },
    // q89 (BRS02) — red flags in breast
    { questionIndex: 89, text: 'लालिमा / गांठ / स्राव — तुरंत डॉक्टर को दिखाएं', textEn: 'Redness / lump / discharge — show the doctor now' },
    { questionIndex: 89, text: 'कुछ नहीं — सामान्य दर्द; सहायक उपाय करें', textEn: 'Nothing — ordinary pain; supportive measures' },
    // q90 (BRS03) — discharge colour
    { questionIndex: 90, text: 'खून या साफ पानी जैसा — तुरंत जांच; गंभीर कारण निकालें', textEn: 'Blood or watery — urgent workup; rule out serious causes' },
    { questionIndex: 90, text: 'दूध जैसा — दवा का असर या प्रोलैक्टिन जांच', textEn: 'Milky — medicine effect or prolactin check' },
    // q91 (BRS03) — drugs
    { questionIndex: 91, text: 'दवा का असर संभव — दवा समीक्षा कराएं', textEn: 'Medicine effect possible — get the medicine reviewed' },
    { questionIndex: 91, text: 'कोई दवा नहीं — प्रोलैक्टिन / थायरॉइड जांच कराएं', textEn: 'No medicine — test prolactin / thyroid' },
    // q92 (BRS04) — pain months
    { questionIndex: 92, text: '3-6 महीने से ज्यादा — पेल्विक अल्ट्रासाउंड और परीक्षण जरूरी', textEn: 'Over 3-6 months — pelvic ultrasound and examination needed' },
    { questionIndex: 92, text: 'नया दर्द — संक्रमण या अंडोत्सर्ग के कारण देखें', textEn: 'New pain — look for infection or ovulation causes' },
    // q93 (BRS04) — aggravating factors
    { questionIndex: 93, text: 'संबंध पर बढ़ता — गहरी जांच (एंडोमेट्रियोसिस / PID)', textEn: 'Worse with intercourse — deep workup (endometriosis / PID)' },
    { questionIndex: 93, text: 'पेशाब पर बढ़ता — मूत्राशय की जांच', textEn: 'Worse with urination — bladder evaluation' },
    // q94 (BRS05) — entry vs deep pain
    { questionIndex: 94, text: 'प्रवेश के समय — सूखापन या संक्रमण ज्यादा संभावना', textEn: 'At entry — dryness or infection more likely' },
    { questionIndex: 94, text: 'गहराई में — एंडोमेट्रियोसिस / PID निकालें', textEn: 'Deep — rule out endometriosis / PID' },
    // q95 (BRS05) — dryness / discharge
    { questionIndex: 95, text: 'सूखापन — मॉइस्चराइजर जेल; उम्र के अनुसार डॉक्टर की सलाह से एस्ट्रोजेन क्रीम', textEn: 'Dryness — moisturiser gel; age-appropriate estrogen cream only on doctor advice' },
    { questionIndex: 95, text: 'स्राव के साथ — पहले संक्रमण का इलाज कराएं', textEn: 'With discharge — treat the infection first' },
    // q96 (BRS06) — something coming down
    { questionIndex: 96, text: 'उतरने का एहसास — पेल्विक परीक्षण से प्रोलैप्स की डिग्री पता करें', textEn: 'Feeling of something coming down — pelvic examination to grade the prolapse' },
    { questionIndex: 96, text: 'सिर्फ भारीपन — पेशाब जांच और कब्ज नियंत्रण से सुधार हो सकता है', textEn: 'Heaviness only — may improve with urine check and constipation control' },
    // q97 (BRS06) — urine control
    { questionIndex: 97, text: 'रिसाव या खिंचाव — पेशाब जांच + पेल्विक फ्लोर व्यायाम (केगल) शुरू करें', textEn: 'Leakage or strain — urine test + start pelvic floor exercises (Kegel)' },
    { questionIndex: 97, text: 'नियंत्रण पूरा — सामान्य निगरानी रखें', textEn: 'Full control — keep routine monitoring' },
  ],

  // ══ Labels — vitals (12: standard + OBG-unique) ══════════════════════
  labels: [
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'आखिरी माहवारी (LMP)', labelEn: 'LMP (Last Menstrual Period)', unit: 'दिनांक', showUnit: false },
    { label: 'संभावित डिलीवरी तारीख (EDD)', labelEn: 'EDD (Expected Date of Delivery)', unit: 'दिनांक', showUnit: false },
    { label: 'गर्भ संख्या (Gravida)', labelEn: 'Gravida', unit: 'गणना', showUnit: false },
    { label: 'प्रसव संख्या (Para)', labelEn: 'Para', unit: 'गणना', showUnit: false },
    { label: 'गर्भाशय ऊंचाई', labelEn: 'Fundal Height', unit: 'cm' },
    { label: 'भ्रूण हृदय धड़कन (FHS)', labelEn: 'Fetal Heart Sounds', unit: '/min' },
    { label: 'हीमोग्लोबिन (Hb)', labelEn: 'Hemoglobin', unit: 'g/dl' },
    { label: 'पेशाब में एल्बुमिन', labelEn: 'Urine Albumin', unit: '', showUnit: false },
  ],

  // ══ Findings (30) ═════════════════════════════════════════════════════
  findings: [
    { key: 'ANC-IUP', name: 'गर्भाशयी गर्भावस्था — नियमित ANC', nameEn: 'Intrauterine Pregnancy — Routine ANC', icd10: 'Z34.9' },
    { key: 'PREG-CONFIRMED', name: 'पुष्ट गर्भावस्था (प्रथम त्रैमासिक)', nameEn: 'Confirmed Pregnancy (1st Trimester)', icd10: 'Z32.0' },
    { key: 'THREATENED-AB', name: 'गर्भपात का खतरा (निगरानी/रेफर)', nameEn: 'Threatened Abortion (monitor / refer)', icd10: 'O20.0' },
    { key: 'HYPEREMESIS', name: 'अतिशय गर्भ की उल्टी (हाइपररेमेसिस)', nameEn: 'Hyperemesis Gravidarum', icd10: 'O21.0' },
    { key: 'GEST-HTN', name: 'गर्भकालीन उच्च रक्तचाप', nameEn: 'Gestational Hypertension', icd10: 'O13' },
    { key: 'PRE-ECLAMPSIA', name: 'प्री-एक्लेम्प्सिया (तत्काल रेफर)', nameEn: 'Pre-eclampsia (refer urgently)', icd10: 'O14.9' },
    { key: 'ANEMIA-PREG', name: 'गर्भावस्था में एनीमिया', nameEn: 'Anemia in Pregnancy', icd10: 'O99.0' },
    { key: 'GDM', name: 'गर्भकालीन शुगर (GDM)', nameEn: 'Gestational Diabetes Mellitus', icd10: 'O24.4' },
    { key: 'UTI-PREG', name: 'गर्भावस्था में मूत्र संक्रमण', nameEn: 'Urinary Tract Infection in Pregnancy', icd10: 'O23.4' },
    { key: 'HYPOTHY-PREG', name: 'गर्भावस्था में थायरॉइड की कमी', nameEn: 'Hypothyroidism in Pregnancy', icd10: 'O99.2' },
    { key: 'PCOS', name: 'पीसीओएस (बहु-पुटक अंडाशय)', nameEn: 'Polycystic Ovary Syndrome', icd10: 'E28.2' },
    { key: 'MENORRHAGIA', name: 'भारी माहवारी', nameEn: 'Menorrhagia (Heavy Menstrual Bleeding)', icd10: 'N92.0' },
    { key: 'DYSMENORRHEA', name: 'सामान्य ऋतुशूल', nameEn: 'Primary Dysmenorrhea', icd10: 'N94.4' },
    { key: 'DUB', name: 'असामान्य गर्भाशय रक्तस्राव (DUB)', nameEn: 'Dysfunctional Uterine Bleeding', icd10: 'N93.8' },
    { key: 'AMENORRHEA-SEC', name: 'द्वितीयक अमेनोरिया (माहवारी बंद)', nameEn: 'Secondary Amenorrhea', icd10: 'N91.1' },
    { key: 'ANEMIA-IDA', name: 'आयरन की कमी वाला एनीमिया', nameEn: 'Iron Deficiency Anemia', icd10: 'D50.9' },
    { key: 'HYPOTHYROIDISM', name: 'हाइपोथायरॉइडिज़्म', nameEn: 'Hypothyroidism', icd10: 'E03.9' },
    { key: 'VAG-CANDID', name: 'योनि कैंडिडा संक्रमण (फंगल)', nameEn: 'Vaginal Candidiasis', icd10: 'B37.3' },
    { key: 'BV', name: 'बैक्टीरियल वैजिनोसिस', nameEn: 'Bacterial Vaginosis', icd10: 'N76.0' },
    { key: 'TRICHOMONAS', name: 'ट्राइकोमोनास संक्रमण', nameEn: 'Trichomoniasis', icd10: 'A59.01' },
    { key: 'UTI', name: 'मूत्र संक्रमण (सामान्य)', nameEn: 'Uncomplicated Urinary Tract Infection', icd10: 'N39.0' },
    { key: 'INFERTILITY-UE', name: 'निःसंतानता — जांच जारी', nameEn: 'Infertility — Workup / Unexplained', icd10: 'N97.9' },
    { key: 'FIBROID', name: 'फाइब्रॉयड गर्भाशय (रेफर)', nameEn: 'Fibroid Uterus (refer)', icd10: 'D25.9' },
    { key: 'MASTALGIA', name: 'स्तन दर्द', nameEn: 'Mastalgia (Breast Pain)', icd10: 'N64.4' },
    { key: 'FIBROADENOSIS', name: 'फाइब्रोएडिनोसिस (सौम्य स्तन बीमारी)', nameEn: 'Fibroadenosis (Benign Breast Disease)', icd10: 'N60.1' },
    { key: 'MASTITIS', name: 'स्तन शोथ (प्रसवोत्तर)', nameEn: 'Mastitis (Puerperal)', icd10: 'O91.0' },
    { key: 'POSTNATAL-FU', name: 'प्रसवोत्तर देखभाल', nameEn: 'Postnatal Care Follow-up', icd10: 'Z39.0' },
    { key: 'MENOPAUSE-SYND', name: 'रजोनिवृत्ति लक्षण समूह', nameEn: 'Menopausal Syndrome', icd10: 'N95.1' },
    { key: 'PMB', name: 'रजोनिवृत्ति के बाद रक्तस्राव (जांच अनिवार्य)', nameEn: 'Postmenopausal Bleeding (investigate)', icd10: 'N95.0' },
    { key: 'VITD-DEF', name: 'विटामिन D की कमी', nameEn: 'Vitamin D Deficiency', icd10: 'E55.9' },
  ],

  // ══ Medicines (76) — India OBG core ═══════════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense qty.
  // flags: pregnancy is THE critical flag for this pack (safe/caution/avoid);
  // verified=false until MBBS review. Trimester nuance lives in the salt note.
  medicines: [
    // — ANC staples: folic / iron / calcium / D3 —
    { name: 'Folvite 5 mg Tablet', salt: 'Folic Acid 5 mg — start before conception / 1st trimester; continue in pregnancy', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orofer XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg — pregnancy iron staple; tea/coffee reduces absorption', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Autrin Capsule', salt: 'Ferrous Fumarate 300 mg + Folic Acid + B12 + Vitamin C hematinic', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Livogen Tablet', salt: 'Ferrous Fumarate + Folic Acid hematinic', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dexorange Capsule', salt: 'Ferric Ammonium Citrate + Vitamin B12 + Folic Acid hematinic', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orofer S 100 Injection', salt: 'Iron Sucrose 100 mg IV — moderate-severe pregnancy anemia / oral intolerance; 2nd trimester onwards, clinic administration', doseOptions: ['1 vial (100 mg) IV in clinic'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU — ANC calcium (2nd trimester onwards) / bone support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calcimax Forte Tablet', salt: 'Calcium Citrate Malate + Magnesium + Zinc + Vitamin D3', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — weekly for deficiency', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zentel 400 Tablet', salt: 'Albendazole 400 mg (deworming) — in pregnancy give 2nd trimester onwards only; avoid 1st trimester', doseOptions: ['1 tab single dose (chew)'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // — pregnancy nausea & symptom relief —
    { name: 'Doxinate Tablet', salt: 'Doxylamine Succinate 10 mg + Pyridoxine HCl 10 mg — 1st-line pregnancy nausea', doseOptions: ['1 tab at bedtime', '1 tab twice daily', '1 tab thrice daily'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg mouth-dissolving — 2nd-line pregnancy nausea; avoid as routine 1st-trimester choice', doseOptions: ['1 tab', '1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Emeset 4 Tablet', salt: 'Ondansetron 4 mg — 2nd-line nausea anti-emetic; caution in 1st trimester', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Perinorm 10 Tablet', salt: 'Metoclopramide 10 mg — short-course nausea; caution in pregnancy (extrapyramidal risk)', doseOptions: ['1 tab before food'], morning: 1, afternoon: 1, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — the pregnancy-safe analgesic/antipyretic backbone', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Mucaine Gel 200ml', salt: 'Oxethazaine + Aluminium Hydroxide + Magnesium Hydroxide suspension — pregnancy heartburn', doseOptions: ['10 ml before meals SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone)', doseOptions: ['10 ml SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — persistent pregnancy reflux; short course preferred', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml — pregnancy constipation', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Enterogermina Oral Suspension', salt: 'Bacillus clausii spores 2 billion/5 ml probiotic', doseOptions: ['1 vial (5 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // — pregnancy medical disorders —
    { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine Sodium 25 mcg — early-morning empty stomach; dose per TSH', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine Sodium 50 mcg — pregnancy dose often needs increase', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Alphadopa 250 Tablet', salt: 'Methyldopa 250 mg — classic pregnancy-safe antihypertensive (PIH)', doseOptions: ['1 tab twice daily', '1 tab thrice daily per BP'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ecosprin 75 Tablet', salt: 'Aspirin 75 mg low-dose — ONLY for pre-eclampsia-prophylaxis in high-risk pregnancy on specialist advice; NOT analgesic use', doseOptions: ['1 tab after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // — anti-infectives (pregnancy-safe first, then non-pregnant) —
    { name: 'Niftran 100 Tablet', salt: 'Nitrofurantoin 100 mg — pregnancy UTI workhorse; AVOID near term (>36 weeks) and in G6PD deficiency', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sporidex 500 Capsule', salt: 'Cephalexin 500 mg — pregnancy-safe cephalosporin (UTI / mastitis)', doseOptions: ['1 cap thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ceftum 500 Tablet', salt: 'Cefuroxime Axetil 500 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — pregnancy-compatible broad antibiotic', doseOptions: ['1 tab twice daily', '1 tab thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zifi 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg', doseOptions: ['1 tab once daily × 3 days'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxt SL Tablet', salt: 'Doxycycline 100 mg + Lactic Acid Bacillus — TETRACYCLINE: contraindicated in pregnancy, non-pregnant use only', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cifran 500 Tablet', salt: 'Ciprofloxacin 500 mg — fluoroquinolone: avoid in pregnancy, non-pregnant use only', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'O2 Tablet', salt: 'Ofloxacin 200 mg + Ornidazole 500 mg — avoid in pregnancy, non-pregnant pelvic infection use', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Flagyl 400 Tablet', salt: 'Metronidazole 400 mg — BV/trichomonas; AVOID 1st trimester; strictly no alcohol during course', doseOptions: ['1 tab twice daily', '1 tab thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Secnil Forte Tablet', salt: 'Secnidazole 1 g — BV/trichomonas single-dose; NON-pregnant use only', doseOptions: ['2 tabs (1 g) single dose'], morning: 1, afternoon: 0, evening: 0, tab: 2, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metrogyl-V Gel 30g', salt: 'Metronidazole 0.75% vaginal gel — local BV therapy', doseOptions: ['1 applicatorful vaginally at bedtime × 5 nights'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Forcan 150 Tablet', salt: 'Fluconazole 150 mg — AVOID 1st trimester; single 150 mg dose acceptable later in pregnancy when needed', doseOptions: ['1 tab single dose'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'FAS-3 Kit', salt: 'Fluconazole 150 mg + Azithromycin 1 g + Secnidazole 2 g syndromic kit — NON-pregnant use only', doseOptions: ['1 kit single dose'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg — vulval allergy / itching', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // — vaginal topical (pregnancy-safe local route) —
    { name: 'Candid V3 Vaginal Tablet', salt: 'Clotrimazole 200 mg vaginal tablet × 3 nights — pregnancy-safe local antifungal', doseOptions: ['1 vaginal tablet at bedtime × 3 nights'], morning: 0, afternoon: 0, evening: 1, tab: 3, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Cream 20g', salt: 'Clotrimazole 1% w/w cream — vulval application', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid B Cream 15g', salt: 'Clotrimazole 1% + Beclomethasone 0.025% — inflamed vulval itch; short course, thin application', doseOptions: ['Apply thin layer twice daily (short course)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Vaginal Pessary', salt: 'Povidone-Iodine 200 mg vaginal pessary — mixed vaginitis; avoid prolonged use in pregnancy (iodine absorption)', doseOptions: ['1 pessary at bedtime × 7-14 nights'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // — hormonal gynecology (non-pregnant use — all flagged) —
    { name: 'Primolut-N 5 mg Tablet', salt: 'Norethisterone 5 mg — cycle control / heavy bleeding; NON-pregnant use only (rule out pregnancy first)', doseOptions: ['1 tab twice daily', '1 tab thrice daily then taper'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphaston 10 mg Tablet', salt: 'Dydrogesterone 10 mg — luteal support / threatened abortion (used IN pregnancy)', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Susten 200 Capsule', salt: 'Natural Micronized Progesterone 200 mg — luteal support / threatened abortion (oral or vaginal)', doseOptions: ['1 cap twice daily (oral/vaginal)'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Susten SR 300 Tablet', salt: 'Natural Micronized Progesterone 300 mg sustained release', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Naturogest 200 Capsule', salt: 'Natural Micronized Progesterone 200 mg (oral/vaginal)', doseOptions: ['1 cap twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Meprate 10 Tablet', salt: 'Medroxyprogesterone Acetate 10 mg — withdrawal bleed for amenorrhea; rule out pregnancy FIRST, non-pregnant use only', doseOptions: ['1 tab twice daily × 5-10 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Caberlin 0.5 Tablet', salt: 'Cabergoline 0.5 mg — hyperprolactinemic amenorrhea (per prolactin report); STOP once pregnant', doseOptions: ['half tab twice weekly'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fertomid 50 Tablet', salt: 'Clomiphene Citrate 50 mg — ovulation induction from day 2-5 of cycle; NON-pregnant use only', doseOptions: ['1 tab daily × 5 days (day 2-6 of cycle)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Letroz 2.5 Tablet', salt: 'Letrozole 2.5 mg — ovulation induction day 2-6; NON-pregnant use only (teratogenic if conceived)', doseOptions: ['1 tab daily × 5 days (day 2-6 of cycle)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Krimson-35 Tablet', salt: 'Ethinyl Estradiol 0.035 mg + Cyproterone Acetate 2 mg — PCOS with acne/hirsutism; OCP, NON-pregnant use only', doseOptions: ['1 tab nightly × 21 days, then 7-day gap'], morning: 0, afternoon: 0, evening: 1, tab: 21, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Yasmin Tablet', salt: 'Drospirenone 3 mg + Ethinyl Estradiol 0.03 mg combined OCP — contraception / PCOS cycle regulation', doseOptions: ['1 tab nightly × 21 days, then 7-day gap'], morning: 0, afternoon: 0, evening: 1, tab: 21, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Femilon Tablet', salt: 'Desogestrel 0.15 mg + Ethinyl Estradiol 0.02 mg low-dose combined OCP', doseOptions: ['1 tab nightly × 21 days, then 7-day gap'], morning: 0, afternoon: 0, evening: 1, tab: 21, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Chhaya Tablet', salt: 'Centchroman 30 mg — non-hormonal oral contraceptive (weekly × 12 weeks then twice weekly); breastfeeding-compatible', doseOptions: ['1 tab twice weekly (after initial weekly schedule)'], morning: 0, afternoon: 0, evening: 1, tab: 8, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Unwanted 72 Tablet', salt: 'Levonorgestrel 1.5 mg emergency contraceptive — within 72 hrs; NOT for routine contraception', doseOptions: ['1 tab ASAP within 72 hrs'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Depo Provera 150 Injection', salt: 'Medroxyprogesterone Acetate 150 mg IM depot — 3-monthly contraceptive injection (clinic-administered)', doseOptions: ['1 injection IM every 12 weeks'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // — PCOS / metabolic —
    { name: 'Glycomet 500 SR Tablet', salt: 'Metformin 500 mg sustained release — insulin resistance / PCOS; monitor in pregnancy', doseOptions: ['1 tab after dinner', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ovacare Forte Tablet', salt: 'Myo-Inositol + multivitamin-multimineral (PCOS ovarian support)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // — pain & bleeding control (NSAIDs: caution 1st/2nd, AVOID 3rd trimester) —
    { name: 'Trapic 500 Tablet', salt: 'Tranexamic Acid 500 mg — heavy menstrual bleeding (non-pregnant preferred use)', doseOptions: ['1 tab twice daily', '1 tab thrice daily on heavy days'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Trapic MF Tablet', salt: 'Tranexamic Acid 500 mg + Mefenamic Acid 250 mg — NSAID component: AVOID 3rd trimester; non-pregnant preferred', doseOptions: ['1 tab twice-thrice daily on heavy days'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Meftal Spas Tablet', salt: 'Mefenamic Acid 250 mg + Dicyclomine 10 mg — dysmenorrhea; NSAID: AVOID 3rd trimester', doseOptions: ['1 tab thrice daily with food', '1 tab SOS'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg — NSAID: caution 1st/2nd, AVOID 3rd trimester', doseOptions: ['1 tab SOS after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg — smooth-muscle antispasmodic for menstrual pain', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel — local back pain in pregnancy (limited area)', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Evion 400 Capsule', salt: 'Tocopheryl Acetate (Vitamin E) 400 mg — cyclical mastalgia / fibroadenosis support', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Urispas 200 Tablet', salt: 'Flavoxate Hydrochloride 200 mg — urinary spasm symptomatic relief', doseOptions: ['1 tab thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // — menopause (postmenopausal use only — all flagged avoid) —
    { name: 'Tibofem 2.5 Tablet', salt: 'Tibolone 2.5 mg — postmenopausal HRT only; contraindicated in pregnancy', doseOptions: ['1 tab daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Premarin 0.625 Tablet', salt: 'Conjugated Equine Estrogens 0.625 mg — postmenopausal HRT only, after risk-benefit review', doseOptions: ['1 tab daily (cyclic schedule as advised)'], morning: 1, afternoon: 0, evening: 0, tab: 28, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Evalon Cream 15g', salt: 'Estriol 0.1% vaginal cream — postmenopausal genitourinary atrophy only', doseOptions: ['0.5 g applicatorful at bedtime × 2-3 weeks, then maintenance'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Menopace Tablet', salt: 'Multivitamin-mineral menopause support supplement', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // — general supplements —
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (48) ════════════════════════════════════
  // NOTE: PMB (postmenopausal bleeding) and FIBROADENOSIS carry NO links by
  // design — investigate/refer before treating (safety decision, see header).
  findingMeds: [
    // ANC-IUP — routine antenatal care
    { findingKey: 'ANC-IUP', medicineName: 'Folvite 5 mg Tablet', dose: '1 tab OD', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Throughout pregnancy; with food' },
    { findingKey: 'ANC-IUP', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Iron from 2nd trimester / if anemic; avoid with tea' },
    { findingKey: 'ANC-IUP', medicineName: 'Shelcal 500 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Calcium from 2nd trimester onwards' },
    // PREG-CONFIRMED — first trimester
    { findingKey: 'PREG-CONFIRMED', medicineName: 'Folvite 5 mg Tablet', dose: '1 tab OD', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Start immediately — neural tube defect prevention' },
    // THREATENED-AB — refer if bleeding heavy/ongoing
    { findingKey: 'THREATENED-AB', medicineName: 'Susten 200 Capsule', dose: '1 cap BD (oral/vaginal)', morning: 1, afternoon: 0, evening: 1, tab: 20, description: 'Luteal support; rest + review USG in 1 week' },
    { findingKey: 'THREATENED-AB', medicineName: 'Duphaston 10 mg Tablet', dose: '1 tab BD', morning: 1, afternoon: 0, evening: 1, tab: 20, description: 'Alternative luteal support; REFER if bleeding becomes heavy' },
    // HYPEREMESIS
    { findingKey: 'HYPEREMESIS', medicineName: 'Ondem 4 MD Tablet', dose: '1 tab BD before meals', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Max 8 mg/day; 2nd-line after doxylamine-B6' },
    { findingKey: 'HYPEREMESIS', medicineName: 'Doxinate Tablet', dose: '1 tab TDS', morning: 1, afternoon: 1, evening: 1, tab: 15, description: '1st-line pregnancy antiemetic' },
    // GEST-HTN
    { findingKey: 'GEST-HTN', medicineName: 'Alphadopa 250 Tablet', dose: '1 tab BD-TDS per BP', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Check urine albumin; review BP in 48 hrs' },
    // PRE-ECLAMPSIA — REFER
    { findingKey: 'PRE-ECLAMPSIA', medicineName: 'Alphadopa 250 Tablet', dose: '1 tab TDS', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Pre-referral stabilization ONLY — REFER to hospital today' },
    // ANEMIA-PREG
    { findingKey: 'ANEMIA-PREG', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'First-line oral iron; repeat Hb in 6 weeks' },
    { findingKey: 'ANEMIA-PREG', medicineName: 'Autrin Capsule', dose: '1 cap BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Alternative oral hematinic' },
    { findingKey: 'ANEMIA-PREG', medicineName: 'Orofer S 100 Injection', dose: '1 vial IV (clinic)', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'If Hb ≤ 9 with intolerance — per protocol, 2nd trimester onwards' },
    // UTI-PREG
    { findingKey: 'UTI-PREG', medicineName: 'Niftran 100 Tablet', dose: '1 tab BD × 5-7 days', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Avoid near term (>36 wks); urine C&S before starting' },
    // HYPOTHY-PREG
    { findingKey: 'HYPOTHY-PREG', medicineName: 'Thyronorm 50 mcg Tablet', dose: '1 tab early morning empty stomach', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Dose per TSH — often increased in pregnancy; recheck TSH 4-6 weekly' },
    // PCOS
    { findingKey: 'PCOS', medicineName: 'Glycomet 500 SR Tablet', dose: '1 tab after dinner; titrate', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'With lifestyle: weight loss 5-10% is primary therapy' },
    { findingKey: 'PCOS', medicineName: 'Ovacare Forte Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Myo-inositol support; continue 3-6 months' },
    { findingKey: 'PCOS', medicineName: 'Krimson-35 Tablet', dose: '1 tab nightly × 21 days + 7-day gap', morning: 0, afternoon: 0, evening: 1, tab: 21, description: 'For hirsutism/acne — NON-pregnant use only' },
    // MENORRHAGIA
    { findingKey: 'MENORRHAGIA', medicineName: 'Trapic MF Tablet', dose: '1 tab BD-TDS on heavy days', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'From heavy days; max 5 days/course' },
    { findingKey: 'MENORRHAGIA', medicineName: 'Primolut-N 5 mg Tablet', dose: '1 tab TDS till control, then taper', morning: 1, afternoon: 0, evening: 1, tab: 20, description: 'Non-pregnant only — rule out pregnancy first' },
    // DYSMENORRHEA
    { findingKey: 'DYSMENORRHEA', medicineName: 'Meftal Spas Tablet', dose: '1 tab TDS with food × 3 days from onset', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Start at first sign of pain; heat therapy alongside' },
    { findingKey: 'DYSMENORRHEA', medicineName: 'Drotin DS Tablet', dose: '1 tab BD × 3 days', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Alternative/additive antispasmodic' },
    // DUB
    { findingKey: 'DUB', medicineName: 'Primolut-N 5 mg Tablet', dose: '1 tab BD × 21 days (cycle regulation)', morning: 1, afternoon: 0, evening: 1, tab: 20, description: 'After excluding pregnancy and organic cause' },
    // AMENORRHEA-SEC
    { findingKey: 'AMENORRHEA-SEC', medicineName: 'Meprate 10 Tablet', dose: '1 tab BD × 5-10 days', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Withdrawal test — ALWAYS rule out pregnancy first' },
    // VAG-CANDID
    { findingKey: 'VAG-CANDID', medicineName: 'Forcan 150 Tablet', dose: '1 tab single dose', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'NON-pregnant; avoid 1st trimester — use local therapy in pregnancy' },
    { findingKey: 'VAG-CANDID', medicineName: 'Candid V3 Vaginal Tablet', dose: '1 vaginal tablet at bedtime × 3 nights', morning: 0, afternoon: 0, evening: 1, tab: 3, description: 'Pregnancy-safe local route' },
    { findingKey: 'VAG-CANDID', medicineName: 'Candid Cream 20g', dose: 'Apply vulva BD', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'For external itching' },
    // BV
    { findingKey: 'BV', medicineName: 'Flagyl 400 Tablet', dose: '1 tab BD × 7 days', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'Avoid 1st trimester; NO alcohol during course' },
    { findingKey: 'BV', medicineName: 'Secnil Forte Tablet', dose: '2 tabs (1 g) single dose', morning: 1, afternoon: 0, evening: 0, tab: 2, description: 'NON-pregnant single-dose alternative' },
    // TRICHOMONAS
    { findingKey: 'TRICHOMONAS', medicineName: 'Flagyl 400 Tablet', dose: '1 tab BD × 7 days', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'Treat partner simultaneously; avoid 1st trimester' },
    { findingKey: 'TRICHOMONAS', medicineName: 'Secnil Forte Tablet', dose: '2 tabs (1 g) single dose', morning: 1, afternoon: 0, evening: 0, tab: 2, description: 'NON-pregnant; partner treatment too' },
    // UTI (non-pregnant)
    { findingKey: 'UTI', medicineName: 'Niftran 100 Tablet', dose: '1 tab BD × 5 days', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'First-line uncomplicated cystitis' },
    { findingKey: 'UTI', medicineName: 'Zifi 200 Tablet', dose: '1 tab BD × 5 days', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Alternative; drink 2-3 L water daily' },
    // INFERTILITY-UE
    { findingKey: 'INFERTILITY-UE', medicineName: 'Letroz 2.5 Tablet', dose: '1 tab OD day 2-6 of cycle', morning: 1, afternoon: 0, evening: 0, tab: 5, description: 'Ovulation induction — NON-pregnant use only; follicular monitoring advised' },
    { findingKey: 'INFERTILITY-UE', medicineName: 'Susten 200 Capsule', dose: '1 cap BD from ovulation', morning: 1, afternoon: 0, evening: 1, tab: 20, description: 'Luteal support post-induction' },
    // FIBROID — refer per size/symptoms
    { findingKey: 'FIBROID', medicineName: 'Trapic MF Tablet', dose: '1 tab BD on heavy days', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'Symptom control; surgical opinion per size' },
    { findingKey: 'FIBROID', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Correct associated anemia' },
    // MASTALGIA
    { findingKey: 'MASTALGIA', medicineName: 'Evion 400 Capsule', dose: '1 cap OD × 4-6 weeks', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Cyclical mastalgia support; well-fitting bra' },
    // MASTITIS — continue breastfeeding/pumping
    { findingKey: 'MASTITIS', medicineName: 'Sporidex 500 Capsule', dose: '1 cap TDS × 7 days', morning: 1, afternoon: 0, evening: 1, tab: 21, description: 'Breastfeeding-compatible antibiotic; empty the breast' },
    { findingKey: 'MASTITIS', medicineName: 'Augmentin 625 Tablet', dose: '1 tab TDS × 7 days', morning: 1, afternoon: 0, evening: 1, tab: 21, description: 'Alternative; if abscess suspected — refer for drainage' },
    // POSTNATAL-FU
    { findingKey: 'POSTNATAL-FU', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Continue × 6 weeks postpartum (longer if anemic)' },
    { findingKey: 'POSTNATAL-FU', medicineName: 'Chhaya Tablet', dose: '1 tab twice weekly (per label schedule)', morning: 0, afternoon: 0, evening: 1, tab: 8, description: 'Non-hormonal contraceptive — breastfeeding-compatible' },
    // MENOPAUSE-SYND
    { findingKey: 'MENOPAUSE-SYND', medicineName: 'Menopace Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Supplement support alongside lifestyle measures' },
    { findingKey: 'MENOPAUSE-SYND', medicineName: 'Tibofem 2.5 Tablet', dose: '1 tab OD', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'HRT — only after risk-benefit discussion; postmenopausal only' },
    // VITD-DEF
    { findingKey: 'VITD-DEF', medicineName: 'Uprise D3 60K Sachet', dose: '1 sachet weekly × 8 weeks', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'Then monthly maintenance; recheck level' },
    // ANEMIA-IDA (non-pregnant)
    { findingKey: 'ANEMIA-IDA', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Continue 8-12 weeks after Hb normalizes' },
    { findingKey: 'ANEMIA-IDA', medicineName: 'Livogen Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Alternative hematinic' },
    // HYPOTHYROIDISM (non-pregnant)
    { findingKey: 'HYPOTHYROIDISM', medicineName: 'Thyronorm 50 mcg Tablet', dose: '1 tab early morning empty stomach', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Dose per TSH; recheck in 6-8 weeks' },
  ],

  // ══ Table templates (5 — ANC ledger, menstrual calendar, contraception) ══
  tables: [
    {
      name: 'ANC Visit Ledger (10 visits)',
      rows: 10,
      cols: 7,
      headerLabel: ['क्रमांक', 'सप्ताह (गर्भ के)', 'बीपी', 'वजन (kg)', 'Hb', 'अल्ट्रासाउंड', 'सलाह'],
      colsLabel: ['Visit No', 'Weeks', 'BP', 'Weight (kg)', 'Hb', 'USG', 'Advice'],
      footerLabel: ['खतरे के लक्षण हों तो बिना देर आएं / Come without delay for danger signs'],
    },
    {
      name: 'Menstrual Calendar (30 days)',
      rows: 30,
      cols: 5,
      headerLabel: ['दिन', 'तारीख', 'बहाव', 'दर्द (0-10)', 'थक्के'],
      colsLabel: ['Day', 'Date', 'Flow', 'Pain (0-10)', 'Clots'],
      footerLabel: ['तीन महीने का रिकॉर्ड डॉक्टर को दिखाएं / Show 3 cycles of records to your doctor'],
    },
    {
      name: 'Contraception Options Chart',
      rows: 8,
      cols: 4,
      headerLabel: ['तरीका', 'कैसे काम करता है', 'प्रभावशीलता', 'किसके लिए उपयुक्त'],
      colsLabel: ['Method', 'How it works', 'Effectiveness', 'Suitable for'],
      footerLabel: ['स्तनपान कराने वाली मां के लिए डॉक्टर से पूछकर चुनें / Choose via doctor if breastfeeding'],
    },
    {
      name: 'Pregnancy Danger Signs Chart',
      rows: 10,
      cols: 2,
      headerLabel: ['खतरे का लक्षण', 'तुरंत क्या करें'],
      colsLabel: ['Danger sign', 'What to do immediately'],
      footerLabel: ['इनमें से कोई भी लक्षण हो तो बिना देर अस्पताल जाएं / Any of these — go to hospital without delay'],
    },
    {
      name: 'Fetal Movement Count — Kick Chart (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['दिन', 'समय (शाम)', 'हलचल की गिनती', 'टिप्पणी'],
      colsLabel: ['Day', 'Time (evening)', 'Movement count', 'Notes'],
      footerLabel: ['2 घंटे में 10 हलचल = सामान्य; कम हो तो तुरंत बताएं / 10 movements in 2 hrs = normal; report if less'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Routine ANC — 2nd Trimester',
      diagnosis: 'ANC-IUP',
      medicines: [
        { name: 'Folvite 5 mg Tablet', dose: '1 tab OD', duration: 'Ongoing', instructions: 'After food; continue through pregnancy' },
        { name: 'Orofer XT Tablet', dose: '1 tab BD', duration: 'Ongoing', instructions: 'After food; not with tea/coffee' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab OD', duration: 'Ongoing', instructions: 'After food; evening dose separated from iron by 2 hrs' },
        { name: 'Uprise D3 60K Sachet', dose: '1 sachet weekly', duration: '8 weeks', instructions: 'With milk' },
      ],
      labs: ['CBC + Hb', 'Urine Routine & Microscopy', 'Blood Group & Rh (if not done)', 'TSH', 'OGTT 75 g (24-28 weeks)', 'USG Anomaly Scan (18-22 weeks)', 'TT-1 dose (if due)'],
      advice: 'हल्का पौष्टिक भोजन · आयरन की गोली नींबू पानी या फल के साथ, चाय के साथ नहीं · रोज 30 मिनट टहलना · खतरे के लक्षण (चेहरे-हाथों की सूजन, तेज सिरदर्द, धुंधला दिखना, रक्तस्राव, पानी टूटना, बच्चे की हलचल कम) हों तो तुरंत आएं',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'UTI in Pregnancy — Preg-Safe Course',
      diagnosis: 'UTI-PREG',
      medicines: [
        { name: 'Niftran 100 Tablet', dose: '1 tab BD', duration: '5-7 days', instructions: 'After food; avoid near term (>36 weeks); urine C&S before starting if possible' },
        { name: 'Sporidex 500 Capsule', dose: '1 cap TDS', duration: '5 days', instructions: 'Alternative if nitrofurantoin unsuitable' },
      ],
      labs: ['Urine Routine & Microscopy', 'Urine Culture & Sensitivity', 'CBC'],
      advice: 'दिन में 8-10 गिलास पानी · पेशाब रोकें नहीं · निजी सफाई का ध्यान रखें · बुखार, कमर दर्द या उल्टी हो तो तुरंत बताएं',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'PCOS Starter — Metabolic + Lifestyle',
      diagnosis: 'PCOS',
      medicines: [
        { name: 'Glycomet 500 SR Tablet', dose: '1 tab after dinner', duration: '30 days', instructions: 'Titrate up as tolerated; with food' },
        { name: 'Ovacare Forte Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'After food' },
      ],
      labs: ['Serum Testosterone / LH / FSH', 'TSH', 'Serum Prolactin', 'Fasting Insulin + HbA1c', 'USG Pelvis (day 2-5 of cycle)'],
      advice: 'वजन 5-10% घटाना सबसे असरदार इलाज है · रोज 30-45 मिनट तेज चाल या व्यायाम · मैदा-चीनी घटाएं · नींद नियमित करें · माहवारी कैलेंडर रखें',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Primary Dysmenorrhea — Pain Control',
      diagnosis: 'DYSMENORRHEA',
      medicines: [
        { name: 'Meftal Spas Tablet', dose: '1 tab TDS with food', duration: '3 days', instructions: 'Start at the first sign of period pain' },
        { name: 'Trapic MF Tablet', dose: '1 tab BD', duration: '3-5 days', instructions: 'Only if flow is heavy; non-pregnant use' },
      ],
      labs: ['USG Pelvis (if pain persists or worsens — rule out endometriosis / fibroid)'],
      advice: 'दर्द शुरू होते ही दवा लें, दर्द बढ़ने पर देरी न करें · गर्म पानी की थैली पेट पर रखें · हल्का व्यायाम/योग मदद करता है · चाय-कॉफी-मैदा घटाएं · हर महीने दर्द बढ़े तो अल्ट्रासाउंड कराएं',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Vaginal Candidiasis — Pregnancy-Safe Local',
      diagnosis: 'VAG-CANDID',
      medicines: [
        { name: 'Candid V3 Vaginal Tablet', dose: '1 vaginal tablet at bedtime', duration: '3 nights', instructions: 'Pregnancy-safe local route' },
        { name: 'Candid Cream 20g', dose: 'Apply thin layer BD', duration: '7 days', instructions: 'External vulval itching' },
      ],
      labs: ['Blood Sugar (rule out diabetes / GDM)', 'Vaginal swab if recurrent'],
      advice: 'सूती और सूखे कपड़े पहनें · गुप्तांग साफ पानी से धोएं, साबुन/फेमवॉश जरूरी नहीं · मीठा खाना घटाएं · गर्भ में मुंह से एंटीफंगल नहीं — यह सुरक्षित स्थानिक इलाज है',
      followUpDays: 7,
    },
    {
      name: 'Menopause — Support & Bone Care',
      diagnosis: 'MENOPAUSE-SYND',
      medicines: [
        { name: 'Menopace Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'After food' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab OD', duration: 'Ongoing', instructions: 'After food' },
        { name: 'Uprise D3 60K Sachet', dose: '1 sachet weekly', duration: '8 weeks', instructions: 'With milk' },
      ],
      labs: ['TSH', 'Lipid Profile', 'FBS / HbA1c', 'Mammography (if due)', 'DEXA scan (if fracture risk factors)'],
      advice: 'गर्मी के झटके में तला-मिर्च-गरम पेय घटाएं, हल्के कपड़े पहनें · रोज 30 मिनट चाल और ताकत वाला व्यायाम · कैल्शियम युक्त भोजन (दूध, दही, रागी) · धूम्रपान/शराब बंद · हार्मोन थेरेपी (HRT) की जरूरत हो तो डॉक्टर से विस्तार से चर्चा करें',
      followUpDays: 30,
    },
  ],
}
