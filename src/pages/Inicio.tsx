import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Coffee, Sun, Cookie, Moon } from 'lucide-react';
import RecipeCard, { type Receta } from '../components/RecipeCard';
import RecipeDetail, { type Recipe } from '../components/RecipeDetail';

/* ───────────────────────────────────────────────
   Datos de demostración
   ─────────────────────────────────────────────── */

export const DEMO_RECETAS: Receta[] = [
  {
    id: 1,
    nombre: 'Pasta al pesto con tomates cherry',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['pasta', 'albahaca', 'aceite de oliva', 'tomates cherry', 'ajo', 'piñones', 'queso parmesano'],
    pasos: [
      'Cocer la pasta en agua con sal según instrucciones.',
      'Mientras tanto, lavar y cortar los tomates cherry por la mitad.',
      'Preparar el pesto: triturar albahaca, ajo, piñones, aceite de oliva y queso.',
      'Mezclar la pasta escurrida con el pesto y los tomates cherry.',
      'Servir caliente con queso parmesano rallado por encima.',
    ],
    sustituciones: {
      'piñones': 'nueces o almendras',
      'queso parmesano': 'levadura nutricional (vegano)',
      'pasta': 'pasta sin gluten o zucchini en espiral',
    },
  },
  {
    id: 2,
    nombre: 'Ensalada mediterránea de quinoa',
    tiempo: 30,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['quinoa', 'pepino', 'pimiento', 'tomate', 'aceitunas', 'limón', 'aceite de oliva'],
    pasos: [
      'Cocer la quinoa según instrucciones y dejar enfriar.',
      'Cortar el pepino, pimiento y tomate en cubos pequeños.',
      'Mezclar la quinoa con las verduras y las aceitunas.',
      'Aliñar con jugo de limón, aceite de oliva, sal y pimienta.',
      'Refrigerar 10 minutos antes de servir.',
    ],
    sustituciones: {
      'quinoa': 'arroz integral o bulgur',
      'aceitunas': 'alcaparras',
    },
  },
  {
    id: 3,
    nombre: 'Tacos de pollo con salsa verde',
    tiempo: 35,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['pollo', 'tortillas de maíz', 'tomate verde', 'cilantro', 'cebolla', 'limón', 'chile serrano'],
    pasos: [
      'Cocinar y desmenuzar el pollo.',
      'Licuar tomate verde, cilantro, cebolla y chile para la salsa.',
      'Calentar las tortillas en un comal o sartén.',
      'Rellenar cada tortilla con pollo y bañar con salsa verde.',
      'Servir con rodajas de limón y cilantro fresco.',
    ],
    sustituciones: {
      'pollo': 'tofu desmenuzado o jackfruit',
      'tortillas de maíz': 'tortillas de harina o lechuga',
      'chile serrano': 'jalapeño o pimiento verde',
    },
  },
  {
    id: 4,
    nombre: 'Risotto de champiñones y trufa',
    tiempo: 40,
    dificultad: 'Difícil',
    categoria: 'Cena',
    ingredientes: ['arroz arbóreo', 'champiñones', 'cebolla', 'vino blanco', 'caldo de verduras', 'queso parmesano', 'aceite de trufa'],
    pasos: [
      'Sofreír la cebolla picada en aceite de oliva.',
      'Agregar los champiñones laminados y cocinar hasta que doren.',
      'Añadir el arroz y tostar 2 minutos, luego agregar el vino.',
      'Ir agregando caldo caliente de a poco, removiendo constantemente.',
      'Cuando el arroz esté al dente, agregar queso parmesano y aceite de trufa.',
      'Reposar 2 minutos y servir inmediatamente.',
    ],
    sustituciones: {
      'queso parmesano': 'levadura nutricional',
      'vino blanco': 'caldo de verduras extra',
      'aceite de trufa': 'aceite de oliva con hongos secos',
    },
  },
  {
    id: 5,
    nombre: 'Smoothie bowl de frutos rojos',
    tiempo: 10,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['frutos rojos', 'plátano', 'yogur griego', 'granola', 'semillas de chía', 'miel'],
    pasos: [
      'Licuar frutos rojos congelados, plátano y yogur hasta obtener textura cremosa.',
      'Verter en un bowl.',
      'Decorar con granola, semillas de chía y un hilo de miel.',
      'Servir inmediatamente.',
    ],
    sustituciones: {
      'yogur griego': 'yogur de coco o leche de almendras',
      'miel': 'sirope de agave o dátiles',
    },
  },
  {
    id: 6,
    nombre: 'Curry de garbanzos con espinacas',
    tiempo: 40,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['garbanzos', 'espinacas', 'leche de coco', 'cebolla', 'ajo', 'jengibre', 'curry en polvo'],
    pasos: [
      'Sofreír cebolla, ajo y jengibre rallado en aceite.',
      'Agregar el curry en polvo y cocinar 1 minuto.',
      'Añadir los garbanzos escurridos y la leche de coco.',
      'Cocinar a fuego medio 15 minutos.',
      'Agregar las espinacas y cocinar hasta que se marchiten.',
      'Servir con arroz basmati o pan naan.',
    ],
    sustituciones: {
      'garbanzos': 'lentejas o tofu',
      'leche de coco': 'crema de anacardos',
      'espinacas': 'acelgas o kale',
    },
  },
  /* ── 14 recetas nuevas de Desayuno ── */
  {
    id: 7,
    nombre: 'Tostadas de aguacate con huevo pochado',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['pan integral', 'aguacate', 'huevo', 'limón', 'sal', 'pimienta', 'tomate cherry'],
    pasos: [
      'Tostar el pan integral hasta que esté dorado.',
      'Machacar el aguacate con un tenedor, agregar jugo de limón, sal y pimienta.',
      'Pochar el huevo en agua hirviendo con un chorrito de vinagre durante 3-4 minutos.',
      'Untar el aguacate sobre el pan tostado.',
      'Colocar el huevo pochado encima y decorar con tomates cherry cortados.',
    ],
    sustituciones: {
      'pan integral': 'pan de masa madre o tortilla de maíz',
      'huevo': 'tofu revuelto (vegano)',
    },
  },
  {
    id: 8,
    nombre: 'Avena cocida con manzana y canela',
    tiempo: 15,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['avena en copos', 'leche', 'manzana', 'canela', 'nueces', 'miel'],
    pasos: [
      'Cocer la avena en leche a fuego medio durante 5-7 minutos, removiendo.',
      'Rallar la manzana y agregarla a la avena junto con la canela.',
      'Cocinar 2 minutos más hasta que espese.',
      'Servir en un bowl, decorar con nueces picadas y un hilo de miel.',
    ],
    sustituciones: {
      'leche': 'leche de almendras o avena',
      'miel': 'sirope de agave',
      'nueces': 'almendras o avellanas',
    },
  },
  {
    id: 9,
    nombre: 'Tortilla de claras con espinacas y queso fresco',
    tiempo: 12,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['claras de huevo', 'espinacas frescas', 'queso fresco', 'sal', 'pimienta', 'aceite de oliva'],
    pasos: [
      'Lavar y escurrir las espinacas.',
      'Batir las claras con sal y pimienta hasta que estén espumosas.',
      'Calentar una sartén antiadherente con un poco de aceite.',
      'Saltear las espinacas 1 minuto, luego verter las claras.',
      'Cocinar a fuego medio 3 minutos, agregar el queso fresco desmenuzado, doblar y servir.',
    ],
    sustituciones: {
      'claras de huevo': 'huevos enteros (2 unidades)',
      'queso fresco': 'tofu firme desmenuzado',
      'espinacas': 'acelgas o rúcula',
    },
  },
  {
    id: 10,
    nombre: 'Panqueques de avena y plátano',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['avena en copos', 'plátano', 'huevo', 'canela', 'esencia de vainilla', 'aceite de coco'],
    pasos: [
      'Procesar la avena hasta convertirla en harina.',
      'Machacar el plátano y mezclar con el huevo, la canela y la vainilla.',
      'Agregar la harina de avena y mezclar hasta obtener una masa homogénea.',
      'Calentar una sartén con aceite de coco y verter porciones de masa.',
      'Cocinar 2-3 minutos por lado hasta que estén dorados.',
      'Servir con fruta fresca y un poco de yogur.',
    ],
    sustituciones: {
      'huevo': 'semillas de lino molidas + agua (vegano)',
      'aceite de coco': 'aceite de oliva o mantequilla',
    },
  },
  {
    id: 11,
    nombre: 'Yogur griego con granola casera y frutas de estación',
    tiempo: 8,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['yogur griego', 'granola', 'frutillas', 'arándanos', 'kiwi', 'semillas de chía'],
    pasos: [
      'Lavar y cortar las frutas en trozos pequeños.',
      'Colocar el yogur griego en un bowl.',
      'Agregar la granola por encima.',
      'Decorar con las frutas y las semillas de chía.',
      'Servir inmediatamente.',
    ],
    sustituciones: {
      'yogur griego': 'yogur de coco o skyr',
      'granola': 'copos de avena tostados con miel',
      'frutillas': 'mango o durazno según estación',
    },
  },
  {
    id: 12,
    nombre: 'Huevos revueltos con tomate y cebolla',
    tiempo: 10,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['huevo', 'tomate', 'cebolla', 'aceite de oliva', 'sal', 'pimienta', 'perejil'],
    pasos: [
      'Picar la cebolla y el tomate en cubos pequeños.',
      'Calentar aceite de oliva en una sartén y sofreír la cebolla hasta transparentar.',
      'Agregar el tomate y cocinar 2 minutos.',
      'Batir los huevos y verter sobre las verduras.',
      'Revolver constantemente hasta que los huevos estén cocidos pero jugosos.',
      'Espolvorear con perejil picado y servir.',
    ],
    sustituciones: {
      'tomate': 'pimiento rojo asado',
      'cebolla': 'puerro o cebolla de verdeo',
    },
  },
  {
    id: 13,
    nombre: 'Smoothie verde energético',
    tiempo: 5,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['espinacas', 'manzana verde', 'apio', 'jengibre', 'limón', 'agua de coco'],
    pasos: [
      'Lavar bien todos los ingredientes.',
      'Cortar la manzana y el apio en trozos.',
      'Pelar un trozo pequeño de jengibre.',
      'Licuar todos los ingredientes con agua de coco hasta obtener una textura homogénea.',
      'Servir frío inmediatamente.',
    ],
    sustituciones: {
      'espinacas': 'kale o acelga',
      'agua de coco': 'agua filtrada',
      'manzana verde': 'pera o piña',
    },
  },
  {
    id: 14,
    nombre: 'Budín de chía con leche de coco y mango',
    tiempo: 10,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['semillas de chía', 'leche de coco', 'mango', 'vainilla', 'miel', 'coco rallado'],
    pasos: [
      'Mezclar las semillas de chía con la leche de coco y la vainilla.',
      'Revolver bien y refrigerar al menos 4 horas o toda la noche.',
      'Cortar el mango en cubos.',
      'Servir el budín de chía en un bowl.',
      'Decorar con mango, coco rallado y un hilo de miel.',
    ],
    sustituciones: {
      'leche de coco': 'leche de almendras',
      'mango': 'frutos rojos o durazno',
      'miel': 'sirope de agave',
    },
  },
  {
    id: 15,
    nombre: 'Wrap de huevo y vegetales',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['tortilla de trigo integral', 'huevo', 'pimiento', 'cebolla', 'espinacas', 'queso crema light'],
    pasos: [
      'Picar el pimiento y la cebolla en tiras finas.',
      'Saltear las verduras en una sartén con un poco de aceite.',
      'Batir el huevo y cocinar como tortilla fina.',
      'Calentar la tortilla integral y untar con queso crema.',
      'Colocar la tortilla de huevo y las verduras encima.',
      'Enrollar firmemente, cortar por la mitad y servir.',
    ],
    sustituciones: {
      'tortilla de trigo integral': 'tortilla de maíz o lechuga',
      'queso crema light': 'hummus o palta',
      'huevo': 'tofu revuelto',
    },
  },
  {
    id: 16,
    nombre: 'Bowl de quinoa con frutas y almendras',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['quinoa', 'leche de almendras', 'frutillas', 'almendras', 'canela', 'dátiles'],
    pasos: [
      'Cocer la quinoa en leche de almendras a fuego bajo durante 15 minutos.',
      'Agregar canela y dátiles picados, mezclar bien.',
      'Lavar y cortar las frutillas en láminas.',
      'Servir la quinoa en un bowl.',
      'Decorar con frutillas y almendras laminadas.',
    ],
    sustituciones: {
      'quinoa': 'mijo o arroz integral',
      'leche de almendras': 'leche de coco o avena',
      'frutillas': 'banana o durazno',
    },
  },
  {
    id: 17,
    nombre: 'Omelette de champiñones y queso de cabra',
    tiempo: 15,
    dificultad: 'Media',
    categoria: 'Desayuno',
    ingredientes: ['huevo', 'champiñones', 'queso de cabra', 'tomillo', 'aceite de oliva', 'sal', 'pimienta'],
    pasos: [
      'Limpiar y laminar los champiñones.',
      'Saltearlos en aceite de oliva con tomillo hasta que doren.',
      'Batir los huevos con sal y pimienta.',
      'Verter los huevos en una sartén antiadherente caliente.',
      'Cuando empiece a cuajar, agregar los champiñones y el queso de cabra desmenuzado.',
      'Doblar el omelette por la mitad y cocinar 1 minuto más.',
      'Servir caliente.',
    ],
    sustituciones: {
      'queso de cabra': 'queso ricota o tofu marinado',
      'champiñones': 'portobello o berenjenas',
    },
  },
  {
    id: 18,
    nombre: 'Batido de frutos rojos con yogur',
    tiempo: 5,
    dificultad: 'Muy fácil',
    categoria: 'Desayuno',
    ingredientes: ['frutos rojos congelados', 'yogur natural', 'leche', 'avena', 'miel'],
    pasos: [
      'Colocar todos los ingredientes en la licuadora.',
      'Licuar hasta obtener una textura cremosa y homogénea.',
      'Verter en un vaso grande.',
      'Decorar con algunos frutos rojos enteros y un poco de avena por encima.',
      'Servir inmediatamente.',
    ],
    sustituciones: {
      'yogur natural': 'yogur de soja o coco',
      'leche': 'leche de almendras',
      'miel': 'dátiles sin carozo',
    },
  },
  {
    id: 19,
    nombre: 'Tostada de hummus con vegetales asados',
    tiempo: 18,
    dificultad: 'Fácil',
    categoria: 'Desayuno',
    ingredientes: ['pan integral', 'hummus', 'berenjena', 'pimiento rojo', 'rúcula', 'aceite de oliva'],
    pasos: [
      'Cortar la berenjena y el pimiento en tiras.',
      'Asar las verduras en el horno o sartén con un poco de aceite hasta que estén tiernas.',
      'Tostar el pan integral.',
      'Untar una capa generosa de hummus sobre el pan.',
      'Colocar las verduras asadas encima y agregar un puñado de rúcula.',
      'Rociar con un hilo de aceite de oliva y servir.',
    ],
    sustituciones: {
      'pan integral': 'pan de pita integral o tortilla de maíz',
      'berenjena': 'zapallo o calabacín',
      'rúcula': 'espinacas baby o albahaca',
    },
  },
  {
    id: 20,
    nombre: 'Crepes de avena con ricota y pera',
    tiempo: 20,
    dificultad: 'Media',
    categoria: 'Desayuno',
    ingredientes: ['avena en copos', 'huevo', 'leche', 'ricota', 'pera', 'canela', 'miel'],
    pasos: [
      'Procesar la avena hasta obtener harina.',
      'Mezclar la harina de avena con el huevo y la leche hasta obtener una masa líquida.',
      'Cocinar porciones finas en una sartén antiadherente, 2 minutos por lado.',
      'Untar cada crepe con ricota.',
      'Cortar la pera en láminas finas y colocarlas sobre la ricota.',
      'Espolvorear con canela, doblar los crepes y servir con un hilo de miel.',
    ],
    sustituciones: {
      'ricota': 'queso crema light o tofu batido',
      'pera': 'manzana o durazno',
      'miel': 'sirope de arce',
    },
  },
  /* ── 5 recetas de Almuerzo ── */
  {
    id: 21,
    nombre: 'Pollo al horno con vegetales',
    tiempo: 40,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['pechuga de pollo', 'papa', 'zanahoria', 'cebolla', 'aceite de oliva', 'sal', 'pimienta', 'orégano'],
    pasos: [
      'Cortar los vegetales en trozos medianos.',
      'Colocar el pollo y los vegetales en una fuente para horno.',
      'Condimentar con sal, pimienta, orégano y un chorrito de aceite.',
      'Hornear a 200°C durante 35-40 minutos, hasta que el pollo esté dorado.',
    ],
    sustituciones: {
      'pollo': 'pescado blanco',
      'papa': 'batata',
    },
  },
  {
    id: 22,
    nombre: 'Ensalada tibia de lentejas',
    tiempo: 25,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['lentejas cocidas', 'tomate', 'cebolla morada', 'pimiento', 'aceite de oliva', 'limón', 'sal'],
    pasos: [
      'Cortar el tomate, la cebolla y el pimiento en cubos pequeños.',
      'Mezclar con las lentejas cocidas.',
      'Aliñar con aceite de oliva, jugo de limón y sal.',
      'Servir tibio o frío.',
    ],
    sustituciones: {
      'lentejas': 'garbanzos',
      'limón': 'vinagre',
    },
  },
  {
    id: 23,
    nombre: 'Salteado de arroz integral con vegetales y huevo',
    tiempo: 30,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['arroz integral cocido', 'huevo', 'zanahoria', 'arvejas', 'cebolla', 'salsa de soja', 'aceite'],
    pasos: [
      'Saltear la cebolla y la zanahoria en aceite.',
      'Agregar las arvejas y el arroz cocido.',
      'Hacer un espacio en la sartén y revolver el huevo hasta cocinarlo.',
      'Mezclar todo y agregar un chorrito de salsa de soja.',
    ],
    sustituciones: {
      'arroz integral': 'quinoa',
      'salsa de soja': 'sal',
    },
  },
  {
    id: 24,
    nombre: 'Filet de merluza a la plancha con puré de calabaza',
    tiempo: 30,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['filet de merluza', 'calabaza', 'aceite de oliva', 'sal', 'pimienta', 'limón'],
    pasos: [
      'Hervir la calabaza hasta que esté tierna y hacer puré.',
      'Condimentar el pescado con sal, pimienta y limón.',
      'Cocinar a la plancha 3-4 minutos de cada lado.',
      'Servir el pescado sobre el puré.',
    ],
    sustituciones: {
      'merluza': 'pollo',
      'calabaza': 'batata',
    },
  },
  {
    id: 25,
    nombre: 'Wrap integral de pollo y vegetales',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['tortilla integral', 'pollo cocido desmenuzado', 'lechuga', 'tomate', 'zanahoria rallada', 'yogur natural'],
    pasos: [
      'Calentar levemente la tortilla.',
      'Untar con yogur natural.',
      'Colocar el pollo desmenuzado, la lechuga, el tomate y la zanahoria.',
      'Enrollar y cortar al medio.',
    ],
    sustituciones: {
      'pollo': 'atún',
      'yogur natural': 'mayonesa light',
    },
  },
  /* ── 5 recetas nuevas de Almuerzo ── */
  {
    id: 26,
    nombre: 'Guiso de garbanzos con vegetales',
    tiempo: 35,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['garbanzos cocidos', 'tomate', 'cebolla', 'morrón', 'calabaza', 'aceite de oliva', 'sal', 'comino'],
    pasos: [
      'Saltear la cebolla y el morrón en aceite.',
      'Agregar el tomate picado y cocinar unos minutos.',
      'Incorporar la calabaza en cubos y los garbanzos.',
      'Cocinar a fuego bajo 20 minutos, condimentando con sal y comino.',
    ],
    sustituciones: {
      'garbanzos': 'lentejas',
      'calabaza': 'batata',
    },
  },
  {
    id: 27,
    nombre: 'Milanesa de pollo al horno con puré de papa',
    tiempo: 40,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['pechuga de pollo', 'pan rallado integral', 'huevo', 'papa', 'leche', 'sal', 'pimienta'],
    pasos: [
      'Pasar el pollo por huevo y luego por pan rallado.',
      'Hornear a 200°C durante 20-25 minutos, dando vuelta a mitad de cocción.',
      'Hervir la papa y hacer puré con un poco de leche y sal.',
      'Servir juntos.',
    ],
    sustituciones: {
      'pan rallado integral': 'avena molida',
      'papa': 'batata',
    },
  },
  {
    id: 28,
    nombre: 'Fideos integrales con salsa de tomate y atún',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['fideos integrales', 'atún al natural', 'tomate triturado', 'cebolla', 'ajo', 'aceite de oliva', 'sal'],
    pasos: [
      'Hervir los fideos según indica el paquete.',
      'Saltear cebolla y ajo, agregar el tomate triturado y cocinar 10 minutos.',
      'Incorporar el atún escurrido.',
      'Mezclar con los fideos.',
    ],
    sustituciones: {
      'atún al natural': 'pollo desmenuzado',
      'fideos integrales': 'arroz',
    },
  },
  {
    id: 29,
    nombre: 'Tarta de vegetales con base de avena',
    tiempo: 45,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['avena', 'huevo', 'espinaca', 'cebolla', 'queso descremado', 'sal', 'pimienta'],
    pasos: [
      'Mezclar la avena con un huevo para formar la base y colocar en un molde.',
      'Saltear la espinaca con cebolla.',
      'Mezclar con el resto de los huevos y el queso.',
      'Volcar sobre la base y hornear 25 minutos a 180°C.',
    ],
    sustituciones: {
      'espinaca': 'acelga',
      'queso descremado': 'ricota',
    },
  },
  {
    id: 30,
    nombre: 'Pechuga de pollo grillada con ensalada mixta',
    tiempo: 25,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['pechuga de pollo', 'lechuga', 'tomate', 'zanahoria', 'aceite de oliva', 'limón', 'sal'],
    pasos: [
      'Condimentar la pechuga con sal y limón.',
      'Cocinar a la plancha 5-6 minutos de cada lado.',
      'Preparar la ensalada con lechuga, tomate y zanahoria rallada.',
      'Aliñar con aceite de oliva y servir junto al pollo.',
    ],
    sustituciones: {
      'pollo': 'tofu',
      'zanahoria': 'remolacha',
    },
  },
  {
    id: 31,
    nombre: 'Bife a la plancha con ensalada de rúcula y tomate',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Almuerzo',
    ingredientes: ['bife de carne magra', 'rúcula', 'tomate cherry', 'aceite de oliva', 'limón', 'sal', 'pimienta'],
    pasos: [
      'Condimentar el bife con sal y pimienta.',
      'Cocinar a la plancha 4-5 minutos de cada lado según el punto deseado.',
      'Preparar la ensalada de rúcula y tomate cherry.',
      'Aliñar con aceite de oliva y limón, servir junto al bife.',
    ],
    sustituciones: {
      'bife de carne magra': 'pechuga de pollo',
      'rúcula': 'espinaca',
    },
  },
  {
    id: 32,
    nombre: 'Cazuela de pescado con vegetales',
    tiempo: 35,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['pescado blanco', 'papa', 'zanahoria', 'cebolla', 'caldo de pescado', 'aceite de oliva', 'sal', 'pimienta'],
    pasos: [
      'Cortar las verduras en cubos medianos.',
      'Sofreír la cebolla en aceite de oliva.',
      'Agregar la papa y la zanahoria, cubrir con caldo de pescado.',
      'Cocinar 15 minutos, agregar el pescado en trozos.',
      'Cocinar 10 minutos más hasta que el pescado esté cocido.',
      'Servir caliente.',
    ],
    sustituciones: {
      'pescado blanco': 'pollo',
      'papa': 'batata',
    },
  },
  {
    id: 33,
    nombre: 'Berenjenas rellenas con carne y vegetales',
    tiempo: 45,
    dificultad: 'Media',
    categoria: 'Almuerzo',
    ingredientes: ['berenjena', 'carne picada magra', 'tomate', 'cebolla', 'queso descremado', 'sal', 'orégano'],
    pasos: [
      'Cortar las berenjenas al medio y ahuecar levemente.',
      'Saltear la carne picada con cebolla y tomate.',
      'Rellenar las berenjenas con la mezcla.',
      'Cubrir con queso descremado y hornear 20 minutos a 190°C.',
    ],
    sustituciones: {
      'carne picada magra': 'lentejas',
      'queso descremado': 'ricota',
    },
  },
  /* ── 6 recetas de Merienda ── */
  {
    id: 34,
    nombre: 'Panqueques de avena y banana',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['avena', 'banana', 'huevo', 'canela', 'esencia de vainilla', 'aceite de coco'],
    pasos: [
      'Procesar la avena hasta obtener harina.',
      'Machacar la banana y mezclar con el huevo, la canela y la vainilla.',
      'Agregar la harina de avena y mezclar hasta obtener una masa homogénea.',
      'Calentar una sartén con aceite de coco y verter porciones de masa.',
      'Cocinar 2-3 minutos por lado hasta que estén dorados.',
      'Servir con fruta fresca y un poco de yogur.',
    ],
    sustituciones: {
      'huevo': 'semillas de lino molidas + agua (vegano)',
      'aceite de coco': 'aceite de oliva o mantequilla',
    },
  },
  {
    id: 35,
    nombre: 'Sándwich de queso y tomate en pan integral',
    tiempo: 10,
    dificultad: 'Muy fácil',
    categoria: 'Merienda',
    ingredientes: ['pan integral', 'queso fresco', 'tomate', 'albahaca', 'aceite de oliva', 'sal', 'pimienta'],
    pasos: [
      'Tostar ligeramente el pan integral.',
      'Cortar el tomate en rodajas finas.',
      'Armar el sándwich con queso fresco, tomate y hojas de albahaca.',
      'Rociar con un hilo de aceite de oliva, sal y pimienta.',
      'Cerrar el sándwich y servir.',
    ],
    sustituciones: {
      'queso fresco': 'queso de cabra o tofu marinado',
      'pan integral': 'pan de masa madre',
    },
  },
  {
    id: 36,
    nombre: 'Budín de manzana y avena',
    tiempo: 40,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['avena', 'manzana', 'huevo', 'leche', 'canela', 'dátiles', 'nueces'],
    pasos: [
      'Precalentar el horno a 180°C.',
      'Procesar la avena hasta obtener harina.',
      'Rallar la manzana y mezclar con el huevo, la leche y la canela.',
      'Agregar la harina de avena, los dátiles picados y las nueces.',
      'Verter en un molde enmantecado y hornear 30 minutos.',
      'Dejar enfriar antes de desmoldar y servir.',
    ],
    sustituciones: {
      'huevo': 'semillas de lino molidas + agua (vegano)',
      'leche': 'leche de almendras',
      'nueces': 'almendras',
    },
  },
  {
    id: 37,
    nombre: 'Muffins de zanahoria y nuez',
    tiempo: 35,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['zanahoria', 'harina integral', 'huevo', 'aceite de oliva', 'nueces', 'canela', 'azúcar mascabo'],
    pasos: [
      'Rallar la zanahoria finamente.',
      'Mezclar la harina, la canela y el azúcar mascabo en un bowl.',
      'Agregar el huevo batido, el aceite de oliva y la zanahoria rallada.',
      'Incorporar las nueces picadas y mezclar bien.',
      'Verter en moldes para muffins y hornear 25 minutos a 180°C.',
      'Dejar enfriar sobre una rejilla antes de servir.',
    ],
    sustituciones: {
      'harina integral': 'harina de avena',
      'huevo': 'semillas de lino molidas + agua (vegano)',
      'nueces': 'almendras o avellanas',
    },
  },
  {
    id: 38,
    nombre: 'Compota de pera con yogur y granola',
    tiempo: 20,
    dificultad: 'Muy fácil',
    categoria: 'Merienda',
    ingredientes: ['pera', 'yogur natural', 'granola', 'canela', 'miel', 'jugo de limón'],
    pasos: [
      'Pelar y cortar las peras en cubos pequeños.',
      'Cocinar las peras en una olla con jugo de limón y canela a fuego bajo durante 10 minutos.',
      'Dejar enfriar la compota.',
      'Servir en un bowl con yogur natural.',
      'Decorar con granola y un hilo de miel.',
    ],
    sustituciones: {
      'pera': 'manzana o durazno',
      'yogur natural': 'yogur de coco',
      'miel': 'sirope de agave',
    },
  },
  {
    id: 39,
    nombre: 'Tostadas francesas con canela y frutas',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['pan integral', 'huevo', 'leche', 'canela', 'esencia de vainilla', 'frutillas', 'miel'],
    pasos: [
      'Batir el huevo con la leche, la canela y la vainilla.',
      'Remojar las rebanadas de pan en la mezcla hasta que se empapen.',
      'Cocinar en una sartén antiadherente caliente 2-3 minutos por lado.',
      'Lavar y cortar las frutillas en láminas.',
      'Servir las tostadas con frutillas y un hilo de miel.',
    ],
    sustituciones: {
      'pan integral': 'pan de brioche o challa',
      'leche': 'leche de almendras',
      'frutillas': 'banana o durazno',
    },
  },
  {
    id: 40,
    nombre: 'Batido de frutillas con yogur y avena',
    tiempo: 8,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['frutillas', 'yogur descremado', 'avena', 'miel', 'hielo'],
    pasos: [
      'Colocar las frutillas, el yogur y la avena en la licuadora.',
      'Agregar miel y hielo.',
      'Licuar hasta obtener una consistencia cremosa.',
      'Servir frío.',
    ],
    sustituciones: {
      'yogur descremado': 'leche de almendras',
      'frutillas': 'arándanos',
    },
  },
  {
    id: 41,
    nombre: 'Tostadas con ricota y mermelada light',
    tiempo: 10,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['pan integral', 'ricota descremada', 'mermelada light', 'nueces'],
    pasos: [
      'Tostar el pan integral.',
      'Untar con ricota descremada.',
      'Agregar una cucharada de mermelada light encima.',
      'Espolvorear nueces picadas.',
    ],
    sustituciones: {
      'ricota descremada': 'queso untable descremado',
      'nueces': 'semillas de chía',
    },
  },
  {
    id: 42,
    nombre: 'Bizcochuelo de zanahoria y naranja',
    tiempo: 45,
    dificultad: 'Media',
    categoria: 'Merienda',
    ingredientes: ['harina integral', 'zanahoria rallada', 'naranja', 'huevo', 'edulcorante', 'polvo de hornear'],
    pasos: [
      'Mezclar la harina con el polvo de hornear.',
      'Batir los huevos con el edulcorante y el jugo de naranja.',
      'Incorporar la zanahoria rallada y la harina de a poco.',
      'Volcar en un molde y hornear 35 minutos a 180°C.',
    ],
    sustituciones: {
      'harina integral': 'harina de avena',
      'naranja': 'limón',
    },
  },
  {
    id: 43,
    nombre: 'Waffles integrales con frutas',
    tiempo: 20,
    dificultad: 'Media',
    categoria: 'Merienda',
    ingredientes: ['harina integral', 'huevo', 'leche descremada', 'polvo de hornear', 'banana', 'arándanos'],
    pasos: [
      'Mezclar la harina con el polvo de hornear.',
      'Batir el huevo con la leche e incorporar a la mezcla seca.',
      'Cocinar en waflera hasta dorar.',
      'Servir con banana en rodajas y arándanos.',
    ],
    sustituciones: {
      'leche descremada': 'leche de almendras',
      'harina integral': 'harina de avena',
    },
  },
  {
    id: 44,
    nombre: 'Ensalada de frutas con semillas',
    tiempo: 10,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['manzana', 'banana', 'naranja', 'semillas de chía', 'miel'],
    pasos: [
      'Cortar todas las frutas en cubos pequeños.',
      'Mezclar en un bowl.',
      'Agregar las semillas de chía.',
      'Rociar con miel antes de servir.',
    ],
    sustituciones: {
      'miel': 'edulcorante natural',
      'semillas de chía': 'semillas de lino',
    },
  },
  {
    id: 45,
    nombre: 'Muffins de avena y manzana',
    tiempo: 35,
    dificultad: 'Media',
    categoria: 'Merienda',
    ingredientes: ['avena', 'manzana', 'huevo', 'leche descremada', 'canela', 'polvo de hornear'],
    pasos: [
      'Mezclar la avena con el polvo de hornear y la canela.',
      'Batir el huevo con la leche e incorporar a la mezcla seca.',
      'Agregar la manzana en cubos pequeños.',
      'Volcar en pirotines y hornear 25 minutos a 180°C.',
    ],
    sustituciones: {
      'manzana': 'pera',
      'leche descremada': 'leche de almendras',
    },
  },
  {
    id: 46,
    nombre: 'Smoothie de mango y yogur',
    tiempo: 8,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['mango', 'yogur descremado', 'leche descremada', 'hielo', 'miel'],
    pasos: [
      'Colocar el mango en cubos, el yogur y la leche en la licuadora.',
      'Agregar hielo y miel.',
      'Licuar hasta lograr una textura suave.',
      'Servir frío.',
    ],
    sustituciones: {
      'yogur descremado': 'yogur de soja',
      'mango': 'durazno',
    },
  },
  {
    id: 47,
    nombre: 'Roll de pan integral con jamón y queso',
    tiempo: 10,
    dificultad: 'Fácil',
    categoria: 'Merienda',
    ingredientes: ['pan integral', 'jamón cocido', 'queso descremado', 'lechuga'],
    pasos: [
      'Colocar el jamón, el queso y la lechuga sobre el pan integral.',
      'Enrollar firmemente.',
      'Cortar al medio.',
      'Servir frío o tostar levemente antes de enrollar.',
    ],
    sustituciones: {
      'jamón cocido': 'pechuga de pavo',
      'queso descremado': 'queso de soja',
    },
  },
  {
    id: 48,
    nombre: 'Alfajores caseros de avena sin harina',
    tiempo: 30,
    dificultad: 'Media',
    categoria: 'Merienda',
    ingredientes: ['avena', 'huevo', 'banana', 'canela', 'dulce de leche light'],
    pasos: [
      'Pisar la banana y mezclar con la avena, el huevo y la canela.',
      'Formar pequeños discos y hornear 15 minutos a 180°C.',
      'Dejar enfriar.',
      'Unir de a dos con dulce de leche light.',
    ],
    sustituciones: {
      'dulce de leche light': 'mermelada light',
      'banana': 'manzana rallada',
    },
  },
  {
    id: 49,
    nombre: 'Pechuga de pollo al horno con vegetales asados',
    tiempo: 40,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['pechuga de pollo', 'calabaza', 'zanahoria', 'cebolla', 'aceite de oliva', 'sal', 'romero'],
    pasos: [
      'Cortar los vegetales en cubos y colocarlos en una fuente con aceite de oliva.',
      'Sazonar la pechuga con sal y romero, colocarla junto a los vegetales.',
      'Hornear 35 minutos a 200°C, dando vuelta a mitad de cocción.',
      'Servir caliente.',
    ],
    sustituciones: {
      'pechuga de pollo': 'filet de pescado',
      'calabaza': 'batata',
    },
  },
  {
    id: 50,
    nombre: 'Sopa de verduras con fideos',
    tiempo: 30,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['zanahoria', 'papa', 'apio', 'cebolla', 'caldo de verduras', 'fideos pequeños', 'sal'],
    pasos: [
      'Saltear la cebolla y el apio en una olla.',
      'Agregar el caldo, la zanahoria y la papa en cubos, cocinar 15 minutos.',
      'Incorporar los fideos y cocinar hasta que estén tiernos.',
      'Condimentar con sal y servir caliente.',
    ],
    sustituciones: {
      'fideos': 'arroz',
      'papa': 'batata',
    },
  },
  {
    id: 51,
    nombre: 'Omelette de espinaca y queso',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['huevo', 'espinaca', 'queso descremado', 'sal', 'pimienta'],
    pasos: [
      'Batir los huevos con sal y pimienta.',
      'Saltear la espinaca en una sartén hasta que se ablande.',
      'Verter el huevo batido sobre la espinaca y cocinar a fuego bajo.',
      'Agregar el queso, doblar el omelette y servir.',
    ],
    sustituciones: {
      'espinaca': 'acelga',
      'queso descremado': 'ricota',
    },
  },
  {
    id: 52,
    nombre: 'Salmón al horno con puré de calabaza',
    tiempo: 30,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['filet de salmón', 'calabaza', 'aceite de oliva', 'limón', 'sal', 'eneldo'],
    pasos: [
      'Condimentar el salmón con sal, limón y eneldo.',
      'Hornear 20 minutos a 200°C.',
      'Hervir la calabaza y hacer puré con un chorrito de aceite de oliva.',
      'Servir el salmón sobre el puré.',
    ],
    sustituciones: {
      'salmón': 'filet de merluza',
      'calabaza': 'batata',
    },
  },
  {
    id: 53,
    nombre: 'Wok de vegetales con tofu',
    tiempo: 20,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['tofu', 'morrón', 'brócoli', 'zanahoria', 'salsa de soja', 'aceite de sésamo'],
    pasos: [
      'Cortar el tofu en cubos y saltear hasta dorar.',
      'Agregar los vegetales cortados en tiras y saltear 5-7 minutos.',
      'Incorporar la salsa de soja y el aceite de sésamo.',
      'Servir caliente.',
    ],
    sustituciones: {
      'tofu': 'pollo en tiras',
      'brócoli': 'coliflor',
    },
  },
  {
    id: 54,
    nombre: 'Ensalada tibia de quinoa con vegetales',
    tiempo: 25,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['quinoa', 'morrón', 'zucchini', 'cebolla', 'aceite de oliva', 'limón', 'sal'],
    pasos: [
      'Cocinar la quinoa según las indicaciones del paquete.',
      'Saltear el morrón, el zucchini y la cebolla en aceite de oliva.',
      'Mezclar con la quinoa.',
      'Aliñar con limón y sal antes de servir.',
    ],
    sustituciones: {
      'quinoa': 'arroz integral',
      'zucchini': 'berenjena',
    },
  },
  {
    id: 55,
    nombre: 'Cazuela de lentejas con vegetales',
    tiempo: 35,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['lentejas cocidas', 'zanahoria', 'apio', 'cebolla', 'caldo de verduras', 'laurel', 'sal'],
    pasos: [
      'Saltear la cebolla, la zanahoria y el apio en una olla.',
      'Agregar las lentejas y el caldo de verduras.',
      'Incorporar la hoja de laurel y cocinar 20 minutos a fuego bajo.',
      'Condimentar con sal y servir caliente.',
    ],
    sustituciones: {
      'lentejas': 'garbanzos',
      'caldo de verduras': 'caldo de pollo',
    },
  },
  {
    id: 56,
    nombre: 'Merluza al horno con espárragos',
    tiempo: 25,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['filet de merluza', 'espárragos', 'limón', 'aceite de oliva', 'sal', 'pimienta'],
    pasos: [
      'Colocar el filet de merluza en una fuente con los espárragos.',
      'Rociar con aceite de oliva, limón, sal y pimienta.',
      'Hornear 18-20 minutos a 200°C.',
      'Servir caliente.',
    ],
    sustituciones: {
      'merluza': 'filet de salmón',
      'espárragos': 'brócoli',
    },
  },
  {
    id: 57,
    nombre: 'Revuelto de zucchini con huevo y jamón',
    tiempo: 15,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['zucchini', 'huevo', 'jamón cocido', 'cebolla', 'sal', 'pimienta'],
    pasos: [
      'Saltear la cebolla y el zucchini en cubos.',
      'Agregar el jamón cortado en tiras.',
      'Incorporar los huevos batidos y revolver hasta que cuajen.',
      'Condimentar con sal y pimienta.',
    ],
    sustituciones: {
      'jamón cocido': 'pechuga de pavo',
      'zucchini': 'berenjena',
    },
  },
  {
    id: 58,
    nombre: 'Pollo al curry con arroz integral',
    tiempo: 35,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['pechuga de pollo', 'curry en polvo', 'leche de coco', 'cebolla', 'arroz integral', 'sal'],
    pasos: [
      'Cocinar el arroz integral aparte.',
      'Saltear la cebolla y agregar el pollo en cubos hasta dorar.',
      'Incorporar el curry y la leche de coco, cocinar 15 minutos a fuego bajo.',
      'Servir sobre el arroz integral.',
    ],
    sustituciones: {
      'pollo': 'tofu',
      'leche de coco': 'leche descremada',
    },
  },
  {
    id: 59,
    nombre: 'Tarta de puerro y queso',
    tiempo: 40,
    dificultad: 'Media',
    categoria: 'Cena',
    ingredientes: ['puerro', 'huevo', 'queso descremado', 'masa integral', 'sal', 'nuez moscada'],
    pasos: [
      'Saltear el puerro hasta que esté tierno.',
      'Batir los huevos con el queso descremado y la nuez moscada.',
      'Mezclar con el puerro y volcar sobre la masa integral en un molde.',
      'Hornear 30 minutos a 190°C.',
    ],
    sustituciones: {
      'puerro': 'cebolla',
      'masa integral': 'masa de avena',
    },
  },
  {
    id: 60,
    nombre: 'Brochetas de pollo y vegetales a la plancha',
    tiempo: 25,
    dificultad: 'Fácil',
    categoria: 'Cena',
    ingredientes: ['pechuga de pollo', 'morrón', 'cebolla', 'zucchini', 'aceite de oliva', 'sal', 'orégano'],
    pasos: [
      'Cortar el pollo y los vegetales en cubos.',
      'Armar las brochetas alternando pollo y vegetales.',
      'Condimentar con aceite de oliva, sal y orégano.',
      'Cocinar a la plancha 12-15 minutos, girando ocasionalmente.',
    ],
    sustituciones: {
      'pollo': 'camarones',
      'zucchini': 'berenjena',
    },
  },
];
function toDetailRecipe(r: Receta): Recipe {
  return {
    id: String(r.id),
    name: r.nombre,
    prepTimeMinutes: r.tiempo,
    cookTimeMinutes: 0,
    servings: 4,
    difficulty: r.dificultad === 'Muy fácil' ? 'fácil' : r.dificultad.toLowerCase() as 'fácil' | 'media' | 'difícil',
    tags: [r.categoria ?? 'General'],
    ingredients: r.ingredientes.map((name, i) => ({
      id: `ing-${r.id}-${i}`,
      name,
      substitutions: r.sustituciones?.[name] ? [r.sustituciones[name]] : undefined,
    })),
    steps: r.pasos.map((desc, i) => ({
      id: `step-${r.id}-${i}`,
      description: desc,
    })),
    dietaryNotes: r.dificultad === 'Muy fácil' ? ['Rápida'] : undefined,
  };
}

