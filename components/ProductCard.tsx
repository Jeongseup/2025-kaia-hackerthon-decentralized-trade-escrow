function ProductCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-sm">
        상품 이미지
      </div>
      <h3 className="text-base font-semibold mb-1">맥북 프로 13인치 2020년형</h3>
      <p className="text-xs text-gray-600 mb-2">2020년 구매, 박스 및 충전기 포함</p>
      <div className="text-lg font-bold text-primary-purple">₩1,200,000</div>
      <div className="flex justify-between text-xs text-gray-600 pt-3 mt-3 border-t">
        <span>판매자</span>
        <span className="font-semibold">김철수 (⭐ 4.8)</span>
      </div>
    </div>
  );
}

export default ProductCard;