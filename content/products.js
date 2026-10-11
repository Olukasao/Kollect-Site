// Catálogo da Kollect.
//
// O site junta três origens:
//   featured  Peças fotografadas pela Kollect e publicadas no Instagram (seção "Peças em destaque").
//   extras    Peças das artes da Kollect que não estão na loja virtual (consulta pelo WhatsApp).
//   loja      Produtos da loja virtual, sincronizados em content/store.json (npm run sync)
//             e classificados em content/store-overrides.js.
//
// Preencha apenas dados confirmados pela loja. Campos com `null` não aparecem no site.
//   manufacturer  Fabricante (ex.: "Banpresto").
//   origin        "oficial" | "customizada" | "impressa-3d" | null
//   scale         Escala (ex.: "1/12").   height: altura (ex.: "24 cm").
//   note          Detalhe curto confirmado (ex.: "Iluminação em LED").
//   price         Número em reais. null = valor sob consulta.
//   availability  "pronta-entrega" | "encomenda" | "esgotado" | null
//
// `image.source` é relativo a assets/. `image.crop` remove a assinatura das artes 4:5:
// "bottom" ou "top"; "none" mantém a foto inteira. Depois de trocar fotos, rode `npm run images`.

// Universos com `cover` viram blocos visuais em "Explore por universo"; os demais aparecem na lista.
export const universes = {
  'demon-slayer': {
    name: 'Demon Slayer',
    cover: { source: 'instagram/DZqv7PPDrYj-01.jpg', crop: 'bottom' },
    alt: 'Figure de Akaza em salto, com efeitos azuis nas mãos, diante de uma rua iluminada por lanternas.',
  },
  'stranger-things': {
    name: 'Stranger Things',
    cover: { source: 'store/demogorgon-croche-1.webp', crop: 'none' },
    alt: 'Demogorgon com efeito crochê em uma floresta escura com neve.',
  },
  marvel: {
    name: 'Marvel',
    cover: { source: 'store/action-figure-spider-man-21cm-1.webp', crop: 'none' },
    alt: 'Action figure do Spider-Man agachado em uma rua de cidade à noite.',
  },
  'dragon-ball': { name: 'Dragon Ball' },
  'harry-potter': { name: 'Harry Potter' },
  'lilo-stitch': { name: 'Lilo & Stitch' },
  'cavaleiros-do-zodiaco': { name: 'Cavaleiros do Zodíaco' },
  'one-piece': { name: 'One Piece' },
  pokemon: { name: 'Pokémon' },
  terror: { name: 'Terror' },
  'attack-on-titan': { name: 'Attack on Titan' },
  frieren: { name: 'Frieren' },
  dc: { name: 'DC' },
  'ayrton-senna': { name: 'Ayrton Senna' },
  'como-treinar-o-seu-dragao': { name: 'Como Treinar o Seu Dragão' },
  futebol: {
    name: 'Futebol',
    cover: { source: 'source/taca-copa.png', crop: 'bottom' },
    alt: 'Réplica dourada da taça da Copa do Mundo no gramado de um estádio com bandeiras do Brasil.',
  },
};

// Ordem em que os tipos aparecem nos filtros e no catálogo.
export const types = {
  figure: { name: 'Figures' },
  funko: { name: 'Funkos' },
  chibi: { name: 'Chibis' },
  'peca-3d': { name: 'Peças 3D' },
  articulado: { name: 'Articulados' },
};

const base = {
  manufacturer: null,
  origin: null,
  scale: null,
  height: null,
  note: null,
  price: null,
  availability: null,
};

