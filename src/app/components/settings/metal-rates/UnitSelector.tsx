import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Unit, UNITS } from '@/lib/types/settings/metal-rates';

interface UnitSelectorProps {
  value: Unit;
  onValueChange: (unit: Unit) => void;
  className?: string;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onValueChange,
  className = '',
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-[200px] ${className}`}>
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(UNITS).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};