import { useState } from "react";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Alert,
  AlertIcon,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue("rgba(255,255,255,0.85)", "rgba(26,32,44,0.9)");
  const borderColor = useColorModeValue("rgba(34,197,94,0.3)", "rgba(34,197,94,0.4)");

  const handleSubmit = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setIsLoading(true);
    const result = await updatePassword(password);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 2000);
    }
  };

  return (
    <Center minH="100vh" bg={useColorModeValue("#f0f4f8", "gray.800")}>
      <Box
        bg={bgColor}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={8}
        maxW="400px"
        w="full"
        mx={4}
      >
        <VStack spacing={4}>
          <Heading size="md">Set New Password</Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          {success && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Password updated! Redirecting...
            </Alert>
          )}

          {!success && (
            <>
              <FormControl>
                <FormLabel fontSize="sm">New Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </FormControl>
              <Button
                w="full"
                colorScheme="green"
                onClick={handleSubmit}
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