export const featured = [
  {
    ...base,
    slug: 'zenitsu-grandista-another',
    name: 'Zenitsu Agatsuma',
    universe: 'demon-slayer',
    line: 'Grandista Another Ver.',
    type: 'figure',
    height: '24 cm',
    image: { source: 'instagram/DcrRdyGGnUx-01.jpg', crop: 'bottom' },
    alt: 'Figure de Zenitsu Agatsuma em pé, com o haori amarelo de triângulos brancos e a espada na cintura, diante de lanternas desfocadas.',
  },
  {
    ...base,
    slug: 'akaza-koyuki',
    name: 'Akaza & Koyuki',
    universe: 'demon-slayer',
    line: 'Figure em base',
    type: 'figure',
    height: '26 cm',
    image: { source: 'instagram/DZezBc9Dhcv-01.jpg', crop: 'bottom' },
    alt: 'Figure de Akaza ajoelhado diante de Koyuki, de quimono rosa, sobre base escura em um jardim com neve.',
  },
  {
    ...base,
    slug: 'zenitsu-estatua-gk',
    name: 'Zenitsu Agatsuma',
    universe: 'demon-slayer',
    line: 'Estátua GK Edição Limitada',
    type: 'figure',
    height: '28 cm',
    note: 'Iluminação em LED',
    image: { source: 'instagram/DcrPzJQmt9N-01.jpg', crop: 'bottom' },
    alt: 'Estátua de Zenitsu Agatsuma em investida com a espada, envolto em chamas amarelas e laranja sobre a base.',
  },
  {
    ...base,
    slug: 'akaza-figure-realista',
    name: 'Akaza',
    universe: 'demon-slayer',
    line: 'Figure realista',
    type: 'figure',
    height: '28 a 30 cm',
    image: { source: 'instagram/DZqun9LjnBg-01.jpg', crop: 'bottom' },
    alt: 'Figure realista de Akaza em pé sobre base hexagonal, com as marcas azuis pelo corpo e o cabelo rosa.',
  },
  {
    ...base,
    slug: 'akaza-efeitos',
    name: 'Akaza',
    universe: 'demon-slayer',
    line: 'Figure com efeitos',
    type: 'figure',
    image: { source: 'instagram/DZqv7PPDrYj-01.jpg', crop: 'bottom' },
    alt: 'Figure de Akaza em salto, com efeitos azuis em forma de cristal nas mãos, sobre base hexagonal.',
  },
  {
    ...base,
    slug: 'eren-mikasa',
    name: 'Eren & Mikasa',
    universe: 'attack-on-titan',
    line: 'Figure em base',
    type: 'figure',
    height: '22 cm',
    image: { source: 'instagram/DZeL_8nDnHI-01.jpg', crop: 'bottom' },
    alt: 'Figure de Eren e Mikasa abraçados, com o cachecol vermelho e um pássaro branco na base.',
  },
  {
    ...base,
    slug: 'frieren-himmel',
    name: 'Frieren & Himmel',
    universe: 'frieren',
    line: 'Par de figures',
    type: 'figure',
    image: { source: 'instagram/DZeIdMFjieS-01.jpg', crop: 'bottom' },
    alt: 'Figures de Frieren, de vestido branco, e Himmel, de terno preto, de mãos dadas, cada um sobre sua base redonda.',
  },
];

