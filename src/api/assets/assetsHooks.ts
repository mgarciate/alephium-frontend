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

import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'
import { flatMap } from 'lodash'

import { queries } from '@/api'
import { useVerifiedTokensMetadata } from '@/contexts/staticDataContext'
import { useQueriesData } from '@/hooks/useQueriesData'
import { UnverifiedNFTMetadataWithFile, VerifiedFungibleTokenMetadata } from '@/types/assets'

export const useAssetMetadata = (assetId: string) => {
  const isAlph = assetId === ALPH.id

  const verifiedTokenMetadata = useVerifiedTokensMetadata()?.get(assetId)

  const { data: assetBaseRaw } = useQuery({
    ...queries.assets.type.one(assetId),
    enabled: !isAlph && !verifiedTokenMetadata
  })
  const assetType = assetBaseRaw?.type

  const { data: unverifiedFungibleTokenMetadata } = useQuery({
    ...queries.assets.metadata.unverifiedFungibleToken(assetId),
    enabled: !isAlph && !verifiedTokenMetadata && assetType === 'fungible'
  })

  const { data: unverifiedNFTMetadata } = useQuery({
    ...queries.assets.metadata.unverifiedNFT(assetId),
    enabled: !isAlph && !verifiedTokenMetadata && assetType === 'non-fungible'
  })

  const { data: nftData } = useQuery({
    ...queries.assets.nftFile.detail(assetId, unverifiedNFTMetadata?.tokenUri ?? ''),
    enabled: !isAlph && assetType === 'non-fungible' && !!unverifiedNFTMetadata?.tokenUri
  })

  const unverifiedNFTMetadataWithFile: UnverifiedNFTMetadataWithFile | undefined = unverifiedNFTMetadata
    ? { ...unverifiedNFTMetadata, file: nftData }
    : undefined

  if (isAlph) return { ...ALPH, type: 'fungible', verified: true } as VerifiedFungibleTokenMetadata

  return (
    verifiedTokenMetadata ||
    unverifiedNFTMetadataWithFile ||
    unverifiedFungibleTokenMetadata || { id: assetId, type: undefined, verified: false }
  )
}

export const useAssetsMetadata = (assetIds: string[] = []) => {
  const allVerifiedTokensMetadata = useVerifiedTokensMetadata()

  const ids = assetIds.filter((id) => id !== ALPH.id)
  const isAlphIn = assetIds.length !== ids.length

  const verifiedTokensMetadata = Array.from(allVerifiedTokensMetadata || []).flatMap(([id, m]) =>
    assetIds.includes(id) ? m : []
  )

  const unverifiedAssetIds = ids.filter((id) => !verifiedTokensMetadata.some((vt) => vt.id === id))

  const { data: unverifiedAssets, isLoading: unverifiedAssetsLoading } = useQueriesData(
    unverifiedAssetIds.map((id) => queries.assets.type.one(id))
  )

  const { data: unverifiedTokensMetadata, isLoading: unverifiedTokensMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'fungible' ? { ...queries.assets.metadata.unverifiedFungibleToken(id) } : []
    )
  )

  const { data: unverifiedNFTsMetadata, isLoading: unverifiedNFTsMetadataLoading } = useQueriesData(
    flatMap(unverifiedAssets, ({ id, type }) =>
      type === 'non-fungible' ? queries.assets.metadata.unverifiedNFT(id) : []
    )
  )

  const { data: NFTFiles } = useQueriesData(
    flatMap(unverifiedNFTsMetadata, ({ id, tokenUri }) => queries.assets.nftFile.detail(id, tokenUri))
  )

  const unverifiedNFTsMetadataWithFiles: UnverifiedNFTMetadataWithFile[] = unverifiedNFTsMetadata.map((m) => ({
    ...m,
    file: NFTFiles.find((f) => f.assetId === m.id)
  }))

  if (isAlphIn) {
    verifiedTokensMetadata.unshift({ ...ALPH, type: 'fungible', verified: true })
  }

  return {
    fungibleTokens: [...verifiedTokensMetadata, ...unverifiedTokensMetadata],
    nfts: unverifiedNFTsMetadataWithFiles,
    isLoading:
      !allVerifiedTokensMetadata ||
      unverifiedAssetsLoading ||
      unverifiedTokensMetadataLoading ||
      unverifiedNFTsMetadataLoading
  }
}