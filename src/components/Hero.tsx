import React from 'react';

// Define the props for the Hero component
interface HeroProps {
  imageUrl: string; // Pass the actual image URL as a prop
}

// Define the Hero component
const Hero: React.FC<HeroProps> = ({ imageUrl }) => {
  return (
    // Hero section container with a yellow background
    <section className="bg-yellow-400 text-blue-800 font-sans overflow-hidden relative">
      <div className="container mx-auto px-6 py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">

        {/* Left Column: Text Content and CTA */}
        <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0 animate-fade-in-left">
          {/* Emotional Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 leading-tight">
            Watch Your Child <span className="text-blue-400">Blossom</span> with Joyful Learning!
          </h1>

          {/* Benefit-driven Subheadline */}
          <p className="text-lg md:text-xl mb-8 text-blue-700">
            Spark curiosity and build confidence with engaging, printable worksheets designed to make learning feel like play. Give them the gift of a bright start!
          </p>

          {/* Clear Call-to-Action Button */}
          <a
            href="#worksheets" // Link to your worksheet section or purchase page
            className="inline-block bg-blue-400 hover:bg-blue-500 text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg transform transition-transform duration-300 ease-in-out hover:scale-105 animate-bounce-slow"
          >
            Explore Fun Worksheets Now!
          </a>
          <p className="text-sm mt-4 text-blue-600">Instant Download & Print!</p>
        </div>

        {/* Right Column: Image */}
        <div className="md:w-1/2 flex justify-center items-center animate-fade-in-right">
          {/* Image with slight animation on hover */}
          <img
            src={imageUrl} // Use the prop for the image source
            alt="Mother and daughter happily learning with worksheets"
            className="rounded-lg shadow-2xl w-full max-w-md lg:max-w-lg transform transition-transform duration-500 ease-in-out hover:scale-105"
          />
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-800 rounded-lg opacity-10 translate-x-1/4 translate-y-1/4 rotate-12"></div>
      <div className="absolute top-1/2 right-12 w-16 h-16 bg-yellow-300 rounded-full opacity-30"></div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in-left { animation: fadeInLeft 1s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 1s ease-out forwards; }
        .animate-bounce-slow { animation: bounceSlow 2s infinite ease-in-out; }
      `}</style>
    </section>
  );
};

// Export the component for use in other parts of your application
export default Hero;