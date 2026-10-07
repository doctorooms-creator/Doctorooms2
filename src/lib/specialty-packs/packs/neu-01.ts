/**
 * NEU-01 — NEUROLOGY STARTER PACK (T2 specialist pack)
 *
 * The India tier-2/3 neurology OPD core: highest-frequency complaints
 * (headache, epilepsy follow-up, stroke rehab, neuropathy, vertigo,
 * movement disorders), continuation-verify medicines, and bilingual
 * clinical questions / patient-printable advice.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India neuro core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY DESIGN (non-negotiables baked into content):
 *  - Sudden-onset complaints carry ACT-FAST + 108-ambulance advice lines
 *    (stroke thrombolysis window framed as within-4.5-hours).
 *  - REFER-ONLY findings (SAH, meningitis, raised-ICP, acute stroke, TIA,
 *    status epilepticus, first seizure, GBS, MG, MS, MND, delirium, child
 *    delay, myasthenic crisis, Bell palsy, Meniere, PD/dementia suspects,
 *    double vision) carry ZERO findingMeds links — this pack prescribes
 *    nothing for emergencies; 108 / referral is the treatment.
 *  - AEDs are CONTINUATION-VERIFY only: never-abrupt-stop, phenytoin
 *    narrow-TI, valproate pregnancy-NEVER, lamotrigine SJS titration,
 *    carbamazepine hyponatremia/SJS, driving-restriction counselling.
 *  - Triptans: max 2 doses/24 h, 24 h gap, no ergot overlap, coronary
 *    disease never, SSRI serotonin caution.
 *  - Parkinson / dementia medicines: continuation-only, protein-meal
 *    interaction, never-abrupt withdrawal.
 *  - NSAIDs carry MOH warning (>10 days/month) + cardiac/renal avoid lines.
 *  - No opioids chronics; Ultracet is SOS-only with dependence note.
 *
 * Sources: standard Indian neuro OPD practice patterns, ICD-10 coded
 * findings, existing GP-01 pack for field conventions.
 */

import type { SpecialtyPack } from '../types'

