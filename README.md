# Kollect — site

**🌐 Acesse o site: [kollect-site.vercel.app](https://kollect-site.vercel.app)**

Site estático da Kollect. O HTML é gerado a partir dos arquivos em `content/`, sem framework.

## Comandos

```bash
npm install
npm run sync     # atualiza preço, estoque e fotos a partir da loja virtual (Nuvemshop)
npm run video    # gera as versões web do filme da marca (requer ffmpeg)
npm run images   # gera public/img a partir de assets/ (rode depois do sync ou ao trocar fotos)
npm run dev      # gera dist/ e abre em http://localhost:4173
npm run check    # build + validação de conteúdo + html-validate
npm run shots    # capturas desktop/tablet/celular em screenshots/ (usa o Edge instalado)
```

Para publicar, envie o conteúdo de `dist/` para qualquer hospedagem estática. O `dist/404.html` usa caminhos
absolutos (`/img/...`), então o site precisa estar na raiz do domínio; Netlify, Vercel, Cloudflare Pages e
GitHub Pages servem esse arquivo automaticamente em endereços inexistentes.

### Vercel

O `vercel.json` já configura tudo (instalação `npm ci`, build `npm run build`, saída `dist/`).
Em vercel.com: **Add New → Project**, importe o repositório `olukasao/kollect-site` e clique em **Deploy**,
sem mudar nada. Cada push na branch principal publica de novo; outras branches geram links de prévia.
Depois de ter o domínio, preencha `url` em `content/site.js`.

## Onde editar

- `content/site.js`: canais de atendimento (WhatsApp, Instagram, e-mail, Shopee), etapas da encomenda, políticas e domínio.
- `content/products.js`: destaques do Instagram, peças das artes, universos, hero e seção de detalhes.
- `content/store.json`: dados da loja virtual, gerados por `npm run sync` (não edite à mão).
- `content/store-overrides.js`: nome de exibição, universo e tipo de cada produto da loja.
- `src/styles.css` e `src/main.js`: visual e interações.
- `src/blur-reveal.js`: revelação de texto com desfoque. Marque o elemento com `data-blur-reveal` (ao carregar) ou `data-blur-reveal="view"` (ao rolar).
- `src/holo-card.js` e `src/holo-card.css`: cartas holográficas da seção TCG.
- `assets/video`: filme "Kollect Your World" v1 (16:9 e 9:16), exibido no hero, vindo de motion-studio. Configurado em `film`, em `content/products.js`.
- `public/fonts`: fonte Archivo (variável, licença SIL OFL em `OFL.txt`), servida pelo próprio site.
- `src/404.css` e `src/404.js`: página de erro 404.
- `scripts/build.mjs`: estrutura do HTML.

Campos sem informação confirmada ficam `null` e não aparecem no site. Não preencha preço,
disponibilidade, fabricante ou origem (oficial, customizada, impressa em 3D) sem confirmação.

## Fotos

- `assets/instagram`: fotos dos posts de @kollectbr.
- `assets/store`: fotos baixadas da loja virtual.
- `assets/source`: artes da Kollect e logo.


Os originais ficam em `assets/source` (artes 1080 × 1350 da Kollect). O script remove a assinatura
"KOLLECT | YOUR WORLD" com um recorte 8:9 (`image.crop`: `"bottom"` ou `"top"`).
