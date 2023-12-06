/*
Copyright 2018 - 2023 The Alephium Authors
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseQueryOptions } from '@tanstack/react-query'

// TODO: Trying to import the enum value from the explorer api doesn't work
export const POST_QUERY_LIMIT = 80
export const PAGINATION_PAGE_LIMIT = 100

type QueryFn = (...args: any[]) => UseQueryOptions

interface Queries {
  [key: string]: QueryFn
}

type QueriesCollection<T> = {
  [P in keyof T]: T[P]
}

export const createQueriesCollection = <T extends Record<string, Queries>>(collection: T): QueriesCollection<T> =>
  collection

export const browsePages = async <T>(
  callback: (arg: T, options: { limit: number; page: number }) => Promise<any>,
  callbackFirstArg: T,
  pageLimit: number
): Promise<any[]> => {
  let pageTotalResults
  let page = 1

  const results = []

  while (pageTotalResults === undefined || pageTotalResults === pageLimit) {
    const pageResults = await callback(callbackFirstArg, { limit: pageLimit, page })

    results.push(...pageResults)

    pageTotalResults = pageResults.length
    page += 1
  }

  return results
}
