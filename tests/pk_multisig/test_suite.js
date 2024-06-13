const fs = require('fs');
const { subtle } = require('crypto').webcrypto;
const { klaveDeployApp, klaveTransaction, klaveQuery, klaveCloseConnection, klaveOpenConnection } = require('../../klave_network');
const { base64ToArrayBuffer, getMessageEncoding, arrayBufferToBase64 } = require('../../utils');

//wasm to deploy must be copied post generation coming from yarn build command
const app_id = "test_pk_multisig";
const fqdn = "test_pk_multisig_smart_contract";
const WASM_TEST_PK_MULTISIG = './config/wasm/pk_multisig.b64';

  // let pkcs8PrivKey1 = await rmPemDecorators((fs.readFileSync(`./config/private_keys/klave1-priv.pem`)).toString());  
const rmPemDecorators = async (pemFile) => {
  pemFile = pemFile.replace('-----BEGIN PRIVATE KEY-----','');
  pemFile = pemFile.replace('-----END PRIVATE KEY-----','');
  pemFile = pemFile.replace(/\n/g,'');
  return pemFile;
}

const deployPK_MultiSig = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  if (user_connected)
  {
    await klaveDeployApp(app_id, fqdn, WASM_TEST_PK_MULTISIG);
  }
  klaveCloseConnection();
}

const subtle_GenerateKey = async () => {
  let keyPair = await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );
  return keyPair;
}

const subtle_ExportPublicKey = async (pubCryptoKey) => {

  let exported = Buffer.from(await crypto.subtle.exportKey('spki', pubCryptoKey)).toString('base64');  
  console.log(exported);
  return exported;
}

const subtle_Sign = async (privCryptoKey, message) => {
  let enc = new TextEncoder();  
  let signature = await subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    privCryptoKey,
    enc.encode(message),
  );
  return signature;  
}

const subtle_Verify = async (pubCryptoKey, message, signature) => {
  let enc = new TextEncoder();  
  let result = await subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    pubCryptoKey,
    base64ToArrayBuffer(signature),
    enc.encode(message),
  );
  return result;  
}

const generateKey = async (keyName, algorithm, extractable) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  let keyId = keyName;
  if (user_connected)
  {          
      let generateKeyInput = {
        "keyId":keyName,
        "key": {
          "format":"",
          "keyData":"",
          "algorithm": algorithm,
          "extractable": extractable,
          "usages": []
        }
      };
      let addKeyResult = await klaveTransaction(fqdn,"generateKey", generateKeyInput);
      keyId = addKeyResult.message.split(":")[1].trim();
  }
  klaveCloseConnection();
  return keyId;
}

// let key1Id = await importKey("", "pkcs8", pkcs8PrivKey1, "secp256r1", true);
const importKey = async (keyName, format, data_noDecorators, algorithm, extractable) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  let keyId = keyName;
  if (user_connected)
  {          
      let importKeyInput = {
        "keyId": keyName,
        "key": {
          "format":format,
          "keyData":data_noDecorators,
          "algorithm": algorithm,
          "extractable": extractable,
          "usages": []
        }
      };
      let addKeyResult = await klaveTransaction(fqdn, "importKey", importKeyInput);
      keyId = addKeyResult.message.split(":")[1].trim();
  }
  klaveCloseConnection();
  return keyId;
}

const addUser = async (user) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let userId = "";
  if (user_connected)
  {    
      let addUserInput = {
        "userId": "",
        "role": "admin"
      };
      let addUserResult = await klaveTransaction(fqdn,"addUser", addUserInput);
      userId = addUserResult.message.split(":")[1].trim();
  }
  klaveCloseConnection();
  return userId;
}

const listUsers = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  
  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listUsers", "");            
  }
  klaveCloseConnection();  
}

const createGroup = async (user, participants) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let groupId = "";
  if (user_connected)
  {    
      console.log("Particpants: " + participants);
      let createGroupInput = {
        "groupId": "",
        "users": participants
      };
      let createGroupResult = await klaveTransaction(fqdn,"createGroup", createGroupInput);
      groupId = createGroupResult.message.split(":")[1].trim();      
  }
  klaveCloseConnection();
  return groupId;
}

const listGroups = async () => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroups", "");            
  }
  klaveCloseConnection();    
}

