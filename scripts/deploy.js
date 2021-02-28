const { BigNumber } = require('ethers')
const hre = require('hardhat')

async function main() {
	const accounts = await hre.ethers.getSigners()
	const devAddress = accounts[1].address

	const Token = await hre.ethers.getContractFactory('KingKongToken')
	const kkt = await Token.deploy()
	await kkt.deployed()
	console.log('KKT deployed to:', kkt.address)
	
	await kkt.mint(devAddress, m(200000))
	console.log('dev KKT balance:', d(await kkt.balanceOf(devAddress)))
	console.log('KKT totalSupply:', d(await kkt.totalSupply()))
	
	const MasterChef = await hre.ethers.getContractFactory('MasterChef')
	const chef = await MasterChef.deploy(kkt.address, devAddress, m(31), m(0))
	await chef.deployed()
	console.log('MasterChef deployed to:', chef.address)
	
	await kkt.transferOwnership(chef.address)
	console.log('KKT ownership transfer to MasterChef')
	
	console.log('MasterChef owner is:', await chef.owner())
	console.log('MasterChef dev is:', await chef.devaddr())

	console.log('done')

	//localhost
	// KKT deployed to: 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
	// dev KKT balance: 200000
	// KKT totalSupply: 200000
	// MasterChef deployed to: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
	// MasterChef owner is: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
	// MasterChef dev is: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

	//okex_testnet
	// KKT deployed to: 0xAc8cD27c2e74DfCCD8B01aeEF84aC47d1629C6b0
	// dev KKT balance: 0
	// KKT totalSupply: 0
	// MasterChef deployed to: 0x60c186Fc32f29906655Df54f2bB5E0f11C04a3c9

	//bsc_testnet
	// KKT deployed to: 0xd5151AF9241eAa8976b26E0812dB852908B23Eb5
	// dev KKT balance: 0
	// KKT totalSupply: 0
	// MasterChef deployed to: 0x8FBa34af5d584AaA79CE12DD96CE3e969bf3B7D5
	// KKT ownership transfer to MasterChef
	// MasterChef owner is: 0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D
	// MasterChef dev is: 0x50D8aD8e7CC0C9c2236Aac2D2c5141C164168da3
}


function m(num) {
    return BigNumber.from('1000000000000000000').mul(num)
}

function d(bn) {
    return bn.div('1000000000').toNumber() / 1000000000
}


main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})