import { Box, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import React from "react";
import NavBar from "../components/NavBar";
import { Outlet } from "react-router-dom";

const Layouts = () => {
  return (
    <>
      {/* <Grid templateColumns="1fr 1fr 1fr}">
        <Box w={100} h={100} bg="lightcoral" />
        <GridItem>
      </Grid>
      <img
        width="300px"
        src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      ></img> */}
      <Grid templateColumns="1fr 2fr" gap={4}>
        {/* Left side */}
        <GridItem colSpan={1} rowSpan={2}>
          <Box>
            <img
              src="https://images.pixexid.com/unleash-the-power-of-technology-with-a-2023-tesla-model-s-plaid-speeding-throug-bxx0b5la.webp?h=700&q=70" // Replace with your image URL
              alt="Tesla Model S Plaid"
              width="100%"
              height="auto"
            />
          </Box>
          <Box>
            <Text textAlign="center" fontWeight="bold">
              Tesla Model S Plaid
            </Text>
          </Box>
        </GridItem>

        {/* Right side */}
        <GridItem colSpan={1}>
          <Box>
            <Text fontWeight="bold">Car Details:</Text>
            <ul>
              <li>Make: Tesla</li>
              <li>Model: Model S</li>
              <li>Submodel: Plaid</li>
              <li>Range: 390 miles</li>
              <li>Acceleration: 0-60 mph in 1.98s</li>
              <li>Top Speed: 200 mph</li>
              <li>Price: $139,990</li>
              <li>Charging Network: Tesla Supercharger</li>
            </ul>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default Layouts;