export const extras = [
  {
    ...base,
    slug: 'tanjiro-kamado-sentado',
    name: 'Tanjiro Kamado',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/tanjiro-sentado.png', crop: 'bottom' },
    alt: 'Figure de Tanjiro Kamado sentado de pernas cruzadas, sorrindo, com um onigiri na mão e o haori xadrez verde e preto.',
  },
  {
    ...base,
    slug: 'kyojuro-rengoku-sentado',
    name: 'Kyojuro Rengoku',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/rengoku-sentado.png', crop: 'bottom' },
    alt: 'Figure de Kyojuro Rengoku sentado, segurando um onigiri em cada mão, com capa branca e chamas pintadas nas perneiras.',
  },
  {
    ...base,
    slug: 'nezuko-kamado-sentada',
    name: 'Nezuko Kamado',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/nezuko-sentada.png', crop: 'bottom' },
    alt: 'Figure de Nezuko Kamado sentada em um banco de madeira, com o bambu na boca e outro nas mãos.',
  },
  {
    ...base,
    slug: 'zenitsu-agatsuma-sentado',
    name: 'Zenitsu Agatsuma',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/zenitsu-sentado.png', crop: 'bottom' },
    alt: 'Figure de Zenitsu Agatsuma sentado na varanda, rindo de olhos fechados enquanto segura um onigiri.',
  },
  {
    ...base,
    slug: 'shinobu-kocho-sentada',
    name: 'Shinobu Kocho',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/shinobu-sentada.png', crop: 'bottom' },
    alt: 'Figure de Shinobu Kocho sentada sobre um telhado, com o haori de borboleta e um onigiri nas mãos.',
  },
  {
    ...base,
    slug: 'inosuke-hashibira-sentado',
    name: 'Inosuke Hashibira',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/inosuke-sentado.png', crop: 'bottom' },
    alt: 'Figure de Inosuke Hashibira sentado sobre um tatame, com as duas espadas serrilhadas e a máscara de javali ao lado.',
  },
  {
    ...base,
    slug: 'mitsuri-kanroji-sentada',
    name: 'Mitsuri Kanroji',
    universe: 'demon-slayer',
    line: 'Série Sentados',
    type: 'figure',
    image: { source: 'source/mitsuri-sentada.png', crop: 'top' },
    alt: 'Figure de Mitsuri Kanroji sentada na beira da varanda, com as tranças rosa e verde e um mochi na mão.',
  },
  {
    ...base,
    slug: 'obanai-iguro-chibi',
    name: 'Obanai Iguro',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-obanai.png', crop: 'bottom' },
    alt: 'Chibi de Obanai Iguro sentado com a cobra Kaburamaru no ombro, ao lado da caixa da coleção.',
  },
  {
    ...base,
    slug: 'sanemi-shinazugawa-chibi',
    name: 'Sanemi Shinazugawa',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-sanemi.png', crop: 'bottom' },
    alt: 'Chibi de Sanemi Shinazugawa com cabelo branco e expressão brava, sobre base verde.',
  },
  {
    ...base,
    slug: 'mitsuri-kanroji-chibi',
    name: 'Mitsuri Kanroji',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-mitsuri.png', crop: 'bottom' },
    alt: 'Chibi de Mitsuri Kanroji sorrindo, com as tranças rosa e verde, sobre base verde.',
  },
  {
    ...base,
    slug: 'nezuko-kamado-chibi',
    name: 'Nezuko Kamado',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-nezuko.png', crop: 'bottom' },
    alt: 'Chibi de Nezuko Kamado sentada com o bambu na boca e flores vermelhas no cabelo, diante de uma caixa de madeira.',
  },
  {
    ...base,
    slug: 'zenitsu-agatsuma-chibi',
    name: 'Zenitsu Agatsuma',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-zenitsu.png', crop: 'bottom' },
    alt: 'Chibi de Zenitsu Agatsuma sorrindo com flores brancas nas mãos, sobre base verde.',
  },
  {
    ...base,
    slug: 'inosuke-hashibira-chibi',
    name: 'Inosuke Hashibira',
    universe: 'demon-slayer',
    line: 'Chibi mini',
    type: 'chibi',
    image: { source: 'source/chibi-inosuke.png', crop: 'bottom' },
    alt: 'Chibi de Inosuke Hashibira com a máscara de javali na cabeça, em posição de ataque com a espada.',
  },
  {
    ...base,
    slug: 'charizard',
    name: 'Charizard',
    universe: 'pokemon',
    line: 'Linha Pokémon',
    type: 'figure',
    image: { source: 'source/charizard.png', crop: 'bottom' },
    alt: 'Figure de Charizard de asas abertas sobre uma rocha, com lava e um vulcão ao fundo.',
  },
  {
    ...base,
    slug: 'pikachu',
    name: 'Pikachu',
    universe: 'pokemon',
    line: 'Linha Pokémon',
    type: 'figure',
    image: { source: 'source/pikachu.png', crop: 'bottom' },
    alt: 'Figure de Pikachu acenando, em uma floresta iluminada pelo sol.',
  },
  {
    ...base,
    slug: 'taca-copa-do-mundo',
    name: 'Taça da Copa do Mundo',
    universe: 'futebol',
    line: 'Réplica decorativa',
    type: 'peca-3d',
    image: { source: 'source/taca-copa.png', crop: 'bottom' },
    alt: 'Réplica dourada da taça da Copa do Mundo com faixas verdes na base, sobre um gramado de estádio.',
  },
  {
    ...base,
    slug: 'porta-lata-brasil',
    name: 'Porta-lata Brasil',
    universe: 'futebol',
    line: 'Edição Brasil',
    type: 'peca-3d',
    image: { source: 'source/porta-lata-brasil.png', crop: 'bottom' },
    alt: 'Porta-lata dourado com alça, garras recortadas na lateral e faixas verdes com a gravação Kollect.',
  },
];

// Seção TCG: cartas holográficas ilustrativas feitas com artes da Kollect.
// preset: 'bursts' | 'stars' | 'shards' | 'cosmos' | 'rainbow' | 'swirl' | 'glitter' | 'gold'
// intensity: 0 (sem foil) a 1. Valores menores preservam mais a arte.
export const tcg = {
  back: { source: 'source/kollect-your-world.png', alt: 'Verso da carta com a marca Kollect Your World.' },
  cards: [
    { id: 'charizard', name: 'Charizard', source: 'source/charizard.png', preset: 'stars', foilColor: '#f3c27a', intensity: 0.6 },
    { id: 'pikachu', name: 'Pikachu', source: 'source/pikachu.png', preset: 'bursts', foilColor: '#ffffff', intensity: 0.6 },
  ],
};

