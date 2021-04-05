const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

async function main() {
	const accounts = await hre.ethers.getSigners()

    let user1 = '0x662546Dcc9f158a9ABb4d1c3B369B07bC67969D6'
	let user2 = '0x3A40066D1dC27d14C721e4135cF02DCb20C9AFE0'
	let user3 = '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D'

    const MultiSig = await ethers.getContractFactory('MultiSigWallet')
    multisig = await MultiSig.deploy([user1, user2, user3], b(2))
    await multisig.deployed()
    console.log('MultiSig deployed to:', multisig.address)

    let owners = await multisig.getOwners()
    for (let owner of owners) {
        console.log('owner', owner)
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


main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})