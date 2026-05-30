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
  top:42%;
  left:calc(50vw - 300px);
  width: 600px;
  height: min-content; 
   z-index:20;
  min-width: 100px;
  min-height: 260px;
  font-family: IMB, sans-serif;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  flex-flow: column;
  color: #ff0000ee;
  text-shadow: 1px 1px 3px #ee112e;
  padding: 16px; 
  overflow: visible;
  --warning-w: 600px;
  --warning-h: 260px;
  --warning-b: 60px;
  clip-path: polygon(
    0px 0px,
    calc(var(--warning-w) - var(--warning-b)) 0px,
    var(--warning-w) var(--warning-b),
    var(--warning-w) var(--warning-h),
    var(--warning-b) var(--warning-h),
    0px calc(var(--warning-h) - var(--warning-b))
  );
  & p {
    margin: 16px;
  }
  @media (max-width: 1400px) {
  display:none; 
    }
`;
const WarningText = styled.p`
 color:#f00;
 


`

const WarningClose = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border: none;
  box-sizing: border-box;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0);
  color: #ffdddd;
  font-size: 1rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.2s ease, background 0.2s ease;
  &:hover { 
    transform: rotate(90deg);
  }
  &:focus {
    outline: 2px solid #ff8888; 
  }
`
const Box = styled.div`
  background: #00553e40;
  backdrop-filter: blur(8px) brightness(1.4);
  position: absolute;
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
  --box-w: 600px;
  --box-h: 600px;
  --box-b: 50px;
  clip-path: polygon(
    0px var(--box-b),
    0px 0px,
    calc(var(--box-w) - var(--box-b)) 0px,
    var(--box-w) var(--box-b),
    var(--box-w) calc(var(--box-h) - var(--box-b)),
    var(--box-w) var(--box-h),
    var(--box-b) var(--box-h),
    0px calc(var(--box-h) - var(--box-b)),
    0px var(--box-b)
  );
  & p {
    margin: 16px;
  }
  @media (max-width: 600px) {
    width: 300px;
    height: 300px;
     --box-w: 300px;
     --box-h: 300px;
     --box-b: 25px;
     clip-path: polygon(
    0px var(--box-b),
    0px 0px,
    calc(var(--box-w) - var(--box-b)) 0px,
    var(--box-w) var(--box-b),
    var(--box-w) calc(var(--box-h) - var(--box-b)),
    var(--box-w) var(--box-h),
    var(--box-b) var(--box-h),
    0px calc(var(--box-h) - var(--box-b)),
    0px var(--box-b)
  );
  padding: 8px;
  & p {
    margin:4px;
    
  }
  font-size: 10px;

    }
`;

const ControlBox = styled(Box)`
  position: absolute !important ;
  width: min(95vw, 340px);
  max-width: 340px;
  max-height: calc(100vh - 2rem);
  min-height: auto;
  height: auto;
  padding: 24px;
  overflow-y: auto;
  --control-w: 340px;
  --control-h: calc(100vh - 2rem);
  --control-b: 50px;
  clip-path: polygon(
    0px var(--control-b),
    0px 0px,
    var(--control-w) 0px,
    var(--control-w) var(--control-b),
    var(--control-w) calc(var(--control-h) - var(--control-b)),
    var(--control-w) var(--control-h),
    var(--control-b) var(--control-h),
    0px calc(var(--control-h) - var(--control-b)),
    0px var(--control-b)
  );
  @media (max-width: 600px) {
    width: min(95vw, 300px);
    max-width: 300px;
    --control-w: 300px;
    --control-h: calc(100vh - 2rem);
    --control-b: 30px;
    clip-path: polygon(
      0px var(--control-b),
      0px 0px,
      var(--control-w) 0px,
      var(--control-w) var(--control-b),
      var(--control-w) calc(var(--control-h) - var(--control-b)),
      var(--control-w) var(--control-h),
      var(--control-b) var(--control-h),
      0px calc(var(--control-h) - var(--control-b)),
      0px var(--control-b)
    );
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
  height: 64px;
  width: 520px;
  --menu-w: 520px;
  --menu-h: 64px;
  --menu-b: 32px;
  clip-path: polygon(
    0px calc(var(--menu-b) / 2),
    0px 0px,
    calc(var(--menu-w) - var(--menu-b)) 0px,
    var(--menu-w) calc(var(--menu-h) / 2),
    var(--menu-w) calc(var(--menu-h) - calc(var(--menu-b) / 2)),
    var(--menu-w) var(--menu-h),
    var(--menu-b) var(--menu-h),
    0px calc(var(--menu-h) / 2),
    0px 0px
  );
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
  position: absolute; 
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
const Heading = styled.p`

font-size: 1rem !important;
font-family:  IMB !important;
font-weight: bold;
 @media (max-width: 600px) {
    font-size: 1rem !important;
    }
`
const Typo = styled.p`
font-size: 1rem !important;
font-family: IMB ;
 @media (max-width: 600px) {
    font-size: 1rem !important;
    }

`
const Typo2 = styled.p`
font-size: 1rem !important;
font-family: IMB  !important;
 @media (max-width: 600px) {
    font-size: 0.6rem !important;
    }
`
const Typo3 = styled.p`
font-size: 0.7rem !important;
font-family: IMB !important;
 @media (max-width: 600px) {
    font-size: 0.7rem !important;
    }
`

const HTMLContainer = styled(Html)`
z-index: 11 ;
`

export {
  Box, ControlBox, Content, Path, Svg, MenuConetent, Linked, ContentNavbar, ContentBox, HomeContent,
  CanvasContainer, DivContainer, CanvasContainerAtom, Heading, Typo, Typo2, Typo3,
  HTMLContainer, SvgIn, SvgBehance, WarningBox, WarningClose
}