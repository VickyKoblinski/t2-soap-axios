
# T2 Occupancy Data Request in Nodejs 

## Description

A Nodejs module to request T2 Systems' SOAP service and return data as a Javascript object.

## Installation

`npm install --save {name}`

Add to your `.env` file:
```
USERNAME={T2 username}
PASSWORD={T2 password}
SUBDOMAIN={T2 subdomain}
```

## Usage

```js
import fetchOccupancyData from 't2-soap-axios';

fetchOccupancyData().then(data => console.log(data));
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