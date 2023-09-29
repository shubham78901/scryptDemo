import { PrivKey, bsv } from 'scrypt-ts'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

const dotenvConfigPath = '.env'
dotenv.config({ path: dotenvConfigPath })

// fill in private key on testnet in WIF here
let privKey = process.env.PRIVATE_KEY
if (!privKey) {
    genPrivKey()
} else {
    showAddr(bsv.PrivateKey.fromWIF(privKey))
}

export function genPrivKey() {
    const newPrivKey = bsv.PrivateKey.fromRandom(bsv.Networks.testnet)
    console.log(`Missing private key, generating a new one ...
Private key generated: '${newPrivKey.toWIF()}'
You can fund its address '${newPrivKey.toAddress()}' from the sCrypt faucet https://scrypt.io/faucet`)
    // auto generate .env file with new generated key
    fs.writeFileSync(dotenvConfigPath, `PRIVATE_KEY="${newPrivKey}"`)
    privKey = newPrivKey.toWIF()
}

export function showAddr(privKey: bsv.PrivateKey) {
    console.log(`Private key already present ...
You can fund its address '${privKey.toAddress()}' from the sCrypt faucet https://scrypt.io/faucet`)
}

// Initialize privKey as undefined

// Check if PRIVATE_KEY is defined in the environment variables
if (process.env.PRIVATE_KEY) {
    privKey = process.env.PRIVATE_KEY
}

// Initialize myPrivateKey as undefined
let myPrivateKey: bsv.PrivateKey | undefined

// Check if privKey is defined before creating myPrivateKey
if (privKey) {
    myPrivateKey = bsv.PrivateKey.fromWIF(privKey)
}

// Export myPrivateKey, myPublicKey, myPublicKeyHash, and myAddress
export { myPrivateKey }

export const myPublicKey = myPrivateKey
    ? bsv.PublicKey.fromPrivateKey(myPrivateKey)
    : undefined
export const myPublicKeyHash = myPublicKey
    ? bsv.crypto.Hash.sha256ripemd160(myPublicKey.toBuffer())
    : undefined
export const myAddress = myPublicKey ? myPublicKey.toAddress() : undefined
