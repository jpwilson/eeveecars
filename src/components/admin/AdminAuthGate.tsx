import { useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

interface Props {
  children: React.ReactNode;
}

export default function AdminAuthGate({ children }: Props) {
  const { isAuthenticated, isVerifying, error, login } = useAdminAuth();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.7)");
  const borderColor = useColorModeValue("rgba(22,163,74,0.15)", "rgba(22,163,74,0.25)");

  if (isAuthenticated) return <>{children}</>;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="60vh"
    >
      <Box
        bg={cardBg}
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="16px"
        p={8}
        maxW="400px"
        w="100%"
      >
        <VStack spacing={4}>
          <Box as={FaLock} size="24px" color="#16a34a" />
          <Text fontWeight="600" fontSize="lg">
            Admin Access
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Enter the admin key to access vehicle editing.
          </Text>
          <InputGroup>
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Admin key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && key && login(key)}
              borderColor={borderColor}
              _focus={{ borderColor: "#16a34a", boxShadow: "0 0 0 1px #16a34a" }}
            />
            <InputRightElement>
              <IconButton
                aria-label={showKey ? "Hide" : "Show"}
                icon={showKey ? <FaEyeSlash /> : <FaEye />}
                size="sm"
                variant="ghost"
                onClick={() => setShowKey(!showKey)}
              />
            </InputRightElement>
          </InputGroup>
          {error && (
            <Text fontSize="sm" color="red.400">
              {error}
            </Text>
          )}
          <Button
            w="100%"
            bg="#16a34a"
            color="white"
            _hover={{ bg: "#15803d" }}
            isLoading={isVerifying}
            isDisabled={!key}
            onClick={() => login(key)}
          >
            Verify
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
