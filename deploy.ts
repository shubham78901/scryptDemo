import { sha256, toByteString, DefaultProvider } from 'scrypt-ts'
import { HelloWorld } from './src/contracts/helloWorld'
import {  inputSatoshis } from './tests/utils/helper'
import { NeucronSigner } from './tests/utils/neucronSigner'

;import { NeucronWalletAPI } from './tests/utils/Neucron';
(async () => {
    const message = 'hello world, sCrypt!'
    await HelloWorld.compile()
    const helloWorld = new HelloWorld(sha256(toByteString(message, true)))

    // connect to a signer

    // declare your signer
    const neucron=new NeucronWalletAPI()
   neucron.authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg1NjM3NDIsImlhdCI6MTY5NTk3MTc0MiwiaXNzIjoiaHR0cHM6Ly9uZXVjcm9uLmlvIiwianRpIjoiMzQ2YThlMWMtZGEyOC00NWI0LWJhYTktMzM2M2JiOGExOGU0IiwibmJmIjoxNjk1OTcxNzQyLCJzdWIiOiI0OWFjNjI3MC04OGNkLTQ5YTktODFiMS0xNDY0OTcyZDk3YTQiLCJ1c2VyX2lkIjoiNDlhYzYyNzAtODhjZC00OWE5LTgxYjEtMTQ2NDk3MmQ5N2E0In0.j34j27qSKqSWZziIOJObKNGqkqqhOK87AeePwUoIqFk"
    const nec_signer = new NeucronSigner(new DefaultProvider(),neucron)

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
