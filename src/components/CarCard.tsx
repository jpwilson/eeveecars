import {
  Card,
  CardBody,
  VStack,
  Heading,
  Image,
  Text,
  Checkbox,
  Box,
  useToast,
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
    <>
      <Box position="relative">
        <Image
          src={car.image_url}
          height="200px"
          width="full"
          objectFit="cover"
          opacity={isCompareMode && selected ? 0.8 : 1}
        />
        {isCompareMode && (
          <Box
            position="absolute"
            top={2}
            right={2}
            onClick={handleCheckboxChange}
            cursor="pointer"
            bg={selected ? "green.500" : "whiteAlpha.900"}
            borderRadius="md"
            p={1}
          >
            <Checkbox
              isChecked={selected}
              colorScheme="green"
              size="lg"
              pointerEvents="none"
            />
          </Box>
        )}
        {isCompareMode && selected && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            border="3px solid"
            borderColor="green.500"
            pointerEvents="none"
          />
        )}
      </Box>
      <CardBody>
        <Heading fontSize={"2xl"}>
          {car.make_name} {car.model}
        </Heading>
        <VStack justifyContent="space-between" padding="10px">
          <Text fontSize="xs" fontWeight="bold">
            Price est: {formatPrice(car.current_price)}
          </Text>
          <Text fontSize="xs" fontWeight="bold">
            Range: {car.epa_range} mi
          </Text>
          <Text fontSize="xs" fontWeight="bold">
            Avg rating: <CarScore score={car.average_rating} />
          </Text>
        </VStack>
      </CardBody>
    </>
  );

  // In compare mode, clicking the card toggles selection instead of navigating
  if (isCompareMode) {
    return (
      <Card
        cursor="pointer"
        onClick={handleCheckboxChange}
        _hover={{ transform: "scale(1.02)", transition: "transform 0.2s" }}
        border={selected ? "3px solid" : "none"}
        borderColor={selected ? "green.500" : "transparent"}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card>
      <Link to={`model_detail/${car.make_model_slug}`}>
        {cardContent}
      </Link>
    </Card>
  );
};

export default CarCard;
