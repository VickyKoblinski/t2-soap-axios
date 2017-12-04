
# T2 Occupancy Data Request in Nodejs 

## Description

A Nodejs module to request T2 Systems' SOAP service and return data as a Javascript object.

## Installation

*Requires Node >=v9.0

`npm install --save t2-soap-axios`

## Usage

```js
import fetchOccupancyData from 't2-soap-axios';

fetchOccupancyData({
  username: String,
  password: String,
  subdomain: String
}).then(data => console.log(data));
```

Data format: 
```js
{
  [ID]:
  { description: String,
    capacity: Number,
    occupied: Number,
    available: Number },
  ...
}
```

Example of returned data:
```js
{ 
  '2000':
   { description: 'Lot 1 ',
     capacity: 78,
     occupied: 68,
     available: 10 },
  '2001':
   { description: 'Lot 22',
     capacity: 1101,
     occupied: 373,
     available: 728 },
  '2004':
   { description: 'Lot 9',
     capacity: 405,
     occupied: 276,
     available: 129 }
}
```