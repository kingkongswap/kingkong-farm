const { expect, assert } = require('chai')
const { BigNumber } = require('ethers')

describe('uniswap-test', function () {
	let accounts
	let erc
	let factory

	before(async function () {
		accounts = await ethers.getSigners()
	})
	
	it('INIT_CODE_PAIR_HASH', async function () {
        const UniswapV2Factory = await ethers.getContractFactory('UniswapV2Factory')
		factory = await UniswapV2Factory.deploy(accounts[0].address)
		await factory.deployed()

        console.log('INIT_CODE_PAIR_HASH', await factory.INIT_CODE_PAIR_HASH())
	})


    async function print() {
        console.log('')
        let transactionCount = await multisig.transactionCount()
        for (let i=0; i<transactionCount; i++) {
            let tx = await multisig.transactions(i)
            console.log(i, tx.destination, tx.data, tx.executed)
        }
        console.log('')
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
})