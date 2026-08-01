import { useEffect, useState } from 'react';
import { makeStyles, Card } from '@fluentui/react-components';
import DocumentsPageHeader from './DocumentsPageHeader';
import DocumentsTable from './DocumentsTable';
import { DocumentsFilters } from './DocumentsFilters';

export const DocumentsPage = () => {
    const styles = useStyles();
    const [loading, setLoading] = useState<boolean>(false);

    const [documents, setDocuments] = useState<DocumentItem[]>([]);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);

        if (!loading){
            const response = await fetch('/api/documents', {
                method: 'GET',
                headers: {
                    'X-Tenant-Id': 'branch-demo',

                },
            });

            const data: DocumentItem[] = await response.json();

            setDocuments(data);
        }
        setLoading(false);
    }

    return (
      <>
        <div className={styles.page}>
            <DocumentsPageHeader />
            <div className={styles.mainContainer}>
                <div className={styles.sidebar}>
                    Sidebar
                </div>
                <main className={styles.body}>
                    <Card>
                        <DocumentsFilters />

                        <DocumentsTable
                          documents={documents}
                          onRowClick={() => {}} />
                    </Card>
                </main>
            </div>
        </div>
      </>
    )
}

const useStyles = makeStyles({
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
        sidebar: {
        width: '150px',
        padding: '15px'
    },
    mainContainer: {
        display: 'flex',
    },
    body: {
        background: '#F3F3F3',
        flex: '1',
        padding: '20px',
    },
});