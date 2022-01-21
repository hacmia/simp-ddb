# About SimpDDB 
A simple DynamoDB wrapper module. Targeted for people who are just want to do simple stuff, in a simple way on DynamoDB.
<br><br>
## What you should know...
All ddb tables must have a composite key of "key" as the primary and "sort" as the sort key. 
<br><br><br>
# How to use this 
## Require it 
```javascript
const SimpDDB = require("simp-ddb");
```

## Mandatory fields
```javascript
const TableName = "YOUR_TABLE_NAME";
const region = "us-east-1";
```

## Credentials and Region 
```javascript
const ACCESS_KEY = "ASIA52IMGHBLAHBLAHBLAH";
const SECRET_ACCESS_KEY = "SqnqvvJRq+5asEyudgSv6+BLAHBLAHBLAH";
const SESSION_TOKEN = "IQoJb3JpZ2luX2VjEAYaCXVzLWVhc3QtMSJGMEQCIDslP8DeavFrEMddVERYLONGBLAHBLAHBLAH";

const clientParams = {
  "region": region,
  "credentials": {
     "accessKeyId": ACCESS_KEY,
     "secretAccessKey": SECRET_ACCESS_KEY,
     "sessionToken": SESSION_TOKEN
  }
};

const simpDDB = new SimpDDB(clientParams);

```

## Example for: "get", "put", "del", "upd", and "query" operations 
```javascript
(async function (){
  await simpDDB.snd({
    "send":"put",
    "TableName":TableName,
    "key":"test",
    "sort":"test",
    "anotherAttr":"anotherValue"
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```

## Example for: "batch"
batchAction only supports "del", "put" operations
 ```javascript
(async function (){
  const arrList = [
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test",
      "attribute":{"one":1,"bool":false},
      "falseStr":"false",
      "falseBool":false,
      "trueStr":"true",
      "trueBool":true,
      "ZeroStr": "0",
      "ZeroNum": 0,
      "dateIso": new Date().toISOString()
    },
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test2"
    },
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test3"
    },
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test4"
    },
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test5"
    },
    {
      "batchAction": "del",
      "key": "test",
      "sort": "test6"
    }
  ];
  
  await simpDDB.snd({
    "send":"batch",
    "TableName":TableName,
    "batchList": arrList
  });

})();
```
