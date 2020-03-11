const ForeverBook = artifacts.require("ForeverBook");

module.exports = function(deployer) {
  deployer.deploy(ForeverBook);
};
