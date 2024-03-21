import React, { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import useCarDetail from "../hooks/useCarDetails";
import { FaYoutube, FaXing, FaGlobe } from "react-icons/fa";
import NavBar from "./NavBar";
import { formatPrice } from "../utils/formatPrice";
import {
  Box,
  Collapse,
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
  Icon,
} from "@chakra-ui/react";
import { Md10K } from "react-icons/md";

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();

  const numericId = id ? parseInt(id, 10) : null;

  const [showMore, setShowMore] = useState(false);
  const handleToggle = () => setShowMore(!showMore);

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
    battery_capacity,
    // battery_max_charging_speed,
    // bidirectional_details,
    // chargers,

    // //dates
    // carmodel_first_released,
    // carmodel_ended,
    // trim_first_released,
    // trim_ended,

    // color_options, //the year is the key + list of colors as val

    customer_and_critic_rating, //dict of publication,

    // drive_assist_features,
    drive_type,
    // frunk_capacity,

    // has_spare_tire,

    //performance
    power,
    top_speed,
    car_description,
    torque,
    // speed_acc,
    // price_history,

    // range_details,
    reviews,

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
          <Button colorScheme="blue">Back to all {model} models</Button>
        </Link>
      </HStack>
      <Grid
        templateColumns={{ lg: "1fr 1fr", md: "2fr 3fr", base: "1fr" }}
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
            <Collapse startingHeight={50} in={showMore}>
              <Text>{car_description}</Text>
            </Collapse>
            <Text
              color="blue.500"
              mt="-4"
              fontWeight="bold"
              cursor="pointer"
              onClick={handleToggle}
            >
              {showMore ? "..... Read Less" : "..... Read More"}
            </Text>
            {/* <Button size="sm" onClick={handleToggle} mt="4">
              {showMore ? "Read Less" : "Read More"}
            </Button> */}
            <HStack>
              <Text fontWeight="bold">Price:</Text>
              <Text>{formatPrice(car.current_price)}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Acceleration 0-60:</Text>
              <Text>{acceleration_0_60} seconds</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Top Speed:</Text>
              <Text>{top_speed} mph</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Range:</Text>
              <Text>{epa_range} miles</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Battery Capacity:</Text>
              <Text>{battery_capacity} kWh</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Power:</Text>
              <Text>{power} hp</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Torque:</Text>
              <Text>{torque} lb-ft</Text>
            </HStack>
            <HStack>
              <Text fontWeight="bold">Drive Type</Text>
              <Text>{drive_type}</Text>
            </HStack>
            {/* Add more car details as needed */}
          </VStack>
        </GridItem>
        <GridItem>
          <VStack align="start" spacing={4}>
            <Heading fontSize="xl" textDecoration="underline">
              Ratings
            </Heading>
            {car.customer_and_critic_rating &&
            Object.keys(car.customer_and_critic_rating).length > 0 ? (
              Object.entries(car.customer_and_critic_rating).map(
                ([source, rating]) => (
                  <HStack key={source}>
                    <Text fontWeight="bold">{source}:</Text>
                    <Text>{rating}</Text>
                  </HStack>
                )
              )
            ) : (
              <Text>No ratings available yet.</Text>
            )}
          </VStack>
        </GridItem>
        {/* <GridItem>
          <VStack align="start" spacing={4}>
            <Heading fontSize="xl" textDecoration="underline">
              Reviews
            </Heading>
            {car.reviews && car.reviews.length > 0 ? (
              car.reviews.map((review, index) => (
                <Box key={index}>
                  <Link href={review.url} isExternal>
                    {review.description}
                  </Link>
                </Box>
              ))
            ) : (
              <Text>No reviews available yet.</Text>
            )}
          </VStack>
        </GridItem> */}
        <GridItem>
          <VStack align="start" spacing={4}>
            <Heading fontSize="xl" textDecoration="underline">
              Reviews
            </Heading>
            {car.reviews && car.reviews.length > 0 ? (
              car.reviews.map((review, index) => (
                <HStack key={index} spacing={2}>
                  <Link href={review.url} isExternal>
                    {review.url.startsWith("https://youtu.be") ||
                    review.url.startsWith("https://www.youtube.com/watch") ? (
                      <Icon as={FaYoutube} color="red.500" boxSize={6} />
                    ) : review.url.startsWith("https://x.com") ? (
                      <Icon as={FaXing} color="green.500" boxSize={6} />
                    ) : (
                      <Icon as={FaGlobe} color="blue.500" boxSize={6} />
                    )}
                  </Link>
                  <Link href={review.url} isExternal>
                    <Text fontSize="sm">
                      {review.description.length > 20
                        ? `${review.description.substring(0, 40)}...`
                        : review.description}
                    </Text>
                  </Link>
                </HStack>
              ))
            ) : (
              <Text>No reviews available yet.</Text>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </VStack>
  );
};

export default CarDetails;
