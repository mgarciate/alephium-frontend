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

import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/dist/query'

import fungibleTokensSlice from '@/store/assets/fungibleTokensSlice'
import nftsSlice from '@/store/assets/nftsSlice'
import networkSlice from '@/store/network/networkSlice'
import pricesHistorySlice from '@/store/prices/pricesHistorySlice'
import pricesSlice from '@/store/prices/pricesSlice'

export const sharedReducer = {
  [pricesSlice.name]: pricesSlice.reducer,
  [pricesHistorySlice.name]: pricesHistorySlice.reducer,
  [fungibleTokensSlice.name]: fungibleTokensSlice.reducer,
  [nftsSlice.name]: nftsSlice.reducer,
  [networkSlice.name]: networkSlice.reducer
}

const sharedStore = configureStore({
  reducer: sharedReducer,
  devTools: false
})

setupListeners(sharedStore.dispatch)

export type SharedRootState = ReturnType<typeof sharedStore.getState>
export type SharedDispatch = typeof sharedStore.dispatch
