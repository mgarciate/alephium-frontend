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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Skeleton } from 'moti/skeleton'
import { useMemo } from 'react'
import { View, ViewProps } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import { selectAddressIds, selectTotalBalance } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BalanceSummaryProps extends ViewProps {
  dateLabel: string
}

const BalanceSummary = ({ dateLabel, style, ...props }: BalanceSummaryProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const isLoadingAlphBalances = useAppSelector((s) => s.loaders.loadingBalances)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  // const addressesStatus = useAppSelector((s) => s.addresses.status)
  // const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHashes))
  const theme = useTheme()
  // const alphPrice = useAppSelector(selectAlphPrice)

  // const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList | ReceiveNavigationParamList>>()

  // const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()
  // const worthDelta = useWorthDelta(worthInBeginningOfChart)

  // const totalAlphAmountWorth = calculateAmountWorth(totalBalance, alphPrice ?? 0)

  // const deltaColor = worthDelta < 0 ? theme.global.alert : worthDelta > 0 ? theme.global.valid : theme.bg.tertiary

  const handleReceivePress = () => {
    if (addressHashes.length === 1) {
      navigation.navigate('ReceiveNavigation', {
        screen: 'QRCodeScreen',
        params: { addressHash: addressHashes[0] }
      })
    } else {
      navigation.navigate('ReceiveNavigation')
    }
  }

  return (
    <BalanceSummaryContainer style={style} {...props}>
      {/* <LinearGradient
        colors={[
          'transparent',
          addressesStatus === 'uninitialized' && isLoadingLatestTxs
            ? 'transparent'
            : colord(deltaColor).alpha(0.05).toHex(),
          'transparent'
        ]}
        locations={[0.3, 0.65, 1]}
      > */}
      <TextContainer>
        <DateLabelContainer>
          <AppText color="secondary" semiBold>
            {dateLabel}
          </AppText>
        </DateLabelContainer>

        {addressesBalancesStatus === 'uninitialized' ? (
          <View style={{ marginTop: 13 }}>
            <Skeleton show colorMode={theme.name} width={200} height={38} />
          </View>
        ) : (
          <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[currency].symbol} bold size={38} />
        )}
      </TextContainer>

      {/* <ChartContainer>
          <HistoricWorthChart
            currency={currency}
            latestWorth={totalAlphAmountWorth}
            onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
          />
        </ChartContainer> */}

      {totalBalance === BigInt(0) && !isLoadingAlphBalances && addressesStatus === 'initialized' && (
        <ReceiveFundsButtonContainer>
          <Button
            title="Receive assets"
            onPress={handleReceivePress}
            iconProps={{ name: 'arrow-down-outline' }}
            variant="highlight"
            short
          />
        </ReceiveFundsButtonContainer>
      )}
      {/* </LinearGradient> */}
    </BalanceSummaryContainer>
  )
}

export default BalanceSummary

const BalanceSummaryContainer = styled.View``

const TextContainer = styled.View`
  margin: 10px ${DEFAULT_MARGIN + 10}px 15px ${DEFAULT_MARGIN + 10}px;
`

// const ChartContainer = styled.View`
//   margin-right: -1px;
//   margin-left: -1px;
// `

const DateLabelContainer = styled.View``

const ReceiveFundsButtonContainer = styled.View`
  padding: 15px;
`
