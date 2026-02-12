import { useState, useMemo } from "react";
import {
  Box,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Spinner,
  Select,
} from "@chakra-ui/react";

export interface CarListItem {
  id: number;
  make_name: string | null;
  model: string;
  submodel: string | null;
  generation: string | null;
  is_model_rep: boolean;
  image_url: string | null;
  availability_desc: string | null;
}

interface Props {
  cars: CarListItem[];
  isLoading: boolean;
  selectedCarId: number | null;
  onSelect: (id: number) => void;
}

export default function AdminCarPicker({ cars, isLoading, selectedCarId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [makeFilter, setMakeFilter] = useState("");

  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.7)");
  const borderColor = useColorModeValue("rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)");
  const hoverBg = useColorModeValue("rgba(22,163,74,0.06)", "rgba(22,163,74,0.12)");
  const selectedBg = useColorModeValue("rgba(22,163,74,0.12)", "rgba(22,163,74,0.2)");

  const makes = useMemo(() => {
    const set = new Set(cars.map((c) => c.make_name).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [cars]);

  const filtered = useMemo(() => {
    let result = cars;
    if (makeFilter) {
      result = result.filter((c) => c.make_name === makeFilter);
    }
    if (search) {
      const term = search.toLowerCase();
      result = result.filter((c) => {
        const label = `${c.make_name ?? ""} ${c.model} ${c.submodel ?? ""} ${c.generation ?? ""}`.toLowerCase();
        return label.includes(term) || String(c.id).includes(term);
      });
    }
    return result;
  }, [cars, search, makeFilter]);

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={borderColor}
      borderRadius="16px"
      p={4}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Text fontWeight="600" fontSize="sm" mb={3}>
        Vehicles ({filtered.length})
      </Text>
      <Select
        size="sm"
        mb={2}
        placeholder="All makes"
        value={makeFilter}
        onChange={(e) => setMakeFilter(e.target.value)}
        borderColor={borderColor}
      >
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Input
        size="sm"
        placeholder="Search by name or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={3}
        borderColor={borderColor}
        _focus={{ borderColor: "#16a34a", boxShadow: "0 0 0 1px #16a34a" }}
      />
      {isLoading && (
        <Box textAlign="center" py={8}>
          <Spinner color="#16a34a" />
        </Box>
      )}
      <VStack
        align="stretch"
        spacing={0}
        overflowY="auto"
        flex="1"
        maxH="calc(100vh - 320px)"
      >
        {filtered.map((car) => (
          <Box
            key={car.id}
            px={3}
            py={2}
            cursor="pointer"
            borderRadius="8px"
            bg={car.id === selectedCarId ? selectedBg : "transparent"}
            _hover={{ bg: car.id === selectedCarId ? selectedBg : hoverBg }}
            onClick={() => onSelect(car.id)}
            borderLeft={car.id === selectedCarId ? "3px solid #16a34a" : "3px solid transparent"}
          >
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="500" noOfLines={1}>
                  {car.make_name ?? "?"} {car.model}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {[car.submodel, car.generation].filter(Boolean).join(" - ") || "Base"}
                </Text>
              </Box>
              <VStack spacing={0} align="end">
                <Text fontSize="xs" color="gray.400">
                  #{car.id}
                </Text>
                {car.is_model_rep && (
                  <Badge fontSize="9px" colorScheme="green" borderRadius="full" px={1}>
                    REP
                  </Badge>
                )}
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
