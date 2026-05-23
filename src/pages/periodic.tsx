import Head from 'next/head'
import React from 'react'
import PeriodicTableComponent from '../componets/periodictable'
import { WarningBox, Typo, Typo2 } from '@/styles/Styles'
import styled from 'styled-components'

const PageContainer = styled.div`
    width: 100%;
    height: 100vh;
    position: relative;
`

const WarningContainer = styled.div`
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
    max-width: 90vw;
`

export default function PeriodicPage() {
    return (
        <>
            <Head>
                <title>Periodic Table - Quantum Visualization</title>
                <meta name="description" content="Interactive periodic table with quantum orbital visualization" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <PageContainer>
                <PeriodicTableComponent />
                <WarningContainer>
                    <WarningBox>
                        <Typo>⚠ Warning!</Typo>
                        <Typo2>This visualization contains animated elements that may cause visual discomfort for some viewers.</Typo2>
                    </WarningBox>
                </WarningContainer>
            </PageContainer>
        </>
    )
}
