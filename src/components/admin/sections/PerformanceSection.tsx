import { FormControl, FormLabel, Input, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function PerformanceSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">0-60 mph (sec)</FormLabel>
          <Input
            size="sm"
            type="number"
            step="0.1"
            value={car.acceleration_0_60 ?? ""}
            onChange={(e) => onChange("acceleration_0_60", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Top Speed (mph)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.top_speed ?? ""}
            onChange={(e) => onChange("top_speed", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Power (hp)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.power ?? ""}
            onChange={(e) => onChange("power", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Torque (lb-ft)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.torque ?? ""}
            onChange={(e) => onChange("torque", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Drive Type</FormLabel>
          <Input
            size="sm"
            value={car.drive_type ?? ""}
            onChange={(e) => onChange("drive_type", e.target.value || null)}
            borderColor={borderColor}
            placeholder="e.g. AWD, RWD, FWD"
          />
        </FormControl>
      </SimpleGrid>
      <Text fontSize="xs" fontWeight="600" mb={2}>
        Speed/Acceleration Details
      </Text>
      <DictEditor
        value={car.speed_acc}
        onChange={(v) => onChange("speed_acc", v)}
        valueType="number"
        keyLabel="Metric"
        valueLabel="Value"
      />
    </>
  );
}
