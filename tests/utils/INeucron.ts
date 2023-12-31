export interface INeucronWalletAPI {
    isConnect(): Promise<boolean>
    requestAccount(): Promise<string>
    exitAccount(): void
    signTx(options: {
        list: {
            txHex: string
            address: string
            inputIndex: number
            scriptHex: string
            satoshis: number
            sigtype: number
        }[]
    }): Promise<{
        sigList: Array<{ publicKey: string; r: string; s: string; sig: string }>
    }>
    // TODO: add rests
    getAddress(): Promise<string>
    getPublicKey(): Promise<string>
    signMessage(msg: string): Promise<string>
    getBsvBalance(): Promise<{
        address: string
        balance: { confirmed: number; unconfirmed: number; total: number }
    }>
    signTransaction(
        txHex: string,
        inputInfos: {
            inputIndex: number
            scriptHex: string
            satoshis: number
            sighashType: number
            address: number | string
        }[]
    ): Promise<SigResult[]>
}

export interface SigResult {
    sig: string
    publicKey: string
}
