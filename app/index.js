const Web3 = require('web3');
let web3 = new Web3('ws://127.0.0.1:9545');
web3.eth.getChainId().then(function(chainId){
	console.log(chainId);
});
