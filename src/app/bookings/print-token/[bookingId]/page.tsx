'use client'
import { use, useEffect, useState } from 'react'
import { Loader2, Printer } from 'lucide-react'

export default function TokenPrintPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch(`/api/public/booking/${bookingId}/token`).then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [bookingId])
  useEffect(() => { if (data && !loading) { const t = setTimeout(() => window.print(), 500); return () => clearTimeout(t) } }, [data, loading])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
  if (!data?.token) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Token not found</div>
  const t = data.token

  return (
    <div className="token-slip">
      <style jsx>{`
        @media print { body { margin: 0 } .no-print { display: none !important } .token-slip { width: 58mm; padding: 4mm 3mm; font-family: 'Courier New', monospace } }
        @media screen { .token-slip { max-width: 400px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-family: 'Courier New', monospace } }
      `}</style>
      {t.hospital && <div className="text-center mb-3 pb-2 border-b-2 border-dashed border-gray-300"><h1 className="text-base font-bold uppercase">{t.hospital.name}</h1>{t.hospital.address && <p className="text-[10px] text-gray-600">{t.hospital.address}</p>}{t.hospital.contactNo && <p className="text-[10px] text-gray-600">📞 {t.hospital.contactNo}</p>}</div>}
      <div className="text-center my-4"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Token Number</p><p className="font-bold tracking-wider my-1" style={{ fontSize: '2.5rem' }}>{t.tokenNumber}</p></div>
      <div className="border-t border-dashed border-gray-300 my-3"></div>
      <div className="space-y-1 text-xs"><div className="flex justify-between"><span className="text-gray-500">Patient:</span><span className="font-bold">{t.patientName}</span></div>{t.age && <div className="flex justify-between"><span className="text-gray-500">Age/Gender:</span><span>{t.age}y / {t.gender}</span></div>}</div>
      <div className="border-t border-dashed border-gray-300 my-3"></div>
      <div className="space-y-1 text-xs">{t.doctor && <div className="flex justify-between"><span className="text-gray-500">Doctor:</span><span className="font-bold text-right">{t.doctor.name}</span></div>}{t.department && <><div className="flex justify-between"><span className="text-gray-500">Dept:</span><span>{t.department.name}</span></div>{t.department.opdRoom && <div className="flex justify-between"><span className="text-gray-500">Room:</span><span className="font-bold">{t.department.opdRoom}</span></div>}{t.department.floorNo && <div className="flex justify-between"><span className="text-gray-500">Floor:</span><span>{t.department.floorNo}</span></div>}</>}</div>
      <div className="border-t border-dashed border-gray-300 my-3"></div>
      <div className="text-center my-3"><p className="text-[10px] text-gray-500 uppercase tracking-wider">Your Position</p><p className="text-3xl font-bold text-teal-600">#{t.queuePosition}</p></div>
      <div className="text-center text-[10px] text-gray-500 mt-2">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      <div className="border-t-2 border-dashed border-gray-300 mt-3 pt-2 text-center"><p className="text-[9px] text-gray-500">इस स्लिप को सुरक्षित रखें / Keep this slip</p></div>
      <div className="no-print mt-6 text-center"><button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"><Printer className="h-4 w-4" /> Print Token</button></div>
    </div>
  )
}
