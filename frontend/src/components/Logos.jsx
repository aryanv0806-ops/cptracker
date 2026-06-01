import React from 'react';
import leetcodeImg from '../assets/LeetCode_logo_rvs.png';
import codechefImg from '../assets/codechef.svg';

export function LeetCodeLogo({ className = "w-6 h-6" }) {
  return (
    <img 
      src={leetcodeImg} 
      className={`object-contain ${className}`} 
      alt="LeetCode Logo" 
    />
  );
}

export function CodeforcesLogo({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="4.5" height="13" rx="1" fill="#B1362F" />
      <rect x="8.5" y="1" width="4.5" height="18" rx="1" fill="#31649F" />
      <rect x="15" y="10" width="4.5" height="9" rx="1" fill="#F4B425" />
    </svg>
  );
}

export function CodeChefLogo({ className = "w-6 h-6" }) {
  return (
    <img 
      src={codechefImg} 
      className={`object-contain ${className}`} 
      alt="CodeChef Logo" 
    />
  );
}
