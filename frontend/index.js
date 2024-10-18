import { backend } from 'declarations/backend';
import { Principal } from '@dfinity/principal';

let principal;

async function updateBalance() {
    const balance = await backend.balanceOf(principal);
    document.getElementById('balanceAmount').textContent = balance.toString();
}

async function updateSymbol() {
    const symbol = await backend.getSymbol();
    document.getElementById('tokenSymbol').textContent = symbol;
}

document.getElementById('mintButton').addEventListener('click', async () => {
    const amount = parseInt(document.getElementById('mintAmount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    try {
        const result = await backend.mint(amount);
        document.getElementById('status').textContent = result;
        updateBalance();
    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }
});

document.getElementById('airdropButton').addEventListener('click', async () => {
    const recipients = document.getElementById('recipients').value.split('\n').map(p => Principal.fromText(p.trim()));
    const amount = parseInt(document.getElementById('airdropAmount').value);
    if (recipients.length === 0 || isNaN(amount) || amount <= 0) {
        alert('Please enter valid recipients and amount');
        return;
    }
    try {
        const result = await backend.airdrop(recipients, amount);
        document.getElementById('status').textContent = result;
        updateBalance();
    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }
});

document.getElementById('transferButton').addEventListener('click', async () => {
    const to = Principal.fromText(document.getElementById('transferTo').value.trim());
    const amount = parseInt(document.getElementById('transferAmount').value);
    if (!to || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid recipient and amount');
        return;
    }
    try {
        const result = await backend.transfer(to, amount);
        document.getElementById('status').textContent = result;
        updateBalance();
    } catch (error) {
        document.getElementById('status').textContent = `Error: ${error.message}`;
    }
});

window.addEventListener('load', async () => {
    // For simplicity, we're using a hardcoded principal here.
    // In a real application, you would use authentication to get the user's principal.
    principal = Principal.fromText("aaaaa-aa");
    await updateBalance();
    await updateSymbol();
});
