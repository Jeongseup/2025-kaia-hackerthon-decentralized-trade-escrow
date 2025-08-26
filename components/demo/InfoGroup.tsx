import { Input } from "./ui/input";

// onChange 핸들러 타입을 string 값만 처리하도록 변경
interface InputGroupProps {
  label?: string;
  placeholder?: string;
  value?: string;
  isSelect?: boolean;
  isTextarea?: boolean;
  options?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function InputGroup({ label, placeholder, value, isSelect, isTextarea, options, onChange }: InputGroupProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-semibold text-gray-600">{label}</label>}
      {isSelect ? (
        // select 요소는 value prop을 사용하지 않으므로 onChange만 전달
        <select className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm" onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}>
          {options?.map((opt, i) => (
            <option key={i}>{opt}</option>
          ))}
        </select>
      ) : isTextarea ? (
        // textarea에 맞는 onChange 타입으로 명시
        <textarea className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm" placeholder={placeholder} rows={4} value={value} onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>} />
      ) : (
        // Input 컴포넌트에 맞는 onChange 타입으로 명시
        <Input className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm" placeholder={placeholder} value={value} onChange={onChange as React.ChangeEventHandler<HTMLInputElement>} />
      )}
    </div>
  );
}

export default InputGroup;
