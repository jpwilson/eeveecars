import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import usePeople from "../hooks/usePeople";

// At the top of the file, update or add the Person interface
interface Person {
  id: number;
  name: string;
  role: string; // Add this line
  company: string; // Add this line
  // ... any other existing properties
}

const PeopleTable = () => {
  const { data: people, error, isLoading } = usePeople();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading people data</p>;

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Role</Th>
            <Th>Company</Th>
          </Tr>
        </Thead>
        <Tbody>
          {people.map((person) => (
            <Tr key={person.id}>
              <Td>{person.name}</Td>
              <Td>{person.current_roles[0]?.title}</Td>
              <Td>{person.current_roles[0]?.company}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default PeopleTable;
