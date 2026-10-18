import type { ResumeLayout } from "./types";
import type { SampleSection } from "./sample-content";

function ExpressiveSampleSection(
  id: string,
  title: string,
  blocks: SampleSection["blocks"],
): SampleSection {
  return { id, title, blocks };
}

function ExpressiveSampleIdentity(role: string): SampleSection {
  return ExpressiveSampleSection("identity", "", [
    ["heading", "Alex Morgan"],
    ["subtitle", role],
    ["meta", "Paris, France · alex@example.com · alexmorgan.design"],
  ]);
}

function ExpressiveSampleSupport(
  skills: string,
  degree: string,
  detail: string,
): SampleSection[] {
  return [
    ExpressiveSampleSection("education", "Formation", [
      ["subtitle", degree],
      ["meta", "Gobelins, Paris · 2018 — 2020"],
      ["text", detail],
    ]),
    ExpressiveSampleSection("skills", "Compétences", [["text", skills]]),
    ExpressiveSampleSection("languages", "Langues", [
      ["text", "Français — langue maternelle\nAnglais — professionnel"],
    ]),
  ];
}

/** Five fictional profiles authored for the compositions; no personal CV data. */
export function expressiveSampleSections(
  layout: ResumeLayout,
): SampleSection[] | undefined {
  if (layout === "risograph")
    return [
      ExpressiveSampleIdentity("Designer graphique & direction artistique"),
      ExpressiveSampleSection("profile", "À propos", [
        [
          "text",
          "Je conçois des identités qui vivent aussi bien sur une page que dans une rue. Mon approche associe typographie expressive, sens de la composition et attention aux usages : des systèmes généreux, pensés pour durer.",
        ],
      ]),
      ExpressiveSampleSection("experience", "Parcours", [
        ["subtitle", "Directeur artistique · Indépendant"],
        ["meta", "2022 — Aujourd’hui / Paris"],
        [
          "bullet",
          "Accompagner des lieux culturels de la recherche visuelle à la production : identités, affiches, éditions et sites éditoriaux.",
        ],
        [
          "bullet",
          "Définir les systèmes typographiques et les règles de composition ; préparer les fichiers avec les ateliers d’impression.",
        ],
        ["subtitle", "Designer graphique · Studio de création"],
        ["meta", "2020 — 2022 / Lyon"],
        [
          "bullet",
          "Créer des programmes de saison et des campagnes pour des associations, en collaboration avec rédacteurs et photographes.",
        ],
        [
          "bullet",
          "Décliner chaque identité sur des formats imprimés et numériques en conservant son caractère et sa lisibilité.",
        ],
      ]),
      ExpressiveSampleSection("projects", "Projets choisis", [
        ["subtitle", "La ville en lecture"],
        ["meta", "2025 / Édition & signalétique"],
        [
          "text",
          "Une collection de livrets et un parcours d’affiches pour une bibliothèque de quartier. Trames bicolores, lettrages et cartographie sensible.",
        ],
        ["subtitle", "Matières communes"],
        ["meta", "2024 / Identité culturelle"],
        [
          "text",
          "Un langage modulaire pour des ateliers d’artisanat : formes découpées, palette courte et gabarits faciles à réutiliser.",
        ],
      ]),
      ...ExpressiveSampleSupport(
        "Direction artistique\nTypographie & édition\nIdentité visuelle\nPrépresse & sérigraphie\nFigma · HTML · CSS",
        "Diplôme de design graphique",
        "Édition, composition typographique et narration visuelle.",
      ),
    ];

  if (layout === "swiss")
    return [
      ExpressiveSampleIdentity("Design de systèmes & interfaces"),
      ExpressiveSampleSection("profile", "Positionnement", [
        [
          "text",
          "Rendre les systèmes complexes évidents. Je relie architecture de l’information, typographie et code pour créer des interfaces précises, accessibles et suffisamment souples pour évoluer.",
        ],
      ]),
      ExpressiveSampleSection("experience", "Expérience", [
        ["subtitle", "Lead designer · Services numériques"],
        ["meta", "2022 — Aujourd’hui / Paris"],
        [
          "bullet",
          "Structurer un système d’interface commun aux outils de gestion et aux parcours publics d’une association nationale.",
        ],
        [
          "bullet",
          "Concevoir avec les développeurs les composants, leurs états et les règles de navigation au clavier.",
        ],
        ["subtitle", "Designer produit · Studio indépendant"],
        ["meta", "2020 — 2022 / Lausanne"],
        [
          "bullet",
          "Transformer les entretiens et les audits de contenu en architectures de service et prototypes testables.",
        ],
        [
          "bullet",
          "Documenter les décisions typographiques et les comportements responsifs pour accompagner la production.",
        ],
      ]),
      ExpressiveSampleSection("projects", "Travaux sélectionnés", [
        ["subtitle", "Un langage commun"],
        ["meta", "2025 / Design system"],
        [
          "text",
          "Tokens, composants et documentation pour un portail de services. Une grille stable et des états explicites remplacent les exceptions accumulées.",
        ],
        ["subtitle", "Lire la donnée"],
        ["meta", "2024 / Interface éditoriale"],
        [
          "text",
          "Un observatoire public pensé autour des questions des lecteurs : tableaux accessibles, filtres simples et annotations contextuelles.",
        ],
      ]),
      ...ExpressiveSampleSupport(
        "Systèmes de design\nArchitecture de l’information\nTypographie · Grilles\nTypeScript · React\nAccessibilité",
        "MA, design interactif",
        "Systèmes visuels, prototypage et conception centrée sur les usages.",
      ),
    ];

  if (layout === "botanica")
    return [
      ExpressiveSampleIdentity("Designer de services & expériences durables"),
      ExpressiveSampleSection("profile", "Approche", [
        [
          "text",
          "J’aide les organisations à prendre soin de leurs publics. J’observe les usages, rends les idées tangibles et dessine des services sobres, accueillants et cohérents, du premier contact aux petits gestes du quotidien.",
        ],
      ]),
      ExpressiveSampleSection("experience", "Expérience", [
        ["subtitle", "Designer de services · Indépendant"],
        ["meta", "2022 — Aujourd’hui / Paris"],
        [
          "bullet",
          "Accompagner des associations et collectivités : enquêtes de terrain, parcours de service et prototypes à tester avec les équipes.",
        ],
        [
          "bullet",
          "Animer des ateliers de co-conception et traduire les résultats en outils simples à maintenir.",
        ],
        ["subtitle", "Designer UX · Studio de design"],
        ["meta", "2020 — 2022 / Nantes"],
        [
          "bullet",
          "Repenser l’accueil et l’inscription à des services de proximité, en associant usagers et personnels d’accueil.",
        ],
        [
          "bullet",
          "Réaliser des interfaces accessibles et des guides de contenu pour rapprocher le service physique et numérique.",
        ],
      ]),
      ExpressiveSampleSection("projects", "Projets", [
        ["subtitle", "Le jardin partagé"],
        ["meta", "2025 / Service de proximité"],
        [
          "text",
          "Un parcours d’accueil, un calendrier lisible et des supports communs pour faciliter la participation à un jardin associatif.",
        ],
        ["subtitle", "Réparer ensemble"],
        ["meta", "2024 / Recherche & prototypage"],
        [
          "text",
          "Des ateliers de terrain au prototype de réservation : rendre les permanences de réparation plus faciles à découvrir et à organiser.",
        ],
      ]),
      ...ExpressiveSampleSupport(
        "Recherche qualitative\nDesign de services\nFacilitation\nPrototypage\nAccessibilité & sobriété",
        "MA, design interactif",
        "Recherche de terrain, design participatif et conception de services.",
      ),
    ];

  if (layout === "cassette")
    return [
      ExpressiveSampleIdentity("Designer créatif · image, son & interaction"),
      ExpressiveSampleSection("profile", "En bref", [
        [
          "text",
          "Je donne une forme visuelle aux idées qui s’écoutent. Identités culturelles, éditions et expériences numériques : mon travail associe rythme graphique, fabrication soignée et curiosité pour les nouveaux outils.",
        ],
      ]),
      ExpressiveSampleSection("experience", "Expérience", [
        ["subtitle", "Designer créatif · Indépendant"],
        ["meta", "2022 — Aujourd’hui / Paris"],
        [
          "bullet",
          "Concevoir des identités et campagnes pour des concerts, ateliers et publications indépendantes, du concept à la livraison.",
        ],
        [
          "bullet",
          "Développer des visuels génératifs et des prototypes interactifs avec des fichiers de production réutilisables.",
        ],
        ["subtitle", "Designer digital · Studio de création"],
        ["meta", "2020 — 2022 / Bordeaux"],
        [
          "bullet",
          "Créer des sites éditoriaux et des supports de communication en lien avec les équipes de programmation culturelle.",
        ],
        [
          "bullet",
          "Préparer les déclinaisons web et imprimées, puis suivre la fabrication avec les prestataires.",
        ],
      ]),
      ExpressiveSampleSection("projects", "Sélection", [
        ["subtitle", "Fréquences locales"],
        ["meta", "2025 / Identité & web"],
        [
          "text",
          "Une collection de formes issues du son pour les affiches, programmes et archives d’une série d’écoutes publiques.",
        ],
        ["subtitle", "Les nuits en papier"],
        ["meta", "2024 / Édition indépendante"],
        [
          "text",
          "Un fanzine consacré aux cultures nocturnes : direction artistique, composition et préparation d’une édition bicolore.",
        ],
      ]),
      ...ExpressiveSampleSupport(
        "Identité & édition\nCreative coding\nSVG · TypeScript\nDesign interactif\nPréparation à l’impression",
        "Diplôme de design graphique",
        "Narration visuelle, création numérique et expérimentation éditoriale.",
      ),
    ];

  if (layout === "signal")
    return [
      ExpressiveSampleIdentity("Creative developer & artiste visuel"),
      ExpressiveSampleSection("profile", "Pratique", [
        [
          "text",
          "J’explore la rencontre entre systèmes visuels et outils numériques. Je transforme une règle, un jeu de données ou un récit en une expérience expressive, avec des interfaces claires et un code que l’on peut faire évoluer.",
        ],
      ]),
      ExpressiveSampleSection("experience", "Expérience", [
        ["subtitle", "Creative developer · Indépendant"],
        ["meta", "2022 — Aujourd’hui / Paris"],
        [
          "bullet",
          "Concevoir et développer des sites culturels et des systèmes graphiques génératifs, du prototype à la mise en production.",
        ],
        [
          "bullet",
          "Collaborer avec designers et commissaires d’exposition pour traduire un propos en interactions accessibles.",
        ],
        ["subtitle", "Développeur front-end · Studio digital"],
        ["meta", "2020 — 2022 / Remote"],
        [
          "bullet",
          "Créer des interfaces éditoriales en React et des outils de composition pour les équipes de contenu.",
        ],
        [
          "bullet",
          "Soigner la navigation au clavier, les comportements responsifs et la qualité des rendus sur différents écrans.",
        ],
      ]),
      ExpressiveSampleSection("projects", "Explorations", [
        ["subtitle", "Herbier algorithmique"],
        ["meta", "2025 / Code & édition"],
        [
          "text",
          "Une famille de formes déterministes produites en SVG, réunies dans un outil de composition et un catalogue imprimable.",
        ],
        ["subtitle", "Atlas des gestes"],
        ["meta", "2024 / Archive interactive"],
        [
          "text",
          "Une navigation sensible dans des témoignages d’artisans, structurée par matières, techniques et récits plutôt que par catégories figées.",
        ],
      ]),
      ...ExpressiveSampleSupport(
        "TypeScript · React\nSVG génératif\nSystèmes visuels\nInteraction & accessibilité\nHTML · CSS",
        "MA, design interactif",
        "Design par le code, prototypage et recherche visuelle.",
      ),
    ];
  return undefined;
}
