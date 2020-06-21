import dynamic from 'next/dynamic'

const ConfirmEmailWithoutSsr = dynamic(
    () => import('../containers/ConfirmEmail'),
    { ssr: false }
)

export default ConfirmEmailWithoutSsr;
