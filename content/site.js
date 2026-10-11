// Informações comerciais da Kollect.
//
// Preencha somente dados reais. Um canal vazio não aparece no site.
// Sem nenhum canal de atendimento, `npm run check` falha para evitar
// publicar o site sem um caminho de compra.

export const site = {
  name: 'Kollect',
  tagline: 'Kollect Your World',
  description:
    'Figures, Funkos, peças 3D e colecionáveis para dar presença às histórias que fazem parte de você.',
  // Domínio final, sem barra no fim (ex.: "https://kollect.com.br"). Usado nas metatags.
  url: '',

  contact: {
    // Somente números, com DDI e DDD.
    whatsapp: '5511932085937',
    // Usuário do Instagram, sem @.
    instagram: 'kollectbr',
    email: '',
  },

  // Loja virtual (Nuvemshop). Com `false`, o site não mostra a loja, seus produtos,
  // preços e links; as peças restantes são vendidas por consulta.
  storeEnabled: false,

  // Onde comprar. A loja virtual recebe os botões "Comprar" do catálogo.
  shops: {
    store: 'https://kollectbr2.lojavirtualnuvem.com.br/',
    shopee: 'https://shopee.com.br/shop/542425235',
    mercadolivre: 'https://lista.mercadolivre.com.br/_CustId_253273025',
  },

  social: {
    tiktok: 'https://www.tiktok.com/@kollectbr',
  },

  // Etapas da encomenda. Ajuste o texto para refletir exatamente como a loja trabalha.
  orderSteps: [
    {
      title: 'Conte qual peça você procura',
      text: 'Mande o nome do personagem, a linha ou uma imagem de referência.',
    },
    {
      title: 'Receba as condições',
      text: 'A Kollect informa disponibilidade, valor e prazo da peça consultada.',
    },
    {
      title: 'Confirme o pedido',
      text: 'Com tudo combinado, o pedido segue pelo mesmo canal de atendimento.',
    },
  ],

  // Políticas publicadas pela loja. `store: true` = página hospedada na loja virtual.
  policies: [
    { label: 'Política de privacidade', href: 'https://kollectbr2.lojavirtualnuvem.com.br/politica-de-privacidade/', store: true },
  ],
};
