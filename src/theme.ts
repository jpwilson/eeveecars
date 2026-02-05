import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#e6f7ed",
      100: "#c3ebd3",
      200: "#9ddfb7",
      300: "#74d39b",
      400: "#4ec77f",
      500: "#16a34a",
      600: "#12863d",
      700: "#0e6930",
      800: "#0a4c23",
      900: "#062f16",
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.800" : "#f0f4f8",
      },
    }),
  },
});

export default theme;
