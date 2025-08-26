import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4">Trustless Trade</h3>
            <p className="text-gray-400 text-sm">Decentralized Trade Escrow</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="https://dorahacks.io/buidl/31830/" className="hover:text-white">기능</Link></li>
              <li><Link href="https://dorahacks.io/buidl/31830/" className="hover:text-white">요금제</Link></li>
              <li><Link href="https://dorahacks.io/buidl/31830/" className="hover:text-white">사용 사례</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Developers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="https://github.com/Jeongseup/2025-kaia-hackerton-decentralized-trade-escrow" className="hover:text-white">API 문서</Link></li>
              <li><Link href="https://github.com/Jeongseup/2025-kaia-hackerton-decentralized-trade-escrow" className="hover:text-white">튜토리얼</Link></li>
              <li><Link href="https://github.com/Jeongseup/2025-kaia-hackerton-decentralized-trade-escrow" className="hover:text-white">상태 페이지</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="https://dorahacks.io/buidl/31830/" className="hover:text-white">About Us</Link></li>
              <li><Link href="https://www.youtube.com/" className="hover:text-white">Youtube</Link></li>
              <li><Link href="https://x.com/@trust" className="hover:text-white">X</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
          &copy; 2025 Trustless Trade. All rights reserved.
        </div>
      </div>
    </footer>
  );
};