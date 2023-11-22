import React from "react";
import { useParams } from "react-router-dom";
import useCarDetail from "../hooks/useCarDetails";
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";

const CarDetails = () => {
  const { id } = useParams();
  const { car, error, isLoading } = useCarDetail(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!car) return <div>Car not found.</div>;

  const {
    make_id,
    make_name,
    model,
    submodel,
    generation,
    image_url,
    acceleration_0_60,
    current_price,
    epa_range,
    number_of_full_adult_seats,

    available_countries,

    //charging
    battery_capacity,
    battery_max_charging_speed,
    bidirectional_details,
    chargers,

    //dates
    carmodel_first_released,
    carmodel_ended,
    trim_first_released,
    trim_ended,

    color_options, //the year is the key + list of colors as val

    customer_and_critic_rating, //dict of publication,

    drive_assist_features,
    drive_type,
    frunk_capacity,

    has_spare_tire,

    //performance
    power,
    top_speed,
    torque,
    speed_acc,

    //price
    price_history,

    range_details,
    reviews,

    //safety
    euroncap_rating,
    nhtsa_rating,
    sentry_security,
    sentry_details,

    camping_features,
    dog_mode,
    infotainment_details,
    interior_ambient_lighting_details,
    keyless,
    number_of_passenger_doors,
    remote_heating_cooling,
    seating_details,
    towing_details,
    regen_details,
    vehicle_class,
    vehicle_sound_details,
  } = car;

  return (
    <Grid templateColumns="repeat(5, 1fr)" gap={6}>
      <GridItem colSpan={3}>
        <Image
          src={image_url}
          alt={`${make_name} ${model}`}
          objectFit="cover"
        />
      </GridItem>
      <GridItem colSpan={2}>
        <VStack align="start">
          <Text
            fontSize="3xl"
            fontWeight="bold"
          >{`${make_name} ${model} ${submodel} ${generation}`}</Text>
          <Text>Price: ${current_price}</Text>
          <Text>Acceleration 0-60: {acceleration_0_60} seconds</Text>
          <Text>Range: {epa_range} miles</Text>
          <Text>Top Speed: {top_speed} mph</Text>
          {/* ... add other attributes here */}
        </VStack>
      </GridItem>
    </Grid>

    // <div>
    //   <img src={car.image_url} alt={car.model} />
    //   <h1>
    //     {car.make_name} {car.model} {car.submodel}
    //   </h1>
    //   <p>Acceleration 0-60,
    //   <p>Range: {car.epa_range} miles</p>
    //   <p>Top Speed: {car.top_speed} mph</p>
    //   <p>Price: ${car.current_price}</p>
    // </div>
  );
};

export default CarDetails;
