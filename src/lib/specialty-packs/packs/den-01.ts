/**
 * DEN-01 — DENTISTRY STARTER PACK (T1)
 *
 * "Its own pharmacology world": the India dental OPD core — toothache,
 * sensitivity, cavities, wisdom teeth, gum disease, ulcers, TMJ pain,
 * denture care — with dental-specific prescribing culture: SHORT
 * antibiotic courses (3-5 days typical, 7 max), a heavy topical
 * armamentarium (the chlorhexidine world, lignocaine/salicylate gels),
 * and the India reality of tobacco-driven lesions (gutkha/paan) that are
 * always SCREEN-AND-REFER, never medicine-only.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / printed advice),
 * English secondary (doctor search). Medicine names = Indian English
 * brands; topicals carry their form & pack size in the name (e.g.
 * Metrogyl DG Gel 20g).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-dental-formulary adult defaults but have NOT
 * yet been signed off by an MBBS reviewer. UI must show the
 * unverified-dose badge until meta.reviewedBy is stamped. Extra-caution
 * items in this pack: Ketorol-DT (max 3-5 days, GI risk), Kenacort paste
 * (topical steroid in mouth), Forcan 150 (pregnancy), Dologel CT
 * (salicylate — aspirin-sensitivity), Dalacin C (colitis risk).
 *
 * SAFETY POLICY (dental pharmacology specifics):
 * - Dental antibiotic courses are SHORT: 3-5 days typical, 7 days max —
 *   reflected in salt notes and tab quantities.
 * - Chlorhexidine rinses: max 2 weeks (staining / taste alteration).
 * - Dologel CT (choline salicylate): aspirin-sensitivity caution + NOT
 *   for young children.
 * - Tobacco-driven lesions (white/red patch, oral submucous fibrosis,
 *   non-healing ulcer) carry ZERO medicine links — mandatory oral-cancer
 *   screening referral lines in questions/suggestions.
 * - Local anaesthetics are chairside procedures — NOT pack entries.
 * - No anxiolytics for dental anxiety (behavioural management only).
 * - No nimesulide; no ciprofloxacin for dental infections (poor oral-
 *   flora coverage) — both deliberately excluded.
 *
 * Sources: NLEM 2023 backbone, standard Indian dental OPD practice
 * patterns, FDI two-digit tooth numbering for the dental chart template.
 */

import type { SpecialtyPack } from '../types'

