import { FormControl, FormLabel, Input, Switch, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function SafetySection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">NHTSA Rating</FormLabel>
          <Input
            size="sm"
            type="number"
            step="0.1"
            min={0}
            max={5}
            value={car.nhtsa_rating ?? ""}
            onChange={(e) => onChange("nhtsa_rating", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Euro NCAP Rating</FormLabel>
          <Input
            size="sm"
            type="number"
            step="0.1"
            min={0}
            max={5}
            value={car.euroncap_rating ?? ""}
            onChange={(e) => onChange("euroncap_rating", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl display="flex" alignItems="center" pt={6}>
          <FormLabel fontSize="xs" mb={0}>
            Sentry/Security Mode
          </FormLabel>
          <Switch
            colorScheme="green"
            isChecked={car.sentry_security ?? false}
            onChange={(e) => onChange("sentry_security", e.target.checked)}
          />
        </FormControl>
      </SimpleGrid>
      <Text fontSize="xs" fontWeight="600" mb={2}>
        Sentry Details
      </Text>
      <DictEditor
        value={car.sentry_details}
        onChange={(v) => onChange("sentry_details", v)}
        keyLabel="Feature"
        valueLabel="Detail"
      />
    </>
  );
}
