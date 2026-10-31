import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Heart,
  Truck,
  UtensilsCrossed,
  Users,
  Building2,
  TrendingUp,
  Package,
  Search,
  ShieldCheck,
  Gift,
  Leaf,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Recycle,
  HandHeart,
  MapPin,
  Mail,
  Phone,
  ExternalLink as GithubIcon,
  MessageCircle as TwitterIcon,
  Link2 as LinkedinIcon,
  Globe,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';

/* ───────────────────────────── helpers ───────────────────────────── */

function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [target, duration, startOnView]);

  return { count, ref };
}

function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    const node = ref.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  return { ref, visible };
}

/* ───────────────────────────── NAVBAR ──────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
    { label: 'About', href: '#about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                scrolled ? 'bg-green-600' : 'bg-white/20'
              }`}
            >
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-extrabold tracking-tight transition-colors ${
                scrolled ? 'text-green-600' : 'text-white'
              }`}
            >
              FOOD<span className={scrolled ? 'text-gray-800' : 'text-green-200'}>BRIDGE</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-green-500 ${
                  scrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-600/25"
            >
              Register
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-gray-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-800' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white ${
          open ? 'max-h-80 shadow-lg' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 space-y-3">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-gray-700 font-medium hover:text-green-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <hr className="border-gray-100" />
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="block text-center py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className="block text-center py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ───────────────────────────── HERO ────────────────────────────── */

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-green-600 via-green-600 to-green-700">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-green-800/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-6 pt-24 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-green-100">
              <Sparkles className="w-4 h-4" />
              Community Food Rescue Network
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Rescuing Food,{' '}
              <span className="text-green-200">Feeding Communities</span>
            </h1>

            <p className="text-lg sm:text-xl text-green-100 leading-relaxed max-w-xl">
              Every day, tons of perfectly good food goes to waste while millions
              go hungry. FoodBridge connects surplus food with those who need it
              most.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-xl shadow-black/10 text-base"
              >
                <Gift className="w-5 h-5" />
                Donate Food
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-600/25 text-base"
              >
                <HandHeart className="w-5 h-5" />
                Find Food
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2 text-green-200 text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Safety verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Real-time tracking
              </span>
            </div>
          </div>

          {/* Right illustration */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-[420px] h-[420px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-[spin_40s_linear_infinite]" />
              {/* Inner ring */}
              <div className="absolute inset-12 rounded-full border-2 border-dashed border-white/15 animate-[spin_30s_linear_infinite_reverse]" />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <Utensils className="w-14 h-14 text-white" />
                </div>
              </div>

              {/* Orbiting icons */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Heart className="w-8 h-8 text-red-300" />
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Truck className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 left-2">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Package className="w-8 h-8 text-blue-300" />
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Building2 className="w-8 h-8 text-green-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" className="w-full h-auto" preserveAspectRatio="none">
          <path
            fill="#ffffff"
            d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,100L0,100Z"
          />
        </svg>
      </div>
    </section>
  );
}

/* ───────────────────────── IMPACT STATS ────────────────────────── */

function StatCard({ icon: Icon, target, suffix, label, color }) {
  const { count, ref } = useCountUp(target, 2200);
  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 text-center group"
    >
      <div
        className={`mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform group-hover:scale-110`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-gray-500 mt-1 font-medium text-sm">{label}</p>
    </div>
  );
}

function ImpactStats() {
  const { ref, visible } = useFadeIn();

  const stats = [
    { icon: UtensilsCrossed, target: 25000, suffix: '+', label: 'Meals Rescued', color: 'bg-green-600' },
    { icon: Users, target: 150, suffix: '+', label: 'Active Donors', color: 'bg-blue-600' },
    { icon: Building2, target: 50, suffix: '+', label: 'Partner NGOs', color: 'bg-purple-600' },
    { icon: TrendingUp, target: 95, suffix: '%', label: 'Delivery Success Rate', color: 'bg-orange-500' },
  ];

  return (
    <section id="impact" className="py-20 px-6 bg-white">
      <div
        ref={ref}
        className={`container mx-auto max-w-7xl transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-14">
          <span className="inline-block text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">
            Our Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Making a Real Difference
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Every number represents lives touched, meals saved, and a step
            towards zero food waste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────── HOW IT WORKS ───────────────────────────── */

function HowItWorks() {
  const { ref, visible } = useFadeIn();

  const steps = [
    {
      icon: Package,
      title: 'List Surplus Food',
      desc: 'Donors list their surplus food with details like quantity, type, and expiry window.',
      color: 'bg-green-600',
    },
    {
      icon: Search,
      title: 'Smart Matching',
      desc: 'Our algorithm matches food with nearby organizations based on need, distance, and capacity.',
      color: 'bg-blue-600',
    },
    {
      icon: ShieldCheck,
      title: 'Pickup & Verify',
      desc: 'Volunteers pick up the food and verify safety standards before distribution.',
      color: 'bg-purple-600',
    },
    {
      icon: Heart,
      title: 'Feed Communities',
      desc: 'Food reaches those who need it — shelters, community kitchens, and families.',
      color: 'bg-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 bg-gray-50">
      <div
        ref={ref}
        className={`container mx-auto max-w-7xl transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-16">
          <span className="inline-block text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            From Surplus to Sustenance
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            A simple 4-step process that turns food waste into community
            nourishment.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-300 via-blue-300 via-purple-300 to-orange-300" />

          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center group">
              {/* Step number badge */}
              <div className="relative inline-block mb-5">
                <div
                  className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 z-20">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>

              {/* Mobile arrow */}
              {i < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ChevronRight className="w-5 h-5 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── THREE USER GROUPS ─────────────────────────── */

function UserGroups() {
  const { ref, visible } = useFadeIn();

  const groups = [
    {
      icon: Gift,
      title: 'Donors',
      subtitle: 'Restaurants · Hotels · Events · Households',
      desc: 'Have surplus food? List it on FoodBridge and ensure it reaches someone who needs it instead of the landfill. Track your impact in real time.',
      cta: 'Start Donating',
      theme: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'bg-green-600',
        btn: 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/25',
        badge: 'text-green-700 bg-green-100',
      },
    },
    {
      icon: Building2,
      title: 'Distributors',
      subtitle: 'NGOs · Community Orgs · Food Banks',
      desc: 'Need food for your community? Browse available donations nearby, schedule pickups, and manage distribution — all from one dashboard.',
      cta: 'Join as Distributor',
      theme: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-600',
        btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25',
        badge: 'text-blue-700 bg-blue-100',
      },
    },
    {
      icon: Leaf,
      title: 'Biofarms',
      subtitle: 'Composting · Biogas · Recovery',
      desc: 'Food not suitable for consumption? Biofarms process waste into compost, biogas, and other valuable resources — closing the loop sustainably.',
      cta: 'Partner With Us',
      theme: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'bg-amber-600',
        btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25',
        badge: 'text-amber-700 bg-amber-100',
      },
    },
  ];

  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div
        ref={ref}
        className={`container mx-auto max-w-7xl transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-14">
          <span className="inline-block text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">
            Who It's For
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Everyone Has a Role to Play
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Whether you have food to give, people to feed, or waste to recover —
            FoodBridge connects you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {groups.map((g) => (
            <div
              key={g.title}
              className={`rounded-2xl p-8 border ${g.theme.border} ${g.theme.bg} hover:shadow-lg transition-all group`}
            >
              <div
                className={`w-14 h-14 rounded-xl ${g.theme.icon} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <g.icon className="w-7 h-7 text-white" />
              </div>

              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${g.theme.badge}`}
              >
                {g.subtitle}
              </span>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{g.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{g.desc}</p>

              <Link
                to="/register"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg ${g.theme.btn}`}
              >
                {g.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── FOOD RESCUE vs WASTE RECOVERY ──────────────────────── */

function RescueVsRecovery() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div
        ref={ref}
        className={`container mx-auto max-w-7xl transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-14">
          <span className="inline-block text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">
            Two Pathways, Zero Waste
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Food Rescue vs Waste Recovery
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Not all surplus is the same. FoodBridge intelligently routes food
            through the right channel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Food Rescue */}
          <div className="bg-white rounded-2xl border border-green-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <HandHeart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Food Rescue</h3>
              </div>
              <p className="text-green-100 text-sm">For human consumption</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Surplus food that is still safe, fresh, and suitable for human
                consumption is rescued and distributed directly to people in
                need through our partner network.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Fresh meals from restaurants & hotels',
                  'Packaged food nearing best-before date',
                  'Event catering surplus',
                  'Household excess groceries',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2 text-green-700 font-semibold text-sm">
                <ArrowRight className="w-4 h-4" />
                Distributed to shelters, kitchens & families
              </div>
            </div>
          </div>

          {/* Waste Recovery */}
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Recycle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold">Waste Recovery</h3>
              </div>
              <p className="text-amber-100 text-sm">For composting & biogas</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Food material that is no longer suitable for consumption is
                routed to biofarms for composting, biogas generation, and
                resource recovery — keeping it out of landfills.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Expired or spoiled food items',
                  'Food preparation waste & peels',
                  'Agricultural byproducts',
                  'Non-edible organic material',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2 text-amber-700 font-semibold text-sm">
                <ArrowRight className="w-4 h-4" />
                Sent to biofarms for composting & biogas
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FOOTER ──────────────────────────────── */

function Footer() {
  const quickLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
    { label: 'About', href: '#about' },
  ];

  const platformLinks = [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                FOOD<span className="text-green-400">BRIDGE</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Connecting surplus food to people who need it. Building a world
              with zero food waste.
            </p>
            <div className="flex gap-3">
              {[GithubIcon, TwitterIcon, LinkedinIcon, Globe].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm hover:text-green-400 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm hover:text-green-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-green-500" />
                hello@foodbridge.org
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-green-500" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-500" />
                India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FoodBridge. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-gray-500">
              Built for{' '}
              <span className="text-orange-400 font-semibold">HACKNOVA 2026</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────── LANDING PAGE (MAIN) ─────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />
      <Hero />
      <ImpactStats />
      <HowItWorks />
      <UserGroups />
      <RescueVsRecovery />
      <Footer />
    </div>
  );
}
