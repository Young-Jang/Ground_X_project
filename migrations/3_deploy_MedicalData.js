var MedicalData = artifacts.require("./MedicalData.sol");

module.exports = function(deployer) {
  deployer.deploy(MedicalData);
};
