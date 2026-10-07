/**
 * SUR-01 — GENERAL SURGERY STARTER PACK (T1)
 *
 * The Indian general-surgery OPD core: "OPD feeds the OT" — lumps &
 * swellings (hernia / lipoma / breast / thyroid), acute-abdomen screening,
 * anorectal complaints (piles / fissure / fistula), varicose veins, wounds
 * and post-operative follow-up, plus pre-OT preparation templates that feed
 * the surgery-booking (OT) module.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / printed advice),
 * English secondary (doctor search). Medicine names = English brands
 * (India surgical OPD core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * EMERGENCY DISCIPLINE (acute-abdomen family — appendicitis, strangulated
 * hernia, cholecystitis-with-fever, obstruction, GI bleed):
 *   - questions screen for them FIRST;
 *   - suggestions carry explicit 'aaj hi hospital jayein' lines;
 *   - emergency findings (STRANG-HERNIA, APPENDICITIS-SUS,
 *     CHOLECYSTITIS-ACUTE, BREAST-CANCER-SUS) carry ZERO medicine links by
 *     design — referral is the treatment, medicines only mask & delay.
 *
 * SAFETY CURATION NOTES (deliberate exclusions / hard flags):
 *   - Proctosedyl / Anovate (topical steroid+antibiotic combos for piles)
 *     deliberately EXCLUDED — pending MBBS review.
 *   - Injectable analgesia / IV antibiotic prophylaxis EXCLUDED — hospital/
 *     OT-domain only, not OPD pack content.
 *   - Nimesulide combos, opioid injections, sclerotherapy EXCLUDED.
 *   - Peglec (bowel prep): Schedule H + rehydration/electrolyte caution in
 *     salt string; only on doctor's pre-op instruction.
 *   - Dulcolax (bisacodyl): short-term use only; NOT in suspected
 *     intestinal obstruction (noted in salt).
 *   - Ultracet (tramadol): Schedule H, short-course only.
 *   - NSAIDs post-op: bleeding/renal cautions baked into salt strings.
 *   - Metrogyl: alcohol-avoidance note (disulfiram-like reaction).
 *   - Cancer red-flag lines are mandatory content (breast hard/fixed/nipple
 *     retraction → triple assessment; dysphagia + weight loss → endoscopy).
 *
 * Sources: NLEM 2023 (molecule backbone), standard Indian general-surgery
 * OPD practice patterns, Bailey-&-Love-style triage discipline (OPD-level
 * screens only), GP-01 as the structural format precedent.
 */

import type { SpecialtyPack } from '../types'

