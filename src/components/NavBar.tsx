import { HStack, Image } from "@chakra-ui/react";
import logo from "../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <HStack justifyContent="space-between" padding="14px">
      <Link to="/">
        <Image src={logo} boxSize="60px" borderRadius={8} />
      </Link>
      <ColorModeSwitch />
    </HStack>
  );
};

export default NavBar;