const listGroupPublicKeys = async (groupId) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);
  
  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroupPublicKeys", groupId);            
  }
  klaveCloseConnection();  
}
const createContract = async (user, groupId, threshold, message, privateKeyId) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);
  
  let contractId = "";
  if (user_connected)
  {    
      let createContractInput = {
        "contractId": "",
        "groupId": groupId,
        "threshold": threshold,
        "message": message,
        "privateKeyId": privateKeyId
      };
      let createContractResult = await klaveTransaction(fqdn,"createContract", createContractInput);      
      contractId = createContractResult.message.split(":")[1].trim();      
  }
  klaveCloseConnection();
  return contractId;
}

const listGroupContracts = async (groupId) => {
  let user_connected = await klaveOpenConnection(`klave1`);
  console.log("user_connected: ", user_connected);

  if (user_connected)
  {    
      await klaveTransaction(fqdn,"listGroupContracts", groupId);            
  }
  klaveCloseConnection();    
}

const approveContract = async (user, contractId, message, signature, spkiPubKey) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);  
  if (user_connected)
  {    
    console.log(`contractId(${contractId}), message(${message}), signature(${arrayBufferToBase64(signature)}), spkiPubKey(${spkiPubKey})`);
    let approveContractInput = {
      "contractId": contractId,
      "message": message,
      "signature": arrayBufferToBase64(signature),
      "spkiPubKey": spkiPubKey
    };
    await klaveTransaction(fqdn,"approveContract", approveContractInput);
  }
  klaveCloseConnection();  
}

const verifyContract = async (user, contractId) => {
  let user_connected = await klaveOpenConnection(user);
  console.log("user_connected: ", user_connected);

  let verified = false;
  let signature = "";
  if (user_connected)
  {    
      let verifyResult = await klaveTransaction(fqdn,"verifyContract", contractId);      
      console.log(verifyResult);
      verified = verifyResult.success;
      if (verified) {
        signature = verifyResult.message.split(":")[1].trim();
      }
  }
  klaveCloseConnection();  
  return [verified, signature];
}

const testPK_MultiSig = async (user) => {
  //Generate Private Key
  let commonKey1Id = await generateKey("", "secp256r1", true);

  //Create crypto keyPairs with subtle
  let keyPair1 = await subtle_GenerateKey();
  let keyPair2 = await subtle_GenerateKey();
  let keyPair3 = await subtle_GenerateKey();
  let keyPair4 = await subtle_GenerateKey();
  let keyPair5 = await subtle_GenerateKey();

  //Associate 5x public keys to this private key
  let spkiPubKey1 = await subtle_ExportPublicKey(keyPair1.publicKey);
  let spkiPubKey2 = await subtle_ExportPublicKey(keyPair2.publicKey);
  let spkiPubKey3 = await subtle_ExportPublicKey(keyPair3.publicKey);
  let spkiPubKey4 = await subtle_ExportPublicKey(keyPair4.publicKey);
  let spkiPubKey5 = await subtle_ExportPublicKey(keyPair5.publicKey);

  let participantsGA = new Array(spkiPubKey1, spkiPubKey2, spkiPubKey3, spkiPubKey4, spkiPubKey5);
  let groupId = await createGroup('klave1', participantsGA);

  result = await listGroups();
  result = await listGroupPublicKeys(groupId);

  //Create a contract on a message
  let message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  let contractId = await createContract('klave1', groupId, participantsGA.length - 2, message, commonKey1Id);

  result = await listGroupContracts(groupId);

  //each user needs to sign with the private key the message
  //and send it to the contract/session

  let sig1 = await subtle_Sign(keyPair1.privateKey, message);
  result = await approveContract('klave1', contractId, message, sig1, spkiPubKey1);  
  let sc_verified = await subtle_Verify(keyPair1.publicKey, message, arrayBufferToBase64(sig1));
  console.assert(sc_verified === true);

  let sig2 = await subtle_Sign(keyPair2.privateKey, message);
  result = await approveContract('klave2', contractId, message, sig2, spkiPubKey2);

  let [verified, signature] = await verifyContract('klave1', contractId);
  console.assert(verified === false);

  //one of the users can then request the signature of the particular message with the internal private key

  let sig3 = await subtle_Sign(keyPair3.privateKey, message);
  result = await approveContract('klave3', contractId, message, sig3, spkiPubKey3);

  [verified, signature] = await verifyContract('klave1', contractId);
  console.assert(verified === true);
}

module.exports = {
    deployPK_MultiSig,
    testPK_MultiSig,
}
