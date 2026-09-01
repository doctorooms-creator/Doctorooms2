'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { PublicLayout } from '@/components/layout/public-layout'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'support@doctorooms.com',
    subtitle: 'We reply within 24 hours',
    color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+91 98765 43210',
    subtitle: 'Mon-Sat, 9 AM - 8 PM',
    color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: '123 Healthcare Avenue, Sector 15',
    subtitle: 'Gurugram, Haryana 122001, India',
    color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  },
]

const DEPARTMENTS = [
  { value: 'appointments', label: 'Appointments & Booking' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'partnership', label: 'Hospital / Doctor Partnership' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
  { value: 'other', label: 'Other' },
]

const faqs = [
  {
    q: 'How do I book an appointment with a doctor?',
    a: 'Visit our Find Doctors page, search by specialization or city, pick a doctor, and choose an available time slot. You will receive a confirmation immediately, and the doctor will see your booking in their dashboard.',
  },
  {
    q: 'Can I cancel or reschedule my appointment?',
    a: 'Yes. Log in to your patient dashboard, go to Appointments, and click Reschedule or Cancel on any upcoming booking. Cancellations are free up to 2 hours before the slot.',
  },
  {
    q: 'Is my medical information private and secure?',
    a: 'Absolutely. All consultations, prescriptions, and lab results are stored securely and only visible to you and your treating doctor. We never share your data with third parties without explicit consent.',
  },
  {
    q: 'How do I get my prescription after a consultation?',
    a: 'Once your doctor finalizes the prescription, it appears instantly in your patient dashboard under Prescriptions. You can view, download, or print it, and share it with any pharmacy of your choice.',
  },
  {
    q: 'Can I consult a doctor online (video / chat)?',
    a: 'Yes. Doctors who offer online consultations are marked on their profile. Book an online slot and you will get a private chat room + video call link in your dashboard at the appointment time.',
  },
  {
    q: 'I am a doctor / hospital — how do I join Doctorooms?',
    a: 'We would love to have you. Use the form on this page and select Hospital / Doctor Partnership as the department. Our partnerships team will reach out within 1-2 business days with onboarding details.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, department: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message || !formData.department) {
      toast.error('Please fill in name, email, department, and message')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      toast.success('Your message has been sent successfully!')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', department: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div {...fadeIn} className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
            <p className="text-teal-100 text-lg">
              Have a question or need help? We&apos;d love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <motion.div {...fadeIn} className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="h-16 w-16 rounded-full bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-teal-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Send us a Message</h2>
                        <p className="text-sm text-muted-foreground">Fill in the form below and we'll respond promptly</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Name <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="department">
                            Department <span className="text-rose-500">*</span>
                          </Label>
                          <Select value={formData.department} onValueChange={handleDepartmentChange}>
                            <SelectTrigger id="department" className="h-11">
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                  {d.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">
                          Message <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white h-11 px-8"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {contactInfo.map((info) => (
                <motion.div key={info.title} variants={fadeIn}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`h-11 w-11 rounded-lg ${info.color} flex items-center justify-center shrink-0`}>
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-0.5">{info.title}</h4>
                        <p className="text-sm font-medium">{info.details}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{info.subtitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Office Hours */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-teal-500" />
                    <h4 className="font-semibold text-sm">Office Hours</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">9:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium text-rose-500">Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Real Map — OpenStreetMap embed (no API key needed) */}
            <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
              <Card className="overflow-hidden">
                <div className="relative h-56 bg-muted">
                  <iframe
                    title="Doctorooms office location"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=77.0166%2C28.4495%2C77.0366%2C28.4695&layer=mapnik&marker=28.4595%2C77.0266"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      123 Healthcare Avenue, Sector 15, Gurugram, Haryana 122001
                    </span>
                  </div>
                  <a
                    href="https://www.openstreetmap.org/?mlat=28.4595&mlon=77.0266#map=15/28.4595/77.0266"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 whitespace-nowrap"
                  >
                    Open in Maps →
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/40 border-y border-border/60">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/30 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Quick answers to common questions
            </h2>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Use the form above and our team will get back to you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="rounded-lg border border-border/60 bg-background px-5 shadow-sm data-[state=open]:border-teal-300 data-[state=open]:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-teal-700 dark:hover:text-teal-300 py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
