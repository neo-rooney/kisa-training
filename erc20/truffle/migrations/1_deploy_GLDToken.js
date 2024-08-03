const GLDToken = artifacts.require("GLDToken");

module.exports = function (deployer) {
  const initialSupply = web3.utils.toWei("1000", "ether");
  deployer.deploy(GLDToken, initialSupply);
};
