import { sha256, toByteString, DefaultProvider,bsv,MethodCallOptions, PubKeyHash, toHex, PubKey, findSig, hash256 } from 'scrypt-ts'
import { HelloWorld } from './src/contracts/helloWorld'
import { Counter } from './src/contracts/counter'
import { P2PKH } from './src/contracts/p2pkh'
import {  inputSatoshis, sleep } from './tests/utils/helper'
import { NeucronSigner } from './tests/utils/neucronSigner'
import { NeucronWalletAPI } from './tests/utils/Neucron';
function reverseHexBytes(hexString: string): string {
    // Remove '0x' prefix if present
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2);
    }
    // Split the hex string into pairs of two characters
    const pairs = hexString.match(/.{1,2}/g) || [];
    // Reverse the order of the pairs
    const reversedPairs = pairs.reverse();
    // Join the reversed pairs to get the reversed hex string
    const reversedHexString = reversedPairs.join('');
    // Add '0x' prefix back if it was removed
    return  reversedHexString;
  }
(async () => {


const neucron=new NeucronWalletAPI()

   neucron.authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg1NjM3NDIsImlhdCI6MTY5NTk3MTc0MiwiaXNzIjoiaHR0cHM6Ly9uZXVjcm9uLmlvIiwianRpIjoiMzQ2YThlMWMtZGEyOC00NWI0LWJhYTktMzM2M2JiOGExOGU0IiwibmJmIjoxNjk1OTcxNzQyLCJzdWIiOiI0OWFjNjI3MC04OGNkLTQ5YTktODFiMS0xNDY0OTcyZDk3YTQiLCJ1c2VyX2lkIjoiNDlhYzYyNzAtODhjZC00OWE5LTgxYjEtMTQ2NDk3MmQ5N2E0In0.j34j27qSKqSWZziIOJObKNGqkqqhOK87AeePwUoIqFk"
    const nec_signer = new NeucronSigner(new DefaultProvider(),neucron)

    const myPublicKey=await nec_signer.getDefaultPubKey()
    const myPublicKeyHash=bsv.crypto.Hash.sha256ripemd160(myPublicKey.toBuffer())
await P2PKH.compile()
console.log("nucron api",toHex(myPublicKeyHash))
const p2pkh = new P2PKH(PubKeyHash(toHex(myPublicKeyHash)))
const x=p2pkh.lockingScript

console.log("p2pkh",p2pkh.pubKeyHash)
console.log("Locking script",x.toASM())
console.log("Locking script",x.toHex())
const scriptHHex = "14127f3dfb2a9db339dd3ff0197815d6d8efe35f855179a95179876952795279ac777777";

// deploy

const y = Buffer.from(hash256(scriptHHex), "hex").reverse().toString('hex')


console.log("scripthash",reverseHexBytes(sha256(scriptHHex)));

p2pkh.connect(nec_signer)

const deployTx = await p2pkh.deploy(100)
console.log('P2PKH contract deployed: ', deployTx.id)

// call
sleep(3)
const { tx: callTx } = await p2pkh.methods.unlock(
    // pass signature, the first parameter, to `unlock`
    // after the signer signs the transaction, the signatures are returned in `SignatureResponse[]`
    // you need to find the signature or signatures you want in the return through the public key or address
    // here we use `myPublicKey` to find the signature because we signed the transaction with `myPrivateKey` before
    (sigResps) => findSig(sigResps, myPublicKey),
    // pass public key, the second parameter, to `unlock`
    PubKey(toHex(myPublicKey)),
    // method call options
    {
        // tell the signer to use the private key corresponding to `myPublicKey` to sign this transaction
        // that is using `myPrivateKey` to sign the transaction
        pubKeyOrAddrToSign: myPublicKey,
    } as MethodCallOptions<P2PKH>
)
console.log('P2PKH contract called: ', callTx.id)
    
})()
