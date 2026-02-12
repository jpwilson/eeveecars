import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

interface Props {
  title: string;
  isDirty?: boolean;
  children: React.ReactNode;
}

export default function AdminFormSection({ title, isDirty, children }: Props) {
  const headerBg = useColorModeValue("rgba(22,163,74,0.06)", "rgba(22,163,74,0.12)");
  const borderColor = useColorModeValue("rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)");

  return (
    <AccordionItem border="1px solid" borderColor={borderColor} borderRadius="12px" mb={2} overflow="hidden">
      <AccordionButton py={3} _hover={{ bg: headerBg }}>
        <Box flex="1" textAlign="left">
          <Text fontWeight="600" fontSize="sm">
            {title}
            {isDirty && (
              <Box as="span" ml={2} w="8px" h="8px" borderRadius="full" bg="orange.400" display="inline-block" />
            )}
          </Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>{children}</AccordionPanel>
    </AccordionItem>
  );
}
