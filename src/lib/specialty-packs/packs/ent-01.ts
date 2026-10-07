/**
 * ENT-01 — ENT STARTER PACK (T1) — "small city workhorse"
 *
 * The India ENT OPD core: ear pain/discharge/wax, blocked nose & sinusitis,
 * allergic rhinitis, tonsillitis/hoarseness, vertigo (BPPV), epistaxis —
 * plus the red-flag REFER lines that matter in ENT.
 *
 * Language: Hindi primary (patient-facing / ask-aloud / print), English
 * secondary (doctor search). Medicine names = English brands (India ENT core).
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-formulary adult defaults but have NOT yet been
 * signed off by an MBBS reviewer. UI must show the unverified-dose badge
 * until meta.reviewedBy is stamped.
 *
 * SAFETY WIRING (deliberate, hard rules):
 * - NO aminoglycoside ear drops (gentamicin / framycetin / neomycin class) —
 *   ototoxic through a perforated TM; the whole class is excluded. Quinolone
 *   drops (Ciplox) are the perforated-TM-safe choice (noted in salt);
 *   Candibiotic carries "avoid if TM perforation suspected — quinolone
 *   preferred".
 * - Oxymetazoline / xylometazoline (Nasivion / Otrivin): MANDATORY max 5-7
 *   day limit in every salt/note (rhinitis medicamentosa); pediatric
 *   strengths (0.025% child, 0.01% infant) kept separate from adult
 *   0.05% / 0.1%.
 * - Betahistine / Stemetil: drowsiness + no-driving caution in salt strings.
 * - REFER-ONLY pathways (never a medicine-only route): sudden sensorineural
 *   hearing loss (SAME-DAY emergency — the steroid window is specialist
 *   territory, oral steroid courses deliberately NOT in this pack),
 *   suspected mastoiditis, quinsy, uncontrolled epistaxis, ear/nasal
 *   foreign body, Meniere-like vertigo, OSA workup, non-healing oral ulcer,
 *   painless hard neck lump.
 *
 * Sources: NLEM 2023 (molecule backbone), standard Indian ENT OPD practice
 * patterns, AAO-HNS BPPV/vertigo guidance adapted for patient print.
 */

import type { SpecialtyPack } from '../types'

