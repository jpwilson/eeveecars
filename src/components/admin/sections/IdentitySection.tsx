import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function IdentitySection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
      <FormControl>
        <FormLabel fontSize="xs">Make ID</FormLabel>
        <Input
          size="sm"
          type="number"
          value={car.make_id ?? ""}
          onChange={(e) => onChange("make_id", parseInt(e.target.value) || 0)}
          borderColor={borderColor}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Make Name</FormLabel>
        <Input
          size="sm"
          value={car.make_name ?? ""}
          onChange={(e) => onChange("make_name", e.target.value)}
          borderColor={borderColor}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Model</FormLabel>
        <Input
          size="sm"
          value={car.model ?? ""}
          onChange={(e) => onChange("model", e.target.value)}
          borderColor={borderColor}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Submodel</FormLabel>
        <Input
          size="sm"
          value={car.submodel ?? ""}
          onChange={(e) => onChange("submodel", e.target.value || null)}
          borderColor={borderColor}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Generation</FormLabel>
        <Input
          size="sm"
          value={car.generation ?? ""}
          onChange={(e) => onChange("generation", e.target.value || null)}
          borderColor={borderColor}
        />
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Vehicle Class</FormLabel>
        <Select
          size="sm"
          value={car.vehicle_class ?? ""}
          onChange={(e) => onChange("vehicle_class", e.target.value || null)}
          borderColor={borderColor}
        >
          <option value="">None</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Crossover">Crossover</option>
          <option value="Truck">Truck</option>
          <option value="Hatchback">Hatchback</option>
          <option value="Coupe">Coupe</option>
          <option value="Van">Van</option>
          <option value="Semi-Truck">Semi-Truck</option>
          <option value="Sports Car">Sports Car</option>
          <option value="Wagon">Wagon</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="xs">Make/Model Slug</FormLabel>
        <Input
          size="sm"
          value={car.make_model_slug ?? ""}
          onChange={(e) => onChange("make_model_slug", e.target.value || null)}
          borderColor={borderColor}
          placeholder="e.g. tesla-model-y"
        />
      </FormControl>
      <FormControl display="flex" alignItems="center" pt={6}>
        <FormLabel fontSize="xs" mb={0}>
          Is Model Rep
        </FormLabel>
        <Switch
          colorScheme="green"
          isChecked={car.is_model_rep ?? false}
          onChange={(e) => onChange("is_model_rep", e.target.checked)}
        />
      </FormControl>
    </SimpleGrid>
  );
}
