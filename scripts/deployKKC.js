const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

async function main() {
	const accounts = await hre.ethers.getSigners()
	const devAddress = accounts[1].address

    let ercabi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json')

    const kktAddress = '0x065a7ADF7207c1Be5764dee13317766EFd06320a'
    const kkt = new ethers.Contract(kktAddress, ercabi, accounts[0])
    
    const okbAddress = '0xf8542108F7922A7ef71BF3C7Fd60B81d3245eD31'
    const okb = new ethers.Contract(okbAddress, ercabi, accounts[0])
    
    const nasAddress = '0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb'
    const nas = new ethers.Contract(nasAddress, ercabi, accounts[0])

	const KingKongChef = await hre.ethers.getContractFactory('KingKongChef')
	const chef = await KingKongChef.deploy(kkt.address)
	await chef.deployed()
	console.log('KingKongChef deployed to:', chef.address)
    
    await okb.approve(chef.address, m(100000))
    await delay(10)
    await chef.addPool(okb.address, m(1), m(100000))
    
    await nas.approve(chef.address, m(200000))
    await delay(10)
    await chef.addPool(nas.address, m(2), m(200000))

	console.log('done')

    // KingKongChef deployed to: 0xeF35a1fBeDC0467B71574D4576f81dfC718b8501
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