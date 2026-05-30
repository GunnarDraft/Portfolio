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
  type MenuProps,
} from '@mui/material';

type PeriodicTableShaderProps = {
  uniforms: Record<string, { value: any }>;
};

const PeriodicTableShader: React.NamedExoticComponent<PeriodicTableShaderProps> = React.memo(
  function PeriodicTableShader({ uniforms }: PeriodicTableShaderProps) {
    const mesh = useRef(null);
    const mousePosition = useRef({ x: 0, y: 0 });
    const resolution = useRef(new Vector2(1, 1));
    const mouse = useRef(new Vector2());

    const updateMousePosition = useCallback((e) => {
      mousePosition.current = { x: e.pageX, y: e.pageY };
    }, []);

    useEffect(() => {
      window.addEventListener("mousemove", updateMousePosition, false);

      const handleResize = () => {
        if (mesh.current) {
          resolution.current.set(window.innerWidth, window.innerHeight);
          mesh.current.material.uniforms.u_resolution.value.copy(resolution.current);
        }
      };

      handleResize();
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
        mouse.current.set(mousePosition.current.x, mousePosition.current.y);
        mesh.current.material.uniforms.u_mouse.value.copy(mouse.current);
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
  });

const Scene: React.NamedExoticComponent<PeriodicTableShaderProps> = React.memo(
  function Scene({ uniforms }: PeriodicTableShaderProps) {
    return (
      <CanvasContainer camera={{ position: [0.0, 0.0, 1.5] }}>
        <PeriodicTableShader uniforms={uniforms} />
      </CanvasContainer>
    );
  });

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
  background: "rgba(0, 85, 62, 0.1) !important",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35) !important",
};

const filterBlockSx = {
  p: "1rem",
  width: "300px",
  height: "130px",
  clipPath: "polygon(0 0, calc(300px - 20px) 0, 300px 20px, 300px 130px, 20px 130px, 0 calc(130px - 20px))",
  background: "rgba(15, 41, 27, 0.5)",
  backdropFilter: "blur(22px)",

};

const FilterBlock = ({ children }) => (
  <Box sx={{ position: "relative" }}>
    <Paper sx={filterBlockSx}>
      {children}
    </Paper>
    <svg
      viewBox="0 0 300 130"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "300px",
        height: "130px",
        pointerEvents: "none",
      }}
    >
      <polyline
        points="0,0 280,0 300,20 300,130 20,130 0,110 0,0"
        fill="none"
        stroke="#66ff00ef"
        strokeWidth="0.5"
      />
    </svg>
  </Box>
);

const sliderSx = {
  "& .MuiSlider-thumb": { backgroundColor: "#66ff00ef" },
  "& .MuiSlider-track": { backgroundColor: "#66ff00ef" },
  "& .MuiSlider-rail": { backgroundColor: "rgba(102, 255, 0, 0.12)" },
};

const switchSx = {
  "& .MuiSwitch-thumb": {
    borderRadius: "25%",
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#66ff00ef",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#66ff00ef",
  },
};

const formControlLabelSx = {
  display: "flex",
  alignItems: "center",
  minHeight: 42,
  height: 42,
  py: 0,
  marginRight: 0,
  "& .MuiFormControlLabel-label": {
    lineHeight: "42px",
    margin: 0,
  },
  "& .MuiCheckbox-root, & .MuiSwitch-root": {
    padding: 0,
  },
};

