const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//完整走完一个流程，两个用户挖两个币
describe('KingKongChef-2user-2pool-1', function () {
	let accounts
	let erc
	let erc2
	let kkt
	let chef
	let startBlock
	let rewardPerBlock = 100

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20')
		erc = await ERC.deploy('OKB', b(40), 18)
		await erc.deployed();

		await erc.transfer(accounts[1].address, b(20))
		await erc.transfer(accounts[2].address, b(20))

		erc2 = await ERC.deploy('USDT', b(40), 18)
		await erc2.deployed();

		await erc2.transfer(accounts[1].address, b(20))
		await erc2.transfer(accounts[2].address, b(20))

		const KKT = await ethers.getContractFactory('KingKongToken')
		kkt = await KKT.deploy();
		await kkt.deployed();

		let blockNum = await ethers.provider.getBlockNumber()
		startBlock = blockNum + 2
		const MasterChef = await ethers.getContractFactory('MasterChef')
		chef = await MasterChef.deploy(kkt.address, accounts[0].address, b(rewardPerBlock), b(startBlock))
		await chef.deployed()

		await kkt.transferOwnership(chef.address)
	})

	it('add', async function () {
		await chef.add(b(1), erc.address, true)
		console.log('account0 add')
		await chef.add(b(3), erc2.address, true)
		console.log('account0 add')
		
		await print()
	})

	it('deposit', async function () {
		await erc.connect(accounts[1]).approve(chef.address, b(5))
		console.log('account1 approve erc 5')
		await chef.connect(accounts[1]).deposit(b(0), b(5))
		console.log('account1 deposit erc 5')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('deposit', async function () {
		await erc2.connect(accounts[2]).approve(chef.address, b(5))
		console.log('account2 approve erc2 5')
		await chef.connect(accounts[2]).deposit(b(1), b(5))
		console.log('account2 deposit erc2 5')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('deposit', async function () {
		await erc2.connect(accounts[1]).approve(chef.address, b(15))
		console.log('account1 approve erc2 15')
		await chef.connect(accounts[1]).deposit(b(1), b(15))
		console.log('account1 deposit erc2 15')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('deposit', async function () {
		await erc.connect(accounts[2]).approve(chef.address, b(15))
		console.log('account2 approve erc 15')
		await chef.connect(accounts[2]).deposit(b(0), b(15))
		console.log('account2 deposit erc 15')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('withdraw', async function () {
		await chef.connect(accounts[1]).withdraw(b(0), b(5))
		console.log('account1 withdraw erc 5')

		await print()
	})

	it('withdraw', async function () {
		await chef.connect(accounts[1]).withdraw(b(1), b(15))
		console.log('account1 withdraw erc2 15')

		await print()
	})

	it('withdraw', async function () {
		await chef.connect(accounts[2]).withdraw(b(0), b(15))
		console.log('account2 withdraw erc 15')

		await print()
	})

	it('withdraw', async function () {
		await chef.connect(accounts[2]).withdraw(b(1), b(5))
		console.log('account2 withdraw erc2 5')

		assert(n(await kkt.balanceOf(accounts[0].address)) == 407, 'account0 kkt error')
		assert(n(await erc.balanceOf(accounts[0].address)) == 0, 'account0 erc error')
		assert(n(await erc2.balanceOf(accounts[0].address)) == 0, 'account0 erc error')
		assert(n(await kkt.balanceOf(accounts[1].address)) == 2318, 'account1 kkt error')
		assert(n(await erc.balanceOf(accounts[1].address)) == 20, 'account1 erc error')
		assert(n(await erc2.balanceOf(accounts[1].address)) == 20, 'account1 erc error')
		assert(n(await kkt.balanceOf(accounts[2].address)) == 1756, 'account1 kkt error')
		assert(n(await erc.balanceOf(accounts[2].address)) == 20, 'account1 erc error')
		assert(n(await erc2.balanceOf(accounts[2].address)) == 20, 'account1 erc error')
		assert(n(await kkt.balanceOf(chef.address)) == 1, 'chef kkt error')
		assert(n(await erc.balanceOf(chef.address)) == 0, 'chef erc error')
		assert(n(await erc2.balanceOf(chef.address)) == 0, 'chef erc error')

		await print()
	})


	async function print() {
		console.log('')
		console.log('blockNum:', await ethers.provider.getBlockNumber())
		for (let i=0; i<3; i++) {
			console.log(
				'account' + i + ' kkt:', n(await kkt.balanceOf(accounts[i].address)), 
				'erc_pendingKKT', n(await chef.pendingKKT(b(0), accounts[i].address)),
				'erc2_pendingKKT', n(await chef.pendingKKT(b(1), accounts[i].address)),
				'erc_in_chef:', n((await chef.userInfo(b(0), accounts[i].address)).amount),
				'erc2_in_chef:', n((await chef.userInfo(b(1), accounts[i].address)).amount),
				'erc:', n(await erc.balanceOf(accounts[i].address)),
				'erc2:', n(await erc2.balanceOf(accounts[i].address))
				)
		}
		console.log(
			'chef kkt:', n(await kkt.balanceOf(chef.address)), 
			'erc:', n(await erc.balanceOf(chef.address)),
			'erc2:', n(await erc2.balanceOf(chef.address))
			)
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
