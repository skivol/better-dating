import dynamic from 'next/dynamic'

const ProfileViewWithoutSsr = dynamic(
    () => import('../components/ProfileView'),
    { ssr: false }
)

export default ProfileViewWithoutSsr;
