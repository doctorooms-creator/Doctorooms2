/**
 * NSU-01 — NEUROSURGERY STARTER PACK (T3 lite)
 *
 * Clinic-side neurosurgical TRIAGE + conservative spine care + post-op
 * follow-up. Actual surgery = refer framing — this pack never encodes an
 * operative pathway; it encodes WHO NEEDS ONE, HOW FAST, and what
 * conservative care looks like while surgery is being decided.
 *
 * ⚠ SCOPE PHILOSOPHY (deliberate):
 *   - RED-FLAG TRIAGE HEAVY: severe head injury (GCS ≤13 / repeated
 *     vomiting / seizure / anticoagulant), cord compression, cauda equina
 *     (saddle numbness + retention), thunderclap headache (aneurysm),
 *     raised-ICP pattern headaches and stroke are REFER-ONLY findings
 *     with ZERO findingMeds links — hours matter, not tablets.
 *   - Conservative spine care: mechanical back pain, sciatica (6-week
 *     natural-history framing), cervical radiculopathy/spondylosis,
 *     lumbar canal stenosis (shopping-cart relief) — posture, heat,
 *     short analgesic courses, walking.
 *   - Nerve-pain medicines (pregabalin/gabapentin) and carbamazepine for
 *     trigeminal neuralgia = CONTINUATION-VERIFY framing only: continue
 *     what the NEUROLOGIST started, never self-increase (NEU owns
 *     titration).
 *   - Spine TB = NTEP referral territory (coordinate PUL) — free
 *     government treatment, drugs continued = cure.
 *   - Post-craniotomy vomiting is treated as possible raised ICP, NOT
 *     suppressed with antiemetics at home.
 *   - No OTC painkiller abuse: paracetamol first, NSAID ≤5 days with
 *     gastro-protection, opioids SOS-only.
 *
 * India-specific: young-age spine TB screening, thunderclap-first-hour CT
 * messaging, stroke = emergency stroke-centre (coordinate NEU), Indian
 * brands, Hinglish patient text.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands.
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const NSU01_PACK: SpecialtyPack = {
  meta: {
    code: 'NSU-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Neurosurgery Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · clinic-side neurosurgery OPD; red-flag triage heavy',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'HEA', name: 'सिर की चोट', nameEn: 'Head Injury' },
    { key: 'SPI', name: 'रीढ़ (स्पाइन)', nameEn: 'Spine' },
    { key: 'BRA', name: 'मस्तिष्क लक्षण', nameEn: 'Brain Symptoms' },
    { key: 'CON', name: 'जन्मजात/बाल-रोग', nameEn: 'Congenital & Pediatric' },
    { key: 'POS', name: 'ऑपरेशन-पश्चात', nameEn: 'Post-Operative' },
  ],

  // ══ Complaints (16) ═══════════════════════════════════════════════════
  complaints: [
    // HEA — Head injury
    { code: 'NSU-C01', categoryKey: 'HEA', detail: 'सिर पर चोट लग गई है', detailEn: 'Head Injury' },
    { code: 'NSU-C02', categoryKey: 'HEA', detail: 'चोट के बाद बेहोशी/मौके पर गिरना', detailEn: 'Loss of Consciousness After Injury' },
    // SPI — Spine
    { code: 'NSU-C03', categoryKey: 'SPI', detail: 'गर्दन में दर्द हाथ तक जाता है', detailEn: 'Neck Pain Radiating to Arm' },
    { code: 'NSU-C04', categoryKey: 'SPI', detail: 'कमर दर्द पैर तक जाता है (सायटिका)', detailEn: 'Low Back Pain Radiating to Leg (Sciatica)' },
    { code: 'NSU-C05', categoryKey: 'SPI', detail: 'दोनों पैरों में कमजोरी, चलने में दिक्कत', detailEn: 'Progressive Bilateral Leg Weakness (Red Flag)' },
    { code: 'NSU-C06', categoryKey: 'SPI', detail: 'जवान उम्र में पीठ/कूल्हे की आड़ में दर्द', detailEn: 'Young-Age Back Pain (Spine TB Suspect)' },
    { code: 'NSU-C07', categoryKey: 'SPI', detail: 'गर्दन की हड्डी की उम्र (स्पॉन्डिलोसिस)', detailEn: 'Cervical Spondylosis (Age-Related)' },
    { code: 'NSU-C08', categoryKey: 'SPI', detail: 'पीठ में गांठ/कुबड़ (डिफॉर्मिटी)', detailEn: 'Back Deformity (Hump/Kyphosis)' },
    { code: 'NSU-C09', categoryKey: 'SPI', detail: 'फिजियो के बाद स्पाइन फॉलो-अप', detailEn: 'Spine Follow-up After Physiotherapy' },
    // BRA — Brain symptoms
    { code: 'NSU-C10', categoryKey: 'BRA', detail: 'रात/सुबह बदलता तेज़ सिरदर्द', detailEn: 'Changing Severe Headache (Night/Morning Pattern)' },
    { code: 'NSU-C11', categoryKey: 'BRA', detail: 'अचानक बिजली जैसा सबसे तेज़ सिरदर्द', detailEn: 'Sudden Thunderclap Headache (Emergency)' },
    { code: 'NSU-C12', categoryKey: 'BRA', detail: 'दौरे के ऑपरेशन की सलाह (मूल्यांकन)', detailEn: 'Epilepsy Surgery Evaluation Consult' },
    { code: 'NSU-C13', categoryKey: 'BRA', detail: 'चेहरे में बिजली जैसा दर्द (ट्राइजेमिनल)', detailEn: 'Facial Electric-Shock Pain (Trigeminal Neuralgia)' },
    // CON — Congenital & pediatric
    { code: 'NSU-C14', categoryKey: 'CON', detail: 'बच्चे का सिर बड़ा/बढ़ता हुआ (हाइड्रोसेफलस संदिग्ध)', detailEn: "Child's Enlarging Head (Hydrocephalus Suspect)" },
    // POS — Post-operative
    { code: 'NSU-C15', categoryKey: 'POS', detail: 'ट्यूमर के ऑपरेशन के बाद (क्रेनियोटॉमी)', detailEn: 'Post-Craniotomy Follow-up' },
    { code: 'NSU-C16', categoryKey: 'POS', detail: 'कमर ऑपरेशन के बाद', detailEn: 'Post-Spine-Surgery Follow-up' },
  ],

  // ══ Questions (32 — 2 per complaint; // idx N = true 0-based index) ════
  questions: [
    // idx 0 — NSU-C01
    { complaintCode: 'NSU-C01', question: 'चोट कब और कैसे लगी, और उसके बाद उल्टी हुई है?', questionEn: 'When and how did the head injury happen, and have you vomited since?' },
    // idx 1 — NSU-C01
    { complaintCode: 'NSU-C01', question: 'खून पतला करने की दवा (एस्पिरिन/वारफारिन) या शराब लेते हैं?', questionEn: 'Do you take blood thinners (aspirin/warfarin) or consume alcohol?' },
    // idx 2 — NSU-C02
    { complaintCode: 'NSU-C02', question: 'कितनी देर बेहोश रहे और घटना के आसपास कितना समय याद नहीं?', questionEn: 'How long were you unconscious, and how much time around the event is missing from memory?' },
    // idx 3 — NSU-C02
    { complaintCode: 'NSU-C02', question: 'चोट के बाद से असामान्य नींद, भ्रम, झटके या चिड़चिड़ापन दिखा है?', questionEn: 'Since the injury, any unusual sleepiness, confusion, jerks or irritability?' },
    // idx 4 — NSU-C03
    { complaintCode: 'NSU-C03', question: 'दर्द गर्दन से कहां तक जाता है और उंगलियों में सुन्नपन कहां महसूस होता है?', questionEn: 'Where does the neck pain travel to, and in which fingers is there numbness?' },
    // idx 5 — NSU-C03
    { complaintCode: 'NSU-C03', question: 'दिन में कौन सा काम ज्यादा है (कंप्यूटर/फोन/भारी उठाना) और सुबह गर्दन कैसी लगती है?', questionEn: 'Which activity dominates your day (computer/phone/heavy lifting), and how does the neck feel in the morning?' },
    // idx 6 — NSU-C04
    { complaintCode: 'NSU-C04', question: 'दर्द पैर के किस हिस्से तक जाता है और खांसी/छींक से बिजली जैसा बढ़ता है?', questionEn: 'Which part of the leg does the pain reach, and does coughing/sneezing shoot it up like an electric current?' },
    // idx 7 — NSU-C04
    { complaintCode: 'NSU-C04', question: 'पैर में कमजोरी, जांघ/गुप्तांग के आसपास सुन्नपन, या पेशाब पर नियंत्रण में बदलाव?', questionEn: 'Any leg weakness, numbness around inner thighs/saddle area, or change in bladder control?' },
    // idx 8 — NSU-C05
    { complaintCode: 'NSU-C05', question: 'कमजोरी कब से है, कितनी तेज़ी से बढ़ रही है, और अब कैसे चलते हैं (छड़ी/सहारा)?', questionEn: 'Since when is the weakness, how fast is it progressing, and how do you walk now (stick/support)?' },
    // idx 9 — NSU-C05
    { complaintCode: 'NSU-C05', question: 'पेशाब/पाखाने पर नियंत्रण बना है या रुकना/रिसाव जैसा कुछ शुरू हुआ है?', questionEn: 'Is bladder/bowel control intact, or has something like retention/leakage started?' },
    // idx 10 — NSU-C06
    { complaintCode: 'NSU-C06', question: 'दर्द रात में बढ़ता है और पिछले महीनों में वजन/भूख गिरी है?', questionEn: 'Is the pain worse at night, and have you lost weight/appetite over recent months?' },
    // idx 11 — NSU-C06
    { complaintCode: 'NSU-C06', question: 'बुखार, रात के पसीने या घर/परिवार में किसी को टीबी है/थी?', questionEn: 'Any fever, night sweats, or anyone at home with TB (current or past)?' },
    // idx 12 — NSU-C07
    { complaintCode: 'NSU-C07', question: 'गर्दन का दर्द कितने महीनों/सालों से है और कब-कब बढ़ता है?', questionEn: 'For how many months/years has the neck pain been there, and when does it flare?' },
    // idx 13 — NSU-C07
    { complaintCode: 'NSU-C07', question: 'चक्कर आते हैं या हाथ के महीन काम (बटन/लिखना/सिक्का उठाना) में दिक्कत है?', questionEn: 'Do you get dizzy, or is there difficulty with fine hand tasks (buttons/writing/picking coins)?' },
    // idx 14 — NSU-C08
    { complaintCode: 'NSU-C08', question: 'कुबड़/गांठ कब से दिखी और वह बढ़ रही है?', questionEn: 'Since when is the hump/lump visible, and is it increasing?' },
    // idx 15 — NSU-C08
    { complaintCode: 'NSU-C08', question: 'उसके साथ दर्द, दोनों पैरों में कमजोरी या सांस फूलना भी है?', questionEn: 'Along with it, is there pain, both-leg weakness, or breathlessness?' },
    // idx 16 — NSU-C09
    { complaintCode: 'NSU-C09', question: 'फिजियोथेरेपी कितने दिन/हफ्ते से चल रही है और क्या फर्क दिखा?', questionEn: 'For how many days/weeks has physiotherapy been running, and what difference has it made?' },
    // idx 17 — NSU-C09
    { complaintCode: 'NSU-C09', question: 'घर पर आराम, गर्म सिकाई और बैठने-उठने की मुद्रा का ध्यान कैसे रखा?', questionEn: 'How have you managed rest, hot fomentation and sitting-lifting posture at home?' },
    // idx 18 — NSU-C10
    { complaintCode: 'NSU-C10', question: 'सिरदर्द कब से है, रात/सुबह कैसे बदलता है, और उल्टी के बाद हल्का हो जाता है?', questionEn: 'Since when is the headache, how does it change night/morning, and does it ease after vomiting?' },
    // idx 19 — NSU-C10
    { complaintCode: 'NSU-C10', question: 'देखने में धुंधलापन/दो जैसा दिखना या कभी झटके हुए हैं?', questionEn: 'Any blurring/double vision, or have there been any jerks/seizures?' },
    // idx 20 — NSU-C11
    { complaintCode: 'NSU-C11', question: 'सिरदर्द कितनी तेज़ी से चरम पर पहुंचा (सेकंडों में "जीवन का सबसे तेज़ दर्द") और गर्दन जकड़ी है?', questionEn: 'How fast did the headache peak (worst-of-life in seconds), and is the neck stiff?' },
    // idx 21 — NSU-C11
    { complaintCode: 'NSU-C11', question: 'पहले कभी ऐसा हुआ था और ब्लड प्रेशर की जांच हुई है?', questionEn: 'Has this happened before, and has your blood pressure been checked?' },
    // idx 22 — NSU-C12
    { complaintCode: 'NSU-C12', question: 'दौरे कब से हैं, कौन सी दवाइयां चल रही हैं, और पूरा नियंत्रण है?', questionEn: 'Since when are the seizures, which medicines are running, and are they fully controlled?' },
    // idx 23 — NSU-C12
    { complaintCode: 'NSU-C12', question: 'दो ढंग की दवाओं पर भी दौरे आते रहते हैं, और जांच (EEG/MRI) कब हुई थी?', questionEn: 'Do seizures persist despite two proper medicines, and when were the tests (EEG/MRI) done?' },
    // idx 24 — NSU-C13
    { complaintCode: 'NSU-C13', question: 'दर्द चेहरे के किस हिस्से में है, कितनी देर रहता है, और किस चीज़ से छनकता है (ब्रश/चबाना/हवा)?', questionEn: 'Which part of the face, how long does each shock last, and what triggers it (brushing/chewing/wind)?' },
    // idx 25 — NSU-C13
    { complaintCode: 'NSU-C13', question: 'न्यूरोलॉजिस्ट की कौन सी दवा चल रही है और उसका असर/साइड-इफेक्ट कैसा रहा?', questionEn: 'Which neurologist-started medicine is running, and how has its effect/side-effects been?' },
    // idx 26 — NSU-C14
    { complaintCode: 'NSU-C14', question: "बच्चे की उम्र क्या है और सिर तेज़ी से बढ़ रहा है (टोपी/कपड़े बार-बार छोटे पड़ते हैं)?", questionEn: "What is the baby's age, and is the head growing fast (caps/clothes repeatedly falling short)?" },
    // idx 27 — NSU-C14
    { complaintCode: 'NSU-C14', question: 'बच्चा उन्नति कर रहा है — दूध उल्टी, लगातार चिड़चिड़ापन, ज्यादा नींद या आंखें नीचे झुकी दिखना?', questionEn: 'Is the baby developing normally — vomiting feeds, constant irritability, excessive sleepiness or downward-gazing eyes?' },
    // idx 28 — NSU-C15
    { complaintCode: 'NSU-C15', question: 'ऑपरेशन कब हुआ और उसके बाद से क्या बदला — नया सिरदर्द, उल्टी, दौरा या कमजोरी?', questionEn: 'When was the surgery, and what has changed since — new headache, vomiting, seizure or weakness?' },
    // idx 29 — NSU-C15
    { complaintCode: 'NSU-C15', question: 'दवाइयां (स्टेरॉयड/दौरे की) नियम से चल रही हैं और पिछली MRI कब हुई?', questionEn: 'Are the medicines (steroids/anti-seizure) running as advised, and when was the last MRI?' },
    // idx 30 — NSU-C16
    { complaintCode: 'NSU-C16', question: 'कमर का ऑपरेशन कब हुआ, दर्द कितना बचा है और पैर तक जाता है?', questionEn: 'When was the spine surgery, how much pain remains, and does it go down the leg?' },
    // idx 31 — NSU-C16
    { complaintCode: 'NSU-C16', question: 'टहलना कैसा जाता है और घाव, पेशाब या कब्ज की हालत कैसी है?', questionEn: 'How is walking going, and how are the wound, bladder and bowels?' },
  ],

  // ══ Suggestions (64 — exactly 2 per question, questionIndex 0-31) ═══
  suggestions: [
    // q0
    { questionIndex: 0, text: 'चोट के बाद एक भी उल्टी को नजरअंदाज न करें — डॉक्टर को बताएं', textEn: 'Do not ignore even a single vomit after a head injury — tell the doctor' },
    { questionIndex: 0, text: 'दो या ज्यादा उल्टियां गंभीर समझी जाती हैं — उसी घंटे अस्पताल पहुंचें', textEn: 'Two or more vomits are treated as serious — reach hospital within the same hour' },
    // q1
    { questionIndex: 1, text: 'खून-पतला करने की दवा चल रही हो तो चोट के बाद खतरा कई गुना बढ़ जाता है — दवाओं की पर्ची साथ लाएं', textEn: 'If you are on blood thinners, risk multiplies after a head injury — bring the prescription with you' },
    { questionIndex: 1, text: 'चोट के बाद खून-पतली दवा खुद बंद या दोबारा शुरू न करें — दोनों खतरनाक हैं, डॉक्टर से पूछें', textEn: 'Never stop or restart a blood thinner on your own after a head injury — both are dangerous; ask the doctor' },
    // q2
    { questionIndex: 2, text: 'बेहोशी 30 सेकंड से ज्यादा की रही हो या घटना का हिस्सा याद नहीं — CT स्कैन की राय लें', textEn: 'If unconsciousness lasted over 30 seconds or part of the event is missing from memory — seek a CT scan opinion' },
    { questionIndex: 2, text: 'घटना से पहले/बाद की याददाश्त का गैप लिखकर रखें — जांच में काम आता है', textEn: 'Note down the memory gap before/after the event — it helps the workup' },
    // q3
    { questionIndex: 3, text: 'असामान्य नींद/भ्रम/झटके = रात में भी अस्पताल — सुबह का इंतजार नहीं', textEn: 'Unusual sleepiness/confusion/jerks = hospital even at night — no waiting till morning' },
    { questionIndex: 3, text: 'निगरानी कार्ड पर 24-48 घंटे की जांचें घर के किसी जागरूक सदस्य को सौंपें — हर 2 घंटे जगाकर देखें', textEn: 'Assign a watchful family member to run the 24-48 hour checks on the observation card — wake and check every 2 hours' },
    // q4
    { questionIndex: 4, text: 'दर्द हाथ तक जाने पर गर्दन की जांच (एक्स-रे, जरूरी हो तो EMG) जरूरी हो जाती है', textEn: 'When pain travels to the arm, neck tests (X-ray, EMG if advised) become necessary' },
    { questionIndex: 4, text: 'तकिया गर्दन की लय में रखें — बहुत ऊंचा तकिया दर्द बढ़ाता है', textEn: 'Keep the pillow in line with the neck — a very high pillow worsens the pain' },
    // q5
    { questionIndex: 5, text: 'कंप्यूटर/फोन पर हर 30-45 मिनट में गर्दन का स्ट्रेच करें — सोने से पहले 5 मिनट गर्म सिकाई आराम देती है', textEn: 'Do neck stretches every 30-45 minutes at the computer/phone — 5 minutes of hot fomentation before bed helps' },
    { questionIndex: 5, text: 'सुबह अकड़न ज्यादा हो तो गद्दे की जांच कराएं — बहुत नरम या झुका गद्दा दोनों बुरे हैं', textEn: 'If morning stiffness is high, check the mattress — very soft or sagging, both are bad' },
    // q6
    { questionIndex: 6, text: 'खांसी-छींक से बिजली जैसा बढ़ना डिस्क से जुड़ा संकेत है — 90% लोगों को 6 हफ्ते के रूढ़िवादी इलाज में सुधार आता है', textEn: 'Electric worsening on cough/sneeze points to a disc link — 90% improve with 6 weeks of conservative care' },
    { questionIndex: 6, text: 'दर्द के दिन बिस्तर पर घुटनों के नीचे तकिया रखें — जरूरत से ज्यादा बिस्तर पर न रहें', textEn: 'On pain days, keep a pillow under the knees — but do not stay in bed beyond what is needed' },
    // q7
    { questionIndex: 7, text: 'गुप्तांग के आसपास सुन्नपन या पेशाब की तकलीफ = आपातकाल — उसी दिन, रात हो तो रात में ही अस्पताल', textEn: 'Numbness around the private area or urinary difficulty = EMERGENCY — same day, and at night itself if it is night' },
    { questionIndex: 7, text: 'इन लक्षणों को "शुगर/बुढ़ापा" समझकर न बैठें — देर से इलाज स्थायी नुकसान छोड़ सकता है', textEn: 'Do not dismiss these symptoms as "sugar/old age" — late treatment can leave permanent damage' },
    // q8
    { questionIndex: 8, text: 'दोनों पैरों की बढ़ती कमजोरी रीढ़ की नस पर दबाव का बड़ा संकेत है — इस हफ्ते नहीं, आज जांच शुरू करें', textEn: 'Progressive weakness of both legs is a major sign of pressure on the spinal cord — start the workup today, not this week' },
    { questionIndex: 8, text: 'गिरने से बचें — चलने में छड़ी/वॉकर जैसी मदद लें और फिसलन वाली जगहों से दूर रहें', textEn: 'Avoid falls — use a stick/walker for walking and avoid slippery areas' },
    // q9
    { questionIndex: 9, text: 'पेशाब रुकना/रिसाव या पाखाना अनियंत्रण = कॉडा इक्विना — तय 24 घंटे के भीतर होता है, तुरंत अस्पताल', textEn: 'Urinary retention/leak or bowel incontinence = cauda equina — decisions come within 24 hours; go to hospital now' },
    { questionIndex: 9, text: 'यह स्थिति शर्म की नहीं, घंटों की दौड़ की है — किसी भरोसेमंद के साथ तुरंत निकलें', textEn: 'This is not a situation of embarrassment but of hours — leave immediately with someone you trust' },
    // q10
    { questionIndex: 10, text: 'रात का बढ़ता दर्द + गिरता वजन/भूख रीढ़-टीबी का शास्त्रीय संयोजन है — जांच (एक्स-रे/MRI) न टालें', textEn: 'Night-dominant pain + falling weight/appetite is the classic combination of spine TB — do not postpone imaging (X-ray/MRI)' },
    { questionIndex: 10, text: 'भारत में जवान उम्र की कमर दर्द में टीबी आम कारण है — निर्णय जांच से आता है, अंदाज़े से नहीं', textEn: 'In India TB is a common cause of young-age back pain — the answer comes from tests, not guesswork' },
    // q11
    { questionIndex: 11, text: 'घर/परिवार में टीबी का इतिहास जरूर बताएं — जांच और निगरानी उसी हिसाब से बनती है', textEn: 'Definitely mention any TB history at home — testing and monitoring are planned around it' },
    { questionIndex: 11, text: 'टीबी का इलाज सरकारी NTEP केंद्रों पर नि:शुल्क मिलता है — दवा पूरी अवधि तक जारी रखना ही पूरा इलाज है', textEn: 'TB treatment is free at government NTEP centres — continuing the full course of medicines IS the cure' },
    // q12
    { questionIndex: 12, text: 'उम्र के साथ गर्दन की हड्डी में बदलाव (स्पॉन्डिलोसिस) सामान्य है — सही मुद्रा से दर्द पर काबू रहता है', textEn: 'Age-related changes in the neck bones (spondylosis) are common — posture keeps the pain in check' },
    { questionIndex: 12, text: 'गर्दन के व्यायाम रोज़ करें — दर्द बढ़ने के दिन गर्म सिकाई और आराम', textEn: 'Do neck exercises daily — on flare days, hot fomentation and rest' },
    // q13
    { questionIndex: 13, text: 'बटन लगाना/लिखना बिगड़ना या चक्कर नस पर दबाव के संकेत हो सकते हैं — जांच जरूरी', textEn: 'Declining buttons/writing or dizziness can be signs of pressure on the cord — testing is needed' },
    { questionIndex: 13, text: 'गर्दन की ताकत से ऐडजस्टमेंट/मालिश वाला "गला मिलाना" न करवाएं — सावधानी बेहतर है', textEn: 'Avoid forceful neck adjustment/massage "cracking" — caution is better' },
    // q14
    { questionIndex: 14, text: 'बढ़ता कुबड़ उम्र के कारण या जवान उम्र की वजह से हो सकता है — दोनों की जांच अलग चलती है', textEn: 'A growing hump may be age-related or from a young-age cause — the workup differs for each' },
    { questionIndex: 14, text: 'बच्चों की झुकी पीठ की जांच स्कूल उम्र में ही करा दें — ब्रेस जल्दी शुरू हो तो असर ज्यादा होता है', textEn: 'Get a child’s bent spine checked in the school years itself — braces started early work better' },
    // q15
    { questionIndex: 15, text: 'कुबड़ के साथ दोनों पैरों की कमजोरी रीढ़ की नस पर दबाव का संकेत है — तुरंत जांच कराएं', textEn: 'Both-leg weakness appearing with a spinal hump signals pressure on the cord — get urgent testing' },
    { questionIndex: 15, text: 'सांस फूलना या कद का घटना भी बताएं — पीठ की बनावट से जुड़ा हो सकता है', textEn: 'Also report breathlessness or loss of height — it can be linked to spinal shape' },
    // q16
    { questionIndex: 16, text: 'फिजियो का असर 2-4 हफ्ते में दिखना चाहिए — न दिखे तो योजना बदलने/जांच की बारी है', textEn: 'Physiotherapy should show effect in 2-4 weeks — if not, it is time to change the plan or investigate' },
    { questionIndex: 16, text: 'फिजियो की डायरी/कॉपी लेकर आएं — अभ्यास सही ढंग से हो रहे हैं या नहीं देखा जाएगा', textEn: 'Bring the physiotherapy diary — the exercises will be reviewed for correctness' },
    // q17
    { questionIndex: 17, text: 'गर्म सिकाई पुराने दर्द में, बर्फ ताज़ा तेज़ सूजन में — दोनों का समय अलग है', textEn: 'Hot fomentation for chronic pain, ice for fresh severe swelling — their timing differs' },
    { questionIndex: 17, text: 'लंबा बैठना 45 मिनट से ज्यादा न रहे — हर घंटे उठकर 2 मिनट टहलें', textEn: 'Do not sit for more than 45 minutes at a stretch — stand up and walk 2 minutes every hour' },
    // q18
    { questionIndex: 18, text: 'सुबह का बढ़ता सिरदर्द जो उल्टी के बाद हल्का पड़े — यह पैटर्न जांच (MRI) मांगता है, टालें नहीं', textEn: 'A morning-worsening headache that eases after vomiting — this pattern demands imaging (MRI); do not postpone' },
    { questionIndex: 18, text: 'इस पैटर्न को दर्द-हरण गोली से दबाना जांच में देर करा देता है', textEn: 'Masking this pattern with painkillers delays the diagnosis' },
    // q19
    { questionIndex: 19, text: 'देखने में धुंधलापन/दोहरा दिखना या झटके हुए हों तो तुरंत बताएं — ये तत्काल जांच के संकेत हैं', textEn: 'Report blurring/double vision or any jerks right away — these are signs for urgent workup' },
    { questionIndex: 19, text: 'नई शुरुआत का ऐसा सिरदर्द पुराना साधारण सिरदर्द नहीं होता — रिपोर्ट/पर्चियां लेकर आएं', textEn: 'A newly started headache of this kind is not an ordinary one — bring any reports/prescriptions' },
    // q20
    { questionIndex: 20, text: 'सेकंडों में चरम पर पहुंचता "जीवन का सबसे तेज़ सिरदर्द" = आपातकाल — एंबुलेंस/टैक्सी बुलाएं; गोली खाकर लेटना नहीं', textEn: 'The "worst headache of life" peaking within seconds = EMERGENCY — call an ambulance/taxi; do not take a tablet and lie down' },
    { questionIndex: 20, text: 'गर्दन जकड़न या बेहोशी साथ हो तो और भी जल्दी — पहले घंटों का CT स्कैन ही काम आता है', textEn: 'With neck stiffness or fainting, be even faster — a CT scan in the first hours is what works' },
    // q21
    { questionIndex: 21, text: 'बहुत ऊंचा ब्लड प्रेशर भी ऐसा दर्द दे सकता है — BP की जांच तुरंत कराएं', textEn: 'Very high blood pressure can also cause such pain — get BP checked immediately' },
    { questionIndex: 21, text: 'पुराना सिरदर्द "हमेशा जैसा" लगता है — नया बज्रिका दर्द अलग होता है; भ्रम में न रहें', textEn: 'An old headache feels "the same as always" — a new thunderclap feels different; do not stay confused' },
    // q22
    { questionIndex: 22, text: 'दौरे की दवा नियम से चलाना ही नियंत्रण की चाबी है — खुद बंद करने पर दौरे लौट आते हैं', textEn: 'Running anti-seizure medicines regularly is the key to control — stopping them brings seizures back' },
    { questionIndex: 22, text: 'दवाओं की पर्ची (नाम + खुराक) साथ लाएं — ऑपरेशन की राय उसी के ऊपर बनती है', textEn: 'Bring the prescription (names + doses) — the surgical opinion builds on it' },
    // q23
    { questionIndex: 23, text: 'दो ढंग की दवाओं पर भी दौरे आते रहें तो ऑपरेशन की राय लेने का समय है — वीडियो-EEG/MRI जैसी जांच जरूरी होती है', textEn: 'If seizures persist despite two proper medicines, it is time for a surgical opinion — workup like video-EEG/MRI is needed' },
    { questionIndex: 23, text: 'जांच की CD/रिपोर्ट लेकर आएं — बिना रिपोर्ट की राय अधूरी रहती है', textEn: 'Bring the test CDs/reports — an opinion without reports stays incomplete' },
    // q24
    { questionIndex: 24, text: 'चेहरे का बिजली-दर्द छूने/चबाने/ठंडी हवा से छनकता है — यह नस-दर्द की पहचान है', textEn: 'Facial electric pain triggered by touch/chewing/cold air — that is the signature of nerve pain' },
    { questionIndex: 24, text: 'दर्द की डायरी रखें — कौन सा बिंदु दर्द छेड़ता है, यह इलाज की योजना में काम आता है', textEn: 'Keep a pain diary — which trigger point sets off the pain helps the treatment plan' },
    // q25
    { questionIndex: 25, text: 'दवा का असर घटना या चक्कर/नींद जैसा साइड-इफेक्ट — खुद खुराक बढ़ाना नहीं, डॉक्टर को बताना ठीक है', textEn: 'If the medicine is losing effect or causing dizziness/sedation — report it; never self-increase the dose' },
    { questionIndex: 25, text: 'कार्बामाज़पीन जैसी दवाओं पर समय-समय पर खून की जांच होती है — तारीख पूछकर डायरी में लिखें', textEn: 'Medicines like carbamazepine need periodic blood tests — ask for the schedule and note it in your diary' },
    // q26
    { questionIndex: 26, text: 'बच्चे का सिर तेज़ी से बढ़ना या टोपी बार-बार छोटी पड़ना — हाइड्रोसेफलस की जांच जरूरी है', textEn: 'A baby’s head growing fast or caps repeatedly falling short — hydrocephalus workup is needed' },
    { questionIndex: 26, text: 'मेज़रिंग टेप से सिर का घेरा महीने में एक बार नापकर नोट करें — डॉक्टर को दिखाएं', textEn: 'Measure the head circumference with a tape once a month and note it — show it to the doctor' },
    // q27
    { questionIndex: 27, text: 'आंखें नीचे झुकी दिखना ("सूर्यास्त"), उन्नति का पीछे चलना या लगातार चिड़चिड़ापन = तुरंत बाल-न्यूरोसर्जन', textEn: '"Sunset" eyes, regressing milestones or constant irritability = paediatric neurosurgeon right away' },
    { questionIndex: 27, text: 'माथे की उभरी नसें और तना हुआ नरम माथा भी संकेत हैं — तस्वीर लेकर आएं', textEn: 'Prominent forehead veins and a tense soft spot are signs too — bring photos' },
    // q28
    { questionIndex: 28, text: 'ऑपरेशन के बाद नया सिरदर्द/उल्टी/दौरा/कमजोरी को "ठीक हो जाएगा" समझकर न बैठें — तुरंत रिपोर्ट करें', textEn: 'New headache/vomiting/seizure/weakness after brain surgery must not be watched at home — report immediately' },
    { questionIndex: 28, text: 'स्टेरॉयड दवा अधूरी छोड़ना खतरनाक है — वह डॉक्टर की देखरेख में ही धीरे-धीरे घटाई जाती है', textEn: 'Stopping steroid medicines midway is dangerous — they are tapered gradually only under supervision' },
    // q29
    { questionIndex: 29, text: 'दौरे की दवा चल रही हो तो बिना पूछे कभी न रोकें — चालू रखना ही सुरक्षा है', textEn: 'If anti-seizure medicines are running, never stop them without asking — continuing is the safety' },
    { questionIndex: 29, text: 'MRI की तारीख डायरी में लिखें — ट्यूमर की निगरानी की कड़ी यही है', textEn: 'Write the MRI date in your diary — this is the key link of tumour surveillance' },
    // q30
    { questionIndex: 30, text: 'ऑपरेशन के बाद बचा दर्द धीरे-धीरे घटता है — पैर तक नया दर्द या कमजोरी शुरू हो तो तुरंत बताएं', textEn: 'Residual pain after spine surgery settles gradually — report any NEW leg pain or weakness right away' },
    { questionIndex: 30, text: 'बैठने-उठने में पीठ सीधी रखें — झुककर नहीं, घुटनों के बल उठें', textEn: 'Keep the back straight while sitting and rising — rise with the knees, not by bending forward' },
    // q31
    { questionIndex: 31, text: 'रोज़ टहलने की दूरी नोट करें — हफ्ते-दर-हफ्ते बढ़ना अच्छा संकेत है', textEn: 'Note your daily walking distance — a weekly increase is a good sign' },
    { questionIndex: 31, text: 'घाव से पानी, पेशाब में जलन बनी रहे, या कब्ज 3 दिन से ज्यादा हो तो बताएं', textEn: 'Report persistent wound discharge, burning urine, or constipation beyond 3 days' },
  ],

  // ══ Labels (8) — neuro triage vitals ══════════════════════════════════
  labels: [
    { label: 'GCS (रिपोर्ट हो तो)', labelEn: 'GCS (if known)', unit: '', showUnit: false },
    { label: 'दर्द अंक (0-10)', labelEn: 'Pain Score (0-10)', unit: '', showUnit: false },
    { label: 'चोट को हुए दिन', labelEn: 'Days Since Injury', unit: 'days' },
    { label: 'कमजोरी बढ़ रही है? (हाँ/नहीं)', labelEn: 'Weakness Progressing (Y/N)', unit: '', showUnit: false },
    { label: 'पेशाब नियंत्रण (हाँ/नहीं)', labelEn: 'Bladder Control (Y/N)', unit: '', showUnit: false },
    { label: 'बुखार (हाँ/नहीं)', labelEn: 'Fever (Y/N)', unit: '', showUnit: false },
    { label: 'सुबह का सिरदर्द पैटर्न (हाँ/नहीं)', labelEn: 'Morning Headache Pattern (Y/N)', unit: '', showUnit: false },
    { label: 'बिना रुके चलने की दूरी', labelEn: 'Walking Distance (uninterrupted)', unit: 'm' },
  ],

  // ══ Findings (18: 9 managed + 9 refer-only) ═══════════════════════════
  // Refer-only findings (HEAD-INJURY-SEVERE … STROKE-ACUTE-REFER)
  // deliberately have ZERO findingMeds links — hours matter, not tablets.
  findings: [
    // Managed (links allowed)
    { key: 'HEAD-INJURY-MILD-OBSERVE', name: 'सिर की मामूली चोट — 24-48 घंटे निगरानी', nameEn: 'Mild Head Injury — 24-48 h Observation', icd10: 'S06.0' },
    { key: 'MECHANICAL-BACK-PAIN', name: 'यांत्रिक कमर दर्द (मुद्रा-संबंधी)', nameEn: 'Mechanical Back Pain (Postural)', icd10: 'M54.5' },
    { key: 'LUMBAR-RADICULOPATHY-SCIATICA', name: 'कमर दर्द पैर तक (सायटिका) — रूढ़िवादी 6-सप्ताह देखभाल', nameEn: 'Lumbar Radiculopathy (Sciatica) — Conservative 6-Week Care', icd10: 'M54.4' },
    { key: 'CERVICAL-RADICULOPATHY', name: 'गर्दन दर्द हाथ तक (सर्वाइकल रेडिक्युलोपैथी)', nameEn: 'Cervical Radiculopathy', icd10: 'M54.12' },
    { key: 'CERVICAL-SPONDYLOSIS-CHRONIC', name: 'गर्दन की हड्डी की उम्र (स्पॉन्डिलोसिस) — दीर्घकालिक', nameEn: 'Cervical Spondylosis — Chronic', icd10: 'M47.8' },
    { key: 'LUMBAR-CANAL-STENOSIS', name: 'कमर नहर सिकुड़न (स्टेनोसिस) — झुककर चलने में राहत', nameEn: 'Lumbar Canal Stenosis — Shopping-Cart Relief Pattern', icd10: 'M48.062' },
    { key: 'POST-CRANIOTOMY-STABLE', name: 'ट्यूमर ऑपरेशन-पश्चात स्थिर फॉलो-अप', nameEn: 'Post-Craniotomy Stable Follow-up', icd10: 'Z48.812' },
    { key: 'POST-SPINE-SURGERY-STABLE', name: 'कमर ऑपरेशन-पश्चात स्थिर फॉलो-अप', nameEn: 'Post-Spine-Surgery Stable Follow-up', icd10: 'Z48.812' },
    { key: 'TRIGEMINAL-NEURALGIA-POST-EVAL', name: 'चेहरे का बिजली-दर्द (ट्राइजेमिनल) — NEU समन्वय', nameEn: 'Trigeminal Neuralgia — Post-Evaluation (coordinate NEU)', icd10: 'G50.0' },
    // Refer-only (ZERO findingMeds links below — by design)
    { key: 'HEAD-INJURY-SEVERE', name: 'सिर की गंभीर चोट — CT/अस्पताल अभी (GCS ≤13 / बार-बार उल्टी / दौरा / रक्त-पतला) (केवल रेफर)', nameEn: 'Severe Head Injury — CT/Hospital NOW (GCS ≤13 / repeated vomiting / seizure / anticoagulant) (Refer ONLY)', icd10: 'S06.9' },
    { key: 'CORD-COMPRESSION-RED-FLAG', name: 'रीढ़-रज्जु संपीड़न — आपातकाल (बढ़ती कमजोरी/पेशाब-पाखाना) (केवल रेफर)', nameEn: 'Spinal Cord Compression — EMERGENCY (progressive weakness/bladder-bowel) (Refer ONLY)', icd10: 'G95.2' },
    { key: 'CAUDA-EQUINA-SUSPECT', name: 'कॉडा इक्विना संदिग्ध — आपातकाल (गुप्तांग सुन्नपन + पेशाब रुकना) (केवल रेफर)', nameEn: 'Cauda Equina Suspect — EMERGENCY (saddle numbness + retention) (Refer ONLY)', icd10: 'G83.4' },
    { key: 'RAISED-ICP-SUSPECT', name: 'बढ़ा मस्तिष्क-दबाव संदिग्ध — तत्काल जांच (केवल रेफर)', nameEn: 'Raised ICP Suspect — Urgent Workup (Refer ONLY)', icd10: 'G93.2' },
    { key: 'BRAIN-TUMOR-SUSPECT-REFER', name: 'मस्तिष्क ट्यूमर संदिग्ध — MRI जांच रेफर (केवल रेफर)', nameEn: 'Brain Tumour Suspect — MRI Workup Referral (Refer ONLY)', icd10: 'D49.6' },
    { key: 'ANEURYSM-SUSPECT', name: 'फटा हुआ एन्यूरिज्म संदिग्ध — आपातकाल (बज्रिका सिरदर्द) (केवल रेफर)', nameEn: 'Ruptured Aneurysm Suspect — EMERGENCY (thunderclap headache) (Refer ONLY)', icd10: 'I60.9' },
    { key: 'SPINE-TB-SUSPECT', name: 'रीढ़-टीबी संदिग्ध — NTEP रेफर (PUL समन्वय) (केवल रेफर)', nameEn: 'Spine TB Suspect — NTEP Referral (coordinate PUL) (Refer ONLY)', icd10: 'M49.0' },
    { key: 'HYDROCEPHALUS-CHILD-REFER', name: 'बच्चे का हाइड्रोसेफलस संदिग्ध — तुरंत बाल-विशेषज्ञ रेफर (केवल रेफर)', nameEn: 'Child Hydrocephalus Suspect — Urgent Paediatric Referral (Refer ONLY)', icd10: 'G91.9' },
    { key: 'STROKE-ACUTE-REFER', name: 'लकवा संदिग्ध — आपातकाल स्ट्रोक-केंद्र (NEU समन्वय) (केवल रेफर)', nameEn: 'Acute Stroke Suspect — Emergency Stroke Centre (coordinate NEU) (Refer ONLY)', icd10: 'I63.9' },
  ],

  // ══ Medicines (16) — conservative neuro-safe only ════════════════════
  // ⚠ Nerve-pain (pregabalin/gabapentin) + carbamazepine = CONTINUATION-
  // VERIFY framing only — NEU owns titration. No muscle relaxants (ORT
  // territory), no antiemetics for post-craniotomy vomiting (that is a
  // raised-ICP flag, not something to suppress at home).
  // verified: false until MBBS review.
  medicines: [
    // Analgesia ladder (paracetamol first)
    { name: 'Crocin 650 Tablet', salt: 'Paracetamol 650 mg (first-line for spine/head pain; regular by-the-clock beats SOS; max 3 g/day)', doseOptions: ['1 tab (650 mg) every 8 hrs'], morning: 1, afternoon: 1, evening: 1, tab: 21, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg (SHORT COURSE ≤5 days, after food, always with Pan 40; no OTC painkiller abuse)', doseOptions: ['1 tab after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (gastric protection with any NSAID course)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg (alternate PPI when pantoprazole not available)', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg (SOS ONLY for severe pain; regular use/escalation = specialist; dizziness/falls in elderly)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel (local neck/back rub — intact skin only)', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Nerve pain — CONTINUATION-VERIFY (NEU owns titration)
    { name: 'Pregalin 75 Capsule', salt: 'Pregabalin 75 mg (CONTINUATION-VERIFY: continue exactly the dose the neurologist started — never self-increase; dizziness/drowsiness — fall caution)', doseOptions: ['1 cap at bedtime — as started by neurologist'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabapin 100 Capsule', salt: 'Gabapentin 100 mg (CONTINUATION-VERIFY: continue specialist dose; sedation/fall caution in elderly)', doseOptions: ['1 cap at bedtime — as started by specialist'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Trigeminal neuralgia — continuation (NEU owns)
    { name: 'Tegretal CR 200 Tablet', salt: 'Carbamazepine CR 200 mg (CONTINUATION-VERIFY for trigeminal neuralgia: exactly as neurologist prescribed — never self-increase; rash/mouth ulcers = report; periodic blood counts)', doseOptions: ['1 tab twice daily — as per neurologist only'], morning: 1, afternoon: 0, evening: 1, tab: 20, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // Neuro support
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 (nerve support alongside radiculopathy care)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Methycobal 500 Tablet', salt: 'Mecobalamin (Vitamin B12) 500 mcg (nerve healing support)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Bone health (coordinate ORT/END)
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU (bone health — dose targets with ORT/END coordination)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules (weekly vitamin D — coordinate ORT/END)', doseOptions: ['1 sachet weekly with milk'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    // Recovery support
    { name: 'Meloset 3 Tablet', salt: 'Melatonin 3 mg (mild sleep support during recovery; non-habit forming; NOT in first 24-48 h after head injury — wake-checks come first)', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cremaffin Syrup 225ml', salt: 'Milk of Magnesia + Liquid Paraffin (constipation of recovery/less walking; mandatory alongside any regular Ultracet use)', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc (post-op recovery support)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (28 — refer-only findings ZERO links) ════
  findingMeds: [
    // HEAD-INJURY-MILD-OBSERVE (paracetamol only — no NSAIDs first 48 h)
    { findingKey: 'HEAD-INJURY-MILD-OBSERVE', medicineName: 'Crocin 650 Tablet', dose: '1 tab (650 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 6, description: 'Paracetamol ONLY for pain — avoid ibuprofen/aspirin in the first 48 h (bleeding risk); watch-card alongside' },
    // MECHANICAL-BACK-PAIN
    { findingKey: 'MECHANICAL-BACK-PAIN', medicineName: 'Crocin 650 Tablet', description: 'First-line — regular dosing on pain days' },
    { findingKey: 'MECHANICAL-BACK-PAIN', medicineName: 'Combiflam Tablet', description: 'Short course ≤5 days after food — only if paracetamol insufficient' },
    { findingKey: 'MECHANICAL-BACK-PAIN', medicineName: 'Pan 40 Tablet', description: 'Gastric cover whenever Combiflam runs' },
    { findingKey: 'MECHANICAL-BACK-PAIN', medicineName: 'Voveran Gel 30g', description: 'Local rub BD — intact skin; posture + hot fomentation are the real treatment' },
    // LUMBAR-RADICULOPATHY-SCIATICA (conservative 6-week framing)
    { findingKey: 'LUMBAR-RADICULOPATHY-SCIATICA', medicineName: 'Combiflam Tablet', description: 'Flare-days cover ≤5 days after food' },
    { findingKey: 'LUMBAR-RADICULOPATHY-SCIATICA', medicineName: 'Pan 40 Tablet', description: 'With the NSAID course' },
    { findingKey: 'LUMBAR-RADICULOPATHY-SCIATICA', medicineName: 'Pregalin 75 Capsule', description: 'CONTINUATION-VERIFY only — continue the neurologist-started dose, never self-increase' },
    { findingKey: 'LUMBAR-RADICULOPATHY-SCIATICA', medicineName: 'Neurobion Forte Tablet', description: 'Nerve support during the 6-week conservative window' },
    // CERVICAL-RADICULOPATHY
    { findingKey: 'CERVICAL-RADICULOPATHY', medicineName: 'Combiflam Tablet', description: 'Short course after food for arm pain days' },
    { findingKey: 'CERVICAL-RADICULOPATHY', medicineName: 'Pan 40 Tablet', description: 'Gastro-protection with the NSAID' },
    { findingKey: 'CERVICAL-RADICULOPATHY', medicineName: 'Gabapin 100 Capsule', description: 'CONTINUATION-VERIFY only — specialist dose continues unchanged' },
    // CERVICAL-SPONDYLOSIS-CHRONIC
    { findingKey: 'CERVICAL-SPONDYLOSIS-CHRONIC', medicineName: 'Crocin 650 Tablet', description: 'Long-term-safe analgesia — avoid daily NSAID habit' },
    { findingKey: 'CERVICAL-SPONDYLOSIS-CHRONIC', medicineName: 'Voveran Gel 30g', description: 'Local application on flare days' },
    { findingKey: 'CERVICAL-SPONDYLOSIS-CHRONIC', medicineName: 'Neurobion Forte Tablet', description: 'Daily nerve support' },
    { findingKey: 'CERVICAL-SPONDYLOSIS-CHRONIC', medicineName: 'Methycobal 500 Tablet', description: 'B12 support — numb-fingers pattern' },
    // LUMBAR-CANAL-STENOSIS (shopping-cart relief classic)
    { findingKey: 'LUMBAR-CANAL-STENOSIS', medicineName: 'Crocin 650 Tablet', description: 'Walking-distance analgesia baseline' },
    { findingKey: 'LUMBAR-CANAL-STENOSIS', medicineName: 'Pregalin 75 Capsule', description: 'CONTINUATION-VERIFY — neurologist dose only; flexion exercises + walking-pace plan alongside' },
    { findingKey: 'LUMBAR-CANAL-STENOSIS', medicineName: 'Neurobion Forte Tablet', description: 'Nerve support with the walking programme' },
    // POST-CRANIOTOMY-STABLE
    { findingKey: 'POST-CRANIOTOMY-STABLE', medicineName: 'Crocin 650 Tablet', description: 'Mild headache days — paracetamol only; NEW/worse headache with vomiting = report same day' },
    { findingKey: 'POST-CRANIOTOMY-STABLE', medicineName: 'Pan 40 Tablet', description: 'Stomach cover with pain days' },
    { findingKey: 'POST-CRANIOTOMY-STABLE', medicineName: 'Meloset 3 Tablet', description: 'Sleep pattern support once cleared by surgeon' },
    // POST-SPINE-SURGERY-STABLE
    { findingKey: 'POST-SPINE-SURGERY-STABLE', medicineName: 'Crocin 650 Tablet', description: 'Base analgesia for recovery weeks' },
    { findingKey: 'POST-SPINE-SURGERY-STABLE', medicineName: 'Pan 40 Tablet', description: 'With any NSAID course' },
    { findingKey: 'POST-SPINE-SURGERY-STABLE', medicineName: 'Neurobion Forte Tablet', description: 'Nerve recovery support' },
    { findingKey: 'POST-SPINE-SURGERY-STABLE', medicineName: 'Shelcal 500 Tablet', description: 'Bone healing support — ORT/END coordinate' },
    { findingKey: 'POST-SPINE-SURGERY-STABLE', medicineName: 'Cremaffin Syrup 225ml', description: 'Recovery-phase constipation + mandatory with any regular Ultracet' },
    // TRIGEMINAL-NEURALGIA-POST-EVAL
    { findingKey: 'TRIGEMINAL-NEURALGIA-POST-EVAL', medicineName: 'Tegretal CR 200 Tablet', description: 'CONTINUATION-VERIFY — exactly as neurologist prescribed; never self-increase; rash/ulcers = same-day report' },
    // HEAD-INJURY-SEVERE, CORD-COMPRESSION-RED-FLAG, CAUDA-EQUINA-SUSPECT,
    // RAISED-ICP-SUSPECT, BRAIN-TUMOR-SUSPECT-REFER, ANEURYSM-SUSPECT,
    // SPINE-TB-SUSPECT, HYDROCEPHALUS-CHILD-REFER, STROKE-ACUTE-REFER:
    // deliberately ZERO medicine links — emergency/refer territory.
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'HEAD-INJURY-WATCH-CARD (24-48h caregiver)',
      rows: 6,
      cols: 3,
      headerLabel: ['समय', 'जगाकर क्या देखें', 'खतरे पर क्या करें'],
      colsLabel: ['Time', 'Wake & Check', 'If Danger Signs'],
      footerLabel: ['हर 2 घंटे जगाएं — जवाब धुंधला/उल्टी/एक तरफ की कमजोरी/झटका = रात में भी अस्पताल · Wake every 2 h — confused answers/vomiting/one-sided weakness/fit = hospital even at night'],
    },
    {
      name: 'RED-FLAG-BACK-PAIN Checklist',
      rows: 8,
      cols: 2,
      headerLabel: ['लाल-झंडी लक्षण', 'इसका मतलब'],
      colsLabel: ['Red-Flag Symptom', 'What It Means'],
      footerLabel: ['इनमें से कोई एक भी हो = उसी दिन रेफर, दर्द-हरण गोली से दबाना नहीं · Even ONE of these = same-day referral — do not mask with painkillers'],
    },
    {
      name: 'SPINE-POSTURE-DIARY (7 days)',
      rows: 7,
      cols: 5,
      headerLabel: ['दिन', 'लंबा बैठना (घंटे)', 'झुकना/वजन उठाना (बार)', 'टहलाई (मिनट)', 'दर्द (0-10)'],
      colsLabel: ['Day', 'Long Sitting (hrs)', 'Bending/Lifting (count)', 'Walk (min)', 'Pain (0-10)'],
      footerLabel: ['हर 45 मिनट बाद उठें · वजन घुटनों के बल से उठाएं, पीठ झुकाकर नहीं · Rise every 45 min · lift with knees bent, never a bent back'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Mechanical Back Pain — Conservative',
      diagnosis: 'MECHANICAL-BACK-PAIN',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '5 days', instructions: 'Every 8 hrs on pain days — not SOS' },
        { name: 'Combiflam Tablet', dose: '1 tab', duration: '3 days', instructions: 'After food ONLY, short course — stop when pain settles' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '5 days', instructions: 'Before breakfast while NSAID runs' },
        { name: 'Voveran Gel 30g', dose: 'Apply locally', duration: '5 days', instructions: 'Twice daily on the lower back — intact skin' },
      ],
      labs: ['Pain score diary (0-10, twice daily)'],
      advice: 'गर्म सिकाई दिन में 2 बार · हर 45 मिनट में उठकर टहलें · वजन घुटनों से उठाएं · बिस्तर पर घुटनों के नीचे तकिया · दर्द पैर तक जाए या पेशाब में दिक्कत हो = उसी दिन अस्पताल',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Mild Head Injury — Observation Advice',
      diagnosis: 'HEAD-INJURY-MILD-OBSERVE',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '2 days', instructions: 'SOS pain — paracetamol ONLY; no ibuprofen/aspirin for 48 h' },
      ],
      labs: ['CT head — only if danger signs appear or if advised'],
      advice: 'घर का कोई जागरूक सदस्य हर 2 घंटे जगाकर नाम/तारीख पूछे · उल्टी-झटका-एक तरफ कमजोरी-बढ़ती नींद = रात में भी अस्पताल · 48 घंटे तक अकेले न सोएं, शराब/सेडेटिव नहीं · निगरानी कार्ड साथ रखें',
      followUpDays: 2,
      isCommon: true,
    },
    {
      name: 'Post-Spine-Op — Recovery Review',
      diagnosis: 'POST-SPINE-SURGERY-STABLE',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '7 days', instructions: 'Every 8 hrs as needed — wean off as pain settles' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '7 days', instructions: 'Before breakfast' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — nerve recovery support' },
        { name: 'Shelcal 500 Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — bone healing' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml', duration: '15 days', instructions: 'At bedtime — keep bowels soft (straining stresses the back)' },
      ],
      labs: ['Surgeon-scheduled X-ray/MRI review', 'Walking distance log (daily)'],
      advice: 'ब्रेस जैसा बताया गया हो वैसा पहनें · झुकना/वजन उठाना बंद · रोज़ थोड़ा-थोड़ा ज्यादा टहलें · नया पैर-दर्द/कमजोरी या घाव से पानी = उसी दिन सर्जन को बताएं',
      followUpDays: 14,
    },
  ],
}
