import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  VStack,
  Spinner,
  Center,
  useColorModeValue,
  Box,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useCompare } from "../contexts/CompareContext";
import useMultipleCarDetails from "../hooks/useMultipleCarDetails";
import { formatPrice } from "../utils/formatPrice";
import { useMemo } from "react";

interface SpecRow {
  label: string;
  key: string;
  format?: (value: any) => string;
  highlight?: "highest" | "lowest";
}

const ComparisonModal = () => {
  const { isCompareModalOpen, closeCompareModal, selectedCars } = useCompare();
  const carIds = useMemo(() => selectedCars.map((c) => c.id), [selectedCars]);
  const { data: carsDetails, isLoading, error } = useMultipleCarDetails(carIds);

  const headerBg = useColorModeValue("gray.100", "gray.700");
  const highlightBg = useColorModeValue("green.100", "green.900");

  // Responsive values
  const imageHeight = useBreakpointValue({ base: "60px", md: "100px" });
  const imageWidth = useBreakpointValue({ base: "80px", md: "150px" });
  const columnMinWidth = useBreakpointValue({ base: "100px", md: "200px" });
  const headerFontSize = useBreakpointValue({ base: "xs", md: "md" });
  const cellFontSize = useBreakpointValue({ base: "xs", md: "sm" });
  const showBadge = useBreakpointValue({ base: false, md: true });
  const tableSize = useBreakpointValue({ base: "xs", md: "sm" }) as "xs" | "sm";

  const specRows: SpecRow[] = [
    {
      label: "Price",
      key: "current_price",
      format: (v) => (v ? formatPrice(v) : "N/A"),
      highlight: "lowest",
    },
    {
      label: "EPA Range",
      key: "epa_range",
      format: (v) => (v ? `${v} mi` : "N/A"),
      highlight: "highest",
    },
    {
      label: "0-60 mph",
      key: "acceleration_0_60",
      format: (v) => (v ? `${v} sec` : "N/A"),
      highlight: "lowest",
    },
    {
      label: "Top Speed",
      key: "top_speed",
      format: (v) => (v ? `${v} mph` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Power",
      key: "power",
      format: (v) => (v ? `${v} hp` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Torque",
      key: "torque",
      format: (v) => (v ? `${v} lb-ft` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Drive Type",
      key: "drive_type",
      format: (v) => v || "N/A",
    },
    {
      label: "Battery Capacity",
      key: "battery_capacity",
      format: (v) => (v ? `${v} kWh` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Max Charging Speed",
      key: "battery_max_charging_speed",
      format: (v) => (v ? `${v} kW` : "N/A"),
      highlight: "highest",
    },
    {
      label: "NHTSA Rating",
      key: "nhtsa_rating",
      format: (v) => (v ? `${v} Stars` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Euro NCAP Rating",
      key: "euroncap_rating",
      format: (v) => (v ? `${v} Stars` : "N/A"),
      highlight: "highest",
    },
    {
      label: "Frunk Capacity",
      key: "frunk_capacity",
      format: (v) => (v ? `${v} cu-ft` : "None"),
      highlight: "highest",
    },
    {
      label: "Spare Tire",
      key: "has_spare_tire",
      format: (v) => (v ? "Yes" : "No"),
    },
    {
      label: "Bidirectional Charging",
      key: "bidirectional_details",
      format: (v) => (v ? "Yes" : "No"),
    },
    {
      label: "Vehicle Class",
      key: "vehicle_class",
      format: (v) => v || "N/A",
    },
  ];

  const getBestValue = (
    key: string,
    type: "highest" | "lowest"
  ): number | null => {
    const values = carsDetails
      .map((car: any) => car[key])
      .filter((v) => v !== null && v !== undefined && typeof v === "number");

    if (values.length === 0) return null;

    return type === "highest" ? Math.max(...values) : Math.min(...values);
  };

  const isBestValue = (
    value: any,
    key: string,
    type?: "highest" | "lowest"
  ): boolean => {
    if (!type || value === null || value === undefined) return false;
    const best = getBestValue(key, type);
    return best !== null && value === best;
  };

  return (
    <Modal
      isOpen={isCompareModalOpen}
      onClose={closeCompareModal}
      size="full"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Vehicle Comparison</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading ? (
            <Center h="400px">
              <VStack>
                <Spinner size="xl" color="green.500" />
                <Text>Loading vehicle details...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Center h="400px">
              <Text color="red.500">Error: {error}</Text>
            </Center>
          ) : carsDetails.length === 0 ? (
            <Center h="400px">
              <Text>No vehicles to compare</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size={tableSize}>
                <Thead>
                  <Tr>
                    <Th
                      bg={headerBg}
                      position="sticky"
                      left={0}
                      zIndex={1}
                      fontSize={cellFontSize}
                      px={{ base: 2, md: 4 }}
                    >
                      Spec
                    </Th>
                    {carsDetails.map((car) => (
                      <Th key={car.id} textAlign="center" minW={columnMinWidth} px={{ base: 1, md: 4 }}>
                        <VStack spacing={1}>
                          <Image
                            src={car.image_url}
                            alt={`${car.make_name} ${car.model}`}
                            h={imageHeight}
                            w={imageWidth}
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <Text fontSize={headerFontSize} fontWeight="bold" noOfLines={1}>
                            {car.make_name}
                          </Text>
                          <Text fontSize={cellFontSize} noOfLines={1}>
                            {car.model}
                          </Text>
                        </VStack>
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {specRows.map((spec) => (
                    <Tr key={spec.key}>
                      <Td
                        fontWeight="bold"
                        bg={headerBg}
                        position="sticky"
                        left={0}
                        zIndex={1}
                        fontSize={cellFontSize}
                        px={{ base: 2, md: 4 }}
                        whiteSpace="nowrap"
                      >
                        {spec.label}
                      </Td>
                      {carsDetails.map((car: any) => {
                        const value = car[spec.key];
                        const isBest = isBestValue(value, spec.key, spec.highlight);
                        return (
                          <Td
                            key={car.id}
                            textAlign="center"
                            bg={isBest ? highlightBg : undefined}
                            position="relative"
                            fontSize={cellFontSize}
                            px={{ base: 1, md: 4 }}
                          >
                            {spec.format ? spec.format(value) : value}
                            {isBest && showBadge && (
                              <Badge
                                colorScheme="green"
                                ml={1}
                                fontSize="2xs"
                              >
                                Best
                              </Badge>
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                  {/* Charging Options Row */}
                  <Tr>
                    <Td
                      fontWeight="bold"
                      bg={headerBg}
                      position="sticky"
                      left={0}
                      zIndex={1}
                      fontSize={cellFontSize}
                      px={{ base: 2, md: 4 }}
                      whiteSpace="nowrap"
                    >
                      Charging
                    </Td>
                    {carsDetails.map((car) => (
                      <Td key={car.id} textAlign="center" fontSize={cellFontSize} px={{ base: 1, md: 4 }}>
                        {car.chargers && car.chargers.length > 0 ? (
                          <VStack spacing={0} align="center">
                            {car.chargers.slice(0, 2).map((charger, idx) => (
                              <Text key={idx} fontSize="2xs" noOfLines={1}>
                                {charger}
                              </Text>
                            ))}
                            {car.chargers.length > 2 && (
                              <Text fontSize="2xs" color="gray.500">
                                +{car.chargers.length - 2} more
                              </Text>
                            )}
                          </VStack>
                        ) : (
                          "N/A"
                        )}
                      </Td>
                    ))}
                  </Tr>
                  {/* Average Rating Row */}
                  <Tr>
                    <Td
                      fontWeight="bold"
                      bg={headerBg}
                      position="sticky"
                      left={0}
                      zIndex={1}
                      fontSize={cellFontSize}
                      px={{ base: 2, md: 4 }}
                      whiteSpace="nowrap"
                    >
                      Rating
                    </Td>
                    {carsDetails.map((car) => {
                      const rating = car.average_rating;
                      const values = carsDetails
                        .map((c) => c.average_rating)
                        .filter((v) => v !== null && v !== undefined);
                      const best = values.length > 0 ? Math.max(...values) : null;
                      const isBest = rating !== null && rating === best;
                      return (
                        <Td
                          key={car.id}
                          textAlign="center"
                          bg={isBest ? highlightBg : undefined}
                          fontSize={cellFontSize}
                          px={{ base: 1, md: 4 }}
                        >
                          {rating ? rating.toFixed(1) : "N/A"}
                          {isBest && showBadge && (
                            <Badge colorScheme="green" ml={1} fontSize="2xs">
                              Best
                            </Badge>
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ComparisonModal;
