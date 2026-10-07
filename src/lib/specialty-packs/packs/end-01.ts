/**
 * END-01 — ENDOCRINOLOGY STARTER PACK (T2)
 *
 * India endocrine OPD core: thyroid swelling/function, weight-obesity,
 * hormone screens (female/male), bone-calcium, and pituitary/adrenal
 * SUSPECT findings that are REFER-ONLY (zero medicines attached).
 *
 * Boundaries (deliberate):
 *   - Diabetes drugs live in DIA-01 — this pack only SCREENS + coordinates.
 *   - PCOS drugs, menopause HT, GH/puberty drugs: NOT here (OBG /
 *     ped-endocrine referral lines instead).
 *   - Neomercazole / Caberlin are CONTINUATION-ONLY (specialist-started).
 *   - Thyroxine protocol (empty stomach 45-60 min before breakfast,
 *     4-hr gap from calcium/iron, same brand, TSH recheck 6-8 weeks
 *     after any dose change) is repeated in every relevant salt + advice.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India endocrine core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * Sources: standard Indian endocrine OPD practice, thyroid titration
 * conventions adapted for Indian labs/brands, existing GP-01 seeds for
 * field conventions.
 */

import type { SpecialtyPack } from '../types'

export const END01_PACK: SpecialtyPack = {
  meta: {
    code: 'END-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Endocrinology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'India endocrine OPD core (thyroid/weight/bone) · Thyronorm levothyroxine protocol · DIA-01/OBG/URO/ped-endocrine coordination · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'THY', name: 'थायराइड', nameEn: 'Thyroid' },
    { key: 'WT', name: 'वजन-मोटापा', nameEn: 'Weight & Obesity' },
    { key: 'HRM', name: 'हार्मोन — महिला', nameEn: 'Hormones — Female' },
    { key: 'HRM-M', name: 'पुरुष-हार्मोन', nameEn: 'Hormones — Male' },
    { key: 'BON', name: 'हड्डी-कैल्शियम', nameEn: 'Bone & Calcium' },
    { key: 'OTH', name: 'अन्य', nameEn: 'Others' },
  ],

  // ══ Complaints (43) ═══════════════════════════════════════════════════
  complaints: [
    // THY — Thyroid
    { code: 'THY01', categoryKey: 'THY', detail: 'गर्दन में थायरॉइड की सूजन (गॉइटर)', detailEn: 'Thyroid Swelling in Neck (Goitre)' },
    { code: 'THY02', categoryKey: 'THY', detail: 'गर्दन की सूजन + निगलने में दिक्कत (दबाव संदेह)', detailEn: 'Neck Swelling with Swallowing Difficulty (Compressive)' },
    { code: 'THY03', categoryKey: 'THY', detail: 'वजन बढ़ना साथ में थकान-कमजोरी', detailEn: 'Weight Gain with Tiredness (Hypothyroid Screen)' },
    { code: 'THY04', categoryKey: 'THY', detail: 'हमेशा ठंड लगना और वजन बढ़ना', detailEn: 'Always Feeling Cold with Weight Gain' },
    { code: 'THY05', categoryKey: 'THY', detail: 'बाल झड़ना साथ में थकान', detailEn: 'Hair Fall with Tiredness (Thyroid Screen)' },
    { code: 'THY06', categoryKey: 'THY', detail: 'थायरॉइड की कमी नई पाई गई — दवा शुरू', detailEn: 'Newly Diagnosed Hypothyroidism — Medicine Started' },
    { code: 'THY07', categoryKey: 'THY', detail: 'थायरॉइड की दवा चल रही — खुराक समीक्षा', detailEn: 'On Thyroid Medicine — Dose Review (Follow-up)' },
    { code: 'THY08', categoryKey: 'THY', detail: 'गर्मी लगना, वजन घटना, धड़कन तेज', detailEn: 'Feeling Hot, Weight Loss, Palpitations (Hyperthyroid Screen)' },
    { code: 'THY09', categoryKey: 'THY', detail: 'थायरॉइड बढ़ा हुआ — इलाज चल रहा, फॉलो-अप', detailEn: 'Hyperthyroid on Treatment — Follow-up' },
    { code: 'THY10', categoryKey: 'THY', detail: 'आंखें बाहर निकल आईं (उभरी आंखें)', detailEn: 'Bulging Eyes (Graves Orbitopathy)' },
    { code: 'THY11', categoryKey: 'THY', detail: 'बाहर की लैब की थायरॉइड रिपोर्ट — रिव्यू', detailEn: 'Outside-Lab Thyroid Report — Review (TSH Interpretation)' },
    { code: 'THY12', categoryKey: 'THY', detail: 'थायरॉइड ऑपरेशन के बाद झनझनाहट/सुन्नपन (कैल्शियम)', detailEn: 'Tingling after Thyroid Surgery (Hypocalcemia)' },
    { code: 'THY13', categoryKey: 'THY', detail: 'गर्दन में ठोस, स्थिर गांठ', detailEn: 'Hard Fixed Neck Lump (Malignancy Screen)' },
    { code: 'THY14', categoryKey: 'THY', detail: 'थायरॉइड कैंसर का ऑपरेशन हुआ — फॉलो-अप', detailEn: 'Operated for Thyroid Cancer — Follow-up' },
    { code: 'THY15', categoryKey: 'THY', detail: 'सामान्य गॉइटर — नियमित फॉलो-अप', detailEn: 'Simple Goitre — Routine Follow-up' },
    // WT — Weight & Obesity
    { code: 'WT01', categoryKey: 'WT', detail: 'मोटापा — वजन घटाने का परामर्श', detailEn: 'Overweight / Obesity — Consult' },
    { code: 'WT02', categoryKey: 'WT', detail: 'डाइट करने पर भी वजन नहीं घटता', detailEn: 'Cannot Lose Weight Despite Dieting' },
    { code: 'WT03', categoryKey: 'WT', detail: 'मोटापा + गर्दन पर काले धब्बे', detailEn: 'Obesity with Dark Neck Patches (Acanthosis)' },
    { code: 'WT04', categoryKey: 'WT', detail: 'बच्चे का मोटापा — परामर्श', detailEn: 'Childhood Obesity — Consult' },
    { code: 'WT05', categoryKey: 'WT', detail: 'रात में खाना + तनाव से मोटापा', detailEn: 'Night Eating + Stress Obesity' },
    { code: 'WT06', categoryKey: 'WT', detail: 'डिलीवरी के बाद वजन बढ़ा', detailEn: 'Weight Gain after Pregnancy' },
    // HRM — Hormones (Female)
    { code: 'HRM01', categoryKey: 'HRM', detail: 'अनियमित पीरियड्स और वजन बढ़ना (PCOS जांच)', detailEn: 'Irregular Periods with Weight Gain (PCOS Screen)' },
    { code: 'HRM02', categoryKey: 'HRM', detail: 'चेहरे पर ज्यादा बाल आना (हर्सुटिज्म)', detailEn: 'Excess Facial Hair Growth (Hirsutism)' },
    { code: 'HRM03', categoryKey: 'HRM', detail: 'स्तन से दूध जैसा स्राव (गैलेक्टोरिया)', detailEn: 'Milky Breast Discharge (Galactorrhea)' },
    { code: 'HRM04', categoryKey: 'HRM', detail: 'बच्चा नहीं हो रहा — थायरॉइड की समस्या साथ', detailEn: 'Infertility with Thyroid Problem' },
    { code: 'HRM05', categoryKey: 'HRM', detail: 'गर्भावस्था में थायरॉइड — देखरेख', detailEn: 'Thyroid in Pregnancy — Coordination' },
    { code: 'HRM06', categoryKey: 'HRM', detail: 'मेनोपॉज़ (रजोनिवृत्ति) के लक्षण', detailEn: 'Menopause Symptoms — Consult' },
    // HRM-M — Hormones (Male)
    { code: 'HRM-M01', categoryKey: 'HRM-M', detail: 'पुरुषों में स्तन बढ़ जाना (गाइनेकोमेस्टिया)', detailEn: 'Male Breast Enlargement (Gynecomastia)' },
    { code: 'HRM-M02', categoryKey: 'HRM-M', detail: 'नामर्दी + इच्छा कम (टेस्टोस्टेरोन जांच)', detailEn: 'Impotence with Low Desire (Low-T Screen)' },
    // BON — Bone & Calcium
    { code: 'BON01', categoryKey: 'BON', detail: 'विटामिन D की कमी — फॉलो-अप', detailEn: 'Vitamin D Deficiency — Follow-up' },
    { code: 'BON02', categoryKey: 'BON', detail: 'हड्डियों का दर्द + पथरी (हाइपरपैराथायरॉइड जांच)', detailEn: 'Bone Pain with Kidney Stones (Hyperparathyroid Screen)' },
    { code: 'BON03', categoryKey: 'BON', detail: 'रिपोर्ट में कैल्शियम ज्यादा — रिव्यू', detailEn: 'High Calcium on Report — Workup' },
    // OTH — Others
    { code: 'OTH01', categoryKey: 'OTH', detail: 'बहुत प्यास + बार-बार पेशाब (शुगर जांच)', detailEn: 'Excessive Thirst + Urination (Diabetes Screen)' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'शुगर कम होने के दौरे', detailEn: 'Low Blood Sugar Episodes (Hypoglycemia)' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'बार-बार पसीने/गर्मी के दौरे', detailEn: 'Recurrent Sweating / Hot Episodes (Workup)' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'उच्च BP + शरीर पर बैंगनी लकीरें (कुशिंग जांच)', detailEn: 'High BP with Purple Stretch Marks (Cushing Screen)' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'बहुत थकान + नीचा BP + चक्कर (एड्रेनल जांच)', detailEn: 'Extreme Tiredness + Low BP + Dizziness (Adrenal Screen)' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'बच्चा बौना — उम्र से कम लंबाई', detailEn: 'Child with Short Stature (Growth Screen)' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'बच्चा असामान्य रूप से लंबा', detailEn: 'Unusually Tall Child' },
    { code: 'OTH08', categoryKey: 'OTH', detail: 'किशोरावस्था (प्यूबर्टी) देर से', detailEn: 'Delayed Puberty' },
    { code: 'OTH09', categoryKey: 'OTH', detail: 'बच्चे में जल्दी प्यूबर्टी के लक्षण', detailEn: 'Early Puberty in Child (Precocious)' },
    { code: 'OTH10', categoryKey: 'OTH', detail: 'पिट्यूटरी एडिनोमा पहले से — फॉलो-अप', detailEn: 'Known Pituitary Adenoma — Follow-up' },
    { code: 'OTH11', categoryKey: 'OTH', detail: 'ट्रांसजेंडर हार्मोन थेरेपी — परामर्श', detailEn: 'Transgender Hormone Therapy — Consult' },
  ],

  // ══ Questions (96 — 2-3 per complaint) ════════════════════════════════
  // questionIndex order below MUST match this array order.
  // The trailing `// idx N` comment is the TRUE 0-based array index — keep in sync.
  questions: [
    // THY01 Goitre
    { complaintCode: 'THY01', question: 'गर्दन में सूजन कितने समय से है?', questionEn: 'Since when is the neck swelling present?' }, // idx 0
    { complaintCode: 'THY01', question: 'निगलने या लेटने में कोई दिक्कत है?', questionEn: 'Any difficulty in swallowing or while lying down?' }, // idx 1
    // THY02 Compressive goitre
    { complaintCode: 'THY02', question: 'निगलने में दिक्कत कितने दिनों से है?', questionEn: 'Since how many days is swallowing difficult?' }, // idx 2
    { complaintCode: 'THY02', question: 'आवाज़ में बदलाव या सांस लेने में खर्राह भी है?', questionEn: 'Any voice change or noisy breathing too?' }, // idx 3
    // THY03 Weight gain + tiredness
    { complaintCode: 'THY03', question: 'थकान और वजन बढ़ना कितने महीनों से है?', questionEn: 'Since how many months are the tiredness and weight gain?' }, // idx 4
    { complaintCode: 'THY03', question: 'पिछले 3 महीनों में कितना वजन बढ़ा (kg)?', questionEn: 'How much weight gained in the last 3 months (kg)?' }, // idx 5
    { complaintCode: 'THY03', question: 'TSH जांच कराई है — रिपोर्ट साथ लाये हैं?', questionEn: 'Has a TSH test been done — report brought along?' }, // idx 6
    // THY04 Cold + weight gain
    { complaintCode: 'THY04', question: 'ठंड कितने समय से दूसरों से ज्यादा लगती है?', questionEn: 'Since when do you feel cold more than others?' }, // idx 7
    { complaintCode: 'THY04', question: 'कब्ज या बहुत भारी पीरियड्स भी साथ है?', questionEn: 'Constipation or very heavy periods also present?' }, // idx 8
    // THY05 Hair fall
    { complaintCode: 'THY05', question: 'बाल कितने महीनों से झड़ रहे हैं?', questionEn: 'Since how many months is the hair falling?' }, // idx 9
    { complaintCode: 'THY05', question: 'साथ में थकान, वजन बदलाव या पीरियड्स अनियमित?', questionEn: 'Along with it — tiredness, weight change or irregular periods?' }, // idx 10
    // THY06 Newly diagnosed hypothyroid
    { complaintCode: 'THY06', question: 'शुरू की गई दवा कौन सी है — कितने mcg की?', questionEn: 'Which medicine has been started — how many mcg?' }, // idx 11
    { complaintCode: 'THY06', question: 'दवा सुबह खाली पेट नाश्ते से 45-60 मिनट पहले ले रहे हैं?', questionEn: 'Taking the medicine empty stomach 45-60 minutes before breakfast?' }, // idx 12
    { complaintCode: 'THY06', question: 'दवा शुरू हुए कितने हफ्ते हो गए?', questionEn: 'How many weeks since the medicine was started?' }, // idx 13
    // THY07 Hypothyroid follow-up
    { complaintCode: 'THY07', question: 'अभी कौन सी खुराक चल रही है — कितने mcg (ब्रांड सहित)?', questionEn: 'What dose are you on — how many mcg (with brand name)?' }, // idx 14
    { complaintCode: 'THY07', question: 'पिछली TSH रिपोर्ट का मान और तारीख क्या थी?', questionEn: 'What was the last TSH value and its date?' }, // idx 15
    { complaintCode: 'THY07', question: 'दवा रोज एक ही समय खाली पेट — कैल्शियम/आयरन साथ तो नहीं?', questionEn: 'Medicine daily same time empty stomach — not along with calcium/iron?' }, // idx 16
    // THY08 Hyperthyroid screen
    { complaintCode: 'THY08', question: 'धड़कन तेज कितने समय से — दिन में कितनी बार महसूस होती है?', questionEn: 'Since when fast palpitations — how many times a day felt?' }, // idx 17
    { complaintCode: 'THY08', question: 'कितने महीनों में कितना वजन घटा?', questionEn: 'How much weight lost over how many months?' }, // idx 18
    { complaintCode: 'THY08', question: 'हाथ कांपते हैं या पसीना/गर्मी ज्यादा लगती है?', questionEn: 'Do hands tremble or excess sweating/heat feeling?' }, // idx 19
    // THY09 Hyperthyroid follow-up
    { complaintCode: 'THY09', question: 'कौन सी दवा और कितनी खुराक चल रही है?', questionEn: 'Which medicine and what dose are you currently on?' }, // idx 20
    { complaintCode: 'THY09', question: 'पिछली थायरॉइड जांच (TFT) कब हुई थी?', questionEn: 'When was the last thyroid function test (TFT) done?' }, // idx 21
    // THY10 Graves orbitopathy
    { complaintCode: 'THY10', question: 'आंखों में रेत-सी जलन या आंखें बाहर निकलना कब से?', questionEn: 'Since when gritty irritation in eyes or bulging appearance?' }, // idx 22
    { complaintCode: 'THY10', question: 'पहले से थायरॉइड की समस्या या दवा चल रही है?', questionEn: 'Known thyroid problem before or on thyroid medicine?' }, // idx 23
    // THY11 Outside report review
    { complaintCode: 'THY11', question: 'रिपोर्ट में कौन सी जांच है — केवल TSH या T3/T4 सहित?', questionEn: 'Which test is in the report — only TSH or with T3/T4?' }, // idx 24
    { complaintCode: 'THY11', question: 'TSH का मान कितना आया है?', questionEn: 'What is the TSH value in the report?' }, // idx 25
    { complaintCode: 'THY11', question: 'कोई दवा चल रही है — परिवार में थायरॉइड किसी को?', questionEn: 'Any medicine ongoing — any family member with thyroid problem?' }, // idx 26
    // THY12 Post-op hypocalcemia
    { complaintCode: 'THY12', question: 'थायरॉइड ऑपरेशन को कितना समय हुआ और झनझनाहट कब से है?', questionEn: 'How long since thyroid surgery and since when the tingling?' }, // idx 27
    { complaintCode: 'THY12', question: 'होंठ/उंगलियों के पास सुन्नपन या हाथ-पैर में मरोड़?', questionEn: 'Numbness around lips/fingers or cramps in hands and feet?' }, // idx 28
    // THY13 Hard fixed lump
    { complaintCode: 'THY13', question: 'गांठ कितने दिनों से है — छूने पर कैसी लगती है?', questionEn: 'Since how many days the lump — how does it feel on touch?' }, // idx 29
    { complaintCode: 'THY13', question: 'आवाज़ बैठ गई है या गले में लगातार दर्द है?', questionEn: 'Has voice become hoarse or persistent throat pain?' }, // idx 30
    // THY14 Thyroid cancer follow-up
    { complaintCode: 'THY14', question: 'ऑपरेशन को कितना समय हुआ — अभी कौन सी दवा चल रही है?', questionEn: 'How long since the operation — which medicine ongoing now?' }, // idx 31
    { complaintCode: 'THY14', question: 'गर्दन में कोई गांठ वापस आई — thyroglobulin जांच होती है?', questionEn: 'Any lump back in neck — is thyroglobulin test being done?' }, // idx 32
    // THY15 Simple goitre follow-up
    { complaintCode: 'THY15', question: 'सूजन में कोई बदलाव — बढ़ी है या वैसी ही है?', questionEn: 'Any change in the swelling — increased or same?' }, // idx 33
    { complaintCode: 'THY15', question: 'पिछला गर्दन का अल्ट्रासाउंड कब हुआ था?', questionEn: 'When was the last neck ultrasound done?' }, // idx 34
    // WT01 Obesity consult
    { complaintCode: 'WT01', question: 'कल का पूरा खान-पान याद करें — क्या-क्या खाया था?', questionEn: 'Recall the full diet of yesterday — what all was eaten?' }, // idx 35
    { complaintCode: 'WT01', question: 'रोज कितने मिनट चलते हैं या व्यायाम करते हैं?', questionEn: 'How many minutes daily do you walk or exercise?' }, // idx 36
    { complaintCode: 'WT01', question: 'मीठे पेय (चीनी वाली चाय/कोल्ड ड्रिंक/जूस) दिन में कितनी बार?', questionEn: 'Sugary drinks (sugar tea/cold drinks/juice) how many times a day?' }, // idx 37
    // WT02 Cannot lose weight
    { complaintCode: 'WT02', question: 'डाइट/व्यायाम कितने महीनों से कर रहे हैं?', questionEn: 'Since how many months are you dieting/exercising?' }, // idx 38
    { complaintCode: 'WT02', question: 'रात की नींद कितने घंटे की और दिनभर थकान रहती है?', questionEn: 'How many hours of night sleep and daytime tiredness?' }, // idx 39
    // WT03 Acanthosis
    { complaintCode: 'WT03', question: 'गर्दन/कांख पर काले मखमली धब्बे कब से हैं?', questionEn: 'Since when the dark velvety patches on neck/armpits?' }, // idx 40
    { complaintCode: 'WT03', question: 'परिवार में शुगर की बीमारी किसी को है?', questionEn: 'Anyone in the family with diabetes?' }, // idx 41
    { complaintCode: 'WT03', question: 'खाने के तुरंत बाद भी भूख लगती है?', questionEn: 'Do you feel hungry even right after meals?' }, // idx 42
    // WT04 Childhood obesity
    { complaintCode: 'WT04', question: 'बच्चे की उम्र क्या है — दिन में कितनी देर स्क्रीन पर?', questionEn: 'What is the age of the child — how much screen time daily?' }, // idx 43
    { complaintCode: 'WT04', question: 'घर के खाने में क्या बदलाव किए जा सकते हैं?', questionEn: 'What changes can be made in the home food?' }, // idx 44
    // WT05 Night eating
    { complaintCode: 'WT05', question: 'रात का खाना कब होता है — सोते समय फिर भूख जगती है?', questionEn: 'When is dinner — does hunger return at bedtime?' }, // idx 45
    { complaintCode: 'WT05', question: 'तनाव बढ़ने पर खाना बढ़ जाता है?', questionEn: 'Does eating increase when stress increases?' }, // idx 46
    // WT06 Post-partum weight
    { complaintCode: 'WT06', question: 'डिलीवरी को कितना समय हुआ — अभी वजन कितना है?', questionEn: 'How long since delivery — what is the current weight?' }, // idx 47
    { complaintCode: 'WT06', question: 'स्तनपान करा रही हैं — नींद कैसी है?', questionEn: 'Are you breastfeeding — how is the sleep?' }, // idx 48
    // HRM01 PCOS screen
    { complaintCode: 'HRM01', question: 'पीरियड्स कितने महीनों से अनियमित हैं?', questionEn: 'Since how many months are the periods irregular?' }, // idx 49
    { complaintCode: 'HRM01', question: 'चेहरे पर बाल या मुंहासे भी बढ़े हैं?', questionEn: 'Facial hair or acne also increased?' }, // idx 50
    // HRM02 Hirsutism
    { complaintCode: 'HRM02', question: 'चेहरे/ठुड्डी पर बाल कब से बढ़ रहे हैं?', questionEn: 'Since when is hair on face/chin increasing?' }, // idx 51
    { complaintCode: 'HRM02', question: 'पीरियड्स नियमित हैं — कोई दवा ले रही हैं?', questionEn: 'Are periods regular — taking any medicine?' }, // idx 52
    // HRM03 Galactorrhea
    { complaintCode: 'HRM03', question: 'स्तन से स्राव कब से — एक तरफ या दोनों?', questionEn: 'Breast discharge since when — one side or both?' }, // idx 53
    { complaintCode: 'HRM03', question: 'कोई दवा चल रही है (पाचक/मतली/माइग्रेन/मानसिक)?', questionEn: 'Any ongoing medicine (digestive/nausea/migraine/psychiatric)?' }, // idx 54
    // HRM04 Infertility + thyroid
    { complaintCode: 'HRM04', question: 'कितने समय से प्रयास चल रहा है — थायरॉइड की क्या समस्या है?', questionEn: 'Since how long trying — what is the thyroid problem?' }, // idx 55
    { complaintCode: 'HRM04', question: 'TSH रिपोर्ट का मान क्या है — दवा चल रही है?', questionEn: 'What is the TSH value — on any medicine?' }, // idx 56
    // HRM05 Pregnancy + thyroid
    { complaintCode: 'HRM05', question: 'गर्भ कितने महीने का है — कौन सी थायरॉइड दवा चल रही है?', questionEn: 'How many months pregnant — which thyroid medicine ongoing?' }, // idx 57
    { complaintCode: 'HRM05', question: 'गर्भावस्था में TSH कब जांचा — खुराक बढ़ाई गई थी?', questionEn: 'When was TSH tested in pregnancy — was the dose increased?' }, // idx 58
    // HRM06 Menopause
    { complaintCode: 'HRM06', question: 'पीरियड्स रुक गए या अनियमित — कब से?', questionEn: 'Periods stopped or irregular — since when?' }, // idx 59
    { complaintCode: 'HRM06', question: 'गर्मी की लहरें, रात का पसीना या नींद/मूड में बदलाव?', questionEn: 'Hot flushes, night sweats or sleep/mood changes?' }, // idx 60
    // HRM-M01 Gynecomastia
    { complaintCode: 'HRM-M01', question: 'स्तन एक तरफ बढ़ा या दोनों — दर्द या गांठ है?', questionEn: 'Breast enlarged one side or both — any pain or lump?' }, // idx 61
    { complaintCode: 'HRM-M01', question: 'उम्र क्या है — कोई दवा या जिम की स्टेरॉइड ले रहे हैं?', questionEn: 'What is the age — any medicine or gym steroids being taken?' }, // idx 62
    // HRM-M02 Low-T screen
    { complaintCode: 'HRM-M02', question: 'समस्या कितने महीनों से है — सुबह की इच्छा कम हुई?', questionEn: 'Since how many months the problem — morning desire reduced?' }, // idx 63
    { complaintCode: 'HRM-M02', question: 'कोई दवा (BP/शुगर/मानसिक) चल रही है?', questionEn: 'Any ongoing medicine (BP/sugar/psychiatric)?' }, // idx 64
    // BON01 Vitamin D follow-up
    { complaintCode: 'BON01', question: 'विटामिन D की कौन सी दवा — कितने समय से चल रही है?', questionEn: 'Which vitamin D medicine — since how long?' }, // idx 65
    { complaintCode: 'BON01', question: 'हफ्ते में कितने दिन धूप में निकलते हैं — कितने मिनट?', questionEn: 'How many days a week in the sun — for how many minutes?' }, // idx 66
    { complaintCode: 'BON01', question: 'हड्डियों/मांसपेशियों का दर्द कितना कम हुआ?', questionEn: 'How much has the bone/muscle pain reduced?' }, // idx 67
    // BON02 Bone pain + stones
    { complaintCode: 'BON02', question: 'पथरी कब आई — अब तक कितनी बार हुई?', questionEn: 'When did the stone occur — how many episodes so far?' }, // idx 68
    { complaintCode: 'BON02', question: 'हड्डियों में दर्द कहां-कहां है — कमर/पीठ भी?', questionEn: 'Where is the bone pain — back also?' }, // idx 69
    // BON03 High calcium report
    { complaintCode: 'BON03', question: 'कैल्शियम का मान कितना था — कब और कितनी बार जांच हुई?', questionEn: 'What was the calcium value — when and how many times tested?' }, // idx 70
    { complaintCode: 'BON03', question: 'लक्षण — कब्ज, बार-बार पेशाब, उल्टी या पथरी?', questionEn: 'Symptoms — constipation, frequent urination, vomiting or stones?' }, // idx 71
    // OTH01 Diabetes screen
    { complaintCode: 'OTH01', question: 'प्यास और पेशाब कितने हफ्तों से ज्यादा लगते हैं?', questionEn: 'Since how many weeks excess thirst and urination?' }, // idx 72
    { complaintCode: 'OTH01', question: 'वजन घटा या थकान भी है — शुगर जांच कराई है?', questionEn: 'Weight loss or tiredness — any sugar test done?' }, // idx 73
    // OTH02 Hypoglycemia
    { complaintCode: 'OTH02', question: 'कम शुगर के दौरे कब आते हैं — खाली पेट या दवा के बाद?', questionEn: 'When do low-sugar episodes come — empty stomach or after medicine?' }, // idx 74
    { complaintCode: 'OTH02', question: 'कौन सी शुगर की दवा चल रही है?', questionEn: 'Which sugar medicine are you currently on?' }, // idx 75
    { complaintCode: 'OTH02', question: 'दौरे में क्या होता है — पसीना, कांपन, भूख या चक्कर?', questionEn: 'What happens in an episode — sweating, shaking, hunger or giddiness?' }, // idx 76
    // OTH03 Sweating episodes
    { complaintCode: 'OTH03', question: 'पसीने/गर्मी के दौरे कितने समय से — दिन में कितनी बार?', questionEn: 'Sweating/hot episodes since when — how many times a day?' }, // idx 77
    { complaintCode: 'OTH03', question: 'सिरदर्द, धड़कन, चेहरा लाल होना साथ है — BP कैसा रहता है?', questionEn: 'Headache, palpitations, facial flushing along — how is the BP?' }, // idx 78
    // OTH04 Cushing screen
    { complaintCode: 'OTH04', question: 'BP कितने समय से उच्च है — कौन सी दवा चल रही है?', questionEn: 'Since when BP is high — which medicine ongoing?' }, // idx 79
    { complaintCode: 'OTH04', question: 'पेट/जांघ पर बैंगनी या सफेद लकीरें कब से हैं?', questionEn: 'Since when purple or white stretch marks on abdomen/thighs?' }, // idx 80
    // OTH05 Adrenal insufficiency screen
    { complaintCode: 'OTH05', question: 'थकान सुबह ज्यादा या शाम को?', questionEn: 'Tiredness worse in the morning or evening?' }, // idx 81
    { complaintCode: 'OTH05', question: 'कभी स्टेरॉइड दवा या जिम की स्टेरॉइड ली है — कितने समय?', questionEn: 'Ever taken steroid medicine or gym steroids — for how long?' }, // idx 82
    { complaintCode: 'OTH05', question: 'बिना वजह वजन घटा या त्वचा काली पड़ी है?', questionEn: 'Unexplained weight loss or skin darkening?' }, // idx 83
    // OTH06 Short stature
    { complaintCode: 'OTH06', question: 'बच्चे की उम्र और लंबाई — माता-पिता की लंबाई क्या है?', questionEn: 'Child age and height — what are the parents heights?' }, // idx 84
    { complaintCode: 'OTH06', question: 'एक साल में लंबाई कितनी बढ़ती है — कपड़े ढीले पड़ते हैं?', questionEn: 'How much height gain in a year — clothes becoming loose?' }, // idx 85
    // OTH07 Tall child
    { complaintCode: 'OTH07', question: 'बच्चा माता-पिता से कितना लंबा — लंबाई अचानक तेजी से बढ़ी?', questionEn: 'How much taller than parents — height shot up suddenly?' }, // idx 86
    { complaintCode: 'OTH07', question: 'हड्डी की उम्र (bone age) की जांच हुई है?', questionEn: 'Has bone age X-ray been done?' }, // idx 87
    // OTH08 Delayed puberty
    { complaintCode: 'OTH08', question: 'उम्र क्या है — अब तक कौन से संकेत नहीं दिखे?', questionEn: 'What is the age — which signs have not appeared yet?' }, // idx 88
    { complaintCode: 'OTH08', question: 'शरीर की गंध या बाल शुरू हुए हैं या बिल्कुल नहीं?', questionEn: 'Body odor or hair started, or nothing at all?' }, // idx 89
    // OTH09 Early puberty
    { complaintCode: 'OTH09', question: 'लक्षण किस उम्र में शुरू हुए — छाती, बाल या तेज लंबाई?', questionEn: 'At what age did signs start — breast, hair or rapid height?' }, // idx 90
    { complaintCode: 'OTH09', question: 'पहले डॉक्टर को दिखाया है — कोई जांच हुई?', questionEn: 'Shown to a doctor before — any tests done?' }, // idx 91
    // OTH10 Pituitary follow-up
    { complaintCode: 'OTH10', question: 'कौन सी दवा चल रही है — आखिरी MRI कब हुई?', questionEn: 'Which medicine ongoing — when was the last MRI?' }, // idx 92
    { complaintCode: 'OTH10', question: 'सिरदर्द, नजर या स्त्रण-स्राव में कोई बदलाव?', questionEn: 'Any change in headache, vision or breast discharge?' }, // idx 93
    // OTH11 Transgender consult
    { complaintCode: 'OTH11', question: 'पहले किसी एंडोक्राइन विशेषज्ञ से परामर्श किया है?', questionEn: 'Have you consulted an endocrinology specialist before?' }, // idx 94
    { complaintCode: 'OTH11', question: 'कोई हार्मोन दवा चल रही है या शुरू करने की योजना है?', questionEn: 'Any hormone medicine ongoing or a plan to start?' }, // idx 95
  ],

  // ══ Suggestions (192 — 2 per question; questionIndex matches above) ══
  suggestions: [
    // THY01 q0
    { questionIndex: 0, text: '6 महीने से ज्यादा पुरानी सूजन — TSH + गर्दन अल्ट्रासाउंड कराएं', textEn: 'Swelling over 6 months — get TSH + neck ultrasound' },
    { questionIndex: 0, text: 'हाल में देखी सूजन — आम है, फिर भी TSH जांच जरूरी', textEn: 'Recently noticed swelling — common, still get TSH tested' },
    // THY01 q1
    { questionIndex: 1, text: 'निगलने/लेटने में दिक्कत — तुरंत दिखाएं, दबाव-मूल्यांकन चाहिए', textEn: 'Trouble swallowing/lying — show immediately, needs compression evaluation' },
    { questionIndex: 1, text: 'बिना दबाव-लक्षण — 6-12 महीने में अल्ट्रासाउंड दोहराते रहें', textEn: 'No pressure symptoms — keep repeating ultrasound every 6-12 months' },
    // THY02 q2
    { questionIndex: 2, text: 'निगलने में दिक्कत बढ़ रही — शीघ्र सर्जन/एंडोक्राइन मूल्यांकन जरूरी', textEn: 'Worsening swallow — needs prompt surgeon/endocrine evaluation' },
    { questionIndex: 2, text: 'ठोस खाने में ज्यादा दिक्कत — जल्द जांच कराएं, रेफर की जा सकती है', textEn: 'More trouble with solids — get early evaluation, may need referral' },
    // THY02 q3
    { questionIndex: 3, text: 'आवाज़ बदलना/सांस की खर्राह — तुरंत रेफर (दबाव या गांठ जांच)', textEn: 'Voice change/noisy breathing — refer now (compression or nodule workup)' },
    { questionIndex: 3, text: 'केवल लेटने पर भारीपन — जांच कराएं, सिर ऊंचा रखकर सोएं', textEn: 'Heaviness only on lying — get evaluated, sleep with head elevated' },
    // THY03 q4
    { questionIndex: 4, text: '3+ महीने की थकान-वजन — TSH और CBC जांच कराएं', textEn: '3+ months tiredness-weight — test TSH and CBC' },
    { questionIndex: 4, text: 'हाल की बीमारी/तनाव के बाद — आहार+नींद, फिर भी TSH कराएं', textEn: 'After recent illness/stress — diet+sleep, still test TSH' },
    // THY03 q5
    { questionIndex: 5, text: '3 महीने में 3-4 kg+ बढ़ा — थायरॉइड जांच जरूरी', textEn: '3-4 kg+ gain in 3 months — thyroid test needed' },
    { questionIndex: 5, text: 'बहुत तेज वजन बढ़ा — शुगर भी जांचें, तरल-सूजन निकालें', textEn: 'Very rapid gain — test sugar too, rule out fluid' },
    // THY03 q6
    { questionIndex: 6, text: 'रिपोर्ट साथ है — मान के अनुसार आगे की योजना बनेगी', textEn: 'Report available — plan as per the value' },
    { questionIndex: 6, text: 'जांच नहीं हुई — आज ही TSH लिखवा लें', textEn: 'Not tested — get TSH prescribed today' },
    // THY04 q7
    { questionIndex: 7, text: 'दूसरों से ज्यादा ठंड+वजन — TSH जांच (हाइपोथायरॉइड स्क्रीन)', textEn: 'Colder than others+weight — TSH test (hypothyroid screen)' },
    { questionIndex: 7, text: 'बहुत ठंड + बढ़ती नींद/सुस्ती + धीमी बोली — मिक्सिडिमा-कोमा खतरा — तुरंत इमरजेंसी', textEn: 'Severe cold + growing drowsiness + slow speech — myxedema coma risk — emergency now' },
    // THY04 q8
    { questionIndex: 8, text: 'कब्ज/भारी पीरियड्स+ठंड — हाइपोथायरॉइड तस्वीर — TSH कराएं', textEn: 'Constipation/heavy periods+cold — hypothyroid picture — test TSH' },
    { questionIndex: 8, text: 'हल्के लक्षण — पानी-फाइबर आहार, फिर भी एक बार TSH', textEn: 'Mild symptoms — water-fiber diet, still test TSH once' },
    // THY05 q9
    { questionIndex: 9, text: '3+ महीने बाल झड़ना+थकान — TSH, आयरन, विटामिन D जांच', textEn: 'Hair fall 3+ months+tiredness — TSH, iron, vitamin D tests' },
    { questionIndex: 9, text: 'तनाव/बीमारी के बाद झड़ना — आम, 3-6 महीने में ठीक होता है', textEn: 'Fall after stress/illness — common, recovers in 3-6 months' },
    // THY05 q10
    { questionIndex: 10, text: 'वजन बदलाव/अनियमित पीरियड्स साथ — थायरॉइड जांच जरूरी', textEn: 'Weight change/irregular periods along — thyroid test needed' },
    { questionIndex: 10, text: 'केवल बाल की समस्या — त्वचा-विशेषज्ञ भी देखें, TSH फिर भी कराएं', textEn: 'Only hair problem — see dermatologist too, still test TSH' },
    // THY06 q11
    { questionIndex: 11, text: 'खुराक रिपोर्ट पर लिखी है — mcg सत्यापित करें (25/50 आम शुरुआत)', textEn: 'Dose written on report — verify mcg (25/50 usual start)' },
    { questionIndex: 11, text: 'खुराक याद नहीं — दवा की पत्ती/रिपोर्ट अगली मुलाकात में लाएं', textEn: 'Dose unknown — bring medicine strip/report next visit' },
    // THY06 q12
    { questionIndex: 12, text: 'दवा सुबह खाली पेट, नाश्ते से 45-60 मिनट पहले, केवल पानी के साथ', textEn: 'Medicine morning empty stomach, 45-60 min before breakfast, with water only' },
    { questionIndex: 12, text: 'कैल्शियम/आयरन की गोली थायरॉइड दवा से कम-से-कम 4 घंटे बाद', textEn: 'Calcium/iron tablet at least 4 hours after thyroid medicine' },
    // THY06 q13
    { questionIndex: 13, text: 'दवा शुरू हुए 6-8 हफ्ते हो गए — अब TSH दोहराने का समय', textEn: '6-8 weeks since start — time to repeat TSH now' },
    { questionIndex: 13, text: 'अभी कुछ ही हफ्ते हुए — TSH केवल 6-8 हफ्ते बाद कराएं', textEn: 'Only a few weeks so far — test TSH only after 6-8 weeks' },
    // THY07 q14
    { questionIndex: 14, text: 'खुराक mcg में सत्यापित करें — ब्रांड बदलने पर TSH री-चेक जरूरी', textEn: 'Verify dose in mcg — brand switch needs TSH recheck' },
    { questionIndex: 14, text: '100+ mcg पर भी TSH ऊंचा — दवा लेने का तरीका जांचें (खाली पेट?)', textEn: 'TSH high despite 100+ mcg — check intake method (empty stomach?)' },
    // THY07 q15
    { questionIndex: 15, text: 'TSH खुराक-बदलाव के 6-8 हफ्ते बाद ही दोहराएं', textEn: 'Repeat TSH only 6-8 weeks after any dose change' },
    { questionIndex: 15, text: 'रिपोर्ट 6+ महीने पुरानी — आज TSH दोहरा लें', textEn: 'Report 6+ months old — repeat TSH today' },
    // THY07 q16
    { questionIndex: 16, text: 'सुबह खाली पेट नियम — 45-60 मिनट पहले; कैल्शियम/आयरन से 4 घंटे अंतर', textEn: 'Morning empty-stomach rule — 45-60 min before; 4-hr gap from calcium/iron' },
    { questionIndex: 16, text: 'एक ही ब्रांड जारी रखें — ब्रांड बदले तो TSH री-चेक कराएं', textEn: 'Continue the same brand — recheck TSH if brand switched' },
    // THY08 q17
    { questionIndex: 17, text: 'धड़कन+वजन घटना+गर्मी — TSH/T3/T4 जांच (हाइपरथायरॉइड स्क्रीन)', textEn: 'Palpitations+weight loss+heat — TSH/T3/T4 (hyperthyroid screen)' },
    { questionIndex: 17, text: 'बहुत तेज धड़कन + बुखार + बेचैनी/भ्रम — थायरो-क्राइसिस — तुरंत इमरजेंसी', textEn: 'Very fast pulse + fever + restlessness/confusion — thyroid crisis — emergency now' },
    // THY08 q18
    { questionIndex: 18, text: '3-4 kg+ अनजाने वजन-घटना — थायरॉइड जांच आवश्यक', textEn: '3-4 kg+ unintentional weight loss — thyroid test essential' },
    { questionIndex: 18, text: 'जानबूझकर डाइट से घटा — संतुलित आहार बहाल करें', textEn: 'Intentional diet loss — restore balanced diet' },
    // THY08 q19
    { questionIndex: 19, text: 'हाथ कांपना+पसीना — हाइपरथायरॉइड संकेत — जांच कराएं', textEn: 'Hand tremor+sweating — hyperthyroid signs — get tested' },
    { questionIndex: 19, text: 'केवल गर्मी लगना — मौसम/गतिविधि भी कारण हो सकती है', textEn: 'Only heat feeling — weather/activity can also be the cause' },
    // THY09 q20
    { questionIndex: 20, text: 'Neomercazole विशेषज्ञ-निगरानी में चलती है — खुराक रिपोर्ट से सत्यापित करें', textEn: 'Neomercazole runs under specialist supervision — verify dose from records' },
    { questionIndex: 20, text: 'बुखार/गला खराब हो तो तुरंत बताएं — CBC जांच तुरंत', textEn: 'Report fever/sore throat immediately — urgent CBC test' },
    // THY09 q21
    { questionIndex: 21, text: 'TFT हर 4-8 हफ्ते दोहराना आम है — तारीख देखें', textEn: 'TFT repeat every 4-8 weeks is usual — check the date' },
    { questionIndex: 21, text: 'रिपोर्ट 3+ महीने पुरानी — आज TFT लिखवाएं', textEn: 'Report 3+ months old — get TFT today' },
    // THY10 q22
    { questionIndex: 22, text: 'आंखें उभरना — Graves नेत्र-रोग — एंडोक्राइन + नेत्र-विशेषज्ञ रेफर', textEn: 'Bulging eyes — Graves eye disease — endocrine + eye specialist referral' },
    { questionIndex: 22, text: 'रेत-सी जलन — कृत्रिम आंसू + धूप-चश्मा, नेत्र-जांच कराएं', textEn: 'Gritty irritation — artificial tears + sunglasses, get eye check' },
    // THY10 q23
    { questionIndex: 23, text: 'थायरॉइड इतिहास+आंखें — TFT कराएं, विशेषज्ञ रेफर जरूरी', textEn: 'Thyroid history+eyes — test TFT, specialist referral needed' },
    { questionIndex: 23, text: 'धूम्रपान करते हैं तो आज ही बंद करें — आंखों के लिए बहुत हानिकारक', textEn: 'If smoking, stop today — very harmful for thyroid eyes' },
    // THY11 q24
    { questionIndex: 24, text: 'केवल TSH हुई — पूर्ण तस्वीर के लिए T3/T4 सहित दोहराएं', textEn: 'Only TSH done — repeat with T3/T4 for full picture' },
    { questionIndex: 24, text: 'रिपोर्ट लैब की अपनी सामान्य-सीमा से तुलना कर पढ़ें', textEn: 'Read the report against the lab own reference range' },
    // THY11 q25
    { questionIndex: 25, text: 'TSH ऊंचा — हाइपोथायरॉइड संभव — T3/T4 कराएं, दवा डॉक्टर से', textEn: 'TSH high — hypothyroid likely — test T3/T4, medicine via doctor' },
    { questionIndex: 25, text: 'TSH 0.4 से नीचे — हाइपरथायरॉइड या ओवरडोज — जांच जरूरी', textEn: 'TSH below 0.4 — hyperthyroid or overdose — testing needed' },
    // THY11 q26
    { questionIndex: 26, text: 'परिवार में थायरॉइड — आपका जोखिम अधिक — नियमित TSH निगरानी रखें', textEn: 'Family thyroid — higher risk — keep regular TSH monitoring' },
    { questionIndex: 26, text: 'दवा चल रही है — दवा-समय सही रखें तो मान सही आएगा', textEn: 'On medicine — correct medicine timing gives correct value' },
    // THY12 q27
    { questionIndex: 27, text: 'ऑपरेशन के बाद झनझनाहट — आज ही सीरम कैल्शियम जांच कराएं', textEn: 'Post-surgery tingling — get serum calcium tested today' },
    { questionIndex: 27, text: 'गंभीर मरोड़/झनझनाहट — तत्काल जांच; बिगड़े तो इमरजेंसी', textEn: 'Severe cramps/tingling — urgent test; emergency if worsening' },
    // THY12 q28
    { questionIndex: 28, text: 'होंठ/उंगली सुन्नपन — कम कैल्शियम के चिह्न — सीरम कैल्शियम तुरंत', textEn: 'Lips/finger numbness — low calcium signs — serum calcium now' },
    { questionIndex: 28, text: 'ऑपरेशन नहीं हुआ — B12/विटामिन D जांच कराएं', textEn: 'No surgery — test B12/vitamin D' },
    // THY13 q29
    { questionIndex: 29, text: 'ठोस-स्थिर गांठ — तुरंत अल्ट्रासाउंड/FNAC — विशेषज्ञ रेफर', textEn: 'Hard-fixed lump — urgent ultrasound/FNAC — specialist referral' },
    { questionIndex: 29, text: 'तेजी से बढ़ती गांठ — जल्द जांच आवश्यक', textEn: 'Rapidly growing lump — early testing essential' },
    // THY13 q30
    { questionIndex: 30, text: 'आवाज़ बैठना साथ — तुरंत ENT/सर्जन जांच', textEn: 'Hoarseness present — urgent ENT/surgeon evaluation' },
    { questionIndex: 30, text: 'गांठ खिसकती-नरम — चिंता कम, फिर भी जांच कराएं', textEn: 'Lump mobile-soft — less worry, still get checked' },
    // THY14 q31
    { questionIndex: 31, text: 'दवा बिना छोड़े जारी रखें — TSH रोकथाम-लक्ष्य (suppression) से देखा जाता है', textEn: 'Continue medicine without breaks — TSH kept at suppression target' },
    { questionIndex: 31, text: 'दवा प्रोटोकॉल वही — खाली पेट, नाश्ते से 45-60 मिनट पहले', textEn: 'Same medicine protocol — empty stomach, 45-60 min before breakfast' },
    // THY14 q32
    { questionIndex: 32, text: 'गांठ वापस/गर्दन भारीपन — तुरंत सर्जन-एंडोक्राइन मूल्यांकन', textEn: 'Lump back/neck heaviness — urgent surgeon-endocrine evaluation' },
    { questionIndex: 32, text: 'thyroglobulin जांच नियमित रखें — रिपोर्ट हर यात्रा में लाएं', textEn: 'Keep thyroglobulin testing regular — bring report every visit' },
    // THY15 q33
    { questionIndex: 33, text: 'सूजन बढ़ी है — अल्ट्रासाउंड दोहराएं', textEn: 'Swelling increased — repeat the ultrasound' },
    { questionIndex: 33, text: 'सूजन वैसी ही — गोभी/शलगम कच्चा ज्यादा नहीं; पका हुआ सामान्य मात्रा में ठीक', textEn: 'Swelling same — do not overdo raw cabbage/turnip; cooked normal amounts are fine' },
    // THY15 q34
    { questionIndex: 34, text: 'आयोडीन-युक्त नमक सामान्य मात्रा में इस्तेमाल करें — ज्यादा नहीं', textEn: 'Use iodized salt in normal quantity — not in excess' },
    { questionIndex: 34, text: 'अल्ट्रासाउंड 6-12 महीने के अंतर पर दोहराते रहें', textEn: 'Keep repeating ultrasound at 6-12 month intervals' },
    // WT01 q35
    { questionIndex: 35, text: 'कल का 24-घंटे आहार-याद — आहार-सुधार पहला कदम, दवा बाद में', textEn: 'Yesterday 24-hr diet recall — diet change is step one, medicine later' },
    { questionIndex: 35, text: 'लक्ष्य: 6 महीने में वजन का 5-10% कमी — क्रैश-डाइट कभी नहीं', textEn: 'Target: 5-10% weight loss in 6 months — never a crash diet' },
    // WT01 q36
    { questionIndex: 36, text: 'रोज 30-45 मिनट तेज चाल — हफ्ते में 150 मिनट का लक्ष्य', textEn: 'Daily 30-45 min brisk walk — weekly 150-minute target' },
    { questionIndex: 36, text: 'गतिविधि कम — धीरे शुरू करें; लिफ्ट की जगह सीढ़ियां चुनें', textEn: 'Low activity — start slow; choose stairs over lift' },
    // WT01 q37
    { questionIndex: 37, text: 'मीठे पेय बंद करें — चाय की चीनी आधी, कोल्ड-ड्रिंक सप्ताह में अधिकतम 1', textEn: 'Stop sugary drinks — halve tea sugar, cold drinks max 1 a week' },
    { questionIndex: 37, text: 'प्यास का जवाब पानी या बिना-चीनी नींबू-पानी से दें', textEn: 'Answer thirst with water or sugar-free lemon water' },
    // WT02 q38
    { questionIndex: 38, text: '3+ महीने ईमानदार कोशिश पर भी वजन स्थिर — TSH और शुगर जांचें', textEn: 'Weight stuck despite 3+ honest months — test TSH and sugar' },
    { questionIndex: 38, text: 'भूखा रहना डाइट नहीं — संतुलित कम-कैलोरी भोजन सीखें', textEn: 'Staying hungry is not a diet — learn balanced low-calorie meals' },
    // WT02 q39
    { questionIndex: 39, text: 'नींद 6 घंटे से कम — भूख-हार्मोन बिगड़ते हैं; 7-8 घंटे लक्ष्य रखें', textEn: 'Sleep under 6 hours — hunger hormones suffer; aim 7-8 hours' },
    { questionIndex: 39, text: 'थकान+स्थिर वजन — TSH जांच कराएं', textEn: 'Tiredness+stuck weight — test TSH' },
    // WT03 q40
    { questionIndex: 40, text: 'काले मखमली धब्बे — इंसुलिन-प्रतिरोध संकेत — शुगर जांच (DIA-01 समन्वय)', textEn: 'Dark velvety patches — insulin resistance sign — sugar test (DIA-01 coordination)' },
    { questionIndex: 40, text: 'धब्बे मोटापे के साथ — वजन घटने पर धब्बे हल्के पड़ते हैं', textEn: 'Patches with obesity — patches fade as weight reduces' },
    // WT03 q41
    { questionIndex: 41, text: 'परिवार में शुगर — जोखिम अधिक — सालाना शुगर-जांच कराएं', textEn: 'Family diabetes — higher risk — annual sugar testing' },
    { questionIndex: 41, text: 'परिवार में शुगर नहीं — मोटापे की स्थिति में जांच फिर भी जरूरी', textEn: 'No family diabetes — testing still needed with obesity' },
    // WT03 q42
    { questionIndex: 42, text: 'बार-बार भूख — प्रोटीन-फाइबर बढ़ाएं (दाल, दही, सब्जी, अंडा)', textEn: 'Frequent hunger — raise protein-fiber (dal, curd, vegetables, egg)' },
    { questionIndex: 42, text: 'भोजन के तुरंत बाद भी भूख — शुगर/इंसुलिन जांच कराएं', textEn: 'Hungry right after meals — test sugar/insulin' },
    // WT04 q43
    { questionIndex: 43, text: 'स्क्रीन-टाइम दिन में 2 घंटे से कम — बाहर खेल बढ़ाएं', textEn: 'Screen-time under 2 hours a day — increase outdoor play' },
    { questionIndex: 43, text: 'बच्चे का वजन नहीं, आदतें बदलें — पूरा परिवार साथ खाए', textEn: 'Change habits, not blame the child — whole family eats together' },
    // WT04 q44
    { questionIndex: 44, text: 'टिफिन में फल-सब्जी जोड़ें — चिप्स-बिस्कुट हटाएं', textEn: 'Add fruit-vegetable to tiffin — remove chips-biscuits' },
    { questionIndex: 44, text: 'मीठे पेय पूरी तरह बंद — पानी और दूध ही दें', textEn: 'Stop sugary drinks completely — give only water and milk' },
    // WT05 q45
    { questionIndex: 45, text: 'रात का भोजन 8 बजे तक — सोने से कम-से-कम 2 घंटे पहले', textEn: 'Dinner by 8 PM — at least 2 hours before sleep' },
    { questionIndex: 45, text: 'रात 10 बजे बाद भूख — गुनगुना दूध या फल चुनें, तला नहीं', textEn: 'Hunger after 10 PM — choose warm milk or fruit, not fried' },
    // WT05 q46
    { questionIndex: 46, text: 'तनाव-खाना जुड़ा है — 10 मिनट सांस-व्यायाम/टहलना रोज रखें', textEn: 'Stress-eating linked — keep 10-min breathing/walking daily' },
    { questionIndex: 46, text: 'भावनात्मक भूख पहचानें — पानी पिएं, 15 मिनट रुकें, फिर तय करें', textEn: 'Recognize emotional hunger — drink water, wait 15 min, then decide' },
    // WT06 q47
    { questionIndex: 47, text: 'डिलीवरी के बाद 6-12 महीने वजन-वापसी का वास्तविक समय है', textEn: '6-12 months post-delivery is the realistic weight-return window' },
    { questionIndex: 47, text: 'स्तनपान ~500 कैलोरी/दिन जलाता है — इसका लाभ उठाएं, अधिक खाएं नहीं', textEn: 'Breastfeeding burns ~500 kcal/day — benefit from it, do not overeat' },
    // WT06 q48
    { questionIndex: 48, text: 'स्तनपान-काल में क्रैश-डाइट नहीं — दूध की गुणवत्ता गिरती है', textEn: 'No crash diet while breastfeeding — milk quality drops' },
    { questionIndex: 48, text: 'टुकड़ों में नींद — दिन में झपकी लें, भूख-हार्मोन संतुलित रहेंगे', textEn: 'Broken sleep — nap in the day to keep hunger hormones balanced' },
    // HRM01 q49
    { questionIndex: 49, text: 'अनियमित पीरियड्स+वजन — PCOS जांच (हार्मोन+अल्ट्रासाउंड) — OBG समन्वय', textEn: 'Irregular periods+weight — PCOS workup (hormones+ultrasound) — OBG coordination' },
    { questionIndex: 49, text: 'PCOS की पहली लाइन — आहार+व्यायाम; 5-10% वजन-कमी से पीरियड्स सुधरते हैं', textEn: 'PCOS first line — diet+exercise; 5-10% weight loss improves periods' },
    // HRM01 q50
    { questionIndex: 50, text: 'बाल/मुंहासे बढ़े — हार्मोन जांच + OBG से मिलें', textEn: 'Hair/acne increased — hormone tests + see OBG' },
    { questionIndex: 50, text: 'लक्षण हल्के — जीवनशैली-सुधार + निगरानी पर्याप्त', textEn: 'Mild symptoms — lifestyle change + monitoring suffice' },
    // HRM02 q51
    { questionIndex: 51, text: 'चेहरे के बाल — PCOS/अन्य हार्मोन जांच — OBG समन्वय में', textEn: 'Facial hair — PCOS/other hormone tests — in OBG coordination' },
    { questionIndex: 51, text: 'अचानक तेजी से बढ़े बाल — जल्द जांच कराएं', textEn: 'Suddenly rapid hair growth — get tested soon' },
    // HRM02 q52
    { questionIndex: 52, text: 'पीरियड्स भी अनियमित — पूरा PCOS-स्क्रीन कराएं', textEn: 'Periods also irregular — complete the PCOS screen' },
    { questionIndex: 52, text: 'पीरियड्स नियमित — अन्य कारण (दवा/पारिवारिक) जांचें', textEn: 'Regular periods — check other causes (medicine/family)' },
    // HRM03 q53
    { questionIndex: 53, text: 'दूध-स्राव — सीरम प्रोलैक्टिन जांच कराएं', textEn: 'Milky discharge — get serum prolactin test' },
    { questionIndex: 53, text: 'एक/दोनों स्त्रण — परीक्षण जरूरी; स्राव का विवरण लाएं', textEn: 'One/both breasts — examination needed; bring discharge details' },
    // HRM03 q54
    { questionIndex: 54, text: 'दवा-जनित स्राव संभव — बिना सलाह कोई दवा बंद न करें', textEn: 'Medicine-induced discharge possible — do not stop any medicine without advice' },
    { questionIndex: 54, text: 'कारण-दवा बदली जाए तो प्रोलैक्टिन अकसर घट जाता है', textEn: 'If the offending medicine is changed, prolactin often reduces' },
    // HRM04 q55
    { questionIndex: 55, text: 'थायरॉइड सही करना पहला कदम — प्रजनन में TSH लक्ष्य सख्त होता है', textEn: 'Correcting thyroid is step one — TSH target is stricter in fertility' },
    { questionIndex: 55, text: 'दंपत्ति-जांच + OBG समन्वय जारी रखें', textEn: 'Couple workup + continue OBG coordination' },
    // HRM04 q56
    { questionIndex: 56, text: 'दवा खाली-पेट प्रोटोकॉल पक्का करें — 45-60 मिनट का नियम', textEn: 'Ensure empty-stomach protocol — the 45-60 min rule' },
    { questionIndex: 56, text: 'प्रजनन-लक्ष्य TSH ~2.5 से नीचे — खुराक डॉक्टर से तय करें', textEn: 'Fertility target TSH under ~2.5 — dose decided with doctor' },
    // HRM05 q57
    { questionIndex: 57, text: 'गर्भ में थायरॉइड-खुराक अकसर बढ़ती है — OBG+एंडो संयुक्त देखरेख', textEn: 'Thyroid dose often rises in pregnancy — OBG+endocrine joint care' },
    { questionIndex: 57, text: 'दवा खाली पेट जारी रखें — गर्भ में भी 45-60 मिनट का नियम', textEn: 'Continue empty-stomach dosing — the 45-60 min rule in pregnancy too' },
    // HRM05 q58
    { questionIndex: 58, text: 'गर्भावस्था में TSH हर तिमाही जांचना आम है', textEn: 'TSH tested every trimester in pregnancy is usual' },
    { questionIndex: 58, text: 'खुराक न बढ़ी हो — डॉक्टर से दोबारा देखें; खुद न बढ़ाएं', textEn: 'If dose not increased — review with doctor; never self-increase' },
    // HRM06 q59
    { questionIndex: 59, text: 'रजोनिवृत्ति स्वाभाविक दौर — हार्मोन-थेरेपी सबके लिए नहीं, व्यक्तिगत निर्णय', textEn: 'Menopause is a natural phase — HT is not a default, individual decision' },
    { questionIndex: 59, text: 'लाभ-जोखिम OBG से मिलकर तय करें — जल्दबाजी नहीं', textEn: 'Decide benefit-risk with OBG — no rush' },
    // HRM06 q60
    { questionIndex: 60, text: 'गर्म-लहरें — प्याज-मसाला-कैफीन कम; गहरी सांस-व्यायाम रोज', textEn: 'Hot flushes — cut onion-spice-caffeine; deep breathing daily' },
    { questionIndex: 60, text: 'हड्डी-स्वास्थ्य — कैल्शियम-आहार + वजन-वहन व्यायाम (चाल) रोज', textEn: 'Bone health — calcium foods + weight-bearing exercise (walking) daily' },
    // HRM-M01 q61
    { questionIndex: 61, text: 'किशोरावस्था की गाइनेकोमेस्टिया अकसर 1-2 साल में अपने आप ठीक हो जाती है', textEn: 'Pubertal gynecomastia often settles on its own in 1-2 years' },
    { questionIndex: 61, text: 'एक तरफ या बढ़ती गांठ — हार्मोन + अल्ट्रासाउंड जांच कराएं', textEn: 'One-sided or growing lump — get hormone + ultrasound tests' },
    // HRM-M01 q62
    { questionIndex: 62, text: 'जिम की स्टेरॉइड/कुछ दवाएं इसे बढ़ाती हैं — तुरंत बंद + जांच', textEn: 'Gym steroids/some medicines cause this — stop now + test' },
    { questionIndex: 62, text: 'उम्र 50+ — हार्मोन बदलाव आम कारण — जांच कराएं', textEn: 'Age 50+ — hormonal change common cause — get tested' },
    // HRM-M02 q63
    { questionIndex: 63, text: 'इच्छा-कमी — सुबह के समय टेस्टोस्टेरोन जांच (खून) — URO समन्वय', textEn: 'Low desire — morning testosterone blood test — URO coordination' },
    { questionIndex: 63, text: 'मनोवैज्ञानिक/रिश्ते के पहलू भी जरूरी — इलाज संयुक्त रूप से', textEn: 'Psychological/relationship aspects matter — treat together' },
    // HRM-M02 q64
    { questionIndex: 64, text: 'BP/शुगर/मानसिक दवाएं कारण हो सकती हैं — बिना सलाह बंद न करें', textEn: 'BP/sugar/psychiatric medicines may be the cause — do not stop without advice' },
    { questionIndex: 64, text: 'जिम-स्टेरॉइड चल रही है तो यही अकसर कारण — बंद करें, जांच कराएं', textEn: 'If on gym steroids, that is often the cause — stop and test' },
    // BON01 q65
    { questionIndex: 65, text: 'कोर्स: 60K साप्ताहिक ×8 → मासिक ×2-3 → 3 महीने में री-टेस्ट', textEn: 'Course: 60K weekly ×8 → monthly ×2-3 → retest at 3 months' },
    { questionIndex: 65, text: 'खुराकें भूल गए — खुद कोर्स दोबारा शुरू न करें — डॉक्टर से पूछें', textEn: 'Missed doses — do not restart the course yourself — ask doctor' },
    // BON01 q66
    { questionIndex: 66, text: 'हफ्ते में 3-4 दिन, 15-20 मिनट धूप — बांह-टांग खुली रखें', textEn: '3-4 days a week, 15-20 min sun — keep arms and legs exposed' },
    { questionIndex: 66, text: 'धूप मुश्किल है — तो खुराक नियमित रखें और री-टेस्ट कराते रहें', textEn: 'If sun is difficult — keep the dose regular and retest' },
    // BON01 q67
    { questionIndex: 67, text: 'दर्द 50%+ कम — कोर्स पूरा करें, 3 महीने में री-टेस्ट', textEn: 'Pain 50%+ better — complete the course, retest at 3 months' },
    { questionIndex: 67, text: 'कैल्शियम-युक्त आहार रोज — दूध, दही, पनीर, हरी सब्जियां, रागी, तिल', textEn: 'Daily calcium-rich foods — milk, curd, paneer, green vegetables, ragi, sesame' },
    // BON02 q68
    { questionIndex: 68, text: 'पथरी+हड्डी दर्द — सीरम कैल्शियम + PTH जांच कराएं', textEn: 'Stones+bone pain — serum calcium + PTH test' },
    { questionIndex: 68, text: 'बार-बार पथरी — कैल्शियम/PTH/पेशाब जांच आवश्यक', textEn: 'Recurrent stones — calcium/PTH/urine testing needed' },
    // BON02 q69
    { questionIndex: 69, text: 'कमर-पीठ दर्द — विटामिन D और PTH जांच कराएं', textEn: 'Back pain — test vitamin D and PTH' },
    { questionIndex: 69, text: 'सामान्य घिसाव-दर्द — मुद्रा + कैल्शियम-आहार पर ध्यान दें', textEn: 'Routine wear-pain — focus posture + calcium foods' },
    // BON03 q70
    { questionIndex: 70, text: 'कैल्शियम दो बार ऊंचा — PTH जांच कराएं, विशेषज्ञ रेफर', textEn: 'Calcium high twice — get PTH test, specialist referral' },
    { questionIndex: 70, text: 'सीमा-रेखा मान — 3 महीने बाद दोहराएं — पहले डॉक्टर से मिलें', textEn: 'Borderline value — repeat after 3 months — see doctor first' },
    // BON03 q71
    { questionIndex: 71, text: 'कब्ज+बार पेशाब+पथरी — उच्च-कैल्शियम संकेत — जांच जरूरी', textEn: 'Constipation+frequent urine+stones — high-calcium signals — test needed' },
    { questionIndex: 71, text: 'लक्षण नहीं — निगरानी जारी रखें, जल पर्याप्त पिएं', textEn: 'No symptoms — continue monitoring, drink adequate water' },
    // OTH01 q72
    { questionIndex: 72, text: 'प्यास+बार-बार पेशाब — आज शुगर जांच (DIA-01 समन्वय)', textEn: 'Thirst+frequent urine — sugar test today (DIA-01 coordination)' },
    { questionIndex: 72, text: 'रात में बार-बार पेशाब — शुगर जांच जरूरी', textEn: 'Repeated night urination — sugar test needed' },
    // OTH01 q73
    { questionIndex: 73, text: 'वजन घटना+प्यास — तत्काल शुगर जांच', textEn: 'Weight loss+thirst — sugar test immediately' },
    { questionIndex: 73, text: 'जांच नहीं हुई — रैंडम शुगर + HbA1c कराएं', textEn: 'Not tested — get random sugar + HbA1c' },
    // OTH02 q74
    { questionIndex: 74, text: 'कम-शुगर दौरा: तुरंत 15 g चीनी/ग्लूकोज, 15 मिनट बाद दोहराएं, फिर ठोस भोजन', textEn: 'Low-sugar episode: 15 g sugar/glucose now, repeat in 15 min, then solid food' },
    { questionIndex: 74, text: 'बेहोश मरीज को कभी कुछ न खिलाएं — इमरजेंसी मदद बुलाएं', textEn: 'Never feed an unconscious patient — call emergency help' },
    // OTH02 q75
    { questionIndex: 75, text: 'दवा-समय डॉक्टर से बदलवाएं — खुराक-तालमेल से दौरे रुकते हैं', textEn: 'Get medicine timing adjusted by doctor — dose-timing stops episodes' },
    { questionIndex: 75, text: 'सुबह की दवा के बाद नाश्ता कभी न छोड़ें', textEn: 'Never skip breakfast after the morning medicine' },
    // OTH02 q76
    { questionIndex: 76, text: 'दौरे में शुगर तुरंत मापें — मान का रिकॉर्ड रखें', textEn: 'Check sugar during the episode — keep a value record' },
    { questionIndex: 76, text: 'रिकॉर्ड (समय+मान+खाना) डॉक्टर को दिखाएं — तालमेल आसान होगा', textEn: 'Show the record (time+value+food) to doctor — easier adjustment' },
    // OTH03 q77
    { questionIndex: 77, text: 'पसीने-दौरे — BP + TSH + शुगर जांच कराएं', textEn: 'Sweating episodes — test BP + TSH + sugar' },
    { questionIndex: 77, text: 'चेहरा-लाल होना+धड़कन साथ — विशेषज्ञ-जांच (दुर्लभ कारण निकालें)', textEn: 'Facial flushing+palpitations — specialist workup (rule rare causes)' },
    // OTH03 q78
    { questionIndex: 78, text: 'सिरदर्द+धड़कन+पसीना+उच्च BP — विशेषज्ञ रेफर — धड़कन की दवा शुरू करने से पहले', textEn: 'Headache+palpitations+sweat+high BP — specialist referral — BEFORE starting any palpitation medicine' },
    { questionIndex: 78, text: 'BP सामान्य — मौसम/चिंता आम कारण — निगरानी रखें', textEn: 'BP normal — weather/anxiety common — keep monitoring' },
    // OTH04 q79
    { questionIndex: 79, text: 'कई दवाओं पर भी उच्च BP — कुशिंग-स्क्रीन जांच सोचें, रेफर', textEn: 'High BP despite multiple medicines — consider Cushing screen, refer' },
    { questionIndex: 79, text: 'जवान उम्र में अचानक BP — कारण-जांच जरूरी', textEn: 'Sudden young-age BP — cause workup needed' },
    // OTH04 q80
    { questionIndex: 80, text: 'बैंगनी लकीरें+मोटापा+BP — कुशिंग जांच — विशेषज्ञ रेफर', textEn: 'Purple marks+obesity+BP — Cushing workup — specialist referral' },
    { questionIndex: 80, text: 'सफेद लकीरें बिना लक्षण — त्वचा-खिंचाव आम (मोटापे में)', textEn: 'White marks without symptoms — common skin stretch (in obesity)' },
    // OTH05 q81
    { questionIndex: 81, text: 'सुबह बुरी थकान, दोपहर थोड़ा सुधर — एड्रेनल-कमी जांच — रेफर', textEn: 'Bad morning fatigue, slight afternoon relief — adrenal insufficiency workup — refer' },
    { questionIndex: 81, text: 'शाम की थकान — आम (नींद/आहार) — पहले जीवनशैली देखें', textEn: 'Evening fatigue — common (sleep/diet) — check lifestyle first' },
    // OTH05 q82
    { questionIndex: 82, text: 'स्टेरॉइड लंबे समय से — कभी अचानक बंद नहीं — जानलेवा हो सकता है; डॉक्टर से घटाएं', textEn: 'Long-term steroids — never stop abruptly — can be life-threatening; taper via doctor' },
    { questionIndex: 82, text: 'जिम की स्टेरॉइड चल रही — बंद करने से पहले विशेषज्ञ से मिलें — अकेले बंद खतरनाक', textEn: 'On gym steroids — meet a specialist BEFORE stopping — stopping alone is dangerous' },
    // OTH05 q83
    { questionIndex: 83, text: 'बिना वजह वजन-घटना+त्वचा काली — एड्रेनल-कमी संकेत — तुरंत जांच/रेफर', textEn: 'Unexplained weight loss+dark skin — adrenal insufficiency signs — urgent test/refer' },
    { questionIndex: 83, text: 'त्वचा सामान्य — पर थकान+नीचा BP — जांच कराएं', textEn: 'Skin normal — but tiredness+low BP — get tested' },
    // OTH06 q84
    { questionIndex: 84, text: 'कक्षा में सबसे छोटा बच्चा — लंबाई-चार्ट + हड्डी-उम्र — बाल-एंडो रेफर', textEn: 'Shortest in class — height chart + bone age — ped-endocrine referral' },
    { questionIndex: 84, text: 'माता-पिता भी छोटे कद के — आनुवंशिक संभव — फिर भी वार्षिक बढ़त जांचें', textEn: 'Short parents too — genetic likely — still check yearly growth' },
    // OTH06 q85
    { questionIndex: 85, text: 'सालाना लंबाई-बढ़त 4-5 cm से कम — हार्मोन जांच जरूरी', textEn: 'Yearly height gain under 4-5 cm — hormone testing needed' },
    { questionIndex: 85, text: 'कपड़े 2+ साल एक ही साइज — बढ़त धीमी — बाल-एंडो दिखाएं', textEn: 'Same clothes size 2+ years — slow growth — see ped-endocrine' },
    // OTH07 q86
    { questionIndex: 86, text: 'बच्चा असामान्य लंबा — हड्डी-उम्र + हार्मोन जांच — बाल-एंडो रेफर', textEn: 'Unusually tall child — bone age + hormone tests — ped-endocrine referral' },
    { questionIndex: 86, text: 'माता-पिता भी लंबे — सामान्य आनुवंशिक — निगरानी रखें', textEn: 'Tall parents too — normal genetics — keep monitoring' },
    // OTH07 q87
    { questionIndex: 87, text: 'हड्डी-उम्र नहीं हुई — रेफर के साथ कराएं — विशेषज्ञ ही आगे बताएंगे', textEn: 'Bone age not done — get it along with referral — specialist will guide' },
    { questionIndex: 87, text: 'जांच हो चुकी — रिपोर्ट साथ लाएं', textEn: 'Tests already done — bring the report along' },
    // OTH08 q88
    { questionIndex: 88, text: '14 (लड़के)/13 (लड़कियों) साल तक कोई संकेत नहीं — बाल-एंडो रेफर जरूरी', textEn: 'No signs by 14 (boys)/13 (girls) years — ped-endocrine referral needed' },
    { questionIndex: 88, text: 'परिवार में देर से प्यूबर्टी आम — फिर भी एक बार जांच कराएं', textEn: 'Late puberty runs in family — still get checked once' },
    // OTH08 q89
    { questionIndex: 89, text: 'हल्के संकेत शुरू — 6 महीने में दोबारा आकलन करें', textEn: 'Early signs started — reassess in 6 months' },
    { questionIndex: 89, text: 'बिल्कुल कोई संकेत नहीं — बाल-एंडो जांच लिखवाएं', textEn: 'Absolutely no signs — get ped-endocrine workup prescribed' },
    // OTH09 q90
    { questionIndex: 90, text: '8 (लड़कियों)/9 (लड़कों) साल से पहले संकेत — जल्दी-प्यूबर्टी — बाल-एंडो रेफर', textEn: 'Signs before 8 (girls)/9 (boys) years — precocious puberty — ped-endocrine referral' },
    { questionIndex: 90, text: 'छोटी उम्र में तेज लंबाई-बढ़त — हड्डी-उम्र जांच जरूरी', textEn: 'Height spurt at young age — bone age test needed' },
    // OTH09 q91
    { questionIndex: 91, text: 'पहले नहीं दिखाया — अब बाल-एंडो से मिलें — देर न करें', textEn: 'Not shown before — see ped-endocrine now — do not delay' },
    { questionIndex: 91, text: 'कुछ जांचें हुईं — रिपोर्टें साथ लाएं', textEn: 'Some tests done — bring the reports along' },
    // OTH10 q92
    { questionIndex: 92, text: 'Caberlin जैसी दवाएं विशेषज्ञ-निगरानी में चलती हैं — खुद न बदलें', textEn: 'Medicines like Caberlin run under specialist supervision — never self-modify' },
    { questionIndex: 92, text: 'MRI 12+ महीने पुरानी — अगली तारीख विशेषज्ञ से पूछें', textEn: 'MRI 12+ months old — ask the specialist for the next date' },
    // OTH10 q93
    { questionIndex: 93, text: 'सिरदर्द बदला/दोहरी नजर — तुरंत विशेषज्ञ (न्यूरो-एंडोक्राइन)', textEn: 'Headache changed/double vision — specialist now (neuro-endocrine)' },
    { questionIndex: 93, text: 'लक्षण स्थिर — नियमित फॉलो-अप जारी रखें', textEn: 'Symptoms stable — continue regular follow-up' },
    // OTH11 q94
    { questionIndex: 94, text: 'हार्मोन-थेरेपी विशेषज्ञ-निगरानी में शुरू होती है — सम्मानपूर्वक रेफर करेंगे', textEn: 'Hormone therapy starts under specialist supervision — we will refer respectfully' },
    { questionIndex: 94, text: 'सामान्य देखरेख यहीं जारी रखें — बुखार/संक्रमण आदि यहीं देखें', textEn: 'Continue general care here — fever/infections etc. seen here' },
    // OTH11 q95
    { questionIndex: 95, text: 'विशेषज्ञ की सलाह के बिना हार्मोन दवा शुरू/बंद न करें — जोखिम भरा', textEn: 'Do not start/stop hormone medicines without specialist advice — risky' },
    { questionIndex: 95, text: 'आपकी योजना आपकी जरूरत के अनुसार विशेषज्ञ बनाएंगे', textEn: 'The specialist will build the plan as per your needs' },
  ],

  // ══ Labels — vitals & exam (12) ══════════════════════════════════════
  labels: [
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'कमर (वेस्ट)', labelEn: 'Waist Circumference', unit: 'cm' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'TSH (रिपोर्ट हो तो)', labelEn: 'TSH (if brought)', unit: 'µIU/ml' },
    { label: 'गर्दन परिधि', labelEn: 'Neck Circumference', unit: 'cm' },
    { label: 'दर्द स्कोर', labelEn: 'Pain Score', unit: '0-10' },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'कैल्शियम-लक्षण स्कोर', labelEn: 'Calcium-Symptom Score', unit: '0-10' },
    { label: 'भूख स्कोर', labelEn: 'Hunger Score', unit: '0-10' },
  ],

  // ══ Findings (30) — 18 managed/workup + 12 REFER-ONLY (zero meds) ═══
  // REFER-ONLY keys carry ZERO findingMeds links (validator-verified).
  findings: [
    // Managed / continuation / workup
    { key: 'HYPOTHYROID-MANAGED', name: 'थायरॉइड की कमी — दवा चल रही (खुराक-समीक्षा)', nameEn: 'Hypothyroidism — Managed (Dose Titration)', icd10: 'E03.9' },
    { key: 'HYPERTHYROID-MANAGED', name: 'थायरॉइड बढ़ा हुआ — निगरानी/निरंतरता', nameEn: 'Hyperthyroidism — Managed (Continuation)', icd10: 'E05.90' },
    { key: 'THYROIDITIS-SCREEN', name: 'थायरॉइडाइटिस — जांच (वर्कअप)', nameEn: 'Thyroiditis — Workup', icd10: 'E06.9' },
    { key: 'SIMPLE-GOITRE-FU', name: 'सामान्य गॉइटर — निगरानी', nameEn: 'Simple Goitre — Monitor', icd10: 'E04.9' },
    { key: 'OBESITY-MANAGED', name: 'मोटापा — जीवनशैली प्रबंधन', nameEn: 'Obesity — Lifestyle Management', icd10: 'E66.9' },
    { key: 'ACANTHOSIS-IR-SCREEN', name: 'काले धब्बे — इंसुलिन-प्रतिरोध जांच (DIA-01 समन्वय)', nameEn: 'Acanthosis — Insulin Resistance Screen (Coordinate DIA-01)', icd10: 'E88.8' },
    { key: 'PREDIABETES-SCREEN', name: 'प्री-डायबिटीज़ स्क्रीन (DIA-01 समन्वय)', nameEn: 'Prediabetes Screen (Coordinate DIA-01)', icd10: 'R73.03' },
    { key: 'HYPOGLYCEMIA-WORKUP', name: 'शुगर कम — जांच/प्रबंधन (दवा-समन्वय)', nameEn: 'Hypoglycemia — Workup (Medicine-linked)', icd10: 'E16.2' },
    { key: 'HIRSUTISM-PCOS-SCREEN', name: 'हर्सुटिज्म — PCOS जांच (OBG समन्वय)', nameEn: 'Hirsutism — PCOS Screen (Coordinate OBG)', icd10: 'E28.2' },
    { key: 'GYNECOMASTIA', name: 'गाइनेकोमेस्टिया — आश्वासन/समीक्षा', nameEn: 'Gynecomastia — Reassurance', icd10: 'L62' },
    { key: 'LOW-T-SCREEN', name: 'टेस्टोस्टेरोन कम — जांच (URO समन्वय)', nameEn: 'Low Testosterone Screen (Coordinate URO)', icd10: 'F52' },
    { key: 'PROLACTINOMA-SCREEN', name: 'प्रोलैक्टिन जांच — वर्कअप', nameEn: 'Prolactinoma Screen — Workup', icd10: 'E22.1' },
    { key: 'VITD-DEF-FU', name: 'विटामिन D की कमी — इलाज जारी', nameEn: 'Vitamin D Deficiency — Managed', icd10: 'E83.52' },
    { key: 'IATROGENIC-ENDO-FU', name: 'शल्य-चिकित्सा-पश्चात हार्मोन फॉलो-अप', nameEn: 'Post-Surgical Endocrine Follow-up', icd10: 'E89.0' },
    { key: 'THY-CA-FU', name: 'थायरॉइड कैंसर ऑपरेटेड — फॉलो-अप', nameEn: 'Thyroid Cancer — Post-op Follow-up', icd10: 'Z85' },
    { key: 'INFERTILITY-ENDO-FU', name: 'बांझपन — एंडोक्राइन फॉलो-अप (OBG समन्वय)', nameEn: 'Infertility — Endocrine Follow-up (Coordinate OBG)', icd10: 'N97.9' },
    { key: 'PITUITARY-FU', name: 'पिट्यूटरी एडिनोमा ज्ञात — निरंतरता', nameEn: 'Known Pituitary Adenoma — Continuation', icd10: 'D35.2' },
    { key: 'MENOPAUSE-PERIMENOPAUSE', name: 'रजोनिवृत्ति/प्री-मेनोपॉज़ (OBG समन्वय)', nameEn: 'Menopause/Perimenopause (Coordinate OBG)', icd10: 'E34.3' },
    // REFER-ONLY — ZERO findingMeds links below this line
    { key: 'THYROTOXIC-CRISIS-SUSPECT', name: 'थायरो-क्राइसिस संदेह — केवल रेफर (आपातकालीन)', nameEn: 'Thyrotoxic Crisis Suspect — REFER ONLY (Emergency)', icd10: 'E07' },
    { key: 'MYXEDEMA-COMA-SUSPECT', name: 'मिक्सिडिमा-कोमा संदेह — केवल रेफर (आपातकालीन)', nameEn: 'Myxedema Coma Suspect — REFER ONLY (Emergency)', icd10: 'E03.5' },
    { key: 'THYROID-CA-SUSPICIOUS-NODULE', name: 'थायरॉइड गांठ संदिग्ध — केवल रेफर (जांच)', nameEn: 'Suspicious Thyroid Nodule — REFER ONLY (Workup)', icd10: 'C73' },
    { key: 'COMPRESSIVE-GOITRE', name: 'दबाव वाला गॉइटर — तत्काल सर्जिकल मूल्यांकन', nameEn: 'Compressive Goitre — Urgent Surgery Eval — REFER ONLY', icd10: 'E04.1' },
    { key: 'POST-OP-HYPOCALCEMIA', name: 'ऑपरेशन के बाद कैल्शियम कम — तत्काल रेफर', nameEn: 'Post-op Hypocalcemia — Urgent — REFER ONLY', icd10: 'E83.5' },
    { key: 'CUSHING-SUSPECT', name: 'कुशिंग सिंड्रोम संदेह — केवल रेफर', nameEn: 'Cushing Syndrome Suspect — REFER ONLY', icd10: 'E24.9' },
    { key: 'ADRENAL-CRISIS-SUSPECT', name: 'एड्रेनल कमी/क्राइसिस संदेह — केवल रेफर', nameEn: 'Adrenal Insufficiency/Crisis Suspect — REFER ONLY', icd10: 'E27.1' },
    { key: 'PITUITARY-MACROADENOMA-SUSPECT', name: 'पिट्यूटरी बड़ी गांठ संदेह — केवल रेफर', nameEn: 'Pituitary Macroadenoma Suspect — REFER ONLY', icd10: 'D35.2' },
    { key: 'HYPERPARATHYROID-SUSPECT', name: 'हाइपरपैराथायरॉइड संदेह (ऊंचा कैल्शियम) — केवल रेफर', nameEn: 'Hyperparathyroidism Suspect (Severe HyperCa) — REFER ONLY', icd10: 'E21.0' },
    { key: 'PHEO-SUSPECT', name: 'फिओक्रोमोसाइटोमा संदेह — केवल रेफर', nameEn: 'Pheochromocytoma Suspect — REFER ONLY', icd10: 'D35.0' },
    { key: 'CHILD-GROWTH-DISORDER', name: 'बच्चे की बढ़त विकार — बाल-एंडो रेफर', nameEn: 'Child Growth Disorder — Ped-Endocrine REFER', icd10: 'E34.5' },
    { key: 'PUBERTY-DISORDER', name: 'प्यूबर्टी विकार — बाल-एंडो रेफर', nameEn: 'Puberty Disorder — Ped-Endocrine REFER', icd10: 'E22.8' },
  ],

  // ══ Medicines (30) — India endocrine core ════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~30-day
  // dispense for chronic thyroid/calcium, shorter for courses.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  // Thyroxine protocol in EVERY levothyroxine salt: empty stomach 45-60 min
  // before breakfast · 4-hr gap from calcium/iron · same brand · TSH 6-8 wk
  // after any dose change.
  medicines: [
    // Levothyroxine — Thyronorm (dose-tier chain)
    { name: 'Thyronorm 12.5 mcg Tablet', salt: 'Levothyroxine 12.5 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine 25 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 37.5 mcg Tablet', salt: 'Levothyroxine 37.5 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine 50 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 62.5 mcg Tablet', salt: 'Levothyroxine 62.5 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 75 mcg Tablet', salt: 'Levothyroxine 75 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 88 mcg Tablet', salt: 'Levothyroxine 88 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 100 mcg Tablet', salt: 'Levothyroxine 100 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 112 mcg Tablet', salt: 'Levothyroxine 112 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 125 mcg Tablet', salt: 'Levothyroxine 125 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 150 mcg Tablet', salt: 'Levothyroxine 150 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; continue same brand; repeat TSH 6-8 weeks after any dose change', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // Levothyroxine — Eltroxin (brand alternative)
    { name: 'Eltroxin 25 mcg Tablet', salt: 'Levothyroxine 25 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; repeat TSH 6-8 weeks after any dose change; if switching from Thyronorm, recheck TSH after the switch', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Eltroxin 50 mcg Tablet', salt: 'Levothyroxine 50 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; repeat TSH 6-8 weeks after any dose change; if switching from Thyronorm, recheck TSH after the switch', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Eltroxin 100 mcg Tablet', salt: 'Levothyroxine 100 mcg — morning empty stomach, 45-60 min before breakfast, water only; keep 4-hr gap from calcium/iron; repeat TSH 6-8 weeks after any dose change; if switching from Thyronorm, recheck TSH after the switch', doseOptions: ['1 tab early morning empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // Anti-thyroid — CONTINUATION-ONLY (specialist-started)
    { name: 'Neomercazole 5 mg Tablet', salt: 'Carbimazole 5 mg — CONTINUATION of specialist-started therapy only; do not start fresh here; urgent CBC if fever/sore throat (agranulocytosis risk); pregnancy caution — inform doctor before planning', doseOptions: ['1 tab (5 mg)', '2 tabs (10 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Neomercazole 10 mg Tablet', salt: 'Carbimazole 10 mg — CONTINUATION of specialist-started therapy only; do not start fresh here; urgent CBC if fever/sore throat (agranulocytosis risk); pregnancy caution — inform doctor before planning', doseOptions: ['1 tab (10 mg)', '1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Calcium + D3 (4-hr gap from thyroxine in every salt)
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU — after food; keep at least 4-hr gap from thyroxine', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal HD Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 2000 IU — after food; keep at least 4-hr gap from thyroxine', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cipcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU — after food; keep at least 4-hr gap from thyroxine', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ostocalcium B12 Tablet', salt: 'Calcium + Vitamin B12 + Vitamin D3 — after food; keep at least 4-hr gap from thyroxine', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calcimax Forte Tablet', salt: 'Elemental Calcium + Magnesium + Zinc + Vitamin B12 + Vitamin D3 — after food; keep at least 4-hr gap from thyroxine', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Vitamin D3 60K course brands
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — 1 sachet weekly with milk × 8 weeks, then monthly × 2-3; retest vitamin D at 3 months', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calcirol 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — 1 sachet weekly with milk × 8 weeks, then monthly × 2-3; retest vitamin D at 3 months', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'D-Rise 60K Capsule', salt: 'Cholecalciferol 60,000 IU — 1 capsule weekly with milk × 8 weeks, then monthly × 2-3; retest vitamin D at 3 months', doseOptions: ['1 cap weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tayo 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — 1 sachet weekly with milk × 8 weeks, then monthly × 2-3; retest vitamin D at 3 months', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Supplements (kept to 2)
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C — after food', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 — after food', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Weight management — BMI-gated single entry
    { name: 'Obelit 120 Tablet', salt: 'Orlistat 120 mg — ONLY if BMI ≥ 30 (or ≥ 27 with risk factors) alongside a reduced-calorie diet; take with main meals; oily stools/flatulence common; may reduce fat-soluble vitamins A-D-E-K — take a multivitamin at bedtime (gap 2+ hrs); skip the dose if a meal contains no fat', doseOptions: ['1 tab with each main meal'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Hypoglycemia first aid
    { name: 'Glucon-D Powder', salt: 'Dextrose (glucose) powder — hypoglycemia first aid: 15-20 g in water immediately; repeat in 15 min if not better; then a complex meal; NEVER feed an unconscious patient — call emergency', doseOptions: ['15-20 g in water SOS'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Prolactin — CONTINUATION under specialist supervision
    { name: 'Caberlin 0.5 Tablet', salt: 'Cabergoline 0.5 mg — CONTINUATION of specialist-started therapy under endocrine supervision only; not for new starts here; inform doctor before planning pregnancy', doseOptions: ['1 tab twice weekly (after food)'], morning: 0, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (39) ════════════════════════════════════
  // REFER-ONLY findings (crisis/compressive/suspect/ped) carry ZERO links.
  findingMeds: [
    // HYPOTHYROID-MANAGED — Thyronorm dose-tier chain
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 12.5 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Lowest tier / elderly or cardiac-risk start' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 25 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'TSH 5-10 with symptoms: start 25-37.5 mcg' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 37.5 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Titration step between 25 and 50' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 50 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Standard adult start if TSH >10; recheck TSH 6-8 weeks' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 62.5 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Titration step between 50 and 75' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 75 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Step up when TSH still high on 50' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 88 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Fine titration step' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 100 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Titration step; verify empty-stomach intake first' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 112 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Fine titration step' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 125 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'High-dose tier; TSH-guided only' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Thyronorm 150 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'High-dose tier; TSH-guided only' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Eltroxin 25 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Brand alternative — recheck TSH after switch' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Eltroxin 50 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Brand alternative — recheck TSH after switch' },
    { findingKey: 'HYPOTHYROID-MANAGED', medicineName: 'Eltroxin 100 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Brand alternative — recheck TSH after switch' },
    // HYPERTHYROID-MANAGED — continuation only
    { findingKey: 'HYPERTHYROID-MANAGED', medicineName: 'Neomercazole 5 mg Tablet', dose: '1 tab (5 mg)', description: 'CONTINUATION of specialist-started therapy; verify dose; urgent CBC if fever/sore throat' },
    { findingKey: 'HYPERTHYROID-MANAGED', medicineName: 'Neomercazole 10 mg Tablet', dose: '1 tab (10 mg)', description: 'CONTINUATION only; TFT every 4-8 weeks; pregnancy caution' },
    // VITD-DEF-FU — course + calcium chains
    { findingKey: 'VITD-DEF-FU', medicineName: 'Uprise D3 60K Sachet', dose: '1 sachet weekly with milk', description: 'Weekly ×8 → monthly ×2-3; retest at 3 months' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet weekly with milk', description: 'Weekly ×8 → monthly ×2-3; retest at 3 months' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'D-Rise 60K Capsule', dose: '1 cap weekly with milk', description: 'Weekly ×8 → monthly ×2-3; retest at 3 months' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Tayo 60K Sachet', dose: '1 sachet weekly with milk', description: 'Weekly ×8 → monthly ×2-3; retest at 3 months' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Shelcal 500 Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Shelcal HD Tablet', dose: '1 tab after food', description: 'If higher D3 needed; 4-hr gap from thyroxine' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Cipcal 500 Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Ostocalcium B12 Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    { findingKey: 'VITD-DEF-FU', medicineName: 'Calcimax Forte Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    // OBESITY-MANAGED — lifestyle dominant, single gated drug
    { findingKey: 'OBESITY-MANAGED', medicineName: 'Obelit 120 Tablet', dose: '1 tab with each main meal', description: 'ONLY BMI ≥ 30 (≥27 with risk factors); with low-calorie diet; bedtime multivitamin' },
    // HYPOGLYCEMIA-WORKUP — first aid
    { findingKey: 'HYPOGLYCEMIA-WORKUP', medicineName: 'Glucon-D Powder', dose: '15-20 g in water SOS', description: 'Repeat in 15 min if not better; then complex meal; never feed unconscious' },
    // INFERTILITY-ENDO-FU — thyroid-linked continuation + OBG coordination
    { findingKey: 'INFERTILITY-ENDO-FU', medicineName: 'Thyronorm 25 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'When thyroid-linked; fertility TSH target stricter (<2.5) — dose per TSH' },
    { findingKey: 'INFERTILITY-ENDO-FU', medicineName: 'Thyronorm 50 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'TSH-guided continuation; continue OBG coordination' },
    // THY-CA-FU — suppressive continuation
    { findingKey: 'THY-CA-FU', medicineName: 'Thyronorm 100 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Suppressive continuation — TSH target per specialist risk category' },
    { findingKey: 'THY-CA-FU', medicineName: 'Thyronorm 125 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Suppressive dose tier — specialist-guided' },
    { findingKey: 'THY-CA-FU', medicineName: 'Thyronorm 150 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'High-risk suppression tier — specialist-guided' },
    { findingKey: 'THY-CA-FU', medicineName: 'Shelcal 500 Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    // IATROGENIC-ENDO-FU — post-surgical continuation
    { findingKey: 'IATROGENIC-ENDO-FU', medicineName: 'Thyronorm 75 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Post-thyroidectomy/radioiodine continuation; TSH-guided' },
    { findingKey: 'IATROGENIC-ENDO-FU', medicineName: 'Thyronorm 100 mcg Tablet', dose: '1 tab early morning empty stomach', description: 'Post-surgical continuation; TSH-guided' },
    { findingKey: 'IATROGENIC-ENDO-FU', medicineName: 'Shelcal 500 Tablet', dose: '1 tab after food', description: 'Calcium support; 4-hr gap from thyroxine' },
    { findingKey: 'IATROGENIC-ENDO-FU', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet weekly with milk', description: 'If vitamin D also low; retest at 3 months' },
    // PITUITARY-FU — specialist-supervised continuation
    { findingKey: 'PITUITARY-FU', medicineName: 'Caberlin 0.5 Tablet', dose: '1 tab twice weekly (after food)', description: 'CONTINUATION of specialist-started therapy; never self-modify; pregnancy — inform first' },
    { findingKey: 'PITUITARY-FU', medicineName: 'Neurobion Forte Tablet', dose: '1 tab after food', description: 'Supportive vitamin therapy' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Thyroid Dose Titration Grid (8 visits)',
      rows: 8,
      cols: 4,
      headerLabel: ['तारीख', 'TSH (µIU/ml)', 'खुराक (mcg)', 'अगला TSH'],
      colsLabel: ['Date', 'TSH (µIU/ml)', 'Dose (mcg)', 'Next TSH'],
      footerLabel: ['खुराक बदलने के 6-8 हफ्ते बाद ही TSH दोहराएं / Repeat TSH only 6-8 weeks after a dose change'],
      extraLabel: 'डॉक्टर-प्रयोग: TSH बैंड → अगली खुराक: <0.4 घटाएं · 0.4-4 जारी · 4-8 छोटा कदम · 8-20 एक स्टेप ऊपर · >20 बड़ा कदम + विशेषज्ञ / Doctor use: TSH band → next dose',
    },
    {
      name: 'Thyroxine Timing Card (daily)',
      rows: 6,
      cols: 3,
      headerLabel: ['समय', 'क्या लिया', 'नियम'],
      colsLabel: ['Time', 'What taken', 'Rule'],
      footerLabel: ['थायरॉक्सिन: खाली पेट · नाश्ते से 45-60 मिनट पहले · कैल्शियम/आयरन से 4 घंटे का अंतर · एक ही ब्रांड / Thyroxine: empty stomach · 45-60 min before breakfast · 4-hr gap from calcium/iron · same brand'],
    },
    {
      name: 'Weight Loss Ladder (12 weeks)',
      rows: 12,
      cols: 4,
      headerLabel: ['सप्ताह', 'वजन (kg)', 'कमर (cm)', 'टिप्पणी'],
      colsLabel: ['Week', 'Weight (kg)', 'Waist (cm)', 'Notes'],
      footerLabel: ['लक्ष्य: 6 महीने में वजन का 5-10% · क्रैश-डाइट नहीं · रोज चलें / Target: 5-10% of body weight in 6 months · no crash diet · walk daily'],
      extraLabel: 'लाल-झंडा: 6 महीने में 5%+ अनजाने वजन-घटना = तुरंत जांच / Red flag: 5%+ unintentional loss in 6 months = investigate now',
    },
    {
      name: 'TSH Interpretation Grid',
      rows: 8,
      cols: 4,
      headerLabel: ['TSH मान', 'T3/T4', 'मतलब', 'कदम'],
      colsLabel: ['TSH value', 'T3/T4', 'Meaning', 'Action'],
      footerLabel: ['लैब की अपनी सामान्य सीमा देखें (लगभग 0.4-4.0 µIU/ml) / Check the lab own reference range (~0.4-4.0 µIU/ml)'],
      extraLabel: 'डॉक्टर-प्रयोग: ऊंचा TSH → हाइपो · नीचे TSH → हाइपर/ओवरडोज · असंगत TSH-T3/T4 → विशेषज्ञ / Doctor use: high TSH → hypo · low TSH → hyper/overdose',
    },
    {
      name: 'Vitamin D Course Card (10 doses)',
      rows: 10,
      cols: 4,
      headerLabel: ['खुराक #', 'तारीख ली', 'हफ्ता/महीना', 'टिप्पणी'],
      colsLabel: ['Dose #', 'Date taken', 'Week/Month', 'Notes'],
      footerLabel: ['60K साप्ताहिक ×8 → मासिक ×2-3 → 3 महीने में विटामिन D री-टेस्ट / 60K weekly ×8 → monthly ×2-3 → retest vitamin D at 3 months'],
    },
    {
      name: 'Neck Self-Check Card (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['दिन', 'देखें (आईना)', 'निगलें (पानी)', 'टिप्पणी'],
      colsLabel: ['Day', 'Look (mirror)', 'Swallow (water)', 'Notes'],
      footerLabel: ['गांठ बढ़े, निगलने में दिक्कत या आवाज़ बदले तो तुरंत डॉक्टर को दिखाएं / Report immediately if lump grows, swallowing trouble or voice change'],
      extraLabel: 'आईने में गर्दन देखें · सिर पीछे झुकाएं · पानी का घूंट निगलें — गांठ ऊपर-नीचे चलती दिखें / Mirror look · tilt head back · swallow water — watch the lump move',
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Hypothyroidism — New Start',
      diagnosis: 'HYPOTHYROID-MANAGED',
      medicines: [
        { name: 'Thyronorm 25 mcg Tablet', dose: '1 tab (25 mcg)', duration: '6 weeks', instructions: 'Early morning empty stomach, 45-60 min before breakfast; 4-hr gap from calcium/iron; escalate to 50 mcg only if TSH >10 or per review' },
      ],
      labs: ['TSH, Free T3, Free T4 (baseline if not done)', 'Anti-TPO antibody (once)', 'CBC'],
      advice: 'दवा रोज एक ही समय खाली पेट · नाश्ते से 45-60 मिनट पहले · कैल्शियम/आयरन से 4 घंटे का अंतर · 6-8 हफ्ते बाद TSH दोहराना अनिवार्य',
      followUpDays: 42,
      isCommon: true,
    },
    {
      name: 'Hypothyroidism — Dose Titration Visit',
      diagnosis: 'HYPOTHYROID-MANAGED',
      medicines: [
        { name: 'Thyronorm 50 mcg Tablet', dose: '1 tab (50 mcg)', duration: '8 weeks', instructions: 'Adjusted per TSH — see the Dose Titration Grid; same brand continued; empty-stomach protocol unchanged' },
      ],
      labs: ['TSH (only if 6-8 weeks since last change)'],
      advice: 'खुराक बदलने के 6-8 हफ्ते बाद ही TSH · ब्रांड बदला तो री-चेक · लक्षण-डायरी (वजन/थकान) लाएं',
      followUpDays: 56,
      isCommon: true,
    },
    {
      name: 'Hyperthyroidism — Continuation Verify',
      diagnosis: 'HYPERTHYROID-MANAGED',
      medicines: [
        { name: 'Neomercazole 5 mg Tablet', dose: '1 tab (5 mg)', duration: '4 weeks', instructions: 'CONTINUATION of specialist-started dose — never a fresh start here; urgent CBC if fever/sore throat' },
        { name: 'Neomercazole 10 mg Tablet', dose: '1 tab (10 mg)', duration: '4 weeks', instructions: 'CONTINUATION only — pick ONE strength per the ongoing specialist plan' },
      ],
      labs: ['TSH / Free T3 / Free T4 (TFT)', 'CBC (urgent if fever or sore throat)'],
      advice: 'बुखार/गला खराब = तुरंत रिपोर्ट (श्वेत रक्त कोशिका जांच) · गर्भ-योजना पहले बताएं · गर्दन की नाप हर यात्रा में',
      followUpDays: 28,
    },
    {
      name: 'Vitamin D Deficiency — 8-Week Course',
      diagnosis: 'VITD-DEF-FU',
      medicines: [
        { name: 'Uprise D3 60K Sachet', dose: '1 sachet (60,000 IU)', duration: '8 weeks', instructions: 'Once weekly with milk; then monthly × 2-3; retest at 3 months' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab after food', duration: '8 weeks', instructions: 'Keep 4-hr gap from thyroxine if on thyroid medicine' },
      ],
      labs: ['Serum Vitamin D (retest at 3 months)', 'Serum Calcium (if symptoms)'],
      advice: 'हफ्ते में 3-4 दिन 15-20 मिनट धूप (बांह-टांग खुली) · कैल्शियम-युक्त आहार रोज · री-टेस्ट समय पर कराएं',
      followUpDays: 56,
      isCommon: true,
    },
    {
      name: 'Obesity — First-Line Lifestyle Consult',
      diagnosis: 'OBESITY-MANAGED',
      medicines: [
        { name: 'Obelit 120 Tablet', dose: '1 tab with each main meal', duration: '4 weeks review', instructions: 'ONLY BMI ≥ 30 (≥27 with risk factors); with reduced-calorie diet; bedtime multivitamin; skip dose if fat-free meal' },
      ],
      labs: ['Fasting sugar + HbA1c', 'TSH', 'Lipid profile'],
      advice: 'पहली लाइन: आहार + हफ्ते में 150 मिनट तेज चाल · लक्ष्य 6 महीने में 5-10% वजन-कमी · जिम-स्टेरॉइड कभी नहीं · बहुत ऊंचा BMI (>37.5) या साथ-बीमारी → बैरिएट्रिक रेफर',
      followUpDays: 30,
    },
    {
      name: 'Post-Thyroidectomy Follow-Up',
      diagnosis: 'THY-CA-FU',
      medicines: [
        { name: 'Thyronorm 100 mcg Tablet', dose: '1 tab (100 mcg)', duration: 'Ongoing', instructions: 'Suppressive continuation — TSH target per specialist risk category; empty-stomach protocol' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab after food', duration: 'Ongoing', instructions: '4-hr gap from thyroxine; watch for perioral tingling' },
        { name: 'Calcirol 60K Sachet', dose: '1 sachet monthly', duration: '3 months', instructions: 'If vitamin D also low; retest at 3 months' },
      ],
      labs: ['TSH (suppression target)', 'Serum Calcium', 'Thyroglobulin (as per specialist)'],
      advice: 'होंठ/उंगली झनझनाहट = तुरंत सीरम कैल्शियम · दवा खाली-पेट प्रोटोकॉल जारी · गर्दन में कोई गांठ वापस आए तो तुरंत रिपोर्ट',
      followUpDays: 42,
    },
  ],
}
