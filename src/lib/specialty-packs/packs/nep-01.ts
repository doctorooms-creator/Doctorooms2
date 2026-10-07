/**
 * NEP-01 — NEPHROLOGY STARTER PACK (T2 specialty pack)
 *
 * The India nephrology OPD core: creatinine-report walk-ins (the #1 Indian
 * entry), CKD staging + KMC dialysis-prep counselling, hemodialysis/PD/
 * transplant follow-ups, monsoon + snake-bite AKI, stone-obstruction and
 * electrolyte emergencies, and the OTC-NSAID nephrotoxicity epidemic.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India renal core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY SPINE (non-negotiable):
 *   - NSAIDs NEVER in CKD — paracetamol is the only safe analgesic.
 *   - EPO / sevelamer / immunosuppressants = CONTINUATION-VERIFY only.
 *   - Severe hyperkalemia / uremia / acidosis / AKI / obstructed pyelo /
 *     transplant rejection = REFER-ONLY findings with ZERO medicine links.
 *   - Allopurinol never started in a flare; febuxostat CV caution.
 *   - Pregnancy-CKD = joint OBG care, zero pack medicines.
 *
 * Sources: standard Indian nephrology OPD practice patterns, KDIGO-style
 * follow-up conventions adapted for a bilingual starter pack.
 */

import type { SpecialtyPack } from '../types'

