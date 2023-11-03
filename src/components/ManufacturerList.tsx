import {
  Button,
  HStack,
  Image,
  List,
  ListItem,
  Spinner,
  Text,
} from "@chakra-ui/react";
import useMakes, { Make } from "../hooks/useMakes";

interface Props {
  onSelectMake: (make: Make) => void;
}

const ManufacturerList = ({ onSelectMake }: Props) => {
  const { data, isLoading, error } = useMakes();

  if (error) return null;

  if (isLoading) return <Spinner />;

  return (
    <List>
      <ListItem paddingY="6px">
        <Button fontSize="lg" onClick={() => onSelectMake(null)}>
          All Cars
        </Button>
      </ListItem>
      {data.map((make) => (
        <ListItem
          key={make.id}
          paddingY="6px"
          onClick={() => onSelectMake(make)}
        >
          <HStack>
            <Image
              width={"48px"}
              height={"48px"}
              borderRadius={8}
              src={make.lrg_logo_img_url}
              //   objectFit="cover"
              objectFit="contain"
              // to help with the background:
              backgroundColor="#F5F5F5" // light gray background, this will be visible in spaces not covered by the image
              borderColor="black" // black border color
              borderWidth="1px" // thin border width
            />
            <Button fontSize="lg">{make.name}</Button>
          </HStack>
        </ListItem>
      ))}
    </List>
  );
};

export default ManufacturerList;
