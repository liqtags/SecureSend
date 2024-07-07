import { ethers } from "ethers";

export interface IERC20 {
    balanceOf(address: string): Promise<number>;
    transferFrom(from: string, to: string, amount: number): Promise<boolean>;
    allowance(owner: string, spender: string): Promise<number>;
}

export interface IERC721 {
    ownerOf(tokenId: number): Promise<string>;
    transferFrom(from: string, to: string, tokenId: number): Promise<boolean>;
    getApproved(tokenId: number): Promise<string>;
}

/**
 * Logs class
 * @description A class that is a mock of the solidity contract
 */
export class Logs {
    private totalFunds: number = 0;
    private totalStealthAdd: number = 0;
    private owner: string;
    private logs: { x_cor: string; y_cor: string; sharedSecret: string }[] = [];
    private contractName: string = "Liqus v1";

    constructor() {
        this.owner = ethers.Wallet.createRandom().address;
    }

    public gettotalStealthAddresses(): number {
        return this.totalStealthAdd;
    }

    public getTotalVolume(): number {
        return this.totalFunds;
    }

    private updateTvl(_vol: number): void {
        this.totalFunds += _vol;
        this.totalStealthAdd += 1;
    }

    private publishPubkeys(x_cor: string, y_cor: string, sharedSecret: string): void {
        this.logs.push({ x_cor, y_cor, sharedSecret });
    }

    public pubKeysLen(): number {
        return this.logs.length;
    }

    public async transfer(
        x_cor: string,
        y_cor: string,
        sharedSecret: string,
        target: string,
        value: number
    ): Promise<number> {
        if (value <= 0) throw new Error("Amount should be more than 0");

        this.publishPubkeys(x_cor, y_cor, sharedSecret);
        // Mocking the transfer success
        this.updateTvl(value);
        return value;
    }

    public async transferERC20(
        x_cor: string,
        y_cor: string,
        sharedSecret: string,
        token: IERC20,
        target: string,
        amount: number
    ): Promise<void> {
        if (amount <= 0) throw new Error("Amount should be more than 0");

        const balance = await token.balanceOf(this.owner);
        if (balance < amount) throw new Error("Not enough tokens");

        const allowance = await token.allowance(this.owner, target);
        if (allowance < amount) throw new Error("Not enough allowance");

        this.publishPubkeys(x_cor, y_cor, sharedSecret);
        await token.transferFrom(this.owner, target, amount);
        this.updateTvl(amount);
    }

    public async transferERC721(
        x_cor: string,
        y_cor: string,
        sharedSecret: string,
        token: IERC721,
        target: string,
        tokenId: number
    ): Promise<void> {
        if (!token) throw new Error("Enter the token address");

        const owner = await token.ownerOf(tokenId);
        // if (owner !== this.owner) throw new Error("You are not the owner of this tokenId");

        // const approved = await token.getApproved(tokenId);
        // if (approved !== this.owner) throw new Error("Not approved");

        this.publishPubkeys(x_cor, y_cor, sharedSecret);
        await token.transferFrom(this.owner, target, tokenId);
        this.updateTvl(1);
    }

    public retrievePubKeys(initVal: number): { x_cor: string; y_cor: string; sharedSecret: string }[] {
        const keys = [];
        const j = initVal >= this.logs.length ? this.logs.length : initVal;
        const end = j > 10 ? j - 10 : 0;

        for (let i = j; i > end; i--) {
            keys.push(this.logs[i - 1]);
        }
        return keys;
    }
}