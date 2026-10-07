/**
 * DIA-01 — DIABETOLOGY STARTER PACK (T1)
 *
 * India's #1 private-practice niche: the diabetes OPD core — sugar control,
 * hypo/hyper acute events, complication screens, co-morbid metabolic care,
 * diet & lifestyle counselling, devices/insulin training.
 *
 * Language: Hindi primary (patient-facing / ask-aloud — simple vocabulary
 * for middle-aged/elderly patients), English secondary (doctor search).
 * Medicine names = English brands (India diabetology core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * INSULIN SAFETY: every insulin entry carries STARTER/TITRATION-style dose
 * ranges only (0.1-0.2 IU/kg patterns) — never fixed aggressive doses; all
 * insulin Rx templates mandate early follow-up for titration review.
 *
 * Cautions baked into `salt` strings (surface in UI + review sheets):
 *   - Sulfonylureas (glimepiride/gliclazide)  → hypoglycemia caution
 *   - SGLT2i (dapa/empagliflozin)             → euglycemic DKA + genital mycotic infection caution
 *   - Pioglitazone                            → weight gain/edema, HF & bladder-history caution
 *   - Pregnancy flags: statins/fibrates/SGLT2i/SU/TZD 'avoid' · metformin 'caution'
 *     (GDM/PCOS under specialist care) · all insulins 'safe'
 *   - GLP-1 RA agonists deliberately EXCLUDED (cost/complexity — reviewer may add later)
 *   - No cough-syrup or combo-steroid entries (unsafe sugar/skin patterns)
 *   - DKA/HHS-suspect finding carries NO medicine links — refer-only by design
 *
 * Sources: NLEM 2023 (molecule backbone), RSSDI/ADA-style standard-care
 * patterns, standard Indian diabetology OPD prescribing conventions.
 */

import type { SpecialtyPack } from '../types'

