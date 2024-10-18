export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'airdrop' : IDL.Func([IDL.Vec(IDL.Principal), IDL.Nat], [IDL.Text], []),
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Nat], ['query']),
    'getSymbol' : IDL.Func([], [IDL.Text], ['query']),
    'mint' : IDL.Func([IDL.Nat], [IDL.Text], []),
    'transfer' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
