import { Demo } from './src/contracts/demo';
import { getDefaultSigner, inputSatoshis } from './tests/utils/helper';

(async () => {
  try {
    await Demo.compile();
    const demo = new Demo(1n, 2n);

    // connect to a signer
    await demo.connect(getDefaultSigner());

    // contract deployment
    const deployTx = await demo.deploy(inputSatoshis);
    console.log('Demo contract deployed: ', deployTx.id);

    // contract call
    const { tx: callTx } = await demo.methods.add(3n);
    console.log('Demo contract `add` called: ', callTx.id);
  } catch (error) {
    console.error('Error:', error);
  }
})();
