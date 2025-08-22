function PhoneScreen({ children, title, subtitle, hasBackBtn }: { children: React.ReactNode; title: string; subtitle: string; hasBackBtn?: boolean; }) {
  return (
    <div className="h-full flex flex-col pt-8">
      <div className="bg-gradient-to-br from-primary-purple to-secondary-purple text-white p-5 text-center relative">
        {hasBackBtn && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center cursor-pointer">
            &larr;
          </div>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-xs opacity-90">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {children}
      </div>
    </div>
  );
}

export default PhoneScreen;