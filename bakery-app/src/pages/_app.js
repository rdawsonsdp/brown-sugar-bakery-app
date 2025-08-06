import '../styles/globals.css'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  
  // Pages that don't need the layout (if any)
  const noLayoutPages = ['/login', '/signup']
  const needsLayout = !noLayoutPages.includes(router.pathname)
  
  if (needsLayout) {
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    )
  }
  
  return <Component {...pageProps} />
}