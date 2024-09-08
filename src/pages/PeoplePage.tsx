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
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import usePeople, { Person } from "../hooks/usePeople";

// Helper function to format roles by company
const formatRolesByCompany = (roles: { title: string; company: string }[]) => {
  const rolesByCompany = roles.reduce((acc, role) => {
    if (!acc[role.company]) {
      acc[role.company] = [];
    }
    acc[role.company].push(role.title);
    return acc;
  }, {} as Record<string, string[]>);

  return Object.entries(rolesByCompany)
    .map(([company, titles]) => `${company}: ${titles.join(", ")}`)
    .join("\n");
};

function PeoplePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categoryTag, setCategoryTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedPeople, setDisplayedPeople] = useState<Person[]>([]);
  const [isCardView, setIsCardView] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const { people, isLoading, error } = usePeople();
  const flatPeople = people ? people.flat() : null;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPersonElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          displayedPeople.length < (people?.length || 0)
        ) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, displayedPeople, people]
  );

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setCategoryTag(category);
    }
  }, [searchParams]);

  useEffect(() => {
    if (people) {
      let filteredPeople: Person[] = people.flat();

      // Apply category filter
      if (categoryTag) {
        filteredPeople = filteredPeople.filter((person: Person) => {
          const lowerCategory = categoryTag.toLowerCase();
          if (lowerCategory === "ceo") {
            return person.current_roles.some(
              (role) =>
                role.title.toLowerCase().includes("ceo") ||
                role.title.toLowerCase().includes("chief executive officer")
            );
          } else if (lowerCategory === "founder") {
            return person.current_roles.some(
              (role) =>
                role.title.toLowerCase().includes("founder") ||
                role.title.toLowerCase().includes("co-founder")
            );
          } else if (lowerCategory === "journalist") {
            return person.current_roles.some(
              (role) =>
                role.title.toLowerCase().includes("journalist") ||
                role.company.toLowerCase().includes("news") ||
                role.company.toLowerCase().includes("media")
            );
          }
          return true;
        });
      }

      // Apply search term filter
      if (searchTerm) {
        filteredPeople = filteredPeople.filter(
          (person) =>
            person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.current_roles.some(
              (role) =>
                role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.company.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
      }

      setDisplayedPeople(filteredPeople.slice(0, page * itemsPerPage));
    }
  }, [people, categoryTag, searchTerm, page]);

  const handleRemoveTag = () => {
    setCategoryTag(null);
    setSearchTerm("");
    // Remove the category from the URL
    navigate("/people", { replace: true });
  };

  const PersonCard = ({ person }: { person: Person }) => (
    <Card>
      <CardHeader>
        <Heading size="md">{person.name}</Heading>
      </CardHeader>
      <CardBody>
        <Text>Age: {person.age}</Text>
        <Text>Location: {person.location}</Text>
        <Text>Current Roles:</Text>
        <Text whiteSpace="pre-wrap">
          {formatRolesByCompany(person.current_roles)}
        </Text>
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
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {categoryTag && (
            <Tag
              size="md"
              key={categoryTag}
              borderRadius="full"
              variant="solid"
              colorScheme="blue"
              alignSelf="flex-start" // This will align the tag to the left
            >
              <TagLabel>{categoryTag}</TagLabel>
              <TagCloseButton onClick={handleRemoveTag} />
            </Tag>
          )}
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
        ) : displayedPeople.length === 0 ? (
          <Text>No results found</Text>
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
                <Th>NAME</Th>
                <Th>AGE</Th>
                <Th>LOCATION</Th>
                <Th>CURRENT ROLES</Th>
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
                  <Td whiteSpace="pre-wrap">
                    {formatRolesByCompany(person.current_roles)}
                  </Td>
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
