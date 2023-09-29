import {
    AddressOption,
    Network,
    parseAddresses,
    Provider,
    toHex,
    UtxoQueryOptions,
} from 'scrypt-ts'
import {
    Signer,
    SignatureRequest,
    SignatureResponse,
    SignTransactionOptions,
} from 'scrypt-ts/dist/bsv/abstract-signer'
// import { UTXO } from 'scrypt-ts';
import { PublicKey, Transaction } from 'bsv'
import { DEFAULT_SIGHASH_TYPE } from 'scryptlib'
import { bsv } from 'scryptlib/dist'
import { INeucronWalletAPI } from './INeucron'

export class NeucronSigner extends Signer {
    static readonly DEBUG_TAG = 'NeucronSigner'
    private _target: INeucronWalletAPI
    private _address: AddressOption

    constructor(provider: Provider) {
        super(provider)
        if (typeof (window as any).neucron !== 'undefined') {
            console.log(NeucronSigner.DEBUG_TAG, 'neucron is installed!')
            // TODO: REPLACE LINE 31 WITH NEUCRON INSTANCE
            this._target = (window as any).neucron
        } else {
            console.warn(NeucronSigner.DEBUG_TAG, 'neucron is not installed')
        }
    }

    /**
     * Check if the wallet has been authenticated
     * @returns {boolean} true | false
     */
    override isAuthenticated(): Promise<boolean> {
        if (this._target) {
            return this._target.isConnect()
        }
        return Promise.resolve(false)
    }

    /**
     * Request wallet authentication
     * @returns A promise which resolves to if the wallet has been authenticated and the authenticate error message
     */
    override async requestAuth(): Promise<{
        isAuthenticated: boolean
        error: string
    }> {
        let isAuthenticated = false
        let error = ''
        try {
            await this.getConnectedTarget()
            isAuthenticated = true
        } catch (e) {
            error = e.toString()
        }
        return Promise.resolve({ isAuthenticated, error })
    }

    private async getConnectedTarget(): Promise<INeucronWalletAPI> {
        const isAuthenticated = await this.isAuthenticated()
        if (!isAuthenticated) {
            // trigger connecting to neucron account when it's not authorized.
            try {
                const addr = await this._target.requestAccount()
                this._address = bsv.Address.fromString(addr)
            } catch (e) {
                throw new Error('neucron requestAccount failed')
            }
        }
        return this._target
    }

    override async connect(provider?: Provider): Promise<this> {
        // we should make sure neucron is connected  before we connect a provider.
        const isAuthenticated = await this.isAuthenticated()

        if (!isAuthenticated) {
            throw new Error('neucron is not connected!')
        }

        if (provider) {
            if (!provider.isConnected()) {
                await provider.connect()
            }
            this.provider = provider
        } else {
            if (this.provider) {
                await this.provider.connect()
            } else {
                throw new Error(`No provider found`)
            }
        }

        return this
    }

    override async getDefaultAddress(): Promise<bsv.Address> {
        const neucron = await this.getConnectedTarget()
        const address = await neucron.getAddress()
        return bsv.Address.fromString(address)
    }

    async getNetwork(): Promise<bsv.Networks.Network> {
        const address = await this.getDefaultAddress()
        return address.network
    }

    override getBalance(
        address?: AddressOption
    ): Promise<{ confirmed: number; unconfirmed: number }> {
        if (address) {
            return this.connectedProvider.getBalance(address)
        }
        return this.getConnectedTarget()
            .then((target) => target.getBsvBalance())
            .then((r) => r.balance)
    }

    override async getDefaultPubKey(): Promise<PublicKey> {
        const neucron = await this.getConnectedTarget()
        const pubKey = await neucron.getPublicKey()
        return Promise.resolve(new bsv.PublicKey(pubKey))
    }

    override async getPubKey(address: AddressOption): Promise<PublicKey> {
        throw new Error(
            `Method ${this.constructor.name}#getPubKey not implemented.`
        )
    }

