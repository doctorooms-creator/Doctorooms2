/**
 * GER-01 — GERIATRICS STARTER PACK (T3 lite)
 *
 * Comprehensive elder-care OPD — polypharmacy de-prescribing (STOPP/START
 * principles), falls, memory, frailty/nutrition, caregiver support.
 * 'Start-low-go-slow' mantra everywhere. Multi-comorbidity coordination
 * framing: the geriatrician is the CONDUCTOR of CAR/NEU/DIA/ORT/URO/PSY
 * specialists.
 *
 * ⚠ SCOPE PHILOSOPHY (deliberate):
 *   - Polypharmacy de-prescribing is a core finding — pill-bag review
 *     framing ('bring ALL boxes in ONE bag') everywhere.
 *   - ZERO benzodiazepines/Z-drugs — sleeping pills = explicit
 *     avoid-framing (falls + memory loss). Melatonin is the only mild
 *     entry, AFTER sleep hygiene.
 *   - No Avil/cyclizine/meclizine — anticholinergic-burden teaching
 *     instead. No chronic NSAID — Crocin first, always.
 *   - Donepezil (Donep) = CONTINUATION-VERIFY ONLY — NEU owns dementia
 *     medicines; never started or doubled here.
 *   - Asymptomatic bacteriuria in urine reports is NOT treated — the
 *     single biggest over-treatment mistake in Indian elder care.
 *
 * Emergency rails baked in everywhere:
 *   - DELIRIUM (sudden confusion — very different from dementia) and
 *     ATYPICAL sepsis (confusion/low-temp/no-fever) = hospital, zero
 *     medicine links. Hip fracture suspect = hospital, zero links.
 *   - Stroke signs → 108 ambulance teaching on dizziness questions.
 *
 * Language: Hindi primary (patient/caregiver-facing), English secondary
 * (doctor search). Medicine names = English brands (India geriatric core).
 *
 * ⚠ UNVERIFIED-DOSE MODE: doses are standard Indian-formulary adult
 * defaults, NOT yet signed off by an MBBS reviewer. UI shows the
 * unverified-dose badge until meta.reviewedBy is stamped.
 */

import type { SpecialtyPack } from '../types'

