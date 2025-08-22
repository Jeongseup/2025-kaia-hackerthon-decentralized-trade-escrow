// /components/RecentTradeItem.tsx
function RecentTradeItem({ title, status, statusColor, date, price }: { title: string; status: string; statusColor: string; date: string; price: string; }) {
  return (
    <div className="py-3 border-b last:border-b-0">
      <div className="flex justify-between mb-1">
        <span className="font-semibold text-sm">{title}</span>
        <span className={`text-xs font-semibold ${statusColor}`}>{status}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{date}</span>
        <span className="font-semibold text-sm">{price}</span>
      </div>
    </div>
  );
}

export default RecentTradeItem;