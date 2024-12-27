const Record = artifacts.require("record");

module.exports = async function (deployer) {
  try {
    await deployer.deploy(Record);
    const instance = await Record.deployed();
    console.log("Record contract deployed at:", instance.address);
  } catch (error) {
    console.error("Error deploying Record contract:", error);
    throw error;
  }
};
