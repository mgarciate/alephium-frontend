/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { walletEncryptAsyncUnsafe, walletImportAsyncUnsafe } from '@alephium/sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { changeActiveWallet, storePartialWalletMetadata, storeWallet } from '../storage/wallets'
import { Mnemonic, StoredWalletAuthType } from '../types/wallet'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import { RootState } from './store'
import { loadingFinished, loadingStarted } from './walletGenerationSlice'

const sliceName = 'activeWallet'

export interface ActiveWalletState {
  name: string
  mnemonic: Mnemonic
  isMnemonicBackedUp: boolean
  authType: StoredWalletAuthType | null
  metadataId: string | null
}

const initialState: ActiveWalletState = {
  name: '',
  mnemonic: '',
  isMnemonicBackedUp: false,
  authType: null,
  metadataId: null
}

export const walletStored = createAsyncThunk(
  `${sliceName}/walletStored`,
  async (payload: Omit<ActiveWalletState, 'metadataId'>, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const { name, mnemonic, authType, isMnemonicBackedUp } = payload
    let metadataId: string | null = null

    if (!name) throw 'Could not store wallet, wallet name is not set'
    if (!mnemonic) throw 'Could not store wallet, mnemonic not set'

    // Check if mnemonic is valid
    await walletImportAsyncUnsafe(mnemonicToSeed, mnemonic)

    if (authType === 'biometrics') {
      metadataId = await storeWallet(name, mnemonic, authType, isMnemonicBackedUp)
    } else if (authType === 'pin') {
      const state = getState() as RootState
      const pin = state.credentials.pin
      if (!pin) throw 'Could not store wallet, pin to encrypt it is not set'

      const encryptedWallet = await walletEncryptAsyncUnsafe(pin, mnemonic, pbkdf2)
      metadataId = await storeWallet(name, encryptedWallet, authType, isMnemonicBackedUp)
    }

    dispatch(loadingFinished())

    return {
      name,
      mnemonic,
      authType,
      metadataId,
      isMnemonicBackedUp
    } as ActiveWalletState
  }
)

export const mnemonicBackedUp = createAsyncThunk(
  `${sliceName}/mnemonicBackedUp`,
  async (payload: ActiveWalletState['isMnemonicBackedUp'], { getState, dispatch }) => {
    const isMnemonicBackedUp = payload

    const state = getState() as RootState
    const metadataId = state.activeWallet.metadataId

    if (!metadataId) throw 'Could not store isMnemonicBackedUp, metadataId is not set'

    dispatch(loadingStarted())

    await storePartialWalletMetadata(metadataId, { isMnemonicBackedUp })

    dispatch(loadingFinished())

    return payload
  }
)

export const activeWalletChanged = createAsyncThunk(
  `${sliceName}/activeWalletChanged`,
  async (payload: ActiveWalletState, { dispatch }) => {
    const { metadataId } = payload
    if (!metadataId) throw 'Could not change active wallet, metadataId is not set'

    dispatch(loadingStarted())

    await changeActiveWallet(metadataId)

    dispatch(loadingFinished())

    return payload
  }
)

const activeWalletSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    walletFlushed: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletStored.fulfilled, (_, action) => action.payload)
      .addCase(activeWalletChanged.fulfilled, (_, action) => action.payload)
      .addCase(mnemonicBackedUp.fulfilled, (state, action) => {
        state.isMnemonicBackedUp = action.payload
      })
  }
})

export const { walletFlushed } = activeWalletSlice.actions

export default activeWalletSlice
