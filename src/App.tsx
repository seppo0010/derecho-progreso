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
  AppBar,
  Toolbar,
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
const materiasPorCiclo: Record<Ciclo, Materia[]> = {
  CBC: materias.filter(({ ciclo }) => ciclo === "CBC"),
  CPC: materias.filter(({ ciclo }) => ciclo === "CPC"),
  CPO: materias.filter(({ ciclo }) => ciclo === "CPO"),
};
const orientaciones = materias
  .map(({ orientacion }) => orientacion)
  .filter((o): o is Orientacion => o !== null)
  .filter((value, index, self) => self.indexOf(value) === index);

function App() {
  const [puntosMaterias, setPuntosMaterias] = useState<Record<string, number>>(
    {}
  );
  const handleToggle = (materia: Materia) => {
    if (puntosMaterias[materia.materia]) {
      // eslint-disable-next-line no-unused-vars
      const { [materia.materia]: _, ...newPuntosMaterias } = puntosMaterias;
      setPuntosMaterias(newPuntosMaterias);
    } else {
      setPuntosMaterias({
        ...puntosMaterias,
        [materia.materia]: 1,
      });
    }
  };
  const handleChange = (materia: Materia, puntos: number) => {
    if (puntos === 0) {
      // eslint-disable-next-line no-unused-vars
      const { [materia.materia]: _, ...newPuntosMaterias } = puntosMaterias;
      setPuntosMaterias(newPuntosMaterias);
    } else {
      setPuntosMaterias({
        ...puntosMaterias,
        [materia.materia]: puntos,
      });
    }
  };

  const [
    materiasSeleccionadasPorCiclo,
    setMateriasSeleccionadasPorCiclo,
  ] = useState<Record<Ciclo, string[]>>();
  useEffect(() => {
    const n = Object.fromEntries(
      ciclos.map((ciclo: Ciclo) => [
        ciclo,
        Object.keys(puntosMaterias).filter(
          (m) => materias.find(({ materia }) => materia === m)?.ciclo === ciclo
        ),
      ])
    ) as Record<Ciclo, string[]>;
    setMateriasSeleccionadasPorCiclo(n);
  }, [puntosMaterias]);

  const markCiclo = (ciclo: Ciclo) => {
    if (materiasSeleccionadasPorCiclo === undefined) return;

    const newPuntosMaterias = { ...puntosMaterias };
    if (
      materiasSeleccionadasPorCiclo[ciclo].length ===
      materiasPorCiclo[ciclo].length
    ) {
      materiasPorCiclo[ciclo].forEach(
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        (materia) => delete newPuntosMaterias[materia.materia]
      );
    } else {
      materiasPorCiclo[ciclo].forEach(
        (materia) =>
          (newPuntosMaterias[materia.materia] = materia.horas_totales)
      );
    }
    setPuntosMaterias(newPuntosMaterias);
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

  const [progress, setProgress] = useState(0.0);

  useEffect(() => {
    const o = orientacion === "" ? orientaciones[0] : orientacion;
    const materiasOrientacion = materias.filter(
      (m) => m.orientacion === null || m.orientacion === o
    );
    setProgress(
      materiasOrientacion
        .filter((m) => puntosMaterias[m.materia])
        .reduce(
          (partialSum, m) =>
            partialSum +
            (m.max === null
              ? m.horas_totales
              : (m.horas_totales * puntosMaterias[m.materia]) / m.max),
          0
        ) /
        materiasOrientacion.reduce(
          (partialSum, m) => partialSum + m.horas_totales,
          0
        )
    );
  }, [puntosMaterias, orientacion]);

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed">
        <Toolbar>Progreso: {Math.round(progress * 100)}%</Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
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
                            {(materia.min === null || materia.max === null) && (
                              <ListItemButton
                                dense
                                onClick={() => handleToggle(materia)}
                              >
                                <ListItemIcon>
                                  <Checkbox
                                    edge="start"
                                    onChange={() => handleToggle(materia)}
                                    checked={!!puntosMaterias[materia.materia]}
                                    tabIndex={-1}
                                  />
                                </ListItemIcon>
                                <ListItemText primary={materia.materia} />
                              </ListItemButton>
                            )}
                            {materia.min !== null && materia.max !== null && (
                              <ListItemButton
                                dense
                                onClick={() =>
                                  document
                                    .getElementById(
                                      `materia-${materia.materia}`
                                    )
                                    ?.focus()
                                }
                              >
                                <Select
                                  id={`materia-${materia.materia}`}
                                  onChange={(ev) =>
                                    handleChange(
                                      materia,
                                      ev.target.value as number
                                    )
                                  }
                                  value={puntosMaterias[materia.materia] ?? 0}
                                  tabIndex={-1}
                                >
                                  {Array.from(
                                    new Array(materia.max + 1),
                                    (_, i) => i
                                  ).map((n) => (
                                    <MenuItem value={n}>{n}</MenuItem>
                                  ))}
                                </Select>
                                <ListItemText primary={materia.materia} />
                              </ListItemButton>
                            )}
                          </ListItem>
                        );
                      })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
