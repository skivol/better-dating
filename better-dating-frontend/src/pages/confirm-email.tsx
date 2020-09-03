import dynamic from 'next/dynamic'

const ConfirmEmailWithoutSsr = dynamic(
    () => import('../components/ConfirmEmail'),
    { ssr: false }
)

export default ConfirmEmailWithoutSsr;
