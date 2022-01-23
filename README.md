# About SimpDDB 

<p>I found of DyanmoDB's rich offering, my usage boiled down to a handful of operations, which for the most part did what I need it to for my day to day.  I also wanted to offer a simpler way of executing DynamoDB's operations. And with this the simpDDB was born.</p>
<p>SimpDDB is targeted for DynamoDB newbies or for those who just want to peform simple operations in a simple way.</p>


## Main Features
* Intended so a JavaScript caveperson can use it - A little bit of JSON "know how" is all you need
* Intended for a very basic set of DynamoDB operations
  * get - key + sort will return one object
  * put - will overwrite the item with a new item
  * del - will delete the item. key + sort is required, any other attributes are ignored and will not affect the operation
  * query - uses key condition experession "begins_with", key + sort is required, any other attributes are ignored and will not affect the operation.
  * batch - processes in batches of 25, if a batch fails only the requests in that batch group fail.
* Extends [DynamoDB Client - AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html)
* Lightweight
* Intended to bring a smile 

## Other info
* All ddb tables must have "key" and "sort" as the composite key. 
* All item attributes are inserted as strings into ddb by default, but, can be overwritten to store them as intended.
* Currently no other DynamoDB features are supported.

# How to use SimpDDB 

## Require it 
```javascript
const SimpDDB = require("simp-ddb");
```

## Gotta have these
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
## Settings
Currently storeAsStrings is the only setting available. But, if any others are added, you'll find it here.
```javascript 
  //By default, SimpDDB stores all item attributes as strings. To store as primitive and object values, set the following command set to false.
  simpDDB.settings({
    "storeAsStrings": false
  });
```
```javascript 
  //If set to true it will store as strings again.
  simpDDB.settings({
    "storeAsStrings": true
  });
```

## Example put operation

```javascript
(async function (){
  //put will override existing items. If you want to remove an attribute from an item use put
  await simpDDB.snd({
    "send":"put",
    "TableName":TableName,
    "key":"test",
    "sort":"test0",
    "anotherAttr":"anotherValues",
    "anotherAttrAdded":"anotherValuesAdded",
    "zeroNum":0,
    "zeroStr":"0",
    "trueBool":true,
    "trueStr":"true",
    "falseBool":false,
    "falseStr":"false",
    "attribute":{"one":1,"bool":false},
    "dateIso": new Date().toISOString()
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```
## Example upd operation
```javascript
(async function (){
  // upd will create or update existing items. It will add new attributes or 
  // change the value of existing attributes, but, it will not delete attributes
  await simpDDB.snd({
    "send":"upd",
    "TableName":TableName,
    "key":"test",
    "sort":"test1",
    "anotherAttr":"anotherValues",
    "anotherAttrAdded":"anotherValuesAdded",
    "zeroNum":0,
    "zeroStr":"0",
    "trueBool":true,
    "trueStr":"true",
    "falseBool":false,
    "falseStr":"false",
    "attribute":{"one":1,"bool":false},
    "dateIso": new Date().toISOString()
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```
## Example get operation
```javascript
(async function (){
  // get will return one item 
  await simpDDB.snd({
    "send":"get",
    "TableName":TableName,
    "key":"test",
    "sort":"test0",
    "consistent": true //supported by query and get operations
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```
## Example query operation
```javascript
(async function (){
  //query will return an array of items
  await simpDDB.snd({
    "send":"query",
    "TableName":TableName,
    "key":"test",
    "sort":"test",
    "condition":"begins_with",
    "consistent": true //supported by query and get operations
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```
## Example del operation
```javascript
(async function (){
  //query will return an array of items
  await simpDDB.snd({
    "send":"del",
    "TableName":TableName,
    "key":"test",
    "sort":"test0"
  })
  .then((data)=>{
    console.log(data);
  })
  .catch((err)=>{
    console.log(err);
  });
})();
```

## Example for: "batch" operation
batchAction only supports "del", "put" operations
 ```javascript
(async function (){
  //batch put or del
  //batchAction only supports "del", "put" operations
  //batches are processed in batch groups of 25
  const arrList = [
    {
      "batchAction":"put",
      "key":"test",
      "sort":"test2",
      "anotherAttr":"anotherValues",
      "anotherAttrAdded":"anotherValuesAdded",
      "zeroNum":0,
      "zeroStr":"0",
      "trueBool":true,
      "trueStr":"true",
      "falseBool":false,
      "falseStr":"false",
      "attribute":{"one":1,"bool":false},
      "dateIso": new Date().toISOString()
    },
    {
      "batchAction":"del",
      "key":"test",
      "sort":"test1"
    }
  ];
  await simpDDB.snd({
    "send":"batch",
    "TableName":TableName,
    "batchList": arrList
  });
})();
```
