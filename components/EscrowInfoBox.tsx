function EscrowInfoBox({ children, title, subtitle, icon }: { children?: React.ReactNode; title: string; subtitle: string; icon?: string; }) {
  return (
    <div className="p-4 rounded-xl mb-4 border-2 border-primary-purple bg-blue-50">
      <div className="flex items-center mb-3">
        {icon && (
          <span className="text-2xl mr-3">{icon}</span>
        )}
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-primary-purple">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}


export default EscrowInfoBox;