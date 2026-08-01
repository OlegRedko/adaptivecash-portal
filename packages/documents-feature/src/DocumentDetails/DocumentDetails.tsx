import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Text,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import type { DocumentSummary } from '@adaptivecash/api-client';
import { DocumentDetailsBody } from './DocumentDetailsBody';

type Props = {
  document: DocumentSummary | undefined;
  open: boolean;
  onClose: () => void;
};

export const DocumentDetails = ({ document, open, onClose }: Props) => {
  return (
    <OverlayDrawer
      as="aside" position="end" size="medium"
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          {document?.title ?? 'Document'}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody>
        {document ? (
          <DocumentDetailsBody document={document} onClose={onClose} />
        ) : (
          <Text>This document is not in the current list.</Text>
        )}
      </DrawerBody>
    </OverlayDrawer>
  );
};
