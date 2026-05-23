import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { MenuConetent, Linked, ContentNavbar } from '../styles/Styles'
import { PropsWithChildren } from 'react'
import { Analytics } from '@vercel/analytics/react';

const Navbar = () => {
  return (
    <ContentNavbar>
      <MenuConetent>
        <Linked href="/">About</Linked>
        <Linked href="/periodic">Periodic Table</Linked>
        <Linked href="/projects">Projects</Linked>
      </MenuConetent>
    </ContentNavbar>
  )
}
export function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Analytics />
    </>
  )
}
export default function App({ Component, pageProps }: AppProps) {
  return <Layout>
    <Component {...pageProps} />
  </Layout>
}
