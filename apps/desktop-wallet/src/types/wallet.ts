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

import { AddressKeyPair, Wallet } from '@alephium/shared'

import { AddressBase } from '@/types/addresses'
import { TimeInMs } from '@/types/numbers'

export type ActiveWallet = {
  id: string
  name: string
  mnemonic: string
  passphrase?: string
}

export type GeneratedWallet = {
  wallet: ActiveWallet & StoredWallet
  initialAddress: AddressBase
}

export type UnlockedWallet = {
  wallet: ActiveWallet
  initialAddress: AddressKeyPair
}

export type StoredWallet = {
  id: ActiveWallet['id']
  name: ActiveWallet['name']
  encrypted: string
  lastUsed: TimeInMs
}

export type UnencryptedWallet = Wallet & {
  name: ActiveWallet['name']
}
