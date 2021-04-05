const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

const deployerAddress = '0x0c15c2132381577EfA26C0f0db468d30d1Dcb088'

async function main() {
    const accounts = await hre.ethers.getSigners()
	const devAddress = accounts[1].address
    
    let ercabi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')
    
    const stakeAddress = '0x4C8ef89f82E8A773F6B943200fe56d36DDBaF324'
    
    const token0Address = '0x4C8ef89f82E8A773F6B943200fe56d36DDBaF324'
    const token0 = new ethers.Contract(token0Address, ercabi, accounts[0])
    
    const token1Address = '0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb'
    const token1 = new ethers.Contract(token1Address, ercabi, accounts[0])

	let deployerabi = getAbi('./artifacts/contracts/Deployer.sol/Deployer.json')
	const deployer = new ethers.Contract(deployerAddress, deployerabi, accounts[0])
    
    await deployer.createChef(stakeAddress, accounts[0].address, {gasLimit:BigNumber.from('8000000')})
    await delay(10)

    let allChefsLength = n(await deployer.allChefsLength())
    let chefAddress = await deployer.allChefs(allChefsLength - 1)
    const chefabi = getAbi('./artifacts/contracts/KingChef.sol/KingChef.json')
    let chef = new ethers.Contract(chefAddress, chefabi, accounts[0])
    console.log('deployer allChefsLength:', allChefsLength, chefAddress)
    
    await token0.transfer(chef.address, m(10000), {gasLimit:BigNumber.from('8000000')})
    let blockNum = await ethers.provider.getBlockNumber()
    let startBlock = blockNum + 100
    await chef.addPool(token0.address, m(1), b(startBlock), b(startBlock+10000), accounts[0].address, {gasLimit:BigNumber.from('800000000')})
	console.log('addPool')
    
    await delay(10)
    await token1.transfer(chef.address, m(10000), {gasLimit:BigNumber.from('8000000')})
    await chef.addPool(token1.address, m(1), b(startBlock), b(startBlock+10000), accounts[0].address, {gasLimit:BigNumber.from('800000000')})
	console.log('addPool')

	console.log('done')
}


async function view() {
    const accounts = await hre.ethers.getSigners()
	const devAddress = accounts[1].address

    const ercabi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')

	const deployerabi = getAbi('./artifacts/contracts/Deployer.sol/Deployer.json')
	const deployer = new ethers.Contract(deployerAddress, deployerabi, accounts[0])
    
    const chefabi = getAbi('./artifacts/contracts/KingChef.sol/KingChef.json')
    
    let allChefsLength = n(await deployer.allChefsLength())
    console.log('deployer allChefsLength:', allChefsLength)
    for (let i=0; i<allChefsLength; i++) {
        let chefAddress = await deployer.allChefs(i)
        console.log('createChef address:', chefAddress)

        let chef = new ethers.Contract(chefAddress, chefabi, accounts[0])
        console.log('stakeToken:', await chef.stakeToken())
        for (let i=0; i<9; i++) {
            let poolAddress = await chef.activeArr(i)
            // if (parseInt(poolAddress) > 0) {
                let pool = await chef.poolMap(poolAddress)
                console.log('rewardToken:', pool.rewardToken)
            // }
        }
        console.log('')
    }

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


main().then(view)
// view()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})