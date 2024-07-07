import { Logs } from "./FakeContract";
import { SecureSend } from "./SecureSend";
import fs from "fs";
import { ethers } from "ethers";
import { decryptChainData } from "./decryptChainData";
import { savedLiq } from "./savedLiq";

const runSecureSend = async (options: any) => {
    const secureSend = new SecureSend();
    let logs = new Logs();
    let liqusAddress: any;
    liqusAddress = options.useSavedLiq ? savedLiq : secureSend.createNewKey();

    if (options.dumpKeysToFile) {
        secureSend.dumpDataToFile(liqusAddress, "liq");
    }

    let _liqusAddress = secureSend.getPlatformAddress(liqusAddress);
    let liqusAddressPrivateKey = secureSend.getPlatformPrivateKey(liqusAddress);
    let validatedLiqusKey = secureSend.validateLiqusKey(_liqusAddress);
    let stealthAddress = secureSend.setUpStealthAddress(validatedLiqusKey);
    let _sharedSecret = secureSend.getSharedSecret(stealthAddress);
    let _x_cor = secureSend.getXCor(stealthAddress);
    let _y_cor = secureSend.getYCor(stealthAddress);
    let _stealthAddress = secureSend.getStealthAddress(stealthAddress);
    await logs.transfer(_x_cor, _y_cor, _sharedSecret, _stealthAddress, 1000);
    let downloadk = secureSend.downloadKeys(liqusAddressPrivateKey, _liqusAddress);
    let logsArray = await logs.retrievePubKeys(10);
    let liqusAddressSignatureKey = secureSend.getKeyFromPrivate(liqusAddressPrivateKey);
    let { chainStuff, keys } = decryptChainData(logsArray, liqusAddressSignatureKey);
    let wallet = new ethers.Wallet(keys);

    let response = {
        liqusAddressString: _liqusAddress,
        liqusAddressPrivateKey: liqusAddressPrivateKey,
        keys,
        stealth: {
            ...stealthAddress
        },
        chain: {
            ...chainStuff
        },
        download: downloadk,
        walletAddressFromOnchainData: wallet.address
    };

    if (options.dumpToFile) {
        secureSend.dumpDataToFile(response, "response");
    }

    return response;
};

runSecureSend({
    useSavedLiq: true,
    dumpToFile: true,
    dumpKeysToFile: true
})

