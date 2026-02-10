import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars, { SelectedFeature } from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";

import { FaSadTear } from "react-icons/fa";
import { SortOption } from "../types/types";

// Model-level popularity ranking based on US EV sales & relevance.
// Interleaves brands so feed isn't dominated by one manufacturer.
// Lower = shown first. Models not listed get ranked by brand fallback.
const MODEL_POPULARITY: Record<string, number> = {
  // Tier 1: Best-selling mass-market EVs
  "Tesla|Model Y": 1,
  "Tesla|Model 3": 2,
  "Ford|Mustang Mach-E": 3,
  "Hyundai|Ioniq 5": 4,
  "Chevrolet|Equinox EV": 5,
  "KIA|EV6": 6,
  "Rivian|R1S": 7,
  "BMW|i4": 8,
  "Ford|F150 Lightning": 9,
  "Tesla|Cybertruck": 10,

  // Tier 2: Popular mid-range
  "Cadillac|Lyriq": 11,
  "Mercedes|EQB SUV": 12,
  "Rivian|R1T": 13,
  "VW|ID.4": 14,
  "Hyundai|Ioniq 6": 15,
  "KIA|EV9": 16,
  "Nissan|Ariya": 17,
  "Volvo|EX30": 18,
  "Toyota|bZ4X": 19,
  "Polestar|2": 20,

  // Tier 3: Premium & enthusiast
  "Tesla|Model S": 21,
  "Rivian|R2": 22,
  "BMW|iX": 23,
  "Audi|e-tron Q4": 24,
  "Tesla|Model X": 25,
  "Genesis|GV60": 26,
  "Subaru|Solterra": 27,
  "Mini|Cooper": 28,
  "KIA|Niro": 29,
  "Hyundai|Kona Electric": 30,

  // Tier 4: Luxury & niche
  "Cadillac|Optiq": 31,
  "Mercedes|EQE Sedan": 32,
  "BMW|i5": 33,
  "Lucid|Gravity": 34,
  "VW|ID.Buzz": 35,
  "Volvo|XC40 Recharge": 36,
  "Nissan|Leaf": 37,
  "GMC|Hummer EV": 38,
  "Audi|e-tron Q8": 39,
  "Porsche|Taycan": 40,

  // Tier 5: Ultra-luxury & less common
  "Genesis|GV70": 41,
  "Genesis|G80": 42,
  "Porsche|Macan": 43,
  "Mercedes|EQS Sedan": 44,
  "Mercedes|EQE SUV": 45,
  "Mercedes|EQS SUV": 46,
  "Jaguar|I-Pace": 47,
  "BMW|i7": 48,
  "Audi|e-tron GT": 49,
  "Lucid|Air": 50,

  // Tier 6: Not available in US / niche international
  "VW|ID.7": 55,
  "Rivian|R3": 56,
  "Rivian|Fleet": 57,
  "Cadillac|Escalade": 58,
  "Cadillac|Celestiq": 59,
  "Porsche|Taycan Sport Turismo": 60,
  "Porsche|Taycan Cross Turismo": 61,
  "Rolls-Royce|Spectre": 65,
  "Rimac|Nevera": 70,
  "XPeng|P7": 75,
  "NIO|ET7": 76,
  "BYD|Dolphin": 77,
  "BYD|Han EV": 78,
  "BYD|Atto 3": 79,
  "BYD|Seal": 80,
  "Geely|Geometry C": 81,
  "Renault|R5": 82,
  "Renault|Zoe": 83,
  "Renault|Megane": 84,
  "Renault|Scenic E-Tech": 85,
  "Citroën|AMI": 86,
  "Citroën|ë-C4": 87,
  "Citroën|ë-C4 X": 88,

  // Unreleased / defunct — pushed to bottom
  "Polestar|4": 90,
  "Polestar|3": 91,
  "Tesla|Semi": 95,
  "Tesla|Roadster": 96,
  "Fisker|Ocean": 100,
  "Fisker|Pear": 101,
  "Fisker|Kayak": 102,
  "Fisker|Ronin": 103,
  "Canoo|Lifestyle Vehicle": 104,
  "Canoo|LDV 130": 105,
  "Canoo|LDV 190": 106,
  "Canoo|Sedan": 107,
  "Canoo|Pickup": 108,
  "Canoo|MPDV": 109,
};

// Fallback brand rank for models not in the map
const BRAND_FALLBACK: Record<string, number> = {
  Tesla: 60, Chevrolet: 55, Ford: 62, Hyundai: 63, BMW: 64,
  KIA: 65, Mercedes: 66, Rivian: 67, Cadillac: 68, VW: 69,
  Toyota: 70, Nissan: 71, Volvo: 72, Polestar: 73, Lucid: 74,
  Genesis: 75, Subaru: 76, GMC: 77, Porsche: 78, Audi: 79,
  Mini: 80, Jaguar: 81, Mazda: 82, "Rolls-Royce": 83, Rimac: 84,
  BYD: 85, NIO: 86, XPeng: 87, Geely: 88, Renault: 89, "Citroën": 90,
  Fisker: 98, Canoo: 99,
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

      // Popularity sort: model-level ranking, interleaved across brands
      if (sortOption.field === "popularity") {
        const keyA = `${a.make_name}|${a.model}`;
        const keyB = `${b.make_name}|${b.model}`;
        const rankA = MODEL_POPULARITY[keyA] ?? (BRAND_FALLBACK[a.make_name] ?? 95);
        const rankB = MODEL_POPULARITY[keyB] ?? (BRAND_FALLBACK[b.make_name] ?? 95);
        return rankA - rankB;
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
