const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

async function main() {
	const accounts = await hre.ethers.getSigners()
    const adminAddress = accounts[0].address

    ////////////MultiSigWallet////////////
    let user1 = '0x662546Dcc9f158a9ABb4d1c3B369B07bC67969D6'
	let user2 = '0x3A40066D1dC27d14C721e4135cF02DCb20C9AFE0'
	let user3 = '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D'

    const MultiSig = await ethers.getContractFactory('MultiSigWallet')
    multisig = await MultiSig.deploy([user1, user2, user3], b(2))
    await multisig.deployed()
    console.log('MultiSigWallet deployed to:', multisig.address)

    let owners = await multisig.getOwners()
    for (let owner of owners) {
        console.log('owner', owner)
    }
	console.log('MultiSigWallet done \n')


    ////////////Timelock////////////
    const Timelock = await ethers.getContractFactory('Timelock')
	timelock = await Timelock.deploy(multisig.address, b(86400))
	await timelock.deployed()
    console.log('Timelock deployed to:', timelock.address)
    console.log('Timelock admin is:', await timelock.admin())
    console.log('Timelock done \n')


    ////////////Swap////////////
	const Factory = await hre.ethers.getContractFactory('UniswapV2Factory')
	const factory = await Factory.deploy(adminAddress)  //feeToSetter

	await factory.deployed()
	console.log('Factory deployed to:', factory.address)

	const INIT_CODE_PAIR_HASH = await factory.INIT_CODE_PAIR_HASH()
	console.log('INIT_CODE_PAIR_HASH:', INIT_CODE_PAIR_HASH)

	// await factory.setFeeTo(adminAddress)
	// await delay(10)
    // console.log('factory.setFeeTo', await factory.feeTo())

	const WETH = await hre.ethers.getContractFactory('WETH9')
	const weth = await WETH.deploy()
	await weth.deployed()
	console.log('WETH deployed to:', weth.address)
	const woktAddress = weth.address //localhost

	// const woktAddress = '0x70c1c53E991F31981d592C2d865383AC0d212225' //okex_testnet
    console.log('woktAddress:', woktAddress)

	const Router = await hre.ethers.getContractFactory('UniswapV2Router02')
	const router = await Router.deploy(factory.address, woktAddress)
	await router.deployed()
	console.log('Router deployed to:', router.address)
    console.log('Swap done \n')


    ////////////KKT////////////
    const preMintAddress = adminAddress //20万KKT预挖地址

	const Token = await hre.ethers.getContractFactory('KingKongToken')
	const kkt = await Token.deploy()
	await kkt.deployed()
	console.log('KKT deployed to:', kkt.address)
	
	await kkt.mint(preMintAddress, m(200000))
	console.log('KKT preMintAddress balance:', d(await kkt.balanceOf(preMintAddress)))
	console.log('KKT totalSupply:', d(await kkt.totalSupply()))
    console.log('KKT done \n')


    ////////////Claim////////////
	const Claim = await hre.ethers.getContractFactory('ClaimV2')
	const claim = await Claim.deploy(kkt.address)
	await claim.deployed()
	console.log('ClaimV2 deployed to:', claim.address)
	
	await claim.setUser('0x662546Dcc9f158a9ABb4d1c3B369B07bC67969D6', b(4000))
	console.log('ClaimV2 setUser')
	await claim.setUser('0x3A40066D1dC27d14C721e4135cF02DCb20C9AFE0', b(3000))
	console.log('ClaimV2 setUser')
	await claim.setUser('0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D', b(3000))
	console.log('ClaimV2 setUser')
	console.log('ClaimV2 done \n')


	////////////Farm////////////
	const MasterChef = await hre.ethers.getContractFactory('MasterChef')
	const chef = await MasterChef.deploy(kkt.address, claim.address, m(30), b(0))  //startBlock
	await chef.deployed()
	console.log('MasterChef deployed to:', chef.address)
	
	await kkt.transferOwnership(chef.address, {gasLimit:b(8000000)})
	console.log('KKT ownership transfer to MasterChef')
	
	await delay(10)
	console.log('MasterChef owner is:', await chef.owner())
	console.log('MasterChef dev is:', await chef.devaddr())
	console.log('Farm done \n')
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

async function delay(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000);
    })
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})