import { FormControl, FormLabel, Input, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";
import ListEditor from "../shared/ListEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function BatterySection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">Battery Capacity (kWh)</FormLabel>
          <Input
            size="sm"
            type="number"
            step="0.1"
            value={car.battery_capacity ?? ""}
            onChange={(e) => onChange("battery_capacity", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">EPA Range (mi)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.epa_range ?? ""}
            onChange={(e) => onChange("epa_range", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Max Charging Speed (kW)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.battery_max_charging_speed ?? ""}
            onChange={(e) => onChange("battery_max_charging_speed", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
      </SimpleGrid>

      <Text fontSize="xs" fontWeight="600" mb={2}>
        Chargers
      </Text>
      <ListEditor
        value={car.chargers}
        onChange={(v) => onChange("chargers", v)}
        placeholder="Add charger type"
      />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Range Details
      </Text>
      <DictEditor
        value={car.range_details}
        onChange={(v) => onChange("range_details", v)}
        valueType="number"
        keyLabel="Condition"
        valueLabel="Range (mi)"
      />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Regen Details
      </Text>
      <DictEditor
        value={car.regen_details}
        onChange={(v) => onChange("regen_details", v)}
        keyLabel="Feature"
        valueLabel="Detail"
      />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Bidirectional Charging
      </Text>
      <DictEditor
        value={car.bidirectional_details}
        onChange={(v) => onChange("bidirectional_details", v)}
        keyLabel="Feature"
        valueLabel="Detail"
      />
    </>
  );
}
