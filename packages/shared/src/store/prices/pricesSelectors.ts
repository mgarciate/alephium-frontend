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

import { ALPH } from '@alephium/token-list'
import { createSelector } from '@reduxjs/toolkit'

import { tokenPricesAdapter, tokenPricesHistoryAdapter } from '@/store/prices/pricesAdapter'
import { BaseRootState } from '@/store/store'

export const { selectAll: selectAllPrices, selectById: selectPriceById } =
  tokenPricesAdapter.getSelectors<BaseRootState>((state) => state.tokenPrices)

export const selectAlphPrice = createSelector(
  (state: BaseRootState) => state,
  (state) => selectPriceById(state, ALPH.symbol)?.price
)

export const { selectAll: selectAllPricesHistories, selectById: selectPriceHistoryById } =
  tokenPricesHistoryAdapter.getSelectors<BaseRootState>((state) => state.tokenPricesHistory)

export const selectAlphPriceHistory = createSelector(
  (state: BaseRootState) => state,
  (state) => selectPriceHistoryById(state, ALPH.symbol)?.history
)