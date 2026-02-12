import { FormControl, FormLabel, Input, Switch, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import DictEditor from "../shared/DictEditor";
import ListEditor from "../shared/ListEditor";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function FeaturesSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={4}>
        <FormControl>
          <FormLabel fontSize="xs">Full Adult Seats</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.number_of_full_adult_seats ?? ""}
            onChange={(e) => onChange("number_of_full_adult_seats", parseInt(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Passenger Doors</FormLabel>
          <Input
            size="sm"
            type="number"
            value={car.number_of_passenger_doors ?? ""}
            onChange={(e) => onChange("number_of_passenger_doors", parseInt(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="xs">Frunk Capacity (cu-ft)</FormLabel>
          <Input
            size="sm"
            type="number"
            step="0.1"
            value={car.frunk_capacity ?? ""}
            onChange={(e) => onChange("frunk_capacity", parseFloat(e.target.value) || null)}
            borderColor={borderColor}
          />
        </FormControl>
        <FormControl display="flex" alignItems="center" pt={6}>
          <FormLabel fontSize="xs" mb={0}>Keyless Entry</FormLabel>
          <Switch
            colorScheme="green"
            isChecked={car.keyless ?? false}
            onChange={(e) => onChange("keyless", e.target.checked)}
          />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel fontSize="xs" mb={0}>Has Spare Tire</FormLabel>
          <Switch
            colorScheme="green"
            isChecked={car.has_spare_tire ?? false}
            onChange={(e) => onChange("has_spare_tire", e.target.checked)}
          />
        </FormControl>
      </SimpleGrid>

      <Text fontSize="xs" fontWeight="600" mb={2}>
        Drive Assist Features
      </Text>
      <ListEditor
        value={car.drive_assist_features}
        onChange={(v) => onChange("drive_assist_features", v)}
        placeholder="Add feature"
      />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Towing Details
      </Text>
      <DictEditor value={car.towing_details} onChange={(v) => onChange("towing_details", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Camping Features
      </Text>
      <DictEditor value={car.camping_features} onChange={(v) => onChange("camping_features", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Dog Mode
      </Text>
      <DictEditor value={car.dog_mode} onChange={(v) => onChange("dog_mode", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Seating Details
      </Text>
      <DictEditor value={car.seating_details} onChange={(v) => onChange("seating_details", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Infotainment
      </Text>
      <DictEditor value={car.infotainment_details} onChange={(v) => onChange("infotainment_details", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Ambient Lighting
      </Text>
      <DictEditor value={car.interior_ambient_lighting_details} onChange={(v) => onChange("interior_ambient_lighting_details", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Remote Heating/Cooling
      </Text>
      <DictEditor value={car.remote_heating_cooling} onChange={(v) => onChange("remote_heating_cooling", v)} />

      <Text fontSize="xs" fontWeight="600" mt={4} mb={2}>
        Vehicle Sound
      </Text>
      <DictEditor value={car.vehicle_sound_details} onChange={(v) => onChange("vehicle_sound_details", v)} />
    </>
  );
}
