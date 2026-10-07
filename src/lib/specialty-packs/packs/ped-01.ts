/**
 * PED-01 — PEDIATRICS STARTER PACK
 *
 * The India pediatric OPD core: highest-frequency complaints (fever → wheeze
 * → loose motions → neonatal jaundice), weight-banded syrup dosing (the seed's
 * proven 2.5/5/7.5/10 ml pattern), IAP immunization + growth-monitoring
 * tables, and ready-made parent-facing advice.
 *
 * Language: Hindi primary (ask-aloud to parents / printed on Rx), English
 * secondary (doctor search). Medicine names = English brands (India peds core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian pediatric-formulary defaults (per-kg rules shown
 * in salt/description fields) but have NOT been signed off by an MBBS
 * reviewer. UI must show the unverified-dose badge until meta.reviewedBy is
 * stamped. WEIGHT IS THE DOSE — every syrup carries weight-band options and
 * the doctor must confirm ml per kg before printing.
 *
 * SAFETY RULES (hard-coded into curation):
 *   - NO nimesulide (banned <12 y in India)
 *   - NO aspirin / salicylate oral products (Reye syndrome risk)
 *   - NO codeine-containing cough syrups for children
 *   - Antibiotic courses = standard pediatric durations (3-10 days) via `tab`
 *
 * Sources: NLEM 2023 (molecule backbone) · IAP Immunization Schedule
 * (Indian Academy of Pediatrics, 2024) · WHO EML for Children · WHO IMCI
 * dehydration & danger-sign criteria · converted + expanded from legacy
 * pediatric-seed.ts (842 lines, Dr. Amit Shah field conventions).
 */

import type { SpecialtyPack } from '../types'

