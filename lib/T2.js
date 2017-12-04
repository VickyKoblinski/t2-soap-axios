require('dotenv').config();

const auth = {
  version: '1.0',
  username: process.env.T2_USERNAME,
  password: process.env.T2_PASSWORD
};

soapWrapper = (action, body) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${action} xmlns="http://www.t2systems.com/">
      ${body}
    </${action}>
  </soap:Body>
</soap:Envelope>`;

const soapBody = `
  <version>${auth.version}</version>
  <username>${auth.username}</username>
  <password>${auth.password}</password>`;

const facilityListSoapEnvelope = soapWrapper('GetFacilityList', soapBody);
const occupancySoapEnvelope = (facility) => soapWrapper('GetOccupancyData', `
  ${soapBody}
  <facilityUid>${facility}</facilityUid>`
);

const options = (action, data) => ({
  method: 'POST',
  url: `https://${process.env.T2_SUBDOMAIN}.t2flex.com/POWERPARKws/T2_Flex_Occupancy.asmx`,
  headers:
    {
      'cache-control': 'no-cache',
      soapaction: `http://www.t2systems.com/${action}`,
      'content-type': 'text/xml; charset=utf-8',
      host: `${process.env.T2_SUBDOMAIN}.t2flex.com`
    },
  data
});

exports.facilityListOptions = options('GetFacilityList', facilityListSoapEnvelope);
exports.occupancyDataOptions = (facility) => options('GetOccupancyData', occupancySoapEnvelope(facility));