export const SUR01_PACK: SpecialtyPack = {
  meta: {
    code: 'SUR-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'General Surgery Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · India surgical OPD top-patterns · emergency-refer-first curation · pre-op templates feed OT module · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'LMP', name: 'गांठ व सूजन', nameEn: 'Lumps & Swellings' },
    { key: 'HRN', name: 'हर्निया व अंडकोश', nameEn: 'Hernia & Scrotum' },
    { key: 'ABD', name: 'पेट संबंधी शिकायतें', nameEn: 'Abdominal Complaints' },
    { key: 'ANR', name: 'बवासीर / फिशर / मस्से', nameEn: 'Anorectal (Piles/Fissure/Fistula)' },
    { key: 'VIN', name: 'नसें व अन्य', nameEn: 'Veins & Others' },
    { key: 'WND', name: 'घाव व ऑपरेशन के बाद', nameEn: 'Wounds & Post-op' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // LMP — Lumps & Swellings
    { code: 'LMP01', categoryKey: 'LMP', detail: 'शरीर पर नरम गांठ (बिना दर्द)', detailEn: 'Soft Lump Under Skin (Lipoma)' },
    { code: 'LMP02', categoryKey: 'LMP', detail: 'त्वचा के नीचे छोटी गांठ (काला बिंदु वाली)', detailEn: 'Sebaceous Cyst (Skin Lump)' },
    { code: 'LMP03', categoryKey: 'LMP', detail: 'स्तन में गांठ', detailEn: 'Breast Lump' },
    { code: 'LMP04', categoryKey: 'LMP', detail: 'स्तन में दर्द (बढ़ता-घटता)', detailEn: 'Breast Pain' },
    { code: 'LMP05', categoryKey: 'LMP', detail: 'स्तन से स्राव', detailEn: 'Nipple Discharge' },
    { code: 'LMP06', categoryKey: 'LMP', detail: 'गर्दन के आगे सूजन (निगलने पर चलती)', detailEn: 'Thyroid Swelling' },
    { code: 'LMP07', categoryKey: 'LMP', detail: 'गर्दन में गांठ', detailEn: 'Neck Lump (Node)' },
    { code: 'LMP08', categoryKey: 'LMP', detail: 'अंडकोश में सूजन (दर्द रहित)', detailEn: 'Scrotal Swelling (Hydrocele)' },
    // HRN — Hernia & Scrotum
    { code: 'HRN01', categoryKey: 'HRN', detail: 'खांसते/खड़े होने पर जांघ में गांठ आना', detailEn: 'Groin Lump on Standing/Coughing (Hernia)' },
    { code: 'HRN02', categoryKey: 'HRN', detail: 'नाभि पर गांठ', detailEn: 'Umbilical Lump (Hernia)' },
    { code: 'HRN03', categoryKey: 'HRN', detail: 'पुरानी गांठ अचानक दर्दनाक होना व उल्टी', detailEn: 'Hernia Suddenly Painful with Vomiting (Emergency)' },
    { code: 'HRN04', categoryKey: 'HRN', detail: 'पुराने ऑपरेशन के निशान पर गांठ', detailEn: 'Lump at Old Operation Scar' },
    // ABD — Abdominal Complaints
    { code: 'ABD01', categoryKey: 'ABD', detail: 'दाहिने निचले पेट में दर्द', detailEn: 'Right Lower Abdominal Pain (Appendicitis Screen)' },
    { code: 'ABD02', categoryKey: 'ABD', detail: 'तला/चिकनाई भोजन के बाद दाहिने ऊपरी पेट में दर्द', detailEn: 'RUQ Pain After Fatty Meal (Gallstone)' },
    { code: 'ABD03', categoryKey: 'ABD', detail: 'पेट दर्द के साथ उल्टी व पेट फूलना', detailEn: 'Pain with Vomiting & Distension (Obstruction Screen)' },
    { code: 'ABD04', categoryKey: 'ABD', detail: 'कमर से पेट/जांघ तक लहरदार दर्द', detailEn: 'Loin-to-Groin Colic (Renal Colic)' },
    { code: 'ABD05', categoryKey: 'ABD', detail: 'पुरानी कब्ज', detailEn: 'Long-standing Constipation' },
    { code: 'ABD06', categoryKey: 'ABD', detail: 'खाना निगलने में दिक्कत', detailEn: 'Difficulty Swallowing (Dysphagia)' },
    { code: 'ABD07', categoryKey: 'ABD', detail: 'पेट में गांठ महसूस होना', detailEn: 'Palpable Abdominal Lump' },
    { code: 'ABD08', categoryKey: 'ABD', detail: 'खाने के बाद पेट में भारीपन / गैस', detailEn: 'Post-meal Heaviness / Dyspepsia' },
    { code: 'ABD09', categoryKey: 'ABD', detail: 'पीलिया (आंखों/त्वचा का पीलापन)', detailEn: 'Jaundice' },
    { code: 'ABD10', categoryKey: 'ABD', detail: 'काला मल / उल्टी में खून', detailEn: 'Black Stool or Blood in Vomit (GI Bleed)' },
    // ANR — Anorectal
    { code: 'ANR01', categoryKey: 'ANR', detail: 'बवासीर — मल में खून आना', detailEn: 'Piles with Bleeding' },
    { code: 'ANR02', categoryKey: 'ANR', detail: 'मल त्याग के समय तेज जलन भरा दर्द', detailEn: 'Severe Pain While Passing Stool (Fissure)' },
    { code: 'ANR03', categoryKey: 'ANR', detail: 'गुदा के पास बार-बार मवाद', detailEn: 'Recurrent Pus Near Anus (Fistula)' },
    { code: 'ANR04', categoryKey: 'ANR', detail: 'गुदा के पास दर्दनाक सूजन', detailEn: 'Painful Perianal Swelling (Abscess)' },
    { code: 'ANR05', categoryKey: 'ANR', detail: 'गुदा में खुजली', detailEn: 'Anal Itching' },
    { code: 'ANR06', categoryKey: 'ANR', detail: 'मल त्याग के बाद मांस बाहर आना', detailEn: 'Something Prolapsing After Stool' },
    { code: 'ANR07', categoryKey: 'ANR', detail: 'गुदा के आसपास मस्से', detailEn: 'Anal Skin Tags / Warts' },
    // VIN — Veins & Others
    { code: 'VIN01', categoryKey: 'VIN', detail: 'पैरों की नसें उभरना (फूलना)', detailEn: 'Varicose Veins' },
    { code: 'VIN02', categoryKey: 'VIN', detail: 'पैरों में सूजन व भारीपन', detailEn: 'Leg Swelling & Heaviness' },
    { code: 'VIN03', categoryKey: 'VIN', detail: 'लिंग की त्वचा पीछे न खुलना', detailEn: 'Phimosis (Circumcision Query)' },
    { code: 'VIN04', categoryKey: 'VIN', detail: 'पैर की नस पर लाल धारी व दर्द', detailEn: 'Red Painful Vein Line (Thrombophlebitis)' },
    { code: 'VIN05', categoryKey: 'VIN', detail: 'चलते समय पैर में दर्द (रुकने पर ठीक)', detailEn: 'Leg Pain on Walking, Relieved by Rest (Claudication)' },
    // WND — Wounds & Post-op
    { code: 'WND01', categoryKey: 'WND', detail: 'घाव भर नहीं रहा', detailEn: 'Non-healing Wound' },
    { code: 'WND02', categoryKey: 'WND', detail: 'घाव से मवाद', detailEn: 'Pus from Wound' },
    { code: 'WND03', categoryKey: 'WND', detail: 'घाव की पट्टी / ड्रेसिंग करानी है', detailEn: 'Wound Dressing Query' },
    { code: 'WND04', categoryKey: 'WND', detail: 'ऑपरेशन के बाद फॉलो-अप', detailEn: 'Post-operative Follow-up' },
    { code: 'WND05', categoryKey: 'WND', detail: 'सिलाई हटानी है', detailEn: 'Suture Removal Visit' },
    { code: 'WND06', categoryKey: 'WND', detail: 'ऑपरेशन के बाद दर्द', detailEn: 'Post-operative Pain' },
    { code: 'WND07', categoryKey: 'WND', detail: 'ऑपरेशन के निशान पर दर्द / खुजली', detailEn: 'Incisional Scar Pain / Itch' },
    { code: 'WND08', categoryKey: 'WND', detail: 'फोड़ा / फुंसी (मवाद भरी सूजन)', detailEn: 'Boil / Abscess' },
    { code: 'WND09', categoryKey: 'WND', detail: 'नई चोट / कटा-फटा घाव', detailEn: 'Fresh Cut / Injury Wound' },
    { code: 'WND10', categoryKey: 'WND', detail: 'ऑपरेशन के बाद बुखार', detailEn: 'Post-operative Fever' },
  ],

  // ══ Questions (92 — ~2 per complaint; emergency screens get a 3rd)
  // questionIndex order below MUST match this array order (`// idx N`).
  questions: [
    // LMP01 Soft lump (lipoma)
    { complaintCode: 'LMP01', question: 'गांठ कितने समय से है और उसमें बढ़ोतरी हुई है क्या?', questionEn: 'Since when is the lump, and has it grown?' }, // idx 0
    { complaintCode: 'LMP01', question: 'गांठ नरम है या सख्त, दबाने पर दर्द है या इधर-उधर खिसकती है?', questionEn: 'Is the lump soft or hard, tender or mobile on pressing?' }, // idx 1
    // LMP02 Sebaceous cyst
    { complaintCode: 'LMP02', question: 'गांठ पर बीच में काला बिंदु है या दबाने पर दूधिया गाढ़ा स्राव निकलता है?', questionEn: 'Does the lump have a central black dot or cheesy discharge on pressure?' }, // idx 2
    { complaintCode: 'LMP02', question: 'गांठ कभी लाल-दर्दनाक (सूजन वाली) हो गई है क्या?', questionEn: 'Has the lump ever become red and inflamed?' }, // idx 3
    // LMP03 Breast lump
    { complaintCode: 'LMP03', question: 'स्तन में गांठ कितने समय से है और बढ़ रही है?', questionEn: 'Since when is the breast lump, and is it growing?' }, // idx 4
    { complaintCode: 'LMP03', question: 'गांठ सख्त है या नरम — त्वचा या छाती की दीवार से जुड़ी (अचल) लगती है?', questionEn: 'Is the lump hard or soft — fixed to skin or chest wall?' }, // idx 5
    { complaintCode: 'LMP03', question: 'निपल में खिंचाव, त्वचा में गड्ढा या स्राव तो नहीं?', questionEn: 'Any nipple retraction, skin dimpling or discharge?' }, // idx 6
    // LMP04 Breast pain
    { complaintCode: 'LMP04', question: 'दर्द माहवारी से पहले/उसके दौरान बढ़ता और बाद में घटता है?', questionEn: 'Does the pain increase before/during periods and reduce after?' }, // idx 7
    { complaintCode: 'LMP04', question: 'दर्द की जगह कोई गांठ या गांठ जैसा दर्दनाक क्षेत्र छूने पर मिलता है?', questionEn: 'Is there a localized lump or tender area on examination?' }, // idx 8
    // LMP05 Nipple discharge
    { complaintCode: 'LMP05', question: 'स्राव कैसा है — दूध जैसा, खून मिला या पानीदार?', questionEn: 'What is the discharge like — milky, blood-stained or watery?' }, // idx 9
    { complaintCode: 'LMP05', question: 'स्राव एक स्तन से है या दोनों से? कोई दवा चल रही है?', questionEn: 'From one breast or both? Are you on any medicine?' }, // idx 10
    // LMP06 Thyroid swelling
    { complaintCode: 'LMP06', question: 'गर्दन की सूजन निगलते समय ऊपर-नीचे खिसकती है?', questionEn: 'Does the neck swelling move up-down on swallowing?' }, // idx 11
    { complaintCode: 'LMP06', question: 'वजन घटा है, धड़कन तेज चलती है, या गर्मी/पसीने से दिक्कत है?', questionEn: 'Any weight loss, palpitations or heat intolerance?' }, // idx 12
    // LMP07 Neck node
    { complaintCode: 'LMP07', question: 'गर्दन की गांठ कितने समय से है — बढ़ रही है या वैसी ही है?', questionEn: 'Since when is the neck lump — growing or static?' }, // idx 13
    { complaintCode: 'LMP07', question: 'रात का पसीना, बुखार या वजन घटना भी हुआ है?', questionEn: 'Any night sweats, fever or weight loss?' }, // idx 14
    // LMP08 Hydrocele
    { complaintCode: 'LMP08', question: 'अंडकोश की सूजन दिन भर रहती है या लेटने/सुबह पर घट जाती है?', questionEn: 'Does the scrotal swelling persist all day or reduce on lying down/by morning?' }, // idx 15
    { complaintCode: 'LMP08', question: 'खांसने या शक्ति लगाने पर सूजन या दर्द बढ़ता है?', questionEn: 'Does the swelling or pain increase on coughing or straining?' }, // idx 16
    // HRN01 Groin hernia
    { complaintCode: 'HRN01', question: 'जांघ की गांठ लेटने पर गायब हो जाती है या रहती है?', questionEn: 'Does the groin lump disappear on lying down?' }, // idx 17
    { complaintCode: 'HRN01', question: 'गांठ के साथ दर्द, खिंचाव या भारीपन है — खड़े होकर काम से बढ़ता है?', questionEn: 'Any pain, tugging or heaviness — worse after standing work?' }, // idx 18
    // HRN02 Umbilical hernia
    { complaintCode: 'HRN02', question: 'नाभि की गांठ दबाने पर अंदर चली जाती है (घट जाती है)?', questionEn: 'Does the umbilical bulge reduce on pressing?' }, // idx 19
    { complaintCode: 'HRN02', question: 'खांसते या वजन उठाते समय गांठ बढ़ जाती है?', questionEn: 'Does the bulge enlarge on coughing or lifting?' }, // idx 20
    // HRN03 Strangulation emergency
    { complaintCode: 'HRN03', question: 'पहले घटने वाली गांठ अब दबाने/लेटने पर नहीं घटती?', questionEn: 'Has the previously reducible lump stopped reducing?' }, // idx 21
    { complaintCode: 'HRN03', question: 'गांठ के साथ उल्टी, पेट फूलना या मल/गैस रुकना है?', questionEn: 'Is there vomiting, abdominal distension or stopped stools/flatus?' }, // idx 22
    { complaintCode: 'HRN03', question: 'गांठ पर तेज दर्द है और उसके ऊपर की त्वचा लाल-गर्म है?', questionEn: 'Severe pain over the lump with red, warm overlying skin?' }, // idx 23
    // HRN04 Incisional scar lump
    { complaintCode: 'HRN04', question: 'पुराने ऑपरेशन के निशान पर गांठ खांसने/शक्ति लगाने पर बढ़ती है?', questionEn: 'Does the scar-area bulge increase on coughing or straining?' }, // idx 24
    { complaintCode: 'HRN04', question: 'गांठ लेटने पर घट जाती है या दर्द/खिंचाव रहता है?', questionEn: 'Does it reduce on lying down, or is there persistent pain/tugging?' }, // idx 25
    // ABD01 Appendicitis screen
    { complaintCode: 'ABD01', question: 'दर्द नाभि के चारों ओर शुरू होकर दाहिने निचले पेट में जमा है?', questionEn: 'Did the pain start around the umbilicus and shift to the right lower abdomen?' }, // idx 26
    { complaintCode: 'ABD01', question: 'दर्द के साथ उल्टी, भूख बिल्कुल न लगना या हल्का बुखार है?', questionEn: 'Is there vomiting, complete loss of appetite or mild fever?' }, // idx 27
    { complaintCode: 'ABD01', question: 'हिलने-चलने, खांसने या सड़क के झटके से दर्द बढ़ता है?', questionEn: 'Does the pain worsen with movement, coughing or road jolts?' }, // idx 28
    // ABD02 Gallstone colic
    { complaintCode: 'ABD02', question: 'दर्द तला/चिकनाई वाले खाने के 1-2 घंटे बाद आता है?', questionEn: 'Does the pain come 1-2 hours after fried or fatty meals?' }, // idx 29
    { complaintCode: 'ABD02', question: 'दर्द दाहिने ऊपरी पेट से कंधे या पीठ की तरफ जाता है?', questionEn: 'Does the pain radiate from the right upper abdomen to the shoulder or back?' }, // idx 30
    // ABD03 Obstruction screen
    { complaintCode: 'ABD03', question: 'पेट फूला हुआ है और गैस/मल पूरी तरह नहीं निकल रहा?', questionEn: 'Is the abdomen distended with no flatus or stool at all?' }, // idx 31
    { complaintCode: 'ABD03', question: 'उल्टी बार-बार हो रही है — पीली/हरी या बदबूदार?', questionEn: 'Is there repeated vomiting — green/bilious or foul-smelling?' }, // idx 32
    // ABD04 Renal colic
    { complaintCode: 'ABD04', question: 'दर्द कमर (बगल) से शुरू होकर नीचे पेट/जांघ की तरफ लहर की तरह जाता है?', questionEn: 'Does the pain start in the loin and radiate in waves to the lower abdomen/groin?' }, // idx 33
    { complaintCode: 'ABD04', question: 'पेशाब में जलन, बार-बार पेशाब या खून आना?', questionEn: 'Any burning, frequency or blood while passing urine?' }, // idx 34
    // ABD05 Chronic constipation
    { complaintCode: 'ABD05', question: 'कब्ज कितने समय से है — हफ्तों/महीनों? दवा या घरेलू उपाय से राहत मिलती है?', questionEn: 'Duration of constipation — weeks/months? Relief with medicines or home measures?' }, // idx 35
    { complaintCode: 'ABD05', question: 'मल में खून आया है या वजन घटा है?', questionEn: 'Any blood in stool or weight loss?' }, // idx 36
    // ABD06 Dysphagia
    { complaintCode: 'ABD06', question: 'ठोस खाना निगलने में ज्यादा दिक्कत है या तरल (पानी) में भी?', questionEn: 'Is swallowing harder for solids, or even for liquids?' }, // idx 37
    { complaintCode: 'ABD06', question: 'वजन घटा है? खाना छाती में अटकने जैसा लगता है?', questionEn: 'Any weight loss? Feeling of food sticking in the chest?' }, // idx 38
    // ABD07 Abdominal mass
    { complaintCode: 'ABD07', question: 'पेट की गांठ किस तरफ महसूस होती है — दर्द भी साथ है?', questionEn: 'Which side is the abdominal lump felt — is it painful too?' }, // idx 39
    { complaintCode: 'ABD07', question: 'वजन घटा है या काला मल आया है?', questionEn: 'Any weight loss or black stools?' }, // idx 40
    // ABD08 Dyspepsia
    { complaintCode: 'ABD08', question: 'खाने के बाद भारीपन के साथ जलन या खट्टी डकार भी है?', questionEn: 'Is the post-meal heaviness accompanied by heartburn or sour belching?' }, // idx 41
    { complaintCode: 'ABD08', question: 'पेट की कोई पुरानी सर्जरी या पथरी की जांच हुई है?', questionEn: 'Any previous abdominal surgery or known stones?' }, // idx 42
    // ABD09 Jaundice
    { complaintCode: 'ABD09', question: 'पीलिया कितने दिनों से है — दर्द के साथ या बिना दर्द के?', questionEn: 'Duration of jaundice — with pain or painless?' }, // idx 43
    { complaintCode: 'ABD09', question: 'पेशाब गहरा पीला, बुखार या तेज खुजली है?', questionEn: 'Dark urine, fever or severe itching?' }, // idx 44
    // ABD10 GI bleed emergency
    { complaintCode: 'ABD10', question: 'मल काला/काले पानी जैसा आया है? चक्कर या बहुत कमजोरी है?', questionEn: 'Are the stools black/tarry? Any giddiness or severe weakness?' }, // idx 45
    { complaintCode: 'ABD10', question: 'उल्टी में खून या कॉफी-मिट्टी जैसा रंग आया है?', questionEn: 'Has there been blood or coffee-ground coloured vomitus?' }, // idx 46
    { complaintCode: 'ABD10', question: 'दर्द-बुखार की गोलियां (NSAID) या शराब नियमित लेते हैं?', questionEn: 'Do you regularly take pain medicines (NSAIDs) or alcohol?' }, // idx 47
    // ANR01 Piles with bleeding
    { complaintCode: 'ANR01', question: 'मल में खून कैसे आता है — छींटों में, मल की सतह पर या मल में मिला हुआ?', questionEn: 'How does the blood come — spurts, on the stool surface or mixed with it?' }, // idx 48
    { complaintCode: 'ANR01', question: 'मल त्याग के बाद कुछ बाहर निकलता है — अपने आप अंदर चला जाता है या हाथ से धकेलना पड़ता है?', questionEn: 'Does something come out after stool — reduces on its own or needs manual pushing?' }, // idx 49
    // ANR02 Fissure
    { complaintCode: 'ANR02', question: 'दर्द मल त्याग के दौरान बहुत तेज है और बाद में घंटों जलता रहता है?', questionEn: 'Is the pain severe during defecation and burns for hours afterwards?' }, // idx 50
    { complaintCode: 'ANR02', question: 'मल कठोर आता है या कब्ज रहती है?', questionEn: 'Are the stools hard or is there constipation?' }, // idx 51
    // ANR03 Fistula
    { complaintCode: 'ANR03', question: 'गुदा के पास से मवाद कितने महीनों से बार-बार निकलता है?', questionEn: 'Since how many months is the recurrent perianal discharge?' }, // idx 52
    { complaintCode: 'ANR03', question: 'मवाद के साथ दर्द, सूजन या बुखार के दौरे आते हैं?', questionEn: 'Are there episodes of pain, swelling or fever along with the discharge?' }, // idx 53
    // ANR04 Perianal abscess
    { complaintCode: 'ANR04', question: 'गुदा के पास दर्दनाक सूजन कितने दिन से है — बैठने में दिक्कत है?', questionEn: 'Duration of the painful perianal swelling — difficulty while sitting?' }, // idx 54
    { complaintCode: 'ANR04', question: 'बुखार या कंपकपी (ठंड लगना) भी है?', questionEn: 'Any fever or chills?' }, // idx 55
    // ANR05 Anal itching
    { complaintCode: 'ANR05', question: 'खुजली रात में ज्यादा होती है?', questionEn: 'Is the itching worse at night?' }, // idx 56
    { complaintCode: 'ANR05', question: 'खुजली मल त्याग के बाद या पसीने से बढ़ती है? सफाई पर ध्यान देते हैं?', questionEn: 'Does itching worsen after stool or with sweat? Is hygiene maintained?' }, // idx 57
    // ANR06 Prolapse
    { complaintCode: 'ANR06', question: 'बाहर आया हुआ मांस अपने आप अंदर चला जाता है, हाथ से धकेलना पड़ता है, या बाहर ही रहता है?', questionEn: 'Does the prolapsed tissue reduce spontaneously, need manual reduction or stay prolapsed?' }, // idx 58
    { complaintCode: 'ANR06', question: 'खून आना बार-बार होता है या दर्द भी साथ है?', questionEn: 'Is the bleeding recurrent, or is there pain as well?' }, // idx 59
    // ANR07 Skin tags / warts
    { complaintCode: 'ANR07', question: 'मस्से बढ़ रहे हैं, दर्द/खून से दिक्कत है, या सफाई में बाधा डालते हैं?', questionEn: 'Are the tags/warts growing, painful/bleeding or hindering hygiene?' }, // idx 60
    { complaintCode: 'ANR07', question: 'पहले कोई इलाज कराया है (जलाना/क्रीम)? दोबारा आ गए?', questionEn: 'Any prior treatment (cautery/cream)? Did they recur?' }, // idx 61
    // VIN01 Varicose veins
    { complaintCode: 'VIN01', question: 'नसें कितने सालों से दिख रही हैं — दर्द, सूजन या खिंचाव भी है?', questionEn: 'Since how many years are the veins visible — any pain, swelling or aching?' }, // idx 62
    { complaintCode: 'VIN01', question: 'टखने के आसपास दाग/कालापन है या कभी घाव बना है?', questionEn: 'Any discoloration around the ankle or a previous ulcer?' }, // idx 63
    // VIN02 Leg swelling
    { complaintCode: 'VIN02', question: 'सूजन शाम को बढ़ती है और सुबह कम रहती है?', questionEn: 'Does the swelling worsen by evening and reduce by morning?' }, // idx 64
    { complaintCode: 'VIN02', question: 'सूजन सिर्फ एक पैर में है और अचानक दर्द के साथ शुरू हुई?', questionEn: 'Is the swelling one-sided with sudden painful onset?' }, // idx 65
    // VIN03 Phimosis
    { complaintCode: 'VIN03', question: 'त्वचा पीछे नहीं खुलती — कितने समय से? दर्द या सूजन है?', questionEn: 'Since when does the foreskin not retract? Any pain or swelling?' }, // idx 66
    { complaintCode: 'VIN03', question: 'पेशाब की धार में दिक्कत या बार-बार लालिमा/संक्रमण होता है?', questionEn: 'Any urinary stream difficulty or recurrent redness/infection?' }, // idx 67
    // VIN04 Thrombophlebitis
    { complaintCode: 'VIN04', question: 'नस की लाल रेखा/गांठ दबाने पर दर्दनाक है?', questionEn: 'Is the red cord/nodule along the vein tender on pressing?' }, // idx 68
    { complaintCode: 'VIN04', question: 'साथ में बुखार या पूरे पैर की तेज सूजन है?', questionEn: 'Any fever or severe swelling of the whole leg?' }, // idx 69
    // VIN05 Claudication
    { complaintCode: 'VIN05', question: 'कितनी दूर चलने पर पिंडली/पैर में दर्द शुरू होता है?', questionEn: 'After how much walking does the calf/foot pain start?' }, // idx 70
    { complaintCode: 'VIN05', question: 'दर्द खड़े होकर आराम करने से ठीक हो जाता है? पैर ठंडा लगता है?', questionEn: 'Is the pain relieved by standing rest? Does the foot feel cold?' }, // idx 71
    // WND01 Non-healing wound
    { complaintCode: 'WND01', question: 'घाव कितने हफ्तों से है और आकार में कितना बड़ा है?', questionEn: 'How many weeks old is the wound and how big is it?' }, // idx 72
    { complaintCode: 'WND01', question: 'शुगर की बीमारी है या दवा चल रही है? धूम्रपान करते हैं?', questionEn: 'Do you have diabetes or are on treatment? Do you smoke?' }, // idx 73
    // WND02 Pus from wound
    { complaintCode: 'WND02', question: 'मवाद का रंग/बदबू कैसी है और घाव के आसपास लालिमा बढ़ी है?', questionEn: 'What is the colour/smell of the pus, and has surrounding redness increased?' }, // idx 74
    { complaintCode: 'WND02', question: 'बुखार है या दर्द/सूजन बढ़ी है?', questionEn: 'Any fever or increased pain/swelling?' }, // idx 75
    // WND03 Dressing query
    { complaintCode: 'WND03', question: 'घाव कैसा है — साफ और सूखता हुआ या मवादी/गीला?', questionEn: 'How is the wound — clean and drying, or discharging/wet?' }, // idx 76
    { complaintCode: 'WND03', question: 'पट्टी घर पर बदलते हैं या क्लिनिक/अस्पताल से कराते हैं?', questionEn: 'Do you change the dressing at home or get it done at a clinic/hospital?' }, // idx 77
    // WND04 Post-op follow-up
    { complaintCode: 'WND04', question: 'कौन सी सर्जरी हुई और कब हुई थी?', questionEn: 'What surgery was done and when?' }, // idx 78
    { complaintCode: 'WND04', question: 'अभी कोई दर्द, बुखार या घाव से दिक्कत है?', questionEn: 'Any pain, fever or wound problem currently?' }, // idx 79
    // WND05 Suture removal
    { complaintCode: 'WND05', question: 'सिलाई कब लगाई गई थी — कितने दिन पहले?', questionEn: 'When were the sutures placed — how many days ago?' }, // idx 80
    { complaintCode: 'WND05', question: 'घाव की जगह लाल, मवादी या खुली हुई तो नहीं?', questionEn: 'Is the wound site red, discharging or open?' }, // idx 81
    // WND06 Post-op pain
    { complaintCode: 'WND06', question: 'दर्द कितना है और कौन सी दवा चल रही है?', questionEn: 'How severe is the pain and what medicines are you currently on?' }, // idx 82
    { complaintCode: 'WND06', question: 'दर्द घाव की जगह है या पेट के अंदर गहरा है?', questionEn: 'Is the pain at the wound site or deep inside the abdomen?' }, // idx 83
    // WND07 Scar pain
    { complaintCode: 'WND07', question: 'निशान पर दर्द/खुजली के साथ कोई गांठ भी उभरती है?', questionEn: 'Along with the scar pain/itch, does any bulge also appear?' }, // idx 84
    { complaintCode: 'WND07', question: 'ऑपरेशन कितने समय पहले हुआ था? दिक्कत बढ़ रही है?', questionEn: 'How long ago was the surgery? Is the problem increasing?' }, // idx 85
    // WND08 Abscess/boil
    { complaintCode: 'WND08', question: 'फोड़ा कितने दिन से है — ऊपर सिर (पीला बिंदु) दिखता है या गहरा दर्द है?', questionEn: 'Duration of the abscess — is there a pointing head or deep pain?' }, // idx 86
    { complaintCode: 'WND08', question: 'बुखार है या शुगर की बीमारी है?', questionEn: 'Any fever or diabetes?' }, // idx 87
    // WND09 Fresh wound
    { complaintCode: 'WND09', question: 'चोट कैसे और कब लगी? खून कितना बहा था?', questionEn: 'How and when did the injury occur? How much bleeding was there?' }, // idx 88
    { complaintCode: 'WND09', question: 'घाव में गंदगी/मिट्टी/जंग लगी थी? टिटेनस का टीका लिया है?', questionEn: 'Was the wound contaminated with dirt/rust? Have you had a tetanus injection?' }, // idx 89
    // WND10 Post-op fever
    { complaintCode: 'WND10', question: 'बुखार कब से है और घाव की जगह दर्द है?', questionEn: 'Since when is the fever, and is the wound site painful?' }, // idx 90
    { complaintCode: 'WND10', question: 'घाव कैसा है? सांस या पेशाब में दिक्कत तो नहीं?', questionEn: 'How is the wound? Any chest or urinary symptoms?' }, // idx 91
  ],

  // ══ Suggestions (184 — 2 per question; questionIndex = idx above) ═══
  suggestions: [
    // LMP01 q0-q1 (lipoma)
    { questionIndex: 0, text: 'नरम-चलती गांठ, बहुत धीमी गति — लिपोमा संभव; लक्षण (दर्द/कॉस्मेटिक) हों तो निकालने की योजना', textEn: 'Soft mobile slow-growing lump — likely lipoma; plan excision if symptomatic/cosmetic' },
    { questionIndex: 0, text: 'तेजी से बढ़ती गांठ — USG कराएं; निकालकर जांच (बायोप्सी) करानी चाहिए', textEn: 'Rapidly growing lump — get USG; excision-biopsy advised' },
    { questionIndex: 1, text: 'दर्द रहित, नरम, खिसकती गांठ — चिंता कम; आकार 6 महीने में एक बार नापते रहें', textEn: 'Painless soft mobile lump — low concern; remeasure every 6 months' },
    { questionIndex: 1, text: 'सख्त, अचल या दर्दनाक गांठ — डॉक्टर परीक्षण आज; जरूरत पर USG/बायोप्सी', textEn: 'Hard, fixed or tender lump — doctor examination today; USG/biopsy if needed' },
    // LMP02 q2-q3 (sebaceous cyst)
    { questionIndex: 2, text: 'काला बिंदु/दूधिया स्राव — सेबेसियस सिस्ट; पूरा निकालना ही स्थायी इलाज, फोड़ने से वापसी होती है', textEn: 'Black dot/cheesy discharge — sebaceous cyst; complete excision is definitive, squeezing causes recurrence' },
    { questionIndex: 2, text: 'स्राव नहीं — अन्य गांठ; USG से पहचान कराएं', textEn: 'No discharge — other lump; identify with USG' },
    { questionIndex: 3, text: 'लाल-दर्दनाक हो गई — संक्रमित सिस्ट: गरम सेक + एंटीबायोटिक; शांत होने पर पूरी निकासी कराएं', textEn: 'Red painful episode — infected cyst: warm compress + antibiotic; complete excision after settling' },
    { questionIndex: 3, text: 'कभी सूजन नहीं — चाहें तो डे-केयर छोटी सर्जरी से निकाल लें', textEn: 'Never inflamed — day-care excision if desired' },
    // LMP03 q4-q6 (breast lump)
    { questionIndex: 4, text: 'नई गांठ — स्तन परीक्षण जरूरी; माहवारी खत्म होने के बाद आना ठीक; USG अवश्य कराएं', textEn: 'New lump — breast examination required; visit after period ends preferred; USG mandatory' },
    { questionIndex: 4, text: 'लंबे समय से वैसी ही गांठ — फिर भी एक बार USG/जांच जरूरी; निगरानी रिपोर्ट से तय करें', textEn: 'Long-standing static lump — still one USG needed; surveillance per report' },
    { questionIndex: 5, text: 'नरम-चलती गांठ युवा उम्र में — फाइब्रोएडीनोमा संभव; USG + ट्रिपल असेसमेंट कराएं', textEn: 'Soft mobile lump in young woman — likely fibroadenoma; USG + triple assessment' },
    { questionIndex: 5, text: 'सख्त/अचल गांठ (खासकर 40+ उम्र) — मैमोग्राम + बायोप्सी जरूरी — ट्रिपल असेसमेंट रेफरल', textEn: 'Hard/fixed lump (esp. age 40+) — mammogram + biopsy needed — triple assessment referral' },
    { questionIndex: 6, text: 'निपल खिंचाव, त्वचा में गड्ढा या स्राव — कैंसर के चेतावनी संकेत; स्तन सर्जन के पास जल्द से जल्द जाएं', textEn: 'Nipple retraction, skin dimpling or discharge — cancer warning signs; see a breast surgeon soon' },
    { questionIndex: 6, text: 'ये संकेत नहीं हैं — फिर भी गांठ की जांच पूरी कराएं, अधूरा न छोड़ें', textEn: 'These signs absent — still complete the lump workup, do not leave it half-done' },
    // LMP04 q7-q8 (breast pain)
    { questionIndex: 7, text: 'माहवारी से बदलता दर्द — हार्मोनल (फाइब्रोसिस्टिक), आम; सही फिटिंग वाली ब्रा, कैफीन/चाय-कॉफी कम', textEn: 'Cyclical pain — hormonal (fibrocystic), common; well-fitting bra, reduce caffeine' },
    { questionIndex: 7, text: 'चक्र से असंबद्ध एकतरफा दर्द — परीक्षण + USG कराएं; गांठ न रहे तो आराम के उपाय', textEn: 'Non-cyclical one-sided pain — examination + USG; if no lump, symptomatic care' },
    { questionIndex: 8, text: 'स्पष्ट गांठ मिलती है — USG कराएं; युवा महिलाओं में फाइब्रोएडीनोमा आम है', textEn: 'Distinct lump palpable — get USG; fibroadenoma is common in young women' },
    { questionIndex: 8, text: 'गांठ नहीं, दर्द फैला हुआ — विटामिन E/सहायक उपाय; 2 महीने में समीक्षा कराएं', textEn: 'No lump, diffuse pain — vitamin E/supportive care; review in 2 months' },
    // LMP05 q9-q10 (nipple discharge)
    { questionIndex: 9, text: 'दूध जैसा स्राव दोनों स्तनों से — दवा/हार्मोन कारण संभव; चल रही दवाएं डॉक्टर से समीक्षा कराएं', textEn: 'Milky discharge from both breasts — medicine/hormonal cause possible; medicine review' },
    { questionIndex: 9, text: 'खून मिला या पानीदार स्राव एक स्तन से — गंभीर; जांच (USG + स्राव परीक्षण) जल्दी कराएं', textEn: 'Blood-stained or watery discharge from one breast — concerning; get USG + discharge testing soon' },
    { questionIndex: 10, text: 'दवा चल रही है — दवा बदलने/रोकने से स्राव अकसर रुक जाता है; डॉक्टर से पूछे बिना न रोकें', textEn: 'On medicines — discharge often stops with medicine change; do not stop without doctor advice' },
    { questionIndex: 10, text: 'कोई दवा नहीं — प्रोलैक्टिन जांच + स्तन परीक्षण कराएं', textEn: 'No medicines — get serum prolactin + breast examination' },
    // LMP06 q11-q12 (thyroid)
    { questionIndex: 11, text: 'निगलने पर खिसकती सूजन — थायरॉइड; TFT (थायरॉइड टेस्ट) + गर्दन USG कराएं', textEn: 'Swelling moving on swallowing — thyroid; TFT + neck USG' },
    { questionIndex: 11, text: 'नहीं खिसकती — अन्य गांठ; USG से स्पष्टीकरण जरूरी', textEn: 'Does not move — other mass; USG clarification needed' },
    { questionIndex: 12, text: 'वजन घटना/तेज धड़कन — थायरॉइड की कार्यक्षमता जांच (TFT) आवश्यक; रिपोर्ट से इलाज', textEn: 'Weight loss/palpitations — thyroid function test (TFT) mandatory; treat per report' },
    { questionIndex: 12, text: 'ये लक्षण नहीं — फिर भी एक बार TFT करा लें; गर्दन की गांठ नापते रहें', textEn: 'No such symptoms — still do TFT once; keep measuring the swelling' },
    // LMP07 q13-q14 (neck node)
    { questionIndex: 13, text: 'हफ्तों से वैसी ही गांठ — निगरानी; 4-6 हफ्ते से ज्यादा रहे तो USG कराएं', textEn: 'Node stable for weeks — observe; USG if persists beyond 4-6 weeks' },
    { questionIndex: 13, text: 'बढ़ती गांठ — USG ± FNAC (सुई जांच) कराएं; इलाज रिपोर्ट से', textEn: 'Growing node — USG ± FNAC (needle test); treatment per report' },
    { questionIndex: 14, text: 'रात का पसीना/बुखार/वजन घटना — गंभीर कारण (TB/लिम्फोमा) जांच जरूरी — FNAC जल्दी कराएं', textEn: 'Night sweats/fever/weight loss — serious causes (TB/lymphoma) — get FNAC early' },
    { questionIndex: 14, text: 'ये लक्षण नहीं — गले के संक्रमण के बाद की गांठ संभव; निगरानी पर्याप्त', textEn: 'No such symptoms — post-throat-infection node likely; observation suffices' },
    // LMP08 q15-q16 (hydrocele)
    { questionIndex: 15, text: 'दिन भर रहने वाली दर्द रहित सूजन — हाइड्रोसील संभव; परीक्षण + स्क्रोटम USG कराएं', textEn: 'Day-long painless swelling — likely hydrocele; examination + scrotal USG' },
    { questionIndex: 15, text: 'सुबह/लेटने पर घटती — नस की गांठ (वैरिकोसील) सोचें; खड़े होकर परीक्षण जरूरी', textEn: 'Reduces by morning/on lying — consider varicocele; standing examination needed' },
    { questionIndex: 16, text: 'खांसने पर बढ़ती सूजन — हर्निया की ओर इशारा; सर्जिकल जांच कराएं', textEn: 'Swelling increases on cough — points to hernia; surgical evaluation' },
    { questionIndex: 16, text: 'खांसी से कोई फर्क नहीं — हाइड्रोसील की संभावना अधिक; USG से पुष्टि', textEn: 'No change with cough — hydrocele more likely; confirm with USG' },
    // HRN01 q17-q18 (groin hernia)
    { questionIndex: 17, text: 'लेटने पर घटने वाली गांठ — कमी-योग्य हर्निया; इलेक्टिव ऑपरेशन की योजना बनाएं — पट्टी/बेल्ट स्थायी इलाज नहीं', textEn: 'Lump reduces on lying — reducible hernia; plan elective repair — belt/truss is not a cure' },
    { questionIndex: 17, text: 'लेटने पर नहीं घटती — दर्द/उल्टी हो तो आज ही अस्पताल जाएं; बिना लक्षण हों तो जल्दी सर्जिकल जांच', textEn: 'Does not reduce — hospital TODAY if pain/vomiting; else early surgical review' },
    { questionIndex: 18, text: 'खड़े काम के बाद खिंचाव/भारीपन — हर्निया का आम लक्षण; भारी वजन उठाना और उठापोकठ बंद करें', textEn: 'Tugging/heaviness after standing work — typical hernia symptom; stop heavy lifting and straining' },
    { questionIndex: 18, text: 'बार-बार तेज दर्द के दौरे — रुकावट का खतरा; देर न करें — जांच कराएं', textEn: 'Recurrent severe pain episodes — obstruction risk; do not delay — get examined' },
    // HRN02 q19-q20 (umbilical hernia)
    { questionIndex: 19, text: 'दबाने पर घटती नाभि गांठ — नाभि हर्निया; वजन घटाएं, उठापोकठ से बचें; मरम्मत (रिपेयर) के विकल्प पर बात करें', textEn: 'Umbilical bulge reducing on pressure — umbilical hernia; lose weight, avoid straining; discuss repair' },
    { questionIndex: 19, text: 'नहीं घटती या दर्दनाक — सर्जिकल जांच आवश्यक; दर्द + उल्टी हो तो आज ही अस्पताल', textEn: 'Irreducible or painful — surgical evaluation needed; pain + vomiting = hospital today' },
    { questionIndex: 20, text: 'खांसी से गांठ बढ़ना — हर्निया का जीवित प्रमाण; ऑपरेशन ही स्थायी इलाज — टालते रहने से आपातकाल बनता है', textEn: 'Bulge enlarging on cough — confirmatory hernia sign; surgery is the only cure — delay turns it into an emergency' },
    { questionIndex: 20, text: 'खांसी से कोई बदलाव नहीं — चर्बी की गांठ (लिपोमा ऑफ द नाभि) संभव — USG कराएं', textEn: 'No change with cough — umbilical fat lump (lipoma) possible — get USG' },
    // HRN03 q21-q23 (strangulation EMERGENCY)
    { questionIndex: 21, text: 'अब न घटने वाली गांठ — रुद्ध (इनकार्सरेटेड) हर्निया का संकेत — आज ही अस्पताल जाएं, कुछ खाना-पीना बंद', textEn: 'Lump no longer reducible — incarcerated hernia — go to hospital TODAY, nil by mouth' },
    { questionIndex: 21, text: 'थोड़ी घटती है पर दर्दनाक — 24 घंटे के भीतर सर्जिकल जांच; उल्टी जुड़े तो तुरंत इमरजेंसी', textEn: 'Partially reduces but painful — surgical review within 24h; emergency immediately if vomiting' },
    { questionIndex: 22, text: 'उल्टी + पेट फूलना + मल/गैस रुकना — आंत में रुकावट — आज ही सबसे बड़े अस्पताल जाएं — कुछ न खाएं, स्वयं दवा न लें', textEn: 'Vomiting + distension + stopped stools/flatus — intestinal obstruction — biggest hospital TODAY — nil by mouth, no self-medication' },
    { questionIndex: 22, text: 'ये लक्षण नहीं — नियमित निगरानी; कभी भी लक्षण आएं तो तुरंत लौटें', textEn: 'These absent — routine monitoring; return immediately if they ever appear' },
    { questionIndex: 23, text: 'गांठ की त्वचा लाल-गर्म + तेज दर्द — रुद्ध/शोथ (strangulation) का बड़ा खतरा — एम्बुलेंस (108) से आज ही — देर आंत को नुकसान पहुंचाती है', textEn: 'Red hot skin + severe pain — strangulation risk — ambulance (108) TODAY — delay kills bowel' },
    { questionIndex: 23, text: 'त्वचा सामान्य — फिर भी दर्दनाक न-घटने वाली गांठ आज ही दिखाना जरूरी है', textEn: 'Skin normal — a painful irreducible lump still needs same-day review' },
    // HRN04 q24-q25 (incisional hernia)
    { questionIndex: 24, text: 'निशान पर खांसी से बढ़ती गांठ — इंसिजनल हर्निया; USG/परीक्षण से पुष्टि, मरम्मत की योजना बनाएं', textEn: 'Scar bulge increasing on cough — incisional hernia; confirm with USG/exam, plan repair' },
    { questionIndex: 24, text: 'खांसी से नहीं बढ़ती — सिलाई की गांठ/चर्बी संभव — USG से स्पष्ट करें', textEn: 'Not increasing on cough — suture knot/fat lump possible — clarify with USG' },
    { questionIndex: 25, text: 'लेटने पर घटती — कमी-योग्य; उठापोकठ बंद; बेल्ट सिर्फ अस्थायी सहारा है — इलाज नहीं', textEn: 'Reduces on lying — reducible; no straining; belt is only temporary support — not a cure' },
    { questionIndex: 25, text: 'नहीं घटती या दर्दनाक — रुकावट का खतरा — आज ही अस्पताल जाएं', textEn: 'Irreducible or painful — obstruction risk — go to hospital TODAY' },
    // ABD01 q26-q28 (appendicitis EMERGENCY screen)
    { questionIndex: 26, text: 'नाभि के चारों ओर से शुरू होकर दाहिने निचले पेट में जाना — अपेंडिसाइटिस का क्लासिक चित्र — आज ही सर्जरी वाले अस्पताल जाएं', textEn: 'Periumbilical pain shifting to right lower abdomen — classic appendicitis — surgical hospital TODAY' },
    { questionIndex: 26, text: 'एक ही जगह से शुरू और रुक-रुक कर — अन्य कारण संभव; USG कराएं, दर्द बढ़े तो तुरंत', textEn: 'Fixed-onset intermittent pain — other causes possible; get USG; immediately if worsening' },
    { questionIndex: 27, text: 'उल्टी + भूख बिल्कुल न लगना + हल्का बुखार — अपेंडिसाइटिस पक्ष में — आज ही अस्पताल; खुद से दर्द की गोली न लें (तस्वीर छुपती है)', textEn: 'Vomiting + anorexia + low fever — favours appendicitis — hospital TODAY; no self-analgesia (masks the picture)' },
    { questionIndex: 27, text: 'ये नहीं — आंत की ऐंठन संभव; 24 घंटे में ठीक न हो या बढ़े तो दोबारा आज ही', textEn: 'Absent — mesenteric colic possible; if not settling or worsening in 24h, return today' },
    { questionIndex: 28, text: 'हिलने-चलने/झटके से दर्द बढ़ना — पेट की परत में जलन (पेरिटोनिटिस जैसा) — आज ही अस्पताल', textEn: 'Movement/jolt-worsening pain — peritoneal irritation — hospital TODAY' },
    { questionIndex: 28, text: 'हिलने से कोई फर्क नहीं — फिर भी 24 घंटे निगरानी; बुखार/उल्टी आएं तो तुरंत', textEn: 'No movement correlation — still monitor 24h; immediately if fever/vomiting appear' },
    // ABD02 q29-q30 (gallstone)
    { questionIndex: 29, text: 'तला/चिकनाई के बाद दर्द — पित्त पथरी (बाइलिरी कोलिक); तला-चिकनाई पूरी तरह बंद; USG पेट कराएं', textEn: 'Post-fatty-meal pain — gallstone colic; stop fried/fatty food completely; get USG abdomen' },
    { questionIndex: 29, text: 'खाने से कोई संबंध नहीं — अन्य कारण; USG व LFT जांच कराएं', textEn: 'No meal relation — other causes; get USG and LFT' },
    { questionIndex: 30, text: 'कंधे/पीठ की तरफ जाना — पित्ताशय का खास दर्द; रिपोर्ट के साथ ऑपरेशन (कोलिसिस्टेक्टोमी) की योजना पर बात करें', textEn: 'Radiation to shoulder/back — gallbladder-typical pain; discuss cholecystectomy plan with report' },
    { questionIndex: 30, text: 'सिर्फ पेट पर रहता है — गैस/यकृत क्षेत्र की जांच कराएं', textEn: 'Stays localized — work up gastritis/liver area' },
    // ABD03 q31-q32 (obstruction EMERGENCY)
    { questionIndex: 31, text: 'गैस/मल पूरी तरह रुकना — आंत में रुकावट — आज ही अस्पताल; कुछ न खाएं-पिएं; जुलाब/एंटीबायोटिक खुद से बिल्कुल नहीं', textEn: 'Absolute stoppage of flatus/stool — bowel obstruction — hospital TODAY; nil by mouth; NO self-laxatives/antibiotics' },
    { questionIndex: 31, text: 'गैस निकल रही है — पूर्ण रुकावट नहीं — फिर भी बार-बार उल्टी/तेज दर्द हो तो आज ही जांच', textEn: 'Flatus passing — not complete obstruction — but repeated vomiting/severe pain = same-day review' },
    { questionIndex: 32, text: 'हरी/बदबूदार उल्टी — रुकावट का पुख्ता संकेत — इमरजेंसी अस्पताल आज ही — रास्ते में भी कुछ न खाएं', textEn: 'Green/foul vomiting — confirmed obstruction sign — emergency hospital TODAY — nil by mouth en route too' },
    { questionIndex: 32, text: 'साधारण उल्टी — गैस/खाना से संबंध संभव; ORS + हल्का आहार; बनी रहे तो जांच', textEn: 'Ordinary vomiting — gastritis/food-related; ORS + light diet; workup if persists' },
    // ABD04 q33-q34 (renal colic)
    { questionIndex: 33, text: 'कमर से जांघ तक लहरदार दर्द — मूत्र पथरी कॉलिक; USG-KUB + यूरिन जांच कराएं; पानी 2-3 लीटर/दिन', textEn: 'Loin-to-groin wavy pain — urinary stone colic; USG-KUB + urine test; drink 2-3 L water daily' },
    { questionIndex: 33, text: 'स्थिर दर्द, लहर नहीं — अन्य कारण; USG पेट फिर भी कराएं', textEn: 'Fixed pain without waves — other cause; still get USG abdomen' },
    { questionIndex: 34, text: 'जलन/खून पेशाब में — पथरी + संक्रमण संभव; यूरिन टेस्ट आज; बुखार जुड़े तो तुरंत अस्पताल (संक्रमण फैलने का खतरा)', textEn: 'Burning/blood in urine — stone + infection possible; urine test today; fever = hospital urgently (sepsis risk)' },
    { questionIndex: 34, text: 'पेशाब सामान्य — गुर्दा दर्द फिर भी जांच लें; पानी भरपूर पिएं, गुर्दे की पथरी रोकने में मदद', textEn: 'Urine normal — still work up renal pain; plenty of water helps prevent stones' },
    // ABD05 q35-q36 (constipation)
    { questionIndex: 35, text: 'महीनों की कब्ज — आहार-पानी सुधार + अल्पकालिक जुलाब; बनी रहे तो कोलोनोस्कोपी सोचें', textEn: 'Months of constipation — diet/water correction + short laxative course; consider colonoscopy if persists' },
    { questionIndex: 35, text: 'हाल की कब्ज — फाइबर (सलाद/फल/इसबगोल) + 3 लीटर पानी; 2 हफ्ते में समीक्षा', textEn: 'Recent constipation — fiber (salad/fruit/isabgol) + 3 L water; review in 2 weeks' },
    { questionIndex: 36, text: 'मल में खून या वजन घटना — बड़ी आंत की गंभीर बीमारी (कैंसर) निकालने की जांच जरूरी — कोलोनोस्कोपी रेफरल', textEn: 'Blood in stool or weight loss — colorectal cancer must be excluded — colonoscopy referral' },
    { questionIndex: 36, text: 'दोनों नहीं — कब्ज का इलाज जारी रखें; हर 2 हफ्ते समीक्षा कराते रहें', textEn: 'Neither — continue constipation care; review every 2 weeks' },
    // ABD06 q37-q38 (dysphagia red flag)
    { questionIndex: 37, text: 'ठोस में ज्यादा, तरल ठीक — रास्ते में आंशिक रुकावट संभव — एंडोस्कोपी कराएं', textEn: 'Solids worse, liquids fine — partial obstruction likely — get endoscopy' },
    { questionIndex: 37, text: 'तरल में भी अटकना — गंभीर रुकावट; GI/एंडोस्कोपी रेफरल जल्दी कराएं', textEn: 'Even liquids stick — advanced obstruction; urgent GI/endoscopy referral' },
    { questionIndex: 38, text: 'वजन घटना + अटकने का एहसास — निगलने के रास्ते की गंभीर बीमारी (कैंसर) का लाल संकेत — एंडोस्कोपी रेफरल जल्द से जल्द', textEn: 'Weight loss + food-sticking — red flag for esophageal cancer — urgent endoscopy referral' },
    { questionIndex: 38, text: 'वजन स्थिर — रिफ्लक्स/संकुचन संभव; PPI कोर्स; 4 हफ्ते में बदलाव न हो तो एंडोस्कोपी', textEn: 'Weight stable — reflux/stricture possible; PPI course; endoscopy if no change in 4 weeks' },
    // ABD07 q39-q40 (abdominal mass)
    { questionIndex: 39, text: 'पेट की स्थिर गांठ — USG/CT पेट जरूरी; उम्र 50+ हो या दर्द हो तो जल्दी करें', textEn: 'Persistent abdominal lump — USG/CT abdomen needed; urgent if age 50+ or painful' },
    { questionIndex: 39, text: 'दर्द के साथ बदलती "गांठ" — मल से भरी आंत (कब्ज) संभव — पहले कब्ज का इलाज', textEn: 'Lump varying with pain — stool-loaded colon possible — treat constipation first' },
    { questionIndex: 40, text: 'वजन घटना/काला मल — गंभीर बीमारी जांच (कैंसर निकालना) — CT + कोलोनोस्कोपी रेफरल', textEn: 'Weight loss/melena — serious pathology workup (cancer exclusion) — CT + colonoscopy referral' },
    { questionIndex: 40, text: 'दोनों नहीं — USG से गांठ की प्रकृति देखें; आगे कदम रिपोर्ट से', textEn: 'Neither — characterize the lump with USG; next steps per report' },
    // ABD08 q41-q42 (dyspepsia)
    { questionIndex: 41, text: 'जलन/खट्टी डकार साथ — गैस्ट्राइटिस/रिफ्लक्स; PPI कोर्स 4 हफ्ते; तला-मसाला रात को बंद', textEn: 'With heartburn/sour belch — gastritis/reflux; 4-week PPI course; no fried/spicy at night' },
    { questionIndex: 41, text: 'सिर्फ भारीपन — खाना छोटा व धीरे-धीरे; भोजन के तुरंत बाद न लेटें', textEn: 'Only heaviness — smaller, slower meals; do not lie down right after eating' },
    { questionIndex: 42, text: 'पेट की पुरानी सर्जरी — चिपकन/इंसिजनल गांठ ध्यान में रखें; USG कराएं', textEn: 'Previous abdominal surgery — adhesions/incisional hernia in consideration; get USG' },
    { questionIndex: 42, text: 'पथरी ज्ञात — पित्त/गुर्दा पथरी; USG दोबारा + आगे की योजना', textEn: 'Known stones — gallbladder/renal; repeat USG + further plan' },
    // ABD09 q43-q44 (jaundice)
    { questionIndex: 43, text: 'दर्द के साथ पीलिया — पथरी पित्त की नली में फंस सकती है — USG + LFT आज ही; बुखार जुड़े तो इमरजेंसी', textEn: 'Painful jaundice — stone trapped in bile duct possible — USG + LFT today; emergency if fever joins' },
    { questionIndex: 43, text: 'दर्द रहित पीलिया — गंभीर कारण (ट्यूमर/यकृत) जांच जरूरी — USG + LFT जल्दी कराएं', textEn: 'Painless jaundice — serious cause workup (tumour/liver) — urgent USG + LFT' },
    { questionIndex: 44, text: 'गहरा पेशाब + बुखार — पित्त का संक्रमण (कोलेंजाइटिस) खतरा — आज ही अस्पताल; USG, यूरिन, LFT वहीं करें', textEn: 'Dark urine + fever — cholangitis risk — hospital TODAY; USG, urine, LFT there' },
    { questionIndex: 44, text: 'तेज खुजली — पित्त जमा (कोलेस्टैसिस) — LFT जरूरी; नाखून छोटे रखें, खुजलाने से त्वचा न खरोंचें', textEn: 'Prominent itching — cholestasis — LFT needed; keep nails short, avoid scratching' },
    // ABD10 q45-q47 (GI bleed EMERGENCY)
    { questionIndex: 45, text: 'काला मल + चक्कर/कमजोरी — पेट के अंदर खून बह रहा है — आज ही इमरजेंसी अस्पताल — कुछ न खाएं, झूठ कर लेटें', textEn: 'Black stool + giddiness — active internal bleed — emergency hospital TODAY — nil by mouth, lie down' },
    { questionIndex: 45, text: 'काला मल बिना चक्कर के — फिर भी आज ही दिखाएं; आयरन की गोली/बीट भी मल काला करते हैं — दवा इतिहास डॉक्टर को बताएं', textEn: 'Black stool without giddiness — still same-day review; iron tablets/beets also darken stool — tell doctor your medicine history' },
    { questionIndex: 46, text: 'खूनी/कॉफी-रंग उल्टी — भारी रक्तस्राव — तुरंत इमरजेंसी (एम्बुलेंस 108) — घबराएं नहीं, सिर नीचा, शांत रहें', textEn: 'Bloody/coffee-ground vomit — major haemorrhage — emergency NOW (ambulance 108) — stay calm, head low' },
    { questionIndex: 46, text: 'उल्टी साधारण — गैस्ट्राइटिस संभव; फिर भी जांच कराएं, बिना इलाज न छोड़ें', textEn: 'Ordinary vomit — gastritis possible; still get evaluated, do not ignore' },
    { questionIndex: 47, text: 'दर्द की गोलियां/शराब — पेट के रक्तस्राव के सबसे आम कारण — आज से बंद + PPI + जांच (एंडोस्कोपी)', textEn: 'Pain pills/alcohol — commonest gastritis-bleed causes — stop today + PPI + endoscopy workup' },
    { questionIndex: 47, text: 'ये नहीं लेते — अन्य कारण जांच जरूरी (एंडोस्कोपी); पारिवारिक इतिहास भी बताएं', textEn: 'Neither — other causes need workup (endoscopy); share family history too' },
    // ANR01 q48-q49 (piles)
    { questionIndex: 48, text: 'ताजा लाल खून छींटों में/सतह पर — बवासीर/फिशर से आम; परीक्षण कराएं — मल मुलायम + सिट्ज़ बाथ मुख्य इलाज', textEn: 'Fresh red blood spurting/on surface — typical piles/fissure; get examined — stool softening + sitz bath is key' },
    { questionIndex: 48, text: 'मल में मिला/काला खून — ऊपरी पेट से हो सकता है — जांच जरूरी; एंडोस्कोपी सोचें', textEn: 'Blood mixed in stool/black — may be upper GI source — workup needed; consider endoscopy' },
    { questionIndex: 49, text: 'अपने आप अंदर चला जाता है — ग्रेड 1-2: फाइबर आहार + सिट्ज़ बाथ + दवा 2-4 हफ्ते; 2 हफ्ते में समीक्षा', textEn: 'Reduces spontaneously — grade 1-2: fiber diet + sitz bath + medicines 2-4 weeks; review in 2 weeks' },
    { questionIndex: 49, text: 'हाथ से धकेलना पड़ता है/बाहर रहता है — ग्रेड 3-4: सर्जिकल इलाज (बैंडिंग/ऑपरेशन) की जरूरत — परामर्श कराएं', textEn: 'Needs manual reduction/stays out — grade 3-4: needs surgical treatment (banding/surgery) — consult' },
    // ANR02 q50-q51 (fissure)
    { questionIndex: 50, text: 'मल-समय तेज दर्द + घंटों जलन — फिशर का चित्र; गुनगुने पानी का सिट्ज़ बाथ 2-3 बार/दिन + मल मुलायम करना मुख्य इलाज', textEn: 'Severe defecation pain + hours of burning — fissure picture; warm sitz bath 2-3 times/day + stool softening is the mainstay' },
    { questionIndex: 50, text: 'हल्का दर्द — बवासीर/खुजली हो सकती है; परीक्षण कराएं, खुद से अंदाजा न लगाएं', textEn: 'Mild pain — could be piles/itch; get examined, do not self-diagnose' },
    { questionIndex: 51, text: 'कठोर मल — कब्ज ही फिशर बनाए रखती है; सलाद/फल/इसबगोल + मुलायम करने वाली दवा जरूरी', textEn: 'Hard stools — constipation keeps the fissure open; salad/fruit/isabgol + stool softener needed' },
    { questionIndex: 51, text: 'मल नरम भी है — अन्य कारण सोचें; परीक्षण जरूरी (गुदा परीक्षण)', textEn: 'Stools already soft — consider other causes; examination needed (per rectal exam)' },
    // ANR03 q52-q53 (fistula)
    { questionIndex: 52, text: 'महीनों से बार-बार मवाद — भगंदर (फिश्चुला) — सर्जरी ही निश्चित इलाज; जांच कराकर योजना बनाएं', textEn: 'Months of recurrent pus — fistula — surgery is the only cure; get evaluated and plan' },
    { questionIndex: 52, text: 'पहली बार स्राव — फूटा फोड़ा संभव; सफाई + परीक्षण; दोबारा दौरे आएं तो फिश्चुला सोचें', textEn: 'First-time discharge — burst abscess possible; hygiene + examination; think fistula if episodes recur' },
    { questionIndex: 53, text: 'दर्द/बुखार के दौरे — बार-बार फोड़ा बनना — इलाज में देरी न करें; सर्जिकल रेफरल', textEn: 'Episodes of pain/fever — recurrent abscess formation — do not delay treatment; surgical referral' },
    { questionIndex: 53, text: 'बिना दर्द — सूखा ट्रैक — इलेक्टिव सर्जरी शांति से योजना बना लें; सफाई जारी रखें', textEn: 'Painless — dry track — plan elective surgery calmly; keep the area clean' },
    // ANR04 q54-q55 (perianal abscess)
    { questionIndex: 54, text: 'गुदा के पास दर्दनाक सूजन — फोड़ा है — निकासी (I&D) ही इलाज — सिर्फ दवा से नहीं ठीक होगा — आज ही आएं', textEn: 'Painful perianal swelling — an abscess — drainage (I&D) is the treatment — medicines alone will not cure — come TODAY' },
    { questionIndex: 54, text: 'मामूली दर्द, पहला दिन — गरम सेक; 24-48 घंटे में निकासी जरूरी होगी — देर न करें', textEn: 'Mild pain, first day — warm compress; drainage will be needed within 24-48h — do not delay' },
    { questionIndex: 55, text: 'बुखार/कंपकपी — संक्रमण फैल रहा है — आज ही अस्पताल/क्लिनिक — निकासी जल्दी कराएं', textEn: 'Fever/chills — infection spreading — hospital/clinic TODAY — urgent drainage' },
    { questionIndex: 55, text: 'बुखार नहीं — फिर भी 48 घंटे के भीतर निकासी जरूरी; बैठने में दर्द बना रहे तो तुरंत', textEn: 'No fever — drainage still needed within 48h; immediately if pain on sitting persists' },
    // ANR05 q56-q57 (anal itching)
    { questionIndex: 56, text: 'रात की खुजली — गुदा का एक्जिमा/पिनवॉर्म सोचें; रात को एंटीहिस्टामिन + सफाई; परजीवी इलाज जरूरत पर', textEn: 'Night-worse itching — consider perianal eczema/pinworm; night antihistamine + hygiene; antiparasitic if advised' },
    { questionIndex: 56, text: 'दिन की खुजली — पसीना/स्राव से जलन — सूखी सफाई, ढीले कपड़े, साबुन कम', textEn: 'Daytime itching — sweat/discharge irritation — dry hygiene, loose clothes, less soap' },
    { questionIndex: 57, text: 'मल के बाद बढ़ती खुजली — पानी से धोना सिखाएं (टॉयलेट पेपर ही काफी नहीं); मल के बाद सुखाएं', textEn: 'Itching worse after stool — teach washing with water (paper alone is not enough); dry the area after' },
    { questionIndex: 57, text: 'सफाई अच्छी होकर भी खुजली — फिश्चुला/बवासीर के स्राव जांचें', textEn: 'Itching despite good hygiene — look for fistula/piles discharge' },
    // ANR06 q58-q59 (prolapse)
    { questionIndex: 58, text: 'अपने आप अंदर (ग्रेड 3) — जीवनशैली + दवा आजमाएं; बनी रहे तो सर्जरी विकल्प खुला है', textEn: 'Reduces spontaneously (grade 3) — trial of lifestyle + medicines; surgery remains an option if persistent' },
    { questionIndex: 58, text: 'हाथ से भी नहीं या सदा बाहर (ग्रेड 4) — सर्जिकल इलाज जरूरी — परामर्श कराएं', textEn: 'Never reduces or stays out (grade 4) — surgical treatment required — consult' },
    { questionIndex: 59, text: 'बार-बार खून — Hb जांच कराएं (खून की कमी); इलाज मजबूत करें या सर्जरी की ओर बढ़ें', textEn: 'Recurrent bleeding — check Hb (anemia); escalate treatment or move towards surgery' },
    { questionIndex: 59, text: 'दर्द प्रमुख है — थकी हुई/गुंथी बवासीर या फिशर जांचें — परीक्षण जरूरी', textEn: 'Pain prominent — check for thrombosed pile or fissure — examination needed' },
    // ANR07 q60-q61 (skin tags/warts)
    { questionIndex: 60, text: 'बढ़ते/खून रहे मस्से — जांच कराएं; छोटी प्रक्रिया से निकालना आसान है', textEn: 'Growing/bleeding tags — get evaluated; minor procedure removal is easy' },
    { questionIndex: 60, text: 'स्थिर मस्से, दिक्कत नहीं — सिर्फ सफाई में बाधा हो तो हटवाएं, वरना निगरानी', textEn: 'Static tags, no trouble — remove only if they hinder hygiene, else observe' },
    { questionIndex: 61, text: 'जलाने/क्रीम के बाद दोबारा आए — अधूरा निकाला गया था; इस बार पूरा उपचार कराएं', textEn: 'Recurred after cautery/cream — removal was incomplete; complete the treatment this time' },
    { questionIndex: 61, text: 'पहली बार इलाज — छोटा उपचार काफी; बढ़ने वाली दर देखकर आगे तय करें', textEn: 'First-time treatment — minor care suffices; decide further per growth' },
    // VIN01 q62-q63 (varicose veins)
    { questionIndex: 62, text: 'सालों की नसें + दर्द/सूजन — वैरिकोज; क्रेप बैंडेज/स्टॉकिंग + नस-दवा मदद करती है; सर्जरी/लेज़र विकल्प जांच बाद', textEn: 'Years of visible veins + symptoms — varicose; crepe bandage/stockings + venotonic helps; surgery/laser after workup' },
    { questionIndex: 62, text: 'बिना लक्षण, सिर्फ दिखती हैं — दिखावट की चिंता — कॉस्मेटिक विकल्प; लंबा खड़ा रहना कम करें', textEn: 'Asymptomatic visible veins — cosmetic concern — cosmetic options; reduce prolonged standing' },
    { questionIndex: 63, text: 'टखने का दाग/पुराना घाव — नस रोग बढ़ चुका है (CEAP C4+) — वेनस डॉप्लर कराएं + त्वचा की देखभाल', textEn: 'Ankle staining/old ulcer — advanced venous disease (CEAP C4+) — venous Doppler + skin care' },
    { questionIndex: 63, text: 'त्वचा सामान्य — निगरानी; बैठते समय पैर ऊंचा रखने की आदत डालें', textEn: 'Skin normal — observe; make a habit of leg elevation while sitting' },
    // VIN02 q64-q65 (leg swelling)
    { questionIndex: 64, text: 'शाम बढ़ती-सुबह घटती सूजन — नस की सूजन; पैर ऊंचा रखें + क्रेप बैंडेज; नमक कम', textEn: 'Evening-worse morning-better swelling — venous swelling; leg elevation + crepe bandage; less salt' },
    { questionIndex: 64, text: 'सुबह भी बराबर सूजन — गुर्दा/थायरॉइड/दवा कारण जांचें — जांच जरूरी', textEn: 'Swelling same even in morning — check renal/thyroid/medicine causes — workup needed' },
    { questionIndex: 65, text: 'एक पैर में अचानक दर्दनाक सूजन — गहरी नस में खून का थक्का (DVT) का खतरा — आज ही अस्पताल (डॉप्लर) — मालिश बिल्कुल न करें', textEn: 'Sudden painful one-leg swelling — deep vein thrombosis (DVT) risk — hospital TODAY (Doppler) — absolutely no massage' },
    { questionIndex: 65, text: 'धीरे-धीरे बढ़ी — नस/लसीका सूजन संभव; जांच कराएं', textEn: 'Gradual onset — venous/lymphatic swelling possible; get evaluated' },
    // VIN03 q66-q67 (phimosis)
    { questionIndex: 66, text: 'बचपन से ही नहीं खुलती — फाइमोसिस; सुन्नत (सर्कम्सिशन) छोटी और स्थायी इलाज है — परामर्श करें', textEn: 'Never retracted since childhood — phimosis; circumcision is a small definitive cure — consult' },
    { questionIndex: 66, text: 'पहले खुलती थी, अब नहीं — त्वचा का सख्त होना (बैलेनाइटिस के बाद) — जांच; क्रीम परख जा सकती है', textEn: 'Previously retractable, now not — scarring (post-balanitis) — evaluate; a cream trial may be possible' },
    { questionIndex: 67, text: 'धार/बार-बार संक्रमण में दिक्कत — फाइमोसिस के साथ संक्रमण — सुन्नत कराना बेहतर विकल्प', textEn: 'Stream difficulty/recurrent infection — phimosis with infection — circumcision is the better option' },
    { questionIndex: 67, text: 'पेशाब ठीक है — क्रीम/हल्का विकल्प डॉक्टर से पूछें; सफाई में ध्यान दें', textEn: 'Urination fine — ask doctor about cream/conservative options; maintain hygiene' },
    // VIN04 q68-q69 (thrombophlebitis)
    { questionIndex: 68, text: 'दर्दनाक लाल रेखा — सतही थ्रॉम्बोफ्लेबिटिस; गरम सेक + दर्द की दवा; 1-2 हफ्ते में ठीक', textEn: 'Tender red cord — superficial thrombophlebitis; warm compress + analgesia; settles in 1-2 weeks' },
    { questionIndex: 68, text: 'रेखा नहीं, गांठ — नस की सूजी हुई शाखा संभव — डॉप्लर से स्पष्ट करें', textEn: 'No cord, a nodule — sclerosed vein segment possible — clarify with Doppler' },
    { questionIndex: 69, text: 'बुखार/पूरे पैर की सूजन — गहरी नस में थक्के (DVT) का खतरा — आज ही अस्पताल — डॉप्लर कराएं', textEn: 'Fever/whole-leg swelling — DVT risk — hospital TODAY — get Doppler' },
    { questionIndex: 69, text: 'सिर्फ रेखा वाले भाग की सूजन — सतही; 48 घंटे में फैले तो दोबारा दिखाएं', textEn: 'Only the cord segment involved — superficial; review if spreading in 48h' },
    // VIN05 q70-q71 (claudication)
    { questionIndex: 70, text: 'थोड़ी चलने पर दर्द — पैर की धमनी संकरी (PAD) संभव — धूम्रपान आज ही बंद + नाड़ी/ABI जांच', textEn: 'Pain after short walks — peripheral arterial disease possible — stop smoking TODAY + pulse/ABI test' },
    { questionIndex: 70, text: 'बहुत दूर चलने पर — जोड़/नस का दर्द ज्यादा संभव — वैरिकोज/जोड़ जांच', textEn: 'Pain only after long walks — joint/nerve pain more likely — varicose/joint workup' },
    { questionIndex: 71, text: 'आराम से ठीक + ठंडा पैर — धमनी रोग (PAD) — वैस्कुलर रेफरल; घाव से बचाव व नंगे पैर नहीं', textEn: 'Rest-relieved + cold foot — PAD — vascular referral; protect the foot from injury, never barefoot' },
    { questionIndex: 71, text: 'आराम से नहीं ठीक — रीढ़/जोड़ का दर्द — ऑर्थो जांच कराएं', textEn: 'Not relieved by rest — spine/joint pain — ortho evaluation' },
    // WND01 q72-q73 (non-healing wound)
    { questionIndex: 72, text: '4+ हफ्ते में न भरा घाव — जड़ कारण जांच: शुगर, खून की आपूर्ति, संक्रमण; ड्रेसिंग तकनीक बदलनी होगी', textEn: 'Wound not healed in 4+ weeks — work up root causes: sugar, blood supply, infection; dressing technique needs review' },
    { questionIndex: 72, text: 'नया घाव — सामान्य भरने में 2-3 हफ्ते; नियमित ड्रेसिंग जारी रखें', textEn: 'Fresh wound — normal healing takes 2-3 weeks; continue regular dressing' },
    { questionIndex: 73, text: 'शुगर/धूम्रपान — घाव भरने के दोनों दुश्मन — शुगर नियंत्रण पहले; धूम्रपान आज बंद', textEn: 'Diabetes/smoking — the two enemies of wound healing — sugar control first; stop smoking today' },
    { questionIndex: 73, text: 'दोनों नहीं — संक्रमण/घाव पर तनाव देखें; ड्रेसिंग बदलनी पड़ सकती है — दिखाएं', textEn: 'Neither — look for infection/wound tension; dressing may need change — show it' },
    // WND02 q74-q75 (pus from wound)
    { questionIndex: 74, text: 'हरा/बदबूदार मवाद + बढ़ती लालिमा — संक्रमण गहरा — आज ही आएं — एंटीबायोटिक + ड्रेसिंग बदलाव', textEn: 'Green/foul pus + spreading redness — deep infection — come TODAY — antibiotic + dressing revision' },
    { questionIndex: 74, text: 'हल्का स्राव — सतही; बेटाडीन ड्रेसिंग; 48 घंटे में समीक्षा जरूरी', textEn: 'Minimal discharge — superficial; Betadine dressing; review needed in 48h' },
    { questionIndex: 75, text: 'बुखार/बढ़ता दर्द — संक्रमण फैल रहा है — आज ही दिखाएं; देर से इलाज महंगा पड़ता है', textEn: 'Fever/increasing pain — infection spreading — show today; delayed treatment costs more' },
    { questionIndex: 75, text: 'दर्द स्थिर — ड्रेसिंग जारी रखें; 48-72 घंटे में सुधार दिखना चाहिए', textEn: 'Stable pain — continue dressing; improvement expected in 48-72h' },
    // WND03 q76-q77 (dressing)
    { questionIndex: 76, text: 'साफ-सूखता घाव — साधारण सूखी ड्रेसिंग; 2-3 दिन में बदलें; पानी लगने से बचाएं', textEn: 'Clean drying wound — simple dry dressing; change every 2-3 days; keep water off' },
    { questionIndex: 76, text: 'मवादी/गीला घाव — बेटाडीन से सफाई + रोज़ ड्रेसिंग; डॉक्टर को दिखाते रहें', textEn: 'Discharging/wet wound — Betadine cleaning + daily dressing; keep showing it to the doctor' },
    { questionIndex: 77, text: 'घर पर ड्रेसिंग — हाथ धोएं, साफ कैंची/बैंडेज + बेटाडीन; हर बदलाव पर घाव देखें; लालिमा बढ़े तो क्लिनिक आएं', textEn: 'Home dressing — wash hands, clean scissors/gauze + Betadine; inspect the wound each change; come to clinic if redness increases' },
    { questionIndex: 77, text: 'गहरे/मवादी घाव के लिए क्लिनिक ड्रेसिंग बेहतर — 2-3 दिन में एक बार आएं', textEn: 'Clinic dressing better for deep/discharging wounds — visit every 2-3 days' },
    // WND04 q78-q79 (post-op follow-up)
    { questionIndex: 78, text: 'सर्जरी का नाम/तारीख नोट करें, रिपोर्ट साथ लाएं — फॉलो-अप व दवा उसी हिसाब से', textEn: 'Note the surgery name/date, bring reports — follow-up and medicines accordingly' },
    { questionIndex: 78, text: 'नई सर्जरी (2 हफ्ते से कम) — घाव देखना + सिलाई हटाने की तारीख तय करें', textEn: 'Recent surgery (<2 weeks) — wound check + fix suture-removal date' },
    { questionIndex: 79, text: 'दर्द/बुखार/स्राव में से कुछ भी — आज जांच; संक्रमण नियंत्रण प्राथमिकता', textEn: 'Any of pain/fever/discharge — examine today; infection control is the priority' },
    { questionIndex: 79, text: 'सब ठीक — सामान्य उपचार चल रहा है; भारी काम 4-6 हफ्ते बाद; अगली तारीख पर आएं', textEn: 'All well — normal recovery; heavy work after 4-6 weeks; come on the next date' },
    // WND05 q80-q81 (suture removal)
    { questionIndex: 80, text: 'सिलाई 7-10 दिन पुरानी — हटाने का समय हो गया; आज हटवा लें', textEn: 'Sutures 7-10 days old — time for removal; get them removed today' },
    { questionIndex: 80, text: 'अभी 5 दिन से कम — इतनी जल्दी नहीं; तय तारीख पर लौटें', textEn: 'Under 5 days — not yet; return on the scheduled date' },
    { questionIndex: 81, text: 'लाल/मवादी जगह — सिलाई जल्दी निकालकर देखना पड़ सकता है; संक्रमण की जांच आज', textEn: 'Red/discharging site — sutures may need early removal; infection check today' },
    { questionIndex: 81, text: 'घाव साफ — निकालने के बाद 2 दिन पट्टी रखें; हल्की खुजली सामान्य', textEn: 'Wound clean — keep bandage 2 days after removal; mild itching is normal' },
    // WND06 q82-q83 (post-op pain)
    { questionIndex: 82, text: 'हल्का-मध्यम दर्द — भोजन के बाद दर्द की दवा; 5वें दिन तक घटना चाहिए', textEn: 'Mild-moderate pain — analgesia after food; should reduce by day 5' },
    { questionIndex: 82, text: 'तेज दर्द या दवा से न रुके — जांच जरूरी (घाव/अंदरूनी कारण) — आज ही दोबारा', textEn: 'Severe pain or unrelieved — workup needed (wound/internal cause) — revisit today' },
    { questionIndex: 83, text: 'घाव की जगह दर्द — सामान्य उपचार-दर्द; गतिविधि धीरे-धीरे बढ़ाएं', textEn: 'Wound-site pain — normal post-op pain; increase activity gradually' },
    { questionIndex: 83, text: 'गहरा पेट दर्द — अंदरूनी कारण (आंत/पुरानी दिक्कत) — जांच, USG जल्दी कराएं', textEn: 'Deep abdominal pain — internal cause (bowel/old problem) — workup, early USG' },
    // WND07 q84-q85 (scar pain)
    { questionIndex: 84, text: 'दर्द/खुजली के साथ गांठ — इंसिजनल हर्निया सोचें — परीक्षण कराएं; मरम्मत की योजना', textEn: 'Pain/itch with a bulge — suspect incisional hernia — get examined; plan repair' },
    { questionIndex: 84, text: 'गांठ नहीं — नस की गांठ (न्यूरोमा)/खिंचाव — जेल + सपोर्ट बेल्ट; 4-6 हफ्ते में सुधार आम', textEn: 'No bulge — nerve knot (neuroma)/tight scar — gel + support belt; improvement common in 4-6 weeks' },
    { questionIndex: 85, text: 'साल+ पुरानी और बढ़ती दिक्कत — टालें नहीं; मरम्मत के निर्णय पर बात करें', textEn: '1+ year old and worsening — do not delay; discuss the repair decision' },
    { questionIndex: 85, text: 'स्थिर हल्की दिक्कत — निगरानी; वजन घटाएं, तेज व्यायाम से बचें', textEn: 'Stable mild trouble — observe; lose weight, avoid intense exercise' },
    // WND08 q86-q87 (abscess/boil)
    { questionIndex: 86, text: 'सिर दिखने वाला फोड़ा — छोटी निकासी (I&D) प्रक्रिया चाहिए — गरम सेक जारी रखें — आज ही', textEn: 'Pointing abscess — a small drainage (I&D) procedure needed — continue warm compress — TODAY' },
    { questionIndex: 86, text: 'गहरा दर्द, सिर नहीं — एंटीबायोटिक + गरम सेक 48 घंटे; न सुधरे तो निकासी', textEn: 'Deep pain, no head — antibiotic + warm compress 48h; drain if no settling' },
    { questionIndex: 87, text: 'बुखार/शुगर के साथ — निकासी जल्दी + शुगर नियंत्रण; अस्पताल-स्तर देखभाल चाहिए', textEn: 'With fever/diabetes — early drainage + sugar control; hospital-level care needed' },
    { questionIndex: 87, text: 'दोनों नहीं — क्लिनिक में निकासी पर्याप्त; 3 दिन बाद समीक्षा', textEn: 'Neither — clinic drainage suffices; review after 3 days' },
    // WND09 q88-q89 (fresh wound)
    { questionIndex: 88, text: '6+ घंटे पुरानी गहरी कट — सिलाई की खिड़की बंद हो रही है — आज ही टांका लगवाएं; ऊपर साफ कपड़े से दबाव', textEn: 'Deep cut >6 h old — the stitching window is closing — get sutured TODAY; press with a clean cloth' },
    { questionIndex: 88, text: 'छिछला/नया कट — साफ पानी से धोएं + बेटाडीन + पट्टी; खून न रुके तो दबाव करते आएं', textEn: 'Superficial/fresh cut — wash with clean water + Betadine + bandage; come pressing if bleeding continues' },
    { questionIndex: 89, text: 'गंदगी/जंग लगी — टिटेनस कवर आज जरूरी (टीका/immunoglobulin); घाव डॉक्टर दिखाएं', textEn: 'Dirt/rust contamination — tetanus cover needed TODAY (toxoid/immunoglobulin); show the wound' },
    { questionIndex: 89, text: 'साफ कट, 5 साल में टीका लिया — बूस्टर पर्याप्त; घाव की सफाई व निगरानी', textEn: 'Clean cut, toxoid within 5 years — booster suffices; wound cleaning and watch' },
    // WND10 q90-q91 (post-op fever)
    { questionIndex: 90, text: 'ऑपरेशन के बाद 2-3 दिन का हल्का बुखार आम; लगातार या 100°F से ऊपर — संक्रमण जांच आज ही', textEn: 'Mild fever for 2-3 days post-op is common; persistent or >100°F — infection workup TODAY' },
    { questionIndex: 90, text: 'हल्का और घट रहा — तरल भोजन पर्याप्त; तापमान चार्ट बनाएं, हर 6 घंटे नोट करें', textEn: 'Mild and settling — fluids suffice; keep a temperature chart, note every 6 hours' },
    { questionIndex: 91, text: 'घाव स्राव + बुखार — घाव संक्रमण संभव — आज ही; सांस में दिक्कत — छाती एक्सरे जरूरी', textEn: 'Wound discharge + fever — wound infection likely — today; chest symptoms — chest X-ray needed' },
    { questionIndex: 91, text: 'घाव साफ, सांस/पेशाब ठीक — मूत्र/कैथेटर जैसे अन्य स्रोत जांचें — यूरिन टेस्ट', textEn: 'Wound clean, chest/urine fine — look for other sources (urine/catheter) — urine test' },
  ],

  // ══ Labels — vitals (9; pain score added for surgical OPD) ═══════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
    { label: 'दर्द अंक (0-10)', labelEn: 'Pain Score (0-10)', unit: '', showUnit: false },
  ],

  // ══ Findings (26) — emergency/refer findings carry NO medicine links ═
  findings: [
    { key: 'ING-HERNIA', name: 'इनगुइनल हर्निया (जांघ की गांठ)', nameEn: 'Inguinal Hernia', icd10: 'K40.9' },
    { key: 'UMB-HERNIA', name: 'नाभि हर्निया', nameEn: 'Umbilical Hernia', icd10: 'K42.9' },
    { key: 'STRANG-HERNIA', name: 'रुद्ध हर्निया (आपातकाल — तुरंत रेफर)', nameEn: 'Strangulated Hernia (Emergency — REFER)', icd10: 'K40.3' },
    { key: 'APPENDICITIS-SUS', name: 'अपेंडिसाइटिस का प्रबल संदेह (आपातकाल — तुरंत रेफर)', nameEn: 'Suspected Acute Appendicitis (Emergency — REFER)', icd10: 'K35.8' },
    { key: 'CHOLECYSTITIS-ACUTE', name: 'तीव्र पित्ताशय सूजन, बुखार सहित (आपातकाल — रेफर)', nameEn: 'Acute Cholecystitis with Fever (Emergency — REFER)', icd10: 'K81.0' },
    { key: 'BILIARY-COLIC', name: 'पित्ताशय पथरी (पित्त कोलिक)', nameEn: 'Gallstone Disease (Biliary Colic)', icd10: 'K80.2' },
    { key: 'RENAL-COLIC', name: 'मूत्र पथरी दर्द (कॉलिक)', nameEn: 'Renal Colic (Urolithiasis)', icd10: 'N23' },
    { key: 'LIPOMA', name: 'लिपोमा (चर्बी की गांठ)', nameEn: 'Lipoma', icd10: 'D17.9' },
    { key: 'SEB-CYST', name: 'सेबेसियस सिस्ट (त्वचा की गांठ)', nameEn: 'Sebaceous Cyst', icd10: 'L72.0' },
    { key: 'FIBROADENOMA', name: 'स्तन फाइब्रोएडीनोमा (युवा गांठ)', nameEn: 'Fibroadenoma of Breast', icd10: 'D24.9' },
    { key: 'BREAST-CANCER-SUS', name: 'स्तन कैंसर का संदेह (ट्रिपल असेसमेंट — रेफर)', nameEn: 'Suspected Breast Malignancy (Triple Assessment — REFER)', icd10: 'C50.9' },
    { key: 'THYROID-SWELLING', name: 'थायरॉइड सूजन (गले की गिलटी)', nameEn: 'Thyroid Swelling (Goitre)', icd10: 'E04.9' },
    { key: 'HYDROCELE', name: 'हाइड्रोसील (अंडकोश में पानी भरना)', nameEn: 'Hydrocele', icd10: 'N43.3' },
    { key: 'PHIMOSIS', name: 'फाइमोसिस (सुन्नत की सलाह)', nameEn: 'Phimosis (Circumcision Evaluation)', icd10: 'N47' },
    { key: 'VARICOSE-VEINS', name: 'वैरिकोज शिराएं (पैरों की मोटी नसें)', nameEn: 'Varicose Veins', icd10: 'I83.9' },
    { key: 'VENOUS-ULCER', name: 'शिरा-घाव (पैर का न भरने वाला घाव)', nameEn: 'Venous Ulcer', icd10: 'I87.2' },
    { key: 'HEMORRHOIDS-EARLY', name: 'बवासीर (ग्रेड 1-2)', nameEn: 'Haemorrhoids Grade 1-2', icd10: 'K64.1' },
    { key: 'HEMORRHOIDS-ADV', name: 'बवासीर (ग्रेड 3-4, बाहर रहने वाली)', nameEn: 'Haemorrhoids Grade 3-4 (Prolapsed)', icd10: 'K64.3' },
    { key: 'ANAL-FISSURE', name: 'गुदा फिशर (मल त्याग का दर्द)', nameEn: 'Anal Fissure', icd10: 'K60.2' },
    { key: 'ANAL-FISTULA', name: 'भगंदर / फिश्चुला (नासूर)', nameEn: 'Anal Fistula', icd10: 'K60.3' },
    { key: 'PERIANAL-ABSCESS', name: 'गुदा के पास फोड़ा (निकासी आवश्यक)', nameEn: 'Perianal Abscess (Needs Drainage)', icd10: 'K61.0' },
    { key: 'PRURITUS-ANI', name: 'गुदा की खुजली', nameEn: 'Pruritus Ani', icd10: 'L29.0' },
    { key: 'CHRONIC-CONSTIPATION', name: 'पुरानी कब्ज', nameEn: 'Chronic Constipation', icd10: 'K59.0' },
    { key: 'WOUND-INFECTION', name: 'घाव संक्रमण', nameEn: 'Wound Infection (Post-procedural)', icd10: 'T81.4' },
    { key: 'POSTOP-HEALING', name: 'सामान्य उपचाराधीन घाव (ऑपरेशन के बाद)', nameEn: 'Normal Post-operative Healing', icd10: 'Z48.0' },
    { key: 'SKIN-ABSCESS', name: 'त्वचा का फोड़ा (निकासी आवश्यक)', nameEn: 'Skin Abscess (Needs Drainage)', icd10: 'L02.9' },
  ],

  // ══ Medicines (55) — India surgical OPD core ══════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = ~5-day
  // dispense multiplier. flags: pregnancy/pediatric/schedule; verified
  // stays false until per-item MBBS review.
  medicines: [
    // ── Analgesics / anti-inflammatory ──────────────────────────────────
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg', doseOptions: ['1 tab (650 mg) SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg — भोजन के बाद ही; पेट में खून की सावधानी', doseOptions: ['1 tab after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zerodol-P Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg — ऑपरेशन के बाद/सामान्य दर्द; रक्तस्राव व गुर्दे की सावधानी', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol SP Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg — घाव-सूजन में; रक्त-पतलापन सावधानी', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zerodol TH 4 Tablet', salt: 'Aceclofenac 100 mg + Thiocolchicoside 4 mg — मांसपेशी ऐंठन वाला दर्द', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ultracet Tablet', salt: 'Tramadol 37.5 mg + Paracetamol 325 mg — Schedule H; केवल अल्पकाल (नशे/चक्कर का खतरा)', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran SR 100 Tablet', salt: 'Diclofenac Sodium 100 mg SR — गुर्दा/पेट सावधानी; लंबे समय नहीं', doseOptions: ['1 tab after food'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Dynapar AQ Spray', salt: 'Diclofenac Diethylamine topical spray — दर्द वाली जगह पर छिड़कें', doseOptions: ['Spray locally 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Voveran Gel 30g', salt: 'Diclofenac Diethylamine 1.16% w/w gel', doseOptions: ['Apply locally 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin-Chymotrypsin (anti-inflammatory enzyme) — घूठी खाली पेट पानी से', doseOptions: ['1 tab empty stomach with water'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Antispasmodics (colic) ─────────────────────────────────────────
    { name: 'Cyclopam Tablet', salt: 'Dicyclomine 20 mg + Paracetamol 325 mg — पेट की ऐंठन वाला दर्द', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Drotin DS Tablet', salt: 'Drotaverine 80 mg — पित्त/मूत्र पथरी की कोलिक', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Buscopan 10 Tablet', salt: 'Hyoscine Butylbromide 10 mg — ऐंठन (कोलिक) में', doseOptions: ['1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Antibiotics ────────────────────────────────────────────────────
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — घाव/त्वचा/पेरिएनल संक्रमण', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ceftum 500 Tablet', salt: 'Cefuroxime Axetil 500 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg — दिन में एक बार, 3 दिन', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cifran 500 Tablet', salt: 'Ciprofloxacin 500 mg — मूत्र संक्रमण में', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Levoflox 500 Tablet', salt: 'Levofloxacin 500 mg — दिन में एक बार', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 5, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Metrogyl 400 Tablet', salt: 'Metronidazole 400 mg — बिना-ऑक्सीजन (anaerobic) व पेरिएनल संक्रमण; दवा के दौरान शराब वर्जित', doseOptions: ['1 tab thrice daily'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'O2 Tablet', salt: 'Ofloxacin 200 mg + Ornidazole 500 mg — पतले दस्त/पेट के संक्रमण में', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Urinary (stone colic adjuncts) ─────────────────────────────────
    { name: 'Alkasol Syrup 100ml', salt: 'Disodium Hydrogen Citrate — पेशाब की जलन में पानी में मिलाकर', doseOptions: ['10 ml in half glass water'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Urimax 0.4 Capsule', salt: 'Tamsulosin 0.4 mg — पथरी निकासी में सहायक; केवल USG/यूरो सलाह के बाद; चक्कर का खतरा — रात को लें', doseOptions: ['1 cap after dinner'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Laxatives / anorectal ──────────────────────────────────────────
    { name: 'Cremaffin Syrup 100ml', salt: 'Milk of Magnesia + Liquid Paraffin — कब्ज में रात को', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Cremaffin Plus Tablet', salt: 'Sodium Picosulfate + Milk of Magnesia + Liquid Paraffin — केवल अल्पकालिक उपयोग', doseOptions: ['1-2 tabs at bedtime (short-term)'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Looz Syrup 200ml', salt: 'Lactulose 10 g/15 ml — मल मुलायम करता है (बवासीर/फिशर में पसंदीदा)', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Dulcolax 5 Tablet', salt: 'Bisacodyl 5 mg — केवल अल्पकाल; आंत की रुकावट (obstruction) में नहीं; ऐंठन हो सकती है', doseOptions: ['1-2 tabs at bedtime'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Anobliss Cream 30g', salt: 'Nifedipine 0.3% + Lidocaine 1.5% topical cream — फिशर/बवासीर के दर्द में; मल के बाद व रात को लगाएं', doseOptions: ['Apply locally twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Daflon 500 Tablet', salt: 'Micronized Diosmin 450 mg + Hesperidin 50 mg — नसों व बवासीर की दवा (वेनोटॉनिक)', doseOptions: ['1 tab twice daily with food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pilex Ointment 20g', salt: 'हर्बल ऑइंटमेंट (OTC सहायक) — बवासीर में राहत', doseOptions: ['Apply locally 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Wound care topical ─────────────────────────────────────────────
    { name: 'Betadine 10% Solution 100ml', salt: 'Povidone-Iodine 10% — घाव की सफाई/ड्रेसिंग में', doseOptions: ['Clean wound + use at dressing'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Ointment 20g', salt: 'Povidone-Iodine 10% ointment — घाव पर पतली तह लगाएं', doseOptions: ['Apply thin layer at dressing'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin Sulphate 1% w/w — सतही घाव संक्रमण में', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'T-Bact 2% Ointment 5g', salt: 'Mupirocin 2% — घाव किनारों/छोटे संक्रमण में', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Contractubex Gel 20g', salt: 'Heparinoid + Allantoin + Onion extract — निशान नरम करने; हल्की मालिश 2-3 महीने', doseOptions: ['Massage gently 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── GI: PPI / antacid / antiemetic ─────────────────────────────────
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg — खाली पेट, नाश्ते से पहले', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Razo 20 Tablet', salt: 'Rabeprazole 20 mg', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pan-D Capsule', salt: 'Pantoprazole 40 mg + Domperidone 30 mg SR — भारीपन/मतली के साथ एसिडिटी', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mucaine Gel 200ml', salt: 'Oxethazaine + Aluminium Hydroxide + Magnesium Hydroxide — जलन में तुरंत राहत', doseOptions: ['10 ml SOS before meals'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Sucrafil O Gel 200ml', salt: 'Sucralfate 1 g + Oxethazaine — गैस्ट्राइटिस; खाने से 15 मिनट पहले', doseOptions: ['10 ml thrice daily before food'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ondem 4 MD Tablet', salt: 'Ondansetron 4 mg mouth-dissolving — उल्टी में; जीभ पर रखकर घोलें', doseOptions: ['1 tab SOS'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Domstal 10 Tablet', salt: 'Domperidone 10 mg — भोजन से पहले', doseOptions: ['1 tab before food'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Unienzyme Tablet', salt: 'Digestive enzymes (diastase/pepsin) + activated charcoal — गैस/फूलने में', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Allergy / itch ─────────────────────────────────────────────────
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg — खुजली/एलर्जी; रात को', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Atarax 25 Tablet', salt: 'Hydroxyzine 25 mg — तेज खुजली (रात) — नींद आ सकती है; वाहन न चलाएं', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Bowel prep (pre-op) ────────────────────────────────────────────
    { name: 'Peglec Powder', salt: 'Polyethylene Glycol + Electrolytes — आंत की सफाई (बाउल प्रेप): ऑपरेशन से पहले की शाम 2 लीटर पानी में घोलकर 1-2 घंटे में पीएं; बार-बार दस्त होंगे — पानी/ORS जारी रखें; Schedule H — केवल डॉक्टर के निर्देश पर', doseOptions: ['1 sachet in 2 L water, drink over 1-2 hours'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Recovery support ───────────────────────────────────────────────
    { name: 'Becosules Capsule', salt: 'B-Complex + Vitamin C — उपचार में सहायक', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc — घाव भरने में सहायक', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Evion 400 Capsule', salt: 'Vitamin E 400 IU — चक्रीय स्तन-दर्द में सहायक', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 — नसों के स्वास्थ्य में', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Orofer XT Tablet', salt: 'Ferrous Ascorbate 100 mg + Folic Acid 1.5 mg — ऑपरेशन से पहले Hb सुधारने में', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Vizylac Capsule', salt: 'Lactobacillus + vitamins — एंटीबायोटिक कोर्स के बाद आंत के अच्छे कीटाणु', doseOptions: ['1 cap twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 1 L water'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (36) ════════════════════════════════════
  // DELIBERATELY ZERO-LINK findings (referral IS the treatment):
  // STRANG-HERNIA, APPENDICITIS-SUS, CHOLECYSTITIS-ACUTE, BREAST-CANCER-SUS,
  // ING/UMB-HERNIA, LIPOMA, FIBROADENOMA, THYROID-SWELLING, HYDROCELE,
  // PHIMOSIS (elective surgical workups — no OPD drug therapy).
  findingMeds: [
    // BILIARY-COLIC (interim relief till elective surgery)
    { findingKey: 'BILIARY-COLIC', medicineName: 'Drotin DS Tablet', dose: '1 tab SOS', description: 'कोलिक दौरे में; तला-चिकनाई बंद' },
    { findingKey: 'BILIARY-COLIC', medicineName: 'Pan 40 Tablet', description: 'खाली पेट OD — साथ की गैस्ट्राइटिस में' },
    // RENAL-COLIC (till imaging/urology)
    { findingKey: 'RENAL-COLIC', medicineName: 'Buscopan 10 Tablet', dose: '1 tab SOS', description: 'कोलिक ऐंठन में (दिन में 3 तक)' },
    { findingKey: 'RENAL-COLIC', medicineName: 'Dolo 650 Tablet', description: 'दर्द में 1 tab SOS (6 घंटे का फासला)' },
    { findingKey: 'RENAL-COLIC', medicineName: 'Alkasol Syrup 100ml', description: '10 ml पानी में TDS — पेशाब की जलन' },
    // SEB-CYST (only when inflamed)
    { findingKey: 'SEB-CYST', medicineName: 'Augmentin 625 Tablet', description: 'गांठ लाल-दर्दनाक हो तो BD × 5 दिन; बाद में पूरी निकासी' },
    // VARICOSE-VEINS
    { findingKey: 'VARICOSE-VEINS', medicineName: 'Daflon 500 Tablet', description: '1 tab BD भोजन के साथ — दर्द/सूजन में' },
    { findingKey: 'VARICOSE-VEINS', medicineName: 'Voveran Gel 30g', description: 'दर्दनाक नस पर दिन में 2-3 बार' },
    // VENOUS-ULCER
    { findingKey: 'VENOUS-ULCER', medicineName: 'Daflon 500 Tablet', description: '1 tab BD — घाव भरने में सहायक' },
    { findingKey: 'VENOUS-ULCER', medicineName: 'Zincovit Tablet', description: '1 tab OD — घाव-उपचार सहायक' },
    { findingKey: 'VENOUS-ULCER', medicineName: 'Betadine 10% Solution 100ml', description: 'रोज़ सफाई + ड्रेसिंग; पैर ऊंचा रखें' },
    // HEMORRHOIDS-EARLY (grade 1-2 conservative)
    { findingKey: 'HEMORRHOIDS-EARLY', medicineName: 'Looz Syrup 200ml', description: '15 ml रात को — मल मुलायम' },
    { findingKey: 'HEMORRHOIDS-EARLY', medicineName: 'Daflon 500 Tablet', description: '1 tab BD × 2-4 हफ्ते' },
    { findingKey: 'HEMORRHOIDS-EARLY', medicineName: 'Anobliss Cream 30g', description: 'मल के बाद व रात को लगाएं' },
    // HEMORRHOIDS-ADV (bridging till surgery)
    { findingKey: 'HEMORRHOIDS-ADV', medicineName: 'Looz Syrup 200ml', description: '15 ml रात को — दर्द कम करता है' },
    { findingKey: 'HEMORRHOIDS-ADV', medicineName: 'Anobliss Cream 30g', description: 'दर्द व सूजन में स्थानीय राहत — सर्जरी से पहले' },
    // ANAL-FISSURE (conservative)
    { findingKey: 'ANAL-FISSURE', medicineName: 'Looz Syrup 200ml', description: '15 ml रात को — मल मुलायम जरूरी' },
    { findingKey: 'ANAL-FISSURE', medicineName: 'Anobliss Cream 30g', description: 'मल के बाद व रात को — सिट्ज़ बाथ के बाद लगाएं' },
    // ANAL-FISTULA (infection control while awaiting surgery)
    { findingKey: 'ANAL-FISTULA', medicineName: 'Metrogyl 400 Tablet', description: 'स्राव/संक्रमण बढ़े तो TDS × 5 दिन — सर्जरी ही निश्चित इलाज' },
    // PERIANAL-ABSCESS (post-I&D cover — drainage mandatory)
    { findingKey: 'PERIANAL-ABSCESS', medicineName: 'Augmentin 625 Tablet', description: 'I&D के साथ BD × 5 दिन — सिर्फ दवा से नहीं ठीक होगा' },
    { findingKey: 'PERIANAL-ABSCESS', medicineName: 'Metrogyl 400 Tablet', description: 'TDS × 5 दिन — एनारोबिक कवच' },
    { findingKey: 'PERIANAL-ABSCESS', medicineName: 'Dolo 650 Tablet', description: 'दर्द में 1 tab SOS' },
    // PRURITUS-ANI
    { findingKey: 'PRURITUS-ANI', medicineName: 'Teczine 5 Tablet', description: 'रात को 1 tab — खुजली नियंत्रण' },
    { findingKey: 'PRURITUS-ANI', medicineName: 'Anobliss Cream 30g', description: 'जलन वाली जगह पर दिन में 1-2 बार' },
    // CHRONIC-CONSTIPATION
    { findingKey: 'CHRONIC-CONSTIPATION', medicineName: 'Cremaffin Syrup 100ml', description: '15 ml रात को — आहार सुधार के साथ' },
    { findingKey: 'CHRONIC-CONSTIPATION', medicineName: 'Looz Syrup 200ml', description: 'लंबे इस्तेमाल के लिए उपयुक्त' },
    { findingKey: 'CHRONIC-CONSTIPATION', medicineName: 'Dulcolax 5 Tablet', description: 'केवल अल्पकाल (SOS); रुकावट के संदेह में नहीं' },
    // WOUND-INFECTION
    { findingKey: 'WOUND-INFECTION', medicineName: 'Augmentin 625 Tablet', description: '1 tab BD × 5 दिन भोजन के बाद' },
    { findingKey: 'WOUND-INFECTION', medicineName: 'Betadine 10% Solution 100ml', description: 'रोज़ घाव सफाई + ड्रेसिंग' },
    { findingKey: 'WOUND-INFECTION', medicineName: 'Zerodol-P Tablet', description: '1 tab BD × 3 दिन — दर्द व सूजन (भोजन के बाद)' },
    // POSTOP-HEALING (recovery support)
    { findingKey: 'POSTOP-HEALING', medicineName: 'Becosules Capsule', description: '1 cap OD — उपचार सहायक' },
    { findingKey: 'POSTOP-HEALING', medicineName: 'Zincovit Tablet', description: '1 tab OD — घाव भरने में मदद' },
    { findingKey: 'POSTOP-HEALING', medicineName: 'Chymoral Forte Tablet', description: '1 tab BD खाली पेट × 5 दिन — सूजन में' },
    // SKIN-ABSCESS (post-I&D)
    { findingKey: 'SKIN-ABSCESS', medicineName: 'Augmentin 625 Tablet', description: 'I&D के बाद BD × 5 दिन' },
    { findingKey: 'SKIN-ABSCESS', medicineName: 'Dolo 650 Tablet', description: 'दर्द में 1 tab SOS' },
    { findingKey: 'SKIN-ABSCESS', medicineName: 'T-Bact 2% Ointment 5g', description: 'निकासी के बाद जगह पर BD' },
  ],

  // ══ Table templates (5) — surgical OPD grids ══════════════════════════
  tables: [
    {
      name: 'घाव आकलन चार्ट / Wound Assessment Chart',
      rows: 7,
      cols: 6,
      headerLabel: ['तारीख', 'घाव का आकार', 'किनारे', 'स्राव (मवाद)', 'पट्टी/ड्रेसिंग', 'टिप्पणी'],
      colsLabel: ['Date', 'Wound size', 'Edges', 'Exudate', 'Dressing', 'Remark'],
      footerLabel: ['हर ड्रेसिंग पर भरें और डॉक्टर को दिखाएं / Fill at every dressing and show to your doctor'],
    },
    {
      name: 'हर्निया परीक्षण सूची / Hernia Examination Checklist',
      rows: 6,
      cols: 3,
      headerLabel: ['जांच (खड़े होकर)', 'बायां', 'दायां'],
      colsLabel: ['Examination (standing)', 'Left', 'Right'],
      footerLabel: ['खांसी की धक्की (cough impulse) व कमी-पूर्तता (reducibility) अवश्य नोट करें; दर्दनाक व न घटने वाली गांठ = आज ही अस्पताल / Always note cough impulse & reducibility; a painful irreducible lump = hospital today'],
    },
    {
      name: 'ऑपरेशन से पहले की सूची / Pre-Op Checklist',
      rows: 8,
      cols: 3,
      headerLabel: ['क्रम', 'मद', 'स्थिति (✔/✘)'],
      colsLabel: ['No.', 'Item', 'Status (✔/✘)'],
      footerLabel: ['महत्वपूर्ण: रात 12 बजे से कुछ न खाएं-पिएं; घर का एक व्यक्ति साथ लेकर आएं / Important: nil by mouth after 12 midnight; bring an escort'],
    },
    {
      name: 'ऑपरेशन के बाद फॉलो-अप / Post-Op Follow-up Chart',
      rows: 5,
      cols: 4,
      headerLabel: ['दिन (POD)', 'तापमान (°F)', 'घाव की हालत', 'टिप्पणी'],
      colsLabel: ['Day (POD)', 'Temperature (°F)', 'Wound status', 'Remark'],
      footerLabel: ['बुखार 100°F से ऊपर या घाव से मवाद हो तो तुरंत संपर्क करें / Contact immediately if fever > 100°F or wound discharge'],
    },
    {
      name: 'फोड़ा निकासी के बाद देखभाल / Abscess Drainage Aftercare',
      rows: 5,
      cols: 4,
      headerLabel: ['दिन', 'मवाद की मात्रा', 'पट्टी बदली', 'टिप्पणी'],
      colsLabel: ['Day', 'Pus amount', 'Dressing changed', 'Remark'],
      footerLabel: ['मवाद घटता जाना चाहिए; बढ़े या बुखार आए तो दोबारा आएं / Pus should decrease; return if it increases or fever appears'],
    },
  ],

  // ══ Rx quick-packages (6) — OPD feeds the OT ═════════════════════════
  rxTemplates: [
    {
      name: 'Post-Op Clean Wound — 5-Day Course',
      diagnosis: 'POSTOP-HEALING',
      medicines: [
        { name: 'Zerodol-P Tablet', dose: '1 tab after food', duration: '5 days', instructions: 'BD; भोजन के बाद ही — पेट खाली नहीं' },
        { name: 'Augmentin 625 Tablet', dose: '1 tab after food', duration: '5 days', instructions: 'BD — साफ घाव में भी कवच' },
        { name: 'Becosules Capsule', dose: '1 cap after food', duration: '15 days', instructions: 'OD — उपचार सहायक' },
      ],
      labs: ['CBC (day 3, यदि बुखार हो)', 'RBS (शुगर नियंत्रण देखने के लिए)'],
      advice: 'घाव सूखा रखें · रोज़ बेटाडीन ड्रेसिंग · दिन 7-10 पर सिलाई हटवाएं · बुखार >100°F या मवाद हो तो तुरंत आएं · भारी वजन 4-6 हफ्ते बाद',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Bawasir Grade 1-2 — Conservative 2-Week Course',
      diagnosis: 'HEMORRHOIDS-EARLY',
      medicines: [
        { name: 'Looz Syrup 200ml', dose: '15 ml at bedtime', duration: '14 days', instructions: 'मल मुलायम रखता है' },
        { name: 'Daflon 500 Tablet', dose: '1 tab with food', duration: '14 days', instructions: 'BD — बवासीर की शिराओं पर काम करती है' },
        { name: 'Anobliss Cream 30g', dose: 'Apply locally', duration: '14 days', instructions: 'मल के बाद व रात को — पहले धोकर सुखाकर' },
      ],
      labs: ['CBC with Hb (दीर्घकालिक खून आने पर)'],
      advice: 'गुनगुने पानी में सिट्ज़ बाथ दिन में 2-3 बार 10-15 मिनट · सलाद/फल/इसबगोल जैसा फाइबर · 3 लीटर पानी · लंबे समय बैठकर न रहें · 2 हफ्ते में दोबारा',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Anal Fissure — Acute Course',
      diagnosis: 'ANAL-FISSURE',
      medicines: [
        { name: 'Looz Syrup 200ml', dose: '15 ml at bedtime', duration: '21 days', instructions: 'मल मुलायम — यही मुख्य इलाज है' },
        { name: 'Anobliss Cream 30g', dose: 'Apply locally', duration: '21 days', instructions: 'मल के बाद व सोते समय — सिट्ज़ बाथ के बाद' },
      ],
      labs: [],
      advice: 'हर मल त्याग के बाद गुनगुने पानी का सिट्ज़ बाथ 10-15 मिनट · मल मुलायम रखें (फाइबर + पानी) · तीखा/मसालेदार खाना बंद · 2-3 हफ्ते में न ठीक हो तो पुनः जांच — पुरानी फिशर में छोटी सर्जरी का विकल्प है',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Pre-Op Preparation — Elective Surgery Package',
      diagnosis: 'ING-HERNIA',
      medicines: [
        { name: 'Peglec Powder', dose: '1 sachet in 2 L water', duration: '1 day', instructions: 'ऑपरेशन से पहले की शाम 6-8 बजे, 1-2 घंटे में पीएं — बार-बार दस्त होंगे; बीच-बीच में ORS/पानी जारी रखें' },
      ],
      labs: ['CBC', 'Blood group & Rh', 'RBS', 'Serum creatinine', 'HbsAg', 'HIV', 'PT/INR'],
      advice: 'रात 12 बजे से कुछ न खाएं-पीएं (निर्जला) · सुबह की दवाएं डॉक्टर से पूछकर ही · शुगर/BP की दवा के नाम व रिपोर्ट साथ लाएं · घर का एक व्यक्ति (escort) अनिवार्य · ऑपरेशन से पहले स्नान कर आएं',
      followUpDays: 1,
    },
    {
      name: 'Wound Infection — 5-Day Course',
      diagnosis: 'WOUND-INFECTION',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab after food', duration: '5 days', instructions: 'BD — पूरा कोर्स पूरा करें' },
        { name: 'Zerodol-P Tablet', dose: '1 tab after food', duration: '3 days', instructions: 'BD — दर्द व सूजन में' },
        { name: 'Betadine 10% Solution 100ml', dose: 'Wound cleaning + dressing', duration: 'as needed', instructions: 'रोज़ सफाई करके पट्टी करें' },
      ],
      labs: ['CBC', 'RBS (शुगर जांच जरूरी)'],
      advice: 'रोज़ घाव सफाई + बेटाडीन ड्रेसिंग · घाव के आसपास लालिमा बढ़े, बुखार आए या दर्द बढ़े तो तुरंत आएं · 48 घंटे में सुधार दिखना चाहिए',
      followUpDays: 2,
      isCommon: true,
    },
    {
      name: 'Biliary Colic — Interim Relief + Elective Plan',
      diagnosis: 'BILIARY-COLIC',
      medicines: [
        { name: 'Drotin DS Tablet', dose: '1 tab SOS', duration: '5 days', instructions: 'कोलिक दौरे में (दिन में 3 से ज्यादा नहीं)' },
        { name: 'Pan 40 Tablet', dose: '1 tab before breakfast', duration: '14 days', instructions: 'खाली पेट — साथ की गैस्ट्राइटिस में' },
      ],
      labs: ['USG abdomen (gallbladder)', 'LFT', 'CBC'],
      advice: 'तला/चिकनाई वाला खाना पूरी तरह बंद · दर्द का दौरा 6+ घंटे रहे या बुखार/पीलिया आए तो आज ही अस्पताल · USG रिपोर्ट के साथ ऑपरेशन (cholecystectomy) की योजना पर बात करें',
      followUpDays: 7,
    },
  ],
}
