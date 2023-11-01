import { HStack, Image, List, ListItem, Spinner, Text } from "@chakra-ui/react";
import useMakes from "../hooks/useMakes";

const ManufacturerList = () => {
  const { data, isLoading, error } = useMakes();

  if (error) return null;

  if (isLoading) return <Spinner />;

  return (
    <List>
      {data.map((make) => (
        <ListItem key={make.id} paddingY="6px">
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
            <Text fontSize="lg">{make.name}</Text>
          </HStack>
        </ListItem>
      ))}
    </List>
  );
};

export default ManufacturerList;
