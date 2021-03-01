const { BigNumber } = require('ethers')
const hre = require('hardhat')

async function main() {
	const accounts = await hre.ethers.getSigners()

	const Multicall = await hre.ethers.getContractFactory('Multicall')
	const multicall = await Multicall.deploy()
	await multicall.deployed()
	console.log('Multicall deployed to:', multicall.address)

    //okex_testnet
    // Multicall deployed to: 0xA0dC9278D4ACFfCC07Ce686012cC13D0D9d40593
}


main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})