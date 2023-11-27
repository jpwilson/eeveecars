import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars, { SelectedFeature } from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";
import { Car } from "../hooks/useCars";
import { FaSadTear } from "react-icons/fa";

interface SortOption {
  field: keyof Car; // assuming Car is the type with all possible sortable fields
  direction: "asc" | "desc";
}

interface Props {
  selectedMake: Make | null;
  selectedFeature: SelectedFeature | null;
  sortOption: SortOption;
  searchTerm: string;
}

const CarGrid = ({
  selectedMake,
  selectedFeature,
  sortOption,
  searchTerm,
}: Props) => {
  const { data, error, isLoading } = useCars(
    selectedMake,
    selectedFeature,
    searchTerm
  );
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  //Car ordering code:

  const getSortedData = () => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const valueA = a[sortOption.field];
      const valueB = b[sortOption.field];
      const sortMultiplier = sortOption.direction === "asc" ? 1 : -1;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * sortMultiplier;
      } else if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * sortMultiplier;
      } else {
        console.error(
          "Trying to sort on incompatible or non-numeric/string fields"
        );
        return 0;
      }
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
