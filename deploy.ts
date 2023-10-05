import { sha256, toByteString, DefaultProvider,bsv,MethodCallOptions, PubKeyHash, toHex, PubKey, findSig } from 'scrypt-ts'
import { HelloWorld } from './src/contracts/helloWorld'
import { Counter } from './src/contracts/counter'
import { P2PKH } from './src/contracts/p2pkh'
import {  inputSatoshis, sleep } from './tests/utils/helper'
import { NeucronSigner } from './tests/utils/neucronSigner'

;import { NeucronWalletAPI } from './tests/utils/Neucron';
// import { myPublicKeyHash, myPublicKey } from './tests/utils/privateKey';
(async () => {


const neucron=new NeucronWalletAPI()
   neucron.authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg1NjM3NDIsImlhdCI6MTY5NTk3MTc0MiwiaXNzIjoiaHR0cHM6Ly9uZXVjcm9uLmlvIiwianRpIjoiMzQ2YThlMWMtZGEyOC00NWI0LWJhYTktMzM2M2JiOGExOGU0IiwibmJmIjoxNjk1OTcxNzQyLCJzdWIiOiI0OWFjNjI3MC04OGNkLTQ5YTktODFiMS0xNDY0OTcyZDk3YTQiLCJ1c2VyX2lkIjoiNDlhYzYyNzAtODhjZC00OWE5LTgxYjEtMTQ2NDk3MmQ5N2E0In0.j34j27qSKqSWZziIOJObKNGqkqqhOK87AeePwUoIqFk"
    const nec_signer = new NeucronSigner(new DefaultProvider(),neucron)

    const myPublicKey=await nec_signer.getDefaultPubKey()
    const myPublicKeyHash=bsv.crypto.Hash.sha256ripemd160(myPublicKey.toBuffer())
await P2PKH.compile()
const p2pkh = new P2PKH(PubKeyHash(toHex(myPublicKeyHash)))

// connect to a signer
await p2pkh.connect(nec_signer)

// deploy

const deployTx = await p2pkh.deploy(100)
console.log('P2PKH contract deployed: ', deployTx.id)

// call
sleep(300)
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
