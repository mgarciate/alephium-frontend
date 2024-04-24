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

import { hasHardwareAsync } from 'expo-local-authentication'
import { createContext, PropsWithChildren, useContext, useState } from 'react'

import { BiometricAuthenticationStatus } from '~/features/biometrics'
import { useAsyncData } from '~/hooks/useAsyncData'
import { debounceCallback } from '~/utils/time'

// Copied from Uniswap and adapted

export interface BiometricContextValue {
  authenticationStatus: BiometricAuthenticationStatus
  setAuthenticationStatus: (value: BiometricAuthenticationStatus) => void
  deviceSupportsBiometrics: boolean | undefined
}

const biometricContextValue: BiometricContextValue = {
  authenticationStatus: BiometricAuthenticationStatus.Invalid,
  setAuthenticationStatus: () => undefined,
  deviceSupportsBiometrics: undefined
}

const BiometricContext = createContext<BiometricContextValue>(biometricContextValue)

export const BiometricContextProvider = ({ children }: PropsWithChildren<unknown>) => {
  // global authenticationStatus
  const [status, setStatus] = useState<BiometricAuthenticationStatus>(BiometricAuthenticationStatus.Invalid)
  const { triggerDebounce, cancelDebounce } = debounceCallback(
    () => setStatus(BiometricAuthenticationStatus.Invalid),
    10000
  )

  const setAuthenticationStatus = (value: BiometricAuthenticationStatus): void => {
    setStatus(value)

    if (value === BiometricAuthenticationStatus.Authenticated) {
      triggerDebounce()
    } else {
      cancelDebounce()
    }
  }

  const { data: deviceSupportsBiometrics } = useAsyncData(hasHardwareAsync)

  return (
    <BiometricContext.Provider
      value={{
        authenticationStatus: status,
        setAuthenticationStatus,
        deviceSupportsBiometrics
      }}
    >
      {children}
    </BiometricContext.Provider>
  )
}

export const useBiometricContext = (): BiometricContextValue => useContext(BiometricContext)