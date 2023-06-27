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

import { TokenList } from '@alephium/token-list'
import { createQueryKeyStore } from '@lukemorales/query-key-factory'

import {
  AssetBase,
  UnverifiedFungibleTokenMetadata,
  UnverifiedNFTMetadata,
  VerifiedFungibleTokenMetadata
} from '@/types/assets'
import { NetworkType } from '@/types/network'

import client from '../client'

export const assetsQueries = createQueryKeyStore({
  type: {
    details: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: (): Promise<AssetBase> =>
        client.node.guessStdTokenType(assetId).then((r) => ({ id: assetId, type: r ?? 'unknown' }))
    })
  },
  metadata: {
    allVerifiedTokens: (network: NetworkType) => ({
      queryKey: [network],
      queryFn: (): Promise<VerifiedFungibleTokenMetadata[]> =>
        fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`).then((r) =>
          r.json().then((j: TokenList) => j.tokens.map((v) => ({ ...v, type: 'fungible', verified: true })))
        )
    }),
    unverifiedFungibleToken: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: (): Promise<UnverifiedFungibleTokenMetadata> =>
        client.node
          .fetchFungibleTokenMetaData(assetId)
          .then((r) => ({ id: assetId, type: 'fungible', verified: false, ...r }))
    }),
    unverifiedNFT: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: (): Promise<UnverifiedNFTMetadata> =>
        client.node
          .fetchNFTMetaData(assetId)
          .then((r) => ({ id: assetId, type: 'non-fungible', verified: false, ...r }))
    })
  },
  // TODO: This may be moved in a balancesApi file in the future?
  balances: {
    addressToken: (addressHash: string, tokenId: string) => ({
      queryKey: [addressHash, tokenId],
      queryFn: () =>
        client.explorer.addresses
          .getAddressesAddressTokensTokenIdBalance(addressHash, tokenId)
          .then((balance) => ({ id: tokenId, ...balance }))
    })
  }
})