import OrderDetailClient from './client'

export const metadata = {
  title: 'Order Detail',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetailClient id={id} />
}
