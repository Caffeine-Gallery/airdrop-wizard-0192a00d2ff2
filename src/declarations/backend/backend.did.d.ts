import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'airdrop' : ActorMethod<[Array<Principal>, bigint], string>,
  'balanceOf' : ActorMethod<[Principal], bigint>,
  'getSymbol' : ActorMethod<[], string>,
  'mint' : ActorMethod<[bigint], string>,
  'transfer' : ActorMethod<[Principal, bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