export const DIA01_PACK: SpecialtyPack = {
  meta: {
    code: 'DIA-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Diabetology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · RSSDI/ADA-style standard care patterns · India diabetology OPD top-prescribe · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'SUG', name: 'शुगर नियंत्रण', nameEn: 'Sugar Control' },
    { key: 'ACU', name: 'शुगर की तीव्र घटनाएं (कम/ज्यादा)', nameEn: 'Acute Events (Hypo/Hyper)' },
    { key: 'COM', name: 'जटिलताएं', nameEn: 'Complications' },
    { key: 'CMX', name: 'सह-रोग', nameEn: 'Co-morbid Conditions' },
    { key: 'DLS', name: 'आहार व जीवनशैली', nameEn: 'Diet & Lifestyle' },
    { key: 'DEV', name: 'उपकरण व अन्य', nameEn: 'Devices & Others' },
  ],

  // ══ Complaints (46) ═══════════════════════════════════════════════════
  complaints: [
    // SUG — Sugar Control
    { code: 'SUG01', categoryKey: 'SUG', detail: 'जानी-पहचानी शुगर — नियमित फॉलो-अप', detailEn: 'Known Diabetes — Routine Follow-up' },
    { code: 'SUG02', categoryKey: 'SUG', detail: 'कई दिनों से शुगर ज्यादा', detailEn: 'High Sugar Since Several Days' },
    { code: 'SUG03', categoryKey: 'SUG', detail: 'बहुत ज्यादा प्यास लगना', detailEn: 'Excessive Thirst' },
    { code: 'SUG04', categoryKey: 'SUG', detail: 'बार-बार पेशाब आना', detailEn: 'Frequent Urination' },
    { code: 'SUG05', categoryKey: 'SUG', detail: 'बढ़ी हुई भूख', detailEn: 'Excessive Hunger' },
    { code: 'SUG06', categoryKey: 'SUG', detail: 'प्यास के साथ वजन घटना', detailEn: 'Weight Loss with Thirst' },
    { code: 'SUG07', categoryKey: 'SUG', detail: 'शुगर की नई जांच करानी है', detailEn: 'New Diabetes Screening Request' },
    { code: 'SUG08', categoryKey: 'SUG', detail: 'थकान व कमजोरी', detailEn: 'Tiredness and Weakness' },
    { code: 'SUG09', categoryKey: 'SUG', detail: 'दवा के बावजूद शुगर नियंत्रित नहीं', detailEn: 'Uncontrolled Despite Medicines' },
    { code: 'SUG10', categoryKey: 'SUG', detail: 'HbA1c रिपोर्ट पर बातचीत', detailEn: 'HbA1c Report Discussion' },
    { code: 'SUG11', categoryKey: 'SUG', detail: 'गर्भावस्था में शुगर बढ़ना', detailEn: 'Sugar Rise in Pregnancy (GDM)' },
    // ACU — Acute Events
    { code: 'ACU01', categoryKey: 'ACU', detail: 'शुगर कम होने के लक्षण', detailEn: 'Low Sugar Symptoms' },
    { code: 'ACU02', categoryKey: 'ACU', detail: 'पसीना व धड़कन बढ़ना', detailEn: 'Sweating with Palpitations' },
    { code: 'ACU03', categoryKey: 'ACU', detail: 'मरीज में भ्रम/बेचैनी (परिवार की शिकायत)', detailEn: 'Confusion/Restlessness (Family Report)' },
    { code: 'ACU04', categoryKey: 'ACU', detail: 'बहुत तेज शुगर — उल्टी के साथ', detailEn: 'Very High Sugar with Vomiting' },
    { code: 'ACU05', categoryKey: 'ACU', detail: 'खड़े होने पर चक्कर', detailEn: 'Giddiness on Standing' },
    { code: 'ACU06', categoryKey: 'ACU', detail: 'बीमारी के दौरान शुगर बिगड़ना', detailEn: 'Sugar Deranged During Illness' },
    // COM — Complications
    { code: 'COM01', categoryKey: 'COM', detail: 'पैरों में झनझनाहट', detailEn: 'Tingling in Feet' },
    { code: 'COM02', categoryKey: 'COM', detail: 'पैरों में जलन', detailEn: 'Burning Feet' },
    { code: 'COM03', categoryKey: 'COM', detail: 'पैरों में सुन्नपन', detailEn: 'Numbness of Feet' },
    { code: 'COM04', categoryKey: 'COM', detail: 'पैर का घाव भर नहीं रहा', detailEn: 'Non-healing Foot Wound/Ulcer' },
    { code: 'COM05', categoryKey: 'COM', detail: 'धुंधला दिखना', detailEn: 'Blurring of Vision' },
    { code: 'COM06', categoryKey: 'COM', detail: 'पैरों में सूजन', detailEn: 'Swelling of Feet' },
    { code: 'COM07', categoryKey: 'COM', detail: 'पेशाब में प्रोटीन की शिकायत', detailEn: 'Protein in Urine Report' },
    { code: 'COM08', categoryKey: 'COM', detail: 'बार-बार फोड़े-फुंसी', detailEn: 'Recurrent Boils/Skin Infections' },
    { code: 'COM09', categoryKey: 'COM', detail: 'जंघों के बीच खुजली (फफूंद)', detailEn: 'Groin Itching (Fungal)' },
    { code: 'COM10', categoryKey: 'COM', detail: 'मसूड़ों की समस्या', detailEn: 'Gum Problems' },
    { code: 'COM11', categoryKey: 'COM', detail: 'पुरुषों में शारीरिक कमजोरी (ED)', detailEn: 'Male Sexual Weakness (ED)' },
    // CMX — Co-morbid Conditions
    { code: 'CMX01', categoryKey: 'CMX', detail: 'शुगर के साथ BP भी बढ़ा', detailEn: 'Diabetes with High BP' },
    { code: 'CMX02', categoryKey: 'CMX', detail: 'थायरॉइड के लक्षण (शुगर के साथ)', detailEn: 'Thyroid Symptoms with Diabetes' },
    { code: 'CMX03', categoryKey: 'CMX', detail: 'कोलेस्ट्रॉल बढ़ना (स्टेटिन सलाह)', detailEn: 'High Cholesterol (Statin Query)' },
    { code: 'CMX04', categoryKey: 'CMX', detail: 'बढ़ता वजन व मोटापा', detailEn: 'Weight Gain/Obesity' },
    { code: 'CMX05', categoryKey: 'CMX', detail: 'फैटी लिवर की शिकायत', detailEn: 'Fatty Liver Complaint' },
    { code: 'CMX06', categoryKey: 'CMX', detail: 'PCOS — महिलाओं में अनियमित पीरियड', detailEn: 'PCOS — Irregular Periods with Insulin Resistance' },
    // DLS — Diet & Lifestyle
    { code: 'DLS01', categoryKey: 'DLS', detail: 'डाइट प्लान चाहिए', detailEn: 'Diet Plan Request' },
    { code: 'DLS02', categoryKey: 'DLS', detail: 'एक्सरसाइज की सलाह', detailEn: 'Exercise Advice' },
    { code: 'DLS03', categoryKey: 'DLS', detail: 'व्रत/रोजा में दवा-शुगर की सलाह', detailEn: 'Fasting (Vrat/Ramadan) Query' },
    { code: 'DLS04', categoryKey: 'DLS', detail: 'यात्रा में शुगर की देखभाल', detailEn: 'Traveling with Diabetes' },
    { code: 'DLS05', categoryKey: 'DLS', detail: 'धूम्रपान/शराब बंद करने की सलाह', detailEn: 'Quit Smoking/Alcohol Advice' },
    { code: 'DLS06', categoryKey: 'DLS', detail: 'वजन घटाने की योजना', detailEn: 'Weight Reduction Plan' },
    // DEV — Devices & Others
    { code: 'DEV01', categoryKey: 'DEV', detail: 'ग्लूकोमीटर इस्तेमाल सीखना', detailEn: 'Glucometer Training' },
    { code: 'DEV02', categoryKey: 'DEV', detail: 'इंसुलिन शुरू करने की सलाह चाहिए', detailEn: 'Insulin Start Query' },
    { code: 'DEV03', categoryKey: 'DEV', detail: 'इंसुलिन खुराक बदलने की समीक्षा', detailEn: 'Insulin Dose Adjustment' },
    { code: 'DEV04', categoryKey: 'DEV', detail: 'इंजेक्शन की जगह की समस्या', detailEn: 'Injection Site Problem' },
    { code: 'DEV05', categoryKey: 'DEV', detail: 'दवा के साइड इफेक्ट', detailEn: 'Medicine Side Effects' },
    { code: 'DEV06', categoryKey: 'DEV', detail: 'ग्लूकोमीटर रीडिंग में शक', detailEn: 'Doubtful Glucometer Readings' },
  ],

  // ══ Questions (92 — 2 per complaint) ══════════════════════════════════
  // questionIndex order below MUST match this array order (idx comments).
  questions: [
    // SUG01 Known DM follow-up
    { complaintCode: 'SUG01', question: 'आपकी शुगर कब से है — कितने साल हो गए?', questionEn: 'Since how many years do you have diabetes?' }, // idx 0
    { complaintCode: 'SUG01', question: 'दवाइयां नियम से ले रहे हैं या कभी-कभी छोड़ जाते हैं?', questionEn: 'Do you take medicines regularly or sometimes miss them?' }, // idx 1
    // SUG02 High sugar since days
    { complaintCode: 'SUG02', question: 'शुगर कितने दिनों से ज्यादा चल रही है?', questionEn: 'Since how many days is the sugar high?' }, // idx 2
    { complaintCode: 'SUG02', question: 'इस बीच खाने-पीने या कोई नई दवा में बदलाव हुआ है?', questionEn: 'Any change in diet or any new medicine meanwhile?' }, // idx 3
    // SUG03 Excessive thirst
    { complaintCode: 'SUG03', question: 'दिन में कितना पानी पीते हैं — प्यास कितनी बढ़ी है?', questionEn: 'How much water do you drink daily — how much has thirst increased?' }, // idx 4
    { complaintCode: 'SUG03', question: 'रात में पानी पीने के लिए कितनी बार उठते हैं?', questionEn: 'How many times do you get up at night to drink water?' }, // idx 5
    // SUG04 Frequent urination
    { complaintCode: 'SUG04', question: 'दिन में कितनी बार पेशाब आता है?', questionEn: 'How many times do you pass urine during the day?' }, // idx 6
    { complaintCode: 'SUG04', question: 'पेशाब करते समय जलन या दर्द तो नहीं होता?', questionEn: 'Any burning or pain while passing urine?' }, // idx 7
    // SUG05 Excessive hunger
    { complaintCode: 'SUG05', question: 'खाने के थोड़ी देर बाद ही फिर भूख लगने लगी है क्या?', questionEn: 'Do you feel hungry again soon after meals?' }, // idx 8
    { complaintCode: 'SUG05', question: 'भूख के साथ हाथ कांपना या पसीना भी आता है?', questionEn: 'Any trembling of hands or sweating along with hunger?' }, // idx 9
    // SUG06 Weight loss with thirst
    { complaintCode: 'SUG06', question: 'कितने महीनों में कितना वजन घटा है?', questionEn: 'How much weight lost over how many months?' }, // idx 10
    { complaintCode: 'SUG06', question: 'वजन घटने के साथ तेज प्यास और बार-बार पेशाब भी है?', questionEn: 'Weight loss with increased thirst and frequent urination too?' }, // idx 11
    // SUG07 New screening
    { complaintCode: 'SUG07', question: 'परिवार में किसी को शुगर है — माता-पिता या भाई-बहन?', questionEn: 'Any family history of diabetes — parents or siblings?' }, // idx 12
    { complaintCode: 'SUG07', question: 'पहले कभी शुगर की जांच कराई है — रिपोर्ट क्या थी?', questionEn: 'Has your sugar been tested before — what was the report?' }, // idx 13
    // SUG08 Tiredness
    { complaintCode: 'SUG08', question: 'थकान पूरे दिन रहती है या किसी खास समय?', questionEn: 'Is the tiredness all day or at any particular time?' }, // idx 14
    { complaintCode: 'SUG08', question: 'कांपना, पसीना या चक्कर जैसे लो शुगर के लक्षण भी आते हैं?', questionEn: 'Any low-sugar symptoms like trembling, sweating or giddiness?' }, // idx 15
    // SUG09 Uncontrolled despite meds
    { complaintCode: 'SUG09', question: 'रोज की रीडिंग बताइए — खाली पेट शुगर कितनी रहती है?', questionEn: 'What are your daily readings — what is the fasting sugar usually?' }, // idx 16
    { complaintCode: 'SUG09', question: 'दवा की खुराक खुद से बदली है — बढ़ाई या घटाई?', questionEn: 'Have you changed the medicine dose yourself — increased or decreased?' }, // idx 17
    // SUG10 HbA1c discussion
    { complaintCode: 'SUG10', question: 'आपका ताजा HbA1c कितना आया है?', questionEn: 'What is your latest HbA1c value?' }, // idx 18
    { complaintCode: 'SUG10', question: 'पिछली रिपोर्ट के बाद से क्या-क्या बदलाव किए हैं?', questionEn: 'What changes have you made since the last report?' }, // idx 19
    // SUG11 GDM
    { complaintCode: 'SUG11', question: 'अभी गर्भावस्था किस महीने की है?', questionEn: 'Which month of pregnancy is it now?' }, // idx 20
    { complaintCode: 'SUG11', question: 'पहले की गर्भावस्था में या परिवार में किसी को शुगर थी?', questionEn: 'Any diabetes in previous pregnancy or in the family?' }, // idx 21
    // ACU01 Low sugar symptoms
    { complaintCode: 'ACU01', question: 'लो शुगर के लक्षण कब आते हैं — खाने से पहले या दवा के बाद?', questionEn: 'When do low-sugar symptoms come — before meals or after medicines?' }, // idx 22
    { complaintCode: 'ACU01', question: 'लक्षणों के समय शुगर चेक की है — कितनी आती है?', questionEn: 'Have you checked sugar during symptoms — what was the value?' }, // idx 23
    // ACU02 Sweating with palpitations
    { complaintCode: 'ACU02', question: 'पसीना-धड़कन के साथ बेचैनी या भूख भी लगती है?', questionEn: 'Sweating and palpitations with restlessness or hunger too?' }, // idx 24
    { complaintCode: 'ACU02', question: 'यह कब होता है — खाने के कितने घंटे बाद या सुबह-सुबह?', questionEn: 'When does it happen — how long after meals or early morning?' }, // idx 25
    // ACU03 Family reports confusion
    { complaintCode: 'ACU03', question: 'मरीज में भ्रम, बेचैनी या अजीब व्यवहार कब दिखा?', questionEn: 'When did the patient show confusion, restlessness or odd behaviour?' }, // idx 26
    { complaintCode: 'ACU03', question: 'बेहोशी या झटके (fits) तो नहीं हुए?', questionEn: 'Any unconsciousness or fits (seizures)?' }, // idx 27
    // ACU04 Very high sugar with vomiting
    { complaintCode: 'ACU04', question: 'शुगर कितनी नापी — 300 से ऊपर तो नहीं?', questionEn: 'What was the sugar reading — was it above 300?' }, // idx 28
    { complaintCode: 'ACU04', question: 'उल्टी, पेट दर्द या सांस फूलना भी साथ है?', questionEn: 'Any vomiting, abdominal pain or breathlessness along with it?' }, // idx 29
    // ACU05 Giddiness on standing
    { complaintCode: 'ACU05', question: 'चक्कर सिर्फ खड़े होते समय आते हैं या बैठते-लेटते भी?', questionEn: 'Giddiness only on standing, or even while sitting/lying?' }, // idx 30
    { complaintCode: 'ACU05', question: 'कोई BP की दवा चल रही है या पानी कम पी रहे हैं?', questionEn: 'Are you on any BP medicine or drinking less water?' }, // idx 31
    // ACU06 Sick day
    { complaintCode: 'ACU06', question: 'बुखार/बीमारी के दौरान शुगर कितनी बढ़ी?', questionEn: 'How much did the sugar rise during the fever/illness?' }, // idx 32
    { complaintCode: 'ACU06', question: 'खाना-पानी ले पा रहे हैं या उल्टी-दस्त हो रहे हैं?', questionEn: 'Are you able to eat and drink, or having vomiting/loose motions?' }, // idx 33
    // COM01 Tingling feet
    { complaintCode: 'COM01', question: 'पैरों में झनझनाहट कितने महीनों से है?', questionEn: 'Since how many months is the tingling in the feet?' }, // idx 34
    { complaintCode: 'COM01', question: 'झनझनाहट रात में या चादर लगाने पर ज्यादा होती है?', questionEn: 'Is the tingling worse at night or when the sheet touches?' }, // idx 35
    // COM02 Burning feet
    { complaintCode: 'COM02', question: 'पैरों में जलन रात में बढ़ जाती है?', questionEn: 'Does the burning in the feet worsen at night?' }, // idx 36
    { complaintCode: 'COM02', question: 'चादर या मोजे का छूना भी अखरता है?', questionEn: 'Does even the touch of the sheet or socks irritate?' }, // idx 37
    // COM03 Numbness of feet
    { complaintCode: 'COM03', question: 'सुन्नपन उंगलियों से ऊपर टखने/घुटने तक जाता है?', questionEn: 'Does the numbness extend from the toes up to the ankle/knee?' }, // idx 38
    { complaintCode: 'COM03', question: 'चलते समय पैरों में पत्थरों पर चलने जैसा लगता है?', questionEn: 'While walking, does it feel like walking on pebbles?' }, // idx 39
    // COM04 Foot ulcer
    { complaintCode: 'COM04', question: 'पैर का घाव कितने दिनों/हफ्तों से है?', questionEn: 'Since how many days/weeks is the foot wound present?' }, // idx 40
    { complaintCode: 'COM04', question: 'घाव में मवाद (पस) या बदबू तो नहीं आ रही?', questionEn: 'Any pus or foul smell from the wound?' }, // idx 41
    // COM05 Blurring vision
    { complaintCode: 'COM05', question: 'धुंधला दिखना शुगर बढ़ने के साथ शुरू हुआ था?', questionEn: 'Did the blurring start when the sugar went high?' }, // idx 42
    { complaintCode: 'COM05', question: 'काले धब्बे, तैरती जाली या अचानक पर्दा जैसा कुछ दिखता है?', questionEn: 'Any black spots, floating threads or a sudden curtain-like effect?' }, // idx 43
    // COM06 Swelling feet
    { complaintCode: 'COM06', question: 'सूजन शाम को बढ़ती और सुबह कम होती है?', questionEn: 'Does the swelling increase by evening and reduce by morning?' }, // idx 44
    { complaintCode: 'COM06', question: 'सांस फूलना या रात में लेटने पर खांसी भी है?', questionEn: 'Any breathlessness or cough while lying down at night?' }, // idx 45
    // COM07 Protein in urine
    { complaintCode: 'COM07', question: 'पेशाब में झाग आता है?', questionEn: 'Is there froth in the urine?' }, // idx 46
    { complaintCode: 'COM07', question: 'सुबह उठते समय चेहरे या पैरों पर सूजन रहती है?', questionEn: 'Any swelling of face or feet on waking up?' }, // idx 47
    // COM08 Recurrent boils
    { complaintCode: 'COM08', question: 'कितने महीनों में कितनी बार फोड़े-फुंसी हुए हैं?', questionEn: 'How many boils/skin abscesses in how many months?' }, // idx 48
    { complaintCode: 'COM08', question: 'फोड़े के साथ बुखार भी आता है?', questionEn: 'Does fever accompany the boils?' }, // idx 49
    // COM09 Groin fungal
    { complaintCode: 'COM09', question: 'खुजली और लाल दाने जंघों के बीच गहरे भाग में हैं?', questionEn: 'Are the itchy red patches in the folds between the thighs?' }, // idx 50
    { complaintCode: 'COM09', question: 'वह जगह पसीने से गीली रहती है?', questionEn: 'Does that area stay moist with sweat?' }, // idx 51
    // COM10 Gum problems
    { complaintCode: 'COM10', question: 'ब्रश करते समय मसूड़ों से खून आता है?', questionEn: 'Do the gums bleed while brushing?' }, // idx 52
    { complaintCode: 'COM10', question: 'मसूड़े लाल-सूजे हुए हैं या कोई दांत हिल रहा है?', questionEn: 'Are the gums red/swollen, or is any tooth loose?' }, // idx 53
    // COM11 ED
    { complaintCode: 'COM11', question: 'यह समस्या कितने महीनों से है?', questionEn: 'Since how many months is this problem?' }, // idx 54
    { complaintCode: 'COM11', question: 'छाती में दर्द या हार्ट से जुड़ी कोई दवा चल रही है?', questionEn: 'Any chest pain or ongoing heart-related medicine?' }, // idx 55
    // CMX01 DM + HTN
    { complaintCode: 'CMX01', question: 'आजकल BP कितना रहता है?', questionEn: 'What is the BP usually these days?' }, // idx 56
    { complaintCode: 'CMX01', question: 'नमक, अचार-पापड़ या नमकीन कितना खाते हैं?', questionEn: 'How much salt, pickle-papad or salty snacks do you take?' }, // idx 57
    // CMX02 Thyroid with DM
    { complaintCode: 'CMX02', question: 'ठंड लगना, थकान या त्वचा सूखना महसूस होता है?', questionEn: 'Do you feel cold, tired or have dry skin?' }, // idx 58
    { complaintCode: 'CMX02', question: 'बिना ज्यादा खाए वजन बढ़ रहा है?', questionEn: 'Is the weight increasing without eating much?' }, // idx 59
    // CMX03 Cholesterol/statin
    { complaintCode: 'CMX03', question: 'लिपिड प्रोफाइल में कोलेस्ट्रॉल कितना आया है?', questionEn: 'What is the cholesterol level in the lipid profile?' }, // idx 60
    { complaintCode: 'CMX03', question: 'स्टेटिन दवा लेने पर मांसपेशियों/गर्दन में दर्द या कमजोरी लगती है?', questionEn: 'Any muscle/neck pain or weakness while on statins?' }, // idx 61
    // CMX04 Obesity
    { complaintCode: 'CMX04', question: 'पिछले साल से वजन कितना बढ़ा है?', questionEn: 'How much weight gained since last year?' }, // idx 62
    { complaintCode: 'CMX04', question: 'रोज कितनी देर चलते-फिरते हैं?', questionEn: 'How long do you walk around daily?' }, // idx 63
    // CMX05 Fatty liver
    { complaintCode: 'CMX05', question: 'पेट के दाहिने ऊपरी हिस्से में भारीपन या हल्का दर्द है?', questionEn: 'Any heaviness or mild pain in the upper right abdomen?' }, // idx 64
    { complaintCode: 'CMX05', question: 'शराब पीते हैं या बिल्कुल बंद कर दी है?', questionEn: 'Do you consume alcohol, or have you stopped completely?' }, // idx 65
    // CMX06 PCOS
    { complaintCode: 'CMX06', question: 'पीरियड कितने-कितने दिन के अंतर पर आते हैं?', questionEn: 'At what intervals do the periods come?' }, // idx 66
    { complaintCode: 'CMX06', question: 'चेहरे पर घने बाल या मुंहासे भी बढ़ गए हैं?', questionEn: 'Have facial hair or acne also increased?' }, // idx 67
    // DLS01 Diet plan
    { complaintCode: 'DLS01', question: 'दिन में क्या-क्या और कितनी बार खाते हैं — मुख्य भोजन बताइए?', questionEn: 'What and how many times do you eat in a day — main meals?' }, // idx 68
    { complaintCode: 'DLS01', question: 'चाय-कॉफी में चीनी या मिठाई कितनी बार लेते हैं?', questionEn: 'How often do you take sugar in tea/coffee or sweets?' }, // idx 69
    // DLS02 Exercise
    { complaintCode: 'DLS02', question: 'फिलहाल रोज कितनी देर टहलते या चलते हैं?', questionEn: 'Currently how long do you walk daily?' }, // idx 70
    { complaintCode: 'DLS02', question: 'चलते समय छाती में दबकन या सांस फूलना आता है?', questionEn: 'Any chest tightness or breathlessness while walking?' }, // idx 71
    // DLS03 Fasting
    { complaintCode: 'DLS03', question: 'व्रत/रोजा के दिन दवा का समय कैसे निपटाते हैं?', questionEn: 'How do you manage medicine timings on fasting days?' }, // idx 72
    { complaintCode: 'DLS03', question: 'व्रत के दिन शुगर कितनी गिरती है?', questionEn: 'How low does the sugar fall on fasting days?' }, // idx 73
    // DLS04 Travel
    { complaintCode: 'DLS04', question: 'यात्रा कितने दिन की और कहां की है?', questionEn: 'How long is the trip and where to?' }, // idx 74
    { complaintCode: 'DLS04', question: 'दवा, ग्लूकोमीटर और इंसुलिन साथ रखते हैं?', questionEn: 'Do you carry medicines, glucometer and insulin with you?' }, // idx 75
    // DLS05 Quit smoking/alcohol
    { complaintCode: 'DLS05', question: 'रोज कितनी सिगरेट/बीड़ी पीते हैं?', questionEn: 'How many cigarettes/bidis do you smoke daily?' }, // idx 76
    { complaintCode: 'DLS05', question: 'पहले कभी छोड़ने की कोशिश की है — क्या दिक्कत लगी?', questionEn: 'Have you tried quitting before — what difficulty did you face?' }, // idx 77
    // DLS06 Weight reduction
    { complaintCode: 'DLS06', question: 'मौजूदा वजन से कितना घटाना चाहते हैं?', questionEn: 'How much weight do you want to lose from current?' }, // idx 78
    { complaintCode: 'DLS06', question: 'तली-भुनी या बाहर की चीजें हफ्ते में कितनी बार खाते हैं?', questionEn: 'How many times a week do you eat fried or outside food?' }, // idx 79
    // DEV01 Glucometer training
    { complaintCode: 'DEV01', question: 'ग्लूकोमीटर पहले से है या नया खरीदना है?', questionEn: 'Do you already have a glucometer or need to buy one?' }, // idx 80
    { complaintCode: 'DEV01', question: 'खून की बूंद कहां से लेते हैं — हमेशा अंगूठे से?', questionEn: 'Where do you prick for blood — always the thumb?' }, // idx 81
    // DEV02 Insulin start
    { complaintCode: 'DEV02', question: 'इंसुलिन लेने में क्या घबराहट है — डर या खर्च?', questionEn: 'What worries you about insulin — fear or cost?' }, // idx 82
    { complaintCode: 'DEV02', question: 'दिन में कितनी बार इंसुलिन लगा पाएंगे?', questionEn: 'How many times a day will you be able to take insulin?' }, // idx 83
    // DEV03 Insulin dose adjustment
    { complaintCode: 'DEV03', question: 'इंसुलिन लगाने के बाद खाली पेट शुगर कितनी रहती है?', questionEn: 'What is the fasting sugar after starting insulin?' }, // idx 84
    { complaintCode: 'DEV03', question: 'रात में शुगर गिरने के लक्षण — कांपना, बेचैनी या बुरे सपने — आते हैं?', questionEn: 'Any nocturnal low-sugar symptoms — trembling, restlessness or bad dreams?' }, // idx 85
    // DEV04 Injection site
    { complaintCode: 'DEV04', question: 'इंजेक्शन की जगह पर गांठ या गड्ढा (डेंट) बन गया है?', questionEn: 'Has a lump or pit formed at the injection site?' }, // idx 86
    { complaintCode: 'DEV04', question: 'हर बार इंजेक्शन की जगह बदलते हैं?', questionEn: 'Do you rotate the injection site every time?' }, // idx 87
    // DEV05 Side effects
    { complaintCode: 'DEV05', question: 'कौन सी दवा लेने के बाद क्या दिक्कत हो रही है?', questionEn: 'Which medicine is causing what problem?' }, // idx 88
    { complaintCode: 'DEV05', question: 'दिक्कत शुरू होने पर दवा बंद कर दी या जारी रखी?', questionEn: 'Did you stop the medicine when the problem started, or continue?' }, // idx 89
    // DEV06 Doubtful readings
    { complaintCode: 'DEV06', question: 'मशीन और लैब की रिपोर्ट में कितना फर्क दिखा?', questionEn: 'How much difference was seen between the machine and lab report?' }, // idx 90
    { complaintCode: 'DEV06', question: 'स्ट्रिप की एक्सपायरी तारीख और मशीन का कोड मिलान जांचा है?', questionEn: 'Have you checked the strip expiry and the meter code matching?' }, // idx 91
  ],

  // ══ Suggestions (184 — 2 per question; questionIndex → questions[]) ══
  suggestions: [
    // q0-q1 SUG01 Known DM follow-up
    { questionIndex: 0, text: '5 साल से कम पुरानी शुगर — साल में 2 बार HbA1c जांच कराएं', textEn: 'Diabetes under 5 years — check HbA1c twice a year' },
    { questionIndex: 0, text: '5 साल से ज्यादा — साल में 1 बार आंखों, पैरों व गुर्दे की पूरी जांच जरूरी', textEn: 'Over 5 years — annual eye, foot and kidney check-up is a must' },
    { questionIndex: 1, text: 'दवा रोज नियम से ले रहे हैं — बहुत अच्छा, यही बनाए रखें', textEn: 'Taking medicines daily as advised — excellent, keep it up' },
    { questionIndex: 1, text: 'कभी-कभी छोड़ जाते हैं — मोबाइल अलार्म/साप्ताहिक दवा पेटी (पिल बॉक्स) अपनाएं', textEn: 'Sometimes missing doses — use mobile alarms or a weekly pill box' },
    // q2-q3 SUG02 High sugar since days
    { questionIndex: 2, text: '3-4 दिन से कम — मीठा-तला बंद करें और 3 दिन का शुगर लॉग दिखाएं', textEn: 'Under 3-4 days — stop sweets/fried and show a 3-day sugar log' },
    { questionIndex: 2, text: '7 दिन से ज्यादा लगातार ज्यादा — खुराक समीक्षा चाहिए, डॉक्टर से मिलें', textEn: 'Persistently high over a week — dose review needed, see the doctor' },
    { questionIndex: 3, text: 'त्योहार/शादी में खाना ज्यादा हुआ — अब संयम रखें, रोज 30 मिनट तेज चाल', textEn: 'Festival overeating — restrain now, brisk walk 30 min daily' },
    { questionIndex: 3, text: 'स्टेरॉयड/पानी की गोली जैसी दवा शुरू हुई — शुगर बढ़ सकती है, रिकॉर्ड लेकर आएं', textEn: 'Steroids/diuretic started — sugar can rise, come with records' },
    // q4-q5 SUG03 Excessive thirst
    { questionIndex: 4, text: 'दिनभर 3-4 लीटर से ज्यादा प्यास — शुगर तेजी से बढ़ रही है, आज ही रैंडम शुगर कराएं', textEn: 'Thirst over 3-4 L/day — sugar rising fast, get random sugar today' },
    { questionIndex: 4, text: 'प्यास सामान्य — पानी नियमित पिएं; कोल्ड ड्रिंक/पैकेट जूस बंद', textEn: 'Thirst normal — drink water regularly; no cold drinks/packaged juices' },
    { questionIndex: 5, text: 'रात में 2-3 बार पानी पीने उठते हैं — PPBS व रैंडम शुगर जांचें', textEn: 'Getting up 2-3 times at night — check PPBS and random sugar' },
    { questionIndex: 5, text: 'रात में नहीं उठते — अच्छा संकेत, नींद व शुगर दोनों ठीक हैं', textEn: 'Not waking at night — good sign, sleep and sugar both fine' },
    // q6-q7 SUG04 Frequent urination
    { questionIndex: 6, text: 'दिन में 8+ बार पेशाब — बढ़ी शुगर का संकेत, रैंडम शुगर कराएं', textEn: 'Urinating 8+ times a day — sign of high sugar, get random sugar' },
    { questionIndex: 6, text: 'सामान्य 4-6 बार — चिंता नहीं; पानी पर्याप्त लेते रहें', textEn: 'Normal 4-6 times — no worry; keep adequate fluids' },
    { questionIndex: 7, text: 'जलन/दर्द है — पेशाब की जांच (urine routine) कराएं, पानी ज्यादा पिएं', textEn: 'Burning/pain present — get urine routine test, drink more water' },
    { questionIndex: 7, text: 'जलन नहीं — बार-बार पेशाब शुगर से जुड़ा है; जांच जारी रखें', textEn: 'No burning — frequency relates to sugar; continue monitoring' },
    // q8-q9 SUG05 Excessive hunger
    { questionIndex: 8, text: 'खाने के 1-2 घंटे बाद फिर भूख — भोजन में प्रोटीन (दाल, दही, अंडा) व सलाद बढ़ाएं', textEn: 'Hungry again 1-2 h after meals — add protein (dal, curd, egg) and salad' },
    { questionIndex: 8, text: 'भूख सामान्य — थाली नियम: आधी सब्जी + चौथाई अनाज + चौथाई प्रोटीन', textEn: 'Appetite normal — plate rule: half vegetables, quarter cereal, quarter protein' },
    { questionIndex: 9, text: 'भूख के साथ कांपना/पसीना — लो शुगर: तुरंत 1 चम्मच चीनी या 4 ग्लूकोज टैब लें, 15 मिनट बाद दोबारा चेक करें', textEn: 'Hunger with trembling/sweating — low sugar: take 1 tbsp sugar or 4 glucose tabs now, recheck in 15 min' },
    { questionIndex: 9, text: 'कांपना नहीं — भोजन के अंतराल 4-5 घंटे रखें, बीच में हल्का नाश्ता', textEn: 'No trembling — keep meal gaps 4-5 hours with light snacks in between' },
    // q10-q11 SUG06 Weight loss with thirst
    { questionIndex: 10, text: '6 महीने में 5 किलो या ज्यादा घटा — गहरी जांच चाहिए (शुगर, HbA1c, CBC, TSH)', textEn: '5 kg+ lost in 6 months — needs full workup (sugar, HbA1c, CBC, TSH)' },
    { questionIndex: 10, text: 'इच्छा से डाइटिंग से घटा — संतुलित आहार पर लौटें, वजन रिकॉर्ड रखें', textEn: 'Intentional dieting loss — return to balanced diet, maintain weight log' },
    { questionIndex: 11, text: 'तीव्र प्यास + बार-बार पेशाब + वजन घटना — बढ़ी शुगर के क्लासिक लक्षण; आज ही जांच कराएं', textEn: 'Thirst + frequency + weight loss — classic high sugar; get tested today' },
    { questionIndex: 11, text: 'वजन स्थिर है — अच्छा; फिर भी HbA1c कराते रहें', textEn: 'Weight stable — good; still keep checking HbA1c' },
    // q12-q13 SUG07 New screening
    { questionIndex: 12, text: 'माता-पिता/भाई-बहन को शुगर — आपका जोखिम दोगुना; साल में 1 बार FBS कराएं', textEn: 'Diabetes in parents/siblings — double risk; annual FBS' },
    { questionIndex: 12, text: 'परिवार में नहीं — 40 की उम्र के बाद भी हर साल जांच कराएं', textEn: 'No family history — still test yearly after age 40' },
    { questionIndex: 13, text: 'पिछली रिपोर्ट बॉर्डरलाइन थी — आज FBS व PPBS दोनों कराएं', textEn: 'Previous report borderline — get both FBS and PPBS today' },
    { questionIndex: 13, text: 'पहले कभी जांच नहीं हुई — खाली पेट व खाने के 2 घंटे बाद की दोनों जांच कराएं', textEn: 'Never tested — do both fasting and 2-hour post-meal tests' },
    // q14-q15 SUG08 Tiredness
    { questionIndex: 14, text: 'खाने के बाद थकान — PPBS जांचें (खाने के 2 घंटे बाद की शुगर)', textEn: 'Tiredness after meals — check PPBS (2-hour post-meal sugar)' },
    { questionIndex: 14, text: 'पूरे दिन थकान — HbA1c, TSH व विटामिन B12/D जांच कराएं', textEn: 'Tired all day — test HbA1c, TSH and vitamin B12/D' },
    { questionIndex: 15, text: 'हां, कांपना/पसीना/चक्कर भी आते हैं — दवा समीक्षा चाहिए; लक्षणों के समय की शुगर नोट करें', textEn: 'Yes, trembling/sweating/giddiness too — medicine review needed; note sugar during symptoms' },
    { questionIndex: 15, text: 'नहीं आते — थकान का कारण B12 की कमी हो सकती है (मेटफॉर्मिन लंबे समय से चल रही हो तो)', textEn: 'No such symptoms — tiredness may be B12 deficiency (if long-term metformin)' },
    // q16-q17 SUG09 Uncontrolled despite meds
    { questionIndex: 16, text: 'खाली पेट 130 से ज्यादा लगातार — खुराक बदलने की जरूरत हो सकती है, डॉक्टर से मिलें', textEn: 'FBS persistently above 130 — dose change may be needed, see doctor' },
    { questionIndex: 16, text: 'खाली पेट 80-130 — लक्ष्य में हैं; अब PPBS (खाने के 2 घंटे बाद) भी देखें', textEn: 'FBS 80-130 — on target; now watch PPBS too' },
    { questionIndex: 17, text: 'खुद खुराक बदली — खतरनाक आदत; बिना डॉक्टर के खुराक कभी न बदलें', textEn: 'Self-adjusted dose — dangerous habit; never change dose without doctor' },
    { questionIndex: 17, text: 'नहीं बदली — अच्छा; 7-दिन का शुगर लॉग लेकर आएं तो समीक्षा आसान होती है', textEn: 'Not changed — good; bring a 7-day sugar log for easier review' },
    // q18-q19 SUG10 HbA1c discussion
    { questionIndex: 18, text: 'HbA1c 7 से कम — उत्तम नियंत्रण, वर्तमान योजना जारी रखें', textEn: 'HbA1c under 7 — excellent control, continue current plan' },
    { questionIndex: 18, text: 'HbA1c 7 या ज्यादा — दवा व जीवनशैली दोनों की समीक्षा चाहिए', textEn: 'HbA1c 7 or above — both medicine and lifestyle need review' },
    { questionIndex: 19, text: 'बदलाव किए (खानपान/चाल) — नतीजा देखें; लॉग डॉक्टर को दिखाएं', textEn: 'Made changes (diet/walking) — see results; show log to doctor' },
    { questionIndex: 19, text: 'कोई बदलाव नहीं — आज से रोज 30 मिनट तेज चाल व तला-मीठा घटाएं', textEn: 'No changes — start 30-min brisk walk daily and cut fried/sweets from today' },
    // q20-q21 SUG11 GDM
    { questionIndex: 20, text: 'गर्भावस्था 6-7 महीने (24-28 हफ्ते) — GDM जांच (OGTT) का सही समय; आज कराएं', textEn: 'Pregnancy 24-28 weeks — right time for GDM test (OGTT); do it today' },
    { questionIndex: 20, text: '28 हफ्ते पार व शुगर बढ़ी — विशेषज्ञ (डायबेटोलॉजी/ओबी-गाई) से तुरंत मिलें', textEn: 'Past 28 weeks with high sugar — see specialist urgently' },
    { questionIndex: 21, text: 'पिछली गर्भावस्था में GDM था — इस बार 12 हफ्ते पर ही जांच कराएं; मीठा पूरी तरह बंद', textEn: 'GDM in previous pregnancy — test at 12 weeks itself; complete sugar ban' },
    { questionIndex: 21, text: 'परिवार/पिछली गर्भावस्था में नहीं — फिर भी 24-28 हफ्ते में जांच जरूरी; भरपूर हरी सब्जियां लें', textEn: 'No history — still mandatory test at 24-28 weeks; plenty of green vegetables' },
    // q22-q23 ACU01 Low sugar symptoms
    { questionIndex: 22, text: 'खाने से पहले/दवा के शिखर पर लक्षण — दवा व भोजन का समय मिलाएं; डॉक्टर से खुराक समीक्षा कराएं', textEn: 'Symptoms before meals/at medicine peak — align drug and meal timing; get dose reviewed' },
    { questionIndex: 22, text: 'व्रत/खाना छोड़ने पर — दवा वाले समय पर कुछ न कुछ खाना जरूरी', textEn: 'On fasting/skipped meals — must eat something at medicine times' },
    { questionIndex: 23, text: '70 से कम नापी — लो शुगर पक्की: 15-15 नियम अपनाएं (15 g शुगर → 15 मिनट → दोबारा चेक)', textEn: 'Reading below 70 — confirmed low sugar: follow the 15-15 rule' },
    { questionIndex: 23, text: 'नहीं नापी — अगली बार लक्षण आते ही ग्लूकोमीटर से तुरंत जांचें और लिख लें', textEn: 'Not checked — next time check immediately with glucometer and note it' },
    // q24-q25 ACU02 Sweating with palpitations
    { questionIndex: 24, text: 'भूख के साथ — क्लासिक लो शुगर: तुरंत 15 g शुगर (1 चम्मच चीनी/4 ग्लूकोज टैब) लें', textEn: 'With hunger — classic low sugar: take 15 g sugar now (1 tbsp sugar/4 glucose tabs)' },
    { questionIndex: 24, text: 'बिना भूख — धड़कन की अन्य जांच (ECG, TSH) कराएं', textEn: 'Without hunger — investigate palpitations otherwise (ECG, TSH)' },
    { questionIndex: 25, text: 'दवा के 2-4 घंटे बाद — भोजन न छोड़ें; खुराक घटाई जा सकती है — डॉक्टर से मिलें', textEn: '2-4 h after medicine — never skip meals; dose may be reduced, see doctor' },
    { questionIndex: 25, text: 'सुबह-सुबह — रात का भोजन समय पर व हल्का रखें; सुबह नाश्ता पहली क्रिया', textEn: 'Early morning — keep dinner timely and light; breakfast first thing in morning' },
    // q26-q27 ACU03 Family reports confusion
    { questionIndex: 26, text: 'पसीना/कांपना साथ दिखा — गंभीर लो शुगर: तुरंत शुगर चेक करें; जागने पर शुगर दें, बेहोश हो तो मुंह में कुछ न डालें — अस्पताल', textEn: 'Sweating/trembling seen — severe low sugar: check now; give sugar if awake, nothing by mouth if unconscious — hospital' },
    { questionIndex: 26, text: 'बार-बार घबराहट/भ्रम — रात 3 बजे की शुगर जांचें व दवा समीक्षा कराएं', textEn: 'Repeated confusion — check 3 a.m. sugar and get medicines reviewed' },
    { questionIndex: 27, text: 'झटके/बेहोशी हुई — इमरजेंसी: तुरंत अस्पताल; मुंह में कुछ न डालें', textEn: 'Fits/unconsciousness — emergency: hospital immediately; nothing by mouth' },
    { questionIndex: 27, text: 'नहीं हुए — अच्छा; फिर भी तकिये के नीचे शुगर की गोली रखें व डॉक्टर को बताएं', textEn: 'None — good; still keep sugar/glucose tabs at bedside and inform doctor' },
    // q28-q29 ACU04 Very high sugar with vomiting
    { questionIndex: 28, text: '300+ लगातार — आज ही डॉक्टर/अस्पताल; यूरिन कीटोन जांच कराएं', textEn: 'Persistently 300+ — doctor/hospital today; test urine ketones' },
    { questionIndex: 28, text: '200-300 के बीच — खानपान सुधारें; 2-3 दिन में न घटे तो मिलें', textEn: 'Between 200-300 — improve diet; see doctor if not down in 2-3 days' },
    { questionIndex: 29, text: 'उल्टी + पेट दर्द + सांस फूलना — DKA का खतरा: इमरजेंसी में तुरंत भर्ती कराएं', textEn: 'Vomiting + abdominal pain + breathlessness — DKA risk: emergency admission now' },
    { questionIndex: 29, text: 'ये लक्षण नहीं — भरपूर पानी; दिन में 2-4 बार शुगर नोट करें', textEn: 'No such symptoms — plenty of water; note sugar 2-4 times a day' },
    // q30-q31 ACU05 Giddiness on standing
    { questionIndex: 30, text: 'चक्कर सिर्फ खड़े होने पर — धीरे उठें, पानी-नमक पर्याप्त; खड़े होकर BP जांचें', textEn: 'Giddy only on standing — rise slowly, adequate water/salt; check standing BP' },
    { questionIndex: 30, text: 'बैठते-लेटते भी — BP व शुगर दोनों जांचें; दवा समीक्षा चाहिए', textEn: 'Even while sitting/lying — check both BP and sugar; medicine review needed' },
    { questionIndex: 31, text: 'पानी कम या जुलाब की दवा — पानी बढ़ाएं व डॉक्टर को बताएं', textEn: 'Less water or diuretic medicine — increase water and inform doctor' },
    { questionIndex: 31, text: 'नई BP दवा शुरू हुई — खुराक समीक्षा कराएं, BP रिकॉर्ड लेकर आएं', textEn: 'New BP medicine started — get dose reviewed, bring BP records' },
    // q32-q33 ACU06 Sick day
    { questionIndex: 32, text: 'बीमारी में 250+ — सिक-डे नियम: दवा बंद न करें, दिन में 4 बार शुगर जांचें', textEn: 'Sugar 250+ during illness — sick-day rule: do not stop medicines, check sugar 4 times daily' },
    { questionIndex: 32, text: 'थोड़ी बढ़ी — हल्का तरल आहार (सूप, दलिया) लेते रहें; नजर रखें', textEn: 'Mildly raised — keep taking light liquids (soup, porridge); monitor' },
    { questionIndex: 33, text: 'उल्टी-दस्त हो रहे — ORS लें; मेटफॉर्मिन रोकें व डॉक्टर से तुरंत संपर्क करें; इंसुलिन बंद न करें', textEn: 'Vomiting/loose motions — take ORS; hold metformin and contact doctor now; never stop insulin' },
    { questionIndex: 33, text: 'खा-पी रहे हैं — अच्छा; हर 4 घंटे शुगर जांचते रहें', textEn: 'Able to eat/drink — good; check sugar every 4 hours' },
    // q34-q35 COM01 Tingling feet
    { questionIndex: 34, text: '3 महीने+ से झनझनाहट — डायबेटिक न्यूरोपैथी संभव; देर न करें, इलाज शुरू कराएं', textEn: 'Tingling over 3 months — likely diabetic neuropathy; start treatment without delay' },
    { questionIndex: 34, text: 'हाल में शुरू — कड़ा शुगर नियंत्रण से अक्सर सुधार; B12 जांच कराएं', textEn: 'Recent onset — tight sugar control often reverses it; test B12' },
    { questionIndex: 35, text: 'रात में ज्यादा — न्यूरोपैथी की पहचान; रात में पतले मोजे पहनें, चादर तंग न रखें', textEn: 'Worse at night — hallmark of neuropathy; wear thin socks at night, avoid tight tucking' },
    { questionIndex: 35, text: 'दिन-रात बराबर — पहले शुगर नियंत्रण; लक्षण नोट करते रहें', textEn: 'Equal day/night — control sugar first; keep noting symptoms' },
    // q36-q37 COM02 Burning feet
    { questionIndex: 36, text: 'जलन रात में बढ़ती है — विटामिन कोर्स व दर्द-घटाने वाली दवा डॉक्टर से लें', textEn: 'Burning worse at night — take vitamin course and doctor-prescribed pain relief' },
    { questionIndex: 36, text: 'दिन में भी बराबर — B12 व TSH जांच कराएं', textEn: 'Same during day — test B12 and TSH' },
    { questionIndex: 37, text: 'चादर/मोजे अखरते हैं — तीव्र न्यूरोपैथी; पूरा इलाज कोर्स व नियमित फॉलो-अप जरूरी', textEn: 'Sheet/socks irritate — severe neuropathy; full treatment course and regular follow-up' },
    { questionIndex: 37, text: 'अखरते नहीं — हल्के लक्षण; शुगर नियंत्रण व B12 से सुधार संभव', textEn: 'No irritation — mild symptoms; reversible with sugar control and B12' },
    // q38-q39 COM03 Numbness of feet
    { questionIndex: 38, text: 'टखने तक सुन्नपन — नस संवेदना घट रही है; मोनोफिलामेंट टेस्ट कराएं', textEn: 'Numbness up to ankle — nerve sensation declining; get monofilament test' },
    { questionIndex: 38, text: 'सिर्फ उंगलियों में — प्रारंभिक अवस्था; कड़ाई से शुगर नियंत्रित करें', textEn: 'Toes only — early stage; control sugar strictly' },
    { questionIndex: 39, text: 'पत्थर जैसा अहसास — संवेदना गंभीर रूप से घटी; घर में भी कभी नंगे पैर न चलें', textEn: 'Pebble-like feeling — sensation severely reduced; never walk barefoot even at home' },
    { questionIndex: 39, text: 'नहीं लगता — अच्छा; फिर भी बाहर हमेशा जूते-मोजे पहनें', textEn: 'Not present — good; still always wear shoes outdoors' },
    // q40-q41 COM04 Foot ulcer
    { questionIndex: 40, text: 'घाव 2 हफ्ते+ भरा नहीं — आज ही डॉक्टर को दिखाएं; शुगर व घाव दोनों की जांच होगी', textEn: 'Wound unhealed 2+ weeks — show doctor today; both sugar and wound need evaluation' },
    { questionIndex: 40, text: 'कुछ दिन का है — रोज साफ करके पट्टी बांधें; घाव पर वजन न पड़ने दें', textEn: 'Few days old — clean and dress daily; keep weight off the wound' },
    { questionIndex: 41, text: 'मवाद/बदबू — संक्रमण: खुद न छेड़ें, आज ही इलाज कराएं', textEn: 'Pus/smell — infection: do not fiddle yourself, get treated today' },
    { questionIndex: 41, text: 'साफ घाव — रोज ड्रेसिंग; शुगर नियंत्रण सबसे जरूरी दवा है', textEn: 'Clean wound — daily dressing; sugar control is the most important medicine' },
    // q42-q43 COM05 Blurring vision
    { questionIndex: 42, text: 'शुगर बढ़ी तो धुंधला — आंख के लेंस में अस्थायी परिवर्तन; शुगर ठीक होने के 2-3 महीने बाद नंबर बदलवाएं', textEn: 'Blur began with high sugar — temporary lens change; change spectacles 2-3 months after sugar settles' },
    { questionIndex: 42, text: 'शुगर ठीक फिर भी धुंधला — रेटिना जांच (फंडस) कराएं', textEn: 'Blurry despite good sugar — get retina (fundus) examination' },
    { questionIndex: 43, text: 'काले धब्बे/पर्दा/तैरती जाली — तुरंत नेत्र विशेषज्ञ को दिखाएं, देर न करें', textEn: 'Black spots/curtain/floaters — see eye specialist immediately, do not delay' },
    { questionIndex: 43, text: 'सिर्फ धुंधलापन — शुगर मरीज को साल में 1 बार फंडस जांच जरूरी', textEn: 'Only blurring — diabetics need annual fundus examination' },
    // q44-q45 COM06 Swelling feet
    { questionIndex: 44, text: 'शाम को सूजन, सुबह कम — पैरों की नसों में पानी: पैर ऊपर रखकर बैठें, नमक घटाएं', textEn: 'Evening swelling, less in morning — venous stasis: elevate legs, reduce salt' },
    { questionIndex: 44, text: 'सुबह भी सूजन — गुर्दे/थायरॉइड की जांच कराएं', textEn: 'Swelling even in morning — test kidneys/thyroid' },
    { questionIndex: 45, text: 'सांस फूलना व रात में खांसी — हार्ट की जांच तुरंत कराएं (देर करना खतरनाक)', textEn: 'Breathlessness and night cough — cardiac evaluation urgently (delay is dangerous)' },
    { questionIndex: 45, text: 'ये लक्षण नहीं — अच्छा; वजन व नमक नियंत्रण जारी रखें', textEn: 'No such symptoms — good; continue weight and salt control' },

    // q46-q47 COM07 Protein in urine
    { questionIndex: 46, text: 'झागदार पेशाब — यूरिन ACR (माइक्रोएल्बुमिन) जांच कराएं; BP व शुगर कड़ाई से नियंत्रित करें', textEn: 'Frothy urine — test urine ACR (microalbumin); strict BP and sugar control' },
    { questionIndex: 46, text: 'झाग नहीं — अच्छा; सालाना urine routine फिर भी कराएं', textEn: 'No froth — good; still do annual urine routine' },
    { questionIndex: 47, text: 'चेहरे/पैरों की सुबह की सूजन — गुर्दे की जांच (क्रिएटिनिन, यूरिन ACR) कराएं', textEn: 'Morning face/foot swelling — kidney tests (creatinine, urine ACR)' },
    { questionIndex: 47, text: 'सूजन नहीं — अच्छा; BP नियमित जांचते रहें', textEn: 'No swelling — good; keep checking BP regularly' },
    // q48-q49 COM08 Recurrent boils
    { questionIndex: 48, text: '2-3 महीने में कई बार फोड़े — बार-बार संक्रमण बढ़ी शुगर का संकेत; HbA1c कराएं', textEn: 'Repeated boils in 2-3 months — recurrent infection signals high sugar; test HbA1c' },
    { questionIndex: 48, text: 'पहली बार हुआ — स्थानीय इलाज; शुगर रिकॉर्ड देखते रहें', textEn: 'First episode — local treatment; keep watching sugar record' },
    { questionIndex: 49, text: 'बुखार के साथ — एंटीबायोटिक जरूरी होगी; डॉक्टर से मिलें', textEn: 'With fever — antibiotic likely needed; see doctor' },
    { questionIndex: 49, text: 'बुखार नहीं — फोड़े को खुद न फोड़ें; गरम सेक व सफाई करें', textEn: 'No fever — do not burst the boil yourself; warm compress and hygiene' },
    // q50-q51 COM09 Groin fungal
    { questionIndex: 50, text: 'जंघों के बीच के भाग में — फफूंद संक्रमण: जगह सूखी रखें, साफ सूती कपड़े पहनें', textEn: 'In the groin folds — fungal infection: keep area dry, wear clean cotton clothes' },
    { questionIndex: 50, text: 'दूसरी जगह — त्वचा की जांच कराकर सही इलाज लें', textEn: 'Elsewhere — get skin examined for the right treatment' },
    { questionIndex: 51, text: 'जगह गीली रहती है — सिंथेटिक कपड़े बंद; सुबह-रात सुखाएं, ढीले कपड़े पहनें', textEn: 'Area stays moist — stop synthetics; dry twice daily, wear loose clothes' },
    { questionIndex: 51, text: 'सूखी रहती है — अच्छा; दवा नियम से पूरा कोर्स लगाएं', textEn: 'Stays dry — good; apply the medicine for the full course' },
    // q52-q53 COM10 Gum problems
    { questionIndex: 52, text: 'ब्रश से खून — नरम ब्रश व दिन में 2 बार सफाई; डेंटिस्ट से स्केलिंग कराएं', textEn: 'Bleeding while brushing — soft brush, twice-daily cleaning; dental scaling' },
    { questionIndex: 52, text: 'खून नहीं — अच्छा; शुगर नियंत्रण मसूड़ों के लिए भी जरूरी है', textEn: 'No bleeding — good; sugar control matters for gums too' },
    { questionIndex: 53, text: 'दांत हिल रहा है — डेंटिस्ट को दिखाएं; गहरी पीरियडॉन्टल बीमारी हो सकती है', textEn: 'Tooth is loose — see a dentist; deep periodontal disease possible' },
    { questionIndex: 53, text: 'सिर्फ लाल मसूड़े — माउथवॉश व नियमित सफाई से सुधार होता है', textEn: 'Only red gums — improves with mouthwash and regular cleaning' },
    // q54-q55 COM11 ED
    { questionIndex: 54, text: '6 महीने+ से है — शुगर/तंत्रिका से जुड़ा आम कारण; इलाज संभव है, संकोच न करें', textEn: 'Present 6+ months — common nerve/vascular cause in diabetes; treatable, do not hesitate' },
    { questionIndex: 54, text: 'हाल में शुरू — शुगर व BP नियंत्रण से अक्सर सुधार', textEn: 'Recent onset — often improves with sugar and BP control' },
    { questionIndex: 55, text: 'नाइट्रेट वाली छाती की दवा चल रही — ED गोली के साथ कभी नहीं (खतरनाक); डॉक्टर से पूछें', textEn: 'On nitrate chest medicines — never combine with ED tablets (dangerous); ask doctor' },
    { questionIndex: 55, text: 'हार्ट की दवा नहीं — फिर भी ED दवा डॉक्टर की सलाह से ही लें', textEn: 'No heart medicines — still take ED tablets only on doctor advice' },
    // q56-q57 CMX01 DM + HTN
    { questionIndex: 56, text: '140/90 से ऊपर — खुराक समीक्षा चाहिए; नमक <1 चम्मच/दिन व BP लॉग रखें', textEn: 'Above 140/90 — dose review needed; salt <1 tsp/day and BP log' },
    { questionIndex: 56, text: '130/80 के भीतर — शुगर मरीज के लिए उत्तम; जारी रखें', textEn: 'Within 130/80 — optimal for diabetics; continue' },
    { questionIndex: 57, text: 'अचार-पापड़-नमकीन ज्यादा — ये आज से घटाएं; बाहर का खाना भी चुपचुप नमक देता है', textEn: 'High pickle-papad-salty snacks — reduce from today; outside food hides salt too' },
    { questionIndex: 57, text: 'कम नमक — बहुत अच्छा; घर के नुस्खे जांचते रहें', textEn: 'Low salt — very good; keep checking home recipes' },
    // q58-q59 CMX02 Thyroid with DM
    { questionIndex: 58, text: 'ठंड लगना + थकान + सूखी त्वचा — TSH कराएं; जरूरत हो तो थायरॉइड दवा शुरू होगी', textEn: 'Cold + tiredness + dry skin — test TSH; thyroid medicine may be needed' },
    { questionIndex: 58, text: 'लक्षण नहीं — फिर भी साल में 1 बार TSH कराएं (शुगर मरीजों में आम)', textEn: 'No symptoms — still annual TSH (common in diabetics)' },
    { questionIndex: 59, text: 'बिना खाने वजन बढ़ रहा — TSH व HbA1c दोनों जांचें', textEn: 'Weight rising without eating — test both TSH and HbA1c' },
    { questionIndex: 59, text: 'वजन स्थिर — अच्छा; व्यायाम जारी रखें', textEn: 'Weight stable — good; continue exercise' },
    // q60-q61 CMX03 Cholesterol/statin
    { questionIndex: 60, text: 'LDL 100 से ज्यादा — शुगर मरीज का लक्ष्य <100: स्टेटिन जरूरी हो सकती है', textEn: 'LDL above 100 — diabetic target <100: statin may be needed' },
    { questionIndex: 60, text: 'LDL 100 के भीतर — अच्छा; घी-तेल-तला घटाते रहें', textEn: 'LDL within 100 — good; keep cutting ghee-oil-fried' },
    { questionIndex: 61, text: 'मांसपेशी/गर्दन दर्द — डॉक्टर को बताएं; खुद दवा बंद न करें, खुराक बदली जा सकती है', textEn: 'Muscle/neck pain — inform doctor; do not stop yourself, dose can be changed' },
    { questionIndex: 61, text: 'कोई दर्द नहीं — दवा रात को नियम से जारी रखें', textEn: 'No pain — continue the tablet nightly as advised' },
    // q62-q63 CMX04 Obesity
    { questionIndex: 62, text: 'साल में 5 किलो+ बढ़ा — इंसुलिन प्रतिरोध बढ़ता है; आज से डाइट व चाल शुरू करें', textEn: 'Gained 5+ kg in a year — insulin resistance rises; start diet and walking today' },
    { questionIndex: 62, text: '2-3 किलो — रोकें; हफ्ते में 2 बार वजन नोट करें', textEn: '2-3 kg — arrest it; note weight twice a week' },
    { questionIndex: 63, text: '30 मिनट से कम चलते हैं — रोज 30 मिनट तेज चाल (हफ्ते में कम से कम 5 दिन) शुरू करें', textEn: 'Walking under 30 min — start 30-min brisk walk daily (at least 5 days/week)' },
    { questionIndex: 63, text: '30 मिनट+ चलते हैं — बहुत अच्छा; खाने के 15 मिनट बाद टहलना और भी फायदेमंद', textEn: 'Walking 30+ min — excellent; walking 15 min after meals is even better' },
    // q64-q65 CMX05 Fatty liver
    { questionIndex: 64, text: 'दाहिने ऊपरी पेट में भारीपन — पेट की USG व LFT कराएं (फैटी लिवर की जांच)', textEn: 'Heaviness upper right abdomen — abdominal USG and LFT (fatty liver workup)' },
    { questionIndex: 64, text: 'कोई दर्द नहीं — फिर भी वजन घटाना व शराब-बंदी जरूरी', textEn: 'No pain — still weight loss and alcohol abstinence are essential' },
    { questionIndex: 65, text: 'शराब चालू है — फैटी लिवर बढ़ती है व लो शुगर का खतरा रहता है; बंद करने की काउंसलिंग लें', textEn: 'Alcohol ongoing — worsens fatty liver and risks low sugar; take cessation counselling' },
    { questionIndex: 65, text: 'बिल्कुल बंद — अच्छा; मैदा-तला भी घटाएं', textEn: 'Completely stopped — good; cut refined flour and fried too' },
    // q66-q67 CMX06 PCOS
    { questionIndex: 66, text: '2-3 महीने का अंतर या छूटती पीरियड — PCOS संभव; गाइनो जांच व शुगर/इंसुलिन टेस्ट कराएं', textEn: '2-3 month gaps or missed periods — possible PCOS; gynae exam and glucose/insulin testing' },
    { questionIndex: 66, text: 'नियमित पीरियड — अच्छा; वजन नियंत्रण जारी रखें', textEn: 'Regular cycles — good; continue weight control' },
    { questionIndex: 67, text: 'चेहरे के घने बाल/मुंहासे — PCOS की और जांच कराएं; मेटफॉर्मिन व वजन घटाने से मदद मिलती है', textEn: 'Facial hair/acne — further PCOS workup; metformin and weight loss help' },
    { questionIndex: 67, text: 'नहीं हैं — अच्छा; फिर भी इंसुलिन प्रतिरोध की जांच करते रहें', textEn: 'Absent — good; still keep screening insulin resistance' },
    // q68-q69 DLS01 Diet plan
    { questionIndex: 68, text: 'दिन में 2 बड़े भोजन — 3 छोटे भोजन + 2 हल्के नाश्ते में बांट दें', textEn: 'Two big meals — split into 3 small meals + 2 light snacks' },
    { questionIndex: 68, text: 'बार-बार कुछ खाते हैं — थाली नियम: आधी सब्जी, चौथाई अनाज, चौथाई प्रोटीन', textEn: 'Frequent eating — plate rule: half vegetables, quarter cereal, quarter protein' },
    { questionIndex: 69, text: 'चाय में चीनी — बिना चीनी चाय पर जाएं; मिठाई महीने में 1 बार से ज्यादा नहीं', textEn: 'Sugar in tea — switch to sugarless tea; sweets not more than once a month' },
    { questionIndex: 69, text: 'चीनी नहीं लेते — बहुत अच्छा; पैकेट जूस व कोल्ड ड्रिंक भी बंद रखें', textEn: 'No sugar — excellent; keep packaged juice and cold drinks off too' },
    // q70-q71 DLS02 Exercise
    { questionIndex: 70, text: 'बहुत कम चलते हैं — 10 मिनट से शुरू करके 2 हफ्तों में 30 मिनट तक पहुंचें', textEn: 'Very sedentary — start with 10 min and reach 30 min in two weeks' },
    { questionIndex: 70, text: 'पहले से चलते हैं — गति तेज करें; भोजन के तुरंत बाद 15 मिनट टहलना अच्छा नियम', textEn: 'Already walking — increase pace; 15-min walk right after meals is a good rule' },
    { questionIndex: 71, text: 'चलते समय छाती में दबकन/दर्द — व्यायाम रोकें व ECG जैसी जांच तुरंत कराएं', textEn: 'Chest tightness/pain on walking — stop exercise and get ECG-type tests urgently' },
    { questionIndex: 71, text: 'कोई दिक्कत नहीं — रोज की चाल जारी रखें; लिफ्ट की जगह सीढ़ियां चुनें', textEn: 'No trouble — continue daily walk; choose stairs over lifts' },
    // q72-q73 DLS03 Fasting
    { questionIndex: 72, text: 'व्रत के दिन दवा छोड़ देते हैं — बिना डॉक्टर की सलाह दवा न छोड़ें; खुराक बदली जा सकती है', textEn: 'Skipping medicines on fasting days — never stop without doctor advice; dose can be adjusted' },
    { questionIndex: 72, text: 'इंसुलिन लेते हैं — व्रत/रोजा की योजना पहले ही डॉक्टर से बनवाएं; इंसुलिन कभी बंद नहीं', textEn: 'On insulin — plan fasting with doctor in advance; insulin is never stopped' },
    { questionIndex: 73, text: 'व्रत के दिन 70 से नीचे — व्रत वाले दिन खुराक घटानी होगी; तुरंत शुगर लेने का इंतजाम रखें', textEn: 'Below 70 on fasting days — dose needs reduction on fasting days; keep sugar rescue ready' },
    { questionIndex: 73, text: 'व्रत में शुगर ठीक रहती है — फिर भी उस दिन 2 बार जांचें; हल्का फल/साबूदाना लें', textEn: 'Sugar stays fine while fasting — still check twice that day; light fruit/sago' },
    // q74-q75 DLS04 Travel
    { questionIndex: 74, text: 'लंबी यात्रा — दवा-स्ट्रिप 2 गुना साथ रखें; ग्लूकोमीटर, स्ट्रिप व इंसुलिन ठंडी बैग में', textEn: 'Long trip — carry double medicine strips; glucometer, strips and insulin in a cool bag' },
    { questionIndex: 74, text: 'छोटी यात्रा — भरपूर पानी; यात्रा में भोजन का समय न छोड़ें', textEn: 'Short trip — plenty of water; do not miss meal timings while traveling' },
    { questionIndex: 75, text: 'सब साथ रखते हैं — अच्छा; जेब में ग्लूकोज की गोलियां/चीनी की पैकेट भी रखें', textEn: 'Carrying everything — good; also keep glucose tabs/sugar sachets in pocket' },
    { questionIndex: 75, text: 'नहीं रखते — आज से रखना शुरू करें; यात्रा में खाना देर से मिलना आम है', textEn: 'Not carrying — start today; food often gets delayed while traveling' },
    // q76-q77 DLS05 Quit smoking/alcohol
    { questionIndex: 76, text: '10+ रोज — धूम्रपान शुगर की नसें और तेजी से बिगाड़ता है; आज से घटाएं, डॉक्टर से मदद लें', textEn: '10+ daily — smoking damages diabetic nerves faster; reduce from today, take doctor help' },
    { questionIndex: 76, text: 'कम/बिल्कुल नहीं — अच्छा; पान-तंबाकू भी बंद करें', textEn: 'Few/none — good; stop paan-tobacco too' },
    { questionIndex: 77, text: 'पहले कोशिश की — दोबारा कोशिश करें; निकोटीन रिप्लेसमेंट से मदद मिल सकती है', textEn: 'Tried before — try again; nicotine replacement can help' },
    { questionIndex: 77, text: 'कभी नहीं कोशिश की — छोड़ने की तारीख 2 हफ्ते में तय करें व परिवार को बताएं', textEn: 'Never tried — set a quit date within 2 weeks and tell family' },
    // q78-q79 DLS06 Weight reduction
    { questionIndex: 78, text: '5-10% वजन घटाने से HbA1c 1-2 पॉइंट गिर सकता है; हफ्ते में आधा किलो लक्ष्य रखें', textEn: 'Losing 5-10% weight can drop HbA1c by 1-2 points; target half kg per week' },
    { questionIndex: 78, text: 'बहुत ज्यादा घटाना चाहते हैं — डाइटिशियन से व्यक्तिगत योजना बनवाएं', textEn: 'Want to lose a lot — get a personalised plan from a dietitian' },
    { questionIndex: 79, text: 'हफ्ते में 3+ बार तला-बाहर का — हफ्ते में 1 बार तक घटाएं; स्नैक में भुना चना/मूंगफली', textEn: 'Fried/outside food 3+ times a week — cut to once; snack on roasted chana/peanuts' },
    { questionIndex: 79, text: 'कम तला खाते हैं — अच्छा; मिठाई भी उतनी ही कम रखें', textEn: 'Low fried intake — good; keep sweets equally low' },
    // q80-q81 DEV01 Glucometer training
    { questionIndex: 80, text: 'नया लेना है — सस्ती-सरल मशीन चुनें; साथ में इस्तेमाल व स्ट्रिप-कोड सिखा देंगे', textEn: 'Buying new — pick a simple affordable meter; usage and strip coding will be taught' },
    { questionIndex: 80, text: 'पुरानी मशीन है — स्ट्रिप की एक्सपायरी व कोड मिलान जांचें', textEn: 'Old meter — check strip expiry and code matching' },
    { questionIndex: 81, text: 'हमेशा एक ही अंगूठा — उंगली के किनारे से, हर बार अलग उंगली में लें; दर्द कम लगता है', textEn: 'Same thumb always — prick from finger sides, different finger each time; hurts less' },
    { questionIndex: 81, text: 'जगह बदलते हैं — सही तरीका; पहले हाथ धोकर पूरा सुखाएं', textEn: 'Rotating sites — right technique; wash and fully dry hands first' },
    // q82-q83 DEV02 Insulin start
    { questionIndex: 82, text: 'डर/खर्च की चिंता — समझें: देर से इंसुलिन से नुकसान ज्यादा होता है; पेन से लगाना आसान है', textEn: 'Fear/cost concern — understand: delayed insulin causes more harm; pens are easy to use' },
    { questionIndex: 82, text: 'तैयार हैं — पहली खुराक यहीं लगाकर सीखें; पेन, सुई व सुरक्षा तरीके सिखाए जाएंगे', textEn: 'Ready — take the first dose here to learn; pen, needles and safety will be taught' },
    { questionIndex: 83, text: 'दिन में 1 बार ही संभव — रात की एक बार लंबी-अवधि (बेसल) इंसुलिन से शुरुआत हो सकती है', textEn: 'Only once a day feasible — can start with once-nightly long-acting (basal) insulin' },
    { questionIndex: 83, text: 'सुबह-शाम 2 बार संभव — मिक्स इंसुलिन सुबह-रात भोजन से पहले शुरू की जा सकती है', textEn: 'Twice daily feasible — mixed insulin before morning-evening meals can be started' },
    // q84-q85 DEV03 Insulin dose adjustment
    { questionIndex: 84, text: 'खाली पेट 130+ लगातार — रात की खुराक डॉक्टर बढ़ाएंगे; 7-दिन का रिकॉर्ड लेकर आएं', textEn: 'FBS persistently 130+ — doctor will raise the night dose; bring a 7-day record' },
    { questionIndex: 84, text: 'खाली पेट 80-110 — बेसल खुराक सही चल रही है; जारी रखें', textEn: 'FBS 80-110 — basal dose is right; continue' },
    { questionIndex: 85, text: 'रात के लक्षण — रात 3 बजे की शुगर जांचें; खुराक घटानी पड़ सकती है', textEn: 'Nocturnal symptoms — check 3 a.m. sugar; dose may need lowering' },
    { questionIndex: 85, text: 'रात में कोई लक्षण नहीं — अच्छा; सुबह की खाली पेट शुगर नोट करते रहें', textEn: 'No night symptoms — good; keep noting morning fasting sugar' },
    // q86-q87 DEV04 Injection site
    { questionIndex: 86, text: 'गांठ/गड्ढा बन गया — एक ही जगह लगाने से होता है; जगह बदलें, 2-3 हफ्ते में सुधार होगा', textEn: 'Lump/pit formed — from injecting same spot; rotate sites, improves in 2-3 weeks' },
    { questionIndex: 86, text: 'त्वचा सामान्य — अच्छा; जगह घुमाते रहें (पेट-जांघ-बांह के क्षेत्र)', textEn: 'Skin normal — good; keep rotating (abdomen-thigh-arm areas)' },
    { questionIndex: 87, text: 'हर बार बदलते हैं — सही आदत; एक ही क्षेत्र में 2 सेमी का फासला रखें', textEn: 'Rotate every time — right habit; keep 2 cm gap within an area' },
    { questionIndex: 87, text: 'एक ही जगह लगाते हैं — आज से बदलें; एक जगह से गांठ व असर कम होता है', textEn: 'Same spot always — change from today; same spot causes lumps and poor action' },
    // q88-q89 DEV05 Side effects
    { questionIndex: 88, text: 'मेटफॉर्मिन से मतली/दस्त — भोजन के तुरंत बाद लें; SR (धीरे-छूटने वाली) गोली में बदली जा सकती है', textEn: 'Nausea/loose motions with metformin — take right after meals; can switch to SR form' },
    { questionIndex: 88, text: 'SGLT2 दवा (Forxiga/Jardiance) से जननांग खुजली — सफाई व पानी बढ़ाएं; बताएं तो दवा बदली जा सकती है', textEn: 'Genital itch with SGLT2 (Forxiga/Jardiance) — hygiene and more water; drug can be changed if reported' },
    { questionIndex: 89, text: 'बंद कर दी — बिना सलाह बंद करना खतरनाक; विकल्प उपलब्ध हैं, डॉक्टर से मिलें', textEn: 'Stopped it — stopping without advice is dangerous; alternatives exist, see doctor' },
    { questionIndex: 89, text: 'जारी रखी — ठीक; असहज लगे तो डॉक्टर खुराक/रूप बदल सकते हैं', textEn: 'Continued — fine; doctor can change dose/form if uncomfortable' },
    // q90-q91 DEV06 Doubtful readings
    { questionIndex: 90, text: '10-15% तक फर्क सामान्य — दोनों सही मानें; बहुत ज्यादा फर्क हो तो मशीन जांच कराएं', textEn: 'Difference up to 10-15% is normal — trust both; if huge gap, get meter checked' },
    { questionIndex: 90, text: 'फर्क बहुत ज्यादा — स्ट्रिप नई, कोड मिलान व तकनीक दोबारा जांचें; मशीन साथ लाएं', textEn: 'Huge difference — recheck new strip, code and technique; bring meter along' },
    { questionIndex: 91, text: 'नहीं जांचा — आज ही स्ट्रिप की एक्सपायरी व कोड देखें; पुरानी स्ट्रिप गलत रीडिंग देती है', textEn: 'Not checked — check strip expiry and code today; old strips give wrong readings' },
    { questionIndex: 91, text: 'सब जांच लिया — अच्छा; स्ट्रिप बंद डिब्बे में गर्मी-नमी से दूर रखें', textEn: 'All checked — good; store strips closed, away from heat and moisture' },
  ],

  // ══ Labels — vitals + diabetes-specific (12) ══════════════════════════
  labels: [
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'खाली पेट शुगर (FBS)', labelEn: 'Fasting Blood Sugar', unit: 'mg/dl' },
    { label: 'खाने के 2 घंटे बाद शुगर (PPBS)', labelEn: 'Post-Prandial Blood Sugar', unit: 'mg/dl' },
    { label: 'HbA1c', labelEn: 'HbA1c (3-month sugar average)', unit: '%' },
    { label: 'यूरिन शुगर', labelEn: 'Urine Sugar', unit: '', showUnit: false },
    { label: 'यूरिन कीटोन', labelEn: 'Urine Ketones', unit: '', showUnit: false },
    { label: 'कमर (वेस्ट)', labelEn: 'Waist Circumference', unit: 'cm' },
  ],

  // ══ Findings (23) — E11.x diabetes core + co-morbidities ═════════════
  findings: [
    { key: 'T2DM-NEW', name: 'नई पहचान टाइप 2 शुगर', nameEn: 'Type 2 Diabetes — Newly Diagnosed', icd10: 'E11.9' },
    { key: 'T2DM-STABLE', name: 'टाइप 2 शुगर — नियंत्रित (फॉलो-अप)', nameEn: 'Type 2 Diabetes — Controlled (Follow-up)', icd10: 'E11.9' },
    { key: 'T2DM-UNCTRL', name: 'टाइप 2 शुगर — अनियंत्रित', nameEn: 'Type 2 Diabetes — Uncontrolled', icd10: 'E11.65' },
    { key: 'T2DM-NEURO', name: 'शुगर के साथ पैरों की नस-जलन (न्यूरोपैथी)', nameEn: 'T2DM with Diabetic Peripheral Neuropathy', icd10: 'E11.42' },
    { key: 'T2DM-AUTONOMIC', name: 'मधुमेह अपसंवैधिक न्यूरोपैथी (खड़े होने पर चक्कर)', nameEn: 'T2DM with Autonomic Neuropathy', icd10: 'E11.43' },
    { key: 'DIAB-FOOT-ULCER', name: 'मधुमेह व्रण (पैर का घाव)', nameEn: 'Diabetic Foot Ulcer', icd10: 'E11.621' },
    { key: 'T2DM-NEPHRO', name: 'शुगर के साथ गुर्दे पर असर (नेफ्रोपैथी)', nameEn: 'T2DM with Early Nephropathy', icd10: 'E11.21' },
    { key: 'T2DM-RETINO', name: 'शुगर के साथ रेटिनोपैथी (आंख — नेत्र रेफर)', nameEn: 'T2DM with Retinopathy (Refer)', icd10: 'E11.31' },
    { key: 'HYPO-EPI', name: 'लो शुगर का दौरा (हाइपोग्लाइसीमिया)', nameEn: 'Hypoglycemia Episode', icd10: 'E16.2' },
    { key: 'DKA-SUSPECT', name: 'शुगर की गंभीर अधिकता (DKA/HHS संदेह — रेफर)', nameEn: 'Suspected Hyperglycemic Emergency (DKA/HHS)', icd10: 'E11.10' },
    { key: 'T2DM-HTN', name: 'शुगर के साथ उच्च रक्तचाप', nameEn: 'T2DM with Hypertension', icd10: 'E11.9, I10' },
    { key: 'T2DM-HYPOTHY', name: 'शुगर के साथ थायरॉइड की कमी', nameEn: 'T2DM with Hypothyroidism', icd10: 'E11.9, E03.9' },
    { key: 'PREDIABETES', name: 'प्री-डायबिटीज (सीमावर्ती शुगर)', nameEn: 'Prediabetes / IGT', icd10: 'R73.03' },
    { key: 'DYSLIPIDEMIA', name: 'मधुमेह डिसलिपिडेमिया (कोलेस्ट्रॉल बढ़ना)', nameEn: 'Diabetic Dyslipidemia', icd10: 'E78.5' },
    { key: 'OBESITY-IR', name: 'मोटापे के साथ इंसुलिन प्रतिरोध', nameEn: 'Obesity with Insulin Resistance', icd10: 'E66.9' },
    { key: 'NAFLD', name: 'फैटी लिवर (मोटी यकृत)', nameEn: 'Non-alcoholic Fatty Liver Disease', icd10: 'K76.0' },
    { key: 'PCOS-IR', name: 'PCOS के साथ इंसुलिन प्रतिरोध', nameEn: 'PCOS with Insulin Resistance', icd10: 'E28.2' },
    { key: 'T1DM', name: 'टाइप 1 शुगर (इंसुलिन + एंडोक्राइन रेफर)', nameEn: 'Type 1 Diabetes (Insulin + Refer)', icd10: 'E10.9' },
    { key: 'T2DM-SKIN-INF', name: 'शुगर के साथ बार-बार त्वचा संक्रमण', nameEn: 'T2DM with Recurrent Skin Infections', icd10: 'E11.628' },
    { key: 'GENITAL-CAND', name: 'जननांग फफूंद संक्रमण', nameEn: 'Genital Candidiasis', icd10: 'B37.3' },
    { key: 'PERIO-DISEASE', name: 'मसूड़ा रोग (पीरियडॉन्टाइटिस)', nameEn: 'Periodontal Disease', icd10: 'K05.60' },
    { key: 'ED-DM', name: 'मधुमेह जनित नपुंसकता (ED)', nameEn: 'Diabetic Erectile Dysfunction', icd10: 'E11.69' },
    { key: 'GDM', name: 'गर्भकालीन शुगर (GDM — विशेषज्ञ देखरेख)', nameEn: 'Gestational Diabetes (Specialist Care)', icd10: 'O24.4' },
  ],

  // ══ Medicines (74) — India diabetology OPD core ══════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~30-day chronic dispense.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Biguanides (metformin family) — pregnancy 'caution' (GDM/PCOS under specialist care)
    { name: 'Glycomet 500 Tablet', salt: 'Metformin 500 mg', doseOptions: ['1 tab after dinner', '1 tab twice daily (after food)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet 850 Tablet', salt: 'Metformin 850 mg', doseOptions: ['1 tab after dinner', '1 tab twice daily (after food)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet 500 SR Tablet', salt: 'Metformin 500 mg sustained release', doseOptions: ['1 tab after dinner', '1 tab twice daily (after food)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet 1000 SR Tablet', salt: 'Metformin 1000 mg sustained release', doseOptions: ['1 tab after dinner', '1 tab twice daily (after food)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glyciphage SR 500 Tablet', salt: 'Metformin 500 mg sustained release (budget brand)', doseOptions: ['1 tab after dinner', '1 tab twice daily (after food)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Sulfonylureas — hypoglycemia caution carried in salt
    { name: 'Amaryl 1 Tablet', salt: 'Glimepiride 1 mg — ⚠ सावधानी: लो शुगर (हाइपोग्लाइसीमिया) हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab before breakfast', '1 tab before breakfast & dinner'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amaryl 2 Tablet', salt: 'Glimepiride 2 mg — ⚠ सावधानी: लो शुगर (हाइपोग्लाइसीमिया) हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab before breakfast', '1 tab before breakfast & dinner'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glimy 2 Tablet', salt: 'Glimepiride 2 mg — ⚠ सावधानी: लो शुगर (हाइपोग्लाइसीमिया) हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab before breakfast', '1 tab before breakfast & dinner'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glizid 80 Tablet', salt: 'Gliclazide 80 mg — ⚠ सावधानी: लो शुगर (हाइपोग्लाइसीमिया) हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab before breakfast', '1 tab twice daily before meals'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glizid MR 60 Tablet', salt: 'Gliclazide MR 60 mg (modified release) — ⚠ सावधानी: लो शुगर हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // DPP4 inhibitors (gliptins)
    { name: 'Istavel 50 Tablet', salt: 'Sitagliptin 50 mg', doseOptions: ['1 tab once daily', '1 tab twice daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Januvia 100 Tablet', salt: 'Sitagliptin 100 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Galvus 50 Tablet', salt: 'Vildagliptin 50 mg', doseOptions: ['1 tab twice daily (with meals)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Jalra 50 Tablet', salt: 'Vildagliptin 50 mg', doseOptions: ['1 tab twice daily (with meals)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Oral combinations — gliptin + metformin
    { name: 'Istamet 50/500 Tablet', salt: 'Sitagliptin 50 mg + Metformin 500 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Janumet 50/500 Tablet', salt: 'Sitagliptin 50 mg + Metformin 500 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Janumet 50/1000 Tablet', salt: 'Sitagliptin 50 mg + Metformin 1000 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Galvus Met 50/500 Tablet', salt: 'Vildagliptin 50 mg + Metformin 500 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Jalra M 50/500 Tablet', salt: 'Vildagliptin 50 mg + Metformin 500 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Oral combinations — sulfonylurea + metformin (hypo caution)
    { name: 'Glycomet GP 0.5 Tablet', salt: 'Glimepiride 0.5 mg + Metformin 500 mg — ⚠ सावधानी: लो शुगर हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab after breakfast', '1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet GP 1 Tablet', salt: 'Glimepiride 1 mg + Metformin 500 mg — ⚠ सावधानी: लो शुगर हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab after breakfast', '1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Glycomet GP 2 Tablet', salt: 'Glimepiride 2 mg + Metformin 500 mg — ⚠ सावधानी: लो शुगर हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab after breakfast', '1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amaryl M 2 Tablet', salt: 'Glimepiride 2 mg + Metformin 500 mg — ⚠ सावधानी: लो शुगर हो सकती है; भोजन कभी न छोड़ें', doseOptions: ['1 tab after breakfast & dinner'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // SGLT2 inhibitors — euglycemic DKA + genital mycotic infection caution in salt
    { name: 'Forxiga 5 Tablet', salt: 'Dapagliflozin 5 mg (SGLT2 inhibitor) — ⚠ सावधानी: जननांग फफूंद संक्रमण व बिना ज्यादा शुगर के DKA हो सकता है; पानी खूब पिएं', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Forxiga 10 Tablet', salt: 'Dapagliflozin 10 mg (SGLT2 inhibitor) — ⚠ सावधानी: जननांग फफूंद संक्रमण व बिना ज्यादा शुगर के DKA हो सकता है; पानी खूब पिएं', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Jardiance 10 Tablet', salt: 'Empagliflozin 10 mg (SGLT2 inhibitor) — ⚠ सावधानी: जननांग फफूंद संक्रमण व बिना ज्यादा शुगर के DKA हो सकता है; पानी खूब पिएं', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Jardiance 25 Tablet', salt: 'Empagliflozin 25 mg (SGLT2 inhibitor) — ⚠ सावधानी: जननांग फफूंद संक्रमण व बिना ज्यादा शुगर के DKA हो सकता है; पानी खूब पिएं', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Jardiance Duo 12.5/1000 Tablet', salt: 'Empagliflozin 12.5 mg + Metformin 1000 mg SR — ⚠ SGLT2 सावधानी: जननांग फफूंद/DKA; पानी खूब पिएं', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // Alpha-glucosidase inhibitors
    { name: 'Volix 0.2 Tablet', salt: 'Voglibose 0.2 mg — भोजन के पहले कौर के साथ', doseOptions: ['1 tab with first bite of each meal'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Volix 0.3 Tablet', salt: 'Voglibose 0.3 mg — भोजन के पहले कौर के साथ', doseOptions: ['1 tab with first bite of each meal'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Thiazolidinedione
    { name: 'Pioglit 7.5 Tablet', salt: 'Pioglitazone 7.5 mg — ⚠ सावधानी: वजन व पैरों की सूजन बढ़ सकती है; हार्ट फेल या मूत्राशय रोग के इतिहास में नहीं', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pioglit 15 Tablet', salt: 'Pioglitazone 15 mg — ⚠ सावधानी: वजन व पैरों की सूजन बढ़ सकती है; हार्ट फेल या मूत्राशय रोग के इतिहास में नहीं', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // Insulins — STARTER/TITRATION ranges only; pregnancy 'safe'; pediatric weight-based
    { name: 'Mixtard 30 Penfill', salt: 'Insulin human isophane 30/70 suspension 100 IU/ml (3 ml penfill) — खाने से 30 मिनट पहले लगाएं', doseOptions: ['0.2 IU/kg before breakfast (STARTER — titrate)', '0.2 IU/kg before dinner (STARTER — titrate)'], morning: 0, afternoon: 0, evening: 0, tab: 2, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Novomix 30 Penfill', salt: 'Insulin aspart 30/70 protamine mix 100 IU/ml (3 ml penfill) — भोजन से ठीक पहले लगाएं', doseOptions: ['0.2 IU/kg before breakfast (STARTER — titrate)', '0.2 IU/kg before dinner (STARTER — titrate)'], morning: 0, afternoon: 0, evening: 0, tab: 2, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Basalog One 100IU/ml Injection', salt: 'Insulin glargine 100 IU/ml — 24-घंटे असर वाली बेसल इंसुलिन', doseOptions: ['0.1-0.2 IU/kg at bedtime (STARTER — titrate per FBS)', '0.2 IU/kg once daily at a fixed time (STARTER — titrate)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Actrapid Penfill', salt: 'Insulin human regular (soluble) 100 IU/ml — भोजन से 30 मिनट पहले लगाएं', doseOptions: ['0.1-0.2 IU/kg before meals (STARTER — 30 min before food)', '4-6 IU before major meals (STARTER — titrate per PPBS)'], morning: 0, afternoon: 0, evening: 0, tab: 2, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Ryzodeg 70/30 FlexTouch Pen', salt: 'Insulin degludec 70% + insulin aspart 30%, 100 IU/ml — भोजन के साथ/के बाद भी लगा सकते हैं', doseOptions: ['0.2 IU/kg once daily with main meal (STARTER — titrate)', '0.2 IU/kg twice daily with meals (only if doctor advised)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    // Neuropathy / neurotropic
    { name: 'Nurokind Plus Tablet', salt: 'Methylcobalamin 1500 mcg + Alpha Lipoic Acid 100 mg + Pyridoxine + Folic Acid', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Maxgalin M 75 Tablet', salt: 'Pregabalin 75 mg + Methylcobalamin 750 mcg — ⚠ सावधानी: नींद/चक्कर आ सकते हैं; शुरुआती खुराकों में गाड़ी न चलाएं', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Maxgalin 75 Tablet', salt: 'Pregabalin 75 mg — ⚠ सावधानी: नींद/चक्कर आ सकते हैं; शुरुआती खुराकों में गाड़ी न चलाएं', doseOptions: ['1 tab at bedtime', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thiokind 150 Tablet', salt: 'Alpha Lipoic Acid 150 mg (antioxidant — nerve support)', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Cardio-renal protection — statins pregnancy 'avoid', RAAS blockers 'avoid'
    { name: 'Atorva 10 Tablet', salt: 'Atorvastatin 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atorva 20 Tablet', salt: 'Atorvastatin 20 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rosuvas 10 Tablet', salt: 'Rosuvastatin 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rosuvas 20 Tablet', salt: 'Rosuvastatin 20 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lipicard 160 Tablet', salt: 'Fenofibrate 160 mg — ट्राइग्लिसराइड घटाता है; गुर्दे की बीमारी में सावधानी', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ecosprin AV 75 Capsule', salt: 'Aspirin 75 mg + Atorvastatin 10 mg', doseOptions: ['1 cap after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ecosprin 75 Tablet', salt: 'Aspirin 75 mg (enteric coated)', doseOptions: ['1 tab after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Telma 40 Tablet', salt: 'Telmisartan 40 mg', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Telma AM Tablet', salt: 'Telmisartan 40 mg + Amlodipine 5 mg', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Losar 50 Tablet', salt: 'Losartan Potassium 50 mg', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Losar H Tablet', salt: 'Losartan 50 mg + Hydrochlorothiazide 12.5 mg', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlopres 5 Tablet', salt: 'Amlodipine 5 mg', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cardace 5 Tablet', salt: 'Ramipril 5 mg — खांसी आ सकती है; लगातार हो तो बताएं', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metolar XR 25 Tablet', salt: 'Metoprolol Succinate ER 25 mg — धड़कन नियंत्रण; अचानक बंद न करें', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dytor 10 Tablet', salt: 'Torsemide 10 mg (देर शाम से बचकर; पेशाब बढ़ाती है)', doseOptions: ['1 tab after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Vitamins / minerals
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'D-Rise 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'Vitamin B-Complex + Vitamin C', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Thyroid
    { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine 25 mcg — सुबह खाली पेट, भोजन से आधे घंटे पहले', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine 50 mcg — सुबह खाली पेट, भोजन से आधे घंटे पहले', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 75 mcg Tablet', salt: 'Levothyroxine 75 mcg — सुबह खाली पेट, भोजन से आधे घंटे पहले', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 100 mcg Tablet', salt: 'Levothyroxine 100 mcg — सुबह खाली पेट, भोजन से आधे घंटे पहले', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    // Hypoglycemia rescue & sick-day support
    { name: 'Glucon-D Powder', salt: 'Dextrose Monohydrate — तुरंत शुगर बढ़ाने के लिए (लो शुगर रेस्क्यू)', doseOptions: ['15-20 g (1-2 चम्मच) पानी में — लो शुगर पर तुरंत', 'आधा कप जूस/चीनी-पानी — विकल्प'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg (शुगर मरीजों में सुरक्षित दर्द/बुखार दवा)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Infection / skin / dental / ED / GI support
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Candid Cream 20g', salt: 'Clotrimazole 1% w/w cream (antifungal)', doseOptions: ['Apply thin layer 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Dusting Powder 100g', salt: 'Clotrimazole 1% w/w dusting powder — गीली जगह सूखी रखने के लिए', doseOptions: ['Dust lightly 2 times/day (सूखी त्वचा पर)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Hexidine 0.2% Mouthwash', salt: 'Chlorhexidine Gluconate 0.2% mouth rinse — निगलें नहीं', doseOptions: ['10 ml पानी में मिलाकर कुल्ला 2 बार/दिन'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Metrogyl DG Gel 30g', salt: 'Metronidazole 1% w/w dental gel — मसूड़ों पर लगाएं', doseOptions: ['Apply thin layer on gums 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Penegra 50 Tablet', salt: 'Sildenafil 50 mg — ⚠ नाइट्रेट (छाती दर्द) वाली दवा के साथ कभी नहीं; हार्ट जांच के बाद ही', doseOptions: ['1 tab about 1 hour before (max once daily)'], morning: 0, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Udiliv 300 Tablet', salt: 'Ursodeoxycholic Acid 300 mg', doseOptions: ['1 tab twice daily (after food)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (40) ════════════════════════════════════
  // DKA-SUSPECT deliberately has NO links — emergency referral, not OPD Rx.
  findingMeds: [
    // T2DM-NEW — metformin start + vitamin D support
    { findingKey: 'T2DM-NEW', medicineName: 'Glycomet 500 SR Tablet', dose: '1 tab after dinner', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'भोजन के साथ/बाद; दस्त-मतली हो तो बताएं' },
    { findingKey: 'T2DM-NEW', medicineName: 'Glycomet 500 Tablet', description: '1 tab BD after food — SR से दिक्कत हो तो विकल्प' },
    { findingKey: 'T2DM-NEW', medicineName: 'D-Rise 60K Sachet', description: '1 sachet weekly × 8 weeks (विटामिन D की कमी आम)' },
    // T2DM-STABLE — continuation + bone support
    { findingKey: 'T2DM-STABLE', medicineName: 'Glycomet 500 SR Tablet', description: 'फॉलो-अप; व्यक्तिगत HbA1c लक्ष्य <7' },
    { findingKey: 'T2DM-STABLE', medicineName: 'Shelcal 500 Tablet', description: '1 tab OD after food' },
    // T2DM-UNCTRL — step-up ladder
    { findingKey: 'T2DM-UNCTRL', medicineName: 'Glycomet GP 2 Tablet', description: '1 tab BD after food — भोजन न छोड़ें (लो शुगर खतरा)' },
    { findingKey: 'T2DM-UNCTRL', medicineName: 'Amaryl 1 Tablet', description: 'सुबह भोजन से पहले — मेटफॉर्मिन जारी रखते हुए जोड़ें' },
    { findingKey: 'T2DM-UNCTRL', medicineName: 'Forxiga 10 Tablet', description: 'पानी खूब पिएं; जननांग सफाई रखें' },
    // T2DM-NEURO — neurotropic course
    { findingKey: 'T2DM-NEURO', medicineName: 'Nurokind Plus Tablet', description: '1-0-1 × 30 days (after food)' },
    { findingKey: 'T2DM-NEURO', medicineName: 'Maxgalin M 75 Tablet', description: 'रात को सोने से पहले — नींद आना आम' },
    { findingKey: 'T2DM-NEURO', medicineName: 'Thiokind 150 Tablet', description: '1-0-1 × 30 days (after food)' },
    // T2DM-AUTONOMIC
    { findingKey: 'T2DM-AUTONOMIC', medicineName: 'Nurokind Plus Tablet', description: '1-0-1; धीरे-धीरे खड़े होने की आदत डालें' },
    // DIAB-FOOT-ULCER — refer; supportive only
    { findingKey: 'DIAB-FOOT-ULCER', medicineName: 'Augmentin 625 Tablet', description: 'संक्रमण में 1-0-1 × 5 days; घाव देखभाल व डॉक्टर रेफर आवश्यक' },
    { findingKey: 'DIAB-FOOT-ULCER', medicineName: 'Dolo 650 Tablet', description: 'दर्द में SOS (max 3/day)' },
    // T2DM-NEPHRO — renoprotection
    { findingKey: 'T2DM-NEPHRO', medicineName: 'Telma 40 Tablet', description: 'गुर्दे की रक्षा; BP लक्ष्य <130/80' },
    { findingKey: 'T2DM-NEPHRO', medicineName: 'Atorva 10 Tablet', description: 'कार्डियो-रेनल सुरक्षा; रात को' },
    // T2DM-RETINO — refer + BP control
    { findingKey: 'T2DM-RETINO', medicineName: 'Telma 40 Tablet', description: 'BP कड़ा नियंत्रण; नेत्र विशेषज्ञ को तुरंत रेफर करें' },
    // HYPO-EPI — rescue protocol
    { findingKey: 'HYPO-EPI', medicineName: 'Glucon-D Powder', description: '15-20 g तुरंत; 15 मिनट बाद दोबारा जांच (15-15 नियम)' },
    { findingKey: 'HYPO-EPI', medicineName: 'Electral Sachet (ORS)', description: 'बार-बार दौरे या बीमारी के दिन' },
    // T2DM-HTN
    { findingKey: 'T2DM-HTN', medicineName: 'Telma 40 Tablet', description: 'सुबह; BP लॉग देखें' },
    { findingKey: 'T2DM-HTN', medicineName: 'Telma AM Tablet', description: 'एक गोली में दोनों दवा — जरूरत पड़ने पर' },
    { findingKey: 'T2DM-HTN', medicineName: 'Losar 50 Tablet', description: 'विकल्प ब्रांड' },
    // T2DM-HYPOTHY
    { findingKey: 'T2DM-HYPOTHY', medicineName: 'Thyronorm 25 mcg Tablet', description: 'सुबह खाली पेट; 6-8 हफ्ते बाद TSH दोहराएं' },
    { findingKey: 'T2DM-HYPOTHY', medicineName: 'Thyronorm 50 mcg Tablet', description: 'खुराक TSH रिपोर्ट के अनुसार' },
    // PREDIABETES
    { findingKey: 'PREDIABETES', medicineName: 'Glycomet 500 SR Tablet', description: 'जीवनशैली बदलाव + उच्च जोखिम वालों में; 6 महीने में दोबारा जांच' },
    // DYSLIPIDEMIA
    { findingKey: 'DYSLIPIDEMIA', medicineName: 'Atorva 10 Tablet', description: 'रात को; LDL लक्ष्य <100' },
    { findingKey: 'DYSLIPIDEMIA', medicineName: 'Rosuvas 10 Tablet', description: 'विकल्प स्टेटिन' },
    { findingKey: 'DYSLIPIDEMIA', medicineName: 'Lipicard 160 Tablet', description: 'ट्राइग्लिसराइड बहुत ज्यादा होने पर' },
    // OBESITY-IR
    { findingKey: 'OBESITY-IR', medicineName: 'Glycomet 1000 SR Tablet', description: 'इंसुलिन प्रतिरोध में मददगार; डाइट+चाल के साथ' },
    // NAFLD
    { findingKey: 'NAFLD', medicineName: 'Udiliv 300 Tablet', description: '1-0-1 × 3 महीने; वजन घटाना मुख्य इलाज' },
    // PCOS-IR
    { findingKey: 'PCOS-IR', medicineName: 'Glycomet 500 SR Tablet', description: '1-0-1; गाइनो विशेषज्ञ की सलाह समेत' },
    // T1DM — insulin + refer
    { findingKey: 'T1DM', medicineName: 'Basalog One 100IU/ml Injection', description: 'रात की बेसल — डॉक्टर से खुराक तय; एंडोक्राइन रेफर आवश्यक' },
    { findingKey: 'T1DM', medicineName: 'Actrapid Penfill', description: 'भोजन से 30 मिनट पहले — बेसल-बोलस योजना' },
    // T2DM-SKIN-INF
    { findingKey: 'T2DM-SKIN-INF', medicineName: 'Augmentin 625 Tablet', description: '1-0-1 × 5 days (after food)' },
    { findingKey: 'T2DM-SKIN-INF', medicineName: 'Dolo 650 Tablet', description: 'बुखार/दर्द में SOS' },
    // GENITAL-CAND
    { findingKey: 'GENITAL-CAND', medicineName: 'Candid Cream 20g', description: 'पतली परत 2 बार/दिन × 2-4 हफ्ते; जगह सूखी रखें' },
    { findingKey: 'GENITAL-CAND', medicineName: 'Candid Dusting Powder 100g', description: 'सुखाने के लिए; सूती कपड़े पहनें' },
    // PERIO-DISEASE
    { findingKey: 'PERIO-DISEASE', medicineName: 'Hexidine 0.2% Mouthwash', description: '10 ml कुल्ला 2 बार/दिन — निगलें नहीं' },
    { findingKey: 'PERIO-DISEASE', medicineName: 'Metrogyl DG Gel 30g', description: 'मसूड़ों पर 2-3 बार/दिन; डेंटिस्ट रेफर' },
    // ED-DM
    { findingKey: 'ED-DM', medicineName: 'Penegra 50 Tablet', description: 'नाइट्रेट वाली दवा से बचें — हार्ट जांच के बाद ही' },
    // GDM — insulin only (pregnancy-safe); specialist care
    { findingKey: 'GDM', medicineName: 'Basalog One 100IU/ml Injection', description: 'गर्भावस्था में इंसुलिन सुरक्षित — विशेषज्ञ देखरेख में खुराक तय करें' },
  ],

  // ══ Table templates (7) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Sugar Log (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['तारीख', 'खाली पेट (FBS)', 'खाने के 2 घंटे बाद (PPBS)', 'टिप्पणी'],
      colsLabel: ['Date', 'Fasting (mg/dl)', 'Post-Meal (mg/dl)', 'Remarks'],
      footerLabel: ['लक्ष्य: FBS 80-130 · PPBS <180 mg/dl — लॉग डॉक्टर को दिखाएं / Target: FBS 80-130 · PPBS <180 mg/dl — show log to your doctor'],
    },
    {
      name: 'Insulin Titration Grid',
      rows: 8,
      cols: 5,
      headerLabel: ['तारीख', 'वर्तमान डोज (IU)', 'FBS (mg/dl)', 'PPBS (mg/dl)', 'बदलाव (डॉक्टर द्वारा)'],
      colsLabel: ['Date', 'Current Dose (IU)', 'FBS (mg/dl)', 'PPBS (mg/dl)', 'Adjustment (by doctor)'],
      footerLabel: ['डोज बदलाव हमेशा डॉक्टर की सलाह से — बदलाव के 3 दिन बाद शुगर जांचें / Dose changes only per doctor — recheck sugar 3 days after any change'],
    },
    {
      name: 'Foot Examination Checklist',
      rows: 6,
      cols: 3,
      headerLabel: ['जांच का बिंदु', 'दायां पैर', 'बायां पैर'],
      colsLabel: ['Examination Point', 'Right Foot', 'Left Foot'],
      footerLabel: ['बिंदु: पैर की नाड़ी · मोनोफिलामेंट संवेदना · त्वचा/दरारें · घाव · नाखून · पैर का आकार — हर महीने जांचें / Points: pedal pulses · monofilament sensation · skin/cracks · wounds · nails · deformity — check monthly'],
    },
    {
      name: 'Hypoglycemia Management Card',
      rows: 4,
      cols: 3,
      headerLabel: ['स्थिति', 'तुरंत क्या करें', 'फिर क्या करें'],
      colsLabel: ['Situation', 'Immediate Action', 'Then'],
      footerLabel: ['15-15 नियम: 15 g शुगर (4 ग्लूकोज टैब/1 चम्मच चीनी) → 15 मिनट रुकें → दोबारा चेक; बेहोश हो तो मुंह में कुछ न डालें — तुरंत अस्पताल / 15-15 rule: 15 g sugar (4 glucose tabs/1 tbsp sugar) → wait 15 min → recheck; if unconscious, nothing by mouth — hospital now'],
    },
    {
      name: 'Diet Chart (Indian Veg/Non-Veg)',
      rows: 6,
      cols: 3,
      headerLabel: ['समय', 'शाकाहारी विकल्प', 'मांसाहारी विकल्प'],
      colsLabel: ['Time', 'Vegetarian Option', 'Non-Vegetarian Option'],
      footerLabel: ['भोजन के 15-30 मिनट बाद टहलें · थाली: आधी सब्जी + चौथाई अनाज + चौथाई प्रोटीन / Walk 15-30 min after meals · plate: half vegetables + quarter cereal + quarter protein'],
    },
    {
      name: 'Sick-Day Rules (बीमारी के दिन)',
      rows: 5,
      cols: 3,
      headerLabel: ['लक्षण/स्थिति', 'क्या करें', 'कब तुरंत डॉक्टर'],
      colsLabel: ['Symptom/Situation', 'What To Do', 'When To Call Doctor'],
      footerLabel: ['इंसुलिन कभी बंद न करें · उल्टी-दस्त हों तो metformin रोकें और तुरंत संपर्क करें · हर 4 घंटे शुगर जांचें / Never stop insulin · if vomiting/diarrhoea, hold metformin and call doctor · check sugar every 4 hours'],
    },
    {
      name: 'Weight & Waist Tracker (8 weeks)',
      rows: 8,
      cols: 3,
      headerLabel: ['तारीख/सप्ताह', 'वजन (kg)', 'कमर (cm)'],
      colsLabel: ['Date/Week', 'Weight (kg)', 'Waist (cm)'],
      footerLabel: ['लक्ष्य कमर: पुरुष <90 cm · महिला <80 cm / Waist target: men <90 cm · women <80 cm'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'New T2DM — Standard Start',
      diagnosis: 'T2DM-NEW',
      medicines: [
        { name: 'Glycomet 500 SR Tablet', dose: '1 tab after dinner', duration: '30 days', instructions: 'भोजन के साथ/बाद; दस्त-मतली हो तो बताएं' },
        { name: 'D-Rise 60K Sachet', dose: '1 sachet weekly with milk', duration: '8 weeks', instructions: 'हफ्ते में 1 बार' },
      ],
      labs: ['HbA1c', 'FBS', 'PPBS', 'Lipid profile', 'Serum creatinine', 'Urine routine', 'LFT'],
      advice: 'रोज 30 मिनट तेज चाल · मीठा-तला बंद · थाली का आधा हिस्सा सब्जियां · 2 हफ्ते में शुगर लॉग लेकर मिलें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Uncontrolled T2DM — Step-Up',
      diagnosis: 'T2DM-UNCTRL',
      medicines: [
        { name: 'Glycomet GP 2 Tablet', dose: '1 tab after breakfast & dinner', duration: '30 days', instructions: 'भोजन कभी न छोड़ें — लो शुगर का खतरा; लक्षण हों तो तुरंत 1 चम्मच चीनी' },
        { name: 'Forxiga 10 Tablet', dose: '1 tab before breakfast', duration: '30 days', instructions: 'पानी खूब पिएं; जननांग की सफाई रखें; उल्टी/बीमारी में डॉक्टर को बताएं' },
      ],
      labs: ['HbA1c', 'FBS', 'PPBS', 'Serum creatinine'],
      advice: 'खाना कभी न छोड़ें (लो शुगर खतरा) · रोज 30 मिनट तेज चाल · 2 हफ्ते में FBS/PPBS लॉग लेकर मिलें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Painful Diabetic Neuropathy — Course',
      diagnosis: 'T2DM-NEURO',
      medicines: [
        { name: 'Nurokind Plus Tablet', dose: '1 tab twice daily (after food)', duration: '30 days', instructions: 'नियमित समय पर' },
        { name: 'Maxgalin M 75 Tablet', dose: '1 tab at bedtime', duration: '30 days', instructions: 'रात को सोने से 30 मिनट पहले; नींद/चक्कर हों तो बताएं; गाड़ी सावधानी से' },
        { name: 'Thiokind 150 Tablet', dose: '1 tab twice daily (after food)', duration: '30 days', instructions: 'भोजन के बाद' },
      ],
      labs: ['Vitamin B12', 'HbA1c'],
      advice: 'हर रात पैर जांचें (घाव/दरार) · घर में भी नंगे पैर न चलें · पैरों पर गर्म पानी सीधे न डालें',
      followUpDays: 21,
    },
    {
      name: 'Annual Complication Screen — T2DM',
      diagnosis: 'T2DM-STABLE',
      medicines: [
        { name: 'D-Rise 60K Sachet', dose: '1 sachet weekly with milk', duration: '8 weeks', instructions: 'हफ्ते में 1 बार' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab after food', duration: '90 days', instructions: 'भोजन के बाद' },
      ],
      labs: ['HbA1c', 'FBS', 'PPBS', 'Lipid profile', 'Serum creatinine', 'Urine ACR (microalbumin)', 'Urine routine', 'Vitamin B12', 'ECG', 'Fundus exam (नेत्र रेफर)'],
      advice: 'आंखों की रेटिना जांच (नेत्र विशेषज्ञ) · पैरों की पूरी जांच · दांतों/मसूड़ों की जांच — साल में 1 बार',
      followUpDays: 90,
      isCommon: true,
    },
    {
      name: 'Hypoglycemia Counseling + Rescue Plan',
      diagnosis: 'HYPO-EPI',
      medicines: [
        { name: 'Glucon-D Powder', dose: '15-20 g (1-2 चम्मच) पानी में', duration: 'SOS', instructions: 'लो शुगर लक्षण पर तुरंत; 15 मिनट बाद दोबारा चेक करें (15-15 नियम)' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water', duration: 'SOS', instructions: 'बीमारी/दस्त के दिन खूंट-खूंट पिएं' },
      ],
      labs: ['FBS', 'PPBS'],
      advice: '15-15 नियम: 15 g शुगर (4 ग्लूकोज टैब/1 चम्मच चीनी) → 15 मिनट रुकें → दोबारा चेक; ठीक न हो तो दोहराएं · जेब/बैग में हमेशा शुगर रखें · भोजन कभी न छोड़ें · बेहोशी हो तो मुंह में कुछ न डालें — तुरंत अस्पताल',
      followUpDays: 7,
    },
    {
      name: 'Insulin Initiation — Basal Start (T2DM)',
      diagnosis: 'T2DM-UNCTRL',
      medicines: [
        { name: 'Basalog One 100IU/ml Injection', dose: '0.1-0.2 IU/kg at bedtime (STARTER — titrate)', duration: 'as advised', instructions: 'रात के खाने के बाद एक ही समय पर; खुराक डॉक्टर ही बदलेंगे — खुद न बदलें; जगह बदल-बदल कर लगाएं' },
        { name: 'Glycomet 1000 SR Tablet', dose: '1 tab after dinner', duration: '30 days', instructions: 'भोजन के बाद जारी रखें' },
      ],
      labs: ['FBS', 'PPBS', 'HbA1c'],
      advice: 'इंसुलिन रोज लगाएं — बीमारी के दिन भी कभी बंद न करें · हर सुबह खाली पेट शुगर नोट करें · 7 दिन में अवश्य मिलें (खुराक समीक्षा) · जेब में शुगर रखें',
      followUpDays: 7,
    },
  ],
}
