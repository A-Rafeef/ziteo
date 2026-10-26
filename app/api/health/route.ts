export function GET() {
  return Response.json({status:'ok',service:'ziteo'}, {headers:{'Cache-Control':'no-store'}});
}
