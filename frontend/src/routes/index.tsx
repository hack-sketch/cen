import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Pause } from "lucide-react";
import { useAuth } from "@/lib/auth";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEN — Trade skills & resources with your community" },
      {
        name: "description",
        content:
          "A credit-based platform for communities to exchange skills, resources, and help each other.",
      },
    ],
  }),
  component: Landing,
});

const AI_FEATURES = [
  {
    title: "AI Profile Generator",
    description: "Analyzes your background to instantly draft skill listings, complete with smart tags and credit rates.",
    code: "AI Engine v2.0 · Profile"
  },
  {
    title: "OCR Identity Verification",
    description: "Cross-checks resident ID card details against municipal database records for secure, instant onboarding.",
    code: "AI Engine v2.0 · Onboard"
  },
  {
    title: "AI Auto-Match Barter",
    description: "Interprets notice boards to intelligently bridge barter trades between neighbors with complementary needs.",
    code: "AI Engine v2.0 · Match"
  }
];

const POPULAR_SKILLS = [
  {
    id: 1,
    title: "Python Tutoring",
    type: "SKILL",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=400&q=80",
    rating: "4.9",
    description: "Learn basic automation and data analysis in personalized 1-on-1 sessions.",
    owner: "Aman S.",
    avatarBg: "from-deep-forest to-soft-violet",
    rate: "25 Crd/hr",
    needs: "Looking for: Backyard gardening tools & soil setups"
  },
  {
    id: 2,
    title: "Power Drill Kit",
    type: "RESOURCE",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=400&q=80",
    rating: "5.0",
    description: "Heavy-duty hammer drill for weekend home improvement projects. Multiple bits included.",
    owner: "Rohit K.",
    avatarBg: "from-amber-200 to-soft-violet",
    rate: "10 Crd/day",
    needs: "Looking for: High-school math exam prep help"
  },
  {
    id: 3,
    title: "Guitar Lessons",
    type: "SKILL",
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&h=400&q=80",
    rating: "4.8",
    description: "Acoustic guitar for absolute beginners. Focus on basic chords and rhythm.",
    owner: "Jignesh P.",
    avatarBg: "from-soft-violet to-deep-forest",
    rate: "30 Crd/hr",
    needs: "Looking for: Plumber for kitchen sink pipe alignment"
  }
];

interface AnimatedCountProps {
  target: number;
  duration?: number;
  suffix?: string;
}

