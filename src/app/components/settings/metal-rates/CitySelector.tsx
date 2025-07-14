import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { City, SUPPORTED_CITIES } from '@/lib/types/settings/metal-rates';

interface CitySelectorProps {
  value: City;
  onValueChange: (city: City) => void;
  className?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onValueChange,
  className = '',
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <SelectValue placeholder="Select city" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_CITIES).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};