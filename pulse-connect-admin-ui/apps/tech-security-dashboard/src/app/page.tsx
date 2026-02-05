'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Badge, Alert, LoadingSpinner } from '@pulsco/admin-ui-core'

interface SecurityMetrics {
  threatLevel: string
  activeIncidents: number
  vulnerabilityCount: number
  patchCompliance: number
  securityScore: number
  failedLogins: number
}

interface SecurityAlert {
  id: string
