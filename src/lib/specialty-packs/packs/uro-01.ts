/**
 * URO-01 — UROLOGY STARTER PACK
 *
 * India OPD urology core — "stone belt" heavy: urinary symptoms, stone/colic,
 * prostate/obstruction, urinary infections, men's health, transplant/dialysis
 * continuation visits. Bilingual like all packs: Hindi primary (patient-facing),
 * English secondary (doctor search). Medicine names = Indian brands.
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY DESIGN (validator-verified):
 *   Refer-only red-flag findings carry ZERO findingMeds links by design —
 *   painless hematuria (malignancy workup), torsion (6-hour organ-loss),
 *   urinary retention (ER catheter), urosepsis, severe pyelonephritis,
 *   colic-with-fever, stricture suspect, prostate/bladder cancer suspects,
 *   urinary TB (NTEP), transplant rejection suspect, dialysis access.
 *   No herbals (Cystone etc.) per project policy. No hormonal/oncology
 *   continuation entries. Urinary TB → NTEP referral only (zero ATT).
 *
 * Sources: standard Indian urology OPD practice patterns, NLEM 2023 backbone,
 * stone-belt (north/west India) recurrence counselling conventions.
 */

import type { SpecialtyPack } from '../types'

export const URO01_PACK: SpecialtyPack = {
  meta: {
    code: 'URO-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Urology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'India stone-belt OPD patterns · standard Indian urology formulary · refer-only red flags carry zero medicines by design · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'URN', name: 'पेशाब-लक्षण', nameEn: 'Urinary Symptoms' },
    { key: 'STN', name: 'पथरी-दर्द', nameEn: 'Stone & Colic Pain' },
    { key: 'PRO', name: 'प्रोस्टेट-वृद्धि व रुकावट', nameEn: 'Prostate & Obstruction' },
    { key: 'INU', name: 'संक्रमण-मूत्र', nameEn: 'Urinary Infection' },
    { key: 'MAL', name: 'पुरुष-स्वास्थ्य', nameEn: "Men's Health" },
    { key: 'OTH', name: 'अन्य मूत्र विषय', nameEn: 'Other Urology' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // URN — Urinary Symptoms
    { code: 'URN01', categoryKey: 'URN', detail: 'पेशाब में जलन', detailEn: 'Burning Urination' },
    { code: 'URN02', categoryKey: 'URN', detail: 'दिन में बार-बार पेशाब', detailEn: 'Frequent Daytime Urination' },
    { code: 'URN03', categoryKey: 'URN', detail: 'रात में कई बार पेशाब (निश्चित्रिया)', detailEn: 'Night-time Frequent Urination (Nocturia)' },
    { code: 'URN04', categoryKey: 'URN', detail: 'पेशाब रोक न पाना (तेज़ बेचैनी)', detailEn: 'Urgency — Cannot Hold Urine' },
    { code: 'URN05', categoryKey: 'URN', detail: 'खांसते/हंसते पेशाब टपकना (महिला)', detailEn: 'Urine Leak on Cough/laugh (Women)' },
    { code: 'URN06', categoryKey: 'URN', detail: 'अतिसक्रिय मूत्राशय (OAB)', detailEn: 'Overactive Bladder (OAB)' },
    { code: 'URN07', categoryKey: 'URN', detail: 'बिना दर्द पेशाब में खून (चेतावनी)', detailEn: 'Painless Blood in Urine (Red Flag)' },
    { code: 'URN08', categoryKey: 'URN', detail: 'ब्लैडर ट्रेनिंग सलाह', detailEn: 'Bladder Training Consult' },
    // STN — Stone & Colic Pain
    { code: 'STN01', categoryKey: 'STN', detail: 'दर्द के साथ पेशाब में खून', detailEn: 'Blood in Urine with Pain' },
    { code: 'STN02', categoryKey: 'STN', detail: 'कमर-पेट का दर्द लिंग की ओर (कोलिक)', detailEn: 'Flank Pain Radiating to Groin (Renal Colic)' },
    { code: 'STN03', categoryKey: 'STN', detail: 'पथरी है — फॉलो-अप', detailEn: 'Known Stone — Follow-up' },
    { code: 'STN04', categoryKey: 'STN', detail: 'पथरी घर पर निकली — जांच', detailEn: 'Stone Passed at Home — Check' },
    { code: 'STN05', categoryKey: 'STN', detail: 'पथरी ऑपरेशन के बाद', detailEn: 'Post Stone-surgery Follow-up' },
    { code: 'STN06', categoryKey: 'STN', detail: 'बार-बार पथरी बनना', detailEn: 'Recurrent Stone Formation' },
    { code: 'STN07', categoryKey: 'STN', detail: 'रिपोर्ट में पथरी दिखी — समीक्षा', detailEn: 'Stone on Ultrasound Report — Review' },
    // PRO — Prostate & Obstruction
    { code: 'PRO01', categoryKey: 'PRO', detail: 'पेशाब शुरू होने में दिक्कत', detailEn: 'Difficulty Starting Urine Stream' },
    { code: 'PRO02', categoryKey: 'PRO', detail: 'पेशाब की धार कम/टपकना', detailEn: 'Weak Dribbling Stream' },
    { code: 'PRO03', categoryKey: 'PRO', detail: 'पेशाब के बाद पूरा खाली न होने का भाव', detailEn: 'Sensation of Incomplete Emptying' },
    { code: 'PRO04', categoryKey: 'PRO', detail: 'पेशाब के लिए जोर लगाना', detailEn: 'Straining to Pass Urine' },
    { code: 'PRO05', categoryKey: 'PRO', detail: 'पेशाब बिल्कुल न आना (इमरजेंसी)', detailEn: 'Urinary Retention — Cannot Pass at All (Emergency)' },
    { code: 'PRO06', categoryKey: 'PRO', detail: 'प्रोस्टेट ऑपरेशन के बाद', detailEn: 'Post Prostate Surgery Follow-up' },
    { code: 'PRO07', categoryKey: 'PRO', detail: 'रिपोर्ट में PSA बढ़ा — समीक्षा', detailEn: 'High PSA on Report — Review' },
    { code: 'PRO08', categoryKey: 'PRO', detail: 'प्रोस्टेट कैंसर इलाज पर — फॉलो-अप', detailEn: 'Prostate Cancer on Treatment — Follow-up' },
    { code: 'PRO09', categoryKey: 'PRO', detail: 'यूरोफ्लो टेस्ट हुआ — समीक्षा', detailEn: 'Uroflow Test Done — Review' },
    // INU — Urinary Infection
    { code: 'INU01', categoryKey: 'INU', detail: 'पेशाब में दर्द + बुखार', detailEn: 'Painful Urination with Fever' },
    { code: 'INU02', categoryKey: 'INU', detail: 'निचले पेट में दर्द + बार-बार पेशाब', detailEn: 'Lower Abdominal Pain with Urinary Frequency' },
    { code: 'INU03', categoryKey: 'INU', detail: 'पेशाब दुर्गंधयुक्त/गढ़', detailEn: 'Smelly / Cloudy Urine' },
    { code: 'INU04', categoryKey: 'INU', detail: 'पेशाब में मवाद', detailEn: 'Pus in Urine' },
    { code: 'INU05', categoryKey: 'INU', detail: 'बार-बार UTI (महिला)', detailEn: 'Recurrent UTI in Women' },
    { code: 'INU06', categoryKey: 'INU', detail: 'मेनोपॉज के बाद पेशाब में जलन', detailEn: 'Post-menopausal Urinary Burning' },
    // MAL — Men's Health
    { code: 'MAL01', categoryKey: 'MAL', detail: 'अचानक टेस्टिस में दर्द (इमरजेंसी)', detailEn: 'Sudden Testis Pain (Torsion — Emergency)' },
    { code: 'MAL02', categoryKey: 'MAL', detail: 'टेस्टिस में धीरे-धीरे सूजन', detailEn: 'Gradual Testis Swelling (Hydrocele Screen)' },
    { code: 'MAL03', categoryKey: 'MAL', detail: 'अंडकोष में भारीपन (वैरिकोसील)', detailEn: 'Scrotal Heaviness (Varicocele Screen)' },
    { code: 'MAL04', categoryKey: 'MAL', detail: 'लिंग से स्राव', detailEn: 'Penile Discharge (STD Screen)' },
    { code: 'MAL05', categoryKey: 'MAL', detail: 'एरेक्टाइल दिक्कत (नपुंसकता)', detailEn: 'Erectile Difficulty' },
    { code: 'MAL06', categoryKey: 'MAL', detail: 'शीघ्र स्खलन', detailEn: 'Early (Premature) Ejaculation' },
    { code: 'MAL07', categoryKey: 'MAL', detail: 'फोरस्किन कसी/दर्दभरी (फिमोसिस)', detailEn: 'Tight Painful Foreskin (Phimosis Screen)' },
    { code: 'MAL08', categoryKey: 'MAL', detail: 'गर्भधारण जांच — दंपति', detailEn: 'Fertility Check — Couple Workup' },
    // OTH — Other Urology
    { code: 'OTH01', categoryKey: 'OTH', detail: 'बड़े बच्चे का बिस्तर गीला (एन्यूरेसिस)', detailEn: 'Bedwetting in Older Child (Enuresis)' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'कैथेटर लगा मरीज — जांच', detailEn: 'Catheter Patient — Check' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'लंबे समय से बार-बार पेशाब — TB संदेह', detailEn: 'Chronic Urinary Frequency — TB Suspect' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'रात का पसीना + मूत्र लक्षण', detailEn: 'Night Sweats + Urinary Symptoms (TB Flag)' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'किडनी ट्रांसप्लांट — फॉलो-अप', detailEn: 'Kidney Transplant — Follow-up' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'डायलिसिस एक्सेस जांच', detailEn: 'Dialysis Access Check' },
  ],

  // ══ Questions (92) — `// idx N` = true 0-based array index (ZERO drift) ══
  questions: [
    // URN01 Burning urination
    { complaintCode: 'URN01', question: 'पेशाब में जलन कितने दिनों से है?', questionEn: 'Since how many days is the burning while passing urine?' }, // idx 0
    { complaintCode: 'URN01', question: 'क्या बुखार या कमर के दर्द के साथ जलन है?', questionEn: 'Is the burning accompanied by fever or flank pain?' }, // idx 1
    { complaintCode: 'URN01', question: 'क्या आप गर्भवती हैं या मधुमेह की दवा चल रही है?', questionEn: 'Are you pregnant or on diabetes medicines?' }, // idx 2
    // URN02 Daytime frequency
    { complaintCode: 'URN02', question: 'दिन में कितनी बार पेशाब आता है?', questionEn: 'How many times do you pass urine during the day?' }, // idx 3
    { complaintCode: 'URN02', question: 'रात में पेशाब के लिए कितनी बार उठना पड़ता है?', questionEn: 'How many times do you have to get up at night to pass urine?' }, // idx 4
    // URN03 Nocturia
    { complaintCode: 'URN03', question: 'रात में कितनी बार पेशाब के लिए उठते हैं?', questionEn: 'How many times do you wake up at night to urinate?' }, // idx 5
    { complaintCode: 'URN03', question: 'दिन में भी बार-बार पेशाब आता है? प्यास या थकान भी लगती है?', questionEn: 'Is daytime frequency also present? Any excess thirst or tiredness?' }, // idx 6
    // URN04 Urgency
    { complaintCode: 'URN04', question: 'तेज़ बेचैनी (पेशाब रोक पाना मुश्किल) कितने समय से है?', questionEn: 'Since when do you have strong urgency (difficulty holding urine)?' }, // idx 7
    { complaintCode: 'URN04', question: 'क्या शौचालय तक पहुंचने से पहले पेशाब रिस गया है?', questionEn: 'Have you leaked urine before reaching the toilet?' }, // idx 8
    // URN05 Stress leak (women)
    { complaintCode: 'URN05', question: 'खांसते, हंसते या वजन उठाते समय कितना रिसाव होता है?', questionEn: 'How much do you leak while coughing, laughing or lifting weight?' }, // idx 9
    { complaintCode: 'URN05', question: 'क्या आप पैड या एक्स्ट्रा कपड़ा इस्तेमाल करती हैं?', questionEn: 'Do you use a pad or extra cloth for the leaking?' }, // idx 10
    // URN06 OAB
    { complaintCode: 'URN06', question: 'दिन में कितनी बार और रात में कितनी बार पेशाब आता है?', questionEn: 'How many times do you void by day and by night?' }, // idx 11
    { complaintCode: 'URN06', question: 'दिन में चाय/कॉफी/कोला कितने कप लेते हैं?', questionEn: 'How many cups of tea/coffee/cola do you take in a day?' }, // idx 12
    // URN07 Painless hematuria (RED FLAG)
    { complaintCode: 'URN07', question: 'बिना दर्द के खून एक बार आया है या बार-बार आ रहा है?', questionEn: 'Has the painless blood come once or repeatedly?' }, // idx 13
    { complaintCode: 'URN07', question: 'क्या आप धूम्रपान या तंबाकू का सेवन करते हैं?', questionEn: 'Do you smoke or use tobacco?' }, // idx 14
    // URN08 Bladder training consult
    { complaintCode: 'URN08', question: 'यह समस्या कितने समय से चल रही है?', questionEn: 'Since how long has this problem been going on?' }, // idx 15
    { complaintCode: 'URN08', question: 'क्या पहले किसी डॉक्टर से ब्लैडर ट्रेनिंग की सलाह मिली है?', questionEn: 'Have you been advised bladder training earlier?' }, // idx 16
    // STN01 Blood with pain
    { complaintCode: 'STN01', question: 'खून के साथ दर्द कहां महसूस होता है?', questionEn: 'Where is the pain felt along with the blood?' }, // idx 17
    { complaintCode: 'STN01', question: 'क्या पेशाब में खून के थक्के दिखे हैं?', questionEn: 'Have you seen clots in the urine?' }, // idx 18
    // STN02 Renal colic
    { complaintCode: 'STN02', question: 'क्या दर्द पसली के नीचे से शुरू होकर लिंग/जांघ की ओर जाता है?', questionEn: 'Does the pain start below the ribs and travel toward the groin/thigh?' }, // idx 19
    { complaintCode: 'STN02', question: 'क्या दर्द के साथ उल्टी या मतली हुई है?', questionEn: 'Any vomiting or nausea with the pain?' }, // idx 20
    { complaintCode: 'STN02', question: 'दर्द कितना तेज़ है (0-10 में) और कितने दिनों से है?', questionEn: 'How severe is the pain (0-10) and since how many days?' }, // idx 21
    // STN03 Known stone FU
    { complaintCode: 'STN03', question: 'पथरी की पिछली जांच (USG) कब हुई थी?', questionEn: 'When was the last imaging (USG) for the stone done?' }, // idx 22
    { complaintCode: 'STN03', question: 'पहले अब तक कितनी बार पथरी हुई है?', questionEn: 'How many times have you had stones before?' }, // idx 23
    // STN04 Stone passed at home
    { complaintCode: 'STN04', question: 'पथरी कब निकली और क्या आपने उसे देखा था?', questionEn: 'When did the stone pass and did you actually see it?' }, // idx 24
    { complaintCode: 'STN04', question: 'पथरी निकलने के बाद दर्द, बुखार या जलन तो नहीं?', questionEn: 'Any pain, fever or burning after the stone passed?' }, // idx 25
    // STN05 Post stone-surgery
    { complaintCode: 'STN05', question: 'पथरी का ऑपरेशन कब और कौन सा हुआ?', questionEn: 'When and which stone surgery was done?' }, // idx 26
    { complaintCode: 'STN05', question: 'क्या शरीर में स्टेंट या ट्यूब लगी हुई है?', questionEn: 'Is a stent or tube still in the body?' }, // idx 27
    // STN06 Recurrent stones
    { complaintCode: 'STN06', question: 'अब तक कुल कितनी बार पथरी बन चुकी है?', questionEn: 'How many stone episodes have formed in total so far?' }, // idx 28
    { complaintCode: 'STN06', question: 'क्या निकली पथरी की जांच (स्टोन एनालिसिस) कराई थी?', questionEn: 'Was the passed stone analysed (stone analysis)?' }, // idx 29
    // STN07 Stone on USG report
    { complaintCode: 'STN07', question: 'रिपोर्ट में पथरी किस जगह है और कितने mm की है?', questionEn: 'Where is the stone on the report and how many mm?' }, // idx 30
    { complaintCode: 'STN07', question: 'क्या रिपोर्ट में किडनी में सूजन (हाइड्रोनेफ्रोसिस) लिखा है?', questionEn: 'Does the report mention kidney swelling (hydronephrosis)?' }, // idx 31
    // PRO01 Hesitancy
    { complaintCode: 'PRO01', question: 'पेशाब शुरू होने में कितना इंतजार करना पड़ता है?', questionEn: 'How long do you wait before the stream starts?' }, // idx 32
    { complaintCode: 'PRO01', question: 'यह दिक्कत कितने समय से बनी हुई है?', questionEn: 'Since when has this difficulty been present?' }, // idx 33
    // PRO02 Weak stream
    { complaintCode: 'PRO02', question: 'धार की ताकत अपने हिसाब से कितनी है (0-5)?', questionEn: 'How do you rate your stream force (0-5)?' }, // idx 34
    { complaintCode: 'PRO02', question: 'क्या पेशाब खत्म होने के बाद अंत में टपकता रहता है?', questionEn: 'Does urine dribble at the end after finishing?' }, // idx 35
    // PRO03 Incomplete emptying
    { complaintCode: 'PRO03', question: 'पेशाब के बाद भी पेट भरा हुआ लगता है (0-10 में कितना)?', questionEn: 'Does the bladder still feel full after voiding (rate 0-10)?' }, // idx 36
    { complaintCode: 'PRO03', question: 'क्या पेशाब के तुरंत बाद दोबारा पेशाब करना पड़ता है?', questionEn: 'Do you need to void again immediately after finishing?' }, // idx 37
    // PRO04 Straining
    { complaintCode: 'PRO04', question: 'जोर लगाकर पेशाब करना पड़ता है — रोज़ या कभी-कभी?', questionEn: 'Do you strain to void — daily or sometimes?' }, // idx 38
    { complaintCode: 'PRO04', question: 'आपकी उम्र क्या है — क्या आप 50 से ऊपर हैं?', questionEn: 'What is your age — are you above 50?' }, // idx 39
    // PRO05 Retention (EMERGENCY)
    { complaintCode: 'PRO05', question: 'आखिरी बार पेशाब कब आया था — कितने घंटे हुए?', questionEn: 'When did you last pass urine — how many hours ago?' }, // idx 40
    { complaintCode: 'PRO05', question: 'निचले पेट में दर्द या बेचैनी कितनी तेज़ है?', questionEn: 'How severe is the lower abdominal pain or restlessness?' }, // idx 41
    { complaintCode: 'PRO05', question: 'पहले कोई प्रोस्टेट की दवा चल रही थी क्या?', questionEn: 'Were you earlier on any prostate medicine?' }, // idx 42
    // PRO06 Post prostate surgery
    { complaintCode: 'PRO06', question: 'प्रोस्टेट का कौन सा ऑपरेशन (TURP/लेज़र) और कब हुआ?', questionEn: 'Which prostate surgery (TURP/laser) was done and when?' }, // idx 43
    { complaintCode: 'PRO06', question: 'ऑपरेशन के बाद लक्षण कितने प्रतिशत सुधरे?', questionEn: 'What percentage did symptoms improve after surgery?' }, // idx 44
    // PRO07 PSA high review
    { complaintCode: 'PRO07', question: 'PSA कितना आया है और रिपोर्ट कब की है?', questionEn: 'What is the PSA value and when was the test done?' }, // idx 45
    { complaintCode: 'PRO07', question: 'परिवार में किसी को प्रोस्टेट कैंसर हुआ है क्या (पिता/भाई)?', questionEn: 'Any family history of prostate cancer (father/brother)?' }, // idx 46
    { complaintCode: 'PRO07', question: 'क्या PSA के साथ पेशाब संबंधी लक्षण भी हैं?', questionEn: 'Are urinary symptoms also present along with the high PSA?' }, // idx 47
    // PRO08 Prostate CA on treatment
    { complaintCode: 'PRO08', question: 'प्रोस्टेट कैंसर का कौन सा इलाज चल रहा है?', questionEn: 'Which treatment for prostate cancer is ongoing?' }, // idx 48
    { complaintCode: 'PRO08', question: 'नियमित फॉलो-अप कहां हो रहा है?', questionEn: 'Where are the regular follow-ups happening?' }, // idx 49
    // PRO09 Uroflow review
    { complaintCode: 'PRO09', question: 'यूरोफ्लो रिपोर्ट में फ्लो रेट कितना आया?', questionEn: 'What flow rate did the uroflow report show?' }, // idx 50
    { complaintCode: 'PRO09', question: 'यूरोफ्लो टेस्ट किस लक्षण के लिए कराया था?', questionEn: 'For which symptom was the uroflow test done?' }, // idx 51
    // INU01 Dysuria + fever
    { complaintCode: 'INU01', question: 'बुखार के साथ कंपकंपी (ठंड लगना) भी होती है?', questionEn: 'Are there rigors (shaking chills) with the fever?' }, // idx 52
    { complaintCode: 'INU01', question: 'क्या कमर में (पसली के नीचे) दर्द भी है?', questionEn: 'Is there pain in the flank (below the ribs) too?' }, // idx 53
    // INU02 Lower abd pain + frequency
    { complaintCode: 'INU02', question: 'निचले पेट का दर्द कब से है?', questionEn: 'Since when is the lower abdominal pain present?' }, // idx 54
    { complaintCode: 'INU02', question: 'दर्द के साथ बुखार या पेशाब में खून भी आया?', questionEn: 'Any fever or blood in urine along with the pain?' }, // idx 55
    // INU03 Smelly urine
    { complaintCode: 'INU03', question: 'पेशाब का रंग और गंध कैसी है?', questionEn: 'How are the colour and smell of the urine?' }, // idx 56
    { complaintCode: 'INU03', question: 'क्या बदले हुए पेशाब के साथ बुखार भी है?', questionEn: 'Is there fever along with the changed urine?' }, // idx 57
    // INU04 Pus in urine
    { complaintCode: 'INU04', question: 'रिपोर्ट में मवाद (पस कोशिकाएं) कितना लिखा है?', questionEn: 'How much pus (pus cells) does the report mention?' }, // idx 58
    { complaintCode: 'INU04', question: 'क्या वजन या भूख घटी है, या बुखार आता है?', questionEn: 'Any weight or appetite loss, or fever?' }, // idx 59
    // INU05 Recurrent UTI women
    { complaintCode: 'INU05', question: 'पिछले एक साल में कितनी बार मूत्र संक्रमण (UTI) हुआ?', questionEn: 'How many UTI episodes in the last one year?' }, // idx 60
    { complaintCode: 'INU05', question: 'क्या आप डायाफ्राम या स्पर्मिसाइड जैसे गर्भनिरोधक इस्तेमाल करती हैं?', questionEn: 'Do you use contraceptives like diaphragm or spermicide?' }, // idx 61
    // INU06 Post-menopausal burning
    { complaintCode: 'INU06', question: 'मेनोपॉज (माहवारी बंद) कब हुआ?', questionEn: 'When did menopause occur?' }, // idx 62
    { complaintCode: 'INU06', question: 'क्या पेशाब की जांच में संक्रमण दिखा है?', questionEn: 'Did the urine test show infection?' }, // idx 63
    // MAL01 Torsion emergency
    { complaintCode: 'MAL01', question: 'टेस्टिस का दर्द कितने घंटे पहले अचानक शुरू हुआ?', questionEn: 'How many hours ago did the testis pain start suddenly?' }, // idx 64
    { complaintCode: 'MAL01', question: 'क्या उल्टी हुई है और दर्द के कारण चलना मुश्किल है?', questionEn: 'Any vomiting, and is walking difficult due to the pain?' }, // idx 65
    // MAL02 Hydrocele screen
    { complaintCode: 'MAL02', question: 'सूजन कितने समय से धीरे-धीरे बढ़ रही है?', questionEn: 'Since how long is the swelling gradually increasing?' }, // idx 66
    { complaintCode: 'MAL02', question: 'सूजन दर्द वाली है या बिना दर्द की?', questionEn: 'Is the swelling painful or painless?' }, // idx 67
    // MAL03 Varicocele screen
    { complaintCode: 'MAL03', question: 'भारीपन दिन भर रहती है या खड़े होने पर बढ़ती है?', questionEn: 'Is the heaviness constant or does it worsen on standing?' }, // idx 68
    { complaintCode: 'MAL03', question: 'क्या संतान पहले से हैं या गर्भधारण की कोशिश चल रही है?', questionEn: 'Do you already have children, or are you trying to conceive?' }, // idx 69
    // MAL04 Penile discharge
    { complaintCode: 'MAL04', question: 'स्राव का रंग कैसा है और कब से है?', questionEn: 'What is the colour of the discharge and since when?' }, // idx 70
    { complaintCode: 'MAL04', question: 'क्या यौन साथी को भी ऐसे लक्षण हैं?', questionEn: 'Does the sexual partner have similar symptoms too?' }, // idx 71
    // MAL05 Erectile difficulty
    { complaintCode: 'MAL05', question: 'एरेक्शन की दिक्कत कितने समय से है — हमेशा या कभी-कभी?', questionEn: 'Since when the erection difficulty — always or only sometimes?' }, // idx 72
    { complaintCode: 'MAL05', question: 'क्या हृदय, BP या शुगर की कोई दवा चल रही है (खासकर नाइट्रेट)?', questionEn: 'Any ongoing heart, BP or sugar medicine (especially nitrates)?' }, // idx 73
    // MAL06 Early ejaculation
    { complaintCode: 'MAL06', question: 'स्खलन (डिस्चार्ज) कितनी देर में हो जाता है?', questionEn: 'How quickly does ejaculation happen?' }, // idx 74
    { complaintCode: 'MAL06', question: 'क्या इससे तनाव या रिश्ते में दिक्कत हो रही है?', questionEn: 'Is this causing stress or relationship difficulty?' }, // idx 75
    // MAL07 Phimosis screen
    { complaintCode: 'MAL07', question: 'क्या फोरस्किन पीछे खिसक जाती है?', questionEn: 'Does the foreskin retract backwards?' }, // idx 76
    { complaintCode: 'MAL07', question: 'पेशाब करते समय फोरस्किन पर फुलाव (गुब्बारे जैसा) दिखता है?', questionEn: 'Does the foreskin balloon out while passing urine?' }, // idx 77
    // MAL08 Fertility couple workup
    { complaintCode: 'MAL08', question: 'संतान के लिए कितने साल से कोशिश कर रहे हैं?', questionEn: 'For how many years have you been trying for a child?' }, // idx 78
    { complaintCode: 'MAL08', question: 'क्या पति-पत्नी दोनों की जांच हुई है?', questionEn: 'Have both partners been tested?' }, // idx 79
    // OTH01 Enuresis
    { complaintCode: 'OTH01', question: 'बच्चे की उम्र क्या है?', questionEn: 'What is the age of the child?' }, // idx 80
    { complaintCode: 'OTH01', question: 'बिस्तर दिन में भी गीला होता है या रात में ही?', questionEn: 'Does wetting happen in the day too, or only at night?' }, // idx 81
    // OTH02 Catheter check
    { complaintCode: 'OTH02', question: 'कैथेटर कब से लगा हुआ है?', questionEn: 'Since when is the catheter in place?' }, // idx 82
    { complaintCode: 'OTH02', question: 'क्या पेशाब का रंग बदला है या कैथेटर के पास से रिसाव हो रहा है?', questionEn: 'Has the urine colour changed, or is there leakage around the catheter?' }, // idx 83
    // OTH03 Urinary TB suspect
    { complaintCode: 'OTH03', question: 'बार-बार पेशाब की समस्या कितने महीनों से है?', questionEn: 'Since how many months is the urinary frequency present?' }, // idx 84
    { complaintCode: 'OTH03', question: 'क्या वजन घटा है या रात में पसीना आता है?', questionEn: 'Any weight loss or night sweats?' }, // idx 85
    // OTH04 Night sweats + urinary
    { complaintCode: 'OTH04', question: 'रात में पसीना कब से आ रहा है?', questionEn: 'Since when are the night sweats occurring?' }, // idx 86
    { complaintCode: 'OTH04', question: 'क्या बुखार शाम को आता है?', questionEn: 'Does the fever occur in the evenings?' }, // idx 87
    // OTH05 Transplant FU
    { complaintCode: 'OTH05', question: 'किडनी ट्रांसप्लांट कब हुआ था?', questionEn: 'When was the kidney transplant done?' }, // idx 88
    { complaintCode: 'OTH05', question: 'क्या कोई दवा छूट गई है या खुद से बंद की है?', questionEn: 'Have any medicines been missed or stopped on your own?' }, // idx 89
    // OTH06 Dialysis access
    { complaintCode: 'OTH06', question: 'डायलिसिस एक्सेस (फिस्टुला/कैथेटर) कितने समय से चल रहा है?', questionEn: 'Since how long has the dialysis access (fistula/catheter) been in use?' }, // idx 90
    { complaintCode: 'OTH06', question: 'सुई/एक्सेस की जगह पर लाली, सूजन या दर्द है?', questionEn: 'Any redness, swelling or pain at the needle/access site?' }, // idx 91
  ],

  // ══ Suggestions (184 — exactly 2 per question; questionIndex matches) ══
  suggestions: [
    // q0 (URN01)
    { questionIndex: 0, text: '3 दिन से कम जलन — आम सिस्टाइटिस संभव — पेशाब की जांच कराएं', textEn: 'Burning under 3 days — likely cystitis — get a urine test' },
    { questionIndex: 0, text: '7 दिन से ज्यादा जलन — जांच जरूरी (यूरिन रूटीन + कल्चर)', textEn: 'Burning beyond 7 days — workup needed (urine routine + culture)' },
    // q1 (URN01)
    { questionIndex: 1, text: 'बुखार/कमर दर्द नहीं — सामान्य मूत्र संक्रमण, इलाज संभव', textEn: 'No fever or flank pain — simple UTI, treatable' },
    { questionIndex: 1, text: 'बुखार + कमर दर्द — गुर्दा संक्रमण (पाइलोनेफ्राइटिस) — उसी दिन डॉक्टर', textEn: 'Fever + flank pain — pyelonephritis — same-day doctor visit' },
    // q2 (URN01)
    { questionIndex: 2, text: 'गर्भवती महिला — सभी दवाएं डॉक्टर से पूछकर ही; OBG डॉक्टर से मिलकर इलाज', textEn: 'Pregnant woman — every medicine only after asking the doctor; treat in coordination with OBG' },
    { questionIndex: 2, text: 'शुगर नियंत्रण खराब = बार-बार संक्रमण — शुगर जांच और नियंत्रण जरूरी', textEn: 'Poor sugar control = repeat infections — check and control blood sugar' },
    // q3 (URN02)
    { questionIndex: 3, text: '8+ बार/दिन — बार-बार पेशाब — पानी/चाय की मात्रा देखें', textEn: '8+ times/day — urinary frequency — review water/tea intake' },
    { questionIndex: 3, text: '6 बार से कम — सामान्य सीमा में', textEn: 'Under 6 times — within normal range' },
    // q4 (URN02)
    { questionIndex: 4, text: 'रात में 0-1 बार — सामान्य', textEn: '0-1 times at night — normal' },
    { questionIndex: 4, text: 'रात में 2+ बार — निश्चित्रिया — प्रोस्टेट/ब्लैडर जांच कराएं', textEn: '2+ times at night — nocturia — get prostate/bladder evaluation' },
    // q5 (URN03)
    { questionIndex: 5, text: 'रात में 3+ बार और उम्र 50+ (पुरुष) — प्रोस्टेट जांच (IPSS स्कोर) जरूरी', textEn: '3+ times/night and male 50+ — prostate workup (IPSS score) needed' },
    { questionIndex: 5, text: 'रात के पानी पर नियंत्रण — सोने से 2 घंटे पहले पानी बंद', textEn: 'Control evening fluids — no water 2 hours before bed' },
    // q6 (URN03)
    { questionIndex: 6, text: 'दिन-रात दोनों बार-बार + प्यास — शुगर (मधुमेह) जांच कराएं', textEn: 'Day-and-night frequency with thirst — test for diabetes' },
    { questionIndex: 6, text: 'दिन में सामान्य — रात की बार-बारता का कारण अलग — जांच कराएं', textEn: 'Normal daytime — night-only frequency has another cause — investigate' },
    // q7 (URN04)
    { questionIndex: 7, text: 'हाल में शुरू — संक्रमण संभव — पेशाब जांच कराएं', textEn: 'Recent onset — infection possible — test the urine' },
    { questionIndex: 7, text: 'महीनों से — अतिसक्रिय मूत्राशय (OAB) — ब्लैडर ट्रेनिंग से मदद मिलती है', textEn: 'Months-long — overactive bladder — bladder training helps' },
    // q8 (URN04)
    { questionIndex: 8, text: 'पहुंचने से पहले रिसाव — बेचैनी-असंयमन: ब्लैडर ट्रेनिंग + पेल्विक फ्लोर (कीगल) कसरत', textEn: 'Leak before reaching toilet — urge incontinence: bladder training + pelvic floor (Kegel) exercises' },
    { questionIndex: 8, text: 'कोई रिसाव नहीं, सिर्फ बेचैनी — समय से पेशाब करने की आदत डालें', textEn: 'No leak, only urgency — build a timed-voiding habit' },
    // q9 (URN05)
    { questionIndex: 9, text: 'बूंद-बूंद रिसाव — कीगल कसरत शुरू करें: रोज़ 3 बार × 10 बार पेशाब रोकने वाली मांसपेशी कसें', textEn: 'Few-drop leak — start Kegels: 3 times daily × 10 squeezes of the urine-holding muscle' },
    { questionIndex: 9, text: 'भारी रिसाव — फिजियोथेरेपी/ऑपरेशन की सलाह के लिए यूरोलॉजिस्ट से मिलें', textEn: 'Heavy leak — meet a urologist for physiotherapy/surgical options' },
    // q10 (URN05)
    { questionIndex: 10, text: 'रोज़ 1+ पैड — असंयमन का इलाज संभव है — शर्माएं नहीं, डॉक्टर से मिलें', textEn: '1+ pad daily — incontinence is treatable — do not hesitate, see the doctor' },
    { questionIndex: 10, text: 'बिना पैड — हल्का रिसाव — कीगल कसरत जारी रखें, 6 हफ्ते में फर्क दिखता है', textEn: 'No pad, mild leak — continue Kegels, improvement shows in 6 weeks' },
    // q11 (URN06)
    { questionIndex: 11, text: 'दिन 8+ और रात 2+ बार — OAB संभव: ब्लैडर ट्रेनिंग + दवा दोनों से मदद मिलती है', textEn: 'Day 8+ and night 2+ — likely OAB: bladder training + medicines both help' },
    { questionIndex: 11, text: 'गिनती कम — तरल का वितरण सुधारें: सुबह ज्यादा, रात कम पानी', textEn: 'Lower counts — fix fluid distribution: more morning, less night water' },
    // q12 (URN06)
    { questionIndex: 12, text: 'चाय/कॉफी/कोला 3+ कप — कैफीन मूत्राशय को उकसाता है — धीरे-धीरे घटाएं', textEn: '3+ cups tea/coffee/cola — caffeine irritates the bladder — taper down' },
    { questionIndex: 12, text: 'बियर/शराब भी बेचैनी बढ़ाती है — OAB में कोला और बियर दोनों बचें', textEn: 'Beer/alcohol also worsens urgency — avoid both cola and beer in OAB' },
    // q13 (URN07 — RED FLAG)
    { questionIndex: 13, text: 'एक बार भी बिना दर्द खून — पूरी जांच जरूरी (USG + यूरिन टेस्ट) — अनदेखा न करें', textEn: 'Even one painless episode — full workup needed (USG + urine test) — never ignore' },
    { questionIndex: 13, text: 'बार-बार बिना दर्द खून — गंभीर संकेत: आज ही डॉक्टर को दिखाएं — कैंसर जांच जरूरी', textEn: 'Repeated painless blood — serious sign: see the doctor today — malignancy workup essential' },
    // q14 (URN07)
    { questionIndex: 14, text: 'धूम्रपान/तंबाकू — मूत्राशय कैंसर का सबसे बड़ा खतरा — छोड़ने में मदद लें', textEn: 'Smoking/tobacco — the biggest bladder cancer risk — take help to quit' },
    { questionIndex: 14, text: 'कोई तंबाकू नहीं — अच्छा; फिर भी बिना दर्द खून की जांच पूरी करें', textEn: 'No tobacco — good; still complete the workup for painless blood' },
    // q15 (URN08)
    { questionIndex: 15, text: 'लक्षण 3 महीने+ — 6-8 हफ्ते की ब्लैडर ट्रेनिंग योजना असर करती है', textEn: 'Symptoms 3+ months — a 6-8 week bladder training plan works' },
    { questionIndex: 15, text: 'बार-बार संक्रमण का इतिहास — पहले यूरिन जांच, फिर ट्रेनिंग शुरू', textEn: 'History of repeat infections — urine test first, then start training' },
    // q16 (URN08)
    { questionIndex: 16, text: 'पहले सलाह मिली — शेड्यूल पर लौटें: हर 2 घंटे से शुरू, धीरे-धीरे 3 घंटे', textEn: 'Advised earlier — return to schedule: start every 2 hours, gradually stretch to 3' },
    { questionIndex: 16, text: 'पहली बार — ट्रेनिंग चार्ट लें और 2 हफ्ते की पेशाब डायरी भरें', textEn: 'First time — take the training chart and fill a 2-week voiding diary' },
    // q17 (STN01)
    { questionIndex: 17, text: 'दर्द कमर/पसली के नीचे + खून — पथरी संभव — USG कराएं', textEn: 'Flank pain + blood — possible stone — get an USG' },
    { questionIndex: 17, text: 'पेशाब करते समय दर्द + खून — संक्रमण संभव — यूरिन टेस्ट कराएं', textEn: 'Pain while voiding + blood — possible infection — urine test' },
    // q18 (STN01)
    { questionIndex: 18, text: 'थक्के दिखे — ब्लैडर में खून जम सकता है — तुरंत जांच, यूरोलॉजिस्ट से मिलें', textEn: 'Clots seen — blood may be pooling in the bladder — urgent evaluation by urologist' },
    { questionIndex: 18, text: 'बिना थक्के — हल्का रंग बदलना — फिर भी जांच जरूरी', textEn: 'No clots — slight colour change — still needs testing' },
    // q19 (STN02)
    { questionIndex: 19, text: 'पसली से लिंग की ओर दर्द — क्लासिक गुर्दा-पथरी कोलिक — USG KUB जरूरी', textEn: 'Ribs-to-groin pain — classic renal colic — USG KUB needed' },
    { questionIndex: 19, text: 'दर्द नीचे की ओर नहीं जाता — अन्य कारण संभव — जांच कराएं', textEn: 'Pain does not radiate downward — other cause possible — investigate' },
    // q20 (STN02)
    { questionIndex: 20, text: 'दर्द के साथ उल्टी — गंभीर कोलिक — इमरजेंसी में दिखाएं (IV दरकार हो सकती है)', textEn: 'Pain with vomiting — severe colic — emergency visit (IV fluids may be needed)' },
    { questionIndex: 20, text: 'उल्टी नहीं — दर्द सहनीय — दवा + पानी; फिर भी USG कराएं', textEn: 'No vomiting — bearable pain — medicine + water; still get an USG' },
    // q21 (STN02)
    { questionIndex: 21, text: 'दर्द 8+/10 या बुखार के साथ — तुरंत अस्पताल — भर्ती जरूरी हो सकती है', textEn: 'Pain 8+/10 or with fever — hospital now — admission may be needed' },
    { questionIndex: 21, text: 'दर्द 5 दिन+ रहा — पथरी/रुकावट की जांच जरूरी', textEn: 'Pain lasting 5+ days — stone/obstruction workup needed' },
    // q22 (STN03)
    { questionIndex: 22, text: '6 महीने+ पुरानी जांच — नई USG कराएं — पथरी बढ़ी/खिसकी हो सकती है', textEn: 'Imaging 6+ months old — get a fresh USG — stone may have grown or moved' },
    { questionIndex: 22, text: 'हाल की जांच — रिपोर्ट साथ लाएं — आकार के अनुसार योजना बनेगी', textEn: 'Recent imaging — bring the report — plan follows the size' },
    // q23 (STN03)
    { questionIndex: 23, text: '2+ बार पथरी — दोबारा बनने की रोकथाम जरूरी: पानी 3-4 ली/दिन + आहार बदलाव', textEn: '2+ stone episodes — recurrence prevention needed: 3-4 L water/day + diet changes' },
    { questionIndex: 23, text: 'पहली बार — पूरी जांच + पथरी की जांच (स्टोन एनालिसिस) के बारे में सोचें', textEn: 'First episode — full workup + consider stone analysis' },
    // q24 (STN04)
    { questionIndex: 24, text: 'पथरी निकली — USG से पुष्टि कराएं कि पूरा निकला या कुछ बचा है', textEn: 'Stone passed — confirm by USG whether fully out or residual' },
    { questionIndex: 24, text: 'निकली पथरी साथ लाएं — उसकी जांच से दोबारा बनने से बचाव होता है', textEn: 'Bring the passed stone — its analysis helps prevent recurrence' },
    // q25 (STN04)
    { questionIndex: 25, text: 'निकलने के बाद बुखार/दर्द — बची पथरी या संक्रमण — तुरंत जांच', textEn: 'Fever/pain after passing — residual stone or infection — urgent check' },
    { questionIndex: 25, text: 'कोई लक्षण नहीं — अच्छा — 1 महीने में USG दोहराएं', textEn: 'No symptoms — good — repeat USG in 1 month' },
    // q26 (STN05)
    { questionIndex: 26, text: 'ऑपरेशन 2 हफ्ते के भीतर — आराम, हल्का काम, भारी वजन न उठाएं', textEn: 'Surgery within 2 weeks — rest, light duties, no heavy lifting' },
    { questionIndex: 26, text: 'ऑपरेशन पुराना — दोबारा बनने की निगरानी: 6-12 महीने में एक बार USG', textEn: 'Old surgery — recurrence surveillance: USG every 6-12 months' },
    // q27 (STN05)
    { questionIndex: 27, text: 'स्टेंट लगी है — तय तारीख पर हटवाना जरूरी — देरी से संक्रमण/नुकसान होता है', textEn: 'Stent in place — removal on the due date is essential — delay causes infection/damage' },
    { questionIndex: 27, text: 'कोई स्टेंट नहीं — अच्छा — पेशाब के रंग/बुखार पर नजर रखें', textEn: 'No stent — good — watch urine colour and fever' },
    // q28 (STN06)
    { questionIndex: 28, text: '3+ बार पथरी — पथरी-रोकथाम जांच (यूरिन कैल्शियम/यूरिक एसिड, स्टोन एनालिसिस) जरूरी', textEn: '3+ stone episodes — metabolic workup (urine calcium/uric acid, stone analysis) needed' },
    { questionIndex: 28, text: '1-2 बार — पानी 3-4 ली/दिन + नींबू-पानी (साइट्रेट) + नमक/मांस कम — जोखिम घटता है', textEn: '1-2 episodes — 3-4 L water/day + lemon water (citrate) + less salt/meat — risk falls' },
    // q29 (STN06)
    { questionIndex: 29, text: 'स्टोन एनालिसिस हुआ — रिपोर्ट लाएं — कैल्शियम/ऑक्सालेट/यूरिक के अनुसार आहार तय होगा', textEn: 'Stone analysis done — bring the report — diet follows calcium/oxalate/uric type' },
    { questionIndex: 29, text: 'एनालिसिस नहीं — फिर भी सामान्य बचाव: पालक/टमाटर/चाय कम, नमक-मांस कम, पानी 3-4 ली', textEn: 'No analysis — still general prevention: less spinach/tomato/tea, less salt-meat, 3-4 L water' },
    // q30 (STN07)
    { questionIndex: 30, text: 'पथरी 6 mm+ — यूरोलॉजिस्ट से उपचार योजना (ESWL/URS/ऑपरेशन) जरूरी', textEn: 'Stone 6 mm+ — treatment plan with urologist (ESWL/URS/surgery) needed' },
    { questionIndex: 30, text: '4 mm से कम — पानी + दवा से निकल सकती है — 2-4 हफ्ते में फिर जांच', textEn: 'Under 4 mm — may pass with water + medicine — recheck in 2-4 weeks' },
    // q31 (STN07)
    { questionIndex: 31, text: 'रिपोर्ट में सूजन (हाइड्रोनेफ्रोसिस) — मूत्रवाहिनी दबी है — जल्दी यूरोलॉजिस्ट से मिलें', textEn: 'Hydronephrosis on report — the tube is blocked — see a urologist soon' },
    { questionIndex: 31, text: 'सूजन नहीं — पथरी छोटी — पानी 3-4 ली/दिन + दवा, फॉलो-अप USG', textEn: 'No swelling — small stone — 3-4 L water/day + medicine, follow-up USG' },
    // q32 (PRO01)
    { questionIndex: 32, text: 'शुरू होने में इंतजार — रुकावट का लक्षण — प्रोस्टेट (IPSS)/सख्ती की जांच', textEn: 'Wait to start the stream — obstruction sign — prostate (IPSS)/stricture workup' },
    { questionIndex: 32, text: 'तुरंत शुरू — अच्छा — अन्य कारणों पर ध्यान दें', textEn: 'Starts immediately — good — focus on other causes' },
    // q33 (PRO01)
    { questionIndex: 33, text: 'महीनों से बढ़ती दिक्कत — विस्तृत जांच (यूरोफ्लो + USG पीवीआर)', textEn: 'Worsening for months — detailed workup (uroflow + USG PVR)' },
    { questionIndex: 33, text: 'कुछ दिनों से — संक्रमण/सूजन संभव — पेशाब जांच कराएं', textEn: 'Few days — infection/inflammation possible — urine test' },
    // q34 (PRO02)
    { questionIndex: 34, text: 'धार कमजोर (अपने हिसाब से 0-2/5) — प्रोस्टेट जांच जरूरी', textEn: 'Weak stream (self-rated 0-2/5) — prostate workup needed' },
    { questionIndex: 34, text: 'धार ठीक (4-5/5) — अच्छा — निगरानी जारी रखें', textEn: 'Stream fine (4-5/5) — good — continue monitoring' },
    // q35 (PRO02)
    { questionIndex: 35, text: 'अंत में टपकना — डबल वॉयडिंग आज़माएं: खत्म करने के बाद 20 सेकंड रुककर दोबारा पेशाब करें', textEn: 'Terminal dribbling — try double voiding: after finishing, wait 20 seconds and void again' },
    { questionIndex: 35, text: 'टपकना नहीं — अच्छा — धार की ताकत पर नजर रखें', textEn: 'No dribbling — good — keep monitoring stream force' },
    // q36 (PRO03)
    { questionIndex: 36, text: 'खाली नहीं लगता (अहसास 5+/10) — पूर्ण खाली होने की जांच (USG पीवीआर) कराएं', textEn: 'Still feels full (5+/10) — check complete emptying (USG PVR)' },
    { questionIndex: 36, text: 'खाली लगता है — अच्छा — डबल वॉयडिंग की आदत बनाए रखें', textEn: 'Feels empty — good — keep the double-voiding habit' },
    // q37 (PRO03)
    { questionIndex: 37, text: 'दोबारा पेशाब आता है — डबल वॉयडिंग करें: खत्म होने पर 20-30 सेकंड गिनें, फिर दोबारा करें', textEn: 'Void again soon — do double voiding: count 20-30 seconds after finishing, then void again' },
    { questionIndex: 37, text: 'दोबारा नहीं — अच्छा — नियमित समय पर पेशाब करें, पेशाब कभी रोकें नहीं', textEn: 'No second void — good — void at regular times, never hold urine' },
    // q38 (PRO04)
    { questionIndex: 38, text: 'रोज़ जोर लगाना — रुकावट बढ़ रही है — जांच (यूरोफ्लो) + प्रोस्टेट आकलन', textEn: 'Straining daily — obstruction progressing — uroflow + prostate assessment' },
    { questionIndex: 38, text: 'कभी-कभी — आदत छोड़ें: आराम से बैठें, जल्दी न लगाएं, जोर लगाने से बचें', textEn: 'Sometimes — break the habit: sit relaxed, no rushing, avoid straining' },
    // q39 (PRO04)
    { questionIndex: 39, text: 'उम्र 50+ पुरुष — सालाना प्रोस्टेट जांच (IPSS + परीक्षण) जरूरी', textEn: 'Male 50+ — annual prostate check (IPSS + examination) needed' },
    { questionIndex: 39, text: 'उम्र 50 से कम — सख्ती (स्ट्रिक्चर) या अन्य कारण जांचें', textEn: 'Under 50 — check stricture or other causes' },
    // q40 (PRO05 — EMERGENCY)
    { questionIndex: 40, text: '6+ घंटे से पेशाब नहीं — इमरजेंसी: तुरंत अस्पताल — कैथेटर से पेशाब निकालना जरूरी', textEn: 'No urine 6+ hours — EMERGENCY: hospital now — catheter drainage needed' },
    { questionIndex: 40, text: '4-6 घंटे — तेज़ बेचैनी है तो भी जल्दी जाएं — देर से ब्लैडर को नुकसान', textEn: '4-6 hours — go soon if severe restlessness — delay damages the bladder' },
    // q41 (PRO05)
    { questionIndex: 41, text: 'निचले पेट में दर्द + बेचैनी — मूत्र रुकावट का संकेत — इमरजेंसी में कैथेटर', textEn: 'Lower abdominal pain + restlessness — retention sign — emergency catheter' },
    { questionIndex: 41, text: 'हल्की बेचैनी — गुनगुने पानी की सिकाई + बैठकर शौचालय में पेशाब की कोशिश; न हो तो अस्पताल', textEn: 'Mild discomfort — warm compress + try voiding seated; if not, hospital' },
    // q42 (PRO05)
    { questionIndex: 42, text: 'पहले दवा चली थी — नाम/खुराक बताएं — दवा बदली/बढ़ाई जा सकती है', textEn: 'On prior medicines — share name/dose — medicine can be switched/escalated' },
    { questionIndex: 42, text: 'कोई दवा नहीं — पहली बार रुकावट — पूरी जांच के बाद इलाज शुरू', textEn: 'No medicines — first retention episode — workup before treatment' },
    // q43 (PRO06)
    { questionIndex: 43, text: 'TURP/लेज़र 6 हफ्ते के भीतर — हल्का रिसाव/जलन सामान्य, धीरे-धीरे ठीक होता है', textEn: 'TURP/laser within 6 weeks — mild leak/burning is normal, settles gradually' },
    { questionIndex: 43, text: 'ऑपरेशन 6 महीने+ पुराना — लक्षण लौटें तो जांच दोहराएं (IPSS + यूरोफ्लो)', textEn: 'Surgery 6+ months ago — if symptoms return, repeat IPSS + uroflow' },
    // q44 (PRO06)
    { questionIndex: 44, text: 'पूरे सुधरे — अच्छा — सालाना फॉलो-अप बनाए रखें', textEn: 'Fully improved — good — keep annual follow-up' },
    { questionIndex: 44, text: 'अधूरा सुधार/लक्षण वापस — जांच दोहराएं (यूरोफ्लो + USG पीवीआर)', textEn: 'Partial/returning symptoms — repeat workup (uroflow + USG PVR)' },
    // q45 (PRO07 — PSA counselling)
    { questionIndex: 45, text: 'PSA रिपोर्ट साथ लाएं — बढ़ा PSA अकेले कैंसर नहीं कहता — आगे के कदम डॉक्टर तय करेंगे', textEn: 'Bring the PSA report — a raised PSA alone does not mean cancer — doctor decides next steps' },
    { questionIndex: 45, text: 'PSA से पहले संक्रमण/साइकिल/संबंध रहा तो बताएं — नंबर बदल सकता है', textEn: 'Infection/cycling/intercourse before PSA can raise the number — mention it' },
    // q46 (PRO07)
    { questionIndex: 46, text: 'पिता/भाई को प्रोस्टेट कैंसर — सतर्की जरूरी — नियमित PSA फॉलो-अप कराएं', textEn: 'Father/brother with prostate cancer — caution — regular PSA follow-up' },
    { questionIndex: 46, text: 'पारिवारिक इतिहास नहीं — फिर भी बढ़े PSA की नियमित निगरानी जरूरी', textEn: 'No family history — still regular monitoring of the raised PSA' },
    // q47 (PRO07)
    { questionIndex: 47, text: 'PSA बढ़ा + मूत्र लक्षण — संभव: प्रोस्टेट वृद्धि/सूजन — इलाज के बाद PSA दोहराते हैं', textEn: 'Raised PSA + urinary symptoms — could be enlargement/inflammation — repeat PSA after treatment' },
    { questionIndex: 47, text: 'PSA बढ़ा, लक्षण नहीं — व्यवस्थित जांच योजना बनेगी — अगले कदम डॉक्टर बताएंगे', textEn: 'Raised PSA, no symptoms — a structured workup will be planned — doctor will explain next steps' },
    // q48 (PRO08)
    { questionIndex: 48, text: 'जारी इलाज की फाइल/दवाओं की लिस्ट लाएं — खुद कभी न बदलें, न छोड़ें', textEn: 'Bring the ongoing treatment file/medicine list — never alter or stop on your own' },
    { questionIndex: 48, text: 'जांच रिपोर्टें साथ लाएं — इलाज वही चलेगा — बदलाव केवल डॉक्टर से', textEn: 'Bring reports — treatment continues — changes only via the doctor' },
    // q49 (PRO08)
    { questionIndex: 49, text: 'फॉलो-अप यहीं — रिपोर्टें अपलोड/साथ लाएं — इलाज की निरंतरता बनी रहे', textEn: 'Follow-up here — bring/upload reports — treatment continuity is maintained' },
    { questionIndex: 49, text: 'फॉलो-अप बाहर — रिकॉर्ड की कॉपी रखें — आपातकाल में काम आती है', textEn: 'Follow-up outside — keep a copy of records — useful in emergencies' },
    // q50 (PRO09)
    { questionIndex: 50, text: 'फ्लो 10 ml/s से कम — रुकावट जैसा — प्रोस्टेट इलाज पर विचार करें', textEn: 'Flow under 10 ml/s — obstruction-like — consider prostate treatment' },
    { questionIndex: 50, text: 'फ्लो 15 ml/s+ — सामान्य — लक्षणों के अनुसार आगे बढ़ें', textEn: 'Flow 15 ml/s+ — normal — proceed as per symptoms' },
    // q51 (PRO09)
    { questionIndex: 51, text: 'लक्षणों के लिए किया — रिपोर्ट + IPSS स्कोर साथ लाएं — पूरी तस्वीर बनेगी', textEn: 'Done for symptoms — bring report + IPSS score — completes the picture' },
    { questionIndex: 51, text: 'निगरानी के लिए किया — अगली तय तारीख पर दोहराएं', textEn: 'Done for surveillance — repeat at the next scheduled date' },
    // q52 (INU01)
    { questionIndex: 52, text: 'कंपकंपी + बुखार + जलन — गुर्दा संक्रमण — उसी दिन डॉक्टर/अस्पताल', textEn: 'Rigors + fever + burning — kidney infection — same-day doctor/hospital' },
    { questionIndex: 52, text: 'हल्का बुखार — 24 घंटे में जांच कराएं — बढ़े तो तुरंत', textEn: 'Mild fever — test within 24 hours — immediately if it rises' },
    // q53 (INU01)
    { questionIndex: 53, text: 'कमर दर्द + बुखार + जलन — पाइलोनेफ्राइटिस संभव — तुरंत जांच, भर्ती हो सकती है', textEn: 'Flank pain + fever + burning — possible pyelonephritis — urgent check, admission possible' },
    { questionIndex: 53, text: 'कमर दर्द नहीं — सामान्य सिस्टाइटिस संभव — यूरिन टेस्ट + इलाज', textEn: 'No flank pain — likely simple cystitis — urine test + treatment' },
    // q54 (INU02)
    { questionIndex: 54, text: '3 दिन+ दर्द — सिस्टाइटिस संभव — यूरिन जांच कराएं', textEn: 'Pain 3+ days — possible cystitis — urine test' },
    { questionIndex: 54, text: 'आज शुरू — पानी भरपूर + पेशाब रोकें नहीं — बुखार आए तो तुरंत', textEn: 'Started today — plenty of water + never hold urine — fever = urgent visit' },
    // q55 (INU02)
    { questionIndex: 55, text: 'दर्द + बुखार — संक्रमण फैल रहा है — तुरंत जांच (यूरिन + USG)', textEn: 'Pain + fever — infection spreading — urgent tests (urine + USG)' },
    { questionIndex: 55, text: 'दर्द + खून — पथरी संभव — USG KUB कराएं', textEn: 'Pain + blood — possible stone — USG KUB' },
    // q56 (INU03)
    { questionIndex: 56, text: 'गहरा/बदबूदार पेशाब — संक्रमण या पानी की कमी — यूरिन टेस्ट + पानी बढ़ाएं', textEn: 'Dark/smelly urine — infection or low water — urine test + more water' },
    { questionIndex: 56, text: 'सामान्य रंग/गंध — केवल बार-बार आना — तरल संतुलन देखें', textEn: 'Normal colour/smell — only frequency — review fluid balance' },
    // q57 (INU03)
    { questionIndex: 57, text: 'बदबूदार पेशाब + बुखार — संक्रमण — यूरिन जांच जरूरी', textEn: 'Smelly urine + fever — infection — urine test essential' },
    { questionIndex: 57, text: 'बुखार नहीं — अच्छा — रोज़ 2.5-3 ली पानी; जांच फिर भी कराएं', textEn: 'No fever — good — 2.5-3 L water daily; still get tested' },
    // q58 (INU04)
    { questionIndex: 58, text: 'रिपोर्ट में मवाद 10+ (WBC/hpf) — संक्रमण — एंटीबायोटिक शुरू करने से पहले कल्चर का नमूना दें', textEn: 'Pus 10+ (WBC/hpf) on report — infection — give culture sample before starting antibiotics' },
    { questionIndex: 58, text: 'मवाद बहुत ज्यादा — गहरी जांच जरूरी — यूरिन कल्चर + डॉक्टर से मिलें', textEn: 'Heavy pus — deep workup needed — urine culture + meet the doctor' },
    // q59 (INU04)
    { questionIndex: 59, text: 'वजन/भूख घटी + मवाद — पुराना संक्रमण संभव — TB जांच की जरूरत हो सकती है', textEn: 'Weight/appetite loss + pus — chronic infection possible — TB workup may be needed' },
    { questionIndex: 59, text: 'वजन स्थिर — सामान्य संक्रमण संभव — कल्चर आधारित इलाज', textEn: 'Weight stable — ordinary infection likely — culture-based treatment' },
    // q60 (INU05)
    { questionIndex: 60, text: 'साल में 3+ UTI — रोकथाम योजना जरूरी: कल्चर + रोज़ाना आदतें + डॉक्टर से रोकथाम दवा', textEn: '3+ UTIs/year — prevention plan needed: culture + daily habits + prophylactic medicine via doctor' },
    { questionIndex: 60, text: '1-2 बार — रोज़ 2.5 ली+ पानी, पेशाब रोकें नहीं, सामने से पीछे साफ करें', textEn: '1-2 times — 2.5 L+ water daily, never hold urine, wipe front to back' },
    // q61 (INU05)
    { questionIndex: 61, text: 'डायाफ्राम/स्पर्मिसाइड — UTI का जोखिम बढ़ाते हैं — विकल्प पर विचार करें', textEn: 'Diaphragm/spermicide — raises UTI risk — consider alternatives' },
    { questionIndex: 61, text: 'इस्तेमाल नहीं करतीं — अच्छा — संबंध के बाद पेशाब करना आदत बनाएं', textEn: 'Not using — good — make post-coital voiding a habit' },
    // q62 (INU06)
    { questionIndex: 62, text: 'मेनोपॉज 1+ साल पहले — एस्ट्रोजन की कमी से मूत्र-मार्ग पतला — इलाज के विकल्प डॉक्टर से पूछें', textEn: 'Menopause 1+ year ago — estrogen deficiency thins the urinary tract — ask the doctor about options' },
    { questionIndex: 62, text: 'हाल में मेनोपॉज — जलन आम — यूरिन टेस्ट कराकर संक्रमण निकालें', textEn: 'Recent menopause — burning is common — urine test to rule out infection' },
    // q63 (INU06)
    { questionIndex: 63, text: 'टेस्ट में संक्रमण — इलाज जरूरी — दवा का कोर्स पूरा खत्म करें', textEn: 'Test shows infection — treatment needed — complete the full course' },
    { questionIndex: 63, text: 'टेस्ट साफ — एट्रोफी-जलन संभव — डॉक्टर से सामयिक (टॉपिकल) विकल्पों की सलाह लें', textEn: 'Test clear — atrophy-related burning possible — ask the doctor about topical options' },
    // q64 (MAL01 — TORSION 6-HOUR RULE)
    { questionIndex: 64, text: '6 घंटे के भीतर — टेस्टिस बचाने की इमरजेंसी — तुरंत अस्पताल (ऑपरेशन) — देरी से अंग नष्ट', textEn: 'Within 6 hours — testicle-saving emergency — hospital NOW (surgery) — delay destroys the organ' },
    { questionIndex: 64, text: '6 घंटे+ बीत चुके — अभी भी तुरंत जाएं — अंग बचाने की कोशिश अभी भी संभव है', textEn: '6+ hours passed — still go now — saving the organ may still be possible' },
    // q65 (MAL01)
    { questionIndex: 65, text: 'उल्टी + चलना मुश्किल — गंभीर स्थिति — सीधे इमरजेंसी में ले जाएं', textEn: 'Vomiting + cannot walk — serious — take directly to the emergency' },
    { questionIndex: 65, text: 'हल्का दर्द, चल सकते हैं — फिर भी आज ही यूरोलॉजिस्ट/इमरजेंसी — देर न करें', textEn: 'Mild pain, walking OK — still urologist/emergency today — no delay' },
    // q66 (MAL02)
    { questionIndex: 66, text: 'महीनों-सालों से धीरे बढ़ती सूजन — हाइड्रोसील संभव — परीक्षण + सर्जिकल सलाह', textEn: 'Slowly growing swelling over months-years — likely hydrocele — exam + surgical opinion' },
    { questionIndex: 66, text: 'हफ्तों में तेज़ बढ़ी — जल्दी जांच — अन्य कारण निकालने जरूरी', textEn: 'Rapid growth over weeks — early evaluation — other causes must be ruled out' },
    // q67 (MAL02)
    { questionIndex: 67, text: 'बिना दर्द की सूजन — हाइड्रोसील जैसा — सर्जिकल सलाह लें', textEn: 'Painless swelling — hydrocele-like — take a surgical opinion' },
    { questionIndex: 67, text: 'दर्द के साथ — संक्रमण/मरोड़ निकालें — तुरंत परीक्षण कराएं', textEn: 'With pain — rule out infection/torsion — immediate examination' },
    // q68 (MAL03)
    { questionIndex: 68, text: 'खड़े होने/दिन में बढ़ती भारीपन — वैरिकोसील जैसा — परीक्षण + डॉप्लर अल्ट्रासाउंड', textEn: 'Heaviness worse on standing/by day — varicocele-like — exam + Doppler ultrasound' },
    { questionIndex: 68, text: 'निरंतर भारीपन — गुनगुने पानी में बैठना (सिट्ज़ बाथ) 10-15 मिनट + सहायक सपोर्टर अंडरवियर', textEn: 'Constant heaviness — warm sitz bath 10-15 minutes + supportive scrotal underwear' },
    // q69 (MAL03)
    { questionIndex: 69, text: 'संतान की कोशिश में वैरिकोसील — शुक्राणु जांच (सेमेन एनालिसिस) कराएं', textEn: 'Varicocele while trying to conceive — get a semen analysis' },
    { questionIndex: 69, text: 'संतान पूर्ण — केवल भारीपन दिक्कत — सपोर्टर पहनें, लंबे समय खड़े रहने से बचें', textEn: 'Family complete — only bothersome heaviness — wear a supporter, avoid prolonged standing' },
    // q70 (MAL04)
    { questionIndex: 70, text: 'पीला/हरा या सफेद स्राव — यौन संक्रमण संभव — जांच (टेस्ट) से पहले कोई दवा नहीं', textEn: 'Yellow/green or white discharge — possible STI — no medicine before testing' },
    { questionIndex: 70, text: 'स्राव 2 हफ्ते+ — पूरी जांच जरूरी — सुरक्षित आदतें अपनाएं, साथी का इलाज भी जरूरी', textEn: 'Discharge 2+ weeks — full workup needed — adopt safe practices, partner treatment essential too' },
    // q71 (MAL04)
    { questionIndex: 71, text: 'साथी को भी लक्षण — दोनों का एक साथ इलाज — वरना बार-बार फैलेगा', textEn: 'Partner also symptomatic — treat both together — otherwise it keeps passing back' },
    { questionIndex: 71, text: 'साथी में लक्षण नहीं — फिर भी जांच के बाद साथी की जांच पर सोचें — संक्रमण छिपा रहता है', textEn: 'Partner asymptomatic — still consider partner screening after testing — infection often stays hidden' },
    // q72 (MAL05)
    { questionIndex: 72, text: 'कभी-कभी दिक्कत — तनाव/थकान का आम असर — जीवनशैली सुधार से अक्सर ठीक होता है', textEn: 'Occasional difficulty — common effect of stress/fatigue — lifestyle fixes often resolve it' },
    { questionIndex: 72, text: '6 महीने+ हमेशा दिक्कत — यह इलाज-योग्य बीमारी है — शर्म की बात नहीं, डॉक्टर से मिलें', textEn: 'Constant difficulty for 6+ months — a treatable condition — no shame, see the doctor' },
    // q73 (MAL05 — NITRATE FATAL + CARDIAC LINK)
    { questionIndex: 73, text: 'नाइट्रेट वाली हृदय दवा — सिल्डेनाफिल के साथ जानलेवा — बिल्कुल न लें — पूरी दवा लिस्ट डॉक्टर को दिखाएं', textEn: 'Nitrate heart medicine — FATAL with sildenafil — never combine — show the full medicine list to the doctor' },
    { questionIndex: 73, text: 'हृदय दवा नहीं — भी पहले दिल की जांच — ED अक्सर हृदय रोग का पहला चेतावनी संकेत होता है', textEn: 'No heart medicine — still cardiac check first — ED is often the first warning sign of heart disease' },
    // q74 (MAL06)
    { questionIndex: 74, text: '1 मिनट से कम — शीघ्र स्खलन — इलाज-योग्य है — पॉज़/स्क्वीज़ (रोकें-दबाएं) तकनीक सीखें', textEn: 'Under 1 minute — premature ejaculation — treatable — learn the pause/squeeze technique' },
    { questionIndex: 74, text: '3+ मिनट — सामान्य सीमा में — चिंता कम करें — तनाव ही इसे बढ़ाता है', textEn: '3+ minutes — within normal range — reduce anxiety — stress itself worsens it' },
    // q75 (MAL06)
    { questionIndex: 75, text: 'तनाव/रिश्ते में दिक्कत — जोड़ी परामर्श मददगार — यह आपकी कमजोरी नहीं है', textEn: 'Stress/relationship issues — couple counselling helps — this is not your weakness' },
    { questionIndex: 75, text: 'तनाव नहीं — हस्तमैथुन से ED/कमजोरी नहीं होती — यह मिथक है — सही जानकारी डॉक्टर से लें', textEn: 'No stress — masturbation does NOT cause ED or weakness — it is a myth — get correct information from the doctor' },
    // q76 (MAL07)
    { questionIndex: 76, text: 'पीछे नहीं खिसकती — फिमोसिस संभव — सर्जिकल सलाह (सर्कमिशन) लें', textEn: 'Does not retract — phimosis possible — take a surgical opinion (circumcision)' },
    { questionIndex: 76, text: 'खिसकती है पर दर्द — सूजन/संक्रमण संभव — जांच कराएं', textEn: 'Retracts with pain — inflammation/infection possible — get examined' },
    // q77 (MAL07)
    { questionIndex: 77, text: 'पेशाब पर फुलाव — रुकावट का संकेत — यूरोलॉजिस्ट से जल्दी मिलें', textEn: 'Ballooning while voiding — obstruction sign — see a urologist soon' },
    { questionIndex: 77, text: 'कोई फुलाव नहीं — सफाई: रोज़ हल्के साबुन-पानी से फोरस्किन पीछे खिसकाकर धोएं, वापस लौटाएं', textEn: 'No ballooning — hygiene: gently retract, wash daily with mild soap and water, return it back' },
    // q78 (MAL08)
    { questionIndex: 78, text: '1 साल+ कोशिश — दंपति (दोनों) की जांच शुरू करें — पहले दोनों की बुनियादी जांच', textEn: '1+ year trying — start the COUPLE workup — basic tests for both partners first' },
    { questionIndex: 78, text: '6 महीने — महिला साथी की उम्र 35+ हो तो जल्दी जांच शुरू करें', textEn: '6 months — start workup sooner if the female partner is 35+' },
    // q79 (MAL08)
    { questionIndex: 79, text: 'दोनों की जांच हुई — रिपोर्टें साथ लाएं — आगे की योजना बनेगी', textEn: 'Both tested — bring the reports — the plan will follow' },
    { questionIndex: 79, text: 'केवल एक की जांच — दूसरे की भी जरूरी — आधी जांच = आधा इलाज', textEn: 'Only one tested — the other must be tested too — half a workup = half the treatment' },
    // q80 (OTH01)
    { questionIndex: 80, text: 'उम्र 7+ — बिस्तर गीला — बाल-चिकित्सक (पेडियाट्रिशियन) से मिलें — इलाज संभव है', textEn: 'Age 7+ — bedwetting — see a pediatrician — treatment is available' },
    { questionIndex: 80, text: 'उम्र 5-6 — धीरज रखें: 15% बच्चे साल भर में अपने आप ठीक हो जाते हैं', textEn: 'Age 5-6 — be patient: 15% of children outgrow it within a year' },
    // q81 (OTH01)
    { questionIndex: 81, text: 'दिन में भी गीला — बार-बार UTI/अन्य कारण — पेडियाट्रिक जांच जरूरी', textEn: 'Day wetting too — recurrent UTI/other cause — pediatric workup needed' },
    { questionIndex: 81, text: 'केवल रात — सामान्य एन्यूरेसिस — रात पानी कम + सोने से पहले पेशाब (अलार्म चर्चा पेडियाट्रिशियन से)', textEn: 'Night only — typical enuresis — less evening fluid + void before bed (discuss alarms with pediatrician)' },
    // q82 (OTH02)
    { questionIndex: 82, text: 'कैथेटर 1 महीने+ — बदलने का समय और त्वचा देखभाल — नर्सिंग सलाह लें', textEn: 'Catheter 1+ month — change due and skin care — take nursing advice' },
    { questionIndex: 82, text: 'हाल में लगा — देखभाल: बैग हमेशा पेट से नीचे, नली मुड़ी न हो, रोज़ मीटल (ट्यूब की जगह) साफ', textEn: 'Recently placed — care: bag always BELOW bladder level, tube never kinked, clean the meatal site daily' },
    // q83 (OTH02)
    { questionIndex: 83, text: 'गहरा/मवाद जैसा रंग या बाहर रिसाव — संक्रमण/रुकावट संभव — जल्दी जांच कराएं', textEn: 'Dark/pus-like colour or leakage around catheter — infection/blockage possible — early check' },
    { questionIndex: 83, text: 'सामान्य पीला रंग — अच्छा — रोज़ मीटल सफाई + कम से कम 2 ली पानी', textEn: 'Normal yellow — good — daily meatal cleaning + at least 2 L water' },
    // q84 (OTH03 — TB)
    { questionIndex: 84, text: '3+ महीने बार-बार पेशाब — पुराने कारण (मूत्र-तपैदक आदि) की जांच जरूरी', textEn: '3+ months of frequency — chronic causes (urinary TB etc.) need workup' },
    { questionIndex: 84, text: '2-6 हफ्ते — सामान्य संक्रमण भी हो सकता है — यूरिन कल्चर कराएं', textEn: '2-6 weeks — ordinary infection also possible — urine culture' },
    // q85 (OTH03 — NTEP)
    { questionIndex: 85, text: 'वजन घटा + रात का पसीना + बार-बार पेशाब — मूत्र-तपैदक संभव — NTEP केंद्र से जांच जरूरी', textEn: 'Weight loss + night sweats + frequency — urinary TB possible — NTEP centre testing essential' },
    { questionIndex: 85, text: 'वजन स्थिर — अच्छा — फिर भी लंबे लक्षणों की जांच पूरी करें', textEn: 'Weight stable — good — still complete the workup for long-standing symptoms' },
    // q86 (OTH04)
    { questionIndex: 86, text: '2 हफ्ते+ रात का पसीना — TB जांच कराएं — सरकारी NTEP जांच मुफ्त है', textEn: '2+ weeks night sweats — get TB testing — government NTEP testing is free' },
    { questionIndex: 86, text: 'कुछ दिनों से — बुखार का रिकॉर्ड रखें — पैटर्न डॉक्टर को बताएं', textEn: 'Few days — keep a fever record — tell the doctor the pattern' },
    // q87 (OTH04)
    { questionIndex: 87, text: 'शाम का बुखार + रात का पसीना — TB का पैटर्न — NTEP जांच जरूरी', textEn: 'Evening fever + night sweats — TB pattern — NTEP testing needed' },
    { questionIndex: 87, text: 'बुखार नहीं — अन्य कारण संभव — विस्तृत जांच कराएं', textEn: 'No fever — other causes possible — detailed workup' },
    // q88 (OTH05)
    { questionIndex: 88, text: 'ट्रांसप्लांट 1 साल+ — स्थिर — नियमित क्रिएटिनिन/दवा स्तर जांच जारी रखें', textEn: 'Transplant 1+ year — stable — continue regular creatinine/drug-level checks' },
    { questionIndex: 88, text: 'हाल में ट्रांसप्लांट — नजदीकी फॉलो-अप — संक्रमण से बचाव जरूरी', textEn: 'Recent transplant — close follow-up — infection protection essential' },
    // q89 (OTH05 — NEVER STOP)
    { questionIndex: 89, text: 'कोई दवा छूटी/बंद की — खुद से कभी नहीं — आज ही ट्रांसप्लांट टीम को बताएं', textEn: 'Missed/stopped any medicine — never on your own — inform the transplant team TODAY' },
    { questionIndex: 89, text: 'सभी दवाएं नियमित — अच्छा — याद रखें: ट्रांसप्लांट की दवाएं कभी बंद नहीं करनी', textEn: 'All regular — good — remember: transplant medicines are NEVER to be stopped' },
    // q90 (OTH06)
    { questionIndex: 90, text: 'फिस्टुला/कैथेटर 6 महीने+ — सालाना सर्जिकल समीक्षा कराते रहें', textEn: 'Fistula/catheter 6+ months — keep annual surgical reviews' },
    { questionIndex: 90, text: 'नया एक्सेस — बांह की कसरत (एक्सरसाइज़) फिस्टुला को मजबूत बनाती है — डायलिसिस टीम की सलाह लें', textEn: 'New access — arm exercises develop the fistula — take dialysis team guidance' },
    // q91 (OTH06)
    { questionIndex: 91, text: 'लाली/सूजन/दर्द/बहना — एक्सेस संक्रमण — उसी दिन डायलिसिस/वैस्कुलर टीम से मिलें', textEn: 'Redness/swelling/pain/discharge — access infection — meet the dialysis/vascular team the same day' },
    { questionIndex: 91, text: 'जगह साफ — अच्छा — रोज़ देखें, साबुन-पानी से धोएं, उसी बांह पर BP या नाखून न बनवाएं', textEn: 'Site clean — good — inspect daily, wash with soap and water, no BP cuff or nails on that arm' },
  ],

  // ══ Labels (12) ══════════════════════════════════════════════════════
  labels: [
    { label: 'पेशाब आवृत्ति (दिन)', labelEn: 'Urine Frequency (Day)', unit: '/day' },
    { label: 'रात की पेशाब संख्या', labelEn: 'Night Urinations', unit: '/night' },
    { label: 'दर्द अंक', labelEn: 'Pain Score (Flank/Voiding)', unit: '/10' },
    { label: 'बुखार', labelEn: 'Fever Pattern', unit: '°F' },
    { label: 'तरल मात्रा', labelEn: 'Fluid Intake', unit: 'L/day' },
    { label: 'IPSS स्कोर', labelEn: 'IPSS (Prostate Symptom Score)', unit: '/35' },
    { label: 'धार बल', labelEn: 'Urine Stream Force', unit: '/5' },
    { label: 'शेष-भाव अंक', labelEn: 'Residual Sensation', unit: '/10' },
    { label: 'PSA (रिपोर्ट)', labelEn: 'PSA (if brought)', unit: 'ng/ml' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
  ],

  // ══ Findings (30) — refer-only/continuation findings carry ZERO links ══
  findings: [
    // Managed (medicines linked below)
    { key: 'CYSTITIS-ACUTE', name: 'तीव्र मूत्राशय संक्रमण (सिस्टाइटिस)', nameEn: 'Acute Cystitis', icd10: 'N30.0' },
    { key: 'UTI-RECURRENT', name: 'बार-बार मूत्र संक्रमण (रोकथाम योजना)', nameEn: 'Recurrent UTI (Prophylaxis Framing)', icd10: 'N39.0' },
    { key: 'UROLITHIASIS-FU', name: 'मूत्र पथरी (फॉलो-अप)', nameEn: 'Urolithiasis (Follow-up)', icd10: 'N20.0' },
    { key: 'RENAL-COLIC-FU', name: 'गुर्दा कोलिक दर्द (ब्रिज उपचार)', nameEn: 'Renal Colic (Bridge Care)', icd10: 'N23' },
    { key: 'STONE-HISTORY-FU', name: 'पथरी का पुराना इतिहास (फॉलो-अप)', nameEn: 'Stone History (Follow-up)', icd10: 'Z87' },
    { key: 'BPH-MANAGED', name: 'प्रोस्टेट ग्रंथि वृद्धि (BPH, IPSS आधारित)', nameEn: 'Benign Prostatic Hyperplasia (IPSS-based)', icd10: 'N40' },
    { key: 'PROSTATITIS-FU', name: 'पुरानी प्रोस्टेट सूजन (फॉलो-अप)', nameEn: 'Chronic Prostatitis (Follow-up)', icd10: 'N41.1' },
    { key: 'OAB-MANAGED', name: 'अतिसक्रिय मूत्राशय (OAB, प्रशिक्षण + दवा)', nameEn: 'Overactive Bladder (Training + Medicine)', icd10: 'N32.81' },
    { key: 'STRESS-INCONT', name: 'प्रयासजन्य मूत्र असंयमन (कीगल-प्रथम)', nameEn: 'Stress Incontinence (Kegel-first)', icd10: 'N39.3' },
    { key: 'SEXUAL-DYSFUNCTION-COUNSEL', name: 'यौन दुर्क्रिया परामर्श (ED/PE)', nameEn: 'Sexual Dysfunction Counselling (ED/PE)', icd10: 'F52' },
    { key: 'FERTILITY-WORKUP', name: 'बांझपन जांच (दंपति — प्रथम चरण)', nameEn: 'Infertility Workup (Couple — First-line)', icd10: 'N97' },
    // Refer-only / workup / continuation — ZERO findingMeds links by design
    { key: 'PAINLESS-HEMATURIA-REF', name: 'बिना दर्द पेशाब में खून (कैंसर जांच — केवल रेफर)', nameEn: 'Painless Hematuria (Malignancy Workup — REFER ONLY)', icd10: 'R31.0' },
    { key: 'PYELONEPHRITIS-SEVERE', name: 'गुर्दा संक्रमण गंभीर (भर्ती — केवल रेफर)', nameEn: 'Severe Pyelonephritis (Admit — REFER ONLY)', icd10: 'N10' },
    { key: 'UROSEPSIS', name: 'यूरोसेप्सिस (इमरजेंसी)', nameEn: 'Urosepsis (Emergency)', icd10: 'A41.9' },
    { key: 'RENAL-COLIC-SEVERE', name: 'कोलिक + बुखार (भर्ती — केवल रेफर)', nameEn: 'Renal Colic with Fever (Admission — REFER ONLY)', icd10: 'N23' },
    { key: 'URINARY-RETENTION-ER', name: 'मूत्र रुकावट (इमरजेंसी कैथेटर — केवल रेफर)', nameEn: 'Urinary Retention (ER Catheter — REFER ONLY)', icd10: 'R33' },
    { key: 'HYDRONEPHROSIS-SCREEN', name: 'किडनी सूजन — हाइड्रोनेफ्रोसिस (रेफर)', nameEn: 'Hydronephrosis Screen (Refer)', icd10: 'N13.1' },
    { key: 'STRICTURE-SUSPECT', name: 'मूत्रमार्ग सख्ती (संदेह — रेफर)', nameEn: 'Urethral Stricture Suspect (Refer)', icd10: 'N35' },
    { key: 'TORSION-SUSPECT', name: 'टेस्टिस घुमाव (संदेह — 6 घंटे इमरजेंसी, केवल रेफर)', nameEn: 'Testicular Torsion Suspect (6-Hour Emergency — REFER ONLY)', icd10: 'N44.0' },
    { key: 'HYDROCELE-SCREEN', name: 'जल वृषणकोश — हाइड्रोसील (सर्जिकल रेफर)', nameEn: 'Hydrocele Screen (Surgical Refer)', icd10: 'N43.3' },
    { key: 'VARICOCELE-SCREEN', name: 'वृषण शिरा विस्तार — वैरिकोसील (रेफर)', nameEn: 'Varicocele Screen (Refer)', icd10: 'N43.1' },
    { key: 'PHIMOSIS-SCREEN', name: 'फोरस्किन तंग — फिमोसिस (सर्जिकल रेफर)', nameEn: 'Phimosis Screen (Surgical Refer)', icd10: 'N47' },
    { key: 'STD-DISCHARGE-SCREEN', name: 'लिंग स्राव — यौन संक्रमण जांच (रेफर + साथी इलाज)', nameEn: 'STD Discharge Screen (Refer Testing + Partner)', icd10: 'A56' },
    { key: 'KIDNEY-TB-SUSPECT', name: 'मूत्र-तपैदक संदेह (NTEP रेफर — केवल रेफर)', nameEn: 'Urinary TB Suspect (NTEP Referral — REFER ONLY)', icd10: 'A18.1' },
    { key: 'PROSTATE-CA-SUSPECT', name: 'प्रोस्टेट कैंसर संदेह (जांच — केवल रेफर)', nameEn: 'Prostate Cancer Suspect (Workup — REFER ONLY)', icd10: 'D07.5' },
    { key: 'BLADDER-CA-SUSPECT', name: 'मूत्राशय कैंसर संदेह (सिस्टोस्कोपी — केवल रेफर)', nameEn: 'Bladder Cancer Suspect (Cystoscopy — REFER ONLY)', icd10: 'D09.0' },
    { key: 'PROSTATE-CA-FU', name: 'प्रोस्टेट कैंसर इलाज पर (निरंतरता फॉलो-अप)', nameEn: 'Prostate Cancer on Treatment (Continuation)', icd10: 'Z85.46' },
    { key: 'TRANSPLANT-FU', name: 'किडनी ट्रांसप्लांट (निरंतरता फॉलो-अप)', nameEn: 'Kidney Transplant (Continuation)', icd10: 'Z94.0' },
    { key: 'TRANSPLANT-REJECTION-SUSPECT', name: 'ट्रांसप्लांट अस्वीकृति संदेह (तुरंत ट्रांसप्लांट केंद्र)', nameEn: 'Transplant Rejection Suspect (Transplant Centre Urgent)', icd10: 'T86.1' },
    { key: 'DIALYSIS-ACCESS-FU', name: 'डायलिसिस एक्सेस फॉलो-अप (निरंतरता)', nameEn: 'Dialysis Access Follow-up (Continuation)', icd10: 'Z49' },
  ],

  // ══ Medicines (54) — India urology OPD core; unverified-dose mode ═════
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Anti-infective — UTI group
    { name: 'Niftran 100 Capsule', salt: 'Nitrofurantoin 100 mg — avoid in last month of pregnancy & severe kidney disease', doseOptions: ['1 cap twice daily × 5-7 days', '1 cap 4 times daily (severe)'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Martifur 100 Tablet', salt: 'Nitrofurantoin MR 100 mg — long-term low-dose prophylaxis form; avoid late pregnancy', doseOptions: ['1 tab at bedtime (prophylaxis)', '1 tab twice daily (course)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Niftas 100 Tablet', salt: 'Nitrofurantoin 100 mg (alternate brand); avoid late pregnancy', doseOptions: ['1 tab twice daily × 5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cifran 500 Tablet', salt: 'Ciprofloxacin 500 mg — FDA alert: tendon rupture + nerve/psychiatric effects; reserve-use; NEVER in pregnancy', doseOptions: ['1 tab twice daily × 3-7 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplox 500 Tablet', salt: 'Ciprofloxacin 500 mg (alternate brand; same tendon/psych cautions; pregnancy NEVER)', doseOptions: ['1 tab twice daily × 3-7 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Norflox 400 Tablet', salt: 'Norfloxacin 400 mg — urinary levels; take on empty stomach; fluoroquinolone cautions; pregnancy NEVER', doseOptions: ['1 tab twice daily × 3-5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Levoflox 500 Tablet', salt: 'Levofloxacin 500 mg — fluoroquinolone tendon/psych cautions; pregnancy NEVER', doseOptions: ['1 tab once daily × 3-5 days', '1 tab once daily × 7 days'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — penicillin allergy check first', doseOptions: ['1 tab twice daily × 5-7 days'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ceftum 500 Tablet', salt: 'Cefuroxime Axetil 500 mg — take after food', doseOptions: ['1 tab twice daily × 5-7 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zifi 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily × 5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg (alternate brand)', doseOptions: ['1 tab twice daily × 5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Septran DS Tablet', salt: 'Trimethoprim 160 mg + Sulfamethoxazole 800 mg — resistance common; avoid late pregnancy & G6PD deficiency', doseOptions: ['1 tab twice daily × 3-5 days'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Monurol Sachet 3g', salt: 'Fosfomycin 3 g single-dose sachet — dissolve in water; bedtime single dose', doseOptions: ['1 sachet (3 g) single dose at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxt SL Tablet', salt: 'Doxycycline 100 mg + Lactic Acid Bacillus — avoid in pregnancy & children under 12', doseOptions: ['1 tab twice daily × 7-14 days'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Forcan 150 Tablet', salt: 'Fluconazole 150 mg — ONLY for documented fungal urine infection', doseOptions: ['1 tab once weekly (as advised)'], morning: 1, afternoon: 0, evening: 0, tab: 2, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Urinary alkalinisers / soothing
    { name: 'Alkasol Syrup 100ml', salt: 'Potassium Citrate + Citric Acid syrup — dilute in water; kidney disease patients consult doctor', doseOptions: ['10 ml in half glass water 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cital Syrup 200ml', salt: 'Disodium Hydrogen Citrate 1.4 g/5 ml — always dilute in a glass of water', doseOptions: ['10 ml in glass of water 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Citralka Liquid 200ml', salt: 'Disodium Hydrogen Citrate liquid — dilute before drinking', doseOptions: ['10 ml in water thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Urispas 200 Tablet', salt: 'Flavoxate 200 mg — urinary antispasmodic; may cause drowsiness', doseOptions: ['1 tab thrice daily × 5 days'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pyridium 200 Tablet', salt: 'Phenazopyridine 200 mg — MAX 2 DAYS (masks infection if longer); stains urine/lenses orange', doseOptions: ['1 tab thrice daily × 2 days MAX'], morning: 1, afternoon: 1, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Colic antispasmodics / analgesics
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg — smooth-muscle antispasmodic for renal colic', doseOptions: ['1 tab SOS', '1 tab thrice daily × 3 days'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Drotin 40 Tablet', salt: 'Drotaverine 40 mg — regular strength', doseOptions: ['1 tab twice-thrice daily'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cyclopam Tablet', salt: 'Dicyclomine 20 mg + Paracetamol 325 mg — cramps with pain; after food', doseOptions: ['1 tab SOS after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Buscopan 10 Tablet', salt: 'Hyoscine Butylbromide 10 mg — colic antispasmodic', doseOptions: ['1 tab thrice daily × 3 days'], morning: 1, afternoon: 1, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Meftal Spas Tablet', salt: 'Mefenamic Acid 250 mg + Dicyclomine 10 mg — strictly after food', doseOptions: ['1 tab SOS after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg mouth-dissolving — colic-associated vomiting', doseOptions: ['1 tab SOS; max 2/day'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — max 3 g/day', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Voveran SR 100 Tablet', salt: 'Diclofenac Sodium 100 mg SR — NSAID: avoid if kidney function reduced; shortest possible course', doseOptions: ['1 tab after dinner × 3 days'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg — severe colic only; dizziness/dependence risk', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H1', verified: false } },

    // Alpha-blockers / stone expulsion / BPH
    { name: 'Urimax 0.4 Capsule', salt: 'Tamsulosin 0.4 mg — first dose at bedtime (syncope risk); tell eye surgeon about floppy-iris risk', doseOptions: ['1 cap after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tamflo 0.4 Tablet', salt: 'Tamsulosin 0.4 mg (alternate brand; same first-dose syncope + floppy-iris cautions)', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Veltam 0.4 Tablet', salt: 'Tamsulosin 0.4 mg (alternate brand; bedtime first dose)', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Urimax-D Tablet', salt: 'Tamsulosin 0.4 mg + Dutasteride 0.5 mg — PSA halves (double the threshold); pregnant women must NOT touch crushed/broken tablet', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Veltam Plus Tablet', salt: 'Tamsulosin 0.4 mg + Dutasteride 0.5 mg — same PSA-halving and no-touch-in-pregnancy warnings', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Silodal 8 Capsule', salt: 'Silodosin 8 mg — selective alpha-blocker; orgasm/ejaculation changes common', doseOptions: ['1 cap after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Flotral 10 Tablet', salt: 'Alfuzosin 10 mg — after meal; first-dose syncope caution', doseOptions: ['1 tab after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Finast 5 Tablet', salt: 'Finasteride 5 mg — halves PSA value (interpretation counselling); pregnant women avoid exposure to crushed tablet', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dutas 0.5 Capsule', salt: 'Dutasteride 0.5 mg — PSA halves; strict no-touch rule in pregnancy', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Overactive bladder
    { name: 'Vesicare 5 Tablet', salt: 'Solifenacin 5 mg — dry mouth/constipation common; glaucoma caution', doseOptions: ['1 tab once daily', '1 tab once daily (double only after review)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Soliten 5 Tablet', salt: 'Solifenacin 5 mg (alternate brand; same dry-mouth caution)', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ditropan 5 Tablet', salt: 'Oxybutynin 5 mg — strong dry mouth; elderly confusion caution', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Urotel 2 Tablet', salt: 'Tolterodine 2 mg — antimuscarinic; dry mouth common', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mirabeg 25 Tablet', salt: 'Mirabegron 25 mg — can raise blood pressure; check BP after starting', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Erectile difficulty (surface-level, cautious inclusion)
    { name: 'Penegra 25 Tablet', salt: 'Sildenafil 25 mg — FATAL with nitrates; cardiac workup BEFORE use; 1 hr before; max 1/day; only after counselling', doseOptions: ['1 tab 1 hour before activity'], morning: 0, afternoon: 0, evening: 1, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Penegra 50 Tablet', salt: 'Sildenafil 50 mg — NITRATE COMBINATION IS FATAL; heart check-up first; only after counselling', doseOptions: ['1 tab 1 hour before activity', 'half tab (25 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Manforce 50 Tablet', salt: 'Sildenafil 50 mg (alternate brand; same nitrate-FATAL and cardiac-first rules)', doseOptions: ['1 tab 1 hour before activity', 'half tab (25 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Suhagra 50 Tablet', salt: 'Sildenafil 50 mg (alternate brand; nitrate-FATAL warning applies)', doseOptions: ['1 tab 1 hour before activity'], morning: 0, afternoon: 0, evening: 1, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // Supportive / adjunct
    { name: 'Betadine Solution 100ml', salt: 'Povidone-Iodine 10% — external meatal/catheter-site cleaning', doseOptions: ['Apply diluted on site 1-2 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Lignox 2% Jelly 30g', salt: 'Lidocaine 2% jelly — catheter lubrication/topical analgesia', doseOptions: ['Apply as advised before catheterisation'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin + Chymotrypsin — post-operative swelling; swallow whole on empty stomach', doseOptions: ['1 tab thrice daily × 5 days'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml — avoid straining after prostate/stone surgery', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg — pre-conception support (couple workup)', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose; dehydration with fever/colic', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — antibiotic-course gastritis cover', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (38) — refer-only findings: ZERO links ══
  findingMeds: [
    // CYSTITIS-ACUTE
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Niftran 100 Capsule', dose: '1 cap (100 mg) BD × 5-7 days', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'First-line uncomplicated cystitis; complete the course' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Cifran 500 Tablet', description: '1 tab BD × 3-7 days — reserve use; NEVER in pregnancy' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5-7 days — penicillin-safe option' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Monurol Sachet 3g', description: 'Single bedtime dose — uncomplicated cystitis alternative' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Alkasol Syrup 100ml', description: '10 ml in water TDS — burning relief; dilute before drinking' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Cital Syrup 200ml', description: '10 ml in water TDS — alternate alkaliniser' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Urispas 200 Tablet', description: '1 tab TDS × 5 days — spasm/pain relief' },
    { findingKey: 'CYSTITIS-ACUTE', medicineName: 'Pyridium 200 Tablet', description: '1 tab TDS × MAX 2 DAYS — orange urine expected; masks infection if longer' },
    // UTI-RECURRENT
    { findingKey: 'UTI-RECURRENT', medicineName: 'Martifur 100 Tablet', description: '1 tab HS long-term low-dose prophylaxis — doctor-supervised 3-6 months, review' },
    { findingKey: 'UTI-RECURRENT', medicineName: 'Niftran 100 Capsule', description: 'Breakthrough episode: 1 cap BD × 5 days' },
    { findingKey: 'UTI-RECURRENT', medicineName: 'Cital Syrup 200ml', description: '10 ml in water BD — symptom support between episodes' },
    // UROLITHIASIS-FU
    { findingKey: 'UROLITHIASIS-FU', medicineName: 'Urimax 0.4 Capsule', description: '1 cap HS × 2-4 weeks — distal stone expulsion framing; first dose at bedtime' },
    { findingKey: 'UROLITHIASIS-FU', medicineName: 'Alkasol Syrup 100ml', description: '10 ml in water TDS — urine citrate support' },
    { findingKey: 'UROLITHIASIS-FU', medicineName: 'Dolo 650 Tablet', description: '1 tab SOS for pain; max 3 g/day' },
    // RENAL-COLIC-FU
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Drotin DS Tablet', description: '1 tab TDS/SOS × 3 days — colic bridge' },
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Cyclopam Tablet', description: '1 tab SOS after food — cramps + pain' },
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Buscopan 10 Tablet', description: '1 tab TDS × 3 days — colic antispasmodic' },
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Urimax 0.4 Capsule', description: '1 cap HS — expulsion framing alongside pain control' },
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Ondem 4 MD Tablet', description: '1 tab SOS — vomiting with colic' },
    { findingKey: 'RENAL-COLIC-FU', medicineName: 'Voveran SR 100 Tablet', description: 'Short course only; AVOID if kidney function reduced' },
    // STONE-HISTORY-FU
    { findingKey: 'STONE-HISTORY-FU', medicineName: 'Urimax 0.4 Capsule', description: 'If residual fragment on imaging — 1 cap HS' },
    { findingKey: 'STONE-HISTORY-FU', medicineName: 'Cital Syrup 200ml', description: '10 ml in water BD — citrate support for stone prevention' },
    // BPH-MANAGED
    { findingKey: 'BPH-MANAGED', medicineName: 'Urimax-D Tablet', description: '1 tab HS — tamsulosin + dutasteride; PSA-halving counselling' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Veltam 0.4 Tablet', description: '1 tab HS — alpha-blocker alone' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Veltam Plus Tablet', description: 'Alternate combo — same dutasteride warnings' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Finast 5 Tablet', description: '1 tab HS — 5-ARI; doubles PSA threshold for interpretation' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Silodal 8 Capsule', description: '1 cap HS — alternate alpha-blocker' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Flotral 10 Tablet', description: '1 tab HS after meal — alternate alpha-blocker' },
    { findingKey: 'BPH-MANAGED', medicineName: 'Dutas 0.5 Capsule', description: '1 cap HS — dutasteride alone' },
    // PROSTATITIS-FU
    { findingKey: 'PROSTATITIS-FU', medicineName: 'Cifran 500 Tablet', description: '1 tab BD × 4 weeks — chronic prostatitis course; reserve drug counselling' },
    { findingKey: 'PROSTATITIS-FU', medicineName: 'Doxt SL Tablet', description: '1 tab BD × 2-4 weeks — alternate course' },
    { findingKey: 'PROSTATITIS-FU', medicineName: 'Urimax 0.4 Capsule', description: '1 cap HS — flow support during recovery' },
    // OAB-MANAGED
    { findingKey: 'OAB-MANAGED', medicineName: 'Vesicare 5 Tablet', description: '1 tab OD × 4 weeks — with bladder-training schedule' },
    { findingKey: 'OAB-MANAGED', medicineName: 'Ditropan 5 Tablet', description: '1 tab BD — lower-cost antimuscarinic' },
    { findingKey: 'OAB-MANAGED', medicineName: 'Mirabeg 25 Tablet', description: '1 tab OD — if antimuscarinic not tolerated; monitor BP' },
    { findingKey: 'OAB-MANAGED', medicineName: 'Urotel 2 Tablet', description: '1 tab BD — alternate antimuscarinic' },
    // SEXUAL-DYSFUNCTION-COUNSEL
    { findingKey: 'SEXUAL-DYSFUNCTION-COUNSEL', medicineName: 'Penegra 50 Tablet', description: 'Only AFTER cardiac screening + counselling; nitrate-FATAL check every visit' },
    { findingKey: 'SEXUAL-DYSFUNCTION-COUNSEL', medicineName: 'Manforce 50 Tablet', description: 'Alternate brand — same cardiac-first and nitrate rules' },
    // Refer-only findings (PAINLESS-HEMATURIA-REF, PYELONEPHRITIS-SEVERE, UROSEPSIS,
    // RENAL-COLIC-SEVERE, URINARY-RETENTION-ER, HYDRONEPHROSIS-SCREEN, STRICTURE-SUSPECT,
    // TORSION-SUSPECT, HYDROCELE-SCREEN, VARICOCELE-SCREEN, PHIMOSIS-SCREEN,
    // STD-DISCHARGE-SCREEN, KIDNEY-TB-SUSPECT, PROSTATE-CA-SUSPECT, BLADDER-CA-SUSPECT,
    // PROSTATE-CA-FU, TRANSPLANT-FU, TRANSPLANT-REJECTION-SUSPECT, DIALYSIS-ACCESS-FU,
    // FERTILITY-WORKUP, STRESS-INCONT) — intentionally ZERO links by design.
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Fluid & Voiding Diary (24 hours)',
      rows: 12,
      cols: 5,
      headerLabel: ['समय', 'पिया (ml)', 'पेशाब (ml)', 'रिसाव', 'बेचैनी (0-5)'],
      colsLabel: ['Time', 'Intake (ml)', 'Voided (ml)', 'Leak', 'Urgency (0-5)'],
      footerLabel: ['अगली मुलाकात में डॉक्टर को दिखाएं / Show to your doctor at the next visit'],
    },
    {
      name: 'IPSS Symptom Score',
      rows: 9,
      cols: 2,
      headerLabel: ['लक्षण (7 मानक + कुल + जीवन-गुणवत्ता)', 'अंक (0-5)'],
      colsLabel: ['Symptom (7 standard + total + QoL)', 'Score (0-5)'],
      footerLabel: ['कुल: 0-7 हल्का · 8-19 मध्यम · 20-35 गंभीर · Q8 जीवन-गुणवत्ता / Total: 0-7 mild · 8-19 moderate · 20-35 severe · Q8 quality of life'],
    },
    {
      name: 'Stone Diet Chart',
      rows: 8,
      cols: 3,
      headerLabel: ['खाद्य पदार्थ', 'हरा/सीमित/लाल', 'नोट'],
      colsLabel: ['Food item', 'Green/Limit/Avoid', 'Note'],
      footerLabel: ['पानी 3-4 ली/दिन सबसे बड़ी दवा है / Water 3-4 L a day is the biggest medicine'],
    },
    {
      name: 'Bladder Training Schedule',
      rows: 6,
      cols: 3,
      headerLabel: ['हफ्ता', 'पेशाब अंतराल', 'नोट'],
      colsLabel: ['Week', 'Voiding interval', 'Note'],
      footerLabel: ['बेचैनी आए तो रुकें — गिनें — सांस लें — फिर जाएं / When urgency comes: stop — count — breathe — then go'],
    },
    {
      name: 'Catheter Care Card',
      rows: 7,
      cols: 2,
      headerLabel: ['देखभाल कदम', 'नोट'],
      colsLabel: ['Care step', 'Note'],
      footerLabel: ['बुखार / गहरा पेशाब / बहना = उसी दिन डॉक्टर / Fever, dark urine or leakage = same-day doctor'],
    },
    {
      name: 'Renal Colic Action Card',
      rows: 7,
      cols: 2,
      headerLabel: ['स्थिति', 'क्या करें'],
      colsLabel: ['Situation', 'What to do'],
      footerLabel: ['हर पेशाब छलनी से छानें — निकली पथरी संभाल कर रखें / Strain every void — preserve any passed stone'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acute Bacterial Cystitis — Standard Course',
      diagnosis: 'CYSTITIS-ACUTE',
      medicines: [
        { name: 'Niftran 100 Capsule', dose: '1 cap (100 mg)', duration: '5 days', instructions: 'BD after food; complete the full course' },
        { name: 'Urispas 200 Tablet', dose: '1 tab', duration: '5 days', instructions: 'TDS if burning/spasm' },
        { name: 'Dolo 650 Tablet', dose: '1 tab', duration: '3 days', instructions: 'SOS if pain; max 3 g/day' },
      ],
      labs: ['Urine Routine & Microscopy', 'Urine Culture (if recurrent or severe)'],
      advice: 'रोज़ 2.5-3 ली पानी · पेशाब रोकें नहीं · महिलाएं सामने से पीछे साफ करें · दवा का कोर्स पूरा खत्म करें',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Renal Colic — Bridge + Expulsion Framing',
      diagnosis: 'RENAL-COLIC-FU',
      medicines: [
        { name: 'Drotin DS Tablet', dose: '1 tab', duration: '3 days', instructions: 'TDS/SOS for colic pain' },
        { name: 'Urimax 0.4 Capsule', dose: '1 cap', duration: '14 days', instructions: 'After dinner; first dose at bedtime (dizziness possible)' },
        { name: 'Ondem 4 MD Tablet', dose: '1 tab', duration: '3 days', instructions: 'SOS for vomiting; max 2/day' },
        { name: 'Dolo 650 Tablet', dose: '1 tab', duration: '5 days', instructions: 'SOS for pain' },
      ],
      labs: ['USG KUB', 'Urine Routine & Microscopy', 'Serum Creatinine'],
      advice: 'हर पेशाब छलनी से छानें, निकली पथरी संभाल कर रखें · रोज़ 3-4 ली पानी · बुखार के साथ दर्द = तुरंत अस्पताल',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'BPH Starter — IPSS + Tamsulosin + Review',
      diagnosis: 'BPH-MANAGED',
      medicines: [
        { name: 'Urimax-D Tablet', dose: '1 tab', duration: '30 days', instructions: 'After dinner; first dose at bedtime; PSA-halving counselling done' },
      ],
      labs: ['IPSS Score', 'Uroflowmetry', 'USG KUB with Post-void Residual', 'Serum PSA (before starting 5-ARI)'],
      advice: 'डबल वॉयडिंग करें · शाम 7 बजे के बाद तरल कम · शराब/कैफीन घटाएं · रात को दवा सोते समय लें',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Recurrent UTI (Women) — Prophylaxis Plan',
      diagnosis: 'UTI-RECURRENT',
      medicines: [
        { name: 'Martifur 100 Tablet', dose: '1 tab (100 mg)', duration: '90 days', instructions: 'At bedtime — long-term low-dose prophylaxis; doctor-supervised with review' },
        { name: 'Cital Syrup 200ml', dose: '10 ml in water', duration: '15 days', instructions: 'BD — symptom support' },
      ],
      labs: ['Urine Culture & Sensitivity', 'USG KUB (if not done recently)', 'HbA1c / Blood Sugar'],
      advice: 'संबंध के बाद पेशाब करें · रोज़ 2.5 ली पानी · बबल-बाथ/स्पर्मिसाइड बचें · पीछे से न साफ करें',
      followUpDays: 30,
      isCommon: false,
    },
    {
      name: 'OAB Starter — Solifenacin + Training',
      diagnosis: 'OAB-MANAGED',
      medicines: [
        { name: 'Vesicare 5 Tablet', dose: '1 tab (5 mg)', duration: '30 days', instructions: 'Once daily; dry mouth common — sip water, report if severe' },
      ],
      labs: ['Urine R/M (rule out infection)', 'Bladder Diary — 3 days', 'USG with Post-void Residual'],
      advice: 'ब्लैडर ट्रेनिंग शेड्यूल (हर 2 घंटे से शुरू) · चाय/कॉफी/कोला बंद · शाम को पानी कम · रोज़ कीगल कसरत',
      followUpDays: 30,
      isCommon: false,
    },
    {
      name: 'Post-TURP / Stone Surgery Follow-up Bundle',
      diagnosis: 'UROLITHIASIS-FU',
      medicines: [
        { name: 'Urimax 0.4 Capsule', dose: '1 cap', duration: '14 days', instructions: 'After dinner — stent-related symptom relief / residual fragment' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '5 days', instructions: 'TDS on empty stomach — post-op swelling' },
        { name: 'Duphalac Solution 200ml', dose: '15 ml', duration: '7 days', instructions: 'At bedtime — avoid straining at stools' },
      ],
      labs: ['USG KUB at 1 month', 'Urine R/M', 'Uroflow (if TURP)'],
      advice: '2 हफ्ते भारी वजन न उठाएं · रोज़ 3 ली पानी · हल्की जलन/रिसाव 2-3 हफ्ते सामान्य · बुखार = तुरंत मिलें',
      followUpDays: 14,
      isCommon: false,
    },
  ],
}
