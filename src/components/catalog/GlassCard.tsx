import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";

/** The site's frosted card (white glass, faint green border). */
export default function GlassCard(props: BoxProps) {
  const bg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(45, 55, 72, 0.8)");
  const border = useColorModeValue("rgba(22, 163, 74, 0.12)", "rgba(22, 163, 74, 0.25)");
  return (
    <Box
      bg={bg}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={border}
      borderRadius="16px"
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
      p={{ base: 4, md: 6 }}
      {...props}
    />
  );
}
