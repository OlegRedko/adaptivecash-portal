import { makeStyles, Text } from '@fluentui/react-components';

const DocumentsPageHeader = () => {
    const styles = useStyles();

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Text weight="bold" color={''}>
                    Adaptive Cache
                </Text>
            </div>
            <div>
                <Text>
                    Documents
                </Text>
            </div>
            <div className={styles.userDetails}>
                Olivia Signer
            </div>
        </header>
    )
}

const useStyles = makeStyles({
    header: {
        display: 'flex',
        height: '70px'
    },
    logo: {
        border: '1px solid black',
        padding: '15px 10px'
    },
    sidebar: {
        width: '150px',
        padding: '15px'
    },
    userDetails: {
        marginLeft: 'auto',
    }
});

export default DocumentsPageHeader;