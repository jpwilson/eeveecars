import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  HStack,
  Link,
  Show,
  VStack,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import { useState } from "react";
import { Make } from "../hooks/useMakes";
import CarDetails from "../components/CarDetails";
import ManufacturerList from "../components/ManufacturerList";
import { Link as RouterLink } from "react-router-dom";

function CarDetail() {
  const [selectedMake, setSelectedMake] = useState<Make | null>(null);
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
      {/* <GridItem area="nav"> Shuoldn't be here
        <NavBar />
      </GridItem> */}
      <Show above="lg">
        <GridItem area="aside" paddingX={5}>
          <VStack h={"300px"} justifyContent="space-around">
            <Link as={RouterLink} to="/">
              <Button>All Cars</Button>
            </Link>
            <Link as={RouterLink} to="/">
              <Button>All Manufacturers</Button>
            </Link>
            <Link as={RouterLink} to="/">
              <Button>All People</Button>
            </Link>
          </VStack>
        </GridItem>
      </Show>
      <GridItem area="main">
        <CarDetails />
      </GridItem>
    </Grid>
  );
}

export default CarDetail;
