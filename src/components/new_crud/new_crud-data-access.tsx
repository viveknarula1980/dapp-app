'use client'

import { getNewCrudProgram, getNewCrudProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster , PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

interface EntryArgs {
  owner : PublicKey,
  title : string,
  message : string,

}



  export function useCrudDappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getNewCrudProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getNewCrudProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['crud_dapp', 'all', { cluster }],
    queryFn: () => program.account.crudDappEntry.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const new_create_entry = useMutation< string , Error , EntryArgs>({
    mutationKey: ['crud_dapp', 'create', { cluster }],
    mutationFn: async({title , message , owner}) =>{
      const [crudEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title) , owner.toBuffer()],
        programId,
      );
      return program.methods.createEntry(title , message).accounts(crudEntryAddress).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    new_create_entry,
  }
}

export function useCrudDappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { programId , program, accounts } = useCrudDappProgram()

  const accountQuery = useQuery({
    queryKey: ['crud_dapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.crudDappEntry.fetch(account),
  })

  const updateEntry = useMutation< string , Error , EntryArgs>({
    mutationKey: ['crud_dapp', 'update', { cluster }],
    mutationFn: async({title , message , owner}) =>{
      const [crudEntryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from(title) , owner.toBuffer()],
        programId,
      );
      return program.methods.updateEntry(title , message).accounts(crudEntryAddress).rpc();
    },
    onSuccess: signature => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  }) 

    const deleteEntry = useMutation({
      mutationKey: ['crud_dapp', 'delete', { cluster, account }],
      mutationFn: (title : string) => program.methods.deleteEntry(title).accounts(account).rpc(),
      onSuccess: (tx) => {
        transactionToast(tx)
        return accounts.refetch()
      },
    });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
