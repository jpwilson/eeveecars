import { FormControl, FormLabel, Textarea, useColorModeValue } from "@chakra-ui/react";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function DescriptionSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <FormControl mb={4}>
        <FormLabel fontSize="xs">Car Description</FormLabel>
        <Textarea
          size="sm"
          rows={4}
          value={car.car_description ?? ""}
          onChange={(e) => onChange("car_description", e.target.value || null)}
          borderColor={borderColor}
          placeholder="Detailed description of this specific trim/variant..."
          maxLength={5000}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Model Description</FormLabel>
        <Textarea
          size="sm"
          rows={4}
          value={car.model_description ?? ""}
          onChange={(e) => onChange("model_description", e.target.value || null)}
          borderColor={borderColor}
          placeholder="General description of the model line..."
          maxLength={5000}
        />
      </FormControl>
    </>
  );
}
