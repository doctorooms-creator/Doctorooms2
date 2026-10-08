/**
 * RHE-01 — RHEUMATOLOGY STARTER PACK (T3 lite)
 *
 * Rheumatologist OPD — pattern-recognition of joint/autoimmune disease +
 * DMARD initiation WITH mandatory monitoring + gout + chronic pain.
 *
 * ⚠ SCOPE PHILOSOPHY (deliberate):
 *   DMARDs ARE this specialty's domain, but this lite pack keeps them in
 *   conservative START-LOW + MANDATORY-MONITORING framing. Methotrexate is
 *   WEEKLY — the "daily MTX" mistake is fatal and the teaching is repeated
 *   on every MTX touchpoint (questions, suggestions, safety card, rx).
 *   Nothing that belongs to other specialties is started here without
 *   continuation-verify framing (donepezil/memantine = NEU, bisphosphonates
 *   = END, gabapentin = NEU — all excluded or coordinate-only).
 *
 * Emergency rails baked in everywhere:
 *   - Single HOT swollen joint + fever = septic arthritis → aspiration +
 *     hospital NOW (joint destroyed in days). ZERO findingMeds links.
 *   - New SLE organ involvement (kidney/chest/blood) → hospital. ZERO links.
 *   - Vasculitis suspect → urgent referral. ZERO links.
 *   - Giant cell arteritis (age >50, new headache + jaw pain + high ESR) →
 *     vision-threatening, coordinate NEU/GER. ZERO links.
 *   - JIA → pediatric rheumatology (PED). ZERO links.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India rheum core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const RHE01_PACK: SpecialtyPack = {
  meta: {
    code: 'RHE-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Rheumatology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · DMARDs = specialist-initiated + monitoring framing; unverified-dose mode',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'JOP', name: 'जोड़-दर्द पैटर्न', nameEn: 'Joint Pain Patterns' },
    { key: 'AUT', name: 'ऑटोइम्यून', nameEn: 'Autoimmune' },
    { key: 'GOU', name: 'गाउट / क्रिस्टल', nameEn: 'Gout / Crystal' },
    { key: 'RBN', name: 'हड्डी स्वास्थ्य', nameEn: 'Bone Health' },
    { key: 'CHP', name: 'पुराना दर्द', nameEn: 'Chronic Pain' },
  ],

  // ══ Complaints (16) ═══════════════════════════════════════════════════
  complaints: [
    // JOP — joint pain patterns
    { code: 'JOP01', categoryKey: 'JOP', detail: 'सुबह जोड़ों में अकड़न', detailEn: 'Morning stiffness in joints' },
    { code: 'JOP02', categoryKey: 'JOP', detail: 'छोटे जोड़ों की सूजन — दोनों हाथ', detailEn: 'Small-joint swelling — both hands (RA pattern)' },
    { code: 'JOP03', categoryKey: 'JOP', detail: 'जवान उम्र में कमर/कूल्हे का दर्द — रात में बदलता', detailEn: 'Back/hip pain in young adult — worse at night (AS pattern)' },
    { code: 'JOP04', categoryKey: 'JOP', detail: 'जोड़ दर्द + तेज़ बुखार — एक जोड़ गर्म-सूजन (आपातकाल)', detailEn: 'Joint pain + high fever — single hot swollen joint (EMERGENCY)' },
    // AUT — autoimmune
    { code: 'AUT01', categoryKey: 'AUT', detail: 'त्वचा पर लाल चकत्ते + जोड़ दर्द', detailEn: 'Red patches on skin + joint pain (SLE suspect)' },
    { code: 'AUT02', categoryKey: 'AUT', detail: 'धूप से चेहरे पर रैश', detailEn: 'Facial rash triggered by sun (photosensitivity)' },
    { code: 'AUT03', categoryKey: 'AUT', detail: 'मुंह सूखना / आंखों में जलन', detailEn: 'Dry mouth / burning eyes (sicca)' },
    { code: 'AUT04', categoryKey: 'AUT', detail: 'रियूमेटॉइड की दवा MTX चालू — परामर्श', detailEn: 'RA on methotrexate — counselling visit' },
    { code: 'AUT05', categoryKey: 'AUT', detail: 'RA स्थिर — नियमित फॉलो-अप', detailEn: 'RA stable — routine follow-up' },
    { code: 'AUT06', categoryKey: 'AUT', detail: 'बच्चे का जोड़ सूजन लंबे समय से (PED समन्वय)', detailEn: "Child's joint swelling persisting long (coordinate PED)" },
    { code: 'AUT07', categoryKey: 'AUT', detail: 'ठंड में उंगलियां सफेद/नीली', detailEn: "Fingers turning white/blue in cold (Raynaud's)" },
    // GOU — gout / crystal
    { code: 'GOU01', categoryKey: 'GOU', detail: 'अंगूठे/पैर में अचानक तेज़ दर्द रात में', detailEn: 'Sudden severe big-toe/foot pain at night (gout flare)' },
    { code: 'GOU02', categoryKey: 'GOU', detail: 'गाउट की दवा चालू है — फॉलो-अप', detailEn: 'On gout medicine — urate-lowering follow-up' },
    // RBN — bone health (RBN prefix avoids end-01 BON* coCode collision)
    { code: 'RBN01', categoryKey: 'RBN', detail: 'हड्डियां टूटने का डर / हड्डियां कमजोर', detailEn: 'Fear of fractures / weak bones (osteoporosis)' },
    // CHP — chronic pain
    { code: 'CHP01', categoryKey: 'CHP', detail: 'पुराना घुटने का दर्द (ORT समन्वय)', detailEn: 'Chronic knee pain (coordinate ORT)' },
    { code: 'CHP02', categoryKey: 'CHP', detail: 'पूरे शरीर में दर्द + नींद गड़बड़ (PSY समन्वय)', detailEn: 'Whole-body pain + poor sleep (coordinate PSY)' },
  ],

  // ══ Questions (32 — 2 per complaint; // idx N = true 0-based index) ═══
  questions: [
    // idx 0 — JOP01
    { complaintCode: 'JOP01', question: 'सुबह उठते समय अकड़न कितनी देर रहती है — 15-20 मिनट या एक घंटे से ज्यादा?', questionEn: 'How long does the morning stiffness last on waking — 15-20 minutes, or more than an hour?' },
    // idx 1 — JOP01
    { complaintCode: 'JOP01', question: 'अकड़न हिलने-डुलने से घटती है या पूरे दिन बनी रहती है?', questionEn: 'Does the stiffness ease with movement, or does it persist all day?' },
    // idx 2 — JOP02
    { complaintCode: 'JOP02', question: 'सूजन किन जोड़ों में है — दोनों हाथों की उंगलियां/कलाई, दोनों तरफ एक जैसी?', questionEn: 'Which joints are swollen — fingers/wrists of BOTH hands, roughly symmetric?' },
    // idx 3 — JOP02
    { complaintCode: 'JOP02', question: 'सूजन वाले जोड़ गर्म या लाल तो नहीं? दबाने पर नरम (भरा हुआ) लगते हैं?', questionEn: 'Are the swollen joints warm or red? Do they feel soft/boggy when pressed?' },
    // idx 4 — JOP03
    { complaintCode: 'JOP03', question: 'कमर का दर्द रात/सुबह ज्यादा और चलने-खिंचने से घटता है, या आराम से घटता है?', questionEn: 'Is the back pain worse at night/in the morning and eased by exercise, or eased by rest?' },
    // idx 5 — JOP03
    { complaintCode: 'JOP03', question: 'उम्र 45 से कम है और यह दर्द 3 महीने से ज्यादा से है?', questionEn: 'Are you under 45, and has this pain lasted more than 3 months?' },
    // idx 6 — JOP04
    { complaintCode: 'JOP04', question: 'क्या एक ही जोड़ में तेज़ दर्द + गर्माहट + सूजन है और साथ में बुखार भी?', questionEn: 'Is there severe pain + warmth + swelling in a SINGLE joint, together with fever?' },
    // idx 7 — JOP04
    { complaintCode: 'JOP04', question: 'क्या वह जोड़ बिल्कुल हिलाया नहीं जा सकता और हल्की छूआ भी असह्य है?', questionEn: 'Can the joint not be moved at all, and is even light touch unbearable?' },
    // idx 8 — AUT01
    { complaintCode: 'AUT01', question: 'गालों/नाक पर तितली-आकार का रैश या शरीर पर लाल चकत्ते हैं?', questionEn: 'Is there a butterfly-shaped rash over cheeks/nose, or red patches on the body?' },
    // idx 9 — AUT01
    { complaintCode: 'AUT01', question: 'धूप में रैश बढ़ता है? बाल झड़ने या मुंह के छाले भी हैं?', questionEn: 'Does the rash worsen in sun? Any hair loss or mouth ulcers too?' },
    // idx 10 — AUT02
    { complaintCode: 'AUT02', question: 'धूप में निकलने के कितने समय बाद रैश आता है और कितने दिन रहता है?', questionEn: 'How long after sun exposure does the rash appear, and how many days does it last?' },
    // idx 11 — AUT02
    { complaintCode: 'AUT02', question: 'धूप से बचने के लिए कुछ करते हैं — छाता, पूरी बाहों वाले कपड़े, सनस्क्रीन?', questionEn: 'Do you use any sun protection — umbrella, full-sleeve clothes, sunscreen?' },
    // idx 12 — AUT03
    { complaintCode: 'AUT03', question: 'आंखों में रेत-सी लगना/जलन और मुंह सूखना — दोनों हैं या एक?', questionEn: 'Gritty/burning eyes and a dry mouth — both present, or only one?' },
    // idx 13 — AUT03
    { complaintCode: 'AUT03', question: 'निगलने में दिक्कत या दांतों की तेज़ खराबी (बार-बार डॉक्टर के पास)?', questionEn: 'Any difficulty swallowing, or rapid dental decay (repeated dentist visits)?' },
    // idx 14 — AUT04
    { complaintCode: 'AUT04', question: 'MTX की गोली हफ्ते में किस एक तय दिन लेते हैं — कहीं रोज़ तो नहीं ले रहे?', questionEn: 'Which ONE fixed day of the week do you take the MTX tablet — are you not taking it daily by mistake?' },
    // idx 15 — AUT04
    { complaintCode: 'AUT04', question: 'फॉलिक एसिड की गोली MTX के अगले दिन लेते हैं? CBC/LFT की आखिरी रिपोर्ट कब हुई?', questionEn: 'Do you take folic acid the day after MTX? When was the last CBC/LFT report?' },
    // idx 16 — AUT05
    { complaintCode: 'AUT05', question: 'अब सुबह की अकड़न कितने मिनट की है और सूजन वाले जोड़ों की संख्या कितनी?', questionEn: 'How many minutes is the morning stiffness now, and how many joints are swollen?' },
    // idx 17 — AUT05
    { complaintCode: 'AUT05', question: 'CBC/LFT की आखिरी रिपोर्ट की तारीख? कोई नया लक्षण शुरू हुआ है?', questionEn: 'Date of the last CBC/LFT report? Any new symptom started?' },
    // idx 18 — AUT06
    { complaintCode: 'AUT06', question: 'बच्चे की उम्र क्या है और जोड़ की सूजन कितने हफ्तों से है? सुबह लंगड़ाता है?', questionEn: "What is the child's age, and for how many weeks has the joint been swollen? Any morning limp?" },
    // idx 19 — AUT06
    { complaintCode: 'AUT06', question: 'सूजन के साथ रोज बुखार/रैश भी है? आंख लाल या दर्द वाली तो नहीं?', questionEn: 'Daily fever/rash along with the swelling? Any red or painful eye?' },
    // idx 20 — AUT07
    { complaintCode: 'AUT07', question: 'ठंड में उंगलियां कितनी देर सफेद→नीली रहती हैं और गर्म होने पर लाल/सुन्न होती हैं?', questionEn: 'How long do fingers stay white→blue in the cold, and do they turn red/numb on rewarming?' },
    // idx 21 — AUT07
    { complaintCode: 'AUT07', question: 'उंगलियों पर कोई छोटा घाव/काला धब्बा या त्वचा का कड़ापन (मोटी-सख्त त्वचा)?', questionEn: 'Any small ulcer/black spot on the fingers, or tightening/hardening of the skin?' },
    // idx 22 — GOU01
    { complaintCode: 'GOU01', question: 'दर्द कितनी जल्दी चरम पर पहुंचा — कुछ घंटों में? रात में शुरू हुआ?', questionEn: 'How quickly did the pain reach its peak — within hours? Did it start at night?' },
    // idx 23 — GOU01
    { complaintCode: 'GOU01', question: 'पहले भी ऐसा दौरा आया है? यूरिक एसिड की रिपोर्ट की वैल्यू पता है?', questionEn: 'Have you had such an attack before? Do you know your uric acid report value?' },
    // idx 24 — GOU02
    { complaintCode: 'GOU02', question: 'यूरेट-घटाने की दवा (Zyloric/Feburic) की खुराक क्या है और आखिरी यूरिक एसिड कितना आया?', questionEn: 'What is the urate-lowering (Zyloric/Feburic) dose, and what was the last uric acid value?' },
    // idx 25 — GOU02
    { complaintCode: 'GOU02', question: 'दवा शुरू करने के बाद से कोई दौरा (flare) आया है?', questionEn: 'Has there been any flare since starting the medicine?' },
    // idx 26 — RBN01
    { complaintCode: 'RBN01', question: 'हल्के झटके/गिरने से कोई हड्डी टूटी है? ऊंचाई में गिरावट या DEXA स्कैन हुआ है?', questionEn: 'Any fracture from a minor bump/fall? Height loss or a DEXA scan done?' },
    // idx 27 — RBN01
    { complaintCode: 'RBN01', question: 'रोज़ दूध-दही और धूप का सेवन कैसा है? स्टेरॉयड गोलियां लंबे समय चली हैं?', questionEn: 'How is daily dairy and sun exposure? Have steroid tablets run for a long time?' },
    // idx 28 — CHP01
    { complaintCode: 'CHP01', question: 'सीढ़ी चढ़ने/बैठक में दर्द ज्यादा होता है? सुबह की अकड़न 15 मिनट से कम?', questionEn: 'Is pain worse on stairs/squatting? Is morning stiffness under 15 minutes?' },
    // idx 29 — CHP01
    { complaintCode: 'CHP01', question: 'घुटने से चरमराहट (कड़क-कड़क) आवाज आती है? कभी सूजन दिखी है?', questionEn: 'Does the knee creak/crackle? Any visible swelling?' },
    // idx 30 — CHP02
    { complaintCode: 'CHP02', question: 'पूरे शरीर में दर्द 3 महीने से ज्यादा से है? साथ में थकान और नींद गड़बड़?', questionEn: 'Has whole-body pain lasted over 3 months? With fatigue and disturbed sleep?' },
    // idx 31 — CHP02
    { complaintCode: 'CHP02', question: 'दर्द के साथ सिरदर्द, पेट की गड़बड़ी या ध्यान लगाने में दिक्कत भी है?', questionEn: 'Along with the pain, any headaches, bowel upset, or difficulty concentrating?' },
  ],

  // ══ Suggestions (64 — exactly 2 per question, questionIndex 0-31) ════
  suggestions: [
    // q0
    { questionIndex: 0, text: 'एक घंटे से ज्यादा रहने वाली सुबह की अकड़न सूजन (inflammatory) वाले रोग का संकेत है — खून की जांच जरूरी है', textEn: 'Morning stiffness lasting over an hour signals inflammatory disease — blood tests are needed' },
    { questionIndex: 0, text: 'अकड़न के मिनट हर हफ्ते डायरी में लिखें — इलाज का असर इसी संख्या से मापा जाता है', textEn: 'Write the stiffness minutes in a diary weekly — treatment response is measured by exactly this number' },
    // q1
    { questionIndex: 1, text: 'हिलने-डुलने से अकड़न घटे तो यह पैटर्न गठिया (inflammatory arthritis) की तरफ इशारा करता है', textEn: 'Stiffness that eases with movement points towards inflammatory arthritis' },
    { questionIndex: 1, text: 'आराम से घटकर चलने से बढ़ने वाला दर्द घिसाव (osteoarthritis) जैसा हो सकता है — दोनों का इलाज अलग है', textEn: 'Pain that eases with rest and worsens with use behaves like wear-and-tear (osteoarthritis) — the two are treated differently' },
    // q2
    { questionIndex: 2, text: 'दोनों हाथों की उंगलियों/कलाई की समान सूजन रियूमेटॉइड (RA) का क्लासिक पैटर्न है — RA factor और anti-CCP जांच कराएं', textEn: 'Symmetric swelling of both hands’ fingers/wrists is the classic rheumatoid (RA) pattern — get RA factor and anti-CCP tested' },
    { questionIndex: 2, text: 'सूजन वाले जोड़ों की गिनती लिखें — 3 से ज्यादा छोटे जोड़ होने पर जांच और जल्दी इलाज की बात होती है', textEn: 'Count the swollen joints — with more than 3 small joints involved, testing and early treatment get discussed' },
    // q3
    { questionIndex: 3, text: 'एक ही जोड़ में गर्म-लाल सूजन के साथ बुखार हो तो इंतज़ार न करें — यह इमरजेंसी है, उसी दिन अस्पताल', textEn: 'A single hot-red swollen joint with fever means no waiting — this is an emergency, hospital the same day' },
    { questionIndex: 3, text: 'नरम-भरे (स्पंजी) जोड़ गठिये की सूजन (synovitis) की तस्वीर बताते हैं — सूजन की फोटो खींचकर रखें, हर विज़िट में काम आती है', textEn: 'Soft-boggy joints suggest synovitis of arthritis — photograph the swelling; it helps at every visit' },
    // q4
    { questionIndex: 4, text: 'रात/सुबह का दर्द जो व्यायाम से घटता है, कशेरुक-गठिया (ankylosing spondylitis) का पैटर्न है — इमेजिंग और HLA-B27 की चर्चा करें', textEn: 'Night/morning pain that improves with exercise is the ankylosing spondylitis pattern — discuss imaging and HLA-B27' },
    { questionIndex: 4, text: 'इस पैटर्न में आराम दोषी है — लंबा बिस्तर-आराम नुकसान करता है; रोज़ का खिंचाव-व्यायाम इलाज का हिस्सा है', textEn: 'In this pattern REST is the culprit — prolonged bed rest harms; daily stretching is part of the treatment' },
    // q5
    { questionIndex: 5, text: '45 से कम उम्र में 3 महीने से लंबा कमर दर्द असामान्य है — रीढ़ की इमेजिंग और विशेषज्ञ से मिलना जरूरी', textEn: 'Back pain longer than 3 months under age 45 is not normal — spinal imaging and specialist review are needed' },
    { questionIndex: 5, text: 'धूम्रपान इस बीमारी को तेज़ करता है — छोड़ना इलाज का हिस्सा है, सलाह के लिए पूछें', textEn: 'Smoking accelerates this disease — quitting is part of the treatment; ask for help' },
    // q6
    { questionIndex: 6, text: '⚠ एक ही जोड़ में गर्म-लाल सूजन + तेज़ बुखार = संक्रमण (septic arthritis) की आशंका — तुरंत अस्पताल; देर से जोड़ नष्ट हो सकता है', textEn: '⚠ A single hot-red swollen joint + high fever = possible joint infection (septic arthritis) — hospital NOW; delay can destroy the joint in days' },
    { questionIndex: 6, text: 'इस हालत में घर की दवा या अगली OPD तारीख का इंतज़ार नहीं — 108 एम्बुलेंस से भी जा सकते हैं; जोड़ से पानी (aspiration) निकालकर जांच होती है', textEn: 'No home medicines or waiting for the next OPD date — you may even go by 108 ambulance; joint fluid (aspiration) is tested there' },
    // q7
    { questionIndex: 7, text: 'जोड़ बिल्कुल न हिलना और हल्की छूआ भी असह्य होना — गंभीर संक्रमण का चेहरा है; अस्पताल जाएं', textEn: 'A joint that cannot move at all with unbearable even on light touch — this is what serious infection looks like; go to hospital' },
    { questionIndex: 7, text: 'बुखार की गोली खाकर दर्द का घटना धोखा हो सकता है — इलाज का फैसला जांच के बाद ही होगा', textEn: 'The pain easing after a fever tablet can be deceptive — treatment decisions follow the tests' },
    // q8
    { questionIndex: 8, text: 'गाल/नाक पर तितली-आकार लाल चकत्ते + जोड़ दर्द — ANA जांच से लूपस (SLE) की तस्वीर साफ होगी', textEn: 'Butterfly-shaped redness over cheeks/nose + joint pain — an ANA test will clarify the lupus (SLE) picture' },
    { questionIndex: 8, text: 'लूपस की जल्दी पहचान गुर्दा-त्वचा-जोड़ तीनों को बचाती है — हर नए रैश की तारीख के साथ फोटो रखें', textEn: 'Early recognition of lupus protects kidneys, skin and joints — keep dated photos of every new rash' },
    // q9
    { questionIndex: 9, text: 'धूप में रैश बढ़ना, बाल झड़ना और मुंह के छाले — तीनों मिलकर SLE की ओर इशारा करते हैं', textEn: 'Sun-worsening rash, hair loss and mouth ulcers — together these three point towards SLE' },
    { questionIndex: 9, text: 'मुंह के छालों की फोटो खींचें — जांच से पहले गायब हो जाते हैं और सबूत काम आता है', textEn: 'Photograph the mouth ulcers — they often vanish before the visit and the evidence helps' },
    // q10
    { questionIndex: 10, text: 'धूप के कुछ घंटों में आने वाला और देर तक रहने वाला रैश प्रकाश-संवेदनशीलता (photosensitivity) कहलाता है — डॉक्टर को जरूर बताएं', textEn: 'A rash appearing within hours of sun and lasting days is called photosensitivity — do tell your doctor' },
    { questionIndex: 10, text: 'धूप के बाद रैश कितने दिन रहा — यह विवरण जांच तय करता है; कैलेंडर में नोट करें', textEn: 'How many days the rash lasted after sun — this detail decides the workup; note it on a calendar' },
    // q11
    { questionIndex: 11, text: 'सुबह 10 से दोपहर 4 बजे की धूप सबसे तेज़ होती है — छाता, पूरी बाहों वाले कपड़े और SPF 30+ सनस्क्रीन रोज़', textEn: 'Sun between 10 am and 4 pm is strongest — umbrella, full-sleeve clothes and SPF 30+ sunscreen daily' },
    { questionIndex: 11, text: 'यदि धूप से चेहरे पर लाल चकत्ते बनते हों तो यह कॉस्मेटिक समस्या नहीं — ANA पैनल जैसी जांच जरूरी है', textEn: 'If sun causes red patches on your face, this is not a cosmetic issue — testing such as an ANA panel is needed' },
    // q12
    { questionIndex: 12, text: 'आंख और मुंह दोनों का सूखना सिका सिंड्रोम की ओर इशारा है — Schirmer जांच और खून की जांच से पुष्टि होती है', textEn: 'Dryness of both eyes and mouth points to sicca syndrome — a Schirmer test plus blood tests confirm it' },
    { questionIndex: 12, text: 'बार-बार पानी के घूंट आराम न दें तो सूखापन महत्वपूर्ण है — कृत्रिम आंसू (artificial tears) से शुरुआत होती है', textEn: 'If frequent sips of water do not help, the dryness is significant — artificial tears are the usual starting point' },
    // q13
    { questionIndex: 13, text: 'निगलने में दिक्कत या दांतों की तेज़ खराबी सिका के लक्षण हो सकते हैं — दंत-चिकित्सक और हम दोनों से दिखाएं', textEn: 'Swallowing difficulty or rapidly decaying teeth can be sicca symptoms — see both your dentist and us' },
    { questionIndex: 13, text: 'सूखे मुंह में दांत-सड़न का खतरा बढ़ता है — शुगर-फ्री गम, बार-बार पानी के घूंट और फ्लोराइड माउथवॉश', textEn: 'A dry mouth raises tooth-decay risk — sugar-free gum, frequent water sips and a fluoride mouthwash' },
    // q14
    { questionIndex: 14, text: '⚠ MTX हफ्ते में सिर्फ एक बार — एक ही तय दिन (जैसे रविवार)। रोज़ लेना जानलेवा भूल है; गोली जल्दी खत्म हो जाए तो नई न खरीदें — तुरंत डॉक्टर को दिखाएं', textEn: '⚠ MTX is ONCE A WEEK only — one fixed day (e.g., Sunday). Taking it daily is a fatal-error mistake; if tablets finish early do NOT buy more — see the doctor immediately' },
    { questionIndex: 14, text: 'कैलेंडर पर MTX-वाला दिन लाल मार्कर से लिखें — परिवार के एक सदस्य को भी बताकर रखें ताकि जांच रहे', textEn: 'Mark the MTX day in red on a calendar — tell one family member too, as a backup check' },
    // q15
    { questionIndex: 15, text: 'फॉलिक एसिड की गोली MTX के अगले दिन लें — यही MTX के मुंह के छाले/मतली से बचाव करती है', textEn: 'Take the folic acid tablet the day AFTER MTX — this is what protects against MTX mouth ulcers and nausea' },
    { questionIndex: 15, text: 'शुरुआती महीनों में CBC + LFT हर 2-4 हफ्ते — रिपोर्ट की तारीख डायरी में लिखें; बिना रिपोर्ट वाली विज़िट अधूरी मानी जाती है', textEn: 'In the first months CBC + LFT every 2-4 weeks — write report dates in your diary; a visit without reports counts as incomplete' },
    // q16
    { questionIndex: 16, text: 'अकड़न 30 मिनट से कम और सूजन वाले जोड़ 0-1 — इलाज काम कर रहा है; यह रुकने की नहीं, जारी रखने की बात है', textEn: 'Stiffness under 30 minutes and 0-1 swollen joints — treatment is working; this is a case for continuing, not stopping' },
    { questionIndex: 16, text: 'जोड़-डायरी हफ्ते में एक बार भरें — संख्याएं ही इलाज जारी रखने या बदलने का आधार बनती हैं', textEn: 'Fill the joint diary once a week — the numbers alone decide whether treatment continues or changes' },
    // q17
    { questionIndex: 17, text: 'समय पर खून की रिपोर्ट ही इस इलाज की सुरक्षा है — CBC/LFT की तारीख कभी न टालें', textEn: 'Timely blood reports ARE the safety of this treatment — never postpone the CBC/LFT date' },
    { questionIndex: 17, text: 'नया मुंह-छाला, बुखार या सांस की दिक्कत — अगली तारीख का इंतज़ार न करें, उसी दिन सूचित करें', textEn: 'New mouth ulcers, fever or breathing trouble — do not wait for the next date; inform the same day' },
    // q18
    { questionIndex: 18, text: 'बच्चे का 6 हफ्ते से ज्यादा रहने वाला सूजन-जोड़ बाल-गठिया (JIA) की आशंका — बाल-रुमेटोलॉजिस्ट से जल्द मिलना जरूरी', textEn: "A child's swollen joint persisting beyond 6 weeks raises juvenile arthritis (JIA) — see a pediatric rheumatologist soon" },
    { questionIndex: 18, text: 'सुबह का लंगड़ाना जो दोपहर तक ठीक हो जाए — बच्चों में सूजन-गठिये का पहचान-चिन्ह है; वीडियो बनाकर रखें', textEn: 'A morning limp that settles by noon is the hallmark of inflammatory arthritis in children — record a video' },
    // q19
    { questionIndex: 19, text: 'सूजन के साथ रोज बुखार-रैश हो तो systemic JIA की जांच होती है — बुखार का चार्ट बनाकर लाएं', textEn: 'Daily fever with rash alongside the swelling raises systemic JIA — prepare a fever chart and bring it' },
    { questionIndex: 19, text: 'बच्चे की एक आंख लाल/दर्द हो तो तुरंत बताएं — JIA में आंख की नियमित जांच (uvearia स्क्रीन) अनिवार्य है', textEn: 'If one eye turns red or painful, report immediately — regular eye screening is mandatory in JIA' },
    // q20
    { questionIndex: 20, text: 'ठंड में सफेद→नीली उंगलियां और गर्म होने पर लाल-सुन्न — यह रेनॉ चक्र की पूरी तस्वीर है; कनेक्टिव-टिशू जांच (ANA) कराएं', textEn: 'White→blue fingers in cold and red-numb on rewarming — the full Raynaud cycle; get connective-tissue screening (ANA)' },
    { questionIndex: 20, text: 'बर्फ में हाथ डालने/फ्रिज का सामान मुंह से पकड़ने से बचें — ठंड के महीनों में मोटे दस्ताने रोज़', textEn: 'Avoid ice-water and holding freezer items bare-handed — thick gloves daily through the cold months' },
    // q21
    { questionIndex: 21, text: 'उंगली पर छोटा काला घाव या त्वचा का बढ़ता कड़ापन स्क्लेरोडर्मा की ओर इशारा है — विशेष जांच जरूरी', textEn: 'A small black ulcer on a finger or progressive skin tightening points towards scleroderma — specialised testing is needed' },
    { questionIndex: 21, text: 'घाव वाली उंगली की तारीख-सहित फोटो रखें — प्रगति का पता इसी से चलता है', textEn: 'Keep dated photos of the affected finger — they track progression' },
    // q22
    { questionIndex: 22, text: 'कुछ घंटों में चरम पर पहुंचता रात का दर्द गाउट दौरे की पहचान है — पहला दौरा हो तो यूरिक एसिड जांच जरूरी', textEn: 'Night pain peaking within hours is the signature of a gout attack — if this is the first attack, uric acid testing is needed' },
    { questionIndex: 22, text: 'दौरे के दिनों में चादर छूना भी असहनीय लगता है — यह वर्णन डॉक्टर को जरूर दोहराएं, यह गाउट की मुहर है', textEn: 'Even the bedsheet feeling unbearable during the attack — do repeat this to the doctor; it is the stamp of gout' },
    // q23
    { questionIndex: 23, text: 'बार-बार के दौरे + ज्यादा यूरिक एसिड = गाउट की पुष्टि की तरफ — जांच दौरा शांत होने के 2 हफ्ते बाद कराएं, दौरे में नहीं', textEn: 'Repeated attacks + high uric acid point towards confirmed gout — test 2 weeks AFTER the flare settles, not during it' },
    { questionIndex: 23, text: 'पैर के अंगूठे के पास/कोहनी पीछे की गांठ की फोटो रखें — टोफस (tophi) का सबूत हो सकती है', textEn: 'Keep photos of lumps near the big toe/behind the elbow — they could be evidence of tophi' },
    // q24
    { questionIndex: 24, text: 'लक्ष्य यूरिक एसिड 6 से कम (कुछ मामलों में 5 से कम) — खुराक रिपोर्ट के नंबर से तय होती है, अंदाजे से नहीं', textEn: 'Target uric acid is under 6 (under 5 in some cases) — the dose is decided by report numbers, never guesswork' },
    { questionIndex: 24, text: 'खुराक खुद बढ़ाना/घटाना नहीं — अलोप्यूरीनोल धीरे-धीरे बढ़ता है; तेज़ी से बढ़ाने पर दौरा आ सकता है', textEn: 'Never self-adjust the dose — allopurinol is built up slowly; raising it fast can trigger a flare' },
    // q25
    { questionIndex: 25, text: 'दवा शुरू करने के पहले महीनों में दौरा आना आम है — यह दवा न चलने का नहीं, शरीर के समायोजन का संकेत है', textEn: 'Flares in the first months after starting the medicine are common — it signals adjustment, NOT drug failure' },
    { questionIndex: 25, text: 'दौरे में रोज़ की गाउट दवा बिना पूछे मत रोकें — दौरे की अलग दवा (कॉल्चिसीन/NSAID) उसके साथ चलती है', textEn: 'Do NOT stop the daily gout medicine during a flare without asking — the flare medicine (colchicine/NSAID) runs alongside it' },
    // q26
    { questionIndex: 26, text: 'हल्के झटके से टूटी हड्डी या ऊंचाई में 3 सेमी से ज्यादा गिरावट — ऑस्टियोपोरोसिस की DEXA जांच जरूरी', textEn: 'A fracture from a minor bump, or losing more than 3 cm of height — a DEXA scan for osteoporosis is needed' },
    { questionIndex: 26, text: 'लंबे समय की स्टेरॉयड गोलियां हड्डी को कमजोर करती हैं — ऐसा हो तो हड्डी-जांच और भी जरूरी', textEn: 'Long-running steroid tablets weaken bone — if that is the case, bone testing matters even more' },
    // q27
    { questionIndex: 27, text: 'रोज़ 2 कप दूध/दही + 20 मिनट धूप — भारत में विटामिन-D की कमी लगभग महामारी है; खुराक रिपोर्ट से तय होती है', textEn: 'Two glasses of milk/curd daily + 20 minutes of sun — vitamin-D deficiency is near-epidemic in India; dosing is decided by the report' },
    { questionIndex: 27, text: 'ऑस्टियोपोरोसिस की मुख्य दवा (बिसफॉस्फोनेट वगैरह) एंडोक्राइन/GER टीम से तय होती है — यहां कैल्शियम-विटामिन D सहायक रखा जाता है', textEn: 'The main osteoporosis medicines (bisphosphonates etc.) are decided with the endocrine/geriatrics team — here we provide calcium-vitamin D support' },
    // q28
    { questionIndex: 28, text: 'सीढ़ी/बैठक में दर्द और 15 मिनट से कम अकड़न — घुटने के घिसाव (osteoarthritis) की तस्वीर है', textEn: 'Pain on stairs/squatting with stiffness under 15 minutes — the picture of knee wear (osteoarthritis)' },
    { questionIndex: 28, text: 'घुटने की X-ray खड़े होकर (standing) कराएं — बैठे हुए की X-ray जोड़ की जगह की कमी छोड़ देती है', textEn: 'Get the knee X-ray STANDING — sitting X-rays miss the joint-space narrowing' },
    // q29
    { questionIndex: 29, text: 'घुटने की चरमराहट आम है — दर्द-सूजन के बिना घबराने की बात नहीं', textEn: 'Creaking sounds in the knee are common — without pain or swelling they are not alarming' },
    { questionIndex: 29, text: 'सूजन वाले दिनों में बर्फ की सिकाई 15-20 मिनट, दिन में 3-4 बार — गर्म सिकाई नहीं', textEn: 'On swollen days, ice packs 15-20 minutes, 3-4 times a day — NOT hot fomentation' },
    // q30
    { questionIndex: 30, text: '3 महीने से पूरे शरीर का दर्द + थकान + टूटी नींद = फाइब्रोमायल्जिया की तस्वीर — यह असली बीमारी है, "नाजुक होना" नहीं', textEn: 'Whole-body pain for 3+ months + fatigue + broken sleep = the fibromyalgia picture — a REAL condition, not "being delicate"' },
    { questionIndex: 30, text: 'थायरॉइड/विटामिन-D/B12 की जांच पहले — इलाज-योग्य कारण को गलती से फाइब्रोमायल्जिया कहना आम भूल है', textEn: 'Thyroid/vitamin-D/B12 tests come first — mistaking a treatable cause for fibromyalgia is a common error' },
    // q31
    { questionIndex: 31, text: 'सिरदर्द, पेट की गड़बड़ी और धुंधली सोच फाइब्रोमायल्जिया के साथी लक्षण हैं — इनकी गिनती डॉक्टर को बताएं', textEn: 'Headaches, bowel upset and foggy thinking are companions of fibromyalgia — count them for the doctor' },
    { questionIndex: 31, text: 'नींद पहले ठीक होगी तो दर्द आमतौर पर आधा रह जाता है — इलाज की पहली सीढ़ी नींद है, गोली नहीं', textEn: 'Fix sleep first and pain typically halves — the first rung of the ladder is sleep, not tablets' },
  ],

  // ══ Labels (8) — pattern + monitoring numbers ═════════════════════════
  labels: [
    { label: 'सुबह की अकड़न', labelEn: 'Morning Stiffness', unit: 'min' },
    { label: 'सूजन वाले जोड़ों की संख्या', labelEn: 'Swollen Joint Count', unit: '', showUnit: false },
    { label: 'दर्द अंक (0-10)', labelEn: 'Pain Score (0-10)', unit: '', showUnit: false },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'यूरिक एसिड (रिपोर्ट हो तो)', labelEn: 'Uric Acid (if known)', unit: 'mg/dl' },
    { label: 'MTX खुराक (हफ्ते में एक बार!)', labelEn: 'MTX Dose (weekly!)', unit: 'mg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'लक्षण कितने समय से', labelEn: 'Symptom Duration', unit: 'months' },
  ],

  // ══ Findings (18: 5 refer-only ZERO-link + 13 managed) ════════════════
  // Refer-only findings deliberately have ZERO findingMeds links.
  findings: [
    // Refer-only / emergency (ZERO findingMeds links below — by design)
    { key: 'SEPTIC-ARTHRITIS-SUSPECT', name: 'संक्रामक जोड़-शोथ संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Septic Arthritis — Emergency (Refer ONLY)', icd10: 'M00.9' },
    { key: 'NEW-SLE-ORGAN-INVOLVEMENT', name: 'SLE में नया अंग-लक्षण — आपातकाल (केवल रेफर)', nameEn: 'New SLE Organ Involvement — Emergency (Refer ONLY)', icd10: 'M32.1' },
    { key: 'VASCULITIS-SUSPECT', name: 'वैस्कुलाइटिस संदिग्ध — त्वरित रेफर (केवल रेफर)', nameEn: 'Suspected Vasculitis — Urgent Referral (Refer ONLY)', icd10: 'M31.9' },
    { key: 'JIA-SUSPECT', name: 'बाल-गठिया (JIA) संदिग्ध — बाल-रुमेटोलॉजी रेफर', nameEn: 'Suspected Juvenile Idiopathic Arthritis — Pediatric Rheumatology Referral', icd10: 'M08.9' },
    { key: 'GIANT-CELL-ARTHRITIS-SUSPECT', name: 'दैत्य-कोशिका धमनीशोथ संदिग्ध — दृष्टि-संकट (केवल रेफर)', nameEn: 'Suspected Giant Cell Arteritis — Vision-Threatening (Refer ONLY)', icd10: 'M31.6' },
    // Managed (links allowed)
    { key: 'RA-EARLY-SUSPECT', name: 'रियूमेटॉइड आर्थ्राइटिस प्रारंभिक संदिग्ध — जांच', nameEn: 'Early Rheumatoid Arthritis Suspected — Workup', icd10: 'M06.9' },
    { key: 'RA-ON-TREATMENT-STABLE', name: 'रियूमेटॉइड आर्थ्राइटिस — इलाज पर स्थिर', nameEn: 'Rheumatoid Arthritis — Stable on Treatment', icd10: 'M06.9' },
    { key: 'MTX-INITIATION-COUNSELING', name: 'मेथोट्रेक्सेट प्रारंभ परामर्श (साप्ताहिक!)', nameEn: 'Methotrexate Initiation Counselling (Weekly!)', icd10: 'Z79.8' },
    { key: 'SLE-STABLE-HCQ', name: 'SLE — स्थिर, HCQ चालू', nameEn: 'SLE — Stable on Hydroxychloroquine', icd10: 'M32.9' },
    { key: 'GOUT-ACUTE-FLARE', name: 'गाउट — तीव्र दौरा', nameEn: 'Gout — Acute Flare', icd10: 'M10.0' },
    { key: 'GOUT-URATE-LOWERING-CHRONIC', name: 'गाउट — यूरेट-घटाने की दवा चालू', nameEn: 'Gout — On Urate-Lowering Therapy', icd10: 'M10.9' },
    { key: 'CRYSTAL-CONFIRMED-GOUT', name: 'क्रिस्टल-पुष्टि गाउट', nameEn: 'Crystal-Proven Gout', icd10: 'M10.0' },
    { key: 'AS-SUSPECT-AXIAL', name: 'कशेरुक-गठिया (AS) संदिग्ध — अक्षीय', nameEn: 'Suspected Axial Spondyloarthritis (AS)', icd10: 'M45' },
    { key: 'FIBROMYALGIA-EDUCATION', name: 'फाइब्रोमायल्जिया — शिक्षा/प्रबंधन', nameEn: 'Fibromyalgia — Education & Management', icd10: 'M79.7' },
    { key: 'OSTEOARTHRITIS-KNEE', name: 'घुटने का ऑस्टियोआर्थ्राइटिस (ORT समन्वय)', nameEn: 'Osteoarthritis of Knee (coordinate ORT)', icd10: 'M17.9' },
    { key: 'OSTEOPOROSIS-TREATMENT', name: 'ऑस्टियोपोरोसिस — सहायक इलाज (END समन्वय)', nameEn: 'Osteoporosis — Supportive Care (coordinate END)', icd10: 'M81.9' },
    { key: 'SICCA-SUSPECT', name: 'सिका सिंड्रोम संदिग्ध (शुष्क आंख-मुंह)', nameEn: 'Suspected Sicca Syndrome (dry eyes/mouth)', icd10: 'M35.0' },
    { key: 'RAYNAUD-PHENOMENON', name: 'रेनॉ परिघटना', nameEn: 'Raynaud Phenomenon', icd10: 'I73.0' },
  ],

  // ══ Medicines (21) — conservative start-low + monitoring framing ══════
  // ⚠ All verified:false (unverified-dose mode). DMARD entries carry
  // WEEKLY/monitoring teaching in the salt note. No NEU/DIA/END territory.
  medicines: [
    // Analgesia / anti-inflammatory (conservative)
    { name: 'Crocin 650 Tablet', salt: 'Paracetamol 650 mg (first-line analgesia bridge; max 3 g/day)', doseOptions: ['1 tab (650 mg) SOS', '1 tab every 8 hrs (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Naprosyn 375 Tablet', salt: 'Naproxen 375 mg (NSAID — ALWAYS after food + pair Pan 40; elderly GI/kidney caution; SHORT courses only)', doseOptions: ['1 tab twice daily after food — short course', '1 tab BD × 3-5 days — flare only'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Etoshine 90 Tablet', salt: 'Etoricoxib 90 mg (COX-2 NSAID — CV caution with BP/heart history; short courses; after food)', doseOptions: ['1 tab once daily after food — short course'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (gastric cover — mandatory companion to any NSAID course)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg (alternative gastric cover with NSAIDs)', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone) — SOS breakthrough acidity on NSAIDs', doseOptions: ['10 ml SOS after meals'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Gout / crystal
    { name: 'Zycolchin 0.5 Tablet', salt: 'Colchicine 0.5 mg (acute flare short-course dosing; prophylaxis during urate-therapy start; loose stools = stop)', doseOptions: ['Flare: 1 tab twice-thrice daily × 3 days only', 'Prophylaxis: 1 tab daily during urate-therapy initiation'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zyloric 100 Tablet', salt: 'Allopurinol 100 mg (urate-lowering — START-LOW 50-100 mg, titrate slowly to target; NEVER start during a flare; lifelong framing)', doseOptions: ['START LOW: 1 tab (100 mg) once daily — titrate slowly', '½ tab (50 mg) daily — kidney/elderly start'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Feburic 40 Tablet', salt: 'Febuxostat 40 mg (urate-lowering alternative — CV-caution framing; never start during a flare)', doseOptions: ['1 tab (40 mg) once daily', '1 tab (80 mg) once daily — after uric-acid review'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // DMARDs — specialist-initiated, start-low, mandatory monitoring
    { name: 'HCQS 200 Tablet', salt: 'Hydroxychloroquine 200 mg (mild DMARD — annual retina check after 5 yrs of use; generally continued in pregnancy under specialist care)', doseOptions: ['1 tab (200 mg) once daily — retina check yearly after 5 yrs', '1 tab twice daily — as specialist advised'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Folitrax 7.5 Tablet', salt: 'Methotrexate 7.5 mg — ⚠ ONCE A WEEK, one fixed day. FATAL if taken daily. Specialist-initiated only; never double a missed dose; pair with folic acid; CBC/LFT monitoring', doseOptions: ['1 tab (7.5 mg) ONCE A WEEK — fixed day (e.g., Sunday)'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Folitrax 10 Tablet', salt: 'Methotrexate 10 mg — ⚠ ONCE A WEEK, one fixed day. FATAL if taken daily. Never double a missed dose; folic acid companion; CBC/LFT every 2-4 wks then q3mo', doseOptions: ['1 tab (10 mg) ONCE A WEEK — fixed day (e.g., Sunday)'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Folitrax 15 Tablet', salt: 'Methotrexate 15 mg — ⚠ ONCE A WEEK, one fixed day. FATAL if taken daily. Never double; folic acid companion; CBC/LFT monitoring mandatory', doseOptions: ['1 tab (15 mg) ONCE A WEEK — fixed day (e.g., Sunday)'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg (MTX companion — the day AFTER MTX weekly; protects mouth ulcers/nausea)', doseOptions: ['1 tab the day AFTER MTX (weekly)', '1 tab daily except MTX day — as advised'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Saazo 500 Tablet', salt: 'Sulfasalazine 500 mg (alternative DMARD — build up slowly; CBC monitoring mandatory)', doseOptions: ['1 tab (500 mg) twice daily after food — slow build', '2 tabs BD — as tolerated'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Bone / nutrition support
    { name: 'Calcirol 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules (vitamin-D — India deficiency near-epidemic; dose per D3 report; END coordinates long-term)', doseOptions: ['1 sachet monthly with milk — per D3 report', '1 sachet weekly × 8 weeks — severe deficiency'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU (after food)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 (neuropathy/fatigue support)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Symptom relief
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg (SOS only; dependence possible; specialist review if regular)', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Artificial Tears Eye Drops', salt: 'Hydroxypropyl methylcellulose eye drops (sicca dry-eye; preservative-free if very frequent use)', doseOptions: ['1-2 drops each eye 4-6 times/day'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel (topical NSAID — spares the stomach; intact skin only)', doseOptions: ['Apply thin layer locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (30 — refer-only findings ZERO links) ════
  findingMeds: [
    // RA-EARLY-SUSPECT — bridge analgesia while the workup runs
    { findingKey: 'RA-EARLY-SUSPECT', medicineName: 'Crocin 650 Tablet', dose: '1 tab (650 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Pain bridge while workup runs — first-line, not NSAID' },
    { findingKey: 'RA-EARLY-SUSPECT', medicineName: 'Naprosyn 375 Tablet', dose: '1 tab twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'Short anti-inflammatory course ONLY until workup/DMARD discussion' },
    { findingKey: 'RA-EARLY-SUSPECT', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Mandatory companion to any NSAID course' },
    // RA-ON-TREATMENT-STABLE
    { findingKey: 'RA-ON-TREATMENT-STABLE', medicineName: 'Folitrax 15 Tablet', dose: '1 tab ONCE A WEEK', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'CONTINUATION — weekly dose verification at every visit; never double a missed dose' },
    { findingKey: 'RA-ON-TREATMENT-STABLE', medicineName: 'Folvite 5 Tablet', dose: '1 tab the day after MTX', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Folic acid companion — day after MTX' },
    { findingKey: 'RA-ON-TREATMENT-STABLE', medicineName: 'Saazo 500 Tablet', dose: '1 tab twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 60, description: 'Alternative/adjunct DMARD — CBC monitoring' },
    { findingKey: 'RA-ON-TREATMENT-STABLE', medicineName: 'Neurobion Forte Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'B-complex support' },
    // MTX-INITIATION-COUNSELING — start-low tier + companion
    { findingKey: 'MTX-INITIATION-COUNSELING', medicineName: 'Folitrax 7.5 Tablet', dose: '1 tab ONCE A WEEK — fixed day', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'START-LOW first month; WEEKLY not daily — fatal-error teaching' },
    { findingKey: 'MTX-INITIATION-COUNSELING', medicineName: 'Folvite 5 Tablet', dose: '1 tab the day after MTX', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Folic acid same week — reduces mouth ulcers/nausea' },
    // SLE-STABLE-HCQ
    { findingKey: 'SLE-STABLE-HCQ', medicineName: 'HCQS 200 Tablet', dose: '1 tab (200 mg) daily', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Continue as specialist advised — annual eye check after 5 yrs of use' },
    { findingKey: 'SLE-STABLE-HCQ', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Vitamin-D support (steroid/SLE patients commonly deficient)' },
    { findingKey: 'SLE-STABLE-HCQ', medicineName: 'Shelcal 500 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Bone support on long-term therapy' },
    // GOUT-ACUTE-FLARE
    { findingKey: 'GOUT-ACUTE-FLARE', medicineName: 'Zycolchin 0.5 Tablet', dose: '1 tab twice-thrice daily × 3 days', morning: 0, afternoon: 1, evening: 1, tab: 10, description: 'Flare course only — stop after 3 days; loose motions = stop' },
    { findingKey: 'GOUT-ACUTE-FLARE', medicineName: 'Naprosyn 375 Tablet', dose: '1 tab twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'Alternative flare course — short, with food' },
    { findingKey: 'GOUT-ACUTE-FLARE', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Gastric cover with the NSAID' },
    // GOUT-URATE-LOWERING-CHRONIC
    { findingKey: 'GOUT-URATE-LOWERING-CHRONIC', medicineName: 'Zyloric 100 Tablet', dose: '1 tab (100 mg) daily — start-low, titrate', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Lifelong therapy framing; never start during a flare' },
    { findingKey: 'GOUT-URATE-LOWERING-CHRONIC', medicineName: 'Feburic 40 Tablet', dose: '1 tab (40 mg) daily', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Alternative if allopurinol not tolerated — CV caution' },
    // CRYSTAL-CONFIRMED-GOUT
    { findingKey: 'CRYSTAL-CONFIRMED-GOUT', medicineName: 'Zyloric 100 Tablet', dose: '1 tab daily — titrate to uric acid <6', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Confirmed gout — titrate slowly to target' },
    { findingKey: 'CRYSTAL-CONFIRMED-GOUT', medicineName: 'Feburic 40 Tablet', dose: '1 tab daily', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Alternative urate-lowering' },
    { findingKey: 'CRYSTAL-CONFIRMED-GOUT', medicineName: 'Zycolchin 0.5 Tablet', dose: '1 tab daily', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'Prophylaxis during urate-therapy initiation months' },
    // AS-SUSPECT-AXIAL
    { findingKey: 'AS-SUSPECT-AXIAL', medicineName: 'Naprosyn 375 Tablet', dose: '1 tab twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 14, description: 'NSAID first-line in axial disease — with gastric cover' },
    { findingKey: 'AS-SUSPECT-AXIAL', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Companion to the NSAID' },
    { findingKey: 'AS-SUSPECT-AXIAL', medicineName: 'Etoshine 90 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 10, description: 'Alternative — CV caution framing' },
    // FIBROMYALGIA-EDUCATION — education-first, rescue only
    { findingKey: 'FIBROMYALGIA-EDUCATION', medicineName: 'Ultracet Tablet', dose: '1 tab SOS (max 3/day)', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'Rescue only — education + graded exercise + sleep-first are the treatment' },
    // OSTEOARTHRITIS-KNEE
    { findingKey: 'OSTEOARTHRITIS-KNEE', medicineName: 'Crocin 650 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'First-line — avoid daily chronic NSAID in OA' },
    { findingKey: 'OSTEOARTHRITIS-KNEE', medicineName: 'Etoshine 90 Tablet', dose: '1 tab daily — short course', morning: 1, afternoon: 0, evening: 0, tab: 10, description: 'Occasional short courses only — CV caution' },
    { findingKey: 'OSTEOARTHRITIS-KNEE', medicineName: 'Voveran Gel 30g', dose: 'Apply locally 2-3 times/day', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Topical first — spares the stomach' },
    // OSTEOPOROSIS-TREATMENT — supportive only (END owns bisphosphonates)
    { findingKey: 'OSTEOPOROSIS-TREATMENT', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly — per D3 report', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Supportive only — anti-resorptive therapy decided with END' },
    { findingKey: 'OSTEOPOROSIS-TREATMENT', medicineName: 'Shelcal 500 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Daily calcium support' },
    // SICCA-SUSPECT
    { findingKey: 'SICCA-SUSPECT', medicineName: 'Artificial Tears Eye Drops', dose: '1-2 drops each eye 4-6 times/day', morning: 0, afternoon: 0, evening: 0, tab: 1, description: 'Dry-eye relief while Schirmer/autoimmune workup proceeds' },
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'MTX Safety Card (Weekly — Not Daily!)',
      rows: 6,
      cols: 3,
      headerLabel: ['दिन / सप्ताह', 'क्या करें', 'याद रखें'],
      colsLabel: ['Day / Week', 'What to Do', 'Remember'],
      footerLabel: ['मुंह के छाले · तेज़ बुखार · पीली आंख या पेट दर्द = MTX उसी दिन रोकें और तुरंत कॉल करें / Mouth ulcers · high fever · yellow eyes or belly pain = STOP MTX the same day and CALL immediately'],
    },
    {
      name: 'Gout Diet Card (Indian)',
      rows: 5,
      cols: 3,
      headerLabel: ['श्रेणी', 'उदाहरण (भारतीय)', 'क्या करें'],
      colsLabel: ['Category', 'Examples (Indian)', 'Action'],
      footerLabel: ['कम-वसा दूध-दही सुरक्षात्मक · कॉफी ठीक है · रोज़ 2.5-3 लीटर पानी / Low-fat milk-curd is protective · coffee OK · 2.5-3 litres of water daily'],
    },
    {
      name: 'Joint Diary (Weekly Trend)',
      rows: 7,
      cols: 5,
      headerLabel: ['सप्ताह', 'सूजन वाले जोड़ (गिनती)', 'सुबह अकड़न (मिनट)', 'दर्द (0-10)', 'टिप्पणी'],
      colsLabel: ['Week', 'Swollen Joints (count)', 'Morning Stiffness (min)', 'Pain (0-10)', 'Notes'],
      footerLabel: ['हर विज़िट पर डॉक्टर को दिखाएं — इलाज जारी रखने/बदलने का आधार यही संख्याएं हैं / Show the doctor at every visit — these numbers drive the treatment decisions'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Gout — Acute Flare',
      diagnosis: 'GOUT-ACUTE-FLARE',
      medicines: [
        { name: 'Zycolchin 0.5 Tablet', dose: '1 tab twice-thrice daily', duration: '3 days', instructions: 'Flare course only — stop after 3 days; loose motions = stop and inform' },
        { name: 'Naprosyn 375 Tablet', dose: '1 tab twice daily', duration: '5 days', instructions: 'STRICTLY after food; stop earlier if the pain settles' },
        { name: 'Pan 40 Tablet', dose: '1 tab before breakfast', duration: '5 days', instructions: 'Runs with the painkiller — protects the stomach' },
      ],
      labs: ['Serum uric acid 2 weeks AFTER the flare settles (not during)', 'CBC + Serum creatinine before urate-lowering is planned'],
      advice: 'दौरे में जोड़ को आराम + बर्फ की सिकाई 15-20 मिनट, दिन में 3-4 बार · पैर तकिये पर ऊंचा रखें · यूरेट-घटाने की दवा (Zyloric वगैरह) इस दौरे में नई कभी शुरू नहीं होती — चालू हो तो बिना पूछे न रोकें · मांस/ऑरगन मीट/बीयर-शराब/मीठी कोल्ड-ड्रिंक्स बंद · रोज़ 2.5-3 लीटर पानी',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'RA — Initial Workup + Counseling',
      diagnosis: 'RA-EARLY-SUSPECT',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab SOS', duration: '7 days', instructions: 'Pain bridge while the workup runs' },
        { name: 'Naprosyn 375 Tablet', dose: '1 tab twice daily', duration: '7 days', instructions: 'After food — short course only' },
        { name: 'Pan 40 Tablet', dose: '1 tab before breakfast', duration: '7 days', instructions: 'With the NSAID' },
      ],
      labs: ['RA factor + Anti-CCP', 'ESR + CRP', 'CBC + LFT + Creatinine (DMARD baseline)', 'X-ray hands and feet (erosions?)'],
      advice: 'नतीजों के साथ अगली विज़िट में DMARD (जैसे मेथोट्रेक्सेट) की चर्चा होगी — RA में जल्दी शुरुआत जोड़ों की रक्षा करती है, देरी स्थायी नुकसान करती है · MTX हफ्ते में एक बार ही होती है — यह नियम जानना सबसे जरूरी है · धूम्रपान छोड़ना इलाज का हिस्सा है · जोड़-डायरी आज से शुरू करें',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'OA Knee — Conservative Start',
      diagnosis: 'OSTEOARTHRITIS-KNEE',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab SOS', duration: '15 days', instructions: 'FIRST line — daily chronic NSAID is not the plan' },
        { name: 'Voveran Gel 30g', dose: 'Apply locally 2-3 times/day', duration: '15 days', instructions: 'On the knee, intact skin — spares the stomach' },
        { name: 'Ultracet Tablet', dose: '1 tab SOS (max 3/day)', duration: '10 days', instructions: 'Only if Crocin is insufficient' },
      ],
      labs: ['X-ray both knees STANDING', 'Vitamin D3 level — deficiency near-epidemic in India'],
      advice: 'फिजियोथेरेपी का पर्चा — जांघ की मांसपेशी (quadriceps) के व्यायाम से गोली से ज्यादा फायदा होता है · वजन घटाना घुटने का सबसे सस्ता इलाज · जमीन पर बैठना/स्क्वैट कम, कुर्सी और ऊंचा शौचालय · नरम तले वाले जूते · सीढ़ी की जगह रैंप',
      followUpDays: 14,
    },
  ],
}
