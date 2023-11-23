import { HStack, Heading, Image } from "@chakra-ui/react";
import logo from "../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <HStack justifyContent="space-between" padding="14px">
      <HStack>
        <Link to="/">
          <Image src={logo} boxSize="60px" borderRadius={8} />
        </Link>
        <Heading color={"lightgreen"}>EEVEE</Heading>
      </HStack>
      <Heading>Electric Vehical Database</Heading>
      <ColorModeSwitch />
    </HStack>
  );
};

export default NavBar;
