/**
 * EME-01 — EMERGENCY MEDICINE STARTER PACK (T3 lite)
 *
 * Triage-first ER / nursing-home practice: RECOGNIZE → stabilize with
 * the FIRST dose → refer-up correctly. NOT intensive-care content.
 * Medico-legal (MLC) documentation + when-to-refer framing is the core
 * value of this pack.
 *
 * Safety rails baked in everywhere:
 *   - 13 IMMEDIATE-REFER findings with ZERO findingMeds links (hospital
 *     NOW framing: 108 free ambulance + nearest tertiary centre):
 *     cardiac arrest, ACS (CAR), FAST-positive stroke (NEU — 4.5-hour
 *     window), anaphylaxis (adrenaline IM = hospital/ambulance only —
 *     refer line only, never an entry), severe hemoptysis, hematemesis,
 *     polytrauma ABCDE, unknown poisoning, snake envenomation (anti-venom
 *     hospital-only; NO cutting/sucking/tourniquet; coordinate NEP),
 *     heat stroke, severe dehydration/cholera-suspect, high-risk head
 *     injury (NSU), pediatric critical-suspect.
 *   - NO adrenaline, NO anti-venom, NO antiarrhythmics, NO thrombolytics,
 *     NO AEDs as medicine entries — hospital-only framing in suggestions.
 *   - First-aid DOs/DON'Ts: seizure (side position, nothing in mouth),
 *     poisoning (NO induced vomiting — bring the packet), snake bite.
 *   - MLC (medico-legal case) documentation mention in every
 *     trauma/poisoning suggestion; 108 ambulance; IDSP/IHIP
 *     notifiable-disease framing for cholera-suspect; NTEP TB;
 *     anti-rabies schedule; first-ever seizure = NEVER start AED
 *     casually (NEU referral + EEG).
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English
 * secondary (doctor search). Medicine names = English brands.
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const EME01_PACK: SpecialtyPack = {
  meta: {
    code: 'EME-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Emergency Medicine Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · triage-first: stabilize + refer-up; MLC documentation framing',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'TRI', name: 'ट्रायज मुख्य', nameEn: 'Triage Core' },
    { key: 'TRA', name: 'चोट/दुर्घटना', nameEn: 'Trauma' },
    { key: 'MEE', name: 'चिकित्सा आपातकाल', nameEn: 'Medical Emergencies' },
    { key: 'TOX', name: 'जहर/डंक', nameEn: 'Poisoning & Bites' },
    { key: 'PAE', name: 'बच्चों के आपातकाल', nameEn: 'Pediatric Emergencies' },
  ],

  // ══ Complaints (16) ═══════════════════════════════════════════════════
  complaints: [
    // TRI — triage core
    { code: 'TRI01', categoryKey: 'TRI', detail: 'अचानक सीने में दर्द', detailEn: 'Sudden Chest Pain (triage)' },
    { code: 'TRI02', categoryKey: 'TRI', detail: 'अचानक सांस फूलना', detailEn: 'Sudden Breathlessness (triage)' },
    { code: 'TRI03', categoryKey: 'TRI', detail: 'बेहोशी/गिरना', detailEn: 'Collapse — Syncope/Unconscious' },
    { code: 'TRI04', categoryKey: 'TRI', detail: 'चेहरा अचानक टेढ़ा (स्ट्रोक जांच)', detailEn: 'Sudden Facial Droop (stroke FAST)' },
    { code: 'TRI05', categoryKey: 'TRI', detail: 'तेज़ बुखार', detailEn: 'High Fever' },
    { code: 'TRI06', categoryKey: 'TRI', detail: 'पानी जैसे दस्त बहुत', detailEn: 'Severe Watery Diarrhoea (dehydration)' },
    // TRA — trauma
    { code: 'TRA01', categoryKey: 'TRA', detail: 'दुर्घटना में चोट (बहु-चोट)', detailEn: 'Road Accident — Polytrauma (ABCDE)' },
    { code: 'TRA02', categoryKey: 'TRA', detail: 'सिर पर चोट', detailEn: 'Head Injury (coordinate NSU)' },
    // MEE — medical emergencies
    { code: 'MEE01', categoryKey: 'MEE', detail: 'दौरा पड़ रहा है', detailEn: 'Active Seizure (first-aid positioning)' },
    { code: 'MEE02', categoryKey: 'MEE', detail: 'पहला दौरा — गिरने के बाद', detailEn: 'First-Ever Seizure — Post-Ictal' },
    { code: 'MEE03', categoryKey: 'MEE', detail: 'उल्टी में खून', detailEn: 'Vomiting Blood (Hematemesis)' },
    { code: 'MEE04', categoryKey: 'MEE', detail: 'एलर्जी — तेज़ स्वेलिंग', detailEn: 'Severe Allergic Swelling (anaphylaxis triage)' },
    // TOX — poisoning/bites
    { code: 'TOX01', categoryKey: 'TOX', detail: 'सांप ने काटा', detailEn: 'Snake Bite' },
    { code: 'TOX02', categoryKey: 'TOX', detail: 'बिच्छू/ततैया का डंक', detailEn: 'Scorpion/Wasp Sting' },
    { code: 'TOX03', categoryKey: 'TOX', detail: 'जहरीली चीज़ खा ली', detailEn: 'Poisoning — Ingested (bring packet)' },
    // PAE — pediatric emergencies
    { code: 'PAE01', categoryKey: 'PAE', detail: 'बच्चा बहुत सुस्त', detailEn: 'Child Very Lethargic (peds red flags)' },
  ],

  // ══ Questions (32 — 2 per complaint; // idx N = true 0-based index) ════
  questions: [
    // idx 0 — TRI01
    { complaintCode: 'TRI01', question: 'दर्द कब शुरू हुआ (मिनट/घंटे — सुनहरा घंटा गिनते हैं) और अभी भी जारी है?', questionEn: 'When did the pain start (minutes/hours — we count the golden hour), and is it still ongoing?' },
    // idx 1 — TRI01
    { complaintCode: 'TRI01', question: 'पसीना, उल्टी या बाएं हाथ/जबड़े में दर्द जाना — कुछ भी साथ में है?', questionEn: 'Sweating, vomiting, or pain radiating to the left arm/jaw — anything alongside?' },
    // idx 2 — TRI02
    { complaintCode: 'TRI02', question: 'सांस कब से फूल रही है और एक सांस में पूरा वाक्य बोल पा रहे हैं?', questionEn: 'Since when the breathlessness, and can you speak a full sentence in one breath?' },
    // idx 3 — TRI02
    { complaintCode: 'TRI02', question: 'साथ में छाती दर्द है या होंठ/चेहरा नीला पड़ रहा है?', questionEn: 'Any chest pain alongside, or lips/face turning blue?' },
    // idx 4 — TRI03
    { complaintCode: 'TRI03', question: 'गिरने से पहले क्या हुआ — चक्कर आया, धड़कन तेज़/धीमी महसूस हुई, या बिना किसी चेतावनी गिर गए?', questionEn: 'What happened before the fall — dizzy spell, felt the heartbeat race/fade, or dropped without any warning?' },
    // idx 5 — TRI03
    { complaintCode: 'TRI03', question: 'गिरने के बाद जीभ कटी, पेशाब प्याज की तरह आया, या शरीर में झटके चले (बिना याददाश्त)?', questionEn: 'After the fall — tongue bitten, urine passed, or body jerks without memory of them?' },
    // idx 6 — TRI04
    { complaintCode: 'TRI04', question: 'चेहरा कब टेढ़ा हुआ और आखिरी बार सब ठीक-ठाक कब दिखा था (समय-खिड़की)?', questionEn: 'When did the face droop, and when was the patient last seen normal (time window)?' },
    // idx 7 — TRI04
    { complaintCode: 'TRI04', question: 'एक हाथ उठाकर रखने में खराबी या बोलने में लड़खड़ाहट भी है?', questionEn: 'Trouble holding one arm up, or slurred speech as well?' },
    // idx 8 — TRI05
    { complaintCode: 'TRI05', question: 'बुखार कितना नापा और कितने दिन से है?', questionEn: 'What temperature was recorded, and for how many days?' },
    // idx 9 — TRI05
    { complaintCode: 'TRI05', question: 'साथ में कंपकंपी (रिगर), बहुत सुस्ती या सांस फूलना है?', questionEn: 'Any chills (rigors), marked lethargy or breathlessness alongside?' },
    // idx 10 — TRI06
    { complaintCode: 'TRI06', question: 'दस्त कितने घंटों में कितनी बार हुए और पूरी तरह पानी जैसे हैं?', questionEn: 'How many stools in how many hours, and are they fully watery?' },
    // idx 11 — TRI06
    { complaintCode: 'TRI06', question: 'उल्टी भी है, पेशाब बहुत कम आ रहा है, या जीभ/आंखें सूखी दिख रही हैं?', questionEn: 'Vomiting too, urine very low, or dry tongue/sunken eyes?' },
    // idx 12 — TRA01
    { complaintCode: 'TRA01', question: 'दुर्घटना कैसी हुई (गाड़ी/ऊंचाई से गिरना) और सिर-गर्दन-छाती-पेट में चोट लगी है?', questionEn: 'How did the accident happen (vehicle/fall from height), and is the head-neck-chest-abdomen injured?' },
    // idx 13 — TRA01
    { complaintCode: 'TRA01', question: 'चोट के बाद कितना खून बहा और चेहरा सफेद/मरीज़ बेसुध तो नहीं?', questionEn: 'How much bleeding since the injury, and is the face pale / patient drowsy?' },
    // idx 14 — TRA02
    { complaintCode: 'TRA02', question: 'चोट के बाद उल्टी, बेहोशी या याददाश्त/घटनाओं की याद छूट रही है?', questionEn: 'After the injury — vomiting, loss of consciousness, or gaps in memory?' },
    // idx 15 — TRA02
    { complaintCode: 'TRA02', question: 'खून-पतला करने वाली दवा (एस्प्रिन/वारफेरिन) या शराब चालू है?', questionEn: 'On blood-thinners (aspirin/warfarin) or alcohol use?' },
    // idx 16 — MEE01
    { complaintCode: 'MEE01', question: 'दौरा अभी चल रहा है या रुक चुका है — कितने मिनट से चल रहा है?', questionEn: 'Is the seizure still running or has it stopped — for how many minutes?' },
    // idx 17 — MEE01
    { complaintCode: 'MEE01', question: 'दौरे के दौरान जीभ कटी या गिरने से सिर पर चोट लगी है?', questionEn: 'During the fit — tongue bitten, or a head injury from the fall?' },
    // idx 18 — MEE02
    { complaintCode: 'MEE02', question: 'यह पहला दौरा है — पहले कभी दौरा या बुखार में झटके नहीं आए?', questionEn: 'Is this the first-ever fit — no previous seizures or fever-fits ever?' },
    // idx 19 — MEE02
    { complaintCode: 'MEE02', question: 'दौरा रुकने के बाद पूरा होश लौट आया और किसी अंग में कमजोरी तो नहीं रह गई?', questionEn: 'After the fit stopped, has full consciousness returned, and is any limb left weak?' },
    // idx 20 — MEE03
    { complaintCode: 'MEE03', question: 'उल्टी में खून कितना और कितनी बार आया — काला (कॉफी-दाना जैसा) या लाल?', questionEn: 'How much and how often the blood in vomit — black (coffee-grounds) or red?' },
    // idx 21 — MEE03
    { complaintCode: 'MEE03', question: 'पहले से एसिडिटी/लिवर की बीमारी है या दर्द की गोली/खून-पतली दवा चालू है?', questionEn: 'Pre-existing acidity/liver disease, or running painkillers/blood-thinners?' },
    // idx 22 — MEE04
    { complaintCode: 'MEE04', question: 'सूजन कहाँ है — होंठ/जीभ/गला और आवाज़ बदल गई है?', questionEn: 'Where is the swelling — lips/tongue/throat, and has the voice changed?' },
    // idx 23 — MEE04
    { complaintCode: 'MEE04', question: 'सांस में खर्राह (स्ट्राइडर) या निगलने में अटकन शुरू हो गई है?', questionEn: 'Has a noisy wheeze (stridor) or trouble swallowing started?' },
    // idx 24 — TOX01
    { complaintCode: 'TOX01', question: 'सांप ने कब काटा और पलकें झुकना, मसूड़ों से खून या गहरा (कोला-जैसा) पेशाब — कोई संकेत दिख रहा है?', questionEn: 'When did the snake bite, and any drooping eyelids, bleeding gums, or dark (cola) urine appearing?' },
    // idx 25 — TOX01
    { complaintCode: 'TOX01', question: 'काटी हुई जगह पर किसी ने काटा/चूसा/कसकर पट्टी बांधी या बर्फ़ रखी है?', questionEn: 'Has anyone cut/sucked the bite site, tied a tight band, or applied ice?' },
    // idx 26 — TOX02
    { complaintCode: 'TOX02', question: 'डंक कहाँ लगा और दर्द/सूजन कितनी तेज़ है?', questionEn: 'Where is the sting, and how severe is the pain/swelling?' },
    // idx 27 — TOX02
    { complaintCode: 'TOX02', question: 'डंक के बाद उल्टी, बेचैनी, पूरे शरीर पर खुजली या नीली/ठंडी उंगलियाँ दिखी?', questionEn: 'After the sting — vomiting, restlessness, whole-body hives, or blue/cold fingers?' },
    // idx 28 — TOX03
    { complaintCode: 'TOX03', question: 'क्या खाया/पीया, कब और उसका डिब्बा/बोतल/पैकेट साथ लाया है?', questionEn: 'What was swallowed/eaten, when, and is the packet/bottle brought along?' },
    // idx 29 — TOX03
    { complaintCode: 'TOX03', question: 'घर पर जबरनी उल्टी (नमक-पानी) या कुछ और कराया गया है?', questionEn: 'Was forced vomiting (salt-water) or any other first-aid done at home?' },
    // idx 30 — PAE01
    { complaintCode: 'PAE01', question: 'बच्चे की उम्र/वजन क्या है और सुस्ती कितनी है — आवाज़ करने पर खुलता है?', questionEn: "Child's age/weight, and how lethargic — does the child rouse to voice?" },
    // idx 31 — PAE01
    { complaintCode: 'PAE01', question: 'बच्चा खाना-पानी रोक पा रहा है, बुखार है, या झटके चले हैं?', questionEn: 'Is the child able to keep feeds down, febrile, or had jerky movements?' },
  ],

  // ══ Suggestions (64 — exactly 2 per question) ═════════════════════════
  suggestions: [
    // q0
    { questionIndex: 0, text: 'दर्द शुरू होने का समय गिनें — शुरुआत के 15 मिनट के भीतर ECG चाहिए; सुनहरा घंटा ही दिल बचाता है, नजदीकी केंद्र तुरंत', textEn: 'Note the exact onset time — an ECG within 15 minutes is needed; the golden hour is what saves the heart, nearest centre now' },
    { questionIndex: 0, text: 'मुफ्त 108 एम्बुलेंस बुलाएं — खुद गाड़ी चलाना और इंतज़ार दोनों खतरनाक हैं', textEn: 'Call the free 108 ambulance — driving yourself and waiting are both dangerous' },
    // q1
    { questionIndex: 1, text: 'पसीना + बाएं हाथ/जबड़े में दर्द = दिल का दौरा मानकर चलें — तुरंत अस्पताल, ECG वहीं होगा (CAR-01 समन्वय)', textEn: 'Sweating + left arm/jaw pain = treat as a heart attack — hospital NOW, the ECG happens there (CAR-01 coordination)' },
    { questionIndex: 1, text: 'बिना ECG के घर पर कोई गोली न चबाएं — अस्पिरिन जैसी दवा का फैसला ECG देखकर अस्पताल में होता है', textEn: 'Do not chew any tablet at home without an ECG — decisions like aspirin are made in hospital after seeing the ECG' },
    // q2
    { questionIndex: 2, text: 'एक सांस में पूरा वाक्य नहीं बोल पाना = गंभीर — बैठकर इंतज़ार नहीं, 108 अभी', textEn: 'Unable to speak a full sentence in one breath = severe — no sitting it out, 108 now' },
    { questionIndex: 2, text: 'वजह (दिल/फेफड़ा/खून की कमी) अस्पताल में पता चलेगी — ऑक्सीजन और जांच दोनों वहीं मिलते हैं; क्लिनिक में रोककर नहीं', textEn: 'The cause (heart/lung/anemia) will be found in hospital — oxygen and tests are both there; do not hold the patient in the clinic' },
    // q3
    { questionIndex: 3, text: 'होंठ/चेहरा नीला पड़ना = शरीर में ऑक्सीजन गिर रही है — हर मिनट गिनती का है; 108 + नजदीकी बड़ा केंद्र तुरंत', textEn: 'Lips/face turning blue = body oxygen is dropping — every minute counts; 108 + nearest major centre immediately' },
    { questionIndex: 3, text: 'आराम की हालत में भी सांस फूलना = दिल/फेफड़े की आपातकाल जांच — रास्ते में मरीज़ को बैठाकर (झुकाकर नहीं) ले जाएं', textEn: 'Breathlessness even at rest = emergency heart/lung workup — transport the patient sitting upright (not stooped) en route' },
    // q4
    { questionIndex: 4, text: 'चक्कर/धड़कन का एहसास और फिर गिरना = दिल की लय बिगड़ने का संकेत हो सकता है — ECG अनिवार्य; अस्पताल रेफर (CAR-01 समन्वय)', textEn: 'A dizzy/racing-heart feeling followed by collapse can signal a heart-rhythm problem — ECG mandatory; hospital referral (CAR-01 coordination)' },
    { questionIndex: 4, text: 'बिना किसी चेतावनी गिरना (चेहरा/दांत घसीटे हुए) = अचानक दिल रुकने का जोखिम — बड़े केंद्र की पूरी जांच जरूरी', textEn: 'Dropping with no warning (grazed face/teeth) = risk of sudden cardiac arrest — a full major-centre workup is needed' },
    // q5
    { questionIndex: 5, text: 'जीभ कटना + बिना याददाश्त के झटके = दौरा ही लगता है — जांच (EEG/दिमाग की स्कैन) न्यूरोलॉजिस्ट (NEU-01) के साथ; रास्ता हम बनाते हैं', textEn: 'Bitten tongue + jerks without memory = looks like a seizure — workup (EEG/brain scan) with the neurologist (NEU-01); we chart the route' },
    { questionIndex: 5, text: 'बार-बार या लंबी बेहोशी = अस्पताल अभी — कारण (शुगर/दिल/दिमाग/खून) वहीं खोजा जाएगा', textEn: 'Repeated or prolonged unconsciousness = hospital NOW — the cause (sugar/heart/brain/bleed) is hunted there' },
    // q6
    { questionIndex: 6, text: 'घंटा-घंटा गिनें — शुरुआत के 4.5 घंटे के भीतर पहुंचें तो ब्लॉक खोलने की दवा मिल सकती है; 108 अभी और CT-स्कैन वाला केंद्र चुनें (NEU-01 समन्वय)', textEn: 'Count hour by hour — arriving within 4.5 hours of onset can allow clot-busting treatment; 108 now and choose a CT-capable centre (NEU-01 coordination)' },
    { questionIndex: 6, text: 'नींद में लक्षण मिले हों तो "आखिरी बार ठीक दिखा" का समय ही शुरुआत माना जाएगा — वही समय बताएं, देर न करें', textEn: 'If symptoms were found on waking, the "last seen normal" time counts as onset — report that time, do not delay' },
    // q7
    { questionIndex: 7, text: 'चेहरा + बाजू + बोली में से कोई एक भी बिगड़ा = स्ट्रोक की तरह ही चलें — खाना-पानी और गोलियां रोकें, 108 से अस्पताल', textEn: 'Face + arm + speech — any one affected = act as stroke — stop food/water/tablets, hospital via 108' },
    { questionIndex: 7, text: 'रास्ते में सुस्त मरीज़ को करवट (साइड) पर लिटाकर ले जाएं — उल्टी में सांस फूलने से बचाव इसी से होता है', textEn: 'En route, lay a drowsy patient on the side — this protects the airway if they vomit' },
    // q8
    { questionIndex: 8, text: '103°F+ बुखार: आज पैरासिटामोल की पहली खुराक + खूब तरल (ORS/पानी) — 24 घंटे में न घटे या बढ़े तो खून की जांच (मलेरिया/डेंगू) अनिवार्य', textEn: 'Fever 103°F+: first paracetamol dose today + plenty of fluids (ORS/water) — if not down in 24 hours or rising, blood tests (malaria/dengue) are mandatory' },
    { questionIndex: 8, text: 'बुखार के साथ सुस्ती, सांस फूलना या बच्चे में झटके = तुरंत अस्पताल — ये घर का इलाज नहीं हैं', textEn: 'Fever with lethargy, breathlessness, or fits in a child = hospital immediately — these are not home-treatable' },
    // q9
    { questionIndex: 9, text: 'कंपकंपी (रिगर) + तेज़ बुखार = खून में इंफेक्शन की जांच चाहिए — आज ही CBC + मलेरिया जांच; बिगड़ते लक्षण हों तो अस्पताल', textEn: 'Shaking chills + high fever = blood-infection workup needed — CBC + malaria test today; worsening symptoms mean hospital' },
    { questionIndex: 9, text: 'मलेरिया-क्षेत्र में रहते हों तो बताएं — पहली खुराक के बावजूद 48 घंटे में बुखार न टूटे तो सीधे अस्पताल', textEn: 'Tell us if you live in a malaria area — if fever does not break within 48 hours despite the first dose, go straight to hospital' },
    // q10
    { questionIndex: 10, text: 'घंटे में 3+ बार पानी-दस्त = हर दस्त के बाद एक कप ORS + नजदीकी अस्पताल — बच्चा/बूढ़ा/गर्भवती हो तो बिल्कुल देर नहीं', textEn: '3+ watery stools an hour = one cup of ORS after every stool + nearest hospital — zero delay for children/elderly/pregnant women' },
    { questionIndex: 10, text: 'चावल के पानी जैसा सफेद दस्त = हैजा का संदेह — यह निगरानी (IDSP/IHIP) की सूचना देने वाला मामला है; इलाज + रिपोर्टिंग दोनों अस्पताल से', textEn: 'Rice-water white stools = cholera-suspect — this is a notifiable-disease (IDSP/IHIP) scenario; treatment + reporting both run through the hospital' },
    // q11
    { questionIndex: 11, text: 'जीभ सूखी, 8 घंटे से पेशाब नहीं, आंखें धंसी = गंभीर पानी-कमी — IV चाहिए, अस्पताल अभी; रास्ते में ORS चलता रहे', textEn: 'Dry tongue, no urine for 8 hours, sunken eyes = severe dehydration — IV fluids needed, hospital now; keep ORS going on the way' },
    { questionIndex: 11, text: 'उल्टी साथ हो तो हर 2-3 मिनट पर छोटे-छोटे घूंट ORS दें — एक साथ पूरा गिलास देने से उल्टी हो जाती है', textEn: 'With vomiting too, give tiny sips of ORS every 2-3 minutes — a full glass at once comes right back up' },
    // q12
    { questionIndex: 12, text: 'गाड़ी-हादसा / ऊंचाई से गिरना = सिर-गर्दन-पेट की चोट छिपी हो सकती है — ABCDE जांच अस्पताल में; गर्दन कॉलर के बिना न हिलाएं, 108 से', textEn: 'Road accident / fall from height = hidden head-neck-abdomen injuries — ABCDE assessment in hospital; do not move the neck without a collar, via 108' },
    { questionIndex: 12, text: 'MLC (मेडिको-लीगल) कागज़ी दस्तावेज़ दुर्घटना के हाल पर बनता है — पुलिस और बीमा दोनों के लिए जरूरी; आपका विवरण रिकॉर्ड में सुरक्षित रखेंगे', textEn: 'MLC (medico-legal) documentation is prepared from the accident details — required for both police and insurance; your account will be kept safe in the record' },
    // q13
    { questionIndex: 13, text: 'तेज़ बहता खून = साफ़ कपड़े से सीधा दबाव 10 मिनट लगातार — बीच में झांककर न देखें; दबाव के साथ-साथ 108 बुलाएं', textEn: 'Heavy bleeding = direct pressure with a clean cloth for 10 continuous minutes — do not peek in between; call 108 alongside' },
    { questionIndex: 13, text: 'पूरा अंग दुख-रहा सूजा या चेहरा सफेद = अंदरूनी खून-नुकसान संभव — एम्बुलेंस से अस्पताल, रास्ते में कुछ खिलाना-पिलाना नहीं (सर्जरी हो सकती है)', textEn: 'A whole limb hurting/swollen or a pale face = possible internal injury — ambulance to hospital, nothing by mouth en route (surgery may be needed)' },
    // q14
    { questionIndex: 14, text: 'चोट के बाद उल्टी, बेहोशी या याददाश्त की कमी = CT स्कैन चाहिए — न्यूरो-सर्जरी (NSU समन्वय) वाला केंद्र अभी, 108 से', textEn: 'Vomiting, unconsciousness or memory loss after injury = CT scan needed — a centre with neurosurgery (NSU coordination) now, via 108' },
    { questionIndex: 14, text: 'MLC: झगड़े/हमले में चोट हो तो पुलिस को सूचना देना जरूरी है — घावों के निशान, तस्वीर और विवरण कागज़ी रिकॉर्ड में दर्ज करेंगे; इलाज पहले, कागज़ बाद में', textEn: 'MLC: if it was an assault, informing police is required — wound marks, photos and details will be recorded on paper; treatment first, paperwork after' },
    // q15
    { questionIndex: 15, text: 'खून-पतली दवा चालू हो तो सिर की हल्की चोट भी गंभीर है — बिना लक्षण होने पर भी CT कराएं; अस्पताल आज ही', textEn: 'On blood-thinners, even a mild head bump is serious — get a CT even without symptoms; hospital today itself' },
    { questionIndex: 15, text: 'दवा का नाम-खुराक कागज़ पर लिखवाकर दिखाएं — अस्पताल में दवा का असर घटाने (रिवर्सल) का फैसला इसी से होगा', textEn: 'Bring the medicine name-dose written on paper — reversal decisions in hospital depend on it' },
    // q16
    { questionIndex: 16, text: 'दौरा चल रहा है: करवट (साइड) पर घुमाएं, नीचे से तकिया/कपड़ा हटाएं, मुँह में कुछ भी न डालें (चम्मच/पानी/उंगली कभी नहीं), घड़ी देखें — 5 मिनट से ज्यादा चले तो 108 अभी', textEn: 'Seizure running: turn to the side, clear pillows/clothing below, put NOTHING in the mouth (never spoon/water/finger), watch the clock — beyond 5 minutes, 108 now' },
    { questionIndex: 16, text: 'दौरा रुक जाए तो सोने दें, कपड़े ढीले करें — पूरा होश लौटने तक पानी-खाना न दें; गिरने से लगी चोट दिखाएं', textEn: 'Once it stops, let them sleep, loosen clothes — no water/food till fully awake; show us any injury from the fall' },
    // q17
    { questionIndex: 17, text: 'जीभ कटी या सिर पर चोट है तो दौरे की जांच के साथ चोट की जांच भी जरूरी — अस्पताल रेफर में दोनों दर्ज होंगे', textEn: 'With a bitten tongue or head bump, the injury needs checks alongside the seizure workup — both get recorded in the hospital referral' },
    { questionIndex: 17, text: 'दौरे का रिकॉर्डिंग-वीडियो जांच में सबसे काम आता है — अगली बार पास खड़े शख्स से फोन पर बनवाएं', textEn: 'A video recording of the fit helps the workup most — have someone nearby record it on a phone next time' },
    // q18
    { questionIndex: 18, text: 'पहला दौरा = EEG + दिमाग की स्कैन जरूरी — न्यूरोलॉजिस्ट (NEU-01) रेफर लिखेंगे; दौरे की गोली खुद या दुकान से कभी शुरू न करें', textEn: 'First-ever fit = EEG + brain scan needed — we will write a neurologist (NEU-01) referral; NEVER start a fit-medicine yourself or from a chemist' },
    { questionIndex: 18, text: 'जांच तक गाड़ी चलाना, तैराकी और ऊंची जगह का काम बंद — गिरने का खतरा; परिवार को दौरे की पहली मदद सिखा देंगे', textEn: 'No driving, swimming or working at heights till the workup — fall risk; we will teach the family seizure first-aid' },
    // q19
    { questionIndex: 19, text: 'होश पूरा लौट आया और कमजोरी नहीं बची = राहत की बात — फिर भी इसी हफ्ते EEG जरूरी है, मुलाकात न टालें', textEn: 'Full consciousness back and no residual weakness = reassuring — still, the EEG this week is a must, do not postpone' },
    { questionIndex: 19, text: 'एक तरफ की कमजोरी या लड़खड़ी बोली बाद में भी बनी रहे = स्ट्रोक जैसी जांच — 108, देर न करें', textEn: 'One-sided weakness or slurred speech persisting afterwards = stroke-like workup — 108, no delay' },
    // q20
    { questionIndex: 20, text: 'कॉफी-दाना जैसा काला या लाल खून = पेट में ब्लीडिंग चालू — बर्फ़-पानी जैसे घरेलू उपाय बंद, कुछ न खिलाएं-पिलाएं, 108 अभी', textEn: 'Coffee-grounds black or red vomit = active GI bleed — stop ice-water home tricks, nothing by mouth, 108 now' },
    { questionIndex: 20, text: 'पिछले दिनों का काला (गुड़ जैसा) मल पहले ही संकेत हो सकता है — हीमोग्लोबिन और एंडोस्कोपी का फैसला अस्पताल में', textEn: 'Recent black tarry stool may have been the earlier signal — hemoglobin and endoscopy decisions happen at hospital' },
    // q21
    { questionIndex: 21, text: 'दर्द की गोली (NSAID) या खून-पतली दवा चालू हो तो नाम कागज़ पर लिखवाकर दिखाएं — ब्लीडिंग की वजह यही हो सकती है', textEn: 'If painkillers (NSAIDs) or blood-thinners are running, bring the names written on paper — they may be the source of the bleed' },
    { questionIndex: 21, text: 'पुरानी एसिडिटी/लिवर (शराब) की बीमारी + उल्टी में खून = नस की ब्लीडिंग की जांच — अस्पताल अभी, यह रुक-रुक कर दोहराती है', textEn: 'Long-standing acidity/liver (alcohol) disease + blood in vomit = variceal-bleed workup — hospital now; this bleed tends to recur' },
    // q22
    { questionIndex: 22, text: 'होंठ/जीभ/गले की सूजन + आवाज़ बदलना = सांस की नली का जोखिम — एड्रेनालाईन इंजेक्शन अस्पताल/एम्बुलेंस का इलाज है; 108 अभी — एविल जैसी गोली से यह नहीं संभलेगा', textEn: 'Lip/tongue/throat swelling + voice change = airway risk — adrenaline injection is a hospital/ambulance treatment; 108 now — a tablet like Avil will NOT cover this' },
    { questionIndex: 22, text: 'अस्पताल तक मरीज़ को सीधा बैठाकर ले जाएं, झुकाकर नहीं — खाना-पानी बंद; निगलना और सांस दोनों खतरे में हैं', textEn: 'Transport the patient sitting upright, not stooped — no food/water; both swallowing and breathing are at risk' },
    // q23
    { questionIndex: 23, text: 'सांस में खर्राह या निगलने में अटकन = हवा की नली सिकुड़ रही है — मिनटों का मामला; इस क्लिनिक में रुकना नहीं, नजदीकी अस्पताल अभी', textEn: 'A noisy wheeze (stridor) or trouble swallowing = the airway is narrowing — a matter of minutes; do not wait in this clinic, nearest hospital now' },
    { questionIndex: 23, text: 'जिस चीज़ से एलर्जी लगी (दवा/खाना/डंक) उसका नाम कागज़ पर लिखकर जेब में रखें — अस्पताल को बताना सबसे पहला काम है', textEn: 'Write the trigger (medicine/food/sting) on paper and keep it in the pocket — telling the hospital is the first job' },
    // q24
    { questionIndex: 24, text: 'पलकें झुकना, मसूड़ों से खून या कोला-जैसा गहरा पेशाब = सांप का जहर फैल रहा है — एंटी-वेनम सिर्फ़ अस्पताल में मिलता है; 108 को नजदीकी एंटी-वेनम केंद्र बताकर भेजें (NEP-01 समन्वय)', textEn: 'Drooping eyelids, bleeding gums or cola-dark urine = snake venom spreading — anti-venom is available ONLY in hospital; tell 108 to head to the nearest anti-venom centre (NEP-01 coordination)' },
    { questionIndex: 24, text: 'अस्पताल 20-मिनट की खून-जमाव जांच (WBCT) से जहर की गंभीरता परखता है — रास्ते में घबराएं नहीं, अंग हिलाएं नहीं, पहुंचते रहें', textEn: 'The hospital uses the 20-minute whole-blood clotting test (WBCT) to grade the envenomation — do not panic or move the limb en route, just keep reaching' },
    // q25
    { questionIndex: 25, text: 'सांप के काटने पर: न काटें, न चूसें, कसकर पट्टी/रस्सी न बांधें, बर्फ़ न रखें — अंग दिल की ऊंचाई पर स्थिर रखें, घड़ी-अंगूठी उतारें, 108 अभी', textEn: 'Snake bite: NO cutting, NO sucking, NO tight band/tourniquet, NO ice — keep the limb still at heart level, remove watch/rings, 108 now' },
    { questionIndex: 25, text: 'कसकर बंधी रस्सी/पट्टी अंग को नुकसान पहुंचा सकती है — ढीली करवाएं (नाखून का रंग देखकर) और सीधे अस्पताल; जो किया गया वह डॉक्टर को जरूर बताएं', textEn: 'A tightly tied rope/band can damage the limb — get it loosened (checking nail colour) and go straight to hospital; always tell the doctor what was done' },
    // q26
    { questionIndex: 26, text: 'बिच्छू का दर्द बहुत तेज़ होता है — बच्चे/बूढ़े में उल्टी, पसीना या बेचैनी दिखे तो अस्पताल; यहाँ धोकर-देखकर दर्द की पहली दवा देंगे', textEn: 'Scorpion-sting pain can be fierce — vomiting, sweating or restlessness in a child/elderly means hospital; here we wash, examine and give the first pain dose' },
    { questionIndex: 26, text: 'ततैया का डंक दिखे तो नाखून/चिमटी से न खींचें — कार्ड की धार से खुरचकर निकालें, ऊपर ठंडी पट्टी 10 मिनट; सूजन होंठ/आंख तक जाए तो अस्पताल', textEn: 'If the wasp sting is visible, do not pull with nails — scrape it out sideways with a card edge, cold compress 10 minutes; swelling reaching the lips/eyes = hospital' },
    // q27
    { questionIndex: 27, text: 'डंक के बाद पूरे शरीर पर खुजली-चकत्ते, उल्टी या सांस में खर्राह = गंभीर एलर्जी — अस्पताल अभी; हल्की स्थानीय सूजन पर भी 30 मिनट यहाँ देखेंगे', textEn: 'Whole-body hives, vomiting or a wheeze after a sting = serious allergy — hospital now; even mild local swelling gets 30 minutes of observation here' },
    { questionIndex: 27, text: 'बच्चे में नीली/ठंडी उंगलियाँ, बहुत बेचैनी या झटके = बिच्छू-जहर का गहरा असर — सीधे बड़े अस्पताल, रास्ते में मेहनत न कराएं', textEn: 'Blue/cold fingers, extreme restlessness or jerks in a child = deep scorpion-venom effect — straight to a major hospital, no exertion en route' },
    // q28
    { questionIndex: 28, text: 'डिब्बा/बोतल/पैकेट साथ लाएं — लेबल पढ़कर ही जहर का सही इलाज तय होता है; जबरनी उल्टी कराना बिल्कुल मना (नमक-पानी भी नहीं)', textEn: 'Bring the packet/bottle — the correct antidote is decided from the label; forced vomiting is absolutely forbidden (not even salt-water)' },
    { questionIndex: 28, text: 'MLC: जान-बूझकर खाया हो (आत्महत्या का प्रयास) तो पुलिस को सूचना देना कानूनी जरूरत है — इलाज पर कोई असर नहीं पड़ेगा; पहले जीवन, कागज़ बाद में', textEn: 'MLC: if the ingestion was intentional (suicide attempt), informing police is a legal requirement — treatment is not affected; life first, paperwork after' },
    // q29
    { questionIndex: 29, text: 'नमक-पानी से उल्टी करा चुके हों तो डॉक्टर को बताना जरूरी — केरोसिन/एसिड जैसे जहर में उल्टी नुकसान दुगना करती है; अस्पताल अभी', textEn: 'If salt-water vomiting was already induced, telling the doctor is essential — with poisons like kerosene/acid, vomiting doubles the damage; hospital now' },
    { questionIndex: 29, text: 'मुँह के आसपास का जहर कपड़े से पोंछें, मरीज़ को करवट पर लिटाएं, कुछ भी न खिलाएं-पिलाएं — एंटीडोट की तलाश नजदीकी बड़े केंद्र में होगी', textEn: 'Wipe away poison around the mouth, lay the patient on the side, nothing by mouth — the antidote is hunted at the nearest major centre' },
    // q30
    { questionIndex: 30, text: 'बच्चा आवाज़ पर नहीं खुल रहा या गिर-गिर जा रहा है = गंभीर — निजी गाड़ी से नहीं, 108 से अस्पताल; हाथ-पैर ठंडे हों तो और भी जल्दी', textEn: 'A child not rousing to voice or going floppy = critical — not by private car, 108 to hospital; cold limbs mean even more urgency' },
    { questionIndex: 30, text: 'सांस तेज़ चल रही, खर्रार-खर्रार की आवाज़ या नाक के परदे फड़क रहे हैं = गंभीर सीने का इंफेक्शन — अस्पताल अभी', textEn: 'Fast breathing, grunting noises or flaring nostrils = serious chest infection — hospital now' },
    // q31
    { questionIndex: 31, text: '6-8 घंटे से पेशाब नहीं या कुछ नहीं पी रहा = गंभीर पानी-कमी — अस्पताल; रास्ते में चम्मच-चम्मच ORS देते जाएं', textEn: 'No urine for 6-8 hours or refusing all feeds = severe dehydration — hospital; keep giving spoonfuls of ORS on the way' },
    { questionIndex: 31, text: '3 महीने से छोटे बच्चे का 100.4°F+ बुखार हमेशा अस्पताल जाता है — इस उम्र में घर का कोई इलाज नहीं', textEn: 'Any fever of 100.4°F+ in a baby under 3 months always goes to hospital — no home treatment at this age' },
  ],

  // ══ Labels (8) ════════════════════════════════════════════════════════
  labels: [
    { label: 'शुरुआत कितनी देर पहले (सुनहरा घंटा)', labelEn: 'Time Since Onset (golden hour)', unit: 'min/hrs' },
    { label: 'होश का स्तर (0-4)', labelEn: 'Consciousness Level (0-4)', unit: '', showUnit: false },
    { label: 'खून की मात्रा (0-3)', labelEn: 'Bleeding Severity (0-3)', unit: '', showUnit: false },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'आखिरी खाना/दवा कब', labelEn: 'Last Meal / Last Dose', unit: 'hrs' },
    { label: 'खून-पतला दवा (हां/ना)', labelEn: 'Anticoagulant Use (Y/N)', unit: '', showUnit: false },
    { label: 'शुगर (यदि पता हो)', labelEn: 'Sugar (if known)', unit: 'mg/dl' },
    { label: 'गर्भवती (हां/ना)', labelEn: 'Pregnant (Y/N)', unit: '', showUnit: false },
  ],

  // ══ Findings (21: 13 immediate-refer ZERO links + 8 managed) ══════════
  // CARDIAC-ARREST-SUSPECTED … PEDIATRIC-CRITICAL-SUSPECT deliberately
  // have ZERO findingMeds links — no OPD medicine handling for
  // hospital-NOW emergencies. Adrenaline/anti-venom/thrombolytics/
  // antiarrhythmics are hospital-only framing, never entries.
  findings: [
    // Managed / observation (links allowed)
    { key: 'FEVER-HIGH-UNCOMPLICATED', name: 'तेज़ बुखार — पहली खुराक + जांच', nameEn: 'High Fever — First Dose + Workup', icd10: 'R50.9' },
    { key: 'SEIZURE-RESOLVED-FIRST-EVER', name: 'पहला दौरा — रुक चुका (NEU रेफर, EEG)', nameEn: 'First-Ever Seizure — Resolved (NEU referral, EEG)', icd10: 'R56.9' },
    { key: 'MINOR-BEE-STING-LOCAL', name: 'ततैया/बिच्छू डंक — हल्की स्थानीय प्रतिक्रिया (30 मिनट निगरानी)', nameEn: 'Bee/Wasp Sting — Mild Local Reaction (30-min Observation)', icd10: 'T63.4' },
    { key: 'ANIMAL-BITE-INITIAL', name: 'जानवर के काटने की प्राथमिक देखभाल (रेबीज़ प्रोटोकॉल, PSU समन्वय)', nameEn: 'Animal Bite — Initial Care (Rabies Protocol, coordinate PSU)', icd10: 'W54' },
    { key: 'TETANUS-PROPHYLAXIS-REVIEW', name: 'टेटनस सुई की समीक्षा (घाव-देखभाल)', nameEn: 'Tetanus Prophylaxis Review (Wound Care)', icd10: 'Z29' },
    { key: 'MINOR-HEAD-INJURY-OBSERVE', name: 'हल्की सिर-चोट — निगरानी (NSU समन्वय)', nameEn: 'Minor Head Injury — Observation (coordinate NSU)', icd10: 'S09.9' },
    { key: 'ALCOHOL-INTOXICATION-OBSERVE', name: 'शराब की अधिक मात्रा — निगरानी (थायमिन = अस्पताल-इलाज)', nameEn: 'Alcohol Intoxication — Observation (thiamine = hospital treatment)', icd10: 'F10.1' },
    { key: 'SYNCOPE-BENIGN-REFLEX', name: 'सामान्य (वेजोवेगल) बेहोशी — ECG के बाद ही', nameEn: 'Benign Reflex Syncope — only after ECG', icd10: 'R55' },
    // Immediate-refer (ZERO findingMeds links below — by design)
    { key: 'CARDIAC-ARREST-SUSPECTED', name: 'दिल रुकने का संदेह — तत्काल (केवल रेफर)', nameEn: 'Suspected Cardiac Arrest — Immediate (Refer ONLY)', icd10: 'I46.9' },
    { key: 'ACS-SUSPECT', name: 'दिल का दौरा संदिग्ध — तत्काल रेफर (CAR समन्वय)', nameEn: 'Suspected Acute Coronary Syndrome — Immediate Referral (coordinate CAR)', icd10: 'I24.9' },
    { key: 'STROKE-FAST-POSITIVE', name: 'स्ट्रोक FAST धनात्मक — समय-खिड़की (NEU समन्वय)', nameEn: 'Stroke FAST-Positive — Time Window (coordinate NEU)', icd10: 'I63.9' },
    { key: 'ANAPHYLAXIS-IMMEDIATE', name: 'एनाफिलैक्सिस — तत्काल अस्पताल (केवल रेफर)', nameEn: 'Anaphylaxis — Immediate Hospital (Refer ONLY)', icd10: 'T78.2' },
    { key: 'SEVERE-HEMOPTYSIS', name: 'भारी खून थूकना — तत्काल रेफर', nameEn: 'Severe Hemoptysis — Immediate Referral', icd10: 'R04.2' },
    { key: 'GI-BLEED-HEMATEMESIS', name: 'उल्टी में खून — तत्काल रेफर', nameEn: 'GI Bleed — Hematemesis (Immediate Referral)', icd10: 'K92.0' },
    { key: 'POLYTRAUMA-ABCDE', name: 'बहु-चोट — ABCDE अस्पताल (केवल रेफर)', nameEn: 'Polytrauma — ABCDE Hospital (Refer ONLY)', icd10: 'T07' },
    { key: 'POISONING-UNKNOWN', name: 'जहरीली चीज़ — अज्ञात (केवल रेफर)', nameEn: 'Poisoning — Unknown Substance (Refer ONLY)', icd10: 'T50.9' },
    { key: 'SNAKE-BITE-ENVENOMATION', name: 'सांप के जहर के संकेत — एंटी-वेनम केंद्र अभी (NEP समन्वय)', nameEn: 'Snake-Bite Envenomation Signs — Anti-venom Centre NOW (coordinate NEP)', icd10: 'T63.0' },
    { key: 'HEAT-STROKE-SUSPECT', name: 'लू/गर्मी का झटका संदिग्ध — तत्काल (केवल रेफर)', nameEn: 'Suspected Heat Stroke — Immediate (Refer ONLY)', icd10: 'T67.0' },
    { key: 'SEVERE-DEHYDRATION-CHOLERA-SUSPECT', name: 'गंभीर पानी-कमी, हैजा संदिग्ध — तत्काल (केवल रेफर)', nameEn: 'Severe Dehydration, Cholera-Suspect — Immediate (Refer ONLY)', icd10: 'E86' },
    { key: 'HEAD-INJURY-HIGH-RISK', name: 'सिर की चोट उच्च-जोखिम — तत्काल (NSU समन्वय)', nameEn: 'Head Injury High-Risk — Immediate (coordinate NSU)', icd10: 'S06.9' },
    { key: 'PEDIATRIC-CRITICAL-SUSPECT', name: 'बच्चा गंभीर संदिग्ध — तत्काल (केवल रेफर)', nameEn: 'Child Critical-Suspect — Immediate (Refer ONLY)' },
  ],

  // ══ Medicines (16) — STABILIZATION-ONLY, conservative ═════════════════
  // ⚠ NO adrenaline, NO anti-venom, NO antiarrhythmics, NO thrombolytics,
  // NO AEDs — hospital-only framing in suggestions. Avil = mild local
  // allergy ONLY (anaphylaxis = 108). Ultracet = trauma pain only while
  // hospital-bound. Thiamine = hospital framing, not an entry.
  medicines: [
    // Analgesic / antipyretic (first dose + review)
    { name: 'Crocin 650 Tablet', salt: 'Paracetamol 650 mg (ER first-dose antipyretic/analgesic; max 3 g/day)', doseOptions: ['1 tab (650 mg) SOS', '1 tab every 8 hrs (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml (children — weight-based 15 mg/kg/dose)', doseOptions: ['5 ml (250 mg)', '7.5 ml (375 mg)', '10 ml (500 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Meftal-P Suspension', salt: 'Mefenamic Acid 50 mg/5 ml (children — fever spike only, weight-based; max 3 doses/day, short courses)', doseOptions: ['2.5 ml (25 mg)', '5 ml (50 mg)', '10 ml (100 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // Vomiting control (before transfer)
    { name: 'Ondem Syrup 30ml', salt: 'Ondansetron 4 mg/5 ml syrup (children — vomiting before transfer, weight-based)', doseOptions: ['2.5 ml (2 mg)', '5 ml (4 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Vomikind MD 4 Tablet', salt: 'Ondansetron 4 mg mouth-dissolving (adult vomiting before transfer)', doseOptions: ['1 tab MD on tongue', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // WHO diarrhoea bundle
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose (one cup after every loose stool)', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zinc-20 Syrup', salt: 'Elemental Zinc 20 mg/5 ml (WHO paediatric diarrhoea — 14 days, >6 months age)', doseOptions: ['2.5 ml (10 mg)', '5 ml (20 mg)'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // Mild allergy ONLY (anaphylaxis = 108, never these)
    { name: 'Avil 25 Tablet', salt: 'Pheniramine Maleate 25 mg (MILD local allergy ONLY — NOT for breathing/throat involvement; drowsiness)', doseOptions: ['1 tab at bedtime', '1 tab twice daily (max 3 days)'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg (mild urticaria/itch — local reactions only)', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Gastric cover
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (gastric protection with painkillers/alcohol gastritis)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone) SOS', doseOptions: ['10 ml SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Trauma pain (hospital-going only)
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg (trauma pain ONLY while hospital-bound; SOS; dizziness/sedation — no driving)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Wound care
    { name: 'Betadine Ointment 20g', salt: 'Povidone-Iodine 10% ointment (initial wound dressing after cleaning)', doseOptions: ['Apply thin layer after cleaning'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'T-Bact 2% Ointment', salt: 'Mupirocin 2% ointment (small contaminated wounds/bite edges — after proper washing)', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Soft-tissue swelling
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin + Chymotrypsin (trauma swelling — EMPTY STOMACH: 1 hr before food)', doseOptions: ['1 tab thrice daily empty stomach'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Recovery support
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc (convalescence support after illness)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (19 — managed findings only) ═════════════
  // All 13 immediate-refer findings + SEIZURE-RESOLVED-FIRST-EVER:
  // deliberately ZERO medicine links (referral/monitoring only —
  // never casually start an AED).
  findingMeds: [
    // FEVER-HIGH-UNCOMPLICATED
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Crocin 650 Tablet', dose: '1 tab (650 mg) every 8 hrs', morning: 1, afternoon: 1, evening: 1, tab: 15, description: 'First dose now; max 3 g/day; not settling in 24-48 hrs → malaria/dengue workup' },
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Calpol 250 Suspension', description: 'Children — weight-based 15 mg/kg/dose; <3 months with 100.4°F+ = hospital' },
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Meftal-P Suspension', description: 'Children — SPIKE-only rescue, weight-based; max 3 doses/day' },
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Ondem Syrup 30ml', description: 'Children — fever vomiting, weight-based; keeps fluids down' },
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Electral Sachet (ORS)', description: 'Fever fluids — small frequent sips' },
    { findingKey: 'FEVER-HIGH-UNCOMPLICATED', medicineName: 'Zincovit Tablet', description: '1 tab OD — recovery support once fever settles' },
    // MINOR-BEE-STING-LOCAL (30-min observation in clinic)
    { findingKey: 'MINOR-BEE-STING-LOCAL', medicineName: 'Avil 25 Tablet', description: '1 tab HS — mild local itch only; ANY lip/tongue/throat sign = 108, not this' },
    { findingKey: 'MINOR-BEE-STING-LOCAL', medicineName: 'Cetzine 10 Tablet', description: '1 tab HS — mild urticaria, non-sedating option' },
    { findingKey: 'MINOR-BEE-STING-LOCAL', medicineName: 'Betadine Ointment 20g', description: 'After sting-site cleaning; scrape stings out with a card edge, never nails' },
    // ANIMAL-BITE-INITIAL (rabies protocol coordinate PSU)
    { findingKey: 'ANIMAL-BITE-INITIAL', medicineName: 'Betadine Ointment 20g', description: 'After 15-min soap-and-running-water wash — wound toilet' },
    { findingKey: 'ANIMAL-BITE-INITIAL', medicineName: 'T-Bact 2% Ointment', description: 'Apply on bite edges after washing; deep/punctured bites = hospital' },
    { findingKey: 'ANIMAL-BITE-INITIAL', medicineName: 'Crocin 650 Tablet', description: 'Pain SOS — rabies vaccine course + RIG decisions at the centre (PSU coordination)' },
    { findingKey: 'ANIMAL-BITE-INITIAL', medicineName: 'Chymoral Forte Tablet', description: '1 tab TDS empty stomach × 3-5 days — local swelling' },
    // TETANUS-PROPHYLAXIS-REVIEW
    { findingKey: 'TETANUS-PROPHYLAXIS-REVIEW', medicineName: 'Betadine Ointment 20g', description: 'Wound toilet; TT/Td/immunoglobulin injection status reviewed and recorded' },
    { findingKey: 'TETANUS-PROPHYLAXIS-REVIEW', medicineName: 'Crocin 650 Tablet', description: 'Pain SOS — injection-site soreness' },
    // MINOR-HEAD-INJURY-OBSERVE (NSU coordination)
    { findingKey: 'MINOR-HEAD-INJURY-OBSERVE', medicineName: 'Crocin 650 Tablet', description: 'Pain — paracetamol ONLY; ibuprofen/aspirin FORBIDDEN (bleeding risk); any vomiting/drowsiness = 108' },
    // ALCOHOL-INTOXICATION-OBSERVE (thiamine = hospital framing)
    { findingKey: 'ALCOHOL-INTOXICATION-OBSERVE', medicineName: 'Digene Gel 200ml', description: '10 ml SOS — gastritis comfort while observing; thiamine IV = hospital treatment' },
    { findingKey: 'ALCOHOL-INTOXICATION-OBSERVE', medicineName: 'Pan 40 Tablet', description: '1 tab OD — gastric cover; drowsiness deepening/confusion/weakness = 108' },
    // SYNCOPE-BENIGN-REFLEX (ECG first)
    { findingKey: 'SYNCOPE-BENIGN-REFLEX', medicineName: 'Electral Sachet (ORS)', description: 'Rehydration for dehydration-triggered faint — ECG before discharge, always' },
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Triage Color Card',
      rows: 3,
      cols: 3,
      headerLabel: ['रंग', 'कौन-सी हालतें', 'कार्य'],
      colsLabel: ['Color', 'Which Conditions', 'Action'],
      footerLabel: ['लाल = 108 एम्बुलेंस अभी (मुफ्त) — ड्राइवर से नहीं, एम्बुलेंस से · पीला = आज ही डॉक्टर · हरा = अगली तारीख / Red = free 108 ambulance NOW — never by private car · Yellow = same-day doctor · Green = routine appointment'],
    },
    {
      name: 'FAST Card (Family Printable)',
      rows: 4,
      cols: 2,
      headerLabel: ['अक्षर', 'जांच कैसे करें'],
      colsLabel: ['Letter', 'How to Check'],
      footerLabel: ['समय = दिमाग — शुरुआत के 4.5 घंटे की खिड़की में 108 से CT वाले केंद्र पहुंचें, रास्ते में खाना-पानी/गोली बंद / Time = brain — reach a CT-capable centre via 108 within the 4.5-hour window; no food/water/tablets en route'],
    },
    {
      name: 'First-Aid Do–Don\u2019t Card',
      rows: 3,
      cols: 3,
      headerLabel: ['हालत', 'करें', 'कभी न करें'],
      colsLabel: ['Condition', 'Do', 'Never Do'],
      footerLabel: ['हर मामले में समय नोट करें और मुफ्त 108 एम्बुलेंस ही बुलाएं — नजदीकी बड़े केंद्र (tertiary centre) बताकर / In every case note the time and call the free 108 ambulance — naming the nearest tertiary centre'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'High Fever — First Dose + Review',
      diagnosis: 'FEVER-HIGH-UNCOMPLICATED',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '3 days', instructions: 'Every 8 hrs if fever; max 3 g/day — NOT settling in 24-48 hrs → blood tests (malaria/dengue) + revisit' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L', duration: '3 days', instructions: 'Small frequent sips through the fever' },
        { name: 'Zincovit Tablet', dose: '1 tab', duration: '7 days', instructions: 'After food — recovery support' },
      ],
      labs: ['CBC with platelet count (day 3 if fever persists)', 'Malaria smear / dengue NS1 if fever >48 hrs or danger signs'],
      advice: 'तापमान रोज़ 3 बार नापकर लिखें · तरल खूब (ORS/नारियल पानी/सूप) · सुस्ती, सांस फूलना, उल्टी लगातार या बच्चे में झटके दिखें तो घर पर नहीं — 108 से अस्पताल · एंटीबायोटिक खुद शुरू न करें — जांच के बाद तय होगा',
      followUpDays: 1,
      isCommon: true,
    },
    {
      name: 'Vomiting + Dehydration — Before Transfer',
      diagnosis: 'SEVERE-DEHYDRATION-CHOLERA-SUSPECT',
      medicines: [
        { name: 'Vomikind MD 4 Tablet', dose: '1 tab MD', duration: '2 days', instructions: 'On the tongue — adults, to hold fluids down BEFORE transfer; hospital remains the destination' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L', duration: '2 days', instructions: 'Tiny sips every 2-3 minutes — one cup after every loose stool' },
        { name: 'Pan 40 Tablet', dose: '1 tab', duration: '2 days', instructions: 'Before breakfast — gastric cover while transferring' },
      ],
      labs: ['Transfer note with vitals + hydration grade', 'Cholera-suspect stool sample sent with patient (hospital notifies IDSP/IHIP)'],
      advice: 'यह रोगी रुकने वाला नहीं — पहली खुराक के बाद सीधे अस्पताल (108) · रास्ते में हर 2-3 मिनट छोटे घूंट ORS · पेशाब बंद/आंखें धंसी/सुस्ती बढ़े तो और तेज़ · घर के बाकी लोगों का हाथ-पानी साफ़ रखें, उबला पानी पिएं',
      followUpDays: 1,
    },
    {
      name: 'Animal Bite — Local Care + Vaccine Course',
      diagnosis: 'ANIMAL-BITE-INITIAL',
      medicines: [
        { name: 'Betadine Ointment 20g', dose: 'Apply thin layer', duration: '5 days', instructions: 'ONLY after washing 15 minutes with soap + running water' },
        { name: 'T-Bact 2% Ointment', dose: 'Apply thin layer', duration: '5 days', instructions: 'After cleaning, on bite edges 2-3 times/day; deep/punctured/wild bites = hospital the same day' },
        { name: 'Crocin 650 Tablet', dose: '1 tab (650 mg)', duration: '3 days', instructions: 'Pain SOS' },
      ],
      labs: ['Anti-rabies vaccine course per centre (commonly day 0, 3, 7, 14, 28 — NEVER skip dates)', 'RIG (immunoglobulin) for category-III deep bites — hospital-administered'],
      advice: 'काटने के बाद 15 मिनट साबुन + बहते पानी से धुलाई — यही सबसे बड़ी बचत है · वैक्सीन की हर तारीख कैलेंडर पर लिखें, एक भी डोज़ न छोड़ें · गली का/अनजान जानवर हो या डंक गहरा हो तो उसी दिन अस्पताल · डरे नहीं — रेबीज़ समय पर टीके से पूरी तरह रोकने योग्य है · MLC रिकॉर्ड जरूरी हो तो बनवा लें',
      followUpDays: 3,
    },
  ],
}
