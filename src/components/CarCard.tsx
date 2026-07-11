import {
  Box,
  VStack,
  Heading,
  Image,
  Text,
  Checkbox,
  HStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { Car } from "../hooks/useCars";
import CarScore from "./CarScore";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";
import { useCompare } from "../contexts/CompareContext";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  const {
    isCompareMode,
    isCarSelected,
    addCar,
    removeCar,
    canAddMore,
    maxCars,
  } = useCompare();
  const toast = useToast();

  const selected = isCarSelected(car.id);

  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.7)",
    "rgba(45, 55, 72, 0.8)"
  );
  const cardHoverBg = useColorModeValue(
    "rgba(255, 255, 255, 0.92)",
    "rgba(45, 55, 72, 0.95)"
  );
  const borderColor = useColorModeValue(
    "rgba(34, 197, 94, 0.12)",
    "rgba(34, 197, 94, 0.25)"
  );
  const borderHoverColor = useColorModeValue(
    "rgba(34, 197, 94, 0.35)",
    "rgba(34, 197, 94, 0.5)"
  );
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const shadowBase = useColorModeValue(
    "0 2px 12px rgba(0, 0, 0, 0.05)",
    "0 2px 12px rgba(0, 0, 0, 0.3)"
  );
  const shadowHover = useColorModeValue(
    "0 12px 40px rgba(22, 163, 74, 0.1)",
    "0 12px 40px rgba(22, 163, 74, 0.2)"
  );

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selected) {
      removeCar(car.id);
    } else {
      const added = addCar(car);
      if (!added) {
        toast({
          title: "Selection limit reached",
          description: `You can only compare up to ${maxCars} vehicles. Remove one to add another.`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const cardContent = (
    <Box
      bg={cardBg}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={selected ? "green.500" : borderColor}
      borderRadius="16px"
      overflow="hidden"
      boxShadow={shadowBase}
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: shadowHover,
        borderColor: selected ? "green.500" : borderHoverColor,
        bg: cardHoverBg,
      }}
      cursor="pointer"
      position="relative"
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={car.image_url}
          alt={`${car.make_name} ${car.model}`}
          loading="lazy"
          height="180px"
          width="full"
          objectFit="cover"
          opacity={isCompareMode && selected ? 0.8 : 1}
          transition="transform 0.4s ease"
        />
        {car.vehicle_class && car.vehicle_class !== "N/A" && (
          <Box
            position="absolute"
            top={3}
            left={3}
            bg="blackAlpha.600"
            color="white"
            fontSize="10px"
            fontWeight="600"
            letterSpacing="0.03em"
            textTransform="uppercase"
            px={2}
            py={0.5}
            borderRadius="6px"
            backdropFilter="blur(8px)"
          >
            {car.vehicle_class}
          </Box>
        )}
        {!isCompareMode && car.average_rating ? (
          <Box position="absolute" top={3} right={3}>
            <CarScore score={car.average_rating} />
          </Box>
        ) : null}
        {isCompareMode && (
          <Box
            position="absolute"
            top={3}
            right={3}
            onClick={handleCheckboxChange}
            cursor="pointer"
            bg={selected ? "green.500" : "whiteAlpha.900"}
            borderRadius="8px"
            p={1}
            boxShadow="0 2px 8px rgba(0,0,0,0.15)"
          >
            <Checkbox
              isChecked={selected}
              colorScheme="green"
              size="lg"
              pointerEvents="none"
            />
          </Box>
        )}
      </Box>

      <Box p={5}>
        <Heading
          fontSize="lg"
          fontWeight="600"
          color={textColor}
          letterSpacing="-0.01em"
          mb={1}
          noOfLines={1}
        >
          {car.make_name} {car.model}
        </Heading>
        <HStack spacing={1} mb={3} align="baseline">
          <Text fontSize="xs" color={subTextColor} fontWeight="500">
            From
          </Text>
          <Text fontSize="md" fontWeight="700" color="green.500">
            {formatPrice(car.current_price)}
          </Text>
        </HStack>
        <HStack spacing={0} align="stretch">
          {[
            { value: car.epa_range ? `${car.epa_range}` : "—", label: "mi range" },
            {
              value: car.acceleration_0_60 ? `${car.acceleration_0_60}s` : "—",
              label: "0–60 mph",
            },
            { value: car.top_speed ? `${car.top_speed}` : "—", label: "mph top" },
          ].map((stat, i) => (
            <VStack
              key={stat.label}
              spacing={0}
              flex={1}
              borderLeft={i > 0 ? "1px solid" : "none"}
              borderColor="rgba(128,128,128,0.15)"
            >
              <Text fontSize="sm" fontWeight="700" color={textColor}>
                {stat.value}
              </Text>
              <Text fontSize="10px" color={subTextColor} fontWeight="500">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );

  if (isCompareMode) {
    return (
      <Box role="group" onClick={handleCheckboxChange}>
        {cardContent}
      </Box>
    );
  }

  return (
    <Box role="group">
      <Link to={`model_detail/${car.make_model_slug}`}>{cardContent}</Link>
    </Box>
  );
};

export default CarCard;
