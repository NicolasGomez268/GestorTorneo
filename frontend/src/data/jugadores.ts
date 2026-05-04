import type { Jugador } from './tipos'

export const jugadores: Jugador[] = [
  // ── DIVISIÓN A ──────────────────────────────────────────

  // Shadow Titans (eq-1)
  { id: 'j-01', equipoId: 'eq-1', nombre: 'Marcos',      apellido: 'Vega',       posicion: 'Base'      },
  { id: 'j-02', equipoId: 'eq-1', nombre: 'Lucas',       apellido: 'Romero',     posicion: 'Escolta'   },
  { id: 'j-03', equipoId: 'eq-1', nombre: 'Nicolás',     apellido: 'Torres',     posicion: 'Alero'     },
  { id: 'j-04', equipoId: 'eq-1', nombre: 'Rodrigo',     apellido: 'Sosa',       posicion: 'Ala-Pívot' },
  { id: 'j-05', equipoId: 'eq-1', nombre: 'Diego',       apellido: 'Herrera',    posicion: 'Pívot'     },
  { id: 'j-06', equipoId: 'eq-1', nombre: 'Agustín',     apellido: 'López',      posicion: 'Base'      },
  { id: 'j-07', equipoId: 'eq-1', nombre: 'Sebastián',   apellido: 'Díaz',       posicion: 'Alero'     },
  { id: 'j-08', equipoId: 'eq-1', nombre: 'Julián',      apellido: 'Martínez',   posicion: 'Pívot'     },

  // Neon Drifters (eq-2)
  { id: 'j-09', equipoId: 'eq-2', nombre: 'Tomás',       apellido: 'Ruiz',       posicion: 'Base'      },
  { id: 'j-10', equipoId: 'eq-2', nombre: 'Facundo',     apellido: 'Acosta',     posicion: 'Escolta'   },
  { id: 'j-11', equipoId: 'eq-2', nombre: 'Matías',      apellido: 'Peralta',    posicion: 'Alero'     },
  { id: 'j-12', equipoId: 'eq-2', nombre: 'Emilio',      apellido: 'Gómez',      posicion: 'Ala-Pívot' },
  { id: 'j-13', equipoId: 'eq-2', nombre: 'Pablo',       apellido: 'Fernández',  posicion: 'Pívot'     },
  { id: 'j-14', equipoId: 'eq-2', nombre: 'Iván',        apellido: 'Castillo',   posicion: 'Escolta'   },
  { id: 'j-15', equipoId: 'eq-2', nombre: 'Bruno',       apellido: 'Morales',    posicion: 'Alero'     },

  // Apex Raptors (eq-3)
  { id: 'j-16', equipoId: 'eq-3', nombre: 'Ezequiel',    apellido: 'Ríos',       posicion: 'Base'      },
  { id: 'j-17', equipoId: 'eq-3', nombre: 'Leandro',     apellido: 'Medina',     posicion: 'Escolta'   },
  { id: 'j-18', equipoId: 'eq-3', nombre: 'Germán',      apellido: 'Suárez',     posicion: 'Alero'     },
  { id: 'j-19', equipoId: 'eq-3', nombre: 'Cristian',    apellido: 'Vargas',     posicion: 'Pívot'     },
  { id: 'j-20', equipoId: 'eq-3', nombre: 'Andrés',      apellido: 'Delgado',    posicion: 'Ala-Pívot' },
  { id: 'j-36', equipoId: 'eq-3', nombre: 'Patricio',    apellido: 'Núñez',      posicion: 'Base'      },
  { id: 'j-37', equipoId: 'eq-3', nombre: 'Rodrigo',     apellido: 'Ibáñez',     posicion: 'Escolta'   },

  // Iron Hawks (eq-4)
  { id: 'j-21', equipoId: 'eq-4', nombre: 'Fernando',    apellido: 'Navarro',    posicion: 'Base'      },
  { id: 'j-22', equipoId: 'eq-4', nombre: 'Maximiliano', apellido: 'Cruz',       posicion: 'Escolta'   },
  { id: 'j-23', equipoId: 'eq-4', nombre: 'Ramiro',      apellido: 'Ortega',     posicion: 'Alero'     },
  { id: 'j-24', equipoId: 'eq-4', nombre: 'Santiago',    apellido: 'Reyes',      posicion: 'Pívot'     },
  { id: 'j-25', equipoId: 'eq-4', nombre: 'Héctor',      apellido: 'Campos',     posicion: 'Ala-Pívot' },
  { id: 'j-38', equipoId: 'eq-4', nombre: 'Gonzalo',     apellido: 'Pereira',    posicion: 'Base'      },
  { id: 'j-39', equipoId: 'eq-4', nombre: 'Ariel',       apellido: 'Quintero',   posicion: 'Alero'     },

  // Cobalt Kings (eq-5)
  { id: 'j-26', equipoId: 'eq-5', nombre: 'Damián',      apellido: 'Flores',     posicion: 'Base'      },
  { id: 'j-27', equipoId: 'eq-5', nombre: 'Eduardo',     apellido: 'Ponce',      posicion: 'Escolta'   },
  { id: 'j-28', equipoId: 'eq-5', nombre: 'Gabriel',     apellido: 'Silva',      posicion: 'Alero'     },
  { id: 'j-29', equipoId: 'eq-5', nombre: 'Martín',      apellido: 'Mendoza',    posicion: 'Pívot'     },
  { id: 'j-30', equipoId: 'eq-5', nombre: 'Oscar',       apellido: 'Paredes',    posicion: 'Ala-Pívot' },
  { id: 'j-40', equipoId: 'eq-5', nombre: 'Rodrigo',     apellido: 'Alonso',     posicion: 'Escolta'   },

  // Storm Wolves (eq-6)
  { id: 'j-31', equipoId: 'eq-6', nombre: 'Claudio',     apellido: 'Benítez',    posicion: 'Base'      },
  { id: 'j-32', equipoId: 'eq-6', nombre: 'Rafael',      apellido: 'Escobar',    posicion: 'Alero'     },
  { id: 'j-33', equipoId: 'eq-6', nombre: 'Víctor',      apellido: 'Guerrero',   posicion: 'Pívot'     },
  { id: 'j-34', equipoId: 'eq-6', nombre: 'Hugo',        apellido: 'Cárdenas',   posicion: 'Ala-Pívot' },
  { id: 'j-35', equipoId: 'eq-6', nombre: 'Walter',      apellido: 'Bravo',      posicion: 'Escolta'   },
  { id: 'j-41', equipoId: 'eq-6', nombre: 'Nicolás',     apellido: 'Ferreyra',   posicion: 'Base'      },

  // ── DIVISIÓN B ──────────────────────────────────────────

  // Red Phoenix (eq-7)
  { id: 'j-42', equipoId: 'eq-7', nombre: 'Álvaro',      apellido: 'Ramos',      posicion: 'Base'      },
  { id: 'j-43', equipoId: 'eq-7', nombre: 'Cristóbal',   apellido: 'Vera',       posicion: 'Escolta'   },
  { id: 'j-44', equipoId: 'eq-7', nombre: 'Esteban',     apellido: 'Molina',     posicion: 'Alero'     },
  { id: 'j-45', equipoId: 'eq-7', nombre: 'Joaquín',     apellido: 'Rojas',      posicion: 'Ala-Pívot' },
  { id: 'j-46', equipoId: 'eq-7', nombre: 'Mauricio',    apellido: 'Salinas',    posicion: 'Pívot'     },
  { id: 'j-47', equipoId: 'eq-7', nombre: 'Ignacio',     apellido: 'Peña',       posicion: 'Base'      },

  // Blue Eagles (eq-8)
  { id: 'j-48', equipoId: 'eq-8', nombre: 'Nicolás',     apellido: 'Leal',       posicion: 'Base'      },
  { id: 'j-49', equipoId: 'eq-8', nombre: 'Sebastián',   apellido: 'Araya',      posicion: 'Escolta'   },
  { id: 'j-50', equipoId: 'eq-8', nombre: 'Felipe',      apellido: 'Mena',       posicion: 'Alero'     },
  { id: 'j-51', equipoId: 'eq-8', nombre: 'Rodrigo',     apellido: 'Sepúlveda',  posicion: 'Ala-Pívot' },
  { id: 'j-52', equipoId: 'eq-8', nombre: 'Andrés',      apellido: 'Pizarro',    posicion: 'Pívot'     },
  { id: 'j-53', equipoId: 'eq-8', nombre: 'Mateo',       apellido: 'Contreras',  posicion: 'Escolta'   },

  // Gold Rush (eq-9)
  { id: 'j-54', equipoId: 'eq-9', nombre: 'Daniel',      apellido: 'Fuentes',    posicion: 'Base'      },
  { id: 'j-55', equipoId: 'eq-9', nombre: 'Cristian',    apellido: 'Lagos',      posicion: 'Escolta'   },
  { id: 'j-56', equipoId: 'eq-9', nombre: 'Patricio',    apellido: 'Muñoz',      posicion: 'Alero'     },
  { id: 'j-57', equipoId: 'eq-9', nombre: 'Gonzalo',     apellido: 'Tapia',      posicion: 'Ala-Pívot' },
  { id: 'j-58', equipoId: 'eq-9', nombre: 'Héctor',      apellido: 'Villareal',  posicion: 'Pívot'     },
  { id: 'j-59', equipoId: 'eq-9', nombre: 'José',        apellido: 'Espinoza',   posicion: 'Base'      },

  // Green Giants (eq-10)
  { id: 'j-60', equipoId: 'eq-10', nombre: 'Carlos',     apellido: 'Barrera',    posicion: 'Base'      },
  { id: 'j-61', equipoId: 'eq-10', nombre: 'Eduardo',    apellido: 'Carrasco',   posicion: 'Escolta'   },
  { id: 'j-62', equipoId: 'eq-10', nombre: 'Francisco',  apellido: 'Cortés',     posicion: 'Alero'     },
  { id: 'j-63', equipoId: 'eq-10', nombre: 'Manuel',     apellido: 'Durán',      posicion: 'Ala-Pívot' },
  { id: 'j-64', equipoId: 'eq-10', nombre: 'Roberto',    apellido: 'Figueroa',   posicion: 'Pívot'     },
  { id: 'j-65', equipoId: 'eq-10', nombre: 'Tomás',      apellido: 'Garrido',    posicion: 'Escolta'   },

  // Purple Haze (eq-11)
  { id: 'j-66', equipoId: 'eq-11', nombre: 'Alexis',     apellido: 'Henríquez',  posicion: 'Base'      },
  { id: 'j-67', equipoId: 'eq-11', nombre: 'Benjamín',   apellido: 'Jara',       posicion: 'Escolta'   },
  { id: 'j-68', equipoId: 'eq-11', nombre: 'Diego',      apellido: 'Lira',       posicion: 'Alero'     },
  { id: 'j-69', equipoId: 'eq-11', nombre: 'Emilio',     apellido: 'Merino',     posicion: 'Ala-Pívot' },
  { id: 'j-70', equipoId: 'eq-11', nombre: 'Felipe',     apellido: 'Naranjo',    posicion: 'Pívot'     },

  // Silver Bolts (eq-12)
  { id: 'j-71', equipoId: 'eq-12', nombre: 'Gabriel',    apellido: 'Olivares',   posicion: 'Base'      },
  { id: 'j-72', equipoId: 'eq-12', nombre: 'Hernán',     apellido: 'Palma',      posicion: 'Escolta'   },
  { id: 'j-73', equipoId: 'eq-12', nombre: 'Ignacio',    apellido: 'Quiroz',     posicion: 'Alero'     },
  { id: 'j-74', equipoId: 'eq-12', nombre: 'Javier',     apellido: 'Reyes',      posicion: 'Ala-Pívot' },
  { id: 'j-75', equipoId: 'eq-12', nombre: 'Kevin',      apellido: 'Sandoval',   posicion: 'Pívot'     },

  // ── DIVISIÓN C ──────────────────────────────────────────

  // Crimson Bears (eq-13)
  { id: 'j-76', equipoId: 'eq-13', nombre: 'Leonardo',   apellido: 'Torres',     posicion: 'Base'      },
  { id: 'j-77', equipoId: 'eq-13', nombre: 'Marcos',     apellido: 'Urrutia',    posicion: 'Escolta'   },
  { id: 'j-78', equipoId: 'eq-13', nombre: 'Nicolás',    apellido: 'Valenzuela', posicion: 'Alero'     },
  { id: 'j-79', equipoId: 'eq-13', nombre: 'Omar',       apellido: 'Weinstein',  posicion: 'Ala-Pívot' },
  { id: 'j-80', equipoId: 'eq-13', nombre: 'Pablo',      apellido: 'Yáñez',      posicion: 'Pívot'     },
  { id: 'j-81', equipoId: 'eq-13', nombre: 'Rodrigo',    apellido: 'Zamora',     posicion: 'Escolta'   },

  // White Falcons (eq-14)
  { id: 'j-82', equipoId: 'eq-14', nombre: 'Sergio',     apellido: 'Acuña',      posicion: 'Base'      },
  { id: 'j-83', equipoId: 'eq-14', nombre: 'Tomás',      apellido: 'Briones',    posicion: 'Escolta'   },
  { id: 'j-84', equipoId: 'eq-14', nombre: 'Ualter',     apellido: 'Cáceres',    posicion: 'Alero'     },
  { id: 'j-85', equipoId: 'eq-14', nombre: 'Víctor',     apellido: 'Donoso',     posicion: 'Ala-Pívot' },
  { id: 'j-86', equipoId: 'eq-14', nombre: 'Walter',     apellido: 'Espejo',     posicion: 'Pívot'     },
  { id: 'j-87', equipoId: 'eq-14', nombre: 'Xavier',     apellido: 'Fuentes',    posicion: 'Base'      },

  // Dark Matter (eq-15)
  { id: 'j-88', equipoId: 'eq-15', nombre: 'Yago',       apellido: 'Gallardo',   posicion: 'Base'      },
  { id: 'j-89', equipoId: 'eq-15', nombre: 'Zelmar',     apellido: 'Herrera',    posicion: 'Escolta'   },
  { id: 'j-90', equipoId: 'eq-15', nombre: 'Agustín',    apellido: 'Ibarra',     posicion: 'Alero'     },
  { id: 'j-91', equipoId: 'eq-15', nombre: 'Bruno',      apellido: 'Jiménez',    posicion: 'Ala-Pívot' },
  { id: 'j-92', equipoId: 'eq-15', nombre: 'Carlos',     apellido: 'Klinger',    posicion: 'Pívot'     },

  // Blaze Squad (eq-16)
  { id: 'j-93', equipoId: 'eq-16', nombre: 'Damián',     apellido: 'Lastra',     posicion: 'Base'      },
  { id: 'j-94', equipoId: 'eq-16', nombre: 'Ernesto',    apellido: 'Mardones',   posicion: 'Escolta'   },
  { id: 'j-95', equipoId: 'eq-16', nombre: 'Franco',     apellido: 'Novoa',      posicion: 'Alero'     },
  { id: 'j-96', equipoId: 'eq-16', nombre: 'Gustavo',    apellido: 'Orellana',   posicion: 'Ala-Pívot' },
  { id: 'j-97', equipoId: 'eq-16', nombre: 'Héctor',     apellido: 'Palacio',    posicion: 'Pívot'     },
]
