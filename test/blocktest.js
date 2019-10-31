const qitmeer = require('../src')

// const Bignumber = require('bn.js')

const hex = '08000000e73cc75a85cfc2e5c8f5f020feba27f29a4444fe4cf5eded558304bb6c354b50f4152a670c8820c171306ffd87df9aacc220300b62b345383d1bc3acd771d9fe00000000000000000000000000000000000000000000000000000000000000000000600139beb15ddb6263a30119082819008b9227001fd62700c33b3100e729370064d14900cf4b5600cd176d0036616e0049326f00e0038b0029279100430f99006a739c0083ac9d0059009f00c978a20068b4b400023fb800328fba00e99bbb004fc3c400310cd70086adda00939ff700744a0f0140e80f0154d21701850c1f01beac2401de432c013ee42d0151665501a3745a012c187a01351ca2017ae1af01b921bc0159a7c0017486d1018a5be9011f45eb0101e73cc75a85cfc2e5c8f5f020feba27f29a4444fe4cf5eded558304bb6c354b50010100000001fe8741fb77b0476c839ea35c129f8f3372ae63744ea674e640a939c7e54d4578ffffffffffffffff01007841cb020000001976a9147e43ccfefc7c6cd16fe997aa71cd5e72fbd702ae88ac0000000000000000014f02dd0308f3f175b7a77e83cc1d67726467686e76693331323933333335343434363037353333343135372430323734653036322d666664392d343665392d383062652d636433346361323165623961'
const block = qitmeer.block.fromBuffer(Buffer.from(hex, 'hex'))

console.log(
  block,
  block.toBuffer(true).toString('hex'),
  block.getHash()
)
// console.log (
//     new Bignumber( '989' ).toBuffer().reverse().toString('hex')
// )
// return

// // block
// const data = require('./data/qitmeer.core/core.json')
// const BigNmuber = require('bignumber.js')
// !(function () {
//   const blockdata = data.Block.json
//   const block = new qitmeer.block()
//   // block.version = blockdata.version
//   // Object.keys(block).map( k => {
//   //     console.log ( k, blockdata[k] )
//   //     block[k] = blockdata[k]
//   // })
//   block.version = blockdata.version
//   block.parentRoot = Buffer.from(blockdata.parentRoot, 'hex').reverse()
//   block.txRoot = Buffer.from(blockdata.txRoot, 'hex').reverse()
//   block.stateRoot = Buffer.from(blockdata.stateRoot, 'hex').reverse()
//   block.difficulty = blockdata.difficulty
//   block.height = blockdata.height
//   block.timestamp = new Date(blockdata.timestamp) / 1000
//   block.nonce = blockdata.nonce // blockdata.nonce //
//   const transactions = qitmeer.tx.fromBuffer(Buffer.from('0100000001d8055fdc29a2eb78e9eed1adb6f3ea208f4ff907a4b64cc037df40d886d69450ffffffffffffffff0280461c86000000001976a914e2901efe76aa8604003489a176581c669d6e88dc88ac80b2e60e000000001976a914868b9b6bc7e4a9c804ad3d3d7a2a6be27476941e88ac000000000000000001510164081ecdcf84765f4e5d2067726467686e766933706f6f6c363732333431363235363334393731393833382463663239326138622d346138392d343736312d616465352d376239656261623738393539', 'hex'))
//   block.transactions = [transactions]
//   console.log(
//     BigNmuber( (blockdata.nonce) ).toString(16),
//     block.toBuffer().toString('hex'),
//     qitmeer.block.fromBuffer(Buffer.from('080000000ad2492aca6d17384ae791d20ad7deccb7d67bf0f15d4c53fba067ca4d000000be1a38f4e14b7abe77b6cdd5449cd2698ada2108c7e55fc44643bb54ae1b45c60000000000000000000000000000000000000000000000000000000000000000ffff001e6400000000000000a113825d00000000e912f01d02181f57', 'hex')),
//     block.getHash(),
//     Buffer.from( '571f18021df012e9', 'hex').toString('hex'),
//     BigNmuber('0x'+Buffer.from( '571f18021df012e9', 'hex').toString('hex'))

//   )
//   // for ( let i in blcok) {
//   //     console.log  ( i )
//   // }
// }())
