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

import dayjs from 'dayjs'
import { AnimatePresence } from 'framer-motion'
import { Codesandbox, HardHat, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import ActionLink from '../../components/ActionLink'
import AddressBadge from '../../components/AddressBadge'
import Amount from '../../components/Amount'
import Button from '../../components/Button'
import ExpandableSection from '../../components/ExpandableSection'
import MainAddressLabel from '../../components/MainAddressLabel'
import OperationBox from '../../components/OperationBox'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Spinner from '../../components/Spinner'
import Table, { TableCell, TableFooter, TableProps, TableRow } from '../../components/Table'
import Truncate from '../../components/Truncate'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import AddressSweepModal from '../../modals/AddressSweepModal'
import NewAddressModal from '../../modals/NewAddressModal'
import { openInWebBrowser } from '../../utils/misc'

const addressesTableHeaders: TableProps['headers'] = [
  { title: 'Address', width: '95px' },
  { title: 'Label', width: '100px' },
  { title: 'Last used', width: '100px' },
  { title: 'Transactions', width: '105px' },
  { title: 'Group', width: '50px' },
  { title: 'ALPH amount', align: 'end', width: '80px' }
]

const tableColumnWidths = addressesTableHeaders.map(({ width }) => width)

const AddressesPage = () => {
  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const { addresses } = useAddressesContext()
  const history = useHistory()
  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false)
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false)
  const [isAddressesGenerationModalOpen, setIsAddressesGenerationModalOpen] = useState(false)
  const theme = useTheme()

  const navigateToAddressDetailsPage = (addressHash: AddressHash) => {
    history.push(`/wallet/addresses/${addressHash}`)
  }

  const balanceSummary = addresses.reduce((acc, row) => acc + BigInt(row.details ? row.details.balance : 0), BigInt(0))

  const sortedAddressList = addresses.sort((a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isMain) return -1
    if (b.settings.isMain) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  })

  return (
    <MainContent>
      <PageTitleRow>
        <PageH1>Addresses</PageH1>
        <Button short onClick={() => setIsGenerateNewAddressModalOpen(true)}>
          + Generate new address
        </Button>
      </PageTitleRow>
      <Table headers={addressesTableHeaders} minWidth="580px">
        {sortedAddressList.map((address) => {
          return (
            <TableRow
              key={address.hash}
              columnWidths={tableColumnWidths}
              onClick={() => navigateToAddressDetailsPage(address.hash)}
            >
              <TableCell>
                <Truncate>{address.hash}</Truncate>
                {address.settings.isMain && <StyledMainAddressLabel />}
              </TableCell>
              <TableCell>
                {address.settings.label ? (
                  <AddressBadge color={address.settings.color} addressName={address.getLabelName()} truncate />
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{address.lastUsed ? dayjs(address.lastUsed).fromNow() : '-'}</TableCell>
              <TableCell>{address.details?.txNumber ?? 0}</TableCell>
              <TableCell>{address.group}</TableCell>
              <TableCellAmount align="end">
                {address.transactions.pending.length > 0 && <Spinner size="12px" />}
                <Amount value={BigInt(address.details?.balance ?? 0)} fadeDecimals />
              </TableCellAmount>
            </TableRow>
          )
        })}
        <TableFooterStyled>
          <TableCell>
            <ActionLink onClick={() => setIsGenerateNewAddressModalOpen(true)}>+ Generate new address</ActionLink>
          </TableCell>
          <Summary align="end">
            <Amount value={balanceSummary} fadeDecimals />
          </Summary>
        </TableFooterStyled>
      </Table>
      <PageH2>Advanced management</PageH2>
      <Description>
        Advanced operations reserved to more experienced users. A “normal” user should not need to use them very often,
        if not at all.
      </Description>
      <ExpandableSection
        sectionTitleClosed="Show operations"
        sectionTitleOpen="Hide operations"
        open={isAdvancedSectionOpen}
        onOpenChange={(isOpen) => setIsAdvancedSectionOpen(isOpen)}
      >
        <AdvancedOperations>
          <OperationBox
            title="Consolidate UTXOs"
            Icon={<Codesandbox color="#64f6c2" strokeWidth={1} size={46} />}
            description="Consolidate (merge) your UTXOs into one."
            buttonText="Start"
            onButtonClick={() => setIsConsolidationModalOpen(true)}
            infoLink="https://wiki.alephium.org/"
          />
          <OperationBox
            title="Generate one address per group"
            Icon={<HardHat color="#a880ff" strokeWidth={1} size={55} />}
            description="Useful for miners or DeFi use."
            buttonText="Start"
            onButtonClick={() => setIsAddressesGenerationModalOpen(true)}
            infoLink="https://wiki.alephium.org/"
          />
          <OperationBox
            placeholder
            title="More to come..."
            Icon={<Lightbulb color={theme.font.secondary} strokeWidth={1} size={28} />}
            description="You have great ideas you want to share?"
            buttonText="Tell us!"
            onButtonClick={() => openInWebBrowser('https://discord.com/channels/747741246667227157/930164826418860032')}
          />
        </AdvancedOperations>
      </ExpandableSection>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isGenerateNewAddressModalOpen && (
          <NewAddressModal singleAddress title="New address" onClose={() => setIsGenerateNewAddressModalOpen(false)} />
        )}
        {isConsolidationModalOpen && <AddressSweepModal onClose={() => setIsConsolidationModalOpen(false)} />}
        {isAddressesGenerationModalOpen && (
          <NewAddressModal
            title="Generate one address per group"
            onClose={() => setIsAddressesGenerationModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </MainContent>
  )
}

const TableFooterStyled = styled(TableFooter)`
  grid-auto-columns: 1fr;
`

const Summary = styled(TableCell)`
  color: ${({ theme }) => theme.font.highlight};
`

const Description = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const AdvancedOperations = styled.div`
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.accent};
  padding: 26px 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
`

const TableCellAmount = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`

const StyledMainAddressLabel = styled(MainAddressLabel)`
  margin-top: 2px;
`

export default AddressesPage
