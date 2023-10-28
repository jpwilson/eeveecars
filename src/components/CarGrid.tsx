import { SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import useCars from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";

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
          skeletons.map((skeleton) => (
            <CarCardContainer>
              <CarCardSkeleton key={skeleton} />
            </CarCardContainer>
          ))}
        {cars.map((car) => (
          <CarCardContainer>
            <CarCard key={car.id} car={car} />
          </CarCardContainer>
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
