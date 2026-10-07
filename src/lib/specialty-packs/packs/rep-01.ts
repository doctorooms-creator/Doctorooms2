/**
 * REP-01 — IVF & FERTILITY STARTER PACK (T2)
 *
 * The India IVF/IUI clinic core: infertility-evaluation complaints,
 * ovulation-induction monitoring, IVF-cycle stage counselling, early-pregnancy
 * coordination (OBG-01 owns ANC), male-factor workup and couple counselling.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India fertility core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: all fertility drugs are SPECIALIST-TITRATED.
 * Doses are standard Indian-practice framing but NOT MBBS-signed-off.
 *
 * SAFETY RAILS BAKED INTO CONTENT (non-negotiable):
 * - Ovarian-stimulation injections (FSH/hMG/hCG/GnRH) = CLINIC-ADMINISTERED
 *   ONLY — never home self-inject via this pack.
 * - OHSS red flags (rapid weight gain / breathlessness / severe abdominal
 *   pain) = emergency line in every stimulation-related suggestion.
 * - Any positive test in IVF carries the ectopic-risk line (early scan with
 *   OBG coordination).
 * - Letrozole fertility use = off-label in some countries (common Indian
 *   practice) + specialist monitoring note.
 * - Clomiphene = max-cycle counselling + multiples-risk line.
 * - Surrogacy = Indian Surrogacy (Regulation) Act 2021 — altruistic-only,
 *   regulated; factual framing, zero moralizing.
 * - Azoospermia = uro-andrology referral; no magic-supplement claims.
 * - Herbal fertility products (Addyzoa etc.) EXCLUDED per policy.
 * - Miscarriage grief = never-blame framing, always.
 * - Refer-only findings (ectopic/OHSS/septic miscarriage/azoospermia/POI/
 *   recurrent-miscarriage workup/oncofertility) carry ZERO findingMeds links.
 *
 * Sources: India ART-OPD practice patterns · ICMR/National ART-framework
 * alignment · Surrogacy (Regulation) Act 2021 · unverified-dose launch mode.
 */

import type { SpecialtyPack } from '../types'

