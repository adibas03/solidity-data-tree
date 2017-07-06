var TreeLib = artifacts.require("./TreeLib.sol");
var Tree = artifacts.require("./Tree.sol");

module.exports = function(deployer) {
  deployer.deploy(TreeLib);
  deployer.link(TreeLib, Tree);
  deployer.deploy(Tree);
};
