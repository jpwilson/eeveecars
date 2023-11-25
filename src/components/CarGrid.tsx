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
      switch (sortOption) {
        case "current_price":
          // current_price is a number, so we can compare directly
          return a.current_price - b.current_price;
        case "epa_range":
          // epa_range is a number, so we can compare directly
          return a.epa_range - b.epa_range;
        case "acceleration_0_60":
          // acceleration_0_60 is a number, so we can compare directly
          return a.acceleration_0_60 - b.acceleration_0_60;
        case "top_speed":
          // top_speed is a number, so we can compare directly
          return a.top_speed - b.top_speed;
        case "average_rating":
          // average_rating is a number, so we can compare directly
          return a.average_rating - b.average_rating;
        // Add cases for other numerical properties if needed
        default:
          return 0;
      }
    });
  };

  const sortedData = getSortedData();
  // end of car sort ordeing logic
  console.log("Here is the sort option: " + sortOption);
  console.log("Sorted data: ", sortedData.slice(0, 5)); // Log the first 5 cars to check sorting
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
