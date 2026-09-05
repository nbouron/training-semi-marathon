import type { Diet, MealMoment, Recipe } from '../../types';

interface DietFlags {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  lactoseFree?: boolean;
}

function diets(flags: DietFlags): Diet[] {
  const list: Diet[] = [];
  if (flags.vegetarian || flags.vegan) list.push('vegetarien');
  if (flags.vegan) list.push('vegan');
  if (flags.glutenFree) list.push('sans_gluten');
  if (flags.lactoseFree || flags.vegan) list.push('sans_lactose');
  return list;
}

interface Draft {
  name: string;
  moment: MealMoment;
  flags: DietFlags;
  prepTimeMin: number;
  ingredients: string[];
  steps: string[];
  whyAdapted: string;
  highCarb: boolean;
  allergens?: string[];
}

function recipe(id: string, d: Draft): Recipe {
  return {
    id,
    name: d.name,
    moment: d.moment,
    compatibleDiets: diets(d.flags),
    prepTimeMin: d.prepTimeMin,
    ingredients: d.ingredients,
    steps: d.steps,
    whyAdapted: d.whyAdapted,
    highCarb: d.highCarb,
    containsAllergensKeywords: d.allergens ?? [],
  };
}

export const RECIPES: Recipe[] = [
  // ---- Petit-déjeuner ----
  recipe('pdj-porridge-banane', {
    name: "Porridge flocons d'avoine, banane, miel",
    moment: 'petit_dejeuner',
    flags: { vegetarian: true, glutenFree: true, lactoseFree: true },
    prepTimeMin: 8,
    ingredients: [
      "60 g de flocons d'avoine sans gluten",
      '250 ml de boisson végétale (avoine ou amande)',
      '1 banane',
      '1 cuillère à café de miel',
      'Une pincée de cannelle',
    ],
    steps: [
      "Faire chauffer la boisson végétale, verser les flocons d'avoine et cuire 4-5 min en remuant.",
      'Couper la banane en rondelles, ajouter au porridge avec le miel et la cannelle.',
    ],
    whyAdapted:
      "Glucides lents + rapides (banane) pour tenir jusqu'à la séance, digestion facile avant de courir.",
    highCarb: true,
  }),
  recipe('pdj-pain-perdu-amande', {
    name: 'Pain perdu à la boisson d\'amande',
    moment: 'petit_dejeuner',
    flags: { vegetarian: true, lactoseFree: true },
    prepTimeMin: 10,
    ingredients: ['2 tranches de pain de mie', '1 œuf', '150 ml de boisson d\'amande', 'Sucre, cannelle', 'Un peu de beurre pour la poêle'],
    steps: [
      "Battre l'œuf avec la boisson d'amande, le sucre et la cannelle.",
      'Tremper les tranches de pain, cuire 2 min de chaque côté à la poêle.',
    ],
    whyAdapted: 'Bon apport glucidique et protéiné, facile à digérer 2-3h avant une sortie longue.',
    allergens: ['gluten', 'œuf'],
    highCarb: true,
  }),
  recipe('pdj-tartines-confiture', {
    name: 'Tartines pain, confiture, compote',
    moment: 'petit_dejeuner',
    flags: { vegan: true },
    prepTimeMin: 5,
    ingredients: ['3 tranches de pain', 'Confiture', 'Une compote sans sucre ajouté', 'Un thé ou café léger'],
    steps: ['Griller le pain si besoin.', 'Tartiner de confiture, servir avec la compote.'],
    whyAdapted: 'Simple, très digeste, riche en glucides rapides — le classique du matin de sortie longue.',
    allergens: ['gluten'],
    highCarb: true,
  }),
  recipe('pdj-riz-au-lait-vegetal', {
    name: 'Riz au lait végétal et fruits secs',
    moment: 'petit_dejeuner',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 5,
    ingredients: ['200 g de riz au lait végétal (préparé la veille)', '1 cuillère à soupe de raisins secs', 'Amandes effilées'],
    steps: ['Réchauffer légèrement le riz au lait.', 'Ajouter les fruits secs par-dessus.'],
    whyAdapted: 'Facile à préparer la veille, glucides complexes, bien toléré avant un footing matinal.',
    allergens: ['fruits à coque'],
    highCarb: true,
  }),
  recipe('pdj-omelette-legere', {
    name: 'Omelette légère et pain grillé',
    moment: 'petit_dejeuner',
    flags: { vegetarian: true, lactoseFree: true },
    prepTimeMin: 10,
    ingredients: ['2 œufs', 'Épinards', '2 tranches de pain', 'Un filet d\'huile d\'olive'],
    steps: ['Battre les œufs, cuire avec les épinards à la poêle.', 'Servir avec le pain grillé.'],
    whyAdapted: "Bon équilibre glucides/protéines, adapté un jour sans séance ou avant une séance courte l'après-midi.",
    allergens: ['gluten', 'œuf'],
    highCarb: false,
  }),
  recipe('pdj-smoothie-bowl', {
    name: 'Smoothie bowl fruits rouges et graines',
    moment: 'petit_dejeuner',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 8,
    ingredients: ['150 g de fruits rouges surgelés', '1 banane', '100 ml de boisson végétale', 'Graines de chia', 'Granola sans gluten'],
    steps: ['Mixer les fruits rouges, la banane et la boisson végétale.', 'Verser dans un bol, parsemer de graines et de granola.'],
    whyAdapted: 'Riche en antioxydants et glucides, idéal les jours de récupération active.',
    highCarb: true,
  }),

  // ---- Déjeuner ----
  recipe('dej-pates-tomate-poulet', {
    name: 'Pâtes sauce tomate et poulet grillé',
    moment: 'dejeuner',
    flags: { lactoseFree: true },
    prepTimeMin: 25,
    ingredients: ['100 g de pâtes', '150 g de blanc de poulet', 'Sauce tomate maison', 'Basilic', 'Huile d\'olive'],
    steps: ['Cuire les pâtes al dente.', 'Griller le poulet coupé en lamelles.', 'Mélanger avec la sauce tomate chaude, ajouter le basilic.'],
    whyAdapted: 'Glucides + protéines maigres, base solide les jours de séance qualité (tempo/fractionné).',
    allergens: ['gluten'],
    highCarb: true,
  }),
  recipe('dej-riz-tofu-legumes', {
    name: 'Riz sauté au tofu et légumes',
    moment: 'dejeuner',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 20,
    ingredients: ['120 g de riz', '150 g de tofu ferme', 'Poivrons, carottes, brocolis', 'Sauce soja sans gluten', 'Huile de sésame'],
    steps: ['Cuire le riz.', 'Faire sauter le tofu coupé en dés puis les légumes.', 'Mélanger le tout avec la sauce soja.'],
    whyAdapted: 'Protéines végétales complètes et glucides pour bien récupérer entre deux séances.',
    highCarb: true,
  }),
  recipe('dej-quinoa-saumon', {
    name: 'Quinoa, saumon poêlé, épinards',
    moment: 'dejeuner',
    flags: { glutenFree: true, lactoseFree: true },
    prepTimeMin: 20,
    ingredients: ['100 g de quinoa', '150 g de pavé de saumon', 'Épinards frais', 'Citron', 'Huile d\'olive'],
    steps: ['Cuire le quinoa 12 min.', 'Poêler le saumon 3-4 min de chaque côté.', 'Servir avec les épinards justes saisis et un filet de citron.'],
    whyAdapted: 'Oméga-3 et fer, utile pour la récupération musculaire et la santé cardiovasculaire du coureur.',
    allergens: ['poisson'],
    highCarb: false,
  }),
  recipe('dej-boulgour-pois-chiches', {
    name: 'Boulgour, pois chiches et légumes rôtis',
    moment: 'dejeuner',
    flags: { vegan: true },
    prepTimeMin: 25,
    ingredients: ['100 g de boulgour', '150 g de pois chiches cuits', 'Courgette, poivron', 'Cumin, huile d\'olive'],
    steps: ['Cuire le boulgour.', 'Rôtir les légumes au four avec le cumin.', 'Mélanger avec les pois chiches.'],
    whyAdapted: 'Glucides complexes et protéines végétales, bon apport en fer et magnésium.',
    allergens: ['gluten'],
    highCarb: true,
  }),
  recipe('dej-riz-galette-legumes-sans-gluten', {
    name: 'Galettes de riz, dinde et légumes',
    moment: 'dejeuner',
    flags: { glutenFree: true, lactoseFree: true },
    prepTimeMin: 15,
    ingredients: ['3 galettes de riz', '120 g d\'escalope de dinde', 'Carottes râpées', 'Sauce soja sans gluten'],
    steps: ['Griller la dinde émincée.', 'Réhydrater les galettes de riz.', 'Garnir de dinde et de carottes, rouler.'],
    whyAdapted: 'Repas léger et sans gluten, digeste avant une séance en fin de journée.',
    highCarb: true,
  }),
  recipe('dej-salade-lentilles', {
    name: 'Salade de lentilles, feta, légumes croquants',
    moment: 'dejeuner',
    flags: { vegetarian: true, glutenFree: true },
    prepTimeMin: 15,
    ingredients: ['150 g de lentilles cuites', '50 g de feta', 'Concombre, tomates', 'Vinaigrette huile d\'olive/citron'],
    steps: ['Mélanger les lentilles avec les légumes coupés.', 'Émietter la feta par-dessus, assaisonner.'],
    whyAdapted: 'Riche en fer et en fibres, bon repas de récupération un jour de repos.',
    allergens: ['lactose'],
    highCarb: false,
  }),
  recipe('dej-pates-sans-gluten-legumes', {
    name: 'Pâtes sans gluten, légumes et parmesan',
    moment: 'dejeuner',
    flags: { vegetarian: true, glutenFree: true },
    prepTimeMin: 20,
    ingredients: ['100 g de pâtes sans gluten', 'Courgettes, tomates cerises', 'Parmesan', 'Huile d\'olive, ail'],
    steps: ['Cuire les pâtes sans gluten.', 'Faire revenir les légumes à l\'huile d\'olive et à l\'ail.', 'Mélanger, parsemer de parmesan.'],
    whyAdapted: 'Version sans gluten d\'un classique riche en glucides, idéale la veille d\'une sortie longue.',
    allergens: ['lactose'],
    highCarb: true,
  }),

  // ---- Dîner ----
  recipe('din-riz-poisson-vapeur', {
    name: 'Riz, poisson blanc vapeur, courgettes',
    moment: 'diner',
    flags: { glutenFree: true, lactoseFree: true },
    prepTimeMin: 20,
    ingredients: ['100 g de riz', '150 g de poisson blanc (cabillaud, colin)', 'Courgettes', 'Herbes fraîches'],
    steps: ['Cuire le riz.', 'Cuire le poisson et les courgettes à la vapeur.', 'Assaisonner avec les herbes et un filet d\'huile d\'olive.'],
    whyAdapted: 'Dîner léger et digeste, idéal la veille d\'une séance matinale ou d\'une sortie longue.',
    allergens: ['poisson'],
    highCarb: true,
  }),
  recipe('din-soupe-legumes-pain', {
    name: 'Soupe de légumes maison et pain complet',
    moment: 'diner',
    flags: { vegan: true },
    prepTimeMin: 25,
    ingredients: ['Carottes, poireaux, pommes de terre', 'Bouillon de légumes', 'Pain complet'],
    steps: ['Cuire les légumes dans le bouillon 20 min.', 'Mixer, servir avec le pain.'],
    whyAdapted: 'Hydratant et réconfortant, bon dîner de récupération après une séance intense.',
    allergens: ['gluten'],
    highCarb: true,
  }),
  recipe('din-omelette-salade', {
    name: 'Omelette aux champignons et salade verte',
    moment: 'diner',
    flags: { vegetarian: true, glutenFree: true, lactoseFree: true },
    prepTimeMin: 12,
    ingredients: ['3 œufs', 'Champignons de Paris', 'Salade verte', 'Vinaigrette légère'],
    steps: ['Faire revenir les champignons.', 'Ajouter les œufs battus, cuire en omelette.', 'Servir avec la salade.'],
    whyAdapted: 'Dîner léger en glucides, adapté les soirs sans séance le lendemain matin.',
    allergens: ['œuf'],
    highCarb: false,
  }),
  recipe('din-curry-pois-chiches', {
    name: 'Curry de pois chiches et riz basmati',
    moment: 'diner',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 25,
    ingredients: ['150 g de pois chiches cuits', 'Lait de coco', 'Curry, tomates', '100 g de riz basmati'],
    steps: ['Faire revenir les épices, ajouter tomates et lait de coco.', 'Ajouter les pois chiches, mijoter 15 min.', 'Servir avec le riz.'],
    whyAdapted: 'Glucides et protéines végétales, savoureux pour varier les dîners de semaine chargée.',
    highCarb: true,
  }),
  recipe('din-pomme-terre-poulet', {
    name: 'Pommes de terre vapeur, poulet, brocolis',
    moment: 'diner',
    flags: { glutenFree: true, lactoseFree: true },
    prepTimeMin: 25,
    ingredients: ['300 g de pommes de terre', '150 g de blanc de poulet', 'Brocolis', 'Herbes de Provence'],
    steps: ['Cuire les pommes de terre et les brocolis à la vapeur.', 'Griller le poulet aux herbes.', 'Assembler et assaisonner.'],
    whyAdapted: 'Bonne source de glucides et de protéines maigres pour la récupération du soir.',
    highCarb: true,
  }),
  recipe('din-tofu-nouilles-sans-gluten', {
    name: 'Nouilles de riz, tofu grillé, légumes sautés',
    moment: 'diner',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 20,
    ingredients: ['Nouilles de riz', '150 g de tofu', 'Pousses de soja, poivrons', 'Sauce soja sans gluten, gingembre'],
    steps: ['Cuire les nouilles de riz.', 'Griller le tofu, faire sauter les légumes au gingembre.', 'Mélanger le tout.'],
    whyAdapted: 'Dîner 100% sans gluten et sans lactose, riche en glucides pour reconstituer les réserves.',
    highCarb: true,
  }),

  // ---- Collation pré-course ----
  recipe('col-banane-amandes', {
    name: 'Banane et quelques amandes',
    moment: 'collation_pre_course',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 1,
    ingredients: ['1 banane', "8-10 amandes"],
    steps: ['À manger tel quel, 45-60 min avant la séance.'],
    whyAdapted: 'Glucides rapides et un peu de bon gras, digestion rapide avant de courir.',
    allergens: ['fruits à coque'],
    highCarb: true,
  }),
  recipe('col-compote-gateau-riz', {
    name: 'Compote et gâteau de riz',
    moment: 'collation_pre_course',
    flags: { vegetarian: true, glutenFree: true },
    prepTimeMin: 1,
    ingredients: ['1 compote sans sucre ajouté', '1 gâteau de riz nature'],
    steps: ['À consommer 30-45 min avant la séance.'],
    whyAdapted: 'Très digeste, apporte des glucides simples sans lourdeur avant l\'effort.',
    highCarb: true,
  }),
  recipe('col-pain-miel', {
    name: 'Tranche de pain et miel',
    moment: 'collation_pre_course',
    flags: { vegetarian: true },
    prepTimeMin: 2,
    ingredients: ['1 tranche de pain', '1 cuillère à café de miel'],
    steps: ['Tartiner et manger 45-60 min avant la séance.'],
    whyAdapted: 'Classique simple et efficace, bien toléré par la majorité des coureurs.',
    allergens: ['gluten'],
    highCarb: true,
  }),
  recipe('col-barre-cereales-maison', {
    name: 'Barre de céréales maison dattes-avoine',
    moment: 'collation_pre_course',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 5,
    ingredients: ["Flocons d'avoine sans gluten", 'Dattes mixées', 'Un peu de miel ou sirop d\'agave'],
    steps: ['Mélanger, presser dans un moule, laisser figer au frais (préparation à l\'avance).', 'Découper en barres.'],
    whyAdapted: 'Facile à emporter, glucides à index glycémique modéré à élevé pour l\'énergie avant course.',
    highCarb: true,
  }),
  recipe('col-fruit-sec-raisin', {
    name: 'Raisins secs et abricots secs',
    moment: 'collation_pre_course',
    flags: { vegan: true, glutenFree: true, lactoseFree: true },
    prepTimeMin: 1,
    ingredients: ['1 petite poignée de raisins secs', '2-3 abricots secs'],
    steps: ['À consommer 30-40 min avant la séance, avec de l\'eau.'],
    whyAdapted: 'Sucres rapides, très compact, pratique juste avant de partir courir.',
    highCarb: true,
  }),

  // ---- Collation récupération ----
  recipe('rec-yaourt-fruits-muesli', {
    name: 'Yaourt, fruits frais et muesli',
    moment: 'collation_recuperation',
    flags: { vegetarian: true },
    prepTimeMin: 3,
    ingredients: ['1 yaourt nature', 'Fruits frais de saison', 'Muesli'],
    steps: ['Mélanger le yaourt avec les fruits coupés et le muesli.'],
    whyAdapted: 'Association glucides + protéines dans les 30 min suivant l\'effort, favorise la récupération musculaire.',
    allergens: ['lactose', 'gluten'],
    highCarb: true,
  }),
  recipe('rec-smoothie-proteine-vegetal', {
    name: 'Smoothie boisson végétale, banane, beurre de cacahuète',
    moment: 'collation_recuperation',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 5,
    ingredients: ['250 ml de boisson végétale', '1 banane', '1 cuillère à soupe de beurre de cacahuète', 'Une pincée de sel'],
    steps: ['Mixer tous les ingrédients ensemble.', 'Boire dans les 30 min après la séance.'],
    whyAdapted: 'Glucides et protéines végétales pour relancer la récupération sans lactose.',
    allergens: ['arachide'],
    highCarb: true,
  }),
  recipe('rec-oeuf-dur-pain', {
    name: 'Œuf dur et tranche de pain',
    moment: 'collation_recuperation',
    flags: { vegetarian: true, lactoseFree: true },
    prepTimeMin: 10,
    ingredients: ['1 œuf', '1 tranche de pain'],
    steps: ['Cuire l\'œuf dur 9-10 min.', 'Consommer avec le pain juste après la séance.'],
    whyAdapted: 'Apport protéiné rapide, simple à préparer à l\'avance et emporter.',
    allergens: ['œuf', 'gluten'],
    highCarb: false,
  }),
  recipe('rec-fromage-blanc-miel', {
    name: 'Fromage blanc, miel et amandes',
    moment: 'collation_recuperation',
    flags: { vegetarian: true, glutenFree: true },
    prepTimeMin: 2,
    ingredients: ['150 g de fromage blanc', '1 cuillère à café de miel', 'Amandes effilées'],
    steps: ['Mélanger le fromage blanc avec le miel.', 'Parsemer d\'amandes.'],
    whyAdapted: 'Riche en protéines et glucides, favorise la resynthèse du glycogène après la sortie longue.',
    allergens: ['lactose', 'fruits à coque'],
    highCarb: true,
  }),
  recipe('rec-houmous-pain-galette', {
    name: 'Houmous et galette de riz',
    moment: 'collation_recuperation',
    flags: { vegan: true, glutenFree: true },
    prepTimeMin: 3,
    ingredients: ['2 galettes de riz', '3 cuillères à soupe de houmous'],
    steps: ['Tartiner les galettes de houmous.'],
    whyAdapted: 'Bonne alternative vegan et sans gluten, protéines végétales et glucides faciles à digérer.',
    highCarb: true,
  }),
];