export const NEU01_PACK: SpecialtyPack = {
  meta: {
    code: 'NEU-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Neurology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'Specialization: Neurologist · Indian tier-2/3 neuro OPD patterns · ICD-10 coded · refer-only findings carry zero medicine links · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'HDC', name: 'सिरदर्द', nameEn: 'Headache' },
    { key: 'EPL', name: 'मिर्गी / दौरे', nameEn: 'Epilepsy & Seizures' },
    { key: 'STR', name: 'स्ट्रोक व पक्षाघात', nameEn: 'Stroke & Paralysis' },
    { key: 'NMN', name: 'नस-मांसपेशी', nameEn: 'Nerve & Muscle' },
    { key: 'VTS', name: 'चक्कर व संतुलन', nameEn: 'Vertigo & Dizziness' },
    { key: 'MOV', name: 'हलचल व अन्य', nameEn: 'Movement & Others' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // HDC — Headache
    { code: 'HDC01', categoryKey: 'HDC', detail: 'सिर के दोनों तरफ दबाव जैसा दर्द', detailEn: 'Headache Both Sides, Pressing (Tension-type)' },
    { code: 'HDC02', categoryKey: 'HDC', detail: 'आधे सिर का झटकेदार दर्द — पहले चमक दिखती है', detailEn: 'Migraine with Aura' },
    { code: 'HDC03', categoryKey: 'HDC', detail: 'आधे सिर का झटकेदार दर्द — बिना चमक', detailEn: 'Migraine without Aura' },
    { code: 'HDC04', categoryKey: 'HDC', detail: 'बार-बार एक तरफ बहुत तेज़ सिरदर्द के दौरे', detailEn: 'Recurrent One-sided Severe Headache Episodes' },
    { code: 'HDC05', categoryKey: 'HDC', detail: 'अब तक का सबसे तेज़ सिरदर्द — अचानक शुरू (आपात)', detailEn: 'Worst-ever Sudden Headache (Emergency)' },
    { code: 'HDC06', categoryKey: 'HDC', detail: 'सिरदर्द + बुखार + गर्दन में अकड़न (आपात)', detailEn: 'Headache with Fever + Neck Stiffness (Emergency)' },
    { code: 'HDC07', categoryKey: 'HDC', detail: 'सिरदर्द + उल्टी + धुंधला दिखना (तत्काल जांच)', detailEn: 'Headache with Vomiting + Blurred Vision (Urgent)' },
    { code: 'HDC08', categoryKey: 'HDC', detail: 'सुबह उठने पर सिरदर्द की आदत', detailEn: 'Morning Headache Pattern' },
    { code: 'HDC09', categoryKey: 'HDC', detail: 'रोज़ का सिरदर्द — पेनकिलर खाते-खाते (MOH)', detailEn: 'Chronic Daily Headache — Analgesic Overuse (MOH)' },
    { code: 'HDC10', categoryKey: 'HDC', detail: 'आधे चेहरे में बिजली जैसे झटके', detailEn: 'Electric Shock-like Facial Pain (Trigeminal)' },
    // EPL — Epilepsy & seizures
    { code: 'EPL01', categoryKey: 'EPL', detail: 'मिर्गी की दवा पर नियमित फॉलो-अप', detailEn: 'Epilepsy Follow-up on Medicine' },
    { code: 'EPL02', categoryKey: 'EPL', detail: 'जीवन में पहली बार दौरा पड़ा (रेफर)', detailEn: 'First-ever Seizure (Refer)' },
    { code: 'EPL03', categoryKey: 'EPL', detail: 'सिर्फ नींद में दौरे आते हैं', detailEn: 'Fits in Sleep Only' },
    { code: 'EPL04', categoryKey: 'EPL', detail: 'बच्चे को बुखार के साथ दौरा (बाल-रोग रेफर)', detailEn: 'Seizure in Child with Fever (Pediatric Refer)' },
    { code: 'EPL05', categoryKey: 'EPL', detail: 'दौरे के बाद भ्रम / गहरी नींद', detailEn: 'Post-seizure Confusion' },
    { code: 'EPL06', categoryKey: 'EPL', detail: 'बाहर कराई EEG — रिपोर्ट दिखाना', detailEn: 'EEG Done Outside — Review' },
    // STR — Stroke & paralysis
    { code: 'STR01', categoryKey: 'STR', detail: 'स्ट्रोक के बाद ठीक होने की फॉलो-अप', detailEn: 'Stroke Recovery Follow-up' },
    { code: 'STR02', categoryKey: 'STR', detail: 'शरीर के एक तरफ अचानक कमजोरी (आपात — 108)', detailEn: 'Sudden One-sided Weakness (Emergency — 108)' },
    { code: 'STR03', categoryKey: 'STR', detail: 'अचानक बोलने में लड़खड़ (आपात — 108)', detailEn: 'Sudden Slurred Speech (Emergency — 108)' },
    { code: 'STR04', categoryKey: 'STR', detail: 'अचानक चेहरा एक तरफ टेढ़ा (आपात)', detailEn: 'Sudden Face Drooping (Emergency)' },
    { code: 'STR05', categoryKey: 'STR', detail: 'लकवा जैसा छोटा दौरा जो पूरा ठीक हुआ (TIA)', detailEn: 'Mini-stroke-like Episode Resolved (TIA — Urgent)' },
    { code: 'STR06', categoryKey: 'STR', detail: 'चेहरे का एक तरफ लकवा — आंख बंद नहीं होती (रेफर)', detailEn: 'One-sided Facial Paralysis — Bell Palsy (Refer)' },
    // NMN — Nerve & muscle
    { code: 'NMN01', categoryKey: 'NMN', detail: 'रात में हाथ सुन्न / झनझनाहत — कार्पल टनल स्क्रीन', detailEn: 'Hand Numbness at Night — Carpal Tunnel Screen' },
    { code: 'NMN02', categoryKey: 'NMN', detail: 'पैरों में जलन — मधुमेह संबंध संभव', detailEn: 'Burning Feet — Diabetes Link' },
    { code: 'NMN03', categoryKey: 'NMN', detail: 'चलने पर पैर में झनझनाहट, बैठने से आराम', detailEn: 'Leg Tingling on Walking, Relieved by Sitting' },
    { code: 'NMN04', categoryKey: 'NMN', detail: 'कमर से पैर तक बंदी वाला दर्द (सायटिका)', detailEn: 'Back Pain Shooting Down the Leg (Sciatica)' },
    { code: 'NMN05', categoryKey: 'NMN', detail: 'गर्दन का दर्द हाथ तक जाता है', detailEn: 'Neck Pain Radiating to the Arm' },
    { code: 'NMN06', categoryKey: 'NMN', detail: 'धीरे-धीरे बढ़ती मांसपेशी कमजोरी (रेफर)', detailEn: 'Gradual Muscle Weakness (Refer)' },
    { code: 'NMN07', categoryKey: 'NMN', detail: 'एक ही वस्तु दो दिखना (आपात जांच)', detailEn: 'Double Vision (Urgent Evaluation)' },
    { code: 'NMN08', categoryKey: 'NMN', detail: 'पलक झुक आती है / आंख ढलकना', detailEn: 'Drooping Eyelid (Myasthenia Screen)' },
    { code: 'NMN09', categoryKey: 'NMN', detail: 'सिर की चोट के बाद फॉलो-अप', detailEn: 'Post Head Injury Follow-up' },
    { code: 'NMN10', categoryKey: 'NMN', detail: 'बाहर कराया MRI ब्रेन — रिपोर्ट दिखाना', detailEn: 'MRI Brain Done Outside — Review' },
    // VTS — Vertigo & dizziness
    { code: 'VTS01', categoryKey: 'VTS', detail: 'कमर घूमने लगना — BPPV संभव', detailEn: 'Spinning Vertigo — Possible BPPV' },
    { code: 'VTS02', categoryKey: 'VTS', detail: 'चक्कर + कान में सुनने की कमी', detailEn: 'Vertigo with Hearing Loss (Meniere Screen)' },
    { code: 'VTS03', categoryKey: 'VTS', detail: 'खड़े होते ही चक्कर आना', detailEn: 'Dizziness on Standing (Orthostatic)' },
    { code: 'VTS04', categoryKey: 'VTS', detail: 'रात में चलने पर संतुलन बिगड़ना', detailEn: 'Imbalance Walking at Night' },
    { code: 'VTS05', categoryKey: 'VTS', detail: 'नींद न आना + पैरों में बेचैनी', detailEn: 'Insomnia with Restless Legs' },
    // MOV — Movement & others
    { code: 'MOV01', categoryKey: 'MOV', detail: 'हाथों का कांपन — पार्किंसन स्क्रीन', detailEn: 'Hand Tremors — Parkinson Screen' },
    { code: 'MOV02', categoryKey: 'MOV', detail: 'सिर का कांपन — पारिवारिक / एसेंशियल', detailEn: 'Head Shaking Tremor — Essential / Familial' },
    { code: 'MOV03', categoryKey: 'MOV', detail: 'शरीर में अकड़न + धीरे-धीरे सब कुछ', detailEn: 'Body Stiffness + Slowness (Parkinson Workup)' },
    { code: 'MOV04', categoryKey: 'MOV', detail: 'धीरे-धीरे याददाश्त कम होना — मूल्यांकन', detailEn: 'Gradual Memory Loss — Dementia Evaluation' },
    { code: 'MOV05', categoryKey: 'MOV', detail: 'बुढ़ापे में नाम-चीज़ भूलना — स्क्रीन', detailEn: 'Old-age Forgetfulness — Dementia Screen' },
    { code: 'MOV06', categoryKey: 'MOV', detail: 'बच्चे के विकास के लक्षण देर से (रेफर)', detailEn: 'Child with Delayed Milestones (Refer)' },
    { code: 'MOV07', categoryKey: 'MOV', detail: 'पार्किंसन की दवा पर फॉलो-अप', detailEn: 'Parkinson Disease Follow-up on Medicine' },
  ],

  // ══ Questions (88 — 2 per complaint) ══════════════════════════════════
  // Each entry is annotated `// idx N` — N MUST equal the true 0-based
  // array index below (validator-checked; ZERO drift allowed).
  questions: [
    // HDC01 Tension-type headache
    { complaintCode: 'HDC01', question: 'सिरदर्द कितने महीनों से चल रहा है?', questionEn: 'Since how many months has the headache been going on?' }, // idx 0
    { complaintCode: 'HDC01', question: 'दिन में कितने घंटे कंप्यूटर/मोबाइल पर काम करते हैं?', questionEn: 'How many hours a day do you work on computer/mobile?' }, // idx 1
    // HDC02 Migraine with aura
    { complaintCode: 'HDC02', question: 'चमक / ज़िगज़ैग लाइनें दिखने के कितनी देर बाद सिरदर्द शुरू होता है?', questionEn: 'How long after the flashes/zigzag lines does the headache begin?' }, // idx 2
    { complaintCode: 'HDC02', question: 'महीने में कितने दिन ऐसे सिरदर्द होते हैं?', questionEn: 'How many days a month do such headaches occur?' }, // idx 3
    // HDC03 Migraine without aura
    { complaintCode: 'HDC03', question: 'दर्द के साथ जी मिचलाना या उल्टी होती है?', questionEn: 'Is there nausea or vomiting with the pain?' }, // idx 4
    { complaintCode: 'HDC03', question: 'तेज़ रोशनी या तेज़ आवाज़ से दर्द बढ़ता है?', questionEn: 'Does bright light or loud sound worsen the pain?' }, // idx 5
    // HDC04 Recurrent one-sided severe episodes
    { complaintCode: 'HDC04', question: 'एक दौरा कितने घंटे रहता है?', questionEn: 'How many hours does one episode last?' }, // idx 6
    { complaintCode: 'HDC04', question: 'दर्द के समय रोज़ का काम कर पाते हैं?', questionEn: 'Can you do routine work during the pain?' }, // idx 7
    // HDC05 Worst-ever sudden headache (SAH screen)
    { complaintCode: 'HDC05', question: 'क्या यह जीवन का सबसे तेज़ सिरदर्द है जो सेकंडों में शुरू हुआ?', questionEn: 'Is this the worst headache of your life, starting within seconds?' }, // idx 8
    { complaintCode: 'HDC05', question: 'क्या इसके साथ बेहोशी या गर्दन में अकड़न भी है?', questionEn: 'Any fainting or neck stiffness along with it?' }, // idx 9
    // HDC06 Headache + fever + neck stiffness (meningitis screen)
    { complaintCode: 'HDC06', question: 'बुखार के साथ गर्दन ठूंस नीचे झुकाने में दर्द/अकड़न है?', questionEn: 'With the fever, is there pain/stiffness on bending the neck down?' }, // idx 10
    { complaintCode: 'HDC06', question: 'तेज़ रोशनी देखने पर आंखों में चुभन होती है?', questionEn: 'Does looking at bright light hurt the eyes?' }, // idx 11
    // HDC07 Raised-ICP screen
    { complaintCode: 'HDC07', question: 'सुबह उठते ही उल्टी आ जाती है?', questionEn: 'Do you vomit right after waking up in the morning?' }, // idx 12
    { complaintCode: 'HDC07', question: 'हाल में देखने में धुंधला या दोहरा दिखना शुरू हुआ है?', questionEn: 'Recently started seeing blurred or double?' }, // idx 13
    // HDC08 Morning headache pattern
    { complaintCode: 'HDC08', question: 'नींद में खर्राटे लेते हैं?', questionEn: 'Do you snore during sleep?' }, // idx 14
    { complaintCode: 'HDC08', question: 'हाल में BP की जांच हुई है?', questionEn: 'Has your BP been checked recently?' }, // idx 15
    // HDC09 Chronic daily headache / MOH screen
    { complaintCode: 'HDC09', question: 'महीने में कितने दिन पेनकिलर की गोली लेते हैं?', questionEn: 'How many days a month do you take painkiller tablets?' }, // idx 16
    { complaintCode: 'HDC09', question: 'गोली बंद करने पर सिरदर्द वापस आ जाता है?', questionEn: 'Does the headache come back when you stop the tablet?' }, // idx 17
    // HDC10 Trigeminal neuralgia
    { complaintCode: 'HDC10', question: 'दर्द ब्रश करने, चबाने या ठंडी हवा के छूने से छिड़कता है?', questionEn: 'Is the pain triggered by brushing, chewing or cold air touching the face?' }, // idx 18
    { complaintCode: 'HDC10', question: 'दर्द कुछ सेकंड का बिजली जैसा झटका होता है?', questionEn: 'Is the pain an electric-shock-like jolt lasting a few seconds?' }, // idx 19
    // EPL01 Epilepsy follow-up on medicine
    { complaintCode: 'EPL01', question: 'अभी कौन सी दवा और कितनी खुराक चल रही है? (नाम + बोतल देखें)', questionEn: 'Which medicine and what dose are you currently on? (name + bottle check)' }, // idx 20
    { complaintCode: 'EPL01', question: 'पिछले महीने कितने दौरे पड़े?', questionEn: 'How many seizures occurred last month?' }, // idx 21
    // EPL02 First-ever seizure
    { complaintCode: 'EPL02', question: 'दौरे में पूरे शरीर का अकड़न-झटके थे या एक अंग से शुरू हुआ?', questionEn: 'Was it whole-body stiffening and jerks, or did it start in one limb?' }, // idx 22
    { complaintCode: 'EPL02', question: 'दौरे में जीभ कटना या पेशाब का नियंत्रण खोना हुआ?', questionEn: 'Any tongue-biting or loss of bladder control during the episode?' }, // idx 23
    // EPL03 Sleep-only seizures
    { complaintCode: 'EPL03', question: 'सुबह उठने पर जीभ में दर्द या गीली चादर मिली?', questionEn: 'On waking, any tongue soreness or wet bed sheets?' }, // idx 24
    { complaintCode: 'EPL03', question: 'दिन में जागते हुए भी कभी दौरा पड़ा है?', questionEn: 'Have you ever had a seizure while awake in the daytime?' }, // idx 25
    // EPL04 Child seizure with fever
    { complaintCode: 'EPL04', question: 'बुखार शुरू होने के कितने घंटे बाद दौरा पड़ा?', questionEn: 'How many hours after the fever started did the fit occur?' }, // idx 26
    { complaintCode: 'EPL04', question: 'बच्चे की उम्र क्या है?', questionEn: 'What is the age of the child?' }, // idx 27
    // EPL05 Post-seizure confusion
    { complaintCode: 'EPL05', question: 'दौरे के बाद भ्रम/गहरी नींद कितनी देर रही?', questionEn: 'How long did the confusion or deep sleep last after the seizure?' }, // idx 28
    { complaintCode: 'EPL05', question: 'दौरे से पहले कोई अजीब गंध/स्वाद या पेट में कुछ उठता महसूस होता है?', questionEn: 'Before the seizure, any odd smell/taste or a rising feeling in the belly?' }, // idx 29
    // EPL06 EEG review
    { complaintCode: 'EPL06', question: 'दौरे अब कितने महीनों से बंद हैं?', questionEn: 'Since how many months have the seizures stopped?' }, // idx 30
    { complaintCode: 'EPL06', question: 'पिछले हफ्तों में दवा की कोई खुराक छूटी है?', questionEn: 'Have any medicine doses been missed in recent weeks?' }, // idx 31
    // STR01 Stroke recovery follow-up
    { complaintCode: 'STR01', question: 'स्ट्रोक कब हुआ था?', questionEn: 'When did the stroke happen?' }, // idx 32
    { complaintCode: 'STR01', question: 'अब हाथ-पैर में ताकत कितनी लौटी है?', questionEn: 'How much strength has returned in the affected arm and leg?' }, // idx 33
    // STR02 Sudden one-sided weakness (thrombolysis window)
    { complaintCode: 'STR02', question: 'कमजोरी ठीक कब शुरू हुई — कितने घंटे पहले? (पहली बार ठीक देखा गया समय)', questionEn: 'Exactly when did the weakness start — how many hours ago? (last-seen-well time)' }, // idx 34
    { complaintCode: 'STR02', question: 'कमजोरी के साथ बोलने या समझने में दिक्कत भी है?', questionEn: 'Any speech or understanding difficulty along with the weakness?' }, // idx 35
    // STR03 Sudden slurred speech
    { complaintCode: 'STR03', question: 'बोलने की लड़खड़ कब शुरू हुई?', questionEn: 'When did the slurred speech start?' }, // idx 36
    { complaintCode: 'STR03', question: 'मुस्कुराइए — क्या चेहरे का एक तरफ ढीला लगता है?', questionEn: 'Please smile — does one side of the face look droopy?' }, // idx 37
    // STR04 Sudden face drooping
    { complaintCode: 'STR04', question: 'चेहरा टेढ़ा कब हुआ — कितने घंटे पहले?', questionEn: 'When did the face droop — how many hours ago?' }, // idx 38
    { complaintCode: 'STR04', question: 'आंख पूरी बंद कर पाते हैं या पानी गिरता है?', questionEn: 'Can you fully close the eye, or does water leak from it?' }, // idx 39
    // STR05 TIA resolved
    { complaintCode: 'STR05', question: 'लक्षण कितनी देर रहे और कब पूरी तरह ठीक हुए?', questionEn: 'How long did the symptoms last, and when did they fully resolve?' }, // idx 40
    { complaintCode: 'STR05', question: 'BP, शुगर या धूम्रपान का कोई इतिहास है?', questionEn: 'Any history of BP, sugar or smoking?' }, // idx 41
    // STR06 Bell palsy
    { complaintCode: 'STR06', question: 'चेहरे का लकवा अचानक आया या 2-3 दिन में धीरे-धीरे बढ़ा?', questionEn: 'Did the facial paralysis appear suddenly or build up over 2-3 days?' }, // idx 42
    { complaintCode: 'STR06', question: 'कान में दर्द या आवाज़ बहुत तेज़ लगना भी है?', questionEn: 'Any ear pain or intolerance to loud sound as well?' }, // idx 43
    // NMN01 Carpal tunnel screen
    { complaintCode: 'NMN01', question: 'रात में सुन्न हाथ से नींद टूटने पर हाथ हिलाने से आराम मिलता है?', questionEn: 'When numbness wakes you at night, does shaking the hand bring relief?' }, // idx 44
    { complaintCode: 'NMN01', question: 'दिन में कौन सी उंगलियां ज्यादा सुन्न रहती हैं?', questionEn: 'Which fingers stay more numb during the day?' }, // idx 45
    // NMN02 Burning feet / neuropathy
    { complaintCode: 'NMN02', question: 'शुगर (मधुमेह) की जांच कराई है?', questionEn: 'Have you been tested for sugar (diabetes)?' }, // idx 46
    { complaintCode: 'NMN02', question: 'रात में जलन ज्यादा होती है — चादर से पैर बाहर निकालते हैं?', questionEn: 'Is the burning worse at night — do you keep the feet out of the blanket?' }, // idx 47
    // NMN03 Claudication screen
    { complaintCode: 'NMN03', question: 'कितनी देर चलने पर झनझनाहट/दर्द शुरू होता है और बैठने से कितनी देर में आराम मिलता है?', questionEn: 'How long a walk brings on the tingling/pain, and how long does rest take to relieve it?' }, // idx 48
    { complaintCode: 'NMN03', question: 'पैर का कोई घाव ठीक होने में बहुत देर लगाता है?', questionEn: 'Do foot wounds take very long to heal?' }, // idx 49
    // NMN04 Sciatica
    { complaintCode: 'NMN04', question: 'दर्द पीठ से नीचे पैर की उंगलियों तक जाता है?', questionEn: 'Does the pain travel from the back down to the toes?' }, // idx 50
    { complaintCode: 'NMN04', question: 'खांसते या छींकते समय पैर में दर्द तेज़ हो जाता है?', questionEn: 'Does coughing or sneezing make the leg pain shoot?' }, // idx 51
    // NMN05 Cervical radiculopathy
    { complaintCode: 'NMN05', question: 'गर्दन हिलाने से हाथ में झनझनाहट बढ़ जाती है?', questionEn: 'Does moving the neck increase the tingling in the arm?' }, // idx 52
    { complaintCode: 'NMN05', question: 'हाथ की पकड़ कमजोर पड़ रही है?', questionEn: 'Is the hand grip getting weaker?' }, // idx 53
    // NMN06 Gradual muscle weakness
    { complaintCode: 'NMN06', question: 'कमजोरी पैरों से ऊपर की ओर बढ़ रही है या नीचे की ओर?', questionEn: 'Is the weakness climbing upward from the legs, or spreading downward?' }, // idx 54
    { complaintCode: 'NMN06', question: 'सीढ़ी चढ़ने या कुर्सी से उठने में दिक्कत होती है?', questionEn: 'Do you have trouble climbing stairs or rising from a chair?' }, // idx 55
    // NMN07 Double vision
    { complaintCode: 'NMN07', question: 'दो दिखना कब शुरू हुआ — अचानक या धीरे-धीरे?', questionEn: 'When did the double vision start — suddenly or gradually?' }, // idx 56
    { complaintCode: 'NMN07', question: 'एक आंख बंद करने पर दो दिखना खत्म हो जाता है?', questionEn: 'Does closing one eye stop the double vision?' }, // idx 57
    // NMN08 Ptosis / myasthenia screen
    { complaintCode: 'NMN08', question: 'पलक की झुकाव शाम को और बढ़ जाती है?', questionEn: 'Does the eyelid droop get worse by evening?' }, // idx 58
    { complaintCode: 'NMN08', question: 'दोपहर तक चबाने या बोलते-बोलते थकान आ जाती है?', questionEn: 'Do you tire out while chewing or speaking as the day goes on?' }, // idx 59
    // NMN09 Post head injury follow-up
    { complaintCode: 'NMN09', question: 'चोट कब लगी थी और तब बेहोशी आई थी क्या?', questionEn: 'When was the head injury, and was there any unconsciousness then?' }, // idx 60
    { complaintCode: 'NMN09', question: 'चोट के बाद से सिरदर्द, उल्टी या भूलने की शिकायत है?', questionEn: 'Since the injury, any headache, vomiting or forgetfulness?' }, // idx 61
    // NMN10 MRI review
    { complaintCode: 'NMN10', question: 'MRI किस शिकायत के लिए कराया था?', questionEn: 'For which complaint was the MRI done?' }, // idx 62
    { complaintCode: 'NMN10', question: 'रिपोर्ट की कॉपी या CD साथ लाए हैं?', questionEn: 'Have you brought the report copy or CD with you?' }, // idx 63
    // VTS01 BPPV
    { complaintCode: 'VTS01', question: 'बिस्तर पर पलटने या गर्दन घुमाने से चक्कर छिड़ते हैं?', questionEn: 'Do the spins get triggered by turning in bed or moving the head?' }, // idx 64
    { complaintCode: 'VTS01', question: 'एक चक्कर कितने सेकंड रहता है?', questionEn: 'How many seconds does one spin last?' }, // idx 65
    // VTS02 Meniere screen
    { complaintCode: 'VTS02', question: 'कान में भरापन, गूंज या सुनने में कमी है?', questionEn: 'Any ear fullness, ringing or reduced hearing?' }, // idx 66
    { complaintCode: 'VTS02', question: 'चक्कर के दौरे में सुनाई देना और कम हो जाता है?', questionEn: 'Does hearing drop further during the dizzy attacks?' }, // idx 67
    // VTS03 Orthostatic dizziness
    { complaintCode: 'VTS03', question: 'चक्कर बैठने या लेटने से ठीक हो जाते हैं?', questionEn: 'Do the spins settle on sitting or lying down?' }, // idx 68
    { complaintCode: 'VTS03', question: 'हाल में BP की कोई दवा बदली या बढ़ी है?', questionEn: 'Has any BP medicine been changed or increased recently?' }, // idx 69
    // VTS04 Imbalance at night
    { complaintCode: 'VTS04', question: 'रात में बिना रोशनी चलना और भी मुश्किल लगता है?', questionEn: 'Is walking even harder in the dark at night?' }, // idx 70
    { complaintCode: 'VTS04', question: 'शाम ढलते समय देखने में दिक्कत होती है?', questionEn: 'Do you have difficulty seeing at dusk?' }, // idx 71
    // VTS05 Insomnia + restless legs
    { complaintCode: 'VTS05', question: 'बिस्तर में पैरों में खिंचाव/बेचैनी होती है जो हिलाने से आराम देती है?', questionEn: 'Restless pulling sensation in the legs at bedtime that eases on moving them?' }, // idx 72
    { complaintCode: 'VTS05', question: 'रात में औसतन कितने घंटे की नींद लेते हैं?', questionEn: 'On average, how many hours do you sleep at night?' }, // idx 73
    // MOV01 Hand tremor / Parkinson screen
    { complaintCode: 'MOV01', question: 'कांपन आराम की हालत में है या काम करते समय?', questionEn: 'Is the tremor present at rest, or only while doing work?' }, // idx 74
    { complaintCode: 'MOV01', question: 'कांपन अंगूठा-उंगली की गोल घुमाव (गोली घुमाने जैसी) है?', questionEn: 'Is it a pill-rolling rotation of the thumb and fingers?' }, // idx 75
    // MOV02 Head tremor / essential
    { complaintCode: 'MOV02', question: 'परिवार में किसी और को भी कांपन है?', questionEn: 'Does anyone else in the family have a tremor?' }, // idx 76
    { complaintCode: 'MOV02', question: 'चाय/कॉफी लेने से कांपन बढ़ता है?', questionEn: 'Does tea/coffee make the tremor worse?' }, // idx 77
    // MOV03 Parkinson workup
    { complaintCode: 'MOV03', question: 'क्या चलते समय एक बांह कम हिलती है या कदम रुक-रुक कर आगे बढ़ते हैं?', questionEn: 'While walking, does one arm swing less, or do the feet shuffle and freeze?' }, // idx 78
    { complaintCode: 'MOV03', question: 'लिखाई छोटी हो गई है या गंध पहचानना कम हुआ है?', questionEn: 'Has your handwriting become smaller, or has smell sensation reduced?' }, // idx 79
    // MOV04 Memory loss evaluation
    { complaintCode: 'MOV04', question: 'आज की तारीख/महीना बता पाते हैं? — 3 शब्द सुनाऊंगा, 5 मिनट बाद बताइए', questionEn: 'Can you tell todays date/month? — I will say 3 words; recall them after 5 minutes' }, // idx 80
    { complaintCode: 'MOV04', question: 'रसोई का गैस चूल्हा या पानी का नल खुला छूट जाता है?', questionEn: 'Do you leave the gas stove or water taps running by mistake?' }, // idx 81
    // MOV05 Old-age forgetfulness screen
    { complaintCode: 'MOV05', question: 'भूलने से रोज़ का काम (खाना/पैसा/दवा) प्रभावित होता है?', questionEn: 'Does forgetfulness affect daily work (meals/money/medicines)?' }, // idx 82
    { complaintCode: 'MOV05', question: 'अकेले बाहर जाते समय जाना-पहचाना रास्ता भटक जाते हैं?', questionEn: 'Do you lose your way on familiar routes when going out alone?' }, // idx 83
    // MOV06 Child delayed milestones
    { complaintCode: 'MOV06', question: 'बच्चा कितने महीने का है और अभी क्या-क्या कर लेता है?', questionEn: 'How old is the child in months, and what all can he/she do now?' }, // idx 84
    { complaintCode: 'MOV06', question: 'बोलना/चलना उम्र के हिसाब से देर से शुरू हुआ?', questionEn: 'Did talking or walking start late for the age?' }, // idx 85
    // MOV07 Parkinson follow-up
    { complaintCode: 'MOV07', question: 'दवा लेने के बाद कांपन/अकड़न कितने घंटे नियंत्रित रहती है?', questionEn: 'After a dose, how many hours do the tremor and stiffness stay controlled?' }, // idx 86
    { complaintCode: 'MOV07', question: 'दवा का समय प्रोटीन वाले भोजन (दाल/दूध/अंडा) से अलग रखते हैं?', questionEn: 'Do you time the medicine away from protein-rich meals (dal/milk/egg)?' }, // idx 87
  ],

  // ══ Suggestions (176 — exactly 2 per question) ═══════════════════════
  // questionIndex order MUST match the questions array above.
  suggestions: [
    // HDC01 q0
    { questionIndex: 0, text: 'कुछ हफ्तों से है — आराम, नींद और पर्याप्त पानी से अक्सर कम हो जाता है', textEn: 'A few weeks — usually settles with rest, sleep and adequate water' },
    { questionIndex: 0, text: 'महीनों से रोज़ है — तनाव-सिरदर्द की जांच कराएं और दर्द-डायरी शुरू करें', textEn: 'Daily for months — get tension-headache evaluated and start a headache diary' },
    // HDC01 q1
    { questionIndex: 1, text: 'हर 45-50 मिनट में 5 मिनट का स्क्रीन ब्रेक लें — आंखें दूर खोलें, गर्दन सीधी रखें', textEn: 'Take a 5-minute screen break every 45-50 minutes — look into the distance, keep the neck straight' },
    { questionIndex: 1, text: 'स्क्रीन आंख की सतह पर रखें, कुर्सी-मुद्रा सीधी करें — लंबे स्क्रीन-समय का सिरदर्द घटता है', textEn: 'Keep the screen at eye level and posture upright — screen-strain headaches reduce' },
    // HDC02 q2
    { questionIndex: 2, text: 'चमक 20-30 मिनट चलकर सिरदर्द — यह माइग्रेन चेतावनी (आयुरा) है; डायरी में नोट करें', textEn: 'Flashes lasting 20-30 minutes then headache — this is migraine aura; note it in the diary' },
    { questionIndex: 2, text: 'चमक के साथ एक तरफ कमजोरी या बोलने में दिक्कत — हेमिप्लेजिक आयुरा — न्यूरो जांच जरूरी', textEn: 'Aura with one-sided weakness or speech trouble — hemiplegic aura — neuro evaluation needed' },
    // HDC02 q3
    { questionIndex: 3, text: 'महीने में 4 दिन से कम — ट्रिगर-ट्रैकर और नींद-अनुशासन अक्सर काफी हैं', textEn: 'Under 4 days a month — trigger tracking and sleep discipline are often enough' },
    { questionIndex: 3, text: 'महीने में 4+ दिन — रोकथाम दवा (प्रोफिलैक्सिस) की जरूरत — डॉक्टर से बात करें', textEn: '4+ days a month — a preventive medicine (prophylaxis) is needed — discuss with the doctor' },
    // HDC03 q4
    { questionIndex: 4, text: 'मतली/उल्टी के साथ — दर्द शुरू होते ही पहली गोली लें, ठंडी जगह आराम करें, घूंट-घूंट पानी पिएं', textEn: 'With nausea/vomiting — take the first tablet as soon as the pain starts, rest in a cool room, sip water' },
    { questionIndex: 4, text: 'बिना मतली — सामान्य माइग्रेन देखभाल + ट्रिगर नोट करते रहें', textEn: 'No nausea — standard migraine care + keep noting triggers' },
    // HDC03 q5
    { questionIndex: 5, text: 'रोशनी/आवाज़ से बढ़ता दर्द — हल्की अंधेरी कमरा, स्क्रीन बंद, आंख बंद कर आराम', textEn: 'Pain worse with light/sound — dim room, screens off, rest with eyes closed' },
    { questionIndex: 5, text: 'रोशनी से नहीं बढ़ता — अन्य कारणों की जांच कराते रहें', textEn: 'Not worsened by light — keep evaluating other causes' },
    // HDC04 q6
    { questionIndex: 6, text: '4-72 घंटे के दौरे — क्लासिक माइग्रेन पैटर्न; दर्द-डायरी भरें', textEn: 'Episodes of 4-72 hours — classic migraine pattern; fill the headache diary' },
    { questionIndex: 6, text: 'बिना रुके लगातार दर्द — न्यूरो जांच कराएं, इंतज़ार न करें', textEn: 'Continuous unremitting pain — get neuro evaluation without delay' },
    // HDC04 q7
    { questionIndex: 7, text: 'काम नहीं कर पाते — महत्वपूर्ण माइग्रेन; रोकथाम उपचार पर विचार करें', textEn: 'Unable to work during attacks — significant migraine; consider preventive treatment' },
    { questionIndex: 7, text: 'काम चल जाता है — हल्का दौरा; शुरुआत में ली गोली अक्सर काफी रहती है', textEn: 'Can keep working — mild attacks; a tablet taken early is often enough' },
    // HDC05 q8 — SAH screen
    { questionIndex: 8, text: 'हाँ — जीवन का सबसे तेज़ सिरदर्द जो सेकंडों में चढ़ा = आज ही CT स्कैन — 108 पर तुरंत एम्बुलेंस, घर का इलाज नहीं', textEn: 'Yes — worst headache of life peaking within seconds = CT scan today — call 108 ambulance now, no home remedies' },
    { questionIndex: 8, text: 'पहली बार इतना तेज़ आया है — रुकें नहीं; अस्पताल की जांच आज ही — कल नहीं', textEn: 'First time this severe — do not wait; hospital evaluation today — not tomorrow' },
    // HDC05 q9
    { questionIndex: 9, text: 'बेहोशी/गर्दन अकड़न — दिमाग में रक्तस्राव का संकेत — 108 इमरजेंसी, तुरंत अस्पताल', textEn: 'Fainting/neck stiffness — sign of bleeding around the brain — 108 emergency, hospital now' },
    { questionIndex: 9, text: 'ये लक्षण नहीं — फिर भी अचानक सबसे-तेज़ सिरदर्द होने पर आज ही CT जरूरी है', textEn: 'No such signs — a sudden worst-ever headache still needs a CT today' },
    // HDC06 q10 — meningitis screen
    { questionIndex: 10, text: 'गर्दन झुकाने में अकड़न + बुखार — मेनिंजाइटिस हो सकता है — 108 एम्बुलेंस, तुरंत अस्पताल', textEn: 'Neck stiffness on bending + fever — possible meningitis — 108 ambulance, hospital immediately' },
    { questionIndex: 10, text: 'गर्दन सामान्य चलती है — फिर भी बुखार + सिरदर्द 2 दिन से ज्यादा रहे तो जांच कराएं', textEn: 'Neck moves fine — still, fever + headache beyond 2 days needs evaluation' },
    // HDC06 q11
    { questionIndex: 11, text: 'तेज़ रोशनी आंखों में चुभती है + बुखार — तुरंत अस्पताल जाएं, देर न करें', textEn: 'Bright light hurting the eyes + fever — go to hospital immediately, do not delay' },
    { questionIndex: 11, text: 'रोशनी सामान्य लगती है — बुखार के बाद असामान्य उनींदापन/भ्रम दिखे तो तुरंत बताएं', textEn: 'Light tolerated — report at once if unusual drowsiness or confusion follows the fever' },
    // HDC07 q12 — raised ICP screen
    { questionIndex: 12, text: 'सुबह की उल्टी + सिरदर्द — दिमाग के भीतर दबाव का संकेत — आज ही न्यूरो जांच + इमेजिंग (MRI)', textEn: 'Morning vomiting + headache — sign of raised pressure inside the brain — neuro review + MRI today' },
    { questionIndex: 12, text: 'उल्टी नहीं — फिर भी सुबह के सिरदर्द की जांच (नींद की बीमारी/BP) जरूरी है', textEn: 'No vomiting — morning headaches still need evaluation (sleep disorder/BP)' },
    // HDC07 q13
    { questionIndex: 13, text: 'धुंधला/दोहरा दिखना + सिरदर्द — तत्काल न्यूरो रेफर और इमेजिंग — इसी हफ्ते नहीं, आज', textEn: 'Blurred/double vision + headache — urgent neuro referral and imaging — today, not this week' },
    { questionIndex: 13, text: 'देखने में सामान्य — नींद की जांच (खर्राटे) करवाएं, सुबह का BP नोट करें', textEn: 'Vision normal — get a sleep assessment (snoring) and record morning BP' },
    // HDC08 q14
    { questionIndex: 14, text: 'खर्राटे + सुबह का सिरदर्द — स्लीप एपनिया की जांच कराएं; शाम को भारी खाना/नींद की गोली नहीं', textEn: 'Snoring + morning headache — get tested for sleep apnea; no heavy late meals or sleeping pills' },
    { questionIndex: 14, text: 'खर्राटे नहीं — नींद 7-8 घंटे नियत करें, तकिया गर्दन को सहारा देता हुआ रखें', textEn: 'No snoring — fix 7-8 hours of sleep and a pillow that supports the neck' },
    // HDC08 q15
    { questionIndex: 15, text: 'BP नहीं जांचा — 3 दिन सुबह-शाम BP रिकॉर्ड करें; ऊंचा BP सुबह का सिरदर्द देता है', textEn: 'BP not checked — record BP morning and evening for 3 days; high BP causes morning headaches' },
    { questionIndex: 15, text: 'BP ठीक है — नींद की मात्रा और तकिये की ऊंचाई सुधारें; डायरी जारी रखें', textEn: 'BP normal — improve sleep duration and pillow height; continue the diary' },
    // HDC09 q16 — MOH
    { questionIndex: 16, text: 'महीने में 10 दिन से ज्यादा पेनकिलर — गोलियां खुद सिरदर्द बढ़ाती हैं (MOH): घटाने की डॉक्टर-योजना बनवाएं', textEn: 'Painkillers more than 10 days a month — the tablets themselves feed the headache (MOH): ask the doctor for a taper plan' },
    { questionIndex: 16, text: 'गोलियां कम — अच्छा; दर्द-डायरी और ट्रिगर-ट्रैकर भरते रहें', textEn: 'Few pills — good; keep filling the headache diary and trigger tracker' },
    // HDC09 q17
    { questionIndex: 17, text: 'हाँ, गोली रोकने पर वापस आता है — MOH का संकेत; पेनकिलर हफ्ते में 2 दिन से नीचे रखें, रोकथाम दवा के लिए मिलें', textEn: 'Yes, headache returns off the tablet — suggests MOH; keep painkillers under 2 days a week and see the doctor for prevention' },
    { questionIndex: 17, text: 'नहीं लौटता — नींद/पानी का अनुशासन काम कर रहा है — जारी रखें', textEn: 'Does not return — the sleep/hydration discipline is working — continue it' },
    // HDC10 q18 — trigeminal neuralgia
    { questionIndex: 18, text: 'ब्रश/चबाने/ठंडी हवा से छिड़कता दर्द — ट्राइजेमिनल न्यूरैल्जिया का क्लासिक संकेत — न्यूरो उपचार शुरू करें', textEn: 'Pain triggered by brushing/chewing/cold air — classic trigeminal neuralgia sign — start neuro treatment' },
    { questionIndex: 18, text: 'कोई छू-ट्रिगर नहीं — दांत/कान की जांच भी करा लें', textEn: 'No touch trigger — also get a dental and ear check' },
    // HDC10 q19
    { questionIndex: 19, text: 'सेकंड भर के बिजली-झटके, बार-बार — TN पैटर्न; नरम खाना खाएं, ठंडी हवा से गाल बचाएं, दवा समय पर', textEn: 'Recurrent seconds-long electric jolts — TN pattern; eat soft food, shield the cheek from cold wind, take medicine on time' },
    { questionIndex: 19, text: 'लगातार रहने वाला दर्द — दांत/साइनस जैसे अन्य कारण भी जांचें', textEn: 'Constant pain — also evaluate other causes like dental/sinus' },
    // EPL01 q20 — AED continuation
    { questionIndex: 20, text: 'दवा का नाम-खुराक लिखवा कर रखें — जारी रखने से पहले डॉक्टर सत्यापन करें; दवा कभी अचानक बंद न करें — दौरे वापस आ सकते हैं', textEn: 'Keep the medicine name-dose written down — the doctor verifies before continuing; NEVER stop it abruptly — seizures can return' },
    { questionIndex: 20, text: 'खुराक याद नहीं — पुराना पर्चा/दवा की पट्टी दिखाएं; छूटी हुई खुराक दोगुनी कभी न लें', textEn: 'Dose forgotten — show the old prescription or medicine strip; never double a missed dose' },
    // EPL01 q21
    { questionIndex: 21, text: '0 दौरे — बढ़िया नियंत्रण; दवा जारी रखें, दौरा-डायरी भरते रहें', textEn: '0 seizures — excellent control; continue medicines and keep filling the seizure diary' },
    { questionIndex: 21, text: 'दौरे हुए — तारीख/समय/ट्रिगर नोट करें; नींद की कमी/छूटी खुराक ढूंढें; डॉक्टर खुराक समीक्षा करेंगे', textEn: 'Seizures occurred — note date/time/trigger; look for lost sleep or missed doses; the doctor will review the dose' },
    // EPL02 q22 — first-ever seizure
    { questionIndex: 22, text: 'पूरे शरीर का अकड़न-झटके — सामान्यीकृत प्रकार; EEG जरूरी, विशेषज्ञ वर्कअप से पहले गाड़ी न चलाएं', textEn: 'Whole-body stiffening and jerks — generalized type; EEG essential, no driving until specialist workup' },
    { questionIndex: 22, text: 'एक अंग/एक तरफ से शुरू हुआ — फोकल प्रकार; मस्तिष्क MRI भी जरूरी — न्यूरो रेफर', textEn: 'Started in one limb or one side — focal type; brain MRI also needed — neuro referral' },
    // EPL02 q23
    { questionIndex: 23, text: 'जीभ कटना/पेशाब नियंत्रण — सच्चा दौरा; पहली बार = विशेषज्ञ जांच जरूरी (EEG + MRI)', textEn: 'Tongue-bite or bladder leak — a true seizure; first time = specialist workup essential (EEG + MRI)' },
    { questionIndex: 23, text: 'ये नहीं हुए — बेहोशी के अन्य कारण (शुगर गिरना/दिल की धड़कन) भी जांचें', textEn: 'Neither occurred — also evaluate other fainting causes (low sugar/heart rhythm)' },
    // EPL03 q24 — sleep seizures
    { questionIndex: 24, text: 'हाँ — नींद में दौरों का संकेत; EEG जरूरी — इसी हफ्ते डॉक्टर से मिलें', textEn: 'Yes — suggests seizures during sleep; EEG needed — meet the doctor this week' },
    { questionIndex: 24, text: 'नहीं — अच्छा; नींद पूरी करें — नींद की कमी दौरों का सबसे बड़ा ट्रिगर है', textEn: 'No — good; complete your sleep — sleep deprivation is the biggest seizure trigger' },
    // EPL03 q25
    { questionIndex: 25, text: 'जागते हुए भी दौरे — गाड़ी/साइकिल/तेज़ मशीन अभी बंद; डॉक्टर से ड्राइविंग नियमों पर बात करें', textEn: 'Seizures while awake too — no driving/cycling/operating machines for now; discuss driving rules with the doctor' },
    { questionIndex: 25, text: 'सिर्फ नींद में — नींद-जागने का समय नियत रखें; फिर भी नियमित समीक्षा जरूरी है', textEn: 'Only during sleep — keep fixed sleep-wake times; regular review is still needed' },
    // EPL04 q26 — child febrile seizure
    { questionIndex: 26, text: 'बुखार के साथ बच्चे का दौरा — बाल-न्यूरो विशेषज्ञ को आज ही दिखाएं; बुखार उतरने की विधि सीखें (पैराटामोल + हल्के कपड़े)', textEn: 'A fit with fever in a child — see pediatric neurology today; learn fever-control steps (paracetamol + light clothing)' },
    { questionIndex: 26, text: 'दौरा 5 मिनट से लंबा या दोबारा होने पर — 108 एम्बुलेंस; मुंह में कुछ न ठूंसें, करवट पर लिटाएं, समय नोट करें', textEn: 'If the fit lasts 5+ minutes or recurs — 108 ambulance; never force anything into the mouth, turn the child to the side, time it' },
    // EPL04 q27
    { questionIndex: 27, text: '6 महीने-5 साल की उम्र — फेब्राइल दौरा संभव; फिर भी बाल-रोग विशेषज्ञ की पुष्टि जरूरी', textEn: 'Age 6 months-5 years — febrile seizure possible; pediatric specialist confirmation still needed' },
    { questionIndex: 27, text: 'इस उम्र से बाहर — बिना देर पेड न्यूरो जांच जरूरी; बच्चे की दवा की खुराक यहीं नहीं बदलें', textEn: 'Age outside this range — urgent pediatric neuro evaluation; no child dose changes here' },
    // EPL05 q28
    { questionIndex: 28, text: 'घंटों की भ्रम/नींद — EEG + विशेषज्ञ; दौरा-डायरी में यह भी नोट करें', textEn: 'Hours of confusion or sleep — EEG + specialist; record this in the seizure diary too' },
    { questionIndex: 28, text: 'मिनटों में होश — सामान्य पोस्ट-इक्टल; आराम दें, पानी पिलाएं, होश आने पर ही खाना', textEn: 'Alert within minutes — normal post-ictal state; allow rest, offer water, food only after full alertness' },
    // EPL05 q29
    { questionIndex: 29, text: 'अजीब गंध/स्वाद या पेट में उठाव — यही चेतावनी (आयुरा) है; यह महसूस होते ही सुरक्षित जगह ढूंढकर बैठ/लेट जाएं', textEn: 'Odd smell/taste or a rising belly feeling — this is the warning (aura); the moment it starts, find a safe spot and sit or lie down' },
    { questionIndex: 29, text: 'बिना कोई चेतावनी — गिरने से बचाव ही सुरक्षा है; सीढ़ियां/ऊंचाई/पानी से दूर रहें, शावर में दरवाजा खुला रखें', textEn: 'No warning at all — fall prevention is the protection; stay off stairs/heights/water, keep the bathroom door unlocked' },
    // EPL06 q30
    { questionIndex: 30, text: '2+ साल बिना दौरा — दवा घटाने की बात डॉक्टर से हो सकती है — हमेशा धीरे-धीरे, कभी अचानक नहीं', textEn: '2+ years seizure-free — dose reduction may be discussed with the doctor — always gradual, never abrupt' },
    { questionIndex: 30, text: 'हाल में दौरे थे — दवा जारी रखें; नींद-समय और दवा-समय नियत करें', textEn: 'Recent seizures — continue medicines; fix regular sleep and medicine timings' },
    // EPL06 q31
    { questionIndex: 31, text: 'खुराकें छूट रही हैं — फोन में एलार्म लगाएं; छूटी खुराक दोगुनी लेना खतरनाक है', textEn: 'Doses being missed — set phone alarms; doubling a missed dose is dangerous' },
    { questionIndex: 31, text: 'कोई खुराक नहीं छूटी — बढ़िया; दवा बंद करने का निर्णय कभी खुद न लें', textEn: 'No missed doses — excellent; never decide to stop the medicine on your own' },
    // STR01 q32 — stroke rehab
    { questionIndex: 32, text: '3-6 महीने के भीतर — पुनर्वास का सुनहरा समय; फिजियोथेरेपी/ऑक्यूपेशनल थेरेपी नियमित रखें', textEn: 'Within 3-6 months — golden rehabilitation window; keep physiotherapy/occupational therapy regular' },
    { questionIndex: 32, text: '1 साल से ज्यादा — अभ्यास जारी रखें; रोज़ की गतिविधियों में सुधार अब भी संभव है', textEn: 'Beyond 1 year — keep practising; gains in daily activities are still possible' },
    // STR01 q33
    { questionIndex: 33, text: 'ताकत लौट रही है — व्यायाम जारी रखें; BP/शुगर नियंत्रण में रखें — दूसरा स्ट्रोक रोकना लक्ष्य है', textEn: 'Strength returning — continue exercises; keep BP/sugar controlled — preventing a second stroke is the goal' },
    { questionIndex: 33, text: 'ताकत बहुत कम — फिजियो तेज करें; बिस्तर पर हर 2 घंटे करवट — दबाव-घाव से बचाव; रोज़ त्वचा जांचें', textEn: 'Very little strength — intensify physio; turn in bed every 2 hours — prevent pressure sores; check skin daily' },
    // STR02 q34 — thrombolysis window / ACT-FAST
    { questionIndex: 34, text: 'कमजोरी पिछले 4.5 घंटे में शुरू हुई — 108 पर अभी एम्बुलेंस बुलाएं; यही खिड़की में झटका-इलाज (थ्रॉम्बोलिसिस) अस्पताल में संभव है', textEn: 'Weakness began within the last 4.5 hours — call 108 ambulance NOW; clot-busting treatment is possible only inside this window' },
    { questionIndex: 34, text: 'समय पार हो चुका — फिर भी आज ही अस्पताल; इलाज से दूसरा स्ट्रोक रुकता है — घर पर इंतज़ार नहीं', textEn: 'Window passed — still reach hospital today; treatment prevents the next stroke — do not wait at home' },
    // STR02 q35 — FAST
    { questionIndex: 35, text: 'बोलने/समझने में दिक्कत + कमजोरी — FAST याद रखें: चेहरा टेढ़ा, बांह कमजोरी, बोली लड़खड़, समय — 108 तुरंत; मुंह से खाना-पानी न दें', textEn: 'Speech/understanding trouble + weakness — remember FAST: Face droop, Arm weakness, Speech slur, Time — call 108 now; nothing by mouth' },
    { questionIndex: 35, text: 'सिर्फ कमजोरी — फिर भी 108 ही रास्ता है; शुरुआत का सटीक समय नोट करके डॉक्टर को बताएं', textEn: 'Weakness only — 108 is still the way; note and report the exact time symptoms began' },
    // STR03 q36
    { questionIndex: 36, text: 'बोली अभी-अभी लड़खड़ाई — समय = दिमाग — 108 को तुरंत बुलाएं, 4.5 घंटे की दौड़ जारी है', textEn: 'Speech just became slurred — time = brain — call 108 immediately, the 4.5-hour race is on' },
    { questionIndex: 36, text: 'कई दिनों से लड़खड़ — आज ही न्यूरो जांच; नया/बदला लक्षण दिखे तो तुरंत 108', textEn: 'Slurred for days — neuro evaluation today; call 108 at once if symptoms are new or changing' },
    // STR03 q37
    { questionIndex: 37, text: 'मुस्कान में एक तरफ ढलान — फेशियल ड्रूप — FAST का F — 108 अभी बुलाएं', textEn: 'One side droops on smiling — facial droop — the F in FAST — call 108 now' },
    { questionIndex: 37, text: 'चेहरा समान है — अच्छा; फिर भी लड़खड़ी बोली की जांच आज ही कराएं — कल नहीं', textEn: 'Face looks symmetric — good; still get the slurred speech checked today — not tomorrow' },
    // STR04 q38
    { questionIndex: 38, text: 'चेहरा घंटों पहले टेढ़ा हुआ — स्ट्रोक जांच आपात — 108 एम्बुलेंस, अस्पताल अभी', textEn: 'Face drooped hours ago — emergency stroke assessment — 108 ambulance, hospital now' },
    { questionIndex: 38, text: 'दिनों से धीरे-धीरे टेढ़ा हो रहा है — न्यूरो जांच शीघ्र — यह हफ्ता नहीं, जल्द', textEn: 'Drooping gradually over days — neuro assessment soon — not this week, sooner' },
    // STR04 q39
    { questionIndex: 39, text: 'आंख पूरी बंद नहीं होती — बेल पाल्सी का पैटर्न; आंख की सुरक्षा करें (नम आई-ड्रॉप + रात में पैच) और न्यूरो रेफर', textEn: 'Eye will not fully close — Bell palsy pattern; protect the eye (lubricating drops + night patch) and take neuro referral' },
    { questionIndex: 39, text: 'आंख पूरी बंद हो जाती है — स्ट्रोक-पैटर्न चेहरा हो सकता है — 108 तुरंत; परीक्षा के बाद ही निष्कर्ष', textEn: 'Eye closes fully — may be a stroke-pattern face — 108 immediately; let examination decide' },
    // STR05 q40 — TIA
    { questionIndex: 40, text: 'मिनटों-घंटों में पूरा ठीक — यह TIA चेतावनी-दौरा है; आज ही भर्ती/जांच — आधे TIA मरीज़ों को अगले हफ्तों में स्ट्रोक आ सकता है', textEn: 'Fully resolved in minutes-hours — this is a TIA warning spell; admission/workup TODAY — half of TIA patients can stroke in the following weeks' },
    { questionIndex: 40, text: 'लक्षण दोबारा आएँ — बिना इंतज़ार 108; TIA के बाद का स्ट्रोक टालने का इलाज समय पर ही चलता है', textEn: 'If symptoms return — 108 without waiting; treatment that prevents post-TIA stroke works only in time' },
    // STR05 q41
    { questionIndex: 41, text: 'BP/शुगर/धूम्रपान — तीनों छोटे-दौरे के बड़े दुश्मन; आज से नियंत्रण शुरू करें, दवा न छोड़ें', textEn: 'BP/sugar/smoking — three big enemies of mini-stroke; start control today, do not skip medicines' },
    { questionIndex: 41, text: 'ये इतिहास नहीं — दिल की धड़कन की जांच (ECG/हॉल्टर) फिर भी जरूरी — कारण ढूंढना ही इलाज है', textEn: 'No such history — heart-rhythm testing (ECG/Holter) is still essential — finding the cause IS the treatment' },
    // STR06 q42 — Bell palsy
    { questionIndex: 42, text: '1-3 दिन में बढ़ा — बेल पाल्सी पैटर्न; न्यूरो जांच इसी हफ्ते — आंख की सुरक्षा तब तक जारी', textEn: 'Built over 1-3 days — Bell palsy pattern; neuro assessment this week — keep protecting the eye meanwhile' },
    { questionIndex: 42, text: 'सेकंडों में आया — पहले स्ट्रोक निकालें — 108; फेशियल पैरिसिस की वजह परीक्षा से तय होगी', textEn: 'Came on within seconds — rule out stroke first — 108; the cause of facial weakness will be settled by examination' },
    // STR06 q43
    { questionIndex: 43, text: 'कान दर्द/आवाज़ भारी लगना — रैमसे हंट संभव — तुरंत न्यूरो; आंख और कान दोनों की देखभाल जरूरी', textEn: 'Ear pain/sound intolerance — possible Ramsay Hunt — neuro urgently; both eye and ear care needed' },
    { questionIndex: 43, text: 'कान सामान्य — आंख की सुरक्षा जारी रखें; आई-ड्रॉप न छोड़ें, रात में पैच लगाएं', textEn: 'Ear normal — continue eye protection; do not skip eye drops, patch at night' },
    // NMN01 q44 — carpal tunnel
    { questionIndex: 44, text: 'हिलाने से आराम — कार्पल टनल का क्लासिक संकेत; रात में कलाई-स्प्लिंट पहनें और नर्व टेस्ट (NCS) कराएं', textEn: 'Relief on shaking — classic carpal tunnel sign; wear a night wrist splint and get nerve conduction testing (NCS)' },
    { questionIndex: 44, text: 'हिलाने से नहीं बदलता — गर्दन की जड़ की जांच भी कराएं', textEn: 'Shaking does not help — also evaluate the neck nerve root' },
    // NMN01 q45
    { questionIndex: 45, text: 'अंगूठा-तर्जनी-बीच की उंगली — कार्पल टनल पैटर्न; टाइपिंग/साइकिल में कलाई सीधी रखें', textEn: 'Thumb-index-middle fingers — carpal tunnel pattern; keep the wrist straight while typing or cycling' },
    { questionIndex: 45, text: 'पूरा हाथ/कनिष्ठा उंगली तक — गर्दन की जड़ की जांच कराएं', textEn: 'Whole hand up to the little finger — get the neck nerve root evaluated' },
    // NMN02 q46 — burning feet
    { questionIndex: 46, text: 'शुगर नहीं जांची — HbA1c/फास्टिंग कराएं; जलते पैरों का सबसे आम कारण मधुमेह है', textEn: 'Sugar not tested — get HbA1c/fasting done; diabetes is the most common cause of burning feet' },
    { questionIndex: 46, text: 'शुगर है — शुगर नियंत्रण ही आधा इलाज है; दवा-भोजन-टहल नियमित रखें, रोज़ पैर जांचें', textEn: 'Diabetes present — sugar control is half the treatment; keep medicine-meals-walk regular and inspect feet daily' },
    // NMN02 q47
    { questionIndex: 47, text: 'रात में जलन, चादर से पैर बाहर — न्यूरोपैथी पैटर्न; पैर गुनगुने पानी से धोएं — गर्म पानी जलन बढ़ाता है, पानी का तापमान कोहनी से नापें', textEn: 'Nighttime burning, feet out of the blanket — neuropathy pattern; wash feet in lukewarm water — hot water worsens it, gauge temperature with the elbow' },
    { questionIndex: 47, text: 'दिन-रात बराबर — B12/थायरॉइड भी जांचें; शाकाहारी भोजन में B12 कम रहता है', textEn: 'Same day and night — also test B12/thyroid; vegetarian diets often run low on B12' },
    // NMN03 q48 — claudication screen
    { questionIndex: 48, text: 'चलने पर झनझनाहट/दर्द जो बैठने से जाता है — नस नहीं, पैर की नस-नली (धमनी) की कमी हो सकती है — पैर की नाड़ी/डॉप्लर जांच', textEn: 'Tingling/pain on walking relieved by rest — may be artery insufficiency (claudication), not nerve — get foot pulses/doppler checked' },
    { questionIndex: 48, text: 'थोड़ी दूरी पर ही शुरू — धूम्रपान आज ही बंद (सबसे बड़ा कारण); वास्कुलर जांच शीघ्र कराएं', textEn: 'Starts after a short distance — stop smoking TODAY (the biggest cause); get a vascular assessment soon' },
    // NMN03 q49
    { questionIndex: 49, text: 'घाव देर से भरते हैं — पैरों की नाड़ी और संवेदना जांच; घर के अंदर भी हमेशा जूते-मोजे पहनें', textEn: 'Wounds heal slowly — check foot pulses and sensation; wear slippers/shoes even indoors' },
    { questionIndex: 49, text: 'कोई घाव नहीं — अच्छा; रोज़ रात पैरों को देखकर सोने की आदत डालें', textEn: 'No wounds — good; build the habit of inspecting the feet every night before bed' },
    // NMN04 q50 — sciatica
    { questionIndex: 50, text: 'पीठ से उंगलियों तक — सायटिका (डिस्क दबाना) संभव; झुकना-मोड़ना और भारी उठाना कम करें, सख्त बिस्तर पर लेटें', textEn: 'Back down to the toes — likely sciatica (disc pressure); cut bending-twisting and heavy lifting, sleep on a firm mattress' },
    { questionIndex: 50, text: 'घुटने तक ही रहता है — मांसपेशी भी हो सकती है; हल्की स्ट्रेचिंग + मुद्रा सुधार आजमाएं', textEn: 'Stops at the knee — may be muscular; try gentle stretching + posture correction' },
    // NMN04 q51
    { questionIndex: 51, text: 'खांसी/छींक से पैर में तेज़ शूट — डिस्क हर्निएशन का संकेत — MRI की जरूरत पर डॉक्टर से पूछें', textEn: 'Cough/sneeze shoots pain down the leg — disc herniation sign — ask the doctor whether MRI is needed' },
    { questionIndex: 51, text: 'नहीं बढ़ता — सामान्य सायटिका; गर्म सेक + हल्की चलना जारी रखें, पूरा बिस्तर-आराम नहीं', textEn: 'Not worsened — ordinary sciatica; hot fomentation + keep gently mobile, not complete bed rest' },
    // NMN05 q52 — cervical radiculopathy
    { questionIndex: 52, text: 'गर्दन हिलाने से हाथ में झनझनाहट — सर्वाइकल रेडिक्युलोपैथी; नरम कॉलर + गर्दन की X-ray सोचें', textEn: 'Neck movement firing tingling into the arm — cervical radiculopathy; soft collar + consider neck X-ray' },
    { questionIndex: 52, text: 'गर्दन से नहीं बदलता — कंधे/कोहनी की जांच भी करा लें', textEn: 'Neck movement does not change it — also get the shoulder/elbow checked' },
    // NMN05 q53
    { questionIndex: 53, text: 'पकड़ कमजोर पड़ रही है — दबाना बढ़ रहा है — न्यूरो जांच जल्द कराएं', textEn: 'Grip weakening — the compression is progressing — get neuro assessment soon' },
    { questionIndex: 53, text: 'पकड़ सामान्य — अच्छा; मुद्रा और स्क्रीन की ऊंचाई सुधारते रहें', textEn: 'Grip normal — good; keep correcting posture and screen height' },
    // NMN06 q54 — GBS screen
    { questionIndex: 54, text: 'कमजोरी पैरों से ऊपर चढ़ रही है — गिलेन-बैरे सिंड्रोम हो सकता है — 108 इमरजेंसी आज ही; सांस की दिक्कत हो तो एक मिनट न रुकें', textEn: 'Weakness climbing upward from the legs — possible Guillain-Barre syndrome — 108 emergency today; if breathing gets difficult, do not wait a minute' },
    { questionIndex: 54, text: 'एक तरफ/एक हाथ में — परिधीय नस या मोटर न्यूरॉन की जांच — न्यूरो रेफर, देर न करें', textEn: 'Confined to one side/one limb — peripheral nerve or motor neuron workup — neuro referral without delay' },
    // NMN06 q55
    { questionIndex: 55, text: 'सीढ़ी/कुर्सी से उठना मुश्किल — जांघ की मांसपेशियों की जांच (CK रक्त जांच सहित) जरूरी', textEn: 'Trouble with stairs or rising from a chair — thigh muscle evaluation needed (including blood CK test)' },
    { questionIndex: 55, text: 'चलना सामान्य — बढ़ती कमजोरी को तारीखवार डायरी में नोट करें — डॉक्टर को यही काम आता है', textEn: 'Walking is fine — track any worsening weakness in a dated diary — that record is exactly what the doctor needs' },
    // NMN07 q56 — double vision
    { questionIndex: 56, text: 'अचानक शुरू दो दिखना — दिमागी कारण निकालना है — तुरंत न्यूरो + इमेजिंग; गाड़ी तब तक बिल्कुल नहीं', textEn: 'Double vision of sudden onset — a brain cause must be ruled out — urgent neuro + imaging; absolutely no driving until then' },
    { questionIndex: 56, text: 'धीरे-धीरे शुरू — आंख की मांसपेशी (मायस्थीनिया) जांच — न्यूरो रेफर', textEn: 'Gradual onset — eye-muscle (myasthenia) evaluation — neuro referral' },
    // NMN07 q57
    { questionIndex: 57, text: 'एक आंख बंद करने से दो दिखना खत्म — आंख की पेशी/नस की समस्या — न्यूरो-ऑकुलर जांच', textEn: 'Closing one eye stops it — an eye muscle/nerve problem — neuro-ocular evaluation' },
    { questionIndex: 57, text: 'बंद करने पर भी दो दिखता है — पहले चश्मे/लेंस की जांच करवाएं, फिर न्यूरो', textEn: 'Persists even with one eye closed — get glasses/lens checked first, then neuro' },
    // NMN08 q58 — myasthenia screen
    { questionIndex: 58, text: 'पलक शाम को और झुक जाती है — मायस्थीनिया ग्रेविस का संकेत — न्यूरो रेफर जरूरी, इसी हफ्ते', textEn: 'Lid drooping more by evening — a sign of myasthenia gravis — neuro referral needed, this week' },
    { questionIndex: 58, text: 'सुबह-शाम एक जैसी — जन्मजात/उम्र की झुकाव हो सकती है — न्यूरो मूल्यांकन से पक्का करें', textEn: 'Same morning and evening — may be congenital/age-related droop — confirm with neuro evaluation' },
    // NMN08 q59
    { questionIndex: 59, text: 'चबाने/बोलने में थकान — मायस्थीनिया का अक्सर पहला संकेत — आज ही न्यूरो; सांस/निगलने में दिक्कत = आपात', textEn: 'Tiring while chewing or speaking — often the first sign of myasthenia — neuro today; breathing or swallowing trouble = emergency' },
    { questionIndex: 59, text: 'कोई थकान नहीं — केवल पलक की जांच काफी हो सकती है; निगरानी जारी रखें', textEn: 'No such fatigue — eyelid-only assessment may suffice; continue watchful follow-up' },
    // NMN09 q60 — head injury
    { questionIndex: 60, text: 'बेहोशी 30 मिनट से ज्यादा / आज उल्टी-भ्रम है — CT तुरंत — 108; इंतज़ार खतरनाक है', textEn: 'Unconsciousness over 30 minutes / vomiting-confusion today — CT now — 108; waiting is dangerous' },
    { questionIndex: 60, text: 'हल्की चोट, बेहोशी नहीं — फिर भी 48 घंटे किसी बड़े की निगरानी; सोते हुए मरीज़ को हर 2-3 घंटे जगाकर देखें', textEn: 'Mild injury, no unconsciousness — still 48 hours of watch by an adult; wake the patient every 2-3 hours to check' },
    // NMN09 q61
    { questionIndex: 61, text: 'बढ़ता सिरदर्द/उल्टी/भूलना चोट के बाद — CT दोहराना जरूरी — आज; देर = रक्तस्राव फैल सकता है', textEn: 'Worsening headache/vomiting/forgetfulness after injury — repeat CT needed — today; delay can let a bleed expand' },
    { questionIndex: 61, text: 'कोई नई शिकायत नहीं — काम/पढ़ाई पर धीरे-धीरे लौटें (return-to-work plan)', textEn: 'No new complaints — return to work/study gradually (return-to-work plan)' },
    // NMN10 q62
    { questionIndex: 62, text: 'रिपोर्ट की मुख्य बात डॉक्टर को बताएं; CD/फिल्म हर मुलाकात में साथ रखें', textEn: 'Tell the doctor the main finding of the report; keep the CD/film with you at every visit' },
    { questionIndex: 62, text: 'रिपोर्ट खो गई — जांच केंद्र से डुप्लिकेट लें; आगे की पूरी योजना उसी पर टिकी है', textEn: 'Report lost — get a duplicate from the imaging center; the entire forward plan hangs on it' },
    // NMN10 q63
    { questionIndex: 63, text: 'CD/रिपोर्ट साथ है — बढ़िया; पुरानी रिपोर्ट भी लाएं — तुलना से बदलाव साफ दिखता है', textEn: 'CD/report in hand — excellent; bring older reports too — comparison makes change visible' },
    { questionIndex: 63, text: 'भूल गए — अगली मुलाकात में जरूर लाएं; तब तक रिपोर्ट का फोटो भेज दें', textEn: 'Forgotten — bring it next visit for sure; meanwhile send a photo of the report' },
    // VTS01 q64 — BPPV
    { questionIndex: 64, text: 'बिस्तर पलटने पर सेकंडों के चक्कर — BPPV पैटर्न; धीरे पलटें, सिर ऊपर रखकर सोएं, बिस्तर से धीरे उठें', textEn: 'Seconds of spins on turning in bed — BPPV pattern; turn slowly, sleep with the head raised, rise from bed gently' },
    { questionIndex: 64, text: 'हर मुड़ने पर चक्कर — Epley मनुवर डॉक्टर से सीखें — घर पर भी किया जाता है, अक्सर जड़ से लाभ', textEn: 'Spins on every head turn — learn the Epley maneuver from the doctor — it can be done at home and often fixes the root' },
    // VTS01 q65
    { questionIndex: 65, text: '1 मिनट से कम का चक्कर — BPPV जैसा; घबराएं नहीं — अचानक उठना/झुकना बंद करें', textEn: 'Spin under a minute — BPPV-like; do not panic — stop sudden rising and bending' },
    { questionIndex: 65, text: 'मिनटों-घंटों का चक्कर — अन्य कारण (मेनियर/नस की बीमारी) — ENT + न्यूरो जांच', textEn: 'Spins lasting minutes-hours — other cause (Meniere/nerve disease) — ENT + neuro evaluation' },
    // VTS02 q66 — Meniere screen
    { questionIndex: 66, text: 'कान भरापन + सुनने में कमी — मेनियर रोग संभव — ENT जांच जरूरी; नमक कम करें', textEn: 'Ear fullness + hearing drop — possible Meniere disease — ENT evaluation needed; cut down salt' },
    { questionIndex: 66, text: 'कान सामान्य — BPPV की संभावना बनी रहती है; जांच जारी रखें', textEn: 'Ear normal — BPPV remains the likely cause; continue the workup' },
    // VTS02 q67
    { questionIndex: 67, text: 'दौरे में सुनाई और कम — मेनियर का संकेत — तुरंत जांच; कैफीन/नमक कम, साइकिल अभी नहीं', textEn: 'Hearing drops further during attacks — Meniere sign — seek evaluation now; less caffeine/salt, no cycling for now' },
    { questionIndex: 67, text: 'सुनने में कोई बदलाव नहीं — BPPV पैटर्न; पुनर्वस्थापन व्यायाम जारी रखें', textEn: 'Hearing unchanged during attacks — BPPV pattern; continue repositioning exercises' },
    // VTS03 q68 — orthostatic
    { questionIndex: 68, text: 'बैठने/लेटने से ठीक — खड़े होने के चक्कर — पानी 2-3 लीटर/दिन + नमक पर्याप्त; बिस्तर पर पैर मोवने-बैठने के बाद ही उठें', textEn: 'Settles on sitting/lying — standing spells — 2-3 L water daily + adequate salt; sit up, swing legs, then stand slowly' },
    { questionIndex: 68, text: 'बैठने पर भी चक्कर — लेटे और खड़े होकर BP जांच (orthostatic test) कराएं', textEn: 'Dizzy even when seated — get lying and standing BP checked (orthostatic test)' },
    // VTS03 q69
    { questionIndex: 69, text: 'BP दवा बदली/बढ़ी — डॉक्टर को दवा का नाम-खुराक बताएं; सुबह-शाम 3 दिन BP रिकॉर्ड करें', textEn: 'BP medicine changed/increased — tell the doctor the name-dose; record BP morning and evening for 3 days' },
    { questionIndex: 69, text: 'कोई बदलाव नहीं — पानी की कमी भी कारण होती है; गर्मी में 3 लीटर पानी लक्ष्य रखें', textEn: 'No change — dehydration is also a cause; aim for 3 L water in hot weather' },
    // VTS04 q70 — night imbalance
    { questionIndex: 70, text: 'अंधेरे में चलना और मुश्किल — संवेदी असंतुलन; रात का नाइट-लैंप जरूरी, रास्ते रोशन रखें; B12 जांच कराएं', textEn: 'Walking harder in the dark — sensory imbalance; a night-lamp is essential, keep pathways lit; test B12' },
    { questionIndex: 70, text: 'रोशनी से कोई फर्क नहीं — चाल की जांकरी (gait test) + न्यूरो मूल्यांकन जरूरी', textEn: 'No difference with lighting — gait testing + neuro evaluation needed' },
    // VTS04 q71
    { questionIndex: 71, text: 'शाम को धुंधला दिखता है — रेटिना/विटामिन A जांच — आंख विशेषज्ञ', textEn: 'Blurry at dusk — retina/vitamin A check — eye specialist' },
    { questionIndex: 71, text: 'देखने में सामान्य — सहारे के पास खड़े होकर संतुलन-व्यायाम (एक पैर पर 10 सेकंड) शुरू करें', textEn: 'Vision normal — start balance exercises near support (10 seconds on each leg)' },
    // VTS05 q72 — RLS
    { questionIndex: 72, text: 'हिलाने से आराम — बेचैन-पैर संलक्षण (RLS); शाम की चाय/कॉफी बंद करें, आयरन जांच कराएं', textEn: 'Relief on moving — restless legs syndrome (RLS); stop evening tea/coffee, get iron tested' },
    { questionIndex: 72, text: 'हिलाने पर भी बेचैनी — दवा समीक्षा कराएं (एलर्जी की कुछ गोलियां/कुछ एंटीडिप्रेसेंट इसे बढ़ाते हैं)', textEn: 'Still restless after moving — review your medicines (some allergy tablets/some antidepressants worsen it)' },
    // VTS05 q73
    { questionIndex: 73, text: '6 घंटे से कम नींद — कम नींद दौरे, सिरदर्द और बेचैन-पैर तीनों बढ़ाती है; सोने-जागने का समय नियत करें', textEn: 'Under 6 hours of sleep — poor sleep worsens seizures, headaches and restless legs; fix sleep and wake times' },
    { questionIndex: 73, text: '7-8 घंटे की नींद — अच्छा; सोने से 1 घंटा पहले स्क्रीन बंद, कमरा अंधेरा रखें', textEn: '7-8 hours of sleep — good; screens off 1 hour before bed, keep the room dark' },
    // MOV01 q74 — Parkinson screen
    { questionIndex: 74, text: 'आराम की हालत में कांपन (हाथ गोद में रखने पर भी) — पार्किंसन जांच जरूरी — न्यूरो रेफर', textEn: 'Tremor at rest (present even with the hand resting in the lap) — Parkinson workup needed — neuro referral' },
    { questionIndex: 74, text: 'काम करते समय ही कांपन — काम-कांपन (एसेंशियल) जैसा; चाय/कॉफी घटाएं, नींद पूरी करें', textEn: 'Tremor only during action — action (essential) type; cut tea/coffee and complete your sleep' },
    // MOV01 q75
    { questionIndex: 75, text: 'अंगूठा-उंगलियों की गोल घुमाव (गोली घुमाने जैसी) — पार्किंसन का चिन्ह — शीघ्र न्यूरो', textEn: 'A pill-rolling rotation of thumb and fingers — a hallmark of Parkinson disease — see neuro soon' },
    { questionIndex: 75, text: 'इससे अलग कांपन — थायरॉइड/दवा-प्रेरित कांपन भी जांचें', textEn: 'A different tremor pattern — also test thyroid and medicine-induced tremor' },
    // MOV02 q76 — essential/familial
    { questionIndex: 76, text: 'परिवार में और भी कांपन — फैमिलियल/एसेंशियल ट्रेमर; चाय-कॉफी कम करने से घटता है, काम पर असर कम', textEn: 'Others in the family tremble too — familial/essential tremor; it lessens with less tea-coffee and rarely disables' },
    { questionIndex: 76, text: 'परिवार में किसी को नहीं — थायरॉइड/दवा-कांपन की जांच कराएं', textEn: 'Nobody in the family — test for thyroid/medicine-induced tremor' },
    // MOV02 q77
    { questionIndex: 77, text: 'चाय/कॉफी से बढ़ता है — दिन में 1-2 कप तक घटाएं; रात की कॉफी पूरी तरह बंद', textEn: 'Worsens with tea/coffee — cut down to 1-2 cups a day; night coffee completely off' },
    { questionIndex: 77, text: 'कैफीन से नहीं बदलता — जांच जारी रखें; नींद की कमी भी कांपन बढ़ाती है', textEn: 'Unchanged by caffeine — continue the workup; sleep loss also feeds tremor' },
    // MOV03 q78 — Parkinson workup
    { questionIndex: 78, text: 'एक बांह कम हिलना / कदम रुक-रुक चलना — पार्किंसन के चाल-संकेत — न्यूरो जांच शीघ्र कराएं', textEn: 'One arm swinging less / feet shuffling and freezing — Parkinson gait signs — get neuro assessment soon' },
    { questionIndex: 78, text: 'चाल सामान्य — अकड़न के अन्य कारण (दवा/गठिया) — जांच जारी रखें', textEn: 'Gait normal — other causes of stiffness (medicines/arthritis) — continue the workup' },
    // MOV03 q79
    { questionIndex: 79, text: 'लिखाई छोटी हो गई / गंध कम पहचानते हैं — पार्किंसन के शुरुआती संकेत — न्यूरो भेजना जरूरी', textEn: 'Handwriting become smaller / smell detection reduced — early Parkinson signs — neuro referral needed' },
    { questionIndex: 79, text: 'दोनों सामान्य — अच्छा; साल में एक बार चाल-अकड़न जांच दोहराते रहें', textEn: 'Both normal — good; keep repeating a gait-stiffness check once a year' },
    // MOV04 q80 — memory screen
    { questionIndex: 80, text: '3 शब्द याद नहीं रहे / तारीख नहीं पता — औपचारिक स्मृति परीक्षण (MMSI जैसा) कराएं — न्यूरो रेफर', textEn: 'Could not hold 3 words / unsure of the date — get formal memory testing (MMSE-type) — neuro referral' },
    { questionIndex: 80, text: 'याद रख पाए — उम्र के अनुकूल सामान्य लापरवाही जैसा; फिर भी आधार-स्कोर रिकॉर्ड करवा लें', textEn: 'Held the words — appears like normal age-consistent lapses; still record a baseline score' },
    // MOV04 q81
    { questionIndex: 81, text: 'गैस/नल खुला छूटते हैं — सुरक्षा: टाइमर-स्विच/ऑटो-शट लगवाएं; डिमेंशिया मूल्यांकन जरूरी', textEn: 'Leaving gas stove/taps running — safety: fit timer switches/auto-shut valves; dementia evaluation essential' },
    { questionIndex: 81, text: 'नहीं छूटते — अच्छा; दिमाग तेज़ रखें: रोज़ 3 नई बातें सीखें, सुडोकू/शब्द-खेल, सामाजिक मेल-जोल', textEn: 'Not left running — good; keep the brain busy: learn 3 new things daily, word games, stay socially active' },
    // MOV05 q82 — dementia screen
    { questionIndex: 82, text: 'रोज़ का काम प्रभावित — डिमेंशिया जांच शीघ्र कराएं; मुलाकात पर परिवार का कोई सदस्य साथ आए', textEn: 'Daily work affected — get dementia assessment soon; bring a family member to the visit' },
    { questionIndex: 82, text: 'काम ठीक चलता है — हल्की उम्र-संबंधी लापरवाही हो सकती है; 6 महीने में दोहराई जांच रखें', textEn: 'Work unaffected — likely mild age-related lapses; keep a repeat check in 6 months' },
    // MOV05 q83
    { questionIndex: 83, text: 'जाना-पहचाना रास्ता भूल जाते हैं — डिमेंशिया का बड़ा संकेत — न्यूरो जांच जरूरी', textEn: 'Losing the way on familiar routes — a major dementia sign — neuro evaluation needed' },
    { questionIndex: 83, text: 'रास्ता याद रहता है — अच्छा; लंबे अकेले सफर में साथी रखें, फोन में घर-पता सेव करें', textEn: 'Routes remembered — good; keep a companion on long solo trips and save the home address in the phone' },
    // MOV06 q84 — child milestone delay
    { questionIndex: 84, text: 'बैठना/बोलना/चलना उम्र के अनुसार नहीं — बाल-न्यूरो विशेषज्ञ को जल्द दिखाएं; छोटी उम्र में इलाज सबसे ज्यादा काम करता है', textEn: 'Not sitting/talking/walking as per age — see a pediatric neurologist early; intervention works best at the youngest age' },
    { questionIndex: 84, text: 'लक्षण समय पर — अच्छा; टीका-रिकॉर्ड और वजन-चार्ट हर मुलाकात में साथ रखें', textEn: 'Milestones on time — good; keep vaccine records and weight charts at every visit' },
    // MOV06 q85
    { questionIndex: 85, text: 'बोलना/चलना देर से शुरू — पहले सुनने की जांच, फिर विकास-मूल्यांकन — बाल-न्यूरो रेफर', textEn: 'Talking/walking started late — hearing test first, then developmental assessment — pediatric neuro referral' },
    { questionIndex: 85, text: 'सब सामान्य रहा — 6 महीने में स्क्रीनिंग दोहराते रहें', textEn: 'All was normal — keep repeating the screening every 6 months' },
    // MOV07 q86 — PD follow-up
    { questionIndex: 86, text: 'दवा का असर 4 घंटे से पहले खत्म — डॉक्टर को बताएं; चालू-बंद (on-off) डायरी घंटेवार नोट करें', textEn: 'Dose wearing off before 4 hours — inform the doctor; keep an hourly on-off diary' },
    { questionIndex: 86, text: 'असर पूरा रहता है — दवा-समय रिकॉर्ड जारी रखें; दवा कभी अचानक बंद नहीं — वरना गंभीर प्रतिक्रिया', textEn: 'Effect lasts fully — continue the dose-time diary; never stop the medicine suddenly — severe withdrawal reactions occur' },
    // MOV07 q87 — protein timing
    { questionIndex: 87, text: 'दवा प्रोटीन-भोजन (दाल/दूध/अंडा/मांस) से 1 घंटा पहले या बाद लें — प्रोटीन दवा का अवशोषण घटाता है', textEn: 'Take the medicine 1 hour before or after protein meals (dal/milk/egg/meat) — protein reduces its absorption' },
    { questionIndex: 87, text: 'समय नहीं साध पाते — खाने का घंटा आगे-पीछे करके दवा का समय नियत रखें; रिकॉर्ड डॉक्टर को दिखाएं', textEn: 'Unable to time it — shift the meal hour so the medicine time stays fixed; show the record to the doctor' },
  ],

  // ══ Labels (12) ══════════════════════════════════════════════════════
  labels: [
    { label: 'दर्द स्कोर', labelEn: 'Pain Score', unit: '/10' },
    { label: 'माह में सिरदर्द दिन', labelEn: 'Headache Days per Month', unit: 'days' },
    { label: 'माह में दौरे', labelEn: 'Seizure Frequency per Month', unit: '/month' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'कांपन ग्रेड', labelEn: 'Tremor Grade (0-4)', unit: '/4' },
    { label: 'मांसपेशी शक्ति ग्रेड (MRC)', labelEn: 'Muscle Power Grade (MRC 0-5)', unit: '/5' },
    { label: 'चाल स्कोर', labelEn: 'Gait Score', unit: '/10' },
    { label: 'स्मृति स्कोर', labelEn: 'Memory Score', unit: '/30' },
    { label: 'वाणी स्पष्टता', labelEn: 'Speech Clarity', unit: '/10' },
  ],

  // ══ Findings (39) — 19 managed + 20 refer-only ═══════════════════════
  // REFER-ONLY findings intentionally carry ZERO findingMeds links —
  // emergencies get 108/referral, not prescriptions from this pack.
  findings: [
    // — Managed (may link medicines) —
    { key: 'MIGRAINE', name: 'माइग्रेन', nameEn: 'Migraine', icd10: 'G43.9' },
    { key: 'TENSION-HA', name: 'तनाव-प्रकार सिरदर्द', nameEn: 'Tension-type Headache', icd10: 'G44.2' },
    { key: 'HA-NOS', name: 'अनिर्दिष्ट सिरदर्द', nameEn: 'Headache NOS', icd10: 'R51' },
    { key: 'MOH', name: 'दवा-अधिक सिरदर्द (MOH)', nameEn: 'Medication-Overuse Headache', icd10: 'G47' },
    { key: 'EPILEPSY-FU', name: 'मिर्गी — दवा पर फॉलो-अप', nameEn: 'Epilepsy on Treatment (Follow-up)', icd10: 'G40.9' },
    { key: 'STROKE-FU', name: 'स्ट्रोक रिकवरी फॉलो-अप', nameEn: 'Stroke Recovery Follow-up', icd10: 'I63.9' },
    { key: 'HEMIPLEGIA-FU', name: 'पक्षाघात फॉलो-अप (पुनर्वास)', nameEn: 'Hemiplegia Follow-up (Rehab)', icd10: 'G81.9' },
    { key: 'DIABETIC-NEURO', name: 'मधुमेही न्यूरोपैथी (हल्की)', nameEn: 'Diabetic Neuropathy (mild)', icd10: 'E11.4+G63.2' },
    { key: 'BPPV', name: 'BPPV (स्थितिजन्य चक्कर)', nameEn: 'BPPV (Positional Vertigo)', icd10: 'H81.1' },
    { key: 'ORTHOSTATIC-DIZZY', name: 'ऑर्थोस्टैटिक चक्कर', nameEn: 'Orthostatic Dizziness', icd10: 'R42' },
    { key: 'TN', name: 'ट्राइजेमिनल न्यूरैल्जिया', nameEn: 'Trigeminal Neuralgia', icd10: 'G50.0' },
    { key: 'ET', name: 'एसेंशियल ट्रेमर', nameEn: 'Essential Tremor', icd10: 'G25.0' },
    { key: 'RLS', name: 'बेचैन-पैर संलक्षण', nameEn: 'Restless Legs Syndrome', icd10: 'G25.81' },
    { key: 'RADICULOPATHY', name: 'तंत्रिका-मूल दर्द (सायटिका/गर्दन)', nameEn: 'Radiculopathy (Sciatica/Cervical)', icd10: 'G54' },
    { key: 'PD-FU', name: 'पार्किंसन — दवा पर फॉलो-अप', nameEn: 'Parkinson Disease on Treatment', icd10: 'G20' },
    { key: 'DEMENTIA-FU', name: 'डिमेंशिया — दवा पर फॉलो-अप', nameEn: 'Dementia on Treatment', icd10: 'F03' },
    { key: 'HEAD-INJURY-FU', name: 'सिर-चोट पश्चात फॉलो-अप', nameEn: 'Post Head Injury Follow-up', icd10: 'S06.9' },
    { key: 'REHAB-FU', name: 'पुनर्वास फॉलो-अप स्थिति', nameEn: 'Rehabilitation Follow-up Status', icd10: 'Z50' },
    { key: 'INSOMNIA-RLS', name: 'नींद विकार के साथ बेचैन पैर', nameEn: 'Insomnia with Restless Legs', icd10: 'G47.0' },
    // — Refer-only (ZERO findingMeds links) —
    { key: 'CTS-SUSPECT', name: 'कार्पल टनल स्क्रीन — NCS हेतु रेफर', nameEn: 'Carpal Tunnel Screen (NCS Refer)', icd10: 'G56.0' },
    { key: 'SAH-SUSPECT', name: 'सबएराक्नॉइड रक्तस्राव संदिग्ध — आपात CT', nameEn: 'SAH Suspect (Emergency CT)', icd10: 'I60.9' },
    { key: 'MENINGITIS-SUSPECT', name: 'मेनिंजाइटिस संदिग्ध — आपात', nameEn: 'Meningitis Suspect (Emergency)', icd10: 'G03.9' },
    { key: 'RAISED-ICP-SUSPECT', name: 'बढ़ा शिर-दाब संदिग्ध — तत्काल इमेजिंग', nameEn: 'Raised ICP Suspect (Urgent Imaging)', icd10: 'G93.2' },
    { key: 'STROKE-ACUTE', name: 'तीव्र स्ट्रोक — 108, अस्पताल अभी', nameEn: 'Acute Stroke (108 Hospital NOW)', icd10: 'I63.9' },
    { key: 'TIA-ACUTE', name: 'TIA चेतावनी — आज ही भर्ती', nameEn: 'TIA Warning (Same-day Admission)', icd10: 'G45.9' },
    { key: 'SEIZURE-FIRST-EVER', name: 'पहला दौरा — विशेषज्ञ वर्कअप', nameEn: 'First-ever Seizure (Specialist Workup)', icd10: 'R56.9' },
    { key: 'STATUS-EPILEPTICUS', name: 'स्टेटस एपिलेप्टिकस — आपात', nameEn: 'Status Epilepticus (Emergency)', icd10: 'G41.9' },
    { key: 'MG-SUSPECT', name: 'मायस्थीनिया ग्रेविस संदिग्ध — रेफर', nameEn: 'Myasthenia Gravis Suspect (Refer)', icd10: 'G70.0' },
    { key: 'GBS-SUSPECT', name: 'गिलेन-बैरे संदिग्ध — आपात भर्ती', nameEn: 'GBS Suspect (Emergency Admission)', icd10: 'G61.0' },
    { key: 'MS-SUSPECT', name: 'मल्टिपल स्क्लेरोसिस संदिग्ध — रेफर', nameEn: 'MS Suspect (Neuro Refer)', icd10: 'G35' },
    { key: 'BRAIN-TUMOR-FLAGS', name: 'प्रगतिशील फोकल संकेत — इमेजिंग जरूरी', nameEn: 'Progressive Focal Signs (Imaging)', icd10: 'D49.6' },
    { key: 'MOTOR-NEURON-SUSPECT', name: 'मोटर न्यूरॉन रोग संदिग्ध — रेफर', nameEn: 'MND Suspect (Neuro Refer)', icd10: 'G12.2' },
    { key: 'DELIRIUM-ACUTE', name: 'तीव्र भ्रम — चिकित्सा आपात', nameEn: 'Acute Delirium (Medical ER)', icd10: 'F05' },
    { key: 'CHILD-MILESTONE-DELAY', name: 'विकास विलंब — बाल-न्यूरो रेफर', nameEn: 'Developmental Delay (Ped Neuro Referral)', icd10: 'R62.0' },
    { key: 'MYASTHENIA-CRISIS-SUSPECT', name: 'मायस्थीनिक क्राइसिस — आपात', nameEn: 'Myasthenic Crisis Suspect (ER)', icd10: 'G70.0' },
    { key: 'BELLS-SUSPECT', name: 'बेल पाल्सी संदिग्ध — रेफर', nameEn: 'Bell Palsy Suspect (Refer)', icd10: 'G51.0' },
    { key: 'MENIERE-SUSPECT', name: 'मेनियर रोग संदिग्ध — रेफर', nameEn: 'Meniere Disease Suspect (Refer)', icd10: 'H81.0' },
    { key: 'PD-SUSPECT', name: 'पार्किंसन संदिग्ध — वर्कअप रेफर', nameEn: 'Parkinson Suspect (Workup Refer)', icd10: 'G20' },
    { key: 'DEMENTIA-SUSPECT', name: 'डिमेंशिया मूल्यांकन — रेफर', nameEn: 'Dementia Suspect (Eval Refer)', icd10: 'F03' },
    { key: 'DOUBLE-VISION-SUSPECT', name: 'दोहरा दिखना — न्यूरो रेफर', nameEn: 'Double Vision (Neuro Refer)', icd10: 'R44.2' },
  ],

  // ══ Medicines (54) — India neuro OPD core ════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~dispense qty.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  // AEDs / PD / dementia / stroke entries are CONTINUATION-VERIFY framing.
  medicines: [
    // — Migraine acute —
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg — safest headache analgesic; max 4 g/day', doseOptions: ['1 tab (500 mg) SOS', '2 tabs (1 g) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — SOS analgesic; max 4 g/day; MOH warning if > 10 days/month', doseOptions: ['1 tab (650 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg — after food; avoid in ulcer/kidney disease/cardiac; MOH > 10 days/month', doseOptions: ['1 tab SOS after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Naprosyn 500 Tablet', salt: 'Naproxen 500 mg — SOS after food; avoid in cardiac/kidney disease; MOH warning > 10 days/month', doseOptions: ['1 tab (500 mg) SOS', 'half tab (250 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rizact 5 MLT Tablet', salt: 'Rizatriptan 5 mg (mouth-dissolving) — MAX 2 doses/24 h; 24 h gap before any other triptan/ergot; NEVER in coronary disease; serotonin-caution with SSRI', doseOptions: ['1 tab (5 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rizact 10 MLT Tablet', salt: 'Rizatriptan 10 mg (mouth-dissolving) — MAX 2 doses/24 h; 24 h gap vs other triptan; no ergot overlap; coronary disease never; SSRI serotonin-caution', doseOptions: ['1 tab (10 mg) SOS', 'half tab (5 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Suminat 25 Tablet', salt: 'Sumatriptan 25 mg — MAX 2 doses/24 h; 24 h gap vs other triptan; never with ergot; coronary disease never; SSRI serotonin-caution', doseOptions: ['1 tab (25 mg) SOS', '2 tabs (50 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Suminat 50 Tablet', salt: 'Sumatriptan 50 mg — MAX 2 doses/24 h; 24 h gap vs other triptan; no ergot overlap; coronary disease never', doseOptions: ['1 tab (50 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — Migraine prophylaxis —
    { name: 'Flunarin 10 Tablet', salt: 'Flunarizine 10 mg — nightly prophylaxis; drowsiness/weight gain; avoid in depression; judge benefit at 8-12 weeks', doseOptions: ['1 tab at bedtime', 'half tab (5 mg) at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplar 10 Tablet', salt: 'Propranolol 10 mg — NEVER in asthma/COPD; masks low-sugar warnings; taper on stopping', doseOptions: ['1 tab (10 mg) twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplar 20 Tablet', salt: 'Propranolol 20 mg — never in asthma/COPD; caution in diabetes (hides hypoglycemia); taper on stopping', doseOptions: ['1 tab (20 mg) twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplar 40 Tablet', salt: 'Propranolol 40 mg — never in asthma; bradycardia watch; taper on stopping', doseOptions: ['1 tab (40 mg) twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tryptomer 10 Tablet', salt: 'Amitriptyline 10 mg (low-dose) — bedtime; dry mouth/constipation/drowsiness; helps headache + sleep + RLS at low dose', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Topamac 25 Tablet', salt: 'Topiramate 25 mg — weight loss common; drink 2.5-3 L water daily (heat-stroke/kidney-stone risk); report eye pain/blurred vision urgently; pregnancy avoid', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Topamac 50 Tablet', salt: 'Topiramate 50 mg — hydration 2.5-3 L/day; visual symptoms = urgent review; weight/pregnancy caution', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — AEDs (continuation-verify framing) —
    { name: 'Eptoin 100 Tablet', salt: 'Phenytoin 100 mg — CONTINUATION-VERIFY only; narrow therapeutic index (level testing); gingival hyperplasia (gum care); NEVER stop abruptly', doseOptions: ['1 tab twice daily', '1 tab three times daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Levipil 250 Tablet', salt: 'Levetiracetam 250 mg — continuation-verify; family-reported mood change/irritability — report it; never stop abruptly', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Levipil 500 Tablet', salt: 'Levetiracetam 500 mg — continuation-verify; watch mood changes/irritability; never stop abruptly', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Encorate Chrono 200 Tablet', salt: 'Sodium Valproate 200 mg ER — PREGNANCY NEVER (birth-defect risk); liver-function watch; weight gain; continuation-verify', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Encorate Chrono 300 Tablet', salt: 'Sodium Valproate 300 mg ER — pregnancy never; LFT monitoring; continuation-verify', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Encorate Chrono 500 Tablet', salt: 'Sodium Valproate 500 mg ER — PREGNANCY NEVER; liver monitoring; continuation-verify; never abrupt stop', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tegritol 200 Tablet', salt: 'Carbamazepine 200 mg — continuation-verify; severe rash (SJS) = stop + report immediately; hyponatremia watch (cramps/confusion); never abrupt', doseOptions: ['1 tab twice daily', 'half tab (100 mg) twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lamitor 25 Tablet', salt: 'Lamotrigine 25 mg — SLOW titration only (rash/SJS risk — any rash = stop + report); continuation-verify; never abrupt', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lamitor 50 Tablet', salt: 'Lamotrigine 50 mg — slow-titration rule; any rash = urgent report; continuation-verify', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cloba 5 Tablet', salt: 'Clobazam 5 mg — addon/continuation-verify; drowsiness + dependence risk; taper only, never abrupt', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cloba 10 Tablet', salt: 'Clobazam 10 mg — continuation-verify; sedation; taper only; never abrupt stop', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Folvite 5 Tablet', salt: 'Folic Acid 5 mg — for women of childbearing age on AED; continue through pregnancy as advised', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    // — Neuropathy —
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 — nerve support; pair with B12-rich diet (eggs/milk/green vegetables)', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Methycobal 500 Tablet', salt: 'Methylcobalamin 500 mcg — B12 neuropathy support; vegetarian diets often run low', doseOptions: ['1 tab three times daily', '1 tab twice daily'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Methycobal 500 Injection', salt: 'Methylcobalamin 500 mcg/amp — clinic-administered IM course for B12-deficiency neuropathy', doseOptions: ['1 amp IM alternate days'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabantin 100 Tablet', salt: 'Gabapentin 100 mg — start low; drowsiness/dizziness first week; renal dose-adjust; taper on stopping, never sudden', doseOptions: ['1 tab at bedtime', '1 tab three times daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gabantin 300 Tablet', salt: 'Gabapentin 300 mg — drowsiness/dizziness; taper on stopping; renal caution', doseOptions: ['1 tab at bedtime', '1 tab twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pregeb 75 Tablet', salt: 'Pregabalin 75 mg — DEPENDENCE risk: lowest effective dose, never self-escalate; dizziness/weight gain; taper when stopping', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Pregeb 150 Tablet', salt: 'Pregabalin 150 mg — dependence caution; taper on stopping; dizziness/edema watch', doseOptions: ['1 cap at bedtime', '1 cap twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Duzela 20 Tablet', salt: 'Duloxetine 20 mg — neuropathic pain with low-mood overlap; BP watch; never abrupt stop', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duzela 30 Tablet', salt: 'Duloxetine 30 mg — continuation/titration as advised; BP monitoring; taper on stopping', doseOptions: ['1 cap at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — Vertigo —
    { name: 'Vertin 8 Tablet', salt: 'Betahistine 8 mg — mild vertigo; take with/after food', doseOptions: ['1 tab three times daily'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vertin 16 Tablet', salt: 'Betahistine 16 mg — vestibular vertigo; taper at end of course, not lifelong', doseOptions: ['1 tab three times daily', '1 tab twice daily'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vertin 24 Tablet', salt: 'Betahistine 24 mg — twice daily; taper at end of course', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Stemetil 5 Tablet', salt: 'Prochlorperazine 5 mg — short-term vertigo/nausea; DROWSY — no driving; avoid long courses (movement side-effects); not for standing-giddiness', doseOptions: ['1 tab SOS', '1 tab three times daily (max 5 days)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Stugeron 25 Tablet', salt: 'Cinnarizine 25 mg — vestibular vertigo; drowsiness — avoid driving; short courses only', doseOptions: ['1 tab three times daily', '1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — Parkinson (continuation-only) —
    { name: 'Syndopa 110 Tablet', salt: 'Levodopa 100 mg + Carbidopa 10 mg — CONTINUATION-ONLY (neurologist-titrated); 1 h away from protein meals; NEVER stop abruptly (withdrawal reaction); watch dyskinesia', doseOptions: ['1 tab twice daily', '1 tab three times daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Syndopa 275 Tablet', salt: 'Levodopa 250 mg + Carbidopa 25 mg — continuation-only; protein-meal timing rule; never abrupt; dyskinesia monitoring', doseOptions: ['1 tab twice daily', 'half tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ropark 0.5 Tablet', salt: 'Ropinirole 0.5 mg — continuation-only; sudden-sleep-onset reported — driving caution; taper only', doseOptions: ['1 tab at bedtime', '1 tab three times daily'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ropark 1 Tablet', salt: 'Ropinirole 1 mg — continuation-only; sleep-attack caution — no driving if sleepy; taper only', doseOptions: ['1 tab three times daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pacitane 2 Tablet', salt: 'Trihexyphenidyl 2 mg — continuation-only; confusion/memory risk in elderly — report immediately; dry mouth/blur', doseOptions: ['1 tab twice daily', 'half tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Prami 0.25 Tablet', salt: 'Pramipexole 0.25 mg — continuation-only; impulse-control changes (gambling/shopping urges) — report; sleep-attack caution', doseOptions: ['half tab (0.125 mg) three times daily', '1 tab (0.25 mg) three times daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Amantrel 100 Tablet', salt: 'Amantadine 100 mg — continuation-only; confusion or mottled skin — report; never abrupt stop', doseOptions: ['1 tab twice daily', '1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — Dementia continuation —
    { name: 'Donecept 5 Tablet', salt: 'Donepezil 5 mg — continuation-only; nausea/diarrhea common; slow-pulse watch — report dizziness or fainting', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Donecept 10 Tablet', salt: 'Donepezil 10 mg — only after 4-6 weeks on 5 mg; GI + bradycardia watch', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },
    // — Spasticity / rehab —
    { name: 'Liofen 10 Tablet', salt: 'Baclofen 10 mg — post-stroke spasticity; may add weakness/drowsiness; taper on stopping; renal caution', doseOptions: ['1 tab twice daily', '1 tab three times daily'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    // — Neuropathic pain SOS —
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg — SOS ONLY, shortest course; DEPENDENCE risk — never self-escalate; drowsy — no driving; avoid with other sedatives/alcohol', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H1', verified: false } },
    // — Stroke secondary prevention (continuation-verify) —
    { name: 'Ecosprin 75 Tablet', salt: 'Aspirin 75 mg — CONTINUATION-VERIFY (already advised by cardiologist/neurologist); report black stools or gum bleeding; after food', doseOptions: ['1 tab after lunch'], morning: 0, afternoon: 1, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atorva 10 Tablet', salt: 'Atorvastatin 10 mg — continuation-verify; muscle pains or dark urine — report; bedtime dose', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (42) ════════════════════════════════════
  // Refer-only findings (SAH, meningitis, raised-ICP, stroke-acute, TIA,
  // status-epilepticus, first seizure, GBS, MG, MS, MND, tumor-flags,
  // delirium, child-delay, myasthenic-crisis, Bell, Meniere, PD/dementia
  // suspects, double vision, CTS screen) deliberately have ZERO links.
  findingMeds: [
    // MIGRAINE
    { findingKey: 'MIGRAINE', medicineName: 'Crocin 500 Tablet', dose: '1 tab (500 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'At first sign of attack; max 4 g/day' },
    { findingKey: 'MIGRAINE', medicineName: 'Rizact 10 MLT Tablet', dose: '1 tab (10 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 6, description: 'If simple analgesic fails; MAX 2 doses/24 h; 24 h gap vs other triptan; coronary disease never' },
    { findingKey: 'MIGRAINE', medicineName: 'Flunarin 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Prophylaxis if 4+ headache-days/month; review at 8-12 weeks; avoid in depression' },
    { findingKey: 'MIGRAINE', medicineName: 'Ciplar 20 Tablet', dose: '1 tab (20 mg) twice daily', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'Alternative prophylaxis; NEVER in asthma/COPD' },
    // TENSION-HA
    { findingKey: 'TENSION-HA', medicineName: 'Dolo 650 Tablet', dose: '1 tab (650 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'Limit to 2 days/week — MOH prevention' },
    { findingKey: 'TENSION-HA', medicineName: 'Tryptomer 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'If daily pattern with poor sleep; 3-4 week course' },
    // HA-NOS
    { findingKey: 'HA-NOS', medicineName: 'Crocin 500 Tablet', dose: '1 tab (500 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'SOS; start headache diary + trigger tracker' },
    // MOH
    { findingKey: 'MOH', medicineName: 'Tryptomer 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Bridge during analgesic withdrawal; taper painkillers to under 2 days/week' },
    { findingKey: 'MOH', medicineName: 'Flunarin 10 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Prophylaxis switch while painkillers are being reduced' },
    // EPILEPSY-FU — AED continuation-verify entries
    { findingKey: 'EPILEPSY-FU', medicineName: 'Eptoin 100 Tablet', description: 'CONTINUATION-VERIFY only — continue current neurologist dose; never abrupt; gum care; level check if seizures break through' },
    { findingKey: 'EPILEPSY-FU', medicineName: 'Levipil 500 Tablet', description: 'CONTINUATION-VERIFY only — current dose continued; report mood change/irritability' },
    { findingKey: 'EPILEPSY-FU', medicineName: 'Encorate Chrono 500 Tablet', description: 'CONTINUATION-VERIFY only — PREGNANCY NEVER; LFT per schedule' },
    { findingKey: 'EPILEPSY-FU', medicineName: 'Folvite 5 Tablet', description: '1 tab OD — women of childbearing age on any AED' },
    // STROKE-FU — continuation-verify only
    { findingKey: 'STROKE-FU', medicineName: 'Ecosprin 75 Tablet', description: 'CONTINUATION-VERIFY — already advised by cardiologist/neurologist; report black stools' },
    { findingKey: 'STROKE-FU', medicineName: 'Atorva 10 Tablet', description: 'CONTINUATION-VERIFY — continue advised statin; report muscle pain' },
    { findingKey: 'STROKE-FU', medicineName: 'Liofen 10 Tablet', description: '1 tab BD if spasticity — may add weakness; taper later' },
    // HEMIPLEGIA-FU
    { findingKey: 'HEMIPLEGIA-FU', medicineName: 'Liofen 10 Tablet', description: 'Post-stroke spasticity support alongside physiotherapy' },
    // DIABETIC-NEURO
    { findingKey: 'DIABETIC-NEURO', medicineName: 'Methycobal 500 Tablet', description: '1 tab TDS × 1-2 months — B12 support for nerve health' },
    { findingKey: 'DIABETIC-NEURO', medicineName: 'Pregeb 75 Tablet', description: '1 cap HS × 4 weeks; lowest effective dose — dependence caution; escalate only per doctor' },
    { findingKey: 'DIABETIC-NEURO', medicineName: 'Gabantin 100 Tablet', description: '1-2 tabs HS if pregabalin not tolerated; first-week drowsiness expected' },
    { findingKey: 'DIABETIC-NEURO', medicineName: 'Duzela 20 Tablet', description: '1 cap HS when pain overlaps with low mood; BP watch' },
    // BPPV
    { findingKey: 'BPPV', medicineName: 'Vertin 16 Tablet', description: '1 tab TDS × 7 days then taper; pair with Epley maneuver teaching at clinic' },
    { findingKey: 'BPPV', medicineName: 'Stemetil 5 Tablet', description: '1 tab SOS severe nausea only; max 5 days; drowsy — no driving' },
    // ORTHOSTATIC-DIZZY
    { findingKey: 'ORTHOSTATIC-DIZZY', medicineName: 'Vertin 8 Tablet', description: '1 tab TDS × 2 weeks — mild support; hydration/salt and slow-rising are primary' },
    { findingKey: 'ORTHOSTATIC-DIZZY', medicineName: 'Stugeron 25 Tablet', description: '1 tab HS short course if spells persist; drowsy — avoid driving' },
    // TN — carbamazepine continuation-framing
    { findingKey: 'TN', medicineName: 'Tegritol 200 Tablet', description: 'CONTINUATION-VERIFY (carbamazepine framing) — current dose continued; rash = stop + report; sodium check if confused' },
    { findingKey: 'TN', medicineName: 'Pregeb 75 Tablet', description: '1 cap HS adjunct if neuralgic pain persists' },
    // ET
    { findingKey: 'ET', medicineName: 'Ciplar 20 Tablet', description: '1 tab BD × 4 weeks for essential tremor; NEVER in asthma' },
    { findingKey: 'ET', medicineName: 'Ciplar 40 Tablet', description: '1 tab BD if 20 mg insufficient; pulse check each visit' },
    // RLS
    { findingKey: 'RLS', medicineName: 'Gabantin 100 Tablet', description: '1 tab HS before sleep; evening caffeine off; iron studies if anemic' },
    { findingKey: 'RLS', medicineName: 'Pregeb 75 Tablet', description: '1 cap HS if gabapentin insufficient' },
    // INSOMNIA-RLS
    { findingKey: 'INSOMNIA-RLS', medicineName: 'Tryptomer 10 Tablet', description: '1 tab HS for sleep component; screen apnea if snoring' },
    // RADICULOPATHY
    { findingKey: 'RADICULOPATHY', medicineName: 'Gabantin 100 Tablet', description: '1-2 tabs HS titration; first-week drowsiness' },
    { findingKey: 'RADICULOPATHY', medicineName: 'Naprosyn 500 Tablet', description: '1 tab SOS after food; limit 2 days/week' },
    { findingKey: 'RADICULOPATHY', medicineName: 'Ultracet Tablet', description: '1 tab SOS for severe nights only — dependence risk; never escalate yourself' },
    // PD-FU — continuation-only
    { findingKey: 'PD-FU', medicineName: 'Syndopa 275 Tablet', description: 'CONTINUATION-ONLY — 1 h away from protein meals; never abrupt; log on-off hours' },
    { findingKey: 'PD-FU', medicineName: 'Ropark 1 Tablet', description: 'CONTINUATION-ONLY — sleep-attack caution; no driving if sleepy' },
    { findingKey: 'PD-FU', medicineName: 'Pacitane 2 Tablet', description: 'CONTINUATION-ONLY — confusion in elderly = report immediately' },
    { findingKey: 'PD-FU', medicineName: 'Prami 0.25 Tablet', description: 'CONTINUATION-ONLY — impulse-control changes (gambling/shopping urges) — report' },
    // DEMENTIA-FU — continuation-only
    { findingKey: 'DEMENTIA-FU', medicineName: 'Donecept 5 Tablet', description: 'CONTINUATION-ONLY — 1 tab HS; pulse watch; report dizziness/fainting' },
    { findingKey: 'DEMENTIA-FU', medicineName: 'Donecept 10 Tablet', description: 'CONTINUATION-ONLY — only after 4-6 weeks on 5 mg' },
    // HEAD-INJURY-FU
    { findingKey: 'HEAD-INJURY-FU', medicineName: 'Dolo 650 Tablet', description: '1 tab SOS, short-term only; red-flag review before refill' },
    // REHAB-FU
    { findingKey: 'REHAB-FU', medicineName: 'Neurobion Forte Tablet', description: '1 tab OD — nerve support during rehabilitation phase' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Headache Diary (14 days)',
      rows: 14,
      cols: 7,
      headerLabel: ['तारीख', 'समय', 'अवधि (मिनट)', 'ट्रिगर', 'चमक/चेतावनी', 'दर्द स्कोर (0-10)', 'दवा ली?'],
      colsLabel: ['Date', 'Time', 'Duration (min)', 'Trigger', 'Aura/Warning', 'Pain Score (0-10)', 'Medicine Taken?'],
      footerLabel: ['पेनकिलर माह में 10 दिन से ज्यादा = MOH — डॉक्टर को दिखाएं / Painkillers > 10 days a month = MOH — show this diary to your doctor'],
    },
    {
      name: 'Seizure Diary (8 episodes)',
      rows: 8,
      cols: 8,
      headerLabel: ['तारीख', 'समय', 'अवधि (मिनट)', 'प्रकार (पूरा शरीर / एक तरफ)', 'चेतावनी (आयुरा)', 'जीभ कटी / पेशाब', 'ट्रिगर', 'दौरे के बाद'],
      colsLabel: ['Date', 'Time', 'Duration (min)', 'Type (Generalized / Focal)', 'Aura', 'Tongue-bite / Incontinence', 'Trigger', 'Post-ictal State'],
      footerLabel: ['दौरा 5 मिनट+ या लगातार = 108 एम्बुलेंस · अगली मुलाकात में दिखाएं / Seizure 5 min+ or back-to-back = call 108 · show at next visit'],
    },
    {
      name: 'Stroke Follow-Up Card (8 visits)',
      rows: 8,
      cols: 6,
      headerLabel: ['तारीख', 'BP', 'शुगर', 'कमजोरी ग्रेड (0-5)', 'mRS (0-5)', 'थेरेपी की'],
      colsLabel: ['Date', 'BP', 'Sugar', 'Weakness Grade (0-5)', 'mRS (0-5)', 'Therapy Done'],
      footerLabel: ['अचानक चेहरा टेढ़ा / बांह कमजोरी / बोली लड़खड़ = FAST — 108 तुरंत / Sudden face droop, arm weakness or slurred speech = FAST — call 108 now'],
    },
    {
      name: 'Neuropathy Foot-Care Card (7 days)',
      rows: 7,
      cols: 5,
      headerLabel: ['दिन', 'पैर जांचे', 'मॉइस्चराइज़र लगाया', 'जूते-मोजे पहने', 'लाली / घाव दिखी?'],
      colsLabel: ['Day', 'Feet Inspected', 'Moisturiser Applied', 'Shoes-Socks Worn', 'Redness / Wound Seen?'],
      footerLabel: ['लाली, सूजन, घाव या पस = तुरंत डॉक्टर · पानी का तापमान कोहनी से नापें / Redness, swelling, wound or pus = doctor immediately · test water temperature with elbow'],
    },
    {
      name: 'Tremor & Gait Observation Grid (7 days)',
      rows: 7,
      cols: 6,
      headerLabel: ['तारीख', 'आराम में कांपन', 'काम पर कांपन', 'कांपन ग्रेड (0-4)', 'चाल रुकना', 'मुड़ने में दिक्कत'],
      colsLabel: ['Date', 'Tremor at Rest', 'Tremor on Action', 'Tremor Grade (0-4)', 'Gait Freezing', 'Difficulty Turning'],
      footerLabel: ['दवा के घंटे के साथ नोट करें — डॉक्टर को दिखाएं / Note against medicine timings — show to your doctor'],
    },
    {
      name: 'Migraine Trigger Tracker (7 days)',
      rows: 7,
      cols: 6,
      headerLabel: ['तारीख', 'खाना (चॉकलेट / पनीर)', 'नींद (घंटे)', 'मौसम / धूप', 'तनाव', 'स्क्रीन समय'],
      colsLabel: ['Date', 'Food (Chocolate / Cheese)', 'Sleep (hours)', 'Weather / Sun', 'Stress', 'Screen Time'],
      footerLabel: ['छोड़ा भोजन और अधूरी नींद सबसे आम ट्रिगर / Skipped meals and short sleep are the most common triggers'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Migraine — Acute Rescue + Diary Start',
      diagnosis: 'MIGRAINE',
      medicines: [
        { name: 'Rizact 10 MLT Tablet', dose: '1 tab (10 mg) SOS', duration: 'SOS', instructions: 'Max 2 doses/24 h; 24 h gap vs other triptan; take early in the attack; never in coronary disease' },
        { name: 'Naprosyn 500 Tablet', dose: '1 tab (500 mg) SOS', duration: 'SOS', instructions: 'If NSAID chosen first; after food; under 2 days/week (MOH prevention)' },
        { name: 'Flunarin 10 Tablet', dose: '1 tab at bedtime', duration: '30 days', instructions: 'Prophylaxis if 4+ headache-days/month; review at 4 weeks' },
      ],
      labs: ['No lab if classic pattern', 'CBC + Creatinine if frequent NSAID use'],
      advice: 'दर्द शुरू होते ही पहली गोली लें · दर्द-डायरी + ट्रिगर-ट्रैकर रोज़ भरें · पेनकिलर महीने में 10 दिन से ज्यादा कभी नहीं (MOH) · चमक-चेतावनी डायरी में नोट करें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Migraine — Prophylaxis Initiation',
      diagnosis: 'MIGRAINE',
      medicines: [
        { name: 'Flunarin 10 Tablet', dose: '1 tab at bedtime', duration: '28 days', instructions: 'Nightly; drowsiness/weight watch; avoid in depression' },
        { name: 'Ciplar 20 Tablet', dose: '1 tab (20 mg) twice daily', duration: '28 days', instructions: 'Alternative to flunarizine — NEVER in asthma/COPD; check pulse each visit' },
      ],
      labs: ['BP + pulse baseline', 'Creatinine if renal disease'],
      advice: 'रोज़ एक ही समय सोएं-जागें · भोजन न छोड़ें · नींद की कमी/छोड़ा भोजन सबसे आम ट्रिगर · असर 4-8 हफ्ते में दिखता है — बीच में छोड़ें नहीं',
      followUpDays: 28,
    },
    {
      name: 'Epilepsy — Follow-up Continuation Visit',
      diagnosis: 'EPILEPSY-FU',
      medicines: [
        { name: 'Eptoin 100 Tablet', dose: '1 tab twice daily', duration: '30 days', instructions: 'CONTINUATION-VERIFY current neurologist dose; never stop abruptly; gum care' },
        { name: 'Folvite 5 Tablet', dose: '1 tab once daily', duration: '30 days', instructions: 'Women of childbearing age on AED; continue through pregnancy as advised' },
      ],
      labs: ['Serum drug level if breakthrough seizures', 'CBC + LFT if on valproate', 'Serum sodium if on carbamazepine'],
      advice: 'दवा कभी अचानक बंद नहीं — दौरे लौट सकते हैं · नींद 7-8 घंटे नियत · दौरा-डायरी भरें · गाड़ी/तैराकी/ऊंचाई के नियम डॉक्टर से पुष्टि करें · दौरा 5 मिनट+ या लगातार = 108 · मुंह में कुछ न ठूंसें, करवट पर लिटाएं, समय नोट करें',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'Diabetic Burning Feet — Bundle',
      diagnosis: 'DIABETIC-NEURO',
      medicines: [
        { name: 'Methycobal 500 Tablet', dose: '1 tab three times daily', duration: '30 days', instructions: 'B12 nerve support' },
        { name: 'Pregeb 75 Tablet', dose: '1 cap at bedtime', duration: '30 days', instructions: 'Lowest effective dose; dependence caution; first-week dizziness expected' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab after food', duration: '30 days', instructions: 'With meals' },
      ],
      labs: ['HbA1c', 'Serum Vitamin B12', 'Urine microalbumin', 'Foot-care card review'],
      advice: 'शुगर नियंत्रण ही मुख्य इलाज — मेटाबॉलिक रेफर जारी रखें · रोज़ रात पैर जांचें · गुनगुना (गर्म नहीं) पानी · जूते-मोजे हमेशा · लाली/घाव/सूजन = तुरंत मिलें',
      followUpDays: 30,
      isCommon: true,
    },
    {
      name: 'BPPV Vertigo — Short Course + Epley Teaching',
      diagnosis: 'BPPV',
      medicines: [
        { name: 'Vertin 16 Tablet', dose: '1 tab three times daily', duration: '7 days', instructions: 'Taper off after; not a lifelong medicine' },
        { name: 'Stemetil 5 Tablet', dose: '1 tab SOS', duration: '3 days', instructions: 'Severe nausea only; drowsy — no driving' },
      ],
      labs: ['Dix-Hallpike at clinic', 'No imaging if classic BPPV pattern'],
      advice: 'बिस्तर से धीरे उठें और धीरे पलटें · Epley मनुवर डॉक्टर से सीखें — घर पर दोहराएं · चक्कर के दौरान गाड़ी/सीढ़ी/मशीन नहीं · घर में रात की रोशनी रखें · 2 हफ्ते में दोबारा मिलें',
      followUpDays: 14,
    },
    {
      name: 'Tension Headache — Lifestyle Bundle',
      diagnosis: 'TENSION-HA',
      medicines: [
        { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg) SOS', duration: 'SOS', instructions: 'Under 2 days/week — MOH warning' },
        { name: 'Tryptomer 10 Tablet', dose: '1 tab at bedtime', duration: '21 days', instructions: 'Low-dose; dry mouth common; helps sleep' },
      ],
      labs: ['Vitamin D level if chronic', 'Hb if fatigue'],
      advice: 'सोने-जागने का समय नियत · हर 45 मिनट में 5 मिनट स्क्रीन ब्रेक · पानी 2-3 लीटर/दिन · हफ्ते में 3 दिन 30 मिनट व्यायाम · पेनकिलर-गिनती डायरी में रखें — 10 दिन/माह की सीमा न टूटे',
      followUpDays: 14,
    },
  ],
}
