"use strict";

const { DynamoDBClient, GetItemCommand, UpdateItemCommand, PutItemCommand, QueryCommand, DeleteItemCommand, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

class SimpDDB extends DynamoDBClient {
  constructor (clientParams) {
    super(clientParams);
    this.clientParams = clientParams;
  }

  #whiteListedFuncs = ["get","put","del","upd","query","batch"];
  #blackListedAttr = ["condition","limit","consistent","TableName","debug","send","marshallResponse"];
  #batchArr = [];
  #deleteAttr = ["key","sort"];
  #rslt = [];
  #errorArr = [];

  #validate_type(val) {
    if (typeof val === "boolean") {
      return val.toString();
    } else if (typeof val === "number") {
      return val.toString();
    } else if (typeof val === "undefined") {
      return "";
    } else if (typeof val === "string") {
      return val;
    } else if (typeof val === "object") {
      return JSON.stringify(val);
    } else {
      return val;
    }
  };

  #remove_blacklisted_attributes (_p) {
    const ret={};
    for (const [key, value] of Object.entries(_p)) {
      const k = (this.#blackListedAttr.includes(key)) ? "": key;
      const v = (this.#blackListedAttr.includes(key)) ? "": value;
      if (k) ret[k] = this.#validate_type(v);
    };
    return ret;
  };

  #keep_del_attributes (_p) {
    const ret={};
    Object.entries(_p).forEach(([key,value])=> {
      if (this.#deleteAttr.includes(key)){
        ret[key] = value; 
      };
    });
    return ret;
  };

  #get(_p) {
    return new GetItemCommand({
      "TableName": _p.TableName,
      "Key": marshall(this.#remove_blacklisted_attributes(_p)),
      "ReturnValues": "NONE",
      "ReturnConsumedCapacity": "TOTAL",
      "ReturnItemCollectionMetrics": "SIZE",
      "ConsistentRead": _p.consistent,
    });
  };

  #put(_p) {
    return new PutItemCommand({
      "TableName": _p.TableName,
      "Item": marshall(this.#remove_blacklisted_attributes(_p)),
      "ReturnValues": "NONE",
      "ReturnConsumedCapacity": "TOTAL",
      "ReturnItemCollectionMetrics": "SIZE"
    });
  };

  #del(_p) {
    return new DeleteItemCommand({
      TableName: _p.TableName,
      Key: marshall(this.#keep_del_attributes(_p)),
      ConditionExpression: "attribute_exists(#sort)",
      ExpressionAttributeNames: { "#sort": "sort"}
    });
  };

  #upd(_p) {
    const ueArr = [];
    const params = {
      "TableName": _p.TableName,
      "Key": {},
      "UpdateExpression": "",
      "ExpressionAttributeNames": {},
      "ExpressionAttributeValues": {}, 
      "ReturnValues":"ALL_NEW",
      "ReturnConsumedCapacity": "TOTAL"
    };
    for (const [key, value] of Object.entries(_p)) {
      if (key === "TableName" && value) {
        params.TableName = value;
      } else if (key === "key" || key === "sort") { 
        params.Key[key] = value;
      } else {
        const k = (this.#blackListedAttr.includes(key)) ? "": key;
        if (k) {
          ueArr.push(` #${key} = :${key}`);
          params.ExpressionAttributeNames[`#${key}`] = key;
          params.ExpressionAttributeValues[`:${key}`] = this.#validate_type(value);
        };
      };
    };
    if (params.Key) { 
      params.Key = marshall(params.Key);
    };
    const ue = ueArr.join();
    params.UpdateExpression = (ue)?"SET"+ue:"";
    params.ExpressionAttributeValues = marshall(params.ExpressionAttributeValues);
    if (!params.Key.key || !params.Key.sort) {
      console.log("upd: err: Composite key missing, check your payload",params);
    } else if (!params.UpdateExpression) {
      console.log("upd: err: Missing attributes to update. Composite key was provided",params);
    };
    return new UpdateItemCommand(params);
  };

  #query(_p) {
    let ean = {};
    let eav = {};
    let kce = [];
    Object.entries(_p).forEach(([key,value])=>{
      const k = (this.#blackListedAttr.includes(key)) ? "": key;
      const v = (this.#blackListedAttr.includes(key)) ? "": value;
      if (k && value) {
        ean["#"+k] = k;
        eav[":"+k] = v;
      }
      if (k == "key"){ 
        kce.push(`#${k} = :${k}`);
      }
      if (k == "sort" && value) {
        if (_p.condition) {
          kce.push(` and begins_with(#${k}, :${k})`);
        } else {
          kce.push(` and #${k} = :${k}`);
        }
      }
    });

    const queryCmd = {
      KeyConditionExpression: kce.join(""),
      ExpressionAttributeNames: ean,
      ExpressionAttributeValues: marshall(eav),
      TableName: _p.TableName,
      ConsistentRead: _p.consistent,
      Limit: _p.limit
    };
    return new QueryCommand(queryCmd);
  };

  async snd(_p) {
    let command = "";
    if (!this.#whiteListedFuncs.includes(_p.send)) {
      console.log(`"${_p.send}" is not a valid function action. You must chose one of the following [${this.#whiteListedFuncs.toLocaleString()}].`);
      return;
    } 
    else if (_p.send === "get") {
      command = this.#get(_p);
    } else if (_p.send === "put") {
      command = this.#put(_p);
    } else if (_p.send === "del") {
      command = this.#del(_p);
    } else if (_p.send === "upd") {
      command = this.#upd(_p);
    } else if (_p.send === "query") {
      command = this.#query(_p);
    } else if (_p.send === "batch") {
      this.#add(_p.batchList);
      return await this.#batch (_p.TableName);
    };

    if (_p.debug) {
      console.log(JSON.stringify(command));
    };

    if (command) {
      return await this.send(command)
      .then((data)=>{
        if (data.Items) {
          const response = {}
          const Items = [];
          data.Items.forEach((x)=>{
            Items.push(unmarshall(x));
          });
          response.Items = Items;
          return response;
        } else if (data.Item) {
          return (data.Item) ? unmarshall(data.Item) : "";
        } else {
          return "";
        }
      })
      .catch((err)=>{
        console.log("snd:",err.message,_p);
        return "";
      });
    }
  };

  async custom_put(_p) {
    return await this.send(new PutItemCommand(_p))
    .then((data)=>{
      return data;
    })
    .catch((err)=>{
      // console.log("put:",err.message,_p);
      return err;
    });
  };
  
  async custom_upd(_p) {
    return await this.send(new UpdateItemCommand(_p))
    .then((data)=> {
      return data;
    })
    .catch((err)=>{
      return err;
    });
  };
  
  #addItem (_v) {
    const { batchAction } = _v;
    let command = "";
    if (batchAction ==="del") {
      Object.keys(_v).forEach((x)=> {
        if (!this.#deleteAttr.includes(x)){
          delete _v[x];
        };
      });
      command = {"DeleteRequest":{"Key":marshall(_v)}};
    } else if (batchAction ==="put") {
      delete _v.batchAction;
      command = {"PutRequest":{"Item":marshall(_v)}};
    };
    if (command) {
      this.#batchArr.push(command);
    }
  };

  #add(_v) {
    _v.forEach((x)=>{
      this.#addItem(x);
    })
  }

  async #batch (TableName) {
    let i,j,temparray,chunk = 25;
    for (i=0,j=this.#batchArr.length; i<j; i+=chunk) {
        temparray = this.#batchArr.slice(i,i+chunk);
        const params = {};
        params.RequestItems = {};
        params.RequestItems[TableName] = temparray;
        await this.send(new BatchWriteItemCommand(params))
        .then((data)=> {
          //console.log(data);
          this.#rslt.push(`${i}-${i+chunk} `);
        })
        .catch((err)=> {
          this.#errorArr.push(`${i}-${i+chunk} `);
          console.log(err);
        })
    };
    return {
      "code": "0",
      "message": `Total Group Processed: ${this.#rslt.toLocaleString()}, Total Group Errors: ${this.#errorArr.toLocaleString()}, TableName: ${TableName}`
    };
  }

};

module.exports = SimpDDB;