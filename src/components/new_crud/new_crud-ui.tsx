'use client'

import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudDappProgram, useCrudDappProgramAccount } from './new_crud-data-access'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudDappCreate() {
  const { new_create_entry } = useCrudDappProgram()
  const { publicKey} = useWallet();
  const [title , setTitle] = useState("");
  const [ message , setmessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";
  const handleSubmit = () =>{
    if (publicKey && isFormValid){
      new_create_entry.mutateAsync({ title, message, owner: publicKey });
    }
  };
  if(!publicKey){
    return(
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to create an account.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 w-full max-w-xs">
      <div>
          <input type = "text" 
          placeholder='Title'
          value = {title}
          onChange={e => setTitle(e.target.value)} 
          className = "input input-bordered w-full max-w-xs" />
          <textarea 
          placeholder='Message'
          value = {message}
          onChange={e => setmessage(e.target.value)} 
          className = "textarea textarea-bordered w-full max-w-xs" />
        <button
          className="btn btn-xs lg:btn-md btn-primary"
          onClick={handleSubmit}
          disabled={new_create_entry.isPending || !isFormValid}
        >
          Create Entry {new_create_entry.isPending && '...'}
        </button>
      </div>
    </div>
  )
}

export function CrudDappList() {
  const { accounts, getProgramAccount } = useCrudDappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudDappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudDappCard({ account }: { account: PublicKey }) {
  const { accountQuery,
    updateEntry,
    deleteEntry,
   } = useCrudDappProgramAccount({
    account,
  })

  const { publicKey} = useWallet();
  const [ message , setmessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";
  const handleSubmit = () =>{
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };
  if(!publicKey){
    return(
      <div className="alert alert-info flex justify-center">
        <span>Please connect to a wallet to create an account.</span>
      </div>
    );
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
          {accountQuery.data?.title} 
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
          <textarea 
          placeholder='New Message'
          value = {message}
          onChange={e => setmessage(e.target.value)} 
          className = "textarea textarea-bordered w-full max-w-xs" />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={updateEntry.isPending || !isFormValid}
      >
        Update Entry {updateEntry.isPending && '...'}
      </button>

         
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (!window.confirm('Are you sure you want to close this account?')) {
                  return
                }
                const title = accountQuery.data?.title;
                if(title){
                  return deleteEntry.mutateAsync(title)
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Delete 
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