export const PED01_PACK: SpecialtyPack = {
  meta: {
    code: 'PED-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Pediatrics Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode; MBBS reviewer stamps later
    sourceNotes: 'NLEM 2023 backbone · IAP Immunization Schedule 2024 · WHO EMLc · WHO IMCI danger signs · converted & expanded from legacy pediatric-seed.ts · unverified-dose launch mode',
  },

  // ══ Categories (8) ══════════════════════════════════════════════════════
  categories: [
    { key: 'PGEN', name: 'सामान्य लक्षण', nameEn: 'General Symptoms' },
    { key: 'PRES', name: 'सांस और खांसी', nameEn: 'Respiratory' },
    { key: 'PGAS', name: 'पेट, दस्त व डिहाइड्रेशन', nameEn: 'GI & Dehydration' },
    { key: 'PSKN', name: 'त्वचा एवं एलर्जी', nameEn: 'Skin & Allergy' },
    { key: 'PENT', name: 'कान-नाक-गला व आंख', nameEn: 'Ear, Nose, Throat & Eyes' },
    { key: 'PNEO', name: 'नवजात रोग (0-28 दिन)', nameEn: 'Neonatal (0-28 days)' },
    { key: 'PIMM', name: 'टीकाकरण व वृद्धि', nameEn: 'Immunization & Growth' },
    { key: 'PDEV', name: 'विकास, व्यवहार व अन्य', nameEn: 'Development, Behaviour & Others' },
  ],

  // ══ Complaints (53) ═════════════════════════════════════════════════════
  complaints: [
    // PGEN — General Symptoms
    { code: 'PGE01', categoryKey: 'PGEN', detail: 'बुखार', detailEn: 'Fever' },
    { code: 'PGE02', categoryKey: 'PGEN', detail: 'लंबा बुखार (14 दिन से ज्यादा)', detailEn: 'Prolonged Fever (>14 Days)' },
    { code: 'PGE03', categoryKey: 'PGEN', detail: 'बुखार के साथ शरीर पर दाने', detailEn: 'Fever with Rash' },
    { code: 'PGE04', categoryKey: 'PGEN', detail: 'बच्चा बहुत रो रहा है', detailEn: 'Excessive Crying / Irritability' },
    { code: 'PGE05', categoryKey: 'PGEN', detail: 'दूध-खाना नहीं ले रहा', detailEn: 'Poor Feeding / Refusing Feeds' },
    { code: 'PGE06', categoryKey: 'PGEN', detail: 'सुस्ती / दिन भर सोता रहना', detailEn: 'Lethargy / Drowsy Child' },
    { code: 'PGE07', categoryKey: 'PGEN', detail: 'दौरे पड़ना (झटके)', detailEn: 'Fits / Seizures' },
    { code: 'PGE08', categoryKey: 'PGEN', detail: 'सिरदर्द', detailEn: 'Headache' },
    { code: 'PGE09', categoryKey: 'PGEN', detail: 'चेहरे-हाथों का पीलापन (खून की कमी)', detailEn: 'Pallor (Anemia Screen)' },
    // PRES — Respiratory
    { code: 'PRE01', categoryKey: 'PRES', detail: 'सूखी खांसी', detailEn: 'Dry Cough' },
    { code: 'PRE02', categoryKey: 'PRES', detail: 'बलगम वाली खांसी', detailEn: 'Cough with Sputum' },
    { code: 'PRE03', categoryKey: 'PRES', detail: 'जुकाम / नाक बहना', detailEn: 'Cold / Runny Nose' },
    { code: 'PRE04', categoryKey: 'PRES', detail: 'नाक बंद होना', detailEn: 'Nasal Congestion / Blocked Nose' },
    { code: 'PRE05', categoryKey: 'PRES', detail: 'घरघराहट / सांस की आवाज़', detailEn: 'Wheezing / Noisy Breathing' },
    { code: 'PRE06', categoryKey: 'PRES', detail: 'तेज सांस / सांस फूलना', detailEn: 'Rapid Breathing / Breathlessness' },
    { code: 'PRE07', categoryKey: 'PRES', detail: 'बार-बार सर्दी-खांसी होना', detailEn: 'Recurrent Cough & Cold' },
    // PGAS — GI & Dehydration
    { code: 'PGA01', categoryKey: 'PGAS', detail: 'पतले दस्त', detailEn: 'Loose Stools / Diarrhoea' },
    { code: 'PGA02', categoryKey: 'PGAS', detail: 'उल्टी', detailEn: 'Vomiting' },
    { code: 'PGA03', categoryKey: 'PGAS', detail: 'पेट दर्द', detailEn: 'Abdominal Pain / Stomach Ache' },
    { code: 'PGA04', categoryKey: 'PGAS', detail: 'कब्ज', detailEn: 'Constipation' },
    { code: 'PGA05', categoryKey: 'PGAS', detail: 'शिशु कोलिक / गैस (रोने वाला बच्चा)', detailEn: 'Infant Colic / Excessive Gas' },
    { code: 'PGA06', categoryKey: 'PGAS', detail: 'दस्त में खून', detailEn: 'Blood in Stool' },
    { code: 'PGA07', categoryKey: 'PGAS', detail: 'पेट में कीड़े', detailEn: 'Worm Infestation' },
    { code: 'PGA08', categoryKey: 'PGAS', detail: 'मुंह के छाले', detailEn: 'Mouth Ulcers' },
    { code: 'PGA09', categoryKey: 'PGAS', detail: 'दांत निकलने में परेशानी', detailEn: 'Teething Trouble' },
    // PSKN — Skin & Allergy
    { code: 'PSK01', categoryKey: 'PSKN', detail: 'त्वचा पर दाने', detailEn: 'Skin Rash' },
    { code: 'PSK02', categoryKey: 'PSKN', detail: 'खुजली / खुजलाना', detailEn: 'Itching / Scratching' },
    { code: 'PSK03', categoryKey: 'PSKN', detail: 'पित्ती / एलर्जी के चकत्ते', detailEn: 'Urticaria / Hives' },
    { code: 'PSK04', categoryKey: 'PSKN', detail: 'मच्छर / कीड़े का काटना', detailEn: 'Insect / Mosquito Bite' },
    { code: 'PSK05', categoryKey: 'PSKN', detail: 'फोड़ा-फुंसी / त्वचा का संक्रमण', detailEn: 'Boil / Skin Infection' },
    { code: 'PSK06', categoryKey: 'PSKN', detail: 'डायपर रैश', detailEn: 'Diaper Rash' },
    // PENT — ENT & Eyes
    { code: 'PEN01', categoryKey: 'PENT', detail: 'कान दर्द', detailEn: 'Ear Pain' },
    { code: 'PEN02', categoryKey: 'PENT', detail: 'कान से पानी / मवाद आना', detailEn: 'Ear Discharge' },
    { code: 'PEN03', categoryKey: 'PENT', detail: 'गले में दर्द', detailEn: 'Sore Throat / Throat Pain' },
    { code: 'PEN04', categoryKey: 'PENT', detail: 'आंख से पानी / मवाद आना', detailEn: 'Eye Discharge / Sticky Eyes' },
    { code: 'PEN05', categoryKey: 'PENT', detail: 'नाक से खून आना', detailEn: 'Nosebleed / Epistaxis' },
    { code: 'PEN06', categoryKey: 'PENT', detail: 'खर्राटे आना / नाक बजना', detailEn: 'Snoring / Noisy Sleep' },
    { code: 'PEN07', categoryKey: 'PENT', detail: 'बार-बार कान-गला का संक्रमण', detailEn: 'Recurrent ENT Infections' },
    // PNEO — Neonatal (0-28 days)
    { code: 'PNE01', categoryKey: 'PNEO', detail: 'नवजात पीलिया (पीली त्वचा)', detailEn: 'Neonatal Jaundice' },
    { code: 'PNE02', categoryKey: 'PNEO', detail: 'नाभि से पानी / लालिमा', detailEn: 'Umbilical Discharge / Redness' },
    { code: 'PNE03', categoryKey: 'PNEO', detail: 'दूध उगलना (स्पिट-अप)', detailEn: 'Regurgitation / Spitting Up' },
    // PIMM — Immunization & Growth
    { code: 'PIM01', categoryKey: 'PIMM', detail: 'टीकाकरण की सलाह / खुराक बाकी है', detailEn: 'Vaccination Query / Due Dose' },
    { code: 'PIM02', categoryKey: 'PIMM', detail: 'टीके के बाद बुखार / सूजन', detailEn: 'Post-Vaccination Fever / Swelling' },
    { code: 'PIM03', categoryKey: 'PIMM', detail: 'वजन नहीं बढ़ रहा', detailEn: 'Not Gaining Weight / Underweight' },
    { code: 'PIM04', categoryKey: 'PIMM', detail: 'खाने की रुचि नहीं (छिछोरा खाने वाला)', detailEn: 'Picky Eating / Poor Appetite' },
    { code: 'PIM05', categoryKey: 'PIMM', detail: 'विटामिन / कैल्शियम की कमी की शंका', detailEn: 'Suspected Vitamin / Calcium Deficiency' },
    // PDEV — Development, Behaviour & Others
    { code: 'PDE01', categoryKey: 'PDEV', detail: 'बोलने में देरी', detailEn: 'Speech Delay' },
    { code: 'PDE02', categoryKey: 'PDEV', detail: 'माइलस्टोन में देरी', detailEn: 'Delayed Milestones' },
    { code: 'PDE03', categoryKey: 'PDEV', detail: 'बिस्तर गीलाना (बिस्तर गीला)', detailEn: 'Bedwetting / Enuresis' },
    { code: 'PDE04', categoryKey: 'PDEV', detail: 'स्कूल में परेशानी', detailEn: 'School Problems' },
    { code: 'PDE05', categoryKey: 'PDEV', detail: 'बहुत चंचल / ध्यान न रहना', detailEn: 'Hyperactivity / Poor Attention' },
    { code: 'PDE06', categoryKey: 'PDEV', detail: 'रोते समय सांस रोकना', detailEn: 'Breath-Holding Spell' },
    { code: 'PDE07', categoryKey: 'PDEV', detail: 'चोट / कुत्ते के काटने के बाद टीका', detailEn: 'Injury / Dog Bite (Vaccine Advice)' },
  ],

  // ══ Questions (106 — exactly 2 per complaint, red-flag screen built in) ══
  // AUTHORING CONVENTION: trailing `// idx N` = array index; suggestions
  // below reference these numbers. Keep both in sync!
  questions: [
    // PGE01 Fever
    { complaintCode: 'PGE01', question: 'बुखार कितने दिनों से है और थर्मामीटर पर कितना आता है?', questionEn: 'Since how many days is the fever, and how high is it on the thermometer?' }, // idx 0
    { complaintCode: 'PGE01', question: 'बच्चा सुस्त है, दूध-खाना छोड़ रहा है या रात में भी बहुत रो रहा है?', questionEn: 'Is the child lethargic, refusing feeds, or crying excessively at night?' }, // idx 1
    // PGE02 Prolonged fever
    { complaintCode: 'PGE02', question: 'बुखार लगातार कितने दिनों से है?', questionEn: 'For how many days has the fever persisted?' }, // idx 2
    { complaintCode: 'PGE02', question: 'अब तक कौन-कौन सी जांचें हुई हैं (CBC, टाइफाइड, मलेरिया, यूरीन)?', questionEn: 'Which tests have been done so far (CBC, typhoid, malaria, urine)?' }, // idx 3
    // PGE03 Fever with rash
    { complaintCode: 'PGE03', question: 'दाने कहां से शुरू हुए — चेहरे से या पैरों से?', questionEn: 'Where did the rash start — face or legs?' }, // idx 4
    { complaintCode: 'PGE03', question: 'बुखार के साथ तेज शरीर दर्द, आंखों के पीछे दर्द या नाक/मसूढ़ों से खून आया है?', questionEn: 'With fever, any severe body ache, pain behind the eyes, or bleeding from nose/gums?' }, // idx 5
    // PGE04 Excessive crying
    { complaintCode: 'PGE04', question: 'रोना दिन में ज्यादा है या शाम/रात में?', questionEn: 'Is the crying more during the day or in the evening/night?' }, // idx 6
    { complaintCode: 'PGE04', question: 'रोते समय टांगें पेट की ओर खींचता है या पेट छूने पर और रोता है?', questionEn: 'Does the child pull the legs towards the belly, or cry more when the tummy is touched?' }, // idx 7
    // PGE05 Poor feeding
    { complaintCode: 'PGE05', question: 'कितने दिनों से दूध-खाना कम ले रहा है?', questionEn: 'Since how many days has the child been feeding poorly?' }, // idx 8
    { complaintCode: 'PGE05', question: 'पेशाब कम हुआ है / नैपी गीली होना कम हुआ है?', questionEn: 'Has urine output / wet nappies reduced?' }, // idx 9
    // PGE06 Lethargy
    { complaintCode: 'PGE06', question: 'बच्चे को जगाना मुश्किल है या उठाने पर ढीला-ढाला लगता है?', questionEn: 'Is the child difficult to wake, or floppy when lifted?' }, // idx 10
    { complaintCode: 'PGE06', question: 'सुस्ती के साथ बुखार, उल्टी या दौरे भी हुए हैं?', questionEn: 'Any fever, vomiting, or seizures along with the lethargy?' }, // idx 11
    // PGE07 Fits
    { complaintCode: 'PGE07', question: 'दौरे में हाथ-पैर कैसे हिले, कितनी देर रहा, और बाद में बच्चा जाग गया?', questionEn: 'How did the limbs move, how long did it last, and did the child wake up afterwards?' }, // idx 12
    { complaintCode: 'PGE07', question: 'दौरे के समय बुखार था या बिना बुखार आया?', questionEn: 'Was there fever at the time, or did it occur without fever?' }, // idx 13
    // PGE08 Headache
    { complaintCode: 'PGE08', question: 'सिरदर्द कब-कब होता है — सुबह उठते ही या स्कूल से आकर?', questionEn: 'When does the headache occur — on waking in the morning or after school?' }, // idx 14
    { complaintCode: 'PGE08', question: 'सिरदर्द के साथ उल्टी, देखने में दिक्कत या चाल में बदलाव है?', questionEn: 'Any vomiting, vision problems, or change in gait with the headache?' }, // idx 15
    // PGE09 Pallor
    { complaintCode: 'PGE09', question: 'पीलापन कब से है और बढ़ रहा है या नहीं?', questionEn: 'Since when is the pallor, and is it increasing?' }, // idx 16
    { complaintCode: 'PGE09', question: 'पीलेपन के साथ भूख कम लगना, मिट्टी/बर्फ खाने की आदत (पिका) या सांस फूलना है?', questionEn: 'With pallor, any poor appetite, craving to eat mud/ice (pica), or breathlessness?' }, // idx 17
    // PRE01 Dry cough
    { complaintCode: 'PRE01', question: 'खांसी कितने दिनों से है?', questionEn: 'Since how many days is the cough?' }, // idx 18
    { complaintCode: 'PRE01', question: 'खांसी रात में या दौड़ने-खेलने पर बढ़ती है?', questionEn: 'Does the cough worsen at night or with running/playing?' }, // idx 19
    // PRE02 Productive cough
    { complaintCode: 'PRE02', question: 'बलगम का रंग कैसा है?', questionEn: 'What is the colour of the sputum?' }, // idx 20
    { complaintCode: 'PRE02', question: 'खांसी के साथ तेज सांस, सीने में घरघराहट या बुखार है?', questionEn: 'Any fast breathing, wheezing in the chest, or fever with the cough?' }, // idx 21
    // PRE03 Cold
    { complaintCode: 'PRE03', question: 'नाक से पानी बह रहा है या नाक बंद है?', questionEn: 'Is the nose running or blocked?' }, // idx 22
    { complaintCode: 'PRE03', question: 'जुकाम कितने दिनों से है — 10 दिनों से ज्यादा तो नहीं?', questionEn: 'How many days has the cold lasted — more than 10 days?' }, // idx 23
    // PRE04 Blocked nose
    { complaintCode: 'PRE04', question: 'नाक बंद होने से दूध पीने / खाने में दिक्कत होती है?', questionEn: 'Is the blocked nose interfering with feeding?' }, // idx 24
    { complaintCode: 'PRE04', question: 'नाक में मोटा या हरे रंग का स्राव है?', questionEn: 'Is there thick or green-coloured nasal discharge?' }, // idx 25
    // PRE05 Wheeze
    { complaintCode: 'PRE05', question: 'पहले भी घरघराहट / दमा का एपिसोड हुआ है?', questionEn: 'Any previous episodes of wheeze / asthma?' }, // idx 26
    { complaintCode: 'PRE05', question: 'अभी बच्चा बोलते या खेलते समय सांस फूल रहा है, या सीना अंदर को धँस रहा है?', questionEn: 'Is the child breathless while talking or playing, or is the chest drawing in?' }, // idx 27
    // PRE06 Rapid breathing
    { complaintCode: 'PRE06', question: 'शांत बच्चे में एक मिनट की सांस की गिनती कितनी है?', questionEn: 'What is the breathing rate per minute in a calm child?' }, // idx 28
    { complaintCode: 'PRE06', question: 'सांस के साथ दूध छोड़ना, होंठ/मुंह नीले पड़ना या बहुत सुस्ती है?', questionEn: 'With the breathing trouble, refusing feeds, blue lips/mouth, or extreme lethargy?' }, // idx 29
    // PRE07 Recurrent cough-cold
    { complaintCode: 'PRE07', question: 'साल में कितनी बार सर्दी-खांसी होती है?', questionEn: 'How many episodes of cough and cold per year?' }, // idx 30
    { complaintCode: 'PRE07', question: 'हर एपिसोड में एंटीबायोटिक चाहिए ही पड़ती है?', questionEn: 'Does every episode need antibiotics?' }, // idx 31
    // PGA01 Loose motions
    { complaintCode: 'PGA01', question: 'पिछले 24 घंटे में कितनी बार पतले दस्त हुए?', questionEn: 'How many loose stools in the last 24 hours?' }, // idx 32
    { complaintCode: 'PGA01', question: 'पेशाब कम हो गया, आंखें धँस गईं या जीभ सूखी है?', questionEn: 'Reduced urine, sunken eyes, or dry tongue?' }, // idx 33
    // PGA02 Vomiting
    { complaintCode: 'PGA02', question: 'उल्टी कितनी बार हुई और खाने के तुरंत बाद होती है?', questionEn: 'How many episodes of vomiting, and do they occur right after feeds?' }, // idx 34
    { complaintCode: 'PGA02', question: 'उल्टी हरी/पीली है या उसमें खून आया है?', questionEn: 'Is the vomit green/yellow, or is there blood in it?' }, // idx 35
    // PGA03 Abdominal pain
    { complaintCode: 'PGA03', question: 'दर्द पेट के किस हिस्से में है?', questionEn: 'Which part of the abdomen hurts?' }, // idx 36
    { complaintCode: 'PGA03', question: 'दर्द के साथ उल्टी, दस्त में खून या मल छोड़ने के बाद भी दर्द बना रहना है?', questionEn: 'Any vomiting, blood in stools, or pain persisting even after passing stool?' }, // idx 37
    // PGA04 Constipation
    { complaintCode: 'PGA04', question: 'कितने दिनों से पेट साफ नहीं हुआ?', questionEn: 'How many days since the last proper stool?' }, // idx 38
    { complaintCode: 'PGA04', question: 'मल त्याग के समय दर्द है या मल में खून आया है?', questionEn: 'Any pain while passing stool, or blood on the stool?' }, // idx 39
    // PGA05 Colic
    { complaintCode: 'PGA05', question: 'रोना शाम को एक ही समय पर शुरू होता है?', questionEn: 'Does the crying start at the same time each evening?' }, // idx 40
    { complaintCode: 'PGA05', question: 'बच्चे की उम्र क्या है — क्या वह 5 महीने से छोटा है?', questionEn: 'What is the baby\'s age — is it under 5 months?' }, // idx 41
    // PGA06 Blood in stool
    { complaintCode: 'PGA06', question: 'खून दस्त में मिला था या मल की सतह पर चिपका था?', questionEn: 'Was the blood mixed into the stool or smeared on the surface?' }, // idx 42
    { complaintCode: 'PGA06', question: 'दस्त की बार-बारता बढ़ी है या बच्चा बहुत सुस्त है?', questionEn: 'Has stool frequency increased, or is the child very lethargic?' }, // idx 43
    // PGA07 Worms
    { complaintCode: 'PGA07', question: 'मल में कीड़े निकले हैं?', questionEn: 'Have worms been seen in the stool?' }, // idx 44
    { complaintCode: 'PGA07', question: 'रात को गुदा खुजलाना या भूख कम लगना है?', questionEn: 'Any night-time anal itching or reduced appetite?' }, // idx 45
    // PGA08 Mouth ulcers
    { complaintCode: 'PGA08', question: 'छाले कितने दिनों से हैं और खाने-पीने में दर्द है?', questionEn: 'Since how many days the ulcers, and is there pain while eating?' }, // idx 46
    { complaintCode: 'PGA08', question: 'बुखार, लार टपकना या हाथ-पैर-मुंह पर पानी के छाले हैं?', questionEn: 'Any fever, drooling, or water-filled blisters on hands, feet and mouth?' }, // idx 47
    // PGA09 Teething
    { complaintCode: 'PGA09', question: 'मसूढ़े सूजे हैं या दांत निकलने में दर्द लग रहा है?', questionEn: 'Are the gums swollen, or is the teething painful?' }, // idx 48
    { complaintCode: 'PGA09', question: 'दांत निकलने के साथ दस्त या तेज बुखार भी है?', questionEn: 'Any diarrhoea or high fever along with the teething?' }, // idx 49
    // PSK01 Rash
    { complaintCode: 'PSK01', question: 'दाने कहां से शुरू हुए और उनमें खुजली है?', questionEn: 'Where did the rash start, and is it itchy?' }, // idx 50
    { complaintCode: 'PSK01', question: 'दानों से पहले बुखार था या कोई नई दवा शुरू की थी?', questionEn: 'Was there fever before the rash, or any new medicine started?' }, // idx 51
    // PSK02 Itching
    { complaintCode: 'PSK02', question: 'खुजली रात में तेज है और घर के और लोगों को भी है?', questionEn: 'Is the itching worse at night, and do others in the family itch too?' }, // idx 52
    { complaintCode: 'PSK02', question: 'उंगलियों के बीच या गुदा/जांघों के आसपास ज्यादा खुजली है?', questionEn: 'Is the itching mainly between the fingers or around the genitals/thighs?' }, // idx 53
    // PSK03 Urticaria
    { complaintCode: 'PSK03', question: 'चकत्ते उठते और 1-2 घंटे में गायब हो जाते हैं?', questionEn: 'Do the wheals appear and disappear within 1-2 hours?' }, // idx 54
    { complaintCode: 'PSK03', question: 'होंठ, आंख या जीभ में सूजन या सांस में दिक्कत है?', questionEn: 'Any swelling of lips, eyes or tongue, or breathing difficulty?' }, // idx 55
    // PSK04 Insect bite
    { complaintCode: 'PSK04', question: 'काटने के बाद सूजन/दर्द कितनी जगह फैला है?', questionEn: 'How much swelling/pain has spread after the bite?' }, // idx 56
    { complaintCode: 'PSK04', question: 'बुखार, बढ़ती लालिमा या मवाद (फोड़ा) बन रहा है?', questionEn: 'Any fever, spreading redness, or pus formation?' }, // idx 57
    // PSK05 Boil
    { complaintCode: 'PSK05', question: 'फोड़े कहां-कहां हैं और कितने दिनों से हैं?', questionEn: 'Where are the boils and since how many days?' }, // idx 58
    { complaintCode: 'PSK05', question: 'बुखार है या एक साथ कई फोड़े निकले हैं?', questionEn: 'Is there fever, or multiple boils at the same time?' }, // idx 59
    // PSK06 Diaper rash
    { complaintCode: 'PSK06', question: 'डायपर वाले हिस्से पर लाली कितने दिनों से है?', questionEn: 'Since how many days is the diaper area red?' }, // idx 60
    { complaintCode: 'PSK06', question: 'लाली के किनारों पर सफेद छोटे दाने या त्वचा छिली है?', questionEn: 'Any white satellite spots at the edges, or raw broken skin?' }, // idx 61
    // PEN01 Ear pain
    { complaintCode: 'PEN01', question: 'कान में दर्द कितने दिनों से है और बच्चा कान खींचता/खुजलाता है?', questionEn: 'Since how many days is the ear pain, and does the child pull at the ear?' }, // idx 62
    { complaintCode: 'PEN01', question: 'दर्द के साथ बुखार, सुनने में कमी या कान से पानी आना है?', questionEn: 'With the pain, any fever, reduced hearing, or discharge from the ear?' }, // idx 63
    // PEN02 Ear discharge
    { complaintCode: 'PEN02', question: 'कान से क्या आ रहा है — पानी, मवाद या खून?', questionEn: 'What is coming from the ear — watery, pus, or blood?' }, // idx 64
    { complaintCode: 'PEN02', question: 'स्राव के साथ बुखार या कान के पीछे सूजन/दर्द है?', questionEn: 'With the discharge, any fever or swelling/pain behind the ear?' }, // idx 65
    // PEN03 Sore throat
    { complaintCode: 'PEN03', question: 'निगलने में दर्द है और खाना छोड़ रहा है?', questionEn: 'Is there pain on swallowing, and is the child refusing food?' }, // idx 66
    { complaintCode: 'PEN03', question: 'बुखार के साथ टॉन्सिल पर सफेद दाने या गले में गांठ जैसा दिखता है?', questionEn: 'With fever, any white spots on the tonsils or an abscess-like bulge in the throat?' }, // idx 67
    // PEN04 Eye discharge
    { complaintCode: 'PEN04', question: 'सुबह आंखें चिपकती हैं और स्राव का रंग कैसा है?', questionEn: 'Do the eyes stick shut in the morning, and what colour is the discharge?' }, // idx 68
    { complaintCode: 'PEN04', question: 'आंख लाल है या पलकों पर सूजन है?', questionEn: 'Is the eye red, or are the lids swollen?' }, // idx 69
    // PEN05 Nosebleed
    { complaintCode: 'PEN05', question: 'खून कितनी बार आया और रुकने में कितना समय लगा?', questionEn: 'How many times did it bleed, and how long did it take to stop?' }, // idx 70
    { complaintCode: 'PEN05', question: 'नाक में उंगली या कोई चीज डालने की आदत है, या बार-बार खून आता है?', questionEn: 'Any nose-picking habit, or recurrent bleeds?' }, // idx 71
    // PEN06 Snoring
    { complaintCode: 'PEN06', question: 'खर्राटे रोज आते हैं या बीमार होने पर ही?', questionEn: 'Does the child snore daily, or only during illness?' }, // idx 72
    { complaintCode: 'PEN06', question: 'नींद में सांस रुकने जैसा लगता है या मुंह खोलकर सोता है?', questionEn: 'Any pauses in breathing during sleep, or constant mouth-breathing?' }, // idx 73
    // PEN07 Recurrent ENT infections
    { complaintCode: 'PEN07', question: 'पिछले एक साल में कितनी बार कान/गला का संक्रमण हुआ?', questionEn: 'How many ear/throat infections in the past year?' }, // idx 74
    { complaintCode: 'PEN07', question: 'इन संक्रमणों के लिए कितनी बार एंटीबायोटिक चली?', questionEn: 'How many antibiotic courses for these infections?' }, // idx 75
    // PNE01 Neonatal jaundice
    { complaintCode: 'PNE01', question: 'पीलापन जन्म के कितने दिन बाद शुरू हुआ और अब कहां तक बढ़ा है?', questionEn: 'On which day of life did the yellowing start, and how far has it spread now?' }, // idx 76
    { complaintCode: 'PNE01', question: 'बच्चा दूध अच्छे से पी रहा है और नॉर्मल जाग रहा है, या बहुत सुस्त है?', questionEn: 'Is the baby feeding well and waking normally, or very sleepy?' }, // idx 77
    // PNE02 Umbilical discharge
    { complaintCode: 'PNE02', question: 'नाभि से क्या आ रहा है — पानी, मवाद या खून?', questionEn: 'What is coming from the umbilicus — watery, pus, or blood?' }, // idx 78
    { complaintCode: 'PNE02', question: 'नाभि के चारों ओर लाली या बदबू है?', questionEn: 'Any redness around the cord or a foul smell?' }, // idx 79
    // PNE03 Regurgitation
    { complaintCode: 'PNE03', question: 'दूध उगलना हर बार होता है या कभी-कभी, और बच्चा खुश-चैन रहता है?', questionEn: 'Does the baby spit up after every feed or occasionally, and is the baby content?' }, // idx 80
    { complaintCode: 'PNE03', question: 'उगलना फेंककर (प्रोजेक्टाइल) है या वजन नहीं बढ़ रहा?', questionEn: 'Is the spit-up projectile, or is the weight gain poor?' }, // idx 81
    // PIM01 Vaccination query
    { complaintCode: 'PIM01', question: 'बच्चे की उम्र क्या है और अब तक कौन-कौन से टीके लगे हैं?', questionEn: 'What is the child\'s age, and which vaccines have been given so far?' }, // idx 82
    { complaintCode: 'PIM01', question: 'कोई टीका छूट गया है या तारीख पर नहीं लग पाया?', questionEn: 'Any missed vaccine, or a dose delayed beyond its due date?' }, // idx 83
    // PIM02 Post-vaccination fever
    { complaintCode: 'PIM02', question: 'टीका कब लगा और बुखार कब से शुरू हुआ?', questionEn: 'When was the vaccine given, and when did the fever start?' }, // idx 84
    { complaintCode: 'PIM02', question: 'टीके वाली जगह पर सूजन/दर्द है या बच्चा बहुत सुस्त है?', questionEn: 'Any swelling/pain at the injection site, or is the child very dull?' }, // idx 85
    // PIM03 Not gaining weight
    { complaintCode: 'PIM03', question: 'पिछले कितने महीनों में वजन कितना बढ़ा है?', questionEn: 'How much weight has been gained over the last few months?' }, // idx 86
    { complaintCode: 'PIM03', question: 'खाना कैसे लेता है — मां का दूध/फॉर्मूला/ठोस आहार, दिन में कितनी बार?', questionEn: 'How is the feeding — breast/formula/solids, and how many times a day?' }, // idx 87
    // PIM04 Picky eating
    { complaintCode: 'PIM04', question: 'खाना छोड़ने की शिकायत कितने महीनों से है?', questionEn: 'Since how many months has the picky eating been going on?' }, // idx 88
    { complaintCode: 'PIM04', question: 'दिन भर में दूध, जूस या बिस्कुट से पेट भर लेता है?', questionEn: 'Does the child fill up on milk, juices or biscuits through the day?' }, // idx 89
    // PIM05 Vitamin/calcium deficiency
    { complaintCode: 'PIM05', question: 'घुटनों में दर्द, रात को टांग दर्द या टांगें झुकी हुई हैं?', questionEn: 'Any knee pain, night-time leg pain, or bowed legs?' }, // idx 90
    { complaintCode: 'PIM05', question: 'दिन में धूप में खेलने का समय कितना मिलता है?', questionEn: 'How much time does the child get to play outdoors in the sun?' }, // idx 91
    // PDE01 Speech delay
    { complaintCode: 'PDE01', question: 'बच्चा कौन-कौन से शब्द बोलता है और बोली जानी बात समझता है?', questionEn: 'Which words does the child say, and does he/she understand what is spoken?' }, // idx 92
    { complaintCode: 'PDE01', question: 'आवाज करने या नाम पुकारने पर पलटकर देखता है?', questionEn: 'Does the child turn and look when called by name or on hearing sounds?' }, // idx 93
    // PDE02 Delayed milestones
    { complaintCode: 'PDE02', question: 'कौन से माइलस्टोन हो गए और कौन से बाकी हैं (गर्दन, बैठना, चलना, बोलना)?', questionEn: 'Which milestones are achieved and which are pending (head control, sitting, walking, speech)?' }, // idx 94
    { complaintCode: 'PDE02', question: 'गर्भावस्था या जन्म के समय कोई समस्या थी (समय से पहले जन्म, पीलिया, दौरे)?', questionEn: 'Any problem during pregnancy or birth (preterm, jaundice, seizures)?' }, // idx 95
    // PDE03 Bedwetting
    { complaintCode: 'PDE03', question: 'हफ्ते में कितनी रात बिस्तर गीला होता है और बच्चे की उम्र क्या है?', questionEn: 'How many wet nights per week, and what is the child\'s age?' }, // idx 96
    { complaintCode: 'PDE03', question: 'दिन में बार-बार पेशाब जाना, पेशाब रोकने की जल्दी या बहुत ज्यादा प्यास लगना है?', questionEn: 'Any daytime frequency, urgency, or excessive thirst?' }, // idx 97
    // PDE04 School problems
    { complaintCode: 'PDE04', question: 'स्कूल में क्या परेशानी है — पढ़ाई में पीछे, ध्यान न रहना, या दोस्तों से झगड़ा?', questionEn: 'What is the school problem — lagging in studies, poor attention, or fights with friends?' }, // idx 98
    { complaintCode: 'PDE04', question: 'टीचर ने क्या बताया और घर पर बच्चे के व्यवहार में बदलाव आया है?', questionEn: 'What did the teacher report, and has the child\'s behaviour changed at home?' }, // idx 99
    // PDE05 Hyperactivity
    { complaintCode: 'PDE05', question: 'बच्चा एक जगह बैठकर कितनी देर एक काम कर पाता है?', questionEn: 'How long can the child sit and finish one task?' }, // idx 100
    { complaintCode: 'PDE05', question: 'दिन में मोबाइल/TV (स्क्रीन) का समय कितना है?', questionEn: 'How much screen (mobile/TV) time per day?' }, // idx 101
    // PDE06 Breath-holding
    { complaintCode: 'PDE06', question: 'रोने/गुस्से के बाद सांस रुक जाती है या होंठ नीले पड़ते हैं?', questionEn: 'After crying or a tantrum, does the breath stop or do the lips turn blue?' }, // idx 102
    { complaintCode: 'PDE06', question: 'इस दौरान बेहोशी या झटके आते हैं?', questionEn: 'Does the child faint or have convulsive movements during these episodes?' }, // idx 103
    // PDE07 Injury / dog bite
    { complaintCode: 'PDE07', question: 'काटने/चोट कब हुई और किस जानवर ने काटा (पालतू/आवारा, टीकाकरण पता है?)', questionEn: 'When did the bite/injury occur, and which animal bit (pet/stray, vaccination status known?)' }, // idx 104
    { complaintCode: 'PDE07', question: 'घाव कितना गहरा है और खून बह रहा था?', questionEn: 'How deep is the wound, and was it bleeding?' }, // idx 105
  ],

  // ══ Suggestions (212 — 2 per question; questionIndex matches idx above) ══
  // Practical Hindi advice PRINTED for parents: ORS, feeding, danger signs,
  // when to return. English mirrors for doctor search.
  suggestions: [
    // q0 (PGE01 fever duration)
    { questionIndex: 0, text: '3 दिन से कम बुखार, बच्चा नॉर्मल — वायरल संभव: पैरासिटामोल साइरप + भरपूर तरल दें', textEn: 'Fever under 3 days, child otherwise well — likely viral: paracetamol syrup + plenty of fluids' },
    { questionIndex: 0, text: 'बुखार 5 दिन से ज्यादा या बार-बार 103°F — CBC जांच और डॉक्टर से दोबारा मिलें', textEn: 'Fever over 5 days or repeatedly 103°F — get CBC and doctor review' },
    // q1 (PGE01 danger signs)
    { questionIndex: 1, text: 'सुस्ती + दूध छोड़ना + बहुत रोना — उसी दिन डॉक्टर को दिखाएं, रात का इंतजार न करें', textEn: 'Lethargy + refusing feeds + inconsolable crying — see the doctor the same day' },
    { questionIndex: 1, text: '3 महीने से छोटा बच्चा और बुखार 100.4°F या ज्यादा — बिना देरी अस्पताल ले जाएं', textEn: 'Baby under 3 months with fever 100.4°F or more — take to hospital without delay' },
    // q2 (PGE02 prolonged fever days)
    { questionIndex: 2, text: '14 दिन+ बुखार — पूरी जांच (CBC, ESR, टाइफाइड, यूरीन, जरूरी हो तो USG) जरूरी', textEn: 'Fever 14+ days — full workup needed (CBC, ESR, typhoid, urine, USG if indicated)' },
    { questionIndex: 2, text: 'जांच पूरी होने तक बुखार का रिकॉर्ड (दिन में 3 बार) लिखते रहें — डॉक्टर को दिखाएं', textEn: 'Keep a temperature chart (3 times daily) until workup — show it to the doctor' },
    // q3 (PGE02 tests done)
    { questionIndex: 3, text: 'जांचें नहीं हुईं — आज ही CBC व जरूरी टेस्ट कराएं; खुद से एंटीबायोटिक शुरू न करें', textEn: 'No tests done yet — get CBC and needed tests today; do not self-start antibiotics' },
    { questionIndex: 3, text: 'जांचें हो चुकी हैं — रिपोर्ट लेकर अगली विजिट में दिखाएं, खुराक बदलना डॉक्टर तय करेंगे', textEn: 'Tests already done — bring reports at the next visit; dose changes are the doctor\'s call' },
    // q4 (PGE03 rash origin)
    { questionIndex: 4, text: 'चेहरे/कान के पीछे से शुरू दाने — वायरल रैश संभव; खुजलाए नहीं, नाखून छोटे रखें', textEn: 'Rash starting on face/behind ears — likely viral exanthem; discourage scratching, keep nails short' },
    { questionIndex: 4, text: 'पैरों/नितंबों से शुरू दाने — हेनोक-स्कोनलाइन जैसी जांच की जरूरी — डॉक्टर से मिलें', textEn: 'Rash starting on legs/buttocks — needs evaluation (e.g., HSP) — see the doctor' },
    // q5 (PGE03 dengue warning)
    { questionIndex: 5, text: 'शरीर दर्द + आंखों के पीछे दर्द — डेंगू जांच (NS1/platelets) कराएं, मच्छर से बचाव करें', textEn: 'Body ache + retro-orbital pain — test for dengue (NS1/platelets), prevent mosquito bites' },
    { questionIndex: 5, text: 'नाक/मसूढ़ों से खून, काला मल या तेज पेट दर्द — डेंगू खतरनाक चरण, तुरंत अस्पताल', textEn: 'Bleeding from nose/gums, black stools or severe abdominal pain — danger phase, hospital NOW' },
    // q6 (PGE04 crying pattern)
    { questionIndex: 6, text: 'शाम का एक ही समय पर रोना — कोलिक संभव: डकार, पेट की हल्की मालिश, झुलाना; यह 3-4 महीने में ठीक हो जाता है', textEn: 'Same-time evening crying — likely colic: burping, gentle tummy massage, rocking; resolves by 3-4 months' },
    { questionIndex: 6, text: 'दिन-रात लगातार रोना — बुखार, कान दर्द या अन्य कारण जांचना जरूरी', textEn: 'Persistent crying day and night — check for fever, ear pain or other causes' },
    // q7 (PGE04 colic signs)
    { questionIndex: 7, text: 'टांगें खींचना + पेट सख्त — गैस/कोलिक: हर दूध के बाद 10-15 मिनट डकार लें', textEn: 'Legs pulled up + tense tummy — gas/colic: burp 10-15 minutes after every feed' },
    { questionIndex: 7, text: 'पेट छूने पर तेज रोना या उल्टी साथ हो — गंभीर कारण (इंटससेप्शन) निकालें, तुरंत जांच कराएं', textEn: 'Crying on touching the belly with vomiting — rule out serious causes (intussusception), urgent review' },
    // q8 (PGE05 poor feeding duration)
    { questionIndex: 8, text: 'बीमारी के दौरान भूख कम लगना सामान्य — छोटे-छोटे, बार-बार पसंदीदा हल्का खाना दें, जबरदस्ती न करें', textEn: 'Poor appetite during illness is normal — small, frequent favourite light meals; never force feed' },
    { questionIndex: 8, text: '2 दिन से ज्यादा दूध/खाना लगभग बंद — डॉक्टर को दिखाएं, पेशाब व वजन देखें', textEn: 'Feeds nearly stopped for 2+ days — see the doctor; watch urine output and weight' },
    // q9 (PGE05 dehydration check)
    { questionIndex: 9, text: 'पेशाब/गीली नैपी कम — ORS खिलाएं और डिहाइड्रेशन की निगरानी करें; घटता रहे तो तुरंत दिखाएं', textEn: 'Reduced urine/wet nappies — give ORS and monitor hydration; if worsening, show immediately' },
    { questionIndex: 9, text: 'चूसने की ताकत कम, मुंह सूखा, रोते में आंसू नहीं — तुरंत अस्पताल (IV तरल चाहिए)', textEn: 'Weak suck, dry mouth, no tears while crying — hospital now (needs IV fluids)' },
    // q10 (PGE06 hard to wake)
    { questionIndex: 10, text: 'बच्चा जगाने पर नहीं जागता या ढीला-ढाला — इमरजेंसी है, अस्पताल ले जाएं (कंधे पर झुकाकर नहीं)', textEn: 'Unrousable or floppy child — EMERGENCY, take to hospital (do NOT hold head-down)' },
    { questionIndex: 10, text: 'हल्की सुस्ती बुखार के साथ और जागने पर नॉर्मल — बुखार घटाएं, प्यास-दूध देते रहें, निगरानी रखें', textEn: 'Mild drowsiness with fever but normal when awake — control fever, keep offering fluids, observe' },
    // q11 (PGE06 associated symptoms)
    { questionIndex: 11, text: 'बिना बुखार-उल्टी की सुस्ती — शुगर/न्यूरो जांच कराएं, देर न करें', textEn: 'Lethargy without fever/vomiting — check sugar/neurological cause, do not delay' },
    { questionIndex: 11, text: 'दौरे के बाद सुस्ती — 30-60 मिनट में नॉर्मल न हो जाए तो तुरंत अस्पताल', textEn: 'Drowsiness after a seizure — if not back to normal in 30-60 minutes, hospital immediately' },
    // q12 (PGE07 seizure description)
    { questionIndex: 12, text: 'दौरा 5 मिनट से कम और बाद में नॉर्मल — बुखारी दौरा संभव; वीडियो/समय नोट करके डॉक्टर को दिखाएं', textEn: 'Seizure under 5 minutes with full recovery — likely febrile seizure; note video/timing for the doctor' },
    { questionIndex: 12, text: 'दौरा लंबा, एक तरफ का, या बाद में कमजोर हाथ-पैर — विस्तृत न्यूरो जांच जरूरी', textEn: 'Prolonged, one-sided seizure, or limb weakness after — detailed neuro workup needed' },
    // q13 (PGE07 fever relation)
    { questionIndex: 13, text: 'बुखार के साथ दौरा (6 माह-5 साल) — बुखारी दौरा आम है; बुखार कंट्रोल करें, घबराएं नहीं', textEn: 'Seizure with fever (6 months-5 years) — febrile seizures are common; control fever, stay calm' },
    { questionIndex: 13, text: 'बिना बुखार का दौरा — एपिलेप्सी जांच (EEG) जरूरी; नींद से पहले तक अकेला न छोड़ें', textEn: 'Seizure without fever — epilepsy workup (EEG) needed; do not leave the child alone unsupervised' },
    // q14 (PGE08 headache timing)
    { questionIndex: 14, text: 'सुबह उठते ही सिरदर्द + उल्टी — तुरंत विस्तृत जांच (न्यूरो); देर न करें', textEn: 'Early-morning headache with vomiting — urgent neuro workup; do not delay' },
    { questionIndex: 14, text: 'स्कूल के बाद सिरदर्द — नींद, पानी, नाश्ता व आंखों की जांच देखें', textEn: 'After-school headaches — check sleep, hydration, breakfast and eyesight' },
    // q15 (PGE08 headache red flags)
    { questionIndex: 15, text: 'देखने में दिक्कत, चाल बदलना या सुबह की उल्टी — तुरंत न्यूरो रेफर (खोले दबाव की शंका)', textEn: 'Vision change, gait change or morning vomiting — urgent neuro referral (raised pressure suspected)' },
    { questionIndex: 15, text: 'साधारण सिरदर्द — आराम, पर्याप्त नींद व पानी; बार-बार हो तो माइग्रेन जांच कराएं', textEn: 'Ordinary headache — rest, adequate sleep and water; if recurrent, get migraine evaluation' },
    // q16 (PGE09 pallor duration)
    { questionIndex: 16, text: 'धीरे-धीरे बढ़ता पीलापन — CBC कराएं; हल्का एनीमिया आहार + आयरन से ठीक होता है', textEn: 'Gradually increasing pallor — do CBC; mild anemia corrects with diet + iron' },
    { questionIndex: 16, text: 'पीलापन हफ्तों में तेजी से बढ़ा या पेशाब गहरा — खून की गंभीर बीमारी की जांच तुरंत', textEn: 'Rapidly worsening pallor or dark urine — urgent workup for haemolytic disease' },
    // q17 (PGE09 anemia clues)
    { questionIndex: 17, text: 'मिट्टी/बर्फ खाने की आदत (पिका) — आयरन की कमी का संकेत; CBC + आयरन जांच कराएं', textEn: 'Craving to eat mud/ice (pica) — sign of iron deficiency; get CBC + iron studies' },
    { questionIndex: 17, text: 'पीलापन + सांस फूलना — गंभीर एनीमिया: गतिविधि घटाएं, तुरंत डॉक्टर को दिखाएं', textEn: 'Pallor + breathlessness — severe anemia: restrict activity, see the doctor immediately' },
    // q18 (PRE01 cough duration)
    { questionIndex: 18, text: '2 हफ्ते से कम सूखी खांसी — वायरल; गर्म तरल, भाप (बड़े बच्चे); ठंडी चीजें बंद', textEn: 'Dry cough under 2 weeks — viral; warm fluids, steam (older children); avoid cold foods' },
    { questionIndex: 18, text: 'खांसी 2 हफ्ते+ — एलर्जी/दमा/टीबी जांचें; धुआं-धूल से दूर रखें', textEn: 'Cough 2+ weeks — evaluate allergy/asthma/TB; keep away from smoke and dust' },
    // q19 (PRE01 night/play cough)
    { questionIndex: 19, text: 'रात में या दौड़ने पर बढ़ती खांसी — घरघराहट/दमे की जांच कराएं', textEn: 'Cough worse at night or on running — get evaluated for wheeze/asthma' },
    { questionIndex: 19, text: '1 साल से ऊपर बच्चे की रात की खांसी में सोने से पहले शहद का चम्मच देना मदद करता है', textEn: 'For night cough above 1 year of age, a spoonful of honey at bedtime helps' },
    // q20 (PRE02 sputum colour)
    { questionIndex: 20, text: 'सफेद/पारदर्शी बलगम — वायरल; पानी ज्यादा दें, खांसी दबाने वाली दवा न दें', textEn: 'White/clear sputum — viral; give plenty of fluids, no cough suppressants' },
    { questionIndex: 20, text: 'पीला/हरा गाढ़ा बलगम + बुखार — बैक्टीरियल संक्रमण की संभावना; जांच व इलाज कराएं', textEn: 'Thick yellow/green sputum with fever — possible bacterial infection; investigate and treat' },
    // q21 (PRE02 red flags)
    { questionIndex: 21, text: 'तेज सांस या सीना अंदर को धँसना — निमोनिया की शंका, उसी दिन डॉक्टर को दिखाएं', textEn: 'Fast breathing or chest indrawing — suspect pneumonia, see the doctor the same day' },
    { questionIndex: 21, text: 'बलगम में खून — TB/गंभीर संक्रमण की जांच जरूरी', textEn: 'Blood in sputum — workup for TB/serious infection essential' },
    // q22 (PRE03 nose state)
    { questionIndex: 22, text: 'बहती नाक + छींके — वायरल जुकाम: सलाइन ड्रॉप्स, नाक नरम कपड़े से साफ करें', textEn: 'Runny nose + sneezing — viral cold: saline drops, wipe nose gently with soft cloth' },
    { questionIndex: 22, text: 'पानीदार स्राव में खुजली-छींके बार-बार — एलर्जिक राइनाइटिस सोचें; धूल से बचाव करें', textEn: 'Watery discharge with frequent sneezing/itching — think allergic rhinitis; dust avoidance' },
    // q23 (PRE03 duration)
    { questionIndex: 23, text: 'जुकाम 10 दिन से ज्यादा रहा — साइनस/एडिनॉइड जांच कराएं', textEn: 'Cold lasting over 10 days — evaluate for sinusitis/adenoids' },
    { questionIndex: 23, text: 'बच्चों को साल में 6-8 बार जुकाम सामान्य है — घबराएं नहीं; हाथ धोना सिखाएं', textEn: '6-8 colds a year is normal in children — do not worry; teach hand washing' },
    // q24 (PRE04 feeding difficulty)
    { questionIndex: 24, text: 'नाक बंद से दूध न पी पाना — दूध से पहले सलाइन ड्रॉप्स डालें; उल्टी पकड़कर खिलाएं', textEn: 'Blocked nose hampering feeds — saline drops before feeding; feed in upright position' },
    { questionIndex: 24, text: 'नाक बंद + शिशु से सांस तेज — ब्रोंकियोलाइटिस की जांच कराएं', textEn: 'Blocked nose with fast breathing in an infant — evaluate for bronchiolitis' },
    // q25 (PRE04 discharge)
    { questionIndex: 25, text: 'हरा गाढ़ा स्राव 3-4 दिन+ या बुखार — जांच कराएं, जरूरी हो तो इलाज शुरू करें', textEn: 'Thick green discharge for 3-4+ days or fever — get examined, start treatment if needed' },
    { questionIndex: 25, text: 'एकतरफा मोटा स्राव — नाक में कुछ अटकना (फॉरेन बॉडी) निकालें — डॉक्टर से कराएं', textEn: 'One-sided thick discharge — foreign body in the nose may need removal at the clinic' },
    // q26 (PRE05 previous wheeze)
    { questionIndex: 26, text: 'बार-बार घरघराहट — दमा नियंत्रण योजना बनवाएं; इनहेलर/नेबुलाइज़र की विधि दोबारा सीखें', textEn: 'Repeated wheeze — make an asthma control plan; re-learn inhaler/nebulizer technique' },
    { questionIndex: 26, text: 'पहली बार घरघराहट — इलाज शुरू करें और 3 दिन में दोबारा मिलें; ट्रिगर नोट करें', textEn: 'First-time wheeze — start treatment and review in 3 days; note the triggers' },
    // q27 (PRE05 severity)
    { questionIndex: 27, text: 'बोलते-खेलते सांस फूलना या सीना धँसना — तुरंत इमरजेंसी; नेबुलाइज़र या इनहेलर दोहराएं', textEn: 'Breathless while talking/playing or chest indrawing — EMERGENCY now; repeat nebulizer/inhaler' },
    { questionIndex: 27, text: 'हल्की घरघराहट, खेलते समय ठीक — दवा नियमित दें, 2-3 दिन में फॉलो-अप', textEn: 'Mild wheeze, comfortable at play — continue medicines, follow up in 2-3 days' },
    // q28 (PRE28 RR count)
    { questionIndex: 28, text: 'सांस/मिनट: 2 माह तक 60+, 2-12 माह 50+, 1-5 साल 40+ — निमोनिया की शंका, उसी दिन जांच', textEn: 'Breaths/min: <2 months 60+, 2-12 months 50+, 1-5 years 40+ — suspect pneumonia, same-day review' },
    { questionIndex: 28, text: 'बच्चा शांत होकर 1 पूरा मिनट गिनें — बुखार/रोने में सांस तेज आम है, शांत अवस्था में गिनना सही है', textEn: 'Count for 1 full minute when calm — fast breathing with fever/crying is common; counting when calm is correct' },
    // q29 (PRE06 danger signs)
    { questionIndex: 29, text: 'नीले होंठ/मुंह, सीना धँसना, दूध छोड़ना — तुरंत अस्पताल (ऑक्सीजन चाहिए)', textEn: 'Blue lips/mouth, chest indrawing, refusing feeds — hospital NOW (needs oxygen)' },
    { questionIndex: 29, text: 'गर्दन झुकाने में दर्द/जकड़न — मेनिंजाइटिस की जांच तुरंत जरूरी', textEn: 'Neck stiffness or pain on bending — urgent workup for meningitis' },
    // q30 (PRE07 episodes per year)
    { questionIndex: 30, text: 'स्कूल-जाने उम्र में 6-8 सर्दियां/साल सामान्य — इम्यूनिटी बन रही है; पौष्टिक आहार + नींद दें', textEn: '6-8 colds/year at school age is normal — immunity is building; ensure nutrition + sleep' },
    { questionIndex: 30, text: 'हर महीने खांसी-जुकाम — एलर्जी/दमा/अडिनॉयड की जांच कराएं', textEn: 'Cough-cold nearly every month — evaluate for allergy/asthma/adenoids' },
    // q31 (PRE31 antibiotic need)
    { questionIndex: 31, text: 'हर बार एंटीबायोटिक — जरूरत की समीक्षा कराएं; ज्यादातर सर्दी वायरल होती है', textEn: 'Antibiotic every time — get the need reviewed; most colds are viral' },
    { questionIndex: 31, text: 'घुटनों के पीछे/आंखों में बार-बार संक्रमण — प्रतिरक्षा जांच (immunodeficiency screen) सोचें', textEn: 'Recurrent infections at multiple sites — consider immune-deficiency screening' },
    // q32 (PGA01 stool count)
    { questionIndex: 32, text: '3-5 दस्त और बच्चा नॉर्मल — हर दस्त के बाद ORS (2 साल से कम: 50-100 मिली) दें', textEn: '3-5 stools and child otherwise well — ORS after every stool (<2 years: 50-100 ml)' },
    { questionIndex: 32, text: '6+ दस्त/दिन या हर घंटे — डिहाइड्रेशन का खतरा; उसी दिन डॉक्टर को दिखाएं', textEn: '6+ stools/day or hourly — dehydration risk; see the doctor the same day' },
    // q33 (PGA01 dehydration)
    { questionIndex: 33, text: 'आंखें धँसी, जीभ सूखी, पेशाब कम — तुरंत अस्पताल; रास्ते में ORS खिलाते जाएं', textEn: 'Sunken eyes, dry tongue, less urine — hospital immediately; keep giving ORS on the way' },
    { questionIndex: 33, text: 'पेशाब व मूड नॉर्मल — घर पर ORS + जिंक देते रहें; 2 दिन में सुधार न हो तो दिखाएं', textEn: 'Urine output and mood normal — continue home ORS + zinc; review if no improvement in 2 days' },
    // q34 (PGA02 vomiting count)
    { questionIndex: 34, text: '1-2 उल्टी — 30-60 मिनट खाना बंद, फिर छोटे-छोटे घूंट (हर 10-15 मिनट) पानी/ORS', textEn: '1-2 vomits — nil by mouth 30-60 minutes, then small sips of water/ORS every 10-15 minutes' },
    { questionIndex: 34, text: 'बार-बार उल्टी, कुछ भी न रुकना — डॉक्टर दिखाएं; डिहाइड्रेशन की निगरानी रखें', textEn: 'Repeated vomiting, nothing stays down — see the doctor; monitor for dehydration' },
    // q35 (PGA02 vomit colour)
    { questionIndex: 35, text: 'हरी/पीली (बाइल) उल्टी — आंत में रुकावट की शंका — तुरंत अस्पताल', textEn: 'Green/yellow (bile-stained) vomit — possible intestinal obstruction — hospital NOW' },
    { questionIndex: 35, text: 'खून की उल्टी — इमरजेंसी; कुछ भी खिलाने से पहले डॉक्टर से बात करें', textEn: 'Blood in vomit — EMERGENCY; contact the doctor before feeding anything' },
    // q36 (PGA03 pain location)
    { questionIndex: 36, text: 'नाभि के आसपास आता-जाता दर्द — कार्यात्मक/गैस: खानपान नियमित, शौच नियमित करें', textEn: 'Peri-umbilical coming-and-going pain — functional/gas: regular meals and toilet habit' },
    { questionIndex: 36, text: 'दाईं तरफ नीचे या छूने पर बहुत दर्द — अपेंडिसाइटिस निकालें, तुरंत जांच', textEn: 'Right-lower pain or extreme tenderness — rule out appendicitis, urgent evaluation' },
    // q37 (PGA03 red flags)
    { questionIndex: 37, text: 'दर्द + उल्टी + छोड़ने पर भी दर्द — सर्जिकल कारण की जांच तुरंत कराएं', textEn: 'Pain + vomiting + persisting after passing stool — get an urgent surgical review' },
    { questionIndex: 37, text: 'दूध-हल्का खाना, गर्म सेक से राहत मिलती है — गैस/कोलिक: 2 दिन में ठीक न हो तो दिखाएं', textEn: 'Relief with milk/light food and warm fomentation — gas/colic; review if not settling in 2 days' },
    // q38 (PGA38 constipation days)
    { questionIndex: 38, text: '3-4 दिन बाद भी मल सामान्य-मुलायम — सामान्य (विशेषकर स्तनपान शिशु) — घबराएं नहीं', textEn: 'Soft normal stool every 3-4 days — normal (especially breastfed babies), do not worry' },
    { questionIndex: 38, text: 'कठोर मल, दर्द से मल रोकना — पानी, फाइबर (पपीता, नाशपाती, सब्जियां) बढ़ाएं; नहीं तो दवा लें', textEn: 'Hard stools, stool-withholding — increase water and fiber (papaya, pear, vegetables); else medicine' },
    // q39 (PGA04 fissure)
    { questionIndex: 39, text: 'मल की सतह पर ताजा खून — फिशर संभव: मल मुलायम करें, गर्म पानी सिट्ज़ बाथ दें', textEn: 'Fresh blood on stool surface — likely fissure: soften stools, give warm sitz baths' },
    { questionIndex: 39, text: 'खून मल में मिला हुआ + दर्द नहीं — जांच (stool test) कराएं, डॉक्टर से मिलें', textEn: 'Blood mixed into stool without pain — get a stool test and see the doctor' },
    // q40 (PGA05 colic timing)
    { questionIndex: 40, text: 'शाम को एक जैसे समय पर रोना — टिपिकल कोलिक; झुलाना, शश-शश आवाज, डकार से राहत मिलती है', textEn: 'Same-time evening crying — typical colic; rocking, white noise and burping help' },
    { questionIndex: 40, text: 'रोने का समय अनियमित और दिन में भी — कान दर्द/रिफ्लक्स/मूत्र संक्रमण जांचें', textEn: 'Irregular crying pattern, also during the day — check ear pain/reflux/urine infection' },
    // q41 (PGA05 age)
    { questionIndex: 41, text: '5 महीने से छोटा — कोलिक आम है और 3-4 महीने की उम्र में अपने आप ठीक हो जाती है; धैर्य रखें', textEn: 'Under 5 months — colic is common and self-resolves by 3-4 months of age; stay patient' },
    { questionIndex: 41, text: '6 महीने के बाद नया रोना — कोलिक नहीं मानें; कारण जांचें (कान, दांत, पेट)', textEn: 'New crying onset after 6 months — do NOT assume colic; look for a cause (ear, teeth, abdomen)' },
    // q42 (PGA06 blood mixed)
    { questionIndex: 42, text: 'सतह पर चिपका ताजा खून — फिशर; मल मुलायम करें, पानी-फाइबर दें', textEn: 'Fresh blood smeared on surface — fissure; soften stools with water and fiber' },
    { questionIndex: 42, text: 'खून/म्यूकस मल में मिला हुआ, बुखार के साथ — डिसेंट्री: stool test कराएं, उसी दिन जांच', textEn: 'Blood/mucus mixed in stool with fever — dysentery: stool test and same-day review' },
    // q43 (PGA06 system signs)
    { questionIndex: 43, text: 'बच्चा सुस्त, दस्त बहुत बार — तुरंत अस्पताल; रास्ते में ORS देते रहें', textEn: 'Lethargic child with very frequent stools — hospital now; keep giving ORS en route' },
    { questionIndex: 43, text: 'खून थोड़ा है और बच्चा नॉर्मल — जांच कराएं, घरेलू उपाय पर न छोड़ें', textEn: 'Small amount of blood, child otherwise well — still get tested, do not leave it to home remedies' },
    // q44 (PGA07 worms seen)
    { questionIndex: 44, text: 'मल में कीड़े दिखे — डीवर्मिंग दवा दें (2 वर्ष से ऊपर); 2 हफ्ते बाद खुराक दोहराएं', textEn: 'Worms seen in stool — give a deworming dose (above 2 years); repeat the dose after 2 weeks' },
    { questionIndex: 44, text: 'परिवार के सभी बच्चों को एक साथ डीवर्मिंग कराएं; नाखून छोटे रखें, हाथ धोना सिखाएं', textEn: 'Deworm all children in the family together; keep nails short and teach hand washing' },
    // q45 (PGA07 anal itch)
    { questionIndex: 45, text: 'रात की गुदा खुजली — पिनवॉर्म संभव; डीवर्मिंग दें, सोते समय मोजे पहनाएं', textEn: 'Night-time anal itching — pinworms likely; deworm and make the child wear socks at night' },
    { questionIndex: 45, text: 'खुजली + भूख कम + पेट दर्द बार-बार — कीड़े की जांच (stool test) कराएं', textEn: 'Itching + poor appetite + recurrent abdominal pain — test for worms (stool examination)' },
    // q46 (PGA46 ulcers duration)
    { questionIndex: 46, text: 'छाले 7-10 दिन में अपने आप भर जाते हैं — ठंडा-नरम खाना, चिपचिपा-तीखा खाना बंद', textEn: 'Aphthous ulcers heal by themselves in 7-10 days — cool soft foods; avoid sticky/spicy foods' },
    { questionIndex: 46, text: 'हर महीने नए छाले — आयरन/B12/फोलेट की कमी जांच कराएं', textEn: 'New ulcers every month — test iron/B12/folate levels' },
    // q47 (PGA08 HFMD signs)
    { questionIndex: 47, text: 'हाथ-पैर-मुंह पर छाले + बुखार — हैंड-फुट-माउथ रोग: संक्रमित नहीं करें, स्कूल बंद रखें, तरल आहार', textEn: 'Blisters on hands/feet/mouth with fever — hand-foot-mouth disease: isolate, keep off school, soft fluids' },
    { questionIndex: 47, text: 'लार टपकना + पीने से मना — डिहाइड्रेशन का खतरा; प्यास कम हो तो तुरंत दिखाएं', textEn: 'Drooling with refusal to drink — dehydration risk; show immediately if fluid intake drops' },
    // q48 (PGA09 gums)
    { questionIndex: 48, text: 'सूजे मसूड़े — ठंडी (बर्फ नहीं) चीज चबाने को दें; गर्म सेक न करें', textEn: 'Swollen gums — give cool (not icy) things to chew on; avoid hot fomentation' },
    { questionIndex: 48, text: 'बहुत दर्द/बुखार साथ — डॉक्टर दिखाएं; मसूढ़ों पर बिना सलाह दवा/जेल न लगाएं', textEn: 'Severe pain or fever alongside — see the doctor; no medicated gel on gums without advice' },
    // q49 (PGA09 teething myths)
    { questionIndex: 49, text: 'हल्का बुखार/रोना दांत निकलने में हो सकता है — 101°F से ऊपर बुखार का अलग कारण खोजें', textEn: 'Mild fever/fussiness can accompany teething — fever above 101°F needs another cause looked for' },
    { questionIndex: 49, text: 'दस्त का दांत से संबंध नहीं होता — दस्त जांचें, बच्चे को डिहाइड्रेट होने से बचाएं', textEn: 'Diarrhoea is NOT caused by teething — evaluate the diarrhoea, prevent dehydration' },
    // q50 (PSK01 rash origin/itch)
    { questionIndex: 50, text: 'चेहरे/धड़ से शुरू खुजली भरे दाने — वायरल/एलर्जी; कैलामाइन लोशन लगाएं, नाखून छोटे रखें', textEn: 'Itchy rash starting on face/trunk — viral/allergy: calamine lotion, keep nails short' },
    { questionIndex: 50, text: 'गोल-गोल किनारे वाले दाने (रिंगवर्म जैसे) — फंगल संभव: साफ-सूखा रखें, कपड़े अलग धोएं', textEn: 'Ring-shaped lesions — likely fungal: keep skin clean and dry, wash clothes separately' },
    // q51 (PSK01 triggers)
    { questionIndex: 51, text: 'बुखार के बाद निकले दाने — रोज़ा रोज़ोला जैसे वायरल रैश संभव — सामान्य, खुजली से बचाएं', textEn: 'Rash appearing after fever — roseola-like viral exanthem possible — harmless, prevent scratching' },
    { questionIndex: 51, text: 'नई दवा के बाद दाने — दवा रोककर तुरंत डॉक्टर से मिलें (ड्रग रिएक्शन)', textEn: 'Rash after a new medicine — stop the drug and see the doctor immediately (drug reaction)' },
    // q52 (PSK02 scabies pattern)
    { questionIndex: 52, text: 'रात की खुजली + परिवार में और लोग — स्कैबीज की शंका; सबका एक साथ इलाज कराएं', textEn: 'Night itching + other family members — suspect scabies; treat everyone at the same time' },
    { questionIndex: 52, text: 'सूखी त्वचा की खुजली — नहाने के तुरंत बाद मॉइस्चराइजर; गर्म पानी से नहाए नहीं', textEn: 'Dry-skin itching — moisturize right after the bath; avoid hot water baths' },
    // q53 (PSK02 scabies sites)
    { questionIndex: 53, text: 'उंगलियों के बीच/गुदा के पास खुजली — स्कैबीज के टिपिकल जगहें — परीक्षण कराएं', textEn: 'Itching between fingers/around genitals — classic scabies sites — get examined' },
    { questionIndex: 53, text: 'बच्चों की खुजली में गर्म-गर्म दवाई लोशन (जैसे गंधक) बिना सलाह न लगाएं', textEn: 'Do not apply strong medicated lotions (e.g., sulphur) on children without advice' },
    // q54 (PSK03 wheal pattern)
    { questionIndex: 54, text: 'उठते-गायब होते चकत्ते — पित्ती (यूर्टिकारिया): एंटीहिस्टामिन दवा, ट्रिगर नोट करें', textEn: 'Wheals that come and go — urticaria: antihistamine, note the trigger' },
    { questionIndex: 54, text: 'ठीक होकर वापस आती पित्ती 6 हफ्ते+ — विस्तृत जांच (एलर्जी टेस्ट) कराएं', textEn: 'Recurring hives beyond 6 weeks — detailed evaluation (allergy testing)' },
    // q55 (PSK55 anaphylaxis)
    { questionIndex: 55, text: 'होंठ/आंख/जीभ सूजन या सांस में खर्रार — एनाफिलेक्सिस: तुरंत इमरजेंसी ले जाएं', textEn: 'Lip/eye/tongue swelling or noisy breathing — ANAPHYLAXIS: emergency immediately' },
    { questionIndex: 55, text: 'सिर्फ त्वचा पर चकत्ते — एंटीहिस्टामिन दें; निगरानी रखें, बदतर हो तो तुरंत जाएं', textEn: 'Wheals on skin only — give antihistamine; observe and go immediately if worsening' },
    // q56 (PSK04 bite spread)
    { questionIndex: 56, text: 'काटने पर हल्की सूजन सामान्य — ठंडा सेक करें, खुजलाने से रोकें', textEn: 'Mild swelling after a bite is normal — cold compress, discourage scratching' },
    { questionIndex: 56, text: 'सूजन तेजी से बढ़े या सांस में दिक्कत — इमरजेंसी (एलर्जिक रिएक्शन)', textEn: 'Rapidly spreading swelling or breathing trouble — EMERGENCY (allergic reaction)' },
    // q57 (PSK57 bite infected)
    { questionIndex: 57, text: 'लालिमा बढ़ना/मवाद — संक्रमण: जांच कराएं, एंटीबायोटिक जरूरी हो सकती है', textEn: 'Spreading redness/pus — infection: get examined, antibiotics may be needed' },
    { questionIndex: 57, text: 'बुखार काटने के बाद — खून के संक्रमण की जांच तुरंत कराएं', textEn: 'Fever after a bite — urgent screening for blood-borne infection' },
    // q58 (PSK05 boils sites)
    { questionIndex: 58, text: '1-2 छोटे फोड़े — साफ रखें, दबाए नहीं; एंटीबायोटिक क्रीम लगाएं', textEn: '1-2 small boils — keep clean, do not squeeze; apply antibiotic ointment' },
    { questionIndex: 58, text: 'फोड़े बार-बार उसी जगह या बहुत दर्द — उसे खोलकर साफ करना पड़ सकता है — डॉक्टर से कराएं', textEn: 'Recurring boils at the same site or very painful — may need incision and drainage at the clinic' },
    // q59 (PSK59 multiple boils)
    { questionIndex: 59, text: 'कई फोड़े एक साथ + बुखार — खून की जांच (CBC) व इलाज जरूरी', textEn: 'Multiple boils together with fever — blood test (CBC) and treatment needed' },
    { questionIndex: 59, text: 'बार-बार फोड़े — शुगर जांच व नाक कैरेज सोचें — डॉक्टर से पूछें', textEn: 'Recurrent boils — consider sugar testing and nasal carriage — discuss with the doctor' },
    // q60 (PSK06 diaper duration)
    { questionIndex: 60, text: 'हर बदलावी पर डायपर बदलें; हल्की लाली — जिंक ऑक्साइड/बैरियर क्रीम लगाएं, हवा में सुखाएं', textEn: 'Change the diaper at every soiling; mild redness — zinc oxide barrier cream plus nappy-free time' },
    { questionIndex: 60, text: 'लाली 3 दिन में ठीक न हो — फंगल (कैंडिडा) संभव — जांच कराएं', textEn: 'Redness not settling in 3 days — possible fungal (candida) — get examined' },
    // q61 (PSK61 fungal rash)
    { questionIndex: 61, text: 'किनारों पर सफेद दाने — कैंडिडा: एंटीफंगल क्रीम लगाएं, जगह सूखी रखें', textEn: 'White satellite spots at edges — candida: antifungal cream, keep the area dry' },
    { questionIndex: 61, text: 'त्वचा छिलकर घाव/मवाद — द्वितीयक संक्रमण — उसी हफ्ते डॉक्टर को दिखाएं', textEn: 'Raw broken skin or pus — secondary infection — see the doctor this week' },
    // q62 (PEN01 ear pain duration)
    { questionIndex: 62, text: 'कान खींचना बुखार के साथ — बच्चों में कान का इन्फेक्शन आम — जांच कराएं', textEn: 'Ear pulling with fever — ear infection is common in children — get examined' },
    { questionIndex: 62, text: 'कान दर्द रात को तेज — बिछौने के नीचे तकिया थोड़ा ऊंचा रखें; दर्द की दवा दें', textEn: 'Ear pain worse at night — raise the pillow slightly; give pain relief' },
    // q63 (PEN63 red flags)
    { questionIndex: 63, text: 'कान दर्द + बुखार + सुनने में कमी — एक्यूट ओटाइटिस मीडिया — जांच व इलाज उसी दिन', textEn: 'Ear pain + fever + reduced hearing — acute otitis media — same-day examination and treatment' },
    { questionIndex: 63, text: 'कान से पानी आना शुरू — बाहरी कान साफ रखें, कुछ डालें नहीं — डॉक्टर दिखाएं', textEn: 'Ear discharge started — keep the outer ear clean, insert nothing — see the doctor' },
    // q64 (PEN02 discharge type)
    { questionIndex: 64, text: 'पानीदार स्राव सर्दी के साथ — ट्यूब से स्राव संभव; जांच कराएं, स्राव नरम कपड़े से पोंछें', textEn: 'Watery discharge with a cold — possible tube discharge; get checked, wipe with soft cloth' },
    { questionIndex: 64, text: 'मवाद/खून का स्राव — परफोरेशन संभव: तुरंत जांच; कान में पानी न जाने दें', textEn: 'Pus/blood discharge — possible perforation: urgent exam; keep water out of the ear' },
    // q65 (PEN65 mastoid danger)
    { questionIndex: 65, text: 'कान के पीछे सूजन/कान आगे झुकना — मस्टॉइडिटिस — तुरंत अस्पताल', textEn: 'Swelling behind the ear / ear pushed forward — mastoiditis — hospital immediately' },
    { questionIndex: 65, text: 'बुखार के साथ स्राव — एंटीबायोटिक पूरा कोर्स जरूरी — बीच में बंद न करें', textEn: 'Discharge with fever — full antibiotic course is essential — do not stop midway' },
    // q66 (PEN03 swallow pain)
    { questionIndex: 66, text: 'गला दर्द + खाना छोड़ना — नरम-ठंडा खाना, गर्म पानी के गरारे (बड़े बच्चे)', textEn: 'Sore throat with food refusal — soft-cool foods, warm saline gargles (older children)' },
    { questionIndex: 66, text: 'बुखार नहीं, हल्का दर्द — वायरल; 3 दिन में ठीक न हो तो दिखाएं', textEn: 'No fever, mild pain — viral; review if not settled in 3 days' },
    // q67 (PEN67 strep signs)
    { questionIndex: 67, text: 'टॉन्सिल पर सफेद दाने + बुखार — बैक्टीरियल गला: एंटीबायोटिक पूरा कोर्स दें', textEn: 'White spots on tonsils + fever — bacterial throat: give the full antibiotic course' },
    { questionIndex: 67, text: 'आवाज दबना, लार टपकना, गला में गांठ — इमरजेंसी (पेरीटॉन्सिलर फोड़ा) — तुरंत अस्पताल', textEn: 'Muffled voice, drooling, bulge in throat — EMERGENCY (peritonsillar abscess) — hospital now' },
    // q68 (PEN04 sticky eyes)
    { questionIndex: 68, text: 'सुबह चिपकी आंखें, सफेद स्राव — हल्का कंजंक्टिवाइटिस: पानी से साफ करें, तौलिया अलग रखें', textEn: 'Sticky eyes in the morning with whitish discharge — mild conjunctivitis: clean with water, separate towel' },
    { questionIndex: 68, text: 'गाढ़ा पीला-हरा स्राव दोनों आंखों से — जांच कराएं, ड्रॉप्स जरूरी होंगी', textEn: 'Thick yellow-green discharge from both eyes — get examined, drops will be needed' },
    // q69 (PEN69 red eye)
    { questionIndex: 69, text: 'आंख लाल + चुभन — वायरल/एलर्जिक; हाथ धोना, आंख न मलना सिखाएं', textEn: 'Red eye with grittiness — viral/allergic; teach hand washing and no eye rubbing' },
    { questionIndex: 69, text: 'पलक सूजन + बुखार या नवजात की आंख से स्राव — तुरंत डॉक्टर (गंभीर संक्रमण निकालें)', textEn: 'Swollen lids with fever, or discharge in a newborn\'s eye — doctor now (rule out serious infection)' },
    // q70 (PEN05 bleed count)
    { questionIndex: 70, text: '1-2 बार खून, तुरंत रुक गया — बिना घबराहट बच्चे को बैठाएं, नाक को 10 मिनट दबाएं', textEn: '1-2 bleeds stopping quickly — sit the child upright calmly, pinch the nose for 10 minutes' },
    { questionIndex: 70, text: '20 मिनट से ज्यादा बहता खून या बार-बार — जांच (platelets/clotting) कराएं', textEn: 'Bleeding beyond 20 minutes or recurrent — get platelets/clotting checked' },
    // q71 (PEN71 nose picking)
    { questionIndex: 71, text: 'नाक खोदने की आदत — नाखून छोटे, नाक में सलाइन/पेट्रोलियम जेली जैसी नमी दें', textEn: 'Nose-picking habit — keep nails short, keep the nose moist with saline/petroleum jelly' },
    { questionIndex: 71, text: 'बार-बार खून + चकत्ते/मसूढ़ों से खून — खून की बीमारी जांच तुरंत कराएं', textEn: 'Recurrent nosebleeds with bruising/bleeding gums — urgent blood disorder workup' },
    // q72 (PEN72 snoring daily)
    { questionIndex: 72, text: 'रोज खर्राटे + मुंह खोलकर सोना — बढ़े एडिनॉइड/टॉन्सिल की जांच कराएं', textEn: 'Daily snoring with mouth-breathing sleep — evaluate for enlarged adenoids/tonsils' },
    { questionIndex: 72, text: 'बीमारी के दौरान ही खर्राटे — सामान्य; नाक साफ रखें, सिर थोड़ा ऊंचा रखकर सुलाएं', textEn: 'Snoring only during illness — normal; keep the nose clear, sleep with head slightly raised' },
    // q73 (PEN73 apnea signs)
    { questionIndex: 73, text: 'नींद में सांस रुकने के झटके — स्लीप एप्निया: ENT जांच जरूरी — देर न करें', textEn: 'Pauses in breathing during sleep — sleep apnoea: ENT evaluation essential, do not delay' },
    { questionIndex: 73, text: 'दिन में नींद/चिड़चिड़ापन बना रहे — नींद की गुणवत्ता खराब — जांच कराएं', textEn: 'Daytime sleepiness/irritability persisting — poor sleep quality — get evaluated' },
    // q74 (PEN74 infection count)
    { questionIndex: 74, text: 'साल में 5-6 बार कान-गला इन्फेक्शन स्कूल-उम्र में सामान्य — घबराएं नहीं', textEn: '5-6 ear/throat infections a year at school age is normal — do not worry' },
    { questionIndex: 74, text: '7+ एपिसोड/साल — टॉन्सिल/एडिनॉइड सर्जरी की राय लें; स्क्रीनिंग (हियरिंग) कराएं', textEn: '7+ episodes/year — take an ENT surgical opinion; get hearing screened' },
    // q75 (PEN75 antibiotic count)
    { questionIndex: 75, text: 'बार-बार एंटीबायोटिक — वायरल बनाम बैक्टीरियल की परख हर बार कराएं; ऑटो-मेडिकेट बंद', textEn: 'Repeated antibiotics — ask for viral vs bacterial assessment each time; stop self-medication' },
    { questionIndex: 75, text: 'हर सर्दी में गला-कान — प्रतिरक्षा व स्क्रीनिंग जांच (CBC, इम्युनिटी) सोचें', textEn: 'ENT infection with every cold — consider CBC and immune screening' },
    // q76 (PNE76 jaundice onset)
    { questionIndex: 76, text: 'दूध दिन-दिन बढ़ता पीलापन और जन्म 24 घंटे से पहले शुरू — तुरंत बिलीरुबिन जांच (खून की रोग शंका)', textEn: 'Deepening jaundice with onset before 24 hours of life — urgent bilirubin test (haemolysis suspected)' },
    { questionIndex: 76, text: '2-3 दिन पर शुरू हुआ हल्का पीलापन — शारीरिक पीलिया संभव; जांच कराकर निगरानी करें', textEn: 'Mild jaundice starting on day 2-3 — likely physiological; confirm with a test and monitor' },
    // q77 (PNE77 feeding)
    { questionIndex: 77, text: '8-12 बार दूध पिलाएं — दिन-रात; दूध ज्यादा पिलाने से पीलिया जल्दी उतरता है', textEn: 'Feed 8-12 times a day, day and night; frequent feeding clears jaundice faster' },
    { questionIndex: 77, text: 'बच्चा दूध नहीं पीता/जगाने पर नहीं जागता — तुरंत अस्पताल; पीलापन हथेली-तलवों तक बढ़ गया तो भी तुरंत', textEn: 'Poor feeding/unrousable baby — hospital now; also urgent if yellowing has reached palms and soles' },
    // q78 (PNE78 cord discharge)
    { questionIndex: 78, text: 'हल्का सूखा स्राव गिरते नाभि का सामान्य हिस्सा है — साफ-सूखा रखें, कुछ न लगाएं', textEn: 'Slight dry discharge from a separating cord is normal — keep it clean and dry, apply nothing' },
    { questionIndex: 78, text: 'मवाद/खून का स्राव — ओम्फलाइटिस की जांच उसी दिन जरूरी (नवजात में खतरनाक)', textEn: 'Pus/blood from the cord — same-day evaluation for omphalitis (dangerous in newborns)' },
    // q79 (PNE79 redness)
    { questionIndex: 79, text: 'नाभि के चारों ओर लालिमा फैल रही है — तुरंत अस्पताल — नवजात में इन्फेक्शन तेजी से बढ़ता है', textEn: 'Redness spreading around the cord — hospital NOW — newborn infections progress rapidly' },
    { questionIndex: 79, text: 'बदबूदार स्राव — संक्रमण की जांच कराएं; डायपर नाभि से नीचे बांधें ताकि वह हवा में रहे', textEn: 'Foul-smelling discharge — get infection checked; fasten the diaper below the cord to keep it dry' },
    // q80 (PNE80 spit-up)
    { questionIndex: 80, text: 'थोड़ा उगलना, बच्चा खुश और वजन बढ़ रहा — सामान्य रिफ्लक्स: डकार, उल्टी पकड़कर रखना, खिलाकर 20-30 मिनट सीधा रखें', textEn: 'Small spit-ups with a content, gaining baby — normal reflux: burp well, keep upright 20-30 min after feeds' },
    { questionIndex: 80, text: 'हर बार पूरा दूध उगलता है — जांच कराएं; खिलाने की विधि व तकनीक देखें', textEn: 'Bringing up the whole feed every time — get examined; check feeding technique' },
    // q81 (PNE81 projectile)
    { questionIndex: 81, text: 'फेंककर (प्रोजेक्टाइल) उल्टी — पायलोरिक स्टेनोसिस निकालें — तुरंत अस्पताल', textEn: 'Projectile vomiting — rule out pyloric stenosis — hospital immediately' },
    { questionIndex: 81, text: 'उगलने के साथ वजन न बढ़ना/हरा रंग — तुरंत जांच; छोटी-छोटी बार-बार खिलाएं', textEn: 'Spit-ups with poor weight gain/green colour — urgent review; give small frequent feeds' },
    // q82 (PIM82 vaccine status)
    { questionIndex: 82, text: 'टीका कार्ड लाकर दिखाएं — बाकी टीके IAP तालिका के अनुसार आज ही लगवाए जा सकते हैं', textEn: 'Bring the immunization card — due vaccines can be given today as per the IAP schedule' },
    { questionIndex: 82, text: 'टीकाकरण कभी नहीं शुरू किया — उम्र के हिसाब से कैच-अप शेड्यूल बनेगा — डॉक्टर से बनवाएं', textEn: 'Vaccination never started — a catch-up schedule will be made for the age — ask the doctor' },
    // q83 (PIM83 missed doses)
    { questionIndex: 83, text: 'छूटा हुआ टीका पहले लगवाएं फिर अगला — शेड्यूल खराब नहीं होता, देर से दोबारा शुरू करने की नहीं, पकड़ने की जरूरत है', textEn: 'Give the missed vaccine first, then the next — the schedule is not spoiled, it just needs catching up' },
    { questionIndex: 83, text: 'बीमारी के दौरान हल्का जुकाम होने पर भी टीका लग सकता है — डॉक्टर से पूछें, टालें नहीं', textEn: 'Vaccines can be given even with a mild cold — ask the doctor, do not postpone' },
    // q84 (PIM84 fever timing)
    { questionIndex: 84, text: 'टीके के 24-48 घंटे में हल्का बुखार/सूजन सामान्य — पैरासिटामोल, ठंडा सेक; 48 घंटे बाद का बुखार जांच कराएं', textEn: 'Mild fever/swelling within 24-48 hours of vaccination is normal — paracetamol, cold compress; fever after 48 hrs needs review' },
    { questionIndex: 84, text: 'तेज बुखार (103°F+) या लगातार 3 दिन — डॉक्टर को दिखाएं — बीमारी अलग से निकालें', textEn: 'High fever (103°F+) or lasting 3 days — see the doctor to rule out a separate illness' },
    // q85 (PIM85 site reaction)
    { questionIndex: 85, text: 'सुई वाली जगह लाल-सख्त — ठंडा सेक करें, दबाए नहीं; हाथ धीरे-धीरे चलाएं', textEn: 'Red-hard injection site — cold compress, no rubbing; move the limb gently' },
    { questionIndex: 85, text: 'सूजन बढ़ती हुई, बहुत दर्द या बच्चा सुस्त — तुरंत दिखाएं', textEn: 'Growing swelling, severe pain or a dull child — show immediately' },
    // q86 (PIM86 weight gain)
    { questionIndex: 86, text: 'पहले साल में ~200 ग्राम/हफ्ता वजन बढ़ना चाहिए — ग्रोथ चार्ट पर लगातार एक जैसी लाइन अच्छा संकेत है', textEn: 'In the first year expect ~200 g/week weight gain — a steady line on the growth chart is a good sign' },
    { questionIndex: 86, text: 'वजन स्थिर/गिर रहा है — कुपोषण/बीमारी की जांच जरूरी; जल्दी करें', textEn: 'Weight static or falling — workup for malnutrition/illness needed; act early' },
    // q87 (PIM87 feeding detail)
    { questionIndex: 87, text: 'कैलोरी-घना आहार दें — घी/मक्खन, केला, अंडा, दाल, पनीर, ड्राई फ्रूट पाउडर; 2-3 बार स्नैक भी', textEn: 'Give calorie-dense food — ghee/butter, banana, egg, dal, paneer, dry-fruit powder; plus 2-3 snacks' },
    { questionIndex: 87, text: '6 महीने बाद सिर्फ दूध पर्याप्त नहीं — ठोस आहार दिन में 3 बार जरूरी; खिलाते समय स्क्रीन बंद', textEn: 'Milk alone is not enough after 6 months — solids 3 times a day; no screens during meals' },
    // q88 (PIM88 picky duration)
    { questionIndex: 88, text: 'भूख बीमारी के बाद 1-2 हफ्ते कम रहती है — सामान्य; जबरदस्ती न खिलाएं', textEn: 'Appetite dips for 1-2 weeks after illness — normal; never force feed' },
    { questionIndex: 88, text: 'महीनों से खाना छोड़ना + वजन प्रभावित — जांच (CBC, जिंक, आयरन) कराएं', textEn: 'Months of food refusal affecting weight — get CBC, zinc and iron checked' },
    // q89 (PIM89 milk/juice filling)
    { questionIndex: 89, text: 'दूध 500-600 मिली/दिन से ज्यादा न दें — भरा पेट खाना छोड़ता है; जूस/बिस्कुट घटाएं', textEn: 'Do not exceed 500-600 ml milk/day — a full tummy refuses food; cut juices and biscuits' },
    { questionIndex: 89, text: 'भोजन का समय तय करें — 30 मिनट की सीमा; बीच में कुछ नहीं; बच्चा खुद खाए', textEn: 'Fixed meal times — 30-minute limit; nothing in between; let the child self-feed' },
    // q90 (PIM90 rickets signs)
    { questionIndex: 90, text: 'झुकी टांगें/कलाइयां मोटी — रिकेट्स की जांच (विटामिन D, X-ray) कराएं', textEn: 'Bowed legs/thick wrists — get rickets workup (vitamin D, X-ray)' },
    { questionIndex: 90, text: 'रात की टांग दर्द व बढ़ते बच्चों में — अक्सर वृद्धि दर्द सामान्य; दर्द एकतरफा/सुस्ती के साथ हो तो जांचें', textEn: 'Night leg pains in growing children are usually benign growing pains; investigate if one-sided or with lethargy' },
    // q91 (PIM91 sun exposure)
    { questionIndex: 91, text: 'हफ्ते में 3-4 दिन, 15-20 मिनट धूप (सुबह की) — विटामिन D का सस्ता इलाज; स्क्रीन कम करें', textEn: 'Sunlight 15-20 minutes, 3-4 days a week (morning) — the cheapest vitamin D fix; reduce screen time' },
    { questionIndex: 91, text: 'धूप नहीं मिलती — विटामिन D ड्रॉप्स/खुराक की सलाह लें; खुद बढ़ाकर न दें', textEn: 'No sun exposure — ask about vitamin D drops/dosing; never increase the dose yourself' },
    // q92 (PDE92 words/understanding)
    { questionIndex: 92, text: '18 महीने तक 10 शब्द नहीं या 2 साल पर 2-शब्द वाक्य नहीं — विकास जांच (CDC/IAP चार्ट) कराएं', textEn: 'Fewer than 10 words by 18 months or no 2-word phrases by 2 years — developmental screening needed' },
    { questionIndex: 92, text: 'बच्चा समझता है पर बोलता कम — उत्साहवर्धक; रोज बोलकर पढ़ाई करें, स्क्रीन बंद, स्पीच थेरेपी की जांच कराएं', textEn: 'Understands but speaks little — encouraging; read aloud daily, no screens, get speech-therapy assessment' },
    // q93 (PDE93 hearing)
    { questionIndex: 93, text: 'नाम पुकारने पर नहीं देखता/TV तेज करता है — पहले सुनने की जांच (audiometry) कराएं', textEn: 'Does not respond to name/turns TV loud — get hearing tested (audiometry) FIRST' },
    { questionIndex: 93, text: 'सुनने में ठीक — भाषा उत्तेजना: एक शब्द धीरे-धीरे, आंख में आंख डालकर बात करें', textEn: 'Hearing fine — language stimulation: single words slowly, face-to-face talking' },
    // q94 (PDE94 milestones)
    { questionIndex: 94, text: 'एक से ज्यादा क्षेत्र में देरी (गर्दन/बैठना/चलना/बोलना) — जल्द विकास जांच + थेरेपी शुरू करें — जल्दी मदद सबसे अच्छी मदद है', textEn: 'Delay in more than one domain (neck/sitting/walking/speech) — early developmental assessment + therapy; early help works best' },
    { questionIndex: 94, text: 'सिर्फ एक क्षेत्र में हल्की देरी — 3 महीने में दोबारा आकलन; घर पर खेल-आधारित उत्तेजना दें', textEn: 'Mild delay in one domain only — reassess in 3 months; play-based stimulation at home' },
    // q95 (PDE95 birth history)
    { questionIndex: 95, text: 'प्रीटर्म/NICU इतिहास — विकास निगरानी उम्र के नहीं, ठीक हुई (corrected) उम्र के हिसाब से होगी — डॉक्टर से जानें', textEn: 'Preterm/NICU history — development is tracked by corrected age, not birth age — ask the doctor' },
    { questionIndex: 95, text: 'जन्म के समय पीलिया/दौरे थे — अभी की देरी की जांच में यह जानकारी जरूर दें', textEn: 'Neonatal jaundice/seizures at birth — share this history in today\'s evaluation' },
    // q96 (PDE96 wet nights)
    { questionIndex: 96, text: '5 साल तक रात का गीलापन सामान्य — डांटें नहीं; सोने से पहले शौच + 1-2 घंटे पहले तरल बंद', textEn: 'Night wetting up to 5 years is normal — never scold; toilet before bed + no fluids 1-2 hours prior' },
    { questionIndex: 96, text: '7 वर्ष के बाद भी रोज गीला — बेडवेटिंग अलार्म/दवा की सलाह लें; सकारात्मक हौसला बढ़ाएं', textEn: 'Still wet nightly after 7 years — ask about bedwetting alarms/medicine; use positive reinforcement' },
    // q97 (PDE97 urinary signs)
    { questionIndex: 97, text: 'दिन का बार-बार पेशाब + प्यास + वजन घटना — शुगर (DM) जांच तुरंत कराएं', textEn: 'Daytime frequency + thirst + weight loss — test for diabetes urgently' },
    { questionIndex: 97, text: 'पेशाब में जलन/बदबू — मूत्र संक्रमण की जांच कराएं; पानी खूब पिलाएं', textEn: 'Burning/smelly urine — test for urine infection; give plenty of water' },
    // q98 (PDE98 school issue type)
    { questionIndex: 98, text: 'पढ़ाई में पीछे — दृष्टि व सुनने की जांच पहले कराएं; फिर सीखने की कठिनाई की राय लें', textEn: 'Lagging in studies — screen eyes and hearing first; then take advice on learning difficulty' },
    { questionIndex: 98, text: 'दोस्तों से झगड़ा/अकेलापन — स्कूल काउंसलर से बात कराएं; घर में धैर्य से बात करें', textEn: 'Fights/isolation — involve the school counsellor; talk patiently at home' },
    // q99 (PDE99 teacher report)
    { questionIndex: 99, text: 'टीचर की रिपोर्ट व घर का व्यवहार दोनों नोट करके लाएं — स्क्रीन टाइम कम करें, नींद पूरी कराएं', textEn: 'Bring both the teacher\'s report and home behaviour notes — cut screen time, ensure full sleep' },
    { questionIndex: 99, text: 'अचानक व्यवहार बदला (चुप/आक्रामक) — छिपे तनाव/बदले हुए हालात पर ध्यान दें — काउंसलिंग कराएं', textEn: 'Sudden behaviour change (withdrawn/aggressive) — watch for hidden stress or changed circumstances; counselling' },
    // q100 (PDE100 attention span)
    { questionIndex: 100, text: 'उम्र के हिसाब से ध्यान: 4 साल ~10 मिनट, 6 साल ~15-20 मिनट — इससे कम रहे तो विस्तृत आकलन कराएं', textEn: 'Expected attention span: 4y ~10 min, 6y ~15-20 min — if much less, get a formal assessment' },
    { questionIndex: 100, text: 'ध्यान की समस्या घर+स्कूल दोनों जगह हो तो ही ADHD जांच सोचें — डॉक्टर से बात करें', textEn: 'Consider ADHD evaluation only if present at BOTH home and school — discuss with the doctor' },
    // q101 (PDE101 screen time)
    { questionIndex: 101, text: '2 साल से कम उम्र में स्क्रीन बिल्कुल नहीं; 2-5 साल में 1 घंटे से कम — भाषा व ध्यान के विकास के लिए जरूरी', textEn: 'No screens below 2 years; under 1 hour for 2-5 years — essential for language and attention development' },
    { questionIndex: 101, text: 'खेल, बाहर की गतिविधि व नींद बढ़ाएं — इनसे ध्यान और व्यवहार में सुधार आता है', textEn: 'Increase play, outdoor activity and sleep — these improve attention and behaviour' },
    // q102 (PDE102 breath-holding)
    { questionIndex: 102, text: 'गुस्से के रोने के बाद नीलेपन वाला सांस रोकना — ब्रेथ-होल्डिंग स्पेल: शांत रहें, बच्चे को साइड पर लिटाएं', textEn: 'Breath-holding with blueness after a crying tantrum — stay calm, lay the child on the side' },
    { questionIndex: 102, text: 'हर झटके में गिरना/चोट लगना — वीडियो बनाकर डॉक्टर को दिखाएं; लौहित तत्व (आयरन) की जांच कराएं', textEn: 'Falls/injury with every spell — record a video for the doctor; test iron levels (associated with anemia)' },
    // q103 (PDE103 syncope vs seizure)
    { questionIndex: 103, text: 'बेहोशी या झटकों के साथ ऐपिसोड — EEG/न्यूरो जांच जरूरी — देर न करें', textEn: 'Episodes with fainting or convulsions — EEG/neuro workup needed — do not delay' },
    { questionIndex: 103, text: 'सांस रोकना कुछ सेकंड का और बाद में नॉर्मल — सामान्य ब्रेथ-होल्डिंग; 6 महीने-5 साल में आम, खतरनाक नहीं', textEn: 'Few-second breath-hold with full recovery afterwards — benign breath-holding spell; common 6 months-5 years, not dangerous' },
    // q104 (PDE104 bite details)
    { questionIndex: 104, text: 'कुत्ते के काटने पर: साबुन-पानी से 15 मिनट धोएं, ARV (एंटी-रेबीज़) शुरू कराएं — छोटा भी निवाला खतरनाक है', textEn: 'Dog bite: wash with soap and water for 15 minutes, start anti-rabies vaccine (ARV) — even a small nip is risky' },
    { questionIndex: 104, text: 'आवारा/अज्ञात जानवर — डॉक्टर से तुरंत मिलें; जानवर 10 दिन निगरानी में रहे तो भी टीका पूरा करें', textEn: 'Stray/unknown animal — see the doctor immediately; complete the vaccine even if the animal is observed for 10 days' },
    // q105 (PDE105 wound depth)
    { questionIndex: 105, text: 'गहरा/खून बहता घाव — दबाव देकर रोकें, TT (टेटनस) की जरूरत डॉक्टर से पूछें, सिलाई चाहिए हो तो जल्दी करें', textEn: 'Deep/bleeding wound — stop bleeding with pressure, ask the doctor about TT (tetanus), stitch promptly if needed' },
    { questionIndex: 105, text: 'उपरी खरोंच — साफ पानी से धोएं, एंटीसेप्टिक लगाएं; लालिमा/मवाद आए तो दिखाएं', textEn: 'Superficial scrape — wash with clean water, apply antiseptic; show if redness/pus appears' },
  ],

  // ══ Labels (10) — standard vitals + pediatric-unique ════════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'श्वसन दर', labelEn: 'Respiratory Rate', unit: '/min' },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'लंबाई / ऊंचाई', labelEn: 'Height / Length', unit: 'cm' },
    { label: 'सिर की परिधि', labelEn: 'Head Circumference', unit: 'cm' },
    { label: 'माइलस्टोन परख', labelEn: 'Milestone Check', unit: '', showUnit: false },
    { label: 'उम्र के अनुसार वजन', labelEn: 'Weight-for-age', unit: '', showUnit: false },
  ],

  // ══ Findings (30) — ICD-10 where known ═════════════════════════════════
  findings: [
    { key: 'VIRAL-FEVER', name: 'तीव्र वायरल बुखार', nameEn: 'Acute Viral Fever', icd10: 'B34.9' },
    { key: 'URTI', name: 'सर्दी-जुकाम (ऊपरी श्वसन संक्रमण)', nameEn: 'Upper Respiratory Tract Infection (URTI)', icd10: 'J06.9' },
    { key: 'TONSILLOPHARYNGITIS', name: 'तीव्र टॉन्सिलोफैरिनजाइटिस', nameEn: 'Acute Tonsillopharyngitis', icd10: 'J03.9' },
    { key: 'OTITIS-MEDIA', name: 'तीव्र कान का मध्य संक्रमण', nameEn: 'Acute Otitis Media', icd10: 'H66.0' },
    { key: 'BRONCHIOLITIS', name: 'तीव्र ब्रोंकियोलाइटिस', nameEn: 'Acute Bronchiolitis', icd10: 'J21.9' },
    { key: 'VIRAL-WHEEZE', name: 'वायरल प्रेरित घरघराहट (रिएक्टिव एयरवे)', nameEn: 'Viral-Induced Wheeze (Reactive Airway Disease)', icd10: 'J45.9' },
    { key: 'GE-NO-DEHYDRATION', name: 'तीव्र अपच — नहीं / हल्का डिहाइड्रेशन', nameEn: 'Acute Gastroenteritis — No/Mild Dehydration', icd10: 'A09' },
    { key: 'GE-SOME-DEHYDRATION', name: 'तीव्र अपच — कुछ डिहाइड्रेशन', nameEn: 'Acute Gastroenteritis — Some Dehydration', icd10: 'A09' },
    { key: 'ENTERIC-FEVER', name: 'एंट्रिक ज्वर (टाइफाइड)', nameEn: 'Enteric Fever (Typhoid)', icd10: 'A01.0' },
    { key: 'DENGUE-FEVER', name: 'डेंगू बुखार', nameEn: 'Dengue Fever', icd10: 'A90' },
    { key: 'VIRAL-EXANTHEM', name: 'वायरल रैश (दाने)', nameEn: 'Viral Exanthem (Viral Rash)', icd10: 'B09' },
    { key: 'NEONATAL-JAUNDICE', name: 'नवजात पीलिया (शारीरिक)', nameEn: 'Neonatal Hyperbilirubinemia (Physiological)', icd10: 'P59.9' },
    { key: 'IRON-DEF-ANEMIA', name: 'आयरन की कमी वाली एनीमिया', nameEn: 'Iron Deficiency Anemia', icd10: 'D50.9' },
    { key: 'THALASSEMIA-TRAIT', name: 'थैलेसीमिया ट्रेट (स्क्रीन + रेफर)', nameEn: 'Thalassemia Trait (Screen & Refer)', icd10: 'D56.3' },
    { key: 'WORM-INFESTATION', name: 'आंत्र कृमि संक्रमण', nameEn: 'Intestinal Worm Infestation', icd10: 'B82.9' },
    { key: 'INFANTILE-COLIC', name: 'शिशु कोलिक', nameEn: 'Infantile Colic', icd10: 'R10.83' },
    { key: 'ATOPIC-DERMATITIS', name: 'एटोपिक डर्मेटाइटिस (एक्जिमा)', nameEn: 'Atopic Dermatitis (Eczema)', icd10: 'L20.9' },
    { key: 'SCABIES', name: 'खुजली (स्कैबीज)', nameEn: 'Scabies', icd10: 'B86' },
    { key: 'IMPETIGO', name: 'इम्पेटिगो (फोड़ा-फुंसी संक्रमण)', nameEn: 'Impetigo', icd10: 'L01.0' },
    { key: 'URTICARIA', name: 'पित्ती (यूर्टिकारिया)', nameEn: 'Urticaria (Hives)', icd10: 'L50.9' },
    { key: 'ALLERGIC-RHINITIS', name: 'एलर्जिक राइनाइटिस', nameEn: 'Allergic Rhinitis', icd10: 'J30.4' },
    { key: 'FEBRILE-SEIZURE', name: 'बुखारी दौरे (फेब्राइल सीज़र)', nameEn: 'Febrile Seizure', icd10: 'R56.0' },
    { key: 'FAILURE-TO-THRIVE', name: 'वृद्धि में कमी (FTT)', nameEn: 'Failure to Thrive (Underweight)', icd10: 'R62.9' },
    { key: 'DEVELOPMENTAL-DELAY', name: 'विकासात्मक देरी', nameEn: 'Developmental Delay', icd10: 'R62.0' },
    { key: 'VITAMIN-D-DEF', name: 'विटामिन D की कमी (रिकेट्स जोखिम)', nameEn: 'Vitamin D Deficiency (Rickets Risk)', icd10: 'E55.9' },
    { key: 'TEETHING-TROUBLE', name: 'दांत निकलने की परेशानी', nameEn: 'Teething Trouble', icd10: 'K00.7' },
    { key: 'FUNCTIONAL-CONSTIPATION', name: 'कार्यात्मक कब्ज', nameEn: 'Functional Constipation', icd10: 'K59.0' },
    { key: 'NEONATAL-CONJUNCTIVITIS', name: 'नवजात नेत्र शोथ (आंख स्राव)', nameEn: 'Neonatal Conjunctivitis (Eye Discharge)', icd10: 'H10.9' },
    { key: 'APHTHOUS-STOMATITIS', name: 'मुंह के छाले (एफ्थस स्टोमेटाइटिस)', nameEn: 'Aphthous Stomatitis (Mouth Ulcers)', icd10: 'K12.0' },
    { key: 'OMPHALITIS', name: 'नाभि संक्रमण (ओम्फलाइटिस)', nameEn: 'Omphalitis (Umbilical Infection)', icd10: 'P38.9' },
  ],

  // ══ Medicines (81) — India pediatric core ══════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense qty
  // multiplier (1 = one bottle/tube; tablets = ~course count).
  // SAFETY: no nimesulide, no aspirin/salicylates, no codeine syrups.
  // Syrups/drops carry WEIGHT-BAND dose options (2.5/5/7.5/10 ml pattern);
  // per-kg rules in salt/description — doctor confirms ml-for-weight.
  // flags.verified = false until per-item MBBS review sign-off.
  medicines: [
    // ── Antipyretics / analgesics ──
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml', doseOptions: ['2.5 ml (125 mg)', '5 ml (250 mg)', '7.5 ml (375 mg)', '10 ml (500 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Calpol DS Suspension', salt: 'Paracetamol 500 mg/5 ml', doseOptions: ['5 ml (500 mg)', '7.5 ml (750 mg)', '10 ml (1 g)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Crocin Drops', salt: 'Paracetamol 100 mg/ml infant drops', doseOptions: ['0.3 ml (30 mg)', '0.6 ml (60 mg)', '0.9 ml (90 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Calpol 500 Tablet', salt: 'Paracetamol 500 mg', doseOptions: ['1/2 tab (250 mg)', '1 tab (500 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Paracetamol 125 mg Suppository', salt: 'Paracetamol 125 mg pediatric suppository', doseOptions: ['1 suppository (125 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 5, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Ibugesic Kid Suspension', salt: 'Ibuprofen 100 mg/5 ml', doseOptions: ['2.5 ml (50 mg)', '5 ml (100 mg)', '10 ml (200 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Ibugesic Plus Suspension', salt: 'Ibuprofen 100 mg + Paracetamol 325 mg per 5 ml', doseOptions: ['5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Meftal-P Suspension', salt: 'Mefenamic Acid 50 mg/5 ml', doseOptions: ['2.5 ml (25 mg)', '5 ml (50 mg)', '10 ml (100 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Meftal-P Tablet', salt: 'Mefenamic Acid 250 mg + Paracetamol 325 mg', doseOptions: ['1 tab'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Antibiotics (standard pediatric courses, 3-10 days via tab) ──
    { name: 'Clavam 228.5 Dry Syrup', salt: 'Amoxicillin 200 mg + Clavulanic Acid 28.5 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Clavam 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 14, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mox 125 Syrup', salt: 'Amoxicillin 125 mg/5 ml', doseOptions: ['2.5 ml', '5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Azithral 200 Suspension', salt: 'Azithromycin 200 mg/5 ml', doseOptions: ['2.5 ml (100 mg)', '5 ml (200 mg)', '7.5 ml (300 mg)', '10 ml (400 mg)'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Zifi 50 Dry Syrup', salt: 'Cefixime 50 mg/5 ml', doseOptions: ['2.5 ml (25 mg)', '5 ml (50 mg)', '7.5 ml', '10 ml (100 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Zifi 200 Tablet', salt: 'Cefixime 200 mg', doseOptions: ['1 tab twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Sporidex 125 Syrup', salt: 'Cephalexin 125 mg/5 ml', doseOptions: ['2.5 ml', '5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Metrogyl Syrup', salt: 'Metronidazole 200 mg/5 ml', doseOptions: ['2.5 ml (100 mg)', '5 ml (200 mg)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Septran Suspension', salt: 'Trimethoprim 40 mg + Sulphamethoxazole 200 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // ── GI / dehydration ──
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose', doseOptions: ['1 sachet in 200 ml water', 'Half sachet in 100 ml water'], morning: 1, afternoon: 1, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'ORSL Liquid Apple 200ml', salt: 'Ready-to-drink WHO-based electrolyte solution', doseOptions: ['Sip 50-100 ml at a time'], morning: 1, afternoon: 1, evening: 1, tab: 3, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Zinconia Syrup', salt: 'Elemental Zinc 20 mg/5 ml', doseOptions: ['2.5 ml (10 mg)', '5 ml (20 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Ondem Syrup', salt: 'Ondansetron 4 mg/5 ml', doseOptions: ['2.5 ml (2 mg)', '5 ml (4 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Domstal Suspension', salt: 'Domperidone 5 mg/5 ml', doseOptions: ['2.5 ml (2.5 mg)', '5 ml (5 mg)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Enterogermina Oral Suspension', salt: 'Bacillus clausii spores 2 billion/5 ml', doseOptions: ['1 vial (5 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Econorm Sachet', salt: 'Saccharomyces boulardii 250 mg', doseOptions: ['1 sachet twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 6, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Colimex Drops', salt: 'Dicyclomine 10 mg + Simethicone 40 mg infant colic drops', doseOptions: ['0.25 ml', '0.3 ml', '0.5 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml', doseOptions: ['5 ml', '10 ml', '15 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Cyclopam Suspension', salt: 'Dicyclomine 10 mg + Paracetamol 325 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Mucaine Suspension', salt: 'Oxethazaine + Aluminium Hydroxide + Magnesium Hydroxide gel', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 170ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone)', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Aristozyme Syrup', salt: 'Fungal Diastase + Pepsin', doseOptions: ['2.5 ml', '5 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Respiratory (nebules / inhalers / allergy) ──
    { name: 'Levolin Respules', salt: 'Levosalbutamol 1.25 mg/2 ml nebule', doseOptions: ['1 respule (2 ml)', '2 respules (4 ml)'], morning: 1, afternoon: 1, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Duolin Respules', salt: 'Ipratropium 500 mcg + Levosalbutamol 1.25 mg per 2.5 ml nebule', doseOptions: ['1 respule (2.5 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Budecort 0.5 Respules', salt: 'Budesonide 0.5 mg/2 ml nebule', doseOptions: ['1 respule (2 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Budecort 1 Respules', salt: 'Budesonide 1 mg/2 ml nebule', doseOptions: ['1 respule (2 ml)'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Asthalin Syrup', salt: 'Salbutamol 2 mg/5 ml', doseOptions: ['2.5 ml (1 mg)', '5 ml (2 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Asthalin HFA Inhaler 200 MD', salt: 'Salbutamol 100 mcg per puff (with spacer for children)', doseOptions: ['2 puffs SOS', '2 puffs thrice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Budecort 100 HFA Inhaler', salt: 'Budesonide 100 mcg per puff (controller)', doseOptions: ['2 puffs twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Montair LC Kid Syrup', salt: 'Montelukast 4 mg + Levocetirizine 2.5 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml', '10 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Montair LC Kid Tablet', salt: 'Montelukast 5 mg + Levocetirizine 2.5 mg', doseOptions: ['1 tab at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Montair 4 Granules', salt: 'Montelukast 4 mg granules sachet', doseOptions: ['1 sachet (4 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'na', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Cetzine Syrup', salt: 'Cetirizine 2.5 mg/5 ml', doseOptions: ['2.5 ml (1.25 mg)', '5 ml (2.5 mg)', '10 ml (5 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Xyzal Syrup', salt: 'Levocetirizine 2.5 mg/5 ml', doseOptions: ['2.5 ml', '5 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Allegra Suspension', salt: 'Fexofenadine 30 mg/5 ml', doseOptions: ['5 ml (30 mg)', '10 ml (60 mg)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Nasoclear Saline Nasal Drops', salt: 'Isotonic saline nasal drops', doseOptions: ['1-2 drops each nostril'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Nasivion Mini 0.01% Nasal Drops', salt: 'Oxymetazoline 0.01% (infants)', doseOptions: ['1 drop each nostril'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Nasivion Paediatric 0.025% Nasal Drops', salt: 'Oxymetazoline 0.025% (2-6 years)', doseOptions: ['1-2 drops each nostril'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Mucolite Syrup', salt: 'Ambroxol 15 mg/5 ml', doseOptions: ['2.5 ml', '5 ml', '7.5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Ascoril LS Syrup 100ml', salt: 'Levosalbutamol 1 mg + Ambroxol 30 mg + Guaifenesin 100 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // ── Skin (topicals) ──
    { name: 'Candid Cream 20g', salt: 'Clotrimazole 1% w/w', doseOptions: ['Apply thin layer 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Candid Dusting Powder 100g', salt: 'Clotrimazole 1% dusting powder', doseOptions: ['Dust thin layer 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Candid Mouth Paint 10ml', salt: 'Clotrimazole 1% mouth paint (oral thrush)', doseOptions: ['Apply 3-4 drops on affected area 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'T-Bact 2% Ointment 5g', salt: 'Mupirocin 2% w/w', doseOptions: ['Apply thin layer 3 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Permite 5% Cream 30g', salt: 'Permethrin 5% w/w', doseOptions: ['Apply at bedtime, wash off after 8-12 hrs'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Hydrocortisone 1% Cream', salt: 'Hydrocortisone 1% w/w (mild steroid, max 7 days)', doseOptions: ['Apply thin layer 2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin Sulphate 1% w/w', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Calosoft Lotion 100ml', salt: 'Calamine + Liquid Paraffin', doseOptions: ['Apply on rash 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Betadine 10% Solution 15ml', salt: 'Povidone-Iodine 10% solution', doseOptions: ['Clean wound 1-2 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Cetaphil Moisturizing Lotion 100ml', salt: 'Emollient lotion (atopic skin care)', doseOptions: ['Apply after bath & at bedtime'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Atogla Lotion 100ml', salt: 'Ceramide-based moisturizing lotion (atopic skin)', doseOptions: ['Apply 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Tedibar Soap 75g', salt: 'Syndet (soap-free) cleansing bar', doseOptions: ['Use for daily bath'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Eye / ear drops ──
    { name: 'Ciplox Eye/Ear Drops 10ml', salt: 'Ciprofloxacin 0.3% w/v', doseOptions: ['1-2 drops 3-4 times/day'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Ciplox-D Eye/Ear Drops 10ml', salt: 'Ciprofloxacin 0.3% + Dexamethasone 0.1%', doseOptions: ['1-2 drops 3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },

    // ── Hematinics / vitamins / minerals ──
    { name: 'Orofer Syrup', salt: 'Iron Polymaltose Complex 50 mg + Folic Acid 0.5 mg per 5 ml', doseOptions: ['2.5 ml', '5 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Orofer Drops', salt: 'Iron Polymaltose Complex infant drops', doseOptions: ['0.5 ml', '1 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Tonoferon Syrup', salt: 'Iron (Ferrous Sulphate) + Folic Acid syrup', doseOptions: ['2.5 ml', '5 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Tonoferon Paediatric Drops', salt: 'Iron + Folic Acid paediatric drops', doseOptions: ['0.5 ml', '1 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Dexorange Syrup', salt: 'Ferric Ammonium Citrate + Cyanocobalamin + Folic Acid', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Drops', salt: 'Multivitamin + Multimineral drops', doseOptions: ['0.3 ml', '0.5 ml', '1 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Syrup', salt: 'Multivitamin + Multimineral syrup', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Bevon Syrup', salt: 'Multivitamin + Antioxidant syrup', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Polybion Syrup', salt: 'Vitamin B-Complex syrup', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Uprise-D3 Drops', salt: 'Cholecalciferol 400 IU/ml drops', doseOptions: ['0.5 ml (400 IU)', '1 ml (800 IU)'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },
    { name: 'Uprise D3 60K Sachet', salt: 'Cholecalciferol 60,000 IU granules', doseOptions: ['1 sachet weekly'], morning: 1, afternoon: 0, evening: 0, tab: 8, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Calcimax-P Syrup', salt: 'Calcium + Vitamin D3 + Magnesium + Zinc syrup', doseOptions: ['5 ml', '10 ml'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Anthelminthics ──
    { name: 'Zentel 400 Tablet', salt: 'Albendazole 400 mg chewable', doseOptions: ['1 tablet (400 mg)', 'Half tablet (200 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Zentel Suspension', salt: 'Albendazole 200 mg/5 ml', doseOptions: ['5 ml (200 mg)', '10 ml (400 mg)'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'weight-based', schedule: 'OTC', verified: false } },

    // ── Oral gels / gargle ──
    { name: 'Hexigel 15g', salt: 'Chlorhexidine Gluconate 1% oral gel', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Mucopain Gel 10g', salt: 'Benzocaine 2% oral gel (NOT below 2 years)', doseOptions: ['Apply thin layer 2-3 times/day'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Betadine Gargle 100ml', salt: 'Povidone-Iodine 2% gargle (children who can gargle)', doseOptions: ['10 ml in half glass warm water'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (49) ══════════════════════════════════════
  // THALASSEMIA-TRAIT and DEVELOPMENTAL-DELAY deliberately carry NO links —
  // both are screen-and-refer findings (no OPD medicines to auto-attach).
  findingMeds: [
    // VIRAL-FEVER
    { findingKey: 'VIRAL-FEVER', medicineName: 'Calpol 250 Suspension', dose: '5 ml (250 mg) SOS', morning: 0, afternoon: 0, evening: 1, tab: 1, description: '15 mg/kg/dose; SOS if temp > 100°F; max 4 doses/24 hrs' },
    { findingKey: 'VIRAL-FEVER', medicineName: 'Electral Sachet (ORS)', description: '1 sachet in 200 ml water; sip through the day to maintain hydration' },
    // URTI
    { findingKey: 'URTI', medicineName: 'Cetzine Syrup', description: '2.5-5 ml HS × 5 days (if runny nose/sneeze)' },
    { findingKey: 'URTI', medicineName: 'Nasoclear Saline Nasal Drops', description: '1-2 drops each nostril before feeds and sleep' },
    // TONSILLOPHARYNGITIS
    { findingKey: 'TONSILLOPHARYNGITIS', medicineName: 'Clavam 228.5 Dry Syrup', description: 'Weight-band dose BD × 7 days after food; complete the FULL course' },
    { findingKey: 'TONSILLOPHARYNGITIS', medicineName: 'Calpol 250 Suspension', description: 'SOS for throat pain; max 4 doses/24 hrs' },
    // OTITIS-MEDIA
    { findingKey: 'OTITIS-MEDIA', medicineName: 'Clavam 228.5 Dry Syrup', description: 'Weight-band dose BD × 7-10 days; complete the FULL course' },
    { findingKey: 'OTITIS-MEDIA', medicineName: 'Calpol 250 Suspension', description: 'SOS for ear pain (night pain common)' },
    // BRONCHIOLITIS
    { findingKey: 'BRONCHIOLITIS', medicineName: 'Levolin Respules', description: '1 respule nebulize TDS × 5 days (with mask); review if breathing worsens' },
    { findingKey: 'BRONCHIOLITIS', medicineName: 'Nasoclear Saline Nasal Drops', description: 'Clear the nose before feeds' },
    // VIRAL-WHEEZE
    { findingKey: 'VIRAL-WHEEZE', medicineName: 'Levolin Respules', description: '1 respule nebulize TDS × 5 days' },
    { findingKey: 'VIRAL-WHEEZE', medicineName: 'Montair LC Kid Syrup', description: '5 ml HS × 4 weeks; do not stop early' },
    // GE-NO-DEHYDRATION
    { findingKey: 'GE-NO-DEHYDRATION', medicineName: 'Electral Sachet (ORS)', description: 'After every loose stool: 50-100 ml (<2 yrs), 200 ml (older)' },
    { findingKey: 'GE-NO-DEHYDRATION', medicineName: 'Zinconia Syrup', description: '2.5-5 ml OD × 14 days (full zinc course)' },
    { findingKey: 'GE-NO-DEHYDRATION', medicineName: 'Enterogermina Oral Suspension', description: '1 vial BD × 3 days, half-hour before food' },
    // GE-SOME-DEHYDRATION
    { findingKey: 'GE-SOME-DEHYDRATION', medicineName: 'Electral Sachet (ORS)', description: 'Aggressive rehydration: 75 ml/kg over 4 hrs in small sips; monitor urine' },
    { findingKey: 'GE-SOME-DEHYDRATION', medicineName: 'Ondem Syrup', description: 'Weight-band dose 30 min before food, only if vomiting persists' },
    // ENTERIC-FEVER
    { findingKey: 'ENTERIC-FEVER', medicineName: 'Zifi 200 Tablet', description: '1 tab BD × 7-10 days (older children); confirm with typhoid test first' },
    { findingKey: 'ENTERIC-FEVER', medicineName: 'Calpol DS Suspension', description: 'SOS for fever; sponging if high; watch hydration' },
    // DENGUE-FEVER
    { findingKey: 'DENGUE-FEVER', medicineName: 'Calpol DS Suspension', description: 'SOS ONLY paracetamol — NEVER ibuprofen/aspirin in dengue (bleeding risk)' },
    { findingKey: 'DENGUE-FEVER', medicineName: 'ORSL Liquid Apple 200ml', description: 'Force fluids; daily platelet check as advised' },
    // VIRAL-EXANTHEM
    { findingKey: 'VIRAL-EXANTHEM', medicineName: 'Calosoft Lotion 100ml', description: 'Apply on rash 2-3 times/day for soothing' },
    // NEONATAL-JAUNDICE
    { findingKey: 'NEONATAL-JAUNDICE', medicineName: 'Uprise-D3 Drops', description: '0.5 ml (400 IU) daily while on follow-up; treatment itself = feeding + phototherapy if advised' },
    // IRON-DEF-ANEMIA
    { findingKey: 'IRON-DEF-ANEMIA', medicineName: 'Orofer Syrup', description: '2.5-5 ml BD after food × 8 weeks; with citrus juice; avoid tea/milk nearby; stools may turn black (harmless)' },
    { findingKey: 'IRON-DEF-ANEMIA', medicineName: 'Zincovit Syrup', description: '5 ml OD after food (support during iron therapy)' },
    // WORM-INFESTATION
    { findingKey: 'WORM-INFESTATION', medicineName: 'Zentel 400 Tablet', description: 'Single dose at night after food; repeat after 2 weeks; above 2 years' },
    { findingKey: 'WORM-INFESTATION', medicineName: 'Zentel Suspension', description: '5-10 ml single dose (small children); deworm all kids in family' },
    // INFANTILE-COLIC
    { findingKey: 'INFANTILE-COLIC', medicineName: 'Colimex Drops', description: '0.25-0.5 ml per age/weight; after feeds with burping; review dose' },
    { findingKey: 'INFANTILE-COLIC', medicineName: 'Domstal Suspension', description: '2.5 ml before feeds TDS × 2 days only if vomiting' },
    // ATOPIC-DERMATITIS
    { findingKey: 'ATOPIC-DERMATITIS', medicineName: 'Hydrocortisone 1% Cream', description: 'Thin layer BD on flaring patches × max 7 days; avoid face unless advised' },
    { findingKey: 'ATOPIC-DERMATITIS', medicineName: 'Atogla Lotion 100ml', description: 'Apply 2-3 times/day on damp skin after bath (maintenance)' },
    { findingKey: 'ATOPIC-DERMATITIS', medicineName: 'Tedibar Soap 75g', description: 'Daily bath with soap-free bar; avoid hot water scrubbing' },
    // SCABIES
    { findingKey: 'SCABIES', medicineName: 'Permite 5% Cream 30g', description: 'Apply neck-down at bedtime, wash off after 8-12 hrs; treat ALL family members same day; repeat after 1 week' },
    // IMPETIGO
    { findingKey: 'IMPETIGO', medicineName: 'T-Bact 2% Ointment 5g', description: 'Apply TDS on lesions after cleaning; do not bandage tightly' },
    { findingKey: 'IMPETIGO', medicineName: 'Sporidex 125 Syrup', description: 'Weight-band dose TDS × 7 days if widespread/fever' },
    // URTICARIA
    { findingKey: 'URTICARIA', medicineName: 'Cetzine Syrup', description: '2.5-5 ml HS × 1-2 weeks' },
    { findingKey: 'URTICARIA', medicineName: 'Xyzal Syrup', description: '2.5-5 ml HS if not controlled with cetirizine' },
    // ALLERGIC-RHINITIS
    { findingKey: 'ALLERGIC-RHINITIS', medicineName: 'Cetzine Syrup', description: '2.5-5 ml HS × 2-4 weeks' },
    { findingKey: 'ALLERGIC-RHINITIS', medicineName: 'Montair LC Kid Syrup', description: '5 ml HS × 4 weeks; works best with regular use' },
    // FEBRILE-SEIZURE
    { findingKey: 'FEBRILE-SEIZURE', medicineName: 'Calpol 250 Suspension', description: 'Prompt fever control — 15 mg/kg/dose at first sign of fever; max 4 doses/24 hrs' },
    { findingKey: 'FEBRILE-SEIZURE', medicineName: 'Crocin Drops', description: 'For infants: 0.3-0.6 ml SOS; do not overdress during fever' },
    // FAILURE-TO-THRIVE
    { findingKey: 'FAILURE-TO-THRIVE', medicineName: 'Zinconia Syrup', description: '2.5 ml OD × 14 days (appetite recovery); pair with calorie-dense diet' },
    { findingKey: 'FAILURE-TO-THRIVE', medicineName: 'Zincovit Drops', description: '0.5 ml OD (infants) while catch-up growth is tracked' },
    // VITAMIN-D-DEF
    { findingKey: 'VITAMIN-D-DEF', medicineName: 'Uprise-D3 Drops', description: '400-800 IU daily; confirm dose with vitamin D level' },
    { findingKey: 'VITAMIN-D-DEF', medicineName: 'Calcimax-P Syrup', description: '5-10 ml BD after food; do not give together with iron syrup' },
    // TEETHING-TROUBLE
    { findingKey: 'TEETHING-TROUBLE', medicineName: 'Calpol 250 Suspension', description: '2.5-5 ml SOS for pain (max 4 doses/24 hrs); cool teether to chew' },
    // FUNCTIONAL-CONSTIPATION
    { findingKey: 'FUNCTIONAL-CONSTIPATION', medicineName: 'Duphalac Solution 200ml', description: '5-10 ml HS; adjust to soft stool; diet + toilet routine alongside' },
    // NEONATAL-CONJUNCTIVITIS
    { findingKey: 'NEONATAL-CONJUNCTIVITIS', medicineName: 'Ciplox Eye/Ear Drops 10ml', description: '1 drop 3-4 times/day; newborn eye discharge needs same-week review — refer if profuse' },
    // APHTHOUS-STOMATITIS
    { findingKey: 'APHTHOUS-STOMATITIS', medicineName: 'Hexigel 15g', description: 'Apply thin layer on ulcers 2-3 times/day after meals' },
    // OMPHALITIS
    { findingKey: 'OMPHALITIS', medicineName: 'T-Bact 2% Ointment 5g', description: 'Apply TDS after cleaning with spirit; spreading redness = hospital same day' },
  ],

  // ══ Table templates (8) — IAP schedule, growth, feeding, dehydration ═══
  // Semantics follow pediatric-seed.ts: headerLabel = per-COLUMN headers
  // (len = cols), colsLabel = per-ROW labels (len = rows), footerLabel =
  // printed footer advice.
  tables: [
    {
      name: 'IAP Immunization Schedule (Birth→16 वर्ष)',
      rows: 12,
      cols: 3,
      headerLabel: ['आयु — टीके (IAP अनुसार)', 'दी गई तारीख', 'ब्रांड / लॉट / टिप्पणी'],
      colsLabel: [
        'जन्म — BCG, OPV-0, Hepatitis-B-1',
        '6 सप्ताह — DTP-1, IPV-1, Hib-1, Hep-B2, Rota-1, PCV-1',
        '10 सप्ताह — DTP-2, IPV-2, Hib-2, Rota-2, PCV-2',
        '14 सप्ताह — DTP-3, IPV-3, Hib-3, Rota-3, PCV-3',
        '6 महीने — Influenza-1 (4 सप्ताह बाद Influenza-2)',
        '9 महीने — MMR-1; Typhoid conjugate (9-12 माह)',
        '12 महीने — Hepatitis-A-1',
        '15 महीने — Varicella-1, PCV बूस्टर',
        '16-18 महीने — MMR-2, DTP बूस्टर-1, IPV-B1, Hib बूस्टर',
        '2 वर्ष — Typhoid बूस्टर (यदि पहले नहीं लगा)',
        '4-6 वर्ष — DTP बूस्टर-2, MMR-3, Varicella-2',
        '9-15 वर्ष — Tdap / HPV (किशोर: HPV 2 खुराक, टीकाकरण सलाह पर)',
      ],
      footerLabel: ['हर विजिट पर टीका कार्ड जरूर लाएं; छूटे टीके catch-up कराएं / Bring the immunization card at every visit; catch-up any missed vaccines'],
      extraLabel: 'IAP Immunization Schedule के अनुसार (NIS + IAP दोनों विकल्प डॉक्टर चुनें)',
    },
    {
      name: 'Growth Monitoring Chart',
      rows: 4,
      cols: 4,
      headerLabel: ['विजिट', 'वजन (किग्रा)', 'लंबाई/ऊंचाई (से.मी.)', 'सिर परिधि (से.मी.)'],
      colsLabel: ['वर्तमान विजिट', 'पिछली विजिट', '6 महीने पहले', 'जन्म के समय'],
      footerLabel: ['हर विजिट पर WHO ग्रोथ चार्ट पर वजन प्लॉट करें / Plot weight on the WHO growth chart at every visit'],
      extraLabel: '',
    },
    {
      name: 'Feeding Milestones',
      rows: 6,
      cols: 2,
      headerLabel: ['आयु', 'आहार का चरण'],
      colsLabel: [
        '0-6 महीने — केवल मां का दूध (exclusive breastfeeding)',
        '6 महीने पूरा — पूरक आहार 2-3 चम्मच शुरू (खिचड़ी, दलिया, केला, फल-सब्जी प्यूरी)',
        '7-8 महीने — दिन में 2 बार गाढ़ा खाना; उंगली-खाना देना शुरू',
        '9-12 महीने — दिन में 3 बार खाना + 2 स्नैक; छोटे टुकड़े चबाना सीखें',
        '1-2 वर्ष — परिवार का खाना (कम मसाला), अपने हाथ से खाना',
        '2 वर्ष+ — पूरा परिवार भोजन; दूध ~500 मिली/दिन',
      ],
      footerLabel: ['1 साल से पहले नमक, चीनी और शहद न दें; 6 महीने तक सिर्फ मां का दूध / No salt, sugar or honey before 1 year; exclusive breastfeeding till 6 months'],
      extraLabel: '',
    },
    {
      name: 'Dehydration Assessment (WHO IMCI)',
      rows: 6,
      cols: 4,
      headerLabel: ['लक्षण / संकेत', 'डिहाइड्रेशन नहीं', 'कुछ डिहाइड्रेशन', 'गंभीर डिहाइड्रेशन'],
      colsLabel: [
        'आंखें (Eyes)',
        'मुंह / जीभ',
        'आंसू (रोते समय)',
        'प्यास',
        'त्वचा पिंच (सिकुड़न)',
        'बच्चे की सामान्य हालत',
      ],
      footerLabel: ['गंभीर डिहाइड्रेशन (बहुत सुस्त, आंखें धँसी, पेशाब बंद) = तुरंत अस्पताल / Severe dehydration — hospital immediately'],
      extraLabel: 'Plan A (घर पर ORS) / Plan B (ORS measured) / Plan C (IV — refer) डॉक्टर तय करेंगे',
    },
    {
      name: 'Fever Day Chart (5 days)',
      rows: 5,
      cols: 3,
      headerLabel: ['दिन', 'अधिकतम तापमान (°F)', 'दी गई दवा / टिप्पणी'],
      colsLabel: ['दिन 1', 'दिन 2', 'दिन 3', 'दिन 4', 'दिन 5'],
      footerLabel: ['दिन में 3 बार तापमान लिखें; 5 दिन से ज्यादा बुखार पर जांच कराएं / Record temp 3 times a day; investigate if fever > 5 days'],
      extraLabel: '',
    },
    {
      name: 'Milestone Assessment',
      rows: 5,
      cols: 2,
      headerLabel: ['माइलस्टोन', 'किस उम्र में हुआ'],
      colsLabel: [
        'गर्दन संभालना (~3 माह)',
        'बिना सहारे बैठना (~6-8 माह)',
        'खड़ा होकर चलना (~12-15 माह)',
        'पहले शब्द बोलना (~12 माह)',
        '2 शब्दों का वाक्य (~2 वर्ष)',
      ],
      footerLabel: ['कोई माइलस्टोन समय पर न हो तो विकास-जांच कराएं / If any milestone is delayed, get a developmental assessment'],
      extraLabel: '',
    },
    {
      name: 'Feeding History (24-hour recall)',
      rows: 4,
      cols: 2,
      headerLabel: ['आहार प्रकार', 'मात्रा / कितनी बार'],
      colsLabel: ['मां का दूध / फॉर्मूला', 'गाय का दूध', 'ठोस आहार (भोजन)', 'पानी / जूस'],
      footerLabel: ['पिछले 24 घंटे की डाइट नोट करके लाएं / Note the last 24 hours of diet before the visit'],
      extraLabel: '',
    },
    {
      name: 'Stool & ORS Diary (दस्त मॉनिटरिंग)',
      rows: 3,
      cols: 3,
      headerLabel: ['समय', 'दस्त / उल्टी कितनी बार', 'ORS कितना पिलाया'],
      colsLabel: ['सुबह (6AM-12PM)', 'दोपहर (12-6PM)', 'रात (6PM-6AM)'],
      footerLabel: ['हर दस्त के बाद ORS: 2 साल से कम = 50-100 मिली, बड़े बच्चे = 200 मिली / After each stool give ORS: 50-100 ml <2 yrs, 200 ml older children'],
      extraLabel: 'गिनती घट रही है = सुधार; बढ़ रही है या पेशाब बंद = तुरंत डॉक्टर',
    },
  ],

  // ══ Rx quick-packages (6) ═════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acute Viral Fever — Child',
      diagnosis: 'VIRAL-FEVER',
      medicines: [
        { name: 'Calpol 250 Suspension', dose: '5 ml (250 mg)', duration: '3 days', instructions: 'SOS if temp > 100°F; 15 mg/kg/dose; max 4 doses/24 hrs' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 200 ml', duration: '3 days', instructions: 'Sip through the day to maintain hydration' },
      ],
      labs: ['CBC (if fever > 5 days)', 'Dengue NS1 + IgM (if warning signs/rash)'],
      advice: 'हल्के कपड़े पहनाएं · गुनगुने पानी से नौनी (tepid sponging) · भरपूर तरल (पानी, ORS, सूप) · खाना बंद न करें · बच्चा सुस्त हो, दूध छोड़े, दाने निकलें या 3 महीने से छोटा हो तो तुरंत दिखाएं',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Acute Gastroenteritis — ORS + Zinc + Probiotic',
      diagnosis: 'GE-NO-DEHYDRATION',
      medicines: [
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 200 ml', duration: '5 days', instructions: 'After every loose stool: 50-100 ml (<2 yrs) / 200 ml (older)' },
        { name: 'Zinconia Syrup', dose: '2.5 ml (10 mg)', duration: '14 days', instructions: 'Once daily at bedtime — complete the FULL 14-day course' },
        { name: 'Enterogermina Oral Suspension', dose: '1 vial (5 ml)', duration: '3 days', instructions: 'BD, half-hour before food' },
        { name: 'Ondem Syrup', dose: '2.5 ml (2 mg)', duration: '2 days', instructions: '30 min before food, ONLY if vomiting persists' },
      ],
      labs: ['Stool routine (if blood/mucus)', 'Serum electrolytes (if dehydrated)'],
      advice: 'मां का दूध/खाना जारी रखें — बच्चे को भूखा न रखें · हर दस्त के बाद ORS · दूध में पानी मिलाकर पतला न करें · आंखें धँसना, पेशाब बंद, खून आने या बहुत सुस्ती पर तुरंत वापस आएं',
      followUpDays: 2,
      isCommon: true,
    },
    {
      name: 'Acute Otitis Media — Antibiotic Course',
      diagnosis: 'OTITIS-MEDIA',
      medicines: [
        { name: 'Clavam 228.5 Dry Syrup', dose: '5 ml', duration: '7 days', instructions: 'BD after food (weight-band: confirm ml for weight); complete the FULL course' },
        { name: 'Calpol 250 Suspension', dose: '5 ml (250 mg)', duration: '3 days', instructions: 'SOS for ear pain; max 4 doses/24 hrs' },
      ],
      labs: ['CBC (if fever > 3 days or toxic child)'],
      advice: 'कान में कॉटन बड्स/तेल डालना मना है · नहाते समय पानी न जाने दें · एंटीबायोटिक कोर्स पूरा करें — दर्द घटने पर बंद न करें · कान के पीछे सूजन या तेज बुखार पर तुरंत आएं',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'Wheeze — Bronchodilator Course',
      diagnosis: 'VIRAL-WHEEZE',
      medicines: [
        { name: 'Levolin Respules', dose: '1 respule (2 ml)', duration: '5 days', instructions: 'Nebulize TDS with mask (+ 2 ml saline); rinse face/mouth after' },
        { name: 'Asthalin Syrup', dose: '2.5 ml (1 mg)', duration: '5 days', instructions: 'TDS after food; mild hand tremor can occur — usually harmless' },
        { name: 'Montair LC Kid Syrup', dose: '5 ml', duration: '4 weeks', instructions: 'Every night at bedtime; do not stop early' },
      ],
      labs: ['Chest X-ray (only if breathing worsens or fever persists)'],
      advice: 'धुआं, धूल, अगरबत्ती, तेज खुशबू व पालतू जानवरों से दूर रखें · नेबुलाइज़र मास्क सही तरीके से लगाएं · बच्चा बोलते में टूटे, सीना अंदर धँसे या होंठ नीले पड़ें तो तुरंत इमरजेंसी',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Tonsillopharyngitis — Antibiotic Course',
      diagnosis: 'TONSILLOPHARYNGITIS',
      medicines: [
        { name: 'Clavam 228.5 Dry Syrup', dose: '5 ml', duration: '7 days', instructions: 'BD after food (confirm ml for weight); complete the FULL course' },
        { name: 'Calpol 250 Suspension', dose: '5 ml (250 mg)', duration: '3 days', instructions: 'SOS for throat pain' },
        { name: 'Betadine Gargle 100ml', dose: '10 ml in half glass warm water', duration: '5 days', instructions: 'Gargle 2-3 times/day (only children old enough to gargle and spit)' },
      ],
      labs: ['CBC (if fever persists beyond 3 days)'],
      advice: 'गर्म पानी के गरारे (जो गरारा सकते हों) · नरम-ठंडा खाना, तला-मसालेदार बंद · पूरा एंटीबायोटिक कोर्स — 2-3 दिन में सुधार लगे तब भी न रोकें · आवाज दबना/लार टपकना हो तो तुरंत आएं',
      followUpDays: 3,
      isCommon: false,
    },
    {
      name: 'Immunization Visit Package',
      diagnosis: 'IMMUNIZATION-VISIT',
      medicines: [
        { name: 'Crocin Drops', dose: '0.6 ml (60 mg)', duration: '2 days', instructions: 'SOS if fever/irritability after vaccine (weight-band for infants)' },
        { name: 'Uprise-D3 Drops', dose: '0.5 ml (400 IU)', duration: '30 days', instructions: 'Once daily with a feed — routine supplementation' },
        { name: 'Zincovit Drops', dose: '0.5 ml', duration: '30 days', instructions: 'Once daily after food (if appetite/diet needs support)' },
      ],
      labs: [],
      advice: 'टीके के बाद 15-20 मिनट क्लिनिक में रुकें · 24-48 घंटे हल्का बुखार/सूजन/दर्द सामान्य — ठंडा सेक करें, दबाए नहीं · टीका कार्ड अपडेट कराकर रखें और हर विजिट पर लाएं · बुखार 103°F+ या 48 घंटे बाद भी रहे तो दिखाएं',
      followUpDays: 30,
      isCommon: true,
    },
  ],
}
