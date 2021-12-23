/*
Copyright 2018 - 2021 The Alephium Authors
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

import { Send } from 'lucide-react'
import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router'
import styled, { useTheme } from 'styled-components'

import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import { ModalContext } from '../../components/Modal'
import { Section } from '../../components/PageComponents/PageContainers'
import Spinner from '../../components/Spinner'
import { checkAddressValidity } from '../../utils/addresses'
import { getHumanReadableError } from '../../utils/api'
import { WalletContext } from './WalletRootPage'

const SendPage = () => {
  const history = useHistory()
  const theme = useTheme()
  const { client, wallet, setSnackbarMessage } = useContext(GlobalContext)
  const { addPendingTx } = useContext(WalletContext)

  const { setModalTitle, onClose, overrideOnClose } = useContext(ModalContext)

  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [addressError, setAddressError] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const onCloseButtonPress = (isChecking: boolean) => {
    if (!isChecking) {
      onClose()
    } else {
      setIsChecking(false)
      overrideOnClose(() => () => onCloseButtonPress(false))
      setModalTitle('Send')
    }
  }

  const handleAddressChange = (value: string) => {
    // Check if format is correct

    setAddress(value)
    const validValue = checkAddressValidity(value)

    if (validValue) {
      setAddress(validValue)
      setAddressError('')
    } else {
      setAddressError('Address format is incorrect')
    }
  }

  const handleAmountChange = (value: string) => {
    // const valueToReturn = Number(value).toString() // Remove 0 in front if needed
    setAmount(value)
  }

  const isSendButtonActive = () => address.length > 0 && addressError.length === 0 && amount.length > 0

  const handleSend = async () => {
    if (!isChecking) {
      setIsChecking(true)
      overrideOnClose(() => () => onCloseButtonPress(true))
      setModalTitle('Info Check')
    } else if (wallet && client) {
      // Send it!
      setIsSending(true)

      // Transform amount in qALF (1e-18)
      const fullAmount = BigInt(Number(amount) * 1e18)

      try {
        const txCreateResp = await client.clique.transactionCreate(
          wallet.address,
          wallet.publicKey,
          address,
          fullAmount.toString(),
          undefined
        )

        const { txId, unsignedTx } = txCreateResp.data

        const signature = client.clique.transactionSign(txId, wallet.privateKey)

        const txSendResp = await client.clique.transactionSend(wallet.address, unsignedTx, signature)

        addPendingTx({
          txId: txSendResp.data.txId,
          toAddress: address,
          timestamp: new Date().getTime(),
          amount: fullAmount.toString()
        })

        setSnackbarMessage({ text: 'Transaction sent!', type: 'success' })
        history.push('/wallet')
      } catch (e) {
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while sending the transaction'),
          type: 'alert',
          duration: 5000
        })
      }

      setIsSending(false)
    }
  }

  return (
    <>
      <LogoContent>
        <SendLogo>
          {isSending ? <Spinner size="30%" /> : <Send color={theme.global.accent} size={'70%'} strokeWidth={0.7} />}
        </SendLogo>
      </LogoContent>
      {!isChecking ? (
        <Section>
          <Input
            placeholder="Recipient's address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            error={addressError}
            isValid={address.length > 0 && !addressError}
          />
          <Input
            placeholder="Amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            type="number"
          />
        </Section>
      ) : (
        <CheckTransactionContent address={address} amount={amount} />
      )}
      <Section inList>
        <Button onClick={handleSend} disabled={!isSendButtonActive()}>
          {isChecking ? 'Send' : 'Check'}
        </Button>
      </Section>
    </>
  )
}

const CheckTransactionContent = ({ address, amount }: { address: string; amount: string }) => {
  return (
    <Section>
      <InfoBox text={address} label="Recipient's address" wordBreak />
      <InfoBox text={`${amount} ℵ`} label="Amount" />
    </Section>
  )
}

const LogoContent = styled(Section)`
  flex: 0;
  margin: var(--spacing-4);
`

const SendLogo = styled.div`
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export default SendPage