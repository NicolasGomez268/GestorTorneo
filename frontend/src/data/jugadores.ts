import type { Jugador } from './tipos'

export const jugadores: Jugador[] = [
  // ── DIVISIÓN A ──────────────────────────────────────────

  // Shadow Titans (eq-1)
  { id: 'j-01', equipoId: 'eq-1', nombre: 'Marcos',      apellido: 'Vega',      dorsal: 5,  posicion: 'Base'      },
  { id: 'j-02', equipoId: 'eq-1', nombre: 'Lucas',       apellido: 'Romero',    dorsal: 7,  posicion: 'Escolta'   },
  { id: 'j-03', equipoId: 'eq-1', nombre: 'Nicolás',     apellido: 'Torres',    dorsal: 10, posicion: 'Alero'     },
  { id: 'j-04', equipoId: 'eq-1', nombre: 'Rodrigo',     apellido: 'Sosa',      dorsal: 14, posicion: 'Ala-Pívot' },
  { id: 'j-05', equipoId: 'eq-1', nombre: 'Diego',       apellido: 'Herrera',   dorsal: 21, posicion: 'Pívot'     },
  { id: 'j-06', equipoId: 'eq-1', nombre: 'Agustín',     apellido: 'López',     dorsal: 3,  posicion: 'Base'      },
  { id: 'j-07', equipoId: 'eq-1', nombre: 'Sebastián',   apellido: 'Díaz',      dorsal: 8,  posicion: 'Alero'     },
  { id: 'j-08', equipoId: 'eq-1', nombre: 'Julián',      apellido: 'Martínez',  dorsal: 23, posicion: 'Pívot'     },

  // Neon Drifters (eq-2)
  { id: 'j-09', equipoId: 'eq-2', nombre: 'Tomás',       apellido: 'Ruiz',      dorsal: 4,  posicion: 'Base'      },
  { id: 'j-10', equipoId: 'eq-2', nombre: 'Facundo',     apellido: 'Acosta',    dorsal: 11, posicion: 'Escolta'   },
  { id: 'j-11', equipoId: 'eq-2', nombre: 'Matías',      apellido: 'Peralta',   dorsal: 15, posicion: 'Alero'     },
  { id: 'j-12', equipoId: 'eq-2', nombre: 'Emilio',      apellido: 'Gómez',     dorsal: 20, posicion: 'Ala-Pívot' },
  { id: 'j-13', equipoId: 'eq-2', nombre: 'Pablo',       apellido: 'Fernández', dorsal: 32, posicion: 'Pívot'     },
  { id: 'j-14', equipoId: 'eq-2', nombre: 'Iván',        apellido: 'Castillo',  dorsal: 6,  posicion: 'Escolta'   },
  { id: 'j-15', equipoId: 'eq-2', nombre: 'Bruno',       apellido: 'Morales',   dorsal: 9,  posicion: 'Alero'     },

  // Apex Raptors (eq-3)
  { id: 'j-16', equipoId: 'eq-3', nombre: 'Ezequiel',    apellido: 'Ríos',      dorsal: 1,  posicion: 'Base'      },
  { id: 'j-17', equipoId: 'eq-3', nombre: 'Leandro',     apellido: 'Medina',    dorsal: 13, posicion: 'Escolta'   },
  { id: 'j-18', equipoId: 'eq-3', nombre: 'Germán',      apellido: 'Suárez',    dorsal: 17, posicion: 'Alero'     },
  { id: 'j-19', equipoId: 'eq-3', nombre: 'Cristian',    apellido: 'Vargas',    dorsal: 22, posicion: 'Pívot'     },
  { id: 'j-20', equipoId: 'eq-3', nombre: 'Andrés',      apellido: 'Delgado',   dorsal: 30, posicion: 'Ala-Pívot' },
  { id: 'j-36', equipoId: 'eq-3', nombre: 'Patricio',    apellido: 'Núñez',     dorsal: 5,  posicion: 'Base'      },
  { id: 'j-37', equipoId: 'eq-3', nombre: 'Rodrigo',     apellido: 'Ibáñez',    dorsal: 7,  posicion: 'Escolta'   },

  // Iron Hawks (eq-4)
  { id: 'j-21', equipoId: 'eq-4', nombre: 'Fernando',    apellido: 'Navarro',   dorsal: 2,  posicion: 'Base'      },
  { id: 'j-22', equipoId: 'eq-4', nombre: 'Maximiliano', apellido: 'Cruz',      dorsal: 12, posicion: 'Escolta'   },
  { id: 'j-23', equipoId: 'eq-4', nombre: 'Ramiro',      apellido: 'Ortega',    dorsal: 18, posicion: 'Alero'     },
  { id: 'j-24', equipoId: 'eq-4', nombre: 'Santiago',    apellido: 'Reyes',     dorsal: 25, posicion: 'Pívot'     },
  { id: 'j-25', equipoId: 'eq-4', nombre: 'Héctor',      apellido: 'Campos',    dorsal: 33, posicion: 'Ala-Pívot' },
  { id: 'j-38', equipoId: 'eq-4', nombre: 'Gonzalo',     apellido: 'Pereira',   dorsal: 4,  posicion: 'Base'      },
  { id: 'j-39', equipoId: 'eq-4', nombre: 'Ariel',       apellido: 'Quintero',  dorsal: 8,  posicion: 'Alero'     },

  // Cobalt Kings (eq-5)
  { id: 'j-26', equipoId: 'eq-5', nombre: 'Damián',      apellido: 'Flores',    dorsal: 0,  posicion: 'Base'      },
  { id: 'j-27', equipoId: 'eq-5', nombre: 'Eduardo',     apellido: 'Ponce',     dorsal: 16, posicion: 'Escolta'   },
  { id: 'j-28', equipoId: 'eq-5', nombre: 'Gabriel',     apellido: 'Silva',     dorsal: 19, posicion: 'Alero'     },
  { id: 'j-29', equipoId: 'eq-5', nombre: 'Martín',      apellido: 'Mendoza',   dorsal: 24, posicion: 'Pívot'     },
  { id: 'j-30', equipoId: 'eq-5', nombre: 'Oscar',       apellido: 'Paredes',   dorsal: 31, posicion: 'Ala-Pívot' },
  { id: 'j-40', equipoId: 'eq-5', nombre: 'Rodrigo',     apellido: 'Alonso',    dorsal: 3,  posicion: 'Escolta'   },

  // Storm Wolves (eq-6)
  { id: 'j-31', equipoId: 'eq-6', nombre: 'Claudio',     apellido: 'Benítez',   dorsal: 5,  posicion: 'Base'      },
  { id: 'j-32', equipoId: 'eq-6', nombre: 'Rafael',      apellido: 'Escobar',   dorsal: 11, posicion: 'Alero'     },
  { id: 'j-33', equipoId: 'eq-6', nombre: 'Víctor',      apellido: 'Guerrero',  dorsal: 28, posicion: 'Pívot'     },
  { id: 'j-34', equipoId: 'eq-6', nombre: 'Hugo',        apellido: 'Cárdenas',  dorsal: 34, posicion: 'Ala-Pívot' },
  { id: 'j-35', equipoId: 'eq-6', nombre: 'Walter',      apellido: 'Bravo',     dorsal: 41, posicion: 'Escolta'   },
  { id: 'j-41', equipoId: 'eq-6', nombre: 'Nicolás',     apellido: 'Ferreyra',  dorsal: 7,  posicion: 'Base'      },

  // ── DIVISIÓN B ──────────────────────────────────────────

  // Red Phoenix (eq-7)
  { id: 'j-42', equipoId: 'eq-7', nombre: 'Álvaro',      apellido: 'Ramos',     dorsal: 5,  posicion: 'Base'      },
  { id: 'j-43', equipoId: 'eq-7', nombre: 'Cristóbal',   apellido: 'Vera',      dorsal: 9,  posicion: 'Escolta'   },
  { id: 'j-44', equipoId: 'eq-7', nombre: 'Esteban',     apellido: 'Molina',    dorsal: 12, posicion: 'Alero'     },
  { id: 'j-45', equipoId: 'eq-7', nombre: 'Joaquín',     apellido: 'Rojas',     dorsal: 21, posicion: 'Ala-Pívot' },
  { id: 'j-46', equipoId: 'eq-7', nombre: 'Mauricio',    apellido: 'Salinas',   dorsal: 33, posicion: 'Pívot'     },
  { id: 'j-47', equipoId: 'eq-7', nombre: 'Ignacio',     apellido: 'Peña',      dorsal: 3,  posicion: 'Base'      },

  // Blue Eagles (eq-8)
  { id: 'j-48', equipoId: 'eq-8', nombre: 'Nicolás',     apellido: 'Leal',      dorsal: 7,  posicion: 'Base'      },
  { id: 'j-49', equipoId: 'eq-8', nombre: 'Sebastián',   apellido: 'Araya',     dorsal: 10, posicion: 'Escolta'   },
  { id: 'j-50', equipoId: 'eq-8', nombre: 'Felipe',      apellido: 'Mena',      dorsal: 14, posicion: 'Alero'     },
  { id: 'j-51', equipoId: 'eq-8', nombre: 'Rodrigo',     apellido: 'Sepúlveda', dorsal: 22, posicion: 'Ala-Pívot' },
  { id: 'j-52', equipoId: 'eq-8', nombre: 'Andrés',      apellido: 'Pizarro',   dorsal: 31, posicion: 'Pívot'     },
  { id: 'j-53', equipoId: 'eq-8', nombre: 'Mateo',       apellido: 'Contreras', dorsal: 4,  posicion: 'Escolta'   },

  // Gold Rush (eq-9)
  { id: 'j-54', equipoId: 'eq-9', nombre: 'Daniel',      apellido: 'Fuentes',   dorsal: 6,  posicion: 'Base'      },
  { id: 'j-55', equipoId: 'eq-9', nombre: 'Cristian',    apellido: 'Lagos',     dorsal: 11, posicion: 'Escolta'   },
  { id: 'j-56', equipoId: 'eq-9', nombre: 'Patricio',    apellido: 'Muñoz',     dorsal: 15, posicion: 'Alero'     },
  { id: 'j-57', equipoId: 'eq-9', nombre: 'Gonzalo',     apellido: 'Tapia',     dorsal: 20, posicion: 'Ala-Pívot' },
  { id: 'j-58', equipoId: 'eq-9', nombre: 'Héctor',      apellido: 'Villareal', dorsal: 32, posicion: 'Pívot'     },
  { id: 'j-59', equipoId: 'eq-9', nombre: 'José',        apellido: 'Espinoza',  dorsal: 2,  posicion: 'Base'      },

  // Green Giants (eq-10)
  { id: 'j-60', equipoId: 'eq-10', nombre: 'Carlos',     apellido: 'Barrera',   dorsal: 5,  posicion: 'Base'      },
  { id: 'j-61', equipoId: 'eq-10', nombre: 'Eduardo',    apellido: 'Carrasco',  dorsal: 8,  posicion: 'Escolta'   },
  { id: 'j-62', equipoId: 'eq-10', nombre: 'Francisco',  apellido: 'Cortés',    dorsal: 13, posicion: 'Alero'     },
  { id: 'j-63', equipoId: 'eq-10', nombre: 'Manuel',     apellido: 'Durán',     dorsal: 23, posicion: 'Ala-Pívot' },
  { id: 'j-64', equipoId: 'eq-10', nombre: 'Roberto',    apellido: 'Figueroa',  dorsal: 34, posicion: 'Pívot'     },
  { id: 'j-65', equipoId: 'eq-10', nombre: 'Tomás',      apellido: 'Garrido',   dorsal: 1,  posicion: 'Escolta'   },

  // Purple Haze (eq-11)
  { id: 'j-66', equipoId: 'eq-11', nombre: 'Alexis',     apellido: 'Henríquez', dorsal: 4,  posicion: 'Base'      },
  { id: 'j-67', equipoId: 'eq-11', nombre: 'Benjamín',   apellido: 'Jara',      dorsal: 9,  posicion: 'Escolta'   },
  { id: 'j-68', equipoId: 'eq-11', nombre: 'Diego',      apellido: 'Lira',      dorsal: 16, posicion: 'Alero'     },
  { id: 'j-69', equipoId: 'eq-11', nombre: 'Emilio',     apellido: 'Merino',    dorsal: 25, posicion: 'Ala-Pívot' },
  { id: 'j-70', equipoId: 'eq-11', nombre: 'Felipe',     apellido: 'Naranjo',   dorsal: 30, posicion: 'Pívot'     },

  // Silver Bolts (eq-12)
  { id: 'j-71', equipoId: 'eq-12', nombre: 'Gabriel',    apellido: 'Olivares',  dorsal: 3,  posicion: 'Base'      },
  { id: 'j-72', equipoId: 'eq-12', nombre: 'Hernán',     apellido: 'Palma',     dorsal: 7,  posicion: 'Escolta'   },
  { id: 'j-73', equipoId: 'eq-12', nombre: 'Ignacio',    apellido: 'Quiroz',    dorsal: 11, posicion: 'Alero'     },
  { id: 'j-74', equipoId: 'eq-12', nombre: 'Javier',     apellido: 'Reyes',     dorsal: 18, posicion: 'Ala-Pívot' },
  { id: 'j-75', equipoId: 'eq-12', nombre: 'Kevin',      apellido: 'Sandoval',  dorsal: 24, posicion: 'Pívot'     },

  // ── DIVISIÓN C ──────────────────────────────────────────

  // Crimson Bears (eq-13)
  { id: 'j-76', equipoId: 'eq-13', nombre: 'Leonardo',   apellido: 'Torres',    dorsal: 5,  posicion: 'Base'      },
  { id: 'j-77', equipoId: 'eq-13', nombre: 'Marcos',     apellido: 'Urrutia',   dorsal: 10, posicion: 'Escolta'   },
  { id: 'j-78', equipoId: 'eq-13', nombre: 'Nicolás',    apellido: 'Valenzuela',dorsal: 14, posicion: 'Alero'     },
  { id: 'j-79', equipoId: 'eq-13', nombre: 'Omar',       apellido: 'Weinstein', dorsal: 22, posicion: 'Ala-Pívot' },
  { id: 'j-80', equipoId: 'eq-13', nombre: 'Pablo',      apellido: 'Yáñez',     dorsal: 31, posicion: 'Pívot'     },
  { id: 'j-81', equipoId: 'eq-13', nombre: 'Rodrigo',    apellido: 'Zamora',    dorsal: 3,  posicion: 'Escolta'   },

  // White Falcons (eq-14)
  { id: 'j-82', equipoId: 'eq-14', nombre: 'Sergio',     apellido: 'Acuña',     dorsal: 6,  posicion: 'Base'      },
  { id: 'j-83', equipoId: 'eq-14', nombre: 'Tomás',      apellido: 'Briones',   dorsal: 11, posicion: 'Escolta'   },
  { id: 'j-84', equipoId: 'eq-14', nombre: 'Ualter',     apellido: 'Cáceres',   dorsal: 15, posicion: 'Alero'     },
  { id: 'j-85', equipoId: 'eq-14', nombre: 'Víctor',     apellido: 'Donoso',    dorsal: 23, posicion: 'Ala-Pívot' },
  { id: 'j-86', equipoId: 'eq-14', nombre: 'Walter',     apellido: 'Espejo',    dorsal: 32, posicion: 'Pívot'     },
  { id: 'j-87', equipoId: 'eq-14', nombre: 'Xavier',     apellido: 'Fuentes',   dorsal: 4,  posicion: 'Base'      },

  // Dark Matter (eq-15)
  { id: 'j-88', equipoId: 'eq-15', nombre: 'Yago',       apellido: 'Gallardo',  dorsal: 7,  posicion: 'Base'      },
  { id: 'j-89', equipoId: 'eq-15', nombre: 'Zelmar',     apellido: 'Herrera',   dorsal: 12, posicion: 'Escolta'   },
  { id: 'j-90', equipoId: 'eq-15', nombre: 'Agustín',    apellido: 'Ibarra',    dorsal: 17, posicion: 'Alero'     },
  { id: 'j-91', equipoId: 'eq-15', nombre: 'Bruno',      apellido: 'Jiménez',   dorsal: 25, posicion: 'Ala-Pívot' },
  { id: 'j-92', equipoId: 'eq-15', nombre: 'Carlos',     apellido: 'Klinger',   dorsal: 33, posicion: 'Pívot'     },

  // Blaze Squad (eq-16)
  { id: 'j-93', equipoId: 'eq-16', nombre: 'Damián',     apellido: 'Lastra',    dorsal: 4,  posicion: 'Base'      },
  { id: 'j-94', equipoId: 'eq-16', nombre: 'Ernesto',    apellido: 'Mardones',  dorsal: 8,  posicion: 'Escolta'   },
  { id: 'j-95', equipoId: 'eq-16', nombre: 'Franco',     apellido: 'Novoa',     dorsal: 13, posicion: 'Alero'     },
  { id: 'j-96', equipoId: 'eq-16', nombre: 'Gustavo',    apellido: 'Orellana',  dorsal: 21, posicion: 'Ala-Pívot' },
  { id: 'j-97', equipoId: 'eq-16', nombre: 'Héctor',     apellido: 'Palacio',   dorsal: 30, posicion: 'Pívot'     },
]
