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

import { upperFirst } from 'lodash'
import posthog from 'posthog-js'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Badge from '@/components/Badge'
import DotIcon from '@/components/DotIcon'
import Select from '@/components/Inputs/Select'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import { networkPresetSwitched } from '@/storage/settings/networkActions'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { NetworkName, NetworkNames } from '@/types/network'

interface NetworkSelectOption {
  label: string
  value: NetworkName
}

type NonCustomNetworkName = Exclude<keyof typeof NetworkNames, 'custom'>

const NetworkBadge = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>(network.name)

  const networkNames = Object.values(NetworkNames).filter((n) => n !== 'custom') as NonCustomNetworkName[]

  const networkSelectOptions: NetworkSelectOption[] = networkNames.map((networkName) => ({
    label: {
      mainnet: i18next.t('Mainnet'),
      testnet: i18next.t('Testnet'),
      localhost: i18next.t('Localhost'),
      custom: i18next.t('Custom')
    }[networkName],
    value: networkName
  }))

  const handleNetworkPresetChange = useCallback(
    async (networkName: NetworkName) => {
      if (networkName !== selectedNetwork) {
        setSelectedNetwork(networkName)

        if (networkName === 'custom') {
          // TODO: open settings modal, or reuse previous custom settings if available.
          return
        }

        const newNetworkSettings = networkPresets[networkName]

        const networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(networkName))

          posthog?.capture('Changed network', { network_name: networkName })
          return
        }
      }
    },
    [dispatch, selectedNetwork]
  )

  return (
    <Select
      options={networkSelectOptions}
      onSelect={handleNetworkPresetChange}
      controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
      id="network"
      CustomComponent={SelectCustomComponent}
      noMargin
    />
  )
}

const SelectCustomComponent = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const network = useAppSelector((state) => state.network)

  const networkStatusColor = {
    online: theme.global.valid,
    offline: theme.global.alert,
    connecting: theme.global.accent,
    uninitialized: theme.font.tertiary
  }[network.status]

  return (
    <Badge tooltip={t('Current network')} border>
      <NetworkNameLabel>{upperFirst(network.name)}</NetworkNameLabel>
      <DotIcon color={networkStatusColor} />
    </Badge>
  )
}

const NetworkNameLabel = styled.span`
  margin-right: 10px;
`

export default NetworkBadge
