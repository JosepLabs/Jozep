export const PREGUNTAS_MATEMATICAS = [
  {
    id: "MAT-001",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-001-promedio_puntajes.png",
      alt: "Promedios de los puntajes en el examen por cursos",
      caption: "Tabla. Promedios de los puntajes en el examen por cursos.",
    },
    contexto: `Cuatro cursos, cada uno con igual número de estudiantes, presentan anualmente una prueba de matemáticas. La tabla muestra el puntaje promedio obtenido por cada curso:
    \nAl revisar los puntajes de la tabla, una persona afirma que hubo un aumento en el puntaje respecto al año anterior. Esta afirmación es`,
    opciones: {
      A: "Correcta, ya que el promedio de la mayoría de los cursos aumentó respecto al año anterior.",
      B: "Incorrecta, ya que el promedio total en el año anterior es superior al promedio total en el año actual.",
      C: "Correcta, ya que al observar todos los promedios, el mayor corresponde al curso I en el año actual.",
      D: "Incorrecta, ya que se necesita el puntaje de cada estudiante para realizar la comparación.",
    },
    respuesta: "B",
    justificacion: "Aunque 3 de 4 cursos mejoraron individualmente, el análisis correcto exige comparar los totales globales. Año anterior: (63+61+50+53)/4 = 56,75. Año actual: (65+45+53+54)/4 = 54,25. El promedio general bajó, por lo que la afirmación de aumento es incorrecta. La opción B identifica correctamente que la caída del curso II arrastra el total hacia abajo.",
  },
 
  {
    id: "MAT-002",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Una persona que vive en Colombia tiene inversiones en dólares en Estados Unidos. La tasa de cambio se mantendrá constante este mes: 1 dólar = 4.000 pesos colombianos. Su inversión en dólares le dará ganancias del 3 % en el mismo periodo. Un amigo le asegura que en pesos sus ganancias también serán del 3 %.
    \n¿La afirmación de su amigo es correcta?`,
    opciones: {
      A: "Sí, porque, sin importar las variaciones en la tasa de cambio, la proporción en que aumenta la inversión en dólares es la misma que en pesos.",
      B: "No, porque debería conocerse el valor exacto de la inversión para poder calcular la cantidad de dinero que ganará.",
      C: "Sí, porque el 3 % representa una proporción fija en cualquiera de las dos monedas, puesto que la tasa de cambio permanecerá constante.",
      D: "No, porque el 3 % representa un incremento, que será mayor en pesos colombianos, pues en esta moneda cada dólar representa un valor 4.000 veces mayor.",
    },
    respuesta: "C",
    justificacion: "Con tasa de cambio constante, la conversión entre monedas es una transformación lineal (multiplicar por 4.000). Un porcentaje mide una proporción relativa, no un valor absoluto; esa proporción se conserva bajo cualquier factor de escala constante. Un 3 % en dólares equivale exactamente a un 3 % en pesos cuando el tipo de cambio no varía.",
  },
 
  {
    id: "MAT-003",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-004-005-006-informatica_basica.png",
      alt: "Franja, Horario, Cupo máximo y Precio por estudiante",
      caption: "Tabla. Franja, Horario, Cupo máximo y Precio por estudiante.",
    },
    contexto: `Las directivas de un colegio deben organizar un viaje a un museo con 140 estudiantes divididos en 3 grupos. El costo total se asume equitativamente por todos los estudiantes:
    \nLas directivas eligieron las franjas 1, 3 y 4. ¿Esta elección garantiza que todos los estudiantes asistan al menor precio posible?`,
    opciones: {
      A: "Sí, porque esas franjas suman exactamente 140 estudiantes.",
      B: "No, porque es posible obtener un precio menor eligiendo la franja 2 en lugar de la franja 3.",
      C: "Sí, porque se incluyó la franja 1 que es la de menor precio por estudiante.",
      D: "No, porque en la franja 3 la cantidad máxima de estudiantes es 30.",
    },
    respuesta: "B",
    justificacion: "Franjas 1, 3 y 4: costo total = 50×35.000 + 30×50.000 + 60×45.000 = $6.000.000. Costo por estudiante: $42.857. Alternativa con franjas 1, 2 y 4 (50+40+50=140): 50×35.000 + 40×40.000 + 50×45.000 = $5.600.000. Costo por estudiante: $40.000. Reemplazar la franja 3 por la franja 2 reduce el costo total en $400.000.",
  },
 
  {
    id: "MAT-004",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-004-005-006-informatica_basica.png",
      alt: "Franja, Horario, Cupo máximo y Precio por estudiante",
      caption: "Tabla. Franja, Horario, Cupo máximo y Precio por estudiante.",
    },
    contexto: `Para capacitar en informática básica a trabajadores de una empresa, se contrata una institución con el siguiente plan:
    \nLa empresa pagará $4.200.000 por capacitar a los trabajadores de la dependencia "Insumos" en el módulo I. ¿Cuántos empleados tiene esta dependencia?`,
    opciones: {
      A: "Entre 20 y 30 trabajadores.",
      B: "Entre 41 y 60 trabajadores.",
      C: "Entre 61 y 90 trabajadores.",
      D: "Entre 80 y 120 trabajadores.",
    },
    respuesta: "C",
    justificacion: "Costo del módulo I por curso: 40 h × $35.000 = $1.400.000. Número de cursos: $4.200.000 ÷ $1.400.000 = 3 cursos. Con 3 cursos y entre 20 y 30 personas por curso: mínimo 60 personas y máximo 90 personas. Por tanto, la dependencia tiene entre 61 y 90 trabajadores.",
  },
 
  {
    id: "MAT-005",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-004-005-006-informatica_basica.png",
      alt: "Franja, Horario, Cupo máximo y Precio por estudiante",
      caption: "Tabla. Franja, Horario, Cupo máximo y Precio por estudiante.",
    },
    contexto: `Para capacitar en informática básica a trabajadores de una empresa, se contrata una institución con el siguiente plan:
    \nSi se les cobrara a los 50 trabajadores de la dependencia "Recursos Humanos" la capacitación del módulo II, y todos pagaran el mismo valor, ¿cuánto debería pagar cada uno?`,
    opciones: {
      A: "$18.000",
      B: "$36.000",
      C: "$450.000",
      D: "$900.000",
    },
    respuesta: "B",
    justificacion: "Costo del módulo II por curso: 30 h × $30.000 = $900.000. Con 50 trabajadores y máximo 30 por curso se necesitan 2 cursos. Costo total: 2 × $900.000 = $1.800.000. Dividido entre 50 trabajadores: $1.800.000 ÷ 50 = $36.000 por persona.",
  },
 
  {
    id: "MAT-006",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-004-005-006-informatica_basica.png",
      alt: "Portalápices de forma trapezoidal con base cuadrada de perímetro 18 cm y boca cuadrada de perímetro 24 cm. Un caucho rodea la base sin estirarse y se estira al llegar a la boca.",
      caption: "Figura. Cada módulo se dicta en cursos de mínimo 20 y máximo 30 personas de la misma dependencia.",
    },
    contexto: `Para capacitar en informática básica a trabajadores de una empresa, se contrata una institución con el siguiente plan:
    \nLa empresa paga $900.000 por la capacitación de los 40 funcionarios de la dependencia "Importaciones". ¿Cuál módulo tomó esta dependencia?`,
    opciones: {
      A: "I.",
      B: "II.",
      C: "III.",
      D: "IV.",
    },
    respuesta: "D",
    justificacion: "Con 40 funcionarios se necesitan 2 cursos (máximo 30 por curso). Verificando el módulo IV: 10 h × $45.000 = $450.000 por curso; 2 cursos = $900.000 ✓. Los demás módulos producen costos diferentes: I: $2.800.000; II: $1.800.000; III: $3.200.000. Solo el módulo IV coincide con el valor pagado.",
  },
 
  {
    id: "MAT-007",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-007-portalapices.png",
      alt: "Portalápices de forma trapezoidal con base cuadrada de perímetro 18 cm y boca cuadrada de perímetro 24 cm. Un caucho rodea la base sin estirarse y se estira al llegar a la boca.",
      caption: "Figura. Portalápices de Eliécer: caucho de 18 cm en la base y 24 cm en la boca.",
    },
    contexto: `La figura muestra el portalápices de Eliécer. Un caucho de 18 cm de perímetro rodea la base sin estirarse; a medida que sube por el portalápices se estira hasta alcanzar 24 cm en la boca. El portalápices tiene base y boca cuadradas.
 Eliécer afirma: "Como los perímetros están en relación 18/24 = 3/4, el área de la base debe ser también 3/4 del área de la boca". ¿Es verdadera esta afirmación?`,
    opciones: {
      A: "No, porque la medición se realiza con el mismo caucho y, por tanto, las áreas de la base y la boca deben ser iguales.",
      B: "Sí, porque el caucho se estira dependiendo del área que encierre, por lo que las relaciones de las áreas y los perímetros son iguales.",
      C: "No, porque la relación obtenida se cumple para las longitudes de los lados, pero al calcular las áreas, la razón obtenida se eleva al cuadrado.",
      D: "Sí, porque como las figuras son semejantes, todas sus medidas deben tener la misma razón que los perímetros.",
    },
    respuesta: "C",
    justificacion: "La razón de perímetros 18/24 = 3/4 implica que los lados del cuadrado tienen razón 3/4 (lado base = 18/4 = 4,5 cm; lado boca = 24/4 = 6 cm). Sin embargo, el área escala con el cuadrado de la razón lineal: razón de áreas = (3/4)² = 9/16 ≠ 3/4. El error de Eliécer es no elevar la razón lineal al cuadrado para obtener la razón de áreas.",
  },
 
  {
    id: "MAT-008",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    contexto: `Un grupo de montañistas sabe que cada vez que la altitud aumenta 100 m, la temperatura disminuye 1 °C. A 1.000 m de altitud la temperatura es 20 °C.
 
¿Cuál expresión permite determinar la temperatura a 4.000 m de altitud?`,
    opciones: {
      A: "Temperatura = (Altitud / 100) + 10",
      B: "Temperatura = −Altitud × 100 + 30",
      C: "Temperatura = −(Altitud / 100) + 30",
      D: "Temperatura = Altitud × 100 + 10",
    },
    respuesta: "C",
    justificacion: "La temperatura disminuye 1 °C por cada 100 m, lo que da pendiente −1/100. Verificando con el punto conocido: T(1000) = −(1000/100) + 30 = −10 + 30 = 20 °C ✓. A 4.000 m: T = −(4000/100) + 30 = −10 °C. La expresión C modela correctamente la relación lineal inversa entre altitud y temperatura.",
  },
 
  {
    id: "MAT-009",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `Un comerciante transporta mango y banano a las ciudades W y Z usando 3 camiones de 5 toneladas cada uno, contratando 2 trabajadores por camión. Compra banano a $400.000/ton y mango a $500.000/ton.
 
| Ciudad | Venta banano/ton | Venta mango/ton | Transporte/camión | Pago trabajador/viaje |
|--------|-----------------|-----------------|-------------------|-----------------------|
| W | $1.000.000 | $1.300.000 | $150.000 | $180.000 |
| Z | $1.200.000 | $1.350.000 | $180.000 | $200.000 |
 
Una persona afirma que es más rentable vender 6 toneladas de mango en la ciudad Z que en la ciudad W. ¿Por qué es correcta esta afirmación?`,
    opciones: {
      A: "Porque el dinero recibido en la venta del producto en la ciudad Z es mayor que el recibido en la ciudad W.",
      B: "Porque la diferencia entre el precio de venta por tonelada es mayor que la diferencia entre el costo de transporte por camión.",
      C: "Porque la diferencia entre las ventas totales en cada ciudad es mayor que la diferencia entre los gastos totales.",
      D: "Porque el dinero total gastado en empleados y transporte es mayor en la ciudad W que en la ciudad Z.",
    },
    respuesta: "C",
    justificacion: "Con 2 camiones para 6 toneladas — ventas: Z: 6×$1.350.000=$8.100.000; W: 6×$1.300.000=$7.800.000. Diferencia en ventas: $300.000. Gastos Z: 2×$180.000+4×$200.000=$1.160.000; Gastos W: 2×$150.000+4×$180.000=$1.020.000. Diferencia en gastos: $140.000. La diferencia de ventas ($300.000) supera la diferencia de costos ($140.000), confirmando mayor rentabilidad neta en Z.",
  },
 
  {
    id: "MAT-010",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    contexto: `Un comerciante transporta mango y banano a las ciudades W y Z usando 3 camiones de 5 toneladas cada uno, contratando 2 trabajadores por camión. Compra banano a $400.000/ton y mango a $500.000/ton.
 
| Ciudad | Venta banano/ton | Venta mango/ton | Transporte/camión | Pago trabajador/viaje |
|--------|-----------------|-----------------|-------------------|-----------------------|
| W | $1.000.000 | $1.300.000 | $150.000 | $180.000 |
| Z | $1.200.000 | $1.350.000 | $180.000 | $200.000 |
 
Los 3 camiones se cargan con 5 toneladas de banano cada uno para venderse en la ciudad W. Siguiendo el procedimiento indicado de 5 pasos, ¿cuál es la ganancia del comerciante?`,
    opciones: {
      A: "$5.670.000",
      B: "$5.970.000",
      C: "$7.470.000",
      D: "$8.010.000",
    },
    respuesta: "C",
    justificacion: "Paso 1: 3×5 = 15 ton. Paso 2: $1.000.000−$400.000 = $600.000/ton. Paso 3: 15×$600.000 = $9.000.000. Paso 4: transporte 3×$150.000=$450.000; trabajadores 3×2×$180.000=$1.080.000; total costos=$1.530.000. Paso 5: $9.000.000−$1.530.000 = $7.470.000.",
  },
 
  {
    id: "MAT-011",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    contexto: `Un comerciante transporta mango y banano a las ciudades W y Z. Precio de venta del mango en W: $1.300.000/ton.
 
En diciembre, por cada 5 toneladas vendidas, cada uno de los dos empleados por camión recibe un bono del 0,3% del dinero recibido por esas 5 toneladas. Dos empleados transportaron y vendieron 47 toneladas de mango a la ciudad W. El bono se calcula con el siguiente procedimiento:
 
Paso 1. Dividir las toneladas vendidas entre 5 y hallar el residuo.
Paso 2. Restar del total vendido el valor del paso 1.
Paso 3. Multiplicar el resultado del paso 2 por el precio de venta por tonelada.
Paso 4. Calcular el 0,3% del resultado del paso 3.
 
¿De qué valor fue, aproximadamente, el bono recibido por cada empleado?`,
    opciones: {
      A: "526.000 pesos.",
      B: "175.000 pesos.",
      C: "148.000 pesos.",
      D: "87.000 pesos.",
    },
    respuesta: "B",
    justificacion: "Paso 1: 47 ÷ 5 = 9, residuo 2. Paso 2: 47−2 = 45 toneladas elegibles. Paso 3: 45×$1.300.000 = $58.500.000. Paso 4: 0,3% de $58.500.000 = $175.500 ≈ $175.000. Este es el bono que recibe cada uno de los dos empleados.",
  },
 
  {
    id: "MAT-012",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-012-013-graficas-costos-ciudad.png",
      alt: "Cuatro gráficas de barras agrupadas (opciones A, B, C, D). Cada gráfica muestra el costo de transporte de camiones y el pago a trabajadores para Ciudad W y Ciudad Z, con escalas distintas entre opciones.",
      caption: "Figura. Opciones de gráfica de barras para costos de transporte y trabajadores al enviar 7 ton a W y 10 ton a Z.",
    },
    contexto: `Un comerciante transporta frutas a las ciudades W y Z con 3 camiones de 5 toneladas, 2 trabajadores por camión. Si se transportan 7 toneladas de fruta a la ciudad W y 10 toneladas a la ciudad Z, ¿cuál gráfica muestra correctamente la relación de costos por ciudad?`,
    opciones: {
      A: "Gráfica A (escala hasta $450.000).",
      B: "Gráfica B (escala hasta $900.000).",
      C: "Gráfica C (escala hasta $450.000, orden invertido).",
      D: "Gráfica D (escala hasta $900.000, orden invertido).",
    },
    respuesta: "B",
    justificacion: "Ciudad W (7 ton → 2 camiones): transporte 2×$150.000=$300.000; trabajadores 2×2×$180.000=$720.000. Ciudad Z (10 ton → 2 camiones): transporte 2×$180.000=$360.000; trabajadores 2×2×$200.000=$800.000. Los valores máximos superan $700.000, por lo que la escala debe llegar a $900.000. La gráfica B tiene la escala y proporciones correctas, con el costo de trabajadores mayor que el de transporte en ambas ciudades.",
  },
 
  {
    id: "MAT-013",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-012-013-graficas-costos-ciudad.png",
      alt: "Cuatro gráficas de barras agrupadas (opciones A, B, C, D). Cada gráfica muestra el costo de transporte de camiones y el pago a trabajadores para Ciudad W y Ciudad Z, con escalas distintas entre opciones.",
      caption: "Figura. Opciones de gráfica de barras para costos de transporte y trabajadores al enviar 7 ton a W y 10 ton a Z.",
    },
    contexto: `Un comerciante transporta mango y banano a las ciudades W y Z usando 3 camiones de 5 toneladas cada uno, contratando 2 trabajadores por camión. Durante enero, el comerciante vendió 100 toneladas de mango y 50 de banano, y contrató 10 trabajadores. ¿Qué se puede determinar con esta información?`,
    opciones: {
      A: "La ganancia de los productores.",
      B: "El pago que recibirá cada trabajador en enero.",
      C: "Los costos totales del comerciante.",
      D: "El número mínimo de viajes que se realizaron desde el pueblo.",
    },
    respuesta: "D",
    justificacion: "Con 150 toneladas totales y camiones de 5 toneladas, el mínimo de viajes es 150 ÷ 5 = 30 viajes. No es posible calcular los costos totales porque se desconoce a qué ciudad se destinó cada producto. El pago por trabajador depende de cuántos viajes hizo cada uno. La ganancia de los productores es información ajena al problema.",
  },
 
  {
    id: "MAT-014",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Si en un rectángulo se aumenta la longitud de uno de sus lados en 100 %, ¿qué se puede concluir de su área?`,
    opciones: {
      A: "Aumenta en un 50 %.",
      B: "Se duplica.",
      C: "No cambia.",
      D: "Aumenta en 100 unidades.",
    },
    respuesta: "B",
    justificacion: "El área de un rectángulo es A = base × altura. Aumentar un lado en 100% equivale a multiplicarlo por 2. El nuevo área es 2×base × altura = 2A. Por tanto, el área se duplica. Este resultado aplica únicamente cuando solo una dimensión cambia; si ambas aumentaran un 100%, el área se cuadruplicaría.",
  },
 
  {
    id: "MAT-015",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-015-postes-sombras.png",
      alt: "Dos postes paralelos de 10 m y 5 m sobre una acera horizontal. La sombra del poste 1 forma un ángulo α = 30° con la acera. La sombra del poste 2 forma un ángulo β desconocido.",
      caption: "Figura. Postes paralelos y sus sombras proyectadas con rayos de luz paralelos.",
    },
    contexto: `Las sombras proyectadas por dos postes paralelos de 10 metros y 5 metros se muestran en la figura. El ángulo entre la acera horizontal y la sombra del poste 1 es α = 30°.
 
¿Cuál es el ángulo entre la acera horizontal y la sombra del poste 2?`,
    opciones: {
      A: "β = 5°.",
      B: "β = 15°.",
      C: "β = 30°.",
      D: "β = 60°.",
    },
    respuesta: "C",
    justificacion: "Los rayos de luz solar son paralelos entre sí. Como los dos postes son paralelos y verticales, los triángulos rectángulos formados por cada poste, su sombra y el rayo de luz son semejantes. El ángulo que el rayo de luz hace con la acera (ángulo de elevación solar) es el mismo para ambos postes. Por tanto, β = α = 30°, independientemente de la altura de los postes.",
  },
 
  {
    id: "MAT-016",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `Una escuela de natación tiene 16 estudiantes y 2 piscinas. Las personas con estatura inferior a 1,80 m van a la piscina menos profunda; las demás, a la más profunda. El director escucha que el promedio de estatura es 1,70 m y propone aumentar alumnos hasta que el promedio sea 1,80 m, afirmando que así se igualará la cantidad de personas en ambas piscinas.
¿Por qué es errónea la afirmación del director?`,
    opciones: {
      A: "Porque las 16 personas se encuentran actualmente en la piscina menos profunda. El director debe aceptar otros 16 alumnos con estatura superior a 1,80 m.",
      B: "Porque con el promedio es imposible determinar la cantidad de personas en las piscinas. Es necesario utilizar otras medidas, como la estatura máxima o mínima.",
      C: "Porque incrementar el promedio a 1,80 m es insuficiente. El director debe aceptar más estudiantes con altura de 1,80 m hasta que la cantidad sea igual en ambas piscinas.",
      D: "Porque aunque el promedio de estatura de las 16 personas sea inferior a 1,80 m, no significa que la cantidad de personas en las piscinas sea diferente.",
    },
    respuesta: "D",
    justificacion: "El promedio no permite inferir cuántas personas están por encima o por debajo de un umbral específico. Con promedio 1,70 m podría ocurrir que varios estudiantes midan más de 1,80 m compensados por otros muy bajos. El promedio es una medida de tendencia central que no describe la distribución individual. La distribución en las piscinas depende de cada estatura individual, no del promedio grupal.",
  },
 
  {
    id: "MAT-017",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 1,
    imagen: {
      src: "assets/img/mat-017-caja-aristas.png",
      alt: "Caja rectangular (paralelepípedo) con aristas de longitud l (largo), a (ancho) y h (alto).",
      caption: "Figura. Caja rectangular con dimensiones l, a y h.",
    },
    contexto: `La longitud de las aristas de la caja de la figura son l, a y h.
¿Cuál de las siguientes expresiones determina la longitud total de las aristas de la caja?`,
    opciones: {
      A: "lah",
      B: "4lah",
      C: "l + a + h",
      D: "4l + 4a + 4h",
    },
    respuesta: "D",
    justificacion: "Un paralelepípedo rectangular tiene 12 aristas: 4 paralelas de longitud l, 4 paralelas de longitud a y 4 paralelas de longitud h. La longitud total es 4l + 4a + 4h. La opción C omite el factor 4 (sumaría solo 3 aristas) y la opción A corresponde al volumen, no a aristas.",
  },
 
  {
    id: "MAT-018",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-018-faros-triangulo.png",
      alt: "Diagrama de un triángulo formado por un faro superior y dos faros inferiores separados 2 unidades. El barco está en la base. Los ángulos en el faro superior son 45° y 45°. Los ángulos en la base son 30°, 75° y 60°. La distancia del barco al faro derecho es 1.",
      caption: "Figura. Triángulo de navegación con faro superior y barco en la base.",
    },
    contexto: `Un barco navega entre dos faros inferiores separados 2 unidades. El faro superior forma ángulos de 45° con cada faro inferior. Los ángulos en la base son 30° (izquierda), 75° (barco) y 60° (derecha). La distancia del barco al faro derecho es 1.
¿Cuál es la distancia x entre el faro superior y el barco?`,
    opciones: {
      A: "x = 2 sen(30°) / sen(45°)",
      B: "x = 2 sen(60°) / sen(45°)",
      C: "x = sen(60°) / sen(75°)",
      D: "x = sen(30°) / sen(60°)",
    },
    respuesta: "C",
    justificacion: "En el triángulo formado por el faro superior, el barco y el faro derecho: el lado conocido (faro derecho al barco) = 1, el ángulo opuesto a x es 60° (en el faro derecho), y el ángulo opuesto a 1 es 75° (en el barco). Aplicando la ley de senos: x/sen(60°) = 1/sen(75°), despejando: x = sen(60°)/sen(75°).",
  },
 
  {
    id: "MAT-019",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    contexto: `En una feria robótica, el robot P y el robot Q juegan tenis de mesa. El marcador es 7 a 2 a favor de P. Se reprograman: por cada 2 puntos de P, Q anota 3.
 
¿Cuál ecuación permite determinar cuándo igualará en puntos el robot Q al robot P?`,
    opciones: {
      A: "(3/2)x = 0. Donde x es la cantidad de puntos que anotará P.",
      B: "7 + x = (3/2)x + 2. Donde x es la cantidad de puntos que anotará P.",
      C: "7 + 3x = 2 + 2y. Donde x es la cantidad de puntos que anotará P, y y es la cantidad de puntos que anotará Q.",
      D: "x + y = 7 + 2. Donde x es la cantidad de puntos que anotará P, y y es la cantidad de puntos que anotará Q.",
    },
    respuesta: "B",
    justificacion: "Si P anota x puntos adicionales, Q anota (3/2)x (razón 2:3). El total de P será 7+x y el de Q será 2+(3/2)x. Al igualar: 7+x = (3/2)x+2. Resolviendo: 5 = (1/2)x → x = 10. P anotará 10 puntos más y Q anotará 15, igualando en 17 cada uno.",
  },
 
  {
    id: "MAT-020",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-020-gasto_publicidad_ganancias.png",
      alt: "Gasto en publicidad y las ganancias de una empresa",
      caption: "Tabla. Gasto en publicidad y las ganancias de una empresa",
    },
    contexto: `La tabla presenta el gasto en publicidad y las ganancias de una empresa entre 2020 y 2022 (en millones de pesos):
¿Cuál es la función G(p) que representa la ganancia en función del gasto en publicidad p?`,
    opciones: {
      A: "G(p) = 30p + 2.000",
      B: "G(p) = 10p",
      C: "G(p) = 40p",
      D: "G(p) = 40p − 800",
    },
    respuesta: "A",
    justificacion: "Verificando G(p) = 30p + 2.000: G(200)=30×200+2.000=8.000 ✓; G(280)=30×280+2.000=10.400 ✓; G(250)=30×250+2.000=9.500 ✓. Las demás opciones no satisfacen los tres pares de datos simultáneamente. La pendiente 30 y el intercepto 2.000 se determinan con cualquier par de puntos de la tabla.",
  },
 
  {
    id: "MAT-021",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `En una tienda se venden mesas a $40.000 y sillas a $20.000. Los ingresos del mes fueron $1.400.000 y se vendieron 3 veces más sillas que mesas. Para hallar las cantidades (M = mesas, S = sillas), el dueño planteó:
 
Ecuación 1: 40.000M + 20.000S = 1.400.000
Ecuación 2: M = 3S
 
¿Las ecuaciones representan correctamente la situación?`,
    opciones: {
      A: "No, porque aunque la ecuación 1 relaciona cada precio con la variable adecuada de forma correcta, la ecuación 2 significa que se venden 3 veces más mesas que sillas.",
      B: "Sí, porque la ecuación 1 relaciona cada precio con la variable adecuada y la ecuación 2 tiene en cuenta que la cantidad de sillas es 3 veces mayor que la de mesas.",
      C: "No, porque aunque la ecuación 2 tiene en cuenta que la cantidad de sillas es 3 veces mayor que la de mesas, en la ecuación 1 los precios deberían estar dividiendo y no multiplicando.",
      D: "Sí, porque al solucionar las dos ecuaciones se obtiene un número entero, lo cual es consistente con las condiciones iniciales del problema.",
    },
    respuesta: "A",
    justificacion: "La ecuación 1 es correcta: suma de (precio × cantidad) para cada artículo. Sin embargo, la ecuación 2 M = 3S dice 'mesas = 3 × sillas', indicando 3 veces más mesas que sillas. El problema establece lo contrario: 3 veces más sillas que mesas, lo que se expresaría correctamente como S = 3M.",
  },
 
  {
    id: "MAT-022",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-022-triangulo-corte.png",
      alt: "Triángulo con ángulo de 45° en la base izquierda, lado oblicuo de 120 cm y altura h perpendicular a la base. Una línea punteada paralela a la base corta la altura por la mitad.",
      caption: "Figura. Triángulo cortado por la mitad de su altura h usando la fórmula sen(45°) = h/120.",
    },
    contexto: `La línea punteada muestra un corte paralelo a la base de un triángulo que corta por la mitad la altura h. La altura se determinó con sen(45°) = h/120, con sen(45°) = √2/2 ≈ 0,71.
¿A qué distancia (aproximada) de la base se realizó el corte?`,
    opciones: {
      A: "85 cm.",
      B: "60 cm.",
      C: "42 cm.",
      D: "30 cm.",
    },
    respuesta: "C",
    justificacion: "h = 120 × sen(45°) = 120 × 0,71 = 85,2 cm. El corte se realiza en h/2 = 85,2/2 ≈ 42,6 cm ≈ 42 cm desde la base. El proceso aplica trigonometría para hallar la altura total y luego la divide entre 2 para encontrar el punto de corte.",
  },
 
  {
    id: "MAT-023",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-023-cartabon-triangulo.png",
      alt: "Triángulo rectángulo escaleno (cartabón) con ángulo de 60° y cateto mayor de 32 cm. Se incluye tabla con valores de sen, cos y tan para 30° y 60°.",
      caption: "Figura. Cartabón con cateto mayor de 32 cm y ángulos de 30°, 60° y 90°.",
    },
    contexto: `Un cartabón tiene forma de triángulo rectángulo escaleno con hipotenusa = 2 × cateto menor. Valores trigonométricos: sen30°=1/2, sen60°=√3/2, cos30°=√3/2, cos60°=1/2, tan30°=1/√3, tan60°=√3.
Si el cateto más largo mide 32 cm, ¿cuánto mide el cateto menor?`,
    opciones: {
      A: "16 cm.",
      B: "32/√3 cm.",
      C: "27 cm.",
      D: "64/√3 cm.",
    },
    respuesta: "B",
    justificacion: "En un triángulo 30-60-90, el cateto mayor (opuesto a 60°) y el menor (opuesto a 30°) se relacionan como: cateto mayor = cateto menor × tan(60°) = cateto menor × √3. Despejando: cateto menor = 32/√3. Verificación: hipotenusa = 2×(32/√3) = 64/√3; por Pitágoras: (32/√3)² + 32² = (64/√3)² ✓.",
  },
 
  {
    id: "MAT-024",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-024-cuadrado-paralelogramo.png",
      alt: "Figura 1: cuadrado de 1 dm² con paralelogramo sombreado cuyos vértices son los puntos medios P, Q, R, S de cada lado. Figura 2: reordenamiento de triángulos para mostrar 4 paralelogramos iguales. Figura 3: cuadrado de 1 dm² con un cuadrado interior sombreado más pequeño formado por líneas que conectan vértices con puntos intermedios.",
      caption: "Figuras 1, 2 y 3. Construcciones geométricas con puntos medios para comparar áreas.",
    },
    contexto: `Una profesora entrega a sus estudiantes un cuadrado de 1 dm². P, Q, R y S son los puntos medios de cada lado. Eloísa demuestra que el paralelogramo sombreado (Figura 1) tiene área 1/4 dm² reubicando triángulos. La profesora pide usar la misma estrategia para hallar el área del cuadrado sombreado en la Figura 3.
¿Cuál es el área del cuadrado sombreado en la Figura 3?`,
    opciones: {
      A: "1/9 dm²",
      B: "1/8 dm²",
      C: "1/6 dm²",
      D: "1/5 dm²",
    },
    respuesta: "D",
    justificacion: "En la Figura 3, las líneas desde cada vértice del cuadrado hasta el punto medio del lado no adyacente forman un cuadrado interior. Usando coordenadas (cuadrado unitario con vértices en (0,0), (1,0), (1,1), (0,1) y puntos medios en (1/2,0), (1,1/2), (1/2,1), (0,1/2)), las intersecciones de las cuatro líneas forman un cuadrado con área = 1/5 dm². Aplicando la estrategia de Eloísa: la región se puede dividir en 5 partes iguales, siendo el cuadrado interior una de ellas.",
  },
 
  {
    id: "MAT-025",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 1,
    contexto: `El sistema de comunicaciones de un hotel utiliza los dígitos 2, 3, 4 y 5 para asignar un número de extensión telefónica de 4 dígitos diferentes a cada habitación. ¿Cuántas habitaciones del hotel pueden tener extensión telefónica?`,
    opciones: {
      A: "24",
      B: "56",
      C: "120",
      D: "256",
    },
    respuesta: "A",
    justificacion: "Se deben ordenar 4 dígitos diferentes en 4 posiciones sin repetición: 4 opciones para el primer dígito, 3 para el segundo, 2 para el tercero y 1 para el cuarto. Total: 4! = 4×3×2×1 = 24 extensiones posibles.",
  },
 
  {
    id: "MAT-026",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-026-transporte-intermunicipal.png",
      alt: "Gráfica circular del parque automotor del transporte intermunicipal en Colombia. Sectores: Microbús 24%, Buseta 23%, Automóvil 18%, Camioneta 18%, Campero 9%, Bus escalera 7%, Bus 1%.",
      caption: "Gráfica. Transporte Intermunicipal de Pasajeros en Colombia (Superintendencia de Puertos y Transporte, 2009).",
    },
    contexto: `La gráfica circular muestra el parque automotor del transporte intermunicipal en Colombia por tipo de vehículo y porcentaje.
Según la información, ¿cuál de las siguientes afirmaciones es verdadera?`,
    opciones: {
      A: "La mayor parte del parque automotor son automóviles, camionetas y camperos.",
      B: "La mitad del parque automotor corresponde a automóviles, camionetas y camperos.",
      C: "La mayor parte del parque automotor son buses, microbuses y busetas.",
      D: "La mitad del parque automotor corresponde a buses, microbuses y busetas.",
    },
    respuesta: "C",
    justificacion: "Sumando los porcentajes: buses+microbuses+busetas = 1%+24%+23% = 48%. Automóviles+camionetas+camperos = 18%+18%+9% = 45%. Aunque ningún grupo llega al 50%, la combinación buses/microbuses/busetas (48%) es la mayor porción del parque automotor, superando a la de automóviles/camionetas/camperos (45%).",
  },
  {
    id: "MAT-027",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Una prueba atlética tiene un récord mundial de 10,49 segundos y un récord olímpico de 10,50 segundos. ¿Es posible que un atleta registre un tiempo que rompa el récord olímpico pero no el mundial?`,
    opciones: {
      A: "Sí, porque puede registrar, por ejemplo, un tiempo de 10,497 segundos, que está entre los dos tiempos récord.",
      B: "Sí, porque puede registrar un tiempo menor que 10,4 y marcaría un nuevo récord.",
      C: "No, porque no existe un registro posible entre los dos tiempos récord.",
      D: "No, porque cualquier registro menor que el récord olímpico va a ser menor que el récord mundial.",
    },
    respuesta: "A",
    justificacion: "Entre 10,49 y 10,50 existen infinitos números reales. Un tiempo de 10,497 s es menor que el récord olímpico (10,50 s), rompiéndolo, pero mayor que el récord mundial (10,49 s), sin afectarlo. Esto ilustra la densidad de los números reales: entre dos valores distintos siempre existen otros valores intermedios.",
  },
 
  {
    id: "MAT-028",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 1,
    imagen: {
      src: "assets/img/mat-028-cantidad_hombres_mujeres.png",
      alt: "Tabla de número de hombres y mujeres.",
      caption: "Tabla. Cantidad de hombres y mujeres.",
    },
    contexto: `En una institución educativa hay dos cursos en grado undécimo:
La probabilidad de escoger un estudiante de grado undécimo que sea mujer es 3/5. Uno de los valores de esta razón es el número total de mujeres (45). ¿Cuál es el otro valor?`,
    opciones: {
      A: "El número total de estudiantes de grado undécimo.",
      B: "El número total de hombres de grado undécimo.",
      C: "El número total de mujeres del curso 11B.",
      D: "El número total de hombres del curso 11A.",
    },
    respuesta: "A",
    justificacion: "La probabilidad 3/5 = 45/75. El numerador es el total de mujeres (45) y el denominador es el total de estudiantes de undécimo (75). Verificando: 45/75 = 3/5 ✓. El denominador de una probabilidad clásica es siempre el tamaño del espacio muestral, en este caso el total de estudiantes.",
  },
 
  {
    id: "MAT-029",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-029-escalera-muro.png",
      alt: "Figura 1: escalera apoyada en un muro de 12 m con base de 5 m. Figura 2: triángulo rectángulo con cateto vertical 12, cateto horizontal 5, hipotenusa 13 y ángulo θ entre el suelo y la escalera.",
      caption: "Figura. Escalera de 13 m apoyada en un muro de 12 m de altura, base de 5 m en el suelo, ángulo θ.",
    },
    contexto: `Para fijar un aviso publicitario se coloca una escalera sobre un muro a 12 metros del suelo. La escalera mide 13 metros y la base horizontal es de 5 metros. El ángulo θ se forma entre el suelo y la escalera.
¿Cuál es el coseno del ángulo θ?`,
    opciones: {
      A: "12/13",
      B: "12/5",
      C: "5/13",
      D: "13/5",
    },
    respuesta: "C",
    justificacion: "En el triángulo rectángulo: hipotenusa = escalera = 13 m, cateto opuesto a θ = muro = 12 m, cateto adyacente a θ = base = 5 m. El coseno del ángulo θ = cateto adyacente / hipotenusa = 5/13.",
  },
 
  {
    id: "MAT-030",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Una baraja de póquer tiene 52 cartas: Picas y Tréboles (negras); Corazones y Diamantes (rojas). Cada palo tiene 13 cartas (A, 2–10, J, Q, K).
 
Si la probabilidad de escoger una carta que cumpla dos características determinadas es cero, ¿cuáles características podrían ser?`,
    opciones: {
      A: "Ser una carta negra y ser un número par.",
      B: "Ser una carta roja y ser de picas.",
      C: "Ser una carta de corazones y ser un número impar.",
      D: "Ser una carta roja K y ser de diamantes.",
    },
    respuesta: "B",
    justificacion: "Las picas son cartas negras, no rojas. No puede existir una carta que sea roja Y de picas al mismo tiempo: la intersección es vacía, por lo que la probabilidad es 0. Las demás opciones tienen intersecciones no vacías: existen cartas negras con número par, cartas de corazones con número impar, y la K de diamantes es roja.",
  },
 
  {
    id: "MAT-031",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `Un profesor pide resolver (x + 2)(x + 3) = 5(x + 3). Tres estudiantes realizan los siguientes procedimientos:
 
María: x² + 5x + 6 = 5x + 15 → x² + 6 = 15 → x² = 9 → x = ±3
 
Nelson: (x+2)(x+3) − 5(x+3) = 0 → (x+3)[(x+2)−5] = 0 → (x+3)(x−3) = 0 → x² − 9 = 0 → x = ±3
 
Óscar: x + 2 + x + 3 = 5 + x + 3 → 2x + 5 = x + 8 → x = 3
 
¿Cuál(es) estudiante(s) siguió(aron) un procedimiento correcto?`,
    opciones: {
      A: "Solo Nelson y Óscar.",
      B: "Solo María y Nelson.",
      C: "Solamente Óscar.",
      D: "Solamente María.",
    },
    respuesta: "B",
    justificacion: "María expande correctamente (x+2)(x+3) = x²+5x+6 y simplifica para obtener x = ±3. Nelson factoriza correctamente para obtener x = ±3. Verificando x = −3: (−1)(0) = 0 y 5(0) = 0 ✓. Óscar comete el error de sumar los factores de cada producto en lugar de multiplicarlos, obteniendo solo x = 3 y perdiendo la solución x = −3.",
  },
 
  {
    id: "MAT-032",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    contexto: `Un trapecio isósceles es aquel cuyos lados no paralelos son congruentes. Se dibuja un trapecio isósceles en el plano cartesiano de modo que el eje y sea su eje de simetría.
 
Si dos de los vértices son (−4, 2) y (−2, 8), ¿cuáles son las coordenadas de los otros dos vértices?`,
    opciones: {
      A: "(8, 2) y (2, 4).",
      B: "(2, 8) y (4, 2).",
      C: "(−2, −4) y (−8, −2).",
      D: "(−4, −2) y (−2, −8).",
    },
    respuesta: "B",
    justificacion: "El eje y es eje de simetría del trapecio isósceles. La reflexión de un punto (x, y) respecto al eje y da (−x, y). Aplicando esto: reflexión de (−4, 2) es (4, 2) y reflexión de (−2, 8) es (2, 8). Los otros dos vértices son (2, 8) y (4, 2).",
  },
 
  {
    id: "MAT-033",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    contexto: `En una fábrica se encuesta a 100 empleados que viven cerca y se desplazan solo en bus o a pie:
- 60% del grupo son mujeres (60 mujeres, 40 hombres).
- 20% de las mujeres van en bus.
- 40% de los hombres van caminando.
 
¿Cuál tabla representa correctamente esta información?
 
Tabla A — bus: H=40, M=60 / caminando: H=60, M=40
Tabla B — bus: H=34, M=12 / caminando: H=16, M=38
Tabla C — bus: H=0, M=20 / caminando: H=40, M=40
Tabla D — bus: H=24, M=12 / caminando: H=16, M=48`,
    opciones: {
      A: "Tabla A",
      B: "Tabla B",
      C: "Tabla C",
      D: "Tabla D",
    },
    respuesta: "D",
    justificacion: "60 mujeres: 20% en bus = 12 en bus, 48 caminando. 40 hombres: 40% caminando = 16 a pie, 24 en bus. Tabla D: bus H=24, M=12; caminando H=16, M=48. Verificación: 24+12+16+48 = 100 ✓. Las otras tablas no cumplen simultáneamente los tres porcentajes dados.",
  },
 
  {
    id: "MAT-034",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Una regla de física establece: para aumentar el nivel de intensidad del sonido en 10 dB, la intensidad debe multiplicarse por 10. Ramiro necesita aumentar el nivel en 20 dB y, según su interpretación, multiplica la intensidad por 20. ¿Es correcta su interpretación?`,
    opciones: {
      A: "No, porque la regla no considera aumentos de 20 dB, solamente de 10 dB; no hay consideraciones para aumentos mayores.",
      B: "Sí, porque la regla indica que para aumentar en x unidades el nivel se agrega x a la intensidad.",
      C: "No, porque aumentar 20 dB equivale a aumentar 10 dB dos veces, es decir, multiplicar por 10 la intensidad dos veces; en total, multiplicar por 100.",
      D: "Sí, porque el resultado de multiplicar dos veces por 10 la intensidad es multiplicarla por 20.",
    },
    respuesta: "C",
    justificacion: "+10 dB → ×10. +20 dB = (+10 dB) dos veces → ×10 dos veces = ×100. La relación entre decibelios e intensidad es logarítmica: sumar 10 dB corresponde a multiplicar la intensidad por 10. El error de Ramiro es confundir adición de decibelios (escala logarítmica) con multiplicación directa (escala lineal).",
  },
 
  {
    id: "MAT-035",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `En una librería hay un descuento del 10% sobre el precio original. Juan tiene además un cupón del 10% sobre el precio ya descontado. Para un libro de $50, Juan sigue este procedimiento:
 
Paso 1. Multiplica el precio original por 9.
Paso 2. Divide el resultado del paso 1 entre 10.
Paso 3. Multiplica el resultado del paso 2 por 10.
Paso 4. Divide el resultado del paso 3 entre 100.
 
¿En cuál paso hay un error?`,
    opciones: {
      A: "En el paso 1, porque debe multiplicarse por 90 y no por 9.",
      B: "En el paso 3, porque el precio final es el 90% del precio de venta, por tanto, debe multiplicarse por 90 y no por 10.",
      C: "En el paso 2, porque para calcular el descuento es necesario dividir entre 100 y no entre 10.",
      D: "En el paso 4, porque solo es necesario dividir una vez; es suficiente con la división del paso 2.",
    },
    respuesta: "B",
    justificacion: "Pasos 1 y 2 calculan correctamente el precio de venta: (50×9)/10 = $45. El segundo descuento (10%) implica pagar el 90% de $45. El paso 3 debe multiplicar por 90 (para luego dividir entre 100 en el paso 4). Con el error (×10 en paso 3): (45×10)/100 = $4,5, precio incorrecto. Correcto: (45×90)/100 = $40,50.",
  },
 
  {
    id: "MAT-036",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 1,
    contexto: `En una bolsa hay 3 bolas rojas, 3 negras y 12 blancas. Una persona afirma que al sacar una bola al azar, los tres colores tienen la misma probabilidad de salir. ¿Es verdadera esta afirmación?`,
    opciones: {
      A: "Sí, pues el número de bolas de cada color no importa.",
      B: "No, pues no se sabe el número total de bolas en la bolsa.",
      C: "No, pues hay más bolas de un color que de los otros dos.",
      D: "Sí, pues las bolas están repartidas de igual manera.",
    },
    respuesta: "C",
    justificacion: "Total = 18 bolas. P(rojo) = 3/18 = 1/6; P(negro) = 3/18 = 1/6; P(blanco) = 12/18 = 2/3. Las probabilidades no son iguales porque hay cuatro veces más bolas blancas que de cada otro color. La probabilidad clásica depende directamente de la cantidad de casos favorables sobre el total.",
  },
 
  {
    id: "MAT-037",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Sobre una circunferencia de centro O se localizan dos puntos P y P' diferentes.
 
¿Cuál figura NO puede resultar al unir entre sí los tres puntos P, P' y O?`,
    opciones: {
      A: "Un triángulo isósceles.",
      B: "Un radio de la circunferencia.",
      C: "Un triángulo equilátero.",
      D: "Un diámetro de la circunferencia.",
    },
    respuesta: "B",
    justificacion: "Un radio es un segmento con dos extremos (centro O y un punto de la circunferencia). Al unir tres puntos distintos siempre se obtiene una figura con tres segmentos (triángulo) o, si son colineales, un segmento que contiene los tres. En ningún caso los tres puntos pueden formar un único radio (segmento entre dos puntos). Las demás opciones sí son posibles: triángulo isósceles (siempre, pues OP = OP'), equilátero (si |PP'| = r) o diámetro (si P y P' son extremos de un diámetro, con O entre ellos).",
  },
 
  {
    id: "MAT-038",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-038-pizzeria.png",
      alt: "Figura 1: escalera apoyada en un muro de 12 m con base de 5 m. Figura 2: triángulo rectángulo con cateto vertical 12, cateto horizontal 5, hipotenusa 13 y ángulo θ entre el suelo y la escalera.",
      caption: "Tabla. Registró de la información de la administración.",
    },
    contexto: `Carolina registró los pedidos de 110 clientes en su pizzería el domingo:
¿Cuáles de los siguientes datos se pueden calcular con esta información?`,
    opciones: {
      A: "El total de clientes que eligieron pizza y también bebida caliente.",
      B: "El total de clientes que eligieron pizza o bebida caliente.",
      C: "El total de clientes que solo eligieron pizza.",
      D: "El total de clientes que solo eligieron bebida fría.",
    },
    respuesta: "C",
    justificacion: "Bebida caliente y bebida fría son mutuamente excluyentes (intersección = 0). Total con bebida = 20+40 = 60. Clientes sin bebida = 110−60 = 50. Los 10 que no eligieron pizza (110−100=10) eligieron bebida. Entonces pizza ∩ bebida = 60−10 = 50. Pizza solo = 100−50 = 50 ✓. Las opciones A, B y D requieren conocer intersecciones individuales (pizza∩caliente, pizza∩fría) que no se pueden determinar con los datos dados.",
  },
 
  {
    id: "MAT-039",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    contexto: `Un sistema de información requiere contraseñas de 3 caracteres usando 26 letras (mayúsculas o minúsculas) y 10 dígitos (0–9). Un ingeniero propone cuatro restricciones:
 
- R1: tres dígitos cualesquiera (con repetición).
- R2: tres dígitos distintos.
- R3: una letra mayúscula, luego una minúscula y al final un dígito.
- R4: una letra cualquiera (mayúscula o minúscula) y luego dos dígitos.
 
¿Cuál es el orden de las restricciones de menor a mayor según el número de contraseñas posibles?`,
    opciones: {
      A: "R1, R2, R4 y R3.",
      B: "R1, R2, R3 y R4.",
      C: "R2, R1, R4 y R3.",
      D: "R2, R3, R1 y R4.",
    },
    respuesta: "C",
    justificacion: "R1: 10×10×10 = 1.000. R2: 10×9×8 = 720 (sin repetición). R3: 26×26×10 = 6.760 (mayúsculas × minúsculas × dígito). R4: 52×10×10 = 5.200 (cualquier letra × dígito × dígito). Orden creciente: R2(720) < R1(1.000) < R4(5.200) < R3(6.760).",
  },
 
  {
    id: "MAT-040",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `Se pueden construir racionales mayores que un entero k cada vez más cercanos a k usando k + 1/j (con j entero positivo). Cuanto mayor sea j, más cercano a k será el racional.
 
¿Cuántos números racionales se pueden construir que sean mayores que k y menores que k + 1/11?`,
    opciones: {
      A: "10, que es la cantidad de racionales menores que 11.",
      B: "Una cantidad infinita, pues existen infinitos números enteros mayores que 11.",
      C: "11, que es el número que equivale en este caso a j.",
      D: "Uno, pues el racional más cercano a k se halla con j = 10, es decir, con k + 0,1.",
    },
    respuesta: "B",
    justificacion: "Para que k < k+1/j < k+1/11, se necesita j > 11. Como existen infinitos enteros positivos mayores que 11 (j=12, 13, 14, ...), se pueden construir infinitos racionales de la forma k+1/j entre k y k+1/11. Esto ilustra la propiedad de densidad de los racionales: entre dos racionales distintos siempre hay infinitos números racionales.",
  },
 
  {
    id: "MAT-041",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    contexto: `Un terreno triangular debe cumplir los siguientes requerimientos:
 
Requerimiento 1. Uno de sus ángulos interiores debe ser de 90°.
Requerimiento 2. Dos lados deben medir 7 metros y el otro debe medir 18 metros.
Requerimiento 3. Uno de sus ángulos interiores debe ser menor que 45°.
Requerimiento 4. La suma de sus ángulos interiores debe ser de 180°.
 
¿Cuál requerimiento es imposible de cumplir?`,
    opciones: {
      A: "Requerimiento 1.",
      B: "Requerimiento 2.",
      C: "Requerimiento 3.",
      D: "Requerimiento 4.",
    },
    respuesta: "B",
    justificacion: "La desigualdad triangular exige que la suma de dos lados sea estrictamente mayor que el tercer lado. Con lados 7, 7 y 18: 7+7 = 14 < 18. Se viola la desigualdad triangular y por tanto es imposible construir un triángulo con estas medidas. Los requerimientos 1, 3 y 4 pueden cumplirse en otros triángulos.",
  },
 
  {
    id: "MAT-042",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-042-cancha-futbol-maqueta.png",
      alt: "Cancha de fútbol de 60 m × 100 m y cuatro maquetas a escala con dimensiones en diferentes unidades y notación científica (opciones A, B, C, D).",
      caption: "Figura. Cancha de 60 m × 100 m y cuatro diseños de maqueta con medidas cien veces menores.",
    },
    contexto: `Una cancha de fútbol mide 60 metros × 100 metros. Un arquitecto realiza una maqueta con medidas cien veces menores que las originales. ¿Cuál diseño representa correctamente las medidas de la maqueta?`,
    opciones: {
      A: "6 × 10⁻² metros y 1 × 10⁻² metros",
      B: "6 × 10⁻² centímetros y 1 × 10⁻² centímetros",
      C: "6 × 10¹ metros y 1 × 10² metros",
      D: "6 × 10¹ centímetros y 1 × 10² centímetros",
    },
    respuesta: "D",
    justificacion: "60 m ÷ 100 = 0,6 m = 60 cm = 6×10¹ cm. 100 m ÷ 100 = 1 m = 100 cm = 1×10² cm. La maqueta mide 60 cm × 100 cm, expresado en notación científica como 6×10¹ cm y 1×10² cm. La opción A (0,06 m × 0,01 m) da medidas diminutas e incorrectas; la opción C mantiene las medidas originales en lugar de reducirlas.",
  },

  {
    id: "MAT-043",
    materia: "Matemáticas",
    competencia: "Interpretación y representación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-043-funcion-rectangulos.png",
      alt: "Gráfica de f(x) = 5/x para x > 0 (hipérbola decreciente). Se muestra un rectángulo de área Ax bajo la curva. Cuatro opciones de gráficas para Ax: A) recta creciente, B) línea horizontal en y=5, C) parábola creciente, D) parábola invertida.",
      caption: "Figura. Función f(x) = 5/x y cuatro posibles gráficas de la función área Ax = xf(x).",
    },
    contexto: `El área de los rectángulos construidos desde el origen hasta un punto de f(x) = 5/x (con x > 0) se describe con Ax = x·f(x).
¿Cuál gráfica corresponde a Ax?`,
    opciones: {
      A: "Función lineal creciente que parte del origen.",
      B: "Línea horizontal constante en y = 5.",
      C: "Función cuadrática creciente.",
      D: "Parábola con máximo y que luego decrece.",
    },
    respuesta: "B",
    justificacion: "Ax = x · f(x) = x · (5/x) = 5. La función área es constante e igual a 5 para todo x > 0. Su gráfica es una línea horizontal en y = 5 con punto abierto en x = 0 (ya que x > 0 estrictamente). Esto refleja el hecho de que todos los rectángulos inscritos bajo la hipérbola f(x) = 5/x tienen la misma área.",
  },

  {
    id: "MAT-044",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-044-rueda-giratoria.png",
      alt: "Rueda giratoria circular de radio 3 m dividida en 10 sectores circulares iguales. Se muestra la vista superior (círculo dividido) y una vista tridimensional cónica.",
      caption: "Figura. Rueda giratoria de 3 m de radio con 10 sectores iguales para 10 personas.",
    },
    contexto: `En un parque hay una rueda giratoria de 3 m de radio diseñada para 10 personas en sectores circulares de igual área. El área de cada sector se calcula con S = r²(θ/2), donde θ = 2π/10.
 
Usando π ≈ 3, ¿cuál es el área aproximada que le corresponde a cada persona?`,
    opciones: {
      A: "3,6 m²",
      B: "2,7 m²",
      C: "9,0 m²",
      D: "1,8 m²",
    },
    respuesta: "B",
    justificacion: "Área total del círculo = π·r² = 3·9 = 27 m². Área por sector = 27/10 = 2,7 m². Verificando con la fórmula del sector: θ = 2π/10 = π/5 ≈ 3/5; S = r²·(θ/2) = 9·(3/5)/2 = 9·(3/10) = 2,7 m² ✓.",
  },
 
  {
    id: "MAT-045",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    contexto: `Un colegio necesita enviar 5 estudiantes a un foro: 2 de grado décimo y 3 de grado undécimo. En décimo hay 5 estudiantes disponibles y en undécimo hay 4. ¿Cuántos grupos diferentes pueden formarse?`,
    opciones: {
      A: "9",
      B: "14",
      C: "20",
      D: "40",
    },
    respuesta: "D",
    justificacion: "Combinaciones de décimo: C(5,2) = 5!/(2!·3!) = 10. Combinaciones de undécimo: C(4,3) = 4!/(3!·1!) = 4. Como las elecciones son independientes, el total de grupos es 10 × 4 = 40.",
  },
 
  {
    id: "MAT-046",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `Un niño gana una consola si gana en AMBOS juegos:
- Juego 1: P(ganar) = 1/2 (número par en un dado).
- Juego 2: P(ganar) = 1/6 (sacar la pelota amarilla de 6).
 
Se proponen cuatro procedimientos para hallar la probabilidad de ganar la consola:
1. Sumar las probabilidades de ganar.
2. Multiplicar las probabilidades de ganar.
3. Restarle a 1 la probabilidad de perder en al menos uno.
4. Restarle a 1 la probabilidad de perder exactamente en uno.
 
¿Cuáles procedimientos son correctos?`,
    opciones: {
      A: "1 y 3.",
      B: "1 y 4.",
      C: "2 y 3.",
      D: "2 y 4.",
    },
    respuesta: "C",
    justificacion: "Procedimiento 2: los juegos son independientes; P(ganar ambos) = (1/2)×(1/6) = 1/12 ✓. Procedimiento 3: P(ganar ambos) = 1 − P(perder al menos uno) ✓ (complemento del evento). Procedimiento 1 es incorrecto: la suma de probabilidades no da la probabilidad de la intersección. Procedimiento 4 es incorrecto: 1 − P(perder exactamente uno) ≠ P(ganar ambos) en general.",
  },
 
  {
    id: "MAT-047",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 1,
    contexto: `La expresión 10³ = I/I₀ relaciona la sonoridad de un sonido de 30 decibeles con su intensidad I y la menor intensidad I₀ que percibe el oído humano. ¿Cuántas veces es el valor de I respecto a I₀?`,
    opciones: {
      A: "Una milésima.",
      B: "Un tercio.",
      C: "Tres veces.",
      D: "Mil veces.",
    },
    respuesta: "D",
    justificacion: "Despejando de 10³ = I/I₀: I = 10³ × I₀ = 1.000 × I₀. La intensidad I es 1.000 veces la intensidad mínima I₀. El exponente 3 en 10³ indica que la intensidad se multiplica por 1.000 (no que se suma 3).",
  },
 
  {
    id: "MAT-048",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    contexto: `16 estudiantes eligen números del 3 al 18. El número ganador se determina sumando 3 extracciones (con reposición) de una urna con balotas numeradas 1 a 6. La primera extracción dio 2.
 
¿Por qué es más probable que gane el estudiante con el número 10 que el del número 7?`,
    opciones: {
      A: "Porque al ser mayor el número escogido, es mayor la probabilidad de ganar.",
      B: "Porque el primer estudiante tiene una posibilidad más de ganar que el segundo.",
      C: "Porque es más probable seguir obteniendo números pares.",
      D: "Porque es mayor la diferencia entre 10 y 18 que entre 2 y 7.",
    },
    respuesta: "B",
    justificacion: "Con primera extracción = 2, las dos siguientes deben sumar 8 (para llegar a 10) o 5 (para llegar a 7). Combinaciones que suman 8 con dos dados: (2,6),(3,5),(4,4),(5,3),(6,2) = 5 formas. Combinaciones que suman 5: (1,4),(2,3),(3,2),(4,1) = 4 formas. El estudiante del 10 tiene una posibilidad más de ganar (5 vs 4 sobre 36 posibles resultados).",
  },
 
  {
    id: "MAT-049",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    contexto: `En una zona de la ciudad cada metro cuadrado cuesta $800.000 y se valoriza un 5% anual respecto al costo del año anterior. ¿Cuál expresión representa el costo de un metro cuadrado transcurridos n años?`,
    opciones: {
      A: "800.000 + 5n",
      B: "800.000 (5n)",
      C: "800.000 (5/100)ⁿ",
      D: "800.000 (1 + 5/100)ⁿ",
    },
    respuesta: "D",
    justificacion: "Una valorización del 5% anual compuesta corresponde al modelo exponencial V(n) = V₀ × (1+r)ⁿ, donde V₀ = 800.000 y r = 5/100 = 0,05. La expresión correcta es 800.000 × (1+5/100)ⁿ = 800.000 × (1,05)ⁿ. La opción A es crecimiento lineal (incorrecto); la opción C carece del '1+' que preserva el capital inicial.",
  },
 
  {
    id: "MAT-050",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-050-empaques-volumenes.png",
      alt: "Tres empaques: 1) Cilindro con altura h=2 y radio r=3/2. 2) Caja de base cuadrada con altura h=2 y lado L=3/2. 3) Esfera con radio r=3/2.",
      caption: "Figura. Tres empaques de Alfonso con las mismas dimensiones características (r o L = 3/2, h = 2 donde aplica).",
    },
    contexto: `Alfonso tiene tres empaques:
1. Cilindro: altura h = 2, radio r = 3/2.
2. Caja cuadrada: altura h = 2, lado L = 3/2.
3. Esfera: radio r = 3/2.
 
¿Cuál afirmación es verdadera respecto a los volúmenes?`,
    opciones: {
      A: "El volumen del cilindro es mayor que el de la caja; además, el volumen de la esfera es igual que el del cilindro.",
      B: "El volumen del cilindro es igual que el de la caja; además, el volumen de la esfera es mayor que el del cilindro.",
      C: "El volumen del cilindro es menor que el de la caja; además, el volumen de la esfera es igual que el del cilindro.",
      D: "El volumen del cilindro es mayor que el de la caja; además, el volumen de la esfera es mayor que el del cilindro.",
    },
    respuesta: "A",
    justificacion: "Cilindro: V = π·r²·h = π·(9/4)·2 = 9π/2 ≈ 14,14. Caja: V = L²·h = (9/4)·2 = 9/2 = 4,5. Esfera: V = (4/3)·π·r³ = (4/3)·π·(27/8) = (4·27·π)/(3·8) = 9π/2 ≈ 14,14. Conclusiones: Cilindro (≈14,14) > Caja (4,5) ✓; Esfera (≈14,14) = Cilindro (≈14,14) ✓. La opción A es correcta.",
  },
 
  {
    id: "MAT-051",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-sismos.png",
      alt: "Tabla de sismos registrados en el planeta durante la primera década del siglo XXI. Filas: magnitudes 5.0–5.9, 6.0–6.9, 7.0–7.9 y 8.0–8.9. Columnas: años 2001 a 2010, total por magnitud y total por año.",
      caption: "Tabla 1. Total de sismos registrados en el planeta durante la primera década del siglo XXI, distribuidos por magnitud y año.",
    },
    contexto: `La tabla muestra el total de sismos registrados en el planeta durante la primera década del siglo XXI. A partir de esos datos, una persona predice que en el 2011 se presentarán exactamente 173 sismos de magnitud igual o superior a 6,0 grados (suma: 151 de magnitud 6.0–6.9 + 21 de magnitud 7.0–7.9 + 1 de magnitud 8.0–8.9, valores iguales a los de 2009 y 2010).`,
    pregunta: "Que suceda lo que esta persona predice es:",
    opciones: {
      A: "imposible, pues el número de sismos, de cualquier magnitud, ha ido disminuyendo desde 2007.",
      B: "poco probable, porque, de acuerdo con la tendencia, el número de sismos en el 2011 será mayor que 173.",
      C: "incierto, pues a partir del número de sismos de cualquier magnitud presentado en el pasado no se puede predecir el número de sismos futuros.",
      D: "seguro, pues la tendencia de los dos años anteriores a 2011 indica que se presentarán 151 sismos de magnitud entre 6,0 y 6,9; 21 de magnitud entre 7,0 y 7,9, y 1 de magnitud superior a 8,0.",
    },
    respuesta: "C",
    justificacion: "Los datos históricos de sismos permiten describir tendencias pasadas, pero no garantizan predicciones exactas sobre eventos futuros, ya que los fenómenos sísmicos son de naturaleza impredecible. La opción C es correcta porque reconoce esta incertidumbre fundamental. La opción D es incorrecta porque la coincidencia de dos años consecutivos con los mismos valores no implica que se repetirán exactamente en el siguiente año; en ciencias naturales, la repetición puntual de datos no equivale a una ley determinista. La opción A es incorrecta porque el número total de sismos no ha disminuido consistentemente desde 2007 (aumentó de 3.362 en 2007 a 4.127 en 2010).",
  },
 
  {
    id: "MAT-052",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-sismos.png",
      alt: "Tabla de sismos registrados en el planeta durante la primera década del siglo XXI con totales anuales y totales por magnitud.",
      caption: "Tabla 1. Total de sismos registrados en el planeta durante la primera década del siglo XXI, distribuidos por magnitud y año.",
    },
    contexto: `La tabla muestra el total de sismos registrados en el planeta durante la primera década del siglo XXI, con un total por año (por ejemplo, 3.362 en 2001) y un total general para la década (36.919). Se desea estimar la cantidad promedio de sismos que ocurren en un mes.`,
    pregunta: "¿Cuál de los siguientes cocientes permite estimar la cantidad de sismos mensuales?",
    opciones: {
      A: "Total de sismos sobre meses del año.",
      B: "Total de sismos por año sobre meses del año.",
      C: "Total de sismos por año sobre días del año.",
      D: "Total de sismos sobre su magnitud.",
    },
    respuesta: "B",
    justificacion: "Para estimar el promedio mensual de sismos se debe dividir el número de sismos de un año (total por año) entre los 12 meses del año. Este es el cociente de la opción B. La opción A usaría el total de toda la década (36.919) dividido entre 12, lo que daría un promedio mensual de 10 años, no de un año específico. La opción C dividiría entre días del año, obteniendo un promedio diario, no mensual. La opción D no tiene sentido matemático porque la magnitud no es una unidad de tiempo.",
  },
 
  {
    id: "MAT-053",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-sismos.png",
      alt: "Tabla de sismos registrados por año (2001–2010). Totales anuales: 3.362, 3.343, 3.361, 3.674, 3.849, 3.871, 3.362, 3.956, 4.014, 4.127.",
      caption: "Tabla 1. Total de sismos registrados en el planeta durante la primera década del siglo XXI, distribuidos por magnitud y año.",
    },
    contexto: `La tabla registra el total de sismos por año entre 2001 y 2010. El promedio anual de sismos en esa década fue de 3.783. Se pide identificar cuál año tuvo el número de sismos más cercano al promedio y cuál estuvo más lejos.`,
    pregunta: "Los años con el número de sismos más cercano y más lejano al promedio (3.783) son:",
    opciones: {
      A: "2007 y 2010, respectivamente.",
      B: "2006 y 2005, respectivamente.",
      C: "2005 y 2002, respectivamente.",
      D: "2002 y 2008, respectivamente.",
    },
    respuesta: "C",
    justificacion: "Calculando la diferencia absoluta de cada año respecto al promedio de 3.783: 2001: |3.362 − 3.783| = 421; 2002: |3.343 − 3.783| = 440; 2003: |3.361 − 3.783| = 422; 2004: |3.674 − 3.783| = 109; 2005: |3.849 − 3.783| = 66 (mínima diferencia); 2006: |3.871 − 3.783| = 88; 2007: |3.362 − 3.783| = 421; 2008: |3.956 − 3.783| = 173; 2009: |4.014 − 3.783| = 231; 2010: |4.127 − 3.783| = 344. El año más cercano al promedio es 2005 (diferencia de 66) y el más lejano es 2002 (diferencia de 440). Respuesta: opción C.",
  },
 
  {
    id: "MAT-054",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-sismos.png",
      alt: "Tabla de sismos registrados en el planeta. Total de sismos de magnitud 8.0–8.9: 12. Total general de sismos registrados en la década: 36.919.",
      caption: "Tabla 1. Total de sismos registrados en el planeta durante la primera década del siglo XXI, distribuidos por magnitud y año.",
    },
    contexto: `La tabla muestra que durante la primera década del siglo XXI se registraron 36.919 sismos en total, de los cuales 12 tuvieron magnitud entre 8,0 y 8,9. Se pide expresar la proporción de sismos de esta magnitud de manera aproximada.`,
    pregunta: "En la primera década del siglo XXI, la proporción de sismos de magnitud entre 8,0 y 8,9 es de, aproximadamente:",
    opciones: {
      A: "1 de cada 3.000 sismos.",
      B: "1 de cada 12 sismos.",
      C: "12 de cada 18.000 sismos.",
      D: "12 de cada 4.000 sismos.",
    },
    respuesta: "A",
    justificacion: "La proporción exacta es 12 / 36.919 ≈ 1 / 3.077, lo que se aproxima mejor a '1 de cada 3.000 sismos' (opción A). Para verificar las otras opciones: 12/18.000 = 1/1.500 (muy diferente de la proporción real) y 12/4.000 = 1/333 (también incorrecta). La opción B (1 de cada 12) implicaría que casi el 8% de los sismos serían de magnitud 8+, lo cual no corresponde a la tabla.",
  },
 
  // ─── PREGUNTAS 6–7: Testamento de la señora Antonia ─────────────────────────
 
  {
    id: "MAT-055",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-esquema-herencia.png",
      alt: "Esquema jerárquico de los herederos de la Tía Antonia. Sobrinos (nivel 1): Beatriz (fallecida), Jacinto, Antonio (fallecido), Blanca y Héctor. Hijos de sobrinos (nivel 2): Patricia y Jaime (hijos de Beatriz); Juan (hijo de Antonio); Teresa y Bernardo (hijos de Héctor).",
      caption: "Figura 1. Esquema de los herederos de la señora Antonia según su testamento.",
    },
    contexto: `La señora Antonia tiene bienes por $400.000.000 en total ($240.000.000 en casa + $160.000.000 en apartamento). Su testamento indica que los bienes se dividen en partes iguales entre sus 5 sobrinos; la parte de cada sobrino fallecido se divide entre sus hijos. Beatriz (fallecida) tiene 2 hijos: Patricia y Jaime. Patricia afirma que con el testamento recibirá más dinero que si la herencia se repartiera en partes iguales entre los 8 familiares vivos.`,
    pregunta: "La afirmación de Patricia es:",
    opciones: {
      A: "incorrecta, pues de cualquiera de las dos formas los herederos reciben $32.000.000.",
      B: "correcta, pues según el testamento la herencia se distribuye entre 6 personas; de la otra forma se debe repartir entre 8.",
      C: "incorrecta, pues Patricia recibirá 10% de la herencia, que es menos que el 12,5% que recibiría con la otra distribución.",
      D: "correcta, pues el dinero se divide solo entre ella y su hermano.",
    },
    respuesta: "C",
    justificacion: "Con el testamento: la herencia se divide en 5 partes (una por sobrino). La parte de Beatriz (1/5) se reparte entre sus 2 hijos, por lo que Patricia recibe 1/5 × 1/2 = 1/10 = 10% del total ($40.000.000). Con la otra distribución (entre los 8 familiares vivos: Patricia, Jaime, Jacinto, Juan, Blanca, Héctor, Teresa, Bernardo): Patricia recibiría 1/8 = 12,5% ($50.000.000). Como 10% < 12,5%, Patricia en realidad recibe menos con el testamento, por lo que su afirmación es incorrecta. La opción B es incorrecta porque el testamento no distribuye entre 6 personas: Jacinto, Blanca y Héctor reciben 1/5 cada uno, y los descendientes de Beatriz y Antonio subdividen las partes de sus padres.",
  },
 
  {
    id: "MAT-056",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-esquema-herencia.png",
      alt: "Esquema jerárquico de los herederos de la Tía Antonia. Sobrinos: Beatriz (fallecida), Jacinto, Antonio (fallecido), Blanca y Héctor. Hijos de sobrinos: Patricia y Jaime (hijos de Beatriz); Juan (único hijo de Antonio); Teresa y Bernardo (hijos de Héctor).",
      caption: "Figura 1. Esquema de los herederos de la señora Antonia según su testamento.",
    },
    contexto: `La señora Antonia divide su herencia ($400.000.000) en 5 partes iguales, una para cada sobrino. La parte del sobrino fallecido se divide entre sus hijos. Antonio está fallecido y Juan es su único hijo.`,
    pregunta: "¿Qué parte de la herencia le corresponde a Juan?",
    opciones: {
      A: "La quinta parte.",
      B: "La mitad.",
      C: "La octava parte.",
      D: "La tercera parte.",
    },
    respuesta: "A",
    justificacion: "Según el testamento, la herencia se divide primero en 5 partes iguales (una por sobrino). A Antonio le corresponde 1/5 de la herencia. Como Juan es el único hijo de Antonio, hereda el 100% de la parte de su padre, que equivale a 1/5 del total. Por lo tanto, Juan recibe la quinta parte de la herencia ($80.000.000). Nótese que si Antonio tuviera varios hijos, cada uno recibiría una fracción de ese 1/5, pero al ser Juan el único heredero, conserva la quinta parte completa.",
  },
 
  // ─── PREGUNTAS 8–9: Instructor de pilates (horario y precios) ───────────────
 
  {
    id: "MAT-057",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-pilates.png",
      alt: "Tabla 1 (precios pilates): 2 sesiones/semana = 8 clases/mes a $280.000; 3 sesiones/semana = 12 clases/mes a $384.000; 4 sesiones/semana = 16 clases/mes a $480.000. Tabla 2 (horario): cuadrícula de franjas horarias de 8 a.m. a 7 p.m. de lunes a sábado, con celdas en gris indicando clases ya asignadas.",
      caption: "Tablas del instructor de pilates: Tabla 1 (planes y precios) y Tabla 2 (disponibilidad horaria semanal).",
    },
    contexto: `Un instructor de pilates ofrece tres planes mensuales: 2 sesiones por semana (8 al mes) a $280.000; 3 sesiones por semana (12 al mes) a $384.000; 4 sesiones por semana (16 al mes) a $480.000. Camilo quiere inscribirse al plan cuyo costo por sesión sea el más bajo y elige tomar 2 sesiones semanales.`,
    pregunta: "¿Logra Camilo cumplir su propósito de que el costo por sesión sea el de menor precio?",
    opciones: {
      A: "No, pues el costo por sesión de menor precio lo obtiene si toma 4 sesiones por semana.",
      B: "Sí, pues tomar 2 sesiones por semana tiene el menor costo mensual de todas las opciones.",
      C: "No, pues se paga un menor precio por sesión si toma 3 sesiones por semana.",
      D: "Sí, pues tomar menos sesiones garantiza pagar menos por cada una de ellas.",
    },
    respuesta: "A",
    justificacion: "Para comparar el costo por sesión se divide el costo mensual entre el número de sesiones mensuales: Plan 2 sesiones/semana: $280.000 ÷ 8 = $35.000 por sesión; Plan 3 sesiones/semana: $384.000 ÷ 12 = $32.000 por sesión; Plan 4 sesiones/semana: $480.000 ÷ 16 = $30.000 por sesión. El menor costo por sesión ($30.000) corresponde al plan de 4 sesiones semanales. Camilo eligió el plan más costoso por sesión ($35.000), lo que evidencia que aumentar el número de sesiones reduce el costo unitario (economía de escala). La opción D es incorrecta porque tomar menos sesiones implica un mayor costo por sesión, no menor.",
  },
 
  {
    id: "MAT-058",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-pilates.png",
      alt: "Tabla 2 del horario del instructor de pilates: franjas de 8 a.m. a 7 p.m. (con pausa entre 2 p.m. y 4 p.m.) de lunes a sábado. Las celdas en gris representan horas ya ocupadas con clases asignadas; las blancas son horas disponibles.",
      caption: "Tabla 2. Horario semanal del instructor de pilates con disponibilidad de franjas horarias.",
    },
    contexto: `La Tabla 2 muestra, en gris, los momentos del día que el instructor de pilates ya tiene asignados a otras personas. Las franjas horarias van de 8 a.m. a 7 p.m. (de lunes a sábado), con 9 franjas de 1 hora por día. Se pide identificar cuál de las cuatro afirmaciones sobre la disponibilidad es incorrecta.`,
    pregunta: "¿Cuál de las siguientes afirmaciones es incorrecta?",
    opciones: {
      A: "Hay más horas disponibles de 8 a.m. a 1 p.m., que de 1 p.m. a 7 p.m.",
      B: "Todos los días hay 5 horas disponibles.",
      C: "Hay más horas disponibles de jueves a sábado, que de lunes a miércoles.",
      D: "El sábado de 12 m. a 7 p.m. no hay clases asignadas.",
    },
    respuesta: "B",
    justificacion: "La afirmación incorrecta es B. La distribución de clases asignadas (celdas en gris) varía de un día a otro en la Tabla 2, por lo que el número de horas disponibles difiere según el día. No todos los días tienen exactamente 5 horas disponibles. Las afirmaciones A, C y D pueden verificarse directamente contando las franjas libres y ocupadas en la tabla, y resultan ser verdaderas según el horario mostrado.",
  },
 
  // ─── PREGUNTAS 10–11: Gráfica de inversión en seguridad vial (1996–2002) ─────
 
  {
    id: "MAT-059",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 1,
    imagen: {
      src: "assets/img/mat-grafica-seguridad-vial.png",
      alt: "Gráfica de líneas titulada 'Inversión en seguridad' con valores en millones de euros. Eje X: años 1996 a 2002. Eje Y: 0 a 200 millones de euros. Valores: 1996=135,10; 1997=109,68; 1998=108,96; 1999=110,95; 2000=166,36; 2001=195,77; 2002=194,39.",
      caption: "Gráfica. Inversión en seguridad vial de un país, período 1996–2002 (en millones de euros).",
    },
    contexto: `La gráfica muestra la inversión que hizo un país en temas de seguridad vial durante 7 años (1996–2002), expresada en millones de euros. Se deben identificar los años con mayor inversión dentro del período.`,
    pregunta: "Durante el período 1996 – 2002, los años en los que se hizo mayor inversión en seguridad vial fueron:",
    opciones: {
      A: "1997, 1998, 1999 y 2000.",
      B: "2000, 2001 y 2002.",
      C: "1997, 1998 y 1999.",
      D: "1996, 1997, 1998 y 1999.",
    },
    respuesta: "B",
    justificacion: "Comparando los valores de la gráfica, las tres inversiones más altas del período son: 2001 (195,77 millones), 2002 (194,39 millones) y 2000 (166,36 millones). Estos tres años superan ampliamente los valores de 1996 (135,10 millones) y los años 1997–1999 (alrededor de 109–111 millones). Los años 1997, 1998 y 1999 corresponden precisamente a los de menor inversión, por lo que las opciones A, C y D son incorrectas.",
  },
 
  {
    id: "MAT-060",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-grafica-seguridad-vial.png",
      alt: "Gráfica de líneas de inversión en seguridad vial 1996–2002. Valor para 2002: 194,39 millones de euros.",
      caption: "Gráfica. Inversión en seguridad vial de un país, período 1996–2002 (en millones de euros).",
    },
    contexto: `La inversión en seguridad se realiza el 10 de enero de cada año. En enero 10 de 2002, un euro equivalía a 2.800 pesos colombianos (aproximadamente). La inversión ese año fue de 194,39 millones de euros. Se proponen tres procedimientos para expresar esa inversión en pesos colombianos: I) Convertir 194,39 millones de euros a pesos colombianos. II) Convertir 2.800 pesos colombianos a euros. III) Multiplicar 194,39 por 2.800 y luego dividir entre el total de años.`,
    pregunta: "¿Cuál o cuáles de los procedimientos es correcto para hallar lo solicitado?",
    opciones: {
      A: "I y III solamente.",
      B: "I solamente.",
      C: "II y III solamente.",
      D: "II solamente.",
    },
    respuesta: "B",
    justificacion: "Para convertir la inversión de 2002 a pesos colombianos, la operación correcta es: 194.390.000 euros × 2.800 pesos/euro = cantidad en pesos. Este cálculo corresponde exactamente al Procedimiento I (convertir 194,39 millones de euros a pesos). El Procedimiento II convierte 2.800 pesos a euros (operación inversa e irrelevante para el objetivo). El Procedimiento III añade innecesariamente una división entre el total de años, que distorsiona el resultado. Por tanto, solo el Procedimiento I es correcto.",
  },
 
  // ─── PREGUNTAS 12–13: Campaña de reciclaje ──────────────────────────────────
 
  {
    id: "MAT-061",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: null,
    contexto: `En una ciudad se producen en promedio 600 toneladas diarias de residuos domésticos, de las cuales el 25% corresponde a papel y cartón. Por cada tonelada de papel y cartón que se recicla, se ahorran 50.000 litros de agua. Se realizó una campaña de reciclaje durante 3 días en una unidad residencial, recolectando 2 toneladas diarias de papel y cartón, evitando la tala de 2 × 3 × 17 = 102 árboles adultos. Si la misma campaña se realizara durante 20 días y se recolectara la misma cantidad diaria, ¿cuánta agua se ahorraría?`,
    pregunta: "Si esta campaña se efectuara durante 20 días en la misma unidad y se recolectara la misma cantidad, se podrían ahorrar:",
    opciones: {
      A: "680 litros de agua.",
      B: "5.600 litros de agua.",
      C: "300.000 litros de agua.",
      D: "2.000.000 litros de agua.",
    },
    respuesta: "D",
    justificacion: "En 20 días se recolectan 2 toneladas/día × 20 días = 40 toneladas de papel y cartón. Por cada tonelada reciclada se ahorran 50.000 litros de agua. Total ahorrado: 40 toneladas × 50.000 litros/tonelada = 2.000.000 litros de agua. Las opciones A y B son mucho menores al ignorar el número de días o el factor de ahorro por tonelada. La opción C (300.000 litros) correspondería a ahorrar solo 50.000 × 6 litros, sin considerar correctamente los 40 días-tonelada del período.",
  },
 
  {
    id: "MAT-062",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: null,
    contexto: `En una ciudad se producen 600 toneladas diarias de residuos domésticos. El 25% corresponde a papel y cartón, es decir, 150 toneladas de papel y cartón por día. Por cada tonelada de papel y cartón reciclada, se ahorran 140 litros de petróleo. Una persona afirma: "Como al día se ahorran 140 litros de petróleo por cada tonelada de papel y cartón reciclado en la ciudad, durante un mes se ahorrarán exactamente 30 veces 140 litros de petróleo".`,
    pregunta: "Su afirmación es:",
    opciones: {
      A: "correcta, porque el número 30 indica el número de días que tiene un mes.",
      B: "incorrecta, porque debe tener en cuenta las 150 toneladas de papel y cartón reciclado por día.",
      C: "correcta, porque tiene en cuenta que día tras día hay 140 litros más de petróleo ahorrado.",
      D: "incorrecta, porque debe tener en cuenta las 25 toneladas de papel y cartón reciclado por día.",
    },
    respuesta: "B",
    justificacion: "El ahorro de 140 litros de petróleo se da POR CADA TONELADA de papel y cartón reciclada. En la ciudad se recicla el 25% de 600 toneladas = 150 toneladas diarias de papel y cartón. El ahorro diario total sería 150 × 140 = 21.000 litros, y mensualmente: 150 × 140 × 30 = 630.000 litros. La persona solo multiplica 140 × 30, ignorando el factor de 150 toneladas/día. La afirmación es incorrecta porque omite la cantidad de toneladas recicladas. La opción D menciona 25 toneladas, que es el porcentaje (25%), no la cantidad en toneladas.",
  },
 
  // ─── PREGUNTAS 14–16: Comportamiento de aves (tabla de actividades) ──────────
 
  {
    id: "MAT-063",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 1,
    imagen: {
      src: "assets/img/mat-tabla-aves.png",
      alt: "Tabla de duración total en minutos de 7 actividades (1-Alimentación, 2-Acicalamiento, 3-Descanso, 4-Desplazamiento, 5-Orientación, 6-Defecación, 7-Comunicación) para 5 aves. Ave 5: Alimentación=45 min, Acicalamiento=12, Descanso=15, Desplazamiento=20, Orientación=3, Defecación=15, Comunicación=10.",
      caption: "Tabla. Duración total (minutos) de actividades de 5 aves durante cuatro sesiones de 30 minutos.",
    },
    contexto: `Un científico estudia el comportamiento de cinco aves a lo largo de cuatro sesiones de 30 minutos cada una (tiempo total observado: 120 minutos por ave). La tabla registra el tiempo total en minutos que cada ave dedicó a cada actividad. El científico afirma que el ave 5 tarda más alimentándose que desplazándose, y quiere cuantificar esa diferencia.`,
    pregunta: "Los resultados indican que el ave 5 tarda más alimentándose que desplazándose. Esto es correcto, puesto que el tiempo en alimentación excede al de desplazamiento en:",
    opciones: {
      A: "20 minutos.",
      B: "25 minutos.",
      C: "33 minutos.",
      D: "45 minutos.",
    },
    respuesta: "B",
    justificacion: "Para el ave 5, según la tabla: Alimentación = 45 minutos y Desplazamiento = 20 minutos. La diferencia es 45 − 20 = 25 minutos. Por lo tanto, el tiempo de alimentación supera al de desplazamiento en exactamente 25 minutos. La opción A (20) corresponde al tiempo de desplazamiento, no a la diferencia. La opción D (45) corresponde al tiempo de alimentación.",
  },
 
  {
    id: "MAT-064",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-tabla-aves.png",
      alt: "Tabla de duración total en minutos de 7 actividades para 5 aves. Ave 1: Alim=30, Acic=16, Desc=20, Despl=25, Orient=4, Defec=10, Comun=15. Ave 5: Alim=45, Acic=12, Desc=15, Despl=20, Orient=3, Defec=15, Comun=10.",
      caption: "Tabla. Duración total (minutos) de actividades de 5 aves durante cuatro sesiones de 30 minutos.",
    },
    contexto: `Un científico afirma que la relación entre cada tiempo de las actividades del ave 1 y del ave 5 es 3:2 (es decir, para cada actividad, el tiempo del ave 1 dividido entre el tiempo del ave 5 debería ser igual a 3/2). Ave 1: Alimentación=30, Acicalamiento=16, Descanso=20, Desplazamiento=25, Orientación=4, Defecación=10, Comunicación=15. Ave 5: Alimentación=45, Acicalamiento=12, Descanso=15, Desplazamiento=20, Orientación=3, Defecación=15, Comunicación=10.`,
    pregunta: "La afirmación del científico es:",
    opciones: {
      A: "correcta, porque el tiempo invertido en las actividades 2, 5 y 6 por el ave 1 es igual al tiempo invertido en las actividades 4 y 7 por el ave 5.",
      B: "incorrecta, porque el tiempo invertido en las actividades 3, 6 y 7 por el ave 1 es igual al tiempo invertido en las actividades 4, 6 y 7 por el ave 5.",
      C: "correcta, porque para la actividad Comunicación la relación entre los tiempos está dada por 15/10 = 3/2.",
      D: "incorrecta, porque para la actividad Alimentación la relación entre los tiempos está dada por 30/45 = 2/3.",
    },
    respuesta: "D",
    justificacion: "Para que la relación sea 3:2 en todas las actividades, se necesita que (tiempo Ave 1) / (tiempo Ave 5) = 3/2 para cada actividad. Verificando la Actividad 1 (Alimentación): 30/45 = 2/3 ≠ 3/2. Esto basta para refutar la afirmación global del científico. La opción D es correcta porque identifica exactamente este contraejemplo. Aunque la Comunicación sí cumple la relación 3:2 (15/10 = 3/2, opción C), basta un solo caso que no la cumpla para invalidar la afirmación de que la relación se da en CADA actividad.",
  },
 
  {
    id: "MAT-065",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-aves.png",
      alt: "Tabla de duración total en minutos de 7 actividades para 5 aves. Ave 1: Alim=30, Desc=20, Defec=10. Ave 2: Alim=21, Desc=10, Defec=7. Ave 3: Alim=27, Desc=25, Defec=9. Ave 4: Alim=15, Desc=20, Defec=5. Ave 5: Alim=45, Desc=15, Defec=15.",
      caption: "Tabla. Duración total (minutos) de actividades de 5 aves durante cuatro sesiones de 30 minutos (120 minutos totales).",
    },
    contexto: `El científico quiere identificar el ave que cumple simultáneamente dos condiciones: (1) tarda el doble del tiempo o más en alimentarse que en descansar (Alimentación ≥ 2 × Descanso); (2) la defecación dura menos del 10% del tiempo total de observación. El tiempo total de las 4 sesiones es 4 × 30 = 120 minutos. El 10% de 120 minutos es 12 minutos.`,
    pregunta: "Estas características corresponden al ave:",
    opciones: {
      A: "1.",
      B: "2.",
      C: "3.",
      D: "5.",
    },
    respuesta: "B",
    justificacion: "Verificando condición (1) — Alimentación ≥ 2 × Descanso: Ave 1: 30 ≥ 2×20=40? No. Ave 2: 21 ≥ 2×10=20? Sí. Ave 3: 27 ≥ 2×25=50? No. Ave 5: 45 ≥ 2×15=30? Sí. Verificando condición (2) — Defecación < 12 min: Ave 2: 7 < 12? Sí. Ave 5: 15 < 12? No. Solo el ave 2 cumple ambas condiciones simultáneamente: alimentación (21) ≥ doble del descanso (20) y defecación (7) < 10% del tiempo total (12 min).",
  },
 
  // ─── PREGUNTAS 17–19: Pistas de aterrizaje y orientación magnética ───────────
 
  {
    id: "MAT-066",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-diagrama-pistas-aterrizaje.png",
      alt: "Dos diagramas circulares de brújula con norte magnético en la parte superior (0°). Izquierdo: aeronave oscura aterrizando a 120° en el extremo marcado '12'; la pista también muestra '30' en el extremo opuesto (300°). Derecho: pista horizontal marcada '09' en el extremo occidental (270°) y '27' en el extremo oriental (90°).",
      caption: "Figura. Sistema de numeración de pistas de aterrizaje según la orientación magnética en grados.",
    },
    contexto: `Las pistas de aterrizaje se marcan con los dos primeros dígitos de su dirección magnética en grados. Cada pista recibe dos números, uno en cada extremo. Los dos extremos son opuestos: difieren en 180°. Por ejemplo, el extremo 12 corresponde a 120° y su opuesto es 120° + 180° = 300° → extremo 30.`,
    pregunta: "Una pista marcada en un extremo con el número 24, en el extremo opuesto está marcada con el número:",
    opciones: {
      A: "06",
      B: "18",
      C: "36",
      D: "42",
    },
    respuesta: "A",
    justificacion: "El extremo 24 corresponde a la dirección 240°. El extremo opuesto está 180° después: 240° + 180° = 420°. Como el círculo completo es 360°, se resta: 420° − 360° = 60°. Los dos primeros dígitos de 60° son 06. Por tanto, el extremo opuesto al número 24 es el número 06. Verificación: 06 corresponde a 060°, y 060° + 180° = 240° = extremo 24. ✓",
  },
 
  {
    id: "MAT-067",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-diagrama-pistas-aterrizaje.png",
      alt: "Diagramas circulares de brújula que muestran la orientación magnética de pistas de aterrizaje. Norte magnético en 0°, Este en 90°, Sur en 180°, Oeste en 270°.",
      caption: "Figura. Sistema de numeración de pistas de aterrizaje según la orientación magnética en grados.",
    },
    contexto: `Un piloto está alineado para aterrizar en el extremo 24 (dirección 240°). Se le pide que cambie su rumbo girando 30 grados a su derecha (reducción de 30° en su rumbo magnético) para usar una pista libre. La nueva dirección de aterrizaje determinará el número de la pista que usará.`,
    pregunta: "El número que encuentra en la nueva pista es:",
    opciones: {
      A: "06",
      B: "21",
      C: "27",
      D: "54",
    },
    respuesta: "B",
    justificacion: "El piloto se orienta a 240° y gira 30° a su derecha, resultando en una nueva dirección de 240° − 30° = 210°. Los dos primeros dígitos de 210° son 21. Por tanto, el número de la pista en la que aterrizará es el 21. La opción C (27, que corresponde a 270°) sería el resultado de sumar 30° en lugar de restar, y la opción A (06) es el extremo opuesto al 24 original.",
  },
 
  {
    id: "MAT-068",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-diagrama-pistas-aterrizaje.png",
      alt: "Diagramas circulares de brújula con puntos cardinales: Norte=0°, Este=90°, Sur=180°, Oeste=270°. Las pistas se numeran según su dirección magnética de aterrizaje.",
      caption: "Figura. Sistema de numeración de pistas de aterrizaje según la orientación magnética en grados.",
    },
    contexto: `Un avión despega en dirección al extremo 32. El extremo 32 corresponde a la dirección de aterrizaje 320°. Cuando un avión despega desde el extremo 32 (se aleja de esa marca), se desplaza en la dirección opuesta: 320° − 180° = 140°. Se deben relacionar los 140° con los puntos cardinales (Norte=0°, Este=90°, Sur=180°, Oeste=270°).`,
    pregunta: "Un avión que despega en dirección al extremo 32, va hacia el:",
    opciones: {
      A: "sureste.",
      B: "noreste.",
      C: "suroeste.",
      D: "noroeste.",
    },
    respuesta: "A",
    justificacion: "El extremo 32 indica una dirección de aterrizaje de 320°. Al despegar desde el extremo 32, el avión se aleja de esa marca hacia el extremo opuesto de la pista, recorriendo la dirección 320° − 180° = 140°. La dirección 140° se ubica entre el Este (90°) y el Sur (180°), lo que corresponde al sureste. Esto descarta las opciones B (noreste ≈ 45°), C (suroeste ≈ 225°) y D (noroeste ≈ 315°).",
  },
 
  // ─── PREGUNTAS 20–23: Microempresa de jabón de tocador ──────────────────────
 
  {
    id: "MAT-069",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-jabon.png",
      alt: "Tabla de precios por unidad de jabón de tocador: Presentación Barra en 110g ($1.760), 125g ($2.000) y 150g ($2.400); Presentación Líquido en 300mL ($5.100), 500mL ($8.500) y 700mL ($11.900). Disponible en aromas: natural, coco y vainilla.",
      caption: "Tabla. Precios por unidad de diferentes presentaciones del producto jabón de tocador.",
    },
    contexto: `Una microempresa elabora jabón de tocador en presentación barra (3 contenidos) y líquido (3 contenidos). Un tanque almacena exactamente el jabón líquido necesario para envasar 50 unidades de cada uno de los tres tipos de contenido líquido: 300 mL, 500 mL y 700 mL. Se sabe que 1 litro = 1.000 mL.`,
    pregunta: "¿Cuál es la capacidad del tanque?",
    opciones: {
      A: "15 litros.",
      B: "75 litros.",
      C: "1.500 litros.",
      D: "75.000 litros.",
    },
    respuesta: "B",
    justificacion: "El tanque debe contener jabón para 50 unidades de cada tipo de jabón líquido: 50 × 300 mL = 15.000 mL; 50 × 500 mL = 25.000 mL; 50 × 700 mL = 35.000 mL. Total: 15.000 + 25.000 + 35.000 = 75.000 mL. Convirtiendo a litros: 75.000 mL ÷ 1.000 = 75 litros. La opción A (15 litros) correspondería solo al volumen de las unidades de 300 mL, y la opción D (75.000 litros) confunde mL con litros.",
  },
 
  {
    id: "MAT-070",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-tabla-jabon.png",
      alt: "Tabla de precios del jabón líquido: 300mL a $5.100, 500mL a $8.500 y 700mL a $11.900.",
      caption: "Tabla. Precios por unidad de diferentes presentaciones del producto jabón de tocador.",
    },
    contexto: `La tabla muestra los precios del jabón líquido: 300 mL a $5.100, 500 mL a $8.500 y 700 mL a $11.900. Se desea determinar el precio de una nueva presentación de 1.800 mL, manteniendo la misma relación de proporcionalidad entre el volumen y el precio por unidad.`,
    pregunta: "Si se conservara la relación entre el contenido y el precio por unidad, ¿cuál debería ser el precio de la presentación de jabón líquido con contenido de 1.800 mL?",
    opciones: {
      A: "$15.300",
      B: "$18.000",
      C: "$30.600",
      D: "$31.660",
    },
    respuesta: "C",
    justificacion: "Para verificar la proporcionalidad, se calcula el precio por mL: $5.100 / 300 mL = $17/mL; $8.500 / 500 mL = $17/mL; $11.900 / 700 mL = $17/mL. La relación es constante: $17 por mL. Para 1.800 mL: 1.800 × $17 = $30.600. La opción A ($15.300) equivaldría a $8,5/mL y la opción B ($18.000) a $10/mL, ninguna coincide con la proporción establecida.",
  },
 
  {
    id: "MAT-071",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-jabon.png",
      alt: "Tabla de presentaciones de jabón de tocador: Barra con 3 contenidos (110g, 125g, 150g) y Líquido con 3 contenidos (300mL, 500mL, 700mL). Cada combinación está disponible en 3 aromas: natural, coco y vainilla.",
      caption: "Tabla. Presentaciones del producto jabón de tocador con sus contenidos disponibles.",
    },
    contexto: `La microempresa elabora jabón de tocador en 2 presentaciones (Barra y Líquido), con 3 contenidos para cada una (total 6 variantes de contenido), y cada combinación está disponible en 3 aromas (natural, coco, vainilla). La etiqueta de cada producto debe especificar los tres aspectos: presentación, contenido y aroma.`,
    pregunta: "¿Cuántas etiquetas diferentes debe utilizar la fábrica?",
    opciones: {
      A: "2",
      B: "6",
      C: "12",
      D: "18",
    },
    respuesta: "D",
    justificacion: "Se aplica el principio multiplicativo del conteo: para cada combinación de presentación, contenido y aroma se necesita una etiqueta única. Número total de etiquetas = presentaciones × contenidos por presentación × aromas = 2 × 3 × 3 = 18. La opción B (6) corresponde solo a presentación × contenidos; la opción C (12) podría resultar de calcular 2 × 3 × 2 (ignorando un aroma). La respuesta correcta es 18 etiquetas diferentes.",
  },
 
  {
    id: "MAT-072",
    materia: "Matemáticas",
    competencia: "Formulación y ejecución",
    dificultad: 2,
    imagen: {
      src: "assets/img/mat-tabla-ventas-jabon.png",
      alt: "Tabla de registro de ventas semanales de tres vendedores. Vendedor I: 10 barras 110g, 200 barras 125g, 0 barras 150g, 100 líquidos 300mL, 10 líquidos 500mL, 10 líquidos 700mL. Vendedor II: 100, 100, 0, 100, 50, 50. Vendedor III: 10, 10, 10, 10, 10, 10.",
      caption: "Tabla. Registro de ventas semanales de tres vendedores de jabón de tocador.",
    },
    contexto: `La microempresa da incentivos a vendedores con ventas semanales superiores a $500.000. Los precios por unidad son: Barra 110g=$1.760, 125g=$2.000, 150g=$2.400; Líquido 300mL=$5.100, 500mL=$8.500, 700mL=$11.900. Se tienen los registros de ventas de tres vendedores en una semana.`,
    pregunta: "¿A cuál o cuáles de los vendedores se debe dar el incentivo?",
    opciones: {
      A: "I solamente.",
      B: "III solamente.",
      C: "I y II solamente.",
      D: "I, II y III.",
    },
    respuesta: "C",
    justificacion: "Calculando ventas totales: Vendedor I: (10×$1.760)+(200×$2.000)+(100×$5.100)+(10×$8.500)+(10×$11.900) = $17.600+$400.000+$510.000+$85.000+$119.000 = $1.131.600 > $500.000 ✓. Vendedor II: (100×$1.760)+(100×$2.000)+(100×$5.100)+(50×$8.500)+(50×$11.900) = $176.000+$200.000+$510.000+$425.000+$595.000 = $1.906.000 > $500.000 ✓. Vendedor III: (10×$1.760)+(10×$2.000)+(10×$2.400)+(10×$5.100)+(10×$8.500)+(10×$11.900) = $17.600+$20.000+$24.000+$51.000+$85.000+$119.000 = $316.600 < $500.000 ✗. Solo los vendedores I y II superan el umbral de $500.000.",
  },
 
  // ─── PREGUNTA 24: Diámetro de la Vía Láctea en años luz ─────────────────────
 
  {
    id: "MAT-073",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-formula-via-lactea.png",
      alt: "Expresión matemática usada por el estudiante: 10 elevado a 21 dividido entre (9,46 × 10 elevado a 12) = 10 elevado a 9 dividido entre 9,46 = 106 millones de años luz.",
      caption: "Procedimiento del estudiante para calcular el diámetro de la Vía Láctea en años luz.",
    },
    contexto: `Un año luz equivale a aproximadamente 9,46 × 10¹² km. Un estudiante sabe que el diámetro de la Vía Láctea mide aproximadamente 10²¹ m. Para convertirlo a años luz divide: 10²¹ / (9,46 × 10¹²) = 10⁹ / 9,46 ≈ 106 millones. El estudiante concluye que el diámetro es 106 millones de años luz. Se pide identificar por qué este procedimiento es incorrecto.`,
    pregunta: "El anterior procedimiento es incorrecto, porque:",
    opciones: {
      A: "el denominador de la fracción debe expresarse en potencias de diez.",
      B: "no se tiene en cuenta la equivalencia de unidades entre las magnitudes involucradas.",
      C: "para obtener el diámetro se debe determinar el producto entre ambas medidas relacionadas.",
      D: "el resultado no se expresa en potencias de diez como los otros datos.",
    },
    respuesta: "B",
    justificacion: "El error fundamental del estudiante es mezclar unidades incompatibles: el diámetro está en metros (10²¹ m) y el año luz está expresado en kilómetros (9,46 × 10¹² km). Para dividir correctamente ambas cantidades deben estar en las mismas unidades. Como 1 km = 1.000 m = 10³ m, el año luz equivale a 9,46 × 10¹² km = 9,46 × 10¹⁵ m. La división correcta sería 10²¹ m / (9,46 × 10¹⁵ m) ≈ 1,06 × 10⁵ años luz. Al no convertir unidades, el estudiante obtiene un resultado 1.000 veces mayor al correcto.",
  },
 
  {
    id: "MAT-074",
    materia: "Matemáticas",
    competencia: "Argumentación",
    dificultad: 3,
    imagen: {
      src: "assets/img/mat-figura-fuente-chocolate.png",
      alt: "Figura de una fuente de chocolate con tres recipientes cilíndricos apilados verticalmente y conectados por un tubo cilíndrico central. El recipiente inferior es el más grande y ancho, el intermedio es mediano y el superior es el más pequeño. Las líneas discontinuas indican los bordes de cada cilindro.",
      caption: "Figura. Fuente de chocolate de tres niveles con recipientes cilíndricos de diferentes tamaños.",
    },
    contexto: `Para una fiesta infantil, una fuente de chocolate tiene tres niveles con recipientes cilíndricos. El tubo central hace subir el chocolate desde el nivel inferior hasta el superior. Cuando el nivel superior se llena, el chocolate se desborda al nivel medio y, al llenarse este, pasa al inferior. El organizador quiere estimar la capacidad total de la fuente y solo mide la altura y el radio del recipiente inferior.`,
    pregunta: "De las medidas halladas por el organizador para estimar la capacidad total de la fuente, es verdadero afirmar que:",
    opciones: {
      A: "no son suficientes, pues falta conocer el peso del chocolate y la resistencia que tiene el material de los recipientes.",
      B: "son suficientes, pues si se llenan los otros recipientes, el chocolate se saldrá de la fuente cuando esta comience a operar.",
      C: "no son suficientes, pues no toman en cuenta la capacidad de los otros recipientes y el chocolate del tubo de circulación.",
      D: "son suficientes, pues el recipiente más bajo es el que recibe el chocolate que se vierte de los otros dos.",
    },
    respuesta: "C",
    justificacion: "Para calcular la capacidad total de la fuente se necesita el volumen de los tres recipientes cilíndricos más el volumen del tubo de circulación. El volumen de un cilindro depende de su radio y su altura (V = π × r² × h). Como los tres recipientes tienen dimensiones diferentes entre sí, conocer solo el radio y la altura del recipiente inferior es insuficiente. La opción D es incorrecta porque, aunque el recipiente inferior recibe el chocolate desbordado, su capacidad no equivale al volumen total de la fuente cuando todos los niveles están en funcionamiento.",
  },
      {
    id: "MAT-075",
    materia: "Matemáticas",
    competencia: "Interpretación",
    dificultad: 1,
    imagen: {
      src: "assets/img/mat-tabla-sismos.png",
      alt: "Tabla de sismos registrados en el planeta durante la primera década del siglo XXI. Filas: magnitudes 5.0–5.9, 6.0–6.9, 7.0–7.9 y 8.0–8.9. Columnas: años 2001 a 2010, total por magnitud y total por año. Totales por magnitud: 16.165 / 1.459 / 143 / 12. Total general: 36.919 sismos.",
      caption: "Tabla 1. Total de sismos registrados en el planeta durante la primera década del siglo XXI, distribuidos por magnitud y año.",
    },
    contexto: `La tabla muestra el total de sismos registrados en el planeta durante la primera década del siglo XXI y la distribución de aquellos con magnitud mayor a 5,0. Un sismólogo afirma que en cualquier año era más probable que hubiese sismos de baja que de alta magnitud. Se pide identificar cuál de las relaciones descritas en las opciones justifica esa opinión según el registro histórico.`,
    pregunta: "Según el registro histórico, la relación que justifica la opinión del sismólogo es:",
    opciones: {
      A: "A mayor magnitud, mayor cantidad de sismos.",
      B: "A mayor magnitud, menor cantidad de sismos.",
      C: "A mayor cantidad de sismos, menor magnitud de estos.",
      D: "A mayor cantidad de sismos, mayor magnitud de estos.",
    },
    respuesta: "B",
    justificacion: "Al revisar los totales por magnitud en la tabla, se observa una relación inversamente proporcional clara: cuanto mayor es la magnitud, menor es la cantidad de sismos registrados (magnitud 5.0–5.9: 16.165 sismos; 6.0–6.9: 1.459; 7.0–7.9: 143; 8.0–8.9: solo 12). Esta relación directa entre mayor magnitud y menor frecuencia es exactamente lo que enuncia la opción B, y justifica que los sismos de baja magnitud sean estadísticamente más probables. La opción C expresa la relación en sentido inverso (desde la cantidad hacia la magnitud), por lo que aunque es conceptualmente equivalente, no corresponde a la dirección lógica de la afirmación del sismólogo.",
  },
];