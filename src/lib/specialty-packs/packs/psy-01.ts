/**
 * PSY-01 — PSYCHIATRY STARTER PACK (T2)
 *
 * The India tier-2/3 psychiatry OPD core: high-frequency mood/anxiety/OC
 * presentations, sleep and substance problems, heavy follow-up/continuation
 * mix, counselling-first framing with bilingual patient-printable advice.
 *
 * Language: Hindi primary (patient-facing / ask-aloud), English secondary
 * (doctor search). Medicine names = English brands (India psych core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI must show the
 * unverified-dose badge until meta.reviewedBy is stamped.
 *
 * ⚠ SAFETY RULES BAKED INTO THIS PACK:
 *  - Suicide screens in 6 depression-related questions; crisis lines
 *    (Tele-MANAS 14416 — Govt of India national helpline, emergency 112)
 *    on every depression/crisis branch.
 *  - ALL benzodiazepines/Z-drugs: short-course (2-4 weeks) + taper +
 *    dependence + NEVER-with-alcohol notes. No long-duration benzo scripts.
 *  - Lithium/valproate/antipsychotics: CONTINUATION-VERIFY-ONLY framing —
 *    no new starts; levels/pregnancy warnings in salt strings.
 *  - Valproate & paroxetine: NEVER in pregnancy. SSRIs in pregnancy:
 *    OBG + psychiatrist joint decision (continuation framing only).
 *  - Excluded medicine classes: restricted antipsychotics, long-acting
 *    injectables, MAOIs, stimulants — none appear as pack medicines.
 *  - Refer-only findings carry ZERO findingMeds links.
 *  - No convulsive-therapy content anywhere; psychotherapy referral
 *    co-prescribed with every med bundle.
 *
 * Sources: standard Indian psychiatry OPD patterns · ICD-10 codes ·
 * Tele-MANAS 14416 (Govt of India) · unverified-dose launch mode.
 */

import type { SpecialtyPack } from '../types'

