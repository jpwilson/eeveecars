import { SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import useCars from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";

const CarGrid = () => {
  const { cars, error, isLoading } = useCars();
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <>
      {error && <Text>{error}</Text>}
      <SimpleGrid
        columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
        spacing={10}
        padding={10}
      >
        {isLoading &&
          skeletons.map((skeleton) => <CarCardSkeleton key={skeleton} />)}
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
