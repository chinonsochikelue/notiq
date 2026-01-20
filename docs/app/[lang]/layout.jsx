
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import '../../styles/globals.css'

export const metadata = {
    title: 'Notiq Documentation'
}

export async function generateStaticParams() {
    return [
        { lang: 'en' },
        { lang: 'es' },
        { lang: 'zh' },
        { lang: 'ig' }
    ]
}

const banner = <Banner storageKey="some-key">Notiq 1.0.7 is released!</Banner>
const navbar = (
    <Navbar
        logo={<b>Notiq</b>}
    />
)
const footer = <Footer>MIT {new Date().getFullYear()} © Notiq.</Footer>

export default async function LangLayout(props) {
    const { lang } = await props.params
    const pageMap = await getPageMap()
    return (
        <Layout
            banner={banner}
            navbar={navbar}
            pageMap={pageMap}
            docsRepositoryBase="https://github.com/chinonsochikelue/notiq/tree/main/docs"
            footer={footer}
        >
            {props.children}
        </Layout>
    )
}
