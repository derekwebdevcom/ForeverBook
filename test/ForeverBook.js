const ForeverBook = artifacts.require('./ForeverBook.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('ForeverBook', ([deployer, author, tipper]) => {
  let foreverBook

  before(async () => {
    foreverBook = await foreverBook.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await foreverBook.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await foreverBook.name()
      assert.equal(name, 'ForeverBook')
    })
  })

  describe('posts', async () => {
    let result, postCount

    before(async () => {
      result = await foreverBook.createPost('This is my first post', { from: author })
      postCount = await foreverBook.postCount()
    })

    it('creates posts', async () => {
      // SUCESS
      assert.equal(postCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE: Post must have content
      await foreverBook.createPost('', { from: author }).should.be.rejected;
    })

    it('lists posts', async () => {
      const post = await foreverBook.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.content, 'This is my first post', 'content is correct')
      assert.equal(post.tipAmount, '0', 'tip amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to tip posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await foreverBook.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCESS
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const exepectedBalance = oldAuthorBalance.add(tipAmount)

      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await foreverBook.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
