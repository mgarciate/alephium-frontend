// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.
import { FC } from 'react'
import JSBI from 'jsbi'
import { abbreviateAmount } from '../utils/amounts'

interface AmountProps {
  value: JSBI | undefined
  className?: string
  showFullPrecision?: boolean
}

const Amount: FC<AmountProps> = ({ value, className, showFullPrecision = false }) => {
  if (value !== undefined) {
    return <span className={className}>{abbreviateAmount(value, showFullPrecision).toString()} א</span>
  } else {
    return <span className={className}>- א</span>
  }
}

export default Amount