export const PSY01_PACK: SpecialtyPack = {
  meta: {
    code: 'PSY-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Psychiatry Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'India psychiatry OPD top-presentations · ICD-10 · Tele-MANAS 14416 national helpline · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'DEP', name: 'डिप्रेशन', nameEn: 'Depression' },
    { key: 'ANX', name: 'चिंता', nameEn: 'Anxiety' },
    { key: 'OCN', name: 'जुनून-विचार (OCD)', nameEn: 'Obsession-Compulsion' },
    { key: 'SLP', name: 'नींद', nameEn: 'Sleep' },
    { key: 'SUB', name: 'नशा', nameEn: 'Substance Use' },
    { key: 'PSY', name: 'साइकोसिस व अन्य', nameEn: 'Psychosis & Others' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // DEP — Depression
    { code: 'DEP01', categoryKey: 'DEP', detail: 'लगातार उदासी / मन खराब', detailEn: 'Persistent Sadness / Low Mood' },
    { code: 'DEP02', categoryKey: 'DEP', detail: 'रुचि का नुकसान (एन्हेडोनिया)', detailEn: 'Loss of Interest in Activities' },
    { code: 'DEP03', categoryKey: 'DEP', detail: 'बेवजह रोना आना', detailEn: 'Crying Spells' },
    { code: 'DEP04', categoryKey: 'DEP', detail: 'खुद को बेकार / दोषी मानना', detailEn: 'Feeling Worthless / Guilty' },
    { code: 'DEP05', categoryKey: 'DEP', detail: 'नकारात्मक विचार आना', detailEn: 'Negative Thoughts' },
    { code: 'DEP06', categoryKey: 'DEP', detail: 'परिवार से चिड़चिड़ापन', detailEn: 'Irritability with Family' },
    { code: 'DEP07', categoryKey: 'DEP', detail: 'परीक्षा का तनाव (छात्र)', detailEn: 'Exam Stress (Student)' },
    { code: 'DEP08', categoryKey: 'DEP', detail: 'काम का तनाव / बर्नआउट', detailEn: 'Work Stress / Burnout' },
    { code: 'DEP09', categoryKey: 'DEP', detail: 'नुकसान या स्थानांतरण के बाद समायोजन की समस्या', detailEn: 'Adjustment Problem after Loss / Move' },
    // ANX — Anxiety
    { code: 'ANX01', categoryKey: 'ANX', detail: 'दिनभर अत्यधिक चिंता', detailEn: 'Excessive Worry All Day' },
    { code: 'ANX02', categoryKey: 'ANX', detail: 'बेचैनी / एक जगह न बैठ पाना', detailEn: 'Restlessness / Cannot Sit Still' },
    { code: 'ANX03', categoryKey: 'ANX', detail: 'पैनिक अटैक (दिल धड़कना + डर)', detailEn: 'Panic Attacks' },
    { code: 'ANX04', categoryKey: 'ANX', detail: 'भीड़ / बाहर की जगहों से डर', detailEn: 'Fear of Places / Crowds (Agoraphobia)' },
    { code: 'ANX05', categoryKey: 'ANX', detail: 'सामाजिक डर / सार्वजनिक बोलने में डर', detailEn: 'Social Fear / Public Speaking' },
    { code: 'ANX06', categoryKey: 'ANX', detail: 'विशिष्ट डर (अंधेरा / जानवर / लिफ्ट)', detailEn: 'Specific Fears' },
    { code: 'ANX07', categoryKey: 'ANX', detail: 'तनाव से जुड़ा सिरदर्द', detailEn: 'Tension Headache linked to Stress' },
    // OCN — Obsession-Compulsion
    { code: 'OCN01', categoryKey: 'OCN', detail: 'बार-बार अनचाहे विचार आना (ऑब्सेशन)', detailEn: 'Recurring Unwanted Thoughts' },
    { code: 'OCN02', categoryKey: 'OCN', detail: 'बार-बार हाथ धोना / जांचना (कंपल्शन)', detailEn: 'Repeated Hand-washing / Checking' },
    { code: 'OCN03', categoryKey: 'OCN', detail: 'हर बात में शक करना', detailEn: 'Doubting Everything' },
    { code: 'OCN04', categoryKey: 'OCN', detail: 'गेमिंग / मोबाइल की लत (युवा)', detailEn: 'Gaming / Mobile Addiction (Youth)' },
    { code: 'OCN05', categoryKey: 'OCN', detail: 'OCD लंबे इलाज का फॉलो-अप', detailEn: 'OCD Long-term Follow-up' },
    // SLP — Sleep
    { code: 'SLP01', categoryKey: 'SLP', detail: 'नींद न आना (सोने में देरी)', detailEn: 'Difficulty Falling Asleep' },
    { code: 'SLP02', categoryKey: 'SLP', detail: 'रात में बार-बार नींद टूटना', detailEn: 'Frequent Night Waking' },
    { code: 'SLP03', categoryKey: 'SLP', detail: 'सुबह जल्दी आंख खुल जाना', detailEn: 'Early Morning Awakening' },
    { code: 'SLP04', categoryKey: 'SLP', detail: 'नींद पूरी होकर भी तरोताज़ा न लगना', detailEn: 'Non-refreshing Sleep' },
    { code: 'SLP05', categoryKey: 'SLP', detail: 'बुरे सपने / नाइटमेयर', detailEn: 'Nightmares' },
    { code: 'SLP06', categoryKey: 'SLP', detail: 'दिन में नींद / झपकी आना', detailEn: 'Day-time Sleepiness' },
    { code: 'SLP07', categoryKey: 'SLP', detail: 'खर्राटे + दिनभर झपकी (OSA स्क्रीन)', detailEn: 'Snoring + Day Sleepiness (OSA Screen)' },
    // SUB — Substance
    { code: 'SUB01', categoryKey: 'SUB', detail: 'शराब की समस्या / छोड़ना चाहते हैं', detailEn: 'Alcohol Problem / Wants to Quit' },
    { code: 'SUB02', categoryKey: 'SUB', detail: 'शराब छोड़ने पर कंपन / बेचैनी (रेफर)', detailEn: 'Alcohol Withdrawal Shakes (Refer)' },
    { code: 'SUB03', categoryKey: 'SUB', detail: 'तंबाकू / सिगरेट छोड़ना चाहते हैं', detailEn: 'Wants to Quit Tobacco / Smoking' },
    { code: 'SUB04', categoryKey: 'SUB', detail: 'गांजा / नशे का सेवन (परिवार की चिंता)', detailEn: 'Cannabis / Substance Use (Family Concern)' },
    { code: 'SUB05', categoryKey: 'SUB', detail: 'नींद की गोलियों का लंबा इस्तेमाल', detailEn: 'Long-term Sleeping Pill Use' },
    // PSY — Psychosis & Others
    { code: 'PSY01', categoryKey: 'PSY', detail: 'भूलने की शिकायत', detailEn: 'Forgetfulness Complaints' },
    { code: 'PSY02', categoryKey: 'PSY', detail: 'गुस्से के विस्फोट', detailEn: 'Anger Outbursts' },
    { code: 'PSY03', categoryKey: 'PSY', detail: 'वैवाहिक / रिश्ते की समस्या — काउंसलिंग', detailEn: 'Marital / Relationship Conflict — Counselling' },
    { code: 'PSY04', categoryKey: 'PSY', detail: 'बच्चे की चंचलता / ध्यान न टिकना (रेफर)', detailEn: 'Childhood Hyperactivity / Attention (Refer)' },
    { code: 'PSY05', categoryKey: 'PSY', detail: 'बच्चे की बोलने में देरी (रेफर)', detailEn: 'Delayed Speech Milestones (Refer)' },
    { code: 'PSY06', categoryKey: 'PSY', detail: 'बार-बार शारीरिक शिकायतें, कारण नहीं मिलता', detailEn: 'Repeated Physical Complaints, No Cause Found' },
    { code: 'PSY07', categoryKey: 'PSY', detail: 'डिलीवरी के बाद उदासी (स्क्रीन)', detailEn: 'Post-partum Sadness (Screen)' },
    { code: 'PSY08', categoryKey: 'PSY', detail: 'बुढ़ापे में उदासी / अकेलापन', detailEn: 'Old-age Sadness / Loneliness' },
    { code: 'PSY09', categoryKey: 'PSY', detail: 'बाइपोलर इलाज जारी रखने का फॉलो-अप', detailEn: 'Bipolar Maintenance Follow-up' },
    { code: 'PSY10', categoryKey: 'PSY', detail: 'सिज़ोफ्रेनिया / साइकोसिस इलाज का फॉलो-अप', detailEn: 'Schizophrenia / Psychosis Follow-up' },
    { code: 'PSY11', categoryKey: 'PSY', detail: 'महीने न आना + वजन बदलना + उदासी (रेफर)', detailEn: 'Missed Periods + Weight Change + Low Mood (Refer)' },
  ],

  // ══ Questions (94) ════════════════════════════════════════════════════
  // idx comments MUST match true 0-based array index — zero drift.
  questions: [
    // idx 0 — DEP01
    { complaintCode: 'DEP01', question: 'उदासी कितने समय से है — हफ्तों या महीनों?', questionEn: 'Since when is the low mood — weeks or months?' },
    // idx 1 — DEP01
    { complaintCode: 'DEP01', question: 'नींद और भूख पर क्या असर पड़ा है?', questionEn: 'What effect has it had on sleep and appetite?' },
    // idx 2 — DEP01 (suicide screen)
    { complaintCode: 'DEP01', question: 'क्या कभी लगता है कि जीना व्यर्थ है?', questionEn: 'Do you ever feel that living feels pointless?' },
    // idx 3 — DEP02
    { complaintCode: 'DEP02', question: 'पहले जो काम अच्छे लगते थे, उनमें अब रुचि है?', questionEn: 'Do you still enjoy activities you previously liked?' },
    // idx 4 — DEP02
    { complaintCode: 'DEP02', question: 'रुचि कितने दिनों से लगातार कम है?', questionEn: 'Since how many days is the interest persistently low?' },
    // idx 5 — DEP03
    { complaintCode: 'DEP03', question: 'रोना अब कितनी बार आता है?', questionEn: 'How often do crying spells come now?' },
    // idx 6 — DEP03 (family history)
    { complaintCode: 'DEP03', question: 'परिवार में किसी को डिप्रेशन या मानसिक बीमारी का इतिहास रहा है?', questionEn: 'Any family history of depression or mental illness?' },
    // idx 7 — DEP04
    { complaintCode: 'DEP04', question: 'खुद को बेकार या दोषी क्यों मानते हैं?', questionEn: 'Why do you feel worthless or guilty?' },
    // idx 8 — DEP04
    { complaintCode: 'DEP04', question: 'परिवार में किसी की मौत या कोई बड़ी घटना के बाद यह शुरू हुआ?', questionEn: 'Did it start after a bereavement or a major event?' },
    // idx 9 — DEP04 (suicide screen)
    { complaintCode: 'DEP04', question: 'क्या कभी खुद को नुकसान पहुंचाने का ख्याल आता है?', questionEn: 'Do thoughts of harming yourself ever come?' },
    // idx 10 — DEP05
    { complaintCode: 'DEP05', question: 'नकारात्मक विचार दिन में कितनी बार आते हैं?', questionEn: 'How many times a day do negative thoughts come?' },
    // idx 11 — DEP05 (functioning impact)
    { complaintCode: 'DEP05', question: 'इन विचारों से नींद या काम-पढ़ाई पर असर पड़ता है?', questionEn: 'Do these thoughts affect sleep, work or studies?' },
    // idx 12 — DEP05 (suicide screen)
    { complaintCode: 'DEP05', question: 'क्या खुद को नुकसान पहुंचाने का विचार कभी आता है?', questionEn: 'Does the thought of harming yourself ever come?' },
    // idx 13 — DEP06 (diurnal variation)
    { complaintCode: 'DEP06', question: 'चिड़चिड़ापन दिन में या शाम को ज्यादा होता है?', questionEn: 'Is the irritability worse in the day or evening?' },
    // idx 14 — DEP06 (support system)
    { complaintCode: 'DEP06', question: 'घर का माहौल इन दिनों कैसा है?', questionEn: 'How is the home environment these days?' },
    // idx 15 — DEP07
    { complaintCode: 'DEP07', question: 'कौन सी कक्षा या परीक्षा की तैयारी चल रही है?', questionEn: 'Which class or exam preparation is going on?' },
    // idx 16 — DEP07
    { complaintCode: 'DEP07', question: 'पढ़ते समय एकाग्रता कितनी देर टिकती है?', questionEn: 'How long does concentration last while studying?' },
    // idx 17 — DEP07 (suicide screen — student)
    { complaintCode: 'DEP07', question: 'क्या कभी ऐसा ख्याल आता है कि अब कुछ बेहतर नहीं होगा?', questionEn: 'Do thoughts ever come that nothing will ever get better?' },
    // idx 18 — DEP08
    { complaintCode: 'DEP08', question: 'दिन में कितने घंटे काम करते हैं?', questionEn: 'How many hours a day do you work?' },
    // idx 19 — DEP08 (previous psychiatric treatment)
    { complaintCode: 'DEP08', question: 'पहले कभी मनोचिकित्सा का इलाज या काउंसलिंग लिया है?', questionEn: 'Have you taken psychiatric treatment or counselling before?' },
    // idx 20 — DEP09
    { complaintCode: 'DEP09', question: 'किस घटना के बाद यह शुरू हुआ — नुकसान, ट्रांसफर या पलायन?', questionEn: 'After which event did it start — loss, transfer or migration?' },
    // idx 21 — DEP09
    { complaintCode: 'DEP09', question: 'नई जगह या हालात में समायोजन कैसा जा रहा है?', questionEn: 'How is the adjustment to the new place or situation?' },
    // idx 22 — ANX01
    { complaintCode: 'ANX01', question: 'चिंता दिन में कितने घंटे रहती है?', questionEn: 'How many hours a day does the worry last?' },
    // idx 23 — ANX01
    { complaintCode: 'ANX01', question: 'चिंता के साथ दिल की धड़कन या हाथ कांपना होता है?', questionEn: 'Any palpitations or trembling along with the worry?' },
    // idx 24 — ANX02
    { complaintCode: 'ANX02', question: 'बेचैनी किस समय सबसे ज्यादा होती है?', questionEn: 'At what time is the restlessness worst?' },
    // idx 25 — ANX02
    { complaintCode: 'ANX02', question: 'एक जगह बैठकर काम पूरा कर पाते हैं?', questionEn: 'Can you complete a task sitting in one place?' },
    // idx 26 — ANX03
    { complaintCode: 'ANX03', question: 'पैनिक अटैक कितने मिनट तक रहता है?', questionEn: 'How many minutes does a panic attack last?' },
    // idx 27 — ANX03
    { complaintCode: 'ANX03', question: 'हफ्ते में कितने बार अटैक आते हैं?', questionEn: 'How many episodes come in a week?' },
    // idx 28 — ANX04
    { complaintCode: 'ANX04', question: 'कौन सी जगहों से डर लगता है — बाज़ार, बस, भीड़?', questionEn: 'Which places cause fear — market, bus, crowds?' },
    // idx 29 — ANX04
    { complaintCode: 'ANX04', question: 'अकेले घर से बाहर निकल पाते हैं?', questionEn: 'Can you step out of home alone?' },
    // idx 30 — ANX05
    { complaintCode: 'ANX05', question: 'किन स्थितियों में डर लगता है — बोलना, मिलना, बाहर खाना?', questionEn: 'Which situations cause fear — speaking, meeting, eating out?' },
    // idx 31 — ANX05 (avoidance behaviour)
    { complaintCode: 'ANX05', question: 'लोगों से मिलना या बोलना टालते हैं?', questionEn: 'Do you avoid meeting or talking to people?' },
    // idx 32 — ANX06
    { complaintCode: 'ANX06', question: 'डर किस चीज से है — अंधेरा, जानवर, लिफ्ट, ऊंचाई?', questionEn: 'What are you afraid of — dark, animals, lift, height?' },
    // idx 33 — ANX06
    { complaintCode: 'ANX06', question: 'इस डर से रोज़ का काम-काज प्रभावित होता है?', questionEn: 'Does this fear affect daily activities?' },
    // idx 34 — ANX07
    { complaintCode: 'ANX07', question: 'सिरदर्द तनाव या चिंता के साथ बढ़ता है?', questionEn: 'Does the headache increase with stress or worry?' },
    // idx 35 — ANX07
    { complaintCode: 'ANX07', question: 'दर्द कैसा लगता है — दबाव, कसाव या फीते जैसा?', questionEn: 'What does the pain feel like — pressure, tightness or band-like?' },
    // idx 36 — OCN01
    { complaintCode: 'OCN01', question: 'ये अनचाहे विचार दिन में कितनी बार आते हैं?', questionEn: 'How many times a day do the unwanted thoughts come?' },
    // idx 37 — OCN01
    { complaintCode: 'OCN01', question: 'विचार आने पर कितनी बेचैनी होती है?', questionEn: 'How much distress do the thoughts cause when they come?' },
    // idx 38 — OCN02 (compulsion frequency/day)
    { complaintCode: 'OCN02', question: 'दिन में कितनी बार हाथ धोते या जांचते हैं?', questionEn: 'How many times a day do you wash hands or check things?' },
    // idx 39 — OCN02
    { complaintCode: 'OCN02', question: 'धोने या जांचने को रोक पाते हैं?', questionEn: 'Are you able to resist washing or checking?' },
    // idx 40 — OCN03
    { complaintCode: 'OCN03', question: 'शक ज्यादा किन बातों में लगता है?', questionEn: 'In which matters does the doubting occur most?' },
    // idx 41 — OCN03
    { complaintCode: 'OCN03', question: 'दोबारा जांचने में दिन का कितना समय जाता है?', questionEn: 'How much of the day goes in re-checking?' },
    // idx 42 — OCN04
    { complaintCode: 'OCN04', question: 'दिन में कितने घंटे मोबाइल या गेम पर जाते हैं?', questionEn: 'How many hours a day go on mobile or gaming?' },
    // idx 43 — OCN04
    { complaintCode: 'OCN04', question: 'खाना, नींद या पढ़ाई छोड़ देते हैं?', questionEn: 'Do you skip meals, sleep or studies?' },
    // idx 44 — OCN05 (current meds — continuation verify)
    { complaintCode: 'OCN05', question: 'अभी कौन सी दवा चल रही है और किस खुराक से?', questionEn: 'Which medicine is ongoing and at what dose?' },
    // idx 45 — OCN05
    { complaintCode: 'OCN05', question: 'विचार / क्रियाएं अब कितने प्रतिशत नियंत्रित हैं?', questionEn: 'What percentage control do you have over the thoughts or acts now?' },
    // idx 46 — SLP01
    { complaintCode: 'SLP01', question: 'बिस्तर पर लेटने के बाद नींद आने में कितना समय लगता है?', questionEn: 'How long does it take to fall asleep after lying down?' },
    // idx 47 — SLP01
    { complaintCode: 'SLP01', question: 'यह समस्या कितने दिनों या महीनों से है?', questionEn: 'Since how many days or months is this problem?' },
    // idx 48 — SLP02
    { complaintCode: 'SLP02', question: 'रात में नींद कितनी बार टूटती है?', questionEn: 'How many times does sleep break at night?' },
    // idx 49 — SLP02
    { complaintCode: 'SLP02', question: 'टूटने के बाद दोबारा नींद कितनी देर में आती है?', questionEn: 'How long does it take to fall asleep again after waking?' },
    // idx 50 — SLP03
    { complaintCode: 'SLP03', question: 'सुबह किस समय आंख खुल जाती है?', questionEn: 'At what time do you wake up in the morning?' },
    // idx 51 — SLP03
    { complaintCode: 'SLP03', question: 'जागने के बाद दोबारा नींद आ पाती है?', questionEn: 'Can you fall back asleep after waking?' },
    // idx 52 — SLP04
    { complaintCode: 'SLP04', question: 'रात को कुल कितने घंटे की नींद होती है?', questionEn: 'How many total hours do you sleep at night?' },
    // idx 53 — SLP04
    { complaintCode: 'SLP04', question: 'उठने के बाद दिनभर थकान या झपकी रहती है?', questionEn: 'Do you have fatigue or dozing through the day after waking?' },
    // idx 54 — SLP05
    { complaintCode: 'SLP05', question: 'हफ्ते में कितनी बार बुरे सपने आते हैं?', questionEn: 'How many times a week do nightmares occur?' },
    // idx 55 — SLP05
    { complaintCode: 'SLP05', question: 'डर या पसीने के साथ अचानक जाग जाते हैं?', questionEn: 'Do you wake up suddenly with fear or sweating?' },
    // idx 56 — SLP06
    { complaintCode: 'SLP06', question: 'दिन में कितनी बार झपकी आती है?', questionEn: 'How many times a day do you feel sleepy?' },
    // idx 57 — SLP06
    { complaintCode: 'SLP06', question: 'रात को सोने का समय क्या है?', questionEn: 'What is your night bedtime?' },
    // idx 58 — SLP07
    { complaintCode: 'SLP07', question: 'खर्राटे आते हैं? सांस रुकने की शिकायत भी है?', questionEn: 'Do you snore? Any complaints of breathing pauses too?' },
    // idx 59 — SLP07
    { complaintCode: 'SLP07', question: 'सुबह सिरदर्द या मुंह सूखना रहता है?', questionEn: 'Do you have morning headache or dry mouth?' },
    // idx 60 — SUB01 (alcohol units/day)
    { complaintCode: 'SUB01', question: 'रोज़ कितनी पेग या बोतल शराब पीते हैं?', questionEn: 'How many pegs or bottles of alcohol do you drink daily?' },
    // idx 61 — SUB01 (morning drinking)
    { complaintCode: 'SUB01', question: 'सुबह उठते ही पीने का मन होता है?', questionEn: 'Do you feel like drinking first thing in the morning?' },
    // idx 62 — SUB02
    { complaintCode: 'SUB02', question: 'शराब घटाने / बंद करने पर कंपन, पसीना या डर हुआ?', questionEn: 'On reducing or stopping alcohol did you get tremors, sweating or fear?' },
    // idx 63 — SUB02
    { complaintCode: 'SUB02', question: 'शराब कब से बंद की है?', questionEn: 'Since when have you stopped alcohol?' },
    // idx 64 — SUB03
    { complaintCode: 'SUB03', question: 'दिन में कितने पैकेट सिगरेट या पत्ते खाते हैं?', questionEn: 'How many cigarette packets or tobacco pouches a day?' },
    // idx 65 — SUB03 (failed quit attempts)
    { complaintCode: 'SUB03', question: 'पहले छोड़ने की कोशिश की है — क्या हुआ था?', questionEn: 'Have you tried quitting before — what happened then?' },
    // idx 66 — SUB04
    { complaintCode: 'SUB04', question: 'गांजा या अन्य नशा हफ्ते में कितनी बार?', questionEn: 'How many times a week is cannabis or other substance use?' },
    // idx 67 — SUB04
    { complaintCode: 'SUB04', question: 'नशा न मिलने पर गुस्सा, बेचैनी या भूख न लगना?', questionEn: 'Without the substance — anger, restlessness or loss of appetite?' },
    // idx 68 — SUB05
    { complaintCode: 'SUB05', question: 'कौन सी नींद की गोली चल रही है और कब से?', questionEn: 'Which sleeping pill is going on and since when?' },
    // idx 69 — SUB05
    { complaintCode: 'SUB05', question: 'बिना गोली के नींद आने की कोशिश की — क्या हुआ?', questionEn: 'Have you tried sleeping without the pill — what happened?' },
    // idx 70 — PSY01
    { complaintCode: 'PSY01', question: 'भूलना हाल के कितने महीनों में बढ़ा है?', questionEn: 'Over how many recent months has forgetfulness increased?' },
    // idx 71 — PSY01
    { complaintCode: 'PSY01', question: 'रास्ता या घर का पता भूलने जैसी घटनाएं हुई हैं?', questionEn: 'Have there been events like forgetting the way or home address?' },
    // idx 72 — PSY02
    { complaintCode: 'PSY02', question: 'हफ्ते में गुस्से के कितने विस्फोट होते हैं?', questionEn: 'How many anger outbursts occur in a week?' },
    // idx 73 — PSY02
    { complaintCode: 'PSY02', question: 'गुस्से में चीजें तोड़ना या मारपीट हो जाती है?', questionEn: 'Do you break things or get physical when angry?' },
    // idx 74 — PSY03
    { complaintCode: 'PSY03', question: 'रिश्ते की समस्या कितने समय से है?', questionEn: 'Since how long is the relationship problem?' },
    // idx 75 — PSY03
    { complaintCode: 'PSY03', question: 'साथी भी सलाह के लिए आने को तैयार है?', questionEn: 'Is the partner also willing to come for counselling?' },
    // idx 76 — PSY04
    { complaintCode: 'PSY04', question: 'बच्चे की उम्र क्या है और स्कूल से क्या शिकायत आती है?', questionEn: 'What is the age of the child and what complaints come from school?' },
    // idx 77 — PSY04
    { complaintCode: 'PSY04', question: 'बच्चा एक काम बैठकर कितनी देर कर पाता है?', questionEn: 'How long can the child sit and do one task?' },
    // idx 78 — PSY05
    { complaintCode: 'PSY05', question: 'बच्चे की उम्र क्या है?', questionEn: 'What is the age of the child?' },
    // idx 79 — PSY05
    { complaintCode: 'PSY05', question: 'बच्चा समझता तो है — ईशारे या शब्द कुछ बोलता है?', questionEn: 'Does the child understand — any gestures or words spoken?' },
    // idx 80 — PSY06
    { complaintCode: 'PSY06', question: 'कौन सी शारीरिक शिकायतें बार-बार आती हैं — दर्द, गैस, कमजोरी?', questionEn: 'Which physical complaints recur — pain, gas, weakness?' },
    // idx 81 — PSY06
    { complaintCode: 'PSY06', question: 'कितनी जांचें हुईं और रिपोर्टें क्या रहीं?', questionEn: 'How many investigations were done and what were the reports?' },
    // idx 82 — PSY07
    { complaintCode: 'PSY07', question: 'डिलीवरी कब हुई थी?', questionEn: 'When was the delivery?' },
    // idx 83 — PSY07
    { complaintCode: 'PSY07', question: 'उदासी या रोने का मन डिलीवरी के कितने दिन बाद से है?', questionEn: 'Since how many days after delivery is the sadness or crying?' },
    // idx 84 — PSY07 (post-partum harm screen)
    { complaintCode: 'PSY07', question: 'बच्चे की देखभाल में कठिनाई या खुद को नुकसान का ख्याल?', questionEn: 'Difficulty caring for the baby or thoughts of harming yourself?' },
    // idx 85 — PSY08
    { complaintCode: 'PSY08', question: 'अकेलापन कितने समय से महसूस होता है?', questionEn: 'Since when do you feel lonely?' },
    // idx 86 — PSY08
    { complaintCode: 'PSY08', question: 'दिन की दिनचर्या कैसी रहती है?', questionEn: 'How is the daily routine?' },
    // idx 87 — PSY08 (elderly suicide screen)
    { complaintCode: 'PSY08', question: 'क्या कभी लगता है कि अब जीने का कोई मतलब नहीं?', questionEn: 'Do you ever feel there is no meaning to living now?' },
    // idx 88 — PSY09 (current meds — continuation verify)
    { complaintCode: 'PSY09', question: 'अभी कौन सी दवाएं चल रही हैं?', questionEn: 'Which medicines are currently going on?' },
    // idx 89 — PSY09
    { complaintCode: 'PSY09', question: 'नींद कम या ज्यादा हो रही है? उत्तेजना या जल्दबाजी के लक्षण?', questionEn: 'Is sleep decreased or increased? Any excitement or racing symptoms?' },
    // idx 90 — PSY10
    { complaintCode: 'PSY10', question: 'कौन सी दवा चल रही है — कभी खुद बंद की थी?', questionEn: 'Which medicine is going on — did you ever stop it on your own?' },
    // idx 91 — PSY10 (hallucination screen)
    { complaintCode: 'PSY10', question: 'कान में आवाजें अभी भी सुनाई देती हैं जो दूसरों को नहीं?', questionEn: 'Do you still hear voices that others cannot hear?' },
    // idx 92 — PSY11
    { complaintCode: 'PSY11', question: 'महीने कितने समय से नहीं आ रहे हैं?', questionEn: 'Since how long are the periods absent?' },
    // idx 93 — PSY11 (weight change)
    { complaintCode: 'PSY11', question: 'इस दौरान वजन में कितना बदलाव हुआ?', questionEn: 'How much weight change happened during this time?' },
  ],

  // ══ Suggestions (188 — exactly 2 per question; questionIndex matches) ══
  suggestions: [
    // q0
    { questionIndex: 0, text: '2 हफ्ते से ज्यादा उदासी — डिप्रेशन इलाज योग्य है: यह कमज़ोरी नहीं, बीमारी है · संकट में: टेली-मानस 14416', textEn: 'Low mood over 2 weeks — depression is treatable: illness, not weakness · in crisis: Tele-MANAS 14416' },
    { questionIndex: 0, text: '6 महीने+ की उदासी — पुराना डिप्रेशन; दवा + काउंसलिंग दोनों जरूरी', textEn: 'Low mood 6+ months — chronic depression; both medicine and counselling needed' },
    // q1
    { questionIndex: 1, text: 'नींद-भूख दोनों बिगड़े — मध्यम डिप्रेशन का संकेत; जल्दी इलाज शुरू करें', textEn: 'Both sleep and appetite affected — sign of moderate depression; start treatment early' },
    { questionIndex: 1, text: 'नींद-भूख ठीक हैं — हल्का एपिसोड; जीवनशैली + काउंसलिंग से अक्सर सुधार', textEn: 'Sleep and appetite fine — mild episode; lifestyle + counselling often suffice' },
    // q2 (suicide screen)
    { questionIndex: 2, text: 'हाँ — आपातकाल: टेली-मानस 14416 (मुफ्त 24×7) · आपातकाल 112 · मरीज़ को अकेला न छोड़ें · दवा घर में 1 हफ्ते से ज्यादा न रखें', textEn: 'Yes — emergency: Tele-MANAS 14416 (free 24×7) · emergency 112 · never leave the patient alone · keep no more than 1 week of medicines at home' },
    { questionIndex: 2, text: 'नहीं — फिर भी उदासी 2 हफ्ते+ हो तो इलाज जरूरी; परिवार से कहें — डांटने से नहीं, साथ देने से सुधार होता है', textEn: 'No — still treat if sadness is 2+ weeks; tell family — scolding never helps, support does' },
    // q3
    { questionIndex: 3, text: 'रुचि लगभग खत्म — एन्हेडोनिया, डिप्रेशन का मुख्य लक्षण; दवा जरूरी · संकट में: टेली-मानस 14416', textEn: 'Interest nearly gone — anhedonia, a core depression symptom; medicine needed · in crisis: Tele-MANAS 14416' },
    { questionIndex: 3, text: 'कुछ कामों में रुचि बची है — अच्छा संकेत; वही काम रोज़ करते रहें', textEn: 'Some interest preserved — good sign; keep doing those activities daily' },
    // q4
    { questionIndex: 4, text: '2 हफ्ते+ लगातार अनासक्ति — डिप्रेशन एपिसोड मानकर इलाज करें · संकट में: टेली-मानस 14416', textEn: 'Anhedonia 2+ weeks continuous — treat as a depressive episode · in crisis: Tele-MANAS 14416' },
    { questionIndex: 4, text: 'बस कुछ दिन से — तनाव की घटना देखें; 2 हफ्ते पार हों तो दोबारा मिलें', textEn: 'Only a few days — look for a stressor; revisit if it crosses 2 weeks' },
    // q5
    { questionIndex: 5, text: 'रोज़ रोना आता है — भावनात्मक अस्थिरता; मूड चार्ट भरकर लाएं · संकट में: टेली-मानस 14416', textEn: 'Crying daily — emotional lability; bring a filled mood chart · in crisis: Tele-MANAS 14416' },
    { questionIndex: 5, text: 'कभी-कभी रोना आम है — रोना दबाएं नहीं, भावना निकलने दें', textEn: 'Occasional crying is normal — do not suppress; let emotions out' },
    // q6 (family history)
    { questionIndex: 6, text: 'परिवार में मानसिक बीमारी — जोखिम ज्यादा; जल्दी इलाज शुरू करना फायदेमंद', textEn: 'Family history of mental illness — higher risk; early treatment helps' },
    { questionIndex: 6, text: 'परिवार में कोई इतिहास नहीं — फिर भी लक्षण 2 हफ्ते+ हों तो इलाज लें', textEn: 'No family history — still take treatment if symptoms are 2+ weeks' },
    // q7
    { questionIndex: 7, text: 'खुद को सब दोष देना — डिप्रेशन का सोच-विकार; बीमारी बोल रही है, आप नहीं · संकट में: टेली-मानस 14416', textEn: 'Self-blame for everything — depressive thinking; it is the illness speaking, not you · in crisis: Tele-MANAS 14416' },
    { questionIndex: 7, text: 'एक विशेष घटना का दोष — काउंसलिंग से अपराध-भावना कम करें', textEn: 'Guilt about one specific event — reduce it via counselling' },
    // q8
    { questionIndex: 8, text: 'शोक / घटना के 2 महीने+ बाद भी उदासी — शोक डिप्रेशन में बदल गया; इलाज जरूरी · संकट में: टेली-मानस 14416', textEn: 'Sadness persists 2+ months after the loss — grief has become depression; treatment needed · in crisis: Tele-MANAS 14416' },
    { questionIndex: 8, text: 'घटना के 1-2 महीने भीतर — सामान्य शोक; परिवार साथ दे, अकेलापन न होने दे', textEn: 'Within 1-2 months of the event — normal grief; family support, no isolation' },
    // q9 (suicide screen)
    { questionIndex: 9, text: 'हाँ — आपातकाल 112 / टेली-मानस 14416 अभी; घर पर दवा व धारदार चीजें हटाएं; मरीज़ को अकेला न छोड़ें', textEn: 'Yes — emergency 112 / Tele-MANAS 14416 now; remove medicines and sharp items at home; never leave alone' },
    { questionIndex: 9, text: 'नहीं — अच्छा; मूड चार्ट + 14 दिन में फॉलो-अप; बिगड़े तो तुरंत आएं', textEn: 'No — good; mood chart + follow-up in 14 days; come immediately if it worsens' },
    // q10
    { questionIndex: 10, text: 'दिन में कई बार नकारात्मक विचार — लिखें, फाड़ें, 10 मिनट टहलें (विचार-रोकथाम) · संकट में: टेली-मानस 14416', textEn: 'Negative thoughts many times a day — write, tear, walk 10 minutes (thought-stopping) · in crisis: Tele-MANAS 14416' },
    { questionIndex: 10, text: 'थोड़ी बार — सुबह की धूप + 30 मिनट टहलना सिद्ध असर करता है', textEn: 'Occasional — morning sunlight + 30-minute walk has proven effect' },
    // q11 (functioning impact)
    { questionIndex: 11, text: 'काम / पढ़ाई बंद होने लगी — कार्य-क्षमता गिरना मध्यम+ गंभीरता; दवा शुरू करें · संकट में: टेली-मानस 14416', textEn: 'Work or studies stopping — functional decline means moderate-plus severity; start medicine · in crisis: Tele-MANAS 14416' },
    { questionIndex: 11, text: 'काम चल रहा है — हल्का स्तर; काउंसलिंग + दिनचर्या पहले आज़माएं', textEn: 'Work continuing — mild level; try counselling + routine first' },
    // q12 (suicide screen)
    { questionIndex: 12, text: 'हाँ — यह आपातकाल है: टेली-मानस 14416 · आपातकाल 112 · अकेला न छोड़ें · दवा सिर्फ 1 हफ्ते की रखें', textEn: 'Yes — this is an emergency: Tele-MANAS 14416 · emergency 112 · never leave alone · keep only 1 week of medicine' },
    { questionIndex: 12, text: 'नहीं — विचार लिखकर दूर करें; नींद पूरी करें — नींद घटने से विचार बढ़ते हैं', textEn: 'No — write the thoughts away; complete your sleep — poor sleep multiplies thoughts' },
    // q13 (diurnal variation)
    { questionIndex: 13, text: 'सुबह ज्यादा चिड़चिड़ापन — डिप्रेशन का सुबह-बदतर (diurnal) पैटर्न; दवा सोचें · संकट में: टेली-मानस 14416', textEn: 'Morning-worse irritability — diurnal pattern of depression; consider medicine · in crisis: Tele-MANAS 14416' },
    { questionIndex: 13, text: 'शाम को ज्यादा — थकान से जुड़ा; दिन के ब्रेक + शाम की टहल दें', textEn: 'Evening-worse — fatigue-linked; give day breaks + evening walks' },
    // q14 (support system)
    { questionIndex: 14, text: 'घर में तनाव / लड़ाई — परिवार को समझाएं: मानसिक बीमारी भी शरीर की बीमारी जैसी है — इलाज से ठीक होती है', textEn: 'Stress or fights at home — explain to family: mental illness is like physical illness — treatable' },
    { questionIndex: 14, text: 'घर का सहयोग है — अच्छा; रिकवरी तेज होगी; चार्ट साथ मिलकर भरवाएं', textEn: 'Family supportive — good; recovery is faster; have them fill the chart together' },
    // q15
    { questionIndex: 15, text: 'बोर्ड / प्रतियोगी परीक्षा — उम्मीदों का बोझ सीमित करें; 7-8 घंटे नींद बच्चे से न कटवाएं', textEn: 'Board or competitive exam — cap the burden of expectations; do not cut the 7-8 hour sleep' },
    { questionIndex: 15, text: 'कम उम्र (5-10 वर्ष) — स्कूल से बार-बार शिकायत आती हो तो बाल-मनो रेफर सोचें', textEn: 'Younger age (5-10 years) — if school complaints recur, consider child-psychology referral' },
    // q16
    { questionIndex: 16, text: 'एकाग्रता 20-30 मिनट से कम — पढ़ाई की जगह बदलें; 50 मिनट पढ़ाई + 10 मिनट ब्रेक के चक्र', textEn: 'Concentration under 20-30 minutes — change study spot; 50-minute study + 10-minute break cycles' },
    { questionIndex: 16, text: 'एकाग्रता ठीक है — तनाव आगे न बढ़ने दें; रोज़ खेल / शारीरिक गतिविधि जरूरी', textEn: 'Concentration fine — do not let stress build; daily play or physical activity is a must' },
    // q17 (student suicide screen)
    { questionIndex: 17, text: 'हाँ — छात्र आत्महत्या रोकना प्रथम लक्ष्य: उसी दिन मनोचिकित्सक + टेली-मानस 14416; माता-पिता को बताना अनिवार्य; बच्चे को अकेला न छोड़ें', textEn: 'Yes — preventing student suicide is the first goal: psychiatrist the same day + Tele-MANAS 14416; informing parents is mandatory; never leave the child alone' },
    { questionIndex: 17, text: 'नहीं — अच्छा; परीक्षा-तैयारी में नींद 7 घंटे से कम न हो; रात को सोशल मीडिया बंद', textEn: 'No — good; keep exam-prep sleep above 7 hours; social media off at night' },
    // q18
    { questionIndex: 18, text: '10-12 घंटे+ काम — बर्नआउट का जोखिम; हफ्ते में 1 दिन पूरी छुट्टी रखें · संकट में: टेली-मानस 14416', textEn: 'Work 10-12+ hours — burnout risk; keep one full off-day a week · in crisis: Tele-MANAS 14416' },
    { questionIndex: 18, text: '8 घंटे या कम — काम की मात्रा ठीक; मन का बोझ बात करके निकालें', textEn: '8 hours or less — workload fine; unload the mind by talking it out' },
    // q19 (previous treatment)
    { questionIndex: 19, text: 'पहले इलाज छोड़ा था — अच्छा जवाब आया था तो वही दवा दोबारा सोचें; अचानक बंद करने का कारण पूछें', textEn: 'Stopped earlier treatment — if response was good, consider the same medicine again; ask why it was stopped abruptly' },
    { questionIndex: 19, text: 'पहले कभी इलाज नहीं — पहली बार: कम खुराक से शुरुआत, 2 हफ्ते में समीक्षा', textEn: 'Never treated before — first time: start low dose, review in 2 weeks' },
    // q20
    { questionIndex: 20, text: 'मौत / तलाक / बेरोज़गारी के बाद — समायोजन प्रतिक्रिया; सामाजिक सहयोग + काउंसलिंग 1 महीना', textEn: 'After death, divorce or job loss — adjustment reaction; social support + counselling for 1 month' },
    { questionIndex: 20, text: 'शहर / ट्रांसफर बदला — नई जगह रूटीन बनाएं: टहलना, सभा / मंदिर, पड़ोसियों से मिलना', textEn: 'City or transfer change — build a routine in the new place: walks, community gatherings, meeting neighbours' },
    // q21
    { questionIndex: 21, text: '6 महीने+ भी समायोजन नहीं — डिप्रेशन में बदल रहा है; दवा सोचें · संकट में: टेली-मानस 14416', textEn: 'Still not adjusted at 6+ months — turning into depression; consider medicine · in crisis: Tele-MANAS 14416' },
    { questionIndex: 21, text: 'धीरे-धीरे समायोजन हो रहा — सामान्य; रोज़ की दिनचर्या जारी रखें', textEn: 'Slowly adjusting — normal; keep the daily routine going' },
    // q22
    { questionIndex: 22, text: 'दिनभर की चिंता — GAD की पहचान; चिंता-डायरी: कागज़ पर उतरती है', textEn: 'All-day worry — hallmark of GAD; worry diary: it lands on paper' },
    { questionIndex: 22, text: 'कुछ घंटे — सीमित चिंता; 4-7-8 श्वास: 4 सेकंड लें · 7 रोकें · 8 छोड़ें, दिन में 2 बार', textEn: 'A few hours — limited worry; 4-7-8 breathing: in 4 sec · hold 7 · out 8, twice daily' },
    // q23
    { questionIndex: 23, text: 'धड़कन-कांपन साथ — शारीरिक चिंता; थायरॉइड (TSH) निकालना न भूलें', textEn: 'Palpitations with trembling — somatic anxiety; do not forget thyroid (TSH)' },
    { questionIndex: 23, text: 'शरीर पर असर नहीं — मानसिक स्तर की चिंता; विश्राम-अभ्यास से अक्सर काफी', textEn: 'No body symptoms — mental-level worry; relaxation practice often suffices' },
    // q24
    { questionIndex: 24, text: 'शाम को बेचैनी ज्यादा — दिन के तनाव का जमाव; शाम की 30 मिनट टहल रोज़', textEn: 'Evening-worse restlessness — accumulated day stress; 30-minute evening walk daily' },
    { questionIndex: 24, text: 'सुबह से बेचैनी — डिप्रेशन-मिश्रित संभावना; मूड भी पूछें', textEn: 'Restless from the morning — depression-mixed possibility; ask about mood too' },
    // q25
    { questionIndex: 25, text: 'बैठकर काम नहीं होता — कार्य-क्षमता प्रभावित; दवा सोचें + काम छोटे टुकड़ों में', textEn: 'Cannot complete seated work — functioning affected; consider medicine + break work into small pieces' },
    { questionIndex: 25, text: 'काम पूरा हो जाता है — हल्की बेचैनी; कैफीन (चाय / कॉफी) 2 कप प्रतिदिन सीमित करें', textEn: 'Task gets done — mild restlessness; limit caffeine (tea / coffee) to 2 cups a day' },
    // q26
    { questionIndex: 26, text: '10-20 मिनट में चरम फिर ठीक — क्लासिक पैनिक; यह हार्ट-अटैक नहीं, घबराहट है — समझाना इलाज का हिस्सा', textEn: 'Peaks in 10-20 min then settles — classic panic; explaining that it is not a heart attack is part of treatment' },
    { questionIndex: 26, text: 'घंटों चलता है — लंबी चिंता; GAD की ओर देखें', textEn: 'Lasts hours — prolonged worry; look towards GAD' },
    // q27
    { questionIndex: 27, text: '4+ अटैक / हफ्ता — SSRI शुरू करें; बार-बार ER जाना रुकेगा', textEn: '4+ attacks a week — start an SSRI; repeated ER visits will stop' },
    { questionIndex: 27, text: 'महीने में 1-2 — सांस-तकनीक सीखें; पहले संकेत पर 4-7-8 श्वास शुरू करें', textEn: '1-2 a month — learn the breathing technique; start 4-7-8 at the very first cue' },
    // q28
    { questionIndex: 28, text: 'बाज़ार-बस-भीड़ से डर — एगोराफोबिया पैटर्न; शुरुआत में साथ लेकर जाना ठीक है', textEn: 'Fear of market-bus-crowd — agoraphobia pattern; accompanied outings are fine initially' },
    { questionIndex: 28, text: 'एक जगह विशेष — सीमित फोबिया; उसी जगह का धीरे-धीरे अभ्यास (exposure) कराएं', textEn: 'One specific place — limited phobia; gradual exposure practice with that same place' },
    // q29
    { questionIndex: 29, text: 'अकेले बाहर नहीं — एगोराफोबिया बढ़ रहा है; साथी के साथ छोटी-छोटी बाहर यात्राओं की योजना', textEn: 'Cannot go out alone — agoraphobia growing; plan small graded outings with a companion' },
    { questionIndex: 29, text: 'अकेले जा पाते हैं — हल्का; स्वतंत्रता बनाए रखें', textEn: 'Can go out alone — mild; preserve the independence' },
    // q30
    { questionIndex: 30, text: 'सार्वजनिक बोलना / खाना — सोशल एंग्ज़ायटी; छोटे समूह में अभ्यास शुरू करें', textEn: 'Public speaking or eating — social anxiety; start practising in small groups' },
    { questionIndex: 30, text: 'लोगों की नज़र / जज किए जाने का डर — सोशल फोबिया; CBT काउंसलिंग रेफर करें', textEn: 'Fear of being watched or judged — social phobia; refer for CBT counselling' },
    // q31 (avoidance)
    { questionIndex: 31, text: 'टालना बढ़ गया — फोबिया मजबूत हो रहा है; टालना कम करना ही इलाज की शुरुआत', textEn: 'Avoidance has grown — the phobia is strengthening; cutting avoidance is where treatment begins' },
    { questionIndex: 31, text: 'मिलना-बोलना जारी — अच्छा; डर वाली जगहों पर रुकने का अभ्यास लाएं', textEn: 'Still meeting and talking — good; practise pausing in feared situations' },
    // q32
    { questionIndex: 32, text: 'लिफ्ट / ऊंचाई / जानवर — सीमित फोबिया; चित्र → वीडियो → वास्तविक — क्रमबद्ध अभ्यास', textEn: 'Lift / height / animal — specific phobia; picture → video → real — graded practice' },
    { questionIndex: 32, text: 'अंधेरा (बच्चों में आम) — रात-लैंप + धीरे-धीरे अभ्यास; डांटना नहीं', textEn: 'Dark (common in children) — night lamp + gradual practice; never scold' },
    // q33
    { questionIndex: 33, text: 'रोज़ का काम रुकता है — इलाज जरूरी; टालें नहीं', textEn: 'Daily work disrupted — treatment needed; do not delay' },
    { questionIndex: 33, text: 'काम-काज ठीक — हल्का; स्व-अभ्यास काफी है', textEn: 'Daily routine intact — mild; self-practice suffices' },
    // q34
    { questionIndex: 34, text: 'तनाव-सिरदर्द साथ बढ़ते हैं — मन-शरीर जुड़ाव; गर्दन-कंधे रोज़ ढीले करें', textEn: 'Stress and headache rise together — mind-body link; loosen neck and shoulders daily' },
    { questionIndex: 34, text: 'तनाव से नहीं बदलता — माइग्रेन / आंख की जांच कराएं', textEn: 'Unchanged by stress — get migraine or eye evaluation' },
    // q35
    { questionIndex: 35, text: 'फीते जैसा कसाव — टेंशन-टाइप; स्क्रीन-ब्रेक + श्वास-अभ्यास', textEn: 'Band-like tightness — tension type; screen breaks + breathing practice' },
    { questionIndex: 35, text: 'आधे सिर में धड़कन — माइग्रेन जांचें', textEn: 'Throbbing in half the head — check for migraine' },
    // q36
    { questionIndex: 36, text: 'दिन में 10+ बार विचार — मध्यम+ OCD; दवा (उच्च-खुराक SSRI) + ERP दोनों', textEn: 'Thoughts 10+ times a day — moderate-plus OCD; both high-dose SSRI and ERP' },
    { questionIndex: 36, text: 'कम बार — हल्का; विचार को जवाब देना बंद करें — न लड़ें, न मानें', textEn: 'Fewer times — mild; stop answering the thoughts — neither fight nor obey' },
    // q37
    { questionIndex: 37, text: 'तीव्र बेचैनी — विचार न जाएं तो 8-10 मिनट श्वास पर रुकें; यह मेरा विचार है, सच नहीं', textEn: 'Severe distress — when thoughts do not leave, pause 8-10 minutes on breathing; it is my thought, not a fact' },
    { questionIndex: 37, text: 'हल्की बेचैनी — सहन-कौशल बढ़ रहा है; अभ्यास जारी रखें', textEn: 'Mild distress — tolerance is building; keep practising' },
    // q38
    { questionIndex: 38, text: '20+ बार / दिन या 1 घंटा+ — कंपल्शन भारी; दवा + ERP रेफर', textEn: '20+ times a day or 1 hour+ — heavy compulsions; medicine + ERP referral' },
    { questionIndex: 38, text: 'मध्यम (5-10 बार) — गिनती का रजिस्टर रखें; हर हफ्ते 1-2 कम करने का लक्ष्य', textEn: 'Moderate (5-10 times) — keep a count register; aim to cut 1-2 each week' },
    // q39
    { questionIndex: 39, text: 'रोक पाते हैं — अच्छा संकेत; 15 मिनट प्रतीक्षा-अभ्यास से मजबूत करें', textEn: 'Able to resist — good sign; strengthen with 15-minute delay practice' },
    { questionIndex: 39, text: 'बिल्कुल नहीं रुकता — उपचार रेफर; खुद से लड़ना छोड़ें — बीमारी है, जिद नहीं', textEn: 'Cannot resist at all — refer for treatment; stop fighting yourself — it is illness, not stubbornness' },
    // q40
    { questionIndex: 40, text: 'ताला-गैस-दरवाजा जांचना — जांच-कंपल्शन; एक बार जांचकर मुंह से कहें — बंद है', textEn: 'Lock-gas-door checking — checking compulsion; check once and say done aloud' },
    { questionIndex: 40, text: 'रिश्ते / ईमानदारी पर शक — विचार-केंद्रित; काउंसलिंग (ERP) मदद करती है', textEn: 'Doubts about relationships or honesty — thought-focused; counselling (ERP) helps' },
    // q41
    { questionIndex: 41, text: '2 घंटे+ जांच में — गंभीर OCD; विशेषज्ञ रेफर + दवा', textEn: '2+ hours checking — severe OCD; specialist referral + medicine' },
    { questionIndex: 41, text: '30 मिनट से कम — हल्का; जांच की समय-सीमा तय करें', textEn: 'Under 30 minutes — mild; set a time cap for checking' },
    // q42
    { questionIndex: 42, text: '6 घंटे+ स्क्रीन — नींद-चक्र टूटता है; नियम: रात 10 बजे के बाद स्क्रीन बंद', textEn: '6+ hours screen — sleep cycle breaks; rule: screens off after 10 pm' },
    { questionIndex: 42, text: '2-4 घंटे — सीमा पर; खेल व खाने के समय फोन दूर रखें', textEn: '2-4 hours — borderline; keep the phone away at play and meal times' },
    // q43
    { questionIndex: 43, text: 'खाना-नींद छूट रही है — लत की कीमत; डिजिटल-उपवास के दिन तय करें', textEn: 'Meals and sleep being skipped — the cost of addiction; fix digital-fasting days' },
    { questionIndex: 43, text: 'दिनचर्या चल रही है — नियंत्रित; स्क्रीन-समय शौक बने, उल्टा नहीं', textEn: 'Routine intact — controlled; let screen time be a hobby, not the reverse' },
    // q44 (continuation verify)
    { questionIndex: 44, text: 'दवा जारी है — खुराक सत्यापित करें; OCD में खुराक ऊंची और कोर्स लंबा (10-12 हफ्ते+) चाहिए', textEn: 'Medicine ongoing — verify dose; OCD needs higher doses and longer courses (10-12 weeks+)' },
    { questionIndex: 44, text: 'दवा खुद बंद कर ली थी — पहले अच्छा जवाब आया था तो फिर शुरू करें; बंद करने का कारण जानें', textEn: 'Stopped it yourself — restart if earlier response was good; learn why it was stopped' },
    // q45
    { questionIndex: 45, text: '50% से कम नियंत्रण — खुराक-समीक्षा या वृद्धि सोचें; ERP जोड़ें', textEn: 'Control under 50% — consider dose review or increase; add ERP' },
    { questionIndex: 45, text: '70%+ नियंत्रण — अच्छा; दवा जारी रखें — अचानक बंद करने से वापसी आम है', textEn: 'Control 70%+ — good; continue medicine — abrupt stop commonly relapses' },
    // q46
    { questionIndex: 46, text: '30-60 मिनट+ लगते हैं — नींद-स्वच्छता: बिस्तर = केवल नींद; 20 मिनट न आए तो उठ जाएं', textEn: 'Takes 30-60+ minutes — sleep hygiene: bed = sleep only; if not asleep in 20 minutes, get up' },
    { questionIndex: 46, text: '10-20 मिनट में आ जाती है — सामान्य; शाम 4 बजे के बाद चाय / कॉफी बंद रखें', textEn: 'Falls asleep in 10-20 minutes — normal; no tea / coffee after 4 pm' },
    // q47
    { questionIndex: 47, text: '3 महीने+ अनिद्रा — पुरानी; व्यवहार-विधियां (CBT-i ढंग के) + दवा शॉर्ट-कोर्स', textEn: 'Insomnia 3+ months — chronic; behavioural methods (CBT-i style) + short-course medicine' },
    { questionIndex: 47, text: 'हाल की घटना से — तीव्र; आमतौर पर 1-2 हफ्ते में सुधार; नींद-स्वच्छता अपनाएं', textEn: 'After a recent event — acute; usually settles in 1-2 weeks; adopt sleep hygiene' },
    // q48
    { questionIndex: 48, text: '3+ बार टूटती है — जागने के बाद घड़ी न देखें; धीमी श्वास, आंख बंद पड़े रहें', textEn: 'Breaks 3+ times — do not check the clock after waking; slow breathing, stay lying with eyes closed' },
    { questionIndex: 48, text: '1-2 बार — सामान्य सीमा; रात का पानी सीमित करें', textEn: '1-2 times — within normal; limit night water' },
    // q49
    { questionIndex: 49, text: 'घंटों जागते रहते हैं — बीच-रात अनिद्रा; 20-नियम: न आए तो दूसरे कमरे में मद्धम रोशनी में बैठें', textEn: 'Awake for hours — middle insomnia; 20-rule: if not asleep, sit in another dim room' },
    { questionIndex: 49, text: 'जल्दी आ जाती है — अच्छा; कुछ न बदलें', textEn: 'Falls back soon — good; change nothing' },
    // q50
    { questionIndex: 50, text: '4-5 बजे जागना और मन भारी — डिप्रेशन का सुबह-जल्दी पैटर्न; मूड परखें', textEn: 'Waking at 4-5 am with heavy mood — early-morning pattern of depression; screen mood' },
    { questionIndex: 50, text: '6 बजे नियमित जागना — स्वस्थ पैटर्न', textEn: 'Regular 6 am waking — healthy pattern' },
    // q51
    { questionIndex: 51, text: 'दोबारा नींद नहीं आती — नींद-घाटा जमा होता है; दिन में झपकी न लें, शाम को थक कर सोएं', textEn: 'Cannot sleep again — sleep debt builds; no day naps, sleep tired by evening' },
    { questionIndex: 51, text: 'दोबारा आ जाती है — ठीक; उठने का समय रोज़ एक ही रखें', textEn: 'Sleeps again — fine; keep the same wake time daily' },
    // q52
    { questionIndex: 52, text: 'रोज़ 6 घंटे से कम — अपर्याप्त; 7-8 घंटे लक्ष्य; दिन की झपकी रद्द करें', textEn: 'Under 6 hours daily — insufficient; target 7-8 hours; cancel day naps' },
    { questionIndex: 52, text: '7+ घंटे — मात्रा ठीक; तरोताज़ा न लगे तो गुणवत्ता देखें', textEn: '7+ hours — quantity fine; if unrested, look at quality' },
    // q53
    { questionIndex: 53, text: 'दिनभर थकान — नींद-गुणवत्ता की समस्या; स्क्रीन, कैफीन व शराब रात के तीन दोषी', textEn: 'All-day fatigue — sleep-quality problem; screens, caffeine and alcohol are the three night culprits' },
    { questionIndex: 53, text: 'दिन ठीक चलता है — अच्छा; रोज़ की दिनचर्या जारी रखें', textEn: 'Days go fine — good; continue the routine' },
    // q54
    { questionIndex: 54, text: 'हफ्ते में 2+ बुरे सपने — तनाव / घटना की प्रक्रिया; सोने से पहले शांत रूटीन (पढ़ना, गर्म पानी)', textEn: '2+ nightmares a week — processing of stress or events; calming pre-bed routine (reading, warm shower)' },
    { questionIndex: 54, text: 'कभी-कभी — सामान्य; रात का भारी खाना टालें', textEn: 'Occasional — normal; avoid heavy late meals' },
    // q55
    { questionIndex: 55, text: 'डर-पसीने से बार-बार जागना — आघात (trauma) जांचें; विशेष काउंसलिंग चाहिए', textEn: 'Repeated waking with fear or sweat — screen for trauma; needs dedicated counselling' },
    { questionIndex: 55, text: 'नहीं — सामान्य सपने; चिंता न करें', textEn: 'No — ordinary dreams; do not worry' },
    // q56
    { questionIndex: 56, text: 'दिन में 3+ झपकी — रात की नींद की भरपाई नहीं हो पा रही; पहले रात ठीक करें', textEn: '3+ day dozes — night sleep is not repaying; fix the night first' },
    { questionIndex: 56, text: 'दोपहर की 1 झपकी — ठीक; 20-30 मिनट से लंबी न हो', textEn: 'One afternoon nap — fine; keep it under 20-30 minutes' },
    // q57
    { questionIndex: 57, text: '12 बजे के बाद सोना — स्क्रीन मेलाटोनिन को देर करती है; रोज़ 15 मिनट पहले लाएं', textEn: 'Sleeping past midnight — screens delay melatonin; pull it earlier by 15 minutes daily' },
    { questionIndex: 57, text: '10-11 बजे — स्वस्थ समय; वही बनाए रखें', textEn: '10-11 pm — healthy timing; keep it' },
    // q58
    { questionIndex: 58, text: 'खर्राटे + सांस रुकना — नींद-श्वास-रोध (OSA): स्लीप-स्टडी रेफर जरूरी', textEn: 'Snoring + breathing pauses — obstructive sleep apnea: sleep-study referral essential' },
    { questionIndex: 58, text: 'सिर्फ हल्के खर्राटे — वजन घटाएं, करवट लेकर सोएं, रात की शराब बंद', textEn: 'Only mild snoring — reduce weight, side-sleep, no night alcohol' },
    // q59
    { questionIndex: 59, text: 'सुबह सिरदर्द + मुंह सूखना — OSA के संकेत; स्लीप-स्टडी कराएं', textEn: 'Morning headache + dry mouth — signs of OSA; get a sleep study' },
    { questionIndex: 59, text: 'सुबह तरोताज़ा — अच्छा; नींद पैटर्न बनाए रखें', textEn: 'Fresh in the morning — good; keep the sleep pattern' },
    // q60 (alcohol units)
    { questionIndex: 60, text: 'रोज़ 6+ पेग या आधी+ बोतल — निर्भरता जोखिम; कभी भी अचानक बंद नहीं — दौरे का खतरा; डॉक्टर से घटाने की योजना बनवाएं', textEn: 'Daily 6+ pegs or half+ bottle — dependence risk; never stop suddenly — seizure risk; plan reduction with a doctor' },
    { questionIndex: 60, text: 'सीमित (1-2 पेग, कभी-कभी) — सीमा में; हफ्ते में 3+ शराब-मुक्त दिन रखें', textEn: 'Limited (1-2 pegs, occasional) — within limits; keep 3+ alcohol-free days a week' },
    // q61 (morning drinking)
    { questionIndex: 61, text: 'सुबह उठते ही पीने का मन — निर्भरता का बड़ा संकेत; एंटी-क्रेविंग दवा + काउंसलिंग शुरू करें', textEn: 'Drinking on waking — major dependence sign; start anti-craving medicine + counselling' },
    { questionIndex: 61, text: 'सुबह नहीं — निर्भरता कम; रुकने का प्रयास अभी आसान है', textEn: 'Not in the morning — low dependence; quitting is easier now' },
    // q62
    { questionIndex: 62, text: 'कंपन + पसीना + डर — शराब-विद्रेही; घर पर अचानक-बंद खतरनाक (दौरे): डिटॉक्स भर्ती रेफर करें', textEn: 'Tremor + sweat + fear — alcohol withdrawal; abrupt home stop is dangerous (seizures): refer for supervised detox admission' },
    { questionIndex: 62, text: 'हल्की बेचैनी भर — हल्का विद्रेही; फिर भी डॉक्टर की देखरेख में ही घटाएं', textEn: 'Only mild restlessness — mild withdrawal; still reduce only under medical supervision' },
    // q63
    { questionIndex: 63, text: '6-48 घंटे में शुरू हुआ और बढ़ रहा है — विद्रेही चरम; आज ही ER / भर्ती — देर से दौरे आ सकते हैं', textEn: 'Started within 6-48 hours and rising — withdrawal peak; ER or admission today — seizures can come late' },
    { questionIndex: 63, text: '3+ दिन हो गए, अब घट रहा है — खतरा कम; विटामिन + फॉलो-अप + पुनरावृत्ति-रोकथाम जारी रखें', textEn: '3+ days passed, now reducing — danger lowering; continue vitamins + follow-up + relapse prevention' },
    // q64
    { questionIndex: 64, text: '20+ सिगरेट / दिन या भारी गुटखा — उच्च निर्भरता; NRT 4mg + बुप्रोपियन सोचें; छोड़ने की तारीख तय करें', textEn: '20+ cigarettes a day or heavy pouches — high dependence; consider NRT 4 mg + bupropion; set a quit date' },
    { questionIndex: 64, text: 'कम (10 या उससे कम प्रतिदिन) — हल्की निर्भरता; 2mg गम + अगले हफ्ते छोड़ने की तारीख', textEn: 'Light (10 or fewer a day) — mild dependence; 2 mg gum + quit date next week' },
    // q65 (failed quit attempts)
    { questionIndex: 65, text: '3+ असफल कोशिशें — दवा-सहायता जोड़ें (बुप्रोपियन / NRT); अकेले इरादा काफी नहीं होता', textEn: '3+ failed attempts — add medicine support (bupropion / NRT); willpower alone is not enough' },
    { questionIndex: 65, text: 'पहली कोशिश होगी — तैयारी-जोड़ी विधि: तारीख तय, लोगों को बताएं, विकल्प तैयार', textEn: 'First attempt — paired-prep method: fix a date, tell people, ready alternatives' },
    // q66
    { questionIndex: 66, text: 'रोज़ गांजा — निर्भरता बन चुकी है; काउंसलिंग + परिवार की भागीदारी जरूरी', textEn: 'Daily cannabis — dependence has formed; counselling + family participation essential' },
    { questionIndex: 66, text: 'कभी-कभी — सामाजिक इस्तेमाल; बढ़ने के बीज (escapism) पूछें', textEn: 'Occasional — social use; probe the seeds of escalation (escapism)' },
    // q67
    { questionIndex: 67, text: 'गुस्सा / बेचैनी बिना नशे — विद्रेही शुरुआत; रुकने का निर्णय मेडिकल सलाह से लें', textEn: 'Anger or restlessness without the substance — early withdrawal; make the stopping decision with medical advice' },
    { questionIndex: 67, text: 'कोई फर्क नहीं पड़ता — निर्भरता नहीं; इरादे को सामाजिक सहारा दें', textEn: 'No difference — no dependence; give the resolve social scaffolding' },
    // q68
    { questionIndex: 68, text: '3 महीने+ नींद की गोली — निर्भरता जोखिम; धीरे-धीरे घटाने (taper) की योजना बनाएं — अचानक बंद खतरनाक', textEn: 'Sleeping pill 3+ months — dependence risk; build a gradual taper plan — abrupt stop is dangerous' },
    { questionIndex: 68, text: 'कुछ हफ्तों से — सीमा में; कोर्स 2-4 हफ्ते का ही रखें; शराब के साथ कभी नहीं — घातक गहरी नींद', textEn: 'Only a few weeks — within limits; keep courses 2-4 weeks; never with alcohol — fatal deep sleep' },
    // q69
    { questionIndex: 69, text: 'बिना गोली नींद नहीं आई — वैकल्पिक रूटीन मजबूत करें: निश्चित जागने का समय, श्वास-अभ्यास', textEn: 'No sleep without the pill — strengthen alternatives: fixed wake time, breathing practice' },
    { questionIndex: 69, text: 'बिना भी आ जाती है — अच्छा; गोली को SOS बना दें, रोज़ नहीं', textEn: 'Sleeps without it too — good; make the pill SOS, not daily' },
    // q70
    { questionIndex: 70, text: '6 महीने+ बढ़ता भूलना — उम्र 60+ हो तो डिमेंशिया-जांच (न्यूरो रेफर) कराएं', textEn: 'Forgetfulness rising 6+ months — at 60+ years get a dementia workup (neurology referral)' },
    { questionIndex: 70, text: 'हाल के तनाव / नींद से जुड़ा — ध्यान की समस्या, स्मृति नहीं; पहले नींद सुधारें', textEn: 'Linked to recent stress or poor sleep — an attention issue, not memory; fix sleep first' },
    // q71
    { questionIndex: 71, text: 'रास्ता / घर भूलना — गंभीर संकेत; आज ही न्यूरो-मूल्यांकन; अकेले भटकना रोकें (ID कार्ड साथ रखें)', textEn: 'Forgetting the way or home — serious sign; neurology evaluation today; prevent wandering (keep an ID card)' },
    { questionIndex: 71, text: 'नाम-चीजें भूलना भर — उम्र के साथ सामान्य; सूची और दिनचर्या से कम करें', textEn: 'Only names or objects — normal ageing; reduce with lists and routine' },
    // q72
    { questionIndex: 72, text: 'हफ्ते में 3+ विस्फोट — आवेग-नियंत्रण समस्या; गुस्सा-डायरी: ट्रिगर लिखें', textEn: '3+ outbursts a week — impulse-control problem; anger diary: write the triggers' },
    { questionIndex: 72, text: 'कभी-कभी — सामान्य सीमा; 10 तक गिनना + जगह बदलना अपनाएं', textEn: 'Occasional — normal range; adopt 10-count + leaving the scene' },
    // q73
    { questionIndex: 73, text: 'तोड़-फोड़ / मारपीट — परिवार की सुरक्षा पहले; उपचार रेफर; शराब जुड़ी हो तो पहले वही संबोधें', textEn: 'Breaking things or violence — family safety first; treatment referral; if alcohol is involved, address that first' },
    { questionIndex: 73, text: 'शब्दों तक रहता है — हल्का; संवाद-प्रशिक्षण मदद करता है', textEn: 'Stays verbal — mild; communication training helps' },
    // q74
    { questionIndex: 74, text: '1 साल+ का टकराव — जड़ें गहरी; युगल-काउंसलिंग (couple) रेफर करें', textEn: 'Conflict 1+ year — roots are deep; refer for couple counselling' },
    { questionIndex: 74, text: 'हाल की घटना से — तीव्र चरण; ठंडा होने पर संवाद; बीच में तीसरा व्यक्ति न घुसाएं', textEn: 'From a recent event — acute phase; talk once cooled; avoid pulling a third person in' },
    // q75
    { questionIndex: 75, text: 'दोनों आने को तैयार — सबसे अच्छी स्थिति; अगली मुलाकात दोनों के साथ तय करें', textEn: 'Both willing to come — best scenario; book the next visit with both' },
    { questionIndex: 75, text: 'साथी तैयार नहीं — अकेले शुरू करें; एक तरफ का बदलाव भी जोड़ को बदलता है', textEn: 'Partner unwilling — begin alone; one-sided change still shifts the bond' },
    // q76
    { questionIndex: 76, text: '6-12 साल + स्कूल की शिकायतें — बाल-ADHD मूल्यांकन हेतु बाल-मनोविज्ञानी रेफर; स्कूल की रिपोर्ट लाएं', textEn: '6-12 years + school complaints — refer to child psychologist for ADHD evaluation; bring the school report' },
    { questionIndex: 76, text: 'किशोरावस्था (13+) — स्क्रीन-समय, नींद और साथियों का दबाव भी देखें', textEn: 'Teenage (13+) — also check screen time, sleep and peer pressure' },
    // q77
    { questionIndex: 77, text: '5 मिनट से कम ध्यान — ADHD-संदेह मजबूत; विशेषज्ञ मूल्यांकन जरूरी; डांटें नहीं — बच्चा जानबूझकर नहीं करता', textEn: 'Focus under 5 minutes — strong ADHD suspicion; specialist evaluation needed; do not scold — the child is not doing it on purpose' },
    { questionIndex: 77, text: '15-20 मिनट — उम्र-अनुकूल; स्कूल की पढ़ाई-पद्धति की समीक्षा कराएं', textEn: '15-20 minutes — age-appropriate; review the study method at school' },
    // q78
    { questionIndex: 78, text: '2 साल+ और शब्द नहीं — भाषा-विलंब की जांच जरूरी: बाल-विकास विशेषज्ञ + सुनने की जांच', textEn: '2+ years and no words — evaluate language delay: child-development specialist + hearing test' },
    { questionIndex: 78, text: '18 महीने के भीतर — अभी प्रतीक्षा-योग्य मंजिलें; 3 महीने में पुनर्मूल्यांकन', textEn: 'Under 18 months — milestones still watchable; re-evaluate in 3 months' },
    // q79
    { questionIndex: 79, text: 'ईशारे भी नहीं + आंख नहीं मिलाता — ऑटिज़्म-स्क्रीन जरूरी; जल्दी रेफर हितकर है', textEn: 'No gestures and no eye contact — autism screening essential; early referral helps' },
    { questionIndex: 79, text: 'ईशारे-समझ ठीक, बोली में देर — वाक-चिकित्सा (speech therapy) रेफर करें', textEn: 'Gestures and understanding fine, speech late — refer for speech therapy' },
    // q80
    { questionIndex: 80, text: 'कई अंग-तंत्रों के लक्षण — सोमेटोफॉर्म संभावना; रिपोर्ट सामान्य है समझाना + SSRI / SNRI मदद करती है', textEn: 'Symptoms across many systems — somatoform likely; explaining normal reports + SSRI / SNRI helps' },
    { questionIndex: 80, text: 'एक ही लक्षण दोहराता है — संकेंद्रित सोमेटिक शिकायत; तनाव-संबंध खोजें', textEn: 'One repeating symptom — focused somatic complaint; hunt the stress link' },
    // q81
    { questionIndex: 81, text: 'कई जांचें, सब सामान्य — शरीर की नहीं, तनाव की बीमारी; मन का तनाव शरीर में दर्द बनता है — ऐसा समझाएं', textEn: 'Many tests, all normal — not a body disease but stress expressing itself; explain that mind stress becomes body pain' },
    { questionIndex: 81, text: 'जांचें अधूरी — पहले शरीर-निर्गमन पूरा करें (CBC / TSH / शुगर)', textEn: 'Workup incomplete — complete the body rule-out first (CBC / TSH / sugar)' },
    // q82
    { questionIndex: 82, text: '6 हफ्ते के भीतर — प्रसवोत्तर अवधि; उदासी 2 हफ्ते+ हो तो स्क्रीनिंग जारी रखें', textEn: 'Within 6 weeks — postpartum window; continue screening if sadness is 2+ weeks' },
    { questionIndex: 82, text: '6 हफ्ते+ पहले की देखभाल थी — अब यह प्रसवोत्तर-विशेष नहीं; सामान्य मूड-विकार की तरह इलाज', textEn: 'Care beyond 6 weeks ago — no longer postpartum-specific; treat like any mood disorder' },
    // q83
    { questionIndex: 83, text: 'बच्चे के 2-4 हफ्ते बाद शुरू — ब्लूज़ / डिप्रेशन की खिड़की; साथी की रात-मदद उपाय संख्या 1 · संकट में: टेली-मानस 14416', textEn: 'Onset 2-4 weeks after birth — blues or depression window; partner night-support is remedy number 1 · in crisis: Tele-MANAS 14416' },
    { questionIndex: 83, text: 'पहले से ही थी — गर्भावस्था-मूल संभव; दवा-निर्णय OBG + मनोचिकित्सक साझा करें (स्तनपान ध्यान रखें)', textEn: 'Was present before — pregnancy-origin likely; medicine decision shared by OBG + psychiatrist (mind breastfeeding)' },
    // q84 (post-partum screen)
    { questionIndex: 84, text: 'हाँ — प्रसवोत्तर आपातकाल: तुरंत OBG + मनोचिकित्सक, 112 / ER; मां को अकेले बच्चे के साथ न छोड़ें', textEn: 'Yes — postpartum emergency: immediate OBG + psychiatrist, 112 or ER; never leave the mother alone with the baby' },
    { questionIndex: 84, text: 'नहीं — हल्के ब्लूज़ आम हैं; नींद साझा करें, परिवार सहयोग दे; 2 हफ्ते में न ठीक हो तो फिर मिलें', textEn: 'No — mild blues are common; shared night care, family support; revisit if not settled in 2 weeks' },
    // q85
    { questionIndex: 85, text: 'महीनों का अकेलापन — दैनिक-संपर्क योजना: पड़ोसी, मंदिर / पार्क, फोन-कॉल का तय समय', textEn: 'Months of loneliness — daily-contact plan: neighbours, temple or park, fixed phone-call times' },
    { questionIndex: 85, text: 'हाल का है — जुड़ाव फिर बनेगा; कोई समूह-गतिविधि में शामिल हों', textEn: 'Recent — connection will rebuild; join a group activity' },
    // q86
    { questionIndex: 86, text: 'दिनचर्या बिखरी है — सुबह की धूप + 30 मिनट टहल + एक सामाजिक काम रोज़; यह दवा से पहले वाली दवा है', textEn: 'Routine scattered — morning sunlight + 30-minute walk + one social task daily; this is the medicine before the medicine' },
    { questionIndex: 86, text: 'दिनचर्या ठीक है — सुरक्षात्मक; बनाए रखें', textEn: 'Routine intact — protective; maintain it' },
    // q87 (elderly suicide screen)
    { questionIndex: 87, text: 'हाँ — बुज़ुर्गों में यह आपातकाल: टेली-मानस 14416 · आपातकाल 112 · साथ रहें; दवाएं किसी और के पास रखें', textEn: 'Yes — in the elderly this is an emergency: Tele-MANAS 14416 · emergency 112 · stay with them; someone else should keep the medicines' },
    { questionIndex: 87, text: 'नहीं — अकेलापन घटाएं: सुबह धूप + टहलना, पड़ोसियों से मिलना, निश्चित दिनचर्या', textEn: 'No — reduce loneliness: morning sun and walk, meeting neighbours, fixed routine' },
    // q88 (continuation verify — lithium/valproate)
    { questionIndex: 88, text: 'लिथियम चल रहा है — स्तर-जांच 3-6 महीने पर; हाथ का कांपन, भ्रम या कम पेशाब = तुरंत आएं (विषाक्तता)', textEn: 'On lithium — level checks every 3-6 months; tremor, confusion or low urine = come at once (toxicity)' },
    { questionIndex: 88, text: 'वाल्प्रोएट चल रहा है — लिवर-जांच नियमित; गर्भ-योजना हो तो पहले बताएं — गर्भावस्था में कभी नहीं', textEn: 'On valproate — regular liver checks; if a pregnancy is planned, say so first — never in pregnancy' },
    // q89
    { questionIndex: 89, text: 'नींद घटी + उत्तेजना / बड़ी योजनाएं — मैनिया की चेतावनी; मनोचिकित्सक से उसी हफ्ते; खुद दवा-परिवर्तन न करें', textEn: 'Sleep cut + excitement or grand plans — mania warning; psychiatrist the same week; no self medicine changes' },
    { questionIndex: 89, text: 'स्थिर नींद-मूड — निरंतरता अच्छी चल रही है; दवा जारी रखें — रुकने से वापसी का जोखिम', textEn: 'Stable sleep and mood — continuation going well; keep medicines — stopping risks relapse' },
    // q90
    { questionIndex: 90, text: 'खुद बंद कर लिया था — वापसी का कारण यही है; पुनः शुरुआत डॉक्टर की देखरेख में; दवा स्वेच्छा-बंद कभी नहीं', textEn: 'Stopped it on your own — that is the relapse cause; restart under supervision; never self-stop' },
    { questionIndex: 90, text: 'नियमित ले रहे हैं — अच्छा; वजन-शुगर की जांच 3 महीने पर; नींद / भूख का रिकॉर्ड लाएं', textEn: 'Taking regularly — good; weight and sugar checks every 3 months; bring the sleep and appetite record' },
    // q91 (hallucination screen)
    { questionIndex: 91, text: 'आवाजें अभी भी सुनाई देती हैं — दवा-प्रतिक्रिया अधूरी; मनोचिकित्सक से खुराक-समीक्षा उसी हफ्ते; अकेले रहना घटाएं', textEn: 'Voices persist — response incomplete; psychiatrist dose review the same week; reduce staying alone' },
    { questionIndex: 91, text: 'आवाजें नहीं — अच्छा नियंत्रण; निरंतरता-दवा जारी रखें; अचानक बंद नहीं — वापसी आम है', textEn: 'No voices — good control; continue maintenance; never abrupt stop — relapse is common' },
    // q92
    { questionIndex: 92, text: '3 महीने+ महीने अनुपस्थित — एंडोक्राइन जांच (TSH / प्रोलैक्टिन / PCOS पैनल) + खाने का पैटर्न पूछें', textEn: 'Periods absent 3+ months — endocrine workup (TSH / prolactin / PCOS panel) + ask the eating pattern' },
    { questionIndex: 92, text: '1-2 महीने — तनाव-प्रेरित संभावना; वजन-तनाव-व्यायाम त्रयी देखें; 1 महीने में पुनर्समीक्षा', textEn: '1-2 months — likely stress-driven; check the weight-stress-exercise trio; review in 1 month' },
    // q93 (weight change)
    { questionIndex: 93, text: 'तेज़ वजन-घाटा + महीने बंद — खाने का विकार (एनोरेक्सिया) स्क्रीन: भूख-डर संबंधी सवाल पूछें; विशेष-इकाई रेफर करें', textEn: 'Rapid weight loss + missed periods — screen eating disorder (anorexia): ask hunger-fear questions; refer to a specialist unit' },
    { questionIndex: 93, text: 'वजन बढ़ा — अवसाद-खाना-मोटापा चक्र संभव; नियमित भोजन-समय पहला कदम', textEn: 'Weight gained — depression-eating-weight cycle possible; fixed meal times are step one' },
  ],

  // ══ Labels (12) — psychometrics + vitals ══════════════════════════════
  labels: [
    { label: 'मूड स्कोर', labelEn: 'Mood Score (0-10)', unit: '/10' },
    { label: 'चिंता स्कोर', labelEn: 'Anxiety Score (0-10)', unit: '/10' },
    { label: 'नींद के घंटे', labelEn: 'Sleep Hours', unit: 'hrs' },
    { label: 'नींद की गुणवत्ता', labelEn: 'Sleep Quality (0-10)', unit: '/10' },
    { label: 'पैनिक एपिसोड / हफ्ता', labelEn: 'Panic Episodes per Week', unit: '/week' },
    { label: 'कंपल्शन / दिन', labelEn: 'Compulsions per Day', unit: '/day' },
    { label: 'शराब यूनिट / दिन', labelEn: 'Alcohol Units per Day', unit: 'units/day' },
    { label: 'सिगरेट / दिन', labelEn: 'Cigarettes per Day', unit: '/day' },
    { label: 'PHQ-9 स्कोर', labelEn: 'PHQ-9 Score', unit: '/27' },
    { label: 'GAD-7 स्कोर', labelEn: 'GAD-7 Score', unit: '/21' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
  ],

  // ══ Findings (30) — 17 managed + 13 REFER-ONLY (zero findingMeds) ═════
  findings: [
    // Managed findings (may carry findingMeds links)
    { key: 'DEP-EPISODE', name: 'डिप्रेशन एपिसोड (हल्का–मध्यम)', nameEn: 'Depressive Episode (Mild–Moderate)', icd10: 'F32.1' },
    { key: 'DEP-RECURRENT', name: 'बार-बार उदासी विकार', nameEn: 'Recurrent Depressive Disorder', icd10: 'F33' },
    { key: 'PANIC-DISORDER', name: 'पैनिक डिसऑर्डर', nameEn: 'Panic Disorder', icd10: 'F41.0' },
    { key: 'GAD', name: 'जनरलाइज़्ड एंग्ज़ायटी डिसऑर्डर', nameEn: 'Generalised Anxiety Disorder', icd10: 'F41.1' },
    { key: 'PHOBIA', name: 'फोबिक एंग्ज़ायटी (सामाजिक / विशिष्ट / एगोराफोबिया)', nameEn: 'Phobic Anxiety (Social / Specific / Agoraphobia)', icd10: 'F40.9' },
    { key: 'OCD', name: 'ऑब्सेसिव कंपल्सिव डिसऑर्डर', nameEn: 'Obsessive Compulsive Disorder', icd10: 'F42' },
    { key: 'INSOMNIA', name: 'अनिद्रा (नॉन-ऑर्गेनिक)', nameEn: 'Non-organic Insomnia', icd10: 'F51.0' },
    { key: 'SLEEP-DIS-NOS', name: 'नींद विकार (अन्य)', nameEn: 'Sleep Disorder NOS', icd10: 'G47.9' },
    { key: 'ALCOHOL-DEP-MILD', name: 'शराब निर्भरता (हल्की, प्रबंधनीय)', nameEn: 'Alcohol Dependence (Mild, Managed)', icd10: 'F10.2' },
    { key: 'TOBACCO-DEP', name: 'तंबाकू निर्भरता', nameEn: 'Tobacco Dependence', icd10: 'F17.2' },
    { key: 'SUBSTANCE-COUNSEL', name: 'नशा सलाह (कैनबिस / व्यवहार-लत)', nameEn: 'Substance Use Counselling', icd10: 'Z72.4' },
    { key: 'ADJUST-STRESS', name: 'समायोजन / तनाव प्रतिक्रिया', nameEn: 'Adjustment / Stress Reaction', icd10: 'F43.2' },
    { key: 'SOMATOFORM', name: 'सोमेटोफॉर्म डिसऑर्डर', nameEn: 'Somatoform Disorder', icd10: 'F45.9' },
    { key: 'SCHIZO-FU', name: 'सिज़ोफ्रेनिया फॉलो-अप (निरंतरता)', nameEn: 'Schizophrenia Follow-up (Continuation)', icd10: 'F20' },
    { key: 'BIPOLAR-FU', name: 'बाइपोलर फॉलो-अप (निरंतरता)', nameEn: 'Bipolar Follow-up (Continuation)', icd10: 'F31' },
    { key: 'IRRITABILITY', name: 'चिड़चिड़ापन / क्रोध विस्फोट', nameEn: 'Irritability / Anger Outbursts', icd10: 'R45.8' },
    { key: 'MEMORY-COMPLAINT', name: 'याददाश्त की शिकायत', nameEn: 'Memory Complaint', icd10: 'R41.3' },
    // REFER-ONLY findings — ZERO findingMeds links (validator-verified)
    { key: 'SUICIDAL-IDEATION-HIGH', name: 'आत्महत्या विचार — उच्च जोखिम (आपातकाल)', nameEn: 'Suicidal Ideation — High Risk (Emergency)', icd10: 'R45.85' },
    { key: 'PSYCHOSIS-ACUTE', name: 'तीव्र साइकोसिस (अत्यावश्यक रेफर)', nameEn: 'Acute Psychosis (Urgent Referral)', icd10: 'F29' },
    { key: 'ALCOHOL-WITHDRAWAL-SEVERE', name: 'शराब विद्रेही — गंभीर (डिटॉक्स भर्ती)', nameEn: 'Alcohol Withdrawal — Severe (Detox Admission)', icd10: 'F10.3' },
    { key: 'POST-PARTUM-PSYCHOSIS', name: 'प्रसवोत्तर साइकोसिस (आपातकाल)', nameEn: 'Post-partum Psychosis (Emergency)', icd10: 'F53.1' },
    { key: 'POSTPARTUM-DEP-SCREEN', name: 'प्रसवोत्तर उदासी स्क्रीन (OBG + मनो रेफर)', nameEn: 'Post-partum Depression Screen (OBG + Psych Refer)', icd10: 'O90' },
    { key: 'DELIRIUM-ACUTE', name: 'तीव्र डिलीरियम (मेडिकल ER)', nameEn: 'Acute Delirium (Medical ER)', icd10: 'F05' },
    { key: 'EATING-DISORDER-SUSPECT', name: 'खाने का विकार — संदेह (विशेषज्ञ रेफर)', nameEn: 'Eating Disorder — Suspect (Specialist Refer)', icd10: 'F50' },
    { key: 'DEMENTIA-EVAL', name: 'डिमेंशिया मूल्यांकन (न्यूरो रेफर)', nameEn: 'Dementia Evaluation (Neuro Refer)', icd10: 'F03' },
    { key: 'CHILD-ADHD-EVAL', name: 'बाल ADHD मूल्यांकन (बाल-मनो रेफर)', nameEn: 'Child ADHD Evaluation (Child-Psych Refer)', icd10: 'F90' },
    { key: 'BIPOLAR-MANIA-ACUTE', name: 'बाइपोलर मैनिया — तीव्र (भर्ती रेफर)', nameEn: 'Bipolar Mania — Acute (Admission Referral)', icd10: 'F31.1' },
    { key: 'LITHIUM-TOXICITY-SUSPECT', name: 'लिथियम विषाक्तता — संदेह (ER)', nameEn: 'Lithium Toxicity — Suspect (ER)', icd10: 'T43.8' },
    { key: 'SEROTONIN-SYNDROME-SUSPECT', name: 'सेरोटोनिन सिंड्रोम — संदेह (ER)', nameEn: 'Serotonin Syndrome — Suspect (ER)', icd10: 'T43.2' },
    { key: 'OSA-SEVERE', name: 'नींद-श्वास-रोध — गंभीर (स्लीप स्टडी रेफर)', nameEn: 'Obstructive Sleep Apnea — Severe (Sleep Study Refer)', icd10: 'G47.3' },
  ],

  // ══ Medicines (55) — India psychiatry OPD core ════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense multiplier.
  // Benzo/Z-drug tabs capped ~2 weeks; refer-only findings never link here.
  medicines: [
    // SSRIs
    { name: 'Nexito 5 Tablet', salt: 'Escitalopram 5 mg (SSRI) — effect from 2 weeks; never stop abruptly (discontinuation symptoms); pregnancy only with OBG + psychiatrist joint decision', doseOptions: ['1 tab after breakfast × 14 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 2 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nexito 10 Tablet', salt: 'Escitalopram 10 mg (SSRI) — first-line antidepressant; effect from 2 weeks; never stop abruptly; pregnancy only with OBG + psychiatrist joint decision', doseOptions: ['1 tab after breakfast × 14 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nexito 20 Tablet', salt: 'Escitalopram 20 mg (SSRI) — higher / maintenance dose; never stop abruptly; pregnancy only with joint OBG + psychiatrist decision', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 2 months', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Escitalent 10 Tablet', salt: 'Escitalopram 10 mg (SSRI) — alternate brand of Nexito 10; same precautions: no abrupt stop; pregnancy joint decision', doseOptions: ['1 tab after breakfast × 14 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zosert 25 Tablet', salt: 'Sertraline 25 mg (SSRI) — titration start dose; step up per response; never stop abruptly', doseOptions: ['1 tab after breakfast × 7 days', '1 tab after breakfast × 14 days'], morning: 1, afternoon: 0, evening: 0, tab: 14, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zosert 50 Tablet', salt: 'Sertraline 50 mg (SSRI) — usual adult start dose; never stop abruptly; pregnancy joint decision', doseOptions: ['1 tab after breakfast × 14 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zosert 100 Tablet', salt: 'Sertraline 100 mg (SSRI) — higher dose (OCD / robust response); never stop abruptly', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Serlift 50 Tablet', salt: 'Sertraline 50 mg (SSRI) — alternate brand; never stop abruptly; pregnancy joint decision', doseOptions: ['1 tab after breakfast × 14 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Serlift 100 Tablet', salt: 'Sertraline 100 mg (SSRI) — alternate brand, higher dose; never stop abruptly', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fludac 20 Capsule', salt: 'Fluoxetine 20 mg (SSRI) — ACTIVATION NOTE: initial jitteriness possible, take after breakfast; long half-life; never stop abruptly', doseOptions: ['1 cap after breakfast × 14 days', '1 cap after breakfast × 1 month', '1 cap after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Prodep 20 Capsule', salt: 'Fluoxetine 20 mg (SSRI) — alternate brand of Fludac; activation note; never stop abruptly', doseOptions: ['1 cap after breakfast × 14 days', '1 cap after breakfast × 1 month', '1 cap after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fluvoxin 50 Tablet', salt: 'Fluvoxamine 50 mg (SSRI) — OCD first-line; dose stepped up per response; evening dose; never stop abruptly', doseOptions: ['1 tab after dinner × 14 days', '1 tab after dinner × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fluvoxin 100 Tablet', salt: 'Fluvoxamine 100 mg (SSRI) — OCD higher dose; 10-12 week trial needed; never stop abruptly', doseOptions: ['1 tab after dinner × 1 month', '1 tab after dinner × 3 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Paxidep CR 12.5 Tablet', salt: 'Paroxetine 12.5 mg CR (SSRI) — STRONGEST DISCONTINUATION SYNDROME: never miss doses, taper only when stopping; NEVER in pregnancy; sedating — bedtime dose', doseOptions: ['1 tab at bedtime × 14 days', '1 tab at bedtime × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Paxidep CR 25 Tablet', salt: 'Paroxetine 25 mg CR (SSRI) — taper-only stop; NEVER in pregnancy; sedation — bedtime dose', doseOptions: ['1 tab at bedtime × 1 month', '1 tab at bedtime × 3 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // SNRIs
    { name: 'Venlor XR 37.5 Capsule', salt: 'Venlafaxine 37.5 mg XR (SNRI) — start dose; step up per response; BP monitoring at higher doses; never stop abruptly', doseOptions: ['1 cap after breakfast × 14 days', '1 cap after breakfast × 1 month'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Venlor XR 75 Capsule', salt: 'Venlafaxine 75 mg XR (SNRI) — BP check monthly; never stop abruptly; pregnancy joint decision', doseOptions: ['1 cap after breakfast × 1 month', '1 cap after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Desvenlor 50 Tablet', salt: 'Desvenlafaxine 50 mg (SNRI) — once daily; never stop abruptly', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Desvenlor 100 Tablet', salt: 'Desvenlafaxine 100 mg (SNRI) — higher dose; never stop abruptly', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Duzela 30 Capsule', salt: 'Duloxetine 30 mg (SNRI) — pain + depression dual use (somatoform, tension pain); initial nausea; never stop abruptly', doseOptions: ['1 cap after breakfast × 1 month', '1 cap after breakfast × 2 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // TCA (low-dose sleep/pain synergy)
    { name: 'Tryptomer 10 Tablet', salt: 'Amitriptyline 10 mg (TCA) — low dose for sleep / pain synergy; ANTICHOLINERGIC: dry mouth, constipation; ELDERLY: falls and confusion caution; avoid in glaucoma', doseOptions: ['1 tab at bedtime × 14 days', '1 tab at bedtime × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tryptomer 25 Tablet', salt: 'Amitriptyline 25 mg (TCA) — anticholinergic + sedation; elderly falls caution; never stop abruptly', doseOptions: ['1 tab at bedtime × 1 month', '1 tab at bedtime × 2 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Mirtazapine
    { name: 'Mirtaz 7.5 Tablet', salt: 'Mirtazapine 7.5 mg — appetite + sleep dual benefit in depression; weight gain possible; sedation — bedtime dose', doseOptions: ['1 tab at bedtime × 14 days', '1 tab at bedtime × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mirtaz 15 Tablet', salt: 'Mirtazapine 15 mg — appetite + sleep benefit; weight gain note; never stop abruptly', doseOptions: ['1 tab at bedtime × 1 month', '1 tab at bedtime × 3 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Bupropion (smoking + depression)
    { name: 'Bupron SR 150 Tablet', salt: 'Bupropion SR 150 mg — smoking cessation + depression; LOWERS SEIZURE THRESHOLD — avoid with fits or eating-disorder history; activating — morning dose', doseOptions: ['1 tab after breakfast × 7 days', '1 tab after breakfast × 1 month', '1 tab after breakfast × 2 months'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Buspirone (non-dependence daytime anxiolytic)
    { name: 'Buspin 5 Tablet', salt: 'Buspirone 5 mg — non-sedating, NON-DEPENDENCE daytime anxiolytic; effect from 2 weeks; no withdrawal syndrome', doseOptions: ['1 tab twice daily × 14 days', '1 tab twice daily × 1 month'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Buspin 10 Tablet', salt: 'Buspirone 10 mg — non-dependence anxiolytic; effect from 2 weeks; daytime dosing', doseOptions: ['1 tab twice daily × 1 month', '1 tab twice daily × 2 months'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Propranolol (performance anxiety)
    { name: 'Ciplar 10 Tablet', salt: 'Propranolol 10 mg — performance anxiety (tremor, palpitations) SOS; no dependence; asthma caution; not an antidepressant', doseOptions: ['1 tab SOS before stressful situation', '1 tab twice daily × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Benzodiazepines — SHORT-COURSE-ONLY (max 2-4 weeks + taper + never with alcohol)
    { name: 'Alprax 0.25 Tablet', salt: 'Alprazolam 0.25 mg (benzodiazepine) — SHORT COURSE ONLY: max 2-4 weeks; dependence risk; gradual taper only; NEVER with alcohol; driving caution; Schedule H1', doseOptions: ['1 tab SOS (max 1/day) × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Alprax 0.5 Tablet', salt: 'Alprazolam 0.5 mg (benzodiazepine) — max 2-4 weeks; taper only; NEVER with alcohol; driving caution; Schedule H1', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Restyl 0.5 Tablet', salt: 'Alprazolam 0.5 mg (benzodiazepine) — alternate brand; max 2-4 weeks; taper only; NEVER with alcohol; Schedule H1', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Clonotril 0.25 Tablet', salt: 'Clonazepam 0.25 mg (benzodiazepine) — max 2-4 weeks; taper only; NEVER with alcohol; Schedule H1', doseOptions: ['1 tab at bedtime × 14 days', '1 tab SOS (max 1/day) × 7 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Clonotril 0.5 Tablet', salt: 'Clonazepam 0.5 mg (benzodiazepine) — max 2-4 weeks; taper only; NEVER with alcohol; Schedule H1', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H1', verified: false } },
    { name: 'Etilaam 0.5 Tablet', salt: 'Etizolam 0.5 mg (thienodiazepine) — SHORT COURSE ONLY: max 2-4 weeks; dependence risk; taper only; NEVER with alcohol; driving caution', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days', '1 tab SOS (max 1/day) × 7 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Etilaam 1 Tablet', salt: 'Etizolam 1 mg — SOS / bedtime short course only; taper when stopping; NEVER with alcohol', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Z-drugs — short course with taper
    { name: 'Zolfresh 5 Tablet', salt: 'Zolpidem 5 mg (Z-drug) — SHORT COURSE 2-3 weeks with taper; dependence risk; NEVER with alcohol (fatal deep sedation); driving caution', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days', '1 tab at bedtime SOS'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zolfresh 10 Tablet', salt: 'Zolpidem 10 mg — short course only; taper when stopping; NEVER with alcohol; next-day drowsiness — no driving', doseOptions: ['1 tab at bedtime × 7 days', '1 tab at bedtime × 14 days'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Melatonin
    { name: 'Meloset 3 Tablet', salt: 'Melatonin 3 mg — sleep-cycle regulator; non-dependence; works best with fixed wake time; take 1 hour before bed', doseOptions: ['1 tab at bedtime × 14 days', '1 tab at bedtime × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Hydroxyzine
    { name: 'Atarax 10 Tablet', salt: 'Hydroxyzine 10 mg — itching + mild sedation dual use; non-dependence option for anxious itch', doseOptions: ['1 tab twice daily × 7 days', '1 tab at bedtime × 14 days'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atarax 25 Tablet', salt: 'Hydroxyzine 25 mg — sedating antihistamine anxiolytic; bedtime use; driving caution', doseOptions: ['1 tab at bedtime × 14 days', '1 tab at bedtime × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Mood stabilizers — CONTINUATION-VERIFY-ONLY (no new starts in this pack)
    { name: 'Lithosun SR 400 Tablet', salt: 'Lithium carbonate 400 mg SR — CONTINUATION-VERIFY ONLY: narrow therapeutic index — 3-monthly blood level + thyroid + renal tests; dehydration / NSAIDs / summer raise toxicity; tremor + confusion + low urine = emergency; never stop abruptly; pregnancy: OBG + psychiatrist joint decision', doseOptions: ['1 tab twice daily (continuation, as per prior Rx) × 1 month', '1 tab twice daily (continuation) × 2 months'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Valparin Chrono 200 Tablet', salt: 'Sodium valproate 200 mg chrono — CONTINUATION-VERIFY ONLY: liver function monitoring; NEVER in pregnancy (serious birth defects) — discuss contraception first; never stop abruptly', doseOptions: ['1 tab twice daily (continuation only) × 1 month'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Valparin Chrono 500 Tablet', salt: 'Sodium valproate 500 mg chrono — continuation-verify only; NEVER in pregnancy; liver monitoring; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month', '1 tab twice daily (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Depakote 500 Tablet', salt: 'Divalproex 500 mg (valproate) — continuation-verify only; NEVER in pregnancy; liver monitoring', doseOptions: ['1 tab at bedtime (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Antipsychotics — CONTINUATION-VERIFY-ONLY
    { name: 'Oleanz 2.5 Tablet', salt: 'Olanzapine 2.5 mg — CONTINUATION-VERIFY ONLY: metabolic weight gain + sugar / lipid checks 3-monthly; sedation; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Oleanz 5 Tablet', salt: 'Olanzapine 5 mg — continuation-verify only; weight + sugar monitoring; sedation; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month', '1 tab twice daily (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Oleanz 10 Tablet', salt: 'Olanzapine 10 mg — continuation-verify only; metabolic monitoring essential; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sizodon 1 Tablet', salt: 'Risperidone 1 mg — CONTINUATION-VERIFY ONLY: weight + sugar checks; report restlessness side-effect; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sizodon 2 Tablet', salt: 'Risperidone 2 mg — continuation-verify only; metabolic monitoring; never stop abruptly', doseOptions: ['1 tab at bedtime (continuation only) × 1 month', '1 tab morning + 1 tab bedtime (continuation only) × 1 month'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Anti-craving (alcohol) — specialist supervision advised
    { name: 'Acamprol 333 Tablet', salt: 'Acamprosate 333 mg — alcohol anti-craving; works WITH counselling, not instead of it; safe in liver disease; specialist supervision advised', doseOptions: ['2 tabs three times daily × 1 month', '1 tab twice daily × 1 month'], morning: 2, afternoon: 2, evening: 2, tab: 180, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Naltima 50 Tablet', salt: 'Naltrexone 50 mg — alcohol anti-craving; NEVER with opioid painkillers (severe reaction); liver monitoring; specialist supervision advised', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 90, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Nicotine replacement therapy
    { name: 'Nicotex 2mg Gum', salt: 'Nicotine polacrilex 2 mg gum — chew-park-chew technique; max 8 gums/day; taper over 8-12 weeks; for under 20 cigarettes/day', doseOptions: ['1 gum when urge comes (max 8/day) × 1 month', '1 gum when urge comes (max 6/day) × 2 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nicotex 4mg Gum', salt: 'Nicotine polacrilex 4 mg gum — for 20+ cigarettes/day or heavy gutka; chew-park-chew; taper over 8-12 weeks', doseOptions: ['1 gum when urge comes (max 8/day) × 1 month', '1 gum when urge comes (max 6/day) × 2 months'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Supplements
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-complex + B12 — nutritional support in mood and substance-recovery states', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 90, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium carbonate 500 mg + Vitamin D3 250 IU — bone support, especially elderly', doseOptions: ['1 tab after breakfast × 1 month', '1 tab after breakfast × 3 months'], morning: 1, afternoon: 0, evening: 0, tab: 90, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (39) ════════════════════════════════════
  // Refer-only findings intentionally have ZERO links here.
  findingMeds: [
    // DEP-EPISODE
    { findingKey: 'DEP-EPISODE', medicineName: 'Nexito 10 Tablet', dose: '1 tab after breakfast × 14 days', description: 'First-line SSRI; effect from 2 weeks; 14-day review; never stop abruptly' },
    { findingKey: 'DEP-EPISODE', medicineName: 'Serlift 50 Tablet', description: 'Alternative SSRI if escitalopram not suited; same 2-week onset' },
    { findingKey: 'DEP-EPISODE', medicineName: 'Mirtaz 7.5 Tablet', description: 'If poor sleep + poor appetite; weight gain possible; bedtime dose' },
    // DEP-RECURRENT
    { findingKey: 'DEP-RECURRENT', medicineName: 'Nexito 20 Tablet', description: 'Maintenance dose; 6+ month course; monthly review' },
    { findingKey: 'DEP-RECURRENT', medicineName: 'Zosert 100 Tablet', description: 'Alternative maintenance SSRI' },
    { findingKey: 'DEP-RECURRENT', medicineName: 'Desvenlor 50 Tablet', description: 'SNRI option if SSRI response insufficient' },
    // PANIC-DISORDER
    { findingKey: 'PANIC-DISORDER', medicineName: 'Nexito 5 Tablet', description: 'Low-dose start; titrate up after 7-10 days; SSRI reduces attack frequency' },
    { findingKey: 'PANIC-DISORDER', medicineName: 'Etilaam 0.5 Tablet', description: 'SOS bridge only — max 2-4 weeks, taper off; NEVER with alcohol' },
    // GAD
    { findingKey: 'GAD', medicineName: 'Serlift 50 Tablet', description: 'First-line SSRI for chronic worry; 2-4 week onset' },
    { findingKey: 'GAD', medicineName: 'Buspin 5 Tablet', description: 'Non-dependence daytime anxiolytic; no sedation; effect from 2 weeks' },
    { findingKey: 'GAD', medicineName: 'Nexito 10 Tablet', description: 'Alternative SSRI; review in 14 days' },
    // PHOBIA
    { findingKey: 'PHOBIA', medicineName: 'Zosert 50 Tablet', description: 'SSRI + graded exposure therapy referral' },
    { findingKey: 'PHOBIA', medicineName: 'Ciplar 10 Tablet', description: 'SOS before public speaking / performance; no dependence' },
    // OCD (high-dose SSRI framing)
    { findingKey: 'OCD', medicineName: 'Fluvoxin 50 Tablet', description: 'Start dose; OCD needs higher doses + 10-12 weeks; ERP therapy referral alongside' },
    { findingKey: 'OCD', medicineName: 'Fluvoxin 100 Tablet', description: 'Step-up dose if partial response at 8 weeks' },
    { findingKey: 'OCD', medicineName: 'Zosert 100 Tablet', description: 'Alternative high-dose SSRI for OCD' },
    // INSOMNIA
    { findingKey: 'INSOMNIA', medicineName: 'Zolfresh 5 Tablet', description: 'Short course only — 2-3 weeks with taper; sleep hygiene is primary treatment' },
    { findingKey: 'INSOMNIA', medicineName: 'Tryptomer 10 Tablet', description: 'Low-dose TCA for sleep; anticholinergic — elderly falls caution' },
    { findingKey: 'INSOMNIA', medicineName: 'Meloset 3 Tablet', description: 'Non-dependence sleep-cycle aid; fixed wake time essential' },
    // SLEEP-DIS-NOS
    { findingKey: 'SLEEP-DIS-NOS', medicineName: 'Atarax 25 Tablet', description: 'If insomnia + itching / somatic complaints; sedating' },
    { findingKey: 'SLEEP-DIS-NOS', medicineName: 'Tryptomer 25 Tablet', description: 'If persistent; monitor weight and dry mouth' },
    // ALCOHOL-DEP-MILD
    { findingKey: 'ALCOHOL-DEP-MILD', medicineName: 'Acamprol 333 Tablet', description: 'Anti-craving; 2 tabs TDS with meals; combine with counselling cadence' },
    { findingKey: 'ALCOHOL-DEP-MILD', medicineName: 'Naltima 50 Tablet', description: 'Alternative anti-craving; NEVER with opioid painkillers' },
    { findingKey: 'ALCOHOL-DEP-MILD', medicineName: 'Neurobion Forte Tablet', description: 'B-vitamin support in drinkers' },
    // TOBACCO-DEP
    { findingKey: 'TOBACCO-DEP', medicineName: 'Bupron SR 150 Tablet', description: 'Start 1 week before quit date; reduces craving; seizure-threshold caution' },
    { findingKey: 'TOBACCO-DEP', medicineName: 'Nicotex 2mg Gum', description: 'If under 20 cigarettes/day; chew-park-chew; taper over 8-12 weeks' },
    { findingKey: 'TOBACCO-DEP', medicineName: 'Nicotex 4mg Gum', description: 'If 20+ cigarettes/day or heavy gutka' },
    // SUBSTANCE-COUNSEL (counselling-first)
    { findingKey: 'SUBSTANCE-COUNSEL', medicineName: 'Neurobion Forte Tablet', description: 'Support only — counselling-first approach for cannabis / behavioural addiction' },
    // ADJUST-STRESS
    { findingKey: 'ADJUST-STRESS', medicineName: 'Buspin 5 Tablet', description: 'Short-term daytime anxiety relief; counselling is primary' },
    { findingKey: 'ADJUST-STRESS', medicineName: 'Meloset 3 Tablet', description: 'If sleep rhythm disturbed by the stressor' },
    // SOMATOFORM
    { findingKey: 'SOMATOFORM', medicineName: 'Duzela 30 Capsule', description: 'SNRI helps pain + mood; explain the mind-body link first' },
    { findingKey: 'SOMATOFORM', medicineName: 'Nexito 10 Tablet', description: 'SSRI option; 4-6 week trial' },
    // SCHIZO-FU (continuation-verify only)
    { findingKey: 'SCHIZO-FU', medicineName: 'Oleanz 5 Tablet', description: 'Continuation only — verify ongoing prior Rx; never self-stop; weight + sugar check 3-monthly' },
    { findingKey: 'SCHIZO-FU', medicineName: 'Oleanz 10 Tablet', description: 'Continuation verify; metabolic monitoring essential' },
    { findingKey: 'SCHIZO-FU', medicineName: 'Sizodon 2 Tablet', description: 'Continuation verify; report restlessness side-effect' },
    // BIPOLAR-FU (continuation-verify only)
    { findingKey: 'BIPOLAR-FU', medicineName: 'Lithosun SR 400 Tablet', description: 'Continuation only; blood level + thyroid / renal every 3-6 months; dehydration raises toxicity' },
    { findingKey: 'BIPOLAR-FU', medicineName: 'Valparin Chrono 500 Tablet', description: 'Continuation only; NEVER in pregnancy; liver function tests' },
    { findingKey: 'BIPOLAR-FU', medicineName: 'Depakote 500 Tablet', description: 'Continuation only; NEVER in pregnancy; liver monitoring' },
    // IRRITABILITY
    { findingKey: 'IRRITABILITY', medicineName: 'Buspin 10 Tablet', description: 'Daytime irritability; non-sedating' },
    { findingKey: 'IRRITABILITY', medicineName: 'Nexito 10 Tablet', description: 'If depressive irritability; 14-day review' },
    // MEMORY-COMPLAINT (support + neuro referral)
    { findingKey: 'MEMORY-COMPLAINT', medicineName: 'Neurobion Forte Tablet', description: 'B12 support; neurology referral for dementia workup' },
    { findingKey: 'MEMORY-COMPLAINT', medicineName: 'Shelcal 500 Tablet', description: 'General support in the elderly' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Sleep Diary (14 days)',
      rows: 14,
      cols: 6,
      headerLabel: ['तारीख', 'बिस्तर पर गए (समय)', 'नींद आई (मिनट)', 'रात में जागे (बार)', 'कुल नींद (घंटे)', 'गुणवत्ता (0-10)'],
      colsLabel: ['Date', 'Went to bed', 'Minutes to sleep', 'Awakenings', 'Total hours', 'Quality (0-10)'],
      footerLabel: ['अपने डॉक्टर को दिखाएं — बिस्तर केवल नींद के लिए / Show to your doctor — bed is for sleep only'],
    },
    {
      name: 'Mood Chart (14 days)',
      rows: 14,
      cols: 5,
      headerLabel: ['तारीख', 'मूड (0-10)', 'चिंता (0-10)', 'नींद (घंटे)', 'घटना / टिप्पणी'],
      colsLabel: ['Date', 'Mood (0-10)', 'Anxiety (0-10)', 'Sleep (hrs)', 'Event / Note'],
      footerLabel: ['रोज़ रात एक ही समय पर भरें — दवा का असर 2 हफ्ते में दिखता है / Fill at the same time daily — medicine effect shows in 2 weeks'],
    },
    {
      name: 'Mental Status Exam (MSE)',
      rows: 10,
      cols: 2,
      headerLabel: ['क्षेत्र', 'निरीक्षण / निष्कर्ष'],
      colsLabel: ['Domain', 'Observation / Finding'],
      footerLabel: ['क्षेत्र: रूप-रंग · व्यवहार · वाणी · मूड · भाव · विचार · अनुभूति · संज्ञान · अंतर्दृष्टि · निर्णय / Domains: appearance · behavior · speech · mood · affect · thought · perception · cognition · insight · judgment'],
    },
    {
      name: 'PHQ-9 Self-Report Card',
      rows: 9,
      cols: 2,
      headerLabel: ['प्रश्न (2 हफ्ते में)', 'स्कोर (0-3)'],
      colsLabel: ['Question (in past 2 weeks)', 'Score (0-3)'],
      footerLabel: ['0-4 न्यूनतम · 5-9 हल्का · 10-14 मध्यम · 15-19 मध्यम-गंभीर · 20-27 गंभीर — 10+ पर डॉक्टर से मिलें / 0-4 minimal · 5-9 mild · 10-14 moderate · 15-19 moderately severe · 20-27 severe — see doctor at 10+'],
    },
    {
      name: 'Alcohol Tracking (AUDIT-C style)',
      rows: 7,
      cols: 4,
      headerLabel: ['तारीख', 'यूनिट / दिन', 'पीने के दिन / हफ्ता', 'सुबह की तड़प (0-4)'],
      colsLabel: ['Date', 'Units per day', 'Drinking days per week', 'Morning craving (0-4)'],
      footerLabel: ['सुबह की तड़प 2+ = निर्भरता का संकेत — डॉक्टर से मिलें · भारी सेवन अचानक बंद नहीं / Morning craving 2+ = dependence sign — see doctor · never stop heavy use suddenly'],
    },
    {
      name: 'Follow-Up Interval Tracker',
      rows: 6,
      cols: 4,
      headerLabel: ['तारीख', 'अगली मुलाकात (दिन)', 'दवा बदली?', 'स्कोर रुझान'],
      colsLabel: ['Date', 'Next visit (days)', 'Medicine changed?', 'Score trend'],
      footerLabel: ['7 · 14 · 30 दिन के अंतराल पर फॉलो-अप न भूलें / Do not miss follow-up at 7 · 14 · 30 day intervals'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'First-Episode Depression (Moderate) — Standard',
      diagnosis: 'DEP-EPISODE',
      medicines: [
        { name: 'Nexito 10 Tablet', dose: '1 tab after breakfast', duration: '14 days', instructions: 'Effect from 2 weeks — do not stop early; never stop abruptly; same time daily' },
        { name: 'Meloset 3 Tablet', dose: '1 tab 1 hour before bed', duration: '14 days', instructions: 'Sleep-cycle support; non-dependence; fixed wake time' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab after breakfast', duration: '1 month', instructions: 'Nutritional support' },
      ],
      labs: ['TSH', 'CBC', 'Vitamin B12 (if fatigue prominent)'],
      advice: 'मानसिक बीमारी भी शरीर की बीमारी जैसी है — इलाज से ठीक होती है · रोज़ 30 मिनट टहलना + सुबह की धूप · नींद-स्वच्छता: निश्चित जागने का समय, रात 10 बजे के बाद स्क्रीन बंद · संकट में: टेली-मानस 14416 (मुफ्त 24×7) या आपातकाल 112 · 14 दिन में अवश्य फॉलो-अप',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'GAD Starter — Standard',
      diagnosis: 'GAD',
      medicines: [
        { name: 'Serlift 50 Tablet', dose: '1 tab after breakfast', duration: '14 days', instructions: 'Full effect from 2-4 weeks; never stop abruptly' },
        { name: 'Buspin 5 Tablet', dose: '1 tab twice daily', duration: '14 days', instructions: 'Non-dependence daytime anxiolytic; effect from ~2 weeks' },
        { name: 'Etilaam 0.5 Tablet', dose: '1 tab SOS (max 1/day)', duration: '7 days', instructions: 'Bridge only — taper off by week 2-4; NEVER with alcohol; driving caution' },
      ],
      labs: ['TSH'],
      advice: 'चिंता-डायरी: दिन में 2 बार 15 मिनट चिंता लिखें, बाकी समय टालें · 4-7-8 श्वास दिन में 2 बार · कैफीन 2 कप / दिन सीमित · रोज़ 30 मिनट टहलना · 14 दिन में फॉलो-अप',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Acute Insomnia — Short Course',
      diagnosis: 'INSOMNIA',
      medicines: [
        { name: 'Zolfresh 5 Tablet', dose: '1 tab at bedtime', duration: '7 days', instructions: 'Week 1 daily; week 2 alternate nights only — total course max 3 weeks; NEVER with alcohol; no driving till tolerance' },
        { name: 'Meloset 3 Tablet', dose: '1 tab 1 hour before bed', duration: '14 days', instructions: 'Continue 4 weeks; non-dependence' },
      ],
      labs: [],
      advice: 'नींद-स्वच्छता ही मुख्य इलाज है: बिस्तर = केवल नींद · नींद न आए तो 20 मिनट बाद उठ जाएं · रोज़ एक ही समय जागें · शाम 4 बजे के बाद चाय-कॉफी बंद · सोने से 1 घंटा पहले स्क्रीन बंद · दवा अचानक बंद नहीं — धीरे-धीरे घटाएं',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'OCD Starter — High-Dose SSRI Framing',
      diagnosis: 'OCD',
      medicines: [
        { name: 'Fluvoxin 50 Tablet', dose: '1 tab after dinner', duration: '14 days', instructions: 'Dose steps up over weeks; OCD response takes 10-12 weeks — do not stop early; never stop abruptly' },
      ],
      labs: [],
      advice: 'ERP (एक्सपोज़र थेरेपी) काउंसलिंग दवा के साथ जरूरी है — रेफर दें · कंपल्शन-गिनती का रजिस्टर रखें · विचार मात्र विचार है — सच नहीं, यह दोहराने का अभ्यास करें · परिवार: डांटें नहीं, साथ दें · 14 दिन में खुराक-समीक्षा',
      followUpDays: 14,
    },
    {
      name: 'Alcohol Reduction — Support Bundle',
      diagnosis: 'ALCOHOL-DEP-MILD',
      medicines: [
        { name: 'Acamprol 333 Tablet', dose: '2 tabs three times daily with meals', duration: '1 month', instructions: 'Anti-craving; works with counselling, not instead of it' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab after breakfast', duration: '1 month', instructions: 'B-vitamin support' },
      ],
      labs: ['LFT', 'CBC', 'Serum Electrolytes'],
      advice: 'भारी शराब अचानक बंद कभी नहीं — दौरे (seizure) का खतरा; डॉक्टर की योजना से ही घटाएं · हफ्ते में 3+ शराब-मुक्त दिन · वैकल्पिक पेय तैयार रखें · साप्ताहिक काउंसलिंग जारी रखें · संकट में टेली-मानस 14416 · 7 दिन में फॉलो-अप',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Tobacco Quit Plan',
      diagnosis: 'TOBACCO-DEP',
      medicines: [
        { name: 'Bupron SR 150 Tablet', dose: '1 tab after breakfast', duration: '1 month', instructions: 'Start 1 week BEFORE quit date; seizure-threshold caution — avoid missed doses' },
        { name: 'Nicotex 2mg Gum', dose: '1 gum when urge comes (max 8/day)', duration: '1 month', instructions: 'Chew-park-chew technique; taper over 8-12 weeks' },
      ],
      labs: [],
      advice: 'छोड़ने की तारीख लिखकर दीवार पर लगाएं · परिवार / दोस्त को बताएं · ट्रिगर (चाय के साथ, शौचालय) बदलें · तीव्र उबकाई 3-5 दिन में शांत होती है · वजन रोकने के लिए रोज़ टहलें · 7 दिन में फॉलो-अप',
      followUpDays: 7,
      isCommon: true,
    },
  ],
}
