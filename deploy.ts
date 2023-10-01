import { sha256, toByteString, DefaultProvider,bsv,MethodCallOptions, Scrypt, FixedArray } from 'scrypt-ts'
import { HelloWorld } from './src/contracts/helloWorld'
import { Counter } from './src/contracts/counter'
import {  getRandomInt, inputSatoshis, sleep } from './tests/utils/helper'
import { NeucronSigner } from './tests/utils/neucronSigner'
import { CandidateName, Voting, N } from './src/contracts/voting'

;import { NeucronWalletAPI } from './tests/utils/Neucron';
(async () => {
//     const message = 'hello world, sCrypt!'
//     await HelloWorld.compile()
//     const helloWorld = new HelloWorld(sha256(toByteString(message, true)))

//     // connect to a signer

//     // declare your signer
//     const neucron=new NeucronWalletAPI()
//    neucron.authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg1NjM3NDIsImlhdCI6MTY5NTk3MTc0MiwiaXNzIjoiaHR0cHM6Ly9uZXVjcm9uLmlvIiwianRpIjoiMzQ2YThlMWMtZGEyOC00NWI0LWJhYTktMzM2M2JiOGExOGU0IiwibmJmIjoxNjk1OTcxNzQyLCJzdWIiOiI0OWFjNjI3MC04OGNkLTQ5YTktODFiMS0xNDY0OTcyZDk3YTQiLCJ1c2VyX2lkIjoiNDlhYzYyNzAtODhjZC00OWE5LTgxYjEtMTQ2NDk3MmQ5N2E0In0.j34j27qSKqSWZziIOJObKNGqkqqhOK87AeePwUoIqFk"
//     const nec_signer = new NeucronSigner(new DefaultProvider(),neucron)

//     await helloWorld.connect(nec_signer)
//     // contract deployment
    
//     const deployTx = await helloWorld.deploy(10)
//     console.log('HelloWorld contract deployed: ', deployTx.id)

//     // contract call
//     sleep(1)
//     const { tx: callTx } = await helloWorld.methods.unlock(
//         toByteString(message, true)
//     )
//     console.log('HelloWorld contract `unlock` called: ', callTx.id)













await Voting.compile()


    const neucron=new NeucronWalletAPI()
   neucron.authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTg1NjM3NDIsImlhdCI6MTY5NTk3MTc0MiwiaXNzIjoiaHR0cHM6Ly9uZXVjcm9uLmlvIiwianRpIjoiMzQ2YThlMWMtZGEyOC00NWI0LWJhYTktMzM2M2JiOGExOGU0IiwibmJmIjoxNjk1OTcxNzQyLCJzdWIiOiI0OWFjNjI3MC04OGNkLTQ5YTktODFiMS0xNDY0OTcyZDk3YTQiLCJ1c2VyX2lkIjoiNDlhYzYyNzAtODhjZC00OWE5LTgxYjEtMTQ2NDk3MmQ5N2E0In0.j34j27qSKqSWZziIOJObKNGqkqqhOK87AeePwUoIqFk"
    const nec_signer = new NeucronSigner(new DefaultProvider(),neucron)




const candidateNames: FixedArray<CandidateName, typeof N> = [
    toByteString('candidate1', true),
    toByteString('candidate2', true),
    toByteString('candidate3', true),
    toByteString('candidate4', true),
    toByteString('candidate5', true),
    toByteString('candidate6', true),
    toByteString('candidate7', true),
    toByteString('candidate8', true),
    toByteString('candidate9', true),
    toByteString('candidate10', true),
]

const voting = new Voting(candidateNames)
await voting.connect(nec_signer)

const balance = 1

const deployTx = await voting.deploy(balance)
console.log('contract Voting deployed: ', deployTx.id)
sleep(1)
const contract_id = {
    /** The deployment transaction id */
    txId: deployTx.id,
    /** The output index */
    outputIndex: 0,
}

// call the method of current instance to apply the updates on chain
for (let i = 0; i < 5; ++i) {
    const currentInstance = await Scrypt.contractApi.getLatestInstance(
        Voting,
        contract_id
    )

    await currentInstance.connect(nec_signer)
    // create the next instance from the current
    const nextInstance = currentInstance.next()

    const candidateName = candidateNames[getRandomInt(0, N)]

    // read votes Received
    const count = currentInstance.candidates.find(
        (candidate) => candidate.name === candidateName
    )?.votesReceived
    console.log(`${candidateName}'s vote count: ${count}`)

    // update state
    nextInstance.increaseVotesReceived(candidateName)

    // call the method of current instance to apply the updates on chain
    const { tx: tx_i } = await currentInstance.methods.vote(candidateName, {
        next: {
            instance: nextInstance,
            balance,
        },
    } as MethodCallOptions<Voting>)

    console.log(`Voting call tx: ${tx_i.id}`)
    sleep(1)

    }
})()
