import {
    AddressOption,
    Network,
    Provider,
    UtxoQueryOptions,
    UTXO,
} from 'scrypt-ts'
import {
    Signer,
    SignatureRequest,
    SignatureResponse,
    SignTransactionOptions,
} from 'scrypt-ts/dist/bsv/abstract-signer'
import axios from 'axios'

import { bsv } from 'scryptlib/dist'
const baseUrl = 'https://dev.neucron.io'

export class NeucronSigner extends Signer {
    private readonly _privateKeys: bsv.PrivateKey[] = []
    private _utxoManagers: any[] = [] // You might need to define the type for this
    private splitFeeTx = false
    private authToken: string

    private credentials: { username: string; password: string } = {
        username: 'adusumalli.balakrishna@gmail.com',
        password: 'Labs@2023',
    }

    constructor(
        privateKey: bsv.PrivateKey | bsv.PrivateKey[],
        provider?: Provider
    ) {
        super(provider)
        if (Array.isArray(privateKey)) {
            this._privateKeys = privateKey
        } else {
            this._privateKeys.push(privateKey)
        }
    }

    enableSplitFeeTx(on: boolean): void {
        this.splitFeeTx = on
    }

    async isAuthenticated(): Promise<boolean> {
        // Implement authentication logic and return a boolean
        return true // Placeholder value
    }

    async requestAuth(): Promise<{ isAuthenticated: boolean; error: string }> {
        const url = `${baseUrl}/auth/login`

        const requestData = {
            email: this.credentials.username,
            password: this.credentials.password,
        }

        try {
            const response = await axios.post(url, requestData, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            if (response.data.status_code === 200) {
                this.authToken = response.data.data.access_token
                return {
                    isAuthenticated: true,
                    error: null,
                }
            } else {
                const error = new Error('Authentication error')
                throw error
            }
        } catch (error) {
            return {
                isAuthenticated: false,
                error: error.message,
            }
        }
    }

    get network(): Network {
        // Implement the logic to get the network
        return bsv.Networks.mainnet // Placeholder value
    }

    async getAddresses() {
        const url = `${baseUrl}/wallet/address`

        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: this.authToken,
                },
            })

            if (response.data.status_code === 200) {
                const addresses = response.data.data.addresses
                return addresses
            } else {
                throw new Error(
                    `Failed to fetch addresses. Status code: ${response.status}`
                )
            }
        } catch (error) {
            throw error
        }
    }

    addPrivateKey(privateKey: bsv.PrivateKey | bsv.PrivateKey[]): this {
        if (Array.isArray(privateKey)) {
            this._privateKeys.push(...privateKey)
        } else {
            this._privateKeys.push(privateKey)
        }
        return this
    }

    checkPrivateKeys(): bsv.Networks.Network {
        // Implement private key validation logic and return the network
        return bsv.Networks.testnet // Placeholder value
    }

    async getDefaultAddress() {
        const url = `${baseUrl}/wallet/keys`

        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: this.authToken,
                },
            })

            if (response.data.status_code === 200) {
                const keys = response.data.data.keys
                if (keys.length > 0) {
                    const defaultAddress = new bsv.Address(keys[0].Address)
                    return defaultAddress
                } else {
                    throw new Error('No Address found in the response.')
                }
            } else {
                throw new Error(`Failed to fetch Addresses`)
            }
        } catch (error) {
            throw error
        }
    }

    async getDefaultPubKey() {
        const url = `${baseUrl}/wallet/keys`

        // eslint-disable-next-line no-useless-catch
        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/json',
                    Authorization: this.authToken,
                },
            })

            if (response.status === 200) {
                const keys = response.data.data.keys
                if (keys.length > 0) {
                    const defaultPubKeyHex = keys[0].Key
                    return new bsv.PublicKey(defaultPubKeyHex)
                } else {
                    throw new Error('No keys found in the response')
                }
            } else {
                throw new Error(`Failed to fetch keys`)
            }
        } catch (error) {
            throw error
        }
    }

    async getPubKey(address: AddressOption): Promise<bsv.PublicKey> {
        bsv.PublicKey.fr
        // Implement logic to get the public key for the provided address
        return bsv.PublicKey.fromString('') // Placeholder value
    }

    async signRawTransaction(
        rawTxHex: string,
        options: SignTransactionOptions
    ): Promise<string> {
        // Implement raw transaction signing logic and return the signed transaction
        return '' // Placeholder value
    }

    async signTransaction(
        tx: bsv.Transaction,
        options?: SignTransactionOptions
    ): Promise<bsv.Transaction> {
        // Implement transaction signing logic and return the signed transaction
        return tx // Placeholder value
    }

    async signMessage(
        message: string,
        address?: AddressOption
    ): Promise<string> {
        // Implement message signing logic and return the signature
        return '' // Placeholder value
    }

    async getSignatures(
        rawTxHex: string,
        sigRequests: SignatureRequest[]
    ): Promise<SignatureResponse[]> {
        // Implement logic to get signatures for the provided transaction and signature requests
        return [] // Placeholder value
    }

    async connect(provider?: Provider): Promise<this> {
        // Implement connection logic and return the instance
        return this // Placeholder value
    }

    async listUnspent(
        address: AddressOption,
        options?: UtxoQueryOptions
    ): Promise<UTXO[]> {
        // Implement logic to list unspent transaction outputs for the provided address and options
        return [] // Placeholder value
    }

    async listUTXO()

    private _getAddressesIn() {
        // Implement logic for _getAddressesIn
    }

    private _checkAddressOption() {
        // Implement logic for _checkAddressOption
    }

    private get _defaultPrivateKey(): bsv.PrivateKey {
        // Implement logic for _defaultPrivateKey
        return this._privateKeys[0] // Placeholder value
    }

    private _getPrivateKeys() {
        // Implement logic for _getPrivateKeys
    }
}
