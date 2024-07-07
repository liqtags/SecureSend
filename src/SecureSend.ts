import { ec as EC } from "elliptic";
import EllipticCurve from "elliptic";
const ec = new EllipticCurve.ec("secp256k1");
import Crc from "./cyclicRedundancyCheck";
import { base58, keccak256 } from "ethers/lib/utils.js";
import fs from "fs";

export class SecureSend {
    private prefix: string;
    private prefixLength: number;
    constructor(prefix: string = "liqus") {
        this.prefix = prefix;
        this.prefixLength = prefix.length;
    }
    public genKeyPair(): EC.KeyPair {
        return ec.genKeyPair();
    }
    public getPrivateKey(key: EC.KeyPair): string {
        return key.getPrivate().toString('hex');
    }
    public getPublicKey(key: EC.KeyPair): any {
        return key.getPublic();
    }
    public getPrivAndPubKey(key: EC.KeyPair): {
        privateKey: string;
        publicKey: any;
    } {
        return {
            privateKey: key.getPrivate().toString('hex'),
            publicKey: key.getPublic()
        }
    }
    public uint8publicKey(key: any): Uint8Array {
        return Uint8Array.from(key.encodeCompressed("array"));
    }
    public checkSum(key: Uint8Array): Uint8Array {
        return Crc(key);
    }
    public addCheckSum(key: Uint8Array, checkSum: Uint8Array): Uint8Array {
        const uint8PubKey: Uint8Array = new Uint8Array(key.length + 2);
        uint8PubKey.set(key);
        uint8PubKey.set(checkSum, key.length);
        return uint8PubKey;
    }
    public addPrefix(key: Uint8Array): string {
        return this.prefix + base58.encode(key);
    }
    public getPrefixLength(): number {
        return this.prefixLength;
    }
    public createNewKey() {
        let key: EC.KeyPair = this.genKeyPair();
        const privateKey: string = this.getPrivateKey(key);
        const publicKey: any = this.getPublicKey(key);
        const uint8publicKey = this.uint8publicKey(publicKey);
        const checkSum = this.checkSum(uint8publicKey);
        const uint8PubKey: Uint8Array = this.addCheckSum(uint8publicKey, checkSum);
        const _liquskey: string = this.addPrefix(uint8PubKey);
        return {
            privateKey: privateKey,
            publicKey: publicKey.encodeCompressed("hex"),
            _liquskey: _liquskey
        }
    }
    public getAddressFromLiqusKey(liqusKey: string): string {
        let sliceoff = liqusKey.slice(this.prefixLength);
        let decoded = base58.decode(sliceoff);
        let address = decoded.slice(0, decoded.length - 2);
        return address.toString();
    }
    public validateLiqusKey(liqusKey: string): any {
        try {
            if (liqusKey.slice(0, this.prefixLength).toLowerCase() === this.prefix.toLowerCase()) {
                const _key = liqusKey.slice(this.prefixLength);
                let decode_Key = base58.decode(_key);
                const decodedkey = decode_Key.subarray(0, 33);
                let key = ec.keyFromPublic(decodedkey, "hex");
                return key;
            } else {
                throw new Error("Prefix is incorrect");
            }
        } catch (error) {
            console.log(error);
        }
    }
    public setUpStealthAddress(rec_fkey: any) {
        try {
            let keyPair = this.genKeyPair();
            let ephemeralPkey = keyPair.getPublic();
            const calculateSecret = keyPair.derive(rec_fkey.getPublic());
            const hashedSecret = ec.keyFromPrivate(keccak256(calculateSecret.toArray()));
            const publicKey = rec_fkey?.getPublic()?.add(hashedSecret.getPublic())?.encode("array", false);
            const _publicKey = publicKey?.splice(1) || []
            const address = keccak256(_publicKey);
            const _HexAddress = address.slice(-40);
            let receipentAddress = "0x" + _HexAddress;
            let x_cor = "0x" + ephemeralPkey?.getX().toString(16, 64) || "";
            let y_cor = "0x" + ephemeralPkey?.getY().toString(16, 64) || "";
            let sharedSecret = "0x" + calculateSecret.toArray()[0].toString(16) + calculateSecret.toArray()[1].toString(16);
            return {
                sharedSecret: sharedSecret,
                stealthAddress: receipentAddress,
                x_cor: x_cor,
                y_cor: y_cor,
            }
        } catch (error) {
            console.log(error);
        }
    }
    public verifySignature = ((sign: any) => {
        if (sign.startsWith('#liqus-signatureKey-')) {
            return sign.replace('#liqus-signatureKey-', '').slice(0, 64);
        }
        else {
            console.log('Invalid Signature File')
        }
    })
    public downloadKeys = (signature:any, liqusKey: any) => {
        return {
            signature: signature,
            liqusKey: liqusKey
        }
    };
    public getPlatformPrivateKey(key: any) {
        return key.privateKey;
    };
    public getPlatformAddress (key: any) {
        return key._liquskey;
    }
    public getSharedSecret (addressCreation:any) {
        return addressCreation.sharedSecret
    }
    public getXCor(addressCreation:any) {
        return addressCreation.x_cor;
    }
    public getYCor(addressCreation:any) {
        return addressCreation.y_cor;
    }
    public getStealthAddress(addressCreation:any) {
        return addressCreation.stealthAddress;
    }
    public getKeyFromPrivate(privateKey: string): EC.KeyPair {
        return ec.keyFromPrivate(privateKey, "hex");
    }
    
    public dumpDataToFile = (data: any, filename: string) => {
        let timestamp = new Date().getTime();
        fs.writeFileSync(`${filename}-${timestamp}.json`, JSON.stringify(data, null, 2));
    }
}