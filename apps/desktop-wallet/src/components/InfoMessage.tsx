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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { MouseEvent } from 'react'
import styled, { css } from 'styled-components'

import { fadeOutFast } from '@/animations'
import { openInWebBrowser } from '@/utils/misc'

interface InfoMessageProps {
  link?: string
  onClose?: () => void
  className?: string
}

const InfoMessage: FC<InfoMessageProps> = ({ link, onClose, className, children }) => {
  const handleClick = () => link && openInWebBrowser(link)

  const handleClose = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onClose && onClose()
  }

  return (
    <motion.div className={className} onClick={handleClick} {...fadeOutFast}>
      <InfoIcon size={27} />

      <div>{children}</div>

      {onClose && (
        <CloseButton onClick={handleClose}>
          <X size={20} />
        </CloseButton>
      )}
    </motion.div>
  )
}

export default styled(InfoMessage)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;

  padding: var(--spacing-3) var(--spacing-7) var(--spacing-3) var(--spacing-4);
  max-width: 306px;

  border: 1px solid ${({ theme }) => colord(theme.bg.accent).alpha(0.15).toHex()};
  background-color: ${({ theme }) => colord(theme.bg.accent).alpha(0.05).toHex()};
  color: ${({ theme }) => theme.global.accent};

  line-height: 20px;

  border-radius: var(--radius-big);

  ${({ link }) =>
    link &&
    css`
      cursor: pointer;

      &:hover {
        background-color: ${({ theme }) => theme.bg.accent};
      }
    `}
`

const InfoIcon = styled(Info)`
  display: flex;
  flex-shrink: 0;
`

const CloseButton = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  padding: 6px;
  cursor: pointer;
`
