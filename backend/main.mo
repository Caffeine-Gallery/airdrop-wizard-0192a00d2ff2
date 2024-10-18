import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

actor Token {
    let owner : Principal = Principal.fromText("aaaaa-aa");
    var totalSupply : Nat = 0;
    var symbol : Text = "MYTOKEN";

    private var balances = HashMap.HashMap<Principal, Nat>(1, Principal.equal, Principal.hash);

    public shared(msg) func mint(amount: Nat) : async Text {
        if (msg.caller == owner) {
            let newTokens = amount;
            totalSupply += newTokens;
            let balance = switch (balances.get(owner)) {
                case null 0;
                case (?result) result;
            };
            balances.put(owner, balance + newTokens);
            return "Successfully minted " # debug_show(amount) # " tokens";
        } else {
            return "You are not the owner of this token";
        }
    };

    public shared(msg) func transfer(to: Principal, amount: Nat) : async Text {
        let fromBalance = switch (balances.get(msg.caller)) {
            case null 0;
            case (?result) result;
        };
        if (fromBalance >= amount) {
            let newFromBalance : Nat = fromBalance - amount;
            balances.put(msg.caller, newFromBalance);
            
            let toBalance = switch (balances.get(to)) {
                case null 0;
                case (?result) result;
            };
            let newToBalance = toBalance + amount;
            balances.put(to, newToBalance);
            return "Transfer successful";
        } else {
            return "Insufficient balance";
        }
    };

    public shared(msg) func airdrop(recipients: [Principal], amount: Nat) : async Text {
        if (msg.caller != owner) {
            return "Only the owner can perform airdrops";
        };

        let ownerBalance = switch (balances.get(owner)) {
            case null 0;
            case (?result) result;
        };

        let totalAirdropAmount = amount * recipients.size();
        if (ownerBalance < totalAirdropAmount) {
            return "Insufficient balance for airdrop";
        };

        for (recipient in recipients.vals()) {
            let recipientBalance = switch (balances.get(recipient)) {
                case null 0;
                case (?result) result;
            };
            balances.put(recipient, recipientBalance + amount);
        };

        balances.put(owner, ownerBalance - totalAirdropAmount);
        return "Airdrop successful to " # debug_show(recipients.size()) # " recipients";
    };

    public query func balanceOf(who: Principal) : async Nat {
        switch (balances.get(who)) {
            case null 0;
            case (?result) result;
        }
    };

    public query func getSymbol() : async Text {
        return symbol;
    };
}
