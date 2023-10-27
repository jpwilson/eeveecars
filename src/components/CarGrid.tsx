import { SimpleGrid, Text } from "@chakra-ui/react";
import useCars from "../hooks/useCars";
import CarCard from "./CarCard";

const CarGrid = () => {
  const { cars, error } = useCars();
  return (
    <>
      {error && <Text>{error}</Text>}
      <SimpleGrid
        columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
        spacing={10}
        padding={10}
      >
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
