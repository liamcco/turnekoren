import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";

const choirs = ["MK", "DK", "KK"] as const;
const voices = ["B2", "B1", "T2", "T1", "A2", "A1", "S2", "S1"] as const;

export function ChoirSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select name="choir" defaultValue={defaultValue ?? choirs[0]} required>
      <SelectTrigger>
        <SelectValue placeholder="Välj kör" />
      </SelectTrigger>
      <SelectContent>
        {choirs.map((choir) => (
          <SelectItem key={choir} value={choir}>
            {choir}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VoiceSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <Select name="voice" defaultValue={defaultValue ?? voices[0]} required>
      <SelectTrigger>
        <SelectValue placeholder="Välj stämma" />
      </SelectTrigger>
      <SelectContent>
        {voices.map((voice) => (
          <SelectItem key={voice} value={voice}>
            {voice}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
