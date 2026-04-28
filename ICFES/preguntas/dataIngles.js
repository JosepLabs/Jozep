export const PREGUNTAS_INGLES = [
  // --------------------------------------------------
  // EXAMEN 1
  // --------------------------------------------------
  {
    id: "ING-001",
    materia: "Inglés",
    competencia: "Lexical / Vocabulario (A1) — Relacionar definiciones",
    tipoPregunta: "relacionar",
    dificultad: 1,
    contexto: "Clothes and accesories. Match each description (1-5) with the correct word (A-H). There are extra words you will not use.",
    definiciones: [
      { numero: 1, texto: "A person can carry things in one of these." },
      { numero: 2, texto: "You wear this when you go to bed." },
      { numero: 3, texto: "You cover your neck with this." },
      { numero: 4, texto: "Some people need them to see well." },
      { numero: 5, texto: "These are for your feet." }
    ],
    opciones: {
      A: "glasses",
      B: "handbags",
      C: "hat",
      D: "pajamas",
      E: "scarf",
      F: "skirt",
      G: "socks",
      H: "watch"
    },
    respuestasCorrectas: {
      1: "B",
      2: "D",
      3: "E",
      4: "A",
      5: "G"
    },
    pregunta: "Match all five descriptions with the correct word from the list (A-G).",
    justificacion: "Correct matches: 1→B (handbags: used to carry things), 2→D (pajamas: worn to bed), 3→E (scarf: covers the neck), 4→A (glasses: needed to see well), 5→G (socks: worn on feet). Distractors: C (hat), F (skirt)."
  },
  {
    id: "ING-006",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (Pre A1)",
    tipoPregunta: "aviso",
    dificultad: 1,
    contexto: "Draw a line to complete the snake and color it",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "on a rug",
      B: "on a test",
      C: "on a bookcase"
    },
    respuesta: "B",
    justificacion: "The instruction asks the reader to draw and color, which is a common task in an educational setting like a school test or worksheet."
  },
  {
    id: "ING-007",
    materia: "Inglés",
    competencia: "Comunicativa / Conversaciones (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "Complete the conversation.",
    pregunta: "Grandma, shall I hold those bags for you?",
    opciones: {
      A: "I'm not afraid!",
      B: "Where are you?",
      C: "That's fine."
    },
    respuesta: "C",
    justificacion: "'That's fine' is a polite way to accept the offer of help."
  },
  {
    id: "ING-008",
    materia: "Inglés",
    competencia: "Comunicativa / Conversaciones (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "Complete the conversation.",
    pregunta: "How much is that umbrella?",
    opciones: {
      A: "Anything else?",
      B: "50 dollars.",
      C: "Cash only!"
    },
    respuesta: "B",
    justificacion: "The question asks for a price ('How much'), and '50 dollars' directly answers it."
  },
  {
    id: "ING-009",
    materia: "Inglés",
    competencia: "Gramática / Completar textos (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "assets/img/coffee.png \nCOFFEE\nCoffee is popular around the world. Over the past centuries, few subjects have been as carefully studied as coffee.",
    pregunta: "Its (9) ___ important component is caffeine and it has lots of benefits.",
    opciones: {
      A: "much",
      B: "more",
      C: "most"
    },
    respuesta: "C",
    justificacion: "The superlative 'most' is required here to express that caffeine is the absolute most important component."
  },
  {
    id: "ING-010",
    materia: "Inglés",
    competencia: "Gramática / Completar textos (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "Coffee has been well-known (10) ___",
    opciones: {
      A: "during",
      B: "until",
      C: "since"
    },
    respuesta: "C",
    justificacion: "The present perfect tense 'has been' paired with a point in time requires the preposition 'since'."
  },
  {
    id: "ING-011",
    materia: "Inglés",
    competencia: "Gramática / Completar textos (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "(11) ___ the beginning of the 14th century, Sufi Yemenis started using coffee...",
    opciones: {
      A: "when",
      B: "which",
      C: "who"
    },
    respuesta: "A",
    justificacion: "The clause introduces a time phrase, making the relative adverb 'when' the correct choice."
  },
  {
    id: "ING-012",
    materia: "Inglés",
    competencia: "Gramática / Vocabulario (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "It became a popular medicine (12) ___ Europeans in the 1600s.",
    opciones: {
      A: "among",
      B: "about",
      C: "along"
    },
    respuesta: "A",
    justificacion: "'Among' is used to show a relationship involving a group, in this case, the European population."
  },
  {
    id: "ING-013",
    materia: "Inglés",
    competencia: "Gramática / Pasiva (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "Caffeine was first (13) ___ in the 1800s by Ferdinand Runge...",
    opciones: {
      A: "describe",
      B: "described",
      C: "describes"
    },
    respuesta: "B",
    justificacion: "This is a passive voice construction ('was' + past participle). The past participle of 'describe' is 'described'."
  },
  {
    id: "ING-014",
    materia: "Inglés",
    competencia: "Gramática / Gerundio (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "Some people say (14) ___ coffee isn't good...",
    opciones: {
      A: "drink",
      B: "drinking",
      C: "drunk"
    },
    respuesta: "B",
    justificacion: "The verb 'drink' functions here as the subject of the subordinate clause, so it must be in the gerund form 'drinking'."
  },
  {
    id: "ING-015",
    materia: "Inglés",
    competencia: "Gramática / Modales (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "...but doctors say you (15) ___ believe this.",
    opciones: {
      A: "mustn't",
      B: "couldn't",
      C: "wouldn't"
    },
    respuesta: "A",
    justificacion: "'Mustn't' expresses a strong recommendation or prohibition, fitting the context that doctors advise against believing coffee is bad."
  },
  {
    id: "ING-016",
    materia: "Inglés",
    competencia: "Gramática / Conectores (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/coffee.png \nCOFFEE text.",
    pregunta: "(16) ___ many people believe coffee is bad, studies show it is good for your heart.",
    opciones: {
      A: "While",
      B: "Except",
      C: "Because"
    },
    respuesta: "A",
    justificacion: "The sentence contrasts two ideas. 'While' acts as a concessive conjunction introducing the contrasting belief."
  },
  {
    id: "ING-017",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nHe abandoned the military profession in 1957 after the publication of his first novel... but during the sixties and seventies, he worked in film making.",
    pregunta: "James Salter played an important part in the making of movies",
    opciones: {
      A: "from 1960 to 1979.",
      B: "in 1957.",
      C: "after 1997."
    },
    respuesta: "A",
    justificacion: "The text specifies he worked in filmmaking 'during the sixties and seventies' (1960s-1970s)."
  },
  {
    id: "ING-018",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nBurning the Days, a short story published in The New Yorker in 1997... was adapted into a film called Passionate Falsehoods.",
    pregunta: "Passionate Falsehoods is",
    opciones: {
      A: "a newspaper.",
      B: "a play.",
      C: "a movie."
    },
    respuesta: "C",
    justificacion: "The text literally states that the short story was adapted into a 'film called Passionate Falsehoods'."
  },
  {
    id: "ING-019",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nSalter's time in the film world is both good and bad.",
    pregunta: "Salter had nice and difficult times when he was",
    opciones: {
      A: "an actor.",
      B: "making movies.",
      C: "in a different city."
    },
    respuesta: "B",
    justificacion: "The phrase 'time in the film world' means his time making movies, which the text describes as 'both good and bad' (nice and difficult)."
  },
  {
    id: "ING-020",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nNick Paumgarten in The Last Book, describes Salter's opinion about his film career.",
    pregunta: "The Last Book was written by",
    opciones: {
      A: "James Salter.",
      B: "Deborah Treisman.",
      C: "Nick Paumgarten."
    },
    respuesta: "C",
    justificacion: "The text points to 'Nick Paumgarten in The Last Book', establishing his authorship."
  },
  {
    id: "ING-021",
    materia: "Inglés",
    competencia: "Lectura Inferencial (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nSalter thought he was wasting his time.",
    pregunta: "James Salter thinks that his work in the cinema business was",
    opciones: {
      A: "not useful.",
      B: "not hard.",
      C: "not usual."
    },
    respuesta: "A",
    justificacion: "Wasting time infers that the time spent was unproductive or 'not useful'."
  },
  {
    id: "ING-022",
    materia: "Inglés",
    competencia: "Lectura Inferencial (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nPerhaps he wasted his time in a larger artistic way, but it still makes for attractive reading.",
    pregunta: "Reading about James Salter’s years in the cinema could be",
    opciones: {
      A: "clever enough.",
      B: "just fair.",
      C: "quite interesting."
    },
    respuesta: "C",
    justificacion: "'Attractive reading' is synonymous with being 'quite interesting'."
  },
  {
    id: "ING-023",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "JAMES SALTER'S DAYS IN FILM\nThe Last Book is available to everyone in online stores.",
    pregunta: "The Last Book can be found",
    opciones: {
      A: "in museums.",
      B: "at a café.",
      C: "on the web."
    },
    respuesta: "C",
    justificacion: "Available in 'online stores' means it can be found 'on the web'."
  },
  {
    id: "ING-024",
    materia: "Inglés",
    competencia: "Lectura Literal (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "SWIFT PIZZA AND SANDWICH HOUSE\nToday we have the pleasure of showing you the best letter written by our customer Mark. He wins £25 for writing about us this week.",
    pregunta: "According to the text, the customer",
    opciones: {
      A: "left a £25 tip to the waiters who work there.",
      B: "celebrated Christmas and New Year at this restaurant.",
      C: "found this great restaurant after many attempts.",
      D: "posted an excellent review about this restaurant."
    },
    respuesta: "D",
    justificacion: "Mark wrote a very positive letter/review that was featured by the restaurant, which aligns with posting an excellent review."
  },
  {
    id: "ING-025",
    materia: "Inglés",
    competencia: "Lectura Inferencial (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "SWIFT PIZZA AND SANDWICH HOUSE\nI recently had a sad experience with my usual take away restaurant, so I decided to change to something else...",
    pregunta: "It can be inferred from the text that Mark",
    opciones: {
      A: "does not like cooking food for himself.",
      B: "almost always eats hamburgers.",
      C: "enjoys eating fast food sometimes.",
      D: "is tired of going to restaurants."
    },
    respuesta: "C",
    justificacion: "He mentions having a 'usual take away restaurant' and ordering a burger and sandwich, inferring a regular enjoyment or habit of eating fast food."
  },
  {
    id: "ING-026",
    materia: "Inglés",
    competencia: "Nivel A1 — Relacionar definiciones",
    tipoPregunta: "relacionar",
    dificultad: 1,
    contexto: "Transportation. Match each description (1–3) with the correct word (A–G). There are extra words you will NOT use.",
    definiciones: [
      { numero: 1, texto: "You often learn to ride it when you are a child." },
      { numero: 2, texto: "People pay to take this public transport by road." },
      { numero: 3, texto: "Many people fly on it to go to a place." }
    ],
    opciones: {
      A: "ambulance",
      B: "boat",
      C: "bike",
      D: "bus",
      E: "motorbike",
      F: "plane",
      G: "train"
    },
    respuestasCorrectas: {
      1: "C",
      2: "D",
      3: "F"
    },
    pregunta: "Match the three descriptions with the correct word from the list (A–G). There are four extra distractors.",
    justificacion: "Correct matches: 1→C (bike: often learned in childhood), 2→D (bus: paid public road transport), 3→F (plane: used for flying). Distractors: A (ambulance), B (boat), E (motorbike), G (train)."
  },
  {
    id: "ING-027",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (B1 - B2)",
    tipoPregunta: "aviso",
    dificultad: 3,
    contexto: "Unauthorized personnel beyond this point. Compliance with sterilization protocols is mandatory.",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "In a shopping mall",
      B: "In a surgical ward",
      C: "In a laundry room"
    },
    respuesta: "B",
    justificacion: "The use of 'sterilization protocols' and 'unauthorized personnel' indicates a highly controlled medical or scientific environment, specifically a surgical ward where hygiene is critical."
  },
  {
    id: "ING-028",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (B1 - B2)",
    tipoPregunta: "aviso",
    dificultad: 3,
    contexto: "Patrons are reminded that the consumption of outside provisions is strictly prohibited within these premises.",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "In a public park",
      B: "In a restaurant",
      C: "In a grocery store"
    },
    respuesta: "B",
    justificacion: "The term 'patrons' refers to customers, and 'outside provisions' is a formal way to say food or drinks brought from elsewhere, a common policy in restaurants."
  },
  {
    id: "ING-029",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (Pre A1)",
    tipoPregunta: "aviso",
    dificultad: 1,
    contexto: "How do I drive? Phone: 0152067",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "on a plane",
      B: "on a bus",
      C: "on a boat"
    },
    respuesta: "B",
    justificacion: "This sign is commonly placed on commercial or public road vehicles, like buses, to report driver behavior."
  },
  {
    id: "ING-030",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (Pre A1)",
    tipoPregunta: "aviso",
    dificultad: 1,
    contexto: "New Toys: Green monsters, angry dolls, and black helicopters",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "in a house",
      B: "in a shop",
      C: "in a zoo"
    },
    respuesta: "B",
    justificacion: "A sign advertising 'New Toys' for sale is found in a commercial shop."
  },
  {
    id: "ING-031",
    materia: "Inglés",
    competencia: "Pragmática / Avisos (Pre A1)",
    tipoPregunta: "aviso",
    dificultad: 1,
    contexto: "Please, take the one you want to read",
    pregunta: "¿Dónde puede ver este aviso?",
    opciones: {
      A: "on a stool",
      B: "on a computer",
      C: "on a bookshelf"
    },
    respuesta: "C",
    justificacion: "A bookshelf holds reading materials, so it is the logical place for a sign encouraging you to take one to read."
  },
  {
    id: "ING-032",
    materia: "Inglés",
    competencia: "Comunicativa / Conversaciones (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "Complete the conversation.",
    pregunta: "I can’t eat a cold sandwich. It is horrible!",
    opciones: {
      A: "I hope so.",
      B: "I agree.",
      C: "I am not."
    },
    respuesta: "B",
    justificacion: "'I agree' validates the speaker's statement about not liking the cold sandwich."
  },
  {
    id: "ING-033",
    materia: "Inglés",
    competencia: "Comunicativa / Conversaciones (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "Complete the conversation.",
    pregunta: "I am going on vacation to Vancouver!",
    opciones: {
      A: "That’s great!",
      B: "I like swimming!",
      C: "You are first!"
    },
    respuesta: "A",
    justificacion: "'That's great!' is the appropriate enthusiastic response to someone announcing an exciting trip."
  },
  {
    id: "ING-034",
    materia: "Inglés",
    competencia: "Comunicativa / Conversaciones (A1)",
    tipoPregunta: "estandar",
    dificultad: 1,
    contexto: "Complete the conversation.",
    pregunta: "It rained a lot last night!",
    opciones: {
      A: "Did you accept?",
      B: "Did you understand?",
      C: "Did you sleep?"
    },
    respuesta: "C",
    justificacion: "Heavy rain can cause noise, making 'Did you sleep?' a logical follow-up question."
  },
  {
    id: "ING-035",
    materia: "Inglés",
    competencia: "Gramática / Completar textos (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/wolf.png \nTHE ETHIOPIAN WOLF.",
    pregunta: "Some scientists have (10) ___ it is not a real wolf.",
    opciones: {
      A: "saying",
      B: "said",
      C: "say"
    },
    respuesta: "B",
    justificacion: "The auxiliary 'have' requires the past participle form of the verb, which is 'said'."
  },
  {
    id: "ING-036",
    materia: "Inglés",
    competencia: "Gramática / Posesivos (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/wolf.png \nTHE ETHIOPIAN WOLF.",
    pregunta: "But studies show that (11) ___ close relationship to grey wolves and coyotes is evident.",
    opciones: {
      A: "its",
      B: "his",
      C: "your"
    },
    respuesta: "A",
    justificacion: "The pronoun refers to an animal (the wolf), so the correct possessive adjective is 'its'."
  },
  {
    id: "ING-037",
    materia: "Inglés",
    competencia: "Gramática / Demostrativos (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/wolf.png \nTHE ETHIOPIAN WOLF.",
    pregunta: "(12) ___ Ethiopian wolves are more similar to grey wolves...",
    opciones: {
      A: "This",
      B: "That",
      C: "These"
    },
    respuesta: "C",
    justificacion: "'Wolves' is plural, requiring the plural demonstrative adjective 'These'."
  },
  {
    id: "ING-038",
    materia: "Inglés",
    competencia: "Gramática / Adjetivos (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/wolf.png \nTHE ETHIOPIAN WOLF.",
    pregunta: "The (13) ___ group of Ethiopian wolves lives...",
    opciones: {
      A: "larger",
      B: "largest",
      C: "large"
    },
    respuesta: "B",
    justificacion: "The definite article 'The' preceding the adjective requires the superlative form 'largest'."
  },
  {
    id: "ING-039",
    materia: "Inglés",
    competencia: "Gramática / Preposiciones (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/wolf.png \nTHE ETHIOPIAN WOLF.",
    pregunta: "...lives (14) ___ the Bale Mountains National Park.",
    opciones: {
      A: "in",
      B: "along",
      C: "on"
    },
    respuesta: "A",
    justificacion: "For enclosed or bounded geographical areas like national parks, the preposition 'in' is used."
  },
  {
    id: "ING-040",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/palette.png \nMY ARTISTIC ADVENTURE\nOne morning, I found a Spanish television show with a French man who was painting...",
    pregunta: "Where was the painter from?",
    opciones: {
      A: "Ireland",
      B: "Spain",
      C: "France"
    },
    respuesta: "C",
    justificacion: "The text describes him as 'a French man'."
  },
  {
    id: "ING-041",
    materia: "Inglés",
    competencia: "Lectura Inferencial (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/palette.png \nMY ARTISTIC ADVENTURE\n...he quickly made trees and rivers, simply by moving his hand across the canvas. He made it look simple and easy...",
    pregunta: "She was mostly excited by the",
    opciones: {
      A: "painter’s ability.",
      B: "painter’s voice.",
      C: "painter’s show."
    },
    respuesta: "A",
    justificacion: "She admired how easily he painted trees and rivers with simple hand movements, representing his skill/ability."
  },
  {
    id: "ING-042",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/palette.png \nMY ARTISTIC ADVENTURE\nEvery Sunday morning, I would try to paint what he was painting on the screen...",
    pregunta: "How often did she watch the show?",
    opciones: {
      A: "three times a week",
      B: "once a week",
      C: "twice a week"
    },
    respuesta: "B",
    justificacion: "'Every Sunday morning' equates to once a week."
  },
  {
    id: "ING-043",
    materia: "Inglés",
    competencia: "Lectura Literal (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/palette.png \nMY ARTISTIC ADVENTURE\nI could not buy oil paints; I was only seven, and my parents would not buy them for me.",
    pregunta: "She could not get oil paints because she",
    opciones: {
      A: "didn’t speak Spanish.",
      B: "was too young.",
      C: "always watched TV."
    },
    respuesta: "B",
    justificacion: "She states she 'was only seven' (too young) to buy them herself."
  },
  {
    id: "ING-044",
    materia: "Inglés",
    competencia: "Lectura Inferencial (A2)",
    tipoPregunta: "estandar",
    dificultad: 2,
    contexto: "assets/img/palette.png \nMY ARTISTIC ADVENTURE\nAfter my mum saw what I did with her things, I was told I could not paint again.",
    pregunta: "Stopping painting was",
    opciones: {
      A: "the painter’s idea.",
      B: "her mother’s order.",
      C: "her own decision."
    },
    respuesta: "B",
    justificacion: "'I was told I could not paint again' by her mum implies it was her mother's strict order."
  },
  {
    id: "ING-045",
    materia: "Inglés",
    competencia: "Lectura Crítica / Propósito (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "assets/img/hammock.png \nJONATHAN'S TRIP TO COLOMBIA\nI graduate next year and I can't wait to return to this beautiful country. Some of you reading this may feel inspired to do the same.",
    pregunta: "What is the writer trying to do in this artide?",
    opciones: {
      A: "encouraging tourists to visit Colombia.",
      B: "convincing people to buy a Colombian coffee farm.",
      C: "telling readers to run a coffee business in Colombia.",
      D: "inviting tourists to write about places they visit in Colombia."
    },
    respuesta: "A",
    justificacion: "He highlights the beauty of the country and states readers might feel 'inspired to do the same' (visit), pointing to an encouraging purpose."
  },
  {
    id: "ING-046",
    materia: "Inglés",
    competencia: "Lectura Literal (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "assets/img/hammock.png \nJONATHAN'S TRIP TO COLOMBIA\nThe family business has guests at the house for just $45.000 a night. This indudes three home-cooked meals a day, a swimming pod...",
    pregunta: "What can a reader find out from this text?",
    opciones: {
      A: "how to grow coffee on the farm.",
      B: "when the best time to visit the farm is.",
      C: "what the accommodation price includes.",
      D: "which activities tourists prefer to do at the farm."
    },
    respuesta: "A", // Note: The official ICFES table states answer is A for Q21 Examen 2, strictly following the prompt's instruction to base answers strictly on the table.
    justificacion: "Based strictly on the official answer table, the correct answer is marked as A."
  },
  {
    id: "ING-047",
    materia: "Inglés",
    competencia: "Gramática / Completar textos (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "VALENTINE'S DAY\nIt's always a lot of fun to get a card or some chocolates...",
    pregunta: "...but (22) ___ do we do this?",
    opciones: {
      A: "where",
      B: "why",
      C: "when",
      D: "what"
    },
    respuesta: "B",
    justificacion: "The paragraph proceeds to explain the origins and reasons for the celebration, making 'why' the correct interrogative word."
  },
  {
    id: "ING-048",
    materia: "Inglés",
    competencia: "Gramática / Vocabulario (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "VALENTINE'S DAY",
    pregunta: "One of the (23) ___ says that the original Valentine was a priest.",
    opciones: {
      A: "essays",
      B: "stories",
      C: "reports",
      D: "letters"
    },
    respuesta: "B",
    justificacion: "Legends and myths are generally referred to as 'stories', fitting the historical and mysterious context."
  },
  {
    id: "ING-049",
    materia: "Inglés",
    competencia: "Gramática / Phrasal Verbs (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "VALENTINE'S DAY\nHowever, Valentine continued to hold weddings for a lot of young couples in secret.",
    pregunta: "When the King found (24) ___, he ordered soldiers to kill Valentine!",
    opciones: {
      A: "off",
      B: "in",
      C: "at",
      D: "out"
    },
    respuesta: "D",
    justificacion: "The phrasal verb 'find out' means to discover information, which is what the King did."
  },
  {
    id: "ING-050",
    materia: "Inglés",
    competencia: "Gramática / Adverbios (B1)",
    tipoPregunta: "estandar",
    dificultad: 3,
    contexto: "VALENTINE'S DAY",
    pregunta: "Women buy (25) ___ 90% of the cards...",
    opciones: {
      A: "almost",
      B: "only",
      C: "hardly",
      D: "just"
    },
    respuesta: "A",
    justificacion: "The adverb 'almost' is used before a percentage to show it is very close to that number."
  }
];