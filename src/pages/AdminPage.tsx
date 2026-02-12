import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSignOutAlt } from "react-icons/fa";
import NavBar from "../components/NavBar";
import { AdminAuthProvider, useAdminAuth } from "../contexts/AdminAuthContext";
import AdminAuthGate from "../components/admin/AdminAuthGate";
import AdminUpdateLog from "../components/admin/AdminUpdateLog";
import AdminVehicleEditor from "../components/admin/AdminVehicleEditor";

function AdminContent() {
  const { isAuthenticated, logout } = useAdminAuth();
  const tabColor = useColorModeValue("gray.600", "gray.400");
  const selectedTabColor = "#16a34a";

  return (
    <Container maxW="1400px" py={8}>
      <HStack justify="space-between" mb={2}>
        <Box>
          <Heading size="lg" color="#16a34a">
            Admin Dashboard
          </Heading>
          <Text color="gray.500" mb={6}>
            Data update log and vehicle management
          </Text>
        </Box>
        {isAuthenticated && (
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FaSignOutAlt />}
            onClick={logout}
            color="gray.500"
            _hover={{ color: "red.400" }}
          >
            Logout
          </Button>
        )}
      </HStack>

      <Tabs colorScheme="green" variant="line">
        <TabList>
          <Tab
            fontSize="sm"
            fontWeight="600"
            color={tabColor}
            _selected={{ color: selectedTabColor, borderColor: selectedTabColor }}
          >
            Update Log
          </Tab>
          <Tab
            fontSize="sm"
            fontWeight="600"
            color={tabColor}
            _selected={{ color: selectedTabColor, borderColor: selectedTabColor }}
          >
            Vehicle Editor
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0} pt={6}>
            <AdminUpdateLog />
          </TabPanel>
          <TabPanel px={0} pt={6}>
            <AdminAuthGate>
              <AdminVehicleEditor />
            </AdminAuthGate>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default function AdminPage() {
  return (
    <Box minH="100vh">
      <NavBar />
      <AdminAuthProvider>
        <AdminContent />
      </AdminAuthProvider>
    </Box>
  );
}
