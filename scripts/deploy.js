const { BigNumber } = require('ethers')
const hre = require('hardhat')

async function main() {
	const accounts = await hre.ethers.getSigners()

	const LossToken = await hre.ethers.getContractFactory('LossToken')
	const loss = await LossToken.deploy()
	await loss.deployed()
	console.log('LossToken deployed to:', loss.address)

	const MasterChef = await hre.ethers.getContractFactory('MasterChef')
	const chef = await MasterChef.deploy(loss.address, accounts[0].address, BigNumber.from('50'), BigNumber.from('0'))
	await chef.deployed()
	console.log('MasterChef deployed to:', chef.address)

	await loss.transferOwnership(chef.address)

	console.log('done')
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})