import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Container,
  CssBaseline,
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import carrera from "./carrera.json";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type Orientacion =
  | "Derecho Empresarial"
  | "Derecho Internacional Público"
  | "Derecho Notarial, Registral e Inmobiliario"
  | "Derecho Penal"
  | "Derecho Privado"
  | "Derecho Público Administrativo"
  | "Derecho Tributario"
  | "Derecho de Trabajo y de Seguridad Social";

type Ciclo = "CBC" | "CPC" | "CPO";
interface Materia {
  materia: string;
  horas_semana: number;
  horas_totales: number;
  ciclo: Ciclo;
  min: null | number;
  max: null | number;
  orientacion: Orientacion | null;
}

const materias: Materia[] = carrera as Materia[];
const theme = createTheme();

const ciclos: Ciclo[] = materias
  .map(({ ciclo }) => ciclo)
  .filter((value, index, self) => self.indexOf(value) === index);
const materiasPorCiclo: Record<Ciclo, string[]> = {
  CBC: materias
    .filter(({ ciclo }) => ciclo === "CBC")
    .map(({ materia }) => materia),
  CPC: materias
    .filter(({ ciclo }) => ciclo === "CPC")
    .map(({ materia }) => materia),
  CPO: materias
    .filter(({ ciclo }) => ciclo === "CPO")
    .map(({ materia }) => materia),
};
const orientaciones = materias
  .map(({ orientacion }) => orientacion)
  .filter((o): o is Orientacion => o !== null)
  .filter((value, index, self) => self.indexOf(value) === index);

function App() {
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<string[]>(
    []
  );
  const handleToggle = (value: string) => {
    const currentIndex = materiasSeleccionadas.indexOf(value);
    const newChecked = [...materiasSeleccionadas];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setMateriasSeleccionadas(newChecked);
  };

  const [materiasSeleccionadasPorCiclo, setMateriasSeleccionadasPorCiclo] =
    useState<Record<Ciclo, string[]>>();
  useEffect(() => {
    const n = Object.fromEntries(
      ciclos.map((ciclo: Ciclo) => [
        ciclo,
        materiasSeleccionadas.filter(
          (m) => materias.find(({ materia }) => materia === m)?.ciclo === ciclo
        ),
      ])
    ) as Record<Ciclo, string[]>;
    setMateriasSeleccionadasPorCiclo(n);
  }, [materiasSeleccionadas]);

  const markCiclo = (ciclo: Ciclo) => {
    if (materiasSeleccionadasPorCiclo === undefined) return;

    const m = [...materiasSeleccionadas];
    if (
      materiasSeleccionadasPorCiclo[ciclo].length ===
      materiasPorCiclo[ciclo].length
    ) {
      materiasPorCiclo[ciclo].forEach(
        (materia) => m.includes(materia) && m.splice(m.indexOf(materia), 1)
      );
    } else {
      materiasPorCiclo[ciclo].forEach(
        (materia) => !m.includes(materia) && m.push(materia)
      );
    }
    setMateriasSeleccionadas(m);
  };

  const displayMateriasSeleccionadas = (
    materiasSeleccionadasPorCiclo: undefined | Record<Ciclo, string[]>,
    ciclo: Ciclo
  ): string => {
    if (materiasSeleccionadasPorCiclo === undefined) return "";
    const l = materiasSeleccionadasPorCiclo[ciclo].length;
    if (l === materiasPorCiclo[ciclo].length) return "Todas seleccionadas";
    if (l === 0) return "Ninguna seleccionada";
    if (l === 1) return "1 seleccionada";
    if (l > 1) return `${l} seleccionadas`;
    return "";
  };

  const [orientacion, setOrientacion] = useState<Orientacion | "">("");

  const [openProgress, setOpenProgress] = useState(false);
  const [progress, setProgress] = useState(0.0);
  const handleCloseProgress = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenProgress(false);
  };

  useEffect(() => {
    const o = orientacion === "" ? orientaciones[0] : orientacion;
    const materiasOrientacion = materias.filter(
      (m) => m.orientacion === null || m.orientacion === o
    );
    setOpenProgress(true);
    setProgress(
      materiasOrientacion
        .filter((m) => materiasSeleccionadas.includes(m.materia))
        .reduce((partialSum, m) => partialSum + m.horas_totales, 0) /
        materiasOrientacion.reduce(
          (partialSum, m) => partialSum + m.horas_totales,
          0
        )
    );
  }, [materiasSeleccionadas, orientacion]);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {ciclos.map((ciclo) => (
            <Accordion key={ciclo} sx={{ width: "100%" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ width: "33%", flexShrink: 0 }}>
                  {ciclo}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {displayMateriasSeleccionadas(
                    materiasSeleccionadasPorCiclo,
                    ciclo
                  )}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List sx={{ width: "100%" }}>
                  {ciclo === "CPO" && (
                    <ListItem disablePadding>
                      <FormControl fullWidth>
                        <InputLabel id="orientacion-label">
                          Orientación
                        </InputLabel>
                        <Select
                          labelId="orientacion-label"
                          label="Orientación"
                          sx={{ width: "100%" }}
                          value={orientacion}
                          onChange={(event) =>
                            setOrientacion(event.target.value as Orientacion)
                          }
                        >
                          <MenuItem value={""}>
                            Seleccionar orientación
                          </MenuItem>
                          {orientaciones.map((o) => (
                            <MenuItem key={o} value={o}>
                              {o}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </ListItem>
                  )}
                  {ciclo !== "CPO" && (
                    <ListItem disablePadding>
                      <ListItemButton dense onClick={() => markCiclo(ciclo)}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            onChange={() => markCiclo(ciclo)}
                            checked={
                              materiasSeleccionadasPorCiclo !== undefined
                                ? materiasSeleccionadasPorCiclo[ciclo]
                                    .length === materiasPorCiclo[ciclo].length
                                : false
                            }
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText primary="Todas" />
                      </ListItemButton>
                    </ListItem>
                  )}
                  {(ciclo !== "CPO" || orientacion !== "") &&
                    materias
                      .filter((m) => m.ciclo === ciclo)
                      .filter(
                        (m) =>
                          ciclo !== "CPO" ||
                          m.orientacion === null ||
                          m.orientacion === orientacion
                      )
                      .map((materia) => {
                        return (
                          <ListItem
                            key={`${materia.orientacion ?? ""}-${
                              materia.materia
                            }`}
                            disablePadding
                          >
                            <ListItemButton
                              dense
                              onClick={() => handleToggle(materia.materia)}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  onChange={() => handleToggle(materia.materia)}
                                  checked={materiasSeleccionadas.includes(
                                    materia.materia
                                  )}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText primary={materia.materia} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        <Snackbar
          open={openProgress}
          autoHideDuration={6000}
          onClose={handleCloseProgress}
          message={`¡${Math.round(progress * 100)}% completado!`}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
