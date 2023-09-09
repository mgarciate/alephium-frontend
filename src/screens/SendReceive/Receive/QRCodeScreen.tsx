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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useCallback } from 'react'
import { Text } from 'react-native'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Button from '~/components/buttons/Button'
import BoxSurface from '~/components/layout/BoxSurface'
import { CenteredScreenSection, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { CloseButton } from '~/screens/SendReceive/ProgressHeader'
import ScreenIntro from '~/screens/SendReceive/ScreenIntro'
import { selectAddressByHash } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'QRCodeScreen'>, ScrollScreenProps {}

const QRCodeScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, params.addressHash))
  const posthog = usePostHog()

  const handleCopyAddressPress = () => {
    posthog?.capture('Copied address', { note: 'Receive screen' })

    copyAddressToClipboard(params.addressHash)
  }

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        headerRight: () => <CloseButton onPress={() => navigation.getParent()?.goBack()} />
      })
    }, [navigation])
  )

  return (
    <ScrollScreen hasHeader verticalGap {...props}>
      <ScreenIntro title="Scan" subtitle="Scan the QR code to send funds to this address." />
      <CenteredScreenSection>
        <QRCodeContainer>
          <QRCode size={200} bgColor={theme.bg.secondary} fgColor={theme.font.primary} value={params.addressHash} />
        </QRCodeContainer>
      </CenteredScreenSection>
      <CenteredScreenSection>
        <Button title="Copy address" onPress={handleCopyAddressPress} iconProps={{ name: 'copy-outline' }} />
      </CenteredScreenSection>
      <ScreenSection>
        <BoxSurface>
          <Row title="Address" isLast={!address?.settings.label}>
            <AddressBadge addressHash={params.addressHash} />
          </Row>

          {address?.settings.label && (
            <Row isLast>
              <Text numberOfLines={1} ellipsizeMode="middle">
                {params.addressHash}
              </Text>
            </Row>
          )}
        </BoxSurface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default QRCodeScreen

const QRCodeContainer = styled.View`
  margin: 15px 0;
  padding: 25px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.primary};
`
