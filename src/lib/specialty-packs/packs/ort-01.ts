/**
 * ORT-01 — ORTHOPEDICS STARTER PACK (T1)
 *
 * "Pain & mobility": the India ortho OPD core — spine, joints, sports &
 * trauma, fracture/plaster care, bone health — with clinical questions,
 * printable Hindi advice, ROM / ortho-exam / physio tables and quick-Rx
 * templates.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / printed advice),
 * English secondary (doctor search). Medicine names = English brands
 * (India ortho OPD core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY CURATION NOTES (deliberate exclusions / hard flags):
 * - NSAIDs: every oral NSAID salt carries a co-prescribe-gastric-protection
 *   (PPI) note + elderly renal caution; Rx templates always pair the PPI.
 * - Tramadol combos (Ultracet, Tramazac 50): Schedule H + dependence /
 *   drowsiness caution in the salt — short courses only.
 * - Steroid injections are PROCEDURES, not medicine entries — they appear
 *   only as advice/referral lines (frozen shoulder, tennis elbow, knee OA).
 * - Colchicine (Zycolchin 0.5): narrow therapeutic index note — stop on
 *   diarrhoea. Febuxostat (Febutaz 40): CV caution note. Allopurinol
 *   (Zyloric 100): never start during an acute gout flare.
 * - RED-FLAG REFER lines live in question/suggestion content (never as
 *   medicine-only pathways): night pain + weight loss + fever →
 *   malignancy/infection screen; saddle anaesthesia / bladder-bowel change
 *   → cauda equina EMERGENCY neurosurgery referral; septic-arthritis screen
 *   for hot swollen joint with fever; too-tight cast → immediate splitting;
 *   head-injury symptoms → emergency CT.
 * - Findings deliberately carrying NO medicine links (refer / procedure
 *   pathways): CLAUDICATION-REFER (vascular workup), PULLED-ELBOW
 *   (reduction procedure), RA-SCREEN-REFER (DMARDs are specialist
 *   territory — pack carries no methotrexate / HCQ / oral steroids),
 *   POST-OP-ORTHO-FU, FLAT-FOOT, TAILBONE-PAIN, OSTEOMALACIA-SCREEN.
 * - Osgood-Schlatter deliberately skipped as too niche for v1.0.0.
 *
 * Sources: NLEM 2023 (molecule backbone), standard Indian ortho OPD
 * prescribing patterns, ICD-10 codes where established, GP-01 field
 * conventions (bilingual style + medicine flags).
 */

import type { SpecialtyPack } from '../types'

