const { expect, assert } = require('chai');
const { BigNumber } = require('ethers');

//完整走完一个流程，先addPool再deposit
describe('KingKongChef-1user-1pool', function () {
	let accounts
	let erc
	let kkt
	let chef

	before(async function () {
		accounts = await ethers.getSigners()

		const ERC = await ethers.getContractFactory('MockERC20');
		erc = await ERC.deploy('OKB', b(100), 18);
		await erc.deployed();

		const KKT = await ethers.getContractFactory('KingKongToken');
		kkt = await KKT.deploy();
		await kkt.deployed();

		const KingKongChef = await ethers.getContractFactory('KingKongChef');
		chef = await KingKongChef.deploy(kkt.address);
		await chef.deployed();

		await kkt.mint(accounts[0].address, b(20))
	})

	it('addPool', async function () {
		await print()

		await erc.approve(chef.address, b(100))
		let blockNum = await ethers.provider.getBlockNumber()
		await chef.addPool(erc.address, b(1), b(blockNum+2), b(blockNum+102), accounts[0].address)
		console.log('account0 addPool')
		
		await print()
	})
	
	it('deposit', async function () {
		await kkt.approve(chef.address, b(20))
		await chef.deposit(b(20))
		console.log('account0 deposit')

		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('harvestAll', async function () {
		await print()
		
		await chef.connect(accounts[0]).harvestAll(accounts[0].address)
		console.log('account0 harvestAll')
		
		await print()
	})

	it('after 10 block', async function () {
		for (let i=0; i<10; i++) {
			await erc.approve(chef.address, b(0)) //空块
		}
	})

	it('withdraw', async function () {
		await print()
		
		await chef.connect(accounts[0]).withdraw(b(20))
		console.log('account0 withdraw')

		assert(n(await kkt.balanceOf(accounts[0].address)) == 20, 'account0 kkt error')
		assert(n(await chef.balanceOf(accounts[0].address)) == 0, 'account0 balance_in_chef error')
		assert(n(await erc.balanceOf(accounts[0].address)) == 22, 'account0 erc error')
		assert(n(await kkt.balanceOf(chef.address)) == 0, 'chef kkt error')
		assert(n(await erc.balanceOf(chef.address)) == 78, 'chef erc error')
		
		await print()
	})

	it('removePool', async function () {
		await print()

		await chef.removePool(erc.address)
		console.log('account0 removePool')
		
		assert(n(await kkt.balanceOf(accounts[0].address)) == 20, 'account0 kkt error')
		assert(n(await chef.balanceOf(accounts[0].address)) == 0, 'account0 balance_in_chef error')
		assert(n(await erc.balanceOf(accounts[0].address)) == 100, 'account0 erc error')
		assert(n(await kkt.balanceOf(chef.address)) == 0, 'chef kkt error')
		assert(n(await erc.balanceOf(chef.address)) == 0, 'chef erc error')
		await print()
	})

	async function print() {
		console.log('')
		console.log('blockNum:', await ethers.provider.getBlockNumber())
		console.log(
			'account0 kkt:', n(await kkt.balanceOf(accounts[0].address)), 
			'balance_in_chef:', n(await chef.balanceOf(accounts[0].address)), 
			'erc:', n(await erc.balanceOf(accounts[0].address))
			)
		console.log(
			'chef kkt:', n(await kkt.balanceOf(chef.address)), 
			'erc:', n(await erc.balanceOf(chef.address))
			)

		let pool = await chef.poolMap(erc.address)
		console.log(
			'pool accPerShare:', pool.accPerShare.toNumber(), 
			'lastRewardBlock:', pool.lastRewardBlock.toNumber(),
			'balance:', n(pool.balance), 'amount:', n(pool.amount)
			)
		console.log(
			'account0 rewardDebt:', n(await chef.rewardDebt(accounts[0].address, erc.address)), 
			'pendingReward', n(await chef.pendingReward(accounts[0].address, erc.address))
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