function AnimatedCount({ target, duration = 2000, suffix = "" }: AnimatedCountProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutProgress * target));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [hasStarted, target, duration]);

  const formatCountValue = (val: number): string => {
    if (val < 1000) {
      return val.toString();
    } else if (val <= 10000) {
      const kVal = val / 1000;
      const formatted = kVal.toFixed(1);
      return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}k` : `${formatted}k`;
    } else {
      const kVal = Math.floor(val / 1000);
      return `${kVal}k`;
    }
  };

  return (
    <span ref={elementRef}>
      {formatCountValue(count)}
      {suffix}
    </span>
  );
}

function Landing() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroApi, setHeroApi] = useState<CarouselApi>();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [aiIndex, setAiIndex] = useState(0);
  const [simStep, setSimStep] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setSimStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoplay]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAiIndex((prev) => (prev + 1) % AI_FEATURES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY;
      if (winScroll > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Parallax bg blob shifts
      const blob1 = document.getElementById("bg-blob-1");
      const blob2 = document.getElementById("bg-blob-2");
      const blob3 = document.getElementById("bg-blob-3");
      if (blob1) blob1.style.transform = `translateY(${winScroll * 0.08}px)`;
      if (blob2) blob2.style.transform = `translateY(${winScroll * -0.06}px)`;
      if (blob3) blob3.style.transform = `translateY(${winScroll * 0.05}px)`;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync the hero carousel active index
  useEffect(() => {
    if (!heroApi) return;
    
    setCurrentHeroSlide(heroApi.selectedScrollSnap());
    heroApi.on("select", () => {
      setCurrentHeroSlide(heroApi.selectedScrollSnap());
    });
  }, [heroApi]);

  // Autoplay effect for the hero carousel
  useEffect(() => {
    if (!heroApi) return;
    
    const interval = setInterval(() => {
      heroApi.scrollNext();
    }, 4500); // Transitions slide every 4.5 seconds
    
    return () => clearInterval(interval);
  }, [heroApi]);

  // Programmatic smooth scroll helper for section links
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string, delay: boolean = false) => {
    e.preventDefault();
    if (delay) {
      // Close mobile menu first and wait for slide-out animation to complete
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // Matches duration-300 of the sidebar transition
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-root-bg text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out border-b border-line/50 ${
          isScrolled
            ? "h-[60px] bg-white/95 shadow-md backdrop-blur-md"
            : "h-[72px] bg-panel/90 backdrop-blur-md"
        }`}
        id="navbar"
      >
        <div className="container mx-auto px-margin-page h-full flex justify-between items-center max-w-7xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div className="font-headline-md text-lg font-extrabold text-primary tracking-tighter">
              CEN
            </div>
          </Link>

          {/* Desktop Nav Links (Landing Page Anchor Navigation) */}
          <div className="hidden md:flex gap-8 items-center h-full">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors py-2 font-medium"
            >
              How it Works
            </a>
            <a
              href="#features-showcase"
              onClick={(e) => scrollToSection(e, "features-showcase")}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors py-2 font-medium"
            >
              Features
            </a>
            <a
              href="#skills"
              onClick={(e) => scrollToSection(e, "skills")}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors py-2 font-medium"
            >
              Skills
            </a>
            <a
              href="#impact"
              onClick={(e) => scrollToSection(e, "impact")}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors py-2 font-medium"
            >
              Impact
            </a>
          </div>

          {/* Desktop Action Buttons (Professional, Compact Size) */}
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <>
                <Link to="/app/dashboard">
                  <button className="text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 font-medium cursor-pointer">
                    Console Dashboard
                  </button>
                </Link>
                <button 
                  onClick={logout} 
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 h-[34px] rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 font-medium cursor-pointer">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold px-4 h-[34px] rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-on-surface hover:text-primary focus:outline-none cursor-pointer transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay (Sleek CSS Slide-In Transition) */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header of Mobile Menu */}
          <div className="flex justify-between items-center pb-6 border-b border-line/40 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <div className="font-headline-md text-primary font-extrabold text-lg">
                CEN
              </div>
            </div>
            <button
              className="p-1.5 hover:bg-panel text-on-surface-variant hover:text-primary rounded-full cursor-pointer transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px] block">close</span>
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2 mb-auto">
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface transition-all text-sm font-medium"
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works", true)}
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                info
              </span>{" "}
              How it Works
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface transition-all text-sm font-medium"
              href="#features-showcase"
              onClick={(e) => scrollToSection(e, "features-showcase", true)}
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                featured_play_list
              </span>{" "}
              Features
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface transition-all text-sm font-medium"
              href="#skills"
              onClick={(e) => scrollToSection(e, "skills", true)}
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                local_library
              </span>{" "}
              Skills
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface transition-all text-sm font-medium"
              href="#impact"
              onClick={(e) => scrollToSection(e, "impact", true)}
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                analytics
              </span>{" "}
              Impact
            </a>
          </div>

          {/* Action Buttons at the Bottom */}
          {user ? (
            <div className="flex flex-col gap-3 mt-8 border-t border-line/40 pt-6">
              <Link to="/app/dashboard" className="w-full">
                <button
                  className="w-full border border-line text-on-surface-variant hover:text-primary hover:bg-panel text-xs font-semibold py-2.5 rounded-lg cursor-pointer transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Console Dashboard
                </button>
              </Link>
              <button
                className="w-full bg-rose-600 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-rose-700 transition-all"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-8 border-t border-line/40 pt-6">
              <Link to="/login" className="w-full">
                <button
                  className="w-full border border-line text-on-surface-variant hover:text-primary hover:bg-panel text-xs font-semibold py-2.5 rounded-lg cursor-pointer transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </button>
              </Link>
              <Link to="/signup" className="w-full">
                <button
                  className="w-full bg-primary text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-primary/95 transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative min-h-[85vh] flex items-center pt-[72px] overflow-hidden hero-gradient">
        {/* Subtle dot pattern layer */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(#c9cdc7 1.2px, transparent 1.2px)",
            backgroundSize: "20px 20px"
          }}
        />

        <div className="container mx-auto px-margin-page relative z-10 max-w-7xl py-10 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-1 lg:order-1">
              <ScrollReveal delay={100} duration={600}>
                <span className="inline-flex items-center gap-2 py-1 px-3.5 bg-deep-forest/10 text-deep-forest font-metadata text-[10px] rounded-full mb-6 tracking-wider uppercase font-bold border border-deep-forest/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-deep-forest animate-pulse"></span>
                  Beta Phase Now Live
                </span>
                
                {/* Heading with Gradient Accent */}
                <h1 className="font-headline-lg text-3xl sm:text-5xl lg:text-6xl text-ink mb-6 leading-[1.15] font-bold tracking-tight">
                  Exchange Skills,
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-deep-forest to-soft-violet italic font-semibold">
                    Build Community.
                  </span>
                </h1>
                
                <p className="font-body-lg text-base text-on-surface-variant mb-8 max-w-lg leading-relaxed">
                  A credit-based network where your time and resources empower
                  your neighbors. Trade what you know for what you need with
                  AI-driven matching.
                </p>
                
                {/* Sleek, Professional Onboarding Banner Options */}
                <div className="flex flex-wrap gap-4">
                  <Link to="/join-society">
                    <button className="bg-deep-forest text-white text-sm font-semibold px-6 h-[40px] rounded-lg shadow-sm hover:translate-y-[-1px] hover:shadow-md transition-all active:scale-95 cursor-pointer">
                      Join a Society
                    </button>
                  </Link>
                  <Link to="/request-society">
                    <button className="border border-line-strong text-ink hover:bg-surface-variant text-sm font-semibold px-6 h-[40px] rounded-lg hover:translate-y-[-1px] transition-all cursor-pointer">
                      Request a Society
                    </button>
                  </Link>
                </div>

                {/* Social Proof / Trust Badge Row */}
                <div className="mt-10 flex items-center gap-3.5 border-t border-line/40 pt-6">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-container-low shadow-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" 
                        alt="Neighbor" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-container-low shadow-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80" 
                        alt="Neighbor" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-surface-container-low shadow-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" 
                        alt="Neighbor" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center bg-accent-bg border-emerald-100 text-[10px] font-bold text-deep-forest">
                      +500
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-ink">500+ Neighbors Exchanging Daily</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                      Active credit trading is currently live
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column - Premium Product Mockup (Interactive Browser Slideshow Carousel) */}
            <div className="order-2 lg:order-2 relative flex justify-center items-center py-4 lg:py-0 w-full overflow-hidden sm:overflow-visible">
              <div className="absolute -inset-4 bg-gradient-to-tr from-deep-forest/5 via-soft-violet/5 to-transparent blur-3xl -z-10 rounded-full"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#e2efe9]/40 to-[#ece9f5]/40 blur-[80px] opacity-60 -z-10"></div>
              
              <ScrollReveal delay={300} duration={800} direction="none" className="w-full max-w-[480px] relative px-4 sm:px-0">
                {/* Floating Decorator Pills (Hidden under 640px) */}
                <div className="hidden sm:flex bg-white/95 backdrop-blur-md border border-line/60 rounded-full px-3 py-1.5 items-center gap-2 shadow-lg absolute -top-5 -left-8 z-20 animate-float-delayed">
                  <span className="material-symbols-outlined text-deep-forest text-[16px] flex-shrink-0">local_florist</span>
                  <span className="text-[10px] font-bold text-ink whitespace-nowrap">Gardening +15 Crd</span>
                </div>

                <div className="hidden sm:flex bg-white/95 backdrop-blur-md border border-line/60 rounded-full px-3 py-1.5 items-center gap-2 shadow-lg absolute -bottom-4 -right-6 z-20 animate-float">
                  <span className="material-symbols-outlined text-soft-violet text-[16px] flex-shrink-0">school</span>
                  <span className="text-[10px] font-bold text-ink whitespace-nowrap">Math Help Requested</span>
                </div>

                {/* Main Dashboard Frame (Static Browser Wrapper - Gentle hover float & rich shadow) */}
                <div className="bg-white rounded-2xl border border-line/60 shadow-2xl overflow-hidden flex flex-col relative w-full animate-float">
                  {/* Top Bar Window Controls */}
                  <div className="flex justify-between items-center px-5 py-3 border-b border-line/45 bg-panel">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
                    </div>
                    <div className="bg-white px-3 py-0.5 rounded-md text-[10px] text-on-surface-variant font-code-sm border border-line/30 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      cen.network/dashboard
                    </div>
                    <div className="w-6"></div>
                  </div>

                  {/* Carousel Content (Sliding panel views) */}
                  <div className="p-3.5 sm:p-5 bg-white">
                    <Carousel
                      setApi={setHeroApi}
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {/* Slide 1: Resident view */}
                        <CarouselItem className="flex flex-col gap-3.5">
                          <div className="flex items-center gap-2 bg-panel px-3 py-1.5 rounded-lg border border-line/30">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant flex-shrink-0">search</span>
                            <span className="text-[11px] text-on-surface-variant/60 truncate">Search active listings in your society...</span>
                          </div>

                          {/* Wallet Stats */}
                          <div className="bg-panel border border-line/30 rounded-xl p-3 sm:p-3.5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow animate-float-delayed">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-deep-forest/10 flex items-center justify-center text-deep-forest flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider truncate">Wallet Balance</div>
                                <div className="text-base font-bold text-ink flex items-baseline gap-1 truncate">
                                  150 <span className="text-[10px] text-on-surface-variant font-normal">Credits</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                              <span className="material-symbols-outlined text-[12px] flex-shrink-0">trending_up</span>
                              +25 Today
                            </div>
                          </div>

                          {/* AI Recommended Match */}
                          <div className="border border-dashed border-soft-violet/50 bg-ai-bg/30 rounded-xl p-3 sm:p-4 flex flex-col gap-2 relative">
                            <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-soft-violet/10 text-soft-violet text-[8px] font-bold px-2 py-0.5 rounded-full border border-soft-violet/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-soft-violet animate-pulse"></span>
                              AI MATCH
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-soft-violet/15 flex items-center justify-center text-soft-violet flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px] animate-pulse">smart_toy</span>
                              </div>
                              <div className="text-[11px] font-bold text-ink truncate">Auto-Match Opportunity</div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-normal pr-12">
                              Aman S. (Python Tutor) requested Gardening. Match found with Rohit K. (Gardener).
                            </p>
                            <div className="flex gap-2.5 mt-1">
                              <button className="bg-soft-violet hover:bg-soft-violet/90 text-white text-[10px] font-semibold px-3 py-1 rounded-md transition-all active:scale-95 cursor-pointer">
                                Accept Match
                              </button>
                            </div>
                          </div>

                          {/* Card 3: Marketplace Item */}
                          <div className="bg-white border border-line/40 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">build</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-ink truncate">Power Drill Kit</div>
                                <div className="text-[10px] text-on-surface-variant truncate">Lent by Rohit K.</div>
                              </div>
                            </div>
                            <button className="border border-line-strong text-ink hover:bg-surface-variant text-[10px] font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer flex-shrink-0 w-full sm:w-auto text-center">
                              Request (10 Crd)
                            </button>
                          </div>
                        </CarouselItem>

                        {/* Slide 2: Coordinator view */}
                        <CarouselItem className="flex flex-col gap-3.5">
                          <div className="flex items-center gap-2 bg-panel px-3 py-1.5 rounded-lg border border-line/30">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant flex-shrink-0">search</span>
                            <span className="text-[11px] text-on-surface-variant/60 truncate">Search active coordinators and reports...</span>
                          </div>

                          {/* Sentiment Analytics */}
                          <div className="bg-panel border border-line/30 rounded-xl p-3 sm:p-3.5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 w-full min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-soft-violet/10 flex items-center justify-center text-soft-violet flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">monitoring</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider truncate">Community Sentiment</div>
                                <div className="flex items-center justify-between mt-0.5 gap-2">
                                  <div className="text-base font-bold text-ink truncate">92% Positive</div>
                                  <div className="text-[9px] text-emerald-600 font-bold flex-shrink-0">Stable State</div>
                                </div>
                                <div className="w-full bg-line/45 h-1.5 rounded-full overflow-hidden mt-1.5">
                                  <div className="bg-primary w-[92%] h-full rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Active Dispute Resolution Trigger */}
                          <div className="border border-line/40 rounded-xl p-3 sm:p-4 flex flex-col gap-2 relative bg-error-container/20">
                            <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-red-100 text-red-800 text-[8px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                              ALERT
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                              </div>
                              <div className="text-[11px] font-bold text-ink truncate">Conflict Delay Warning</div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-normal pr-12">
                              Gardening - Aman S. vs Meera V. reported unusually long delay.
                            </p>
                            <div className="flex gap-2.5 mt-1">
                              <button className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold px-3 py-1 rounded-md transition-all active:scale-95 cursor-pointer">
                                Intervene Now
                              </button>
                            </div>
                          </div>
                        </CarouselItem>

                        {/* Slide 3: Event & notice board view */}
                        <CarouselItem className="flex flex-col gap-3.5">
                          <div className="flex items-center gap-2 bg-panel px-3 py-1.5 rounded-lg border border-line/30">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant flex-shrink-0">search</span>
                            <span className="text-[11px] text-on-surface-variant/60 truncate">Search community notices & events...</span>
                          </div>

                          {/* Event Announcement Card */}
                          <div className="bg-panel border border-line/30 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 border border-emerald-200 flex-shrink-0">
                                <span className="material-symbols-outlined text-[18px]">event</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider truncate">Upcoming Volunteering</div>
                                <div className="text-sm font-bold text-ink truncate">Park Cleanup & Gardening</div>
                                <div className="text-[9px] text-on-surface-variant mt-0.5 truncate">Sunday 9:00 AM • Apt Park B</div>
                              </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                              <div className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
                                +15 Crd
                              </div>
                            </div>
                          </div>

                          {/* Broadcast Message Board */}
                          <div className="border border-line/45 bg-panel/30 rounded-xl p-3 sm:p-4 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 flex-shrink-0">
                                <span className="material-symbols-outlined text-[16px]">campaign</span>
                              </div>
                              <div className="text-[11px] font-bold text-ink truncate">Water Maintenance Shutdown</div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-normal pr-4">
                              Admins have scheduled main pump maintenance for Thursday between 2 PM and 5 PM.
                            </p>
                          </div>
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>

                    {/* Carousel Custom Footer Controls (Inner view slide indicators) */}
                    <div className="flex justify-between items-center pt-4 border-t border-line/45 mt-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest truncate">Interactive Mockup</span>
                        <div className="text-xs font-bold text-ink mt-0.5 truncate">
                          {currentHeroSlide === 0 && "Resident Hub"}
                          {currentHeroSlide === 1 && "Coordinator Sentinel"}
                          {currentHeroSlide === 2 && "Notices & Events"}
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button 
                          onClick={() => heroApi?.scrollPrev()} 
                          className="w-7 h-7 rounded-md border border-line hover:bg-panel flex items-center justify-center transition-all cursor-pointer text-on-surface-variant hover:text-ink active:scale-90"
                          title="Previous View"
                        >
                          <span className="material-symbols-outlined text-[16px] font-bold flex-shrink-0">chevron_left</span>
                        </button>
                        <button 
                          onClick={() => heroApi?.scrollNext()} 
                          className="w-7 h-7 rounded-md border border-line hover:bg-panel flex items-center justify-center transition-all cursor-pointer text-on-surface-variant hover:text-ink active:scale-90"
                          title="Next View"
                        >
                          <span className="material-symbols-outlined text-[16px] font-bold flex-shrink-0">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </header>

      {/* Impact Stats */}
      <section
        className="py-12 bg-white border-y border-line/50 relative overflow-hidden"
        id="impact"
      >
        <div className="container mx-auto px-margin-page max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <ScrollReveal delay={0} duration={600} className="relative group">
              <div className="font-headline-lg text-4xl text-deep-forest mb-1.5 group-hover:scale-105 transition-transform font-bold">
                <AnimatedCount target={500} suffix="+" />
              </div>
              <div className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">
                Active Members
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150} duration={600} className="relative group md:border-x border-line/30">
              <div className="font-headline-lg text-4xl text-soft-violet mb-1.5 group-hover:scale-105 transition-transform font-bold">
                <AnimatedCount target={2500} />
              </div>
              <div className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">
                Exchanges Completed
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300} duration={600} className="relative group">
              <div className="font-headline-lg text-4xl text-deep-forest/80 mb-1.5 group-hover:scale-105 transition-transform font-bold">
                <AnimatedCount target={15000} />
              </div>
              <div className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">
                Credits Circulated
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-surface" id="how-it-works">
        <div className="container mx-auto px-margin-page max-w-6xl">
          <div className="text-center mb-16">
            <ScrollReveal duration={600}>
              <h2 className="font-headline-lg text-3xl sm:text-4xl mb-4 text-ink font-bold tracking-tight">
                A Circular Economy in 3 Steps
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                CEN removes the barriers to skill sharing by introducing a
                trust-based credit system that values your time equally.
              </p>
            </ScrollReveal>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0} duration={600} className="h-full">
              <div className="p-8 rounded-2xl bg-white border border-line shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-deep-forest/10 flex items-center justify-center text-deep-forest mb-6 group-hover:rotate-3 transition-transform">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    edit_note
                  </span>
                </div>
                <h3 className="font-headline-md mb-3 text-ink font-bold text-lg">List a Skill</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  Offer your expertise or tools to the community. From language
                  lessons to power drills, everything has value here.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150} duration={600} className="h-full">
              <div className="p-8 rounded-2xl bg-white border border-line shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-soft-violet/10 flex items-center justify-center text-soft-violet mb-6 group-hover:rotate-3 transition-transform">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    payments
                  </span>
                </div>
                <h3 className="font-headline-md mb-3 text-ink font-bold text-lg">Earn Credits</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  Perform a service and earn exchange credits. Credits are tied to
                  time and quality, ensuring a fair trade every time.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300} duration={600} className="h-full">
              <div className="p-8 rounded-2xl bg-white border border-line shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-deep-forest/5 flex items-center justify-center text-deep-forest/70 mb-6 group-hover:rotate-3 transition-transform">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    volunteer_activism
                  </span>
                </div>
                <h3 className="font-headline-md mb-3 text-ink font-bold text-lg">Access Resources</h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  Spend your credits on services you need. Browse the community
                  marketplace and find exactly what you're looking for.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive Trade Simulator Block */}
          <ScrollReveal delay={100} duration={600}>
            <div className="mt-16 bg-panel/35 border border-line/70 p-6 sm:p-8 rounded-[2rem] shadow-sm relative overflow-hidden backdrop-blur-md">
              <style>{`
                @keyframes sim-dash {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .animate-sim-dash {
                  animation: sim-dash 0.8s linear infinite;
                }
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(3px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-fade-in {
                  animation: fadeIn 0.3s ease-out forwards;
                }
              `}</style>
              
              <div className="flex justify-between items-center gap-4 mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-soft-violet/10 text-soft-violet font-metadata text-[9.5px] rounded-full tracking-wider uppercase font-bold border border-soft-violet/20">
                    <Sparkles className="h-3 w-3 animate-pulse" /> Live Barter Simulator
                  </span>
                  <h3 className="font-bold text-xl sm:text-2xl text-ink mt-2">CEN Timebank Exchange Loop</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">See how neighbors barter services and swap credits without spending cash.</p>
                </div>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setIsAutoplay((p) => !p);
                    }}
                    className={cn(
                      "h-9 w-9 rounded-full border-line-strong hover:bg-panel cursor-pointer active:scale-95 transition-all flex items-center justify-center flex-shrink-0 shadow-sm",
                      isAutoplay ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "text-on-surface-variant"
                    )}
                    title={isAutoplay ? "Pause Autoplay" : "Start Autoplay"}
                  >
                    {isAutoplay ? (
                      <Pause className="h-4.5 w-4.5" />
                    ) : (
                      <Play className="h-4.5 w-4.5 fill-current" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Simulation Neighbors Cards Grid */}
              <div className="relative">
                {/* SVG Connection Paths (Only on desktop) */}
                <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
                  <svg className="w-full h-full" viewBox="0 0 900 240" fill="none" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    
                    {/* Path 1: Raj (Col 3) pays Aman (Col 1) -- Arch Curve Over */}
                    <path 
                      d="M 750,90 C 600,-20 300,-20 150,90" 
                      stroke={simStep === 1 ? "url(#flow-grad)" : "#e2e8f0"} 
                      strokeWidth={simStep === 1 ? "3.5" : "1.5"}
                      strokeDasharray={simStep === 1 ? "8 6" : "none"}
                      className={cn(
                        "transition-all duration-500",
                        simStep === 1 && "animate-sim-dash"
                      )}
                    />

                    {/* Path 2: Aman (Col 1) pays Meera (Col 2) -- Curve Under */}
                    <path 
                      d="M 150,110 C 220,170 380,170 450,110" 
                      stroke={simStep === 2 ? "url(#flow-grad)" : "#e2e8f0"} 
                      strokeWidth={simStep === 2 ? "3.5" : "1.5"}
                      strokeDasharray={simStep === 2 ? "8 6" : "none"}
                      className={cn(
                        "transition-all duration-500",
                        simStep === 2 && "animate-sim-dash"
                      )}
                    />

                    {/* Path 3: Meera (Col 2) pays Raj (Col 3) -- Curve Under */}
                    <path 
                      d="M 450,110 C 520,170 680,170 750,110" 
                      stroke={simStep === 3 ? "url(#flow-grad)" : "#e2e8f0"} 
                      strokeWidth={simStep === 3 ? "3.5" : "1.5"}
                      strokeDasharray={simStep === 3 ? "8 6" : "none"}
                      className={cn(
                        "transition-all duration-500",
                        simStep === 3 && "animate-sim-dash"
                      )}
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Neighbor 1: Aman */}
                  <div className={cn(
                    "p-5 rounded-2xl bg-white border transition-all duration-500 flex flex-col justify-between h-44 shadow-sm",
                    simStep === 1 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500" :
                    simStep === 2 ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-400" :
                    "border-line/60"
                  )}>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-line overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80" alt="Aman S." className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-ink">Aman S.</div>
                          <div className="text-[10px] text-on-surface-variant font-medium">Offers: Gardening</div>
                        </div>
                      </div>
                      <div className="mt-3.5 text-xs text-on-surface-variant leading-relaxed">
                        {simStep === 0 && "Wants: Math tutoring for daughter"}
                        {simStep === 1 && <span className="text-emerald-700 font-bold">Earned +15 credits for Gardening!</span>}
                        {simStep === 2 && <span className="text-amber-800 font-bold">Spent 20 credits on Math tutoring.</span>}
                        {simStep === 3 && "Wants met. Balance settled."}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-line/20">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Credits</span>
                      <span className="font-bold text-sm text-ink">
                        {simStep === 0 && "50 Credits"}
                        {simStep === 1 && "65 Credits"}
                        {simStep === 2 && "45 Credits"}
                        {simStep === 3 && "45 Credits"}
                      </span>
                    </div>
                  </div>

                  {/* Neighbor 2: Meera */}
                  <div className={cn(
                    "p-5 rounded-2xl bg-white border transition-all duration-500 flex flex-col justify-between h-44 shadow-sm",
                    simStep === 2 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500" :
                    simStep === 3 ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-400" :
                    "border-line/60"
                  )}>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-line overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" alt="Meera V." className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-ink">Meera V.</div>
                          <div className="text-[10px] text-on-surface-variant font-medium">Offers: Math Tutoring</div>
                        </div>
                      </div>
                      <div className="mt-3.5 text-xs text-on-surface-variant leading-relaxed">
                        {simStep === 0 && "Wants: Kitchen Sink Plumb repair"}
                        {simStep === 1 && "Waiting for trade exchange..."}
                        {simStep === 2 && <span className="text-emerald-700 font-bold">Earned +20 credits for Tutoring!</span>}
                        {simStep === 3 && <span className="text-amber-800 font-bold">Spent 15 credits on Plumbing.</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-line/20">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Credits</span>
                      <span className="font-bold text-sm text-ink">
                        {simStep === 0 && "30 Credits"}
                        {simStep === 1 && "30 Credits"}
                        {simStep === 2 && "50 Credits"}
                        {simStep === 3 && "35 Credits"}
                      </span>
                    </div>
                  </div>

                  {/* Neighbor 3: Raj */}
                  <div className={cn(
                    "p-5 rounded-2xl bg-white border transition-all duration-500 flex flex-col justify-between h-44 shadow-sm",
                    simStep === 3 ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500" :
                    simStep === 1 ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-400" :
                    "border-line/60"
                  )}>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-line overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64&q=80" alt="Raj K." className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-ink">Raj K.</div>
                          <div className="text-[10px] text-on-surface-variant font-medium">Offers: Plumbing</div>
                        </div>
                      </div>
                      <div className="mt-3.5 text-xs text-on-surface-variant leading-relaxed">
                        {simStep === 0 && "Wants: Backyard Herb Garden Setup"}
                        {simStep === 1 && <span className="text-amber-800 font-bold">Spent 15 credits on Gardening.</span>}
                        {simStep === 2 && "Waiting for trade exchange..."}
                        {simStep === 3 && <span className="text-emerald-700 font-bold">Earned +15 credits for Plumbing!</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-line/20">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">Credits</span>
                      <span className="font-bold text-sm text-ink">
                        {simStep === 0 && "45 Credits"}
                        {simStep === 1 && "30 Credits"}
                        {simStep === 2 && "30 Credits"}
                        {simStep === 3 && "45 Credits"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Narration Banner with Fixed Height and Keyed Fade-In to Prevent Reflow Shift Glitches */}
              <div className="mt-6 p-4 rounded-xl bg-deep-forest/5 border border-deep-forest/10 flex items-start gap-3 min-h-[168px] sm:min-h-[96px] md:min-h-[76px] transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-deep-forest/15 text-deep-forest flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {simStep === 0 && "1"}
                  {simStep === 1 && "2"}
                  {simStep === 2 && "3"}
                  {simStep === 3 && "✓"}
                </div>
                <div key={simStep} className="text-xs text-on-surface-variant leading-relaxed animate-fade-in">
                  {simStep === 0 && (
                    <span>
                      <b>Initial State:</b> Three neighbors have individual needs but don't want to spend real cash. Tapping the Play/Pause button controls the autoplay loop.
                    </span>
                  )}
                  {simStep === 1 && (
                    <span>
                      <b>Transaction 1:</b> Aman helps Raj build a backyard Herb Garden. Raj transfers <b>15 credits</b> to Aman. The SVG path lights up carrying animated credit flows from Raj to Aman.
                    </span>
                  )}
                  {simStep === 2 && (
                    <span>
                      <b>Transaction 2:</b> Aman uses credits earned to hire Meera for math tutoring for his daughter. Aman transfers <b>20 credits</b> to Meera.
                    </span>
                  )}
                  {simStep === 3 && (
                    <span>
                      <b>Circular Loop Complete!</b> Meera spends her tutoring credits to hire Raj to fix her kitchen sink leak (<b>15 credits</b>). All neighbors got their chores done, <b>$0 cash spent</b>, and credit balances returned to equilibrium!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features & Achievements Carousel Section */}
      <section className="py-24 bg-white border-b border-line/50" id="features-showcase">
        <div className="container mx-auto px-6 sm:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <ScrollReveal duration={600}>
              <span className="inline-flex items-center gap-2 py-1 px-3.5 bg-soft-violet/10 text-soft-violet font-metadata text-[10px] rounded-full mb-4 tracking-wider uppercase font-bold border border-soft-violet/20">
                OUR IMPACT & CAPABILITIES
              </span>
              <h2 className="font-headline-lg text-3xl sm:text-4xl mb-4 text-ink font-bold tracking-tight">
                Features & Community Achievements
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                See the specialized systems built into CEN and the real-world impact we've driven in local neighborhoods.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200} duration={800} direction="up" className="relative px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {[
                  {
                    icon: "smart_toy",
                    title: "AI-Driven Matching",
                    description: "Our intelligence engine maps neighbor profiles to automatically pair complementary skills and tools in real-time.",
                    stat: "98% Match Rate",
                    metric: "matches within 24 hours",
                    color: "border-soft-violet/30 bg-ai-bg/20 text-soft-violet",
                  },
                  {
                    icon: "handyman",
                    title: "Resource Pooling",
                    description: "Share lawnmowers, home tools, and event assets easily, reducing household expenses and landfill waste.",
                    stat: "2,500+ Shared Items",
                    metric: "estimated $12,000 saved",
                    color: "border-deep-forest/30 bg-accent-bg/40 text-deep-forest",
                  },
                  {
                    icon: "verified_user",
                    title: "Verified Households",
                    description: "Coordinators verify IDs and household credentials to establish a completely safe and accountable sharing environment.",
                    stat: "100% Secure Nodes",
                    metric: "zero unresolved disputes",
                    color: "border-primary/30 bg-primary/5 text-primary",
                  },
                  {
                    icon: "account_balance_wallet",
                    title: "Circular Time Economy",
                    description: "A transparent digital ledger handles trade balances. One hour of service equals standard community credits.",
                    stat: "15k Credits Circulated",
                    metric: "driving local participation",
                    color: "border-amber-500/30 bg-amber-500/5 text-amber-800",
                  },
                ].map((item, idx) => (
                  <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="border border-line/50 rounded-2xl p-6 bg-panel hover:bg-white hover:shadow-md hover:border-line transition-all duration-300 flex flex-col h-full justify-between">
                      <div>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${item.color}`}>
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <h3 className="font-headline-md text-base font-bold text-ink mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-line/45 mt-auto">
                        <div className="text-sm font-bold text-ink">{item.stat}</div>
                        <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">{item.metric}</div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 h-9 w-9 bg-white hover:bg-panel border border-line shadow-sm hover:shadow-md cursor-pointer transition-all" />
              <CarouselNext className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 h-9 w-9 bg-white hover:bg-panel border border-line shadow-sm hover:shadow-md cursor-pointer transition-all" />
            </Carousel>
          </ScrollReveal>
        </div>
      </section>

      {/* AI Magic Section */}
      <section
        className="py-24 relative overflow-hidden bg-gradient-to-br from-[#f8f7ff] via-[#f0eeff] to-[#e8e4ff]"
        id="magic-setup"
      >
        <div className="container mx-auto px-margin-page max-w-6xl flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <ScrollReveal duration={600} direction="left">
              <div className="inline-flex items-center gap-2 bg-soft-violet/10 px-3.5 py-1 rounded-full text-soft-violet font-code-sm mb-6 border border-soft-violet/20 font-bold">
                <span className="material-symbols-outlined text-[14px] animate-pulse">
                  bolt
                </span>
                AI-POWERED MATCHING
              </div>
              <h2 className="font-headline-lg text-4xl sm:text-5xl text-ink leading-tight mb-6 font-bold tracking-tight">
                Effortless Connectivity
              </h2>
              <p className="font-body-lg text-base text-on-surface-variant mb-8 leading-relaxed">
                Our AI understands your unique profile beyond just keywords. It
                identifies latent skills and matches them with community needs in
                real-time.
              </p>
              <div className="bg-gradient-to-br from-white via-white to-soft-violet/[0.04] p-7 sm:p-9 rounded-2xl border border-soft-violet/15 shadow-[0_12px_30px_-4px_rgba(91,75,138,0.06)] relative overflow-hidden min-h-[230px] flex flex-col justify-between group">
                {/* Glow decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-soft-violet/10 blur-3xl pointer-events-none group-hover:bg-soft-violet/15 transition-all duration-700"></div>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-soft-violet/40 via-soft-violet to-soft-violet/40"></div>
                
                <div key={aiIndex} className="animate-card-slide space-y-3.5">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <h4 className="font-headline-sm text-soft-violet uppercase text-[10px] tracking-widest font-extrabold">
                        {AI_FEATURES[aiIndex].title}
                      </h4>
                    </div>
                    <span className="font-code-sm text-[8.5px] text-soft-violet font-bold uppercase tracking-wider bg-soft-violet/5 px-2.5 py-0.5 rounded-full border border-soft-violet/10 flex-shrink-0">
                      {AI_FEATURES[aiIndex].code}
                    </span>
                  </div>
                  
                  <div className="relative pl-3 border-l-2 border-soft-violet/20">
                    <p className="font-body-lg text-[13px] text-on-surface-variant leading-relaxed pr-2 font-medium tracking-wide">
                      {AI_FEATURES[aiIndex].description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-line/40 mt-4">
                  <div className="flex items-center gap-1.5">
                    {AI_FEATURES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setAiIndex(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500 ease-out cursor-pointer",
                          aiIndex === i ? "bg-soft-violet w-7" : "bg-soft-violet/15 w-1.5 hover:bg-soft-violet/30"
                        )}
                        title={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Engine Active
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-6">
            <ScrollReveal delay={150} duration={600} direction="right" className="self-start mt-6 max-w-[280px] mx-auto md:mx-0">
              <div className="bg-white p-5 rounded-2xl shadow-[0_15px_40px_rgba(91,75,138,0.12)] border border-line/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-soft-violet/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-soft-violet text-[16px]">
                      smart_toy
                    </span>
                  </div>
                  <div className="text-xs font-bold text-ink">
                    AI Match
                  </div>
                </div>
                <div className="text-[11px] text-on-surface-variant bg-ai-bg/50 p-3 rounded-xl border border-soft-violet/10 mb-4 leading-relaxed">
                  "Based on your 'Gardening' hobby, we suggest listing 'Herb Garden Design'."
                </div>
                <button className="w-full py-1.5 bg-soft-violet text-white rounded-lg text-[11px] font-bold hover:bg-soft-violet/90 transition-colors cursor-pointer">
                  Accept Suggestion
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300} duration={600} direction="right" className="self-end mb-6 max-w-[280px] mx-auto md:mx-0">
              <div className="bg-white p-5 rounded-2xl shadow-[0_15px_40px_rgba(91,75,138,0.12)] border border-line/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-soft-violet/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-soft-violet text-[16px]">
                      verified
                    </span>
                  </div>
                  <div className="text-xs font-bold text-ink">
                    Trust Score
                  </div>
                </div>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-2xl font-bold text-soft-violet">9.8</span>
                  <span className="text-[10px] text-on-surface-variant mb-0.5 font-bold">
                    / 10
                  </span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-soft-violet w-[98%] h-full rounded-full"></div>
                </div>
                <div className="mt-2.5 text-[10px] text-on-surface-variant font-semibold">
                  Top 2% of Community
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-24 bg-white" id="skills">
        <div className="container mx-auto px-margin-page max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
            <ScrollReveal duration={600}>
              <div className="text-center md:text-left">
                <h2 className="font-headline-lg text-3xl sm:text-4xl mb-4 text-ink font-bold tracking-tight">
                  Popular Skills &amp; Resources
                </h2>
                <p className="text-sm text-on-surface-variant text-base">
                  See what your neighbors are offering right now in your area.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal duration={600} delay={200}>
              <Link to="/join-society">
                <button className="group text-deep-forest text-sm hover:underline flex items-center gap-2 px-4 py-2 bg-deep-forest/5 rounded-lg transition-all cursor-pointer font-semibold">
                  View Marketplace
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </Link>
            </ScrollReveal>
          </div>

          {/* Dynamic Grid of Filtered Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POPULAR_SKILLS.map((item, idx) => (
              <ScrollReveal key={item.id} delay={idx * 75} duration={500} className="h-full">
                <div className="bg-white rounded-[1.5rem] overflow-hidden border border-line/60 hover:shadow-lg transition-all duration-500 group flex flex-col h-full relative">
                  
                  {/* Card Image Area */}
                  <div className="h-56 relative overflow-hidden">
                    <img
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      src={item.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className={cn(
                      "absolute top-4 right-4 px-3 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-bold shadow-sm border border-white",
                      item.type === "SKILL" ? "text-deep-forest" : "text-soft-violet"
                    )}>
                      {item.type}
                    </div>

                    {/* Complementary Trade Overlay Panel (Revealed on hover) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-white/90 backdrop-blur-md border-t border-line/40 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col gap-1.5 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-soft-violet tracking-wider">
                        <Sparkles className="h-3 w-3 animate-pulse" /> AI Circular Match
                      </div>
                      <span className="text-[11px] font-semibold text-ink leading-normal">
                        {item.needs}
                      </span>
                      <span className="text-[9px] text-on-surface-variant font-medium">
                        Completing this exchange powers the community credit loop.
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-headline-md text-ink text-base sm:text-lg font-bold">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-warn bg-warn/5 px-2 py-0.5 rounded-full">
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="text-[10px] font-bold ml-1">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-line mt-auto">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br", item.avatarBg)}></div>
                        <span className="text-[11px] text-on-surface-variant font-semibold">
                          {item.owner}
                        </span>
                      </div>
                      <div className={cn(
                        "text-sm font-bold",
                        item.type === "SKILL" ? "text-deep-forest" : "text-soft-violet"
                      )}>
                        {item.rate.split(" ")[0]}{" "}
                        <span className="text-[10px] uppercase text-on-surface-variant font-normal">
                          {item.rate.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coordinator Portal Section */}
      <section className="py-24 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-soft-violet/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-deep-forest/10 blur-[100px] rounded-full"></div>
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <ScrollReveal duration={600} direction="up">
                <div className="bg-white/5 p-6 sm:p-8 rounded-[1.75rem] border border-white/10 glass-panel backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <span className="material-symbols-outlined text-white/5 text-7xl">
                      monitoring
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 mb-8 relative z-10">
                    <div className="text-primary-fixed text-lg font-bold">
                      Sentiment Dashboard
                    </div>
                    <div className="bg-primary/20 text-primary-fixed px-3 py-0.5 rounded-full text-[10px] border border-primary-fixed/20 uppercase font-bold tracking-widest w-fit">
                      Real-time
                    </div>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs text-white/80">
                          Community Satisfaction
                        </span>
                        <span className="text-primary-fixed text-xs font-bold">
                          92% Positive
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary-fixed w-[92%] h-full rounded-full"></div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="text-[10px] text-white/40 mb-4 uppercase tracking-[0.2em] font-bold">
                        Active Resolution Triggers
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-error/10 border border-error/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-error text-[16px]">
                            warning
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            Unusually Long Delay
                          </div>
                          <div className="text-[10px] text-white/50 truncate">
                            Gardening - Aman S. vs Meera V.
                          </div>
                        </div>
                        <Link
                          to="/app/coord/disputes"
                          className="text-[11px] text-primary-fixed font-bold hover:underline cursor-pointer flex-shrink-0"
                        >
                          Intervene
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className="order-1 lg:order-2">
              <ScrollReveal duration={600} direction="up">
                <div className="inline-block py-1 px-3 bg-soft-violet/20 text-soft-violet font-metadata text-[10px] rounded-full mb-6 tracking-wider uppercase border border-soft-violet/30 font-bold">
                  Enterprise Coordinator
                </div>
                <h2 className="font-headline-lg text-4xl mb-6 leading-tight font-bold tracking-tight">
                  Empower Your Local Community Leaders
                </h2>
                <p className="text-base text-white/60 mb-8 leading-relaxed">
                  Manage your local network with surgical precision. AI-powered
                  sentiment analysis alerts you to potential disputes before they
                  escalate, while automated reporting tracks overall growth and
                  health.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">
                      verified_user
                    </span>
                    <div className="text-sm font-semibold">
                      Predictive Resolution
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">
                      shield_with_heart
                    </span>
                    <div className="text-sm font-semibold">
                      Automated Reputation
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">
                      insights
                    </span>
                    <div className="text-sm font-semibold">
                      Network Analytics
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="material-symbols-outlined text-primary-fixed text-lg">
                      hub
                    </span>
                    <div className="text-sm font-semibold">
                      Global Connectivity
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-deep-forest text-on-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center relative z-10">
          <ScrollReveal duration={600}>
            <h2 className="font-headline-lg text-4xl sm:text-5xl mb-6 leading-tight font-bold tracking-tight">
              Ready to strengthen your community?
            </h2>
            <p className="font-body-lg text-base text-on-primary/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of neighbors already exchanging skills and building
              lasting local connections with the power of modern technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/join-society">
                <button className="bg-white text-deep-forest text-sm font-semibold px-8 h-[40px] rounded-lg shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer">
                  Join a Society
                </button>
              </Link>
              <Link to="/request-society">
                <button className="border border-white/30 text-white hover:bg-white/10 text-sm font-semibold px-8 h-[40px] rounded-lg hover:translate-y-[-1px] transition-all cursor-pointer">
                  Request a Society
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-16 px-margin-page bg-surface border-t border-line">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 pb-12 border-b border-line">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-deep-forest rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div className="font-headline-md text-2xl font-extrabold text-deep-forest tracking-tighter">
                  CEN
                </div>
              </div>
              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Building stronger neighborhoods through trust, transparency, and
                technology.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
              <div className="flex flex-col gap-3">
                <div className="text-xs text-ink uppercase tracking-widest mb-1.5 font-bold">
                  Company
                </div>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  About Us
                </a>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  Careers
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-xs text-ink uppercase tracking-widest mb-1.5 font-bold">
                  Legal
                </div>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  Privacy Policy
                </a>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  Terms
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-xs text-ink uppercase tracking-widest mb-1.5 font-bold">
                  Support
                </div>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  Help Center
                </a>
                <a
                  className="text-sm text-on-surface-variant hover:text-deep-forest transition-colors"
                  href="#"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-sm text-on-surface-variant opacity-60">
              © {new Date().getFullYear()} Community Exchange Network. All
              rights reserved.
            </div>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-on-surface-variant hover:text-deep-forest transition-all border border-line shadow-sm hover:shadow-md"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  public
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-on-surface-variant hover:text-deep-forest transition-all border border-line shadow-sm hover:shadow-md"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
              </a>
              <a
                className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-on-surface-variant hover:text-deep-forest transition-all border border-line shadow-sm hover:shadow-md"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  group
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
