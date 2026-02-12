import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  SimpleGrid,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function AvailabilitySection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">Availability Status</FormLabel>
          <Select
            size="sm"
            value={car.availability_desc ?? ""}
            onChange={(e) => onChange("availability_desc", e.target.value || null)}
            borderColor={borderColor}
          >
            <option value="">None</option>
            <option value="available">Available</option>
            <option value="Not yet released">Not Yet Released</option>
            <option value="discontinued">Discontinued</option>
            <option value="previous_generation">Previous Generation</option>
          </Select>
        </FormControl>
        <FormControl display="flex" alignItems="center" pt={6}>
          <FormLabel fontSize="xs" mb={0}>
            In Production
          </FormLabel>
          <Switch
            colorScheme="green"
            isChecked={car.production_availability ?? false}
            onChange={(e) => onChange("production_availability", e.target.checked)}
          />
        </FormControl>
      </SimpleGrid>
      <Text fontSize="xs" fontWeight="600" mt={2} mb={2}>
        Available Countries (region: [countries])
      </Text>
      <Text fontSize="xs" color="gray.500" mb={2}>
        Format: key = region name, value = comma-separated country codes
      </Text>
      {/* Simple key-value for now; countries is Dict[str, List[str]] but we'll flatten */}
      <SimpleGrid columns={1} spacing={2}>
        {Object.entries(car.available_countries ?? {}).map(([region, countries]) => (
          <FormControl key={region}>
            <FormLabel fontSize="xs">{region}</FormLabel>
            <Input
              size="sm"
              value={Array.isArray(countries) ? (countries as string[]).join(", ") : ""}
              onChange={(e) => {
                const next = { ...(car.available_countries ?? {}) };
                next[region] = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                onChange("available_countries", next);
              }}
              borderColor={borderColor}
              placeholder="US, CA, UK"
            />
          </FormControl>
        ))}
      </SimpleGrid>
    </>
  );
}
