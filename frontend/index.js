import { backend } from 'declarations/backend';
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from '@dfinity/principal';

let authClient;
let userPrincipal;

async function init() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    }
}

async function login() {
    authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: handleAuthenticated,
    });
}

async function handleAuthenticated() {
    userPrincipal = authClient.getIdentity().getPrincipal();
    document.getElementById('principalId').textContent = userPrincipal.toText();
    document.getElementById('loginButton').style.display = 'none';
    await updateTokenInfo();
    await updateBalance();
    await checkOwner();
}

async function updateTokenInfo() {
    const name = await backend.icrc1_name();
    const symbol = await backend.icrc1_symbol();
    const decimals = await backend.icrc1_decimals();
    const fee = await backend.icrc1_fee();
    const totalSupply = await backend.icrc1_total_supply();

    document.getElementById('tokenName').textContent = name;
    document.getElementById('tokenSymbol').textContent = symbol;
    document.getElementById('tokenDecimals').textContent = decimals.toString();
    document.getElementById('tokenFee').textContent = fee.toString();
    document.getElementById('tokenTotalSupply').textContent = totalSupply.toString();
}

async function updateBalance() {
    if (!userPrincipal) return;
    const balance = await backend.icrc1_balance_of({ owner: userPrincipal, subaccount: [] });
    document.getElementById('balanceAmount').textContent = balance.toString();
}

async function checkOwner() {
    const isOwner = await backend.isOwner();
    document.getElementById('isOwner').textContent = isOwner ? 'Yes' : 'No';
}

document.getElementById('loginButton').addEventListener('click', login);

document.getElementById('transferButton').addEventListener('click', async () => {
    const to = Principal.fromText(document.getElementById('transferTo').value.trim());
    const amount = BigInt(document.getElementById('transferAmount').value);
    if (!to || amount <= 0) {
        alert('Please enter a valid recipient and amount');
        return;
    }
    try {
        const result = await backend.icrc1_transfer({
            from_subaccount: [],
            to: { owner: to, subaccount: [] },
            amount: amount,
            fee: [],
            memo: [],
            created_at_time: []
        });
        if ('Ok' in result) {
            document.getElementById('status').textContent = `Transfer successful`;
        } else {
            document.getElementById('status').textContent = `Transfer failed: ${result.Err}`;
        }
        await updateBalance();
    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }
});

document.getElementById('mintButton').addEventListener('click', async () => {
    const to = Principal.fromText(document.getElementById('mintTo').value.trim());
    const amount = BigInt(document.getElementById('mintAmount').value);
    if (!to || amount <= 0) {
        alert('Please enter a valid recipient and amount');
        return;
    }
    try {
        console.log(`Attempting to mint ${amount} tokens for ${to.toText()}`);
        const result = await backend.mint({ owner: to, subaccount: [] }, amount);
        console.log('Mint result:', result);
        if ('Ok' in result) {
            document.getElementById('status').textContent = `Minting successful`;
        } else {
            document.getElementById('status').textContent = `Minting failed: ${result.Err}`;
        }
        await updateBalance();
        await updateTokenInfo();
    } catch (error) {
        console.error('Minting error:', error);
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }
});

window.addEventListener('load', init);
