# About SimpDDB 

<p>I found of DyanmoDB's rich features offered, my usage boiled down to a handful of operations and for the most part did not need most of what is there to offer. I also feel DynamoDB is a wonderful service, however, I also wanted to offer a simpler way of executing DynamoDB's operations. And with this the simpDDB was born.</p>
<p>SimpDDB is targeted for DynamoDB newbies or for those who just want to peform simple operations in a simple way. This doesn't rule out that the features not here do not matter, it's just not simple.</p>


## Main Features
* Intended so a JavaScript caveperson can use it - A little bit of JSON knowledge is all you need
* Intended for a very basic set of DynamoDB operations
  * get - key + sort will return one object
  * put - will overwrite the item with a new item
  * del - will delete the item. key + sort is required, any other attributes are ignored and will not affect the operation
  * query - uses key condition experession "begins_with", key + sort is required, any other attributes are ignored and will not affect the operation.
  * batch - processes in batches of 25, if a batch fails only the requests in that batch group fail.
* Intended to bring a smile 

## Other info
* All ddb tables must have "key" and "sort" as the composite key. 
* All item attributes are inserted as strings into ddb. 
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

## Example for: "get", "put", "del", "upd", and "query" operations 

```javascript
(async function (){
  await simpDDB.snd(({
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

## Example for: "batch"
batchAction only supports "del", "put" operations
 ```javascript
(async function (){
  const arrList = [
    {
      "batchAction":"put",
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
    }
  ];
  
  await simpDDB.snd({
    "send":"batch",
    "TableName":TableName,
    "batchList": arrList
  });

})();
```
