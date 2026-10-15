import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

let routeHistory = []
let routeHistoryIndex = -1

const routePath = location => `${location.pathname}${location.search}${location.hash}`

const recordRoute = (location, navigationType) => {
    const entry = { key: location.key, path: routePath(location) }

    if (navigationType === 'POP') {
        const previousIndex = routeHistory.findIndex(route => route.key === entry.key)
        if (previousIndex >= 0) {
            routeHistoryIndex = previousIndex
        } else {
            routeHistory = [entry]
            routeHistoryIndex = 0
        }
        return
    }

    if (navigationType === 'REPLACE' && routeHistoryIndex >= 0) {
        routeHistory[routeHistoryIndex] = entry
        return
    }

    if (routeHistory[routeHistoryIndex]?.key === entry.key) return
    routeHistory = routeHistory.slice(0, routeHistoryIndex + 1)
    routeHistory.push(entry)
    routeHistoryIndex = routeHistory.length - 1
}

export const AppRouteHistory = () => {
    const location = useLocation()
    const navigationType = useNavigationType()

    useEffect(() => {
        recordRoute(location, navigationType)
    }, [location, navigationType])

    return null
}

export const useAppBack = fallbackPath => {
    const navigate = useNavigate()

    return useCallback(() => {
        const currentPath = routeHistory[routeHistoryIndex]?.path
        let destinationIndex = routeHistoryIndex - 1

        while (destinationIndex >= 0 && routeHistory[destinationIndex].path === currentPath) {
            destinationIndex -= 1
        }

        if (destinationIndex < 0) {
            navigate(fallbackPath, { replace: true })
            return
        }

        navigate(destinationIndex - routeHistoryIndex)
    }, [fallbackPath, navigate])
}
