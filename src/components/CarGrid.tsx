import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars, { SelectedFeature } from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";

import { FaSadTear } from "react-icons/fa";
import { SortOption } from "../types/types";

interface Props {
  selectedMake: Make | null;
  selectedFeatures: SelectedFeature[];
  sortOption: SortOption;
  searchTerm: string;
  showDiscontinuedCars?: boolean;
  showComingSoonCars?: boolean;
}

const CarGrid = ({
  selectedMake,
  selectedFeatures,
  sortOption,
  searchTerm,
  showDiscontinuedCars,
  showComingSoonCars,
}: Props) => {
  const { data, error, isLoading } = useCars(
    selectedMake,
    selectedFeatures,
    searchTerm,
    showDiscontinuedCars,
    showComingSoonCars
  );
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  //Car ordering code:

  const getSortedData = () => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
      // Prioritize consumer vehicles over semi-trucks
      if (
        a.vehicle_class !== "Semi-Truck" &&
        b.vehicle_class === "Semi-Truck"
      ) {
        return -1; // 'a' should come before 'b'
      } else if (
        a.vehicle_class === "Semi-Truck" &&
        b.vehicle_class !== "Semi-Truck"
      ) {
        return 1; // 'a' should come after 'b'
      }

      let valueA = a[sortOption.field];
      let valueB = b[sortOption.field];
      const sortMultiplier = sortOption.direction === "asc" ? 1 : -1;

      // Treat null as 0 for sorting purposes
      valueA = valueA === null ? 0 : valueA;
      valueB = valueB === null ? 0 : valueB;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * sortMultiplier;
      } else if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * sortMultiplier;
      } else {
        console.error(
          "Trying to sort on incompatible or non-numeric/string fields",
          {
            valueA,
            valueB,
            sortOption,
          }
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
        px={10}
        pb={10}
        pt={2}
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
            <Text>
              No cars meet the filtering you have selected. Or... this brand has
              not yet released a full EV in your market. We will keep the brand
              here, in the hopes that one day they do join the EV party.
            </Text>
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
