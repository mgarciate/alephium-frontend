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

// import { Transaction } from '@alephium/sdk/api/explorer'

import { useTranslation } from 'react-i18next'

import TransactionList from '@/components/TransactionList'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { transfersPageInfoMessageClosed } from '@/storage/global/globalActions'
import { links } from '@/utils/links'

const TransfersPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const infoMessageClosed = useAppSelector((s) => s.global.addressesPageInfoMessageClosed)

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse and download your transaction history. Execute new transfers easily.')}
      isInfoMessageVisible={!infoMessageClosed}
      closeInfoMessage={closeInfoMessage}
      infoMessageLink={links.faq}
      infoMessage={t('You have questions about transfers ? Click here!')}
    >
      <UnlockedWalletPanel top>
        <TransactionList />
      </UnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default TransfersPage
