import styled from "styled-components";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Canvas } from "@react-three/fiber";
import { Typography } from "@material-ui/core";
import { Html } from "@react-three/drei";

const Box = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px) brightness(1.4);
  position: relative;
  display: flex;
  width: 600px;
  height: 600px; 
  min-width: 400px !important;
  min-height: 400px;
  font-family: IMB, sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  flex-flow: column;
  color: #66ff00ef;
  text-shadow: 1px 1px 3px #77ee11;
  padding: 32px;
  z-index: 8;
  overflow: visible;
  clip-path: polygon(
    0 50px,
    0 0,
    550px 0,
    600px 50px,
    600px 550px,
    600px 600px,
    50px 600px,
    0% 550px,
    0% 50px
  );
  & p {
    margin: 16px;
  }
`;

const Content = styled.div`
  position: absolute; 
  
  width: 600px;
  height: 600px; 
  z-index: 9;
  display: flex;
  margin: 16px;	
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
  width: 600px;
  height: 600px; 
  z-index: 11;
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
  margin: 16px;
  clip-path: polygon( 0 5%, 0 0, 95% 0, 100% 50%, 100% 95%, 100% 100%, 5% 100%, 0% 50%, 0% 0% );
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
  z-index: 9999999999;
`

const Linked = styled(Link)`
  font-family: IMB, sans-serif; 
  font-weight: bold;
  text-align: center; 
  color: #66ff00ef;
  text-shadow: 1px 1px 3px #77ee11;
 margin: 16px;
`
const ContentBox = styled.div`
  position: relative; 
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-wrap: wrap;
  z-index: 10;


`
const HomeContent = styled.div`
  position: fixed;
  top: 0;
  left:0;   
  z-index: 9;
  width: 100vw;
  height: 100vh;
  display: flex; 
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex-direction: column; 
`
const CanvasContainerAtom = styled(Canvas)`
display: flex;
position: relative;
height: 100px !important;
width: 100px !important;   
`
const CanvasContainer = styled(Canvas)` 
position: absolute;
height: 100vh !important;
width: 100vw !important;  
`
const DivContainer = styled.div`
display: flex;
position: relative;
height: 100vh !important;	
width: 100vw !important; 

`
const Heading = styled(Typography)`
font-size: 2rem;
font-family:  IMB !important;
font-weight: bold;
`
const Typo = styled(Typography)`
font-size: 2rem !important;
font-family: IMB !important;

`
const Typo2 = styled(Typography)`
font-size: 1.2rem !important;
font-family: IMB  !important;
`
const Typo3 = styled(Typography)`
font-size: 1rem !important;
font-family: IMB !important;
`
const Container = styled.div`
overflow: visible;
`
const HTMLContainer = styled(Html)`
z-index: 11 !important;
`


const ProfileImage = styled.img`

`
const Section = styled.div`
`
const Paragraph = styled.div`
`
const Button = styled.button``
const BioYear = styled.div``
const BioSection = styled.div``

const ListItem = styled.li``
const List = styled.ul``

const SimpleGrid = styled.div``
const GridItem = styled.div``
export {
  Box, Content, Path, Svg, MenuConetent, Linked, ContentNavbar, ContentBox, HomeContent,
  CanvasContainer, DivContainer, CanvasContainerAtom, Heading, Typo, Typo2, Typo3,
  HTMLContainer
}