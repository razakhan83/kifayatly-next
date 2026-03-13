import EditProductClient from './EditProductClient';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
    const { id } = await params;
    return <EditProductClient id={id} />;
}
