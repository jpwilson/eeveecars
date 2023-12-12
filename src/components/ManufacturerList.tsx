import {
  Button,
  HStack,
  Image,
  List,
  ListItem,
  Spinner,
  Text,
  ColorMode,
  useColorMode,
} from "@chakra-ui/react";
import useMakes, { Make } from "../hooks/useMakes";

interface Props {
  onSelectMake: (make: Make | null) => void;
  selectedMake: Make | null;
}

const ManufacturerList = ({ selectedMake, onSelectMake }: Props) => {
  const { data, isLoading, error } = useMakes();
  const { colorMode } = useColorMode();

  if (error) return null;

  if (isLoading) return <Spinner />;
  // Sort the data alphabetically by the 'name' property
  const sortedData =
    data?.sort((a: Make, b: Make) => a.name.localeCompare(b.name)) ?? [];
  return (
    <List>
      <ListItem paddingY="6px">
        <Button fontSize="lg" onClick={() => onSelectMake(null)}>
          All EVs
        </Button>
      </ListItem>
      {sortedData.map((make) => (
        <ListItem
          key={make.id}
          paddingY="6px"
          onClick={() => onSelectMake(make)}
        >
          <HStack>
            <Image
              backgroundColor="#F5F5F5" // light gray background, this will be visible in spaces not covered by the image
              borderColor="#1A202D" // black border color
              border="1px" // thin border width
              width={"52px"}
              height={"52px"}
              borderRadius={8}
              p={1}
              src={make.lrg_logo_img_url}
              //   objectFit="cover"
              objectFit="contain"
              // to help with the background:
            />
            <Button
              fontWeight={make.id === selectedMake?.id ? "bold" : "normal"}
              backgroundColor={
                colorMode === "light"
                  ? make.id === selectedMake?.id
                    ? "blue.200"
                    : "#EDF2F7"
                  : make.id === selectedMake?.id
                  ? "blue.500"
                  : "#313640"
              }
              fontSize="lg"
            >
              {make.name}
            </Button>
          </HStack>
        </ListItem>
      ))}
    </List>
  );
};

export default ManufacturerList;
