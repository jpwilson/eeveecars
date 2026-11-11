import { useState } from "react";
import { Box, Center, Text, useColorModeValue } from "@chakra-ui/react";

interface Props {
  name: string | null | undefined;
  url: string | null | undefined;
  size?: string | Record<string, string>;
  /** "" when the make name is shown next to it */
  alt?: string;
}

/** Make logo on a white tile, with an initials tile when there is no logo. */
export default function MakeLogo({ name, url, size = "28px", alt = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const border = useColorModeValue("gray.200", "gray.600");
  const initialsBg = useColorModeValue("green.50", "rgba(22, 163, 74, 0.15)");
  if (url && !failed) {
    return (
      <Box boxSize={size} flexShrink={0} bg="white" border="1px solid" borderColor={border} borderRadius="6px" p="2px">
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
    );
  }
  const initials = (name ?? "?")
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <Center boxSize={size} flexShrink={0} bg={initialsBg} border="1px solid" borderColor={border} borderRadius="6px" aria-hidden={alt === ""}>
      <Text fontSize="10px" fontWeight="700" color="green.600">
        {initials}
      </Text>
    </Center>
  );
}
