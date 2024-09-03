import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Input,
  VStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from "../components/NavBar";
import usePeople, { Person } from "../hooks/usePeople";

function PeoplePage() {
  const { data: people, error, isLoading } = usePeople();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedPeople, setDisplayedPeople] = useState<Person[]>([]);
  const [isCardView, setIsCardView] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPersonElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          displayedPeople.length < filteredPeople.length
        ) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, displayedPeople]
  );

  const filteredPeople =
    people?.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.current_company
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        person.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || [];

  useEffect(() => {
    setDisplayedPeople(filteredPeople.slice(0, page * itemsPerPage));
  }, [filteredPeople, page]);

  const PersonCard = ({ person }: { person: Person }) => (
    <Card>
      <CardHeader>
        <Heading size="md">{person.name}</Heading>
      </CardHeader>
      <CardBody>
        <Text>Age: {person.age}</Text>
        <Text>Location: {person.location}</Text>
        <Text>Current Company: {person.current_company}</Text>
        <Text>Skills: {person.skills.join(", ")}</Text>
      </CardBody>
    </Card>
  );

  return (
    <Box>
      <NavBar onSearch={() => {}} />
      <Box padding={5}>
        <Heading as="h1" size="xl" marginBottom={5}>
          People in EV Industry
        </Heading>
        <VStack spacing={4} align="stretch">
          <Input
            placeholder="Search by name, company, location, or skills"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="view-switch" mb="0">
              Table View
            </FormLabel>
            <Switch
              id="view-switch"
              isChecked={isCardView}
              onChange={() => setIsCardView(!isCardView)}
            />
            <FormLabel htmlFor="view-switch" mb="0" ml={2}>
              Card View
            </FormLabel>
          </FormControl>
        </VStack>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error loading people data</Text>
        ) : isCardView ? (
          <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={4} mt={4}>
            {displayedPeople.map((person, index) => (
              <Box
                key={person.id}
                ref={
                  index === displayedPeople.length - 1
                    ? lastPersonElementRef
                    : null
                }
              >
                <PersonCard person={person} />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Table variant="simple" mt={4}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Age</Th>
                <Th>Location</Th>
                <Th>Current Company</Th>
                <Th>Skills</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedPeople.map((person, index) => (
                <Tr
                  key={person.id}
                  ref={
                    index === displayedPeople.length - 1
                      ? lastPersonElementRef
                      : null
                  }
                >
                  <Td>{person.name}</Td>
                  <Td>{person.age}</Td>
                  <Td>{person.location}</Td>
                  <Td>{person.current_company}</Td>
                  <Td>{person.skills.join(", ")}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
}

export default PeoplePage;
