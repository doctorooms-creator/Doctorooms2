/**
 * GAS-01 — GASTROENTEROLOGY STARTER PACK (T2) — "acidity OPD workhorse"
 *
 * The India gastro OPD core: acidity/gas (the #1 complaint), GERD/reflux,
 * functional dyspepsia, IBS pattern questions (food triggers · stress ·
 * Bristol stool form · relief with defecation · alarm screen), constipation,
 * piles/fissure, acute + amoebic diarrhea (ORS-zinc-probiotic first),
 * traveler diarrhea, worm infestations, jaundice with hepatitis panel
 * ordering (HAV/HBV/HCV/HEV), fatty liver and stable cirrhosis follow-up —
 * plus the red-flag REFER pathways that matter in a small-city OPD.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / print), English
 * secondary (doctor search). Medicine names = English brands (India gastro core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped. Normaxin / Meva-C / Ibset compositions
 * carry explicit "review pending" salt notes (benzodiazepine-containing /
 * brand-verification items).
 *
 * SAFETY WIRING (deliberate, hard rules):
 * - Alarm-feature triage BEFORE medicines: dysphagia / unexplained weight
 *   loss / GI bleed / new dyspepsia at age 60+ → endoscopy-referral line
 *   comes BEFORE any medicine line in those questions.
 * - Hematemesis / melena → "khūn ki ulti ya kālā mal — turant emergency"
 *   ER line; GI-BLEED-ER finding carries ZERO medicine links.
 * - Acute severe abdominal pain → surgical referral FIRST (a plain
 *   spasmolytic SOS bridge en route is acceptable — never analgesic masking).
 * - Jaundice: NO blind steroids; acute viral hepatitis = supportive +
 *   workup (HAV/HBV/HCV/HEV panel); bilirubin >5, altered sensorium or
 *   bleeding → hospital line.
 * - PPI duration caps in every PPI salt (review at 4-8 weeks; long-term
 *   only on a documented indication).
 * - NO loperamide/Imodium-class antimotility anywhere (contraindicated in
 *   bloody/feverish diarrhea); racecadotril (Zedott) included with a hard
 *   no-blood-no-fever flag; Zerodiar deliberately EXCLUDED (composition
 *   unverifiable in-pack).
 * - NO tramadol / NO chronic opioids / NO oral corticosteroids (zero
 *   entries); NSAIDs excluded as a class — gastric-pain analgesia =
 *   plain paracetamol (Dolo) only.
 * - Metronidazole / tinidazole / FAS-3 / Ciplox-TZ / O2: alcohol strictly
 *   prohibited during course + 48 h (disulfiram-type reaction) — in salts
 *   AND suggestion lines.
 * - Fluoroquinolones carry pregnancy-contraindicated line; pregnant
 *   patients are routed to OBG referral in key questions.
 * - Anovate / Proctosedyl / Smuth (steroid-containing anorectal topicals):
 *   max 7-day short course in salt notes.
 * - Hepatitis B positive → family HBsAg screening + vaccination +
 *   hepatology referral lines; antivirals are specialist-initiated only
 *   (no entecavir/tenofovir entries in this pack).
 *
 * Sources: NLEM 2023 (molecule backbone), standard Indian gastro OPD
 * practice patterns, WHO ORS/zinc childhood-diarrhea guidance, Rome-IV IBS
 * pattern adapted for patient print.
 */

import type { SpecialtyPack } from '../types'

