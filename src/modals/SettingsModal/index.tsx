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

import { motion } from 'framer-motion'
import { Settings, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { fadeInOutBottomFast } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { TabItem } from '@/components/TabBar'
import GeneralSettingsSection from '@/modals/SettingsModal/GeneralSettingsSection'
import NetworkSettingsSection from '@/modals/SettingsModal/NetworkSettingsSection'
import WalletsSettingsSection from '@/modals/SettingsModal/WalletsSettingsSection'

import ModalContainer from '../ModalContainer'

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const tabs = [
    { value: 'general', label: t('General'), component: <GeneralSettingsSection /> },
    { value: 'wallets', label: t('Wallets'), component: <WalletsSettingsSection /> },
    { value: 'network', label: t('Network'), component: <NetworkSettingsSection /> }
  ]
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  return (
    <ModalContainer onClose={onClose}>
      <CenteredBox role="dialog" {...fadeInOutBottomFast}>
        <TabTitlesColumn>
          <TabTitlesColumnHeader>
            <ColumnTitle>
              <Settings color={theme.font.secondary} strokeWidth={1} />
              {t('Settings')}
            </ColumnTitle>
          </TabTitlesColumnHeader>
          <TabTitlesColumnContent>
            <TabTitles>
              {tabs.map((tab) => (
                <TabTitleButton
                  key={tab.value}
                  role="secondary"
                  wide
                  transparent={currentTab.value !== tab.value}
                  borderless={currentTab.value !== tab.value}
                  onClick={() => setCurrentTab(tab)}
                >
                  {tab.label}
                </TabTitleButton>
              ))}
            </TabTitles>
            <Version>
              {t('Version')}: {import.meta.env.VITE_VERSION}
            </Version>
          </TabTitlesColumnContent>
        </TabTitlesColumn>
        <TabContentsColumn>
          <ColumnHeader>
            <ColumnTitle>{currentTab.label}</ColumnTitle>
            <CloseButton aria-label={t`Close`} onClick={onClose}>
              <X />
            </CloseButton>
          </ColumnHeader>
          <Scrollbar translateContentSizeYToHolder>
            <ColumnContent>{tabs.find((tab) => tab.value === currentTab.value)?.component}</ColumnContent>
          </Scrollbar>
        </TabContentsColumn>
      </CenteredBox>
    </ModalContainer>
  )
}

export default SettingsModal

const CenteredBox = styled(motion.div)`
  display: flex;

  position: relative;
  overflow: hidden;

  width: 100%;
  margin: auto;
  max-width: 748px;
  max-height: 95vh;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.background1};
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
`

const TabTitlesColumn = styled(Column)`
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.background2};
`
const TabContentsColumn = styled(Column)`
  flex: 2;
`

const CloseButton = styled.button`
  color: ${({ theme }) => theme.font.tertiary};
  cursor: pointer;
  transition: color 0.2s ease-out;
  padding: 0;
  display: flex;

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ColumnHeader = styled.div`
  padding: 20px 22px 14px 22px;
  padding-top: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.primary};
`

const ColumnContent = styled.div`
  padding: 30px;
`

const Version = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.tertiary};
  margin-top: var(--spacing-8);
`

const TabTitlesColumnContent = styled(ColumnContent)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px 16px 16px;
  height: 100%;
`

const TabTitles = styled.div``

const TabTitlesColumnHeader = styled(ColumnHeader)`
  padding-left: 22px;
  padding-right: 22px;
`

const TabTitleButton = styled(Button)`
  height: 46px;
  justify-content: flex-start;
  box-shadow: none;

  &:first-child {
    margin-top: 0;
  }
`
