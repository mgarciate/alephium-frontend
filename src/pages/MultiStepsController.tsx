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

import React from 'react'
import { useHistory, useParams } from 'react-router'

interface RouteParams {
  step: string | undefined
}

interface StepsContext {
  onButtonNext: () => void
  onButtonBack: () => void
}
const initialContext: StepsContext = {
  onButtonNext: () => null,
  onButtonBack: () => null
}

export const StepsContext = React.createContext<StepsContext>(initialContext)

// ============== //
/* MAIN COMPONENT */
// ============== //

const MultiStepsController = ({ stepElements, baseUrl }: { stepElements: JSX.Element[]; baseUrl: string }) => {
  const history = useHistory()
  const { step } = useParams<RouteParams>()

  const onButtonNext = () => {
    window.scrollTo(0, 0)
    history.push(`/${baseUrl}/${stepNumber + 1}`)
  }
  const onButtonBack = () => {
    window.scrollTo(0, 0)
    if (stepNumber === 0) {
      history.push('/')
    } else {
      history.push(`${stepNumber - 1}`)
    }
  }

  // Steps management
  const stepNumber = step ? parseInt(step) : 0

  // Redirect if step not set properly
  if (stepNumber > stepElements.length) {
    history.replace(`/${baseUrl}/${stepElements.length - 1}`)
  }

  const isStepNumberCorrect = () => {
    return stepNumber >= 0 && stepNumber < stepElements.length
  }

  return (
    <StepsContext.Provider value={{ onButtonNext, onButtonBack }}>
      {isStepNumberCorrect() && stepElements[stepNumber]}
    </StepsContext.Provider>
  )
}

export default MultiStepsController