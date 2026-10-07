/**
 * DRM-01 — DERMATOLOGY STARTER PACK (T1)
 *
 * "Look & local treat": the India derm OPD core — acne, tinea (enormous in
 * India), hairfall, pigmentation, eczema/urticaria, psoriasis + the everyday
 * lumps, bites and itches. Recurring question pattern: site-of-lesion +
 * duration + itching + spreading + family history + "which cream did you
 * already apply" (topical-steroid-abuse screening — a daily India reality).
 *
 * Language: Hindi primary (patient-facing / ask-aloud / printed advice),
 * English secondary (doctor search). Medicine names = Indian English brands;
 * topical products carry their form & pack size in the name.
 *
 * ⚠ UNVERIFIED-DOSE MODE (docs/specialty-packs/04-CONTENT-WORKFLOW.md):
 * Doses are standard Indian-derm-formulary adult defaults but have NOT yet
 * been signed off by an MBBS/MD reviewer. UI must show the unverified-dose
 * badge until meta.reviewedBy is stamped. Extra-red-flag items in this pack:
 * isotretinoin (teratogenic, Schedule H), the topical steroid ladder
 * (Tenovate/clobetasol class), hydroquinone & triple-combination creams
 * (max 2-3 months), finasteride (men only), ivermectin (weight-based).
 *
 * SAFETY POLICY: NO fixed corticosteroid+antifungal or corticosteroid+
 * antibiotic combination creams are included at all (the banned-in-India
 * "Quadriderm class"). No coal tar + steroid mixes; no Schedule X items.
 *
 * Sources: NLEM 2023 (dermatology section backbone), standard Indian derm
 * OPD formulary & prescribing patterns, legacy derma seed (Gujarati → Hindi
 * conversion) for field conventions.
 */

import type { SpecialtyPack } from '../types'

