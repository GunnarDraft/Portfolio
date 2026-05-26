import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Vector2 } from "three";
import { CanvasContainer, ControlBox } from '../styles/Styles'
import React from 'react'
import { fragmentShader, vertexShader } from "@/componets/orbitalShader";
import {
  Box,
  Slider,
  FormControlLabel,
  Checkbox,
  Switch,
  Select,
  MenuItem,
  Stack,
  Typography,
  Paper,
} from '@mui/material';

const PeriodicTableShader = ({ uniforms }) => {
  const mesh = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false);

    const handleResize = () => {
      if (mesh.current) {
        mesh.current.material.uniforms.u_resolution.value = new Vector2(
          window.innerWidth,
          window.innerHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateMousePosition]);

  useFrame((state) => {
    const { clock } = state;

    if (mesh.current) {
      mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
      mesh.current.material.uniforms.u_mouse.value = new Vector2(
        mousePosition.current.x,
        mousePosition.current.y
      );
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={3}>
      <planeGeometry args={[2, 1, 200, 200]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

const Scene = ({ uniforms }) => {
  return (
    <CanvasContainer camera={{ position: [0.0, 0.0, 1.5] }}>
      <PeriodicTableShader uniforms={uniforms} />
    </CanvasContainer>
  );
};

const controlPanelSx = {
  position: "absolute",
  top: "1rem",
  left: "1rem",
  zIndex: 10,
  width: "auto",
  minWidth: "min(95vw, max-content)",
  maxWidth: "min(95vw, 420px)",
  maxHeight: "calc(100vh - 2rem)",
  height: "auto",
  overflowY: "auto",
  padding: "16px",
  fontSize: "0.95rem",
  lineHeight: 1.4,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const filterBlockSx = {
  p: "1rem",
  border: "1px solid rgba(102, 255, 0, 0.18)",
  borderRadius: "18px",
  background: "rgba(0, 0, 0, 0.22)",
};

const sliderSx = {
  "& .MuiSlider-thumb": { backgroundColor: "#66ff00ef" },
  "& .MuiSlider-track": { backgroundColor: "#66ff00ef" },
  "& .MuiSlider-rail": { backgroundColor: "rgba(102, 255, 0, 0.12)" },
};

const selectSx = {
  background: "#1f2937",
  color: "#f8f9fa",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(102, 255, 0, 0.18)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(102, 255, 0, 0.36)",
  },
  "& .MuiSvgIcon-root": {
    color: "#66ff00ef",
  },
};

export default function PeriodicTable() {
  const [layoutMode, setLayoutMode] = useState(0);
  const [filterActive, setFilterActive] = useState(0);
  const [colorMode, setColorMode] = useState(0);
  const [enableIdFilter, setEnableIdFilter] = useState(0);
  const [idFilterStart, setIdFilterStart] = useState(0);
  const [idFilterEnd, setIdFilterEnd] = useState(0);
  const [enableLFilter, setEnableLFilter] = useState(1);
  const [lFilterStart, setLFilterStart] = useState(0);
  const [lFilterEnd, setLFilterEnd] = useState(3);
  const [enableNFilter, setEnableNFilter] = useState(0);
  const [nFilterStart, setNFilterStart] = useState(0);
  const [nFilterEnd, setNFilterEnd] = useState(-1);
  const [enableSpinFilter, setEnableSpinFilter] = useState(0);
  const [spinValue, setSpinValue] = useState(0); // 0 = up (+0.5), 1 = down (-0.5)
  const [enableMFilter, setEnableMFilter] = useState(0);
  const [mFilterStart, setMFilterStart] = useState(0);
  const [mFilterEnd, setMFilterEnd] = useState(-1);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0.0 },
      u_mouse: { value: new Vector2() },
      u_resolution: {
        value:
          typeof window !== "undefined"
            ? new Vector2(window.innerWidth, window.innerHeight)
            : new Vector2(1, 1),
      },
      u_layout_mode: { value: layoutMode },
      u_filter_active: { value: filterActive },
      u_color_mode: { value: colorMode },
      u_enable_id_filter: { value: enableIdFilter },
      u_filter_id_start: { value: idFilterStart },
      u_filter_id_end: { value: idFilterEnd },
      u_enable_l_filter: { value: enableLFilter },
      u_filter_l_start: { value: lFilterStart },
      u_filter_l_end: { value: lFilterEnd },
      u_enable_n_filter: { value: enableNFilter },
      u_filter_n_start: { value: nFilterStart },
      u_filter_n_end: { value: nFilterEnd },
      u_enable_spin_filter: { value: enableSpinFilter },
      u_filter_spin_start: { value: spinValue },
      u_filter_spin_end: { value: spinValue },
      u_enable_m_filter: { value: enableMFilter },
      u_filter_m_start: { value: mFilterStart },
      u_filter_m_end: { value: mFilterEnd },
    }),
    [
      layoutMode,
      filterActive,
      colorMode,
      enableIdFilter,
      idFilterStart,
      idFilterEnd,
      enableLFilter,
      lFilterStart,
      lFilterEnd,
      enableNFilter,
      nFilterStart,
      nFilterEnd,
      enableSpinFilter,
      spinValue,
      enableMFilter,
      mFilterStart,
      mFilterEnd,
    ]
  );

  return (
    <div style={{ position: "absolute", minHeight: "100vh", minWidth: "100vw", overflow: "visible" }}>
      <Scene uniforms={uniforms} />
      <Box component={ControlBox} sx={controlPanelSx}>

        <Stack spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#d7ffd4" }}>
            Layout
          </Typography>
          <Select
            value={layoutMode}
            onChange={(e) => setLayoutMode(Number(e.target.value))}
            size="small"
            sx={selectSx}
          >
            <MenuItem value={0}>Mendeléyev</MenuItem>
            <MenuItem value={1}>Tetrahedron</MenuItem>
          </Select>
        </Stack>
        <Stack spacing={1} sx={{ mt: "1rem" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#d7ffd4" }}>
            Modo de color
          </Typography>
          <Select
            value={colorMode}
            onChange={(e) => setColorMode(Number(e.target.value))}
            size="small"
            sx={selectSx}
          >
            <MenuItem value={0}>Espín</MenuItem>
            <MenuItem value={3}>Real</MenuItem>
            {/* <MenuItem value={1}>Visible</MenuItem>
            <MenuItem value={2}>Absorción</MenuItem> */}
          </Select>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={filterActive === 1}
              onChange={(e) => setFilterActive(e.target.checked ? 1 : 0)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#66ff00ef" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#66ff00ef" },
              }}
            />
          }
          label={<Typography sx={{ color: "#d7ffd4", fontWeight: 500 }}>Filtros activos</Typography>}
        />



        <Typography variant="caption" sx={{ mt: "1rem", fontWeight: 600, color: "#d7ffd4" }}>
          Filtros por categoría
        </Typography>

        {/* spin Filter */}
        <Paper sx={filterBlockSx}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableSpinFilter === 1}
                  onChange={(e) => setEnableSpinFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4" }}>spin</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={spinValue === 1}
                  onChange={(e) => setSpinValue(e.target.checked ? 1 : 0)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#66ff00ef" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#66ff00ef" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontWeight: 600, color: "#d7ffd4", fontSize: "0.9rem" }}>
                  {spinValue === 0 ? "↑ (up +½)" : "↓ (down -½)"}
                </Typography>
              }
            />
          </Stack>
        </Paper>

        {/* ID Filter */}
        <Paper sx={filterBlockSx}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableIdFilter === 1}
                  onChange={(e) => setEnableIdFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4" }}>ID</Typography>}
            />
            <Stack direction="row" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  inicio
                </Typography>
                <Slider
                  value={idFilterStart}
                  onChange={(e, value) => setIdFilterStart(value as number)}
                  min={0}
                  max={118}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  fin
                </Typography>
                <Slider
                  value={idFilterEnd}
                  onChange={(e, value) => setIdFilterEnd(value as number)}
                  min={0}
                  max={118}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* l Filter */}
        <Paper sx={filterBlockSx}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableLFilter === 1}
                  onChange={(e) => setEnableLFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4" }}>l</Typography>}
            />
            <Stack direction="row" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  inicio
                </Typography>
                <Slider
                  value={lFilterStart}
                  onChange={(e, value) => setLFilterStart(value as number)}
                  min={0}
                  max={3}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  fin
                </Typography>
                <Slider
                  value={lFilterEnd}
                  onChange={(e, value) => setLFilterEnd(value as number)}
                  min={0}
                  max={3}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* n Filter */}
        <Paper sx={filterBlockSx}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableNFilter === 1}
                  onChange={(e) => setEnableNFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4" }}>n</Typography>}
            />
            <Stack direction="row" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  inicio
                </Typography>
                <Slider
                  value={nFilterStart}
                  onChange={(e, value) => setNFilterStart(value as number)}
                  min={1}
                  max={7}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  fin
                </Typography>
                <Slider
                  value={nFilterEnd}
                  onChange={(e, value) => setNFilterEnd(value as number)}
                  min={1}
                  max={7}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>


        {/* m Filter */}
        <Paper sx={filterBlockSx}>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableMFilter === 1}
                  onChange={(e) => setEnableMFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4" }}>m</Typography>}
            />
            <Stack direction="row" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  inicio
                </Typography>
                <Slider
                  value={mFilterStart}
                  onChange={(e, value) => setMFilterStart(value as number)}
                  min={-3}
                  max={3}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: "#e8ffe8", fontWeight: 700, display: "block", mb: 0.5 }}>
                  fin
                </Typography>
                <Slider
                  value={mFilterEnd}
                  onChange={(e, value) => setMFilterEnd(value as number)}
                  min={-3}
                  max={3}
                  marks
                  valueLabelDisplay="auto"
                  sx={sliderSx}
                />
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </div>
  );
}