export const GER01_PACK: SpecialtyPack = {
  meta: {
    code: 'GER-01',
    version: '1.0.0',
    tier: 'T3',
    title: 'Geriatrics Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'T3 lite · polypharmacy de-prescribing + falls + frailty; start-low-go-slow',
  },

  // ══ Categories (5) ════════════════════════════════════════════════════
  categories: [
    { key: 'MCR', name: 'बहु-रोग समीक्षा', nameEn: 'Multi-Comorbidity Review' },
    { key: 'FAL', name: 'गिरना / कमजोरी', nameEn: 'Falls & Frailty' },
    { key: 'MEM', name: 'याददाश्त', nameEn: 'Memory' },
    { key: 'ADL', name: 'दैनिक कार्य / देखभाल', nameEn: 'Daily Function & Caregiver' },
    { key: 'EOL', name: 'उन्नत देखभाल योजना', nameEn: 'Advanced Care Planning' },
  ],

  // ══ Complaints (16) ═══════════════════════════════════════════════════
  complaints: [
    // MCR — multi-comorbidity review
    { code: 'MCR01', categoryKey: 'MCR', detail: 'कई दवाओं की समीक्षा चाहिए — थैली-जांच', detailEn: 'Multiple medicines review — pill-bag check' },
    { code: 'MCR02', categoryKey: 'MCR', detail: 'कब्ज से बहुत परेशान', detailEn: 'Troubled by constipation' },
    { code: 'MCR03', categoryKey: 'MCR', detail: 'दर्द जोड़ों में — बुढ़ापे में', detailEn: 'Joint pain in old age' },
    { code: 'MCR04', categoryKey: 'MCR', detail: 'बुढ़ापे में वैक्सीन की समीक्षा', detailEn: 'Vaccination review in old age' },
    { code: 'MCR05', categoryKey: 'MCR', detail: 'बार-बार बुखार / पेशाब संक्रमण', detailEn: 'Recurrent fever / urine infection' },
    // FAL — falls & frailty
    { code: 'FAL01', categoryKey: 'FAL', detail: 'चक्कर आना — गिरना', detailEn: 'Dizziness — falls' },
    { code: 'FAL02', categoryKey: 'FAL', detail: 'गिरने के बाद चलने का डर', detailEn: 'Fear of walking after a fall' },
    { code: 'FAL03', categoryKey: 'FAL', detail: 'भूख कम — बुढ़ापे में (वजन घटना)', detailEn: 'Poor appetite in old age (weight loss)' },
    { code: 'FAL04', categoryKey: 'FAL', detail: 'अस्पताल से लौटने के बाद कमजोरी', detailEn: 'Weakness after hospital discharge' },
    // MEM — memory
    { code: 'MEM01', categoryKey: 'MEM', detail: 'याददाश्त कम होना', detailEn: 'Memory declining' },
    { code: 'MEM02', categoryKey: 'MEM', detail: 'नाम/तारीख भूलना बढ़ गया', detailEn: 'Forgetting names/dates — worse now' },
    // ADL — daily function / caregiver
    { code: 'ADL01', categoryKey: 'ADL', detail: 'नींद उड़ गई है — बुढ़ापे में', detailEn: 'Sleep lost — in old age' },
    { code: 'ADL02', categoryKey: 'ADL', detail: 'पेशाब की दिक्कत — बुढ़ापे में (URO समन्वय)', detailEn: 'Urinary difficulty — in old age (coordinate URO)' },
    { code: 'ADL03', categoryKey: 'ADL', detail: 'अकेलापन / उदासी (PSY समन्वय)', detailEn: 'Loneliness / low mood (coordinate PSY)' },
    { code: 'ADL04', categoryKey: 'ADL', detail: 'बिस्तर पर मरीज़ की देखभाल', detailEn: 'Caring for a bedridden patient' },
    // EOL — advanced care
    { code: 'EOL01', categoryKey: 'EOL', detail: 'गंभीर बीमारी की योजना (परिवार)', detailEn: 'Serious-illness planning (family)' },
  ],

  // ══ Questions (32 — 2 per complaint; // idx N = true 0-based index) ═══
  questions: [
    // idx 0 — MCR01
    { complaintCode: 'MCR01', question: 'अभी कौन-कौन सी दवाइयां चल रही हैं — रोज़ कितनी गोलियां/कैप्सूल लेते हैं?', questionEn: 'Which medicines are running now — how many tablets/capsules a day?' },
    // idx 1 — MCR01
    { complaintCode: 'MCR01', question: 'कोई दवा बिना डॉक्टर की खुद शुरू की है — टॉनिक, दर्द की गोली, नींद की गोली?', questionEn: 'Any medicine started on your own without a doctor — tonic, painkiller, sleeping pill?' },
    // idx 2 — MCR02
    { complaintCode: 'MCR02', question: 'कितने दिनों से पेट साफ नहीं हुआ? चालू दवाओं में आयरन/दर्द की गोली तो नहीं?', questionEn: 'How many days without a bowel movement? Any iron/pain tablets among current medicines?' },
    // idx 3 — MCR02
    { complaintCode: 'MCR02', question: 'कब्ज के साथ पेट दर्द, उल्टी या मल में खून तो नहीं?', questionEn: 'With the constipation, any abdominal pain, vomiting or blood in stool?' },
    // idx 4 — MCR03
    { complaintCode: 'MCR03', question: 'दर्द के लिए रोज़ कौन सी गोली ले रहे हैं और कब से?', questionEn: 'Which pain tablet are you taking daily, and since when?' },
    // idx 5 — MCR03
    { complaintCode: 'MCR03', question: 'दर्द चलने पर घटता-बढ़ता है? सुबह अकड़न कितनी देर रहती है?', questionEn: 'Does the pain vary with walking? How long does morning stiffness last?' },
    // idx 6 — MCR04
    { complaintCode: 'MCR04', question: 'पिछला फ्लू (influenza) वैक्सीन कब लगा? निमोनिया (pneumococcal) वैक्सीन लगा है?', questionEn: 'When was the last flu vaccine? Has the pneumococcal vaccine been given?' },
    // idx 7 — MCR04
    { complaintCode: 'MCR04', question: 'पिछले 10 साल में टीटनस का टीका लगा? टीके के बाद कोई दिक्कत हुई है?', questionEn: 'Tetanus vaccine in the last 10 years? Any trouble after previous vaccines?' },
    // idx 8 — MCR05
    { complaintCode: 'MCR05', question: 'पिछले साल पेशाब का संक्रमण कितनी बार हुआ? बिना लक्षण के भी दवा मिली कभी?', questionEn: 'How many urine infections last year? Were antibiotics ever given without symptoms?' },
    // idx 9 — MCR05
    { complaintCode: 'MCR05', question: 'संक्रमण के साथ बुखार, पेट/कमर दर्द या अचानक भ्रम (confusion) होता है?', questionEn: 'With infections, is there fever, loin/abdominal pain, or sudden confusion?' },
    // idx 10 — FAL01
    { complaintCode: 'FAL01', question: 'पिछले 6 महीने में कितनी बार गिरे? ज्यादातर कहां गिरे — बाथरूम, रात में, बाहर?', questionEn: 'How many falls in the last 6 months? Where did most happen — bathroom, night, outdoors?' },
    // idx 11 — FAL01
    { complaintCode: 'FAL01', question: 'गिरने से पहले चक्कर आया, आंखों के आगे धुंधला हुआ, या पैरों में कमजोरी महसूस हुई?', questionEn: 'Before falling — dizziness, blurred vision, or leg weakness felt?' },
    // idx 12 — FAL02
    { complaintCode: 'FAL02', question: 'गिरने के डर से चलना-टहलना या बाहर निकलना कम कर दिया है?', questionEn: 'Have you cut down walking or going out due to fear of falling?' },
    // idx 13 — FAL02
    { complaintCode: 'FAL02', question: 'पता है कि बंद बैठे रहने से कमजोरी और बढ़ती है और अगली गिरावट पक्की हो जाती है?', questionEn: 'Do you know that sitting still increases weakness and makes the next fall certain?' },
    // idx 14 — FAL03
    { complaintCode: 'FAL03', question: 'पिछले 6 महीने में वजन कितना घटा? कपड़े ढीले पड़ गए हैं?', questionEn: 'How much weight lost in the last 6 months? Have clothes become loose?' },
    // idx 15 — FAL03
    { complaintCode: 'FAL03', question: 'खाने में क्या बदला — दांत/कृत्रिम दांत की दिक्कत, स्वाद खत्म, या अकेले खाने का मन नहीं?', questionEn: 'What changed with eating — teeth/denture trouble, taste loss, or no desire to eat alone?' },
    // idx 16 — FAL04
    { complaintCode: 'FAL04', question: 'अस्पताल से कब लौटे और जाने से पहले की तुलना में कितने कमजोर हुए?', questionEn: 'When did you return from hospital, and how much weaker than before admission?' },
    // idx 17 — FAL04
    { complaintCode: 'FAL04', question: 'अस्पताल में कोई दवा बदली या रुकी थी? छुट्टी का पर्चा और रिपोर्टें हाथ में हैं?', questionEn: 'Was any medicine changed or stopped in hospital? Do you have the discharge slip and reports?' },
    // idx 18 — MEM01
    { complaintCode: 'MEM01', question: 'क्या-क्या भूलते हैं — हाल की बातें ज्यादा या पुरानी बातें भी?', questionEn: 'What is forgotten — recent matters mostly, or old ones too?' },
    // idx 19 — MEM01
    { complaintCode: 'MEM01', question: 'रोज़ के कामों में गड़बड़ी शुरू हुई है — दवा लेना, पैसों का हिसाब, खाना बनाना?', questionEn: 'Have daily tasks started slipping — taking medicines, managing money, cooking?' },
    // idx 20 — MEM02
    { complaintCode: 'MEM02', question: 'भूलना कब से बढ़ा — दिन-दो दिन में अचानक, या महीनों में धीरे-धीरे?', questionEn: 'When did the forgetting worsen — suddenly over a day or two, or gradually over months?' },
    // idx 21 — MEM02
    { complaintCode: 'MEM02', question: 'अपनी भूल का अहसास खुद को होता है? चीज़ें छुपाना, चोरी का आरोप या शाम की बेचैनी भी है?', questionEn: 'Are you aware of your own forgetfulness? Any hiding things, theft accusations, or evening restlessness?' },
    // idx 22 — ADL01
    { complaintCode: 'ADL01', question: 'रात में कितनी घंटे सोते हैं और रात में कितनी बार जागते हैं?', questionEn: 'How many hours do you sleep at night, and how many times do you wake?' },
    // idx 23 — ADL01
    { complaintCode: 'ADL01', question: 'दिन में झपकी लेते हैं? चाय-कॉफी कब-कब पीते हैं? नींद की कोई गोली चल रही है?', questionEn: 'Do you nap in the day? When do you have tea/coffee? Is any sleeping pill running?' },
    // idx 24 — ADL02
    { complaintCode: 'ADL02', question: 'पेशाब की दिक्कत क्या है — बार-बार आना, रुक-रुक कर आना, रिसाव, या रात में कई बार?', questionEn: 'What is the urinary trouble — frequency, poor stream, leakage, or several times at night?' },
    // idx 25 — ADL02
    { complaintCode: 'ADL02', question: 'पेशाब में जलन, बदबू या रक्त तो नहीं? बुखार या पेट की दिक्कत के साथ होता है?', questionEn: 'Any burning, foul smell or blood in the urine? Does it come with fever or abdominal trouble?' },
    // idx 26 — ADL03
    { complaintCode: 'ADL03', question: 'मन कैसा रहता है — उदासी, पहले अच्छे लगने वाले कामों में रुचि खत्म, या बात करने का मन नहीं?', questionEn: 'How is your mood — sadness, lost interest in previously enjoyed activities, or not wanting to talk?' },
    // idx 27 — ADL03
    { complaintCode: 'ADL03', question: 'दिनभर में किसी से बातचीत कितनी होती है? मंदिर/सभा/पार्क जाने का कोई नियम है?', questionEn: 'How much conversation happens in a day? Any fixed habit of temple/community/park visits?' },
    // idx 28 — ADL04
    { complaintCode: 'ADL04', question: 'मरीज़ बिस्तर पर कब से हैं? खुद पलट पाते हैं या कोई पलटाता है?', questionEn: 'How long has the patient been bedridden? Can they turn themselves, or does someone turn them?' },
    // idx 29 — ADL04
    { complaintCode: 'ADL04', question: 'देखभाल कौन करता है — उस व्यक्ति को थकान, गुस्सा या नींद की दिक्कत हो रही है?', questionEn: 'Who provides the care — is that person getting fatigue, anger or sleep problems?' },
    // idx 30 — EOL01
    { complaintCode: 'EOL01', question: 'गंभीर बीमारी के बारे में मरीज़ खुद क्या चाहते हैं — यह बात कभी हुई है?', questionEn: 'What does the patient themselves want regarding serious illness — has this ever been discussed?' },
    // idx 31 — EOL01
    { complaintCode: 'EOL01', question: 'इमरजेंसी में फैसला कौन लेगा — परिवार में किसी एक नाम का तय है?', questionEn: 'Who will make decisions in an emergency — is one name fixed in the family?' },
  ],

  // ══ Suggestions (64 — exactly 2 per question, questionIndex 0-31) ════
  suggestions: [
    // q0
    { questionIndex: 0, text: 'अगली विज़िट में सारी दवाओं के डिब्बे-पत्तियां एक थैली में लाएं — दवाओं की सूची याद से नहीं, डिब्बों से बनती है', textEn: 'Bring ALL medicine boxes and strips in one bag at the next visit — the list is built from the boxes, not from memory' },
    { questionIndex: 0, text: 'रोज़ 9-10 से ज्यादा दवाइयां = गिरने, भूलने और दवाओं की आपसी क्रिया (interaction) का जोखिम — कम करने की संभावना पर बात करते हैं', textEn: 'More than 9-10 daily medicines = higher risk of falls, forgetting and drug interactions — we discuss the possibility of reducing them' },
    // q1
    { questionIndex: 1, text: 'बिना पर्चे की दर्द की गोली, नींद की गोली या टॉनिक — ये भी "दवा" ही हैं; थैली में इन्हें भी रखें और खुलकर बताएं', textEn: 'Painkillers, sleeping pills or tonics bought without a prescription count as "medicines" too — include them in the bag and disclose openly' },
    { questionIndex: 1, text: 'रिश्तेदार/पड़ोसी की बताई हुई दवा चला लेना आम आदत है — पर बुढ़ापे में यही सबसे ज्यादा नुकसान करती है; डॉक्टर को हर ऐसी दवा बताएं', textEn: 'Continuing a relative/neighbour’s suggested medicine is a common habit — but in old age it does the most harm; tell the doctor about every such medicine' },
    // q2
    { questionIndex: 2, text: 'आयरन की गोली, दर्द की गोली और कुछ पुरानी एलर्जी/नींद की गोलियां कब्ज करती हैं — कारण अकसर दवा होता है; पहले वही ठीक करेंगे', textEn: 'Iron tablets, painkillers and some older allergy/sleep tablets cause constipation — the cause is often a medicine; we fix that first' },
    { questionIndex: 2, text: '3 दिन से ज्यादा बंद पेट सामान्य नहीं — उपाय की सीढ़ी (फाइबर → पानी → टहलना → दवा) क्रम से चलती है, ऊपर से नहीं', textEn: 'More than 3 days without a bowel movement is not normal — the remedy ladder (fibre → water → walking → medicine) runs in order, never from the top' },
    // q3
    { questionIndex: 3, text: 'कब्ज के साथ उल्टी, तेज़ पेट-दर्द या मल में खून — इंतज़ार नहीं, उसी दिन अस्पताल', textEn: 'Constipation with vomiting, severe abdominal pain or blood in stool — no waiting, hospital the same day' },
    { questionIndex: 3, text: 'नई कब्ज + वजन घटना + भूख गिरना एक साथ हो तो जांच जरूरी है — बुढ़ापे में यह संयोजन कभी नज़रंदाज़ नहीं', textEn: 'New constipation + weight loss + reduced appetite together need testing — this combination is never ignored in old age' },
    // q4
    { questionIndex: 4, text: 'रोज़ की दर्द की गोली (NSAID जैसी) बुढ़ापे में किडनी, पेट और दिल तीनों को नुकसान देती है — पहली पसंद क्रोसिन (पैरासिटामोल) है', textEn: 'Daily NSAID-type painkillers in old age harm kidneys, stomach and heart — the first choice is paracetamol (Crocin)' },
    { questionIndex: 4, text: 'रोज़ दर्द की गोली चल रही है = दर्द का कारण ढूंढना जरूरी — कारण का इलाज ही गोली हटा सकता है', textEn: 'A daily painkiller running means the cause of the pain must be found — only treating the cause can retire the tablet' },
    // q5
    { questionIndex: 5, text: 'चलने से घटता और आराम से बढ़ता दर्द घिसाव (osteoarthritis) जैसा है — जांघ की मांसपेशी के व्यायाम गोली से ज्यादा काम करते हैं', textEn: 'Pain easing with walking and worsening with rest behaves like osteoarthritis — thigh-muscle exercises work better than tablets' },
    { questionIndex: 5, text: 'घुटने के दर्द में कुर्सी-ऊंची बैठक और जमीन पर बैठना/स्क्वैट कम — भारतीय घर के लिए यह एक बड़ा बदलाव है', textEn: 'With knee pain: raised-chair seating and less floor-sitting/squatting — a big change for an Indian home' },
    // q6
    { questionIndex: 6, text: 'फ्लू का टीका हर साल एक बार — बुढ़ापे में निमोनिया-भर्ती से बचाव का सबसे सस्ता तरीका', textEn: 'Flu vaccine once every year — the cheapest protection from pneumonia-hospitalisation in old age' },
    { questionIndex: 6, text: 'निमोनिया (pneumococcal) वैक्सीन एक बार लगवा लें (कुछ मामलों में बूस्टर) — टीका-कार्ड बनवाकर साथ रखें', textEn: 'Get the pneumococcal vaccine once (a booster in some cases) — keep a vaccination card with you' },
    // q7
    { questionIndex: 7, text: 'टीटनस का टीका हर 10 साल में एक बार — गिरने-छिलने की आशंका बनी रहती है', textEn: 'A tetanus booster every 10 years — with falls and scrapes the risk stays' },
    { questionIndex: 7, text: 'टीके के बाद हल्का बुखार/दर्द सामान्य है — COVID वैक्सीन वर्तमान दिशा-निर्देश के अनुसार ही', textEn: 'Mild fever/ache after a vaccine is normal — COVID vaccination as per current guidelines' },
    // q8
    { questionIndex: 8, text: 'बिना लक्षण के पेशाब की रिपोर्ट में बैक्टीरिया आना बुढ़ापे में बहुत आम है — यह एंटीबायोटिक नहीं मांगता (यह सबसे बड़ी सीख है)', textEn: 'Bacteria in the urine report WITHOUT symptoms is very common in old age — it does NOT demand antibiotics (this is the biggest lesson)' },
    { questionIndex: 8, text: 'दवा तभी जब जलन, बार-बार पेशाब या बुखार हो — रिपोर्ट अकेले एंटीबायोटिक का आधार नहीं बनती', textEn: 'Antibiotics only when burning, frequency or fever are present — the report alone is never the basis for antibiotics' },
    // q9
    { questionIndex: 9, text: 'पेशाब संक्रमण के साथ अचानक भ्रम, उनींदापन या तेज़ बुखार — बुढ़ापे में गंभीर संक्रमण का चेहरा है; अस्पताल जाएं', textEn: 'Urine infection with sudden confusion, drowsiness or high fever — the face of serious infection in old age; go to hospital' },
    { questionIndex: 9, text: 'बुढ़ापे में गंभीर संक्रमण बिना बुखार भी आता है — ठंड लगना, भ्रम, खाना छोड़ना भी चेतावनी संकेत हैं', textEn: 'Serious infection in the elderly can arrive without fever — chills, confusion and refusing food are also warning signs' },
    // q10
    { questionIndex: 10, text: '6 महीने में 2 या ज्यादा गिरना = जांच का समय — बीपी की दवाएं, शुगर की गिरावट, नज़र और घर के खतरे चारों देखे जाएंगे', textEn: 'Two or more falls in 6 months = time for assessment — BP medicines, sugar lows, eyesight and home hazards all get reviewed' },
    { questionIndex: 10, text: 'बाथरूम में गिरना सबसे आम है — नॉन-स्लिप मैट और दीवार में हैंडल लगवाएं; भारतीय बाथरूम की फर्श हमेशा गीली रहती है', textEn: 'Bathroom falls are the commonest — get a non-slip mat and wall grab bars; Indian bathroom floors stay wet most of the time' },
    // q11
    { questionIndex: 11, text: 'गिरने से पहले का चक्कर = बीपी की दवा, नींद की गोली या शुगर की जांच — कारण ठीक हो तो गिरना रुक जाता है', textEn: 'Dizziness before the fall = review BP medicines, sleeping pills or sugars — fix the cause and the falls stop' },
    { questionIndex: 11, text: 'चक्कर के साथ चेहरा झुकना, बोली लड़ना या एक तरफ कमजोरी — 108 पर तुरंत कॉल; इलाज की खिड़की देर से बंद हो जाती है', textEn: 'Dizziness with face drooping, slurred speech or one-sided weakness — call 108 immediately; the treatment window closes fast' },
    // q12
    { questionIndex: 12, text: 'गिरने के डर से घर में बंद बैठना कमजोरी बढ़ाता है और अगली गिरावट पक्की करता है — यह चक्र तोड़ना ही इलाज है', textEn: 'Staying indoors out of fear increases weakness and seals the next fall — breaking this cycle IS the treatment' },
    { questionIndex: 12, text: 'डर की जगह तैयारी: छड़ी/वॉकर, दिन की रोशनी में टहलना, शुरुआत किसी के साथ — चलने की धीमी योजना डॉक्टर से बनवाएं', textEn: 'Preparation instead of fear: stick/walker, walking in daylight, starting with company — get a graded walking plan from the doctor' },
    // q13
    { questionIndex: 13, text: 'हफ्ते में 3 दिन 20-30 मिनट की टहल गिरने का जोखिम घटाती है — बुढ़ापे में "आराम से ठीक हो जाएगा" उलटा सच है', textEn: 'A 20-30 minute walk on 3 days a week lowers fall risk — "rest will fix it" is the opposite of the truth in old age' },
    { questionIndex: 13, text: 'कुर्सी से उठने-बैठने के 10 बार रोज़ — जांघ की ताकत वापस लाता है; बिस्तर नहीं, कुर्सी आपकी दवा है', textEn: 'Ten chair sit-to-stands daily brings thigh strength back — the chair, not the bed, is your medicine' },
    // q14
    { questionIndex: 14, text: 'बिना कोशिश के 6 महीने में 5% से ज्यादा वजन घटना जांच मांगता है — थायरॉइड, शुगर, B12 और मन की स्थिति', textEn: 'Losing over 5% weight in 6 months without trying demands a workup — thyroid, sugars, B12 and mood' },
    { questionIndex: 14, text: 'कपड़े ढीले + गाल धँसे = पोषण की जांच — "बुढ़ापे में ऐसा ही होता है" कहकर न छोड़ें, यह इलाज-योग्य हालत है', textEn: 'Loose clothes + sunken cheeks = a nutrition check — do not dismiss it as "just old age"; this is a treatable state' },
    // q15
    { questionIndex: 15, text: 'ढीले कृत्रिम दांत, खत्म स्वाद या अकेले खाने का मन नहीं — खाना छोड़ने के पीछे यही तीन कारण सबसे आम हैं', textEn: 'Loose dentures, lost taste, or no desire to eat alone — these three are the commonest reasons behind reduced intake' },
    { questionIndex: 15, text: 'थोड़ा-थोड़ा 5-6 बार + हर बार प्रोटीन (अंडा/पनीर/मैश की दाल/दही) — एक बार भरपेट खाने की जगह यही बुढ़ापे का तरीका है', textEn: 'Small meals 5-6 times a day with protein each time (egg/paneer/mashed dal/curd) — this replaces the one big fill in old age' },
    // q16
    { questionIndex: 16, text: 'अस्पताल से लौटने के बाद की कमजोरी (post-hospital syndrome) असली है — 4-6 हफ्ते की धीमी वापसी सामान्य है, शर्म नहीं', textEn: 'Weakness after hospital discharge (post-hospital syndrome) is real — a slow 4-6 week comeback is normal, nothing to be ashamed of' },
    { questionIndex: 16, text: 'बेड-रेस्ट का एक हफ्ता = मांसपेशी का 10-20% जाना — यही कमजोरी गिराती है; लौटते ही कुर्सी पर बैठना शुरू करें', textEn: 'One week of bed-rest costs 10-20% of muscle — that weakness is what causes falls; start chair-sitting the day you return' },
    // q17
    { questionIndex: 17, text: 'अस्पताल का छुट्टी-पर्चा और रिपोर्टें अगली विज़िट में जरूर लाएं — दवाओं की सूची मिलाना (reconciliation) इसी से होगा', textEn: 'Bring the discharge slip and reports to the next visit — reconciling the medicine list depends on these' },
    { questionIndex: 17, text: 'अस्पताल में रुकी हुई दवा घर आकर खुद दोबारा शुरू मत करें — कौन सी जारी रहेगी, पर्चा देखकर तय होगा', textEn: 'A medicine stopped in hospital must not be self-restarted at home — the discharge slip decides what continues' },
    // q18
    { questionIndex: 18, text: 'हाल की बातें भूलना ज्यादा और पुरानी यादें ठीक — मनोभ्रंश (dementia) की शुरुआती तस्वीर है; नज़रंदाज़ न करें', textEn: 'Forgetting recent matters while old memories stay intact — the early picture of dementia; do not ignore it' },
    { questionIndex: 18, text: 'भूलने की शुरुआत में ही डॉक्टर से मिलें — कुछ कारण (थायरॉइड, B12, डिप्रेशन) पूरी तरह ठीक हो जाते हैं', textEn: 'See a doctor at the very start of forgetfulness — some causes (thyroid, B12, depression) fully reverse' },
    // q19
    { questionIndex: 19, text: 'दवा लेना, पैसों का हिसाब या खाना बनाना — इनमें गलतियां शुरू होना स्क्रीनिंग का समय है', textEn: 'Errors starting with medicines, money or cooking — this is screening time' },
    { questionIndex: 19, text: 'रोज़ की दिनचर्या एक जैसी रखें — जाना-पहचाना क्रम भूलने से बचाता है; दवाओं को साप्ताहिक पट्टी (pill organizer) में रखें', textEn: 'Keep the daily routine identical — a familiar sequence protects against forgetting; move medicines into a weekly pill organizer' },
    // q20
    { questionIndex: 20, text: 'महीनों में धीरे-धीरे बिगड़ना = डिमेंशिया की तरफ; दिन-दो दिन में अचानक उलझन = भ्रम (delirium) — बाद वाला इमरजेंसी है, दोनों अलग बीमारियां हैं', textEn: 'Gradual worsening over months points to dementia; confusion arriving over a day or two is DELIRIUM — the latter is an emergency; the two are different illnesses' },
    { questionIndex: 20, text: 'भ्रम के आम कारण: पेशाब संक्रमण, नींद की गोली शुरू/बंद, पानी-नमक की कमी, दर्द — जड़ ठीक हो तो भ्रम हट जाता है', textEn: 'Common delirium causes: urine infection, sleeping-pill started/stopped, salt-water depletion, pain — treat the root and the confusion lifts' },
    // q21
    { questionIndex: 21, text: 'अपनी भूल का खुद अहसास होना उदासी की ओर इशारा कर सकता है — डिप्रेशन भी "याददाश्त गई" जैसा दिखता है; दोनों की जांच होती है', textEn: 'Being aware of one’s own forgetfulness can point to low mood — depression also mimics "memory going"; both get checked' },
    { questionIndex: 21, text: 'चीज़ें छुपाना, चोरी का आरोप, शाम की बेचैनी (sundowning) — इन्हें बुढ़ापे की सनक नहीं, बीमारी का हिस्सा समझें और डॉक्टर को बताएं', textEn: 'Hiding things, theft accusations, evening restlessness (sundowning) — treat these as part of the illness, not "old-age stubbornness"; tell the doctor' },
    // q22
    { questionIndex: 22, text: 'बुढ़ापे में नींद का थोड़ा और हल्का होना सामान्य है — 5-6 घंटे की गहरी नींद काफी हो सकती है', textEn: 'Sleep becoming shorter and lighter in old age is normal — 5-6 hours of deep sleep can be enough' },
    { questionIndex: 22, text: 'रात में 1-2 बार जागना आम है; जागने के बाद घबराने की जगह शांत पलटे रहें — चाय और मोबाइल की स्क्रीन नहीं', textEn: 'Waking once or twice at night is common; after waking, stay calm instead of panicking — no tea, no phone screen' },
    // q23
    { questionIndex: 23, text: 'सुबह की धूप 20-30 मिनट + दोपहर 2 बजे के बाद चाय-कॉफी बंद + दिन की लंबी झपकी नहीं — यही नींद की असली दवा है', textEn: 'Morning sunlight 20-30 minutes + no tea/coffee after 2 pm + no long daytime naps — this IS the real sleeping medicine' },
    { questionIndex: 23, text: 'नींद की गोली (बेंजोडायजेपिन) बुढ़ापे में गिरने और याददाश्त खोने का बड़ा कारण है — इनका चलना डॉक्टर की निगरानी में ही ठीक है', textEn: 'Sleeping pills (benzodiazepines) are a major cause of falls and memory loss in old age — they should only run under doctor supervision' },
    // q24
    { questionIndex: 24, text: 'रात में कई बार पेशाब — पहले शाम के बाद पानी कम और दवा-समय की समीक्षा; आगे की जांच यूरोलॉजिस्ट से', textEn: 'Night-time frequency — first reduce evening fluids and review medicine timing; further workup with a urologist' },
    { questionIndex: 24, text: 'रात में बाथरूम का रास्ता रोशन रखें और बेडसाइड कमोड रखें — अंधेरे में भागना गिरने का सबसे बड़ा कारण है', textEn: 'Keep the bathroom route lit at night and keep a bedside commode — rushing in the dark is the biggest cause of falls' },
    // q25
    { questionIndex: 25, text: 'जलन/बदबू = लक्षण वाला संक्रमण — जांच कराकर इलाज; बुखार या कमर/पेट दर्द जुड़े तो उसी दिन', textEn: 'Burning or foul smell = symptomatic infection — test and treat; same-day if fever or loin/abdominal pain joins' },
    { questionIndex: 25, text: 'बिना लक्षण वाली रिपोर्ट का इलाज नहीं — बुढ़ापे में यह सबसे आम गलती है, जिससे दवा-प्रतिरोध (resistance) बढ़ता है', textEn: 'No antibiotics for a symptom-free report — the commonest mistake in old age, and it breeds drug resistance' },
    // q26
    { questionIndex: 26, text: 'उदासी, रुचि का खत्म होना, भूख गिरना — बुढ़ापे में डिप्रेशन आम और इलाज-योग्य है; "उम्र की बात" नहीं', textEn: 'Low mood, lost interest, reduced appetite — depression in old age is common AND treatable; not "just age"' },
    { questionIndex: 26, text: 'मन की बात परिवार में शेयर करें — दबाना दर्द बढ़ाता है; मनो-चिकित्सक (PSY) से जल्दी मिलना जरूरी हो तो झिझक न करें', textEn: 'Share feelings with family — bottling up deepens it; meet a psychiatrist early if needed, without hesitation' },
    // q27
    { questionIndex: 27, text: 'रोज़ किसी से 10 मिनट की बातचीत — मन और याददाश्त दोनों की दवा है; मंदिर/सभा/पार्क का एक नियम बनाएं', textEn: 'A 10-minute daily conversation with someone — medicine for both mood and memory; make temple/community/park a fixed habit' },
    { questionIndex: 27, text: 'साथ खाना — अकेले खाने से भूख आधी रह जाती है; परिवार में एक वक्त का खाना सबके साथ तय करें', textEn: 'Eating together — eating alone halves appetite; fix one shared meal time with the family' },
    // q28
    { questionIndex: 28, text: 'हर 2 घंटे में पलटाना + एड़ी-कूल्हे-पीठ के नीचे नरम तकिये — बिस्तर पर पड़े मरीज़ के घाव-बचाव का मूल मंत्र है', textEn: 'Turning every 2 hours + soft pillows under heels, hips and back — the core mantra of bedsore prevention for a bedridden patient' },
    { questionIndex: 28, text: 'रोज़ पीठ-कूल्हे-एड़ी की त्वचा देखें — दबाव हटाने के 30 मिनट बाद भी लाली रहे तो वह बेडसोर की शुरुआत है', textEn: 'Inspect back-hip-heel skin daily — redness that persists even 30 minutes after pressure is removed is the start of a bedsore' },
    // q29
    { questionIndex: 29, text: 'देखभालकर्ता की थकान भी इलाज का हिस्सा है — देखभाल वाला बीमार पड़ा तो दोनों का इंतज़ाम टूट जाएगा; रोज़ थोड़ा ब्रेक लें', textEn: 'Caregiver fatigue is part of the treatment — if the caregiver falls sick, care for both collapses; take a daily break' },
    { questionIndex: 29, text: 'देखभाल के काम घर के लोगों में बांटें — एक ही व्यक्ति पर सब डालना संयुक्त परिवार के लिए भी अस्वस्थ आदत है', textEn: 'Split caregiving tasks among family members — putting everything on one person is an unhealthy habit even in a joint family' },
    // q30
    { questionIndex: 30, text: 'मरीज़ की अपनी पसंद तभी दर्ज होती है जब वे समझ सकते हैं — अभी वही समय है; यह बातचीत इलाज की योजना है, "मौत की बात" नहीं', textEn: 'The patient’s own preferences can only be recorded while they can still reason — that time is now; this conversation is care planning, not "talking about death"' },
    { questionIndex: 30, text: 'आगे की हर गड़बड़ी में परिवार को रास्ता इसी योजना से मिलता है — आज की शांत बातचीत रात की घबराहट से बचाएगी', textEn: 'This plan is what gives the family a map in every future crisis — today’s calm conversation spares the midnight panic' },
    // q31
    { questionIndex: 31, text: 'इमरजेंसी में फैसला लेने वाले एक व्यक्ति का नाम परिवार की बैठक में सबके सामने तय करें — और लिखवा लें', textEn: 'Fix the name of ONE decision-maker for emergencies in front of the whole family — and get it written down' },
    { questionIndex: 31, text: 'सबसे पहले कौन सा अस्पताल, कितना आक्रामक इलाज — यह आज की शांत सोच में तय करना आसान है, इमरजेंसी की घबराहट में नहीं', textEn: 'Which hospital first, how aggressive the care — deciding is easy in today’s calm, impossible in an emergency’s panic' },
  ],

  // ══ Labels (8) — geriatric assessment numbers ═════════════════════════
  labels: [
    { label: 'दवाइयों की संख्या (रोज़)', labelEn: 'Number of Medicines (daily)', unit: '', showUnit: false },
    { label: '6 महीने में गिरने की बार', labelEn: 'Falls in Last 6 Months', unit: '', showUnit: false },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'भूख श्रेणी (0-5)', labelEn: 'Appetite Grade (0-5)', unit: '', showUnit: false },
    { label: 'याददाश्त की चिंता (0-10)', labelEn: 'Memory Concern (0-10)', unit: '', showUnit: false },
    { label: 'नींद (घंटे)', labelEn: 'Sleep Hours', unit: 'hrs' },
    { label: 'पेशाब नियंत्रण', labelEn: 'Bladder Control', unit: '', showUnit: false },
    { label: 'देखभालकर्ता बोझ (0-10)', labelEn: 'Caregiver Burden (0-10)', unit: '', showUnit: false },
  ],

  // ══ Findings (17: 3 emergency ZERO-link + 14 managed) ════════════════
  // Emergency findings deliberately have ZERO findingMeds links.
  findings: [
    // Emergency / refer-only (ZERO findingMeds links below — by design)
    { key: 'DELIRIUM-SUSPECT', name: 'भ्रम (डिलीरियम) संदिग्ध — आपातकाल (केवल रेफर)', nameEn: 'Suspected Delirium — Emergency (Refer ONLY)', icd10: 'F05' },
    { key: 'SEPSIS-ELDER-ATYPICAL', name: 'बुज़ुर्ग में अयथार्थ सेप्सिस — आपातकाल (केवल रेफर)', nameEn: 'Atypical Sepsis in the Elderly — Emergency (Refer ONLY)', icd10: 'A41.9' },
    { key: 'HIP-FRACTURE-SUSPECT', name: 'कूल्हे की हड्डी टूटने की आशंका — आपातकाल (केवल रेफर)', nameEn: 'Suspected Hip Fracture — Emergency (Refer ONLY)', icd10: 'S72.0' },
    // Managed (links allowed)
    { key: 'POLYPHARMACY-REVIEW', name: 'बहु-औषधि समीक्षा (STOPP/START)', nameEn: 'Polypharmacy Review (STOPP/START)', icd10: 'Z79.8' },
    { key: 'FALLS-RISK-ASSESSMENT', name: 'गिरने के जोखिम का आकलन', nameEn: 'Falls Risk Assessment', icd10: 'R29.6' },
    { key: 'FALLS-REVERSIBLE', name: 'गिरना — प्रतिवर्ती कारणों की जांच', nameEn: 'Falls — Reversible Causes Workup', icd10: 'W19' },
    { key: 'DEMENTIA-WORKUP-SUSPECT', name: 'मनोभ्रंश संदिग्ध — जांच (प्रतिवर्ती कारण पहले)', nameEn: 'Suspected Dementia — Workup (reversible causes first)', icd10: 'F03' },
    { key: 'DEMENTIA-CARE-STABLE', name: 'मनोभ्रंश — देखभाल स्थिर', nameEn: 'Dementia — Stable Care Phase', icd10: 'F03' },
    { key: 'FRAILTY-SARCOPENIA-NUTRITION', name: 'कमजोरी / सार्कोपेनिया — पोषण योजना', nameEn: 'Frailty/Sarcopenia — Nutrition Plan', icd10: 'R54' },
    { key: 'CONSTIPATION-CHRONIC-ELDER', name: 'दीर्घकालिक कब्ज — बुज़ुर्ग (दवा-कारण जांच)', nameEn: 'Chronic Constipation — Elderly (drug-cause check)', icd10: 'K59.0' },
    { key: 'POST-HOSPITAL-SYNDROME-RECOVERY', name: 'अस्पताल-बाद पुनर्प्राप्ति', nameEn: 'Post-Hospital Syndrome Recovery', icd10: 'Z54' },
    { key: 'RECURRENT-UTI-ELDER', name: 'बार-बार पेशाब संक्रमण — बुज़ुर्ग (URO समन्वय)', nameEn: 'Recurrent UTI — Elderly (coordinate URO)', icd10: 'N39.0' },
    { key: 'SLEEP-INSOMNIA-ELDER', name: 'वृद्धों में अनिद्रा — नींद-स्वच्छता पहले', nameEn: 'Insomnia in the Elderly — Sleep Hygiene First', icd10: 'G47.0' },
    { key: 'ELDER-DEPRESSION-SUSPECT', name: 'वृद्ध अवसाद संदिग्ध (PSY समन्वय)', nameEn: 'Suspected Depression in the Elderly (coordinate PSY)', icd10: 'F32.9' },
    { key: 'ELDER-ABUSE-SUSPECT', name: 'वृद्ध दुर्व्यवहार की आशंका (संवेदनशील)', nameEn: 'Suspected Elder Abuse (sensitive)', icd10: 'T74.1' },
    { key: 'ADVANCE-CARE-PLAN', name: 'उन्नत देखभाल योजना (ONC-पैलियेटिव समन्वय)', nameEn: 'Advance Care Planning (coordinate ONC-palliative)', icd10: 'Z71.8' },
    { key: 'VACCINATION-ELDER-REVIEW', name: 'वृद्ध टीकाकरण समीक्षा', nameEn: 'Elderly Vaccination Review', icd10: 'Z23' },
  ],

  // ══ Medicines (16) — geriatric-safe conservative only ════════════════
  // ⚠ No benzodiazepines/Z-drugs (avoid-framing in content), no Avil/
  // meclizine (anticholinergic burden), no chronic NSAID, no new dementia
  // drugs (Donep = continuation-verify only). All verified:false.
  medicines: [
    // Analgesia — Crocin FIRST, chronic NSAID never
    { name: 'Crocin 650 Tablet', salt: 'Paracetamol 650 mg (FIRST-line pain in old age; daily NSAID harms kidney/stomach/heart — if a regular painkiller seems needed, review WHY instead)', doseOptions: ['1 tab (650 mg) SOS', '1 tab every 8 hrs (max 3/day)'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Gastric cover
    { name: 'Pan 40 Tablet', salt: 'Pantoprazole 40 mg (cover if any NSAID/steroid appears on the pill-bag list)', doseOptions: ['1 tab before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Omez 20 Capsule', salt: 'Omeprazole 20 mg (alternative gastric cover)', doseOptions: ['1 cap before breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Digene Gel 200ml', salt: 'Antacid gel (Mg/Al hydroxide + Simethicone) — SOS acidity', doseOptions: ['10 ml SOS after meals'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Constipation ladder (fibre → syrup → rescue)
    { name: 'Naturolax Granules', salt: 'Ispaghula (Psyllium) husk fibre — LADDER STEP 1 (with 2-3 L water daily)', doseOptions: ['1-2 tsp in 1 glass water at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cremaffin Syrup 225ml', salt: 'Milk of Magnesia + Liquid Paraffin — LADDER STEP 2', doseOptions: ['15 ml at bedtime', '15 ml twice daily'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Duphalac Solution 200ml', salt: 'Lactulose 10 g/15 ml — gentle STEP 2 alternative (may take 1-2 days)', doseOptions: ['15 ml at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dulcolax 5 Tablet', salt: 'Bisacodyl 5 mg — RESCUE only when 3+ days without stool despite ladder', doseOptions: ['1-2 tabs at bedtime (rescue only)'], morning: 0, afternoon: 0, evening: 2, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Hydration / nutrition / vitamins
    { name: 'Electral Sachet (ORS)', salt: 'WHO ORS — Na/K/Cl/Citrate/Glucose (rehydration in post-hospital/heat/UTI days)', doseOptions: ['1 sachet in 1 L water — sip through the day'], morning: 1, afternoon: 1, evening: 1, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Calcirol 60K Sachet', salt: 'Cholecalciferol 60,000 IU (vitamin-D — India deficiency near-epidemic; dose per D3 report)', doseOptions: ['1 sachet monthly with milk — per D3 report'], morning: 1, afternoon: 0, evening: 0, tab: 4, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Shelcal 500 Tablet', salt: 'Calcium Carbonate 500 mg + Vitamin D3 250 IU (bone/falls support; after food)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Neurobion Forte Tablet', salt: 'Vitamin B-Complex + B12 (reversible memory/fatigue workup support)', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Methycobal 500 Tablet', salt: 'Mecobalamin (Vitamin B12) 500 mcg — B12 deficiency is a reversible memory/fatigue/neuropathy cause', doseOptions: ['1 tab daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Zincovit Syrup 200ml', salt: 'Multivitamin + Multimineral + Zinc syrup (elder-friendly when tablets are hard to swallow; food-first framing)', doseOptions: ['10 ml twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // Neuro territory — continuation-verify ONLY
    { name: 'Donep 5 Tablet', salt: 'Donepezil 5 mg — ⚠ CONTINUATION-VERIFY ONLY: NEU owns dementia medicines; continue exactly as neurologist prescribed; NEVER start or double it yourself', doseOptions: ['1 tab at bedtime — continue exactly as NEU prescribed'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'na', pediatric: 'na', schedule: 'H', verified: false } },

    // Sleep — the ONLY mild entry (hygiene first)
    { name: 'Meloset 3 Tablet', salt: 'Melatonin 3 mg (sleep-hygiene-FIRST; mild non-habit option; benzo/Z-drugs avoided in elderly — falls + memory loss)', doseOptions: ['1 tab at bedtime — after hygiene measures'], morning: 0, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (24 — emergency/coordinate findings ZERO) ═
  findingMeds: [
    // POLYPHARMACY-REVIEW — the switch/covers that replace risky drugs
    { findingKey: 'POLYPHARMACY-REVIEW', medicineName: 'Crocin 650 Tablet', dose: '1 tab SOS', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Swap: any daily NSAID painkiller → paracetamol first-line' },
    { findingKey: 'POLYPHARMACY-REVIEW', medicineName: 'Pan 40 Tablet', dose: '1 tab before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Gastric cover IF an NSAID/steroid stays on the list pending review' },
    { findingKey: 'POLYPHARMACY-REVIEW', medicineName: 'Omez 20 Capsule', dose: '1 cap before breakfast', morning: 1, afternoon: 0, evening: 0, tab: 15, description: 'Alternative cover' },
    { findingKey: 'POLYPHARMACY-REVIEW', medicineName: 'Digene Gel 200ml', dose: '10 ml SOS', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'SOS breakthrough acidity' },
    // FALLS-RISK-ASSESSMENT — bone/vitamin support
    { findingKey: 'FALLS-RISK-ASSESSMENT', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly — per D3 report', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Vitamin-D repletion — deficiency weakens muscles and balance' },
    { findingKey: 'FALLS-RISK-ASSESSMENT', medicineName: 'Shelcal 500 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Calcium support alongside' },
    // FALLS-REVERSIBLE — correcting the reversible
    { findingKey: 'FALLS-REVERSIBLE', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'D-deficiency correction while BP-meds/sugar/vision/home causes are fixed' },
    // DEMENTIA-WORKUP-SUSPECT — reversible-cause support while testing
    { findingKey: 'DEMENTIA-WORKUP-SUSPECT', medicineName: 'Methycobal 500 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'B12 repletion — low B12 mimics and worsens memory loss' },
    { findingKey: 'DEMENTIA-WORKUP-SUSPECT', medicineName: 'Neurobion Forte Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'B-complex alongside the thyroid/B12/depresion workup' },
    // DEMENTIA-CARE-STABLE — routine + continuation only
    { findingKey: 'DEMENTIA-CARE-STABLE', medicineName: 'Donep 5 Tablet', dose: '1 tab at bedtime — AS PRESCRIBED BY NEU', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'CONTINUATION-VERIFY only — never start/double here' },
    { findingKey: 'DEMENTIA-CARE-STABLE', medicineName: 'Neurobion Forte Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Support alongside NEU therapy' },
    { findingKey: 'DEMENTIA-CARE-STABLE', medicineName: 'Meloset 3 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'Sundowning/sleep support — non-habit; benzos avoided' },
    // FRAILTY-SARCOPENIA-NUTRITION — protein-first + support
    { findingKey: 'FRAILTY-SARCOPENIA-NUTRITION', medicineName: 'Zincovit Syrup 200ml', dose: '10 ml twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Multivitamin support — food-first (egg/paneer/mashed dal/curd daily)' },
    { findingKey: 'FRAILTY-SARCOPENIA-NUTRITION', medicineName: 'Calcirol 60K Sachet', dose: '1 sachet monthly', morning: 1, afternoon: 0, evening: 0, tab: 4, description: 'Vitamin-D for muscle strength' },
    { findingKey: 'FRAILTY-SARCOPENIA-NUTRITION', medicineName: 'Shelcal 500 Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Calcium alongside' },
    // CONSTIPATION-CHRONIC-ELDER — the ladder
    { findingKey: 'CONSTIPATION-CHRONIC-ELDER', medicineName: 'Naturolax Granules', dose: '1-2 tsp in 1 glass water at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'LADDER STEP 1 — fibre daily, with 2-3 L water' },
    { findingKey: 'CONSTIPATION-CHRONIC-ELDER', medicineName: 'Cremaffin Syrup 225ml', dose: '15 ml at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'STEP 2 — if fibre alone fails' },
    { findingKey: 'CONSTIPATION-CHRONIC-ELDER', medicineName: 'Duphalac Solution 200ml', dose: '15 ml at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'STEP 2 alternative — gentler' },
    { findingKey: 'CONSTIPATION-CHRONIC-ELDER', medicineName: 'Dulcolax 5 Tablet', dose: '1-2 tabs at bedtime', morning: 0, afternoon: 0, evening: 2, tab: 10, description: 'RESCUE only — 3+ days without stool despite the ladder' },
    // POST-HOSPITAL-SYNDROME-RECOVERY
    { findingKey: 'POST-HOSPITAL-SYNDROME-RECOVERY', medicineName: 'Zincovit Syrup 200ml', dose: '10 ml twice daily after food', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Rebuild phase — tiny-goals walking + protein first' },
    { findingKey: 'POST-HOSPITAL-SYNDROME-RECOVERY', medicineName: 'Neurobion Forte Tablet', dose: '1 tab daily after food', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'B-complex through recovery' },
    { findingKey: 'POST-HOSPITAL-SYNDROME-RECOVERY', medicineName: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water — sip through the day', morning: 1, afternoon: 1, evening: 1, tab: 4, description: 'Hydration rebuilds strength fastest' },
    // RECURRENT-UTI-ELDER — hydration support only (no antibiotics here)
    { findingKey: 'RECURRENT-UTI-ELDER', medicineName: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water on symptomatic days', morning: 1, afternoon: 1, evening: 1, tab: 4, description: 'Hydration during symptomatic episodes — antibiotics ONLY with symptoms, via URO/GP' },
    // SLEEP-INSOMNIA-ELDER — hygiene first, mild non-habit option
    { findingKey: 'SLEEP-INSOMNIA-ELDER', medicineName: 'Meloset 3 Tablet', dose: '1 tab at bedtime', morning: 0, afternoon: 0, evening: 1, tab: 15, description: 'AFTER hygiene measures — sunlight morning, no late caffeine, no long naps; benzo/Z-drugs avoided' },
  ],

  // ══ Table templates (3) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Pill Review Card (Bring-All-Bag)',
      rows: 6,
      cols: 4,
      headerLabel: ['क्रम', 'दवा का नाम', 'सुबह / दोपहर / रात', 'जारी रखें / रोकने की चर्चा'],
      colsLabel: ['No.', 'Medicine Name', 'Morning / Afternoon / Night', 'Continue / Discuss Stopping'],
      footerLabel: ['सभी डिब्बे-पत्तियां-टॉनिक एक ही थैली में लाएं — घर में बंद पड़ी और बिना-पर्चे वाली दवाएं भी / Bring ALL boxes, strips and tonics in ONE bag — including unused and no-prescription medicines'],
    },
    {
      name: 'Home Falls Proofing (Indian Home Checklist)',
      rows: 7,
      cols: 3,
      headerLabel: ['जगह', 'आम खतरा (भारतीय घर)', 'सुधार'],
      colsLabel: ['Area', 'Common Hazard (Indian home)', 'Fix'],
      footerLabel: ['रात में शौचालय का रास्ता रोशन रखें — अंधेरे में ठोकर लगना सबसे आम कारण है / Keep the toilet route lit at night — stumbling in the dark is the commonest cause of falls'],
    },
    {
      name: 'Elder Daily Routine (Caregiver Printable)',
      rows: 8,
      cols: 3,
      headerLabel: ['समय', 'कार्य', 'नोट'],
      colsLabel: ['Time', 'Task', 'Note'],
      footerLabel: ['दीवार पर लगाने योग्य — एक जैसी दिनचर्या भ्रम (डिमेंशिया) में शांति देती है / Wall-printable — an identical daily routine brings calm in confusion (dementia)'],
    },
  ],

  // ══ Rx quick-packages (3) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Comprehensive Geriatric Review',
      diagnosis: 'POLYPHARMACY-REVIEW',
      medicines: [
        { name: 'Crocin 650 Tablet', dose: '1 tab SOS', duration: '15 days', instructions: 'Pain first-line — swap for any daily painkiller (NSAID) found in the bag' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food — B12 support pending reports' },
        { name: 'Calcirol 60K Sachet', dose: '1 sachet monthly', duration: '3 months', instructions: 'With milk — dose per the D3 report' },
      ],
      labs: ['CBC + Vitamin B12 + Vitamin D3', 'TSH + Creatinine + Electrolytes + HbA1c', 'Urine routine ONLY if symptoms present'],
      advice: 'अगली विज़िट में सारी दवाओं की डिब्बियां एक थैली में लाएं — कम-से-कम जरूरी दवाओं तक जाएंगे · दर्द में Crocin पहली पसंद — रोज़ की दर्द गोली (NSAID) बुढ़ापे में किडनी-पेट-दिल के लिए खतरनाक · घर में गिरने के खतरे की जांच करें · हर महीने वजन नोट करें',
      followUpDays: 14,
      isCommon: true,
    },
    {
      name: 'Constipation — Ladder Bundle',
      diagnosis: 'CONSTIPATION-CHRONIC-ELDER',
      medicines: [
        { name: 'Naturolax Granules', dose: '1-2 tsp in 1 glass water', duration: '15 days', instructions: 'Bedtime — LADDER STEP 1, with 2-3 L water through the day' },
        { name: 'Cremaffin Syrup 225ml', dose: '15 ml at bedtime', duration: '15 days', instructions: 'STEP 2 — only if fibre alone fails' },
        { name: 'Dulcolax 5 Tablet', dose: '1-2 tabs at bedtime', duration: '10 days', instructions: 'RESCUE only — 3+ days without stool despite the ladder' },
      ],
      labs: ['Medicine review for constipating drugs (iron/painkillers/anticholinergics)', 'TSH if constipation stays refractory'],
      advice: 'सीढ़ी-क्रम: फाइबर (सब्ज़ी-फल-चोकर) → रोज़ 2.5-3 लीटर पानी → 20-30 मिनट टहलना → दवा · रात की दवा असर अगली सुबह करती है — धैर्य रखें · कब्ज + उल्टी/तेज़ पेट दर्द/खून = उसी दिन अस्पताल · आयरन और दर्द की गोलियां कब्ज करती हैं — सूची जरूर दिखाएं',
      followUpDays: 7,
    },
    {
      name: 'Post-Hospital Recovery Visit',
      diagnosis: 'POST-HOSPITAL-SYNDROME-RECOVERY',
      medicines: [
        { name: 'Zincovit Syrup 200ml', dose: '10 ml twice daily', duration: '15 days', instructions: 'After food — support while intake rebuilds' },
        { name: 'Neurobion Forte Tablet', dose: '1 tab', duration: '30 days', instructions: 'After food' },
        { name: 'Electral Sachet (ORS)', dose: '1 sachet in 1 L water', duration: '5 days', instructions: 'Sip through the day — hydration rebuilds strength fastest' },
      ],
      labs: ['Repeat CBC / creatinine / electrolytes per discharge advice', 'Weight weekly — write it down'],
      advice: 'छोटे लक्ष्य: आज 10 कदम → कल 15 — बेड-रेस्ट का हर हफ्ता मांसपेशी खाता है · खाने में प्रोटीन पहले — अंडा/पनीर/मैश की दाल/दही, दिन में 5-6 छोटे वक्त · अस्पताल का पर्चा + रिपोर्टें अगली विज़िट में — दवा-सूची मिलाएंगे · कोई भी नई दवा खुद शुरू नहीं',
      followUpDays: 7,
      isCommon: true,
    },
  ],
}