export const DRM01_PACK: SpecialtyPack = {
  meta: {
    code: 'DRM-01',
    version: '1.0.0',
    tier: 'T1',
    title: 'Dermatology Starter Pack',
    reviewedBy: '', // empty = unverified-dose mode
    sourceNotes:
      'NLEM 2023 (derm section) · standard Indian derm OPD formulary · adapted from legacy derma seed (Gujarati → Hindi) · unverified-dose launch mode',
  },

  // ══ Categories (7) ════════════════════════════════════════════════════
  categories: [
    { key: 'ACN', name: 'मुंहासे व चेहरा', nameEn: 'Acne & Face' },
    { key: 'HIR', name: 'बाल व सिर की त्वचा', nameEn: 'Hair & Scalp' },
    { key: 'FUN', name: 'फंगल संक्रमण', nameEn: 'Fungal Infection' },
    { key: 'ECZ', name: 'एक्जिमा व एलर्जी', nameEn: 'Eczema & Allergy' },
    { key: 'PIG', name: 'रंगत व दाग', nameEn: 'Pigmentation' },
    { key: 'CHR', name: 'पुरानी त्वचा बीमारियां', nameEn: 'Chronic Conditions' },
    { key: 'OTH', name: 'सामान्य त्वचा समस्याएं', nameEn: 'Others' },
  ],

  // ══ Complaints (47) ═══════════════════════════════════════════════════
  complaints: [
    // ACN — Acne & Face
    { code: 'ACN01', categoryKey: 'ACN', detail: 'मुंहासे / पिंपल्स', detailEn: 'Pimples / Acne' },
    { code: 'ACN02', categoryKey: 'ACN', detail: 'पीठ / छाती पर मुंहासे', detailEn: 'Back / Chest Acne' },
    { code: 'ACN03', categoryKey: 'ACN', detail: 'मुंहासों के दाग', detailEn: 'Acne Marks / Dark Spots' },
    { code: 'ACN04', categoryKey: 'ACN', detail: 'खुले रोमछिद्र', detailEn: 'Open Pores / Oily Skin' },
    { code: 'ACN05', categoryKey: 'ACN', detail: 'आंखों के नीचे काले घेरे', detailEn: 'Dark Circles' },
    { code: 'ACN06', categoryKey: 'ACN', detail: 'चेहरे पर लाली व जलन', detailEn: 'Facial Redness / Irritation' },
    { code: 'ACN07', categoryKey: 'ACN', detail: 'नाक-भौहों पर छिलके', detailEn: 'Flaking Around Nose & Brows' },
    // HIR — Hair & Scalp
    { code: 'HIR01', categoryKey: 'HIR', detail: 'बाल झड़ना', detailEn: 'Hair Fall' },
    { code: 'HIR02', categoryKey: 'HIR', detail: 'रूसी / डेंड्रफ', detailEn: 'Dandruff' },
    { code: 'HIR03', categoryKey: 'HIR', detail: 'सिर पर गंजे धब्बे', detailEn: 'Bald Patches' },
    { code: 'HIR04', categoryKey: 'HIR', detail: 'बीमारी के बाद बाल पतले होना', detailEn: 'Hair Thinning After Illness' },
    { code: 'HIR05', categoryKey: 'HIR', detail: 'सिर में खुजली व छिलके', detailEn: 'Scalp Itching & Scales' },
    { code: 'HIR06', categoryKey: 'HIR', detail: 'बाल जल्दी सफेद होना', detailEn: 'Premature Greying' },
    { code: 'HIR07', categoryKey: 'HIR', detail: 'बाल रूखे व टूटना', detailEn: 'Dry & Brittle Hair' },
    // FUN — Fungal Infection
    { code: 'FUN01', categoryKey: 'FUN', detail: 'दाद / रिंगवर्म', detailEn: 'Ringworm / Tinea' },
    { code: 'FUN02', categoryKey: 'FUN', detail: 'जांघों / गुप्तांग में खुजली', detailEn: 'Jock Itch (Groin Itching)' },
    { code: 'FUN03', categoryKey: 'FUN', detail: 'पैरों की उंगलियों में खुजली', detailEn: 'Athlete Foot (Toe Web Itch)' },
    { code: 'FUN04', categoryKey: 'FUN', detail: 'नाखून मोटा व रंग बदलना', detailEn: 'Nail Fungus' },
    { code: 'FUN05', categoryKey: 'FUN', detail: 'गर्दन / पीठ पर सफेद दाग', detailEn: 'White Spots on Neck/Back' },
    { code: 'FUN06', categoryKey: 'FUN', detail: 'फोड़े-फुंसी', detailEn: 'Boils / Abscess' },
    { code: 'FUN07', categoryKey: 'FUN', detail: 'हथेली की त्वचा उतरना', detailEn: 'Palm Peeling' },
    // ECZ — Eczema & Allergy
    { code: 'ECZ01', categoryKey: 'ECZ', detail: 'त्वचा पर लाल दाने / एलर्जी', detailEn: 'Skin Rash / Allergy' },
    { code: 'ECZ02', categoryKey: 'ECZ', detail: 'पित्ती / शरीर पर चढ़ना', detailEn: 'Hives / Urticaria' },
    { code: 'ECZ03', categoryKey: 'ECZ', detail: 'त्वचा रूखी व खुजली', detailEn: 'Dry Itchy Skin' },
    { code: 'ECZ04', categoryKey: 'ECZ', detail: 'हाथों पर एक्जिमा / दाने', detailEn: 'Hand Eczema' },
    { code: 'ECZ05', categoryKey: 'ECZ', detail: 'धूप से त्वचा पर दाने', detailEn: 'Sun Allergy (PMLE)' },
    { code: 'ECZ06', categoryKey: 'ECZ', detail: 'दवा लेने के बाद रैश', detailEn: 'Drug Rash' },
    { code: 'ECZ07', categoryKey: 'ECZ', detail: 'घमौड़ियां', detailEn: 'Prickly Heat' },
    { code: 'ECZ08', categoryKey: 'ECZ', detail: 'एड़ी / त्वचा फटना', detailEn: 'Cracked Skin / Heels' },
    // PIG — Pigmentation
    { code: 'PIG01', categoryKey: 'PIG', detail: 'चेहरे पर गहरे धब्बे (मेलास्मा)', detailEn: 'Dark Patches / Melasma' },
    { code: 'PIG02', categoryKey: 'PIG', detail: 'त्वचा काली पड़ना / टैनिंग', detailEn: 'Tanning' },
    { code: 'PIG03', categoryKey: 'PIG', detail: 'बढ़ते सफेद धब्बे', detailEn: 'Growing White Patches (Vitiligo?)' },
    { code: 'PIG04', categoryKey: 'PIG', detail: 'घाव के बाद काला दाग', detailEn: 'Post-wound Dark Mark' },
    { code: 'PIG05', categoryKey: 'PIG', detail: 'त्वचा का रंग बदलना', detailEn: 'Skin Colour Changes' },
    // CHR — Chronic
    { code: 'CHR01', categoryKey: 'CHR', detail: 'शरीर पर लाल-सफेद छिलके वाले चकत्ते', detailEn: 'Scaly Red Patches (Psoriasis?)' },
    { code: 'CHR02', categoryKey: 'CHR', detail: 'हथेली / तलवों पर मोटी फटी त्वचा', detailEn: 'Thick Cracked Palms/Soles' },
    { code: 'CHR03', categoryKey: 'CHR', detail: 'महीनों से खुजली', detailEn: 'Chronic Itching' },
    { code: 'CHR04', categoryKey: 'CHR', detail: 'बैंगनी चिकने चकत्ते', detailEn: 'Violaceous Shiny Plaques (Lichen Planus?)' },
    // OTH — Others
    { code: 'OTH01', categoryKey: 'OTH', detail: 'तिल की जांच', detailEn: 'Mole Check' },
    { code: 'OTH02', categoryKey: 'OTH', detail: 'मस्से', detailEn: 'Warts' },
    { code: 'OTH03', categoryKey: 'OTH', detail: 'मांस के छोटे दाने लटकना', detailEn: 'Skin Tags' },
    { code: 'OTH04', categoryKey: 'OTH', detail: 'कीड़े के काटने पर जलन / सूजन', detailEn: 'Insect Bite Reaction' },
    { code: 'OTH05', categoryKey: 'OTH', detail: 'परिवार में सबको खुजली', detailEn: 'Itching in Whole Family (Scabies?)' },
    { code: 'OTH06', categoryKey: 'OTH', detail: 'जलने का दाग', detailEn: 'Burn Scar' },
    { code: 'OTH07', categoryKey: 'OTH', detail: 'फूला हुआ निशान (केलॉइड)', detailEn: 'Keloid / Raised Scar' },
    { code: 'OTH08', categoryKey: 'OTH', detail: 'स्ट्रेच मार्क्स', detailEn: 'Stretch Marks' },
    { code: 'OTH09', categoryKey: 'OTH', detail: 'घाव जो भर नहीं रहा', detailEn: 'Non-healing Ulcer' },
  ],

  // ══ Questions (94 — 2 per complaint, idx 0-93) ════════════════════════
  // AUTHORING CONVENTION: every question carries its array index as a
  // trailing `// idx N` comment; the suggestions section below references
  // those numbers. Keep this in sync on every edit (index drift = bug).
  questions: [
    // ACN01 — Pimples
    { complaintCode: 'ACN01', question: 'कितने समय से मुंहासे निकल रहे हैं?', questionEn: 'Since how long have you been getting pimples?' }, // idx 0
    { complaintCode: 'ACN01', question: 'क्या बिना डॉक्टर की सलाह से कोई क्रीम (खासकर स्टेरॉयड वाली) लगाई है?', questionEn: 'Have you applied any cream without advice, especially a steroid one?' }, // idx 1
    // ACN02 — Back/Chest acne
    { complaintCode: 'ACN02', question: 'क्या चेहरे पर भी मुंहासे हैं?', questionEn: 'Do you also have pimples on the face?' }, // idx 2
    { complaintCode: 'ACN02', question: 'क्या गर्मी और पसीने में ये बढ़ते हैं?', questionEn: 'Do they worsen in heat and sweating?' }, // idx 3
    // ACN03 — Acne marks
    { complaintCode: 'ACN03', question: 'दाग चपटे काले धब्बे हैं या गड्ढे (पिटेड) हैं?', questionEn: 'Are the marks flat dark spots or pitted scars?' }, // idx 4
    { complaintCode: 'ACN03', question: 'क्या अभी भी नए मुंहासे निकल रहे हैं?', questionEn: 'Are new pimples still appearing?' }, // idx 5
    // ACN04 — Open pores
    { complaintCode: 'ACN04', question: 'क्या त्वचा दिनभर तैलीय रहती है?', questionEn: 'Does your skin stay oily through the day?' }, // idx 6
    { complaintCode: 'ACN04', question: 'क्या आप मुंहासे नोचते या दबाते हैं?', questionEn: 'Do you pick or squeeze your pimples?' }, // idx 7
    // ACN05 — Dark circles
    { complaintCode: 'ACN05', question: 'रात को नींद कितने घंटे होती है?', questionEn: 'How many hours do you sleep at night?' }, // idx 8
    { complaintCode: 'ACN05', question: 'क्या आंखों में खुजली या एलर्जी/छींक भी आती है?', questionEn: 'Do you also have eye itching or allergy/sneezing?' }, // idx 9
    // ACN06 — Facial redness
    { complaintCode: 'ACN06', question: 'चेहरे की लाली को कितने हफ्ते हुए?', questionEn: 'Since how many weeks is the facial redness there?' }, // idx 10
    { complaintCode: 'ACN06', question: 'क्या कोई क्रीम लगाने से राहत मिलती है और बंद करने पर फिर बढ़ जाती है?', questionEn: 'Does a cream relieve it, but it flares back when stopped?' }, // idx 11
    // ACN07 — Flaking nose/brows
    { complaintCode: 'ACN07', question: 'क्या सिर में रूसी भी है?', questionEn: 'Do you also have dandruff on the scalp?' }, // idx 12
    { complaintCode: 'ACN07', question: 'क्या छिलकों के साथ खुजली होती है?', questionEn: 'Is there itching along with the flaking?' }, // idx 13
    // HIR01 — Hair fall
    { complaintCode: 'HIR01', question: 'बाल कितने महीनों से झड़ रहे हैं?', questionEn: 'Since how many months is the hair falling?' }, // idx 14
    { complaintCode: 'HIR01', question: 'परिवार में (पिता / नाना / मामा) को भी बाल झड़े थे?', questionEn: 'Did family members (father/maternal grandfather/uncle) also have hair loss?' }, // idx 15
    // HIR02 — Dandruff
    { complaintCode: 'HIR02', question: 'रूसी सफेद-सूखी है या पीली-चिपचिपी?', questionEn: 'Is the dandruff white-dry or yellow-greasy?' }, // idx 16
    { complaintCode: 'HIR02', question: 'क्या रूसी के साथ खुजली भी होती है?', questionEn: 'Do you have itching along with the dandruff?' }, // idx 17
    // HIR03 — Bald patches
    { complaintCode: 'HIR03', question: 'धब्बे पर बाल पूरे गिरे हैं या छोटे-टूटे बाल हैं?', questionEn: 'Is the patch totally bald or does it show short broken hairs?' }, // idx 18
    { complaintCode: 'HIR03', question: 'शरीर पर या दाढ़ी में भी ऐसे धब्बे हैं?', questionEn: 'Do you have similar patches on the body or beard?' }, // idx 19
    // HIR04 — Thinning after illness
    { complaintCode: 'HIR04', question: 'कितने महीने पहले बीमारी, ऑपरेशन या प्रसव हुआ?', questionEn: 'How many months ago was the illness, surgery or delivery?' }, // idx 20
    { complaintCode: 'HIR04', question: 'रोज कितने बाल झड़ते हैं (कंघी / तकिया पर)?', questionEn: 'How many hairs fall daily (on comb/pillow)?' }, // idx 21
    // HIR05 — Scalp itch & scales
    { complaintCode: 'HIR05', question: 'बालों में तेल लगाने के बाद कितने दिन तक रखते हैं?', questionEn: 'After applying hair oil, how many days before you wash?' }, // idx 22
    { complaintCode: 'HIR05', question: 'परिवार के बच्चों या सदस्यों को भी सिर में दाद है?', questionEn: 'Do children/family members also have scalp ringworm?' }, // idx 23
    // HIR06 — Greying
    { complaintCode: 'HIR06', question: 'कितनी उम्र में सफेद बाल शुरू हुए?', questionEn: 'At what age did the greying start?' }, // idx 24
    { complaintCode: 'HIR06', question: 'परिवार में किसी के भी बाल जल्दी सफेद हुए?', questionEn: 'Did anyone in the family grey early?' }, // idx 25
    // HIR07 — Dry brittle hair
    { complaintCode: 'HIR07', question: 'क्या बालों पर रंग, स्ट्रेटनिंग या हीट स्टाइलिंग कराई है?', questionEn: 'Have you done colouring/straightening/heat styling?' }, // idx 26
    { complaintCode: 'HIR07', question: 'कोई थायरॉइड की बीमारी या दवा चल रही है?', questionEn: 'Any thyroid disease or medicine going on?' }, // idx 27
    // FUN01 — Ringworm
    { complaintCode: 'FUN01', question: 'दाद शरीर के किन-किन हिस्सों पर है?', questionEn: 'On which body parts do you have ringworm?' }, // idx 28
    { complaintCode: 'FUN01', question: 'कितने हफ्तों से है और क्या फैल रहा है?', questionEn: 'Since how many weeks, and is it spreading?' }, // idx 29
    // FUN02 — Jock itch
    { complaintCode: 'FUN02', question: 'क्या खुजली के लिए कोई क्रीम या पाउडर लगा रहे हैं?', questionEn: 'Have you been applying any cream or powder for the itch?' }, // idx 30
    { complaintCode: 'FUN02', question: 'क्या पैरों या नाखूनों में भी फंगल संक्रमण है?', questionEn: 'Do you also have fungal infection of the feet or nails?' }, // idx 31
    // FUN03 — Athlete foot
    { complaintCode: 'FUN03', question: 'क्या पैर ज्यादा देर गीले या पसीने से भरे रहते हैं?', questionEn: 'Do your feet stay wet or sweaty for long hours?' }, // idx 32
    { complaintCode: 'FUN03', question: 'क्या उंगलियों के बीच की त्वचा सफेद-मुलायम है?', questionEn: 'Is the skin between the toes white and soggy?' }, // idx 33
    // FUN04 — Nail fungus
    { complaintCode: 'FUN04', question: 'कितने नाखून प्रभावित हैं और कितने महीने से?', questionEn: 'How many nails are affected and since how many months?' }, // idx 34
    { complaintCode: 'FUN04', question: 'क्या शरीर पर दाद भी हुआ था?', questionEn: 'Did you also have ringworm on the body?' }, // idx 35
    // FUN05 — White spots neck/back
    { complaintCode: 'FUN05', question: 'धूप में आने पर दाग सफेद और आसपास की त्वचा गहरी दिखती है?', questionEn: 'In sunlight, do the spots look white against darker surrounding skin?' }, // idx 36
    { complaintCode: 'FUN05', question: 'क्या दाग पर हल्की खुजली होती है?', questionEn: 'Do the spots itch mildly?' }, // idx 37
    // FUN06 — Boils
    { complaintCode: 'FUN06', question: 'क्या फोड़ा बहुत दर्दनाक है या बुखार के साथ है?', questionEn: 'Is the boil very painful or accompanied by fever?' }, // idx 38
    { complaintCode: 'FUN06', question: 'क्या बार-बार फोड़े आते हैं?', questionEn: 'Do boils recur frequently?' }, // idx 39
    // FUN07 — Palm peeling
    { complaintCode: 'FUN07', question: 'एक हथेली प्रभावित है या दोनों?', questionEn: 'Is one palm affected or both?' }, // idx 40
    { complaintCode: 'FUN07', question: 'क्या पानी, साबुन या डिटर्जेंट से बढ़ता है?', questionEn: 'Does it worsen with water, soap or detergent?' }, // idx 41
    // ECZ01 — Rash/allergy
    { complaintCode: 'ECZ01', question: 'दाने कहां से शुरू हुए और कहां-कहां फैले हैं?', questionEn: 'Where did the rash start and where has it spread?' }, // idx 42
    { complaintCode: 'ECZ01', question: 'कोई नई चीज (साबुन / गहना / कपड़ा / खाना / दवा) हाल में शुरू की?', questionEn: 'Did you recently start anything new (soap/jewellery/cloth/food/medicine)?' }, // idx 43
    // ECZ02 — Hives
    { complaintCode: 'ECZ02', question: 'पित्ती कितने समय से आ रही है — 6 हफ्ते से ज्यादा?', questionEn: 'Since how long have the hives been coming — more than 6 weeks?' }, // idx 44
    { complaintCode: 'ECZ02', question: 'क्या होंठ, आंख या सांस में सूजन/तकलीफ के साथ आई?', questionEn: 'Any swelling of lips/eyes or breathing difficulty along with it?' }, // idx 45
    // ECZ03 — Dry skin
    { complaintCode: 'ECZ03', question: 'क्या सर्दियों में या नहाने के बाद खुजली बढ़ती है?', questionEn: 'Does the itching worsen in winter or after bathing?' }, // idx 46
    { complaintCode: 'ECZ03', question: 'क्या आप गर्म पानी से नहाते हैं?', questionEn: 'Do you bathe with hot water?' }, // idx 47
    // ECZ04 — Hand eczema
    { complaintCode: 'ECZ04', question: 'रोज कितने घंटे हाथ पानी / साबुन / केमिकल में रहते हैं?', questionEn: 'How many hours daily do your hands stay in water/soap/chemicals?' }, // idx 48
    { complaintCode: 'ECZ04', question: 'क्या काम के समय दस्ताने पहनते हैं?', questionEn: 'Do you wear gloves while working?' }, // idx 49
    // ECZ05 — Sun allergy
    { complaintCode: 'ECZ05', question: 'धूप में निकलने के कितनी देर बाद दाने निकलते हैं?', questionEn: 'How soon after sun exposure do the lesions appear?' }, // idx 50
    { complaintCode: 'ECZ05', question: 'क्या कोई दवा नई चालू की है?', questionEn: 'Have you started any new medicine?' }, // idx 51
    // ECZ06 — Drug rash
    { complaintCode: 'ECZ06', question: 'कौन सी दवा शुरू की और कब से?', questionEn: 'Which medicine did you start, and since when?' }, // idx 52
    { complaintCode: 'ECZ06', question: 'क्या बुखार, मुंह में छाले या त्वचा में दर्द के साथ रैश है?', questionEn: 'Is the rash with fever, mouth ulcers or skin pain/burning?' }, // idx 53
    // ECZ07 — Prickly heat
    { complaintCode: 'ECZ07', question: 'क्या दाने गर्दन, कमर व घुटनों जैसे सिलवों में ज्यादा हैं?', questionEn: 'Are the lesions mostly in the folds — neck, waist, knees?' }, // idx 54
    { complaintCode: 'ECZ07', question: 'क्या टाइट या सिंथेटिक कपड़े पहनते हैं?', questionEn: 'Do you wear tight or synthetic clothes?' }, // idx 55
    // ECZ08 — Cracked heels
    { complaintCode: 'ECZ08', question: 'क्या फटन से दर्द या खून आता है?', questionEn: 'Do the cracks pain or bleed?' }, // idx 56
    { complaintCode: 'ECZ08', question: 'क्या ज्यादा देर खड़े रहते हैं या खुली चप्पल पहनते हैं?', questionEn: 'Do you stand for long hours or wear open slippers?' }, // idx 57
    // PIG01 — Melasma
    { complaintCode: 'PIG01', question: 'क्या धब्बे दोनों गालों पर समान रूप से हैं?', questionEn: 'Are the patches symmetric on both cheeks?' }, // idx 58
    { complaintCode: 'PIG01', question: 'क्या धब्बे गर्भावस्था या गर्भनिरोधक गोली के बाद शुरू हुए?', questionEn: 'Did the patches start after pregnancy or contraceptive pills?' }, // idx 59
    // PIG02 — Tanning
    { complaintCode: 'PIG02', question: 'क्या धूप में ज्यादा रहते हैं और सनस्क्रीन लगाते हैं?', questionEn: 'Do you stay long in the sun, and do you use sunscreen?' }, // idx 60
    { complaintCode: 'PIG02', question: 'टैन को कितने महीने हुए?', questionEn: 'Since how many months is the tan?' }, // idx 61
    // PIG03 — Vitiligo query
    { complaintCode: 'PIG03', question: 'क्या सफेद धब्बे बढ़ रहे हैं या स्थिर हैं?', questionEn: 'Are the white patches spreading or stable?' }, // idx 62
    { complaintCode: 'PIG03', question: 'परिवार में किसी को भी सफेद दाग है?', questionEn: 'Does anyone in the family have white patches?' }, // idx 63
    // PIG04 — Post-wound pigmentation
    { complaintCode: 'PIG04', question: 'कालापन किसके बाद हुआ — मुंहासे, दाद या घाव?', questionEn: 'After what did the darkening appear — acne, ringworm or injury?' }, // idx 64
    { complaintCode: 'PIG04', question: 'क्या धूप में दाग और गहरा हो जाता है?', questionEn: 'Does the mark darken further in the sun?' }, // idx 65
    // PIG05 — Colour changes
    { complaintCode: 'PIG05', question: 'क्या रंग बदलने के साथ खुजली या दर्द है?', questionEn: 'Is the colour change associated with itching or pain?' }, // idx 66
    { complaintCode: 'PIG05', question: 'रंग बदलने को कितना समय हुआ?', questionEn: 'Since when has the colour been changing?' }, // idx 67
    // CHR01 — Psoriasis
    { complaintCode: 'CHR01', question: 'क्या चकत्तों पर सफेद छिलके झड़ते हैं?', questionEn: 'Do silvery-white flakes come off the patches?' }, // idx 68
    { complaintCode: 'CHR01', question: 'क्या जोड़ों में दर्द या सुबह की जकड़न भी है?', questionEn: 'Do you also have joint pain or morning stiffness?' }, // idx 69
    // CHR02 — Palmoplantar
    { complaintCode: 'CHR02', question: 'क्या तलवों के फटन से चलने में दर्द होता है?', questionEn: 'Do the cracked soles make walking painful?' }, // idx 70
    { complaintCode: 'CHR02', question: 'क्या आप धूम्रपान करते हैं?', questionEn: 'Do you smoke?' }, // idx 71
    // CHR03 — Chronic itch
    { complaintCode: 'CHR03', question: 'क्या खुजली सालों से है और त्वचा मोटी हो गई है?', questionEn: 'Has the itching persisted for years with skin thickening?' }, // idx 72
    { complaintCode: 'CHR03', question: 'बचपन से एक्जिमा, अस्थमा या एलर्जी का इतिहास रहा है?', questionEn: 'Did you have childhood eczema, asthma or allergies?' }, // idx 73
    // CHR04 — Lichen planus
    { complaintCode: 'CHR04', question: 'क्या चकत्ते बैंगनी-चिकने और खुजली वाले हैं?', questionEn: 'Are the lesions shiny, violaceous and itchy?' }, // idx 74
    { complaintCode: 'CHR04', question: 'क्या मुंह के अंदर सफेद रेखाएं या छाले भी हैं?', questionEn: 'Do you also have white lines or ulcers inside the mouth?' }, // idx 75
    // OTH01 — Mole check
    { complaintCode: 'OTH01', question: 'क्या तिल का रंग, आकार या किनारा बदल रहा है?', questionEn: 'Is the mole changing colour, size or border?' }, // idx 76
    { complaintCode: 'OTH01', question: 'क्या तिल में खुजली, खून या दर्द है?', questionEn: 'Does the mole itch, bleed or pain?' }, // idx 77
    // OTH02 — Warts
    { complaintCode: 'OTH02', question: 'मस्से कहां हैं और कितने समय से?', questionEn: 'Where are the warts and since when?' }, // idx 78
    { complaintCode: 'OTH02', question: 'क्या शरीर के और हिस्सों पर या परिवार में भी मस्से हैं?', questionEn: 'Do you or family members have warts elsewhere too?' }, // idx 79
    // OTH03 — Skin tags
    { complaintCode: 'OTH03', question: 'क्या टैग पर पसीने या रगड़ से जलन होती है?', questionEn: 'Do the tags get irritated with sweat or friction?' }, // idx 80
    { complaintCode: 'OTH03', question: 'क्या शुगर या मोटापे की जांच कराई है?', questionEn: 'Have you been tested for blood sugar/diabetes?' }, // idx 81
    // OTH04 — Insect bite
    { complaintCode: 'OTH04', question: 'काटने को कितने दिन हुए?', questionEn: 'How many days since the bite?' }, // idx 82
    { complaintCode: 'OTH04', question: 'क्या सूजन फैल रही है या बुखार है?', questionEn: 'Is the swelling spreading, or is there fever?' }, // idx 83
    // OTH05 — Scabies
    { complaintCode: 'OTH05', question: 'क्या रात में खुजली तेज होती है और परिवार में भी किसी को है?', questionEn: 'Is the itching severe at night, and do family members have it too?' }, // idx 84
    { complaintCode: 'OTH05', question: 'क्या उंगलियों के बीच, नाभि या गुप्तांग पर दाने हैं?', questionEn: 'Are lesions present between fingers, around navel or genitals?' }, // idx 85
    // OTH06 — Burn scar
    { complaintCode: 'OTH06', question: 'जलने को कितना समय हुआ और घाव कितना गहरा था?', questionEn: 'How long ago was the burn, and how deep was it?' }, // idx 86
    { complaintCode: 'OTH06', question: 'क्या निशान उभर रहा है या गहरा गड्ढा बना है?', questionEn: 'Is the scar raised or a depressed pit?' }, // idx 87
    // OTH07 — Keloid
    { complaintCode: 'OTH07', question: 'निशान किस घाव, फोड़े या टीके पर बना?', questionEn: 'On which wound, boil or vaccination site did it form?' }, // idx 88
    { complaintCode: 'OTH07', question: 'क्या निशान में खुजली या दर्द रहता है?', questionEn: 'Does the scar itch or pain?' }, // idx 89
    // OTH08 — Stretch marks
    { complaintCode: 'OTH08', question: 'क्या हाल में वजन बढ़ा, गर्भावस्था रही या जिम शुरू किया?', questionEn: 'Recent weight gain, pregnancy or gym training?' }, // idx 90
    { complaintCode: 'OTH08', question: 'मार्क्स लाल-नए हैं या सफेद-पुराने?', questionEn: 'Are the marks red-new or white-old?' }, // idx 91
    // OTH09 — Non-healing ulcer
    { complaintCode: 'OTH09', question: 'घाव को कितने हफ्ते हुए?', questionEn: 'How many weeks old is the ulcer?' }, // idx 92
    { complaintCode: 'OTH09', question: 'क्या शुगर की जांच कराई है?', questionEn: 'Have you been tested for blood sugar?' }, // idx 93
  ],

  // ══ Suggestions (188 — 2 per question; questionIndex ↔ idx above) ═════
  // PRINTED FOR PATIENTS — practical Hindi advice (hygiene, cloth-ironing
  // for tinea, sun protection, steroid-cream stop, dry-skin care …).
  suggestions: [
    // q0 (ACN01 duration)
    { questionIndex: 0, text: 'कम से 3 महीने के मुंहासे — जीवनशैली सुधार + टॉपिकल क्रीम से शुरुआत करें', textEn: 'Acne under 3 months — start with lifestyle changes + topical cream' },
    { questionIndex: 0, text: '2 साल से लगातार मुंहासे — हार्मोनल जांच (थायरॉइड/PCOS) का विचार करें', textEn: 'Persistent acne over 2 years — consider hormonal workup (thyroid/PCOS)' },
    // q1 (ACN01 self-applied creams)
    { questionIndex: 1, text: 'बिना सलाह लगाई सभी क्रीम डॉक्टर को दिखाएं — स्टेरॉयड वाली क्रीम तुरंत बंद करें', textEn: 'Show all self-applied creams to the doctor — stop steroid creams immediately' },
    { questionIndex: 1, text: 'चेहरे पर लगाई स्टेरॉयड क्रीम अचानक न बंद करें — डॉक्टर की देखरेख में धीरे-धीरे घटाएं', textEn: 'Do not stop facial steroid cream abruptly — taper under supervision' },
    // q2 (ACN02 face too)
    { questionIndex: 2, text: 'चेहरे और पीठ दोनों पर मुंहासे — स्नान में मेडिकेटेड साबुन (BPO बार) जोड़ें', textEn: 'Face + back acne — add medicated wash (BPO bar) at bath time' },
    { questionIndex: 2, text: 'सिर्फ पीठ/छाती — टाइट कपड़े और पीठ पर तेल लगाना बंद करें', textEn: 'Back/chest only — stop tight clothes and oil application on the back' },
    // q3 (ACN02 heat)
    { questionIndex: 3, text: 'गर्मी में बढ़ते मुंहासे — दिन में 2 बार हल्के फेस वॉश से चेहरा धोएं', textEn: 'Heat-aggravated acne — wash face twice daily with a gentle face wash' },
    { questionIndex: 3, text: 'पसीना लगने पर गीले कपड़े जल्दी बदलें और रुमाल से पोंछें', textEn: 'Change sweaty clothes quickly and wipe off sweat' },
    // q4 (ACN03 mark type)
    { questionIndex: 4, text: 'काले चपटे दाग — क्रीम से 2-3 महीने में सुधरते हैं', textEn: 'Flat dark marks — improve with creams over 2-3 months' },
    { questionIndex: 4, text: 'गड्ढे (स्कार) — क्रीम से पूरे नहीं सुधरते, प्रोसीड्योर चाहिए', textEn: 'Pitted scars — need procedures, not creams' },
    // q5 (ACN03 active acne)
    { questionIndex: 5, text: 'नए मुंहासे अभी आ रहे हैं — पहले मुंहासों का इलाज करें, दाग बाद में', textEn: 'Active acne present — treat the acne first, the marks later' },
    { questionIndex: 5, text: 'मुंहासे रुक चुके हैं — अब दाग हटाने का इलाज शुरू करें', textEn: 'Acne has settled — start mark-reduction treatment now' },
    // q6 (ACN04 oily)
    { questionIndex: 6, text: 'तैलीय त्वचा — ऑयल-फ्री फेस वॉश + हल्का जेल मॉइस्चराइजर इस्तेमाल करें', textEn: 'Oily skin — use an oil-free face wash + light gel moisturizer' },
    { questionIndex: 6, text: 'दिन में 3-4 बार चेहरा धोने से तैलीयपन बढ़ता है — 2 बार काफी है', textEn: 'Washing the face 3-4 times a day increases oil — twice is enough' },
    // q7 (ACN04 picking)
    { questionIndex: 7, text: 'मुंहासे नोचने से दाग गहरे और गड्ढे बनते हैं — हाथ चेहरे से दूर रखें', textEn: 'Picking causes deep marks and pits — keep hands off the face' },
    { questionIndex: 7, text: 'नाखून छोटे रखें और तकिये का कवर रोज बदलें', textEn: 'Keep nails short and change the pillow cover daily' },
    // q8 (ACN05 sleep)
    { questionIndex: 8, text: '6 घंटे से कम नींद डार्क सर्कल बढ़ाती है — नींद पूरी करें', textEn: 'Sleep under 6 hours worsens dark circles — complete your sleep' },
    { questionIndex: 8, text: 'नींद ठीक होने पर भी डार्क सर्कल हों — एनीमिया/थायरॉइड जांच कराएं', textEn: 'Dark circles despite good sleep — test for anemia/thyroid' },
    // q9 (ACN05 eye allergy)
    { questionIndex: 9, text: 'आंखों की एलर्जी से काले घेरे बनते हैं — आंखें मलना बंद करें', textEn: 'Eye allergy causes dark circles — stop rubbing the eyes' },
    { questionIndex: 9, text: 'रोज ठंडी सिकाई करें और रात में हल्का आई-जेल लगाएं', textEn: 'Apply cold compresses daily and a light eye gel at night' },
    // q10 (ACN06 redness duration)
    { questionIndex: 10, text: 'हाल की लाली — ट्रिगर पहचानें (धूप/साबुन/क्रीम) और मॉइस्चराइजर लगाएं', textEn: 'Recent redness — identify triggers (sun/soap/cream) and moisturize' },
    { questionIndex: 10, text: 'महीनों की लाली — रोसैसिया या स्टेरॉयड-नुकसान की जांच कराएं', textEn: 'Redness for months — get checked for rosacea or steroid damage' },
    // q11 (ACN06 steroid rebound)
    { questionIndex: 11, text: 'क्रीम बंद करने पर लौटना = स्टेरॉयड निर्भरता — क्रीम डॉक्टर को दिखाएं', textEn: 'Relapse after stopping = steroid dependence — show the cream to the doctor' },
    { questionIndex: 11, text: 'स्टेरॉयड क्रीम अचानक बंद न करें — डॉक्टर की देखरेख में धीरे-धीरे बंद करें', textEn: 'Do not stop the steroid cream abruptly — taper gradually under the doctor' },
    // q12 (ACN07 dandruff link)
    { questionIndex: 12, text: 'नाक-भौहों + रूसी = सेबोरिक डर्मेटाइटिस — एंटीफंगल शैम्पू चेहरे पर भी 5 मिनट लगाएं', textEn: 'Nose-brows + dandruff = seborrheic dermatitis — apply antifungal shampoo on the face too for 5 min' },
    { questionIndex: 12, text: 'मृदु क्लींजर से धोएं, चेहरे पर तेल न लगाएं', textEn: 'Wash with a gentle cleanser; avoid oils on the face' },
    // q13 (ACN07 itch)
    { questionIndex: 13, text: 'हल्की खुजली — मॉइस्चराइजर + सप्ताह में 2 बार मेडिकेटेड शैम्पू', textEn: 'Mild itching — moisturizer + medicated shampoo twice weekly' },
    { questionIndex: 13, text: 'तेज खुजली व लाली — डॉक्टर से जांच कराएं', textEn: 'Severe itching with redness — get examined by the doctor' },
    // q14 (HIR01 duration)
    { questionIndex: 14, text: '3 महीने से कम का झड़ना — तनाव/बीमारी के बाद आम है — प्रोटीनयुक्त आहार लें', textEn: 'Shedding under 3 months — common after stress/illness — take a protein-rich diet' },
    { questionIndex: 14, text: '1 साल से धीरे-धीरे झड़ना — पैटर्न बाल-झड़ना हो सकता है — जांच व इलाज शुरू करें', textEn: 'Gradual loss over a year — possible patterned loss — start workup and treatment' },
    // q15 (HIR01 family)
    { questionIndex: 15, text: 'परिवार में बाल झड़ने का इतिहास — एंड्रोजेनेटिक एलोपेसिया संभव — जल्दी इलाज शुरू करें', textEn: 'Family history of hair loss — likely androgenetic alopecia — start treatment early' },
    { questionIndex: 15, text: 'परिवार में किसी को नहीं — आयरन, थायरॉइड और विटामिन D जांच कराएं', textEn: 'No family history — test iron, thyroid and vitamin D' },
    // q16 (HIR02 dandruff type)
    { questionIndex: 16, text: 'सफेद-सूखी रूसी — सप्ताह में 2-3 बार शैम्पू करें, रातभर तेल न रखें', textEn: 'White-dry flakes — shampoo 2-3 times weekly; avoid overnight oil' },
    { questionIndex: 16, text: 'पीली-चिपचिपी पपड़ी — सेबोरिक — केटोकोनाजोल शैम्पू 4 हफ्ते लगाएं', textEn: 'Yellow-greasy scales — seborrheic — ketoconazole shampoo for 4 weeks' },
    // q17 (HIR02 itch)
    { questionIndex: 17, text: 'खुजली के साथ रूसी — एंटीफंगल शैम्पू जरूरी है, सिर्फ तेल से नहीं सुधरेगी', textEn: 'Itchy dandruff — antifungal shampoo needed; oil alone will not fix it' },
    { questionIndex: 17, text: 'तेज खुजली + लाली — डॉक्टर से दिखाएं (फंगल/सोरायासिस हो सकता है)', textEn: 'Severe itch + redness — show the doctor (could be fungal/psoriasis)' },
    // q18 (HIR03 patch pattern)
    { questionIndex: 18, text: 'धब्बे पर छोटे-टूटे बाल — एलोपेसिया एरिएटा की निशानी — डॉक्टर से देखाएं', textEn: 'Short broken hairs on the patch — sign of alopecia areata — see a doctor' },
    { questionIndex: 18, text: 'पूरा गंजा धब्बा — कवक संक्रमण या बाल खींचने की आदत भी हो सकती है', textEn: 'Completely bald patch — could also be fungal infection or hair-pulling habit' },
    // q19 (HIR03 other patches)
    { questionIndex: 19, text: 'कई धब्बे हैं — डॉक्टर बाल खींचकर कवक जांच कर सकते हैं', textEn: 'Multiple patches — the doctor may do a hair-pull test for fungus' },
    { questionIndex: 19, text: 'एक ही धब्बा — निगरानी रखें और डॉक्टर से दिखाएं', textEn: 'Single patch — monitor it and show the doctor' },
    // q20 (HIR04 illness timing)
    { questionIndex: 20, text: 'बीमारी के 2-3 महीने बाद झड़ना — टेलोजेन एफ्लुवियम — 6-9 महीने में अपने आप सुधरता है', textEn: 'Shedding 2-3 months after illness — telogen effluvium — recovers on its own in 6-9 months' },
    { questionIndex: 20, text: 'प्रसव के बाद का झड़ना सामान्य है — प्रोटीन + आयरन भरपूर लें', textEn: 'Post-delivery shedding is normal — take plenty of protein + iron' },
    // q21 (HIR04 hairs/day)
    { questionIndex: 21, text: 'रोज 100 से कम बाल झड़ना सामान्य है', textEn: 'Losing under 100 hairs daily is normal' },
    { questionIndex: 21, text: 'रोज मुट्ठी भर बाल झड़ें — CBC, फेरिटिन और TSH जांच कराएं', textEn: 'Handfuls of hair daily — get CBC, ferritin and TSH tested' },
    // q22 (HIR05 oil habit)
    { questionIndex: 22, text: 'तेल 2 दिन से ज्यादा न रखें — रूसी और फंगल बढ़ते हैं', textEn: 'Do not keep oil on for more than 2 days — dandruff and fungus increase' },
    { questionIndex: 22, text: 'तेल लगाकर 1-2 घंटे बाद शैम्पू कर लें', textEn: 'Shampoo 1-2 hours after applying oil' },
    // q23 (HIR05 family scalp)
    { questionIndex: 23, text: 'बच्चों को सिर में दाद — तुरंत डॉक्टर से दिखाएं, कवक जांच जरूरी', textEn: 'Scalp ringworm in children — show a doctor promptly; fungal test needed' },
    { questionIndex: 23, text: 'तकिया और कंघी परिवार में साझा न करें', textEn: 'Do not share pillows and combs within the family' },
    // q24 (HIR06 grey age)
    { questionIndex: 24, text: '25 साल से पहले सफेद बाल — विटामिन B12 जांच कराएं', textEn: 'Greying before age 25 — test vitamin B12' },
    { questionIndex: 24, text: '35 के बाद सफेद बाल — उम्र के साथ सामान्य', textEn: 'Greying after 35 — normal with age' },
    // q25 (HIR06 family grey)
    { questionIndex: 25, text: 'परिवार में जल्दी सफेद — आनुवंशिक — रोकना मुश्किल, आहार सुधारें', textEn: 'Familial early greying — genetic — hard to stop; improve the diet' },
    { questionIndex: 25, text: 'एक बार B12 और थायरॉइड जांच करा लें', textEn: 'Get B12 and thyroid checked once' },
    // q26 (HIR07 chemical damage)
    { questionIndex: 26, text: 'रंग/स्ट्रेटनिंग के बाद का नुकसान — 6 महीने कोई केमिकल न लगाएं', textEn: 'Damage after colour/straightening — apply no chemicals for 6 months' },
    { questionIndex: 26, text: 'हीट स्टाइलिंग बंद करें और हल्का सीरम लगाएं', textEn: 'Stop heat styling and apply a light serum' },
    // q27 (HIR07 thyroid)
    { questionIndex: 27, text: 'थायरॉइड असंतुलन बाल रूखे और झड़ते बनाता है — TSH कराएं', textEn: 'Thyroid imbalance makes hair rough and fall — check TSH' },
    { questionIndex: 27, text: 'अपनी सभी चालू दवाएं डॉक्टर को बताएं — कुछ दवाएं बाल झड़ाती हैं', textEn: 'Tell the doctor all your current medicines — some cause hair fall' },
    // q28 (FUN01 sites)
    { questionIndex: 28, text: 'जांघ + शरीर दोनों में दाद — मुंह की दवा + क्रीम दोनों चाहिए, इलाज लंबा', textEn: 'Groin + body both — needs oral + topical together, longer course' },
    { questionIndex: 28, text: 'एक छोटा चकत्ता — क्रीम + जगह सूखी रखने से शुरू करें', textEn: 'Single small patch — start with cream + keeping the area dry' },
    // q29 (FUN01 duration/spread)
    { questionIndex: 29, text: '4 हफ्ते से पुराना या फैलता दाद — मुंह की एंटीफंगल दवा जरूरी', textEn: 'Tinea over 4 weeks or spreading — oral antifungal is needed' },
    { questionIndex: 29, text: 'नया छोटा दाद — क्रीम और सफाई से अकेले भी सुधर सकता है', textEn: 'New small lesion — cream and hygiene alone may clear it' },
    // q30 (FUN02 self creams)
    { questionIndex: 30, text: 'खुजली वाली कॉम्बो क्रीम (स्टेरॉयड मिश्रित) तुरंत बंद करें — यही दाद को बढ़ाती है', textEn: 'Stop anti-itch combination creams (steroid-mixed) NOW — they multiply the ringworm' },
    { questionIndex: 30, text: 'जो क्रीम लगा रहे हैं उसका नाम/डिब्बा डॉक्टर को दिखाएं', textEn: 'Show the doctor the name/pack of the cream you have been using' },
    // q31 (FUN02 feet/nails)
    { questionIndex: 31, text: 'पैर/नाखून का फंगल जांघ तक फैलता है — पैरों का इलाज साथ करें', textEn: 'Foot/nail fungus spreads to the groin — treat the feet together' },
    { questionIndex: 31, text: 'जुराबें और तौलिये उबाल कर या गर्म इस्त्री करके ही इस्तेमाल करें', textEn: 'Use socks and towels only after boiling or hot-ironing them' },
    // q32 (FUN03 wet feet)
    { questionIndex: 32, text: 'गीले पैर फंगल को बढ़ाते हैं — पैर हमेशा पूरे सुखाएं, उंगलियों के बीच भी', textEn: 'Wet feet feed fungus — dry the feet fully, including between the toes' },
    { questionIndex: 32, text: 'एक ही जूता रोज न पहनें — दो जूते बदल-बदल कर पहनें', textEn: 'Do not wear the same shoes daily — rotate two pairs' },
    // q33 (FUN03 maceration)
    { questionIndex: 33, text: 'उंगलियों के बीच सफेद-मुलायम त्वचा — पूरा सुखाना + एंटीफंगल क्रीम जरूरी', textEn: 'White soggy skin between toes — dry thoroughly + antifungal cream needed' },
    { questionIndex: 33, text: 'दिन में एंटीफंगल डस्टिंग पाउडर लगाएं ताकि जगह सूखी रहे', textEn: 'Apply antifungal dusting powder daily to keep the area dry' },
    // q34 (FUN04 nail extent)
    { questionIndex: 34, text: '5 से ज्यादा नाखून या 1 साल पुराना — मुंह की दवा 3-6 महीने चाहिए', textEn: '5+ nails or 1 year old — needs 3-6 months of oral medicine' },
    { questionIndex: 34, text: '1-2 नाखून नए प्रभावित — नेल लैकर/क्रीम से आजमा सकते हैं', textEn: '1-2 newly affected nails — can try a nail lacquer/cream first' },
    // q35 (FUN04 body tinea)
    { questionIndex: 35, text: 'शरीर का दाद नाखून तक पहुंचा — पूरे शरीर का एक साथ इलाज कराएं', textEn: 'Body ringworm reached the nails — treat the whole body together' },
    { questionIndex: 35, text: 'नाखून छोटे और सूखे रखें — गंदगी और पानी से बचाएं', textEn: 'Keep nails trimmed and dry — protect from dirt and water' },
    // q36 (FUN05 sun contrast)
    { questionIndex: 36, text: 'धूप में सफेद दिखना — वर्सिकलर (हल्का फंगल) — मेडिकेटेड शैम्पू वॉश से सुधरता है', textEn: 'Looks white in sun — versicolor (mild fungus) — improves with medicated shampoo wash' },
    { questionIndex: 36, text: 'धूप के बिना भी सफेद दिखे — डॉक्टर विटिलिगो की जांच करें', textEn: 'White even without sun contrast — the doctor should rule out vitiligo' },
    // q37 (FUN05 itch)
    { questionIndex: 37, text: 'हल्की खुजली — वर्सिकलर की निशानी — कीटो/सेलेनियम शैम्पू लगाएं', textEn: 'Mild itching — sign of versicolor — use keto/selenium shampoo' },
    { questionIndex: 37, text: 'बिना खुजली की सफेदी — त्वचा परीक्षा जरूरी', textEn: 'Non-itchy white patches — need skin examination' },
    // q38 (FUN06 painful+fever)
    { questionIndex: 38, text: 'तेज दर्द + बुखार वाला फोड़ा — एंटीबायोटिक चाहिए — तुरंत डॉक्टर से मिलें', textEn: 'Very painful boil with fever — needs antibiotics — see a doctor now' },
    { questionIndex: 38, text: 'बुखार नहीं — गर्म सिकाई 10 मिनट × 3 बार + एंटीबायोटिक क्रीम लगाएं', textEn: 'No fever — warm compress 10 min × 3 times + antibiotic cream' },
    // q39 (FUN06 recurrent)
    { questionIndex: 39, text: 'बार-बार फोड़े आएं — शुगर जांच (FBS/HbA1c) कराएं', textEn: 'Recurrent boils — get blood sugar tested (FBS/HbA1c)' },
    { questionIndex: 39, text: 'बार-बार के फोड़ों में नाक में मुपिरोसिन (डॉक्टर सलाह) मदद करता है', textEn: 'For recurrent boils, nasal mupirocin (doctor-directed) helps' },
    // q40 (FUN07 one/both palms)
    { questionIndex: 40, text: 'दोनों हथेलियां — एक्जिमा/डाइशाइड्रोसिस संभव — दस्ताने + मॉइस्चराइजर जरूरी', textEn: 'Both palms — eczema/dyshidrosis likely — gloves + moisturizer needed' },
    { questionIndex: 40, text: 'एक ही हाथ — कवक संभव — दूसरे हाथ से तुलना करवाएं', textEn: 'One hand only — fungus possible — compare with the other hand' },
    // q41 (FUN07 water/soap)
    { questionIndex: 41, text: 'पानी/साबुन से बढ़ना — काम-जनित एक्जिमा — सूती अस्तर वाले रबर दस्ताने पहनें', textEn: 'Worsens with water/soap — occupational eczema — wear cotton-lined rubber gloves' },
    { questionIndex: 41, text: 'हर हाथ धोने के बाद मॉइस्चराइजर लगाएं', textEn: 'Apply moisturizer after every handwash' },
    // q42 (ECZ01 rash spread)
    { questionIndex: 42, text: 'धड़ से शुरू होकर फैले दाने — वायरल रैश संभव — सपोर्टिव केयर', textEn: 'Rash starting on the trunk and spreading — likely viral rash — supportive care' },
    { questionIndex: 42, text: 'उजागर अंगों पर दाने — धूप/संपर्क एलर्जी का विचार करें', textEn: 'Rash on exposed parts — consider sun/contact allergy' },
    // q43 (ECZ01 new trigger)
    { questionIndex: 43, text: 'नई शुरू की चीज तुरंत बंद करें — एलर्जी का सबसे बड़ा इलाज ट्रिगर हटाना है', textEn: 'Stop the newly started item at once — removing the trigger is the main allergy treatment' },
    { questionIndex: 43, text: 'संदिग्ध चीज को दोबारा इस्तेमाल न करें', textEn: 'Do not re-use the suspected item' },
    // q44 (ECZ02 chronicity)
    { questionIndex: 44, text: '6 हफ्ते से कम पित्ती — तीव्र — ट्रिगर खोजें + रोज एंटीहिस्टामिन', textEn: 'Hives under 6 weeks — acute — find the trigger + daily antihistamine' },
    { questionIndex: 44, text: '6 हफ्ते से ज्यादा — पुरानी पित्ती — डॉक्टर से नियमित दवा बनवाएं', textEn: 'Over 6 weeks — chronic urticaria — get a regular prescription from the doctor' },
    // q45 (ECZ02 angioedema red flag)
    { questionIndex: 45, text: 'होंठ/आंख की सूजन या सांस में तकलीफ — इमरजेंसी — तुरंत अस्पताल जाएं', textEn: 'Lip/eye swelling or breathing trouble — emergency — go to hospital immediately' },
    { questionIndex: 45, text: 'सिर्फ त्वचा पर — एंटीहिस्टामिन लें और निगरानी रखें', textEn: 'Skin only — take an antihistamine and observe' },
    // q46 (ECZ03 winter itch)
    { questionIndex: 46, text: 'सर्दी/नहाने के बाद खुजली — रूखी त्वचा — नहाने के 3 मिनट के भीतर मॉइस्चराइजर लगाएं', textEn: 'Winter/post-bath itch — dry skin — apply moisturizer within 3 minutes of bathing' },
    { questionIndex: 46, text: 'साबुन कम और मृदु इस्तेमाल करें, रगड़ न लगाएं', textEn: 'Use less soap, a mild one, and do not scrub' },
    // q47 (ECZ03 hot water)
    { questionIndex: 47, text: 'गर्म पानी त्वचा रूखी बनाता है — लूकवार्म पानी से नहाएं', textEn: 'Hot water dries the skin — bathe with lukewarm water' },
    { questionIndex: 47, text: 'लंबे स्नान से त्वचा की नमी उतरती है — 10 मिनट से कम नहाएं', textEn: 'Long baths strip skin moisture — bathe for under 10 minutes' },
    // q48 (ECZ04 wet-work hours)
    { questionIndex: 48, text: 'रोज 2+ घंटे हाथ पानी में — एक्जिमा का खतरा पक्का — काम में दस्ताने जरूरी', textEn: 'Hands in water 2+ hours daily — definite eczema risk — gloves essential at work' },
    { questionIndex: 48, text: 'काम खत्म कर हाथ पूरा सुखाकर मलहम लगाएं', textEn: 'After work, dry the hands fully and apply ointment' },
    // q49 (ECZ04 gloves)
    { questionIndex: 49, text: 'दस्ताने नहीं पहनते — अंदर सूती + बाहर रबर वाले दस्ताने शुरू करें', textEn: 'Not wearing gloves — start cotton-lined rubber gloves' },
    { questionIndex: 49, text: 'रबर के दस्ताने लगातार पहनने से पसीने में भी बढ़ता है — सिर्फ गीले काम पर पहनें', textEn: 'Wearing rubber gloves continuously also worsens it — wear only for wet work' },
    // q50 (ECZ05 timing)
    { questionIndex: 50, text: 'धूप के कुछ घंटे बाद दाने — धूप एलर्जी (PMLE) — सनस्क्रीन + पूरे कपड़े', textEn: 'Lesions hours after sun — sun allergy (PMLE) — sunscreen + full-sleeve clothing' },
    { questionIndex: 50, text: 'तुरंत जलन हो — धूप से बचें और SPF 50 सनस्क्रीन लगाएं', textEn: 'Immediate burning — avoid the sun and use SPF 50 sunscreen' },
    // q51 (ECZ05 new drug)
    { questionIndex: 51, text: 'दवा + धूप का मेल — फोटो-एलर्जी संभव — दवा का नाम डॉक्टर को बताएं', textEn: 'Drug + sun combination — possible photoallergy — tell the doctor the drug name' },
    { questionIndex: 51, text: 'कोई नई दवा नहीं — सामान्य धूप-एलर्जी का इलाज करें', textEn: 'No new drug — treat as ordinary sun allergy' },
    // q52 (ECZ06 which drug)
    { questionIndex: 52, text: 'संदिग्ध दवा तुरंत बंद कर डॉक्टर को दिखाएं — दवा का नाम नोट करके रखें', textEn: 'Stop the suspect drug and see the doctor — note down its name' },
    { questionIndex: 52, text: 'वही दवा दोबारा कभी न लें — अगली बार रिएक्शन ज्यादा तेज हो सकता है', textEn: 'Never take that drug again — the next reaction can be more severe' },
    // q53 (ECZ06 SJS red flag)
    { questionIndex: 53, text: 'बुखार + मुंह के छाले + त्वचा में दर्द — तुरंत अस्पताल (गंभीर दवा-रिएक्शन)', textEn: 'Fever + mouth ulcers + skin pain — hospital immediately (severe drug reaction)' },
    { questionIndex: 53, text: 'सामान्य रैश — दवा बंद + एंटीहिस्टामिन, निगरानी रखें', textEn: 'Ordinary rash — stop the drug + antihistamine and observe' },
    // q54 (ECZ07 fold lesions)
    { questionIndex: 54, text: 'गर्दन/कमर/घुटनों के सिलवों में घमौड़ियां — ठंडा रखें, सूती ढीली पोशाक पहनें', textEn: 'Prickly heat in neck/waist/knee folds — keep cool, wear loose cotton clothes' },
    { questionIndex: 54, text: 'सिलवों के बाहर भी दाने — अन्य कारण की जांच कराएं', textEn: 'Lesions beyond the folds — investigate other causes' },
    // q55 (ECZ07 clothing)
    { questionIndex: 55, text: 'टाइट/सिंथेटिक कपड़े बदलें — ढीली सूती पोशाक पहनें', textEn: 'Switch tight/synthetic clothes — wear loose cotton garments' },
    { questionIndex: 55, text: 'पसीना लगते ही तौलिये से पोंछें या नहा लें', textEn: 'Wipe off the sweat or bathe as soon as you sweat' },
    // q56 (ECZ08 crack severity)
    { questionIndex: 56, text: 'फटन से खून/दर्द — एंटीसेप्टिक लगाएं और डॉक्टर से पैराफिन मलहम लें', textEn: 'Cracks bleeding/painful — apply antiseptic and get a paraffin ointment' },
    { questionIndex: 56, text: 'सामान्य फटी एड़ी — रात में यूरिया क्रीम लगाकर मोजे पहनकर सोएं', textEn: 'Simple cracked heels — apply urea cream at night and sleep with socks on' },
    // q57 (ECZ08 standing/slippers)
    { questionIndex: 57, text: 'लंबे समय खड़े रहने से एड़ियां फटती हैं — बीच-बीच में बैठें', textEn: 'Standing for long hours cracks the heels — take sitting breaks' },
    { questionIndex: 57, text: 'बंद और गद्देदार जूते पहनें, नंगे चप्पल से बचें', textEn: 'Wear closed cushioned footwear; avoid bare slippers' },
    // q58 (PIG01 symmetry)
    { questionIndex: 58, text: 'दोनों गालों पर समान धब्बे — मेलास्मा — रात की क्रीम + रोज सुबह सनस्क्रीन', textEn: 'Symmetric patches on both cheeks — melasma — night cream + daily morning sunscreen' },
    { questionIndex: 58, text: 'एक तरफ के धब्बे — अन्य कारण की जांच कराएं', textEn: 'One-sided patches — investigate other causes' },
    // q59 (PIG01 hormonal)
    { questionIndex: 59, text: 'हार्मोनल ट्रिगर (गर्भावस्था/गोली) — क्रीम डॉक्टर से पूछकर ही लगाएं', textEn: 'Hormonal trigger (pregnancy/pill) — use creams only after asking the doctor' },
    { questionIndex: 59, text: 'गर्भावस्था में हाइड्रोक्विनोन वाली क्रीम नहीं — सिर्फ सनस्क्रीन सुरक्षित', textEn: 'No hydroquinone creams in pregnancy — only sunscreen is safe' },
    // q60 (PIG02 sunscreen use)
    { questionIndex: 60, text: 'रोज SPF 30+ सनस्क्रीन लगाएं — धूप में हर 3 घंटे दोबारा लगाएं', textEn: 'Apply SPF 30+ sunscreen daily — reapply every 3 hours in the sun' },
    { questionIndex: 60, text: 'टोपी/छाता और धूप का चश्मा भी इस्तेमाल करें', textEn: 'Also use a hat/umbrella and sunglasses' },
    // q61 (PIG02 tan duration)
    { questionIndex: 61, text: 'कुछ महीनों का टैन — नियमित सनस्क्रीन से हफ्तों में घटता है', textEn: 'Tan of a few months — fades over weeks with regular sunscreen' },
    { questionIndex: 61, text: 'सालों पुराना टैन — प्रोफेशनल पील/इलाज चाहिए', textEn: 'Long-standing tan — needs professional peels/treatment' },
    // q62 (PIG03 spread)
    { questionIndex: 62, text: 'बढ़ते धब्बे — जल्दी इलाज शुरू करें — नए छोटे धब्बों का जवाब सबसे अच्छा मिलता है', textEn: 'Spreading patches — start treatment early — fresh small patches respond best' },
    { questionIndex: 62, text: 'स्थिर धब्बे — रंग लौटाने के विकल्प डॉक्टर से पूछें', textEn: 'Stable patches — ask the doctor about repigmentation options' },
    // q63 (PIG03 family)
    { questionIndex: 63, text: 'परिवार में सफेद दाग — थायरॉइड/ऑटोइम्यून जांच एक बार करा लें', textEn: 'Family history of white patches — screen thyroid/autoimmunity once' },
    { questionIndex: 63, text: 'परिवार में नहीं भी हो तो जांच कराना जरूरी है', textEn: 'Even without a family history, evaluation is needed' },
    // q64 (PIG04 cause)
    { questionIndex: 64, text: 'दाद के बाद कालापन — पहले फंगल का पूरा इलाज, दाग बाद में', textEn: 'Darkness after ringworm — fully treat the fungus first, the marks later' },
    { questionIndex: 64, text: 'मुंहासों के बाद के दाग — नए मुंहासे रुकें तभी दाग घटेंगे', textEn: 'Post-acne marks — the marks fade only after new acne stops' },
    // q65 (PIG04 sun effect)
    { questionIndex: 65, text: 'धूप दाग गहरे करती है — रोज सनस्क्रीन लगाना जरूरी', textEn: 'Sun deepens the marks — daily sunscreen is essential' },
    { questionIndex: 65, text: '12 से 3 बजे की धूप से जितना हो सके बचें', textEn: 'Avoid the 12-3 PM sun as much as possible' },
    // q66 (PIG05 symptoms)
    { questionIndex: 66, text: 'बिना लक्षण का रंग-बदलाव — त्वचा जांच कराएं', textEn: 'Symptomless colour change — get the skin examined' },
    { questionIndex: 66, text: 'खुजली/दर्द के साथ — सक्रिय रोग — डॉक्टर से दिखाएं', textEn: 'With itching/pain — active disease — show the doctor' },
    // q67 (PIG05 duration)
    { questionIndex: 67, text: 'महीनों का बदलाव — तारीख के साथ फोटो लेकर रिकॉर्ड रखें', textEn: 'Months-long change — take dated photos to track it' },
    { questionIndex: 67, text: 'हाल का बदलाव — ट्रिगर खोजें (क्रीम/धूप/दवा)', textEn: 'Recent change — look for a trigger (cream/sun/drug)' },
    // q68 (CHR01 scales)
    { questionIndex: 68, text: 'सफेद छिलके — सोरायासिस की निशानी — डॉक्टर से पुष्टि कराएं', textEn: 'Silvery scales — sign of psoriasis — confirm with the doctor' },
    { questionIndex: 68, text: 'छिलके खुरच कर न उतारें — मॉइस्चराइजर लगाएं', textEn: 'Do not scratch the scales off — apply moisturizer' },
    // q69 (CHR01 joints)
    { questionIndex: 69, text: 'जोड़ों का दर्द + सोरायासिस — डॉक्टर को जरूर बताएं (सोरिएटिक आर्थराइटिस की चिंता)', textEn: 'Joint pain + psoriasis — must inform the doctor (psoriatic arthritis concern)' },
    { questionIndex: 69, text: 'जोड़ ठीक हैं — त्वचा का नियमित इलाज जारी रखें', textEn: 'Joints fine — continue the regular skin treatment' },
    // q70 (CHR02 walking pain)
    { questionIndex: 70, text: 'चलने में दर्द — उपचार तेज करने की जरूरत — डॉक्टर से मिलें', textEn: 'Painful walking — treatment needs intensification — see the doctor' },
    { questionIndex: 70, text: 'हल्का दर्द — नरम जूते + मलहम से शुरू करें', textEn: 'Mild pain — start with soft footwear + ointment' },
    // q71 (CHR02 smoking)
    { questionIndex: 71, text: 'धूम्रपान तलवों का सोरायासिस बढ़ाता है — छोड़ने की कोशिश करें', textEn: 'Smoking worsens palmoplantar psoriasis — try to quit' },
    { questionIndex: 71, text: 'धूम्रपान नहीं — अन्य ट्रिगर (तनाव/घर्षण) देखें', textEn: 'Non-smoker — look at other triggers (stress/friction)' },
    // q72 (CHR03 lichenification)
    { questionIndex: 72, text: 'सालों की खुजली + मोटी त्वचा — लिचेनिफिकेशन — रात की दवा + पूरी नींद', textEn: 'Years of itch + thick skin — lichenification — night medicine + full sleep' },
    { questionIndex: 72, text: 'टूटी नींद खुजली बढ़ाती है — नींद का ध्यान रखें', textEn: 'Broken sleep increases the itch — protect your sleep' },
    // q73 (CHR03 atopy)
    { questionIndex: 73, text: 'एटोपी का इतिहास — ट्रिगर से बचाव + रोज मॉइस्चराइजर जीवन भर', textEn: 'History of atopy — trigger avoidance + daily moisturizer lifelong' },
    { questionIndex: 73, text: 'एटोपी नहीं — अन्य कारण (कवक/संपर्क) जांचें', textEn: 'No atopy — evaluate other causes (fungus/contact)' },
    // q74 (CHR04 LP look)
    { questionIndex: 74, text: 'बैंगनी-चिकने, खुजली वाले चकत्ते — लिचेन प्लेनस संभव — डॉक्टर जांच करें', textEn: 'Shiny violaceous itchy plaques — likely lichen planus — doctor to examine' },
    { questionIndex: 74, text: 'खुजली नहीं — अन्य निदान का विचार करें', textEn: 'Not itchy — consider other diagnoses' },
    // q75 (CHR04 oral)
    { questionIndex: 75, text: 'मुंह के अंदर सफेद रेखाएं — लिचेन प्लेनस — तीखा/मसालेदार खाना बंद करें', textEn: 'White lines inside the mouth — lichen planus — stop sharp/spicy foods' },
    { questionIndex: 75, text: 'मुंह सामान्य — त्वचा का इलाज जारी रखें', textEn: 'Mouth normal — continue the skin treatment' },
    // q76 (OTH01 changing mole)
    { questionIndex: 76, text: 'बदलता तिल — तुरंत त्वचा-विशेषज्ञ से दिखाएं — तारीख के साथ फोटो रखें', textEn: 'Changing mole — show a dermatologist immediately — keep dated photos' },
    { questionIndex: 76, text: 'स्थिर तिल — साल में एक बार जांच काफी है', textEn: 'Stable mole — an annual check is enough' },
    // q77 (OTH01 mole symptoms)
    { questionIndex: 77, text: 'तिल में खुजली/खून/दर्द — तुरंत डॉक्टर से दिखाएं', textEn: 'Mole itching/bleeding/pain — show the doctor immediately' },
    { questionIndex: 77, text: 'कोई लक्षण नहीं — नियमित निगरानी रखें', textEn: 'No symptoms — keep routine monitoring' },
    // q78 (OTH02 wart sites)
    { questionIndex: 78, text: 'हाथ/पैर के मस्से — सैलिसिलिक एसिड घोल रोज रात में लगाएं', textEn: 'Warts on hands/feet — apply salicylic acid solution every night' },
    { questionIndex: 78, text: 'चेहरे/गुप्तांग के मस्से — खुद दवा न लगाएं — डॉक्टर से निकालवाएं', textEn: 'Warts on face/genitals — no self-treatment — get them removed by the doctor' },
    // q79 (OTH02 multiple warts)
    { questionIndex: 79, text: 'अनेक मस्से — आपस में फैलते हैं — सभी का एक साथ इलाज कराएं', textEn: 'Multiple warts spread to each other — treat all together' },
    { questionIndex: 79, text: 'एकल मस्सा — जल्दी इलाज फैलने से रोकता है', textEn: 'Single wart — early treatment stops the spread' },
    // q80 (OTH03 tag irritation)
    { questionIndex: 80, text: 'जलन वाले टैग — जगह सूखी रखें, रगड़ घटाएं — निकालना आसान है', textEn: 'Irritated tags — keep the area dry, reduce friction — removal is easy' },
    { questionIndex: 80, text: 'दर्द या खून — डॉक्टर से निकालवा लें', textEn: 'Painful or bleeding — get them removed by the doctor' },
    // q81 (OTH03 sugar)
    { questionIndex: 81, text: 'कई टैग + मोटापा — शुगर जांच करा लें', textEn: 'Many tags + overweight — get tested for blood sugar' },
    { questionIndex: 81, text: 'शुगर नॉर्मल — टैग निर्दोष हैं — चाहें तो हटा सकते हैं', textEn: 'Sugar normal — tags are harmless — removal optional' },
    // q82 (OTH04 bite age)
    { questionIndex: 82, text: '2-3 दिन पुराना काट — ठंडी सिकाई + एंटीहिस्टामिन', textEn: '2-3 day old bite — cold compress + antihistamine' },
    { questionIndex: 82, text: 'हफ्तों पुराना खुजलाता दाना — पैप्युलर यूर्टिकारिया — डॉक्टर से दिखाएं', textEn: 'Weeks-old itchy bump — papular urticaria — show the doctor' },
    // q83 (OTH04 cellulitis flag)
    { questionIndex: 83, text: 'फैलती लाली + बुखार — त्वचा में संक्रमण — तुरंत डॉक्टर से मिलें', textEn: 'Spreading redness + fever — skin infection — see the doctor immediately' },
    { questionIndex: 83, text: 'सूजन स्थानीय ही — सिकाई + निगरानी रखें', textEn: 'Swelling localized — compress + observe' },
    // q84 (OTH05 scabies hallmarks)
    { questionIndex: 84, text: 'रात की तेज खुजली + परिवार के सदस्यों को भी — स्केबीज — सबका एक साथ इलाज जरूरी', textEn: 'Severe night itch + family members too — scabies — treat everyone together' },
    { questionIndex: 84, text: 'सिर्फ मरीज को — एलर्जी/रूखी त्वचा भी हो सकती है — जांच कराएं', textEn: 'Only the patient — could be allergy/dry skin — get examined' },
    // q85 (OTH05 scabies sites)
    { questionIndex: 85, text: 'उंगलियों के बीच/नाभि/गुप्तांग — स्केबीज की खास जगहें — पुष्टि कराएं', textEn: 'Between fingers/navel/genitals — classic scabies sites — confirm it' },
    { questionIndex: 85, text: 'पीठ/बांहों पर — पैप्युलर यूर्टिकारिया भी हो सकता है', textEn: 'On the back/arms — could be papular urticaria instead' },
    // q86 (OTH06 burn age)
    { questionIndex: 86, text: 'हफ्तों पुराना जलन — पहले घाव भरने दें — सिल्वर जेल/मलहम लगाएं', textEn: 'Burn weeks old — let it heal first — silver gel/ointment' },
    { questionIndex: 86, text: 'महीनों पुराना — निशान का इलाज शुरू करें', textEn: 'Months old — start scar treatment' },
    // q87 (OTH06 scar type)
    { questionIndex: 87, text: 'उभरा निशान (केलॉइड) — जेल/दबाव उपचार — डॉक्टर से लें', textEn: 'Raised scar (keloid) — gel/pressure therapy — via the doctor' },
    { questionIndex: 87, text: 'गड्ढेदार निशान — भरने के उपचार आगे सोचें', textEn: 'Depressed scar — consider filling procedures later' },
    // q88 (OTH07 keloid origin)
    { questionIndex: 88, text: 'टीके/फोड़े पर बना केलॉइड — आगे कोई भी टीका डॉक्टर को बताकर लगवाएं', textEn: 'Keloid after a vaccine/boil — inform the doctor before any future vaccination' },
    { questionIndex: 88, text: 'घाव पर बना — जल्दी उपचार शुरू करें', textEn: 'Formed after a wound — start treatment early' },
    // q89 (OTH07 keloid symptoms)
    { questionIndex: 89, text: 'खुजली/दर्द वाला केलॉइड — डॉक्टर से इंजेक्शन उपचार की सलाह लें', textEn: 'Itchy/painful keloid — ask the doctor about injection therapy' },
    { questionIndex: 89, text: 'बिना लक्षण — सिलिकॉन जेल आजमा सकते हैं', textEn: 'No symptoms — can try silicone gel' },
    // q90 (OTH08 stretch cause)
    { questionIndex: 90, text: 'हाल की गर्भावस्था/वजन बदलाव — नए लाल मार्क्स का जवाब अच्छा मिलता है', textEn: 'Recent pregnancy/weight change — newer red marks respond better' },
    { questionIndex: 90, text: 'जिम/मसल-बढ़ोतरी — मार्क्स आम हैं — तेज बढ़ोतरी धीमी रखें', textEn: 'Gym/muscle gain — marks are common — slow down rapid gains' },
    // q91 (OTH08 red vs white)
    { questionIndex: 91, text: 'लाल नए मार्क्स — उपचार जल्दी शुरू करें', textEn: 'Red new marks — start treatment early' },
    { questionIndex: 91, text: 'सफेद पुराने मार्क्स — रिटिनॉयड क्रीम डॉक्टर सलाह से आजमा सकते हैं', textEn: 'Old white marks — may try a retinoid cream with doctor advice' },
    // q92 (OTH09 ulcer weeks)
    { questionIndex: 92, text: '2 हफ्ते से ज्यादा न भरा घाव — तुरंत डॉक्टर से दिखाएं', textEn: 'Ulcer not healing for 2+ weeks — show the doctor promptly' },
    { questionIndex: 92, text: 'नया घाव — रोज साफ करें, दवा लगाकर पट्टी करें', textEn: 'New wound — clean daily, apply ointment and dress' },
    // q93 (OTH09 sugar)
    { questionIndex: 93, text: 'न भरता घाव — FBS/HbA1c जांच जरूरी — शुगर नियंत्रण से घाव भरता है', textEn: 'Non-healing ulcer — FBS/HbA1c essential — sugar control heals wounds' },
    { questionIndex: 93, text: 'शुगर नॉर्मल — रक्त परिसंचरण की जांच कराएं', textEn: 'Sugar normal — get blood circulation assessed' },
  ],

  // ══ Labels (9 — standard vitals + lesion tracking) ═══════════════════
  labels: [
    { label: 'तापमान', labelEn: 'Temperature', unit: '°F' },
    { label: 'नाड़ी', labelEn: 'Pulse', unit: '/min' },
    { label: 'रक्तचाप', labelEn: 'Blood Pressure', unit: 'mmHg' },
    { label: 'वजन', labelEn: 'Weight', unit: 'kg' },
    { label: 'ऊंचाई', labelEn: 'Height', unit: 'cm' },
    { label: 'BMI', labelEn: 'BMI', unit: '', showUnit: false },
    { label: 'SpO2', labelEn: 'Oxygen Saturation', unit: '%' },
    { label: 'रैंडम ब्लड शुगर', labelEn: 'Random Blood Sugar', unit: 'mg/dl' },
    { label: 'सक्रिय दानों की गिनती', labelEn: 'Active Lesion Count', unit: '', showUnit: false },
  ],

  // ══ Findings (28 — ICD-10 where established) ═════════════════════════
  findings: [
    { key: 'ACNE-MILD', name: 'मुंहासे (हल्के ग्रेड 1-2)', nameEn: 'Acne Vulgaris (Mild, Grade 1-2)', icd10: 'L70.0' },
    { key: 'ACNE-SEVERE', name: 'गंभीर मुंहासे (गांठेदार)', nameEn: 'Acne Nodulocystic (Severe)', icd10: 'L70.1' },
    { key: 'AGA', name: 'पुरुषोचित बाल झड़ना', nameEn: 'Androgenetic Alopecia', icd10: 'L64.9' },
    { key: 'ALOPECIA-AREATA', name: 'धब्बेदार गंजापन', nameEn: 'Alopecia Areata', icd10: 'L63.9' },
    { key: 'TELOGEN-EFFLUVIUM', name: 'बीमारी के बाद बाल झड़ना', nameEn: 'Telogen Effluvium', icd10: 'L65.0' },
    { key: 'TINEA-CORPORIS', name: 'दाद (शरीर पर)', nameEn: 'Tinea Corporis', icd10: 'B35.4' },
    { key: 'TINEA-CRURIS', name: 'जांघ का दाद', nameEn: 'Tinea Cruris (Jock Itch)', icd10: 'B35.6' },
    { key: 'TINEA-PEDIS', name: 'पैर का दाद', nameEn: 'Tinea Pedis (Athlete Foot)', icd10: 'B35.3' },
    { key: 'ONYCHOMYCOSIS', name: 'नाखून फंगल संक्रमण', nameEn: 'Onychomycosis', icd10: 'B35.1' },
    { key: 'PITY-VERSICOLOR', name: 'सफेद दाग (फंगल वर्सिकलर)', nameEn: 'Pityriasis Versicolor', icd10: 'B36.0' },
    { key: 'SEB-DERM', name: 'सेबोरिक डर्मेटाइटिस', nameEn: 'Seborrheic Dermatitis', icd10: 'L21.9' },
    { key: 'ATOPIC-DERM', name: 'एटोपिक एक्जिमा', nameEn: 'Atopic Dermatitis', icd10: 'L20.9' },
    { key: 'CONTACT-DERM', name: 'संपर्क से एलर्जी', nameEn: 'Contact Dermatitis', icd10: 'L25.9' },
    { key: 'HAND-ECZEMA', name: 'हाथ का एक्जिमा', nameEn: 'Hand Eczema (Dyshidrotic)', icd10: 'L30.1' },
    { key: 'URTICARIA-ACUTE', name: 'तीव्र पित्ती', nameEn: 'Acute Urticaria', icd10: 'L50.9' },
    { key: 'URTICARIA-CHRONIC', name: 'पुरानी पित्ती (6 हफ्ते+)', nameEn: 'Chronic Urticaria', icd10: 'L50.1' },
    { key: 'SCABIES', name: 'खाज (स्केबीज)', nameEn: 'Scabies', icd10: 'B86' },
    { key: 'MELASMA', name: 'मेलास्मा (गालों के धब्बे)', nameEn: 'Melasma', icd10: 'L81.1' },
    { key: 'PIH', name: 'सूजन के बाद का कालापन', nameEn: 'Post-inflammatory Hyperpigmentation', icd10: 'L81.0' },
    { key: 'VITILIGO-FOCAL', name: 'विटिलिगो (सीमित धब्बे)', nameEn: 'Vitiligo (Focal)', icd10: 'L80' },
    { key: 'PSORIASIS', name: 'सोरायासिस', nameEn: 'Psoriasis Vulgaris', icd10: 'L40.0' },
    { key: 'LICHEN-PLANUS', name: 'लिचेन प्लेनस', nameEn: 'Lichen Planus', icd10: 'L43.9' },
    { key: 'VIRAL-WART', name: 'मस्सा', nameEn: 'Viral Wart', icd10: 'B07' },
    { key: 'KELOID', name: 'केलॉइड / मोटा निशान', nameEn: 'Keloid / Hypertrophic Scar', icd10: 'L91.0' },
    { key: 'XEROSIS', name: 'रूखी त्वचा', nameEn: 'Xerosis (Dry Skin)', icd10: 'L85.3' },
    { key: 'PAPULAR-URTICARIA', name: 'कीड़े के काटने की प्रतिक्रिया', nameEn: 'Papular Urticaria (Insect Bite)', icd10: 'L50.8' },
    { key: 'STEROID-MISUSE', name: 'स्टेरॉयड क्रीम के दुष्प्रयोग से त्वचा नुकसान', nameEn: 'Topical Steroid Misuse Dermatitis', icd10: 'L30.9' },
    { key: 'FURUNCLE', name: 'फोड़ा / फुंसी', nameEn: 'Furuncle (Boil)', icd10: 'L02.9' },
  ],

  // ══ Medicines (74) — India derm OPD core ══════════════════════════════
  // morning/afternoon/evening = default units at that slot; tab = dispense
  // qty multiplier. flags: pregnancy/pediatric/schedule; verified=false until
  // MBBS/MD review. SAFETY: isotretinoin Sch H + teratogenic; tretinoin &
  // hydroquinone/triple combos pregnancy-avoid + night-only; Tenovate potent
  // (not for face/folds, max 2 weeks); finasteride men only; ivermectin
  // weight-based. NO steroid+antifungal / steroid+antibiotic fixed combos.
  medicines: [
    // ── Oral antifungals ──
    { name: 'Terbicip 250 Tablet', salt: 'Terbinafine HCl 250 mg — oral antifungal; monitor for hepatotoxicity', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Itaspor 100 Capsule', salt: 'Itraconazole 100 mg — take with food; avoid in pregnancy', doseOptions: ['1 cap twice daily with food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Itaspor 200 Capsule', salt: 'Itraconazole 200 mg — take with food; avoid in pregnancy', doseOptions: ['1 cap once-twice daily with food'], morning: 1, afternoon: 0, evening: 1, tab: 28, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Forcan 150 Tablet', salt: 'Fluconazole 150 mg — once-weekly oral antifungal', doseOptions: ['1 tab once weekly at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 4, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Topical antifungals ──
    { name: 'Lulifin Cream 15g', salt: 'Luliconazole 1% w/w cream — apply 1 cm beyond lesion edge', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Onabet Cream 15g', salt: 'Sertaconazole 2% w/w cream', doseOptions: ['Apply twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Cream 20g', salt: 'Clotrimazole 1% w/w cream', doseOptions: ['Apply twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Nizral Cream 30g', salt: 'Ketoconazole 2% w/w cream', doseOptions: ['Apply once-twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Terbicip Cream 15g', salt: 'Terbinafine 1% w/w cream', doseOptions: ['Apply once-twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Candid Dusting Powder 100g', salt: 'Clotrimazole 1% dusting powder — keeps folds dry', doseOptions: ['Dust lightly on dry skin once-twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Medicated shampoos / washes ──
    { name: 'Ketop Shampoo 50ml', salt: 'Ketoconazole 2% shampoo — leave 5 min then rinse', doseOptions: ['Use twice weekly, leave 5 min'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Scalpe Plus Shampoo 75ml', salt: 'Ketoconazole 2% + ZPTO 1% shampoo — dandruff/seborrheic dermatitis', doseOptions: ['Use twice weekly'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Selsun Shampoo 100ml', salt: 'Selenium sulphide 2.5% shampoo — versicolor/seborrhea', doseOptions: ['Use twice weekly; rinse well'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Keto Soap 75g', salt: 'Ketoconazole 2% bathing bar — fungal body wash', doseOptions: ['Use as bath soap on affected areas'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Acne topical ──
    { name: 'Adaple Gel 15g', salt: 'Adapalene 0.1% gel — NIGHT ONLY application; sunscreen every morning', doseOptions: ['Apply pea-size thin layer at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Benzac AC 2.5% Gel 50g', salt: 'Benzoyl peroxide 2.5% gel — bleaches clothes/pillow covers', doseOptions: ['Apply thin layer in the morning'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Clindac-A Gel 15g', salt: 'Clindamycin phosphate 1% gel', doseOptions: ['Apply thin layer in the morning'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'AdaClin Gel 15g', salt: 'Clindamycin 1% + Adapalene 0.1% gel — apply at night', doseOptions: ['Apply thin layer at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Aziderm Cream 15g', salt: 'Azelaic acid 20% cream — acne + pigmentation', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Retino-A 0.025% Cream 20g', salt: 'Tretinoin 0.025% — NIGHT ONLY; strict sun protection; avoid in pregnancy', doseOptions: ['Apply pea-size at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Persol Soap 75g', salt: 'Benzoyl peroxide 2.5% bathing bar — body/back acne', doseOptions: ['Wash affected areas once daily'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Acne oral ──
    { name: 'Isotroin 10 Capsule', salt: 'Isotretinoin 10 mg — teratogenic — pregnancy test before start; strict contraception; dry lips common', doseOptions: ['1 cap once-twice daily with food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Isotroin 20 Capsule', salt: 'Isotretinoin 20 mg — teratogenic — pregnancy test before start; strict contraception', doseOptions: ['1 cap once daily with food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Doxt-SL Tablet', salt: 'Doxycycline 100 mg + lactic acid bacillus — after food; no lying down for 30 min', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500 mg — 3-day course', doseOptions: ['1 tab once daily for 3 days'], morning: 1, afternoon: 0, evening: 0, tab: 3, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Hair ──
    { name: 'Mintop Forte 5% Solution 60ml', salt: 'Minoxidil 5% topical solution (men) — apply on dry scalp; wash hands after', doseOptions: ['1 ml twice daily on scalp'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Mintop 2% Solution 60ml', salt: 'Minoxidil 2% topical solution — women / sensitive scalp', doseOptions: ['1 ml twice daily on scalp'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Mintop 10 Solution 60ml', salt: 'Minoxidil 10% solution (men, stubborn AGA)', doseOptions: ['1 ml once daily at night'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Tugain 5% Solution 60ml', salt: 'Minoxidil 5% solution — alopecia areata / AGA', doseOptions: ['1 ml twice daily on scalp'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Morr F 5% Solution 60ml', salt: 'Minoxidil 5% + Finasteride 0.1% topical — MEN ONLY', doseOptions: ['1 ml twice daily on scalp'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Finpecia 1mg Tablet', salt: 'Finasteride 1 mg — MEN ONLY; pregnant women must not handle crushed tablets', doseOptions: ['1 tab once daily at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 30, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Xtraglo Tablet', salt: 'Biotin + L-cysteine + minerals hair supplement', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Biotin Forte Tablet', salt: 'Biotin 10 mg + multivitamin hair/nail support', doseOptions: ['1 tab once daily after food'], morning: 1, afternoon: 0, evening: 0, tab: 30, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Topical steroid ladder (mild → very potent) ──
    { name: 'Hydrocortisone 1% Cream 15g', salt: 'Hydrocortisone 1% — mild steroid; safe for face/folds in short courses', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Desowen Cream 15g', salt: 'Desonide 0.05% — low-potent steroid for face/intertrigo', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Elocon Cream 15g', salt: 'Mometasone furoate 0.1% — mid-potent; avoid >2 weeks on face', doseOptions: ['Apply thin layer once daily'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Diprovate Cream 15g', salt: 'Betamethasone dipropionate 0.05% — potent; body only', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Betnovate Cream 20g', salt: 'Betamethasone valerate 0.1% — potent; body only; short course', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Tenovate Cream 15g', salt: 'Clobetasol propionate 0.05% — potent — NOT for face/folds; max 2 weeks', doseOptions: ['Apply thin layer twice daily (max 2 weeks)'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Calcineurin inhibitor + emollients ──
    { name: 'Tacroz Forte Ointment 10g', salt: 'Tacrolimus 0.1% ointment — steroid-sparing for face/folds; burning initially; sun protection', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Venusia Moisturizing Lotion 100ml', salt: 'Intensive moisturizer (shea butter/aloe) for dry & atopic skin', doseOptions: ['Apply liberally 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cetaphil Moisturizing Cream 80g', salt: 'Non-comedogenic moisturizing cream', doseOptions: ['Apply 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Cetaphil Gentle Skin Cleanser 125ml', salt: 'Soap-free non-alkaline cleanser for face', doseOptions: ['Wash face once-twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Moisturex Cream 50g', salt: 'Urea + lactic acid + paraffin emollient — cracked heels/thick skin', doseOptions: ['Apply twice daily on thick/cracked skin'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Atogla Cream 100g', salt: 'Ceramide + colloidal oatmeal barrier cream for atopic dermatitis', doseOptions: ['Apply liberally after bath & at bedtime'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Oral antihistamines ──
    { name: 'Levocet 5 Tablet', salt: 'Levocetirizine 5 mg', doseOptions: ['1 tab once daily at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Allegra 120 Tablet', salt: 'Fexofenadine HCl 120 mg — non-sedating', doseOptions: ['1 tab once-twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Allegra 180 Tablet', salt: 'Fexofenadine HCl 180 mg — once daily', doseOptions: ['1 tab once daily'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Montair LC Tablet', salt: 'Montelukast 10 mg + Levocetirizine 5 mg', doseOptions: ['1 tab once daily at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Atarax 10 Tablet', salt: 'Hydroxyzine HCl 10 mg — sedating; for night itch', doseOptions: ['1 tab 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 15, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Oral steroid (short course) ──
    { name: 'Wysolone 10 Tablet', salt: 'Prednisolone 10 mg — short tapering course only under doctor supervision', doseOptions: ['1 tab once daily after breakfast'], morning: 1, afternoon: 0, evening: 0, tab: 10, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Psoriasis ──
    { name: 'Daivobet Ointment 30g', salt: 'Calcipotriol 50 mcg/g + Betamethasone 0.5 mg/g — max 100 g/week', doseOptions: ['Apply thin layer on plaques once daily'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Protar Shampoo 100ml', salt: 'Coal tar 5% shampoo — scalp psoriasis; stains light hair', doseOptions: ['Use twice weekly; leave 5-10 min'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Salicylix 6% Ointment 50g', salt: 'Salicylic acid 6% keratolytic — thick plaques/palms/soles', doseOptions: ['Apply at bedtime on thick plaques'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Dipsalic Ointment 25g', salt: 'Betamethasone dipropionate + salicylic acid — palmoplantar plaques', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Pigmentation ──
    { name: 'Melalite Forte Cream 15g', salt: 'Hydroquinone 4% — NIGHT ONLY on spots; max 2-3 months; daily sunscreen mandatory', doseOptions: ['Apply on spots only at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Lumacip Plus Cream 15g', salt: 'Fluocinolone 0.01% + Hydroquinone 2% + Tretinoin 0.05% triple cream — melasma; max 2-3 months; steroid-containing', doseOptions: ['Apply thin layer at bedtime on patches'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'avoid', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Kojivit Cream 30g', salt: 'Kojic acid + arbutin + vitamin E depigmenting cream', doseOptions: ['Apply at bedtime on marks'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Glyco 6 Cream 30g', salt: 'Glycolic acid 6% — mild peel/maintenance for pigmentation', doseOptions: ['Apply at bedtime; start alternate nights'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Melaglow Cream 15g', salt: 'Niacinamide-based brightening night cream — maintenance', doseOptions: ['Apply at bedtime'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Sunscreen ──
    { name: 'Sunscreen SPF 50 Gel 50g', salt: 'Broad-spectrum UVA/UVB gel sunscreen — reapply every 3 hrs', doseOptions: ['Apply 2 finger-lengths every morning; reapply 3 hrly'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
    { name: 'Suncross Gel 50g', salt: 'Sunscreen gel SPF 50+ — for oily/acne-prone skin', doseOptions: ['Apply every morning; reapply after sweating'], morning: 1, afternoon: 0, evening: 0, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Scabies ──
    { name: 'Permite Cream 30g', salt: 'Permethrin 5% cream — apply neck-down ALL NIGHT; repeat after 7 days; whole family same day', doseOptions: ['Apply thin layer at bedtime, wash off next morning'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Ivermectol 12 Tablet', salt: 'Ivermectin 12 mg — 200 mcg/kg single dose on empty stomach; repeat day 7', doseOptions: ['1 tab single dose (weight-based)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },
    { name: 'Ivermectol 6 Tablet', salt: 'Ivermectin 6 mg — for lighter patients (weight-based dosing)', doseOptions: ['1-2 tabs single dose (weight-based)'], morning: 0, afternoon: 0, evening: 1, tab: 2, flags: { pregnancy: 'caution', pediatric: 'weight-based', schedule: 'H', verified: false } },

    // ── Warts ──
    { name: 'Duofilm Solution 15ml', salt: 'Salicylic acid 16.7% + lactic acid 16.7% wart paint — protect surrounding skin', doseOptions: ['Apply on wart once daily at night'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Nail lacquer ──
    { name: 'Loceryl Nail Lacquer 2.5ml', salt: 'Amorolfine 5% nail lacquer — apply once weekly after filing the nail', doseOptions: ['Apply once weekly on cleaned nail'], morning: 0, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Topical antibiotics ──
    { name: 'T-Bact Ointment 5g', salt: 'Mupirocin 2% ointment — infected lesions/impetigo', doseOptions: ['Apply thin layer 3 times daily'], morning: 1, afternoon: 1, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Fucidin Cream 15g', salt: 'Fusidic acid 2% cream — infected eczema', doseOptions: ['Apply thin layer 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },
    { name: 'Soframycin Cream 30g', salt: 'Framycetin sulphate 1% cream — minor infected cuts', doseOptions: ['Apply thin layer 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Burns ──
    { name: 'Silverex Heal Gel 30g', salt: 'Silver sulfadiazine 1% gel — superficial burns; NOT for deep/chemical burns (refer)', doseOptions: ['Apply thin layer twice daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'caution', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Oral antibiotic ──
    { name: 'Augmentin 625 Tablet', salt: 'Amoxicillin 500 mg + Clavulanic acid 125 mg', doseOptions: ['1 tab twice daily after food'], morning: 1, afternoon: 0, evening: 1, tab: 10, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'H', verified: false } },

    // ── Scar care ──
    { name: 'Contractubex Gel 20g', salt: 'Cepae extract + heparin + allantoin anti-scar gel', doseOptions: ['Apply twice daily with gentle massage'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },

    // ── Symptomatic ──
    { name: 'Calosoft Lotion 100ml', salt: 'Calamine + light liquid paraffin — soothing anti-itch lotion', doseOptions: ['Apply on itching 2-3 times daily'], morning: 1, afternoon: 0, evening: 1, tab: 1, flags: { pregnancy: 'safe', pediatric: 'na', schedule: 'OTC', verified: false } },
  ],

  // ══ Finding ↔ Medicine links (44) ════════════════════════════════════
  findingMeds: [
    // ACNE-MILD (Grade 1-2)
    { findingKey: 'ACNE-MILD', medicineName: 'Adaple Gel 15g', dose: 'Pea-size thin layer', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Night only; sunscreen every morning' },
    { findingKey: 'ACNE-MILD', medicineName: 'Clindac-A Gel 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Morning on pimples' },
    { findingKey: 'ACNE-MILD', medicineName: 'Benzac AC 2.5% Gel 50g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Morning alternative; bleaches fabric' },
    // ACNE-SEVERE (nodulocystic)
    { findingKey: 'ACNE-SEVERE', medicineName: 'Isotroin 20 Capsule', dose: '1 cap (20 mg)', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'With fatty food; pregnancy contraindicated — test before start; lipid/LFT at 1-2 months' },
    { findingKey: 'ACNE-SEVERE', medicineName: 'Doxt-SL Tablet', dose: '1 tab', morning: 1, afternoon: 0, evening: 1, tab: 30, description: 'After food × 4 weeks; avoid sun' },
    // AGA
    { findingKey: 'AGA', medicineName: 'Finpecia 1mg Tablet', dose: '1 tab (1 mg)', morning: 0, afternoon: 0, evening: 1, tab: 30, description: 'Men only; daily long-term; benefits at 3-6 months' },
    { findingKey: 'AGA', medicineName: 'Mintop Forte 5% Solution 60ml', dose: '1 ml on scalp', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Dry scalp; wash hands after' },
    // ALOPECIA-AREATA
    { findingKey: 'ALOPECIA-AREATA', medicineName: 'Tugain 5% Solution 60ml', dose: '1 ml on patch', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BID on patch; intralesional therapy via dermatologist' },
    // TELOGEN-EFFLUVIUM
    { findingKey: 'TELOGEN-EFFLUVIUM', medicineName: 'Xtraglo Tablet', dose: '1 tab', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'Daily; correct iron/vit D if deficient' },
    // TINEA-CORPORIS
    { findingKey: 'TINEA-CORPORIS', medicineName: 'Terbicip 250 Tablet', dose: '1 tab (250 mg)', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'OD after food × 2-4 weeks' },
    { findingKey: 'TINEA-CORPORIS', medicineName: 'Lulifin Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD; apply 1 cm beyond edge; continue 2 weeks after clearance' },
    // TINEA-CRURIS
    { findingKey: 'TINEA-CRURIS', medicineName: 'Itaspor 200 Capsule', dose: '1 cap (200 mg)', morning: 1, afternoon: 0, evening: 1, tab: 28, description: 'With food × 1-2 weeks; avoid in pregnancy' },
    { findingKey: 'TINEA-CRURIS', medicineName: 'Lulifin Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD on groin; keep area dry' },
    { findingKey: 'TINEA-CRURIS', medicineName: 'Candid Dusting Powder 100g', dose: 'Dust lightly', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'After drying; loose cotton clothes' },
    // TINEA-PEDIS
    { findingKey: 'TINEA-PEDIS', medicineName: 'Terbicip Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD × 4 weeks; dry toes fully' },
    // ONYCHOMYCOSIS
    { findingKey: 'ONYCHOMYCOSIS', medicineName: 'Itaspor 200 Capsule', dose: '1 cap (200 mg)', morning: 1, afternoon: 0, evening: 1, tab: 28, description: 'Pulse: 200 mg BD × 1 week/month × 3-4 cycles' },
    { findingKey: 'ONYCHOMYCOSIS', medicineName: 'Loceryl Nail Lacquer 2.5ml', dose: 'Thin coat', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Once weekly after filing; 6-12 months' },
    // PITY-VERSICOLOR
    { findingKey: 'PITY-VERSICOLOR', medicineName: 'Selsun Shampoo 100ml', dose: 'Apply as body wash', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Leave 10 min × 2 weekly × 4 weeks; also scalp if involved' },
    // SEB-DERM
    { findingKey: 'SEB-DERM', medicineName: 'Scalpe Plus Shampoo 75ml', dose: 'Wash twice weekly', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Leave 5 min; also apply on face folds gently' },
    // ATOPIC-DERM
    { findingKey: 'ATOPIC-DERM', medicineName: 'Tacroz Forte Ointment 10g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD on face/fold patches; burning initially' },
    { findingKey: 'ATOPIC-DERM', medicineName: 'Venusia Moisturizing Lotion 100ml', dose: 'Liberal application', morning: 1, afternoon: 0, evening: 1, tab: 1, description: '3-5 times daily; within 3 min of bath' },
    // CONTACT-DERM
    { findingKey: 'CONTACT-DERM', medicineName: 'Hydrocortisone 1% Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD × 1-2 weeks; identify and remove trigger' },
    { findingKey: 'CONTACT-DERM', medicineName: 'Levocet 5 Tablet', dose: '1 tab (5 mg)', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'HS × 7-10 days' },
    // HAND-ECZEMA
    { findingKey: 'HAND-ECZEMA', medicineName: 'Diprovate Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD × 2 weeks max; cotton-lined gloves for wet work' },
    // URTICARIA-ACUTE
    { findingKey: 'URTICARIA-ACUTE', medicineName: 'Levocet 5 Tablet', dose: '1 tab (5 mg)', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'HS × 1-2 weeks; find trigger' },
    { findingKey: 'URTICARIA-ACUTE', medicineName: 'Atarax 10 Tablet', dose: '1 tab (10 mg)', morning: 1, afternoon: 0, evening: 1, tab: 15, description: 'If night itch severe; sedating' },
    // URTICARIA-CHRONIC
    { findingKey: 'URTICARIA-CHRONIC', medicineName: 'Allegra 180 Tablet', dose: '1 tab (180 mg)', morning: 1, afternoon: 0, evening: 0, tab: 30, description: 'OD daily; up-dose only on doctor advice; maintain 4+ weeks after control' },
    // SCABIES
    { findingKey: 'SCABIES', medicineName: 'Permite Cream 30g', dose: 'Neck-down full body', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'All members same night; 8-12 hrs then wash; repeat day 7' },
    { findingKey: 'SCABIES', medicineName: 'Ivermectol 12 Tablet', dose: '1 tab (12 mg)', morning: 0, afternoon: 0, evening: 1, tab: 2, description: 'Adults 200 mcg/kg empty stomach; repeat day 7' },
    // MELASMA
    { findingKey: 'MELASMA', medicineName: 'Lumacip Plus Cream 15g', dose: 'Thin layer on patches', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Night only × 8 weeks max; strict morning sunscreen' },
    { findingKey: 'MELASMA', medicineName: 'Sunscreen SPF 50 Gel 50g', dose: '2 finger-lengths', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'Every 3 hrs outdoors; the single most important step' },
    // PIH
    { findingKey: 'PIH', medicineName: 'Kojivit Cream 30g', dose: 'Thin layer on marks', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Night × 2-3 months with sunscreen' },
    // VITILIGO-FOCAL
    { findingKey: 'VITILIGO-FOCAL', medicineName: 'Tacroz Forte Ointment 10g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD on face/neck patches; refer for phototherapy if spreading' },
    // PSORIASIS
    { findingKey: 'PSORIASIS', medicineName: 'Daivobet Ointment 30g', dose: 'Thin layer on plaques', morning: 1, afternoon: 0, evening: 0, tab: 1, description: 'OD × 4 weeks; max 100 g/week; not on face/folds' },
    { findingKey: 'PSORIASIS', medicineName: 'Salicylix 6% Ointment 50g', dose: 'On thick plaques', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Night; descale before Daivobet for thick plaques' },
    // LICHEN-PLANUS
    { findingKey: 'LICHEN-PLANUS', medicineName: 'Tenovate Cream 15g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD on itchy plaques × 2-3 weeks; body lesions only' },
    // VIRAL-WART
    { findingKey: 'VIRAL-WART', medicineName: 'Duofilm Solution 15ml', dose: 'Apply on wart', morning: 0, afternoon: 0, evening: 1, tab: 1, description: 'Night daily; protect surrounding skin; cryotherapy if resistant' },
    // KELOID
    { findingKey: 'KELOID', medicineName: 'Contractubex Gel 20g', dose: 'Thin layer + massage', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'BD × 3-6 months on fresh scars; injection therapy via dermatologist' },
    // XEROSIS
    { findingKey: 'XEROSIS', medicineName: 'Venusia Moisturizing Lotion 100ml', dose: 'Liberal application', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'After bath within 3 min; lukewarm water only' },
    // PAPULAR-URTICARIA
    { findingKey: 'PAPULAR-URTICARIA', medicineName: 'Levocet 5 Tablet', dose: '1 tab (5 mg)', morning: 0, afternoon: 0, evening: 1, tab: 10, description: 'HS × 2 weeks; bed-net/repellent for prevention' },
    { findingKey: 'PAPULAR-URTICARIA', medicineName: 'Calosoft Lotion 100ml', dose: 'Apply on lesions', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Soothing; avoid scratching' },
    // STEROID-MISUSE
    { findingKey: 'STEROID-MISUSE', medicineName: 'Tacroz Forte Ointment 10g', dose: 'Thin layer', morning: 1, afternoon: 0, evening: 1, tab: 1, description: 'Steroid-sparing replacement during taper; counsel hard on no re-use' },
    // FURUNCLE
    { findingKey: 'FURUNCLE', medicineName: 'Azithral 500 Tablet', dose: '1 tab (500 mg)', morning: 1, afternoon: 0, evening: 0, tab: 3, description: 'OD × 3 days; warm compress 10 min TDS' },
    { findingKey: 'FURUNCLE', medicineName: 'T-Bact Ointment 5g', dose: 'Thin layer', morning: 1, afternoon: 1, evening: 1, tab: 1, description: 'TDS × 5-7 days; do NOT squeeze' },
  ],

  // ══ Table templates (6) ═══════════════════════════════════════════════
  tables: [
    {
      name: 'Acne Severity Grid',
      rows: 4,
      cols: 5,
      headerLabel: ['ग्रेड', 'कॉमिडोन्स', 'पैप्यूल/पस्ट्यूल', 'नोड्यूल', 'उपचार रेखा'],
      colsLabel: ['Grade', 'Comedones', 'Papules/Pustules', 'Nodules', 'Treatment Line'],
      footerLabel: ['ग्रेड 3-4 में आइसोट्रेटिनोइन केवल त्वचा-रोग विशेषज्ञ की देखरेख में / Grade 3-4: isotretinoin only under a dermatologist'],
      extraLabel: 'ग्रेड 1: टॉपिकल · ग्रेड 2: टॉपिकल+मुंह की दवा · ग्रेड 3-4: आइसोट्रेटिनोइन विचारित / Grade 1: topical · Grade 2: topical+oral · Grade 3-4: consider isotretinoin',
    },
    {
      name: 'Lesion / White-Patch Body Map',
      rows: 8,
      cols: 4,
      headerLabel: ['शरीर का भाग', 'दाग का नाप (सेमी)', 'कब से', 'बढ़ रहा है?'],
      colsLabel: ['Body Site', 'Patch Size (cm)', 'Since When', 'Spreading?'],
      footerLabel: ['हर महीने नापकर लिखें, तुलना डॉक्टर को दिखाएं / Measure monthly and show the comparison to the doctor'],
    },
    {
      name: 'Eczema Flare Tracker',
      rows: 10,
      cols: 5,
      headerLabel: ['तारीख', 'ट्रिगर (साबुन/गहना/खाना)', 'मौसम', 'फ्लेयर कितने दिन', 'दवा का जवाब'],
      colsLabel: ['Date', 'Trigger (soap/jewellery/food)', 'Season', 'Flare Days', 'Response to Meds'],
      footerLabel: ['ट्रिगर का पैटर्न मिले तो वह चीज हमेशा के लिए बंद करें / Once a trigger pattern is found, avoid that item permanently'],
    },
    {
      name: 'Tinea Site Tracker (14 days)',
      rows: 14,
      cols: 5,
      headerLabel: ['तारीख', 'दाद की जगह', 'खुजली स्कोर (0-10)', 'क्रीम लगाई?', 'कपड़े उबाले/इस्त्री?'],
      colsLabel: ['Date', 'Tinea Site', 'Itch Score (0-10)', 'Cream Applied?', 'Clothes Ironed/Boiled?'],
      footerLabel: ['क्रीम दाने गायब होने के बाद भी 2 हफ्ते लगाते रहें / Continue the cream for 2 weeks AFTER the lesions clear'],
    },
    {
      name: 'Steroid Cream Counseling Checklist',
      rows: 8,
      cols: 3,
      headerLabel: ['चेक-प्रश्न', 'जवाब', 'नोट'],
      colsLabel: ['Check Question', 'Answer', 'Note'],
      footerLabel: ['जो क्रीम चेहरा जल्दी "गोरा" करे वह स्टेरॉयड हो सकती है — डॉक्टर से पूछे बिना न लगाएं / Creams promising quick fairness may be steroid-based — never apply without asking the doctor'],
    },
    {
      name: 'Itch / Urticaria Diary (14 days)',
      rows: 14,
      cols: 3,
      headerLabel: ['तारीख', 'पित्ती/खुजली स्कोर (0-10)', 'संदिग्ध ट्रिगर'],
      colsLabel: ['Date', 'Wheal/Itch Score (0-10)', 'Suspected Trigger'],
      footerLabel: ['6 हफ्ते से ज्यादा रहे तो डॉक्टर से जांच कराएं / If symptoms persist beyond 6 weeks, see the doctor'],
    },
  ],

  // ══ Rx quick-packages (6) ════════════════════════════════════════════
  rxTemplates: [
    {
      name: 'Acne Grade 1-2 — Standard Course',
      diagnosis: 'ACNE-MILD',
      medicines: [
        { name: 'Adaple Gel 15g', dose: 'Pea-size thin layer', duration: '8 weeks', instructions: 'At bedtime on dry face; sunscreen every morning' },
        { name: 'Clindac-A Gel 15g', dose: 'Thin layer', duration: '8 weeks', instructions: 'Morning on pimples; do not combine same slot with benzoyl peroxide' },
        { name: 'Benzac AC 2.5% Gel 50g', dose: 'Thin layer', duration: '4 weeks', instructions: 'Morning alternate-day if irritation; bleaches pillow covers' },
      ],
      labs: ['Hormonal profile (only if PCOS features)'],
      advice: 'चेहरा दिन में 2 बार हल्के फेस वॉश से धोएं · मुंहासे न नोचें · तला-मसालेदार घटाएं · नतीजे 6-8 हफ्ते में दिखते हैं',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'Tinea Corporis — 4-Week Course',
      diagnosis: 'TINEA-CORPORIS',
      medicines: [
        { name: 'Terbicip 250 Tablet', dose: '1 tab (250 mg)', duration: '4 weeks', instructions: 'Once daily after food' },
        { name: 'Lulifin Cream 15g', dose: 'Thin layer', duration: '6 weeks', instructions: 'Twice daily; apply 1 cm beyond edge; continue 2 weeks AFTER clearance' },
        { name: 'Candid Dusting Powder 100g', dose: 'Dust lightly', duration: '4 weeks', instructions: 'After drying the area; keep folds dry' },
      ],
      labs: ['KOH mount (only if diagnosis doubtful)'],
      advice: 'कपड़े रोज बदलें और गर्म इस्त्री करें · तौलिया/कंघी साझा न करें · जगह सूखी रखें · खुजली वाली कॉम्बो क्रीम बिल्कुल बंद करें',
      followUpDays: 28,
      isCommon: true,
    },
    {
      name: 'Chronic Urticaria — Control Course',
      diagnosis: 'URTICARIA-CHRONIC',
      medicines: [
        { name: 'Allegra 180 Tablet', dose: '1 tab (180 mg)', duration: '30 days', instructions: 'Once daily in the morning, same time daily' },
        { name: 'Montair LC Tablet', dose: '1 tab', duration: '30 days', instructions: 'At bedtime' },
        { name: 'Calosoft Lotion 100ml', dose: 'Apply on wheals', duration: '30 days', instructions: 'As needed for itching' },
      ],
      labs: ['CBC with eosinophil count', 'TSH', 'Stool routine (parasite screen)'],
      advice: 'ट्रिगर डायरी रखें · गर्म मसालेदार खाना घटाएं · दवा लक्षण रुकने के बाद भी 4 हफ्ते जारी रखें · होंठ/सांस में सूजन हो तो तुरंत अस्पताल',
      followUpDays: 14,
    },
    {
      name: 'Androgenetic Alopecia — Male Start',
      diagnosis: 'AGA',
      medicines: [
        { name: 'Finpecia 1mg Tablet', dose: '1 tab (1 mg)', duration: '90 days', instructions: 'Bedtime daily; men only — women must not handle crushed tablets' },
        { name: 'Mintop Forte 5% Solution 60ml', dose: '1 ml', duration: '90 days', instructions: 'Twice daily on dry scalp; wash hands after' },
        { name: 'Xtraglo Tablet', dose: '1 tab', duration: '30 days', instructions: 'After breakfast daily' },
      ],
      labs: ['CBC', 'Serum Ferritin', 'TSH', 'Vitamin D (25-OH)', 'Serum Vitamin B12'],
      advice: 'लाभ 3-6 महीने में दिखता है — दवा बीच में न छोड़ें · मिनॉक्सिडिल लगाने के बाद 4 घंटे नहाएं नहीं · शुरुआत में झड़ना अस्थायी बढ़ सकता है',
      followUpDays: 60,
    },
    {
      name: 'Scabies — Household Treatment',
      diagnosis: 'SCABIES',
      medicines: [
        { name: 'Permite Cream 30g', dose: 'Neck-down full body', duration: '2 applications', instructions: 'All family members same night; 8-12 hours then wash; repeat day 7' },
        { name: 'Ivermectol 12 Tablet', dose: '1 tab (12 mg)', duration: '2 doses', instructions: 'Adults: single dose empty stomach, repeat day 7 (weight-based)' },
        { name: 'Levocet 5 Tablet', dose: '1 tab (5 mg)', duration: '7 days', instructions: 'Bedtime for residual itch' },
      ],
      labs: [],
      advice: 'सभी परिवार सदस्यों का एक ही रात इलाज · कपड़े-चादर गर्म पानी में उबालें/इस्त्री करें · क्रीम गर्दन से नीचे पूरे शरीर पर लगाएं · इलाज के बाद भी खुजली 2 हफ्ते रह सकती है',
      followUpDays: 14,
    },
    {
      name: 'Melasma — Night + Sun Course',
      diagnosis: 'MELASMA',
      medicines: [
        { name: 'Lumacip Plus Cream 15g', dose: 'Thin layer on patches', duration: '8 weeks', instructions: 'Bedtime only; max 2-3 months; steroid-containing — do not use in pregnancy' },
        { name: 'Sunscreen SPF 50 Gel 50g', dose: '2 finger-lengths', duration: 'ongoing', instructions: 'Every morning; reapply every 3 hours outdoors' },
        { name: 'Kojivit Cream 30g', dose: 'Thin layer on marks', duration: '12 weeks', instructions: 'After triple cream stops, as maintenance at bedtime' },
      ],
      labs: [],
      advice: 'धूप से बचाव सबसे जरूरी — टोपी/छाता के साथ रोज सनस्क्रीन · ट्रिपल क्रीम 2-3 महीने से ज्यादा कभी नहीं · गर्भावस्था में सिर्फ सनस्क्रीन',
      followUpDays: 30,
    },
  ],
}
