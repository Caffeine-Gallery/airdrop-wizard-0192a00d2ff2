import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Result "mo:base/Result";

actor Token {
    // ICRC-1 Types
    public type Account = { owner : Principal; subaccount : ?[Nat8] };
    public type TransferArgs = {
        from_subaccount : ?[Nat8];
        to : Account;
        amount : Nat;
        fee : ?Nat;
        memo : ?[Nat8];
        created_at_time : ?Nat64;
    };
    public type TransferResult = Result.Result<Nat, Text>;

    private stable var owner_ : Principal = Principal.fromText("aaaaa-aa");
    private stable var totalSupply_ : Nat = 0;
    private stable var symbol_ : Text = "ICPTKN";
    private stable var name_ : Text = "ICP Token";
    private stable var decimals_ : Nat8 = 8;
    private stable var fee_ : Nat = 0;

    private func accountsEqual(lhs : Account, rhs : Account) : Bool {
        Principal.equal(lhs.owner, rhs.owner) and
        (switch (lhs.subaccount, rhs.subaccount) {
            case (null, null) true;
            case (?l, ?r) Array.equal(l, r, Nat8.equal);
            case _ false;
        })
    };

    private func accountsHash(account : Account) : Nat32 {
        let ownerHash = Principal.hash(account.owner);
        switch (account.subaccount) {
            case null ownerHash;
            case (?subaccount) {
                let subaccountHash = Array.foldLeft<Nat8, Nat32>(subaccount, 0, func (acc, byte) {
                    (acc << 8) | Nat32.fromNat(Nat8.toNat(byte))
                });
                ownerHash ^ subaccountHash
            };
        }
    };

    private var balances = HashMap.HashMap<Account, Nat>(1, accountsEqual, accountsHash);

    // ICRC-1 required functions
    public shared query func icrc1_name() : async Text { name_ };
    public shared query func icrc1_symbol() : async Text { symbol_ };
    public shared query func icrc1_decimals() : async Nat8 { decimals_ };
    public shared query func icrc1_fee() : async Nat { fee_ };
    public shared query func icrc1_total_supply() : async Nat { totalSupply_ };

    public shared query func icrc1_balance_of(account : Account) : async Nat {
        _balanceOf(account)
    };

    public shared({ caller }) func icrc1_transfer(args : TransferArgs) : async TransferResult {
        let from = { owner = caller; subaccount = args.from_subaccount };
        if (_balanceOf(from) < args.amount + fee_) {
            return #err("Insufficient balance");
        };
        
        _transfer(from, args.to, args.amount);
        #ok(0) // Transfer index, always 0 in this simple implementation
    };

    // Mint function (not part of ICRC-1, but useful for testing)
    public shared({ caller }) func mint(to : Account, amount : Nat) : async TransferResult {
        if (caller != owner_) {
            return #err("Only the owner can mint tokens");
        };
        let fromBalance = _balanceOf({ owner = owner_; subaccount = null });
        balances.put({ owner = owner_; subaccount = null }, fromBalance + amount);
        let toBalance = _balanceOf(to);
        balances.put(to, toBalance + amount);
        totalSupply_ += amount;
        #ok(0)
    };

    // Helper functions
    private func _balanceOf(account : Account) : Nat {
        switch (balances.get(account)) {
            case null 0;
            case (?balance) balance;
        }
    };

    private func _transfer(from : Account, to : Account, amount : Nat) {
        let fromBalance = _balanceOf(from);
        balances.put(from, fromBalance - amount - fee_);
        let toBalance = _balanceOf(to);
        balances.put(to, toBalance + amount);
    };
};
