import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Link,
  useBreakpointValue,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import useModelDetails, {
  ModelDetailsResponse as ModelDetailsType,
} from "../hooks/useModelDetails"; // Import the hook and type

const ModelDetails: React.FC = () => {
  const { make_model_slug } = useParams<{ make_model_slug: string }>(); // This should match the route parameter
  const safeMakeModelSlug = make_model_slug ?? ""; // Fallback to an empty string if undefined
  const { modelDetails, error, isLoading } = useModelDetails(safeMakeModelSlug); // Invoke the hook with the model ID

  // Responsive breakpoints for image size
  const imageSize = useBreakpointValue({
    base: "100%", // full width on base breakpoint
    md: "400px", // 400px on md breakpoint
    lg: "600px", // larger size on lg breakpoint
    xl: "800px", // even larger size on xl breakpoint
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!modelDetails) return <div>Model not found.</div>;

  const {
    representative_model: {
      make_name,
      model,
      model_description,
      image_url,
      top_speed,
      epa_range,
      // torque,
      // speed_acc,

      current_price,
      average_rating,
      // ... other fields you may want to include
    },
    submodels,
  } = modelDetails;

  // const submodels = modelDetails.submodels;

  console.log("mode details below  ");
  console.log({ modelDetails });
  console.log("mode details above  ");
  if (modelDetails) {
    console.log({ submodels: submodels });
  }

  return (
    <VStack align="stretch" spacing={4} p={4}>
      <HStack justify="space-between" align="center">
        <Text fontSize="4xl" fontWeight="bold">
          {make_name} {model}
        </Text>
        {/* <Button colorScheme="blue" as={RouterLink} to="/">
          Back to results
        </Button> */}
        <Link as={RouterLink} to="/">
          <Button colorScheme="blue">Back to results</Button>
        </Link>
      </HStack>

      <Grid
        templateColumns={{ md: "1fr 2fr", base: "1fr" }}
        gap={6}
        alignItems="start"
      >
        <GridItem>
          <Image
            src={image_url}
            alt={`${make_name} ${model}`}
            maxW={imageSize}
            maxH={{ base: "auto", md: "500px" }}
            objectFit="contain"
          />
        </GridItem>
        <GridItem>
          <VStack spacing={6} align="start">
            <Heading>Model Overview</Heading>
            <Text>{model_description}</Text>
            <VStack spacing={4}>
              <Heading fontWeight="bold">Variants</Heading>
            </VStack>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Submodel Name</Th>
                  <Th>Starting Price</Th>
                  <Th>0-60 mph</Th>
                  <Th>Top Speed</Th>
                  <Th>EPA Range</Th>
                </Tr>
              </Thead>
              <Tbody>
                {submodels.map(
                  (submodel: ModelDetailsType["submodels"][number]) => (
                    <Tr key={submodel.id}>
                      <Td>
                        <Link
                          key={submodel.id}
                          as={RouterLink}
                          to={`/car_detail/${submodel.id}`}
                        >
                          {submodel.submodel}
                        </Link>
                      </Td>
                      <Td>${submodel.current_price}</Td>
                      <Td>{submodel.acceleration_0_60} seconds</Td>
                      <Td>{submodel.top_speed} mph</Td>
                      <Td>{submodel.epa_range} miles</Td>
                    </Tr>
                  )
                )}
              </Tbody>
            </Table>
          </VStack>
        </GridItem>
      </Grid>
    </VStack>
  );
};

export default ModelDetails;