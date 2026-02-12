import { FormControl, FormLabel, Input, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function PricingSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">Current Price ($)</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.current_price ?? ""}
            onChange={(e) => onChange("current_price", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Model Webpage</FormLabel>
          <Input
            size="sm"
            value={car.model_webpage ?? ""}
            onChange={(e) => onChange("model_webpage", e.target.value || null)}
            borderColor={borderColor}
            placeholder="https://..."
          />
        </FormControl>
      </SimpleGrid>
      <Text fontSize="xs" fontWeight="600" mb={2}>
        Price History
      </Text>
      <DictEditor
        value={car.price_history}
        onChange={(v) => onChange("price_history", v)}
        valueType="number"
        keyLabel="Date/Year"
        valueLabel="Price"
      />
    </>
  );
}