// "Coleciona algo? Aqui você encontra." Categorias da bio do Instagram (@kollectbr), em caixas.
//   size: 'lg' ocupa 2×2 na grade do desktop.
//   link: '#catalogo?tipo=…' filtra o catálogo; 'consulta' abre o WhatsApp com a categoria; '#tcg' vai à seção.
//   note: frase curta e verdadeira sobre a categoria.
export const categories = [
  {
    id: 'figures',
    name: 'Figures',
    note: 'Estátuas, figures em base e linhas completas.',
    size: 'lg',
    link: '?tipo=figure#catalogo',
    image: { source: 'instagram/DZqun9LjnBg-02.jpg', crop: 'bottom' },
    alt: 'Figures de Gyutaro, Akaza e Inosuke, de Demon Slayer, em pé sobre bases octogonais, com caixas de outras figures ao fundo.',
  },
  {
    id: 'funkos',
    name: 'Funkos',
    note: 'Pop! de anime, séries e filmes.',
    link: 'consulta',
    image: { source: 'store/funko-pop-zenitsu-agatsuma-demon-slayer-1.webp', crop: 'none' },
    alt: 'Funko Pop do Zenitsu Agatsuma, de Demon Slayer, ao lado da caixa.',
    light: true,
  },
  {
    id: 'pecas-3d',
    name: 'Peças 3D',
    note: 'Peças impressas e réplicas.',
    link: '?tipo=peca-3d#catalogo',
    image: { source: 'source/porta-lata-brasil.png', crop: 'bottom' },
    alt: 'Porta-lata dourado com garras recortadas e faixas verdes com a gravação Kollect.',
  },
  {
    id: 'tcg',
    name: 'TCG',
    note: 'Cartas e coleções sob consulta.',
    link: '#tcg',
    image: { source: 'source/charizard.png', crop: 'bottom' },
    alt: 'Figure do Charizard de asas abertas sobre rocha, com lava ao fundo.',
  },
  {
    id: 'diecast',
    name: 'Diecast',
    note: 'Miniaturas de carros sob consulta.',
    link: 'consulta',
    image: { source: 'source/kollect-eventos-carros-recorte.png', crop: 'none' },
    alt: 'Carros esportivos estacionados em um encontro automotivo com a marca Kollect.',
  },
];

// Linha apresentada em galeria horizontal (as peças vêm de `extras`, pela linha).
export const series = {
  line: 'Série Sentados',
  title: 'Série Sentados',
  intro: 'Os personagens de Demon Slayer em pausa, cada um com o seu cenário.',
};

// Filme da marca (motion "Kollect Your World", v1 de 16 s). Fontes em assets/video; rode `npm run video`.
export const film = {
  name: 'kollect-your-world',
  posterAt: 1.8,
  // Segundo em que o filme mostra "Colecione seu mundo."; o título do hero sai de cena até o loop recomeçar.
  taglineFrom: 14.3,
  description:
    'Animação da marca Kollect Your World: o O de WORLD vira um globo, uma Pokébola, um pneu, um bloco de Minecraft e uma bola de futebol, e termina com a frase Colecione seu mundo.',
  formats: {
    wide: { source: 'video/kollect-your-world-v1_16x9.mp4', width: 1920, height: 1080 },
    tall: { source: 'video/kollect-your-world-v1_9x16.mp4', width: 1080, height: 1920 },
  },
};

// Página 404: cena desfocada ao fundo e a figure nítida em primeiro plano.
// region: recorte da figure no arquivo original (1080 × 1350).
export const notFound = {
  source: 'source/tanjiro-sentado.png',
  region: { left: 90, top: 200, width: 920, height: 1040 },
  alt: 'Figure de Tanjiro Kamado sentado sozinho em uma floresta azul, sob uma luz fria.',
};

// Peça do hero e peça da seção "Uma peça, todos os detalhes".
export const heroSlug = 'zenitsu-grandista-another';
export const spotlight = {
  slug: 'akaza-koyuki',
  intro: 'Figure de 26 cm. De perto, a escultura e a pintura mostram o que a foto inteira não alcança.',
  // Recortes de fotos da mesma peça (coordenadas em pixels no arquivo original).
  details: [
    {
      id: 'koyuki',
      title: 'Rosto e penteado',
      text: 'O coque de Koyuki é esculpido em camadas, com o pente laranja e os olhos em rosa.',
      source: 'instagram/DZeyql8DlX_-03.jpg',
      region: { left: 1500, top: 0, width: 1400, height: 1400 },
    },
    {
      id: 'quimono',
      title: 'Pintura do quimono',
      text: 'Flores brancas e folhas pretas sobre o degradê de rosa para azul, com as bolinhas do tecido.',
      source: 'instagram/DZeyql8DlX_-03.jpg',
      region: { left: 1000, top: 2500, width: 1300, height: 1300 },
    },
    {
      id: 'akaza',
      title: 'Akaza de costas',
      text: 'O kanji 素 nas costas e o cabelo em pontas, do preto ao rosa.',
      source: 'instagram/DZezBc9Dhcv-02.jpg',
      region: { left: 0, top: 620, width: 1080, height: 608 },
    },
  ],
};
