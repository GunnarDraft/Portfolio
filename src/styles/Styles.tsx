import styled from "styled-components";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Canvas } from "@react-three/fiber";
import { Typography } from "@material-ui/core";
import { Html } from "@react-three/drei";
const WarningBox = styled.div`
  background: #55000040;
  backdrop-filter: blur(8px) brightness(1.4);
  position: fixed;
  display: flex;
  left:32px;
  width: 600px;
  height: 200px; 
  min-width: 100px;
  min-height: 200px;
  font-family: IMB, sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  flex-flow: column;
  color: #ff0000ee;
  text-shadow: 1px 1px 3px #ee112e;
  padding: 16px;
  z-index: 8;
  overflow: visible;
 clip-path: polygon(
    0 0,      
    90% 0%,    
    100% 30%,    
    100% 100%, 
    10% 100%,    
    0 70%    
  );
  & p {
    margin: 16px;
  }
  @media (max-width: 1400px) {
  display:none; 
    }
`;
const Box = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px) brightness(1.4);
  position: relative;
  display: flex;
  width: 600px;
  height: 600px; 
  min-width: 300px;
  min-height: 300px;
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
  @media (max-width: 600px) {
    width: 300px;
    height: 300px;
     clip-path: polygon(
    0 50px,
    0 0,
    250px 0,
    300px 50px,
    300px 250px,
    300px 300px,
    50px 300px,
    0% 250px,
    0% 50px
  );
  padding: 8px;
  & p {
    margin:4px;
    
  }
  font-size: 10px;

    }
`;

const Content = styled.div`
  position: absolute; 
  
  width: 600px;
  height: 600px; 
  margin: 16px;	
   @media (max-width: 600px) {
    width: 300px;
    height: 300px;
  margin: 4px;	

    }
  z-index: 9;
  display: flex;
`

const Path = styled(motion.path)`
  fill: none;
  stroke: #88dd22af;
  stroke-width: 4;
  stroke-miterlimit: 10;
`;

const Svg = styled(motion.svg)`
  outline: none;
  top: 10;
  left: 0;
  width: 600px;
  height: 600px; 
   @media (max-width: 600px) {
    width: 300px;
    height: 300px;
    }
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
const SvgIn = styled(motion.svg)`
  outline: none;
  height:32px;
  width:32px;
  z-index: 14;
  position: absolute;
  flex: 1;
  overflow: visible;
   bottom:64px;
  left:128px;
  stroke: #66ff00ef;
fill:#00000088;

`;
const SvgBehance = styled(motion.svg)`
fill:#00000088;
 stroke: #66ff00ef;
  bottom:64px;
  right:64px;
  outline: none;
  height:26px;
  width:260px;
  z-index: 14;
  position: absolute;
  flex: 1;
  overflow: visible;
   
`;
const MenuConetent = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 4; 
  padding: 16px; 
  margin: 16px;
  clip-path: polygon( 0 7%, 0 0, 93% 0, 100% 50%, 100% 93%, 100% 100%, 7% 100%, 0% 50%, 0% 0% );
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

font-size: 2rem !important;
font-family:  IMB !important;
font-weight: bold;
 @media (max-width: 600px) {
    font-size: 1rem !important;
    }
`
const Typo = styled(Typography)`
font-size: 2rem !important;
font-family: IMB ;
 @media (max-width: 600px) {
    font-size: 1rem !important;
    }

`
const Typo2 = styled(Typography)`
font-size: 1.2rem !important;
font-family: IMB  !important;
 @media (max-width: 600px) {
    font-size: 0.6rem !important;
    }
`
const Typo3 = styled(Typography)`
font-size: 1rem !important;
font-family: IMB !important;
 @media (max-width: 600px) {
    font-size: 0.7rem !important;
    }
`

const HTMLContainer = styled(Html)`
z-index: 11 ;
`

export {
  Box, Content, Path, Svg, MenuConetent, Linked, ContentNavbar, ContentBox, HomeContent,
  CanvasContainer, DivContainer, CanvasContainerAtom, Heading, Typo, Typo2, Typo3,
  HTMLContainer, SvgIn, SvgBehance, WarningBox
}