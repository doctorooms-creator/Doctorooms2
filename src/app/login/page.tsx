'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import {
  Stethoscope,
  Shield,
  Heart,
  Building2,
  HeadphonesIcon,
  UserCheck,
  Pill,
  HeartPulse,
  FlaskConical,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
} from 'lucide-react';

interface RoleCard {
  role: string;
  label: string;
  personName: string;
  subText: string;
  icon: typeof Stethoscope;
  color: string;
  borderHover: string;
  textColor: string;
}

const CLINIC_ROLES: RoleCard[] = [
  {
    role: 'doctor',
    label: 'Doctor',
    personName: 'Dr. Rajesh Sharma',
    subText: 'General Physician',
    icon: Stethoscope,
    color: 'from-teal-500 to-cyan-500',
    borderHover: 'hover:border-teal-400',
    textColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    role: 'receptionist',
    label: 'Receptionist',
    personName: 'Meera Joshi',
    subText: 'Front desk & walk-in',
    icon: HeadphonesIcon,
    color: 'from-pink-500 to-rose-500',
    borderHover: 'hover:border-pink-400',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    role: 'assistant',
    label: 'Assistant',
    personName: 'Vikram Patel',
    subText: 'Helps Dr. Sharma',
    icon: UserCheck,
    color: 'from-violet-500 to-purple-500',
    borderHover: 'hover:border-violet-400',
    textColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    role: 'pharmacist',
    label: 'Pharmacist',
    personName: 'Kavitha Devi',
    subText: 'Clinic pharmacy',
    icon: Pill,
    color: 'from-orange-500 to-red-500',
    borderHover: 'hover:border-orange-400',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
];

const HOSPITAL_ROLES: RoleCard[] = [
  {
    role: 'hospital',
    label: 'Hospital Admin',
    personName: 'City General Hospital',
    subText: 'Full hospital control',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
    borderHover: 'hover:border-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    role: 'doctor',
    label: 'Doctor (Gen Med)',
    personName: 'Dr. Anita Desai',
    subText: 'General Medicine — OPD + IPD',
    icon: Stethoscope,
    color: 'from-teal-500 to-emerald-500',
    borderHover: 'hover:border-teal-400',
    textColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    role: 'doctor',
    label: 'Doctor (Cardiology)',
    personName: 'Dr. Suresh Iyer',
    subText: 'Cardiology — IPD + OT',
    icon: HeartPulse,
    color: 'from-red-500 to-rose-500',
    borderHover: 'hover:border-red-400',
    textColor: 'text-red-600 dark:text-red-400',
  },
  {
    role: 'nurse',
    label: 'Nurse',
    personName: 'Priya Sharma',
    subText: 'ICU & General Ward',
    icon: HeartPulse,
    color: 'from-cyan-500 to-teal-500',
    borderHover: 'hover:border-cyan-400',
    textColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    role: 'lab_technician',
    label: 'Lab Technician',
    personName: 'Amit Kumar',
    subText: 'Pathology lab',
    icon: FlaskConical,
    color: 'from-lime-500 to-green-500',
    borderHover: 'hover:border-lime-400',
    textColor: 'text-lime-600 dark:text-lime-400',
  },
  {
    role: 'receptionist',
    label: 'Receptionist (Hospital)',
    personName: 'Sunita Rao',
    subText: 'City General front desk',
    icon: HeadphonesIcon,
    color: 'from-pink-500 to-rose-500',
    borderHover: 'hover:border-pink-400',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
];

const SHARED_ROLES: RoleCard[] = [
  {
    role: 'patient',
    label: 'Patient',
    personName: 'Rahul Verma',
    subText: 'Clinic + Hospital visits',
    icon: Heart,
    color: 'from-emerald-500 to-teal-500',
    borderHover: 'hover:border-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    role: 'admin',
    label: 'Admin',
    personName: 'Admin User',
    subText: 'Full platform control',
    icon: Shield,
    color: 'from-red-500 to-rose-600',
    borderHover: 'hover:border-red-400',
    textColor: 'text-red-600 dark:text-red-400',
  },
];

// Map hospital doctor cards to their specific dev-login user IDs
const HOSPITAL_DOCTOR_OVERRIDES: Record<string, string> = {
  'Dr. Anita Desai': 'dev-doctor-anita',
  'Dr. Suresh Iyer': 'dev-doctor-suresh',
};

// Map named staff cards to their specific dev-login user IDs
const USER_ID_OVERRIDES: Record<string, string> = {
  ...HOSPITAL_DOCTOR_OVERRIDES,
  'Sunita Rao': 'dev-receptionist-hospital',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleClick = async (role: string, personName?: string) => {
    // For hospital doctors, use specific user ID
    let loginRole = role;
    let loginUserId: string | undefined;

    if (personName && USER_ID_OVERRIDES[personName]) {
      loginUserId = USER_ID_OVERRIDES[personName];
    }

    setLoading(personName || role);
    try {
      const res = await fetch('/api/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginUserId ? { role, userId: loginUserId } : { role }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || `Login failed (${res.status})`, {
          description: 'Please try again or contact support',
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        });
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        sessionStorage.setItem('doctorooms_dev_user', JSON.stringify(data.user));
        // Honor ?redirect= (e.g. from "Book Appointment" on a public doctor
        // profile) so the user returns to where they were headed instead of
        // always landing on the role dashboard.
        const redirectTo = searchParams.get('redirect');
        if (redirectTo && redirectTo.startsWith('/')) {
          router.push(redirectTo);
        } else {
          const routeSlug = role === 'lab_technician' ? 'lab-technician' : role;
          router.push(`/dashboard/${routeSlug}`);
        }
      }
    } catch (err) {
      toast.error('Network error', {
        description: 'Could not connect to server. Please check your connection.',
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      });
    } finally {
      setLoading(null);
    }
  };

  const RoleCardButton = ({ item, index }: { item: RoleCard; index: number }) => {
    const Icon = item.icon;
    const loadingKey = item.personName || item.role;
    const isLoading = loading === loadingKey;

    return (
      <motion.button
        key={loadingKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05, duration: 0.3, ease: 'easeOut' }}
        onClick={() => handleRoleClick(item.role, item.personName)}
        className={`group relative flex items-center gap-3 p-4 rounded-xl border-2 border-transparent ${item.borderHover} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer text-left w-full`}
      >
        {/* Icon */}
        <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold ${item.textColor} transition-colors`}>
            {item.personName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {item.subText}
          </p>
        </div>

        {/* Arrow / Loading */}
        <div className="shrink-0">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </motion.button>
    );
  };

  const SectionHeader = ({ title, subtitle, icon: Icon, color }: { title: string; subtitle: string; icon: typeof Stethoscope; color: string }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950/20" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-teal-500/30">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Doctorooms
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Select a role to enter the dashboard
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
            Dev Mode — Click any role to login
          </span>
        </motion.div>

        {/* Two-column layout: Clinic | Hospital */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* LEFT: Clinic Module */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl border-2 border-teal-200 dark:border-teal-800/50 bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm p-5"
          >
            <SectionHeader
              title="Clinic Module"
              subtitle="Dr. Sharma's Clinic — OPD flow testing"
              icon={Stethoscope}
              color="from-teal-500 to-cyan-500"
            />
            <div className="space-y-2">
              {CLINIC_ROLES.map((item, i) => (
                <RoleCardButton key={item.personName} item={item} index={i} />
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Hospital Module */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-2xl border-2 border-amber-200 dark:border-amber-800/50 bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm p-5"
          >
            <SectionHeader
              title="Hospital Module"
              subtitle="City General Hospital — IPD + OPD testing"
              icon={Building2}
              color="from-amber-500 to-orange-500"
            />
            <div className="space-y-2">
              {HOSPITAL_ROLES.map((item, i) => (
                <RoleCardButton key={item.personName} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* BOTTOM: Shared Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="max-w-5xl mx-auto mt-6"
        >
          <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-800/50 bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm p-5">
            <SectionHeader
              title="Shared Roles"
              subtitle="Patient visits both clinic & hospital · Admin manages everything"
              icon={User}
              color="from-violet-500 to-purple-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHARED_ROLES.map((item, i) => (
                <RoleCardButton key={item.personName} item={item} index={i} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6"
        >
          Dev Mode — Authentication disabled. Click any role card to enter its dashboard.
        </motion.p>
      </div>
    </div>
  );
}
