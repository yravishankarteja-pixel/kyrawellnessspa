const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, 'public');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const siteUrl = (process.env.SITE_URL || 'https://kyrawellnessandspa.com').replace(/\/$/, '');

http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(publicDir, relativePath);
  if (!filePath.startsWith(publicDir + path.sep) && filePath !== path.join(publicDir, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (error, data) => {
    if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); return res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); }
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
    if (path.extname(filePath).toLowerCase() === '.html') {
      let page = data.toString();
      const imageMap = {
        'assets/thai.jpg" alt="Balinese': 'assets/balinese-massage.png" alt="Balinese',
        'assets/aromatherapy.jpg" alt="Candle': 'assets/candle-therapy.png" alt="Candle',
        'assets/aromatherapy.jpg" alt="Aroma': 'assets/aroma-therapy.png" alt="Aroma',
        'assets/deep-tissue.jpg" alt="Deep': 'assets/deep-tissue.png" alt="Deep',
        'assets/swedish.jpg" alt="Swedish': 'assets/swedish-massage.png" alt="Swedish',
        'assets/deep-tissue.jpg" alt="Signature': 'assets/signature-massage.png" alt="Signature',
        'assets/thai.jpg" alt="Dry': 'assets/dry-thai.png" alt="Dry',
        'assets/foot-massage.jpg" alt="Body reflexology': 'assets/reflexology.png" alt="Body reflexology',
        'assets/aromatherapy.jpg" alt="Body spa': 'assets/body-spa.png" alt="Body spa',
        'assets/aromatherapy.jpg" alt="Premium': 'assets/premium-body-spa.png" alt="Premium',
        'assets/deep-tissue.jpg" alt="Hot': 'assets/hot-oil.png" alt="Hot',
        'assets/jacuzzi.jpg" alt="Jacuzzi': 'assets/jacuzzi-therapy.png" alt="Jacuzzi'
      };
      for (const [from, to] of Object.entries(imageMap)) page = page.replace(from, to);
      page = page.replace('<section class="intro">', '<section class="intro"><img class="intro-orchid" src="assets/orchid-spa-elements.jpg" alt="Orchid and spa stones">');
      page = page.replace('src="assets/foot-massage.jpg" alt="Relaxing foot massage"', 'src="assets/kyra-sanctuary-hero.png" alt="Buddha statue in Kyra’s sanctuary"');
      page = page.replace('href="#rituals">Explore our rituals', 'href="https://wa.me/919392939602?text=Hello%20Kyra%20Wellness%20%26%20Spa%2C%20I%20would%20like%20to%20book%20an%20appointment.">Book an appointment');
      page = page.replaceAll('href="#visit">Discover ritual ↗', 'href="tel:+919392939602">Call now ↗').replaceAll('href="#visit">Book this ritual', 'href="tel:+919392939602">Call now ↗');
      page = page.replace('</head>', '<style>.intro:before,.intro:after{display:none}.intro{background:#fffafc!important;position:relative;overflow:hidden}.intro-orchid{position:absolute;right:-5%;bottom:-36%;z-index:-1;width:min(590px,47vw);opacity:.34;mix-blend-mode:multiply;filter:saturate(.72)}.intro h2 em,.section-head h2 em{color:#ff91c2}.intro .eyebrow{color:#f24e91}.intro .note b{color:#f24e91}@media(max-width:700px){.intro-orchid{right:-40%;bottom:-16%;width:520px;opacity:.2}}</style></head>');
      page = page.replace('</head>', '<style>.intro{background:radial-gradient(circle at 88% 18%,#ffe0ef 0,transparent 25%),linear-gradient(115deg,#fffdfa,#fff2f8)}.intro:before{display:none}.intro:after{background:linear-gradient(90deg,#fff0f7,#fff9fc);border-top-color:#f5b9d6}.intro h2 em{color:#f04d96;text-shadow:0 7px 18px #f7a2c944}.intro .eyebrow,.intro .note b{color:#ee3f8c}.intro .note{border-left-color:#ee3f8c}</style></head>');
      const seo = `<link rel="canonical" href="${siteUrl}/"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:site_name" content="Kyra Wellness & Spa"><meta property="og:title" content="Kyra Wellness & Spa | Premium relaxation in Vizag"><meta property="og:description" content="Premium massage, body spa and hydrotherapy rituals in Madhurawada, Visakhapatnam."><meta property="og:url" content="${siteUrl}/"><meta property="og:image" content="${siteUrl}/assets/kyra-sanctuary-hero.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Kyra Wellness & Spa | Premium relaxation in Vizag"><meta name="twitter:description" content="Premium massage, body spa and hydrotherapy rituals in Madhurawada, Visakhapatnam."><script type="application/ld+json">{"@context":"https://schema.org","@type":"DaySpa","name":"Kyra Wellness & Spa","url":"${siteUrl}/","logo":"${siteUrl}/assets/kyra-spa-logo.jpeg","image":"${siteUrl}/assets/kyra-sanctuary-hero.png","telephone":"+919392939602","address":{"@type":"PostalAddress","streetAddress":"301, 2nd Floor, PNB Complex, Car Shed Junction, PM Palem Main Road, Madhurawada","addressLocality":"Visakhapatnam","addressRegion":"Andhra Pradesh","postalCode":"530041","addressCountry":"IN"},"areaServed":"Visakhapatnam","priceRange":"₹₹","hasOfferCatalog":{"@type":"OfferCatalog","name":"Wellness rituals","itemListElement":[{"@type":"Offer","itemOffered":{"@type":"Service","name":"Thai Massage"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Aroma Therapy"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Deep Tissue Massage"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Jacuzzi Therapy"}}]}}</script>`;
      page = page.replace('</head>', `${seo}</head>`);
      page = page.replace('</head>', '<style>:root{--dark:#080507;--ink:#1c1118;--paper:#fff7fb;--gold:#ee3f8c;--light:#ff9cca;--line:#f5ccdf;--muted:#75626b}.card a{background:linear-gradient(100deg,#e32f7d,#ff69aa);padding:9px 15px;border-radius:999px;color:#fff;border:0}.gold{background:linear-gradient(100deg,#df2c78,#ff69aa)}.intro,.rituals,.experience,.visit{padding-top:68px;padding-bottom:68px}.intro{position:relative;isolation:isolate;overflow:hidden}.intro:before{content:"";position:absolute;z-index:-1;inset:0;background:url("assets/kyra-sanctuary-hero.png") right 49%/min(420px,38vw) auto no-repeat;opacity:.09;filter:grayscale(1) contrast(.85)}.section-head{margin-bottom:34px}.card{min-height:405px}.experience{padding-top:76px;padding-bottom:76px;background:radial-gradient(circle at 14% 20%,#371326 0,transparent 32%),#10090e}.experience h2,.experience b,.experience .exp-grid li strong{color:#fff}.experience .exp-grid>div>p:not(.eyebrow),.experience .exp-grid li span{color:#e6d7df}.experience .eyebrow,.experience .exp-grid li>b{color:#ff82b8}.experience .exp-image img{object-position:center 44%;filter:brightness(.62) saturate(.9)}.visit{background:linear-gradient(118deg,#230b1a,#0b070a);color:#fff}.visit h2{color:#fff;font-size:clamp(2.35rem,3.6vw,4rem)}.visit-grid>div>p:not(.eyebrow),.visit small{color:#eddce5}.visit .eyebrow{color:#ff83b8}.visit .phone{color:#fff}.foot{min-height:130px}.foot p{color:#d5c5cd}.foot>a:last-child{color:#ff9fc8}</style></head>');
      data = Buffer.from(page);
    }
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () => console.log(`Kyra Spa is running at http://localhost:${process.env.PORT || 3000}`));
