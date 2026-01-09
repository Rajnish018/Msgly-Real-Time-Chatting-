import { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, Users, Shield, 
  Globe, Smartphone, MessageCircleMore 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=1974&auto=format&fit=crop",
      title: "Connect with Friends",
      description: "Stay connected with friends and family across the globe with real-time messaging.",
      icon: <Users className="w-8 h-8 text-white" />,
      color: "from-blue-500/80 to-purple-600/80"
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop",
      title: "Secure & Private",
      description: "End-to-end encryption ensures your conversations remain private and secure.",
      icon: <Shield className="w-8 h-8 text-white" />,
      color: "from-emerald-500/80 to-cyan-600/80"
    },
    {
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=1970&auto=format&fit=crop",
      title: "Available Everywhere",
      description: "Access your messages from any device, anywhere in the world.",
      icon: <Globe className="w-8 h-8 text-white" />,
      color: "from-orange-500/80 to-red-600/80"
    },
    {
      image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2080&auto=format&fit=crop",
      title: "Modern Interface",
      description: "Beautiful, intuitive design that makes communication a pleasure.",
      icon: <Smartphone className="w-8 h-8 text-white" />,
      color: "from-violet-500/80 to-pink-600/80"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-gradient-to-br from-primary to-secondary">
      {/* Slides Container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${slides[currentSlide].color} via-black/40 to-transparent`} />
            
            {/* Additional Overlay Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-12 text-white">
        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mb-12"
          >
            {/* Icon & Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                {slides[currentSlide].icon}
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-2">
                  {slides[currentSlide].title}
                </h2>
                <div className="h-1 w-16 bg-white/50 rounded-full"></div>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8 max-w-lg">
              {slides[currentSlide].description}
            </p>

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                Real-time
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                Secure
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                Cross-platform
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <MessageCircleMore className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Msgly - ChatApp</h3>
              <p className="text-white/70 text-sm">Real Time Communication</p>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentSlide
                      ? "h-2 w-8 bg-white rounded-full"
                      : "h-2 w-2 bg-white/40 rounded-full hover:bg-white/60 hover:w-4"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Slide Counter */}
            <div className="text-white/70 text-sm font-medium">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar 
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            key={currentSlide}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-white"
          />
        </div>*/}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default ImageSlider;