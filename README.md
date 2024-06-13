<a href="https://klave.com/">
  <img alt="Klave - MultiSig" src="https://klave.com/images/marketplace/klave-multisig.png">
  <h1 align="center">MultiSig Klave implementation</h1>
</a>

<p align="center">
  An implementation on Klave of a multisig smart contract allowing a group (defined by a set of public keys) to sign (with a secret private key) a message.
  For the signature to be available, part or all of the group would have to send an approval with the actual message signed with their own private keys (corresponding to the public keys used to create the group).
</p>

<p align="center">
  <a href="#description"><strong>Description</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#build-locally"><strong>Build Locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>

![Wasm](https://img.shields.io/badge/Webassembly-5E4EE3?style=for-the-badge&labelColor=white&logo=webassembly&logoColor=5E4EE3) ![AssemblyScript](https://img.shields.io/badge/Assemblyscript-3578C7?style=for-the-badge&labelColor=white&logo=assemblyscript&logoColor=3578C7)

## Description

A multisignature (multisig) smart contract is a type of contract that requires multiple parties to approve a transaction before it can be executed. This adds an extra layer of security and control over the funds held by the contract. Multisig contracts are commonly used in scenarios where multiple individuals or entities need to collectively manage and control valuable assets or funds.

Klave-multisig contract provides the following functions:
- Generation of private keys on Klave.
- Creation of multiple parties group (using each party public key).
- Deployment of a contract defining a message to be signed, a private key to be used for the signature, a group to describe the multiple parties. Note that a specific number of signatures (approvals) from authorized parties is required to execute a transaction. This number, known as the threshold, is set during the contract's deployment. For example, a 2-of-3 multisig contract would require two out of three authorized parties to sign and approve a transaction before it can be executed.
- Verification of the contract allowing any user to check whether the threshold has been reached. If verified, the final signature of the message is returned.

## Features

- **Create Private Key:** Either generate or import a private key
- **Manage Group:** Create a group and list the corresponding public keys and associated contracts
- **Create Contract:** Create and manage the deployment/approval/verification of a contract.

## Deploy Your Own

You can deploy your own version of the Klave-MultiSig to Klave with one click:

[![Deploy on Klave](https://klave.com/images/deploy-on-klave.svg)](https://app.klave.com/template/github/secretarium/klave-multisig)

## Build Locally

You can build your into wasm locally, allowing you to validate the hash of the application deployed on Klave.

> Note: You should have node and yarn installed to be able to build locally.

```bash
yarn install
yarn build
```
This will create the .wasm file in the ./klave folder.

## Authors

This library is created by [Klave](https://klave.com) and [Secretarium](https://secretarium.com) team members, with contributions from:

- Jeremie Labbe ([@jlabbeklavo](https://github.com/jlabbeKlavo)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
- Nicolas Marie ([@Akhilleus20](https://github.com/Akhilleus20)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
- Etienne Bosse ([@Gosu14](https://github.com/Gosu14)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)