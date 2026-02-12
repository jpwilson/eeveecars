import { FormControl, FormLabel, Input, SimpleGrid, useColorModeValue } from "@chakra-ui/react";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function DatesSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
      <FormControl>
        <FormLabel fontSize="xs">Model First Released</FormLabel>
        <Input
          size="sm"
          value={car.carmodel_first_released ?? ""}
          onChange={(e) => onChange("carmodel_first_released", e.target.value || null)}
          borderColor={borderColor}
          placeholder="e.g. 2020"
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Model Ended</FormLabel>
        <Input
          size="sm"
          value={car.carmodel_ended ?? ""}
          onChange={(e) => onChange("carmodel_ended", e.target.value || null)}
          borderColor={borderColor}
          placeholder="e.g. 2024"
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Trim First Released</FormLabel>
        <Input
          size="sm"
          value={car.trim_first_released ?? ""}
          onChange={(e) => onChange("trim_first_released", e.target.value || null)}
          borderColor={borderColor}
          placeholder="e.g. 2023"
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Trim Ended</FormLabel>
        <Input
          size="sm"
          value={car.trim_ended ?? ""}
          onChange={(e) => onChange("trim_ended", e.target.value || null)}
          borderColor={borderColor}
          placeholder="e.g. 2025"
        />
      </FormControl>
    </SimpleGrid>
  );
}
