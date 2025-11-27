import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Image,
  IconButton,
  useColorModeValue,
  Slide,
  useBreakpointValue,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useCompare } from "../contexts/CompareContext";

const CompareBar = () => {
  const {
    isCompareMode,
    selectedCars,
    maxCars,
    removeCar,
    clearSelection,
    openCompareModal,
  } = useCompare();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Responsive values
  const thumbnailWidth = useBreakpointValue({ base: "70px", md: "100px" });
  const thumbnailHeight = useBreakpointValue({ base: "45px", md: "60px" });
  const compareButtonSize = useBreakpointValue({ base: "md", md: "lg" });
  const showEmptySlots = useBreakpointValue({ base: false, md: true });
  const padding = useBreakpointValue({ base: 2, md: 4 });

  if (!isCompareMode) return null;

  const canCompare = selectedCars.length >= 2;
  const remaining = maxCars - selectedCars.length;

  const getMessage = () => {
    if (selectedCars.length === 0) {
      return `Select up to ${maxCars} vehicles to compare`;
    }
    if (selectedCars.length === 1) {
      return `Select at least 1 more vehicle (up to ${remaining} more)`;
    }
    if (remaining > 0) {
      return `${selectedCars.length} selected. You can add ${remaining} more`;
    }
    return `${selectedCars.length} vehicles selected`;
  };

  return (
    <Slide direction="bottom" in={isCompareMode} style={{ zIndex: 1000 }}>
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={bgColor}
        borderTop="1px solid"
        borderColor={borderColor}
        boxShadow="0 -4px 12px rgba(0, 0, 0, 0.15)"
        p={padding}
      >
        <VStack spacing={{ base: 2, md: 3 }}>
          <Text fontWeight="bold" color="gray.500" fontSize={{ base: "sm", md: "md" }} textAlign="center">
            {getMessage()}
          </Text>

          <Wrap spacing={{ base: 2, md: 4 }} justify="center">
            {selectedCars.map((car) => (
              <WrapItem key={car.id}>
                <Box
                  position="relative"
                  borderRadius="md"
                  overflow="hidden"
                  border="2px solid"
                  borderColor="green.500"
                >
                  <Image
                    src={car.image_url}
                    alt={`${car.make_name} ${car.model}`}
                    h={thumbnailHeight}
                    w={thumbnailWidth}
                    objectFit="cover"
                  />
                  <IconButton
                    aria-label={`Remove ${car.make_name} ${car.model}`}
                    icon={<CloseIcon boxSize={{ base: 2, md: 3 }} />}
                    size="xs"
                    colorScheme="red"
                    position="absolute"
                    top={0}
                    right={0}
                    minW={{ base: "18px", md: "24px" }}
                    h={{ base: "18px", md: "24px" }}
                    onClick={() => removeCar(car.id)}
                  />
                  <Text
                    fontSize={{ base: "2xs", md: "xs" }}
                    fontWeight="bold"
                    textAlign="center"
                    bg="blackAlpha.700"
                    color="white"
                    p={0.5}
                    noOfLines={1}
                  >
                    {car.make_name} {car.model}
                  </Text>
                </Box>
              </WrapItem>
            ))}

            {/* Empty slots - only on larger screens */}
            {showEmptySlots && Array.from({ length: remaining }).map((_, index) => (
              <WrapItem key={`empty-${index}`}>
                <Box
                  h={thumbnailHeight}
                  w={thumbnailWidth}
                  borderRadius="md"
                  border="2px dashed"
                  borderColor="gray.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" color="gray.500">
                    + Add
                  </Text>
                </Box>
              </WrapItem>
            ))}
          </Wrap>

          <HStack spacing={{ base: 2, md: 4 }}>
            {selectedCars.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={clearSelection}
              >
                Clear
              </Button>
            )}
            <Button
              size={compareButtonSize}
              colorScheme="green"
              isDisabled={!canCompare}
              onClick={openCompareModal}
            >
              {canCompare
                ? `Compare (${selectedCars.length})`
                : "Select 2+"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Slide>
  );
};

export default CompareBar;
