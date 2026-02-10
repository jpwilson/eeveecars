import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars, { SelectedFeature } from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";

import { FaSadTear } from "react-icons/fa";
import { SortOption } from "../types/types";

// Rough US EV market popularity ranking by brand (based on sales volume)
// Lower number = more popular/higher sales. Brands not listed default to 99.
const BRAND_POPULARITY: Record<string, number> = {
  Tesla: 1,
  Chevrolet: 2,
  Ford: 3,
  Hyundai: 4,
  BMW: 5,
  KIA: 6,
  "Mercedes-Benz": 7,
  Mercedes: 7,
  Rivian: 8,
  Cadillac: 9,
  VW: 10,
  Volkswagen: 10,
  Toyota: 11,
  Nissan: 12,
  Volvo: 13,
  Polestar: 14,
  Lucid: 15,
  Genesis: 16,
  Subaru: 17,
  GMC: 18,
  Porsche: 19,
  Audi: 20,
  Mini: 21,
  Jaguar: 22,
  Lexus: 23,
  Mazda: 24,
  "Rolls-Royce": 25,
  Rimac: 26,
  BYD: 30,
  NIO: 31,
  XPeng: 32,
  Geely: 33,
  Renault: 34,
  "Citroën": 35,
  Fisker: 90,
  Canoo: 91,
};

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
        return -1;
      } else if (
        a.vehicle_class === "Semi-Truck" &&
        b.vehicle_class !== "Semi-Truck"
      ) {
        return 1;
      }

      // Popularity sort: by brand rank, then by price within same brand
      if (sortOption.field === "popularity") {
        const rankA = BRAND_POPULARITY[a.make_name] ?? 99;
        const rankB = BRAND_POPULARITY[b.make_name] ?? 99;
        if (rankA !== rankB) return rankA - rankB;
        return (a.current_price ?? 0) - (b.current_price ?? 0);
      }

      let valueA = a[sortOption.field];
      let valueB = b[sortOption.field];
      const sortMultiplier = sortOption.direction === "asc" ? 1 : -1;

      valueA = valueA === null ? 0 : valueA;
      valueB = valueB === null ? 0 : valueB;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * sortMultiplier;
      } else if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * sortMultiplier;
      } else {
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
