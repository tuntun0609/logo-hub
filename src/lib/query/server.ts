import { cache } from 'react'
import { makeQueryClient } from './client'

/** Per-request QueryClient for RSC prefetch (React cache). */
export const getQueryClient = cache(makeQueryClient)
