import styled from "styled-components";
import { motion } from "framer-motion";
import Link from 'next/link';

const Box = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px) brightness(1.4);
  position: relative;
  display: flex;
  width: 400px;
  min-width: 400px !important;
  min-height: 400px;
  height: 400px;
  margin: 64px;
  font-family: Arial, sans-serif;
  font-weight: bold;
  text-align: center;
  color: #66ff00ef;
  text-shadow: 1px 1px 3px #77ee11;
  padding: 16px;
  z-index: 2;
  overflow: visible;
  clip-path: polygon(
    0 50px,
    0 0,
    350px 0,
    400px 50px,
    400px 350px,
    400px 400px,
    50px 400px,
    0% 350px,
    0% 50px
  );
  & p {
    margin: 16px;
  }
`;

const Content = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 400px;
  height: 400px;
  margin: 64px;
  z-index: 3;
  display: flex;
`

const Path = styled(motion.path)`
  fill: none;
  stroke: #236343;
  stroke-width: 4;
  stroke-miterlimit: 10;
`;

const Svg = styled(motion.svg)`
  outline: none;
  top: 10;
  left: 0;
  width: 400px;
  height: 400px;
  margin: 64px;
  z-index: 3;
  position: absolute;
  flex: 1;
  overflow: visible;
  transition-duration: 0.4s;
  transition-timing-function: ease;
  scale: 0.95;
  &:hover {
    transform: translateY(-20px);
  }
`;

const MenuConetent = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 4; 
  padding: 16px;
  border-radius: 8px;
  margin: 16px;
`

const ContentNavbar = styled.div`
  position: fixed;
  top: 0;
  z-index: 100;
  left:0 ;
  right:0;
  display: flex;
  width: 100vw;
  justify-content: center;
`

const Linked = styled(Link)`
 margin: 16px;
`
const ContentBox = styled.div`
  position: relative;
  z-index: 4;
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-wrap: wrap;

`

export { Box, Content, Path, Svg, MenuConetent, Linked, ContentNavbar, ContentBox }