"use client"; // useState 사용을 위해 클라이언트 컴포넌트로 전환

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#top", label: "서비스 소개" },
    { href: "/demo", label: "데모 페이지" },
    { href: "https://github.com/Jeongseup/2025-kaia-hackerthon-decentralized-trade-escrow/tree/main/contracts", label: "컨트랙트 정보" },
    { href: "https://orakl.network/", label: "연동 오라클 서비스" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Trustless<span className="text-primary-purple">Trade</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center text-gray-600 font-medium">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-primary-purple transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <Button asChild className="bg-primary-purple hover:bg-primary-purple/90">
            <Link href="https://dorahacks.io/buidl/31830/">연동 문의하기</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pb-4">
          <nav className="flex flex-col items-center space-y-4">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-gray-600 hover:text-primary-purple transition-colors w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col items-center space-y-2 w-full px-6">
              <Button variant="ghost" asChild className="w-full">
                <Link href="#">로그인</Link>
              </Button>
              <Button asChild className="bg-primary-purple hover:bg-primary-purple/90 w-full">
                <Link href="#">연동 문의하기</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
