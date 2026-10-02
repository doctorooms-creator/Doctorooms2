/**
 * Seed blog posts for the public blog page.
 * Uses the admin user as author; posts are Published so they render publicly.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const POSTS = [
  {
    title: '10 Heart-Healthy Habits Everyone Should Adopt',
    permalink: 'heart-healthy-habits',
    content: `Heart disease remains one of the leading health concerns in India, but small daily habits make a big difference.

**1. Move for 30 minutes a day** — A brisk walk, cycling, or swimming strengthens the heart muscle.

**2. Watch your salt intake** — Limit processed foods and keep daily sodium under 5g of salt.

**3. Eat more fiber** — Oats, legumes, fruits, and vegetables help lower cholesterol naturally.

**4. Quit smoking** — Within a year of quitting, your heart disease risk drops dramatically.

**5. Sleep 7–8 hours** — Poor sleep is linked to hypertension and irregular heartbeat.

**6. Manage stress** — Deep breathing, meditation, and yoga lower blood pressure over time.

**7. Check your numbers** — Know your blood pressure, cholesterol, and blood sugar levels.

**8. Limit alcohol** — Excess drinking raises blood pressure and triglycerides.

**9. Maintain a healthy weight** — Even 5–10% weight loss improves heart markers.

**10. Don't skip check-ups** — Regular screening catches problems early when they're most treatable.

Book a cardiology consultation through Doctorooms to get a personalized heart-health plan.`,
    type: 'Blog',
  },
  {
    title: 'Understanding Diabetes: Types, Symptoms, and Management',
    permalink: 'understanding-diabetes',
    content: `Diabetes affects over 77 million Indians, yet many cases go undiagnosed for years.

## Types of Diabetes

**Type 1** — The body produces little or no insulin. Usually diagnosed in children and young adults.

**Type 2** — The body becomes resistant to insulin. Linked to lifestyle and genetics; the most common form.

**Gestational** — Develops during pregnancy and usually resolves after delivery, but raises later risk.

## Warning Signs

- Excessive thirst and frequent urination
- Unexplained weight loss or gain
- Persistent fatigue
- Blurred vision
- Slow-healing wounds
- Tingling in hands or feet

## Managing Diabetes

Modern diabetes care focuses on five pillars: balanced nutrition, regular exercise, medication adherence, blood-sugar monitoring, and stress management. Continuous glucose monitors (CGMs) have made tracking easier than ever.

If you have a family history or any symptoms above, book a general medicine consultation for a simple fasting blood sugar test.`,
    type: 'Blog',
  },
  {
    title: 'Monsoon Health Guide: Preventing Water-Borne Diseases',
    permalink: 'monsoon-health-guide',
    content: `The monsoon brings relief from heat — and a spike in water-borne illnesses. Here's how to stay safe.

## Common Monsoon Illnesses

**Dengue** — Spread by Aedes mosquitoes breeding in stagnant water. Watch for high fever, severe headache, and joint pain.

**Typhoid** — Contaminated food and water. Look for prolonged fever and abdominal discomfort.

**Hepatitis A & E** — Both spread through contaminated water; cause jaundice and fatigue.

**Leptospirosis** — Spread through water contaminated by animal urine, common during flooding.

## Prevention Checklist

1. Drink only boiled or filtered water
2. Avoid street food and cut fruits from open stalls
3. Empty water containers weekly — don't let mosquitoes breed
4. Use mosquito repellent and full-sleeve clothing in the evenings
5. Wash hands thoroughly before eating
6. Keep feet dry; avoid walking through floodwater with open wounds

If fever persists beyond 2–3 days, don't self-medicate with antibiotics — see a doctor for proper testing.`,
    type: 'Blog',
  },
  {
    title: 'Telemedicine vs In-Person Visits: When to Choose Which',
    permalink: 'telemedicine-vs-in-person',
    content: `Video consultations have transformed healthcare access in India. But when is a physical visit essential?

## Great for Telemedicine

- Follow-ups and medication reviews
- Report discussions and second opinions
- Skin conditions (clear visual symptoms)
- Mental health consultations
- Prescription renewals for chronic conditions
- Lifestyle and dietary counselling

## Better In-Person

- First-time complaints needing physical examination
- Any emergency: chest pain, breathlessness, severe injury
- Vaccinations, blood draws, and procedures
- Pediatric examinations (infants under 2)
- When imaging or lab tests are needed immediately

## The Hybrid Approach

Many Doctorooms doctors offer both — start with video to assess, then visit the clinic only if needed. This saves travel time while keeping care thorough.

Tip: Keep your prescriptions and reports uploaded to your Doctorooms profile so any doctor can review your history instantly.`,
    type: 'Blog',
  },
  {
    title: 'A Parent\'s Guide to Childhood Vaccination Schedules',
    permalink: 'childhood-vaccination-guide',
    content: `Vaccines are among the most effective medical interventions ever developed. Here's a simplified roadmap for Indian parents.

## Birth
BCG (tuberculosis), OPV-0 (polio), Hepatitis B-1

## 6–14 Weeks
DTP series (diphtheria, tetanus, pertussis), Rotavirus, Pentavalent vaccine, PCV (pneumococcal)

## 9–12 Months
MMR-1 (measles, mumps, rubella), Typhoid conjugate vaccine

## 16–24 Months
MMR-2, DTP booster-1, PCV booster

## 4–6 Years
DTP booster-2, varicella (chickenpox)

## 9–14 Years
HPV vaccine (cervical cancer prevention) — now recommended for both girls and boys

## Tips for Parents

- Always carry the vaccination card to every visit
- A mild fever after vaccination is normal; use paracetamol as advised
- Delayed doses don't require restarting the series — just continue
- Keep a digital photo of the vaccination card as backup

Pediatricians on Doctorooms can answer questions about optional vaccines and catch-up schedules.`,
    type: 'Blog',
  },
]

async function main() {
  console.log('📝 Seeding blog posts...')

  const admin = await db.user.findFirst({ where: { role: 'admin' } })
  if (!admin) {
    throw new Error('No admin user found — run seed-test-data.ts first')
  }

  let created = 0
  for (const post of POSTS) {
    const existing = await db.post.findUnique({ where: { permalink: post.permalink } })
    if (existing) {
      console.log(`  ↷ exists: ${post.title}`)
      continue
    }
    await db.post.create({
      data: {
        ...post,
        status: 'Published',
        authorId: admin.id,
      },
    })
    created++
    console.log(`  ✓ ${post.title}`)
  }

  console.log(`Done: ${created} posts created, ${POSTS.length - created} already existed.`)
}

main()
  .catch((e) => {
    console.error('❌ Blog seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
