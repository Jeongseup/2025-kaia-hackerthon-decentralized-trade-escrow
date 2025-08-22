// /components/InfoRow.tsx
function InfoRow({ title, value, valueColor }: { title: string; value: string; valueColor?: string; }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{title}</span>
      <span className={`text-sm font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}

export default InfoRow;