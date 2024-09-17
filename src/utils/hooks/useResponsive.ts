import { useEffect, useState } from 'react'
import { theme } from 'twin.macro'

const twBreakpoint = theme<{
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
}>`screens`

const breakpointInt = (str = '') => {
    return parseInt(str.replace('px', ''))
}

const breakpoint = {
    '2xl': breakpointInt(twBreakpoint['2xl']), 
    xl: breakpointInt(twBreakpoint.xl),
    lg: breakpointInt(twBreakpoint.lg),
    md: breakpointInt(twBreakpoint.md),
    sm: breakpointInt(twBreakpoint.sm),
    xs: breakpointInt(twBreakpoint.xs),
}

const useResponsive = () => {
    const getAllSizes = (comparator = 'smaller') => {
        const currentWindowWidth = window.innerWidth
        return Object.fromEntries(
            Object.entries(breakpoint).map(([key, value]) => [
                key,
                comparator === 'larger'
                    ? currentWindowWidth > value
                    : currentWindowWidth < value,
            ])
        )
    }

    const getResponsiveState = () => {
        const currentWindowWidth = window.innerWidth
        return {
            windowWidth: currentWindowWidth,
            larger: getAllSizes('larger'),
            smaller: getAllSizes('smaller'),
        }
    }

    const [responsive, setResponsive] = useState(getResponsiveState())

    const resizeHandler = () => {
        const responsiveState = getResponsiveState()
        setResponsive(responsiveState)
    }

    useEffect(() => {
        window.addEventListener('resize', resizeHandler)
        return () => window.removeEventListener('resize', resizeHandler)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [responsive.windowWidth])

    return responsive
}

export default useResponsive