const selectSx = {
  background: "#1f372c7c",
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

const selectMenuProps: Partial<MenuProps> = {
  slotProps: {
    paper: {
      sx: {
        background: "#1f372c2d",
        color: "#f8f9fa",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(102, 255, 0, 0.18)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        "& .MuiMenuItem-root": {
          color: "#f8f9fa",
          backgroundColor: "transparent",
        },
        "& .MuiMenuItem-root:hover": {
          backgroundColor: "rgba(102, 255, 0, 0.12)",
        },
        "& .MuiMenuItem-root.Mui-selected": {
          backgroundColor: "rgba(102, 255, 0, 0.2)",
        },
      },
    },
  },
};

const checkboxIcon = (
  <Box
    sx={{
      width: 18,
      height: 18,
      borderRadius: "8px",
      border: "1px solid rgba(102, 255, 0, 0.6)",
      bgcolor: "transparent",
      boxSizing: "border-box",
    }}
  />
);

const checkboxCheckedIcon = (
  <Box
    sx={{
      width: 18,
      height: 18,
      borderRadius: "8px",
      border: "1px solid rgba(102, 255, 0, 0.6)",
      bgcolor: "#66ff00ef",
      boxSizing: "border-box",
    }}
  />
);

export default function PeriodicTable() {
  const [layoutMode, setLayoutMode] = useState(0);
  const [filterActive, setFilterActive] = useState(0);
  const [colorMode, setColorMode] = useState(0);
  const [enableIdFilter, setEnableIdFilter] = useState(0);
  const [idFilterStart, setIdFilterStart] = useState(0);
  const [idFilterEnd, setIdFilterEnd] = useState(118);
  const [enableLFilter, setEnableLFilter] = useState(0);
  const [lFilterStart, setLFilterStart] = useState(0);
  const [lFilterEnd, setLFilterEnd] = useState(3);
  const [enableNFilter, setEnableNFilter] = useState(0);
  const [nFilterStart, setNFilterStart] = useState(1);
  const [nFilterEnd, setNFilterEnd] = useState(7);
  const [enableSpinFilter, setEnableSpinFilter] = useState(0);
  const [spinValue, setSpinValue] = useState(0); // 0 = up (+0.5), 1 = down (-0.5)
  const [enableMFilter, setEnableMFilter] = useState(0);
  const [mFilterStart, setMFilterStart] = useState(-3);
  const [mFilterEnd, setMFilterEnd] = useState(3);
  const [resolution, setResolution] = useState(
    () =>
      typeof window !== "undefined"
        ? new Vector2(window.innerWidth, window.innerHeight)
        : new Vector2(1, 1)
  );

  useEffect(() => {
    const handleResize = () => {
      setResolution(new Vector2(window.innerWidth, window.innerHeight));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0.0 },
      u_mouse: { value: new Vector2() },
      u_resolution: { value: resolution },
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
      resolution,
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
            MenuProps={selectMenuProps}
          >
            <MenuItem value={0}>Mendeléyev</MenuItem>
            <MenuItem value={1}>Tetrahedron</MenuItem>
          </Select>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#d7ffd4" }}>
            Modo de color
          </Typography>
          <Select
            value={colorMode}
            onChange={(e) => setColorMode(Number(e.target.value))}
            size="small"
            sx={selectSx}
            MenuProps={selectMenuProps}
          >
            <MenuItem value={0}>Espín</MenuItem>
            <MenuItem value={3}>Real</MenuItem>
            {/* <MenuItem value={1}>Visible</MenuItem>
            <MenuItem value={2}>Absorción</MenuItem> */}
          </Select>
        </Stack>
        <FormControlLabel
          sx={formControlLabelSx}
          control={
            <Switch
              checked={filterActive === 1}
              onChange={(e) => setFilterActive(e.target.checked ? 1 : 0)}
              sx={switchSx}
            />
          }
          label={<Typography sx={{ color: "#d7ffd4", fontWeight: 500 }}>Filtros activos</Typography>}
        />


        {/* spin Filter */}
        <FilterBlock>
          <Stack spacing={1}>
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Checkbox
                  checked={enableSpinFilter === 1}
                  onChange={(e) => setEnableSpinFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" } }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4", fontSize: "0.8rem" }}>Filtro por Spin</Typography>}
            />
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Switch
                  checked={spinValue === 1}
                  onChange={(e) => setSpinValue(e.target.checked ? 1 : 0)}
                  sx={switchSx}
                />
              }
              label={
                <Typography sx={{ fontWeight: 600, color: "#d7ffd4", fontSize: "1rem" }}>
                  {spinValue === 0 ? "↑ (up +½)" : "↓ (down -½)"}
                </Typography>
              }
            />
          </Stack>
        </FilterBlock>

        {/* ID Filter */}
        <FilterBlock>
          <Stack spacing={1}>
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Checkbox
                  checked={enableIdFilter === 1}
                  onChange={(e) => setEnableIdFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" }, height: 42 }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4", fontSize: "0.8rem" }}>Filtro por ID</Typography>}
            />
            <Box>
              <Slider
                value={[idFilterStart, idFilterEnd]}
                onChange={(e, value) => {
                  const [start, end] = value as number[];
                  setIdFilterStart(start);
                  setIdFilterEnd(end);
                }}
                min={0}
                max={118}
                marks
                valueLabelDisplay="auto"
                disableSwap
                sx={sliderSx}
              />
            </Box>
          </Stack>
        </FilterBlock>

        {/* l Filter */}
        <FilterBlock>
          <Stack spacing={1}>
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Checkbox
                  checked={enableLFilter === 1}
                  onChange={(e) => setEnableLFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" }, height: 42 }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4", fontSize: "0.8rem" }}>Filtro por número <i>l</i></Typography>}
            />
            <Box>
              <Slider
                value={[lFilterStart, lFilterEnd]}
                onChange={(e, value) => {
                  const [start, end] = value as number[];
                  setLFilterStart(start);
                  setLFilterEnd(end);
                }}
                min={0}
                max={3}
                marks
                valueLabelDisplay="auto"
                disableSwap
                sx={sliderSx}
              />
            </Box>
          </Stack>
        </FilterBlock>

        {/* n Filter */}
        <FilterBlock>
          <Stack spacing={1}>
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Checkbox
                  checked={enableNFilter === 1}
                  onChange={(e) => setEnableNFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" }, height: 42 }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4", fontSize: "0.8rem" }}>Filtro por número <i>n</i></Typography>}
            />
            <Box>
              <Slider
                value={[nFilterStart, nFilterEnd]}
                onChange={(e, value) => {
                  const [start, end] = value as number[];
                  setNFilterStart(start);
                  setNFilterEnd(end);
                }}
                min={1}
                max={7}
                marks
                valueLabelDisplay="auto"
                disableSwap
                sx={sliderSx}
              />
            </Box>
          </Stack>
        </FilterBlock>


        {/* m Filter */}
        <FilterBlock>
          <Stack spacing={1}>
            <FormControlLabel
              sx={formControlLabelSx}
              control={
                <Checkbox
                  checked={enableMFilter === 1}
                  onChange={(e) => setEnableMFilter(e.target.checked ? 1 : 0)}
                  sx={{ color: "#66ff00ef", "&.Mui-checked": { color: "#66ff00ef" }, height: 42 }}
                />
              }
              label={<Typography sx={{ fontWeight: 700, color: "#d7ffd4", fontSize: "0.8rem" }}>Filtro por número <i>m</i></Typography>}
            />
            <Box>
              <Slider
                value={[mFilterStart, mFilterEnd]}
                onChange={(e, value) => {
                  const [start, end] = value as number[];
                  setMFilterStart(start);
                  setMFilterEnd(end);
                }}
                min={-3}
                max={3}
                marks
                valueLabelDisplay="auto"
                disableSwap
                sx={sliderSx}
              />
            </Box>
          </Stack>
        </FilterBlock>
      </Box>
    </div>
  );
}
