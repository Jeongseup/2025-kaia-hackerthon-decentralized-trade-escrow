function InfoBox({ title, content, subContent }: { title: string; content: string; subContent?: string; }) {
  return (
    <div className="p-3 bg-gray-100 rounded-lg mb-2">
      <h4 className="text-xs text-gray-600 font-medium">{title}</h4>
      <p className="text-sm font-semibold">{content}</p>
      {subContent && <p className="text-xs text-gray-500">{subContent}</p>}
    </div>
  );
}

export default InfoBox;