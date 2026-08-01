import { makeStyles, tokens } from '@fluentui/react-components';

export const DocumentsPage = () => {
    return (
        <div>
            Documents
        </div>
    )
}

const useStyles = makeStyles({
    page: {
        display: 'grid',
        gap: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalXXL
    },
    toolbar: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        flexWrap: 'wrap'
    },
});