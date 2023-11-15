import { SimpleGrid, Skeleton, Text, Flex, Icon } from "@chakra-ui/react";
import useCars from "../hooks/useCars";
import CarCard from "./CarCard";
import CarCardSkeleton from "./CarCardSkeleton";
import CarCardContainer from "./CarCardContainer";
import { Make } from "../hooks/useMakes";
import { MdSentimentDissatisfied } from "react-icons/md";
import { FaSadTear } from "react-icons/fa";

interface Props {
  selectedMake: Make | null;
}

const CarGrid = ({ selectedMake }: Props) => {
  const { data, error, isLoading } = useCars(selectedMake);
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
        {data && data.length === 0 && (
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
        {data.map((car) => (
          <CarCardContainer key={car.id}>
            <CarCard car={car} />
          </CarCardContainer>
        ))}
      </SimpleGrid>
    </>
  );
};

export default CarGrid;
