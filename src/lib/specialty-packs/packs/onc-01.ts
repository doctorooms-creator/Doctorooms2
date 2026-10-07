/**
 * ONC-01 — ONCOLOGY STARTER PACK (T2)
 *
 * Medical oncologist OPD — the SUPPORTIVE-CARE + symptom-control +
 * follow-up + counselling + referral infrastructure pack.
 *
 * ⚠ SCOPE PHILOSOPHY (deliberate):
 *   ZERO chemotherapy / targeted / immunotherapy medicine entries.
 *   Cytotoxic infusion is hospital/oncology-daycare territory. This pack
 *   only provides oral-supportive care, the WHO pain ladder, side-effect
 *   management, palliative-home support and EMERGENCY referral lines.
 *   Existing chemo/hormone/anti-cancer therapy appears ONLY as
 *   continuation-verify framing (questions + advice), never as a dose.
 *
 * Emergency rails baked in everywhere:
 *   - Neutropenic fever 38.3°C (101°F) = EMERGENCY admission, no waiting
 *     till morning, no "Crocin first" gamble.
 *   - Cord compression / SVC syndrome / raised ICP / tumor bleeding /
 *     hypercalcemia = EMERGENCY/urgent referral findings with ZERO
 *     findingMeds links.
 *   - Morphine = continuation-verify ONLY, never crush, laxative always.
 *   - No fake-cure content; India-specific anti-immunity-booster-scam lines.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India oncology-support
 * core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const ONC01_PACK: SpecialtyPack = {
  meta: {
    code: 'ONC-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Oncology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'WHO pain-ladder + India medical-oncology OPD supportive-care patterns · ZERO chemo/targeted/immuno entries (hospital-infusion territory; continuation-FU framing only) · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'FUP', name: 'कैंसर फॉलो-अप', nameEn: 'Cancer Follow-up' },
    { key: 'SYM', name: 'लक्षण-नियंत्रण', nameEn: 'Symptom Control' },
    { key: 'PAI', name: 'दर्द-प्रबंधन', nameEn: 'Pain Management' },
    { key: 'ADJ', name: 'उपचार-सहायक', nameEn: 'Treatment-Supportive' },
    { key: 'PAL', name: 'पैलिएटिव', nameEn: 'Palliative Care' },
    { key: 'OTH', name: 'अन्य', nameEn: 'Others' },
  ],

  // ══ Complaints (46) ═══════════════════════════════════════════════════
  complaints: [
    // FUP — Cancer follow-up
    { code: 'FUP01', categoryKey: 'FUP', detail: 'कैंसर का इलाज चालू — सामान्य जांच', detailEn: 'Cancer treatment ongoing — general check-up' },
    { code: 'FUP02', categoryKey: 'FUP', detail: 'कीमोथेरेपी साइकल पूरा — समीक्षा', detailEn: 'Chemotherapy cycle completed — review' },
    { code: 'FUP03', categoryKey: 'FUP', detail: 'कैंसर फॉलो-अप — स्थिर (निगरानी)', detailEn: 'Cancer follow-up — stable (surveillance)' },
    { code: 'FUP04', categoryKey: 'FUP', detail: 'कैंसर मार्कर बढ़ता — परामर्श', detailEn: 'Cancer marker rising — counselling' },
    { code: 'FUP05', categoryKey: 'FUP', detail: 'रक्त-कैंसर ज्ञात — फॉलो-अप', detailEn: 'Blood cancer known — follow-up' },
    { code: 'FUP06', categoryKey: 'FUP', detail: 'लिम्फोमा इलाज — फॉलो-अप', detailEn: 'Lymphoma treatment — follow-up' },
    { code: 'FUP07', categoryKey: 'FUP', detail: 'प्रोस्टेट कैंसर — हार्मोन इलाज फॉलो-अप', detailEn: 'Prostate cancer — hormone therapy follow-up' },
    { code: 'FUP08', categoryKey: 'FUP', detail: 'स्तन कैंसर — हार्मोन गोली फॉलो-अप', detailEn: 'Breast cancer — hormone tablet follow-up' },
    { code: 'FUP09', categoryKey: 'FUP', detail: 'थायरॉइड कैंसर ऑपरेटेड — सप्रेशन फॉलो-अप', detailEn: 'Thyroid cancer operated — suppression follow-up' },
    { code: 'FUP10', categoryKey: 'FUP', detail: 'कोलन कैंसर — स्टोमा देखभाल परामर्श', detailEn: 'Colon cancer — stoma care consult' },
    { code: 'FUP11', categoryKey: 'FUP', detail: 'स्टोमा मरीज़ — आहार परामर्श', detailEn: 'Stoma patient — diet consult' },
    { code: 'FUP12', categoryKey: 'FUP', detail: 'कैंसर फैलाव ज्ञात — जीवन-गुणवत्ता परामर्श', detailEn: 'Cancer spread known — quality-of-life consult' },
    // SYM — Symptom control
    { code: 'SYM01', categoryKey: 'SYM', detail: 'कीमो का साइड-इफेक्ट — मतली/उल्टी', detailEn: 'Chemo side-effect — nausea/vomiting' },
    { code: 'SYM02', categoryKey: 'SYM', detail: 'कीमो मुंह के छाले (म्यूकोसाइटिस)', detailEn: 'Chemo mouth ulcers (mucositis)' },
    { code: 'SYM03', categoryKey: 'SYM', detail: 'कीमो हाथ-पैर सुन्नपन (न्यूरोपैथी)', detailEn: 'Chemo hand-foot numbness (neuropathy)' },
    { code: 'SYM04', categoryKey: 'SYM', detail: 'कीमो बाल-झड़ना — परामर्श', detailEn: 'Chemo hair loss — counselling' },
    { code: 'SYM05', categoryKey: 'SYM', detail: 'कीमो दस्त', detailEn: 'Chemo diarrhoea' },
    { code: 'SYM06', categoryKey: 'SYM', detail: 'कीमो कब्ज', detailEn: 'Chemo constipation' },
    { code: 'SYM07', categoryKey: 'SYM', detail: 'कीमो भूख — बहुत कम', detailEn: 'Chemo appetite — severe loss' },
    { code: 'SYM08', categoryKey: 'SYM', detail: 'कैंसर थकान — बहुत ज्यादा', detailEn: 'Cancer tiredness — severe' },
    { code: 'SYM09', categoryKey: 'SYM', detail: 'कैंसर वजन-घटाव (कैशेक्सिया)', detailEn: 'Cancer weight loss (cachexia)' },
    { code: 'SYM10', categoryKey: 'SYM', detail: 'बढ़े कैंसर में सांस फूलना', detailEn: 'Breathlessness in advanced cancer' },
    { code: 'SYM11', categoryKey: 'SYM', detail: 'कीमो के बाद स्वाद बदलना', detailEn: 'Taste changes after chemo' },
    { code: 'SYM12', categoryKey: 'SYM', detail: 'कैंसर के साथ नींद की समस्या', detailEn: 'Sleep problem with cancer' },
    { code: 'SYM13', categoryKey: 'SYM', detail: 'बहुत ज्यादा प्यास/भ्रम (कैल्शियम जांच)', detailEn: 'Excessive thirst/confusion (calcium screen)' },
    // PAI — Pain management
    { code: 'PAI01', categoryKey: 'PAI', detail: 'कैंसर दर्द — हल्का (WHO सीढ़ी-1)', detailEn: 'Cancer pain — mild (WHO ladder-1)' },
    { code: 'PAI02', categoryKey: 'PAI', detail: 'कैंसर दर्द — मध्यम (सीढ़ी-2)', detailEn: 'Cancer pain — moderate (ladder-2)' },
    { code: 'PAI03', categoryKey: 'PAI', detail: 'कैंसर दर्द — तीव्र (सीढ़ी-3 निरंतरता)', detailEn: 'Cancer pain — severe (ladder-3 continuation)' },
    { code: 'PAI04', categoryKey: 'PAI', detail: 'कैंसर हड्डी-दर्द (मेटास्टेटिक)', detailEn: 'Cancer bone pain (metastatic)' },
    { code: 'PAI05', categoryKey: 'PAI', detail: 'मस्तिष्क-मेटास्टेसिस सिरदर्द (अत्यावश्यक)', detailEn: 'Brain metastasis headache (urgent)' },
    // ADJ — Treatment-supportive
    { code: 'ADJ01', categoryKey: 'ADJ', detail: 'कीमो बुखार — न्यूट्रोपेनिक (आपातकाल)', detailEn: 'Chemo fever — neutropenic (EMERGENCY)' },
    { code: 'ADJ02', categoryKey: 'ADJ', detail: 'मुंह कैंसर — तंबाकू छोड़ने का परामर्श', detailEn: 'Mouth cancer — tobacco cessation counselling' },
    { code: 'ADJ03', categoryKey: 'ADJ', detail: 'मुंह में सफेद धब्बा — ल्यूकोप्लाकिया जांच', detailEn: 'White patch in mouth — leukoplakia screen' },
    { code: 'ADJ04', categoryKey: 'ADJ', detail: 'गर्दन में गांठ — जांच रेफर', detailEn: 'Neck lump — workup referral' },
    { code: 'ADJ05', categoryKey: 'ADJ', detail: 'स्तन में गांठ — स्क्रीन रेफर', detailEn: 'Breast lump — screen referral' },
    { code: 'ADJ06', categoryKey: 'ADJ', detail: 'रीढ़-संपीड़न के संकेत (आपातकाल)', detailEn: 'Spinal cord compression signs (EMERGENCY)' },
    { code: 'ADJ07', categoryKey: 'ADJ', detail: 'SVC सिंड्रोम के संकेत (आपातकाल)', detailEn: 'SVC syndrome signs (EMERGENCY)' },
    { code: 'ADJ08', categoryKey: 'ADJ', detail: 'कैंसर से खून आना (अत्यावश्यक)', detailEn: 'Cancer bleeding (urgent)' },
    { code: 'ADJ09', categoryKey: 'ADJ', detail: 'आहार-इम्युनिटी परामर्श (भ्रम-निवारण)', detailEn: 'Diet-immunity consult (myth-busting)' },
    { code: 'ADJ10', categoryKey: 'ADJ', detail: 'पारिवारिक जेनेटिक जोखिम परामर्श (BRCA)', detailEn: 'Family genetic-risk counselling (BRCA)' },
    // PAL — Palliative care
    { code: 'PAL01', categoryKey: 'PAL', detail: 'पैलिएटिव देखभाल — पहला परामर्श', detailEn: 'Palliative care — first consult' },
    { code: 'PAL02', categoryKey: 'PAL', detail: 'होम-केयर — बिस्तर-बंद मरीज़ परामर्श', detailEn: 'Home care — bed-bound patient consult' },
    { code: 'PAL03', categoryKey: 'PAL', detail: 'अंतिम चरण — परिवार परामर्श (संवेदनशील)', detailEn: 'End-stage — family counselling (sensitive)' },
    { code: 'PAL04', categoryKey: 'PAL', detail: 'कैंसर घाव — घर पर देखभाल', detailEn: 'Cancer wound — home care' },
    { code: 'PAL05', categoryKey: 'PAL', detail: 'कैंसर के साथ डिप्रेशन (मनो-चिकित्सा समन्वय)', detailEn: 'Depression with cancer (coordinate PSY)' },
    { code: 'PAL06', categoryKey: 'PAL', detail: 'देखभालकर्ता थकान — परामर्श', detailEn: 'Caregiver burnout — consult' },
  ],

  // ══ Questions (92 — 2 per complaint; // idx N = true 0-based index) ════
  questions: [
    // idx 0 — FUP01
    { complaintCode: 'FUP01', question: 'कैंसर किस अंग का है और अवस्था (stage) क्या बताई गई?', questionEn: 'Which organ is the cancer in, and what stage was told?' },
    // idx 1 — FUP01
    { complaintCode: 'FUP01', question: 'इलाज कौन सा चल रहा है (गोली/कीमो/किरण) और अगली खुराक कब है?', questionEn: 'Which treatment is ongoing (tablet/chemo/radiation) and when is the next dose?' },
    // idx 2 — FUP02
    { complaintCode: 'FUP02', question: 'कीमो का कौन सा साइकल पूरा हुआ और आखिरी दिन कब था?', questionEn: 'Which chemo cycle completed, and what was the last day?' },
    // idx 3 — FUP02
    { complaintCode: 'FUP02', question: 'इस साइकल के बाद खून की रिपोर्ट (CBC) कब की थी?', questionEn: 'When was the blood test (CBC) done after this cycle?' },
    // idx 4 — FUP03
    { complaintCode: 'FUP03', question: 'पिछली स्कैन/रिपोर्ट कब हुई और क्या कही?', questionEn: 'When was the last scan/report, and what did it say?' },
    // idx 5 — FUP03
    { complaintCode: 'FUP03', question: 'अब कोई नया लक्षण या नया दर्द शुरू हुआ है?', questionEn: 'Any new symptom or new pain started now?' },
    // idx 6 — FUP04
    { complaintCode: 'FUP04', question: 'मार्कर की आखिरी वैल्यू क्या थी और पिछली से कितनी बदली?', questionEn: 'What was the last marker value, and how much did it change?' },
    // idx 7 — FUP04
    { complaintCode: 'FUP04', question: 'मार्कर बढ़ने की बात सुनकर घबराहट या नींद में दिक्कत हुई?', questionEn: 'After hearing the marker rose, any panic or sleep difficulty?' },
    // idx 8 — FUP05
    { complaintCode: 'FUP05', question: 'रक्त-कैंसर की दवाइयां नियमित चल रही हैं (निरंतरता-जांच)?', questionEn: 'Are the blood-cancer medicines continuing regularly (continuation check)?' },
    // idx 9 — FUP05
    { complaintCode: 'FUP05', question: 'हाल की CBC रिपोर्ट में हीमोग्लोबिन/प्लेटलेट कितने थे?', questionEn: 'What were the hemoglobin/platelets in the recent CBC report?' },
    // idx 10 — FUP06
    { complaintCode: 'FUP06', question: 'लिम्फोमा का इलाज पूरा हुआ है या चल रहा है?', questionEn: 'Is lymphoma treatment completed or ongoing?' },
    // idx 11 — FUP06
    { complaintCode: 'FUP06', question: 'गर्दन/कांख में कोई गांठ फिर दिखी है?', questionEn: 'Has any lump reappeared in the neck/armpit?' },
    // idx 12 — FUP07
    { complaintCode: 'FUP07', question: 'हार्मोन इंजेक्शन कब लगा था और अगला कब है?', questionEn: 'When was the hormone injection given, and when is the next?' },
    // idx 13 — FUP07
    { complaintCode: 'FUP07', question: 'हड्डियों में नया दर्द या पेशाब में जलन है?', questionEn: 'Any new bone pain or burning while passing urine?' },
    // idx 14 — FUP08
    { complaintCode: 'FUP08', question: 'हार्मोन गोली का नाम क्या है और रोज़ एक ही समय ले रहे हैं?', questionEn: 'What is the hormone tablet name, and are you taking it daily at the same time?' },
    // idx 15 — FUP08
    { complaintCode: 'FUP08', question: 'गोली के साथ गर्मी-लहरें या किसी पैर में दर्द/सूजन है?', questionEn: 'Any hot flushes, or pain/swelling in one leg with the tablet?' },
    // idx 16 — FUP09
    { complaintCode: 'FUP09', question: 'थायरॉइड गोली की खुराक क्या है और खाली पेट ले रहे हैं?', questionEn: 'What is the thyroid tablet dose, and is it taken empty stomach?' },
    // idx 17 — FUP09
    { complaintCode: 'FUP09', question: 'पिछली बार TSH रिपोर्ट में कितना आया था?', questionEn: 'What was the TSH value in the last report?' },
    // idx 18 — FUP10
    { complaintCode: 'FUP10', question: 'स्टोमा से दिन में कितनी बार आउटपुट आता है?', questionEn: 'How many times a day does stoma output come?' },
    // idx 19 — FUP10
    { complaintCode: 'FUP10', question: 'स्टोमा के आसपास की त्वचा पर लाली, खुजली या रिसाव है?', questionEn: 'Any redness, itching or leakage on the skin around the stoma?' },
    // idx 20 — FUP11
    { complaintCode: 'FUP11', question: 'दिन में कितनी बार और कैसा खाना लेते हैं?', questionEn: 'How many meals a day, and what type of food?' },
    // idx 21 — FUP11
    { complaintCode: 'FUP11', question: 'कौन सा खाना खाने पर दस्त/गैस ज्यादा होता है?', questionEn: 'Which foods cause more loose output or gas?' },
    // idx 22 — FUP12
    { complaintCode: 'FUP12', question: 'फैलाव की जानकारी के बाद सबसे बड़ी परेशानी क्या है?', questionEn: 'After learning of the spread, what troubles you the most?' },
    // idx 23 — FUP12
    { complaintCode: 'FUP12', question: 'रोज़ के कामों में से अब क्या-क्या कर पा रहे हैं?', questionEn: 'Which daily activities can you still manage?' },
    // idx 24 — SYM01
    { complaintCode: 'SYM01', question: 'मतली/उल्टी दिन में कितनी बार और कब सबसे ज्यादा?', questionEn: 'How many times a day nausea/vomiting, and when is it worst?' },
    // idx 25 — SYM01
    { complaintCode: 'SYM01', question: 'खाना-पानी रोक पा रहे हैं या सब उल्टी हो जाता है?', questionEn: 'Can you hold food and water, or does everything come up?' },
    // idx 26 — SYM02
    { complaintCode: 'SYM02', question: 'मुंह के छाले कितने गंभीर हैं — खाना निगलना मुमकिन है?', questionEn: 'How severe are the mouth ulcers — is swallowing food possible?' },
    // idx 27 — SYM02
    { complaintCode: 'SYM02', question: 'मुंह में सफेद परत या खून आना तो नहीं?', questionEn: 'Any white coating or bleeding in the mouth?' },
    // idx 28 — SYM03
    { complaintCode: 'SYM03', question: 'हाथों के सुन्नपन से कपड़े के बटन लगा पाते हैं?', questionEn: 'With hand numbness, can you still fasten buttons?' },
    // idx 29 — SYM03
    { complaintCode: 'SYM03', question: 'पैरों के सुन्नपन से चलते हुए ठोकर/गिरना होता है?', questionEn: 'With foot numbness, do you stumble or fall while walking?' },
    // idx 30 — SYM04
    { complaintCode: 'SYM04', question: 'बाल झड़ने से मन पर कितना असर है (थोड़ा/बहुत)?', questionEn: 'How much is the hair loss affecting your mind (a little/a lot)?' },
    // idx 31 — SYM04
    { complaintCode: 'SYM04', question: 'इलाज शुरू होने के कितने समय बाद बाल झड़ना शुरू हुआ?', questionEn: 'How long after starting treatment did hair loss begin?' },
    // idx 32 — SYM05
    { complaintCode: 'SYM05', question: 'दस्त दिन में कितनी बार और पानी जैसे हैं क्या?', questionEn: 'How many loose stools a day, and are they watery?' },
    // idx 33 — SYM05
    { complaintCode: 'SYM05', question: 'दस्त के साथ बुखार या खून तो नहीं आ रहा?', questionEn: 'Any fever or blood along with the stools?' },
    // idx 34 — SYM06
    { complaintCode: 'SYM06', question: 'कितने दिनों से पेट साफ नहीं हुआ?', questionEn: 'How many days since a proper bowel movement?' },
    // idx 35 — SYM06
    { complaintCode: 'SYM06', question: 'कब्ज के साथ पेट में दर्द या गैस भी है?', questionEn: 'Along with constipation, any abdominal pain or bloating?' },
    // idx 36 — SYM07
    { complaintCode: 'SYM07', question: 'खाना केवल तरल (पानी-दलिया) चल रहा है या थोड़ा ठोस भी?', questionEn: 'Is intake only liquids (water/porridge), or some solids too?' },
    // idx 37 — SYM07
    { complaintCode: 'SYM07', question: 'पिछले 3 महीने में वजन कितना घटा है?', questionEn: 'How much weight lost in the last 3 months?' },
    // idx 38 — SYM08
    { complaintCode: 'SYM08', question: 'कमजोरी से बिस्तर से उठ पाते हैं या दिनभर लेटे रहते हैं?', questionEn: 'Can you get out of bed, or do you stay lying down all day?' },
    // idx 39 — SYM08
    { complaintCode: 'SYM08', question: 'हाल की रिपोर्ट में हीमोग्लोबिन कितना था?', questionEn: 'What was the hemoglobin in the recent report?' },
    // idx 40 — SYM09
    { complaintCode: 'SYM09', question: 'कितने महीनों में कितना वजन घटा है?', questionEn: 'How much weight lost over how many months?' },
    // idx 41 — SYM09
    { complaintCode: 'SYM09', question: 'कपड़े ढीले हो गए हैं या चेहरा ही बैठ गया है?', questionEn: 'Have clothes become loose, or has the face become sunken?' },
    // idx 42 — SYM10
    { complaintCode: 'SYM10', question: 'सांस फूलती है — आराम की हालत में या चलने पर?', questionEn: 'Are you breathless — at rest, or on walking?' },
    // idx 43 — SYM10
    { complaintCode: 'SYM10', question: 'रात में लेटने पर सांस ज्यादा बिगड़ती है, तकिये टिकाने से सुधार?', questionEn: 'Worse lying flat at night, better propped up on pillows?' },
    // idx 44 — SYM11
    { complaintCode: 'SYM11', question: 'खाने का स्वाद कैसा लगता है — धातु जैसा या बेस्वाद?', questionEn: 'How does food taste — metallic or tasteless?' },
    // idx 45 — SYM11
    { complaintCode: 'SYM11', question: 'पानी या मांस जैसे खाने से घृणा/मतली होने लगी है?', questionEn: 'Have water or meat-like foods started causing aversion/nausea?' },
    // idx 46 — SYM12
    { complaintCode: 'SYM12', question: 'रात में कितने घंटे सो पाते हैं?', questionEn: 'How many hours do you sleep at night?' },
    // idx 47 — SYM12
    { complaintCode: 'SYM12', question: 'चिंता या दर्द से नींद टूटती है?', questionEn: 'Does worry or pain break your sleep?' },
    // idx 48 — SYM13
    { complaintCode: 'SYM13', question: 'प्यास कितनी ज्यादा लगती है और पेशाब दिन में कितनी बार?', questionEn: 'How excessive is the thirst, and how often do you urinate?' },
    // idx 49 — SYM13
    { complaintCode: 'SYM13', question: 'साथ में भ्रम, उल्टी या कब्ज भी शुरू हुआ है?', questionEn: 'Along with it, any confusion, vomiting or constipation too?' },
    // idx 50 — PAI01
    { complaintCode: 'PAI01', question: 'दर्द 0-10 में कितना है और रात में बढ़ता है क्या?', questionEn: 'What is the pain score 0-10, and does it worsen at night?' },
    // idx 51 — PAI01
    { complaintCode: 'PAI01', question: 'दर्द के लिए अभी कौन सी गोली चल रही है और दिन में कितनी बार?', questionEn: 'Which tablet is currently used for pain, and how many times a day?' },
    // idx 52 — PAI02
    { complaintCode: 'PAI02', question: 'दर्द 0-10 में कितना और दिनभर में कितनी बार अचानक टूटता (breakthrough) है?', questionEn: 'Pain score 0-10, and how many breakthrough episodes in 24 hours?' },
    // idx 53 — PAI02
    { complaintCode: 'PAI02', question: 'पैरासिटामोल से आराम मिलता है या बिल्कुल नहीं?', questionEn: 'Does paracetamol relieve the pain, or not at all?' },
    // idx 54 — PAI03
    { complaintCode: 'PAI03', question: 'तेज़ दर्द की गोली (मॉर्फिन जैसी) चल रही है — नाम/खुराक रिकॉर्ड में लिखी है?', questionEn: 'Is a strong pain tablet (morphine-type) running — name/dose written in records?' },
    // idx 55 — PAI03
    { complaintCode: 'PAI03', question: 'दवा लेने के बावजूद दर्द कितने घंटे में वापस आ जाता है?', questionEn: 'Despite the medicine, after how many hours does the pain return?' },
    // idx 56 — PAI04
    { complaintCode: 'PAI04', question: 'हड्डी का दर्द किस नई जगह शुरू हुआ है?', questionEn: 'At which new site has the bone pain started?' },
    // idx 57 — PAI04
    { complaintCode: 'PAI04', question: 'उस हिस्से पर हल्की रगड़/दबाव से दर्द बहुत बढ़ जाता है?', questionEn: 'Does slight pressure or touch over that spot greatly worsen the pain?' },
    // idx 58 — PAI05
    { complaintCode: 'PAI05', question: 'सिरदर्द सुबह उठते समय सबसे ज्यादा और उल्टी के साथ है?', questionEn: 'Is the headache worst on waking in the morning, with vomiting?' },
    // idx 59 — PAI05
    { complaintCode: 'PAI05', question: 'साथ में नज़र धुंधलाना, अचानक दौरा या भ्रम हुआ है?', questionEn: 'Any blurred vision, sudden fit or confusion along with it?' },
    // idx 60 — ADJ01
    { complaintCode: 'ADJ01', question: 'आज तापमान 38.3°C (101°F) या उससे ज्यादा नापा है?', questionEn: 'Have you recorded 38.3°C (101°F) or more today?' },
    // idx 61 — ADJ01
    { complaintCode: 'ADJ01', question: 'कीमो का आखिरी दिन कब था (10-14 दिन की खतरे की खिड़की)?', questionEn: 'When was the last chemo day (the 10-14 day danger window)?' },
    // idx 62 — ADJ02
    { complaintCode: 'ADJ02', question: 'रोज़ कितना पान-तंबाकू/गुटखा और कितने साल से (pack-years)?', questionEn: 'How much paan-tobacco/gutkha daily, and for how many years (pack-years)?' },
    // idx 63 — ADJ02
    { complaintCode: 'ADJ02', question: 'छोड़ने की तैयारी किस चरण में है — अभी सोच रहे हैं या तय कर चुके?', questionEn: 'Which stage of readiness to quit — still thinking, or already decided?' },
    // idx 64 — ADJ03
    { complaintCode: 'ADJ03', question: 'मुंह का सफेद धब्बा कब से है और रगड़ने से जाता है क्या?', questionEn: 'Since when is the white patch in the mouth, and does it rub off?' },
    // idx 65 — ADJ03
    { complaintCode: 'ADJ03', question: 'धब्बे पर दर्द, खुरदरापन या सख्ती महसूस होती है?', questionEn: 'Any pain, roughness or hardness felt over the patch?' },
    // idx 66 — ADJ04
    { complaintCode: 'ADJ04', question: 'गर्दन की गांठ कब से है और बढ़ रही है?', questionEn: 'Since when is the neck lump there, and is it growing?' },
    // idx 67 — ADJ04
    { complaintCode: 'ADJ04', question: 'साथ में वजन घटना या रात में पसीना आना भी है?', questionEn: 'Any weight loss or night sweats along with it?' },
    // idx 68 — ADJ05
    { complaintCode: 'ADJ05', question: 'स्तन की गांठ कब से है और माहवारी के साथ बदलती है?', questionEn: 'Since when is the breast lump, and does it change with menses?' },
    // idx 69 — ADJ05
    { complaintCode: 'ADJ05', question: 'गांठ के साथ त्वचा खिंचना या निपल से स्राव/खून है?', questionEn: 'Any skin dimpling or nipple discharge/blood with the lump?' },
    // idx 70 — ADJ06
    { complaintCode: 'ADJ06', question: 'पैरों में नई कमजोरी — उठाने/चलने में असमर्थता आई है?', questionEn: 'New weakness in legs — trouble lifting them or walking?' },
    // idx 71 — ADJ06
    { complaintCode: 'ADJ06', question: 'पेशाब रोक न पाना या अनायास रिसाव शुरू हो गया है?', questionEn: 'Unable to hold urine, or new involuntary leakage started?' },
    // idx 72 — ADJ07
    { complaintCode: 'ADJ07', question: 'चेहरे/गर्दन की सूजन और सांस फूलना साथ-साथ है?', questionEn: 'Facial/neck swelling and breathlessness together?' },
    // idx 73 — ADJ07
    { complaintCode: 'ADJ07', question: 'सुबह उठने पर सूजन ज्यादा और झुकने पर सिर भारी लगता है?', questionEn: 'Swelling worse on waking, and head feels heavy on bending forward?' },
    // idx 74 — ADJ08
    { complaintCode: 'ADJ08', question: 'खून कहां से आ रहा है और कितनी मात्रा में?', questionEn: 'From where is the bleeding, and how much?' },
    // idx 75 — ADJ08
    { complaintCode: 'ADJ08', question: 'प्लेटलेट कम बताए गए हैं या बुखार भी साथ है?', questionEn: 'Have platelets been reported low, or is there fever too?' },
    // idx 76 — ADJ09
    { complaintCode: 'ADJ09', question: 'इम्युनिटी के लिए क्या-क्या ले रहे हैं (हल्दी-कैप्सूल, बूस्टर पाउडर)?', questionEn: 'What all are you taking for immunity (turmeric capsules, booster powders)?' },
    // idx 77 — ADJ09
    { complaintCode: 'ADJ09', question: 'किसी ने कोई महंगा ‘कैंसर मिटाने वाला’ उत्पाद सुझाया है?', questionEn: 'Has anyone suggested an expensive "cancer-curing" product?' },
    // idx 78 — ADJ10
    { complaintCode: 'ADJ10', question: 'परिवार में किसे कैंसर हुआ और किस उम्र में हुआ था?', questionEn: 'Who in the family had cancer, and at what age?' },
    // idx 79 — ADJ10
    { complaintCode: 'ADJ10', question: 'परिवार में कितने लोगों को स्तन/अंडाशय का कैंसर हुआ है?', questionEn: 'How many family members have had breast/ovarian cancer?' },
    // idx 80 — PAL01
    { complaintCode: 'PAL01', question: 'इलाज का लक्ष्य आप कैसे समझते हैं — आराम या इलाज?', questionEn: 'How do you understand the goal of treatment — comfort or cure?' },
    // idx 81 — PAL01
    { complaintCode: 'PAL01', question: 'इस समय सबसे बड़ी परेशानी क्या है?', questionEn: 'What is the biggest problem right now?' },
    // idx 82 — PAL02
    { complaintCode: 'PAL02', question: 'मरीज़ बिस्तर से उठता है या पूरी तरह बिस्तर-बंद है?', questionEn: 'Does the patient get out of bed, or fully bed-bound?' },
    // idx 83 — PAL02
    { complaintCode: 'PAL02', question: 'बिस्तर पर पलटने/साफ़ करने में कौन मदद करता है?', questionEn: 'Who helps with turning/cleaning in bed?' },
    // idx 84 — PAL03
    { complaintCode: 'PAL03', question: 'परिवार को मरीज़ की हालत की जानकारी कितनी है?', questionEn: 'How aware is the family of the patient\'s condition?' },
    // idx 85 — PAL03
    { complaintCode: 'PAL03', question: 'मरीज़ को खुद कितना पता है और वे आगे क्या चाहते हैं?', questionEn: 'How much does the patient know, and what do they want ahead?' },
    // idx 86 — PAL04
    { complaintCode: 'PAL04', question: 'घाव से दुर्गंध, रिसाव या खून आता है?', questionEn: 'Does the wound have odor, discharge or bleeding?' },
    // idx 87 — PAL04
    { complaintCode: 'PAL04', question: 'घाव की पट्टी दिन में कितनी बार बदलते हैं?', questionEn: 'How many times a day is the dressing changed?' },
    // idx 88 — PAL05
    { complaintCode: 'PAL05', question: 'मन उदास/निराश रहता है — कितने दिनों से?', questionEn: 'Feeling low/hopeless — since how many days?' },
    // idx 89 — PAL05
    { complaintCode: 'PAL05', question: 'खाने-नींद पर असर है या इलाज छोड़ने की सोच आती है?', questionEn: 'Is food/sleep affected, or are there thoughts of skipping treatment?' },
    // idx 90 — PAL06
    { complaintCode: 'PAL06', question: 'देखभाल के कारण रात में कितने घंटे सो पाते हैं?', questionEn: 'Because of caregiving, how many hours do you sleep at night?' },
    // idx 91 — PAL06
    { complaintCode: 'PAL06', question: 'देखभाल में आपकी जगह कौन-सा बदला (सहायक) उपलब्ध है?', questionEn: 'Who is available as your substitute (helper) in caregiving?' },
  ],

  // ══ Suggestions (184 — exactly 2 per question, questionIndex 0-91) ═══
  suggestions: [
    // q0
    { questionIndex: 0, text: 'अवस्था (stage) का पता होना इलाज की दिशा तय करता है — रिपोर्ट लेकर आएं', textEn: 'Knowing the stage guides the treatment direction — bring your reports' },
    { questionIndex: 0, text: 'रिपोर्ट में अवस्था न लिखी हो तो इलाज करने वाले डॉक्टर से लिखवा लें और हमेशा साथ रखें', textEn: 'If the stage is not written in reports, ask the treating doctor to note it — keep it with you always' },
    // q1
    { questionIndex: 1, text: 'चालू दवाइयां नियम से लें — बिना पूछे कभी न रोकें, कभी खुद खुराक न बदलें', textEn: 'Take ongoing medicines regularly — never stop without asking, never change dose yourself' },
    { questionIndex: 1, text: 'अगली खुराक/साइकल की तारीख डायरी में लिखें — देरी होने पर उसी दिन बताएं', textEn: 'Note the next dose/cycle date in a diary — report any delay the same day' },
    // q2
    { questionIndex: 2, text: 'साइकल के बाद 7-10 दिन खास देखभाल — खून की रिपोर्ट समय पर कराएं', textEn: 'The 7-10 days after a cycle need special care — get blood tests on time' },
    { questionIndex: 2, text: 'आखिरी कीमो से 10-14 दिन बाद बुखार का खतरा सबसे ज्यादा होता है — तापमान रोज़ नापें', textEn: 'Fever risk is highest 10-14 days after the last chemo — record temperature daily' },
    // q3
    { questionIndex: 3, text: 'CBC रिपोर्ट लेकर आएं — काउंट कम हों तो अगला साइकल टल सकता है', textEn: 'Bring the CBC report — low counts can delay the next cycle' },
    { questionIndex: 3, text: 'रिपोर्ट नहीं हुई हो तो आज ही करा लें — इलाज की तारीखें इसी पर तय होती हैं', textEn: 'If not done, get it today — treatment dates depend on it' },
    // q4
    { questionIndex: 4, text: 'स्कैन की रिपोर्ट + CD दोनों लाएं — पुरानी से तुलना जरूरी होती है', textEn: 'Bring both the scan report and CD — comparison with the old one is needed' },
    { questionIndex: 4, text: 'अगली स्कैन की तारीख डायरी में लिखकर रखें — कभी छूटने न दें', textEn: 'Write the next scan date in your diary — never miss it' },
    // q5
    { questionIndex: 5, text: 'कोई भी नया लक्षण बताएं — छोटा समझकर न छोड़ें, नए लक्षण जांच मांगते हैं', textEn: 'Report every new symptom — do not dismiss it as minor; new symptoms need checking' },
    { questionIndex: 5, text: 'नया दर्द या सूजन आए तो इंतज़ार न करें — तुरंत संपर्क करें', textEn: 'With any new pain or swelling, do not wait — contact immediately' },
    // q6
    { questionIndex: 6, text: 'मार्कर का बढ़ना बीमारी लौटने का पक्का सबूत नहीं — अकेले इसे देखकर न घबराएं', textEn: 'A rising marker is not definite proof of disease return — do not panic on the number alone' },
    { questionIndex: 6, text: 'बार-बार बढ़ता मार्कर आगे की जांच का संकेत है — इलाज करने वाले डॉक्टर से मिलें', textEn: 'A repeatedly rising marker signals further workup — meet the treating doctor' },
    // q7
    { questionIndex: 7, text: 'संख्या देखकर घबराहट स्वाभाविक है — पर आगे की योजना डॉक्टर ही बनाते हैं, आप अकेले नहीं', textEn: 'Panic over numbers is natural — but the forward plan is made by doctors, not by you alone' },
    { questionIndex: 7, text: 'नींद टूट रही हो तो बताएं — नींद की हल्की मदद उपलब्ध है', textEn: 'If your sleep is broken, say so — mild help for sleep is available' },
    // q8
    { questionIndex: 8, text: 'दवाइयां रोज़ एक ही समय पर लें — खुराक छूटे तो उसी दिन डॉक्टर को बताएं', textEn: 'Take medicines at the same time daily — if a dose is missed, inform the doctor the same day' },
    { questionIndex: 8, text: 'दवा छोड़ने की सोच आना सामान्य है — खुलकर बात करें, पर अचानक कभी न रोकें', textEn: 'Thinking of stopping medicines is common — talk openly, but never stop abruptly' },
    // q9
    { questionIndex: 9, text: 'हीमोग्लोबिन 8 से कम हो तो डॉक्टर से पूछें — खून चढ़ाना या आयरन, दोनों विकल्प हैं', textEn: 'If hemoglobin is under 8, ask the doctor — transfusion or iron, both are options' },
    { questionIndex: 9, text: 'प्लेटलेट 20 हज़ार से कम हों — चोट/रगड़ से बचें, दांतों पर हल्का ब्रश करें', textEn: 'If platelets under 20 thousand — avoid injury/friction, brush teeth gently' },
    // q10
    { questionIndex: 10, text: 'इलाज पूरा हो चुका हो तो फॉलो-अप कभी न छोड़ें — गांठ, वजन, रात का पसीना देखते रहें', textEn: 'If treatment is complete, never skip follow-ups — keep watching for lumps, weight loss, night sweats' },
    { questionIndex: 10, text: 'इलाज चल रहा हो तो साइकल की तारीखें डायरी में लिखकर रखें', textEn: 'If treatment is ongoing, keep cycle dates written in a diary' },
    // q11
    { questionIndex: 11, text: 'गांठ का फिर दिखना तुरंत बताने वाली बात है — इलाज करने वाले डॉक्टर से जल्दी मिलें', textEn: 'A lump reappearing needs immediate reporting — see the treating doctor soon' },
    { questionIndex: 11, text: 'नई गांठ का नाप और तारीख नोट करें — बढ़ती हुई हो तो जल्दी जांच कराएं', textEn: 'Note the new lump size and date — if growing, get it checked soon' },
    // q12
    { questionIndex: 12, text: 'हार्मोन इंजेक्शन समय पर ही लगवाएं — देरी से बीमारी का नियंत्रण बिगड़ता है', textEn: 'Get the hormone injection on schedule — delays spoil disease control' },
    { questionIndex: 12, text: 'कोई खुराक छूट गई हो तो आज ही बताएं — शेड्यूल फिर से जुड़वाएं', textEn: 'If a dose was missed, tell today itself — get the schedule rebooked' },
    // q13
    { questionIndex: 13, text: 'हड्डियों में नया दर्द बताएं — फैलाव की जांच (स्कैन) करानी हो सकती है', textEn: 'Report new bone pain — a spread workup (scan) may be needed' },
    { questionIndex: 13, text: 'पेशाब में जलन हो तो इन्फेक्शन की जांच कराएं — बुखार आए तो तुरंत आएं', textEn: 'If burning urination, test for infection — if fever comes, visit immediately' },
    // q14
    { questionIndex: 14, text: 'हार्मोन गोली (जैसे टैमोक्सिफेन) का नाम रिकॉर्ड पर लिखवाकर रखें — रोज़ एक ही समय लें', textEn: 'Get the hormone tablet (e.g. tamoxifen) name written in records — take it daily at a fixed time' },
    { questionIndex: 14, text: 'गोली छूट रही हो तो डॉक्टर को बताएं — खुद खुराक न घटाएं-बढ़ाएं', textEn: 'If doses are being missed, tell the doctor — do not reduce or increase the dose yourself' },
    // q15
    { questionIndex: 15, text: 'गर्मी-लहरें इन गोलियों का सामान्य साइड-इफेक्ट हैं — ठंडा पानी और हल्के कपड़े मदद करते हैं', textEn: 'Hot flushes are a common side-effect of these tablets — cool water and light clothing help' },
    { questionIndex: 15, text: 'एक पैर में दर्द/सूजन तुरंत बताएं — खून का थक्का जांचना होगा', textEn: 'Pain/swelling in one leg — report at once; a clot needs to be ruled out' },
    // q16
    { questionIndex: 16, text: 'थायरॉइड गोली सुबह खाली पेट लें — खाने/दूध से कम-से-कम आधे घंटे पहले', textEn: 'Take the thyroid tablet on an empty stomach in the morning — at least half an hour before food/milk' },
    { questionIndex: 16, text: 'कैल्शियम/आयरन की गोली थायरॉइड वाली गोली से 4 घंटे का अंतर रखें', textEn: 'Keep calcium/iron tablets 4 hours apart from the thyroid tablet' },
    // q17
    { questionIndex: 17, text: 'TSH रिपोर्ट हर बार लाएं — खुराक सिर्फ इसी हिसाब से बदली जाती है', textEn: 'Bring the TSH report every visit — the dose is adjusted only by this' },
    { questionIndex: 17, text: 'TSH का बहुत दबा रहना जानबूझकर होता है (सप्रेशन) — घबराएं नहीं, हड्डी की देखभाल जारी रखें', textEn: 'A very suppressed TSH is intentional (suppression) — do not worry; continue bone care' },
    // q18
    { questionIndex: 18, text: 'दिन में 3-6 बार आउटपुट सामान्य माना जाता है — रोज़ का रिकॉर्ड रखें', textEn: '3-6 outputs a day is considered normal — keep a daily record' },
    { questionIndex: 18, text: 'बहुत ज्यादा पतला/बार-बार आउटपुट हो तो ORS लें और डॉक्टर को दिखाएं', textEn: 'Very frequent watery output — take ORS and show the doctor' },
    // q19
    { questionIndex: 19, text: 'त्वचा लाल हो तो बैग तुरंत बदलें — आसपास बाधा-क्रीम (बैरियर क्रीम) लगाएं', textEn: 'If skin is red, change the appliance at once — apply barrier cream around' },
    { questionIndex: 19, text: 'रिसाव रुक नहीं रहा हो तो स्टोमा-केयर नर्स से मिलें — बैग का साइज़/फिट जांच होगा', textEn: 'If leakage persists, meet the stoma-care nurse — bag size/fit needs checking' },
    // q20
    { questionIndex: 20, text: 'थोड़ा-थोड़ा, बार-बार खाना बेहतर — दिन में 5-6 छोटे भोजन रखें', textEn: 'Small and frequent is better — aim for 5-6 small meals a day' },
    { questionIndex: 20, text: 'भरपूर पानी दिनभर धीरे-धीरे पिएं — एक साथ बहुत नहीं', textEn: 'Take plenty of water spread through the day — not all at once' },
    // q21
    { questionIndex: 21, text: 'गैस/दस्त बढ़ाने वाले खाने की सूची बनाएं — प्याज़, बड़ी दालें, तला-मसाला घटाएं', textEn: 'List the foods that increase gas/output — cut down onion, heavy dals, fried-spicy' },
    { questionIndex: 21, text: 'नया खाना एक-एक करके आजमाएं — शरीर बता देगा क्या चल रहा है', textEn: 'Try new foods one at a time — the body will show what suits' },
    // q22
    { questionIndex: 22, text: 'हर मरीज़ की परेशानी अलग होती है — जो आपको सबसे चुभता है, वही पहले संभाला जाएगा', textEn: 'Every patient\'s burden is different — what troubles you most gets addressed first' },
    { questionIndex: 22, text: 'जीवन-गुणवत्ता भी इलाज है — नींद, दर्द और भूख तीनों पर ध्यान दिया जाएगा', textEn: 'Quality of life is treatment too — sleep, pain and appetite, all three will be attended' },
    // q23
    { questionIndex: 23, text: 'जो काम कर पा रहे हैं उन्हें बनाए रखें — हल्की सैर और दिनचर्या बनाए रखना अच्छा है', textEn: 'Keep up what you can still do — light walks and routine are good for you' },
    { questionIndex: 23, text: 'बहुत थकान हो तो काम बांटें — आराम भी दवा की तरह जरूरी है', textEn: 'If very tired, spread out the work — rest works like a medicine too' },
    // q24
    { questionIndex: 24, text: 'छोटे-ठंडे बार-बार भोजन लें — गरम खाने की गंध से बचें, खाना दूर रखकर खाएं', textEn: 'Take small, cool, frequent meals — avoid hot-food smells; eat away from the kitchen' },
    { questionIndex: 24, text: 'मतली की गोली उल्टी शुरू होने से पहले/खाने से पहले लें — जी मिचलाने पर रुकें नहीं', textEn: 'Take the nausea tablet before vomiting starts / before meals — do not wait for vomiting' },
    // q25
    { questionIndex: 25, text: 'खाना-पानी रुक नहीं रहा — जांच कर ड्रिप (IV) की जरूरत हो सकती है, देर न करें', textEn: 'Unable to hold food/water — after check-up, IV fluids may be needed; do not delay' },
    { questionIndex: 25, text: 'एक दिन से ज्यादा सब कुछ उल्टी हो रहा है — आज ही अस्पताल जाएं', textEn: 'Everything coming up for over a day — go to the hospital today' },
    // q26
    { questionIndex: 26, text: 'नमक + मीठा सोडा कुल्ला: 1 गिलास गुनगुने पानी में आधा चम्मच नमक + आधा चम्मच मीठा सोडा — दिन में 6 बार', textEn: 'Salt + baking-soda rinse: 1 glass warm water + ½ tsp salt + ½ tsp baking soda — 6 times a day' },
    { questionIndex: 26, text: 'नरम-ठंडा खाना लें (दही, खीर, केला, सूजी) — तीखा, गरम, कुरकुरा और शराब-वाली माउथवॉश से बचें', textEn: 'Eat soft-cool foods (curd, kheer, banana, suji) — avoid spicy, hot, crunchy foods and alcohol-based mouthwash' },
    // q27
    { questionIndex: 27, text: 'सफेद परत छूने से न जाती हो — फंगल (थ्रश) जांच चाहिए, बताएं', textEn: 'If the white coat does not rub off — a fungal (thrush) check is needed; report it' },
    { questionIndex: 27, text: 'मुंह से खून आना प्लेटलेट कम होने का संकेत हो सकता है — CBC रिपोर्ट दिखाएं', textEn: 'Bleeding from the mouth may indicate low platelets — show the CBC report' },
    // q28
    { questionIndex: 28, text: 'बटन/चुड़ी लगाना मुश्किल है तो चौड़ी जिप/आरामदायक कपड़े चुनें — चीज़ें गिराने से बचें', textEn: 'If buttoning is hard, choose wide-zip/easy clothing — avoid dropping things' },
    { questionIndex: 28, text: 'सुन्नपन बढ़ रहा है तो अगली मुलाकात में जरूर बताएं — खुराक/इलाज में बदलाव सोचा जा सकता है', textEn: 'If numbness is worsening, must report next visit — dose/treatment change may be considered' },
    // q29
    { questionIndex: 29, text: 'गिरने का खतरा — रात में टॉर्च जलाकर उठें, दीवार का सहारा लें, फिसलन चटाई हटाएं', textEn: 'Fall risk — get up with a torch at night, use wall support, remove slippery mats' },
    { questionIndex: 29, text: 'गर्म पानी की जलन महसूस नहीं होती — पानी का तापमांतर कोहनी/स्वस्थ त्वचा से नापें', textEn: 'You may not feel hot-water burns — test water temperature with elbow/unaffected skin' },
    // q30
    { questionIndex: 30, text: 'बाल इलाज रुकने के 2-3 महीने में लौट आते हैं — यह लगभग हमेशा अस्थायी है', textEn: 'Hair usually returns 2-3 months after treatment ends — this is almost always temporary' },
    { questionIndex: 30, text: 'रूमाल, टोपी, स्कार्फ या विग — जो आपको सहज लगे वही चुनें, किसी को दिखाने की नहीं', textEn: 'Scarf, cap or wig — choose whatever feels comfortable to you, not for others' },
    // q31
    { questionIndex: 31, text: 'इलाज शुरू होने के 2-4 हफ्तों में झड़ना सामान्य है — पहले से सिर ढकने की व्यवस्था रखें', textEn: 'Loss starting 2-4 weeks into treatment is normal — arrange head cover beforehand' },
    { questionIndex: 31, text: 'हल्का शैम्पू और नरम कंघी — बाल जड़ से न खींचें, कसकर बांधना घटाएं', textEn: 'Mild shampoo and soft comb — do not pull at roots; reduce tight hairstyles' },
    // q32
    { questionIndex: 32, text: 'हर दस्त के बाद ORS लें — दिन में 4 से ज्यादा दस्त हों तो डॉक्टर को दिखाएं', textEn: 'Take ORS after every loose stool — 4+ stools a day means showing the doctor' },
    { questionIndex: 32, text: 'पानी-दस्त बार-बार हों तो नारियल पानी/ORS/छाछ जारी रखें — पानी की कमी से बचें', textEn: 'With frequent watery stools, keep up ORS/coconut water/buttermilk — avoid dehydration' },
    // q33
    { questionIndex: 33, text: 'दस्त + बुखार साथ = न्यूट्रोपेनिक संक्रमण हो सकता है — कोई इंतज़ार नहीं, तुरंत अस्पताल', textEn: 'Diarrhoea + fever together = possible neutropenic infection — no waiting, hospital immediately' },
    { questionIndex: 33, text: 'दस्त में खून आना प्लेटलेट/इन्फेक्शन की समस्या है — तुरंत जांच के लिए आएं', textEn: 'Blood in stools means a platelet/infection problem — come for testing immediately' },
    // q34
    { questionIndex: 34, text: '4 दिन से ज्यादा पेट साफ नहीं — रात की दवा बढ़ानी/जोड़नी होगी, डॉक्टर को बताएं', textEn: 'No stool for 4+ days — the bedtime medicine needs adding/raising; inform the doctor' },
    { questionIndex: 34, text: 'कब्ज को अकेले न झेलें — गुठिला (impaction) होने से पहले ही बताएं', textEn: 'Do not endure constipation alone — report before it turns into impaction' },
    // q35
    { questionIndex: 35, text: 'गैस भरा पेट — गुनगुना पानी और हल्की टहल मदद करती है', textEn: 'Bloated stomach — warm water and a light walk help' },
    { questionIndex: 35, text: 'तेज़ पेट-दर्द या उल्टी जुड़ जाए तो रुकावट (obstruction) की जांच जरूरी है — तुरंत बताएं', textEn: 'If severe pain or vomiting joins, an obstruction check is needed — report at once' },
    // q36
    { questionIndex: 36, text: 'तरल ही चल रहा है तो कैलोरी घाल दें — दूध में ड्राईफ्रूट की शेक, घी/क्रीम वाली हल्की खीर, केला-दूध', textEn: 'If only liquids go down, add calories — dry-fruit milkshake, kheer with ghee/cream, banana-milk' },
    { questionIndex: 36, text: 'दिनभर के खाने-पीने का नोट रखें — कम चल रहा हो तो बताएं, पोषण-योजना बनेगी', textEn: 'Keep a note of the whole day\'s intake — if low, tell us; a nutrition plan will be made' },
    // q37
    { questionIndex: 37, text: '3 महीने में 5% से ज्यादा वजन घटा है — पोषण-योजना और जांच दोनों जल्दी चाहिए', textEn: 'Over 5% weight loss in 3 months — nutrition plan and workup both needed soon' },
    { questionIndex: 37, text: 'हर हफ्ते एक ही तराजू, एक ही समय पर वजन नोट करें — रुझान देखना जरूरी है', textEn: 'Weigh weekly on the same scale, same time of day — tracking the trend matters' },
    // q38
    { questionIndex: 38, text: 'दिनभर बिस्तर पर रहने से निमोनिया/बिस्तर के छाले का खतरा — दिन में 2-3 बार कुर्सी पर बैठें', textEn: 'All-day bed rest risks pneumonia/bed sores — sit out on a chair 2-3 times a day' },
    { questionIndex: 38, text: 'इतनी नई कमजोरी असामान्य है — खून की जांच (एनीमिया/इन्फेक्शन) कराएं', textEn: 'Weakness this new is not usual — get blood tested (anemia/infection)' },
    // q39
    { questionIndex: 39, text: 'हीमोग्लोबिन 8 से कम — डॉक्टर से पूछें: खून चढ़ाना या आयरन, हालत के हिसाब से तय होगा', textEn: 'Hemoglobin under 8 — ask the doctor: transfusion or iron, decided by your condition' },
    { questionIndex: 39, text: 'आयरन की गोली के 1 घंटे के भीतर चाय/दूध न पिएं — आयरन का अवशोषण रुक जाता है', textEn: 'No tea/milk within 1 hour of the iron tablet — it blocks iron absorption' },
    // q40
    { questionIndex: 40, text: 'तेज़ वजन-घटाव छुपाने वाली नहीं, बताने वाली चीज़ है — कैशेक्सिया की पोषण-योजना जल्दी बनती है', textEn: 'Rapid weight loss is something to report, not hide — cachexia nutrition plans work best early' },
    { questionIndex: 40, text: 'बिना घबराए — छोटे-घने भोजन और नियमित फॉलो-अप से गिरावट को धीमा/रोका जा सकता है', textEn: 'Without panic — small dense meals and regular follow-up can slow or stop the fall' },
    // q41
    { questionIndex: 41, text: 'शरीर बैठना मांसपेशी घटने का संकेत है — हर भोजन में प्रोटीन जोड़ें: दाल, दही, अंडा, पनीर', textEn: 'A shrinking body signals muscle loss — add protein to every meal: dal, curd, egg, paneer' },
    { questionIndex: 41, text: 'सच जानना डराने के लिए नहीं, इलाज की ताकत बचाने के लिए है — इसे छुपाने से मदद देर से मिलती है', textEn: 'Honest knowing is to save treatment strength, not to scare — hiding it only delays help' },
    // q42
    { questionIndex: 42, text: 'आराम की हालत में भी सांस फूलती है — तुरंत आकर ऑक्सीजन/जांच कराएं', textEn: 'Breathless even at rest — come now for oxygen/check-up' },
    { questionIndex: 42, text: 'चलने पर ही फूलती है तो रफ्तार घटाएं — 10 कदम चलें, आराम करें, फिर 10 कदम', textEn: 'If only on walking, slow down — walk 10 steps, rest, then 10 more' },
    // q43
    { questionIndex: 43, text: 'लेटने पर बिगड़ती सांस — सिर के नीचे 2-3 तकिये रखें, झुकी कुर्सी पर आराम करें', textEn: 'If breathlessness worsens lying flat — use 2-3 pillows, rest in a reclined chair' },
    { questionIndex: 43, text: 'रात में नींद से अचानक बैठ जाना — फेफड़ों में पानी की जांच चाहिए, बताएं', textEn: 'Suddenly sitting up from sleep — fluid in the lungs needs checking; report it' },
    // q44
    { questionIndex: 44, text: 'धातु जैसा स्वाद इलाज का सामान्य साइड-इफेक्ट है — प्लास्टिक के बर्तन और खट्टे रस मदद करते हैं', textEn: 'A metallic taste is a common treatment side-effect — plastic cutlery and sour juices help' },
    { questionIndex: 44, text: 'इलाज खत्म होने के बाद स्वाद धीरे-धीरे लौट आता है — जो चल रहा है वही खाते रहें', textEn: 'Taste gradually returns after treatment ends — keep eating whatever works for now' },
    // q45
    { questionIndex: 45, text: 'मांस से घृणा अस्थायी है — प्रोटीन दाल, अंडा, पनीर, दही से लेते रहें', textEn: 'Meat aversion is temporary — keep up protein from dal, egg, paneer, curd' },
    { questionIndex: 45, text: 'पानी भी बेस्वाद लगे तो नींबू-पुदीना या जीरा-पानी घालकर पिएं', textEn: 'If even water tastes off — add lemon/mint or cumin water' },
    // q46
    { questionIndex: 46, text: '4 घंटे से कम नींद — रात की हल्की मदद (मेलाटोनिन जैसी) मिल सकती है, पूछें', textEn: 'Under 4 hours of sleep — mild night help (like melatonin) can be given; ask' },
    { questionIndex: 46, text: 'दिन की झपकी 20 मिनट से छोटी रखें — रात की नींद बची रहती है', textEn: 'Keep daytime naps under 20 minutes — it protects night sleep' },
    // q47
    { questionIndex: 47, text: 'दर्द से नींद टूटती है — रात की दर्द-गोली का समय बदला जा सकता है, बताएं', textEn: 'If pain breaks sleep — the nighttime pain tablet timing can be changed; tell the doctor' },
    { questionIndex: 47, text: 'चिंता हो तो दिन में 15 मिनट का ‘चिंता-समय’ रखें — रात को चिंताएं कागज़ पर लिखकर टालें', textEn: 'For worry, keep a 15-minute daytime \'worry time\' — write worries down at night to park them' },
    // q48
    { questionIndex: 48, text: 'बहुत ज्यादा प्यास + बार-बार पेशाब — खून में कैल्शियम जांच जरूरी है', textEn: 'Heavy thirst + frequent urination — a blood calcium test is needed' },
    { questionIndex: 48, text: 'प्यास के साथ भ्रम भी हो तो उसी दिन जांच कराएं — देरी खतरनाक है', textEn: 'If confusion accompanies the thirst, get tested the same day — delay is dangerous' },
    // q49
    { questionIndex: 49, text: 'प्यास + भ्रम + कब्ज + उल्टी साथ = हाइपरकैल्सीमिया का खतरा — तुरंत जांच/अस्पताल (आपातकाल)', textEn: 'Thirst + confusion + constipation + vomiting together = hypercalcemia danger — urgent test/hospital (EMERGENCY)' },
    { questionIndex: 49, text: 'इसका घर में कोई इलाज नहीं — सिर्फ खून की रिपोर्ट से पता चलता है, इंतज़ार न करें', textEn: 'There is no home remedy for this — only a blood test reveals it; do not wait' },
    // q50
    { questionIndex: 50, text: '0-3 अंक का दर्द — पैरासिटामोल घड़ी के हिसाब से नियमित लें, दर्द होने पर ही नहीं', textEn: 'Pain 0-3 — take paracetamol regularly by the clock, not just when it hurts' },
    { questionIndex: 50, text: 'रात में बढ़ता दर्द बताएं — सोने से पहले की खुराक जोड़ी जा सकती है', textEn: 'Report night-worsening pain — a bedtime dose may be added' },
    // q51
    { questionIndex: 51, text: 'गोली दिन में 3+ बार चाहिए तो घंटों के अंतर पर नियमित लें — दर्द को वापस आने से पहले रोकें', textEn: 'If 3+ tablets a day are needed, take them by fixed hours — stop pain before it returns' },
    { questionIndex: 51, text: 'बिना डॉक्टर के खुराक कभी न बढ़ाएं — अधूरा आराम डॉक्टर को बताने वाली चीज़ है', textEn: 'Never increase the dose without the doctor — incomplete relief is exactly what to report' },
    // q52
    { questionIndex: 52, text: '4-6 अंक का दर्द — सीढ़ी-2 की दवा (ट्रामाडोल जैसी) विशेषज्ञ ही शुरू करते हैं — रेफर लिखेंगे', textEn: 'Pain 4-6 — ladder-2 medicines (tramadol-type) are started by specialists only — we will refer' },
    { questionIndex: 52, text: '24 घंटे में 4+ दर्द-दौरे — दवा की अवधि छोटी पड़ रही है, बताएं तो समय-तालिका ठीक करेंगे', textEn: '4+ flares in 24 hours — the medicine duration is falling short; tell us so the schedule can be fixed' },
    // q53
    { questionIndex: 53, text: 'पैरासिटामोल से आराम नहीं — पहले नियमित लेकर देखें; फिर भी नहीं तो दर्द की सीढ़ी बदलनी होगी', textEn: 'No relief from paracetamol — first try it round-the-clock; if still none, the pain ladder must change' },
    { questionIndex: 53, text: 'आराम 2 घंटे से कम टिकता है — दवा का समय-जोड़ डॉक्टर ठीक करेंगे, खुद न बढ़ाएं', textEn: 'Relief lasts under 2 hours — the doctor will re-time the medicine; do not self-increase' },
    // q54
    { questionIndex: 54, text: 'मॉर्फिन जैसी गोली वही खुराक चलाएं जो दर्द-टीम ने लिखी है — बदलाव सिर्फ डॉक्टर से', textEn: 'Continue the morphine-type tablet exactly at the dose your pain team wrote — changes only via the doctor' },
    { questionIndex: 54, text: 'गोली कभी न चबाएं/रगड़ें/तोड़ें — पूरी निगलें; कुचलने से पूरी खुराक एक साथ छूटती है, जान को खतरा', textEn: 'Never chew/crush/split the tablet — swallow whole; crushing releases the full dose at once, which is dangerous' },
    // q55
    { questionIndex: 55, text: '4 घंटे से पहले दर्द लौट आता है — समय-तालिका छोटी करनी होगी, डॉक्टर को बताएं', textEn: 'Pain returning before 4 hours — the schedule needs shortening; inform the doctor' },
    { questionIndex: 55, text: 'ओपिओइड के साथ कब्ज होना आम है और कब्ज दर्द बढ़ाती है — रोज़ कब्ज-दवा लेना अनिवार्य रखें', textEn: 'Constipation is usual with opioids and it worsens pain — a daily laxative is mandatory alongside' },
    // q56
    { questionIndex: 56, text: 'नई जगह हड्डी-दर्द = जांच (स्कैन) बनवानी होगी — टालें नहीं, हम रिपोर्ट लिखेंगे', textEn: 'Bone pain at a new site = a scan workup is needed — do not ignore; we will order it' },
    { questionIndex: 56, text: 'कमर/रीढ़ का नया दर्द विशेष जांच मांगता है — अगली मुलाकात टालें नहीं', textEn: 'New back/spine pain needs specific tests — do not delay the next visit' },
    // q57
    { questionIndex: 57, text: 'हल्की रगड़/दबाव से दर्द बहुत बढ़ता है — हड्डी टूटने का खतरा — झटके वाली हरकत बंद करें, तुरंत बताएं', textEn: 'Pain spiking with slight pressure — fracture risk — stop jolting movements and report immediately' },
    { questionIndex: 57, text: 'बिस्तर पर एक तरफ लोटकर पलटें — झटके से नहीं; बैठने-उठने में सहारा लें', textEn: 'Roll to one side to turn in bed — no jerks; take support while sitting up' },
    // q58
    { questionIndex: 58, text: 'सुबह का सिरदर्द + उल्टी — सिर के अंदर दबाव (ICP) का संकेत — आज ही अस्पताल (आपातकाल)', textEn: 'Morning headache + vomiting — a sign of raised pressure inside the head (ICP) — hospital TODAY (EMERGENCY)' },
    { questionIndex: 58, text: 'यह आम सिरदर्द नहीं है — देख-भाल करने का इंतज़ार नहीं, सीधे इमरजेंसी जाएं', textEn: 'This is not an ordinary headache — no watchful waiting; go straight to emergency' },
    // q59
    { questionIndex: 59, text: 'नज़र धुंधलाना/दौरा/भ्रम — मस्तिष्क-मेटास्टेसिस की तुरंत स्कैन चाहिए — इमरजेंसी', textEn: 'Blurred vision/fit/confusion — an urgent brain scan is needed for metastasis — EMERGENCY' },
    { questionIndex: 59, text: 'दौरे के समय मुंह में कुछ न रखें, किनारों से हटाएं — दौरा रुकने पर तुरंत अस्पताल', textEn: 'During a fit: put nothing in the mouth, move away from edges — once it stops, hospital immediately' },
    // q60
    { questionIndex: 60, text: '38.3°C (101°F) या ज्यादा = न्यूट्रोपेनिक बुखार — आपातकाल — सुबह का इंतज़ार नहीं, अभी अस्पताल', textEn: '38.3°C (101°F) or more = neutropenic fever — EMERGENCY — no waiting till morning; hospital NOW' },
    { questionIndex: 60, text: 'पहले-खुद-क्रोसिन डालकर देखने की गलती न करें — भर्ती बुखार गिराने के लिए नहीं, इन्फेक्शन की लहर रोकने के लिए है', textEn: 'Do not gamble with Crocin-at-home first — admission is to stop the infection-wave, not merely to bring the fever down' },
    // q61
    { questionIndex: 61, text: 'कीमो के बाद की 10-14 दिन की खिड़की में बुखार = तुरंत बताना — कोई अपवाद नहीं, कोई इंतज़ार नहीं', textEn: 'Fever inside the 10-14 day post-chemo window = report instantly — no exceptions, no waiting' },
    { questionIndex: 61, text: 'इस समय भीड़, बाज़ार, बस से बचें — मास्क लगाएं, हाथ धोएं रखें, कच्चा खाना न लें', textEn: 'Avoid crowds, markets, buses during this time — wear a mask, keep hands clean, avoid raw food' },
    // q62
    { questionIndex: 62, text: 'मुंह का कैंसर तंबाकू से जुड़ा है — अब छोड़ना ही सबसे बड़ा इलाज है, बाकी सब उसके बाद', textEn: 'Oral cancer is tied to tobacco — quitting now IS the biggest treatment; everything else comes after' },
    { questionIndex: 62, text: 'छोड़ने में मदद मिलती है — निकोटीन गम + परामर्श दोनों उपलब्ध हैं, लागत कम है', textEn: 'Help to quit exists — nicotine gum plus counselling are both available and inexpensive' },
    // q63
    { questionIndex: 63, text: '‘सोच-रहे-हैं’ चरण में हैं — आज ही छोड़ने की तारीख तय करना अगला कदम है', textEn: 'If in the \'thinking\' stage — fixing a quit date today is the next step' },
    { questionIndex: 63, text: 'तय कर चुके हैं — घर का सारा पान/गुटखा/सिगरेट आज ही बाहर करें, साथी को भी साथ जोड़ें', textEn: 'If already decided — clear the house of all paan/gutkha/cigarettes today; loop in a companion too' },
    // q64
    { questionIndex: 64, text: 'रगड़ने से न जाने वाला सफेद धब्बा = ल्यूकोप्लाकिया — बायोप्सी के लिए मुंह-सर्जन रेफर जरूरी', textEn: 'A white patch that does not rub off = leukoplakia — oral-surgeon referral for biopsy is essential' },
    { questionIndex: 64, text: 'यह छोटी चीज़ नहीं — यह कैंसर में बदल सकता है — जांच में देरी बर्दाश्त नहीं', textEn: 'This is not a small thing — it can turn into cancer — no delay in testing' },
    // q65
    { questionIndex: 65, text: 'धब्बा सख्त/खुरदरा/दर्दभर है — बायोप्सी इसी हफ्ते — आपातकाल नहीं पर देरी नहीं', textEn: 'Patch is hard/rough/painful — biopsy this week — not an emergency, but no delay either' },
    { questionIndex: 65, text: 'तंबाकू रोज़ चलता रहे तो धब्बा बिगड़ता ही जाएगा — आज से पूरा बंद', textEn: 'If tobacco continues daily, the patch will only worsen — stop completely from today' },
    // q66
    { questionIndex: 66, text: 'गर्दन की गांठ 2 हफ्ते से ज्यादा और बढ़ती हुई — USG/FNAC वर्कअप के लिए रेफर लिखेंगे', textEn: 'Neck lump over 2 weeks and growing — we will refer for USG/FNAC workup' },
    { questionIndex: 66, text: 'गांठ को दबाकर/मसाज करके न छोटा करने की कोशिश करें — जांच देर न करें', textEn: 'Do not press or massage the lump trying to shrink it — do not delay testing' },
    // q67
    { questionIndex: 67, text: 'गांठ + वजन-घटाव + रात का पसीना — लिम्फोमा/टीबी जांच दोनों कराने होंगे', textEn: 'Lump + weight loss + night sweats — both lymphoma and TB testing will be needed' },
    { questionIndex: 67, text: 'यह डर की बात नहीं, जांच की बात है — पुरानी रिपोर्टें (अगर हों) साथ लाएं', textEn: 'This is a matter of testing, not of fear — bring old reports if any' },
    // q68
    { questionIndex: 68, text: 'माहवारी के साथ बदलती गांठ अक्सर गैर-कैंसर होती है — फिर भी मैमोग्राम/USG स्क्रीन जरूरी है', textEn: 'A lump changing with menses is often non-cancerous — still, a mammogram/USG screen is essential' },
    { questionIndex: 68, text: '40 साल के बाद कोई भी स्तन गांठ — बिना इंतज़ार जांच कराएं', textEn: 'Any breast lump after age 40 — get it tested without waiting' },
    // q69
    { questionIndex: 69, text: 'त्वचा खिंचना या निपल से खून-स्राव — तुरंत सर्जन/ओबीजी रेफर — इसी हफ्ते जांच', textEn: 'Skin dimpling or bloody nipple discharge — urgent surgeon/OBG referral — testing this week' },
    { questionIndex: 69, text: 'जांच में देरी इलाज को लंबा करती है — स्क्रीनिंग की तारीख आज ही पक्की करें', textEn: 'Delay in testing makes treatment longer — fix the screening date today itself' },
    // q70
    { questionIndex: 70, text: 'पैरों की नई कमजोरी = रीढ़-संपीड़न का खतरा — आपातकाल — लेटाकर गाड़ी में अभी अस्पताल', textEn: 'New leg weakness = danger of spinal cord compression — EMERGENCY — lie flat in the vehicle, hospital NOW' },
    { questionIndex: 70, text: 'घंटे-घंटे का फर्क पड़ता है — देरी से पैर हमेशा के लिए जा सकते हैं — टालें नहीं', textEn: 'Hours matter — delay can take the legs away permanently — do not put it off' },
    // q71
    { questionIndex: 71, text: 'पेशाब का न रुकना/रिसाव + कमजोर पैर — रीढ़-संपीड़न आपातकाल — तुरंत भर्ती', textEn: 'Urine leakage/incontinence + weak legs — cord compression EMERGENCY — admit immediately' },
    { questionIndex: 71, text: 'इसे साधारण ‘पेशाब की दिक्कत’ समझकर घर न बैठें — यह रीढ़ का संकट है', textEn: 'Do not sit at home mistaking it for a routine urine problem — this is a spinal crisis' },
    // q72
    { questionIndex: 72, text: 'चेहरा-गर्दन सूजन + सांस = SVC सिंड्रोम का खतरा — आपातकाल — अभी अस्पताल', textEn: 'Face-neck swelling + breathlessness = SVC syndrome danger — EMERGENCY — hospital now' },
    { questionIndex: 72, text: 'जाते समय लेटने से बचें — बैठकर जाएं, सीधा रखें — लेटने पर सांस और बिगड़ती है', textEn: 'Avoid lying down while travelling — go seated and upright; lying flat worsens breathing' },
    // q73
    { questionIndex: 73, text: 'सुबह की सूजन + झुकने पर भारी सिर — गर्दन की बड़ी नस दबने की जांच चाहिए — जल्दी अस्पताल', textEn: 'Morning swelling + head-heavy on bending — the big neck vein compression needs checking — hospital soon' },
    { questionIndex: 73, text: 'छाती/गर्दन पर नसें दिखना भी इसका संकेत है — डॉक्टर को दिखाएं', textEn: 'Visible veins on the chest/neck are also a sign — show them to the doctor' },
    // q74
    { questionIndex: 74, text: 'कैंसर से खून — रुक-रुक टपकना भी खतरनाक है — साफ पैड दबाकर तुरंत अस्पताल', textEn: 'Bleeding from a tumor — even a slow ooze is dangerous — press with a clean pad and go to hospital now' },
    { questionIndex: 74, text: 'खून की मात्रा घंटे-वार नोट करें — बढ़ती हुई हो तो इमरजेंसी कॉल करें', textEn: 'Note the blood amount every hour — if increasing, make an emergency call' },
    // q75
    { questionIndex: 75, text: 'प्लेटलेट कम बताए गए हैं और खून आ रहा है — इमरजेंसी जाएं, प्लेटलेट चढ़ाना पड़ सकता है', textEn: 'Platelets reported low and bleeding present — go to emergency; platelet transfusion may be needed' },
    { questionIndex: 75, text: 'मुलायम ब्रश, हल्का नाखून-काटना, गिरने से बचाव — चोट का खतरा घटाएं', textEn: 'Soft brush, gentle nail care, fall prevention — reduce injury risk' },
    // q76
    { questionIndex: 76, text: 'हल्दी-कैप्सूल/इम्युनिटी-बूस्टर कैंसर नहीं रोकते — यह बाज़ार की बात है, विज्ञान की नहीं', textEn: 'Turmeric capsules/immunity boosters do not fight cancer — that is marketing talk, not science' },
    { questionIndex: 76, text: 'इम्युनिटी का असली रास्ता संतुलित भोजन है — दाल, दही, फल, सब्ज़ी; महंगे पाउडरों का पैसा इलाज में लगाएं', textEn: 'The real route to immunity is balanced food — dal, curd, fruit, vegetables; spend the booster money on treatment instead' },
    // q77
    { questionIndex: 77, text: '‘कैंसर जड़ से मिटाएगा’ वाले उत्पाद घोटाले हैं — खरीदें नहीं, रिपोर्ट करें', textEn: '"Cures cancer from the root" products are scams — do not buy; report them' },
    { questionIndex: 77, text: 'कोई भी नया उत्पाद शुरू करने से पहले यहीं लेकर आएं — मुफ्त में जांच हो जाएगी, आपकी दवाओं से टकराव भी देखेंगे', textEn: 'Before starting any new product, bring it here — we will check it free, including clashes with your current medicines' },
    // q78
    { questionIndex: 78, text: 'परिवार में 50 साल से पहले स्तन/अंडाशय का कैंसर — जेनेटिक काउंसलिंग रेफर जरूरी है', textEn: 'Breast/ovarian cancer before age 50 in the family — a genetic-counselling referral is needed' },
    { questionIndex: 78, text: 'परिवार का कैंसर-चार्ट बनाएं — किस रिश्ते में, किस उम्र में, कौन सा कैंसर', textEn: 'Make a family cancer chart — which relation, at what age, which cancer' },
    // q79
    { questionIndex: 79, text: '2 से ज्यादा नज़दीकी रिश्तेदारों को स्तन/अंडाशय का कैंसर = BRCA जांच की पात्रता — जेनेटिक काउंसलर से मिलें', textEn: '2+ close relatives with breast/ovarian cancer = eligibility for BRCA testing — meet a genetic counsellor' },
    { questionIndex: 79, text: 'जांच मजबूरी नहीं, सोच-समझकर लिया जाने वाला फैसला है — परिवार समेत परामर्श में तय होगा', textEn: 'The test is not compulsory — it is a considered decision, made in counselling together with the family' },
    // q80
    { questionIndex: 80, text: '‘आराम या इलाज’ — दोनों लक्ष्य साथ-साथ चल सकते हैं — यह बात पैलिएटिव टीम से खुलकर करें', textEn: '\'Comfort or cure\' — both goals can run together — discuss this openly with the palliative team' },
    { questionIndex: 80, text: 'लक्ष्य समझ लेना ही आधा इलाज है — परिवार को भी इसी बातचीत में बैठाएं', textEn: 'Understanding the goal is half the treatment — include the family in this same conversation' },
    // q81
    { questionIndex: 81, text: 'जो आप बताएंगे वही पहले संभाला जाएगा — अपनी परेशानियों की छोटी सूची बनाकर लाएं', textEn: 'What you tell us gets handled first — bring a short list of your problems' },
    { questionIndex: 81, text: '‘छोटी’ परेशानियां भी बताएं — पैलिएटिव टीम छोटी-छोटी चीज़ें ठीक करने में माहिर है', textEn: 'Tell even the \'small\' problems — palliative teams specialise in fixing small things' },
    // q82
    { questionIndex: 82, text: 'हर 2 घंटे में शरीर के ओर-छोर पलटाएं — बिस्तर के छालों से बचाव का पहला नियम', textEn: 'Turn the patient side-to-side every 2 hours — the first rule of preventing bed sores' },
    { questionIndex: 82, text: 'चादर बिना सिलवट की, सूखी और साफ रखें — नमी तुरंत पोंछें', textEn: 'Keep sheets wrinkle-free, dry and clean — wipe any dampness at once' },
    // q83
    { questionIndex: 83, text: 'देखभाल एक अकेले व्यक्ति का काम नहीं — 2-3 लोगों की बारी बनाकर चलाएं', textEn: 'Caregiving is not a one-person job — run it as a rotation of 2-3 people' },
    { questionIndex: 83, text: 'घर आने वाली नर्स/हेल्थ-वर्कर की सुविधा पूछें — जोड़ने में मदद करेंगे', textEn: 'Ask about home nurse/health-worker visits — we can help arrange them' },
    // q84
    { questionIndex: 84, text: 'परिवार का जानना और मरीज़ का जानना — दोनों जरूरी; लुकाने से इलाज में देरी और मरीज़ का अकेलापन बढ़ता है', textEn: 'Family knowing AND patient knowing — both matter; hiding delays treatment and deepens the patient\'s loneliness' },
    { questionIndex: 84, text: 'बुरी खबर धीरे-धीरे, सही शब्दों में दी जाती है — इस बातचीत की तैयारी में हम मदद करेंगे', textEn: 'Bad news is shared gradually, in the right words — we will help you prepare for that conversation' },
    // q85
    { questionIndex: 85, text: 'मरीज़ को अपनी बीमारी का अधिकार है — जानना चाहें तो टाला न जाए, धीरे और सही शब्दों में बताएं', textEn: 'The patient has the right to know their own illness — if they ask, do not deflect; tell gently and truthfully' },
    { questionIndex: 85, text: 'मरीज़ की इच्छाएं (घर, अस्पताल, परिवार पास) लिखवाकर रखें — आखिरी दिन उन्हीं के हिसाब से संभालेंगे', textEn: 'Write down the patient\'s wishes (home, hospital, family nearby) — the last days will follow those' },
    // q86
    { questionIndex: 86, text: 'दुर्गंध के लिए खास जेल/ड्रेसिंग उपलब्ध है — बताएं, इलाज में जोड़ देंगे', textEn: 'Special gel/dressing exists for wound odor — tell us and we will add it' },
    { questionIndex: 86, text: 'घाव से खून आए तो दबाव-पट्टी रखें और तुरंत संपर्क करें — इंतज़ार नहीं', textEn: 'If the wound bleeds — apply a pressure dressing and call immediately; do not wait' },
    // q87
    { questionIndex: 87, text: 'ड्रेसिंग बदलने से पहले हाथ धोएं — देखभाल करने वाले के भी; उपयोग के बाद सामान बंद डिब्बे में', textEn: 'Wash hands before every dressing change — the caregiver too; dispose used items in a closed bin' },
    { questionIndex: 87, text: 'घाव का दर्द या दुर्गंध बढ़े — इन्फेक्शन की जांच चाहिए, बताएं', textEn: 'If wound pain or odor increases — an infection check is needed; report it' },
    // q88
    { questionIndex: 88, text: '2 हफ्ते से ज्यादा उदासी/निराशा — इलाज मांगती है, यह सिर्फ ‘मन की बात’ नहीं — मनो-चिकित्सक से जोड़ेंगे', textEn: 'Low mood/hopelessness over 2 weeks — needs treatment, not just \'mind over matter\' — we will link psychiatry' },
    { questionIndex: 88, text: 'यह हार नहीं है — कैंसर के साथ यह बहुत आम है और दवा/परामर्श से साफ सुधरता है', textEn: 'This is not weakness — it is very common with cancer and clearly improves with medicine/counselling' },
    // q89
    { questionIndex: 89, text: 'इलाज छोड़ने की सोच आना बताने लायक है — इलाज का बोझ घटाने के रास्ते हमेशा होते हैं', textEn: 'Thoughts of quitting treatment are worth reporting — there are always ways to reduce the treatment burden' },
    { questionIndex: 89, text: 'खाना-नींद का बिगड़ना इसी का हिस्सा है — सब मिलाकर इलाज बनता है, अकेले नहीं झेलें', textEn: 'Food and sleep going off is part of this — treatment covers all of it together; do not endure alone' },
    // q90
    { questionIndex: 90, text: 'देखभालकर्ता की नींद भी इलाज का हिस्सा है — टूटी नींद से देखभाल की गुणवत्ता गिरती है', textEn: 'The caregiver\'s sleep is part of care too — broken sleep lowers the quality of care you give' },
    { questionIndex: 90, text: 'रात की बारी बदलें — दो लोगों में रात आधी-आधी बांटें', textEn: 'Rotate night duty — split the night between two people' },
    // q91
    { questionIndex: 91, text: '‘मैं ही सब संभालूंगा/संभालूंगी’ वाला बोझ न उठाएं — आपका स्वास्थ्य भी मायने रखता है', textEn: 'Do not carry the \'I alone will manage\' burden — your health matters too' },
    { questionIndex: 91, text: 'रोज़ 1 घंटा अपने लिए — सांस लेने, टहलने, परिवार से मिलने को — यह स्वार्थ नहीं, जरूरत है', textEn: 'One hour daily for yourself — breathing, walking, meeting people — not selfishness, a necessity' },
  ],

  // ══ Labels — vitals & oncology scales (12) ═════════════════════════════
  labels: [
    { label: 'दर्द अंक (0-10)', labelEn: 'Pain Score (0-10)', unit: '', showUnit: false },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'मुख-ग्रहण श्रेणी (0-5)', labelEn: 'Oral Intake Grade (0-5)', unit: '', showUnit: false },
    { label: 'कार्य-क्षमता ECOG (0-4)', labelEn: 'Performance Status ECOG (0-4)', unit: '', showUnit: false },
    { label: '24 घंटे में दर्द-दौरे', labelEn: 'Breakthrough Pain Episodes/24h', unit: '/24h' },
    { label: 'मल-त्याग अंतराल', labelEn: 'Bowel Interval (days)', unit: 'days' },
    { label: 'मुंह-छाल श्रेणी (0-4)', labelEn: 'Mouth Ulcer Grade (0-4)', unit: '', showUnit: false },
    { label: 'नींद (घंटे)', labelEn: 'Sleep Hours', unit: 'hrs' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'हीमोग्लोबिन (रिपोर्ट हो तो)', labelEn: 'Hemoglobin (if brought)', unit: 'g/dl' },
  ],

  // ══ Findings (35: 23 managed-supportive + 12 refer-only) ═══════════════
  // Refer-only findings (NEUTROPENIC-FEVER … BRAIN-METS-NEW) deliberately
  // have ZERO findingMeds links — no OPD medicine handling for emergencies.
  findings: [
    // Managed / supportive (links allowed)
    { key: 'CHEMO-FU-SUPPORT', name: 'कैंसर इलाज चालू — सहायक देखभाल', nameEn: 'Cancer Treatment Ongoing — Supportive Care', icd10: 'Z51.11' },
    { key: 'PALLIATIVE-FU', name: 'पैलिएटिव देखभाल फॉलो-अप', nameEn: 'Palliative Care Follow-up', icd10: 'Z51.5' },
    { key: 'CHEMO-NAUSEA', name: 'रसायन-चिकित्सा मतली/उल्टी', nameEn: 'Chemotherapy-Induced Nausea/Vomiting', icd10: 'R11.0' },
    { key: 'CHEMO-MUCOSITIS', name: 'रसायन-मुंह-शोथ (म्यूकोसाइटिस)', nameEn: 'Chemotherapy-Induced Mucositis', icd10: 'K12.1' },
    { key: 'CHEMO-NEUROPATHY', name: 'रसायन-तंत्रिका दौर्बल्य', nameEn: 'Chemotherapy-Induced Peripheral Neuropathy', icd10: 'G62.0' },
    { key: 'CHEMO-ALOPECIA', name: 'रसायन-बाल झड़ना', nameEn: 'Chemotherapy-Induced Alopecia', icd10: 'L65.0' },
    { key: 'CHEMO-DIARRHEA', name: 'रसायन-दस्त', nameEn: 'Chemotherapy-Induced Diarrhoea', icd10: 'R19.7' },
    { key: 'CHEMO-CONSTIPATION', name: 'दवा-संबंधी कब्ज (ओपिओइड सहित)', nameEn: 'Drug/Opioid-Related Constipation', icd10: 'K59.0' },
    { key: 'APPETITE-LOSS-CANCER', name: 'कैंसर-भूख न लगना', nameEn: 'Cancer-Related Anorexia', icd10: 'R63.0' },
    { key: 'CACHEXIA-CANCER', name: 'कैंसर-कैशेक्सिया (वजन-क्षय)', nameEn: 'Cancer Cachexia (Weight Loss)', icd10: 'R63.4' },
    { key: 'PAIN-NOS-CANCER', name: 'कैंसर-दर्द (WHO सीढ़ी प्रबंधन)', nameEn: 'Cancer Pain (WHO-Ladder Management)', icd10: 'R52' },
    { key: 'ANEMIA-CANCER', name: 'कैंसर-एनीमिया', nameEn: 'Anemia of Cancer (Iron-Support)', icd10: 'D63.0' },
    { key: 'NEUTROPENIA-FU', name: 'न्यूट्रोपेनिया निगरानी (फॉलो-अप)', nameEn: 'Neutropenia Monitoring (Follow-up)', icd10: 'D70' },
    { key: 'CANCER-SURVEILLANCE', name: 'कैंसर स्थिर — निगरानी फॉलो-अप', nameEn: 'Cancer Stable — Surveillance Follow-up', icd10: 'Z85' },
    { key: 'BREAST-CFU', name: 'स्तन कैंसर फॉलो-अप (निरंतरता)', nameEn: 'Breast Cancer Follow-up (Continuation)', icd10: 'C50.9' },
    { key: 'ORAL-CA-FU', name: 'मुंह कैंसर फॉलो-अप (तंबाकू-संबद्ध)', nameEn: 'Oral Cancer Follow-up (Tobacco-linked)', icd10: 'C06.9' },
    { key: 'PROSTATE-HORMONE-FU', name: 'प्रोस्टेट कैंसर हार्मोन फॉलो-अप', nameEn: 'Prostate Cancer Hormone Follow-up', icd10: 'C61' },
    { key: 'LYMPHOMA-FU', name: 'लिम्फोमा फॉलो-अप', nameEn: 'Lymphoma Follow-up', icd10: 'C85.9' },
    { key: 'COLON-STOMA-FU', name: 'कोलन कैंसर स्टोमा फॉलो-अप', nameEn: 'Colon Cancer Stoma Follow-up', icd10: 'C18.9' },
    { key: 'THYROID-SUPPRESS-FU', name: 'थायरॉइड कैंसर सप्रेशन फॉलो-अप', nameEn: 'Thyroid Cancer Suppression Follow-up', icd10: 'C73' },
    { key: 'BLOOD-CANCER-FU', name: 'रक्त-कैंसर फॉलो-अप (निरंतरता)', nameEn: 'Blood Cancer Follow-up (Continuation)', icd10: 'C95.9' },
    { key: 'DISTRESS-CANCER', name: 'कैंसर-तनाव अभिक्रिया', nameEn: 'Cancer-Related Distress (Adjustment Reaction)', icd10: 'F43.2' },
    { key: 'DIET-COUNSELLING', name: 'आहार परामर्श (कैंसर)', nameEn: 'Dietary Counselling (Cancer)', icd10: 'Z71.5' },
    // Refer-only (ZERO findingMeds links below — by design)
    { key: 'NEUTROPENIC-FEVER', name: 'न्यूट्रोपेनिक बुखार — आपातकाल भर्ती (केवल रेफर)', nameEn: 'Neutropenic Fever — Emergency Admission (Refer ONLY)', icd10: 'D70' },
    { key: 'SPINAL-CORD-COMPRESSION', name: 'रीढ़-संपीड़न संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Spinal Cord Compression — Emergency (Refer ONLY)', icd10: 'G95.2' },
    { key: 'SVC-SYNDROME-SUSPECT', name: 'SVC सिंड्रोम संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Superior Vena Cava Syndrome — Emergency (Refer ONLY)' },
    { key: 'RAISED-ICP-METS', name: 'मस्तिष्क-दबाव संदिग्ध (मेटास्टेसिस) — आपातकाल (केवल रेफर)', nameEn: 'Suspected Raised ICP with Mets — Emergency (Refer ONLY)', icd10: 'C79.3' },
    { key: 'TUMOR-BLEEDING', name: 'कैंसर-रक्तस्राव — अत्यावश्यक (केवल रेफर)', nameEn: 'Tumor Bleeding — Urgent (Refer ONLY)', icd10: 'R58' },
    { key: 'HYPERCALCEMIA-SUSPECT', name: 'हाइपरकैल्सीमिया संदिग्ध — आपातकाल जांच (केवल रेफर)', nameEn: 'Suspected Hypercalcemia — Emergency Workup (Refer ONLY)', icd10: 'E83.5' },
    { key: 'NEW-LEUKOPLAKIA', name: 'नई ल्यूकोप्लाकिया — बायोप्सी रेफर', nameEn: 'New Leukoplakia — Biopsy Referral', icd10: 'K13.2' },
    { key: 'NEW-NECK-LUMP', name: 'गर्दन गांठ नई — जांच रेफर (USG/FNAC)', nameEn: 'New Neck Lump — Workup Referral (USG/FNAC)', icd10: 'R59.9' },
    { key: 'NEW-BREAST-LUMP', name: 'स्तन गांठ नई — स्क्रीन रेफर (ओबीजी/सर्जरी)', nameEn: 'New Breast Lump — Screen Referral (OBG/Surgery)', icd10: 'N63' },
    { key: 'BONE-METS-NEW-FRACTURE-RISK', name: 'हड्डी-मेटास्टेसिस नई — फ्रैक्चर जोखिम (रेफर)', nameEn: 'New Bone Mets — Fracture Risk (Urgent Referral)', icd10: 'C79.5' },
    { key: 'PLEURAL-EFFUSION-MALIGNANT', name: 'परिप्लुर द्रव (मैलिग्नेंट) — तत्काल रेफर', nameEn: 'Malignant Pleural Effusion — Urgent Referral', icd10: 'J91.0' },
    { key: 'BRAIN-METS-NEW', name: 'मस्तिष्क-मेटास्टेसिस नई — तत्काल रेफर', nameEn: 'New Brain Metastasis — Urgent Referral', icd10: 'C79.3' },
  ],

  // ══ Medicines (40) — SUPPORTIVE-CARE ONLY ═════════════════════════════
  // ⚠ ZERO chemotherapy / targeted / immunotherapy / endocrine-anti-cancer
  // entries. Morphine/Pregabalin = continuation-verify framing only.
  // morning/afternoon/evening = default units at that slot; tab = ~dispense.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Antiemetics (chemo-nausea supportive)
    { name: 'Emeset 4 Tablet', salt: 'Ondansetron 4 mg (mouth-dissolving available)', doseOptions: ['1 tab (4 mg)', '2 tabs (8 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Emeset 8 Tablet', salt: 'Ondansetron 8 mg', doseOptions: ['1 tab (8 mg)', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Perinorm 10 Tablet', salt: 'Metoclopramide 10 mg (short courses only — max ~5 days; risk of shaking/twitching if prolonged)', doseOptions: ['1 tab (10 mg) before food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Domstal 10 Tablet', salt: 'Domperidone 10 mg', doseOptions: ['1 tab before food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Stemetil MD 5 Tablet', salt: 'Prochlorperazine 5 mg mouth-dissolving (breakthrough nausea; sedation possible)', doseOptions: ['1 tab (5 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // WHO pain ladder — oral only
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg (ladder-1: regular round-the-clock dosing works better than SOS)', doseOptions: ['1 tab (500 mg)', '2 tabs (1 g)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg (ladder-1 regular; max 3 g/day unless advised otherwise)', doseOptions: ['1 tab (650 mg) every 8 hrs'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg (NSAID — CAUTION in cancer: GI bleed, kidney strain, low platelets; after food only)', doseOptions: ['1 tab after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg (weak opioid — SOS only; regular use/escalation via pain specialist; dependence possible)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Morphitroy 10 Tablet', salt: 'Morphine Sulphate 10 mg oral (STRONG OPIOID — CONTINUATION-VERIFY ONLY: continue exactly as prescribed by pain/oncology team; NEVER crush/chew/split; ALWAYS pair with daily laxative; never self-increase)', doseOptions: ['1 tab (10 mg) — continue exactly as pain team prescribed', 'Dose per pain-team letter only'], morning: 0, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'X', verified: false } },

    // Laxatives (opioid-protocol)
    { name: 'Cremaffin Syrup 225ml', salt: 'Milk of Magnesia + Liquid Paraffin syrup', doseOptions: ['15 ml at bedtime', '15 ml twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml (gentle; may take 1-2 days to act)', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dulcolax 5 Tablet', salt: 'Bisacodyl 5 mg (rescue: when 4+ days without stool)', doseOptions: ['1-2 tabs at bedtime'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Naturolax Granules', salt: 'Ispaghula (Psyllium) husk natural fibre', doseOptions: ['1-2 tsp in 1 glass water at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Mucositis / oral care
    { name: 'Mucopain Gel 15g', salt: 'Benzocaine 20% w/w oral gel (local anesthetic — apply before meals; numbs briefly)', doseOptions: ['Apply thin layer 5-10 min before meals', 'Apply 3-4 times/day on ulcers'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zytee Gel 10g', salt: 'Choline Salicylate 8.7% + Benzalkonium Chloride 0.1% oral gel (avoid if platelets low/bleeding tendency)', doseOptions: ['Apply on ulcers 3-4 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Neuropathy support
    { name: 'Methycobal 500 Tablet', salt: 'Mecobalamin (Vitamin B12) 500 mcg', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pregalin 75 Capsule', salt: 'Pregabalin 75 mg (nerve pain — CONTINUATION-VERIFY: continue as per neuro/oncology dose; dizziness/sedation — fall caution)', doseOptions: ['1 cap at bedtime — as advised by specialist'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabapin 100 Capsule', salt: 'Gabapentin 100 mg (nerve pain continuation; sedation/fall caution in elderly)', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Anemia support (cancer)
    { name: 'Orofer XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg (after food; no tea/milk 1 hr around it)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Autrin Capsule', salt: 'Ferrous Fumarate + Vitamin B12 + Folic Acid hematinic', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dexorange Syrup 200ml', salt: 'Iron + Vitamin B12 + Folic Acid syrup', doseOptions: ['10 ml twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Bone health support
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU (bone support on hormone therapy/mets)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Tobacco cessation (coordinate PUL)
    { name: 'Nicotex 2 mg Chewing Gum', salt: 'Nicotine Polacrilex 2 mg gum (cessation aid — coordinate with cessation counselling)', doseOptions: ['1 gum when urge strikes (max 8-12/day)'], morning: 0, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nicotex 4 mg Chewing Gum', salt: 'Nicotine Polacrilex 4 mg gum (for heavy users; coordinate cessation counselling)', doseOptions: ['1 gum when urge strikes (max 8/day)'], morning: 0, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Distress / sleep (mild only)
    { name: 'Meloset 3 Tablet', salt: 'Melatonin 3 mg (mild sleep support; non-habit forming)', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Vitamins
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Appetite support
    { name: 'Ciplactin 4 Tablet', salt: 'Cyproheptadine HCl 4 mg (appetite support; sedation possible; short courses only)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // GI / hydration / diarrhoea
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Eldoper 100 Capsule', salt: 'Racecadotril 100 mg (antisecretory anti-diarrhoeal — STOP and report urgently if fever or blood in stool)', doseOptions: ['1 cap up to 3 times/day before food'], morning: 1, afternoon: 1, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg (gastric protection with analgesics/steroids)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone)', doseOptions: ['10 ml SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Wound care (palliative home)
    { name: 'Betadine Solution 100ml', salt: 'Povidone-Iodine 10% solution (gentle cleansing of wound margins — dilute as advised)', doseOptions: ['Dilute for gentle cleansing', 'Apply on surrounding skin as advised'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Metrogyl Gel 30g', salt: 'Metronidazole 1% w/w topical gel (fungating-wound odor control; apply to wound edges as directed)', doseOptions: ['Apply thin layer on wound edge 1-2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Topical analgesic
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel (intact skin only)', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Paracetamol suspension (mucositis swallow difficulty)
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml (for patients unable to swallow tablets)', doseOptions: ['10 ml (500 mg)', '15 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (40 — refer-only findings ZERO links) ════
  findingMeds: [
    // CHEMO-FU-SUPPORT
    { findingKey: 'CHEMO-FU-SUPPORT', medicineName: 'Becosules Capsule', description: '1 cap OD — general supportive during treatment' },
    // CHEMO-NAUSEA
    { findingKey: 'CHEMO-NAUSEA', medicineName: 'Emeset 4 Tablet', dose: '1 tab (4 mg)', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'BD-TDS during nausea days; before meals' },
    { findingKey: 'CHEMO-NAUSEA', medicineName: 'Emeset 8 Tablet', dose: '1 tab (8 mg)', morning: 0, afternoon: 0, evening: 1, tab: 6, description: 'For heavier nausea — as advised' },
    { findingKey: 'CHEMO-NAUSEA', medicineName: 'Perinorm 10 Tablet', dose: '1 tab (10 mg)', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'Short course only — max ~5 days; watch for twitching' },
    // CHEMO-MUCOSITIS
    { findingKey: 'CHEMO-MUCOSITIS', medicineName: 'Mucopain Gel 15g', description: 'Apply 5-10 min before meals + saline-bicarbonate rinses 6x/day' },
    { findingKey: 'CHEMO-MUCOSITIS', medicineName: 'Zytee Gel 10g', description: 'Alternate with Mucopain; avoid if platelets low' },
    { findingKey: 'CHEMO-MUCOSITIS', medicineName: 'Calpol 250 Suspension', description: '10 ml SOS — when swallowing tablets is hard' },
    // CHEMO-NEUROPATHY
    { findingKey: 'CHEMO-NEUROPATHY', medicineName: 'Methycobal 500 Tablet', description: '1 tab OD — neuropathy support' },
    { findingKey: 'CHEMO-NEUROPATHY', medicineName: 'Neurobion Forte Tablet', description: '1 tab OD — B-complex support' },
    { findingKey: 'CHEMO-NEUROPATHY', medicineName: 'Pregalin 75 Capsule', description: 'CONTINUATION-VERIFY only — continue specialist dose' },
    // CHEMO-DIARRHEA
    { findingKey: 'CHEMO-DIARRHEA', medicineName: 'Electral Sachet (ORS)', description: 'After every loose stool; fever/blood = urgent' },
    { findingKey: 'CHEMO-DIARRHEA', medicineName: 'Eldoper 100 Capsule', description: '1 cap TDS ≤7 days; stop + report if fever or blood' },
    // CHEMO-CONSTIPATION
    { findingKey: 'CHEMO-CONSTIPATION', medicineName: 'Cremaffin Syrup 225ml', description: '15 ml HS — scheduled daily while constipating medicines continue' },
    { findingKey: 'CHEMO-CONSTIPATION', medicineName: 'Duphalac Solution 200ml', description: '15 ml HS — gentler alternative' },
    { findingKey: 'CHEMO-CONSTIPATION', medicineName: 'Dulcolax 5 Tablet', description: '1-2 tabs HS only when 4+ days without stool' },
    // APPETITE-LOSS-CANCER
    { findingKey: 'APPETITE-LOSS-CANCER', medicineName: 'Ciplactin 4 Tablet', description: '1 tab BD — short course appetite support' },
    { findingKey: 'APPETITE-LOSS-CANCER', medicineName: 'Becosules Capsule', description: '1 cap OD with small frequent calorie-dense meals' },
    // CACHEXIA-CANCER
    { findingKey: 'CACHEXIA-CANCER', medicineName: 'Ciplactin 4 Tablet', description: 'Appetite support alongside protein-dense diet plan' },
    { findingKey: 'CACHEXIA-CANCER', medicineName: 'Dexorange Syrup 200ml', description: '10 ml BD — hematinic supportive' },
    { findingKey: 'CACHEXIA-CANCER', medicineName: 'Zincovit Tablet', description: '1 tab OD — trace-element support' },
    // PAIN-NOS-CANCER (WHO ladder)
    { findingKey: 'PAIN-NOS-CANCER', medicineName: 'Dolo 650 Tablet', dose: '1 tab (650 mg) every 8 hrs', morning: 1, afternoon: 1, evening: 1, tab: 30, description: 'Ladder-1: REGULAR by the clock — not SOS' },
    { findingKey: 'PAIN-NOS-CANCER', medicineName: 'Combiflam Tablet', description: 'CAUTION — cancer GI/renal/platelet risk; only if advised, after food' },
    { findingKey: 'PAIN-NOS-CANCER', medicineName: 'Ultracet Tablet', description: 'SOS only; regular weak-opioid use via specialist referral' },
    { findingKey: 'PAIN-NOS-CANCER', medicineName: 'Morphitroy 10 Tablet', description: 'CONTINUATION-VERIFY ONLY — exact pain-team dose; never crush; never self-increase' },
    { findingKey: 'PAIN-NOS-CANCER', medicineName: 'Cremaffin Syrup 225ml', description: 'MANDATORY daily alongside ANY opioid — prevents opioid constipation' },
    // ANEMIA-CANCER
    { findingKey: 'ANEMIA-CANCER', medicineName: 'Orofer XT Tablet', description: '1 tab OD after food × 4-8 weeks; ESA/transfusion decisions with oncologist' },
    { findingKey: 'ANEMIA-CANCER', medicineName: 'Autrin Capsule', description: '1 cap OD — alternative hematinic' },
    { findingKey: 'ANEMIA-CANCER', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — folate support' },
    // DISTRESS-CANCER
    { findingKey: 'DISTRESS-CANCER', medicineName: 'Meloset 3 Tablet', description: '1 tab HS — mild sleep support; ongoing distress → coordinate PSY' },
    // BREAST-CFU
    { findingKey: 'BREAST-CFU', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD — bone support on hormone therapy' },
    { findingKey: 'BREAST-CFU', medicineName: 'Uprise D3 60K Sachet', description: '1 sachet weekly — vitamin D support' },
    // PROSTATE-HORMONE-FU
    { findingKey: 'PROSTATE-HORMONE-FU', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD — bone support on ADT' },
    { findingKey: 'PROSTATE-HORMONE-FU', medicineName: 'Uprise D3 60K Sachet', description: '1 sachet weekly — vitamin D support' },
    // ORAL-CA-FU
    { findingKey: 'ORAL-CA-FU', medicineName: 'Nicotex 2 mg Chewing Gum', description: 'When urge strikes — coordinate cessation counselling + oral-surgeon FU' },
    { findingKey: 'ORAL-CA-FU', medicineName: 'Nicotex 4 mg Chewing Gum', description: 'For heavy users — with structured 5R counselling' },
    { findingKey: 'ORAL-CA-FU', medicineName: 'Mucopain Gel 15g', description: 'Ulcer-pain relief while under surgeon review' },
    // LYMPHOMA-FU
    { findingKey: 'LYMPHOMA-FU', medicineName: 'Becosules Capsule', description: '1 cap OD — supportive during follow-up' },
    // COLON-STOMA-FU
    { findingKey: 'COLON-STOMA-FU', medicineName: 'Orofer XT Tablet', description: '1 tab OD — post-surgical anemia support' },
    // THYROID-SUPPRESS-FU
    { findingKey: 'THYROID-SUPPRESS-FU', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD — bone support during TSH suppression' },
    // BLOOD-CANCER-FU
    { findingKey: 'BLOOD-CANCER-FU', medicineName: 'Becosules Capsule', description: '1 cap OD — supportive during continuation therapy' },
    // DIET-COUNSELLING
    { findingKey: 'DIET-COUNSELLING', medicineName: 'Zincovit Tablet', description: '1 tab OD only as adjunct — balanced diet first, no booster products' },
    // NEUTROPENIA-FU, CANCER-SURVEILLANCE + all 12 refer-only findings:
    // deliberately ZERO medicine links — monitoring/referral only.
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'WHO Pain Ladder Grid (Doctor Reference)',
      rows: 3,
      cols: 4,
      headerLabel: ['सीढ़ी', 'दवा-वर्ग', 'उदाहरण', 'सावधानी'],
      colsLabel: ['Ladder Step', 'Medicine Class', 'Example', 'Cautions'],
      footerLabel: ['खुद खुराक कभी न बढ़ाएं — ओपिओइड के साथ कब्ज-दवा अनिवार्य / Never self-increase dose — laxative mandatory with opioids'],
    },
    {
      name: 'Neutropenic Fever Action Card',
      rows: 4,
      cols: 2,
      headerLabel: ['स्थिति', 'करने योग्य कार्य'],
      colsLabel: ['Situation', 'Action'],
      footerLabel: ['38.3°C (101°F) = आपातकाल — सुबह का इंतज़ार नहीं, पहले-खुद-दवा नहीं / 38.3°C = EMERGENCY — no waiting till morning, no self-medicating first'],
    },
    {
      name: 'Chemo Side-Effect Diary (7 days)',
      rows: 7,
      cols: 6,
      headerLabel: ['दिन', 'मतली (0-3)', 'मुंह-छाल (0-4)', 'दस्त', 'भूख (0-5)', 'दर्द (0-10)'],
      colsLabel: ['Day', 'Nausea (0-3)', 'Ulcer (0-4)', 'Bowel', 'Appetite (0-5)', 'Pain (0-10)'],
      footerLabel: ['हर हफ्ते डॉक्टर को दिखाएं / Show to your doctor weekly'],
    },
    {
      name: 'Mouth-Care Protocol (Chemo)',
      rows: 5,
      cols: 3,
      headerLabel: ['चरण', 'क्या करें', 'कितनी बार'],
      colsLabel: ['Step', 'What to Do', 'Frequency'],
      footerLabel: ['कुल्ला नुस्खा: 1 गिलास गुनगुने पानी + आधा चम्मच नमक + आधा चम्मच मीठा सोडा / Rinse recipe: 1 glass warm water + ½ tsp salt + ½ tsp baking soda'],
    },
    {
      name: 'Stoma Care Card',
      rows: 4,
      cols: 3,
      headerLabel: ['चरण', 'कार्य', 'खतरे के संकेत'],
      colsLabel: ['Step', 'Action', 'Danger Signs'],
      footerLabel: ['त्वचा सूखी + बैग की सील रोज़ जांचें / Keep skin dry + check bag seal daily'],
    },
    {
      name: 'End-Stage Comfort Log (7 days)',
      rows: 7,
      cols: 5,
      headerLabel: ['दिन', 'दर्द (0-10)', 'नींद (घंटे)', 'चिंता (0-10)', 'कॉल जरूरी?'],
      colsLabel: ['Day', 'Pain (0-10)', 'Sleep (hrs)', 'Anxiety (0-10)', 'Call Needed?'],
      footerLabel: ['दर्द ≥7 या सांस/बेचैनी तेज़ = पैलिएटिव टीम को कॉल करें / Pain ≥7 or severe breathlessness/restlessness = call palliative team'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Post-Chemo-Cycle Support Bundle',
      diagnosis: 'CHEMO-FU-SUPPORT',
      medicines: [
        { name: 'Emeset 8 Tablet', dose: '1 tab (8 mg)', duration: '3 days', instructions: 'BD after the cycle for nausea; before meals if queasy' },
        { name: 'Mucopain Gel 15g', dose: 'Apply thin layer', duration: '7 days', instructions: '5-10 min before meals on mouth ulcers' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml', duration: '7 days', instructions: 'At bedtime — keep bowels regular' },
        { name: 'Becosules Capsule', dose: '1 cap', duration: '15 days', instructions: 'After food' },
      ],
      labs: ['CBC (per oncology schedule — usually day 10-14)', 'Daily temperature log'],
      advice: 'रोज़ तापमान नापें — 38.3°C (101°F) होते ही बिना देर अस्पताल जाएं · नमक+सोडा कुल्ला दिन में 6 बार · भीड़ से बचें, मास्क लगाएं',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Mucositis Care Course',
      diagnosis: 'CHEMO-MUCOSITIS',
      medicines: [
        { name: 'Mucopain Gel 15g', dose: 'Apply thin layer', duration: '7 days', instructions: 'Before meals + SOS' },
        { name: 'Zytee Gel 10g', dose: 'Apply on ulcers', duration: '7 days', instructions: '3-4 times/day; avoid if platelets low' },
        { name: 'Calpol 250 Suspension', dose: '10 ml (500 mg)', duration: '5 days', instructions: 'SOS if swallowing tablets is hard' },
      ],
      labs: ['CBC with platelet count (if bleeding from mouth)'],
      advice: 'नमक+सोडा कुल्ला (1 गिलास गुनगुना पानी + आधा चम्मच नमक + आधा चम्मच मीठा सोडा) दिन में 6 बार · नरम-ठंडा खाना · तीखा/गरम/कुरकुरा व शराब-वाली माउथवॉश बंद',
      followUpDays: 5,
    },
    {
      name: 'Mild Cancer Pain — Ladder 1 Visit',
      diagnosis: 'PAIN-NOS-CANCER',
      medicines: [
        { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '7 days', instructions: 'REGULAR — every 8 hrs by the clock, not SOS; max 3 g/day' },
        { name: 'Voveran Gel 30g', dose: 'Apply locally', duration: '5 days', instructions: 'Only if pain is localised; intact skin only' },
      ],
      labs: ['Pain diary (score 0-10, thrice daily)'],
      advice: 'दर्द की डायरी रखें · नियमित गोली न छोड़ें · आराम 50% से कम रहे या रात में ज्यादा हो तो बताएं — सीढ़ी बदलेंगे · खुद खुराक कभी न बढ़ाएं',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'Opioid Continuation-Verify Visit',
      diagnosis: 'PALLIATIVE-FU',
      medicines: [
        { name: 'Morphitroy 10 Tablet', dose: 'AS PER PAIN-TEAM PRESCRIPTION', duration: '15 days', instructions: 'CONTINUE exact dose — NEVER crush/chew/split — never self-increase; bring the pain-team letter' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml', duration: '15 days', instructions: 'MANDATORY daily at bedtime while on morphine' },
        { name: 'Dulcolax 5 Tablet', dose: '1-2 tabs', duration: '10 days', instructions: 'Only if no stool for 4 days despite syrup' },
      ],
      labs: ['Pain score log', 'Bowel diary'],
      advice: 'दर्द की गोली टीम ने जैसी लिखी वैसी ही — चबाना/तोड़ना कभी नहीं · कब्ज की दवा रोज़ जरूरी · नशे का डर से दर्द की गोली न छोड़ें — डॉक्टर से पूछें · पैलिएटिव टीम का नंबर दीवार पर लगाएं',
      followUpDays: 7,
    },
    {
      name: 'Cancer Anemia Support Visit',
      diagnosis: 'ANEMIA-CANCER',
      medicines: [
        { name: 'Orofer XT Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food; no tea/milk within 1 hour of the dose' },
        { name: 'Folvite 5 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food' },
        { name: 'Becosules Capsule', dose: '1 cap', duration: '30 days', instructions: 'After food' },
      ],
      labs: ['CBC + Hemoglobin', 'Serum ferritin (if advised)'],
      advice: 'आयरन के 1 घंटे बाद चाय नहीं · हर हफ्ते वजन/कमजोरी नोट करें · चक्कर, सांस फूलना या धड़कन तेज़ बढ़े तो बताएं',
      followUpDays: 14,
    },
    {
      name: 'Palliative Home-Care Initial Visit',
      diagnosis: 'PALLIATIVE-FU',
      medicines: [
        { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '7 days', instructions: 'Mild pain — every 8 hrs if needed' },
        { name: 'Meloset 3 Tablet', dose: '1 tab', duration: '10 days', instructions: 'At bedtime for sleep' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml', duration: '10 days', instructions: 'Bedtime — bowel comfort' },
        { name: 'Mucopain Gel 15g', dose: 'Apply before meals', duration: '10 days', instructions: 'If mouth ulcers present' },
      ],
      labs: ['Comfort log (pain/sleep/anxiety daily)'],
      advice: 'आपातकाल कार्ड पर तीन संकेत: 1) बुखार 38.3°C 2) पैरों की नई कमजोरी/पेशाब रिसाव 3) ज़्यादा खून — तीनों में तुरंत अस्पताल · पैलिएटिव टीम का नंबर साथ रखें · हर 2 घंटे पलटाएं',
      followUpDays: 7,
      isCommon: true,
    },
  ],
}
