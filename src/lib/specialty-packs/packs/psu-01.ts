/**
 * PSU-01 — PLASTIC SURGERY STARTER PACK (T3 lite)
 *
 * Clinic-side plastic surgery OPD — burns assessment/dressing, wounds and
 * animal bites, scars, skin lesions, hand trauma TRIAGE, post-op wound
 * care and cosmetic consults.
 *
 * ⚠ SCOPE PHILOSOPHY (deliberate):
 *   Surgical procedures themselves = REFER framing. This pack manages what
 *   a plastic surgery clinic can do with dressing + oral + topical care;
 *   anything needing an operating theatre (grafting, tendon repair,
 *   contracture release, excision under anaesthesia) is a referral /
 *   planned-procedure pathway, never a "home" instruction.
 *   NO advice that could be read as encouraging home surgery or
 *   self-treatment of deep wounds.
 *
 * Emergency rails baked in everywhere:
 *   - Major burns (>10% TBSA, face/hands/genitals, electrical, smoke /
 *     airway) = hospital NOW findings with ZERO findingMeds links.
 *   - Compartment syndrome + tendon/nerve injury = same-day surgical
 *     referral, zero medicine links.
 *   - Category-III rabies exposure = same-day vaccination-centre referral;
 *     anti-rabies ID course (day 0/3/7 + boosters) is a coordination line,
 *     never skipped because "the dog looks fine".
 *   - Wound sepsis (fever + spreading redness) = emergency admission.
 *   - Antibiotic stewardship: fixed courses only, never "continue till you
 *     feel fine"; penicillin-allergy line on Augmentin.
 *   - No OTC painkiller abuse: NSAID short courses with gastro-protection.
 *
 * India-specific: NTEP referral note for chronic wounds with TB suspicion,
 * anti-rabies intra-dermal schedule, Indian brands, Hinglish patient text.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India plastic-surgery
 * OPD core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const PSU01_PACK: SpecialtyPack = {
  meta: {
    code: 'PSU-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Plastic Surgery Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · Indian brands · clinic-side plastic surgery OPD; procedural/surgical = refer framing',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'BUR', name: 'जलन (बर्न्स)', nameEn: 'Burns' },
    { key: 'WOU', name: 'घाव व चोट', nameEn: 'Wounds & Trauma' },
    { key: 'SCA', name: 'दाग, सौंदर्य व जन्मजात', nameEn: 'Scars, Cosmetic & Congenital' },
    { key: 'LES', name: 'त्वचा की गांठें', nameEn: 'Skin Lesions' },
    { key: 'PST', name: 'ऑपरेशन-पश्चात', nameEn: 'Post-Operative' },
  ],

  // ══ Complaints (16) ═══════════════════════════════════════════════════
  complaints: [
    // BUR — Burns
    { code: 'PSU-C01', categoryKey: 'BUR', detail: 'तेज़ चीज़ से जल गया', detailEn: 'Acute Burn' },
    { code: 'PSU-C02', categoryKey: 'BUR', detail: 'गर्म पानी/चाय से जल गया', detailEn: 'Scald (Hot Water/Tea)' },
    { code: 'PSU-C03', categoryKey: 'BUR', detail: 'जले घाव की ड्रेसिंग — फॉलो-अप', detailEn: 'Burn Follow-up Dressing' },
    // WOU — Wounds & trauma
    { code: 'PSU-C04', categoryKey: 'WOU', detail: 'कुत्ते/जानवर ने काट लिया', detailEn: 'Dog or Animal Bite' },
    { code: 'PSU-C05', categoryKey: 'WOU', detail: 'कटा/रगड़ा हुआ ताज़ा घाव', detailEn: 'Fresh Cut or Graze Wound' },
    { code: 'PSU-C06', categoryKey: 'WOU', detail: 'हाथ/उंगली में चोट', detailEn: 'Hand or Finger Injury' },
    { code: 'PSU-C07', categoryKey: 'WOU', detail: 'घाव से मवाद आ रही है', detailEn: 'Wound with Pus Discharge' },
    { code: 'PSU-C08', categoryKey: 'WOU', detail: 'घाव हफ्तों से भर नहीं रहा', detailEn: 'Non-healing Wound' },
    { code: 'PSU-C09', categoryKey: 'WOU', detail: 'शुगर वाले पैर का घाव', detailEn: 'Diabetic Foot Wound' },
    { code: 'PSU-C10', categoryKey: 'WOU', detail: 'लेटे रहने से दबा हुआ घाव', detailEn: 'Pressure Sore' },
    // SCA — Scars, cosmetic & congenital
    { code: 'PSU-C11', categoryKey: 'SCA', detail: 'पुराना दाग/जलने का सिकुड़ाव', detailEn: 'Old Scar / Burn Contracture' },
    { code: 'PSU-C12', categoryKey: 'SCA', detail: 'सौंदर्य ऑपरेशन की सलाह चाहिए', detailEn: 'Cosmetic Surgery Consultation' },
    { code: 'PSU-C13', categoryKey: 'SCA', detail: 'बच्चे की अतिरिक्त उंगली/जन्मजात निशान', detailEn: 'Child Extra Finger / Birth Mark (Refer)' },
    // LES — Skin lesions
    { code: 'PSU-C14', categoryKey: 'LES', detail: 'त्वचा पर गांठ/थैली निकली', detailEn: 'Skin Lump or Cyst' },
    { code: 'PSU-C15', categoryKey: 'LES', detail: 'फोड़े-फुंसी बार-बार होना', detailEn: 'Recurrent Boils / Impetigo' },
    // PST — Post-operative
    { code: 'PSU-C16', categoryKey: 'PST', detail: 'ऑपरेशन के बाद टांकों की देखभाल', detailEn: 'Post-op Suture Care' },
  ],

  // ══ Questions (32 — 2 per complaint; // idx N = true 0-based index) ════
  questions: [
    // idx 0 — PSU-C01
    { complaintCode: 'PSU-C01', question: 'जलना कैसे और कब हुआ — आग, गर्म चीज़, गर्म तेल, या करंट से?', questionEn: 'How and when did it burn — fire, hot object, hot oil, or electric shock?' },
    // idx 1 — PSU-C01
    { complaintCode: 'PSU-C01', question: 'कितनी त्वचा जली लगती है और चेहरा, हाथ, पैर के तलवे या गुप्तांग शामिल है?', questionEn: 'Roughly how much skin is burnt, and are the face, hands, soles or private parts involved?' },
    // idx 2 — PSU-C02
    { complaintCode: 'PSU-C02', question: 'गर्म पानी/चाय कब गिरी और कौन सा अंग जला?', questionEn: 'When did the hot water/tea spill, and which body part got scalded?' },
    // idx 3 — PSU-C02
    { complaintCode: 'PSU-C02', question: 'जली त्वचा पर फफोले हैं या सफेद/चमड़े जैसी दिख रही है?', questionEn: 'Are there blisters on the scalded skin, or does it look white/leathery?' },
    // idx 4 — PSU-C03
    { complaintCode: 'PSU-C03', question: 'आज जलने को कितने दिन हुए और आखिरी ड्रेसिंग कब बदली?', questionEn: 'How many days since the burn, and when was the last dressing change?' },
    // idx 5 — PSU-C03
    { complaintCode: 'PSU-C03', question: 'घाव से पानी/मवाद, बदबू या आसपास की लाली बढ़ी है?', questionEn: 'Any watery discharge/pus, bad smell, or increasing redness around the wound?' },
    // idx 6 — PSU-C04
    { complaintCode: 'PSU-C04', question: 'किस जानवर ने काटा, कब, और वह टीका-लगा पालतू है या अनजान सड़क का?', questionEn: 'Which animal bit you, when, and is it a vaccinated pet or an unknown street animal?' },
    // idx 7 — PSU-C04
    { complaintCode: 'PSU-C04', question: 'टेटनस का टीका कब लगा था और काटने के बाद घाव कितनी देर धोया?', questionEn: 'When was your last tetanus shot, and for how long was the bite washed afterwards?' },
    // idx 8 — PSU-C05
    { complaintCode: 'PSU-C05', question: 'चोट कैसे लगी, घाव कितना लंबा/गहरा है और खून तेज़ था या रुक गया?', questionEn: 'How did the injury happen; how long/deep is the wound, and was the bleeding heavy or easily controlled?' },
    // idx 9 — PSU-C05
    { complaintCode: 'PSU-C05', question: 'घाव में मिट्टी, जंग या जानवर की लार लगी थी?', questionEn: 'Did the wound get contaminated with soil, rust or animal saliva?' },
    // idx 10 — PSU-C06
    { complaintCode: 'PSU-C06', question: 'चोट के बाद उंगलियां मोड़-सीधी कर पाते हैं या किसी उंगली में सुन्नपन है?', questionEn: 'After the injury can you bend/straighten the fingers, or is any finger numb?' },
    // idx 11 — PSU-C06
    { complaintCode: 'PSU-C06', question: 'कट कितनी गहरी थी — नीचे गुब्बारे जैसी चमक दिखती थी या खून फूटता था?', questionEn: 'How deep was the cut — was there a pearly sheen at the base or pulsating bleeding?' },
    // idx 12 — PSU-C07
    { complaintCode: 'PSU-C07', question: 'मवाद कैसी है — पीली/हरी या बदबूदार, और लाली दिन-ब-दिन फैल रही है?', questionEn: 'What does the pus look like — yellow/green or foul-smelling — and is the redness spreading day by day?' },
    // idx 13 — PSU-C07
    { complaintCode: 'PSU-C07', question: 'बुखार, कंपकंपी या तेज़ी से बढ़ता दर्द भी साथ है?', questionEn: 'Is there also fever, chills, or rapidly worsening pain?' },
    // idx 14 — PSU-C08
    { complaintCode: 'PSU-C08', question: 'घाव को कितने हफ्ते/महीने हुए और शुरुआत में क्या था (दाना/छोटा घाव/ऑपरेशन)?', questionEn: 'How many weeks/months old is the wound, and what did it start as (lesion/small wound/surgery)?' },
    // idx 15 — PSU-C08
    { complaintCode: 'PSU-C08', question: 'घाव का किनारा उठा हुआ/मोटा या काला है, या आसानी से खून आता है?', questionEn: 'Is the wound edge raised/heaped or blackened, or does it bleed easily?' },
    // idx 16 — PSU-C09
    { complaintCode: 'PSU-C09', question: 'शुगर कब से है और हाल की HbA1c/खाली पेट शुगर कितनी आई थी?', questionEn: 'Since when do you have diabetes, and what was the recent HbA1c/fasting sugar?' },
    // idx 17 — PSU-C09
    { complaintCode: 'PSU-C09', question: 'पैर में सुन्नपन या कालापन है, और घाव कितना गहरा/गीला दिखता है?', questionEn: 'Is there numbness or blackening of the foot, and how deep/wet does the wound look?' },
    // idx 18 — PSU-C10
    { complaintCode: 'PSU-C10', question: 'लेटे रहने से कौन सा अंग दबा है और घाव को कितने दिन हुए?', questionEn: 'Which body part is pressure-affected, and how old is the sore?' },
    // idx 19 — PSU-C10
    { complaintCode: 'PSU-C10', question: 'रोज़ हर 2 घंटे पलटाई/मुलायम या एयर-मैट्रेस की व्यवस्था है, और घाव काला दिखता है?', questionEn: 'Is there 2-hourly turning/soft or air mattress arrangement, and does the sore look black?' },
    // idx 20 — PSU-C11
    { complaintCode: 'PSU-C11', question: 'दाग/सिकुड़ाव को कितना समय हुआ और वह उभरा हुआ/खुजली वाला है?', questionEn: 'How old is the scar/contracture, and is it raised or itchy?' },
    // idx 21 — PSU-C11
    { complaintCode: 'PSU-C11', question: 'सिकुड़ाव के पास का जोड़ (कोहनी/गर्दन/उंगली) पूरा खुलता-मुड़ता है?', questionEn: 'Does the joint near the contracture (elbow/neck/finger) open and bend fully?' },
    // idx 22 — PSU-C12
    { complaintCode: 'PSU-C12', question: 'क्या बदलवाना चाहते हैं और इसके पीछे सबसे बड़ी वजह/उम्मीद क्या है?', questionEn: 'What would you like changed, and the biggest reason/expectation behind it?' },
    // idx 23 — PSU-C12
    { complaintCode: 'PSU-C12', question: 'धूम्रपान/गुटका लेते हैं, और ठीक होने के समय-खर्च के बारे में जानते हैं?', questionEn: 'Do you smoke/use tobacco, and are you aware of the healing time and cost involved?' },
    // idx 24 — PSU-C13
    { complaintCode: 'PSU-C13', question: 'बच्चे की उम्र क्या है और जन्म से क्या है — अतिरिक्त उंगली, निशान या खोल?', questionEn: "What is the child's age, and what has been there since birth — extra finger, birth mark or cleft?" },
    // idx 25 — PSU-C13
    { complaintCode: 'PSU-C13', question: 'निशान/अतिरिक्त उंगली का रंग-आकार बदल रहा है, या दूध पिलाने/सांस में दिक्कत है?', questionEn: 'Is the mark/extra digit changing colour-size, or is there feeding/breathing difficulty?' },
    // idx 26 — PSU-C14
    { complaintCode: 'PSU-C14', question: 'गांठ कब से है, शरीर के किस हिस्से में है, और बढ़ रही है या दर्द देती है?', questionEn: 'Since when is the lump there, on which body part, and is it growing or painful?' },
    // idx 27 — PSU-C14
    { complaintCode: 'PSU-C14', question: 'गांठ दबाने पर घटती-बढ़ती है या उस पर छोटा काला छेद (सीबेसियस पंक्चरम) जैसा कुछ है?', questionEn: 'Does the lump shrink/expand on pressure, or does it have a small dark punctum-like point?' },
    // idx 28 — PSU-C15
    { complaintCode: 'PSU-C15', question: 'फोड़े-फुंसी कब-कब आते हैं और कितनी जगहों पर होते हैं?', questionEn: 'Since when and at how many body sites do the boils/pustules keep coming?' },
    // idx 29 — PSU-C15
    { complaintCode: 'PSU-C15', question: 'रोज़ नहाने-सफाई का नियम कैसा है, नाखून छोटे रखते हैं, और शुगर की जांच हुई है?', questionEn: 'What is the daily bathing/hygiene routine, do you keep nails trimmed, and has blood sugar been tested?' },
    // idx 30 — PSU-C16
    { complaintCode: 'PSU-C16', question: 'ऑपरेशन कब हुआ, टांके लगे हैं या हट गए, और घाव कैसा दिख रहा है?', questionEn: 'When was the surgery, are the sutures still in or removed, and how does the wound look?' },
    // idx 31 — PSU-C16
    { complaintCode: 'PSU-C16', question: 'घाव से पानी/मवाद, बढ़ती लाली या बुखार के संकेत हैं?', questionEn: 'Are there signs of fluid/pus discharge, spreading redness or fever?' },
  ],

  // ══ Suggestions (64 — exactly 2 per question, questionIndex 0-31) ═══
  suggestions: [
    // q0
    { questionIndex: 0, text: 'जलने की घटना का समय जानना जरूरी है — देर हुई हो तो आज ही देखभाल शुरू करें', textEn: 'Knowing the time of the burn matters — if care has been delayed, start today itself' },
    { questionIndex: 0, text: 'करंट से जलना अंदर तक गहरा हो सकता है — ऐसा हो तो बिना देर अस्पताल जाएं', textEn: 'Electrical burns can be deeper inside than they look — if so, go to hospital without delay' },
    // q1
    { questionIndex: 1, text: 'जले क्षेत्र का अंदाज़ा हाथ की हथेली से लगाते हैं — मरीज़ की एक हथेली ≈ शरीर का 1%', textEn: 'Burnt area is estimated by palm size — one palm of the patient ≈ 1% of the body' },
    { questionIndex: 1, text: 'चेहरा, हाथ, पैर के तलवे या गुप्तांग जला हो तो घर पर इलाज ठीक नहीं — अस्पताल जाएं', textEn: 'If face, hands, soles or private parts are burnt, home treatment is not right — go to hospital' },
    // q2
    { questionIndex: 2, text: 'ताज़ा उबलते पानी/चाय पर 15-20 मिनट धीरे-धीरे ठंडा पानी बहाना सबसे अच्छी पहली मदद है', textEn: 'For a fresh hot-water/tea scald, gently running cool water for 15-20 minutes is the best first aid' },
    { questionIndex: 2, text: 'बर्फ़ सीधे मत लगाएं और दांत-पेस्ट/हल्दी/तेल जैसे घरेलू लेप बिल्कुल नहीं — त्वचा और खराब होती है', textEn: 'Do not apply ice directly, and no home pastes like toothpaste/turmeric/oil — they worsen the skin' },
    // q3
    { questionIndex: 3, text: 'फफोले खुद न फोड़ें — वे त्वचा का प्राकृतिक पट्टा (ड्रेसिंग) हैं', textEn: 'Do not burst blisters yourself — they are the skin’s natural dressing' },
    { questionIndex: 3, text: 'सफेद/चमड़े जैसी या बेदर्द त्वचा गहरे जलन का संकेत है — डॉक्टर को तुरंत दिखाएं', textEn: 'White/leathery or painless skin points to a deep burn — show it to a doctor immediately' },
    // q4
    { questionIndex: 4, text: 'जले घाव की ड्रेसिंग रोज़ या हर-दूसरे दिन साफ हाथों से बदलनी चाहिए', textEn: 'A burn dressing should be changed daily or on alternate days with clean hands' },
    { questionIndex: 4, text: 'ड्रेसिंग चिपक जाए तो जबरदस्ती न खींचें — नमक-पानी में भिगोकर हल्के से हटाएं', textEn: 'If the dressing sticks, do not pull it — soak it off gently with saline' },
    // q5
    { questionIndex: 5, text: 'बढ़ती लाली, बदबू या मवाद जले घाव में इन्फेक्शन के संकेत हैं — अगली मुलाकात न टालें', textEn: 'Increasing redness, bad smell or pus in a burn are infection signs — do not postpone the next visit' },
    { questionIndex: 5, text: 'जलने के बाद बुखार आए तो देर न करें — तुरंत संपर्क करें', textEn: 'If fever follows a burn, do not delay — contact immediately' },
    // q6
    { questionIndex: 6, text: 'काटने के तुरंत बाद 15 मिनट साबुन-पानी से घाव धोना रेबीज़ से बचाव की पहली दीवार है', textEn: 'Washing the bite with soap and water for 15 minutes right away is the first wall of defence against rabies' },
    { questionIndex: 6, text: 'अनजान/सड़क के जानवर का काट हो तो उसी दिन टीका केंद्र जाएं — जानवर "ठीक दिखने" पर भी कोर्स जरूरी', textEn: 'If an unknown/street animal bit you, go to a vaccination centre the same day — the course is needed even if the animal looks fine' },
    // q7
    { questionIndex: 7, text: 'टेटनस का टीका 5 साल से ज्यादा पुराना हो तो आज ही लगवा लें', textEn: 'If your last tetanus shot is older than 5 years, get a booster today' },
    { questionIndex: 7, text: 'गहरे काट के घाव को खुद बंद/सिलवाने की नहीं — साफ करके डॉक्टर की देखरेख में रखना ठीक है', textEn: 'Deep bite wounds should not be closed at home — clean them and keep them under doctor’s care' },
    // q8
    { questionIndex: 8, text: 'गहरा/मांस दिखने वाला घाव घर पर भरता नहीं — टांके/पट्टी के लिए आज ही करवाएं', textEn: 'A deep wound showing raw flesh will not heal at home — get suturing/dressing done today' },
    { questionIndex: 8, text: 'तेज़ धार से लगी कट ऊपर से छोटी और अंदर गहरी होती है — हल्के में न लें', textEn: 'Cuts from sharp edges can look small outside but run deep — do not take them lightly' },
    // q9
    { questionIndex: 9, text: 'मिट्टी/जंग लगा घाव टेटनस का खतरा रखता है — टीका और सफाई दोनों जरूरी हैं', textEn: 'A wound contaminated with soil/rust carries tetanus risk — both vaccination and cleaning are needed' },
    { questionIndex: 9, text: 'गंदा पानी/लार लगा हो तो डॉक्टर को जरूर बताएं — ढंग से धुलाई (इरिगेशन) करानी होती है', textEn: 'If dirty water/saliva soiled it, definitely tell the doctor — proper irrigation is needed' },
    // q10
    { questionIndex: 10, text: 'उंगली का न मुड़ पाना या सुन्नपन नस/टेंडन की चोट का संकेत हो सकता है — ढंग की जांच जरूरी', textEn: 'Inability to bend a finger or numbness may signal a nerve/tendon injury — proper examination is needed' },
    { questionIndex: 10, text: 'सुन्न उंगली से गर्म बर्तन/चाय पकड़ने से बचें — जलने का खतरा रहता है', textEn: 'Avoid holding hot utensils/tea with a numb finger — there is a fresh burn risk' },
    // q11
    { questionIndex: 11, text: 'घाव में गुब्बारे जैसी चमक या फूटता खून नाड़ी/टेंडन की चोट का संकेत है — उसी दिन हाथ-विशेषज्ञ से दिखाएं', textEn: 'A pearly sheen in the wound or pulsatile bleeding suggests artery/tendon injury — see a hand specialist the same day' },
    { questionIndex: 11, text: 'हाथ की गहरी कट में 6-8 घंटे का सुनहरा समय होता है — देर से टांका/मरम्मत नहीं बैठती', textEn: 'Deep hand cuts have a 6-8 hour golden window — with delay, repair may no longer be possible' },
    // q12
    { questionIndex: 12, text: 'घाव से बाहर फैलती लाली को किनारे से पेन से नापते रहें — बढ़ना = अगले दिन डॉक्टर, नहीं उससे ज्यादा देर', textEn: 'Keep measuring spreading redness from the wound edge with a pen — spreading = doctor tomorrow, not later' },
    { questionIndex: 12, text: 'हरी/बदबूदार मवाद गहरे इन्फेक्शन का संकेत है — खुद निचोड़ने/सिकाई से मत बैठें', textEn: 'Green foul-smelling pus suggests deep infection — do not rely on self-draining or fomentation' },
    // q13
    { questionIndex: 13, text: 'बुखार-कंपकंपी के साथ घाव का तेज़ दर्द फैलते इन्फेक्शन का बड़ा संकेत है — तुरंत जांच कराएं', textEn: 'Worsening wound pain with fever and chills is a major sign of spreading infection — get examined immediately' },
    { questionIndex: 13, text: 'ऐसी हालत में सिर्फ गोली से ठीक होने का सोचना जोखिम है — घाव की देखभाल भी उसी दिन बदलनी पड़ती है', textEn: 'Expecting pills alone to fix this is risky — the wound care also needs to change the same day' },
    // q14
    { questionIndex: 14, text: '3-4 हफ्ते में न भरने वाला घाव जांच मांगता है — समय बर्बाद न करें', textEn: 'A wound not healing in 3-4 weeks demands investigation — do not waste time' },
    { questionIndex: 14, text: 'घाव की शुरुआत कैसी थी यह बताना जरूरी है — पुरानी तस्वीर/पर्ची हो तो दिखाएं', textEn: 'How the wound began matters — show old photos/prescriptions if you have them' },
    // q15
    { questionIndex: 15, text: 'घाव का उठा/मोटा किनारा या कालापन हल्के में न लें — बायोप्सी से पक्का करवाना ठीक है', textEn: 'A raised/heaped edge or blackening of the wound must not be ignored — confirming with biopsy is right' },
    { questionIndex: 15, text: 'घाव से आसानी से खून आता हो तो जल्दी बताएं — इसे टालना सही नहीं', textEn: 'If the wound bleeds easily, report early — neglecting it is not right' },
    // q16
    { questionIndex: 16, text: 'शुगर का नियंत्रण घाव भरने की नींव है — HbA1c की रिपोर्ट जानकर आएं (DIA समन्वय)', textEn: 'Sugar control is the foundation of wound healing — come knowing your HbA1c (coordinate with diabetes care)' },
    { questionIndex: 16, text: 'शुगर की दवा/डाइट वाले डॉक्टर से लक्ष्य मिलकर तय करें — घाव की ड्रेसिंग और शुगर दोनों साथ चलेंगे', textEn: 'Set targets together with the doctor managing your diabetes — dressing and sugar control must run together' },
    // q17
    { questionIndex: 17, text: 'पैर का कालापन या गहराई तेज़ी से बदल रही हो तो देर जोखिम भरी है — उसी हफ्ते विशेषज्ञ', textEn: 'If foot blackening or wound depth is changing fast, delay is dangerous — specialist within the same week' },
    { questionIndex: 17, text: 'रोज़ पैर धोकर-सूखकर देखने की आदत बनाएं — दर्द न होने पर भी नजर रखें', textEn: 'Make daily washing-inspecting the foot a habit — check even when there is no pain' },
    // q18
    { questionIndex: 18, text: 'दबे घाव का पहला इलाज दबाव हटाना है — हर 2 घंटे पलटाई जरूरी है', textEn: 'The first treatment of a pressure sore is removing the pressure — turning every 2 hours is essential' },
    { questionIndex: 18, text: 'एड़ी/पूंछ/कूल्हे की हड्डी के नीचे मुलायम गद्दा या एयर-मैट्रेस लगवाएं', textEn: 'Place soft padding or an air mattress under the heels/tailbone/hip bones' },
    // q19
    { questionIndex: 19, text: 'काला दिखता घाव गहरे नुकसान का संकेत है — खुद की मरहम-पट्टी से ठीक होने का इंतजार न करें', textEn: 'A black-looking sore signals deep damage — do not wait for it to heal with self-applied ointments' },
    { questionIndex: 19, text: 'पलटाई की डायरी रखें — रात में भी 2-2 घंटे का नियम रहे', textEn: 'Keep a turning diary — maintain the 2-hourly rule at night too' },
    // q20
    { questionIndex: 20, text: 'दाग पकने में 6-12 महीने लगते हैं — पहले साल धूप से बचाना और मॉइस्चराइज़र जरूरी है', textEn: 'Scars mature over 6-12 months — sun protection and moisturiser in the first year are essential' },
    { questionIndex: 20, text: 'खुजली वाला उभरा दाग अक्सर रुक जाता है — खुजलाने से मोटाई बढ़ती है', textEn: 'A raised itchy scar often settles on its own — scratching increases the thickness' },
    // q21
    { questionIndex: 21, text: 'सिकुड़ाव से अंग का पूरा न खुलना व्यायाम से रोका जा सकता है — देर करने पर ऑपरेशन का रास्ता बनता है', textEn: 'Joint limitation from contracture can be checked with exercises — delay builds the road to surgery' },
    { questionIndex: 21, text: 'जलने के बाद गर्दन/कोहनी/हाथ की रोज़ स्ट्रेचिंग करें — बताए गए तरीके से ही', textEn: 'Do daily stretching of neck/elbow/hand after burns — exactly as taught' },
    // q22
    { questionIndex: 22, text: 'उम्मीद साफ़ रखें — ऑपरेशन "सुधार" देता है, "नया चेहरा" नहीं', textEn: 'Keep expectations clear — surgery gives "improvement", not "a new face"' },
    { questionIndex: 22, text: 'जो बात चुप-चाप परेशान कर रही है उसे खुलकर बताएं — योजना उसी हिसाब से बनती है', textEn: 'Share openly what quietly bothers you — the plan is shaped around that' },
    // q23
    { questionIndex: 23, text: 'धूम्रपान/गुटका घाव भरने को धीमा कर देता है — ऑपरेशन से 2-4 हफ्ते पहले बंद करना जरूरी है', textEn: 'Smoking/gutka slows healing — stopping 2-4 weeks before surgery is essential' },
    { questionIndex: 23, text: 'खर्च और छुट्टी (रिकवरी) दोनों का हिसाब पहले पूछ लें — बाद में दबाव न आए', textEn: 'Ask about cost and recovery leave upfront — so there is no pressure later' },
    // q24
    { questionIndex: 24, text: 'अतिरिक्त उंगली हटवाना छोटा ऑपरेशन है — बच्चे की उम्र और बेहोशी (एनेस्थीसिया) की फिटनेस पर समय तय होता है', textEn: 'Removing an extra digit is a small procedure — timing depends on the child’s age and anaesthesia fitness' },
    { questionIndex: 24, text: 'जन्मजात निशान बढ़ते दिखें, खून दें या छूने पर दर्द हो तो देर न करें', textEn: 'If a birth mark grows, bleeds or hurts on touch, do not delay' },
    // q25
    { questionIndex: 25, text: 'चेहरे के बड़े जन्म-निशान की सलाह जल्दी लें — उम्र के साथ इलाज के विकल्प बदल जाते हैं', textEn: 'Seek advice early for large facial birth marks — treatment options change with age' },
    { questionIndex: 25, text: 'खिलाने/सांस में दिक्कत जन्मजात हो तो वह प्राथमिकता बन जाती है — तुरंत विशेषज्ञ', textEn: 'If feeding/breathing difficulty is present from birth, it becomes a priority — specialist right away' },
    // q26
    { questionIndex: 26, text: 'नरम घूमती गांठ (लिपोमा जैसी) प्रायः बिना बुराई की होती है — बढ़े या दर्द करे तो जांच ठीक है', textEn: 'A soft mobile lump (lipoma-like) is usually benign — checking is right if it grows or hurts' },
    { questionIndex: 26, text: 'गांठ अचानक लाल-दर्दी हो जाए तो गर्म सिकाई से राहत मिल सकती है — दबाकर निकालने की कोशिश न करें', textEn: 'If the lump suddenly turns red-painful, warm compresses may help — do not try to squeeze it out' },
    // q27
    { questionIndex: 27, text: 'दबाने पर घटती-बढ़ती थैली जैसी गांठ सिस्ट हो सकती है — पूरा निकालना ही वापसी रोकता है', textEn: 'A sac-like lump that shrinks/expands on pressure may be a cyst — only complete removal prevents recurrence' },
    { questionIndex: 27, text: 'सिस्ट खुद फूट जाए तो साफ कपड़े से दबाएं और उसी दिन दिखाएं — इन्फेक्शन का खतरा रहता है', textEn: 'If a cyst ruptures, press with a clean cloth and show the same day — infection risk remains' },
    // q28
    { questionIndex: 28, text: 'बार-बार फुंसी वालों में नाक के अंदर के कीटाणु अक्सर जिम्मेदार होते हैं — इलाज में वह जगह भी जुड़ती है', textEn: 'In recurrent boils, germs inside the nose are often responsible — treatment covers that site too' },
    { questionIndex: 28, text: 'फुंसी को सेक कर दबाना/निचोड़ना फैलाव बढ़ाता है — दाना अपने आप निकलने दें या डॉक्टर से करवाएं', textEn: 'Squeezing a fomented boil spreads infection — let it drain by itself or get it done by the doctor' },
    // q29
    { questionIndex: 29, text: 'रोज़ नहाना, साफ कपड़े और छोटे-साफ नाखून फुंसियों की वापसी घटाते हैं', textEn: 'Daily bathing, clean clothes and trimmed clean nails reduce recurrence of boils' },
    { questionIndex: 29, text: 'बार-बार फुंसियों पर शुगर की जांच एक बार जरूर करा लें', textEn: 'With recurrent boils, get your blood sugar tested at least once' },
    // q30
    { questionIndex: 30, text: 'टांके प्रायः 7-14 दिन में हटते हैं — चेहरे पर जल्दी, पैर पर देर से', textEn: 'Sutures usually come out in 7-14 days — earlier on the face, later on the legs' },
    { questionIndex: 30, text: 'टांकों पर खुजली आम है — खुजलाने/पट्टी खींचने से निशान बिगड़ता है', textEn: 'Itching over sutures is common — scratching or pulling the dressing spoils the scar' },
    // q31
    { questionIndex: 31, text: 'घाव से पानी/मवाद या लाली बढ़े तो अगली मुलाकात न टालें — उसी दिन बताएं', textEn: 'If the wound leaks fluid/pus or redness increases, do not postpone the next visit — report the same day' },
    { questionIndex: 31, text: 'ऑपरेशन के बाद बुखार को आम न मानें — जांच जरूरी है', textEn: 'Do not take post-op fever lightly — examination is needed' },
  ],

  // ══ Labels (8) — burn/wound vitals ═══════════════════════════════════
  labels: [
    { label: 'जला क्षेत्र (TBSA %)', labelEn: 'Burn Area (TBSA %)', unit: '%' },
    { label: 'घाव का आकार', labelEn: 'Wound Size', unit: 'cm' },
    { label: 'घटना को हुए दिन', labelEn: 'Days Since Injury', unit: 'days' },
    { label: 'टेटनस टीका (स्थिति)', labelEn: 'Tetanus Vaccine Status', unit: '', showUnit: false },
    { label: 'दर्द अंक (0-10)', labelEn: 'Pain Score (0-10)', unit: '', showUnit: false },
    { label: 'बुखार (हाँ/नहीं)', labelEn: 'Fever (Y/N)', unit: '', showUnit: false },
    { label: 'HbA1c (रिपोर्ट हो तो)', labelEn: 'HbA1c (if known)', unit: '%' },
    { label: 'उम्र', labelEn: 'Age', unit: 'yrs' },
  ],

  // ══ Findings (19: 13 managed + 6 refer-only) ══════════════════════════
  // Refer-only findings (BURN-MAJOR-REFER … SEPSIS-WOUND-EMERGENCY)
  // deliberately have ZERO findingMeds links — emergencies are not
  // managed with OPD medicine bundles.
  findings: [
    // Managed (links allowed)
    { key: 'BURN-MINOR-SUPERFICIAL', name: 'जलन — मामूली उथली (OPD प्रबंधन)', nameEn: 'Minor Superficial Burn (OPD Managed)', icd10: 'T30.0' },
    { key: 'SCALD-CHILD-MINOR', name: 'बच्चे का उबलता-पानी जलन — मामूली', nameEn: 'Minor Scald in Child', icd10: 'T30.0' },
    { key: 'DOG-BITE-PROPHYLAXIS', name: 'पशु-काट — रेबीज़ टीका कोर्स समन्वय', nameEn: 'Animal Bite — Rabies Prophylaxis (Coordinated)', icd10: 'Z24.2' },
    { key: 'LACERATION-CLEAN', name: 'साफ़ कटा घाव (टांका/ड्रेसिंग)', nameEn: 'Clean Laceration (Suture/Dressing)', icd10: 'T14.1' },
    { key: 'ABRASION', name: 'रगड़/खरोंच (उथला घाव)', nameEn: 'Abrasion (Grazed Wound)', icd10: 'T14.0' },
    { key: 'MINOR-PUSTULE-IMPETIGO', name: 'फुंसियां/इम्पेटिगो (मामूली)', nameEn: 'Minor Pustular Lesions (Impetigo)', icd10: 'L01.0' },
    { key: 'HYPERTROPHIC-SCAR', name: 'मोटा उभरा दाग (हाइपरट्रॉफिक)', nameEn: 'Hypertrophic Scar', icd10: 'L91.0' },
    { key: 'KELOID-TENDENCY', name: 'केलॉइड प्रवृत्ति का दाग', nameEn: 'Keloidal Tendency', icd10: 'L91.0' },
    { key: 'EPIDERMAL-CYST', name: 'त्वचा-थैली (एपिडर्मॉइड सिस्ट)', nameEn: 'Epidermal Cyst', icd10: 'L72.0' },
    { key: 'LIPOMA', name: 'वसा-गांठ (लिपोमा)', nameEn: 'Lipoma', icd10: 'D17.9' },
    { key: 'PRESSURE-SORE-EARLY', name: 'दबाव-घाव — शुरुआती (चरण 1-2)', nameEn: 'Pressure Sore — Early (Stage 1-2)', icd10: 'L89.0' },
    { key: 'POSTOP-WOUND-STABLE', name: 'ऑपरेशन-पश्चात घाव स्थिर', nameEn: 'Post-op Wound — Stable', icd10: 'Z48.3' },
    { key: 'POSTOP-WOUND-INFECTED', name: 'ऑपरेशन-पश्चात घाव संक्रमित', nameEn: 'Post-op Wound — Infected', icd10: 'T81.4' },
    // Refer-only (ZERO findingMeds links below — by design)
    { key: 'BURN-MAJOR-REFER', name: 'गंभीर जलन — अस्पताल रेफर (>10% TBSA / चेहरा / हाथ / गुप्तांग / करंट / धुएं-सांस)', nameEn: 'Major Burn — Hospital Referral (>10% TBSA / face / hands / genital / electrical / airway) (Refer ONLY)', icd10: 'T31.1' },
    { key: 'COMPARTMENT-SYNDROME-REFER', name: 'कम्पार्टमेंट सिंड्रोम संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Compartment Syndrome — Emergency (Refer ONLY)', icd10: 'T79.A2' },
    { key: 'TENDON-NERVE-INJURY-REFER', name: 'नस/टेंडन की चोट संदिग्ध — हाथ-विशेषज्ञ उसी दिन (केवल रेफर)', nameEn: 'Suspected Tendon/Nerve Injury — Hand Surgeon Same-day (Refer ONLY)', icd10: 'T14.6' },
    { key: 'RABIES-EXPOSURE-SEVERE', name: 'रेबीज़ जोखिम गंभीर (वर्ग-III) — तुरंत टीका-केंद्र (केवल रेफर)', nameEn: 'Severe (Category-III) Rabies Exposure — Immediate Vaccination Centre (Refer ONLY)', icd10: 'W54' },
    { key: 'NON-HEALING-SUSPECT-MALIGNANCY', name: 'भरता न दिखने वाला घाव — मैलिग्नेंसी संदिग्ध — बायोप्सी रेफर (केवल रेफर)', nameEn: 'Non-healing Wound — Malignancy Suspect — Biopsy Referral (Refer ONLY)', icd10: 'L98.4' },
    { key: 'SEPSIS-WOUND-EMERGENCY', name: 'घाव-संक्रमण से सेप्सिस संदिग्ध — आपातकाल भर्ती (केवल रेफर)', nameEn: 'Wound Sepsis Suspect — Emergency Admission (Refer ONLY)', icd10: 'A41.9' },
  ],

  // ══ Medicines (20) — Indian brands, oral + topical OPD core ═══════════
  // ⚠ Surgical/parenteral agents excluded — theatre territory.
  // Antibiotics: fixed-course stewardship framing; penicillin-allergy line
  // on Augmentin. NSAIDs: short course + gastro-protection.
  // verified: false until MBBS review.
  medicines: [
    // Analgesia (no-OTC-abuse framing)
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg (wound/burn pain — SOS to regular as advised; max 3 g/day)', doseOptions: ['1 tab (500 mg)', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg (burn pain — regular by-the-clock works better than SOS)', doseOptions: ['1 tab (650 mg) every 8 hrs'], morning: 1, afternoon: 1, evening: 1, tab: 21, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg (SHORT COURSE ≤3-5 days only, after food, with Pan 40; not for burns with large raw area or kidney patients)', doseOptions: ['1 tab after food'], morning: 0, afternoon: 0, evening: 1, tab: 9, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg (SOS only for severe pain; regular use/escalation = specialist referral)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Anti-inflammatory enzyme (swelling)
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin-Chymotrypsin enzyme (reduces swelling/bruising — empty stomach, swallow whole)', doseOptions: ['1 tab empty stomach 3 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 20, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Antibiotics — wound cover (fixed-course stewardship)
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg (⚠ penicillin allergy: rash/swelling/breathlessness = stop + report; complete the fixed course)', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 12, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg (option when penicillin allergy; fixed course only)', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Metrogyl 400 Tablet', salt: 'Metronidazole 400 mg (anaerobic cover — bite/deep infected wounds; no alcohol during course)', doseOptions: ['1 tab 3 times/day after food'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Topicals — burn/wound care
    { name: 'Silverex Cream 25g', salt: 'Silver Sulfadiazine 1% w/w (burn dressing cream — apply with clean/spatula technique at dressing change)', doseOptions: ['Thin layer at dressing change (daily)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Ointment 20g', salt: 'Povidone Iodine 10% ointment (antiseptic for wound edges/sutures)', doseOptions: ['Apply on cleaned wound at dressing'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'T-Bact 2% Ointment 5g', salt: 'Mupirocin 2% ointment (small infected spots/suture-line impetigo; also nasal use when advised)', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin Sulphate 1% cream (grazed/abrasion cover)', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Lox 2% Jelly 30g', salt: 'Lidocaine (Lignocaine) 2% jelly (numbing before painful dressing — apply 15-20 min prior, wipe off, then dress)', doseOptions: ['Apply 15-20 min before dressing'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Scar care
    { name: 'Contractubex Gel 20g', salt: 'Heparinoid + Allantoin + Cepae extract gel (scar massage — realistic 3-6 months of daily use; starts once wound is closed)', doseOptions: ['Massage small amount twice daily × 3-6 months'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Thrombophob Gel 20g', salt: 'Heparinoid topical gel (bruise/swelling over INTACT skin only — never on open wounds)', doseOptions: ['Apply 2-3 times/day on bruise (unbroken skin)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Supportive
    { name: 'Avil 25 Tablet', salt: 'Pheniramine Maleate 25 mg (healing-wound itch; drowsy — no driving; HS dose preferred)', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (gastric protection whenever Combiflam/NSAID course runs)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vomikind MD 4 Tablet', salt: 'Ondansetron 4 mg mouth-dissolving (pain-killer nausea; dissolves on tongue)', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose (dehydration after burns/fever)', doseOptions: ['1 sachet in 1 L water — sip over the day'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc (wound-healing support)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (28 — refer-only findings ZERO links) ════
  findingMeds: [
    // BURN-MINOR-SUPERFICIAL
    { findingKey: 'BURN-MINOR-SUPERFICIAL', medicineName: 'Silverex Cream 25g', description: 'Thin layer at every dressing change — daily dressing' },
    { findingKey: 'BURN-MINOR-SUPERFICIAL', medicineName: 'Dolo 650 Tablet', dose: '1 tab (650 mg) every 8 hrs', morning: 1, afternoon: 1, evening: 1, tab: 21, description: 'Regular by-the-clock for 2-3 days — not SOS' },
    { findingKey: 'BURN-MINOR-SUPERFICIAL', medicineName: 'Chymoral Forte Tablet', description: 'Swelling control while wound settles' },
    { findingKey: 'BURN-MINOR-SUPERFICIAL', medicineName: 'Avil 25 Tablet', description: 'Healing-phase itch at bedtime — drowsy, no driving' },
    // SCALD-CHILD-MINOR
    { findingKey: 'SCALD-CHILD-MINOR', medicineName: 'Silverex Cream 25g', description: 'Daily dressing after gentle cleaning' },
    { findingKey: 'SCALD-CHILD-MINOR', medicineName: 'Dolo 650 Tablet', description: 'Pain relief — child dosing is weight-based, confirm with doctor' },
    // DOG-BITE-PROPHYLAXIS
    { findingKey: 'DOG-BITE-PROPHYLAXIS', medicineName: 'Augmentin 625 Tablet', description: 'Bite-infection cover — FIXED COURSE; rabies vaccine course (ID: day 0/3/7 + 28 if schedule) at centre, never skipped' },
    { findingKey: 'DOG-BITE-PROPHYLAXIS', medicineName: 'Taxim-O 200 Tablet', description: 'If penicillin allergy — fixed course only' },
    // LACERATION-CLEAN
    { findingKey: 'LACERATION-CLEAN', medicineName: 'Betadine Ointment 20g', description: 'Antiseptic at dressing change' },
    { findingKey: 'LACERATION-CLEAN', medicineName: 'T-Bact 2% Ointment 5g', description: 'If suture line shows infected spots' },
    { findingKey: 'LACERATION-CLEAN', medicineName: 'Crocin 500 Tablet', description: 'Wound pain — SOS; avoid long NSAID courses' },
    // ABRASION
    { findingKey: 'ABRASION', medicineName: 'Betadine Ointment 20g', description: 'Clean then apply — keep graze covered' },
    { findingKey: 'ABRASION', medicineName: 'Soframycin Cream 30g', description: 'Alternate cover for grazed areas' },
    // MINOR-PUSTULE-IMPETIGO
    { findingKey: 'MINOR-PUSTULE-IMPETIGO', medicineName: 'T-Bact 2% Ointment 5g', description: '3 times/day × 5 days on spots + nostrils if advised — hygiene + nail care alongside' },
    // HYPERTROPHIC-SCAR
    { findingKey: 'HYPERTROPHIC-SCAR', medicineName: 'Contractubex Gel 20g', description: 'Massage twice daily — realistic 3-6 months; sun protection alongside' },
    // KELOID-TENDENCY
    { findingKey: 'KELOID-TENDENCY', medicineName: 'Contractubex Gel 20g', description: 'Early-stage massage; growing/painful keloid → steroid-injection referral' },
    // EPIDERMAL-CYST
    { findingKey: 'EPIDERMAL-CYST', medicineName: 'T-Bact 2% Ointment 5g', description: 'Only while inflamed — definitive cure is complete excision (planned minor-procedure referral)' },
    // PRESSURE-SORE-EARLY
    { findingKey: 'PRESSURE-SORE-EARLY', medicineName: 'Betadine Ointment 20g', description: 'Dressing after pressure relief + turning schedule' },
    { findingKey: 'PRESSURE-SORE-EARLY', medicineName: 'T-Bact 2% Ointment 5g', description: 'If superficial breakdown with spotting' },
    { findingKey: 'PRESSURE-SORE-EARLY', medicineName: 'Lox 2% Jelly 30g', description: '15-20 min before dressing for pain — then clean and dress' },
    { findingKey: 'PRESSURE-SORE-EARLY', medicineName: 'Crocin 500 Tablet', description: 'Sore pain — before dressing change' },
    // POSTOP-WOUND-STABLE
    { findingKey: 'POSTOP-WOUND-STABLE', medicineName: 'Betadine Ointment 20g', description: 'Suture-line dressing until removal' },
    { findingKey: 'POSTOP-WOUND-STABLE', medicineName: 'T-Bact 2% Ointment 5g', description: 'For suture-line spots' },
    { findingKey: 'POSTOP-WOUND-STABLE', medicineName: 'Chymoral Forte Tablet', description: 'Post-op swelling — short course' },
    { findingKey: 'POSTOP-WOUND-STABLE', medicineName: 'Zincovit Tablet', description: 'Healing support until wound closes' },
    // POSTOP-WOUND-INFECTED
    { findingKey: 'POSTOP-WOUND-INFECTED', medicineName: 'Augmentin 625 Tablet', description: 'Fixed course (5-7 days as advised) — spreading redness/fever = same-day review' },
    { findingKey: 'POSTOP-WOUND-INFECTED', medicineName: 'Metrogyl 400 Tablet', description: 'Anaerobic cover for foul discharge — no alcohol on course' },
    { findingKey: 'POSTOP-WOUND-INFECTED', medicineName: 'Taxim-O 200 Tablet', description: 'If penicillin allergy — fixed course' },
    // BURN-MAJOR-REFER, COMPARTMENT-SYNDROME-REFER, TENDON-NERVE-INJURY-REFER,
    // RABIES-EXPOSURE-SEVERE, NON-HEALING-SUSPECT-MALIGNANCY, SEPSIS-WOUND-EMERGENCY:
    // deliberately ZERO medicine links — hospital/emergency territory.
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'BURN-TBSA-CARD (Rule-of-Nines Patient Version)',
      rows: 5,
      cols: 3,
      headerLabel: ['शरीर का भाग', 'जला क्षेत्र % (लगभग)', 'क्या करें'],
      colsLabel: ['Body Part', 'Approx. Burn Area %', 'What To Do'],
      footerLabel: ['हथेली नियम: मरीज़ की एक हथेली = 1% · चेहरा/हाथ/गुप्तांग/करंट/धुएं की सांस या कुल ≥10% = तुरंत अस्पताल · Palm rule: one patient palm = 1% · face/hands/genitals/electric/smoke-breathing or total ≥10% = hospital NOW'],
    },
    {
      name: 'WOUND-CARE-DIARY (7 days)',
      rows: 7,
      cols: 5,
      headerLabel: ['दिन/तारीख', 'ड्रेसिंग बदली?', 'लाली/सूजन बढ़ी?', 'मवाद/बदबू?', 'बुखार?'],
      colsLabel: ['Day/Date', 'Dressing Changed?', 'Redness/Swelling Up?', 'Pus/Smell?', 'Fever?'],
      footerLabel: ['किसी भी कॉलम में "हाँ" बढ़े तो अगली मुलाकात न टालें — उसी दिन क्लिनिक संपर्क / Any growing "yes" = do not postpone — contact the clinic the same day'],
    },
    {
      name: 'SCAR-CARE-PROTOCOL',
      rows: 4,
      cols: 3,
      headerLabel: ['चरण', 'क्या करें', 'कब तक'],
      colsLabel: ['Stage', 'What To Do', 'How Long'],
      footerLabel: ['धैर्य ही इलाज है — दाग पकने में 6-12 महीने लगते हैं; धूप से बचाव पहले साल जरूरी / Patience is the treatment — scars mature over 6-12 months; sun protection essential in year one'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Minor Burn — Dressing Bundle',
      diagnosis: 'BURN-MINOR-SUPERFICIAL',
      medicines: [
        { name: 'Silverex Cream 25g', dose: 'Thin layer', duration: '7 days', instructions: 'At daily dressing change — clean hands/no double-dipping' },
        { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '3 days', instructions: 'Every 8 hrs by the clock — not SOS' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '5 days', instructions: 'Empty stomach, swallow whole' },
        { name: 'Avil 25 Tablet', dose: '1 tab', duration: '5 days', instructions: 'Bedtime only if itch — drowsy, no driving' },
      ],
      labs: ['Tetanus status check', 'Pain score diary'],
      advice: 'रोज़ ड्रेसिंग · फफोले न फोड़ें · दूध-पानी भरपूर · बुखार/बदबू/लाली बढ़े तो उसी दिन आएं · 10% से ज्यादा या चेहरा/हाथ/करंट वाला जलन = अस्पताल',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Clean Laceration — Suture + Cover',
      diagnosis: 'LACERATION-CLEAN',
      medicines: [
        { name: 'Betadine Ointment 20g', dose: 'Apply at dressing', duration: '7 days', instructions: 'After cleaning the wound edges' },
        { name: 'T-Bact 2% Ointment 5g', dose: 'Thin layer', duration: '5 days', instructions: 'Only if suture line shows red spots' },
        { name: 'Crocin 500 Tablet', dose: '1 tab (500 mg)', duration: '3 days', instructions: 'SOS pain — max 3 g/day' },
        { name: 'Augmentin 625 Tablet', dose: '1 tab', duration: '5 days', instructions: 'Only if contaminated wound — fixed course, never stop midway; penicillin allergy = tell doctor' },
      ],
      labs: ['Tetanus immunisation check (booster if >5 years)'],
      advice: 'टांके 7-14 दिन में हटेंगे · घाव गीला न रखें · खुजलाएं नहीं · लाली/पानी/बुखार = उसी दिन बताएं · घर पर गहरा घाव बंद करने की कोशिश नहीं',
      followUpDays: 2,
      isCommon: true,
    },
    {
      name: 'Post-Op Wound Review',
      diagnosis: 'POSTOP-WOUND-STABLE',
      medicines: [
        { name: 'Betadine Ointment 20g', dose: 'Apply at dressing', duration: '7 days', instructions: 'Suture-line care till removal' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '5 days', instructions: 'Empty stomach — swelling support' },
        { name: 'Zincovit Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — healing support' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '5 days', instructions: 'Before breakfast if any NSAID runs alongside' },
      ],
      labs: ['Suture removal as scheduled', 'Wound photo for comparison'],
      advice: 'टांकों पर खिंचाव न दें · मुलाकात के दिन घाव की तस्वीर लेकर आएं · पानी/मवाद/बुखार = उसी दिन क्लिनिक · धूम्रपान बंद — घाव धीमा भरता है',
      followUpDays: 7,
    },
  ],
}