export const REP01_PACK: SpecialtyPack = {
  meta: {
    code: 'REP-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'IVF & Fertility Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'India IVF/IUI OPD patterns · Surrogacy (Regulation) Act 2021 framing · fertility drugs specialist-titrated · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'FER', name: 'निःसंतानता-मूल्यांकन', nameEn: 'Infertility Evaluation' },
    { key: 'OVR', name: 'ओवुलेशन-प्रेरणा', nameEn: 'Ovulation Induction' },
    { key: 'IVF', name: 'IVF-ICSI चरण', nameEn: 'IVF-ICSI Stages' },
    { key: 'PRE', name: 'गर्भावस्था-प्रारंभ', nameEn: 'Early Pregnancy' },
    { key: 'MAL', name: 'पुरुष-कारक', nameEn: 'Male Factor' },
    { key: 'COU', name: 'युगल-परामर्श', nameEn: 'Couple Counselling' },
  ],

  // ══ Complaints (46) ═══════════════════════════════════════════════════
  complaints: [
    // FER — Infertility Evaluation
    { code: 'FER01', categoryKey: 'FER', detail: '1 साल से कोशिश, गर्भ नहीं — पहली सलाह', detailEn: 'Trying 1 Year, Not Conceived — First Consult' },
    { code: 'FER02', categoryKey: 'FER', detail: 'अनियमित पीरियड के साथ संतान-कोशिश', detailEn: 'Trying with Irregular Periods' },
    { code: 'FER03', categoryKey: 'FER', detail: 'थायरॉइड की समस्या के साथ कोशिश', detailEn: 'Trying with Thyroid Problem' },
    { code: 'FER04', categoryKey: 'FER', detail: 'PCOS पहले से है — कोशिश', detailEn: 'Trying with Known PCOS' },
    { code: 'FER05', categoryKey: 'FER', detail: '35 की उम्र के बाद कोशिश', detailEn: 'Trying After Age 35' },
    { code: 'FER06', categoryKey: 'FER', detail: 'दूसरे बच्चे में कठिनाई', detailEn: 'Second Child Difficulty' },
    { code: 'FER07', categoryKey: 'FER', detail: 'एक बार गर्भपात — फिर कोशिश', detailEn: 'Miscarriage Once — Trying Again' },
    { code: 'FER08', categoryKey: 'FER', detail: 'बार-बार गर्भपात — जांच (रेफर)', detailEn: 'Recurrent Miscarriage — Workup (Refer)' },
    { code: 'FER09', categoryKey: 'FER', detail: 'सेमेन रिपोर्ट आई — समीक्षा', detailEn: 'Semen Report Done — Review' },
    { code: 'FER10', categoryKey: 'FER', detail: 'फॉलिक्युलर स्कैन हुआ — समीक्षा', detailEn: 'Follicular Scan Done — Review' },
    { code: 'FER11', categoryKey: 'FER', detail: 'ट्यूब ब्लॉक रिपोर्ट — परामर्श', detailEn: 'Blocked Tubes Report — Counselling' },
    { code: 'FER12', categoryKey: 'FER', detail: 'एंडोमेट्रियोसिस के साथ कोशिश', detailEn: 'Endometriosis with Fertility' },
    // OVR — Ovulation Induction
    { code: 'OVR01', categoryKey: 'OVR', detail: 'ओवुलेशन गोली पर — मॉनिटरिंग', detailEn: 'Ovulation Induction on Tablets — Monitoring' },
    { code: 'OVR02', categoryKey: 'OVR', detail: 'इंजेक्शन साइकल — फॉलो-अप', detailEn: 'Ovulation Injection Cycle — Follow-up' },
    { code: 'OVR03', categoryKey: 'OVR', detail: 'पतली एंडोमेट्रियम — सपोर्ट योजना', detailEn: 'Thin Endometrium — Support Plan' },
    { code: 'OVR04', categoryKey: 'OVR', detail: 'फाइब्रॉइड पहले से है — फर्टिलिटी योजना', detailEn: 'Known Fibroid — Fertility Plan' },
    { code: 'OVR05', categoryKey: 'OVR', detail: 'हाइड्रोसैल्पिंक्स ऑपरेशन के बाद — योजना', detailEn: 'Hydrosalpinx Removed — Plan' },
    { code: 'OVR06', categoryKey: 'OVR', detail: 'एडेनोमायोसिस — फर्टिलिटी योजना', detailEn: 'Adenomyosis Fertility Planning' },
    // IVF — IVF-ICSI Stages
    { code: 'IVF01', categoryKey: 'IVF', detail: 'IVF पहली सलाह', detailEn: 'IVF Consult — First Visit' },
    { code: 'IVF02', categoryKey: 'IVF', detail: 'IUI की सलाह', detailEn: 'IUI Consult' },
    { code: 'IVF03', categoryKey: 'IVF', detail: 'IVF एक बार फेल — अगली योजना', detailEn: 'IVF Failed Once — Next Plan' },
    { code: 'IVF04', categoryKey: 'IVF', detail: 'फ्रोजन एम्ब्रियो योजना', detailEn: 'IVF Frozen-Embryo Planning' },
    { code: 'IVF05', categoryKey: 'IVF', detail: 'एग रिट्रीवल के बाद — रिकवरी चेक', detailEn: 'Egg Retrieval Recovery Check' },
    { code: 'IVF06', categoryKey: 'IVF', detail: 'एम्ब्रियो ट्रांसफर हो गया — प्रतीक्षा', detailEn: 'Embryo Transfer Done — Wait Period Counselling' },
    { code: 'IVF07', categoryKey: 'IVF', detail: '2-वीक-वेट में बेचैनी', detailEn: '2-Week-Wait Anxiety Consult' },
    { code: 'IVF08', categoryKey: 'IVF', detail: 'बार-बार इम्प्लांटेशन फेल', detailEn: 'Repeated Implantation Failure Counselling' },
    { code: 'IVF09', categoryKey: 'IVF', detail: 'PGT / जेनेटिक टेस्टिंग परामर्श', detailEn: 'PGT / Genetic Testing Counselling' },
    { code: 'IVF10', categoryKey: 'IVF', detail: 'एग फ्रीजिंग की सलाह', detailEn: 'Egg-Freezing Consult' },
    // PRE — Early Pregnancy
    { code: 'PRE01', categoryKey: 'PRE', detail: 'IVF के बाद टेस्ट पॉजिटिव', detailEn: 'Pregnancy Test Positive After IVF' },
    { code: 'PRE02', categoryKey: 'PRE', detail: 'प्री-कॉन्सेप्शन — फोलिक/विटामिन', detailEn: 'Pre-Conception Folic-Vitamin Consult' },
    { code: 'PRE03', categoryKey: 'PRE', detail: 'थायरॉइड नॉर्मल करना — प्री-कॉन्सेप्शन', detailEn: 'Thyroid-Normalizing Pre-Conception' },
    { code: 'PRE04', categoryKey: 'PRE', detail: 'गर्भ से पहले टीका सलाह', detailEn: 'Vaccination Before Pregnancy Consult' },
    // MAL — Male Factor
    { code: 'MAL01', categoryKey: 'MAL', detail: 'एज़ोस्पर्मिया — परामर्श (यूरो रेफर)', detailEn: 'Azoospermia Diagnosed — Counselling (Refer Uro)' },
    { code: 'MAL02', categoryKey: 'MAL', detail: 'कम स्पर्म काउंट — दवा पर', detailEn: 'Low Sperm Count — On Medicine' },
    { code: 'MAL03', categoryKey: 'MAL', detail: 'वैरिकोसील ऑपरेटेड — फर्टिलिटी चेक', detailEn: 'Varicocele Operated — Fertility Check' },
    { code: 'MAL04', categoryKey: 'MAL', detail: 'कोशिश के समय नामर्दी', detailEn: 'Erectile Difficulty When Trying' },
    { code: 'MAL05', categoryKey: 'MAL', detail: 'शुगर के साथ फर्टिलिटी योजना', detailEn: 'Diabetes with Fertility Plan' },
    { code: 'MAL06', categoryKey: 'MAL', detail: 'हाई प्रोलैक्टिन के साथ कोशिश', detailEn: 'High Prolactin with Fertility' },
    { code: 'MAL07', categoryKey: 'MAL', detail: 'पुरुष सप्लीमेंट समीक्षा', detailEn: 'Male-Factor Supplements Review' },
    { code: 'MAL08', categoryKey: 'MAL', detail: 'इलाज से पहले वजन-घटाना', detailEn: 'Weight-Loss Before Treatment Plan' },
    // COU — Couple Counselling
    { code: 'COU01', categoryKey: 'COU', detail: 'इलाज का तनाव (PSY समन्वय)', detailEn: 'Stress with Fertility Treatment (PSY Coordination)' },
    { code: 'COU02', categoryKey: 'COU', detail: 'जोड़े के रिश्ते में तनाव', detailEn: 'Couple Relationship Strain Counselling' },
    { code: 'COU03', categoryKey: 'COU', detail: 'डोनर-एग परामर्श (संवेदनशील)', detailEn: 'Donor-Egg Counselling (Sensitive Framing)' },
    { code: 'COU04', categoryKey: 'COU', detail: 'सरोगेसी कानूनी परामर्श (2021 कानून)', detailEn: 'Surrogacy Legal Counselling (India 2021 Law)' },
    { code: 'COU05', categoryKey: 'COU', detail: 'कैंसर-रोगी फर्टिलिटी संरक्षण (अति-समय-संवेदनशील)', detailEn: 'Fertility Preservation — Cancer Patient (Oncofertility Urgent-Sensitive)' },
    { code: 'COU06', categoryKey: 'COU', detail: 'परिवार का दबाव — इलाज के साथ', detailEn: 'Family Pressure During Treatment' },
  ],

  // ══ Questions (92 — 2 per complaint) ══════════════════════════════════
  // `// idx N` = true 0-based array index (ZERO drift).
  questions: [
    // FER01 Trying 1 year — first consult
    { complaintCode: 'FER01', question: 'कितने महीने से संतान के लिए कोशिश कर रहे हैं?', questionEn: 'Since how many months have you been trying to conceive?' }, // idx 0
    { complaintCode: 'FER01', question: 'महिला पार्टनर की उम्र क्या है?', questionEn: 'What is the age of the female partner?' }, // idx 1
    // FER02 Trying with irregular periods
    { complaintCode: 'FER02', question: 'पीरियड कितने दिन के अंतर पर आते हैं (26-35 दिन में या नहीं)?', questionEn: 'How many days apart are the periods (within 26-35 days or not)?' }, // idx 2
    { complaintCode: 'FER02', question: 'आखिरी पीरियड की तारीख कब थी?', questionEn: 'What was the date of the last period?' }, // idx 3
    // FER03 Trying with thyroid problem
    { complaintCode: 'FER03', question: 'थायरॉइड की जांच रिपोर्ट (TSH) साथ लाई हैं?', questionEn: 'Have you brought the thyroid test report (TSH)?' }, // idx 4
    { complaintCode: 'FER03', question: 'थायरॉइड की दवा चालू है — कौन सी और किस डोज पर?', questionEn: 'Are you on thyroid medicine — which one and at what dose?' }, // idx 5
    // FER04 Trying with known PCOS
    { complaintCode: 'FER04', question: 'PCOS की जांच कब हुई थी (कौन सा साल)?', questionEn: 'In which year was PCOS diagnosed?' }, // idx 6
    { complaintCode: 'FER04', question: 'मौजूदा वजन क्या है (BMI हेतु)?', questionEn: 'What is the current weight (for BMI)?' }, // idx 7
    // FER05 Trying after age 35
    { complaintCode: 'FER05', question: 'पुरुष पार्टनर की उम्र क्या है?', questionEn: 'What is the age of the male partner?' }, // idx 8
    { complaintCode: 'FER05', question: '35 की उम्र के बाद से कितने महीने से कोशिश कर रहे हैं?', questionEn: 'For how many months have you been trying after age 35?' }, // idx 9
    // FER06 Second child difficulty
    { complaintCode: 'FER06', question: 'पहला बच्चा कितने साल का है?', questionEn: 'How old is the first child?' }, // idx 10
    { complaintCode: 'FER06', question: 'सप्ताह में लगभग कितनी बार संबंध बनता है (सहजता से बताएं)?', questionEn: 'Roughly how many times a week do you have intercourse (answer freely, no judgement)?' }, // idx 11
    // FER07 Miscarriage once — try again
    { complaintCode: 'FER07', question: 'गर्भपात कब और कितने सप्ताह के गर्भ पर हुआ?', questionEn: 'When did the miscarriage happen and at how many weeks?' }, // idx 12
    { complaintCode: 'FER07', question: 'गर्भपात के बाद पीरियड वापस नियमित हो गए हैं?', questionEn: 'Have periods become regular again after the miscarriage?' }, // idx 13
    // FER08 Recurrent miscarriage — refer workup
    { complaintCode: 'FER08', question: 'कुल कितनी बार गर्भपात हुआ — किन सप्ताहों पर?', questionEn: 'How many miscarriages in total — at which weeks?' }, // idx 14
    { complaintCode: 'FER08', question: 'पिछले गर्भपात की जांच/D&C रिपोर्ट साथ है?', questionEn: 'Are previous miscarriage / D&C reports with you?' }, // idx 15
    // FER09 Semen report review
    { complaintCode: 'FER09', question: 'सेमेन रिपोर्ट में काउंट, मोटिलिटी और मॉर्फोलॉजी के नंबर क्या हैं?', questionEn: 'What are the count, motility and morphology numbers in the semen report?' }, // idx 16
    { complaintCode: 'FER09', question: 'टेस्ट से पहले कितने दिन का ब्रेक (abstinence) रखा था?', questionEn: 'How many days of abstinence were kept before the test?' }, // idx 17
    // FER10 Follicular scan review
    { complaintCode: 'FER10', question: 'आज साइकल का कौन सा दिन है?', questionEn: 'Which day of the cycle is it today?' }, // idx 18
    { complaintCode: 'FER10', question: 'रिपोर्ट में फॉलिकल का आकार (mm) और एंडोमेट्रियम की मोटाई (mm) क्या है?', questionEn: 'What follicle size (mm) and endometrial thickness (mm) does the report show?' }, // idx 19
    // FER11 Blocked tubes report
    { complaintCode: 'FER11', question: 'ट्यूब ब्लॉक की रिपोर्ट कब और किस जांच (HSG/स्कैन) से आई?', questionEn: 'When and by which test (HSG/scan) did the blocked tube report come?' }, // idx 20
    { complaintCode: 'FER11', question: 'एक ट्यूब ब्लॉक है या दोनों?', questionEn: 'Is one tube blocked or both?' }, // idx 21
    // FER12 Endometriosis with fertility
    { complaintCode: 'FER12', question: 'एंडोमेट्रियोसिस की गांठ/लैप्रोस्कोपी रिपोर्ट साथ है?', questionEn: 'Are the endometriosis / laparoscopy reports with you?' }, // idx 22
    { complaintCode: 'FER12', question: 'पीरियड के समय दर्द कितना तेज है?', questionEn: 'How severe is the pain during periods?' }, // idx 23
    // OVR01 Ovulation induction on tablets
    { complaintCode: 'OVR01', question: 'ओवुलेशन की कौन सी गोली (क्लोमिफेन/लेट्रोज़ोल) और किस दिन से चल रही है?', questionEn: 'Which ovulation tablet (clomiphene/letrozole) is running and from which cycle day?' }, // idx 24
    { complaintCode: 'OVR01', question: 'गोली शुरू करने के बाद कितने साइकल हो चुके हैं?', questionEn: 'How many cycles have passed since starting the tablet?' }, // idx 25
    // OVR02 Injection cycle follow-up
    { complaintCode: 'OVR02', question: 'कौन सा इंजेक्शन लग रहा है और डॉक्टर ने कौन सी खुराक बताई है?', questionEn: 'Which injection is being given and at what doctor-advised dose?' }, // idx 26
    { complaintCode: 'OVR02', question: 'इंजेक्शन के बाद पेट में दर्द, सूजन या तेज वजन बढ़ना महसूस होता है?', questionEn: 'Any abdominal pain, bloating or rapid weight gain after the injections?' }, // idx 27
    // OVR03 Thin endometrium
    { complaintCode: 'OVR03', question: 'पिछले स्कैनों में एंडोमेट्रियम की सबसे ज्यादा मोटाई कितनी नापी गई?', questionEn: 'What was the maximum endometrial thickness measured in previous scans?' }, // idx 28
    { complaintCode: 'OVR03', question: 'पीरियड में बहाव कैसा है — कम या ठीक?', questionEn: 'How is the menstrual flow — scanty or normal?' }, // idx 29
    // OVR04 Known fibroid — fertility plan
    { complaintCode: 'OVR04', question: 'रिपोर्ट में फाइब्रॉइड की जगह और आकार क्या बताया गया है?', questionEn: 'What location and size of fibroid does the report mention?' }, // idx 30
    { complaintCode: 'OVR04', question: 'पीरियड में खून बहुत ज्यादा आता है?', questionEn: 'Is the menstrual bleeding very heavy?' }, // idx 31
    // OVR05 Hydrosalpinx removed — plan
    { complaintCode: 'OVR05', question: 'हाइड्रोसैल्पिंक्स ऑपरेशन कब हुआ और कौन सी ट्यूब में था?', questionEn: 'When was the hydrosalpinx surgery done and in which tube?' }, // idx 32
    { complaintCode: 'OVR05', question: 'ऑपरेशन के बाद कोई जांच (HSG) हुई है?', questionEn: 'Has any test (HSG) been done after the surgery?' }, // idx 33
    // OVR06 Adenomyosis fertility planning
    { complaintCode: 'OVR06', question: 'एडेनोमायोसिस की जांच कब और किस स्कैन से हुई?', questionEn: 'When and by which scan was adenomyosis diagnosed?' }, // idx 34
    { complaintCode: 'OVR06', question: 'पीरियड से पहले/के दौरान दर्द कितना तेज है?', questionEn: 'How severe is the pain before/during periods?' }, // idx 35
    // IVF01 IVF consult first visit
    { complaintCode: 'IVF01', question: 'पहले कोई फर्टिलिटी इलाज (IUI/IVF) लिया है — फाइल/रिपोर्ट साथ है?', questionEn: 'Any previous fertility treatment (IUI/IVF) — are files/reports with you?' }, // idx 36
    { complaintCode: 'IVF01', question: 'इलाज की लागत की चिंता है (EMI/बंडल योजना के बारे में जानना चाहेंगे)?', questionEn: 'Any worry about treatment cost (would like to know EMI/bundle plans)?' }, // idx 37
    // IVF02 IUI consult
    { complaintCode: 'IVF02', question: 'IUI स्वाभाविक साइकल में है या दवा/गोली के साथ?', questionEn: 'Is the IUI in a natural cycle or with medicines/tablets?' }, // idx 38
    { complaintCode: 'IVF02', question: 'ट्रिगर इंजेक्शन कब लगना है?', questionEn: 'When is the trigger injection scheduled?' }, // idx 39
    // IVF03 IVF failed once — next plan
    { complaintCode: 'IVF03', question: 'पिछले IVF में कितने अंडे निकले, कितने फर्टिलाइज हुए, कितने ट्रांसफर हुए?', questionEn: 'In the previous IVF — how many eggs retrieved, fertilized and transferred?' }, // idx 40
    { complaintCode: 'IVF03', question: 'कुल कितने IVF साइकल हो चुके और कौन सा स्टिम्युलेशन प्रोटोकॉल इस्तेमाल हुआ?', questionEn: 'How many IVF cycles so far and which stimulation protocol was used?' }, // idx 41
    // IVF04 Frozen-embryo planning
    { complaintCode: 'IVF04', question: 'कितने फ्रोजन एम्ब्रियो बचे हुए हैं?', questionEn: 'How many frozen embryos remain?' }, // idx 42
    { complaintCode: 'IVF04', question: 'फ्रोजन एम्ब्रियो की ग्रेडिंग (गुणवत्ता) रिपोर्ट में क्या लिखी है?', questionEn: 'What embryo grading (quality) is written in the report?' }, // idx 43
    // IVF05 Egg retrieval recovery
    { complaintCode: 'IVF05', question: 'एग रिट्रीवल कब हुई और कितने अंडे निकले?', questionEn: 'When was the egg retrieval and how many eggs were collected?' }, // idx 44
    { complaintCode: 'IVF05', question: 'रिट्रीवल के बाद से तेज वजन बढ़ना या सांस में तकलीफ है?', questionEn: 'Any rapid weight gain or breathlessness since the retrieval?' }, // idx 45
    // IVF06 Embryo transfer done — wait period
    { complaintCode: 'IVF06', question: 'एम्ब्रियो ट्रांसफर कब हुआ और कितने एम्ब्रियो ट्रांसफर किए गए?', questionEn: 'When was the embryo transfer done and how many embryos were transferred?' }, // idx 46
    { complaintCode: 'IVF06', question: 'प्रोजेस्टेरोन (Susten) की दवा बिल्कुल वैसे ही ले रही हैं जैसे बताया गया?', questionEn: 'Are you taking progesterone (Susten) exactly as advised?' }, // idx 47
    // IVF07 2-week-wait anxiety
    { complaintCode: 'IVF07', question: 'इस समय बेचैनी 0-10 में कितनी है?', questionEn: 'How much is the anxiety right now on a 0-10 scale?' }, // idx 48
    { complaintCode: 'IVF07', question: 'घर पर प्रेगनेंसी टेस्ट कर लिया है?', questionEn: 'Have you already done a home pregnancy test?' }, // idx 49
    // IVF08 Repeated implantation failure
    { complaintCode: 'IVF08', question: 'कुल कितने ट्रांसफर हुए और कितने टॉप-गुणवत्ता एम्ब्रियो थे?', questionEn: 'How many transfers in total and how many top-quality embryos?' }, // idx 50
    { complaintCode: 'IVF08', question: 'पिछले ट्रांसफर में एंडोमेट्रियम की मोटाई कितनी थी?', questionEn: 'What was the endometrial thickness during previous transfers?' }, // idx 51
    // IVF09 PGT / genetic testing counselling
    { complaintCode: 'IVF09', question: 'परिवार में कोई जेनेटिक/विरासती बीमारी है (थैलेसीमिया आदि)?', questionEn: 'Any genetic/hereditary disease in the family (thalassemia etc.)?' }, // idx 52
    { complaintCode: 'IVF09', question: 'बार-बार गर्भपात या IVF फेल होने का इतिहास है?', questionEn: 'Any history of repeated miscarriage or IVF failure?' }, // idx 53
    // IVF10 Egg-freezing consult
    { complaintCode: 'IVF10', question: 'एग फ्रीजिंग का कारण क्या है — करियर/इलाज/अन्य?', questionEn: 'What is the reason for egg freezing — career/treatment/other?' }, // idx 54
    { complaintCode: 'IVF10', question: 'वर्तमान उम्र क्या है?', questionEn: 'What is the current age?' }, // idx 55
    // PRE01 Test positive after IVF
    { complaintCode: 'PRE01', question: 'प्रेगनेंसी टेस्ट कब और किस दिन पॉजिटिव आया?', questionEn: 'When and on which day did the pregnancy test turn positive?' }, // idx 56
    { complaintCode: 'PRE01', question: 'पेट के एक तरफ दर्द या रक्तस्राव है?', questionEn: 'Any one-sided abdominal pain or bleeding?' }, // idx 57
    // PRE02 Pre-conception folic/vitamin
    { complaintCode: 'PRE02', question: 'फोलिक एसिड की कोई दवा पहले से चल रही है?', questionEn: 'Are you already taking any folic acid tablet?' }, // idx 58
    { complaintCode: 'PRE02', question: 'खाने में हरी पत्तेदार सब्जियां/फोलिक स्रोत कितनी बार आते हैं?', questionEn: 'How often do green leafy vegetables/folate sources come in the diet?' }, // idx 59
    // PRE03 Thyroid-normalizing pre-conception
    { complaintCode: 'PRE03', question: 'आखिरी TSH रिपोर्ट कब हुई और वैल्यू क्या थी?', questionEn: 'When was the last TSH report and what was the value?' }, // idx 60
    { complaintCode: 'PRE03', question: 'थायरॉइड की दवा नियमित रूप से खाली पेट ली जा रही है?', questionEn: 'Is the thyroid tablet being taken regularly on an empty stomach?' }, // idx 61
    // PRE04 Vaccination before pregnancy
    { complaintCode: 'PRE04', question: 'रूबेला (Rubella) का टीका लगा है या जांच हुई है?', questionEn: 'Has the rubella vaccine been taken or the test done?' }, // idx 62
    { complaintCode: 'PRE04', question: 'हेपेटाइटिस-B की खुराकें पूरी हुई हैं?', questionEn: 'Have the hepatitis-B doses been completed?' }, // idx 63
    // MAL01 Azoospermia counselling
    { complaintCode: 'MAL01', question: 'सेमेन टेस्ट कितनी बार हुआ — दोनों बार शून्य (azoospermia)?', questionEn: 'How many times was the semen test done — zero both times (azoospermia)?' }, // idx 64
    { complaintCode: 'MAL01', question: 'हार्मोन जांच (FSH/टेस्टोस्टेरोन) या जेनेटिक जांच हुई है?', questionEn: 'Have hormone tests (FSH/testosterone) or genetic testing been done?' }, // idx 65
    // MAL02 Low sperm count — on medicine
    { complaintCode: 'MAL02', question: 'पहले और अब स्पर्म काउंट में कौन से नंबर आए?', questionEn: 'What were the previous and current sperm counts?' }, // idx 66
    { complaintCode: 'MAL02', question: 'काम/रहन-सहन में ज्यादा गर्मी (रसोई/ड्राइविंग/फैक्ट्री), गर्म स्नान या टाइट कपड़े?', questionEn: 'Does work/life involve excess heat (kitchen/driving/factory), hot baths or tight clothes?' }, // idx 67
    // MAL03 Varicocele operated — fertility check
    { complaintCode: 'MAL03', question: 'वैरिकोसील का ऑपरेशन कब हुआ?', questionEn: 'When was the varicocele surgery done?' }, // idx 68
    { complaintCode: 'MAL03', question: 'रिपोर्ट में वैरिकोसील का ग्रेड (1-3) क्या लिखा है?', questionEn: 'What varicocele grade (1-3) is written in the report?' }, // idx 69
    // MAL04 Erectile difficulty when trying
    { complaintCode: 'MAL04', question: 'सुबह-सुबह भी नामर्दी (दिक्कत) रहती है?', questionEn: 'Is the erectile difficulty present even in the early mornings?' }, // idx 70
    { complaintCode: 'MAL04', question: 'तनाव या नींद की समस्या भी साथ है?', questionEn: 'Any stress or sleep problems alongside?' }, // idx 71
    // MAL05 Diabetes with fertility plan
    { complaintCode: 'MAL05', question: 'शुगर कब से है और कौन सी दवा चल रही है?', questionEn: 'Since when is the diabetes and which medicines are running?' }, // idx 72
    { complaintCode: 'MAL05', question: 'आखिरी HbA1c का नंबर क्या था?', questionEn: 'What was the last HbA1c value?' }, // idx 73
    // MAL06 High prolactin with fertility
    { complaintCode: 'MAL06', question: 'प्रोलैक्टिन रिपोर्ट की वैल्यू क्या थी?', questionEn: 'What was the prolactin report value?' }, // idx 74
    { complaintCode: 'MAL06', question: 'स्तनों से दूध जैसा स्राव या सिरदर्द भी है?', questionEn: 'Any milk-like breast discharge or headaches too?' }, // idx 75
    // MAL07 Male-factor supplements review
    { complaintCode: 'MAL07', question: 'कौन से सप्लीमेंट कब से चल रहे हैं?', questionEn: 'Which supplements have been running since when?' }, // idx 76
    { complaintCode: 'MAL07', question: 'तंबाकू/शराब का सेवन करते हैं?', questionEn: 'Do you use tobacco or alcohol?' }, // idx 77
    // MAL08 Weight-loss before treatment
    { complaintCode: 'MAL08', question: 'मौजूदा वजन और ऊंचाई क्या है?', questionEn: 'What is the current weight and height?' }, // idx 78
    { complaintCode: 'MAL08', question: 'पिछले 3 महीनों में वजन कितना बदला?', questionEn: 'How much has the weight changed in the last 3 months?' }, // idx 79
    // COU01 Stress with fertility treatment
    { complaintCode: 'COU01', question: 'इलाज का दबाव 0-10 में कितना महसूस होता है?', questionEn: 'How much treatment pressure is felt on a 0-10 scale?' }, // idx 80
    { complaintCode: 'COU01', question: 'नींद और भूख कैसी चल रही है?', questionEn: 'How are sleep and appetite currently?' }, // idx 81
    // COU02 Couple relationship strain
    { complaintCode: 'COU02', question: 'इस दौरान जोड़े के रिश्ते में तनाव बढ़ा है?', questionEn: 'Has strain increased in the relationship during this period?' }, // idx 82
    { complaintCode: 'COU02', question: 'साथी का सहयोग 0-10 में कितना है?', questionEn: 'How supportive is the partner on a 0-10 scale?' }, // idx 83
    // COU03 Donor-egg counselling
    { complaintCode: 'COU03', question: 'डॉक्टर ने डोनर-एग का विकल्प कब बताया?', questionEn: 'When did the doctor discuss the donor-egg option?' }, // idx 84
    { complaintCode: 'COU03', question: 'जोड़े ने इस विकल्प पर आपस में बात की है?', questionEn: 'Have you discussed this option together as a couple?' }, // idx 85
    // COU04 Surrogacy legal counselling
    { complaintCode: 'COU04', question: 'सरोगेसी के लिए डॉक्टर/कानूनी सलाह से मिले हैं?', questionEn: 'Have you met a doctor/legal advisor for surrogacy?' }, // idx 86
    { complaintCode: 'COU04', question: 'सरोगेसी कानून 2021 के बारे में जानकारी रखते हैं?', questionEn: 'Are you aware of the Surrogacy Law 2021?' }, // idx 87
    // COU05 Oncofertility — urgent-sensitive
    { complaintCode: 'COU05', question: 'कैंसर का इलाज (कीमो/रेडिएशन) कब शुरू होना है?', questionEn: 'When is the cancer treatment (chemo/radiation) starting?' }, // idx 88
    { complaintCode: 'COU05', question: 'ऑन्को डॉक्टर से फर्टिलिटी-संरक्षण की बात हुई है?', questionEn: 'Has fertility preservation been discussed with the oncologist?' }, // idx 89
    // COU06 Family pressure during treatment
    { complaintCode: 'COU06', question: 'परिवार से बच्चे पर दबाव/सवाल कितनी बार आते हैं?', questionEn: 'How often do pressure/questions about a baby come from the family?' }, // idx 90
    { complaintCode: 'COU06', question: 'इस दबाव का मन पर असर 0-10 में कितना है?', questionEn: 'How much does this pressure affect the mind on a 0-10 scale?' }, // idx 91
  ],

  // ══ Suggestions (184 — exactly 2 per question; questionIndex matches) ══
  suggestions: [
    // FER01 q0 — trying months
    { questionIndex: 0, text: '12 महीने से कम कोशिश (महिला <35 साल) — स्वाभाविक तरीका जारी रखें; फर्टाइल विंडो कैलेंडर से उपजाऊ दिन पहचानें', textEn: 'Trying under 12 months (female under 35) — continue natural approach; identify fertile days with the fertile-window calendar' },
    { questionIndex: 0, text: '12 महीने+ (या 35+ उम्र में 6 महीने+) — दोनों पार्टनर की बुनियादी जांच शुरू करें', textEn: '12+ months (or 6+ months at age 35+) — start basic workup of both partners' },
    // FER01 q1 — female age (AMH-decline honest line)
    { questionIndex: 1, text: 'उम्र 35+ — अंडों की संख्या और गुणवत्ता उम्र के साथ घटती है (ईमानदार जानकारी); 6 महीने में गर्भ न रहने पर AMH जांच कराएं', textEn: 'Age 35+ — egg number and quality decline with age (honest note); get AMH tested if not pregnant in 6 months' },
    { questionIndex: 1, text: 'उम्र <35 — आराम रखें; 12 महीने के भीतर ज्यादातर जोड़े सफल हो जाते हैं', textEn: 'Age under 35 — reassurance; most couples conceive within 12 months' },
    // FER02 q2 — cycle regularity 26-35d
    { questionIndex: 2, text: 'चक्र 26-35 दिन — सामान्य माना जाता है; फर्टाइल-विंडो कैलेंडर + OPK स्ट्रिप इस्तेमाल करें', textEn: 'Cycle 26-35 days — considered regular; use the fertile-window calendar + OPK strips' },
    { questionIndex: 2, text: 'चक्र 35 दिन+ या बदलता-बदलता — ओवुलेशन जांच सोचें (PCOS/थायरॉइड हार्मोन)', textEn: 'Cycle 35+ days or unpredictable — consider ovulation workup (PCOS/thyroid hormones)' },
    // FER02 q3 — last period date
    { questionIndex: 3, text: 'तारीख नोट करें — फर्टाइल-विंडो कैलेंडर से अगले उपजाऊ दिन निकालें', textEn: 'Note the date — calculate the next fertile days with the fertile-window calendar' },
    { questionIndex: 3, text: 'तारीख धुंधली — अगली बार पीरियड की तारीख कैलेंडर/ऐप में दाग लगाएं', textEn: 'Date uncertain — mark the next period date in a calendar/app from now on' },
    // FER03 q4 — TSH brought
    { questionIndex: 4, text: 'TSH 2.5 से ज्यादा (प्रेगनेंसी-प्लानिंग रेंज) — डोज-रिव्यू कराएं (END समन्वय)', textEn: 'TSH above 2.5 (conception-planning range) — get the dose reviewed (END coordination)' },
    { questionIndex: 4, text: 'TSH सामान्य — आगे की जांच जारी रखें; रिपोर्ट रिकॉर्ड में लगाएं', textEn: 'TSH normal — continue the workup; paste the report in the record' },
    // FER03 q5 — thyroid medicine
    { questionIndex: 5, text: 'थायरॉइड दवा चालू — रोज सुबह खाली पेट नियमित लें; डोज END डॉक्टर से सत्यापित कराएं', textEn: 'On thyroid medicine — take daily on empty stomach, regularly; verify dose with END doctor' },
    { questionIndex: 5, text: 'दवा बंद/अनियमित — TSH दोहराएं; प्री-कॉन्सेप्शन में थायरॉइड नियंत्रण जरूरी', textEn: 'Medicine stopped/irregular — repeat TSH; thyroid control is essential pre-conception' },
    // FER04 q6 — PCOS diagnosed year
    { questionIndex: 6, text: 'PCOS नई जांच (1 साल के भीतर) — वजन-प्रबंधन + ओवुलेशन ट्रैकिंग से शुरुआत (OBG समन्वय)', textEn: 'PCOS diagnosed recently (within 1 year) — start with weight management + ovulation tracking (OBG coordination)' },
    { questionIndex: 6, text: 'PCOS पुराना + दवा से ओवुलेशन चाहिए — मॉनिटर्ड-टैबलेट साइकल का विकल्प डॉक्टर से पूछें', textEn: 'Long-standing PCOS wanting ovulation on medicines — ask the doctor about a monitored tablet cycle' },
    // FER04 q7 — weight/BMI
    { questionIndex: 7, text: 'BMI 18.5-24.9 से बाहर — स्टिम्युलेशन/इलाज से पहले वजन-लक्ष्य बनाएं (END समन्वय)', textEn: 'BMI outside 18.5-24.9 — set a weight target before stimulation/treatment (END coordination)' },
    { questionIndex: 7, text: 'BMI सामान्य — हर महीने वजन रिकॉर्ड रखें; OPK स्ट्रिप से ओवुलेशन ट्रैक करें', textEn: 'BMI normal — keep a monthly weight record; track ovulation with OPK strips' },
    // FER05 q8 — male age
    { questionIndex: 8, text: 'पुरुष 45+ — शुक्राणु गुणवत्ता पर उम्र का हल्का असर संभव; सेमेन टेस्ट ही मार्गदर्शक बनेगा', textEn: 'Male 45+ — mild age effect on sperm quality possible; the semen test will be the guide' },
    { questionIndex: 8, text: 'पुरुष <45 — उम्र की चिंता सीमित; जीवनशैली पर ध्यान दें (धूम्रपान/गर्मी)', textEn: 'Male under 45 — age concern is limited; focus on lifestyle (smoking/heat)' },
    // FER05 q9 — months since 35
    { questionIndex: 9, text: '6 महीने+ — अब जांच शुरू करें; 35+ उम्र में और इंतजार की सलाह नहीं', textEn: '6+ months — start the workup now; further waiting is not advised at 35+' },
    { questionIndex: 9, text: '6 महीने से कम — फर्टाइल विंडो का पूरा इस्तेमाल करें; 6 महीने पूरे होने पर जांच कराएं', textEn: 'Under 6 months — use the fertile window fully; investigate once 6 months complete' },
    // FER06 q10 — first child age
    { questionIndex: 10, text: 'पहला बच्चा 3 साल+ पहले — सेकेंडरी इनफर्टिलिटी जांच (दोनों पार्टनर) शुरू करें', textEn: 'First child 3+ years ago — start secondary-infertility workup (both partners)' },
    { questionIndex: 10, text: 'पहला बच्चा हाल का — स्तनपान/पीरियड वापसी का हिसाब रखें; फिर भी 1 साल+ पर जांच', textEn: 'First child recent — account for breastfeeding/period return; still investigate at 1 year+' },
    // FER06 q11 — intercourse frequency (natural framing)
    { questionIndex: 11, text: 'हफ्ते में 2-3 बार — सामान्य आवृत्ति; उपजाऊ दिनों में एक दिन छोड़कर कोशिश करें', textEn: '2-3 times a week — normal frequency; try every other day within the fertile window' },
    { questionIndex: 11, text: 'महीने में कुछ ही बार — उपजाऊ दिनों में समय-संबंध बढ़ाएं; दोनों सहज रहें, यह साझा कोशिश है', textEn: 'Only a few times a month — increase timed intercourse on fertile days; stay relaxed, this is a shared effort' },
    // FER07 q12 — miscarriage when/weeks (never-blame)
    { questionIndex: 12, text: '12 हफ्ते से पहले का गर्भपात — आम है, अक्सर गुणसूत्र कारण से; यह आपका दोष नहीं है', textEn: 'Miscarriage before 12 weeks — common, usually chromosome-related; it is NOT your fault' },
    { questionIndex: 12, text: '12 हफ्ते के बाद का गर्भपात — अगली योजना से पहले सीमित जांच पर विचार करें', textEn: 'Miscarriage after 12 weeks — consider a limited workup before the next plan' },
    // FER07 q13 — periods after m/c
    { questionIndex: 13, text: 'पीरियड नियमित — शरीर रिकवर हो रहा है; फोलिक एसिड आज से शुरू करें', textEn: 'Periods regular — body is recovering; start folic acid from today' },
    { questionIndex: 13, text: 'पीरियड 2 महीने+ अनियमित — थायरॉइड/प्रोलैक्टिन जांच कराएं', textEn: 'Periods irregular for 2+ months — test thyroid/prolactin' },
    // FER08 q14 — miscarriage count (refer-workup flag)
    { questionIndex: 14, text: '2+ गर्भपात — रिकरेंट-मिसकैरेज वर्कअप जरूरी (रक्त, एंटी-फॉस्फोलिपिड, गुणसूत्र जांच) — रेफर किया जाएगा', textEn: '2+ miscarriages — recurrent-miscarriage workup needed (bloods, antiphospholipid, karyotype) — will be referred' },
    { questionIndex: 14, text: 'हर गर्भपात दुखद है — इलाज से ज्यादातर मदद मिलती है; दुख की देखभाल भी उतनी ही जरूरी है', textEn: 'Every miscarriage is distressing — treatment usually helps; grief care matters just as much' },
    // FER08 q15 — D&C reports
    { questionIndex: 15, text: 'रिपोर्ट उपलब्ध — टिशू जांच के नतीजे रेफर-वर्कअप में काम आएंगे', textEn: 'Reports available — tissue findings will help the referral workup' },
    { questionIndex: 15, text: 'रिपोर्ट नहीं — कोई दिक्कत नहीं; रेफर-वर्कअप नई जांचों से शुरू होगा', textEn: 'No reports — no problem; the referral workup will start with fresh tests' },
    // FER09 q16 — semen numbers
    { questionIndex: 16, text: 'काउंट <15 मिलियन/मिली या मोटिलिटी <32% — पुरुष-कारक जांच + 3 महीने जीवनशैली सुधार + दोबारा टेस्ट', textEn: 'Count under 15 million/ml or motility under 32% — male-factor workup + 3 months lifestyle change + repeat test' },
    { questionIndex: 16, text: 'नंबर सामान्य — पुरुष कारक संभावना कम; महिला-पक्ष की जांच पर ध्यान दें', textEn: 'Numbers normal — male factor unlikely; focus on the female workup' },
    // FER09 q17 — abstinence days
    { questionIndex: 17, text: 'ब्रेक 2-5 दिन — सही तरीका; रिपोर्ट भरोसेमंद मानी जा सकती है', textEn: 'Abstinence 2-5 days — correct method; the report can be trusted' },
    { questionIndex: 17, text: 'ब्रेक 1 दिन या 10 दिन+ — नंबर बदल सकते हैं; 2-5 दिन रखकर दोहराएं', textEn: 'Abstinence 1 day or 10+ days — numbers can change; repeat with 2-5 days' },
    // FER10 q18 — cycle day today
    { questionIndex: 18, text: 'आज डे-10 से 14 — फॉलिकल स्कैन/टाइमिंग का सही समय; रिपोर्ट लेकर आज ही मिलें', textEn: 'Today day 10-14 — right time for follicle scan/timing; meet with the report today itself' },
    { questionIndex: 18, text: 'आज डे-2/3 — नई साइकल शुरू; गोली/जांच की योजना इसी हफ्ते बनेगी', textEn: 'Today day 2/3 — new cycle starting; tablet/test plan will be made this week' },
    // FER10 q19 — follicle/endo mm
    { questionIndex: 19, text: 'फॉलिकल 18-22 mm + एंडोमेट्रियम 8 mm+ — परिपक्व; डॉक्टर से ट्रिगर/टाइमिंग की तारीख पूछें', textEn: 'Follicle 18-22 mm + lining 8 mm+ — mature; ask the doctor about trigger/timing date' },
    { questionIndex: 19, text: 'फॉलिकल <14 mm — अभी वक्त है; अगली मॉनिटरिंग तारीख पर स्कैन दोहराएं', textEn: 'Follicle under 14 mm — there is time; repeat the scan on the next monitoring date' },
    // FER11 q20 — blocked tube report
    { questionIndex: 20, text: 'HSG से ब्लॉक पुष्टि — स्कैन/लैप्रोस्कोपी राय लें; दोनों ट्यूब ब्लॉक होने पर IVF अक्सर सीधा-रास्ता है', textEn: 'HSG confirms block — get scan/laparoscopy opinion; with both tubes blocked IVF is often the direct route' },
    { questionIndex: 20, text: 'रिपोर्ट 6 महीने+ पुरानी — ताजा मूल्यांकन पर विचार करें; उम्र बढ़ने के साथ समय मायने रखता है', textEn: 'Report 6+ months old — consider fresh evaluation; time matters as age advances' },
    // FER11 q21 — one or both tubes
    { questionIndex: 21, text: 'दोनों ट्यूब ब्लॉक — स्वाभाविक गर्भ नहीं बन सकता; IVF सीधा विकल्प — लागत-प्रश्न सूची साथ रखें', textEn: 'Both tubes blocked — natural conception cannot occur; IVF is the direct option — keep the cost-questions checklist handy' },
    { questionIndex: 21, text: 'एक ट्यूब खुली — स्वाभाविक कोशिश संभव; ओवुलेशन-ट्रैकिंग + समय-संबंध जारी रखें', textEn: 'One tube open — natural attempt possible; continue ovulation tracking + timed intercourse' },
    // FER12 q22 — endometriosis reports
    { questionIndex: 22, text: 'लैप्रोस्कोपी रिपोर्ट साथ — स्टेजिंग देखी जाएगी; हल्की स्टेज पर ओवुलेशन-प्रेरणा + समय-संबंध से शुरुआत हो सकती है', textEn: 'Laparoscopy report available — staging will be reviewed; mild stage may start with ovulation induction + timed intercourse' },
    { questionIndex: 22, text: 'रिपोर्ट नहीं — पिछले ऑपरेशन/स्कैन की कॉपी मंगवाएं; योजना इसी पर टिकी है', textEn: 'No report — request copies of past surgery/scan; the plan depends on it' },
    // FER12 q23 — period pain severity
    { questionIndex: 23, text: 'बहुत तेज दर्द — एंडोमेट्रियोसिस का इलाज (OBG समन्वय) गर्भ-योजना से पहले जरूरी', textEn: 'Very severe pain — endometriosis treatment (OBG coordination) before the conception plan' },
    { questionIndex: 23, text: 'दर्द सहनीय — दर्द-दवा सीमित रखें (पैरासिटामोल) — कोशिश के दौरान सुरक्षित विकल्प', textEn: 'Pain tolerable — limit painkillers to paracetamol — the safe option while trying' },
    // OVR01 q24 — which tablet (letrozole off-label + clomid safety)
    { questionIndex: 24, text: 'लेट्रोज़ोल (Fempro/Letrova) — फर्टिलिटी में भारत में आम अभ्यास (कुछ देशों में ऑफ-लेबल); केवल विशेषज्ञ-निगरानी में लें', textEn: 'Letrozole (Fempro/Letrova) — common Indian fertility practice (off-label in some countries); take only with specialist monitoring' },
    { questionIndex: 24, text: 'क्लोमिफेन (Siphene) — ज्यादा से ज्यादा साइकल-सीमा और जुड़वां-गर्भ के छोटे खतरे के बारे में डॉक्टर से पूछें', textEn: 'Clomiphene (Siphene) — ask the doctor about the maximum-cycle limit and the small twin-pregnancy risk' },
    // OVR01 q25 — cycles on tablet
    { questionIndex: 25, text: '3 साइकल से कम — जवाब आने में समय लगता है; स्कैन-मॉनिटरिंग जारी रखें', textEn: 'Under 3 cycles — response takes time; continue scan monitoring' },
    { questionIndex: 25, text: '6 साइकल+ गोली पर — आगे के विकल्प (इंजेक्शन/IUI/IVF) डॉक्टर से बात करें', textEn: '6+ tablet cycles — discuss next options (injections/IUI/IVF) with the doctor' },
    // OVR02 q26 — injection dose (clinic-only rail)
    { questionIndex: 26, text: 'FSH/hCG इंजेक्शन केवल क्लिनिक में डॉक्टर/नर्स द्वारा — घर पर खुद कभी नहीं; डोज कभी खुद न बदलें', textEn: 'FSH/hCG injections are CLINIC-ADMINISTERED ONLY by doctor/nurse — never self-inject at home; never change the dose yourself' },
    { questionIndex: 26, text: 'इंजेक्शन साइकल में खुराक विशेषज्ञ हर स्कैन के बाद बदलते हैं — यह सामान्य प्रक्रिया है', textEn: 'In injection cycles specialists adjust the dose after each scan — this is a normal process' },
    // OVR02 q27 — post-injection symptoms (OHSS rail)
    { questionIndex: 27, text: 'तेज पेट दर्द + तेज वजन बढ़ना + सांस फूलना — OHSS खतरा: आज ही क्लिनिक/इमरजेंसी', textEn: 'Severe abdominal pain + rapid weight gain + breathlessness — OHSS risk: clinic/emergency TODAY' },
    { questionIndex: 27, text: 'हल्का भारीपन/दर्द — सामान्य हो सकता है; वजन रोज नापें और क्लिनिक को बताते रहें', textEn: 'Mild heaviness/ache — can be normal; weigh daily and keep the clinic informed' },
    // OVR03 q28 — max lining
    { questionIndex: 28, text: '7 mm से कम बार-बार — पतली लाइनिंग; प्रोटोकॉल-आधारित सपोर्ट (Progynova/Susten) डॉक्टर से पूछें', textEn: 'Repeatedly under 7 mm — thin lining; ask the doctor about protocol-based support (Progynova/Susten)' },
    { questionIndex: 28, text: '8 mm+ कभी नापी गई — अच्छा संकेत; पिछले स्कैन रिपोर्ट साथ लाएं', textEn: '8 mm+ measured before — good sign; bring previous scan reports along' },
    // OVR03 q29 — menstrual flow
    { questionIndex: 29, text: 'कम बहाव + पतली लाइनिंग — डॉक्टर से लाइनिंग-सपोर्ट योजना पूछें', textEn: 'Scanty flow + thin lining — ask the doctor about a lining-support plan' },
    { questionIndex: 29, text: 'बहाव सामान्य — हीमोग्लोबिन जांच रखें; फोलिक + आयरन जारी रखें', textEn: 'Normal flow — keep hemoglobin checked; continue folic + iron' },
    // OVR04 q30 — fibroid location/size
    { questionIndex: 30, text: 'फाइब्रॉइड गुहा (cavity) में — गर्भावस्था पर असर; OBG से निकालने की सलाह लें', textEn: 'Fibroid in the cavity — affects pregnancy; take OBG advice on removal' },
    { questionIndex: 30, text: 'दीवार में छोटा (<5 cm) — अक्सर इलाज जारी रखा जा सकता है (OBG समन्वय)', textEn: 'Small intramural (under 5 cm) — treatment can often continue (OBG coordination)' },
    // OVR04 q31 — heavy periods
    { questionIndex: 31, text: 'ज्यादा खून — एनीमिया जांच (CBC); आयरन + फोलिक चालू रखें', textEn: 'Heavy bleeding — check anemia (CBC); continue iron + folic' },
    { questionIndex: 31, text: 'ज्यादा खून + फाइब्रॉइड — OBG से इलाज/सर्जरी के सही समय के बारे में पूछें', textEn: 'Heavy bleeding + fibroid — ask OBG about the right timing of treatment/surgery' },
    // OVR05 q32 — hydrosalpinx surgery when
    { questionIndex: 32, text: 'ऑपरेशन 3 महीने+ पहले — अब IVF-प्लानिंग शुरू हो सकती है; रिपोर्ट साथ रखें', textEn: 'Surgery 3+ months ago — IVF planning can start now; keep reports handy' },
    { questionIndex: 32, text: 'ऑपरेशन हाल का — रिकवरी पूरी होने दें; अगली योजना डॉक्टर से बनाएं', textEn: 'Surgery recent — allow full recovery; make the next plan with the doctor' },
    // OVR05 q33 — HSG after surgery
    { questionIndex: 33, text: 'बाकी ट्यूब की HSG/जांच नहीं — जांच पूरी कराएं; IVF या स्वाभाविक का निर्णय इसी पर है', textEn: 'No HSG of the remaining tube — complete the testing; the IVF vs natural decision depends on it' },
    { questionIndex: 33, text: 'जांच हुई — नतीजे लाएं; ट्यूब साफ हो तो प्राकृतिक कोशिश संभव है', textEn: 'Test done — bring the results; if the tube is clear a natural attempt may be possible' },
    // OVR06 q34 — adenomyosis scan
    { questionIndex: 34, text: 'एमआरआई/स्कैन से पुष्टि — गहराई/आकार के हिसाब से योजना बनेगी; OBG समन्वय जारी रखें', textEn: 'Confirmed on MRI/scan — the plan depends on depth/size; keep OBG coordination going' },
    { questionIndex: 34, text: 'सिर्फ USG पर संदेह — दूसरी राय/एमआरआई पर विचार करें', textEn: 'Suspected only on USG — consider a second opinion/MRI' },
    // OVR06 q35 — pain severity
    { questionIndex: 35, text: 'बहुत तेज दर्द — एडेनोमायोसिस का इलाज (OBG) गर्भ-योजना से पहले कराएं', textEn: 'Very severe pain — treat the adenomyosis (OBG) before the conception plan' },
    { questionIndex: 35, text: 'दर्द सीमित — इलाज के साथ समय-संबंध कोशिश चल सकती है; हर 3-6 महीने समीक्षा', textEn: 'Pain limited — timed attempts can continue alongside treatment; review every 3-6 months' },
    // IVF01 q36 — previous treatment/files
    { questionIndex: 36, text: 'पिछला इलाज हुआ — पूरी फाइल लाएं; पुराना प्रोटोकॉल देखकर ही नया प्लान बनेगा', textEn: 'Previous treatment — bring the complete file; the new plan needs the old protocol' },
    { questionIndex: 36, text: 'पहली बार IVF की सलाह — लागत-प्रश्न सूची (बंडल/EMI/दवाएं शामिल?) क्लिनिक से पूछने के लिए उठाएं', textEn: 'First-time IVF advice — take the cost-questions checklist (bundle/EMI/meds included?) to ask the clinic' },
    // IVF01 q37 — cost worry (transparent framing)
    { questionIndex: 37, text: 'लागत की चिंता वाजिब है — क्लिनिक से लिखित पैकेज मांगें: क्या-क्या शामिल है, दवाएं अलग से या नहीं?', textEn: 'Cost worry is valid — ask the clinic for a written package: what is included, are medicines separate?' },
    { questionIndex: 37, text: 'EMI/साइकल-बंडल के बारे में पूछें और तुलना करें — यह आपका अधिकार है; छिपी लागत साफ पूछें', textEn: 'Ask about EMI/cycle-bundles and compare — it is your right; ask about hidden costs clearly' },
    // IVF02 q38 — IUI natural/meds
    { questionIndex: 38, text: 'टैबलेट-साइकल IUI — मॉनिटरिंग स्कैन की तारीखें नोट करें; ट्रिगर केवल क्लिनिक में', textEn: 'Tablet-cycle IUI — note the monitoring scan dates; trigger only in clinic' },
    { questionIndex: 38, text: 'इंजेक्शन-साइकल IUI — खुराक कभी खुद न बदलें; OHSS संकेत जानें (तेज वजन बढ़ना/सांस फूलना)', textEn: 'Injection-cycle IUI — never change the dose yourself; know OHSS signs (rapid weight gain/breathlessness)' },
    // IVF02 q39 — trigger timing
    { questionIndex: 39, text: 'ट्रिगर के 34-38 घंटे बाद IUI — समय पर क्लिनिक पहुंचें; समय सबसे जरूरी है', textEn: 'IUI happens 34-38 hours after the trigger — reach the clinic on time; timing is everything' },
    { questionIndex: 39, text: 'ट्रिगर की तारीख पता नहीं — क्लिनिक से आज ही पुष्टि कराएं', textEn: 'Trigger date unknown — confirm with the clinic today itself' },
    // IVF03 q40 — eggs/fertilized/transferred
    { questionIndex: 40, text: 'कम अंडे/फर्टिलाइजेशन — अगले साइकल में प्रोटोकॉल बदला जा सकता है; IVF डॉक्टर से लाइन-बाय-लाइन पूछें', textEn: 'Low eggs/fertilization — the protocol can change next cycle; ask the IVF doctor line-by-line' },
    { questionIndex: 40, text: 'अच्छे अंडे पर भी फेल — एंडोमेट्रियम/एम्ब्रियो गुणवत्ता पर बात करें; यह आपकी गलती नहीं है', textEn: 'Good eggs yet failed — discuss lining/embryo quality; this is NOT your fault' },
    // IVF03 q41 — cycles + protocol
    { questionIndex: 41, text: '2 साइकल+ — प्रोटोकॉल-बदलाव/लैब-समीक्षा का समय; IVF डॉक्टर से विकल्पों पर बात करें', textEn: '2+ cycles — time for protocol-change/lab-review; discuss options with the IVF doctor' },
    { questionIndex: 41, text: 'पहला साइकल फेल — यह सामान्य है; अगली कोशिश की सफलता अक्सर इतनी ही रहती है (ईमानदार-आशावादी)', textEn: 'First cycle failed — this is common; next-cycle success usually stays similar (honest optimism)' },
    // IVF04 q42 — frozen embryos remaining
    { questionIndex: 42, text: 'फ्रोजन एम्ब्रियो बचे — FET कम खर्च और हल्की-दवा वाला विकल्प; समय का दबाव कम', textEn: 'Frozen embryos remaining — FET is a cheaper, lighter-medication option; less time pressure' },
    { questionIndex: 42, text: 'कोई एम्ब्रियो नहीं बचा — नया स्टिम्युलेशन चाहिए; पहले लागत-प्रश्न सूची पूछें', textEn: 'No embryos left — fresh stimulation needed; ask the cost-questions checklist first' },
    // IVF04 q43 — embryo grading
    { questionIndex: 43, text: 'टॉप-ग्रेड एम्ब्रियो — उम्मीद बनाए रखें; प्रोजेस्टेरोन समय पर जारी रखें', textEn: 'Top-grade embryo — stay hopeful; continue progesterone on time' },
    { questionIndex: 43, text: 'कम ग्रेड — ग्रेड सिर्फ एक कारक है; डॉक्टर से अगली योजना (PGT/बदलाव) पूछें', textEn: 'Lower grade — grade is only one factor; ask the doctor about the next plan (PGT/changes)' },
    // IVF05 q44 — retrieval when/how many
    { questionIndex: 44, text: 'रिट्रीवल 24 घंटे के भीतर — आराम + भरपूर तरल; हल्का ऐंठन सामान्य है', textEn: 'Retrieval within 24 hours — rest + plenty of fluids; mild cramping is normal' },
    { questionIndex: 44, text: 'रिट्रीवल 2 दिन+ पहले — सामान्य हल्की गतिविधि ठीक है; पेट की सूजन बढ़े तो तुरंत बताएं', textEn: 'Retrieval 2+ days ago — normal light activity is fine; report increasing bloating immediately' },
    // IVF05 q45 — OHSS red flags
    { questionIndex: 45, text: 'तेज वजन बढ़ना/सांस फूलना — गंभीर OHSS के संकेत: तुरंत क्लिनिक/इमरजेंसी', textEn: 'Rapid weight gain/breathlessness — severe OHSS signs: clinic/emergency NOW' },
    { questionIndex: 45, text: 'दोनों नहीं — अच्छा संकेत; वजन रोज नापते रहें; पानी पर्याप्त लें', textEn: 'Neither present — good sign; keep weighing daily; drink adequate fluids' },
    // IVF06 q46 — transfer done (rest myth-bust)
    { questionIndex: 46, text: 'ट्रांसफर 1-5 दिन पहले — बिस्तर-आराम की मजबूरी नहीं; सामान्य हल्की गतिविधि बिल्कुल ठीक है', textEn: 'Transfer 1-5 days ago — bed rest is NOT mandatory; normal light activity is completely fine' },
    { questionIndex: 46, text: '1 से ज्यादा एम्ब्रियो — जुड़वां-गर्भ का खतरा डॉक्टर ने बताया होगा; आगे एकल-एम्ब्रियो विकल्प पूछें', textEn: 'More than 1 embryo — twin risk would have been explained; ask about the single-embryo option going ahead' },
    // IVF06 q47 — progesterone adherence
    { questionIndex: 47, text: 'समय पर प्रोजेस्टेरोन — बहुत जरूरी; रात की खुराक कभी न भूलें (अलार्म लगाएं)', textEn: 'Progesterone on time — critical; never miss the night dose (set an alarm)' },
    { questionIndex: 47, text: 'खुराक छूट रही है — अलार्म से नियमित करें; याद से छूटे तो उसी दिन डॉक्टर से पूछकर ही लें', textEn: 'Doses being missed — regularize with alarms; if missed, take only after asking the doctor the same day' },
    // IVF07 q48 — anxiety level
    { questionIndex: 48, text: '7+ बेचैनी — रोज 15 मिनट पैदल + श्वास-विश्राम; नींद का ध्यान रखें (PSY समन्वय)', textEn: 'Anxiety 7+ — daily 15-min walk + breathing relaxation; protect sleep (PSY coordination)' },
    { questionIndex: 48, text: 'हल्की बेचैनी — स्वाभाविक है; साथी के साथ रहें; फोन पर जानकारी-बाढ़ सीमित करें', textEn: 'Mild anxiety — it is natural; stay close to your partner; limit information-flood on the phone' },
    // IVF07 q49 — home test (no-test-early rail)
    { questionIndex: 49, text: 'जल्दी किया होम-टेस्ट — अक्सर गलत-नकारात्मक/अस्पष्ट आता है; बताई गई तारीख पर ब्लड टेस्ट कराएं', textEn: 'Early home test — often false-negative/ambiguous; get the blood test on the given date' },
    { questionIndex: 49, text: 'घबराहट स्वाभाविक — टेस्ट की तारीख तक ध्यान बंटाएं; 2-वीक-वेट गाइड देखें', textEn: 'Anxiety is natural — distract yourself till the test date; see the 2-week-wait guide' },
    // IVF08 q50 — transfers count
    { questionIndex: 50, text: '2+ अच्छे-एम्ब्रियो ट्रांसफर फेल — रिपीटेड इम्प्लांटेशन फेल्योर जांच (लाइनिंग/थ्रॉम्बोफिलिया/हाइस्टेरोस्कोपी) पूछें', textEn: '2+ good-embryo transfers failed — ask about the RIF workup (lining/thrombophilia/hysteroscopy)' },
    { questionIndex: 50, text: 'एक बार फेल — अभी RIF नहीं माना जाता; अगली कोशिश में सफलता अक्सर होती है', textEn: 'Single failure — not yet classified as RIF; the next attempt often succeeds' },
    // IVF08 q51 — endo thickness
    { questionIndex: 51, text: 'लाइनिंग <7 mm बार-बार — लाइनिंग-सपोर्ट प्रोटोकॉल (Progynova/Susten) डॉक्टर से पूछें', textEn: 'Lining under 7 mm repeatedly — ask the doctor about the lining-support protocol (Progynova/Susten)' },
    { questionIndex: 51, text: 'लाइनिंग 8+ mm — संरचना ठीक थी; अगला कदम एम्ब्रियो-पक्ष पर ध्यान देगा', textEn: 'Lining 8+ mm — the structure was fine; the next step focuses on the embryo side' },
    // IVF09 q52 — family genetic disease
    { questionIndex: 52, text: 'परिवार में जेनेटिक बीमारी (थैलेसीमिया आदि) — दोनों पार्टनर का कैरियर-टेस्ट कराएं', textEn: 'Family genetic disease (thalassemia etc.) — get carrier testing of both partners' },
    { questionIndex: 52, text: 'कोई इतिहास नहीं — PGT वैकल्पिक है; जरूरत पर डॉक्टर बताएंगे', textEn: 'No family history — PGT is optional; the doctor will advise if needed' },
    // IVF09 q53 — repeated m/c or IVF fail
    { questionIndex: 53, text: 'बार-बार गर्भपात/IVF फेल — PGT-A जैसे विकल्प समझें; गुणसूत्र-जांच कारण बता सकती है', textEn: 'Repeated miscarriage/IVF failure — understand options like PGT-A; chromosome testing can reveal the cause' },
    { questionIndex: 53, text: 'ऐसा इतिहास नहीं — PGT का लाभ सीमित; लागत-फायदे के सवाल पूछें', textEn: 'No such history — PGT benefit is limited; ask cost-benefit questions' },
    // IVF10 q54 — reason for freezing
    { questionIndex: 54, text: 'करियर/भविष्य के लिए — उम्र जितनी कम, अंडे उतने बेहतर; ईमानदार जानकारी: फ्रीजिंग गारंटी नहीं है', textEn: 'For career/future — the younger you freeze, the better the eggs; honest note: freezing is not a guarantee' },
    { questionIndex: 54, text: 'कैंसर-इलाज से पहले — ऑन्को-टीम से आज ही बात करें; यह समय-सीमित निर्णय है', textEn: 'Before cancer treatment — speak with the onco-team TODAY; this is a time-sensitive decision' },
    // IVF10 q55 — age
    { questionIndex: 55, text: '35+ उम्र — एक साइकल में अंडे कम मिल सकते हैं; पहले AMH जांच कराएं', textEn: 'Age 35+ — fewer eggs per cycle are likely; get AMH tested first' },
    { questionIndex: 55, text: '<35 उम्र — अच्छी स्थिति; डॉक्टर से अंडे-संख्या का अनुमान (AFC स्कैन) लें', textEn: 'Under 35 — good position; get an egg-count estimate (AFC scan) from the doctor' },
    // PRE01 q56 — test positive (ectopic rail + OBG coordination)
    { questionIndex: 56, text: 'पॉजिटिव — बधाई; हार्मोन/प्रोजेस्टेरोन दवाएं जारी रखें; OBG से स्कैन 6-7 हफ्तों पर (OBG-01 ANC का ध्यान रखेगा)', textEn: 'Positive — congratulations; continue hormone/progesterone medicines; OBG scan at 6-7 weeks (OBG-01 owns ANC)' },
    { questionIndex: 56, text: 'IVF-गर्भ में बाहरी गर्भ (ectopic) का खतरा ज्यादा होता है — एक तरफ दर्द/रक्तस्राव हो तो तुरंत जाएं', textEn: 'IVF pregnancies carry a higher ectopic risk — go immediately if one-sided pain/bleeding occurs' },
    // PRE01 q57 — one-sided pain/bleeding
    { questionIndex: 57, text: 'एक तरफ दर्द + खून — एक्टोपिक संदेह: आज ही इमरजेंसी/OBG (रात में भी)', textEn: 'One-sided pain + bleeding — ectopic suspected: emergency/OBG TODAY (even at night)' },
    { questionIndex: 57, text: 'दर्द नहीं, हल्का धब्बा — आम हो सकता है; फिर भी आज सूचित करें; स्कैन की तारीख पूछें', textEn: 'No pain, light spotting — can be common; still inform today; ask for the scan date' },
    // PRE02 q58 — folic already
    { questionIndex: 58, text: 'फोलिक चालू — बढ़िया; डोज पुष्टि कराएं (400 माइक्रोग्राम लक्ष्य; भारत में 5 mg गोली आम अभ्यास)', textEn: 'Already on folic — good; confirm the dose (400 mcg target; the 5 mg tablet is common Indian practice)' },
    { questionIndex: 58, text: 'फोलिक नहीं — आज से शुरू करें; लाभ गर्भ की पहली पहचान से पहले ही शुरू हो जाता है', textEn: 'Not on folic — start from today; the benefit starts even before pregnancy is detected' },
    // PRE02 q59 — dietary folate
    { questionIndex: 59, text: 'रोज हरी सब्जियां — अच्छा आधार; गोली फिर भी जरूरी (आहार अकेला पर्याप्त नहीं)', textEn: 'Daily greens — good base; the tablet is still needed (diet alone is insufficient)' },
    { questionIndex: 59, text: 'आहार में कमी — पत्तेदार सब्जी/दाल/फल जोड़ें + फोलिक गोली रोज', textEn: 'Diet lacking — add leafy vegetables/lentils/fruits + a daily folic tablet' },
    // PRE03 q60 — last TSH
    { questionIndex: 60, text: 'TSH 1 साल+ पुरानी — दोहराएं; प्रेगनेंसी-प्लान में TSH <2.5 लक्ष्य रहता है (END समन्वय)', textEn: 'TSH over 1 year old — repeat; conception planning targets TSH under 2.5 (END coordination)' },
    { questionIndex: 60, text: 'TSH हाल की — वैल्यू नोट करें; गर्भ-योजना के साथ डोज-रिव्यू कराएं', textEn: 'Recent TSH — note the value; get a dose review alongside the conception plan' },
    // PRE03 q61 — thyroid timing
    { questionIndex: 61, text: 'खाली पेट सुबह — सही तरीका; भोजन/कैल्शियम से 30-60 मिनट का फासला रखें', textEn: 'Empty-stomach morning — correct method; keep a 30-60 min gap from food/calcium' },
    { questionIndex: 61, text: 'समय अनियमित — दवा का फायदा घट जाता है; अलार्म लगाकर नियमित करें', textEn: 'Timing irregular — the dose benefit drops; set alarms and regularize' },
    // PRE04 q62 — rubella
    { questionIndex: 62, text: 'रूबेला IgG जांच कराएं — नकारात्मक हो तो टीका लगवाकर 1 महीना इंतजार करें', textEn: 'Get rubella IgG tested — if negative, vaccinate and wait 1 month before conceiving' },
    { questionIndex: 62, text: 'टीका लगा है — अच्छा; रिपोर्ट/तारीख नोट करके रखें', textEn: 'Already vaccinated — good; keep the report/date noted' },
    // PRE04 q63 — Hep-B
    { questionIndex: 63, text: 'हेप-B खुराकें बाकी — श्रृंखला (0-1-6 महीने) पूरी करें; गर्भावस्था में भी सुरक्षित', textEn: 'Hep-B doses pending — complete the series (0-1-6 months); safe in pregnancy too' },
    { questionIndex: 63, text: 'हेप-B पूरा + रिपोर्ट — बढ़िया; दोनों पार्टनर की स्थिति जांचें', textEn: 'Hep-B complete + report — excellent; check the status of both partners' },
    // MAL01 q64 — semen zero (azoospermia refer rail)
    { questionIndex: 64, text: 'दो बार शून्य (2-5 दिन ब्रेक पर) — एज़ोस्पर्मिया पुष्टि: यूरो-एंड्रोलॉजी रेफर जरूरी; विकल्प मौजूद हैं', textEn: 'Zero twice (with 2-5 day abstinence) — azoospermia confirmed: uro-andrology referral essential; options exist' },
    { questionIndex: 64, text: 'एक बार शून्य — दोहराने से पहले ब्रेक/तकनीक देखें; रेफर की सलाह फिर भी रहेगी', textEn: 'Single zero result — check abstinence/technique before repeating; referral will still be advised' },
    // MAL01 q65 — hormone/genetic tests
    { questionIndex: 65, text: 'FSH/टेस्टोस्टेरोन + कैरियोटाइप नहीं हुए — यही रेफर-वर्कअप है; अग्रिम रूप से कराए जा सकते हैं', textEn: 'FSH/testosterone + karyotype not done — these form the referral workup; can be done in advance' },
    { questionIndex: 65, text: 'जांचें हो चुकी — रिपोर्ट लेकर यूरो-एंड्रोलॉजी से मिलें; विकल्प (mTESA/TESA विशेषज्ञ करते हैं) मौजूद हैं', textEn: 'Tests done — meet uro-andrology with reports; options (mTESA/TESA by specialists) exist' },
    // MAL02 q66 — counts before/now
    { questionIndex: 66, text: 'काउंट बढ़ रहा है — सही दिशा; 3 महीने और जारी रखें, फिर दोबारा टेस्ट', textEn: 'Count improving — right direction; continue 3 more months, then re-test' },
    { questionIndex: 66, text: 'काउंट स्थिर/गिरा — दवा-समीक्षा + जीवनशैली (धूम्रपान/गर्मी) दोबारा देखें', textEn: 'Count flat/dropped — medicine review + recheck lifestyle (smoking/heat)' },
    // MAL02 q67 — heat exposure + tight/hot myth audit
    { questionIndex: 67, text: 'गर्म रसोई/ड्राइविंग/फैक्ट्री का काम — ब्रेक लें, ढीले कपड़े पहनें; शुक्राणु ~3 महीने में नए बनते हैं', textEn: 'Hot kitchen/driving/factory work — take breaks, wear loose clothes; sperm renew over ~3 months' },
    { questionIndex: 67, text: 'गर्म स्नान/टाइट जींस — सबूत सीमित है, पर बचना आसान है — लैपटॉप गोद में न रखें', textEn: 'Hot baths/tight jeans — evidence is limited, but easy to avoid — do not keep the laptop on the lap' },
    // MAL03 q68 — varicocele surgery when
    { questionIndex: 68, text: 'ऑपरेशन 6 महीने+ पहले — सेमेन सुधार 3-6 महीने में दिखता है; अब टेस्ट दोहराएं', textEn: 'Surgery 6+ months ago — semen improves over 3-6 months; re-test now' },
    { questionIndex: 68, text: 'ऑपरेशन हाल का — 3 महीने बाद सेमेन टेस्ट कराएं; गर्म स्नान/भारी व्यायाम से बचें', textEn: 'Surgery recent — get the semen test after 3 months; avoid hot baths/heavy exercise' },
    // MAL03 q69 — varicocele grade
    { questionIndex: 69, text: 'ग्रेड 2-3 + काउंट कम — सर्जरी का लाभ संभव; यूरो (URO) की राय लें', textEn: 'Grade 2-3 + low count — surgery may benefit; take a URO opinion' },
    { questionIndex: 69, text: 'ग्रेड 1 + काउंट सामान्य — केवल निगरानी काफी है; इलाज जारी रखें', textEn: 'Grade 1 + normal count — observation alone is enough; continue treatment' },
    // MAL04 q70 — morning difficulty
    { questionIndex: 70, text: 'सुबह भी दिक्कत — शारीरिक कारण संभव; URO से मिलना बनेगा', textEn: 'Difficulty even in mornings — a physical cause is possible; a URO visit is due' },
    { questionIndex: 70, text: 'सुबह ठीक, शाम को दिक्कत — तनाव/परफॉरमेंस-दबाव संभावित (PSY समन्वय); जोड़े की खुली बातचीत मदद करती है', textEn: 'Fine in mornings, trouble in evenings — stress/performance pressure likely (PSY coordination); open couple communication helps' },
    // MAL04 q71 — stress/sleep
    { questionIndex: 71, text: 'तनाव + नींद की समस्या — नींद को प्राथमिकता दें; सुधार अक्सर नींक से शुरू होता है', textEn: 'Stress + sleep trouble — prioritize sleep; improvement often starts with sleep' },
    { questionIndex: 71, text: 'तनाव बहुत तेज — रिश्ते में बातचीत बढ़ाएं; जरूरत पर PSY-रेफर — यह एक सामान्य कदम है', textEn: 'Stress severe — increase communication in the relationship; PSY referral if needed — it is a normal step' },
    // MAL05 q72 — diabetes
    { questionIndex: 72, text: 'शुगर चालू — प्री-कॉन्सेप्शन में HbA1c लक्ष्य सख्त रहता है; DIA डॉक्टर-समन्वय जारी रखें', textEn: 'Diabetes ongoing — the HbA1c target stays strict pre-conception; continue DIA doctor coordination' },
    { questionIndex: 72, text: 'दवाएं जारी रखें; खुद से कभी बंद/बदलें नहीं; गर्भ-योजना के समय डोज-रिव्यू होता है', textEn: 'Continue the medicines; never stop/change on your own; a dose review happens around conception' },
    // MAL05 q73 — HbA1c
    { questionIndex: 73, text: 'HbA1c 6.5% से ज्यादा — गर्भ-योजना से पहले नियंत्रण जरूरी (DIA समन्वय)', textEn: 'HbA1c above 6.5% — control is needed before the conception plan (DIA coordination)' },
    { questionIndex: 73, text: 'HbA1c <6.5% — अच्छा नियंत्रण; फोलिक शुरू करें और योजना बनाएं', textEn: 'HbA1c under 6.5% — good control; start folic and make the plan' },
    // MAL06 q74 — prolactin value
    { questionIndex: 74, text: 'प्रोलैक्टिन बढ़ा — सही तरीके से दोहराएं (सुबह, तनाव-रहित); दवा END डॉक्टर शुरू करेंगे', textEn: 'Prolactin raised — repeat it correctly (morning, low stress); the END doctor will start the medicine' },
    { questionIndex: 74, text: 'हल्का बढ़ा — अक्सर तनाव/नींद की कमी से; दोहराने पर अक्सर सामान्य आता है', textEn: 'Mildly raised — often from stress/poor sleep; frequently normal on repeat' },
    // MAL06 q75 — discharge/headache
    { questionIndex: 75, text: 'दूध-स्राव/सिरदर्द + प्रोलैक्टिन बढ़ा — पिट्यूटरी MRI का निर्णय END डॉक्टर करेंगे; रेफर किया जाएगा', textEn: 'Milk-discharge/headache + raised prolactin — the END doctor will decide on pituitary MRI; will be referred' },
    { questionIndex: 75, text: 'लक्षण नहीं — दवा-रिव्यू END समन्वय से होगा; फर्टिलिटी योजना समानांतर चल सकती है', textEn: 'No symptoms — medicine review via END coordination; the fertility plan can proceed in parallel' },
    // MAL07 q76 — supplements list
    { questionIndex: 76, text: 'ज्यादा सप्लीमेंट आपस में टकरा रहे हैं — लाभ के सबूत सीमित; डॉक्टर से सूची व्यवस्थित कराएं', textEn: 'Too many overlapping supplements — evidence of benefit is limited; let the doctor streamline the list' },
    { questionIndex: 76, text: 'हर्बल उत्पाद (Addyzoa जैसे) — नीति अनुसार इस पैक में शामिल नहीं; सबूत-आधारित विकल्प पूछें', textEn: 'Herbal products (like Addyzoa) — not included in this pack per policy; ask for evidence-based options' },
    // MAL07 q77 — tobacco/alcohol
    { questionIndex: 77, text: 'धूम्रपान/शराब — स्पर्म-DNA को नुकसान पहुंचाते हैं; दोनों पार्टनर आज से बंद करें', textEn: 'Smoking/alcohol — damages sperm DNA; both partners should stop from today' },
    { questionIndex: 77, text: 'नहीं करते — बढ़िया; निष्क्रिय धुआं भी कम करें; घर को धुआं-मुक्त रखें', textEn: 'Neither used — excellent; also reduce second-hand smoke; keep the home smoke-free' },
    // MAL08 q78 — weight/height
    { questionIndex: 78, text: 'BMI 30+ — 5-10% वजन-घटाव से ओवुलेशन वापस आ सकती है (END समन्वय); इलाज से पहले 3-6 महीने', textEn: 'BMI 30+ — 5-10% weight loss can restore ovulation (END coordination); 3-6 months before treatment' },
    { questionIndex: 78, text: 'BMI सामान्य — वजन बनाए रखें; अचानक बदलाव से बचें', textEn: 'BMI normal — maintain the weight; avoid sudden changes' },
    // MAL08 q79 — weight change
    { questionIndex: 79, text: 'तेजी से वजन बढ़ा — थायरॉइड/PCOS जांच कराएं; यह इलाज-योजना में रुकावट बनता है', textEn: 'Rapid weight gain — test thyroid/PCOS; it hampers the treatment planning' },
    { questionIndex: 79, text: 'वजन स्थिर — अच्छा; लक्ष्य-ट्रैकिंग जारी रखें', textEn: 'Weight stable — good; continue target tracking' },
    // COU01 q80 — treatment pressure
    { questionIndex: 80, text: '7+ दबाव — इलाज की सफलता पर असर पड़ता है; रोज 15 मिनट पैदल + जोड़े का साथ-समय (PSY समन्वय)', textEn: 'Pressure 7+ — affects treatment success; daily 15-min walk + couple time (PSY coordination)' },
    { questionIndex: 80, text: 'हल्का दबाव — सामान्य है; उम्मीदें वास्तविक रखें; छोटे-छोटे लक्ष्य बनाएं', textEn: 'Mild pressure — normal; keep expectations realistic; set small goals' },
    // COU01 q81 — sleep/appetite
    { questionIndex: 81, text: 'नींद/भूख गड़बड़ — तनाव के संकेत; नींद का समय तय करें; PSY समन्वय', textEn: 'Sleep/appetite disturbed — stress signals; fix a sleep window; PSY coordination' },
    { questionIndex: 81, text: 'दोनों ठीक — अच्छा संकेत; इलाज के चरणों के बीच आराम-दिन रखें', textEn: 'Both fine — good sign; keep rest-days between treatment phases' },
    // COU02 q82 — relationship strain
    { questionIndex: 82, text: 'तनाव बढ़ा — रोज 15 मिनट बच्चे-विषय से बाहर की बातचीत करें; इलाज = साझा परियोजना', textEn: 'Strain increased — have a daily 15-minute talk beyond the baby topic; treatment = a shared project' },
    { questionIndex: 82, text: 'रिश्ते में बहुत दूरी — जोड़ा-परामर्श (PSY) एक सामान्य और मददगार कदम है', textEn: 'Severe distance — couple counselling (PSY) is a normal and helpful step' },
    // COU02 q83 — partner support
    { questionIndex: 83, text: 'सहयोग 5 से कम — क्लिनिक-विजिट एक साथ रखें; जानकारी साझा करने से सहयोग बढ़ता है', textEn: 'Support under 5 — attend clinic visits together; sharing information raises support' },
    { questionIndex: 83, text: 'सहयोग 8+ — बड़ी ताकत; तनाव-घटाने वाली साझा आदतें जारी रखें', textEn: 'Support 8+ — a big strength; keep shared stress-relieving habits going' },
    // COU03 q84 — donor-egg respectful framing
    { questionIndex: 84, text: 'डोनर-एग विकल्प — संवेदनशील विषय है, गोपनीयता और सम्मान के साथ; पूरी जानकारी क्लिनिक से लें', textEn: 'Donor-egg option — a sensitive topic, handled with confidentiality and respect; get full information from the clinic' },
    { questionIndex: 84, text: 'हाल में बताया गया — सोचने का समय लें; जोड़े की सहमति केंद्र में; कोई जल्दी नहीं', textEn: 'Discussed recently — take time to decide; couple consent is central; no rush at all' },
    // COU03 q85 — couple discussed
    { questionIndex: 85, text: 'दोनों ने बात की — अच्छी शुरुआत; अगली बातचीत में भावनाएं भी शामिल करें', textEn: 'Both discussed — a good start; include feelings in the next conversation too' },
    { questionIndex: 85, text: 'अकेले सोच रही हैं — साथी के साथ खुली बात जरूरी; जरूरत पर काउंसलर मध्यस्थ बन सकता है', textEn: 'Deciding alone — an open talk with the partner is essential; a counsellor can mediate if needed' },
    // COU04 q86 — surrogacy legal (India 2021 law framing)
    { questionIndex: 86, text: 'सरोगेसी — भारत का कानून 2021: केवल एल्ट्रूइस्टिक (बिना पारिश्रमिक), नियमित प्रक्रिया; कानूनी सलाह जरूरी', textEn: 'Surrogacy — India law 2021: altruistic only (no payment), regulated process; legal advice essential' },
    { questionIndex: 86, text: 'एल्ट्रूइस्टिक सरोगेसी में सख्त पात्रता-शर्तें हैं — डॉक्टर + वकील से अपनी पात्रता जांचें', textEn: 'Altruistic surrogacy has strict eligibility conditions — check your eligibility with doctor + lawyer' },
    // COU04 q87 — law awareness
    { questionIndex: 87, text: 'कानून 2021 की जानकारी रखें — विज्ञापन/व्यापारिक सरोगेसी अवैध है; केवल नियमित मार्ग मान्य', textEn: 'Get informed about the 2021 law — commercial surrogacy is illegal; only the regulated route is valid' },
    { questionIndex: 87, text: 'भ्रम है — स्वाभाविक है; क्लिनिक से लिखित जानकारी मांगें; निर्णय से पहले समय लें', textEn: 'Confusion is natural — request written information from the clinic; take time before deciding' },
    // COU05 q88 — cancer treatment timing (oncofertility urgent rail)
    { questionIndex: 88, text: 'कैंसर-इलाज शुरू होने वाला है — फर्टिलिटी-संरक्षण की बात आज/इसी सप्ताह (समय-सीमित); ऑन्को + फर्टिलिटी टीम साथ', textEn: 'Cancer treatment starting — discuss fertility preservation today/this week (time-sensitive); onco + fertility team together' },
    { questionIndex: 88, text: 'इलाज पहले से चल रहा है — अभी भी संरक्षण की संभावना पूछें; ऑन्को-टीम से तुरंत बात करें', textEn: 'Treatment already running — still ask about the preservation possibility; speak to the onco-team now' },
    // COU05 q89 — onco discussed
    { questionIndex: 89, text: 'बात हो चुकी — अच्छा; समय-सीमा (विंडो) जान लें; सहमति-पत्र की प्रति अपने पास रखें', textEn: 'Already discussed — good; know the time-window; keep a copy of the consent form with you' },
    { questionIndex: 89, text: 'बात नहीं हुई — अगली ऑन्को-विजिट में पहला सवाल यही रखें', textEn: 'Not discussed — make this the first question at the next onco visit' },
    // COU06 q90 — family pressure frequency (boundary script)
    { questionIndex: 90, text: 'बार-बार सवाल — सीमा-रेखा स्क्रिप्ट: "हमारा इलाज चल रहा है — तारीख के बारे में डॉक्टर ही बताएंगे"', textEn: 'Frequent questions — boundary script: our treatment is ongoing — only the doctor can speak about dates' },
    { questionIndex: 90, text: 'दबाव त्योहारों पर चरम पर — पहले से तैयारी रखें: जवाब एक जैसा, विनम्र और छोटा', textEn: 'Pressure peaks at festivals — prepare in advance: keep answers identical, polite and brief' },
    // COU06 q91 — pressure impact
    { questionIndex: 91, text: 'असर 7+ — परामर्श-सहायता लें (PSY समन्वय); जोड़े की निजता की रक्षा करें', textEn: 'Impact 7+ — take counselling support (PSY coordination); protect the couple privacy' },
    { questionIndex: 91, text: 'असर कम — मजबूत स्थिति; दोनों एक जुबान रहें; तुलना-भरे सवालों को विनम्रता से टालें', textEn: 'Low impact — resilient position; stay on the same page; deflect comparison-questions politely' },
  ],

  // ══ Labels (12) — fertility monitoring ════════════════════════════════
  labels: [
    { label: 'साइकल दिन', labelEn: 'Cycle Day', unit: 'day' },
    { label: 'फॉलिकल आकार', labelEn: 'Follicle Size', unit: 'mm' },
    { label: 'एंडोमेट्रियल मोटाई', labelEn: 'Endometrial Thickness', unit: 'mm' },
    { label: 'AMH', labelEn: 'AMH (if brought)', unit: 'ng/ml' },
    { label: 'FSH / LH', labelEn: 'FSH / LH (if brought)', unit: 'mIU/ml' },
    { label: 'TSH', labelEn: 'TSH', unit: 'mIU/L' },
    { label: 'प्रोलैक्टिन', labelEn: 'Prolactin', unit: 'ng/ml' },
    { label: 'सेमेन काउंट', labelEn: 'Semen Count', unit: 'million/ml' },
    { label: 'मोटिलिटी', labelEn: 'Motility', unit: '%' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'तनाव स्कोर', labelEn: 'Stress Score', unit: '0-10', showUnit: false },
  ],

  // ══ Findings (28) — managed + coordinate + REFER-ONLY (zero links) ═══
  findings: [
    // Managed / coordinated
    { key: 'FEMALE-INFERTILITY-UNSPEC', name: 'महिला निःसंतानता (अनिर्दिष्ट)', nameEn: 'Female Infertility Unspecified', icd10: 'N97.9' },
    { key: 'ANOVULATORY-PCOS', name: 'अनोव्यूलेशन (PCOS-संबंधित)', nameEn: 'Anovulatory Infertility (PCOS-linked)', icd10: 'N97.1' },
    { key: 'TUBAL-FACTOR', name: 'ट्यूबल कारक निःसंतानता', nameEn: 'Tubal Factor Infertility', icd10: 'N97.2' },
    { key: 'ENDOCRINE-INFERTILITY', name: 'अंतःस्रावी (हार्मोन) निःसंतानता', nameEn: 'Endocrine-linked Infertility', icd10: 'N97.8' },
    { key: 'MALE-FACTOR-MILD', name: 'पुरुष-कारक (हल्का)', nameEn: 'Male Factor Infertility (mild)', icd10: 'N46' },
    { key: 'VARICOCELE-FERTILITY', name: 'वैरिकोसील (फर्टिलिटी-संबंधित)', nameEn: 'Varicocele (fertility-linked)', icd10: 'N43.1' },
    { key: 'EARLY-PREG-POSITIVE', name: 'गर्भ-टेस्ट पॉजिटिव (प्रारंभिक)', nameEn: 'Pregnancy Test Positive (early)', icd10: 'Z32' },
    { key: 'ENDOMETRIOSIS-FERTILITY', name: 'एंडोमेट्रियोसिस (फर्टिलिटी के साथ)', nameEn: 'Endometriosis with Infertility', icd10: 'N80' },
    { key: 'PCOS-FERTILITY', name: 'PCOS (फर्टिलिटी के साथ)', nameEn: 'PCOS with Infertility', icd10: 'E28.2' },
    { key: 'FIBROID-FERTILITY', name: 'फाइब्रॉइड (फर्टिलिटी योजना)', nameEn: 'Fibroid in Fertility Planning', icd10: 'D25' },
    { key: 'IMPLANTATION-FAILURE', name: 'रिपीटेड इम्प्लांटेशन फेल्योर', nameEn: 'Recurrent Implantation Failure', icd10: 'N96' },
    { key: 'MALE-FACTOR-UNCLASSIFIED', name: 'पुरुष-कारक (अवर्गीकृत)', nameEn: 'Male Factor Unclassified', icd10: 'R69' },
    { key: 'FERTILITY-COUNSELLING', name: 'फर्टिलिटी परामर्श-स्थिति', nameEn: 'Fertility Counselling Status', icd10: 'Z31' },
    { key: 'FOLLICLE-MONITORING', name: 'फॉलिकल मॉनिटरिंग', nameEn: 'Follicle Monitoring', icd10: 'Z31.1' },
    { key: 'OBESITY-FERTILITY', name: 'मोटापा (फर्टिलिटी-संबंधित)', nameEn: 'Obesity with Fertility Issue', icd10: 'E66' },
    { key: 'THYROID-FERTILITY', name: 'थायरॉइड विकार (फर्टिलिटी)', nameEn: 'Thyroid Disorder with Fertility', icd10: 'E03' },
    { key: 'HYPERPROLACTIN-FERTILITY', name: 'हाइपरप्रोलैक्टिनीमिया (फर्टिलिटी)', nameEn: 'Hyperprolactinemia with Fertility', icd10: 'E22.1' },
    { key: 'STRESS-FERTILITY', name: 'तनाव (फर्टिलिटी-इलाज संबंधित)', nameEn: 'Stress Related to Fertility Treatment', icd10: 'F43' },
    { key: 'IVF-PREG-EARLY', name: 'IVF-गर्भावस्था (प्रारंभिक)', nameEn: 'Early IVF Pregnancy', icd10: 'O09' },
    { key: 'THIN-ENDOMETRIUM', name: 'पतली एंडोमेट्रियम', nameEn: 'Thin Endometrium', icd10: 'N85.8' },
    { key: 'IUI-CYCLE-STATUS', name: 'IUI प्रक्रिया-स्थिति', nameEn: 'IUI Procedure Status', icd10: 'Z31.81' },
    // REFER-ONLY (ZERO findingMeds links)
    { key: 'AZOOSPERMIA', name: 'एज़ोस्पर्मिया (शुक्राणु शून्य) — यूरो-एंड्रोलॉजी रेफर', nameEn: 'Azoospermia — REFER Uro-Andrology', icd10: 'N46.0' },
    { key: 'RECURRENT-MISCARRIAGE-SUSPECT', name: 'बार-बार गर्भपात (संदेह) — वर्कअप रेफर', nameEn: 'Recurrent Miscarriage Suspect — REFER Workup', icd10: 'O03' },
    { key: 'ECTOPIC-SUSPECT', name: 'बाहरी गर्भ (संदेह) — EMERGENCY', nameEn: 'Ectopic Pregnancy Suspect — EMERGENCY', icd10: 'O00.9' },
    { key: 'OHSS-SEVERE', name: 'गंभीर ओवेरियन हाइपरस्टिम्युलेशन (OHSS) — EMERGENCY', nameEn: 'Severe Ovarian Hyperstimulation (OHSS) — EMERGENCY', icd10: 'N98.0' },
    { key: 'SEPTIC-MISCARRIAGE', name: 'सेप्टिक गर्भपात (संदेह) — EMERGENCY', nameEn: 'Septic Miscarriage Suspect — EMERGENCY', icd10: 'O03.86' },
    { key: 'POI-SEVERE', name: 'समय से पहले अंडाशय विफलता (<30 वर्ष) — जेनेटिक वर्कअप रेफर', nameEn: 'Premature Ovarian Insufficiency (under 30y) — REFER Genetic Workup', icd10: 'E28.31' },
    { key: 'ONCOFERTILITY-URGENT', name: 'कैंसर-इलाज से पहले फर्टिलिटी-संरक्षण — समय-संवेदनशील रेफर', nameEn: 'Oncofertility Preservation — TIME-SENSITIVE REFER', icd10: 'Z31.62' },
  ],

  // ══ Medicines (40) — India fertility core ═════════════════════════════
  // Fertility drugs = SPECIALIST-TITRATED; injections = clinic-administered
  // ONLY. morning/afternoon/evening = default slot units; tab = dispense qty.
  medicines: [
    // Ovulation induction — oral (specialist-monitored)
    { name: 'Siphene 50 Tablet', salt: 'Clomiphene Citrate 50 mg', doseOptions: ['1 tab once daily from cycle day 2 for 5 days (specialist-monitored; multiples-risk counselling)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Siphene 100 Tablet', salt: 'Clomiphene Citrate 100 mg', doseOptions: ['1 tab once daily from cycle day 2 for 5 days (specialist-titrated; max-cycle limit applies)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clofert 50 Tablet', salt: 'Clomiphene Citrate 50 mg', doseOptions: ['1 tab once daily cycle day 2-6 (specialist-monitored)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fempro 2.5 Tablet', salt: 'Letrozole 2.5 mg', doseOptions: ['1 tab once daily cycle day 2-6 (off-label fertility use — common Indian practice; specialist-monitored)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Letrova 2.5 Tablet', salt: 'Letrozole 2.5 mg', doseOptions: ['1 tab once daily cycle day 2-6 (specialist-monitored cycle)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Letrova 5 Tablet', salt: 'Letrozole 5 mg', doseOptions: ['1 tab once daily cycle day 2-6 (specialist-titrated dose)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // Ovarian stimulation injections — CLINIC-ADMINISTERED ONLY
    { name: 'Gonal-F 75 IU Injection', salt: 'Follitropin Alfa (recombinant FSH) 75 IU', doseOptions: ['1 injection daily as titrated (CLINIC-ADMINISTERED ONLY — never home self-inject)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Merional 75 IU Injection', salt: 'Menotropin (FSH + LH) 75 IU', doseOptions: ['1 injection daily as titrated (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Menopur 75 IU Injection', salt: 'Menotropin (FSH + LH) 75 IU', doseOptions: ['1 injection daily as titrated (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cetrotide 0.25 mg Injection', salt: 'Cetrorelix Acetate 0.25 mg (GnRH antagonist)', doseOptions: ['1 injection daily on specified cycle days (CLINIC-ADMINISTERED ONLY)'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ovitrelle 250 mcg Injection', salt: 'Choriogonadotropin Alfa (recombinant hCG) 250 mcg', doseOptions: ['1 injection single dose at trigger time (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Chorion 5000 IU Injection', salt: 'Human Chorionic Gonadotropin 5000 IU', doseOptions: ['1 injection single dose at trigger time (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fertigyn 5000 IU Injection', salt: 'Human Chorionic Gonadotropin 5000 IU', doseOptions: ['1 injection single dose at trigger time (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Hucog 5000 IU Injection', salt: 'Human Chorionic Gonadotropin 5000 IU', doseOptions: ['1 injection single dose at trigger time (CLINIC-ADMINISTERED ONLY)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // Luteal / endometrial support
    { name: 'Susten 100 Capsule', salt: 'Natural Micronized Progesterone 100 mg', doseOptions: ['1 capsule at bedtime', '1 capsule twice daily (oral/vaginal route as advised)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Susten 200 SR Tablet', salt: 'Natural Micronized Progesterone 200 mg SR', doseOptions: ['1 tab at bedtime (route as advised)', '1 tab twice daily (oral/vaginal as advised)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Susten 400 SR Tablet', salt: 'Natural Micronized Progesterone 400 mg SR', doseOptions: ['1 tab at bedtime (route as advised — luteal support)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Naturogest 200 Capsule', salt: 'Natural Micronized Progesterone 200 mg', doseOptions: ['1 capsule twice daily (oral/vaginal as advised)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Progynova 2 mg Tablet', salt: 'Estradiol Valerate 2 mg', doseOptions: ['1 tab twice daily as per protocol', '1 tab thrice daily as per protocol (specialist-titrated — lining support)'], morning: 1, afternoon: 0, evening: 1, tab: 28, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // Male-factor / antioxidant supplements
    { name: 'Fertisure M Tablet', salt: 'L-Carnitine + Coenzyme Q10 + Lycopene + Zinc + Selenium + Multivitamins (male fertility supplement)', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Fertisure F Tablet', salt: 'Myo-Inositol + Folic Acid + Multivitamin/Mineral (female fertility supplement)', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Carnisure 500 Tablet', salt: 'Levocarnitine 500 mg', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nurokind LC Tablet', salt: 'Methylcobalamin + Levocarnitine', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ubiq 100 Tablet', salt: 'Ubidecarenone (Coenzyme Q10) 100 mg', doseOptions: ['1 tab twice daily after food (sperm antioxidant support — limited-evidence honest framing)'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Evion 400 Capsule', salt: 'Vitamin E 400 IU', doseOptions: ['1 capsule once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Pre-conception vitamins / minerals
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg', doseOptions: ['1 tab once daily after food (pre-conception — 400 mcg is ideal target; 5 mg tablet is standard Indian practice)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Livogen Tablet', salt: 'Ferrous Fumarate + Folic Acid', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orofer XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C', doseOptions: ['1 capsule once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'B-Long F Tablet', salt: 'Pyridoxine (Vitamin B6) sustained release + Folic Acid', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Thyroid — continuation-verify (END owns titration)
    { name: 'Thyronorm 25 mcg Tablet', salt: 'Levothyroxine Sodium 25 mcg', doseOptions: ['1 tab early morning empty stomach (continuation-verify — END coordination)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 50 mcg Tablet', salt: 'Levothyroxine Sodium 50 mcg', doseOptions: ['1 tab early morning empty stomach (continuation-verify — END coordination)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thyronorm 75 mcg Tablet', salt: 'Levothyroxine Sodium 75 mcg', doseOptions: ['1 tab early morning empty stomach (continuation-verify — END coordination)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // Symptomatic support (2-week-wait / post-procedure safe)
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg', doseOptions: ['1 tab SOS (max 3 in 24 hrs — 2-week-wait safe)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg', doseOptions: ['1 tab SOS for mild cramps'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml', doseOptions: ['15 ml at bedtime (post-retrieval constipation)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (42) ════════════════════════════════════
  // REFER-ONLY findings (AZOOSPERMIA, RECURRENT-MISCARRIAGE-SUSPECT,
  // ECTOPIC-SUSPECT, OHSS-SEVERE, SEPTIC-MISCARRIAGE, POI-SEVERE,
  // ONCOFERTILITY-URGENT) deliberately carry ZERO links.
  findingMeds: [
    // FEMALE-INFERTILITY-UNSPEC
    { findingKey: 'FEMALE-INFERTILITY-UNSPEC', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — start today, pre-conception cover' },
    { findingKey: 'FEMALE-INFERTILITY-UNSPEC', medicineName: 'Fertisure F Tablet', description: '1 tab BD after food — pre-conception supplement' },
    { findingKey: 'FEMALE-INFERTILITY-UNSPEC', medicineName: 'Uprise D3 60K Sachet', description: '1 sachet weekly × 8 weeks — only if vitamin D deficient' },
    // ANOVULATORY-PCOS
    { findingKey: 'ANOVULATORY-PCOS', medicineName: 'Siphene 50 Tablet', dose: '1 tab OD cycle day 2-6 × 5 days', description: 'Follicular scan day 10-12 mandatory; specialist-monitored' },
    { findingKey: 'ANOVULATORY-PCOS', medicineName: 'Fempro 2.5 Tablet', dose: '1 tab OD cycle day 2-6', description: 'Letrozole — off-label fertility use (India-common); specialist-monitored' },
    { findingKey: 'ANOVULATORY-PCOS', medicineName: 'Letrova 5 Tablet', dose: '1 tab OD cycle day 2-6', description: 'Specialist-titrated; scan monitoring required' },
    // ENDOCRINE-INFERTILITY
    { findingKey: 'ENDOCRINE-INFERTILITY', medicineName: 'Thyronorm 50 mcg Tablet', description: 'Continue only if already prescribed — END coordination; verify dose' },
    { findingKey: 'ENDOCRINE-INFERTILITY', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — pre-conception cover' },
    // MALE-FACTOR-MILD
    { findingKey: 'MALE-FACTOR-MILD', medicineName: 'Fertisure M Tablet', description: '1 tab BD × 3 months; repeat semen after 3 months' },
    { findingKey: 'MALE-FACTOR-MILD', medicineName: 'Carnisure 500 Tablet', description: '1 tab BD after food × 3 months' },
    { findingKey: 'MALE-FACTOR-MILD', medicineName: 'Ubiq 100 Tablet', description: '1 tab BD × 3 months — antioxidant support' },
    // VARICOCELE-FERTILITY
    { findingKey: 'VARICOCELE-FERTILITY', medicineName: 'Fertisure M Tablet', description: '1 tab BD; re-test semen 3-6 months post-surgery' },
    { findingKey: 'VARICOCELE-FERTILITY', medicineName: 'Carnisure 500 Tablet', description: '1 tab BD after food' },
    // EARLY-PREG-POSITIVE
    { findingKey: 'EARLY-PREG-POSITIVE', medicineName: 'Susten 200 SR Tablet', description: 'Continue exactly as advised till scan — never stop on your own' },
    { findingKey: 'EARLY-PREG-POSITIVE', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — continue' },
    { findingKey: 'EARLY-PREG-POSITIVE', medicineName: 'Dolo 650 Tablet', description: '1 tab SOS for headache/mild cramps — 2-week-wait safe' },
    // ENDOMETRIOSIS-FERTILITY
    { findingKey: 'ENDOMETRIOSIS-FERTILITY', medicineName: 'Fempro 2.5 Tablet', description: 'Letrozole-monitored cycle per specialist (off-label fertility note)' },
    { findingKey: 'ENDOMETRIOSIS-FERTILITY', medicineName: 'Fertisure F Tablet', description: '1 tab BD after food' },
    // PCOS-FERTILITY
    { findingKey: 'PCOS-FERTILITY', medicineName: 'Fempro 2.5 Tablet', description: '1 tab OD cycle day 2-6 — specialist-monitored; weight-loss parallel' },
    { findingKey: 'PCOS-FERTILITY', medicineName: 'Fertisure F Tablet', description: '1 tab BD after food' },
    { findingKey: 'PCOS-FERTILITY', medicineName: 'B-Long F Tablet', description: '1 tab OD (with END/OBG coordination)' },
    // FIBROID-FERTILITY
    { findingKey: 'FIBROID-FERTILITY', medicineName: 'Livogen Tablet', description: '1 tab OD — maintain hemoglobin if heavy periods (OBG coordination)' },
    // IMPLANTATION-FAILURE
    { findingKey: 'IMPLANTATION-FAILURE', medicineName: 'Susten 400 SR Tablet', description: '1 tab HS — luteal support per IVF protocol' },
    { findingKey: 'IMPLANTATION-FAILURE', medicineName: 'Progynova 2 mg Tablet', description: '1 tab BD — lining support per protocol' },
    // MALE-FACTOR-UNCLASSIFIED
    { findingKey: 'MALE-FACTOR-UNCLASSIFIED', medicineName: 'Fertisure M Tablet', description: '1 tab BD × 3 months + lifestyle change' },
    { findingKey: 'MALE-FACTOR-UNCLASSIFIED', medicineName: 'Zincovit Tablet', description: '1 tab OD after food' },
    { findingKey: 'MALE-FACTOR-UNCLASSIFIED', medicineName: 'Nurokind LC Tablet', description: '1 tab OD after food' },
    // FERTILITY-COUNSELLING
    { findingKey: 'FERTILITY-COUNSELLING', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — female partner starts today' },
    { findingKey: 'FERTILITY-COUNSELLING', medicineName: 'Fertisure F Tablet', description: '1 tab BD — pre-conception support' },
    // FOLLICLE-MONITORING
    { findingKey: 'FOLLICLE-MONITORING', medicineName: 'Siphene 50 Tablet', description: '1 tab OD cycle day 2-6 as titrated; scan day 10-12' },
    { findingKey: 'FOLLICLE-MONITORING', medicineName: 'Susten 200 SR Tablet', description: '1 tab HS from ovulation/trigger — luteal support' },
    // OBESITY-FERTILITY
    { findingKey: 'OBESITY-FERTILITY', medicineName: 'Uprise D3 60K Sachet', description: '1 sachet weekly × 8 weeks — deficiency common in obesity' },
    { findingKey: 'OBESITY-FERTILITY', medicineName: 'Zincovit Tablet', description: '1 tab OD — cover micronutrients during weight loss (END coordination)' },
    // THYROID-FERTILITY
    { findingKey: 'THYROID-FERTILITY', medicineName: 'Thyronorm 25 mcg Tablet', description: 'Continuation-verify — END owns titration' },
    { findingKey: 'THYROID-FERTILITY', medicineName: 'Thyronorm 50 mcg Tablet', description: 'Continuation-verify — END owns titration' },
    { findingKey: 'THYROID-FERTILITY', medicineName: 'Thyronorm 75 mcg Tablet', description: 'Continuation-verify — END owns titration' },
    // IVF-PREG-EARLY
    { findingKey: 'IVF-PREG-EARLY', medicineName: 'Susten 200 SR Tablet', description: 'Continue as advised till OBG scan — OBG-01 owns ANC' },
    { findingKey: 'IVF-PREG-EARLY', medicineName: 'Susten 400 SR Tablet', description: 'As per IVF protocol — taper only on doctor advice' },
    { findingKey: 'IVF-PREG-EARLY', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — continue through early pregnancy' },
    // THIN-ENDOMETRIUM
    { findingKey: 'THIN-ENDOMETRIUM', medicineName: 'Progynova 2 mg Tablet', description: '1 tab BD — lining protocol per specialist' },
    { findingKey: 'THIN-ENDOMETRIUM', medicineName: 'Susten 200 SR Tablet', description: '1 tab HS/BD — route as advised' },
    // IUI-CYCLE-STATUS
    { findingKey: 'IUI-CYCLE-STATUS', medicineName: 'Siphene 50 Tablet', description: '1 tab OD cycle day 2-6 — monitored IUI cycle' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Fertile-Window Calendar (26-35 दिन चक्र)',
      rows: 10,
      cols: 4,
      headerLabel: ['चक्र लंबाई (दिन)', 'ओवुलेशन लगभग (दिन)', 'उपजाऊ विंडो (साइकल दिन)', 'नोट'],
      colsLabel: ['Cycle length (days)', 'Approx ovulation day', 'Fertile window (cycle days)', 'Note'],
      footerLabel: ['पीरियड शुरू होने के पहले दिन को दिन-1 गिनें / Count the first day of bleeding as Day-1'],
    },
    {
      name: 'Follicular Monitoring Chart',
      rows: 10,
      cols: 4,
      headerLabel: ['साइकल दिन', 'फॉलिकल आकार (mm)', 'एंडोमेट्रियम (mm)', 'डॉक्टर नोट / अगला स्कैन'],
      colsLabel: ['Cycle day', 'Follicle size (mm)', 'Endometrium (mm)', 'Doctor note / next scan'],
      footerLabel: ['परिपक्व फॉलिकल 18-22 mm + लाइनिंग 8 mm+ — ट्रिगर केवल क्लिनिक में / Mature follicle 18-22 mm + lining 8 mm+ — trigger only in clinic'],
    },
    {
      name: 'IVF Cycle Timeline',
      rows: 10,
      cols: 4,
      headerLabel: ['चरण', 'लगभग दिन', 'क्या होगा', 'जरूरी नोट'],
      colsLabel: ['Stage', 'Approx day', 'What happens', 'Key note'],
      footerLabel: ['इंजेक्शन केवल क्लिनिक में — OHSS संकेत (तेज वजन बढ़ना/सांस फूलना) = तुरंत क्लिनिक / Injections clinic-only — OHSS signs (rapid weight gain / breathlessness) = clinic immediately'],
    },
    {
      name: 'Sperm-Friendly Lifestyle Card',
      rows: 10,
      cols: 2,
      headerLabel: ['करें (Do)', 'बचें (Avoid)'],
      colsLabel: ['Do', 'Avoid'],
      footerLabel: ['शुक्राणु ~3 महीने में नए बनते हैं — आज से शुरू करें / Sperm renew in ~3 months — start today'],
    },
    {
      name: '2-Week-Wait Guide',
      rows: 8,
      cols: 3,
      headerLabel: ['करें (Do)', 'न करें (Avoid)', 'खतरे के संकेत (Red flags)'],
      colsLabel: ['Do', 'Avoid', 'Red flags'],
      footerLabel: ['लाल संकेत — तुरंत क्लिनिक/इमरजेंसी: तेज वजन बढ़ना, सांस फूलना, एक तरफ दर्द, खून बहना / Red flags — clinic/emergency now: rapid weight gain, breathlessness, one-sided pain, bleeding'],
    },
    {
      name: 'IVF Cost-Questions Checklist',
      rows: 10,
      cols: 2,
      headerLabel: ['क्लिनिक से पूछने के प्रश्न', 'जवाब / नोट'],
      colsLabel: ['Question to ask the IVF clinic', 'Answer / notes'],
      footerLabel: ['लिखित पैकेज मांगें — यह आपका अधिकार है (बंडल/EMI/दवाएं शामिल?/फ्रोजन कितने समय तक?) / Ask for a written package — it is your right (bundle/EMI/meds included?/frozen storage duration?)'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Infertility First Consult — Basic Workup',
      diagnosis: 'FEMALE-INFERTILITY-UNSPEC',
      medicines: [
        { name: 'Folvite 5 Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'Start today — pre-conception cover (400 mcg ideal target; 5 mg is standard Indian practice)' },
        { name: 'Uprise D3 60K Sachet', dose: '1 sachet weekly', duration: '8 weeks', instructions: 'Only if vitamin D deficient' },
        { name: 'Fertisure F Tablet', dose: '1 tab BD', duration: '30 days', instructions: 'After food — pre-conception supplement support' },
      ],
      labs: ['CBC + Blood group (both partners)', 'TSH + Prolactin (female)', 'AMH + FSH/LH on cycle day 2-3', 'Semen analysis after 2-5 days abstinence', 'Rubella IgG + HBsAg + HIV + VDRL + HCV (both partners)', 'Vitamin D (if not recent)', 'Antral follicle count scan (day 2-5)'],
      advice: 'दोनों पार्टनर एक साथ जांच कराएं · फर्टाइल-विंडो कैलेंडर इस्तेमाल करें · धूम्रपान/शराब दोनों बंद · रिपोर्ट लेकर 3 हफ्ते में मिलें',
      followUpDays: 21,
      isCommon: true,
    },
    {
      name: 'Ovulation Induction — Monitored Cycle',
      diagnosis: 'ANOVULATORY-PCOS',
      medicines: [
        { name: 'Siphene 50 Tablet', dose: '1 tab OD', duration: '5 days', instructions: 'From cycle day 2 for 5 days — follicular scan day 10-12 mandatory; specialist-monitored; multiples-risk counselled' },
        { name: 'Susten 200 SR Tablet', dose: '1 tab HS', duration: '14 days', instructions: 'Start after ovulation/trigger — luteal support exactly as advised' },
        { name: 'Folvite 5 Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'Continue' },
      ],
      labs: ['Follicular scan day 10-12', 'hCG trigger only in clinic (clinic-administered)', 'Beta-hCG on given date if period missed'],
      advice: 'गोली निर्धारित दिनों में ही · स्कैन की तारीख न भूलें · ट्रिगर इंजेक्शन केवल क्लिनिक में · OHSS संकेत (तेज वजन बढ़ना/सांस फूलना) = तुरंत क्लिनिक',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Luteal Phase Support — Post Trigger/IUI',
      diagnosis: 'FOLLICLE-MONITORING',
      medicines: [
        { name: 'Susten 200 SR Tablet', dose: '1 tab HS', duration: '16 days', instructions: 'Exact timing critical — never stop on your own' },
        { name: 'Folvite 5 Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'Continue through the 2-week-wait' },
        { name: 'Dolo 650 Tablet', dose: '1 tab SOS', duration: '5 days', instructions: 'Only for headache/mild cramps — 2-week-wait safe; max 3/day' },
      ],
      labs: ['Beta-hCG on the given date (not a home test)', 'Serum TSH if not recent'],
      advice: 'प्रोजेस्टेरोन समय पर · घरेलू टेस्ट से जल्दी निर्णय नहीं · हल्की सामान्य गतिविधि ठीक · तेज वजन बढ़ना/सांस फूलना = तुरंत क्लिनिक (OHSS)',
      followUpDays: 16,
    },
    {
      name: 'Male Factor Mild — Antioxidant Plan',
      diagnosis: 'MALE-FACTOR-MILD',
      medicines: [
        { name: 'Fertisure M Tablet', dose: '1 tab BD', duration: '90 days', instructions: 'Sperm cycle is ~3 months — re-test after 90 days' },
        { name: 'Carnisure 500 Tablet', dose: '1 tab BD', duration: '90 days', instructions: 'After food' },
        { name: 'Ubiq 100 Tablet', dose: '1 tab BD', duration: '90 days', instructions: 'Antioxidant support — honest limited-evidence framing' },
      ],
      labs: ['Repeat semen analysis after 3 months (2-5 days abstinence)', 'TSH + fasting sugar if not done', 'Scrotal Doppler if varicocele suspected'],
      advice: 'धूम्रपान/शराब आज बंद · गर्म स्नान/टाइट कपड़े से बचें · लैपटॉप गोद में न रखें · 3 महीने बाद दोबारा सेमेन टेस्ट',
      followUpDays: 90,
    },
    {
      name: 'Frozen Embryo Transfer — Lining Prep (Protocol Framing)',
      diagnosis: 'THIN-ENDOMETRIUM',
      medicines: [
        { name: 'Progynova 2 mg Tablet', dose: '1 tab BD', duration: '21 days', instructions: 'Lining protocol set by the IVF specialist — never change dose yourself' },
        { name: 'Susten 200 SR Tablet', dose: '1 tab BD', duration: '21 days', instructions: 'Route (oral/vaginal) as advised — timing critical' },
        { name: 'Folvite 5 Tablet', dose: '1 tab OD', duration: '30 days', instructions: 'Continue' },
      ],
      labs: ['Lining scan on given dates', 'Progesterone level if advised', 'Hysteroscopy only if advised'],
      advice: 'दवा-समय अलार्म से · स्कैन तारीखें लिखें · बिस्तर-आराम जरूरी नहीं — सामान्य हल्की गतिविधि ठीक · लाल संकेत (तेज वजन/सांस/एक तरफ दर्द/खून) = तुरंत क्लिनिक',
      followUpDays: 14,
    },
    {
      name: 'Pre-Conception Package — First Visit',
      diagnosis: 'FERTILITY-COUNSELLING',
      medicines: [
        { name: 'Folvite 5 Tablet', dose: '1 tab OD', duration: '90 days', instructions: 'Pre-conception — start today (400 mcg target; 5 mg tablet is standard Indian practice)' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab OD', duration: '90 days', instructions: 'If dietary calcium is low — keep 30-60 min gap from thyroid tablet' },
        { name: 'Thyronorm 50 mcg Tablet', dose: '1 tab early morning', duration: '90 days', instructions: 'CONTINUE only if already prescribed — dose verification with END doctor' },
      ],
      labs: ['TSH (pre-conception target under 2.5)', 'Rubella IgG (vaccinate + 1 month wait if negative)', 'HBsAg + Hemoglobin', 'Pap smear if due (OBG coordination)'],
      advice: 'फोलिक आज से · रूबेला टीका लगवाया हो तो 1 महीना रुकें · BMI 18.5-24.9 का लक्ष्य · दोनों पार्टनर धूम्रपान/शराब बंद करें',
      followUpDays: 30,
      isCommon: true,
    },
  ],
}
