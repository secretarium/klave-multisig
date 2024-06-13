const { deployPK_MultiSig, testPK_MultiSig } = require('./tests/pk_multisig/test_suite');

const deployApp = true;
const doNotDeployApp = false;

const runTests = async () => {
  // await deployPK_MultiSig();
  await testPK_MultiSig();


};

runTests();
