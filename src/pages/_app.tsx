import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {MenuConetent, Linked, } from '../styles/Styles'
import { PropsWithChildren } from 'react'

const Navbar = () => {
  return (
    <MenuConetent>
      <Linked href="/home">Home</Linked>
      <Linked href="/">lol</Linked>
      <Linked href="/contact">Contact</Linked>
    </MenuConetent>
  )
}
export function Layout({ children }:PropsWithChildren) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
export default function App({ Component, pageProps }: AppProps) {
  return  <Layout>
  <Component {...pageProps} />
</Layout>
}
