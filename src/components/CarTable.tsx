import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Skeleton,
} from "@chakra-ui/react";
import { FaSadTear, FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import useCars, { SelectedFeature } from "../hooks/useCars";
import { Make } from "../hooks/useMakes";
import { formatPrice } from "../utils/formatPrice";
import CarScore from "./CarScore";

interface Props {
  selectedMake: Make | null;
  selectedFeature: SelectedFeature | null;
  searchTerm: string;
}

type SortField =
  | "name"
  | "current_price"
  | "epa_range"
  | "average_rating"
  | "acceleration_0_60"
  | "top_speed"
  | "trim_first_released";

type SortDir = "asc" | "desc";

const CarTable = ({ selectedMake, selectedFeature, searchTerm }: Props) => {
  const { data, error, isLoading } = useCars(
    selectedMake,
    selectedFeature,
    searchTerm
  );

  const [sortField, setSortField] = useState<SortField>("current_price");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const tableBg = useColorModeValue(
    "rgba(255, 255, 255, 0.75)",
    "rgba(45, 55, 72, 0.8)"
  );
  const borderColor = useColorModeValue(
    "rgba(22, 163, 74, 0.12)",
    "rgba(22, 163, 74, 0.25)"
  );
  const headerBg = useColorModeValue(
    "rgba(22, 163, 74, 0.04)",
    "rgba(22, 163, 74, 0.1)"
  );
  const rowHoverBg = useColorModeValue(
    "rgba(22, 163, 74, 0.04)",
    "rgba(22, 163, 74, 0.08)"
  );
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const linkColor = useColorModeValue("#16a34a", "#4ec77f");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return FaSort;
    return sortDir === "asc" ? FaSortUp : FaSortDown;
  };

  const sortedData = (() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;

      if (sortField === "name") {
        const nameA = `${a.make_name} ${a.model}`;
        const nameB = `${b.make_name} ${b.model}`;
        return nameA.localeCompare(nameB) * mult;
      }

      if (sortField === "trim_first_released") {
        const dateA = a.trim_first_released || "";
        const dateB = b.trim_first_released || "";
        return dateA.localeCompare(dateB) * mult;
      }

      const valA = (a[sortField] as number) ?? 0;
      const valB = (b[sortField] as number) ?? 0;
      return (valA - valB) * mult;
    });
  })();

  if (isLoading) {
    return (
      <Box mx={{ base: 3, md: 4 }} mb={4}>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} height="40px" mb={2} borderRadius="8px" />
        ))}
      </Box>
    );
  }

  if (error) return <Text mx={4}>{error}</Text>;

  if (sortedData.length === 0) {
    return (
      <Flex textAlign="center" fontWeight="bold" fontSize="lg" m={4} w="100%">
        <Text>No cars match the current filters.</Text>
        <Icon as={FaSadTear} color="gray.400" ml={2} />
      </Flex>
    );
  }

  const SortHeader = ({
    field,
    children,
    isNumeric,
  }: {
    field: SortField;
    children: React.ReactNode;
    isNumeric?: boolean;
  }) => (
    <Th
      cursor="pointer"
      onClick={() => handleSort(field)}
      _hover={{ color: "#16a34a" }}
      transition="color 0.2s"
      isNumeric={isNumeric}
      fontSize="xs"
      color={sortField === field ? "#16a34a" : subTextColor}
      fontWeight={sortField === field ? "700" : "600"}
      borderColor={borderColor}
      whiteSpace="nowrap"
    >
      <Flex
        align="center"
        justify={isNumeric ? "flex-end" : "flex-start"}
        gap={1}
      >
        {children}
        <Icon
          as={getSortIcon(field)}
          boxSize={3}
          opacity={sortField === field ? 1 : 0.3}
        />
      </Flex>
    </Th>
  );

  return (
    <Box
      mx={{ base: 2, md: 4 }}
      mb={4}
      bg={tableBg}
      backdropFilter="blur(16px)"
      borderRadius="16px"
      border="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
    >
      <Box overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr bg={headerBg}>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="current_price" isNumeric>
                Price
              </SortHeader>
              <SortHeader field="epa_range" isNumeric>
                Range
              </SortHeader>
              <SortHeader field="average_rating" isNumeric>
                Rating
              </SortHeader>
              <SortHeader field="acceleration_0_60" isNumeric>
                0-60
              </SortHeader>
              <SortHeader field="top_speed" isNumeric>
                Top Speed
              </SortHeader>
              <SortHeader field="trim_first_released">Released</SortHeader>
            </Tr>
          </Thead>
          <Tbody>
            {sortedData.map((car) => (
              <Tr
                key={car.id}
                _hover={{ bg: rowHoverBg }}
                transition="background 0.15s"
                cursor="pointer"
              >
                <Td borderColor={borderColor}>
                  <Link to={`model_detail/${car.make_model_slug}`}>
                    <Text
                      color={linkColor}
                      fontWeight="600"
                      fontSize="sm"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {car.make_name} {car.model}
                    </Text>
                  </Link>
                </Td>
                <Td isNumeric borderColor={borderColor}>
                  <Text fontSize="sm" fontWeight="500" color={textColor}>
                    {formatPrice(car.current_price)}
                  </Text>
                </Td>
                <Td isNumeric borderColor={borderColor}>
                  <Text fontSize="sm" color={textColor}>
                    {car.epa_range} mi
                  </Text>
                </Td>
                <Td isNumeric borderColor={borderColor}>
                  <CarScore score={car.average_rating} />
                </Td>
                <Td isNumeric borderColor={borderColor}>
                  <Text fontSize="sm" color={textColor}>
                    {car.acceleration_0_60 ? `${car.acceleration_0_60}s` : "—"}
                  </Text>
                </Td>
                <Td isNumeric borderColor={borderColor}>
                  <Text fontSize="sm" color={textColor}>
                    {car.top_speed ? `${car.top_speed} mph` : "—"}
                  </Text>
                </Td>
                <Td borderColor={borderColor}>
                  <Text fontSize="sm" color={subTextColor}>
                    {car.trim_first_released || "—"}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default CarTable;
