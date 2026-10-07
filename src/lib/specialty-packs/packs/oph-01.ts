/**
 * OPH-01 — OPHTHALMOLOGY STARTER PACK (T2)
 *
 * The India eye-OPD core for MS/DNB Ophthalmologists and DOMS diploma eye
 * specialists in small cities: red eye, watering, seasonal allergy (huge in
 * India), stye/chalazion, refractive/presbyopia checks, diabetic-eye
 * screening, cataract evaluation — with ophthalmology's own prescribing
 * culture: a TOPICAL-HEAVY drop world (fluoroquinolone drops, lubricant
 * shelf, olopatadine), SHORT courses, and a FAST-REFER reflex for the
 * sight-threatening list (retinal detachment, leukocoria, angle closure,
 * chemical injury, penetrating trauma) that is always SCREEN-AND-REFER,
 * never medicine-only.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / printed advice),
 * English secondary (doctor search). Medicine names = Indian English
 * brands; topicals carry form & strength in the name.
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-ophthalmology OPD defaults but have NOT yet
 * been signed off by an MBBS reviewer. UI must show the unverified-dose
 * badge until meta.reviewedBy is stamped. Extra-caution items in this
 * pack: Toba-DM (steroid combo), Albalon (naphazoline), Doxy-1 (long lid
 * course), Vitamin A 200000 IU (high-dose protocol), Azee 500.
 *
 * SAFETY POLICY (eye-specific, non-negotiable):
 * - NO topical anaesthetics (proparacaine/lidocaine class) — chairside
 *   in-clinic only, never dispensed, never for home pain relief.
 * - NO home-use STEROID drops as new starts (no prednisolone /
 *   fluorometholone entries). Only the tobramycin+dexamethasone combo
 *   (Toba-DM) is included, carrying: slit-lamp confirmation before use,
 *   max-duration caps, IOP monitoring, never-self-continue warnings.
 * - Aminoglycoside policy: gentamicin (Genticyn) and framycetin
 *   (Soframycin eye) EXCLUDED; tobramycin is the allowed aminoglycoside.
 * - GLAUCOMA DROPS (Timopt/Glaucomol/Xalatan class) deliberately EXCLUDED
 *   as prescribable entries — Schedule-H specialist territory with
 *   cardio/asthma contraindications; glaucoma in this pack is
 *   refer-only / continue-specialty-care. Documented in worklog.
 * - Cycloplegics/mydriatics (Homide/Tropicacyl): IN-CLINIC ADMINISTRATION
 *   ONLY — never handed to the patient for home self-use.
 * - Chemical injury = 20-minute immediate tap-water irrigation BEFORE
 *   anything else, then hospital. Embedded in questions + suggestions +
 *   trauma first-aid card.
 * - Penetrating injury = eye shield, NO pressure, ZERO drops, ER.
 * - Chlorhexidine/Dettol/Savlon/any antiseptic NEVER in the eye.
 * - Contact-lens red eye = lens out immediately, no lens till eye clear
 *   (keratitis risk); never sleep in lenses.
 * - Vitamin A high-dose regimen = WHO protocol under supervision only;
 *   low-dose OTC/dietary line for self-care.
 * - Child white reflex / squint with poor vision = pediatric
 *   ophthalmology same-week line.
 * - Refer-only findings (13 emergencies) carry ZERO medicine links.
 *
 * Sources: NLEM 2022-23 backbone, standard Indian ophthalmology OPD
 * practice patterns, Snellen 6/x convention for vision records.
 */

import type { SpecialtyPack } from '../types'

