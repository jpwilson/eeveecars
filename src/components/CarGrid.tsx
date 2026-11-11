import { SimpleGrid, Text, Flex, Icon } from "@chakra-ui/react";
import { SelectedFeature } from "../hooks/useCars";
import useHomeCars from "../hooks/useHomeCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { CatalogMakeSummary } from "../types/catalog";
import { popularityRank } from "../data/popularity";

import { FaSadTear } from "react-icons/fa";
import { SortOption } from "../types/types";

interface Props {
  market: string;
  selectedMake: CatalogMakeSummary | null;
  selectedFeatures: SelectedFeature[];
  sortOption: SortOption;
  searchTerm: string;
  showDiscontinuedCars?: boolean;
  showComingSoonCars?: boolean;
}

const CarGrid = ({
  market,
  selectedMake,
  selectedFeatures,
  sortOption,
  searchTerm,
  showDiscontinuedCars,
  showComingSoonCars,
}: Props) => {
  const { data, error, isLoading } = useHomeCars(
    market,
    selectedMake,
    selectedFeatures,
    searchTerm,
    showDiscontinuedCars,
    showComingSoonCars
  );
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getSortedData = () => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
      // Consumer vehicles before commercial ones (vans, semis, robotaxis)
      const ca = a.catalog?.is_commercial ? 1 : 0;
      const cb = b.catalog?.is_commercial ? 1 : 0;
      if (ca !== cb) return ca - cb;

      // Popularity sort: model-level ranking, interleaved across brands
      if (sortOption.field === "popularity") {
        return (
          popularityRank(a.make_model_slug, a.catalog?.make?.slug) -
          popularityRank(b.make_model_slug, b.catalog?.make?.slug)
        );
      }

      let valueA = a[sortOption.field];
      let valueB = b[sortOption.field];
      const sortMultiplier = sortOption.direction === "asc" ? 1 : -1;

      // Missing figures always go last, whatever the direction
      const missingA = valueA === null || valueA === undefined || valueA === 0 || valueA === "";
      const missingB = valueB === null || valueB === undefined || valueB === 0 || valueB === "";
      if (missingA !== missingB) return missingA ? 1 : -1;
      valueA = valueA ?? 0;
      valueB = valueB ?? 0;

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

  return (
    <>
      {error && <Text px={10}>{error}</Text>}
      <SimpleGrid
        columns={{ sm: 1, md: 2, lg: 3, xl: 5 }}
        spacing={3}
        px={{ base: 4, md: 10 }}
        pb={10}
        pt={2}
      >
        {isLoading &&
          skeletons.map((skeleton) => (
            <CarCardContainer key={skeleton}>
              <CarCardSkeleton />
            </CarCardContainer>
          ))}
        {!isLoading && sortedData.length === 0 && (
          <Flex
            textAlign="center"
            fontWeight="bold"
            fontSize="lg"
            m={4}
            w="100%"
          >
            <Text>
              No cars meet the filtering you have selected. Or... this brand has
              not yet released a full EV in this market. Try "Show in feed" for
              upcoming and discontinued models, or another market.
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
          <CarCardContainer key={car.make_model_slug}>
            <CarCard car={car} />
          </CarCardContainer>
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