    override async signRawTransaction(
        rawTxHex: string,
        options: SignTransactionOptions
    ): Promise<string> {
        const sigReqsByInputIndex: Map<number, SignatureRequest> = (
            options?.sigRequests || []
        ).reduce((m, sigReq) => {
            m.set(sigReq.inputIndex, sigReq)
            return m
        }, new Map())
        const tx = new bsv.Transaction(rawTxHex)
        tx.inputs.forEach((_, inputIndex) => {
            const sigReq = sigReqsByInputIndex.get(inputIndex)
            if (!sigReq) {
                throw new Error(
                    `\`SignatureRequest\` info should be provided for the input ${inputIndex} to call #signRawTransaction`
                )
            }
            const script = sigReq.scriptHex
                ? new bsv.Script(sigReq.scriptHex)
                : bsv.Script.buildPublicKeyHashOut(sigReq.address.toString())
            // set ref output of the input
            tx.inputs[inputIndex].output = new bsv.Transaction.Output({
                script,
                satoshis: sigReq.satoshis,
            })
        })

        const signedTx = await this.signTransaction(tx, options)
        return signedTx.toString()
    }

    override async signTransaction(
        tx: Transaction,
        options?: SignTransactionOptions
    ): Promise<Transaction> {
        const network = await this.getNetwork()
        // Generate default `sigRequests` if not passed by user
        const sigRequests: SignatureRequest[] = options?.sigRequests?.length
            ? options.sigRequests
            : tx.inputs.map((input, inputIndex) => {
                  const useAddressToSign =
                      options && options.address
                          ? options.address
                          : input.output?.script.isPublicKeyHashOut()
                          ? input.output.script.toAddress(network)
                          : this._address

                  return {
                      prevTxId: toHex(input.prevTxId),
                      outputIndex: input.outputIndex,
                      inputIndex,
                      satoshis: input.output?.satoshis,
                      address: useAddressToSign,
                      scriptHex: input.output?.script?.toHex(),
                      sigHashType: DEFAULT_SIGHASH_TYPE,
                  }
              })

        const sigResponses = await this.getSignatures(
            tx.toString(),
            sigRequests
        )

        // Set the acquired signature as an unlocking script for the transaction
        tx.inputs.forEach((input, inputIndex) => {
            // TODO: multisig?
            const sigResp = sigResponses.find(
                (sigResp) => sigResp.inputIndex === inputIndex
            )
            if (sigResp && input.output?.script.isPublicKeyHashOut()) {
                const unlockingScript = new bsv.Script('')
                    .add(Buffer.from(sigResp.sig, 'hex'))
                    .add(Buffer.from(sigResp.publicKey, 'hex'))

                input.setScript(unlockingScript)
            }
        })

        return tx
    }

    override async signMessage(
        message: string,
        address?: AddressOption
    ): Promise<string> {
        if (address) {
            throw new Error(
                `${this.constructor.name}#signMessge with \`address\` param is not supported!`
            )
        }
        const neucron = await this.getConnectedTarget()
        return neucron.signMessage(message)
    }

    override async getSignatures(
        rawTxHex: string,
        sigRequests: SignatureRequest[]
    ): Promise<SignatureResponse[]> {
        const network = await this.getNetwork()
        const inputInfos = sigRequests.flatMap((sigReq) => {
            const addresses = parseAddresses(sigReq.address, network)
            return addresses.map((address) => {
                let scriptHex = sigReq.scriptHex
                if (!scriptHex) {
                    scriptHex =
                        bsv.Script.buildPublicKeyHashOut(address).toHex()
                } else if (sigReq.csIdx !== undefined) {
                    scriptHex = bsv.Script.fromHex(scriptHex)
                        .subScript(sigReq.csIdx)
                        .toHex()
                }
                return {
                    txHex: rawTxHex,
                    inputIndex: sigReq.inputIndex,
                    scriptHex,
                    satoshis: sigReq.satoshis,
                    sigtype: sigReq.sigHashType || DEFAULT_SIGHASH_TYPE,
                    address: address.toString(),
                }
            })
        })

        const neucron = await this.getConnectedTarget()
        const sigResults = await neucron.signTx({
            list: inputInfos,
        })

        return inputInfos.map((inputInfo, idx) => {
            return {
                inputIndex: inputInfo.inputIndex,
                sig: sigResults.sigList[idx].sig,
                publicKey: sigResults.sigList[idx].publicKey,
                sigHashType:
                    sigRequests[idx].sigHashType || DEFAULT_SIGHASH_TYPE,
            }
        })
    }
}
