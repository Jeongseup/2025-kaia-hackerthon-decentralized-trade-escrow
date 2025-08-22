// /components/PhoneMockup.tsx
function PhoneMockup({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div>
      <div className="text-center mb-2 text-white text-sm font-semibold p-2 bg-black bg-opacity-30 rounded-lg">
        {title}
      </div>
      <div className="relative max-w-[400px] mx-auto bg-black rounded-[40px] p-4 shadow-2xl">
        <div className="relative bg-white rounded-[30px] overflow-hidden min-h-[700px]">
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