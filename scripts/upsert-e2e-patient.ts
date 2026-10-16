import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

async function main() {
  const password = await hash('123456', 10)
  const email = 'qa-recall-aiims4@test.dev'
  const u = await db.user.update({ where: { email }, data: { password } })
  console.log('Updated password for:', u.email, u.name)
  // Give this patient a diet plan so diet nudges + weekly report work on prod
  const existingPlan = await db.sevikaDietPlan.findFirst({ where: { userId: u.id } })
  if (!existingPlan) {
    await db.sevikaDietPlan.create({
      data: {
        userId: u.id,
        medicinesSummary: 'Multivitamin 1-0-1',
        planJson: JSON.stringify({
          note: 'Halka aur ghar ka khana. Tel aur maida kam karein.',
          days: [
            { breakfast: 'Oats + doodh, 1 kela', lunch: 'Dal, sabzi, 2 roti, chawal thoda', snack: 'Chai + makhana', dinner: 'Khichdi ya dal-chawal, sabzi' },
            { breakfast: 'Poha + doodh', lunch: 'Rajma, chawal, salad', snack: 'Anar ka juice', dinner: 'Sabzi + 2 roti' },
            { breakfast: 'Idli + sambar', lunch: 'Chole, chawal thoda, salad', snack: 'Chai + bhelpuri ghar ka', dinner: 'Dal, sabzi, dahi' },
            { breakfast: 'Upma + doodh', lunch: 'Kadhi, chawal, sabzi', snack: 'Papaya', dinner: 'Vegetable pulao, raita' },
            { breakfast: 'Besan chilla + chutney', lunch: 'Dal palak, chawal, salad', snack: 'Chai + roasted chana', dinner: 'Paneer bhurji, 2 roti' },
            { breakfast: 'Paratha (kam tel) + doodh', lunch: 'Sambar, chawal, sabzi', snack: 'Nariyal pani', dinner: 'Dal khichdi, dahi' },
            { breakfast: 'Dosa + sambar', lunch: 'Veg biryani (kam tel), raita', snack: 'Chai + makhana', dinner: 'Sabzi + dahi + 2 roti' },
          ],
        }),
      },
    })
    console.log('Diet plan created')
  } else {
    console.log('Diet plan exists')
  }
  await db.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
