// /components/PhoneMockup.tsx
function PhoneMockup({ children, title, className }: { children: React.ReactNode; title: string; className?: string }) {
  return (
    <div>
      <div className="text-center mb-2 text-white text-sm font-semibold p-2 bg-black bg-opacity-30 rounded-lg">
        {title}
      </div>
      <div className={`relative w-[380px] mx-auto bg-black rounded-[40px] p-4 shadow-2xl ${className || ''}`}>
        <div className="relative bg-white rounded-[30px] overflow-hidden h-[650px]">
          <div className="absolute top-0 w-full z-10 bg-black text-white text-xs px-5 py-2 flex justify-between items-center">
            <span>9:41</span>
            <span>⚡ 🔋 100%</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}


export default PhoneMockup;