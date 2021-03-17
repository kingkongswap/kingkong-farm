const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

async function main() {
	const accounts = await hre.ethers.getSigners()
	const devAddress = accounts[1].address

    let ercabi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')

    const kktAddress = '0x4962Bf3133dFb5630e3fEd6bb55AC35731BCa3fF'
    const kkt = new ethers.Contract(kktAddress, ercabi, accounts[0])
    
    const nasAddress = '0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb'
    const nas = new ethers.Contract(nasAddress, ercabi, accounts[0])

	const Deployer = await hre.ethers.getContractFactory('Deployer')
	const deployer = await Deployer.deploy()
	await deployer.deployed()
	console.log('Deployer deployed to:', deployer.address)
    
    await deployer.createChef(kkt.address, accounts[0].address, {gasLimit:BigNumber.from('8000000')})
    await delay(10)

    chefAddress = await deployer.allChefs(0)
    console.log('createChef address:', chefAddress)

    const chefabi = getAbi('./artifacts/contracts/KingChef.sol/KingChef.json')
    const chef = new ethers.Contract(chefAddress, chefabi, accounts[0])
    
    await kkt.transfer(chef.address, m(10000), {gasLimit:BigNumber.from('8000000')})
    let blockNum = await ethers.provider.getBlockNumber()
    startBlock = blockNum + 100
    await chef.addPool(kkt.address, m(1), b(startBlock), b(startBlock+10000), accounts[0].address, {gasLimit:BigNumber.from('800000000')})
	console.log('addPool')
    
    // await delay(10)
    // await nas.transfer(chef.address, m(10000), {gasLimit:BigNumber.from('8000000')})
    // await chef.addPool(nas.address, m(1), b(startBlock), b(startBlock+10000), accounts[0].address, {gasLimit:BigNumber.from('800000000')})
	// console.log('addPool')

	console.log('done')
}


function getAbi(jsonPath) {
    let file = fs.readFileSync(jsonPath)
    let abi = JSON.parse(file.toString()).abi
    return abi
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