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

import { getStorage, Wallet } from 'alephium-js'
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { AsyncReturnType } from 'type-fest'

import { Modal } from './components/Modal'
import SnackbarManager, { SnackbarMessage } from './components/SnackbarManager'
import Spinner from './components/Spinner'
import SplashScreen from './components/SplashScreen'
import useIdleForTooLong from './hooks/useIdleForTooLong'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/Settings/SettingsPage'
import WalletPages from './pages/Wallet/WalletRootPage'
import CreateWalletPages from './pages/WalletManagement/CreateWalletRootPage'
import ImportWalletPages from './pages/WalletManagement/ImportWalletRootPage'
import { deviceBreakPoints, GlobalStyle } from './style/globalStyles'
import { darkTheme, lightTheme } from './style/themes'
import { createClient } from './utils/api-clients'
import {
  loadStoredSettings,
  NetworkType,
  saveStoredSettings,
  Settings,
  UpdateSettingsFunctionSignature,
  updateStoredSettings,
  useCurrentNetwork
} from './utils/settings'

export interface Context {
  currentUsername: string
  setCurrentUsername: (username: string) => void
  wallet?: Wallet
  setWallet: (w: Wallet | undefined) => void
  client: Client | undefined
  settings: Settings
  updateSettings: UpdateSettingsFunctionSignature
  setSnackbarMessage: (message: SnackbarMessage | undefined) => void
}

type Client = AsyncReturnType<typeof createClient>

export const initialContext: Context = {
  currentUsername: '',
  setCurrentUsername: () => null,
  wallet: undefined,
  setWallet: () => null,
  client: undefined,
  settings: loadStoredSettings(),
  updateSettings: () => null,
  setSnackbarMessage: () => null
}

export const GlobalContext = React.createContext<Context>(initialContext)

const Storage = getStorage()

const App = () => {
  const [splashScreenVisible, setSplashScreenVisible] = useState(true)
  const [wallet, setWallet] = useState<Wallet>()
  const [currentUsername, setCurrentUsername] = useState('')
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | undefined>()
  const [client, setClient] = useState<Client>()
  const [settings, setSettings] = useState<Settings>(loadStoredSettings())
  const [clientIsLoading, setClientIsLoading] = useState(false)
  const history = useHistory()

  const currentNetwork = useCurrentNetwork()
  const previousNetwork = useRef<NetworkType>()

  const lockWallet = () => {
    if (wallet) setWallet(undefined)
  }

  useIdleForTooLong(lockWallet, (settings.general.walletLockTimeInMinutes || 0) * 60 * 1000)

  // Create client
  useEffect(() => {
    const getClient = async () => {
      if (previousNetwork.current === currentNetwork) return

      setClientIsLoading(true)
      // Get clients
      const clientResp = await createClient(settings.network)
      if (clientResp) {
        setClient(clientResp)

        console.log('Clients initialized.')

        setSnackbarMessage({
          text: `Current network: ${currentNetwork}.`,
          type: 'info',
          duration: 4000
        })

        previousNetwork.current = currentNetwork
      } else {
        setSnackbarMessage({ text: `Could not connect to the ${currentNetwork} network.`, type: 'alert' })
      }
      setClientIsLoading(false)
    }

    getClient()
  }, [currentNetwork, setSnackbarMessage, settings.network])

  // Save settings to local storage
  useEffect(() => {
    saveStoredSettings(settings)
  }, [settings])

  const updateSettings: UpdateSettingsFunctionSignature = (settingKeyToUpdate, newSettings) => {
    const updatedSettings = updateStoredSettings(settingKeyToUpdate, newSettings)
    updatedSettings && setSettings(updatedSettings)
    return updatedSettings
  }

  const usernames = Storage.list()
  const hasWallet = usernames.length > 0

  return (
    <ThemeProvider theme={settings.general.theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyle />

      <GlobalContext.Provider
        value={{
          currentUsername,
          setCurrentUsername,
          wallet,
          setWallet,
          client,
          setSnackbarMessage,
          settings,
          updateSettings
        }}
      >
        <AppContainer>
          {splashScreenVisible && <SplashScreen onSplashScreenShown={() => setSplashScreenVisible(false)} />}
          <AnimateSharedLayout type="crossfade">
            <Switch>
              <Route exact path="/create/:step?">
                <CreateWalletPages />
                <Redirect exact from="/create/" to="/create/0" />
              </Route>
              <Route exact path="/import/:step?">
                <ImportWalletPages />
                <Redirect exact from="/import/" to="/import/0" />
              </Route>
              <Route path="/wallet">
                <WalletPages />
              </Route>
              <Route path="">
                <HomePage hasWallet={hasWallet} usernames={usernames} />
              </Route>
            </Switch>
          </AnimateSharedLayout>
          <AnimatePresence exitBeforeEnter initial={false}>
            <Switch>
              <Route path="/settings">
                <Modal
                  title="Settings"
                  onClose={() => history.push(history.location.pathname.replace('/settings', ''))}
                >
                  <SettingsPage />
                </Modal>
              </Route>
            </Switch>
          </AnimatePresence>
        </AppContainer>
        <ClientLoading>{clientIsLoading && <Spinner size="15px" />}</ClientLoading>
        <SnackbarManager message={snackbarMessage} />
      </GlobalContext.Provider>
    </ThemeProvider>
  )
}

const AppContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.secondary};

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
    justify-content: initial;
  }

  @media ${deviceBreakPoints.short} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const ClientLoading = styled.div`
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-5);
  transform: translateX(-50%);
  color: var(--color-white);
`

export default App