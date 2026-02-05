import { HStack, Switch, Text, useColorMode, useColorModeValue } from "@chakra-ui/react";

const ColorModeSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <HStack>
      <Switch
        colorScheme="green"
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode}
        size="sm"
      />
      <Text fontSize="sm" color={labelColor} fontWeight="400">
        Dark Mode
      </Text>
    </HStack>
  );
};

export default ColorModeSwitch;
