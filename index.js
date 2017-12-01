const axios = require('axios');
const parseString = require('xml2js').parseString;




function getParkingData() {
  const auth = {
    version: '1.0',
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  }
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
  const occupancySoapEnvelope = (lot) => soapWrapper('GetOccupancyData', `
    ${soapBody}
    <facilityUid>${lot}</facilityUid>`
  );

  options = (action, data) => {
    return {
      method: 'POST',
      url: `https://${process.env.SUBDOMAIN}.t2flex.com/POWERPARKws/T2_Flex_Occupancy.asmx`,
      headers:
        {
          'cache-control': 'no-cache',
          soapaction: `http://www.t2systems.com/${action}`,
          'content-type': 'text/xml; charset=utf-8',
          host: `${process.env.SUBDOMAIN}.t2flex.com`
        },
      data
    }
  }


  var facilityListOptions = options('GetFacilityList', facilityListSoapEnvelope);
  occupancyDataOptions = (lot) => options('GetOccupancyData', occupancySoapEnvelope(lot));


  const p = new Promise(async (resolve, reject) => {
    try {
      axios(facilityListOptions)
        .then(({ data }) => {
          parseString(data, (err, result) => {
            if (err) return reject(err);
            result = result['soap:Envelope']['soap:Body'][0].GetFacilityListResponse[0].GetFacilityListResult[0];
            parseString(result, (e, r) => {
              if (e) return reject(e);
              r = r.FacilityList.Facility;
              const parking = {};
              r.forEach(parkingSpot => {
                const lot = parkingSpot.$;
                parking[lot.UID] = { description: lot.Description };
                axios(occupancyDataOptions(lot.UID)).then(({ data }) => {
                  parseString(data, (e2, r2) => {
                    r2 = r2['soap:Envelope']['soap:Body'][0].GetOccupancyDataResponse[0].GetOccupancyDataResult[0];
                    parseString(r2, (e3, r3) => {
                      r3 = r3.FacilityData.Facility[0].Occupancy[0];
                      parking[lot.UID] = {
                        ...parking[lot.UID],
                        capacity: parseInt(r3.Capacity[0]),
                        occupied: parseInt(r3.Occupied[0]),
                        available: parseInt(r3.Available[0])
                      };
                      console.log(parking);
                    })
                  })
                }).catch(error => console.log(error));
              })
            })
          })
        })
        .catch(error => reject(error))
    }
    catch (e) {
      console.log(e);
    }
  }
  );

}
getParkingData();