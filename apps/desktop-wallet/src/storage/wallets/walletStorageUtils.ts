/*
Copyright 2018 - 2024 The Alephium Authors
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

import { Wallet } from '@alephium/shared'

import { syncAddressesData } from '@/storage/addresses/addressesActions'
import AddressMetadataStorage from '@/storage/addresses/addressMetadataPersistentStorage'
import { store } from '@/storage/store'
import { walletSaved } from '@/storage/wallets/walletActions'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { StoredWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'
import { getWalletInitialAddress } from '@/utils/wallet'

interface SaveNewWalletProps {
  walletName: string
  password: string
  wallet: Wallet
}

export const saveNewWallet = ({ walletName, password, wallet }: SaveNewWalletProps): StoredWallet['id'] => {
  const initialAddressSettings = getInitialAddressSettings()
  const storedWallet = WalletStorage.store(walletName, password, wallet)

  store.dispatch(
    walletSaved({
      wallet: { ...storedWallet, mnemonic: wallet.mnemonic },
      initialAddress: { ...getWalletInitialAddress(wallet), ...initialAddressSettings }
    })
  )

  AddressMetadataStorage.store({ index: 0, settings: initialAddressSettings })
  store.dispatch(syncAddressesData())

  return storedWallet.id
}
