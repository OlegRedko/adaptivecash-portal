import { makeStyles, Card } from '@fluentui/react-components';
import DocumentsPageHeader from './DocumentsPageHeader';
import DocumentsTable from './DocumentsTable';
import { DocumentsFilters } from './DocumentsFilters';

export const DocumentsPage = () => {
    const styles = useStyles();

    return (
        <div className={styles.page}>
            <DocumentsPageHeader />
            <div className={styles.mainContainer}>
                <div className={styles.sidebar}>
                    Sidebar
                </div>
                <main className={styles.body}>
                    <Card>
                        <DocumentsFilters />
                        <DocumentsTable />
                    </Card>
                </main>
            </div>
        </div>
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