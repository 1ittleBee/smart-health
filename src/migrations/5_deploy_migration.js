const SimpleStorage = artifacts.require("record2");
module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
};
