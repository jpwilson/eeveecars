import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import updateLog, { UpdateEntry } from "../data/updateLog";

const typeBadge: Record<UpdateEntry["type"], { color: string; label: string }> = {
  spec_update: { color: "blue", label: "Spec Update" },
  price_update: { color: "green", label: "Price" },
  new_model: { color: "purple", label: "New Model" },
  status_change: { color: "orange", label: "Status" },
  system: { color: "gray", label: "System" },
};

function AdminPage() {
  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.7)",
    "rgba(26,32,44,0.7)"
  );
  const borderColor = useColorModeValue(
    "rgba(22, 163, 74, 0.15)",
    "rgba(22, 163, 74, 0.25)"
  );
  const headerBg = useColorModeValue(
    "rgba(22, 163, 74, 0.06)",
    "rgba(22, 163, 74, 0.12)"
  );
  const textColor = useColorModeValue("gray.700", "gray.200");

  const specUpdates = updateLog.filter((e) => e.type === "spec_update" || e.type === "price_update");
  const latestDate = updateLog.length > 0
    ? updateLog.reduce((a, b) => (a.date > b.date ? a : b)).date
    : "N/A";

  return (
    <Box minH="100vh">
      <NavBar />
      <Container maxW="1200px" py={8}>
        <Heading size="lg" color="#16a34a" mb={2}>
          Admin Dashboard
        </Heading>
        <Text color="gray.500" mb={6}>
          Data update log and site administration
        </Text>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
          {[
            { label: "Total Updates", value: updateLog.length },
            { label: "Spec Updates", value: specUpdates.length },
            { label: "Models Tracked", value: new Set(updateLog.filter((e) => e.carId).map((e) => e.carId)).size },
            { label: "Last Updated", value: latestDate },
          ].map((stat) => (
            <Box
              key={stat.label}
              bg={cardBg}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="16px"
              p={4}
            >
              <Stat>
                <StatLabel color="gray.500" fontSize="xs">
                  {stat.label}
                </StatLabel>
                <StatNumber fontSize="xl" color={textColor}>
                  {stat.value}
                </StatNumber>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>

        {/* Update Log Table */}
        <Box
          bg={cardBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="16px"
          overflow="hidden"
        >
          <Box px={6} py={4} bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
            <Heading size="sm" color={textColor}>
              Update Log
            </Heading>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Model</Th>
                  <Th>Type</Th>
                  <Th>Summary</Th>
                  <Th isNumeric>Changes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {[...updateLog].reverse().map((entry) => (
                  <Tr key={entry.id}>
                    <Td whiteSpace="nowrap" fontSize="xs" color="gray.500">
                      {entry.date}
                    </Td>
                    <Td fontWeight="500" fontSize="sm">
                      {entry.model}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={typeBadge[entry.type].color}
                        fontSize="xs"
                        borderRadius="full"
                        px={2}
                      >
                        {typeBadge[entry.type].label}
                      </Badge>
                    </Td>
                    <Td fontSize="sm" maxW="400px">
                      <Text noOfLines={2}>{entry.summary}</Text>
                    </Td>
                    <Td isNumeric fontSize="sm">
                      {entry.changes.length > 0 ? entry.changes.length : "-"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Detailed Changes Accordion */}
        {updateLog.filter((e) => e.changes.length > 0).length > 0 && (
          <Box mt={6}>
            <Heading size="sm" color={textColor} mb={3}>
              Detailed Changes
            </Heading>
            <Accordion allowMultiple>
              {[...updateLog]
                .filter((e) => e.changes.length > 0)
                .reverse()
                .map((entry) => (
                  <AccordionItem
                    key={entry.id}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="12px"
                    mb={2}
                    overflow="hidden"
                  >
                    <AccordionButton py={3} _hover={{ bg: headerBg }}>
                      <HStack flex="1" spacing={3}>
                        <Badge
                          colorScheme={typeBadge[entry.type].color}
                          fontSize="xs"
                          borderRadius="full"
                          px={2}
                        >
                          {typeBadge[entry.type].label}
                        </Badge>
                        <Text fontWeight="500" fontSize="sm">
                          {entry.model}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {entry.date}
                        </Text>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Text fontSize="sm" mb={3} color="gray.500">
                        {entry.summary}
                      </Text>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Field</Th>
                            <Th>Old Value</Th>
                            <Th>New Value</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {entry.changes.map((change, i) => (
                            <Tr key={i}>
                              <Td fontWeight="500" fontSize="xs">
                                {change.field}
                              </Td>
                              <Td fontSize="xs" color="red.400">
                                {change.oldValue ?? "-"}
                              </Td>
                              <Td fontSize="xs" color="green.500">
                                {change.newValue ?? "-"}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
            </Accordion>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AdminPage;
