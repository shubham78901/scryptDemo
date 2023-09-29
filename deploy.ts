import { sha256, toByteString, DefaultProvider } from 'scrypt-ts'
import { HelloWorld } from './src/contracts/helloWorld'
import {  inputSatoshis } from './tests/utils/helper'
import { NeucronSigner } from './tests/utils/neucronSigner'

;(async () => {
    const message = 'hello world, sCrypt!'
    await HelloWorld.compile()
    const helloWorld = new HelloWorld(sha256(toByteString(message, true)))

    // connect to a signer

    // declare your signer
    const nec_signer = new NeucronSigner(new DefaultProvider())

    await helloWorld.connect(nec_signer)
    // contract deployment
    const deployTx = await helloWorld.deploy(inputSatoshis)
    console.log('HelloWorld contract deployed: ', deployTx.id)

    // contract call
    const { tx: callTx } = await helloWorld.methods.unlock(
        toByteString(message, true)
    )
    console.log('HelloWorld contract `unlock` called: ', callTx.id)
})()
