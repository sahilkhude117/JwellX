import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GoldUnit, GOLD_UNITS } from '@/lib/types/settings/metal-rates';

interface GoldUnitSelectorProps {
  value: GoldUnit;
  onValueChange: (unit: GoldUnit) => void;
  className?: string;
}

export const GoldUnitSelector: React.FC<GoldUnitSelectorProps> = ({
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
        {Object.entries(GOLD_UNITS).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};