export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({ ok:true, service:'NCA Study Hub cloud backup', version:'0.3.0' });
}
