const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const publicDir = path.join(__dirname, 'public');
const mimeTypes = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.xml':'application/xml; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
const compressible = new Set(['.html', '.css', '.js', '.txt', '.xml', '.svg']);
const siteUrl = 'https://kyraspaandwellness.com';

http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(publicDir, relativePath);
  if (!filePath.startsWith(`${publicDir}${path.sep}`)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (error, data) => {
    if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); return res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); }
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.html') {
      let html = data.toString()
        .replace(/assets\/([A-Za-z0-9-]+)\.png/g, 'assets/$1.webp')
        .replace('src="assets/${s[2]}"', 'src="assets/${s[2].replace(\'.png\', \'.webp\')}"');
      html = html
        .replace('Kyra Wellness & Spa | Premium Spa in Madhurawada, Vizag', 'Kyra Wellness & Spa | Spa in Madhurawada, Vizag')
        .replace('Kyra Wellness & Spa in Madhurawada, Visakhapatnam: professional massage, Foot Therapy, Herbal Potli Massage and Jacuzzi wellness experiences. Call or WhatsApp to check availability.', 'Visit Kyra Wellness & Spa in Madhurawada, Vizag for Deep Tissue, Thai, Swedish, Aromatherapy, Foot Therapy and Jacuzzi wellness. Call or WhatsApp to check availability.')
        .replace('Premium wellness spa · Madhurawada, Vizag', 'Premium Wellness Spa • Madhurawada, Visakhapatnam')
        .replace('Looking for the <em>Best Spa Near You</em> in Vizag?', 'Spa in Madhurawada, Vizag – <em>Massage & Jacuzzi Wellness</em>')
        .replace('Relax, recharge and unwind at Kyra Wellness &amp; Spa in Madhurawada, Visakhapatnam. Choose professional massage, foot therapy, herbal potli massage and Jacuzzi &amp; Hydrotherapy in a calm, comfortable setting.', 'Relax, recharge and unwind at Kyra Wellness &amp; Spa near PM Palem and Car Shed Junction. Explore professional massage therapies, Jacuzzi wellness and relaxing spa experiences in a clean, comfortable setting.<br><strong>Deep Tissue • Traditional Thai • Swedish • Aromatherapy • Foot Therapy • Jacuzzi</strong>')
        .replace('Appointments recommended. Contact our team to check today’s availability.', 'Appointments Recommended • Contact Us for Today’s Availability')
        .replace('fetchpriority="high"', 'loading="eager" fetchpriority="high" decoding="async"')
        .replaceAll('loading="lazy"', 'loading="lazy" decoding="async"');
      const seo = `<link rel="canonical" href="${siteUrl}/"><meta name="robots" content="index,follow"><meta property="og:type" content="website"><meta property="og:url" content="${siteUrl}/"><meta property="og:title" content="Kyra Wellness & Spa | Spa in Madhurawada, Vizag"><meta property="og:description" content="Visit Kyra Wellness & Spa in Madhurawada, Vizag for massage and Jacuzzi wellness."><script type="application/ld+json">{"@context":"https://schema.org","@type":"DaySpa","name":"Kyra Wellness & Spa","url":"${siteUrl}/","telephone":"+919392939602","image":"${siteUrl}/assets/herbal-potli-massage.webp","priceRange":"₹₹","address":{"@type":"PostalAddress","streetAddress":"301, 2nd Floor, PNB Complex, Car Shed Junction, PM Palem Main Road, Madhurawada, Potinamallayyapalem","addressLocality":"Visakhapatnam","addressRegion":"Andhra Pradesh","postalCode":"530041","addressCountry":"IN"}}</script><style>.hero>img{content:url('assets/herbal-potli-massage.webp');object-position:center}.services-grid #candle,.services-grid #balinese,.services-grid #signature,.services-grid #dry,.services-grid #reflexology,.services-grid #body-spa,.services-grid #premium,.services-grid #hot-oil{display:none}.hero-copy strong{display:block;color:#ffd1e4;margin-top:15px;font-size:.88rem;letter-spacing:.04em}@media(max-width:560px){.hero-copy strong{font-size:.75rem}}</style>`;
      html = html.replace('</head>', `${seo}</head>`);
      data = Buffer.from(html);
    }
    const headers = { 'Content-Type': mimeTypes[extension] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin', 'X-Frame-Options':'SAMEORIGIN', 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' };
    const acceptsBrotli = (req.headers['accept-encoding'] || '').includes('br');
    const acceptsGzip = (req.headers['accept-encoding'] || '').includes('gzip');
    if (compressible.has(extension) && acceptsBrotli) { headers['Content-Encoding'] = 'br'; headers.Vary = 'Accept-Encoding'; res.writeHead(200, headers); return zlib.brotliCompress(data, (err, output) => res.end(err ? data : output)); }
    if (compressible.has(extension) && acceptsGzip) { headers['Content-Encoding'] = 'gzip'; headers.Vary = 'Accept-Encoding'; res.writeHead(200, headers); return zlib.gzip(data, (err, output) => res.end(err ? data : output)); }
    res.writeHead(200, headers); res.end(data);
  });
}).listen(process.env.PORT || 3000, () => console.log(`Kyra Spa is running at http://localhost:${process.env.PORT || 3000}`));
