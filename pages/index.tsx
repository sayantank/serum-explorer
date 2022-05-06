import type { NextPage } from 'next'
import { ReactNode } from 'react'
import { getLayout } from '../components/layouts/SiteLayout'

const Home = () => {
  return (
    <h1 className="text-2xl">hello</h1>
  )
}

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home
