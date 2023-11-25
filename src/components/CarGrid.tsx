import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars, { SelectedFeature } from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";
import { Features } from "../hooks/useFeatures";
import { FaSadTear } from "react-icons/fa";

interface Props {
  selectedMake: Make | null;
  selectedFeature: SelectedFeature | null;
  sortOption: string; // Add this line
}

const CarGrid = ({ selectedMake, selectedFeature, sortOption }: Props) => {
  const { data, error, isLoading } = useCars(selectedMake, selectedFeature);
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  //Car ordering code:

  const getSortedData = () => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const valueA = a[sortOption.field];
      const valueB = b[sortOption.field];
      const sortMultiplier = sortOption.direction === "asc" ? 1 : -1;

      return (valueA - valueB) * sortMultiplier;
    });
  };

  const sortedData = getSortedData();
  // end of car sort ordeing logic

  return (
    <>
      {error && <Text>{error}</Text>}
      <SimpleGrid
        columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
        spacing={3}
        padding={10}
      >
        {isLoading &&
          skeletons.map((skeleton) => (
            <CarCardContainer key={skeleton}>
              <CarCardSkeleton />
            </CarCardContainer>
          ))}
        {sortedData && sortedData.length === 0 && (
          <Flex
            textAlign="center"
            fontWeight="bold"
            fontSize="lg"
            m={4}
            w="100%"
          >
            <Text>No cars meet the filtering you have selected</Text>
            <Icon
              as={FaSadTear}
              size="24px"
              color="gray.600"
              marginLeft="4px"
            />{" "}
          </Flex>
        )}
        {sortedData.map((car) => (
          <CarCardContainer key={car.id}>
            <CarCard car={car} />
          </CarCardContainer>
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