export const DEN01_PACK: SpecialtyPack = {
  meta: {
    code: 'DEN-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Dentistry Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'NLEM 2023 backbone · standard Indian dental OPD practice patterns · short-course antibiotic & topical-first dental culture · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'TTH', name: 'दांत', nameEn: 'Tooth' },
    { key: 'GUM', name: 'मसूड़े', nameEn: 'Gums' },
    { key: 'MTH', name: 'मुंह व छाले', nameEn: 'Mouth & Ulcers' },
    { key: 'JAW', name: 'जबड़ा व चेहरा', nameEn: 'Jaw & Face' },
    { key: 'DNT', name: 'नकली दांत', nameEn: 'Dentures' },
    { key: 'OTH', name: 'उपचार व अन्य', nameEn: 'Treatment & Others' },
  ],

  // ══ Complaints (44) ══════════════════════════════════════════════════
  complaints: [
    // TTH — Tooth
    { code: 'TTH01', categoryKey: 'TTH', detail: 'दांत दर्द', detailEn: 'Toothache' },
    { code: 'TTH02', categoryKey: 'TTH', detail: 'ठंडा-गर्म-मीठा खाने पर दांत में चुभन', detailEn: 'Tooth Sensitivity (Hot/Cold/Sweet)' },
    { code: 'TTH03', categoryKey: 'TTH', detail: 'दांत पर काला धब्बा / कीड़ा', detailEn: 'Black Spot / Cavity' },
    { code: 'TTH04', categoryKey: 'TTH', detail: 'दांत टूटना', detailEn: 'Broken / Chipped Tooth' },
    { code: 'TTH05', categoryKey: 'TTH', detail: 'दांतों के बीच खाना फंसना', detailEn: 'Food Stuck Between Teeth' },
    { code: 'TTH06', categoryKey: 'TTH', detail: 'चबाने पर दांत में दर्द', detailEn: 'Pain on Chewing' },
    { code: 'TTH07', categoryKey: 'TTH', detail: 'दांत हिलना', detailEn: 'Loose Tooth' },
    { code: 'TTH08', categoryKey: 'TTH', detail: 'अक्ल दाढ़ में दर्द', detailEn: 'Wisdom Tooth Pain' },
    { code: 'TTH09', categoryKey: 'TTH', detail: 'दांत निकालने के बाद दर्द', detailEn: 'Pain After Tooth Extraction' },
    { code: 'TTH10', categoryKey: 'TTH', detail: 'दांत की फिलिंग गिरना', detailEn: 'Filling Fell Out' },
    { code: 'TTH11', categoryKey: 'TTH', detail: 'रूट कैनाल (RCT) के बाद दर्द', detailEn: 'Pain After Root Canal' },
    // GUM — Gums
    { code: 'GUM01', categoryKey: 'GUM', detail: 'मसूड़ों से खून आना', detailEn: 'Bleeding Gums' },
    { code: 'GUM02', categoryKey: 'GUM', detail: 'मसूड़ों में सूजन / दर्द', detailEn: 'Swollen / Painful Gums' },
    { code: 'GUM03', categoryKey: 'GUM', detail: 'मसूड़े पर मवाद का दाना / फोड़ा', detailEn: 'Gum Boil / Gum Abscess' },
    { code: 'GUM04', categoryKey: 'GUM', detail: 'मुंह से बदबू', detailEn: 'Bad Breath' },
    { code: 'GUM05', categoryKey: 'GUM', detail: 'मसूड़े पीछे हटना / जड़ दिखना', detailEn: 'Receding Gums' },
    { code: 'GUM06', categoryKey: 'GUM', detail: 'दांतों पर पीली परत / पत्थर', detailEn: 'Stains / Calculus on Teeth' },
    // MTH — Mouth & Ulcers
    { code: 'MTH01', categoryKey: 'MTH', detail: 'मुंह के छाले', detailEn: 'Mouth Ulcers' },
    { code: 'MTH02', categoryKey: 'MTH', detail: 'बार-बार छाले पड़ना', detailEn: 'Recurrent Mouth Ulcers' },
    { code: 'MTH03', categoryKey: 'MTH', detail: 'मुंह सूखना', detailEn: 'Dry Mouth' },
    { code: 'MTH04', categoryKey: 'MTH', detail: 'मुंह में जलन', detailEn: 'Burning Mouth' },
    { code: 'MTH05', categoryKey: 'MTH', detail: 'मुंह में सफेद / लाल धब्बा', detailEn: 'White / Red Patch in Mouth' },
    { code: 'MTH06', categoryKey: 'MTH', detail: 'मुंह कम खुलना (गुटखा/पान से)', detailEn: 'Reduced Mouth Opening (Tobacco)' },
    { code: 'MTH07', categoryKey: 'MTH', detail: 'होंठ के कोने फटना', detailEn: 'Cracked Lip Corners' },
    { code: 'MTH08', categoryKey: 'MTH', detail: 'बार-बार गाल काटना', detailEn: 'Recurring Cheek Bite' },
    { code: 'MTH09', categoryKey: 'MTH', detail: 'जीभ पर सफेद परत', detailEn: 'White Coating on Tongue' },
    { code: 'MTH10', categoryKey: 'MTH', detail: 'न भरने वाला मुंह का घाव', detailEn: 'Non-healing Mouth Ulcer' },
    // JAW — Jaw & Face
    { code: 'JAW01', categoryKey: 'JAW', detail: 'जबड़े का दर्द (कान/कनपटी के पास)', detailEn: 'Jaw Pain (TMJ)' },
    { code: 'JAW02', categoryKey: 'JAW', detail: 'जबड़े से टक-टक आवाज', detailEn: 'Jaw Clicking' },
    { code: 'JAW03', categoryKey: 'JAW', detail: 'रात में दांत पीसना', detailEn: 'Night Grinding (Bruxism)' },
    { code: 'JAW04', categoryKey: 'JAW', detail: 'चेहरे / जबड़े पर सूजन', detailEn: 'Facial Swelling (Dental Infection)' },
    { code: 'JAW05', categoryKey: 'JAW', detail: 'दांत के इलाज के बाद चेहरे पर सूजन', detailEn: 'Facial Swelling After Dental Treatment' },
    { code: 'JAW06', categoryKey: 'JAW', detail: 'सुबह जबड़ा अकड़ना', detailEn: 'Morning Jaw Stiffness' },
    // DNT — Dentures
    { code: 'DNT01', categoryKey: 'DNT', detail: 'नकली दांत (डेंचर) ढीली / दुखती', detailEn: 'Loose / Hurting Denture' },
    { code: 'DNT02', categoryKey: 'DNT', detail: 'डेंचर से मुंह में छाले', detailEn: 'Denture Sores' },
    { code: 'DNT03', categoryKey: 'DNT', detail: 'डेंचर टूटना', detailEn: 'Broken Denture' },
    { code: 'DNT04', categoryKey: 'DNT', detail: 'नई डेंचर चाहिए', detailEn: 'New Denture Query' },
    // OTH — Treatment & Others
    { code: 'OTH01', categoryKey: 'OTH', detail: 'दांतों की सफाई / स्केलिंग करानी है', detailEn: 'Scaling / Cleaning Query' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'दांत सफेद कराने हैं', detailEn: 'Teeth Whitening Query' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'टेढ़े दांत / ब्रेसेस की सलाह', detailEn: 'Crooked Teeth / Braces Query' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'इम्प्लांट चाहिए', detailEn: 'Dental Implant Query' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'दांत के इलाज से डर लगता है', detailEn: 'Dental Anxiety / Fear' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'दांतों की नियमित जांच', detailEn: 'Routine Dental Check-up' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'गुटखा/तंबाकू छोड़ने की सलाह', detailEn: 'Tobacco Cessation Advice' },
  ],

  // ══ Questions (88 — 2 per complaint, idx 0-87) ══════════════════════
  // AUTHORING CONVENTION: every question carries its array index as a
  // trailing `// idx N` comment; the suggestions section below references
  // those numbers. Keep this in sync on every edit (index drift = bug).
  questions: [
    // TTH01 — Toothache
    { complaintCode: 'TTH01', question: 'दर्द कितने दिनों से है?', questionEn: 'Since how many days is the pain?' }, // idx 0
    { complaintCode: 'TTH01', question: 'रात में सोते समय दर्द बढ़ता है क्या?', questionEn: 'Does the pain worsen at night while lying down?' }, // idx 1
    // TTH02 — Sensitivity
    { complaintCode: 'TTH02', question: 'ठंडा, गर्म या मीठा — किस चीज से चुभता है?', questionEn: 'Cold, hot or sweet — which one triggers the sensitivity?' }, // idx 2
    { complaintCode: 'TTH02', question: 'चुभन कितनी देर तक रहती है?', questionEn: 'How long does the sensitivity last?' }, // idx 3
    // TTH03 — Cavity
    { complaintCode: 'TTH03', question: 'दांत में काला दाग कब से दिख रहा है?', questionEn: 'Since when is the black spot visible on the tooth?' }, // idx 4
    { complaintCode: 'TTH03', question: 'दाग वाले दांत में खाना फंसता है या दर्द होता है?', questionEn: 'Does food get stuck or pain in the tooth with the spot?' }, // idx 5
    // TTH04 — Broken tooth
    { complaintCode: 'TTH04', question: 'दांत कैसे टूटा — चोट लगी थी या खाते समय?', questionEn: 'How did the tooth break — injury or while eating?' }, // idx 6
    { complaintCode: 'TTH04', question: 'टूटे हुए दांत में ठंडा-गर्म महसूस होता है?', questionEn: 'Does the broken tooth feel hot or cold sensation?' }, // idx 7
    // TTH05 — Food stuck
    { complaintCode: 'TTH05', question: 'खाना किन दांतों के बीच फंसता है?', questionEn: 'Between which teeth does food get stuck?' }, // idx 8
    { complaintCode: 'TTH05', question: 'फंसे हुए खाने से दर्द या बदबू आती है?', questionEn: 'Pain or foul smell from the trapped food?' }, // idx 9
    // TTH06 — Pain on chewing
    { complaintCode: 'TTH06', question: 'किसी एक खास दांत को दबाने पर दर्द आता है?', questionEn: 'Does pain come on pressing one specific tooth?' }, // idx 10
    { complaintCode: 'TTH06', question: 'दर्द अचानक तेज चुभता है या हल्का लगातार रहता है?', questionEn: 'Is the pain sudden and sharp, or mild and constant?' }, // idx 11
    // TTH07 — Loose tooth
    { complaintCode: 'TTH07', question: 'कौन सा दांत हिलता है और कितना हिलता है?', questionEn: 'Which tooth is loose and how much does it move?' }, // idx 12
    { complaintCode: 'TTH07', question: 'मसूड़ों से खून भी आता है क्या?', questionEn: 'Do the gums also bleed?' }, // idx 13
    // TTH08 — Wisdom tooth
    { complaintCode: 'TTH08', question: 'जबड़े के सबसे आखिरी हिस्से के मसूड़े सूजे या दुखते हैं?', questionEn: 'Are the gums at the very back of the jaw swollen or painful?' }, // idx 14
    { complaintCode: 'TTH08', question: 'मुंह खोलने में दिक्कत होती है?', questionEn: 'Is there difficulty opening the mouth?' }, // idx 15
    // TTH09 — Post-extraction pain
    { complaintCode: 'TTH09', question: 'दांत निकाले हुए कितने दिन हुए?', questionEn: 'How many days ago was the tooth extracted?' }, // idx 16
    { complaintCode: 'TTH09', question: 'जगह से बदबू या लगातार बढ़ता दर्द है?', questionEn: 'Foul smell or constantly worsening pain from the socket?' }, // idx 17
    // TTH10 — Filling fell out
    { complaintCode: 'TTH10', question: 'फिलिंग कब गिरी और अब दर्द है क्या?', questionEn: 'When did the filling fall out, and is there pain now?' }, // idx 18
    { complaintCode: 'TTH10', question: 'खाली जगह में खाना फंसता है या ठंडा-गर्म चुभता है?', questionEn: 'Food trapping or sensitivity at the empty spot?' }, // idx 19
    // TTH11 — Post-RCT pain
    { complaintCode: 'TTH11', question: 'रूट कैनाल कब हुआ था (पूरा हुआ या चालू है)?', questionEn: 'When was the root canal done — completed or ongoing?' }, // idx 20
    { complaintCode: 'TTH11', question: 'चबाने पर उसी दांत में दर्द होता है?', questionEn: 'Pain in the same tooth on chewing?' }, // idx 21
    // GUM01 — Bleeding gums
    { complaintCode: 'GUM01', question: 'ब्रश करते समय मसूड़ों से खून आता है?', questionEn: 'Do gums bleed while brushing?' }, // idx 22
    { complaintCode: 'GUM01', question: 'बिना ब्रश किए भी खून आता है (खाने पर या अपने आप)?', questionEn: 'Bleeding even without brushing — while eating or spontaneously?' }, // idx 23
    // GUM02 — Swollen gums
    { complaintCode: 'GUM02', question: 'सूजन एक जगह है या पूरे मुंह के मसूड़ों में?', questionEn: 'Swelling at one spot or all over the gums?' }, // idx 24
    { complaintCode: 'GUM02', question: 'सूजन के साथ बुखार भी है?', questionEn: 'Fever along with the swelling?' }, // idx 25
    // GUM03 — Gum boil
    { complaintCode: 'GUM03', question: 'दाने से मवाद निकलता है या दबाने पर दर्द होता है?', questionEn: 'Does the boil discharge pus or pain on pressure?' }, // idx 26
    { complaintCode: 'GUM03', question: 'यह दाना कब से है?', questionEn: 'Since when is this boil present?' }, // idx 27
    // GUM04 — Bad breath
    { complaintCode: 'GUM04', question: 'बदबू सुबह के समय ज्यादा है या दिनभर रहती है?', questionEn: 'Bad breath worse in the morning or present all day?' }, // idx 28
    { complaintCode: 'GUM04', question: 'जीभ की सफाई करते हैं? पाचन में कोई दिक्कत भी है?', questionEn: 'Do you clean your tongue? Any digestive trouble too?' }, // idx 29
    // GUM05 — Receding gums
    { complaintCode: 'GUM05', question: 'दांत लंबे दिखने लगे हैं या जड़ दिखने लगी है?', questionEn: 'Do teeth look longer or the root become visible?' }, // idx 30
    { complaintCode: 'GUM05', question: 'खुली जड़ में ठंडा-गर्म चुभता है?', questionEn: 'Sensitivity to hot/cold at the exposed root?' }, // idx 31
    // GUM06 — Stains / calculus
    { complaintCode: 'GUM06', question: 'पीली परत कितने समय से जमी है?', questionEn: 'Since how long has the yellow deposit been there?' }, // idx 32
    { complaintCode: 'GUM06', question: 'पहले कभी स्केलिंग (सफाई) कराई है?', questionEn: 'Have you had scaling done before?' }, // idx 33
    // MTH01 — Mouth ulcers
    { complaintCode: 'MTH01', question: 'कितने छाले हैं और कितने दिनों से?', questionEn: 'How many ulcers, and since how many days?' }, // idx 34
    { complaintCode: 'MTH01', question: 'खाने-पीने में जलन कितनी तेज है?', questionEn: 'How severe is the burning while eating or drinking?' }, // idx 35
    // MTH02 — Recurrent ulcers
    { complaintCode: 'MTH02', question: 'कितने समय में एक बार छाले आ जाते हैं?', questionEn: 'How often do the ulcers come back?' }, // idx 36
    { complaintCode: 'MTH02', question: 'परिवार में किसी को भी छाले पड़ते हैं, या शरीर की और जगह भी होते हैं?', questionEn: 'Family history of ulcers, or ulcers elsewhere on the body too?' }, // idx 37
    // MTH03 — Dry mouth
    { complaintCode: 'MTH03', question: 'मुंह सूखना कब से शुरू हुआ?', questionEn: 'Since when has the mouth been dry?' }, // idx 38
    { complaintCode: 'MTH03', question: 'कोई दवा चल रही है या शुगर की बीमारी है?', questionEn: 'Any medicines going on, or diabetes?' }, // idx 39
    // MTH04 — Burning mouth
    { complaintCode: 'MTH04', question: 'जलन कहां ज्यादा है — जीभ, तालू या होंठ?', questionEn: 'Where is the burning worst — tongue, palate or lips?' }, // idx 40
    { complaintCode: 'MTH04', question: 'खाना खाने से जलन घटती है या बढ़ती है?', questionEn: 'Does eating relieve the burning or make it worse?' }, // idx 41
    // MTH05 — White/red patch
    { complaintCode: 'MTH05', question: 'गुटखा, पान, बीड़ी या तंबाकू का इस्तेमाल करते हैं?', questionEn: 'Do you use gutkha, paan, bidi or tobacco?' }, // idx 42
    { complaintCode: 'MTH05', question: 'धब्बा कब से है — बढ़ रहा है या वैसा ही है?', questionEn: 'Since when is the patch there — growing or static?' }, // idx 43
    // MTH06 — Reduced mouth opening
    { complaintCode: 'MTH06', question: 'मुंह खोलने पर कितनी उंगलियां साथ-साथ जाती हैं?', questionEn: 'How many fingers fit together between the teeth on opening?' }, // idx 44
    { complaintCode: 'MTH06', question: 'गुटखा/तंबाकू कितने सालों से इस्तेमाल कर रहे हैं?', questionEn: 'Since how many years have you used gutkha/tobacco?' }, // idx 45
    // MTH07 — Angular cheilitis
    { complaintCode: 'MTH07', question: 'होंठ के कोने कितने दिनों से फटे हैं?', questionEn: 'Since how many days are the lip corners cracked?' }, // idx 46
    { complaintCode: 'MTH07', question: 'खट्टा या नमकीन खाने पर कोनों में जलन होती है?', questionEn: 'Burning at the corners with sour or salty food?' }, // idx 47
    // MTH08 — Cheek bite
    { complaintCode: 'MTH08', question: 'गाल कितनी बार कट जाता है — कभी-कभी या रोज?', questionEn: 'How often do you bite your cheek — occasionally or daily?' }, // idx 48
    { complaintCode: 'MTH08', question: 'बार-बार काटी हुई जगह मोटी या सफेद हो गई है?', questionEn: 'Has the repeatedly bitten area become thick or white?' }, // idx 49
    // MTH09 — White coating on tongue
    { complaintCode: 'MTH09', question: 'परत झाड़ने पर नीचे लाल या खुना सा दिखता है?', questionEn: 'Is it red or raw-looking beneath when the coating is wiped?' }, // idx 50
    { complaintCode: 'MTH09', question: 'हाल में एंटीबायोटिक या इनहेलर चल रहा है?', questionEn: 'Any recent antibiotic course or inhaler use?' }, // idx 51
    // MTH10 — Non-healing ulcer
    { complaintCode: 'MTH10', question: 'यह घाव कितने समय से है?', questionEn: 'Since how long has this ulcer been there?' }, // idx 52
    { complaintCode: 'MTH10', question: 'घाव दर्द के बिना भी बढ़ रहा है?', questionEn: 'Is the ulcer growing even without pain?' }, // idx 53
    // JAW01 — TMJ pain
    { complaintCode: 'JAW01', question: 'दर्द कान या कनपटी के पास महसूस होता है?', questionEn: 'Is the pain felt near the ear or temple?' }, // idx 54
    { complaintCode: 'JAW01', question: 'चबाने या मुंह खोलने से दर्द बढ़ता है?', questionEn: 'Does chewing or opening the mouth worsen the pain?' }, // idx 55
    // JAW02 — Jaw clicking
    { complaintCode: 'JAW02', question: 'आवाज कब आती है — मुंह खोलते या बंद करते समय?', questionEn: 'When does the click occur — while opening or closing?' }, // idx 56
    { complaintCode: 'JAW02', question: 'जबड़ा कभी अटकता या लॉक हो जाता है?', questionEn: 'Does the jaw ever catch or lock?' }, // idx 57
    // JAW03 — Night grinding
    { complaintCode: 'JAW03', question: 'सुबह जबड़ा/दांत दुखते हैं या साथी ने रात में पीसने की शिकायत की?', questionEn: 'Morning jaw/tooth pain, or partner reports night grinding?' }, // idx 58
    { complaintCode: 'JAW03', question: 'तनाव ज्यादा रहता है या नींद में कोई समस्या है?', questionEn: 'High stress or any sleep problem?' }, // idx 59
    // JAW04 — Facial swelling
    { complaintCode: 'JAW04', question: 'सूजन कितनी तेजी से बढ़ी? बुखार भी है?', questionEn: 'How fast did the swelling grow? Fever too?' }, // idx 60
    { complaintCode: 'JAW04', question: 'निगलने या सांस लेने में दिक्कत हो रही है?', questionEn: 'Any difficulty swallowing or breathing?' }, // idx 61
    // JAW05 — Post-treatment swelling
    { complaintCode: 'JAW05', question: 'इलाज के कितने समय बाद सूजन आई?', questionEn: 'How long after the dental treatment did the swelling appear?' }, // idx 62
    { complaintCode: 'JAW05', question: 'खुजली या शरीर पर चकत्ते भी हैं?', questionEn: 'Any itching or rash on the body too?' }, // idx 63
    // JAW06 — Morning stiffness
    { complaintCode: 'JAW06', question: 'सुबह की अकड़न कितनी देर तक रहती है?', questionEn: 'How long does the morning stiffness last?' }, // idx 64
    { complaintCode: 'JAW06', question: 'दर्द दिनभर रहता है या सिर्फ सुबह के समय?', questionEn: 'Pain all day or only in the mornings?' }, // idx 65
    // DNT01 — Loose denture
    { complaintCode: 'DNT01', question: 'डेंचर कितने साल से लगा रहे हैं?', questionEn: 'Since how many years have you been using the denture?' }, // idx 66
    { complaintCode: 'DNT01', question: 'खाना चबाते समय डेंचर हिलती या गिरती है?', questionEn: 'Does the denture slip or fall while eating?' }, // idx 67
    // DNT02 — Denture sores
    { complaintCode: 'DNT02', question: 'डेंचर कहां चुभती है — किनारे पर या पूरे तालू पर लाली?', questionEn: 'Where does the denture rub — edges, or redness all over the palate?' }, // idx 68
    { complaintCode: 'DNT02', question: 'रात में डेंचर उतारकर पानी में रखते हैं?', questionEn: 'Do you remove the denture at night and keep it in water?' }, // idx 69
    // DNT03 — Broken denture
    { complaintCode: 'DNT03', question: 'डेंचर कैसे टूटी — गिरी थी या कुछ दबा था?', questionEn: 'How did the denture break — fell or something pressed it?' }, // idx 70
    { complaintCode: 'DNT03', question: 'टूटे हुए हिस्से से मुंह कटा तो है?', questionEn: 'Is the mouth cut by the broken piece?' }, // idx 71
    // DNT04 — New denture
    { complaintCode: 'DNT04', question: 'कौन से दांत नहीं हैं — ऊपर, नीचे या दोनों और कितने?', questionEn: 'Which teeth are missing — upper, lower or both, and how many?' }, // idx 72
    { complaintCode: 'DNT04', question: 'आखिरी दांत कब निकला या गिरा था?', questionEn: 'When was the last tooth removed or lost?' }, // idx 73
    // OTH01 — Scaling query
    { complaintCode: 'OTH01', question: 'क्या आपको लगता है कि स्केलिंग से दांत कमजोर हो जाते हैं?', questionEn: 'Do you believe scaling weakens the teeth?' }, // idx 74
    { complaintCode: 'OTH01', question: 'पिछली बार पेशेवर सफाई कब कराई थी?', questionEn: 'When did you last get a professional cleaning?' }, // idx 75
    // OTH02 — Whitening query
    { complaintCode: 'OTH02', question: 'दांतों का रंग जन्म से पीला है या बाद में पीला पड़ा?', questionEn: 'Are the teeth yellow since birth, or did they discolour later?' }, // idx 76
    { complaintCode: 'OTH02', question: 'दांतों में पहले से ठंडा-गर्म की चुभन है?', questionEn: 'Any existing hot/cold sensitivity in the teeth?' }, // idx 77
    // OTH03 — Braces query
    { complaintCode: 'OTH03', question: 'उम्र कितनी है — किसके दांत टेढ़े हैं?', questionEn: 'What is the age — whose teeth are crooked?' }, // idx 78
    { complaintCode: 'OTH03', question: 'टेढ़े दांतों से चबाने या बोलने में दिक्कत है?', questionEn: 'Difficulty chewing or speaking because of crooked teeth?' }, // idx 79
    // OTH04 — Implant query
    { complaintCode: 'OTH04', question: 'दांत कब निकला या गिरा था?', questionEn: 'When was the tooth removed or lost?' }, // idx 80
    { complaintCode: 'OTH04', question: 'शुगर या BP की दवा चल रही है?', questionEn: 'On any sugar (diabetes) or BP medicines?' }, // idx 81
    // OTH05 — Dental anxiety
    { complaintCode: 'OTH05', question: 'पहले किसी दांत के इलाज में कोई बुरा अनुभव रहा है?', questionEn: 'Any past bad experience with dental treatment?' }, // idx 82
    { complaintCode: 'OTH05', question: 'सुन्न करने वाले इंजेक्शन (एनेस्थीसिया) से डर लगता है?', questionEn: 'Are you afraid of the numbing injection (anaesthesia)?' }, // idx 83
    // OTH06 — Routine check-up
    { complaintCode: 'OTH06', question: 'पिछली डेंटल जांच कब हुई थी?', questionEn: 'When was your last dental check-up?' }, // idx 84
    { complaintCode: 'OTH06', question: 'दिन में कितनी बार और कैसे ब्रश करते हैं?', questionEn: 'How many times a day, and how, do you brush?' }, // idx 85
    // OTH07 — Tobacco cessation
    { complaintCode: 'OTH07', question: 'गुटखा/तंबाकू कितने समय से और दिन में कितनी बार इस्तेमाल करते हैं?', questionEn: 'Tobacco since when, and how many times a day?' }, // idx 86
    { complaintCode: 'OTH07', question: 'पहले कभी छोड़ने की कोशिश की है?', questionEn: 'Have you tried quitting before?' }, // idx 87
  ],

  // ══ Suggestions (176 — 2 per question; questionIndex matches idx above) ══
  // Practical Hindi advice PRINTED for patients: post-extraction socket care
  // (no rinsing 24 hrs, soft diet), no hard chewing post-RCT, gentle brushing
  // technique, tobacco cessation, and MANDATORY referral lines for tobacco
  // lesions (white/red patch, reduced mouth opening, non-healing ulcer).
  suggestions: [
    // q0 (TTH01 pain duration)
    { questionIndex: 0, text: '3 दिन से कम दर्द — दर्द की दवा शुरू करें; 2-3 दिन में न घटे तो दांत की जांच जरूरी है', textEn: 'Pain under 3 days — start an analgesic; if not settling in 2-3 days, dental exam needed' },
    { questionIndex: 0, text: 'हफ्तों से चला दर्द — कीड़ा जड़ की नस तक गया लगता है — RCT या फिलिंग की जांच कराएं', textEn: 'Pain for weeks — decay likely reaching the nerve — get evaluated for RCT or filling' },
    // q1 (TTH01 night pain)
    { questionIndex: 1, text: 'रात में बढ़ता दर्द — दांत की नस (पल्प) की सूजन की निशानी — टालें नहीं, जल्दी इलाज कराएं', textEn: 'Night-worsening pain — sign of nerve (pulp) inflammation — do not delay, treat early' },
    { questionIndex: 1, text: 'दिन-रात समान दर्द — जड़ या मसूड़े की समस्या हो सकती है — X-ray कराएं', textEn: 'Uniform day-night pain — could be root or gum problem — get an X-ray' },
    // q2 (TTH02 trigger)
    { questionIndex: 2, text: 'ठंडा या मीठा खाने पर चुभन — सतही कीड़ा या खुली जड़ — जांच कराकर फिलिंग कराएं', textEn: 'Triggered by cold or sweet — superficial decay or exposed root — get examined and filled' },
    { questionIndex: 2, text: 'गर्म चीज से ज्यादा दर्द — नस की सूजन की तरफ इशारा — RCT की जांच जरूरी', textEn: 'Worse with hot things — points towards pulp inflammation — RCT evaluation needed' },
    // q3 (TTH02 duration)
    { questionIndex: 3, text: '1-2 सेकंड की तेज चुभन — खुली जड़ — सेंसिटिविटी वाला टूथपेस्ट आजमाएं, ठीक न हो तो जांच', textEn: 'Sharp 1-2 second twinge — exposed root — trial of desensitizing paste, else evaluate' },
    { questionIndex: 3, text: 'देर तक रहने वाला दर्द — कीड़ा नस के पास पहुंच गया — RCT की जांच कराएं', textEn: 'Lingering ache — decay close to the nerve — get RCT evaluation done' },
    // q4 (TTH03 spot duration)
    { questionIndex: 4, text: 'नया छोटा दाग — सतही कीड़ा — फिलिंग से रुक सकता है, आज ही जांच कराएं', textEn: 'New small spot — superficial caries — a filling can halt it, get examined today' },
    { questionIndex: 4, text: 'महीनों पुराना बढ़ता दाग — गहरा कीड़ा — देर करने से नस पर असर होगा', textEn: 'Months-old growing spot — deep caries — delay will involve the nerve' },
    // q5 (TTH03 trapping/pain)
    { questionIndex: 5, text: 'खाना फंसना — दो दांतों के बीच छुपा कीड़ा — फिलिंग कराना जरूरी', textEn: 'Food trapping — hidden decay between teeth — filling required' },
    { questionIndex: 5, text: 'फंसने पर दर्द — कीड़ा गहरा है — जड़ की जांच कराएं', textEn: 'Pain when food traps — decay is deep — get the root evaluated' },
    // q6 (TTH04 how broke)
    { questionIndex: 6, text: 'चोट से टूटा दांत — तुरंत दिखाएं; टूटा हिस्सा दूध में रखकर लाएं', textEn: 'Tooth broken by injury — show immediately; bring the fragment in milk' },
    { questionIndex: 6, text: 'खाते-चबाते टूटा — कीड़े ने दांत कमजोर किया था — इलाज चुनने के लिए जांच कराएं', textEn: 'Broke while eating — decay had weakened it — evaluation to choose the restoration' },
    // q7 (TTH04 sensation)
    { questionIndex: 7, text: 'ठंडा-गर्म महसूस होता है — टूटा हिस्सा नस के पास है — जल्द जांच जरूरी', textEn: 'Hot/cold felt — the fracture is close to the nerve — early evaluation needed' },
    { questionIndex: 7, text: 'कोई महसूस नहीं होता — नस नष्ट हो चुकी हो सकती है — X-ray कराएं', textEn: 'No sensation at all — the nerve may be dead — get an X-ray' },
    // q8 (TTH05 which teeth)
    { questionIndex: 8, text: 'आपस में फंसना — दांतों के बीच की जगह — फिलिंग से बंद कराएं और रोज फ्लॉस करें', textEn: 'Trapping between teeth — interdental gap — get it filled and floss daily' },
    { questionIndex: 8, text: 'आखिरी दांतों पर फंसना — अक्ल दाढ़ के पास जमा खाना — सफाई + जांच कराएं', textEn: 'Trapping at the last teeth — food packing near the wisdom tooth — cleaning + evaluation' },
    // q9 (TTH05 smell)
    { questionIndex: 9, text: 'बदबू — सड़ता खाना या कीड़ा है — फ्लॉस करें और फिलिंग कराएं', textEn: 'Foul smell — decaying food or caries — floss daily and get the filling done' },
    { questionIndex: 9, text: 'फंसने पर दर्द — गहरा कीड़ा — जड़ की जांच जरूरी', textEn: 'Pain on trapping — deep decay — root evaluation needed' },
    // q10 (TTH06 pressure pain)
    { questionIndex: 10, text: 'एक दांत दबाने पर तेज दर्द — जड़ के नीचे सूजन या दरार — X-ray कराएं', textEn: 'Sharp pain on pressing one tooth — apical inflammation or crack — get an X-ray' },
    { questionIndex: 10, text: 'कई दांतों में दर्द — जकड़न/कुचलने की आदत भी हो सकती है — जबड़े की जांच कराएं', textEn: 'Several teeth aching — may be clenching habit — get a jaw evaluation' },
    // q11 (TTH06 sharp vs mild)
    { questionIndex: 11, text: 'अचानक तेज चुभन — दरार वाला दांत संभव — उस तरफ चबाना बंद रखें, जांच कराएं', textEn: 'Sudden sharp twinge — possible cracked tooth — avoid chewing on that side, get examined' },
    { questionIndex: 11, text: 'हल्का लगातार दर्द — मसूड़े या जड़ की सूजन — डॉक्टर से देखाएं', textEn: 'Mild constant ache — gum or root inflammation — see the dentist' },
    // q12 (TTH07 which loose)
    { questionIndex: 12, text: 'आगे का दांत हिलता है — मसूड़े की गंभीर बीमारी या चोट — जांच कराएं', textEn: 'Front tooth loose — advanced gum disease or injury — get evaluated' },
    { questionIndex: 12, text: 'पीछे का दांत हिलता है — गहरी पॉकेट या संक्रमण हो सकता है — तुरंत जांच जरूरी', textEn: 'Back tooth loose — deep pocket or infection possible — urgent evaluation' },
    // q13 (TTH07 bleeding)
    { questionIndex: 13, text: 'खून + हिलता दांत — पिरियडॉन्टाइटिस की निशानी — स्केलिंग और मसूड़े का इलाज जरूरी', textEn: 'Bleeding + loose tooth — periodontitis sign — scaling and gum treatment needed' },
    { questionIndex: 13, text: 'बिना खून के हिलना — चोट या जड़ की समस्या — X-ray जरूरी', textEn: 'Mobility without bleeding — injury or root problem — X-ray needed' },
    // q14 (TTH08 back gums)
    { questionIndex: 14, text: 'पीछे के मसूड़े सूजे — अक्ल दाढ़ वाली सूजन (पेरिकोरोनाइटिस) — लूकवार्म नमक-पानी के गरारे + जांच', textEn: 'Swollen back gums — wisdom tooth inflammation (pericoronitis) — lukewarm saline rinses + evaluation' },
    { questionIndex: 14, text: 'सूजन नहीं, बस दबाव का एहसास — दाढ़ उग रही है — दर्द/सूजन बढ़े तो मिलें', textEn: 'No swelling, only pressure feeling — tooth erupting — visit if pain or swelling rises' },
    // q15 (TTH08 opening)
    { questionIndex: 15, text: 'मुंह कम खुल रहा है — सूजन फैल रही है — जल्दी इलाज शुरू करें', textEn: 'Reduced mouth opening — infection is spreading — start treatment early' },
    { questionIndex: 15, text: 'खोलने में ठीक है — हल्का मामला — गरारे + दवा से देखें, बढ़े तो तुरंत मिलें', textEn: 'Opening fine — mild case — rinses + medicines first, visit promptly if it worsens' },
    // q16 (TTH09 days since extraction)
    { questionIndex: 16, text: '1-2 दिन का दर्द — सामान्य हो सकता है — दर्द की दवा लें, धीरे-धीरे ठीक होगा', textEn: 'Pain for 1-2 days — can be normal — take the analgesic, it should settle gradually' },
    { questionIndex: 16, text: '3 दिन बाद बढ़ता दर्द — सूखा सॉकेट की आशंका — डॉक्टर को दिखाएं', textEn: 'Pain worsening after day 3 — suspect dry socket — see the dentist' },
    // q17 (TTH09 smell)
    { questionIndex: 17, text: 'बदबू + तेज दर्द — सूखा सॉकेट — ड्रेसिंग के लिए उसी दिन मिलें', textEn: 'Foul smell + severe pain — dry socket — visit the same day for dressing' },
    { questionIndex: 17, text: 'हल्की गंध, दर्द नहीं — सामान्य उपचार — पहले 24 घंटे कुल्ला नहीं, फिर नमक-पानी के हल्के गरारे', textEn: 'Mild odour, no pain — normal healing — no rinsing for the first 24 hrs, then gentle saline rinses' },
    // q18 (TTH10 filling fell)
    { questionIndex: 18, text: 'बिना दर्द — खाली जगह में खाना जमकर कीड़ा बढ़ेगा — जल्दी दोबारा फिलिंग कराएं', textEn: 'No pain — food will pack into the open cavity — refill soon' },
    { questionIndex: 18, text: 'दर्द के साथ — कीड़ा गहरा चला गया — जड़ की जांच जरूरी', textEn: 'With pain — decay has gone deep — root evaluation needed' },
    // q19 (TTH10 trapping/sensitivity)
    { questionIndex: 19, text: 'खाना फंस रहा है — फिलिंग बंद कराएं ताकि कीड़ा न बढ़े', textEn: 'Food trapping — get the filling done so decay does not progress' },
    { questionIndex: 19, text: 'चुभन शुरू हो गई — दांत जड़/नस की ओर बढ़ रहा है — जांच कराएं', textEn: 'Sensitivity started — advancing towards root/nerve — get examined' },
    // q20 (TTH11 RCT status)
    { questionIndex: 20, text: 'इलाज चालू है — सिटिंग्स के बीच हल्का दर्द सामान्य — उस दांत से कड़क चीज न चबाएं, अगली सिटिंग टालें नहीं', textEn: 'Treatment ongoing — mild pain between sittings is normal — no hard chewing on that tooth, do not skip the next sitting' },
    { questionIndex: 20, text: 'RCT हफ्तों पहले पूरा हुआ — अब दर्द — जड़/क्राउन की दोबारा जांच जरूरी', textEn: 'RCT completed weeks ago — pain now — re-evaluation of root/crown needed' },
    // q21 (TTH11 chewing pain)
    { questionIndex: 21, text: 'चबाने पर दर्द — फिलिंग/क्राउन ऊंची बनी हो सकती है — छोटे पॉलिश से ठीक होगा', textEn: 'Pain on chewing — filling/crown may be high — a small polish adjustment will fix it' },
    { questionIndex: 21, text: 'लगातार दर्द — जड़ में संक्रमण की आशंका — X-ray कराएं', textEn: 'Constant pain — possible root infection — get an X-ray' },
    // q22 (GUM01 brush bleeding)
    { questionIndex: 22, text: 'ब्रश पर हल्का खून — मसूड़ों की सूजन — नरम ब्रश + हल्के वृत्ताकार तरीके से दिन में 2 बार ब्रश करें', textEn: 'Mild blood on brush — gingivitis — soft brush + gentle circular technique twice daily' },
    { questionIndex: 22, text: 'खून रोज़ आता है — स्केलिंग जरूरी — 6 महीने में एक बार सफाई कराएं', textEn: 'Bleeding daily — scaling needed — professional cleaning every 6 months' },
    // q23 (GUM01 spontaneous)
    { questionIndex: 23, text: 'बिना ब्रश किए खून — गहरी मसूड़े बीमारी या खून की कमी — जांच कराएं', textEn: 'Spontaneous bleeding — advanced gum disease or a blood disorder — get investigated' },
    { questionIndex: 23, text: 'सिर्फ ब्रश पर खून — आम मसूड़े की सूजन — ब्रशिंग सुधारें + माउथरिन्स कराएं', textEn: 'Bleeding only with brushing — common gingivitis — improve brushing + mouth rinse' },
    // q24 (GUM02 local vs general)
    { questionIndex: 24, text: 'एक जगह सूजन — उसी दांत की जड़ या खाना फंसने की समस्या — उस दांत की जांच', textEn: 'Localized swelling — root problem or food trap of that tooth — evaluate that tooth' },
    { questionIndex: 24, text: 'पूरे मुंह में — सामान्य मसूड़े रोग — पूरी स्केलिंग + माउथवॉश + ब्रशिंग सुधार', textEn: 'All over the mouth — generalised gum disease — full scaling + mouthwash + brushing correction' },
    // q25 (GUM02 fever)
    { questionIndex: 25, text: 'बुखार + सूजन — संक्रमण फैल रहा है — एंटीबायोटिक शुरू कर जल्दी दिखाएं', textEn: 'Fever + swelling — infection spreading — start antibiotic and visit early' },
    { questionIndex: 25, text: 'बुखार नहीं — सीमित सूजन — सफाई + गरारे से देखें, 3 दिन में न घटे तो मिलें', textEn: 'No fever — localized swelling — cleaning + rinses first, visit if not settling in 3 days' },
    // q26 (GUM03 pus)
    { questionIndex: 26, text: 'मवाद निकल रहा है — दांत की जड़ का फोड़ा — निकासी (drainage) + जड़ का इलाज जरूरी', textEn: 'Pus discharging — dental root abscess — drainage + root treatment needed' },
    { questionIndex: 26, text: 'सिर्फ दबाने पर दर्द — शुरुआती संक्रमण — एंटीबायोटिक + जांच कराएं', textEn: 'Pain on pressure only — early infection — antibiotic + evaluation' },
    // q27 (GUM03 duration)
    { questionIndex: 27, text: 'कई हफ्तों से पुराना दाना — पुराना फोड़ा जड़ से बना है — RCT या दांत निकालना पड़ सकता है', textEn: 'Boil for many weeks — chronic dental abscess — RCT or extraction may be needed' },
    { questionIndex: 27, text: '1-2 दिन का नया दाना — ताजा संक्रमण — दवा + निकासी के लिए तुरंत मिलें', textEn: 'Fresh boil of 1-2 days — acute infection — medicine + drainage, visit now' },
    // q28 (GUM04 morning vs day)
    { questionIndex: 28, text: 'सुबह की बदबू — रात भर जमा बैक्टीरिया — सुबह ब्रश + जीभ साफ करने से घटेगी', textEn: 'Morning odour — overnight bacteria — morning brushing + tongue cleaning reduces it' },
    { questionIndex: 28, text: 'दिनभर बदबू — गहरा कीड़ा या मसूड़े रोग — पूरी जांच कराएं', textEn: 'Odour all day — deep decay or gum disease — full dental evaluation' },
    // q29 (GUM04 tongue/digestion)
    { questionIndex: 29, text: 'जीभ साफ नहीं करते — जीभ की परत बदबू का बड़ा कारण है — रोज ब्रश के पीछे से जीभ भी साफ करें', textEn: 'Not cleaning the tongue — coated tongue is a major cause — clean the tongue daily with the brush' },
    { questionIndex: 29, text: 'पाचन की शिकायत भी है — गैस/एसिडिटी बदबू बढ़ाती है — भोजन और पानी की आदत सुधारें', textEn: 'Digestive complaints too — gas/acidity adds to odour — improve food and water habits' },
    // q30 (GUM05 recession)
    { questionIndex: 30, text: 'जड़ दिखने लगी है — मसूड़े पीछे हट रहे हैं — जड़ की सफाई + सेंसिटिविटी इलाज कराएं', textEn: 'Root becoming visible — gums receding — root cleaning + sensitivity care' },
    { questionIndex: 30, text: 'जोर से ब्रश करते हैं — रगड़ से मसूड़े हटते हैं — नरम ब्रश, हल्का हाथ', textEn: 'Brushing too hard — scrubbing causes recession — soft brush, light pressure' },
    // q31 (GUM05 sensitivity)
    { questionIndex: 31, text: 'जड़ की चुभन — सेंसिटिविटी वाला टूथपेस्ट लगाकर 2 मिनट रखें, फिर कुल्ला', textEn: 'Root sensitivity — apply desensitizing paste, wait 2 minutes, then rinse' },
    { questionIndex: 31, text: 'दर्द गहरा है — जड़ में कीड़ा हो सकता है — जांच कराएं', textEn: 'Deep pain — root caries possible — get examined' },
    // q32 (GUM06 deposit)
    { questionIndex: 32, text: 'सालों की परत — पत्थर (कैलकुलस) जम गया है — सिर्फ स्केलिंग हटाती है, ब्रश से नहीं', textEn: 'Years of deposit — calculus has formed — only scaling removes it, not brushing' },
    { questionIndex: 32, text: 'कुछ महीनों की परत — जल्दी स्केलिंग कराएं ताकि मसूड़े बीमार न हों', textEn: 'Deposit of a few months — scale soon so gums do not get diseased' },
    // q33 (GUM06 prior scaling)
    { questionIndex: 33, text: 'पहले कराई है — बुरा अनुभव डॉक्टर को बताएं; स्केलिंग से दांत कमजोर होना मिथक है', textEn: 'Had it before — tell the dentist about the bad experience; weakened-teeth belief is a myth' },
    { questionIndex: 33, text: 'पहली बार कराएंगे — सुरक्षित है — बाद की 2-3 दिन की हल्की संवेदनशीलता सामान्य है', textEn: 'First time — it is safe — mild sensitivity for 2-3 days afterwards is normal' },
    // q34 (MTH01 count/days)
    { questionIndex: 34, text: '1-2 छोटे छाले, 3-4 दिन के — अपने आप भर जाते हैं — जलन की जेल लगाएं', textEn: '1-2 small ulcers, 3-4 days — they self-heal — apply a soothing gel' },
    { questionIndex: 34, text: 'कई बड़े छाले या 10 दिन से ज्यादा — डॉक्टर से देखाएं', textEn: 'Multiple large ulcers or beyond 10 days — see the dentist' },
    // q35 (MTH01 burning)
    { questionIndex: 35, text: 'जलन बहुत तेज, खाना नहीं जा रहा — ठंडा नरम खाना + खाने से 20 मिनट पहले जेल लगाएं', textEn: 'Severe burning, unable to eat — cool soft food + gel 20 minutes before meals' },
    { questionIndex: 35, text: 'हल्की जलन — खट्टा, तीखा, कड़क चीज बंद — बाकी सामान्य खाना ठीक रहेगा', textEn: 'Mild burning — stop sour, spicy and hard items — normal food is otherwise fine' },
    // q36 (MTH02 frequency)
    { questionIndex: 36, text: 'महीने में 1-2 बार — तनाव या कमी से होते हैं — विटामिन कोर्स + नींद सुधारें', textEn: '1-2 times a month — usually stress or deficiency — vitamin course + better sleep' },
    { questionIndex: 36, text: 'हर हफ्ते लगातार — जांच (B12, folate, iron) कराएं', textEn: 'Recurring every week — investigate (B12, folate, iron)' },
    // q37 (MTH02 family/elsewhere)
    { questionIndex: 37, text: 'परिवार में भी होते हैं — आम बात है — जीवनशैली + विटामिन से कम होंगे', textEn: 'Occur in family too — common — lifestyle + vitamins reduce them' },
    { questionIndex: 37, text: 'शरीर की और जगह भी छाले — आंख/त्वचा के लक्षण देखें — विस्तृत जांच जरूरी', textEn: 'Ulcers elsewhere on the body too — watch eye/skin symptoms — detailed workup needed' },
    // q38 (MTH03 duration)
    { questionIndex: 38, text: 'हाल में शुरू — दवा या पानी की कमी हो सकती है — घूंट-घूंट पानी पिएं, चिकना खाना बचाएं', textEn: 'Recent onset — medicines or dehydration likely — sip water constantly, avoid very dry food' },
    { questionIndex: 38, text: 'महीनों से है — लार ग्रंथियों की जांच जरूरी — डॉक्टर से मिलें', textEn: 'Present for months — salivary gland evaluation needed — see the dentist' },
    // q39 (MTH03 meds/diabetes)
    { questionIndex: 39, text: 'दवा से सूखना — एंटीहिस्टामिन/BP वाली दवाएं करती हैं — दवा की पूरी लिस्ट डॉक्टर को दिखाएं', textEn: 'Medicine-induced dryness — antihistamine/BP drugs cause it — show the full medicine list to the doctor' },
    { questionIndex: 39, text: 'शुगर है — शुगर कंट्रोल + 6 महीने में डेंटल जांच — दोनों जरूरी', textEn: 'Diabetic — sugar control + dental check every 6 months — both essential' },
    // q40 (MTH04 site)
    { questionIndex: 40, text: 'जीभ की जलन — B12/folate की कमी आम कारण — खून की जांच कराएं', textEn: 'Burning of the tongue — B12/folate deficiency is common — get blood tested' },
    { questionIndex: 40, text: 'तालू/होंठ की जलन — टूथपेस्ट या मसाले से एलर्जी भी हो सकती है — ट्रिगर खोजें', textEn: 'Burning of palate/lips — toothpaste or spice allergy possible — find the trigger' },
    // q41 (MTH04 eating effect)
    { questionIndex: 41, text: 'खाने से राहत — जलन नस से जुड़ी हो सकती है — जांच कराएं', textEn: 'Eating relieves it — burning may be nerve-related — get evaluated' },
    { questionIndex: 41, text: 'खाने से बढ़ती — मुंह की श्लेष्मा की सूजन संभव — देखाएं', textEn: 'Eating worsens it — inflamed oral mucosa likely — get examined' },
    // q42 (MTH05 tobacco — MANDATORY REFERRAL)
    { questionIndex: 42, text: 'गुटखा/पान/तंबाकू के साथ धब्बा — मुंह के कैंसर की जांच के लिए विशेषज्ञ को दिखाना जरूरी है — देर न करें', textEn: 'Tobacco use with a patch — specialist screening for oral cancer is MANDATORY — do not delay' },
    { questionIndex: 42, text: 'आज से ही तंबाकू पूरी तरह बंद करें — धब्बा 2 हफ्ते में गायब न हो तो बायोप्सी की जरूरत हो सकती है', textEn: 'Stop tobacco completely from today — if the patch does not clear in 2 weeks, biopsy may be needed' },
    // q43 (MTH05 growth)
    { questionIndex: 43, text: '2 हफ्ते से ज्यादा बढ़ता धब्बा — तुरंत विशेषज्ञ को दिखाएं — देरी खतरनाक है', textEn: 'Growing patch beyond 2 weeks — see a specialist now — delay is dangerous' },
    { questionIndex: 43, text: 'छोटा स्थिर धब्बा — फिर भी जांच जरूरी — हर 2 हफ्ते में नाप/फोटो रखें', textEn: 'Small stable patch — still needs evaluation — measure/photograph every 2 weeks' },
    // q44 (MTH06 fingers)
    { questionIndex: 44, text: '2 से कम उंगलियां जाती हैं — मुंह की फाइब्रोसिस (OSMF) की निशानी — तुरंत विशेषज्ञ को भेजें और गुटखा पूरी तरह बंद करें', textEn: 'Fewer than 2 fingers fit — sign of oral submucous fibrosis — refer to specialist NOW and stop gutkha completely' },
    { questionIndex: 44, text: '2-3 उंगलियां जाती हैं — शुरुआती दौर है — तंबाकू बंद करने से आगे बढ़ना रुक सकता है', textEn: '2-3 fingers fit — early stage — quitting tobacco can stop progression' },
    // q45 (MTH06 years)
    { questionIndex: 45, text: '5+ साल का इस्तेमाल — कैंसर का खतरा बढ़ता है — छोड़ने की योजना आज ही बनाएं, काउंसलिंग लें', textEn: '5+ years of use — cancer risk rises — make a quit plan today, take counselling' },
    { questionIndex: 45, text: 'थोड़े समय से इस्तेमाल — अब छोड़ना आसान है — मुंह की जांच 6 महीने में एक बार कराएं', textEn: 'Recent use — quitting is easier now — mouth check every 6 months' },
    // q46 (MTH07 duration)
    { questionIndex: 46, text: 'हफ्तों से फटे कोने — फंगल संक्रमण या विटामिन कमी — जांच + मलहम से ठीक होगा', textEn: 'Cracked corners for weeks — fungal infection or vitamin deficiency — resolves with evaluation + ointment' },
    { questionIndex: 46, text: 'कुछ दिनों के — विटामिन B की कमी संभव — B-कॉम्प्लेक्स + एंटीफंगल क्रीम से देखें', textEn: 'Few days — vitamin B deficiency likely — trial of B-complex + antifungal cream' },
    // q47 (MTH07 burning)
    { questionIndex: 47, text: 'खट्टा-नमकीन खाने पर जलन — कोनों के छोटे घाव — एंटीफंगल क्रीम दिन में 2 बार लगाएं', textEn: 'Burning with sour/salty food — small fissures at corners — apply antifungal cream twice daily' },
    { questionIndex: 47, text: 'हल्की जलन — कोनों को चाटें नहीं, सूखा और साफ रखें', textEn: 'Mild burning — do not lick the corners, keep them dry and clean' },
    // q48 (MTH08 frequency)
    { questionIndex: 48, text: 'कभी-कभी कटता है — तेज या टेढ़े दांत — दाढ़ (occlusion) की जांच कराएं', textEn: 'Occasional biting — sharp or misaligned teeth — get an occlusal evaluation' },
    { questionIndex: 48, text: 'रोज काटता है — आदत बन चुकी है — दांत कुचलने की आदत भी जांचें', textEn: 'Bites daily — it has become habitual — also check for a clenching habit' },
    // q49 (MTH08 thickened)
    { questionIndex: 49, text: 'सफेद मोटी जगह — रगड़ से बनी केराटोसिस — तेज दांट/दांत ठीक कराना इलाज है', textEn: 'White thickened area — frictional keratosis — fixing the sharp tooth is the treatment' },
    { questionIndex: 49, text: 'रंग सामान्य है — हल्की चोटें — चबाने में धीरे रखें, गाल पर न सोएं', textEn: 'Normal colour — minor trauma — chew slowly, do not sleep on the cheek side' },
    // q50 (MTH09 wipe test)
    { questionIndex: 50, text: 'झाड़ने पर नीचे लाल — फंगल संक्रमण (थ्रश) — एंटीफंगल माउथ पेंट 7-10 दिन', textEn: 'Red beneath when wiped — fungal infection (thrush) — antifungal mouth paint for 7-10 days' },
    { questionIndex: 50, text: 'नहीं उतरती, बस जमा परत — जीभ की सफाई करें, धूम्रपान घटाएं', textEn: 'Does not wipe off, just coating — clean the tongue, reduce smoking' },
    // q51 (MTH09 antibiotic/inhaler)
    { questionIndex: 51, text: 'एंटीबायोटिक के बाद थ्रश होना आम है — प्रोबायोटिक + एंटीफंगल इलाज लें', textEn: 'Thrush after antibiotics is common — take probiotic + antifungal treatment' },
    { questionIndex: 51, text: 'इनहेलर चालू है — हर इस्तेमाल के बाद कुल्ला करें — परत घटेगी', textEn: 'On an inhaler — rinse after every use — the coating will reduce' },
    // q52 (MTH10 duration — RED FLAG)
    { questionIndex: 52, text: '2 हफ्ते से ज्यादा का घाव — मुंह के कैंसर की जांच जरूरी — विशेषज्ञ को तुरंत दिखाएं, देरी न करें', textEn: 'Ulcer beyond 2 weeks — oral cancer screening needed — see a specialist immediately, do not delay' },
    { questionIndex: 52, text: '2 हफ्ते से कम — निगरानी करें — पर घाव को 2 हफ्ते की सीमा पार करने ही न दें', textEn: 'Under 2 weeks — observe — but never let the ulcer cross the 2-week mark' },
    // q53 (MTH10 painless growth)
    { questionIndex: 53, text: 'दर्द रहित बढ़ता घाव — चेतावनी का लक्षण है — उसी हफ्ते में बायोप्सी/जांच जरूरी', textEn: 'Painless growing ulcer — a warning sign — biopsy/evaluation within the same week' },
    { questionIndex: 53, text: 'दर्द है — संक्रमण संभव — इलाज शुरू करें; 1 हफ्ते में न भरे तो जांच कराएं', textEn: 'Painful — infection possible — start treatment; if not healed in 1 week, investigate' },
    // q54 (JAW01 site)
    { questionIndex: 54, text: 'कान/कनपटी के पास दर्द — जबड़े के जोड़ (TMJ) की समस्या — नरम खाना + गर्म सेक करें', textEn: 'Pain near ear/temple — TMJ problem — soft diet + warm compress' },
    { questionIndex: 54, text: 'दांतों में भी दर्द — दांत की जड़ की समस्या — दांतों की जांच जरूरी', textEn: 'Teeth also ache — dental root problem — tooth evaluation needed' },
    // q55 (JAW01 function)
    { questionIndex: 55, text: 'चबाने से बढ़ता दर्द — मांसपेशी की थकान — चबाना दोनों तरफ बांटें, गम/चिकनी चीज न चबाएं', textEn: 'Worsens with chewing — muscle fatigue — chew on both sides, avoid gum/chewy items' },
    { questionIndex: 55, text: 'खोलने में भी अकड़न — जोड़ की जांच कराएं — नाइट गार्ड जरूरी हो सकता है', textEn: 'Stiff on opening too — get the joint evaluated — a night guard may be needed' },
    // q56 (JAW02 click timing)
    { questionIndex: 56, text: 'बंद करते समय आवाज — जोड़ के अंदर की समस्या — जांच कराएं', textEn: 'Click while closing — internal joint issue — get evaluated' },
    { questionIndex: 56, text: 'खोलते समय आवाज — डिस्क की हलचल — दर्द न हो तो निगरानी काफी है', textEn: 'Click while opening — disc movement — observation is enough if painless' },
    // q57 (JAW02 lock)
    { questionIndex: 57, text: 'जबड़ा लॉक हो जाता है — तुरंत जांच जरूरी — जबरदस्ती खोलने की कोशिश न करें', textEn: 'Jaw locks — urgent evaluation — do not try to force it open' },
    { questionIndex: 57, text: 'अटकता नहीं — हल्की समस्या — मांसपेशी आराम + नरम खाना', textEn: 'No catching — mild problem — muscle rest + soft diet' },
    // q58 (JAW03 morning signs)
    { questionIndex: 58, text: 'सुबह के लक्षण — रात में दांत पीसने (bruxism) की निशानी — नाइट गार्ड बनवाएं', textEn: 'Morning symptoms — sign of night grinding (bruxism) — get a night guard made' },
    { questionIndex: 58, text: 'दिन का दर्द — दिन में दांत कुचलने की आदत — दांत अलग-अलग रखें (जीभ ऊपर, दांत न छुएं)', textEn: 'Daytime pain — daytime clenching habit — keep teeth apart (tongue up, teeth not touching)' },
    // q59 (JAW03 stress)
    { questionIndex: 59, text: 'तनाव ज्यादा है — पीसना बढ़ जाता है — रिलैक्सेशन और नींद की देखभाल जरूरी', textEn: 'High stress — grinding increases — relaxation and sleep hygiene needed' },
    { questionIndex: 59, text: 'नींद ठीक है — अन्य कारण संभव — जांच कराएं', textEn: 'Sleep is fine — other causes possible — get evaluated' },
    // q60 (JAW04 speed + fever)
    { questionIndex: 60, text: 'तेजी से बढ़ती सूजन + बुखार — फैलता हुआ संक्रमण — आज ही इलाज शुरू करें, देर खतरनाक है', textEn: 'Rapidly growing swelling + fever — spreading infection — start treatment TODAY, delay is dangerous' },
    { questionIndex: 60, text: 'धीमी स्थिर सूजन — पुराना संक्रमण — जांच कराकर नियोजित इलाज कराएं', textEn: 'Slow stable swelling — chronic infection — evaluation and planned treatment' },
    // q61 (JAW04 swallow/breath — EMERGENCY)
    { questionIndex: 61, text: 'निगलने या सांस लेने में दिक्कत — इमरजेंसी है — तुरंत अस्पताल जाएं, यह गंभीर संक्रमण है', textEn: 'Difficulty swallowing or breathing — EMERGENCY — go to hospital immediately, this is a serious infection' },
    { questionIndex: 61, text: 'नहीं है — फिर भी इलाज नजदीकी दिनों में जरूरी — बुखार का रिकॉर्ड रखें', textEn: 'Not present — still needs treatment within days — keep a fever record' },
    // q62 (JAW05 timing after treatment)
    { questionIndex: 62, text: 'इलाज के कुछ घंटों में सूजन — सामान्य इलाज-प्रतिक्रिया या एलर्जी — नजर रखें, बढ़े तो बताएं', textEn: 'Swelling within hours of treatment — normal post-treatment reaction or allergy — observe, report if growing' },
    { questionIndex: 62, text: '1-2 दिन बाद बढ़ती सूजन — संक्रमण की निशानी — दोबारा मिलें', textEn: 'Swelling growing after 1-2 days — sign of infection — revisit' },
    // q63 (JAW05 allergy signs)
    { questionIndex: 63, text: 'खुजली/चकत्ते — दवा से एलर्जी की निशानी — दवा का नाम डॉक्टर को बताएं, एंटीहिस्टामिन लें', textEn: 'Itch/rash — signs of drug allergy — tell the doctor the drug name, take an antihistamine' },
    { questionIndex: 63, text: 'बिना खुजली — स्थानीय दबाव/मुलायम ऊतक की सूजन — ठंडी सिकाई 10 मिनट, दिन में 3 बार', textEn: 'No itch — local pressure/soft-tissue swelling — cold compress 10 minutes, 3 times a day' },
    // q64 (JAW06 stiffness duration)
    { questionIndex: 64, text: '1 घंटे से ज्यादा सुबह अकड़न — जोड़ की सूजन — जांच कराएं', textEn: 'Morning stiffness over 1 hour — joint inflammation — get evaluated' },
    { questionIndex: 64, text: 'कुछ मिनट की अकड़न — मांसपेशी की जकड़न — गर्म सेक + जबड़े के हल्के व्यायाम', textEn: 'A few minutes of stiffness — muscle tightness — warm compress + gentle jaw exercises' },
    // q65 (JAW06 pattern)
    { questionIndex: 65, text: 'दिनभर दर्द — पुरानी TMJ समस्या — विस्तृत इलाज योजना जरूरी', textEn: 'All-day pain — chronic TMJ problem — a detailed treatment plan is needed' },
    { questionIndex: 65, text: 'सिर्फ सुबह — रात की पीसने की आदत से — नाइट गार्ड से सुधार आएगा', textEn: 'Mornings only — from night grinding habit — a night guard will help' },
    // q66 (DNT01 denture age)
    { questionIndex: 66, text: '5+ साल पुरानी डेंचर — नीचे का जबड़ा घस जाता है — री-बेस या नई डेंचर की जांच कराएं', textEn: 'Denture 5+ years old — the jaw bone under it resorbs — get rebase or new denture evaluated' },
    { questionIndex: 66, text: 'नई डेंचर है — एडजस्टमेंट चाहिए — छोटी ट्रिम से फिट हो जाएगी', textEn: 'Denture is new — needs adjustment — a small trim will refit it' },
    // q67 (DNT01 slips)
    { questionIndex: 67, text: 'खाने में हिलती/गिरती है — पकड़ ढीली हो गई है — एडजस्टमेंट या एडहेसिव के विकल्प पूछें', textEn: 'Slips/falls while eating — the fit is loose — ask about adjustment or adhesive options' },
    { questionIndex: 67, text: 'बोलते समय हिलती है — एडजस्टमेंट जरूरी — डॉक्टर को दिखाएं', textEn: 'Slips while speaking — adjustment needed — show the dentist' },
    // q68 (DNT02 sore site)
    { questionIndex: 68, text: 'किनारे जहां चुभता है — उसी जगह की ट्रिम जरूरी — दिखाकर ठीक कराएं', textEn: 'Where the edge rubs — that spot needs trimming — show it and get it corrected' },
    { questionIndex: 68, text: 'पूरे तालू पर लाली — फंगल (डेंचर स्टोमेटाइटिस) — रात में उतारना + एंटीफंगल इलाज अनिवार्य', textEn: 'Redness all over the palate — fungal (denture stomatitis) — night removal + antifungal treatment is mandatory' },
    // q69 (DNT02 night removal)
    { questionIndex: 69, text: 'रात भर पहनकर सोते हैं — यही फंगल संक्रमण का सबसे बड़ा कारण है — रात में उतारकर पानी में रखें', textEn: 'Sleeping with the denture on — the biggest cause of fungal infection — remove at night and keep in water' },
    { questionIndex: 69, text: 'रात में उतारते हैं — अच्छी आदत है — डेंचर की रोज सफाई जारी रखें', textEn: 'Removing at night — good habit — continue cleaning the denture daily' },
    // q70 (DNT03 how broke)
    { questionIndex: 70, text: 'गिरने/दबाने से टूटी — मरम्मत संभव है — टुकड़े साथ लाएं', textEn: 'Broke from a fall/pressure — repair is possible — bring the pieces along' },
    { questionIndex: 70, text: 'पुरानी टूट है — मरम्मत-नई डेंचर का फैसला जांच में होगा', textEn: 'Old break — repair versus new denture will be decided at evaluation' },
    // q71 (DNT03 cut)
    { questionIndex: 71, text: 'टूटे हिस्से से मुंह कटा है — मरम्मत तक डेंचर न पहनें, छाले पर जेल लगाएं', textEn: 'Mouth cut by the broken piece — do not wear the denture till repaired, apply gel on the ulcer' },
    { questionIndex: 71, text: 'चोट नहीं है — तुरंत मरम्मत कराएं ताकि और न टूटे', textEn: 'No injury — repair it immediately before it breaks further' },
    // q72 (DNT04 which missing)
    { questionIndex: 72, text: 'एक ही दांत गायब — इम्प्लांट या ब्रिज दोनों विकल्प हैं — जांच में विकल्प पूछें', textEn: 'Single tooth missing — implant or bridge, both options — ask at the evaluation' },
    { questionIndex: 72, text: 'कई/सारे दांत गायब — पूरी डेंचर या इम्प्लांट-सपोर्टेड डेंचर — योजना बनवाएं', textEn: 'Many/all teeth missing — full denture or implant-supported denture — get a plan made' },
    // q73 (DNT04 last extraction)
    { questionIndex: 73, text: 'हाल में निकला है — मसूड़े को 2-3 महीने ठीक होने दें — फिर नई डेंचर/इम्प्लांट बनवाएं', textEn: 'Extracted recently — let the ridge heal 2-3 months — then get the new denture/implant' },
    { questionIndex: 73, text: 'सालों पहले निकला था — हड्डी घस चुकी होगी — इम्प्लांट से पहले हड्डी की जांच जरूरी', textEn: 'Extracted years ago — bone would have resorbed — bone evaluation needed before an implant' },
    // q74 (OTH01 myth)
    { questionIndex: 74, text: 'स्केलिंग से दांत कमजोर होना एक मिथक है — सफाई से दांत और मसूड़े लंबे समय तक स्वस्थ रहते हैं', textEn: 'Scaling weakens teeth is a myth — cleaning keeps teeth and gums healthy for longer' },
    { questionIndex: 74, text: 'सफाई के बाद ढीलापन महसूस होता है — यह उसकी असली स्थिति है, 2-3 दिन में ठीक लगेगा', textEn: 'Looseness felt after cleaning — that is the true state of the teeth, feels fine in 2-3 days' },
    // q75 (OTH01 last cleaning)
    { questionIndex: 75, text: '1 साल से ज्यादा हुए — पत्थर जमने की आशंका है — स्केलिंग कराएं', textEn: 'Over a year overdue — calculus is likely — get scaling done' },
    { questionIndex: 75, text: 'हाल में हुई — अच्छा है — 6-8 महीने के अंतर पर जारी रखें', textEn: 'Done recently — good — continue at 6-8 month intervals' },
    // q76 (OTH02 birth vs acquired)
    { questionIndex: 76, text: 'जन्म से पीले — प्राकृतिक रंग है — ब्लीचिंग से 1-2 शेड सुधार संभव है, अधिक नहीं', textEn: 'Yellow since birth — natural shade — bleaching can lift 1-2 shades, not more' },
    { questionIndex: 76, text: 'बाद में पीले पड़े — दाग या पत्थर है — पहले स्केलिंग, फिर ब्लीचिंग बेहतर रहेगी', textEn: 'Discoloured later — stains or calculus — scaling first, then bleaching works better' },
    // q77 (OTH02 sensitivity)
    { questionIndex: 77, text: 'पहले से चुभन है — ब्लीचिंग से बढ़ सकती है — पहले सेंसिटिविटी का इलाज कराएं', textEn: 'Existing sensitivity — bleaching can worsen it — treat the sensitivity first' },
    { questionIndex: 77, text: 'कोई चुभन नहीं — ब्लीचिंग के बाद 2-3 दिन की हल्की चुभन आम है', textEn: 'No sensitivity — mild post-bleach twinge for 2-3 days is common' },
    // q78 (OTH03 age)
    { questionIndex: 78, text: 'बच्चे के दांत टेढ़े हैं — बढ़ती उम्र (7-14 साल) में ऑर्थो जांच का सही समय होता है', textEn: 'Child has crooked teeth — growing age (7-14 yrs) is the right window for ortho evaluation' },
    { questionIndex: 78, text: 'बड़ों के दांत टेढ़े हैं — उम्र रोक नहीं है — ब्रेसेस/एलाइनर के विकल्प ऑर्थोडॉन्टिस्ट से पूछें', textEn: 'Adult crooked teeth — age is no barrier — ask an orthodontist about braces/aligners' },
    // q79 (OTH03 function)
    { questionIndex: 79, text: 'चबाने/बोलने में दिक्कत — इलाज सिर्फ दिखावट का नहीं, जरूरी है — ऑर्थोडॉन्टिस्ट को दिखाएं', textEn: 'Chewing/speech difficulty — treatment is functional, not cosmetic — see an orthodontist' },
    { questionIndex: 79, text: 'सिर्फ दिखावट की चिंता — विकल्प, समय और खर्च ऑर्थोडॉन्टिस्ट तय करेगा — जांच कराएं', textEn: 'Appearance concern only — options, timing and cost decided by the orthodontist — get evaluated' },
    // q80 (OTH04 when lost)
    { questionIndex: 80, text: '3+ महीने हुए — इम्प्लांट के लिए उपयुक्त समय है — जांच कराएं', textEn: '3+ months since loss — good timing for an implant — get evaluated' },
    { questionIndex: 80, text: 'हाल में गया है — खाली जगह पास के दांत खिसकने लगते हैं — 2-3 महीने बाद इम्प्लांट कराएं', textEn: 'Lost recently — adjacent teeth start drifting into the gap — implant after 2-3 months' },
    // q81 (OTH04 sugar/BP)
    { questionIndex: 81, text: 'शुगर कंट्रोल में नहीं है — इम्प्लांट टालें — पहले शुगर ठीक करें', textEn: 'Sugar not controlled — defer the implant — control sugar first' },
    { questionIndex: 81, text: 'BP/शुगर नियंत्रित हैं — इम्प्लांट संभव है — दवाओं की लिस्ट डॉक्टर को दिखाएं', textEn: 'BP/sugar controlled — implant is possible — show the medicine list to the dentist' },
    // q82 (OTH05 past experience)
    { questionIndex: 82, text: 'बुरा अनुभव रहा है — डर स्वाभाविक है — इलाज का हर कदम शुरू करने से पहले बताया जाएगा', textEn: 'Past bad experience — the fear is natural — every step will be explained before starting' },
    { questionIndex: 82, text: 'नई तकनीकों से दर्द लगभग खत्म हो चुका है — सुन्न करने से पहले जेल लगती है', textEn: 'New techniques have nearly removed pain — a numbing gel is applied first' },
    // q83 (OTH05 needle fear)
    { questionIndex: 83, text: 'इंजेक्शन का डर — पहले सुन्न करने वाली जेल, फिर बहुत पतली सुई — दर्द न के बराबर', textEn: 'Needle fear — numbing gel first, then a very fine needle — pain is negligible' },
    { questionIndex: 83, text: 'सुन्न होने का एहसास अजीब लगता है — यह सामान्य है — 1-2 घंटे में जाता रहेगा', textEn: 'The numb feeling seems odd — it is normal — wears off in 1-2 hours' },
    // q84 (OTH06 last checkup)
    { questionIndex: 84, text: '1 साल से ज्यादा हुए — आज पूरी जांच कराएं — शुरुआती कीड़ा पकड़ना आसान है', textEn: 'Over a year overdue — full checkup today — early decay is easy to catch' },
    { questionIndex: 84, text: 'हाल में हुई — अच्छा है — 6 महीने का अंतर बनाए रखें', textEn: 'Done recently — good — maintain a 6-month interval' },
    // q85 (OTH06 brushing)
    { questionIndex: 85, text: 'दिन में एक बार — रात सोने से पहले ब्रश जरूरी है — रात के बैक्टीरिया सबसे ज्यादा नुकसान करते हैं', textEn: 'Once a day — night brushing before sleep is essential — overnight bacteria do the most damage' },
    { questionIndex: 85, text: 'जोर से क्षैतिज ब्रश — मसूड़े हटते हैं — 45 डिग्री कोण पर छोटे वृत्त बनाकर 2 मिनट ब्रश करें', textEn: 'Hard horizontal scrub — gums recede — small circles at a 45-degree angle for 2 minutes' },
    // q86 (OTH07 amount)
    { questionIndex: 86, text: 'दिन में 5+ बार — अकेले छोड़ना कठिन है — निकोटीन रिप्लेसमेंट और काउंसलिंग के बारे में पूछें', textEn: '5+ times daily — quitting solo is hard — ask about nicotine replacement and counselling' },
    { questionIndex: 86, text: 'कम बार — अचानक पूरी तरह छोड़ना बेहतर काम करता है — एक तारीख तय करें', textEn: 'Fewer times daily — quitting completely at once works better — fix a quit date' },
    // q87 (OTH07 prior attempts)
    { questionIndex: 87, text: 'पहले नाकाम रहे — तरीका या अकेलेपन की वजह से — इस बार डॉक्टर की मदद और दवाएं उपलब्ध हैं', textEn: 'Failed earlier — wrong method or going solo — doctor help and medicines exist this time' },
    { questionIndex: 87, text: 'पहले कोशिश नहीं की — वापसी (relapse) सामान्य है — हर कोशिश आगे बढ़ाती है — आज शुरू करें', textEn: 'Never tried before — relapse is normal — every attempt moves you forward — start today' },
  ],

  // ══ Labels — vitals + dental-specific measures (8) ════════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
    { label: 'दर्द स्कोर', labelEn: 'Pain Score (NRS)', unit: '0-10' },
    { label: 'मुंह खुलने की माप', labelEn: 'Mouth Opening (Interincisal)', unit: 'mm' },
  ],

  // ══ Findings (26) — ICD-10 where known ═══════════════════════════════
  // Refer-only findings (ZERO medicine links by policy): OSMF,
  // LEUKOPLAKIA-SCREEN, NON-HEALING-ULCER, ORTHO-EVAL, XEROSTOMIA,
  // BRUXISM, CHEEK-BITING, CARIES-SUPERFICIAL (restoration is chairside).
  findings: [
    { key: 'CARIES-SUPERFICIAL', name: 'सतही दांत का कीड़ा', nameEn: 'Superficial Dental Caries', icd10: 'K02.0' },
    { key: 'CARIES-DEEP', name: 'गहरा दांत का कीड़ा (नस के पास)', nameEn: 'Deep Dental Caries', icd10: 'K02.1' },
    { key: 'PULPITIS-ACUTE', name: 'तीव्र रसदंत शोथ (दांत की नस की सूजन)', nameEn: 'Acute Pulpitis', icd10: 'K04.0' },
    { key: 'APICAL-PERIODONTITIS', name: 'दांत की जड़ के नीचे सूजन', nameEn: 'Acute Apical Periodontitis', icd10: 'K04.4' },
    { key: 'DENTO-ABSCESS', name: 'दांत का फोड़ा (मवाद)', nameEn: 'Dentoalveolar Abscess', icd10: 'K04.7' },
    { key: 'PERICORONITIS', name: 'अक्ल दाढ़ के मसूड़े की सूजन (पेरिकोरोनाइटिस)', nameEn: 'Pericoronitis (Wisdom Tooth)', icd10: 'K05.6' },
    { key: 'GINGIVITIS-CHRONIC', name: 'पुरानी मसूड़े की सूजन (गिंजिवाइटिस)', nameEn: 'Chronic Gingivitis', icd10: 'K05.1' },
    { key: 'PERIODONTITIS-CHRONIC', name: 'पुरानी पिरियडॉन्टाइटिस (गहरी मसूड़े बीमारी)', nameEn: 'Chronic Periodontitis', icd10: 'K05.3' },
    { key: 'DENTAL-CALCULUS', name: 'दांतों पर पत्थर (कैलकुलस)', nameEn: 'Dental Calculus / Deposits', icd10: 'K03.6' },
    { key: 'DENTINE-SENS', name: 'दांत की जड़ का चुभन (संवेदनशीलता)', nameEn: 'Dentine Hypersensitivity', icd10: 'K03.7' },
    { key: 'FRACTURED-TOOTH', name: 'टूटा हुआ दांत', nameEn: 'Fractured Tooth', icd10: 'S02.5' },
    { key: 'POST-EXTRACT-SOCKET', name: 'दांत निकलने का सामान्य घाव (उपचाररत)', nameEn: 'Post-extraction Socket (Healing)' },
    { key: 'DRY-SOCKET-SUSPECT', name: 'सूखा सॉकेट (शक — उसी दिन दिखाएं)', nameEn: 'Suspected Dry Socket (Alveolar Osteitis)', icd10: 'K10.3' },
    { key: 'RAS', name: 'बार-बार होने वाले मुंह के छाले', nameEn: 'Recurrent Aphthous Stomatitis', icd10: 'K12.0' },
    { key: 'ORAL-CANDIDIASIS', name: 'मुंह का फंगल संक्रमण (थ्रश)', nameEn: 'Oral Candidiasis (Thrush)', icd10: 'B37.0' },
    { key: 'ANGULAR-CHEILITIS', name: 'होंठ के कोनों का संक्रमण (फटे कोने)', nameEn: 'Angular Cheilitis', icd10: 'K13.0' },
    { key: 'DENTURE-STOMATITIS', name: 'डेंचर वाले तालू की सूजन (फंगल)', nameEn: 'Denture Stomatitis', icd10: 'K12.1' },
    { key: 'XEROSTOMIA', name: 'मुंह का सूखना', nameEn: 'Xerostomia (Dry Mouth)', icd10: 'K11.7' },
    { key: 'BURNING-MOUTH', name: 'जलता मुंह सिंड्रोम', nameEn: 'Burning Mouth Syndrome', icd10: 'K14.6' },
    { key: 'TMJ-MYO', name: 'जबड़े के जोड़ की मांसपेशी दर्द (TMJ)', nameEn: 'TMJ Myofascial Pain Dysfunction', icd10: 'M26.60' },
    { key: 'BRUXISM', name: 'दांत पीसने की आदत (ब्रुक्सिज़्म)', nameEn: 'Bruxism (Teeth Grinding)', icd10: 'F45.8' },
    { key: 'OSMF', name: 'मुंह की श्लेष्मा फाइब्रोसिस (गुटखा जनित — विशेषज्ञ को दिखाएं)', nameEn: 'Oral Submucous Fibrosis (Refer)', icd10: 'K13.5' },
    { key: 'LEUKOPLAKIA-SCREEN', name: 'मुंह में सफेद/लाल धब्बा (कैंसर जांच जरूरी)', nameEn: 'Oral White/Red Patch — Leukoplakia Screen (Refer)', icd10: 'K13.2' },
    { key: 'NON-HEALING-ULCER', name: 'न भरने वाला घाव (कैंसर जांच जरूरी)', nameEn: 'Non-healing Oral Ulcer — Cancer Screen (Refer)' },
    { key: 'CHEEK-BITING', name: 'गाल/होंठ काटने की पुरानी आदत', nameEn: 'Chronic Cheek/Lip Biting', icd10: 'K13.1' },
    { key: 'ORTHO-EVAL', name: 'टेढ़े दांत — ऑर्थोडॉन्टिक जांच (रेफर)', nameEn: 'Orthodontic Evaluation (Refer)' },
  ],

  // ══ Medicines (55) — India dental OPD core ════════════════════════════
  // Dental courses are SHORT: 3-5 days typical, 7 max (reflected in `tab`).
  // morning/afternoon/evening = default units at that slot; tab = dispense qty.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // Antibiotics — short dental courses (3-5 days; 7 max)
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — dental infection standard; SHORT course 3-5 days', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Augmentin 375 Tablet', salt: 'Amoxicillin 250 mg + Clavulanic Acid 125 mg — milder infections / step-down', doseOptions: ['1 tab twice daily', '1 tab thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Moxikind-CV 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — amoxy-clav alternate brand; short course', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mox 250 Capsule', salt: 'Amoxicillin 250 mg — simple dental infection; pair with Metrogyl for anaerobic cover', doseOptions: ['1 cap thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mox 500 Capsule', salt: 'Amoxicillin 500 mg — moderate dental infection', doseOptions: ['1 cap thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mox 125 Syrup', salt: 'Amoxicillin 125 mg/5 ml — pediatric dental infection (weight-based)', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Clavam 228.5 Suspension', salt: 'Amoxicillin 200 mg + Clavulanic Acid 28.5 mg per 5 ml — pediatric dental infection', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Metrogyl 400 Tablet', salt: 'Metronidazole 400 mg — ANAEROBIC co-cover with amoxicillin in dental infections; strictly no alcohol; 3-5 day dental course', doseOptions: ['1 tab thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 12, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg — penicillin-allergy alternative; once daily × 3 days', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 200 Suspension', salt: 'Azithromycin 200 mg/5 ml — pediatric (weight-based)', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg — dental infection alternative in penicillin allergy', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zifi 200 Tablet', salt: 'Cefixime 200 mg — alternate cefixime brand', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cepodem 100 Tablet', salt: 'Cefpodoxime Proxetil 100 mg — oral cephalosporin alternative', doseOptions: ['1 tab (100 mg) twice daily', '2 tabs (200 mg) twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Roxid 150 Tablet', salt: 'Roxithromycin 150 mg — macrolide alternative for penicillin allergy', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxt SL Tablet', salt: 'Doxycycline 100 mg + Lactic Acid Bacillus — periodontal therapy adjunct; NOT in pregnancy or children under 12', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dalacin C 300 Capsule', salt: 'Clindamycin 300 mg — serious dental infection / penicillin allergy; STOP if significant diarrhoea (colitis risk)', doseOptions: ['1 cap thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 12, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Analgesics / anti-inflammatory / muscle relaxant / anti-edema
    { name: 'Zerodol-P Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg — dental pain standard; after food', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol SP Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg — post-extraction pain and swelling', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol TH4 Tablet', salt: 'Aceclofenac 100 mg + Thiocolchicoside 4 mg — TMJ pain with spasm; short course', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ketorol-DT 10 Tablet', salt: 'Ketorolac Tromethamine 10 mg dispersible — SHORT COURSE ONLY: max 3-5 days; GI risk — always with food; avoid with other NSAIDs, ulcer/asthma/kidney disease', doseOptions: ['1 tab twice daily', '1 tab thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nucoxia 90 Tablet', salt: 'Etoricoxib 90 mg — moderate-severe dental pain; take with food', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Myospaz Forte Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg + Chlorzoxazone 250 mg — TMJ/muscle spasm; drowsiness possible', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Myoril 4mg Tablet', salt: 'Thiocolchicoside 4 mg — jaw muscle relaxant; SHORT course 3-5 days + soft diet advice; drowsiness possible', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin-Chymotrypsin 100,000 AU — reduces post-extraction swelling; empty stomach (30 min before food)', doseOptions: ['1 tab thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — pregnancy-safe dental analgesic', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml — pediatric dental pain/fever (weight-based)', doseOptions: ['5 ml (250 mg)', '7.5 ml', '10 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Ibugesic Plus Syrup 100ml', salt: 'Ibuprofen 100 mg + Paracetamol 125 mg per 5 ml — pediatric dental pain (weight-based)', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel — EXTERNAL use only (jaw/TMJ), never inside the mouth', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Volini Gel 30g', salt: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol topical pain gel — EXTERNAL use on jaw only, never in mouth', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Mouth rinses
    { name: 'Hexidine 0.2% Mouth Rinse 160ml', salt: 'Chlorhexidine Gluconate 0.2% w/v — MAX 2 WEEKS (staining + taste alteration); 30-second rinse, no eating/drinking 30 min after', doseOptions: ['15 ml undiluted rinse'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Gargle 100ml', salt: 'Povidone-Iodine 2% gargle — dilute as directed; temporary in dental infection adjunct', doseOptions: ['10 ml in half glass warm water'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tantum Oral Rinse 120ml', salt: 'Benzydamine Hydrochloride 0.15% oral rinse — painful ulcers/mucositis; do not swallow', doseOptions: ['15 ml rinse'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Topicals — the dental pharmacology world
    { name: 'Metrogyl DG Gel 20g', salt: 'Metronidazole 1% w/w + Chlorhexidine 0.25% w/w dental gel — apply into gum pockets; do not swallow', doseOptions: ['Apply thin layer on gums twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Hexigel 15g', salt: 'Chlorhexidine Gluconate 1% w/w gel — gum/mucosal application', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orasore Dental Gel 15g', salt: 'Lignocaine Hydrochloride 2% w/w gel — topical numbing for ulcers; apply before meals', doseOptions: ['Apply thin layer 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dologel CT Gel 15g', salt: 'Choline Salicylate 10% w/w + Lignocaine 2% w/w — CAUTION: avoid in aspirin-sensitive patients; NOT for young children', doseOptions: ['Apply thin layer 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Mucopain Gel 15g', salt: 'Benzocaine 20% w/w gel — topical numbing; NOT for children under 2 years; apply thin layer only', doseOptions: ['Apply thin layer before meals'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Kenacort 0.1% Paste 5g', salt: 'Triamcinolone Acetonide 0.1% w/w dental paste — steroid; apply thin film on ulcer; do not swallow; short use only', doseOptions: ['Apply thin film twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lexanox 5% Paste 5g', salt: 'Amlexanox 5% w/w oral paste — aphthous ulcer healing; apply on dried ulcer', doseOptions: ['Apply thin layer 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Thermoseal Toothpaste 100g', salt: 'Potassium Nitrate 5% + Sodium Fluoride desensitizing toothpaste — brush 2 minutes; wait before rinsing', doseOptions: ['Brush twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Mouth Paint 15ml', salt: 'Clotrimazole 1% oral paint — oral thrush/denture stomatitis; paint after wiping lesions', doseOptions: ['Paint lesions 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Cream 15g', salt: 'Clotrimazole 1% w/w cream — angular cheilitis (lip corners)', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'T-Bact 2% Ointment 5g', salt: 'Mupirocin 2% w/w ointment — infected angular cheilitis / lip cracks', doseOptions: ['Apply thin layer 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Systemic antifungal
    { name: 'Forcan 150 Tablet', salt: 'Fluconazole 150 mg — single dose for refractory oral thrush only after topical fails; avoid in pregnancy', doseOptions: ['1 tab single dose'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Vitamins / supplements (the Indian dental classics)
    { name: 'Becosules Capsule', salt: 'B-Complex with Vitamin C — the Indian dental classic for ulcers and gum support', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral with Zinc — recurrent aphthous ulcer support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Limcee 500 Tablet', salt: 'Vitamin C 500 mg (Chewable) — gum health support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Folvite 5mg Tablet', salt: 'Folic Acid 5 mg — recurrent oral ulcer support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 — glossitis/burning tongue support', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Vizylac Capsule', salt: 'Lactic Acid Bacillus + Vitamins — probiotic cover with antibiotic courses', doseOptions: ['1 cap twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // GI cover / nausea / allergy (NSAID companions)
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — gastric cover during NSAID courses', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone) — SOS heartburn with analgesics', doseOptions: ['10 ml SOS'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg mouth-dissolving — post-operative nausea', doseOptions: ['1 tab SOS'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg — dental drug-reaction allergy (swelling/rash); at bedtime', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (36) ════════════════════════════════════
  // Refer-only findings (OSMF, LEUKOPLAKIA-SCREEN, NON-HEALING-ULCER,
  // ORTHO-EVAL, XEROSTOMIA, BRUXISM, CHEEK-BITING, CARIES-SUPERFICIAL)
  // deliberately carry ZERO medicine links.
  findingMeds: [
    // CARIES-DEEP
    { findingKey: 'CARIES-DEEP', medicineName: 'Zerodol-P Tablet', dose: '1 tab BD after food', tab: 10, description: 'Pain only; SHORT course 3-5 days; restoration is the definitive treatment' },
    // PULPITIS-ACUTE
    { findingKey: 'PULPITIS-ACUTE', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3 days — bridge pain control until RCT' },
    { findingKey: 'PULPITIS-ACUTE', medicineName: 'Ketorol-DT 10 Tablet', description: '1 tab BD max 3-5 days, severe pain only, with food — RCT is the cure' },
    // APICAL-PERIODONTITIS
    { findingKey: 'APICAL-PERIODONTITIS', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5 days (dental short course)' },
    { findingKey: 'APICAL-PERIODONTITIS', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3-5 days after food' },
    // DENTO-ABSCESS
    { findingKey: 'DENTO-ABSCESS', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5 days — DRAINAGE/referral mandatory, medicines alone will not cure' },
    { findingKey: 'DENTO-ABSCESS', medicineName: 'Metrogyl 400 Tablet', description: '1 tab TDS × 3-5 days (anaerobic cover); no alcohol' },
    { findingKey: 'DENTO-ABSCESS', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3 days after food' },
    // PERICORONITIS
    { findingKey: 'PERICORONITIS', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 3-5 days if swelling/trismus; irrigation + review' },
    { findingKey: 'PERICORONITIS', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3 days after food' },
    { findingKey: 'PERICORONITIS', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: '15 ml BD rinse 30 sec × 7 days — max 2 weeks (staining)' },
    // GINGIVITIS-CHRONIC
    { findingKey: 'GINGIVITIS-CHRONIC', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: '15 ml BD × 2 weeks MAX — staining/taste alteration beyond 2 weeks' },
    { findingKey: 'GINGIVITIS-CHRONIC', medicineName: 'Metrogyl DG Gel 20g', description: 'Apply BD on gum margins after brushing; do not swallow' },
    { findingKey: 'GINGIVITIS-CHRONIC', medicineName: 'Becosules Capsule', description: '1 cap OD × 15 days (deficiency support)' },
    // PERIODONTITIS-CHRONIC
    { findingKey: 'PERIODONTITIS-CHRONIC', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: '15 ml BD × 2 weeks MAX, then plain saline rinses' },
    { findingKey: 'PERIODONTITIS-CHRONIC', medicineName: 'Metrogyl DG Gel 20g', description: 'Apply BD into gum pockets after scaling' },
    { findingKey: 'PERIODONTITIS-CHRONIC', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5 days — ACUTE flare only (abscess)' },
    // DENTAL-CALCULUS
    { findingKey: 'DENTAL-CALCULUS', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: 'Post-scaling rinse BD × 1 week; scaling is the treatment' },
    // DENTINE-SENS
    { findingKey: 'DENTINE-SENS', medicineName: 'Thermoseal Toothpaste 100g', description: 'Brush twice daily; wait 2 minutes before rinsing' },
    // FRACTURED-TOOTH
    { findingKey: 'FRACTURED-TOOTH', medicineName: 'Zerodol-P Tablet', description: 'Interim pain relief until restoration; avoid chewing on fragment' },
    // POST-EXTRACT-SOCKET
    { findingKey: 'POST-EXTRACT-SOCKET', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 3 days (post-op cover)' },
    { findingKey: 'POST-EXTRACT-SOCKET', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3 days after food' },
    { findingKey: 'POST-EXTRACT-SOCKET', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: 'Start AFTER 24 hrs only, BD × 5 days' },
    // DRY-SOCKET-SUSPECT
    { findingKey: 'DRY-SOCKET-SUSPECT', medicineName: 'Zerodol-P Tablet', description: 'Pain control only — REFER same day for socket dressing' },
    // RAS
    { findingKey: 'RAS', medicineName: 'Orasore Dental Gel 15g', description: 'Apply 20 min before meals + bedtime; not more than 7 days continuously' },
    { findingKey: 'RAS', medicineName: 'Dologel CT Gel 15g', description: 'Apply TDS — aspirin-sensitive caution; NOT for young children' },
    { findingKey: 'RAS', medicineName: 'Becosules Capsule', description: '1 cap OD × 15 days (deficiency support)' },
    { findingKey: 'RAS', medicineName: 'Zincovit Tablet', description: '1 tab OD × 15 days for recurrent ulcers' },
    // ORAL-CANDIDIASIS
    { findingKey: 'ORAL-CANDIDIASIS', medicineName: 'Candid Mouth Paint 15ml', description: 'Paint lesions QID × 7-10 days after wiping; rinse denture too' },
    // ANGULAR-CHEILITIS
    { findingKey: 'ANGULAR-CHEILITIS', medicineName: 'Candid Cream 15g', description: 'Apply BD on corners after cleaning; keep dry' },
    { findingKey: 'ANGULAR-CHEILITIS', medicineName: 'Becosules Capsule', description: '1 cap OD × 15 days (B-complex support)' },
    // DENTURE-STOMATITIS
    { findingKey: 'DENTURE-STOMATITIS', medicineName: 'Candid Mouth Paint 15ml', description: 'Paint palate QID × 10 days + denture hygiene; remove denture at night' },
    { findingKey: 'DENTURE-STOMATITIS', medicineName: 'Hexidine 0.2% Mouth Rinse 160ml', description: '15 ml BD with denture OUT; max 2 weeks' },
    // BURNING-MOUTH
    { findingKey: 'BURNING-MOUTH', medicineName: 'Becosules Capsule', description: '1 cap OD × 30 days — supportive; investigate cause (B12/folate/diabetes)' },
    // TMJ-MYO
    { findingKey: 'TMJ-MYO', medicineName: 'Myoril 4mg Tablet', description: '1 tab BD × 3-5 days ONLY + soft diet + warm compress' },
    { findingKey: 'TMJ-MYO', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 5 days after food' },
  ],

  // ══ Table templates (6) — dental-chart grid + treatment plan UNIQUE ════
  tables: [
    {
      name: 'Dental Chart (FDI 32 Teeth)',
      rows: 32,
      cols: 4,
      headerLabel: ['दांत (FDI नं.)', 'निष्कर्ष', 'उपचार योजना', 'योजना की मुलाकात'],
      colsLabel: ['Tooth (FDI No.)', 'Finding', 'Treatment Planned', 'Planned Visit'],
      footerLabel: ['FDI नंबर: 11-18 ऊपर दायां · 21-28 ऊपर बायां · 31-38 नीचे बायां · 41-48 नीचे दायां / FDI numbering: 11-18 upper right, 21-28 upper left, 31-38 lower left, 41-48 lower right'],
    },
    {
      name: 'Treatment Plan Tracker',
      rows: 12,
      cols: 5,
      headerLabel: ['दांत (FDI)', 'प्रक्रिया (RCT/निकालना/फिलिंग)', 'स्थिति', 'अगली मुलाकात', 'टिप्पणी'],
      colsLabel: ['Tooth (FDI)', 'Procedure (RCT/Extraction/Filling)', 'Status', 'Next Visit', 'Notes'],
      footerLabel: ['एक-एक करके इलाज पूरा करें — अधूरा इलाज दर्द लौटा देता है / Complete treatments one by one — unfinished treatment brings the pain back'],
    },
    {
      name: 'Post-Extraction Instructions Card',
      rows: 10,
      cols: 3,
      headerLabel: ['निर्देश', 'कब तक', 'पालन (✓/✗)'],
      colsLabel: ['Instruction', 'How Long', 'Followed (✓/✗)'],
      footerLabel: ['बहुत ज्यादा खून, बुखार या बढ़ता दर्द — तुरंत डॉक्टर को बताएं / Heavy bleeding, fever or rising pain — contact the dentist immediately'],
    },
    {
      name: 'Gum Disease Staging Grid',
      rows: 6,
      cols: 5,
      headerLabel: ['क्षेत्र / दांत', 'खून (0-3)', 'पत्थर (0-3)', 'पॉकेट गहराई (mm)', 'स्टेज (1-4)'],
      colsLabel: ['Area / Tooth', 'Bleeding (0-3)', 'Calculus (0-3)', 'Pocket Depth (mm)', 'Stage (1-4)'],
      footerLabel: ['पॉकेट 5mm+ या स्टेज 3-4 = पिरियडॉन्टाइटिस — स्केलिंग से आगे के इलाज की योजना बनाएं / Pocket 5mm+ or stage 3-4 = periodontitis — plan treatment beyond scaling'],
    },
    {
      name: 'Dental Pain Diary (7 days)',
      rows: 7,
      cols: 4,
      headerLabel: ['दिन', 'दर्द स्कोर (0-10)', 'रात में दर्द?', 'दर्द की दवा ली?'],
      colsLabel: ['Day', 'Pain Score (0-10)', 'Night Pain?', 'Analgesic Taken?'],
      footerLabel: ['बढ़ता रात का दर्द = नस की सूजन बढ़ रही है — इलाज टालें नहीं / Rising night pain = pulpitis worsening — do not delay treatment'],
    },
    {
      name: 'Tobacco Cessation Tracker (30 days)',
      rows: 14,
      cols: 4,
      headerLabel: ['तारीख', 'आज कितनी बार गुटखा/पान', 'तीव्र इच्छा (0-10)', 'बचाव का तरीका'],
      colsLabel: ['Date', 'Gutkha/Paan Count Today', 'Craving (0-10)', 'Coping Trick Used'],
      footerLabel: ['मुंह की जांच हर 6 महीने — छोड़ने के बाद भी कैंसर का खतरा सालों तक घटता रहता है / Mouth check every 6 months — cancer risk keeps falling for years after quitting'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Root Canal (RCT) — Bridge Course',
      diagnosis: 'PULPITIS-ACUTE',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food; dental short course only' },
        { name: 'Zerodol-P Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food; stop once pain settles' },
      ],
      labs: ['IOPA X-ray (tooth-specific)'],
      advice: 'आगे की RCT सिटिंग्स टालें नहीं · उस दांत से कड़क/चिकनी चीज न चबाएं · दर्द बढ़े या सूजन आए तो बीच में ही मिलें · इलाज पूरा करवाना ही पक्का इलाज है',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Extraction — Post-Op Course',
      diagnosis: 'POST-EXTRACT-SOCKET',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food (cover)' },
        { name: 'Zerodol-P Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food; SOS beyond' },
        { name: 'Hexidine 0.2% Mouth Rinse 160ml', dose: '15 ml rinse', duration: '5 days', instructions: 'START AFTER 24 HRS ONLY; 30-sec rinse; no water/food 30 min after' },
      ],
      labs: [],
      advice: 'पहले 24 घंटे: कुल्ला नहीं, न स्ट्रॉ, न थूकना, न धूम्रपान · ठंडी सिकाई 10 मिनट × 3 बार पहले दिन · नरम-ठंडा खाना (दही, खिचड़ी) 2-3 दिन · तीसरे दिन बढ़ता दर्द/बदबू = सूखा सॉकेट — तुरंत मिलें',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Gum Disease — Scaling Course',
      diagnosis: 'GINGIVITIS-CHRONIC',
      medicines: [
        { name: 'Hexidine 0.2% Mouth Rinse 160ml', dose: '15 ml rinse twice daily', duration: '14 days', instructions: 'MAX 2 WEEKS — staining and taste alteration beyond that' },
        { name: 'Metrogyl DG Gel 20g', dose: 'Apply on gums', duration: '14 days', instructions: 'Twice daily after brushing; do not swallow' },
        { name: 'Becosules Capsule', dose: '1 capsule', duration: '15 days', instructions: 'Once daily after food' },
      ],
      labs: ['CBC (only if spontaneous bleeding)'],
      advice: 'स्केलिंग जरूर कराएं — दवा अकेले मसूड़े की बीमारी नहीं हटाती · 45 डिग्री कोण पर छोटे वृत्त बनाकर 2 मिनट ब्रश करें, दिन में 2 बार · माउथवॉश 2 हफ्ते के बाद बंद कर दें · 6 महीने में दोबारा सफाई',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Pericoronitis — Wisdom Tooth Course',
      diagnosis: 'PERICORONITIS',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab twice daily', duration: '5 days', instructions: 'After food' },
        { name: 'Metrogyl 400 Tablet', dose: '1 tab thrice daily', duration: '3 days', instructions: 'Anaerobic cover; strictly no alcohol' },
        { name: 'Zerodol-P Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food' },
      ],
      labs: ['OPG X-ray (impaction assessment)'],
      advice: 'लूकवार्म नमक-पानी के गरारे दिन में 6-8 बार · पीछे वाले इलाज (irrigation) के लिए मिलें · नरम खाना खाएं, उस तरफ चबाना कम रखें · सूजन बैठने के बाद दाढ़ निकालने का फैसला करें',
      followUpDays: 2,
      isCommon: true,
    },
    {
      name: 'Dental Abscess — Urgent Course',
      diagnosis: 'DENTO-ABSCESS',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab twice daily', duration: '5 days', instructions: 'After food' },
        { name: 'Metrogyl 400 Tablet', dose: '1 tab thrice daily', duration: '5 days', instructions: 'Anaerobic cover; strictly no alcohol' },
        { name: 'Zerodol-P Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food' },
      ],
      labs: ['IOPA X-ray', 'OPG if swelling extensive'],
      advice: 'मवाद की निकासी (drainage) जरूरी है — दवा अकेले फोड़ा नहीं सुखाती · बुखार/सूजन बढ़े या निगलने-सांस में दिक्कत हो तो तुरंत इमरजेंसी · 48 घंटे में दोबारा मिलना अनिवार्य',
      followUpDays: 2,
    },
    {
      name: 'Aphthous Ulcer — Soothing Course',
      diagnosis: 'RAS',
      medicines: [
        { name: 'Orasore Dental Gel 15g', dose: 'Apply thin layer', duration: '7 days', instructions: '20 minutes before meals + bedtime; do not over-apply' },
        { name: 'Dologel CT Gel 15g', dose: 'Apply thin layer', duration: '7 days', instructions: 'Not in aspirin-sensitive patients; not for young children' },
        { name: 'Becosules Capsule', dose: '1 capsule', duration: '15 days', instructions: 'Once daily after food' },
        { name: 'Zincovit Tablet', dose: '1 tablet', duration: '15 days', instructions: 'Once daily after food' },
      ],
      labs: ['CBC + Vitamin B12 / folate (only if very frequent)'],
      advice: 'खट्टा, तीखा, कड़क और गर्म खाना बंद रखें · छाले 7-10 दिन में भर जाते हैं · कोई घाव 2 हफ्ते से ज्यादा न भरे तो तुरंत दिखाएं (कैंसर जांच) · नींद और तनाव सुधारें',
      followUpDays: 7,
    },
  ],
}
