/**
 * CTV-01 — CARDIOTHORACIC SURGERY STARTER PACK (T3 lite)
 *
 * CTV surgeon's clinic = PRE-OPERATIVE WORKUP + POST-OPERATIVE HOME
 * RECOVERY. This is the most refer-heavy pack:
 *   - Medical management of heart/lung disease stays with the
 *     cardiologist (CAR-01) / pulmonologist (PUL-01) — the CTV pack
 *     always frames COORDINATION, never ownership of cardiac meds.
 *   - Post-CABG cardiac medicines (Ecosprin/atorvastatin/metoprolol),
 *     warfarin and anti-TB treatment appear ONLY as
 *     continuation-verify framing in questions/suggestions —
 *     NEVER as medicine entries in this pack.
 *
 * Safety rails baked in everywhere:
 *   - ACUTE-AORTIC-SYNDROME / TAMPONADE / MASSIVE-HEMOPTYSIS /
 *     STROKE-ON-ANTICOAGULANT = EMERGENCY findings with ZERO
 *     findingMeds links (hospital NOW, 108 ambulance framing).
 *   - Lung mass / severe symptomatic AS / pediatric congenital =
 *     zero-med referral pathways (PUL/ONC / surgical urgency /
 *     child-cardiac centre).
 *   - Warfarin = never self-adjust; INR continuation-verify;
 *     vitamin-K food CONSISTENCY (palak/gobhi/methi) not avoidance.
 *   - NO NSAID entries — paracetamol only (cardiac-surgery patient).
 *   - Augmentin only as a FIXED course for wound infection.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English
 * secondary (doctor search). Medicine names = English brands.
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const CTV01_PACK: SpecialtyPack = {
  meta: {
    code: 'CTV-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Cardiothoracic Surgery Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · surgical OPD eval + post-op care; medical mgmt = CAR/PUL coordinate',
  },

  // ══ Categories (4) ════════════════════════════════════════════════════
  categories: [
    { key: 'CRD', name: 'कार्डियक सर्जरी जांच', nameEn: 'Cardiac Surgery Evaluation' },
    { key: 'VAL', name: 'वाल्व सर्जरी', nameEn: 'Valve Surgery' },
    { key: 'THR', name: 'थोरेसिक/फेफड़े', nameEn: 'Thoracic & Lung' },
    { key: 'POS', name: 'ऑपरेशन के बाद रिकवरी', nameEn: 'Post-op Recovery' },
  ],

  // ══ Complaints (15) ═══════════════════════════════════════════════════
  complaints: [
    // CRD — cardiac surgery evaluation
    { code: 'CRD01', categoryKey: 'CRD', detail: 'बाईपास ऑपरेशन की सलाह', detailEn: 'CABG Surgery Consultation' },
    { code: 'CRD02', categoryKey: 'CRD', detail: 'छाती में दर्द — जोखिम जांच के लिए', detailEn: 'Chest Pain — Risk Evaluation (coordinate CAR)' },
    { code: 'CRD03', categoryKey: 'CRD', detail: 'धमनी (एऑर्टा) की गांठ जांच', detailEn: 'Aortic Aneurysm Evaluation (danger triage)' },
    { code: 'CRD04', categoryKey: 'CRD', detail: 'बच्चे का दिल ऑपरेशन — सलाह', detailEn: 'Pediatric Heart Surgery Consultation (refer)' },
    { code: 'CRD05', categoryKey: 'CRD', detail: 'पेसमेकर लगने के बाद — देखभाल', detailEn: 'Post-Pacemaker Care & Precautions' },
    // VAL — valve surgery
    { code: 'VAL01', categoryKey: 'VAL', detail: 'वाल्व बदलने की सलाह', detailEn: 'Valve Replacement Consultation' },
    { code: 'VAL02', categoryKey: 'VAL', detail: 'वाल्व ऑपरेशन के बाद — वारफेरिन देखभाल', detailEn: 'Post-Valve Surgery — Warfarin Care' },
    { code: 'VAL03', categoryKey: 'VAL', detail: 'सांस चढ़ना + दिल की आवाज़ (वाल्व संदिग्ध)', detailEn: 'Breathlessness with Heart Murmur (valve suspect)' },
    // THR — thoracic/lung
    { code: 'THR01', categoryKey: 'THR', detail: 'फेफड़े की गांठ की जांच', detailEn: 'Lung Mass Evaluation (coordinate PUL/ONC)' },
    { code: 'THR02', categoryKey: 'THR', detail: 'खांसी में खून', detailEn: 'Hemoptysis (Coughing Blood)' },
    { code: 'THR03', categoryKey: 'THR', detail: 'फेफड़े ऑपरेशन के बाद — रिकवरी', detailEn: 'Post-Thoracotomy Recovery' },
    { code: 'THR04', categoryKey: 'THR', detail: 'छाती की हड्डी दबी हुई (पेक्टस)', detailEn: 'Pectus Chest Deformity' },
    { code: 'THR05', categoryKey: 'THR', detail: 'रात को पसीना + बुखार (टीबी संदिग्ध)', detailEn: 'Night Sweats with Fever (TB-suspect, coordinate PUL)' },
    // POS — post-op recovery
    { code: 'POS01', categoryKey: 'POS', detail: 'दिल के ऑपरेशन के बाद देखभाल', detailEn: 'Post-CABG Home Care' },
    { code: 'POS02', categoryKey: 'POS', detail: 'ऑपरेशन के बाद घाव ठीक नहीं', detailEn: 'Post-op Sternal Wound Problem' },
  ],

  // ══ Questions (30 — 2 per complaint; // idx N = true 0-based index) ════
  questions: [
    // idx 0 — CRD01
    { complaintCode: 'CRD01', question: 'कार्डियोलॉजिस्ट ने बाईपास की सलाह किस रिपोर्ट देखकर की — एंजियोग्राफी की रिपोर्ट साथ लाएं?', questionEn: 'Which report led the cardiologist to advise bypass — bring the angiography report?' },
    // idx 1 — CRD01
    { complaintCode: 'CRD01', question: 'फिलहाल दिल की कौन-कौन सी दवाइयां चल रही हैं — नाम कागज़ पर लिखवाकर लाएं?', questionEn: 'Which heart medicines are running now — bring names written on paper?' },
    // idx 2 — CRD02
    { complaintCode: 'CRD02', question: 'दर्द कैसा है — चुभता/भारीपन वाला, और पीठ या जबड़े-बाएं हाथ तक जाता है क्या?', questionEn: 'What is the pain like — stabbing/heavy, and does it radiate to the back, jaw or left arm?' },
    // idx 3 — CRD02
    { complaintCode: 'CRD02', question: 'दर्द के साथ पसीना, उल्टी या बेहोशी जैसा लगा था क्या?', questionEn: 'With the pain, was there sweating, vomiting or a faint feeling?' },
    // idx 4 — CRD03
    { complaintCode: 'CRD03', question: 'दर्द अचानक फाड़ने जैसा शुरू हुआ और पीठ की ओर गया क्या?', questionEn: 'Did the pain start suddenly like tearing and move toward the back?' },
    // idx 5 — CRD03
    { complaintCode: 'CRD03', question: 'स्कैन (CT एंजियो) की रिपोर्ट में धमनी का साइज़ कितना लिखा है?', questionEn: 'What aorta size is written in the CT angio report?' },
    // idx 6 — CRD04
    { complaintCode: 'CRD04', question: 'बच्चे की उम्र क्या है और दिल की कमी (defect) का नाम क्या बताया गया?', questionEn: "What is the child's age, and the name of the heart defect told?" },
    // idx 7 — CRD04
    { complaintCode: 'CRD04', question: 'बच्चे का वजन क्या है — खाना निगलते समय मेहनत, पसीना या होंठ/नाखूनों का नीलापन दिखता है क्या?', questionEn: "What is the child's weight — feeding sweat, or blue lips/nails visible?" },
    // idx 8 — CRD05
    { complaintCode: 'CRD05', question: 'पेसमेकर कब लगा था और कंपनी/मॉडल का कार्ड आपके पास है?', questionEn: 'When was the pacemaker implanted, and do you carry the company/model card?' },
    // idx 9 — CRD05
    { complaintCode: 'CRD05', question: 'लगने के बाद से चक्कर, तेज़ धड़कन या जनरेटर वाली जगह पर सूजन/दर्द कोई दिक्कत रही?', questionEn: 'Since implantation, any dizziness, racing heartbeat, or swelling/pain at the generator site?' },
    // idx 10 — VAL01
    { complaintCode: 'VAL01', question: 'कौन सा वाल्व खराब बताया गया है और पुरानी-नई इको रिपोर्ट में गिरावट कितनी तेज़ है?', questionEn: 'Which valve is damaged, and how fast is the worsening between old and new echo reports?' },
    // idx 11 — VAL01
    { complaintCode: 'VAL01', question: 'सीने में दर्द, बेहोशी के झटके या रात में सांस फूलना — कोई एक हुआ है क्या?', questionEn: 'Any chest pain, fainting spells, or night-time breathlessness — has even one occurred?' },
    // idx 12 — VAL02
    { complaintCode: 'VAL02', question: 'वारफेरिन की खुराक क्या चल रही है और आखिरी INR कब/कितना आया था?', questionEn: 'What warfarin dose is running, and when/what was the last INR?' },
    // idx 13 — VAL02
    { complaintCode: 'VAL02', question: 'पेशाब, मल या मसूड़ों से खून आना या गिरने-टकराने की कोई तेज़ चोट हुई है?', questionEn: 'Any bleeding from urine, stool or gums, or any hard fall/injury?' },
    // idx 14 — VAL03
    { complaintCode: 'VAL03', question: 'सांस फूलना कब शुरू हुआ — आराम में, लेटने पर या चलने-चढ़ने पर?', questionEn: 'When did breathlessness begin — at rest, lying flat, or on walking/climbing?' },
    // idx 15 — VAL03
    { complaintCode: 'VAL03', question: 'साथ में खांसी, थूक में खून की धारियाँ या धड़कन का उछाल (फटाफट चलना) महसूस होता है?', questionEn: 'Any cough, blood-streaked sputum, or a fluttering sensation of the heartbeat?' },
    // idx 16 — THR01
    { complaintCode: 'THR01', question: 'सीटी स्कैन में गांठ कितने मिमी की लिखी है और स्कैन कब का है?', questionEn: 'What mm size is the nodule on the CT scan, and how old is the scan?' },
    // idx 17 — THR01
    { complaintCode: 'THR01', question: 'खांसी, वजन घटना या थूक में खून — कोई लक्षण साथ में है?', questionEn: 'Any cough, weight loss, or blood in sputum alongside?' },
    // idx 18 — THR02
    { complaintCode: 'THR02', question: 'खून कितना आया — थूक में धारियाँ/धब्बे या मुँह भर खून?', questionEn: 'How much blood — streaks/spots in sputum, or a mouthful?' },
    // idx 19 — THR02
    { complaintCode: 'THR02', question: 'बुखार, रात का पसीना या पुरानी खांसी — कितने महीनों से चल रहा है?', questionEn: 'Fever, night sweats, or a chronic cough — running for how many months?' },
    // idx 20 — THR03
    { complaintCode: 'THR03', question: 'ऑपरेशन को कितने हफ्ते/महीने हुए और फेफड़े का कौन सा हिस्सा निकाला गया था?', questionEn: 'How many weeks/months since surgery, and which part of the lung was removed?' },
    // idx 21 — THR03
    { complaintCode: 'THR03', question: 'सांस के व्यायाम (स्पाइरोमीटर/गुब्बारा) रोज़ कर पा रहे हैं — दिन में कितनी बार?', questionEn: 'Are you doing the breathing exercises (spirometer/balloon) daily — how many times a day?' },
    // idx 22 — THR04
    { complaintCode: 'THR04', question: 'छाती की हड्डी कब से दबी हुई है और दौड़ने/ऊपर चढ़ने में सांस या दर्द की दिक्कत है?', questionEn: 'Since when is the chest sunken, and any breathing trouble or pain while running/climbing?' },
    // idx 23 — THR04
    { complaintCode: 'THR04', question: 'साथ में झुके कंधे या रीढ़ का बढ़ता झुकाव भी दिखता है क्या?', questionEn: 'Any stooped shoulders or increasing spinal curvature alongside?' },
    // idx 24 — THR05
    { complaintCode: 'THR05', question: 'बुखार/रात का पसीना कितने हफ्तों से है और वजन कितना घटा है?', questionEn: 'Fever/night sweats for how many weeks, and how much weight lost?' },
    // idx 25 — THR05
    { complaintCode: 'THR05', question: 'बलगम की टीबी जांच (ज़ी-एन/बैक्टीरियोलॉजिकल) या छाती का एक्सरे कराया है क्या?', questionEn: 'Has sputum TB testing (ZN/bacterial) or a chest X-ray been done?' },
    // idx 26 — POS01
    { complaintCode: 'POS01', question: 'ऑपरेशन को कितने हफ्ते हुए और दिल की दवाइयां (इकोस्प्रिन आदि) ज्यों की त्यों जारी हैं — निरंतरता-जांच?', questionEn: 'How many weeks post-op, and are heart medicines (aspirin etc.) continuing exactly as prescribed — continuation check?' },
    // idx 27 — POS01
    { complaintCode: 'POS01', question: 'रोज़ कितनी देर चल पा रहे हैं और छाती की हड्डी पर दबाव/चूड़ी जैसी आवाज़ महसूस होती है?', questionEn: 'How long can you walk daily, and any pressure/clicking sensation over the breastbone?' },
    // idx 28 — POS02
    { complaintCode: 'POS02', question: 'घाव पर लाली, सूजन, पानी/मवाद या बदबू — में से क्या-क्या दिख रहा है?', questionEn: 'Redness, swelling, discharge/pus or odor — which of these are visible at the wound?' },
    // idx 29 — POS02
    { complaintCode: 'POS02', question: 'बुखार 100°F से ज्यादा या कंपकंपी (ठंड लगना) कोई दिन रहा है?', questionEn: 'Any fever above 100°F or chills (rigors) on any day?' },
  ],

  // ══ Suggestions (60 — exactly 2 per question) ═════════════════════════
  suggestions: [
    // q0
    { questionIndex: 0, text: 'एंजियोग्राफी की रिपोर्ट + CD और सभी पुरानी रिपोर्टें हर मुलाकात में साथ लाएं — बिना इनके सर्जिकल फैसला नहीं होता', textEn: 'Bring the angiography report + CD and all old reports to every visit — surgical decisions cannot be made without them' },
    { questionIndex: 0, text: 'दिल की दवाइयां कार्डियोलॉजिस्ट (CAR-01) तय करते हैं — हम दोनों की सलाह मिलाकर ऑपरेशन की तैयारी चलाएंगे', textEn: 'Heart medicines are decided by the cardiologist (CAR-01) — we will run the operation preparation combining both advices' },
    // q1
    { questionIndex: 1, text: 'बाईपास से पहले धूम्रपान/तंबाकू बंद करना सबसे बड़ी तैयारी है — आज से ही शुरू करें, फेफड़े और घाव दोनों जल्दी ठीक होते हैं', textEn: 'Stopping smoking/tobacco before bypass is the biggest preparation — start today; both lungs and wound heal faster' },
    { questionIndex: 1, text: 'शुगर और BP का घर का रिकॉर्ड लाएं — ऑपरेशन से पहले दोनों का कसकर नियंत्रण जरूरी है (इलाज कार्डियोलॉजिस्ट/फिजिशियन के साथ)', textEn: 'Bring your home sugar and BP records — tight control of both is needed before surgery (treatment with the cardiologist/physician)' },
    // q2
    { questionIndex: 2, text: 'चलने-चढ़ने पर आकर आराम से जाता दर्द भी कार्डियोलॉजिस्ट (CAR-01 समन्वय) को ECG कराकर दिखाएं — दवा वही तय करेंगे', textEn: 'Even pain that comes on exertion and settles with rest needs an ECG shown to the cardiologist (CAR-01 coordination) — they decide the medicine' },
    { questionIndex: 2, text: 'दर्द बढ़े, पसीना आए या 20 मिनट से ज्यादा रहे — खुद गाड़ी न चलाएं; मुफ्त 108 एम्बुलेंस से नजदीकी अस्पताल तुरंत', textEn: 'If pain worsens, sweating appears or it lasts beyond 20 minutes — do not drive yourself; free 108 ambulance to the nearest hospital immediately' },
    // q3
    { questionIndex: 3, text: 'सीने के दर्द के साथ पसीना/उल्टी/बेहोशी जैसा अहसास = दिल का दौरा हो सकता है — घर पर इंतज़ार बिल्कुल नहीं, 108 अभी बुलाएं', textEn: 'Chest pain with sweating/vomiting/faint feeling = possible heart attack — absolutely no waiting at home, call 108 now' },
    { questionIndex: 3, text: 'ऐसे मरीज़ को गाड़ी में बिठाकर लाना भी खतरनाक है — ECG वाली एम्बुलेंस से नजदीकी केंद्र भेजें, इलाज सुनहरे घंटे में ही बचाता है', textEn: 'Bringing such a patient seated in a car is also risky — send via an ECG-equipped ambulance to the nearest centre; treatment saves only within the golden hour' },
    // q4
    { questionIndex: 4, text: 'अचानक फाड़ने वाला दर्द जो पीठ में जाए = एऑर्टिक इमरजेंसी — बड़े अस्पताल तुरंत; इस दर्द में देर जानलेवा होती है', textEn: 'Sudden tearing pain travelling to the back = aortic emergency — reach a major hospital NOW; delay in this pain is lethal' },
    { questionIndex: 4, text: 'ऐसा दर्द हो तो खाना-दवा रोककर बिस्तर पर लेटे रहें और तुरंत 108 बुलाएं — चलना/मेहनत/सीढ़ी चढ़ना बिल्कुल मना', textEn: 'If such pain occurs, stop food/medicines, stay in bed and call 108 immediately — no walking, exertion or climbing stairs at all' },
    // q5
    { questionIndex: 5, text: 'रिपोर्ट में धमनी 5 सेमी या ज्यादा हो तो नियमित स्कैन + जल्दी-जल्दी मुलाकात जरूरी — बढ़ते साइज़ का ऑपरेशन-समय इसी से तय होता है', textEn: 'If the aorta is 5 cm or more on the report, regular scans + frequent reviews are a must — the operation timing for a growing size depends on this' },
    { questionIndex: 5, text: 'खांसते या जोर लगाते समय पेट/छाती में गहरा दर्द या गांठ में तेज़ धड़कन दिखे — बिना देरी बताएं, यह बढ़ने का संकेत है', textEn: 'Deep pain in the abdomen/chest while coughing or straining, or a pulsating lump — report without delay; these are signs of expansion' },
    // q6
    { questionIndex: 6, text: 'बच्चों के दिल की सर्जरी खास प्रशिक्षित बाल-हृदय टीम ही करती है — हम जांच कराकर सही केंद्र का रेफर देंगे', textEn: "Children's heart surgery is done only by specially trained child-cardiac teams — we will get the workup done and refer you to the right centre" },
    { questionIndex: 6, text: 'बच्चे की इको रिपोर्ट + वजन-उम्र का चार्ट हर मुलाकात में लाते रहें — ऑपरेशन का सही समय इसी से तय होता है', textEn: "Keep bringing the child's echo report + weight-for-age chart to every visit — the right timing of surgery is decided from these" },
    // q7
    { questionIndex: 7, text: 'खाना निगलते समय ज्यादा मेहनत/पसीना या होंठ-नाखून नीले पड़ना = कमी बिगड़ रही है — उसी हफ्ते बाल-हृदय केंद्र दिखाएं, टालें नहीं', textEn: 'Heavy effort/sweating while feeding, or blue lips/nails = the defect is worsening — show the child-cardiac centre that very week, do not postpone' },
    { questionIndex: 7, text: 'नीलापन बढ़ने पर बच्चे को घुटनों-सीने की तरफ झुकाकर रखें और तुरंत केंद्र की तरफ चलें — केंद्र ने जो तरीका सिखाया हो वही अपनाएं', textEn: 'If blueness increases, hold the child knees-to-chest and head for the centre immediately — use exactly the position your centre taught' },
    // q8
    { questionIndex: 8, text: 'पेसमेकर कार्ड हमेशा पर्स में रखें — MRI, कोई सर्जरी या एयरपोर्ट की जांच, तीनों में पहला सवाल यही कार्ड होता है', textEn: 'Always keep the pacemaker card in your purse — MRI, any surgery and airport screening, all three ask for this card first' },
    { questionIndex: 8, text: 'रोज़ सुबह एक मिनट नाड़ी गिनें — बताई गई सीमा से ज्यादा धीमी नाड़ी, चक्कर या सांस फूलना दिखे तो उसी दिन फोन करें', textEn: 'Count your pulse for one minute every morning — slower than the set limit, dizziness or breathlessness: call the same day' },
    // q9
    { questionIndex: 9, text: 'लगने के पहले महीने जनरेटर वाली जगह पर दबाव न दें; मोबाइल फोन कान दूसरी तरफ लगाएं — डिवाइस से 20 सेमी दूरी का नियम', textEn: 'No pressure over the generator pocket in the first month; hold mobile phones on the opposite ear — follow the 20 cm distance rule' },
    { questionIndex: 9, text: 'जनरेटर की जगह दुखे, सूजे या त्वचा लाल हो — देर न करें; इंफेक्शन गहरे तक जा सकता है, पट्टी खुद न खोलें', textEn: 'If the generator site hurts, swells or the skin reddens — do not delay; infection can track deep, and do not open dressings yourself' },
    // q10
    { questionIndex: 10, text: 'इको की पुरानी और नई दोनों रिपोर्ट लाएं — गिरावट की रफ्तार ही वाल्व ऑपरेशन का समय तय करती है', textEn: 'Bring both the old and new echo reports — the rate of worsening decides the timing of valve surgery' },
    { questionIndex: 10, text: 'वाल्व सर्जरी से पहले दांत दिखाकर इंफेक्शन साफ़ करवाएं — मुँह का इंफेक्शन नए वाल्व तक पहुंच सकता है', textEn: 'Get a dental check and any infection cleared before valve surgery — mouth infection can reach the new valve' },
    // q11
    { questionIndex: 11, text: 'बेहोशी या सीने का दर्द वाल्व के गंभीर तंग होने का संकेत है — ऐसा कभी हुआ हो तो ऑपरेशन की तारीख नहीं टलनी चाहिए', textEn: 'Fainting or chest pain signals severe valve narrowing — if it has ever happened, the surgery date must not be pushed back' },
    { questionIndex: 11, text: 'ये लक्षण बढ़ें तो तुरंत अस्पताल पहुंचें — गंभीर वाल्व रोग बिना चेतावनी अचानक बिगड़ सकता है', textEn: 'If these symptoms increase, reach hospital immediately — severe valve disease can deteriorate suddenly without warning' },
    // q12
    { questionIndex: 12, text: 'वारफेरिन की खुराक खुद कभी न बदलें, न एक खुराक छोड़ें — सिर्फ़ इलाज करने वाली टीम INR देखकर बदलती है', textEn: 'Never change the warfarin dose yourself, never skip a dose — only your treating team changes it after seeing the INR' },
    { questionIndex: 12, text: 'हर INR रिपोर्ट मुलाकात से पहले भेज दें और तारीख कैलेंडर पर लिखें — खुली तारीख छूटना सबसे बड़ा जोखिम है', textEn: 'Send every INR report before the visit and write the dates on a calendar — a missed date is the biggest risk' },
    // q13
    { questionIndex: 13, text: 'काला मल, कोला-जैसा पेशाब या मसूड़ों से लगातार खून = INR बिगड़ गया — उसी दिन अस्पताल, बिना इंतज़ार', textEn: 'Black stool, cola-coloured urine or persistent gum bleeding = the INR has gone wrong — hospital the same day, without waiting' },
    { questionIndex: 13, text: 'गिरने-टकराने से बचें — वारफेरिन पर सिर की हल्की चोट भी गंभीर खून बना सकती है; घर की फिसलन वाली चादरें/मोज़े हटा दें', textEn: 'Avoid falls — even a mild head bump on warfarin can cause serious bleeding; remove slippery rugs at home' },
    // q14
    { questionIndex: 14, text: 'रात में लेटने पर सांस फूलना = वाल्व की तकलीफ बढ़ रही है — इको दोहराने का समय आ गया है, मुलाकात टालें नहीं', textEn: 'Breathlessness when lying flat at night = the valve problem is progressing — it is time to repeat the echo, do not delay the visit' },
    { questionIndex: 14, text: '2-3 तकिये लगाकर और पैर नीचे करके बैठने से रात को राहत मिलती है — यह अस्थायी उपाय है, जांच का विकल्प नहीं', textEn: 'Propping up on 2-3 pillows with legs down relieves the nights — this is a temporary measure, not a substitute for evaluation' },
    // q15
    { questionIndex: 15, text: 'थूक में खून या धड़कन की तेज़ गड़बड़ी साथ हो तो तुरंत अस्पताल — माइट्रल वाल्व बिगड़ने के संकेत हैं', textEn: 'Blood in sputum or a racing irregular heartbeat alongside — hospital immediately; these are signs of a worsening mitral valve' },
    { questionIndex: 15, text: 'गले के हर इंफेक्शन का एंटीबायोटिक कोर्स पूरा करें — आधा छोड़ना वाल्व के लिए नुकसानदेह है (इलाज फिजिशियन/कार्डियोलॉजिस्ट से)', textEn: 'Complete the full antibiotic course for every throat infection — stopping midway harms the valve (treatment from the physician/cardiologist)' },
    // q16
    { questionIndex: 16, text: '8 मिमी से छोटी, बिना लक्षण वाली गांठ अक्सर 3-6 महीने में दोबारा स्कैन से देखी जाती है — रिपोर्टें साथ रखें', textEn: 'Nodules under 8 mm without symptoms are usually followed with a repeat scan in 3-6 months — keep all reports with you' },
    { questionIndex: 16, text: 'बायोप्सी का फैसला फेफड़े-रोग विशेषज्ञ (PUL-01) और कैंसर टीम (ONC-01) के साथ मिलकर होता है — हम पूरा रास्ता तय करके देंगे', textEn: 'Biopsy decisions are made together with the pulmonologist (PUL-01) and cancer team (ONC-01) — we will chart the complete pathway for you' },
    // q17
    { questionIndex: 17, text: 'खांसी + वजन घटना + थूक में खून तीनों साथ = जांच तेज़ करनी होगी — आपको सबसे नजदीकी तारीख पर बुलाते हैं', textEn: 'Cough + weight loss + blood in sputum all together = the workup must be accelerated — we will call you on the earliest date' },
    { questionIndex: 17, text: '2 हफ्ते से ज्यादा खांसी हो तो बलगम की टीबी जांच कराएं (NTEP — निःशुल्क सरकारी) — टीबी की दवा भी मुफ्त मिलती है', textEn: 'For cough beyond 2 weeks, get sputum TB testing done (NTEP — free government scheme) — TB medicines are also free' },
    // q18
    { questionIndex: 18, text: 'मुँह भर खून या लगातार बहती धार = तुरंत 108 से अस्पताल — रास्ते में बैठकर आएं, खून थूकते रहें, रोककर न रखें', textEn: 'A mouthful of blood or a continuous stream = 108 to hospital NOW — travel sitting up, keep spitting the blood out, do not hold it back' },
    { questionIndex: 18, text: 'छोटी-मोटी धारियाँ भी इसी हफ्ते की जांच मांगती हैं — इंतज़ार करते रक्तस्राव बढ़ सकता है', textEn: 'Even small streaks demand workup this week — the bleed can grow while waiting' },
    // q19
    { questionIndex: 19, text: 'बुखार + रात का पसीना + वजन गिरना = टीबी जांच सबसे पहले (NTEP निःशुल्क) — फेफड़े-रोग विशेषज्ञ (PUL-01) के साथ मिलकर रास्ता तय करेंगे', textEn: 'Fever + night sweats + weight loss = TB testing first (free under NTEP) — we will plan the pathway together with the pulmonologist (PUL-01)' },
    { questionIndex: 19, text: 'टीबी की दवा शुरू हो तो पूरा 6 महीने का कोर्स अनिवार्य — बीच में छोड़ने से दवाएं बेअसर हो जाती हैं (इलाज PUL-01 के साथ)', textEn: 'If TB treatment starts, the full 6-month course is mandatory — stopping midway makes the medicines ineffective (treatment with PUL-01)' },
    // q20
    { questionIndex: 20, text: 'फेफड़े की सर्जरी के बाद सांस की क्षमता धीरे-धीरे लौटती है — रोज़ की चाल और सांस-व्यायाम ही असली दवा है', textEn: 'Breathing capacity returns gradually after lung surgery — daily walking and breathing exercises are the real medicine' },
    { questionIndex: 20, text: 'बचे हुए फेफड़े को धूल-धुएं से बचाएं — रसोई का धुआं और तंबाकू दोनों खांसी बढ़ाते हैं', textEn: 'Protect the remaining lung from dust and smoke — kitchen fumes and tobacco both increase the cough' },
    // q21
    { questionIndex: 21, text: 'स्पाइरोमीटर जागते हर घंटे 10 बार — यही फेफड़े को खोलता है; दर्द के डर से छोड़ देना सबसे आम गलती है', textEn: 'Spirometer 10 times every waking hour — this is what re-opens the lung; quitting out of fear of pain is the commonest mistake' },
    { questionIndex: 21, text: 'खांसते समय तकिया छाती से थामें (स्प्लिंटिंग) — कट का दर्द आधा रह जाता है और खांसी भी अच्छी होती है', textEn: 'Hug a pillow against the chest while coughing (splinting) — the cut pain nearly halves and the cough works better' },
    // q22
    { questionIndex: 22, text: 'बिना सांस-दिक्कत वाली दबी छाती अक्सर कॉस्मेटिक ही रहती है — मुद्रा-सुधार व्यायाम और हल्की छाती-खोलने की कसरत से सुधर जाती है', textEn: 'A sunken chest without breathing trouble usually stays cosmetic — posture exercises and light chest-opening workouts improve it' },
    { questionIndex: 22, text: 'दौड़ने-चढ़ने पर बहुत सांस फूलती हो या छाती दर्द हो तो सांस की जांच (PFT) + दिल की इको कराएं — सर्जरी का फैसला इसी पर होता है', textEn: 'If running/climbing causes heavy breathlessness or chest pain, get PFT + echo done — the surgery decision rests on these' },
    // q23
    { questionIndex: 23, text: 'झुके कंधे + रीढ़ का झुकाव = मुद्रा-सुधार व्यायाम शुरू करें — फिजियोथेरेपी का रेफर लिख देंगे', textEn: 'Stooped shoulders + spinal curvature = start posture-correction exercises — we will write a physiotherapy referral' },
    { questionIndex: 23, text: 'भारी बैग हमेशा दोनों कंधों वाला लटकाएं — एक तरफ का बोझ झुकाव बढ़ाता है; टेबल पर बैठते हुए भी छाती खोलकर बैठें', textEn: 'Always carry heavy bags on both shoulders — single-side loading worsens the tilt; sit chest-open even at the desk' },
    // q24
    { questionIndex: 24, text: '2 हफ्ते से ज्यादा बुखार-पसीना + वजन गिरना = टीबी की जांच (NTEP निःशुल्क) — देर करना फेफड़े को नुकसान पहुंचाता है', textEn: 'Fever/sweats beyond 2 weeks + weight loss = TB workup (free under NTEP) — delay damages the lung' },
    { questionIndex: 24, text: 'घर में खांसने वाले लोगों और बच्चों की भी जांच कराएं — एक कमरे में टीबी का फैलाव तेज़ होता है', textEn: 'Get coughing household members and children screened too — TB spreads fast within one shared room' },
    // q25
    { questionIndex: 25, text: 'बलगम की जांच सुबह का गहरा नमूना दें — दो दिन के दो नमूने ज्यादा पकड़ते हैं (NTEP केंद्र पर निःशुल्क)', textEn: 'Give a deep early-morning sputum sample — two samples on two days catch more (free at the NTEP centre)' },
    { questionIndex: 25, text: 'रिपोर्ट आते ही लाएं — टीबी निकले तो इलाज फेफड़े-रोग विशेषज्ञ (PUL-01) के साथ मिलकर चलेगा, दवा NTEP केंद्र से मुफ्त', textEn: 'Come as soon as the report arrives — if TB is found, treatment runs jointly with the pulmonologist (PUL-01), medicines free from the NTEP centre' },
    // q26
    { questionIndex: 26, text: 'दिल की दवाइयां (इकोस्प्रिन/स्टैटिन/धड़कन की गोली आदि) कार्डियोलॉजिस्ट की हैं — ज्यों की त्यों जारी रखें; बिना पूछे एक खुराक भी न छोड़ें', textEn: 'Heart medicines (aspirin/statin/heart-rate tablet etc.) belong to the cardiologist — continue exactly as prescribed; not one dose to be skipped without asking' },
    { questionIndex: 26, text: 'सभी दवाओं की सूची हर मुलाकात में दिखाएं — दोहरी खुराक और छूटी हुई खुराक दोनों जोखिम हैं', textEn: 'Show the full medicine list at every visit — double-dosing and missed doses are both risks' },
    // q27
    { questionIndex: 27, text: 'चाल हर हफ्ते 5 मिनट बढ़ाएं — होम-रिकवरी कार्ड की सीढ़ी पर चलें; दिन में दो बार चलना एक बार लंबी चाल से बेहतर है', textEn: 'Increase walking by 5 minutes each week — follow the home-recovery card ladder; walking twice a day beats one long walk' },
    { questionIndex: 27, text: 'छाती की हड्डी पर चूड़ी जैसी आवाज़ या हलचल महसूस हो = हड्डी जुड़ नहीं रही — देर न करें; ब्रेस या जांच की जरूरत हो सकती है', textEn: 'A clicking sound or movement over the breastbone = the bone is not uniting — do not delay; bracing or tests may be needed' },
    // q28
    { questionIndex: 28, text: 'फैलती लाली, सूजन या पीला स्राव = घाव में इंफेक्शन की शुरुआत — आज ही दिखाएं; एंटीबायोटिक का फैसला जरूरी होगा', textEn: 'Spreading redness, swelling or yellow discharge = wound infection starting — show it TODAY; an antibiotic decision may be needed' },
    { questionIndex: 28, text: 'मवाद बहे या बदबू आए तो घर पर पट्टी खोलकर देखना मना — क्लिनिक में साफ़ करवाएं; साथ में 100°F से ऊपर बुखार = तुरंत अस्पताल', textEn: 'If pus flows or there is a bad odor, do not open the dressing at home — get it cleaned at the clinic; with fever above 100°F = hospital immediately' },
    // q29
    { questionIndex: 29, text: 'घाव के साथ 100°F+ बुखार या कंपकंपी = इंफेक्शन गहरे तक — उसी दिन अस्पताल; टालना छाती की हड्डी के लिए भारी पड़ता है', textEn: 'Fever above 100°F with the wound, or chills = deep infection — hospital the same day; delay costs the breastbone' },
    { questionIndex: 29, text: 'घाव खुलने जैसा लगे तो उस पर साफ़ कपड़ा रखकर तुरंत आएं — खुला स्टर्नल घाव आपातकाल है, इंतज़ार नहीं', textEn: 'If the wound feels like it is opening, cover it with a clean cloth and come immediately — an open sternal wound is an emergency, no waiting' },
  ],

  // ══ Labels (8) ════════════════════════════════════════════════════════
  labels: [
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'रक्तचाप/नाड़ी (यदि पता हो)', labelEn: 'BP/HR (if known)', unit: 'mmHg' },
    { label: 'चाल-समय (मिनट/दिन)', labelEn: 'Walking Time (min/day)', unit: 'min' },
    { label: 'घाव-स्थिति (0-3)', labelEn: 'Wound Status (0-3)', unit: '', showUnit: false },
    { label: 'भूख (0-5)', labelEn: 'Appetite (0-5)', unit: '', showUnit: false },
    { label: 'नींद में सांस भारी (हां/ना)', labelEn: 'Sleep Breathing Heavy (Y/N)', unit: '', showUnit: false },
    { label: 'INR (यदि पता हो)', labelEn: 'INR (if known)', unit: '', showUnit: false },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
  ],

  // ══ Findings (17: 10 managed + 7 refer/emergency with ZERO links) ═════
  // ACUTE-AORTIC-SYNDROME … PEDIATRIC-CONGENITAL-REFER deliberately have
  // ZERO findingMeds links — no OPD medicine handling for emergencies /
  // referral-only pathways.
  findings: [
    // Managed (links allowed)
    { key: 'CABG-EVALUATION-WORKUP', name: 'बाईपास पूर्व जांच-तैयारी', nameEn: 'CABG Pre-operative Evaluation & Optimization', icd10: 'Z01.8' },
    { key: 'POST-CABG-STABLE', name: 'बाईपास के बाद स्थिर रिकवरी', nameEn: 'Post-CABG Stable Recovery', icd10: 'Z48.8' },
    { key: 'POST-CABG-WOUND-CELLULITIS', name: 'स्टर्नल घाव संक्रमण — जल्दी समीक्षा', nameEn: 'Sternal Wound Infection — Early Review', icd10: 'T81.4' },
    { key: 'POST-VALVE-WARFARIN-CARE', name: 'वाल्व के बाद वारफेरिन देखभाल (निरंतरता-जांच)', nameEn: 'Post-Valve Warfarin Care (Continuation-Verify)', icd10: 'Z79.01' },
    { key: 'POST-VALVE-STABLE', name: 'वाल्व ऑपरेशन के बाद स्थिर', nameEn: 'Post-Valve Surgery Stable', icd10: 'Z48.8' },
    { key: 'PACEMAKER-PRECAUTIONS', name: 'पेसमेकर सावधानियां — निगरानी', nameEn: 'Pacemaker Precautions & Monitoring', icd10: 'Z95.0' },
    { key: 'POST-THORACOTOMY-RECOVERY', name: 'छाती-ऑपरेशन के बाद रिकवरी', nameEn: 'Post-Thoracotomy Recovery', icd10: 'Z48.8' },
    { key: 'PECTUS-DEFORMITY-EVAL', name: 'छाती की हड्डी का दबाव — जांच', nameEn: 'Pectus Deformity Evaluation', icd10: 'Q67.4' },
    { key: 'PLEURAL-EFFUSION-RECURRENT', name: 'परिप्लुर जल-भराव बार-बार (PUL समन्वय)', nameEn: 'Recurrent Pleural Effusion (coordinate PUL)', icd10: 'J90' },
    { key: 'POST-CABG-ARRHYTHIA-PALPITATIONS', name: 'बाईपास के बाद धड़कन गड़बड़ (CAR समन्वय)', nameEn: 'Post-CABG Arrhythmia/Palpitations (coordinate CAR)', icd10: 'R00.2' },
    // Emergency refer-only (ZERO findingMeds links below — by design)
    { key: 'ACUTE-AORTIC-SYNDROME-SUSPECT', name: 'एऑर्टिक फाड़ संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Acute Aortic Syndrome — Emergency (Refer ONLY)', icd10: 'I71.0' },
    { key: 'TAMPONADE-SUSPECT', name: 'दिल पर पानी का दबाव संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Cardiac Tamponade — Emergency (Refer ONLY)', icd10: 'I31.3' },
    { key: 'MASSIVE-HEMOPTYSIS', name: 'भारी खून थूकना — आपातकाल (केवल रेफर)', nameEn: 'Massive Hemoptysis — Emergency (Refer ONLY)', icd10: 'R04.2' },
    { key: 'STROKE-WHILE-ANTICOAGULATED', name: 'खून-पतली दवा पर लकवा — आपातकाल (केवल रेफर)', nameEn: 'Stroke while Anticoagulated — Emergency (Refer ONLY)', icd10: 'I63.9' },
    { key: 'LUNG-MASS-SUSPECT', name: 'फेफड़े में गांठ संदिग्ध — बायोप्सी रास्ता (PUL/ONC समन्वय)', nameEn: 'Suspected Lung Mass — Biopsy Pathway (coordinate PUL/ONC)', icd10: 'R91.1' },
    { key: 'SYMPTOMATIC-SEVERE-AS', name: 'गंभीर लक्षण-वाला एऑर्टिक स्टेनोसिस — शीघ्र सर्जरी रेफर', nameEn: 'Symptomatic Severe Aortic Stenosis — Urgent Surgical Referral', icd10: 'I35.0' },
    { key: 'PEDIATRIC-CONGENITAL-REFER', name: 'बच्चे का जन्मजात दिल-रोग — बाल-हृदय केंद्र रेफर', nameEn: 'Pediatric Congenital Heart Disease — Child-Cardiac Centre Referral', icd10: 'Q24.9' },
  ],

  // ══ Medicines (17) — POST-OP SUPPORTIVE ONLY ══════════════════════════
  // ⚠ ZERO cardiac medicines (Ecosprin/atorvastatin/metoprolol), ZERO
  // warfarin, ZERO anti-TB entries — those appear ONLY as
  // continuation-verify framing in questions/suggestions.
  // NO NSAIDs (cardiac-surgery patient) — paracetamol only.
  // Augmentin = fixed-course wound use only.
  medicines: [
    // Analgesic / antipyretic (NO NSAID policy in this pack)
    { name: 'Crocin 650 Tablet', salt: 'Paracetamol 650 mg (post-op pain/fever — the ONLY pain class in this pack; OTC painkillers/NSAIDs like Combiflam are AVOIDED in cardiac-surgery patients unless the cardiologist advises)', doseOptions: ['1 tab (650 mg) SOS', '1 tab every 8 hrs (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml (children post-op / swallow difficulty)', doseOptions: ['5 ml (250 mg)', '10 ml (500 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },

    // Gastric protection (post-op / pain-medicine cover)
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (preferred PPI when on warfarin)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg (NOTE — with warfarin, Pan 40 is preferred)', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone) SOS', doseOptions: ['10 ml SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Post-op bowel
    { name: 'Cremaffin Syrup 225ml', salt: 'Milk of Magnesia + Liquid Paraffin (post-op constipation — pain medicines + less walking)', doseOptions: ['15 ml at bedtime', '15 ml twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dulcolax 5 Tablet', salt: 'Bisacodyl 5 mg (rescue — only when 3+ days without stool)', doseOptions: ['1-2 tabs at bedtime'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Wound infection (fixed course only)
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — wound infection ONLY as a FIXED 5-7 day course; never repeat/extend without surgical review', doseOptions: ['1 tab twice daily after food (fixed course)'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Betadine Ointment 20g', salt: 'Povidone-Iodine 10% ointment (wound margins as advised; dressings changed at clinic)', doseOptions: ['Apply thin layer after cleaning'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Post-op swelling
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin + Chymotrypsin (post-op chest-wall swelling — EMPTY STOMACH: 1 hr before food)', doseOptions: ['1 tab thrice daily empty stomach'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Cough (plain honey-based — no codeine/dextromethorphan in cardiac patients)
    { name: 'Honitus Syrup 100ml', salt: 'Honey/Tulasi-based herbal cough syrup (dry post-op cough; plain formulation preferred in cardiac patients)', doseOptions: ['10 ml thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Suture-reaction itch
    { name: 'Avil 25 Tablet', salt: 'Pheniramine Maleate 25 mg (suture-reaction itch — SHORT course only; causes drowsiness)', doseOptions: ['1 tab at bedtime (max 3 days)'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Hydration
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Recovery support
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 (nerve/vitamin recovery support)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc (convalescence support)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 (bone-healing support — sternal + leg-graft sites)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Meloset 3 Tablet', salt: 'Melatonin 3 mg (post-op sleep support; non-habit forming)', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (24 — managed findings only) ═════════════
  // CABG-EVALUATION-WORKUP / PACEMAKER-PRECAUTIONS / PECTUS-DEFORMITY-EVAL /
  // PLEURAL-EFFUSION-RECURRENT / POST-CABG-ARRHYTHIA-PALPITATIONS + all 7
  // refer/emergency findings: deliberately ZERO medicine links.
  findingMeds: [
    // POST-CABG-STABLE
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Crocin 650 Tablet', dose: '1 tab (650 mg) SOS', description: 'SOS aches — paracetamol ONLY; NO OTC painkillers/NSAIDs without the cardiologist' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Chymoral Forte Tablet', dose: '1 tab TDS empty stomach', tab: 15, description: '5-7 days — chest-wall/leg-graft swelling' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Cremaffin Syrup 225ml', dose: '15 ml at bedtime', description: 'While pain medicines run + walking is limited' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Dulcolax 5 Tablet', dose: '1-2 tabs at bedtime', tab: 10, description: 'Rescue only — 3+ days without stool despite syrup' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Neurobion Forte Tablet', description: '1 tab OD — nerve/vitamin recovery' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD — bone healing (sternum + graft sites)' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Honitus Syrup 100ml', description: '10 ml TDS — dry cough only; sputum/fever = review' },
    { findingKey: 'POST-CABG-STABLE', medicineName: 'Meloset 3 Tablet', description: '1 tab HS — post-op sleep support' },
    // POST-CABG-WOUND-CELLULITIS
    { findingKey: 'POST-CABG-WOUND-CELLULITIS', medicineName: 'Augmentin 625 Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'FIXED 5-7 day course — never extend/repeat without surgical review' },
    { findingKey: 'POST-CABG-WOUND-CELLULITIS', medicineName: 'Betadine Ointment 20g', description: 'After cleaning as advised; dressing changes at clinic only' },
    { findingKey: 'POST-CABG-WOUND-CELLULITIS', medicineName: 'Avil 25 Tablet', description: '1 tab HS — itch, max 3 days; drowsiness caution' },
    { findingKey: 'POST-CABG-WOUND-CELLULITIS', medicineName: 'Crocin 650 Tablet', description: 'Pain/fever SOS — with fever >100°F, hospital the same day' },
    // POST-VALVE-WARFARIN-CARE (no warfarin entry — continuation-verify only)
    { findingKey: 'POST-VALVE-WARFARIN-CARE', medicineName: 'Crocin 650 Tablet', description: 'The ONLY pain tablet on warfarin — NSAIDs FORBIDDEN (bleeding risk); SOS only' },
    { findingKey: 'POST-VALVE-WARFARIN-CARE', medicineName: 'Pan 40 Tablet', description: 'Pantoprazole preferred over omeprazole when on warfarin' },
    // POST-VALVE-STABLE
    { findingKey: 'POST-VALVE-STABLE', medicineName: 'Neurobion Forte Tablet', description: '1 tab OD — recovery support' },
    { findingKey: 'POST-VALVE-STABLE', medicineName: 'Zincovit Tablet', description: '1 tab OD — convalescence support' },
    { findingKey: 'POST-VALVE-STABLE', medicineName: 'Pan 40 Tablet', description: '1 tab OD before breakfast — gastric comfort' },
    { findingKey: 'POST-VALVE-STABLE', medicineName: 'Digene Gel 200ml', description: '10 ml SOS — breakthrough acidity' },
    // POST-THORACOTOMY-RECOVERY
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Honitus Syrup 100ml', description: '10 ml TDS — dry post-thoracotomy cough' },
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Chymoral Forte Tablet', description: '1 tab TDS empty stomach × 5-7 days — incision swelling' },
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Crocin 650 Tablet', description: 'SOS chest-wall pain — never NSAIDs' },
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Cremaffin Syrup 225ml', description: '15 ml HS — post-op constipation' },
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Neurobion Forte Tablet', description: '1 tab OD — intercostal nerve recovery support' },
    { findingKey: 'POST-THORACOTOMY-RECOVERY', medicineName: 'Zincovit Tablet', description: '1 tab OD — convalescence support' },
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Sternal Precautions Card (CABG/Valve)',
      rows: 4,
      cols: 3,
      headerLabel: ['नियम', 'क्या करें / क्या नहीं', 'कब तक'],
      colsLabel: ['Rule', 'Do / Do NOT', 'Duration'],
      footerLabel: ['खांसते समय छाती को तकिये से थामें (स्प्लिंट) — 6-8 हफ्ते तक भारी वस्तु उठाना/दोनों हाथों से धक्का देना बिल्कुल नहीं / Splint chest with a pillow while coughing — NO lifting or two-hand pushing for 6-8 weeks'],
    },
    {
      name: 'Post-CABG Home Recovery Ladder',
      rows: 4,
      cols: 3,
      headerLabel: ['हफ्ता', 'चाल-समय (मिनट × बार/दिन)', 'नोट'],
      colsLabel: ['Week', 'Walk (min × times/day)', 'Note'],
      footerLabel: ['रोज़ वजन और नमक दोनों नोट करें — 3 दिन में 2 किलो वजन बढ़ना = तुरंत फोन / Record weight and salt daily — 2 kg gain in 3 days = call immediately'],
    },
    {
      name: 'Warfarin-INR Card',
      rows: 4,
      cols: 3,
      headerLabel: ['तारीख', 'INR', 'खुराक (जैसी लिखी है — बिना बदले)'],
      colsLabel: ['Date', 'INR', 'Dose (exactly as prescribed — unchanged)'],
      footerLabel: ['पालक/गोभी/मेथी जैसे हरे पत्तेदार खाने रोज़ लगभग एक जैसी मात्रा रखें (बिल्कुल बंद नहीं) — काला मल/मसूड़ों से खून/गिरने वाली चोट = उसी दिन अस्पताल / Keep green-leafy intake (palak/gobhi/methi) roughly the SAME daily (never zero) — black stool/gum bleeding/any injury = hospital the same day'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Post-CABG Recovery Visit',
      diagnosis: 'POST-CABG-STABLE',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '7 days', instructions: 'SOS aches/fever — NEVER OTC painkillers/NSAIDs; heart medicines (Ecosprin/statin etc.) continue exactly as the cardiologist prescribed' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '7 days', instructions: 'Thrice daily on EMPTY stomach — chest-wall/graft swelling' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml', duration: '7 days', instructions: 'At bedtime — keeps bowels regular (straining stresses the sternum)' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — bone healing' },
      ],
      labs: ['Weight + BP diary (bring daily records)', 'Echo/visit per cardiologist schedule — continuation-verify all cardiac medicines'],
      advice: 'स्टर्नल सावधानियां: 6-8 हफ्ते कोई भारी वस्तु नहीं, दोनों हाथों से धक्का नहीं, खांसते समय तकिया से छाती थामें · चाल हर हफ्ते 5 मिनट बढ़ाएं, दिन में दो बार · 3 दिन में 2 किलो वजन बढ़े या रात में सांस फूले तो तुरंत फोन/अस्पताल · दिल की दवाइयां कार्डियोलॉजिस्ट की हैं — खुद कभी न रोकें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Post-Valve Warfarin Review',
      diagnosis: 'POST-VALVE-WARFARIN-CARE',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '5 days', instructions: 'SOS only — the ONLY safe pain tablet on warfarin; NSAIDs (Combiflam etc.) FORBIDDEN' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '15 days', instructions: 'Before breakfast — pantoprazole preferred over omeprazole with warfarin' },
      ],
      labs: ['INR today (and as per schedule)', 'Hemoglobin if any bleeding episode'],
      advice: 'वारफेरिन ज्यों की त्यों लिखी है वैसी ही — खुद खुराक कभी न बदलें/न छोड़ें · INR की हर तारीख कैलेंडर पर · हरे पत्तेदार (पालक/गोभी/मेथी) रोज़ लगभग एक जैसी मात्रा — एकदम बंद नहीं · काला मल, मसूड़ों से खून, कोला-जैसा पेशाब या सिर पर चोट = उसी दिन अस्पताल · गिरने से बचें, फिसलन वाली चादरें हटाएं',
      followUpDays: 7,
    },
    {
      name: 'Post-Thoracotomy Breathing Care',
      diagnosis: 'POST-THORACOTOMY-RECOVERY',
      medicines: [
        { name: 'Honitus Syrup 100ml', dose: '10 ml', duration: '7 days', instructions: 'Thrice daily — dry cough; sputum/fever/blood = review' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '7 days', instructions: 'Thrice daily empty stomach — incision swelling' },
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '5 days', instructions: 'SOS chest-wall pain — never NSAIDs' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — intercostal nerve support' },
      ],
      labs: ['Chest X-ray if advised at review'],
      advice: 'स्पाइरोमीटर जागते हर घंटे 10 बार — यही फेफड़ा खोलता है · खांसते समय तकिया छाती से थामें · दिन में दो बार चाल, हर हफ्ते 5 मिनट बढ़ाएं · धूल-धुआं/तंबाकू बिल्कुल नहीं · सांस अचानक बिगड़े या तेज़ बुखार आए तो तुरंत अस्पताल',
      followUpDays: 10,
    },
  ],
}
