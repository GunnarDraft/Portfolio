import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { MenuConetent, Linked, ContentNavbar } from '../styles/Styles'
import { PropsWithChildren } from 'react'

const Navbar = () => {
  return (
    <ContentNavbar>
      <MenuConetent>
        <Linked href="/home">Home</Linked>
        <Linked href="projects">Projects</Linked>
        <Linked href="/about">About</Linked>
        <Linked href="/periodictable">Periodic Table</Linked>
        <Linked href="/">lol</Linked>
      </MenuConetent>
    </ContentNavbar>
  )
}
export function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
export default function App({ Component, pageProps }: AppProps) {
  return <Layout>
    <Component {...pageProps} />
  </Layout>
}
