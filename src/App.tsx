import React from 'react';
import carrera from './carrera.json';

type Orientacion = "Derecho Empresarial" |
  "Derecho Internacional Público" |
  "Derecho Notarial, Registral e Inmobiliario" |
  "Derecho Penal" |
  "Derecho Privado" |
  "Derecho Público Administrativo" |
  "Derecho Tributario" |
  "Derecho de Trabajo y de Seguridad Social" |
  null;

interface Materia {
  materia: string;
  horas_semana: number;
  horas_totales: number;
  ciclo: 'CBC' | 'CPC' | 'CPO';
  min: null | number;
  max: null | number;
  orientacion: Orientacion;
}

const materias: Materia[] = carrera as Materia[];

function App() {
  const sections = materias.map(({ ciclo }) => ciclo).filter((value, index, self) => self.indexOf(value) === index);
  return (
    <div>
      Hello world
      <ul>
        {sections.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </div>
  );
}

export default App;
