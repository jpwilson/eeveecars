import { Button, ButtonGroup, Grid, GridItem, Show } from "@chakra-ui/react";
import NavBar from "./components/NavBar";
import CarGrid from "./components/CarGrid";
import ManufacturerList from "./components/ManufacturerList";

function App() {
  return (
    <Grid
      templateAreas={{
        base: `"nav" "main"`,
        lg: `"nav nav" "aside main"`,
      }}
    >
      <GridItem area="nav">
        <NavBar />
      </GridItem>
      <Show above="lg">
        <GridItem area="aside">
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
