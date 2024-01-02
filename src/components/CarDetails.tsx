import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import useCarDetail from "../hooks/useCarDetails";
import NavBar from "./NavBar";

import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Show,
  Button,
  Flex,
  Link,
  useBreakpointValue,
  Heading,
} from "@chakra-ui/react";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();

  const numericId = id ? parseInt(id, 10) : null;

  if (numericId === null) {
    return <div>No car ID was provided in the URL.</div>;
  }

  const { car, error, isLoading } = useCarDetail(numericId);

  // Responsive breakpoints for image size
  const imageSize = useBreakpointValue({
    base: "100%", // full width on base breakpoint
    md: "400px", // 400px on md breakpoint
    lg: "600px", // larger size on lg breakpoint
    xl: "800px", // even larger size on xl breakpoint
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!car) return <div>Car not found.</div>;

  const {
    //  make_id,
    make_name,
    model,
    submodel,
    //  generation,
    image_url,
    acceleration_0_60,
    current_price,
    epa_range,
    make_model_slug,
    //  number_of_full_adult_seats,

    // available_countries,

    //charging
    // battery_capacity,
    // battery_max_charging_speed,
    // bidirectional_details,
    // chargers,

    // //dates
    // carmodel_first_released,
    // carmodel_ended,
    // trim_first_released,
    // trim_ended,

    // color_options, //the year is the key + list of colors as val

    // customer_and_critic_rating, //dict of publication,

    // drive_assist_features,
    // drive_type,
    // frunk_capacity,

    // has_spare_tire,

    //performance
    // power,
    top_speed,
    car_description,
    // torque,
    // speed_acc,

    current_price,
    // price_history,

    // range_details,
    // reviews,

    //safety
    // euroncap_rating,
    // nhtsa_rating,
    // sentry_security,
    // sentry_details,

    // camping_features,
    // dog_mode,
    // infotainment_details,
    // interior_ambient_lighting_details,
    // keyless,
    // number_of_passenger_doors,
    // remote_heating_cooling,
    // seating_details,
    // towing_details,
    // regen_details,
    // vehicle_class,
    // vehicle_sound_details,
  } = car;

  return (
    <VStack align="stretch" spacing={4} p={4}>
      <HStack justify="space-between" align="center">
        <Text fontSize="4xl" fontWeight="bold">
          {make_name} {model} {submodel}
        </Text>
        <Link as={RouterLink} to={`/model_detail/${make_model_slug}`}>
          <Button colorScheme="blue">Back to {model} overview</Button>
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
            alt={`${make_name} ${model} ${submodel}`}
            maxW={imageSize}
            maxH={{ base: "auto", md: "500px" }}
            objectFit="contain"
          />
        </GridItem>
        <GridItem>
          <VStack spacing={4} align="start">
            <Heading>Overview</Heading>
            <Text>{car_description}</Text>
            <HStack>
              <Text fontWeight="bold">Price:</Text>
              <Text>${current_price}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Acceleration 0-60:</Text>
              <Text>{acceleration_0_60} seconds</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Range:</Text>
              <Text>{epa_range} miles</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Top Speed:</Text>
              <Text>{top_speed} mph</Text>
            </HStack>
            {/* Add more car details as needed */}
          </VStack>
        </GridItem>
      </Grid>
    </VStack>
  );
};

export default CarDetails;