export const GAS01_PACK: SpecialtyPack = {
  meta: {
    code: 'GAS-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Gastroenterology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · India gastro OPD top-prescribe patterns · WHO ORS/zinc + Rome-IV IBS patterns adapted for print · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'ACD', name: 'एसिडिटी व रिफ्लक्स', nameEn: 'Acidity & Reflux' },
    { key: 'ABD', name: 'पेट का दर्द', nameEn: 'Abdominal Pain' },
    { key: 'BOW', name: 'दस्त-कब्ज (आंत्र आदतें)', nameEn: 'Bowel Habits' },
    { key: 'LIV', name: 'लीवर व पीलिया', nameEn: 'Liver & Jaundice' },
    { key: 'ANO', name: 'गुदा संबंधी', nameEn: 'Anal / Proctology' },
    { key: 'OTH', name: 'अन्य लक्षण', nameEn: 'Others' },
  ],

  // ══ Complaints (46) ═══════════════════════════════════════════════════
  complaints: [
    // ACD — एसिडिटी व रिफ्लक्स
    { code: 'ACD01', categoryKey: 'ACD', detail: 'एसिडिटी / गैस की शिकायत', detailEn: 'Acidity / Gas Trouble' },
    { code: 'ACD02', categoryKey: 'ACD', detail: 'भोजन के बाद सीने में जलन', detailEn: 'Heartburn after Meals' },
    { code: 'ACD03', categoryKey: 'ACD', detail: 'खट्टी डकार आना', detailEn: 'Sour Belching' },
    { code: 'ACD04', categoryKey: 'ACD', detail: 'खट्टा पानी ऊपर चढ़ना (रिफ्लक्स)', detailEn: 'Acid Reflux Rising Up' },
    { code: 'ACD05', categoryKey: 'ACD', detail: 'खाने के बाद पेट भरा / भारी लगना', detailEn: 'Post-Meal Fullness / Heaviness' },
    { code: 'ACD06', categoryKey: 'ACD', detail: 'अपच — खाना न पचना', detailEn: 'Indigestion / Dyspepsia' },
    { code: 'ACD07', categoryKey: 'ACD', detail: 'गैस बनना और पेट फूलना', detailEn: 'Gas Formation & Bloating' },
    { code: 'ACD08', categoryKey: 'ACD', detail: 'लगातार हिचकी आना', detailEn: 'Persistent Hiccups' },
    // ABD — पेट का दर्द
    { code: 'ABD01', categoryKey: 'ABD', detail: 'ऊपरी पेट में दर्द (नाभि के ऊपर)', detailEn: 'Upper Abdominal (Epigastric) Pain' },
    { code: 'ABD02', categoryKey: 'ABD', detail: 'दाएं ऊपरी पेट में दर्द (पसली के नीचे)', detailEn: 'Right Upper Abdominal Pain' },
    { code: 'ABD03', categoryKey: 'ABD', detail: 'निचले पेट में दर्द', detailEn: 'Lower Abdominal Pain' },
    { code: 'ABD04', categoryKey: 'ABD', detail: 'दाएं निचले पेट में दर्द', detailEn: 'Right Lower Abdominal Pain' },
    { code: 'ABD05', categoryKey: 'ABD', detail: 'पेट में मरोड़ वाला दर्द', detailEn: 'Cramping / Colicky Pain' },
    { code: 'ABD06', categoryKey: 'ABD', detail: 'अचानक तेज पेट दर्द', detailEn: 'Sudden Severe Abdominal Pain' },
    { code: 'ABD07', categoryKey: 'ABD', detail: 'पेट का दर्द पीठ में जाना', detailEn: 'Pain Radiating to Back (Pancreas Screen)' },
    { code: 'ABD08', categoryKey: 'ABD', detail: 'बच्चे का बार-बार पेट दर्द', detailEn: 'Recurrent Abdominal Pain in Child' },
    // BOW — दस्त-कब्ज
    { code: 'BOW01', categoryKey: 'BOW', detail: 'कब्ज', detailEn: 'Constipation' },
    { code: 'BOW02', categoryKey: 'BOW', detail: 'सख्त / कड़ाके का मल', detailEn: 'Hard Stools' },
    { code: 'BOW03', categoryKey: 'BOW', detail: 'पुरानी कब्ज (महीनों से)', detailEn: 'Chronic Constipation' },
    { code: 'BOW04', categoryKey: 'BOW', detail: 'अचानक पतले दस्त', detailEn: 'Acute Diarrhea' },
    { code: 'BOW05', categoryKey: 'BOW', detail: 'बार-बार पतले दस्त', detailEn: 'Recurrent Loose Motions' },
    { code: 'BOW06', categoryKey: 'BOW', detail: 'खून वाले दस्त', detailEn: 'Bloody Diarrhea (Refer Flag)' },
    { code: 'BOW07', categoryKey: 'BOW', detail: 'यात्रा के बाद दस्त', detailEn: 'Traveler Diarrhea' },
    { code: 'BOW08', categoryKey: 'BOW', detail: 'सुबह की हड़बड़ी — 2-3 बार शौच', detailEn: 'Morning Rush (IBS-D Pattern)' },
    { code: 'BOW09', categoryKey: 'BOW', detail: 'कभी दस्त कभी कब्ज (बदलता आदत)', detailEn: 'Alternating Bowel Habit (IBS-M)' },
    { code: 'BOW10', categoryKey: 'BOW', detail: 'मल में बलगम / श्लेष्मा', detailEn: 'Mucus in Stool' },
    { code: 'BOW11', categoryKey: 'BOW', detail: 'शौच पूरा न होने का एहसास', detailEn: 'Incomplete Evacuation' },
    { code: 'BOW12', categoryKey: 'BOW', detail: 'रात में दस्त से नींद टूटना', detailEn: 'Nocturnal Diarrhea' },
    // LIV — लीवर व पीलिया
    { code: 'LIV01', categoryKey: 'LIV', detail: 'पीली आंखें / पीलिया', detailEn: 'Jaundice / Yellow Eyes' },
    { code: 'LIV02', categoryKey: 'LIV', detail: 'बुखार के साथ पीलिया', detailEn: 'Jaundice with Fever' },
    { code: 'LIV03', categoryKey: 'LIV', detail: 'पूरे शरीर पर खुजली', detailEn: 'Generalized Itching (Cholestasis Screen)' },
    { code: 'LIV04', categoryKey: 'LIV', detail: 'अल्ट्रासाउंड में फैटी लीवर', detailEn: 'Fatty Liver on Ultrasound' },
    { code: 'LIV05', categoryKey: 'LIV', detail: 'हेपेटाइटिस B पॉजिटिव फॉलो-अप', detailEn: 'Hepatitis B Carrier Follow-up' },
    { code: 'LIV06', categoryKey: 'LIV', detail: 'सिरोसिस का नियमित फॉलो-अप (स्थिर)', detailEn: 'Cirrhosis Stable Follow-up' },
    // ANO — गुदा संबंधी
    { code: 'ANO01', categoryKey: 'ANO', detail: 'बवासीर (गुदा में मांस)', detailEn: 'Piles / Hemorrhoids' },
    { code: 'ANO02', categoryKey: 'ANO', detail: 'शौच में कटने जैसा दर्द (फिशर)', detailEn: 'Anal Fissure Pain' },
    { code: 'ANO03', categoryKey: 'ANO', detail: 'गुदा के आस-पास खुजली', detailEn: 'Anal Itching' },
    { code: 'ANO04', categoryKey: 'ANO', detail: 'गुदा के बाहर मांस / सूजन', detailEn: 'Anal Tag / Swelling' },
    // OTH — अन्य
    { code: 'OTH01', categoryKey: 'OTH', detail: 'भूख न लगना', detailEn: 'Loss of Appetite' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'मतली और उल्टी', detailEn: 'Nausea & Vomiting' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'पेट के कीड़े (संक्रमण)', detailEn: 'Worm Infestation' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'मुंह में बार-बार छाले', detailEn: 'Recurrent Mouth Ulcers' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'खाना निगलने में दिक्कत', detailEn: 'Difficulty Swallowing (RED FLAG)' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'पेट की शिकायत के साथ वजन घटना', detailEn: 'Weight Loss with GI Symptoms (RED FLAG)' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'खून की उल्टी', detailEn: 'Vomiting Blood (ER)' },
    { code: 'OTH08', categoryKey: 'OTH', detail: 'काला मल', detailEn: 'Black Stools (ER)' },
  ],

  // ══ Questions (100) ═══════════════════════════════════════════════════
  // questionIndex order below MUST match this array order (idx annotated).
  questions: [
    // ACD01 Acidity / gas trouble
    { complaintCode: 'ACD01', question: 'एसिडिटी कितने समय से चल रही है?', questionEn: 'Since how long has the acidity been going on?' }, // idx 0
    { complaintCode: 'ACD01', question: 'तीखा-तला खाना या खाली पेट चाय-कॉफी से जलन बढ़ती है?', questionEn: 'Does spicy-fried food or tea-coffee on empty stomach worsen the burning?' }, // idx 1
    { complaintCode: 'ACD01', question: 'जलन के साथ वजन घटना, खाना निगलने में दिक्कत या उल्टी में खून तो नहीं?', questionEn: 'Any weight loss, swallowing trouble or blood in vomit along with the burning?' }, // idx 2
    // ACD02 Heartburn after meals
    { complaintCode: 'ACD02', question: 'जलन खाने के कितनी देर बाद शुरू होती है?', questionEn: 'How soon after food does the burning start?' }, // idx 3
    { complaintCode: 'ACD02', question: 'रात को लेटने पर जलन ऊपर आती है या नींद टूटती है?', questionEn: 'Does burning rise on lying down at night or wake you from sleep?' }, // idx 4
    // ACD03 Sour belching
    { complaintCode: 'ACD03', question: 'खट्टी-कड़वी डकार कब ज्यादा आती है — खाने के बाद?', questionEn: 'When is sour belching worse — after meals?' }, // idx 5
    { complaintCode: 'ACD03', question: 'डकार के साथ गला खराब या खांसी भी रहती है?', questionEn: 'Any throat irritation or cough along with the belching?' }, // idx 6
    // ACD04 Acid reflux rising up
    { complaintCode: 'ACD04', question: 'खट्टा पानी मुंह तक आता है या सीने तक रुकता है?', questionEn: 'Does the sour water reach the mouth or stop at the chest?' }, // idx 7
    { complaintCode: 'ACD04', question: 'एंटासिड या दूध पीने से तुरंत राहत मिलती है?', questionEn: 'Is there instant relief with antacid or milk?' }, // idx 8
    // ACD05 Post-meal fullness
    { complaintCode: 'ACD05', question: 'थोड़ा सा खाने पर ही पेट भर जाता है?', questionEn: 'Do you feel full after eating just a little?' }, // idx 9
    { complaintCode: 'ACD05', question: 'भारीपन के साथ जी भी मिचलाता है?', questionEn: 'Any nausea along with the heaviness?' }, // idx 10
    // ACD06 Indigestion
    { complaintCode: 'ACD06', question: 'कौन सा खाना खाने के बाद अपच सबसे ज्यादा होता है?', questionEn: 'After which food is the indigestion worst?' }, // idx 11
    { complaintCode: 'ACD06', question: 'तनाव भरे दिनों में अपच बढ़ जाता है?', questionEn: 'Does indigestion worsen on stressful days?' }, // idx 12
    // ACD07 Gas / bloating
    { complaintCode: 'ACD07', question: 'गैस-फूलना कब ज्यादा — दिनभर या शाम को?', questionEn: 'When is the gas-bloating worse — all day or in the evening?' }, // idx 13
    { complaintCode: 'ACD07', question: 'डकार या गैस छोड़ने से फूलना घटता है?', questionEn: 'Does belching or passing gas reduce the bloating?' }, // idx 14
    // ACD08 Persistent hiccups
    { complaintCode: 'ACD08', question: 'हिचकी कितने घंटों / दिनों से चल रही है?', questionEn: 'For how many hours or days have the hiccups lasted?' }, // idx 15
    { complaintCode: 'ACD08', question: 'हिचकी के साथ वजन घटना या खाना निगलने में दिक्कत भी है?', questionEn: 'Any weight loss or swallowing trouble along with the hiccups?' }, // idx 16
    // ABD01 Epigastric pain
    { complaintCode: 'ABD01', question: 'दर्द खाली पेट ज्यादा है या खाने के तुरंत बाद?', questionEn: 'Is the pain worse on an empty stomach or right after food?' }, // idx 17
    { complaintCode: 'ABD01', question: 'कभी काला मल या उल्टी में खून देखा है?', questionEn: 'Have you ever seen black stools or blood in vomit?' }, // idx 18
    // ABD02 RUQ pain
    { complaintCode: 'ABD02', question: 'तला-गरिष्ट खाना खाने के 2-4 घंटे बाद दर्द आता है?', questionEn: 'Does the pain come 2-4 hours after fried or fatty food?' }, // idx 19
    { complaintCode: 'ABD02', question: 'दर्द के साथ बुखार, ठंड लगना या पीली आंखें भी हुईं?', questionEn: 'Any fever, chills or yellow eyes along with the pain?' }, // idx 20
    // ABD03 Lower abdominal pain
    { complaintCode: 'ABD03', question: 'दर्द शौच करने से कम हो जाता है?', questionEn: 'Is the pain relieved by passing stool?' }, // idx 21
    { complaintCode: 'ABD03', question: 'पेशाब में जलन या बार-बार पेशाब आना भी है?', questionEn: 'Any burning or frequent urination as well?' }, // idx 22
    // ABD04 RLQ pain
    { complaintCode: 'ABD04', question: 'दर्द नाभि से शुरू होकर दाएं निचले पेट में आया है?', questionEn: 'Did the pain start at the navel and shift to the right lower abdomen?' }, // idx 23
    { complaintCode: 'ABD04', question: 'दर्द छूने या चलने-हिलने पर बहुत बढ़ता है?', questionEn: 'Is the pain much worse on touching or moving around?' }, // idx 24
    // ABD05 Cramping pain
    { complaintCode: 'ABD05', question: 'मरोड़ कब ज्यादा — खाने के बाद या शौच से पहले?', questionEn: 'When are the cramps worse — after food or before passing stool?' }, // idx 25
    { complaintCode: 'ABD05', question: 'मरोड़ के साथ दस्त या कब्ज बदलती रहती है?', questionEn: 'Do stools or constipation keep changing along with the cramps?' }, // idx 26
    // ABD06 Sudden severe pain
    { complaintCode: 'ABD06', question: 'दर्द 10 में से कितना है — 8 से ऊपर?', questionEn: 'How severe is the pain out of 10 — above 8?' }, // idx 27
    { complaintCode: 'ABD06', question: 'दर्द के साथ उल्टी, पेट सख्त होना या गैस-शौच पूरी तरह बंद?', questionEn: 'Any vomiting, a rigid abdomen, or complete stoppage of gas and stool?' }, // idx 28
    // ABD07 Pain radiating to back
    { complaintCode: 'ABD07', question: 'ऊपरी पेट का दर्द पीठ में चला जाता है — झुकने पर कुछ राहत?', questionEn: 'Does upper abdominal pain bore into the back — any relief on leaning forward?' }, // idx 29
    { complaintCode: 'ABD07', question: 'दर्द से पहले शराब या बहुत तला-भारी खाना लिया था?', questionEn: 'Was there alcohol or very heavy fried food before the pain started?' }, // idx 30
    // ABD08 Child recurrent pain
    { complaintCode: 'ABD08', question: 'हफ्ते में कितनी बार दर्द आता है — स्कूल जाने से बचता है?', questionEn: 'How many times a week is the pain — does the child avoid school?' }, // idx 31
    { complaintCode: 'ABD08', question: 'वजन, भूख और नींद सामान्य हैं?', questionEn: 'Are weight, appetite and sleep normal?' }, // idx 32
    // BOW01 Constipation
    { complaintCode: 'BOW01', question: 'हफ्ते में कितनी बार शौच होता है?', questionEn: 'How many times a week do you pass stool?' }, // idx 33
    { complaintCode: 'BOW01', question: 'शौच के समय खून या दर्द भी होता है?', questionEn: 'Any blood or pain during passing stool?' }, // idx 34
    // BOW02 Hard stools
    { complaintCode: 'BOW02', question: 'मल कैसा है — छोटे सख्त गुठियों जैसा?', questionEn: 'What is the stool like — separate hard pellets?' }, // idx 35
    { complaintCode: 'BOW02', question: 'शौच के लिए बहुत जोर लगाना पड़ता है?', questionEn: 'Do you have to strain a lot to pass stool?' }, // idx 36
    // BOW03 Chronic constipation
    { complaintCode: 'BOW03', question: 'कितने महीने से है — जुलाब की गोली/सिरप की आदत भी बन गई है?', questionEn: 'Since how many months — have you become dependent on purgative pills or syrup?' }, // idx 37
    { complaintCode: 'BOW03', question: 'दिन में पानी और फल-सब्ज़ी कितनी लेते हैं — कोई दवा (आयरन आदि) चालू है?', questionEn: 'How much daily water and fruits-vegetables — any ongoing medicine (iron etc.)?' }, // idx 38
    // BOW04 Acute diarrhea
    { complaintCode: 'BOW04', question: '24 घंटे में कितनी बार दस्त हुए हैं?', questionEn: 'How many loose stools in the last 24 hours?' }, // idx 39
    { complaintCode: 'BOW04', question: 'दस्त में खून, बलगम या बुखार भी है?', questionEn: 'Any blood, mucus or fever with the stools?' }, // idx 40
    { complaintCode: 'BOW04', question: 'प्यास कम लगना, जीभ सूखना या पेशाब कम आना — भी है?', questionEn: 'Any reduced thirst, dry tongue or reduced urine?' }, // idx 41
    // BOW05 Recurrent loose motions
    { complaintCode: 'BOW05', question: 'दस्त होने के बाद पेट का दर्द-बेचैनी खत्म हो जाती है?', questionEn: 'Does abdominal pain-restlessness end once the stool is passed?' }, // idx 42
    { complaintCode: 'BOW05', question: 'दूध पीते ही तुरंत दस्त आ जाते हैं?', questionEn: 'Do loose motions come immediately after drinking milk?' }, // idx 43
    // BOW06 Bloody diarrhea
    { complaintCode: 'BOW06', question: 'खून कैसा है — धारियों में / बूंदों में या मल में मिला हुआ? बुखार भी है?', questionEn: 'How is the blood — streaks, drops or mixed into the stool? Any fever too?' }, // idx 44
    { complaintCode: 'BOW06', question: 'रात में सोते से दस्त जगाते हैं या वजन घट रहा है?', questionEn: 'Do stools wake you at night, or are you losing weight?' }, // idx 45
    // BOW07 Traveler diarrhea
    { complaintCode: 'BOW07', question: 'यात्रा शुरू होने के कितने दिन बाद दस्त शुरू हुए — बाहर का खाना/पानी लिया था?', questionEn: 'How many days into the travel did it start — did you have outside food or water?' }, // idx 46
    { complaintCode: 'BOW07', question: 'साथ यात्रा करने वालों को भी दस्त हुए हैं?', questionEn: 'Did fellow travelers also get loose motions?' }, // idx 47
    // BOW08 Morning rush (IBS-D)
    { complaintCode: 'BOW08', question: 'सुबह उठते ही एक के बाद एक 2-3 बार शौच होता है — फिर दिन भर ठीक?', questionEn: 'Do you pass stool 2-3 times in a row on waking — then remain fine all day?' }, // idx 48
    { complaintCode: 'BOW08', question: 'खाना खाते ही शौच की तेज हड़बड़ी लगती है?', questionEn: 'Do you get an urgent rush to pass stool right after eating?' }, // idx 49
    { complaintCode: 'BOW08', question: 'तनाव, परीक्षा या मीटिंग के दिनों में दस्त बढ़ जाते हैं?', questionEn: 'Do loose motions increase on days with stress, exams or meetings?' }, // idx 50
    // BOW09 Alternating habit (IBS-M)
    { complaintCode: 'BOW09', question: 'दस्त-कब्ज का यह चक्र कितने महीनों से चल रहा है?', questionEn: 'Since how many months has this diarrhea-constipation cycle been running?' }, // idx 51
    { complaintCode: 'BOW09', question: 'दर्द या बेचैनी शौच होने के बाद शांत हो जाती है?', questionEn: 'Is the pain or discomfort settled after passing stool?' }, // idx 52
    { complaintCode: 'BOW09', question: 'मल का रूप कैसा — टुकड़ेदार, पतला दलदला, या पेन्सिल जैसा पतला?', questionEn: 'What is the stool form — pellety, loose mushy, or pencil-thin?' }, // idx 53
    // BOW10 Mucus in stool
    { complaintCode: 'BOW10', question: 'बलगम के साथ खून भी आता है क्या?', questionEn: 'Does blood come along with the mucus?' }, // idx 54
    { complaintCode: 'BOW10', question: 'बलगम बिना दर्द के भी निकलता है?', questionEn: 'Does mucus come out even without pain?' }, // idx 55
    // BOW11 Incomplete evacuation
    { complaintCode: 'BOW11', question: 'शौच के बाद भी फिर जाने का मन या अधूरापन रहता है?', questionEn: 'After passing stool is there still an urge or a feeling of incompleteness?' }, // idx 56
    { complaintCode: 'BOW11', question: 'उम्र 50 से ऊपर है — खून या वजन घटने की शिकायत भी रही?', questionEn: 'Are you over 50 — any history of blood in stool or weight loss?' }, // idx 57
    // BOW12 Nocturnal diarrhea
    { complaintCode: 'BOW12', question: 'रात में नींद से जागकर दस्त लेने पड़ते हैं?', questionEn: 'Do you have to wake from sleep at night to pass stool?' }, // idx 58
    { complaintCode: 'BOW12', question: 'दिन में बुखार या वजन घटने की शिकायत भी है?', questionEn: 'Any daytime fever or weight loss as well?' }, // idx 59
    // LIV01 Jaundice
    { complaintCode: 'LIV01', question: 'पीलिया कितने दिनों से है — बढ़ रहा है या घट रहा है?', questionEn: 'Since how many days is the jaundice — increasing or settling?' }, // idx 60
    { complaintCode: 'LIV01', question: 'पेशाब का रंग कैसा है — चाय जैसा गहरा?', questionEn: 'What colour is the urine — dark like tea?' }, // idx 61
    { complaintCode: 'LIV01', question: 'पीलिया से पहले बुखार, उल्टी या भूख बंद होना था क्या?', questionEn: 'Was there fever, vomiting or loss of appetite before the jaundice?' }, // idx 62
    // LIV02 Jaundice with fever
    { complaintCode: 'LIV02', question: 'बुखार कितने दिन चला और पीलिया उसके बाद आया या साथ-साथ आया?', questionEn: 'How many days did the fever last, and did jaundice follow it or appear together?' }, // idx 63
    { complaintCode: 'LIV02', question: 'बाहर का खाना-पानी/बर्फ लिया था — इंजेक्शन, टैटू या खून लगवाया था?', questionEn: 'Any outside food-water or ice — any injection, tattoo or blood transfusion?' }, // idx 64
    // LIV03 Generalized itching
    { complaintCode: 'LIV03', question: 'खुजली रात में ज्यादा है — पेशाब गहरा या मल का रंग हल्का पड़ गया है?', questionEn: 'Is itching worse at night — is urine dark or stool pale?' }, // idx 65
    { complaintCode: 'LIV03', question: 'खुजली शुरू होने से पहले कोई नई दवा शुरू की थी?', questionEn: 'Was any new medicine started before the itching began?' }, // idx 66
    // LIV04 Fatty liver
    { complaintCode: 'LIV04', question: 'शुगर, बढ़ा वजन या थायरॉइड की कमी की शिकायत भी है?', questionEn: 'Any sugar problem, excess weight or thyroid deficiency as well?' }, // idx 67
    { complaintCode: 'LIV04', question: 'शराब पीते हैं — कितनी और कितने समय से?', questionEn: 'Do you drink alcohol — how much and since when?' }, // idx 68
    // LIV05 Hepatitis B follow-up
    { complaintCode: 'LIV05', question: 'पिछली रिपोर्ट — वायरल लोड और USG — कब कराए थे?', questionEn: 'Previous reports — viral load and USG — when were they last done?' }, // idx 69
    { complaintCode: 'LIV05', question: 'परिवार के सदस्यों की जांच (HBsAg) और टीका — हो गए हैं?', questionEn: 'Have family members been tested (HBsAg) and vaccinated?' }, // idx 70
    // LIV06 Cirrhosis stable FU
    { complaintCode: 'LIV06', question: 'वजन या पेट की परिधि बढ़ रही है — पेट फूला-सा लगता है?', questionEn: 'Is weight or abdominal girth rising — does the abdomen feel distended?' }, // idx 71
    { complaintCode: 'LIV06', question: 'पैरों में सूजन, दिन-रात की नींद उलटना या भूलने जैसे लक्षण?', questionEn: 'Any leg swelling, day-night sleep reversal or forgetfulness?' }, // idx 72
    { complaintCode: 'LIV06', question: 'कभी काला मल, खून की उल्टी या बुखार हुआ है?', questionEn: 'Any history of black stools, blood in vomit or fever?' }, // idx 73
    // ANO01 Piles
    { complaintCode: 'ANO01', question: 'खून कैसे आता है — शौच के बाद लाल बूंदें/छिड़काव, बिना दर्द?', questionEn: 'How does the blood come — red drops or spray after stool, without pain?' }, // idx 74
    { complaintCode: 'ANO01', question: 'मांस शौच के साथ बाहर आता है — अंदर चला जाता है या बाहर रुक जाता है?', questionEn: 'Does a mass come out with stool — go back in by itself or stay out?' }, // idx 75
    // ANO02 Fissure
    { complaintCode: 'ANO02', question: 'शौच के समय चाकू से कटने जैसा दर्द और बाद में घंटों जलन?', questionEn: 'Knife-like cutting pain during stool followed by hours of burning?' }, // idx 76
    { complaintCode: 'ANO02', question: 'कब्ज भी है — दर्द सख्त मल से ही शुरू हुआ था?', questionEn: 'Is there constipation too — did the pain start with a hard stool?' }, // idx 77
    // ANO03 Anal itching
    { complaintCode: 'ANO03', question: 'खुजली रात में ज्यादा है — बच्चे को भी रात में खुजलाते देखा है?', questionEn: 'Is the itching worse at night — have you seen the child scratching at night?' }, // idx 78
    { complaintCode: 'ANO03', question: 'तला-मसालेदार खाना, मलहम या साबुन से खुजली बढ़ती है?', questionEn: 'Does spicy food, ointment or soap worsen the itching?' }, // idx 79
    // ANO04 Anal tag / swelling
    { complaintCode: 'ANO04', question: 'सूजन शौच के बाद बढ़ती है और रात भर में घट जाती है?', questionEn: 'Does the swelling increase after stool and settle overnight?' }, // idx 80
    { complaintCode: 'ANO04', question: 'अचानक तेज दर्द के साथ सख्त नीली-काली गांठ बन गई है?', questionEn: 'Has a hard bluish-black lump formed with sudden severe pain?' }, // idx 81
    // OTH01 Loss of appetite
    { complaintCode: 'OTH01', question: 'भूख कब से कम है — कितने हफ्ते? वजन भी घटा है?', questionEn: 'Since when is the appetite low — how many weeks? Has weight fallen too?' }, // idx 82
    { complaintCode: 'OTH01', question: 'थोड़ा खाने पर दाएं ऊपरी पेट में भारीपन या दर्द आ जाता है?', questionEn: 'Is there right-upper abdominal heaviness or pain after a small meal?' }, // idx 83
    // OTH02 Nausea & vomiting
    { complaintCode: 'OTH02', question: 'उल्टी में खून या कॉफी-मिट्टी जैसा रंग तो नहीं?', questionEn: 'Is there blood or coffee-ground colour in the vomit?' }, // idx 84
    { complaintCode: 'OTH02', question: 'क्या आप गर्भवती हैं (मतली-उल्टी से जुड़ा सवाल)?', questionEn: 'Are you pregnant (relevant to nausea-vomiting management)?' }, // idx 85
    // OTH03 Worms
    { complaintCode: 'OTH03', question: 'मल में कीड़े दिखे हैं — लंबे गोल या छोटे सफेद?', questionEn: 'Have worms been seen in the stool — long round ones or tiny white ones?' }, // idx 86
    { complaintCode: 'OTH03', question: 'बच्चों का डेवॉर्मिंग (कीड़े की गोली) कब से नहीं कराया?', questionEn: 'Since when has deworming of the children not been done?' }, // idx 87
    // OTH04 Mouth ulcers
    { complaintCode: 'OTH04', question: 'साल में कितनी बार छाले आते हैं — कोई छाला 2 हफ्ते से ज्यादा से नहीं भर रहा?', questionEn: 'How many times a year do ulcers come — any ulcer not healing beyond 2 weeks?' }, // idx 88
    { complaintCode: 'OTH04', question: 'छालों के साथ दस्त या वजन घटने की शिकायत भी है?', questionEn: 'Any loose motions or weight loss along with the ulcers?' }, // idx 89
    // OTH05 Dysphagia (RED FLAG)
    { complaintCode: 'OTH05', question: 'ठोस खाना अटकता है या पतला (पानी-दलिया) भी अटकता है?', questionEn: 'Do solids get stuck, or do liquids (water-porridge) also get stuck?' }, // idx 90
    { complaintCode: 'OTH05', question: 'अटकन कहां लगती है — गले में या सीने में?', questionEn: 'Where does it stick — in the throat or in the chest?' }, // idx 91
    { complaintCode: 'OTH05', question: 'वजन घट रहा है? उम्र 50 से ऊपर है?', questionEn: 'Are you losing weight? Are you over 50?' }, // idx 92
    // OTH06 Weight loss with GI (RED FLAG)
    { complaintCode: 'OTH06', question: 'कितने महीने में कितना वजन घटा है?', questionEn: 'How much weight lost over how many months?' }, // idx 93
    { complaintCode: 'OTH06', question: 'भूख और खाना सामान्य रहते हुए भी वजन गिर रहा है?', questionEn: 'Is weight falling despite normal appetite and food intake?' }, // idx 94
    { complaintCode: 'OTH06', question: 'रात के पसीने, बुखार या खून की शिकायत भी रही है?', questionEn: 'Any night sweats, fever or blood loss as well?' }, // idx 95
    // OTH07 Hematemesis (ER)
    { complaintCode: 'OTH07', question: 'उल्टी में खून कैसा था — लाल या कॉफी-मिट्टी जैसा? कितनी मात्रा में?', questionEn: 'How was the blood in vomit — red or coffee-ground? How much?' }, // idx 96
    { complaintCode: 'OTH07', question: 'दर्द की गोलियां (एस्पिरिन/ब्रुफेन जैसी) लेते हैं या शराब पीते हैं?', questionEn: 'Do you take pain pills (aspirin/ibuprofen type) or drink alcohol?' }, // idx 97
    // OTH08 Melena (ER)
    { complaintCode: 'OTH08', question: 'मल पूरी तरह काला — तार जैसा चिपचिपा और बदबूदार है?', questionEn: 'Is the stool fully black — tarry, sticky and foul-smelling?' }, // idx 98
    { complaintCode: 'OTH08', question: 'साथ में चक्कर, कमजोरी या चेहरे का पीलापन (खून की कमी) है?', questionEn: 'Any giddiness, weakness or facial pallor (anemia) along with it?' }, // idx 99
  ],

  // ══ Suggestions (200 — exactly 2 per question; questionIndex matches) ══
  suggestions: [
    // ACD01 q0 (idx 0)
    { questionIndex: 0, text: '2 हफ्ते से कम एसिडिटी — तीखा-तला घटाने से अक्सर ठीक; जरूरत पड़े तो PPI 2-4 हफ्ते', textEn: 'Acidity under 2 weeks — usually settles by cutting spicy-fried food; short 2-4 week PPI course if needed' },
    { questionIndex: 0, text: '1 महीने से ज्यादा चल रही जलन — एंडोस्कोपी सोचें; बिना जांच के लंबी दवा नहीं', textEn: 'Burning over 1 month — consider endoscopy; no long-term medication without evaluation' },
    // ACD01 q1 (idx 1)
    { questionIndex: 1, text: 'तीखा-तला और खाली पेट चाय-कॉफी से जलन बढ़ती है — तला-मसालेदार घटाएं; चाय-कॉफी खाने के बाद, दिन में 1-2 कप ही', textEn: 'Spicy-fried food and empty-stomach tea-coffee worsen it — cut these; take tea-coffee after food, max 1-2 cups/day' },
    { questionIndex: 1, text: 'धीरे-धीरे चबाकर खाएं — दिन में 4-5 छोटे-छोटे भोजन; एक साथ भरपेट न खाएं', textEn: 'Eat slowly, chew well — 4-5 small meals through the day; never one huge filling meal' },
    // ACD01 q2 (idx 2)
    { questionIndex: 2, text: 'जलन के साथ वजन घटना / निगलने में दिक्कत / खून की उल्टी — पहले एंडोस्कोपी रेफरल, दवा बाद में', textEn: 'Burning with weight loss / swallowing trouble / blood in vomit — ENDOSCOPY referral FIRST, medicines later' },
    { questionIndex: 2, text: 'एलार्म लक्षण नहीं — जीवनशैली + PPI 4 हफ्ते, फिर जरूर समीक्षा', textEn: 'No alarm features — lifestyle + PPI for 4 weeks, then mandatory review' },
    // ACD02 q0 (idx 3)
    { questionIndex: 3, text: 'खाने के तुरंत बाद जलन — रिफ्लक्स का चित्र; खाने के बाद कम से कम 2 घंटे बिल्कुल न लेटें', textEn: 'Burning right after food — reflux picture; do NOT lie down for at least 2 hours after eating' },
    { questionIndex: 3, text: 'भोजन से जुड़ी नहीं — गैस्ट्राइटिस/अल्सर की जांच सोचें; भरपेट भोजन घटाएं', textEn: 'Not food-related — consider gastritis/ulcer evaluation; reduce meal size' },
    // ACD02 q1 (idx 4)
    { questionIndex: 4, text: 'रात लेटने पर जलन — बिस्तर का सिरहाना 6-8 इंच ऊंचा करें (ईंट/ब्लॉक से — सिर्फ तकिया नहीं)', textEn: 'Burning on lying down at night — raise the HEAD-END of the bed by 6-8 inches (blocks, not just pillows)' },
    { questionIndex: 4, text: 'रात का खाना सोने से 3 घंटे पहले खत्म करें; रात की चाय-कॉफी बंद करें', textEn: 'Finish dinner 3 hours before bedtime; stop bedtime tea-coffee' },
    // ACD03 q0 (idx 5)
    { questionIndex: 5, text: 'खाने के बाद खट्टी डकार — रिफ्लक्स संकेत; खाने के तुरंत बाद झुकना या जोर लगाना बंद करें', textEn: 'Sour belching after meals — reflux sign; no stooping or straining right after food' },
    { questionIndex: 5, text: 'हवा वाली डकार — जल्दी-जल्दी खाना और बातें करते खाना बंद करें; ढकार आने पर बैठकर दबाव न लगाएं', textEn: 'Air belching — stop eating fast or talking while eating; no forced pressure to burp' },
    // ACD03 q1 (idx 6)
    { questionIndex: 6, text: 'डकार + गला खराब/खांसी — गले तक रिफ्लक्स पहुंच रहा है; रात का भोजन हल्का और जल्दी रखें', textEn: 'Belching + throat irritation/cough — reflux is reaching the throat; keep dinner light and early' },
    { questionIndex: 6, text: 'गला ठीक है — सामान्य एसिडिटी; PPI 4 हफ्ते + जीवनशैली, फिर समीक्षा', textEn: 'Throat fine — simple acidity; PPI 4 weeks + lifestyle, then review' },
    // ACD04 q0 (idx 7)
    { questionIndex: 7, text: 'खट्टा पानी मुंह तक आता है — तीव्र रिफ्लक्स; दवा 4-8 हफ्ते चलाकर जरूर समीक्षा करें', textEn: 'Sour water reaching the mouth — significant reflux; treat 4-8 weeks then mandatory review' },
    { questionIndex: 7, text: 'सीने तक ही रुकता है — हल्का रिफ्लक्स; पहले जीवनशैली, दवा जरूरत पड़ने पर', textEn: 'Stops at the chest — mild reflux; lifestyle first, medicines only if needed' },
    // ACD04 q1 (idx 8)
    { questionIndex: 8, text: 'एंटासिड/दूध से तुरंत राहत — एसिड का कारण पक्का; नियमित PPI 4 हफ्ते चलाएं, एंटासिड सिर्फ SOS', textEn: 'Instant relief with antacid/milk — acid cause confirmed; regular PPI for 4 weeks, antacid only SOS' },
    { questionIndex: 8, text: 'एंटासिड से भी राहत नहीं — एंडोस्कोपी जरूरी; दवा बढ़ाने से पहले जांच', textEn: 'No relief even with antacids — endoscopy needed; test before escalating medicines' },
    // ACD05 q0 (idx 9)
    { questionIndex: 9, text: 'थोड़ा खाकर ही पेट भर जाता है — कार्यात्मक अपच आम; छोटे-छोटे भोजन बार-बार रखें', textEn: 'Filling up after a little food — functional dyspepsia is common; keep meals small and frequent' },
    { questionIndex: 9, text: 'भरा-भरा लगना + वजन घटना — जांच (USG पेट + LFT) कराएं', textEn: 'Early fullness + weight loss — get evaluated (abdominal USG + LFT)' },
    // ACD05 q1 (idx 10)
    { questionIndex: 10, text: 'भारीपन + जी मिचलाना — खाने के तुरंत बाद लेटना बंद; हल्का कम-तेल भोजन', textEn: 'Heaviness + nausea — no lying down right after food; light low-oil meals' },
    { questionIndex: 10, text: 'सिर्फ भारीपन — पाचक एंजाइम/हर्बल जुलाब नहीं, एंटासिड-एंजाइम से आराम मिलता है', textEn: 'Only heaviness — antacid-enzyme preparations give relief' },
    // ACD06 q0 (idx 11)
    { questionIndex: 11, text: 'ट्रिगर खाना पहचानना जरूरी — Symptom-Food डायरी (दी गई तालिका) 14 दिन भरकर दिखाएं', textEn: 'Identifying trigger foods matters — fill the Symptom-Food Diary (table given) for 14 days and show it' },
    { questionIndex: 11, text: 'हर खाने से अपच — मात्रा घटाएं; एक बार में 1-2 रोटी जैसी छोटी खुराक, धीरे खाएं', textEn: 'Indigestion from every meal — reduce quantity; small portions (1-2 rotis at a time), eaten slowly' },
    // ACD06 q1 (idx 12)
    { questionIndex: 12, text: 'तनाव के दिनों में अपच बढ़ता है — गुट-ब्रेन जुड़ाव; रोज़ 30 मिनट टहलना, प्राणायाम और पूरी नींद दवा जैसा असर रखते हैं', textEn: 'Indigestion worse on stressful days — gut-brain link; daily 30-min walks, breathing exercises and full sleep work like medicine' },
    { questionIndex: 12, text: 'तनाव से जुड़ा नहीं — खाने का पैटर्न देखें; डायरी भरकर पक्का करें', textEn: 'Not stress-linked — check the food pattern; confirm by filling the diary' },
    // ACD07 q0 (idx 13)
    { questionIndex: 13, text: 'दिनभर की गैस — खाने की गति धीमी करें; पान-गुटखा-तंबाकू भी हवा और गैस बढ़ाते हैं — बंद करें', textEn: 'All-day gas — slow down while eating; gutkha-pan-tobacco also add air and gas — stop them' },
    { questionIndex: 13, text: 'शाम को ज्यादा गैस — दिन का भारी भोजन और देर से खाना घटाएं; रात का खाना हल्का', textEn: 'Gas worse in the evening — cut heavy daytime food and late eating; keep dinner light' },
    // ACD07 q1 (idx 14)
    { questionIndex: 14, text: 'गैस छोड़ने/डकार लेने से राहत — कार्यात्मक फूलना; खाने के बाद 10-15 मिनट टहलना मदद करता है', textEn: 'Relief after passing gas or belching — functional bloating; a 10-15 min walk after meals helps' },
    { questionIndex: 14, text: 'गैस छोड़ने से नहीं घटता — रिफ्लक्स/कब्ज की जांच करें', textEn: 'Not reduced by passing gas — evaluate for reflux/constipation' },
    // ACD08 q0 (idx 15)
    { questionIndex: 15, text: '48 घंटे से ज्यादा हिचकी — चीनी-पानी निगलना, सांस रोकना जैसे उपाय; जारी रहे तो जांच जरूरी', textEn: 'Hiccups over 48 hours — sugar-water swallowing, breath-holding type measures; workup if persistent' },
    { questionIndex: 15, text: 'कुछ घंटों की हिचकी — सामान्य; गुनगुने पानी के घूंट से रुक जाती है', textEn: 'Hours-long hiccups only — benign; settles with sips of warm water' },
    // ACD08 q1 (idx 16)
    { questionIndex: 16, text: 'हिचकी + वजन घटना / निगलने में दिक्कत — गंभीर कारण निकालने की जांच तुरंत कराएं', textEn: 'Hiccups with weight loss / swallowing trouble — urgent workup to exclude serious causes' },
    { questionIndex: 16, text: 'बिना अन्य लक्षण — आमतौर पर निर्दोष; 1 हफ्ते से ज्यादा रहे तो देखा जाए', textEn: 'No other symptoms — usually benign; review if beyond 1 week' },
    // ABD01 q0 (idx 17)
    { questionIndex: 17, text: 'खाली पेट दर्द, खाने से राहत — डुओडेनल अल्सर जैसा; PPI कोर्स शुरू करें — 6 हफ्ते में न ठीक हो तो एंडोस्कोपी', textEn: 'Empty-stomach pain relieved by food — duodenal ulcer-like; start PPI course — endoscopy if not settled by 6 weeks' },
    { questionIndex: 17, text: 'खाने के तुरंत बाद दर्द — गैस्ट्रिक/पित्त जैसा; तला-भारी बंद, छोटे भोजन; पेट दर्द में केवल पैरासिटामोल — ब्रुफेन/एस्पिरिन कभी नहीं', textEn: 'Pain right after food — gastric/biliary-like; stop fried-heavy food, small meals; for gastric pain ONLY paracetamol — never ibuprofen/aspirin' },
    // ABD01 q1 (idx 18)
    { questionIndex: 18, text: 'कभी खून की उल्टी या काला मल — खून की उल्टी या काला मल हो तो तुरंत EMERGENCY; कुछ खाना-पीना रोककर अस्पताल जाएं', textEn: 'Blood in vomit or black stools ever — EMERGENCY when it happens; go to hospital with nothing by mouth' },
    { questionIndex: 18, text: 'खून कभी नहीं — अच्छा; दर्द की गोली (NSAID) चालू हो तो बंद कराएं — आगे सिर्फ पैरासिटामोल', textEn: 'Never any bleed — good; if on NSAID-type pain pills get them stopped — paracetamol only henceforth' },
    // ABD02 q0 (idx 19)
    { questionIndex: 19, text: 'तला-गरिष्ट खाना खाने के 2-4 घंटे बाद दर्द — पित्त पथरी संभव; USG पेट कराएं', textEn: 'Pain 2-4 hours after fried/fatty food — gallstone likely; get an abdominal ultrasound' },
    { questionIndex: 19, text: 'भोजन से जुड़ा नहीं — लीवर/आंत की दूसरी जांच जारी रखें', textEn: 'Not food-related — continue other liver/intestinal evaluation' },
    // ABD02 q1 (idx 20)
    { questionIndex: 20, text: 'दर्द + बुखार/ठंड या पीली आंखें — पित्त नली की जटिलता (पथरी+संक्रमण) — उसी दिन अस्पताल भेजें', textEn: 'Pain with fever/chills or yellow eyes — bile-duct complication (stone + infection) — hospital the same day' },
    { questionIndex: 20, text: 'बिना बुखार-पीलिया — साधारण पित्त-मरोड़ (बिलियरी कोलिक); दर्द में सिर्फ पैरासिटामोल/स्पाज्म-दवा; शांत होने पर सर्जरी सलाह (इलेक्टिव)', textEn: 'No fever-jaundice — simple biliary colic; paracetamol/antispasmodic only for pain; elective surgery opinion once settled' },
    // ABD03 q0 (idx 21)
    { questionIndex: 21, text: 'दर्द शौच से राहत मिलती है — IBS पैटर्न; ट्रिगर खाना घटाएं, तनाव-प्रबंधन जोड़ें', textEn: 'Pain relieved by passing stool — IBS pattern; cut trigger foods, add stress management' },
    { questionIndex: 21, text: 'शौच से दर्द नहीं घटता — संरचनात्मक कारण जांचें (USG पेट)', textEn: 'Pain not reduced by stool — investigate structural causes (abdominal USG)' },
    // ABD03 q1 (idx 22)
    { questionIndex: 22, text: 'पेशाब में जलन/बार-बार पेशाब — मूत्र की जांच कराएं; जरूरत पड़े तो यूरोलॉजी रेफर', textEn: 'Burning/frequent urination — get a urine test; urology referral if needed' },
    { questionIndex: 22, text: 'पेशाब ठीक — पाचन-तंत्र की जांच जारी रखें', textEn: 'Urination fine — continue digestive evaluation' },
    // ABD04 q0 (idx 23)
    { questionIndex: 23, text: 'नाभि से शुरू होकर दाएं निचले पेट में दर्द — क्लासिक अपेंडिसिटिस — सर्जिकल EMERGENCY, आज ही अस्पताल', textEn: 'Pain starting at the navel shifting to right lower abdomen — classic appendicitis — surgical EMERGENCY, hospital today' },
    { questionIndex: 23, text: 'एक ही जगह रहा — अन्य कारण; बढ़े या बुखार आए तो USG उसी दिन', textEn: 'Stayed in one spot — other causes; USG the same day if worsening or fever appears' },
    // ABD04 q1 (idx 24)
    { questionIndex: 24, text: 'छूने/चलने से दर्द बहुत बढ़ता है — पेट की परत में सूजन (पेरिटोनिटिस) — पहले सर्जरी रेफर; रास्ते में सादी स्पाज्म-दवा SOS चल सकती है', textEn: 'Pain much worse on touch/walking — peritoneal inflammation — surgical referral FIRST; a plain antispasmodic SOS is acceptable only en route' },
    { questionIndex: 24, text: 'छूने से नहीं बढ़ता — राहत की बात; 24 घंटे में दोबारा देखा जाए', textEn: 'Not worse on touch — reassuring; re-examine within 24 hours' },
    // ABD05 q0 (idx 25)
    { questionIndex: 25, text: 'खाने के बाद मरोड़ — पाचन/पित्त से जुड़ी; तला-गरिष्ट खाना बंद, भोजन छोटा', textEn: 'Cramps after food — digestion/biliary linked; stop fried-spicy food, smaller meals' },
    { questionIndex: 25, text: 'शौच/पेशाब से पहले की मरोड़ — आंत-मूत्र दोनों शिकायतें साथ देखें', textEn: 'Cramps before stool/urination — evaluate bowel and urinary complaints together' },
    // ABD05 q1 (idx 26)
    { questionIndex: 26, text: 'मरोड़ + बदलता दस्त-कब्ज — IBS का चित्र; खाना-डायरी + तनाव प्रबंधन + IBS डाइट चार्ट अपनाएं', textEn: 'Cramps with alternating stool habit — IBS picture; food diary + stress management + adopt the IBS diet chart' },
    { questionIndex: 26, text: 'दस्त सामान्य — स्पाज्म-दवा SOS देखें; पैटर्न नोट करते रहें', textEn: 'Stools normal — SOS antispasmodic; keep noting the pattern' },
    // ABD06 q0 (idx 27)
    { questionIndex: 27, text: '8-10/10 का तेज दर्द — तत्काल अस्पताल; मुंह में कुछ न दें — पहले जांच, फिर इलाज', textEn: 'Severe 8-10/10 pain — hospital immediately; nothing by mouth — evaluate first, treat after' },
    { questionIndex: 27, text: '4-6/10 दर्द — उसी दिन OPD जांच (USG पेट + लैब) कराएं', textEn: 'Pain 4-6/10 — same-day OPD workup (abdominal USG + labs)' },
    // ABD06 q1 (idx 28)
    { questionIndex: 28, text: 'उल्टी + गैस-शौच बंद + पेट फूला — आंत में रुकावट या छेद (परफोरेशन) — EMERGENCY', textEn: 'Vomiting + stopped gas/stool + distended abdomen — intestinal obstruction or perforation — EMERGENCY' },
    { questionIndex: 28, text: 'गैस-शौच चल रहा है — रुकावट जैसा नहीं; फिर भी तेज दर्द में जांच उसी दिन', textEn: 'Gas and stool passing — not obstruction-like; still same-day workup if pain is severe' },
    // ABD07 q0 (idx 29)
    { questionIndex: 29, text: 'ऊपरी पेट से पीठ में जाता दर्द, झुकने पर थोड़ी राहत — अग्नाशय (पैंक्रियाटाइटिस) की जांच: सीरम एमाइलेज़-लाइपेज़ + USG; तेज हो या उल्टी बढ़े — अस्पताल', textEn: 'Upper-abdominal pain boring to the back, eased slightly by leaning forward — pancreatitis workup: serum amylase-lipase + USG; hospital if severe or vomiting worsens' },
    { questionIndex: 29, text: 'पीठ में नहीं जाता — अग्नाशय की चिंता कम; अल्सर/पित्त की जांच करें', textEn: 'Not radiating to the back — pancreatic concern lower; evaluate ulcer/biliary causes' },
    // ABD07 q1 (idx 30)
    { questionIndex: 30, text: 'शराब या भारी तला खाना उससे पहले — अग्नाशय की सूजन का आम कारण — शरापूर्ण तौर पर बंद करें; खाना-पीना रोककर तुरंत जांच', textEn: 'Alcohol or heavy fried food before onset — common pancreatitis trigger — stop alcohol completely; NPO and immediate workup' },
    { questionIndex: 30, text: 'नहीं लिया — अन्य कारण जांचें; गैस्ट्राइटिस का कोर्स शुरू किया जा सकता है', textEn: 'Neither — evaluate other causes; a gastritis course may be started' },
    // ABD08 q0 (idx 31)
    { questionIndex: 31, text: 'हफ्ते में 1+ बार, 2 महीने से ज्यादा चला — बच्चों का कार्यात्मक पेट दर्द आम; स्कूल-तनाव से जुड़ सकता है — आश्वस्त करें', textEn: 'Weekly-plus for over 2 months — childhood functional abdominal pain is common; may be school-stress linked — reassure' },
    { questionIndex: 31, text: 'हाल में शुरू या रोज़ — जियार्डिया/कीड़े की जांच कराएं (मल परीक्षा)', textEn: 'Recent or daily onset — test for giardia/worms (stool examination)' },
    // ABD08 q1 (idx 32)
    { questionIndex: 32, text: 'वजन, भूख, नींद सामान्य — आर्गेनिक चिंता कम; दूध की मात्रा घटाकर देखें', textEn: 'Weight, appetite and sleep normal — low organic concern; trial reducing milk quantity' },
    { questionIndex: 32, text: 'वजन घटा / रात का दर्द / मल में खून — विस्तृत जांच तुरंत शुरू करें', textEn: 'Weight loss / night pain / blood in stool — start detailed workup urgently' },
    // BOW01 q0 (idx 33)
    { questionIndex: 33, text: 'हफ्ते में 3 से कम शौच — कब्ज पक्की; फाइबर + पानी से 2-4 हफ्ते में सुधार आता है', textEn: 'Fewer than 3 stools a week — definite constipation; fiber + water improve it over 2-4 weeks' },
    { questionIndex: 33, text: 'हफ्ते में 3 या ज्यादा — आदत सामान्य; मल का रूप देखें (ब्रिस्टल चार्ट-तालिका)', textEn: '3 or more a week — habit normal; check stool form (Bristol chart table)' },
    // BOW01 q1 (idx 34)
    { questionIndex: 34, text: 'शौच के समय पहले दर्द-कटना — फिशर की तस्वीर; सिट्ज़ बाथ + मल नरम करना शुरू करें', textEn: 'Pain-cutting during stool first — fissure picture; begin sitz bath + stool softening' },
    { questionIndex: 34, text: 'बिना दर्द के खून की बूंदें — बवासीर आम कारण; एक बार प्रोक्टोस्कोपी जांच जरूरी', textEn: 'Painless blood drops — piles is the common cause; one proctoscopy examination is essential' },
    // BOW02 q0 (idx 35)
    { questionIndex: 35, text: 'मल छोटी सख्त गुठियों जैसा (ब्रिस्टल 1-2) — फाइबर कम है; सुबह 2 बड़े गिलास पानी + छिलके सहित फल + साबुत गेहूं', textEn: 'Pellet-like stool (Bristol 1-2) — low fiber; 2 large glasses of water each morning + fruits with skin + whole wheat' },
    { questionIndex: 35, text: 'मल का रूप सामान्य (ब्रिस्टल 3-4) — मात्रा/समय की समस्या; शौच का नियम बनाएं', textEn: 'Stool form normal (Bristol 3-4) — quantity/timing issue; fix a toilet routine' },
    // BOW02 q1 (idx 36)
    { questionIndex: 36, text: 'जोर लगाना बवासीर-फिशर बढ़ाता है — नाश्ते के 20-30 मिनट बाद शौच का नियम बनाएं और बिल्कुल जोर न लगाएं', textEn: 'Straining worsens piles-fissure — make a toilet rule 20-30 minutes after breakfast and never strain' },
    { questionIndex: 36, text: 'बिना जोर शौच हो रहा है — अच्छा; यही दिनचर्या जारी रखें', textEn: 'Passing stool without straining — good; keep this very routine' },
    // BOW03 q0 (idx 37)
    { questionIndex: 37, text: 'जुलाब की गोली/सिरप की आदत — धीरे-धीरे घटाएं; रोज़ाना रेशेदार आहार (साबुत गेहूं, हरी सब्ज़ियां, फल) डालें', textEn: 'Dependence on purgative pills-syrup — taper gradually; put daily high-fiber diet (whole wheat, green vegetables, fruits) in place' },
    { questionIndex: 37, text: 'नई कब्ज (हफ्तों में शुरू) — कारण तलाशें: नई दवा (आयरन/दर्द की गोली), बिस्तर पर रहना, पानी की कमी', textEn: 'New-onset constipation (started within weeks) — find the cause: new medicine (iron/pain pills), bed rest, low water' },
    // BOW03 q1 (idx 38)
    { questionIndex: 38, text: 'पानी दिन में 2 लीटर से कम है — बढ़ाएं; रोज़ 2 लीटर पानी + खूब रेशा (गेहूं रोटी, छिलकेदार फल, सब्ज़ियां) कब्ज की पहली दवा है', textEn: 'Water under 2 L a day — increase it; daily 2 L water + plenty of fiber (wheat rotis, fruits with skin, vegetables) is the first medicine for constipation' },
    { questionIndex: 38, text: 'आयरन/दर्द की दवा से कब्ज — डॉक्टर से दवा बदलवाएं; पानी + फाइबर और भी जरूरी', textEn: 'Constipation from iron/pain medicines — get the medicine changed via doctor; water + fiber become even more important' },
    // BOW04 q0 (idx 39)
    { questionIndex: 39, text: 'ORS का सही तरीका — 1 पैकेट पूरा केवल 1 लीटर उबले-ठंडे पानी में घोलें; हर दस्त के बाद बड़ों में 1-2 गिलास, बच्चों में आधा गिलास; घोल 24 घंटे में खत्म करें', textEn: 'Correct ORS method — dissolve 1 full packet in exactly 1 L of boiled-cooled water; after each loose stool give adults 1-2 glasses, children half a glass; use the solution within 24 hours' },
    { questionIndex: 39, text: 'दस्त में जिंक वरदान है — 14 दिन तक रोज़ (सिरप/गोली); दस्त रुकने पर भी पूरा 14 दिन का कोर्स खत्म करें', textEn: 'Zinc is a boon in diarrhea — daily for 14 days (syrup/tablet); complete the full 14-day course even after stools settle' },
    // BOW04 q1 (idx 40)
    { questionIndex: 40, text: 'दस्त में खून/बलगम या बुखार — डिसेंट्री; लूपरामाइड जैसी रुकावट-वाली दवा कभी नहीं; शौच जांच कराकर इलाज डॉक्टर से', textEn: 'Stools with blood/mucus or fever — dysentery; NEVER antimotility-type (loperamide) drugs; get a stool test and doctor-prescribed treatment' },
    { questionIndex: 40, text: 'साफ पानीदार दस्त, बुखार नहीं — ज्यादातर वायरल; ORS + जिंक + दही/छाछ (प्रोबायोटिक) से 2-3 दिन में सुधार', textEn: 'Clear watery stools without fever — mostly viral; ORS + zinc + curd/buttermilk (probiotic) settle it in 2-3 days' },
    // BOW04 q2 (idx 41)
    { questionIndex: 41, text: 'प्यास कम, जीभ सूखी, पेशाब कम — निर्जलीकरण — तुरंत अस्पताल, IV तरल चाहिए', textEn: 'Low thirst, dry tongue, reduced urine — dehydration — hospital now for IV fluids' },
    { questionIndex: 41, text: 'हल्के संकेत — बार-बार छोटे-छोटे घूंट ORS; एक साथ ढेर सारा पानी न पिएं; उल्टी हो तो 10 मिनट रुककर फिर शुरू करें', textEn: 'Mild signs — frequent small sips of ORS; not a lot at once; if vomiting, wait 10 minutes and restart' },
    // BOW05 q0 (idx 42)
    { questionIndex: 42, text: 'दस्त होते ही दर्द-बेचैनी खत्म — IBS-D पैटर्न; खाना ट्रिगर नोट करें, तनाव घटाएं', textEn: 'Pain-restlessness ends with the stool — IBS-D pattern; note food triggers, reduce stress' },
    { questionIndex: 42, text: 'दस्त के बाद भी दर्द — IBS मानने से पहले संरचनात्मक जांच (कोलोनोस्कोपी सोचें)', textEn: 'Pain persists after stool — structural workup before calling it IBS (consider colonoscopy)' },
    // BOW05 q1 (idx 43)
    { questionIndex: 43, text: 'दूध पीते ही दस्त — लैक्टोज़ असहिष्णुता आम है; दूध घटाएं — दही/छाछ पच जाते हैं और आंत के अच्छे कीटाणु बढ़ाते हैं', textEn: 'Loose motions right after milk — lactose intolerance is common; cut milk — curd/buttermilk digest well and boost good gut bacteria' },
    { questionIndex: 43, text: 'दूध ठीक बैठता है — ट्रिगर कुछ और; 14 दिन की डायरी से पहचानें', textEn: 'Milk suits fine — some other trigger; identify with a 14-day diary' },
    // BOW06 q0 (idx 44)
    { questionIndex: 44, text: 'खून वाले दस्त — शौच की जांच (रूटीन + आवश्यकता पर कल्चर) आज ही; खुद से एंटीबायोटिक शुरू न करें', textEn: 'Bloody stools — stool test (routine + culture if needed) today; do NOT self-start antibiotics' },
    { questionIndex: 44, text: 'मेट्रोनिडाज़ोल/टिनिडाज़ोल वाली दवा चले तो शराब पूर्ण वर्जित — कोर्स के दौरान और 48 घंटे बाद तक (नकसीर, उल्टी, धड़कन का खतरा)', textEn: 'If on metronidazole/tinidazole — alcohol strictly prohibited during the course and 48 hours after (flushing, vomiting, palpitations risk)' },
    // BOW06 q1 (idx 45)
    { questionIndex: 45, text: 'खूनी दस्त + रात के दस्त + वजन घटना — IBD (क्रोन/UC) की जांच — कोलोनोस्कोपी हेतु रेफर करें', textEn: 'Bloody stools + nocturnal stools + weight loss — IBD (Crohn/UC) workup — refer for colonoscopy' },
    { questionIndex: 45, text: 'एलार्म नहीं — अमीबा जैसा चित्र; परजीवी-कोर्स पूरा कराएं और फॉलो-अप शौच जांच कराएं', textEn: 'No alarms — amoebic-like picture; complete the antiparasitic course and do a follow-up stool test' },
    // BOW07 q0 (idx 46)
    { questionIndex: 46, text: 'यात्रा के 1-3 दिन में शुरू — यात्री दस्त आम; ORS + जिंक + आराम; 3-4 दिन में ठीक होना चाहिए — न हो तो शौच जांच', textEn: 'Started 1-3 days into travel — traveler diarrhea is common; ORS + zinc + rest; should settle in 3-4 days — stool test if not' },
    { questionIndex: 46, text: 'आगे केवल सील-बंद पानी और गरम ताज़ा खाना — बाहर का ठंडा खाना, बर्फ, कटे फल बंद; अधिकांश दस्त वायरल होते हैं — खुद एंटीबायोटिक न लें', textEn: 'Henceforth only sealed bottled water and hot fresh food — no outside cold food, ice, cut fruit; most such diarrhea is viral — do NOT self-medicate antibiotics' },
    // BOW07 q1 (idx 47)
    { questionIndex: 47, text: 'साथ यात्री भी बीमार — संक्रमण का स्रोत साझा (पानी/खाना); पानी का स्रोत तुरंत बदलें; घर पर ORS तैयार रखें', textEn: 'Fellow travelers also ill — shared infective source (water/food); change the water source immediately; keep ORS ready at home' },
    { questionIndex: 47, text: 'सिर्फ आपको हुआ — खाने की संवेदनशीलता भी संभव; डायरी भरकर देखें', textEn: 'Only you fell ill — food sensitivity also possible; check by filling the diary' },
    // BOW08 q0 (idx 48)
    { questionIndex: 48, text: 'सुबह उठते ही 2-3 बार शौच और दिनभर ठीक — IBS-D का क्लासिक सुबह-क्लस्टर; नाश्ता हल्का, सुबह की कॉफी बंद', textEn: 'Stool 2-3 times right after waking, fine all day — the classic IBS-D morning cluster; light breakfast, stop morning coffee' },
    { questionIndex: 48, text: 'दिनभर फैला दस्त — IBS से इतर कारण जांचें (शौच जांच / कोलोनोस्कोपी)', textEn: 'Stools spread through the day — look beyond IBS (stool test / colonoscopy)' },
    // BOW08 q1 (idx 49)
    { questionIndex: 49, text: 'खाने के तुरंत बाद शौच की हड़बड़ी — तेज गैस्ट्रो-कोलिक रिफ्लेक्स; धीरे-धीरे खाएं, एकदम गरम-ठंडा भोजन नहीं', textEn: 'Urgent stool right after eating — brisk gastrocolic reflex; eat slowly, avoid very hot or cold food' },
    { questionIndex: 49, text: 'खाने से जुड़ा नहीं — IBS/परजीवी की जांच सोचें (शौच परीक्षा)', textEn: 'Not meal-linked — consider IBS/parasite testing (stool examination)' },
    // BOW08 q2 (idx 50)
    { questionIndex: 50, text: 'परीक्षा/मीटिंग/तनाव के दिन दस्त बढ़ते हैं — गुट-ब्रेन जुड़ाव; नींद पूरी, रोज़ टहलना और श्वास-व्यायाम दवा जैसा असर रखते हैं', textEn: 'Stools increase on exam/meeting/stress days — gut-brain axis; full sleep, daily walking and breathing exercise work like medicine' },
    { questionIndex: 50, text: 'तनाव से जुड़ा नहीं — खाने का ट्रिगर ढूंढें (डायरी)', textEn: 'Not stress-linked — find the food trigger (diary)' },
    // BOW09 q0 (idx 51)
    { questionIndex: 51, text: '3 महीने से ज्यादा का दस्त-कब्ज चक्र — IBS की परिभाषा पूरी; IBS डाइट व लाइफस्टाइल चार्ट (दी गई तालिका) अपनाएं', textEn: 'Diarrhea-constipation cycle beyond 3 months — meets the IBS definition; adopt the IBS diet and lifestyle chart (table given)' },
    { questionIndex: 51, text: 'हाल का पैटर्न (हफ्तों में) — पहले संक्रमण/नई दवा का कारण निकालें', textEn: 'Recent pattern (within weeks) — first rule out infection or a new medicine as the cause' },
    // BOW09 q1 (idx 52)
    { questionIndex: 52, text: 'दर्द शौच से शांत होता है — IBS लक्षण पूर्ण; आश्वस्त रहें — यह जानलेवा नहीं है, प्रबंधन से नियंत्रण में रहता है', textEn: 'Pain settles with stool — complete IBS picture; be reassured — it is not life-threatening and stays controlled with management' },
    { questionIndex: 52, text: 'शौच से कोई फर्क नहीं — अन्य जांच जरूरी (USG/कोलोनोस्कोपी)', textEn: 'No change with stool — other workup needed (USG/colonoscopy)' },
    // BOW09 q2 (idx 53)
    { questionIndex: 53, text: 'दस्त के दिन ब्रिस्टल 6-7, कब्ज के दिन 1-2 — मिश्रित IBS; दोनों पक्षों के लिए खाने के नियम अलग (चार्ट देखें)', textEn: 'Bristol 6-7 on diarrhea days, 1-2 on constipation days — mixed IBS; separate food rules for each phase (see chart)' },
    { questionIndex: 53, text: 'मल लगातार पेन्सिल जैसा पतला — नली में रुकावट की चिंता — कोलोनोस्कोपी जरूरी', textEn: 'Persistently pencil-thin stool — obstruction concern — colonoscopy needed' },
    // BOW10 q0 (idx 54)
    { questionIndex: 54, text: 'बलगम के साथ खून भी — प्रोक्टाइटिस/IBD की जांच जरूरी — रेफर करें (कोलोनोस्कोपी)', textEn: 'Mucus with blood as well — proctitis/IBD workup needed — refer (colonoscopy)' },
    { questionIndex: 54, text: 'सिर्फ बलगम, खून नहीं — IBS आम कारण; राहत की बात है, फिर भी बढ़े तो जांच कराएं', textEn: 'Only mucus, no blood — IBS is the common cause; reassuring, still test if it increases' },
    // BOW10 q1 (idx 55)
    { questionIndex: 55, text: 'बिना दर्द के बलगम — गुदा के पास सूजन (प्रोक्टाइटिस) सोचें; 2 हफ्ते से ज्यादा रहे तो स्कोप की जांच', textEn: 'Mucus without pain — consider inflammation near the rectum (proctitis); scope evaluation if beyond 2 weeks' },
    { questionIndex: 55, text: 'दर्द के साथ बलगम — IBS पैटर्न; प्रबंधन शुरू करें', textEn: 'Mucus with pain — IBS pattern; start management' },
    // BOW11 q0 (idx 56)
    { questionIndex: 56, text: 'शौच के बाद भी अधूरापन — गुदा के पास सूजन या दबाव — प्रोक्टोस्कोपी जांच जरूरी', textEn: 'Feeling of incompleteness even after stool — inflammation or pressure near the rectum — proctoscopy needed' },
    { questionIndex: 56, text: 'बस मन करना (बिना असली अधूरापन) — कब्ज/आदत; शौच-समय का नियम + फाइबर', textEn: 'Just the urge (no true incompleteness) — constipation/habit; toilet-time rule + fiber' },
    // BOW11 q1 (idx 57)
    { questionIndex: 57, text: 'उम्र 50+ / खून / वजन घटना — मलाशय-कोलोन कैंसर स्क्रीन — कोलोनोस्कोपी रेफरल आज ही; तैयारी: उस दिन साफ तरल (पानी/नारियल पानी/सूप-पानी) ही, समाधि-घोल की टाइमिंग पर्चे पर', textEn: 'Age 50+ / blood / weight loss — rectal-colon cancer screen — colonoscopy referral today; prep: only clear liquids that day (water/tender coconut/strained soup), solution timing as per the slip' },
    { questionIndex: 57, text: '50 से कम उम्र, बिना खून-वजन घटना — सामान्य रेक्टल जांच से आगे बढ़ें', textEn: 'Under 50, without blood-weight loss — proceed with routine rectal examination' },
    // BOW12 q0 (idx 58)
    { questionIndex: 58, text: 'नींद से जागकर दस्त — रात का दस्त आर्गेनिक चेतावनी है — IBS नहीं मानें — जांच कराएं (शौच/थायरॉइड/कोलोनोस्कोपी)', textEn: 'Stools waking you from sleep — nocturnal diarrhea is an organic alarm — do NOT call it IBS — workup (stool/thyroid/colonoscopy)' },
    { questionIndex: 58, text: 'रात में कभी नहीं, सिर्फ दिन में — कार्यात्मक संभावना; फिर भी एक बार शौच जांच करा लें', textEn: 'Never at night, only daytime — functional likely; still get one stool test done' },
    // BOW12 q1 (idx 59)
    { questionIndex: 59, text: 'बुखार + वजन घटना + रात का दस्त — IBD/संक्रमण की जांच तुरंत शुरू करें', textEn: 'Fever + weight loss + night stools — start urgent IBD/infection workup' },
    { questionIndex: 59, text: 'इनमें से कुछ नहीं — निगरानी रखें; 2 हफ्ते से ज्यादा रहे तो जांच जरूरी', textEn: 'None of these — observe; workup becomes necessary if it lasts beyond 2 weeks' },
    // LIV01 q0 (idx 60)
    { questionIndex: 60, text: 'पीलिया तेजी से बढ़ रहा है + उल्टी/भूख बंद — रोज़ निगरानी; बिलिरुबिन 5 से ऊपर, भ्रम या नींद बढ़ना — तुरंत अस्पताल', textEn: 'Jaundice rising fast with vomiting/loss of appetite — daily monitoring; bilirubin above 5, confusion or increasing drowsiness — hospital immediately' },
    { questionIndex: 60, text: '2 हफ्ते में घट रहा है — सुधार की दिशा में; वायरल हेपेटाइटिस 4-6 हफ्ते में अपने आप ठीक होता है — सिर्फ सपोर्टिव केयर, कोई स्टेरॉयड नहीं', textEn: 'Settling over 2 weeks — recovering; viral hepatitis resolves by itself in 4-6 weeks — supportive care only, NO steroids' },
    // LIV01 q1 (idx 61)
    { questionIndex: 61, text: 'पेशाब चाय जैसा गहरा — संयुक्त पीलिया — आज ही LFT + हेपेटाइटिस पैनल (A/B/C/E) कराएं', textEn: 'Urine dark like tea — conjugated jaundice — get LFT + hepatitis panel (A/B/C/E) today' },
    { questionIndex: 61, text: 'पेशाब सामान्य रंग — रक्त टूटने (हेमोलिसिस) जैसे कारण सोचें — रकत जांच (CBC)', textEn: 'Urine normal coloured — think of blood-breakdown (hemolysis) type causes — blood test (CBC)' },
    // LIV01 q2 (idx 62)
    { questionIndex: 62, text: 'पीलिया से पहले बुखार-उल्टी-भूख कमी — एंटेरिक (A/E) हेपेटाइटिस का चित्र; सपोर्टिव केयर + पैनल जरूरी', textEn: 'Fever-vomiting-low appetite before the jaundice — enteric (A/E) hepatitis picture; supportive care + panel needed' },
    { questionIndex: 62, text: 'बिना पूर्व-लक्षण अचानक — दवा या पित्त-रुकावट का कारण तलाशें (LFT + USG)', textEn: 'Sudden onset without prodrome — look for a drug or bile-duct obstruction cause (LFT + USG)' },
    // LIV02 q0 (idx 63)
    { questionIndex: 63, text: 'बुखार के बाद पीलिया — हेपेटाइटिस A/E सबसे आम; साफ खाना-पानी + आराम; किसी भी स्थिति में स्टेरॉयड नहीं — यह अपने आप ठीक होता है', textEn: 'Jaundice following fever — hepatitis A/E commonest; clean food-water + rest; steroids in NO situation — it resolves by itself' },
    { questionIndex: 63, text: 'बुखार-पीलिया साथ-साथ बढ़ें — जांच तेज़ करें (लेप्टोस्पायरोसिस/डेंगू/मलेरिया भी देखें)', textEn: 'Fever and jaundice rising together — accelerate workup (check leptospirosis/dengue/malaria too)' },
    // LIV02 q1 (idx 64)
    { questionIndex: 64, text: 'बाहर का खाना-पानी/बर्फ से A/E का खतरा; इंजेक्शन-टैटू-खून से B/C — दोनों पैनल कराएं; परिवार को हेपेटाइटिस A व B का टीका लगवाएं; सुरक्षित संबंध (कंडोम) और सिर्फ जांचा-हुआ सील-पैक खून', textEn: 'Outside food-water/ice risks A/E; injections-tattoo-blood risk B/C — run both panels; vaccinate family against hepatitis A and B; safe relations (condoms) and only tested sealed-pack blood' },
    { questionIndex: 64, text: 'कोई संपर्क-इतिहास नहीं — फिर भी पैनल कराएं; उपचार सपोर्टिव ही रहेगा (आराम-आहार-निगरानी)', textEn: 'No exposure history — still run the panel; treatment remains supportive (rest-diet-monitoring)' },
    // LIV03 q0 (idx 65)
    { questionIndex: 65, text: 'रात की खुजली + गहरा पेशाब + हल्का मल — पित्त जमाव (कोलेस्टैसिस) — LFT आज ही; बिलिरुबिन ऊंचा निकले तो रेफर', textEn: 'Night itching + dark urine + pale stool — bile stasis (cholestasis) — LFT today; refer if bilirubin turns out high' },
    { questionIndex: 65, text: 'पेशाब-मल सामान्य — त्वचा का कारण संभव; गर्म पानी-साबुन कम करें, नमी बनाए रखें', textEn: 'Urine-stool normal — a skin cause is likely; reduce hot water and soap, keep skin moisturized' },
    // LIV03 q1 (idx 66)
    { questionIndex: 66, text: 'नई दवा के बाद खुजली/पीलिया — दवा-जनित लीवर असर — संदिग्ध दवा डॉक्टर से बंद कराएं (खुद नहीं)', textEn: 'Itch/jaundice after a new medicine — drug-induced liver effect — get the suspect drug stopped by the doctor (not on your own)' },
    { questionIndex: 66, text: 'कोई नई दवा नहीं — जांच जारी रखें; रात की खुजली में नाखून छोटे रखें, ढीले सूती कपड़े पहनें', textEn: 'No new medicine — continue workup; keep nails short and wear loose cotton clothes for night itching' },
    // LIV04 q0 (idx 67)
    { questionIndex: 67, text: 'शुगर/मोटापा/थायरॉइड कमी — फैटी लीवर के इंजन; वजन 5-10% घटाना ही असली दवा है — रोज़ 30-40 मिनट तेज टहलना + रिफाइंड खाना/मीठा घटाना', textEn: 'Sugar/obesity/low thyroid — the engines of fatty liver; losing 5-10% weight IS the real medicine — brisk walking 30-40 min daily + cutting refined food and sugar' },
    { questionIndex: 67, text: 'मेटाबॉलिक शिकायत नहीं — शराब व दवा-कारण देखें; फिर भी वजन-टहलना जारी रखें', textEn: 'No metabolic complaint — check alcohol and medicine causes; still continue weight-walking efforts' },
    // LIV4 q1 (idx 68)
    { questionIndex: 68, text: 'फैटी लीवर में शराब पूरी तरह बंद — यही सबसे बड़ा इलाज है; कोई "थोड़ी मात्र सुरक्षित" नहीं होती', textEn: 'With fatty liver, stop alcohol completely — that is the biggest treatment; NO amount counts as safe' },
    { questionIndex: 68, text: 'शराब नहीं पीते — वजन-आहार प्रबंधन जारी रखें; 6 महीने में USG दोहराएं और LFT देखें', textEn: 'No alcohol — continue weight-diet management; repeat USG in 6 months and check LFT' },
    // LIV05 q0 (idx 69)
    { questionIndex: 69, text: 'वायरल लोड/USG साल में एक बार न्यूनतम है; देर से हुए हों — आज ही लिखवाएं', textEn: 'Viral load/USG at least once a year; if overdue — get them ordered today' },
    { questionIndex: 69, text: 'नियमित जांच चल रही है — रिपोर्ट अगली मुलाकात में जरूर लाएं', textEn: 'Monitoring is regular — bring the reports at the next visit' },
    // LIV05 q1 (idx 70)
    { questionIndex: 70, text: 'हेपेटाइटिस B पॉजिटिव — परिवार के सब सदस्यों की जांच (HBsAg) कराएं और नकारात्मक वालों को टीका लगवाएं — यह आज का काम है; नियमित हेपेटोलॉजी फॉलो-अप जारी रखें', textEn: 'Hepatitis B positive — test all family members (HBsAg) and vaccinate the negatives — a task for today; continue regular hepatology follow-up' },
    { questionIndex: 70, text: 'परिवार की स्क्रीनिंग हो चुकी है — बहुत अच्छा; एंटीवायरल दवा (एंटेकाविर/टेनोफोविर) केवल लीवर-विशेषज्ञ ही शुरू-बदल सकते हैं — खुद से कभी नहीं', textEn: 'Family screening done — very good; antiviral medicines (entecavir/tenofovir) are started or changed ONLY by a liver specialist — never on your own' },
    // LIV06 q0 (idx 71)
    { questionIndex: 71, text: 'वजन/पेट की परिधि बढ़ रही है — पेट में पानी (एसाइटिस) की आशंका — अस्पताल भेजें; नमक तुरंत घटाएं — अचार-पापड़-चिप्स-नमकीन पूरी तरह बंद', textEn: 'Rising weight or girth — fluid in the abdomen (ascites) suspected — send to hospital; cut salt immediately — pickle-papad-chips-savouries fully stopped' },
    { questionIndex: 71, text: 'स्थिर है — बहुत अच्छा; कम-नमक आहार जारी रखें; रोज़ सुबह खाली पेट वजन व परिधि नोट करें (सिरोसिस फॉलो-अप कार्ड)', textEn: 'Stable — very good; continue the low-salt diet; note weight and girth every fasting morning (cirrhosis follow-up card)' },
    // LIV06 q1 (idx 72)
    { questionIndex: 72, text: 'पैरों में सूजन / दिन-रात की नींद उलटना / भूलना या अस्पष्ट बातें — लीवर बिगड़ रहा है — उसी दिन अस्पताल', textEn: 'Leg swelling / day-night sleep reversal / forgetfulness or muddled speech — the liver is decompensating — hospital the same day' },
    { questionIndex: 72, text: 'ये लक्षण नहीं — स्थिर चित्र; नींद पूरी करें, प्रोटीन संतुलित रखें (दाल-सब्ज़ी), रिपोर्ट के अनुसार आहार', textEn: 'These symptoms absent — stable picture; get full sleep, keep protein balanced (lentils-vegetables), diet per reports' },
    // LIV06 q2 (idx 73)
    { questionIndex: 73, text: 'काला मल / खून की उल्टी / तेज बुखार — सिरोसिस की जटिलता (वैरिसेस-रक्तस्राव या संक्रमण) — EMERGENCY, बिना देरी', textEn: 'Black stools / blood in vomit / high fever — cirrhosis complication (variceal bleed or infection) — EMERGENCY, no delay' },
    { questionIndex: 73, text: 'इनमें से कुछ नहीं — नियमित फॉलो-अप जारी; एंडोस्कोपी (वैरिसेस की जांच) साल में एक बार', textEn: 'None of these — continue regular follow-up; endoscopy (variceal check) once a year' },
    // ANO01 q0 (idx 74)
    { questionIndex: 74, text: 'शौच के बाद लाल बूंदें/छिड़काव, बिना दर्द — भीतरी बवासीर आम; कब्ज ठीक करना ही बवासीर का इलाज है', textEn: 'Red drops or spray after stool, painless — internal piles is common; fixing constipation IS the treatment of piles' },
    { questionIndex: 74, text: 'गहरा खून मल में मिला हुआ — ऊपरी स्रोत — कोलोनोस्कोपी जरूरी', textEn: 'Dark blood mixed into the stool — upper source — colonoscopy needed' },
    // ANO01 q1 (idx 75)
    { questionIndex: 75, text: 'मांस अंदर चला जाता है (ग्रेड 1-2) — दवा + फाइबर से काबू; बाहर रुकता है (ग्रेड 3) या हाथ से धकेलना पड़ता है (ग्रेड 4) — सर्जरी सलाह लें', textEn: 'Mass goes back inside (grade 1-2) — controlled with medicines + fiber; stays out (grade 3) or needs pushing (grade 4) — take a surgery opinion' },
    { questionIndex: 75, text: 'मांस बाहर नहीं आता, फिर भी खून — प्रोक्टोस्कोपी से पक्का करें', textEn: 'No prolapsing mass despite blood — confirm by proctoscopy' },
    // ANO02 q0 (idx 76)
    { questionIndex: 76, text: 'कटना + घंटों जलता दर्द — फिशर क्लासिक; सिट्ज़ बाथ: गर्म पानी की टब में 10-15 मिनट बैठें, दिन में 2-3 बार — शौच के बाद जरूर', textEn: 'Cutting pain + hours of burning — classic fissure; SITZ BATH: sit in a tub of warm water for 10-15 minutes, 2-3 times daily — always after passing stool' },
    { questionIndex: 76, text: 'दर्द बिना कटने के — अन्य कारण; परीक्षा जरूरी', textEn: 'Pain without a tearing feel — other cause; examination needed' },
    // ANO02 q1 (idx 77)
    { questionIndex: 77, text: 'सख्त मल से फिशर बनी — मल नरम करना इलाज का आधा हिस्सा है; रात को लैक्टुलोज़ + दिन में फाइबर-पानी + जोर बिल्कुल नहीं', textEn: 'Fissure formed from hard stool — softening stool is half the treatment; lactulose at night + fiber-water by day + absolutely no straining' },
    { questionIndex: 77, text: 'मल पहले से नरम था — फिशर ऐसे आसानी से नहीं बनती — दूसरे कारण जांचें (परीक्षा)', textEn: 'Stools were already soft — fissures do not form easily then — look for other causes (examination)' },
    // ANO03 q0 (idx 78)
    { questionIndex: 78, text: 'रात की गुदा खुजली बच्चे में — पिनवर्म आम कारण; पूरे परिवार का डेवॉर्मिंग एक साथ कराएं, नाखून छोटे रखें', textEn: 'Night anal itching in a child — pinworms are a common cause; deworm the whole family together, keep nails short' },
    { questionIndex: 78, text: 'नमी या सफेद स्राव के साथ खुजली — फफूंदी संभव; जगह सूखी रखें, अंडरवियर अलग धोकर गरम सुखाएं', textEn: 'Itching with moisture or white discharge — fungal likely; keep the area dry, wash underwear separately and sun-dry hot' },
    // ANO03 q1 (idx 79)
    { questionIndex: 79, text: 'तला-मसालेदार खाना या मलहम-साबुन से खुजली बढ़ती है — उत्तेजक हटाएं; गुदा को साबुन से न रगड़ें — साफ बहते पानी से धोएं, हल्का सुखाएं', textEn: 'Itch worsened by spicy food or ointment-soap — remove the irritants; do NOT scrub the anus with soap — rinse with plain running water and pat dry' },
    { questionIndex: 79, text: 'उत्तेजक नहीं मिले — 2 हफ्ते से ज्यादा रहे तो मल-परीक्षा कराएं', textEn: 'No irritants identified — if it lasts beyond 2 weeks, get a stool examination' },
    // ANO04 q0 (idx 80)
    { questionIndex: 80, text: 'शौच के बाद बाहर की सूजन, रात भर में घट जाती — बाहरी बवासीर/स्किन-टैग; जोर-कब्ज बंद करें, सिट्ज़ बाथ राहत देता है', textEn: 'External swelling after stool settling overnight — external pile/skin tag; stop straining-constipation, sitz bath relieves it' },
    { questionIndex: 80, text: 'सूजन नहीं घटती और दर्द बढ़ता है — परीक्षा जरूरी; बढ़ती गांठ को नज़रअंदाज़ न करें', textEn: 'Swelling not settling and pain rising — examination needed; do not ignore a growing lump' },
    // ANO04 q1 (idx 81)
    { questionIndex: 81, text: 'अचानक तेज दर्द + सख्त नीली-काली गांठ — थ्रॉम्बोज़्ड बवासीर — 48-72 घंटे के भीतर देखना सबसे अच्छा — उसी दिन आएं', textEn: 'Sudden severe pain + hard bluish-black lump — thrombosed pile — best seen within 48-72 hours — come the same day' },
    { questionIndex: 81, text: 'कोई सख्त गांठ नहीं — सामान्य सूजन; सिट्ज़ बाथ + फाइबर + शांत रहें', textEn: 'No hard lump — simple swelling; sitz bath + fiber + stay calm' },
    // OTH01 q0 (idx 82)
    { questionIndex: 82, text: '2 हफ्ते से ज्यादा की कम भूख + वजन घटना — CBC, LFT, USG पेट व थायरॉइड आज लिखवाएं; कारण मिलना ही असली इलाज है', textEn: 'Low appetite beyond 2 weeks + weight loss — CBC, LFT, abdominal USG and thyroid ordered today; finding the cause IS the real treatment' },
    { questionIndex: 82, text: 'हाल की बीमारी/गर्मी के बाद कम भूख — सामान्य; छोटे-छोटे ज़ायकेदार भोजन, ताज़ा खाना दिन में कई बार', textEn: 'Appetite low after a recent illness or heat — normal; small tasty fresh meals several times a day' },
    // OTH01 q1 (idx 83)
    { questionIndex: 83, text: 'थोड़ा खाने पर दाएं ऊपरी पेट में भारीपन/दर्द — लीवर बढ़ने की जांच (USG + LFT) कराएं', textEn: 'Right-upper heaviness or pain after small meals — liver enlargement workup (USG + LFT)' },
    { questionIndex: 83, text: 'भारीपन नहीं — गैस/एसिडिटी से भूख कम; पाचन-इलाज आज़माकर देखें', textEn: 'No heaviness — appetite low from gas/acidity; trial of digestion treatment' },
    // OTH02 q0 (idx 84)
    { questionIndex: 84, text: 'कॉफी-मिट्टी जैसी या लाल उल्टी — खून की उल्टी — तुरंत EMERGENCY; मुंह में कुछ नहीं, घबराएं नहीं', textEn: 'Coffee-ground or red vomit — vomiting blood — EMERGENCY now; nothing by mouth, do not panic' },
    { questionIndex: 84, text: 'सादी उल्टी (खाना/पीला पानी) — फौरन खतरा नहीं; छोटे-छोटे घूंट ORS/पानी; 6 से ज्यादा उल्टियां या देर तक चले तो फौरन आएं', textEn: 'Plain vomit (food/yellow water) — no immediate danger; small sips of ORS/water; come promptly if 6+ vomits or it persists' },
    // OTH02 q1 (idx 85)
    { questionIndex: 85, text: 'गर्भवती में मतली-उल्टी और उसकी दवा — केवल OBG डॉक्टर की सलाह से; ऑफ्लोक्सासिन/सिप्रोफ्लॉक्सासिन जैसी दवाएं गर्भावस्था में पूर्ण वर्जित हैं', textEn: 'Nausea-vomiting and its medicines in pregnancy — ONLY on OBG advice; ofloxacin/ciprofloxacin-type medicines are absolutely contraindicated in pregnancy' },
    { questionIndex: 85, text: 'गर्भ नहीं है — सामान्य उल्टी-प्रबंधन चलेगा; तीखी गंध-धुआं से दूर रहें, हल्का ठंडा खाना, आराम', textEn: 'Not pregnant — standard vomiting management; stay away from strong smells and smoke, light cool food, rest' },
    // OTH03 q0 (idx 86)
    { questionIndex: 86, text: 'मल में लंबे गोल कीड़े — एस्कैरिस; अल्बेंडाज़ोल की 1 गोली चबाकर — परिवार के सब लें; 2 हफ्ते बाद दोहराना अक्सर जरूरी', textEn: 'Long round worms in stool — ascaris; 1 albendazole tablet chewed — the whole family takes it; repeating after 2 weeks is often needed' },
    { questionIndex: 86, text: 'रात की गुदा खुजली छोटे बच्चे को — पिनवर्म; नाखून छोटे, सोने से पहले हाथ धोना, परिवार सबका डेवॉर्मिंग', textEn: 'Night anal itching in a small child — pinworms; short nails, handwashing before bed, deworming for the whole family' },
    // OTH03 q1 (idx 87)
    { questionIndex: 87, text: '6 महीने से ज्यादा हो गए — बच्चों को हर 6 महीने में डेवॉर्मिंग गोली चाहिए (वयस्क साल में 1 बार); आज ही ले लें', textEn: 'Over 6 months since the last one — children need a deworming tablet every 6 months (adults once a year); take it today' },
    { questionIndex: 87, text: 'हाल में ले ली है — अभी दोबारा नहीं; अगली खुराक 6 महीने बाद', textEn: 'Taken recently — not again now; next dose after 6 months' },
    // OTH04 q0 (idx 88)
    { questionIndex: 88, text: 'कोई छाला 2 हफ्ते से ज्यादा से नहीं भर रहा — बायोप्सी के लिए रेफरल जरूरी', textEn: 'Any ulcer not healing beyond 2 weeks — referral for biopsy is necessary' },
    { questionIndex: 88, text: 'साल में 3-4 बार छाले, 7-10 दिन में भर जाते हैं — साधारण एफ्थस; तनाव-नींद-पानी देखें, B-कॉम्प्लेक्स मदद करता है', textEn: 'Ulcers 3-4 times a year healing in 7-10 days — ordinary aphthae; check stress-sleep-water, B-complex helps' },
    // OTH04 q1 (idx 89)
    { questionIndex: 89, text: 'बार-बार छाले + दस्त/वजन घटना — सीलिएक (ग्लूटेन) व IBD की जांच — रेफर करें; खून की जांच से पहले गेहूं-जौ बंद न करें', textEn: 'Recurrent ulcers + diarrhea/weight loss — celiac (gluten) and IBD workup — refer; do NOT stop wheat-barley before the blood test' },
    { questionIndex: 89, text: 'दस्त-वजन घटना नहीं — सामान्य प्रबंधन; ज़ायकेदार भोजन व B-कॉम्प्लेक्स चलेगा', textEn: 'No diarrhea-weight loss — standard management; tasty food and B-complex will do' },
    // OTH05 q0 (idx 90)
    { questionIndex: 90, text: 'ठोस अटकता है, पतला नहीं — निगलने की जांच (एंडोस्कोपी) सबसे पहले — दवा बाद में; इलाज से पहले कारण पक्का करना जरूरी है', textEn: 'Solids stick, liquids do not — swallowing evaluation (endoscopy) FIRST — medicines later; the cause must be confirmed before treatment' },
    { questionIndex: 90, text: 'पतला भी अटकने लगा — रुकावट बढ़ रही है — तुरंत रेफर; खाने में देर न हो', textEn: 'Liquids have started sticking too — obstruction is progressing — refer urgently; do not delay evaluation' },
    // OTH05 q1 (idx 91)
    { questionIndex: 91, text: 'गले के स्तर की अटकन — गले की जांच (ENT/एंडोस्कोपी); सीने के स्तर की अटकन — एंडोस्कोपी उसी हफ्ते में', textEn: 'Throat-level sticking — throat evaluation (ENT/endoscopy); chest-level sticking — endoscopy within the same week' },
    { questionIndex: 91, text: 'अटकन की जगह बदलती रहती है — ग्लोबस/तनाव संभव; फिर भी एक बार स्कोप कराकर मन शांत करें', textEn: 'The sticking spot keeps changing — globus/stress possible; still get one scope done for peace of mind' },
    // OTH05 q2 (idx 92)
    { questionIndex: 92, text: 'उम्र 50+ + वजन घटना + ठोस अटकन — इसोफेगल कैंसर निकालना जरूरी — एंडोस्कोपी आज-कल में; तैयारी कार्ड (तालिका) पढ़ें — 6 घंटे खाली पेट, साथ एक वयस्क जरूरी', textEn: 'Age 50+ + weight loss + solid-food sticking — esophageal cancer must be excluded — endoscopy within a day; read the prep card (table) — 6 hours fasting, an accompanying adult mandatory' },
    { questionIndex: 92, text: 'जवान उम्र, बिना वजन घटना — अक्सर साधारण कारण; फिर भी एक बार एंडोस्कोपी निर्णायक है', textEn: 'Young age, no weight loss — usually a benign cause; still, one endoscopy settles it' },
    // OTH06 q0 (idx 93)
    { questionIndex: 93, text: '6 महीने में 5% से ज्यादा वजन घटा — गहन जांच (CBC, LFT, थायरॉइड, USG पेट, छाती का एक्स-रे); खाना बढ़ाने से पहले कारण निकालें', textEn: 'Over 5% weight loss in 6 months — intensive workup (CBC, LFT, thyroid, abdominal USG, chest X-ray); find the cause before increasing food' },
    { questionIndex: 93, text: 'इरादतन डाइटिंग से घटा — संतुलित आहार शुरू करें; हर 2 हफ्ते तौलें', textEn: 'Loss from intentional dieting — start a balanced diet; weigh every 2 weeks' },
    // OTH06 q1 (idx 94)
    { questionIndex: 94, text: 'भूख-खाना सामान्य रहकर भी वजन गिर रहा है — शरीर झुलस रहा है — गहन जांच टालें नहीं', textEn: 'Weight falling despite normal appetite and intake — the body is burning itself — do not delay intensive workup' },
    { questionIndex: 94, text: 'कम खाने से घटा — भूख जोड़ने का इलाज; हर 2 हफ्ते वजन नोट करें', textEn: 'Loss from eating less — treatment to build appetite; note weight every 2 weeks' },
    // OTH06 q2 (idx 95)
    { questionIndex: 95, text: 'रात के पसीने + बुखार + वजन घटना — टीबी/लिंफोमा की जांच जरूरी — रेफर करें', textEn: 'Night sweats + fever + weight loss — TB/lymphoma workup essential — refer' },
    { questionIndex: 95, text: 'ये लक्षण नहीं — पाचन-कारणों पर ध्यान दें; 4 हफ्ते में फिर तौलें', textEn: 'These symptoms absent — focus on digestive causes; re-weigh in 4 weeks' },
    // OTH07 q0 (idx 96)
    { questionIndex: 96, text: 'खून की उल्टी — तुरंत EMERGENCY: निकटतम अस्पताल/108 एंबुलेंस; मुंह में कुछ न दें, घबराएं नहीं, थूक रोकें नहीं', textEn: 'Vomiting blood — EMERGENCY now: nearest hospital or 108 ambulance; nothing by mouth, stay calm, do not hold back spit' },
    { questionIndex: 96, text: 'धारियां/कॉफी-दाने जैसा — पुराना रक्त — उसी दिन अस्पताल, देर नहीं', textEn: 'Streaks or coffee-ground appearance — old blood — same-day hospital, no delay' },
    // OTH07 q1 (idx 97)
    { questionIndex: 97, text: 'दर्द की गोलियां (एस्पिरिन/ब्रुफेन जैसी) या शराब — अल्सर-रक्तस्राव के आम कारण — दोनों तुरंत बंद; आगे पेट के दर्द में केवल पैरासिटामोल', textEn: 'Pain pills (aspirin/ibuprofen type) or alcohol — common ulcer-bleed causes — stop both immediately; for future gastric pain, paracetamol ONLY' },
    { questionIndex: 97, text: 'दोनों नहीं — लीवर की नसें (वैरिसेस) सोचें — अस्पताल में एंडोस्कोपी ही रास्ता', textEn: 'Neither — think liver veins (varices) — endoscopy in hospital is the route' },
    // OTH08 q0 (idx 98)
    { questionIndex: 98, text: 'काला-चिपचिपा-बदबूदार मल — पेट से खून (मेलेना) — तुरंत EMERGENCY; खाना-दवा बंद कर अस्पताल अभी जाएं', textEn: 'Black, tarry, foul-smelling stool — bleeding from the gut (melena) — EMERGENCY now; stop food-medicines and go to hospital immediately' },
    { questionIndex: 98, text: 'काला लेकिन बिना बदबू का — आयरन की गोली/चारकोल भी मल काला करते हैं — चल रही दवा डॉक्टर को बताएं', textEn: 'Black but odourless — iron tablets or charcoal also blacken stool — tell the doctor about current medicines' },
    // OTH08 q1 (idx 99)
    { questionIndex: 99, text: 'चक्कर/पीलापन/कमजोरी के साथ काला मल — खून की कमी तेजी से गिर रही है — रक्त जांच + अस्पताल उसी दिन', textEn: 'Giddiness/pallor/weakness with black stools — blood counts falling fast — blood test + hospital the same day' },
    { questionIndex: 99, text: 'कमजोरी नहीं — फिर भी जांच कराएं; बवासीर का धीमा खून भी खून की कमी बनाता है', textEn: 'No weakness — still get tested; slow bleeding from piles also causes anemia' },
  ],

  // ══ Labels — vitals + GI exam (12) ════════════════════════════════════
  labels: [
    { label: 'दर्द स्कोर', labelEn: 'Pain Score (NRS)', unit: '/10' },
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'पेट परिधि (नाभि पर)', labelEn: 'Abdominal Girth (at navel)', unit: 'cm' },
    { label: 'पीलिया ग्रेड (icterus)', labelEn: 'Jaundice Grade (Icterus)', unit: '', showUnit: false },
    { label: 'दस्त प्रति दिन', labelEn: 'Stool Frequency /day', unit: '/day' },
    { label: 'उल्टी प्रति दिन', labelEn: 'Vomiting Episodes /24h', unit: '/24h' },
    { label: 'भोजन स्तर', labelEn: 'Oral Intake Grade', unit: '', showUnit: false },
    { label: 'पेट में कोमलता', labelEn: 'Abdominal Tenderness', unit: 'Y/N' },
    { label: 'लीवर स्पैन', labelEn: 'Liver Span', unit: 'cm' },
    { label: 'पेट में मुक्त तरल (ascites)', labelEn: 'Free Fluid (Ascites)', unit: 'Y/N' },
  ],

  // ══ Findings (35: 23 prescribable + 12 refer-only) ═════════════════════
  // REFER-ONLY findings (ZERO medicine links, deliberate): GI-BLEED-ER,
  // DYSPHAGIA-SUSPECT, OBSTRUCTIVE-JAUNDICE-SUSPECT, PERFORATION-SUSPECT,
  // DECOMPENSATED-CIRRHOSIS, SEVERE-ACUTE-PANCREATITIS, APPENDICITIS-SUSPECT,
  // TOXIC-MEGACOLON, CELIAC-SUSPECT, IBD-SUSPECT, GALLSTONE-COMPLICATED,
  // RECTAL-BLEED-MASS — screen/refer/ER pathways, never medicine-only.
  // GI-HEALTH-SCREEN also carries zero links (annual check-up — advice only).
  // IBS coded K58.x (K59.1 in the brief is functional diarrhea; kept
  // medically correct — flagged for MBBS reviewer).
  findings: [
    { key: 'GERD', name: 'रिफ्लक्स रोग (GERD)', nameEn: 'Gastroesophageal Reflux Disease (GERD)', icd10: 'K21.9' },
    { key: 'GASTRITIS-ACUTE', name: 'तीव्र गैस्ट्राइटिस', nameEn: 'Acute Gastritis', icd10: 'K29.0' },
    { key: 'FUNCTIONAL-DYSPEPSIA', name: 'कार्यात्मक अपच', nameEn: 'Functional Dyspepsia', icd10: 'K30' },
    { key: 'IBS-D', name: 'IBS — दस्त प्रकार', nameEn: 'Irritable Bowel Syndrome — Diarrhea-predominant (IBS-D)', icd10: 'K58.1' },
    { key: 'IBS-C', name: 'IBS — कब्ज प्रकार', nameEn: 'Irritable Bowel Syndrome — Constipation-predominant (IBS-C)', icd10: 'K58.0' },
    { key: 'IBS-M', name: 'IBS — मिश्रित प्रकार', nameEn: 'Irritable Bowel Syndrome — Mixed (IBS-M)', icd10: 'K58.2' },
    { key: 'ACUTE-GE', name: 'तीव्र अपच — संक्रामक दस्त', nameEn: 'Acute Infective Gastroenteritis', icd10: 'A09' },
    { key: 'AMOEBIC-COLITIS', name: 'अमीबिक कोलाइटिस / अमीबा संक्रमण', nameEn: 'Amoebic Colitis / Amoebiasis', icd10: 'A06.9' },
    { key: 'MILD-COLITIS', name: 'हल्का कोलाइटिस (गैर-संक्रामक)', nameEn: 'Mild Non-infective Colitis', icd10: 'K52.9' },
    { key: 'GALLSTONE-COLIC', name: 'पित्त पथरी — बिना जटिलता (बिलियरी कोलिक)', nameEn: 'Uncomplicated Gallstone (Biliary Colic)', icd10: 'K80.2' },
    { key: 'CHRONIC-CONSTIPATION', name: 'पुरानी कब्ज', nameEn: 'Chronic Functional Constipation', icd10: 'K59.0' },
    { key: 'HEMORRHOIDS', name: 'बवासीर (हेमोराइड्स)', nameEn: 'Hemorrhoids (Piles)', icd10: 'K64.9' },
    { key: 'ANAL-FISSURE', name: 'गुदा फिशर', nameEn: 'Anal Fissure', icd10: 'K60.2' },
    { key: 'PRURITUS-ANI', name: 'गुदा की खुजली (प्रुरिटस आनी)', nameEn: 'Pruritus Ani (Anal Itching)', icd10: 'L29.0' },
    { key: 'FATTY-LIVER', name: 'फैटी लीवर (NAFLD)', nameEn: 'Fatty Liver (NAFLD)', icd10: 'K76.0' },
    { key: 'HEPATITIS-A', name: 'तीव्र वायरल हेपेटाइटिस A', nameEn: 'Acute Viral Hepatitis A', icd10: 'B15' },
    { key: 'HEPATITIS-E', name: 'तीव्र वायरल हेपेटाइटिस E', nameEn: 'Acute Viral Hepatitis E', icd10: 'B17.2' },
    { key: 'HEPATITIS-B-CHRONIC', name: 'पुराना हेपेटाइटिस B — कैरियर फॉलो-अप', nameEn: 'Chronic Hepatitis B — Carrier Follow-up', icd10: 'B18.1' },
    { key: 'CIRRHOSIS-STABLE', name: 'सिरोसिस — स्थिर (फॉलो-अप)', nameEn: 'Cirrhosis — Compensated, Stable (Follow-up)', icd10: 'K74.6' },
    { key: 'INTESTINAL-WORMS', name: 'आंतों के कीड़े (एस्कैरियासिस)', nameEn: 'Intestinal Worm Infestation (Ascariasis)', icd10: 'B77' },
    { key: 'NAUSEA-VOMITING', name: 'मतली व उल्टी (लक्षण-जनित)', nameEn: 'Nausea & Vomiting (Symptomatic)', icd10: 'R11.2' },
    { key: 'BLOATING-GAS', name: 'गैस व पेट फूलना', nameEn: 'Bloating & Flatulence', icd10: 'R14' },
    { key: 'RECURRENT-ORAL-ULCERS', name: 'बार-बार मुंह के छाले (पाचन-जुड़ा स्क्रीन)', nameEn: 'Recurrent Oral Ulcers (GI-linked Screen)', icd10: 'K12.0' },
    { key: 'GI-HEALTH-SCREEN', name: 'GI स्वास्थ्य जांच (वार्षिक स्क्रीन)', nameEn: 'GI Health Screening (Annual)', icd10: 'Z00.0' },
    // ── REFER-ONLY (zero medicine links) ──
    { key: 'GI-BLEED-ER', name: 'पेट से रक्तस्राव — हेमेटेमेसिस/मेलेना (EMERGENCY)', nameEn: 'GI Bleed — Hematemesis/Melena (ER)', icd10: 'K92.2' },
    { key: 'DYSPHAGIA-SUSPECT', name: 'निगलने में दिक्कत — संदेह (एंडोस्कोपी रेफर)', nameEn: 'Dysphagia — Suspect (Endoscopy Refer)', icd10: 'K22.2' },
    { key: 'OBSTRUCTIVE-JAUNDICE-SUSPECT', name: 'रुकावट वाला पीलिया — संदेह (पथरी/गांठ रेफर)', nameEn: 'Obstructive Jaundice — Suspect (Stone/Malignancy Refer)', icd10: 'K83.1' },
    { key: 'PERFORATION-SUSPECT', name: 'पेट की परत में छेद की आशंका — तीव्र पेट (सर्जरी)', nameEn: 'Perforation Suspect — Acute Abdomen (Surgery)', icd10: 'K65.0' },
    { key: 'DECOMPENSATED-CIRRHOSIS', name: 'बिगड़ा हुआ सिरोसिस — एसाइटिस/भ्रम (अस्पताल)', nameEn: 'Decompensated Cirrhosis — Ascites/Encephalopathy (Hospital)', icd10: 'K72.9' },
    { key: 'SEVERE-ACUTE-PANCREATITIS', name: 'तीव्र अग्नाशयशोथ — संदेह (ER)', nameEn: 'Severe Acute Pancreatitis — Suspect (ER)', icd10: 'K85.9' },
    { key: 'APPENDICITIS-SUSPECT', name: 'अपेंडिसिटिस — संदेह (सर्जिकल ER)', nameEn: 'Appendicitis — Suspect (Surgical ER)', icd10: 'K35' },
    { key: 'TOXIC-MEGACOLON', name: 'टॉक्सिक मेगाकोलोन (EMERGENCY)', nameEn: 'Toxic Megacolon (Emergency)', icd10: 'K59.3' },
    { key: 'CELIAC-SUSPECT', name: 'सीलिएक रोग — संदेह (सेरोलॉजी रेफर)', nameEn: 'Celiac Disease — Suspect (Refer for Serology)', icd10: 'K90.0' },
    { key: 'IBD-SUSPECT', name: 'IBD — क्रोन/UC संदेह (कोलोनोस्कोपी रेफर)', nameEn: 'IBD Suspect — Crohn/UC (Refer for Colonoscopy)', icd10: 'K51.9' },
    { key: 'GALLSTONE-COMPLICATED', name: 'जटिल पित्त पथरी — पित्ताशय सूजन (सर्जरी रेफर)', nameEn: 'Complicated Gallstone — Cholecystitis (Surgery Refer)', icd10: 'K81.0' },
    { key: 'RECTAL-BLEED-MASS', name: 'मलाशय रक्तस्राव/गांठ — कैंसर स्क्रीन (रेफर)', nameEn: 'Rectal Bleed/Mass — Malignancy Screen (Refer)', icd10: 'K62.5' },
  ],

  // ══ Medicines (61) — India gastro OPD core ════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense qty.
  // flags: pregnancy/pediatric/schedule; verified=false until MBBS review.
  medicines: [
    // ── PPIs (⚠ duration cap 4-8 weeks in every salt) ──
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg — ⚠ 4-8 हफ्ते पर समीक्षा अनिवार्य; बिना दस्तावेज़ित ज़रूरत जीवन-भर PPI नहीं (लंबे कोर्स में हड्डी, B12 व मैग्नीशियम देखें)', doseOptions: ['1 गोली नाश्ते से 30 मिनट पहले', '1 गोली सुबह व रात (तीव्र में)'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pan 20 Tablet', salt: 'Pantoprazole 20 mg — कम-खुराक रखरखाव व धीरे-धीरे बंद करने के लिए; 4-8 हफ्ते समीक्षा', doseOptions: ['1 गोली नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pan-D Capsule', salt: 'Pantoprazole 40 mg + Domperidone 30 mg (SR) — एसिडिटी + जी मिचलाना/भारीपन; नाश्ते से पहले; 4-8 हफ्ते समीक्षा', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg — रिफ्लक्स/एसिडिटी; 4-8 हफ्ते समीक्षा', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omez-D Capsule', salt: 'Omeprazole 20 mg + Domperidone 30 mg (SR) — एसिडिटी मतली सहित; 4-8 हफ्ते समीक्षा', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Razo 20 Tablet', salt: 'Rabeprazole 20 mg — तेज एसिडिटी/अल्सर-कोर्स; 4-8 हफ्ते समीक्षा', doseOptions: ['1 गोली नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Razo-D Capsule', salt: 'Rabeprazole 20 mg + Domperidone 30 mg (SR) — एसिडिटी + पेट खाली देर से होना; 4-8 हफ्ते समीक्षा', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Nexpro RD 40 Capsule', salt: 'Esomeprazole 40 mg + Domperidone 30 mg (SR) — गंभीर रिफ्लक्स; 4-8 हफ्ते समीक्षा', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Panticid-DSR Tablet', salt: 'Pantoprazole 40 mg + Domperidone 30 mg (SR) — Pan-D का विकल्प ब्रांड; 4-8 हफ्ते समीक्षा', doseOptions: ['1 गोली नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sompraz 40 Tablet', salt: 'Esomeprazole 40 mg — तीव्र रिफ्लक्स/अल्सर; 4-8 हफ्ते समीक्षा', doseOptions: ['1 गोली नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── H2 blockers ──
    { name: 'Rantac 150 Tablet', salt: 'Ranitidine 150 mg — रात की एसिडिटी में रात की खुराक विकल्प; उपलब्धता आगो-पीछो हो तो PPI चुनें; लंबा कोर्स डॉक्टर से', doseOptions: ['1 गोली रात को सोते समय', '1 गोली सुबह व रात'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Aciloc 300 Tablet', salt: 'Ranitidine 300 mg — रात की जलन में दिन में एक बार; लंबा कोर्स डॉक्टर से', doseOptions: ['1 गोली रात को सोते समय'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Antacids / digestive enzymes ──
    { name: 'Digene Gel 200ml', salt: 'Magaldrate + Simethicone जैल — तुरंत जलन-राहत; खाने के 1 घंटे बाद व सोते समय; PPI से 1-2 घंटे का अंतर रखें', doseOptions: ['10 ml खाने के 1 घंटे बाद / सोते समय', '15 ml'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene SFT 200ml', salt: 'मध्यम-मीठा एंटासिड सस्पेंशन (Digene श्रेणी) — तुरंत राहत का SFT रूप; खाने के बाद', doseOptions: ['10 ml खाने के बाद व सोते समय'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Gelusil MPS Liquid 200ml', salt: 'Aluminium-Magnesium hydroxide + Simethicone — जलन + गैस दोनों में तुरंत राहत; खाने के बाद/सोते समय', doseOptions: ['10 ml खाने के बाद व सोते समय', '15 ml तीव्र जलन में'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Aristozyme Liquid 200ml', salt: 'Diastase + Pepsin पाचक-एंजाइम सिरप — भारीपन/अपच; खाने के बाद', doseOptions: ['2 चम्मच (10 ml) खाने के बाद', '1 चम्मच (5 ml) बच्चों में'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Unienzyme Tablet', salt: 'पाचक एंजाइम (Diastase + Pepsin) + Activated Charcoal — गैस-फूलने में खाने के बाद; मल काला हो सकता है (चारकोल से)', doseOptions: ['1 गोली खाने के बाद दिन में 2-3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Sucrafil Suspension 200ml', salt: 'Sucralfate 1 g/10 ml — जख्म-ढकने वाला; खाली पेट / भोजन से 1 घंटा पहले; अन्य दवा से 2 घंटे का अंतर', doseOptions: ['10 ml भोजन से 1 घंटा पहले दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Prokinetic / antiemetic ──
    { name: 'Domstal 10 Tablet', salt: 'Domperidone 10 mg — मतली/भारीपन; खाने से 15-30 मिनट पहले; दिल की लंबी खुराक डॉक्टर से', doseOptions: ['1 गोली खाने से पहले दिन में 3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg मुंह-घुलने वाली — तीव्र मतली-उल्टी; छोटा कोर्स (1-3 दिन); कब्ज हो सकता है', doseOptions: ['1 गोली जीभ पर दिन में 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Antispasmodics ──
    { name: 'Cyclopam Tablet', salt: 'Dicyclomine 20 mg + Paracetamol 325 mg — पेट की मरोड़/ऐंठन; मोतियाबिंद (glaucoma) व बढ़े प्रोस्टेट में सावधानी', doseOptions: ['1 गोली दर्द पर SOS (दिन में अधिकतम 3)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg — पित्त/आंत की मरोड़ का स्पाज्म-तोड़; तीव्र पेट दर्द में पहले जांच जरूरी (दर्द छिपाना खतरनाक)', doseOptions: ['1 गोली दिन में 2-3 बार', '1 गोली दर्द पर SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── IBS-specific ──
    { name: 'Rifagut 550 Tablet', salt: 'Rifaximin 550 mg — IBS-D में आंत-सीमित एंटीबायोटिक (रक्त में नहीं जाती); 14 दिन का कोर्स', doseOptions: ['1 गोली दिन में 2 बार × 14 दिन'], morning: 1, afternoon: 0, evening: 1, tab: 28, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Rifagut 400 Tablet', salt: 'Rifaximin 400 mg — मिश्रित IBS/पुराने फूलने में; 14 दिन का कोर्स', doseOptions: ['1 गोली दिन में 2-3 बार × 14 दिन'], morning: 1, afternoon: 0, evening: 1, tab: 28, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Normaxin Tablet', salt: 'Clidinium 2.5 mg + Chlordiazepoxide 5 mg + Dicyclomine 10 mg — IBS त्रिक-कॉम्बो; ⚠ नींद ला सकती है — गाड़ी नहीं, शराब वर्जित; 2-4 हफ्ते से लंबा कोर्स नहीं (आदत का जोखिम) — कम्पोज़िशन समीक्षा लंबित', doseOptions: ['1 गोली खाने से पहले दिन में 2-3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 45, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Colospa Retard Capsule', salt: 'Mebeverine 200 mg (SR) — IBS स्पाज्म; नॉन-सेडेटिंग; खाने से 20 मिनट पहले', doseOptions: ['1 कैप्सूल दिन में 2 बार खाने से पहले'], morning: 1, afternoon: 0, evening: 1, tab: 56, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Meva-C Capsule', salt: 'Mebeverine + Chlordiazepoxide — IBS में दर्द + बेचैनी शांत करने वाला कॉम्बो; ⚠ नींद/आदत की सावधानी — लघु कोर्स; कम्पोज़िशन समीक्षा लंबित', doseOptions: ['1 कैप्सूल दिन में 2 बार खाने से पहले'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ibset Tablet', salt: 'IBS-D विशिष्ट 5-HT3 विरोधी (रमोसेट्रॉन वर्ग) — ⚠ ब्रांड-कम्पोज़िशन/खुराक सत्यापन लंबित (MBBS समीक्षा आवश्यक); कब्ज हो जाए तो तुरंत बंद करें', doseOptions: ['1 गोली रोज़ाना सुबह'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Probiotics ──
    { name: 'VSL#3 Capsule', salt: '8-स्ट्रेन उच्च-शक्ति प्रोबायोटिक (लैक्टोबैसिलस/बिफिडो/स्ट्रेप्टो) — कोलाइटिस व IBS में; ठंडी जगह रखें; एंटीबायोटिक से 2 घंटे अंतर', doseOptions: ['1 कैप्सूल दिन में 1-2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Econorm Sachet', salt: 'Saccharomyces boulardii 250 mg — दस्त के शुरुआती दिनों का प्रोबायोटिक; एंटीबायोटिक के साथ भी चलता है', doseOptions: ['1 सैशेट दिन में 1-2 बार पानी से'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Sporlac Tablet', salt: 'Lactobacillus sporogenes (Bacillus coagulans) — दस्त व एंटीबायोटिक-बाद आंत-बहाली; दही-छाछ के साथ अच्छा', doseOptions: ['1 गोली दिन में 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Enterogermina Oral Suspension', salt: 'Bacillus clausii 2 अरब बीजाणु/5 ml — दस्त में प्रोबायोटिक; शीशी अच्छी तरह हिलाकर', doseOptions: ['1 शीशी (5 ml) दिन में 1-2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 12, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Laxatives / fiber ──
    { name: 'Cremaffin Syrup 200ml', salt: 'Milk of Magnesia + Liquid Paraffin — रात की खुराक; ⚠ रोज़ लंबे समय की आदत नहीं (आंत की क्रिया कमजोर होती है)', doseOptions: ['15 ml रात को सोते समय', '10 ml रात को (हल्की कब्ज)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cremaffin Plus Tablet', salt: 'Milk of Magnesia + Liquid Paraffin + Sodium Picosulfate — तेज कब्ज के लिए; केवल कभी-कभी (SOS), रोज़ नहीं', doseOptions: ['1-2 गोली रात को SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml — कोमल जुलाब; फिशर/बवासीर/लीवर में पसंदीदा; शुरुआती 2-3 दिन गैस आम; खुराक जरूरत से घटाएं-बढ़ाएं', doseOptions: ['15 ml रात को सोते समय', '30 ml रात को (तीव्र कब्ज)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Looz Syrup 300ml', salt: 'Lactulose — Duphalac का आर्थिक विकल्प; फिशर-बवासीर में रोज़ चल सकता है', doseOptions: ['15 ml रात को सोते समय'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Softovac Granules 100g', salt: 'सोनामुखी (senna) + इसबगोल आधारित हर्बल फाइबर-जुलाब — रात को चम्मच भर पानी से; रोज़ लंबे समय तक नहीं', doseOptions: ['1-2 चम्मच रात को पानी/दूध से'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Naturolax Powder 100g', salt: 'इसबगोल (psyllium husk) — प्राकृतिक फाइबर; घोल बनाकर तुरंत पिएं (रखा तो जम जाता है); शुरुआत में गैस आम; साथ खूब पानी', doseOptions: ['1-2 चम्मच रात को 1 गिलास पानी में'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Antidiarrheal / antiinfective (⚠ alcohol rule on all -azoles) ──
    { name: 'Metrogyl 200 Tablet', salt: 'Metronidazole 200 mg — अमीबा/जियार्डिया; ⚠ कोर्स के दौरान व 48 घंटे बाद तक शराब/मदिरा-युक्त सिरप पूर्ण वर्जित (नकसीर-उल्टी-धड़कन)', doseOptions: ['1 गोली दिन में 3 बार × 5-7 दिन'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metrogyl 400 Tablet', salt: 'Metronidazole 400 mg — डिसेंट्री/अमीबिक कोलाइटिस; ⚠ शराब + 48 घंटे वर्जित — नियम सख्त', doseOptions: ['1 गोली दिन में 3 बार × 5-7 दिन'], morning: 1, afternoon: 1, evening: 1, tab: 21, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'FAS-3 Kit', salt: 'Metronidazole + Furazolidone + Diloxanide Furoate कॉम्बो-किट — मिश्रित परजीवी दस्त; ⚠ शराब वर्जित — कोर्स के दौरान व 48 घंटे बाद तक; बच्चों में डॉक्टर से; बहुत कड़वा — खाने के बाद', doseOptions: ['किट के अनुसार 1 खुराक दिन में 3 बार × 3-5 दिन'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplox TZ Tablet', salt: 'Ciprofloxacin 500 mg + Tinidazole 600 mg — संक्रामक दस्त-डिसेंट्री; ⚠ गर्भावस्था वर्जित; शराब वर्जित (कोर्स+48 घंटे); दूध/एंटासिड से 2 घंटे अंतर', doseOptions: ['1 गोली दिन में 2 बार × 3-5 दिन'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'O2 Tablet', salt: 'Ofloxacin 200 mg + Ornidazole 500 mg — दस्त/पेट का संक्रमण; ⚠ गर्भावस्था वर्जित; शराब वर्जित (कोर्स+48 घंटे)', doseOptions: ['1 गोली दिन में 2 बार × 3-5 दिन'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zedott 100 Tablet', salt: 'Racecadotril 100 mg — रस-नियंत्रक दस्त-दवा (लूपरामाइड वर्ग नहीं — कोलिक कम); ⚠ खून/बुखार वाले दस्त में कभी नहीं', doseOptions: ['1 गोली दिन में 3 बार — दस्त रुकने तक (अधिकतम 7 दिन)'], morning: 1, afternoon: 1, evening: 1, tab: 21, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zentel 400 Tablet', salt: 'Albendazole 400 mg — गोल कीड़े/पिनवर्म/फीता; चबाकर एक बार; परिवार के सबको एक साथ; 2 हफ्ते बाद दोहराना अक्सर जरूरी; ⚠ गर्भावस्था में नहीं', doseOptions: ['1 गोली रात को चबाकर (एक बार)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── ORS / zinc / vitamins ──
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose — 1 पैकेट = केवल 1 लीटर उबले-ठंडे पानी में; हर दस्त के बाद; घोल 24 घंटे में खत्म', doseOptions: ['1 पैकेट 1 लीटर पानी में — जरूरत के हिसाब से कई पैकेट'], morning: 1, afternoon: 1, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'मल्टीविटामिन + मल्टीमिनरल + जिंक — भूख/रिकवरी/लीवर सपोर्ट; खाने के बाद', doseOptions: ['1 गोली खाने के बाद रोज़ाना'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zinconia Syrup 60ml', salt: 'Elemental Zinc 20 mg/5 ml — दस्त में 14 दिन का पूरा कोर्स — दस्त रुकने पर भी बंद न करें; खाली पेट नहीं (कहीं उल्टी-जैसा लगता है)', doseOptions: ['5 ml दिन में 1 बार × 14 दिन (बच्चे)', '10 ml दिन में 1 बार × 14 दिन (वयस्क)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'B-कॉम्प्लेक्स + विटामिन C — मुंह के छाले/भूख/रिकवरी में सपोर्ट', doseOptions: ['1 कैप्सूल दिन में 1 बार खाने के बाद'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Hepatoprotective / liver ──
    { name: 'Udiliv 150 Tablet', salt: 'Ursodeoxycholic Acid 150 mg — फैटी लीवर/पित्त-पत्थर रोकथाम (संकेत डॉक्टरी); लंबा कोर्स लैब-रिपोर्ट देखकर ही', doseOptions: ['1 गोली दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Udiliv 300 Tablet', salt: 'Ursodeoxycholic Acid 300 mg — फैटी लीवर/पित्त प्रवाह सुधार; लैब देखकर लंबा कोर्स', doseOptions: ['1 गोली रात को', '1 गोली दिन में 2 बार'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Liv 52 Tablet', salt: 'हर्बल हेपेटो-प्रोटेक्टिव (Himalaya) — सपोर्टिव; वायरल हेपेटाइटिस में मुख्य इलाज आराम-आहार-निगरानी ही है — यह केवल सहायक', doseOptions: ['1-2 गोली दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Liv 52 DS Tablet', salt: 'Liv 52 DS — फैटी लीवर/रिकवरी में दोहरी शक्ति का हर्बल सपोर्ट', doseOptions: ['1 गोली दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Silybon 140 Tablet', salt: 'Silymarin 140 mg (दूध-थिस्टल) — हेपेटो-प्रोटेक्टिव सपोर्ट', doseOptions: ['1 गोली दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Anorectal topical / herbal (⚠ steroid creams max 7 days) ──
    { name: 'Smuth Cream 30g', salt: 'Lidocaine + Hydrocortisone + Allantoin गुदा-क्रीम — दर्द-सूजन-खुजली में; ⚠ स्टेरॉयड-युक्त: अधिकतम 7 दिन; संक्रमण-खून में नहीं', doseOptions: ['शौच/सिट्ज़ बाथ के बाद प्रभावित जगह पर दिन में 2-3 बार पतली परत'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Anovate Cream 15g', salt: 'Beclometasone + Lidocaine + Phenylephrine — बवासीर की सूजन-दर्द-खुजली; ⚠ स्टेरॉयड-युक्त: अधिकतम 7 दिन का छोटा कोर्स', doseOptions: ['शौच के बाद व रात को पतली परत (एप्लिकेटर/अंगुली से)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Proctosedyl Ointment 15g', salt: 'Framycetin + Hydrocortisone + स्थानीय एनेस्थेटिक — बवासीर/फिशर का संक्षिप्त कोर्स; ⚠ स्टेरॉयड-युक्त: अधिकतम 7 दिन', doseOptions: ['शौच के बाद व सोते समय पतली परत'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pilex Ointment 30g', salt: 'हर्बल (Himalaya) बवासीर मलहम — स्टेरॉयड-रहित, ज्यादा दिन लगा सकते हैं', doseOptions: ['शौच के बाद व रात को लगाएं'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pilex Tablet', salt: 'हर्बल बवासीर-गोली — कब्ज-रक्तस्राव में सपोर्ट; आराम-फाइबर के साथ', doseOptions: ['1-2 गोली दिन में 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 60, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Safe analgesic / carminative ──
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — पेट के मरीज़ में दर्द की सबसे सुरक्षित दवा; 24 घंटे में अधिकतम 3 गोली; ⚠ ब्रुफेन/एस्पिरिन जैसी NSAID पेट के मरीज़ में कभी नहीं', doseOptions: ['1 गोली दर्द/बुखार पर (दिन में अधिकतम 3)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pudin Hara Capsule 10s', salt: 'पुदीना-तेल आधारित हर्बल कार्मिनेटिव — गैस/हल्के पेट दर्द में SOS', doseOptions: ['1 कैप्सूल गैस/दर्द पर SOS'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (46) ════════════════════════════════════
  // Refer-only findings deliberately absent below (see findings comment).
  findingMeds: [
    // GERD
    { findingKey: 'GERD', medicineName: 'Pan 40 Tablet', dose: '1 गोली नाश्ते से पहले', morning: 1, afternoon: 0, evening: 0, tab: 30, description: '4-8 हफ्ते कोर्स → समीक्षा; राहत न हो तो एंडोस्कोपी' },
    { findingKey: 'GERD', medicineName: 'Omez-D Capsule', description: 'मतली/भारीपन सहित रिफ्लक्स — 1 कैप्सूल नाश्ते से पहले' },
    { findingKey: 'GERD', medicineName: 'Digene Gel 200ml', dose: '10 ml SOS', description: 'बीच-बीच की जलन की तुरंत राहत' },
    // GASTRITIS-ACUTE
    { findingKey: 'GASTRITIS-ACUTE', medicineName: 'Pan-D Capsule', description: '1 कैप्सूल नाश्ते से पहले × 2 हफ्ते' },
    { findingKey: 'GASTRITIS-ACUTE', medicineName: 'Sucrafil Suspension 200ml', dose: '10 ml दिन में 2 बार', description: 'भोजन से 1 घंटा पहले × 2 हफ्ते' },
    // FUNCTIONAL-DYSPEPSIA
    { findingKey: 'FUNCTIONAL-DYSPEPSIA', medicineName: 'Aristozyme Liquid 200ml', description: 'खाने के बाद 10 ml × 2-4 हफ्ते' },
    { findingKey: 'FUNCTIONAL-DYSPEPSIA', medicineName: 'Pan 20 Tablet', description: '1 गोली नाश्ते से पहले × 4 हफ्ते — फिर घटाकर बंद' },
    // IBS-D
    { findingKey: 'IBS-D', medicineName: 'Rifagut 550 Tablet', description: '1 गोली BD × 14 दिन' },
    { findingKey: 'IBS-D', medicineName: 'Normaxin Tablet', description: 'खाने से पहले TDS × 2-4 हफ्ते (नींद सावधानी)' },
    { findingKey: 'IBS-D', medicineName: 'Econorm Sachet', description: '1 सैशेट BD × 5 दिन (प्रोबायोटिक)' },
    // IBS-C
    { findingKey: 'IBS-C', medicineName: 'Duphalac Solution 200ml', description: '15 ml रात को — जरूरत से घटा-बढ़ाकर' },
    { findingKey: 'IBS-C', medicineName: 'Colospa Retard Capsule', description: '1 कैप्सूल BD खाने से पहले × 4 हफ्ते' },
    { findingKey: 'IBS-C', medicineName: 'Naturolax Powder 100g', description: '1-2 चम्मच रात को पानी में — देखकर' },
    // IBS-M
    { findingKey: 'IBS-M', medicineName: 'Rifagut 400 Tablet', description: '1 गोली BD × 14 दिन' },
    { findingKey: 'IBS-M', medicineName: 'Meva-C Capsule', description: '1 कैप्सूल BD खाने से पहले — लघु कोर्स' },
    // ACUTE-GE
    { findingKey: 'ACUTE-GE', medicineName: 'Electral Sachet (ORS)', description: '1 पैकेट = 1 लीटर पानी; हर दस्त के बाद 1-2 गिलास' },
    { findingKey: 'ACUTE-GE', medicineName: 'Zinconia Syrup 60ml', description: 'रोज़ 1 बार × पूरे 14 दिन — दस्त रुकने पर भी जारी' },
    { findingKey: 'ACUTE-GE', medicineName: 'Sporlac Tablet', description: '1 गोली TDS × 5 दिन' },
    // AMOEBIC-COLITIS
    { findingKey: 'AMOEBIC-COLITIS', medicineName: 'Metrogyl 400 Tablet', description: '1 गोली TDS × 5-7 दिन; ⚠ शराब वर्जित + 48 घंटे' },
    { findingKey: 'AMOEBIC-COLITIS', medicineName: 'FAS-3 Kit', description: 'किट अनुसार दिन में 3 खुराक × 3-5 दिन; ⚠ शराब वर्जित + 48 घंटे' },
    // MILD-COLITIS
    { findingKey: 'MILD-COLITIS', medicineName: 'VSL#3 Capsule', description: '1 कैप्सूल BD × 4 हफ्ते' },
    { findingKey: 'MILD-COLITIS', medicineName: 'Sporlac Tablet', description: '1 गोली BD × 2 हफ्ते' },
    // GALLSTONE-COLIC
    { findingKey: 'GALLSTONE-COLIC', medicineName: 'Drotin DS Tablet', description: 'मरोड़ पर 1 गोली SOS — सर्जरी सलाह के साथ' },
    { findingKey: 'GALLSTONE-COLIC', medicineName: 'Dolo 650 Tablet', description: 'दर्द पर 1 गोली SOS (अधिकतम 3/दिन)' },
    // CHRONIC-CONSTIPATION
    { findingKey: 'CHRONIC-CONSTIPATION', medicineName: 'Duphalac Solution 200ml', description: '15 ml रात को — फिर धीरे घटाएं' },
    { findingKey: 'CHRONIC-CONSTIPATION', medicineName: 'Naturolax Powder 100g', description: '1-2 चम्मच रात को — पहली पसंद (फाइबर)' },
    // HEMORRHOIDS
    { findingKey: 'HEMORRHOIDS', medicineName: 'Pilex Tablet', description: '1-2 गोली BD × 4 हफ्ते + कब्ज-प्रबंधन' },
    { findingKey: 'HEMORRHOIDS', medicineName: 'Anovate Cream 15g', description: 'शौच के बाद व रात को — ⚠ अधिकतम 7 दिन' },
    // ANAL-FISSURE
    { findingKey: 'ANAL-FISSURE', medicineName: 'Smuth Cream 30g', description: 'दिन में 2-3 बार पतली परत — ⚠ अधिकतम 7 दिन' },
    { findingKey: 'ANAL-FISSURE', medicineName: 'Duphalac Solution 200ml', description: '15 ml रात को — मल नरम रखना इलाज का आधा हिस्सा' },
    { findingKey: 'ANAL-FISSURE', medicineName: 'Proctosedyl Ointment 15g', description: 'शौच के बाद व रात को — ⚠ अधिकतम 7 दिन' },
    // FATTY-LIVER
    { findingKey: 'FATTY-LIVER', medicineName: 'Udiliv 300 Tablet', description: '1 गोली रात को — LFT देखकर लंबा; मुख्य इलाज वजन-घटाना + शराब-बंद' },
    { findingKey: 'FATTY-LIVER', medicineName: 'Liv 52 DS Tablet', description: '1 गोली BD — सपोर्टिव' },
    // HEPATITIS-A
    { findingKey: 'HEPATITIS-A', medicineName: 'Zincovit Tablet', description: 'रोज़ 1 गोली — सपोर्टिव; मुख्य इलाज आराम + साफ खाना-पानी' },
    { findingKey: 'HEPATITIS-A', medicineName: 'Liv 52 Tablet', description: '1-2 गोली BD — सहायक (प्रमाण सीमित)' },
    // HEPATITIS-E
    { findingKey: 'HEPATITIS-E', medicineName: 'Zincovit Tablet', description: 'रोज़ 1 गोली — सपोर्टिव कोर्स' },
    { findingKey: 'HEPATITIS-E', medicineName: 'Ondem 4 MD Tablet', description: 'मतली पर जीभ पर 1 गोली — छोटा कोर्स' },
    // HEPATITIS-B-CHRONIC
    { findingKey: 'HEPATITIS-B-CHRONIC', medicineName: 'Zincovit Tablet', description: 'रोज़ 1 गोली — सपोर्ट; ⚠ एंटीवायरल (एंटेकाविर/टेनोफोविर) केवल हेपेटोलॉजिस्ट ही शुरू करें' },
    // CIRRHOSIS-STABLE
    { findingKey: 'CIRRHOSIS-STABLE', medicineName: 'Duphalac Solution 200ml', description: '15-30 ml रात को — कब्ज-नियंत्रण व अमोनिया-ह्रास; जरूरत अनुसार' },
    { findingKey: 'CIRRHOSIS-STABLE', medicineName: 'Udiliv 150 Tablet', description: '1 गोली BD — केवल हेपेटोलॉजी सलाह पर जारी रखें' },
    // INTESTINAL-WORMS
    { findingKey: 'INTESTINAL-WORMS', medicineName: 'Zentel 400 Tablet', description: '1 गोली चबाकर एक बार; परिवार सबको; 2 हफ्ते बाद दोहराएं' },
    // NAUSEA-VOMITING
    { findingKey: 'NAUSEA-VOMITING', medicineName: 'Ondem 4 MD Tablet', description: 'जीभ पर 1 गोली BD-TDS, छोटा कोर्स (1-3 दिन)' },
    { findingKey: 'NAUSEA-VOMITING', medicineName: 'Domstal 10 Tablet', description: 'खाने से पहले 1 गोली TDS × 3-5 दिन' },
    // BLOATING-GAS
    { findingKey: 'BLOATING-GAS', medicineName: 'Unienzyme Tablet', description: 'खाने के बाद 1 गोली TDS × 2 हफ्ते' },
    { findingKey: 'BLOATING-GAS', medicineName: 'Pudin Hara Capsule 10s', description: 'गैस पर 1 कैप्सूल SOS' },
    // RECURRENT-ORAL-ULCERS
    { findingKey: 'RECURRENT-ORAL-ULCERS', medicineName: 'Becosules Capsule', description: 'रोज़ 1 कैप्सूल × 4 हफ्ते; दस्त/वजन-घटना हो तो सीलिएक-IBD जांच रेफर' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Symptom-Food Diary (लक्षण-भोजन डायरी)',
      rows: 14,
      cols: 4,
      headerLabel: ['तारीख', 'खाया-पिया क्या (भोजन/चाय-कॉफी)', 'लक्षण (जलन/दर्द/गैस/दस्त)', 'तीव्रता 0-10'],
      colsLabel: ['Date', 'Food-drink taken', 'Symptom (burning/pain/gas/stool)', 'Severity 0-10'],
      footerLabel: ['14 दिन भरकर डॉक्टर को दिखाएं — ट्रिगर खाना पक्का पहचान में आता है / Fill for 14 days and show the doctor — trigger foods get identified'],
      extraLabel: 'खाने के 1-2 घंटे के भीतर लिखें',
    },
    {
      name: 'Bristol Stool Chart (मल रूप चार्ट)',
      rows: 7,
      cols: 3,
      headerLabel: ['प्रकार', 'दिखता कैसा है', 'मतलब'],
      colsLabel: [
        '1 — अलग-अलग छोटी सख्त गुठियां (मेवे जैसी)',
        '2 — गुठियों की जुड़ी हुई सांसली',
        '3 — सॉसेज आकार, सतह पर दरारें',
        '4 — चिकना-लंबा सॉसेज/रस्सी जैसा',
        '5 — नरम टुकड़े, किनारे साफ',
        '6 — दलदला, धारियां, पतला',
        '7 — पूरा पानीदार, ठोस नहीं',
      ],
      footerLabel: ['सामान्य = प्रकार 3-4 · प्रकार 1-2 = कब्ज (फाइबर-पानी बढ़ाएं) · प्रकार 6-7 = दस्त (ORS + जिंक 14 दिन; खून/बुखार = डॉक्टर) / Normal = Type 3-4 · Type 1-2 = constipation (more fiber-water) · Type 6-7 = diarrhea (ORS + zinc 14 days; blood/fever = doctor)'],
      extraLabel: 'हर शौच के बाद प्रकार का नंबर याद रखें — IBS ट्रैकिंग में बहुत काम आता है',
    },
    {
      name: 'Liver Function Tracker (लीवर जांच ट्रैकर)',
      rows: 8,
      cols: 6,
      headerLabel: ['तारीख', 'बिलिरुबिन (कुल)', 'SGPT (ALT)', 'SGOT (AST)', 'ALP', 'एल्बुमिन'],
      colsLabel: ['Date', 'Bilirubin Total (mg/dl)', 'SGPT ALT (U/L)', 'SGOT AST (U/L)', 'ALP (U/L)', 'Albumin (g/dl)'],
      footerLabel: ['रिपोर्ट के मान लिखकर/काटकर चिपकाएं और हर विज़िट पर दिखाएं · बिलिरुबिन तेजी से बढ़े या एल्बुमिन गिरे — तुरंत रेफर / Paste report values and show every visit · bilirubin rising fast or albumin falling — refer urgently'],
      extraLabel: 'हेपेटाइटिस पैनल (A/B/C/E) की तारीख भी नोट करें',
    },
    {
      name: 'IBS Diet & Lifestyle Chart (IBS आहार व दिनचर्या)',
      rows: 10,
      cols: 3,
      headerLabel: ['श्रेणी', 'हरा — आपको ठीक रखता है', 'लाल — आपका ट्रिगर है'],
      colsLabel: [
        'दूध व दूध-उत्पाद (दही/छाछ अलग लिखें)',
        'अनाज — रोटी/चावल/दलिया',
        'दालें व सब्ज़ियां',
        'फल',
        'तला-मसालेदार व बाहर का खाना',
        'चाय-कॉफी-कोला',
        'मीठा / चॉकलेट',
        'प्याज़-गोभी-ब्रोकली-राजमा',
        'शराब / धूम्रपान',
        'खाने की आदतें (समय, जल्दी, भरपेट)',
      ],
      footerLabel: ['आम लाल-ट्रिगर: तला-मसालेदार, चाय-कॉफी, शराब, गोभी-प्याज़, चॉकलेट, मीठे-कोला · आम हरे: दही-छाछ, दलिया-खिचड़ी, पपीता-केला · अपने नाम खाली खानों में भरते जाएं / Common red triggers: fried-spicy, tea-coffee, alcohol, cabbage-onion, chocolate, sweets-cola · common green: curd-buttermilk, porridge-khichdi, papaya-banana · keep filling your own into the blanks'],
      extraLabel: 'छोटे भोजन · धीरे खाएं · नियमित समय · तनाव-नींद भी लक्षण बदलते हैं',
    },
    {
      name: 'Endoscopy Prep Card (एंडोस्कोपी से पहले की तैयारी)',
      rows: 6,
      cols: 2,
      headerLabel: ['क्रम', 'कदम'],
      colsLabel: [
        '1 — रात 10 बजे के बाद कुछ न खाएं-पिएं (कम से कम 6 घंटे खाली पेट जरूरी)',
        '2 — सुबह शुगर की दवा नहीं; BP/दिल की दवा केवल डॉक्टर की सलाह से',
        '3 — प्रोस्टेट/पेट की पुरानी दवाएं व एंटीकोगुलेंट डॉक्टर को बताएं — कुछ रोकनी पड़ती हैं',
        '4 — साथ एक वयस्क जरूरी — प्रक्रिया के बाद गाड़ी चलाना/अकेला सफर मना',
        '5 — बेहोशी की दवा (सेडेशन) हो तो 24 घंटे गाड़ी नहीं; पहचान-पत्र व पुरानी रिपोर्ट साथ',
        '6 — दांत का यंत्र/गले की शिकायत डॉक्टर को पहले बताएं; 2-3 घंटे का समय रखें',
      ],
      footerLabel: ['प्रक्रिया के 6 घंटे पहले से खाली पेट अनिवार्य · साथ आने वाले व्यक्ति के बिना प्रक्रिया टल सकती है / 6-hour fasting mandatory · without an accompanying adult the procedure may be deferred'],
      extraLabel: 'कार्ड पर दी खुराक के अनुसार ही दवा लें — अपने आप से नहीं',
    },
    {
      name: 'Cirrhosis Stable Follow-Up Card (सिरोसिस फॉलो-अप कार्ड)',
      rows: 8,
      cols: 5,
      headerLabel: ['तारीख', 'वजन (किग्रा)', 'पेट परिधि (सेमी)', 'पैरों में सूजन (हां/नहीं)', 'LFT तारीख'],
      colsLabel: ['Date', 'Weight (kg)', 'Girth at navel (cm)', 'Leg swelling (Y/N)', 'LFT date'],
      footerLabel: ['रोज़ सुबह खाली पेट एक ही स्केल पर तौलें, परिधि नाभि पर मापें · सप्ताह में 2 किग्रा+ वजन या परिधि बढ़े, सूजन आए, काला मल/खून की उल्टी, बुखार या नींद-भ्रम — तुरंत अस्पताल / Weigh daily fasting on the same scale, measure girth at the navel · 2 kg+/week weight or girth rise, swelling, black stool/blood vomit, fever or confusion — hospital immediately'],
      extraLabel: 'नमक कम — अचार-पापड़-चिप्स वर्जित · फॉलो-अप हर 1-3 महीने · एंडोस्कोपी साल में एक बार',
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acute Gastritis — 2-Week Course (तीव्र गैस्ट्राइटिस)',
      diagnosis: 'GASTRITIS-ACUTE',
      medicines: [
        { name: 'Pan-D Capsule', dose: '1 कैप्सूल', duration: '14 दिन', instructions: 'नाश्ते से 30 मिनट पहले; 2 हफ्ते बाद समीक्षा — राहत न हो तो एंडोस्कोपी' },
        { name: 'Sucrafil Suspension 200ml', dose: '10 ml', duration: '14 दिन', instructions: 'भोजन से 1 घंटा पहले दिन में 2 बार; Pan-D से 2 घंटे अंतर रखें' },
        { name: 'Digene Gel 200ml', dose: '10 ml', duration: '7 दिन', instructions: 'बीच की जलन पर SOS (दिन में अधिकतम 3 बार)' },
      ],
      labs: ['H. pylori स्टूल एंटीजेन (4 हफ्ते में न ठीक हो तो)', 'CBC (रक्त कमी निकालने हेतु)'],
      advice: 'छोटे-छोटे भोजन 4-5 बार · तीखा-तला-गरिष्ट व चाय-कॉफी बंद · खाने के 2 घंटे बाद तक न लेटें · दर्द की गोली केवल पैरासिटामोल — ब्रुफेन/एस्पिरिन कभी नहीं · काला मल या खून की उल्टी आए — तुरंत इमरजेंसी',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'GERD Step-Up — PPI + Lifestyle (रिफ्लक्स कोर्स)',
      diagnosis: 'GERD',
      medicines: [
        { name: 'Omez-D Capsule', dose: '1 कैप्सूल', duration: '28 दिन', instructions: 'नाश्ते से 30 मिनट पहले; 4-8 हफ्ते पर जरूर समीक्षा — बिना जांच जीवन-भर PPI नहीं' },
        { name: 'Gelusil MPS Liquid 200ml', dose: '10 ml', duration: '14 दिन', instructions: 'खाने के 1 घंटे बाद व सोते समय; Omez-D से 2 घंटे अंतर' },
      ],
      labs: ['एंडोस्कोपी — एलार्म हो या 4-8 हफ्ते में राहत न हो तो'],
      advice: 'बिस्तर का सिरहाना 6-8 इंच ऊंचा (ब्लॉक से, सिर्फ तकिया नहीं) · रात का भोजन सोने से 3 घंटे पहले · रात की चाय-कॉफी बंद · धीरे-धीरे चबाकर खाएं · कमर कसने वाले कपड़े व भारी वजन उठाने से बचें · वजन घटाएं',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'IBS-D Pattern Course (IBS-दस्त प्रकार)',
      diagnosis: 'IBS-D',
      medicines: [
        { name: 'Rifagut 550 Tablet', dose: '1 गोली', duration: '14 दिन', instructions: 'दिन में 2 बार (सुबह-शाम); पूरा 14 दिन का कोर्स' },
        { name: 'Normaxin Tablet', dose: '1 गोली', duration: '21 दिन', instructions: 'खाने से पहले दिन में 2-3 बार; ⚠ नींद आ सकती है — गाड़ी नहीं; 4 हफ्ते से लंबा नहीं' },
        { name: 'Econorm Sachet', dose: '1 सैशेट', duration: '5 दिन', instructions: 'दिन में 2 बार पानी से (प्रोबायोटिक)' },
      ],
      labs: ['शौच रूटीन + परजीवी (एक बार, न हुआ हो)', 'थायरॉइड TSH (न हुआ हो)'],
      advice: 'IBS डाइट चार्ट (दी गई तालिका) अपनाएं — हरा/लाल खाना खुद चिन्हित करें · दही-छाछ फायदा करते हैं · नींद पूरी व रोज़ 30 मिनट टहलना शुरू करें · रात को दस्त, खून या वजन घटने पर तुरंत आएं — ये IBS नहीं होते',
      followUpDays: 21,
      isCommon: true,
    },
    {
      name: 'IBS-C Pattern Course (IBS-कब्ज प्रकार)',
      diagnosis: 'IBS-C',
      medicines: [
        { name: 'Duphalac Solution 200ml', dose: '15 ml', duration: '28 दिन', instructions: 'रात को सोते समय; दस्त बहुत पतले हों तो 10 ml करें — खुद घटा-बढ़ा सकते हैं' },
        { name: 'Colospa Retard Capsule', dose: '1 कैप्सूल', duration: '28 दिन', instructions: 'दिन में 2 बार खाने से 20 मिनट पहले' },
        { name: 'Naturolax Powder 100g', dose: '1-2 चम्मच', duration: '28 दिन', instructions: 'रात को 1 गिलास पानी में — घोलकर तुरंत पिएं; साथ खूब पानी' },
      ],
      labs: ['थायरॉइड प्रोफाइल (न हुआ हो)', 'CBC'],
      advice: 'फाइबर धीरे-धीरे बढ़ाएं — पहले 3-4 दिन गैस बढ़ सकती है · दिन में 2 लीटर पानी · नाश्ते के 20-30 मिनट बाद शौच का नियम बनाएं, जोर कभी न लगाएं · दर्द बढ़े या खून आए तो तुरंत दिखाएं',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'Acute Amoebic Diarrhea Course (अमीबा दस्त)',
      diagnosis: 'AMOEBIC-COLITIS',
      medicines: [
        { name: 'FAS-3 Kit', dose: '1 खुराक', duration: '5 दिन', instructions: 'किट के अनुसार दिन में 3 बार; ⚠ शराब वर्जित — कोर्स + 48 घंटे बाद तक पूरी तरह' },
        { name: 'Electral Sachet (ORS)', dose: '1 पैकेट', duration: '5 दिन', instructions: '1 पैकेट केवल 1 लीटर उबले-ठंडे पानी में; हर दस्त के बाद 1-2 गिलास' },
        { name: 'Sporlac Tablet', dose: '1 गोली', duration: '5 दिन', instructions: 'दिन में 2-3 बार — आंत के अच्छे कीटाणु बहाल' },
      ],
      labs: ['शौच रूटीन/माइक्रोस्कोपी (शुरू करने से पहले संभव हो तो)'],
      advice: 'खाना हल्का (खिचड़ी-दलिया-सूखी रोटी) · दूध व तला-मसालेदार बंद · दही-छाछ चलेंगे · नाखून छोटे, हाथ धोना · परिवार के बर्तन अलग नहीं चाहिए पर हाथ की सफाई जरूरी · बुखार/खून बढ़े या पानी की कमी लगे — तुरंत आएं',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'Fissure Healing Bundle (फिशर इलाज पैक)',
      diagnosis: 'ANAL-FISSURE',
      medicines: [
        { name: 'Duphalac Solution 200ml', dose: '15 ml', duration: '28 दिन', instructions: 'रात को सोते समय — मल नरम रखना इलाज का आधा हिस्सा' },
        { name: 'Smuth Cream 30g', dose: 'पतली परत', duration: '7 दिन', instructions: 'सिट्ज़ बाथ के बाद व शौच के बाद दिन में 2-3 बार; ⚠ स्टेरॉयड-युक्त — अधिकतम 7 दिन' },
        { name: 'Dolo 650 Tablet', dose: '1 गोली', duration: '5 दिन', instructions: 'तेज दर्द पर SOS (दिन में अधिकतम 3)' },
      ],
      labs: [],
      advice: 'सिट्ज़ बाथ: गर्म पानी की टब में 10-15 मिनट बैठें — दिन में 2-3 बार, शौच के बाद जरूर · फाइबर (साबुत गेहूं, छिलकेदार फल, सब्ज़ियां) + दिन में 2 लीटर पानी · जोर बिल्कुल न लगाएं · गुदा को साबुन से न रगड़ें — साफ पानी से धोकर हल्का सुखाएं · 3-4 हफ्ते में न भरे तो सर्जरी सलाह लें',
      followUpDays: 21,
      isCommon: true,
    },
  ],
}
