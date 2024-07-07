import { ec as EC } from "elliptic";
import { keccak256 } from "ethers/lib/utils";
import EllipticCurve from "elliptic";
const ec = new EllipticCurve.ec("secp256k1");

export const decryptChainData = (logsArray, liqusAddressSignatureKey) => {
    let keyPair: EC.KeyPair | any;
    let calculateSecret;
    let hashedSecret: any;
    let calculated_ss: string | any;
    let publicKey: any;
    let keys: any;
    let x_cor = logsArray[0].x_cor;
    let y_cor = logsArray[0].y_cor;
    let sharedSecret = logsArray[0].sharedSecret;

    keys = `${sharedSecret.replace("0x", "")}04${x_cor.slice(2)}${y_cor.slice(2)}`;
    publicKey = keys.slice(4);
    keyPair = ec.keyFromPublic(publicKey, "hex");
    calculateSecret = liqusAddressSignatureKey.derive(keyPair.getPublic()); //
    hashedSecret = ec.keyFromPrivate(keccak256(calculateSecret.toArray()));
    calculated_ss = calculateSecret.toArray()[0].toString(16) + calculateSecret.toArray()[1].toString(16);

    if (calculated_ss.toString() === keys.slice(0, 4).toString()) {
        const _key = liqusAddressSignatureKey.getPrivate().add(hashedSecret.getPrivate());
        const privateKey = _key.mod(ec.curve.n);
        keys = privateKey.toString(16, 32);
    }

    let chainStuff = {
        calculateSecret,
        hashedSecret,
        calculated_ss,
        privateKey: keys
    };

    return {
        chainStuff: chainStuff,
        keys: keys
    };
};
