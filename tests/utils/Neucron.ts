import { INeucronWalletAPI, SigResult } from './INeucron'
import axios from 'axios'

export class NeucronWalletAPI implements INeucronWalletAPI {
    authToken: string

    NeucronWalletAPI(authToken:string)
    {
        this.authToken=authToken
    }

    exitAccount(): void {
        this.authToken = ''
    }

    login = async (email: string, password: string): Promise<string | null> => {
        try {
            const requestBody = {
                email,
                password,
            }

            const response = await axios.post(
                'https://dev.neucron.io/v1/auth/login',
                requestBody,
                {
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            )

            const responseBody = response.data

            if (responseBody.data && responseBody.data.access_token) {
                this.authToken = responseBody.data.access_token
                return responseBody.data.access_token
            } else {
                throw new Error('Invalid response structure.')
            }
        } catch (error) {
            throw new Error('Login failed: ' + error.message)
        }
    }

    getAddress = async (): Promise<string> => {
        return await this.requestAccount()
    }

    getBsvBalance = async () => {
        try {
            const response = await axios.get(
                'https://dev.neucron.io/v1/scrypt/balance',
                {
                    headers: {
                        accept: 'application/json',
                        Authorization:
                            this.authToken,
                    },
                }
            )

            const responseBody = response.data

            // Check if the response contains the expected structure.
            if (responseBody.address && responseBody.balance) {
                return responseBody
            } else {
                throw new Error('Invalid response structure.')
            }
        } catch (error) {
            throw new Error('Failed to get BSV balance: ' + error.message)
        }
    }

     getPublicKey = async () => {
        let retries = 3; // Number of retry attempts
        while (retries > 0) {
          try {
            const response = await axios.get('https://dev.neucron.io/v1/scrypt/key', {
              headers: {
                accept: 'application/json',
                Authorization: this.authToken // Replace with your authorization token
              },
            });
      
            const responseBody = response.data;
      
            if (responseBody.public_key) {
             // console.log(responseBody.public_key);
              return responseBody.public_key;
            } else {
              throw new Error('PublicKey not found in the response.');
            }
          } catch (error) {
           // console.error('Error:', error.message);
            retries--; // Decrement the number of retries
            if (retries === 0) {
              throw new Error('Failed to request PublicKey after multiple retries.');
            }
            // Wait for a moment before retrying (you can adjust the delay)
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      };
    isConnect(): Promise<boolean> {
        if (
            this.authToken !== undefined &&
            this.authToken !== '' &&
            this.authToken !== null
        ) {
            return Promise.resolve(true)
        }
        return Promise.resolve(false)
    }

    requestAccount = async () => {
        let retries = 3; // Number of retry attempts
        while (retries > 0) {
            try {
                const response = await axios.get('https://dev.neucron.io/v1/scrypt/key', {
                    headers: {
                        accept: 'application/json',
                        Authorization: this.authToken,
                    },
                });
    
                const responseBody = response.data;
    
                if (responseBody.address !== "") {
                    //console.error(responseBody.address);
                    return responseBody.address;
                } else {
                    throw new Error('Address not found in the response.');
                }
            } catch (error) {
                console.error('Error:', error.message);
                retries--; // Decrement the number of retries
                if (retries === 0) {
                    throw new Error('Failed to request account after multiple retries.');
                }
                // Wait for a moment before retrying (you can adjust the delay)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };
    

    signMessage = async (msg: string): Promise<string> => {
        try {
            const requestBody = {
                message: msg,
            }

            const response = await axios.post(
                'https://dev.neucron.io/v1/tx/mesign',
                requestBody,
                {
                    headers: {
                        accept: 'application/json',
                        Authorization: this.authToken,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const responseBody = response.data

            if (responseBody.data && responseBody.data.signature_b64) {
                return responseBody.data.signature_b64
            } else {
                throw new Error('Invalid response structure.')
            }
        } catch (error) {
            throw new Error('Failed to sign the message: ' + error.message)
        }
    }

    signTransaction = async (
        txHex: string,
        inputInfos: {
            inputIndex: number
            scriptHex: string
            satoshis: number
            sighashType: number
            address: number | string
        }[]
    ): Promise<SigResult[]> => {
        try {
            const requestBody = {
                address: 'string', // Replace with the actual address.
                inputInfos,
                sighashType: 0, // Replace with the actual sighashType.
                txHex: 'string', // Replace with the actual txHex.
            }

            const response = await axios.post(
                'https://dev.neucron.io/v1/scrypt/signtxn',
                requestBody,
                {
                    headers: {
                        accept: 'application/json',
                        Authorization: this.authToken,
                        'Content-Type': 'application/json',
                    },
                }
            )

            const responseBody = response.data
   // console.log(responseBody)
   // console.log("hello shubham")
            if (responseBody.SigResult) {
                return responseBody.SigResult
            } else {
                throw new Error('Invalid response structure.')
            }
        } catch (error) {
            throw new Error('Failed to sign transaction: ' + error.message)
        }
    }
    signTx = async (options: {
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
    }> => {
        let retries = 3; // Number of retry attempts
      //  console.log("hello shubham")
        while (retries > 0) {
            try {
                const requestBody = options;
             //  console.log(requestBody)
                const response = await axios.post(
                    'https://dev.neucron.io/v1/scrypt/signtxl',
                    requestBody,
                    {
                        headers: {
                            accept: 'application/json',
                            Authorization: this.authToken,
                            'Content-Type': 'application/json',
                        },
                    }
                );
    
                const responseBody = response.data;
               // console.log(responseBody.sigList)
                if (responseBody.sigList) {
                  
                  
                  //  console.log("hello shubham2")
                    return { sigList: responseBody.sigList };
                } else {
                    throw new Error('Invalid response structure.');
                }
            } catch (error) {
                console.error('Error:', error.message);
                retries--; // Decrement the number of retries
                if (retries === 0) {

                    throw new Error('Failed to sign the transaction after multiple retries.');
                }
                // Wait for a moment before retrying (you can adjust the delay)
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };
    
}
