import { redirect } from 'next/navigation'

/**
 * /dashboard/doctor/prescription-settings has no index of its own — the
 * settings area is a tabbed sub-route family (categories, complaints,
 * findings, …). Direct visits previously 404'd; land them on the first tab.
 */
export default function PrescriptionSettingsIndexPage() {
  redirect('/dashboard/doctor/prescription-settings/categories')
}