/* ───────────────────────────────────────────────
   Constantes
   ─────────────────────────────────────────────── */

const CATEGORIAS = [
  { key: 'Desayuno', label: 'Desayuno', icon: Coffee },
  { key: 'Almuerzo', label: 'Almuerzo', icon: Sun },
  { key: 'Merienda', label: 'Merienda', icon: Cookie },
  { key: 'Cena', label: 'Cena', icon: Moon },
] as const;

const LS_NAME = 'smartchef_userName';
const LS_SESSION_SKIP = 'smartchef_sessionSkip';

/* ───────────────────────────────────────────────
   Componente
   ─────────────────────────────────────────────── */

export default function Inicio() {
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /* ── Onboarding ── */
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardName, setOnboardName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LS_NAME);
    const sessionSkip = sessionStorage.getItem(LS_SESSION_SKIP);
    if (stored) {
      setSavedName(stored);
    } else if (!sessionSkip) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardContinue = useCallback(() => {
    const name = onboardName.trim();
    const email = onboardEmail.trim();
    if (!name || !email) return;
    localStorage.setItem(LS_NAME, name);
    setSavedName(name);
    setShowOnboarding(false);
    console.log('📝 Datos de onboarding:', { name, email });
  }, [onboardName, onboardEmail]);

  const handleOnboardSkip = useCallback(() => {
    sessionStorage.setItem(LS_SESSION_SKIP, 'true');
    setShowOnboarding(false);
  }, []);

  /* ── Recetas filtradas por categoría ── */
  const filteredRecetas = useMemo(() => {
    if (!selectedCategory) return [];
    return DEMO_RECETAS.filter((r) => r.categoria === selectedCategory);
  }, [selectedCategory]);

  /* ── Al tocar un botón ── */
  const handleCategoryClick = useCallback((key: string) => {
    setSelectedCategory((prev) => (prev === key ? null : key));
  }, []);

  /* ── Callback estable para abrir detalle ── */
  const handleVerDetalles = useCallback((r: Receta) => {
    setDetailRecipe(toDetailRecipe(r));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* ── 1. Onboarding ── */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
              ¡Bienvenido a Smart Chef!
            </h2>
            <p className="mb-5 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              Decinos tu nombre y email para personalizar tu experiencia.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="onboard-name" className="block text-sm font-medium text-[#2D2A24] mb-1">
                  Nombre
                </label>
                <input
                  id="onboard-name"
                  type="text"
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                  style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label htmlFor="onboard-email" className="block text-sm font-medium text-[#2D2A24] mb-1">
                  Email
                </label>
                <input
                  id="onboard-email"
                  type="email"
                  value={onboardEmail}
                  onChange={(e) => setOnboardEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-[#E8DED5] bg-white px-3 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#2D2A24]/40 focus:border-[#E07A5F] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/20"
                  style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOnboardContinue}
                  disabled={!onboardName.trim() || !onboardEmail.trim()}
                  className="flex-1 rounded-lg bg-[#E07A5F] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
                  style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={handleOnboardSkip}
                  className="rounded-lg border border-[#E8DED5] bg-white px-4 py-2.5 text-sm font-medium text-[#2D2A24] transition-colors hover:bg-[#FDF6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
                  style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
                >
                  Ahora no
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Saludo ── */}
      <h1 className="text-2xl font-bold text-[#2D2A24]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {savedName ? `Hola ${savedName}, ¿qué cocinamos hoy?` : '¡Hola! ¿Qué cocinamos hoy?'}
      </h1>

      {/* ── 3. Subtítulo ── */}
      <p className="mt-1 mb-5 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
        Elegí el momento del día y los ingredientes que tenés a mano.
      </p>

      {/* ── 4. Botones de categoría ── */}
      <div className="mb-6 flex flex-wrap gap-3">
        {CATEGORIAS.map(({ key, label, icon: Icon }) => {
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryClick(key)}
              className={
                'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2 ' +
                (isActive
                  ? 'bg-[#E07A5F] text-white shadow-sm'
                  : 'bg-[#FDF6F0] text-[#2D2A24] hover:bg-[#F5EBE0] border border-[#E8DED5]')
              }
              style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          );
        })}
        {selectedCategory && (
          <button
            type="button"
            onClick={() => handleCategoryClick(selectedCategory)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#2D2A24]/50 hover:text-[#E07A5F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07A5F] focus-visible:ring-offset-2"
            style={{ minHeight: '44px', fontFamily: 'Inter, sans-serif' }}
          >
            <X size={16} aria-hidden="true" />
            Quitar filtro
          </button>
        )}
      </div>

      {/* ── 5. Grid de recetas o mensaje vacío ── */}
      {!selectedCategory ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm py-20 text-center">
          <Coffee size={40} className="text-[#2D2A24]/20 mb-3" aria-hidden="true" />
          <p className="text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            Elegí un momento del día para ver recetas
          </p>
        </div>
      ) : filteredRecetas.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            {filteredRecetas.length} receta{filteredRecetas.length !== 1 ? 's' : ''} encontrada
            {filteredRecetas.length !== 1 ? 's' : ''} · {selectedCategory}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecetas.map((receta) => (
              <RecipeCard
                key={receta.id}
                receta={receta}
                onVerDetalles={handleVerDetalles}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm py-16 text-center">
          <p className="text-sm text-[#2D2A24]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
            No hay recetas para {selectedCategory}. ¡Pronto agregaremos más!
          </p>
        </div>
      )}

      {/* Modal de detalle */}
      {detailRecipe && (
        <RecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
        />
      )}
    </main>
  );
}