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

  parseStringPromise = (data) =>
    new Promise((resolve, reject) => {
      parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result)
      });
    })



  return new Promise(async (resolve, reject) => {
    const parking = {};

    try {
      let data = (await axios(facilityListOptions)).data;
      data = await parseStringPromise(data);
      data = data['soap:Envelope']['soap:Body'][0].GetFacilityListResponse[0].GetFacilityListResult[0];
      data = (await parseStringPromise(data)).FacilityList.Facility;

      const requestPromises = [];
      for (let lot of data) {
        try {
          lot = lot.$;
          requestPromises.push(new Promise(async (resolve, reject) => {
            data = (await axios(occupancyDataOptions(lot.UID))).data;
            data = await parseStringPromise(data);
            data = data['soap:Envelope']['soap:Body'][0].GetOccupancyDataResponse[0].GetOccupancyDataResult[0];
            data = (await parseStringPromise(data)).FacilityData.Facility[0].Occupancy[0];
            parking[lot.UID] = {
              description: lot.Description,
              capacity: parseInt(data.Capacity[0]),
              occupied: parseInt(data.Occupied[0]),
              available: parseInt(data.Available[0])
            };
            resolve();
          }));
        } catch (e) {
          reject(e);
        }
      }
      await Promise.all(requestPromises);
      resolve(parking);
    }
    catch (e) {
      reject(e);
    }
  }
  );

}
getParkingData().then(p => console.log(p));