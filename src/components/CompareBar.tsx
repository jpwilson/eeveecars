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
        p={4}
      >
        <VStack spacing={3}>
          <Text fontWeight="bold" color="gray.500">
            {getMessage()}
          </Text>

          <HStack spacing={4} justify="center" wrap="wrap">
            {selectedCars.map((car) => (
              <Box
                key={car.id}
                position="relative"
                borderRadius="md"
                overflow="hidden"
                border="2px solid"
                borderColor="green.500"
              >
                <Image
                  src={car.image_url}
                  alt={`${car.make_name} ${car.model}`}
                  h="60px"
                  w="100px"
                  objectFit="cover"
                />
                <IconButton
                  aria-label={`Remove ${car.make_name} ${car.model}`}
                  icon={<CloseIcon />}
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => removeCar(car.id)}
                />
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textAlign="center"
                  bg="blackAlpha.700"
                  color="white"
                  p={1}
                  noOfLines={1}
                >
                  {car.make_name} {car.model}
                </Text>
              </Box>
            ))}

            {/* Empty slots */}
            {Array.from({ length: remaining }).map((_, index) => (
              <Box
                key={`empty-${index}`}
                h="60px"
                w="100px"
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
            ))}
          </HStack>

          <HStack spacing={4}>
            {selectedCars.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={clearSelection}
              >
                Clear All
              </Button>
            )}
            <Button
              size="lg"
              colorScheme="green"
              isDisabled={!canCompare}
              onClick={openCompareModal}
            >
              {canCompare
                ? `Compare ${selectedCars.length} Vehicles`
                : "Select at least 2 vehicles"}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Slide>
  );
};

export default CompareBar;
