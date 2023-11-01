import { Button, ButtonGroup, Grid, GridItem, Show } from "@chakra-ui/react";
import NavBar from "./NavBar";
import CarGrid from "./CarGrid";
import ManufacturerList from "./ManufacturerList";

function App() {
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
      <Show above="lg">
        <GridItem area="aside" paddingX={5}>
          <ManufacturerList />
        </GridItem>
      </Show>
      <GridItem area="main">
        <CarGrid />
      </GridItem>
    </Grid>
  );
}

export default App;
