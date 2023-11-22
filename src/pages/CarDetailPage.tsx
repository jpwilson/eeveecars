import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  HStack,
  Show,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import FeatureSelector from "../components/FeatureSelector";
import CarDetails from "../components/CarDetails";

function CarDetail() {
  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        lg: `"nav nav" "aside main"`,
      }}
      templateColumns={{
        base: "1fr",
        lg: "200px 1fr",
      }}
    >
      <GridItem area="nav">
        <NavBar />
      </GridItem>
      <GridItem area="main">
        <CarDetails />
      </GridItem>
    </Grid>
  );
}

export default CarDetail;
