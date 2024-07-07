# SecureSend

SecureSend is a library for Anonymous & Secure transactions on EVM networks and enables functionality to get funds privately without sharing wallet address

SecureSend enables stealth addresses and a one-time public key creation mechanism, making it hard to trace or monitor transactions by anyone else. This ensures enhanced privacy and confidentiality.

## Features

- Unique Address Generation
- Secure Fund Transfer
- Privacy Protection
- Mock contract as typescript class

## Disclaimer
It's made for educational purposes only. 

## Methods

Here is a list of methods available.

| Method                      | Description                                                                                              |
|-----------------------------|----------------------------------------------------------------------------------------------------------|
| `genKeyPair`                | Generates a new public-private key pair.                                                                 |
| `getPrivateKey`             | Retrieves the private key from the generated key pair.                                                   |
| `getPublicKey`              | Retrieves the public key from the generated key pair.                                                    |
| `getPrivAndPubKey`          | Retrieves both the private and public keys.                                                              |
| `uint8publicKey`            | Converts the public key to a UInt8Array format.                                                          |
| `checkSum`                  | Calculates the checksum for a given key.                                                                 |
| `addCheckSum`               | Adds a checksum to a key.                                                                                |
| `addPrefix`                 | Adds a prefix to the key for identification.                                                             |
| `getPrefixLength`           | Retrieves the length of the prefix used in keys.                                                         |
| `createNewKey`              | Generates a new key with a prefix and checksum.                                                          |
| `getAddressFromLiqusKey`    | Derives an address from the given Liqus key.                                                             |
| `validateLiqusKey`          | Validates the given Liqus key to ensure it is correct.                                                   |
| `setUpStealthAddress`       | Sets up a stealth address for anonymous transactions.                                                    |
| `getPlatformPrivateKey`     | Retrieves the platform's private key for internal use.                                                   |
| `getPlatformAddress`        | Retrieves the platform's address derived from its private key.                                           |
| `getSharedSecret`           | Computes a shared secret between two keys for secure communication.                                      |
| `getXCor`                   | Retrieves the X coordinate of a public key point.                                                        |
| `getYCor`                   | Retrieves the Y coordinate of a public key point.                                                        |
| `getStealthAddress`         | Generates a stealth address for receiving funds anonymously.                                             |
| `getKeyFromPrivate`         | Derives a public key from a given private key. 