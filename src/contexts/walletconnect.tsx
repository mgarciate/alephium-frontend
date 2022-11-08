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

import { convertSetToAlph } from '@alephium/sdk'
import { RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'
import SignClient from '@walletconnect/sign-client'
import { SignClientTypes } from '@walletconnect/types'
import { createContext, Dispatch, FC, SetStateAction, useCallback, useContext, useEffect, useState } from 'react'

import { useAddressesContext } from '../contexts/addresses'
import { BuildDeployContractTxData } from '../modals/SendModal/BuildDeployContractTx'
import { BuildScriptTxData } from '../modals/SendModal/BuildScriptTx'
import { BuildTransferTxData } from '../modals/SendModal/BuildTransferTx'
import { extractErrorMsg } from '../utils/misc'
import { useGlobalContext } from './global'

export interface ContextType {
  isWalletConnectModalOpen: boolean
  setIsWalletConnectModalOpen: (isOpen: boolean) => void
  walletConnect?: SignClient
  setWalletConnect: Dispatch<SetStateAction<SignClient | undefined>>
  dappTransactionData?:
    | ['transfer', BuildTransferTxData]
    | ['deploy-contract', BuildDeployContractTxData]
    | ['script', BuildScriptTxData]
    | undefined
  requestEvent?: SignClientTypes.EventArguments['session_request']
  onError: (error: string) => void
}

export const initialContext: ContextType = {
  isWalletConnectModalOpen: false,
  setIsWalletConnectModalOpen: () => undefined,
  walletConnect: undefined,
  setWalletConnect: () => undefined,
  dappTransactionData: undefined,
  requestEvent: undefined,
  onError: (error: string) => undefined
}

export const Context = createContext<ContextType>(initialContext)

const respondError = (
  signClient: SignClient,
  requestEvent: SignClientTypes.EventArguments['session_request'],
  error: string
) => {
  signClient.respond({
    topic: requestEvent.topic,
    response: {
      id: requestEvent.id,
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error
      }
    }
  })
}

const respondResult = (
  signClient: SignClient,
  requestEvent: SignClientTypes.EventArguments['session_request'],
  result: any
) => {
  signClient.respond({
    topic: requestEvent.topic,
    response: {
      id: requestEvent.id,
      jsonrpc: '2.0',
      result: result
    }
  })
}

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { setTxModalType, settings, client } = useGlobalContext()
  const { addresses } = useAddressesContext()
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false)
  const [walletConnect, setWalletConnect] = useState<SignClient>()
  const [dappTransactionData, setDappTransactionData] = useState<ContextType['dappTransactionData']>()
  const [requestEvent, setRequestEvent] = useState<SignClientTypes.EventArguments['session_request']>()

  const setTxData = useCallback(
    (data: Exclude<ContextType['dappTransactionData'], undefined>) => {
      setDappTransactionData(data)
      setTxModalType(data[0])
    },
    [setDappTransactionData, setTxModalType]
  )

  const onError = useCallback(
    (error: string): void => {
      if (walletConnect && requestEvent) {
        respondError(walletConnect, requestEvent, error)
      }
    },
    [walletConnect, requestEvent]
  )

  useEffect(() => {
    if (walletConnect === undefined) {
      SignClient.init({
        // TODO: add as an advanced settings option "WalletConnect Project Id"
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium Wallet',
          description: 'Alephium Wallet',
          url: 'https://github.com/alephium/desktop-wallet/releases',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })
        .then((client) => {
          setWalletConnect(client)
        })
        .catch((e) => {
          console.log('WalletConnect error')
          console.log(e)
        })
      return
    }

    const extractAddress = (signerAddress: string) => {
      const address = addresses.find((a) => a.hash === signerAddress)
      if (typeof address === 'undefined') {
        throw new Error(`Unknown signer address: ${signerAddress}`)
      }
      return address
    }

    const onSessionRequest = async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
      const { params } = requestEvent
      const { request } = params

      setRequestEvent(requestEvent)

      try {
        switch (request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const p = request.params as any as SignTransferTxParams
            const alphAmount = convertSetToAlph(p.destinations[0].attoAlphAmount)
            const txData: BuildTransferTxData = {
              fromAddress: extractAddress(p.signerAddress),
              toAddress: p.destinations[0].address,
              alphAmount: alphAmount,
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }
            setTxData(['transfer', txData])
            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const p = request.params as any as SignDeployContractTxParams
            const initialAlphAmount =
              p.initialAttoAlphAmount !== undefined ? convertSetToAlph(p.initialAttoAlphAmount) : undefined
            const txData: BuildDeployContractTxData = {
              fromAddress: extractAddress(p.signerAddress),
              bytecode: p.bytecode,
              initialAlphAmount: initialAlphAmount,
              issueTokenAmount: p.issueTokenAmount?.toString(),
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }
            setTxData(['deploy-contract', txData])
            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const p = request.params as any as SignExecuteScriptTxParams
            const alphAmount = p.attoAlphAmount !== undefined ? convertSetToAlph(p.attoAlphAmount) : undefined
            const txData: BuildScriptTxData = {
              fromAddress: extractAddress(p.signerAddress),
              bytecode: p.bytecode,
              alphAmount: alphAmount,
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }
            setTxData(['script', txData])
            break
          }
          case 'alph_requestNodeApi': {
            const p = request.params as any as ApiRequestArguments
            const result = await client!.web3.request(p)
            await respondResult(walletConnect, requestEvent, result)
            break
          }
          case 'alph_requestExplorerApi': {
            const p = request.params as any as ApiRequestArguments
            const result = await client!.explorer.request(p)
            await respondResult(walletConnect, requestEvent, result)
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        const error = extractErrorMsg(e)
        console.warn(error)
        respondError(walletConnect, requestEvent, error)
      }
    }

    walletConnect.on('session_request', onSessionRequest)
    return () => {
      walletConnect.removeListener('session_request', onSessionRequest)
    }
  }, [walletConnect, addresses, setTxModalType, settings, setTxData])

  return (
    <Context.Provider
      value={{
        requestEvent,
        isWalletConnectModalOpen,
        setIsWalletConnectModalOpen,
        walletConnect,
        setWalletConnect,
        dappTransactionData,
        onError
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useWalletConnectContext = () => useContext(Context)