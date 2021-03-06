const axios = require('axios');
const { parseString } = require('xml2js');
const T2 = require('./lib/T2');

function fetchOccupancyDataList(auth) {
  const t2 = new T2(auth);
  const parking = {};

  parseStringPromise = (data) =>
    new Promise((resolve, reject) => {
      parseString(data, (err, result) => {
        if (err) reject(err);
        else resolve(result)
      });
    });

  soapBody = (action, data) => data['soap:Envelope']['soap:Body'][0][`${action}Response`][0][`${action}Result`][0];

  fetchFacilityData = (facility) => new Promise(async (resolve, reject) => {
    try {
      let occupancyData = (await axios(t2.occupancyDataOptions(facility.UID))).data;
      occupancyData = await parseStringPromise(occupancyData);
      occupancyData = soapBody('GetOccupancyData', occupancyData);
      occupancyData = (await parseStringPromise(occupancyData)).FacilityData.Facility[0].Occupancy[0];
      parking[facility.UID] = {
        description: facility.Description,
        capacity: parseInt(occupancyData.Capacity[0]),
        occupied: parseInt(occupancyData.Occupied[0]),
        available: parseInt(occupancyData.Available[0])
      };
      resolve();
    } catch (e) {
      reject(new Error(e));
    }
  });

  return new Promise(async (resolve, reject) => {
    try {
      let facilityList = (await axios(t2.facilityListOptions())).data;
      facilityList = await parseStringPromise(facilityList);
      facilityList = soapBody('GetFacilityList', facilityList);
      facilityList = (await parseStringPromise(facilityList)).FacilityList.Facility;

      const requestPromises = [];
      facilityList.forEach(facility =>
        requestPromises.push(fetchFacilityData(facility.$))
      );
      await Promise.all(requestPromises);
      resolve(parking);
    }
    catch (e) {
      reject(new Error(e));
    }
  })
}

module.exports = fetchOccupancyDataList;