const StarNotary = artifacts.require("StarNotary");
//read from yaml file
const fs = require('fs');
const yaml = require('js-yaml');

var accounts;
var owner;

contract('StarNotary', (accs) => {  

    console.log('TEST : StarNotary');

    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {   

    console.log('TEST : can Create a Star');

    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    
    console.log('TEST : lets user1 put up their star for sale');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    
    console.log('TEST : lets user1 get the funds after the sale');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    
    console.log('TEST : lets user2 buy a star, if it is put up for sale');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {

    console.log('TEST : lets user2 buy a star and decreases its balance in ether');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {

    console.log('TEST : can add the star name and star symbol properly');

    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 6;
    await instance.createStar('awesome star test', starId, {from: user1});
    // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    // get from yml file
    //let fileContents = fs.readFileSync('./properties.yml', 'utf8');
    //let data = yaml.safeLoad(fileContents);
    let starTokenName = "StarNotaryToken"; //data.starToken.name;
    let starTokenSymbol = "SNT"; //data.starToken.symbol;

    console.log(`StarToken properties got name : ${starTokenName} and symbol : ${starTokenSymbol}`);

    assert.equal(await instance.getName(), starTokenName);
    assert.equal(await instance.getSymbol(), starTokenSymbol);

});

it('lets 2 users exchange stars', async() => {

    console.log('TEST : lets 2 users exchange stars');

    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];

    let starId1 = 10;
    await instance.createStar('awesome star test with id ', starId1, {from: user1});

    let starId2 = 20;
    await instance.createStar('awesome star test with id ', starId2, {from: user2});

    // check correct owner change
    assert.equal(await instance.ownerOf(starId1), user1);
    assert.equal(await instance.ownerOf(starId2), user2);

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // function exchangeStars(uint256 _tokenId1, uint256 _tokenId2)
    await instance.exchangeStars(starId1, starId2);

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('lets a user transfer a star', async() => {
    
    console.log('TEST : start test : lets a user transfer a star');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];

    // 1. create a Star with different tokenId
    let starId1 = 30;
    await instance.createStar('awesome star test with id 30', starId1, {from: user1});

    // check owner
    assert.equal(await instance.ownerOf(starId1), user1);

    // 2. use the transferStar function implemented in the Smart Contract
    // function transferStar(address _to1, uint256 _tokenId)
    await instance.transferStar(user2, starId1, {from: user1});

    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(starId1), user2);
});

it('lookUptokenIdToStarInfo test', async() => {

    console.log('TEST : start test : lookUptokenIdToStarInfo');

    let instance = await StarNotary.deployed();
    let user1 = accounts[1];

    // 1. create a Star with different tokenId
    let starId1 = 40;
    let startName1 = 'awesome star test with id 40';
    await instance.createStar(startName1, starId1, {from: user1});
    
    // 2. Call your method lookUptokenIdToStarInfo
    // function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory)
    let startNameResult = await instance.lookUptokenIdToStarInfo(starId1);

    // 3. Verify if you Star name is the same
    assert.equal(await startName1, startNameResult);

});