export const OPH01_PACK: SpecialtyPack = {
  meta: {
    code: 'OPH-01',
    version: '1.0.0',
    tier: 'T2',
    title: 'Ophthalmology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'NLEM 2022-23 backbone · standard Indian eye OPD practice patterns · topical-first drop culture with fast-refer emergencies · unverified-dose launch mode',
  },

  // ══ Categories (6) ════════════════════════════════════════════════════
  categories: [
    { key: 'RED', name: 'लाल आंख', nameEn: 'Red Eye & Surface' },
    { key: 'PAN', name: 'आंख का दर्द व थकान', nameEn: 'Eye Pain & Strain' },
    { key: 'VIS', name: 'देखने में दिक्कत', nameEn: 'Vision Problems' },
    { key: 'LID', name: 'पलकों की समस्याएं', nameEn: 'Eyelid Problems' },
    { key: 'TRU', name: 'आंख की चोट', nameEn: 'Eye Injury' },
    { key: 'OTH', name: 'जांच व अन्य', nameEn: 'Check-ups & Others' },
  ],

  // ══ Complaints (46) ══════════════════════════════════════════════════
  complaints: [
    // RED — Red eye & surface
    { code: 'RED01', categoryKey: 'RED', detail: 'लाल आंख', detailEn: 'Red Eye' },
    { code: 'RED02', categoryKey: 'RED', detail: 'आंख से चिपचिपा स्राव / मवाद', detailEn: 'Sticky Discharge / Pus from Eye' },
    { code: 'RED03', categoryKey: 'RED', detail: 'आंख से लगातार पानी बहना', detailEn: 'Continuous Watering Eye' },
    { code: 'RED04', categoryKey: 'RED', detail: 'आंखों में खुजली (एलर्जी)', detailEn: 'Itching Eyes (Allergy)' },
    { code: 'RED05', categoryKey: 'RED', detail: 'हर मौसम में बार-बार आंखों की एलर्जी', detailEn: 'Recurrent Seasonal Eye Allergy' },
    { code: 'RED06', categoryKey: 'RED', detail: 'आंख में कुछ चुभने का एहसास', detailEn: 'Foreign Body Feeling in Eye' },
    { code: 'RED07', categoryKey: 'RED', detail: 'आंख में कुछ गिर गया है (धूल/धातु का कण)', detailEn: 'Something Fell in Eye (Dust/Metal)' },
    { code: 'RED08', categoryKey: 'RED', detail: 'सुबह पलकें चिपक जाना', detailEn: 'Eyelids Stuck in Morning' },
    { code: 'RED09', categoryKey: 'RED', detail: 'सूखी आंखें / आंखों में जलन', detailEn: 'Dry Eyes / Burning' },
    { code: 'RED10', categoryKey: 'RED', detail: 'कॉन्टैक्ट लेंस पहनने पर लाल आंख', detailEn: 'Contact Lens Red Eye' },
    { code: 'RED11', categoryKey: 'RED', detail: 'एक आंख गहरी लाल + तेज दर्द (अल्सर की आशंका)', detailEn: 'Severe Red Painful Single Eye (Ulcer Suspect)' },
    // PAN — Pain & strain
    { code: 'PAN01', categoryKey: 'PAN', detail: 'आंख के अंदर गहरा दर्द', detailEn: 'Deep Eye Pain' },
    { code: 'PAN02', categoryKey: 'PAN', detail: 'रोशनी से आंख चुभना (प्रकाश से बचाव)', detailEn: 'Pain with Light (Photophobia)' },
    { code: 'PAN03', categoryKey: 'PAN', detail: 'आंख दर्द + सिरदर्द + उल्टी (ग्लौकोमा आक्रमण की आशंका)', detailEn: 'Eye Pain + Headache + Vomiting (Angle-closure Suspect)' },
    { code: 'PAN04', categoryKey: 'PAN', detail: 'शाम को आंखों की थकान', detailEn: 'Eye Tiredness in Evening' },
    { code: 'PAN05', categoryKey: 'PAN', detail: 'कंप्यूटर/मोबाइल से आंखों पर जोर', detailEn: 'Computer / Mobile Eye Strain' },
    // VIS — Vision problems
    { code: 'VIS01', categoryKey: 'VIS', detail: 'दूर का धुंधला दिखना', detailEn: 'Blurred Distance Vision' },
    { code: 'VIS02', categoryKey: 'VIS', detail: 'पास का / छोटा लिखा धुंधला दिखना', detailEn: 'Blurred Near Vision (Presbyopia)' },
    { code: 'VIS03', categoryKey: 'VIS', detail: 'अचानक देखने में कमी (गंभीर)', detailEn: 'Sudden Vision Loss (Serious)' },
    { code: 'VIS04', categoryKey: 'VIS', detail: 'रात में / धुंधले उजाले में न दिखना', detailEn: 'Night Blindness' },
    { code: 'VIS05', categoryKey: 'VIS', detail: 'बत्तियों के चारों ओर चमकते हलो', detailEn: 'Halos Around Lights' },
    { code: 'VIS06', categoryKey: 'VIS', detail: 'रंगीन छल्ले दिखना', detailEn: 'Colored Rings Around Lights' },
    { code: 'VIS07', categoryKey: 'VIS', detail: 'आंखों के सामने काले धागे / कीड़े उड़ना', detailEn: 'Floaters / Black Spots' },
    { code: 'VIS08', categoryKey: 'VIS', detail: 'बिजली / चमक के झटके दिखना', detailEn: 'Flashes of Light' },
    { code: 'VIS09', categoryKey: 'VIS', detail: 'दृष्टि में पर्दा गिरना (आपातकाल)', detailEn: 'Curtain in Vision (Emergency)' },
    { code: 'VIS10', categoryKey: 'VIS', detail: 'चश्मे का नंबर जांचना', detailEn: 'Glasses Power Check-up' },
    { code: 'VIS11', categoryKey: 'VIS', detail: 'रात में गाड़ी चलाने में दिक्कत', detailEn: 'Night Driving Difficulty' },
    // LID — Eyelids
    { code: 'LID01', categoryKey: 'LID', detail: 'पलक पर दाना (रात का दाना / स्टाई)', detailEn: 'Stye (Painful Lid Lump)' },
    { code: 'LID02', categoryKey: 'LID', detail: 'पलक पर बिना दर्द की गांठ (चैलेज़ियन)', detailEn: 'Chalazion (Painless Lid Cyst)' },
    { code: 'LID03', categoryKey: 'LID', detail: 'पलकों के किनारों पर खुजली / रूसी जैसी परत', detailEn: 'Blepharitis (Itchy Lid Margins)' },
    { code: 'LID04', categoryKey: 'LID', detail: 'पलक गिरना / ढीली पड़ना', detailEn: 'Drooping Eyelid (Ptosis)' },
    // TRU — Injury
    { code: 'TRU01', categoryKey: 'TRU', detail: 'आंख पर सीधी चोट (गेंद/सड़क हादसा)', detailEn: 'Blunt Eye Injury (Ball/Road Accident)' },
    { code: 'TRU02', categoryKey: 'TRU', detail: 'आंख में रासायनिक चीज गिरना (तेजाब/चूना)', detailEn: 'Chemical Injury (Acid/Alkali)' },
    { code: 'TRU03', categoryKey: 'TRU', detail: 'आंख में धारदार चीज लगना (चाकू/कांच)', detailEn: 'Sharp Injury (Knife/Glass — No Drops)' },
    { code: 'TRU04', categoryKey: 'TRU', detail: 'आंख के चारों ओर काला / नीला धब्बा', detailEn: 'Black Eye (Swelling Around Eye)' },
    { code: 'TRU05', categoryKey: 'TRU', detail: 'पटाखों से आंख की चोट (दिवाली)', detailEn: 'Firecracker Eye Injury' },
    // OTH — Check-ups & others
    { code: 'OTH01', categoryKey: 'OTH', detail: 'मोतियाबिंद की जांच (कैटरैक्ट इवैल्यूएशन)', detailEn: 'Cataract Evaluation (Pre-op Workup)' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'मोतियाबिंद ऑपरेशन के बाद जांच', detailEn: 'Post-cataract Surgery Check-up' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'शुगर के मरीज की आंख जांच (रेटिनोपैथी स्क्रीनिंग)', detailEn: 'Diabetic Patient Eye Check-up (DR Screening)' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'बीपी के मरीज की आंख जांच', detailEn: 'BP Patient Eye Check-up (Hypertensive Retinopathy)' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'ग्लौकोमा की आशंका (परिवार में / फील्ड दोष)', detailEn: 'Glaucoma Suspect (Family History / Field Defect)' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'नियमित आंख जांच', detailEn: 'Routine Eye Check-up' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'लेसिक (LASIK) से पहले की जांच', detailEn: 'Pre-LASIK Evaluation' },
    { code: 'OTH08', categoryKey: 'OTH', detail: 'बच्चे की आंख टेढ़ी होना (भैंगापन)', detailEn: 'Squint / Eye Turning (Child)' },
    { code: 'OTH09', categoryKey: 'OTH', detail: 'बच्चे की पुतली में सफेद चमक (आपातकाल)', detailEn: 'White Pupil in Child (Leukocoria — Emergency)' },
    { code: 'OTH10', categoryKey: 'OTH', detail: 'बच्चे की कमजोर आंख की आशंका (लेज़ी आई)', detailEn: 'Lazy Eye Suspect (Child)' },
  ],

  // ══ Questions (92 — 2 per complaint, idx 0-91) ══════════════════════
  // AUTHORING CONVENTION: every question carries its array index as a
  // trailing `// idx N` comment; the suggestions section below references
  // those numbers. Keep this in sync on every edit (index drift = bug).
  questions: [
    // RED01 — Red eye
    { complaintCode: 'RED01', question: 'लालपन एक आंख में है या दोनों में?', questionEn: 'Is the redness in one eye or both?' }, // idx 0
    { complaintCode: 'RED01', question: 'लालपन कितने दिनों से है?', questionEn: 'Since how many days is the redness there?' }, // idx 1
    // RED02 — Sticky discharge
    { complaintCode: 'RED02', question: 'स्राव कैसा है — पीला/हरा गाढ़ा मवाद या सफेद चिपचिपा?', questionEn: 'What is the discharge like — thick yellow/green pus or white sticky?' }, // idx 2
    { complaintCode: 'RED02', question: 'दिन में कितनी बार पलकें साफ करनी पड़ती हैं?', questionEn: 'How many times a day do you need to clean the lids?' }, // idx 3
    // RED03 — Watering eye
    { complaintCode: 'RED03', question: 'पानी बहना कितने समय से है — हफ्तों/महीनों से?', questionEn: 'Since how long has the eye been watering — weeks/months?' }, // idx 4
    { complaintCode: 'RED03', question: 'आंख के अंदरुनी कोने पर दबाने से पानी/गाढ़ा स्राव वापस निकलता है?', questionEn: 'Does pressing the inner corner of the eye push water/thick fluid back out?' }, // idx 5
    // RED04 — Itching (allergy)
    { complaintCode: 'RED04', question: 'खुजली दोनों आंखों में है या एक में?', questionEn: 'Is the itching in both eyes or one?' }, // idx 6
    { complaintCode: 'RED04', question: 'खुजली के साथ जलन, लाली या आंखों के नीचे काले घेरे भी हैं?', questionEn: 'Itching with burning, redness or dark circles under the eyes too?' }, // idx 7
    // RED05 — Recurrent seasonal allergy
    { complaintCode: 'RED05', question: 'यह एलर्जी किस मौसम में बार-बार होती है?', questionEn: 'In which season does this allergy recur?' }, // idx 8
    { complaintCode: 'RED05', question: 'परिवार में किसी को एलर्जी, दमा या एक्जिमा है?', questionEn: 'Does anyone in the family have allergy, asthma or eczema?' }, // idx 9
    // RED06 — Foreign body feeling
    { complaintCode: 'RED06', question: 'वास्तव में कुछ गया है या बस चुभने का एहसास है?', questionEn: 'Did something actually go in, or does it just feel that way?' }, // idx 10
    { complaintCode: 'RED06', question: 'तेज रोशनी या पलक झपकने पर चुभन बढ़ती है?', questionEn: 'Does the pricking worsen in bright light or on blinking?' }, // idx 11
    // RED07 — Something fell in eye
    { complaintCode: 'RED07', question: 'क्या गिरा था — धूल, लोहे/पत्थर का कण, या कीट?', questionEn: 'What fell in — dust, an iron/stone particle, or an insect?' }, // idx 12
    { complaintCode: 'RED07', question: 'गिरने के बाद से दर्द, पानी बहना या धुंधला दिखना है?', questionEn: 'Pain, watering or blurred vision since it fell?' }, // idx 13
    // RED08 — Lids stuck morning
    { complaintCode: 'RED08', question: 'सुबह पलकें चिपकना कितने दिनों से है?', questionEn: 'Since how many days are the lids stuck in the morning?' }, // idx 14
    { complaintCode: 'RED08', question: 'स्राव सुबह के समय ज्यादा है या दिनभर रहता है?', questionEn: 'Is the discharge worse in the morning or present all day?' }, // idx 15
    // RED09 — Dry eyes / burning
    { complaintCode: 'RED09', question: 'जलन कब ज्यादा होती है — शाम को या एसी/पंखे के सामने?', questionEn: 'When is the burning worse — in the evening or in front of AC/fan?' }, // idx 16
    { complaintCode: 'RED09', question: 'दिनभर में मोबाइल/कंप्यूटर स्क्रीन कितने घंटे देखते हैं?', questionEn: 'How many hours a day do you look at mobile/computer screens?' }, // idx 17
    // RED10 — Contact lens red eye
    { complaintCode: 'RED10', question: 'लेंस रोज कितने घंटे पहनते हैं?', questionEn: 'How many hours a day do you wear the lenses?' }, // idx 18
    { complaintCode: 'RED10', question: 'क्या सोते समय भी लेंस पहनकर सो जाते हैं?', questionEn: 'Do you also sleep wearing the lenses?' }, // idx 19
    // RED11 — Severe red painful eye (ulcer suspect)
    { complaintCode: 'RED11', question: 'दर्द कितना तेज है और रोशनी से कितनी तकलीफ होती है?', questionEn: 'How severe is the pain, and how much trouble does light cause?' }, // idx 20
    { complaintCode: 'RED11', question: 'आंख की काली पुतली पर कोई सफेद धब्बा या धुंधली सफेद परत दिख रही है?', questionEn: 'Is a white spot or hazy white patch visible on the black of the eye?' }, // idx 21
    // PAN01 — Deep eye pain
    { complaintCode: 'PAN01', question: 'दर्द आंख के अंदर गहरा है या सिर्फ सतह पर चुभने जैसा?', questionEn: 'Is the pain deep inside the eye or just a surface pricking?' }, // idx 22
    { complaintCode: 'PAN01', question: 'दर्द के साथ मतली या उल्टी भी होती है?', questionEn: 'Is there nausea or vomiting along with the pain?' }, // idx 23
    // PAN02 — Photophobia
    { complaintCode: 'PAN02', question: 'रोशनी से चुभन कितने दिनों से है?', questionEn: 'Since how many days does light hurt the eye?' }, // idx 24
    { complaintCode: 'PAN02', question: 'धूप में निकलने पर आंखें अपने आप बंद हो जाती हैं?', questionEn: 'Do the eyes shut involuntarily when out in sunlight?' }, // idx 25
    // PAN03 — Angle-closure suspect
    { complaintCode: 'PAN03', question: 'दर्द अचानक शुरू हुआ या धीरे-धीरे — कब?', questionEn: 'Did the pain start suddenly or gradually — when?' }, // idx 26
    { complaintCode: 'PAN03', question: 'बत्तियों के चारों ओर रंगीन छल्ले या धुंधलापन भी दिखा?', questionEn: 'Coloured rings around bulbs or haziness too?' }, // idx 27
    // PAN04 — Evening tiredness
    { complaintCode: 'PAN04', question: 'थकान दिन के अंत में सबसे ज्यादा होती है?', questionEn: 'Is the tiredness worst towards the end of the day?' }, // idx 28
    { complaintCode: 'PAN04', question: 'रात की नींद कितने घंटे की होती है?', questionEn: 'How many hours of night sleep do you get?' }, // idx 29
    // PAN05 — Computer strain
    { complaintCode: 'PAN05', question: 'लगातार स्क्रीन देखने के कितने घंटे बाद लक्षण शुरू होते हैं?', questionEn: 'After how many hours of continuous screen time do symptoms start?' }, // idx 30
    { complaintCode: 'PAN05', question: 'काम के बीच में आराम (break) लेते हैं?', questionEn: 'Do you take breaks during work?' }, // idx 31
    // VIS01 — Distance blur
    { complaintCode: 'VIS01', question: 'धुंधलापन धीरे-धीरे बढ़ा है या अचानक आया है?', questionEn: 'Has the blurring increased gradually or come suddenly?' }, // idx 32
    { complaintCode: 'VIS01', question: 'आंखें आधी बंद कर (स्क्विंट कर) देखने पर दूर का साफ दिखता है?', questionEn: 'Does squinting make distant objects clearer?' }, // idx 33
    // VIS02 — Near blur / presbyopia
    { complaintCode: 'VIS02', question: 'पढ़ते समय धुंधलापन कब शुरू हुआ — थकान/रात में या हमेशा?', questionEn: 'When did near blur start — when tired/at night, or always?' }, // idx 34
    { complaintCode: 'VIS02', question: 'क्या आपकी उम्र 40 साल से ऊपर है?', questionEn: 'Are you above 40 years of age?' }, // idx 35
    // VIS03 — Sudden vision loss
    { complaintCode: 'VIS03', question: 'देखने में कमी अचानक आई — कितने घंटे/दिन पहले?', questionEn: 'Vision drop was sudden — how many hours/days ago?' }, // idx 36
    { complaintCode: 'VIS03', question: 'बिना दर्द के एक आंख में अचानक परछाई/धब्बा जैसा था?', questionEn: 'Was it a painless sudden shadow/patch in one eye?' }, // idx 37
    // VIS04 — Night blindness
    { complaintCode: 'VIS04', question: 'रात/धुंधले उजाले में दिखने की दिक्कत कितने समय से है?', questionEn: 'Since when is seeing at night/dim light difficult?' }, // idx 38
    { complaintCode: 'VIS04', question: 'रात में रास्ता दिखने में दिक्कत या अंधेरे में आंखों को एडजस्ट होने में देर लगती है?', questionEn: 'Difficulty seeing the path at night, or slow adjustment to darkness?' }, // idx 39
    // VIS05 — Halos
    { complaintCode: 'VIS05', question: 'हलो कब दिखते हैं — रात में बत्ती/गाड़ी की रोशनी देखते समय?', questionEn: 'When do the halos appear — looking at bulbs/headlights at night?' }, // idx 40
    { complaintCode: 'VIS05', question: 'हलो के साथ सिरदर्द या आंख का दर्द भी होता है?', questionEn: 'Do the halos come with headache or eye pain too?' }, // idx 41
    // VIS06 — Colored rings
    { complaintCode: 'VIS06', question: 'रंगीन घेरा कैसा दिखता है — इंद्रधनुषी रंगों वाला?', questionEn: 'What is the coloured ring like — rainbow coloured?' }, // idx 42
    { complaintCode: 'VIS06', question: 'रंगीन छल्ले दोनों आंखों में दिखते हैं या एक में?', questionEn: 'Are the coloured rings in both eyes or one?' }, // idx 43
    // VIS07 — Floaters
    { complaintCode: 'VIS07', question: 'काले धागे/कण कब से दिख रहे हैं?', questionEn: 'Since when are the black threads/spots visible?' }, // idx 44
    { complaintCode: 'VIS07', question: 'धागे धीरे-धीरे बढ़े हैं या अचानक बहुत सारे एक साथ आए?', questionEn: 'Have the threads increased gradually, or did many appear suddenly at once?' }, // idx 45
    // VIS08 — Flashes
    { complaintCode: 'VIS08', question: 'चमक के झटके किस तरफ दिखते हैं — नज़र के किनारों पर?', questionEn: 'Which side are the flashes — at the edges of your vision?' }, // idx 46
    { complaintCode: 'VIS08', question: 'झटके अंधेरे कमरे में ज्यादा या रोशनी में भी होते हैं?', questionEn: 'Are the flashes more in a dark room, or do they occur in light too?' }, // idx 47
    // VIS09 — Curtain in vision
    { complaintCode: 'VIS09', question: 'परदा/परछाई कितने घंटे पहले गिरी?', questionEn: 'How many hours ago did the curtain/shadow descend?' }, // idx 48
    { complaintCode: 'VIS09', question: 'एक तरफ से शुरू होकर बीच की ओर बढ़ रहा है?', questionEn: 'Did it start on one side and move towards the centre?' }, // idx 49
    // VIS10 — Glasses power
    { complaintCode: 'VIS10', question: 'मौजूदा चश्मा कब बनवाया था?', questionEn: 'When was your current pair of glasses made?' }, // idx 50
    { complaintCode: 'VIS10', question: 'चश्मा पहनकर भी सिरदर्द या धुंधला दिखना रहता है?', questionEn: 'Headache or blurred vision even while wearing the glasses?' }, // idx 51
    // VIS11 — Night driving
    { complaintCode: 'VIS11', question: 'रात में सामने से आती बत्तियों का तेज चमकना / फैलना महसूस होता है?', questionEn: 'Do oncoming headlights glare or spread out while driving at night?' }, // idx 52
    { complaintCode: 'VIS11', question: 'रात में गाड़ी चलाने से डर लगने लगा है?', questionEn: 'Have you started fearing night driving?' }, // idx 53
    // LID01 — Stye
    { complaintCode: 'LID01', question: 'दाना कितने दिनों से है — लाल और दर्द भरा?', questionEn: 'Since how many days is the lump — red and painful?' }, // idx 54
    { complaintCode: 'LID01', question: 'पहले भी इसी तरह के दाने पड़ चुके हैं?', questionEn: 'Have you had similar lumps before?' }, // idx 55
    // LID02 — Chalazion
    { complaintCode: 'LID02', question: 'गांठ कितने हफ्तों/महीनों से है — बिना दर्द के?', questionEn: 'Since how many weeks/months is the painless lump there?' }, // idx 56
    { complaintCode: 'LID02', question: 'गांठ पहले दर्द भरी थी और बाद में दर्द चला गया?', questionEn: 'Was the lump painful earlier, and the pain later settled?' }, // idx 57
    // LID03 — Blepharitis
    { complaintCode: 'LID03', question: 'पलकों के किनारों पर सुबह रूसी जैसी पपड़ी जमी रहती है?', questionEn: 'Do the lid margins have dandruff-like flakes in the morning?' }, // idx 58
    { complaintCode: 'LID03', question: 'आंखों में जलन दिन के अंत तक बढ़ जाती है?', questionEn: 'Does the burning increase by the end of the day?' }, // idx 59
    // LID04 — Ptosis
    { complaintCode: 'LID04', question: 'पलक गिरना अचानक हुआ है या जन्म से / धीरे-धीरे हुआ है?', questionEn: 'Did the droop happen suddenly, or has it been there since birth/gradually?' }, // idx 60
    { complaintCode: 'LID04', question: 'दोहरी झलक, सिरदर्द या वजन घटना भी हुआ है?', questionEn: 'Any double vision, headache or weight loss too?' }, // idx 61
    // TRU01 — Blunt injury
    { complaintCode: 'TRU01', question: 'चोट कैसे लगी — गेंद, मुक्का, पत्थर या सड़क हादसा?', questionEn: 'How did the injury happen — ball, fist, stone or road accident?' }, // idx 62
    { complaintCode: 'TRU01', question: 'चोट के बाद देखने में कमी या दो दिखना है?', questionEn: 'Vision drop or double vision after the injury?' }, // idx 63
    // TRU02 — Chemical injury
    { complaintCode: 'TRU02', question: 'कौन सी चीज गिरी — सफाई का तरल/तेजाब (एसिड) या चूना/डिटर्जेंट (क्षार)?', questionEn: 'Which substance fell — cleaning liquid/acid, or lime/detergent (alkali)?' }, // idx 64
    { complaintCode: 'TRU02', question: 'गिरने के तुरंत बाद पानी से धोया था — कितनी देर तक?', questionEn: 'Did you wash with water immediately after — for how long?' }, // idx 65
    // TRU03 — Sharp injury
    { complaintCode: 'TRU03', question: 'किस चीज से लगी — चाकू, कांच, तार या पटाखा?', questionEn: 'What object caused it — knife, glass, wire or a firecracker?' }, // idx 66
    { complaintCode: 'TRU03', question: 'आंख से पानी/खून बह रहा है या कोई काला गोला बाहर निकला है?', questionEn: 'Is fluid/blood leaking from the eye, or has a dark round mass come out?' }, // idx 67
    // TRU04 — Black eye
    { complaintCode: 'TRU04', question: 'चोट कब लगी और सूजन कितनी बढ़ी है?', questionEn: 'When was the injury, and how much has the swelling grown?' }, // idx 68
    { complaintCode: 'TRU04', question: 'देखने में कोई दिक्कत या आंख के अंदर दर्द है?', questionEn: 'Any vision trouble or pain inside the eye?' }, // idx 69
    // TRU05 — Firecracker injury
    { complaintCode: 'TRU05', question: 'पटाखा कैसा था — जमीन पर फटा (चूरा/अनार) या हाथ में फटा?', questionEn: 'What kind of cracker — burst on the ground (chura/anaar) or in the hand?' }, // idx 70
    { complaintCode: 'TRU05', question: 'चोट के बाद आंख में जलन, कांटे जैसी चुभन या दिखने में कमी है?', questionEn: 'Burning, pricking sensation or vision drop after the injury?' }, // idx 71
    // OTH01 — Cataract evaluation
    { complaintCode: 'OTH01', question: 'धुंधला दिखना कितने महीनों से है — धीरे-धीरे बढ़ रहा है?', questionEn: 'Since how many months is the blur — increasing gradually?' }, // idx 72
    { complaintCode: 'OTH01', question: 'रात में गाड़ी चलाने/चेहरे पहचानने में दिक्कत या चश्मे का नंबर बार-बार बदलना?', questionEn: 'Difficulty driving/recognising faces at night, or frequent glasses change?' }, // idx 73
    // OTH02 — Post-cataract check-up
    { complaintCode: 'OTH02', question: 'ऑपरेशन को कितने दिन/हफ्ते हुए हैं?', questionEn: 'How many days/weeks since the surgery?' }, // idx 74
    { complaintCode: 'OTH02', question: 'लाली, दर्द, ड्रॉप की जलन या दिखने में कमी है?', questionEn: 'Any redness, pain, drop stinging or vision drop?' }, // idx 75
    // OTH03 — Diabetic eye check-up
    { complaintCode: 'OTH03', question: 'शुगर कितने सालों से है और पिछला HbA1c कितना आया था?', questionEn: 'Since how many years the diabetes, and what was the last HbA1c?' }, // idx 76
    { complaintCode: 'OTH03', question: 'पुतली बड़ी करके (डाइलेटेड) रेटिना जांच पिछली बार कब हुई थी?', questionEn: 'When was your last dilated retinal examination?' }, // idx 77
    // OTH04 — BP eye check-up
    { complaintCode: 'OTH04', question: 'बीपी कितने सालों से है और आज की रीडिंग कितनी है?', questionEn: 'Since how many years the BP, and what is today\'s reading?' }, // idx 78
    { complaintCode: 'OTH04', question: 'देखने में कोई दिक्कत है या सिर्फ नियमित जांच के लिए आए हैं?', questionEn: 'Any vision trouble, or just here for a routine check?' }, // idx 79
    // OTH05 — Glaucoma suspect
    { complaintCode: 'OTH05', question: 'परिवार में किसी को ग्लौकोमा (काला पानी) है या रहा है?', questionEn: 'Does anyone in the family have or had glaucoma?' }, // idx 80
    { complaintCode: 'OTH05', question: 'आंखों का फील्ड (दिखने का क्षेत्र) टेस्ट पहले कभी हुआ है?', questionEn: 'Has a visual field test of your eyes ever been done?' }, // idx 81
    // OTH06 — Routine check-up
    { complaintCode: 'OTH06', question: 'पिछली पूरी आंख जांच कब हुई थी?', questionEn: 'When was your last complete eye examination?' }, // idx 82
    { complaintCode: 'OTH06', question: 'चश्मा या कॉन्टैक्ट लेंस इस्तेमाल करते हैं?', questionEn: 'Do you use glasses or contact lenses?' }, // idx 83
    // OTH07 — Pre-LASIK
    { complaintCode: 'OTH07', question: 'चश्मे का नंबर कितने सालों से स्थिर (stable) है?', questionEn: 'Since how many years has your glasses power been stable?' }, // idx 84
    { complaintCode: 'OTH07', question: 'उम्र क्या है और कॉर्निया की मोटाई (corneal thickness) की जांच हुई है?', questionEn: 'What is your age, and has corneal thickness been evaluated?' }, // idx 85
    // OTH08 — Squint child
    { complaintCode: 'OTH08', question: 'आंख का टेढ़ापन जन्म से है या बाद में शुरू हुआ?', questionEn: 'Has the eye turn been there since birth, or did it start later?' }, // idx 86
    { complaintCode: 'OTH08', question: 'टेढ़ापन थकान/बुखार में बढ़ता है और बच्चा टीवी बहुत पास से देखता है?', questionEn: 'Does the turn increase with tiredness/fever, and does the child watch TV very close?' }, // idx 87
    // OTH09 — White pupil child
    { complaintCode: 'OTH09', question: 'सफेद चमक कहां दिखी — तस्वीरों में (कैमरा फ्लैश में) या अंधेरे में?', questionEn: 'Where was the white glow seen — in photos (camera flash) or in dim light?' }, // idx 88
    { complaintCode: 'OTH09', question: 'बच्चे की उम्र क्या है, और यह एक आंख में है या दोनों में?', questionEn: 'What is the child\'s age, and is it in one eye or both?' }, // idx 89
    // OTH10 — Lazy eye suspect
    { complaintCode: 'OTH10', question: 'बच्चे की उम्र क्या है?', questionEn: 'What is the child\'s age?' }, // idx 90
    { complaintCode: 'OTH10', question: 'स्कूल/कैंप की स्क्रीनिंग में कोई कमजोर आंख पकड़ी गई थी?', questionEn: 'Was a weak eye picked up in a school/camp screening?' }, // idx 91
  ],

  // ══ Suggestions (184 — exactly 2 per question; questionIndex = idx) ══
  // Patient-printable bilingual advice; the red-flag/refer lines carry the
  // emergency discipline of this pack.
  suggestions: [
    // q0 (RED01 one/both)
    { questionIndex: 0, text: 'दोनों आंखें धीरे-धीरे लाल — आम नेत्रशोथ; हाथ धोएं, तौलिया/रूमाल अलग रखें', textEn: 'Both eyes gradually red — common conjunctivitis; wash hands, keep towel/handkerchief separate' },
    { questionIndex: 0, text: 'एक आंख गहरी लाल + दर्द — गहरी समस्या की आशंका — उसी दिन नेत्र विशेषज्ञ', textEn: 'One eye deeply red + pain — deeper problem suspected — eye specialist the same day' },
    // q1 (RED01 duration)
    { questionIndex: 1, text: '3 दिन से कम, हल्का — सफाई + लुब्रिकेंट ड्रॉप, 2-3 दिन में सुधार देखें', textEn: 'Under 3 days, mild — hygiene + lubricant drops, watch for improvement in 2-3 days' },
    { questionIndex: 1, text: '5 दिन से ज्यादा या बढ़ता लालपन — स्लिट-लैंप जांच जरूरी (कॉर्निया देखना होगा)', textEn: 'Beyond 5 days or worsening redness — slit-lamp examination needed (cornea must be seen)' },
    // q2 (RED02 discharge type)
    { questionIndex: 2, text: 'पीला/हरा गाढ़ा मवाद — बैक्टीरियल संक्रमण की आशंका — जांच के बाद एंटीबायोटिक आई-ड्रॉप', textEn: 'Thick yellow/green pus — bacterial infection likely — antibiotic eye drops after examination' },
    { questionIndex: 2, text: 'पानी जैसा साफ स्राव — वायरल/एलर्जी — एंटीबायोटिक जरूरी नहीं; सफाई + ठंडी सिकाई', textEn: 'Watery clear discharge — viral/allergic — antibiotic not needed; hygiene + cold compress' },
    // q3 (RED02 cleaning frequency) — full drop technique line
    { questionIndex: 3, text: 'ड्रॉप लगाने का सही तरीका: पहले हाथ धोएं → नीची पलक नीचे खींचें → 1 बूंद डालें → आंख 1 मिनट बंद रखें → बोतल की नोज़ आंख/पलक को न छूए → दो दवाओं के बीच 5 मिनट का अंतर', textEn: 'Correct drop technique: wash hands first → pull lower lid down → instil 1 drop → keep eye closed 1 minute → bottle tip must not touch eye/lid → keep a 5-minute gap between two different drops' },
    { questionIndex: 3, text: 'आंख की दवा, तौलिया, काजल या सुरमा कभी किसी और से शेयर न करें — बीमारी इसी से फैलती है', textEn: 'Never share eye medicines, towels, kajal or surma with anyone — this is how eye infections spread' },
    // q4 (RED03 watering duration)
    { questionIndex: 4, text: 'महीनों से बिना दर्द के पानी बहना — अश्रु नली बंद होने की जांच कराएं (नली सिरिंजिंग टेस्ट)', textEn: 'Months of painless watering — get the tear duct checked (duct syringing test)' },
    { questionIndex: 4, text: 'हाल के दिनों में शुरू + लाली/किरकिराहट — पहले सतही कारण का इलाज, फिर देखें', textEn: 'Started recently with redness/grittiness — treat the surface cause first, then reassess' },
    // q5 (RED03 regurgitation)
    { questionIndex: 5, text: 'कोने पर दबाने से गाढ़ा स्राव वापस — नली ब्लॉक की पुष्टि जैसा — सिरिंजिंग/प्रोबिंग की योजना बनाएं', textEn: 'Thick fluid reflux on pressing the corner — consistent with duct block — plan syringing/probing' },
    { questionIndex: 5, text: 'दबाने पर कुछ नहीं — सामान्य आंसू बहना — लुब्रिकेंट + निगरानी काफी है', textEn: 'Nothing on pressure — simple watering — lubricant + observation suffices' },
    // q6 (RED04 itch both/one)
    { questionIndex: 6, text: 'दोनों आंखों में मौसमी खुजली — एलर्जिक नेत्रशोथ — जांच के बाद एंटी-एलर्जिक ड्रॉप का कोर्स', textEn: 'Seasonal itch in both eyes — allergic conjunctivitis — anti-allergic drop course after examination' },
    { questionIndex: 6, text: 'एक आंख में तेज खुजली — कण/लेंस की समस्या भी हो सकती है — रगड़ें नहीं, जांच कराएं', textEn: 'Intense itch in one eye — particle/lens problem also possible — do not rub, get examined' },
    // q7 (RED04 itch + systemic)
    { questionIndex: 7, text: 'काले घेरे + छींक/जुकाम — एटोपिक झुकाव — मुंह से ली जाने वाली एंटीहिस्टामिन दवा भी चलेगी', textEn: 'Dark circles + sneezing/cold — atopic tendency — an oral antihistamine course also helps' },
    { questionIndex: 7, text: 'आंख तक सीमित — टॉपिकल एंटी-एलर्जिक ड्रॉप + ट्रिगर से बचाव काफी — रगड़ना बिल्कुल बंद', textEn: 'Limited to the eyes — topical anti-allergic drops + trigger avoidance suffice — stop all rubbing' },
    // q8 (RED05 season)
    { questionIndex: 8, text: 'गर्मी/बसंत की धूल में बार-बार — मौसमी एलर्जी का पैटर्न — धूप का चश्मा पहनें और मौसम शुरू होने से पहले ड्रॉप शुरू करने की योजना बनाएं', textEn: 'Recurring in summer/spring dust — seasonal allergy pattern — wear protective glasses and plan to start drops before the season begins' },
    { questionIndex: 8, text: 'सालभर रहती है — घर की धूल/पालतू जानवर जैसे ट्रिगर तलाशें — विस्तृत एलर्जी जांच सोचें', textEn: 'Present all year — hunt for indoor dust/pet triggers — consider a detailed allergy workup' },
    // q9 (RED05 family atopy)
    { questionIndex: 9, text: 'परिवार में दमा/एक्जिमा — एटोपिक झुकाव — इलाज लंबा चलेगा; घर की दवाई वाली पुरानी स्टेरॉयड ड्रॉप कभी खुद न लगाएं', textEn: 'Family asthma/eczema — atopic tendency — treatment runs longer; NEVER self-apply old steroid drops lying at home' },
    { questionIndex: 9, text: 'परिवार में कोई नहीं — वातावरण का ट्रिगर तलाशें — ठंडी सिकाई आराम देती है', textEn: 'No family history — hunt the environmental trigger — cold compresses give relief' },
    // q10 (RED06 real vs feeling)
    { questionIndex: 10, text: 'कुछ गया नहीं, बस चुभन का एहसास — सूखी आंख या पलक की समस्या — लुब्रिकेंट ड्रॉप ट्रायल', textEn: 'Nothing went in, just the feeling — dry eye or lid problem — lubricant drop trial' },
    { questionIndex: 10, text: 'धूल/रेत का संपर्क जरूर था — रगड़े बिना जांच; कण पलक के नीचे छिपा हो सकता है', textEn: 'There was dust/sand exposure — examination without rubbing; a particle may hide under the lid' },
    // q11 (RED06 light/blink worsens)
    { questionIndex: 11, text: 'हां — कॉर्निया पर आंच की आशंका — उसी दिन स्लिट-लैंप; खुद से कोई दवा न शुरू करें', textEn: 'Yes — corneal abrasion suspected — slit-lamp the same day; do not start any medicine on your own' },
    { questionIndex: 11, text: 'नहीं — पलक/कंजंक्टिवा की वजह — लुब्रिकेंट ड्रॉप + 24 घंटे में सुधार देखें', textEn: 'No — lid/conjunctival cause — lubricant drops + watch for improvement over 24 hours' },
    // q12 (RED07 what fell)
    { questionIndex: 12, text: 'लोहे/धातु का कण — रगड़ें नहीं, उसी दिन क्लिनिक से निकालवाएं — छोड़ने पर जंग का दाग बनता है', textEn: 'Iron/metal particle — do not rub, get it removed at the clinic the same day — leaving it causes a rust stain' },
    { questionIndex: 12, text: 'धूल/कीट — साफ पानी में आंख झपकें (धोएं), फिर भी चुभता है तो जांच — पैराफिन/तेल बूंद में मदद मिलती है', textEn: 'Dust/insect — blink/rinse the eye in clean water; if it still pricks, get examined — a paraffin/lubricant drop helps' },
    // q13 (RED07 symptoms since)
    { questionIndex: 13, text: 'दर्द + पानी + धुंधला — कॉर्निया खरोंच की आशंका — उसी दिन जांच; लेंस बिल्कुल बंद', textEn: 'Pain + watering + blur — corneal abrasion suspected — same-day examination; lenses strictly off' },
    { questionIndex: 13, text: 'हल्की किरकिराहट भर — लुब्रिकेंट + 24 घंटे निगरानी; बढ़े तो तुरंत आएं', textEn: 'Only mild grittiness — lubricant + 24-hour watch; return immediately if it worsens' },
    // q14 (RED08 duration)
    { questionIndex: 14, text: 'कुछ दिनों से + स्राव — संक्रमण जन्य नेत्रशोथ — सफाई कड़ी + जांच के बाद ड्रॉप', textEn: 'Few days + discharge — infective conjunctivitis — strict hygiene + drops after examination' },
    { questionIndex: 14, text: 'हफ्तों से सिर्फ सुबह — पुराना नेत्रशोथ/पलक रोग — पलक सफाई (lid hygiene) रोज़ शुरू करें', textEn: 'Weeks of mornings-only — chronic conjunctivitis/blepharitis — start daily lid hygiene' },
    // q15 (RED08 timing)
    { questionIndex: 15, text: 'सुबह ज्यादा — रातभर का जमा स्राव — उठते ही गुनगुने पानी से रुई से साफ करें, आंख के अंदर से बाहर की ओर', textEn: 'Worse in the morning — overnight discharge build-up — clean with cotton and warm water from the inner to the outer corner on waking' },
    { questionIndex: 15, text: 'दिनभर + दर्द/रोशनी से चुभन — केराटाइटिस का खतरा — उसी दिन स्लिट-लैंप', textEn: 'All day + pain/light sensitivity — keratitis risk — slit-lamp the same day' },
    // q16 (RED09 burning when)
    { questionIndex: 16, text: 'शाम/एसी-पंखे में ज्यादा — सूखी आंख — दिन में 4 बार लुब्रिकेंट ड्रॉप + कमरे में नमी बनाए रखें', textEn: 'Worse in the evening/AC-fan — dry eye — lubricant drops 4 times a day + maintain room humidity' },
    { questionIndex: 16, text: 'दिनभर जलन + रेत जैसा एहसास — मध्यम सूखी आंख — रात में गाढ़ी जेल ड्रॉप भी जोड़ें', textEn: 'All-day burning + sandy feeling — moderate dry eye — add a thicker gel drop at night too' },
    // q17 (RED09 screen hours)
    { questionIndex: 17, text: '6+ घंटे स्क्रीन — कंप्यूटर विज़न सिंड्रोम — 20-20-20 नियम अनिवार्य: हर 20 मिनट में, 20 फीट दूर, 20 सेकंड देखें', textEn: '6+ hours of screen — computer vision syndrome — the 20-20-20 rule is mandatory: every 20 minutes, look 20 feet away for 20 seconds' },
    { questionIndex: 17, text: 'स्क्रीन कम — मुद्रा/ब्रेक सुधारें — जरूरत पर लुब्रिकेंट ड्रॉप', textEn: 'Less screen — improve posture/breaks — lubricant drops when needed' },
    // q18 (RED10 CL hours)
    { questionIndex: 18, text: 'रोज 10+ घंटे — ओवरवियर — घंटे घटाएं; आंख लाल होते ही लेंस तुरंत उतार देने का नियम याद रखें', textEn: '10+ hours daily — overwear — reduce hours; remember the rule: the moment the eye turns red, remove the lens immediately' },
    { questionIndex: 18, text: 'कम घंटे — अच्छा — रब-रिंस सफाई, केस का पानी रोज बदलें, केस 3 महीने में नया', textEn: 'Fewer hours — good — rub-and-rinse cleaning, change case solution daily, replace the case every 3 months' },
    // q19 (RED10 sleep in lenses)
    { questionIndex: 19, text: 'हां — आज से बंद — लेंस पहनकर सोना कभी नहीं: कॉर्नियल अल्सर का सबसे बड़ा कारण', textEn: 'Yes — stop from today — NEVER sleep in lenses: the biggest cause of corneal ulcers' },
    { questionIndex: 19, text: 'नहीं — बहुत अच्छा — लाल आंख = लेंस उतारना तुरंत, आंख पूरी साफ होने तक लेंस बंद', textEn: 'No — excellent — red eye = lens out immediately, no lenses until the eye is fully clear' },
    // q20 (RED11 severity/light)
    { questionIndex: 20, text: 'तेज दर्द + रोशनी से तकलीफ — केराटाइटिस/अल्सर की आशंका — उसी दिन नेत्र विशेषज्ञ; स्टेरॉयड या घर की पुरानी दवा से खुद इलाज कभी नहीं', textEn: 'Severe pain + light intolerance — keratitis/ulcer suspected — eye specialist the same day; never self-treat with steroids or old medicines at home' },
    { questionIndex: 20, text: 'मध्यम दर्द + हल्की फोटोफोबिया — फिर भी 24 घंटे के अंदर स्लिट-लैंप जांच जरूरी', textEn: 'Moderate pain + mild photophobia — a slit-lamp examination within 24 hours is still essential' },
    // q21 (RED11 white patch)
    { questionIndex: 21, text: 'सफेद धब्बा/धुंधली परत दिखती है — कॉर्नियल अल्सर की तीव्र आशंका — तुरंत विशेषज्ञ (कल्चर लेना होगा)', textEn: 'A white spot or hazy patch is visible — strong suspicion of corneal ulcer — specialist immediately (culture will be needed)' },
    { questionIndex: 21, text: 'सफेद धब्बा नहीं पर गहरी लाल दर्द भरी आंख — फिर भी उसी दिन जांच — देरी से दाग बन सकता है', textEn: 'No white patch but a deeply red painful eye — still examine the same day — delay can leave a scar' },
    // q22 (PAN01 deep vs surface)
    { questionIndex: 22, text: 'गहरा, आंख के अंदर/भौंह वाला दर्द — यूविआइटिस/स्क्लेराइटिस/ग्लौकोमा जैसे कारण — उसी दिन रेफर', textEn: 'Deep, intraocular/brow pain — uveitis/scleritis/glaucoma-type causes — refer the same day' },
    { questionIndex: 22, text: 'सतह पर चुभन — कॉर्निया/कंजंक्टिवा की वजह — स्लिट-लैंप से पक्का करें', textEn: 'Surface pricking — corneal/conjunctival cause — confirm with the slit-lamp' },
    // q23 (PAN01 nausea)
    { questionIndex: 23, text: 'दर्द + उल्टी + हलो — एक्यूट एंगल-क्लोज़र ग्लौकोमा आक्रमण — आपातकाल: उसी घंटे अस्पताल (IV इलाज चाहिए)', textEn: 'Pain + vomiting + halos — acute angle-closure glaucoma attack — EMERGENCY: hospital within the same hour (IV treatment needed)' },
    { questionIndex: 23, text: 'मतली नहीं — फिर भी गहरे दर्द की जांच टालें नहीं — विशेषज्ञ 1-2 दिन में', textEn: 'No nausea — still do not delay the workup of deep eye pain — specialist within 1-2 days' },
    // q24 (PAN02 photophobia duration)
    { questionIndex: 24, text: 'लाल आंख के साथ रोशनी से चुभन — केराटाइटिस/यूविआइटिस — उसी दिन जांच; काला चश्मा सिर्फ आराम के लिए, इलाज नहीं', textEn: 'Photophobia with a red eye — keratitis/uveitis — same-day examination; dark glasses are only for comfort, not treatment' },
    { questionIndex: 24, text: 'हल्की, अकेली — रोशनी वाली जांच कराएं; तब तक डार्क ग्लासेस आराम देंगे', textEn: 'Mild, isolated — get a full eye examination; dark glasses will comfort you meanwhile' },
    // q25 (PAN02 sun shuts eyes)
    { questionIndex: 25, text: 'हां, आंखें अपने आप बंद — सच्ची फोटोफोबिया — पुतली + स्लिट-लैंप जांच जरूरी', textEn: 'Yes, eyes shut involuntarily — true photophobia — pupil + slit-lamp examination essential' },
    { questionIndex: 25, text: 'सिर्फ चमक (glare) — आंख के मीडिया (शुरुआती मोतियाबिंद) जांचें — पूरी आंख जांच कराएं', textEn: 'Only glare — check the eye media (early cataract) — get a comprehensive eye examination' },
    // q26 (PAN03 sudden)
    { questionIndex: 26, text: 'अचानक तेज दर्द + धुंधला + हलो — एंगल-क्लोज़र आक्रमण — आपातकाल, उसी घंटे अस्पताल', textEn: 'Sudden severe pain + blur + halos — angle-closure attack — EMERGENCY, hospital within the same hour' },
    { questionIndex: 26, text: 'धीरे-धीरे दर्द — पुराना एंगल/ग्लौकोमा जांच — इसी हफ्ते IOP + फंडस', textEn: 'Gradual pain — chronic angle/glaucoma workup — IOP + fundus this week' },
    // q27 (PAN03 rings/haze)
    { questionIndex: 27, text: 'रंगीन छल्ले + सिरदर्द — एंगल-क्लोज़र/ग्लौकोमा की तीव्र आशंका — आज ही IOP जांच', textEn: 'Coloured rings + headache — strong suspicion of angle-closure/glaucoma — IOP check today' },
    { questionIndex: 27, text: 'सिर्फ रात में हलो — शुरुआती मोतियाबिंद/कॉर्नियल एडिमा — पूरी आंख जांच कराएं', textEn: 'Halos only at night — early cataract/corneal edema — get a comprehensive eye examination' },
    // q28 (PAN04 timing)
    { questionIndex: 28, text: 'दिन के अंत में बढ़ती थकान — डिजिटल स्ट्रेन + बिना जांचा नंबर — रिफ्रैक्शन जांच + 20-20-20', textEn: 'Tiredness building at day-end — digital strain + uncorrected refractive error — refraction check + 20-20-20' },
    { questionIndex: 28, text: 'सुबह से थकान — नींद की मात्रा/गुणवत्ता पहले ठीक करें', textEn: 'Tired from morning itself — fix sleep quantity/quality first' },
    // q29 (PAN04 sleep)
    { questionIndex: 29, text: '6 घंटे से कम — 7-8 घंटे की नींद लक्ष्य बनाएं; सोने से 1 घंटा पहले स्क्रीन बंद', textEn: 'Under 6 hours — target 7-8 hours of sleep; screens off one hour before bed' },
    { questionIndex: 29, text: 'नींद पूरी फिर भी थकान — रिफ्रैक्शन + सूखी आंख जांच कराएं', textEn: 'Sleep adequate yet tired — get refraction + dry eye evaluation' },
    // q30 (PAN05 hours to symptoms)
    { questionIndex: 30, text: '2-3 घंटे में ही लक्षण — तेज स्क्रीन स्ट्रेन — ब्रेक + स्क्रीन दूरी (एक बांह दूर) + लुब्रिकेंट जरूरी', textEn: 'Symptoms within 2-3 hours — strong screen strain — breaks + screen distance (one arm-length) + lubricants needed' },
    { questionIndex: 30, text: 'दिन के आखिर में ही — हल्का — 20-20-20 नियम + लुब्रिकेंट ड्रॉप दिन में 2-4 बार', textEn: 'Only by day-end — mild — 20-20-20 rule + lubricant drops 2-4 times a day' },
    // q31 (PAN05 breaks)
    { questionIndex: 31, text: 'ब्रेक नहीं — 20-20-20 शुरू करें: हर 20 मिनट में 20 फीट दूर 20 सेकंड; झपकना याद रखें (स्क्रीन पर झपकना 60% घटता है)', textEn: 'No breaks — start 20-20-20: every 20 minutes, 20 feet away for 20 seconds; remember to blink (blinking drops 60% on screens)' },
    { questionIndex: 31, text: 'ब्रेक लेते हैं — फिर भी दिक्कत — स्क्रीन की ऊंचाई (आंख से थोड़ी नीचे), एंटी-ग्लेयर शीशा/कोटिंग और लुब्रिकेंट सुधार करेंगे', textEn: 'Taking breaks yet troubled — screen height (slightly below eye level), anti-glare screen/coating and lubricants will fix it' },
    // q32 (VIS01 gradual vs sudden)
    { questionIndex: 32, text: 'धीरे-धीरे, सालों में — रिफ्रैक्टिव एरर (नंबर) — रिफ्रैक्शन जांच + चश्मा; बच्चों को रोज 2 घंटे बाहर खेल — नंबर बढ़ना धीमा होता है', textEn: 'Gradual over years — refractive error — refraction test + glasses; children need 2 hours of outdoor play daily — slows myopia progression' },
    { questionIndex: 32, text: 'अचानक — रेफर-झंडा: रेटिना/नस/वाहिका कारण — उसी दिन आंख जांच, टालें नहीं', textEn: 'Sudden — refer-flag: retinal/nerve/vascular cause — same-day eye examination, do not delay' },
    // q33 (VIS01 squinting clears)
    { questionIndex: 33, text: 'हां, आधी बंद आंख से साफ — नंबर की पुष्टि — रिफ्रैक्शन कराएं', textEn: 'Yes, clearer when squinting — refractive error confirmed — get refraction done' },
    { questionIndex: 33, text: 'नहीं — पिनहोल टेस्ट क्लिनिक में; पिनहोल से साफ = नंबर, नहीं = मीडिया/रेटिना जांच', textEn: 'No — pinhole test in clinic; clear with pinhole = refractive, not clear = media/retina workup' },
    // q34 (VIS02 timing)
    { questionIndex: 34, text: 'थकान/रात में, 40 की उम्र पार — प्रेस्बायोपिया — पास का चश्मा बनवाएं', textEn: 'When tired/at night, past 40 — presbyopia — get near-vision glasses made' },
    { questionIndex: 34, text: 'हमेशा + दूर भी धुंधला — हाइपरमेट्रोपिया की आशंका — साइक्लोप्लेजिक रिफ्रैक्शन (बच्चों में जरूरी)', textEn: 'Always + distance also blurred — hypermetropia suspected — cycloplegic refraction (essential in children)' },
    // q35 (VIS02 age)
    { questionIndex: 35, text: '40+ — पास का नंबर उम्र का सामान्य हिस्सा है — कमजोरी नहीं; रीडिंग ग्लासेस बनवाएं', textEn: '40+ — near blur is a normal part of ageing — not weakness; get reading glasses made' },
    { questionIndex: 35, text: '40 से कम — और कारण तलाशें — रिफ्रैक्शन + सूखी आंख जांच', textEn: 'Under 40 — look for other causes — refraction + dry eye evaluation' },
    // q36 (VIS03 timing)
    { questionIndex: 36, text: 'घंटों के अंदर, बिना दर्द — रेटिना की नस जाम (CRAO/CRVO) — आपातकाल: 90 मिनट की गोल्डन विंडो, तुरंत अस्पताल', textEn: 'Within hours, painless — retinal vessel occlusion (CRAO/CRVO) — EMERGENCY: 90-minute golden window, hospital immediately' },
    { questionIndex: 36, text: 'दिनों में बढ़ा — ऑप्टिक नर्व/रेटिना कारण — इसी हफ्ते तत्काल विशेषज्ञ', textEn: 'Worsened over days — optic nerve/retinal cause — urgent specialist this week' },
    // q37 (VIS03 painless shadow)
    { questionIndex: 37, text: 'बिना दर्द एक तरफ धब्बा/परछाई — नस जामने की तीव्र आशंका — घंटों की बात, तुरंत ER', textEn: 'Painless one-sided shadow/patch — strong suspicion of vessel occlusion — a matter of hours, straight to ER' },
    { questionIndex: 37, text: 'दर्द के साथ — सूजन/न्यूरो कारण — फिर भी तत्काल; देरी = स्थायी नुकसान', textEn: 'With pain — inflammatory/neurological cause — still urgent; delay = permanent damage' },
    // q38 (VIS04 duration)
    { questionIndex: 38, text: 'लंबे समय से + खान-पान कमजोर — विटामिन A की कमी की आशंका — पर्यवेक्षण में खुराक; हरी सब्ज़ी, गाजर, पपीता, दूध रोज़', textEn: 'Long-standing + poor diet — vitamin A deficiency suspected — supervised supplementation; green vegetables, carrot, papaya, milk daily' },
    { questionIndex: 38, text: 'जन्म/बचपन से — रेटिना की जन्मजात बीमारी (RP स्क्रीन) — विशेषज्ञ रेफर', textEn: 'Since birth/childhood — congenital retinal disease (RP screen) — specialist referral' },
    // q39 (VIS04 adaptation)
    { questionIndex: 39, text: 'खान-पान में हरी सब्ज़ी/दूध नहीं — विटामिन A सपोर्ट शुरू करें — ज्यादा खुराक खुद कभी नहीं', textEn: 'No green vegetables/milk in diet — start vitamin A support — never take high doses on your own' },
    { questionIndex: 39, text: 'दिन में भी दिखने का क्षेत्र सिकुड़ रहा — रेटिनाइटिस पिगमेंटोसा स्क्रीन — विशेषज्ञ रेफर', textEn: 'Field of vision narrowing in daytime too — retinitis pigmentosa screen — specialist referral' },
    // q40 (VIS05 halos when)
    { questionIndex: 40, text: 'रात की बत्ती देखते समय — कॉर्नियल एडिमा/शुरुआती मोतियाबिंद — पूरी जांच + IOP नाप', textEn: 'While looking at bulbs at night — corneal edema/early cataract — comprehensive exam + IOP measurement' },
    { questionIndex: 40, text: 'हलो + आंख दर्द/सिरदर्द — ग्लौकोमा की आशंका — उसी दिन IOP जांच', textEn: 'Halos + eye pain/headache — glaucoma suspected — IOP check the same day' },
    // q41 (VIS05 with pain)
    { questionIndex: 41, text: 'हां — एंगल-क्लोज़र जोखिम — IOP + गोनियोस्कोपी रेफर आज ही', textEn: 'Yes — angle-closure risk — IOP + gonioscopy referral today' },
    { questionIndex: 41, text: 'नहीं — शुरुआती मोतियाबिंद जैसा — निगरानी + रिफ्रैक्शन; 6 महीने में दोबारा', textEn: 'No — like early cataract — monitoring + refraction; review in 6 months' },
    // q42 (VIS06 rainbow)
    { questionIndex: 42, text: 'इंद्रधनुषी रंग — कॉर्नियल एडिमा/ग्लौकोमा की आशंका — उसी दिन IOP + जांच', textEn: 'Rainbow colours — corneal edema/glaucoma suspected — IOP + examination the same day' },
    { questionIndex: 42, text: 'एक ही रंग की चमक — मोतियाबिंद/प्रकाश-बिखराव — पूरी आंख जांच कराएं', textEn: 'Single-colour glow — cataract/light scatter — get a comprehensive eye examination' },
    // q43 (VIS06 both/one)
    { questionIndex: 43, text: 'दोनों आंखों में — मीडिया/सिस्टमिक कारण — दोनों आंखों की पूरी जांच', textEn: 'In both eyes — media/systemic cause — comprehensive examination of both eyes' },
    { questionIndex: 43, text: 'एक आंख में — असममित = तत्काल — उसी दिन विस्तृत जांच', textEn: 'In one eye — asymmetric = urgent — detailed examination the same day' },
    // q44 (VIS07 duration)
    { questionIndex: 44, text: 'सालों से, ज्यों के त्यों — सामान्य विट्रियस क्षय — सालाना रेटिना जांच निगरानी रखें', textEn: 'For years, unchanged — benign vitreous degeneration — keep annual retinal check monitoring' },
    { questionIndex: 44, text: 'नया/अचानक बढ़ा — डाइलेटेड फंडस जांच उसी दिन (रेटिना आंसू का खतरा)', textEn: 'New/sudden increase — dilated fundus examination the same day (retinal tear risk)' },
    // q45 (VIS07 increase pattern)
    { questionIndex: 45, text: 'अचानक बहुत सारे + बिजली झटके — रेटिना फाड़ का खतरा — आपातकाल, उसी दिन रेटिना विशेषज्ञ', textEn: 'Many suddenly + flashes — retinal tear risk — EMERGENCY, retina specialist the same day' },
    { questionIndex: 45, text: 'धीरे-धीरे कुछ — निगरानी; झटके या परदा आए तो तुरंत आएं', textEn: 'A few gradually — monitor; report immediately if flashes or a curtain appear' },
    // q46 (VIS08 location)
    { questionIndex: 46, text: 'किनारों पर झटके — विट्रियस रेटिना खींच रहा है — उसी दिन डाइलेटेड जांच', textEn: 'Flashes at the edges — vitreous tugging the retina — dilated examination the same day' },
    { questionIndex: 46, text: 'बीच में झिलमिलाहट — दिनों में जांच; बार-बार + सिरदर्द = माइग्रेन न्यूरो सोचें', textEn: 'Central sparkles — examination within days; recurrent + headache = consider migraine, neuro opinion' },
    // q47 (VIS08 dark vs light)
    { questionIndex: 47, text: 'अंधेरे में ज्यादा — PVD का खिंचाव — उसी दिन डाइलेटेड फंडस जांच', textEn: 'More in the dark — PVD traction — dilated fundus examination the same day' },
    { questionIndex: 47, text: 'सिरदर्द के साथ — ऑप्थाल्मिक माइग्रेन संभव — बार-बार हो तो न्यूरो', textEn: 'With headache — ophthalmic migraine possible — neuro opinion if recurrent' },
    // q48 (VIS09 hours)
    { questionIndex: 48, text: '24-48 घंटे के अंदर — रेटिना डिटैचमेंट आपातकाल — उसी घंटे रेटिना सर्जन; कोई दवा नहीं, इंतज़ार बिल्कुल नहीं', textEn: 'Within 24-48 hours — retinal detachment EMERGENCY — retina surgeon within the hour; no drops, absolutely no waiting' },
    { questionIndex: 48, text: 'पुराना आंशिक परदा — फिर भी तत्काल रेटिना क्लिनिक — बची हुई दृष्टि बचानी है', textEn: 'Older partial curtain — still urgent retina clinic — the remaining vision has to be saved' },
    // q49 (VIS09 progression)
    { questionIndex: 49, text: 'किनारे से बीच की ओर बढ़ रहा — क्लासिक RD प्रगति — अभी निकलें, खाना-पीना रोकें (सर्जरी हो सकती है)', textEn: 'Moving from the edge to the centre — classic RD progression — leave now, stop eating/drinking (surgery may be needed)' },
    { questionIndex: 49, text: 'स्थिर जैसा — फिर भी उसी दिन डाइलेटेड जांच अनिवार्य', textEn: 'Appears static — dilated examination the same day is still mandatory' },
    // q50 (VIS10 last glasses)
    { questionIndex: 50, text: '1 साल से ज्यादा — नंबर बदल चुका होगा — आज रिफ्रैक्शन दोबारा', textEn: 'Over a year old — the power would have changed — refraction again today' },
    { questionIndex: 50, text: 'हाल का — अच्छा — घर पर स्नेलेन चार्ट लगाकर महीने में एक बार खुद जांचें; 6/9 या उससे खराब दिखे तो आएं', textEn: 'Recent — good — put up a Snellen chart at home and self-check monthly; if 6/9 or worse, come in' },
    // q51 (VIS10 headache with glasses)
    { questionIndex: 51, text: 'हां — नंबर/एस्टिग्मैटिज़्म बदला होगा — रिफ्रैक्शन दोबारा; पुराना चश्मा जांच में लाएं', textEn: 'Yes — power/astigmatism would have changed — refraction again; bring the old glasses to the visit' },
    { questionIndex: 51, text: 'नहीं — चश्मा सही — जारी रखें; सालाना जांच बनाए रखें', textEn: 'No — glasses are fine — continue; keep annual checks' },
    // q52 (VIS11 glare)
    { questionIndex: 52, text: 'बत्तियां चमकती/फैलती हैं — शुरुआती मोतियाबिंद + सूखी आंख — पूरी जांच; एंटी-ग्लेयर (anti-reflective) चश्मा वैसे ही मदद करेगा', textEn: 'Headlights glare/spread — early cataract + dry eye — comprehensive exam; anti-reflective glasses will help meanwhile' },
    { questionIndex: 52, text: 'रात में दूर धुंधला — नंबर अपडेट जरूरी — रिफ्रैक्शन कराएं', textEn: 'Distance blurred at night — power update needed — get refraction done' },
    // q53 (VIS11 fear)
    { questionIndex: 53, text: 'रात चलाने से डर — इसे नज़रअंदाज़ न करें — कैटरैक्ट/ग्लौकोमा/रेटिना स्क्रीन आज कराएं', textEn: 'Fear of night driving — do not ignore this — get cataract/glaucoma/retina screening today' },
    { questionIndex: 53, text: 'सिर्फ चमक से बेचैनी — एंटी-ग्लेयर कोटिंग वाला चश्मा + वाहन की विंडशील्ड साफ + रात में रफ्तार कम', textEn: 'Only glare-related discomfort — glasses with anti-reflective coating + clean windshield + lower speed at night' },
    // q54 (LID01 duration)
    { questionIndex: 54, text: '1-3 दिन का लाल दर्द भरा दाना — गर्म सिकाई दिन में 4 बार, हर बार 10 मिनक — ज्यादातर 5-7 दिन में पककर ठीक', textEn: 'Red painful lump of 1-3 days — warm compress 4 times a day, 10 minutes each — most ripen and settle in 5-7 days' },
    { questionIndex: 54, text: '1 हफ्ते से ज्यादा / बार-बार — पलक रोग (ब्लेफेराइटिस) की जांच — पलक सफाई + इलाज योजना', textEn: 'Beyond 1 week / recurrent — blepharitis workup — lid hygiene + treatment plan' },
    // q55 (LID01 recurrent)
    { questionIndex: 55, text: 'बार-बार दाने — नीचे की पलक बीमारी वजह — रोज पलक सफाई + जांच के बाद दी जाने वाली गोली (डॉक्सीसाइक्लिन) की योजना', textEn: 'Recurrent styes — underlying lid disease is the cause — daily lid hygiene + a tablet course (doxycycline) plan after examination' },
    { questionIndex: 55, text: 'पहली बार — गर्म सिकाई + दाने को दबाएं/निचोड़ें बिल्कुल नहीं — खुद फूटता है', textEn: 'First time — warm compresses + never squeeze or press the lump — it opens by itself' },
    // q56 (LID02 duration)
    { questionIndex: 56, text: 'हफ्तों-महीनों की बिना दर्द गांठ — चैलेज़ियन — गर्म सिकाई 2-4 हफ्ते ट्रायल; न मिटे तो छोटा ऑपरेशन (मामूली)', textEn: 'Weeks-months painless lump — chalazion — trial of warm compresses for 2-4 weeks; if it persists, a minor surgical procedure' },
    { questionIndex: 56, text: 'नई छोटी गांठ — गर्म सिकाई से अकसर घट जाती है — 2 हफ्ते देखें', textEn: 'New small lump — often shrinks with warm compresses — watch for 2 weeks' },
    // q57 (LID02 evolution)
    { questionIndex: 57, text: 'पहले दर्द, फिर दर्द चला गया — स्टाई से चैलेज़ियन बनने का क्लासिक रास्ता — सिकाई + समीक्षा', textEn: 'Painful first, then painless — the classic stye-to-chalazion path — compresses + review' },
    { questionIndex: 57, text: 'शुरू से बिना दर्द — और कारण भी हो सकते हैं — जांच कराएं, बढ़ती गांठ कभी नज़रअंदाज़ नहीं', textEn: 'Painless from the start — other causes possible — get examined; a growing lid lump is never to be ignored' },
    // q58 (LID03 flakes)
    { questionIndex: 58, text: 'रूसी जैसी पपड़ी — ब्लेफेराइटिस — गुनगुने पानी + हल्के बेबी-शैंपू से पलकों के किनारों की सफाई रोज; सिर की रूसी का इलाज भी कराएं', textEn: 'Dandruff-like flakes — blepharitis — daily lid-margin cleaning with warm water + dilute baby shampoo; treat scalp dandruff too' },
    { questionIndex: 58, text: 'पपड़ी नहीं, पर किनारे लाल — पलक रोग की जांच — लिड हाइजीन + इलाज योजना', textEn: 'No flakes but red margins — lid disease examination — lid hygiene + treatment plan' },
    // q59 (LID03 evening burning)
    { questionIndex: 59, text: 'हां, दिन के अंत में जलन + रेत जैसा — ब्लेफेराइटिस से जुड़ी सूखी आंख — लुब्रिकेंट + लिड केयर साथ चलें', textEn: 'Yes, end-of-day burning + sandy feel — blepharitis-linked dry eye — lubricants + lid care together' },
    { questionIndex: 59, text: 'नहीं — कंजंक्टिवा जैसा — जांच कराएं; पलक सफाई वैसे भी नुकसान नहीं', textEn: 'No — looks conjunctival — get examined; lid hygiene does no harm anyway' },
    // q60 (LID04 sudden vs gradual)
    { questionIndex: 60, text: 'अचानक गिरी पलक — न्यूरो आपातकाल जैसा (स्ट्रोक/मायस्थीनिया) — उसी दिन न्यूरो + नेत्र जांच', textEn: 'Sudden droop — neuro-emergency-like (stroke/myasthenia) — neuro + eye examination the same day' },
    { questionIndex: 60, text: 'जन्म से/धीरे-धीरे — ऑकुलोप्लास्टिक जांच — दृष्टि रोक रही हो तो सर्जरी का समय तय होगा', textEn: 'Since birth/gradual — oculoplastic evaluation — if it blocks vision, the timing of surgery will be decided' },
    // q61 (LID04 systemic)
    { questionIndex: 61, text: 'दोहरी झलक + गिरी पलक — तत्काल न्यूरो — टालें नहीं', textEn: 'Double vision + drooping lid — urgent neuro — do not delay' },
    { questionIndex: 61, text: 'वजन घटना/सिरदर्द — पूरा चेकअप जरूरी — रेफर', textEn: 'Weight loss/headache — a full workup is essential — refer' },
    // q62 (TRU01 mechanism)
    { questionIndex: 62, text: 'तेज रफ्तार चोट (गेंद/पत्थर/हादसा) — भले दिखना ठीक हो — उसी दिन पूरी जांच: रेटिना + कॉर्निया देखना जरूरी', textEn: 'High-velocity injury (ball/stone/accident) — even if vision seems fine — full examination the same day: retina + cornea must be seen' },
    { questionIndex: 62, text: 'हल्की ठोक — फिर भी 24 घंटे के अंदर जांच — भीतर खून (hyphema) देर से दिख सकता है', textEn: 'Mild bump — still get examined within 24 hours — internal bleeding (hyphema) can appear late' },
    // q63 (TRU01 vision/diplopia)
    { questionIndex: 63, text: 'दृष्टि घटी/दो दिखा — नेत्र आपातकाल — सीधे आई-कैज़ुअल्टी; रास्ते में आंख दबाएं नहीं', textEn: 'Vision drop/double vision — ocular emergency — straight to eye casualty; do not press on the eye on the way' },
    { questionIndex: 63, text: 'दिखना ठीक — फिर भी जांच + 48 घंटे खतरा-निगरानी: लाली/दर्द/झटके बढ़ें तो तुरंत लौटें', textEn: 'Vision fine — still examine + 48-hour danger watch: return immediately if redness/pain/flashes increase' },
    // q64 (TRU02 substance) — MANDATORY irrigation line
    { questionIndex: 64, text: 'चूना/डिटर्जेंट/सफाई का तरल (क्षार) — सबसे खतरनाक — पहले कुछ नहीं, सिर्फ नल के पानी से 20 मिनट लगातार धोएं, फिर अस्पताल', textEn: 'Lime/detergent/cleaning liquid (alkali) — the most dangerous — do nothing else first, wash with running tap water for a full 20 minutes, then hospital' },
    { questionIndex: 64, text: 'तेजाब (एसिड) — वही नियम: 20 मिनट नल के पानी से तुरंत धोएं, फिर अस्पताल — न्यूट्रलाइज़ करने में समय बर्बाद न करें', textEn: 'Acid — same rule: immediate 20-minute wash under running tap water, then hospital — do not waste time trying to neutralise' },
    // q65 (TRU02 washed)
    { questionIndex: 65, text: 'नहीं धोया / 5 मिनट भर — अभी रुकें नहीं: नल खोलें, पलकें खुली रखकर 20 मिनट धोते रहें, आंख को घुमाते रहें — फिर अस्पताल', textEn: 'Not washed / only 5 minutes — do not stop now: open the tap, hold the lids open and keep washing a full 20 minutes, rolling the eye — then hospital' },
    { questionIndex: 65, text: '20 मिनट अच्छे से धोया — फिर भी उसी दिन अस्पताल जरूरी — स्लिट-लैंप + आंख का pH चेक करना होगा', textEn: 'Washed properly for 20 minutes — hospital is still mandatory the same day — slit-lamp + eye pH check will be needed' },
    // q66 (TRU03 object)
    { questionIndex: 66, text: 'चाकू/कांच/तार लगी — आंख पर ढाल (shield/कटोरी उलटी) हल्के से रखें, कोई दबाव नहीं, कोई ड्रॉप नहीं — सीधे ER; खाना-पीना बंद (एनेस्थीसिया हो सकती है)', textEn: 'Knife/glass/wire injury — place a shield (or inverted cup) gently over the eye, no pressure, ZERO drops — straight to ER; stop food/water (anaesthesia may be needed)' },
    { questionIndex: 66, text: 'पटाखे से चोट — एक से ज्यादा कण हो सकते हैं — वही नियम: ढाल, बिना दबाव, बिना ड्रॉप, तुरंत ER', textEn: 'Firecracker injury — there may be more than one particle — same rule: shield, no pressure, no drops, immediate ER' },
    // q67 (TRU03 fluid/mass)
    { questionIndex: 67, text: 'पानी/खून बह रहा या काला गोला बाहर — आंख फटी है — ढाल + तत्काल ER (सर्जरी का समय ही सब कुछ है)', textEn: 'Fluid/blood leaking or a dark mass out — the globe is ruptured — shield + immediate ER (surgical timing is everything)' },
    { questionIndex: 67, text: 'कुछ बाहर नहीं — फिर भी भीतर का छिपा छेद हो सकता है — ढाल + आज ही ER जांच', textEn: 'Nothing coming out — an occult internal rupture is still possible — shield + ER examination today' },
    // q68 (TRU04 swelling)
    { questionIndex: 68, text: 'सूजन बढ़ रही, दिखना ठीक — पहले 24 घंटे ठंडी सिकाई 15 मिनट × 4 बार, फिर गर्म सिकाई; नीचे आंख की जांच भी जरूरी', textEn: 'Swelling growing, vision fine — cold compress 15 minutes × 4 times for the first 24 hours, then warm; the eye beneath still needs examination' },
    { questionIndex: 68, text: 'सूजन + दिखने में दिक्कत — आई-कैज़ुअल्टी उसी दिन — काला धब्बा मामले में आंख के अंदर की चोट तय नहीं', textEn: 'Swelling + vision trouble — eye casualty the same day — with a black eye, internal injury cannot be ruled out from outside' },
    // q69 (TRU04 vision/inside pain)
    { questionIndex: 69, text: 'दिखना घटा/काले धागे/झटके — रेटिना जांच तत्काल — इंतज़ार नहीं', textEn: 'Vision drop/floaters/flashes — urgent retinal examination — no waiting' },
    { questionIndex: 69, text: 'सिर्फ दर्द, दिखना ठीक — जांच + 1 हफ्ता खतरा-निशान निगरानी: दृष्टि, दो दिखना, बढ़ता दर्द — कोई भी आए तो तुरंत', textEn: 'Pain only, vision fine — examination + one week of danger-sign watching: vision, double vision, rising pain — any of these, return immediately' },
    // q70 (TRU05 cracker type)
    { questionIndex: 70, text: 'जमीन पर फटा (चूरा/अनार) — रासायनिक + गर्मी दोनों की चोट — 20 मिनट पानी से धोना, फिर ER — कण न निकालें, रगड़ें नहीं', textEn: 'Burst on the ground (chura/anaar) — chemical + thermal injury both — 20-minute water wash, then ER — do not pick particles out, do not rub' },
    { questionIndex: 70, text: 'हाथ/चेहरे पर फटा (रॉकेट/बम) — भेदने का खतरा — ढाल + बिना दबाव + बिना ड्रॉप — तुरंत ER', textEn: 'Burst in hand/face (rocket/bomb) — penetrating risk — shield + no pressure + no drops — immediate ER' },
    // q71 (TRU05 symptoms)
    { questionIndex: 71, text: 'जलन/कांटे जैसी चुभन/दिखना घटा — ER आज ही; डेटॉल, सैवलॉन या कोई एंटीसेप्टिक आंख में कभी न डालें — सिर्फ साफ पानी', textEn: 'Burning/pricking/vision drop — ER today itself; never put Dettol, Savlon or any antiseptic into the eye — only clean water' },
    { questionIndex: 71, text: 'हल्की किरकिराहट — फिर भी पूरी जांच — पटाखों की सूजन देर से (कुछ घंटे बाद) बढ़ती है', textEn: 'Mild irritation — still a full examination — firecracker inflammation grows late (hours later)' },
    // q72 (OTH01 duration)
    { questionIndex: 72, text: 'महीनों का धीमा धुंधलापन + चमक से बेचैनी — उम्र का मोतियाबिंद — जब रोज़ के काम (पढ़ना/टीवी/चलना/देखना) में दिक्कत आने लगे तब ऑपरेशन का सही समय — जल्दबाज़ी जरूरी नहीं, पर टालते भी न जाएं', textEn: 'Months of slow blur + glare bother — age-related cataract — the right time for surgery is when daily activities (reading/TV/walking/seeing) start suffering — not an emergency, but do not keep postponing either' },
    { questionIndex: 72, text: 'तेज़ रफ्तार बदलाव — सिर्फ मोतियाबिंद नहीं होता — बीपी/शुगर/रेटिना जांच के साथ पूरा चेकअप', textEn: 'Rapid change — it is not always just cataract — a full check-up with BP/sugar/retina tests' },
    // q73 (OTH01 night/frequent change)
    { questionIndex: 73, text: 'रात की तकलीफ + नंबर बार-बार बदलना — मोतियाबिंद बढ़ रहा — ऑपरेशन का फैसला हो तो उससे पहले बायोमेट्री (IOL पावर नाप), रक्त शुगर/BP और आंख की पूरी जांच — यही प्री-ऑप वर्कअप है', textEn: 'Night trouble + frequent power change — cataract progressing — once surgery is decided: biometry (IOL power measurement), blood sugar/BP and a complete eye check beforehand — that is the pre-op workup' },
    { questionIndex: 73, text: 'दिक्कत नहीं — 6 महीने में निगरानी — रोज़ के काम पर ध्यान दें, वही ऑपरेशन का असली पैमाना है', textEn: 'Not troubled — 6-monthly monitoring — watch your daily activities, they are the real yardstick for surgery' },
    // q74 (OTH02 recency)
    { questionIndex: 74, text: '1 हफ्ते के अंदर — सर्जन की दी ड्रॉप-स्कीड्यूल ज्यों की त्यों चलाएं — खुद से कम/ज्यादा/बंद करना खतरनाक', textEn: 'Within 1 week — run the surgeon\'s drop schedule exactly as given — reducing/increasing/stopping it on your own is dangerous' },
    { questionIndex: 74, text: 'हफ्तों-महीने हुए — रूटीन रिव्यू — ऑपरेशन के बाद का नंबर (power) भी जांचें, चाहे तो नए चश्मे की जरूरत पड़े', textEn: 'Weeks-months ago — routine review — check the post-surgery power too; you may need new glasses' },
    // q75 (OTH02 complications)
    { questionIndex: 75, text: 'लाली + दर्द + दिखना घटा — इंफेक्शन (एंडोफ्थैल्माइटिस) का खतरा — उसी दिन ऑपरेटिंग सर्जन से मिलें — इंतज़ार दृष्टि गंवा सकता है', textEn: 'Redness + pain + vision drop — infection (endophthalmitis) risk — see the operating surgeon the same day — waiting can cost the vision' },
    { questionIndex: 75, text: 'हल्की जलन/ड्रॉप की चुभन — सामान्य भरने की प्रक्रिया — लुब्रिकेंट से आराम; सर्जन से अगली मुलाकात में पुष्टि करें', textEn: 'Mild irritation/drop stinging — part of normal healing — lubricants give relief; confirm at the next surgeon visit' },
    // q76 (OTH03 DM duration/HbA1c)
    { questionIndex: 76, text: '5+ साल या HbA1c 8 से ऊपर — रेटिनोपैथी का खतरा बढ़ता है — साल में एक बार डाइलेटेड जांच न्यूनतम (बदलाव मिले तो ज्यादा बार)', textEn: '5+ years or HbA1c above 8 — retinopathy risk rises — a dilated exam at least yearly (more often if changes are found)' },
    { questionIndex: 76, text: 'नई शुगर — आज से बेसलाइन डाइलेटेड रेटिना जांच — शुरुआत में ही नंबर पता चले', textEn: 'Newly-diagnosed diabetes — baseline dilated retinal exam today itself — know your starting score' },
    // q77 (OTH03 last dilated)
    { questionIndex: 77, text: 'कभी नहीं / 1 साल से ज्यादा — आज ही डाइलेटेड जांच — डायबिटिक रेटिनोपैथी शुरू में बिना लक्षण चुपके चलती है', textEn: 'Never / over 1 year — dilated examination today itself — diabetic retinopathy walks silently with no symptoms in the beginning' },
    { questionIndex: 77, text: '1 साल के अंदर सामान्य — अच्छा — सालाना कैलेंडर बनाएं + शुगर नियंत्रण जारी रखें', textEn: 'Within 1 year and normal — good — keep the annual calendar going + continue sugar control' },
    // q78 (OTH04 BP duration)
    { questionIndex: 78, text: 'लंबा बीपी / आज ऊंचा — आंख की रगों की जांच (फंडस) आज — आंख की नसें शरीर की नसों का शीशा हैं', textEn: 'Long-standing BP / high today — fundus (eye vessel) examination today — the eye vessels are a mirror of the body\'s vessels' },
    { questionIndex: 78, text: 'सीमा पर — BP डायरी + घर में नाप रिकॉर्ड — सालाना फंडस जांच बनाए रखें', textEn: 'Borderline — BP diary + home readings record — keep an annual fundus examination' },
    // q79 (OTH04 vision/routine)
    { questionIndex: 79, text: 'दिखने में दिक्कत — बीपी की नस-चोट (रेटिनोपैथी) जांच आज — इलाज बीपी नियंत्रण से ही बनता है', textEn: 'Vision trouble — hypertensive retinopathy examination today — treatment is built on BP control itself' },
    { questionIndex: 79, text: 'सिर्फ रूटीन — फंडस जांच + नमक कम, दवा नियमित, वजन नियंत्रण — रिपोर्ट अपने फिजिशियन को भी दिखाएं', textEn: 'Routine only — fundus examination + less salt, regular medicines, weight control — show the report to your physician too' },
    // q80 (OTH05 family glaucoma)
    { questionIndex: 80, text: 'परिवार में ग्लौकोमा — आपका जोखिम कई गुना — आज से सालाना IOP + फील्ड + ऑप्टिक डिस्क जांच, उम्र कोई भी हो', textEn: 'Glaucoma in the family — your risk multiplies — yearly IOP + visual field + optic disc checks from now, whatever your age' },
    { questionIndex: 80, text: 'परिवार में नहीं — फिर भी 40 की उम्र से हर 2 साल में स्क्रीनिंग — ग्लौकोमा चुपके से दृष्टि चुराता है, इसे चोर ही कहते हैं', textEn: 'No family history — still screen every 2 years from age 40 — glaucoma steals sight silently, hence its name: the silent thief of sight' },
    // q81 (OTH05 field test)
    { questionIndex: 81, text: 'कभी नहीं हुआ — आज फील्ड टेस्ट + IOP + डिस्क फोटो — बेसलाइन बन जाएगी', textEn: 'Never done — field test + IOP + disc photos today — it will become your baseline' },
    { questionIndex: 81, text: 'हुआ और खराब आया — विशेषज्ञ ग्लौकोमा देखभाल जारी रखें — दवा में बदलाव वहीं तय होगा, यहां नहीं', textEn: 'Done and abnormal — continue specialty glaucoma care — medicine changes will be decided there, not here' },
    // q82 (OTH06 last exam)
    { questionIndex: 82, text: '2 साल से ज्यादा — आज पूरी जांच: दृष्टि + IOP + फंडस — चुपके चलने वाली बीमारियां इसी से पकड़ी जाती हैं', textEn: 'Over 2 years — full examination today: vision + IOP + fundus — this is how silent diseases get caught' },
    { questionIndex: 82, text: 'हाल में हुई — अच्छा — घर में स्नेलेन चार्ट लगाएं और महीने में एक बार दोनों आंखें अलग-अलग जांचें', textEn: 'Done recently — good — put up a Snellen chart at home and check each eye separately once a month' },
    // q83 (OTH06 glasses/lens)
    { questionIndex: 83, text: 'चश्मा चलता है — मौजूदा चश्मा साथ लाएं — नंबर सत्यापित करेंगे', textEn: 'Wear glasses — bring your current pair along — we will verify the power' },
    { questionIndex: 83, text: 'लेंस चलाते हैं — सफाई-केस-घंटों का ऑडिट करेंगे — लाल आंख = लेंस तुरंत उतारने का नियम याद रखें', textEn: 'Use lenses — we will audit cleaning-case-hours — remember the rule: red eye = remove lenses immediately' },
    // q84 (OTH07 stability)
    { questionIndex: 84, text: '1-2 साल से स्थिर — LASIK के लिए उपयुक्त उम्मीदवार — कॉर्नियल टोपोग्राफी + पूरा प्री-लेसिक वर्कअप शुरू करें', textEn: 'Stable for 1-2 years — a suitable LASIK candidate — start corneal topography + the full pre-LASIK workup' },
    { questionIndex: 84, text: 'अभी बदल रहा है — सर्जरी टालें — पहले नंबर स्थिर कराएं (रिफ्रैक्शन 2 बार 6 महीने में)', textEn: 'Still changing — defer surgery — stabilise the power first (refraction twice, 6 months apart)' },
    // q85 (OTH07 age/thickness)
    { questionIndex: 85, text: '18+ और मोटाई जांच बाकी — आज पैचोमेट्री + टोपोग्राफी + टियर फिल्म + प्यूपिल — पूरा प्री-लेसिक पैनल', textEn: '18+ and thickness check pending — pachymetry + topography + tear film + pupil today — the complete pre-LASIK panel' },
    { questionIndex: 85, text: '18 से कम — लेसिक टालें — नंबर बदलता रहेगा; उम्मीदवारी 18 के बाद तय होगी', textEn: 'Under 18 — defer LASIK — the power will keep changing; candidacy is decided after 18' },
    // q86 (OTH08 birth vs later)
    { questionIndex: 86, text: 'जन्म से — बाल नेत्र विशेषज्ञ को उसी हफ्ते दिखाएं — कमजोर आंख (लेज़ी आई) का इलाज छोटी उम्र में ही असर करता है', textEn: 'Since birth — show a pediatric ophthalmologist the same week — lazy-eye treatment only works at a young age' },
    { questionIndex: 86, text: 'अचानक शुरू — दुर्लभ पर गंभीर कारण — तत्काल बाल-नेत्र/न्यूरो जांच', textEn: 'Started suddenly — rare but serious causes — urgent pediatric-eye/neuro evaluation' },
    // q87 (OTH08 intermittent)
    { questionIndex: 87, text: 'कभी-कभी टेढ़ापन + टीवी पास से — नंबर की कमी की आशंका — साइक्लोप्लेजिक रिफ्रैक्शन + बाल नेत्र रेफर', textEn: 'Intermittent turn + close TV viewing — refractive error suspected — cycloplegic refraction + pediatric eye referral' },
    { questionIndex: 87, text: 'हमेशा टेढ़ा — नंबर जांच के बाद सर्जरी की बात — पहले लेज़ी आई का इलाज, फिर सर्जरी', textEn: 'Constant turn — surgery discussion after the power check — first treat the lazy eye, then surgery' },
    // q88 (OTH09 white glow)
    { questionIndex: 88, text: 'तस्वीरों में सफेद चमक (आमतौर पर लाल आती है) — ल्यूकोकोरिया — इसी हफ्ते बाल नेत्र विशेषज्ञ अनिवार्य (रेटिनोब्लास्टोमा निकालना है) — इंतज़ार कभी नहीं', textEn: 'White glow in photos (it normally comes red) — leukocoria — pediatric ophthalmologist THIS WEEK is mandatory (retinoblastoma must be ruled out) — never wait' },
    { questionIndex: 88, text: 'दोनों आंखों में जन्म से, बिना और लक्षण — फिर भी तत्काल विशेषज्ञ जांच — कुछ संभावनाएं समय से जुड़ी हैं', textEn: 'Both eyes since birth, no other signs — still an urgent specialist examination — several possibilities are time-linked' },
    // q89 (OTH09 age/side)
    { questionIndex: 89, text: '2 साल से कम — रेटिनोब्लास्टोमा की सबसे आम उम्र — आपातकाल रेफर, इसी हफ्ते', textEn: 'Under 2 years — the commonest age for retinoblastoma — emergency referral, this week' },
    { questionIndex: 89, text: 'एक आंख में — एकतरफा सफेद चमक ज्यादा चिंता का कारण — तत्काल बाल नेत्र विशेषज्ञ', textEn: 'In one eye — a one-sided white glow is of higher concern — pediatric ophthalmologist urgently' },
    // q90 (OTH10 age)
    { questionIndex: 90, text: '8 साल से कम — लेज़ी आई इलाज की गोल्डन विंडो — तत्काल साइक्लोप्लेजिक रिफ्रैक्शन + पैचिंग योजना', textEn: 'Under 8 years — the golden window for lazy-eye treatment — urgent cycloplegic refraction + patching plan' },
    { questionIndex: 90, text: '8+ — इलाज कठिन होता है, असर फिर होता है — रेफर करें, उम्मीद छोड़ें नहीं', textEn: '8+ — treatment gets harder but still helps — refer; do not give up hope' },
    // q91 (OTH10 screening)
    { questionIndex: 91, text: 'स्क्रीनिंग में पकड़ी — अच्छा संकेत — आज पूरी जांच: विशेषज्ञ की पैचिंग थेरेपी + रिफ्रैक्शन', textEn: 'Picked up at screening — a good catch — full examination today: specialist patching therapy + refraction' },
    { questionIndex: 91, text: 'स्क्रीन नहीं हुआ — आज जांच कर लें — लेज़ी आई बिना लक्षण चुपके से बनती है', textEn: 'Never screened — get examined today — a lazy eye forms silently without symptoms' },
  ],

  // ══ Labels — vision chart + eye-specific measures (15) ═══════════════
  labels: [
    { label: 'दृष्टि — दायीं आंख', labelEn: 'Vision — Right Eye', unit: 'Snellen 6/x' },
    { label: 'दृष्टि — बायीं आंख', labelEn: 'Vision — Left Eye', unit: 'Snellen 6/x' },
    { label: 'दृष्टि (चश्मे के साथ) — दायीं', labelEn: 'Vision with Glasses — Right', unit: 'Snellen 6/x' },
    { label: 'दृष्टि (चश्मे के साथ) — बायीं', labelEn: 'Vision with Glasses — Left', unit: 'Snellen 6/x' },
    { label: 'पिनहोल दृष्टि', labelEn: 'Pinhole Vision', unit: 'Snellen 6/x' },
    { label: 'आंख का दबाव (IOP)', labelEn: 'Intraocular Pressure (IOP)', unit: 'mmHg' },
    { label: 'दर्द स्कोर', labelEn: 'Pain Score (NRS)', unit: '0-10' },
    { label: 'स्राव ग्रेड', labelEn: 'Discharge Grade', unit: '0-3' },
    { label: 'पुतली प्रतिक्रिया', labelEn: 'Pupil Reaction', unit: '', showUnit: false },
    { label: 'नेत्र संरेखण', labelEn: 'Eye Alignment (Squint Check)', unit: '', showUnit: false },
    { label: 'कॉर्निया स्टेनिंग', labelEn: 'Corneal Staining', unit: 'Y/N' },
    { label: 'अश्रु नली रिगर्जिटेशन', labelEn: 'Lacrimal Regurgitation', unit: 'Y/N' },
    { label: 'फंडस टिप्पणी', labelEn: 'Fundus Remarks', unit: '', showUnit: false },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
  ],

  // ══ Findings (35) — ICD-10 where known ═══════════════════════════════
  // Refer-only findings (ZERO medicine links by policy): CORNEAL-ULCER-SEVERE,
  // RETINAL-DETACHMENT-SUSPECT, LEUKOCORIA-CHILD, CHEMICAL-INJURY,
  // PENETRATING-INJURY, ACUTE-ANGLE-CLOSURE-SUSPECT, GLAUCOMA-SUSPECT,
  // GLAUCOMA-CONFIRMED, UVEITIS-SUSPECT, SCLERITIS-SUSPECT,
  // OPTIC-NEURITIS-SUSPECT, CRVO-CRAO-SUSPECT, DIABETIC-RETINOPATHY-REFER,
  // HYPERTENSIVE-RETINOPATHY, CATARACT-SURGICAL-EVAL, STRABISMUS-PEDS.
  // Refractive findings carry no medicines (glasses are the treatment).
  findings: [
    { key: 'BACTERIAL-CONJUNCTIVITIS', name: 'बैक्टीरियल नेत्रशोथ (मवाद वाली लाल आंख)', nameEn: 'Bacterial Conjunctivitis', icd10: 'H10.2' },
    { key: 'VIRAL-CONJUNCTIVITIS', name: 'वायरल नेत्रशोथ (पानी वाली लाल आंख)', nameEn: 'Viral Conjunctivitis', icd10: 'B30.9' },
    { key: 'ALLERGIC-CONJUNCTIVITIS', name: 'एलर्जिक नेत्रशोथ (मौसमी खुजली)', nameEn: 'Allergic Conjunctivitis (Seasonal)', icd10: 'H10.1' },
    { key: 'DRY-EYE-SYNDROME', name: 'सूखी आंख सिंड्रोम', nameEn: 'Dry Eye Syndrome', icd10: 'H04.1' },
    { key: 'DACRYOSTENOSIS', name: 'अश्रु नली बंद होना (लगातार पानी बहना)', nameEn: 'Dacryostenosis (Blocked Tear Duct)', icd10: 'H04.5' },
    { key: 'HORDEOLUM', name: 'रात का दाना (स्टाई)', nameEn: 'Hordeolum (Stye)', icd10: 'H00.0' },
    { key: 'CHALAZION', name: 'पलक की गांठ (चैलेज़ियन)', nameEn: 'Chalazion (Lid Cyst)', icd10: 'H00.1' },
    { key: 'BLEPHARITIS', name: 'पलक के किनारे की सूजन (ब्लेफेराइटिस)', nameEn: 'Blepharitis (Lid Margin Disease)', icd10: 'H01.0' },
    { key: 'REFRACTIVE-MYOPIA', name: 'मायोपिया (दूर धुंधला — नंबर)', nameEn: 'Myopia (Short Sight)', icd10: 'H52.1' },
    { key: 'REFRACTIVE-HYPERMETROPIA', name: 'हाइपरमेट्रोपिया (पास का नंबर)', nameEn: 'Hypermetropia (Long Sight)', icd10: 'H52.0' },
    { key: 'REFRACTIVE-ASTIGMATISM', name: 'एस्टिग्मैटिज़्म (नंबर का टेढ़ापन)', nameEn: 'Astigmatism', icd10: 'H52.2' },
    { key: 'PRESBYOPIA', name: 'प्रेस्बायोपिया (उम्र का पास नंबर)', nameEn: 'Presbyopia (Age-related Near Blur)', icd10: 'H52.4' },
    { key: 'ASTHENOPIA-CVS', name: 'नेत्र थकान / कंप्यूटर विज़न सिंड्रोम', nameEn: 'Asthenopia / Computer Vision Syndrome', icd10: 'H53.1' },
    { key: 'CORNEAL-ABRASION', name: 'कॉर्निया की खरोंच', nameEn: 'Corneal Abrasion', icd10: 'S05.0' },
    { key: 'CORNEAL-OPACITY', name: 'कॉर्निया पर सफेद दाग (घाव का निशान)', nameEn: 'Corneal Opacity (Post-ulcer Scar)', icd10: 'H17.9' },
    { key: 'NIGHT-BLINDNESS-SUSPECT', name: 'रतौंधी की आशंका (विटामिन A)', nameEn: 'Night Blindness Suspect (Vitamin A)', icd10: 'H53.6' },
    { key: 'FLOATERS-DEGENERATIVE', name: 'काले धागे उड़ना (विट्रियस क्षय)', nameEn: 'Vitreous Floaters (Degenerative)', icd10: 'H43.8' },
    { key: 'POST-CATARACT-REVIEW', name: 'मोतियाबिंद ऑपरेशन के बाद निगरानी', nameEn: 'Post-cataract Surgery Review', icd10: 'Z09' },
    { key: 'ROUTINE-EYE-EXAM', name: 'नियमित नेत्र जांच', nameEn: 'Routine Eye Examination', icd10: 'Z01.0' },
    { key: 'CORNEAL-ULCER-SEVERE', name: 'कॉर्नियल अल्सर (गंभीर — तुरंत विशेषज्ञ)', nameEn: 'Corneal Ulcer — Urgent Refer', icd10: 'H16.0' },
    { key: 'RETINAL-DETACHMENT-SUSPECT', name: 'रेटिना अलग होने की आशंका (आपातकाल)', nameEn: 'Retinal Detachment Suspect — Emergency', icd10: 'H33.2' },
    { key: 'LEUKOCORIA-CHILD', name: 'बच्चे में सफेद पुतली — रेटिनोब्लास्टोमा जांच (आपातकाल)', nameEn: 'Leukocoria — Retinoblastoma Screen (Emergency)', icd10: 'H44.52' },
    { key: 'CHEMICAL-INJURY', name: 'आंख में रासायनिक चोट — 20 मिनट धोना + ER', nameEn: 'Chemical Eye Injury — Irrigate 20 min + ER', icd10: 'T26.9' },
    { key: 'PENETRATING-INJURY', name: 'आंख की भेदी चोट — ढाल + ER (कोई ड्रॉप नहीं)', nameEn: 'Penetrating Ocular Injury — Shield + ER (No Drops)', icd10: 'S05.4' },
    { key: 'ACUTE-ANGLE-CLOSURE-SUSPECT', name: 'एक्यूट ग्लौकोमा आक्रमण की आशंका (आपातकाल)', nameEn: 'Acute Angle-closure Suspect — Emergency', icd10: 'H40.2' },
    { key: 'GLAUCOMA-SUSPECT', name: 'ग्लौकोमा की आशंका (खामोश चोर)', nameEn: 'Glaucoma Suspect (Silent Thief)', icd10: 'H40.0' },
    { key: 'GLAUCOMA-CONFIRMED', name: 'ग्लौकोमा पुष्ट — विशेषज्ञ देखभाल जारी', nameEn: 'Glaucoma Confirmed — Continue Specialty Care', icd10: 'H40.9' },
    { key: 'UVEITIS-SUSPECT', name: 'यूविआइटिस की आशंका (आंख के भीतर सूजन — रेफर)', nameEn: 'Uveitis Suspect — Refer', icd10: 'H20.9' },
    { key: 'SCLERITIS-SUSPECT', name: 'स्क्लेराइटिस की आशंका (गहरी लाल दर्द भरी आंख — रेफर)', nameEn: 'Scleritis Suspect — Refer', icd10: 'H15.1' },
    { key: 'OPTIC-NEURITIS-SUSPECT', name: 'ऑप्टिक न्यूराइटिस की आशंका (तत्काल न्यूरो)', nameEn: 'Optic Neuritis Suspect — Urgent Neuro', icd10: 'H46' },
    { key: 'CRVO-CRAO-SUSPECT', name: 'रेटिना की नस जाम (CRVO/CRAO — आपातकाल)', nameEn: 'Retinal Vessel Occlusion (CRVO/CRAO) — Emergency', icd10: 'H34.8' },
    { key: 'DIABETIC-RETINOPATHY-REFER', name: 'डायबेटिक रेटिनोपैथी (चरण-आधारित रेफर)', nameEn: 'Diabetic Retinopathy — Stage-based Refer', icd10: 'H36.0' },
    { key: 'HYPERTENSIVE-RETINOPATHY', name: 'हाइपरटेंसिव रेटिनोपैथी', nameEn: 'Hypertensive Retinopathy', icd10: 'H35.0' },
    { key: 'CATARACT-SURGICAL-EVAL', name: 'मोतियाबिंद — ऑपरेशन जांच (रेफर)', nameEn: 'Cataract — Surgical Evaluation (Refer)', icd10: 'H25.9' },
    { key: 'STRABISMUS-PEDS', name: 'भैंगापन (बच्चा — बाल नेत्र रेफर)', nameEn: 'Strabismus (Child) — Pediatric Ophthal Refer', icd10: 'H50.9' },
  ],

  // ══ Medicines (48) — India eye-OPD core, topical-heavy ═══════════════
  // Eye-drop culture: drops/ointments = "tab" 1 (one bottle/tube dispense);
  // tablets carry 3-30 unit quantities. Steroid combo + cycloplegics carry
  // hard safety notes in salt. flags: verified=false until MBBS review.
  medicines: [
    // Antibacterial drops — fluoroquinolone workhorses + tobramycin
    { name: 'Moxicip Eye Drops 0.5%', salt: 'Moxifloxacin 0.5% w/v ophthalmic solution — bacterial conjunctivitis/keratitis cover; 1 drop 4 times/day × 5-7 days; remove contact lenses during course', doseOptions: ['1 drop in affected eye 4 times/day', '1 drop 2 times/day (mild)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vigamox Eye Drops 0.5%', salt: 'Moxifloxacin 0.5% w/v (Alcon) — same salt as Moxicip; alternate brand per availability; 5-7 day course; lenses out during course', doseOptions: ['1 drop in affected eye 4 times/day', '1 drop 3 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Milflox Eye Drops 0.5%', salt: 'Moxifloxacin 0.5% w/v (Sun Pharma) — alternate moxifloxacin brand; short course only', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplox Eye/Ear Drops 0.3%', salt: 'Ciprofloxacin 0.3% w/v eye/ear solution — bacterial conjunctivitis; quinolone class (perforation-safe lineage); 5-7 day course; never touch tip to eye/lid', doseOptions: ['1 drop in affected eye 4 times/day', '1 drop 2 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ocuflox Eye Drops 0.3%', salt: 'Ofloxacin 0.3% w/v ophthalmic solution — bacterial conjunctivitis alternate quinolone; 5-7 day course', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zymar Eye Drops 0.3%', salt: 'Gatifloxacin 0.3% w/v ophthalmic solution — quinolone alternate; short course; lens wear suspended', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Gatilox Eye Drops 0.3%', salt: 'Gatifloxacin 0.3% w/v (Ajanta) — alternate gatifloxacin brand per availability', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tobastar Eye Drops 0.3%', salt: 'Tobramycin 0.3% w/v — the pack-allowed aminoglycoside option; 1 drop 4 times/day × 5-7 days; toxic to corneal epithelium in prolonged use', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tobrex Eye Drops 0.3%', salt: 'Tobramycin 0.3% w/v (Alcon) — alternate tobramycin brand; SHORT course only — prolonged use thins corneal surface', doseOptions: ['1 drop in affected eye 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Steroid-antibiotic COMBO — the only steroid entry, heavily guarded
    { name: 'Toba-DM Eye Drops', salt: 'Tobramycin 0.3% + Dexamethasone 0.1% w/v — STEROID-CONTAINING COMBO: prescribe ONLY on slit-lamp-confirmed steroid-requiring inflammation; MAX 1-2 weeks; NEVER continue beyond review; IOP monitoring at review; NEVER for red eye of unknown cause, never for suspected infection without cover, never as home stock to re-use', doseOptions: ['1 drop twice daily × 7 days MAX', '1 drop 4 times/day × 5 days (post-op protocol only)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Ointments (night-time application)
    { name: 'Neosporin Eye Ointment', salt: 'Neomycin + Polymyxin B + Bacitracin ophthalmic ointment — stye/lid infection night application; WATCH for neomycin allergy (lid eczema = stop)', doseOptions: ['Apply thin ribbon on lid margin at bedtime', 'Apply 3 times/day on affected lid'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ciplox Eye Ointment 0.3%', salt: 'Ciprofloxacin 0.3% ophthalmic ointment — night-time cover for conjunctivitis/lid infection; 5-7 day course', doseOptions: ['Apply thin ribbon inside lower lid at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Oral antibiotics (severe cases / lid disease)
    { name: 'Azee 500 Tablet', salt: 'Azithromycin 500 mg — severe/purulent bacterial conjunctivitis or spreading lid infection ONLY; once daily × 3 days; not for routine eye redness', doseOptions: ['1 tab once daily × 3 days'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxy-1 Capsule', salt: 'Doxycycline Hyclate 100 mg — CHRONIC LID DISEASE (blepharitis/Meibomian gland dysfunction) regimen: low-dose long course weeks, NOT for infection; NOT in pregnancy, breastfeeding or children under 12; take with water upright, avoid sun', doseOptions: ['1 cap (100 mg) once daily × 4 weeks', '1 cap twice daily × 2 weeks'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },

    // Anti-allergic drops (the allergy-heavy India shelf)
    { name: 'Opatanol Eye Drops 0.1%', salt: 'Olopatadine 0.1% w/v — antihistamine + mast-cell stabilizer dual action; allergic conjunctivitis 2 times/day × 2-4 weeks; contact lenses out 10 min before instilling', doseOptions: ['1 drop both eyes twice daily', '1 drop both eyes once daily (maintenance)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Olpat Eye Drops 0.1%', salt: 'Olopatadine 0.1% w/v — alternate olopatadine brand; same course rules', doseOptions: ['1 drop both eyes twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Winolap Eye Drops 0.1%', salt: 'Olopatadine 0.1% w/v (Sun Pharma) — alternate olopatadine brand per availability', doseOptions: ['1 drop both eyes twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ketolac Eye Drops 0.5%', salt: 'Ketorolac Tromethamine 0.5% w/v — NSAID anti-allergic/anti-inflammatory drop; stinging on instilling is common; NOT for corneal ulcer or suspected infection', doseOptions: ['1 drop both eyes 3 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Cromal Eye Drops 2%', salt: 'Sodium Cromolyn (Cromoglicate) 2% w/v — mast-cell stabilizer for RECURRENT seasonal allergy; slow onset — works over weeks, continue through the season; safe for long courses', doseOptions: ['1 drop both eyes 4 times/day (season-long)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // Decongestant drop (guarded)
    { name: 'Albalon Eye Drops 0.1%', salt: 'Naphazoline 0.1% w/v — decongestant for cosmetic redness relief ONLY; MAX 3-4 DAYS (rebound redness); AVOID in glaucoma suspect/narrow angle; not a treatment for any eye disease', doseOptions: ['1 drop both eyes twice daily × 3 days MAX'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Lubricants — the dry-eye shelf (all preservative-bearing unless noted)
    { name: 'Refresh Tears Eye Drops', salt: 'Carboxymethylcellulose Sodium 0.5% w/v — first-line dry eye lubricant; safe for frequent use; store as per label', doseOptions: ['1 drop both eyes 4 times/day', '1 drop both eyes hourly (severe)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Refresh Liquigel Eye Drops', salt: 'Carboxymethylcellulose 1% w/v gel drops — moderate-severe dry eye; thicker, longer night cover; may blur vision briefly', doseOptions: ['1 drop both eyes 2-4 times/day', '1 drop at bedtime'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Refresh Celluvisc 1% Eye Drops', salt: 'Carboxymethylcellulose 1% preservative-free single-vial gel — sensitive eyes/preservative allergy; discard vial 12 hrs after opening', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Optive Eye Drops', salt: 'Carboxymethylcellulose 0.5% + Glycerin lubricant — dual-action dry eye drop; 4 times/day standard', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Systane Ultra Eye Drops', salt: 'Polyethylene Glycol 0.4% + Propylene Glycol 0.3% lubricant — mid-dryness relief; safe on contact lenses of approved type', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tears Naturale Eye Drops', salt: 'Hydroxypropyl Methylcellulose 0.3% + Dextran 70 0.1% lubricant — classic tear substitute', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Moisol Eye Drops', salt: 'Methylcellulose 1% w/v lubricant — dry eye/mucus-filament relief', doseOptions: ['1 drop both eyes 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Lubrex Eye Drops', salt: 'Hydroxypropyl Methylcellulose + Dextran lubricant — methylcellulose-class tear substitute', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Eyemist Eye Drops', salt: 'Sodium Hyaluronate 0.1% w/v — long-moisture lubricant; blinks spread it evenly; good for post-op comfort', doseOptions: ['1 drop both eyes 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Just Tears Eye Drops', salt: 'Polyethylene Glycol + Propylene Glycol lubricant — economy dry eye drop', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'i-Lube Eye Drops', salt: 'Carboxymethylcellulose 0.5% w/v lubricant (Intas) — frequent-use safety profile', doseOptions: ['1 drop both eyes 4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Cycloplegic / mydriatic — IN-CLINIC ONLY, never handed home
    { name: 'Homide Eye Drops', salt: 'Homatropine Hydrobromide 2% w/v — cycloplegic for corneal abrasion/keratitis pain relief — IN-CLINIC ADMINISTRATION ONLY, NOT given for home self-use; effect lasts 1-2 days (blur + photophobia)', doseOptions: ['1 drop — in-clinic administration ONLY'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tropicacyl Eye Drops', salt: 'Tropicamide 0.8% w/v — dilating drop for fundus examination — IN-CLINIC ADMINISTRATION ONLY, NOT for home self-use; driving unsafe 4-6 hours after', doseOptions: ['1 drop — in-clinic administration ONLY (repeat after 20 min if pupil inadequate)'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // Oral antihistamines (allergy support)
    { name: 'Levocet 5 Tablet', salt: 'Levocetirizine 5 mg — oral antihistamine for eye allergy support; at bedtime; drowsiness possible — avoid driving', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg — classic oral antihistamine; bedtime dose; mild drowsiness', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Montek LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg — the seasonal-allergy workhorse; continue through the season; behavioural-change warning in children is rare but documented', doseOptions: ['1 tab at bedtime × 2-4 weeks'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Allegra 120 Tablet', salt: 'Fexofenadine 120 mg — non-sedating antihistamine for daytime itch relief', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Analgesia / anti-edema / GI cover
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — eye pain/injury analgesic; max 3 doses/day', doseOptions: ['1 tab SOS (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Crocin 500 Tablet', salt: 'Paracetamol 500 mg — mild eye pain; SOS use', doseOptions: ['1 tab SOS (max 4/day)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg — stye/injury inflammatory pain; always after food; avoid in ulcer/asthma/kidney disease', doseOptions: ['1 tab twice daily after food', '1 tab SOS'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Chymoral Forte Tablet', salt: 'Trypsin-Chymotrypsin 100,000 AU — peri-orbital/post-traumatic swelling reduction; EMPTY stomach (30 min before food); not with blood thinners', doseOptions: ['1 tab thrice daily before food'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — gastric cover during NSAID courses; before breakfast', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 6, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Vitamins / antioxidants (eye-support classics)
    { name: 'A to Z NS Tablet', salt: 'Multivitamin + Multimineral antioxidant tablet — general nutritional support in eye disease', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Ocuvite Tablet', salt: 'Lutein + Zeaxanthin + antioxidant eye vitamin — Age-related Macular Degeneration (AMD) nutritional support line; not a cure', doseOptions: ['1 tab after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Retinox Capsule', salt: 'Antioxidant multivitamin with carotenoids — AMD/retina nutritional support', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Seacod Cod Liver Oil Capsules', salt: 'Natural Vitamin A + D + Omega-3 (cod liver oil) — LOW-DOSE OTC vitamin A support for night-blindness suspicion; diet-first approach', doseOptions: ['1-2 caps daily with milk'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Vitamin A 200000 IU Capsule', salt: 'Retinol (Vitamin A) 200,000 IU — HIGH-DOSE WHO-protocol regimen for confirmed/suspected vitamin A deficiency — ADMINISTER UNDER SUPERVISION ONLY (dosing interval per protocol; pregnancy dose is different and lower; overdose is toxic) — not for routine home self-dosing', doseOptions: ['1 cap (200,000 IU) single supervised dose', '1 cap supervised dose, repeat per WHO protocol interval'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'Vitamin B-Complex + C — epithelial healing/nutritional support in corneal disease', doseOptions: ['1 cap after food'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (36) ════════════════════════════════════
  // Refer-only findings (see findings block note) deliberately carry ZERO
  // medicine links — emergencies get referrals, not prescriptions.
  findingMeds: [
    // BACTERIAL-CONJUNCTIVITIS
    { findingKey: 'BACTERIAL-CONJUNCTIVITIS', medicineName: 'Moxicip Eye Drops 0.5%', dose: '1 drop in affected eye(s)', morning: 1, afternoon: 1, evening: 1, tab: 1, description: '4 times/day × 7 days; handwash before drops; 5-min gap if second drop' },
    { findingKey: 'BACTERIAL-CONJUNCTIVITIS', medicineName: 'Ciplox Eye/Ear Drops 0.3%', description: '1 drop 4 times/day × 5-7 days — alternate quinolone' },
    { findingKey: 'BACTERIAL-CONJUNCTIVITIS', medicineName: 'Azee 500 Tablet', description: '1 tab OD × 3 days — ONLY severe/purulent or spreading lid involvement' },
    // VIRAL-CONJUNCTIVITIS
    { findingKey: 'VIRAL-CONJUNCTIVITIS', medicineName: 'Refresh Tears Eye Drops', description: '1 drop 4 times/day comfort + hygiene; self-limiting 7-14 days' },
    { findingKey: 'VIRAL-CONJUNCTIVITIS', medicineName: 'Cetzine 10 Tablet', description: '1 tab HS × 5 days if itch troublesome' },
    // ALLERGIC-CONJUNCTIVITIS
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Opatanol Eye Drops 0.1%', dose: '1 drop both eyes', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Twice daily × 2-4 weeks; cold compresses; NO eye rubbing ever' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Olpat Eye Drops 0.1%', description: 'Twice daily × 2-4 weeks — alternate olopatadine brand' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Cromal Eye Drops 2%', description: '1 drop 4 times/day through the season — mast-cell prevention for RECURRENCE' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Ketolac Eye Drops 0.5%', description: '1 drop 3 times/day — itch control add-on; stinging common' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Montek LC Tablet', description: '1 tab HS × 2-4 weeks — seasonal oral cover' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Levocet 5 Tablet', description: '1 tab HS — oral antihistamine alternative' },
    { findingKey: 'ALLERGIC-CONJUNCTIVITIS', medicineName: 'Albalon Eye Drops 0.1%', description: '1 drop BD — MAX 3-4 DAYS redness relief only; AVOID if glaucoma/narrow angle suspected' },
    // DRY-EYE-SYNDROME
    { findingKey: 'DRY-EYE-SYNDROME', medicineName: 'Refresh Tears Eye Drops', description: '1 drop 4 times/day — first-line' },
    { findingKey: 'DRY-EYE-SYNDROME', medicineName: 'Optive Eye Drops', description: '1 drop 4 times/day — dual-action upgrade' },
    { findingKey: 'DRY-EYE-SYNDROME', medicineName: 'Systane Ultra Eye Drops', description: '1 drop 4 times/day — mid-dryness' },
    { findingKey: 'DRY-EYE-SYNDROME', medicineName: 'Refresh Liquigel Eye Drops', description: '1 drop at bedtime — thicker gel night cover for moderate-severe dryness' },
    { findingKey: 'DRY-EYE-SYNDROME', medicineName: 'Eyemist Eye Drops', description: '1 drop 3-4 times/day — hyaluronate long-moisture option' },
    // DACRYOSTENOSIS — symptomatic only, definitive Rx is surgical
    { findingKey: 'DACRYOSTENOSIS', medicineName: 'Refresh Tears Eye Drops', description: 'Symptomatic lubrication; DUCT SYRINGING/PROBING evaluation mandatory for cure' },
    // HORDEOLUM (stye)
    { findingKey: 'HORDEOLUM', medicineName: 'Neosporin Eye Ointment', description: 'Thin ribbon on lid margin at bedtime × 7 days + warm compress 4×/day 10 min each' },
    { findingKey: 'HORDEOLUM', medicineName: 'Combiflam Tablet', description: '1 tab BD after food × 3 days — only if painful' },
    { findingKey: 'HORDEOLUM', medicineName: 'Dolo 650 Tablet', description: '1 tab SOS — pain alternative' },
    // CHALAZION
    { findingKey: 'CHALAZION', medicineName: 'Neosporin Eye Ointment', description: 'Only for inflamed episodes; compresses 2-4 weeks; persistent cyst = minor surgery referral' },
    // BLEPHARITIS
    { findingKey: 'BLEPHARITIS', medicineName: 'Doxy-1 Capsule', description: 'Lid-disease regimen — 100 mg OD × 4 weeks; NOT in pregnancy/under-12s' },
    { findingKey: 'BLEPHARITIS', medicineName: 'Ciplox Eye Ointment 0.3%', description: 'Thin ribbon on lid margins at bedtime × 2 weeks with daily lid scrubs' },
    { findingKey: 'BLEPHARITIS', medicineName: 'Refresh Tears Eye Drops', description: '1 drop 4 times/day — blepharitis-linked dryness cover' },
    // ASTHENOPIA-CVS
    { findingKey: 'ASTHENOPIA-CVS', medicineName: 'Refresh Tears Eye Drops', description: '1 drop 4 times/day + 20-20-20 rule + screen one arm-length below eye level' },
    { findingKey: 'ASTHENOPIA-CVS', medicineName: 'Optive Eye Drops', description: '1 drop 4 times/day — moderate strain' },
    { findingKey: 'ASTHENOPIA-CVS', medicineName: 'Just Tears Eye Drops', description: '1 drop 4 times/day — economy option' },
    // CORNEAL-ABRASION — non-penetrating, after slit-lamp confirmation
    { findingKey: 'CORNEAL-ABRASION', medicineName: 'Moxicip Eye Drops 0.5%', dose: '1 drop affected eye', morning: 1, afternoon: 1, evening: 1, tab: 1, description: '4 times/day × 5-7 days; CYCLOPLEGIC (homatropine) is IN-CLINIC ONLY; no contact lenses; no rubbing' },
    { findingKey: 'CORNEAL-ABRASION', medicineName: 'Dolo 650 Tablet', description: '1 tab SOS max 3/day × 3 days' },
    // CORNEAL-OPACITY
    { findingKey: 'CORNEAL-OPACITY', medicineName: 'Refresh Tears Eye Drops', description: 'Surface smoothing for comfort; visual rehabilitation per specialist (contact lens/graft options)' },
    // NIGHT-BLINDNESS-SUSPECT
    { findingKey: 'NIGHT-BLINDNESS-SUSPECT', medicineName: 'Vitamin A 200000 IU Capsule', description: 'HIGH-DOSE WHO regimen — under supervision only; diet correction first-line' },
    { findingKey: 'NIGHT-BLINDNESS-SUSPECT', medicineName: 'Seacod Cod Liver Oil Capsules', description: 'Low-dose OTC vitamin A support + green vegetables/carrot/papaya daily' },
    // POST-CATARACT-REVIEW — continuing surgeon's protocol only
    { findingKey: 'POST-CATARACT-REVIEW', medicineName: 'Vigamox Eye Drops 0.5%', description: '1 drop 4 times/day — CONFIRM with operating surgeon\'s own protocol before altering' },
    { findingKey: 'POST-CATARACT-REVIEW', medicineName: 'Toba-DM Eye Drops', description: 'TAPER per surgeon (e.g. 4×/day wk 1-2 → 3×/day wk 3 → 2×/day wk 4); NEVER stop suddenly/self-continue; IOP check at review' },
    { findingKey: 'POST-CATARACT-REVIEW', medicineName: 'Refresh Tears Eye Drops', description: '1 drop 4-6 times/day for post-op surface comfort' },
  ],

  // ══ Table templates (6) — vision-chart + patient-ed core ══════════════
  tables: [
    {
      name: 'Snellen Vision Record (6/x Chart Log)',
      rows: 8,
      cols: 5,
      headerLabel: ['तारीख', 'दृष्टि दायीं (6/x)', 'दृष्टि बायीं (6/x)', 'चश्मे/पिनहोल के साथ', 'टिप्पणी'],
      colsLabel: ['Date', 'Vision Right (6/x)', 'Vision Left (6/x)', 'With Glasses/Pinhole', 'Notes'],
      footerLabel: ['6/6 = सामान्य दृष्टि · 6/9-6/12 = हल्की कमी · 6/18-6/60 = बहुत कम — तुरंत जांच · दोनों आंखें हर मुलाकात में अलग-अलग नापें / 6/6 = normal · 6/9-6/12 mild reduction · 6/18-6/60 severe — urgent check · test each eye separately at every visit'],
    },
    {
      name: 'Eye Drop Instillation Card (Patient Education)',
      rows: 8,
      cols: 3,
      headerLabel: ['क्रम', 'कदम', 'याद रखें'],
      colsLabel: ['Step', 'What To Do', 'Remember'],
      footerLabel: ['दो दवाओं के बीच कम से कम 5 मिनट का अंतर · बोतल की नोज़ आंख/पलक/हाथ को न छुए · 1 बूंद काफी है · लगाने के बाद 1 मिनट आंख बंद रखें · खुली बोतल 1 महीने में बदलें / at least 5 minutes between two different drops · bottle tip must not touch eye/lid/hand · 1 drop is enough · keep eye closed 1 minute after · discard opened bottle after 1 month'],
    },
    {
      name: 'Red Eye Differential Grid',
      rows: 6,
      cols: 5,
      headerLabel: ['संभावित कारण', 'स्राव (पानी/मवाद)', 'दर्द / रोशनी से चुभन', 'दृष्टि', 'कदम'],
      colsLabel: ['Likely Cause', 'Discharge (Water/Pus)', 'Pain / Photophobia', 'Vision', 'Action'],
      footerLabel: ['दृष्टि घटी हो, तेज दर्द हो या रोशनी से चुभन हो — स्वयं इलाज बिल्कुल नहीं, उसी दिन नेत्र विशेषज्ञ / vision reduced, severe pain or photophobia — no self-treatment at all, eye specialist the same day'],
    },
    {
      name: 'Dry Eye & Screen Hygiene Chart',
      rows: 8,
      cols: 4,
      headerLabel: ['आदत', 'कब', 'कैसे', 'निशान (✓/✗)'],
      colsLabel: ['Habit', 'When', 'How', 'Done (✓/✗)'],
      footerLabel: ['20-20-20 नियम: हर 20 मिनट में, 20 फीट दूर, 20 सेकंड देखें · स्क्रीन एक बांह (50-60 सेमी) दूर, आंख की रेखा से थोड़ी नीचे · जानबूझकर झपकें / 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds · screen one arm-length (50-60 cm) away, slightly below eye level · blink on purpose'],
    },
    {
      name: 'Diabetic Retinopathy Screening Schedule (HbA1c-based)',
      rows: 6,
      cols: 5,
      headerLabel: ['HbA1c रेंज', 'स्क्रीनिंग अंतराल', 'पिछली डाइलेटेड जांच', 'अगली तारीख', 'टिप्पणी'],
      colsLabel: ['HbA1c Range', 'Screening Interval', 'Last Dilated Exam', 'Next Due Date', 'Notes'],
      footerLabel: ['हर शुगर मरीज को साल में कम से कम एक बार डाइलेटेड (पुतली बड़ी करके) रेटिना जांच जरूरी — HbA1c जितना ऊंचा, अगली जांच उतनी जल्दी / every person with diabetes needs a dilated retinal exam at least yearly — the higher the HbA1c, the sooner the next check'],
    },
    {
      name: 'Ocular Trauma First-Aid Card',
      rows: 8,
      cols: 3,
      headerLabel: ['स्थिति', 'तुरंत करें', 'कभी न करें'],
      colsLabel: ['Situation', 'Do Immediately', 'Never Do'],
      footerLabel: ['रासायनिक चीज गिरने पर: 20 मिनट तक नल के पानी से लगातार धोएं, उसके बाद ही अस्पताल · डेटॉल/सैवलॉन/कोई एंटीसेप्टिक या तेल आंख में कभी न डालें / chemical in the eye: wash continuously under running tap water for 20 minutes FIRST, hospital only after that · never put Dettol/Savlon/any antiseptic or oil into the eye'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Bacterial Conjunctivitis — Standard Course',
      diagnosis: 'BACTERIAL-CONJUNCTIVITIS',
      medicines: [
        { name: 'Moxicip Eye Drops 0.5%', dose: '1 drop in affected eye(s)', duration: '7 days', instructions: '4 times a day; wash hands before; 5-min gap if two drops; no sharing of towels/kajal' },
        { name: 'Refresh Tears Eye Drops', dose: '1 drop both eyes', duration: '7 days', instructions: '4 times a day for comfort' },
        { name: 'Cetzine 10 Tablet', dose: '1 tab at bedtime', duration: '5 days', instructions: 'If itching; drowsiness possible' },
      ],
      labs: [],
      advice: 'हाथ बार-बार धोएं · तौलिया/तकिया अलग · आंख रगड़ना बंद · रुई से अंदर से बाहर की ओर साफ करें · काजल/सुरमा शेयर न करें · 3 दिन में सुधार न हो या दर्द/रोशनी से चुभन शुरू हो तो तुरंत आएं',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'Seasonal Allergic Conjunctivitis — Course',
      diagnosis: 'ALLERGIC-CONJUNCTIVITIS',
      medicines: [
        { name: 'Opatanol Eye Drops 0.1%', dose: '1 drop both eyes', duration: '3-4 weeks', instructions: 'Twice daily; lenses out first; continue through the season' },
        { name: 'Montek LC Tablet', dose: '1 tab at bedtime', duration: '14 days', instructions: 'Drowsiness possible — avoid driving after the dose' },
      ],
      labs: [],
      advice: 'आंख रगड़ना बिल्कुल बंद — रगड़ने से एलर्जी बढ़ती है · ठंडी सिकाई दिन में 2-3 बार 10 मिनट · धूल/धूप में कवरिंग चश्मा · घर की गद्दे-पर्दे की धूल कम करें · घर की पुरानी स्टेरॉयड ड्रॉप कभी खुद न लगाएं — चेतावनी',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Dry Eye & Computer Vision — Bundle',
      diagnosis: 'DRY-EYE-SYNDROME',
      medicines: [
        { name: 'Optive Eye Drops', dose: '1 drop both eyes', duration: '1 month', instructions: '4 times a day' },
        { name: 'Refresh Liquigel Eye Drops', dose: '1 drop at bedtime', duration: '1 month', instructions: 'Thicker gel for overnight cover; brief blur is normal' },
      ],
      labs: [],
      advice: '20-20-20 नियम: हर 20 मिनट में 20 फीट दूर 20 सेकंड देखें · स्क्रीन एक बांह दूर और आंख से थोड़ी नीचे · एंटी-ग्लेयर स्क्रीन/कोटिंग · जानबूझकर पूरी झपकें · एसी/पंखे का सीधा मारा चेहरे पर न आए · पानी भरपूर पिएं',
      followUpDays: 21,
      isCommon: true,
    },
    {
      name: 'Stye / Blepharitis — Bundle',
      diagnosis: 'HORDEOLUM',
      medicines: [
        { name: 'Neosporin Eye Ointment', dose: 'Thin ribbon on lid margin', duration: '7 days', instructions: 'At bedtime (and 3 times/day if inflamed); wash hands before' },
        { name: 'Combiflam Tablet', dose: '1 tab twice daily', duration: '3 days', instructions: 'After food; only while painful' },
        { name: 'Doxy-1 Capsule', dose: '1 cap (100 mg) once daily', duration: '4 weeks', instructions: 'Only for chronic blepharitis/Meibomian disease — NOT in pregnancy or under 12; take upright with water' },
      ],
      labs: [],
      advice: 'गर्म सिकाई दिन में 4 बार, हर बार 10 मिनट — इलाज का आधा हिस्सा यही है · दाने को दबाएं/निचोड़ें नहीं · रोज पलक-किनारों की सफाई (गुनगुना पानी + हल्का बेबी-शैंपू) · बार-बार होने पर शुगर जांच भी कराएं',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Corneal Abrasion — Protective Course (Non-Penetrating)',
      diagnosis: 'CORNEAL-ABRASION',
      medicines: [
        { name: 'Moxicip Eye Drops 0.5%', dose: '1 drop affected eye', duration: '5-7 days', instructions: '4 times a day, AFTER slit-lamp confirmation of epithelial defect; no contact lenses' },
        { name: 'Dolo 650 Tablet', dose: '1 tab SOS', duration: '3 days', instructions: 'Max 3/day; for pain only' },
      ],
      labs: [],
      advice: 'आंख रगड़ना और दबाना बिल्कुल बंद · कॉन्टैक्ट लेंस पूरी तरह बंद · साइक्लोप्लेजिक (होमैट्रोपिन) ड्रॉप क्लिनिक में ही लगेगा — घर पर नहीं · धूप में काला चश्मा · 48 घंटे में दोबारा जांच अनिवार्य — दर्द बढ़े या दिखना घटे तो पहले ही आएं',
      followUpDays: 2,
      isCommon: false,
    },
    {
      name: 'Post-Cataract Surgery — Standard Drop Schedule',
      diagnosis: 'POST-CATARACT-REVIEW',
      medicines: [
        { name: 'Vigamox Eye Drops 0.5%', dose: '1 drop operated eye', duration: '7 days', instructions: '4 times a day — CONFIRM against the operating surgeon\'s own protocol before altering anything' },
        { name: 'Toba-DM Eye Drops', dose: '1 drop operated eye', duration: '4 weeks', instructions: 'TAPER as per surgeon: 4×/day weeks 1-2 → 3×/day week 3 → 2×/day week 4 — NEVER stop suddenly, never self-continue beyond the schedule; IOP check at review' },
        { name: 'Refresh Tears Eye Drops', dose: '1 drop operated eye', duration: '4 weeks', instructions: '4-6 times a day for surface comfort' },
      ],
      labs: [],
      advice: 'ड्रॉप स्कीड्यूल ज्यों की त्यों — यह ऑपरेटिंग सर्जन का प्रोटोकॉल है, बदलाव उसी से · रात में आंख पर ढाल (shield) 7 दिन · पहले 7 दिन आंख में पानी न जाने दें · धूल वाली जगह टालें · लाली + दर्द + दिखने में कमी = उसी दिन सर्जन — इंतज़ार नहीं',
      followUpDays: 7,
      isCommon: false,
    },
  ],
}