export const ORT01_PACK: SpecialtyPack = {
  meta: {
    code: 'ORT-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Orthopedics Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · India ortho OPD prescribing patterns · ICD-10 where established · unverified-dose launch mode',
  },

  // ══ Categories (7) ════════════════════════════════════════════════════
  categories: [
    { key: 'SPN', name: 'रीढ़ / कमर', nameEn: 'Spine' },
    { key: 'JNT', name: 'जोड़', nameEn: 'Joints' },
    { key: 'SPR', name: 'खेल एवं चोट', nameEn: 'Sports & Injury' },
    { key: 'FRC', name: 'हड्डी / फ्रैक्चर', nameEn: 'Fractures & Plaster' },
    { key: 'BNH', name: 'हड्डी स्वास्थ्य / कैल्शियम', nameEn: 'Bone Health' },
    { key: 'NRV', name: 'नस / सुन्नपन', nameEn: 'Nerve & Numbness' },
    { key: 'OTH', name: 'अन्य', nameEn: 'Others' },
  ],

  // ══ Complaints (46) ═══════════════════════════════════════════════════
  complaints: [
    // SPN — Spine
    { code: 'SPN01', categoryKey: 'SPN', detail: 'कमर दर्द', detailEn: 'Low Back Pain' },
    { code: 'SPN02', categoryKey: 'SPN', detail: 'कमर से पैर तक दर्द (साइटिका)', detailEn: 'Sciatica — Radiating Leg Pain' },
    { code: 'SPN03', categoryKey: 'SPN', detail: 'गर्दन दर्द', detailEn: 'Neck Pain' },
    { code: 'SPN04', categoryKey: 'SPN', detail: 'गर्दन से हाथ तक दर्द व सुन्नपन', detailEn: 'Neck Pain Radiating to Arm' },
    { code: 'SPN05', categoryKey: 'SPN', detail: 'स्लिप्ड डिस्क की शंका', detailEn: 'Suspected Slipped Disc (Query)' },
    { code: 'SPN06', categoryKey: 'SPN', detail: 'दुम की हड्डी में दर्द', detailEn: 'Tailbone (Coccyx) Pain' },
    { code: 'SPN07', categoryKey: 'SPN', detail: 'बैठक वाली नौकरी का दर्द (मुद्रा)', detailEn: 'Desk-Job / Posture-Related Pain' },
    // JNT — Joints
    { code: 'JNT01', categoryKey: 'JNT', detail: 'घुटने का दर्द', detailEn: 'Knee Pain' },
    { code: 'JNT02', categoryKey: 'JNT', detail: 'कई जोड़ों में दर्द', detailEn: 'Multiple Joint Pain' },
    { code: 'JNT03', categoryKey: 'JNT', detail: 'जोड़ में सूजन', detailEn: 'Joint Swelling' },
    { code: 'JNT04', categoryKey: 'JNT', detail: 'सुबह जोड़ों में जकड़न', detailEn: 'Morning Joint Stiffness' },
    { code: 'JNT05', categoryKey: 'JNT', detail: 'कंधा न हिल पाना (फ्रोजन कंधा)', detailEn: 'Frozen Shoulder (Stiff Shoulder)' },
    { code: 'JNT06', categoryKey: 'JNT', detail: 'कोहनी का दर्द', detailEn: 'Elbow Pain' },
    { code: 'JNT07', categoryKey: 'JNT', detail: 'कलाई का दर्द', detailEn: 'Wrist Pain' },
    { code: 'JNT08', categoryKey: 'JNT', detail: 'एड़ी का दर्द', detailEn: 'Heel Pain' },
    { code: 'JNT09', categoryKey: 'JNT', detail: 'कूल्हे / जांघ की जड़ का दर्द', detailEn: 'Hip Pain' },
    { code: 'JNT10', categoryKey: 'JNT', detail: 'टखने का दर्द (बिना चोट)', detailEn: 'Ankle Pain (Without Injury)' },
    { code: 'JNT11', categoryKey: 'JNT', detail: 'अंगूठे की जड़ में दर्द', detailEn: 'Thumb-Base Pain (De Quervain)' },
    { code: 'JNT12', categoryKey: 'JNT', detail: 'बार-बार छोटे जोड़ों का दर्द', detailEn: 'Recurrent Small-Joint Pain (RA Screen)' },
    { code: 'JNT13', categoryKey: 'JNT', detail: 'अचानक तेज़ जोड़ दर्द (गाउट दौरा)', detailEn: 'Sudden Severe Joint Pain (Gout Attack)' },
    // SPR — Sports & Injury
    { code: 'SPR01', categoryKey: 'SPR', detail: 'खेल में चोट', detailEn: 'Sports Injury' },
    { code: 'SPR02', categoryKey: 'SPR', detail: 'सड़क पर गिरना / एक्सीडेंट', detailEn: 'Road Fall / Accident (RTA)' },
    { code: 'SPR03', categoryKey: 'SPR', detail: 'गिरने के बाद सूजन', detailEn: 'Swelling After Fall' },
    { code: 'SPR04', categoryKey: 'SPR', detail: 'टखने की मोच', detailEn: 'Ankle Sprain' },
    { code: 'SPR05', categoryKey: 'SPR', detail: 'घुटने में मोड़ / खिंचाव', detailEn: 'Knee Twist / Sprain' },
    { code: 'SPR06', categoryKey: 'SPR', detail: 'घुटने की आवाज़ / जाम होना', detailEn: 'Knee Clicking / Locking' },
    { code: 'SPR07', categoryKey: 'SPR', detail: 'चलने पर पिंडली में दर्द', detailEn: 'Calf Pain on Walking' },
    { code: 'SPR08', categoryKey: 'SPR', detail: 'पुरानी चोट का दर्द', detailEn: 'Old Injury Pain' },
    // FRC — Fractures & Plaster
    { code: 'FRC01', categoryKey: 'FRC', detail: 'हड्डी टूटने की शंका', detailEn: 'Suspected Fracture' },
    { code: 'FRC02', categoryKey: 'FRC', detail: 'प्लास्टर में दर्द या सुन्नपन', detailEn: 'Pain / Numbness Inside Plaster' },
    { code: 'FRC03', categoryKey: 'FRC', detail: 'प्लास्टर हटने के बाद अकड़न', detailEn: 'Stiffness After Plaster Removal' },
    { code: 'FRC04', categoryKey: 'FRC', detail: 'फ्रैक्चर भरने की जांच', detailEn: 'Fracture Healing Check-Up' },
    { code: 'FRC05', categoryKey: 'FRC', detail: 'ऑपरेशन के बाद फॉलो-अप', detailEn: 'Post-Surgery Follow-Up' },
    { code: 'FRC06', categoryKey: 'FRC', detail: 'बच्चे की खिंची हुई कोहनी', detailEn: 'Pulled Elbow in Child' },
    // BNH — Bone Health
    { code: 'BNH01', categoryKey: 'BNH', detail: 'कैल्शियम दवा की पूछताछ', detailEn: 'Calcium Supplement Query' },
    { code: 'BNH02', categoryKey: 'BNH', detail: 'हड्डियों की कमजोरी की जांच', detailEn: 'Osteoporosis Screening' },
    { code: 'BNH03', categoryKey: 'BNH', detail: 'छोटी गिराव में हड्डी टूटना', detailEn: 'Fragility Fracture' },
    { code: 'BNH04', categoryKey: 'BNH', detail: 'रात में पैरों की ऐंठन', detailEn: 'Night Leg Cramps' },
    { code: 'BNH05', categoryKey: 'BNH', detail: 'शरीर भर में दर्द / हड्डी दर्द', detailEn: 'Generalised Body / Bone Pain' },
    // NRV — Nerve & Numbness
    { code: 'NRV01', categoryKey: 'NRV', detail: 'रात में हाथों में सुन्नपन', detailEn: 'Night Hand Numbness (Tingling)' },
    { code: 'NRV02', categoryKey: 'NRV', detail: 'पैरों में सुन्नपन / जलन', detailEn: 'Leg Numbness / Burning' },
    { code: 'NRV03', categoryKey: 'NRV', detail: 'हाथ-पैरों में झनझनाहट', detailEn: 'Tingling in Hands & Feet' },
    // OTH — Others
    { code: 'OTH01', categoryKey: 'OTH', detail: 'फ्लैट फीट की शंका', detailEn: 'Flat Feet Query' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'मांसपेशियों में ऐंठन', detailEn: 'Muscle Cramps' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'चलने में सहारे की ज़रूरत', detailEn: 'Need for Walking Support / Aid' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'जोड़ों के दर्द का फॉलो-अप', detailEn: 'Joint Pain Follow-Up' },
  ],

  // ══ Questions (98 — ~2 per complaint; questionIndex order MUST match) ══
  questions: [
    // SPN01 कमर दर्द
    { complaintCode: 'SPN01', question: 'दर्द कितने दिनों से है?', questionEn: 'Since how many days is the pain?' }, // idx 0
    { complaintCode: 'SPN01', question: 'खांसने या झुकने से दर्द पैर तक जाता है?', questionEn: 'Does coughing or bending send the pain down the leg?' }, // idx 1
    { complaintCode: 'SPN01', question: 'रात में दर्द बढ़ता है, वजन घट रहा है या बुखार है?', questionEn: 'Night-worsening pain, weight loss or fever?' }, // idx 2
    // SPN02 साइटिका
    { complaintCode: 'SPN02', question: 'दर्द कमर से पैर के किस हिस्से में जाता है — पिछले तरफ?', questionEn: 'Which part of the leg does the pain travel to — the back of the leg?' }, // idx 3
    { complaintCode: 'SPN02', question: 'पैर में सुन्नपन या झनझनाहट भी है?', questionEn: 'Any numbness or tingling in the leg?' }, // idx 4
    { complaintCode: 'SPN02', question: 'शौच-पेशाब पर नियंत्रण कम हुआ या जांघों के बीच सुन्नपन है?', questionEn: 'Loss of bladder/bowel control or numbness between the thighs?' }, // idx 5
    // SPN03 गर्दन दर्द
    { complaintCode: 'SPN03', question: 'दर्द कब से है — धीरे-धीरे या अचानक शुरू हुआ?', questionEn: 'Since when — gradual or sudden onset?' }, // idx 6
    { complaintCode: 'SPN03', question: 'दिनभर मोबाइल/लैपटॉप या ऊपर देखकर काम करते हैं?', questionEn: 'Long hours on mobile/laptop, or work looking upward?' }, // idx 7
    // SPN04 गर्दन से हाथ तक
    { complaintCode: 'SPN04', question: 'सुन्नपन/दर्द हाथ की कौन सी उंगलियों तक जाता है?', questionEn: 'Which fingers feel numb or painful?' }, // idx 8
    { complaintCode: 'SPN04', question: 'गर्दन एक तरफ झुकाने या नीचे देखने से दर्द बढ़ता है?', questionEn: 'Does tilting the neck or looking down worsen the pain?' }, // idx 9
    // SPN05 स्लिप्ड डिस्क
    { complaintCode: 'SPN05', question: 'वजन उठाने या झटके के बाद शुरू हुआ?', questionEn: 'Did it start after lifting weight or a sudden jerk?' }, // idx 10
    { complaintCode: 'SPN05', question: 'बैठने से दर्द बढ़ता और लेटने से राहत मिलती है?', questionEn: 'Worse on sitting, relieved on lying down?' }, // idx 11
    // SPN06 दुम की हड्डी
    { complaintCode: 'SPN06', question: 'लंबे समय बैठने पर दर्द बढ़ता है?', questionEn: 'Does the pain worsen after sitting for long?' }, // idx 12
    { complaintCode: 'SPN06', question: 'गिरने या प्रसव के बाद शुरू हुआ?', questionEn: 'Did it start after a fall or after childbirth?' }, // idx 13
    // SPN07 डेस्क-जॉब
    { complaintCode: 'SPN07', question: 'दिन में कितने घंटे लगातार बैठे रहते हैं?', questionEn: 'How many hours do you sit continuously in a day?' }, // idx 14
    { complaintCode: 'SPN07', question: 'कुर्सी की ऊंचाई ठीक है और स्क्रीन आंख की लाइन पर है?', questionEn: 'Is the chair height right and the screen at eye level?' }, // idx 15
    // JNT01 घुटने का दर्द
    { complaintCode: 'JNT01', question: 'सीढ़ी चढ़ने-उतरने पर दर्द ज्यादा होता है?', questionEn: 'Is the pain worse on climbing up or down stairs?' }, // idx 16
    { complaintCode: 'JNT01', question: 'घुटने मोड़ने पर कड़कड़ की आवाज़ आती है?', questionEn: 'Any crackling sound when bending the knee?' }, // idx 17
    { complaintCode: 'JNT01', question: 'सुबह घुटनों में जकड़न कितनी देर रहती है?', questionEn: 'How long does morning stiffness of the knees last?' }, // idx 18
    // JNT02 कई जोड़ों में दर्द
    { complaintCode: 'JNT02', question: 'कौन-कौन से जोड़ों में दर्द है?', questionEn: 'Which joints are painful?' }, // idx 19
    { complaintCode: 'JNT02', question: 'दर्द एक जोड़ से दूसरे जोड़ में जाता रहता है?', questionEn: 'Does the pain keep shifting from one joint to another?' }, // idx 20
    // JNT03 जोड़ में सूजन
    { complaintCode: 'JNT03', question: 'सूजन के साथ तेज़ लाली, गर्माहट या बुखार है?', questionEn: 'Redness, warmth or fever along with the swelling?' }, // idx 21
    { complaintCode: 'JNT03', question: 'सूजन एक जोड़ में है या कई जोड़ों में?', questionEn: 'Is the swelling in one joint or many joints?' }, // idx 22
    // JNT04 सुबह जकड़न
    { complaintCode: 'JNT04', question: 'जकड़न कितने समय तक रहती है?', questionEn: 'How long does the stiffness last?' }, // idx 23
    { complaintCode: 'JNT04', question: 'हिलने-डुलने या काम करने से जकड़न घटती है?', questionEn: 'Does moving around reduce the stiffness?' }, // idx 24
    // JNT05 फ्रोजन कंधा
    { complaintCode: 'JNT05', question: 'हाथ पीठ पर या सिर तक जाता है (कंघी/ब्लाउज़ कर पाते हैं)?', questionEn: 'Can you reach behind your back or overhead (comb / hook a blouse)?' }, // idx 25
    { complaintCode: 'JNT05', question: 'रात में उस कंधे पर लेटने से दर्द बढ़ता है?', questionEn: 'Is night pain worse when lying on that shoulder?' }, // idx 26
    { complaintCode: 'JNT05', question: 'शुगर (डायबिटीज़) या थायराइड की समस्या है?', questionEn: 'Any diabetes or thyroid problem?' }, // idx 27
    // JNT06 कोहनी दर्द
    { complaintCode: 'JNT06', question: 'हथेली नीचे करके वज़न उठाने पर दर्द होता है (जैसे बाल्टी)?', questionEn: 'Pain when lifting with the palm facing down (e.g., a bucket)?' }, // idx 28
    { complaintCode: 'JNT06', question: 'कोहनी के बाहरी टीले पर दबाने से दर्द होता है?', questionEn: 'Tenderness when pressing the outer bony point of the elbow?' }, // idx 29
    // JNT07 कलाई दर्द
    { complaintCode: 'JNT07', question: 'कलाई पर सूजन या गांठ दिखती है?', questionEn: 'Any visible swelling or lump on the wrist?' }, // idx 30
    { complaintCode: 'JNT07', question: 'रात में सुन्नपन या हाथ से चीज़ें छोड़ना/गिराना?', questionEn: 'Night numbness or dropping objects from the hand?' }, // idx 31
    // JNT08 एड़ी दर्द
    { complaintCode: 'JNT08', question: 'सुबह पहला कदम रखते समय तेज़ दर्द होता है?', questionEn: 'Sharp pain with the first steps in the morning?' }, // idx 32
    { complaintCode: 'JNT08', question: 'दर्द एड़ी के नीचे है या पीछे (एकिलीज़ नस पर)?', questionEn: 'Is the pain under the heel or at the back (Achilles area)?' }, // idx 33
    // JNT09 कूल्हे का दर्द
    { complaintCode: 'JNT09', question: 'दर्द कूल्हे के अंदर (कांख/जांघ) है या बाहरी तरफ?', questionEn: 'Is the pain in the groin or on the outer side of the hip?' }, // idx 34
    { complaintCode: 'JNT09', question: 'चलते समय लंगड़ापन या झुककर चलना?', questionEn: 'Any limp or walking bent forward?' }, // idx 35
    // JNT10 टखने का दर्द (बिना चोट)
    { complaintCode: 'JNT10', question: 'दोनों टखनों में दर्द है?', questionEn: 'Is the pain in both ankles?' }, // idx 36
    { complaintCode: 'JNT10', question: 'बार-बार सूजन आती-जाती रहती है?', questionEn: 'Does the swelling keep coming and going?' }, // idx 37
    // JNT11 अंगूठे की जड़
    { complaintCode: 'JNT11', question: 'अंगूठा हथेली में सिकोड़कर कलाई झुकाने पर दर्द होता है?', questionEn: 'Pain when bending the wrist with the thumb tucked into the palm?' }, // idx 38
    { complaintCode: 'JNT11', question: 'नई मां हैं — बच्चा उठाने के बाद शुरू हुआ?', questionEn: 'Are you a new mother — did it start after lifting the baby?' }, // idx 39
    // JNT12 छोटे जोड़ बार-बार
    { complaintCode: 'JNT12', question: 'उंगलियों/कलाई के जोड़ों में सुबह 30 मिनट से ज्यादा जकड़न?', questionEn: 'Morning stiffness over 30 minutes in finger/wrist joints?' }, // idx 40
    { complaintCode: 'JNT12', question: 'परिवार में किसी को गठिया (RA) है या रहा है?', questionEn: 'Any family history of rheumatoid arthritis?' }, // idx 41
    // JNT13 गाउट दौरा
    { complaintCode: 'JNT13', question: 'पहले भी अचानक ऐसा दौरा पड़ा है जो कुछ दिन में ठीक हो गया?', questionEn: 'Any earlier sudden attack that settled in a few days?' }, // idx 42
    { complaintCode: 'JNT13', question: 'शराब, मांस/मछली या दालें ज्यादा खाते हैं?', questionEn: 'Heavy intake of alcohol, meat/fish or pulses?' }, // idx 43
    // SPR01 खेल चोट
    { complaintCode: 'SPR01', question: 'चोट कैसे लगी — खिंचाव, टक्कर या मोड़ से?', questionEn: 'How did the injury happen — strain, collision or twist?' }, // idx 44
    { complaintCode: 'SPR01', question: 'चोट के बाद सूजन तुरंत आई या अगले दिन?', questionEn: 'Did swelling appear immediately or the next day?' }, // idx 45
    // SPR02 सड़क पर गिरना
    { complaintCode: 'SPR02', question: 'सबसे ज्यादा चोट कहां लगी है?', questionEn: 'Where is the worst injury?' }, // idx 46
    { complaintCode: 'SPR02', question: 'गिरने के बाद सिर चकराना, उल्टी या बेहोशी आई?', questionEn: 'Any giddiness, vomiting or blackout after the fall?' }, // idx 47
    { complaintCode: 'SPR02', question: 'चल पाए हैं या पैर पर वज़न डाल नहीं पाते?', questionEn: 'Can you walk, or are you unable to bear weight?' }, // idx 48
    // SPR03 गिरने के बाद सूजन
    { complaintCode: 'SPR03', question: 'सूजन कितनी देर में आई — 1-2 घंटे में या अगले दिन?', questionEn: 'How fast did the swelling come up — within 1-2 hours or next day?' }, // idx 49
    { complaintCode: 'SPR03', question: 'सूजन वाली जगह गर्म/लाल है या त्वचा पर खरोंच है?', questionEn: 'Is the swollen spot warm/red, or is the skin abraded?' }, // idx 50
    // SPR04 टखने की मोच
    { complaintCode: 'SPR04', question: 'मोच के बाद चलने की कोशिश में कितना दर्द होता है?', questionEn: 'How much pain when you try to walk after the sprain?' }, // idx 51
    { complaintCode: 'SPR04', question: 'टखने की बाहरी हड्डी पर दबाने से तेज़ दर्द है?', questionEn: 'Severe tenderness when pressing the outer ankle bone?' }, // idx 52
    // SPR05 घुटने में मोड़
    { complaintCode: 'SPR05', question: 'घुटना पूरा सीधा हो पाता है या थोड़ा मुड़ा ही रहता है?', questionEn: 'Can the knee straighten fully, or does it stay slightly bent?' }, // idx 53
    { complaintCode: 'SPR05', question: 'घुटना मोड़ते समय क्लिक या जाम होने जैसा लगता है?', questionEn: 'Any click or locking feeling while bending the knee?' }, // idx 54
    // SPR06 घुटना जाम/आवाज़
    { complaintCode: 'SPR06', question: 'घुटना जाम होना कितनी बार होता है?', questionEn: 'How often does the knee lock?' }, // idx 55
    { complaintCode: 'SPR06', question: 'बैठकर उठते समय या सीढ़ी पर दर्द ज्यादा है?', questionEn: 'More pain on getting up from sitting, or on stairs?' }, // idx 56
    // SPR07 पिंडली चलते दर्द
    { complaintCode: 'SPR07', question: 'कितनी दूर चलने पर दर्द शुरू होता है और रुकने से राहत?', questionEn: 'After how much walking does the pain start, and is it relieved by rest?' }, // idx 57
    { complaintCode: 'SPR07', question: 'पैरों में सुन्नपन या ठंडक भी महसूस होती है?', questionEn: 'Any numbness or coldness of the feet as well?' }, // idx 58
    // SPR08 पुरानी चोट
    { complaintCode: 'SPR08', question: 'चोट को कितना समय बीत चुका है?', questionEn: 'How long ago was the injury?' }, // idx 59
    { complaintCode: 'SPR08', question: 'उसी हाथ/पैर पर रोज़ ज्यादा काम पड़ता है?', questionEn: 'Does the same limb get heavy daily use?' }, // idx 60
    // FRC01 फ्रैक्चर शंका
    { complaintCode: 'FRC01', question: 'चोट के बाद वज़न डाल पाते हैं या हिला नहीं पाते?', questionEn: 'After the injury, can you bear weight or move the part?' }, // idx 61
    { complaintCode: 'FRC01', question: 'अंग की आकृति टेढ़ी है या टूटने की आवाज़ आई थी?', questionEn: 'Is the limb deformed, or was a crack sound heard?' }, // idx 62
    { complaintCode: 'FRC01', question: 'चोट कहां लगी — हाथ, पैर, कूल्हे या कंधे पर?', questionEn: 'Where is the injury — hand, leg, hip or shoulder?' }, // idx 63
    // FRC02 प्लास्टर में दर्द/सुन्नपन
    { complaintCode: 'FRC02', question: 'प्लास्टर के अंदर उंगलियों में सुन्नपन, नीलापन या बहुत तेज़ दर्द?', questionEn: 'Numbness, blueness or severe pain inside the cast?' }, // idx 64
    { complaintCode: 'FRC02', question: 'प्लास्टर से गंध आती है या दर्द बढ़ रहा है?', questionEn: 'Any smell from the cast, or pain that keeps increasing?' }, // idx 65
    // FRC03 प्लास्टर हटने के बाद
    { complaintCode: 'FRC03', question: 'प्लास्टर कब हटा और जोड़ कितना अकड़ा है?', questionEn: 'When was the cast removed, and how stiff is the joint?' }, // idx 66
    { complaintCode: 'FRC03', question: 'रोज़ जोड़ घुमाने और मालिश की कोशिश करते हैं?', questionEn: 'Are you doing daily joint movements and massage?' }, // idx 67
    // FRC04 भरने की जांच
    { complaintCode: 'FRC04', question: 'आखरी X-ray कब हुई और किस अंग की थी?', questionEn: 'When was the last X-ray, and of which part?' }, // idx 68
    { complaintCode: 'FRC04', question: 'टूटी जगह पर दर्द या दबाने पर दिक्कत अब कितनी है?', questionEn: 'How much pain or tenderness remains at the fracture site?' }, // idx 69
    // FRC05 ऑपरेशन के बाद
    { complaintCode: 'FRC05', question: 'ऑपरेशन कब हुआ और टांके/घाव की हालत कैसी है?', questionEn: 'When was the surgery, and how are the stitches/wound?' }, // idx 70
    { complaintCode: 'FRC05', question: 'घाव पर लाली, पानी निकलना या बुखार है?', questionEn: 'Wound redness, discharge or fever?' }, // idx 71
    // FRC06 बच्चे की खिंची कोहनी
    { complaintCode: 'FRC06', question: 'बच्चा हाथ नीचे लटकाए झुकाकर रो रहा है?', questionEn: 'Is the child crying, holding the arm still and bent?' }, // idx 72
    { complaintCode: 'FRC06', question: 'हाथ खींचे जाने के बाद शुरू हुआ?', questionEn: 'Did it start after the arm was pulled?' }, // idx 73
    // BNH01 कैल्शियम पूछताछ
    { complaintCode: 'BNH01', question: 'पहले कभी कैल्शियम/विटामिन D की जांच कराई है?', questionEn: 'Have you ever been tested for calcium/vitamin D?' }, // idx 74
    { complaintCode: 'BNH01', question: 'दूध, दही या हरी सब्जियां रोज़ खाते हैं?', questionEn: 'Do you take milk, curd or green vegetables daily?' }, // idx 75
    // BNH02 ऑस्टियोपोरोसिस जांच
    { complaintCode: 'BNH02', question: 'कद घटा है या पीठ झुक गई है?', questionEn: 'Any height loss or stooped back?' }, // idx 76
    { complaintCode: 'BNH02', question: 'मां या बहन को ऑस्टियोपोरोसिस या कूल्हे का फ्रैक्चर रहा है?', questionEn: 'Mother or sister with osteoporosis or a hip fracture?' }, // idx 77
    // BNH03 छोटी गिराव से टूट
    { complaintCode: 'BNH03', question: 'फ्रैक्चर कब और किस जगह हुआ था?', questionEn: 'When and where was the fracture?' }, // idx 78
    { complaintCode: 'BNH03', question: 'आखरी विटामिन D / DEXA जांच कब कराई थी?', questionEn: 'When was the last vitamin D / DEXA test done?' }, // idx 79
    // BNH04 रात की ऐंठन
    { complaintCode: 'BNH04', question: 'ऐंठन रात के किस समय आती है?', questionEn: 'At what time of night do the cramps come?' }, // idx 80
    { complaintCode: 'BNH04', question: 'दिन में पानी कितना पीते हैं?', questionEn: 'How much water do you drink during the day?' }, // idx 81
    // BNH05 शरीर भर में दर्द
    { complaintCode: 'BNH05', question: 'दर्द पूरे शरीर में है या किसी एक जगह?', questionEn: 'Is the pain all over the body or at one spot?' }, // idx 82
    { complaintCode: 'BNH05', question: 'धूप में कितने निकलते हैं?', questionEn: 'How much do you go out in the sun?' }, // idx 83
    // NRV01 रात में हाथ सुन्न
    { complaintCode: 'NRV01', question: 'कौन सी उंगलियां सुन्न होती हैं?', questionEn: 'Which fingers go numb?' }, // idx 84
    { complaintCode: 'NRV01', question: 'हाथ हिलाने/झटकने से सुन्नपन घट जाता है?', questionEn: 'Does shaking the hand relieve the numbness?' }, // idx 85
    // NRV02 पैरों में सुन्नपन
    { complaintCode: 'NRV02', question: 'शुगर या शराब का कोई इतिहास है?', questionEn: 'Any history of diabetes or alcohol use?' }, // idx 86
    { complaintCode: 'NRV02', question: 'मोज़े पहने जैसा लगता है या रात में जलन बढ़ती है?', questionEn: 'A sock-like feeling, or burning worse at night?' }, // idx 87
    // NRV03 झनझनाहट
    { complaintCode: 'NRV03', question: 'किन अंगों में और कब से झनझनाहट है?', questionEn: 'Which limbs tingle, and since when?' }, // idx 88
    { complaintCode: 'NRV03', question: 'कमर/गर्दन का दर्द भी साथ है?', questionEn: 'Any back/neck pain along with it?' }, // idx 89
    // OTH01 फ्लैट फीट
    { complaintCode: 'OTH01', question: 'पैर का तला पूरा ज़मीन पर लगता है या जूते अंदर से घिसते हैं?', questionEn: 'Does the whole sole touch the ground, or do shoes wear out on the inner side?' }, // idx 90
    { complaintCode: 'OTH01', question: 'लंबा चलने या खड़े रहने के बाद दर्द/थकान होती है?', questionEn: 'Pain or tiredness after long walking or standing?' }, // idx 91
    // OTH02 मांसपेशी ऐंठन
    { complaintCode: 'OTH02', question: 'ऐंठन कब आती है — खेल/पसीने में या आराम के समय?', questionEn: 'When do cramps come — during sport/sweating or at rest?' }, // idx 92
    { complaintCode: 'OTH02', question: 'पानी और नमक का सेवन कैसा रहता है?', questionEn: 'How is your water and salt intake?' }, // idx 93
    // OTH03 चलने में सहारा
    { complaintCode: 'OTH03', question: 'बिना सहारे कितनी दूर चल पाते हैं?', questionEn: 'How far can you walk without support?' }, // idx 94
    { complaintCode: 'OTH03', question: 'घर में फिसलन वाली जगहें (बाथरूम/सीढ़ियां) सुरक्षित हैं?', questionEn: 'Are slippery spots at home (bathroom/stairs) made safe?' }, // idx 95
    // OTH04 आर्थराइटिस फॉलो-अप
    { complaintCode: 'OTH04', question: 'पिछली दवाओं से कितना आराम मिला?', questionEn: 'How much relief did the previous medicines give?' }, // idx 96
    { complaintCode: 'OTH04', question: 'दर्द से नींद या रोज़ के काम पर असर पड़ता है?', questionEn: 'Is sleep or daily work affected by the pain?' }, // idx 97
  ],

  // ══ Suggestions (196 — 2 per question; questionIndex from array above) ══
  suggestions: [
    // SPN01 q0 / q1 / q2
    { questionIndex: 0, text: '2 हफ्ते से कम का दर्द — तीव्र मांसपेशी दर्द: गर्म सेक दिन में 2 बार + आराम, 3-5 दिन में सुधार आम', textEn: 'Pain under 2 weeks — acute muscle pain: hot fomentation twice daily + rest; usually settles in 3-5 days' },
    { questionIndex: 0, text: '3 महीने से ज्यादा — पुराना दर्द: मुद्रा सुधार + फिजियो + X-ray कराएं', textEn: 'Beyond 3 months — chronic pain: posture correction + physio + X-ray' },
    { questionIndex: 1, text: 'खांसी/झुकने से दर्द पैर तक — डिस्क दबने की आशंका — जांच और जरूरत पर MRI सोचें', textEn: 'Coughing/bending sends pain to leg — possible disc compression — investigate, consider MRI if persistent' },
    { questionIndex: 1, text: 'दर्द कमर पर ही सीमित — मांसपेशी स्पैज्म — गर्म सेक + मुद्रा सुधार से आराम', textEn: 'Pain confined to back — muscle spasm — hot fomentation + posture correction help' },
    { questionIndex: 2, text: 'रात का बढ़ता दर्द + वजन घटना + बुखार — RED FLAG: X-ray + CBC/ESR आज कराएं, ऑर्थो रेफर (संक्रमण/गांठ की जांच)', textEn: 'Night pain + weight loss + fever — RED FLAG: X-ray + CBC/ESR today, ortho referral (infection/malignancy screen)' },
    { questionIndex: 2, text: 'रात हल्का दर्द, वजन स्थिर, बुखार नहीं — मांसपेशी/मुद्रा संबंधी संभावना — आराम से आकलन', textEn: 'Mild night pain, stable weight, no fever — likely muscular/postural — reassess with rest' },
    // SPN02 q3 / q4 / q5
    { questionIndex: 3, text: 'पिछली पिंडली तक पैर का पिछला भाग — साइटिका पैटर्न — पिंडली स्ट्रेच + जांच जारी रखें', textEn: 'Back of the thigh and calf — sciatica pattern — hamstring stretch + continue workup' },
    { questionIndex: 3, text: 'पूरा पैर या दोनों पैर — दोनों जड़ों का दबाव संभव — रीढ़ की जांच जरूरी', textEn: 'Whole leg or both legs — possible multi-root compression — spinal workup needed' },
    { questionIndex: 4, text: 'सुन्नपन साथ है — राडिकुलोपैथी की पुष्टि — 6 हफ्ते रहे तो MRI; दर्द-नस की दवा डॉक्टर सोचेंगे', textEn: 'Numbness present — confirms radiculopathy — MRI if 6+ weeks; doctor to consider nerve-pain medicine' },
    { questionIndex: 4, text: 'सिर्फ दर्द, सुन्नपन नहीं — अक्सर NSAID + आराम से 2-4 हफ्ते में सुधार', textEn: 'Pain only, no numbness — often settles in 2-4 weeks with NSAID + rest' },
    { questionIndex: 5, text: 'पेशाब/शौच नियंत्रण की कमी या जांघों के बीच सुन्नपन — EMERGENCY: आज ही न्यूरोसर्जन रेफर (cauda equina) — देर न करें', textEn: 'Loss of bladder/bowel control or saddle numbness — EMERGENCY: neurosurgeon referral TODAY (cauda equina) — do not delay' },
    { questionIndex: 5, text: 'नियंत्रण सामान्य, सुन्नपन नहीं — आम साइटिका — जांच और आराम जारी रखें', textEn: 'Control normal, no saddle numbness — ordinary sciatica — continue workup and rest' },
    // SPN03 q6 / q7
    { questionIndex: 6, text: 'महीनों का धीरे बढ़ा दर्द — घिसाव (स्पॉन्डिलोसिस) संभव — X-ray + गर्दन आइसोमेट्रिक व्यायाम शुरू करें', textEn: 'Gradual pain over months — likely spondylosis — X-ray + start neck isometric exercises' },
    { questionIndex: 6, text: '1-2 दिन का अचानक दर्द — गर्दन की मांसपेशी खिंचाव — गर्म सेक + गोल तकिया, 3-5 दिन में सुधार', textEn: 'Sudden 1-2 day pain — neck muscle strain — hot fomentation + round pillow; settles in 3-5 days' },
    { questionIndex: 7, text: 'घंटों मोबाइल/लैपटॉप — स्क्रीन आंख की लाइन पर रखें, हर 45 मिनट पर 2 मिनट ब्रेक लें', textEn: 'Long mobile/laptop hours — keep screen at eye level and take a 2-minute break every 45 minutes' },
    { questionIndex: 7, text: 'स्क्रीन कम — चोट/अकड़न जैसा — गर्म सेक + हल्का व्यायाम, न ठीक हो तो जांच', textEn: 'Low screen time — strain/stiffness type — hot fomentation + gentle exercise; investigate if not settling' },
    // SPN04 q8 / q9
    { questionIndex: 8, text: 'अंगूठे से तीसरी उंगली तक सुन्नपन — गर्दन की नस दबने की आशंका — गर्दन X-ray + जांच', textEn: 'Numbness thumb to middle finger — possible cervical nerve compression — neck X-ray + workup' },
    { questionIndex: 8, text: 'सिर्फ कंधे/बांह में — मांसपेशी दर्द ज्यादा संभावित — गर्म सेक + आराम', textEn: 'Shoulder/arm only — more likely muscular — hot fomentation + rest' },
    { questionIndex: 9, text: 'गर्दन झुकाने से हाथ में दर्द बढ़े — नस जड़ दबने का संकेत — जांच कराएं', textEn: 'Neck tilt worsens arm pain — sign of nerve-root compression — get evaluated' },
    { questionIndex: 9, text: 'मुद्रा से दर्द नहीं बदलता — मांसपेशी जकड़न — गर्म सेक + मुद्रा सुधार', textEn: 'Pain unchanged by posture — muscle stiffness — hot fomentation + posture care' },
    // SPN05 q10 / q11
    { questionIndex: 10, text: 'वजन उठाने के बाद शुरू — डिस्क चोट संभव — 2 दिन बिस्तर आराम, पैर में दर्द जाए तो जांच', textEn: 'Started after lifting — possible disc injury — 2 days bed rest; investigate if pain goes down the leg' },
    { questionIndex: 10, text: 'बिना झटके, धीरे शुरू — मुद्रा/मांसपेशी कमजोरी वाला दर्द — व्यायाम + मुद्रा सुधार', textEn: 'No jerk, gradual onset — posture/muscle weakness pattern — exercises + posture correction' },
    { questionIndex: 11, text: 'बैठने से बढ़े, लेटने से राहत — डिस्क जैसा पैटर्न — लेटकर आराम + फिजियो; बैठना कम करें', textEn: 'Worse sitting, better lying — disc-like pattern — rest lying down + physio; minimise sitting' },
    { questionIndex: 11, text: 'लेटने से भी दर्द रहे — मेकैनिकल/जोड़ दर्द — गर्म सेक + मुद्रा बदलते रहें', textEn: 'Pain even on lying — mechanical/joint pain — hot fomentation + keep changing position' },
    // SPN06 q12 / q13
    { questionIndex: 12, text: 'बैठने से बढ़ता दर्द — कोक्सीडायनिया — छेद/गद्देदार (donut) कुशन पर बैठें + गर्म पानी का सिज़ बाथ', textEn: 'Pain worse on sitting — coccydynia — use a donut cushion + warm sitz bath' },
    { questionIndex: 12, text: 'खड़े होने पर ज्यादा — कूल्हे/रीढ़ की जांच कराएं', textEn: 'Worse on standing — get hip/spine evaluated' },
    { questionIndex: 13, text: 'गिरने/प्रसव के बाद शुरू — दुम की हड्डी की चोट — गर्म सिज़ बाथ + कुशन; तेज़ दर्द हो तो X-ray', textEn: 'Started after fall/childbirth — coccyx injury — warm sitz bath + cushion; X-ray if severe' },
    { questionIndex: 13, text: 'धीरे-धीरे शुरू — बैठने की मुद्रा और कुर्सी सुधारें — नरम सीट से बचें', textEn: 'Gradual onset — correct sitting posture and chair — avoid soft seats' },
    // SPN07 q14 / q15
    { questionIndex: 14, text: '6+ घंटे लगातार बैठना — हर 45 मिनट उठकर 2 मिनट टहलें, कुर्सी में बैकरेस्ट सहारा रखें', textEn: '6+ hours continuous sitting — stand and walk 2 minutes every 45 minutes; use a backrest support' },
    { questionIndex: 14, text: '3 घंटे से कम — अच्छी आदत — बीच-बीच में ब्रेक और रीढ़ व्यायाम जारी रखें', textEn: 'Under 3 hours — good habit — keep taking breaks and doing spine exercises' },
    { questionIndex: 15, text: 'स्क्रीन नीचे/ऊपर — ऊंचाई ठीक करें: ऊपरी किनारा आंख की लाइन पर, कीबोर्ड कोहनी की ऊंचाई पर', textEn: 'Screen too low/high — fix ergonomics: top edge at eye level, keyboard at elbow height' },
    { questionIndex: 15, text: 'सेटिंग ठीक है — बस ब्रेक और गर्दन-कमर व्यायाम जोड़ें', textEn: 'Setup already right — just add breaks and neck/back exercises' },
    // JNT01 q16 / q17 / q18
    { questionIndex: 16, text: 'सीढ़ी पर बढ़ता दर्द — घुटने की घिसाव पैटर्न — क्वाड्रिसेप्स (जांघ की मांसपेशी) व्यायाम रोज़ शुरू करें', textEn: 'Worse on stairs — knee-osteoarthritis pattern — start daily quadriceps exercises' },
    { questionIndex: 16, text: 'समतल चलने में भी दर्द — भीतरी चोट/सूजन जांचें — बिना जांच लंबी दवा न लें', textEn: 'Pain even on flat walking — check for internal injury/effusion — avoid long medicines without workup' },
    { questionIndex: 17, text: 'आवाज़ बिना दर्द — उम्र के साथ आम — चिंता नहीं, व्यायाम जारी रखें', textEn: 'Crepitus without pain — common with age — no worry, continue exercises' },
    { questionIndex: 17, text: 'आवाज़ + दर्द/सूजन — घिसाव की आशंका — खड़े होकर X-ray से ग्रेड देखें', textEn: 'Crepitus with pain/swelling — likely OA — standing X-ray to grade it' },
    { questionIndex: 18, text: 'जकड़न 30 मिनट से कम — घिसाव (OA) की ओर — वजन घटाएं + क्वाड्रिसेप्स मजबूत करें', textEn: 'Stiffness under 30 minutes — points to OA — lose weight + strengthen quads' },
    { questionIndex: 18, text: 'जकड़न 30-60 मिनट या ज्यादा — इम्यून गठिया की जांच (RA factor/anti-CCP, CBC/ESR) कराएं', textEn: 'Stiffness 30-60 min or more — test for inflammatory arthritis (RA factor/anti-CCP, CBC/ESR)' },
    // JNT02 q19 / q20
    { questionIndex: 19, text: 'छोटे जोड़ (उंगलियां/कलाई) में दर्द — RA स्क्रीन कराएं — जांच के बिना स्टेरॉयड दवा कभी न लें', textEn: 'Small joints (fingers/wrists) — get RA screen — never take steroids without workup' },
    { questionIndex: 19, text: 'बड़े जोड़ (घुटने/कूल्हे) — घिसाव संभावित — X-ray + मांसपेशी व्यायाम', textEn: 'Large joints (knees/hips) — likely osteoarthritis — X-ray + muscle strengthening' },
    { questionIndex: 20, text: 'दर्द जोड़ बदलता रहता है — माइग्रेटरी पैटर्न — वायरल/इम्यून कारण की जांच कराएं', textEn: 'Pain keeps shifting joints — migratory pattern — investigate viral/inflammatory causes' },
    { questionIndex: 20, text: 'एक ही जोड़ में स्थिर — स्थानीय कारण — उसी जोड़ की जांच कराएं', textEn: 'Fixed in one joint — local cause — get that joint examined' },
    // JNT03 q21 / q22
    { questionIndex: 21, text: 'तेज़ लाली + गर्माहट + बुखार — सेप्टिक आर्थराइटिस खतरा — उसी दिन ऑर्थो रेफर (जोड़ से पानी की जांच)', textEn: 'Marked redness + warmth + fever — septic arthritis risk — ortho referral SAME DAY (joint aspiration)' },
    { questionIndex: 21, text: 'बिना बुखार — गाउट/प्रतिक्रियात्मक सूजन सोचें — यूरिक एसिड जांच शाम को भी करा सकते हैं', textEn: 'No fever — consider gout/reactive swelling — serum uric acid test can be done' },
    { questionIndex: 22, text: 'एक जोड़ में तेज़ सूजन — गाउट/संक्रमण जांच — यूरिक एसिड + CBC कराएं', textEn: 'Single hot swollen joint — gout/infection workup — uric acid + CBC' },
    { questionIndex: 22, text: 'कई जोड़ों में सूजन — इम्यून गठिया स्क्रीन — रूमैटोलॉजिस्ट रेफर', textEn: 'Swelling in many joints — inflammatory arthritis screen — rheumatology referral' },
    // JNT04 q23 / q24
    { questionIndex: 23, text: 'जकड़न 30 मिनट से कम — घिसाव जैसा — गर्म सेक + हल्की गतिविधि अच्छी लगती है', textEn: 'Stiffness under 30 minutes — OA-like — hot fomentation + gentle activity helps' },
    { questionIndex: 23, text: 'जकड़न 1 घंटा+ — इम्यून गठिया की जांच जरूरी — जल्दी इलाज जोड़ बचाता है', textEn: 'Stiffness 1 hour+ — inflammatory arthritis workup essential — early treatment saves joints' },
    { questionIndex: 24, text: 'हिलने से जकड़न घटे — इन्फ्लेमेटरी पैटर्न — जांच (RA factor, ESR) कराएं', textEn: 'Stiffness eases with movement — inflammatory pattern — get tested (RA factor, ESR)' },
    { questionIndex: 24, text: 'हिलने से जकड़न बढ़े — मेकैनिकल — आराम + मुद्रा सुधार से लाभ', textEn: 'Stiffness worsens with activity — mechanical — rest + posture correction help' },
    // JNT05 q25 / q26 / q27
    { questionIndex: 25, text: 'पीठ/सिर तक हाथ नहीं जाता — फ्रोजन कंधा — कंधा व्यायाम + फिजियो शुरू करें; बहुत दर्द में डॉक्टर इंजेक्शन (प्रोसीजर) सोचते हैं', textEn: 'Cannot reach back/overhead — frozen shoulder — start shoulder exercises + physio; doctor may consider an injection (procedure) if severe' },
    { questionIndex: 25, text: 'लगभग पूरा हिलता है — जकड़न कम — मांसपेशी दर्द ज्यादा संभावित — सेक + व्यायाम', textEn: 'Near-full movement — mild stiffness — likely muscular — fomentation + exercises' },
    { questionIndex: 26, text: 'रात में उस तरफ लेटने से तेज़ — फ्रोजन कंधे में आम — दूसरी तरफ लेटें, तकिया कंधे के नीचे सहारा', textEn: 'Night pain lying on that side — typical of frozen shoulder — lie on the other side, pillow for support' },
    { questionIndex: 26, text: 'रात सामान्य — गतिविधि पर दर्द — हल्का — आराम + व्यायाम से सुधार', textEn: 'Night pain absent — pain on activity only — mild — improves with rest + exercise' },
    { questionIndex: 27, text: 'शुगर/थायराइड है — फ्रोजन कंधा ज्यादा होता है — शुगर नियंत्रण + नियमित फिजियो जरूरी', textEn: 'Diabetes/thyroid present — frozen shoulder is commoner — sugar control + regular physio essential' },
    { questionIndex: 27, text: 'शुगर नहीं — सामान्य कोर्स — व्यायाम से 6-9 महीने में धीरे-धीरे सुधार', textEn: 'No diabetes — natural course — gradual recovery over 6-9 months with exercises' },
    // JNT06 q28 / q29
    { questionIndex: 28, text: 'हथेली नीचे कर उठाने पर दर्द — टेनिस एल्बो — काउंटरफोर्स बैंड (ब्रेस) + भारी काम बंद', textEn: 'Pain lifting with palm down — tennis elbow — counterforce brace + stop heavy work' },
    { questionIndex: 28, text: 'ऊपर उठाने पर दर्द — कंधे/नस की जांच कराएं', textEn: 'Pain on overhead lifting — get shoulder/nerve evaluated' },
    { questionIndex: 29, text: 'बाहरी टीले पर दबाव-दर्द — लेटरल एपिकोंडाइलाइटिस — बैंड + कोहनी स्ट्रेच; ठीक न हो तो इंजेक्शन (प्रोसीजर) विकल्प', textEn: 'Tender outer elbow point — lateral epicondylitis — brace + elbow stretch; injection (procedure) if refractory' },
    { questionIndex: 29, text: 'अंदरूनी हिस्से में दर्द — गोल्फर एल्बो/नस दबना — जांच कराएं', textEn: 'Pain on inner side — golfers elbow/nerve entrapment — get examined' },
    // JNT07 q30 / q31
    { questionIndex: 30, text: 'कलाई पर गांठ/सूजन — गैंगलियॉन या साइनोवाइटिस — अल्ट्रासाउंड जांच कराएं', textEn: 'Lump/swelling on wrist — ganglion or synovitis — get an ultrasound' },
    { questionIndex: 30, text: 'बिना सूजन — मांसपेशी/नस दर्द — विश्राम + स्प्लिंट सोचें', textEn: 'No swelling — muscle/nerve pain — rest + consider a splint' },
    { questionIndex: 31, text: 'रात में सुन्नपन + चीज़ें गिरना — कार्पल टनल सिंड्रोम — रात का स्प्लिंट + नस जांच', textEn: 'Night numbness + dropping objects — carpal tunnel syndrome — night splint + nerve testing' },
    { questionIndex: 31, text: 'दिन में हल्का सुन्नपन — गर्दन/मुद्रा का ध्यान दें — गर्दन व्यायाम', textEn: 'Mild daytime numbness — check neck/posture — neck exercises' },
    // JNT08 q32 / q33
    { questionIndex: 32, text: 'सुबह पहले कदम पर तेज़ दर्द — प्लांटर फेशियाइटिस — बर्फ की बोतल रोल + बिस्तर से उठते ही कैफ स्ट्रेच', textEn: 'Sharp pain on first morning steps — plantar fasciitis — frozen-bottle rolling + calf stretch before rising' },
    { questionIndex: 32, text: 'दिन भर दर्द — एड़ी की चर्बी/स्पर जांच — X-ray एड़ी (साइड से)', textEn: 'All-day pain — heel pad/spur — lateral heel X-ray' },
    { questionIndex: 33, text: 'एड़ी के नीचे दर्द — प्लांटर फेशिया — मुलायम/MCR सोल + स्ट्रेच', textEn: 'Pain under the heel — plantar fascia — soft/MCR sole + stretching' },
    { questionIndex: 33, text: 'पीछे (एकिलीज़ पर) — टेंडिनाइटिस — गोल-एड़ी जूता + एकिलीज़ स्ट्रेच, भागना बंद', textEn: 'Pain at back (Achilles) — tendinitis — cushioned-heel shoe + Achilles stretch; stop running' },
    // JNT09 q34 / q35
    { questionIndex: 34, text: 'कांख/जांघ के अंदर दर्द — कूल्हे की घिसाव जांच — कूल्हे का X-ray', textEn: 'Groin-side pain — hip osteoarthritis workup — hip X-ray' },
    { questionIndex: 34, text: 'बाहरी दर्द — ट्रॉकेंटेरिक बर्साइटिस संभावित — सोने की मुद्रा बदलें + सेक', textEn: 'Outer-side pain — trochanteric bursitis likely — change sleeping position + fomentation' },
    { questionIndex: 35, text: 'चलते समय लंगड़ापन — दर्द से बचाव — सहारा लें और जांच पूरी कराएं', textEn: 'Limp while walking — pain avoidance — use a support and complete the workup' },
    { questionIndex: 35, text: 'चाल सामान्य — हल्का दर्द — आराम + सेक से आराम', textEn: 'Normal gait — mild pain — settles with rest + fomentation' },
    // JNT10 q36 / q37
    { questionIndex: 36, text: 'दोनों टखनों में — वजन/घिसाव या शुगर की जांच कराएं', textEn: 'Both ankles — check weight/wear or diabetes' },
    { questionIndex: 36, text: 'एक टखना — स्थानीय कारण (नस/जोड़) — उसी की जांच', textEn: 'One ankle — local cause (tendon/joint) — examine that side' },
    { questionIndex: 37, text: 'बार-बार आती-जाती सूजन — गाउट/इम्यून जांच — यूरिक एसिड कराएं', textEn: 'Recurrent swelling — gout/inflammatory workup — test serum uric acid' },
    { questionIndex: 37, text: 'एक बार की सूजन — छिपी चोट पूछें — आराम + ऊंचा रखें', textEn: 'One-off swelling — ask about forgotten injury — rest + elevate' },
    // JNT11 q38 / q39
    { questionIndex: 38, text: 'अंगूठा सिकोड़कर कलाई झुकाने पर दर्द — De Quervain — अंगूठा स्प्लिंट + अंगूठे का आराम', textEn: 'Pain on wrist bend with thumb tucked — De Quervain — thumb spica splint + rest' },
    { questionIndex: 38, text: 'नहीं — कलाई/कार्पल टनल की जांच कराएं', textEn: 'Negative — evaluate wrist/carpal tunnel' },
    { questionIndex: 39, text: 'नई मां — बच्चा उठाने से होता है — उठाने की सही तकनीक + स्प्लिंट से ठीक होता है', textEn: 'New mother — lifting-baby overuse — correct lifting technique + splint usually resolves it' },
    { questionIndex: 39, text: 'संबंध नहीं — मांसपेशी दर्द — आराम + सेक', textEn: 'Unrelated — muscular pain — rest + fomentation' },
    // JNT12 q40 / q41
    { questionIndex: 40, text: 'छोटे जोड़ों में 30 मिनट+ सुबह जकड़न — RA स्क्रीन कराएं — RF/anti-CCP + रूमैटोलॉजिस्ट रेफर', textEn: '30+ min morning stiffness in small joints — RA screen — RF/anti-CCP + rheumatology referral' },
    { questionIndex: 40, text: 'जकड़न कम/नहीं — मेकैनिकल दर्द ज्यादा संभावित — व्यायाम + मुद्रा', textEn: 'Little or no stiffness — mechanical pain more likely — exercises + posture' },
    { questionIndex: 41, text: 'परिवार में RA — जोखिम ज्यादा — जांच जल्दी कराएं, लक्षण न बढ़ने दें', textEn: 'Family history of RA — higher risk — test early, do not let symptoms progress' },
    { questionIndex: 41, text: 'परिवार में नहीं — अन्य कारण जांचें — डॉक्टर आकलन करेंगे', textEn: 'No family history — look for other causes — doctor assessment' },
    // JNT13 q42 / q43
    { questionIndex: 42, text: 'बार-बार के दौरे — गाउट की पुष्टि जरूरी — दौरा शांत होने के 2 हफ्ते बाद यूरिक एसिड जांच', textEn: 'Repeated attacks — confirm gout — check serum uric acid 2 weeks AFTER the flare settles' },
    { questionIndex: 42, text: 'पहला दौरा — जांच + डाइट सलाह — पानी 3 लीटर रोज़', textEn: 'First attack — workup + diet advice — 3 litres water daily' },
    { questionIndex: 43, text: 'शराब/मांस ज्यादा — गाउट के ट्रिगर — बंद करें + दालें/मसूर सीमित करें + पानी भरपूर', textEn: 'Heavy alcohol/meat — gout triggers — stop them, limit pulses/lentils, plenty of water' },
    { questionIndex: 43, text: 'डाइट सामान्य — अन्य कारण (नस/जोड़) जांचें', textEn: 'Diet normal — evaluate other causes (tendon/joint)' },
    // SPR01 q44 / q45
    { questionIndex: 44, text: 'मोड़/खिंचाव — RICE दें: आराम + बर्फ (कपड़े में 15 मिनट) + पट्टी + अंग ऊंचा — पहले 48 घंटे', textEn: 'Twist/strain — RICE: Rest + Ice (15 min over cloth) + Compression + Elevation — first 48 hours' },
    { questionIndex: 44, text: 'सीधी टक्कर — बर्फ + दबाव पट्टी; गांठ या न चल पाना हो तो X-ray', textEn: 'Direct blow — ice + compression bandage; X-ray if lump or cannot move' },
    { questionIndex: 45, text: 'तुरंत सूजन — नस/हड्डी की गंभीर चोट संभव — बर्फ + आराम + X-ray सोचें', textEn: 'Immediate swelling — possible serious soft-tissue/bone injury — ice + rest + consider X-ray' },
    { questionIndex: 45, text: 'अगले दिन सूजन — मांसपेशी खिंचाव — 48 घंटे बाद गर्म सेक शुरू करें', textEn: 'Next-day swelling — muscle strain — start hot fomentation after 48 hours' },
    // SPR02 q46 / q47 / q48
    { questionIndex: 46, text: 'चोट के अंग की स्प्लिंट/पट्टी करें — उसी दिन X-ray कराएं — खरोंच पर एंटीसेप्टिक + टेटनस इंजेक्शन लें', textEn: 'Splint/bandage the injured part — X-ray same day — antiseptic on abrasions + ensure tetanus injection' },
    { questionIndex: 46, text: 'हल्की चोट — RICE + 48 घंटे निगरानी — दर्द/सूजन बढ़े तो फौरन जांच', textEn: 'Minor injury — RICE + 48-hour watch — immediate workup if pain/swelling increases' },
    { questionIndex: 47, text: 'सिर चकराना/उल्टी/बेहोशी — सिर की चोट — तुरंत इमरजेंसी, CT स्कैन जरूरी', textEn: 'Giddiness/vomiting/blackout — head injury — emergency NOW, CT scan needed' },
    { questionIndex: 47, text: 'कोई लक्षण नहीं — 24 घंटे निगरानी रखें — बार-बार जगाकर देखें, बिगड़े तो इमरजेंसी', textEn: 'No symptoms — observe 24 hours — wake and check repeatedly; emergency if deteriorating' },
    { questionIndex: 48, text: 'चल नहीं पाते — फ्रैक्चर की आशंका — X-ray आज ही + सहारा/स्प्लिंट लेकर आएं', textEn: 'Unable to walk — suspect fracture — X-ray today + arrive with a splint/support' },
    { questionIndex: 48, text: 'चल पाते हैं — गहरी टूट कम संभावित — फिर भी 48 घंटे देखें, दर्द रहे तो X-ray', textEn: 'Can walk — significant fracture less likely — still watch 48 hours; X-ray if pain persists' },
    // SPR03 q49 / q50
    { questionIndex: 49, text: '1-2 घंटे में तेज़ सूजन — गंभीर ऊतक चोट — बर्फ + पट्टी + ऊंचा रखें, जांच जरूरी', textEn: 'Rapid swelling within 1-2 hours — significant tissue injury — ice + bandage + elevation; get examined' },
    { questionIndex: 49, text: 'अगले दिन धीमी सूजन — मांसपेशी खिंचाव — गर्म सेक 48 घंटे बाद + पट्टी', textEn: 'Slow next-day swelling — muscle strain — hot fomentation after 48 hours + bandage' },
    { questionIndex: 50, text: 'गर्म+लाल सूजन या खरोंच — घाव साफ कर एंटीसेप्टिक लगाएं; बुखार आए तो तुरंत जांच', textEn: 'Warm/red swelling or abrasion — clean wound and apply antiseptic; urgent review if fever appears' },
    { questionIndex: 50, text: 'त्वचा सामान्य — बर्फ सेक + सूजन की जेल (डॉक्टर से पूछें) — अंग ऊंचा रखें', textEn: 'Skin intact — ice + anti-swelling gel (ask doctor) — keep limb elevated' },
    // SPR04 q51 / q52
    { questionIndex: 51, text: 'चलना लगभग नामुमकिन — गंभीर मोच या फ्रैक्चर — X-ray + पट्टी (बैंडेज)', textEn: 'Walking nearly impossible — severe sprain or fracture — X-ray + bandage' },
    { questionIndex: 51, text: 'हल्का दर्द में चल पाते — ग्रेड 1 मोच — पट्टी + आराम 3-5 दिन, फिर हल्का व्यायाम', textEn: 'Can walk with mild pain — grade 1 sprain — bandage + rest 3-5 days, then gentle exercises' },
    { questionIndex: 52, text: 'बाहरी हड्डी पर तेज़ दबाव-दर्द — फ्रैक्चर निकालने के लिए X-ray कराएं', textEn: 'Marked tenderness over outer ankle bone — X-ray to rule out fracture' },
    { questionIndex: 52, text: 'हल्का दर्द — लिगामेंट मोच — पट्टी + बर्फ, 2 हफ्ते में सुधार आम', textEn: 'Mild tenderness — ligament sprain — bandage + ice; usually settles in 2 weeks' },
    // SPR05 q53 / q54
    { questionIndex: 53, text: 'घुटना पूरा सीधा नहीं होता — भीतर सूजन/मेनिस्कस चोट संभावित — आराम + जांच कराएं', textEn: 'Knee will not straighten fully — possible effusion/meniscal injury — rest + get examined' },
    { questionIndex: 53, text: 'पूरा सीधा होता है — छोटी चोट — 48 घंटे बर्फ + पट्टी, निगरानी रखें', textEn: 'Straightens fully — minor injury — ice + bandage for 48 hours, keep watch' },
    { questionIndex: 54, text: 'क्लिक + जाम होना — मेनिस्कस की चोट — जांच और जरूरत पर MRI सोचें', textEn: 'Click with locking — meniscal injury — examine and consider MRI if needed' },
    { questionIndex: 54, text: 'सिर्फ हल्की आवाज़, दर्द नहीं — सामान्य क्लिक — क्वाड्रिसेप्स मजबूत करते रहें', textEn: 'Click only, no pain — benign crepitus — keep strengthening quadriceps' },
    // SPR06 q55 / q56
    { questionIndex: 55, text: 'हफ्ते में कई बार जाम — मेनिस्कस/खुला टुकड़ा संभावित — ऑर्थो जांच जरूरी', textEn: 'Locks several times a week — possible meniscal tear/loose body — ortho evaluation needed' },
    { questionIndex: 55, text: 'महीने में एक-दो बार — निगरानी + जांघ की मांसपेशी व्यायाम जारी रखें', textEn: 'Once or twice a month — observe + continue thigh-muscle exercises' },
    { questionIndex: 56, text: 'बैठकर उठना मुश्किल — घिसाव/मेनिस्कस की आशंका — खड़े होकर X-ray + क्वाड्रिसेप्स व्यायाम', textEn: 'Difficulty rising from sitting — OA/meniscal suspicion — standing X-ray + quad exercises' },
    { questionIndex: 56, text: 'सीढ़ी पर ज्यादा — घुटने की घिसाव पैटर्न — वजन नियंत्रण + सीढ़ियां कम', textEn: 'Worse on stairs — knee OA pattern — weight control + fewer stairs' },
    // SPR07 q57 / q58
    { questionIndex: 57, text: 'थोड़ी दूर चलने पर दर्द + रुकने से राहत — क्लॉडिकेशन — वाहिका (नस-धमनी) जांच के लिए रेफर करें', textEn: 'Pain after short walk, relieved by rest — claudication — refer for vascular workup' },
    { questionIndex: 57, text: 'लंबी दूरी के बाद ही दर्द — मांसपेशी/नस की थकान — पिंडली स्ट्रेच + आराम', textEn: 'Pain only after long walks — muscle/nerve fatigue — calf stretch + rest' },
    { questionIndex: 58, text: 'सुन्नपन/ठंडक साथ — रीढ़ की नस या धमनी की जांच जरूरी — डॉक्टर आकलन करेंगे', textEn: 'Numbness/coldness present — spinal nerve or artery workup needed — doctor assessment' },
    { questionIndex: 58, text: 'बिना सुन्नपन — मांसपेशी थकान — पानी + आराम से ठीक', textEn: 'No numbness — muscle fatigue — settles with hydration + rest' },
    // SPR08 q59 / q60
    { questionIndex: 59, text: '3 महीने से ज्यादा पुरानी चोट — पुराना दर्द — फिजियो + जांच (हड्डी जुड़ी या नस ठीक?)', textEn: 'Injury over 3 months old — chronic pain — physio + review (union/nerve status)' },
    { questionIndex: 59, text: '2-6 हफ्ते की चोट — सामान्य भराई समय — रोज़ व्यायाम करते रहें', textEn: 'Injury 2-6 weeks old — normal healing window — continue daily exercises' },
    { questionIndex: 60, text: 'वही अंग रोज़ ज्यादा काम पर — ओवरलोड — काम बांटें, बीच में आराम दें', textEn: 'Same limb heavily used daily — overload — distribute the work, rest in between' },
    { questionIndex: 60, text: 'काम सामान्य — जुड़ने में देरी की जांच कराएं (धूम्रपान/विटामिन D)', textEn: 'Normal workload — investigate delayed healing (smoking/vitamin D)' },
    // FRC01 q61 / q62 / q63
    { questionIndex: 61, text: 'वज़न नहीं डाल पाते — फ्रैक्चर की तलाश — आज ही X-ray कराएं, अंग को स्प्लिंट पर रखें', textEn: 'Unable to bear weight — suspect fracture — X-ray today, keep the limb splinted' },
    { questionIndex: 61, text: 'वज़न डाल पाते हैं — गहरी टूट कम संभावित — 48 घंटे निगरानी, दर्द रहे तो X-ray', textEn: 'Can bear weight — significant fracture less likely — 48-hour watch; X-ray if pain persists' },
    { questionIndex: 62, text: 'आकृति टेढ़ी / आवाज़ आई थी — फ्रैक्चर लगभग पक्का — स्प्लिंट लगाकर ऑर्थो तुरंत दिखाएं', textEn: 'Deformity or crack sound — fracture almost certain — splint and see an ortho NOW' },
    { questionIndex: 62, text: 'आकृति सामान्य — मोच संभावित — बर्फ + पट्टी, सूजन रहे तो X-ray', textEn: 'No deformity — likely sprain — ice + bandage; X-ray if swelling persists' },
    { questionIndex: 63, text: 'बुज़ुर्ग में कूल्हे पर गिरना — कूल्हे की टूट का बड़ा जोखिम — चलाना/उठाना बंद, तुरंत X-ray', textEn: 'Elderly fall on hip — high risk of hip fracture — no walking/lifting, X-ray immediately' },
    { questionIndex: 63, text: 'हाथ/कंधे/पैर की चोट — स्प्लिंट कर उसी दिन X-ray कराएं', textEn: 'Hand/shoulder/leg injury — splint and X-ray the same day' },
    // FRC02 q64 / q65
    { questionIndex: 64, text: 'प्लास्टर के अंदर सुन्नपन/नीलापन/बहुत तेज़ दर्द — EMERGENCY: प्लास्टर तुरंत काटवाएं (नस पर दबाव का खतरा)', textEn: 'Numbness/blueness/severe pain inside the cast — EMERGENCY: get the cast split immediately (compartment syndrome risk)' },
    { questionIndex: 64, text: 'हल्का सुई-चुभन — उंगलियां खोल-बंद करें; 2 घंटे में न घटे तो आज ही प्लास्टर दिखाएं', textEn: 'Mild pins-needles — open/close fingers; if not settling in 2 hours, show the cast today' },
    { questionIndex: 65, text: 'प्लास्टर से गंध या दर्द बढ़ रहा है — संक्रमण संभावित — आज ही ऑर्थो को दिखाएं', textEn: 'Smell from cast or increasing pain — possible infection — see the ortho today' },
    { questionIndex: 65, text: 'सामान्य लग रहा है — अंग ऊंचा रखें, उंगलियां/पैर के अंगूठे हिलाते रहें', textEn: 'Feels normal — keep limb elevated, keep moving fingers/toes' },
    // FRC03 q66 / q67
    { questionIndex: 66, text: 'प्लास्टर हाल में हटा — अकड़न सामान्य — फिजियो + रोज़ व्यायाम 4-6 हफ्ते में खुलता है', textEn: 'Cast recently removed — stiffness is normal — physio + daily exercise opens it over 4-6 weeks' },
    { questionIndex: 66, text: 'महीने हो गए फिर भी अकड़ा — तीव्र फिजियो चाहिए — ROM रिकॉर्ड करें और जांच कराएं', textEn: 'Stiff months later — needs intensive physio — record ROM and get reviewed' },
    { questionIndex: 67, text: 'रोज़ व्यायाम/मालिश नहीं कर रहे — आज से शुरू करें: गर्म सेक → जोड़ घुमाना → मालिश', textEn: 'Not doing daily exercise/massage — start today: hot fomentation → joint movement → massage' },
    { questionIndex: 67, text: 'कर रहे हैं — अच्छी प्रगति — बढ़ोतरी धीरे-धीरे करें, दर्द में नहीं', textEn: 'Already doing — good progress — increase gradually, never into pain' },
    // FRC04 q68 / q69
    { questionIndex: 68, text: 'X-ray 3 हफ्ते से पुरानी — नई कराएं — जुड़ने की प्रगति देखनी जरूरी है', textEn: 'X-ray over 3 weeks old — get a fresh one — union progress must be checked' },
    { questionIndex: 68, text: 'X-ray हाल की है — रिपोर्ट देखें — कैलस (नई हड्डी) दिखे तो जुड़ाई ठीक चल रही है', textEn: 'Recent X-ray — review the report — visible callus means union is progressing' },
    { questionIndex: 69, text: 'दबाने पर अब भी दर्द — जुड़ने में देरी (delayed union) की आशंका — ऑर्थो जांच कराएं', textEn: 'Tender at the site even now — suspect delayed union — ortho review' },
    { questionIndex: 69, text: 'दर्द लगभग नहीं — अच्छा संकेत — कैल्शियम + D3 जारी रखें, व्यायाम बढ़ाएं', textEn: 'Pain nearly gone — good sign — continue calcium + D3, advance exercises' },
    // FRC05 q70 / q71
    { questionIndex: 70, text: 'टांके हाल के हैं — घाव सूखा रखें, पट्टी रोज़ बदलें — हटाने की तारीख नोट करें', textEn: 'Recent stitches — keep wound dry, change dressing daily — note the removal date' },
    { questionIndex: 70, text: 'हफ्ते बीत गए — घाव/सूजन देखें — जांच में हीलिंग आकलन कराएं', textEn: 'Weeks since surgery — check wound/swelling — get healing assessed' },
    { questionIndex: 71, text: 'घाव पर लाली/पानी/बुखार — संक्रमण का संकेत — आज ही ऑर्थो से मिलें', textEn: 'Wound redness/discharge/fever — signs of infection — see the ortho TODAY' },
    { questionIndex: 71, text: 'घाव सूखा, बुखार नहीं — सामान्य भराई — पट्टी साफ रखें', textEn: 'Dry wound, no fever — normal healing — keep dressings clean' },
    // FRC06 q72 / q73
    { questionIndex: 72, text: 'बच्चा हाथ झुकाए पकड़े रो रहा — खिंची कोहनी (pulled elbow) — आज ही ऑर्थो से रिडक्शन कराएं', textEn: 'Child crying, holding arm bent and still — pulled elbow — get reduction done by ortho TODAY' },
    { questionIndex: 72, text: 'हाथ चला रहा है — खिंची नहीं लगती — चोट की निगरानी करें', textEn: 'Arm is being used — not a pulled elbow — watch the injury' },
    { questionIndex: 73, text: 'हाथ खींचे जाने के बाद शुरू — pulled elbow लगभग पक्का — आज रिडक्शन; खींचकर न उठाएं', textEn: 'Started after the arm was pulled — pulled elbow almost certain — reduction today; never lift by pulling' },
    { questionIndex: 73, text: 'बिना खींचे शुरू — गिरना/दूसरा कारण — जांच कराएं', textEn: 'Started without pulling — fall/other cause — get examined' },
    // BNH01 q74 / q75
    { questionIndex: 74, text: 'जांच कभी नहीं हुई — शुरू करने से पहले विटामिन D + कैल्शियम लेवल करा लें', textEn: 'Never tested — check vitamin D + calcium levels before starting supplements' },
    { questionIndex: 74, text: 'जांच हो चुकी — रिपोर्ट देखकर खुराक तय करें — बिना जांच लंबी खुराक न लें', textEn: 'Already tested — decide dose from the report — avoid long courses without testing' },
    { questionIndex: 75, text: 'दूध/दही नहीं खाते — आहार कैल्शियम कम — रोज़ 500 ml दूध/दही जोड़ें + तिल/रागी', textEn: 'No milk/curd — low dietary calcium — add 500 ml milk/curd daily + sesame/ragi' },
    { questionIndex: 75, text: 'आहार ठीक है — अच्छा — धूप और हल्का वजन-वहन व्यायाम भी जारी रखें', textEn: 'Diet is adequate — good — continue sunshine and light weight-bearing exercise' },
    // BNH02 q76 / q77
    { questionIndex: 76, text: 'कद घटा/पीठ झुकी — ऑस्टियोपोरोसिस की आशंका — DEXA (बोन डेंसिटी) जांच कराएं', textEn: 'Height loss/stooped back — suspect osteoporosis — get a DEXA (bone density) scan' },
    { questionIndex: 76, text: 'कद स्थिर — जोखिम कम — कैल्शियम + D3 + गिरने से बचाव जारी रखें', textEn: 'Height stable — lower risk — continue calcium + D3 and fall prevention' },
    { questionIndex: 77, text: 'मां/बहन में ऑस्टियोपोरोसिस या कूल्हा फ्रैक्चर — पारिवारिक जोखिम — जल्दी DEXA कराएं', textEn: 'Mother/sister with osteoporosis or hip fracture — familial risk — get DEXA early' },
    { questionIndex: 77, text: 'परिवार में नहीं — सामान्य जोखिम — आहार + धूप + सालाना जांच 60 की उम्र के बाद', textEn: 'No family history — average risk — diet + sun + annual testing after age 60' },
    // BNH03 q78 / q79
    { questionIndex: 78, text: 'कूल्हे/रीढ़ का फ्रैक्चर — ऑस्टियोपोरोसिस जांच जरूरी — DEXA + विटामिन D, दोबारा टूटने से बचाव', textEn: 'Hip/spine fracture — osteoporosis workup essential — DEXA + vitamin D; prevent re-fracture' },
    { questionIndex: 78, text: 'कलाई का फ्रैक्चर — भी कमजोर हड्डी का संकेत — जांच कराएं', textEn: 'Wrist fracture — also a sign of weak bone — get tested' },
    { questionIndex: 79, text: 'DEXA/D3 जांच कभी नहीं — अब कराएं — रिपोर्ट से इलाज तय होगा', textEn: 'Never had DEXA/D3 testing — do it now — treatment will follow the report' },
    { questionIndex: 79, text: 'पिछले साल हुई — रिपोर्ट देखें — दोहराना साल में एक बार काफी है', textEn: 'Done last year — review the report — annual repeat is enough' },
    // BNH04 q80 / q81
    { questionIndex: 80, text: 'रात के तीसरे पहर ऐंठन — कैल्शियम/मैग्नीशियम जांचें — सोने से पहले पिंडली स्ट्रेच', textEn: 'Cramps in the small hours — check calcium/magnesium — calf stretch before bed' },
    { questionIndex: 80, text: 'सोते समय कंबल में ऐंठन — पैर की पोज़िशन बदलें, चादर ढीली रखें + स्ट्रेच', textEn: 'Cramps under the blanket — change foot position, keep sheet loose + stretch' },
    { questionIndex: 81, text: 'पानी कम पीते हैं — दिन में 8-10 गिलास लें — गर्मियों में और ज्यादा', textEn: 'Drinking too little water — take 8-10 glasses a day — more in summer' },
    { questionIndex: 81, text: 'पानी पर्याप्त — नमक/इलेक्ट्रोलाइट देखें — पसीने वाले दिन में ORS/नींबू-नमक', textEn: 'Water adequate — check salts/electrolytes — ORS/lemon-salt on sweaty days' },
    // BNH05 q82 / q83
    { questionIndex: 82, text: 'पूरे शरीर में दर्द — विटामिन D/B12 की जांच कराएं — धूप + संतुलित आहार', textEn: 'Whole-body pain — test vitamin D/B12 — sunshine + balanced diet' },
    { questionIndex: 82, text: 'एक जगह दर्द — स्थानीय कारण — उसी अंग की जांच कराएं', textEn: 'Pain at one spot — local cause — get that part examined' },
    { questionIndex: 83, text: 'धूप नहीं मिलती — D की कमी संभावित — रोज़ 20 मिनट धूप + जांच कराएं', textEn: 'No sun exposure — vitamin D deficiency likely — 20 minutes sun daily + testing' },
    { questionIndex: 83, text: 'धूप मिलती है — D संभवतः ठीक — अन्य कारण (B12/थायरॉइड) जांचें', textEn: 'Getting sunshine — D probably fine — check other causes (B12/thyroid)' },
    // NRV01 q84 / q85
    { questionIndex: 84, text: 'अंगूठे से तीसरी उंगली तक सुन्नपन — कार्पल टनल — रात का स्प्लिंट + नस कंडक्शन जांच', textEn: 'Thumb to middle-finger numbness — carpal tunnel — night splint + nerve conduction study' },
    { questionIndex: 84, text: 'सिर्फ छोटी उंगली तक — कोहनी/गर्दन की नस जांचें', textEn: 'Numbness up to the little finger only — evaluate elbow/neck nerves' },
    { questionIndex: 85, text: 'हिलाने से राहत — कार्पल टनल की पुष्टि — रात में स्प्लिंट पहनकर सोएं', textEn: 'Relief on shaking — confirms carpal tunnel — sleep wearing a night splint' },
    { questionIndex: 85, text: 'हिलाने से नहीं बदलता — गर्दन/कोहनी की नस देखें', textEn: 'No change on shaking — check neck/elbow nerve' },
    // NRV02 q86 / q87
    { questionIndex: 86, text: 'शुगर/शराब का इतिहास — न्यूरोपैथी जांच — B12 + शुगर प्रोफाइल (FBS/HbA1c) कराएं', textEn: 'Diabetes/alcohol history — neuropathy workup — B12 + sugar profile (FBS/HbA1c)' },
    { questionIndex: 86, text: 'दोनों नहीं — D/B12 जांच — कारण तलाशें, रोज़ाना व्यायाम रखें', textEn: 'Neither — test D/B12 — look for the cause, stay active daily' },
    { questionIndex: 87, text: 'मोज़े जैसा + रात में बढ़ती जलन — न्यूरोपैथी पैटर्न — जांच कराएं, जरूरत में न्यूरो रेफर', textEn: 'Sock-like feeling + night burning — neuropathy pattern — get tested, neuro referral if needed' },
    { questionIndex: 87, text: 'बिना जलन — मुद्रा/नस दबना — रीढ़ की जांच कराएं', textEn: 'No burning — posture/nerve pressure — spine evaluation' },
    // NRV03 q88 / q89
    { questionIndex: 88, text: 'हाथ-पैर दोनों में — पूर्ण जांच (B12, D3, शुगर, थायरॉइड) कराएं', textEn: 'Both hands and feet — full workup (B12, D3, sugar, thyroid)' },
    { questionIndex: 88, text: 'एक ही अंग में — स्थानीय नस दबाना — उस क्षेत्र की जांच', textEn: 'Single limb — local nerve compression — examine that region' },
    { questionIndex: 89, text: 'कमर/गर्दन दर्द साथ — नस जड़ दबने की आशंका — रीढ़ जांच (X-ray, जरूरत में MRI)', textEn: 'Back/neck pain present — possible nerve-root compression — spine imaging (X-ray, MRI if needed)' },
    { questionIndex: 89, text: 'दर्द नहीं — अन्य कारण — पूर्ण न्यूरो जांच कराएं', textEn: 'No spinal pain — other cause — complete neuro workup' },
    // OTH01 q90 / q91
    { questionIndex: 90, text: 'तला पूरा ज़मीन पर लगता है / जूते अंदर से घिसते हैं — फ्लैट फीट — MCR/आर्च सहारा सोल लगवाएं', textEn: 'Whole sole touches ground / shoes wear out inside — flat feet — get MCR/arch-support soles' },
    { questionIndex: 90, text: 'मेहराब बनता है — फ्लैट फीट नहीं — दर्द का अन्य कारण जांचें', textEn: 'Arch forms on standing — not flat feet — look for another cause of pain' },
    { questionIndex: 91, text: 'लंबा चलने/खड़े रहने पर दर्द — आर्च सहारा + अच्छे जूते + वजन नियंत्रण', textEn: 'Pain after long walk/standing — arch support + good shoes + weight control' },
    { questionIndex: 91, text: 'दर्द नहीं, बस थकान — सामान्य — जूते कस्टम नहीं चाहिए, सामान्य सहारा काफी', textEn: 'No pain, just tiredness — normal — custom shoes not needed, basic support suffices' },
    // OTH02 q92 / q93
    { questionIndex: 92, text: 'खेल/पसीने में ऐंठन — इलेक्ट्रोलाइट की कमी — ORS/नींबू-नमक-चीनी + खेल से पहले गर्म-अप', textEn: 'Cramps during sport/sweating — electrolyte lack — ORS/lemon-salt-sugar + warm-up before sport' },
    { questionIndex: 92, text: 'आराम के समय/रात में — कैल्शियम/मैग्नीशियम जांच — रात को स्ट्रेच', textEn: 'At rest/at night — check calcium/magnesium — stretch at night' },
    { questionIndex: 93, text: 'पानी/नमक कम — दोनों बढ़ाएं — गर्मी और दिन की मेहनत में खास ध्यान', textEn: 'Low water/salt — increase both — take extra care in heat and heavy workdays' },
    { questionIndex: 93, text: 'सेवन ठीक — फिर भी ऐंठन — Ca/Mg/D जांच करा लें', textEn: 'Intake is fine — yet cramps — get Ca/Mg/D tested' },
    // OTH03 q94 / q95
    { questionIndex: 94, text: 'घर के अंदर ही चल पाते हैं — बाहर जाने पर डंडा/वॉकर जरूर लें — गिरने से बचाव सबसे जरूरी', textEn: 'Walking only indoors — always take a stick/walker outdoors — fall prevention is paramount' },
    { questionIndex: 94, text: '500 मीटर+ चल पाते हैं — अच्छी क्षमता — रोज़ चलते रहें, धीरे-धीरे बढ़ाएं', textEn: 'Can walk 500 m+ — good capacity — keep walking daily, increase gradually' },
    { questionIndex: 95, text: 'बाथरूम/सीढ़ियां फिसलन वाली — मैट + हैंडल (रेलिंग) लगवाएं, रात में रोशनी रखें', textEn: 'Slippery bathroom/stairs — install mats + grab rails, keep night lighting' },
    { questionIndex: 95, text: 'घर सुरक्षित है — अच्छा — जूते जिल्द वाले पहनें, बिखरी चीज़ें हटाते रहें', textEn: 'Home is safe — good — wear shoes with grip, keep floors clear' },
    // OTH04 q96 / q97
    { questionIndex: 96, text: 'आराम नहीं मिला — दवा/जांच दोबारा देखनी होगी — डॉक्टर समीक्षा करेंगे', textEn: 'No relief — medicines/workup need review — doctor will reassess' },
    { questionIndex: 96, text: 'अच्छा आराम — वही इलाज जारी — नियमित फॉलो-अप पर आते रहें', textEn: 'Good relief — continue same treatment — keep regular follow-ups' },
    { questionIndex: 97, text: 'नींद/काम प्रभावित — दर्द की योजना बदलें — फिजियो + गतिविधि संतुलन', textEn: 'Sleep/work affected — revise the pain plan — physio + activity balancing' },
    { questionIndex: 97, text: 'काम सामान्य चल रहा — अच्छा — व्यायाम जारी रखें, सुधार नोट करते आएं', textEn: 'Work is normal — good — continue exercises and report progress' },
  ],
  // ══ Labels — vitals + ROM-style entries (10) ═══════════════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वज़न', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
    { label: 'घुटना मोड़ (ROM)', labelEn: 'Knee Flexion (ROM)', unit: '°' },
    { label: 'कंधा उठाना (ROM)', labelEn: 'Shoulder Abduction (ROM)', unit: '°' },
  ],

  // ══ Findings (27) ═════════════════════════════════════════════════════
  findings: [
    { key: 'LUMBAGO-ACUTE', name: 'तीव्र कमर दर्द (मांसपेशी/मेकैनिकल)', nameEn: 'Acute Mechanical Lumbago', icd10: 'M54.5' },
    { key: 'LDP-RAD', name: 'लम्बर डिस्क प्रोलैप्स वाला साइटिका', nameEn: 'Lumbar Disc Prolapse with Radiculopathy', icd10: 'M51.1' },
    { key: 'CERV-SPOND', name: 'सर्विकल स्पॉन्डिलोसिस (गर्दन की घिसाव)', nameEn: 'Cervical Spondylosis', icd10: 'M47.8' },
    { key: 'CERV-RADIC', name: 'गर्दन से हाथ तक नस-दर्द', nameEn: 'Cervical Radiculopathy', icd10: 'M54.1' },
    { key: 'CERV-STRAIN', name: 'गर्दन की मांसपेशी खिंचाव / तोर्टिकोलिस', nameEn: 'Acute Cervical Strain / Torticollis', icd10: 'M54.2' },
    { key: 'FROZEN-SHOULDER', name: 'फ्रोजन कंधा (एडहेसिव कैप्सुलाइटिस)', nameEn: 'Adhesive Capsulitis (Frozen Shoulder)', icd10: 'M75.0' },
    { key: 'TENNIS-ELBOW', name: 'टेनिस एल्बो (लेटरल एपिकोंडाइलाइटिस)', nameEn: 'Lateral Epicondylitis (Tennis Elbow)', icd10: 'M77.0' },
    { key: 'CARPAL-TUNNEL', name: 'कार्पल टनल सिंड्रोम (कलाई की नस दबना)', nameEn: 'Carpal Tunnel Syndrome', icd10: 'G56.0' },
    { key: 'DE-QUERVAIN', name: 'डी क्वरवेन टेनोसाइनोवाइटिस (अंगूठे की जड़)', nameEn: 'De Quervain Tenosynovitis', icd10: 'M65.4' },
    { key: 'KNEE-OA-EARLY', name: 'घुटने की घिसाव — शुरुआती (ग्रेड 1-2)', nameEn: 'Knee Osteoarthritis Early (Grade 1-2)', icd10: 'M17.9' },
    { key: 'KNEE-OA-ADVANCED', name: 'घुटने की घिसाव — बढ़ी हुई (ग्रेड 3-4)', nameEn: 'Knee Osteoarthritis Advanced (Grade 3-4)', icd10: 'M17.0' },
    { key: 'KNEE-EFFUSION', name: 'घुटने में पानी भरना (इफ्यूजन)', nameEn: 'Knee Joint Effusion', icd10: 'M25.4' },
    { key: 'RA-SCREEN-REFER', name: 'इम्यून गठिया की शंका — जांच/रेफर (RA स्क्रीन)', nameEn: 'Suspected Inflammatory Arthritis (RA screen — refer)', icd10: 'M13.0' },
    { key: 'GOUT-ACUTE', name: 'गाउट का तीव्र दौरा', nameEn: 'Acute Gout Attack', icd10: 'M10.9' },
    { key: 'GOUT-CHRONIC', name: 'पुराना गाउट (यूरिक एसिड नियंत्रण)', nameEn: 'Chronic Gout (Urate-Lowering Phase)', icd10: 'M10.9' },
    { key: 'ANKLE-SPRAIN-1', name: 'टखने की मोच — ग्रेड 1-2', nameEn: 'Ankle Sprain Grade 1-2', icd10: 'S93.4' },
    { key: 'ANKLE-SPRAIN-3', name: 'टखने की मोच — गंभीर ग्रेड 3 (लिगामेंट टूट संभावित)', nameEn: 'Ankle Sprain Grade 3 (possible ligament tear)', icd10: 'S93.4' },
    { key: 'PLANTAR-FASC', name: 'प्लांटर फेशियाइटिस (एड़ी का दर्द)', nameEn: 'Plantar Fasciitis', icd10: 'M72.2' },
    { key: 'TAILBONE-PAIN', name: 'कोक्सीडायनिया (दुम की हड्डी का दर्द)', nameEn: 'Coccydynia (Tailbone Pain)', icd10: 'M53.3' },
    { key: 'FLAT-FOOT', name: 'फ्लैट फीट (पसरे पैर)', nameEn: 'Pes Planus (Flat Foot)', icd10: 'M21.0' },
    { key: 'CLAUDICATION-REFER', name: 'चलने पर पिंडली दर्द — वाहिका जांच/रेफर', nameEn: 'Claudication — Vascular Screen (refer)', icd10: 'I73.9' },
    { key: 'OSTEO-SCREEN', name: 'ऑस्टियोपोरोसिस की शंका (DEXA जांच)', nameEn: 'Osteoporosis (DXA Screen)', icd10: 'M81.9' },
    { key: 'OSTEOMALACIA-SCREEN', name: 'हड्डियों की नरमी की शंका (विटामिन D जांच)', nameEn: 'Osteomalacia Screen (Vitamin D Workup)', icd10: 'M83.9' },
    { key: 'VITD-DEF', name: 'विटामिन D की कमी', nameEn: 'Vitamin D Deficiency', icd10: 'E55.9' },
    { key: 'POST-FX-HEALING', name: 'फ्रैक्चर भर रहा है (फॉलो-अप)', nameEn: 'Fracture in Healing (Follow-up)', icd10: 'Z47.0' },
    { key: 'POST-OP-ORTHO-FU', name: 'ऑर्थो ऑपरेशन के बाद फॉलो-अप', nameEn: 'Post-Ortho-Surgery Follow-up', icd10: 'Z48.0' },
    { key: 'PULLED-ELBOW', name: 'बच्चे की खिंची कोहनी (रेडियल हेड सबलक्सेशन)', nameEn: 'Pulled Elbow (Radial Head Subluxation)', icd10: 'S53.0' },
  ],

  // ══ Medicines (60) — India ortho OPD core ═════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~dispense qty.
  // Every oral NSAID carries gastric-protection + elderly-renal notes in salt.
  // verified = false until per-item MBBS review.
  medicines: [
    // Oral NSAIDs / analgesics
    { name: 'Zerodol-P Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg · खाने के बाद दें · साथ PPI (जैसे Pan 40) दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab', '1/2 tab (बुज़ुर्ग/हल्का दर्द)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol-SP Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol-TH 4 Tablet', salt: 'Aceclofenac 100 mg + Thiocolchicoside 4 mg · खाने के बाद · साथ PPI दें · नींद/चक्कर संभव · बुज़ुर्गों में सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol 100 Tablet', salt: 'Aceclofenac 100 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab', '1/2 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Hifenac-P Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Signoflam Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg · खाने के बाद · साथ PPI दें', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Flexon Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg · खाने के बाद · साथ PPI दें', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dynapar Tablet', salt: 'Diclofenac Sodium 50 mg + Paracetamol 325 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Emanzen-D Tablet', salt: 'Diclofenac 50 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg · खाने के बाद · साथ PPI दें', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran SR 100 Tablet', salt: 'Diclofenac Sodium 100 mg SR · भोजन के बाद · साथ PPI दें · बुज़ुर्गों में किडनी-जांच जरूरी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Naprosyn 500 Tablet', salt: 'Naproxen 500 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी/पेट सावधानी', doseOptions: ['1 tab', '1/2 tab (250 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nucoxia 60 Tablet', salt: 'Etoricoxib 60 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 0, tab: 7, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nucoxia 90 Tablet', salt: 'Etoricoxib 90 mg · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी सावधानी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 0, tab: 7, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nucoxia 120 Tablet', salt: 'Etoricoxib 120 mg · गाउट दौरे की खुराक · खाने के बाद · साथ PPI दें · बुज़ुर्गों में किडनी जांच जरूरी', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nucoxia-MR Tablet', salt: 'Etoricoxib 60 mg + Thiocolchicoside 4 mg · खाने के बाद · साथ PPI दें · नींद/चक्कर संभव', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg · बुज़ुर्गों के लिए सुरक्षित दर्द-निवारक (साथ PPI की जरूरत नहीं)', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 650 Tablet', salt: 'Paracetamol 650 mg · बुज़ुर्गों के लिए सुरक्षित दर्द-निवारक', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Tramadol combos — Schedule H, dependence/drowsiness caution
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg · ⚠ नींद/चक्कर आते हैं — गाड़ी न चलाएं · आदत का जोखिम — छोटा कोर्स (5 दिन तक) ही दें', doseOptions: ['1 tab SOS', '1 tab BD (तेज़ दर्द)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tramazac 50 Capsule', salt: 'Tramadol 50 mg · ⚠ नींद/चक्कर — गाड़ी वर्जित · आदत का जोखिम — छोटा कोर्स ही · कब्ज संभव', doseOptions: ['1 cap SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Muscle relaxants
    { name: 'Myoril 4 mg Capsule', salt: 'Thiocolchicoside 4 mg · नींद/चक्कर संभव — गाड़ी सावधानी · गर्भावस्था में नहीं', doseOptions: ['1 cap'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Myospaz Forte Tablet', salt: 'Chlorzoxazone 500 mg + Paracetamol 325 mg + Ibuprofen 400 mg · खाने के बाद · साथ PPI दें · नींद संभव', doseOptions: ['1 tab', '1/2 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tizan 2 Tablet', salt: 'Tizanidine 2 mg · नींद/चक्कर/मुंह सूखना संभव · ब्लड प्रेशर देखें बुज़ुर्गों में', doseOptions: ['1 tab', '1/2 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Robinax 500 Tablet', salt: 'Methocarbamol 500 mg · नींद/चक्कर संभव · खाने के बाद दें', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Anti-inflammatory enzyme (post-traumatic swelling)
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin + Chymotrypsin (सूजन-घटाने वाला एंजाइम) · खाली पेट दें (भोजन से आधा घंटा पहले/बाद)', doseOptions: ['1 tab'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Gastric protection (NSAID companions)
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg · NSAID के साथ देने के लिए — नाश्ते से पहले', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pan-D Capsule', salt: 'Pantoprazole 40 mg + Domperidone 30 mg SR · नाश्ते से पहले', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Omez DSR Capsule', salt: 'Omeprazole 20 mg + Domperidone 30 mg SR · नाश्ते से पहले', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nexpro 40 Tablet', salt: 'Esomeprazole 40 mg · नाश्ते से पहले · लंबा कोर्स लें तो मैग्नीशियम देखें', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'एंटासिड जेल (Magaldrate/Al-Mg hydroxide + Simethicone) · तुरंत गैस्ट्रिक राहत SOS', doseOptions: ['10 ml', '15 ml'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Topicals
    { name: 'Volini Gel 30g', salt: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol जेल · दर्द वाली जगह दिन में 2-3 बार हल्की मालिश', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Volini Spray 30g', salt: 'Diclofenac + Menthol टॉपिकल स्प्रे · दर्द पर 2-3 स्प्रे, दिन में 3 बार तक', doseOptions: ['2-3 sprays locally, up to 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omnigel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w जेल · सूजन वाली जगह पर पतली तह, दिन में 3-4 बार', doseOptions: ['Apply thin layer 3-4 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dynapar AQ Spray 30g', salt: 'Diclofenac Diethylamine एक्वियस स्प्रे · दर्द/सूजन पर 2 स्प्रे, दिन में 3 बार', doseOptions: ['2 sprays locally 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nupatch 100 Patch', salt: 'Diclofenac Diethylamine 100 mg मेडिकेटेड पैच · दिन में 1 पैच, 12 घंटे तक · लगाने की जगह साफ-सूखी रखें', doseOptions: ['1 patch once daily'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Thrombophob Gel 30g', salt: 'Heparinoid + Benzyl Nicotinate जेल · चोट की सूजन/नीली खिंचाव पर दिन में 2-3 बार (खुली खरोंच पर नहीं)', doseOptions: ['Apply 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin Sulphate 1% क्रीम · खरोंच/हल्के घाव पर पतली तह दिन में 2-3 बार', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine 10% Solution 100ml', salt: 'Povidone-Iodine 10% घाव-एंटीसेप्टिक · घाव साफ कर लगाएं · गर्भावस्था में सावधानी', doseOptions: ['Apply on cleaned wound'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Calcium / Vitamin D3 / bone minerals
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU · भोजन के बाद · पानी भरपूर लें', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal HD Tablet', salt: 'Calcium Carbonate 500 mg (तत्व कैल्शियम) + Vitamin D3 500 IU · भोजन के बाद', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calcirol 60K Sachet', salt: 'Cholecalciferol (Vitamin D3) 60,000 IU ग्रेन्यूल्स · हफ्ते में 1 शैकेट दूध के साथ · 8 हफ्ते, फिर महीने में 1', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tayo 60K Sachet', salt: 'Cholecalciferol (Vitamin D3) 60,000 IU · हफ्ते में 1 शैकेट दूध/पानी से · 8 हफ्ते का कोर्स आम', doseOptions: ['1 sachet weekly'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Evion 400 Capsule', salt: 'Tocopheryl Acetate (Vitamin E) 400 mg · पैरों की ऐंठन/मांसपेशी दर्द में आम · भोजन के बाद', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Rocaltrol 0.25 Capsule', salt: 'Calcitriol 0.25 mcg · ऑस्टियोपोरोसिस/किडनी-हड्डी रोग में · कैल्शियम साथ दें · फॉलो-अप में कैल्शियम जांचें', doseOptions: ['1 cap', '1 cap twice daily (जांच अनुसार)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Osteoporosis therapy — admin instructions in salt
    { name: 'Ostofos 70 Tablet', salt: 'Alendronate 70 mg (हफ्ते में एक बार) · सुबह उठकर खाली पेट 200 ml पानी से · लेने के बाद कम से कम 30 मिनट लेटें/बैठें नहीं · फिर नाश्ता · गर्भावस्था में नहीं', doseOptions: ['1 tab weekly on empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Bonesta 150 Tablet', salt: 'Ibandronate Sodium 150 mg (महीने में एक बार) · सुबह खाली पेट 200 ml पानी से · 30-60 मिनट लेटें/बैठें नहीं · फिर नाश्ता · कैल्शियम/D3 साथ चालिए रखें', doseOptions: ['1 tab monthly on empty stomach'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // Neuropathic / neurotropic
    { name: 'Pregeb 75 Capsule', salt: 'Pregabalin 75 mg · नस-दर्द (साइटिका/न्यूरोपैथी) में · चक्कर/नींद शुरुआत में सामान्य · अचानक बंद न करें', doseOptions: ['1 cap', '1 cap twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pregeb 150 Capsule', salt: 'Pregabalin 150 mg · तेज़ नस-दर्द · नींद/चक्कर संभव · अचानक बंद न करें', doseOptions: ['1 cap'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pregeb 300 Capsule', salt: 'Pregabalin 300 mg · रात को एक बार (तेज़ रात-भर का दर्द) · नींद/चक्कर संभव · अचानक बंद न करें', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabapin 100 Tablet', salt: 'Gabapentin 100 mg · नस-दर्द · नींद/चक्कर शुरुआत में सामान्य · खुराक धीरे-धीरे बढ़ाएं', doseOptions: ['1 tab', '1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabantin Forte Tablet', salt: 'Gabapentin 400 mg + Methylcobalamin · नस-दर्द का कॉम्बो · नींद/चक्कर संभव · अचानक बंद न करें', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nurokind-Plus Capsule', salt: 'Methylcobalamin + Alpha Lipoic Acid + Pyridoxine + Folic Acid (न्यूरोट्रॉपिक) · नस की भराई के लिए · भोजन के बाद', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Renerve Plus Capsule', salt: 'Methylcobalamin + Alpha Lipoic Acid + Multivitamin न्यूरोट्रॉपिक · भोजन के बाद', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tryptomer 10 Tablet', salt: 'Amitriptyline 10 mg · पुराने दर्द में रात की खुराक · सुबह नींद/मुंह सूखना सामान्य · बुज़ुर्गों में गिरने से बचाव', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Chondroprotection
    { name: 'Rejoint Tablet', salt: 'Glucosamine Sulphate 500 mg + Diacerein 50 mg · घुटने की घिसाव में · भोजन के बाद · हल्का दस्त संभव — 4-6 हफ्ते लगते हैं असर में', doseOptions: ['1 tab'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    // Gout
    { name: 'Zycolchin 0.5 Tablet', salt: 'Colchicine 0.5 mg · ⚠ संकीर्ण उपचार सीमा (narrow therapeutic index) — दस्त लगते ही तुरंत बंद कर दें · खुराक न बढ़ाएं · बच्चों की पहुंच से दूर', doseOptions: ['1 tab twice daily (दौरे में, अधिकतम 3 दिन)'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Febutaz 40 Tablet', salt: 'Febuxostat 40 mg · ⚠ हृदय रोगियों में सावधानी (CV caution) — इतिहास हो तो डॉक्टर बताएं · तीव्र दौरे के दौरान शुरू न करें · शुरुआत में दौरा हो सकता है (NSAID कवर डॉक्टर तय करें)', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zyloric 100 Tablet', salt: 'Allopurinol 100 mg · यूरिक एसिड घटाने के लिए · तीव्र दौरे में शुरू न करें — दौरा शांत होने के 2 हफ्ते बाद · दाने आएं तो तुरंत बंद कर बताएं', doseOptions: ['1 tab once daily', '1 tab twice daily (जांच अनुसार)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Supportive
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg मुंह में घुलने वाली · मतली/उल्टी (दवा की मतली) में SOS', doseOptions: ['1 tab SOS'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cremaffin Syrup 225ml', salt: 'Milk of Magnesia + Liquid Paraffin सिरप · बिस्तर पर रहने से/दर्द-दवा से कब्ज में रात को एक खुराक', doseOptions: ['15 ml at bedtime', '10 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],
  // ══ Finding ↔ Medicine links (42) ════════════════════════════════════
  // Refer-only findings (CLAUDICATION-REFER, PULLED-ELBOW, RA-SCREEN-REFER,
  // POST-OP-ORTHO-FU, FLAT-FOOT, TAILBONE-PAIN, OSTEOMALACIA-SCREEN) are
  // deliberately NOT linked — procedure/ referral / workup pathways.
  findingMeds: [
    // LUMBAGO-ACUTE
    { findingKey: 'LUMBAGO-ACUTE', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'अधिकतम 5 दिन · साथ PPI दें' },
    { findingKey: 'LUMBAGO-ACUTE', medicineName: 'Myoril 4 mg Capsule', dose: '1 cap BD', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'स्पैज्म के लिए · नींद सावधानी' },
    { findingKey: 'LUMBAGO-ACUTE', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'NSAID के साथ गैस्ट्रिक प्रोटेक्शन' },
    // LDP-RAD
    { findingKey: 'LDP-RAD', medicineName: 'Zerodol-TH 4 Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'दर्द + स्पैज्म · साथ PPI दें · 5-7 दिन' },
    { findingKey: 'LDP-RAD', medicineName: 'Pregeb 75 Capsule', dose: '1 cap BD', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'नस-दर्द के लिए · नींद/चक्कर शुरुआत में सामान्य' },
    { findingKey: 'LDP-RAD', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'NSAID के साथ गैस्ट्रिक प्रोटेक्शन' },
    // CERV-SPOND
    { findingKey: 'CERV-SPOND', medicineName: 'Nucoxia 60 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 7, description: 'दर्द के दौर में · साथ PPI दें' },
    { findingKey: 'CERV-SPOND', medicineName: 'Myospaz Forte Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'जकड़न के लिए · साथ PPI दें · नींद संभव' },
    // CERV-RADIC
    { findingKey: 'CERV-RADIC', medicineName: 'Pregeb 75 Capsule', dose: '1 cap BD', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'नस जड़ के दर्द में · अचानक बंद न करें' },
    { findingKey: 'CERV-RADIC', medicineName: 'Nurokind-Plus Capsule', dose: '1 cap OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'नस की भराई · 4-6 हफ्ते' },
    // CERV-STRAIN
    { findingKey: 'CERV-STRAIN', medicineName: 'Myoril 4 mg Capsule', dose: '1 cap BD', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'तीव्र जकड़न · 3-5 दिन · गर्म सेक साथ' },
    // FROZEN-SHOULDER
    { findingKey: 'FROZEN-SHOULDER', medicineName: 'Nucoxia 60 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 7, description: 'दर्द के दौर में · फिजियो मुख्य इलाज · साथ PPI दें' },
    // TENNIS-ELBOW
    { findingKey: 'TENNIS-ELBOW', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: '7-10 दिन · साथ PPI दें · बैंड + आराम मुख्य' },
    { findingKey: 'TENNIS-ELBOW', medicineName: 'Omnigel 30g', dose: 'पतली तह दिन में 3-4 बार', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'कोहनी के बाहरी टीले पर' },
    // CARPAL-TUNNEL
    { findingKey: 'CARPAL-TUNNEL', medicineName: 'Pregeb 75 Capsule', dose: '1 cap रात को', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'रात का स्प्लिंट साथ दें · नींद संभव' },
    { findingKey: 'CARPAL-TUNNEL', medicineName: 'Nurokind-Plus Capsule', dose: '1 cap OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'न्यूरोट्रॉपिक सहारा' },
    // DE-QUERVAIN
    { findingKey: 'DE-QUERVAIN', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'अंगूठा स्प्लिंट मुख्य इलाज · साथ PPI दें' },
    // KNEE-OA-EARLY
    { findingKey: 'KNEE-OA-EARLY', medicineName: 'Nucoxia 90 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 7, description: 'दर्द के दौर में · साथ PPI दें · क्वाड्रिसेप्स व्यायाम जरूरी' },
    { findingKey: 'KNEE-OA-EARLY', medicineName: 'Rejoint Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: '4-6 हफ्ते · हल्का दस्त संभव' },
    { findingKey: 'KNEE-OA-EARLY', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'NSAID के साथ गैस्ट्रिक प्रोटेक्शन' },
    // KNEE-OA-ADVANCED
    { findingKey: 'KNEE-OA-ADVANCED', medicineName: 'Dolo 650 Tablet', dose: '1 tab SOS (दिन में अधिकतम 3 बार)', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'बुज़ुर्गों के लिए पहली पसंद · किडनी-सुरक्षित' },
    { findingKey: 'KNEE-OA-ADVANCED', medicineName: 'Rejoint Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'लंबा कोर्स · असर 4-6 हफ्ते में' },
    // KNEE-EFFUSION
    { findingKey: 'KNEE-EFFUSION', medicineName: 'Zerodol-SP Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'सूजन के साथ दर्द · साथ PPI दें · टेपिंग ऑर्थो करेंगे' },
    { findingKey: 'KNEE-EFFUSION', medicineName: 'Chymoral Forte Tablet', dose: '1 tab TDS खाली पेट', morning: 1, afternoon: 1, evening: 1, tab: 30, description: 'सूजन घटाने के लिए · 5-7 दिन' },
    // RA-SCREEN-REFER — deliberate: only SOS-safe analgesia, NO DMARD/steroid
    { findingKey: 'RA-SCREEN-REFER', medicineName: 'Dolo 650 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'सिर्फ राहत के लिए · मुख्य इलाज रूमैटोलॉजिस्ट रेफर + जांच (RF, anti-CCP, ESR)' },
    { findingKey: 'RA-SCREEN-REFER', medicineName: 'Volini Gel 30g', dose: 'लोकल 2-3 बार दिन में', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'दर्द वाले जोड़ पर बाहरी इस्तेमाल' },
    // GOUT-ACUTE
    { findingKey: 'GOUT-ACUTE', medicineName: 'Nucoxia 120 Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 5, description: 'दौरे में · 3-5 दिन · साथ PPI दें · बुज़ुर्गों में किडनी जांच' },
    { findingKey: 'GOUT-ACUTE', medicineName: 'Zycolchin 0.5 Tablet', dose: '1 tab BD', morning: 1, afternoon: 0, evening: 1, tab: 6, description: '⚠ दस्त लगते ही बंद · अधिकतम 3 दिन' },
    { findingKey: 'GOUT-ACUTE', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'NSAID के साथ गैस्ट्रिक प्रोटेक्शन' },
    // GOUT-CHRONIC
    { findingKey: 'GOUT-CHRONIC', medicineName: 'Febutaz 40 Tablet', dose: '1 tab OD', morning: 1, afternoon: 0, evening: 0, tab: 30, description: '⚠ CV सावधानी · दौरा शांत होने पर ही शुरू करें · यूरिक एसिड 2-4 हफ्ते बाद दोहराएं' },
    { findingKey: 'GOUT-CHRONIC', medicineName: 'Zyloric 100 Tablet', dose: '1 tab OD', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'विकल्प · दाने आएं तो तुरंत बंद · दौरे के दौरान शुरू नहीं' },
    // ANKLE-SPRAIN-1
    { findingKey: 'ANKLE-SPRAIN-1', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'RICE (आराम-बर्फ-पट्टी-ऊंचाई) साथ · साथ PPI दें' },
    { findingKey: 'ANKLE-SPRAIN-1', medicineName: 'Thrombophob Gel 30g', dose: 'सूजन पर 2-3 बार दिन में', morning: 1, afternoon: 0, evening: 1, tab: 1, description: '48 घंटे बाद · खुली खरोंच पर नहीं' },
    // ANKLE-SPRAIN-3
    { findingKey: 'ANKLE-SPRAIN-3', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'दर्द नियंत्रण · मुख्य प्रबंधन: ऑर्थो आकलन + ब्रेस/पट्टी · साथ PPI दें' },
    // PLANTAR-FASC
    { findingKey: 'PLANTAR-FASC', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', morning: 1, afternoon: 0, evening: 1, tab: 10, description: 'छोटा कोर्स 5 दिन · साथ PPI दें · कैफ स्ट्रेच + MCR सोल मुख्य' },
    { findingKey: 'PLANTAR-FASC', medicineName: 'Volini Gel 30g', dose: 'एड़ी पर 2-3 बार दिन में', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'बर्फ की बोतल रोल के बाद' },
    // OSTEO-SCREEN
    { findingKey: 'OSTEO-SCREEN', medicineName: 'Shelcal HD Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'DEXA जांच तक सहारा · गिरने से बचाव सलाह दें' },
    { findingKey: 'OSTEO-SCREEN', medicineName: 'Calcirol 60K Sachet', dose: '1 शैकेट हफ्ते में दूध से', morning: 1, afternoon: 0, evening: 0, tab: 8, description: '8 हफ्ते · फिर जांच दोहराएं' },
    { findingKey: 'OSTEO-SCREEN', medicineName: 'Ostofos 70 Tablet', dose: '1 tab हफ्ते में · खाली पेट नियम से', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'सिर्फ DEXA-पुष्ट ऑस्टियोपोरोसिस में · 30 मिनट लेटें/बैठें नहीं' },
    // VITD-DEF
    { findingKey: 'VITD-DEF', medicineName: 'Calcirol 60K Sachet', dose: '1 शैकेट हफ्ते में 8 हफ्ते', morning: 1, afternoon: 0, evening: 0, tab: 8, description: 'फिर महीने में 1 रखरखाव खुराक · 3 महीने में स्तर दोहराएं' },
    // POST-FX-HEALING
    { findingKey: 'POST-FX-HEALING', medicineName: 'Shelcal HD Tablet', dose: '1 tab OD after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'हड्डी जुड़ने में सहारा · 6-8 हफ्ते तक' },
    { findingKey: 'POST-FX-HEALING', medicineName: 'Calcirol 60K Sachet', dose: '1 शैकेट हफ्ते में', morning: 1, afternoon: 0, evening: 0, tab: 8, description: '8 हफ्ते · फिजियो व्यायाम साथ जरूरी' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'ROM Chart — Range of Motion (डिग्री में)',
      rows: 8,
      cols: 5,
      headerLabel: ['जोड़', 'मोड़ना (Flexion)', 'सीधा करना (Extension)', 'फैलाना (Abduction)', 'घुमाना (Rotation)'],
      colsLabel: ['Joint', 'Flexion', 'Extension', 'Abduction', 'Rotation'],
      footerLabel: ['दूसरी तरफ के जोड़ से तुलना करें और डिग्री नोट करें / Compare with the opposite side and record degrees'],
    },
    {
      name: 'Ortho Exam Checklist (देखें-छुएं-हिलाएं)',
      rows: 7,
      cols: 5,
      headerLabel: ['क्षेत्र', 'देखना (Look)', 'छूकर देखना (Feel)', 'हिलाना (Move)', 'विशेष परीक्षण'],
      colsLabel: ['Region', 'Look', 'Feel', 'Move', 'Special Test'],
      footerLabel: ['हर क्षेत्र में क्रम से: देखें → छुएं → हिलाएं → विशेष टेस्ट / Every region in order: Look → Feel → Move → Special test'],
    },
    {
      name: 'Physio Exercise Plan (फिजियो व्यायाम चार्ट)',
      rows: 8,
      cols: 5,
      headerLabel: ['व्यायाम', 'सेट', 'दोहराव (Reps)', 'हफ्ते', 'बढ़ोतरी'],
      colsLabel: ['Exercise', 'Sets', 'Reps', 'Weeks', 'Progression'],
      footerLabel: ['दर्द बढ़े तो रुकें और फिजियो से दोबारा मिलें / Stop if pain worsens; review with the physiotherapist'],
    },
    {
      name: 'Fracture Follow-up Chart (फ्रैक्चर फॉलो-अप)',
      rows: 6,
      cols: 4,
      headerLabel: ['मुलाक़ात', 'दिन (चोट से)', 'X-ray / जांच', 'टिप्पणी'],
      colsLabel: ['Visit', 'Day since injury', 'X-ray / Check', 'Notes'],
      footerLabel: ['हड्डी जुड़ने में आमतौर पर 6-8 हफ्ते · हर मुलाक़ात पर X-ray जरूरी / Union usually 6-8 weeks · X-ray at every visit'],
    },
    {
      name: 'Posture & Ergonomics Checklist (बैठक सुधार)',
      rows: 7,
      cols: 3,
      headerLabel: ['क्या जांचें', 'सही तरीका', 'टिप्पणी'],
      colsLabel: ['Check', 'Correct way', 'Notes'],
      footerLabel: ['हर 45 मिनट बाद 2 मिनट का ब्रेक लें / Take a 2-minute break every 45 minutes'],
    },
    {
      name: 'Gout Diet Chart (गाउट आहार)',
      rows: 8,
      cols: 3,
      headerLabel: ['खाना / पेय', 'करें या न करें', 'टिप्पणी'],
      colsLabel: ['Food / Drink', 'Have / Avoid', 'Notes'],
      footerLabel: ['पानी रोज़ 3 लीटर · शराब पूरी तरह बंद / 3 litres water daily · stop alcohol completely'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acute Lumbago — Standard',
      diagnosis: 'LUMBAGO-ACUTE',
      medicines: [
        { name: 'Zerodol-P Tablet', dose: '1 tab', duration: '5 days', instructions: 'भोजन के बाद BD · साथ पेट की दवा चालू रखें' },
        { name: 'Myoril 4 mg Capsule', dose: '1 cap', duration: '5 days', instructions: 'BD · नींद/चक्कर संभव — गाड़ी सावधानी' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '7 days', instructions: 'नाश्ते से पहले — NSAID के साथ गैस्ट्रिक प्रोटेक्शन' },
        { name: 'Volini Gel 30g', dose: 'लोकल मालिश', duration: '5 days', instructions: 'दिन में 2-3 बार कमर पर' },
      ],
      labs: ['X-ray LS spine (AP + Lateral) — दर्द 2 हफ्ते+ या red flag पर', 'Serum Vitamin D — बार-बार होने पर'],
      advice: 'गर्म सेक दिन में 2 बार 15 मिनट · 2 दिन बिस्तर-आराम फिर हल्की चाल · झुकना/वज़न उठाना बंद · मुद्रा सुधार + पीठ व्यायाम शुरू · बवासीर की मुद्रा में न झुकें',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Knee OA (Grade 1-2) — Standard',
      diagnosis: 'KNEE-OA-EARLY',
      medicines: [
        { name: 'Nucoxia 90 Tablet', dose: '1 tab', duration: '7 days', instructions: 'भोजन के बाद OD · साथ PPI चालू रखें · दर्द के दौर में ही' },
        { name: 'Rejoint Tablet', dose: '1 tab', duration: '30 days', instructions: 'भोजन के बाद BD · हल्का दस्त संभव — पानी भरपूर' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '7 days', instructions: 'नाश्ते से पहले — गैस्ट्रिक प्रोटेक्शन' },
        { name: 'Volini Gel 30g', dose: 'लोकल मालिश', duration: '15 days', instructions: 'घुटने पर दिन में 2-3 बार' },
      ],
      labs: ['X-ray दोनों घुटने (खड़े होकर)', 'Serum Vitamin D + Calcium', 'HbA1c — मोटापे पर'],
      advice: 'क्वाड्रिसेप्स व्यायाम रोज़ (फिजियो चार्ट के अनुसार) · वज़न 5% घटाने का लक्ष्य · नहाते समय घुटनों पर जोर न दें, टब में बैठें · सीढ़ियां जितनी हो सके कम · MCR/नरम सोल चप्पल',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Post-Fracture Healing — Standard',
      diagnosis: 'POST-FX-HEALING',
      medicines: [
        { name: 'Shelcal HD Tablet', dose: '1 tab', duration: '30 days', instructions: 'भोजन के बाद OD · पानी भरपूर' },
        { name: 'Calcirol 60K Sachet', dose: '1 शैकेट', duration: '8 weeks', instructions: 'हफ्ते में एक बार दूध के साथ' },
        { name: 'Chymoral Forte Tablet', dose: '1 tab', duration: '5 days', instructions: 'TDS खाली पेट — सूजन हो तो' },
      ],
      labs: ['X-ray टूटी जगह की — 6 हफ्ते पर (जुड़ाई देखने के लिए)', 'Serum Vitamin D'],
      advice: 'फिजियो व्यायाम रोज़ (चार्ट देखें) · प्लास्टर वाले अंग की उंगलियां हिलाते रहें · धूम्रपान बंद करें — हड्डी जुड़ना धीमा हो जाता है · 6 हफ्ते पर X-ray जरूरी · दर्द बढ़े या प्लास्टर में सुन्नपन हो तो तुरंत आएं',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'Plantar Fasciitis — Standard',
      diagnosis: 'PLANTAR-FASC',
      medicines: [
        { name: 'Zerodol-P Tablet', dose: '1 tab', duration: '5 days', instructions: 'भोजन के बाद BD · साथ PPI चालू रखें' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '5 days', instructions: 'नाश्ते से पहले — गैस्ट्रिक प्रोटेक्शन' },
        { name: 'Dynapar AQ Spray 30g', dose: '2 स्प्रे', duration: '7 days', instructions: 'एड़ी पर दिन में 3 बार' },
      ],
      labs: ['X-ray एड़ी (साइड से) — स्पर की शंका पर'],
      advice: 'बर्फ की बोतल पर एड़ी रोल करें दिन में 2 बार 5 मिनट · बिस्तर से उठने से पहले कैफ-एकिलीज़ स्ट्रेच 10 बार · MCR/नरम एड़ी वाले जूते · नंगे पैर ठंडी ज़मीन पर न चलें · वज़न नियंत्रण · 2 हफ्ते में न ठीक हो तो फिर मिलें',
      followUpDays: 7,
    },
    {
      name: 'Cervical Spondylosis — Standard',
      diagnosis: 'CERV-SPOND',
      medicines: [
        { name: 'Nucoxia 60 Tablet', dose: '1 tab', duration: '5 days', instructions: 'भोजन के बाद OD · साथ PPI चालू रखें' },
        { name: 'Myospaz Forte Tablet', dose: '1 tab', duration: '5 days', instructions: 'भोजन के बाद BD · नींद संभव — गाड़ी सावधानी' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '7 days', instructions: 'नाश्ते से पहले — गैस्ट्रिक प्रोटेक्शन' },
        { name: 'Volini Gel 30g', dose: 'लोकल मालिश', duration: '7 days', instructions: 'गर्दन/कंधे पर दिन में 2-3 बार' },
      ],
      labs: ['X-ray cervical spine (AP + Lateral)'],
      advice: 'स्क्रीन आंख की लाइन पर रखें · हर 45 मिनट बाद गर्दन की हल्की चाल · गर्दन आइसोमेट्रिक व्यायाम रोज़ · फोन झुककर न चलाएं · गोल तकिया/सर्विकल पिलो · दर्द हाथ तक जाए या कमजोरी लगे तो तुरंत दोबारा मिलें',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Acute Gout Flare — Standard',
      diagnosis: 'GOUT-ACUTE',
      medicines: [
        { name: 'Nucoxia 120 Tablet', dose: '1 tab', duration: '5 days', instructions: 'भोजन के बाद OD · साथ PPI चालू रखें · बुज़ुर्गों में किडनी जांच पहले' },
        { name: 'Zycolchin 0.5 Tablet', dose: '1 tab', duration: '3 days', instructions: 'BD · ⚠ दस्त लगते ही तुरंत बंद कर दें · खुराक न बढ़ाएं' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '5 days', instructions: 'नाश्ते से पहले — गैस्ट्रिक प्रोटेक्शन' },
      ],
      labs: ['Serum uric acid — दौरा शांत होने के 2 हफ्ते बाद', 'CBC + ESR', 'Serum creatinine', 'RBS'],
      advice: 'जोड़ को आराम पर रखें और तकिये से ऊंचा करें · बर्फ सेक 15 मिनट 3 बार · पानी रोज़ 3 लीटर · शराब/मांस/मछली/मसूर-राजमा बंद · यूरिक एसिड की दवा दौरे के दौरान शुरू नहीं करते · 7 दिन में दोबारा मिलें',
      followUpDays: 7,
    },
  ],
}




