const { BigNumber } = require('ethers')
const hre = require('hardhat')
const Web3 = require('web3')
var web3 = new Web3('http://localhost:8545')


// async function main() {
// 	const accounts = await hre.ethers.getSigners()

// 	const ERC = await ethers.getContractFactory('MockERC20')
// 	erc = await ERC.deploy('KKT', m(100000), 18)
// 	await erc.deployed()

// 	const MultiSig = await ethers.getContractFactory('MultiSigWallet')
// 	multisig = await MultiSig.deploy([accounts[0].address, accounts[1].address, accounts[2].address], b(2))
// 	await multisig.deployed()
	
// 	const Timelock = await ethers.getContractFactory('Timelock')
// 	timelock = await Timelock.deploy(accounts[0].address, b(2))
// 	await timelock.deployed()

// 	await erc.transfer(timelock.address, m(100))
	
// 	let func = 'transfer(address,uint256)'
// 	let data = web3.eth.abi.encodeParameters(['address','uint256'], [accounts[1].address, m(100)])
// 	let height = await hre.ethers.getDefaultProvider().getBlockNumber()
// 	let block = await hre.ethers.getDefaultProvider().getBlock(height)
// 	console.log('block.timestamp', block.timestamp) 
// 	let eta = b(block.timestamp + 100) //eta不是特别准
// 	await timelock.queueTransaction(erc.address, b(0), func, data, eta)

// 	await delay(30)

// 	await timelock.executeTransaction(erc.address, b(0), func, data, eta)

// 	let bal0 = d(await erc.balanceOf(accounts[0].address))
// 	let bal1 = d(await erc.balanceOf(accounts[1].address))
// 	let bal2 = d(await erc.balanceOf(timelock.address))
// 	console.log('balance', bal0, bal1, bal2)
// }

const factoryAddress = ''
const timelockAddress = ''
const MultiSigAddress = ''
const chefAddress = ''

async function setAdmin() {
    const accounts = await hre.ethers.getSigners()

    let factoryAbi = getAbi('./artifacts/contracts/uniswapv2/UniswapV2Factory.sol/UniswapV2Factory.json')
    const factory = new ethers.Contract(factoryAddress, factoryAbi, accounts[0])
	await factory.setFeeToSetter(timelockAddress)

    let chefAbi = getAbi('./artifacts/contracts/MasterChef.sol/MasterChef.json')
    const chef = new ethers.Contract(chefAddress, chefAbi, accounts[0])
	await chef.transferOwnership(timelockAddress)

	await delay(10)

    console.log('UniswapV2Factory feeToSetter is:', await factory.feeToSetter())
    console.log('MasterChef owner is:', await chef.owner())
    console.log('done')
}


async function submitMultiSig() {
	const accounts = await hre.ethers.getSigners()

	let MultiSigAbi = getAbi('./artifacts/contracts/governance/MultiSigWallet.sol/MultiSigWallet.json')
    const multiSig = new ethers.Contract(MultiSigAddress, MultiSigAbi, accounts[0])
	
	const Timelock = await ethers.getContractFactory('Timelock')
	let data = Timelock.interface.encodeFunctionData(
		'queueTransaction(address,uint256,string,bytes,uint256)'
		, [...])

	await multiSig.submitTransaction(timelockAddress, b(0), data)
}


async function confirmMultiSig() {
	const accounts = await hre.ethers.getSigners()

	let MultiSigAbi = getAbi('./artifacts/contracts/governance/MultiSigWallet.sol/MultiSigWallet.json')
    const multiSig = new ethers.Contract(MultiSigAddress, MultiSigAbi, accounts[0])
	let transactionId = await multiSig.transactionCount()
	await multiSig.confirmTransaction(transactionId)
}


async function executeSubmitMultiSig() {
	const accounts = await hre.ethers.getSigners()

	let MultiSigAbi = getAbi('./artifacts/contracts/governance/MultiSigWallet.sol/MultiSigWallet.json')
    const multiSig = new ethers.Contract(MultiSigAddress, MultiSigAbi, accounts[0])
	
	const Timelock = await ethers.getContractFactory('Timelock')
	let data = Timelock.interface.encodeFunctionData(
		'executeTransaction(address,uint256,string,bytes,uint256)'
		, [...])

	await multiSig.submitTransaction(timelockAddress, b(0), data)
}


async function delay(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
	})
}

function m(num) {
	return BigNumber.from('1000000000000000000').mul(num)
}

function d(bn) {
	return bn.div('1000000000').toNumber() / 1000000000
}

function b(num) {
	return BigNumber.from(num)
}

function n(bn) {
	return bn.toNumber()
}


main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})