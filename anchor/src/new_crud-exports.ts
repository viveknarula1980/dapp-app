// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import NewCrudIDL from '../target/idl/crud_dapp.json'
import type { CrudDapp } from '../target/types/crud_dapp'

// Re-export the generated IDL and type
export { CrudDapp, NewCrudIDL }

// The programId is imported from the program IDL.
export const NEW_CRUD_PROGRAM_ID = new PublicKey(NewCrudIDL.address)
// console.log(NEW_CRUD_PROGRAM_ID);

// This is a helper function to get the NewCrud Anchor program.
export function getNewCrudProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...NewCrudIDL, address: address ? address.toBase58() : NewCrudIDL.address } as CrudDapp, provider)
}

// This is a helper function to get the program ID for the NewCrud program depending on the cluster.
export function getNewCrudProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the NewCrud program on devnet and testnet.
      return new PublicKey('4ErH9k9zTnba25vPCRZaRLN3NFBSXtL4KPNGapDzUvz2')
    case 'mainnet-beta':
    default:
      return NEW_CRUD_PROGRAM_ID
  }
}
