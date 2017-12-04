class T2 {
  constructor(auth) {
    this.auth = {
      version: '1.0',
      ...auth
    };

    this.soapBody = `
      <version>${this.auth.version}</version>
      <username>${this.auth.username}</username>
      <password>${this.auth.password}</password>`;

  }

  soapWrapper(action, body) {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <${action} xmlns="http://www.t2systems.com/">
          ${body}
        </${action}>
      </soap:Body>
    </soap:Envelope>`
  };

  facilityListSoapEnvelope() { return this.soapWrapper('GetFacilityList', this.soapBody) };
  occupancySoapEnvelope(facility) {
    return this.soapWrapper('GetOccupancyData', `
    ${this.soapBody}
    <facilityUid>${facility}</facilityUid>`
    )
  };

  options(action, data) {
    return {
      method: 'POST',
      url: `https://${this.auth.subdomain}.t2flex.com/POWERPARKws/T2_Flex_Occupancy.asmx`,
      headers:
        {
          'cache-control': 'no-cache',
          soapaction: `http://www.t2systems.com/${action}`,
          'content-type': 'text/xml; charset=utf-8',
          host: `${this.auth.subdomain}.t2flex.com`
        },
      data
    }
  };

  facilityListOptions() { return this.options('GetFacilityList', this.facilityListSoapEnvelope()) };
  occupancyDataOptions(facility) { return this.options('GetOccupancyData', this.occupancySoapEnvelope(facility)) };
}

module.exports = T2;