export const NEP01_PACK: SpecialtyPack = {
  meta: {
    code: 'NEP-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Nephrology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'India nephro OPD patterns · bilingual patient education · NSAID-never safety spine · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'CKD', name: 'किडनी-लंबी-बीमारी (CKD)', nameEn: 'Chronic Kidney Disease' },
    { key: 'AKI', name: 'अचानक-किडनी (AKI)', nameEn: 'Acute Kidney Injury' },
    { key: 'DBK', name: 'शुगर-बीपी-किडनी', nameEn: 'Diabetes-BP-Kidney' },
    { key: 'STN', name: 'पथरी-बाधा', nameEn: 'Stones & Obstruction' },
    { key: 'TRN', name: 'ट्रांसप्लांट-डायलिसिस', nameEn: 'Transplant & Dialysis' },
    { key: 'OTH', name: 'अन्य किडनी समस्याएं', nameEn: 'Other Kidney Problems' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // CKD — Chronic kidney disease
    { code: 'CKD01', categoryKey: 'CKD', detail: 'रिपोर्ट में क्रिएटिनिन बढ़ा — समीक्षा', detailEn: 'High Creatinine on Report — Review' },
    { code: 'CKD02', categoryKey: 'CKD', detail: 'CKD फॉलो-अप — रिपोर्ट बिगड़ती', detailEn: 'CKD Follow-up — Declining Reports' },
    { code: 'CKD03', categoryKey: 'CKD', detail: 'किडनी रोग + पैरों में सूजन', detailEn: 'Kidney Disease + Leg Swelling' },
    { code: 'CKD04', categoryKey: 'CKD', detail: 'किडनी रोग + कम पेशाब', detailEn: 'Kidney Disease + Low Urine Output' },
    { code: 'CKD05', categoryKey: 'CKD', detail: 'किडनी रोग + उच्च रक्तचाप', detailEn: 'Kidney Disease + High BP' },
    { code: 'CKD06', categoryKey: 'CKD', detail: 'CKD स्टेज-3 फॉलो-अप', detailEn: 'CKD Stage-3 Follow-up' },
    { code: 'CKD07', categoryKey: 'CKD', detail: 'CKD स्टेज-4 — डायलिसिस तैयारी (KMC)', detailEn: 'CKD-4 Planning (KMC Counselling)' },
    { code: 'CKD08', categoryKey: 'CKD', detail: 'CKD स्टेज-5 — डायलिसिस योजना', detailEn: 'CKD-5 Dialysis Planning' },
    { code: 'CKD09', categoryKey: 'CKD', detail: 'CKD + तेज खुजली (यूरेमिक)', detailEn: 'CKD + Severe Itching (Uremic)' },
    { code: 'CKD10', categoryKey: 'CKD', detail: 'CKD + मतली + धातु जैसा स्वाद', detailEn: 'CKD + Nausea + Metallic Taste' },
    { code: 'CKD11', categoryKey: 'CKD', detail: 'CKD + पैरों में बेचैनी', detailEn: 'CKD + Leg Restlessness' },
    { code: 'CKD12', categoryKey: 'CKD', detail: 'किडनी रोग में खून की कमी (एनीमिया)', detailEn: 'Anemia with Kidney Disease' },
    { code: 'CKD13', categoryKey: 'CKD', detail: 'CKD में हड्डी/कमर दर्द', detailEn: 'CKD Bone Pain' },
    { code: 'CKD14', categoryKey: 'CKD', detail: 'CKD + गहरी सांस (एसिडोसिस)', detailEn: 'Deep Breathing + CKD (Acidosis)' },
    // AKI — Acute kidney injury
    { code: 'AKI01', categoryKey: 'AKI', detail: 'अचानक कम पेशाब + पानी की कमी', detailEn: 'Sudden Low Urine + Dehydration' },
    { code: 'AKI02', categoryKey: 'AKI', detail: 'दस्त + कमजोरी (मानसून AKI)', detailEn: 'Loose Motions + Weakness (Monsoon AKI)' },
    { code: 'AKI03', categoryKey: 'AKI', detail: 'सांप के काटने के बाद किडनी फॉलो-अप', detailEn: 'Snake-bite Kidney Follow-up' },
    { code: 'AKI04', categoryKey: 'AKI', detail: 'उल्टी + पीठ दर्द + कम पेशाब', detailEn: 'Vomiting + Back Pain + Low Urine' },
    { code: 'AKI05', categoryKey: 'AKI', detail: 'AKI के बाद रिकवरी जांच', detailEn: 'Post-AKI Recovery Check' },
    // DBK — Diabetes/BP-kidney
    { code: 'DBK01', categoryKey: 'DBK', detail: 'शुगर-किडनी रिपोर्ट समीक्षा', detailEn: 'Diabetes Kidney Report Review' },
    { code: 'DBK02', categoryKey: 'DBK', detail: 'बीपी-किडनी रिपोर्ट समीक्षा', detailEn: 'BP Kidney Report Review' },
    // STN — Stones & obstruction
    { code: 'STN01', categoryKey: 'STN', detail: 'पथरी + बुखार (इमरजेंसी)', detailEn: 'Stone + Fever (Pyelo Emergency)' },
    { code: 'STN02', categoryKey: 'STN', detail: 'पथरी — रुकावट निगरानी', detailEn: 'Stone Obstruction Watch' },
    { code: 'STN03', categoryKey: 'STN', detail: 'प्रोस्टेट से किडनी पर असर', detailEn: 'Prostate Kidney Backflow' },
    // TRN — Transplant & dialysis
    { code: 'TRN01', categoryKey: 'TRN', detail: 'हीमोडायलिसिस चालू — जांच', detailEn: 'Hemodialysis Ongoing Check' },
    { code: 'TRN02', categoryKey: 'TRN', detail: 'पेरिटोनियल डायलिसिस — जांच', detailEn: 'Peritoneal Dialysis Check' },
    { code: 'TRN03', categoryKey: 'TRN', detail: 'किडनी ट्रांसप्लांट फॉलो-अप', detailEn: 'Kidney Transplant Follow-up' },
    { code: 'TRN04', categoryKey: 'TRN', detail: 'ट्रांसप्लांट + बढ़ता क्रिएटिनिन', detailEn: 'Transplant + Rising Creatinine' },
    { code: 'TRN05', categoryKey: 'TRN', detail: 'डायलिसिस से पहले टीका सलाह', detailEn: 'Pre-dialysis Vaccine Consult' },
    // OTH — Other kidney problems
    { code: 'OTH01', categoryKey: 'OTH', detail: 'सुबह चेहरे पर सूजन', detailEn: 'Morning Face Swelling' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'पेशाब में खून + सूजन (नेफ्रिटिक)', detailEn: 'Blood in Urine + Swelling (Nephritic)' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'झागदार पेशाब (प्रोटीन)', detailEn: 'Foamy Urine (Proteinuria)' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'रिपोर्ट में पेशाब प्रोटीन ज्यादा', detailEn: 'Urine Protein High on Report' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'गाउट + किडनी रिपोर्ट', detailEn: 'Gout + Kidney Report' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'लंबे समय दर्द की गोली — किडनी जांच', detailEn: 'Long Painkiller Use — Kidney Check' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'गठिया दवा से किडनी समीक्षा', detailEn: 'Arthritis Medicine Kidney Review' },
    { code: 'OTH08', categoryKey: 'OTH', detail: 'किडनी सिस्ट फॉलो-अप', detailEn: 'Kidney Cyst Follow-up' },
    { code: 'OTH09', categoryKey: 'OTH', detail: 'PKD — परिवार जांच', detailEn: 'PKD Family Screening' },
    { code: 'OTH10', categoryKey: 'OTH', detail: 'एक किडनी — सावधानी', detailEn: 'Single Kidney Precautions' },
    { code: 'OTH11', categoryKey: 'OTH', detail: 'रिपोर्ट में पोटैशियम ऊंचा', detailEn: 'Potassium High on Report' },
    { code: 'OTH12', categoryKey: 'OTH', detail: 'रिपोर्ट में सोडियम कम', detailEn: 'Sodium Low on Report' },
    { code: 'OTH13', categoryKey: 'OTH', detail: 'किडनी डाइट सलाह', detailEn: 'Kidney Diet Consult' },
    { code: 'OTH14', categoryKey: 'OTH', detail: 'CKD — पानी की मात्रा सलाह', detailEn: 'CKD Water-intake Consult' },
    { code: 'OTH15', categoryKey: 'OTH', detail: 'गर्भावस्था + किडनी रोग', detailEn: 'Pregnancy with Kidney Disease' },
  ],

  // ══ Questions (88 — 2 per complaint; // idx = true 0-based index) ═════
  questions: [
    // CKD01 High creatinine on report
    // idx 0
    { complaintCode: 'CKD01', question: 'रिपोर्ट में क्रिएटिनिन कितना आया है — रिपोर्ट साथ लाई हैं?', questionEn: 'What is the creatinine value on the report — did you bring the report?' },
    // idx 1
    { complaintCode: 'CKD01', question: 'पिछली रिपोर्ट की तुलना में क्रिएटिनिन बढ़ा, घटा या स्थिर रहा?', questionEn: 'Compared to the previous report, has creatinine risen, fallen, or stayed stable?' },
    // CKD02 CKD follow-up declining
    // idx 2
    { complaintCode: 'CKD02', question: 'आज की रिपोर्ट में eGFR कितना आया है?', questionEn: 'What is the eGFR on the report today?' },
    // idx 3
    { complaintCode: 'CKD02', question: 'पिछले 1-2 महीने में कोई नई दवा (दर्द की गोली/एंटीबायोटिक) शुरू की?', questionEn: 'Any new medicine (pain tablet/antibiotic) started in the last 1-2 months?' },
    // CKD03 Kidney disease + leg swelling
    // idx 4
    { complaintCode: 'CKD03', question: 'सूजन दिन में किस समय ज्यादा है — सुबह या शाम?', questionEn: 'When is the swelling worse — morning or evening?' },
    // idx 5
    { complaintCode: 'CKD03', question: 'पैर पर उंगली दबाने से गड्ढा (पिट) बन जाता है?', questionEn: 'Does pressing on the leg leave a pit (dent)?' },
    // CKD04 Kidney disease + low urine
    // idx 6
    { complaintCode: 'CKD04', question: '24 घंटे में पेशाब लगभग कितना आ रहा है (ml/कप में)?', questionEn: 'Roughly how much urine in 24 hours (in ml/cups)?' },
    // idx 7
    { complaintCode: 'CKD04', question: 'रात में पेशाब के लिए कितनी बार उठते हैं?', questionEn: 'How many times do you get up at night to pass urine?' },
    // CKD05 Kidney disease + high BP
    // idx 8
    { complaintCode: 'CKD05', question: 'घर पर BP की रीडिंग कैसी आ रही है — रिकॉर्ड लाएं?', questionEn: 'What are the home BP readings — bring the log?' },
    // idx 9
    { complaintCode: 'CKD05', question: 'BP की कौन सी दवा चल रही है?', questionEn: 'Which BP medicine are you currently on?' },
    // CKD06 CKD stage-3 follow-up
    // idx 10
    { complaintCode: 'CKD06', question: 'इस बार क्रिएटिनिन और eGFR कितना आया है?', questionEn: 'What are the creatinine and eGFR values this visit?' },
    // idx 11
    { complaintCode: 'CKD06', question: 'पेशाब में प्रोटीन की जांच (dipstick/ACR) हुई है?', questionEn: 'Has urine protein testing (dipstick/ACR) been done?' },
    // CKD07 CKD-4 KMC counselling
    // idx 12
    { complaintCode: 'CKD07', question: 'डॉक्टर ने डायलिसिस की तैयारी (KMC) के बारे में बात की है?', questionEn: 'Has the doctor discussed dialysis preparation (KMC counselling)?' },
    // idx 13
    { complaintCode: 'CKD07', question: 'परिवार में किसी सदस्य ने किडनी दान के बारे में बात की है?', questionEn: 'Has any family member discussed kidney donation?' },
    // CKD08 CKD-5 dialysis planning
    // idx 14
    { complaintCode: 'CKD08', question: 'डायलिसिस किस तरह की प्लान है — खून की (HD) या पेट की (PD)?', questionEn: 'Which dialysis is planned — blood (HD) or belly (PD)?' },
    // idx 15
    { complaintCode: 'CKD08', question: 'डायलिसिस के लिए फिस्टुला/कैथेटर का ऑपरेशन हो गया है?', questionEn: 'Has the fistula/catheter surgery been done?' },
    // CKD09 CKD + itching
    // idx 16
    { complaintCode: 'CKD09', question: 'खुजली रात में ज्यादा बढ़ जाती है?', questionEn: 'Does the itching worsen at night?' },
    // idx 17
    { complaintCode: 'CKD09', question: 'खुजली से नींद टूटती है या खुजाने से खून निकलता है?', questionEn: 'Does itching disturb sleep or does scratching cause bleeding?' },
    // CKD10 CKD + nausea + metallic taste
    // idx 18
    { complaintCode: 'CKD10', question: 'भोजन का स्वाद बदला लगता है — धातु जैसा?', questionEn: 'Does food taste different — metallic?' },
    // idx 19
    { complaintCode: 'CKD10', question: 'उल्टी भी होती है क्या, खासकर सुबह के समय?', questionEn: 'Do you also vomit, especially in the mornings?' },
    // CKD11 CKD + leg restlessness
    // idx 20
    { complaintCode: 'CKD11', question: 'पैरों में बेचैनी कब ज्यादा होती है — रात/आराम के समय?', questionEn: 'When is the leg restlessness worse — night/rest time?' },
    // idx 21
    { complaintCode: 'CKD11', question: 'पैर हिलाने-चलाने से आराम मिलता है?', questionEn: 'Does moving the legs give relief?' },
    // CKD12 Anemia with kidney disease
    // idx 22
    { complaintCode: 'CKD12', question: 'हाल की हीमोग्लोबिन (Hb) रिपोर्ट कितनी है?', questionEn: 'What is the recent hemoglobin (Hb) report?' },
    // idx 23
    { complaintCode: 'CKD12', question: 'एरिथ्रोपॉइटिन (EPO) इंजेक्शन चल रहा है — कौन सा, हफ्ते में कितनी बार?', questionEn: 'Are you on erythropoietin (EPO) injections — which one, how many times a week?' },
    // CKD13 CKD bone pain
    // idx 24
    { complaintCode: 'CKD13', question: 'हड्डियों/कमर में दर्द कहां-कहां है?', questionEn: 'Where are the bone/back pains located?' },
    // idx 25
    { complaintCode: 'CKD13', question: 'कोई हड्डी टेढ़ी दिख रही है या लंबाई घटी लगती है?', questionEn: 'Any visible bone deformity or apparent height loss?' },
    // CKD14 Deep breathing + CKD
    // idx 26
    { complaintCode: 'CKD14', question: 'सांस कैसी चल रही है — गहरी और तेज, बिना मेहनत के भी?', questionEn: 'How is the breathing — deep and rapid, even without exertion?' },
    // idx 27
    { complaintCode: 'CKD14', question: 'लेटने पर सांस फूलती है या तकिया ज्यादा लगाना पड़ता है?', questionEn: 'Do you get breathless lying flat or need more pillows?' },
    // AKI01 Sudden low urine + dehydration
    // idx 28
    { complaintCode: 'AKI01', question: 'उल्टी-दस्त/पसीने से पानी की कमी कब से है?', questionEn: 'Since when has the dehydration (vomiting/loose motions/sweating) been there?' },
    // idx 29
    { complaintCode: 'AKI01', question: 'पेशाब कब से कम हो गया — आज सुबह से या कल से?', questionEn: 'Since when has urine reduced — since this morning or yesterday?' },
    // AKI02 Loose motions + weakness
    // idx 30
    { complaintCode: 'AKI02', question: '24 घंटे में कितनी बार दस्त हुए हैं?', questionEn: 'How many loose motions in the last 24 hours?' },
    // idx 31
    { complaintCode: 'AKI02', question: 'ORS/पानी पी रहे हैं — कितनी मात्रा में?', questionEn: 'Are you taking ORS/water — how much?' },
    // AKI03 Snake-bite kidney follow-up
    // idx 32
    { complaintCode: 'AKI03', question: 'सांप ने कब काटा था और कितनी बार?', questionEn: 'When did the snake bite, and how many times?' },
    // idx 33
    { complaintCode: 'AKI03', question: 'सांप का विष-उपचार (antivenom) दिया गया था?', questionEn: 'Was antivenom given?' },
    // AKI04 Vomiting + back pain + low urine
    // idx 34
    { complaintCode: 'AKI04', question: 'उल्टी कितनी बार हुई और पीठ/कमर में दर्द है?', questionEn: 'How many times did you vomit, and is there back/flank pain?' },
    // idx 35
    { complaintCode: 'AKI04', question: 'पेशाब का रंग और मात्रा कैसी है?', questionEn: 'What is the urine colour and quantity like?' },
    // AKI05 Post-AKI recovery check
    // idx 36
    { complaintCode: 'AKI05', question: 'अस्पताल से छूटने के बाद क्रिएटिनिन की रिपोर्ट कराई है?', questionEn: 'Has creatinine been tested after hospital discharge?' },
    // idx 37
    { complaintCode: 'AKI05', question: 'दवाएं वैसे ही चल रही हैं जैसी डिस्चार्ज पर लिखी थीं?', questionEn: 'Are the medicines running the same as prescribed at discharge?' },
    // DBK01 Diabetes kidney report review
    // idx 38
    { complaintCode: 'DBK01', question: 'शुगर कितने सालों से है और हाल की HbA1c कितनी आई?', questionEn: 'How many years of diabetes, and what was the recent HbA1c?' },
    // idx 39
    { complaintCode: 'DBK01', question: 'शुगर की कौन सी दवाएं चल रही हैं?', questionEn: 'Which diabetes medicines are you currently on?' },
    // DBK02 BP kidney report review
    // idx 40
    { complaintCode: 'DBK02', question: 'घर पर BP की रीडिंग कैसी आ रही है — रिकॉर्ड दिखाएं?', questionEn: 'What are the home BP readings — show the log?' },
    // idx 41
    { complaintCode: 'DBK02', question: 'क्रिएटिनिन के साथ पोटैशियम (K+) की जांच भी हुई है?', questionEn: 'Was potassium (K+) also tested along with creatinine?' },
    // STN01 Stone + fever
    // idx 42
    { complaintCode: 'STN01', question: 'बुखार के साथ कंपकंपी (रिगर) आती है?', questionEn: 'Is there shivering (rigors) with the fever?' },
    // idx 43
    { complaintCode: 'STN01', question: 'पीठ/कमर में दर्द किस तरफ है?', questionEn: 'Which side is the back/flank pain on?' },
    // STN02 Stone obstruction watch
    // idx 44
    { complaintCode: 'STN02', question: 'पथरी की जांच (USG/KUB) इस बार कैसी आई है?', questionEn: 'What did the stone imaging (USG/KUB) show this time?' },
    // idx 45
    { complaintCode: 'STN02', question: 'दर्द आता-जाता है या लगातार बना रहता है?', questionEn: 'Does the pain come and go, or is it constant?' },
    // STN03 Prostate kidney backflow
    // idx 46
    { complaintCode: 'STN03', question: 'पेशाब का बहाव धीमा/रुका हुआ कब से है?', questionEn: 'Since when has the urine flow been slow or blocked?' },
    // idx 47
    { complaintCode: 'STN03', question: 'पेशाब पूरा नहीं छूटता — ऐसा एहसास होता है?', questionEn: 'Do you feel incomplete emptying of the bladder?' },
    // TRN01 Hemodialysis ongoing check
    // idx 48
    { complaintCode: 'TRN01', question: 'हफ्ते में कितनी बार डायलिसिस (HD) होता है?', questionEn: 'How many hemodialysis sessions per week?' },
    // idx 49
    { complaintCode: 'TRN01', question: 'दो HD के बीच कितना वजन बढ़ जाता है (kg में)?', questionEn: 'How much weight gain between dialysis sessions (in kg)?' },
    // TRN02 Peritoneal dialysis check
    // idx 50
    { complaintCode: 'TRN02', question: 'पेट की डायलिसिस (PD) में दिन में कितनी बार बदलाव करते हैं?', questionEn: 'How many PD exchanges do you do per day?' },
    // idx 51
    { complaintCode: 'TRN02', question: 'बाहर निकलने वाले द्रव का रंग साफ है?', questionEn: 'Is the drained fluid clear?' },
    // TRN03 Kidney transplant follow-up
    // idx 52
    { complaintCode: 'TRN03', question: 'ट्रांसप्लांट को कितने महीने/साल हो गए हैं?', questionEn: 'How many months/years since the transplant?' },
    // idx 53
    { complaintCode: 'TRN03', question: 'कौन सी दवाएं चल रही हैं — immunosuppressant की सूची लाएं?', questionEn: 'Which medicines are you on — bring the immunosuppressant list?' },
    // TRN04 Transplant + rising creatinine
    // idx 54
    { complaintCode: 'TRN04', question: 'ट्रांसप्लांट के बाद से क्रिएटिनिन कितना बढ़ा है?', questionEn: 'How much has creatinine risen since the transplant?' },
    // idx 55
    { complaintCode: 'TRN04', question: 'बुखार या पेशाब में जलन भी है?', questionEn: 'Any fever or burning urination as well?' },
    // TRN05 Pre-dialysis vaccine consult
    // idx 56
    { complaintCode: 'TRN05', question: 'डायलिसिस शुरू होने से पहले के टीके (हेपेटाइटिस-B/फ्लू/निमोनिया) लगे हैं?', questionEn: 'Have the pre-dialysis vaccines (Hep-B/flu/pneumonia) been taken?' },
    // idx 57
    { complaintCode: 'TRN05', question: 'कौन सी खुराकें लग चुकी हैं — कौन सी बाकी हैं?', questionEn: 'Which doses are done — which ones remain?' },
    // OTH01 Morning face swelling
    // idx 58
    { complaintCode: 'OTH01', question: 'चेहरे की सूजन सुबह उठते समय ज्यादा होती है?', questionEn: 'Is the facial swelling worse on waking in the morning?' },
    // idx 59
    { complaintCode: 'OTH01', question: 'पेशाब में झाग या रंग बदलना देखा है?', questionEn: 'Any foam or colour change noticed in urine?' },
    // OTH02 Blood in urine + swelling
    // idx 60
    { complaintCode: 'OTH02', question: 'पेशाब में खून कैसा दिखा — जलन के साथ या बिना जलन?', questionEn: 'How did blood in urine appear — with or without burning?' },
    // idx 61
    { complaintCode: 'OTH02', question: 'आंखों के आसपास या टांगों में सूजन भी है?', questionEn: 'Any swelling around the eyes or in the legs?' },
    // OTH03 Foamy urine
    // idx 62
    { complaintCode: 'OTH03', question: 'झाग कब से बन रहा है — शुरुआत में या पूरे पेशाब में?', questionEn: 'Since when is foam forming — at the start or through the stream?' },
    // idx 63
    { complaintCode: 'OTH03', question: 'झाग क्या पानी में कुछ देर बाद भी टिका रहता है?', questionEn: 'Does the foam persist on the water for a while?' },
    // OTH04 Urine protein high on report
    // idx 64
    { complaintCode: 'OTH04', question: 'रिपोर्ट में प्रोटीन कितना आया है (+ ग्रेड/mg में)?', questionEn: 'What is the protein level on the report (in + grade/mg)?' },
    // idx 65
    { complaintCode: 'OTH04', question: 'पिछली जांच से प्रोटीन बढ़ा है या घटा है?', questionEn: 'Has protein increased or decreased since the last test?' },
    // OTH05 Gout + kidney report
    // idx 66
    { complaintCode: 'OTH05', question: 'यूरिक एसिड की हाल की रिपोर्ट कितनी आई है?', questionEn: 'What was the recent uric acid report?' },
    // idx 67
    { complaintCode: 'OTH05', question: 'गठिये के दौरे (gout attack) में कौन सी दवा लेते हैं?', questionEn: 'Which medicine do you take during gout attacks?' },
    // OTH06 Long painkiller use
    // idx 68
    { complaintCode: 'OTH06', question: 'दर्द की गोली (combiflam/voveran जैसी NSAID) महीने में कितने दिन लेते हैं?', questionEn: 'How many days per month do you take pain tablets (NSAIDs like combiflam/voveran)?' },
    // idx 69
    { complaintCode: 'OTH06', question: 'दुकान से ली गोली या देसी/हर्बल दवा — कौन सी चल रही है?', questionEn: 'Which chemist-bought tablets or native/herbal medicines are you taking?' },
    // OTH07 Arthritis medicine kidney review
    // idx 70
    { complaintCode: 'OTH07', question: 'गठिया/जोड़ों के डॉक्टर से कौन सी दवा चल रही है?', questionEn: 'Which medicines from the arthritis/joint doctor are running?' },
    // idx 71
    { complaintCode: 'OTH07', question: 'दवा शुरू करने के बाद पेशाब या सूजन में बदलाव देखा?', questionEn: 'Any change in urine or swelling after starting the medicine?' },
    // OTH08 Kidney cyst follow-up
    // idx 72
    { complaintCode: 'OTH08', question: 'सिस्ट कितने हैं और कितने बड़े (USG रिपोर्ट में)?', questionEn: 'How many cysts and how big (on the USG report)?' },
    // idx 73
    { complaintCode: 'OTH08', question: 'सिस्ट की जगह दर्द या बुखार होता है?', questionEn: 'Do the cysts cause pain or fever?' },
    // OTH09 PKD family screening
    // idx 74
    { complaintCode: 'OTH09', question: 'परिवार में किसे PKD/किडनी रोग है — माता/पिता/भाई-बहन?', questionEn: 'Who in the family has PKD/kidney disease — mother/father/siblings?' },
    // idx 75
    { complaintCode: 'OTH09', question: 'भाई-बहन की USG स्क्रीनिंग करा ली है?', questionEn: 'Have the siblings been screened by USG?' },
    // OTH10 Single kidney precautions
    // idx 76
    { complaintCode: 'OTH10', question: 'एक किडनी जन्म से है या ऑपरेशन से निकलवाई गई है?', questionEn: 'Is the single kidney by birth, or was one removed by surgery?' },
    // idx 77
    { complaintCode: 'OTH10', question: 'खेल/जिम में पेट-कमर पर चोट लगने का डर है?', questionEn: 'Any risk of abdominal/back injury in sports or gym?' },
    // OTH11 Potassium high on report
    // idx 78
    { complaintCode: 'OTH11', question: 'रिपोर्ट में पोटैशियम (K+) कितना आया है?', questionEn: 'What is the potassium (K+) value on the report?' },
    // idx 79
    { complaintCode: 'OTH11', question: 'धड़कन तेज चलना या मांसपेशियों में कमजोरी महसूस होती है?', questionEn: 'Any palpitations or muscle weakness felt?' },
    // OTH12 Sodium low on report
    // idx 80
    { complaintCode: 'OTH12', question: 'रिपोर्ट में सोडियम (Na+) कितना आया है?', questionEn: 'What is the sodium (Na+) value on the report?' },
    // idx 81
    { complaintCode: 'OTH12', question: 'कमजोरी/चक्कर या दिमाग में उलझन महसूस होती है?', questionEn: 'Any weakness/giddiness or confusion felt?' },
    // OTH13 Kidney diet consult
    // idx 82
    { complaintCode: 'OTH13', question: 'डाइट के लिए CKD की स्टेज कौन सी बताई गई है?', questionEn: 'Which CKD stage has been told to you for the diet?' },
    // idx 83
    { complaintCode: 'OTH13', question: 'दूध/फल/सब्जियों में से क्या-क्या रोज लेते हैं?', questionEn: 'What milk/fruits/vegetables do you take daily?' },
    // OTH14 CKD water-intake consult
    // idx 84
    { complaintCode: 'OTH14', question: 'डॉक्टर ने दिन में कितना पानी/तरल बताया है?', questionEn: 'How much water/fluid has the doctor advised per day?' },
    // idx 85
    { complaintCode: 'OTH14', question: 'वजन रोज एक ही तराजू से नापते हैं?', questionEn: 'Do you weigh yourself daily on the same scale?' },
    // OTH15 Pregnancy with kidney disease
    // idx 86
    { complaintCode: 'OTH15', question: 'गर्भावस्था कितने महीने/हफ्तों की है?', questionEn: 'How many months/weeks is the pregnancy?' },
    // idx 87
    { complaintCode: 'OTH15', question: 'इससे पहले गर्भपात, उच्च BP या किडनी की समस्या रही है?', questionEn: 'Any prior miscarriage, high BP, or kidney problem?' },
  ],

  // ══ Suggestions (176 — exactly 2 per question) ════════════════════════
  suggestions: [
    // idx 0 — CKD01
    { questionIndex: 0, text: 'क्रिएटिनिन 1.2-1.5 — हल्का बढ़ा हुआ; पानी की कमी या दर्द की गोली भी कारण हो सकती है — दोबारा जांच कराएं', textEn: 'Creatinine 1.2-1.5 — mildly raised; dehydration or pain tablets can also cause it — retest' },
    { questionIndex: 0, text: 'क्रिएटिनिन 2 से ज्यादा — नेफ्रोलॉजिस्ट से जल्दी मिलें; हर रिपोर्ट एक फाइल में संभालकर लाएं', textEn: 'Creatinine above 2 — see a nephrologist soon; keep every report in one file and bring it' },
    // idx 1 — CKD01
    { questionIndex: 1, text: 'बढ़ता क्रिएटिनिन — 2 हफ्तों में जांच दोहराएं; कोई नई/हर्बल दवा डॉक्टर को जरूर बताएं', textEn: 'Rising creatinine — retest in 2 weeks; disclose any new/herbal medicine to the doctor' },
    { questionIndex: 1, text: 'स्थिर क्रिएटिनिन — 3 महीने में फॉलो-अप; हर विजिट में रिपोर्ट साथ लाना जारी रखें', textEn: 'Stable creatinine — follow-up every 3 months; keep bringing reports to every visit' },
    // idx 2 — CKD02
    { questionIndex: 2, text: 'eGFR 30-60 — स्टेज-3: प्रोटीन मात्रा तय, नमक 1 चम्मच/दिन से कम, BP 130/80 से नीचे रखें', textEn: 'eGFR 30-60 — stage-3: fixed protein portion, salt under 1 teaspoon/day, keep BP below 130/80' },
    { questionIndex: 2, text: 'eGFR 30 से कम — स्टेज-4/5: KMC काउंसलिंग + नेफ्रोलॉजिस्ट की नियमित विजिट जरूरी', textEn: 'eGFR below 30 — stage-4/5: KMC counselling + regular nephrologist visits essential' },
    // idx 3 — CKD02
    { questionIndex: 3, text: 'नई दर्द की गोली (NSAID) — आज ही बंद करें; दर्द में सिर्फ paracetamol सुरक्षित है', textEn: 'New pain tablet (NSAID) — stop today; only paracetamol is safe for pain' },
    { questionIndex: 3, text: 'नई एंटीबायोटिक — नेफ्रोलॉजिस्ट से खुराक जांचवाएं; कुछ एंटीबायोटिक किडनी पर भारी होती हैं', textEn: 'New antibiotic — get the dose kidney-checked; some antibiotics burden the kidneys' },
    // idx 4 — CKD03
    { questionIndex: 4, text: 'शाम की सूजन — पैर ऊंचा रखें, नमक 1 चम्मच/दिन से कम; वजन रोज नापें', textEn: 'Evening swelling — elevate the legs, salt under 1 teaspoon/day; weigh daily' },
    { questionIndex: 4, text: 'सुबह की सूजन (चेहरे + पैर) — किडनी जांच (पेशाब प्रोटीन/क्रिएटिनिन) कराएं', textEn: 'Morning swelling (face + legs) — get kidney tests (urine protein/creatinine)' },
    // idx 5 — CKD03
    { questionIndex: 5, text: 'गड्ढा बनना (pitting) — तरल सीमित करें; पानी की दवा (Dytor) की खुराक डॉक्टर से जांचवाएं', textEn: 'Pitting edema — restrict fluids; have the diuretic (Dytor) dose reviewed by the doctor' },
    { questionIndex: 5, text: 'बिना गड्ढा — हल्का; पैर ऊंचा रखें और लंबे समय खड़े न रहें', textEn: 'Non-pitting — mild; elevate the legs and avoid standing for long' },
    // idx 6 — CKD04
    { questionIndex: 6, text: 'पेशाब 400 ml/दिन से कम — तुरंत डॉक्टर; यह किडनी के लिए खतरे की सीमा है', textEn: 'Urine under 400 ml/day — see a doctor promptly; this is the danger threshold for kidneys' },
    { questionIndex: 6, text: 'पेशाब 800 ml से ऊपर — पर्याप्त; तरल निर्धारित सीमा में ही लें', textEn: 'Urine above 800 ml — adequate; keep fluids within the prescribed limit' },
    // idx 7 — CKD04
    { questionIndex: 7, text: 'रात में 3 बार से ज्यादा — BP/किडनी जांच; शाम को तरल घटाएं', textEn: 'Waking 3+ times at night — check BP/kidney; cut evening fluids' },
    { questionIndex: 7, text: '1-2 बार — सामान्य; रात की दवा समय पर लेते रहें', textEn: 'Once-twice — normal; keep taking night medicines on time' },
    // idx 8 — CKD05
    { questionIndex: 8, text: 'घर का BP 130/80 से नीचे रखें — यही किडनी की सुरक्षा का लक्ष्य है', textEn: 'Keep home BP below 130/80 — this is the kidney-protection target' },
    { questionIndex: 8, text: 'BP लगातार 150 से ऊपर — खुराक बढ़ने की जरूरत हो सकती है; 3 दिन का रिकॉर्ड लेकर आएं', textEn: 'BP persistently above 150 — dose increase may be needed; bring a 3-day log' },
    // idx 9 — CKD05
    { questionIndex: 9, text: 'ARB दवा (Telma) किडनी के लिए रक्षात्मक है — शुरू/बदलाव के 1-2 हफ्ते बाद K+ और क्रिएटिनिन जांचें', textEn: 'ARB (Telma) is kidney-protective — check K+ and creatinine 1-2 weeks after starting or changing' },
    { questionIndex: 9, text: 'एडवांस CKD में BP दवा समायोजन — हृदय डॉक्टर (CAR-01) के साथ साझा देखभाल रखें', textEn: 'Advanced CKD BP adjustment — keep shared care with the cardiologist (CAR-01)' },
    // idx 10 — CKD06
    { questionIndex: 10, text: 'स्थिर eGFR — 3 महीने में रिपोर्ट; प्रोटीन की मात्रा डॉक्टर की सलाह से तय रखें', textEn: 'Stable eGFR — report 3-monthly; keep protein portion fixed per doctor advice' },
    { questionIndex: 10, text: 'eGFR गिर रहा है — 1 महीने में दोहराएं; नमक और दर्द की गोली का ऑडिट करें', textEn: 'Falling eGFR — retest in 1 month; audit salt and pain-tablet use' },
    // idx 11 — CKD06
    { questionIndex: 11, text: 'प्रोटीन जांच हर 3-6 महीने — dipstick/ACR; रिपोर्ट हर विजिट में लाएं', textEn: 'Protein test every 3-6 months — dipstick/ACR; bring the report every visit' },
    { questionIndex: 11, text: 'प्रोटीन 3+ या ACR बहुत ज्यादा — बायोप्सी की सोच नेफ्रोलॉजिस्ट के साथ — रेफर करें', textEn: 'Protein 3+ or very high ACR — biopsy consideration with nephrologist — refer' },
    // idx 12 — CKD07
    { questionIndex: 12, text: 'KMC = किडनी-उपचार-विकल्प काउंसलिंग — डॉक्टर से HD/PD/ट्रांसप्लांट के फायदे-नुकसान समझें', textEn: 'KMC = kidney treatment-choice counselling — understand HD/PD/transplant pros and cons with the doctor' },
    { questionIndex: 12, text: 'KMC बाकी है — अगली विजिट में परिवार समेत काउंसलिंग की बैठक तय करें', textEn: 'KMC pending — book a counselling sitting with family in the next visit' },
    // idx 13 — CKD07
    { questionIndex: 13, text: 'परिवार में दान की बात — ब्लड-ग्रुप/टिशू-मैचिंग की जांच से शुरू होती है; नेफ्रोलॉजिस्ट से पूछें', textEn: 'Family donation talk — starts with blood-group/tissue matching; ask the nephrologist' },
    { questionIndex: 13, text: 'परिवार में दान मुश्किल — डेड-डोनर लिस्ट (NOTTO) के बारे में जानकारी लें', textEn: 'Family donation difficult — ask about the deceased-donor list (NOTTO)' },
    // idx 14 — CKD08
    { questionIndex: 14, text: 'HD — हफ्ते में 3 बार, हर बार 4 घंटे; फिस्टुला 2-3 महीने पहले बनवा लें', textEn: 'HD — 3 times a week, 4 hours each; get the fistula made 2-3 months in advance' },
    { questionIndex: 14, text: 'PD — घर पर रोज; बच्चों/पालतू से साफ-सफाई जरूरी; PD नर्स से ट्रेनिंग लें', textEn: 'PD — daily at home; strict hygiene around children/pets; take PD-nurse training' },
    // idx 15 — CKD08
    { questionIndex: 15, text: 'फिस्टुला बन गया — उस बांह पर BP/सुई/तंग बाजू कभी नहीं; रोज फिस्टुला का थ्रिल (बहती धड़कन) महसूस करें', textEn: 'Fistula done — never BP cuff/needles/tight sleeves on that arm; feel the thrill daily' },
    { questionIndex: 15, text: 'फिस्टुला नहीं बना — वैस्कुलर सर्जन से जल्दी मिलें; जब तक हो सके, कैथेटर से बचें', textEn: 'No fistula yet — see a vascular surgeon soon; avoid a catheter where possible' },
    // idx 16 — CKD09
    { questionIndex: 16, text: 'रात की खुजली — यूरेमिक खुजली हो सकती है; K+ और फॉस्फेट की जांच कराएं', textEn: 'Night itching — may be uremic itching; get K+ and phosphate checked' },
    { questionIndex: 16, text: 'हल्की खुजली — मॉइस्चराइजर + हल्की एंटीहिस्टामिन; गर्म पानी से नहाना घटाएं', textEn: 'Mild itching — moisturiser + mild antihistamine; reduce hot-water baths' },
    // idx 17 — CKD09
    { questionIndex: 17, text: 'खुजली से नींद टूटती है — क्रिएटिनिन/फॉस्फेट डॉक्टर को दिखाएं; दवा बदलने की जरूरत हो सकती है', textEn: 'Itching disturbs sleep — show creatinine/phosphate to the doctor; a medicine change may be needed' },
    { questionIndex: 17, text: 'खुजाने से खून — त्वचा संक्रमण की जांच; नाखून छोटे रखें', textEn: 'Scratching till bleeding — check for skin infection; keep nails short' },
    // idx 18 — CKD10
    { questionIndex: 18, text: 'धातु जैसा स्वाद — यूरेमिया का संकेत; क्रिएटिनिन की जांच जरूरी है', textEn: 'Metallic taste — a sign of uremia; creatinine test needed' },
    { questionIndex: 18, text: 'हल्का स्वाद-बदलाव — छोटे ठंडे भोजन लें; जीभ की सफाई रखें', textEn: 'Mild taste change — small cold meals; keep tongue hygiene' },
    // idx 19 — CKD10
    { questionIndex: 19, text: 'सुबह उल्टी + CKD — यूरेमिया का खतरे का संकेत; सांस फूले या दिमाग घुमे तो ER तुरंत', textEn: 'Morning vomiting + CKD — danger sign of uremia; breathlessness or confusion means ER now' },
    { questionIndex: 19, text: 'उल्टी से पानी की कमी — छोटे-छोटे घूंट ORS (डॉक्टर की सीमा में); उल्टी की दवा लें', textEn: 'Vomiting dehydration — small ORS sips (within the advised limit); take an anti-emetic' },
    // idx 20 — CKD11
    { questionIndex: 20, text: 'रात की बेचैनी — CKD में आम है; शाम को पैरों की मालिश/गुनगुना पानी; कैफीन घटाएं', textEn: 'Night restlessness — common in CKD; evening leg massage/warm soak; cut caffeine' },
    { questionIndex: 20, text: 'बहुत तेज बेचैनी — आयरन/K+/कैल्शियम जांचें; नेफ्रोलॉजिस्ट को बताएं', textEn: 'Very severe restlessness — check iron/K+/calcium; inform the nephrologist' },
    // idx 21 — CKD11
    { questionIndex: 21, text: 'हिलाने से राहत — रेस्टलेस लेग सिंड्रोम की पुष्टि; हल्की स्ट्रेचिंग से मदद मिलती है', textEn: 'Relief on moving — confirms restless legs; gentle stretching helps' },
    { questionIndex: 21, text: 'कोई फर्क नहीं — नस-जांच (neuropathy) सोचें और शुगर भी जांचवाएं', textEn: 'No relief — consider a nerve check (neuropathy) and also test sugar' },
    // idx 22 — CKD12
    { questionIndex: 22, text: 'Hb 7-10 — आयरन + EPO जांच चाहिए; EPO खुराक नेफ्रोलॉजिस्ट तय करते हैं (लक्ष्य 10-11.5)', textEn: 'Hb 7-10 — needs iron + EPO workup; the nephrologist sets EPO dose (target 10-11.5)' },
    { questionIndex: 22, text: 'Hb 7 से कम — जल्दी मिलें; चक्कर या तेज धड़कन हो तो उसी दिन डॉक्टर', textEn: 'Hb below 7 — see doctor soon; giddiness or fast pulse means same-day review' },
    // idx 23 — CKD12
    { questionIndex: 23, text: 'EPO चालू है — कभी खुद से बंद न करें; हर हफ्ते लें और 2-4 हफ्तों में Hb जांचें', textEn: 'EPO running — never self-stop; take weekly and check Hb every 2-4 weeks' },
    { questionIndex: 23, text: 'EPO नहीं चल रहा — Hb 10 से कम हो तो नेफ्रोलॉजिस्ट से EPO की बात करें', textEn: 'Not on EPO — if Hb is below 10, discuss EPO with the nephrologist' },
    // idx 24 — CKD13
    { questionIndex: 24, text: 'कमर/कूल्हे का दर्द — CKD हड्डी रोग की जांच कराएं: Ca/Phos/PTH और विटामिन D', textEn: 'Back/hip pain — get CKD bone-disease workup: Ca/Phos/PTH and vitamin D' },
    { questionIndex: 24, text: 'पैरों के दर्द — कैल्शियम/विटामिन D जांचें; दर्द में सिर्फ paracetamol लें', textEn: 'Leg pains — check calcium/vitamin D; take paracetamol only for pain' },
    // idx 25 — CKD13
    { questionIndex: 25, text: 'हड्डी टेढ़ी/लंबाई घटी — गंभीर CKD हड्डी रोग; नेफ्रोलॉजिस्ट + विटामिन D खुराक समीक्षा जरूरी', textEn: 'Deformity/height loss — severe CKD bone disease; nephrologist + vitamin D dose review needed' },
    { questionIndex: 25, text: 'कोई बदलाव नहीं — विटामिन D सप्लिमेंट + नियमित Ca/Phos निगरानी जारी रखें', textEn: 'No deformity — continue vitamin D supplement + regular Ca/Phos monitoring' },
    // idx 26 — CKD14
    { questionIndex: 26, text: 'बिना मेहनत के गहरी तेज सांस — एसिडोसिस खतरनाक — तुरंत ER; बाइकार्बोनेट जांच चाहिए', textEn: 'Deep rapid breathing at rest — dangerous acidosis — ER now; bicarbonate test needed' },
    { questionIndex: 26, text: 'सांस में हल्का बदलाव — HCO3 जांच कराएं; बाइकार्बोनेट दवा (Sodamint) की खुराक डॉक्टर से जांचवाएं', textEn: 'Mildly changed breathing — get HCO3 tested; review the bicarbonate (Sodamint) dose with the doctor' },
    // idx 27 — CKD14
    { questionIndex: 27, text: 'लेटने पर सांस फूलना — शरीर में तरल ज्यादा/दिल पर भार — तुरंत डॉक्टर', textEn: 'Breathless lying flat — fluid overload/heart strain — urgent doctor visit' },
    { questionIndex: 27, text: 'तकिया ज्यादा लगाना — तरल की सीमा कड़ी करें; वजन रोज नापें', textEn: 'Needing more pillows — tighten the fluid limit; weigh daily' },
    // idx 28 — AKI01
    { questionIndex: 28, text: 'पानी की कमी — ORS छोटे-छोटे घूंट में; पेशाब घटता दिखे तो तुरंत ER (AKI का खतरा)', textEn: 'Dehydration — ORS in small sips; if urine drops, ER now (AKI risk)' },
    { questionIndex: 28, text: 'उल्टी-दस्त रुक चुके हैं — 6 घंटे में पेशाब लौट आना चाहिए; न लौटे तो ER', textEn: 'Vomiting-diarrhea settled — urine should return within 6 hours; else ER' },
    // idx 29 — AKI01
    { questionIndex: 29, text: 'आज सुबह से पेशाब नहीं — तुरंत अस्पताल; खुद दवा या पानी की मात्रा न बढ़ाएं', textEn: 'No urine since morning — hospital now; do not self-increase medicines or fluids' },
    { questionIndex: 29, text: 'कल से पेशाब कम + कमजोरी — आज ही क्रिएटिनिन और K+ की जांच कराएं', textEn: 'Reduced urine since yesterday + weakness — get creatinine and K+ tested today' },
    // idx 30 — AKI02
    { questionIndex: 30, text: 'दस्त 5 बार से ज्यादा — हर दस्त के बाद 1 ओरा ORS; बच्चों/बुजुर्गों में खतरा ज्यादा होता है', textEn: 'More than 5 stools — 1 glass ORS after every stool; higher risk in children/elderly' },
    { questionIndex: 30, text: 'दस्त 10 से ज्यादा या पेशाब कम — ER तुरंत; मानसून में AKI आम है', textEn: 'More than 10 stools or reduced urine — ER now; AKI is common in the monsoon' },
    // idx 31 — AKI02
    { questionIndex: 31, text: 'ORS कम पिया है — प्यास न लगे तो भी घूंट-घूंट पिएं; पेशाब का गहरा रंग = पानी की कमी', textEn: 'Little ORS taken — sip even without thirst; dark urine = fluid deficit' },
    { questionIndex: 31, text: 'ORS पर्याप्त — निगरानी जारी रखें; दस्त में दूध और मीठे जूस बंद रखें', textEn: 'ORS adequate — keep monitoring; stop milk and sweet juices during diarrhea' },
    // idx 32 — AKI03
    { questionIndex: 32, text: 'काटने को 24 घंटे से ज्यादा और पेशाब कम — सांप-विष AKI — तुरंत अस्पताल (रेफर)', textEn: 'Bite more than 24 hours ago with low urine — snake-venom AKI — hospital now (refer)' },
    { questionIndex: 32, text: 'हाल का काटना — antivenom केंद्र से रेफर करें; काटे स्थान की निगरानी रखें', textEn: 'Recent bite — refer to an antivenom centre; monitor the bite site' },
    // idx 33 — AKI03
    { questionIndex: 33, text: 'Antivenom मिल चुका है — फिर भी 48-72 घंटे क्रिएटिनिन की निगरानी चाहिए; बाद में रिकवरी जांच', textEn: 'Antivenom given — still needs 48-72 hour creatinine monitoring; later recovery check' },
    { questionIndex: 33, text: 'Antivenom नहीं मिला/पता नहीं — तुरंत बताएं; न मिलने पर AKI का खतरा सबसे ज्यादा होता है', textEn: 'Antivenom not given/unknown — report now; the AKI risk is highest when it was not given' },
    // idx 34 — AKI04
    { questionIndex: 34, text: 'उल्टी + पीठ दर्द + कम पेशाब — गैस्ट्रो-AKI या रुकावट — भर्ती होकर जांच कराएं', textEn: 'Vomiting + flank pain + low urine — gastro-AKI or obstruction — get admitted for workup' },
    { questionIndex: 34, text: 'हल्का दर्द — ORS + उल्टी की दवा; 12 घंटे में सुधार न हो तो तुरंत दोबारा', textEn: 'Mild pain — ORS + anti-emetic; if not better in 12 hours, urgent recheck' },
    // idx 35 — AKI04
    { questionIndex: 35, text: 'गहरा/बहुत कम पेशाब — क्रिएटिनिन + USG तुरंत; खुद से पानी की गोली (diuretic) न लें', textEn: 'Dark/scanty urine — creatinine + USG now; never self-start a water pill (diuretic)' },
    { questionIndex: 35, text: 'रंग/मात्रा सामान्य — तरल + आराम; रिकवरी में रिपोर्ट दोहराते रहें', textEn: 'Normal colour/volume — fluids + rest; keep retesting the report during recovery' },
    // idx 36 — AKI05
    { questionIndex: 36, text: 'डिस्चार्ज के 3-7 दिन में क्रिएटिनिन/पोटैशियम दोहराएं — हर बार रिपोर्ट साथ लाएं', textEn: 'Repeat creatinine/potassium 3-7 days after discharge — bring the report every visit' },
    { questionIndex: 36, text: 'जांच नहीं कराई — आज ही कराएं; AKI के बाद किडनी की निगरानी 6-12 महीने चलती है', textEn: 'Not tested — do it today; post-AKI kidney monitoring runs 6-12 months' },
    // idx 37 — AKI05
    { questionIndex: 37, text: 'दवाएं वही चल रही हैं — अच्छा; खुद से कोई बदलाव न करें; दर्द में सिर्फ paracetamol', textEn: 'Same medicines — good; never self-change; paracetamol only for pain' },
    { questionIndex: 37, text: 'कुछ दवाएं बंद कर दीं — बताएं कौन सी; BP की दवा अकसर कुछ दिन रोकी जाती है — डॉक्टर से दोबारा शुरू करवाएं', textEn: 'Some medicines stopped — say which; BP medicines are often paused briefly — restart via the doctor' },
    // idx 38 — DBK01
    { questionIndex: 38, text: 'शुगर 10 साल से ज्यादा — हर साल पेशाब ACR जांच; DIA-01 पैक के साथ साझा देखभाल रखें', textEn: 'Diabetes 10+ years — yearly urine ACR; keep shared care with the DIA-01 pack' },
    { questionIndex: 38, text: 'HbA1c 8 से ऊपर — शुगर कसें; किडनी पर सीधा असर पड़ता है; डाइटिशियन से मिलें', textEn: 'HbA1c above 8 — tighten sugar; direct impact on kidneys; see a dietician' },
    // idx 39 — DBK01
    { questionIndex: 39, text: 'मेटफॉर्मिन एडवांस CKD (eGFR 30 से कम) में खुराक/बंदी का निर्णय — नेफ्रो + DIA दोनों से जांचें', textEn: 'Metformin in advanced CKD (eGFR below 30) — dose/stop decision via both nephro and DIA packs' },
    { questionIndex: 39, text: 'SGLT2 वर्ग की शुगर-दवा किडनी-रक्षात्मक होती है — नेफ्रोलॉजिस्ट से पुष्टि कराएं', textEn: 'SGLT2-class sugar medicines are kidney-protective — confirm with the nephrologist' },
    // idx 40 — DBK02
    { questionIndex: 40, text: 'BP रिकॉर्ड का लक्ष्य 130/80 से नीचे — दवा समय पर; CAR-01 (हृदय) से साझा देखभाल', textEn: 'BP log target below 130/80 — timely medicines; shared care with CAR-01 (cardiology)' },
    { questionIndex: 40, text: 'BP लगातार 140 से ऊपर — खुराक समीक्षा चाहिए; नमक 1 चम्मच से कम रखें', textEn: 'BP persistently above 140 — dose review needed; keep salt under 1 teaspoon' },
    // idx 41 — DBK02
    { questionIndex: 41, text: 'K+ भी जांचें — ARB दवा (Telma) K+ बढ़ा सकती है; एडवांस CKD में खास ध्यान', textEn: 'Also check K+ — the ARB (Telma) can raise potassium; special care in advanced CKD' },
    { questionIndex: 41, text: 'K+ नहीं जांचा — अगली रिपोर्ट में K+ और क्रिएटिनिन साथ-साथ जांचें', textEn: 'K+ not tested — test K+ and creatinine together in the next report' },
    // idx 42 — STN01
    { questionIndex: 42, text: 'बुखार + कंपकंपी + पीठ दर्द — पायलोनेफ्राइटिस — आज ही डॉक्टर (संक्रमण फैल सकता है)', textEn: 'Fever + rigors + flank pain — pyelonephritis — doctor today (infection can spread)' },
    { questionIndex: 42, text: 'कंपकंपी नहीं — संभवतः सामान्य UTI; पेशाब की जांच कराएं', textEn: 'No rigors — likely a simple UTI; get a urine test' },
    // idx 43 — STN01
    { questionIndex: 43, text: 'पथरी + तेज बुखार + एक तरफ दर्द — रुकी हुई पथरी में संक्रमण — आपातकाल (ER) — USG जरूरी', textEn: 'Stone + high fever + one-sided pain — infected obstructed stone — emergency (ER) — USG needed' },
    { questionIndex: 43, text: 'दर्द दोनों तरफ/हल्का — जल्द नेफ्रो/यूरो विजिट; पानी निर्धारित मात्रा में ही लें', textEn: 'Both-side/mild pain — early nephro/uro visit; water only within the prescribed limit' },
    // idx 44 — STN02
    { questionIndex: 44, text: 'पथरी छोटी (5 mm से कम) — पानी + निगरानी; 6 mm से बड़ी या रुकावट — यूरोलॉजी (URO-01)', textEn: 'Small stone (under 5 mm) — fluids + watch; above 6 mm or blocked — urology (URO-01)' },
    { questionIndex: 44, text: 'रुकावट की आशंका — USG दोहराएं; दर्द असहनीय हो जाए तो तुरंत ER', textEn: 'Suspected obstruction — repeat USG; if pain becomes unbearable, ER now' },
    // idx 45 — STN02
    { questionIndex: 45, text: 'आता-जाता दर्द — पथरी खिसक रही हो सकती है; पेशाब छलनी में छानें, पथरी निकले तो संभालकर लाएं', textEn: 'Colicky pain — the stone may be moving; strain the urine and bring the stone if passed' },
    { questionIndex: 45, text: 'लगातार दर्द — USG/CT-KUB जांच; खुद से दर्द की गोली (NSAID) न लें — सिर्फ paracetamol', textEn: 'Constant pain — USG/CT-KUB workup; no self-NSAIDs — paracetamol only' },
    // idx 46 — STN03
    { questionIndex: 46, text: 'धीमा बहाव + उम्र — प्रोस्टेट बढ़ना संभव — URO-01 से जांच; बची किडनी की रक्षा जरूरी', textEn: 'Slow flow + older age — enlarged prostate likely — URO-01 workup; protect the remaining kidney' },
    { questionIndex: 46, text: 'अचानक पूरी रुकावट — यूरोलॉजी ER; कैथेटर लगवाना पड़ सकता है', textEn: 'Sudden complete blockage — urology ER; a catheter may be needed' },
    // idx 47 — STN03
    { questionIndex: 47, text: 'अधूरा एहसास — पेशाब जांच + पेशाब के बाद USG (बचा हुआ पेशाब); URO-01 से समन्वय', textEn: 'Incomplete emptying — urine test + post-void USG (residual urine); coordinate URO-01' },
    { questionIndex: 47, text: 'पूरा छूटता है — निगरानी जारी रखें; रात की दवा समय पर लें', textEn: 'Empties well — continue monitoring; take night medicines on time' },
    // idx 48 — TRN01
    { questionIndex: 48, text: 'HD हफ्ते में 2 बार — डॉक्टर से 3 बार की बात करें; पर्याप्त HD जीवन-रक्षक है', textEn: 'HD twice a week — discuss 3 times a week with the doctor; adequate HD is life-saving' },
    { questionIndex: 48, text: 'HD 3 बार/हफ्ता — अच्छा; सेशन कभी न छोड़ें — छोड़ना जानलेवा हो सकता है', textEn: 'HD 3 times a week — good; never skip sessions — skipping can be life-threatening' },
    // idx 49 — TRN01
    { questionIndex: 49, text: 'दो HD के बीच वजन 2 kg से ज्यादा बढ़ता है — तरल कड़ाई से घटाएं; ज्यादा गेन दिल पर भार डालता है', textEn: 'Inter-dialysis weight gain above 2 kg — cut fluids strictly; excess gain strains the heart' },
    { questionIndex: 49, text: 'गेन 2 kg से कम — बहुत अच्छा, यही लक्ष्य रखें; वजन हर HD दिन दर्ज करें', textEn: 'Gain under 2 kg — excellent, keep this target; record the weight every HD day' },
    // idx 50 — TRN02
    { questionIndex: 50, text: 'PD बदलाव-दिनचर्या बदली है — PD नर्स से पुष्टि करें; देर से बदलाव जोखिम बढ़ाता है', textEn: 'PD exchange schedule changed — confirm with the PD nurse; delayed exchanges raise risk' },
    { questionIndex: 50, text: 'निर्देशानुसार ही — अच्छा; घर की साफ-सफाई का नियम जारी रखें', textEn: 'As instructed — good; continue the home-hygiene routine' },
    // idx 51 — TRN02
    { questionIndex: 51, text: 'निकला द्रव धुंधला/सफेद — पेट की डायलिसिस में संक्रमण (peritonitis) — तुरंत PD केंद्र', textEn: 'Cloudy drained fluid — peritonitis of PD — PD centre now' },
    { questionIndex: 51, text: 'द्रव साफ — अच्छा; रोज देखें और कभी भी धुंधला दिखे तो उसी दिन फोन करें', textEn: 'Clear fluid — good; check daily and call the same day if it ever turns cloudy' },
    // idx 52 — TRN03
    { questionIndex: 52, text: 'ट्रांसप्लांट को 3 महीने से कम — सबसे नाजुक समय; कोई भी बुखार/दस्त उसी दिन डॉक्टर के पास', textEn: 'Transplant under 3 months — most delicate period; any fever/diarrhea means same-day doctor' },
    { questionIndex: 52, text: '1 साल से ज्यादा — स्थिर; फिर भी दवा का समय + मासिक क्रिएटिनिन जारी रखें', textEn: 'Over 1 year — stable; still keep medicine timing + monthly creatinine' },
    // idx 53 — TRN03
    { questionIndex: 53, text: 'immunosuppressant दवा कभी बंद न करें — बंद करने से रिजेक्शन होता है; स्टॉक खत्म होने से पहले ही नई खरीद लें', textEn: 'Never stop immunosuppressant medicines — stopping causes rejection; buy the refill before stock ends' },
    { questionIndex: 53, text: 'सूची हर विजिट में लाएं — डॉक्टर खुराक/समय से मिलाते हैं; आम दवाएं: tacrolimus/MMF/स्टेरॉयड', textEn: 'Bring the list every visit — the doctor matches doses/timings; common ones: tacrolimus/MMF/steroid' },
    // idx 54 — TRN04
    { questionIndex: 54, text: 'क्रिएटिनिन बढ़ रहा है (बेसलाइन से 0.3 ऊपर) — रिजेक्शन की आशंका — नेफ्रोलॉजिस्ट को आज ही बताएं', textEn: 'Creatinine rising (0.3 above baseline) — rejection suspicion — tell the nephrologist today' },
    { questionIndex: 54, text: 'हल्का बदलाव — 48-72 घंटे में जांच दोहराएं; खुद से खुराक न बदलें', textEn: 'Mild change — retest in 48-72 hours; never self-adjust doses' },
    // idx 55 — TRN04
    { questionIndex: 55, text: 'ट्रांसप्लांट + बुखार = आपातकाल — तुरंत ट्रांसप्लांट सेंटर जाएं; इन्फेक्शन यहां बहुत तेज चलता है', textEn: 'Transplant + fever = emergency — go to the transplant centre now; infections move fast here' },
    { questionIndex: 55, text: 'बुखार नहीं है — पेशाब जांच कराएं; UTI भी क्रिएटिनिन को रिजेक्शन जैसा बढ़ा सकता है', textEn: 'No fever — get a urine test; a UTI can also raise creatinine like rejection' },
    // idx 56 — TRN05
    { questionIndex: 56, text: 'डायलिसिस से पहले: हेपेटाइटिस-B की श्रृंखला (0-1-6 महीने), फ्लू हर साल, न्यूमोकोकल — अब ही शुरू करें', textEn: 'Before dialysis: Hep-B series (0-1-6 months), yearly flu, pneumococcal — start now' },
    { questionIndex: 56, text: 'टीके लग चुके हैं — रिकॉर्ड फाइल में रखें; फ्लू का टीका हर साल दोहराएं', textEn: 'Vaccines done — keep the record in the file; repeat the flu vaccine every year' },
    // idx 57 — TRN05
    { questionIndex: 57, text: 'बाकी खुराकें — तारीखें लिखकर रखें; डायलिसिस शुरू होने से पहले पूरी करें (बाद में जवाब कमजोर होता है)', textEn: 'Doses pending — write the dates; complete them before dialysis starts (weaker response after)' },
    { questionIndex: 57, text: 'हेपेटाइटिस-B पूरा — एंटीबॉडी जांच (anti-HBs) कराएं; जवाब कमजोर आए तो बढ़ी हुई खुराक', textEn: 'Hep-B complete — check the anti-HBs titre; a reinforced dose if the response is weak' },
    // idx 58 — OTH01
    { questionIndex: 58, text: 'सुबह चेहरे की सूजन — किडनी जांच (क्रिएटिनिन + पेशाब प्रोटीन) आज ही कराएं', textEn: 'Morning facial swelling — get kidney tests (creatinine + urine protein) today' },
    { questionIndex: 58, text: 'थकान के बाद की सूजन — नींद की कमी या ज्यादा नमक-आलू भी कारण हो सकता है; 3 दिन देखें, फिर जांच', textEn: 'Swelling after fatigue — poor sleep or excess salt/potato may also cause it; watch 3 days, then test' },
    // idx 59 — OTH01
    { questionIndex: 59, text: 'झाग + सुबह की सूजन — नेफ्रोटिक सिंड्रोम की जांच — नेफ्रोलॉजिस्ट; प्रोटीन/लिपिड जांच', textEn: 'Foam + morning swelling — nephrotic syndrome workup — nephrologist; protein/lipid tests' },
    { questionIndex: 59, text: 'रंग गहरा — पानी कम पी रहे हैं; झाग है पर सूजन नहीं — सुबह के पेशाब में जांच दोहराएं', textEn: 'Dark colour — drinking too little; foam without swelling — retest on a morning sample' },
    // idx 60 — OTH02
    { questionIndex: 60, text: 'बिना जलन के खून (धुंए जैसा/कोका-कोला रंग) — ग्लोमेरुलर रक्त — जल्द नेफ्रो रेफर करें', textEn: 'Painless blood (smoky/cola colour) — glomerular bleed — early nephrology referral' },
    { questionIndex: 60, text: 'जलन के साथ खून — संक्रमण/पथरी की जांच — पेशाब रुटीन + USG कराएं', textEn: 'Blood with burning — infection/stone workup — get urine routine + USG' },
    // idx 61 — OTH02
    { questionIndex: 61, text: 'खून + आंखों की सूजन + BP — नेफ्रिटिक सिंड्रोम — रेफर करें; BP तुरंत नापें', textEn: 'Blood + eye swelling + BP — nephritic syndrome — refer; check BP now' },
    { questionIndex: 61, text: 'सूजन नहीं है — निगरानी रखें; 1 हफ्ते में पेशाब जांच दोहराएं', textEn: 'No swelling — keep monitoring; repeat the urine test in 1 week' },
    // idx 62 — OTH03
    { questionIndex: 62, text: 'पूरे पेशाब में झाग — प्रोटीन की आशंका; ACR जांच कराएं', textEn: 'Foam through the whole stream — protein likely; get the ACR test' },
    { questionIndex: 62, text: 'बस शुरुआत की तेज धार में झाग — सामान्य बहाव; चिंता की बात नहीं', textEn: 'Foam only with a forceful start — normal flow; nothing to worry about' },
    // idx 63 — OTH03
    { questionIndex: 63, text: 'झाग 5 मिनट से ज्यादा टिकता है — प्रोटीन का संकेत; सुबह के पेशाब में दोहराएं + ACR', textEn: 'Foam persisting over 5 minutes — sign of protein; repeat on a morning sample + ACR' },
    { questionIndex: 63, text: 'झाग जल्दी फूट जाता है — सामान्य; पानी पर्याप्त मात्रा में पिएं', textEn: 'Foam breaks quickly — normal; drink adequate water' },
    // idx 64 — OTH04
    { questionIndex: 64, text: 'प्रोटीन trace से 1+ — निगरानी काफी; 3 महीने में ACR दोहराएं', textEn: 'Protein trace to 1+ — monitoring is enough; repeat ACR in 3 months' },
    { questionIndex: 64, text: 'प्रोटीन 2+/3+ — नेफ्रो रेफर; 24-घंटा प्रोटीन/ACR की जांच कराएं', textEn: 'Protein 2+/3+ — nephrology referral; get 24-hour protein/ACR testing' },
    // idx 65 — OTH04
    { questionIndex: 65, text: 'प्रोटीन बढ़ा है — बायोप्सी की सोच नेफ्रोलॉजिस्ट से करें; BP 130/80 से नीचे रखें', textEn: 'Protein increased — discuss biopsy with the nephrologist; keep BP below 130/80' },
    { questionIndex: 65, text: 'प्रोटीन घटा है — ARB दवा काम कर रही है; जारी रखें', textEn: 'Protein reduced — the ARB is working; continue it' },
    // idx 66 — OTH05
    { questionIndex: 66, text: 'यूरिक एसिड 8 से ऊपर + किडनी — Zyloric जारी रखें; दौरे रोकने के लिए दवा लगातार चाहिए', textEn: 'Uric acid above 8 + kidney — continue Zyloric; continuous medicine prevents flares' },
    { questionIndex: 66, text: 'यूरिक 6-8 के बीच — डाइट + दवा समीक्षा; दवा अचानक बंद न करें', textEn: 'Uric acid 6-8 — diet + medicine review; do not stop the medicine abruptly' },
    // idx 67 — OTH05
    { questionIndex: 67, text: 'प्यूरीन वाले खाद्य घटाएं — लीवर/किडनी-मीट, सारडीन मछली, दाल की बड़ी मात्रा, बीयर; दही/दूध सुरक्षित', textEn: 'Cut purine foods — liver/kidney-meat, sardines, large dal servings, beer; curd/milk are safe' },
    { questionIndex: 67, text: 'दौरे में खुद से NSAID कभी न लें — किडनी बिगड़ती है; सिर्फ paracetamol + डॉक्टर; allopurinol दौरे में कभी शुरू न करें', textEn: 'Never self-NSAIDs in a flare — the kidney worsens; paracetamol + doctor only; never start allopurinol during a flare' },
    // idx 68 — OTH06
    { questionIndex: 68, text: 'महीने में 5 दिन से ज्यादा NSAID — दर्द की गोली से किडनी खराब होती है — आज से बंद; सिर्फ paracetamol', textEn: 'NSAIDs 5+ days a month — pain tablets damage kidneys — stop from today; paracetamol only' },
    { questionIndex: 68, text: 'कभी-कभी (1-2 दिन) लेते हैं — फिर भी जोखिम है; विकल्प: गर्म सेक/फिजियो + paracetamol की सीढ़ी', textEn: 'Occasional use (1-2 days) — still risky; alternatives: heat/physio + paracetamol ladder' },
    // idx 69 — OTH06
    { questionIndex: 69, text: 'दुकान से ली गोली — दर्द की गोली की खुद-से-खरीद भारत में महामारी है; डॉक्टर को बताएं, क्रिएटिनिन + K+ जांच कराएं', textEn: 'Chemist-bought tablets — self-purchased painkillers are an epidemic in India; tell the doctor, test creatinine + K+' },
    { questionIndex: 69, text: 'देसी/हर्बल चूरण में कभी-कभी भारी धातु (सीसा/पारा) मिल जाते हैं जो किडनी के लिए हानिकारक हैं — बिना जांच न लें, डॉक्टर को दिखाएं', textEn: 'Native/herbal powders can contain heavy metals (lead/mercury) harmful to kidneys — do not take unverified; show them to the doctor' },
    // idx 70 — OTH07
    { questionIndex: 70, text: 'गठिया की दवाओं की सूची लाएं — कुछ (NSAID/ज्यादा colchicine) किडनी पर भारी होती हैं; ORT-01 से समन्वय करें', textEn: 'Bring the arthritis medicine list — some (NSAIDs/high-dose colchicine) burden kidneys; coordinate ORT-01' },
    { questionIndex: 70, text: 'दवा पर्चे से चल रही है — अच्छा; पर्चा दिखाएं और सूची नेफ्रो को भी दें; साझा निर्णय सबसे सुरक्षित', textEn: 'Medicines on prescription — good; show the prescription and share the list with nephrology too; joint decisions are safest' },
    // idx 71 — OTH07
    { questionIndex: 71, text: 'दवा के बाद पेशाब/सूजन बदली — दवा कारण हो सकती है; खुद से न रोकें — दोनों डॉक्टरों को बताएं', textEn: 'Urine/swelling changed after the medicine — the medicine may be the cause; do not self-stop — inform both doctors' },
    { questionIndex: 71, text: 'कोई बदलाव नहीं — निगरानी जारी रखें; क्रिएटिनिन 3 महीने में दोहराएं', textEn: 'No change — continue monitoring; repeat creatinine in 3 months' },
    // idx 72 — OTH08
    { questionIndex: 72, text: 'सिंपल सिस्ट — बहुत आम और कैंसर नहीं; 6-12 महीने में USG दोहराते रहें', textEn: 'Simple cyst — very common and not cancer; keep repeating USG every 6-12 months' },
    { questionIndex: 72, text: 'सिस्ट बड़े/जटिल लग रहे हैं — बढ़ी जांच (CT) चाहिए; दर्द हो तो तुरंत बताएं', textEn: 'Large/complex-looking cysts — advanced imaging (CT) needed; report immediately if painful' },
    // idx 73 — OTH08
    { questionIndex: 73, text: 'दर्द + बुखार — सिस्ट में संक्रमण की जांच; तुरंत दिखाएं', textEn: 'Pain + fever — workup for infection in the cyst; show promptly' },
    { questionIndex: 73, text: 'कोई लक्षण नहीं — राहत की बात; सिस्ट के साथ भी BP/क्रिएटिनिन सामान्य रखें', textEn: 'No symptoms — reassuring; still keep BP/creatinine normal despite the cyst' },
    // idx 74 — OTH09
    { questionIndex: 74, text: 'माता/पिता में PKD — आपको USG से जांच करानी चाहिए; भाई-बहनों को भी बताएं', textEn: 'PKD in a parent — you should get tested by USG; inform the siblings too' },
    { questionIndex: 74, text: 'दूर के रिश्तेदार में — जोखिम कम; लक्षण और स्क्रीनिंग पर डॉक्टर से चर्चा करें', textEn: 'In a distant relative — lower risk; discuss symptoms and screening with the doctor' },
    // idx 75 — OTH09
    { questionIndex: 75, text: 'भाई-बहन की स्क्रीनिंग बाकी — उन्हें जांच के लिए प्रेरित करें; PKD वंशानुगत है', textEn: 'Sibling screening pending — encourage them to get tested; PKD is hereditary' },
    { questionIndex: 75, text: 'स्क्रीनिंग हो चुकी — रिपोर्ट साथ लाएं; BP नियमित नापते रहें', textEn: 'Screening done — bring the report; keep measuring BP regularly' },
    // idx 76 — OTH10
    { questionIndex: 76, text: 'जन्म से एक किडनी — वह बड़ी होकर पूरा काम करती है; BP 130/80 से नीचे + NSAIDs कभी नहीं = जीवन भर की रक्षा', textEn: 'Single kidney by birth — it enlarges and does the full job; BP under 130/80 + never NSAIDs = lifelong protection' },
    { questionIndex: 76, text: 'ऑपरेशन से निकली है — बची किडनी की सालाना जांच (क्रिएटिनिन + USG) जरूरी', textEn: 'Removed by surgery — yearly check of the remaining kidney (creatinine + USG) is essential' },
    // idx 77 — OTH10
    { questionIndex: 77, text: 'टकराने वाले खेल (फुटबॉल/कबड्डी/मार्शल आर्ट) — किडनी पर सीधी चोट से बचें; खेल-सलाह डॉक्टर से लें', textEn: 'Contact sports (football/kabaddi/martial arts) — avoid direct blows to the kidney; take sports advice from the doctor' },
    { questionIndex: 77, text: 'हल्का व्यायाम सुरक्षित है; पेट पर डोरी/बेल्ट की चोट से बचें', textEn: 'Light exercise is safe; avoid strap/belt injuries to the abdomen' },
    // idx 78 — OTH11
    { questionIndex: 78, text: 'K+ 5.1-5.9 (हल्का ऊंचा) — लाल-सूची खाद्य बंद करें: केला/संतरा/आलू/नारियल पानी/टमाटर; 1 हफ्ते में दोहराएं', textEn: 'K+ 5.1-5.9 (mild) — stop RED-list foods: banana/orange/potato/coconut water/tomato; retest in 1 week' },
    { questionIndex: 78, text: 'K+ 6.0 से ऊपर — आपातकाल: धड़कन या मांसपेशी कमजोरी हो तो ER तुरंत (ECG जरूरी)', textEn: 'K+ above 6.0 — emergency: palpitations or muscle weakness means ER now (ECG needed)' },
    // idx 79 — OTH11
    { questionIndex: 79, text: 'धड़कन/कमजोरी + K+ ऊंचा — आज ही ER; दिल पर असर हो सकता है', textEn: 'Palpitations/weakness + high K+ — ER today; the heart can be affected' },
    { questionIndex: 79, text: 'लक्षण नहीं हैं — फिर भी डाइट बदलें + जांच दोहराएं; दवा-समीक्षा (ARB/पानी की गोली) डॉक्टर से कराएं', textEn: 'No symptoms — still change the diet + retest; get the medicines (ARB/water pill) reviewed by the doctor' },
    // idx 80 — OTH12
    { questionIndex: 80, text: 'Na+ 130-134 — हल्का कम; तरल 1-1.5 लीटर/दिन पर सीमित करें; 1 हफ्ते में दोहराएं', textEn: 'Na+ 130-134 — mildly low; limit fluids to 1-1.5 L/day; retest in 1 week' },
    { questionIndex: 80, text: 'Na+ 130 से कम — डॉक्टर को दिखाएं; नींद या उलझन आए तो तुरंत अस्पताल', textEn: 'Na+ below 130 — see the doctor; drowsiness or confusion means hospital urgently' },
    // idx 81 — OTH12
    { questionIndex: 81, text: 'उलझन/नींद + Na+ कम — आज ही अस्पताल; खुद से नमक की गोली न लें', textEn: 'Confusion/drowsiness + low Na+ — hospital today; never self-start salt tablets' },
    { questionIndex: 81, text: 'हल्की कमजोरी — तरल घटाएं, डॉक्टर की सीमा में पर्याप्त रखें; पानी की गोली की समीक्षा कराएं', textEn: 'Mild weakness — reduce fluids, keep adequate within the advised limit; get the water pill reviewed' },
    // idx 82 — OTH13
    { questionIndex: 82, text: 'स्टेज-3 डाइट: प्रोटीन मध्यम (अंडा/दाल की मात्रा तय), नमक 1 चम्मच से कम; स्टेज-4/5 में प्रोटीन और कम + कीटो-एनालॉग दवा', textEn: 'Stage-3 diet: moderate protein (fixed egg/dal portion), salt under 1 teaspoon; stage-4/5 lower protein + keto-analogue medicine' },
    { questionIndex: 82, text: 'स्टेज का पता नहीं — eGFR वाली रिपोर्ट लाएं; उसी हिसाब से डाइट-चार्ट बनेगा', textEn: 'Stage unknown — bring the eGFR report; the diet chart will be made accordingly' },
    // idx 83 — OTH13
    { questionIndex: 83, text: 'पोटैशियम ज्यादा हो तो बंद: केला/संतरा/आलू/नारियल पानी/टमाटर; ठीक हैं: सेब/पपीता/पत्तागोभी', textEn: 'If potassium is high, stop: banana/orange/potato/coconut water/tomato; OK: apple/papaya/cabbage' },
    { questionIndex: 83, text: 'फल-सब्जियां उबालकर/भिगोकर इस्तेमाल करें — पोटैशियम घट जाता है; रोज एक ही मात्रा में रखें', textEn: 'Boiling/soaking fruits and vegetables cuts potassium; keep fixed daily portions' },
    // idx 84 — OTH14
    { questionIndex: 84, text: 'तरल-सीमा कड़ी रखें: रोज सुबह खाली पेट, एक ही तराजू से वजन; 1-2 kg बढ़े तो डॉक्टर को दिखाएं', textEn: 'Strict fluid limit: morning empty-stomach weight on the same scale daily; 1-2 kg gain means show the doctor' },
    { questionIndex: 84, text: 'प्यास घटाने के उपाय: छोटा ठंडा गिलास, नींबू-बर्फ चूसना, कैंडी; प्यास बहुत बढ़े तो डॉक्टर को बताएं', textEn: 'Thirst hacks: small cold glass, sucking lemon-ice, candy; report if thirst rises a lot' },
    // idx 85 — OTH14
    { questionIndex: 85, text: 'रोज एक ही तराजू — वजन-रिकॉर्ड कार्ड भरें; हर विजिट में डॉक्टर को दिखाएं', textEn: 'Same scale daily — fill the weight record card; show it to the doctor every visit' },
    { questionIndex: 85, text: 'तराजू बदल-बदलकर नापते हैं — 1 kg तक का अंतर चलता है; ज्यादा अंतर दिखे तो एक स्थिर तराजू तय करें', textEn: 'Weighing on varying scales — up to 1 kg difference is acceptable; if bigger, fix one stable scale' },
    // idx 86 — OTH15
    { questionIndex: 86, text: 'गर्भावस्था + किडनी रोग — OBG और नेफ्रो दोनों की साझा देखभाल जरूरी; दोनों की विजिट हर महीने', textEn: 'Pregnancy + kidney disease — joint OBG and nephrology care is essential; both visits monthly' },
    { questionIndex: 86, text: 'प्रसव की योजना अस्पताल में ही बने — घर पर नहीं; हर विजिट में BP और प्रोटीन जांच', textEn: 'Delivery plan must be made in a hospital — not at home; BP and protein checked every visit' },
    // idx 87 — OTH15
    { questionIndex: 87, text: 'पहले गर्भपात/उच्च BP — उच्च-जोखिम गर्भावस्था; OBG को पूरा इतिहास बताएं', textEn: 'Prior miscarriage/high BP — high-risk pregnancy; give the OBG the full history' },
    { questionIndex: 87, text: 'कोई इतिहास नहीं — फिर भी नेफ्रो फॉलो-अप जारी रखें; प्रोटीन/क्रिएटिनिन हर 4-6 हफ्ते', textEn: 'No history — still continue nephrology follow-up; protein/creatinine every 4-6 weeks' },
  ],

  // ══ Labels — vitals + renal parameters (12) ═══════════════════════════
  labels: [
    { label: 'वजन (ड्राई)', labelEn: 'Weight (dry)', unit: 'kg' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: '24-घंटे पेशाब', labelEn: 'Urine output 24h', unit: 'ml' },
    { label: 'क्रिएटिनिन (रिपोर्ट वाली)', labelEn: 'Creatinine (brought)', unit: 'mg/dl' },
    { label: 'पोटैशियम (रिपोर्ट वाला)', labelEn: 'Potassium (brought)', unit: 'mEq/L' },
    { label: 'हीमोग्लोबिन', labelEn: 'Hemoglobin', unit: 'g/dl' },
    { label: 'सूजन ग्रेड (0-4)', labelEn: 'Edema grade (0-4)', unit: 'grade', showUnit: false },
    { label: 'HD के बीच तरल-गेन', labelEn: 'Fluid-gain between HD', unit: 'kg' },
    { label: 'दर्द स्कोर', labelEn: 'Pain score', unit: '0-10' },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Blood Sugar (random)', unit: 'mg/dl' },
  ],

  // ══ Findings (30 — 20 managed + 10 REFER-ONLY with ZERO medicine links) ═
  findings: [
    // Managed (links below; refer-only findings have NO findingMeds entries)
    { key: 'CKD-STAGE-3', name: 'CKD स्टेज-3 (मध्यम)', nameEn: 'CKD Stage 3 (Moderate)', icd10: 'N18.3' },
    { key: 'CKD-STAGE-4', name: 'CKD स्टेज-4 (गंभीर)', nameEn: 'CKD Stage 4 (Severe)', icd10: 'N18.4' },
    { key: 'CKD-STAGE-5', name: 'CKD स्टेज-5 (अंतिम)', nameEn: 'CKD Stage 5 (End-stage)', icd10: 'N18.5' },
    { key: 'ESRD-HD-FU', name: 'डायलिसिस चालू (HD) — फॉलो-अप', nameEn: 'ESRD on Hemodialysis — Follow-up', icd10: 'N19' },
    { key: 'DIALYSIS-STATUS', name: 'डायलिसिस स्थिति (HD/PD)', nameEn: 'Dialysis Status (HD/PD)', icd10: 'Z99.2' },
    { key: 'TRANSPLANT-FU', name: 'किडनी ट्रांसप्लांट — फॉलो-अप', nameEn: 'Kidney Transplant — Follow-up', icd10: 'Z94.0' },
    { key: 'NEPHROTIC-SCREEN', name: 'नेफ्रोटिक जांच (बायोप्सी रेफर)', nameEn: 'Nephrotic Workup (Refer Biopsy)', icd10: 'N04.9' },
    { key: 'NEPHRITIC-SCREEN', name: 'नेफ्रिटिक जांच (रेफर)', nameEn: 'Nephritic Workup (Refer)', icd10: 'N00.9' },
    { key: 'PYELONEPHRITIS-FU', name: 'पायलोनेफ्राइटिस फॉलो-अप', nameEn: 'Pyelonephritis Follow-up', icd10: 'N11.9' },
    { key: 'GOUT-CKD', name: 'गाउट + किडनी (नियंत्रित-हल्का)', nameEn: 'Gout with CKD (Mild-managed)', icd10: 'M10.9' },
    { key: 'ANALGESIC-NEPHROPATHY', name: 'दर्द-गोली से किडनी प्रभावित (जांच)', nameEn: 'Analgesic Nephropathy (Screen-managed)', icd10: 'N14.0' },
    { key: 'PKD-SCREEN', name: 'PKD जांच (परिवार)', nameEn: 'PKD Screening (Family)', icd10: 'Q61.9' },
    { key: 'SINGLE-KIDNEY', name: 'एक किडनी (सावधानी)', nameEn: 'Single Kidney (Precautions)', icd10: 'Q60' },
    { key: 'UREMIC-PRURITUS', name: 'यूरेमिक खुजली', nameEn: 'Uremic Pruritus', icd10: 'N25' },
    { key: 'ANEMIA-CKD', name: 'CKD एनीमिया (ESA जारी)', nameEn: 'Anemia of CKD (ESA continuation)', icd10: 'D63.1' },
    { key: 'HYPERKALEMIA-MILD', name: 'पोटैशियम हल्का-ऊंचा', nameEn: 'Hyperkalemia (Mild)', icd10: 'E87.5' },
    { key: 'HYPONATREMIA-MILD', name: 'सोडियम हल्का-कम', nameEn: 'Hyponatremia (Mild)', icd10: 'E87.1' },
    { key: 'SIMPLE-CYST-FU', name: 'सिंपल किडनी सिस्ट — फॉलो-अप', nameEn: 'Simple Renal Cyst — Follow-up', icd10: 'N28.0' },
    { key: 'AKI-RECOVERY-FU', name: 'AKI के बाद रिकवरी फॉलो-अप', nameEn: 'Post-AKI Recovery Follow-up', icd10: 'N17.9' },
    { key: 'PREGNANCY-CKD', name: 'गर्भावस्था + CKD (OBG समन्वय)', nameEn: 'Pregnancy with CKD (Coordinate OBG)', icd10: 'O24' },
    // REFER-ONLY — ZERO findingMeds links by design (safety spine)
    { key: 'AKI-SEVERE', name: 'गंभीर AKI — भर्ती रेफर', nameEn: 'Severe AKI — Admit (Refer only)', icd10: 'N17.9' },
    { key: 'HYPERKALEMIA-SEVERE', name: 'पोटैशियम खतरनाक-ऊंचा — आपातकाल ECG', nameEn: 'Hyperkalemia Severe — Emergency ECG (Refer only)', icd10: 'E87.5' },
    { key: 'UREMIA-SEVERE', name: 'यूरेमिया गंभीर — आपातकाल डायलिसिस जांच', nameEn: 'Uremia Severe — Emergency Dialysis Eval (Refer only)', icd10: 'N19' },
    { key: 'TRANSPLANT-REJECTION-SUSPECT', name: 'ट्रांसप्लांट रिजेक्शन संदेह — तत्काल', nameEn: 'Transplant Rejection Suspect — Urgent (Refer only)', icd10: 'T86.1' },
    { key: 'NEPHROTIC-NEW', name: 'नया नेफ्रोटिक सिंड्रोम — बायोप्सी', nameEn: 'New Nephrotic Syndrome — Biopsy (Refer only)', icd10: 'N04.9' },
    { key: 'NEPHRITIC-FLARE', name: 'नेफ्रिटिक बढ़ोतरी — भर्ती', nameEn: 'Nephritic Flare — Admit (Refer only)', icd10: 'N00.9' },
    { key: 'PYELONEPHRITIS-OBSTRUCTED', name: 'रुकी पथरी + संक्रमण — आपातकाल', nameEn: 'Obstructed Pyelonephritis — Emergency (Refer only)', icd10: 'N13.6' },
    { key: 'AKI-POST-SNAKE', name: 'सांप-काटने वाला AKI — तत्काल', nameEn: 'Post-snake-bite AKI — Urgent (Refer only)', icd10: 'T63.0' },
    { key: 'ACIDOSIS-SUSPECT', name: 'एसिडोसिस संदेह — आपातकाल', nameEn: 'Acidosis Suspect — Emergency (Refer only)', icd10: 'E87.2' },
    { key: 'PREGNANCY-CKD-HIGH-RISK', name: 'गर्भावस्था-CKD उच्च-जोखिम (OBG संयुक्त)', nameEn: 'Pregnancy-CKD High Risk (OBG Joint, Refer only)', icd10: 'O24' },
  ],

  // ══ Medicines (42) — India renal core ═════════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense multiplier.
  // SAFETY: no NSAIDs anywhere (paracetamol is the only analgesic line);
  // EPO/sevelamer/keto-analogues carry continuation-verify framing.
  medicines: [
    // Renal nutraceuticals / keto-analogues
    { name: 'Nefrosave Tablet', salt: 'Renal nutraceutical — kidney-protective supplement (antioxidants + amino acids as per composition)', doseOptions: ['1 tab AM + 1 tab PM after food x 30 days', '1 tab BD x 90 days (continuation pack)'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nefrosave Forte Tablet', salt: 'Renal nutraceutical Forte — high-strength kidney-protective supplement (as per composition)', doseOptions: ['1 tab AM + 1 tab PM after food x 30 days'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ketostril Tablet', salt: 'Alpha-keto analogue of essential amino acids — protein-sparing renal prescription (with meals)', doseOptions: ['2 tabs with each main meal (protein-restricted diet)', '3 tabs with meals (specialist dose)'], morning: 2, afternoon: 2, evening: 2, tab: 90, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ketosteril Tablet', salt: 'Alpha-keto + essential amino acids (630 mg per tablet) — renal protein prescription', doseOptions: ['2 tabs with each main meal', '3 tabs with meals (specialist dose)'], morning: 2, afternoon: 2, evening: 2, tab: 90, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Phosphate binder + renal vitamin D
    { name: 'Renvela 400 Tablet', salt: 'Sevelamer Carbonate 400 mg — phosphate binder, SPECIALIST CONTINUATION; take WITH meals only', doseOptions: ['1-2 tabs with each meal (as nephrologist advised)', '2 tabs with meals x 30 days'], morning: 2, afternoon: 1, evening: 2, tab: 180, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Renvela 800 Tablet', salt: 'Sevelamer Carbonate 800 mg — phosphate binder, SPECIALIST CONTINUATION; swallow with meals, never empty stomach', doseOptions: ['1 tab with each main meal (TID)', '2 tabs with meals if phosphate stays high'], morning: 1, afternoon: 1, evening: 1, tab: 90, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Calcirol 60K Sachet', salt: 'Cholecalciferol 60,000 IU — renal vitamin D replacement', doseOptions: ['1 sachet weekly with milk x 8 weeks', '1 sachet monthly (maintenance after loading)'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules — renal vitamin D', doseOptions: ['1 sachet weekly with milk x 8 weeks'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // BP chain (ARB/CCB/beta-blocker)
    { name: 'Telma 40 Tablet', salt: 'Telmisartan 40 mg — BP control + kidney protection (ARB); check K+/creatinine 1-2 weeks after start or change; advanced-CKD caution', doseOptions: ['1 tab AM before food x 30 days', '1 tab AM — long-term continuation'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Telma 80 Tablet', salt: 'Telmisartan 80 mg — ARB escalation; K+/creatinine recheck after any change', doseOptions: ['1 tab AM before food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Telma AM Tablet', salt: 'Telmisartan 40 mg + Amlodipine 5 mg — dual BP control; ankle swelling = report to doctor', doseOptions: ['1 tab AM before food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Losar 50 Tablet', salt: 'Losartan Potassium 50 mg — ARB; potassium caution in CKD', doseOptions: ['1 tab AM before food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlong 5 Tablet', salt: 'Amlodipine 5 mg — BP control; ankle swelling possible', doseOptions: ['1 tab AM x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amlong 10 Tablet', salt: 'Amlodipine 10 mg — BP escalation', doseOptions: ['1 tab AM x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metolar XR 25 Tablet', salt: 'Metoprolol Succinate ER 25 mg — BP + heart-rate control; NEVER stop abruptly', doseOptions: ['1 tab AM after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metolar XR 50 Tablet', salt: 'Metoprolol Succinate ER 50 mg — BP escalation; never stop abruptly', doseOptions: ['1 tab AM after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Diuretics (electrolyte monitoring)
    { name: 'Dytor 10 Tablet', salt: 'Torsemide 10 mg — fluid overload/swelling; monitor Na+/K+/creatinine; take early AM', doseOptions: ['1 tab AM after food SOS (swelling)', '1 tab AM x 5-7 days (overload)'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dytor 20 Tablet', salt: 'Torsemide 20 mg — fluid overload; electrolyte monitoring needed', doseOptions: ['1 tab AM after food SOS', '1 tab AM x 5 days'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dytor 40 Tablet', salt: 'Torsemide 40 mg — marked fluid overload (specialist-verified use only)', doseOptions: ['1 tab AM after food (as nephrologist advised)'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lasix 40 Tablet', salt: 'Furosemide 40 mg — diuretic; take AM to avoid night urination; watch K+/Na+', doseOptions: ['1 tab AM after food SOS', '1 tab AM x 3 days'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Acidosis correction
    { name: 'Sodamint Tablet', salt: 'Sodium Bicarbonate — corrects kidney acidosis; dose fixed and verified by nephrologist', doseOptions: ['1 tab AM + 1 tab midday + 1 tab PM after food (nephrologist-dosed)'], morning: 1, afternoon: 1, evening: 1, tab: 90, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Gout (urate-lowering) — never in flare
    { name: 'Zyloric 100 Tablet', salt: 'Allopurinol 100 mg — urate lowering; NEVER start/increase during an acute gout flare; slow titration; any rash = STOP + doctor', doseOptions: ['1 tab OD after food x 30 days (start low)', '1 tab AM + 1 tab PM (step-up, flare-free only)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zyloric 300 Tablet', salt: 'Allopurinol 300 mg — maintenance urate control; never in flare; rash = stop and see doctor', doseOptions: ['1 tab OD after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Febutaz 40 Tablet', salt: 'Febuxostat 40 mg — urate lowering (usable in CKD); avoid in significant heart disease (CV caution); never in flare', doseOptions: ['1 tab OD after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Febutaz 80 Tablet', salt: 'Febuxostat 80 mg — urate maintenance; CV caution; never in flare', doseOptions: ['1 tab OD after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Renal anemia (oral iron + EPO continuation-verify)
    { name: 'Autrin Capsule', salt: 'Ferrous Fumarate + Folic Acid + B-Complex/Vitamin C — haematinic for renal anemia', doseOptions: ['1 cap AM after food x 8-12 weeks'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orofer XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg — gentle oral iron; keep away from tea/milk', doseOptions: ['1 tab AM + 1 tab PM after food x 8 weeks'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg — anemia/EPO support', doseOptions: ['1 tab AM after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Eposis 4000 Injection', salt: 'Erythropoietin alfa 4000 IU SC/IV — CONTINUATION ONLY: verify nephrologist order; Hb target 10-11.5 g/dl, do not exceed; BP watch', doseOptions: ['1 inj SC twice weekly (verify nephrology order)', '1 inj SC weekly (as ordered)'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Eprex 4000 Injection', salt: 'Erythropoietin alfa 4000 IU SC — continuation-verify only; Hb target 10-11.5 g/dl, do not exceed', doseOptions: ['1 inj SC twice weekly (verify nephrology order)'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Eprex 10000 Injection', salt: 'Erythropoietin alfa 10,000 IU SC weekly — continuation-verify only; Hb target 10-11.5 g/dl', doseOptions: ['1 inj SC weekly (verify nephrology order)'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Wepox 4000 Injection', salt: 'Erythropoietin 4000 IU SC — continuation-verify alternative brand; Hb target 10-11.5 g/dl', doseOptions: ['1 inj SC twice weekly (verify nephrology order)'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Vitamins / support
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C — nutritional support', doseOptions: ['1 cap AM after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 — weakness/nerve support', doseOptions: ['1 tab AM after food x 30 days'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Analgesic line — the ONLY safe pain option in CKD
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg — the ONLY safe painkiller in kidney disease; NEVER take NSAIDs (ibuprofen/diclofenac/aceclofenac/nimesulide/combiflam)', doseOptions: ['1 tab SOS (max 4 in 24 hrs)', '1 tab AM + 1 tab PM x 3 days (pain)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — only-safe CKD analgesic; keep within daily cap', doseOptions: ['1 tab SOS (max 3 in 24 hrs)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ORS / nausea / constipation / pruritus support
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS (Na/K/Cl/citrate/glucose) — in CKD take only doctor-limited quantity: contains potassium', doseOptions: ['1 sachet in 1 L water — sips within fluid limit', 'Half sachet in 500 ml during diarrhea (CKD-modified)'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg mouth-dissolving — uremic nausea/vomiting', doseOptions: ['1 tab SOS (max 2 in 24 hrs)'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml — constipation relief (also helps lower potassium in CKD)', doseOptions: ['15 ml at bedtime SOS', '15 ml at bedtime x 5 days'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Loratidine 10 Tablet', salt: 'Loratadine 10 mg — mild uremic-pruritus line, non-sedating', doseOptions: ['1 tab at bedtime SOS for itching'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg — pruritus/allergy line (night sedation possible)', doseOptions: ['1 tab at bedtime SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calosoft Lotion 100ml', salt: 'Calamine + Liquid Paraffin + Cetrimide — uremic-itch topical', doseOptions: ['Apply on itchy skin 2-3 times a day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (40) ════════════════════════════════════
  // Refer-only findings (AKI-SEVERE, HYPERKALEMIA-SEVERE, UREMIA-SEVERE,
  // TRANSPLANT-REJECTION-SUSPECT, NEPHROTIC-NEW, NEPHRITIC-FLARE,
  // PYELONEPHRITIS-OBSTRUCTED, AKI-POST-SNAKE, ACIDOSIS-SUSPECT,
  // PREGNANCY-CKD-HIGH-RISK) have ZERO links by design.
  // HYPERKALEMIA-MILD / HYPONATREMIA-MILD / SIMPLE-CYST-FU / AKI-RECOVERY-FU /
  // PREGNANCY-CKD are diet/monitoring findings — also zero links.
  findingMeds: [
    // CKD-STAGE-3 — nutraceutical + vitamin D + BP chain
    { findingKey: 'CKD-STAGE-3', medicineName: 'Nefrosave Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 30 days; report creatinine every 3 months' },
    { findingKey: 'CKD-STAGE-3', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet weekly', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'x 8 weeks with milk; check vitamin D level' },
    { findingKey: 'CKD-STAGE-3', medicineName: 'Telma 40 Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'BP target under 130/80; K+/creatinine check 1-2 weeks after any change' },
    { findingKey: 'CKD-STAGE-3', medicineName: 'Telma AM Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'If BP not at target on Telma 40 alone' },
    // CKD-STAGE-4 — + keto-analogue, phosphate binder, bicarbonate
    { findingKey: 'CKD-STAGE-4', medicineName: 'Nefrosave Forte Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 30 days' },
    { findingKey: 'CKD-STAGE-4', medicineName: 'Ketostril Tablet', dose: '2 tabs with each main meal', morning: 2, afternoon: 2, evening: 2, tab: 90, description: 'With protein-restricted diet as prescribed' },
    { findingKey: 'CKD-STAGE-4', medicineName: 'Renvela 800 Tablet', dose: '1 tab with each main meal', morning: 1, afternoon: 1, evening: 1, tab: 90, description: 'Phosphate binder — WITH meals only; specialist continuation' },
    { findingKey: 'CKD-STAGE-4', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet weekly', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'x 8 weeks' },
    { findingKey: 'CKD-STAGE-4', medicineName: 'Sodamint Tablet', dose: '1 tab TID after food', morning: 1, afternoon: 1, evening: 1, tab: 90, description: 'Bicarbonate as nephrologist dosed — HCO3 check' },
    // CKD-STAGE-5 — dialysis-prep continuation line
    { findingKey: 'CKD-STAGE-5', medicineName: 'Nefrosave Forte Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 30 days' },
    { findingKey: 'CKD-STAGE-5', medicineName: 'Renvela 800 Tablet', dose: '1 tab with each main meal', morning: 1, afternoon: 1, evening: 1, tab: 90, description: 'With meals; specialist continuation' },
    { findingKey: 'CKD-STAGE-5', medicineName: 'Eprex 4000 Injection', dose: '1 inj SC (as ordered)', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'EPO — CONTINUATION VERIFY only; Hb target 10-11.5 g/dl' },
    { findingKey: 'CKD-STAGE-5', medicineName: 'Dytor 20 Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 10, description: 'If fluid overload; monitor Na+/K+' },
    // ESRD-HD-FU — dialysis-day bundle
    { findingKey: 'ESRD-HD-FU', medicineName: 'Nefrosave Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 30 days' },
    { findingKey: 'ESRD-HD-FU', medicineName: 'Renvela 800 Tablet', dose: '1 tab with each main meal', morning: 1, afternoon: 1, evening: 1, tab: 90, description: 'With meals' },
    { findingKey: 'ESRD-HD-FU', medicineName: 'Eposis 4000 Injection', dose: '1 inj SC (as ordered)', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'Continuation-verify; Hb 10-11.5 target' },
    { findingKey: 'ESRD-HD-FU', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'Iron support with EPO' },
    // DIALYSIS-STATUS — HD/PD status line
    { findingKey: 'DIALYSIS-STATUS', medicineName: 'Nefrosave Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 30 days' },
    { findingKey: 'DIALYSIS-STATUS', medicineName: 'Renvela 800 Tablet', dose: '1 tab with each main meal', morning: 1, afternoon: 1, evening: 1, tab: 90, description: 'With meals' },
    { findingKey: 'DIALYSIS-STATUS', medicineName: 'Becosules Capsule', dose: '1 cap OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Nutritional support' },
    // TRANSPLANT-FU — post-transplant support (immunosuppressants stay specialist-side)
    { findingKey: 'TRANSPLANT-FU', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Post-transplant vitamin D as advised' },
    { findingKey: 'TRANSPLANT-FU', medicineName: 'Crocin 500 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Pain/fever SOS — paracetamol only; fever itself = same-day transplant centre call' },
    // NEPHROTIC-SCREEN — edema control + proteinuria reduction (refer for biopsy)
    { findingKey: 'NEPHROTIC-SCREEN', medicineName: 'Dytor 10 Tablet', dose: '1 tab AM after food', morning: 1, afternoon: 0, evening: 0, tab: 10, description: 'Edema control; watch Na+/K+' },
    { findingKey: 'NEPHROTIC-SCREEN', medicineName: 'Telma 40 Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Proteinuria reduction (ARB) — kidney-protective' },
    // NEPHRITIC-SCREEN — refer line
    { findingKey: 'NEPHRITIC-SCREEN', medicineName: 'Dytor 10 Tablet', dose: '1 tab AM after food', morning: 1, afternoon: 0, evening: 0, tab: 10, description: 'Edema control while workup is arranged; BP + rest' },
    // PYELONEPHRITIS-FU — post-treatment hydration + analgesia
    { findingKey: 'PYELONEPHRITIS-FU', medicineName: 'Electral Sachet (ORS)', dose: 'Sips within fluid limit', morning: 1, afternoon: 1, evening: 1, tab: 4, description: 'Hydration within the CKD fluid limit' },
    { findingKey: 'PYELONEPHRITIS-FU', medicineName: 'Crocin 500 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'SOS fever — paracetamol only' },
    // GOUT-CKD — urate continuation + only-safe analgesic
    { findingKey: 'GOUT-CKD', medicineName: 'Zyloric 100 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Continuation; NEVER start/increase in a flare' },
    { findingKey: 'GOUT-CKD', medicineName: 'Zyloric 300 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Step-up maintenance once stable' },
    { findingKey: 'GOUT-CKD', medicineName: 'Crocin 500 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Flare pain — paracetamol ONLY in CKD' },
    // ANALGESIC-NEPHROPATHY — STOP the agent, paracetamol-only bridge
    { findingKey: 'ANALGESIC-NEPHROPATHY', medicineName: 'Crocin 500 Tablet', dose: '1 tab SOS (max 4/day)', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'STOP the NSAID agent; paracetamol is the only pain option' },
    { findingKey: 'ANALGESIC-NEPHROPATHY', medicineName: 'Dolo 650 Tablet', dose: '1 tab SOS (max 3/day)', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'For stronger pain SOS' },
    // PKD-SCREEN — BP protection
    { findingKey: 'PKD-SCREEN', medicineName: 'Telma 40 Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'BP under 130/80 — ARB preferred in PKD' },
    // SINGLE-KIDNEY — BP protection
    { findingKey: 'SINGLE-KIDNEY', medicineName: 'Telma 40 Tablet', dose: '1 tab AM', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'BP control protects the single kidney' },
    // UREMIC-PRURITUS — mild line only
    { findingKey: 'UREMIC-PRURITUS', medicineName: 'Loratidine 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'Mild antihistamine line; moisturise + K+/phosphate review' },
    { findingKey: 'UREMIC-PRURITUS', medicineName: 'Calosoft Lotion 100ml', dose: 'Apply 2-3 times a day', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Topical soothing' },
    // ANEMIA-CKD — iron + EPO continuation-verify
    { findingKey: 'ANEMIA-CKD', medicineName: 'Autrin Capsule', dose: '1 cap OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'x 8-12 weeks; keep away from tea/milk' },
    { findingKey: 'ANEMIA-CKD', medicineName: 'Orofer XT Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'x 8 weeks' },
    { findingKey: 'ANEMIA-CKD', medicineName: 'Eposis 4000 Injection', dose: '1 inj SC (as ordered)', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'EPO — CONTINUATION VERIFY: nephrologist order only; Hb target 10-11.5 g/dl' },
    { findingKey: 'ANEMIA-CKD', medicineName: 'Eprex 4000 Injection', dose: '1 inj SC (as ordered)', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'EPO continuation-verify alternative brand' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Potassium Traffic-Light (Hindi foods)',
      rows: 10,
      cols: 3,
      headerLabel: ['लाल — पूरी तरह बंद', 'पीला — सीमित मात्रा', 'हरा — ठीक है'],
      colsLabel: ['RED — fully avoid', 'AMBER — small portions', 'GREEN — OK'],
      footerLabel: ['पोटैशियम ऊंचा हो तो लाल-सूची पूरी तरह बंद · सब्जियां उबालकर इस्तेमाल करें / If potassium is high, fully avoid RED items · boil vegetables before use'],
    },
    {
      name: 'CKD Stage Map',
      rows: 5,
      cols: 4,
      headerLabel: ['स्टेज', 'eGFR (ml/min)', 'किडनी कार्य', 'अगला कदम'],
      colsLabel: ['Stage', 'eGFR (ml/min)', 'Function', 'Next step'],
      footerLabel: ['स्टेज-4 पर KMC काउंसलिंग + फिस्टुला · स्टेज-5 पर डायलिसिस शुरू / KMC counselling + fistula at stage-4 · dialysis at stage-5'],
    },
    {
      name: 'Fluid Balance Card (7 days)',
      rows: 7,
      cols: 5,
      headerLabel: ['तारीख', 'सुबह वजन (kg)', 'तरल अंदर (ml)', 'पेशाब (ml)', 'अंतर'],
      colsLabel: ['Date', 'Morning weight (kg)', 'Fluid in (ml)', 'Urine out (ml)', 'Balance'],
      footerLabel: ['एक ही तराजू · खाली पेट · 2 kg से ज्यादा बढ़ना = तुरंत डॉक्टर / Same scale · empty stomach · gain over 2 kg = urgent doctor visit'],
    },
    {
      name: 'Home BP Log — CKD (14 days)',
      rows: 14,
      cols: 3,
      headerLabel: ['तारीख + समय', 'रक्तचाप', 'नाड़ी'],
      colsLabel: ['Date + time', 'BP', 'Pulse'],
      footerLabel: ['लक्ष्य: 130/80 से कम / Target: under 130/80'],
    },
    {
      name: 'Dialysis-Friendly Diet Grid (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['दिन', 'प्रोटीन (मात्रा)', 'फल/सब्जी', 'तरल (ml)'],
      colsLabel: ['Day', 'Protein (portion)', 'Fruit/Veg', 'Fluid (ml)'],
      footerLabel: ['HD वाले दिन थोड़ा ज्यादा प्रोटीन ठीक · बीच के दिन सीमित / Slightly more protein on HD days · restricted on other days'],
    },
    {
      name: 'Transplant Immunosuppressant Tracker',
      rows: 10,
      cols: 4,
      headerLabel: ['दवा का नाम', 'सुबह की खुराक', 'शाम की खुराक', 'ली या नहीं'],
      colsLabel: ['Medicine name', 'Morning dose', 'Evening dose', 'Taken?'],
      footerLabel: ['दवा कभी बंद न करें · बुखार आए तो उसी दिन डॉक्टर / NEVER stop medicines · fever means same-day doctor visit'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'CKD-3 — Routine Visit',
      diagnosis: 'CKD-STAGE-3',
      medicines: [
        { name: 'Nefrosave Tablet', dose: '1 tab BD after food', duration: '30 days', instructions: 'Continue across visits as advised' },
        { name: 'Calcirol 60K Sachet', dose: '1 sachet weekly', duration: '8 weeks', instructions: 'With milk; recheck vitamin D level' },
        { name: 'Telma 40 Tablet', dose: '1 tab AM before food', duration: '30 days', instructions: 'BP target under 130/80; K+/creatinine check 1-2 weeks after any change' },
      ],
      labs: ['Creatinine + eGFR', 'Serum K+/Na+', 'Urine ACR (protein)', 'Hemoglobin'],
      advice: 'नमक 1 चम्मच/दिन से कम · प्रोटीन की मात्रा तय (डाइटिशियन से) · दर्द में सिर्फ paracetamol — NSAID कभी नहीं · हर विजिट में रिपोर्ट फाइल लाएं',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'CKD-4 — KMC Counselling Visit',
      diagnosis: 'CKD-STAGE-4',
      medicines: [
        { name: 'Nefrosave Forte Tablet', dose: '1 tab BD after food', duration: '30 days', instructions: 'Continue' },
        { name: 'Ketostril Tablet', dose: '2 tabs with each main meal', duration: '30 days', instructions: 'With protein-restricted diet only' },
        { name: 'Renvela 800 Tablet', dose: '1 tab with each main meal', duration: '30 days', instructions: 'WITH meals only; specialist continuation' },
        { name: 'Calcirol 60K Sachet', dose: '1 sachet weekly', duration: '8 weeks', instructions: 'With milk' },
        { name: 'Sodamint Tablet', dose: '1 tab TID after food', duration: '30 days', instructions: 'Bicarbonate dose as nephrologist fixed; HCO3 check' },
      ],
      labs: ['Creatinine/eGFR', 'K+/Na+/HCO3', 'Ca/Phos/PTH', 'Hemoglobin', 'USG KUB + fistula-planning referral'],
      advice: 'KMC काउंसलिंग: HD/PD/ट्रांसप्लांट के विकल्प परिवार समेत समझें · फिस्टुला स्टेज-4 में ही बनवा लें · टीके (हेपेटाइटिस-B श्रृंखला 0-1-6) अब शुरू करें · तरल सीमा कड़ी · वजन रोज एक ही तराजू से',
      followUpDays: 15,
    },
    {
      name: 'Hemodialysis Day — Bundle',
      diagnosis: 'ESRD-HD-FU',
      medicines: [
        { name: 'Nefrosave Tablet', dose: '1 tab BD after food', duration: '30 days', instructions: 'Continue' },
        { name: 'Renvela 800 Tablet', dose: '1 tab with each main meal', duration: '30 days', instructions: 'With meals' },
        { name: 'Eposis 4000 Injection', dose: '1 inj SC as ordered', duration: 'Ongoing', instructions: 'CONTINUATION VERIFY only — nephrologist order; Hb target 10-11.5 g/dl' },
        { name: 'Orofer XT Tablet', dose: '1 tab BD after food', duration: '30 days', instructions: 'Iron support with EPO' },
        { name: 'Dolo 650 Tablet', dose: '1 tab SOS', duration: '10 days', instructions: 'Max 3 in 24 hrs — the only safe analgesic line' },
      ],
      labs: ['Pre-dialysis K+/creatinine', 'Hb (monthly)', 'Ca/Phos (monthly)'],
      advice: 'दो HD के बीच वजन-बढ़ोतरी 2 kg से कम रखें · फिस्टुला वाली बांह पर BP/सुई/तंग बाजू कभी नहीं · रोज फिस्टुला का थ्रिल महसूस करें · सेशन कभी न छोड़ें',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Renal Anemia — Visit',
      diagnosis: 'ANEMIA-CKD',
      medicines: [
        { name: 'Autrin Capsule', dose: '1 cap OD after food', duration: '90 days', instructions: 'Keep away from tea/milk by 1 hour' },
        { name: 'Orofer XT Tablet', dose: '1 tab BD after food', duration: '30 days', instructions: 'Constipation possible — continue' },
        { name: 'Eprex 4000 Injection', dose: '1 inj SC as ordered', duration: 'Ongoing', instructions: 'CONTINUATION VERIFY — nephrologist order only; Hb target 10-11.5 g/dl, never higher' },
        { name: 'Folvite 5 Tablet', dose: '1 tab OD after food', duration: '30 days', instructions: 'EPO support' },
      ],
      labs: ['Hemoglobin', 'Ferritin + TSAT', 'Reticulocyte count'],
      advice: 'Hb का लक्ष्य 10-11.5 g/dl — इससे ज्यादा नहीं · EPO कभी खुद से बंद/बदलें नहीं · आयरन खाने के बाद लें · चाय/दूध आयरन से दूर रखें',
      followUpDays: 21,
    },
    {
      name: 'Gout with CKD — Bridge',
      diagnosis: 'GOUT-CKD',
      medicines: [
        { name: 'Zyloric 100 Tablet', dose: '1 tab OD after food', duration: '30 days', instructions: 'NEVER start/increase during an acute flare; slow titration; rash = stop + doctor' },
        { name: 'Crocin 500 Tablet', dose: '1 tab SOS', duration: '15 days', instructions: 'Max 4 in 24 hrs; the ONLY analgesic safe in CKD' },
      ],
      labs: ['Serum uric acid', 'Creatinine + eGFR', 'Serum K+'],
      advice: 'प्यूरीन घटाएं: लीवर/किडनी-मीट, सारडीन मछली, दाल की बड़ी मात्रा, बीयर बंद · दही/दूध सुरक्षित · पानी डॉक्टर की सीमा में (स्टेज हिसाब से) · दौरे में दवा न बढ़ाएं',
      followUpDays: 14,
    },
    {
      name: 'Post-AKI Recovery — Check',
      diagnosis: 'AKI-RECOVERY-FU',
      medicines: [
        { name: 'Crocin 500 Tablet', dose: '1 tab SOS', duration: '10 days', instructions: 'Pain/fever SOS; NSAIDs absolutely not' },
        { name: 'Ondem 4 MD Tablet', dose: '1 tab SOS', duration: '10 days', instructions: 'Max 2 in 24 hrs for nausea' },
        { name: 'Becosules Capsule', dose: '1 cap OD after food', duration: '15 days', instructions: 'Nutritional support' },
      ],
      labs: ['Creatinine + eGFR (3-7 days)', 'Serum K+/Na+', 'USG KUB if not improving'],
      advice: 'दस्त/उल्टी में ORS तुरंत — AKI दोबारा से बचाव · NSAID बिल्कुल नहीं · 6-12 महीने तक क्रिएटिनिन की निगरानी · हर रिपोर्ट एक फाइल में लाएं',
      followUpDays: 7,
    },
  ],
}
