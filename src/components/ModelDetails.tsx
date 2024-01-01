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

      //submodels,
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
      <Image
        src={image_url}
        alt={`${make_name} ${model}`}
        maxW={imageSize}
        objectFit="contain"
      />
      <Text>Overview: {model_description}</Text>
      <Heading size="md">Submodels</Heading>
      <VStack spacing={2}>
        {submodels.map((submodel: ModelDetailsType["submodels"][number]) => (
          <Link
            key={submodel.id}
            as={RouterLink}
            to={`/car_detail/${submodel.id}`}
          >
            {submodel.submodel} - {submodel.trim}
          </Link>
        ))}
      </VStack>
    </VStack>
  );
};

export default ModelDetails;