export const ENT01_PACK: SpecialtyPack = {
  meta: {
    code: 'ENT-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'ENT Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes: 'NLEM 2023 backbone · India ENT OPD top-prescribe patterns · AAO-HNS vertigo/BPPV guidance adapted for print · unverified-dose launch mode',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'EAR', name: 'कान', nameEn: 'Ear' },
    { key: 'NOS', name: 'नाक व साइनस', nameEn: 'Nose & Sinus' },
    { key: 'THR', name: 'गला', nameEn: 'Throat' },
    { key: 'HNV', name: 'सिर व गर्दन (चक्कर सहित)', nameEn: 'Head & Neck / Vertigo' },
    { key: 'OTH', name: 'अन्य', nameEn: 'Others' },
  ],

  // ══ Complaints (44) ═══════════════════════════════════════════════════
  complaints: [
    // EAR — कान
    { code: 'EAR01', categoryKey: 'EAR', detail: 'कान में दर्द', detailEn: 'Ear Pain' },
    { code: 'EAR02', categoryKey: 'EAR', detail: 'कान से पानी / मवाद आना', detailEn: 'Ear Discharge' },
    { code: 'EAR03', categoryKey: 'EAR', detail: 'कान बंद / भरा लगना', detailEn: 'Blocked Ear' },
    { code: 'EAR04', categoryKey: 'EAR', detail: 'कम सुनाई देना', detailEn: 'Hearing Loss' },
    { code: 'EAR05', categoryKey: 'EAR', detail: 'कान में घंटी / साईं जैसी आवाज़', detailEn: 'Ringing in Ears (Tinnitus)' },
    { code: 'EAR06', categoryKey: 'EAR', detail: 'कान में खुजली', detailEn: 'Ear Itching' },
    { code: 'EAR07', categoryKey: 'EAR', detail: 'कान में मैल जमना', detailEn: 'Ear Wax Problem' },
    { code: 'EAR08', categoryKey: 'EAR', detail: 'कान के पीछे दर्द या सूजन', detailEn: 'Pain / Swelling Behind Ear' },
    { code: 'EAR09', categoryKey: 'EAR', detail: 'बच्चा कान पर हाथ लगाता / रात में रोता है', detailEn: 'Child with Ear Pain' },
    { code: 'EAR10', categoryKey: 'EAR', detail: 'चबाते समय कान के सामने दर्द (जबड़ा)', detailEn: 'Jaw Pain Near Ear (TMJ)' },
    { code: 'EAR11', categoryKey: 'EAR', detail: 'उड़ान / ऊंचाई पर कान दर्द', detailEn: 'Ear Pain on Flying' },
    { code: 'EAR12', categoryKey: 'EAR', detail: 'कान में कीड़ा / चीज़ गई है', detailEn: 'Foreign Body in Ear' },
    // NOS — नाक व साइनस
    { code: 'NOS01', categoryKey: 'NOS', detail: 'नाक बंद होना', detailEn: 'Blocked Nose' },
    { code: 'NOS02', categoryKey: 'NOS', detail: 'जुकाम ठीक नहीं हो रहा', detailEn: 'Cold Not Settling' },
    { code: 'NOS03', categoryKey: 'NOS', detail: 'बार-बार छींके आना', detailEn: 'Sneezing Fits' },
    { code: 'NOS04', categoryKey: 'NOS', detail: 'नाक से पानी बहना', detailEn: 'Watery Runny Nose' },
    { code: 'NOS05', categoryKey: 'NOS', detail: 'गाढ़ा पीला / हरा नाक स्राव', detailEn: 'Colored Nasal Discharge' },
    { code: 'NOS06', categoryKey: 'NOS', detail: 'चेहरे / माथे पर साइनस दर्द या भारीपन', detailEn: 'Sinus Pain / Pressure' },
    { code: 'NOS07', categoryKey: 'NOS', detail: 'नाक से खून आना', detailEn: 'Nose Bleed (Epistaxis)' },
    { code: 'NOS08', categoryKey: 'NOS', detail: 'सूंघने की शक्ति कम होना', detailEn: 'Loss of Smell' },
    { code: 'NOS09', categoryKey: 'NOS', detail: 'खर्राटे आना', detailEn: 'Snoring' },
    { code: 'NOS10', categoryKey: 'NOS', detail: 'मुंह से सांस लेना', detailEn: 'Mouth Breathing' },
    { code: 'NOS11', categoryKey: 'NOS', detail: 'एक तरफ से नाक बंद', detailEn: 'One-Sided Nasal Block' },
    { code: 'NOS12', categoryKey: 'NOS', detail: 'नाक की नोक में दर्द / फुंसी', detailEn: 'Nose Tip Pain / Boil' },
    { code: 'NOS13', categoryKey: 'NOS', detail: 'बच्चे ने नाक में कुछ डाला', detailEn: 'Nasal Foreign Body (Child)' },
    // THR — गला
    { code: 'THR01', categoryKey: 'THR', detail: 'गले में दर्द', detailEn: 'Sore Throat' },
    { code: 'THR02', categoryKey: 'THR', detail: 'बार-बार गला खराब होना', detailEn: 'Recurrent Sore Throat' },
    { code: 'THR03', categoryKey: 'THR', detail: 'टॉन्सिल बड़े / सूजे हुए', detailEn: 'Tonsillitis' },
    { code: 'THR04', categoryKey: 'THR', detail: 'आवाज़ भारी / बैठ जाना', detailEn: 'Hoarseness / Voice Change' },
    { code: 'THR05', categoryKey: 'THR', detail: 'निगलने में दिक्कत', detailEn: 'Difficulty Swallowing' },
    { code: 'THR06', categoryKey: 'THR', detail: 'गले में कुछ अटका हुआ महसूस होना', detailEn: 'Lump-in-Throat Feeling (Globus)' },
    { code: 'THR07', categoryKey: 'THR', detail: 'गले में सूखापन / खर्राहट', detailEn: 'Dry / Scratchy Throat' },
    { code: 'THR08', categoryKey: 'THR', detail: 'मुंह में बार-बार छाले', detailEn: 'Recurrent Mouth Ulcers' },
    { code: 'THR09', categoryKey: 'THR', detail: 'मुंह की दुर्गंध', detailEn: 'Bad Breath' },
    { code: 'THR10', categoryKey: 'THR', detail: 'गले में खाना / कांटा अटका', detailEn: 'Throat Foreign Body' },
    { code: 'THR11', categoryKey: 'THR', detail: 'गले में बलगम टपकना', detailEn: 'Post-Nasal Drip' },
    // HNV — सिर व गर्दन
    { code: 'VER01', categoryKey: 'HNV', detail: 'चक्कर आना / सिर घूमना', detailEn: 'Vertigo / Dizziness' },
    { code: 'VER02', categoryKey: 'HNV', detail: 'गर्दन में गिल्टी / सूजन', detailEn: 'Neck Swelling / Lump' },
    { code: 'VER03', categoryKey: 'HNV', detail: 'चेहरा एक तरफ झुक गया', detailEn: 'Facial Weakness / Droop' },
    { code: 'VER04', categoryKey: 'HNV', detail: 'कान के नीचे / गाल में सूजन', detailEn: 'Swelling Below Ear' },
    { code: 'VER05', categoryKey: 'HNV', detail: 'आधे चेहरे में झनझनाहट / दर्द', detailEn: 'Facial Pain / Tingling' },
    // OTH — अन्य
    { code: 'OTH01', categoryKey: 'OTH', detail: 'बच्चा बोलने में देरी कर रहा है', detailEn: 'Delayed Speech in Child' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'नींद में सांस रुकना-सी लगना', detailEn: 'Breathing Stops in Sleep (Apnea)' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'ENT ऑपरेशन के बाद जांच', detailEn: 'Post-Operative ENT Follow-up' },
  ],

  // ══ Questions (100 — ~2 per complaint) ═══════════════════════════════
  // questionIndex order below MUST match this array order (idx annotated).
  questions: [
    // EAR01 Ear pain
    { complaintCode: 'EAR01', question: 'दर्द किस कान में है — दाएं, बाएं या दोनों में?', questionEn: 'Which ear hurts — right, left or both?' }, // idx 0
    { complaintCode: 'EAR01', question: 'क्या बुखार या जुकाम के साथ यह दर्द शुरू हुआ था?', questionEn: 'Did the pain start along with fever or a cold?' }, // idx 1
    { complaintCode: 'EAR01', question: 'कान को खींचने या दबाने पर दर्द बढ़ता है क्या?', questionEn: 'Does pulling or pressing the ear increase the pain?' }, // idx 2
    // EAR02 Ear discharge
    { complaintCode: 'EAR02', question: 'स्राव का रंग कैसा है — पीला-सफेद, हरा, या बहुत बदबूदार?', questionEn: 'What colour is the discharge — yellow-white, green, or very foul-smelling?' }, // idx 3
    { complaintCode: 'EAR02', question: 'कान कितने दिनों से बह रहा है?', questionEn: 'Since how many days is the ear discharging?' }, // idx 4
    { complaintCode: 'EAR02', question: 'कान बहने के बाद सुनाई कम हो गई है क्या?', questionEn: 'Has hearing reduced after the discharge started?' }, // idx 5
    // EAR03 Blocked ear
    { complaintCode: 'EAR03', question: 'कान बंद जुकाम के बाद हुआ या अचानक हुआ?', questionEn: 'Did the ear block after a cold, or did it start suddenly?' }, // idx 6
    { complaintCode: 'EAR03', question: 'बंद कान में दर्द या अपनी आवाज़ की गूंज भी है?', questionEn: 'Is there pain or an echo of your own voice in the blocked ear?' }, // idx 7
    // EAR04 Hearing loss
    { complaintCode: 'EAR04', question: 'कम सुनाई कब से है — कुछ ही दिन पहले अचानक, या महीनों से धीरे-धीरे?', questionEn: 'Since when — suddenly over a few days, or gradually over months?' }, // idx 8
    { complaintCode: 'EAR04', question: 'एक कान में कम सुनाई है या दोनों में?', questionEn: 'Is the hearing loss in one ear or both?' }, // idx 9
    { complaintCode: 'EAR04', question: 'शोर में काम करते हैं या इयरफोन ज्यादा लगाते हैं?', questionEn: 'Do you work in noise or use earphones for long hours?' }, // idx 10
    // EAR05 Tinnitus
    { complaintCode: 'EAR05', question: 'आवाज़ लगातार बजती है या बीच-बीच में आती है?', questionEn: 'Is the ringing constant or does it come and go?' }, // idx 11
    { complaintCode: 'EAR05', question: 'साथ में चक्कर या कम सुनाई भी है क्या?', questionEn: 'Any giddiness or hearing loss along with it?' }, // idx 12
    // EAR06 Ear itching
    { complaintCode: 'EAR06', question: 'खुजली नहाने या तैरने के बाद बढ़ती है क्या?', questionEn: 'Does the itching worsen after bathing or swimming?' }, // idx 13
    { complaintCode: 'EAR06', question: 'कान साफ करने के लिए कॉटन बड्स या पिन डालते हैं क्या?', questionEn: 'Do you clean the ear with cotton buds or pins?' }, // idx 14
    // EAR07 Wax
    { complaintCode: 'EAR07', question: 'कान की सफाई खुद करते हैं, या बहुत दिनों से नहीं हुई है?', questionEn: 'Do you self-clean the ear, or has it been long since cleaning?' }, // idx 15
    { complaintCode: 'EAR07', question: 'कान में कोई तेल (बादाम/सरसों/घर का) डाला है क्या?', questionEn: 'Have you put any oil (almond/mustard/home remedy) in the ear?' }, // idx 16
    // EAR08 Post-auricular
    { complaintCode: 'EAR08', question: 'कान के पीछे सूजन या उभार के साथ बुखार भी है क्या?', questionEn: 'Is there fever along with the swelling behind the ear?' }, // idx 17
    { complaintCode: 'EAR08', question: 'कान आगे की ओर झुका / बाहर निकला हुआ लगता है (बच्चे में)?', questionEn: 'Does the ear look pushed forward or protruding (in a child)?' }, // idx 18
    // EAR09 Child ear pain
    { complaintCode: 'EAR09', question: 'जुकाम या बुखार के बाद रात में रोना बहुत बढ़ गया है?', questionEn: 'Has night-time crying increased after a cold or fever?' }, // idx 19
    { complaintCode: 'EAR09', question: 'बच्चा टीवी की आवाज़ ज्यादा करता है या नाम पुकारने पर जवाब नहीं देता?', questionEn: 'Does the child turn up the TV volume or not respond when called by name?' }, // idx 20
    // EAR10 TMJ
    { complaintCode: 'EAR10', question: 'दर्द चबाने या मुंह खोलने पर बढ़ता है क्या?', questionEn: 'Does the pain worsen on chewing or opening the mouth?' }, // idx 21
    { complaintCode: 'EAR10', question: 'जबड़े के जोड़ पर दबाने से दर्द या क्लिक की आवाज़ आती है?', questionEn: 'Is there tenderness or a clicking sound at the jaw joint on pressing?' }, // idx 22
    // EAR11 Flying
    { complaintCode: 'EAR11', question: 'उतरने के बाद कान बंद रह गया या दर्द था?', questionEn: 'Did the ear stay blocked or painful after landing?' }, // idx 23
    { complaintCode: 'EAR11', question: 'जुकाम या बंद नाक के साथ ही उड़ान भरी थी क्या?', questionEn: 'Did you fly while having a cold or blocked nose?' }, // idx 24
    // EAR12 Ear FB
    { complaintCode: 'EAR12', question: 'क्या चीज़ गई है — बीज, इयरफोन का टिप, बटन या कीड़ा?', questionEn: 'What went in — a seed, earphone tip, button or an insect?' }, // idx 25
    { complaintCode: 'EAR12', question: 'कान में दर्द, खून या बहना शुरू हो गया है क्या?', questionEn: 'Has pain, bleeding or discharge started in the ear?' }, // idx 26
    // NOS01 Blocked nose
    { complaintCode: 'NOS01', question: 'नाक एक तरफ बंद है या दोनों तरफ?', questionEn: 'Is the nose blocked on one side or both?' }, // idx 27
    { complaintCode: 'NOS01', question: 'नाक कितने हफ्तों या महीनों से बंद रहता है?', questionEn: 'For how many weeks or months has the nose stayed blocked?' }, // idx 28
    { complaintCode: 'NOS01', question: 'साथ में छींके, पानी बहना या आंखों में खुजली-पानी भी है?', questionEn: 'Any sneezing, watery discharge or itchy-watery eyes along with it?' }, // idx 29
    // NOS02 Cold not settling
    { complaintCode: 'NOS02', question: 'जुकाम कितने दिनों से चल रहा है?', questionEn: 'Since how many days has the cold been going on?' }, // idx 30
    { complaintCode: 'NOS02', question: 'कौन-कौन सी दवा ली और किससे राहत मिली?', questionEn: 'Which medicines have you taken and which gave relief?' }, // idx 31
    // NOS03 Sneezing
    { complaintCode: 'NOS03', question: 'सुबह के समय छींके ज्यादा आती हैं क्या?', questionEn: 'Are the sneezing fits worse in the morning?' }, // idx 32
    { complaintCode: 'NOS03', question: 'धूल, धुआं, पराग या ठंडी हवा से छींके बढ़ जाती हैं?', questionEn: 'Do dust, smoke, pollen or cold air worsen the sneezing?' }, // idx 33
    // NOS04 Watery rhinorrhoea
    { complaintCode: 'NOS04', question: 'नाक से पानी जैसा बहता है या गाढ़ा स्राव है?', questionEn: 'Is the discharge watery or thick?' }, // idx 34
    { complaintCode: 'NOS04', question: 'नाक के साथ आंखों में जलन या पानी भी आता है?', questionEn: 'Any burning or watering of the eyes along with it?' }, // idx 35
    // NOS05 Colored discharge
    { complaintCode: 'NOS05', question: 'स्राव पीला है या हरा — और बदबू भी आती है क्या?', questionEn: 'Is the discharge yellow or green — and is there a bad smell?' }, // idx 36
    { complaintCode: 'NOS05', question: 'स्राव नाक के पीछे से गले में गिरता है क्या?', questionEn: 'Does the discharge drip backwards into the throat?' }, // idx 37
    // NOS06 Sinus pressure
    { complaintCode: 'NOS06', question: 'सिर झुकाने पर दर्द या भारीपन बढ़ता है क्या?', questionEn: 'Does the pain or heaviness worsen on bending the head forward?' }, // idx 38
    { complaintCode: 'NOS06', question: 'दर्द कहां है — माथे पर, गाल पर, आंखों के बीच या पीछे?', questionEn: 'Where is the pain — forehead, cheek, between the eyes or behind?' }, // idx 39
    { complaintCode: 'NOS06', question: 'बुखार या ऊपर के दांतों में दर्द भी है क्या?', questionEn: 'Is there fever or pain in the upper teeth as well?' }, // idx 40
    // NOS07 Epistaxis
    { complaintCode: 'NOS07', question: 'खून एक नाक से आता है या दोनों नाकों से?', questionEn: 'Does the bleeding come from one nostril or both?' }, // idx 41
    { complaintCode: 'NOS07', question: 'खून कितनी बार और कितने दिनों से आ रहा है?', questionEn: 'How many times and since how many days is the bleeding occurring?' }, // idx 42
    { complaintCode: 'NOS07', question: '10-15 मिनट दबाने पर भी खून बहता रहता है क्या?', questionEn: 'Does the bleeding continue even after 10-15 minutes of pressure?' }, // idx 43
    // NOS08 Smell loss
    { complaintCode: 'NOS08', question: 'सूंघना जुकाम के बाद गया, या धीरे-धीरे कम हुआ?', questionEn: 'Did smell go after a cold, or reduce gradually?' }, // idx 44
    { complaintCode: 'NOS08', question: 'खाने का स्वाद भी घट गया है क्या?', questionEn: 'Has the taste of food also reduced?' }, // idx 45
    // NOS09 Snoring
    { complaintCode: 'NOS09', question: 'खर्राटे रोज़ आते हैं? कोई कहता है कि सांस रुकती है?', questionEn: 'Is the snoring daily? Does anyone say breathing stops?' }, // idx 46
    { complaintCode: 'NOS09', question: 'दिन में नींद या थकान महसूस होती है क्या?', questionEn: 'Do you feel sleepy or tired during the day?' }, // idx 47
    // NOS10 Mouth breathing
    { complaintCode: 'NOS10', question: 'मुंह से सांस नाक बंद होने से चलती है, या आदत बन गई है?', questionEn: 'Is the mouth breathing due to a blocked nose, or has it become a habit?' }, // idx 48
    { complaintCode: 'NOS10', question: 'बच्चे में है? दिन में भी मुंह खुला रखता है और ध्यान कम देता है?', questionEn: 'Is it in a child? Mouth stays open in the day too and attention is poor?' }, // idx 49
    // NOS11 One-sided block
    { complaintCode: 'NOS11', question: 'एक तरफ नाक कितने महीनों से बंद है?', questionEn: 'Since how many months is one side of the nose blocked?' }, // idx 50
    { complaintCode: 'NOS11', question: 'उसी तरफ से खून या बदबूदार स्राव भी आया है क्या?', questionEn: 'Any bleeding or foul discharge from that same side?' }, // idx 51
    // NOS12 Nasal vestibulitis
    { complaintCode: 'NOS12', question: 'नाक की नोक पर लाल दाना या फुंसी दिखती है क्या?', questionEn: 'Is there a red pimple or boil on the tip of the nose?' }, // idx 52
    { complaintCode: 'NOS12', question: 'नाक के अंदर उंगली या कुछ डालकर खुजलाने की आदत है?', questionEn: 'Is there a habit of picking inside the nose?' }, // idx 53
    // NOS13 Nasal FB
    { complaintCode: 'NOS13', question: 'बच्चे ने क्या डाला था — मोती, बीज, बटन, कागज़ या कुछ और?', questionEn: 'What did the child insert — bead, seed, button, paper or something else?' }, // idx 54
    { complaintCode: 'NOS13', question: 'एक तरफ के नाक से बदबूदार स्राव बह रहा है क्या?', questionEn: 'Is there foul-smelling discharge from one nostril?' }, // idx 55
    // THR01 Sore throat
    { complaintCode: 'THR01', question: 'गले में दर्द कितने दिनों से है?', questionEn: 'Since how many days is the sore throat?' }, // idx 56
    { complaintCode: 'THR01', question: 'निगलने में दर्द बहुत तेज है? बुखार भी है क्या?', questionEn: 'Is the swallow pain severe? Is there fever too?' }, // idx 57
    { complaintCode: 'THR01', question: 'धूम्रपान, तंबाकू या गुटखा खाते हैं क्या?', questionEn: 'Do you smoke or use tobacco / gutkha?' }, // idx 58
    // THR02 Recurrent sore throat
    { complaintCode: 'THR02', question: 'एक साल में कितनी बार गला खराब होता है?', questionEn: 'How many times a year does the throat go bad?' }, // idx 59
    { complaintCode: 'THR02', question: 'हर बार बुखार और टॉन्सिल की सूजन के साथ होता है क्या?', questionEn: 'Does each episode come with fever and swollen tonsils?' }, // idx 60
    // THR03 Tonsillitis
    { complaintCode: 'THR03', question: 'टॉन्सिल पर सफेद धब्बे या मवाद दिखता है क्या?', questionEn: 'Are there white patches or pus on the tonsils?' }, // idx 61
    { complaintCode: 'THR03', question: 'मुंह खोलने में दिक्कत है या आवाज़ दब गई है?', questionEn: 'Is it difficult to open the mouth, or has the voice become muffled?' }, // idx 62
    // THR04 Hoarseness
    { complaintCode: 'THR04', question: 'आवाज़ कितने हफ्तों से भारी / बैठी हुई है?', questionEn: 'Since how many weeks has the voice been hoarse?' }, // idx 63
    { complaintCode: 'THR04', question: 'जोर से बोलना, गाना या चिल्लाना बहुत करना पड़ता है?', questionEn: 'Do you have to speak loudly, sing or shout a lot?' }, // idx 64
    { complaintCode: 'THR04', question: 'सीने में जलन या खट्टी डकार के साथ आवाज़ बिगड़ती है क्या?', questionEn: 'Does the voice worsen with heartburn or sour belching?' }, // idx 65
    // THR05 Dysphagia
    { complaintCode: 'THR05', question: 'दिक्कत सूखी रोटी जैसे ठोस खाने से शुरू हुई या पानी से भी है?', questionEn: 'Did the trouble start with solids like dry bread, or is it with liquids too?' }, // idx 66
    { complaintCode: 'THR05', question: 'खाना एक तरफ अटककर रुकता लगता है क्या?', questionEn: 'Does food feel stuck on one side?' }, // idx 67
    { complaintCode: 'THR05', question: 'इस दौरान वजन घटा है क्या?', questionEn: 'Have you lost weight during this time?' }, // idx 68
    // THR06 Globus
    { complaintCode: 'THR06', question: 'खाना निगलने में दिक्कत तो नहीं — बस अटका हुआ सा एहसास है?', questionEn: 'No actual trouble swallowing — just a feeling of something stuck?' }, // idx 69
    { complaintCode: 'THR06', question: 'तनाव या खाली पेट पर यह एहसास ज्यादा होता है क्या?', questionEn: 'Is the feeling worse with stress or on an empty stomach?' }, // idx 70
    // THR07 Dry throat
    { complaintCode: 'THR07', question: 'सुबह उठते समय सूखापन ज्यादा होता है क्या?', questionEn: 'Is the dryness worse on waking in the morning?' }, // idx 71
    { complaintCode: 'THR07', question: 'एसी / पंखे में सोते हैं या पानी कम पीते हैं?', questionEn: 'Do you sleep in AC / fan air or drink little water?' }, // idx 72
    // THR08 Oral ulcers
    { complaintCode: 'THR08', question: 'छाले हर महीने या हर हफ्ते आते हैं?', questionEn: 'Do the ulcers come every month or every week?' }, // idx 73
    { complaintCode: 'THR08', question: 'कोई छाला 2 हफ्तों से ज्यादा से भर नहीं रहा क्या?', questionEn: 'Is any ulcer not healing for more than 2 weeks?' }, // idx 74
    // THR09 Bad breath
    { complaintCode: 'THR09', question: 'दांतों की सफाई नियमित है? मसूड़ों से खून आता है क्या?', questionEn: 'Is dental care regular? Do gums bleed?' }, // idx 75
    { complaintCode: 'THR09', question: 'नाक का बलगम गले में गिरता है या टॉन्सिल में सफेद दाने हैं?', questionEn: 'Is there post-nasal drip or white debris in the tonsils?' }, // idx 76
    // THR10 Throat FB
    { complaintCode: 'THR10', question: 'क्या अटका है — मछली का कांटा, चिकन की हड्डी या कुछ और?', questionEn: 'What is stuck — fish bone, chicken bone or something else?' }, // idx 77
    { complaintCode: 'THR10', question: 'निगलने पर एक जगह तेज दर्द है? लार टपक रही है क्या?', questionEn: 'Is there sharp pain at one spot on swallowing? Is saliva drooling?' }, // idx 78
    // THR11 Post-nasal drip
    { complaintCode: 'THR11', question: 'बलगम नाक के पीछे से गले में आता लगता है क्या?', questionEn: 'Does the mucus feel like it comes down the back of the nose into the throat?' }, // idx 79
    { complaintCode: 'THR11', question: 'रात और सुबह गला साफ करना ज्यादा पड़ता है क्या?', questionEn: 'Do you have to clear the throat more at night and morning?' }, // idx 80
    // VER01 Vertigo
    { complaintCode: 'VER01', question: 'कमरा घूमता महसूस होता है या बस हल्कापन / अंधेरा आता है?', questionEn: 'Does the room spin, or is it just light-headedness / blackout?' }, // idx 81
    { complaintCode: 'VER01', question: 'बिस्तर पर लेटते-उठते या सिर घुमाने पर चक्कर आते हैं क्या?', questionEn: 'Do the spins come on lying down / getting up or turning the head?' }, // idx 82
    { complaintCode: 'VER01', question: 'एक हमला कितनी देर रहता है — सेकंडों, मिनटों या घंटों के लिए?', questionEn: 'How long does one attack last — seconds, minutes or hours?' }, // idx 83
    { complaintCode: 'VER01', question: 'चक्कर के साथ कान बजना, कम सुनाई या कान भरा होना भी है?', questionEn: 'With the vertigo, is there tinnitus, hearing loss or ear fullness?' }, // idx 84
    // VER02 Neck lump
    { complaintCode: 'VER02', question: 'गिल्टी कब से है और क्या बढ़ रही है?', questionEn: 'Since when is the lump there, and is it growing?' }, // idx 85
    { complaintCode: 'VER02', question: 'गिल्टी दर्द या बुखार के साथ आई, या बिना किसी दर्द के है?', questionEn: 'Did the lump come with pain or fever, or is it painless?' }, // idx 86
    { complaintCode: 'VER02', question: 'धूम्रपान, तंबाकू या शराब का सेवन करते हैं क्या?', questionEn: 'Do you use tobacco, smoking or alcohol?' }, // idx 87
    // VER03 Facial weakness
    { complaintCode: 'VER03', question: 'चेहरा अचानक झुका या धीरे-धीरे झुका?', questionEn: 'Did the face droop suddenly or gradually?' }, // idx 88
    { complaintCode: 'VER03', question: 'इसके साथ कान में दर्द या कान / मुंह में छाले (दाने) भी थे?', questionEn: 'Was there ear pain or vesicles in the ear / mouth along with it?' }, // idx 89
    // VER04 Parotid swelling
    { complaintCode: 'VER04', question: 'सूजन खाना खाते समय बढ़ती है या दर्द होता है क्या?', questionEn: 'Does the swelling increase or hurt while eating?' }, // idx 90
    { complaintCode: 'VER04', question: 'सूजन बुखार के साथ शुरू हुई थी क्या?', questionEn: 'Did the swelling start with fever?' }, // idx 91
    // VER05 Facial pain
    { complaintCode: 'VER05', question: 'दर्द चेहरे की एक तरफ बिजली जैसा चुभता है क्या?', questionEn: 'Is the pain like electric shocks on one side of the face?' }, // idx 92
    { complaintCode: 'VER05', question: 'चबाने या ठंडी-गरम चीज़ लेने से दर्द बढ़ता है क्या?', questionEn: 'Does the pain worsen on chewing or taking hot/cold things?' }, // idx 93
    // OTH01 Speech delay
    { complaintCode: 'OTH01', question: 'बच्चा 18 महीने का हो गया है और कोई शब्द नहीं बोलता?', questionEn: 'Is the child over 18 months and still not saying any words?' }, // idx 94
    { complaintCode: 'OTH01', question: 'आवाज़ होने पर ध्यान नहीं देता, पीछे से बुलाने पर नहीं देखता?', questionEn: 'Does the child ignore sounds, not turn when called from behind?' }, // idx 95
    // OTH02 Sleep apnea
    { complaintCode: 'OTH02', question: 'नींद में सांस रुक-रुक जाने या चौंक कर जागने की शिकायत है?', questionEn: 'Are there pauses in breathing during sleep or waking up gasping?' }, // idx 96
    { complaintCode: 'OTH02', question: 'सुबह सिरदर्द और दिनभर नींद आती है क्या?', questionEn: 'Is there morning headache and daytime sleepiness?' }, // idx 97
    // OTH03 Post-op follow-up
    { complaintCode: 'OTH03', question: 'कौन सा ऑपरेशन हुआ — टॉन्सिल, नाक / साइनस या कान का?', questionEn: 'Which surgery was done — tonsil, nose / sinus or ear?' }, // idx 98
    { complaintCode: 'OTH03', question: 'ऑपरेशन के बाद दर्द, बहना या खून आना बढ़ा है क्या?', questionEn: 'Has pain, discharge or bleeding increased after the surgery?' }, // idx 99
  ],

  // ══ Suggestions (200 — 2 per question; questionIndex = idx above) ═════
  suggestions: [
    // EAR01 q0 (idx 0)
    { questionIndex: 0, text: 'एक कान का दर्द — आम तौर पर उसी तरफ संक्रमण; दूसरे कान की जांच भी जरूर करें', textEn: 'One-sided pain — infection usually on that side; examine the other ear too' },
    { questionIndex: 0, text: 'दोनों कानों का दर्द — जुकाम/एलर्जी से कान की नाली बंद होना संभावित; भाप लें, नाक साफ रखें', textEn: 'Both ears — likely tube blockage from cold/allergy; steam inhalation, keep nose clear' },
    // EAR01 q1 (idx 1)
    { questionIndex: 1, text: 'बुखार-जुकाम के साथ दर्द — मध्य कान संक्रमण (AOM) संभावित; 48-72 घंटे में दोबारा मिलें', textEn: 'Pain with fever/cold — possible AOM; review in 48-72 hrs' },
    { questionIndex: 1, text: 'बिना बुखार का दर्द — बाहरी कान (बड्स/पानी) या जबड़े का जोड़ कारण हो सकता है', textEn: 'Afebrile pain — external ear (buds/water) or jaw joint cause possible' },
    // EAR01 q2 (idx 2)
    { questionIndex: 2, text: 'खींचने/दबाने पर दर्द बढ़े — बाहरी कान संक्रमण; कान में कुछ भी डालना बंद करें, कान सूखा रखें', textEn: 'Pain on pulling — otitis externa; stop putting anything in, keep ear dry' },
    { questionIndex: 2, text: 'दबाने पर दर्द नहीं — मध्य कान की ओर सोचें; ऑटोस्कोपी करके पर्दा देखें', textEn: 'No tenderness — think middle ear; otoscopy to view the drum' },
    // EAR02 q0 (idx 3)
    { questionIndex: 3, text: 'पीला-सफेद बिना बदबू — सामान्य संक्रमण; साफ कपड़े से सिर्फ बाहर से पोंछें, अंदर कुछ न डालें', textEn: 'Yellow-white, no smell — ordinary infection; wipe outer ear only, nothing inside' },
    { questionIndex: 3, text: 'हरा / बहुत बदबूदार स्राव — पुराना रोग (CSOM) या कोलेस्टीटोमा की आशंका — ENT रेफर करें', textEn: 'Green / foul discharge — suspect CSOM or cholesteatoma — refer to ENT' },
    // EAR02 q1 (idx 4)
    { questionIndex: 4, text: 'कुछ दिनों का बहना — नया संक्रमण; इलाज से कान सूखने पर सुनाई वापस आती है', textEn: 'Discharge of a few days — acute infection; hearing returns as ear dries' },
    { questionIndex: 4, text: 'हफ्तों से बहना — पुराना कान बहना (CSOM); जांच व रेफर जरूरी', textEn: 'Discharge for weeks — CSOM; needs evaluation and referral' },
    // EAR02 q2 (idx 5)
    { questionIndex: 5, text: 'स्राव के बाद सुनाई कम — पर्दे का छेद / मवाद संभावित; कान सूखा रखें, जांच जरूरी', textEn: 'Hearing reduced after discharge — perforation / pus likely; keep dry, examine' },
    { questionIndex: 5, text: 'सुनाई पहले जैसी ही — सतही संक्रमण; फॉलो-अप में दोबारा देखें', textEn: 'Hearing unchanged — superficial infection; re-examine at follow-up' },
    // EAR03 q0 (idx 6)
    { questionIndex: 6, text: 'जुकाम के बाद बंद कान — नाक-कान की नाली बंद; भाप + नाक में सलाइन स्प्रे; जुकाम ठीक होने पर खुल जाता है', textEn: 'Blocked after cold — Eustachian block; steam + saline nasal spray; opens as cold settles' },
    { questionIndex: 6, text: 'अचानक बंद + दर्द — मवाद / मैल संभावित; ऑटोस्कोपी कराएं', textEn: 'Sudden block + pain — pus / wax likely; get otoscopy done' },
    // EAR03 q1 (idx 7)
    { questionIndex: 7, text: 'अपनी आवाज़ की गूंज — नाली बंद होने का लक्षण; नाक खोलने वाले उपाय (भाप, सलाइन) करें', textEn: 'Echo of own voice — tube blockage sign; nasal measures (steam, saline)' },
    { questionIndex: 7, text: 'दर्द के साथ बंद कान — दबाव बढ़ना; 2 दिन में न खुले या दर्द बढ़े तो दिखाएं', textEn: 'Block with pain — pressure building; show if not open in 2 days or pain rises' },
    // EAR04 q0 (idx 8)
    { questionIndex: 8, text: 'कुछ दिनों में अचानक एक तरफ कम सुनाई — EMERGENCY: उसी दिन ENT रेफर करें (इलाज की सुनहरी अवधि पहले के दिनों में है)', textEn: 'Sudden one-sided loss over days — EMERGENCY: same-day ENT referral (treatment window is early)' },
    { questionIndex: 8, text: 'महीनों-सालों में धीरे-धीरे कम — उम्र / शोर से तंत्रिका कमजोरी संभावित; ऑडियोमेट्री कराएं', textEn: 'Gradual over months — age/noise-related nerve loss likely; audiometry' },
    // EAR04 q1 (idx 9)
    { questionIndex: 9, text: 'एक तरफ कम — मैल, पर्दा या तंत्रिका कारण; विस्तृत कान जांच जरूरी', textEn: 'One side — wax, drum or nerve cause; detailed ear exam needed' },
    { questionIndex: 9, text: 'दोनों तरफ कम — उम्र / शोर आम कारण; बातचीत में दिक्कत का आकलन + श्रवण जांच कराएं', textEn: 'Both sides — age/noise common; assess conversational difficulty + hearing test' },
    // EAR04 q2 (idx 10)
    { questionIndex: 10, text: 'इयरफोन/शोर में काम — तंत्रिका को धीरे-धीरे नुकसान; आवाज़ 60% से ऊपर न रखें, कान के मफ़ ज़रूर पहनें', textEn: 'Earphones/noisy work — slow nerve damage; keep volume below 60%, use ear protection' },
    { questionIndex: 10, text: 'शोर का संपर्क नहीं — मैल / नाली बंद जैसे अन्य कारण जांचें', textEn: 'No noise exposure — check other causes like wax / tube block' },
    // EAR05 q0 (idx 11)
    { questionIndex: 11, text: 'बीच-बीच में भजन — जुकाम, थकान या ज्यादा चाय-कॉफी से हो सकता है; आराम करें, कैफीन घटाएं', textEn: 'Intermittent ringing — cold, fatigue or excess tea/coffee; rest, cut caffeine' },
    { questionIndex: 11, text: 'लगातार भजन, खासकर एक तरफ — श्रवण जांच (ऑडियोमेट्री) कराएं, जरूरत पड़ने पर रेफर', textEn: 'Constant ringing, especially one side — audiometry; refer if abnormal' },
    // EAR05 q1 (idx 12)
    { questionIndex: 12, text: 'भजन + चक्कर + कान भरा — मेनियर जैसा चित्र — ENT रेफर करें (जांच जरूरी)', textEn: 'Ringing + vertigo + ear fullness — Meniere-like picture — refer to ENT' },
    { questionIndex: 12, text: 'भजन अकेला — जुकाम ठीक होने पर अक्सर चला जाता है; 2 हफ्ते+ रहे तो जांच कराएं', textEn: 'Isolated ringing — often settles as cold resolves; investigate if 2+ weeks' },
    // EAR06 q0 (idx 13)
    { questionIndex: 13, text: 'पानी लगने के बाद खुजली — फफूंदी संभावित; तैरने के बाद कान सूखा रखें, वाटरप्रूफ इयरप्लग लगाएं', textEn: 'Itch after water — fungal likely; keep ear dry after swimming, waterproof ear plugs' },
    { questionIndex: 13, text: 'पानी से जुड़ा नहीं — एक्ज़िमा / एलर्जी संभावित; कान के अंदर बड्स बिल्कुल बंद', textEn: 'Not water-related — eczema / allergy possible; absolutely no buds inside' },
    // EAR06 q1 (idx 14)
    { questionIndex: 14, text: 'कॉटन बड्स / पिन चलाते हैं — आज से बंद करें: कान अपनी सफाई खुद करता है, बड्स मैल और अंदर धकेलते हैं', textEn: 'Using buds/pins — stop today: ears self-clean, buds push wax deeper' },
    { questionIndex: 14, text: 'बड्स नहीं लगाते — अच्छी आदत; खुजली बहुत ज्यादा हो तो जांच करा लें', textEn: 'No buds — good habit; get examined if itching is severe' },
    // EAR07 q0 (idx 15)
    { questionIndex: 15, text: 'खुद की सफाई — रोक दें; बाहरी कान को रुई / मुलायम कपड़े से हल्के हाथ से पोंछना काफी है', textEn: 'Self-cleaning — stop; gentle outer wiping with cloth/cotton is enough' },
    { questionIndex: 15, text: 'बहुत दिनों से सफाई नहीं + भरा लगना — मैल जमना संभावित; डॉक्टर से निकालवाएं, खुद नहीं', textEn: 'Long-uncleaned + blocked — impaction likely; let the doctor remove it' },
    // EAR07 q1 (idx 16)
    { questionIndex: 16, text: 'तेल डाला है — घर का / गर्म तेल कान में डालना बंद करें; पर्दे को नुकसान और संक्रमण का खतरा', textEn: 'Oil instilled — stop home/hot oils; risks drum damage and infection' },
    { questionIndex: 16, text: 'तेल नहीं डाला — अच्छा; मैल के लिए डॉक्टरी बूंदें ही चुनें', textEn: 'No oil — good; choose doctor-advised drops for wax' },
    // EAR08 q0 (idx 17)
    { questionIndex: 17, text: 'कान के पीछे सूजन + बुखार + दर्द — मस्टॉयड संक्रमण की आशंका — उसी दिन ENT / इमरजेंसी रेफर करें', textEn: 'Swelling behind ear + fever + pain — suspect mastoiditis — same-day ENT/emergency referral' },
    { questionIndex: 17, text: 'हल्का दर्द बिना सूजन — बाहरी कान के दर्द का पीछे फैलना आम है; 48 घंटे में दोबारा देखें', textEn: 'Mild pain without swelling — referred pain from outer ear is common; review in 48 hrs' },
    // EAR08 q1 (idx 18)
    { questionIndex: 18, text: 'बच्चे का कान आगे झुका / उभरा हुआ — तुरंत रेफर करें (गंभीर संक्रमण का संकेत)', textEn: 'Child ear pushed forward — refer immediately (sign of serious infection)' },
    { questionIndex: 18, text: 'कान की बनावट सामान्य — निगरानी रखें; बुखार या दर्द रहे तो दोबारा दिखाएं', textEn: 'Normal ear position — monitor; revisit if fever or pain persists' },
    // EAR09 q0 (idx 19)
    { questionIndex: 19, text: 'जुकाम के बाद रात का रोना बढ़ा — कान संक्रमण संभावित; बच्चे के दोनों कान ऑटोस्कोपी से देखें', textEn: 'Night crying after cold — ear infection likely; otoscopy of both ears' },
    { questionIndex: 19, text: 'जुकाम के बिना रोना — दांत निकलने / अन्य कारण देखें', textEn: 'Crying without cold — teething / other causes' },
    // EAR09 q1 (idx 20)
    { questionIndex: 20, text: 'आवाज़ ज्यादा करता / बुलाने पर जवाब नहीं देता — सुनने की जांच जरूरी; बच्चों में कान में पानी भरना (OME) बहुत आम है', textEn: 'Turns volume up / no response — hearing test needed; glue ear (OME) very common in children' },
    { questionIndex: 20, text: 'सुनने में कोई दिक्कत नहीं दिखती — दर्द का इलाज चलेगा; 1 हफ्ते में फॉलो-अप रखें', textEn: 'No hearing difficulty apparent — treat pain; follow up in 1 week' },
    // EAR10 q0 (idx 21)
    { questionIndex: 21, text: 'चबाने / मुंह खोलने पर बढ़ता दर्द — जबड़े के जोड़ (TMJ) की समस्या; नरम खाना, गर्म सेक, गटकई बंद', textEn: 'Pain worse on chewing — jaw joint (TMJ) problem; soft diet, warm compress, no clenching' },
    { questionIndex: 21, text: 'चबाने से जुड़ा नहीं — कान की जांच पूरी करें', textEn: 'Not linked to chewing — complete the ear exam' },
    // EAR10 q1 (idx 22)
    { questionIndex: 22, text: 'जबड़े पर दर्द / क्लिक आवाज़ — TMJ; मांसपेशियों की तकिया-सलाह और दांत दोनों जांचें', textEn: 'Jaw tenderness / click — TMJ; check muscles, pillow habits and teeth' },
    { questionIndex: 22, text: 'जबड़ा सामान्य — कान के कारणों पर ध्यान दें', textEn: 'Jaw normal — focus on ear causes' },
    // EAR11 q0 (idx 23)
    { questionIndex: 23, text: 'उतरने के बाद बंद कान — दबाव अपने आप बराबर होता है; च्युइंग गम चबाते रहें, घूंट निगलें; 1-2 दिन में खुलता है', textEn: 'Blocked after landing — pressure equalizes itself; chew gum, swallow sips; opens in 1-2 days' },
    { questionIndex: 23, text: 'दर्द बंद कान के साथ बना हुआ — पर्दे पर दबाव; 2 दिन में न खुले तो जांच कराएं', textEn: 'Pain with persistent block — pressure on drum; examine if not open in 2 days' },
    // EAR11 q1 (idx 24)
    { questionIndex: 24, text: 'जुकाम में उड़ान भरी — पर्दे का छेद जोखिम में बढ़ जाता है; अगली बार उड़ने से पहले नाक खोलने की दवा डॉक्टर से लें, उतरते समय चबाते रहें', textEn: 'Flew with a cold — higher TM perforation risk; next time take a decongestant before flying, chew on descent' },
    { questionIndex: 24, text: 'जुकाम नहीं था — सामान्य दबाव-बदलाव; चबाने-निगलने से राहत मिलती है', textEn: 'No cold — ordinary pressure change; chewing/swallowing gives relief' },
    // EAR12 q0 (idx 25)
    { questionIndex: 25, text: 'कीड़ा गया है — कान में कुछ भी न डालें; तुरंत डॉक्टर के पास लाएं, जल्दी निकाला जाता है', textEn: 'Insect inside — do not put anything in the ear; bring to clinic at once, quick removal' },
    { questionIndex: 25, text: 'बीज / बटन जैसी चीज़ — घर पर निकालने की कोशिश बिल्कुल न करें, चीज़ और अंदर जाती है; डॉक्टर से निकालवाएं', textEn: 'Seed/button type — never attempt home removal, it goes deeper; doctor removal only' },
    // EAR12 q1 (idx 26)
    { questionIndex: 26, text: 'चीज़ जाने के बाद दर्द / खून / बहना — पर्दे की चोट संभावित; तुरंत जांच कराएं', textEn: 'Pain/bleeding/discharge after insertion — possible drum injury; examine now' },
    { questionIndex: 26, text: 'कोई तकलीफ नहीं फिर भी निकालना जरूरी है; रुकी हुई चीज़ आगे संक्रमण करती है', textEn: 'No symptoms — still must remove; retained foreign body causes infection later' },
    // NOS01 q0 (idx 27)
    { questionIndex: 27, text: 'एक तरफ बंद नाक — टेढ़ी शल्का (DNS) या पॉलिप की ओर देखें; एंडोस्कोपी कराएं', textEn: 'One-sided block — deviated septum or polyp; endoscopy' },
    { questionIndex: 27, text: 'दोनों तरफ बंद — एलर्जी / सूजन आम कारण; नाक स्टेरॉयड स्प्रे + रोज़ाना सलाइन डॉउचिंग', textEn: 'Both sides — allergy/inflammation common; intranasal steroid + daily saline douching' },
    // NOS01 q1 (idx 28)
    { questionIndex: 28, text: '3 महीने+ से बंद — पुरानी (क्रॉनिक) समस्या; एंडोस्कोपी + लंबा स्टेरॉयड स्प्रे कोर्स सोचें', textEn: 'Blocked 3+ months — chronic; endoscopy + longer steroid spray course' },
    { questionIndex: 28, text: 'हाल में शुरू — जुकाम / एलर्जी; भाप + सलाइन; 1 हफ्ते में न खुले तो दिखाएं', textEn: 'Recent onset — cold/allergy; steam + saline; review if beyond 1 week' },
    // NOS01 q2 (idx 29)
    { questionIndex: 29, text: 'छींके + आंखों का पानी साथ — एलर्जिक राइनाइटिस; ट्रिगर से बचें (धूल, धुआं, नमीदार कमरे)', textEn: 'Sneezing + watery eyes — allergic rhinitis; avoid triggers (dust, smoke, damp rooms)' },
    { questionIndex: 29, text: 'एलर्जी के लक्षण नहीं — संक्रमण / सूजन की जांच करें', textEn: 'No allergy symptoms — look for infection/inflammation' },
    // NOS02 q0 (idx 30)
    { questionIndex: 30, text: '10 दिन+ का जुकाम — साइनसाइटिस सोचें; पीला स्राव व चेहरे का दर्द देखें', textEn: 'Cold beyond 10 days — think sinusitis; check colored discharge and facial pain' },
    { questionIndex: 30, text: '10 दिन से कम — वायरल जुकाम; भाप, गुनगुना पानी, आराम से ठीक होता है', textEn: 'Under 10 days — viral cold; steam, warm fluids, rest' },
    // NOS02 q1 (idx 31)
    { questionIndex: 31, text: 'एंटीहिस्टामिन से राहत मिली — एलर्जी का घटक; लंबी अवधि की योजना बनाएं', textEn: 'Relief with antihistamine — allergic component; plan longer-term therapy' },
    { questionIndex: 31, text: 'कोई दवा काम नहीं कर रही — साइनस या नाक की बनावट की जांच कराएं', textEn: 'No medicine helping — investigate sinus or structural cause' },
    // NOS03 q0 (idx 32)
    { questionIndex: 32, text: 'सुबह की छींके — घर की धूल-एलर्जी (dust mite) आम; बिस्तर हर हफ्ते गर्म पानी से धोएं, गद्दे को धूल से बचाएं', textEn: 'Morning sneezing — house dust mite allergy common; wash bedding weekly in hot water, cover mattress' },
    { questionIndex: 32, text: 'दिनभर की छींके — मौसमी / बाहरी ट्रिगर; झाड़ू-पोछा व बाहर के समय पर मास्क लगाएं', textEn: 'All-day sneezing — seasonal/outdoor triggers; mask while sweeping or outdoors' },
    // NOS03 q1 (idx 33)
    { questionIndex: 33, text: 'धूल / पराग / ठंडी हवा से बढ़ता — एलर्जिक राइनाइटिस; नाक स्टेरॉयड स्प्रे 2-4 हफ्ते नियमित चलाएं', textEn: 'Dust/pollen/cold-air triggers — allergic rhinitis; intranasal steroid 2-4 weeks regularly' },
    { questionIndex: 33, text: 'कोई स्पष्ट ट्रिगर नहीं — डायरी रखें (कब बढ़ता है); एलर्जी टेस्ट सोचें', textEn: 'No clear trigger — keep a symptom diary; consider allergy testing' },
    // NOS04 q0 (idx 34)
    { questionIndex: 34, text: 'पानी जैसा बहना + छींके — एलर्जी; रात की एंटीहिस्टामिन गोली + ट्रिगर से बचाव', textEn: 'Watery discharge + sneezing — allergy; bedtime antihistamine + trigger avoidance' },
    { questionIndex: 34, text: 'एक तरफ से लगातार पानी जैसा बहना — दुर्लभ गंभीर कारण (सिर के द्रव का रिसाव) निकालना जरूरी — रेफर करें', textEn: 'Persistent one-sided watery flow — rule out rare serious cause (CSF leak) — refer' },
    // NOS04 q1 (idx 35)
    { questionIndex: 35, text: 'आंखों में जलन / पानी साथ — एलर्जी का पूरा समूह; नाक का इलाज आंखों को भी सुधारता है', textEn: 'Eye burning/watering too — full allergic cluster; treating the nose helps the eyes' },
    { questionIndex: 35, text: 'आंखें सामान्य — वायरल जुकाम की संभावना ज्यादा', textEn: 'Eyes normal — viral cold more likely' },
    // NOS05 q0 (idx 36)
    { questionIndex: 36, text: 'गाढ़ा पीला-हरा स्राव — बैक्टीरियल साइनसाइटिस संभावित; एंटीबायोटिक + नाक स्प्रे का मूल्यांकन करें', textEn: 'Thick yellow-green discharge — bacterial sinusitis likely; consider antibiotic + nasal spray' },
    { questionIndex: 36, text: 'सिर्फ एक तरफ बदबूदार स्राव — दांत की जड़ का संक्रमण या रुकी हुई चीज़ — जांच कराएं', textEn: 'One-sided foul discharge — dental root infection or retained object — investigate' },
    // NOS05 q1 (idx 37)
    { questionIndex: 37, text: 'बलगम गले में गिरता है — नाक का ही इलाज असर करता है; भाप + गरारे + नाक स्प्रे लगातार चलाएं', textEn: 'Mucus dropping into throat — treating the nose works; steam + gargles + regular nasal spray' },
    { questionIndex: 37, text: 'बलगम गले में नहीं गिरता — सामान्य स्राव; नाक फूंकने से (हल्के) राहत', textEn: 'No post-nasal drip — ordinary discharge; gentle nose blowing helps' },
    // NOS06 q0 (idx 38)
    { questionIndex: 38, text: 'झुकने पर दर्द बढ़ता — साइनस में भराव का खास लक्षण; जांच + इलाज शुरू करें', textEn: 'Pain worse bending forward — classic sinus congestion sign; evaluate and treat' },
    { questionIndex: 38, text: 'झुकने से कोई फर्क नहीं — माइग्रेन / तनाव सिरदर्द संभावित; अन्य लक्षण देखें', textEn: 'No change on bending — migraine/tension headache possible; look for other features' },
    // NOS06 q1 (idx 39)
    { questionIndex: 39, text: 'गाल / ऊपरी जबड़े का दर्द — मैक्सिलरी साइनस; दांत भी जांचवा लें (जड़ का संक्रमण वही दर्द देता है)', textEn: 'Cheek/upper jaw pain — maxillary sinus; check teeth too (root infection mimics it)' },
    { questionIndex: 39, text: 'माथे / आंखों के बीच — फ्रंटल / इथमॉइड साइनस; आंख के आस-पास सूजन या देखने में दिक्कत हो तो तुरंत रेफर', textEn: 'Forehead/between eyes — frontal/ethmoid sinus; periorbital swelling or vision trouble = urgent referral' },
    // NOS06 q2 (idx 40)
    { questionIndex: 40, text: 'बुखार + ऊपरी दांत दर्द साथ — तीव्र साइनसाइटिस; एंटीबायोटिक शुरू करने का समय', textEn: 'Fever + upper tooth pain — acute bacterial sinusitis; time to start antibiotic' },
    { questionIndex: 40, text: 'बुखार नहीं — जुकाम की भारीपन; भाप + सलाइन से अक्सर ठीक हो जाता है', textEn: 'No fever — cold-related congestion; steam + saline usually settles it' },
    // NOS07 q0 (idx 41)
    { questionIndex: 41, text: 'एक तरफ बार-बार खून — नाक की नोक के अंदर खून वाली नस (Little area) संभावित; देखकर जलाना (cautery) हो सकता है', textEn: 'Recurrent one-sided bleeds — bleeding vessel at Little area likely; cautery may be needed' },
    { questionIndex: 41, text: 'दोनों तरफ + त्वचा पर आसान चोट-नील — खून की जांच (प्लेटलेट) कराएं', textEn: 'Both sides + easy bruising — blood tests (platelets)' },
    // NOS07 q1 (idx 42)
    { questionIndex: 42, text: 'हफ्तों से बार-बार खून — BP व खून जांच जरूरी; बना रहे तो जलाने / पैकिंग के लिए रेफर करें', textEn: 'Recurring for weeks — BP + blood work needed; refer for cautery/packing if persistent' },
    { questionIndex: 42, text: 'कभी-कभी हल्का खून — जुकाम / खुजलाने से आम; नाक में वैसलीन जैसी मलहम व सलाइन रखें', textEn: 'Occasional mild bleeds — cold/picking related; nasal emollient + saline' },
    // NOS07 q2 (idx 43)
    { questionIndex: 43, text: 'दबाने पर रुक जाती — सही प्राथमिक उपचार: नाक का नरम हिस्सा 10 मिनट दबाएं, सिर आगे झुकाकर बैठें, गर्दन पर ठंडा सेक; खून पीछे निगलें नहीं', textEn: 'Stops with pressure — correct first aid: pinch soft part 10 min, lean forward, cold pack on neck; do not swallow blood back' },
    { questionIndex: 43, text: '20 मिनट+ दबाने पर भी नहीं रुक रही — इमरजेंसी: नाक पैकिंग / तुरंत रेफर चाहिए', textEn: 'Not stopping despite 20 min pressure — emergency: nasal packing / urgent referral' },
    // NOS08 q0 (idx 44)
    { questionIndex: 44, text: 'जुकाम के बाद सूंघना गया — सूजन के कारण; नाक खुलने पर कुछ हफ्तों में लौटता है; 3 महीने न आए तो रेफर', textEn: 'Smell gone after cold — inflammation; returns in weeks once nose opens; refer if 3 months' },
    { questionIndex: 44, text: 'धीरे-धीरे गया — पॉलिप / साइनस या तंत्रिका जनित; विस्तृत जांच कराएं', textEn: 'Gradual loss — polyp/sinus or neural; detailed workup' },
    // NOS08 q1 (idx 45)
    { questionIndex: 45, text: 'स्वाद भी घटा — सूंघने की नाली से जुड़ा; एंडोस्कोपी कराएं', textEn: 'Taste also reduced — smell-pathway linked; endoscopy' },
    { questionIndex: 45, text: 'स्वाद ठीक है — जुकाम वाली अस्थायी उलझन; सुधार की उम्मीद अच्छी', textEn: 'Taste normal — cold-related temporary issue; good recovery chance' },
    // NOS09 q0 (idx 46)
    { questionIndex: 46, text: 'रोज़ तेज खर्राटे + सांस रुकने की बात — निद्रा जांच (sleep study) व वजन घटाना जरूरी; शाम को नशा / नींद की गोली बंद करें', textEn: 'Daily loud snoring + witnessed apnea — sleep study + weight loss needed; stop evening sedatives/alcohol' },
    { questionIndex: 46, text: 'थकान वाले दिन ही खर्राटे — सामान्य; तकिया थोड़ा ऊंचा रखें, पीठ के बल सोएं', textEn: 'Snoring only when exhausted — normal; raise pillow, sleep on back/side' },
    // NOS09 q1 (idx 47)
    { questionIndex: 47, text: 'दिन में नींद आना — नींद की गुणवत्ता खराब का संकेत; वजन घटाएं, OSA जांच कराएं', textEn: 'Daytime sleepiness — sign of poor sleep quality; lose weight, get OSA workup' },
    { questionIndex: 47, text: 'दिन में तरोताज़ा — सामान्य खर्राटे; निगरानी रखें', textEn: 'Fresh in the day — simple snoring; keep monitoring' },
    // NOS10 q0 (idx 48)
    { questionIndex: 48, text: 'नाक बंद होने से मुंह से सांस — नाक खोलने पर ध्यान दें (सलाइन / स्प्रे); मुंह की सांस गला सूखा और खराब करती है', textEn: 'Mouth breathing due to block — open the nose (saline/spray); mouth breathing dries and irritates the throat' },
    { questionIndex: 48, text: 'बिना बंद नाक के आदत — होंठ बंद रखकर नाक से सांस का रोज़ाना अभ्यास करें', textEn: 'Habit without blockage — daily practice of nose breathing with lips closed' },
    // NOS10 q1 (idx 49)
    { questionIndex: 49, text: 'बच्चा दिन-रात मुंह खुला रखता + पढ़ाई में ध्यान कम — बढ़े एडेनॉयड व कान में पानी की जांच कराएं', textEn: 'Child mouth always open + poor attention — check enlarged adenoids and glue ear' },
    { questionIndex: 49, text: 'बच्चा सिर्फ जुकाम में मुंह से सांस लेता — सामान्य; बार-बार जुकाम पर ध्यान दें', textEn: 'Child mouth-breathes only during colds — normal; watch for frequent colds' },
    // NOS11 q0 (idx 50)
    { questionIndex: 50, text: 'महीनों से एक तरफ बंद — शल्का / पॉलिप की पुष्टि एंडोस्कोपी से कराएं', textEn: 'Months of one-sided block — confirm septum/polyp by endoscopy' },
    { questionIndex: 50, text: 'बचपन से एक तरफ — बनावट (टेढ़ी शल्का) की संभावना; इलाज व सर्जरी के विकल्प समझाएं', textEn: 'Since childhood — structural (deviated septum) likely; explain medical and surgical options' },
    // NOS11 q1 (idx 51)
    { questionIndex: 51, text: 'एक तरफ खून / बदबूदार स्राव — गंभीर कारण निकालने की जांच जरूरी — ENT रेफर करें, देर न करें', textEn: 'One-sided blood/foul discharge — workup to rule out serious cause — refer to ENT without delay' },
    { questionIndex: 51, text: 'खून / बदबू नहीं — सामान्य संरचनात्मक समस्या; नियमित जांच से आगे बढ़ें', textEn: 'No blood/foul smell — common structural issue; proceed with routine workup' },
    // NOS12 q0 (idx 52)
    { questionIndex: 52, text: 'नाक की नोक पर फुंसी — दबाएं / फोड़ें नहीं — चेहरे की नसों से जुड़ा खतरनाक इलाका है; मलहम व दवा डॉक्टर से लें', textEn: 'Boil on nose tip — never squeeze — danger area of facial veins; ointment + medicine via doctor' },
    { questionIndex: 52, text: 'लाल चित्ती बढ़ रही / बुखार — तुरंत इलाज; एंटीबायोटिक जरूरी हो सकता है', textEn: 'Spreading redness/fever — treat now; antibiotic likely needed' },
    // NOS12 q1 (idx 53)
    { questionIndex: 53, text: 'नाक खुजलाने / उंगली डालने की आदत — रोकें; इसी से नोक के अंदर छोटे छाले और पपड़ी बनती है; नाक की मलहम लगाएं', textEn: 'Nose picking — stop; it causes inner sores and crusting; use nasal ointment' },
    { questionIndex: 53, text: 'आदत नहीं है — दाद / एक्ज़िमा संभावित; जांच कराएं', textEn: 'No habit — fungal/eczema possible; examine' },
    // NOS13 q0 (idx 54)
    { questionIndex: 54, text: 'बच्चे ने नाक में कुछ डाला है — घर पर निकालने की कोशिश बिल्कुल न करें; तुरंत ENT पर लाएं', textEn: 'Child inserted object — never attempt home removal; bring to ENT immediately' },
    { questionIndex: 54, text: 'बटन / मोती जैसी चीज़ — X-ray या एंडोस्कोपी से ढूंढी जाती है; यह आम घटना है, घबराएं नहीं', textEn: 'Button/bead type — located by X-ray or endoscopy; this is common, do not panic' },
    // NOS13 q1 (idx 55)
    { questionIndex: 55, text: 'एक तरफ बदबूदार स्राव — रुकी हुई चीज़ लगभग पक्का; निकालवाना ही इलाज है', textEn: 'One-sided foul discharge — retained foreign body almost certain; removal is the treatment' },
    { questionIndex: 55, text: 'स्राव नहीं है — फिर भी जांच जरूरी; बच्चे अक्सर डालने की बात छिपा लेते हैं', textEn: 'No discharge — still examine; children often hide the insertion' },
    // THR01 q0 (idx 56)
    { questionIndex: 56, text: '3-5 दिन का गला — वायरल आम; गुनगुने नमक-पानी के गरारे + आराम से ठीक होता है', textEn: '3-5 day sore throat — usually viral; warm saline gargles + rest' },
    { questionIndex: 56, text: '1 हफ्ते+ का गला — टॉन्सिल पर मवाद / बुखार देखें; जांच जरूरी', textEn: 'Sore throat beyond 1 week — look for tonsillar pus/fever; examine' },
    // THR01 q1 (idx 57)
    { questionIndex: 57, text: 'तीखा निगलने-दर्द + तेज बुखार — बैक्टीरियल (स्ट्रेप) संभावना; एंटीबायोटिक पूरा कोर्स दें', textEn: 'Severe odynophagia + high fever — bacterial (strep) likely; full antibiotic course' },
    { questionIndex: 57, text: 'हल्का दर्द बिना बुखार — वायरल / जलन; लोजेंज + गरारे काफी', textEn: 'Mild pain without fever — viral/irritation; lozenges + gargles suffice' },
    // THR01 q2 (idx 58)
    { questionIndex: 58, text: 'धूम्रपान / गुटखा — गले की जलन और लंबी बीमारी का सबसे बड़ा कारण; छोड़ने की सलाह आज ही दें', textEn: 'Smoking/gutkha — biggest driver of throat irritation and disease; cessation advice today' },
    { questionIndex: 58, text: 'तंबाकू नहीं — अच्छा; रिफ्लक्स / जलन के कारण देखें', textEn: 'No tobacco — good; look at reflux/irritation causes' },
    // THR02 q0 (idx 59)
    { questionIndex: 59, text: 'साल में 5-7+ बार गला — पुरानी टॉन्सिलाइटिस; टॉन्सिल सर्जरी की बात ENT से करें', textEn: '5-7+ episodes/year — chronic tonsillitis; discuss tonsillectomy with ENT' },
    { questionIndex: 59, text: 'साल में 2-3 बार — सामान्य दायरे में; दांत व एडेनॉयड की जांच करा लें', textEn: '2-3 per year — within normal; check teeth and adenoids' },
    // THR02 q1 (idx 60)
    { questionIndex: 60, text: 'हर बार बुखार + टॉन्सिल सूजन — स्रोत टॉन्सिल ही; सर्जरी मूल्यांकन ENT से कराएं', textEn: 'Every episode with fever + swollen tonsils — tonsils are the source; ENT surgical evaluation' },
    { questionIndex: 60, text: 'बिना बुखार की बार-बार खराश — एलर्जी / रिफ्लक्स ज्यादा संभावित', textEn: 'Recurrent soreness without fever — allergy/reflux more likely' },
    // THR03 q0 (idx 61)
    { questionIndex: 61, text: 'टॉन्सिल पर सफेद धब्बे / मवाद — बैक्टीरियल टॉन्सिलाइटिस; एंटीबायोटिक का पूरा कोर्स', textEn: 'White patches/pus on tonsils — bacterial tonsillitis; complete the full antibiotic course' },
    { questionIndex: 61, text: 'सिर्फ लाल टॉन्सिल बिना मवाद — वायरल ज्यादा संभावित; सपोर्टिव केयर', textEn: 'Red tonsils without pus — viral more likely; supportive care' },
    // THR03 q1 (idx 62)
    { questionIndex: 62, text: 'मुंह खुलने में दिक्कत / आवाज़ दबी — क्विंसी (मवाद की थैली) की आशंका — उसी दिन ENT रेफर करें', textEn: 'Trismus/muffled voice — suspect quinsy (peritonsillar abscess) — same-day ENT referral' },
    { questionIndex: 62, text: 'मुंह पूरा खुल जाता है — सामान्य टॉन्सिलाइटिस; दर्द नियंत्रण + 48-72 घंटे में दोबारा देखें', textEn: 'Mouth opens fully — simple tonsillitis; pain control + review in 48-72 hrs' },
    // THR04 q0 (idx 63)
    { questionIndex: 63, text: 'आवाज़ 3 हफ्ते+ से भारी — लैरिंगोस्कोपी जरूरी; लंबी बैठी आवाज़ का गंभीर कारण निकालें', textEn: 'Hoarseness 3+ weeks — laryngoscopy mandatory; rule out serious cause' },
    { questionIndex: 63, text: '1 हफ्ते से कम — तीव्र लैरिंजाइटिस आम; आवाज़ विश्राम (जितना हो सके बोलना बंद) + भाप', textEn: 'Under 1 week — acute laryngitis common; voice rest + steam inhalation' },
    // THR04 q1 (idx 64)
    { questionIndex: 64, text: 'चिल्लाना / लंबा बोलना — आवाज़ की थकान; बोलने का तरीका बदलें, गुनगुना पानी ज्यादा पिएं', textEn: 'Shouting/prolonged talking — vocal strain; modify speaking style, more warm fluids' },
    { questionIndex: 64, text: 'आवाज़ के इस्तेमाल से जुड़ा नहीं — रिफ्लक्स / संक्रमण की ओर देखें', textEn: 'Not voice-use related — look at reflux/infection' },
    // THR04 q2 (idx 65)
    { questionIndex: 65, text: 'जलन / खट्टी डकार से बदतर — रिफ्लक्स लैरिंजाइटिस (LPR); रात का हल्का भोजन सोने से 3 घंटे पहले + इलाज सोचें', textEn: 'Worse with reflux — LPR; light dinner 3 hours before bed + consider treatment' },
    { questionIndex: 65, text: 'रिफ्लक्स लक्षण नहीं — सूखी हवा / एलर्जी देखें; भाप व आवाज़ विश्राम मदद करता है', textEn: 'No reflux symptoms — dry air/allergy; steam and voice rest help' },
    // THR05 q0 (idx 66)
    { questionIndex: 66, text: 'ठोस खाने से शुरू हुई दिक्कत — नाली के संकरे / रुकावट कारण निकालें — एंडोस्कोपी के लिए रेफर करें', textEn: 'Started with solids — rule out narrowing/obstruction — refer for endoscopy' },
    { questionIndex: 66, text: 'पानी से भी दिक्कत / गला घुटना — गंभीर रुकावट — तुरंत जांच कराएं', textEn: 'Trouble with liquids too / choking — severe obstruction — urgent evaluation' },
    // THR05 q1 (idx 67)
    { questionIndex: 67, text: 'एक तरफ अटकना — टॉन्सिल / गले की जगहीय कारण संभावित; मुंह की जांच करें', textEn: 'One-sided sticking — tonsillar/local cause likely; examine the mouth' },
    { questionIndex: 67, text: 'कहीं भी अटकता है — भोजन-नली की जांच कराएं', textEn: 'Sticking anywhere — esophageal evaluation' },
    // THR05 q2 (idx 68)
    { questionIndex: 68, text: 'निगलने में दिक्कत + वजन घटा — गंभीर कारण निकालना जरूरी — बिना देर रेफर करें', textEn: 'Dysphagia + weight loss — urgent workup — refer without delay' },
    { questionIndex: 68, text: 'वजन स्थिर है — चिंता कम; फिर भी 3 हफ्ते+ लक्षण रहें तो जांच कराएं', textEn: 'Weight stable — less concern; still investigate if symptoms 3+ weeks' },
    // THR06 q0 (idx 69)
    { questionIndex: 69, text: 'सिर्फ अटका-सा एहसास, निगलने में असली दिक्कत नहीं — ग्लोबस आम और निर्दोष; तनाव व रिफ्लक्स से जुड़ा; भरोसा दिलाएं', textEn: 'Only a lump feeling, no true swallow trouble — globus is common and benign; reassure' },
    { questionIndex: 69, text: 'निगलने में असली दिक्कत भी है — ग्लोबस नहीं मानें; जांच कराएं', textEn: 'Actual swallowing trouble too — not globus; investigate' },
    // THR06 q1 (idx 70)
    { questionIndex: 70, text: 'तनाव / खाली पेट पर ज्यादा — ग्लोबस + रिफ्लक्स का मिश्रण; तनाव-प्रबंधन व रिफ्लक्स इलाज', textEn: 'Worse with stress/empty stomach — globus + reflux mix; stress care + reflux treatment' },
    { questionIndex: 70, text: 'किसी पैटर्न से नहीं बदलता — स्थिर; बढ़े तो जांच कराएं', textEn: 'No pattern — stable; investigate if it worsens' },
    // THR07 q0 (idx 71)
    { questionIndex: 71, text: 'सुबह का सूखापन — मुंह से सांस / रिफ्लक्स का संकेत; बिस्तर पर पानी रखें, तकिया ऊंचा करें', textEn: 'Morning dryness — mouth breathing/reflux sign; water at bedside, raise pillow' },
    { questionIndex: 71, text: 'दिनभर सूखापन — पानी कम / एसी हवा; पानी व गुनगुने तरल बढ़ाएं', textEn: 'All-day dryness — low water/AC air; increase fluids' },
    // THR07 q1 (idx 72)
    { questionIndex: 72, text: 'एसी / पंखे की सीधी हवा सारी रात — गला सूखता है; हवा की दिशा बदलें, नमी रखें', textEn: 'Direct AC/fan air all night — dries throat; redirect airflow, humidify' },
    { questionIndex: 72, text: 'पानी पीते हैं फिर भी सूखा — दवा / शुगर की जांच करा लें', textEn: 'Drinking water yet dry — check medicines/sugar' },
    // THR08 q0 (idx 73)
    { questionIndex: 73, text: 'हर महीने छाले — तनाव / खाने (बादाम, चॉकलेट, तीखा) से जुड़ा आम; B-विटामिन मदद करते हैं, ट्रिगर घटाएं', textEn: 'Monthly ulcers — stress/food linked; B vitamins help, reduce triggers' },
    { questionIndex: 73, text: 'महीने में 1-2 बार — सामान्य दायरे; गरारे व जल मदद करते हैं', textEn: 'Once-twice a month — normal range; gargles and gel soothe' },
    // THR08 q1 (idx 74)
    { questionIndex: 74, text: '2 हफ्ते+ का न भरता छाला — बायोप्सी के लिए रेफर जरूरी (गंभीर कारण निकालना होता है)', textEn: 'Non-healing ulcer 2+ weeks — refer for biopsy (serious cause must be excluded)' },
    { questionIndex: 74, text: 'सब छाले 7-10 दिन में भर जाते हैं — सुरक्षित; ट्रिगर नोट करते रहें', textEn: 'All ulcers heal in 7-10 days — reassuring; keep noting triggers' },
    // THR09 q0 (idx 75)
    { questionIndex: 75, text: 'दांतों की सफाई / मसूड़ों का खून — दंत चिकित्सक दिखाएं; दांत बदबू का सबसे आम कारण हैं', textEn: 'Poor dental care/bleeding gums — see a dentist; commonest cause of bad breath' },
    { questionIndex: 75, text: 'दांत ठीक हैं — जीभ की सफाई + खूब पानी पीना शुरू करें', textEn: 'Teeth fine — tongue cleaning + drink more water' },
    // THR09 q1 (idx 76)
    { questionIndex: 76, text: 'नाक का बलगम गले में — उसी से बदबू बनती है; नाक का इलाज (सलाइन डॉउच + स्प्रे) चलाएं', textEn: 'Post-nasal drip — it causes the odour; treat the nose (saline douche + spray)' },
    { questionIndex: 76, text: 'टॉन्सिल में सफेद दाने (पत्थर) — गरारे व गले की सफाई; बार-बार हों तो ENT दिखाएं', textEn: 'White debris in tonsils (stones) — gargles and throat hygiene; ENT if recurrent' },
    // THR10 q0 (idx 77)
    { questionIndex: 77, text: 'मछली कांटा / हड्डी — रोटी निगलकर उतारने की कोशिश न करें (और अंदर धकेलती है); तुरंत ENT पर जाएं', textEn: 'Fish bone/bone — do not swallow bread to push it down; go to ENT now' },
    { questionIndex: 77, text: 'कांटा दिखता भी हो तो चिमटी से खुद न निकालें — प्रोफेशनल निकालाई ही सही', textEn: 'Even if the bone is visible, no self-removal with tweezers — professional removal only' },
    // THR10 q1 (idx 78)
    { questionIndex: 78, text: 'निगलने पर एक जगह तेज दर्द + लार टपकना — कांटा फंसा हुआ; आज ही निकालवाएं — छोड़ने से संक्रमण', textEn: 'Sharp one-spot pain on swallowing + drooling — impacted bone; remove today — delay infects' },
    { questionIndex: 78, text: 'दर्द घट गया / घिसक गया शायद — फिर भी दर्द रहे तो 24 घंटे में देखा जाए', textEn: 'Pain reduced — may have passed; still review in 24 hrs if pain persists' },
    // THR11 q0 (idx 79)
    { questionIndex: 79, text: 'बलगम पीछे से आता है — नाक का इलाज ही हल है: सलाइन डॉउचिंग + स्प्रे; गला खंखारने से राहत नहीं मिलती', textEn: 'Post-nasal drip — treating the nose is the answer: saline douching + spray; throat clearing does not help' },
    { questionIndex: 79, text: 'बलगम गले के नीचे से लगता है — रिफ्लक्स भी कारण हो सकता है; रात का भोजन 3 घंटे पहले खाएं', textEn: 'Mucus feels rising from below — reflux can cause it; dinner 3 hours before bed' },
    // THR11 q1 (idx 80)
    { questionIndex: 80, text: 'रात-सुबह गला साफ करना — एलर्जी / बहाव का चित्र; गरारे + नाक का इलाज', textEn: 'Night-morning throat clearing — allergy/drip picture; gargles + nasal treatment' },
    { questionIndex: 80, text: 'दिनभर खंखार — एसिड / एलर्जी का मिश्रण; दोनों की जांच करें', textEn: 'All-day clearing — acid/allergy mix; address both' },
    // VER01 q0 (idx 81)
    { questionIndex: 81, text: 'कमरा घूमता महसूस — कान (भीतरी कान) का चक्कर; आगे की जांच जारी रखें', textEn: 'Room spins — inner-ear vertigo; continue the workup' },
    { questionIndex: 81, text: 'बस हल्कापन / अंधेरा — BP, शुगर व खून की कमी देखें', textEn: 'Just light-headedness/blackout — check BP, sugar and anemia' },
    // VER01 q1 (idx 82)
    { questionIndex: 82, text: 'लेटते-उठते / सिर घुमाने पर सेकंडों का चक्कर — BPPV लगभग पक्का; Epley maneuver कराएं — अक्सर तुरंत राहत', textEn: 'Positional seconds-long spins — BPPV almost certain; Epley maneuver — often instant relief' },
    { questionIndex: 82, text: 'पोज़िशन से जुड़ा नहीं — अन्य कारण (मेनियर / तंत्रिका) — विस्तृत जांच करें', textEn: 'Not positional — other causes (Meniere/neural) — detailed workup' },
    // VER01 q2 (idx 83)
    { questionIndex: 83, text: 'सेकंडों का हमला — BPPV; बहुत आम; Epley + संतुलन की सावधानी', textEn: 'Seconds-long attacks — BPPV; very common; Epley + balance precautions' },
    { questionIndex: 83, text: 'घंटों का हमला + कान भरा / भजन — मेनियर जैसा — ENT रेफर (ऑडियोमेट्री सहित)', textEn: 'Hours-long attacks + ear fullness/ringing — Meniere-like — ENT referral (with audiometry)' },
    // VER01 q3 (idx 84)
    { questionIndex: 84, text: 'चक्कर + एक तरफ कान के लक्षण — भीतरी कान की बीमारी — ENT रेफर करें', textEn: 'Vertigo + one-sided ear symptoms — inner-ear disease — refer to ENT' },
    { questionIndex: 84, text: 'चक्कर के साथ बोली लड़ना, हाथ-पैर की कमजोरी, चलते-चलते गिरना — दिमागी कारण — EMERGENCY न्यूरो रेफर', textEn: 'Vertigo with slurred speech, limb weakness or falls — central cause — EMERGENCY neuro referral' },
    // VER02 q0 (idx 85)
    { questionIndex: 85, text: 'गिल्टी बढ़ रही है (कुछ हफ्तों से) — अल्ट्रासाउंड / FNAC कराएं — देर न करें', textEn: 'Growing lump over weeks — get USG/FNAC — do not delay' },
    { questionIndex: 85, text: 'जैसी की तैसी छोटी गिल्टी — वसा / त्वचा की गांठ संभावित; फिर भी एक बार देखा जाए', textEn: 'Static small lump — sebaceous/fatty nodule likely; still get examined once' },
    // VER02 q1 (idx 86)
    { questionIndex: 86, text: 'दर्द + बुखार के साथ आई — संक्रमण की गिल्टी; इलाज से ठीक होती है', textEn: 'Came with pain + fever — infective node; resolves with treatment' },
    { questionIndex: 86, text: 'बिना दर्द की पत्थर-सी गिल्टी — गंभीर कारण निकालना जरूरी — रेफर करें', textEn: 'Painless hard node — rule out serious cause — refer' },
    // VER02 q2 (idx 87)
    { questionIndex: 87, text: 'तंबाकू / धूम्रपान / शराब + गर्दन की गिल्टी — उच्च जोखिम — आज ही ENT रेफर करें (बायोप्सी का विचार)', textEn: 'Tobacco/smoking/alcohol + neck lump — high risk — refer to ENT today (biopsy consideration)' },
    { questionIndex: 87, text: 'कोई नशा नहीं — जोखिम कम; फिर भी बढ़े तो तुरंत जांच', textEn: 'No habits — lower risk; still investigate promptly if it grows' },
    // VER03 q0 (idx 88)
    { questionIndex: 88, text: 'अचानक झुकाव — बेल पाल्सी आम; आंख पूरी बंद नहीं हो रही तो आंख की सुरक्षा (पैच / बूंदें) + उसी दिन डॉक्टर — जल्दी इलाज असर करता है', textEn: 'Sudden droop — Bell palsy common; eye protection (patch/drops) if eye will not close + same-day doctor — early treatment matters' },
    { questionIndex: 88, text: 'धीरे-धीरे आया — अन्य गंभीर कारण — विस्तृत जांच जरूरी', textEn: 'Gradual onset — other serious causes — detailed workup needed' },
    // VER03 q1 (idx 89)
    { questionIndex: 89, text: 'कान दर्द + कान / मुंह में छाले — रामसे हंट सिंड्रोम — तुरंत डॉक्टर; देर से इलाज सुनने पर असर डाल सकता है', textEn: 'Ear pain + vesicles in ear/mouth — Ramsey Hunt syndrome — urgent doctor; delay risks hearing' },
    { questionIndex: 89, text: 'छाले नहीं — बेल पाल्सी ज्यादा संभावित; आंख की देखभाल व जल्दी इलाज सुनिश्चित करें', textEn: 'No vesicles — Bell palsy more likely; ensure eye care and early treatment' },
    // VER04 q0 (idx 90)
    { questionIndex: 90, text: 'खाने पर सूजन / दर्द बढ़ता है — लार ग्रंथि (पैरोटिड) की बात — जांच कराएं', textEn: 'Swelling/pain worse with meals — salivary gland issue — investigate' },
    { questionIndex: 90, text: 'भोजन से जुड़ा नहीं — गिल्टी / अन्य संभावना; जांच करें', textEn: 'Not meal-related — node/other possibility; examine' },
    // VER04 q1 (idx 91)
    { questionIndex: 91, text: 'बुखार के साथ गाल की सूजन — लार ग्रंथि संक्रमण / कण्ठमाला — इलाज + अलग बर्तन व आराम', textEn: 'Fever with cheek swelling — parotitis/mumps — treatment + separate utensils and rest' },
    { questionIndex: 91, text: 'बुखार नहीं — पुरानी सूजन — पत्थर / नली की जांच कराएं', textEn: 'No fever — chronic swelling — stone/duct workup' },
    // VER05 q0 (idx 92)
    { questionIndex: 92, text: 'एक तरफ बिजली जैसा चुभन — ट्राइजेमिनल तंत्रिका की बात — न्यूरो / ENT जांच कराएं', textEn: 'One-sided electric jolts — trigeminal neuralgia — neuro/ENT evaluation' },
    { questionIndex: 92, text: 'भारी / दबाव जैसा दर्द — साइनस / दांत ज्यादा संभावित; पहले वही जांचें', textEn: 'Aching/pressure type — sinus/dental more likely; check those first' },
    // VER05 q1 (idx 93)
    { questionIndex: 93, text: 'चबाने / ठंडा-गरम से बढ़ता — दांत की जड़ की जांच पहले कराएं', textEn: 'Worse on chewing/hot-cold — get the dental check first' },
    { questionIndex: 93, text: 'भोजन से नहीं बदलता — तंत्रिका / साइनस की ओर जांच जारी रखें', textEn: 'Unchanged by food — continue nerve/sinus workup' },
    // OTH01 q0 (idx 94)
    { questionIndex: 94, text: '18 महीने+ में शब्द नहीं — सुनने की जांच सबसे पहले; बच्चों में कान में पानी (glue ear) आम कारण है', textEn: 'No words by 18 months — hearing test first; glue ear is a common cause' },
    { questionIndex: 94, text: 'कुछ शब्द बोल लेता है — सुनना अक्सर ठीक होता है; विकास-निगरानी जारी रखें', textEn: 'Says a few words — hearing usually fine; continue developmental monitoring' },
    // OTH01 q1 (idx 95)
    { questionIndex: 95, text: 'आवाज़ पर ध्यान नहीं देता — सुनने की समस्या की संभावना ज्यादा — ऑडियोमेट्री + कान की जांच जल्द कराएं', textEn: 'Ignores sounds — hearing problem more likely — audiometry + ear exam soon' },
    { questionIndex: 95, text: 'आवाज़ पर देख लेता है — सुनना संभवतः ठीक; वाणी-विकास की सलाह लें', textEn: 'Turns to sounds — hearing likely fine; take speech-development guidance' },
    // OTH02 q0 (idx 96)
    { questionIndex: 96, text: 'सांस रुक-रुक जाना + चौंक कर जागना — निद्रा-एपनिया की जांच (sleep study) जरूरी; वजन घटाना शुरू करें', textEn: 'Breathing pauses + gasping arousal — sleep study needed; begin weight reduction' },
    { questionIndex: 96, text: 'रुकने की शिकायत नहीं — सामान्य खर्राटे; तकिया व सोने की पोज़िशन सुधारें', textEn: 'No pauses reported — simple snoring; improve pillow and sleep position' },
    // OTH02 q1 (idx 97)
    { questionIndex: 97, text: 'सुबह सिरदर्द + दिन की नींद — निद्रा-एपनिया के लक्षण — जांच कराएं', textEn: 'Morning headache + daytime sleepiness — OSA symptoms — get tested' },
    { questionIndex: 97, text: 'सुबह तरोताज़ा — अच्छा; खर्राटों की निगरानी रखें', textEn: 'Fresh mornings — reassuring; keep monitoring snoring' },
    // OTH03 q0 (idx 98)
    { questionIndex: 98, text: 'टॉन्सिल ऑपरेशन — 2 हफ्ते तक कुरकुरा / मसालेदार खाना बंद; दर्द कान में जाना आम है, घबराएं नहीं', textEn: 'Tonsil surgery — no crispy/spicy food for 2 weeks; ear pain referral is common, do not worry' },
    { questionIndex: 98, text: 'नाक / साइनस ऑपरेशन — सलाइन नाक-धोना जारी रखें; तेज नाक फूंकना और भारी वजन उठाना बंद', textEn: 'Nose/sinus surgery — continue saline irrigation; no forceful nose blowing or heavy lifting' },
    // OTH03 q1 (idx 99)
    { questionIndex: 99, text: 'ऑपरेशन के बाद खून / बढ़ता दर्द — तुरंत संपर्क करें (टॉन्सिल में खून 5-7 दिन पर भी आ सकता है)', textEn: 'Post-op bleeding / worsening pain — contact immediately (tonsil bleed can occur even on day 5-7)' },
    { questionIndex: 99, text: 'रिकवरी सामान्य — बताई गई फॉलो-अप तारीख पर आएं', textEn: 'Routine recovery — come on the scheduled follow-up date' },
  ],

  // ══ Labels — vitals (8) ═══════════════════════════════════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
  ],

  // ══ Findings (26) ═════════════════════════════════════════════════════
  // Refer-only findings (NO medicine links, deliberate): SNHL-SUSPECT,
  // MENIERE-SUSPECT, NASAL-POLYP-SUSPECT, OSA-SUSPECT, QUINSY-SUSPECT,
  // CERVICAL-LYMPHA, DNS-TURB — screen/refer/surgery-eval pathways,
  // never medicine-only.
  findings: [
    { key: 'AOM', name: 'तीव्र मध्य कान संक्रमण (AOM)', nameEn: 'Acute Otitis Media', icd10: 'H66.0' },
    { key: 'CSOM-ACT', name: 'पुराना कान बहना, सक्रिय (CSOM)', nameEn: 'Chronic Suppurative Otitis Media (Active)', icd10: 'H66.1' },
    { key: 'OE-BACT', name: 'बाहरी कान संक्रमण (जीवाणु)', nameEn: 'Acute Bacterial Otitis Externa', icd10: 'H60.9' },
    { key: 'OE-FUNG', name: 'कान की फफूंदी (Otomycosis)', nameEn: 'Fungal Otitis Externa (Otomycosis)', icd10: 'H60.3' },
    { key: 'WAX-IMPACT', name: 'जमा हुआ कान का मैल', nameEn: 'Impacted Ear Wax (Cerumen)', icd10: 'H61.2' },
    { key: 'TM-PERF', name: 'कान के पर्दे में छेद (आघातज)', nameEn: 'Traumatic TM Perforation', icd10: 'S09.2' },
    { key: 'OME-ETD', name: 'नाक-कान नाली बिगड़ना / कान में पानी (ETD/OME)', nameEn: 'Eustachian Tube Dysfunction / Otitis Media with Effusion', icd10: 'H69.8' },
    { key: 'SNHL-SUSPECT', name: 'तंत्रिका-जनित कम सुनाई (संदेह — तुरंत रेफर)', nameEn: 'Suspected Sensorineural Hearing Loss (Refer Urgently)', icd10: 'H90.3' },
    { key: 'VERTIGO-BPPV', name: 'स्थिति-जनित चक्कर (BPPV)', nameEn: 'Benign Paroxysmal Positional Vertigo (BPPV)', icd10: 'H81.1' },
    { key: 'MENIERE-SUSPECT', name: 'मेनियर जैसा चित्र (संदेह — रेफर)', nameEn: 'Meniere-like Symptoms (Refer)', icd10: 'H81.0' },
    { key: 'AR', name: 'एलर्जिक राइनाइटिस', nameEn: 'Allergic Rhinitis', icd10: 'J30.4' },
    { key: 'ACUTE-SINUSITIS', name: 'तीव्र साइनसाइटिस', nameEn: 'Acute Sinusitis', icd10: 'J01.9' },
    { key: 'CHRONIC-SINUSITIS', name: 'पुरानी साइनसाइटिस', nameEn: 'Chronic Sinusitis', icd10: 'J32.9' },
    { key: 'RHINITIS-MEDIC', name: 'नाक की बूंदों से जुड़ा दुष्चक्र (Rhinitis Medicamentosa)', nameEn: 'Rhinitis Medicamentosa (Decongestant Overuse)', icd10: 'J31.0' },
    { key: 'EPISTAXIS-MGD', name: 'नाक से खून (प्रबंधित)', nameEn: 'Epistaxis (Managed)', icd10: 'R04.0' },
    { key: 'NASAL-VESTIBULITIS', name: 'नाक की नोक का संक्रमण', nameEn: 'Nasal Vestibulitis', icd10: 'J34.8' },
    { key: 'DNS-TURB', name: 'टेढ़ी नाक-शल्का / बड़े टर्बिनेट', nameEn: 'Deviated Nasal Septum / Turbinate Hypertrophy', icd10: 'J34.2' },
    { key: 'NASAL-POLYP-SUSPECT', name: 'नाक पॉलिप (संदेह — एंडोस्कोपी/रेफर)', nameEn: 'Suspected Nasal Polyp (Endoscopy/Refer)', icd10: 'J33.9' },
    { key: 'OSA-SUSPECT', name: 'निद्रा में सांस रुकने की आशंका (OSA स्क्रीन)', nameEn: 'Suspected Obstructive Sleep Apnea (Screen)', icd10: 'G47.33' },
    { key: 'ACUTE-TONSILLITIS', name: 'तीव्र टॉन्सिलाइटिस', nameEn: 'Acute Tonsillitis', icd10: 'J03.9' },
    { key: 'CHRONIC-TONSILLITIS', name: 'पुरानी / बार-बार टॉन्सिलाइटिस (सर्जरी मूल्यांकन)', nameEn: 'Chronic / Recurrent Tonsillitis (Surgery Evaluation)', icd10: 'J35.01' },
    { key: 'ACUTE-PHARYNGITIS', name: 'तीव्र ग्रसनी शोथ (गला संक्रमण)', nameEn: 'Acute Pharyngitis', icd10: 'J02.9' },
    { key: 'ACUTE-LARYNGITIS', name: 'तीव्र स्वर-यंत्र शोथ (लैरिंजाइटिस)', nameEn: 'Acute Laryngitis', icd10: 'J04.0' },
    { key: 'LPR', name: 'रिफ्लक्स स्वर-यंत्र शोथ (LPR)', nameEn: 'Laryngopharyngeal Reflux (LPR)', icd10: 'J37.0' },
    { key: 'QUINSY-SUSPECT', name: 'टॉन्सिल के पास मवाद (क्विंसी संदेह — रेफर)', nameEn: 'Suspected Peritonsillar Abscess (Quinsy — Refer)', icd10: 'J36' },
    { key: 'CERVICAL-LYMPHA', name: 'गर्दन की गिल्टी (स्क्रीन / जांच)', nameEn: 'Cervical Lymphadenopathy (Screen)', icd10: 'R59.9' },
  ],

  // ══ Medicines (61) — India ENT core ═══════════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense qty.
  // ⚠ NO aminoglycoside ear drops (gentamicin/framycetin/neomycin) — ototoxic
  // through a perforated TM; quinolone (Ciplox) is the perforation-safe drop.
  // All flags.verified = false until MBBS review (unverified-dose mode).
  medicines: [
    // ── Ear drops ──
    { name: 'Ciplox Ear Drops 10ml', salt: 'Ciprofloxacin 0.3% w/v ear drops — कान के पर्दे में छेद (perforation) होने पर भी सुरक्षित विकल्प (quinolone); aminoglycoside बूंदें (gentamicin आदि) ototoxic होती हैं — यही चुनें', doseOptions: ['2-3 बूंद रोज़ाना 2 बार', '3-4 बूंद रोज़ाना 3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Candibiotic Ear Drops 5ml', salt: 'Chloramphenicol 5% + Beclometasone 0.025% + Clotrimazole 1% + Lidocaine 2% — कान के पर्दे में छेद की आशंका हो तो न डालें — quinolone (Ciplox) चुनें', doseOptions: ['2-3 बूंद रोज़ाना 3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Candid Ear Drops 5ml', salt: 'Clotrimazole 1% w/v ear drops — कान की फफूंदी (otomycosis) के लिए; कान सूखा रखें, पानी न जाने दें', doseOptions: ['2-3 बूंद रोज़ाना 3-4 बार'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Soliwax Ear Drops 10ml', salt: 'Paradichlorobenzene 2% + Benzocaine 2.6% + Turpentine Oil 15% — जमे कान-मैल (wax) को पगलाने वाली बूंदें', doseOptions: ['3-5 बूंद रोज़ाना 3 बार × 3-5 दिन'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Otorex Ear Drops 10ml', salt: 'Paradichlorobenzene + Benzocaine + Turpentine Oil — मैल-पगलाने वाली बूंदें (Soliwax का विकल्प)', doseOptions: ['3-5 बूंद रोज़ाना 3 बार × 3-5 दिन'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Candid Mouth Paint 15ml', salt: 'Clotrimazole 1% mouth paint — मुंह के छालों / सफेद परत (oral thrush) पर लगाएं; लगाने के बाद 30 मिनट कुछ न खाएं', doseOptions: ['0.5-1 मिली प्रभावित जगह पर दिन में 3-4 बार'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Nasal steroid sprays ──
    { name: 'Flomist Nasal Spray', salt: 'Fluticasone Furoate 27.5 mcg per spray — एलर्जिक राइनाइटिस / नाक की सूजन में रोज़ाना; पूरा असर 1-2 हफ्ते में, बीच में बंद न करें; स्प्रे की नोज़ल नाक की दीवार की ओर रखें', doseOptions: ['1 स्प्रे हर नथुने में रोज़ाना 1 बार', '2 स्प्रे हर नथुने में रोज़ाना 1 बार'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Avamys Nasal Spray', salt: 'Fluticasone Furoate 27.5 mcg — एलर्जिक राइनाइटिस का रोज़ाना स्प्रे (Flomist का विकल्प ब्रांड)', doseOptions: ['1-2 स्प्रे हर नथुने में रोज़ाना 1 बार'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Metatop Nasal Spray', salt: 'Mometasone Furoate 50 mcg per spray — एलर्जी / पॉलिप / पुरानी साइनस में रोज़ाना; लगातार देने पर ही असर', doseOptions: ['1 स्प्रे हर नथुने में रोज़ाना 2 बार', '2 स्प्रे हर नथुने में रात को'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Flixonase Aqueous Nasal Spray', salt: 'Fluticasone Propionate 50 mcg per spray — एलर्जिक व पुरानी राइनाइटिस का स्प्रे', doseOptions: ['1-2 स्प्रे हर नथुने में रोज़ाना 1-2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },
    { name: 'Duonase Nasal Spray', salt: 'Azelastine 140 mcg + Fluticasone 50 mcg per spray — मध्यम-गंभीर एलर्जिक राइनाइटिस; हल्का कड़वा स्वाद सामान्य है', doseOptions: ['1 स्प्रे हर नथुने में रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'H', verified: false } },

    // ── Nasal decongestants (⚠ max 5-7 days — rhinitis medicamentosa) ──
    { name: 'Nasivion 0.05% Nose Drops 10ml', salt: 'Oxymetazoline 0.05% (वयस्क) — ⚠ अधिकतम 5-7 दिन ही! ज्यादा दिन लगाने से नाक दवा के बिना फिर बंद होने लगता है (rhinitis medicamentosa)', doseOptions: ['2-3 बूंद हर नथुने में रोज़ाना 2-3 बार', '2 बूंद हर नथुने में रात को सोते समय'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nasivion 0.025% Nose Drops 10ml', salt: 'Oxymetazoline 0.025% (बच्चों की खुराक) — ⚠ अधिकतम 5-7 दिन; खुराक डॉक्टर से पूछकर', doseOptions: ['1-2 बूंद हर नथुने में रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Nasivion Mini 0.01% Nose Drops 10ml', salt: 'Oxymetazoline 0.01% (शिशुओं के लिए) — ⚠ अधिकतम 5-7 दिन; डॉक्टर की सलाह से ही', doseOptions: ['1 बूंद हर नथुने में रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Otrivin 0.1% Nasal Spray', salt: 'Xylometazoline 0.1% (12 वर्ष+) — ⚠ अधिकतम 5-7 दिन! ज्यादा इस्तेमाल से नाक वापस बंद (rebound congestion)', doseOptions: ['1 स्प्रे हर नथुने में रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Saline / sea-water nasal (safe, unlimited duration) ──
    { name: 'Sinomarin Nasal Spray 100ml', salt: 'समुद्री जल (isotonic sea water) नाक स्प्रे — दवा नहीं; नाक धोने (douching) के लिए रोज़ाना सुरक्षित', doseOptions: ['1-2 स्प्रे हर नथुने में रोज़ाना 2-4 बार'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Otrivin Baby Saline Nasal Drops 10ml', salt: 'सलाइन (समुद्री जल) बूंदें — शिशु / छोटे बच्चों के जुकाम में नाक साफ रखने के लिए; दवा नहीं, बार-बार दे सकते हैं', doseOptions: ['1-2 बूंद हर नथुने में जरूरत पड़ने पर (दिन में 4-6 बार तक)'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Antihistamines / montelukast ──
    { name: 'Cetzine 10 Tablet', salt: 'Cetirizine 10 mg — एलर्जी / छींक / नाक बहना; नींद आ सकती है — गाड़ी सावधानी से', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Alerid 10 Tablet', salt: 'Cetirizine 10 mg — एलर्जी का आर्थिक विकल्प; नींद आ सकती है', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Levocet 5 Tablet', salt: 'Levocetirizine 5 mg — एलर्जिक राइनाइटिस / खुजली; हल्की नींद संभव, रात को लें', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Teczine 5 Tablet', salt: 'Levocetirizine 5 mg — एलर्जी / पित्ती; रात को एक गोली', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Montair 10 Tablet', salt: 'Montelukast 10 mg — एलर्जिक राइनाइटिस (वयस्क); मूड / नींद में बदलाव दिखे तो डॉक्टर को बताएं', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Montair LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg — एलर्जिक राइनाइटिस / नाक-आंख एलर्जी; रात को एक गोली', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Montair FX Tablet', salt: 'Fexofenadine 120 mg + Montelukast 10 mg — एलर्जी का बिना-नींद वाला कॉम्बो', doseOptions: ['1 गोली रात को'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Allegra 120 Tablet', salt: 'Fexofenadine 120 mg — एलर्जी; नींद नहीं लाता (non-sedating); सेब के जूस के साथ न लें', doseOptions: ['1 गोली रोज़ाना 1-2 बार'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Allegra 180 Tablet', salt: 'Fexofenadine 180 mg — लंबी एलर्जी / पित्ती में दिन में एक बार', doseOptions: ['1 गोली रोज़ाना 1 बार'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Montair LC Kid Syrup', salt: 'Montelukast 4 mg + Levocetirizine 2.5 mg per 5 ml — बच्चों की नाक-एलर्जी; खुराक वजन के अनुसार', doseOptions: ['2.5 ml रात को', '5 ml रात को'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'na', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // ── Cold combo ──
    { name: 'Sinarest Tablet', salt: 'Paracetamol 325 mg + Chlorpheniramine 2 mg + Phenylephrine 5 mg — जुकाम / नाक बंद / हल्का बुखार; नींद ला सकता है — गाड़ी / मशीन न चलाएं; BP मरीज़ डॉक्टर से पूछें', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Antibiotics (ENT core) ──
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — कान / गला / साइनस के बैक्टीरियल संक्रमण; कोर्स पूरा करें', doseOptions: ['1 गोली रोज़ाना 2 बार', '1 गोली रोज़ाना 3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Augmentin 375 Tablet', salt: 'Amoxicillin 250 mg + Clavulanic Acid 125 mg — हल्के संक्रमण में कम खुराक', doseOptions: ['1 गोली रोज़ाना 3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Augmentin 1gm Duo Tablet', salt: 'Amoxicillin 875 mg + Clavulanic Acid 125 mg — गंभीर साइनस / गला संक्रमण में दिन में 2 बार', doseOptions: ['1 गोली रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Clavam 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic Acid 125 mg — कान / गला / साइनस संक्रमण (विकल्प ब्रांड)', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Mox 500 Tablet', salt: 'Amoxicillin 500 mg (साधारण पेनिसिलिन, NLEM) — कान / गले के हल्के संक्रमण', doseOptions: ['1 कैप्सूल रोज़ाना 3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Taxim-O 200 Tablet', salt: 'Cefixime 200 mg — कान / टॉन्सिल / साइनस संक्रमण; रोज़ाना 2 बार', doseOptions: ['1 गोली रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ceftum 500 Tablet', salt: 'Cefuroxime 500 mg — साइनसाइटिस / गला संक्रमण; भोजन के साथ लें', doseOptions: ['1 गोली रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg — टॉन्सिल / गला संक्रमण; 3 दिन का कोर्स, भोजन से 1 घंटा पहले या 2 घंटे बाद', doseOptions: ['1 गोली रोज़ाना 1 बार × 3 दिन'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 200 Suspension', salt: 'Azithromycin 200 mg/5 ml — बच्चों के कान / गला संक्रमण; खुराक वजन के अनुसार', doseOptions: ['5 ml रोज़ाना 1 बार × 3 दिन', '7.5 ml रोज़ाना 1 बार × 3 दिन', '10 ml रोज़ाना 1 बार × 3 दिन'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Clavam 228.5 Dry Syrup', salt: 'Amoxicillin 200 mg + Clavulanic Acid 28.5 mg per 5 ml — बच्चों का कान / गला संक्रमण; खुराक वजन के अनुसार, शेक करके दें', doseOptions: ['5 ml रोज़ाना 2 बार', '7.5 ml रोज़ाना 2 बार', '10 ml रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // ── Mucolytic ──
    { name: 'Mucolite Syrup 100ml', salt: 'Ambroxol 30 mg/5 ml — गाढ़े बलगम / साइनस स्राव को पतला करता है; भरपूर पानी पिएं', doseOptions: ['10 ml रोज़ाना 2-3 बार', '5 ml रोज़ाना 2-3 बार (बच्चे)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },
    { name: 'Ambrodil Syrup 100ml', salt: 'Ambroxol 30 mg/5 ml — बलगम पतला करने वाला विकल्प ब्रांड', doseOptions: ['10 ml रोज़ाना 2-3 बार', '5 ml रोज़ाना 2-3 बार (बच्चे)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'fixed', schedule: 'OTC', verified: false } },

    // ── Analgesic / antipyretic ──
    { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650 mg — कान / गले / साइनस के दर्द और बुखार; 24 घंटे में अधिकतम 3 गोली', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zerodol-P Tablet', salt: 'Aceclofenac 100 mg + Paracetamol 325 mg — तेज कान-दर्द / साइनस दर्द; भोजन के बाद ही लें', doseOptions: ['1 गोली रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Combiflam Tablet', salt: 'Ibuprofen 400 mg + Paracetamol 325 mg — दर्द / बुखार; खाने के बाद लें, खाली पेट नहीं', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calpol 250 Suspension', salt: 'Paracetamol 250 mg/5 ml — बच्चों का कान-दर्द / बुखार; खुराक वजन के अनुसार (15 mg/kg)', doseOptions: ['5 ml (250 mg)', '7.5 ml', '10 ml'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'weight-based', schedule: 'OTC', verified: false } },

    // ── Throat topicals ──
    { name: 'Tantum Oral Rinse 120ml', salt: 'Benzydamine 0.15% oral rinse — गले के दर्द / सूजन में कुल्ला; निगलें नहीं, 30 सेकंड कुल्ला करके थूक दें', doseOptions: ['15 ml कुल्ला रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Betadine Gargle 100ml', salt: 'Povidone-Iodine 2% gargle — गले के संक्रमण में; 10 ml आधे गिलास गुनगुने पानी में मिलाकर कुल्ला; निगलें नहीं', doseOptions: ['10 ml आधे गिलास पानी में, रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Hexigel 15g', salt: 'Chlorhexidine Gluconate topical gel — मुंह / मसूड़ों के छालों पर पतली परत लगाएं; लगाने के बाद 30 मिनट कुछ न खाएं', doseOptions: ['प्रभावित जगह पर दिन में 2-3 बार पतली परत'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Strepsils Lozenges 16s', salt: 'Amylmetacresol 0.6 mg + Dichlorobenzyl Alcohol 1.2 mg lozenge — गला खराब में धीरे-धीरे चूसें', doseOptions: ['1 लोजेंज हर 2-3 घंटे पर (दिन में अधिकतम 8)'], morning: 0, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Hexidine Mouthwash 100ml', salt: 'Chlorhexidine Gluconate 0.2% mouthwash — मुंह / गले के संक्रमण में कुल्ला; निगलें नहीं, दांतों पर दाग छोड़ सकता है', doseOptions: ['10 ml कुल्ला रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Vertigo ──
    { name: 'Vertin 8 Tablet', salt: 'Betahistine 8 mg — चक्कर (vertigo) में भीतरी कान का दबाव घटाता है; भोजन के साथ लें', doseOptions: ['1 गोली रोज़ाना 3 बार'], morning: 1, afternoon: 1, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vertin 16 Tablet', salt: 'Betahistine 16 mg — चक्कर की नियमित खुराक; भोजन के साथ; पेट में हल्की मतली संभव', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Vertin 24 Tablet', salt: 'Betahistine 24 mg — लंबे vertigo कोर्स में दिन में 2 बार', doseOptions: ['1 गोली रोज़ाना 2 बार'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Stemetil 5 Tablet', salt: 'Prochlorperazine 5 mg — तेज चक्कर / जी मिचलाने में; ⚠ नींद-सुस्ती आ सकती है — गाड़ी व मशीन न चलाएं', doseOptions: ['1 गोली रोज़ाना 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Stemetil MD 5 Tablet', salt: 'Prochlorperazine 5 mg (मुंह में घुलने वाली) — तेज चक्कर में जीभ पर रखें, पानी नहीं चाहिए; ⚠ नींद आ सकती है — गाड़ी न चलाएं', doseOptions: ['1 गोली जीभ पर, जरूरत पर दिन में 2-3 बार'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Topical antibiotic ──
    { name: 'T-Bact Ointment 5g', salt: 'Mupirocin 2% ointment — नाक की नोक के संक्रमण / फुंसी पर पतली परत; फुंसी को दबाएं / फोड़ें नहीं', doseOptions: ['प्रभावित जगह पर रोज़ाना 3 बार पतली परत'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Reflux / LPR ──
    { name: 'Pantop 40 Tablet', salt: 'Pantoprazole 40 mg — रिफ्लक्स से गले की जलन (LPR); नाश्ते से 30 मिनट पहले', doseOptions: ['1 गोली नाश्ते से 30 मिनट पहले', '1 गोली सुबह + 1 रात को खाने से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Pantocid DSR Capsule', salt: 'Pantoprazole 40 mg + Domperidone 30 mg (SR) — रिफ्लक्स के साथ खट्टी डकार / खाना ऊपर आने में; नाश्ते से पहले', doseOptions: ['1 कैप्सूल नाश्ते से पहले'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al Hydroxide + Simethicone) — जलन पर तुरंत राहत; दूध-से-पहले या भोजन के 1 घंटे बाद', doseOptions: ['10 ml जरूरत पर'], morning: 0, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Vitamins / support ──
    { name: 'Limcee 500 Tablet', salt: 'Vitamin C 500 mg chewable — रोग-प्रतिरोधक शक्ति; छालों में मददगार; चबाकर लें', doseOptions: ['1 गोली रोज़ाना चबाएं'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Becosules Capsule', salt: 'Vitamin B-Complex + C — मुंह के छालों / जीभ की जलन में सहायक', doseOptions: ['1 कैप्सूल रोज़ाना'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Tablet', salt: 'Multivitamin + Multimineral + Zinc — बीमारी के बाद रिकवरी सहायक', doseOptions: ['1 गोली भोजन के बाद'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (40) ════════════════════════════════════
  findingMeds: [
    // AOM — acute otitis media
    { findingKey: 'AOM', medicineName: 'Augmentin 625 Tablet', dose: '1 tab (625 mg) BD', description: '7 दिन का पूरा कोर्स; 48-72 घंटे में सुधार न हो तो दोबारा मिलें' },
    { findingKey: 'AOM', medicineName: 'Taxim-O 200 Tablet', description: 'पेनिसिलिन न सहने पर विकल्प; BD × 5-7 दिन' },
    { findingKey: 'AOM', medicineName: 'Dolo 650 Tablet', description: 'दर्द/बुखार के लिए SOS; 24 घंटे में अधिकतम 3 गोली' },
    { findingKey: 'AOM', medicineName: 'Clavam 228.5 Dry Syrup', description: 'बच्चों में — वजन-खुराक BD × 7 दिन' },
    // CSOM-ACT — quinolone drops only (perforation present)
    { findingKey: 'CSOM-ACT', medicineName: 'Ciplox Ear Drops 10ml', description: '3 बूंद TDS × 7-10 दिन — पर्दे के छेद में सुरक्षित (quinolone); कान सूखा रखें; Candibiotic नहीं' },
    { findingKey: 'CSOM-ACT', medicineName: 'Augmentin 625 Tablet', description: 'तीव्र बिगड़ने पर सिस्टमिक कवर; बदबूदार/लंबा स्राव = रेफर (cholesteatoma)' },
    // OE-BACT — intact TM: Candibiotic usable (TM-uncertain → switch to Ciplox, see CSOM/TM-PERF links)
    { findingKey: 'OE-BACT', medicineName: 'Candibiotic Ear Drops 5ml', description: '2-3 बूंद TDS × 5-7 दिन — सिर्फ पर्दा बरकरार लगे तो; छेद की आशंका = Ciplox चुनें' },
    // OE-FUNG
    { findingKey: 'OE-FUNG', medicineName: 'Candid Ear Drops 5ml', description: '2-3 बूंद TDS/QID × 2 हफ्ते; कान पूरी तरह सूखा रखें — तैराकी बंद' },
    // WAX-IMPACT
    { findingKey: 'WAX-IMPACT', medicineName: 'Soliwax Ear Drops 10ml', description: '3-5 बूंद TDS × 3-5 दिन, फिर सिरिंज / चक्की से निकालवाएं' },
    { findingKey: 'WAX-IMPACT', medicineName: 'Otorex Ear Drops 10ml', description: 'विकल्प मैल-पगलाने वाली बूंदें; खुद कॉटन बड्स से न निकालें' },
    // TM-PERF
    { findingKey: 'TM-PERF', medicineName: 'Ciplox Ear Drops 10ml', description: 'सिर्फ स्राव हो तो; सूखा छेद = कान सूखा रखें + 4-6 हफ्ते में फॉलो-अप (ज्यादातर खुद भर जाता है)' },
    // OME-ETD
    { findingKey: 'OME-ETD', medicineName: 'Nasivion 0.05% Nose Drops 10ml', description: '2 बूंद BD — ⚠ अधिकतम 5-7 दिन; जुकाम में नाक खोलने के लिए' },
    { findingKey: 'OME-ETD', medicineName: 'Flomist Nasal Spray', description: 'एलर्जी वाले मरीज़ में 4-6 हफ्ते; बच्चे में लगातार OME = जांच' },
    // VERTIGO-BPPV
    { findingKey: 'VERTIGO-BPPV', medicineName: 'Vertin 16 Tablet', description: '1 गोली BD-TDS × 2-4 हफ्ते; Epley maneuver के साथ; नींद सावधानी' },
    { findingKey: 'VERTIGO-BPPV', medicineName: 'Stemetil MD 5 Tablet', description: 'तेज हमले में जीभ पर; ⚠ नींद — गाड़ी न चलाएं; लंबा इस्तेमाल नहीं' },
    // AR
    { findingKey: 'AR', medicineName: 'Flomist Nasal Spray', description: '1 स्प्रे प्रति नथुना OD × 4 हफ्ते — पहली पसंद; तकनीक सिखाएं' },
    { findingKey: 'AR', medicineName: 'Levocet 5 Tablet', description: '1 गोली रात को; नींद आए तो Allegra विकल्प' },
    { findingKey: 'AR', medicineName: 'Montair LC Tablet', description: 'नाक + आंख एलर्जी में रात को 1 गोली × 2-4 हफ्ते' },
    { findingKey: 'AR', medicineName: 'Allegra 120 Tablet', description: 'नॉन-सेडेटिंग विकल्प — ड्राइविंग / स्टूडेंट मरीज़' },
    { findingKey: 'AR', medicineName: 'Montair LC Kid Syrup', description: 'बच्चों में वजन-खुराक रात को' },
    // ACUTE-SINUSITIS
    { findingKey: 'ACUTE-SINUSITIS', medicineName: 'Augmentin 625 Tablet', description: 'BD × 5-7 दिन (10 दिन+ लक्षण / तीव्र मूल्यांकन पर)' },
    { findingKey: 'ACUTE-SINUSITIS', medicineName: 'Metatop Nasal Spray', description: '1 स्प्रे BD × 3 हफ्ते — रोकथाम का मुख्य हिस्सा' },
    { findingKey: 'ACUTE-SINUSITIS', medicineName: 'Sinarest Tablet', description: '1 गोली BD-TDS × 3-5 दिन; ⚠ नींद — गाड़ी नहीं; भाप रोज़ाना 2 बार' },
    { findingKey: 'ACUTE-SINUSITIS', medicineName: 'Mucolite Syrup 100ml', description: '10 ml BD × 5 दिन — स्राव पतला करने में मदद' },
    // CHRONIC-SINUSITIS
    { findingKey: 'CHRONIC-SINUSITIS', medicineName: 'Metatop Nasal Spray', description: 'लंबा कोर्स (8-12 हफ्ते) + सलाइन डॉउचिंग रोज़ाना; सर्जरी मूल्यांकन यदि न ठीक हो' },
    { findingKey: 'CHRONIC-SINUSITIS', medicineName: 'Sinomarin Nasal Spray 100ml', description: 'रोज़ाना 2-4 बार नाक धोएं — दवा नहीं, आदत बनाएं' },
    // RHINITIS-MEDIC
    { findingKey: 'RHINITIS-MEDIC', medicineName: 'Flomist Nasal Spray', description: 'बूंदें आज से बंद; स्टेरॉयड स्प्रे से पुल बनाकर नाक खोलें — 2-4 हफ्ते' },
    // EPISTAXIS-MGD
    { findingKey: 'EPISTAXIS-MGD', medicineName: 'T-Bact Ointment 5g', description: 'नोक के अंदर हल्की परत BD × 7 दिन — पपड़ी / खुजलाने वाली जगह; दोबारा बार-बार खून = जलाने (cautery) के लिए रेफर' },
    // NASAL-VESTIBULITIS
    { findingKey: 'NASAL-VESTIBULITIS', medicineName: 'T-Bact Ointment 5g', description: 'नोक के अंदर-बाहर पतली परत TDS × 5-7 दिन; फुंसी को दबाना / फोड़ना मना' },
    // DNS-TURB — medical bridge before surgical evaluation (Metatop course see CHRONIC-SINUSITIS link)
    // ACUTE-TONSILLITIS
    { findingKey: 'ACUTE-TONSILLITIS', medicineName: 'Augmentin 625 Tablet', description: 'BD × 7 दिन पूरा कोर्स; गरारे 2-3 बार' },
    { findingKey: 'ACUTE-TONSILLITIS', medicineName: 'Azithral 500 Tablet', description: 'पेनिसिलिन-विकल्प: 1 गोली OD × 3 दिन' },
    { findingKey: 'ACUTE-TONSILLITIS', medicineName: 'Dolo 650 Tablet', description: 'दर्द / बुखार SOS' },
    // CHRONIC-TONSILLITIS
    { findingKey: 'CHRONIC-TONSILLITIS', medicineName: 'Tantum Oral Rinse 120ml', description: 'बीच-बीच के हल्के हमलों में कुल्ला; साल में 5-7+ बार = टॉन्सिलेक्टोमी की बात ENT से' },
    // ACUTE-PHARYNGITIS
    { findingKey: 'ACUTE-PHARYNGITIS', medicineName: 'Betadine Gargle 100ml', description: 'गुनगुने पानी में गरारे TDS × 5-7 दिन' },
    { findingKey: 'ACUTE-PHARYNGITIS', medicineName: 'Strepsils Lozenges 16s', description: 'दर्द पर चूसें — हर 2-3 घंटे (अधिकतम 8/दिन)' },
    { findingKey: 'ACUTE-PHARYNGITIS', medicineName: 'Tantum Oral Rinse 120ml', description: 'तेज दर्द में बेंज़ाडामाइन कुल्ला BD-TDS' },
    // ACUTE-LARYNGITIS
    { findingKey: 'ACUTE-LARYNGITIS', medicineName: 'Tantum Oral Rinse 120ml', description: 'आवाज़ विश्राम + भाप मुख्य इलाज; कुल्ला सहायक × 5 दिन' },
    // LPR
    { findingKey: 'LPR', medicineName: 'Pantop 40 Tablet', description: 'नाश्ते से पहले × 4-8 हफ्ते; रात का भोजन सोने से 3 घंटे पहले' },
    { findingKey: 'LPR', medicineName: 'Pantocid DSR Capsule', description: 'खट्टी डकार / भारी लक्षणों में सुबह एक कैप्सूल' },
    { findingKey: 'LPR', medicineName: 'Digene Gel 200ml', description: 'जलन पर 10 ml SOS — तुरंत राहत' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Ear Exam Findings (कान परीक्षा)',
      rows: 7,
      cols: 4,
      headerLabel: ['जांच बिंदु', 'दायां कान', 'बायां कान', 'टिप्पणी'],
      colsLabel: [
        'नाक-नहर (canal) — साफ / सूजन / दर्द',
        'ट्रैगस दबाने पर दर्द',
        'मैल (wax) — नहीं / हल्का / जमा हुआ',
        'पर्दा (TM) — साफ दिखती / धुंधली / लाल-उभरी',
        'छेद (perforation) — नहीं / छोटा / बड़ा',
        'स्राव — नहीं / पीला / हरा / बदबूदार',
        'सुनाई (फुसफुसाहट / घड़ी की टिक-टिक)',
      ],
      footerLabel: ['पर्दा न दिखे, बदबूदार स्राव या कान के पीछे सूजन हो तो ENT रेफर करें / Refer to ENT if TM not visible, foul discharge, or post-auricular swelling'],
      extraLabel: 'डिजिटल ऑटोस्कोपी की तस्वीर रिकॉर्ड करें यदि उपलब्ध हो',
    },
    {
      name: 'Audiometry Referral (श्रवण परीक्षा रेफरल)',
      rows: 5,
      cols: 4,
      headerLabel: ['आवृत्ति (Hz)', 'दायां कान (dB)', 'बायां कान (dB)', 'टिप्पणी'],
      colsLabel: ['500 Hz', '1000 Hz', '2000 Hz', '4000 Hz', '8000 Hz'],
      footerLabel: ['किसी भी आवृत्ति पर 40 dB से ज्यादा नुकसान = श्रवण-यंत्र / ENT रेफर; अचानक एक तरफ का नुकसान = उसी दिन EMERGENCY रेफर / >40 dB at any frequency — refer; sudden one-sided loss — same-day emergency referral'],
      extraLabel: 'एयर-बोन गैप (air-bone gap) नोट करें — पर्दा बनाम तंत्रिका का फर्क बताता है',
    },
    {
      name: 'Vertigo Assessment (चक्कर जांच)',
      rows: 6,
      cols: 3,
      headerLabel: ['जांच', 'नतीजा', 'टिप्पणी'],
      colsLabel: [
        'कमरा घूमने का एहसास (true vertigo)',
        'ट्रिगर — लेटना / उठना / सिर घुमाना',
        'हमले की अवधि — सेकंड / मिनट / घंटे',
        'आंखों का कांपन (nystagmus) दिखा',
        'Dix-Hallpike टेस्ट',
        'कान लक्षण — भजन / कम सुनाई / भरापन',
      ],
      footerLabel: ['लेटने-उठने पर सेकंडों का चक्कर = BPPV (Epley करें); घंटों का + कान लक्षण = मेनियर — रेफर; बोली लड़ना / हाथ-पैर की कमजोरी = तुरंत न्यूरो रेफर / Positional seconds = BPPV (do Epley); hours + ear signs = Meniere — refer; slurred speech / limb weakness = urgent neuro referral'],
      extraLabel: 'Dix-Hallpike से पहले गर्दन की समस्या पूछें; सुरक्षा — बिस्तर के किनारे पर बैठाकर करें',
    },
    {
      name: 'Sinusitis Symptom Score (साइनस लक्षण स्कोर)',
      rows: 6,
      cols: 3,
      headerLabel: ['लक्षण', 'स्कोर (0-2)', 'आज / दिन'],
      colsLabel: [
        'चेहरे में दर्द / भारीपन (झुकने पर बढ़े)',
        'नाक बंद',
        'गाढ़ा पीला-हरा स्राव',
        'सूंघने में कमी',
        'बुखार',
        'ऊपरी दांत / सिर दर्द',
      ],
      footerLabel: ['स्कोर: 0 = नहीं, 1 = हल्का, 2 = ज्यादा; कुल 8+ या 10 दिन+ लक्षण = एंटीबायोटिक / CT सोचें; आंख के आस-पास सूजन या देखने में दिक्कत = तुरंत रेफर / Score 8+ or symptoms 10+ days — antibiotic/CT; eye swelling or vision trouble — urgent referral'],
      extraLabel: 'रोज़ शाम स्कोर लिखें — इलाज का असर दिखता है',
    },
    {
      name: 'Nasal Endoscopy Findings (नाक एंडोस्कोपी)',
      rows: 6,
      cols: 4,
      headerLabel: ['जांच बिंदु', 'दायां नाक', 'बायां नाक', 'टिप्पटी'],
      colsLabel: [
        'शल्का (septum) — सीधी / टेढ़ी / उभार',
        'टर्बिनेट — सामान्य / बड़े / पीले',
        'स्राव — साफ / पानीदार / मवाद',
        'पॉलिप / मांस — नहीं / हां',
        'एडेनॉयड (बच्चे) — सामान्य / बड़ा',
        'खून वाली जगह (bleeder) दिखी',
      ],
      footerLabel: ['एक तरफ पॉलिप, खून या बदबूदार स्राव = विस्तृत जांच / CT व बायोप्सी विचार — ENT विशेषज्ञ को भेजें / One-sided polyp, bleeding or foul discharge — CT/biopsy consideration — refer to ENT specialist'],
      extraLabel: 'एंडोस्कोपी से पहले नाक में सिकुड़न वाली बूंदें + सलाइन',
    },
    {
      name: 'Ear Drop Instillation (कान में बूंदें डालने का तरीका)',
      rows: 6,
      cols: 2,
      headerLabel: ['क्रम', 'कदम'],
      colsLabel: [
        '1 — बूंदों की शीशी हाथ में 2 मिनट पकड़कर गर्म करें (ठंडी बूंद से चक्कर आ सकता है)',
        '2 — प्रभावित कान ऊपर की ओर रखकर लेटें',
        '3 — बड़ों में कान को ऊपर-पीछे खींचें; 3 साल से छोटे बच्चे में नीचे-पीछे',
        '4 — निर्धारित बूंदें डालें — शीशी की नोज़ल कान को न छूए',
        '5 — उसी पोज़िशन में 2-3 मिनट लेटे रहें',
        '6 — बूंदें डालने के बाद 10 मिनट तक न उठें, न ही रुई ठूंसें',
      ],
      footerLabel: ['बूंदें हमेशा डॉक्टर की सलाह से; कान में रुई / बड्स / तेल डालना मना है / Drops only as advised; no cotton, buds or oil inside the ear'],
      extraLabel: 'दिन में कितनी बार बूंदें डालनी हैं यह पर्चे पर लिखा है — बिल्कुल वैसे ही करें',
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acute Otitis Media — Adult',
      diagnosis: 'AOM',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab (625 mg)', duration: '5 days', instructions: 'BD after food; complete the FULL course even if pain settles' },
        { name: 'Dolo 650 Tablet', dose: '1 tab (650 mg)', duration: '3 days', instructions: 'SOS for pain/fever; max 3 tabs/24 hrs' },
        { name: 'Sinarest Tablet', dose: '1 tab', duration: '3 days', instructions: 'BD if nasal congestion/cold; causes drowsiness — do not drive' },
      ],
      labs: ['Audiometry (if hearing reduced after treatment)'],
      advice: 'कान में कुछ भी डालना मना (बड्स / रुई / तेल) · नहाते समय कान में पानी न जाने दें — रुई + वैसलीन से ढकें · 48-72 घंटे में दर्द-बुखार न घटे, कान के पीछे सूजन दिखे, चेहरा झुके या तेज सिरदर्द-उल्टी हो तो तुरंत आएं',
      followUpDays: 3,
      isCommon: true,
    },
    {
      name: 'Allergic Rhinitis — Starter Course',
      diagnosis: 'AR',
      medicines: [
        { name: 'Flomist Nasal Spray', dose: '1 spray each nostril', duration: '4 weeks', instructions: 'Once daily; aim nozzle towards ear-side wall, not septum; full effect takes 1-2 weeks' },
        { name: 'Levocet 5 Tablet', dose: '1 tab (5 mg)', duration: '2 weeks', instructions: 'At bedtime; drowsiness possible' },
      ],
      labs: ['Absolute Eosinophil Count (if severe/persistent)', 'Allergy testing (optional, if triggers unclear)'],
      advice: 'धूल-धुआं-पराग से बचें — झाड़ू में मास्क, बिस्तर हर हफ्ते गर्म पानी में धोएं · रोज़ाना सलाइन नाक-धोना (Sinomarin) जारी रखें · घर में नमी व पर्दे साफ रखें · स्प्रे 4 हफ्ते लगातार चलाएं — बीच में बंद करने से एलर्जी लौटती है · 2 हफ्ते में फॉलो-अप',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Acute Sinusitis — Antibiotic + Spray',
      diagnosis: 'ACUTE-SINUSITIS',
      medicines: [
        { name: 'Augmentin 625 Tablet', dose: '1 tab (625 mg)', duration: '5 days', instructions: 'BD after food; full course' },
        { name: 'Metatop Nasal Spray', dose: '1 spray each nostril', duration: '3 weeks', instructions: 'BD; continue even after antibiotics finish' },
        { name: 'Sinarest Tablet', dose: '1 tab', duration: '3 days', instructions: 'BD-TDS for congestion; drowsiness — no driving; BP patients ask doctor' },
        { name: 'Mucolite Syrup 100ml', dose: '10 ml', duration: '5 days', instructions: 'BD; drink plenty of warm water' },
      ],
      labs: ['X-ray PNS (if symptoms >10 days or complications suspected)', 'CBC (if high fever)'],
      advice: 'दिन में 2 बार गर्म पानी की भाप 5-10 मिनट लें · गुनगुना पानी खूब पिएं · सिर झुकाकर दर्द बढ़े या आंख के आस-पास सूजन / देखने में दिक्कत हो तो तुरंत आएं · नाक जोर से न फूंकें — एक-एक नथुने से आराम से',
      followUpDays: 5,
      isCommon: true,
    },
    {
      name: 'BPPV Vertigo — Vertin + Epley',
      diagnosis: 'VERTIGO-BPPV',
      medicines: [
        { name: 'Vertin 16 Tablet', dose: '1 tab (16 mg)', duration: '14 days', instructions: 'BD-TDS with food; mild nausea possible' },
        { name: 'Stemetil MD 5 Tablet', dose: '1 tab on tongue', duration: '3 days', instructions: 'Only for severe spinning episodes; drowsiness — do NOT drive; short use only' },
      ],
      labs: ['Audiometry (if any hearing loss/tinnitus)'],
      advice: 'Epley maneuver क्लिनिक में करवाएं — लेटे-उठते चक्कर में बहुत असरदार · बिस्तर से धीरे उठें, पहले बैठें फिर खड़े हों · रात में लैंप जलाकर सोएं, सीढ़ियाँ-बाथरूम में सावधानी · चक्कर में गाड़ी बिल्कुल न चलाएं · बोली लड़ना, हाथ-पैर की कमजोरी या चलते-चलते गिरना हो तो तुरंत इमरजेंसी',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'CSOM Otorrhoea — Dry Ear Protocol',
      diagnosis: 'CSOM-ACT',
      medicines: [
        { name: 'Ciplox Ear Drops 10ml', dose: '3 drops', duration: '7 days', instructions: 'TDS into the discharging ear; perforation-safe quinolone — do NOT substitute Candibiotic' },
        { name: 'Augmentin 625 Tablet', dose: '1 tab (625 mg)', duration: '5 days', instructions: 'BD after food if acutely inflamed/fever' },
      ],
      labs: ['Ear discharge culture (if not responding in 7 days)', 'Audiometry (document hearing before any surgery plan)'],
      advice: 'कान बिल्कुल सूखा रखें — नहाते समय रुई + वैसलीन का ढक्कन लगाएं · कान में बड्स / रुई ठूंसना / तेल सब मना · बूंदें डालने का सही तरीका: ढालू लेटकर 3 मिनट रुकें · हरा-बदबूदार स्राव, कान के पीछे सूजन या चक्कर-चेहरा झुकना हो तो तुरंत ENT रेफर (cholesteatoma की जांच)',
      followUpDays: 7,
      isCommon: true,
    },
    {
      name: 'Wax Impaction — Soften + Review',
      diagnosis: 'WAX-IMPACT',
      medicines: [
        { name: 'Soliwax Ear Drops 10ml', dose: '3-5 drops', duration: '4 days', instructions: 'TDS into blocked ear; lie with ear up 2-3 min after drops' },
      ],
      labs: [],
      advice: '4-5 दिन बूंदें डालकर वापस आएं — मैल सिरिंज / चक्की से निकाला जाएगा · बूंदें डालते समय कान ऊपर रखकर लेटें · कॉटन बड्स से खुद निकालने की कोशिश न करें — मैल और अंदर जाता है · कान में दर्द / बहना शुरू हो जाए तो बूंदें रोककर आएं',
      followUpDays: 5,
      isCommon: true,
    },
  ],
}