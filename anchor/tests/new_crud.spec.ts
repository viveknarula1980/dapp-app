import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {NewCrud} from '../target/types/new_crud'

describe('new_crud', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.NewCrud as Program<NewCrud>

  const new_crudKeypair = Keypair.generate()

  it('Initialize NewCrud', async () => {
    await program.methods
      .initialize()
      .accounts({
        new_crud: new_crudKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([new_crudKeypair])
      .rpc()

    const currentCount = await program.account.new_crud.fetch(new_crudKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment NewCrud', async () => {
    await program.methods.increment().accounts({ new_crud: new_crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.new_crud.fetch(new_crudKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment NewCrud Again', async () => {
    await program.methods.increment().accounts({ new_crud: new_crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.new_crud.fetch(new_crudKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement NewCrud', async () => {
    await program.methods.decrement().accounts({ new_crud: new_crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.new_crud.fetch(new_crudKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set new_crud value', async () => {
    await program.methods.set(42).accounts({ new_crud: new_crudKeypair.publicKey }).rpc()

    const currentCount = await program.account.new_crud.fetch(new_crudKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the new_crud account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        new_crud: new_crudKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.new_crud.fetchNullable(new_crudKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
