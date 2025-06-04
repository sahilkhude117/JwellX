'use client'
import {motion} from 'framer-motion'
import Image from 'next/image';

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
            src={'/logo.png'}
            alt='Jwellx'
            width={30}
            height={30}
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        JwellX
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
            src={'/logo.png'}
            alt='Jwellx'
            width={30}
            height={30}
      />
    </a>
  );
};